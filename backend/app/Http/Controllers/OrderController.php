<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Services\MidtransService;
use App\Services\ShippingCalculatorService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    protected MidtransService $midtransService;
    protected ShippingCalculatorService $shippingService;

    public function __construct(MidtransService $midtransService, ShippingCalculatorService $shippingService)
    {
        $this->midtransService = $midtransService;
        $this->shippingService = $shippingService;
    }

    /**
     * Customer Checkout endpoint.
     */
    public function checkout(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'recipient_name' => 'required|string|max:255',
            'recipient_phone' => 'required|string|max:30',
            'shipping_address' => 'required|string',
            'shipping_city' => 'required|string|max:100',
            'shipping_province' => 'required|string|max:100',
            'shipping_postal_code' => 'nullable|string|max:20',
            'shipping_lat' => 'nullable|numeric',
            'shipping_lng' => 'nullable|numeric',
            'courier_type' => 'required|in:gojek_instant,gojek_sameday,paxel',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        $user = $request->user('sanctum');

        $result = DB::transaction(function () use ($validated, $user) {
            $totalWeightGrams = 0;
            $subtotal = 0;
            $itemsData = [];

            // 1. Validate stocks and gather product data
            foreach ($validated['items'] as $itemInput) {
                $product = Product::lockForUpdate()->findOrFail($itemInput['product_id']);

                if (!$product->is_active) {
                    throw ValidationException::withMessages([
                        'items' => ["Produk {$product->name} saat ini sedang tidak aktif."],
                    ]);
                }

                // If ready stock and stock insufficient
                if (!$product->is_preorder && $product->stock < $itemInput['quantity']) {
                    throw ValidationException::withMessages([
                        'items' => ["Stok produk {$product->name} tidak mencukupi (sisa {$product->stock} toples)."],
                    ]);
                }

                $itemSubtotal = $product->price * $itemInput['quantity'];
                $subtotal += $itemSubtotal;
                $itemWeight = $product->weight_grams * $itemInput['quantity'];
                $totalWeightGrams += $itemWeight;

                $itemsData[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_price' => $product->price,
                    'product_weight_grams' => $product->weight_grams,
                    'quantity' => $itemInput['quantity'],
                    'subtotal' => $itemSubtotal,
                    'is_preorder' => $product->is_preorder,
                ];
            }

            // 2. Calculate accurate shipping cost
            $lat = $validated['shipping_lat'] ?? null;
            $lng = $validated['shipping_lng'] ?? null;
            $shippingInfo = $this->shippingService->calculateOptions(
                $lat ? (float)$lat : null,
                $lng ? (float)$lng : null,
                $validated['shipping_city'],
                $totalWeightGrams
            );

            $selectedOption = null;
            foreach ($shippingInfo['options'] as $opt) {
                if ($opt['courier_type'] === $validated['courier_type'] && $opt['is_available']) {
                    $selectedOption = $opt;
                    break;
                }
            }

            if (!$selectedOption) {
                // If requested courier is not available (e.g. weight too high or location too far)
                throw ValidationException::withMessages([
                    'courier_type' => ['Layanan kurir yang dipilih tidak tersedia untuk alamat/berat paket Anda.'],
                ]);
            }

            $shippingCost = $selectedOption['cost'];
            $courierServiceName = $selectedOption['service_name'];
            $distanceKm = $selectedOption['distance_km'] ?? null;
            $boxBreakdown = $selectedOption['box_breakdown'] ?? null;
            $grossAmount = $subtotal + $shippingCost;

            // 3. Generate unique order number
            $today = Carbon::now()->format('Ymd');
            $randomDigits = strtoupper(Str::random(4));
            $orderNumber = "DC-{$today}-{$randomDigits}";

            // 4. Create Order
            $order = Order::create([
                'order_number' => $orderNumber,
                'user_id' => $user?->id,
                'recipient_name' => $validated['recipient_name'],
                'recipient_phone' => $validated['recipient_phone'],
                'shipping_address' => $validated['shipping_address'],
                'shipping_city' => $validated['shipping_city'],
                'shipping_province' => $validated['shipping_province'],
                'shipping_postal_code' => $validated['shipping_postal_code'] ?? null,
                'shipping_lat' => $lat,
                'shipping_lng' => $lng,
                'courier_type' => $validated['courier_type'],
                'courier_service_name' => $courierServiceName,
                'distance_km' => $distanceKm,
                'total_weight_grams' => $totalWeightGrams,
                'box_breakdown' => $boxBreakdown,
                'subtotal' => $subtotal,
                'shipping_cost' => $shippingCost,
                'gross_amount' => $grossAmount,
                'payment_status' => 'pending',
                'order_status' => 'pending',
                'notes' => $validated['notes'] ?? null,
            ]);

            // 5. Create Order Items
            foreach ($itemsData as $item) {
                $order->items()->create($item);
            }

            return $order->load('items');
        });

        // 6. Generate Midtrans Snap Token
        $snapResult = $this->midtransService->createSnapToken($result);

        return response()->json([
            'message' => 'Pesanan berhasil dibuat',
            'order' => $result,
            'snap_token' => $snapResult['token'],
            'redirect_url' => $snapResult['redirect_url'],
            'is_mock' => $snapResult['is_mock'] ?? false,
        ], 201);
    }

    /**
     * Get authenticated customer's orders.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user('sanctum');

        if (!$user) {
            return response()->json(['data' => []]);
        }

        $orders = Order::with('items')
            ->where('user_id', $user->id)
            ->orderBy('id', 'desc')
            ->paginate(15);

        return response()->json($orders);
    }

    /**
     * Get single order details by order_number.
     */
    public function show(string $orderNumber): JsonResponse
    {
        $order = Order::with(['items', 'user'])
            ->where('order_number', $orderNumber)
            ->firstOrFail();

        return response()->json([
            'data' => $order,
        ]);
    }

    /**
     * Local Demo / Mock Payment Simulator.
     * Allows instant testing of payment completion and stock deduction without live gateway.
     */
    public function simulatePayment(string $orderNumber): JsonResponse
    {
        $order = Order::with('items')->where('order_number', $orderNumber)->firstOrFail();

        if ($order->payment_status === 'paid') {
            return response()->json([
                'message' => 'Pesanan sudah berstatus LUNAS.',
                'order' => $order,
            ]);
        }

        DB::transaction(function () use ($order) {
            $order->update([
                'payment_status' => 'paid',
                'order_status' => 'paid',
                'paid_at' => Carbon::now(),
            ]);

            // Deduct stock idempotently
            foreach ($order->items as $item) {
                $product = Product::find($item->product_id);
                if ($product && !$item->is_preorder) {
                    $product->decrement('stock', min($product->stock, $item->quantity));
                }
            }
        });

        return response()->json([
            'message' => 'Simulasi Pembayaran Berhasil! Pesanan telah ditandai Lunas.',
            'order' => $order->fresh(['items']),
        ]);
    }
}
