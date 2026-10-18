'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ShoppingBag,
  Truck,
  ShieldCheck,
  Heart,
  Search,
  ChevronRight,
  Flame,
  Award,
  Package,
  Layers,
  Zap,
  MapPin,
  Clock,
  Snowflake,
  Shield,
  Navigation,
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { Product } from '@/context/CartContext';
import ProductCard from '@/components/ProductCard';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all'); // 'all', 'ready', 'preorder'
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Load products & categories
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedType !== 'all') params.append('type', selectedType);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const [prodRes, catRes] = await Promise.all([
        fetchApi<{ data: Product[] }>(`/products?${params.toString()}`),
        fetchApi<{ data: any[] }>('/categories'),
      ]);

      if (prodRes.data?.data) {
        setProducts(prodRes.data.data);
      }
      if (catRes.data?.data) {
        setCategories(catRes.data.data);
      }
      setLoading(false);
    }

    const timer = setTimeout(() => {
      loadData();
    }, 200);

    return () => clearTimeout(timer);
  }, [selectedCategory, selectedType, searchQuery]);

  return (
    <div className="space-y-16 pb-20">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FFF3B0] via-[#FFD100] to-[#F59E0B] pt-12 pb-20 sm:pb-24 lg:pt-16 lg:pb-32">
        {/* Warm Radial Glow / Soft Light */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#FFF8D6_0%,_#FFD100_55%,_#F59E0B_100%)] opacity-90 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[950px] h-[500px] sm:h-[700px] bg-[#FFFBEA]/45 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/25 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-amber-400/35 blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Hero Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-brand-indigo/15 text-brand-indigo text-xs font-extrabold shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-red animate-ping" />
                <Sparkles className="w-4 h-4 text-brand-red" />
                Pilihan Terbaik Hari Raya &amp; Hantaran
              </div>

              <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl text-brand-indigo leading-tight tracking-tight">
                Making Taste Better, <br />
                <span className="text-brand-red drop-shadow-sm">Premium Homemade</span> Cookies.
              </h1>

              <p className="text-base sm:text-lg text-brand-indigo/85 font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Kelezatan kue kering homemade dengan aroma semerbak 100% pure Anchor butter murni. Dipanggang fresh setiap hari dari bahan-bahan pilihan berkualitas yang lembut dan lumer di mulut.
              </p>

              {/* Halal Trust Badge with Explicit Certificate Numbers */}
              <div className="bg-white/95 backdrop-blur-sm p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-md border border-brand-indigo/10 max-w-lg mx-auto lg:mx-0 space-y-2 sm:space-y-2.5">
                <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-4">
                  <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0 bg-purple-50/90 p-1.5 rounded-xl border border-purple-100">
                    <img
                      src="/logo_halal_124_ungu.png"
                      alt="Logo Halal Indonesia"
                      className="h-9 sm:h-12 w-auto object-contain"
                    />
                    <img
                      src="/logo_halal_224_ungu.png"
                      alt="Logo Halal MUI"
                      className="h-9 sm:h-12 w-auto object-contain"
                    />
                  </div>
                  <div className="text-center sm:text-left flex-1">
                    <div className="flex items-center justify-center sm:justify-start gap-1.5">
                      <span className="text-xs sm:text-sm font-black text-brand-indigo tracking-tight">
                        100% Terjamin Halal Resmi
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                        Terverifikasi
                      </span>
                    </div>
                    <p className="text-[10.5px] sm:text-[11px] text-gray-600 font-medium mt-0.5">
                      Bahan Baku &amp; Proses Produksi Bersertifikat Halal
                    </p>
                  </div>
                </div>

                {/* Explicit Certificate Numbers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 pt-2 border-t border-brand-indigo/10 text-left">
                  <div className="bg-purple-50/70 border border-purple-200/80 rounded-xl px-2.5 py-1 sm:py-1.5 flex items-center justify-between sm:justify-start gap-2 shadow-2xs">
                    <span className="text-[9.5px] sm:text-[10px] font-bold text-purple-900 uppercase tracking-wider flex-shrink-0">
                      Sertifikat 1:
                    </span>
                    <span className="font-mono font-bold text-[10.5px] sm:text-xs text-purple-950 tracking-wider">
                      ID32110015308660124
                    </span>
                  </div>
                  <div className="bg-purple-50/70 border border-purple-200/80 rounded-xl px-2.5 py-1 sm:py-1.5 flex items-center justify-between sm:justify-start gap-2 shadow-2xs">
                    <span className="text-[9.5px] sm:text-[10px] font-bold text-purple-900 uppercase tracking-wider flex-shrink-0">
                      Sertifikat 2:
                    </span>
                    <span className="font-mono font-bold text-[10.5px] sm:text-xs text-purple-950 tracking-wider">
                      ID32110015422560224
                    </span>
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-1">
                <a href="#katalog" className="btn-primary text-sm px-7 py-4 w-full sm:w-auto">
                  <ShoppingBag className="w-4 h-4" /> Belanja Sekarang
                </a>
                <a href="#pengiriman" className="btn-secondary text-sm px-6 py-4 w-full sm:w-auto">
                  <Truck className="w-4 h-4 text-brand-yellow" /> Info Ongkir Paxel &amp; Gojek
                </a>
              </div>

              {/* Quick Trust Badges with Micro-Icons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-3 sm:pt-4 border-t border-brand-indigo/15 max-w-lg mx-auto lg:mx-0 text-left">
                <div className="bg-white/70 backdrop-blur-sm p-3 rounded-2xl border border-brand-indigo/10 flex items-center sm:items-start gap-2.5 sm:gap-2">
                  <div className="w-7 h-7 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-700">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-brand-indigo block">100% Pure Anchor</span>
                    <span className="text-[11px] text-gray-700 block leading-tight">Butter New Zealand murni</span>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm p-3 rounded-2xl border border-brand-indigo/10 flex items-center sm:items-start gap-2.5 sm:gap-2">
                  <div className="w-7 h-7 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-700">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-brand-indigo block">Paxel Safe Box</span>
                    <span className="text-[11px] text-gray-700 block leading-tight">Anti hancur se-Jawa</span>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm p-3 rounded-2xl border border-brand-indigo/10 flex items-center sm:items-start gap-2.5 sm:gap-2">
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-700">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-brand-indigo block">Gojek Instant</span>
                    <span className="text-[11px] text-gray-700 block leading-tight">Area Bandung 1-3 Jam</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Card with Decorative Halo & Floating Badges */}
            <div className="lg:col-span-5 relative flex items-center justify-center py-6 lg:py-0">
              {/* Decorative Halo & Dashed Ring framing behind Card */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] sm:w-[420px] sm:h-[420px] rounded-full bg-white/35 blur-2xl pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] sm:w-[440px] sm:h-[440px] rounded-full border-2 border-dashed border-[#2E1A7A]/15 pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] sm:w-[470px] sm:h-[470px] rounded-full border border-white/40 pointer-events-none" />

              {/* Card Container with Floating Badges */}
              <div className="relative mx-auto w-full max-w-md">
                {/* Floating Badge 1: Top-Left */}
                <div className="absolute -top-3 sm:-top-4 -left-2 sm:-left-4 z-20 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-lg border border-[#2E1A7A]/10 flex items-center gap-1.5 text-xs font-bold text-brand-indigo transition-all duration-300 hover:scale-105 select-none animate-pulse">
                  <span className="text-sm sm:text-base leading-none">🧀</span>
                  <span>Taburan Keju Melimpah</span>
                </div>

                {/* Floating Badge 2: Bottom-Right */}
                <div className="absolute -bottom-3 sm:-bottom-4 -right-2 sm:-right-4 z-20 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-lg border border-[#2E1A7A]/10 flex items-center gap-1.5 text-xs font-bold text-brand-indigo transition-all duration-300 hover:scale-105 select-none">
                  <span className="text-sm sm:text-base leading-none">🧈</span>
                  <span>100% Pure Anchor Butter</span>
                </div>

                {/* The Card */}
                <div className="relative bg-white p-4 rounded-3xl shadow-2xl hover:shadow-amber-500/25 border-4 border-white rotate-1 hover:rotate-0 transition-all duration-500">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-amber-100">
                    <img
                      src="/nastar_keju.jpg"
                      alt="Nastar Keju De'nish Cookies"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-brand-red text-white text-xs font-black px-3 py-1 rounded-full shadow-md uppercase">
                      Favorit Keluarga
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <span className="text-xs font-bold text-amber-700 uppercase block mb-1">Signature Festive</span>
                      <h3 className="font-heading font-black text-2xl text-brand-indigo">
                        Nastar Keju
                      </h3>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Perpaduan adonan nastar lembut yang lumer di mulut dengan isian selai nanas pilihan dan taburan keju gurih yang melimpah.
                    </p>
                    <div className="pt-2">
                      <a
                        href="#katalog"
                        className="w-full py-3 bg-brand-yellow hover:bg-brand-yellowHover text-brand-indigo font-black text-xs rounded-xl shadow-cookie flex items-center justify-center gap-2 transition active:scale-95"
                      >
                        <ShoppingBag className="w-4 h-4" /> Beli Toples Ini
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Smooth Wave Curve Divider to Cream Section Below */}
        <div className="absolute -bottom-[1px] left-0 right-0 w-full overflow-hidden leading-none pointer-events-none z-10">
          <svg
            className="relative block w-full h-8 sm:h-12 md:h-16 lg:h-20 text-[#FFFDF5] fill-current"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path d="M0,45 C180,95 380,10 580,55 C780,100 980,25 1200,50 L1200,120 L0,120 Z" />
          </svg>
        </div>
      </section>

      {/* WHY CHOOSE DE'NISH COOKIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
          <span className="text-xs font-black uppercase tracking-widest text-brand-red">
            Kualitas Tanpa Kompromi
          </span>
          <h2 className="font-heading font-black text-3xl sm:text-4xl text-brand-indigo">
            Kenapa Memilih De&apos;nish Cookies?
          </h2>
          <p className="text-sm text-gray-600">
            Setiap toples kue dipanggang dengan standar kebersihan tinggi dan bahan premium pilihan untuk menghadirkan rasa otentik yang tak terlupakan.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: 100% Halal & Higienis */}
          <div className="bg-white p-6 rounded-3xl border border-purple-100 shadow-cookie space-y-3.5 hover:-translate-y-1 transition duration-300 relative">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 p-1.5 bg-purple-50 rounded-2xl border border-purple-200/60">
                <img
                  src="/logo_halal_124_ungu.png"
                  alt="Logo Halal Indonesia"
                  className="h-10 sm:h-11 w-auto object-contain"
                />
                <img
                  src="/logo_halal_224_ungu.png"
                  alt="Logo Halal MUI"
                  className="h-10 sm:h-11 w-auto object-contain"
                />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-full">
                Sertifikat Resmi
              </span>
            </div>

            <h3 className="font-heading font-bold text-lg text-brand-indigo">
              100% Halal &amp; Higienis
            </h3>

            {/* Kotak Informasi Nomor Sertifikat Halal */}
            <div className="bg-purple-50/70 border border-purple-200/70 rounded-2xl p-2.5 space-y-1 text-left">
              <div className="text-[10px] font-black uppercase tracking-wider text-purple-900 flex items-center justify-between">
                <span>No. Sertifikat Halal:</span>
                <span className="text-emerald-700 font-bold">BPJPH / MUI</span>
              </div>
              <div className="space-y-0.5">
                <div className="font-mono text-[11px] font-bold text-brand-indigo bg-white px-2 py-0.5 rounded-lg border border-purple-100">
                  ID32110015308660124
                </div>
                <div className="font-mono text-[11px] font-bold text-brand-indigo bg-white px-2 py-0.5 rounded-lg border border-purple-100">
                  ID32110015422560224
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Seluruh varian kue kering De&apos;nish Cookies diproduksi secara higienis menggunakan bahan baku berkualitas yang 100% terjamin kehalalannya, aman dan tenang dikonsumsi bersama keluarga tercinta.
            </p>
          </div>

          {/* Card 2: 100% Pure Anchor Butter */}
          <div className="bg-white p-6 rounded-3xl border border-amber-200/70 shadow-cookie space-y-3 hover:-translate-y-1 transition duration-300">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Award className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="font-heading font-bold text-lg text-brand-indigo">100% Pure Anchor Butter</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Menggunakan pure New Zealand Anchor butter asli tanpa campuran margarin murah. Menghasilkan rasa gurih legit, tekstur lumer, dan aroma semerbak.
            </p>
          </div>

          {/* Card 3: Freshly Baked Homemade */}
          <div className="bg-white p-6 rounded-3xl border border-orange-200/70 shadow-cookie space-y-3 hover:-translate-y-1 transition duration-300">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Flame className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-heading font-bold text-lg text-brand-indigo">Freshly Baked Homemade</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Bukan kue pabrikan massal. Setiap batch dipanggang secara higienis tanpa pengawet di dapur kami di Antapani, Kota Bandung.
            </p>
          </div>

          {/* Card 4: Paxel Safe-Box Luar Kota */}
          <div className="bg-white p-6 rounded-3xl border border-blue-200/70 shadow-cookie space-y-3 hover:-translate-y-1 transition duration-300">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-heading font-bold text-lg text-brand-indigo">Paxel Safe-Box Luar Kota</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Kirim ke Bandung, Surabaya, Medan dll aman tanpa hancur berkat kemasan kardus khusus dan rantai dingin Paxel.
            </p>
          </div>
        </div>
      </section>

      {/* PRODUCT CATALOG SECTION */}
      <section id="katalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-brand-red">
              Katalog Lengkap
            </span>
            <h2 className="font-heading font-black text-3xl text-brand-indigo">
              Pilihan Toples &amp; Hampers Istimewa
            </h2>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nastar, kastengel..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-yellow shadow-sm"
            />
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-6 border-b border-amber-100">
          {/* Category Tabs (Horizontally scrollable on mobile) */}
          <div className="flex items-center overflow-x-auto no-scrollbar gap-2 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 w-[calc(100%+2rem)] sm:w-auto">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 sm:px-4 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap flex-shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-brand-indigo text-white shadow-sm'
                  : 'bg-white text-brand-indigo border border-gray-200 hover:border-brand-yellow'
              }`}
            >
              Semua Kategori
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-3.5 sm:px-4 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap flex-shrink-0 ${
                  selectedCategory === cat.slug
                    ? 'bg-brand-indigo text-white shadow-sm'
                    : 'bg-white text-brand-indigo border border-gray-200 hover:border-brand-yellow'
                }`}
              >
                {cat.name} {cat.products_count ? `(${cat.products_count})` : ''}
              </button>
            ))}
          </div>

          {/* Stock / PO Filter Toggle */}
          <div className="flex items-center gap-1.5 bg-amber-50 p-1 rounded-2xl border border-amber-200 text-xs font-bold self-start md:self-auto overflow-x-auto">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap ${
                selectedType === 'all' ? 'bg-white text-brand-indigo shadow-sm' : 'text-amber-800'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setSelectedType('ready')}
              className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap ${
                selectedType === 'ready' ? 'bg-emerald-600 text-white shadow-sm' : 'text-amber-800'
              }`}
            >
              Ready Stock
            </button>
            <button
              onClick={() => setSelectedType('preorder')}
              className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap ${
                selectedType === 'preorder' ? 'bg-amber-600 text-white shadow-sm' : 'text-amber-800'
              }`}
            >
              Pre-Order
            </button>
          </div>
        </div>

        {/* Product Grid (2-column on mobile, 4-column on desktop) */}
        <div className="mt-6 sm:mt-8">
          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-gray-100 shadow-sm animate-pulse space-y-2 sm:space-y-3">
                  <div className="aspect-square bg-gray-200 rounded-xl sm:rounded-2xl" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-full hidden sm:block" />
                  <div className="h-5 bg-gray-200 rounded w-1/2 pt-1" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-3">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="font-heading font-bold text-lg text-brand-indigo">
                Kue yang dicari belum ditemukan
              </h3>
              <p className="text-xs text-gray-500">
                Coba gunakan kata kunci lain atau pilih kategori &quot;Semua Kategori&quot;.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedType('all');
                  setSearchQuery('');
                }}
                className="btn-yellow text-xs px-4 py-2"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* SHIPPING INFO SECTION: GOJEK DALAM KOTA & PAXEL LUAR KOTA */}
      <section id="pengiriman" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#1C0F45] via-[#2E1A7A] to-[#160B3B] text-white rounded-3xl p-6 sm:p-10 lg:p-12 shadow-2xl relative overflow-hidden border border-brand-yellow/30">
          <div className="absolute inset-0 bg-bakery-pattern opacity-10 pointer-events-none" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-yellow/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-8">
            {/* Header */}
            <div className="max-w-3xl space-y-3 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-yellow/15 border border-brand-yellow/30 text-brand-yellow text-xs font-black uppercase tracking-wider">
                <Truck className="w-3.5 h-3.5" />
                <span>Sistem Logistik Spesialis Kue Kering</span>
              </div>
              <h2 className="font-heading font-black text-3xl sm:text-4xl text-white tracking-tight">
                Pengiriman Ekstra Aman &amp; Terjamin
              </h2>
              <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed max-w-2xl">
                Kami memahami kue kering rapuh dan mudah remuk. De&apos;nish Cookies bekerja sama langsung dengan <strong className="text-brand-yellow">Gojek Instant (Dalam Kota Bandung)</strong> dan <strong className="text-purple-300">Paxel Cold-Chain (Luar Kota Se-Indonesia)</strong> yang dilengkapi fasilitas pendingin dan kardus khusus makanan agar kue tiba utuh &amp; renyah.
              </p>
            </div>

            {/* ANIMATED DELIVERY EXPRESSWAY ROAD (Mobil & Motor Berjalan) */}
            <div className="bg-[#12082E]/90 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-brand-yellow/25 relative overflow-hidden shadow-inner space-y-3">
              {/* Top Route Points & Guarantee Badge */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                {/* Point A: Kitchen Antapani */}
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                  <div className="relative flex items-center justify-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping absolute" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 relative" />
                  </div>
                  <div>
                    <span className="font-bold text-white text-[11px] sm:text-xs block">🏠 Kitchen Antapani</span>
                    <span className="text-[10px] text-amber-300 font-medium block">Pusat Dapur Bandung</span>
                  </div>
                </div>

                {/* Center Route Guarantee Pill */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-yellow/15 border border-brand-yellow/40 text-brand-yellow text-[10px] sm:text-[11px] font-black uppercase tracking-wider shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-yellow" />
                  <span>Jalur Logistik Anti Hancur Se-Jawa</span>
                </div>

                {/* Point B: Customer's Doorstep */}
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                  <MapPin className="w-4 h-4 text-brand-red flex-shrink-0" />
                  <div>
                    <span className="font-bold text-white text-[11px] sm:text-xs block">📍 Rumah Anda</span>
                    <span className="text-[10px] text-emerald-300 font-extrabold block">Tiba Utuh &amp; Renyah</span>
                  </div>
                </div>
              </div>

              {/* The Highway Road Track with Moving Vehicles */}
              <div className="relative h-14 sm:h-18 bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 rounded-xl sm:rounded-2xl overflow-hidden border border-white/15 flex items-center shadow-2xl">
                {/* Road Curbs (Top & Bottom Yellow Borders) */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-yellow via-white to-brand-yellow opacity-40" />
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-yellow via-white to-brand-yellow opacity-40" />

                {/* Road Center Dashed Line in Motion */}
                <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-0.5 animate-road-dash opacity-70" />

                {/* Moving Vehicle 1: Paxel Cold-Chain Van (Truck) */}
                <div className="absolute top-1/2 -translate-y-1/2 animate-delivery-van pointer-events-none z-10 flex items-center">
                  <div className="animate-vehicle-bob flex items-center gap-1.5 bg-purple-950/95 text-white px-3 py-1.5 rounded-2xl border border-purple-400 shadow-xl text-xs font-black whitespace-nowrap">
                    <span className="text-base sm:text-lg leading-none">🚚</span>
                    <span className="text-[10px] sm:text-[11px] text-purple-200 font-extrabold">Paxel Cold-Chain</span>
                    <span className="text-xs text-cyan-300">❄️</span>
                  </div>
                </div>

                {/* Moving Vehicle 2: Gojek Instant Motorcycle */}
                <div className="absolute top-1/2 -translate-y-1/2 animate-delivery-bike pointer-events-none z-10 flex items-center">
                  <div className="animate-vehicle-bob flex items-center gap-1.5 bg-emerald-950/95 text-white px-2.5 py-1.5 rounded-2xl border border-emerald-400 shadow-xl text-xs font-black whitespace-nowrap">
                    <span className="text-base sm:text-lg leading-none">🛵</span>
                    <span className="text-[10px] sm:text-[11px] text-emerald-200 font-extrabold">Gojek Instant</span>
                    <span className="text-xs text-amber-300">⚡</span>
                  </div>
                </div>
              </div>

              {/* Bottom Road Micro Caption */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-[10.5px] text-indigo-200/80 pt-1 px-1 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> GPS OpenStreetMap Terintegrasi
                </span>
                <span className="text-brand-yellow font-bold">
                  Kardus Makanan Khusus + Bubble Wrap Tebal Berlapis
                </span>
              </div>
            </div>

            {/* 2 Detailed Cards: Gojek & Paxel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Gojek Card */}
              <div className="bg-white/10 backdrop-blur-md p-6 sm:p-7 rounded-3xl border border-emerald-400/25 space-y-5 hover:border-emerald-400/50 hover:-translate-y-1 transition duration-300 shadow-xl">
                {/* Header with Visual Icon */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center font-black shadow-lg flex-shrink-0 text-xl">
                      🛵
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-heading font-black text-xl text-white">Gojek Dalam Kota</h3>
                        <span className="px-2 py-0.5 bg-emerald-500/30 text-emerald-300 rounded-full text-[10px] font-black uppercase">
                          Area Bandung
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-300 font-bold mt-0.5">
                        Jemput dari Kitchen Antapani (Radius s/d 40 km)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Features Specs Cards */}
                <div className="space-y-2.5 text-xs">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-3 space-y-1">
                    <div className="flex items-center justify-between text-emerald-300 font-extrabold text-[11px]">
                      <span>⚡ Gojek Instant (Prioritas Utama)</span>
                      <span className="text-amber-300">1–3 Jam Tiba</span>
                    </div>
                    <p className="text-indigo-100 text-[11px] leading-relaxed">
                      Tarif Rp 4.000/km (min. Rp 15.000). Pengantaran langsung tanpa operan, kapasitas muat s/d 20 kg toples.
                    </p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-3 space-y-1">
                    <div className="flex items-center justify-between text-emerald-300 font-extrabold text-[11px]">
                      <span>🛵 Gojek SameDay (Opsi Hemat)</span>
                      <span className="text-amber-300">Hari yang Sama</span>
                    </div>
                    <p className="text-indigo-100 text-[11px] leading-relaxed">
                      Tarif flat hemat Rp 18.000 (&le;15 km) &amp; Rp 25.000 (15–40 km). Maksimal 7 kg toples.
                    </p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-300 font-extrabold text-[11px]">
                      <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Kalkulasi Otomatis Jarak GPS</span>
                    </div>
                    <p className="text-indigo-100 text-[11px] leading-relaxed">
                      Jarak dan ongkir dihitung otomatis dari koordinat GPS Kitchen Antapani via peta terintegrasi.
                    </p>
                  </div>
                </div>
              </div>

              {/* Paxel Card */}
              <div className="bg-white/10 backdrop-blur-md p-6 sm:p-7 rounded-3xl border border-purple-400/25 space-y-5 hover:border-purple-400/50 hover:-translate-y-1 transition duration-300 shadow-xl">
                {/* Header with Visual Icon */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center font-black shadow-lg flex-shrink-0 text-xl">
                      🚚
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-heading font-black text-xl text-white">Paxel Antar Kota</h3>
                        <span className="px-2 py-0.5 bg-purple-500/30 text-purple-300 rounded-full text-[10px] font-black uppercase">
                          Luar Kota
                        </span>
                      </div>
                      <p className="text-[11px] text-purple-300 font-bold mt-0.5">
                        Ekspedisi Spesialis Paket Makanan Se-Indonesia
                      </p>
                    </div>
                  </div>
                </div>

                {/* Features Specs Cards */}
                <div className="space-y-2.5 text-xs">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-3 space-y-1">
                    <div className="flex items-center justify-between text-purple-300 font-extrabold text-[11px]">
                      <span>❄️ Rantai Pendingin (Cold-Chain)</span>
                      <span className="text-cyan-300">Food-Safe Certified</span>
                    </div>
                    <p className="text-indigo-100 text-[11px] leading-relaxed">
                      Fasilitas pendingin menjaga butter Anchor tetap segar, wangi, dan tidak berminyak/lumer di jalan.
                    </p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-3 space-y-1">
                    <div className="flex items-center justify-between text-purple-300 font-extrabold text-[11px]">
                      <span>📦 Kardus Makanan Berstandar Tier Box</span>
                      <span className="text-amber-300">S / M / L</span>
                    </div>
                    <p className="text-indigo-100 text-[11px] leading-relaxed">
                      Tersedia Box Small (&le;1.5kg), Medium (&le;3kg), dan Large (&le;5kg) yang pas dengan ukuran toples kue.
                    </p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-purple-300 font-extrabold text-[11px]">
                      <Package className="w-3.5 h-3.5 text-purple-400" />
                      <span>Auto Split Box Cerdas (&gt;5 kg)</span>
                    </div>
                    <p className="text-indigo-100 text-[11px] leading-relaxed">
                      Pesanan lebih dari 5 kg otomatis dipecah kelipatan kardus agar toples di tumpukan bawah tidak tertindih.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 4-Step Reassurance Journey Bar */}
            <div className="pt-2">
              <div className="text-center mb-3">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-brand-yellow">
                  4 Langkah Jaminan Kue Utuh &amp; Renyah Sampai Meja Anda
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 text-center space-y-1 hover:bg-white/10 transition">
                  <span className="text-xl sm:text-2xl block">🔥</span>
                  <span className="text-xs font-bold text-white block">1. Freshly Baked</span>
                  <span className="text-[10px] text-indigo-200 block">Dipanggang fresh di Kitchen</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 text-center space-y-1 hover:bg-white/10 transition">
                  <span className="text-xl sm:text-2xl block">🛡️</span>
                  <span className="text-xs font-bold text-white block">2. Segel &amp; Bubble Wrap</span>
                  <span className="text-[10px] text-indigo-200 block">Toples tersegel kedap udara</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 text-center space-y-1 hover:bg-white/10 transition">
                  <span className="text-xl sm:text-2xl block">📦</span>
                  <span className="text-xs font-bold text-white block">3. Kardus Khusus Makanan</span>
                  <span className="text-[10px] text-indigo-200 block">Paxel Safe-Box anti guncang</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 text-center space-y-1 hover:bg-white/10 transition">
                  <span className="text-xl sm:text-2xl block">✨</span>
                  <span className="text-xs font-bold text-white block">4. Tiba Utuh &amp; Renyah</span>
                  <span className="text-[10px] text-indigo-200 block">Lumer legit dinikmati keluarga</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT DE'NISH COOKIES */}
      <section id="tentang" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-amber-50 relative overflow-hidden rounded-3xl p-8 sm:p-12 border border-brand-yellow/40 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="absolute inset-0 bg-bakery-pattern opacity-40 pointer-events-none" />
          <div className="space-y-4 relative z-10">
            <span className="text-xs font-black uppercase tracking-widest text-brand-red">
              Cerita Dapur Kami
            </span>
            <h2 className="font-heading font-black text-3xl text-brand-indigo">
              De&apos;nish Cookies: Making Taste Better
            </h2>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
              Berawal dari komitmen menyajikan kue kering homemade terbaik, De&apos;nish Cookies berfokus pada cita rasa otentik dan kualitas tanpa kompromi. Kami menggunakan 100% pure Anchor butter asli dan bahan pilihan bermutu tinggi tanpa tambahan pemanis buatan.
            </p>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
              Setiap toples dipanggang secara higienis dan fresh untuk memastikan aroma wangi serta tekstur lembut yang lumer di mulut tetap konsisten di setiap sajian istimewa Anda.
            </p>
            <div className="pt-2">
              <a
                href="https://wa.me/6288218106303"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-yellow text-xs px-5 py-3"
              >
                Konsultasi Pesanan Custom / Corporate Hampers
              </a>
            </div>
          </div>

          <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg border-2 border-white">
            <img
              src="/produk_unggulan.jpg"
              alt="Produk Unggulan De'nish Cookies"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
