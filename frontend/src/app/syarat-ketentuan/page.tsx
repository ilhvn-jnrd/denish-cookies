import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, FileText, CreditCard, Clock, Phone, Mail, MapPin } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan Pemesanan | De\'nish Cookies Bandung',
  description: 'Syarat dan ketentuan pemesanan kue kering, pembayaran QRIS Midtrans, dan pemesanan Pre-Order di De\'nish Cookies.',
};

export default function SyaratKetentuanPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
        <Link href="/" className="hover:text-brand-red transition flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Beranda
        </Link>
        <span>/</span>
        <span className="text-brand-indigo font-bold">Syarat &amp; Ketentuan</span>
      </div>

      {/* Header */}
      <div className="border-b border-amber-200/60 pb-6 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
          <FileText className="w-3.5 h-3.5 text-brand-red" /> Dokumen Legal Resmi
        </div>
        <h1 className="font-heading font-black text-2xl sm:text-4xl text-brand-indigo">
          Syarat &amp; Ketentuan Layanan
        </h1>
        <p className="text-xs sm:text-sm text-gray-600">
          Terakhir diperbarui: 17 Oktober 2026. Berlaku untuk seluruh transaksi di platform resmi De&apos;nish Cookies.
        </p>
      </div>

      {/* Main Content */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-amber-100 shadow-cookie space-y-8 text-xs sm:text-sm text-gray-700 leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-heading font-bold text-lg text-brand-indigo flex items-center gap-2">
            1. Identitas Pelaku Usaha
          </h2>
          <p>
            Website ini dikelola secara resmi oleh <strong>De&apos;nish Cookies</strong>, usaha produsen kue kering homemade premium yang berdomisili di Kota Bandung:
          </p>
          <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/70 space-y-1.5 text-xs text-brand-indigo">
            <p className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-red flex-shrink-0" />
              <strong>Alamat Kitchen:</strong> Jl. Cibatu Raya No. 55, Kel. Antapani Tengah, Kec. Antapani, Kota Bandung, Jawa Barat 40291
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <strong>WhatsApp Resmi:</strong> +62 882-1810-6303
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <strong>Email:</strong> denishcookie@gmail.com
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading font-bold text-lg text-brand-indigo flex items-center gap-2">
            2. Ketentuan Pemesanan &amp; Produk
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Produk Ready Stock:</strong> Produk berlabel Ready Stock akan diproses, dikemas, dan diserahkan kepada kurir dalam waktu 1x24 jam kerja setelah pembayaran terkonfirmasi.
            </li>
            <li>
              <strong>Produk Pre-Order (PO):</strong> Untuk menjaga kesegaran dan kerenyahan, beberapa varian dipanggang berdasarkan pesanan (made by order). Estimasi pengerjaan 1–3 hari kerja atau sesuai tanggal kesepakatan hampers hari raya.
            </li>
            <li>
              <strong>Spesifikasi &amp; Berat:</strong> Seluruh toples diisi sesuai bobot netto yang tertera pada detail produk dengan toleransi alami pemanggangan &plusmn;5%.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading font-bold text-lg text-brand-indigo flex items-center gap-2">
            3. Metode Pembayaran &amp; Biaya Layanan QRIS
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              Seluruh transaksi pembayaran digital diproses melalui gerbang pembayaran resmi <strong>Midtrans Payment Gateway</strong> (PT Midtrans) yang berlisensi Bank Indonesia.
            </li>
            <li>
              Metode pembayaran yang didukung meliputi QRIS (semua e-wallet dan mobile banking), Virtual Account Bank (BCA, Mandiri, BNI, BRI, Permata), dan GoPay/ShopeePay.
            </li>
            <li>
              <strong>Biaya Layanan Pembayaran (QRIS 0.7%):</strong> Transaksi menggunakan metode QRIS dikenakan biaya MDR / layanan sebesar <strong>0.7%</strong> yang dihitung dari total penjumlahan nilai produk dan ongkos kirim (rumus: <code>Math.ceil((subtotal + shippingCost) * 0.007)</code>). Biaya ini transparan dan ditampilkan di rincian sebelum pembayaran dilakukan.
            </li>
            <li>
              Pesanan akan otomatis dibatalkan oleh sistem jika pembayaran tidak diselesaikan sebelum batas waktu kedaluwarsa sesi pembayaran online berakhir.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading font-bold text-lg text-brand-indigo flex items-center gap-2">
            4. Pembatalan &amp; Perubahan Pesanan
          </h2>
          <p>
            Pesanan yang telah berstatus <em>Diproses</em> atau <em>Dikirim</em> tidak dapat dibatalkan secara sepihak oleh pembeli karena kue sudah masuk dapur pemanggangan atau telah diserahkan kepada kurir ekspedisi.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading font-bold text-lg text-brand-indigo flex items-center gap-2">
            5. Hubungi Layanan Pelanggan
          </h2>
          <p>
            Jika Anda memiliki pertanyaan mengenai syarat dan ketentuan ini, silakan hubungi tim dukungan kami melalui WhatsApp resmi di{' '}
            <a
              href="https://wa.me/6288218106303"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-red font-bold hover:underline"
            >
              +62 882-1810-6303
            </a>{' '}
            atau email ke <strong>denishcookie@gmail.com</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}
