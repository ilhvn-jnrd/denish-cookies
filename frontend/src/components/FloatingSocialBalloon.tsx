'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, ExternalLink } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function FloatingSocialBalloon() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { totalItems } = useCart();
  const balloonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close popup if clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (balloonRef.current && !balloonRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!mounted) return null;

  // Reposition slightly on mobile if cart bottom bar is active
  const bottomPositionClass =
    totalItems > 0
      ? 'bottom-20 right-4 sm:bottom-6 sm:right-6'
      : 'bottom-6 right-4 sm:bottom-6 sm:right-6';

  return (
    <div ref={balloonRef} className={`fixed ${bottomPositionClass} z-50 flex flex-col items-end`}>
      {/* Floating Popup Menu */}
      {isOpen && (
        <div className="mb-3 w-72 sm:w-80 bg-white rounded-3xl shadow-2xl border-2 border-brand-yellow/80 overflow-hidden animate-slide-up origin-bottom-right">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-indigo via-brand-indigoLight to-brand-indigo p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-brand-yellow text-brand-indigo flex items-center justify-center font-black shadow-sm">
                <MessageCircle className="w-4 h-4 fill-brand-indigo" />
              </div>
              <div>
                <h4 className="font-heading font-black text-sm text-white leading-tight">
                  De&apos;nish Chat &amp; Sosmed
                </h4>
                <p className="text-[10px] text-amber-200 font-semibold">
                  Fast response jam 08.00 - 21.00 WIB
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition active:scale-95"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Social Links List */}
          <div className="p-3.5 space-y-2.5 bg-amber-50/40">
            {/* 1. WhatsApp */}
            <a
              href="https://wa.me/6288218106303"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 bg-white hover:bg-emerald-50 rounded-2xl border border-emerald-200/80 shadow-sm hover:shadow transition group active:scale-98"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                  {/* WhatsApp SVG Icon */}
                  <svg
                    className="w-5 h-5 fill-current"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-heading font-black text-xs text-brand-indigo">
                      WhatsApp CS
                    </span>
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-700">
                      Online
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-gray-500">+62 882-1810-6303</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-emerald-600 opacity-60 group-hover:opacity-100 transition" />
            </a>

            {/* 2. Instagram */}
            <a
              href="https://www.instagram.com/denish_cookies?exln=MWw2MW9yZjlza3czbg=="
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 bg-white hover:bg-pink-50 rounded-2xl border border-pink-200/80 shadow-sm hover:shadow transition group active:scale-98"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                  {/* Instagram SVG Icon */}
                  <svg
                    className="w-5 h-5 fill-current"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069M12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </div>
                <div>
                  <span className="font-heading font-black text-xs text-brand-indigo block">
                    Instagram
                  </span>
                  <p className="text-[11px] font-semibold text-gray-500">@denish_cookies</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-pink-600 opacity-60 group-hover:opacity-100 transition" />
            </a>

            {/* 3. TikTok */}
            <a
              href="https://www.tiktok.com/@denishcookies?_r=1&_t=ZS-9AdH7NcfGgk"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 bg-white hover:bg-gray-50 rounded-2xl border border-gray-200/90 shadow-sm hover:shadow transition group active:scale-98"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                  {/* TikTok SVG Icon */}
                  <svg
                    className="w-5 h-5 fill-current"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                  </svg>
                </div>
                <div>
                  <span className="font-heading font-black text-xs text-brand-indigo block">
                    TikTok Official
                  </span>
                  <p className="text-[11px] font-semibold text-gray-500">@denishcookies</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-700 opacity-60 group-hover:opacity-100 transition" />
            </a>
          </div>

          <div className="px-4 py-2 bg-brand-yellow/15 text-[10px] text-center text-brand-indigo font-bold border-t border-brand-yellow/30">
            De&apos;nish Cookies Bandung • Making Taste Better
          </div>
        </div>
      )}

      {/* Main Trigger Balloon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative flex items-center gap-2 p-3.5 sm:px-4 sm:py-3.5 bg-brand-yellow hover:bg-brand-yellowHover text-brand-indigo rounded-full shadow-2xl border-2 border-white transition-all active:scale-95 ${
          !isOpen ? 'animate-tuing-tuing hover:animate-none' : ''
        }`}
        aria-label="Buka Chat & Sosial Media"
      >
        {/* Pulsing effect ring */}
        {!isOpen && (
          <span className="absolute -inset-1 rounded-full bg-brand-yellow opacity-40 animate-ping pointer-events-none" />
        )}

        {isOpen ? (
          <X className="w-6 h-6 text-brand-indigo transition-transform duration-200" />
        ) : (
          <div className="relative">
            <MessageCircle className="w-6 h-6 text-brand-indigo fill-brand-indigo transition-transform group-hover:scale-110" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-brand-red rounded-full border border-white" />
          </div>
        )}

        <span className="hidden sm:inline font-heading font-black text-xs text-brand-indigo">
          {isOpen ? 'Tutup' : 'Chat & Sosmed'}
        </span>
      </button>
    </div>
  );
}
