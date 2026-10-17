'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Search, Check, AlertCircle } from 'lucide-react';

interface LeafletMapPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (coords: { lat: number; lng: number; addressText?: string }) => void;
  height?: string;
}

export default function LeafletMapPicker({
  initialLat = -6.917547878001074, // Default De'nish Cookies Kitchen Antapani Bandung
  initialLng = 107.6634056367421,
  onLocationSelect,
  height = '350px',
}: LeafletMapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: initialLat,
    lng: initialLng,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Synchronize when initialLat or initialLng props change (e.g. from parent inputs or API load)
  useEffect(() => {
    if (
      typeof initialLat === 'number' &&
      !isNaN(initialLat) &&
      typeof initialLng === 'number' &&
      !isNaN(initialLng)
    ) {
      setCurrentCoords((prev) => {
        if (
          Math.abs(prev.lat - initialLat) > 0.000001 ||
          Math.abs(prev.lng - initialLng) > 0.000001
        ) {
          if (markerRef.current) {
            markerRef.current.setLatLng([initialLat, initialLng]);
          }
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([initialLat, initialLng], mapInstanceRef.current.getZoom() || 15);
          }
          return { lat: initialLat, lng: initialLng };
        }
        return prev;
      });
    }
  }, [initialLat, initialLng]);

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;

      const L = (await import('leaflet')).default;

      // Fix missing Leaflet marker icons in React/Webpack
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (!isMounted) return;

      if (!mapInstanceRef.current && mapContainerRef.current) {
        const targetLat = typeof initialLat === 'number' && !isNaN(initialLat) ? initialLat : -6.917547878001074;
        const targetLng = typeof initialLng === 'number' && !isNaN(initialLng) ? initialLng : 107.6634056367421;

        const map = L.map(mapContainerRef.current, {
          scrollWheelZoom: false,
          touchZoom: true,
        }).setView([targetLat, targetLng], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        // Custom Pin Icon with brand red & cookie badge
        const customIcon = L.divIcon({
          className: 'custom-denish-pin',
          html: `<div style="background-color: #E32636; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(227,38,54,0.4); border: 2.5px solid white;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 36],
        });

        const marker = L.marker([targetLat, targetLng], {
          draggable: true,
          icon: customIcon,
        }).addTo(map);

        const updateFromLatLng = (lat: number, lng: number) => {
          const newCoords = {
            lat: Number(lat.toFixed(6)),
            lng: Number(lng.toFixed(6)),
          };
          setCurrentCoords(newCoords);
          onLocationSelect(newCoords);
        };

        // Real-time update while dragging
        marker.on('drag', (e: any) => {
          const position = e.target.getLatLng();
          updateFromLatLng(position.lat, position.lng);
        });

        marker.on('dragend', (e: any) => {
          const position = e.target.getLatLng();
          updateFromLatLng(position.lat, position.lng);
        });

        map.on('click', (e: any) => {
          const { lat, lng } = e.latlng;
          marker.setLatLng([lat, lng]);
          updateFromLatLng(lat, lng);
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;
        setIsMapLoaded(true);
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map view if external coordinates change
  const moveToCoords = (lat: number, lng: number) => {
    setCurrentCoords({ lat, lng });
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], 15, { duration: 1.2 });
      markerRef.current.setLatLng([lat, lng]);
    }
    onLocationSelect({ lat, lng });
  };

  // Browser Geolocation
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Browser Anda tidak mendukung geolokasi GPS.');
      return;
    }

    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        moveToCoords(Number(latitude.toFixed(6)), Number(longitude.toFixed(6)));
      },
      (err) => {
        setGeoError('Gagal mendeteksi lokasi GPS. Pastikan izin lokasi diaktifkan.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Search Address via OpenStreetMap Nominatim
  const handleSearch = async (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setGeoError(null);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=id&limit=1`
      );
      const data = await res.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        moveToCoords(lat, lon);
        onLocationSelect({
          lat,
          lng: lon,
          addressText: data[0].display_name,
        });
      } else {
        setGeoError('Alamat atau kota tidak ditemukan. Silakan klik langsung pada peta.');
      }
    } catch {
      setGeoError('Pencarian alamat sedang lambat. Silakan geser pin manual pada peta.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 flex">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
              }
            }}
            placeholder="Cari jalan, kelurahan, atau kota tujuan..."
            className="w-full pl-9 pr-20 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow shadow-sm"
          />
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <button
            type="button"
            onClick={handleSearch}
            disabled={isSearching}
            className="absolute right-1.5 top-1.5 px-3 py-1.5 bg-brand-indigo text-white rounded-lg text-xs font-semibold hover:bg-brand-indigoLight transition"
          >
            {isSearching ? 'Mencari...' : 'Cari'}
          </button>
        </div>

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          className="px-4 py-2.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-amber-100 transition active:scale-95 whitespace-nowrap shadow-sm"
        >
          <Navigation className="w-3.5 h-3.5 text-brand-red" />
          Lokasi Saya Saat Ini
        </button>
      </div>

      {geoError && (
        <div className="flex items-center gap-2 p-2.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-100">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{geoError}</span>
        </div>
      )}

      {/* Map Container */}
      <div
        className="relative border-2 border-brand-yellow/30 rounded-xl sm:rounded-2xl overflow-hidden shadow-inner bg-amber-50/50 w-full h-56 sm:h-72"
        style={height ? { height } : undefined}
      >
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Pin Location Overlay Info */}
        <div className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-sm p-2 sm:p-2.5 rounded-xl border border-brand-yellow/40 shadow-md flex items-center justify-between text-[11px] sm:text-xs z-[400] gap-1">
          <div className="flex items-center gap-1.5 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            <span className="font-mono font-medium text-brand-indigo truncate text-[10px] sm:text-xs">
              {(typeof currentCoords.lat === 'number' && !isNaN(currentCoords.lat) ? currentCoords.lat : initialLat).toFixed(6)}, {(typeof currentCoords.lng === 'number' && !isNaN(currentCoords.lng) ? currentCoords.lng : initialLng).toFixed(6)}
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md flex-shrink-0 font-bold">
            Geser pin ke alamat Anda
          </span>
        </div>
      </div>
    </div>
  );
}
