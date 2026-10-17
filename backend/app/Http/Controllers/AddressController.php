<?php

namespace App\Http\Controllers;

use App\Models\UserAddress;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $addresses = $request->user()->addresses()->orderBy('is_default', 'desc')->get();

        return response()->json([
            'data' => $addresses,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'label' => 'required|string|max:50',
            'recipient_name' => 'required|string|max:255',
            'phone' => 'required|string|max:30',
            'full_address' => 'required|string',
            'province' => 'required|string|max:100',
            'city_name' => 'required|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'is_in_city' => 'nullable|boolean',
            'is_default' => 'nullable|boolean',
        ]);

        $user = $request->user();

        // If this is set to default or first address, unset previous defaults
        $isFirst = $user->addresses()->count() === 0;
        $isDefault = $request->boolean('is_default') || $isFirst;

        if ($isDefault) {
            $user->addresses()->update(['is_default' => false]);
        }

        // Auto detect is_in_city if city contains Jakarta
        $isInCity = $request->has('is_in_city')
            ? $request->boolean('is_in_city')
            : (stripos($validated['city_name'], 'Jakarta') !== false);

        $address = $user->addresses()->create([
            ...$validated,
            'is_in_city' => $isInCity,
            'is_default' => $isDefault,
        ]);

        return response()->json([
            'message' => 'Alamat berhasil disimpan',
            'data' => $address,
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $address = $request->user()->addresses()->findOrFail($id);

        $validated = $request->validate([
            'label' => 'sometimes|required|string|max:50',
            'recipient_name' => 'sometimes|required|string|max:255',
            'phone' => 'sometimes|required|string|max:30',
            'full_address' => 'sometimes|required|string',
            'province' => 'sometimes|required|string|max:100',
            'city_name' => 'sometimes|required|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'is_in_city' => 'nullable|boolean',
            'is_default' => 'nullable|boolean',
        ]);

        if (!empty($validated['is_default'])) {
            $request->user()->addresses()->where('id', '!=', $id)->update(['is_default' => false]);
        }

        $address->update($validated);

        return response()->json([
            'message' => 'Alamat berhasil diperbarui',
            'data' => $address,
        ]);
    }

    public function setDefault(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $user->addresses()->update(['is_default' => false]);
        $address = $user->addresses()->findOrFail($id);
        $address->update(['is_default' => true]);

        return response()->json([
            'message' => 'Alamat utama berhasil diubah',
            'data' => $address,
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $address = $request->user()->addresses()->findOrFail($id);
        $address->delete();

        return response()->json([
            'message' => 'Alamat berhasil dihapus',
        ]);
    }
}
