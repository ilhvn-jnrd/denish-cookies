<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaxelRate extends Model
{
    use HasFactory;

    protected $fillable = [
        'city_name',
        'province',
        'small_rate',
        'medium_rate',
        'large_rate',
        'estimated_days',
    ];

    protected $casts = [
        'small_rate' => 'float',
        'medium_rate' => 'float',
        'large_rate' => 'float',
    ];
}
