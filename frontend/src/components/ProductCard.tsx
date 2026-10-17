'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Scale, Clock, Sparkles } from 'lucide-react';
import { Product, useCart } from '@/context/CartContext';
import { formatRupiah, formatWeight } from '@/lib/formatters';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  return (
    <div className="group bg-white rounded-3xl p-3.5 border border-amber-100/80 shadow-cookie hover:shadow-cookieHover hover:border-brand-yellow/60 transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Image Container */}
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-amber-50 mb-3">
          <Link href={`/products/${product.slug}`}>
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-heading text-amber-800 font-bold">
                De&apos;nish Cookies
              </div>
            )}
          </Link>

          {/* Badges Overlay */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
            {product.is_featured && (
              <span className="bg-brand-red text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm uppercase tracking-wide">
                <Sparkles className="w-3 h-3" /> Best Seller
              </span>
            )}
            {product.is_preorder ? (
              <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                <Clock className="w-3 h-3" /> PO {product.po_lead_days || 2} Hari
              </span>
            ) : (
              <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                Ready Stock
              </span>
            )}
          </div>

          {/* Weight Badge on bottom right */}
          <div className="absolute bottom-2.5 right-2.5 bg-brand-indigo/85 backdrop-blur-sm text-brand-yellow text-[11px] font-bold px-2 py-0.5 rounded-xl flex items-center gap-1 shadow-sm">
            <Scale className="w-3 h-3" />
            {product.weight_grams} gr
          </div>
        </div>

        {/* Category & Title */}
        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-amber-700/80 uppercase tracking-wider">
            {product.category?.name || 'Kue Kering'}
          </span>
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-heading font-bold text-base text-brand-indigo group-hover:text-brand-red transition line-clamp-1">
              {product.name}
            </h3>
          </Link>
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>
      </div>

      {/* Pricing and Action */}
      <div className="mt-4 pt-3 border-t border-amber-50 flex items-center justify-between gap-2">
        <div>
          <span className="text-[10px] text-gray-400 font-semibold block uppercase">Harga</span>
          <span className="font-heading font-black text-base text-brand-red">
            {formatRupiah(product.price)}
          </span>
        </div>

        <button
          type="button"
          onClick={() => addToCart(product, 1)}
          className="btn-yellow text-xs px-3.5 py-2 rounded-xl"
          title="Tambah ke Keranjang"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Tambah</span>
        </button>
      </div>
    </div>
  );
}
