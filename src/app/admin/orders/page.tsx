'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Package,
  Printer,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  Filter,
  Save,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/lib/api';
import { formatRupiah, formatWeight, formatDate, getOrderStatusBadge } from '@/lib/formatters';
import AdminHeader from '@/components/AdminHeader';
import ShippingLabelModal from '@/components/ShippingLabelModal';

export default function AdminOrdersPage() {
  const router = useRouter();
  const { isAdmin, isLoading } = useAuth();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [courierFilter, setCourierFilter] = useState('');
  const [search, setSearch] = useState('');

  // Selected Order for Shipping Label Print Modal
  const [selectedOrderForLabel, setSelectedOrderForLabel] = useState<any | null>(null);

  // Tracking number edit inputs state: { [orderId]: trackingNumber }
  const [trackingInputs, setTrackingInputs] = useState<Record<number, string>>({});
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.append('status', statusFilter);
    if (courierFilter) params.append('courier', courierFilter);
    if (search) params.append('search', search);

    const res = await fetchApi<{ data: any[] }>(`/admin/orders?${params.toString()}`);
    if (res.data?.data) {
      setOrders(res.data.data);
      // Initialize tracking inputs
      const initialTracking: Record<number, string> = {};
      res.data.data.forEach((o: any) => {
        initialTracking[o.id] = o.tracking_number || '';
      });
      setTrackingInputs(initialTracking);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/login');
      return;
    }
    if (isAdmin) {
      loadOrders();
    }
  }, [isAdmin, isLoading, statusFilter, courierFilter, search]);

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId);
    const tracking = trackingInputs[orderId] || '';

    await fetchApi(`/admin/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({
        order_status: newStatus,
        tracking_number: tracking,
      }),
    });

    setUpdatingId(null);
    loadOrders();
  };

  const handleSaveTracking = async (orderId: number, currentStatus: string) => {
    setUpdatingId(orderId);
    const tracking = trackingInputs[orderId] || '';

    await fetchApi(`/admin/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({
        order_status: currentStatus,
        tracking_number: tracking,
      }),
    });

    setUpdatingId(null);
    loadOrders();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <AdminHeader />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl text-brand-indigo">
            Manajemen Pesanan &amp; Resi Pengiriman
          </h1>
          <p className="text-xs text-gray-500">
            Perbarui alur baking pesanan, input resi Paxel / link driver Gojek, dan cetak label alamat pengiriman.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search */}
          <div className="relative min-w-[200px]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari no. order / nama / resi..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-brand-indigo focus:outline-none"
          >
            <option value="">Semua Status Pesanan</option>
            <option value="pending">Menunggu Pembayaran</option>
            <option value="paid">Lunas</option>
            <option value="processing">Diproses Kitchen</option>
            <option value="shipped">Sedang Dikirim</option>
            <option value="completed">Selesai</option>
            <option value="cancelled">Dibatalkan</option>
          </select>

          {/* Courier Filter */}
          <select
            value={courierFilter}
            onChange={(e) => setCourierFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-brand-indigo focus:outline-none"
          >
            <option value="">Semua Ekspedisi</option>
            <option value="gojek_instant">Gojek Instant</option>
            <option value="gojek_sameday">Gojek SameDay</option>
            <option value="paxel">Paxel Antar Kota</option>
          </select>
        </div>

        <span className="font-bold text-gray-500">
          Ditemukan: {orders.length} Pesanan
        </span>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-40 bg-white rounded-3xl border border-gray-100" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500 bg-white rounded-3xl border border-gray-200 space-y-2">
            <Package className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="font-bold text-brand-indigo">Tidak ada pesanan yang sesuai filter.</p>
          </div>
        ) : (
          orders.map((ord) => {
            const statusInfo = getOrderStatusBadge(ord.order_status);
            return (
              <div
                key={ord.id}
                className="bg-white p-6 rounded-3xl border border-amber-100 shadow-cookie space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-black text-brand-indigo bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                      {ord.order_number}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(ord.created_at)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-black px-3 py-1 rounded-full ${statusInfo.bg} ${statusInfo.text}`}
                    >
                      {statusInfo.label}
                    </span>

                    {/* Print Shipping Label Button */}
                    <button
                      type="button"
                      onClick={() => setSelectedOrderForLabel(ord)}
                      className="px-3 py-1.5 bg-brand-yellow text-brand-indigo hover:bg-brand-yellowHover rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                    >
                      <Printer className="w-3.5 h-3.5" /> Cetak Label Kirim
                    </button>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                  {/* Customer & Address */}
                  <div className="space-y-1">
                    <span className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">
                      Penerima:
                    </span>
                    <p className="font-bold text-sm text-gray-900">{ord.recipient_name}</p>
                    <p className="text-gray-600 leading-snug">{ord.shipping_address}</p>
                    <p className="font-semibold text-gray-800">
                      {ord.shipping_city}, {ord.shipping_province} {ord.shipping_postal_code}
                    </p>
                    <p className="font-mono text-brand-indigo font-bold mt-1">Telp: {ord.recipient_phone}</p>
                  </div>

                  {/* Courier & Items */}
                  <div className="space-y-1.5">
                    <span className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">
                      Pengiriman &amp; Paket:
                    </span>
                    <p className="font-bold text-brand-indigo flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-brand-red" /> {ord.courier_service_name}
                    </p>
                    <p className="text-gray-500">
                      Total Berat: <strong>{formatWeight(ord.total_weight_grams)}</strong>
                    </p>
                    {ord.box_breakdown && (
                      <p className="text-purple-800 font-bold bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-200 text-[11px] inline-block">
                        {ord.box_breakdown}
                      </p>
                    )}

                    <div className="pt-1 space-y-0.5">
                      {ord.items?.map((it: any, i: number) => (
                        <p key={i} className="text-gray-700">
                          • {it.quantity}x {it.product_name}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Actions: Update Status & Tracking */}
                  <div className="space-y-3 bg-amber-50/50 p-4 rounded-2xl border border-amber-200/60 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-gray-700">Ubah Status Pesanan:</span>
                        <span className="font-heading font-black text-brand-red text-sm">
                          {formatRupiah(ord.gross_amount)}
                        </span>
                      </div>

                      <select
                        value={ord.order_status}
                        disabled={updatingId === ord.id}
                        onChange={(e) => handleUpdateStatus(ord.id, e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold text-brand-indigo focus:ring-2 focus:ring-brand-yellow"
                      >
                        <option value="pending">Menunggu Pembayaran</option>
                        <option value="paid">Lunas (Siap Diproses)</option>
                        <option value="processing">Diproses / Baking di Kitchen</option>
                        <option value="shipped">Sedang Dikirim (Driver/Paxel)</option>
                        <option value="completed">Pesanan Selesai</option>
                        <option value="cancelled">Batalkan Pesanan</option>
                      </select>
                    </div>

                    {/* Tracking Number Input */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-gray-600">
                        No. Resi Paxel / Tautan Live Gojek:
                      </label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={trackingInputs[ord.id] ?? ''}
                          onChange={(e) =>
                            setTrackingInputs((prev) => ({
                              ...prev,
                              [ord.id]: e.target.value,
                            }))
                          }
                          placeholder="PXL-123456 / GK-DRV-99"
                          className="flex-1 px-3 py-1.5 bg-white border border-gray-300 rounded-xl text-xs font-mono"
                        />
                        <button
                          type="button"
                          disabled={updatingId === ord.id}
                          onClick={() => handleSaveTracking(ord.id, ord.order_status)}
                          className="px-3 py-1.5 bg-brand-indigo text-white hover:bg-brand-indigoLight rounded-xl text-xs font-bold transition"
                          title="Simpan Resi"
                        >
                          <Save className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Printable Shipping Label Modal */}
      {selectedOrderForLabel && (
        <ShippingLabelModal
          isOpen={Boolean(selectedOrderForLabel)}
          onClose={() => setSelectedOrderForLabel(null)}
          order={selectedOrderForLabel}
        />
      )}
    </div>
  );
}
