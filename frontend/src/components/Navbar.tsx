'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, User as UserIcon, Menu, X, Shield, Phone, MapPin, Truck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { totalItems, setIsCartOpen } = useCart();
  const { user, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-brand-yellow/30 shadow-sm">
      {/* Top micro announcement bar */}
      <div className="bg-gradient-to-r from-brand-indigo via-brand-indigoLight to-brand-indigo text-white text-[11px] font-semibold py-1.5 px-4 text-center flex items-center justify-center gap-3">
        <span className="hidden sm:inline-flex items-center gap-1 text-brand-yellow">
          <Truck className="w-3.5 h-3.5" /> Kirim Se-Indonesia via Paxel Cold-Chain &amp; Gojek Instant
        </span>
        <span className="text-amber-200">★ 100% Pure Anchor Butter Cookies ★</span>
        <a
          href="https://wa.me/6288218106303?text=Halo%20Denish%20Cookies,%20saya%20ingin%20tanya%20produk%20kue"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white hover:text-brand-yellow transition underline flex items-center gap-1 font-bold"
        >
          <Phone className="w-3 h-3" /> WhatsApp Order
        </a>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo Brand */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl overflow-hidden border-2 border-brand-yellow shadow-md flex-shrink-0 bg-white group-hover:scale-105 transition-transform">
              <img
                src="/logo.png"
                alt="De'nish Cookies Logo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback if logo file is loading
                  (e.target as any).style.display = 'none';
                }}
              />
            </div>
            <div>
              <span className="font-heading font-extrabold text-lg sm:text-2xl text-brand-indigo tracking-tight group-hover:text-brand-red transition">
                De&apos;nish <span className="text-brand-yellow">Cookies</span>
              </span>
              <p className="text-[9px] sm:text-[10px] text-gray-500 font-bold tracking-wider uppercase block">
                Making Taste Better
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-bold text-brand-indigo">
            <Link href="/" className="hover:text-brand-red transition">
              Beranda
            </Link>
            <Link href="/#katalog" className="hover:text-brand-red transition">
              Katalog Kue
            </Link>
            <Link href="/#pengiriman" className="hover:text-brand-red transition flex items-center gap-1">
              <Truck className="w-4 h-4 text-brand-red" /> Paxel &amp; Gojek
            </Link>
            <Link href="/#tentang" className="hover:text-brand-red transition">
              Tentang Kami
            </Link>
            {mounted && user && (
              <Link href="/orders" className="hover:text-brand-red transition">
                Pesanan Saya
              </Link>
            )}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {mounted && isAdmin && (
              <Link
                href="/admin"
                className="px-3.5 py-2 bg-purple-100 text-brand-indigo hover:bg-purple-200 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition border border-purple-300"
              >
                <Shield className="w-3.5 h-3.5 text-brand-red" />
                Admin Panel
              </Link>
            )}

            {mounted && user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/profile"
                  className="px-3 py-2 bg-brand-cream text-brand-indigo hover:bg-brand-creamWarm rounded-xl text-xs font-bold flex items-center gap-1.5 border border-brand-yellow/40 transition"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span className="max-w-[120px] truncate">{user.name.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={() => logout()}
                  className="text-xs text-gray-500 hover:text-brand-red font-medium transition px-2 py-1"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-brand-cream text-brand-indigo hover:bg-brand-creamWarm rounded-xl text-xs font-bold border border-brand-yellow/40 transition flex items-center gap-1.5"
              >
                <UserIcon className="w-3.5 h-3.5" /> Masuk / Daftar
              </Link>
            )}

            {/* Cart Trigger Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 bg-brand-yellow hover:bg-brand-yellowHover text-brand-indigo rounded-2xl shadow-cookie transition active:scale-95"
              aria-label="Keranjang Belanja"
            >
              <ShoppingBag className="w-5 h-5" />
              {mounted && totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-brand-red text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-cookieRed animate-bounce">
                  {totalItems}
                </span>
              )}
            </button>
          </div>

          {/* Mobile buttons */}
          <div className="flex items-center gap-1.5 md:hidden">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative w-10 h-10 bg-brand-yellow text-brand-indigo rounded-xl flex items-center justify-center active:scale-95 shadow-sm"
              aria-label="Keranjang Belanja"
            >
              <ShoppingBag className="w-5 h-5" />
              {mounted && totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-red text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-10 h-10 flex items-center justify-center text-brand-indigo rounded-xl hover:bg-amber-50 active:scale-95"
              aria-label="Menu Navigasi"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-brand-yellow/20 bg-white p-4 space-y-3 shadow-lg">
          <nav className="flex flex-col space-y-2 text-sm font-bold text-brand-indigo">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-xl hover:bg-amber-50"
            >
              Beranda
            </Link>
            <Link
              href="/#katalog"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-xl hover:bg-amber-50"
            >
              Katalog Kue Kering
            </Link>
            <Link
              href="/#pengiriman"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-xl hover:bg-amber-50 flex items-center gap-2 text-brand-red"
            >
              <Truck className="w-4 h-4" /> Paxel &amp; Gojek
            </Link>
            <Link
              href="/#tentang"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-xl hover:bg-amber-50"
            >
              Tentang Kami
            </Link>
            {mounted && user && (
              <Link
                href="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl hover:bg-amber-50"
              >
                Pesanan Saya
              </Link>
            )}
            {mounted && isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl bg-purple-50 text-brand-indigo font-bold flex items-center gap-2"
              >
                <Shield className="w-4 h-4 text-brand-red" /> Admin Panel
              </Link>
            )}
          </nav>

          <div className="pt-3 border-t border-gray-100">
            {mounted && user ? (
              <div className="flex items-center justify-between">
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-bold text-sm text-brand-indigo flex items-center gap-2"
                >
                  <UserIcon className="w-4 h-4" /> {user.name}
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-brand-red font-bold"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-yellow w-full text-center text-xs py-2.5"
              >
                Masuk / Daftar Akun
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
