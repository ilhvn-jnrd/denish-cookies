'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  Package,
  Clock,
  Truck,
  AlertTriangle,
  ChevronRight,
  Scale,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/lib/api';
import { formatRupiah, formatDate, getOrderStatusBadge } from '@/lib/formatters';
import AdminHeader from '@/components/AdminHeader';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAdmin, isLoading } = useAuth();

  const [stats, setStats] = useState<any | null>(null);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/login');
      return;
    }

    async function loadDashboard() {
      setLoading(true);
      const res = await fetchApi<{
        stats: any;
        low_stock_products: any[];
        recent_orders: any[];
      }>('/admin/dashboard');

      if (res.data) {
        setStats(res.data.stats);
        setLowStock(res.data.low_stock_products || []);
        setRecentOrders(res.data.recent_orders || []);
      }
      setLoading(false);
    }

    if (isAdmin) {
      loadDashboard();
    }
  }, [isAdmin, isLoading]);

  if (isLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6 animate-pulse">
        <div className="h-28 bg-gray-200 rounded-3xl" />
        <div className="grid grid-cols-4 gap-4">
          <div className="h-24 bg-gray-200 rounded-2xl" />
          <div className="h-24 bg-gray-200 rounded-2xl" />
          <div className="h-24 bg-gray-200 rounded-2xl" />
          <div className="h-24 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <AdminHeader />

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-amber-100 shadow-cookie space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Total Omzet Lunas</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="font-heading font-black text-2xl text-brand-indigo">
            {formatRupiah(stats?.total_revenue || 0)}
          </p>
          <span className="text-[11px] text-emerald-700 font-semibold block">
            Bulan Ini: {formatRupiah(stats?.monthly_revenue || 0)}
          </span>
        </div>

        {/* Annual Orders */}
        <div className="bg-white p-5 rounded-3xl border border-amber-100 shadow-cookie space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Volume Pesanan 2026</span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="font-heading font-black text-2xl text-brand-indigo">
            {stats?.annual_orders || 0} <span className="text-xs font-bold text-gray-400">Order</span>
          </p>
          <span className="text-[11px] text-gray-500 font-medium block">
            Target 1,000+ Pesanan / Tahun
          </span>
        </div>

        {/* Processing Orders */}
        <div className="bg-white p-5 rounded-3xl border border-amber-100 shadow-cookie space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Diproses Kitchen</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="font-heading font-black text-2xl text-amber-600">
            {stats?.processing_count || 0} <span className="text-xs font-bold text-gray-400">Pesanan</span>
          </p>
          <span className="text-[11px] text-amber-700 font-medium block">
            Perlu dipanggang &amp; dikemas
          </span>
        </div>

        {/* Shipped Orders */}
        <div className="bg-white p-5 rounded-3xl border border-amber-100 shadow-cookie space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Dalam Pengiriman</span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="font-heading font-black text-2xl text-purple-700">
            {stats?.shipped_count || 0} <span className="text-xs font-bold text-gray-400">Paket</span>
          </p>
          <span className="text-[11px] text-purple-700 font-medium block">
            Kurir Paxel / Gojek di jalan
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-amber-100 shadow-cookie space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-lg text-brand-indigo">
              Pesanan Terbaru
            </h2>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-brand-red hover:underline flex items-center gap-1"
            >
              Lihat Semua &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 uppercase text-[10px] font-bold">
                  <th className="py-2.5">No. Order</th>
                  <th className="py-2.5">Penerima</th>
                  <th className="py-2.5">Kurir &amp; Kota</th>
                  <th className="py-2.5">Total</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((ord) => {
                  const statusInfo = getOrderStatusBadge(ord.order_status);
                  return (
                    <tr key={ord.id} className="hover:bg-amber-50/40 transition">
                      <td className="py-3 font-mono font-bold text-brand-indigo">
                        {ord.order_number}
                      </td>
                      <td className="py-3">
                        <p className="font-bold text-gray-900">{ord.recipient_name}</p>
                        <span className="text-[10px] text-gray-400 font-mono">{ord.recipient_phone}</span>
                      </td>
                      <td className="py-3">
                        <p className="font-medium text-gray-800">{ord.courier_service_name}</p>
                        <span className="text-[10px] text-gray-500">{ord.shipping_city}</span>
                      </td>
                      <td className="py-3 font-heading font-black text-brand-red">
                        {formatRupiah(ord.gross_amount)}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusInfo.bg} ${statusInfo.text}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          href={`/admin/orders?search=${ord.order_number}`}
                          className="px-2.5 py-1 bg-gray-100 hover:bg-brand-yellow hover:text-brand-indigo rounded-lg font-bold text-[11px] transition inline-block"
                        >
                          Kelola
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-amber-100 shadow-cookie space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-base text-brand-indigo flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Peringatan Stok Menipis
            </h2>
            <Link href="/admin/products" className="text-[11px] font-bold text-brand-red hover:underline">
              Kelola Stok
            </Link>
          </div>

          {lowStock.length === 0 ? (
            <p className="text-xs text-gray-500 py-6 text-center bg-gray-50 rounded-2xl">
              Semua stok kue ready dalam batas aman (&gt; 5 toples).
            </p>
          ) : (
            <div className="space-y-3">
              {lowStock.map((prod) => (
                <div
                  key={prod.id}
                  className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200 flex items-center justify-between text-xs"
                >
                  <div className="truncate pr-2">
                    <p className="font-bold text-brand-indigo truncate">{prod.name}</p>
                    <span className="text-[11px] text-gray-500">{formatRupiah(prod.price)}</span>
                  </div>
                  <span className="font-black px-2 py-1 rounded-xl bg-red-100 text-red-700 text-xs flex-shrink-0">
                    Sisa {prod.stock} toples
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
