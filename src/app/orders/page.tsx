'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, Truck, Clock, CheckCircle2, ChevronRight, Package, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/lib/api';
import { formatRupiah, formatDate, getOrderStatusBadge } from '@/lib/formatters';

export default function CustomerOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      setLoading(true);
      const res = await fetchApi<{ data: any[] }>('/orders');
      if (res.data?.data) {
        setOrders(res.data.data);
      }
      setLoading(false);
    }
    loadOrders();
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
        <Link href="/" className="hover:text-brand-red transition flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Beranda
        </Link>
        <span>/</span>
        <span className="text-brand-indigo font-bold">Riwayat Pesanan</span>
      </div>

      <div>
        <h1 className="font-heading font-black text-3xl text-brand-indigo">Pesanan Saya</h1>
        <p className="text-xs text-gray-500">
          Pantau status baking, pengiriman kurir Paxel / Gojek, dan invoice pesanan Anda.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 h-32" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-amber-100 text-center space-y-4 shadow-sm max-w-lg mx-auto">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="font-heading font-bold text-lg text-brand-indigo">Belum Ada Riwayat Pesanan</h3>
          <p className="text-xs text-gray-500">
            Kue kering legit buatan dapur De&apos;nish Cookies siap melengkapi hari spesial Anda.
          </p>
          <Link href="/#katalog" className="btn-yellow text-xs px-5 py-2.5 inline-flex">
            Mulai Belanja Sekarang
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusInfo = getOrderStatusBadge(order.order_status);
            return (
              <div
                key={order.id}
                className="bg-white p-6 rounded-3xl border border-amber-100 shadow-cookie hover:shadow-cookieHover transition space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-brand-indigo bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200">
                      {order.order_number}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDate(order.created_at)}
                    </span>
                  </div>

                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${statusInfo.bg} ${statusInfo.text}`}
                  >
                    {statusInfo.label}
                  </span>
                </div>

                {/* Body items & courier */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div className="md:col-span-2 space-y-1">
                    <div className="space-y-1">
                      {order.items?.map((item: any, idx: number) => (
                        <p key={idx} className="text-xs text-gray-800 font-medium">
                          <strong>{item.quantity}x</strong> {item.product_name}
                        </p>
                      ))}
                    </div>

                    <p className="text-xs text-gray-500 flex items-center gap-1.5 pt-1">
                      <Truck className="w-3.5 h-3.5 text-brand-red" />
                      {order.courier_service_name} • Tujuan {order.shipping_city}
                    </p>
                  </div>

                  <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] text-gray-400 block uppercase">Total Tagihan</span>
                      <span className="font-heading font-black text-lg text-brand-red">
                        {formatRupiah(order.gross_amount)}
                      </span>
                    </div>

                    <Link
                      href={`/orders/${order.order_number}`}
                      className="px-4 py-2 bg-brand-yellow hover:bg-brand-yellowHover text-brand-indigo font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1"
                    >
                      Detail Pesanan <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
