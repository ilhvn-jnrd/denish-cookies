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
                <img src="/logo.jpg" alt="De'nish Cookies" className="w-full h-full object-cover" />
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
              Pelopor kue kering homemade premium dengan 100% Wijsman Butter asli. Diracik dengan resep otentik warisan keluarga tanpa pemanis buatan.
            </p>
            <div className="flex items-center gap-2 text-xs text-brand-yellow font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Bahan Pilihan Halal &amp; Higienis
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-brand-yellow uppercase tracking-wider">
              Koleksi Kue
            </h4>
            <ul className="space-y-2 text-xs text-indigo-200">
              <li>
                <Link href="/#katalog" className="hover:text-brand-yellow transition">
                  Nastar Wisman Spesial
                </Link>
              </li>
              <li>
                <Link href="/#katalog" className="hover:text-brand-yellow transition">
                  Kastengel Keju Edam Asli
                </Link>
              </li>
              <li>
                <Link href="/#katalog" className="hover:text-brand-yellow transition">
                  Putri Salju Kacang Mede
                </Link>
              </li>
              <li>
                <Link href="/#katalog" className="hover:text-brand-yellow transition">
                  Double Choco Almond
                </Link>
              </li>
              <li>
                <Link href="/#katalog" className="hover:text-brand-yellow transition">
                  Hampers De&apos;nish Royal Box
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
                  <span>Khusus wilayah Jadetabek (Radius s/d 40 km dari Kitchen Duren Sawit).</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Truck className="w-4 h-4 text-brand-red flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Paxel Cold-Chain / Box Khusus</strong>
                  <span>Antar kota se-Pulau Jawa, Bali, Medan, Makassar (1 hari sampai).</span>
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
                <span>Jl. Robusta Raya / Pahlawan Revolusi No. 42, Duren Sawit, Jakarta Timur, 13430</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <a
                  href="https://wa.me/6281298765432"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-yellow transition font-bold"
                >
                  WhatsApp: 0812-9876-5432
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-yellow flex-shrink-0" />
                <span>order@denishcookies.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-indigo-300">
          <p className="flex items-center gap-1 text-center sm:text-left">
            &copy; 2026 <strong className="text-white">De&apos;nish Cookies</strong>. Made with{' '}
            <Heart className="w-3.5 h-3.5 text-brand-red inline fill-brand-red" /> for Indonesian SME Bakery.
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Deployment Ready: Hostinger Unlimited &amp; Node.js</span>
            <span>•</span>
            <Link href="/admin" className="hover:text-brand-yellow underline">
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
