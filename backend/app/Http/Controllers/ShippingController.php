<?php

namespace App\Http\Controllers;

use App\Models\PaxelRate;
use App\Models\Product;
use App\Models\ShippingSetting;
use App\Services\ShippingCalculatorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShippingController extends Controller
{
    protected ShippingCalculatorService $shippingService;

    public function __construct(ShippingCalculatorService $shippingService)
    {
        $this->shippingService = $shippingService;
    }

    /**
     * Calculate Gojek and Paxel shipping rates.
     */
    public function calculate(Request $request): JsonResponse
    {
        $request->validate([
            'city_name' => 'required|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'total_weight_grams' => 'nullable|integer',
            'items' => 'nullable|array',
            'items.*.product_id' => 'required_with:items|exists:products,id',
            'items.*.quantity' => 'required_with:items|integer|min:1',
        ]);

        $totalWeight = $request->input('total_weight_grams', 0);

        // If items array provided, calculate actual total weight from DB products
        if ($request->has('items') && is_array($request->items)) {
            $totalWeight = 0;
            foreach ($request->items as $item) {
                $product = Product::find($item['product_id']);
                if ($product) {
                    $totalWeight += ($product->weight_grams * (int) $item['quantity']);
                }
            }
        }

        // Minimum 100 grams
        $totalWeight = max(100, $totalWeight);

        $lat = $request->filled('latitude') ? (float) $request->latitude : null;
        $lng = $request->filled('longitude') ? (float) $request->longitude : null;
        $city = $request->input('city_name', 'Jakarta Timur');

        $result = $this->shippingService->calculateOptions($lat, $lng, $city, $totalWeight);

        return response()->json($result);
    }

    /**
     * List all Paxel supported cities.
     */
    public function paxelCities(): JsonResponse
    {
        $cities = PaxelRate::orderBy('province')->orderBy('city_name')->get();

        return response()->json([
            'data' => $cities,
        ]);
    }

    /**
     * Get Store Kitchen info (coords, rates, etc.)
     */
    public function storeInfo(): JsonResponse
    {
        $settings = ShippingSetting::current();

        return response()->json([
            'data' => $settings,
        ]);
    }
}
