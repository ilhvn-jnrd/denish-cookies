'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Settings,
  MapPin,
  Truck,
  Plus,
  Edit2,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/lib/api';
import { formatRupiah } from '@/lib/formatters';
import AdminHeader from '@/components/AdminHeader';
import LeafletMapPicker from '@/components/LeafletMapPicker';

export default function AdminShippingPage() {
  const router = useRouter();
  const { isAdmin, isLoading } = useAuth();

  const [settings, setSettings] = useState<any | null>(null);
  const [paxelRates, setPaxelRates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Store Kitchen Form state (Official De'nish Cookies Antapani Bandung coordinates)
  const [storeName, setStoreName] = useState("De'nish Cookies Kitchen");
  const [storePhone, setStorePhone] = useState('088218106303');
  const [storeAddress, setStoreAddress] = useState('Jl. Cibatu Raya No. 55, Kel. Antapani Tengah, Kec. Antapani, Kota Bandung, Jawa Barat');
  const [storeCity, setStoreCity] = useState('Kota Bandung');
  const [storeLat, setStoreLat] = useState(-6.917547878001074);
  const [storeLng, setStoreLng] = useState(107.6634056367421);

  // Gojek Parameters
  const [instantRatePerKm, setInstantRatePerKm] = useState(4000);
  const [instantMinFare, setInstantMinFare] = useState(15000);
  const [samedayUnder15, setSamedayUnder15] = useState(18000);
  const [samedayOver15, setSamedayOver15] = useState(25000);
  const [maxDistanceGojek, setMaxDistanceGojek] = useState(40);
  const [roadFactor, setRoadFactor] = useState(1.3);

  // Paxel Matrix Modal state
  const [showPaxelModal, setShowPaxelModal] = useState(false);
  const [editingPaxel, setEditingPaxel] = useState<any | null>(null);
  const [paxelCity, setPaxelCity] = useState('');
  const [paxelProvince, setPaxelProvince] = useState('');
  const [paxelSmall, setPaxelSmall] = useState(22000);
  const [paxelMedium, setPaxelMedium] = useState(30000);
  const [paxelLarge, setPaxelLarge] = useState(40000);
  const [paxelEst, setPaxelEst] = useState('Pengiriman Reguler / Luar Kota');

  const applySettings = (s: any) => {
    if (!s) return;
    setSettings(s);
    if (s.store_name) setStoreName(s.store_name);
    if (s.store_phone) setStorePhone(s.store_phone);
    if (s.store_address) setStoreAddress(s.store_address);
    if (s.store_city) setStoreCity(s.store_city);

    const lat = typeof s.store_lat === 'number' ? s.store_lat : parseFloat(s.store_lat ?? s.latitude);
    const lng = typeof s.store_lng === 'number' ? s.store_lng : parseFloat(s.store_lng ?? s.longitude);

    if (!isNaN(lat)) setStoreLat(lat);
    if (!isNaN(lng)) setStoreLng(lng);

    if (s.gojek_instant_rate_per_km !== undefined) setInstantRatePerKm(Number(s.gojek_instant_rate_per_km));
    if (s.gojek_instant_min_fare !== undefined) setInstantMinFare(Number(s.gojek_instant_min_fare));
    if (s.gojek_sameday_flat_under_15km !== undefined) setSamedayUnder15(Number(s.gojek_sameday_flat_under_15km));
    if (s.gojek_sameday_flat_over_15km !== undefined) setSamedayOver15(Number(s.gojek_sameday_flat_over_15km));
    if (s.max_distance_gojek_km !== undefined) setMaxDistanceGojek(Number(s.max_distance_gojek_km));
    if (s.road_distance_factor !== undefined) setRoadFactor(Number(s.road_distance_factor));
  };

  const loadSettings = async () => {
    setLoading(true);
    setErrorMessage(null);

    // Read localStorage fallback only if not legacy Jakarta address
    try {
      const cached = localStorage.getItem('denish_shipping_settings');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (
          parsed &&
          !parsed.store_address?.toLowerCase().includes('duren sawit') &&
          !parsed.store_city?.toLowerCase().includes('jakarta') &&
          ((Number(parsed.store_lat) || 0) < -6.5)
        ) {
          applySettings(parsed);
        } else {
          localStorage.removeItem('denish_shipping_settings');
        }
      }
    } catch {
      // ignore
    }

    const res = await fetchApi<{ settings: any; paxel_rates: any[] }>('/admin/shipping-settings');
    if (res.data?.settings) {
      const s = res.data.settings;
      applySettings(s);
      localStorage.setItem('denish_shipping_settings', JSON.stringify(s));
      if (res.data.paxel_rates) {
        setPaxelRates(res.data.paxel_rates);
      }
    } else if (res.error) {
      setErrorMessage(res.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/login');
      return;
    }
    if (isAdmin) {
      loadSettings();
    }
  }, [isAdmin, isLoading]);

  const handleSaveStoreSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);
    setErrorMessage(null);

    const payload = {
      store_name: storeName,
      store_phone: storePhone,
      store_address: storeAddress,
      store_city: storeCity,
      store_lat: storeLat,
      store_lng: storeLng,
      gojek_instant_rate_per_km: instantRatePerKm,
      gojek_instant_min_fare: instantMinFare,
      gojek_sameday_flat_under_15km: samedayUnder15,
      gojek_sameday_flat_over_15km: samedayOver15,
      max_distance_gojek_km: maxDistanceGojek,
      road_distance_factor: roadFactor,
    };

    // Save to localStorage immediately so UI stays synced
    localStorage.setItem('denish_shipping_settings', JSON.stringify(payload));

    const res = await fetchApi('/admin/shipping-settings', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    if (res.data) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
      const updated = res.data.data || res.data.settings;
      if (updated) {
        applySettings(updated);
        localStorage.setItem('denish_shipping_settings', JSON.stringify(updated));
      }
    } else {
      setErrorMessage(res.error || 'Gagal menyimpan pengaturan ke server.');
    }
    setIsSaving(false);
  };

  const openPaxelModal = (rate?: any) => {
    if (rate) {
      setEditingPaxel(rate);
      setPaxelCity(rate.city_name);
      setPaxelProvince(rate.province);
      setPaxelSmall(rate.small_rate);
      setPaxelMedium(rate.medium_rate);
      setPaxelLarge(rate.large_rate);
      setPaxelEst(rate.estimated_days || 'Pengiriman Reguler / Luar Kota');
    } else {
      setEditingPaxel(null);
      setPaxelCity('');
      setPaxelProvince('Jawa');
      setPaxelSmall(25000);
      setPaxelMedium(35000);
      setPaxelLarge(45000);
      setPaxelEst('Pengiriman Reguler / Luar Kota');
    }
    setShowPaxelModal(true);
  };

  const handleSavePaxel = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      city_name: paxelCity,
      province: paxelProvince,
      small_rate: paxelSmall,
      medium_rate: paxelMedium,
      large_rate: paxelLarge,
      estimated_days: paxelEst,
    };

    if (editingPaxel) {
      await fetchApi(`/admin/paxel-rates/${editingPaxel.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } else {
      await fetchApi('/admin/paxel-rates', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }

    setShowPaxelModal(false);
    loadSettings();
  };

  const handleDeletePaxel = async (id: number) => {
    if (confirm('Hapus tarif kota ini dari matriks Paxel?')) {
      await fetchApi(`/admin/paxel-rates/${id}`, { method: 'DELETE' });
      loadSettings();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8 pb-24 lg:pb-8">
      <AdminHeader />

      <div>
        <h1 className="font-heading font-black text-xl sm:text-2xl text-brand-indigo">
          Pengaturan Dapur &amp; Tarif Ekspedisi
        </h1>
        <p className="text-xs text-gray-500">
          Ubah koordinat GPS kitchen utama De&apos;nish Cookies, tarif Gojek per-KM, dan matriks tarif box Paxel antar kota.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 text-emerald-800 text-xs rounded-2xl border border-emerald-200 flex items-center gap-2 font-bold animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          Pengaturan dapur dan tarif pengiriman berhasil diperbarui!
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 text-red-800 text-xs rounded-2xl border border-red-200 flex items-center gap-2 font-bold animate-fade-in">
          <AlertCircle className="w-5 h-5 text-brand-red flex-shrink-0" />
          {errorMessage}
        </div>
      )}

      {/* Store Kitchen Settings & Gojek */}
      <form onSubmit={handleSaveStoreSettings} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Kitchen GPS Pin & Details */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-amber-100 shadow-cookie space-y-5">
            <h2 className="font-heading font-bold text-lg text-brand-indigo flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-red" /> 1. Titik Koordinat GPS Kitchen (Pusat Pengiriman)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nama Dapur / Toko
                </label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nomor Telepon Dapur
                </label>
                <input
                  type="text"
                  required
                  value={storePhone}
                  onChange={(e) => setStorePhone(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Alamat Fisik Kitchen
              </label>
              <textarea
                rows={2}
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Kota Toko
                </label>
                <input
                  type="text"
                  required
                  value={storeCity}
                  onChange={(e) => setStoreCity(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={storeLat}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setStoreLat(isNaN(val) ? 0 : val);
                  }}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={storeLng}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setStoreLng(isNaN(val) ? 0 : val);
                  }}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                />
              </div>
            </div>

            {/* Map Pin for Kitchen */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-brand-indigo">
                  Posisikan Pin Peta ke Lokasi Dapur Anda:
                </label>
                <span className="text-[11px] font-mono font-bold text-brand-red bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                  GPS: {storeLat.toFixed(6)}, {storeLng.toFixed(6)}
                </span>
              </div>
              <LeafletMapPicker
                initialLat={storeLat}
                initialLng={storeLng}
                height="260px"
                onLocationSelect={(c) => {
                  setStoreLat(c.lat);
                  setStoreLng(c.lng);
                }}
              />
            </div>
          </div>

          {/* Gojek Engine Parameters */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-amber-100 shadow-cookie space-y-5">
            <h2 className="font-heading font-bold text-lg text-brand-indigo flex items-center gap-2">
              <Truck className="w-5 h-5 text-brand-red" /> 2. Parameter Mesin Gojek
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Tarif Gojek Instant per KM (Rp)
                </label>
                <input
                  type="number"
                  value={instantRatePerKm}
                  onChange={(e) => setInstantRatePerKm(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-brand-indigo"
                />
                <span className="text-[10px] text-gray-400">Default: Rp 4.000 / km</span>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Tarif Minimum Gojek Instant (Rp)
                </label>
                <input
                  type="number"
                  value={instantMinFare}
                  onChange={(e) => setInstantMinFare(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-brand-indigo"
                />
                <span className="text-[10px] text-gray-400">Default: Rp 15.000</span>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Tarif Flat Gojek SameDay &le; 15 km (Rp)
                </label>
                <input
                  type="number"
                  value={samedayUnder15}
                  onChange={(e) => setSamedayUnder15(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-brand-indigo"
                />
                <span className="text-[10px] text-gray-400">Default: Rp 18.000</span>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Tarif Flat Gojek SameDay 15 - 40 km (Rp)
                </label>
                <input
                  type="number"
                  value={samedayOver15}
                  onChange={(e) => setSamedayOver15(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-brand-indigo"
                />
                <span className="text-[10px] text-gray-400">Default: Rp 25.000</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Jarak Maks (KM)
                  </label>
                  <input
                    type="number"
                    value={maxDistanceGojek}
                    onChange={(e) => setMaxDistanceGojek(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Faktor Rute Jalan (1.3x)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={roadFactor}
                    onChange={(e) => setRoadFactor(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full btn-yellow justify-center py-3 text-xs font-black shadow-md"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Menyimpan Pengaturan...' : 'Simpan Pengaturan Dapur & Gojek'}
            </button>
          </div>
        </div>
      </form>

      {/* Paxel City Rates Matrix */}
      <div className="bg-white p-6 rounded-3xl border border-amber-100 shadow-cookie space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-heading font-bold text-lg text-brand-indigo flex items-center gap-2">
              <Truck className="w-5 h-5 text-purple-700" /> 3. Matriks Tarif Paxel Antar Kota (Tier Box)
            </h2>
            <p className="text-xs text-gray-500">
              Perhitungan otomatis: Box Small (&le;1.5kg), Medium (&le;3kg), Large (&le;5kg), dan split box kelipatan 5kg.
            </p>
          </div>

          <button
            type="button"
            onClick={() => openPaxelModal()}
            className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-xl text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Tambah Kota Paxel
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-purple-50/70 border-b border-purple-100 text-purple-950 uppercase text-[10px] font-bold">
                <th className="p-3.5">Kota / Wilayah</th>
                <th className="p-3.5">Provinsi</th>
                <th className="p-3.5">Box Small (&le;1.5kg)</th>
                <th className="p-3.5">Box Medium (&le;3kg)</th>
                <th className="p-3.5">Box Large (&le;5kg)</th>
                <th className="p-3.5">Estimasi Waktu</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paxelRates.map((r) => (
                <tr key={r.id} className="hover:bg-purple-50/20 transition">
                  <td className="p-3.5 font-bold text-brand-indigo">{r.city_name}</td>
                  <td className="p-3.5 text-gray-600">{r.province}</td>
                  <td className="p-3.5 font-mono font-bold text-gray-800">{formatRupiah(r.small_rate)}</td>
                  <td className="p-3.5 font-mono font-bold text-gray-800">{formatRupiah(r.medium_rate)}</td>
                  <td className="p-3.5 font-mono font-black text-brand-red">{formatRupiah(r.large_rate)}</td>
                  <td className="p-3.5 text-gray-500">{r.estimated_days}</td>
                  <td className="p-3.5 text-right space-x-1">
                    <button
                      onClick={() => openPaxelModal(r)}
                      className="p-1.5 text-brand-indigo hover:text-brand-red rounded-lg"
                      title="Edit Tarif"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePaxel(r.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paxel Rate Edit Modal */}
      {showPaxelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md max-h-[90dvh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-200">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-brand-indigo text-white px-5 py-4 flex items-center justify-between flex-shrink-0">
              <h3 className="font-heading font-bold text-sm sm:text-base">
                {editingPaxel ? 'Edit Tarif Paxel Kota' : 'Tambah Tarif Paxel Kota Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setShowPaxelModal(false)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePaxel} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Nama Kota *</label>
                  <input
                    type="text"
                    required
                    value={paxelCity}
                    onChange={(e) => setPaxelCity(e.target.value)}
                    placeholder="Bandung / Surabaya"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Provinsi *</label>
                  <input
                    type="text"
                    required
                    value={paxelProvince}
                    onChange={(e) => setPaxelProvince(e.target.value)}
                    placeholder="Jawa Barat"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Small (&le;1.5kg)</label>
                  <input
                    type="number"
                    required
                    value={paxelSmall}
                    onChange={(e) => setPaxelSmall(Number(e.target.value))}
                    className="w-full px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Medium (&le;3kg)</label>
                  <input
                    type="number"
                    required
                    value={paxelMedium}
                    onChange={(e) => setPaxelMedium(Number(e.target.value))}
                    className="w-full px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Large (&le;5kg)</label>
                  <input
                    type="number"
                    required
                    value={paxelLarge}
                    onChange={(e) => setPaxelLarge(Number(e.target.value))}
                    className="w-full px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-bold text-brand-red"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Estimasi Pengantaran</label>
                <input
                  type="text"
                  required
                  value={paxelEst}
                  onChange={(e) => setPaxelEst(e.target.value)}
                  placeholder="Pengiriman Reguler / Luar Kota"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                />
              </div>

              {/* Sticky Action Footer */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-gray-100 sticky bottom-0 bg-white pb-1">
                <button
                  type="button"
                  onClick={() => setShowPaxelModal(false)}
                  className="min-h-[44px] px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] btn-yellow text-xs px-5 py-2 font-black shadow-md"
                >
                  Simpan Tarif
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
