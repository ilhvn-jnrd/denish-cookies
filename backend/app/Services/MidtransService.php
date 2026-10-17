<?php

namespace App\Services;

use App\Models\Order;
use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class MidtransService
{
    protected string $serverKey;
    protected string $clientKey;
    protected bool $isProduction;
    protected string $snapApiUrl;

    public function __construct()
    {
        $this->serverKey = config('services.midtrans.server_key', env('MIDTRANS_SERVER_KEY', 'sandbox-mock'));
        $this->clientKey = config('services.midtrans.client_key', env('MIDTRANS_CLIENT_KEY', 'SB-Mid-client-mock'));
        $this->isProduction = (bool) config('services.midtrans.is_production', env('MIDTRANS_IS_PRODUCTION', false));

        $this->snapApiUrl = $this->isProduction
            ? 'https://app.midtrans.com/snap/v1/transactions'
            : 'https://app.sandbox.midtrans.com/snap/v1/transactions';
    }

    public function isMockMode(): bool
    {
        // Production environment MUST NEVER run in mock mode
        if (app()->environment('production')) {
            return false;
        }

        return empty($this->serverKey) || $this->serverKey === 'sandbox-mock';
    }

    public function getClientKey(): string
    {
        return $this->clientKey;
    }

    /**
     * Create Snap Token for an Order.
     */
    public function createSnapToken(Order $order): array
    {
        // Check for local mock / demo mode
        if ($this->isMockMode()) {
            $mockToken = 'SNAP-MOCK-' . strtoupper(Str::random(24));
            $order->update(['snap_token' => $mockToken]);

            return [
                'token' => $mockToken,
                'redirect_url' => "#mock-payment/{$order->order_number}",
                'is_mock' => true,
            ];
        }

        // Build item details snapshots
        $itemDetails = [];
        foreach ($order->items as $item) {
            $itemDetails[] = [
                'id' => (string) $item->product_id,
                'price' => (int) round($item->product_price),
                'quantity' => (int) $item->quantity,
                'name' => mb_substr($item->product_name, 0, 45),
            ];
        }

        // Add Shipping cost as line item
        if ($order->shipping_cost > 0) {
            $itemDetails[] = [
                'id' => 'SHIPPING',
                'price' => (int) round($order->shipping_cost),
                'quantity' => 1,
                'name' => mb_substr('Ongkir: ' . $order->courier_service_name, 0, 45),
            ];
        }

        $payload = [
            'transaction_details' => [
                'order_id' => $order->order_number,
                'gross_amount' => (int) round($order->gross_amount),
            ],
            'customer_details' => [
                'first_name' => $order->recipient_name,
                'phone' => $order->recipient_phone,
                'email' => $order->user?->email ?? 'customer@denishcookies.com',
                'shipping_address' => [
                    'first_name' => $order->recipient_name,
                    'phone' => $order->recipient_phone,
                    'address' => $order->shipping_address,
                    'city' => $order->shipping_city,
                    'postal_code' => $order->shipping_postal_code ?? '13430',
                    'country_code' => 'IDN',
                ],
            ],
            'item_details' => $itemDetails,
        ];

        try {
            $response = Http::withBasicAuth($this->serverKey, '')
                ->withHeaders([
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                ])
                ->post($this->snapApiUrl, $payload);

            if ($response->successful()) {
                $data = $response->json();
                $token = $data['token'] ?? null;
                $redirectUrl = $data['redirect_url'] ?? null;

                if ($token) {
                    $order->update(['snap_token' => $token]);
                }

                return [
                    'token' => $token,
                    'redirect_url' => $redirectUrl,
                    'is_mock' => false,
                ];
            }

            Log::error('Midtrans Snap Error: ' . $response->body());
            throw new Exception('Midtrans API error: ' . $response->body());
        } catch (Exception $e) {
            Log::warning('Midtrans request failed: ' . $e->getMessage());

            if (app()->environment('production')) {
                throw new Exception('Gagal memproses transaksi Midtrans di lingkungan produksi: ' . $e->getMessage());
            }

            // Fallback so checkout isn't blocked on localhost/sandbox demo if keys are not live
            $fallbackToken = 'SNAP-FALLBACK-' . strtoupper(Str::random(24));
            $order->update(['snap_token' => $fallbackToken]);

            return [
                'token' => $fallbackToken,
                'redirect_url' => "#mock-payment/{$order->order_number}",
                'is_mock' => true,
                'notice' => 'Midtrans keys invalid/unreachable. Switched to Mock mode.',
            ];
        }
    }

    /**
     * Verify signature key for Midtrans Webhook using timing-safe hash_equals.
     * signature = SHA512(order_id + status_code + gross_amount + server_key)
     */
    public function verifySignature(string $orderId, string $statusCode, string $grossAmount, string $signatureKey): bool
    {
        $expectedSignature = hash('sha512', $orderId . $statusCode . $grossAmount . $this->serverKey);

        if (hash_equals($expectedSignature, $signatureKey)) {
            return true;
        }

        // Allow mock bypass only in non-production when explicitly using sandbox mock token
        if (!app()->environment('production') && $this->isMockMode() && in_array($signatureKey, ['mock-bypass', 'sandbox-mock-signature'], true)) {
            return true;
        }

        return false;
    }
}
