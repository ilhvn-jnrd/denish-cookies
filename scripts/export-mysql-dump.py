#!/usr/bin/env python3
"""
Exports SQLite seeded database into a clean, ready-to-import MySQL dump file
compatible with Hostinger phpMyAdmin (MySQL 5.7 / 8.0 / MariaDB).
"""

import sqlite3
import os

def export_mysql(sqlite_path, output_sql_path):
    conn = sqlite3.connect(sqlite_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    sql_lines = [
        "-- De'nish Cookies - Ready-to-import MySQL Database Dump for Hostinger",
        "-- Compatible with MySQL 5.7+ / MySQL 8.0+ / MariaDB",
        "-- Generated automatically",
        "",
        "SET NAMES utf8mb4;",
        "SET FOREIGN_KEY_CHECKS = 0;",
        "SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';",
        "",
    ]

    # Tables in order of foreign key dependency
    TABLES_DDL = {
        'migrations': """
CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
""",
        'users': """
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
""",
        'categories': """
CREATE TABLE IF NOT EXISTS `categories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL UNIQUE,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
""",
        'products': """
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
""",
        'shipping_settings': """
CREATE TABLE IF NOT EXISTS `shipping_settings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `store_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'De\\'nish Cookies Kitchen',
  `store_phone` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '088218106303',
  `store_address` text COLLATE utf8mb4_unicode_ci,
  `store_city` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Kota Bandung',
  `store_lat` double NOT NULL DEFAULT '-6.917547878001074',
  `store_lng` double NOT NULL DEFAULT '107.6634056367421',
  `gojek_instant_rate_per_km` decimal(10,2) NOT NULL DEFAULT '4000.00',
  `gojek_instant_min_fare` decimal(10,2) NOT NULL DEFAULT '15000.00',
  `gojek_sameday_flat_under_15km` decimal(10,2) NOT NULL DEFAULT '18000.00',
  `gojek_sameday_flat_over_15km` decimal(10,2) NOT NULL DEFAULT '25000.00',
  `max_distance_gojek_km` decimal(6,2) NOT NULL DEFAULT '40.00',
  `road_distance_factor` decimal(4,2) NOT NULL DEFAULT '1.30',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
""",
        'paxel_rates': """
CREATE TABLE IF NOT EXISTS `paxel_rates` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `city_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `province` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `small_rate` decimal(10,2) NOT NULL,
  `medium_rate` decimal(10,2) NOT NULL,
  `large_rate` decimal(10,2) NOT NULL,
  `estimated_days` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pengiriman Reguler / Luar Kota',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
""",
        'user_addresses': """
CREATE TABLE IF NOT EXISTS `user_addresses` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `label` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Rumah',
  `recipient_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_address` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `province` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Jawa Barat',
  `city_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Kota Bandung',
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
""",
        'orders': """
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
""",
        'order_items': """
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
""",
        'personal_access_tokens': """
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
"""
    }

    for table_name, ddl in TABLES_DDL.items():
        sql_lines.append(f"-- --------------------------------------------------------")
        sql_lines.append(f"-- Table structure for table `{table_name}`")
        sql_lines.append(f"-- --------------------------------------------------------")
        sql_lines.append(ddl.strip())
        sql_lines.append("")

        # Fetch rows
        try:
            cursor.execute(f"SELECT * FROM {table_name}")
            rows = cursor.fetchall()
            if rows:
                col_names = [col[0] for col in cursor.description]
                cols_str = ", ".join([f"`{c}`" for c in col_names])

                sql_lines.append(f"-- Dumping data for table `{table_name}`")
                sql_lines.append(f"INSERT INTO `{table_name}` ({cols_str}) VALUES")

                value_strs = []
                for row in rows:
                    vals = []
                    for v in row:
                        if v is None:
                            vals.append("NULL")
                        elif isinstance(v, (int, float)):
                            vals.append(str(v))
                        else:
                            escaped = str(v).replace("\\", "\\\\").replace("'", "\\'").replace("\n", "\\n").replace("\r", "\\r")
                            vals.append(f"'{escaped}'")
                    value_strs.append(f"  ({', '.join(vals)})")

                sql_lines.append(",\n".join(value_strs) + ";")
                sql_lines.append("")
        except sqlite3.OperationalError:
            pass

    sql_lines.append("SET FOREIGN_KEY_CHECKS = 1;")
    sql_lines.append("-- Dump completed.")

    with open(output_sql_path, 'w', encoding='utf-8') as f:
        f.write("\n".join(sql_lines))

    print(f"[+] MySQL dump created successfully at: {output_sql_path}")

if __name__ == '__main__':
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    sqlite_file = os.path.join(base_dir, 'backend', 'database', 'database.sqlite')
    sql_out = os.path.join(base_dir, 'backend', 'database', 'denish_cookies_mysql.sql')
    export_mysql(sqlite_file, sql_out)
