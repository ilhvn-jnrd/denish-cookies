<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserAddress extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'label',
        'recipient_name',
        'phone',
        'full_address',
        'province',
        'city_name',
        'postal_code',
        'latitude',
        'longitude',
        'is_in_city',
        'is_default',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'is_in_city' => 'boolean',
        'is_default' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
