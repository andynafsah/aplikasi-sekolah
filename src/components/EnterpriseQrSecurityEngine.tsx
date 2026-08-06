import React, { useState, useEffect, useRef } from 'react';
import { 
  QrCode, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Smartphone, 
  MapPin, 
  RefreshCw, 
  Lock, 
  AlertTriangle, 
  Sliders, 
  Users, 
  Activity, 
  Check, 
  XCircle, 
  ShieldCheck, 
  Copy, 
  Download, 
  Eye, 
  Save, 
  Terminal, 
  Database,
  Radio,
  FileSpreadsheet
} from 'lucide-react';

export type QrType = 
  | 'DYNAMIC_QR' 
  | 'STATIC_QR' 
  | 'PERSONAL_QR' 
  | 'LOCATION_QR' 
  | 'CLASS_QR' 
  | 'ROOM_QR' 
  | 'EVENT_QR';

export type UserRole = 
  | 'Guru' 
  | 'Pegawai' 
  | 'TU' 
  | 'Musyrif' 
  | 'Satpam' 
  | 'Cleaning Service' 
  | 'Siswa' 
  | 'Santri';

interface QrSettings {
  intervalSeconds: number;
  tokenLength: number;
  ttlSeconds: number;
  gpsRadiusMeters: number;
  maxRetryAttempts: number;
  deviceBindingRequired: boolean;
  antiFraudLevel: 'HIGH' | 'STRICT' | 'STANDARD';
}

interface AuditLogItem {
  id: string;
  personName: string;
  role: string;
  qrType: string;
  status: string;
  timestamp: string;
  deviceId: string;
  deviceModel: string;
  ipAddress: string;
  details: string;
}

export default function EnterpriseQrSecurityEngine() {
  // State variables
  const [selectedRole, setSelectedRole] = useState<UserRole>('Guru');
  const [selectedQrType, setSelectedQrType] = useState<QrType>('DYNAMIC_QR');
  
  // Dynamic QR Token state
  const [currentQrToken, setCurrentQrToken] = useState<string>('');
  const [qrNonce, setQrNonce] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(60);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Settings State
  const [qrSettings, setQrSettings] = useState<QrSettings>({
    intervalSeconds: 60,
    tokenLength: 32,
    ttlSeconds: 60,
    gpsRadiusMeters: 100,
    maxRetryAttempts: 3,
    deviceBindingRequired: true,
    antiFraudLevel: 'HIGH'
  });

  // Scanner Simulator State
  const [scanTokenInput, setScanTokenInput] = useState<string>('');
  const [scannerPersonName, setScannerPersonName] = useState<string>('Ustadz Budi Raharjo, M.Pd.');
  const [scannerRole, setScannerRole] = useState<UserRole>('Guru');
  const [scannerDeviceId, setScannerDeviceId] = useState<string>('DEV-MOBILE-TRUSTED-1');
  const [scannerDeviceModel, setScannerDeviceModel] = useState<string>('Samsung Galaxy S24 Ultra');
  const [scannerLat, setScannerLat] = useState<number>(-6.20885);
  const [scannerLng, setScannerLng] = useState<number>(106.84562);
  const [scanType, setScanType] = useState<'MASUK' | 'PULANG' | 'SHALAT' | 'TAHFIDZ' | 'ASRAMA' | 'LEMBUR'>('MASUK');

  // Result state
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    status: string;
    message: string;
    data?: any;
  } | null>(null);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [activeViewTab, setActiveViewTab] = useState<'GENERATOR' | 'SCANNER' | 'SETTINGS' | 'AUDIT_LOGS'>('GENERATOR');

  // Fetch initial QR & settings on mount
  useEffect(() => {
    fetchQrSettings();
    generateNewQrToken();
    fetchAuditLogs();
  }, []);

  // Timer countdown loop
  useEffect(() => {
    if (selectedQrType !== 'DYNAMIC_QR') return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          generateNewQrToken();
          return qrSettings.intervalSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedQrType, qrSettings.intervalSeconds]);

  // Handle Fetch Settings
  const fetchQrSettings = async () => {
    try {
      const res = await fetch('/api/attendance/qrSettings');
      const data = await res.json();
      if (data.success && data.data) {
        setQrSettings(data.data);
        setCountdown(data.data.intervalSeconds || 60);
      }
    } catch (e) {
      console.warn('Failed to load QR settings:', e);
    }
  };

  // Handle Save Settings
  const saveQrSettings = async () => {
    try {
      const res = await fetch('/api/attendance/qrSettings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(qrSettings)
      });
      const data = await res.json();
      if (data.success) {
        alert('Setelan QR Security Engine berhasil disimpan ke database!');
        setCountdown(qrSettings.intervalSeconds);
        generateNewQrToken();
      } else {
        alert(`Gagal menyimpan setelan: ${data.message}`);
      }
    } catch (e: any) {
      alert(`Error koneksi: ${e.message}`);
    }
  };

  // Generate New QR Token
  const generateNewQrToken = async (overrideType?: QrType, overrideRole?: UserRole) => {
    setIsRefreshing(true);
    try {
      const typeToUse = overrideType || selectedQrType;
      const roleToUse = overrideRole || selectedRole;

      const res = await fetch('/api/attendance/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrType: typeToUse,
          role: roleToUse,
          unitId: 'UNIT-MAIN-01',
          locationLat: -6.20885,
          locationLng: 106.84562,
          ttlSeconds: qrSettings.ttlSeconds
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCurrentQrToken(data.data.qrToken);
        setQrNonce(data.data.nonce);
        setExpiresAt(data.data.expiresAt);
        setScanTokenInput(data.data.qrToken);
      }
    } catch (e) {
      console.error('Error generating QR:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Trigger Scan Attendance
  const handleScanAttendance = async () => {
    if (!scanTokenInput.trim()) {
      alert('Masukkan atau pilih QR Token terlebih dahulu!');
      return;
    }

    try {
      const res = await fetch('/api/attendance/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrToken: scanTokenInput,
          personId: `PERS-${Math.floor(Math.random() * 8999 + 1000)}`,
          personName: scannerPersonName,
          role: scannerRole,
          deviceId: scannerDeviceId,
          deviceModel: scannerDeviceModel,
          userLat: scannerLat,
          userLng: scannerLng,
          scanType: scanType
        })
      });

      const data = await res.json();
      setScanResult(data);
      fetchAuditLogs();
    } catch (e: any) {
      setScanResult({
        success: false,
        status: 'QR_INVALID',
        message: `Koneksi gagal: ${e.message}`
      });
    }
  };

  // Fetch Audit Logs
  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/attendance/history');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setAuditLogs(data.data);
      }
    } catch (e) {
      console.warn('Failed to load audit logs:', e);
    }
  };

  const qrTypesList: { id: QrType; label: string; desc: string }[] = [
    { id: 'DYNAMIC_QR', label: 'Dynamic QR', desc: 'Regenerasi otomatis interval 30-300s (Anti-Screenshot)' },
    { id: 'STATIC_QR', label: 'Static QR', desc: 'QR tetap untuk lokasi fisik gate atau papan informasi' },
    { id: 'PERSONAL_QR', label: 'Personal QR', desc: 'QR unik kartu identitas pegawai/guru/santri' },
    { id: 'LOCATION_QR', label: 'Location QR', desc: 'Terikat koordinat Geofence GIS area presensi' },
    { id: 'CLASS_QR', label: 'Class QR', desc: 'QR presensi KBM jam pelajaran kelas/ruang' },
    { id: 'ROOM_QR', label: 'Room QR', desc: 'QR presensi ruang lab/perpus/asrama' },
    { id: 'EVENT_QR', label: 'Event QR', desc: 'QR presensi upacara/kajian/rapat dinas' },
  ];

  const rolesList: UserRole[] = [
    'Guru', 'Pegawai', 'TU', 'Musyrif', 'Satpam', 'Cleaning Service', 'Siswa', 'Santri'
  ];

  return (
    <div className="space-y-6">
      {/* HEADER TITLE & STATUS BADGE */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-semibold mb-3 border border-indigo-500/30">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Enterprise QR Security Engine v2026.07 • Zero Fraud Hardening</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">Sistem Autentikasi Absensi QR Kriptografi</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Sistem autentikasi presensi berbasis Dynamic HMAC Signed Token, Anti-Screenshot, One-Time Nonce Validation, Geofencing, dan Device Binding untuk seluruh entitas sekolah.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveViewTab('GENERATOR')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeViewTab === 'GENERATOR' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white/10 hover:bg-white/20 text-slate-200'
            }`}
          >
            <QrCode className="h-4 w-4" />
            <span>Generator QR</span>
          </button>
          <button
            onClick={() => setActiveViewTab('SCANNER')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeViewTab === 'SCANNER' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white/10 hover:bg-white/20 text-slate-200'
            }`}
          >
            <Smartphone className="h-4 w-4" />
            <span>Scanner &amp; Validator</span>
          </button>
          <button
            onClick={() => setActiveViewTab('SETTINGS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeViewTab === 'SETTINGS' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white/10 hover:bg-white/20 text-slate-200'
            }`}
          >
            <Sliders className="h-4 w-4" />
            <span>Aturan &amp; Settings</span>
          </button>
          <button
            onClick={() => setActiveViewTab('AUDIT_LOGS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeViewTab === 'AUDIT_LOGS' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white/10 hover:bg-white/20 text-slate-200'
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>Audit Trail Fraud</span>
          </button>
        </div>
      </div>

      {/* VIEW TAB 1: QR GENERATOR & DYNAMIC DISPLAY */}
      {activeViewTab === 'GENERATOR' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: QR Type & Role Configurator */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Users className="h-4 w-4 text-indigo-600" />
                <span>Target Entitas &amp; Jenis QR</span>
              </h3>
              <p className="text-xs text-slate-500">Pilih peruntukan dan jenis QR token yang akan diterbitkan</p>
            </div>

            {/* Target Role Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Target Entitas Sekolah</label>
              <div className="grid grid-cols-2 gap-2">
                {rolesList.map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setSelectedRole(r);
                      generateNewQrToken(selectedQrType, r);
                    }}
                    className={`p-2 rounded-xl text-xs font-bold transition border text-left flex items-center justify-between cursor-pointer ${
                      selectedRole === r
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{r}</span>
                    {selectedRole === r && <Check className="h-3.5 w-3.5 text-indigo-600" />}
                  </button>
                ))}
              </div>
            </div>

            {/* QR Type Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Pilih Tipe QR Code</label>
              <div className="space-y-2">
                {qrTypesList.map((qt) => (
                  <button
                    key={qt.id}
                    onClick={() => {
                      setSelectedQrType(qt.id);
                      generateNewQrToken(qt.id, selectedRole);
                    }}
                    className={`w-full p-3 rounded-xl text-xs font-bold transition border text-left flex flex-col gap-0.5 cursor-pointer ${
                      selectedQrType === qt.id
                        ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold">{qt.label}</span>
                      {selectedQrType === qt.id && <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />}
                    </div>
                    <span className={`text-[10px] ${selectedQrType === qt.id ? 'text-slate-300' : 'text-slate-500'}`}>
                      {qt.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Realtime Dynamic QR Visual Display */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <QrCode className="h-4 w-4 text-indigo-600" />
                    <span>Dynamic Live QR Display Container</span>
                  </h3>
                  <p className="text-xs text-slate-500">QR Code aktif untuk pemindaian presensi langsung di Lobi / Ruang Kelas</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold font-mono">
                    Target: {selectedRole}
                  </span>
                  <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold font-mono">
                    {selectedQrType}
                  </span>
                </div>
              </div>

              {/* Realtime QR Display Canvas */}
              <div className="p-8 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center justify-center gap-6 relative overflow-hidden">
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

                {/* Animated Scanner Radar Line for Anti-Screenshot */}
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse top-4 opacity-75" />

                <div className="relative z-10 p-5 bg-white rounded-2xl shadow-2xl border-4 border-indigo-500/80 flex flex-col items-center gap-3">
                  <QrCode className="h-52 w-52 text-slate-900" />
                  
                  <div className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-mono font-bold text-slate-600 flex items-center gap-1.5">
                    <Lock className="h-3 w-3 text-emerald-600" />
                    <span>HMAC-SHA256 Encrypted Token</span>
                  </div>
                </div>

                {/* Countdown Timer Bar for Dynamic QR */}
                {selectedQrType === 'DYNAMIC_QR' ? (
                  <div className="relative z-10 w-full max-w-md space-y-2 text-center">
                    <div className="flex items-center justify-between text-xs text-slate-300 font-mono">
                      <span>Regenerasi Token Otomatis:</span>
                      <span className="font-extrabold text-emerald-400">{countdown} Detik</span>
                    </div>

                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700">
                      <div
                        className="bg-gradient-to-r from-indigo-500 via-emerald-400 to-emerald-500 h-full rounded-full transition-all duration-1000"
                        style={{ width: `${(countdown / qrSettings.intervalSeconds) * 100}%` }}
                      />
                    </div>

                    <p className="text-[10px] text-slate-400 font-mono">
                      Interval Server: {qrSettings.intervalSeconds}s • Anti-Screenshot Nonce: <span className="text-amber-300">{qrNonce}</span>
                    </p>
                  </div>
                ) : (
                  <div className="relative z-10 text-center space-y-1">
                    <span className="text-xs font-bold text-emerald-400 font-mono">● Static QR Token Permanent Active</span>
                    <p className="text-[10px] text-slate-400 font-mono">Terikat lokasi &amp; jadwal sekolah tanpa batas waktu.</p>
                  </div>
                )}

                {/* Raw Encrypted Token View */}
                <div className="relative z-10 w-full bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-left font-mono text-[10px] text-slate-300 space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="font-bold text-indigo-400">Payload Token Encrypted (Base64URL):</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(currentQrToken);
                        alert('Token QR tersalin ke clipboard!');
                      }}
                      className="text-xs text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="h-3 w-3" /> Salin
                    </button>
                  </div>
                  <p className="break-all text-slate-300 text-[9px] bg-slate-950 p-2 rounded border border-slate-800">
                    {currentQrToken || 'Memuat token...'}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100">
              <button
                onClick={() => generateNewQrToken()}
                disabled={isRefreshing}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Paksa Regenerasi Token QR</span>
              </button>

              <button
                onClick={() => {
                  setActiveViewTab('SCANNER');
                  setScanTokenInput(currentQrToken);
                }}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer"
              >
                <Smartphone className="h-4 w-4 text-emerald-400" />
                <span>Uji Pemindaian di Scanner</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW TAB 2: LIVE SCANNER & VALIDATOR KARTU PELAJAR */}
      {activeViewTab === 'SCANNER' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scanner Controls */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-indigo-600" />
                <span>Mobile App HP Guru / Karyawan &amp; Gate Reader Scanner</span>
              </h3>
              <p className="text-xs text-slate-500">Pemindaian token QR Kartu Pelajar dengan verifikasi kriptografi &amp; aturan lokasi/device</p>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Raw QR Token Payload</label>
                <textarea
                  rows={3}
                  value={scanTokenInput}
                  onChange={(e) => setScanTokenInput(e.target.value)}
                  placeholder="Tempelkan token QR di sini..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Pemindai</label>
                  <input
                    type="text"
                    value={scannerPersonName}
                    onChange={(e) => setScannerPersonName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role Pemindai</label>
                  <select
                    value={scannerRole}
                    onChange={(e) => setScannerRole(e.target.value as UserRole)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  >
                    {rolesList.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jenis Presensi</label>
                  <select
                    value={scanType}
                    onChange={(e) => setScanType(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 font-bold text-indigo-700"
                  >
                    <option value="MASUK">MASUK</option>
                    <option value="PULANG">PULANG</option>
                    <option value="SHALAT">SHALAT BERJAMAAH</option>
                    <option value="TAHFIDZ">TAHFIDZ AL-QURAN</option>
                    <option value="ASRAMA">APEL ASRAMA</option>
                    <option value="LEMBUR">LEMBUR KERJA</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Perangkat (Device ID)</label>
                  <input
                    type="text"
                    value={scannerDeviceId}
                    onChange={(e) => setScannerDeviceId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Latitude GPS Client</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={scannerLat}
                    onChange={(e) => setScannerLat(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Longitude GPS Client</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={scannerLng}
                    onChange={(e) => setScannerLng(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <button
                onClick={handleScanAttendance}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>KIRIM HASIL SCAN PRESENSI KE SERVER</span>
              </button>
            </div>
          </div>

          {/* Validation Result Output Banner */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-indigo-600" />
                  <span>Hasil Ringkasan Validasi Server</span>
                </h3>
                <p className="text-xs text-slate-500">Keluaran seketika dari Enterprise QR Security Engine</p>
              </div>

              {scanResult ? (
                <div className={`p-6 rounded-2xl border space-y-4 ${
                  scanResult.status === 'QR_VALID'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : scanResult.status === 'QR_EXPIRED'
                    ? 'bg-amber-50 border-amber-300 text-amber-950'
                    : 'bg-rose-50 border-rose-300 text-rose-950'
                }`}>
                  <div className="flex items-center gap-3">
                    {scanResult.status === 'QR_VALID' ? (
                      <CheckCircle2 className="h-8 w-8 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="h-8 w-8 text-rose-600 shrink-0" />
                    )}
                    <div>
                      <span className="text-xs font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-white/80 border border-current">
                        {scanResult.status}
                      </span>
                      <h4 className="text-base font-bold mt-1">{scanResult.message}</h4>
                    </div>
                  </div>

                  {scanResult.data?.record && (
                    <div className="bg-white/80 p-4 rounded-xl border border-emerald-200 space-y-1 text-xs font-mono text-slate-800">
                      <p><strong>Nama:</strong> {scanResult.data.record.name}</p>
                      <p><strong>Role:</strong> {scanResult.data.record.role}</p>
                      <p><strong>Tanggal/Waktu:</strong> {scanResult.data.record.date} {scanResult.data.record.time}</p>
                      <p><strong>Perangkat:</strong> {scanResult.data.record.deviceId}</p>
                      <p><strong>Detail:</strong> {scanResult.data.record.details}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-12 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-2 text-slate-400">
                  <Smartphone className="h-10 w-10 mx-auto text-slate-300" />
                  <p className="text-xs font-medium">Belum ada pemindaian yang diproses.</p>
                  <p className="text-[10px]">Klik "Kirim Hasil Scan Presensi" untuk menguji sistem verifikasi.</p>
                </div>
              )}
            </div>

            {/* Verification Checklist Indicator */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-[11px] font-mono text-slate-600">
              <span className="font-bold text-slate-800 uppercase text-[10px]">Cakupan Validasi Keamanan:</span>
              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="h-3 w-3" /> Signed HMAC Signature
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="h-3 w-3" /> Expiry Time Verification
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="h-3 w-3" /> Anti-Replay Nonce Check
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="h-3 w-3" /> Device Binding Trusted HP
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="h-3 w-3" /> Geofence GIS Distance
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="h-3 w-3" /> Role &amp; Unit Matching
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW TAB 3: QR SECURITY DATABASE SETTINGS */}
      {activeViewTab === 'SETTINGS' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Sliders className="h-4 w-4 text-indigo-600" />
                <span>Pengaturan Engine QR Security dari Database</span>
              </h3>
              <p className="text-xs text-slate-500">Seluruh konfigurasi bersifat dinamis dan tersimpan di database tanpa hardcode</p>
            </div>

            <button
              onClick={saveQrSettings}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>Simpan Setelan</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs font-mono">
            {/* Setting 1: Interval QR */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <label className="font-bold text-slate-800 block">Interval Regenerasi QR (Detik)</label>
              <select
                value={qrSettings.intervalSeconds}
                onChange={(e) => setQrSettings(p => ({ ...p, intervalSeconds: Number(e.target.value) }))}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-indigo-700 focus:outline-none"
              >
                <option value={30}>30 Detik (Keamanan Tinggi)</option>
                <option value={60}>60 Detik (Standar Rekomendasi)</option>
                <option value={120}>120 Detik (2 Menit)</option>
                <option value={300}>300 Detik (5 Menit)</option>
              </select>
              <p className="text-[10px] text-slate-500">Makin singkat interval, makin aman dari kebocoran foto / screenshot QR.</p>
            </div>

            {/* Setting 2: TTL Token Expiry */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <label className="font-bold text-slate-800 block">TTL Masa Berlaku Token (Detik)</label>
              <input
                type="number"
                value={qrSettings.ttlSeconds}
                onChange={(e) => setQrSettings(p => ({ ...p, ttlSeconds: Number(e.target.value) }))}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold focus:outline-none"
              />
              <p className="text-[10px] text-slate-500">Token otomatis kadaluarsa jika tidak discan sebelum batas TTL.</p>
            </div>

            {/* Setting 3: Geofence Radius */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <label className="font-bold text-slate-800 block">Radius Geofence GPS (Meter)</label>
              <input
                type="number"
                value={qrSettings.gpsRadiusMeters}
                onChange={(e) => setQrSettings(p => ({ ...p, gpsRadiusMeters: Number(e.target.value) }))}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold focus:outline-none"
              />
              <p className="text-[10px] text-slate-500">Batas toleransi lokasi presensi dari koordinat QR.</p>
            </div>

            {/* Setting 4: Device Binding Toggle */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <label className="font-bold text-slate-800 block">Wajib Device Binding (Trusted HP)</label>
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="checkbox"
                  id="devBindingCheck"
                  checked={qrSettings.deviceBindingRequired}
                  onChange={(e) => setQrSettings(p => ({ ...p, deviceBindingRequired: e.target.checked }))}
                  className="h-4 w-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
                <label htmlFor="devBindingCheck" className="text-xs font-bold text-slate-700 cursor-pointer">
                  {qrSettings.deviceBindingRequired ? 'AKTIF (Terapkan Kunci HP)' : 'NON-AKTIF (Semua HP Boleh)'}
                </label>
              </div>
              <p className="text-[10px] text-slate-500">Pemberitahuan peringatan otomatis jika absen dari HP asing.</p>
            </div>

            {/* Setting 5: Anti-Fraud Level */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <label className="font-bold text-slate-800 block">Tingkat Anti-Fraud</label>
              <select
                value={qrSettings.antiFraudLevel}
                onChange={(e) => setQrSettings(p => ({ ...p, antiFraudLevel: e.target.value as any }))}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-emerald-700 focus:outline-none"
              >
                <option value="HIGH">HIGH (Lengkap Nonce + GPS + Binding)</option>
                <option value="STRICT">STRICT (Super Ketat Max Retry 1x)</option>
                <option value="STANDARD">STANDARD (Verifikasi Token Dasar)</option>
              </select>
              <p className="text-[10px] text-slate-500">Menentukan ketatnya algoritma pemblokiran manipulasi.</p>
            </div>

            {/* Setting 6: Max Retry */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <label className="font-bold text-slate-800 block">Maksimal Percobaan Gagal (Retry)</label>
              <input
                type="number"
                value={qrSettings.maxRetryAttempts}
                onChange={(e) => setQrSettings(p => ({ ...p, maxRetryAttempts: Number(e.target.value) }))}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold focus:outline-none"
              />
              <p className="text-[10px] text-slate-500">Batas retry sebelum perangkat ditandai bertindak curang.</p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW TAB 4: AUDIT TRAIL & FRAUD LOGS TABLE */}
      {activeViewTab === 'AUDIT_LOGS' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Activity className="h-4 w-4 text-indigo-600" />
                <span>Audit Trail Scan &amp; Deteksi Kecurangan (Fraud Audit Logs)</span>
              </h3>
              <p className="text-xs text-slate-500">Merekam riwayat Siapa Scan, Jam, Lokasi, Perangkat, IP, dan Status secara lengkap</p>
            </div>

            <button
              onClick={fetchAuditLogs}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Refresh Log
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3">Waktu Log</th>
                  <th className="p-3">Nama Pemindai</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Perangkat / IP</th>
                  <th className="p-3">Status QR</th>
                  <th className="p-3">Detail Audit &amp; Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-400 italic">
                      Belum ada log aktivitas pemindaian QR. Silakan gunakan kamera HP Guru atau Karyawan untuk memindai Kartu Pelajar Siswa.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 text-slate-500">{new Date(log.timestamp).toLocaleTimeString('id-ID')}</td>
                      <td className="p-3 font-bold text-slate-900">{log.personName}</td>
                      <td className="p-3 text-slate-600">{log.role}</td>
                      <td className="p-3 text-slate-500">
                        <span>{log.deviceModel || log.deviceId}</span>
                        <div className="text-[9px] text-slate-400">{log.ipAddress}</div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.status === 'QR_VALID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.status === 'QR_EXPIRED'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-700 max-w-xs truncate">{log.details}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
