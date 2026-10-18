'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, Phone, MapPin, Truck, ShieldCheck, Mail, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-brand-indigo text-white border-t-4 border-brand-yellow pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-indigo-900/60">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white border-2 border-brand-yellow shadow-md flex-shrink-0">
                <img src="/logo.png" alt="De'nish Cookies" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-xl text-white">
                  De&apos;nish <span className="text-brand-yellow">Cookies</span>
                </h3>
                <p className="text-[10px] text-brand-yellow font-bold uppercase tracking-wider">
                  Making Taste Better
                </p>
              </div>
            </div>
            <p className="text-xs text-indigo-200 leading-relaxed">
              Pelopor kue kering homemade premium dengan 100% Anchor Butter asli. Diracik dengan standar higienis tinggi tanpa bahan pemanis buatan.
            </p>
            <div className="bg-white/10 p-3 rounded-2xl border border-white/15 space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 p-1 bg-white rounded-lg flex-shrink-0">
                  <img
                    src="/logo_halal_124_ungu.png"
                    alt="Halal"
                    className="h-6 w-auto object-contain"
                  />
                  <img
                    src="/logo_halal_224_ungu.png"
                    alt="Halal"
                    className="h-6 w-auto object-contain"
                  />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-white leading-tight">
                    Sertifikat Halal Resmi
                  </div>
                  <div className="text-[9px] text-brand-yellow font-semibold">
                    BPJPH &amp; MUI Terverifikasi
                  </div>
                </div>
              </div>
              <div className="text-[10px] text-indigo-200 font-mono space-y-0.5 pt-1 border-t border-white/10">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-gray-300">No. 1:</span>
                  <span className="text-brand-yellow font-bold">ID32110015308660124</span>
                </div>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-gray-300">No. 2:</span>
                  <span className="text-brand-yellow font-bold">ID32110015422560224</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-brand-yellow uppercase tracking-wider">
              Koleksi Favorit
            </h4>
            <ul className="space-y-2 text-xs text-indigo-200">
              <li>
                <Link href="/#katalog" className="hover:text-brand-yellow transition">
                  Kastangel
                </Link>
              </li>
              <li>
                <Link href="/#katalog" className="hover:text-brand-yellow transition">
                  Nastar Keju
                </Link>
              </li>
              <li>
                <Link href="/#katalog" className="hover:text-brand-yellow transition">
                  Bokkepootjes
                </Link>
              </li>
              <li>
                <Link href="/#katalog" className="hover:text-brand-yellow transition">
                  Sagu Keju
                </Link>
              </li>
            </ul>
          </div>

          {/* Shipping & Couriers */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-brand-yellow uppercase tracking-wider">
              Layanan Ekspedisi
            </h4>
            <ul className="space-y-2.5 text-xs text-indigo-200">
              <li className="flex items-start gap-2">
                <Truck className="w-4 h-4 text-brand-yellow flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Gojek Instant &amp; SameDay</strong>
                  <span>Khusus wilayah Kota Bandung &amp; sekitarnya (Radius s/d 40 km dari Kitchen Antapani).</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Truck className="w-4 h-4 text-brand-red flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Paxel Safe-Box Khusus Makanan</strong>
                  <span>Pengiriman luar kota aman dengan penanganan khusus paket makanan (Food Safe) agar kualitas kue tetap terjaga hingga sampai di tujuan.</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Contact & Kitchen Address */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-brand-yellow uppercase tracking-wider">
              Dapur De&apos;nish
            </h4>
            <ul className="space-y-2.5 text-xs text-indigo-200">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brand-red flex-shrink-0 mt-0.5" />
                <span>Jl. Cibatu Raya No. 55, Kel. Antapani Tengah, Kec. Antapani, Kota Bandung, Jawa Barat</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <a
                  href="https://wa.me/6288218106303"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-yellow transition font-bold"
                >
                  WhatsApp: +62 882-1810-6303
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-yellow flex-shrink-0" />
                <span>denishcookie@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & Legal Policies */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-indigo-300">
          <p className="flex items-center gap-1 text-center md:text-left">
            &copy; 2026 <strong className="text-white">De&apos;nish Cookies</strong>. Made with{' '}
            <Heart className="w-3.5 h-3.5 text-brand-red inline fill-brand-red" /> for Indonesian SME Bakery.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] sm:text-xs">
            <Link href="/syarat-ketentuan" className="hover:text-brand-yellow transition underline decoration-indigo-400/40 underline-offset-4">
              Syarat &amp; Ketentuan
            </Link>
            <span className="text-indigo-500">•</span>
            <Link href="/kebijakan-privasi" className="hover:text-brand-yellow transition underline decoration-indigo-400/40 underline-offset-4">
              Kebijakan Privasi
            </Link>
            <span className="text-indigo-500">•</span>
            <Link href="/kebijakan-pengiriman" className="hover:text-brand-yellow transition underline decoration-indigo-400/40 underline-offset-4">
              Kebijakan Pengiriman &amp; Pengembalian
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
