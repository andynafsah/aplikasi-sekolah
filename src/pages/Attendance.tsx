/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { GoogleMapsAttendanceView } from '../components/attendance/GoogleMapsAttendanceView';
import { useAuth } from '../contexts/AuthContext';
import { 
  Clock, 
  MapPin, 
  QrCode, 
  Barcode, 
  ShieldAlert, 
  CheckCircle2, 
  Users, 
  Shield, 
  Settings, 
  CheckSquare, 
  PlusCircle, 
  Search, 
  Trash2, 
  Edit3, 
  DollarSign, 
  UserCheck, 
  Smartphone, 
  Terminal, 
  HelpCircle, 
  Code, 
  Play, 
  RefreshCw, 
  FileText, 
  Download, 
  Printer, 
  Save,
  Map,
  BadgeAlert,
  Activity,
  Layers,
  CalendarDays,
  Camera,
  Scissors,
  Check,
  UserX,
  Plus
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  AreaChart,
  Area,
  PieChart, 
  Pie 
} from 'recharts';
import SmartAttendanceCore from '../components/attendance/SmartAttendanceCore';
import EnterpriseQrSecurityEngine from '../components/EnterpriseQrSecurityEngine';
import EnterpriseEmployeeAttendanceWorkspace from '../components/EnterpriseEmployeeAttendanceWorkspace';
import EnterpriseAttendanceCommandCenter from '../components/EnterpriseAttendanceCommandCenter';
import EnterpriseAttendanceSettings from '../components/EnterpriseAttendanceSettings';
import { AttendanceScheduler } from '../components/AttendanceScheduler';

// ============================================================================
// TYPES & INTERFACES FOR SPRINT 8
// ============================================================================
type AttendanceTab = 
  | 'COMMAND_CENTER'
  | 'DASHBOARD' 
  | 'LEAVE_REQUEST'
  | 'MONITORING' 
  | 'EMPLOYEE_WORKSPACE'
  | 'GPS' 
  | 'QR_BARCODE' 
  | 'CARD_CENTER' 
  | 'RULES' 
  | 'SCHEDULER'
  | 'REPLACEMENT' 
  | 'PAYROLL' 
  | 'DEVELOPER';

interface AttendanceRecord {
  id: string;
  personId: string;
  name: string;
  role: 'SISWA' | 'SANTRI' | 'GURU' | 'PEGAWAI';
  date: string;
  time: string;
  type: 'MASUK' | 'PULANG' | 'SHALAT' | 'TAHFIDZ' | 'ASRAMA' | 'LEMBUR';
  status: 'HADIR' | 'TERLAMBAT' | 'IZIN' | 'SAKIT' | 'ALFA' | 'DISPENSASI';
  method: 'MANUAL' | 'QR' | 'BARCODE' | 'GPS' | 'SMART_CARD' | 'RFID';
  details: string;
  lat?: number;
  lng?: number;
}

interface ReplacementTeacher {
  id: string;
  originalTeacherId: string;
  originalTeacherName: string;
  substituteTeacherId: string;
  substituteTeacherName: string;
  courseName: string;
  date: string;
  timeSlot: string;
  honorCalculated: number;
  originalTeacherDeduction: number;
  status: 'PENDING' | 'APPROVED' | 'PAID';
}

interface LeaveRequest {
  id: string;
  teacherId: string;
  teacherName: string;
  type: 'SAKIT' | 'IZIN' | 'DINAS_LUAR' | 'CUTI';
  startDate: string;
  endDate: string;
  reason: string;
  attachmentName?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  createdAt: string;
}

export default function Attendance() {
  const { user, tenant, previewRole } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<AttendanceTab>('COMMAND_CENTER');
  const isPondok = tenant?.type === 'PONDOK' || tenant?.type === 'KEDUA';

  // Role Normalization for Smart Attendance UI
  const rawRole = previewRole || user?.role || '';
  const normalizeRole = (r: string): string => {
    const raw = r?.toUpperCase()?.replace(/\s+/g, '_') || '';
    if (raw === 'SUPERADMIN' || raw === 'ADMIN') return 'SUPER_ADMIN';
    if (raw === 'OWNER') return 'OWNER_YAYASAN';
    if (raw === 'BENDAHARA' || raw === 'BENDAHARA_KEUANGAN') return 'BENDAHARA_SEKOLAH';
    if (raw === 'OPERATOR' || raw === 'OPS') return 'OPERATOR_SEKOLAH';
    if (raw === 'PRINCIPAL') return 'KEPALA_SEKOLAH';
    if (raw === 'TEACHER' || raw === 'USTADZ') return 'GURU';
    if (raw === 'STUDENT' || raw === 'SISWA') return 'SANTRI';
    if (raw === 'PARENT' || raw === 'ORANG_TUA') return 'WALI_SANTRI';
    return raw;
  };

  const activeRole = normalizeRole(rawRole);
  const isTeacher = activeRole === 'GURU' || activeRole === 'WALI_KELAS';
  const isTreasurer = activeRole === 'BENDAHARA_SEKOLAH' || activeRole === 'BENDAHARA_YAYASAN';
  const isOperator = activeRole === 'OPERATOR_SEKOLAH' || activeRole === 'ADMIN_TU';
  const isStudentOrParent = activeRole === 'SANTRI' || activeRole === 'WALI_SANTRI';
  const isEmployee = activeRole === 'PEGAWAI' || activeRole === 'KARYAWAN' || activeRole === 'STAFF' || activeRole === 'EMPLOYEE' || activeRole === 'KEPALA_SEKOLAH';
  const isSuperAdmin = (activeRole === 'SUPER_ADMIN' || !activeRole) && !isTeacher && !isTreasurer && !isOperator && !isStudentOrParent && !isEmployee;

  const allSubTabs: { id: AttendanceTab, label: string }[] = [
    { id: 'COMMAND_CENTER', label: 'Smart Attendance Core' },
    { id: 'DASHBOARD', label: isTeacher ? 'Riwayat Kehadiran' : 'Dashboard' },
    { id: 'EMPLOYEE_WORKSPACE', label: 'Rekam Presensi' },
    { id: 'LEAVE_REQUEST', label: 'Izin & Cuti' },
    { id: 'MONITORING', label: 'Monitor Live' },
    { id: 'SCHEDULER', label: 'Kalender & Jadwal Kerja' },
    { id: 'RULES', label: 'Pengaturan' }
  ];

  const visibleSubTabs = allSubTabs.filter(tab => {
    if (isSuperAdmin) return true;
    if (isTeacher) {
      return ['COMMAND_CENTER', 'DASHBOARD', 'EMPLOYEE_WORKSPACE', 'LEAVE_REQUEST'].includes(tab.id);
    }
    if (isTreasurer) {
      return ['COMMAND_CENTER', 'DASHBOARD', 'LEAVE_REQUEST', 'MONITORING'].includes(tab.id);
    }
    if (isOperator) {
      return ['COMMAND_CENTER', 'DASHBOARD', 'MONITORING', 'LEAVE_REQUEST', 'EMPLOYEE_WORKSPACE', 'SCHEDULER'].includes(tab.id);
    }
    if (isStudentOrParent) {
      return ['COMMAND_CENTER', 'DASHBOARD', 'LEAVE_REQUEST', 'EMPLOYEE_WORKSPACE'].includes(tab.id);
    }
    if (isEmployee) {
      return ['COMMAND_CENTER', 'DASHBOARD', 'LEAVE_REQUEST', 'EMPLOYEE_WORKSPACE'].includes(tab.id);
    }
    return ['COMMAND_CENTER', 'DASHBOARD'].includes(tab.id);
  });

  useEffect(() => {
    const isAllowed = visibleSubTabs.some(t => t.id === activeSubTab);
    if (!isAllowed) {
      setActiveSubTab('DASHBOARD');
    }
  }, [activeRole, activeSubTab]);

  // ============================================================================
  // INITIAL IN-MEMORY SPRINT 8 STATE ENGINES
  // ============================================================================
  
  // 1. People registry (DAPODIK & EMIS compatible references)
  const [people] = useState([
    { id: 'std-1', name: 'Muhammad Ahmad Baihaqi', role: 'SANTRI', nis: 'NIS20260001', phone: '081234567890', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150' },
    { id: 'std-2', name: 'Nabila Shafa Az-Zahra', role: 'SANTRI', nis: 'NIS20260002', phone: '081298765432', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150' },
    { id: 'std-3', name: 'Farhan Ramadhan', role: 'SISWA', nis: 'NIS20260003', phone: '081311122233', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150' },
    { id: 'tch-1', name: 'Ustadz Budi Raharjo, M.Pd.', role: 'GURU', nip: '198504122010011002', phone: '081544455566', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150' },
    { id: 'tch-2', name: 'Ustazah Laila Fitri, S.Pd.I.', role: 'GURU', nip: '198812122015022001', phone: '081277788899', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150' },
    { id: 'emp-1', name: 'Slamet Hariadi', role: 'PEGAWAI', nip: 'EMP20260012', phone: '085612345678', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150' }
  ]);

  // 2. Attendance Records (Standard, Multi-Status, Multi-Method)
  const [records, setRecords] = useState<AttendanceRecord[]>([
    { id: 'rec-1', personId: 'std-1', name: 'Muhammad Ahmad Baihaqi', role: 'SANTRI', date: '2026-07-06', time: '07:02', type: 'MASUK', status: 'HADIR', method: 'SMART_CARD', details: 'Gate Asrama Utama' },
    { id: 'rec-2', personId: 'std-2', name: 'Nabila Shafa Az-Zahra', role: 'SANTRI', date: '2026-07-06', time: '07:12', type: 'MASUK', status: 'TERLAMBAT', method: 'QR', details: 'Scan QR Lobby' },
    { id: 'rec-3', personId: 'tch-1', name: 'Ustadz Budi Raharjo, M.Pd.', role: 'GURU', date: '2026-07-06', time: '06:55', type: 'MASUK', status: 'HADIR', method: 'GPS', details: 'Presensi Radius Sekolah (42m)', lat: -6.20885, lng: 106.84562 },
    { id: 'rec-4', personId: 'emp-1', name: 'Slamet Hariadi', role: 'PEGAWAI', date: '2026-07-06', time: '07:45', type: 'MASUK', status: 'TERLAMBAT', method: 'BARCODE', details: 'Barcode Absen Pos Security' },
    { id: 'rec-5', personId: 'std-3', name: 'Farhan Ramadhan', role: 'SISWA', date: '2026-07-06', time: '08:15', type: 'MASUK', status: 'ALFA', method: 'MANUAL', details: 'Sistem Auto-Alfa Absen harian' },
    { id: 'rec-6', personId: 'tch-2', name: 'Ustazah Laila Fitri, S.Pd.I.', role: 'GURU', date: '2026-07-06', time: '11:30', type: 'TAHFIDZ', status: 'HADIR', method: 'MANUAL', details: 'Halaqah Tahfidz Sore' },
    { id: 'rec-7', personId: 'std-1', name: 'Muhammad Ahmad Baihaqi', role: 'SANTRI', date: '2026-07-06', time: '18:05', type: 'SHALAT', status: 'HADIR', method: 'BARCODE', details: 'Gerbang Masjid Al-Akbar' },
  ]);

  // 3. Leave Applications Engine
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([
    {
      id: 'lvr-1',
      teacherId: 'tch-1',
      teacherName: 'Ustadz Budi Raharjo, M.Pd.',
      type: 'DINAS_LUAR',
      startDate: '2026-07-10',
      endDate: '2026-07-12',
      reason: 'Mendampingi Kafilah Lomba Musabaqah Tilawatil Qur\'an (MTQ) Tingkat Provinsi',
      attachmentName: 'Surat_Tugas_MTQ_2026.pdf',
      status: 'APPROVED',
      approvedBy: 'K.H. Dr. Husnan Bey Fananie (Kepala Sekolah)',
      createdAt: '2026-07-08'
    },
    {
      id: 'lvr-2',
      teacherId: 'tch-1',
      teacherName: 'Ustadz Budi Raharjo, M.Pd.',
      type: 'SAKIT',
      startDate: '2026-07-20',
      endDate: '2026-07-20',
      reason: 'Demam tinggi dan pemeriksaan kesehatan di Klinik Pratama',
      attachmentName: 'Surat_Keterangan_Dokter.pdf',
      status: 'APPROVED',
      approvedBy: 'Admin TU Sekolah',
      createdAt: '2026-07-20'
    }
  ]);

  const [newLeaveType, setNewLeaveType] = useState<'SAKIT' | 'IZIN' | 'DINAS_LUAR' | 'CUTI'>('IZIN');
  const [newLeaveStart, setNewLeaveStart] = useState<string>('');
  const [newLeaveEnd, setNewLeaveEnd] = useState<string>('');
  const [newLeaveReason, setNewLeaveReason] = useState<string>('');
  const [newLeaveAttachment, setNewLeaveAttachment] = useState<string>('');

  // 4. Replacement Teacher Records
  const [replacements, setReplacements] = useState<ReplacementTeacher[]>([
    { id: 'rep-1', originalTeacherId: 'tch-2', originalTeacherName: 'Ustazah Laila Fitri, S.Pd.I.', substituteTeacherId: 'tch-1', substituteTeacherName: 'Ustadz Budi Raharjo, M.Pd.', courseName: 'Tahsin Wa Tahfidz', date: '2026-07-06', timeSlot: '13:00 - 14:30', honorCalculated: 75000, originalTeacherDeduction: 50000, status: 'APPROVED' }
  ]);

  // 4. GPS Geofencing Settings
  const [gpsSettings, setGpsSettings] = useState({
    latitude: -6.2088,
    longitude: 106.8456,
    radius: 150, // in meters
    operationalStart: '06:00',
    operationalEnd: '17:00'
  });

  // 5. Smart Attendance Rules Engine (Flexible, Custom Cuts)
  const [ruleEngine, setRuleEngine] = useState({
    lateGracePeriod: 10, // minutes
    penaltyUnder30: 15000, // IDR cut for <30 mins late
    penaltyOver30: 30000, // IDR cut for >30 mins late
    penaltyOver1Hour: 50000, // IDR cut for >1 hour late (or marked ALFA)
    incentiveOnTime: 5000, // Bonus for perfect arrival
    replacementHonorPerHour: 50000, // Honor for replacement teacher
  });

  // ============================================================================
  // LOCAL INTERACTIVE SIMULATION STATES
  // ============================================================================
  
  // Monitoring Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'SISWA' | 'SANTRI' | 'GURU' | 'PEGAWAI'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'HADIR' | 'TERLAMBAT' | 'IZIN' | 'SAKIT' | 'ALFA'>('ALL');
  
  // Manual Attendance Logging Form
  const [manualForm, setManualForm] = useState({
    personId: 'std-1',
    type: 'MASUK' as any,
    status: 'HADIR' as any,
    method: 'MANUAL' as any,
    details: 'Dicatat oleh TU Akademik',
    date: '2026-07-06',
    time: '07:00'
  });
  const [isDrafting, setIsDrafting] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('');

  // GPS Emulator Coordinates & Slider
  const [emulatorGps, setEmulatorGps] = useState({
    lat: -6.2090,
    lng: 106.8459,
  });

  // Smart Card Center Builder state
  const [selectedCardPerson, setSelectedCardPerson] = useState('std-1');
  const [cropMode, setCropMode] = useState<'1:1' | '3:4' | 'FULL'>('3:4');
  const [compressQuality, setCompressQuality] = useState(80);
  const [isWatermarked, setIsWatermarked] = useState(true);

  // Dynamic QR Code Simulator Expiry Time
  const [qrToken, setQrToken] = useState('QR_SECURE_AUTH_HASH_2026_01');
  const [qrCountdown, setQrCountdown] = useState(10);

  // Barcode Gate Check-In Emulator state
  const [barcodeInput, setBarcodeInput] = useState('');
  const [gateLog, setGateLog] = useState<string[]>([]);
  const [audioBeep, setAudioBeep] = useState(false);

  // Replacement form state
  const [replacementForm, setReplacementForm] = useState({
    originalTeacherId: 'tch-2',
    substituteTeacherId: 'tch-1',
    courseName: 'Bahasa Arab',
    date: '2026-07-06',
    timeSlot: '10:00 - 11:30'
  });

  // Developer Endpoint Selected
  const [selectedEndpoint, setSelectedEndpoint] = useState('attendanceCheckIn');
  const [apiConsole, setApiConsole] = useState({
    requestUrl: '',
    requestHeaders: '',
    requestBody: '',
    responsePayload: '',
    status: 200
  });

  // Auto Refresh Dynamic QR
  useEffect(() => {
    const timer = setInterval(() => {
      setQrCountdown(prev => {
        if (prev <= 1) {
          // Regenerate crypto-token
          const randomHash = Math.random().toString(36).substring(2, 15).toUpperCase();
          setQrToken(`QR_GATE_SECURE_${randomHash}_EXP_${Date.now() + 10000}`);
          return 10;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Real Backend Data Synchronization Engine
  const [loading, setLoading] = useState(false);

  const safeJsonParse = async (res: Response) => {
    if (!res.ok) return null;
    try {
      const text = await res.text();
      return JSON.parse(text);
    } catch {
      return null;
    }
  };

  const fetchBackendData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Attendances
      const resAtt = await fetch('/api/attendance/getAttendances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant_id: tenant?.id || 'tenant-1' })
      });
      const dataAtt = await safeJsonParse(resAtt);
      if (dataAtt && dataAtt.success && dataAtt.data?.length > 0) {
        setRecords(dataAtt.data.map((r: any) => ({
          id: r.id || '',
          personId: r.personId || '',
          name: r.name || r.personName || 'Siswa / Guru',
          role: r.role || 'SANTRI',
          date: r.date || '',
          time: r.time || '',
          type: r.type || 'MASUK',
          status: r.status || 'HADIR',
          method: r.method || 'MANUAL',
          details: r.details || '',
          lat: r.lat,
          lng: r.lng
        })));
      }

      // 2. Fetch Rules
      const resRules = await fetch('/api/attendance/getRules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant_id: tenant?.id || 'tenant-1' })
      });
      const dataRules = await safeJsonParse(resRules);
      if (dataRules && dataRules.success && dataRules.data) {
        setRuleEngine({
          lateGracePeriod: dataRules.data.lateGracePeriod || 10,
          penaltyUnder30: dataRules.data.rules?.find((r: any) => r.maxRange === 15 || r.maxRange === 30)?.deductionValue || 15000,
          penaltyOver30: dataRules.data.rules?.find((r: any) => r.maxRange === 30 || r.maxRange === 60)?.deductionValue || 30000,
          penaltyOver1Hour: dataRules.data.rules?.find((r: any) => r.maxRange === 9999)?.deductionValue || 50000,
          incentiveOnTime: 5000,
          replacementHonorPerHour: 50000,
        });
      }

      // 3. Fetch Geofences
      const resGeo = await fetch('/api/attendance/getGeofences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant_id: tenant?.id || 'tenant-1' })
      });
      const dataGeo = await safeJsonParse(resGeo);
      if (dataGeo && dataGeo.success && dataGeo.data?.length > 0) {
        const geo = dataGeo.data[0];
        setGpsSettings({
          latitude: geo.latitude || -6.2088,
          longitude: geo.longitude || 106.8456,
          radius: geo.radius || 150,
          operationalStart: '06:00',
          operationalEnd: '17:00'
        });
      }

      // 4. Fetch Replacements
      const resRep = await fetch('/api/attendance/getReplacements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant_id: tenant?.id || 'tenant-1' })
      });
      const dataRep = await safeJsonParse(resRep);
      if (dataRep && dataRep.success && dataRep.data?.length > 0) {
        setReplacements(dataRep.data.map((r: any) => ({
          id: r.id,
          originalTeacherId: r.originalTeacherId,
          originalTeacherName: r.originalTeacherName || 'Ustadz',
          substituteTeacherId: r.substituteTeacherId,
          substituteTeacherName: r.substituteTeacherName || 'Ustadz',
          courseName: r.courseName || 'KBM',
          date: r.date,
          timeSlot: r.timeSlot,
          honorCalculated: r.honorCalculated || 75000,
          originalTeacherDeduction: r.deductionCalculated || 50000,
          status: r.status || 'APPROVED'
        })));
      }
    } catch (err) {
      console.error("Failed to fetch backend data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackendData();
  }, [tenant]);

  // Safe auto save drafts simulator
  useEffect(() => {
    if (isDrafting) {
      setAutoSaveStatus('Menyimpan draf formulir...');
      const timeout = setTimeout(() => {
        setAutoSaveStatus('Draf berhasil disimpan otomatis di LocalStorage.');
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [manualForm, isDrafting]);

  // ============================================================================
  // SIMULATORS & EVENT HANDLERS
  // ============================================================================
  
  // Calculate GPS Distance in meters between geofence center and emulator coordinates
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Earth's radius in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c); // distance in meters
  };

  const currentDistance = calculateDistance(
    gpsSettings.latitude,
    gpsSettings.longitude,
    emulatorGps.lat,
    emulatorGps.lng
  );

  const isWithinRadius = currentDistance <= gpsSettings.radius;

  // Handle GPS check-in click
  const handleGpsCheckIn = async () => {
    const defaultPerson = people.find(p => p.role === 'GURU') || people[0];
    const activePerson = isTeacher ? {
      id: user?.id || defaultPerson.id,
      name: user?.name || defaultPerson.name,
      role: 'GURU'
    } : defaultPerson;

    if (!isWithinRadius) {
      alert(`PRESENSI GAGAL: Lokasi Anda berada ${currentDistance} meter di luar radius geofencing (${gpsSettings.radius} meter)!`);
      return;
    }
    const checkTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    
    const payload = {
      personId: activePerson.id,
      name: activePerson.name,
      role: activePerson.role,
      type: 'MASUK',
      method: 'GPS',
      lat: emulatorGps.lat,
      lng: emulatorGps.lng,
      timestamp: `${new Date().toISOString().split('T')[0]}T${checkTime}:00`,
      details: `Presensi GPS mobile (${currentDistance}m dari pusat geofence)`
    };

    try {
      const res = await fetch('/api/attendance/checkIn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        alert(`PRESENSI BERHASIL: Status Anda dicatat via GPS.`);
        fetchBackendData();
      } else {
        alert(`PRESENSI GAGAL: ${data.message}`);
      }
    } catch (err: any) {
      alert(`Error koneksi: ${err.message}`);
    }
  };

  // Handle saving GPS Geofence configurations to backend
  const handleSaveGpsSettings = async () => {
    try {
      const res = await fetch('/api/attendance/saveGeofence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location_name: 'Pusat Koordinat Sekolah',
          latitude: gpsSettings.latitude,
          longitude: gpsSettings.longitude,
          radius: gpsSettings.radius,
          operationalStart: gpsSettings.operationalStart,
          operationalEnd: gpsSettings.operationalEnd
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('Setelan koordinat geofencing GIS berhasil diperbarui ke database multi-tenant!');
        fetchBackendData();
      } else {
        alert(`Gagal menyimpan setelan GPS: ${data.message}`);
      }
    } catch (err: any) {
      alert(`Error koneksi: ${err.message}`);
    }
  };

  // Handle saving Rule configurations to backend
  const handleSaveRules = async () => {
    const payload = {
      lateGracePeriod: ruleEngine.lateGracePeriod,
      rules: [
        { minRange: 0, maxRange: ruleEngine.lateGracePeriod, deductionType: 'NOMINAL', deductionValue: 0 },
        { minRange: ruleEngine.lateGracePeriod + 1, maxRange: 15, deductionType: 'NOMINAL', deductionValue: ruleEngine.penaltyUnder30 },
        { minRange: 16, maxRange: 30, deductionType: 'NOMINAL', deductionValue: ruleEngine.penaltyUnder30 },
        { minRange: 31, maxRange: 60, deductionType: 'NOMINAL', deductionValue: ruleEngine.penaltyOver30 },
        { minRange: 61, maxRange: 9999, deductionType: 'NOMINAL', deductionValue: ruleEngine.penaltyOver1Hour }
      ]
    };
    try {
      const res = await fetch('/api/attendance/saveRules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        alert('Seluruh aturan pemotongan payroll berhasil disimpan ke engine utama!');
        fetchBackendData();
      } else {
        alert(`Gagal menyimpan aturan: ${data.message}`);
      }
    } catch (err: any) {
      alert(`Error koneksi: ${err.message}`);
    }
  };

  // Barcode gate reader
  const handleBarcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    // Scan can match ID, NIS, or NIP
    const found = people.find(p => p.id === barcodeInput || p.nis === barcodeInput || p.nip === barcodeInput);
    if (!found) {
      alert(`ID/Barcode Card "${barcodeInput}" tidak dikenali oleh Gerbang RFID/Barcode!`);
      setBarcodeInput('');
      return;
    }

    setAudioBeep(true);
    setTimeout(() => setAudioBeep(false), 200);

    const checkTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const payload = {
      personId: found.id,
      name: found.name,
      role: found.role,
      type: 'MASUK',
      method: 'BARCODE',
      barcodeData: barcodeInput,
      timestamp: `${new Date().toISOString().split('T')[0]}T${checkTime}:00`,
      details: 'Check-In RFID/Smart Card Gerbang Utama'
    };

    try {
      const res = await fetch('/api/attendance/checkIn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setGateLog(prev => [`[${checkTime}] SUCCESS: ${found.name} (${found.role}) checked-in via Gate Scanner.`, ...prev]);
        fetchBackendData();
      } else {
        alert(`Gagal: ${data.message}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
    setBarcodeInput('');
  };

  // Submit replacement teacher
  const handleReplacementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const original = people.find(p => p.id === replacementForm.originalTeacherId);
    const sub = people.find(p => p.id === replacementForm.substituteTeacherId);
    if (!original || !sub) return;

    const payload = {
      originalTeacherId: original.id,
      originalTeacherName: original.name,
      substituteTeacherId: sub.id,
      substituteTeacherName: sub.name,
      courseName: replacementForm.courseName,
      date: replacementForm.date,
      timeSlot: replacementForm.timeSlot,
      hourlyHonor: ruleEngine.replacementHonorPerHour,
      status: 'APPROVED'
    };

    try {
      const res = await fetch('/api/attendance/saveReplacement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        alert(`PENUGASAN BERHASIL: ${sub.name} ditugaskan menggantikan ${original.name}.`);
        fetchBackendData();
      } else {
        alert(`Gagal: ${data.message}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  // Add Manual Record
  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const person = people.find(p => p.id === manualForm.personId);
    if (!person) return;

    const payload = {
      personId: person.id,
      name: person.name,
      role: person.role,
      type: manualForm.type,
      status: manualForm.status,
      method: manualForm.method,
      details: manualForm.details,
      timestamp: `${manualForm.date}T${manualForm.time}:00`
    };

    try {
      const res = await fetch('/api/attendance/checkIn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        alert(`SUKSES: Presensi manual untuk ${person.name} berhasil disimpan.`);
        setIsDrafting(false);
        fetchBackendData();
      } else {
        alert(`PRESENSI GAGAL: ${data.message}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  // Filtered records
  const filteredRecords = records.filter(r => {
    if (!r) return false;
    const nameStr = r.name || '';
    const detailsStr = r.details || '';
    const matchesSearch = nameStr.toLowerCase().includes((searchQuery || '').toLowerCase()) || 
                          detailsStr.toLowerCase().includes((searchQuery || '').toLowerCase());
    const matchesRole = roleFilter === 'ALL' || r.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Calculate stats for Dashboard
  const statCounts = {
    hadir: records.filter(r => r.status === 'HADIR').length,
    terlambat: records.filter(r => r.status === 'TERLAMBAT').length,
    izin: records.filter(r => r.status === 'IZIN' || r.status === 'SAKIT').length,
    alfa: records.filter(r => r.status === 'ALFA').length,
    total: records.length
  };

  // Developer Endpoint Details Map
  const endpointDetails: Record<string, { desc: string, req: string, res: string }> = {
    attendanceCheckIn: {
      desc: 'Mencatat presensi masuk siswa/guru via API luar (Mobile/Face Matcher).',
      req: `POST /api/action?action=attendanceCheckIn\nContent-Type: application/json\nAuthorization: Bearer <TOKEN>\n\n{\n  "tenant_id": "tenant-1",\n  "person_id": "std-1",\n  "method": "GPS",\n  "latitude": -6.20885,\n  "longitude": 106.84562\n}`,
      res: `HTTP/1.1 200 OK\nContent-Type: application/json\n\n{\n  "success": true,\n  "message": "Check-In GPS successfully authenticated within radius geofence.",\n  "data": {\n    "record_id": "rec-gps-9912",\n    "status": "HADIR",\n    "timestamp": "2026-07-06T07:05:00Z"\n  }\n}`
    },
    attendanceQR: {
      desc: 'Mendukung scan dynamic QR code dengan validasi kedaluwarsa waktu.',
      req: `POST /api/action?action=attendanceQR\n\n{\n  "tenant_id": "tenant-1",\n  "person_id": "std-2",\n  "qr_hash": "QR_GATE_SECURE_F782_EXP_1773091000",\n  "scanned_at": "2026-07-06T07:12:00Z"\n}`,
      res: `HTTP/1.1 200 OK\n\n{\n  "success": true,\n  "status": "TERLAMBAT",\n  "delay_minutes": 12,\n  "penalty_applied": 15000\n}`
    },
    attendanceLateRule: {
      desc: 'Mengambil atau mengubah peraturan potongan keterlambatan untuk payroll.',
      req: `GET /api/action?action=attendanceLateRule&tenant_id=tenant-1`,
      res: `HTTP/1.1 200 OK\n\n{\n  "success": true,\n  "data": {\n    "lateGracePeriod": 10,\n    "penaltyUnder30": 15000,\n    "penaltyOver30": 30000,\n    "penaltyOver1Hour": 50000\n  }\n}`
    },
    replacementTeacher: {
      desc: 'Mendaftar guru pengganti untuk rombel tertentu dan merekam honor otomatis.',
      req: `POST /api/action?action=replacementTeacher\n\n{\n  "original_teacher_id": "tch-2",\n  "substitute_teacher_id": "tch-1",\n  "course_name": "Bahasa Arab",\n  "date": "2026-07-06"\n}`,
      res: `HTTP/1.1 201 Created\n\n{\n  "success": true,\n  "replacement_id": "rep-9821",\n  "incentive_allocated": 75000\n}`
    }
  };

  const handleRunMockRequest = () => {
    const end = endpointDetails[selectedEndpoint];
    if (!end) return;

    setApiConsole({
      requestUrl: `https://api.studio.google.com/build/${tenant?.id}/api/action?action=${selectedEndpoint}`,
      requestHeaders: `Content-Type: application/json\nAuthorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`,
      requestBody: end.req,
      responsePayload: end.res,
      status: 200
    });
  };

  useEffect(() => {
    handleRunMockRequest();
  }, [selectedEndpoint]);

  // Person select for card generator helper
  const cardPerson = people.find(p => p.id === selectedCardPerson) || people[0];

  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Clock className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h1 id="attendance-engine-title" className="text-xl font-bold text-slate-800 tracking-tight">Smart Attendance &amp; HR Engine</h1>
              <p className="text-xs text-slate-500 font-mono">DAPODIK GTK • GPS Geofencing • Dynamic QR • Payroll Sync • EMIS Ready</p>
            </div>
          </div>
        </div>

        {/* ACTIVE SUB TAB SELECTOR */}
        <div className="flex flex-wrap gap-1 bg-slate-100 p-1.5 rounded-xl">
          {visibleSubTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeSubTab === tab.id 
                  ? 'bg-white text-slate-950 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* METRIC OVERVIEW GRID */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {isTeacher ? [
          { label: 'Presensi Hadir Saya', value: '21 Hari', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', desc: 'Presensi tepat waktu' },
          { label: 'Terlambat Saya', value: '1 Hari', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', desc: 'Masuk > 07:00 WIB' },
          { label: 'Izin / Sakit / Dinas', value: leaveRequests.filter(l => l.status === 'APPROVED').length + ' Kali', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', desc: 'Disetujui Kepsek/TU' },
          { label: 'Jam Mengajar Realisasi', value: '42 Jam', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', desc: 'Target 48 jam/bulan' },
          { label: 'Inal / Guru Pengganti', value: replacements.length + ' Sesi', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', desc: 'Teralokasikan' }
        ].map((m, i) => (
          <div key={i} className={`bg-white p-4 rounded-xl border shadow-sm ${m.border} flex flex-col justify-between`}>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{m.label}</span>
              <h3 className={`text-2xl font-black mt-1 ${m.color}`}>{m.value}</h3>
            </div>
            <p className="text-[10px] text-slate-500 mt-1.5 font-mono">{m.desc}</p>
          </div>
        )) : [
          { label: 'Hadir Tepat Waktu', value: statCounts.hadir, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', desc: 'Presensi aman' },
          { label: 'Terlambat Masuk', value: statCounts.terlambat, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', desc: 'Dikenai denda rules' },
          { label: 'Sakit & Izin', value: statCounts.izin, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', desc: 'Dengan dokumen resmi' },
          { label: 'Mangkir / Alfa', value: statCounts.alfa, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', desc: 'Potongan otomatis max' },
          { label: 'Guru Pengganti', value: replacements.length, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', desc: 'Honor teralokasikan' }
        ].map((m, i) => (
          <div key={i} className={`bg-white p-4 rounded-xl border shadow-sm ${m.border} flex flex-col justify-between`}>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{m.label}</span>
              <h3 className={`text-2xl font-black mt-1 ${m.color}`}>{m.value}</h3>
            </div>
            <p className="text-[10px] text-slate-500 mt-1.5 font-mono">{m.desc}</p>
          </div>
        ))}
      </div>

      {/* MAIN CONTAINER RENDER CHANGER */}
      <div className="space-y-6">
        
        {/* TAB 0: SMART ATTENDANCE CORE (UNIFIED ENGINE) */}
        {activeSubTab === 'COMMAND_CENTER' && (
          <div className="space-y-6">
            <SmartAttendanceCore />
          </div>
        )}

        {/* TAB 1: ATTENDANCE DASHBOARD & RIWAYAT GURU */}
        {activeSubTab === 'DASHBOARD' && (
          isTeacher ? (
            /* SPECIALIZED DASHBOARD & RIWAYAT UNTUK USTADZ / GURU MAPEL */
            <div className="space-y-6">
              {/* Card Presensi Hari Ini */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-semibold mb-3 border border-emerald-500/30">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Presensi Masuk Hari Ini Tervalidasi</span>
                  </div>
                  <h2 className="text-xl font-bold">Ahlan wa Sahlan, {user?.name || 'Ustadz Budi Raharjo, M.Pd.'}</h2>
                  <p className="text-xs text-slate-300 mt-1 font-mono">
                    Jam Masuk: <span className="font-bold text-emerald-400">06:55 WIB</span> • Metode: <span className="font-bold text-cyan-400">GPS Radius Sekolah (42 meter)</span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button 
                    onClick={() => setActiveSubTab('GPS')}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center gap-2 cursor-pointer"
                  >
                    <MapPin className="h-4 w-4" />
                    <span>Presensi GPS Mandiri</span>
                  </button>
                  <button 
                    onClick={() => setActiveSubTab('LEAVE_REQUEST')}
                    className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition flex items-center gap-2 cursor-pointer"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Ajukan Izin / Sakit</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Tabel Riwayat Kehadiran Saya */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Riwayat Presensi Mandiri Saya</h3>
                      <p className="text-xs text-slate-500">Rekap log kehadiran pribadi Anda periode Juli 2026</p>
                    </div>
                    <button 
                      onClick={() => alert('Cetak Rekap Presensi Mandiri Ustadz / Guru berhasil diunduh (PDF).')}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                    >
                      <Download className="h-3.5 w-3.5 text-slate-500" />
                      <span>Cetak Rekap PDF</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider text-[10px]">
                          <th className="p-3">Tanggal</th>
                          <th className="p-3">Jam Masuk</th>
                          <th className="p-3">Jam Pulang</th>
                          <th className="p-3">Metode</th>
                          <th className="p-3">Lokasi / Detail</th>
                          <th className="p-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {records.filter(r => r.role === 'GURU').concat([
                          { id: 'rec-8', personId: 'tch-1', name: 'Ustadz Budi Raharjo, M.Pd.', role: 'GURU', date: '2026-07-05', time: '06:58', type: 'MASUK', status: 'HADIR', method: 'GPS', details: 'Radius Lapangan Utama (38m)' },
                          { id: 'rec-9', personId: 'tch-1', name: 'Ustadz Budi Raharjo, M.Pd.', role: 'GURU', date: '2026-07-04', time: '07:14', type: 'MASUK', status: 'TERLAMBAT', method: 'QR', details: 'Scan QR Gate Lobby' },
                          { id: 'rec-10', personId: 'tch-1', name: 'Ustadz Budi Raharjo, M.Pd.', role: 'GURU', date: '2026-07-03', time: '06:50', type: 'MASUK', status: 'HADIR', method: 'GPS', details: 'Radius Kantor Guru (15m)' },
                        ]).map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50 transition">
                            <td className="p-3 font-semibold text-slate-800 font-mono">{item.date}</td>
                            <td className="p-3 font-bold text-emerald-600 font-mono">{item.time}</td>
                            <td className="p-3 text-slate-500 font-mono">15:30 WIB</td>
                            <td className="p-3 font-mono text-[11px]">
                              <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-bold">{item.method}</span>
                            </td>
                            <td className="p-3 text-slate-600 truncate max-w-[180px]">{item.details}</td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                item.status === 'HADIR' ? 'bg-emerald-100 text-emerald-800' :
                                item.status === 'TERLAMBAT' ? 'bg-amber-100 text-amber-800' :
                                item.status === 'IZIN' || item.status === 'SAKIT' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                              }`}>
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Sidebar Quick Widget: Status Pengajuan Izin Saya */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-800">Status Permohonan Izin Saya</h3>
                      <button 
                        onClick={() => setActiveSubTab('LEAVE_REQUEST')}
                        className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                      >
                        + Buat Izin
                      </button>
                    </div>

                    <div className="space-y-3">
                      {leaveRequests.map((req) => (
                        <div key={req.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-800">{req.type.replace('_', ' ')}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                              req.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                            }`}>
                              {req.status === 'APPROVED' ? 'DISETUJUI' : req.status === 'PENDING' ? 'PENDING' : 'DITOLAK'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 line-clamp-2">{req.reason}</p>
                          <div className="text-[10px] text-slate-400 font-mono flex justify-between pt-1 border-t border-slate-200/60">
                            <span>{req.startDate} s/d {req.endDate}</span>
                            <span>{req.approvedBy ? `Oleh: ${req.approvedBy.split(' ')[0]}` : 'Menunggu TU'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={() => setActiveSubTab('LEAVE_REQUEST')}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    Buka Formulir Pengajuan Izin Lengkap
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* STANDARD SCHOOL-WIDE ATTENDANCE DASHBOARD */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Chart 1: Realtime Attendance over 7 days */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Tingkat Kehadiran Harian (Siswa, Santri, Guru, Pegawai)</h3>
                  <p className="text-xs text-slate-500">Mencatat statistik performa ketepatan waktu dalam 7 hari terakhir</p>
                </div>
                
                <div className="h-64 w-full text-xs font-mono">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { name: 'Senin', Hadir: 92, Terlambat: 5, Izin: 2, Alfa: 1 },
                      { name: 'Selasa', Hadir: 88, Terlambat: 8, Izin: 3, Alfa: 1 },
                      { name: 'Rabu', Hadir: 94, Terlambat: 4, Izin: 1, Alfa: 1 },
                      { name: 'Kamis', Hadir: 91, Terlambat: 6, Izin: 2, Alfa: 1 },
                      { name: 'Jumat', Hadir: 85, Terlambat: 10, Izin: 3, Alfa: 2 },
                      { name: 'Sabtu', Hadir: 96, Terlambat: 2, Izin: 1, Alfa: 1 },
                      { name: 'Hari Ini', Hadir: 90, Terlambat: 7, Izin: 2, Alfa: 1 }
                    ]}>
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip />
                      <Area type="monotone" dataKey="Hadir" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                      <Area type="monotone" dataKey="Terlambat" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.05} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Attendance Completeness Audit */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-800">Audit Kelengkapan Presensi</h3>
                </div>
                <p className="text-xs text-slate-500">Pengecekan integritas rekam log sistem absensi untuk pencegahan manipulasi data.</p>
                
                <div className="space-y-3 font-mono text-[11px]">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-150">
                    <div className="flex justify-between font-bold text-emerald-700">
                      <span>Integritas Log Kripto</span>
                      <span>99.8% SECURE</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Sertifikat log tervalidasi server utama.</p>
                  </div>

                  <div className="p-3 bg-red-50 rounded-lg border border-red-100 flex items-start gap-2">
                    <BadgeAlert className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-red-800">Anomali Terdeteksi (1)</p>
                      <p className="text-[10px] text-red-600 mt-0.5">Siswa std-3 (Farhan Ramadhan) terdeteksi ALFA otomatis tanpa riwayat Check-Out kemarin.</p>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 flex items-start gap-2">
                    <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-amber-800">Pending Approval Dispensasi (2)</p>
                      <p className="text-[10px] text-amber-600 mt-0.5">Surat Izin sakit santri belum dikonfirmasi Wali Asrama / Pengasuh Pondok.</p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => alert('Sistem berhasil mengompilasi log audit & memicu notifikasi pembersihan ke guru kelas.')}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Jalankan Audit Rekonsiliasi Harian
                </button>
              </div>

            </div>
          )
        )}

        {/* TAB SPECIFIC: PENGAJUAN IZIN, SAKIT & CUTI GURU */}
        {activeSubTab === 'LEAVE_REQUEST' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Form Pengajuan Izin */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <FileText className="h-5 w-5 text-indigo-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Form Pengajuan Izin / Cuti Ustadz</h3>
                  <p className="text-xs text-slate-500">Isi formulir untuk mengajukan surat permohonan izin resmi</p>
                </div>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newLeaveStart || !newLeaveEnd || !newLeaveReason) {
                    alert('Mohon lengkapi Tanggal Mulai, Tanggal Selesai, dan Alasan Pengajuan Izin.');
                    return;
                  }
                  const newReq: LeaveRequest = {
                    id: `lvr-${Date.now().toString().slice(-4)}`,
                    teacherId: 'tch-1',
                    teacherName: user?.name || 'Ustadz Budi Raharjo, M.Pd.',
                    type: newLeaveType,
                    startDate: newLeaveStart,
                    endDate: newLeaveEnd,
                    reason: newLeaveReason,
                    attachmentName: newLeaveAttachment || 'Surat_Izin_Resmi.pdf',
                    status: 'PENDING',
                    createdAt: new Date().toISOString().split('T')[0]
                  };
                  setLeaveRequests(prev => [newReq, ...prev]);
                  setNewLeaveStart('');
                  setNewLeaveEnd('');
                  setNewLeaveReason('');
                  setNewLeaveAttachment('');
                  alert('Permohonan izin berhasil dikirim ke Kepala Sekolah & Admin TU!');
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Permohonan Izin</label>
                  <select
                    value={newLeaveType}
                    onChange={(e) => setNewLeaveType(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500"
                  >
                    <option value="IZIN">Izin Pribadi / Keperluan Keluarga</option>
                    <option value="SAKIT">Sakit (Keterangan Dokter)</option>
                    <option value="DINAS_LUAR">Tugas Dinas Luar / Pendampingan Lomba</option>
                    <option value="CUTI">Cuti Tahunan / Umrah / Hajj</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Mulai</label>
                    <input
                      type="date"
                      value={newLeaveStart}
                      onChange={(e) => setNewLeaveStart(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Selesai</label>
                    <input
                      type="date"
                      value={newLeaveEnd}
                      onChange={(e) => setNewLeaveEnd(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Alasan / Keterangan Lengkap</label>
                  <textarea
                    rows={3}
                    value={newLeaveReason}
                    onChange={(e) => setNewLeaveReason(e.target.value)}
                    placeholder="Tuliskan alasan permohonan izin dan rencana penanganan tugas mengajar..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Lampiran Dokumen / Surat Dokter (Opsional)</label>
                  <input
                    type="text"
                    placeholder="Contoh: Surat_Keterangan_Dokter_Klinik.pdf"
                    value={newLeaveAttachment}
                    onChange={(e) => setNewLeaveAttachment(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
                >
                  Kirim Permohonan Izin
                </button>
              </form>
            </div>

            {/* Tabel Riwayat & Verification Flow */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Daftar Pengajuan Izin &amp; Persetujuan</h3>
                  <p className="text-xs text-slate-500">Sistem persetujuan berjenjang oleh Kepala Sekolah &amp; Tata Usaha</p>
                </div>
                <span className="text-xs bg-indigo-50 text-indigo-700 font-mono px-2.5 py-1 rounded-lg border border-indigo-100 font-bold self-start sm:self-auto">
                  {leaveRequests.length} Permohonan Terdaftar
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider text-[10px]">
                      <th className="p-3">ID / Tgl</th>
                      <th className="p-3">Nama Pemohon</th>
                      <th className="p-3">Jenis Izin</th>
                      <th className="p-3">Periode</th>
                      <th className="p-3">Alasan &amp; Lampiran</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-center">Aksi / Verifikasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {leaveRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50 transition">
                        <td className="p-3 font-mono text-[11px]">
                          <span className="font-bold text-slate-800">{req.id}</span>
                          <div className="text-[10px] text-slate-400">{req.createdAt}</div>
                        </td>
                        <td className="p-3 font-bold text-slate-900">{req.teacherName}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-semibold font-mono text-[10px]">
                            {req.type}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-600">
                          {req.startDate} s/d {req.endDate}
                        </td>
                        <td className="p-3 max-w-[200px]">
                          <p className="text-slate-800 font-medium truncate">{req.reason}</p>
                          {req.attachmentName && (
                            <span className="text-[10px] text-indigo-600 font-mono block mt-0.5 truncate">
                              📎 {req.attachmentName}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                            req.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {req.status === 'APPROVED' ? 'DISETUJUI' : req.status === 'PENDING' ? 'PENDING' : 'DITOLAK'}
                          </span>
                          {req.approvedBy && (
                            <div className="text-[9px] text-slate-400 mt-0.5 truncate max-w-[100px]">
                              {req.approvedBy}
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {req.status === 'PENDING' ? (
                            <div className="flex justify-center gap-1">
                              <button
                                onClick={() => {
                                  setLeaveRequests(prev => prev.map(item => item.id === req.id ? { ...item, status: 'APPROVED', approvedBy: user?.name || 'Kepala Sekolah' } : item));
                                  alert(`Izin ${req.id} milik ${req.teacherName} berhasil disetujui.`);
                                }}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded-lg transition cursor-pointer"
                              >
                                Setujui
                              </button>
                              <button
                                onClick={() => {
                                  setLeaveRequests(prev => prev.map(item => item.id === req.id ? { ...item, status: 'REJECTED', approvedBy: user?.name || 'Kepala Sekolah' } : item));
                                  alert(`Izin ${req.id} milik ${req.teacherName} ditolak.`);
                                }}
                                className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold rounded-lg transition cursor-pointer"
                              >
                                Tolak
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-mono">Verified</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: LIVE MONITORING */}
        {activeSubTab === 'MONITORING' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Table & Stream */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Rekam Monitor Presensi Real-Time</h3>
                  <p className="text-xs text-slate-500">Log sinkronisasi live dari Terminal Gate, Scan QR, &amp; Mobile Client</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-slate-400 absolute ml-3" />
                  <input
                    type="text"
                    placeholder="Cari nama..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-1.5 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:outline-none w-44"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2 text-xs">
                <button 
                  onClick={() => setRoleFilter('ALL')}
                  className={`px-3 py-1 rounded-full cursor-pointer transition ${roleFilter === 'ALL' ? 'bg-indigo-600 text-white font-semibold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  Semua Peran
                </button>
                <button 
                  onClick={() => setRoleFilter('SISWA')}
                  className={`px-3 py-1 rounded-full cursor-pointer transition ${roleFilter === 'SISWA' ? 'bg-indigo-600 text-white font-semibold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  Siswa
                </button>
                <button 
                  onClick={() => setRoleFilter('SANTRI')}
                  className={`px-3 py-1 rounded-full cursor-pointer transition ${roleFilter === 'SANTRI' ? 'bg-indigo-600 text-white font-semibold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  Santri
                </button>
                <button 
                  onClick={() => setRoleFilter('GURU')}
                  className={`px-3 py-1 rounded-full cursor-pointer transition ${roleFilter === 'GURU' ? 'bg-indigo-600 text-white font-semibold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  Guru / Ustadz
                </button>
                <button 
                  onClick={() => setRoleFilter('PEGAWAI')}
                  className={`px-3 py-1 rounded-full cursor-pointer transition ${roleFilter === 'PEGAWAI' ? 'bg-indigo-600 text-white font-semibold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  Pegawai
                </button>
              </div>

              {/* Attendance Log Table */}
              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
                      <th className="py-3 px-4">Nama Personil</th>
                      <th className="py-3 px-4">Waktu &amp; Tanggal</th>
                      <th className="py-3 px-4">Metode</th>
                      <th className="py-3 px-4">Aktivitas</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Detail Lokasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredRecords.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-slate-400 font-mono">Tidak ada rekam log presensi yang cocok.</td>
                      </tr>
                    ) : (
                      filteredRecords.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-3.5 px-4 font-bold text-slate-800">
                            <div>
                              <p>{r.name}</p>
                              <span className="text-[9px] bg-slate-100 border border-slate-200 text-slate-500 font-bold px-1.5 py-0.5 rounded uppercase mt-0.5 inline-block font-mono">
                                {r.role}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-600">
                            <p>{r.date}</p>
                            <span className="text-[10px] text-slate-400 font-semibold">{r.time} WIB</span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-500 font-bold text-[10px]">
                            {r.method}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                              {r.type}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`font-mono text-[10px] font-extrabold px-2 py-1 rounded-lg border ${
                              r.status === 'HADIR' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                              r.status === 'TERLAMBAT' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                              r.status === 'ALFA' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                              'bg-blue-50 text-blue-700 border-blue-100'
                            }`}>
                              {r.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 italic max-w-xs truncate">
                            {r.details}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Add Manual Form Panel with Draft Validation */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-150 pb-3">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-800">Input Absensi Manual</h3>
                </div>
                {autoSaveStatus && (
                  <span className="text-[8px] bg-slate-100 text-indigo-700 font-semibold px-2 py-0.5 rounded font-mono animate-pulse">
                    {autoSaveStatus}
                  </span>
                )}
              </div>

              <form onSubmit={handleManualAdd} className="space-y-4 text-xs font-mono">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-600">Pilih Personil (Siswa / Guru / Pegawai)</label>
                  <select
                    value={manualForm.personId}
                    onChange={(e) => {
                      setIsDrafting(true);
                      setManualForm(p => ({ ...p, personId: e.target.value }));
                    }}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold"
                  >
                    {people.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.role})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-600">Jenis Kegiatan</label>
                    <select
                      value={manualForm.type}
                      onChange={(e) => {
                        setIsDrafting(true);
                        setManualForm(p => ({ ...p, type: e.target.value as any }));
                      }}
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs"
                    >
                      <option value="MASUK">Masuk Harian</option>
                      <option value="PULANG">Pulang Harian</option>
                      <option value="SHALAT">Jamaah Shalat</option>
                      <option value="TAHFIDZ">Tahfidz Qur'an</option>
                      <option value="ASRAMA">Asrama / Mukim</option>
                      <option value="LEMBUR">Lembur Staff</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-600">Status Kehadiran</label>
                    <select
                      value={manualForm.status}
                      onChange={(e) => {
                        setIsDrafting(true);
                        setManualForm(p => ({ ...p, status: e.target.value as any }));
                      }}
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs"
                    >
                      <option value="HADIR">Hadir (Tepat Waktu)</option>
                      <option value="TERLAMBAT">Terlambat</option>
                      <option value="IZIN">Izin Resmi</option>
                      <option value="SAKIT">Sakit (Dokumen)</option>
                      <option value="ALFA">Mangkir / Alfa</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-600">Tanggal</label>
                    <input
                      type="date"
                      value={manualForm.date}
                      onChange={(e) => {
                        setIsDrafting(true);
                        setManualForm(p => ({ ...p, date: e.target.value }));
                      }}
                      className="bg-slate-50 border border-slate-200 p-2 rounded-lg"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-600">Waktu Log</label>
                    <input
                      type="time"
                      value={manualForm.time}
                      onChange={(e) => {
                        setIsDrafting(true);
                        setManualForm(p => ({ ...p, time: e.target.value }));
                      }}
                      className="bg-slate-50 border border-slate-200 p-2 rounded-lg font-bold"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-600">Catatan Lokasi / Alasan</label>
                  <textarea
                    value={manualForm.details}
                    onChange={(e) => {
                      setIsDrafting(true);
                      setManualForm(p => ({ ...p, details: e.target.value }));
                    }}
                    rows={2}
                    className="bg-slate-50 border border-slate-200 p-2 rounded-lg"
                    placeholder="Alasan sakit, lokasi kegiatan pondok, dll..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition cursor-pointer"
                >
                  Simpan Presensi Manual
                </button>
              </form>
            </div>

          </div>
        )}

        {/* TAB 3: GPS RADIUS GEOFENCING */}
        {activeSubTab === 'GPS' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Geofence Map Live View */}
            <div className="lg:col-span-2 space-y-4">
              <GoogleMapsAttendanceView
                selectedLocation={{
                  id: 'LOC-MAIN',
                  name: 'Kampus Sekolah Utama',
                  code: 'MAIN',
                  latitude: gpsSettings.latitude,
                  longitude: gpsSettings.longitude,
                  radius: gpsSettings.radius,
                  status: 'ACTIVE'
                }}
              />

              {/* Kalibrasi / Test Coords Box */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="space-y-2">
                  <p className="font-bold text-slate-700">Uji Kalibrasi Koordinat GPS / Geofence:</p>
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between">
                      <span>Latitude: {emulatorGps.lat.toFixed(6)}</span>
                      <span className="text-slate-400">Pusat: {gpsSettings.latitude}</span>
                    </div>
                    <input 
                      type="range" 
                      min="-6.2120" 
                      max="-6.2050" 
                      step="0.0001"
                      value={emulatorGps.lat} 
                      onChange={(e) => setEmulatorGps(p => ({ ...p, lat: Number(e.target.value) }))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between">
                      <span>Longitude: {emulatorGps.lng.toFixed(6)}</span>
                      <span className="text-slate-400">Pusat: {gpsSettings.longitude}</span>
                    </div>
                    <input 
                      type="range" 
                      min="106.8420" 
                      max="106.8490" 
                      step="0.0001"
                      value={emulatorGps.lng} 
                      onChange={(e) => setEmulatorGps(p => ({ ...p, lng: Number(e.target.value) }))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col justify-between">
                  <p className="font-bold text-slate-700">Info Kalibrasi Lokasi:</p>
                  <p className="text-[10px] text-slate-500 mt-1">Gunakan slider untuk menguji perubahan koordinat relatif terhadap geofence sekolah.</p>
                  <div className="flex gap-2 mt-2">
                    <button 
                      onClick={() => setEmulatorGps({ lat: -6.20885, lng: 106.84562 })}
                      className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-200 text-[10px]"
                    >
                      Set Dalam Geofence
                    </button>
                    <button 
                      onClick={() => setEmulatorGps({ lat: -6.2115, lng: 106.8485 })}
                      className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-200 text-[10px]"
                    >
                      Set Di Luar Geofence
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Geofence Settings Configurator */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Settings className="h-5 w-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-800">Setelan Server GPS Geofencing</h3>
              </div>

              <div className="space-y-4 text-xs font-mono">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-600">Pusat Latitude Sekolah</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={gpsSettings.latitude}
                    onChange={(e) => setGpsSettings(p => ({ ...p, latitude: Number(e.target.value) }))}
                    className="bg-slate-50 border border-slate-200 p-2 rounded-lg font-bold"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-600">Pusat Longitude Sekolah</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={gpsSettings.longitude}
                    onChange={(e) => setGpsSettings(p => ({ ...p, longitude: Number(e.target.value) }))}
                    className="bg-slate-50 border border-slate-200 p-2 rounded-lg font-bold"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between">
                    <label className="font-bold text-slate-600">Radius Geofencing (Meters)</label>
                    <span className="text-indigo-600 font-black">{gpsSettings.radius}m</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="500"
                    step="10"
                    value={gpsSettings.radius}
                    onChange={(e) => setGpsSettings(p => ({ ...p, radius: Number(e.target.value) }))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-600">Mulai Operasional</label>
                    <input
                      type="time"
                      value={gpsSettings.operationalStart}
                      onChange={(e) => setGpsSettings(p => ({ ...p, operationalStart: e.target.value }))}
                      className="bg-slate-50 border border-slate-200 p-2 rounded-lg"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-600">Akhir Operasional</label>
                    <input
                      type="time"
                      value={gpsSettings.operationalEnd}
                      onChange={(e) => setGpsSettings(p => ({ ...p, operationalEnd: e.target.value }))}
                      className="bg-slate-50 border border-slate-200 p-2 rounded-lg"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSaveGpsSettings}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Save className="h-4 w-4" />
                  Simpan Konfigurasi GPS
                </button>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: QR SECURITY ENGINE & BARCODE SCANNERS */}
        {activeSubTab === 'QR_BARCODE' && (
          <div className="space-y-6">
            <EnterpriseQrSecurityEngine />

            {/* Smart Gate Scanner (Kartu Pelajar Scanner HP Guru & Karyawan) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Scanner Kartu Pelajar (Pindai via HP Guru & Karyawan)</h3>
                <p className="text-xs text-slate-500">Mencatat presensi siswa secara real-time menggunakan kamera HP atau pembaca kartu pelajar (Smart Card) pada akun Guru atau Karyawan.</p>
              </div>

              <div className="p-6 border border-slate-150 rounded-2xl bg-slate-900 text-white font-mono flex flex-col gap-4 relative">
                {audioBeep && (
                  <div className="absolute inset-0 bg-emerald-500/20 animate-fade-in flex items-center justify-center z-10">
                    <span className="text-emerald-400 font-bold text-xl uppercase tracking-widest animate-pulse">BEEP! KARTU PELAJAR TERPINDAI</span>
                  </div>
                )}

                <form onSubmit={handleBarcodeSubmit} className="space-y-3 z-0">
                  <label className="text-[10px] text-slate-400 font-bold uppercase block">Pindai / Tap Kartu Pelajar (Scan NIS / QR Code)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Scan atau ketik NIS / ID Kartu Pelajar (contoh: NIS20260001)"
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-emerald-400 focus:outline-none focus:border-emerald-600"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Proses Scan
                    </button>
                  </div>
                </form>

                <div className="border-t border-slate-800 pt-3 space-y-2">
                  <p className="text-[9px] text-slate-400 uppercase font-black">Log Monitor Gerbang Pembaca Utama:</p>
                  <div className="h-32 overflow-y-auto bg-slate-950/80 p-3 rounded-lg border border-slate-800 text-[10px] space-y-1 text-emerald-500">
                    {gateLog.length === 0 ? (
                      <p className="text-slate-500 italic">Menunggu tembakan kartu / scan barcode...</p>
                    ) : (
                      gateLog.map((log, i) => <p key={i}>{log}</p>)
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center text-[9px] text-slate-400">
                  <span>Standard format: EAN-13, Code-128</span>
                  <div className="flex gap-1.5">
                    <span className="text-emerald-500">● GATE_CONTROLLER_ONLINE</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 5: SMART ID CARD CENTER */}
        {activeSubTab === 'CARD_CENTER' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Interactive ID Card configuration panel */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800">Pencetakan Kartu Pintar (Smart ID Card)</h3>
                <p className="text-xs text-slate-500 font-sans mt-0.5">Atur layout, kompresi foto, filter, watermark, dan parameter cetak.</p>
              </div>

              <div className="space-y-4 text-xs font-mono">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-600">Pilih Personil</label>
                  <select
                    value={selectedCardPerson}
                    onChange={(e) => setSelectedCardPerson(e.target.value)}
                    className="bg-slate-50 border border-slate-200 p-2 rounded-lg font-bold"
                  >
                    {people.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.role})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-600">Pemotongan Foto (Crop)</label>
                    <select
                      value={cropMode}
                      onChange={(e) => setCropMode(e.target.value as any)}
                      className="bg-slate-50 border border-slate-200 p-2 rounded-lg"
                    >
                      <option value="1:1">Kotak Sempurna 1:1</option>
                      <option value="3:4">Pasfoto 3:4</option>
                      <option value="FULL">Resolusi Penuh</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-600">Kompresi Kualitas</label>
                    <select
                      value={compressQuality}
                      onChange={(e) => setCompressQuality(Number(e.target.value))}
                      className="bg-slate-50 border border-slate-200 p-2 rounded-lg"
                    >
                      <option value={90}>90% (Super High)</option>
                      <option value={80}>80% (Medium-High)</option>
                      <option value={50}>50% (Sangat Hemat)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <label className="font-bold text-slate-600 cursor-pointer flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={isWatermarked}
                      onChange={(e) => setIsWatermarked(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-0"
                    />
                    Tambahkan Watermark Instansi
                  </label>
                </div>

                <button
                  onClick={() => alert('Mengirim perintah cetak PDF ke printer kartu lokal via WebSocket proxy.')}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Printer className="h-4 w-4" />
                  Cetak Smart Card Fisik (ID Card)
                </button>
              </div>
            </div>

            {/* High fidelity Printable Card Preview rendering layout */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Pratinjau Hasil Cetak ID Card Pintar</h3>
                <p className="text-xs text-slate-500">Tata letak standar akreditasi BAN-S/M dengan validasi barcode barcode-128 dan QR harian</p>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6">
                
                {/* FRONT CARD */}
                <div className="w-64 h-96 bg-gradient-to-br from-indigo-700 to-indigo-900 text-white rounded-2xl shadow-xl flex flex-col justify-between p-5 relative overflow-hidden font-sans border-2 border-indigo-500/30">
                  {/* Watermark overlay */}
                  {isWatermarked && (
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent pointer-events-none flex items-center justify-center">
                      <Shield className="h-48 w-48 text-white/[0.03] rotate-12" />
                    </div>
                  )}

                  <div className="z-10 flex items-center gap-2.5 border-b border-white/20 pb-3">
                    <Shield className="h-8 w-8 text-indigo-300" />
                    <div>
                      <h4 className="text-[10px] font-bold tracking-wider uppercase">PONDOK PESANTREN</h4>
                      <p className="text-[7px] text-indigo-200 font-mono">DAARUL QUR'AN INDONESIA</p>
                    </div>
                  </div>

                  <div className="z-10 flex flex-col items-center gap-3 py-4">
                    {/* Portrait Frame */}
                    <div className="relative">
                      <img
                        src={cardPerson.image}
                        alt="pasfoto"
                        className={`h-24 object-cover border-2 border-white shadow-md ${
                          cropMode === '1:1' ? 'w-24 rounded-full' :
                          cropMode === '3:4' ? 'w-18 rounded-lg' : 'w-full rounded'
                        }`}
                      />
                      <span className="absolute bottom-0 right-0 bg-emerald-500 border border-white text-[7px] font-extrabold px-1.5 rounded-full text-white">
                        S8_OK
                      </span>
                    </div>

                    <div className="text-center">
                      <p className="text-xs font-bold text-white tracking-wide uppercase">{cardPerson.name}</p>
                      <p className="text-[9px] text-indigo-200 font-bold uppercase mt-0.5">{cardPerson.role}</p>
                    </div>
                  </div>

                  <div className="z-10 flex items-center justify-between border-t border-white/20 pt-3">
                    <div className="text-left">
                      <p className="text-[6px] text-indigo-300 uppercase font-mono">NOMOR REGISTRASI</p>
                      <p className="text-[9px] font-extrabold font-mono text-indigo-100">{cardPerson.nis || cardPerson.nip}</p>
                    </div>

                    <div className="bg-white p-1 rounded">
                      <QrCode className="h-7 w-7 text-indigo-900" />
                    </div>
                  </div>
                </div>

                {/* BACK CARD */}
                <div className="w-64 h-96 bg-white text-slate-800 rounded-2xl shadow-xl flex flex-col justify-between p-5 relative overflow-hidden font-sans border border-slate-200">
                  <div className="space-y-2 text-[8px] leading-relaxed text-slate-500">
                    <h5 className="font-bold text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-1 text-center">Ketentuan Penggunaan</h5>
                    <ol className="list-decimal pl-3 space-y-1">
                      <li>Kartu Pintar ini wajib dibawa setiap hari &amp; dilarang dipindahtangankan.</li>
                      <li>Digunakan untuk presensi masuk/pulang, perpustakaan, lms, dan kantin digital.</li>
                      <li>Kehilangan wajib melapor ke divisi Tata Usaha (TU) dalam waktu 1x24 jam.</li>
                    </ol>
                  </div>

                  <div className="flex flex-col items-center gap-3 border-t border-slate-100 pt-4">
                    <div className="flex flex-col items-center gap-1.5 bg-slate-50 px-4 py-2.5 rounded-lg border border-slate-150 w-full shadow-inner">
                      <Barcode className="h-10 w-full text-slate-900" />
                      <span className="text-[8px] font-mono font-bold tracking-widest text-slate-600">
                        *{cardPerson.nis || cardPerson.nip}*
                      </span>
                    </div>

                    <div className="text-center w-full">
                      <p className="text-[6px] text-slate-400 font-mono">SINKRONISASI AKTIF: DAPODIK KEMENDIKBUD • EMIS KEMENAG</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* TAB 6: DYNAMIC ATTENDANCE SETTINGS ENGINE */}
        {isSuperAdmin && activeSubTab === 'RULES' && (
          <EnterpriseAttendanceSettings />
        )}

        {/* TAB 6.5: ENTERPRISE SCHEDULER & WORKING CALENDAR ENGINE */}
        {activeSubTab === 'SCHEDULER' && (
          <AttendanceScheduler />
        )}

        {/* TAB 7: REPLACEMENT TEACHER ENGINE */}
        {activeSubTab === 'REPLACEMENT' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Form penugasan */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
              <div className="border-b border-slate-150 pb-3">
                <h3 className="text-sm font-bold text-slate-800">Assign Guru Pengganti (Replacement)</h3>
                <p className="text-xs text-slate-500">Ganti guru yang tidak hadir (Sakit/Izin/Alfa) dengan guru yang siap mengajar.</p>
              </div>

              <form onSubmit={handleReplacementSubmit} className="space-y-4 text-xs font-mono">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-600">Guru Berhalangan Hadir (Asli)</label>
                  <select
                    value={replacementForm.originalTeacherId}
                    onChange={(e) => setReplacementForm(p => ({ ...p, originalTeacherId: e.target.value }))}
                    className="bg-slate-50 border border-slate-200 p-2 rounded-lg font-bold"
                  >
                    {people.filter(p => p.role === 'GURU').map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-600">Guru Pengganti (Substitute)</label>
                  <select
                    value={replacementForm.substituteTeacherId}
                    onChange={(e) => setReplacementForm(p => ({ ...p, substituteTeacherId: e.target.value }))}
                    className="bg-slate-50 border border-slate-200 p-2 rounded-lg font-bold"
                  >
                    {people.filter(p => p.role === 'GURU').map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-600">Mata Pelajaran / Halaqah</label>
                  <input
                    type="text"
                    value={replacementForm.courseName}
                    onChange={(e) => setReplacementForm(p => ({ ...p, courseName: e.target.value }))}
                    className="bg-slate-50 border border-slate-200 p-2 rounded-lg font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-600">Tanggal</label>
                    <input
                      type="date"
                      value={replacementForm.date}
                      onChange={(e) => setReplacementForm(p => ({ ...p, date: e.target.value }))}
                      className="bg-slate-50 border border-slate-200 p-2 rounded-lg"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-600">Jam Mengajar (Slot)</label>
                    <input
                      type="text"
                      value={replacementForm.timeSlot}
                      onChange={(e) => setReplacementForm(p => ({ ...p, timeSlot: e.target.value }))}
                      className="bg-slate-50 border border-slate-200 p-2 rounded-lg"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="h-4 w-4" />
                  Assign &amp; Hitung Honor Pengganti
                </button>
              </form>
            </div>

            {/* List penugasan aktif */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Daftar Guru Pengganti Terdaftar</h3>
                <p className="text-xs text-slate-500">Mencatat riwayat assignmeng untuk verifikasi keuangan &amp; payroll terkomputasi.</p>
              </div>

              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
                      <th className="py-3 px-4">Guru Berhalangan</th>
                      <th className="py-3 px-4">Guru Pengganti</th>
                      <th className="py-3 px-4">Mata Pelajaran</th>
                      <th className="py-3 px-4">Honor Pengganti</th>
                      <th className="py-3 px-4">Debet Guru Asli</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-mono text-[11px]">
                    {replacements.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3.5 px-4 font-bold text-rose-700 flex items-center gap-1">
                          <UserX className="h-3.5 w-3.5" />
                          {r.originalTeacherName.split(',')[0]}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-emerald-700">
                          {r.substituteTeacherName.split(',')[0]}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{r.courseName}</td>
                        <td className="py-3.5 px-4 font-bold text-indigo-600">Rp {r.honorCalculated.toLocaleString()}</td>
                        <td className="py-3.5 px-4 font-bold text-red-600">Rp {r.originalTeacherDeduction.toLocaleString()}</td>
                        <td className="py-3.5 px-4">
                          <span className="bg-indigo-50 text-indigo-700 font-extrabold px-2 py-0.5 rounded border border-indigo-100 text-[9px]">
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-150 text-[10px] leading-relaxed text-slate-500 font-mono space-y-1">
                <p className="font-bold text-slate-700">📌 Logika Keuangan &amp; Akuntansi:</p>
                <p>Ketika guru pengganti disetujui, kas kecil pesantren/sekolah didebet untuk membayarkan honor mengajar pengganti sesuai S8. Mutasi denda guru asli dikurangi dari total gaji pokok bersih yang ditransfer.</p>
              </div>
            </div>

          </div>
        )}

        {/* TAB 8: PAYROLL ATTENDANCE INTEGRATION */}
        {isSuperAdmin && activeSubTab === 'PAYROLL' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-150 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Siklus Penggajian Bulanan Terintegrasi Absensi (S8 HR)</h3>
                <p className="text-xs text-slate-500 font-sans mt-0.5">Penarikan otomatis log terlambat, izin, dan lembur pegawai menjadi nominal denda/bonus.</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => alert('Mengekspor denda & bonus lembur payroll absensi ke berkas .xlsx...')}
                  className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition font-mono flex items-center gap-1"
                >
                  <Download className="h-4 w-4" /> Export CSV
                </button>
                <button
                  onClick={() => alert('Siklus denda presensi bulan Juli berhasil dibukukan & dikirim ke buku besar keuangan!')}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition font-mono flex items-center gap-1"
                >
                  <Save className="h-4 w-4" /> Posting Gaji Bersih
                </button>
              </div>
            </div>

            {/* List calculated payroll */}
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
                    <th className="py-3 px-4">Nama Personil</th>
                    <th className="py-3 px-4">Peran</th>
                    <th className="py-3 px-4">Tepat Waktu</th>
                    <th className="py-3 px-4">Terlambat (&gt;10m)</th>
                    <th className="py-3 px-4">Alfa / Mangkir</th>
                    <th className="py-3 px-4">Denda Terkumpul</th>
                    <th className="py-3 px-4">Bonus / Insentif</th>
                    <th className="py-3 px-4">Kalkulasi Bersih</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-mono text-xs">
                  {[
                    { name: 'Ustadz Budi Raharjo, M.Pd.', role: 'GURU', ontime: 21, late: 1, alfa: 0, denda: 15000, bonus: 180000, net: 165000 },
                    { name: 'Ustazah Laila Fitri, S.Pd.I.', role: 'GURU', ontime: 18, late: 0, alfa: 1, denda: 50000, bonus: 90000, net: 40000 },
                    { name: 'Slamet Hariadi', role: 'PEGAWAI', ontime: 15, late: 3, alfa: 0, denda: 45000, bonus: 75000, net: 30000 },
                    { name: 'Muhammad Ahmad Baihaqi', role: 'SANTRI', ontime: 24, late: 1, alfa: 0, denda: 15000, bonus: 0, net: -15000 }
                  ].map((p, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 px-4 font-bold text-slate-800">{p.name}</td>
                      <td className="py-3 px-4"><span className="text-[10px] font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">{p.role}</span></td>
                      <td className="py-3 px-4 font-bold text-emerald-600">{p.ontime} hari</td>
                      <td className="py-3 px-4 font-bold text-amber-600">{p.late} kali</td>
                      <td className="py-3 px-4 font-bold text-rose-600">{p.alfa} hari</td>
                      <td className="py-3 px-4 text-red-600">-Rp {p.denda.toLocaleString()}</td>
                      <td className="py-3 px-4 text-emerald-600">+Rp {p.bonus.toLocaleString()}</td>
                      <td className={`py-3 px-4 font-black ${p.net >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                        {p.net >= 0 ? '+' : ''}Rp {p.net.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-amber-50 rounded-xl border border-amber-100 text-[10px] text-amber-800 font-mono">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Peringatan: Pemotongan akan langsung ditransfer ke bank penerima gaji di module Keuangan &amp; Akuntansi saat diposting.</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: DEVELOPER REST API & APPS SCRIPT */}
        {isSuperAdmin && activeSubTab === 'DEVELOPER' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* API Console Playground */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">REST API Gateway Simulator</h3>
                <p className="text-xs text-slate-500">Uji coba interaktif request/response endpoint Mobile Attendance Engine.</p>
              </div>

              <div className="space-y-4 text-xs font-mono">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-600">Pilih Endpoint SPRINT 8</label>
                  <select
                    value={selectedEndpoint}
                    onChange={(e) => setSelectedEndpoint(e.target.value)}
                    className="bg-slate-50 border border-slate-200 p-2 rounded-lg font-bold"
                  >
                    <option value="attendanceCheckIn">attendanceCheckIn (Check-In GPS/Card)</option>
                    <option value="attendanceQR">attendanceQR (Validate Secure Dynamic QR)</option>
                    <option value="attendanceLateRule">attendanceLateRule (Get Late Rules Settings)</option>
                    <option value="replacementTeacher">replacementTeacher (Assign Substitute)</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-slate-500">Method &amp; Request URL</span>
                    <input 
                      type="text" 
                      readOnly 
                      value={apiConsole.requestUrl} 
                      className="bg-slate-900 text-slate-200 p-2 rounded-lg text-[10px] border border-slate-800 cursor-text w-full overflow-x-auto"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-slate-500">Headers</span>
                    <textarea 
                      readOnly 
                      value={apiConsole.requestHeaders} 
                      className="bg-slate-900 text-slate-200 p-2 rounded-lg text-[10px] border border-slate-800 font-mono w-full"
                      rows={2}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-slate-500">Request Body</span>
                    <textarea 
                      readOnly 
                      value={apiConsole.requestBody} 
                      className="bg-slate-900 text-slate-300 p-2 rounded-lg text-[10px] border border-slate-800 font-mono w-full"
                      rows={6}
                    />
                  </div>
                </div>

                <button
                  onClick={handleRunMockRequest}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <Play className="h-4 w-4" /> Run Mock REST API Call
                </button>
              </div>
            </div>

            {/* Response Console & Google Apps Script copy-paste */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Response Payload &amp; Google Apps Script Code</h3>
                <p className="text-xs text-slate-500">Salin naskah serverless Google Apps Script di bawah untuk integrasi spreadsheet langsung.</p>
              </div>

              {/* Console output display */}
              <div className="space-y-1 text-xs font-mono">
                <div className="flex justify-between items-center bg-slate-950 p-2 rounded-t-lg border-b border-slate-800 text-white">
                  <span className="text-emerald-400 font-black">● HTTP RESPONSE STATUS: {apiConsole.status} OK</span>
                  <span className="text-[10px] text-slate-500">JSON Format</span>
                </div>
                <textarea
                  readOnly
                  value={apiConsole.responsePayload}
                  className="bg-slate-950 text-emerald-400 p-4 rounded-b-lg text-[10px] font-mono w-full"
                  rows={8}
                />
              </div>

              {/* Google Apps Script Complete Code */}
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Code className="h-4 w-4 text-indigo-600" /> Complete Google Apps Script Endpoint
                  </span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`/**
 * Google Apps Script - SPRINT 8 Mobile Attendance & Master Data Engine Endpoint
 * Deploy as a Web App to create direct spreadsheet integration.
 */
function doPost(e) {
  var action = e.parameter.action;
  var payload = JSON.parse(e.postData.contents);
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  
  switch(action) {
    case 'studentList':
      return renderJSON({ success: true, students: getStudentsList(sheet) });
    case 'studentCreate':
      return renderJSON(createStudent(sheet, payload));
    case 'attendanceCheckIn':
      return renderJSON(processCheckIn(sheet, payload));
    case 'attendanceCheckOut':
      return renderJSON(processCheckOut(sheet, payload));
    case 'replacementTeacher':
      return renderJSON(assignReplacement(sheet, payload));
    default:
      return renderJSON({ success: false, error: 'Endpoint action not defined.' });
  }
}`);
                      alert('Kode Google Apps Script berhasil disalin ke papan klip Anda!');
                    }}
                    className="text-[10px] text-indigo-600 font-extrabold hover:underline"
                  >
                    Salin Kode Script
                  </button>
                </div>

                <div className="p-3 bg-slate-900 text-slate-400 rounded-xl text-[10px] font-mono h-48 overflow-y-auto border border-slate-850">
                  <pre>{`/**
 * Google Apps Script - SPRINT 8 Mobile Attendance & Master Data Engine Endpoint
 * Deploy as a Web App to create direct spreadsheet integration.
 */
function doPost(e) {
  var action = e.parameter.action;
  var payload = JSON.parse(e.postData.contents);
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  
  switch(action) {
    case 'studentList':
      return renderJSON({ success: true, students: getStudentsList(sheet) });
    case 'studentCreate':
      return renderJSON(createStudent(sheet, payload));
    case 'attendanceCheckIn':
      return renderJSON(processCheckIn(sheet, payload));
    case 'attendanceCheckOut':
      return renderJSON(processCheckOut(sheet, payload));
    case 'replacementTeacher':
      return renderJSON(assignReplacement(sheet, payload));
    default:
      return renderJSON({ success: false, error: 'Endpoint action not defined.' });
  }
}

function processCheckIn(sheet, payload) {
  var attSheet = sheet.getSheetByName("attendance_records");
  // Check geofence radius
  var isWithinRadius = checkGeofenceRadius(payload.latitude, payload.longitude);
  if (!isWithinRadius) {
    return { success: false, error: "Luar Radius Geofence" };
  }
  
  var recordId = "rec-" + Utilities.getUuid();
  attSheet.appendRow([
    recordId, 
    payload.person_id, 
    payload.name, 
    new Date(), 
    "MASUK", 
    "HADIR", 
    payload.method
  ]);
  return { success: true, record_id: recordId, status: "HADIR" };
}

function checkGeofenceRadius(lat, lng) {
  // Center: -6.2088, 106.8456
  // Radius limit: 150m
  var distance = calculateDistance(-6.2088, 106.8456, lat, lng);
  return distance <= 150;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  var R = 6371e3; // meters
  var dLat = (lat2 - lat1) * Math.PI / 180;
  var dLon = (lon2 - lon1) * Math.PI / 180;
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function renderJSON(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}`}</pre>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 0: ENTERPRISE ATTENDANCE COMMAND CENTER */}
        {activeSubTab === 'COMMAND_CENTER' && (
          <EnterpriseAttendanceCommandCenter />
        )}

        {/* TAB 11: ENTERPRISE EMPLOYEE ATTENDANCE WORKSPACE */}
        {activeSubTab === 'EMPLOYEE_WORKSPACE' && (
          <EnterpriseEmployeeAttendanceWorkspace />
        )}

      </div>

    </div>
  );
}
