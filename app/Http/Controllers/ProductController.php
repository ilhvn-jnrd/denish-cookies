<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::with('category')->where('is_active', true);

        // Filter by category slug
        if ($request->filled('category')) {
            $query->whereHas('category', function ($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        // Filter by search keyword
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('description', 'LIKE', "%{$search}%");
            });
        }

        // Filter by Ready Stock vs Pre-Order
        if ($request->filled('type')) {
            if ($request->type === 'ready') {
                $query->where('is_preorder', false)->where('stock', '>', 0);
            } elseif ($request->type === 'preorder') {
                $query->where('is_preorder', true);
            }
        }

        // Filter featured
        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        // Sorting
        if ($request->sort === 'price_asc') {
            $query->orderBy('price', 'asc');
        } elseif ($request->sort === 'price_desc') {
            $query->orderBy('price', 'desc');
        } else {
            $query->orderBy('is_featured', 'desc')->orderBy('id', 'desc');
        }

        $products = $query->get();

        return response()->json([
            'data' => $products,
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $product = Product::with('category')->where('slug', $slug)->firstOrFail();

        // Also suggest related products in the same category
        $related = Product::where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->where('is_active', true)
            ->limit(4)
            ->get();

        return response()->json([
            'data' => $product,
            'related' => $related,
        ]);
    }

    public function categories(): JsonResponse
    {
        $categories = Category::withCount(['products' => function ($q) {
            $q->where('is_active', true);
        }])->get();

        return response()->json([
            'data' => $categories,
        ]);
    }
}
