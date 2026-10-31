<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockMovement extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'type',
        'stock_before',
        'quantity_change',
        'stock_after',
        'offline_revenue',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'product_id' => 'integer',
        'stock_before' => 'integer',
        'quantity_change' => 'integer',
        'stock_after' => 'integer',
        'offline_revenue' => 'float',
        'created_by' => 'integer',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}

