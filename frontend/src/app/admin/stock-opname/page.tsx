'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ClipboardCheck,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  DollarSign,
  History,
  Save,
  X,
  Flame,
  ShoppingBag,
  AlertTriangle,
  Globe,
  Search,
  Filter,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/lib/api';
import { formatRupiah, formatDate } from '@/lib/formatters';
import AdminHeader from '@/components/AdminHeader';

interface ProductItem {
  id: number;
  name: string;
  price: number;
  weight_grams: number;
  stock: number;
  is_preorder: boolean;
  image_url?: string;
}

interface StockMovementItem {
  id: number;
  product_id: number;
  type: 'in_production' | 'out_offline' | 'out_online' | 'opname_adjustment' | 'damaged';
  stock_before: number;
  quantity_change: number;
  stock_after: number;
  offline_revenue: number;
  notes: string | null;
  created_by: number | null;
  created_at: string;
  product?: {
    id: number;
    name: string;
    price: number;
    stock: number;
    weight_grams: number;
    image_url?: string;
  };
  creator?: {
    id: number;
    name: string;
  };
}

interface MovementSummary {
  total_offline_jars: number;
  total_offline_revenue: number;
  total_production_in_jars: number;
  total_damaged_jars: number;
  total_online_jars: number;
}

export default function AdminStockOpnamePage() {
  const router = useRouter();
  const { isAdmin, isLoading } = useAuth();

  // Products & Opname state
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [opnameDraft, setOpnameDraft] = useState<Record<number, { actual_stock: number; notes: string }>>({});
  const [globalOpnameNote, setGlobalOpnameNote] = useState('');
  const [searchProduct, setSearchProduct] = useState('');
  const [savingOpname, setSavingOpname] = useState(false);

  // Movements History & Summary state
  const [movements, setMovements] = useState<StockMovementItem[]>([]);
  const [summary, setSummary] = useState<MovementSummary>({
    total_offline_jars: 0,
    total_offline_revenue: 0,
    total_production_in_jars: 0,
    total_damaged_jars: 0,
    total_online_jars: 0,
  });
  const [filterType, setFilterType] = useState<string>('all');
  const [filterProductId, setFilterProductId] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('');
  const [loadingData, setLoadingData] = useState(true);

  // Feedback banners
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Quick Mutation Modal State (Fitur B)
  const [showQuickModal, setShowQuickModal] = useState(false);
  const [quickProductId, setQuickProductId] = useState<number>(0);
  const [quickType, setQuickType] = useState<'out_offline' | 'in_production' | 'damaged'>('out_offline');
  const [quickQty, setQuickQty] = useState<number>(1);
  const [quickCustomRevenue, setQuickCustomRevenue] = useState<string>('');
  const [quickNotes, setQuickNotes] = useState<string>('');
  const [submittingQuick, setSubmittingQuick] = useState(false);
  const [quickError, setQuickError] = useState<string | null>(null);

  const loadAllData = async (resetDraft = false) => {
    setLoadingData(true);
    const params = new URLSearchParams();
    if (filterType !== 'all') params.append('type', filterType);
    if (filterProductId !== 'all') params.append('product_id', filterProductId);
    if (filterDate) params.append('date', filterDate);

    const [prodRes, movRes] = await Promise.all([
      fetchApi<{ data: ProductItem[] }>('/admin/products?all=1'),
      fetchApi<{ data: StockMovementItem[]; summary: MovementSummary }>(
        `/admin/stock-movements?${params.toString()}`
      ),
    ]);

    if (prodRes.data?.data) {
      const prodList = prodRes.data.data;
      setProducts(prodList);
      if (prodList.length > 0 && !quickProductId) {
        setQuickProductId(prodList[0].id);
      }

      if (resetDraft || Object.keys(opnameDraft).length === 0) {
        const initialDraft: Record<number, { actual_stock: number; notes: string }> = {};
        prodList.forEach((p) => {
          initialDraft[p.id] = {
            actual_stock: p.stock,
            notes: '',
          };
        });
        setOpnameDraft(initialDraft);
      } else {
        // Keep existing draft or sync newly loaded products
        setOpnameDraft((prev) => {
          const next = { ...prev };
          prodList.forEach((p) => {
            next[p.id] = {
              actual_stock: p.stock,
              notes: '',
            };
          });
          return next;
        });
      }
    }

    if (movRes.data) {
      setMovements(movRes.data.data || []);
      if (movRes.data.summary) {
        setSummary(movRes.data.summary);
      }
    }

    setLoadingData(false);
  };

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/login');
      return;
    }
    if (isAdmin) {
      loadAllData(false);
    }
  }, [isAdmin, isLoading, filterType, filterProductId, filterDate]);

  // Filtered products for Opname table
  const filteredProducts = useMemo(() => {
    if (!searchProduct.trim()) return products;
    const q = searchProduct.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, searchProduct]);

  // Count how many products have differences in the Opname table
  const changedOpnameItems = useMemo(() => {
    return products.filter((p) => {
      const draft = opnameDraft[p.id];
      return draft !== undefined && draft.actual_stock !== p.stock;
    });
  }, [products, opnameDraft]);

  const handleOpnameStockChange = (productId: number, value: number) => {
    const cleanVal = Math.max(0, Math.floor(Number(value) || 0));
    setOpnameDraft((prev) => ({
      ...prev,
      [productId]: {
        actual_stock: cleanVal,
        notes: prev[productId]?.notes || '',
      },
    }));
  };

  const handleOpnameNoteChange = (productId: number, notes: string) => {
    const prod = products.find((p) => p.id === productId);
    setOpnameDraft((prev) => ({
      ...prev,
      [productId]: {
        actual_stock: prev[productId]?.actual_stock ?? (prod?.stock || 0),
        notes,
      },
    }));
  };

  const handleResetOpnameDraft = () => {
    const resetMap: Record<number, { actual_stock: number; notes: string }> = {};
    products.forEach((p) => {
      resetMap[p.id] = { actual_stock: p.stock, notes: '' };
    });
    setOpnameDraft(resetMap);
    setGlobalOpnameNote('');
  };

  // Submit Bulk Stock Opname (Fitur A)
  const handleSaveBulkOpname = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    const payloadItems = products.map((p) => ({
      product_id: p.id,
      actual_stock: opnameDraft[p.id]?.actual_stock ?? p.stock,
      notes: opnameDraft[p.id]?.notes || '',
    }));

    setSavingOpname(true);

    const res = await fetchApi<{
      message: string;
      adjusted_count: number;
      movements: StockMovementItem[];
    }>('/admin/stock-opname/bulk', {
      method: 'POST',
      body: JSON.stringify({
        items: payloadItems,
        global_notes: globalOpnameNote,
      }),
    });

    if (res.data) {
      setSuccessMsg(res.data.message);
      setGlobalOpnameNote('');
      await loadAllData(true);
    } else {
      setErrorMsg(res.error || 'Gagal menyimpan hasil Stock Opname.');
    }

    setSavingOpname(false);
  };

  // Open Quick Mutation Modal (Fitur B)
  const openQuickMovementModal = (
    presetType: 'out_offline' | 'in_production' | 'damaged' = 'out_offline',
    presetProductId?: number
  ) => {
    setQuickType(presetType);
    if (presetProductId) {
      setQuickProductId(presetProductId);
    } else if (products.length > 0 && !quickProductId) {
      setQuickProductId(products[0].id);
    }
    setQuickQty(1);
    setQuickCustomRevenue('');
    setQuickNotes('');
    setQuickError(null);
    setShowQuickModal(true);
  };

  const selectedQuickProduct = useMemo(
    () => products.find((p) => p.id === Number(quickProductId)),
    [products, quickProductId]
  );

  const calculatedOfflineRevenue = useMemo(() => {
    if (quickType !== 'out_offline' || !selectedQuickProduct) return 0;
    if (quickCustomRevenue.trim() !== '') {
      return Math.max(0, Number(quickCustomRevenue) || 0);
    }
    return selectedQuickProduct.price * Math.max(1, quickQty);
  }, [quickType, selectedQuickProduct, quickQty, quickCustomRevenue]);

  const handleSubmitQuickMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuickError(null);
    setErrorMsg(null);
    setSuccessMsg(null);
    setSubmittingQuick(true);

    const payload: any = {
      product_id: Number(quickProductId),
      type: quickType,
      quantity: Math.max(1, Number(quickQty)),
      notes:
        quickNotes.trim() ||
        (quickType === 'out_offline'
          ? 'Terjual Offline (Dapur / WhatsApp)'
          : quickType === 'in_production'
          ? 'Produksi Baru Selesai Dipanggang'
          : 'Kue Tester / Rusak'),
    };

    if (quickType === 'out_offline') {
      payload.offline_revenue = calculatedOfflineRevenue;
    }

    const res = await fetchApi<{ message: string; data: StockMovementItem }>('/admin/stock-movements', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res.data) {
      setShowQuickModal(false);
      setSuccessMsg(res.data.message);
      await loadAllData(true);
    } else {
      setQuickError(res.error || 'Gagal mencatat mutasi stok.');
    }

    setSubmittingQuick(false);
  };

  const getMovementTypeBadge = (type: StockMovementItem['type']) => {
    switch (type) {
      case 'in_production':
        return {
          label: '+ Produksi Masuk',
          bg: 'bg-emerald-100',
          text: 'text-emerald-800',
          icon: Flame,
        };
      case 'out_offline':
        return {
          label: '- Terjual Offline / WA',
          bg: 'bg-amber-100',
          text: 'text-amber-900',
          icon: ShoppingBag,
        };
      case 'out_online':
        return {
          label: '- Terjual via Website',
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          icon: Globe,
        };
      case 'opname_adjustment':
        return {
          label: '± Penyesuaian Opname',
          bg: 'bg-purple-100',
          text: 'text-purple-800',
          icon: ClipboardCheck,
        };
      case 'damaged':
        return {
          label: '- Tester / Rusak',
          bg: 'bg-red-100',
          text: 'text-red-700',
          icon: AlertTriangle,
        };
      default:
        return {
          label: type,
          bg: 'bg-gray-100',
          text: 'text-gray-700',
          icon: Package,
        };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8 pb-24 lg:pb-12">
      <AdminHeader />

      {/* Page Title & Quick Action Triggers (Fitur B) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-xl sm:text-2xl text-brand-indigo flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-brand-red" />
            Stok &amp; Opname Offline (Sinkronisasi 1 Pintu)
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Seluruh stok kue online (Website) dan offline (pembelian langsung di Dapur / WhatsApp) terhubung ke satu stok utama agar anti-overselling.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => openQuickMovementModal('out_offline')}
            className="px-4 py-2.5 bg-brand-red hover:bg-red-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition active:scale-95"
          >
            <Minus className="w-4 h-4" /> Catat Terjual Offline / WA
          </button>

          <button
            type="button"
            onClick={() => openQuickMovementModal('in_production')}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition active:scale-95"
          >
            <Plus className="w-4 h-4" /> + Produksi Baru Matang
          </button>

          <button
            type="button"
            onClick={() => openQuickMovementModal('damaged')}
            className="px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-gray-300 transition active:scale-95"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Tester / Rusak
          </button>
        </div>
      </div>

      {/* Feedback Notifications */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 font-bold flex items-center justify-between gap-2 animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-950">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 font-bold flex items-center justify-between gap-2 animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-brand-red flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-red-700 hover:text-red-950">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Offline & Stock Movement Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-amber-100 shadow-cookie space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase">Total Omzet Offline / WA</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="font-heading font-black text-2xl text-brand-red">
            {formatRupiah(summary.total_offline_revenue)}
          </p>
          <span className="text-[11px] text-gray-500 block">
            Dari penjualan langsung non-website
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-amber-100 shadow-cookie space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase">Toples Keluar Offline</span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-brand-red flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <p className="font-heading font-black text-2xl text-brand-indigo">
            {summary.total_offline_jars} <span className="text-xs font-bold text-gray-400">Toples</span>
          </p>
          <span className="text-[11px] text-amber-800 font-semibold block">
            Terjual via WhatsApp / Toko Dapur
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-amber-100 shadow-cookie space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase">Total Produksi Masuk</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="font-heading font-black text-2xl text-emerald-700">
            +{summary.total_production_in_jars} <span className="text-xs font-bold text-gray-400">Toples</span>
          </p>
          <span className="text-[11px] text-emerald-700 font-medium block">
            Tambahan stok baru selesai panggang
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-amber-100 shadow-cookie space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase">Tester / Rusak &amp; Web</span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="font-heading font-black text-2xl text-brand-indigo">
            {summary.total_damaged_jars} <span className="text-xs font-bold text-gray-400">Tester/Rusak</span>
          </p>
          <span className="text-[11px] text-blue-700 font-semibold block">
            Terjual Online Web: {summary.total_online_jars} toples
          </span>
        </div>
      </div>

      {/* FITUR A: TABEL STOCK OPNAME CEPAT (HITUNG FISIK RAK) */}
      <div className="bg-white rounded-3xl border border-amber-100 shadow-cookie overflow-hidden">
        <div className="p-5 sm:p-6 bg-brand-creamWarm border-b border-amber-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-brand-indigo text-brand-yellow text-[10px] font-black uppercase">
                Fitur A • Hitung Fisik Rak
              </span>
              {changedOpnameItems.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-brand-red text-white text-[10px] font-black animate-pulse">
                  {changedOpnameItems.length} Kue Berubah
                </span>
              )}
            </div>
            <h2 className="font-heading font-black text-lg text-brand-indigo">
              Tabel Stock Opname Sekaligus (Bulk Physical Count)
            </h2>
            <p className="text-xs text-gray-600">
              Ketik jumlah toples fisik riil yang ada di rak dapur saat ini. Sistem otomatis menghitung selisih (+/-) dan menyamakan stok website dalam 1 klik.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-56">
              <input
                type="text"
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                placeholder="Cari nama kue di rak..."
                className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            </div>

            {changedOpnameItems.length > 0 && (
              <button
                type="button"
                onClick={handleResetOpnameDraft}
                className="px-3 py-2 bg-white hover:bg-gray-100 text-gray-600 border border-gray-200 rounded-xl text-xs font-bold flex items-center gap-1 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset
              </button>
            )}

            <button
              type="button"
              disabled={savingOpname}
              onClick={handleSaveBulkOpname}
              className="btn-yellow px-4 py-2.5 text-xs font-black flex items-center gap-1.5 shadow-md disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {savingOpname
                ? 'Menyimpan Opname...'
                : changedOpnameItems.length > 0
                ? `Simpan Hasil Stock Opname (${changedOpnameItems.length} Perubahan)`
                : 'Simpan Hasil Stock Opname'}
            </button>
          </div>
        </div>

        {/* Global Opname Note bar */}
        <div className="px-5 py-3 bg-amber-50/50 border-b border-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <label className="font-bold text-brand-indigo flex items-center gap-1.5">
            Catatan Opname Umum (Opsional):
          </label>
          <input
            type="text"
            value={globalOpnameNote}
            onChange={(e) => setGlobalOpnameNote(e.target.value)}
            placeholder="Contoh: Stock opname rutin sore hari / Opname penutupan toko..."
            className="flex-1 max-w-xl px-3 py-1.5 bg-white border border-amber-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-yellow"
          />
        </div>

        {/* Opname Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase text-[10px] font-bold">
                <th className="p-3.5">Nama Kue</th>
                <th className="p-3.5">Harga / Toples</th>
                <th className="p-3.5 text-center">Stok Sistem Saat Ini</th>
                <th className="p-3.5 text-center">Input Stok Fisik Riil (Di Rak)</th>
                <th className="p-3.5 text-center">Selisih Otomatis (+ / -)</th>
                <th className="p-3.5">Catatan Per Produk</th>
                <th className="p-3.5 text-right">Mutasi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loadingData && products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400">
                    Memuat daftar produk &amp; stok rak...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">
                    Produk tidak ditemukan.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const actualStock = opnameDraft[p.id]?.actual_stock ?? p.stock;
                  const diff = actualStock - p.stock;
                  const itemNote = opnameDraft[p.id]?.notes ?? '';

                  return (
                    <tr
                      key={p.id}
                      className={`transition ${
                        diff !== 0 ? 'bg-amber-50/70' : 'hover:bg-gray-50/70'
                      }`}
                    >
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-amber-50 border border-gray-200 flex-shrink-0">
                            <img
                              src={p.image_url || '/logo.png'}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-bold text-brand-indigo">{p.name}</p>
                            <span className="text-[10px] text-gray-500">
                              Ukuran Toples {p.weight_grams} gr • {p.is_preorder ? 'Pre-Order' : 'Ready Stock'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 font-heading font-bold text-brand-red">
                        {formatRupiah(p.price)}
                      </td>

                      <td className="p-3.5 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-xl font-black text-xs ${
                            p.stock <= 5
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-brand-indigo'
                          }`}
                        >
                          {p.stock} toples
                        </span>
                      </td>

                      <td className="p-3.5 text-center">
                        <div className="inline-flex items-center gap-1 bg-white border border-gray-300 rounded-xl p-1 shadow-2xs">
                          <button
                            type="button"
                            onClick={() => handleOpnameStockChange(p.id, actualStock - 1)}
                            className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 font-bold"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min={0}
                            value={actualStock}
                            onChange={(e) => handleOpnameStockChange(p.id, Number(e.target.value))}
                            className="w-16 text-center font-heading font-black text-sm text-brand-indigo focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleOpnameStockChange(p.id, actualStock + 1)}
                            className="w-7 h-7 rounded-lg bg-brand-yellow hover:bg-amber-400 flex items-center justify-center text-brand-indigo font-bold"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      <td className="p-3.5 text-center">
                        {diff === 0 ? (
                          <span className="text-[11px] font-bold text-gray-400">Sesuai (0)</span>
                        ) : diff > 0 ? (
                          <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-black text-xs">
                            +{diff} toples
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-xl bg-red-100 text-red-700 font-black text-xs">
                            {diff} toples
                          </span>
                        )}
                      </td>

                      <td className="p-3.5">
                        <input
                          type="text"
                          value={itemNote}
                          onChange={(e) => handleOpnameNoteChange(p.id, e.target.value)}
                          placeholder="Ket. selisih (opsional)..."
                          className="w-full min-w-[150px] px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                        />
                      </td>

                      <td className="p-3.5 text-right whitespace-nowrap space-x-1">
                        <button
                          type="button"
                          onClick={() => openQuickMovementModal('out_offline', p.id)}
                          className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-brand-red border border-rose-200 rounded-lg font-bold text-[11px] transition"
                          title="Catat Terjual Offline / WA"
                        >
                          - Offline
                        </button>
                        <button
                          type="button"
                          onClick={() => openQuickMovementModal('in_production', p.id)}
                          className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg font-bold text-[11px] transition"
                          title="Tambah Produksi Baru"
                        >
                          + Produksi
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FITUR C: TABEL RIWAYAT MUTASI & RINGKASAN OFFLINE */}
      <div className="bg-white rounded-3xl border border-amber-100 shadow-cookie overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-brand-red block">
              Fitur C • Audit Log Stok
            </span>
            <h2 className="font-heading font-black text-lg text-brand-indigo flex items-center gap-2">
              <History className="w-5 h-5 text-brand-indigo" />
              Riwayat Mutasi Stok &amp; Penjualan Offline
            </h2>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-transparent font-bold text-brand-indigo focus:outline-none"
              >
                <option value="all">Semua Jenis Mutasi</option>
                <option value="out_offline">- Terjual Offline / WA</option>
                <option value="in_production">+ Produksi Masuk</option>
                <option value="opname_adjustment">± Penyesuaian Opname</option>
                <option value="damaged">- Tester / Rusak</option>
                <option value="out_online">- Terjual via Website</option>
              </select>
            </div>

            <select
              value={filterProductId}
              onChange={(e) => setFilterProductId(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-brand-indigo focus:outline-none"
            >
              <option value="all">Semua Produk Kue</option>
              {products.map((p) => (
                <option key={p.id} value={String(p.id)}>
                  {p.name}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-700 focus:outline-none"
            />

            {(filterType !== 'all' || filterProductId !== 'all' || filterDate !== '') && (
              <button
                type="button"
                onClick={() => {
                  setFilterType('all');
                  setFilterProductId('all');
                  setFilterDate('');
                }}
                className="px-2.5 py-1.5 text-brand-red font-bold hover:underline"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-brand-creamWarm border-b border-amber-100 text-gray-600 uppercase text-[10px] font-bold">
                <th className="p-3.5">Waktu</th>
                <th className="p-3.5">Nama Kue</th>
                <th className="p-3.5">Jenis Mutasi</th>
                <th className="p-3.5 text-center">Stok Awal</th>
                <th className="p-3.5 text-center">Perubahan</th>
                <th className="p-3.5 text-center">Stok Akhir</th>
                <th className="p-3.5 text-right">Omzet Offline</th>
                <th className="p-3.5">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loadingData && movements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-gray-400">
                    Memuat riwayat mutasi stok...
                  </td>
                </tr>
              ) : movements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-gray-400">
                    Belum ada riwayat mutasi stok pada filter ini.
                  </td>
                </tr>
              ) : (
                movements.map((m) => {
                  const badge = getMovementTypeBadge(m.type);
                  const BadgeIcon = badge.icon;
                  return (
                    <tr key={m.id} className="hover:bg-amber-50/30 transition">
                      <td className="p-3.5 whitespace-nowrap text-gray-500 font-medium">
                        {formatDate(m.created_at)}
                      </td>

                      <td className="p-3.5 font-bold text-brand-indigo">
                        {m.product?.name || `Produk #${m.product_id}`}
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${badge.bg} ${badge.text}`}
                        >
                          <BadgeIcon className="w-3 h-3" />
                          {badge.label}
                        </span>
                      </td>

                      <td className="p-3.5 text-center font-mono font-bold text-gray-600">
                        {m.stock_before}
                      </td>

                      <td className="p-3.5 text-center">
                        <span
                          className={`font-mono font-black px-2 py-0.5 rounded-lg text-xs ${
                            m.quantity_change > 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : m.quantity_change < 0
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {m.quantity_change > 0 ? `+${m.quantity_change}` : m.quantity_change}
                        </span>
                      </td>

                      <td className="p-3.5 text-center font-mono font-black text-brand-indigo">
                        {m.stock_after}
                      </td>

                      <td className="p-3.5 text-right font-heading font-bold">
                        {m.type === 'out_offline' && m.offline_revenue > 0 ? (
                          <span className="text-brand-red">{formatRupiah(m.offline_revenue)}</span>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>

                      <td className="p-3.5 text-gray-600 max-w-xs">
                        <p className="line-clamp-2">{m.notes || '-'}</p>
                        {m.creator?.name && (
                          <span className="text-[10px] text-gray-400 block">
                            Oleh: {m.creator.name}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FITUR B: MODAL CATAT STOK MASUK / TERJUAL OFFLINE CEPAT */}
      {showQuickModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-brand-indigo text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-heading font-bold text-sm sm:text-base flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-brand-yellow" />
                Catat Mutasi Stok Cepat (Offline / Produksi)
              </h3>
              <button
                type="button"
                onClick={() => setShowQuickModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitQuickMovement} className="p-5 sm:p-6 space-y-4">
              {quickError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{quickError}</span>
                </div>
              )}

              {/* Movement Type Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Jenis Mutasi Stok *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setQuickType('out_offline')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                      quickType === 'out_offline'
                        ? 'border-brand-red bg-rose-50 text-brand-red ring-2 ring-brand-red/20'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>- Terjual Offline</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setQuickType('in_production')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                      quickType === 'in_production'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Flame className="w-4 h-4" />
                    <span>+ Produksi Baru</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setQuickType('damaged')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                      quickType === 'damaged'
                        ? 'border-amber-600 bg-amber-50 text-amber-900 ring-2 ring-amber-500/20'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>- Tester / Rusak</span>
                  </button>
                </div>
              </div>

              {/* Product Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Pilih Produk Kue *
                </label>
                <select
                  value={quickProductId}
                  onChange={(e) => setQuickProductId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-brand-indigo focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — (Stok Saat Ini: {p.stock} toples • {formatRupiah(p.price)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity & Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Jumlah Toples *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={quickQty}
                    onChange={(e) => setQuickQty(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-black text-brand-indigo focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                  />
                </div>

                {selectedQuickProduct && (
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Estimasi Perubahan Stok:</span>
                    <p className="font-heading font-black text-sm text-brand-indigo mt-0.5">
                      {selectedQuickProduct.stock} &rarr;{' '}
                      <span
                        className={
                          quickType === 'in_production' ? 'text-emerald-700' : 'text-brand-red'
                        }
                      >
                        {quickType === 'in_production'
                          ? selectedQuickProduct.stock + quickQty
                          : Math.max(0, selectedQuickProduct.stock - quickQty)}{' '}
                        toples
                      </span>
                    </p>
                  </div>
                )}
              </div>

              {/* Offline Revenue if out_offline */}
              {quickType === 'out_offline' && (
                <div className="p-3.5 bg-rose-50/50 border border-rose-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-brand-indigo">Nilai Omzet Offline (Rp):</span>
                    <span className="font-heading font-black text-sm text-brand-red">
                      {formatRupiah(calculatedOfflineRevenue)}
                    </span>
                  </div>
                  <input
                    type="number"
                    min={0}
                    value={quickCustomRevenue}
                    onChange={(e) => setQuickCustomRevenue(e.target.value)}
                    placeholder={`Otomatis: Rp ${
                      selectedQuickProduct ? selectedQuickProduct.price * quickQty : 0
                    } (Isi jika ada diskon khusus)`}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                  />
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Catatan / Keterangan
                </label>
                <input
                  type="text"
                  value={quickNotes}
                  onChange={(e) => setQuickNotes(e.target.value)}
                  placeholder={
                    quickType === 'out_offline'
                      ? 'Contoh: Terjual WA Bu Ani (3 Nastar) / Beli langsung di dapur'
                      : quickType === 'in_production'
                      ? 'Contoh: Batch pagi baru matang dari oven'
                      : 'Contoh: Toples tester tamu dapur'
                  }
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowQuickModal(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingQuick}
                  className="btn-yellow px-6 py-2.5 text-xs font-black shadow-md disabled:opacity-60"
                >
                  {submittingQuick ? 'Menyimpan...' : 'Simpan Mutasi Stok'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

