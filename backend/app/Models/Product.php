<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'description',
        'price',
        'weight_grams',
        'stock',
        'is_preorder',
        'po_lead_days',
        'image_url',
        'is_featured',
        'is_active',
    ];

    protected $casts = [
        'price' => 'float',
        'weight_grams' => 'integer',
        'stock' => 'integer',
        'is_preorder' => 'boolean',
        'po_lead_days' => 'integer',
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
