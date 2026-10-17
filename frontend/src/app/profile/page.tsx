'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  MapPin,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowLeft,
  X,
  ShoppingBag,
  Shield,
  Phone,
  Mail,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/lib/api';
import LeafletMapPicker from '@/components/LeafletMapPicker';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, refreshUser } = useAuth();

  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Address Form fields
  const [label, setLabel] = useState('Rumah');
  const [recipientName, setRecipientName] = useState('');
  const [phone, setPhone] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [province, setProvince] = useState('Jawa Barat');
  const [cityName, setCityName] = useState('Kota Bandung');
  const [postalCode, setPostalCode] = useState('40291');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: -6.917547878001074,
    lng: 107.6634056367421,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadAddresses = async () => {
    setLoading(true);
    const res = await fetchApi<{ data: any[] }>('/addresses');
    if (res.data?.data) {
      setAddresses(res.data.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    setRecipientName(user.name || '');
    setPhone(user.phone || '');
    loadAddresses();
  }, [user]);

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      label,
      recipient_name: recipientName,
      phone,
      full_address: fullAddress,
      province,
      city_name: cityName,
      postal_code: postalCode,
      latitude: coords.lat,
      longitude: coords.lng,
      is_default: addresses.length === 0,
    };

    const res = await fetchApi<{ data: any }>('/addresses', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res.data?.data) {
      setShowAddModal(false);
      loadAddresses();
      // Reset form
      setFullAddress('');
      setPostalCode('');
    }
    setIsSubmitting(false);
  };

  const handleSetDefault = async (id: number) => {
    await fetchApi(`/addresses/${id}/default`, { method: 'POST' });
    loadAddresses();
  };

  const handleDeleteAddress = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus alamat ini?')) {
      await fetchApi(`/addresses/${id}`, { method: 'DELETE' });
      loadAddresses();
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
        <Link href="/" className="hover:text-brand-red transition flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Beranda
        </Link>
        <span>/</span>
        <span className="text-brand-indigo font-bold">Profil Akun &amp; Buku Alamat</span>
      </div>

      {/* Header Profile Info */}
      <div className="bg-white p-6 rounded-3xl border border-amber-100 shadow-cookie flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-yellow text-brand-indigo font-black text-2xl flex items-center justify-center shadow-sm">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-black text-xl text-brand-indigo">{user.name}</h1>
              {user.role === 'admin' && (
                <span className="text-[10px] bg-purple-100 text-purple-900 font-black px-2 py-0.5 rounded-full uppercase">
                  Administrator
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <Mail className="w-3.5 h-3.5 text-gray-400" /> {user.email}
            </p>
            {user.phone && (
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-gray-400" /> {user.phone}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/orders"
            className="px-4 py-2 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold hover:bg-amber-100 transition flex items-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" /> Riwayat Pesanan
          </Link>
          <button
            onClick={() => logout()}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition"
          >
            Keluar
          </button>
        </div>
      </div>

      {/* Saved Addresses Section */}
      <div className="bg-white p-6 rounded-3xl border border-amber-100 shadow-cookie space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading font-bold text-lg text-brand-indigo flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-red" /> Buku Alamat Pengiriman
            </h2>
            <p className="text-xs text-gray-500">
              Alamat lengkap dan koordinat GPS untuk kurir Gojek &amp; Paxel
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="btn-yellow text-xs px-4 py-2"
          >
            <Plus className="w-4 h-4" /> Tambah Alamat Baru
          </button>
        </div>

        {loading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-24 bg-gray-100 rounded-2xl" />
            <div className="h-24 bg-gray-100 rounded-2xl" />
          </div>
        ) : addresses.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500 bg-amber-50/50 rounded-2xl border border-amber-100 space-y-2">
            <MapPin className="w-8 h-8 text-amber-400 mx-auto" />
            <p className="font-bold text-brand-indigo">Belum ada alamat tersimpan</p>
            <p>Tambahkan alamat rumah atau kantor Anda untuk memudahkan pemesanan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`p-4 rounded-2xl border relative flex flex-col justify-between space-y-3 ${
                  addr.is_default ? 'border-brand-red bg-rose-50/30' : 'border-gray-200 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-brand-indigo bg-gray-100 px-2.5 py-0.5 rounded-lg">
                      {addr.label}
                    </span>
                    {addr.is_default && (
                      <span className="text-[10px] bg-brand-red text-white font-black px-2 py-0.5 rounded-full">
                        Alamat Utama
                      </span>
                    )}
                  </div>

                  <p className="font-bold text-sm text-gray-900 mt-2">{addr.recipient_name}</p>
                  <p className="text-xs text-gray-600 leading-snug mt-0.5">{addr.full_address}</p>
                  <p className="text-xs font-semibold text-gray-700 mt-1">
                    {addr.city_name}, {addr.province} {addr.postal_code}
                  </p>
                  <p className="text-xs text-gray-600 font-mono mt-0.5">WA: {addr.phone}</p>

                  {addr.latitude && addr.longitude && (
                    <p className="text-[10px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Pin GPS: {addr.latitude.toFixed(4)}, {addr.longitude.toFixed(4)}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                  {!addr.is_default ? (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      className="font-bold text-brand-indigo hover:text-brand-red transition text-[11px]"
                    >
                      Jadikan Alamat Utama
                    </button>
                  ) : (
                    <span className="text-[11px] text-gray-400">Default aktif</span>
                  )}

                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="text-gray-400 hover:text-brand-red p-1 transition"
                    title="Hapus Alamat"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Address Modal with Leaflet GPS Map */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-gray-200 max-h-[90dvh] flex flex-col">
            <div className="bg-brand-indigo text-white px-5 py-3.5 sm:px-6 sm:py-4 flex items-center justify-between flex-shrink-0">
              <h3 className="font-heading font-bold text-sm sm:text-base flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-yellow" /> Tambah Alamat Pengiriman
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAddress} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Label Alamat (Rumah / Kantor) *
                  </label>
                  <input
                    type="text"
                    required
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="Contoh: Rumah / Kantor"
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Nama Penerima *
                  </label>
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nomor Telepon / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Alamat Lengkap *
                </label>
                <textarea
                  required
                  rows={2}
                  value={fullAddress}
                  onChange={(e) => setFullAddress(e.target.value)}
                  placeholder="Jl. Cibatu Raya No. 55, Antapani, Kota Bandung"
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Provinsi *
                  </label>
                  <input
                    type="text"
                    required
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Kota/Kab *
                  </label>
                  <input
                    type="text"
                    required
                    value={cityName}
                    onChange={(e) => setCityName(e.target.value)}
                    className="w-full px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Kode Pos
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Leaflet map picker in modal */}
              <div className="space-y-1 pt-1">
                <label className="block text-xs font-bold text-brand-indigo">
                  Tentukan Titik Koordinat Peta:
                </label>
                <LeafletMapPicker
                  initialLat={coords.lat}
                  initialLng={coords.lng}
                  height="260px"
                  onLocationSelect={(newCoords) => {
                    setCoords({ lat: newCoords.lat, lng: newCoords.lng });
                    if (newCoords.addressText && !fullAddress) {
                      setFullAddress(newCoords.addressText);
                    }
                  }}
                />
              </div>
              </div>

              {/* Sticky bottom action footer */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2 bg-white sticky bottom-0">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold min-h-[40px]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-yellow text-xs px-5 py-2 min-h-[40px]"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Alamat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
