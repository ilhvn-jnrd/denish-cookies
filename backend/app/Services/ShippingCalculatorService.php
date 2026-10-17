<?php

namespace App\Services;

use App\Models\PaxelRate;
use App\Models\ShippingSetting;

class ShippingCalculatorService
{
    /**
     * Calculate Haversine distance in kilometers between two GPS coordinates.
     */
    public function calculateDistanceKm(float $lat1, float $lng1, float $lat2, float $lng2, float $roadFactor = 1.3): float
    {
        $earthRadiusKm = 6371.0;

        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLng / 2) * sin($dLng / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        $straightDistance = $earthRadiusKm * $c;

        // Apply realistic street road-distance factor (default 1.3x)
        return round($straightDistance * $roadFactor, 2);
    }

    /**
     * Calculate available shipping options based on user location, city, and total weight in grams.
     */
    public function calculateOptions(?float $userLat, ?float $userLng, string $cityName, int $totalWeightGrams): array
    {
        $settings = ShippingSetting::current();
        $totalKg = max(0.1, round($totalWeightGrams / 1000, 2));
        $options = [];

        // 1. Calculate Gojek (Dalam Kota / Intra-City) if coordinates provided
        if ($userLat !== null && $userLng !== null) {
            $distanceKm = $this->calculateDistanceKm(
                $settings->store_lat,
                $settings->store_lng,
                $userLat,
                $userLng,
                $settings->road_distance_factor
            );

            $maxGojekDistance = (float) $settings->max_distance_gojek_km; // default 40 km

            // Gojek Instant: max 20 kg (20,000 grams), <= 40 km
            if ($distanceKm <= $maxGojekDistance) {
                $instantWeightOk = $totalWeightGrams <= 20000;
                $instantCost = max(
                    $settings->gojek_instant_min_fare,
                    ceil($distanceKm) * $settings->gojek_instant_rate_per_km
                );

                $options[] = [
                    'courier_type' => 'gojek_instant',
                    'service_name' => 'Gojek Instant Driver',
                    'delivery_time' => '1 - 3 Jam Tiba (Langsung Antar)',
                    'distance_km' => $distanceKm,
                    'is_available' => $instantWeightOk,
                    'cost' => $instantWeightOk ? (float) $instantCost : 0,
                    'max_weight_grams' => 20000,
                    'description' => "Pengiriman instan motor langsung dari Duren Sawit ({$distanceKm} km)",
                    'warning' => !$instantWeightOk ? 'Berat melebihi batas maksimal Gojek Instant (20 kg)' : null,
                ];

                // Gojek SameDay: max 7 kg (7,000 grams), <= 40 km
                $samedayWeightOk = $totalWeightGrams <= 7000;
                $samedayCost = $distanceKm <= 15
                    ? $settings->gojek_sameday_flat_under_15km
                    : $settings->gojek_sameday_flat_over_15km;

                $options[] = [
                    'courier_type' => 'gojek_sameday',
                    'service_name' => 'Gojek SameDay',
                    'delivery_time' => '6 - 8 Jam Tiba (Hari yang Sama)',
                    'distance_km' => $distanceKm,
                    'is_available' => $samedayWeightOk,
                    'cost' => $samedayWeightOk ? (float) $samedayCost : 0,
                    'max_weight_grams' => 7000,
                    'description' => "Pengiriman hemat sameday dalam kota ({$distanceKm} km)",
                    'warning' => !$samedayWeightOk ? 'Berat melebihi batas maksimal Gojek SameDay (7 kg)' : null,
                ];
            }
        }

        // 2. Calculate Paxel (Luar Kota / Inter-City City-Zone + Box Breakdown)
        $cleanCity = trim($cityName);
        $paxelRate = PaxelRate::where('city_name', 'LIKE', "%{$cleanCity}%")->first();

        // Fallback default if not explicitly found in matrix
        if (!$paxelRate) {
            $paxelRate = PaxelRate::where('city_name', 'LIKE', '%Jakarta%')->first()
                ?? new PaxelRate([
                    'city_name' => $cleanCity ?: 'Jabodetabek',
                    'province' => 'Jawa',
                    'small_rate' => 22000,
                    'medium_rate' => 30000,
                    'large_rate' => 40000,
                    'estimated_days' => '1 Hari Sampai / Sameday Cold Chain',
                ]);
        }

        $paxelCalculation = $this->calculatePaxelCostAndBoxes($totalKg, $paxelRate);

        $options[] = [
            'courier_type' => 'paxel',
            'service_name' => "Paxel Delivery ({$paxelCalculation['box_summary']})",
            'delivery_time' => $paxelRate->estimated_days ?? '1 Hari Sampai / Sameday',
            'distance_km' => null,
            'is_available' => true,
            'cost' => (float) $paxelCalculation['total_cost'],
            'box_breakdown' => $paxelCalculation['breakdown_details'],
            'box_summary' => $paxelCalculation['box_summary'],
            'description' => "Pengiriman khusus makanan & kue kering berpendingin/aman goncangan",
            'warning' => null,
        ];

        return [
            'store_location' => [
                'city' => $settings->store_city,
                'lat' => $settings->store_lat,
                'lng' => $settings->store_lng,
            ],
            'destination_city' => $cityName,
            'total_weight_grams' => $totalWeightGrams,
            'total_weight_kg' => $totalKg,
            'options' => $options,
        ];
    }

    /**
     * Calculate Paxel Box breakdown and total cost.
     * Tier 1: <= 1.5 kg -> Small
     * Tier 2: 1.51 - 3.0 kg -> Medium
     * Tier 3: 3.01 - 5.0 kg -> Large
     * Tier 4: > 5.0 kg -> Multiple 5kg Large boxes + remainder box tier
     */
    public function calculatePaxelCostAndBoxes(float $totalKg, PaxelRate $rate): array
    {
        $smallRate = (float) $rate->small_rate;
        $mediumRate = (float) $rate->medium_rate;
        $largeRate = (float) $rate->large_rate;

        if ($totalKg <= 1.5) {
            return [
                'total_cost' => $smallRate,
                'box_summary' => '1 Box Small',
                'breakdown_details' => '1 Box Small (Kapasitas s/d 1.5 kg)',
                'boxes' => [['tier' => 'small', 'capacity' => '1.5kg', 'cost' => $smallRate]],
            ];
        }

        if ($totalKg <= 3.0) {
            return [
                'total_cost' => $mediumRate,
                'box_summary' => '1 Box Medium',
                'breakdown_details' => '1 Box Medium (Kapasitas s/d 3 kg)',
                'boxes' => [['tier' => 'medium', 'capacity' => '3kg', 'cost' => $mediumRate]],
            ];
        }

        if ($totalKg <= 5.0) {
            return [
                'total_cost' => $largeRate,
                'box_summary' => '1 Box Large',
                'breakdown_details' => '1 Box Large (Kapasitas s/d 5 kg)',
                'boxes' => [['tier' => 'large', 'capacity' => '5kg', 'cost' => $largeRate]],
            ];
        }

        // When > 5.0 kg, split into multiple 5kg boxes
        $numLargeBoxes = (int) floor($totalKg / 5.0);
        $remainderKg = round($totalKg - ($numLargeBoxes * 5.0), 2);

        $totalCost = $numLargeBoxes * $largeRate;
        $boxes = [];

        for ($i = 0; $i < $numLargeBoxes; $i++) {
            $boxes[] = ['tier' => 'large', 'capacity' => '5kg', 'cost' => $largeRate];
        }

        if ($remainderKg <= 0.05) {
            $summary = "{$numLargeBoxes} Box Large";
            $breakdown = "{$numLargeBoxes} Box Large (Total {$totalKg} kg)";
        } elseif ($remainderKg <= 1.5) {
            $totalCost += $smallRate;
            $boxes[] = ['tier' => 'small', 'capacity' => '1.5kg', 'cost' => $smallRate];
            $summary = "{$numLargeBoxes} Box Large + 1 Box Small";
            $breakdown = "{$numLargeBoxes} Box Large (5kg) + 1 Box Small (Sisa {$remainderKg} kg)";
        } elseif ($remainderKg <= 3.0) {
            $totalCost += $mediumRate;
            $boxes[] = ['tier' => 'medium', 'capacity' => '3kg', 'cost' => $mediumRate];
            $summary = "{$numLargeBoxes} Box Large + 1 Box Medium";
            $breakdown = "{$numLargeBoxes} Box Large (5kg) + 1 Box Medium (Sisa {$remainderKg} kg)";
        } else {
            $totalCost += $largeRate;
            $boxes[] = ['tier' => 'large', 'capacity' => '5kg', 'cost' => $largeRate];
            $boxCount = $numLargeBoxes + 1;
            $summary = "{$boxCount} Box Large";
            $breakdown = "{$boxCount} Box Large (Total {$totalKg} kg)";
        }

        return [
            'total_cost' => $totalCost,
            'box_summary' => $summary,
            'breakdown_details' => $breakdown,
            'boxes' => $boxes,
        ];
    }
}
