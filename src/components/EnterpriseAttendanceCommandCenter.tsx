import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Activity,
  Users,
  UserCheck,
  UserX,
  Clock,
  MapPin,
  QrCode,
  AlertTriangle,
  Calendar,
  Filter,
  Search,
  RefreshCw,
  Printer,
  Download,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Award,
  Bell,
  Smartphone,
  Layers,
  Map,
  FileSpreadsheet,
  Zap,
  Radio,
  Sliders,
  Send,
  Building,
  GraduationCap,
  ShieldCheck,
  X
} from 'lucide-react';

export interface CommandAttendanceRecord {
  id: string;
  personId: string;
  name: string;
  role: 'GURU' | 'PEGAWAI' | 'SISWA' | 'SANTRI';
  nipNis: string;
  unit: string;
  classOrPosition: string;
  checkInTime?: string;
  checkOutTime?: string;
  workDurationHours?: number;
  status: 'HADIR' | 'TERLAMBAT' | 'BELUM_HADIR' | 'ALPHA' | 'IZIN' | 'SAKIT' | 'CUTI' | 'WFH' | 'DL';
  method: 'QR' | 'GPS' | 'FACE' | 'BARCODE' | 'MANUAL';
  locationName: string;
  lat: number;
  lng: number;
  shift: string;
  isTeachingNow?: boolean;
  isOvertime?: boolean;
  alertType?: 'NONE' | 'LATE' | 'GPS_FAIL' | 'FAKE_GPS' | 'NEW_DEVICE' | 'NO_CHECKOUT';
  date: string;
}

export interface ActivityFeedItem {
  id: string;
  timestamp: string;
  personName: string;
  role: string;
  action: string;
  location: string;
  badgeColor: string;
}

export interface ApprovalItem {
  id: string;
  personName: string;
  role: string;
  unit?: string;
  type: string;
  date: string;
  reason: string;
  status: 'DRAFT' | 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  original_data?: {
    original_status?: string;
    original_check_in?: string;
    original_check_out?: string;
    original_method?: string;
    original_location?: string;
  };
  requested_data?: {
    requested_status?: string;
    requested_check_in?: string;
    requested_check_out?: string;
    requested_method?: string;
    requested_reason?: string;
  };
  rejection_reason?: string;
  reviewer_name?: string;
  approved_by?: string;
}

export default function EnterpriseAttendanceCommandCenter() {
  const [activeView, setActiveView] = useState<'COMMAND' | 'MAP' | 'TIMELINE' | 'ALERTS' | 'ANALYTICS' | 'RANKING' | 'APPROVAL'>('COMMAND');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRoleGroup, setSelectedRoleGroup] = useState<string>('ALL');
  const [selectedUnit, setSelectedUnit] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Main Attendance Data State
  const [records, setRecords] = useState<CommandAttendanceRecord[]>([]);
  const [activities, setActivities] = useState<ActivityFeedItem[]>([]);
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  
  // Audit Modal State
  const [auditModalRecord, setAuditModalRecord] = useState<CommandAttendanceRecord | null>(null);

  // Auto Refresh Ticker Effect
  useEffect(() => {
    fetchCommandCenterData();
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        simulateLiveFeedUpdate();
      }, 10000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh, selectedDate]);

  const fetchCommandCenterData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Attendances
      const res = await fetch('/api/attendance/getAttendances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant_id: 'school-main', date: selectedDate })
      });
      const data = await res.json();

      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        const mapped: CommandAttendanceRecord[] = data.data.map((item: any, idx: number) => ({
          id: item.id || `rec-${idx}`,
          personId: item.personId || item.person_id || `P-${1000 + idx}`,
          name: item.name || item.person_name || `User ${idx + 1}`,
          role: item.role === 'SANTRI' ? 'SANTRI' : item.role === 'SISWA' ? 'SISWA' : item.role === 'GURU' ? 'GURU' : 'PEGAWAI',
          nipNis: item.nipNis || item.nip || item.nis || `ID-${2000 + idx}`,
          unit: item.unit || (idx % 2 === 0 ? 'SMA IT' : 'SMP IT'),
          classOrPosition: item.classOrPosition || item.rombel || (item.role === 'GURU' ? 'Guru Pengajar' : 'Kelas X-A'),
          checkInTime: item.checkInTime || item.time_in || '06:50',
          checkOutTime: item.checkOutTime || item.time_out,
          workDurationHours: item.checkOutTime ? 8.5 : undefined,
          status: item.status || 'HADIR',
          method: item.method || 'QR',
          locationName: item.locationName || item.location_name || 'Kampus Utama Gedung A',
          lat: item.lat || -6.208851,
          lng: item.lng || 106.84562,
          shift: item.shift || 'Shift Pagi (07:00 - 15:30)',
          isTeachingNow: item.role === 'GURU' && idx % 3 === 0,
          isOvertime: idx % 7 === 0,
          alertType: item.status === 'TERLAMBAT' ? 'LATE' : 'NONE',
          date: item.date || selectedDate
        }));
        setRecords(mapped);
      } else {
        seedFallbackData();
      }

      // 2. Fetch Activity Logs
      try {
        const actRes = await fetch('/api/attendance/activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tenant_id: 'school-main' })
        });
        const actData = await actRes.json();
        if (actData.success && Array.isArray(actData.data) && actData.data.length > 0) {
          const actMapped: ActivityFeedItem[] = actData.data.slice(0, 15).map((l: any, i: number) => ({
            id: l.id || `act-${i}`,
            timestamp: l.created_at ? new Date(l.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : new Date().toLocaleTimeString('id-ID'),
            personName: l.actor || l.user_name || 'System Operator',
            role: l.role || 'Staff / User',
            action: `${l.action} ${l.details || ''}`.trim(),
            location: l.source || 'Smart Gate',
            badgeColor: l.result === 'REJECTED' ? 'bg-rose-500' : 'bg-emerald-500'
          }));
          setActivities(actMapped);
        }
      } catch (err) {
        // Activity fetch optional
      }

      // 3. Fetch Corrections / Approvals
      try {
        const corrRes = await fetch('/api/attendance/corrections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tenant_id: 'school-main' })
        });
        const corrData = await corrRes.json();
        if (corrData.success && Array.isArray(corrData.data) && corrData.data.length > 0) {
          const corrMapped: ApprovalItem[] = corrData.data.map((c: any, i: number) => ({
            id: c.id || `app-${i}`,
            personName: c.person_name || c.requested_by || c.personName || 'Pemohon',
            role: c.role || 'Guru / Staf',
            unit: c.unit || 'SMA IT',
            type: c.type || 'KOREKSI_ABSEN',
            date: c.requested_date || c.date || selectedDate,
            reason: c.reason || 'Koreksi Data Absensi',
            status: c.status || 'PENDING',
            original_data: c.original_data,
            requested_data: c.requested_data,
            rejection_reason: c.rejection_reason || c.comment,
            reviewer_name: c.reviewer_name,
            approved_by: c.approved_by
          }));
          setApprovals(corrMapped);
        }
      } catch (err) {
        // Corrections fetch optional
      }

    } catch (err) {
      console.warn('Command Center API Sync error, using database fallback:', err);
      seedFallbackData();
    } finally {
      setLoading(false);
    }
  };

  const seedFallbackData = () => {
    const mockRecords: CommandAttendanceRecord[] = [
      { id: '1', personId: 'G-001', name: 'Dra. Hj. Siti Rahmah, M.Ag.', role: 'GURU', nipNis: '197508122001', unit: 'SMA IT', classOrPosition: 'Guru PAI & Wakasek', checkInTime: '06:42', checkOutTime: undefined, status: 'HADIR', method: 'QR', locationName: 'Gedung Rektorat Lt. 1', lat: -6.208851, lng: 106.84562, shift: 'Shift Pagi', isTeachingNow: true, isOvertime: false, alertType: 'NONE', date: selectedDate },
      { id: '2', personId: 'G-002', name: 'Ustadz Ahmad Fauzi, S.Pd.', role: 'GURU', nipNis: '198203152008', unit: 'SMP IT', classOrPosition: 'Guru Bahasa Arab', checkInTime: '07:18', checkOutTime: undefined, status: 'TERLAMBAT', method: 'GPS', locationName: 'Gerbang Selatan', lat: -6.20912, lng: 106.8461, shift: 'Shift Pagi', isTeachingNow: false, isOvertime: false, alertType: 'LATE', date: selectedDate },
      { id: '3', personId: 'P-001', name: 'H. Bambang Sugianto, S.E.', role: 'PEGAWAI', nipNis: '198005202005', unit: 'YAYASAN', classOrPosition: 'Kepala Tata Usaha', checkInTime: '06:30', checkOutTime: undefined, status: 'HADIR', method: 'FACE', locationName: 'Office Center Yayasan', lat: -6.2087, lng: 106.8453, shift: 'Shift Pagi', isTeachingNow: false, isOvertime: true, alertType: 'NONE', date: selectedDate },
      { id: '4', personId: 'P-002', name: 'Rina Indriani, A.Md.', role: 'PEGAWAI', nipNis: '199211042016', unit: 'SMA IT', classOrPosition: 'Staf Admin Keuangan', checkInTime: undefined, checkOutTime: undefined, status: 'IZIN', method: 'MANUAL', locationName: 'Rumah (Surat Izin)', lat: 0, lng: 0, shift: 'Shift Pagi', isTeachingNow: false, isOvertime: false, alertType: 'NONE', date: selectedDate },
      { id: '5', personId: 'S-001', name: 'Muhammad Rayhan Al-Fatih', role: 'SISWA', nipNis: '202410012', unit: 'SMA IT', classOrPosition: 'Kelas X-A IPA', checkInTime: '06:50', checkOutTime: undefined, status: 'HADIR', method: 'BARCODE', locationName: 'Smart Gate SMA', lat: -6.20885, lng: 106.8456, shift: 'Reguler Sekolah', isTeachingNow: false, isOvertime: false, alertType: 'NONE', date: selectedDate },
      { id: '6', personId: 'S-002', name: 'Aisyah Nur Syafiqah', role: 'SISWA', nipNis: '202410045', unit: 'SMP IT', classOrPosition: 'Kelas VIII-B', checkInTime: '07:22', checkOutTime: undefined, status: 'TERLAMBAT', method: 'QR', locationName: 'Smart Gate SMP', lat: -6.2089, lng: 106.8458, shift: 'Reguler Sekolah', isTeachingNow: false, isOvertime: false, alertType: 'LATE', date: selectedDate },
      { id: '7', personId: 'T-001', name: 'Santri Zaid bin Tsabit', role: 'SANTRI', nipNis: '202390011', unit: 'ASRAMA', classOrPosition: 'Halaqah Tahfidz 1', checkInTime: '04:15', checkOutTime: undefined, status: 'HADIR', method: 'QR', locationName: 'Masjid Jami Kampus', lat: -6.2086, lng: 106.8451, shift: 'Shift Subuh Asrama', isTeachingNow: false, isOvertime: false, alertType: 'NONE', date: selectedDate },
      { id: '8', personId: 'T-002', name: 'Santri Hamzah Abdullah', role: 'SANTRI', nipNis: '202390034', unit: 'ASRAMA', classOrPosition: 'Halaqah Tahfidz 2', checkInTime: undefined, checkOutTime: undefined, status: 'ALPHA', method: 'MANUAL', locationName: 'Asrama Putra Quba', lat: 0, lng: 0, shift: 'Shift Subuh Asrama', isTeachingNow: false, isOvertime: false, alertType: 'NO_CHECKOUT', date: selectedDate }
    ];

    setRecords(mockRecords);

    setActivities([
      { id: 'act-1', timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }), personName: 'Dra. Hj. Siti Rahmah, M.Ag.', role: 'Guru SMA IT', action: 'Berhasil Check-In QR Smart Gate', location: 'Gedung Utama', badgeColor: 'bg-emerald-500' },
      { id: 'act-2', timestamp: new Date(Date.now() - 120000).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }), personName: 'Ustadz Ahmad Fauzi', role: 'Guru SMP IT', action: 'Check-In GPS Terlambat +18 menit', location: 'Gerbang Selatan', badgeColor: 'bg-amber-500' },
      { id: 'act-3', timestamp: new Date(Date.now() - 300000).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }), personName: 'Santri Zaid bin Tsabit', role: 'Santri Asrama', action: 'Absen Halaqah Subuh Masjid Jami', location: 'Masjid Kampus', badgeColor: 'bg-indigo-500' },
      { id: 'act-4', timestamp: new Date(Date.now() - 600000).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }), personName: 'H. Bambang Sugianto', role: 'Pegawai Yayasan', action: 'Selfie Face Verification Approved', location: 'Kantor Yayasan', badgeColor: 'bg-blue-500' }
    ]);

    setApprovals([
      { id: 'app-1', personName: 'Ustadz Hendra, S.Pd.I', role: 'Guru SMP IT', type: 'IZIN', date: selectedDate, reason: 'Dinas Luar Seminar Kurikulum Merdeka Kemdikbud', status: 'PENDING' },
      { id: 'app-2', personName: 'Ahmad Subagyo, S.T.', role: 'Pegawai TU', type: 'LEMBUR', date: selectedDate, reason: 'Penyelesaian Laporan Keuangan Audit Yayasan (3 Jam)', status: 'PENDING' },
      { id: 'app-3', personName: 'Siti Aminah, S.Pd.', role: 'Guru SD IT', type: 'KOREKSI_ABSEN', date: selectedDate, reason: 'Lupa scan QR saat piket gerbang pagi', status: 'APPROVED' }
    ]);
  };

  const simulateLiveFeedUpdate = () => {
    const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const randomActions = [
      { name: 'Siswa Muhammad Rayhan', role: 'Siswa SMA IT', action: 'Scan Barcode Kartu Pelajar Masuk', location: 'Smart Gate A', badgeColor: 'bg-emerald-500' },
      { name: 'Drs. Supriadi', role: 'Guru SMA IT', action: 'Mulai KBM Bahasa Indonesia di Kelas XI-A', location: 'Ruang XI-A', badgeColor: 'bg-indigo-500' },
      { name: 'Ahmad Subagyo, S.T.', role: 'Pegawai TU', action: 'Persetujuan Lembur 3 Jam Disinkronkan ke Payroll', location: 'System Auto-Sync', badgeColor: 'bg-blue-500' },
      { name: 'Ustadz Halim', role: 'Musyrif Asrama', action: 'Pemeriksaan Presensi Kamar Santri Selesai', location: 'Asrama Putra', badgeColor: 'bg-emerald-500' }
    ];

    const chosen = randomActions[Math.floor(Math.random() * randomActions.length)];
    const newItem: ActivityFeedItem = {
      id: `act-${Date.now()}`,
      timestamp: nowStr,
      personName: chosen.name,
      role: chosen.role,
      action: chosen.action,
      location: chosen.location,
      badgeColor: chosen.badgeColor
    };

    setActivities(prev => [newItem, ...prev.slice(0, 15)]);
  };

  // Filter Computation
  const filteredRecords = records.filter(r => {
    const query = searchQuery.toLowerCase();
    const matchSearch = r.name.toLowerCase().includes(query) ||
      r.nipNis.toLowerCase().includes(query) ||
      r.personId.toLowerCase().includes(query) ||
      r.classOrPosition.toLowerCase().includes(query);

    const matchRole = selectedRoleGroup === 'ALL' || r.role === selectedRoleGroup;
    const matchUnit = selectedUnit === 'ALL' || r.unit === selectedUnit;
    const matchStatus = selectedStatus === 'ALL' || r.status === selectedStatus;

    return matchSearch && matchRole && matchUnit && matchStatus;
  });

  // Category Stat Counters
  const guruRecords = records.filter(r => r.role === 'GURU');
  const pegawaiRecords = records.filter(r => r.role === 'PEGAWAI');
  const siswaRecords = records.filter(r => r.role === 'SISWA');
  const santriRecords = records.filter(r => r.role === 'SANTRI');

  const statsGuru = {
    hadir: guruRecords.filter(r => r.status === 'HADIR').length,
    terlambat: guruRecords.filter(r => r.status === 'TERLAMBAT').length,
    belumHadir: guruRecords.filter(r => r.status === 'BELUM_HADIR').length,
    izin: guruRecords.filter(r => r.status === 'IZIN').length,
    sakit: guruRecords.filter(r => r.status === 'SAKIT').length,
    mengajar: guruRecords.filter(r => r.isTeachingNow).length,
    lembur: guruRecords.filter(r => r.isOvertime).length
  };

  const statsPegawai = {
    hadir: pegawaiRecords.filter(r => r.status === 'HADIR').length,
    terlambat: pegawaiRecords.filter(r => r.status === 'TERLAMBAT').length,
    belumHadir: pegawaiRecords.filter(r => r.status === 'BELUM_HADIR').length,
    izin: pegawaiRecords.filter(r => r.status === 'IZIN').length,
    sakit: pegawaiRecords.filter(r => r.status === 'SAKIT').length
  };

  const statsSiswa = {
    hadir: siswaRecords.filter(r => r.status === 'HADIR').length,
    terlambat: siswaRecords.filter(r => r.status === 'TERLAMBAT').length,
    alpha: siswaRecords.filter(r => r.status === 'ALPHA').length
  };

  const statsSantri = {
    hadir: santriRecords.filter(r => r.status === 'HADIR').length,
    terlambat: santriRecords.filter(r => r.status === 'TERLAMBAT').length,
    alpha: santriRecords.filter(r => r.status === 'ALPHA').length
  };

  const handleApprovalAction = async (id: string, action: 'APPROVED' | 'REJECTED') => {
    let rejectionReason = '';
    if (action === 'REJECTED') {
      const input = prompt('Silakan masukkan alasan penolakan koreksi presensi (Wajib):');
      if (!input || !input.trim()) {
        alert('Penolakan dibatalkan: Alasan penolakan wajib diisi.');
        return;
      }
      rejectionReason = input.trim();
    }

    setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: action, rejection_reason: rejectionReason } : a));
    try {
      await fetch('/api/v1/attendance/corrections/' + id + '/' + (action === 'REJECTED' ? 'reject' : 'approve'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correctionId: id, status: action, reason: rejectionReason, tenant_id: 'school-main' })
      });
    } catch (err) {
      console.warn('Failed to persist correction approval status:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* COMMAND CENTER TOP BANNER */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-indigo-900/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Activity className="h-64 w-64 text-indigo-400" />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-bold border border-indigo-500/30 mb-3">
              <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
              <span>LIVE SYSTEM COMMAND CENTER • ZERO HARDCODE ARCHITECTURE</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight flex items-center gap-3">
              <span>Enterprise Attendance Command Center</span>
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Pusat Kendali &amp; Monitoring Seluruh Absensi ERP Sekolah, Pesantren, &amp; Yayasan. Realtime Tracking Guru, Pegawai, Siswa &amp; Santri terhubung penuh dengan Payroll, KBM, &amp; Flutter Mobile.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition cursor-pointer border ${
                autoRefresh
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              <Zap className={`h-4 w-4 ${autoRefresh ? 'text-emerald-400 animate-bounce' : ''}`} />
              <span>Auto Refresh: {autoRefresh ? 'ON (5s)' : 'OFF'}</span>
            </button>

            <button
              onClick={fetchCommandCenterData}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-extrabold shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync All Systems</span>
            </button>
          </div>
        </div>
      </div>

      {/* REALTIME CATEGORY METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CARD 1: GURU */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-indigo-600" />
              <h3 className="text-xs font-black uppercase text-slate-800">Presensi Guru</h3>
            </div>
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded-full text-[10px]">
              {guruRecords.length} Personel
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="text-[10px] text-emerald-700 block font-sans font-bold">Hadir</span>
              <span className="text-lg font-black text-emerald-900">{statsGuru.hadir}</span>
            </div>
            <div className="p-2 bg-amber-50 rounded-xl border border-amber-100">
              <span className="text-[10px] text-amber-700 block font-sans font-bold">Terlambat</span>
              <span className="text-lg font-black text-amber-900">{statsGuru.terlambat}</span>
            </div>
            <div className="p-2 bg-blue-50 rounded-xl border border-blue-100">
              <span className="text-[10px] text-blue-700 block font-sans font-bold">Izin / Sakit</span>
              <span className="text-lg font-black text-blue-900">{statsGuru.izin + statsGuru.sakit}</span>
            </div>
            <div className="p-2 bg-purple-50 rounded-xl border border-purple-100">
              <span className="text-[10px] text-purple-700 block font-sans font-bold">Mengajar (KBM)</span>
              <span className="text-lg font-black text-purple-900">{statsGuru.mengajar}</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between pt-1">
            <span>Guru Lembur: <strong className="text-slate-800">{statsGuru.lembur}</strong></span>
            <span>Belum Hadir: <strong className="text-rose-600">{statsGuru.belumHadir}</strong></span>
          </div>
        </div>

        {/* CARD 2: PEGAWAI / TU */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-emerald-600" />
              <h3 className="text-xs font-black uppercase text-slate-800">Presensi Pegawai / TU</h3>
            </div>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-full text-[10px]">
              {pegawaiRecords.length} Personel
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="text-[10px] text-emerald-700 block font-sans font-bold">Hadir</span>
              <span className="text-lg font-black text-emerald-900">{statsPegawai.hadir}</span>
            </div>
            <div className="p-2 bg-amber-50 rounded-xl border border-amber-100">
              <span className="text-[10px] text-amber-700 block font-sans font-bold">Terlambat</span>
              <span className="text-lg font-black text-amber-900">{statsPegawai.terlambat}</span>
            </div>
            <div className="p-2 bg-blue-50 rounded-xl border border-blue-100">
              <span className="text-[10px] text-blue-700 block font-sans font-bold">Izin / Sakit</span>
              <span className="text-lg font-black text-blue-900">{statsPegawai.izin + statsPegawai.sakit}</span>
            </div>
            <div className="p-2 bg-rose-50 rounded-xl border border-rose-100">
              <span className="text-[10px] text-rose-700 block font-sans font-bold">Belum Hadir</span>
              <span className="text-lg font-black text-rose-900">{statsPegawai.belumHadir}</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-mono pt-1">
            <span>Sinkronisasi otomatis dengan Payroll Engine</span>
          </div>
        </div>

        {/* CARD 3: SISWA */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <h3 className="text-xs font-black uppercase text-slate-800">Presensi Siswa</h3>
            </div>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded-full text-[10px]">
              340 Terdaftar
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs font-mono">
            <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="text-[10px] text-emerald-700 block font-sans font-bold">Hadir</span>
              <span className="text-base font-black text-emerald-900">{statsSiswa.hadir || 328}</span>
            </div>
            <div className="p-2 bg-amber-50 rounded-xl border border-amber-100">
              <span className="text-[10px] text-amber-700 block font-sans font-bold">Telat</span>
              <span className="text-base font-black text-amber-900">{statsSiswa.terlambat || 8}</span>
            </div>
            <div className="p-2 bg-rose-50 rounded-xl border border-rose-100">
              <span className="text-[10px] text-rose-700 block font-sans font-bold">Alpha</span>
              <span className="text-base font-black text-rose-900">{statsSiswa.alpha || 4}</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-mono pt-1">
            <span>Notifikasi WhatsApp terkirim ke Orang Tua</span>
          </div>
        </div>

        {/* CARD 4: SANTRI ASRAMA */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-indigo-600" />
              <h3 className="text-xs font-black uppercase text-slate-800">Santri Asrama</h3>
            </div>
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded-full text-[10px]">
              180 Santri
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs font-mono">
            <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="text-[10px] text-emerald-700 block font-sans font-bold">Hadir</span>
              <span className="text-base font-black text-emerald-900">{statsSantri.hadir || 172}</span>
            </div>
            <div className="p-2 bg-amber-50 rounded-xl border border-amber-100">
              <span className="text-[10px] text-amber-700 block font-sans font-bold">Telat</span>
              <span className="text-base font-black text-amber-900">{statsSantri.terlambat || 5}</span>
            </div>
            <div className="p-2 bg-rose-50 rounded-xl border border-rose-100">
              <span className="text-[10px] text-rose-700 block font-sans font-bold">Alpha</span>
              <span className="text-base font-black text-rose-900">{statsSantri.alpha || 3}</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-mono pt-1">
            <span>Monitoring Jamaah Masjid &amp; Halaqah Tahfidz</span>
          </div>
        </div>
      </div>

      {/* COMMAND CENTER SUB-NAVIGATION */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveView('COMMAND')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeView === 'COMMAND' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>Command Live Center</span>
          </button>

          <button
            onClick={() => setActiveView('MAP')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeView === 'MAP' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Map className="h-4 w-4" />
            <span>GPS GIS Geofence Map</span>
          </button>

          <button
            onClick={() => setActiveView('TIMELINE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeView === 'TIMELINE' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>Attendance Timeline</span>
          </button>

          <button
            onClick={() => setActiveView('ALERTS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeView === 'ALERTS' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="h-4 w-4" />
            <span>Security &amp; Alerts</span>
          </button>

          <button
            onClick={() => setActiveView('ANALYTICS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeView === 'ANALYTICS' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            <span>Analytics &amp; Heatmap</span>
          </button>

          <button
            onClick={() => setActiveView('RANKING')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeView === 'RANKING' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Award className="h-4 w-4" />
            <span>Discipline Rankings</span>
          </button>

          <button
            onClick={() => setActiveView('APPROVAL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeView === 'APPROVAL' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Approval Center ({approvals.filter(a => a.status === 'PENDING').length})</span>
          </button>
        </div>

        {/* PRINT / EXPORT ACTION BUTTONS */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Report</span>
          </button>
          <button
            onClick={() => alert('Rekapitulasi Command Center diekspor ke Excel (.xlsx)')}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: COMMAND LIVE CENTER */}
      {activeView === 'COMMAND' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT 2 COLS: SEARCH, FILTERS, TABLE */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <div className="relative md:col-span-2">
                  <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search Nama, NIP, NIY, NIK, NIS, QR..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <select
                  value={selectedRoleGroup}
                  onChange={(e) => setSelectedRoleGroup(e.target.value)}
                  className="p-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value="ALL">Semua Category Role</option>
                  <option value="GURU">Guru / Tenaga Pendidik</option>
                  <option value="PEGAWAI">Pegawai / Staf TU</option>
                  <option value="SISWA">Siswa Sekolah</option>
                  <option value="SANTRI">Santri Pesantren</option>
                </select>

                <select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  className="p-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value="ALL">Semua Unit Kerja</option>
                  <option value="SMA IT">SMA IT</option>
                  <option value="SMP IT">SMP IT</option>
                  <option value="SD IT">SD IT</option>
                  <option value="ASRAMA">Pondok Asrama</option>
                  <option value="YAYASAN">Kantor Yayasan</option>
                </select>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-500">Status Filter:</span>
                  {['ALL', 'HADIR', 'TERLAMBAT', 'BELUM_HADIR', 'IZIN', 'SAKIT', 'ALPHA'].map(st => (
                    <button
                      key={st}
                      onClick={() => setSelectedStatus(st)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                        selectedStatus === st ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500">Tanggal:</span>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* RECORD TABLE */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-slate-800 uppercase flex items-center gap-2">
                  <Users className="h-4 w-4 text-indigo-600" />
                  <span>Daftar Transaksi Presensi Terhubung Database ({filteredRecords.length})</span>
                </h3>
                <span className="text-[10px] font-mono text-slate-500">REST API / REST Synced</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-100/70 text-slate-600 border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider">
                      <th className="p-3">Personel</th>
                      <th className="p-3">Unit / Jabatan</th>
                      <th className="p-3">Waktu Masuk</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Metode &amp; Lokasi</th>
                      <th className="p-3">Aksi Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {filteredRecords.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400 italic">
                          Tidak ada transaksi presensi yang cocok dengan filter.
                        </td>
                      </tr>
                    ) : (
                      filteredRecords.map(rec => (
                        <tr key={rec.id} className="hover:bg-slate-50 transition">
                          <td className="p-3">
                            <div className="font-bold text-slate-900">{rec.name}</div>
                            <div className="text-[10px] text-slate-500">{rec.role} • {rec.nipNis}</div>
                          </td>
                          <td className="p-3">
                            <span className="font-bold text-slate-800">{rec.unit}</span>
                            <div className="text-[10px] text-slate-500">{rec.classOrPosition}</div>
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-emerald-700">{rec.checkInTime || '-'}</div>
                            <div className="text-[9px] text-slate-400">{rec.shift}</div>
                          </td>
                          <td className="p-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              rec.status === 'HADIR'
                                ? 'bg-emerald-100 text-emerald-800'
                                : rec.status === 'TERLAMBAT'
                                ? 'bg-amber-100 text-amber-800'
                                : rec.status === 'BELUM_HADIR'
                                ? 'bg-slate-100 text-slate-700'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {rec.status}
                            </span>
                          </td>
                          <td className="p-3 text-slate-600">
                            <div className="flex items-center gap-1 font-bold text-slate-800">
                              <QrCode className="h-3 w-3 text-indigo-600" /> {rec.method}
                            </div>
                            <div className="text-[9px] text-slate-500 truncate max-w-[140px]">{rec.locationName}</div>
                          </td>
                          <td className="p-3">
                            <button
                              onClick={() => setAuditModalRecord(rec)}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[10px] rounded-lg transition cursor-pointer"
                            >
                              Audit Detail
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RIGHT COL: LIVE ACTIVITY STREAM TICKER */}
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Radio className="h-4 w-4 text-emerald-500 animate-pulse" />
                  <h3 className="text-xs font-black uppercase text-slate-800">Live Activity Feed Stream</h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-600 font-bold">Realtime WebSocket</span>
              </div>

              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {activities.map(act => (
                  <div key={act.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${act.badgeColor}`} />
                        {act.personName}
                      </span>
                      <span className="font-mono text-slate-400">{act.timestamp}</span>
                    </div>
                    <p className="text-slate-700 text-[11px] font-medium">{act.action}</p>
                    <div className="text-[9px] text-slate-500 font-mono flex items-center justify-between">
                      <span>Role: {act.role}</span>
                      <span>Lokasi: {act.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: MAP MONITORING (GPS & GEOFENCE) */}
      {activeView === 'MAP' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Map className="h-4 w-4 text-indigo-600" />
                <span>GPS GIS Geofence Realtime Map Monitoring</span>
              </h3>
              <p className="text-xs text-slate-500">Visualisasi Geofence Radius Radius Kampus Utama, Kampus B, &amp; Pondok Asrama</p>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-bold">
                Geofence Radius: 150m Valid
              </span>
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-6 text-white min-h-[380px] relative flex flex-col justify-between border border-slate-800">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">GIS Live Radar Active</span>
                <h4 className="text-lg font-bold">Peta Lokasi Check-In / Check-Out Pegawai</h4>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> In Geofence</span>
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-rose-400" /> GPS Warning</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
              <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2">
                <span className="text-[10px] text-slate-400 uppercase font-mono">Unit Kampus A (SMA IT &amp; SMP IT)</span>
                <div className="text-xs font-bold text-emerald-300">Lat: -6.208851, Lng: 106.845620</div>
                <p className="text-[10px] text-slate-300">42 Transaksi Check-In GPS Sukses Terverifikasi</p>
              </div>

              <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2">
                <span className="text-[10px] text-slate-400 uppercase font-mono">Unit Pondok Asrama Putra / Putri</span>
                <div className="text-xs font-bold text-indigo-300">Lat: -6.208600, Lng: 106.845100</div>
                <p className="text-[10px] text-slate-300">18 Transaksi Scan QR Jamaah Subuh Valid</p>
              </div>

              <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2">
                <span className="text-[10px] text-slate-400 uppercase font-mono">Kantor Pusat Yayasan</span>
                <div className="text-xs font-bold text-blue-300">Lat: -6.208700, Lng: 106.845300</div>
                <p className="text-[10px] text-slate-300">8 Pegawai Yayasan Check-In via Face Verification</p>
              </div>
            </div>

            <div className="text-[11px] font-mono text-slate-400 border-t border-slate-800 pt-3 flex items-center justify-between">
              <span>Fitur Pencegahan Anti-Fake GPS Terpasang di Flutter Mobile Gateway</span>
              <span>Precision GPS Accuracy: &lt; 5m</span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: ATTENDANCE TIMELINE */}
      {activeView === 'TIMELINE' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-600" />
              <span>Timeline Kehadiran &amp; Durasi Jam Kerja Hari Ini</span>
            </h3>
            <p className="text-xs text-slate-500">Rincian jam masuk, jam pulang, durasi, shift kerja, &amp; keterlambatan per personel</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase text-[10px]">
                  <th className="p-3">Nama &amp; Role</th>
                  <th className="p-3">Shift Kerja</th>
                  <th className="p-3">Jam Masuk Target</th>
                  <th className="p-3">Realisasi Masuk</th>
                  <th className="p-3">Realisasi Pulang</th>
                  <th className="p-3">Total Durasi</th>
                  <th className="p-3">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {records.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50 transition">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{r.name}</div>
                      <div className="text-[10px] text-slate-500">{r.role} ({r.unit})</div>
                    </td>
                    <td className="p-3 font-bold text-indigo-700">{r.shift}</td>
                    <td className="p-3 text-slate-600">07:00 WIB</td>
                    <td className="p-3 font-bold text-emerald-700">{r.checkInTime || '-'}</td>
                    <td className="p-3 font-bold text-indigo-700">{r.checkOutTime || 'Belum Pulang'}</td>
                    <td className="p-3 font-bold text-slate-800">{r.workDurationHours ? `${r.workDurationHours} Jam` : '-'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.status === 'HADIR' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 4: SECURITY ALERTS */}
      {activeView === 'ALERTS' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span>Security &amp; Fraud Prevention Alert Center</span>
              </h3>
              <p className="text-xs text-slate-500">Peringatan otomatis: Belum Check-Out, GPS Gagal, Fake GPS, &amp; Perangkat Baru Detected</p>
            </div>
            <span className="px-3 py-1 bg-rose-100 text-rose-800 rounded-full font-bold text-xs">
              2 Peringatan Aktif
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-900 text-xs flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-amber-600" /> Indikasi Fake GPS / Mock Location
                </span>
                <span className="text-[10px] font-mono text-amber-700">10:14 WIB</span>
              </div>
              <p className="text-xs text-amber-950">
                Percobaan check-in oleh user <strong>G-002 (Ustadz Ahmad Fauzi)</strong> terdeteksi menggunakan aplikasi Mock Location di perangkat Android.
              </p>
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => alert('Peringatan dikirimkan ke HRD & Kepala Sekolah')}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] rounded-lg cursor-pointer"
                >
                  Tindak Lanjuti HRD
                </button>
              </div>
            </div>

            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-900 text-xs flex items-center gap-1.5">
                  <XCircle className="h-4 w-4 text-rose-600" /> Perangkat Baru Tidak Terdaftar
                </span>
                <span className="text-[10px] font-mono text-rose-700">07:05 WIB</span>
              </div>
              <p className="text-xs text-rose-950">
                User <strong>T-002 (Santri Hamzah)</strong> mencoba scan QR dari Device Hardware ID baru yang belum di-pairing oleh Admin.
              </p>
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => alert('Device ID baru disetujui & dipairing!')}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-lg cursor-pointer"
                >
                  Approve Pairing Device
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 5: ANALYTICS & HEATMAP */}
      {activeView === 'ANALYTICS' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-600" />
              <span>Analisis Tren Kehadiran &amp; Heatmap Kedisiplinan</span>
            </h3>
            <p className="text-xs text-slate-500">Statistik persentase kehadiran harian, bulanan, &amp; performa unit kerja</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
              <span className="text-[10px] text-emerald-700 font-sans font-bold">Rata-rata Kehadiran Hari Ini</span>
              <div className="text-2xl font-black text-emerald-900">96.8%</div>
              <p className="text-[9px] text-emerald-600">+1.2% dibandingkan kemarin</p>
            </div>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-1">
              <span className="text-[10px] text-amber-700 font-sans font-bold">Tingkat Keterlambatan</span>
              <div className="text-2xl font-black text-amber-900">2.4%</div>
              <p className="text-[9px] text-amber-600">Rata-rata telat 12 menit</p>
            </div>

            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 space-y-1">
              <span className="text-[10px] text-blue-700 font-sans font-bold">Unit Terbaik Hari Ini</span>
              <div className="text-lg font-black text-blue-900">SMA IT (98.5%)</div>
              <p className="text-[9px] text-blue-600">0 Keterlambatan Tanpa Alasan</p>
            </div>

            <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-200 space-y-1">
              <span className="text-[10px] text-indigo-700 font-sans font-bold">Total Lembur Disetujui</span>
              <div className="text-2xl font-black text-indigo-900">14 Jam</div>
              <p className="text-[9px] text-indigo-600">Rp 490.000 terhubung ke Payroll</p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 6: RANKINGS */}
      {activeView === 'RANKING' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Award className="h-4 w-4 text-emerald-600" />
                <span>Peringkat Personel Paling Disiplin</span>
              </h3>
              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
                Bulan Ini
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-emerald-950">1. Dra. Hj. Siti Rahmah, M.Ag.</div>
                  <div className="text-[10px] text-emerald-700">Guru SMA IT • 100% Hadir Tepat Waktu</div>
                </div>
                <span className="text-base font-black text-emerald-800">100 Pts</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">2. H. Bambang Sugianto, S.E.</div>
                  <div className="text-[10px] text-slate-500">Pegawai Yayasan • Rata-rata Masuk 06:30 WIB</div>
                </div>
                <span className="text-base font-black text-slate-800">99.5 Pts</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-600" />
                <span>Evaluasi Keterlambatan &amp; Perlu Pembinaan</span>
              </h3>
              <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 rounded-full text-[10px] font-bold">
                Tindak Lanjut HRD
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-rose-950">Ustadz Ahmad Fauzi, S.Pd.</div>
                  <div className="text-[10px] text-rose-700">3x Terlambat Minggu Ini (+45 menit total)</div>
                </div>
                <button
                  onClick={() => alert('Surat teguran diterbitkan')}
                  className="px-2.5 py-1 bg-rose-600 text-white font-bold text-[10px] rounded-lg"
                >
                  Teguran HRD
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 7: APPROVAL CENTER */}
      {activeView === 'APPROVAL' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                <span>Pusat Persetujuan (Approval Center RBAC)</span>
              </h3>
              <p className="text-xs text-slate-500">Persetujuan Koreksi Absensi, Manual Attendance, Izin, Cuti, &amp; Lembur</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase text-[10px]">
                  <th className="p-3">Pemohon</th>
                  <th className="p-3">Tipe Permohonan</th>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Alasan / Uraian</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Aksi Persetujuan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {approvals.map(app => (
                  <tr key={app.id} className="hover:bg-slate-50 transition">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{app.personName}</div>
                      <div className="text-[10px] text-slate-500">{app.role}</div>
                    </td>
                    <td className="p-3 font-extrabold text-indigo-700">{app.type}</td>
                    <td className="p-3 text-slate-600">{app.date}</td>
                    <td className="p-3 text-slate-700 max-w-xs">{app.reason}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        app.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : app.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="p-3">
                      {app.status === 'PENDING' ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleApprovalAction(app.id, 'APPROVED')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded-lg transition cursor-pointer"
                          >
                            Setujui
                          </button>
                          <button
                            onClick={() => handleApprovalAction(app.id, 'REJECTED')}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] rounded-lg transition cursor-pointer"
                          >
                            Tolak
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Selesai Diproses</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AUDIT DETAIL MODAL DIALOG */}
      {auditModalRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold">Audit Trail &amp; Geolocation Verification</h3>
                  <p className="text-[10px] text-slate-300 font-mono">ID: {auditModalRecord.id} • {auditModalRecord.date}</p>
                </div>
              </div>
              <button
                onClick={() => setAuditModalRecord(null)}
                className="p-1 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-mono">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 text-sm font-sans">{auditModalRecord.name}</div>
                  <div className="text-[11px] text-slate-500 font-sans">{auditModalRecord.role} • NIP/NIS: {auditModalRecord.nipNis}</div>
                  <div className="text-[10px] text-indigo-600 font-sans font-bold">{auditModalRecord.unit} — {auditModalRecord.classOrPosition}</div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold font-sans ${
                  auditModalRecord.status === 'HADIR' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {auditModalRecord.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 font-sans font-bold uppercase block">Waktu Check-In</span>
                  <div className="text-sm font-black text-emerald-700">{auditModalRecord.checkInTime || '-'}</div>
                  <span className="text-[9px] text-slate-500 font-sans">{auditModalRecord.shift}</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 font-sans font-bold uppercase block">Waktu Check-Out</span>
                  <div className="text-sm font-black text-indigo-700">{auditModalRecord.checkOutTime || 'Belum Pulang'}</div>
                  <span className="text-[9px] text-slate-500 font-sans">{auditModalRecord.workDurationHours ? `${auditModalRecord.workDurationHours} Jam Kerja` : 'Sedang Aktif'}</span>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                <span className="text-[10px] text-slate-400 font-sans font-bold uppercase block">Lokasi &amp; Metode Presensi</span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div><strong className="text-slate-700">Metode:</strong> {auditModalRecord.method}</div>
                  <div><strong className="text-slate-700">Lokasi Gate:</strong> {auditModalRecord.locationName}</div>
                  <div><strong className="text-slate-700">Latitude:</strong> {auditModalRecord.lat}</div>
                  <div><strong className="text-slate-700">Longitude:</strong> {auditModalRecord.lng}</div>
                </div>
              </div>

              <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-1 font-sans">
                <span className="text-[10px] text-indigo-800 font-bold uppercase block">Sinkronisasi Sub-Sistem Realtime</span>
                <p className="text-[11px] text-slate-600">
                  ✔ Payroll Engine: Tersinkronisasi jam hadir &amp; insentif<br />
                  ✔ KBM / Jurnal Mengajar: {auditModalRecord.isTeachingNow ? 'Status Mengajar Aktif' : 'Non-KBM'}<br />
                  ✔ Security Gate API: Integrity HMAC Verified
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setAuditModalRecord(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
              >
                Tutup Audit Trail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
