'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Truck,
  Clock,
  CheckCircle2,
  ChevronRight,
  Package,
  ArrowLeft,
  XCircle,
  CreditCard,
  ChefHat,
  Copy,
  Check,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/lib/api';
import { formatRupiah, formatDate, getOrderStatusBadge } from '@/lib/formatters';
import PaymentModal from '@/components/PaymentModal';
import { triggerSnapPayment } from '@/lib/snap';

type OrderTab = 'all' | 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';

interface TabItem {
  id: OrderTab;
  label: string;
  icon: any;
}

const TABS: TabItem[] = [
  { id: 'all', label: 'Semua', icon: ShoppingBag },
  { id: 'pending', label: 'Belum Bayar', icon: Clock },
  { id: 'processing', label: 'Dalam Produksi', icon: ChefHat },
  { id: 'shipped', label: 'Di Jalan', icon: Truck },
  { id: 'completed', label: 'Selesai', icon: CheckCircle2 },
  { id: 'cancelled', label: 'Dibatalkan', icon: XCircle },
];

export default function CustomerOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState<OrderTab>('all');
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [selectedOrderForPay, setSelectedOrderForPay] = useState<any | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [copiedResi, setCopiedResi] = useState<string | null>(null);

  const loadOrders = async (tab: OrderTab = activeTab) => {
    setLoading(true);
    const param = tab === 'all' ? '' : `?status=${tab}`;
    const res = await fetchApi<any>(`/orders${param}`);
    if (res.data) {
      if (Array.isArray(res.data.data)) {
        setOrders(res.data.data);
      } else if (Array.isArray(res.data)) {
        setOrders(res.data);
      }
      if (res.data.counts) {
        setCounts(res.data.counts);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOrders(activeTab);
  }, [user, activeTab]);

  const handleTabChange = (tab: OrderTab) => {
    setActiveTab(tab);
  };

  const handlePayOrder = async (order: any) => {
    const snapToken = order.snap_token;
    const isMockToken = !snapToken || snapToken.startsWith('SNAP-MOCK-') || snapToken.startsWith('SNAP-FALLBACK-');

    if (isMockToken) {
      setSelectedOrderForPay(order);
      setShowPaymentModal(true);
      return;
    }

    const result = await triggerSnapPayment({
      snapToken,
      onSuccess: () => {
        loadOrders(activeTab);
      },
      onPending: () => {
        loadOrders(activeTab);
      },
      onError: () => {
        alert('Pembayaran belum berhasil atau dibatalkan.');
      },
      onClose: () => {
        // Modal closed
      },
    });

    if (result.isMock) {
      setSelectedOrderForPay(order);
      setShowPaymentModal(true);
    }
  };

  const handleCancelOrder = async (orderNumber: string) => {
    if (!confirm(`Apakah Anda yakin ingin membatalkan pesanan ${orderNumber}?`)) {
      return;
    }

    setCancellingId(orderNumber);
    const res = await fetchApi(`/orders/${orderNumber}/cancel`, {
      method: 'POST',
    });
    setCancellingId(null);

    if (res.error) {
      alert(res.error);
    } else {
      alert('Pesanan berhasil dibatalkan.');
      loadOrders(activeTab);
    }
  };

  const handleCopyResi = (resi: string) => {
    navigator.clipboard.writeText(resi);
    setCopiedResi(resi);
    setTimeout(() => setCopiedResi(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
        <Link href="/" className="hover:text-brand-red transition flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Beranda
        </Link>
        <span>/</span>
        <span className="text-brand-indigo font-bold">Riwayat Pesanan</span>
      </div>

      {/* Page Title */}
      <div>
        <h1 className="font-heading font-black text-2xl sm:text-3xl text-brand-indigo">Pesanan Saya</h1>
        <p className="text-xs text-gray-500 mt-1">
          Pantau status pemanggangan, nomor resi pengiriman kurir Paxel / Gojek, dan invoice pesanan Anda.
        </p>
      </div>

      {/* Shopee-style Horizontal Status Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 min-w-max">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const count = counts[tab.id] ?? 0;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`relative px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'bg-brand-indigo text-white shadow-sm'
                    : 'text-gray-600 hover:text-brand-indigo hover:bg-amber-50/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-brand-yellow' : 'text-gray-400'}`} />
                <span>{tab.label}</span>
                {count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                      isActive
                        ? 'bg-brand-yellow text-brand-indigo'
                        : tab.id === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notification banner for Dibatalkan tab */}
      {activeTab === 'cancelled' && (
        <div className="bg-amber-50/80 border border-amber-200/80 p-3.5 rounded-2xl flex items-center gap-2.5 text-xs text-amber-900">
          <Info className="w-4 h-4 text-amber-700 flex-shrink-0" />
          <p>
            <strong>Info Penghapusan Otomatis:</strong> Pesanan yang dibatalkan otomatis disembunyikan/dibersihkan dari daftar riwayat setelah 3 hari demi menjaga kerapian akun Anda.
          </p>
        </div>
      )}

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 h-36" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-amber-100 text-center space-y-4 shadow-sm max-w-lg mx-auto my-6">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="font-heading font-bold text-lg text-brand-indigo">
            {activeTab === 'pending'
              ? 'Tidak Ada Tagihan Belum Bayar'
              : activeTab === 'processing'
              ? 'Belum Ada Pesanan Dalam Produksi'
              : activeTab === 'shipped'
              ? 'Belum Ada Pesanan Di Jalan'
              : activeTab === 'completed'
              ? 'Belum Ada Riwayat Pesanan Selesai'
              : activeTab === 'cancelled'
              ? 'Tidak Ada Pesanan Dibatalkan (3 Hari Terakhir)'
              : 'Belum Ada Riwayat Pesanan'}
          </h3>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            {activeTab === 'all'
              ? 'Kue kering legit buatan dapur De\'nish Cookies siap melengkapi hari spesial Anda.'
              : 'Pesanan dengan kategori ini belum ada atau sudah diperbarui statusnya.'}
          </p>
          <Link href="/#katalog" className="btn-yellow text-xs px-5 py-2.5 inline-flex">
            Mulai Belanja Sekarang
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusInfo = getOrderStatusBadge(order.order_status);
            const isPending = order.order_status === 'pending';
            const isProcessing = order.order_status === 'processing' || order.order_status === 'paid';
            const isShipped = order.order_status === 'shipped';
            const isCompleted = order.order_status === 'completed';
            const isCancelled = order.order_status === 'cancelled';

            return (
              <div
                key={order.id}
                className={`bg-white rounded-3xl border transition overflow-hidden shadow-cookie hover:shadow-cookieHover ${
                  isPending ? 'border-amber-200' : 'border-gray-100'
                }`}
              >
                {/* Header Row */}
                <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className="font-mono text-xs font-bold text-brand-indigo bg-white px-2.5 py-1 rounded-lg border border-gray-200 shadow-2xs">
                      {order.order_number}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDate(order.created_at)}
                    </span>
                  </div>

                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusInfo.bg} ${statusInfo.text}`}>
                    {statusInfo.label}
                  </span>
                </div>

                {/* Status Progress Bar Banner */}
                {isPending && (
                  <div className="bg-amber-50 px-4 sm:px-5 py-2 border-b border-amber-100 flex items-center justify-between text-xs text-amber-900">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                      <span>Menunggu Pembayaran. Segera selesaikan agar kue Anda masuk antrean baking hari ini!</span>
                    </div>
                  </div>
                )}

                {isProcessing && (
                  <div className="bg-blue-50/80 px-4 sm:px-5 py-2 border-b border-blue-100 flex items-center gap-2 text-xs text-blue-900">
                    <ChefHat className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    <span>Dapur De&apos;nish Cookies sedang memanggang &amp; mengemas pesanan dengan higienis.</span>
                  </div>
                )}

                {isShipped && (
                  <div className="bg-amber-50 px-4 sm:px-5 py-2 border-b border-amber-200/80 flex flex-wrap items-center justify-between gap-2 text-xs text-amber-950">
                    <div className="flex items-center gap-2">
                      <Truck className="w-3.5 h-3.5 text-brand-red flex-shrink-0" />
                      <span>Paket sedang dalam perjalanan kurir ({order.courier_service_name}).</span>
                    </div>
                    {order.tracking_number && (
                      <div className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded-lg border border-amber-300 font-mono text-[11px]">
                        <span>Resi: {order.tracking_number}</span>
                        <button
                          onClick={() => handleCopyResi(order.tracking_number)}
                          title="Salin Resi"
                          className="hover:text-brand-red"
                        >
                          {copiedResi === order.tracking_number ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3 text-gray-500" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {isCompleted && (
                  <div className="bg-emerald-50 px-4 sm:px-5 py-2 border-b border-emerald-100 flex items-center gap-2 text-xs text-emerald-900">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>Pesanan telah berhasil diterima. Terima kasih telah memesan di De&apos;nish Cookies!</span>
                  </div>
                )}

                {isCancelled && (
                  <div className="bg-rose-50 px-4 sm:px-5 py-2 border-b border-rose-100 flex items-center gap-2 text-xs text-rose-900">
                    <XCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                    <span>Pesanan telah dibatalkan (akan hilang otomatis dari tampilan dalam 3 hari).</span>
                  </div>
                )}

                {/* Body Content */}
                <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* Items List */}
                  <div className="md:col-span-8 space-y-2">
                    <div className="space-y-1.5">
                      {order.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-xs text-gray-800">
                          <span className="font-medium">
                            <strong className="text-brand-indigo">{item.quantity}x</strong> {item.product_name}
                          </span>
                          <span className="text-gray-500 font-mono">{formatRupiah(item.subtotal)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500 border-t border-gray-50">
                      <span className="flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-brand-red" />
                        {order.courier_service_name} • {order.shipping_city}
                      </span>
                      <span>•</span>
                      <span>Total Berat: {order.total_weight_grams} gr</span>
                    </div>
                  </div>

                  {/* Pricing & Actions */}
                  <div className="md:col-span-4 flex flex-col items-start md:items-end justify-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100">
                    <div className="text-left md:text-right w-full">
                      <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">
                        Total Tagihan
                      </span>
                      <span className="font-heading font-black text-xl text-brand-red">
                        {formatRupiah(order.gross_amount)}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
                      {isPending && (
                        <>
                          <button
                            onClick={() => handlePayOrder(order)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-sm transition flex items-center gap-1.5 active:scale-95"
                          >
                            <CreditCard className="w-3.5 h-3.5" /> Bayar Sekarang
                          </button>
                          <button
                            onClick={() => handleCancelOrder(order.order_number)}
                            disabled={cancellingId === order.order_number}
                            className="px-3 py-2 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 font-bold text-xs rounded-xl transition flex items-center gap-1 disabled:opacity-50"
                          >
                            Batalkan
                          </button>
                        </>
                      )}

                      <Link
                        href={`/orders/${order.order_number}`}
                        className="px-4 py-2 bg-brand-yellow hover:bg-brand-yellowHover text-brand-indigo font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1"
                      >
                        Detail Pesanan <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Payment Modal for Mock/Sandbox fallback */}
      {showPaymentModal && selectedOrderForPay && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedOrderForPay(null);
            loadOrders(activeTab);
          }}
          orderNumber={selectedOrderForPay.order_number}
          grossAmount={selectedOrderForPay.gross_amount}
          onPaymentSuccess={() => {
            setShowPaymentModal(false);
            setSelectedOrderForPay(null);
            loadOrders(activeTab);
          }}
        />
      )}
    </div>
  );
}
