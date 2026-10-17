'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Cookie,
  Plus,
  Edit2,
  Trash2,
  Search,
  Scale,
  Clock,
  Sparkles,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/lib/api';
import { formatRupiah, formatWeight } from '@/lib/formatters';
import AdminHeader from '@/components/AdminHeader';

export default function AdminProductsPage() {
  const router = useRouter();
  const { isAdmin, isLoading } = useAuth();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // Form State
  const [categoryId, setCategoryId] = useState<number>(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(135000);
  const [weightGrams, setWeightGrams] = useState<number>(500);
  const [stock, setStock] = useState<number>(20);
  const [isPreorder, setIsPreorder] = useState(false);
  const [poLeadDays, setPoLeadDays] = useState<number>(2);
  const [imageUrl, setImageUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const [prodRes, catRes] = await Promise.all([
      fetchApi<{ data: any[] }>(`/admin/products?search=${encodeURIComponent(search)}`),
      fetchApi<{ data: any[] }>('/categories'),
    ]);

    if (prodRes.data?.data) {
      setProducts(prodRes.data.data);
    }
    if (catRes.data?.data) {
      setCategories(catRes.data.data);
      if (catRes.data.data.length > 0 && !categoryId) {
        setCategoryId(catRes.data.data[0].id);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/login');
      return;
    }
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin, isLoading, search]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice(135000);
    setWeightGrams(500);
    setStock(20);
    setIsPreorder(false);
    setPoLeadDays(2);
    setImageUrl('https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=700&q=80');
    setIsFeatured(false);
    setIsActive(true);
    setFormError(null);
    setShowModal(true);
  };

  const openEditModal = (p: any) => {
    setEditingProduct(p);
    setCategoryId(p.category_id);
    setName(p.name);
    setDescription(p.description || '');
    setPrice(p.price);
    setWeightGrams(p.weight_grams);
    setStock(p.stock);
    setIsPreorder(Boolean(p.is_preorder));
    setPoLeadDays(p.po_lead_days || 2);
    setImageUrl(p.image_url || '');
    setIsFeatured(Boolean(p.is_featured));
    setIsActive(Boolean(p.is_active));
    setFormError(null);
    setShowModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    const payload = {
      category_id: categoryId,
      name,
      description,
      price,
      weight_grams: weightGrams,
      stock,
      is_preorder: isPreorder,
      po_lead_days: poLeadDays,
      image_url: imageUrl,
      is_featured: isFeatured,
      is_active: isActive,
    };

    let res;
    if (editingProduct) {
      res = await fetchApi(`/admin/products/${editingProduct.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } else {
      res = await fetchApi('/admin/products', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }

    if (res.data) {
      setShowModal(false);
      loadData();
    } else {
      setFormError(res.error || 'Gagal menyimpan data produk.');
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Yakin ingin menghapus produk ini dari katalog?')) {
      await fetchApi(`/admin/products/${id}`, { method: 'DELETE' });
      loadData();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <AdminHeader />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl text-brand-indigo">
            Manajemen Produk &amp; Stok Kue Kering
          </h1>
          <p className="text-xs text-gray-500">
            Atur bobot gramasi (krusial untuk kurir), status Ready vs Pre-Order, dan inventori toples.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="btn-yellow text-xs px-4 py-2.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Tambah Produk Baru
        </button>
      </div>

      {/* Search Filter */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama kue kering..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>

        <span className="text-xs font-bold text-gray-500 hidden sm:inline">
          Total: {products.length} Produk
        </span>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-amber-100 shadow-cookie overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-brand-creamWarm border-b border-amber-100 text-gray-600 uppercase text-[10px] font-bold">
                <th className="p-4">Foto &amp; Nama Kue</th>
                <th className="p-4">Kategori</th>
                <th className="p-4">Harga Toples</th>
                <th className="p-4">Berat (Gram)</th>
                <th className="p-4">Stok Ready</th>
                <th className="p-4">Mode Pesanan</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400">
                    Memuat data produk...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400">
                    Belum ada produk yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-amber-50/40 transition">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-amber-50 flex-shrink-0 border border-gray-200">
                        <img
                          src={p.image_url || '/logo.jpg'}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="truncate max-w-[200px]">
                        <p className="font-bold text-brand-indigo truncate">{p.name}</p>
                        {p.is_featured && (
                          <span className="text-[10px] text-brand-red font-black flex items-center gap-0.5">
                            <Sparkles className="w-3 h-3" /> Best Seller
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-4 text-gray-600 font-semibold">
                      {p.category?.name || '-'}
                    </td>

                    <td className="p-4 font-heading font-black text-brand-red text-sm">
                      {formatRupiah(p.price)}
                    </td>

                    <td className="p-4">
                      <span className="px-2 py-1 bg-amber-100/70 text-brand-indigo font-bold rounded-lg text-xs inline-flex items-center gap-1">
                        <Scale className="w-3 h-3 text-amber-700" />
                        {p.weight_grams} gr
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`font-black text-xs px-2.5 py-1 rounded-xl ${
                          p.stock <= 5
                            ? 'bg-red-100 text-red-700'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {p.stock} toples
                      </span>
                    </td>

                    <td className="p-4">
                      {p.is_preorder ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          PO ({p.po_lead_days} hari)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Ready Stock
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-right space-x-1">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 text-brand-indigo hover:text-brand-red hover:bg-gray-100 rounded-lg transition"
                        title="Edit Produk"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded-lg transition"
                        title="Hapus Produk"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Product */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden my-8 border border-gray-200">
            <div className="bg-brand-indigo text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-heading font-bold text-base flex items-center gap-2">
                <Cookie className="w-4 h-4 text-brand-yellow" />
                {editingProduct ? 'Edit Data Produk Kue' : 'Tambah Produk Kue Kering Baru'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Nama Kue Kering *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Nastar Wisman Spesial 500gr"
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Kategori *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-yellow font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Deskripsi &amp; Resep Singkat
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Deskripsi bahan, butter wijsman, nanas madu homemade..."
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Harga (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Berat (Gram) *
                  </label>
                  <input
                    type="number"
                    required
                    value={weightGrams}
                    onChange={(e) => setWeightGrams(Number(e.target.value))}
                    placeholder="500"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Stok Ready (Toples) *
                  </label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  URL Foto Produk
                </label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                />
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
                  <input
                    type="checkbox"
                    checked={isPreorder}
                    onChange={(e) => setIsPreorder(e.target.checked)}
                    className="rounded text-brand-red focus:ring-brand-red w-4 h-4"
                  />
                  <span>Produk Pre-Order (PO)</span>
                </label>

                {isPreorder && (
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      Lead Time Produksi (Hari)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={poLeadDays}
                      onChange={(e) => setPoLeadDays(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded text-brand-red focus:ring-brand-red w-4 h-4"
                  />
                  <span>Tampilkan di Best Seller</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded text-brand-red focus:ring-brand-red w-4 h-4"
                  />
                  <span>Aktif di Katalog Toko</span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-yellow text-xs px-5 py-2 font-black"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
