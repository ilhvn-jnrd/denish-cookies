'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Cookie, Package, Settings, ArrowLeft, Shield } from 'lucide-react';

export default function AdminHeader() {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin', label: 'Ringkasan KPI', icon: LayoutDashboard },
    { href: '/admin/orders', label: 'Manajemen Pesanan & Resi', icon: Package },
    { href: '/admin/products', label: 'Produk & Stok Kue', icon: Cookie },
    { href: '/admin/shipping', label: 'Tarif Gojek & Paxel', icon: Settings },
  ];

  return (
    <div className="bg-brand-indigo text-white p-6 rounded-3xl shadow-cookie space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-indigo-900/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-yellow text-brand-indigo font-black flex items-center justify-center text-lg shadow-sm">
            dc
          </div>
          <div>
            <h1 className="font-heading font-black text-xl text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-brand-yellow" />
              De&apos;nish Cookies Admin Portal
            </h1>
            <p className="text-[11px] text-indigo-200">
              Manajemen Operasional UMKM Bakery, Paxel Cold-Chain, &amp; Gojek Instant
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Toko
        </Link>
      </div>

      {/* Tabs */}
      <nav className="flex flex-wrap items-center gap-2 text-xs font-bold">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 ${
                isActive
                  ? 'bg-brand-yellow text-brand-indigo shadow-md font-black'
                  : 'bg-indigo-900/40 text-indigo-200 hover:bg-indigo-900/70 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
