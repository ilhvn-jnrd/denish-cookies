import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Truck, Package, RotateCcw, AlertTriangle, Video, MapPin, Phone, Mail } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kebijakan Pengiriman & Pengembalian | De\'nish Cookies Bandung',
  description: 'Informasi pengiriman Gojek Instant Bandung, Paxel Luar Kota, dan prosedur klaim garansi pengembalian dengan video unboxing.',
};

export default function KebijakanPengirimanPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
        <Link href="/" className="hover:text-brand-red transition flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Beranda
        </Link>
        <span>/</span>
        <span className="text-brand-indigo font-bold">Kebijakan Pengiriman &amp; Pengembalian</span>
      </div>

      {/* Header */}
      <div className="border-b border-amber-200/60 pb-6 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold">
          <Truck className="w-3.5 h-3.5 text-blue-600" /> Logistik &amp; Garansi Kepuasan
        </div>
        <h1 className="font-heading font-black text-2xl sm:text-4xl text-brand-indigo">
          Kebijakan Pengiriman &amp; Pengembalian
        </h1>
        <p className="text-xs sm:text-sm text-gray-600">
          Terakhir diperbarui: 17 Oktober 2026. Prosedur logistik aman dan perlindungan konsumen De&apos;nish Cookies.
        </p>
      </div>

      {/* Main Content */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-amber-100 shadow-cookie space-y-8 text-xs sm:text-sm text-gray-700 leading-relaxed">
        {/* Pengiriman Dalam Kota */}
        <section className="space-y-3">
          <h2 className="font-heading font-bold text-lg text-brand-indigo flex items-center gap-2">
            1. Pengiriman Dalam Kota (Bandung &amp; Sekitarnya)
          </h2>
          <p>
            Untuk area Kota Bandung, Cimahi, dan sekitarnya (radius hingga 40 km dari Kitchen Antapani), kami menyediakan pengiriman kurir roda dua terpercaya:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl space-y-1.5">
              <span className="font-bold text-emerald-950 block text-xs uppercase tracking-wide">
                Gojek Instant Courier
              </span>
              <p className="text-xs text-emerald-900">
                Waktu tiba 1–3 jam setelah pesanan siap. Tarif dihitung otomatis via GPS yaitu Rp 4.000/km (minimal Rp 15.000) dengan kapasitas beban maksimal 20 kg.
              </p>
            </div>
            <div className="p-4 bg-blue-50/60 border border-blue-200/80 rounded-2xl space-y-1.5">
              <span className="font-bold text-blue-950 block text-xs uppercase tracking-wide">
                Gojek SameDay
              </span>
              <p className="text-xs text-blue-900">
                Pengantaran di hari yang sama dengan tarif flat terjangkau: Rp 18.000 (jarak &le; 15 km) dan Rp 25.000 (jarak 15–40 km), kapasitas maksimal 7 kg.
              </p>
            </div>
          </div>
        </section>

        {/* Pengiriman Luar Kota */}
        <section className="space-y-3">
          <h2 className="font-heading font-bold text-lg text-brand-indigo flex items-center gap-2">
            2. Pengiriman Luar Kota (Paxel Food-Safe Delivery)
          </h2>
          <p>
            Untuk pengiriman ke seluruh kota di Pulau Jawa, Bali, Sumatera, dan wilayah lainnya, kami menggunakan ekspedisi spesialis makanan <strong>Paxel</strong>:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Kemasan Khusus Safe-Box:</strong> Setiap toples dilapisi bubble wrap tebal dan ditempatkan ke dalam box kardus kaku khusus agar toples tidak berbenturan.
            </li>
            <li>
              <strong>Fasilitas Rantai Dingin (Cold Chain):</strong> Paket disimpan pada suhu terkendali di hub Paxel agar kualitas butter Anchor dan keju tidak meleleh atau rusak selama transit.
            </li>
            <li>
              <strong>Sistem Split Box Otomatis:</strong> Pesanan dengan berat di atas 5 kg otomatis dibagi menjadi beberapa kardus terpisah oleh sistem kami agar kue di bagian bawah tidak tertindih beban berat.
            </li>
          </ul>
        </section>

        {/* Kebijakan Refund & Video Unboxing */}
        <section className="space-y-3">
          <h2 className="font-heading font-bold text-lg text-brand-indigo flex items-center gap-2">
            3. Kebijakan Pengembalian Dana (Refund) &amp; Penggantian Produk
          </h2>
          <p>
            Kualitas produk dan kepuasan Anda adalah prioritas utama kami. Kami memberikan garansi penggantian toples baru atau pengembalian dana penuh jika Anda menerima kue dalam kondisi rusak parah, toples pecah, atau varian yang dikirim tidak sesuai pesanan.
          </p>

          <div className="bg-rose-50 p-5 rounded-2xl border border-rose-200 space-y-3">
            <div className="flex items-center gap-2 text-brand-red font-bold text-xs uppercase tracking-wide">
              <Video className="w-4 h-4 flex-shrink-0" />
              Syarat Wajib: Rekaman Video Unboxing Utuh
            </div>
            <p className="text-xs text-rose-950 leading-relaxed">
              Mengingat kue kering adalah produk pangan olahan rapuh, klaim komplain <strong>WAJIB menyertakan video unboxing utuh</strong> dengan ketentuan berikut:
            </p>
            <ol className="list-decimal pl-5 space-y-1.5 text-xs text-rose-900">
              <li>Video direkam mulai dari paket tersegel rapi dengan resi pengiriman yang terbaca jelas.</li>
              <li>Rekaman tidak terpotong (tanpa pause) dan tanpa hasil editan hingga seluruh toples dikeluarkan dan diperiksa.</li>
              <li>Klaim diajukan maksimal <strong>1 x 24 jam</strong> sejak status resi dinyatakan <em>Delivered</em> oleh kurir.</li>
            </ol>
          </div>

          <p className="text-xs text-gray-600">
            Klaim tidak dapat diproses apabila tidak menyertakan rekaman video unboxing sesuai ketentuan di atas atau diajukan setelah melebihi batas waktu 1x24 jam.
          </p>
        </section>

        {/* Prosedur Pengajuan Klaim */}
        <section className="space-y-3">
          <h2 className="font-heading font-bold text-lg text-brand-indigo flex items-center gap-2">
            4. Prosedur Pengajuan Klaim
          </h2>
          <p>Untuk mengajukan klaim kerusakan atau salah kirim, silakan ikuti langkah mudah berikut:</p>
          <ol className="list-decimal pl-5 space-y-1 text-xs">
            <li>Hubungi WhatsApp Customer Service De&apos;nish Cookies di <strong>+62 882-1810-6303</strong>.</li>
            <li>Sebutkan <strong>Nomor Pesanan</strong> (contoh: <code>ORD-20261017-XXXX</code>).</li>
            <li>Kirimkan file rekaman video unboxing dan foto detail kendala toples yang dialami.</li>
            <li>Tim kami akan memverifikasi klaim Anda dalam waktu maksimal 1x12 jam kerja dan segera memproses penggantian toples baru atau pengembalian dana.</li>
          </ol>
        </section>

        {/* Official Identity */}
        <section className="space-y-3 pt-4 border-t border-gray-100">
          <h2 className="font-heading font-bold text-lg text-brand-indigo flex items-center gap-2">
            5. Informasi Layanan Pelanggan &amp; Dapur
          </h2>
          <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/70 space-y-1.5 text-xs text-brand-indigo">
            <p className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-red flex-shrink-0" />
              <strong>Kitchen Resmi:</strong> Jl. Cibatu Raya No. 55, Kel. Antapani Tengah, Kec. Antapani, Kota Bandung, Jawa Barat 40291
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <strong>WhatsApp CS:</strong> +62 882-1810-6303
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <strong>Email:</strong> denishcookie@gmail.com
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
