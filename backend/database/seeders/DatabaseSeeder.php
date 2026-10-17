<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PaxelRate;
use App\Models\Product;
use App\Models\ShippingSetting;
use App\Models\User;
use App\Models\UserAddress;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Users
        $admin = User::firstOrCreate(['email' => 'admin@denishcookies.com'], [
            'name' => "De'nish Owner / Admin",
            'phone' => '088218106303',
            'role' => 'admin',
            'password' => Hash::make('password123'),
        ]);

        $customer = User::firstOrCreate(['email' => 'pembeli@gmail.com'], [
            'name' => 'Budi Santoso',
            'phone' => '081311223344',
            'role' => 'customer',
            'password' => Hash::make('password123'),
        ]);

        // 2. User Addresses for Customer
        UserAddress::firstOrCreate(['user_id' => $customer->id, 'label' => 'Rumah (Bandung)'], [
            'recipient_name' => 'Budi Santoso',
            'phone' => '081311223344',
            'full_address' => 'Jl. Cibatu Raya No. 55, Antapani Tengah, Antapani',
            'province' => 'Jawa Barat',
            'city_name' => 'Kota Bandung',
            'postal_code' => '40291',
            'latitude' => -6.9147,
            'longitude' => 107.6619,
            'is_in_city' => true,
            'is_default' => true,
        ]);

        UserAddress::firstOrCreate(['user_id' => $customer->id, 'label' => 'Kantor (Bandung)'], [
            'recipient_name' => 'Budi Santoso (Kantor)',
            'phone' => '081311223344',
            'full_address' => 'Jl. R.E. Martadinata No. 55, Citarum, Bandung Wetan',
            'province' => 'Jawa Barat',
            'city_name' => 'Bandung',
            'postal_code' => '40115',
            'latitude' => -6.907820,
            'longitude' => 107.618950,
            'is_in_city' => false,
            'is_default' => false,
        ]);

        // 3. Categories
        $catSignature = Category::firstOrCreate(['slug' => 'signature-cookies'], [
            'name' => 'Signature Cookies',
            'description' => 'Kue kering resep otentik warisan keluarga dengan wisman butter premium',
        ]);

        $catFestive = Category::firstOrCreate(['slug' => 'classic-festive'], [
            'name' => 'Classic Festive',
            'description' => 'Favorit sepanjang masa untuk momen Idul Fitri, Natal, dan kebersamaan keluarga',
        ]);

        $catHampers = Category::firstOrCreate(['slug' => 'premium-hampers'], [
            'name' => 'Premium Hampers',
            'description' => 'Paket hampers elegan dan hardbox eksklusif dengan kartu ucapan custom',
        ]);

        $catChoco = Category::firstOrCreate(['slug' => 'choco-savoury'], [
            'name' => 'Choco & Savoury',
            'description' => 'Kombinasi cokelat leleh belgian dan gurih keju edam pilihan',
        ]);

        // 4. Products (High-res bakery images with accurate weights)
        $productsData = [
            [
                'category_id' => $catFestive->id,
                'name' => 'Nastar Wisman Spesial 500gr',
                'slug' => 'nastar-wisman-spesial-500gr',
                'description' => 'Nastar lumer di mulut dibuat dengan 100% Wijsman butter asli dan selai nanas madu homemade legit manis asam segar. Resep turun temurun tanpa pemanis buatan.',
                'price' => 135000,
                'weight_grams' => 500,
                'stock' => 28,
                'is_preorder' => false,
                'po_lead_days' => 2,
                'image_url' => 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=700&q=80',
                'is_featured' => true,
                'is_active' => true,
            ],
            [
                'category_id' => $catSignature->id,
                'name' => 'Kastengel Keju Edam 500gr',
                'slug' => 'kastengel-keju-edam-500gr',
                'description' => 'Kastengel super renyah dan gurih mantap bertabur parutan keju Edam tua impor Belanda melimpah. Wangi butter keju semerbak di setiap gigitan.',
                'price' => 145000,
                'weight_grams' => 500,
                'stock' => 18,
                'is_preorder' => false,
                'po_lead_days' => 2,
                'image_url' => 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=700&q=80',
                'is_featured' => true,
                'is_active' => true,
            ],
            [
                'category_id' => $catFestive->id,
                'name' => 'Putri Salju Kacang Mede 450gr',
                'slug' => 'putri-salju-kacang-mede-450gr',
                'description' => 'Kue putri salju dingin lumer di lidah dengan paduan cincangan kacang mede panggang renyah beraroma wangi, dibalut gula halus dingin berkualitas.',
                'price' => 120000,
                'weight_grams' => 450,
                'stock' => 22,
                'is_preorder' => false,
                'po_lead_days' => 2,
                'image_url' => 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=700&q=80',
                'is_featured' => true,
                'is_active' => true,
            ],
            [
                'category_id' => $catFestive->id,
                'name' => 'Sagu Keju Lumer 400gr',
                'slug' => 'sagu-keju-lumer-400gr',
                'description' => 'Tekstur ringan langsung lumer seketika di mulut dengan aroma daun pandan wangi dan keju cheddar panggang yang gurih manis pas.',
                'price' => 105000,
                'weight_grams' => 400,
                'stock' => 15,
                'is_preorder' => false,
                'po_lead_days' => 2,
                'image_url' => 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=700&q=80',
                'is_featured' => false,
                'is_active' => true,
            ],
            [
                'category_id' => $catChoco->id,
                'name' => 'Double Choco Almond Cookies 450gr',
                'slug' => 'double-choco-almond-cookies-450gr',
                'description' => 'Dibuat dari dark chocolate couverture murni dan taburan irisan almond panggang tebal yang crunchy. Rasa cokelat kaya dan tidak terlalu manis.',
                'price' => 125000,
                'weight_grams' => 450,
                'stock' => 14,
                'is_preorder' => false,
                'po_lead_days' => 2,
                'image_url' => 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=700&q=80',
                'is_featured' => true,
                'is_active' => true,
            ],
            [
                'category_id' => $catSignature->id,
                'name' => 'Lidah Kucing Rainbow 350gr',
                'slug' => 'lidah-kucing-rainbow-350gr',
                'description' => 'Kue lidah kucing tipis, garing, dan buttery dengan warna-warni ceria yang disukai segala usia. Menggunakan pewarna makanan premium bersertifikasi BPOM & Halal.',
                'price' => 95000,
                'weight_grams' => 350,
                'stock' => 10,
                'is_preorder' => false,
                'po_lead_days' => 2,
                'image_url' => 'https://images.unsplash.com/photo-1548848221-0c2e497ed557?auto=format&fit=crop&w=700&q=80',
                'is_featured' => false,
                'is_active' => true,
            ],
            [
                'category_id' => $catHampers->id,
                'name' => "Hampers De'nish Royal Box (Isi 4 Toples - 2200gr)",
                'slug' => 'hampers-denish-royal-box-4-toples',
                'description' => 'Gift box mewah laminasi gold tebal berisi 4 toples kue favorit (Nastar Wisman, Kastengel Edam, Putri Salju, Choco Almond), dilengkapi greeting card eksklusif & pita satin merah emas.',
                'price' => 495000,
                'weight_grams' => 2200,
                'stock' => 8,
                'is_preorder' => true,
                'po_lead_days' => 3,
                'image_url' => 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=700&q=80',
                'is_featured' => true,
                'is_active' => true,
            ],
            [
                'category_id' => $catHampers->id,
                'name' => 'Hampers Mini Blessing (Isi 2 Toples - 1100gr)',
                'slug' => 'hampers-mini-blessing-2-toples',
                'description' => 'Paket hampers ringkas nan elegan berisi 2 toples pilihan (Nastar Wisman & Kastengel Keju Edam), cocok untuk gift hantaran rekan kerja dan sahabat tersayang.',
                'price' => 265000,
                'weight_grams' => 1100,
                'stock' => 15,
                'is_preorder' => true,
                'po_lead_days' => 2,
                'image_url' => 'https://images.unsplash.com/photo-1512485800893-b09ec169739a?auto=format&fit=crop&w=700&q=80',
                'is_featured' => false,
                'is_active' => true,
            ],
        ];

        foreach ($productsData as $prod) {
            Product::firstOrCreate(['slug' => $prod['slug']], $prod);
        }

        // 5. Paxel Rates Matrix (15+ Major Indonesian Cities)
        $paxelData = [
            ['city_name' => 'Jakarta Timur', 'province' => 'DKI Jakarta', 'small_rate' => 18000, 'medium_rate' => 25000, 'large_rate' => 32000, 'estimated_days' => 'Pengiriman Reguler / Luar Kota'],
            ['city_name' => 'Jakarta Selatan', 'province' => 'DKI Jakarta', 'small_rate' => 18000, 'medium_rate' => 25000, 'large_rate' => 32000, 'estimated_days' => 'Pengiriman Reguler / Luar Kota'],
            ['city_name' => 'Jakarta Pusat', 'province' => 'DKI Jakarta', 'small_rate' => 18000, 'medium_rate' => 25000, 'large_rate' => 32000, 'estimated_days' => 'Pengiriman Reguler / Luar Kota'],
            ['city_name' => 'Jakarta Barat', 'province' => 'DKI Jakarta', 'small_rate' => 18000, 'medium_rate' => 25000, 'large_rate' => 32000, 'estimated_days' => 'Pengiriman Reguler / Luar Kota'],
            ['city_name' => 'Jakarta Utara', 'province' => 'DKI Jakarta', 'small_rate' => 18000, 'medium_rate' => 25000, 'large_rate' => 32000, 'estimated_days' => 'Pengiriman Reguler / Luar Kota'],
            ['city_name' => 'Bekasi', 'province' => 'Jawa Barat', 'small_rate' => 18000, 'medium_rate' => 25000, 'large_rate' => 32000, 'estimated_days' => 'Pengiriman Reguler / Luar Kota'],
            ['city_name' => 'Depok', 'province' => 'Jawa Barat', 'small_rate' => 18000, 'medium_rate' => 25000, 'large_rate' => 32000, 'estimated_days' => 'Pengiriman Reguler / Luar Kota'],
            ['city_name' => 'Tangerang', 'province' => 'Banten', 'small_rate' => 18000, 'medium_rate' => 25000, 'large_rate' => 32000, 'estimated_days' => 'Pengiriman Reguler / Luar Kota'],
            ['city_name' => 'Bogor', 'province' => 'Jawa Barat', 'small_rate' => 20000, 'medium_rate' => 28000, 'large_rate' => 36000, 'estimated_days' => 'Pengiriman Reguler / Luar Kota'],
            ['city_name' => 'Bandung', 'province' => 'Jawa Barat', 'small_rate' => 22000, 'medium_rate' => 30000, 'large_rate' => 40000, 'estimated_days' => 'Pengiriman Reguler / Luar Kota'],
            ['city_name' => 'Cirebon', 'province' => 'Jawa Barat', 'small_rate' => 25000, 'medium_rate' => 35000, 'large_rate' => 45000, 'estimated_days' => 'Pengiriman Reguler / Luar Kota'],
            ['city_name' => 'Semarang', 'province' => 'Jawa Tengah', 'small_rate' => 25000, 'medium_rate' => 35000, 'large_rate' => 45000, 'estimated_days' => 'Pengiriman Reguler / Luar Kota'],
            ['city_name' => 'Solo', 'province' => 'Jawa Tengah', 'small_rate' => 25000, 'medium_rate' => 35000, 'large_rate' => 45000, 'estimated_days' => 'Pengiriman Reguler / Luar Kota'],
            ['city_name' => 'Yogyakarta', 'province' => 'DI Yogyakarta', 'small_rate' => 25000, 'medium_rate' => 35000, 'large_rate' => 45000, 'estimated_days' => 'Pengiriman Reguler / Luar Kota'],
            ['city_name' => 'Surabaya', 'province' => 'Jawa Timur', 'small_rate' => 28000, 'medium_rate' => 38000, 'large_rate' => 50000, 'estimated_days' => 'Pengiriman Reguler / Luar Kota'],
            ['city_name' => 'Malang', 'province' => 'Jawa Timur', 'small_rate' => 28000, 'medium_rate' => 38000, 'large_rate' => 50000, 'estimated_days' => 'Pengiriman Reguler / Luar Kota'],
            ['city_name' => 'Denpasar', 'province' => 'Bali', 'small_rate' => 35000, 'medium_rate' => 48000, 'large_rate' => 65000, 'estimated_days' => 'Pengiriman Luar Kota / Antar Pulau'],
            ['city_name' => 'Medan', 'province' => 'Sumatera Utara', 'small_rate' => 45000, 'medium_rate' => 60000, 'large_rate' => 85000, 'estimated_days' => 'Pengiriman Luar Kota / Antar Pulau'],
            ['city_name' => 'Makassar', 'province' => 'Sulawesi Selatan', 'small_rate' => 45000, 'medium_rate' => 65000, 'large_rate' => 90000, 'estimated_days' => 'Pengiriman Luar Kota / Antar Pulau'],
        ];

        foreach ($paxelData as $paxel) {
            PaxelRate::firstOrCreate(['city_name' => $paxel['city_name']], $paxel);
        }

        // 6. Shipping & Kitchen Settings
        ShippingSetting::current();

        // 7. Seed Sample Orders to make the admin & user dashboards instantly alive
        $sampleOrder = Order::firstOrCreate(['order_number' => 'DC-20261016-A101'], [
            'user_id' => $customer->id,
            'recipient_name' => 'Budi Santoso',
            'recipient_phone' => '081311223344',
            'shipping_address' => 'Jl. Cibatu Raya No. 55, Antapani Tengah, Antapani',
            'shipping_city' => 'Kota Bandung',
            'shipping_province' => 'Jawa Barat',
            'shipping_postal_code' => '40291',
            'shipping_lat' => -6.9147,
            'shipping_lng' => 107.6619,
            'courier_type' => 'gojek_instant',
            'courier_service_name' => 'Gojek Instant Driver (6.2 km)',
            'distance_km' => 6.2,
            'total_weight_grams' => 1000,
            'box_breakdown' => 'Paper Bag De\'nish + Bubble Wrap',
            'subtotal' => 280000,
            'shipping_cost' => 18600,
            'gross_amount' => 298600,
            'payment_status' => 'paid',
            'order_status' => 'shipped',
            'tracking_number' => 'GK-98234-JKT',
            'notes' => 'Tolong titip di pos satpam bila rumah kosong.',
            'paid_at' => Carbon::now()->subDays(1),
            'shipped_at' => Carbon::now()->subHours(5),
        ]);

        $nastar = Product::where('slug', 'nastar-wisman-spesial-500gr')->first();
        $kastengel = Product::where('slug', 'kastengel-keju-edam-500gr')->first();

        if ($nastar && $kastengel && $sampleOrder->items()->count() === 0) {
            OrderItem::create([
                'order_id' => $sampleOrder->id,
                'product_id' => $nastar->id,
                'product_name' => $nastar->name,
                'product_price' => $nastar->price,
                'product_weight_grams' => $nastar->weight_grams,
                'quantity' => 1,
                'subtotal' => $nastar->price,
                'is_preorder' => false,
            ]);
            OrderItem::create([
                'order_id' => $sampleOrder->id,
                'product_id' => $kastengel->id,
                'product_name' => $kastengel->name,
                'product_price' => $kastengel->price,
                'product_weight_grams' => $kastengel->weight_grams,
                'quantity' => 1,
                'subtotal' => $kastengel->price,
                'is_preorder' => false,
            ]);
        }

        // Sample Order 2 (Paxel Inter-city)
        $sampleOrder2 = Order::firstOrCreate(['order_number' => 'DC-20261017-B202'], [
            'user_id' => $customer->id,
            'recipient_name' => 'Ibu Ratna Dewi',
            'recipient_phone' => '081288776655',
            'shipping_address' => 'Jl. R.E. Martadinata No. 55, Citarum, Bandung Wetan',
            'shipping_city' => 'Bandung',
            'shipping_province' => 'Jawa Barat',
            'shipping_postal_code' => '40115',
            'shipping_lat' => -6.907820,
            'shipping_lng' => 107.618950,
            'courier_type' => 'paxel',
            'courier_service_name' => 'Paxel Delivery (1 Box Large)',
            'distance_km' => null,
            'total_weight_grams' => 2200,
            'box_breakdown' => '1 Box Large (Kapasitas s/d 5 kg)',
            'subtotal' => 495000,
            'shipping_cost' => 40000,
            'gross_amount' => 535000,
            'payment_status' => 'paid',
            'order_status' => 'processing',
            'tracking_number' => 'PXL-BDG-2026101701',
            'notes' => 'Untuk hadiah ulang tahun mertua. Mohon dipastikan aman.',
            'paid_at' => Carbon::now()->subHours(2),
        ]);

        $hampersRoyal = Product::where('slug', 'hampers-denish-royal-box-4-toples')->first();
        if ($hampersRoyal && $sampleOrder2->items()->count() === 0) {
            OrderItem::create([
                'order_id' => $sampleOrder2->id,
                'product_id' => $hampersRoyal->id,
                'product_name' => $hampersRoyal->name,
                'product_price' => $hampersRoyal->price,
                'product_weight_grams' => $hampersRoyal->weight_grams,
                'quantity' => 1,
                'subtotal' => $hampersRoyal->price,
                'is_preorder' => true,
            ]);
        }
    }
}
