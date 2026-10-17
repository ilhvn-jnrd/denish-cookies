<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'user_id',
        'recipient_name',
        'recipient_phone',
        'shipping_address',
        'shipping_city',
        'shipping_province',
        'shipping_postal_code',
        'shipping_lat',
        'shipping_lng',
        'courier_type',
        'courier_service_name',
        'distance_km',
        'total_weight_grams',
        'box_breakdown',
        'subtotal',
        'shipping_cost',
        'gross_amount',
        'payment_status',
        'order_status',
        'snap_token',
        'tracking_number',
        'notes',
        'paid_at',
        'shipped_at',
        'completed_at',
    ];

    protected $casts = [
        'shipping_lat' => 'float',
        'shipping_lng' => 'float',
        'distance_km' => 'float',
        'total_weight_grams' => 'integer',
        'subtotal' => 'float',
        'shipping_cost' => 'float',
        'gross_amount' => 'float',
        'paid_at' => 'datetime',
        'shipped_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    protected $appends = [
        'admin_fee',
    ];

    public function getAdminFeeAttribute(): float
    {
        return max(0, round($this->gross_amount - $this->subtotal - $this->shipping_cost, 2));
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
