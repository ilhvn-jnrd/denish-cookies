import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, MapPin, Phone, Mail } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kebijakan Privasi | De\'nish Cookies Bandung',
  description: 'Kebijakan Privasi perlindungan data pribadi, koordinat pengiriman, dan keamanan pembayaran di De\'nish Cookies.',
};

export default function KebijakanPrivasiPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
        <Link href="/" className="hover:text-brand-red transition flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Beranda
        </Link>
        <span>/</span>
        <span className="text-brand-indigo font-bold">Kebijakan Privasi</span>
      </div>

      {/* Header */}
      <div className="border-b border-amber-200/60 pb-6 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Perlindungan Data Pelanggan
        </div>
        <h1 className="font-heading font-black text-2xl sm:text-4xl text-brand-indigo">
          Kebijakan Privasi
        </h1>
        <p className="text-xs sm:text-sm text-gray-600">
          Terakhir diperbarui: 17 Oktober 2026. Komitmen De&apos;nish Cookies dalam menjaga kerahasiaan data Anda.
        </p>
      </div>

      {/* Main Content */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-amber-100 shadow-cookie space-y-8 text-xs sm:text-sm text-gray-700 leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-heading font-bold text-lg text-brand-indigo flex items-center gap-2">
            1. Informasi yang Kami Kumpulkan
          </h2>
          <p>
            Saat Anda melakukan registrasi akun atau memesan kue di De&apos;nish Cookies, kami mengumpulkan informasi yang diperlukan untuk pemenuhan pesanan:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Data Kontak &amp; Identitas:</strong> Nama lengkap, alamat email, dan nomor WhatsApp aktif untuk konfirmasi status pesanan dan pelacakan pengiriman.
            </li>
            <li>
              <strong>Data Alamat &amp; Titik Koordinat (Geolokasi):</strong> Alamat lengkap penerima, kota/kabupaten, kode pos, serta titik koordinat GPS (latitude dan longitude) dari pin peta interaktif yang Anda tentukan. Data ini digunakan secara eksklusif untuk menghitung tarif jarak tempuh kurir Gojek (Rp 4.000/km) dan penentuan rute Paxel.
            </li>
            <li>
              <strong>Data Akun Google:</strong> Jika Anda memilih opsi masuk melalui Google OAuth, kami hanya menerima nama, alamat email, dan foto profil publik dari akun Google Anda untuk verifikasi identitas yang aman.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading font-bold text-lg text-brand-indigo flex items-center gap-2">
            2. Penggunaan Informasi
          </h2>
          <p>Informasi pribadi Anda hanya digunakan untuk tujuan:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Memproses dan mengonfirmasi pesanan toples kue Anda.</li>
            <li>Melakukan penghitungan ongkos kirim real-time dan menyerahkan data alamat ke mitra kurir (Gojek / Paxel).</li>
            <li>Mengirimkan notifikasi pembayaran, faktur digital, dan nomor resi pelacakan pesanan.</li>
            <li>Menyediakan layanan bantuan pelanggan jika terdapat kendala pengiriman.</li>
          </ul>
          <p className="text-brand-red font-semibold">
            De&apos;nish Cookies TIDAK AKAN PERNAH menjual, menyewakan, atau menyebarkan data pribadi Anda kepada pihak ketiga mana pun di luar keperluan pengiriman pesanan Anda.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading font-bold text-lg text-brand-indigo flex items-center gap-2">
            3. Keamanan Transaksi &amp; Pembayaran
          </h2>
          <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-100 flex items-start gap-3">
            <Lock className="w-5 h-5 text-brand-indigo flex-shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-indigo-950">
              <p className="font-bold">Keamanan Terstandar PCI-DSS Melalui Midtrans</p>
              <p>
                Seluruh pemrosesan pembayaran ditangani secara langsung oleh Midtrans Payment Gateway dengan enkripsi tingkat tinggi 256-bit SSL. De&apos;nish Cookies tidak menyimpan informasi sensitif seperti nomor kartu debit/kredit, PIN ATM, atau password perbankan Anda.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading font-bold text-lg text-brand-indigo flex items-center gap-2">
            4. Hak Pengguna &amp; Penghapusan Data
          </h2>
          <p>
            Anda memiliki hak untuk melihat, memperbarui, atau meminta penghapusan riwayat alamat tersimpan dan data akun Anda kapan saja dengan menghubungi tim kami.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading font-bold text-lg text-brand-indigo flex items-center gap-2">
            5. Kontak Pengelola Data
          </h2>
          <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/70 space-y-1.5 text-xs text-brand-indigo">
            <p className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-red flex-shrink-0" />
              <strong>De&apos;nish Cookies:</strong> Jl. Cibatu Raya No. 55, Kel. Antapani Tengah, Kec. Antapani, Kota Bandung, Jawa Barat 40291
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <strong>WhatsApp:</strong> +62 882-1810-6303
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
