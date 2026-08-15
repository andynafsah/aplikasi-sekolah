import React, { useState, useEffect, useCallback, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';
import {
  MapPin,
  Building,
  UserCheck,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Compass,
  Clock,
  ShieldCheck,
  LogOut,
  Navigation,
  Lock,
  Layers,
  Map as MapIcon,
  Search
} from 'lucide-react';

export interface LocationPoint {
  id: string;
  name: string;
  code: string;
  latitude: number;
  longitude: number;
  radius: number;
  minimum_accuracy?: number;
  status: 'ACTIVE' | 'INACTIVE';
  qrToken?: string;
  unit?: string;
}

interface GoogleMapsAttendanceViewProps {
  locations?: LocationPoint[];
  selectedLocation?: LocationPoint | null;
  onSelectLocation?: (loc: LocationPoint) => void;
  onAttendanceSuccess?: (data: any) => void;
  tenantId?: string;
  userRole?: string;
  userName?: string;
  userId?: string;
  mode?: 'ATTENDANCE' | 'ADMIN_PICKER';
  onLocationPick?: (coords: { lat: number; lng: number; address?: string }) => void;
}

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

// Calculate Haversine Distance in meters
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Inner Component to control Map Bounds & Center
function MapController({
  userLat,
  userLng,
  targetLat,
  targetLng
}: {
  userLat?: number;
  userLng?: number;
  targetLat: number;
  targetLng: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    if (userLat && userLng) {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend({ lat: userLat, lng: userLng });
      bounds.extend({ lat: targetLat, lng: targetLng });
      map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
    } else {
      map.setCenter({ lat: targetLat, lng: targetLng });
      map.setZoom(16);
    }
  }, [map, userLat, userLng, targetLat, targetLng]);

  return null;
}

export const GoogleMapsAttendanceView: React.FC<GoogleMapsAttendanceViewProps> = ({
  locations = [],
  selectedLocation,
  onSelectLocation,
  onAttendanceSuccess,
  tenantId = 'tenant-1',
  userRole = 'GURU',
  userName = 'Pegawai',
  userId = 'usr-1',
  mode = 'ATTENDANCE',
  onLocationPick
}) => {
  // Device location state
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [permissionState, setPermissionState] = useState<'GRANTED' | 'DENIED' | 'PROMPT' | 'DISABLED'>('PROMPT');
  const [loadingGps, setLoadingGps] = useState<boolean>(false);
  const [gpsErrorMsg, setGpsErrorMsg] = useState<string | null>(null);

  // Active attendance target location
  const activeLocation = selectedLocation || locations[0] || {
    id: 'LOC-DEFAULT',
    name: 'Kampus Sekolah Utama',
    code: 'MAIN',
    latitude: -6.2088,
    longitude: 106.8456,
    radius: 100,
    status: 'ACTIVE',
    unit: 'SEMUA'
  };

  // Processing state
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Admin picker state
  const [pickerCoords, setPickerCoords] = useState<{ lat: number; lng: number }>({
    lat: activeLocation.latitude,
    lng: activeLocation.longitude
  });

  const showToast = (text: string, type: 'success' | 'error' | 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Request GPS location from device
  const refreshDeviceGps = useCallback(() => {
    if (!navigator.geolocation) {
      setPermissionState('DISABLED');
      setGpsErrorMsg('Layanan Geolocation tidak didukung oleh browser ini.');
      return;
    }

    setLoadingGps(true);
    setGpsErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy
        });
        setPermissionState('GRANTED');
        setLoadingGps(false);
      },
      (err) => {
        setLoadingGps(false);
        if (err.code === err.PERMISSION_DENIED) {
          setPermissionState('DENIED');
          setGpsErrorMsg('Izin akses lokasi ditolak oleh pengguna/perangkat.');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setPermissionState('DISABLED');
          setGpsErrorMsg('Sinyal lokasi tidak tersedia. Pastikan GPS perangkat aktif.');
        } else {
          setGpsErrorMsg('Waktu permintaan lokasi habis (Timeout).');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0
      }
    );
  }, []);

  useEffect(() => {
    refreshDeviceGps();
  }, [refreshDeviceGps]);

  // Distance calculation
  const distance = userCoords
    ? haversineDistance(userCoords.lat, userCoords.lng, activeLocation.latitude, activeLocation.longitude)
    : null;

  const isWithinRadius = distance !== null && distance <= activeLocation.radius;
  const isAccuracyAcceptable = userCoords ? userCoords.accuracy <= 200 : true;

  // Handle Check-In Submission
  const handleCheckIn = async () => {
    if (!userCoords) {
      showToast('Lokasi perangkat belum didapatkan. Tekan [Perbarui Lokasi].', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/attendance/employees/gps/check-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId
        },
        body: JSON.stringify({
          latitude: userCoords.lat,
          longitude: userCoords.lng,
          accuracy: userCoords.accuracy,
          isMockLocation: false,
          client_transaction_id: `TX-GPS-IN-${Date.now()}`
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(
          `Absen Masuk Berhasil! Status: ${data.data?.status || 'HADIR'} (${data.data?.distance_meters || distance}m)`,
          'success'
        );
        if (onAttendanceSuccess) onAttendanceSuccess(data.data);
      } else {
        const errorMsg = data.error?.message || data.message || 'Presensi GPS Masuk ditolak oleh server.';
        showToast(errorMsg, 'error');
      }
    } catch (err: any) {
      showToast('Gagal menghubungi server absensi. Periksa koneksi internet.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Check-Out Submission
  const handleCheckOut = async () => {
    if (!userCoords) {
      showToast('Lokasi perangkat belum didapatkan. Tekan [Perbarui Lokasi].', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/attendance/employees/check-out', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId
        },
        body: JSON.stringify({
          latitude: userCoords.lat,
          longitude: userCoords.lng,
          accuracy: userCoords.accuracy,
          isMockLocation: false,
          client_transaction_id: `TX-GPS-OUT-${Date.now()}`
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Absen Pulang Berhasil! Jam: ${data.data?.check_out_at || 'Selesai'}`, 'success');
        if (onAttendanceSuccess) onAttendanceSuccess(data.data);
      } else {
        const errorMsg = data.error?.message || data.message || 'Presensi GPS Pulang ditolak oleh server.';
        showToast(errorMsg, 'error');
      }
    } catch (err: any) {
      showToast('Gagal menghubungi server absensi. Periksa koneksi internet.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Setup Key Fallback View if Key is missing
  if (!hasValidKey) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-600" />
              Presensi Pegawai & Guru (GPS & Google Maps)
            </h2>
            <p className="text-xs text-slate-500">
              Sistem memvalidasi koordinat lokasi dan radius geofence secara realtime
            </p>
          </div>
        </div>

        {/* Live Fallback Interactive GPS Card */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 bg-amber-950/80 px-3 py-1 rounded-lg border border-amber-500/30">
              Sinyal GPS Device & High Precision Map
            </span>
            <button
              onClick={refreshDeviceGps}
              disabled={loadingGps}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingGps ? 'animate-spin' : ''}`} />
              <span>Perbarui Lokasi</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="bg-slate-800/90 p-4 rounded-xl border border-slate-700 space-y-2">
              <p className="text-indigo-400 font-bold flex items-center gap-1.5">
                <Building className="w-4 h-4" /> Titik Absensi: {activeLocation.name}
              </p>
              <p className="text-slate-300">Lat: {activeLocation.latitude}</p>
              <p className="text-slate-300">Lng: {activeLocation.longitude}</p>
              <p className="text-emerald-400 font-bold">Radius Toleransi: {activeLocation.radius} meter</p>
            </div>

            <div className="bg-slate-800/90 p-4 rounded-xl border border-slate-700 space-y-2">
              <p className="text-emerald-400 font-bold flex items-center gap-1.5">
                <Compass className="w-4 h-4" /> Posisi Perangkat Anda
              </p>
              {userCoords ? (
                <>
                  <p className="text-slate-300">Lat: {userCoords.lat.toFixed(6)}</p>
                  <p className="text-slate-300">Lng: {userCoords.lng.toFixed(6)}</p>
                  <p className="text-cyan-400">Akurasi GPS: ±{Math.round(userCoords.accuracy)} meter</p>
                </>
              ) : (
                <p className="text-amber-300 italic">Sedang mengambil koordinat GPS...</p>
              )}
            </div>
          </div>

          {/* Status Display */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span className="text-xs">
                Jarak ke Titik Sekolah:{' '}
                <strong className="text-white text-sm">{distance !== null ? `${distance} meter` : '-'}</strong>
              </span>
            </div>

            {distance !== null && (
              <span
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ${
                  isWithinRadius
                    ? 'bg-emerald-500 text-white'
                    : 'bg-rose-500 text-white'
                }`}
              >
                {isWithinRadius ? '✓ DALAM AREA ABSENSI' : '✕ DI LUAR AREA ABSENSI'}
              </span>
            )}
          </div>

          {/* Setup Notice for Google Maps API Key */}
          <div className="bg-indigo-950/80 border border-indigo-500/40 p-3 rounded-xl text-[11px] text-indigo-200">
            💡 Untuk mengaktifkan tampilan visual <strong>Google Maps SDK Interactive</strong>, atur secret key{' '}
            <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300 font-mono">GOOGLE_MAPS_PLATFORM_KEY</code> pada menu Settings AI Studio.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={handleCheckIn}
            disabled={submitting || !userCoords || !isWithinRadius}
            className="py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-black text-sm rounded-2xl transition shadow-lg shadow-emerald-200 flex flex-col items-center justify-center gap-1 cursor-pointer disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-6 h-6" />
            <span>{submitting ? 'Memproses...' : 'ABSEN MASUK'}</span>
            <span className="text-[10px] font-normal text-emerald-100">Batas: 07:30 WIB</span>
          </button>

          <button
            type="button"
            onClick={handleCheckOut}
            disabled={submitting || !userCoords || !isWithinRadius}
            className="py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-black text-sm rounded-2xl transition shadow-lg shadow-indigo-200 flex flex-col items-center justify-center gap-1 cursor-pointer disabled:cursor-not-allowed"
          >
            <LogOut className="w-6 h-6" />
            <span>{submitting ? 'Memproses...' : 'ABSEN PULANG'}</span>
            <span className="text-[10px] font-normal text-indigo-100">Jam Pulang: 16:00 WIB</span>
          </button>
        </div>

        {toastMessage && (
          <div
            className={`p-4 rounded-xl text-xs font-bold ${
              toastMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : toastMessage.type === 'error'
                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
            }`}
          >
            {toastMessage.text}
          </div>
        )}
      </div>
    );
  }

  // Google Maps Full Render Mode
  return (
    <APIProvider apiKey={API_KEY} version="weekly">
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-600" />
              Presensi Pegawai & Guru (Google Maps Geofence)
            </h2>
            <p className="text-xs text-slate-500">
              Validasi jarak koordinat dan radius titik lokasi absensi secara realtime
            </p>
          </div>

          {locations.length > 1 && onSelectLocation && (
            <select
              value={activeLocation.id}
              onChange={(e) => {
                const found = locations.find((l) => l.id === e.target.value);
                if (found) onSelectLocation(found);
              }}
              className="px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-700 cursor-pointer"
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} ({loc.radius}m)
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Map Container */}
        <div className="relative h-80 w-full rounded-2xl overflow-hidden border border-slate-300 shadow-inner">
          <Map
            defaultCenter={{ lat: activeLocation.latitude, lng: activeLocation.longitude }}
            defaultZoom={17}
            mapId="DEMO_MAP_ID"
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            style={{ width: '100%', height: '100%' }}
          >
            <MapController
              userLat={userCoords?.lat}
              userLng={userCoords?.lng}
              targetLat={activeLocation.latitude}
              targetLng={activeLocation.longitude}
            />

            {/* Attendance Location Pin */}
            <AdvancedMarker position={{ lat: activeLocation.latitude, lng: activeLocation.longitude }}>
              <Pin background="#4f46e5" glyphColor="#ffffff" borderColor="#312e81" />
            </AdvancedMarker>

            {/* User Location Pin */}
            {userCoords && (
              <AdvancedMarker position={{ lat: userCoords.lat, lng: userCoords.lng }}>
                <Pin background="#10b981" glyphColor="#ffffff" borderColor="#064e3b" />
              </AdvancedMarker>
            )}
          </Map>

          {/* Top Floating Badge */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            <div className="px-3 py-1.5 bg-slate-900/90 text-white text-[11px] font-mono rounded-xl shadow-lg border border-slate-700 backdrop-blur-md flex items-center gap-2 pointer-events-auto">
              <Building className="w-3.5 h-3.5 text-indigo-400" />
              <span>{activeLocation.name}</span>
            </div>

            <button
              onClick={refreshDeviceGps}
              disabled={loadingGps}
              className="px-3 py-1.5 bg-white/95 hover:bg-white text-slate-800 text-xs font-bold rounded-xl shadow-lg border border-slate-200 transition flex items-center gap-1.5 cursor-pointer backdrop-blur-md pointer-events-auto disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${loadingGps ? 'animate-spin' : ''}`} />
              <span>Perbarui Lokasi</span>
            </button>
          </div>

          {/* Bottom Floating Geofence Bar */}
          <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 border border-slate-800 text-white p-3 rounded-xl shadow-xl backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-3 text-xs">
              <Compass className="w-4 h-4 text-cyan-400" />
              <div>
                <p className="font-bold">
                  Jarak ke Sekolah: <span className="text-emerald-400">{distance !== null ? `${distance} m` : '-'}</span>
                </p>
                <p className="text-[10px] text-slate-300">
                  Akurasi Perangkat: ±{userCoords ? Math.round(userCoords.accuracy) : 0}m • Radius Toleransi: {activeLocation.radius}m
                </p>
              </div>
            </div>

            {distance !== null && (
              <span
                className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                  isWithinRadius
                    ? 'bg-emerald-500 text-white'
                    : 'bg-rose-500 text-white'
                }`}
              >
                {isWithinRadius ? '✓ DALAM AREA ABSENSI' : '✕ DI LUAR AREA ABSENSI'}
              </span>
            )}
          </div>
        </div>

        {/* Status Alerts */}
        {permissionState === 'DENIED' && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-xs text-rose-800 font-medium">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <p className="font-bold">IZIN LOKASI DIPERLUKAN</p>
              <p>Izin lokasi ditolak. Silakan aktifkan izin lokasi di setelan browser/perangkat Anda lalu tekan Perbarui Lokasi.</p>
            </div>
          </div>
        )}

        {permissionState === 'DISABLED' && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-xs text-amber-800 font-medium">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold">LAYANAN LOKASI TIDAK AKTIF</p>
              <p>{gpsErrorMsg || 'Layanan lokasi perangkat tidak aktif. Silakan aktifkan fitur GPS pada perangkat Anda.'}</p>
            </div>
          </div>
        )}

        {userCoords && !isAccuracyAcceptable && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-xs text-amber-800 font-medium">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold">LOKASI BELUM CUKUP AKURAT</p>
              <p>Akurasi sinyal GPS saat ini (±{Math.round(userCoords.accuracy)}m) melebihi batas toleransi. Silakan cari tempat terbuka dan tekan [Perbarui Lokasi].</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={handleCheckIn}
            disabled={submitting || !userCoords || !isWithinRadius || !isAccuracyAcceptable}
            className="py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-black text-sm rounded-2xl transition shadow-lg shadow-emerald-200 flex flex-col items-center justify-center gap-1 cursor-pointer disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-6 h-6" />
            <span>{submitting ? 'Memproses...' : 'ABSEN MASUK'}</span>
            <span className="text-[10px] font-normal text-emerald-100">Batas Jam: 07:30 WIB</span>
          </button>

          <button
            type="button"
            onClick={handleCheckOut}
            disabled={submitting || !userCoords || !isWithinRadius || !isAccuracyAcceptable}
            className="py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-black text-sm rounded-2xl transition shadow-lg shadow-indigo-200 flex flex-col items-center justify-center gap-1 cursor-pointer disabled:cursor-not-allowed"
          >
            <LogOut className="w-6 h-6" />
            <span>{submitting ? 'Memproses...' : 'ABSEN PULANG'}</span>
            <span className="text-[10px] font-normal text-indigo-100">Jam Pulang: 16:00 WIB</span>
          </button>
        </div>

        {toastMessage && (
          <div
            className={`p-4 rounded-xl text-xs font-bold ${
              toastMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : toastMessage.type === 'error'
                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
            }`}
          >
            {toastMessage.text}
          </div>
        )}
      </div>
    </APIProvider>
  );
};
