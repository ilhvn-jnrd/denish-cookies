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
     * List Orders for Admin with filters.
     */
    public function orders(Request $request): JsonResponse
    {
        $query = Order::with(['items', 'user']);

        if ($request->filled('status')) {
            $query->where('order_status', $request->status);
        }

        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        if ($request->filled('courier')) {
            $query->where('courier_type', $request->courier);
        }

        if ($request->filled('search')) {
            $search = $request->search;
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
            'tracking_number' => 'nullable|string',
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
            $query->where('name', 'LIKE', "%{$request->search}%");
        }

        $products = $query->orderBy('id', 'desc')->paginate(20);

        return response()->json($products);
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
            'image_url' => 'nullable|string',
            'is_featured' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
        ]);

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
            'image_url' => 'nullable|string',
            'is_featured' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
        ]);

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
        $product->delete();

        return response()->json([
            'message' => 'Produk berhasil dihapus',
        ]);
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
        $validated = $request->validate([
            'store_name' => 'required|string',
            'store_phone' => 'required|string',
            'store_address' => 'required|string',
            'store_city' => 'required|string',
            'store_lat' => 'required|numeric',
            'store_lng' => 'required|numeric',
            'gojek_instant_rate_per_km' => 'required|numeric|min:0',
            'gojek_instant_min_fare' => 'required|numeric|min:0',
            'gojek_sameday_flat_under_15km' => 'required|numeric|min:0',
            'gojek_sameday_flat_over_15km' => 'required|numeric|min:0',
            'max_distance_gojek_km' => 'required|numeric|min:1',
            'road_distance_factor' => 'required|numeric|min:1',
        ]);

        $settings = ShippingSetting::current();
        $settings->update($validated);

        return response()->json([
            'message' => 'Pengaturan pengiriman berhasil disimpan',
            'data' => $settings,
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
