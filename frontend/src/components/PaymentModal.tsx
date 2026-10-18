'use client';

import React, { useState } from 'react';
import { CheckCircle2, ShieldCheck, CreditCard, QrCode, Smartphone, X, AlertTriangle } from 'lucide-react';
import { formatRupiah } from '@/lib/formatters';
import { fetchApi } from '@/lib/api';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  grossAmount: number;
  snapToken?: string;
  isMock?: boolean;
  onPaymentSuccess: () => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  orderNumber,
  grossAmount,
  snapToken,
  isMock = true,
  onPaymentSuccess,
}: PaymentModalProps) {
  const [selectedChannel, setSelectedChannel] = useState<'qris' | 'bca' | 'gopay'>('qris');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSimulatePayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const res = await fetchApi<{ message: string; order: any }>(`/orders/${orderNumber}/simulate-payment`, {
        method: 'POST',
      });

      if (res.data) {
        onPaymentSuccess();
      } else {
        setError(res.error || 'Simulasi pembayaran gagal.');
      }
    } catch (e: any) {
      setError(e.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-brand-yellow/30 max-h-[90dvh] flex flex-col">
        {/* Sticky Header */}
        <div className="bg-gradient-to-r from-brand-indigo to-brand-indigoLight text-white px-5 py-4 sm:px-6 sm:py-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-brand-yellow text-brand-indigo flex items-center justify-center font-black text-base sm:text-lg shadow-sm">
              dc
            </div>
            <div>
              <h3 className="font-heading text-base sm:text-lg font-bold">Pembayaran Online Otomatis</h3>
              <p className="text-[11px] sm:text-xs text-brand-yellow flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" /> Pembayaran Instan &amp; Aman
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Amount & Order ID banner */}
        <div className="bg-brand-creamWarm px-5 py-3 sm:px-6 sm:py-4 border-b border-amber-100 flex items-center justify-between flex-shrink-0">
          <div>
            <span className="text-[10px] sm:text-[11px] font-semibold text-gray-500 uppercase tracking-wider">No. Pesanan</span>
            <p className="font-mono text-xs sm:text-sm font-bold text-brand-indigo">{orderNumber}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] sm:text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total Tagihan</span>
            <p className="font-heading text-base sm:text-lg font-black text-brand-red">{formatRupiah(grossAmount)}</p>
          </div>
        </div>

        {/* Content Body (Scrollable on small phones) */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-blue-900">
            <AlertTriangle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Mode Simulasi Pembayaran Otomatis</span>
              <p className="text-blue-800 text-[11px] mt-0.5">
                Fitur ini memproses simulasi konfirmasi pembayaran dan pemotongan stok otomatis untuk verifikasi sistem.
              </p>
            </div>
          </div>

          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
            Pilih Metode Pembayaran
          </label>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setSelectedChannel('qris')}
              className={`p-2.5 sm:p-3 rounded-2xl border text-center flex flex-col items-center gap-1 transition ${
                selectedChannel === 'qris'
                  ? 'border-brand-red bg-rose-50/50 text-brand-red font-bold ring-2 ring-brand-red/20'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <QrCode className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-[11px] sm:text-xs">QRIS</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedChannel('bca')}
              className={`p-2.5 sm:p-3 rounded-2xl border text-center flex flex-col items-center gap-1 transition ${
                selectedChannel === 'bca'
                  ? 'border-brand-red bg-rose-50/50 text-brand-red font-bold ring-2 ring-brand-red/20'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-[11px] sm:text-xs">BCA VA</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedChannel('gopay')}
              className={`p-2.5 sm:p-3 rounded-2xl border text-center flex flex-col items-center gap-1 transition ${
                selectedChannel === 'gopay'
                  ? 'border-brand-red bg-rose-50/50 text-brand-red font-bold ring-2 ring-brand-red/20'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <Smartphone className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-[11px] sm:text-xs">GoPay/OVO</span>
            </button>
          </div>

          {/* Simulated QR Code / VA Display */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gray-50 border border-gray-200 text-center space-y-2">
            {selectedChannel === 'qris' && (
              <div className="space-y-1.5">
                <div className="w-28 h-28 sm:w-36 sm:h-36 mx-auto bg-white p-2 rounded-xl border border-gray-300 shadow-inner flex items-center justify-center">
                  <QrCode className="w-24 h-24 sm:w-28 sm:h-28 text-brand-indigo" />
                </div>
                <p className="text-[11px] sm:text-xs text-gray-600 font-medium">Scan QRIS dari BCA, Mandiri, GoPay, atau OVO</p>
              </div>
            )}

            {selectedChannel === 'bca' && (
              <div className="space-y-1">
                <span className="text-xs text-gray-500">Nomor Virtual Account BCA:</span>
                <p className="font-mono text-base sm:text-lg font-black text-brand-indigo tracking-wider">80777 0812987654</p>
                <p className="text-[11px] text-gray-500">Batas pembayaran: 24 Jam</p>
              </div>
            )}

            {selectedChannel === 'gopay' && (
              <div className="space-y-1">
                <span className="text-xs text-gray-500">Deep Link GoPay / E-Wallet:</span>
                <p className="text-xs font-bold text-emerald-700">Terhubung langsung ke aplikasi Gojek di HP Anda</p>
              </div>
            )}
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200 font-medium">
              {error}
            </p>
          )}
        </div>

        {/* Sticky Action Footer */}
        <div className="p-4 bg-white border-t border-gray-100 flex-shrink-0 space-y-1.5">
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleSimulatePayment}
            className="w-full py-3 sm:py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl sm:rounded-2xl shadow-lg transition active:scale-95 flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-60 min-h-[44px]"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Memproses Pembayaran...
              </span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Konfirmasi Bayar Sekarang (Lunas)
              </>
            )}
          </button>

          <p className="text-[10px] text-gray-400 text-center">
            ID Transaksi: <span className="font-mono text-[10px] text-gray-600">{snapToken || 'ONLINE-GATEWAY-ACTIVE'}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
