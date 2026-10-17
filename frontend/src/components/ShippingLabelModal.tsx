'use client';

import React, { useRef } from 'react';
import { Printer, X, AlertOctagon, PackageCheck } from 'lucide-react';
import { formatWeight, formatDate } from '@/lib/formatters';

interface ShippingLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

export default function ShippingLabelModal({ isOpen, onClose, order }: ShippingLabelModalProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
        {/* Controls */}
        <div className="bg-brand-indigo text-white px-6 py-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-brand-yellow" />
            <h3 className="font-heading font-bold text-base">Label Pengiriman Pesanan</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-brand-yellow text-brand-indigo hover:bg-brand-yellowHover rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Printer className="w-4 h-4" /> Cetak / Print
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Label Area */}
        <div ref={printAreaRef} className="p-6 bg-white text-gray-900 space-y-4">
          {/* Label Header */}
          <div className="border-4 border-black p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-black text-base">
                  dc
                </div>
                <div>
                  <h2 className="font-black text-lg tracking-tight leading-none uppercase">DE&apos;NISH COOKIES</h2>
                  <p className="text-[10px] font-bold tracking-widest text-gray-700">PREMIUM HOMEMADE COOKIES</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-gray-500">No. Resi / AWB</span>
                <p className="font-mono text-base font-black tracking-wider text-black">
                  {order.tracking_number || order.order_number}
                </p>
              </div>
            </div>

            {/* Courier Banner */}
            <div className="bg-black text-white px-3 py-2 rounded-lg flex items-center justify-between text-xs font-black uppercase tracking-wider">
              <span>KURIR: {order.courier_service_name || order.courier_type}</span>
              <span>BERAT: {formatWeight(order.total_weight_grams)}</span>
            </div>

            {/* Sender and Recipient Columns */}
            <div className="grid grid-cols-2 gap-4 text-xs pt-1 border-b-2 border-black pb-3">
              {/* Sender */}
              <div className="space-y-1 pr-2 border-r border-gray-300">
                <span className="font-bold text-[10px] text-gray-500 uppercase">Pengirim:</span>
                <p className="font-bold text-gray-900">De&apos;nish Cookies Kitchen Bandung</p>
                <p className="text-[11px] text-gray-700 leading-snug">
                  Jl. Cibatu Raya No. 55, Kel. Antapani Tengah, Kec. Antapani, Kota Bandung, Jawa Barat
                </p>
                <p className="font-mono text-[11px] text-gray-900 font-semibold">WA: +62 882-1810-6303</p>
              </div>

              {/* Recipient */}
              <div className="space-y-1">
                <span className="font-bold text-[10px] text-gray-500 uppercase">Penerima:</span>
                <p className="font-black text-gray-900 text-sm">{order.recipient_name}</p>
                <p className="text-[11px] text-gray-800 leading-snug font-medium">{order.shipping_address}</p>
                <p className="font-bold text-gray-900 text-xs">
                  {order.shipping_city}, {order.shipping_province} {order.shipping_postal_code}
                </p>
                <p className="font-mono text-xs font-bold text-black mt-1">Telp: {order.recipient_phone}</p>
              </div>
            </div>

            {/* Items summary */}
            <div className="text-xs space-y-1 pt-1">
              <span className="font-bold text-[10px] text-gray-500 uppercase">Isi Paket:</span>
              <ul className="list-disc pl-4 text-[11px] text-gray-800 space-y-0.5">
                {order.items?.map((item: any, idx: number) => (
                  <li key={idx} className="font-medium">
                    {item.product_name} x {item.quantity} toples ({formatWeight(item.product_weight_grams * item.quantity)})
                  </li>
                ))}
              </ul>
              {order.box_breakdown && (
                <p className="text-[11px] text-gray-600 font-semibold mt-1">
                  Kemasan: <span className="font-bold text-black">{order.box_breakdown}</span>
                </p>
              )}
            </div>

            {/* CRUCIAL FRAGILE BADGE */}
            <div className="bg-red-600 text-white p-3 rounded-lg flex items-center justify-center gap-2 text-center shadow-sm">
              <AlertOctagon className="w-7 h-7 flex-shrink-0" />
              <div>
                <p className="font-black text-sm tracking-wider uppercase leading-none">
                  FRAGILE — KUE KERING MUDAH HANCUR
                </p>
                <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5">
                  JANGAN DIBANTING / JANGAN DITINDIH BENDA BERAT
                </p>
              </div>
            </div>

            {/* Footer timestamp */}
            <div className="flex items-center justify-between text-[9px] text-gray-500 pt-1 font-mono">
              <span>Order: {order.order_number}</span>
              <span>Dicetak: {formatDate(new Date().toISOString())}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
