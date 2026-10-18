'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Scale,
  Clock,
  ShieldCheck,
  Truck,
  Plus,
  Minus,
  ArrowLeft,
  Star,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { Product, useCart } from '@/context/CartContext';
import { formatRupiah, formatWeight } from '@/lib/formatters';
import ProductCard from '@/components/ProductCard';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);

  const { addToCart, setIsCartOpen } = useCart();

  useEffect(() => {
    async function loadProduct() {
      if (!slug) return;
      setLoading(true);
      const res = await fetchApi<{ data: Product; related: Product[] }>(`/products/${slug}`);
      if (res.data?.data) {
        setProduct(res.data.data);
        setRelated(res.data.related || []);
      }
      setLoading(false);
    }

    loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-pulse">
          <div className="aspect-square bg-gray-200 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-24 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-brand-red mx-auto" />
        <h2 className="font-heading font-bold text-2xl text-brand-indigo">Produk Tidak Ditemukan</h2>
        <p className="text-xs text-gray-500">Kue yang Anda cari mungkin sudah tidak aktif atau tautan salah.</p>
        <Link href="/" className="btn-yellow text-xs px-5 py-2.5 inline-flex">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2500);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    setIsCartOpen(false);
    router.push('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-8 sm:space-y-12 pb-24 md:pb-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
        <Link href="/" className="hover:text-brand-red transition flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Beranda
        </Link>
        <span>/</span>
        <span className="text-gray-400">{product.category?.name || 'Kue Kering'}</span>
        <span>/</span>
        <span className="text-brand-indigo font-bold truncate max-w-[200px]">{product.name}</span>
      </div>

      {/* Main Product Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Image View */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-white border-2 border-brand-yellow/30 shadow-cookie">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-heading text-xl text-amber-800 font-bold bg-amber-50">
                De&apos;nish Cookies
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5">
              {product.is_preorder ? (
                <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Pre-Order ({product.po_lead_days} hari produksi)
                </span>
              ) : (
                <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  Ready Stock (Siap Kirim)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Info & Actions */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100/60 px-2.5 py-1 rounded-lg">
              {product.category?.name || 'Kue Kering Homemade'}
            </span>
            <h1 className="font-heading font-black text-3xl sm:text-4xl text-brand-indigo leading-tight">
              {product.name}
            </h1>
            <div className="flex items-center gap-3 pt-1">
              <span className="flex items-center gap-1 text-xs text-amber-600 font-bold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> 4.9 / 5.0
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Pure Anchor Butter
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-purple-700 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Halal Resmi
              </span>
            </div>
          </div>

          {/* Pricing & Weight */}
          <div className="p-4 bg-brand-creamWarm rounded-2xl border border-brand-yellow/40 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-gray-500 font-semibold block uppercase">Harga per Toples</span>
              <span className="font-heading font-black text-3xl text-brand-red">
                {formatRupiah(product.price)}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-gray-500 font-semibold block uppercase">Berat Bersih</span>
              <span className="font-bold text-sm text-brand-indigo bg-white px-3 py-1 rounded-xl shadow-sm border border-amber-200 inline-flex items-center gap-1">
                <Scale className="w-4 h-4 text-amber-600" />
                {product.weight_grams} gram
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="font-heading font-bold text-sm text-brand-indigo uppercase tracking-wider">
              Deskripsi &amp; Keistimewaan
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Quantity Selector & CTAs */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Jumlah:</span>
              <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-2xl p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-heading font-bold text-base text-brand-indigo">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-8 h-8 rounded-xl bg-brand-yellow hover:bg-brand-yellowHover flex items-center justify-center text-brand-indigo font-bold transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <span className="text-xs text-gray-500">
                Total Berat: <strong>{formatWeight(product.weight_grams * quantity)}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className="btn-yellow justify-center text-sm py-3.5"
              >
                <ShoppingBag className="w-4 h-4" /> Tambah ke Keranjang
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="btn-primary justify-center text-sm py-3.5"
              >
                Beli Sekarang &amp; Checkout
              </button>
            </div>

            {addedNotice && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 flex items-center gap-2 animate-fade-in font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                Berhasil menambahkan {quantity} toples ke keranjang belanja!
              </div>
            )}
          </div>

          {/* Shipping Assurance Box */}
          <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-2 text-xs text-gray-600">
            <div className="flex items-center gap-2 font-bold text-brand-indigo">
              <Truck className="w-4 h-4 text-brand-red" />
              Pilihan Pengiriman Tersedia:
            </div>
            <p>
              • <strong>Gojek Instant &amp; SameDay:</strong> Wilayah Kota Bandung &amp; sekitarnya langsung sampai dari Kitchen Antapani, Kota Bandung.
            </p>
            <p>
              • <strong>Paxel Safe-Box Khusus Makanan:</strong> Pengiriman luar kota (Jabodetabek, Semarang, Surabaya, Bali, dll) dengan kardus pelindung khusus anti remuk dan penanganan Food Safe.
            </p>
          </div>

          {/* Halal Assurance Box */}
          <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200/80 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-purple-950">
              <div className="flex items-center gap-1 p-0.5 bg-white rounded-md border border-purple-200">
                <img src="/logo_halal_124_ungu.png" alt="Halal Indonesia" className="h-5 w-auto object-contain" />
                <img src="/logo_halal_224_ungu.png" alt="Halal MUI" className="h-5 w-auto object-contain" />
              </div>
              <span>Sertifikat Halal Resmi Terverifikasi:</span>
            </div>
            <div className="font-mono text-[11px] font-bold text-brand-indigo flex flex-wrap gap-x-4 gap-y-1">
              <span>No. 1: <strong className="text-purple-900">ID32110015308660124</strong></span>
              <span>No. 2: <strong className="text-purple-900">ID32110015422560224</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="pt-10 border-t border-amber-100 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-black text-2xl text-brand-indigo">
              Kue Kering Terkait
            </h2>
            <Link href="/#katalog" className="text-xs font-bold text-brand-red hover:underline">
              Lihat Semua Koleksi &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
            {related.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
