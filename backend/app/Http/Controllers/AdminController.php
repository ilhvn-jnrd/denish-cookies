<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Order;
use App\Models\PaxelRate;
use App\Models\Product;
use App\Models\ShippingSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdminController extends Controller
{
    /**
     * Dashboard KPI & Statistics
     */
    public function dashboard(): JsonResponse
    {
        $currentYear = Carbon::now()->year;
        $currentMonth = Carbon::now()->month;

        $totalRevenue = Order::where('payment_status', 'paid')->sum('gross_amount');
        $monthlyRevenue = Order::where('payment_status', 'paid')
            ->whereYear('paid_at', $currentYear)
            ->whereMonth('paid_at', $currentMonth)
            ->sum('gross_amount');

        $totalOrders = Order::count();
        $annualOrders = Order::whereYear('created_at', $currentYear)->count();
        $monthlyOrders = Order::whereYear('created_at', $currentYear)
            ->whereMonth('created_at', $currentMonth)
            ->count();

        $pendingPaymentOrders = Order::where('payment_status', 'pending')->count();
        $processingOrders = Order::where('order_status', 'processing')->count();
        $shippedOrders = Order::where('order_status', 'shipped')->count();

        // Low stock items (stock <= 5 and not pre-order)
        $lowStockProducts = Product::where('is_preorder', false)
            ->where('stock', '<=', 5)
            ->where('is_active', true)
            ->get(['id', 'name', 'stock', 'price', 'image_url']);

        // Recent orders
        $recentOrders = Order::with('items')
            ->orderBy('id', 'desc')
            ->limit(8)
            ->get();

        return response()->json([
            'stats' => [
                'total_revenue' => (float) $totalRevenue,
                'monthly_revenue' => (float) $monthlyRevenue,
                'total_orders' => $totalOrders,
                'annual_orders' => $annualOrders,
                'monthly_orders' => $monthlyOrders,
                'pending_payment_count' => $pendingPaymentOrders,
                'processing_count' => $processingOrders,
                'shipped_count' => $shippedOrders,
            ],
            'low_stock_products' => $lowStockProducts,
            'recent_orders' => $recentOrders,
        ]);
    }

    /**
     * List Orders for Admin with whitelisted filters.
     */
    public function orders(Request $request): JsonResponse
    {
        $query = Order::with(['items', 'user']);

        // Strictly whitelist order_status values
        if ($request->filled('status')) {
            $allowedStatus = ['pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled'];
            if (in_array($request->status, $allowedStatus, true)) {
                $query->where('order_status', $request->status);
            }
        }

        // Strictly whitelist payment_status values
        if ($request->filled('payment_status')) {
            $allowedPaymentStatus = ['pending', 'paid', 'failed', 'expired', 'cancelled'];
            if (in_array($request->payment_status, $allowedPaymentStatus, true)) {
                $query->where('payment_status', $request->payment_status);
            }
        }

        // Strictly whitelist courier_type values
        if ($request->filled('courier')) {
            $allowedCouriers = ['gojek_instant', 'gojek_sameday', 'paxel'];
            if (in_array($request->courier, $allowedCouriers, true)) {
                $query->where('courier_type', $request->courier);
            }
        }

        // Search with wildcard escaping
        if ($request->filled('search')) {
            $search = str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], (string) $request->search);
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'LIKE', "%{$search}%")
                  ->orWhere('recipient_name', 'LIKE', "%{$search}%")
                  ->orWhere('recipient_phone', 'LIKE', "%{$search}%")
                  ->orWhere('tracking_number', 'LIKE', "%{$search}%");
            });
        }

        $orders = $query->orderBy('id', 'desc')->paginate(15);

        return response()->json($orders);
    }

    /**
     * Update Order status.
     */
    public function updateOrderStatus(Request $request, int $id): JsonResponse
    {
        $order = Order::findOrFail($id);

        $validated = $request->validate([
            'order_status' => 'required|in:pending,paid,processing,shipped,completed,cancelled',
            'tracking_number' => 'nullable|string|max:100',
        ]);

        $updateData = ['order_status' => $validated['order_status']];

        if (array_key_exists('tracking_number', $validated)) {
            $updateData['tracking_number'] = $validated['tracking_number'];
        }

        if ($validated['order_status'] === 'shipped' && !$order->shipped_at) {
            $updateData['shipped_at'] = Carbon::now();
        }

        if ($validated['order_status'] === 'completed' && !$order->completed_at) {
            $updateData['completed_at'] = Carbon::now();
        }

        $order->update($updateData);

        return response()->json([
            'message' => 'Status pesanan berhasil diperbarui',
            'order' => $order->fresh(['items']),
        ]);
    }

    /**
     * Admin Products CRUD.
     */
    public function products(Request $request): JsonResponse
    {
        $query = Product::with('category');

        if ($request->filled('search')) {
            $search = str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], (string) $request->search);
            $query->where('name', 'LIKE', "%{$search}%");
        }

        $products = $query->orderBy('id', 'desc')->paginate(20);

        return response()->json($products);
    }

    /**
     * Secure Photo Upload for Products.
     * Enforces mime-type, max size (3MB), and generates random UUID filename.
     */
    public function uploadProductImage(Request $request): JsonResponse
    {
        $request->validate([
            'image' => [
                'required',
                'file',
                'image',
                'mimes:jpeg,jpg,png,webp',
                'mimetypes:image/jpeg,image/png,image/webp',
                'max:3072',
            ],
        ]);

        $file = $request->file('image');
        $extension = strtolower($file->getClientOriginalExtension());
        if (!in_array($extension, ['jpg', 'jpeg', 'png', 'webp'], true)) {
            $extension = 'jpg';
        }

        $filename = Str::uuid()->toString() . '.' . $extension;
        $path = $file->storeAs('products', $filename, 'public');

        return response()->json([
            'message' => 'Foto produk berhasil diunggah secara aman',
            'url' => '/storage/' . $path,
        ]);
    }

    public function storeProduct(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'weight_grams' => 'required|integer|min:1',
            'stock' => 'required|integer|min:0',
            'is_preorder' => 'required|boolean',
            'po_lead_days' => 'nullable|integer|min:1',
            'image_url' => 'nullable|string|max:500',
            'image' => [
                'nullable',
                'file',
                'image',
                'mimes:jpeg,jpg,png,webp',
                'mimetypes:image/jpeg,image/png,image/webp',
                'max:3072',
            ],
            'is_featured' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
        ]);

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $extension = strtolower($file->getClientOriginalExtension());
            if (!in_array($extension, ['jpg', 'jpeg', 'png', 'webp'], true)) {
                $extension = 'jpg';
            }
            $filename = Str::uuid()->toString() . '.' . $extension;
            $path = $file->storeAs('products', $filename, 'public');
            $validated['image_url'] = '/storage/' . $path;
        }

        unset($validated['image']);

        $validated['slug'] = Str::slug($validated['name']) . '-' . Str::random(4);

        $product = Product::create($validated);

        return response()->json([
            'message' => 'Produk berhasil ditambahkan',
            'data' => $product->load('category'),
        ], 201);
    }

    public function updateProduct(Request $request, int $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'category_id' => 'sometimes|required|exists:categories,id',
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|required|numeric|min:0',
            'weight_grams' => 'sometimes|required|integer|min:1',
            'stock' => 'sometimes|required|integer|min:0',
            'is_preorder' => 'sometimes|required|boolean',
            'po_lead_days' => 'nullable|integer|min:1',
            'image_url' => 'nullable|string|max:500',
            'image' => [
                'nullable',
                'file',
                'image',
                'mimes:jpeg,jpg,png,webp',
                'mimetypes:image/jpeg,image/png,image/webp',
                'max:3072',
            ],
            'is_featured' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
        ]);

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $extension = strtolower($file->getClientOriginalExtension());
            if (!in_array($extension, ['jpg', 'jpeg', 'png', 'webp'], true)) {
                $extension = 'jpg';
            }
            $filename = Str::uuid()->toString() . '.' . $extension;
            $path = $file->storeAs('products', $filename, 'public');

            // Delete old product image if stored locally
            $this->deleteStoredImage($product->image_url);

            $validated['image_url'] = '/storage/' . $path;
        } elseif (array_key_exists('image_url', $validated) && $validated['image_url'] !== $product->image_url) {
            // If image_url was explicitly changed to another URL, delete previous stored photo
            $this->deleteStoredImage($product->image_url);
        }

        unset($validated['image']);

        if (!empty($validated['name']) && $validated['name'] !== $product->name) {
            $validated['slug'] = Str::slug($validated['name']) . '-' . Str::random(4);
        }

        $product->update($validated);

        return response()->json([
            'message' => 'Produk berhasil diperbarui',
            'data' => $product->load('category'),
        ]);
    }

    public function deleteProduct(int $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        // Delete photo from storage if stored locally
        $this->deleteStoredImage($product->image_url);

        $product->delete();

        return response()->json([
            'message' => 'Produk berhasil dihapus',
        ]);
    }

    /**
     * Delete locally uploaded product photo safely.
     */
    protected function deleteStoredImage(?string $imageUrl): void
    {
        if (!$imageUrl) {
            return;
        }

        if (str_starts_with($imageUrl, '/storage/products/')) {
            $relativePath = str_replace('/storage/', '', $imageUrl);
            Storage::disk('public')->delete($relativePath);
        }
    }

    /**
     * Admin Shipping & Rate Settings.
     */
    public function getShippingSettings(): JsonResponse
    {
        $settings = ShippingSetting::current();
        $paxelRates = PaxelRate::orderBy('province')->orderBy('city_name')->get();

        return response()->json([
            'settings' => $settings,
            'paxel_rates' => $paxelRates,
        ]);
    }

    public function updateShippingSettings(Request $request): JsonResponse
    {
        $request->validate([
            'store_name' => 'nullable|string',
            'store_phone' => 'nullable|string',
            'store_address' => 'nullable|string',
            'store_city' => 'nullable|string',
            'store_lat' => 'nullable|numeric',
            'latitude' => 'nullable|numeric',
            'store_lng' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'gojek_instant_rate_per_km' => 'nullable|numeric|min:0',
            'instant_rate_per_km' => 'nullable|numeric|min:0',
            'gojek_instant_min_fare' => 'nullable|numeric|min:0',
            'gojek_sameday_flat_under_15km' => 'nullable|numeric|min:0',
            'gojek_sameday_flat_over_15km' => 'nullable|numeric|min:0',
            'max_distance_gojek_km' => 'nullable|numeric|min:1',
            'road_distance_factor' => 'nullable|numeric|min:1',
        ]);

        $lat = $request->input('store_lat', $request->input('latitude'));
        $lng = $request->input('store_lng', $request->input('longitude'));
        $instantRate = $request->input('gojek_instant_rate_per_km', $request->input('instant_rate_per_km', 4000));

        $data = [
            'store_name' => $request->input('store_name', "De'nish Cookies Kitchen"),
            'store_phone' => $request->input('store_phone', '088218106303'),
            'store_address' => $request->input('store_address', 'Jl. Cibatu Raya No. 55, Kel. Antapani Tengah, Kec. Antapani, Kota Bandung, Jawa Barat'),
            'store_city' => $request->input('store_city', 'Kota Bandung'),
            'store_lat' => (float) ($lat ?? -6.917547878001074),
            'store_lng' => (float) ($lng ?? 107.6634056367421),
            'gojek_instant_rate_per_km' => (float) $instantRate,
            'gojek_instant_min_fare' => (float) $request->input('gojek_instant_min_fare', 15000),
            'gojek_sameday_flat_under_15km' => (float) $request->input('gojek_sameday_flat_under_15km', 18000),
            'gojek_sameday_flat_over_15km' => (float) $request->input('gojek_sameday_flat_over_15km', 25000),
            'max_distance_gojek_km' => (float) $request->input('max_distance_gojek_km', 40),
            'road_distance_factor' => (float) $request->input('road_distance_factor', 1.3),
        ];

        // Ensure record exists or update record #1
        $settings = ShippingSetting::first();
        if ($settings) {
            $settings->update($data);
        } else {
            $settings = ShippingSetting::create($data);
        }

        try {
            Cache::flush();
        } catch (\Throwable $e) {
            // ignore cache flush error if cache driver doesn't support flush
        }

        $fresh = $settings->fresh();

        return response()->json([
            'message' => 'Pengaturan pengiriman berhasil disimpan',
            'data' => $fresh,
            'settings' => $fresh,
        ]);
    }

    public function storePaxelRate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'city_name' => 'required|string',
            'province' => 'required|string',
            'small_rate' => 'required|numeric|min:0',
            'medium_rate' => 'required|numeric|min:0',
            'large_rate' => 'required|numeric|min:0',
            'estimated_days' => 'required|string',
        ]);

        $rate = PaxelRate::create($validated);

        return response()->json([
            'message' => 'Tarif Paxel berhasil ditambahkan',
            'data' => $rate,
        ], 201);
    }

    public function updatePaxelRate(Request $request, int $id): JsonResponse
    {
        $rate = PaxelRate::findOrFail($id);

        $validated = $request->validate([
            'city_name' => 'required|string',
            'province' => 'required|string',
            'small_rate' => 'required|numeric|min:0',
            'medium_rate' => 'required|numeric|min:0',
            'large_rate' => 'required|numeric|min:0',
            'estimated_days' => 'required|string',
        ]);

        $rate->update($validated);

        return response()->json([
            'message' => 'Tarif Paxel berhasil diperbarui',
            'data' => $rate,
        ]);
    }

    public function deletePaxelRate(int $id): JsonResponse
    {
        $rate = PaxelRate::findOrFail($id);
        $rate->delete();

        return response()->json([
            'message' => 'Tarif Paxel berhasil dihapus',
        ]);
    }
}
