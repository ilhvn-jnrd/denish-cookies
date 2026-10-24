<?php

namespace App\Services;

use App\Models\Order;
use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class MidtransService
{
    protected string $merchantId;
    protected string $serverKey;
    protected string $clientKey;
    protected bool $isProduction;
    protected string $snapApiUrl;
    protected string $coreApiUrl;

    public function __construct()
    {
        $this->merchantId = config('midtrans.merchant_id', config('services.midtrans.merchant_id', env('MIDTRANS_MERCHANT_ID', 'M004762091')));
        $this->serverKey = config('midtrans.server_key', config('services.midtrans.server_key', env('MIDTRANS_SERVER_KEY', '')));
        $this->clientKey = config('midtrans.client_key', config('services.midtrans.client_key', env('MIDTRANS_CLIENT_KEY', 'Mid-client-t-YHIi4kIXebf6cF')));
        $explicitIsProduction = config('midtrans.is_production', config('services.midtrans.is_production', env('MIDTRANS_IS_PRODUCTION', true)));

        // Smart auto-detection: if explicit, or if serverKey/clientKey starts with Mid- (and not SB-), it is Production
        if ($explicitIsProduction !== null && $explicitIsProduction !== '') {
            $this->isProduction = filter_var($explicitIsProduction, FILTER_VALIDATE_BOOLEAN);
        } else {
            $this->isProduction = !str_starts_with($this->clientKey, 'SB-') && str_starts_with($this->clientKey, 'Mid-');
        }

        $this->snapApiUrl = $this->isProduction
            ? 'https://app.midtrans.com/snap/v1/transactions'
            : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

        $this->coreApiUrl = $this->isProduction
            ? 'https://api.midtrans.com/v2'
            : 'https://api.sandbox.midtrans.com/v2';
    }

    public function isMockMode(): bool
    {
        // Production environment MUST NEVER run in mock mode
        if (app()->environment('production') || $this->isProduction) {
            return false;
        }

        return empty($this->serverKey) || $this->serverKey === 'sandbox-mock' || str_contains($this->serverKey, 'mock');
    }

    public function getMerchantId(): string
    {
        return $this->merchantId;
    }

    public function getClientKey(): string
    {
        return $this->clientKey;
    }

    public function getServerKey(): string
    {
        return $this->serverKey;
    }

    public function isProduction(): bool
    {
        return $this->isProduction;
    }

    public function getSnapApiUrl(): string
    {
        return $this->snapApiUrl;
    }

    public function getCoreApiUrl(): string
    {
        return $this->coreApiUrl;
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
                    'postal_code' => $order->shipping_postal_code ?? '40291',
                    'country_code' => 'IDN',
                ],
            ],
            'item_details' => $itemDetails,
            'expiry' => [
                'start_time' => date('Y-m-d H:i:s O'),
                'unit' => 'hour',
                'duration' => 24,
            ],
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
                    'client_key' => $this->clientKey,
                    'is_production' => $this->isProduction,
                    'snap_url' => $this->isProduction ? 'https://app.midtrans.com/snap/snap.js' : 'https://app.sandbox.midtrans.com/snap/snap.js',
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
     * Handles Split Fee where gross_amount may include customer MDR fee.
     */
    public function verifySignature(string $orderId, string $statusCode, string $grossAmount, string $signatureKey, ?string $orderGrossAmount = null): bool
    {
        // 1. Primary check: SHA512(order_id + status_code + gross_amount + server_key) using webhook gross_amount
        $expectedSignature = hash('sha512', $orderId . $statusCode . $grossAmount . $this->serverKey);

        if (hash_equals($expectedSignature, $signatureKey)) {
            return true;
        }

        // 2. Format fallback: handle integer string vs decimal (.00)
        $altGross = str_contains($grossAmount, '.')
            ? rtrim(rtrim($grossAmount, '0'), '.')
            : number_format((float) $grossAmount, 2, '.', '');
        if (hash_equals(hash('sha512', $orderId . $statusCode . $altGross . $this->serverKey), $signatureKey)) {
            return true;
        }

        // 3. Fallback: check if Midtrans signed using order's base gross amount
        if ($orderGrossAmount !== null && $orderGrossAmount !== '') {
            $baseGrossInt = (string) (int) round((float) $orderGrossAmount);
            $baseGrossDec = number_format((float) $orderGrossAmount, 2, '.', '');
            if (hash_equals(hash('sha512', $orderId . $statusCode . $baseGrossInt . $this->serverKey), $signatureKey) ||
                hash_equals(hash('sha512', $orderId . $statusCode . $baseGrossDec . $this->serverKey), $signatureKey)) {
                return true;
            }
        }

        // Allow mock bypass only in non-production when explicitly using sandbox mock token
        if (!app()->environment('production') && $this->isMockMode() && in_array($signatureKey, ['mock-bypass', 'sandbox-mock-signature'], true)) {
            return true;
        }

        return false;
    }

    /**
     * Get transaction status from Midtrans Core API (v2).
     * Production: https://api.midtrans.com/v2/{order_id}/status
     * Sandbox:    https://api.sandbox.midtrans.com/v2/{order_id}/status
     */
    public function getTransactionStatus(string $orderId): array
    {
        if ($this->isMockMode()) {
            return [
                'status_code' => '200',
                'transaction_status' => 'settlement',
                'order_id' => $orderId,
            ];
        }

        $url = "{$this->coreApiUrl}/{$orderId}/status";

        try {
            $response = Http::withBasicAuth($this->serverKey, '')
                ->withHeaders([
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                ])
                ->get($url);

            return $response->json() ?? [];
        } catch (Exception $e) {
            Log::error("Failed to query Midtrans transaction status for {$orderId}: " . $e->getMessage());
            return [];
        }
    }
}
