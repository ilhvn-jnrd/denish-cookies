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
        return static::firstOrCreate([], [
            'store_name' => "Denish Cookies Kitchen",
            'store_phone' => "081298765432",
            'store_address' => "Jl. Pahlawan Revolusi No. 42, Duren Sawit, Jakarta Timur, 13430",
            'store_city' => "Jakarta Timur",
            'store_lat' => -6.225014,
            'store_lng' => 106.900447,
            'gojek_instant_rate_per_km' => 3000,
            'gojek_instant_min_fare' => 15000,
            'gojek_sameday_flat_under_15km' => 18000,
            'gojek_sameday_flat_over_15km' => 25000,
            'max_distance_gojek_km' => 40.0,
            'road_distance_factor' => 1.3,
        ]);
    }
}
