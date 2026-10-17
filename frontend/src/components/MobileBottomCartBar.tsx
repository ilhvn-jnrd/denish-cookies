'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, ArrowRight, Scale } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatRupiah, formatWeight } from '@/lib/formatters';

export default function MobileBottomCartBar() {
  const pathname = usePathname();
  const { totalItems, subtotal, totalWeightGrams, setIsCartOpen } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Do not show on desktop, checkout page, or admin pages
  if (!mounted || totalItems === 0) return null;
  if (pathname === '/checkout' || pathname?.startsWith('/admin')) return null;

  return (
    <div className="md:hidden fixed bottom-3 left-3 right-3 z-40 animate-slide-up">
      <div className="bg-brand-indigo text-white p-3.5 rounded-2xl shadow-2xl border-2 border-brand-yellow/80 flex items-center justify-between gap-3 backdrop-blur-md">
        {/* Left: Cart Info (Click opens drawer) */}
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="flex items-center gap-2.5 text-left min-w-0 flex-1"
        >
          <div className="relative w-10 h-10 rounded-xl bg-brand-yellow text-brand-indigo flex items-center justify-center font-black flex-shrink-0 shadow-sm">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-1.5 -right-1.5 bg-brand-red text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-cookieRed">
              {totalItems}
            </span>
          </div>

          <div className="min-w-0 truncate">
            <div className="flex items-center gap-1.5 text-[11px] text-amber-200">
              <span className="font-bold">{totalItems} Toples</span>
              <span>•</span>
              <span className="flex items-center gap-0.5">
                <Scale className="w-3 h-3 text-brand-yellow" />
                {formatWeight(totalWeightGrams)}
              </span>
            </div>
            <p className="font-heading font-black text-base text-white truncate">
              {formatRupiah(subtotal)}
            </p>
          </div>
        </button>

        {/* Right: Quick Checkout Button */}
        <Link
          href="/checkout"
          className="px-4 py-2.5 bg-brand-yellow hover:bg-brand-yellowHover text-brand-indigo font-black text-xs rounded-xl shadow-cookie flex items-center gap-1.5 active:scale-95 transition flex-shrink-0"
        >
          <span>Checkout</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
