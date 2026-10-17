-- De'nish Cookies - Ready-to-import MySQL Database Dump for Hostinger
-- Compatible with MySQL 5.7+ / MySQL 8.0+ / MariaDB
-- Generated automatically

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';

-- --------------------------------------------------------
-- Table structure for table `migrations`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `migrations`
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
  (1, '0001_01_01_000000_create_users_table', 1),
  (2, '0001_01_01_000001_create_cache_table', 1),
  (3, '0001_01_01_000002_create_jobs_table', 1),
  (4, '2026_10_17_042619_create_personal_access_tokens_table', 1),
  (5, '2026_10_17_050001_create_ecommerce_tables', 1);

-- --------------------------------------------------------
-- Table structure for table `users`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL UNIQUE,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci NULL,
  `role` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'customer',
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `users`
INSERT INTO `users` (`id`, `name`, `email`, `phone`, `role`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`) VALUES
  (1, 'De\'nish Owner / Admin', 'admin@denishcookies.com', '081298765432', 'admin', NULL, '$2y$12$3yURiGHjM/EzQ8s6AgiUaOaxg8wP/pUzSJnYI/mReqUTQVkC1nfTm', NULL, '2026-10-17 04:31:59', '2026-10-17 04:31:59'),
  (2, 'Budi Santoso', 'pembeli@gmail.com', '081311223344', 'customer', NULL, '$2y$12$ZkA2loalzEP36cv5n5mRE.qIx8StoxwV3FU0iceWhhlaN56ho0lHW', NULL, '2026-10-17 04:31:59', '2026-10-17 04:31:59');

-- --------------------------------------------------------
-- Table structure for table `categories`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `categories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL UNIQUE,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `categories`
INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `created_at`, `updated_at`) VALUES
  (1, 'Signature Cookies', 'signature-cookies', 'Kue kering resep otentik warisan keluarga dengan wisman butter premium', '2026-10-17 04:31:59', '2026-10-17 04:31:59'),
  (2, 'Classic Festive', 'classic-festive', 'Favorit sepanjang masa untuk momen Idul Fitri, Natal, dan kebersamaan keluarga', '2026-10-17 04:31:59', '2026-10-17 04:31:59'),
  (3, 'Premium Hampers', 'premium-hampers', 'Paket hampers elegan dan hardbox eksklusif dengan kartu ucapan custom', '2026-10-17 04:31:59', '2026-10-17 04:31:59'),
  (4, 'Choco & Savoury', 'choco-savoury', 'Kombinasi cokelat leleh belgian dan gurih keju edam pilihan', '2026-10-17 04:31:59', '2026-10-17 04:31:59');

-- --------------------------------------------------------
-- Table structure for table `products`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `products` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `category_id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL UNIQUE,
  `description` text COLLATE utf8mb4_unicode_ci,
  `price` decimal(12,2) NOT NULL,
  `weight_grams` int NOT NULL,
  `stock` int NOT NULL DEFAULT '0',
  `is_preorder` tinyint(1) NOT NULL DEFAULT '0',
  `po_lead_days` int NOT NULL DEFAULT '2',
  `image_url` text COLLATE utf8mb4_unicode_ci,
  `is_featured` tinyint(1) NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `products_category_id_foreign` (`category_id`),
  CONSTRAINT `products_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `products`
INSERT INTO `products` (`id`, `category_id`, `name`, `slug`, `description`, `price`, `weight_grams`, `stock`, `is_preorder`, `po_lead_days`, `image_url`, `is_featured`, `is_active`, `created_at`, `updated_at`) VALUES
  (1, 2, 'Nastar Wisman Spesial 500gr', 'nastar-wisman-spesial-500gr', 'Nastar lumer di mulut dibuat dengan 100% Wijsman butter asli dan selai nanas madu homemade legit manis asam segar. Resep turun temurun tanpa pemanis buatan.', 135000, 500, 28, 0, 2, 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=700&q=80', 1, 1, '2026-10-17 04:31:59', '2026-10-17 04:31:59'),
  (2, 1, 'Kastengel Keju Edam 500gr', 'kastengel-keju-edam-500gr', 'Kastengel super renyah dan gurih mantap bertabur parutan keju Edam tua impor Belanda melimpah. Wangi butter keju semerbak di setiap gigitan.', 145000, 500, 18, 0, 2, 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=700&q=80', 1, 1, '2026-10-17 04:31:59', '2026-10-17 04:31:59'),
  (3, 2, 'Putri Salju Kacang Mede 450gr', 'putri-salju-kacang-mede-450gr', 'Kue putri salju dingin lumer di lidah dengan paduan cincangan kacang mede panggang renyah beraroma wangi, dibalut gula halus dingin berkualitas.', 120000, 450, 22, 0, 2, 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=700&q=80', 1, 1, '2026-10-17 04:31:59', '2026-10-17 04:31:59'),
  (4, 2, 'Sagu Keju Lumer 400gr', 'sagu-keju-lumer-400gr', 'Tekstur ringan langsung lumer seketika di mulut dengan aroma daun pandan wangi dan keju cheddar panggang yang gurih manis pas.', 105000, 400, 15, 0, 2, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=700&q=80', 0, 1, '2026-10-17 04:31:59', '2026-10-17 04:31:59'),
  (5, 4, 'Double Choco Almond Cookies 450gr', 'double-choco-almond-cookies-450gr', 'Dibuat dari dark chocolate couverture murni dan taburan irisan almond panggang tebal yang crunchy. Rasa cokelat kaya dan tidak terlalu manis.', 125000, 450, 14, 0, 2, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=700&q=80', 1, 1, '2026-10-17 04:31:59', '2026-10-17 04:31:59'),
  (6, 1, 'Lidah Kucing Rainbow 350gr', 'lidah-kucing-rainbow-350gr', 'Kue lidah kucing tipis, garing, dan buttery dengan warna-warni ceria yang disukai segala usia. Menggunakan pewarna makanan premium bersertifikasi BPOM & Halal.', 95000, 350, 8, 0, 2, 'https://images.unsplash.com/photo-1548848221-0c2e497ed557?auto=format&fit=crop&w=700&q=80', 0, 1, '2026-10-17 04:31:59', '2026-10-17 12:31:38'),
  (7, 3, 'Hampers De\'nish Royal Box (Isi 4 Toples - 2200gr)', 'hampers-denish-royal-box-4-toples', 'Gift box mewah laminasi gold tebal berisi 4 toples kue favorit (Nastar Wisman, Kastengel Edam, Putri Salju, Choco Almond), dilengkapi greeting card eksklusif & pita satin merah emas.', 495000, 2200, 8, 1, 3, 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=700&q=80', 1, 1, '2026-10-17 04:31:59', '2026-10-17 04:31:59'),
  (8, 3, 'Hampers Mini Blessing (Isi 2 Toples - 1100gr)', 'hampers-mini-blessing-2-toples', 'Paket hampers ringkas nan elegan berisi 2 toples pilihan (Nastar Wisman & Kastengel Keju Edam), cocok untuk gift hantaran rekan kerja dan sahabat tersayang.', 265000, 1100, 15, 1, 2, 'https://images.unsplash.com/photo-1512485800893-b09ec169739a?auto=format&fit=crop&w=700&q=80', 0, 1, '2026-10-17 04:31:59', '2026-10-17 04:31:59');

-- --------------------------------------------------------
-- Table structure for table `shipping_settings`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `shipping_settings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `store_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Denish Cookies Kitchen',
  `store_phone` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '081298765432',
  `store_address` text COLLATE utf8mb4_unicode_ci,
  `store_city` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Jakarta Timur',
  `store_lat` double NOT NULL DEFAULT '-6.225014',
  `store_lng` double NOT NULL DEFAULT '106.900447',
  `gojek_instant_rate_per_km` decimal(10,2) NOT NULL DEFAULT '3000.00',
  `gojek_instant_min_fare` decimal(10,2) NOT NULL DEFAULT '15000.00',
  `gojek_sameday_flat_under_15km` decimal(10,2) NOT NULL DEFAULT '18000.00',
  `gojek_sameday_flat_over_15km` decimal(10,2) NOT NULL DEFAULT '25000.00',
  `max_distance_gojek_km` decimal(6,2) NOT NULL DEFAULT '40.00',
  `road_distance_factor` decimal(4,2) NOT NULL DEFAULT '1.30',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `shipping_settings`
INSERT INTO `shipping_settings` (`id`, `store_name`, `store_phone`, `store_address`, `store_city`, `store_lat`, `store_lng`, `gojek_instant_rate_per_km`, `gojek_instant_min_fare`, `gojek_sameday_flat_under_15km`, `gojek_sameday_flat_over_15km`, `max_distance_gojek_km`, `road_distance_factor`, `created_at`, `updated_at`) VALUES
  (1, 'Denish Cookies Kitchen', '081298765432', 'Jl. Pahlawan Revolusi No. 42, Duren Sawit, Jakarta Timur, 13430', 'Jakarta Timur', -6.225014, 106.900447, 3000, 15000, 18000, 25000, 40, 1.3, '2026-10-17 04:31:59', '2026-10-17 04:31:59');

-- --------------------------------------------------------
-- Table structure for table `paxel_rates`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `paxel_rates` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `city_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `province` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `small_rate` decimal(10,2) NOT NULL,
  `medium_rate` decimal(10,2) NOT NULL,
  `large_rate` decimal(10,2) NOT NULL,
  `estimated_days` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '1 Hari Sampai / Sameday Cold Chain',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `paxel_rates`
INSERT INTO `paxel_rates` (`id`, `city_name`, `province`, `small_rate`, `medium_rate`, `large_rate`, `estimated_days`, `created_at`, `updated_at`) VALUES
  (1, 'Jakarta Timur', 'DKI Jakarta', 18000, 25000, 32000, 'Sameday / 1 Hari', '2026-10-17 04:31:59', '2026-10-17 04:31:59'),
  (2, 'Jakarta Selatan', 'DKI Jakarta', 18000, 25000, 32000, 'Sameday / 1 Hari', '2026-10-17 04:31:59', '2026-10-17 04:31:59'),
  (3, 'Jakarta Pusat', 'DKI Jakarta', 18000, 25000, 32000, 'Sameday / 1 Hari', '2026-10-17 04:31:59', '2026-10-17 04:31:59'),
  (4, 'Jakarta Barat', 'DKI Jakarta', 18000, 25000, 32000, 'Sameday / 1 Hari', '2026-10-17 04:31:59', '2026-10-17 04:31:59'),
  (5, 'Jakarta Utara', 'DKI Jakarta', 18000, 25000, 32000, 'Sameday / 1 Hari', '2026-10-17 04:31:59', '2026-10-17 04:31:59'),
  (6, 'Bekasi', 'Jawa Barat', 18000, 25000, 32000, 'Sameday / 1 Hari', '2026-10-17 04:31:59', '2026-10-17 04:31:59'),
  (7, 'Depok', 'Jawa Barat', 18000, 25000, 32000, 'Sameday / 1 Hari', '2026-10-17 04:31:59', '2026-10-17 04:31:59'),
  (8, 'Tangerang', 'Banten', 18000, 25000, 32000, 'Sameday / 1 Hari', '2026-10-17 04:31:59', '2026-10-17 04:31:59'),
  (9, 'Bogor', 'Jawa Barat', 20000, 28000, 36000, '1 Hari Sampai', '2026-10-17 04:31:59', '2026-10-17 04:31:59'),
  (10, 'Bandung', 'Jawa Barat', 22000, 30000, 40000, '1 Hari Sampai', '2026-10-17 04:31:59', '2026-10-17 04:31:59'),
  (11, 'Cirebon', 'Jawa Barat', 25000, 35000, 45000, '1 Hari Sampai', '2026-10-17 04:31:59', '2026-10-17 04:31:59'),
  (12, 'Semarang', 'Jawa Tengah', 25000, 35000, 45000, '1 Hari Sampai', '2026-10-17 04:31:59', '2026-10-17 04:31:59'),
  (13, 'Solo', 'Jawa Tengah', 25000, 35000, 45000, '1 Hari Sampai', '2026-10-17 04:31:59', '2026-10-17 04:31:59'),
  (14, 'Yogyakarta', 'DI Yogyakarta', 25000, 35000, 45000, '1 Hari Sampai', '2026-10-17 04:31:59', '2026-10-17 04:31:59'),
  (15, 'Surabaya', 'Jawa Timur', 28000, 38000, 50000, '1 Hari Sampai (Nextday)', '2026-10-17 04:31:59', '2026-10-17 04:31:59'),
  (16, 'Malang', 'Jawa Timur', 28000, 38000, 50000, '1 Hari Sampai (Nextday)', '2026-10-17 04:31:59', '2026-10-17 04:31:59'),
  (17, 'Denpasar', 'Bali', 35000, 48000, 65000, '1-2 Hari Cold Chain', '2026-10-17 04:31:59', '2026-10-17 04:31:59'),
  (18, 'Medan', 'Sumatera Utara', 45000, 60000, 85000, '2 Hari Sampai', '2026-10-17 04:31:59', '2026-10-17 04:31:59'),
  (19, 'Makassar', 'Sulawesi Selatan', 45000, 65000, 90000, '2 Hari Sampai', '2026-10-17 04:31:59', '2026-10-17 04:31:59');

-- --------------------------------------------------------
-- Table structure for table `user_addresses`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_addresses` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `label` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Rumah',
  `recipient_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_address` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `province` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DKI Jakarta',
  `city_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Jakarta Timur',
  `postal_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `is_in_city` tinyint(1) NOT NULL DEFAULT '0',
  `is_default` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_addresses_user_id_foreign` (`user_id`),
  CONSTRAINT `user_addresses_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `user_addresses`
INSERT INTO `user_addresses` (`id`, `user_id`, `label`, `recipient_name`, `phone`, `full_address`, `province`, `city_name`, `postal_code`, `latitude`, `longitude`, `is_in_city`, `is_default`, `created_at`, `updated_at`) VALUES
  (1, 2, 'Rumah (Jakarta Timur)', 'Budi Santoso', '081311223344', 'Jl. Robusta Raya Blok Q3 No. 18, Pondok Kopi, Duren Sawit', 'DKI Jakarta', 'Jakarta Timur', '13460', -6.22854, 106.94318, 1, 1, '2026-10-17 04:31:59', '2026-10-17 04:31:59'),
  (2, 2, 'Kantor (Bandung)', 'Budi Santoso (Kantor)', '081311223344', 'Jl. R.E. Martadinata No. 55, Citarum, Bandung Wetan', 'Jawa Barat', 'Bandung', '40115', -6.90782, 107.61895, 0, 0, '2026-10-17 04:31:59', '2026-10-17 04:31:59');

-- --------------------------------------------------------
-- Table structure for table `orders`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `orders` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL UNIQUE,
  `user_id` bigint unsigned DEFAULT NULL,
  `recipient_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `recipient_phone` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `shipping_address` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `shipping_city` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `shipping_province` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `shipping_postal_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shipping_lat` double DEFAULT NULL,
  `shipping_lng` double DEFAULT NULL,
  `courier_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `courier_service_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `distance_km` decimal(8,2) DEFAULT NULL,
  `total_weight_grams` int NOT NULL,
  `box_breakdown` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `shipping_cost` decimal(10,2) NOT NULL,
  `gross_amount` decimal(12,2) NOT NULL,
  `payment_status` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `order_status` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `snap_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tracking_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `paid_at` timestamp NULL DEFAULT NULL,
  `shipped_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `orders_user_id_foreign` (`user_id`),
  CONSTRAINT `orders_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `orders`
INSERT INTO `orders` (`id`, `order_number`, `user_id`, `recipient_name`, `recipient_phone`, `shipping_address`, `shipping_city`, `shipping_province`, `shipping_postal_code`, `shipping_lat`, `shipping_lng`, `courier_type`, `courier_service_name`, `distance_km`, `total_weight_grams`, `box_breakdown`, `subtotal`, `shipping_cost`, `gross_amount`, `payment_status`, `order_status`, `snap_token`, `tracking_number`, `notes`, `paid_at`, `shipped_at`, `completed_at`, `created_at`, `updated_at`) VALUES
  (1, 'DC-20261016-A101', 2, 'Budi Santoso', '081311223344', 'Jl. Robusta Raya Blok Q3 No. 18, Pondok Kopi, Duren Sawit', 'Jakarta Timur', 'DKI Jakarta', '13460', -6.22854, 106.94318, 'gojek_instant', 'Gojek Instant Driver (6.2 km)', 6.2, 1000, 'Paper Bag De\'nish + Bubble Wrap', 280000, 18600, 298600, 'paid', 'shipped', NULL, 'GK-98234-JKT', 'Tolong titip di pos satpam bila rumah kosong.', '2026-10-16 04:31:59', '2026-10-16 23:31:59', NULL, '2026-10-17 04:31:59', '2026-10-17 04:31:59'),
  (2, 'DC-20261017-B202', 2, 'Ibu Ratna Dewi', '081288776655', 'Jl. R.E. Martadinata No. 55, Citarum, Bandung Wetan', 'Bandung', 'Jawa Barat', '40115', -6.90782, 107.61895, 'paxel', 'Paxel Delivery (1 Box Large)', NULL, 2200, '1 Box Large (Kapasitas s/d 5 kg)', 495000, 40000, 535000, 'paid', 'processing', NULL, 'PXL-BDG-2026101701', 'Untuk hadiah ulang tahun mertua. Mohon dipastikan aman.', '2026-10-17 02:32:00', NULL, NULL, '2026-10-17 04:32:00', '2026-10-17 04:32:00'),
  (3, 'DC-20261017-LK4T', NULL, 'Security Audit Tester', '081234567890', 'Jl. Audit Keamanan No. 1', 'Jakarta Timur', 'DKI Jakarta', '13430', -6.22854, 106.94318, 'gojek_instant', 'Gojek Instant Driver', 6.16, 350, NULL, 95000, 21000, 116000, 'paid', 'paid', 'SNAP-MOCK-I8OUMDOFR93Q7YSWALWNNUIJ', NULL, 'Harap handle with care', '2026-10-17 12:31:08', NULL, NULL, '2026-10-17 12:31:08', '2026-10-17 12:31:08'),
  (4, 'DC-20261017-YM1O', NULL, 'Security Audit Tester', '081234567890', 'Jl. Audit Keamanan No. 1', 'Jakarta Timur', 'DKI Jakarta', '13430', -6.22854, 106.94318, 'gojek_instant', 'Gojek Instant Driver', 6.16, 350, NULL, 95000, 21000, 116000, 'pending', 'pending', 'SNAP-MOCK-6I2A0QTFMNMDYSHTTYHTFEQH', NULL, 'Harap handle with care', NULL, NULL, NULL, '2026-10-17 12:31:24', '2026-10-17 12:31:24'),
  (5, 'DC-20261017-WKS7', NULL, 'Security Audit Tester', '081234567890', 'Jl. Audit Keamanan No. 1', 'Jakarta Timur', 'DKI Jakarta', '13430', -6.22854, 106.94318, 'gojek_instant', 'Gojek Instant Driver', 6.16, 350, NULL, 95000, 21000, 116000, 'paid', 'paid', 'SNAP-MOCK-ICI0XJPAR2HUAPXLR1TCNKMQ', NULL, 'Harap handle with care', '2026-10-17 12:31:38', NULL, NULL, '2026-10-17 12:31:38', '2026-10-17 12:31:38');

-- --------------------------------------------------------
-- Table structure for table `order_items`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint unsigned NOT NULL,
  `product_id` bigint unsigned NOT NULL,
  `product_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_price` decimal(12,2) NOT NULL,
  `product_weight_grams` int NOT NULL,
  `quantity` int NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `is_preorder` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_items_order_id_foreign` (`order_id`),
  CONSTRAINT `order_items_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `order_items`
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `product_price`, `product_weight_grams`, `quantity`, `subtotal`, `is_preorder`, `created_at`, `updated_at`) VALUES
  (1, 1, 1, 'Nastar Wisman Spesial 500gr', 135000, 500, 1, 135000, 0, '2026-10-17 04:31:59', '2026-10-17 04:31:59'),
  (2, 1, 2, 'Kastengel Keju Edam 500gr', 145000, 500, 1, 145000, 0, '2026-10-17 04:31:59', '2026-10-17 04:31:59'),
  (3, 2, 7, 'Hampers De\'nish Royal Box (Isi 4 Toples - 2200gr)', 495000, 2200, 1, 495000, 1, '2026-10-17 04:32:00', '2026-10-17 04:32:00'),
  (4, 3, 6, 'Lidah Kucing Rainbow 350gr', 95000, 350, 1, 95000, 0, '2026-10-17 12:31:08', '2026-10-17 12:31:08'),
  (5, 4, 6, 'Lidah Kucing Rainbow 350gr', 95000, 350, 1, 95000, 0, '2026-10-17 12:31:24', '2026-10-17 12:31:24'),
  (6, 5, 6, 'Lidah Kucing Rainbow 350gr', 95000, 350, 1, 95000, 0, '2026-10-17 12:31:38', '2026-10-17 12:31:38');

-- --------------------------------------------------------
-- Table structure for table `personal_access_tokens`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL UNIQUE,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `personal_access_tokens`
INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
  (1, 'App\\Models\\User', 1, 'auth_token', 'dbf5226d5e83a29782c8bb0c4f803a5310380ae4dba503fdcfbcf35c0b74dab6', '["*"]', '2026-10-17 12:52:18', NULL, '2026-10-17 12:00:53', '2026-10-17 12:52:18'),
  (2, 'App\\Models\\User', 1, 'auth_token', '6a77330e77336f640e46a7029a08646950dd4631c65744f176f27a0a0c8ce9f9', '["*"]', '2026-10-17 13:07:24', NULL, '2026-10-17 12:52:26', '2026-10-17 13:07:24');

SET FOREIGN_KEY_CHECKS = 1;
-- Dump completed.