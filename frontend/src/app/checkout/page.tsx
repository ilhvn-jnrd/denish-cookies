'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Scale,
  MapPin,
  Truck,
  ShieldCheck,
  CreditCard,
  Plus,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  X,
  Package,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/lib/api';
import { formatRupiah, formatWeight } from '@/lib/formatters';
import LeafletMapPicker from '@/components/LeafletMapPicker';
import PaymentModal from '@/components/PaymentModal';

interface ShippingOption {
  courier_type: string;
  service_name: string;
  delivery_time: string;
  distance_km: number | null;
  is_available: boolean;
  cost: number;
  box_breakdown?: string;
  box_summary?: string;
  description: string;
  warning?: string | null;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, totalWeightGrams, totalWeightKg, clearCart } = useCart();
  const { user } = useAuth();

  // Recipient and shipping address fields
  const [recipientName, setRecipientName] = useState(user?.name || '');
  const [recipientPhone, setRecipientPhone] = useState(user?.phone || '');
  const [fullAddress, setFullAddress] = useState('');
  const [province, setProvince] = useState('Jawa Barat');
  const [cityName, setCityName] = useState('Kota Bandung');
  const [postalCode, setPostalCode] = useState('40291');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: -6.917547878001074,
    lng: 107.6634056367421,
  });
  const [notes, setNotes] = useState('');

  // Saved addresses list (for logged in user)
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddressLabel, setNewAddressLabel] = useState('Rumah');

  // Shipping calculation state
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedCourier, setSelectedCourier] = useState<string>('gojek_instant');
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);

  // Checkout submission & Midtrans modal state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [activeOrder, setActiveOrder] = useState<any | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Load saved user addresses if authenticated
  useEffect(() => {
    async function loadAddresses() {
      if (!user) return;
      const res = await fetchApi<{ data: any[] }>('/addresses');
      if (res.data?.data && res.data.data.length > 0) {
        setSavedAddresses(res.data.data);
        const defaultAddr = res.data.data.find((a: any) => a.is_default) || res.data.data[0];
        applyAddress(defaultAddr);
      } else {
        if (user.name && !recipientName) setRecipientName(user.name);
        if (user.phone && !recipientPhone) setRecipientPhone(user.phone);
      }
    }
    loadAddresses();
  }, [user]);

  const applyAddress = (addr: any) => {
    setSelectedAddressId(addr.id);
    setRecipientName(addr.recipient_name);
    setRecipientPhone(addr.phone);
    setFullAddress(addr.full_address);
    setProvince(addr.province);
    setCityName(addr.city_name);
    setPostalCode(addr.postal_code || '');
    if (addr.latitude && addr.longitude) {
      setCoords({ lat: addr.latitude, lng: addr.longitude });
    }
  };

  // Real-time Shipping Calculation Engine
  useEffect(() => {
    async function calculateShipping() {
      if (items.length === 0) return;

      setLoadingShipping(true);
      setShippingError(null);

      const payload = {
        city_name: cityName || 'Kota Bandung',
        latitude: coords.lat,
        longitude: coords.lng,
        total_weight_grams: totalWeightGrams,
      };

      const res = await fetchApi<{ options: ShippingOption[] }>('/shipping/calculate', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.data?.options) {
        setShippingOptions(res.data.options);
        // If current selected courier is not available or not in options, select first available
        const currentValid = res.data.options.find(
          (o) => o.courier_type === selectedCourier && o.is_available
        );
        if (!currentValid) {
          const firstAvail = res.data.options.find((o) => o.is_available);
          if (firstAvail) {
            setSelectedCourier(firstAvail.courier_type);
          }
        }
      } else {
        setShippingError(res.error || 'Gagal menghitung ongkos kirim');
      }
      setLoadingShipping(false);
    }

    const timer = setTimeout(() => {
      calculateShipping();
    }, 350);

    return () => clearTimeout(timer);
  }, [cityName, coords.lat, coords.lng, totalWeightGrams, items.length]);

  const activeShippingOption = shippingOptions.find((o) => o.courier_type === selectedCourier);
  const shippingCost = activeShippingOption?.cost || 0;
  const adminFee = Math.ceil((subtotal + shippingCost) * 0.007);
  const grossAmount = subtotal + shippingCost + adminFee;

  const isAddressComplete = Boolean(
    recipientName.trim() &&
    recipientPhone.trim() &&
    fullAddress.trim() &&
    cityName.trim()
  );
  const isCourierSelected = Boolean(activeShippingOption && activeShippingOption.is_available);

  // Handle Save New Address Modal
  const handleSaveNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setShowAddressModal(false);
      return;
    }

    const payload = {
      label: newAddressLabel,
      recipient_name: recipientName,
      phone: recipientPhone,
      full_address: fullAddress,
      province,
      city_name: cityName,
      postal_code: postalCode,
      latitude: coords.lat,
      longitude: coords.lng,
      is_default: savedAddresses.length === 0,
    };

    const res = await fetchApi<{ data: any }>('/addresses', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res.data?.data) {
      setSavedAddresses((prev) => [res.data!.data, ...prev]);
      setSelectedAddressId(res.data.data.id);
      setShowAddressModal(false);
    }
  };

  // Handle Checkout submission & Midtrans Snap Token
  const handleProceedCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);

    if (items.length === 0) {
      setCheckoutError('Keranjang belanja Anda masih kosong.');
      return;
    }

    if (!isAddressComplete) {
      setCheckoutError('Mohon isi dan pilih alamat pengiriman terlebih dahulu sebelum melanjutkan pembayaran');
      if (user && savedAddresses.length > 0) {
        setShowAddressModal(true);
      } else {
        const addressEl = document.getElementById('address-section');
        if (addressEl) {
          addressEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
      return;
    }

    if (!activeShippingOption || !activeShippingOption.is_available) {
      setCheckoutError('Silakan pilih opsi kurir pengiriman yang tersedia.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      recipient_name: recipientName,
      recipient_phone: recipientPhone,
      shipping_address: fullAddress,
      shipping_city: cityName,
      shipping_province: province,
      shipping_postal_code: postalCode,
      shipping_lat: coords.lat,
      shipping_lng: coords.lng,
      courier_type: selectedCourier,
      notes,
      items: items.map((i) => ({
        product_id: i.product.id,
        quantity: i.quantity,
      })),
    };

    const res = await fetchApi<{
      order: any;
      snap_token: string;
      is_mock: boolean;
      message: string;
    }>('/checkout', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res.data?.order) {
      const order = res.data.order;
      const snapToken = res.data.snap_token;
      const isMock = res.data.is_mock;

      setActiveOrder({
        ...order,
        snap_token: snapToken,
        is_mock: isMock,
      });

      // Check if real window.snap is available and not in mock mode
      if (typeof window !== 'undefined' && (window as any).snap && !isMock && !snapToken.startsWith('SNAP-MOCK-')) {
        (window as any).snap.pay(snapToken, {
          onSuccess: function (result: any) {
            clearCart();
            router.push(`/orders/${order.order_number}`);
          },
          onPending: function (result: any) {
            clearCart();
            router.push(`/orders/${order.order_number}`);
          },
          onError: function (result: any) {
            setCheckoutError('Pembayaran gagal atau dibatalkan.');
          },
          onClose: function () {
            setShowPaymentModal(true);
          },
        });
      } else {
        // Open the local demo / mock simulation modal
        setShowPaymentModal(true);
      }
    } else {
      setCheckoutError(res.error || 'Gagal memproses pesanan.');
    }

    setIsSubmitting(false);
  };

  const handlePaymentSuccess = () => {
    clearCart();
    setShowPaymentModal(false);
    if (activeOrder) {
      router.push(`/orders/${activeOrder.order_number}`);
    }
  };

  if (items.length === 0 && !activeOrder) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-20 h-20 rounded-3xl bg-amber-100 text-brand-yellow flex items-center justify-center mx-auto">
          <ShoppingBag className="w-10 h-10 text-brand-indigo" />
        </div>
        <h2 className="font-heading font-black text-2xl text-brand-indigo">Keranjang Anda Kosong</h2>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          Silakan pilih kue kering favorit dari katalog De&apos;nish Cookies sebelum lanjut ke checkout.
        </p>
        <Link href="/#katalog" className="btn-yellow text-xs px-6 py-3 inline-flex">
          Kembali ke Katalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
        <Link href="/" className="hover:text-brand-red transition flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Beranda
        </Link>
        <span>/</span>
        <span className="text-brand-indigo font-bold">Checkout &amp; Pembayaran</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-black text-3xl text-brand-indigo">Checkout Pesanan</h1>
          <p className="text-xs text-gray-500">
            Pastikan alamat dan titik koordinat pin peta sudah sesuai untuk kalkulasi kurir Gojek / Paxel.
          </p>
        </div>
      </div>

      {checkoutError && (
        <div className="p-4 bg-red-50 text-red-800 text-xs rounded-2xl border border-red-200 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-brand-red flex-shrink-0" />
          <span>{checkoutError}</span>
        </div>
      )}

      <form onSubmit={handleProceedCheckout} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Recipient & Address Pin Map */}
        <div className="lg:col-span-7 space-y-6">
          {/* Saved addresses selector for logged-in user */}
          {savedAddresses.length > 0 && (
            <div className="bg-white p-5 rounded-3xl border border-amber-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Pilih Alamat Tersimpan:
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddressModal(true)}
                  className="text-xs font-bold text-brand-red hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Baru
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {savedAddresses.map((addr) => (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => applyAddress(addr)}
                    className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                      selectedAddressId === addr.id
                        ? 'border-brand-red bg-rose-50/50 shadow-sm ring-1 ring-brand-red'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs text-brand-indigo">{addr.label}</span>
                        {addr.is_default && (
                          <span className="text-[10px] bg-brand-yellow/80 text-brand-indigo px-1.5 py-0.2 rounded font-bold">
                            Utama
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-medium text-gray-800 mt-1">{addr.recipient_name} ({addr.phone})</p>
                      <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">{addr.full_address}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 font-semibold mt-2">
                      {addr.city_name}, {addr.province}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recipient Details & Interactive Map */}
          <div id="address-section" className="bg-white p-6 rounded-3xl border border-amber-100 shadow-cookie space-y-5">
            <h2 className="font-heading font-bold text-lg text-brand-indigo flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-red" /> 1. Data Penerima &amp; Pin Titik Lokasi
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nama Penerima *
                </label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nomor WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder="088218106303"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Alamat Lengkap (Jalan, No. Rumah, RT/RW, Patokan) *
              </label>
              <textarea
                required
                rows={2}
                value={fullAddress}
                onChange={(e) => setFullAddress(e.target.value)}
                placeholder="Jl. Cibatu Raya No. 55, Antapani, Kota Bandung"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Provinsi *
                </label>
                <input
                  type="text"
                  required
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  placeholder="Jawa Barat"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Kota / Kabupaten *
                </label>
                <input
                  type="text"
                  required
                  value={cityName}
                  onChange={(e) => setCityName(e.target.value)}
                  placeholder="Kota Bandung"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Kode Pos
                </label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="40291"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                />
              </div>
            </div>

            {/* Interactive Leaflet Map Picker Component */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-brand-indigo">
                Geser Pin Peta ke Lokasi Pengantaran (Wajib untuk Gojek Instant):
              </label>
              <LeafletMapPicker
                initialLat={coords.lat}
                initialLng={coords.lng}
                onLocationSelect={(newCoords) => {
                  setCoords({ lat: newCoords.lat, lng: newCoords.lng });
                  if (newCoords.addressText && !fullAddress) {
                    setFullAddress(newCoords.addressText);
                  }
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Catatan Pengiriman (Opsional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Titip di pos satpam bila rumah kosong / Box pita merah"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              />
            </div>
          </div>

          {/* Courier Selection & Breakdown */}
          <div className="bg-white p-6 rounded-3xl border border-amber-100 shadow-cookie space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-lg text-brand-indigo flex items-center gap-2">
                <Truck className="w-5 h-5 text-brand-red" /> 2. Pilih Kurir Pengiriman
              </h2>
              <span className="text-xs bg-amber-50 text-amber-900 font-bold px-2.5 py-1 rounded-xl border border-amber-200">
                Berat Paket: {formatWeight(totalWeightGrams)}
              </span>
            </div>

            {loadingShipping ? (
              <div className="p-6 bg-amber-50/50 rounded-2xl text-center text-xs text-amber-900 space-y-2 animate-pulse">
                <div className="w-5 h-5 border-2 border-brand-indigo border-t-transparent rounded-full animate-spin mx-auto" />
                <p>Menghitung jarak &amp; tarif ongkir Gojek &amp; Paxel...</p>
              </div>
            ) : shippingOptions.length === 0 ? (
              <div className="p-4 bg-gray-50 rounded-2xl text-xs text-gray-500 text-center">
                Masukkan kota dan geser pin peta untuk melihat opsi pengiriman.
              </div>
            ) : (
              <div className="space-y-3">
                {shippingOptions.map((opt) => (
                  <label
                    key={opt.courier_type}
                    className={`p-4 rounded-2xl border flex items-start justify-between cursor-pointer transition ${
                      selectedCourier === opt.courier_type && opt.is_available
                        ? 'border-brand-red bg-rose-50/40 ring-2 ring-brand-red/20'
                        : opt.is_available
                        ? 'border-gray-200 hover:border-gray-300 bg-white'
                        : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="courier"
                        disabled={!opt.is_available}
                        checked={selectedCourier === opt.courier_type}
                        onChange={() => setSelectedCourier(opt.courier_type)}
                        className="mt-1 text-brand-red focus:ring-brand-red"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-bold text-sm text-brand-indigo">
                            {opt.service_name}
                          </span>
                          {opt.distance_km && (
                            <span className="text-[11px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-md">
                              {opt.distance_km} km
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-gray-500 font-medium">
                          {opt.delivery_time} • {opt.description}
                        </p>

                        {opt.box_breakdown && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 text-purple-900 border border-purple-200 rounded-lg text-[11px] font-bold">
                            <Package className="w-3.5 h-3.5 text-purple-700" />
                            {opt.box_breakdown}
                          </div>
                        )}

                        {opt.warning && (
                          <p className="text-xs text-brand-red font-semibold">
                            ⚠️ {opt.warning}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-heading font-extrabold text-base text-brand-red">
                        {opt.is_available ? formatRupiah(opt.cost) : 'Tidak Tersedia'}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary & Midtrans Payment CTA */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-amber-100 shadow-cookie space-y-5 sticky top-28">
            <h3 className="font-heading font-bold text-lg text-brand-indigo">Ringkasan Belanja</h3>

            {/* Items review */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.product.id} className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-amber-50 flex-shrink-0">
                      <img
                        src={item.product.image_url || '/logo.png'}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="truncate">
                      <p className="font-bold text-brand-indigo truncate">{item.product.name}</p>
                      <span className="text-[11px] text-gray-500">
                        {item.quantity} toples ({formatWeight(item.product.weight_grams * item.quantity)})
                      </span>
                    </div>
                  </div>
                  <span className="font-bold text-brand-indigo flex-shrink-0">
                    {formatRupiah(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculation Lines */}
            <div className="space-y-2 pt-4 border-t border-gray-100 text-xs text-gray-600">
              <div className="flex items-center justify-between">
                <span>Subtotal Produk</span>
                <span className="font-bold text-brand-indigo">{formatRupiah(subtotal)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span>Total Berat Paket</span>
                <span className="font-bold text-brand-indigo">{formatWeight(totalWeightGrams)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span>Ongkos Kirim ({activeShippingOption?.courier_type || 'Kurir'})</span>
                <span className="font-bold text-brand-indigo">{formatRupiah(shippingCost)}</span>
              </div>

              <div className="flex items-center justify-between text-brand-red font-medium">
                <span>Biaya Layanan Pembayaran (QRIS 0.7%)</span>
                <span className="font-bold">{formatRupiah(adminFee)}</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="font-bold text-sm text-brand-indigo uppercase">Total Pembayaran</span>
                <span className="font-heading font-black text-xl text-brand-red">
                  {formatRupiah(grossAmount)}
                </span>
              </div>
            </div>

            {/* Strict address warning if not filled */}
            {!isAddressComplete && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                <span>
                  Mohon lengkapi <strong>Nama Penerima, No. WA, Alamat Lengkap &amp; Kota</strong> sebelum melanjutkan pembayaran.
                </span>
              </div>
            )}

            {/* Midtrans CTA with Strict Address & Courier Guard */}
            <button
              type="submit"
              disabled={isSubmitting}
              onClick={(e) => {
                if (!isAddressComplete) {
                  e.preventDefault();
                  setCheckoutError('Mohon isi dan pilih alamat pengiriman terlebih dahulu sebelum melanjutkan pembayaran');
                  if (user && savedAddresses.length > 0) {
                    setShowAddressModal(true);
                  } else {
                    const addressEl = document.getElementById('address-section');
                    if (addressEl) {
                      addressEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }
                } else if (!isCourierSelected) {
                  e.preventDefault();
                  setCheckoutError('Mohon pilih opsi kurir pengiriman yang tersedia terlebih dahulu.');
                }
              }}
              className={`w-full btn-primary justify-center py-4 text-sm font-black transition ${
                !isAddressComplete || !isCourierSelected ? 'opacity-80 hover:opacity-100 ring-2 ring-amber-300' : ''
              } disabled:opacity-60`}
            >
              <CreditCard className="w-4 h-4" />
              {isSubmitting ? 'Memproses Pesanan...' : 'Bayar via Midtrans Snap'}
            </button>

            <div className="text-center space-y-1">
              <p className="text-[11px] text-gray-400 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Midtrans 256-bit Encrypted Security &amp; Mock Ready
              </p>
              <p className="text-[10px] text-gray-400">
                QRIS • BCA • Mandiri • GoPay • OVO • ShopeePay
              </p>
            </div>
          </div>
        </div>
      </form>

      {/* Payment Modal (Midtrans Snap & Sandbox Simulator) */}
      {showPaymentModal && activeOrder && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          orderNumber={activeOrder.order_number}
          grossAmount={activeOrder.gross_amount}
          snapToken={activeOrder.snap_token}
          isMock={activeOrder.is_mock}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
