'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ShoppingBag,
  Truck,
  ShieldCheck,
  Heart,
  Star,
  Search,
  ChevronRight,
  Flame,
  Award,
  Package,
  Layers,
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
      <section className="relative overflow-hidden bg-brand-yellow pt-12 pb-16 lg:py-20 border-b-4 border-brand-indigo/10">
        {/* Subtle decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/20 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-amber-400/30 blur-2xl pointer-events-none" />

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
                Kelezatan toples kue kering legit dengan aroma semerbak 100% Wijsman butter murni. Dibuat fresh setiap hari dengan resep warisan keluarga yang lumer di lidah.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <a href="#katalog" className="btn-primary text-sm px-7 py-4 w-full sm:w-auto">
                  <ShoppingBag className="w-4 h-4" /> Belanja Sekarang
                </a>
                <a href="#pengiriman" className="btn-secondary text-sm px-6 py-4 w-full sm:w-auto">
                  <Truck className="w-4 h-4 text-brand-yellow" /> Info Ongkir Paxel &amp; Gojek
                </a>
              </div>

              {/* Quick Trust Badges */}
              <div className="grid grid-cols-3 gap-3 pt-6 border-t border-brand-indigo/15 max-w-lg mx-auto lg:mx-0 text-left">
                <div className="bg-white/60 backdrop-blur-sm p-3 rounded-2xl border border-brand-indigo/10">
                  <span className="text-xs font-black text-brand-indigo block">100% Wijsman</span>
                  <span className="text-[11px] text-gray-700">Butter Belanda asli</span>
                </div>
                <div className="bg-white/60 backdrop-blur-sm p-3 rounded-2xl border border-brand-indigo/10">
                  <span className="text-xs font-black text-brand-indigo block">Paxel Safe Box</span>
                  <span className="text-[11px] text-gray-700">Anti hancur se-Jawa</span>
                </div>
                <div className="bg-white/60 backdrop-blur-sm p-3 rounded-2xl border border-brand-indigo/10">
                  <span className="text-xs font-black text-brand-indigo block">Gojek Instant</span>
                  <span className="text-[11px] text-gray-700">Pengiriman Instant Area Bandung</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-white p-4 rounded-3xl shadow-2xl border-4 border-white rotate-1 hover:rotate-0 transition-transform duration-500">
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-amber-100 shadow-cookie space-y-3 hover:-translate-y-1 transition duration-300">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Award className="w-6 h-6 text-brand-red" />
            </div>
            <h3 className="font-heading font-bold text-lg text-brand-indigo">100% Wijsman Asli</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Menggunakan butter Belanda kaleng merah asli tanpa campuran margarin murah. Tekstur lumer dan aroma semerbak.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-amber-100 shadow-cookie space-y-3 hover:-translate-y-1 transition duration-300">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Flame className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="font-heading font-bold text-lg text-brand-indigo">Freshly Baked Homemade</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Bukan kue pabrikan massal. Setiap batch dipanggang hati-hati secara higienis di dapur kami di Antapani, Kota Bandung.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-amber-100 shadow-cookie space-y-3 hover:-translate-y-1 transition duration-300">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-heading font-bold text-lg text-brand-indigo">Paxel Safe-Box Luar Kota</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Kirim ke Bandung, Surabaya, Medan dll aman tanpa hancur berkat kemasan kardus khusus dan rantai dingin Paxel.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-amber-100 shadow-cookie space-y-3 hover:-translate-y-1 transition duration-300">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="font-heading font-bold text-lg text-brand-indigo">Tanpa Pengawet &amp; Pemanis</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Selai nanas dimasak manual dari nanas madu segar dan gula tebu murni. Aman untuk balita hingga lansia.
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
        <div className="bg-gradient-to-br from-brand-indigo via-brand-indigoDark to-brand-indigo text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden border border-brand-yellow/30">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-yellow/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-8">
            <div className="max-w-2xl space-y-3">
              <span className="text-xs font-black uppercase tracking-widest text-brand-yellow">
                Sistem Logistik Spesialis Kue Kering
              </span>
              <h2 className="font-heading font-black text-3xl sm:text-4xl text-white">
                Pengiriman Ekstra Aman &amp; Terjamin
              </h2>
              <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed">
                Kami memahami kue kering rapuh dan mudah remuk. Oleh karena itu, De&apos;nish Cookies bekerja sama langsung dengan <strong className="text-white">Gojek (Dalam Kota)</strong> dan <strong className="text-white">Paxel (Luar Kota)</strong> yang dilengkapi fasilitas pendingin dan penanganan khusus makanan.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Gojek Card */}
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/15 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black">
                      GJ
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-lg text-white">Gojek Dalam Kota</h3>
                      <p className="text-[11px] text-emerald-300 font-bold">Kota Bandung &amp; Sekitarnya (Radius s/d 40 km)</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg text-[10px] font-black uppercase">
                    Langsung Antar
                  </span>
                </div>

                <ul className="space-y-2 text-xs text-indigo-100">
                  <li className="flex items-start gap-2">
                    <span className="text-brand-yellow font-black">•</span>
                    <span><strong>Gojek Instant:</strong> Tarif Rp 4.000/km (min Rp 15.000). Tiba 1-3 jam, kapasitas s/d 20 kg.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-yellow font-black">•</span>
                    <span><strong>Gojek SameDay:</strong> Tarif flat Rp 18.000 (&le;15km) &amp; Rp 25.000 (15-40km). Tiba di hari yang sama, maks 7 kg.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-yellow font-black">•</span>
                    <span>Jarak dihitung otomatis menggunakan GPS Peta OpenStreetMap dari Kitchen Antapani, Kota Bandung.</span>
                  </li>
                </ul>
              </div>

              {/* Paxel Card */}
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/15 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black">
                      PX
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-lg text-white">Paxel Antar Kota</h3>
                      <p className="text-[11px] text-purple-300 font-bold">Pengiriman Luar Kota Seluruh Indonesia</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-[10px] font-black uppercase">
                    Food Safe
                  </span>
                </div>

                <ul className="space-y-2 text-xs text-indigo-100">
                  <li className="flex items-start gap-2">
                    <span className="text-brand-yellow font-black">•</span>
                    <span><strong>Tier Box Otomatis:</strong> Box Small (&le;1.5kg), Box Medium (&le;3kg), Box Large (&le;5kg).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-yellow font-black">•</span>
                    <span><strong>Split Box Otomatis:</strong> Pesanan di atas 5 kg otomatis dihitung kelipatan box agar toples tidak bertumpuk berat.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-yellow font-black">•</span>
                    <span>Pengiriman luar kota aman dengan penanganan khusus paket makanan (Food Safe) agar kualitas kue tetap terjaga hingga sampai di tujuan.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
          <span className="text-xs font-black uppercase tracking-widest text-brand-red">
            Kata Pelanggan Setia
          </span>
          <h2 className="font-heading font-black text-3xl sm:text-4xl text-brand-indigo">
            Dipercaya 10,000+ Keluarga Indonesia
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-amber-100 shadow-cookie space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-gray-700 italic leading-relaxed">
              &quot;Nastar wisman terenak yang pernah saya beli! Selai nanasnya melimpah asam manis seimbang, butternya wangi banget dan lumer begitu digigit. Keluarga di Bandung sangat suka.&quot;
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
              <div className="w-9 h-9 rounded-full bg-brand-yellow text-brand-indigo font-black flex items-center justify-center text-xs">
                AN
              </div>
              <div>
                <p className="font-heading font-bold text-xs text-brand-indigo">dr. Anita Nuraini</p>
                <p className="text-[10px] text-gray-400">Bandung</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-amber-100 shadow-cookie space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-gray-700 italic leading-relaxed">
              &quot;Kirim hampers Royal Box isi 4 toples ke mertua di Surabaya via Paxel. Alhamdulillah kue sampai dalam kondisi utuh dan tidak ada yang retak sama sekali! Box-nya mewah sekali ada greeting cardnya.&quot;
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
              <div className="w-9 h-9 rounded-full bg-brand-indigo text-white font-black flex items-center justify-center text-xs">
                HS
              </div>
              <div>
                <p className="font-heading font-bold text-xs text-brand-indigo">Hendra Setiawan</p>
                <p className="text-[10px] text-gray-400">Surabaya</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-amber-100 shadow-cookie space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-gray-700 italic leading-relaxed">
              &quot;Kastengelnya benar-benar juara keju edam tua. Renyah dan tidak berminyak. Setiap Idul Fitri pasti wajib repeat order minimal 6 toples untuk hantaran kerabat kantor.&quot;
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
              <div className="w-9 h-9 rounded-full bg-brand-red text-white font-black flex items-center justify-center text-xs">
                MR
              </div>
              <div>
                <p className="font-heading font-bold text-xs text-brand-indigo">Maya Rahardjo</p>
                <p className="text-[10px] text-gray-400">Bekasi Barat</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT DE'NISH COOKIES */}
      <section id="tentang" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-amber-50 rounded-3xl p-8 sm:p-12 border border-brand-yellow/40 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs font-black uppercase tracking-widest text-brand-red">
              Cerita Dapur Kami
            </span>
            <h2 className="font-heading font-black text-3xl text-brand-indigo">
              De&apos;nish Cookies: Making Taste Better
            </h2>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
              Berawal dari komitmen menyajikan kue kering homemade terbaik, De&apos;nish Cookies berfokus pada cita rasa otentik dan kualitas tanpa kompromi. Kami menggunakan 100% Wijsman butter asli dan bahan pilihan bermutu tinggi tanpa tambahan pemanis buatan.
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
