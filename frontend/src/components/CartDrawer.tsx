'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Scale } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatRupiah, formatWeight } from '@/lib/formatters';

export default function CartDrawer() {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    totalItems,
    totalWeightGrams,
    totalWeightKg,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-brand-indigo/40 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 bg-brand-creamWarm border-b border-brand-yellow/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-yellow flex items-center justify-center text-brand-indigo shadow-sm">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-lg text-brand-indigo">Keranjang Belanja</h2>
                <p className="text-xs text-gray-500">{totalItems} item kue dipilih</p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center text-gray-500 transition shadow-sm"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-20 h-20 rounded-3xl bg-amber-50 flex items-center justify-center text-brand-yellow">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-brand-indigo">Keranjang Masih Kosong</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Yuk pilih toples kue kering homemade favoritmu sekarang!
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="btn-yellow text-xs px-5 py-2.5"
                >
                  Mulai Belanja
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-3.5 p-3.5 bg-brand-cream rounded-2xl border border-brand-yellow/30 relative group hover:border-brand-yellow transition"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-amber-100 flex-shrink-0 relative">
                    {item.product.image_url ? (
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-amber-700">
                        Cookie
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-heading font-bold text-sm text-brand-indigo truncate">
                        {item.product.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-gray-400 hover:text-brand-red transition p-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-gray-500 flex items-center gap-1">
                        <Scale className="w-3 h-3 text-amber-600" />
                        {item.product.weight_grams} gr/toples
                      </span>
                      {item.product.is_preorder && (
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">
                          Pre-Order
                        </span>
                      )}
                    </div>

                    <p className="font-heading font-extrabold text-sm text-brand-red mt-1">
                      {formatRupiah(item.product.price)}
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center font-bold text-xs text-brand-indigo">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-lg bg-brand-yellow hover:bg-brand-yellowHover flex items-center justify-center text-brand-indigo font-bold transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-bold text-xs text-brand-indigo">
                        {formatRupiah(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer calculation & checkout button */}
          {items.length > 0 && (
            <div className="p-5 bg-white border-t border-gray-100 shadow-lg space-y-3">
              {/* Weight indicator */}
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/80 flex items-center justify-between text-xs">
                <span className="font-medium text-amber-900 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-brand-indigo" /> Total Berat Paket:
                </span>
                <span className="font-bold text-brand-indigo bg-white px-2.5 py-1 rounded-xl shadow-sm border border-amber-200">
                  {formatWeight(totalWeightGrams)}
                </span>
              </div>

              {/* Subtotal */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Subtotal Belanja</span>
                <span className="font-heading font-black text-xl text-brand-indigo">{formatRupiah(subtotal)}</span>
              </div>

              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="w-full btn-primary text-center justify-center py-3.5 text-sm"
              >
                Lanjut ke Checkout <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
