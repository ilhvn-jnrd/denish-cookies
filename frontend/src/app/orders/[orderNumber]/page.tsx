'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  Printer,
  Phone,
  ShieldCheck,
  Package,
  AlertCircle,
  CreditCard,
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { formatRupiah, formatWeight, formatDate, getOrderStatusBadge } from '@/lib/formatters';
import PaymentModal from '@/components/PaymentModal';

export default function OrderDetailPage() {
  const params = useParams();
  const orderNumber = params?.orderNumber as string;

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const loadOrder = async () => {
    if (!orderNumber) return;
    setLoading(true);
    const res = await fetchApi<{ data: any }>(`/orders/detail/${orderNumber}`);
    if (res.data?.data) {
      setOrder(res.data.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOrder();
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-64 bg-gray-100 rounded-3xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-brand-red mx-auto" />
        <h2 className="font-heading font-bold text-2xl text-brand-indigo">Pesanan Tidak Ditemukan</h2>
        <p className="text-xs text-gray-500">Nomor pesanan {orderNumber} tidak terdaftar di sistem kami.</p>
        <Link href="/orders" className="btn-yellow text-xs px-5 py-2.5 inline-flex">
          Kembali ke Riwayat
        </Link>
      </div>
    );
  }

  const statusInfo = getOrderStatusBadge(order.order_status);

  // Status timeline steps
  const steps = [
    { key: 'pending', label: 'Menunggu Pembayaran' },
    { key: 'paid', label: 'Pembayaran Diterima' },
    { key: 'processing', label: 'Dipanggang di Kitchen' },
    { key: 'shipped', label: 'Dalam Pengiriman' },
    { key: 'completed', label: 'Pesanan Selesai' },
  ];

  const getStepStatus = (stepKey: string) => {
    const orderStatusOrder = ['pending', 'paid', 'processing', 'shipped', 'completed'];
    const currentIndex = orderStatusOrder.indexOf(order.order_status);
    const stepIndex = orderStatusOrder.indexOf(stepKey);

    if (order.order_status === 'cancelled') return 'cancelled';
    if (currentIndex >= stepIndex) return 'completed';
    return 'upcoming';
  };

  const whatsappMessage = encodeURIComponent(
    `Halo De'nish Cookies, saya ingin konfirmasi pesanan saya:\n\nNo. Pesanan: ${order.order_number}\nNama: ${order.recipient_name}\nTotal: ${formatRupiah(order.gross_amount)}\nStatus: ${order.order_status}\n\nTerima kasih!`
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <Link href="/orders" className="text-xs font-bold text-brand-indigo hover:text-brand-red transition flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Riwayat
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" /> Cetak Invoice
          </button>

          <a
            href={`https://wa.me/6288218106303?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
          >
            <Phone className="w-3.5 h-3.5" /> Konfirmasi WhatsApp
          </a>
        </div>
      </div>

      {/* Main Order Card */}
      <div className="bg-white rounded-3xl border border-amber-100 shadow-cookie overflow-hidden">
        {/* Banner */}
        <div className="bg-gradient-to-r from-brand-indigo to-brand-indigoLight text-white p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs text-brand-yellow font-bold uppercase tracking-wider block">
              Detail Faktur Pesanan
            </span>
            <h1 className="font-mono text-xl sm:text-2xl font-black">{order.order_number}</h1>
            <p className="text-xs text-indigo-200 mt-1">Dibuat pada {formatDate(order.created_at)}</p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span className={`text-xs font-black px-4 py-1.5 rounded-full ${statusInfo.bg} ${statusInfo.text}`}>
              {statusInfo.label}
            </span>

            {order.payment_status === 'pending' && (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="px-4 py-1.5 bg-brand-yellow text-brand-indigo hover:bg-brand-yellowHover font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
              >
                <CreditCard className="w-3.5 h-3.5" /> Bayar Sekarang (Simulasi)
              </button>
            )}
          </div>
        </div>

        {/* Live Timeline Tracker */}
        <div className="p-6 bg-brand-creamWarm border-b border-amber-100">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-4">
            Status Pelacakan Pesanan:
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {steps.map((st, idx) => {
              const state = getStepStatus(st.key);
              return (
                <div key={st.key} className="space-y-1.5 text-center sm:text-left">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        state === 'completed'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {state === 'completed' ? '✓' : idx + 1}
                    </span>
                    <span className="hidden sm:block h-0.5 flex-1 bg-gray-200" />
                  </div>
                  <p
                    className={`text-[11px] font-bold ${
                      state === 'completed' ? 'text-brand-indigo' : 'text-gray-400'
                    }`}
                  >
                    {st.label}
                  </p>
                </div>
              );
            })}
          </div>

          {order.tracking_number && (
            <div className="mt-4 p-3 bg-white rounded-2xl border border-amber-200 flex items-center justify-between text-xs">
              <span className="font-medium text-gray-600 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-brand-red" /> No. Resi / Tautan Driver:
              </span>
              <span className="font-mono font-bold text-brand-indigo bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-300">
                {order.tracking_number}
              </span>
            </div>
          )}
        </div>

        {/* Content Details */}
        <div className="p-6 space-y-6">
          {/* Shipping and Recipient */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-gray-100 text-xs">
            <div className="space-y-1.5">
              <span className="font-bold text-gray-400 uppercase tracking-wider block">Penerima &amp; Alamat:</span>
              <p className="font-bold text-brand-indigo text-sm">{order.recipient_name}</p>
              <p className="text-gray-600 leading-relaxed">{order.shipping_address}</p>
              <p className="text-gray-600 font-medium">
                {order.shipping_city}, {order.shipping_province} {order.shipping_postal_code}
              </p>
              <p className="font-mono text-gray-800 font-bold">Telp/WA: {order.recipient_phone}</p>
            </div>

            <div className="space-y-1.5">
              <span className="font-bold text-gray-400 uppercase tracking-wider block">Layanan Ekspedisi:</span>
              <p className="font-bold text-brand-indigo text-sm">{order.courier_service_name}</p>
              <p className="text-gray-600">
                Total Berat Paket: <strong>{formatWeight(order.total_weight_grams)}</strong>
              </p>
              {order.box_breakdown && (
                <p className="text-purple-700 font-bold">Kemasan: {order.box_breakdown}</p>
              )}
              {order.notes && (
                <p className="text-gray-500 italic">Catatan: &quot;{order.notes}&quot;</p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-3">
            <span className="font-bold text-xs text-gray-400 uppercase tracking-wider block">
              Daftar Toples Kue:
            </span>

            <div className="divide-y divide-gray-100">
              {order.items?.map((item: any) => (
                <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-brand-indigo">{item.product_name}</h4>
                    <span className="text-gray-500 text-[11px]">
                      {item.quantity} toples x {formatRupiah(item.product_price)} ({formatWeight(item.product_weight_grams * item.quantity)})
                    </span>
                  </div>
                  <span className="font-bold text-brand-indigo">{formatRupiah(item.subtotal)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Totals */}
          <div className="pt-4 border-t border-gray-100 space-y-2 text-xs text-gray-600 max-w-xs ml-auto">
            <div className="flex justify-between">
              <span>Subtotal Produk:</span>
              <span className="font-bold text-brand-indigo">{formatRupiah(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Ongkos Kirim:</span>
              <span className="font-bold text-brand-indigo">{formatRupiah(order.shipping_cost)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200 text-sm">
              <span className="font-bold text-brand-indigo uppercase">Total Pembayaran:</span>
              <span className="font-heading font-black text-brand-red">{formatRupiah(order.gross_amount)}</span>
            </div>
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          orderNumber={order.order_number}
          grossAmount={order.gross_amount}
          snapToken={order.snap_token}
          isMock={true}
          onPaymentSuccess={() => {
            setShowPaymentModal(false);
            loadOrder();
          }}
        />
      )}
    </div>
  );
}
