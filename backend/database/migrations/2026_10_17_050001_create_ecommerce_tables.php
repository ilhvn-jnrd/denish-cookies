<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Categories
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // 2. Products
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->decimal('price', 12, 2);
            $table->integer('weight_grams'); // Crucial for Gojek & Paxel box calculations
            $table->integer('stock')->default(0);
            $table->boolean('is_preorder')->default(false);
            $table->integer('po_lead_days')->default(2);
            $table->text('image_url')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 3. User Addresses (with OpenStreetMap Leaflet GPS Coordinates)
        Schema::create('user_addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('label')->default('Rumah'); // Rumah, Kantor, etc.
            $table->string('recipient_name');
            $table->string('phone');
            $table->text('full_address');
            $table->string('province')->default('DKI Jakarta');
            $table->string('city_name')->default('Jakarta Timur');
            $table->string('postal_code')->nullable();
            $table->double('latitude', 10, 7)->nullable();
            $table->double('longitude', 10, 7)->nullable();
            $table->boolean('is_in_city')->default(false);
            $table->boolean('is_default')->default(false);
            $table->timestamps();
        });

        // 4. Paxel City Rates Matrix (Inter-City / Luar Kota)
        Schema::create('paxel_rates', function (Blueprint $table) {
            $table->id();
            $table->string('city_name');
            $table->string('province');
            $table->decimal('small_rate', 10, 2); // <= 1.5 kg
            $table->decimal('medium_rate', 10, 2); // 1.51 kg - 3.0 kg
            $table->decimal('large_rate', 10, 2); // 3.01 kg - 5.0 kg
            $table->string('estimated_days')->default('Pengiriman Reguler / Luar Kota');
            $table->timestamps();
        });

        // 5. Shipping & Store Kitchen Settings (Intra-City Gojek & Global Config)
        Schema::create('shipping_settings', function (Blueprint $table) {
            $table->id();
            $table->string('store_name')->default("De'nish Cookies Kitchen");
            $table->string('store_phone')->default('088218106303');
            $table->text('store_address')->nullable();
            $table->string('store_city')->default('Kota Bandung');
            $table->double('store_lat', 16, 12)->default(-6.917547878001074);
            $table->double('store_lng', 16, 12)->default(107.6634056367421);
            $table->decimal('gojek_instant_rate_per_km', 10, 2)->default(4000);
            $table->decimal('gojek_instant_min_fare', 10, 2)->default(15000);
            $table->decimal('gojek_sameday_flat_under_15km', 10, 2)->default(18000);
            $table->decimal('gojek_sameday_flat_over_15km', 10, 2)->default(25000);
            $table->decimal('max_distance_gojek_km', 6, 2)->default(40.0);
            $table->decimal('road_distance_factor', 4, 2)->default(1.3);
            $table->timestamps();
        });

        // 6. Orders
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique(); // e.g. DC-20261017-0001
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('recipient_name');
            $table->string('recipient_phone');
            $table->text('shipping_address');
            $table->string('shipping_city');
            $table->string('shipping_province');
            $table->string('shipping_postal_code')->nullable();
            $table->double('shipping_lat', 10, 7)->nullable();
            $table->double('shipping_lng', 10, 7)->nullable();
            $table->string('courier_type'); // 'gojek_instant', 'gojek_sameday', 'paxel'
            $table->string('courier_service_name');
            $table->decimal('distance_km', 8, 2)->nullable();
            $table->integer('total_weight_grams');
            $table->string('box_breakdown')->nullable(); // e.g. "1 Box Large (3-5kg) + 1 Box Small"
            $table->decimal('subtotal', 12, 2);
            $table->decimal('shipping_cost', 10, 2);
            $table->decimal('gross_amount', 12, 2);
            $table->string('payment_status')->default('pending'); // pending, paid, failed, expired, cancelled
            $table->string('order_status')->default('pending'); // pending, paid, processing, shipped, completed, cancelled
            $table->string('snap_token')->nullable();
            $table->string('tracking_number')->nullable(); // AWB Resi Paxel or Gojek Live Tracking link
            $table->text('notes')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });

        // 7. Order Items
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('product_name');
            $table->decimal('product_price', 12, 2);
            $table->integer('product_weight_grams');
            $table->integer('quantity');
            $table->decimal('subtotal', 12, 2);
            $table->boolean('is_preorder')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('shipping_settings');
        Schema::dropIfExists('paxel_rates');
        Schema::dropIfExists('user_addresses');
        Schema::dropIfExists('products');
        Schema::dropIfExists('categories');
    }
};
