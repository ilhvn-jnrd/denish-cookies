'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Cookie, Package, Settings, ArrowLeft, Shield, Menu, X, PlusCircle } from 'lucide-react';

export default function AdminHeader() {
  const pathname = usePathname();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const navItems = [
    { href: '/admin', label: 'Ringkasan', fullLabel: 'Ringkasan KPI', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Produk (+Upload)', fullLabel: 'Produk & Stok Kue', icon: Cookie },
    { href: '/admin/orders', label: 'Pesanan', fullLabel: 'Manajemen Pesanan & Resi', icon: Package },
    { href: '/admin/shipping', label: 'Ongkir', fullLabel: 'Tarif Gojek & Paxel', icon: Settings },
  ];

  return (
    <>
      {/* Desktop & Tablet Header Banner */}
      <div className="bg-brand-indigo text-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-cookie space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between gap-3 border-b border-indigo-900/60 pb-3 sm:pb-4">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-brand-yellow text-brand-indigo font-black flex items-center justify-center text-base sm:text-lg shadow-sm flex-shrink-0">
              dc
            </div>
            <div>
              <h1 className="font-heading font-black text-base sm:text-xl text-white flex items-center gap-1.5 sm:gap-2">
                <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-yellow" />
                De&apos;nish Cookies Admin
              </h1>
              <p className="text-[10px] sm:text-[11px] text-indigo-200 line-clamp-1">
                Portal Manajemen UMKM Bakery &amp; Pengiriman
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Kembali ke Toko</span>
            </Link>

            {/* Mobile Drawer Toggle */}
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl lg:hidden"
              aria-label="Menu Admin"
            >
              {mobileDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden lg:flex flex-wrap items-center gap-2 text-xs font-bold">
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
                {item.fullLabel}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Mobile Top Menu Drawer (When hamburger clicked) */}
      {mobileDrawerOpen && (
        <div className="lg:hidden bg-brand-indigo text-white p-4 rounded-2xl shadow-xl space-y-2 border border-brand-yellow/30 animate-fade-in">
          <span className="text-[10px] font-bold text-amber-200 uppercase tracking-wider block mb-1">
            Menu Navigasi Admin:
          </span>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileDrawerOpen(false)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition ${
                  isActive
                    ? 'bg-brand-yellow text-brand-indigo font-black'
                    : 'bg-indigo-950/60 text-white hover:bg-indigo-900'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Icon className="w-4 h-4" /> {item.fullLabel}
                </span>
                {isActive && <span className="w-2 h-2 rounded-full bg-brand-indigo" />}
              </Link>
            );
          })}
          <Link
            href="/"
            onClick={() => setMobileDrawerOpen(false)}
            className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 text-amber-300 hover:bg-indigo-900/60 border-t border-indigo-900/60 pt-2"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Halaman Toko
          </Link>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (< 1024px) for 1-tap switching */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-2 py-1 flex items-center justify-around shadow-2xl safe-area-bottom">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition min-w-[64px] min-h-[48px] ${
                isActive
                  ? 'text-brand-indigo font-black'
                  : 'text-gray-400 hover:text-gray-600 font-semibold'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition ${
                  isActive ? 'bg-brand-yellow text-brand-indigo shadow-sm' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-black' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
