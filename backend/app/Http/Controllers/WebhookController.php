<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Services\MidtransService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    protected MidtransService $midtransService;

    public function __construct(MidtransService $midtransService)
    {
        $this->midtransService = $midtransService;
    }

    /**
     * Handle Midtrans Payment Notification Webhook.
     */
    public function midtrans(Request $request): JsonResponse
    {
        $payload = $request->all();
        Log::info('Midtrans Webhook Received: ', $payload);

        $orderId = $payload['order_id'] ?? null;
        $statusCode = $payload['status_code'] ?? null;
        $grossAmount = $payload['gross_amount'] ?? null;
        $signatureKey = $payload['signature_key'] ?? null;
        $transactionStatus = $payload['transaction_status'] ?? null;
        $fraudStatus = $payload['fraud_status'] ?? null;

        if (!$orderId || !$statusCode || !$grossAmount) {
            return response()->json(['message' => 'Invalid webhook payload'], 400);
        }

        // Verify Signature
        if ($signatureKey && !$this->midtransService->verifySignature($orderId, $statusCode, $grossAmount, $signatureKey)) {
            Log::warning("Midtrans Webhook Signature Mismatch for Order: {$orderId}");
            return response()->json(['message' => 'Invalid signature key'], 403);
        }

        $order = Order::with('items')->where('order_number', $orderId)->first();

        if (!$order) {
            Log::warning("Midtrans Webhook Order Not Found: {$orderId}");
            return response()->json(['message' => 'Order not found'], 404);
        }

        // Handle Status
        if ($transactionStatus === 'capture') {
            if ($fraudStatus === 'accept') {
                $this->markOrderAsPaid($order);
            }
        } elseif ($transactionStatus === 'settlement') {
            $this->markOrderAsPaid($order);
        } elseif (in_array($transactionStatus, ['cancel', 'deny', 'expire'])) {
            $order->update([
                'payment_status' => $transactionStatus === 'expire' ? 'expired' : 'cancelled',
                'order_status' => 'cancelled',
            ]);
        } elseif ($transactionStatus === 'pending') {
            $order->update([
                'payment_status' => 'pending',
            ]);
        }

        return response()->json(['status' => 'success']);
    }

    /**
     * Mark order as paid and idempotently deduct stock.
     */
    protected function markOrderAsPaid(Order $order): void
    {
        // Check if already processed to ensure idempotency
        if ($order->payment_status === 'paid') {
            return;
        }

        DB::transaction(function () use ($order) {
            $order->update([
                'payment_status' => 'paid',
                'order_status' => 'paid',
                'paid_at' => Carbon::now(),
            ]);

            // Deduct stock idempotently for ready stock items
            foreach ($order->items as $item) {
                $product = Product::find($item->product_id);
                if ($product && !$item->is_preorder) {
                    $product->decrement('stock', min($product->stock, $item->quantity));
                }
            }
        });

        Log::info("Order {$order->order_number} marked as PAID and stock deducted.");
    }
}
