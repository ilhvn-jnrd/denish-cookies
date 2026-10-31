<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Order;
use App\Models\PaxelRate;
use App\Models\Product;
use App\Models\ShippingSetting;
use App\Models\StockMovement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

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
            $allowedCouriers = ['gojek_instant', 'gojek_sameday', 'paxel', 'pickup', 'self_pickup'];
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
     * Update Order status with Strict Order State Machine & Auto-Ship on Tracking Number.
     */
    public function updateOrderStatus(Request $request, int $id): JsonResponse
    {
        $order = Order::findOrFail($id);

        $validated = $request->validate([
            'order_status' => 'required|in:pending,paid,processing,shipped,completed,cancelled',
            'tracking_number' => 'nullable|string|max:100',
        ]);

        // 1. Lock final states: completed or cancelled cannot be modified further
        if (in_array($order->order_status, ['completed', 'cancelled'], true)) {
            return response()->json([
                'message' => "Status pesanan sudah final ({$order->order_status}) dan tidak dapat diubah lagi.",
            ], 422);
        }

        $targetStatus = $validated['order_status'];
        $trackingNumber = array_key_exists('tracking_number', $validated)
            ? trim((string) ($validated['tracking_number'] ?? ''))
            : trim((string) ($order->tracking_number ?? ''));

        // 2. Paid orders cannot be reverted to pending or cancelled
        if ($order->payment_status === 'paid' && in_array($targetStatus, ['pending', 'cancelled'], true)) {
            return response()->json([
                'message' => 'Pesanan yang sudah lunas tidak dapat dibatalkan atau dikembalikan ke status menunggu pembayaran.',
            ], 422);
        }

        // 3. Auto-Ship when tracking_number is filled while order is still 'paid' or 'processing'
        if ($trackingNumber !== '' && in_array($targetStatus, ['paid', 'processing'], true)) {
            $targetStatus = 'shipped';
        }

        $updateData = ['order_status' => $targetStatus];

        if (array_key_exists('tracking_number', $validated)) {
            $updateData['tracking_number'] = $trackingNumber !== '' ? $trackingNumber : null;
        }

        if ($targetStatus === 'shipped' && !$order->shipped_at) {
            $updateData['shipped_at'] = Carbon::now();
        }

        if ($targetStatus === 'completed' && !$order->completed_at) {
            $updateData['completed_at'] = Carbon::now();
        }

        $order->update($updateData);

        return response()->json([
            'message' => $targetStatus === 'shipped' && $trackingNumber !== ''
                ? 'Nomor resi berhasil disimpan & status pesanan otomatis diubah menjadi Sedang Dikirim!'
                : 'Status pesanan berhasil diperbarui',
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

        if ($request->boolean('all')) {
            $allProducts = $query->orderBy('id', 'asc')->get();
            return response()->json(['data' => $allProducts]);
        }

        $products = $query->orderBy('id', 'desc')->paginate(50);

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

    /**
     * List Stock Movements & Offline Sales / Opname History with summary KPIs, search, and pagination.
     */
    public function stockMovements(Request $request): JsonResponse
    {
        $applyFilters = function ($q) use ($request) {
            // Filter by product_id
            if ($request->filled('product_id') && $request->product_id !== 'all') {
                $q->where('product_id', (int) $request->product_id);
            }

            // Filter by date or date range
            if ($request->filled('date')) {
                $q->whereDate('created_at', $request->date);
            } else {
                if ($request->filled('start_date')) {
                    $q->whereDate('created_at', '>=', $request->start_date);
                }
                if ($request->filled('end_date')) {
                    $q->whereDate('created_at', '<=', $request->end_date);
                }
            }

            // Search by notes (e.g. #DC-...) or product name
            if ($request->filled('search')) {
                $search = str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], trim((string) $request->search));
                if ($search !== '') {
                    $q->where(function ($sub) use ($search) {
                        $sub->where('notes', 'LIKE', "%{$search}%")
                            ->orWhereHas('product', function ($prodQuery) use ($search) {
                                $prodQuery->where('name', 'LIKE', "%{$search}%");
                            });
                    });
                }
            }
        };

        $query = StockMovement::with([
            'product:id,name,price,stock,weight_grams,image_url',
            'creator:id,name',
        ]);

        $applyFilters($query);

        // Filter by movement type on main table query
        if ($request->filled('type') && $request->type !== 'all') {
            $allowedTypes = ['in_production', 'out_offline', 'out_online', 'opname_adjustment', 'damaged'];
            if (in_array($request->type, $allowedTypes, true)) {
                $query->where('type', $request->type);
            }
        }

        // Summary calculations based on matching date/product/search scope
        $summaryScope = StockMovement::query();
        $applyFilters($summaryScope);

        $totalOfflineJars = (int) abs((int) (clone $summaryScope)->where('type', 'out_offline')->sum('quantity_change'));
        $totalOfflineRevenue = (float) (clone $summaryScope)->where('type', 'out_offline')->sum('offline_revenue');
        $totalProductionInJars = (int) (clone $summaryScope)->where('type', 'in_production')->sum('quantity_change');
        $totalDamagedJars = (int) abs((int) (clone $summaryScope)->where('type', 'damaged')->sum('quantity_change'));
        $totalOnlineJars = (int) abs((int) (clone $summaryScope)->where('type', 'out_online')->sum('quantity_change'));

        $perPage = (int) $request->input('per_page', 15);
        if (!in_array($perPage, [10, 15, 25, 50, 100], true)) {
            $perPage = 15;
        }

        $movements = $query->orderBy('id', 'desc')->paginate($perPage);

        $response = $movements->toArray();
        $response['summary'] = [
            'total_offline_jars' => $totalOfflineJars,
            'total_offline_revenue' => $totalOfflineRevenue,
            'total_production_in_jars' => $totalProductionInJars,
            'total_damaged_jars' => $totalDamagedJars,
            'total_online_jars' => $totalOnlineJars,
        ];

        return response()->json($response);
    }

    /**
     * Record a quick single-product stock movement (in_production, out_offline, damaged).
     * Uses DB::transaction and lockForUpdate() for atomic stock consistency.
     */
    public function storeStockMovement(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'type' => 'required|in:in_production,out_offline,damaged,opname_adjustment',
            'quantity' => 'required|integer|min:1',
            'offline_revenue' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:500',
        ]);

        $admin = $request->user('sanctum');

        $result = DB::transaction(function () use ($validated, $admin) {
            $product = Product::lockForUpdate()->findOrFail($validated['product_id']);
            $stockBefore = (int) $product->stock;
            $qty = abs((int) $validated['quantity']);
            $type = $validated['type'];

            if ($type === 'in_production') {
                $quantityChange = $qty;
            } else {
                // out_offline or damaged deducts stock
                if ($stockBefore < $qty) {
                    throw ValidationException::withMessages([
                        'quantity' => ["Stok {$product->name} saat ini ({$stockBefore} toples) tidak mencukupi untuk dikurangi {$qty} toples."],
                    ]);
                }
                $quantityChange = -$qty;
            }

            $stockAfter = max(0, $stockBefore + $quantityChange);

            // Offline revenue calculation
            $offlineRevenue = 0;
            if ($type === 'out_offline') {
                if (array_key_exists('offline_revenue', $validated) && $validated['offline_revenue'] !== null && $validated['offline_revenue'] !== '') {
                    $offlineRevenue = (float) $validated['offline_revenue'];
                } else {
                    $offlineRevenue = (float) ($qty * $product->price);
                }
            }

            $product->update([
                'stock' => $stockAfter,
            ]);

            $movement = StockMovement::create([
                'product_id' => $product->id,
                'type' => $type,
                'stock_before' => $stockBefore,
                'quantity_change' => $quantityChange,
                'stock_after' => $stockAfter,
                'offline_revenue' => $offlineRevenue,
                'notes' => $validated['notes'] ?? null,
                'created_by' => $admin?->id,
            ]);

            return [
                'movement' => $movement->load(['product:id,name,price,stock,weight_grams,image_url', 'creator:id,name']),
                'product' => $product->fresh(),
            ];
        });

        return response()->json([
            'message' => 'Mutasi stok berhasil dicatat dan stok produk telah diperbarui.',
            'data' => $result['movement'],
            'product' => $result['product'],
        ], 201);
    }

    /**
     * Bulk Stock Opname (Physical Rack Count Synchronization).
     * Receives array of [{ product_id, actual_stock, notes }] and updates all changed products atomically.
     */
    public function bulkStockOpname(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.actual_stock' => 'required|integer|min:0',
            'items.*.notes' => 'nullable|string|max:500',
            'global_notes' => 'nullable|string|max:500',
        ]);

        $admin = $request->user('sanctum');

        $result = DB::transaction(function () use ($validated, $admin) {
            $updatedMovements = [];
            $globalNotes = trim((string) ($validated['global_notes'] ?? ''));

            foreach ($validated['items'] as $item) {
                $product = Product::lockForUpdate()->find($item['product_id']);
                if (!$product) {
                    continue;
                }

                $stockBefore = (int) $product->stock;
                $actualStock = (int) $item['actual_stock'];

                if ($actualStock !== $stockBefore) {
                    $quantityChange = $actualStock - $stockBefore;
                    $itemNote = trim((string) ($item['notes'] ?? ''));
                    $finalNote = $itemNote ?: ($globalNotes ?: 'Penyesuaian Stock Opname Fisik');

                    $product->update([
                        'stock' => $actualStock,
                    ]);

                    $movement = StockMovement::create([
                        'product_id' => $product->id,
                        'type' => 'opname_adjustment',
                        'stock_before' => $stockBefore,
                        'quantity_change' => $quantityChange,
                        'stock_after' => $actualStock,
                        'offline_revenue' => 0,
                        'notes' => $finalNote,
                        'created_by' => $admin?->id,
                    ]);

                    $updatedMovements[] = $movement->load(['product:id,name,price,stock,weight_grams,image_url', 'creator:id,name']);
                }
            }

            return $updatedMovements;
        });

        $count = count($result);

        return response()->json([
            'message' => $count > 0
                ? "Stock Opname selesai! {$count} produk berhasil disesuaikan dengan stok fisik rak."
                : 'Tidak ada selisih stok. Seluruh stok sistem sudah sesuai dengan stok fisik rak.',
            'adjusted_count' => $count,
            'movements' => $result,
        ]);
    }
}
