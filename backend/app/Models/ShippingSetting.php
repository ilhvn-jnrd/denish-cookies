<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShippingSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'store_name',
        'store_phone',
        'store_address',
        'store_city',
        'store_lat',
        'store_lng',
        'gojek_instant_rate_per_km',
        'gojek_instant_min_fare',
        'gojek_sameday_flat_under_15km',
        'gojek_sameday_flat_over_15km',
        'max_distance_gojek_km',
        'road_distance_factor',
    ];

    protected $casts = [
        'store_lat' => 'float',
        'store_lng' => 'float',
        'gojek_instant_rate_per_km' => 'float',
        'gojek_instant_min_fare' => 'float',
        'gojek_sameday_flat_under_15km' => 'float',
        'gojek_sameday_flat_over_15km' => 'float',
        'max_distance_gojek_km' => 'float',
        'road_distance_factor' => 'float',
    ];

    public static function current(): self
    {
        $setting = static::first();
        if (!$setting) {
            return static::create([
                'store_name' => "De'nish Cookies Kitchen",
                'store_phone' => "088218106303",
                'store_address' => "Jl. Cibatu Raya No. 55, Kel. Antapani Tengah, Kec. Antapani, Kota Bandung, Jawa Barat",
                'store_city' => "Kota Bandung",
                'store_lat' => -6.917547878001074,
                'store_lng' => 107.6634056367421,
                'gojek_instant_rate_per_km' => 4000,
                'gojek_instant_min_fare' => 15000,
                'gojek_sameday_flat_under_15km' => 18000,
                'gojek_sameday_flat_over_15km' => 25000,
                'max_distance_gojek_km' => 40.0,
                'road_distance_factor' => 1.3,
            ]);
        }

        // Auto-heal legacy database rows (e.g. initial dump with Jakarta or older Bandung coords)
        if (
            str_contains(strtolower($setting->store_address ?? ''), 'duren sawit') ||
            str_contains(strtolower($setting->store_city ?? ''), 'jakarta') ||
            $setting->store_lat > -6.5 ||
            abs($setting->store_lat - (-6.9147)) < 0.0001
        ) {
            $setting->update([
                'store_name' => "De'nish Cookies Kitchen",
                'store_phone' => "088218106303",
                'store_address' => "Jl. Cibatu Raya No. 55, Kel. Antapani Tengah, Kec. Antapani, Kota Bandung, Jawa Barat",
                'store_city' => "Kota Bandung",
                'store_lat' => -6.917547878001074,
                'store_lng' => 107.6634056367421,
                'gojek_instant_rate_per_km' => 4000,
            ]);
        }

        return $setting;
    }
}
