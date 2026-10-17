# 🍪 De'nish Cookies — E-Commerce Web Application (Monorepo)

> **"Making Taste Better"** &bull; **"Premium Homemade Cookies"**  
> Web Aplikasi E-Commerce lengkap, modern, dan production-ready untuk UMKM Bakery **De'nish Cookies**. Dilengkapi integrasi kurir khusus kue (**Gojek Dalam Kota** & **Paxel Luar Kota**), **Peta Interaktif Leaflet + OpenStreetMap (100% Gratis Tanpa API Key Google)**, serta payment gateway **Midtrans Snap** (dengan fallback Sandbox Mock Simulator untuk demo instan).

---

## 🏗️ 1. Arsitektur Monorepo & Tech Stack

```text
denish-cookies/
├── backend/                   # Laravel 11 REST API (PHP 8.2+)
│   ├── app/
│   │   ├── Http/Controllers/  # Auth, Product, Shipping, Order, Admin, Webhook
│   │   ├── Models/            # User, Product, Category, PaxelRate, Order, etc.
│   │   └── Services/          # ShippingCalculatorService, MidtransService
│   ├── database/              # Migrations, Seeders (SQLite / MySQL)
│   ├── routes/api.php         # 32 Endpoints REST API
│   ├── .env.example           # Konfigurasi siap pakai lokal & Hostinger
│   └── artisan
│
├── frontend/                  # Next.js 14 (App Router, TypeScript, Tailwind CSS)
│   ├── src/
│   │   ├── app/               # Storefront, Checkout, Orders, Profile, Admin Panel
│   │   ├── components/        # LeafletMapPicker, PaymentModal, ShippingLabelModal, etc.
│   │   ├── context/           # AuthContext (Sanctum), CartContext (Weight & Totals)
│   │   └── lib/               # api.ts (Bearer client), formatters.ts
│   ├── public/                # logo.jpg (Logo resmi De'nish Cookies)
│   ├── tailwind.config.ts     # Brand Design System (Palette #FFD100, #2E1A7A, #E32636)
│   └── package.json
│
├── .gitignore                 # Bersih dari vendor, node_modules, cache, & .env
└── README.md                  # Dokumentasi lengkap & Panduan Hostinger
```

### Stack Teknologi:
- **Backend:** Laravel 11, PHP 8.2+, SQLite (Local Out-of-the-Box) / MySQL (Hostinger Production), Laravel Sanctum (Bearer Token Auth), Guzzle HTTP.
- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons, Leaflet & React-Leaflet (OpenStreetMap GPS Picker).
- **Payment Gateway:** Midtrans Snap API (Production & Sandbox ready + Built-in Local Demo Simulation).
- **Logistics Engine:** Custom Distance Engine (Haversine Formula * 1.3x Road Factor) untuk Gojek & Automated Tier/Multi-Box Splitting untuk Paxel.

---

## 🎨 2. Identitas Brand & Design System

Diturunkan langsung dari logo resmi **De'nish Cookies**:
- **Brand Yellow (`#FFD100`):** Butter-gold hangat dari latar logo. Digunakan untuk aksen hero, tombol highlight, cart trigger, dan doodle kue.
- **Brand Indigo (`#2E1A7A`):** Deep royal purple/indigo dari monogram "dc" dan tipografi logo. Digunakan untuk navbar, heading, footer, dan kartu terstruktur.
- **Brand Red (`#E32636`):** Crimson red dari kurva "c" logo. Digunakan untuk badge "Best Seller", tombol checkout utama, dan aksen harga.
- **Brand Cream (`#FFFDF5` & `#FFF9E6`):** Latar belakang warm buttery off-white agar foto toples kue tampak menggugah selera.
- **Tipografi:** Google Fonts *Fredoka* (Rounded Playful Headings) dan *Plus Jakarta Sans* (Clean Body UI).

---

## 🚚 3. Core Business Logic: Mesin Ongkos Kirim (Shipping Engine)

De'nish Cookies tidak menggunakan kurir reguler sembarangan untuk mencegah kue hancur. Pengiriman ditangani oleh 2 kurir khusus:

### A. Gojek Dalam Kota (Intra-City / Radius &le; 40 km)
- Titik koordinat dapur disimpan di tabel `shipping_settings` (Antapani Tengah, Kota Bandung: `-6.917547878001074, 107.6634056367421`).
- Jarak dihitung akurat dari koordinat GPS pin Leaflet pelanggan menggunakan **Haversine Great-Circle Formula** dikalikan **1.3x Road Factor** (representasi rute jalan riil).
1. **Gojek Instant:** Maksimal 20 kg (`20.000 gram`). Tarif = `max(Rp 15.000, ceil(jarak_km) * Rp 4.000)`. Tiba dalam 1-3 jam.
2. **Gojek SameDay:** Maksimal 7 kg (`7.000 gram`). Tarif flat: jarak &le; 15 km = Rp 18.000, jarak 15 - 40 km = Rp 25.000.

### B. Paxel Luar Kota (Inter-City / Cold-Chain & Safe Box)
- Menjangkau 15+ kota besar di Pulau Jawa, Bali, Medan, dan Makassar.
- Menggunakan perhitungan berat keranjang otomatis:
  - **Tier 1 (&le; 1.5 kg):** Digunakan tarif `small_rate` (1 Box Small).
  - **Tier 2 (1.51 - 3.0 kg):** Digunakan tarif `medium_rate` (1 Box Medium).
  - **Tier 3 (3.01 - 5.0 kg):** Digunakan tarif `large_rate` (1 Box Large).
  - **Tier 4 (> 5.0 kg / Multi-Box Split):** Otomatis dipecah menjadi box kelipatan 5 kg + sisa tier box (Contoh: pesanan 6.5 kg = `1 Box Large (5kg) + 1 Box Small (1.5kg)`).

---

## 💳 4. Integrasi Midtrans Snap & Sandbox Mock

1. **Midtrans Snap Ready:**
   - Endpoint `POST /api/checkout` membuat Snap Token resmi via Midtrans API.
   - Webhook `POST /api/webhooks/midtrans` memverifikasi `signature_key` (SHA512) dan memotong stok produk secara idempoten (`paid_at` dicatat).
2. **Built-in Local Demo / Mock Simulator:**
   - Jika `MIDTRANS_SERVER_KEY` bernilai `sandbox-mock` atau belum diisi, frontend secara otomatis menampilkan modal pembayaran simulasi (QRIS, BCA VA, GoPay).
   - Menekan tombol *"Simulasi Bayar Sekarang (Lunas)"* akan langsung menandai pesanan lunas dan memotong stok untuk demonstrasi klien tanpa memerlukan akun Midtrans aktif!

---

## 🚀 5. Cara Menjalankan di Localhost

### Prasyarat:
- PHP 8.2 atau lebih baru
- Composer 2.x
- Node.js 18+ & npm

### Langkah 1: Jalankan Backend (Laravel)
```bash
cd backend

# 1. Salin environment
copy .env.example .env

# 2. Database SQLite lokal sudah terkonfigurasi otomatis
# Jalankan migrasi dan seeder data awal
php artisan migrate --seed

# 3. Jalankan server API backend
php artisan serve
```
Backend API akan berjalan di: **`http://localhost:8000`**

### Langkah 2: Jalankan Frontend (Next.js)
Buka terminal baru di root:
```bash
cd frontend

# Jalankan server frontend
npm run dev
```
Frontend Web App akan berjalan di: **`http://localhost:3000`**

---

## 🔑 Akun Demo Default (Database Seeder)

| Peran | Email | Password | Keterangan |
| :--- | :--- | :--- | :--- |
| **Admin Bakery** | `admin@denishcookies.com` | `password123` | Akses penuh ke `/admin` (KPI, Stok, Resi, Cetak Label) |
| **Pelanggan** | `pembeli@gmail.com` | `password123` | Alamat rumah Jakarta & kantor Bandung sudah tersimpan |

*(Tersedia tombol **1-Click Demo Login** di halaman `/login` untuk kemudahan uji coba).*

---

## 🏷️ Fitur Cetak Label Pengiriman (Shipping Label)
Di Admin Panel (`/admin/orders`), klik tombol **"Cetak Label Kirim"**:
- Diformat rapi siap cetak kertas thermal / A6.
- Menampilkan data Pengirim (De'nish Cookies Kitchen Duren Sawit), Penerima, No. WA, Alamat Lengkap, Kurir, No. Resi, Total Berat, dan Rincian Box.
- Dilengkapi badge mencolok: **`FRAGILE — KUE KERING MUDAH HANCUR / JANGAN DIBANTING`**.

---

## 🌐 6. Panduan Deployment ke Hostinger Unlimited Web Hosting

Hostinger Unlimited Web Hosting mendukung penuh **PHP 8.2+ (Laravel)** dan fitur **Node.js Web Apps**.

### A. Deploy Backend (Laravel 11) ke Hostinger
1. Buat database MySQL di **hPanel > Databases > MySQL Databases** (catat nama DB, username, dan password).
2. Upload isi folder `/backend` ke folder di luar `public_html` (misal: `/home/u123456789/denish-backend`).
3. Pindahkan file dan folder yang ada di `/backend/public/*` ke `public_html/api` (atau subdomain `api.denishcookies.com`).
4. Sesuaikan `index.php` pada folder public agar mengarah ke path backend:
   ```php
   require __DIR__.'/../denish-backend/vendor/autoload.php';
   $app = require_once __DIR__.'/../denish-backend/bootstrap/app.php';
   ```
5. Ubah file `.env` di Hostinger:
   ```env
   APP_ENV=production
   APP_DEBUG=false
   APP_URL=https://api.denishcookies.com
   FRONTEND_URL=https://denishcookies.com

   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=u123456789_denish
   DB_USERNAME=u123456789_user
   DB_PASSWORD=password_mysql_hostinger_anda

   MIDTRANS_SERVER_KEY=Mid-server-xxxxxxxxx
   MIDTRANS_CLIENT_KEY=Mid-client-xxxxxxxxx
   MIDTRANS_IS_PRODUCTION=true
   ```
6. Jalankan migrasi via SSH:
   ```bash
   php artisan migrate --seed --force
   php artisan config:cache
   php artisan route:cache
   ```

### B. Deploy Frontend (Next.js) ke Hostinger
1. Masuk ke **hPanel > Node.js Web Apps**.
2. Klik **Create Application**:
   - **Node.js version:** Pilih 18.x atau 20.x.
   - **Application root:** `/home/u123456789/public_html` (atau subdomain).
   - **Application startup file:** `node_modules/next/dist/bin/next` dengan argument `start` (atau buat script `server.js`).
3. Set environment variable di hPanel:
   - `NEXT_PUBLIC_API_URL=https://api.denishcookies.com/api`
   - `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=Mid-client-xxxxxxxxx`
4. Jalankan `npm install` dan `npm run build` di terminal SSH Hostinger.

---

## 📦 7. Git & Commit Guidelines

Proyek ini telah dikonfigurasi dengan root `.gitignore` yang bersih:
```bash
git add .
git commit -m "feat: complete production-ready De'nish Cookies e-commerce monorepo"
git push -u origin main
```
Repository remote: `https://github.com/ilhvn-jnrd/denish-cookies`
