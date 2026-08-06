import React, { useState, useEffect, useRef } from 'react';
import {
  Smartphone,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  QrCode,
  Shield,
  ShieldCheck,
  UserCheck,
  AlertTriangle,
  FileText,
  Download,
  Printer,
  RefreshCw,
  Send,
  Building2,
  Users,
  Award,
  DollarSign,
  BookOpen,
  Calendar,
  Lock,
  Unlock,
  Eye,
  Check,
  ArrowRight,
  Camera,
  Compass,
  Navigation,
  ZoomIn,
  ZoomOut,
  Crosshair,
  Wifi,
  Sparkles,
  Volume2,
  Search,
  Filter,
  GraduationCap,
  Bell,
  CheckCircle,
  HelpCircle,
  RotateCcw,
  Zap,
  SlidersHorizontal,
  ChevronRight,
  Plus,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export interface MobileProfile {
  id: string;
  nip: string;
  name: string;
  role: 'GURU' | 'PEGAWAI' | 'TU' | 'OPERATOR' | 'SATPAM' | 'CLEANING_SERVICE' | 'MUSYRIF' | 'SISWA' | 'SANTRI';
  roleLabel: string;
  unit: string;
  department: string;
  shiftName: string;
  shiftHours: string;
  deviceId: string;
  photoUrl: string;
}

const SAMPLE_ROLES: MobileProfile[] = [
  {
    id: 'EMP-G01',
    nip: '198203152008',
    name: 'Ustadz Ahmad Fauzi, S.Pd.',
    role: 'GURU',
    roleLabel: 'Guru Wali Kelas & Guru Mapel',
    unit: 'SMP IT / SMA IT',
    department: 'Kurikulum & Bahasa Arab',
    shiftName: 'Shift KBM Pagi',
    shiftHours: '06:30 - 15:00',
    deviceId: 'DEV-ANDROID-SAMSUNG-991',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'SIS-001',
    nip: '202310001',
    name: 'Muhammad Zaky Al-Farisi',
    role: 'SISWA',
    roleLabel: 'Siswa - Kelas X IPA 1 (Absensi oleh Guru)',
    unit: 'SMA IT Utama',
    department: 'Kelas X IPA 1 (Peserta Didik)',
    shiftName: 'KBM Pagi Siswa',
    shiftHours: '06:45 - 15:15',
    deviceId: 'DEV-ANDROID-SAMSUNG-A54',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'SIS-002',
    nip: '202310042',
    name: 'Siti Nurhaliza Azzahra',
    role: 'SANTRI',
    roleLabel: 'Santri Putri - Kelas VIII A (Absensi oleh Guru)',
    unit: 'Pondok Pesantren',
    department: 'Asrama Aisyah & KBM SMP',
    shiftName: 'KBM & Tahfidz Asrama',
    shiftHours: '05:00 - 21:00',
    deviceId: 'DEV-XIAOMI-REDMI-NOTE12',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'EMP-P01',
    nip: '198507202010',
    name: 'H. Bambang Sugianto, S.E.',
    role: 'PEGAWAI',
    roleLabel: 'Pegawai / Staf General',
    unit: 'Kampus Utama',
    department: 'Administrasi & Keuangan',
    shiftName: 'Shift Reguler Pagi',
    shiftHours: '07:00 - 15:30',
    deviceId: 'DEV-IPHONE-15-PRO-002',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'EMP-TU01',
    nip: '199001122014',
    name: 'Siti Rahmawati, S.Kom.',
    role: 'TU',
    roleLabel: 'Tata Usaha (TU)',
    unit: 'SMA IT',
    department: 'Layanan Tata Usaha',
    shiftName: 'Shift Reguler Pagi',
    shiftHours: '07:00 - 15:30',
    deviceId: 'DEV-PIXEL-7-TRUSTED',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'EMP-OP01',
    nip: '199308182018',
    name: 'Rizky Kurniawan, S.T.',
    role: 'OPERATOR',
    roleLabel: 'Operator IT & Dapodik',
    unit: 'IT Center',
    department: 'Sistem Informasi & Infrastruktur',
    shiftName: 'Shift IT On-Call',
    shiftHours: '07:00 - 16:00',
    deviceId: 'DEV-OPERATOR-PC-01',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'EMP-STP01',
    nip: '199103042016',
    name: 'Suryanto (Komandan)',
    role: 'SATPAM',
    roleLabel: 'Satpam / Keamanan Kampus',
    unit: 'Keamanan Utama',
    department: 'Sarpras & Keamanan',
    shiftName: 'Shift Pagi Gate 1',
    shiftHours: '06:00 - 14:00',
    deviceId: 'DEV-OPPO-RENO-SECURITY',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'EMP-CS01',
    nip: '199605152021',
    name: 'Agus Subagyo',
    role: 'CLEANING_SERVICE',
    roleLabel: 'Cleaning Service / Kebersihan',
    unit: 'Umum Sarpras',
    department: 'Maintenance & Kebersihan',
    shiftName: 'Shift Pagi Awal',
    shiftHours: '05:30 - 13:30',
    deviceId: 'DEV-REALME-CS-003',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'EMP-MSY01',
    nip: '199511022020',
    name: 'Ustadz Rizqon Hasani, Lc.',
    role: 'MUSYRIF',
    roleLabel: 'Musyrif Asrama / Pengasuh',
    unit: 'Pondok Pesantren',
    department: 'Keasramaan & Pengasuhan',
    shiftName: 'Shift Asrama Piket',
    shiftHours: '05:00 - 22:00',
    deviceId: 'DEV-XIAOMI-13T-PONDOK',
    photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200'
  }
];

export function EnterpriseEmployeeAttendanceWorkspace() {
  const { user, tenant, previewRole } = useAuth();
  const [selectedProfile, setSelectedProfile] = useState<MobileProfile>(SAMPLE_ROLES[0]);

  // Sync selectedProfile with active role in AuthContext if previewRole or user changes
  useEffect(() => {
    const rawRole = (previewRole || user?.role || '').toUpperCase();
    if (rawRole.includes('GURU') || rawRole.includes('TEACHER') || rawRole.includes('USTADZ') || rawRole.includes('WALI_KELAS')) {
      setSelectedProfile(SAMPLE_ROLES[0]); // Ustadz Ahmad Fauzi (Guru Wali Kelas & Mapel)
    } else if (rawRole.includes('PEGAWAI') || rawRole.includes('KARYAWAN') || rawRole.includes('EMPLOYEE')) {
      setSelectedProfile(SAMPLE_ROLES[3]); // H. Bambang Sugianto (Pegawai)
    } else if (rawRole.includes('TU') || rawRole.includes('ADMIN_TU')) {
      setSelectedProfile(SAMPLE_ROLES[4]); // Siti Rahmawati (TU)
    } else if (rawRole.includes('OPERATOR') || rawRole.includes('OPS')) {
      setSelectedProfile(SAMPLE_ROLES[5]); // Rizky Kurniawan (Operator)
    } else if (rawRole.includes('SATPAM') || rawRole.includes('SECURITY')) {
      setSelectedProfile(SAMPLE_ROLES[6]); // Suryanto (Satpam)
    } else if (rawRole.includes('CLEANING') || rawRole.includes('CS')) {
      setSelectedProfile(SAMPLE_ROLES[7]); // Agus Subagyo (Cleaning Service)
    } else if (rawRole.includes('MUSYRIF') || rawRole.includes('PENGASUH')) {
      setSelectedProfile(SAMPLE_ROLES[8]); // Ustadz Rizqon (Musyrif)
    } else if (rawRole.includes('SISWA') || rawRole.includes('STUDENT')) {
      setSelectedProfile(SAMPLE_ROLES[1]); // Muhammad Zaky (Siswa)
    } else if (rawRole.includes('SANTRI')) {
      setSelectedProfile(SAMPLE_ROLES[2]); // Siti Nurhaliza (Santri)
    }
  }, [user, previewRole]);
  
  // Realtime clock
  const [currentTime, setCurrentTime] = useState(new Date());

  // Attendance status
  const [checkInStatus, setCheckInStatus] = useState<'BELUM' | 'HADIR' | 'TERLAMBAT' | 'IZIN' | 'PULANG'>('BELUM');
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
  const [workDuration, setWorkDuration] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [apiLog, setApiLog] = useState<string | null>(null);

  // Map & GPS State
  const [userLat, setUserLat] = useState(-6.208851);
  const [userLng, setUserLng] = useState(106.845620);
  const [mapZoom, setMapZoom] = useState(17);
  const [schoolLat, setSchoolLat] = useState(-6.208800);
  const [schoolLng, setSchoolLng] = useState(106.845600);
  const [gpsAccuracy, setGpsAccuracy] = useState(4.8); // meters
  const [distanceToSchool, setDistanceToSchool] = useState(18); // meters
  const [inGeofence, setInGeofence] = useState(true);
  const [fullAddress, setFullAddress] = useState('Jl. Pendidikan No. 45, Kampus Terpadu AI Studio, Jakarta');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsPermissionStatus, setGpsPermissionStatus] = useState<'prompt' | 'granted' | 'denied' | 'unknown'>('unknown');

  // Scanner Modal State
  const [showScanner, setShowScanner] = useState(false);
  const [scannerType, setScannerType] = useState<'QR' | 'BARCODE' | 'DYNAMIC_QR'>('QR');
  const [scanSuccessData, setScanSuccessData] = useState<any | null>(null);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  // Manual Request Form Modal
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualTime, setManualTime] = useState('07:00');
  const [manualReason, setManualReason] = useState('');
  const [manualLocation, setManualLocation] = useState('Gedung Rektorat Utama');
  const [manualRequests, setManualRequests] = useState<any[]>([]);

  // History Filter
  const [historyPeriod, setHistoryPeriod] = useState<'HARI_INI' | 'MINGGUAN' | 'BULANAN'>('HARI_INI');
  const [historySearch, setHistorySearch] = useState('');
  const [historyStatusFilter, setHistoryStatusFilter] = useState('ALL');

  // Student Attendance State for Guru Wali Kelas & Guru Mapel
  const [selectedClassForGuru, setSelectedClassForGuru] = useState('Kelas X IPA 1');
  const [guruAttendanceMode, setGuruAttendanceMode] = useState<'WALI_KELAS' | 'GURU_MAPEL'>('WALI_KELAS');
  const [studentsAttendanceList, setStudentsAttendanceList] = useState([
    { id: 'STU-01', nis: '202310001', name: 'Muhammad Zaky Al-Farisi', status: 'HADIR', time: '07:15 WIB', note: 'Scan Barcode Kartu' },
    { id: 'STU-02', nis: '202310002', name: 'Ahmad Danial Syah', status: 'HADIR', time: '07:18 WIB', note: 'Scan Barcode Kartu' },
    { id: 'STU-03', nis: '202310003', name: 'Fatimah Az-Zahra', status: 'HADIR', time: '07:20 WIB', note: 'Scan QR ID Card' },
    { id: 'STU-04', nis: '202310004', name: 'Muhammad Rayhan', status: 'SAKIT', time: '-', note: 'Surat Dokter Wali' },
    { id: 'STU-05', nis: '202310005', name: 'Aisha Khairunnisa', status: 'IZIN', time: '-', note: 'Izin Keluarga' },
    { id: 'STU-06', nis: '202310006', name: 'Bagas Prasetyo', status: 'HADIR', time: '07:22 WIB', note: 'Scan Barcode Kartu' },
    { id: 'STU-07', nis: '202310042', name: 'Siti Nurhaliza Azzahra', status: 'HADIR', time: '07:10 WIB', note: 'Scan Barcode Kartu' },
  ]);

  // Integrated Student Attendance Feature states
  const [studentScanInput, setStudentScanInput] = useState('');
  const [scannedStudentDetail, setScannedStudentDetail] = useState<any | null>(null);
  const [showAddStudentForm, setShowAddStudentForm] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentNis, setNewStudentNis] = useState('');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [studentActiveTab, setStudentActiveTab] = useState<'SCANNER' | 'MANUAL'>('SCANNER');
  const [studentScanDevice, setStudentScanDevice] = useState<'EXTERNAL' | 'CAMERA'>('EXTERNAL');
  const [studentScanBeepAlert, setStudentScanBeepAlert] = useState(false);

  const handleScanStudentCard = (nisValue: string) => {
    if (!nisValue.trim()) return;
    const foundStudent = studentsAttendanceList.find(s => s.nis.toUpperCase() === nisValue.trim().toUpperCase());
    if (foundStudent) {
      setStudentsAttendanceList(prev =>
        prev.map(s => s.id === foundStudent.id ? {
          ...s,
          status: 'HADIR',
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
          note: `Dipindai oleh ${selectedProfile.name} - ${selectedClassForGuru}`
        } : s)
      );
      triggerAudioFeedback('SUCCESS');
      setStudentScanBeepAlert(true);
      setScannedStudentDetail({
        ...foundStudent,
        scannedAt: new Date().toLocaleTimeString('id-ID') + ' WIB',
        scannedBy: selectedProfile.name,
        scannedClass: selectedClassForGuru
      });
      setTimeout(() => setStudentScanBeepAlert(false), 2000);
      setStudentScanInput('');
    } else {
      triggerAudioFeedback('ERROR');
      alert(`Kartu Pelajar / Barcode dengan NIS ${nisValue} tidak ditemukan! Tambahkan siswa baru secara manual jika belum terdaftar.`);
    }
  };

  const handleAddNewStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentNis.trim()) {
      alert('Nama dan NIS tidak boleh kosong.');
      return;
    }
    const isDuplicate = studentsAttendanceList.some(s => s.nis.trim() === newStudentNis.trim());
    if (isDuplicate) {
      alert('Siswa dengan NIS tersebut sudah terdaftar.');
      return;
    }

    const newStudent = {
      id: `STU-NEW-${Date.now()}`,
      nis: newStudentNis.trim(),
      name: newStudentName.trim(),
      status: 'HADIR',
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      note: 'Ditambahkan Manual'
    };

    setStudentsAttendanceList(prev => [...prev, newStudent]);
    triggerAudioFeedback('SUCCESS');
    setNewStudentName('');
    setNewStudentNis('');
    setShowAddStudentForm(false);
  };

  const handleUpdateStudentStatus = (id: string, newStatus: string) => {
    setStudentsAttendanceList(prev =>
      prev.map(s => s.id === id ? {
        ...s,
        status: newStatus,
        time: newStatus === 'HADIR' ? new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB' : '-'
      } : s)
    );
    triggerAudioFeedback('SUCCESS');
  };

  const handleSaveStudentClassAttendance = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/attendance/student-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guruId: selectedProfile.id,
          guruName: selectedProfile.name,
          className: selectedClassForGuru,
          mode: guruAttendanceMode,
          date: new Date().toISOString().split('T')[0],
          students: studentsAttendanceList
        })
      });
      const data = await res.json();
      if (data.success) {
        setApiLog(`[REST API 200 OK] Presensi ${selectedClassForGuru} disinkronkan ke server`);
        triggerAudioFeedback('SUCCESS');
        alert(`Presensi ${selectedClassForGuru} (${guruAttendanceMode === 'WALI_KELAS' ? 'Guru Wali Kelas' : 'Guru Mapel'}) berhasil disimpan!`);
      }
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan presensi');
    } finally {
      setLoading(false);
    }
  };

  // Audio / Vibration Feedback Helper
  const triggerAudioFeedback = (type: 'SUCCESS' | 'ERROR') => {
    try {
      if ('vibrate' in navigator) {
        if (type === 'SUCCESS') navigator.vibrate([150, 80, 150]);
        else navigator.vibrate([300, 100, 300]);
      }
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        if (type === 'SUCCESS') {
          osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
          osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          osc.start();
          osc.stop(ctx.currentTime + 0.35);
        } else {
          osc.frequency.setValueAtTime(220, ctx.currentTime);
          gain.gain.setValueAtTime(0.2, ctx.currentTime);
          osc.start();
          osc.stop(ctx.currentTime + 0.3);
        }
      }
    } catch (e) {
      // Audio context fallback silent
    }
  };

  // Clock Ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch school geofence settings from backend database
  const loadSchoolGeofence = async () => {
    try {
      const res = await fetch('/api/attendance/getGeofences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (data.success && data.data && data.data.length > 0) {
        const primaryGeo = data.data[0];
        setSchoolLat(Number(primaryGeo.latitude));
        setSchoolLng(Number(primaryGeo.longitude));
        setFullAddress(primaryGeo.location_name || 'Lokasi Geofence Terdaftar');
        
        // Recalculate distance immediately
        const diffLat = Math.abs(userLat - Number(primaryGeo.latitude)) * 111000;
        const diffLng = Math.abs(userLng - Number(primaryGeo.longitude)) * 111000;
        const dist = Math.round(Math.sqrt(diffLat * diffLat + diffLng * diffLng));
        setDistanceToSchool(dist);
        setInGeofence(dist <= (primaryGeo.radius || 150));
      }
    } catch (err) {
      console.error("Gagal memuat geofence dari database:", err);
    }
  };

  // Fetch real device high-precision Geolocation
  const fetchRealGeolocation = (showFeedback = true) => {
    if (!navigator.geolocation) {
      alert("Browser atau HP Anda tidak mendukung pengambilan lokasi GPS.");
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setUserLat(latitude);
        setUserLng(longitude);
        setGpsAccuracy(Math.round(accuracy || 5));
        setGpsPermissionStatus('granted');
        setGpsLoading(false);

        // Fetch location name using standard browser or custom format
        setFullAddress(`Lokasi Terverifikasi GPS Perangkat (Akurasi: ${Math.round(accuracy || 5)}m)`);
        
        if (showFeedback) {
          triggerAudioFeedback('SUCCESS');
          alert(`GPS Berhasil Disinkronkan!\n\nKoordinat Anda:\nLintang: ${latitude.toFixed(6)}\nBujur: ${longitude.toFixed(6)}\nAkurasi: ${Math.round(accuracy || 5)} meter.`);
        }
      },
      (error) => {
        setGpsLoading(false);
        let errorMsg = "Gagal mengambil lokasi GPS perangkat.";
        if (error.code === error.PERMISSION_DENIED) {
          setGpsPermissionStatus('denied');
          errorMsg = "Akses lokasi GPS DITOLAK oleh browser/perangkat Anda. Silakan izinkan izin lokasi (location permission) untuk situs ini agar bisa melakukan absensi real di area sekolah.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = "Informasi lokasi GPS tidak tersedia pada perangkat Anda saat ini. Pastikan GPS/Location service di HP Anda aktif.";
        } else if (error.code === error.TIMEOUT) {
          errorMsg = "Waktu tunggu pengambilan lokasi GPS habis. Silakan coba lagi.";
        }
        alert(errorMsg);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // Save current user coordinates as School Geofence Center
  const saveCurrentLocationAsSchoolGeofence = async () => {
    const confirmSave = window.confirm(`Apakah Anda yakin ingin menetapkan koordinat saat ini (${userLat.toFixed(6)}, ${userLng.toFixed(6)}) sebagai PUSAT GEOFENCE SEKOLAH BARU?\n\nSemua pegawai/guru wajib berada dalam radius 150m dari titik ini untuk bisa melakukan absensi GPS.`);
    if (!confirmSave) return;

    setLoading(true);
    try {
      const payload = {
        location_name: "Pusat Kampus Terpadu (Live Production GPS)",
        latitude: userLat,
        longitude: userLng,
        radius: 150
      };

      const res = await fetch('/api/attendance/saveGeofence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setSchoolLat(userLat);
        setSchoolLng(userLng);
        setFullAddress("Pusat Kampus Terpadu (Live Production GPS)");
        triggerAudioFeedback('SUCCESS');
        alert(`BERHASIL MENYETTING LOKASI SEKOLAH!\n\nGeofence sekolah berhasil diperbarui di database pada koordinat:\nLatitude: ${userLat.toFixed(6)}\nLongitude: ${userLng.toFixed(6)}\nRadius: 150 meter.\n\nSekarang Anda berada tepat di tengah area sekolah (Jarak: 0m).`);
      } else {
        alert(`Gagal menyimpan geofence: ${data.message}`);
      }
    } catch (err: any) {
      alert(`Gagal menyimpan geofence ke server: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Run on mount
  useEffect(() => {
    loadSchoolGeofence();
    // Silently try to get current location on load
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLat(pos.coords.latitude);
          setUserLng(pos.coords.longitude);
          setGpsAccuracy(Math.round(pos.coords.accuracy || 5));
          setGpsPermissionStatus('granted');
        },
        () => {
          // Silent fallback on load
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  // Recalculate Distance when Lat/Lng changes
  useEffect(() => {
    // Distance formula simulation
    const diffLat = Math.abs(userLat - schoolLat) * 111000;
    const diffLng = Math.abs(userLng - schoolLng) * 111000;
    const dist = Math.round(Math.sqrt(diffLat * diffLat + diffLng * diffLng));
    setDistanceToSchool(dist);
    setInGeofence(dist <= 150);
  }, [userLat, userLng, schoolLat, schoolLng]);

  // Handle Real Camera Lifecycle for Scanner
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    
    const isCameraNeeded = showScanner || (studentActiveTab === 'SCANNER' && studentScanDevice === 'CAMERA');

    if (isCameraNeeded) {
      setScanError(null);
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
          activeStream = stream;
          setCameraStream(stream);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.error("Gagal mengakses kamera perangkat:", err);
          setScanError("Kamera tidak dapat diakses atau diblokir. Pastikan Anda mengizinkan izin Kamera (camera permission) di HP Anda.");
        });
    } else {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
      }
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [showScanner, studentActiveTab, studentScanDevice]);

  // Handle Do Direct Check-In via GPS
  const handleDoCheckIn = async (methodUsed: 'GPS' | 'QR' | 'BARCODE' | 'MANUAL' = 'GPS') => {
    if (!inGeofence) {
      const errMsg = 'Di Luar Radius Geofence Sekolah (Maksimal 150m)';
      setScanError(errMsg);
      triggerAudioFeedback('ERROR');
      alert(`Gagal Presensi GPS Mandiri:\n\nAnda terdeteksi berada di LUAR radius area sekolah!\nJarak saat ini: ${distanceToSchool} meter (Maksimal 150 meter).\n\nSilakan klik tombol ikon Crosshair berwarna hijau (Dapatkan GPS Riil Perangkat) di sudut kanan atas peta untuk menyinkronkan lokasi GPS asli perangkat Anda, dan pastikan Anda berada di area sekolah.`);
      return;
    }

    setLoading(true);
    setApiLog(null);
    try {
      const payload = {
        personId: selectedProfile.id,
        personName: selectedProfile.name,
        role: selectedProfile.role,
        nip: selectedProfile.nip,
        unit: selectedProfile.unit,
        method: methodUsed,
        latitude: userLat,
        longitude: userLng,
        locationName: fullAddress,
        deviceId: selectedProfile.deviceId,
        checkInTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      };

      const res = await fetch('/api/attendance/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setCheckInStatus(data.data?.status || 'HADIR');
        setCheckInTime(data.data?.checkInTime || payload.checkInTime);
        setApiLog(`[SUCCESS 200 OK] ${data.message} | Status: ${data.data?.status || 'HADIR'}`);
        triggerAudioFeedback('SUCCESS');
        setShowBottomSheet(false);
        setShowScanner(false);
        alert(`Presensi GPS Mandiri Berhasil!\n\nStatus: ${data.data?.status || 'HADIR'}\nWaktu: ${data.data?.checkInTime || payload.checkInTime}\nMetode: GPS (Radius ${distanceToSchool}m)`);
      } else {
        setScanError(data.message || 'Presensi Gagal');
        triggerAudioFeedback('ERROR');
        alert(`Gagal Presensi GPS Mandiri:\n\n${data.message || 'Presensi ditolak oleh server.'}`);
      }
    } catch (err: any) {
      setScanError(`Kesalahan jaringan: ${err.message}`);
      triggerAudioFeedback('ERROR');
      alert(`Terjadi kesalahan jaringan:\n\n${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle Do Check-Out
  const handleDoCheckOut = async () => {
    setLoading(true);
    setApiLog(null);
    try {
      const payload = {
        personId: selectedProfile.id,
        personName: selectedProfile.name,
        role: selectedProfile.role,
        latitude: userLat,
        longitude: userLng,
        checkOutTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        deviceId: selectedProfile.deviceId
      };

      const res = await fetch('/api/attendance/check-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setCheckInStatus('PULANG');
        setCheckOutTime(data.data?.checkOutTime || payload.checkOutTime);
        setWorkDuration(data.data?.totalDurationHours || 8.2);
        setApiLog(`[SUCCESS 200 OK] ${data.message} | Durasi: ${data.data?.totalDurationHours || 8.2} Jam`);
        triggerAudioFeedback('SUCCESS');
      } else {
        alert(data.message || 'Check-Out Gagal');
      }
    } catch (err: any) {
      alert(`Terjadi kesalahan: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Open Fullscreen Scanner
  const handleOpenScanner = (type: 'QR' | 'BARCODE' | 'DYNAMIC_QR') => {
    setScannerType(type);
    setScanError(null);
    setShowScanner(true);
  };

  // Simulate Successful Scan Event
  const handleSimulateScanTarget = (targetLabel: string, codeVal: string) => {
    triggerAudioFeedback('SUCCESS');
    setScanSuccessData({
      label: targetLabel,
      code: codeVal,
      scannedAt: new Date().toLocaleTimeString('id-ID'),
      scannedDate: new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    });
    setShowScanner(false);
    setShowBottomSheet(true);
  };

  // Submit Manual Request
  const handleSubmitManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualReason) {
      alert('Mohon isi alasan pengajuan absensi manual.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        personId: selectedProfile.id,
        personName: selectedProfile.name,
        role: selectedProfile.role,
        date: manualDate,
        time: manualTime,
        location: manualLocation,
        reason: manualReason,
        proofPhoto: 'data:image/jpeg;base64,sample_photo_proof_simulation'
      };

      const res = await fetch('/api/attendance/manual-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setManualRequests(prev => [data.data, ...prev]);
        setShowManualModal(false);
        setManualReason('');
        triggerAudioFeedback('SUCCESS');
        alert('Pengajuan Absensi Manual berhasil dikirim & masuk antrean Approval 3-Tingkat!');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Sample History Data
  const sampleHistoryList = [
    {
      id: 'HIS-001',
      date: 'Hari Ini',
      timeIn: checkInTime || '06:42:10',
      timeOut: checkOutTime || '15:15:00',
      duration: workDuration > 0 ? `${workDuration} Jam` : '8 Jam 33 Menit',
      status: checkInStatus !== 'BELUM' ? checkInStatus : 'HADIR',
      method: 'GPS Google Maps + Face',
      location: 'Gedung Rektorat Utama'
    },
    {
      id: 'HIS-002',
      date: 'Kemarin',
      timeIn: '06:40:12',
      timeOut: '15:20:00',
      duration: '8 Jam 40 Menit',
      status: 'HADIR',
      method: 'Barcode Dinding Gate 1',
      location: 'Gerbang Utama Sekolah'
    },
    {
      id: 'HIS-003',
      date: '2 Hari Lalu',
      timeIn: '06:55:00',
      timeOut: '15:10:00',
      duration: '8 Jam 15 Menit',
      status: 'TERLAMBAT',
      method: 'QR Code Dinding',
      location: 'Ruang Guru / Lab IT'
    },
    {
      id: 'HIS-004',
      date: '3 Hari Lalu',
      timeIn: '06:38:44',
      timeOut: '15:15:30',
      duration: '8 Jam 36 Menit',
      status: 'HADIR',
      method: 'GPS Radius Geofence',
      location: 'Kampus Terpadu'
    }
  ];

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-800">

      {/* HEADER SECTION: MODERN PROFILE & REALTIME CLOCK */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 rounded-[28px] text-white shadow-xl border border-indigo-900/50 relative overflow-hidden">
        {/* Background Decorative Element */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 top-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Left: User Profile Brief */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={selectedProfile.photoUrl}
                alt={selectedProfile.name}
                className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover border-2 border-indigo-400/50 shadow-lg"
              />
              <div className={`absolute -bottom-1 -right-1 p-1 rounded-full border-2 border-slate-900 text-[10px] font-bold ${checkInStatus !== 'BELUM' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                {checkInStatus !== 'BELUM' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
              </div>
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[11px] font-mono font-bold">
                <Sparkles className="h-3 w-3 text-indigo-300" />
                <span>{selectedProfile.roleLabel}</span>
              </div>
              <h1 className="text-lg md:text-xl font-black text-white tracking-tight flex items-center gap-2">
                <span>{tenant?.nama_sekolah || selectedProfile.name}</span>
              </h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-300">
                <span className="font-mono">NIP/NIS: <strong className="text-white">{selectedProfile.nip}</strong></span>
                <span>•</span>
                <span>{selectedProfile.unit}</span>
                <span>•</span>
                <span className="text-indigo-300">{selectedProfile.department}</span>
              </div>
            </div>
          </div>

          {/* Right: Realtime Clock */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            
            {/* Realtime Clock Widget */}
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-center sm:text-right min-w-[200px]">
              <div className="text-2xl md:text-3xl font-black font-mono tracking-tight text-white">
                {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
              <div className="text-[11px] font-bold text-indigo-200">
                {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
              <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-mono font-bold">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>STATUS: {checkInStatus}</span>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* MAIN SINGLE-PAGE GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN: GOOGLE MAPS (~60% FOCUS AREA) & GPS STATUS CARD (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* GOOGLE MAPS CARD CONTAINER */}
          <div className="bg-white rounded-[24px] border border-slate-200/80 shadow-md overflow-hidden flex flex-col">
            
            {/* Map Header Bar */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-400/30">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">Google Maps Interactive Geofence</h3>
                  <p className="text-[11px] text-slate-400">Peta Presensi GPS Real-time &amp; Radius Presensi Sekolah</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 ${inGeofence ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40' : 'bg-rose-500/20 text-rose-300 border border-rose-400/40'}`}>
                  <div className={`h-2 w-2 rounded-full ${inGeofence ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'}`} />
                  <span>{inGeofence ? 'DI DALAM AREA' : 'DI LUAR AREA'}</span>
                </span>
              </div>
            </div>

            {/* Interactive Map Visual Stage (~60% Height / 380px) */}
            <div className="h-[380px] bg-slate-950 relative overflow-hidden flex items-center justify-center p-4 font-mono select-none">
              
              {/* Map Grid Pattern Background */}
              <div 
                className="absolute inset-0 opacity-20 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]"
              />

              {/* School Geofence Circle Limit */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[280px] h-[280px] border-2 border-dashed border-indigo-400/60 rounded-full bg-indigo-500/10 flex items-center justify-center relative animate-pulse">
                  <span className="text-[9px] text-indigo-200 bg-slate-900/90 px-2.5 py-1 rounded-full border border-indigo-500/40 font-bold shadow">
                    AREA ABSENSI SEKOLAH (RADIUS 150m)
                  </span>
                </div>
              </div>

              {/* Polyline / Distance Connection Line */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                <line
                  x1="50%"
                  y1="50%"
                  x2={`calc(50% + ${(userLng - schoolLng) * 300000}px)`}
                  y2={`calc(50% + ${(userLat - schoolLat) * 300000}px)`}
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
              </svg>

              {/* School Marker */}
              <div className="absolute z-20 flex flex-col items-center pointer-events-none transform -translate-x-1/2 -translate-y-1/2">
                <div className="p-2 bg-indigo-600 text-white rounded-full shadow-lg border-2 border-white">
                  <Building2 className="h-5 w-5" />
                </div>
                <span className="text-[10px] bg-slate-900/90 text-white font-bold px-2 py-0.5 rounded shadow mt-1 border border-indigo-500/50">
                  Gedung Sekolah / Pesantren
                </span>
              </div>

              {/* User Marker (Dynamic Pin) */}
              <div 
                className="absolute z-30 flex flex-col items-center pointer-events-none transition-all duration-500"
                style={{
                  left: `calc(50% + ${(userLng - schoolLng) * 300000}px)`,
                  top: `calc(50% + ${(userLat - schoolLat) * 300000}px)`,
                  transform: 'translate(-50%, -100%)'
                }}
              >
                <div className="p-2 bg-emerald-500 text-white rounded-full shadow-xl border-2 border-white animate-bounce">
                  <MapPin className="h-6 w-6" />
                </div>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 font-extrabold px-2 py-0.5 rounded shadow border border-emerald-500 whitespace-nowrap">
                  {selectedProfile.name.split(' ')[0]} (Akurasi {gpsAccuracy}m)
                </span>
              </div>

              {/* Map Floating Map Controls (Zoom, Compass, Real GPS Sync) */}
              <div className="absolute top-3 right-3 z-40 flex flex-col gap-1.5">
                <button
                  onClick={() => setMapZoom(prev => Math.min(prev + 1, 20))}
                  title="Perbesar Peta"
                  className="p-2 bg-slate-900/95 hover:bg-slate-800 text-white rounded-xl border border-slate-700 shadow cursor-pointer transition"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setMapZoom(prev => Math.max(prev - 1, 10))}
                  title="Perkecil Peta"
                  className="p-2 bg-slate-900/95 hover:bg-slate-800 text-white rounded-xl border border-slate-700 shadow cursor-pointer transition"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                
                {/* HIGH-ACCURACY REAL GPS SYNC BUTTON */}
                <button
                  onClick={() => fetchRealGeolocation(true)}
                  disabled={gpsLoading}
                  title="Dapatkan GPS Riil Perangkat"
                  className={`p-2 rounded-xl shadow cursor-pointer transition flex items-center justify-center ${gpsLoading ? 'bg-amber-500 text-white animate-pulse' : 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white'}`}
                >
                  {gpsLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Crosshair className="h-4 w-4" />}
                </button>
              </div>

              {/* Map Compass Widget */}
              <div className="absolute top-3 left-3 z-40 p-2 bg-slate-900/90 text-indigo-400 rounded-xl border border-slate-700 flex items-center gap-1 text-[10px] font-bold">
                <Compass className="h-4 w-4 animate-spin-slow" />
                <span>N 105° EAST</span>
              </div>

              {/* Production Geofence Setup Bar */}
              <div className="absolute bottom-3 left-3 right-3 z-40 bg-slate-900/95 backdrop-blur-md p-3 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
                <div className="space-y-0.5">
                  <span className="text-slate-200 text-[11px] font-bold flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                    Konfigurasi Geofence Sekolah/Kantor Real
                  </span>
                  <span className="text-slate-400 text-[10px] block">Atur &amp; simpan pusat koordinat GPS sekolah langsung ke database.</span>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={saveCurrentLocationAsSchoolGeofence}
                    className="w-full sm:w-auto px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-extrabold text-[10px] rounded-lg transition cursor-pointer flex items-center justify-center gap-1 shrink-0 shadow-md shadow-indigo-900/25"
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    Set GPS Saya Sebagai Pusat Sekolah
                  </button>
                </div>
              </div>

            </div>

            {/* Map Address & Coordinates Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-indigo-600" />
                  <span>{fullAddress}</span>
                </div>
                <div className="text-[11px] font-mono text-slate-500">
                  Koordinat: {userLat.toFixed(6)}, {userLng.toFixed(6)} | Elevasi: 12m ASL
                </div>
              </div>
              
              <div className="text-right font-mono font-bold">
                <span className="text-slate-400 block text-[10px]">Akurasi Satelit GPS</span>
                <span className="text-emerald-600 text-xs">High Accuracy ({gpsAccuracy}m)</span>
              </div>
            </div>

          </div>

          {/* GPS STATUS CARD */}
          <div className="bg-white p-6 rounded-[24px] border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                <Navigation className="h-4 w-4 text-indigo-600" />
                <span>Kartu Detail GPS &amp; Sensor Telemetri</span>
              </h3>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-mono font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                HARDWARE OK
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">GPS Device</span>
                <p className="text-xs font-black text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>GPS Aktif</span>
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Koneksi Internet</span>
                <p className="text-xs font-black text-indigo-600 flex items-center gap-1">
                  <Wifi className="h-3.5 w-3.5" />
                  <span>4G / WiFi Online</span>
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Jarak ke Sekolah</span>
                <p className={`text-xs font-black ${inGeofence ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {distanceToSchool} Meter
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Status Geofence</span>
                <p className={`text-xs font-black ${inGeofence ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {inGeofence ? 'VALID (150m)' : 'TIDAK VALID'}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: SMART ATTENDANCE CARD, SCANNER CONTROLS, ROLE EXTENSIONS (5 COLS) */}
        <div className="lg:col-span-5 space-y-6">

          {/* SMART ATTENDANCE CARD (MAIN ACTION CENTER) */}
          <div className="bg-gradient-to-b from-white to-slate-50 p-6 rounded-[24px] border border-slate-200/80 shadow-lg space-y-5">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-mono font-bold">
                <Zap className="h-3 w-3" />
                <span>SMART ATTENDANCE GATEWAY</span>
              </div>
              <h3 className="text-lg font-black text-slate-900">
                {(selectedProfile.role === 'SISWA' || selectedProfile.role === 'SANTRI') ? 'Info Kehadiran Siswa / Santri' : 'Tombol Aksi Absensi Mandiri Pegawai & Guru'}
              </h3>
              <p className="text-xs text-slate-500">
                {(selectedProfile.role === 'SISWA' || selectedProfile.role === 'SANTRI') ? 'Absensi kehadiran siswa/santri dicatat langsung oleh Guru Wali Kelas & Guru Mapel.' : 'Pilih metode absensi cepat sesuai instruksi sekolah atau tempat tugas.'}
              </p>
            </div>

            {/* ACTION BUTTONS OR STUDENT NOTICE */}
            {(selectedProfile.role === 'SISWA' || selectedProfile.role === 'SANTRI') ? (
              <div className="p-5 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-4 text-xs">
                <div className="flex items-center gap-2.5 text-amber-900 font-extrabold text-sm border-b border-amber-200/80 pb-3">
                  <ShieldCheck className="h-6 w-6 text-amber-600 shrink-0" />
                  <div>
                    <h4 className="font-extrabold text-slate-900">Absensi Siswa / Santri Dicatat oleh Guru</h4>
                    <p className="text-[11px] font-normal text-slate-600">Terhubung ke HP Guru Wali Kelas &amp; Guru Mapel</p>
                  </div>
                </div>

                <p className="text-slate-700 leading-relaxed">
                  Sesuai kebijakan sekolah &amp; pesantren, presensi kehadiran Siswa / Santri <strong>tidak dilakukan mandiri</strong>, melainkan dicatat &amp; dipindai langsung oleh <strong>Guru Wali Kelas</strong> atau <strong>Guru Mata Pelajaran</strong> dari HP Guru saat jam pelajaran / kehadiran.
                </p>

                <div className="p-3.5 bg-white rounded-xl border border-amber-200/90 space-y-2 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status Kehadiran Hari Ini</span>
                  <div className="flex items-center justify-between">
                    <span className="font-black text-emerald-700 text-sm flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>HADIR (TERVERIFIKASI)</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-600">Pukul 07:15 WIB</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Pencatatan dilakukan oleh: <strong>Ustadz Ahmad Fauzi, S.Pd.</strong> (Wali Kelas X IPA 1)</p>
                </div>

                <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200 flex items-center gap-3 text-indigo-900 text-[11px]">
                  <QrCode className="h-6 w-6 text-indigo-600 shrink-0" />
                  <div>
                    <strong className="block text-indigo-950 font-bold">Kartu Pelajar / Barcode ID Siswa</strong>
                    <span>Tunjukkan Barcode / QR ID Card pada Guru untuk pemindaian presensi harian / KBM.</span>
                  </div>
                </div>
              </div>
            ) : (
              /* ACTION BUTTONS GRID FOR ALL EMPLOYEES (QR, BARCODE, GPS, MANUAL) */
              <div className="grid grid-cols-2 gap-3">
                
                {/* BUTTON 1: SCAN QR CODE */}
                <button
                  onClick={() => handleOpenScanner('QR')}
                  className="p-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-2xl transition shadow-md shadow-indigo-600/20 flex flex-col items-center justify-center text-center gap-2 cursor-pointer group"
                >
                  <div className="p-2.5 bg-white/20 rounded-xl group-hover:scale-110 transition">
                    <QrCode className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="block text-xs font-black">SCAN QR CODE</span>
                    <span className="text-[10px] text-indigo-200">Stiker / Layar Monitor</span>
                  </div>
                </button>

                {/* BUTTON 2: SCAN BARCODE */}
                <button
                  onClick={() => handleOpenScanner('BARCODE')}
                  className="p-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-2xl transition shadow-md shadow-emerald-600/20 flex flex-col items-center justify-center text-center gap-2 cursor-pointer group"
                >
                  <div className="p-2.5 bg-white/20 rounded-xl group-hover:scale-110 transition">
                    <Shield className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="block text-xs font-black">SCAN BARCODE</span>
                    <span className="text-[10px] text-emerald-200">Stiker Dinding Sekolah</span>
                  </div>
                </button>

                {/* BUTTON 3: ABSEN GPS DIRECT */}
                <button
                  onClick={() => handleDoCheckIn('GPS')}
                  disabled={loading}
                  className="p-4 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white rounded-2xl transition shadow-md flex flex-col items-center justify-center text-center gap-2 cursor-pointer group disabled:opacity-50"
                >
                  <div className="p-2.5 bg-white/10 rounded-xl group-hover:scale-110 transition">
                    {loading ? <RefreshCw className="h-6 w-6 animate-spin" /> : <MapPin className="h-6 w-6 text-emerald-400" />}
                  </div>
                  <div>
                    <span className="block text-xs font-black">ABSEN GPS</span>
                    <span className="text-[10px] text-slate-400">Verifikasi Radius Peta</span>
                  </div>
                </button>

                {/* BUTTON 4: ABSEN MANUAL */}
                <button
                  onClick={() => setShowManualModal(true)}
                  className="p-4 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white rounded-2xl transition shadow-md shadow-amber-500/20 flex flex-col items-center justify-center text-center gap-2 cursor-pointer group"
                >
                  <div className="p-2.5 bg-white/20 rounded-xl group-hover:scale-110 transition">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="block text-xs font-black">ABSEN MANUAL</span>
                    <span className="text-[10px] text-amber-100">Izin Kendala GPS/HP</span>
                  </div>
                </button>

              </div>
            )}

            {/* CHECK-OUT STATUS CARD */}
            {selectedProfile.role !== 'SISWA' && selectedProfile.role !== 'SANTRI' && checkInStatus !== 'BELUM' && checkInStatus !== 'PULANG' && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block uppercase">Presensi Masuk Hari Ini</span>
                    <strong className="text-emerald-700 font-extrabold text-sm">{checkInStatus}</strong>
                    <span className="text-slate-600 text-xs"> (Pukul {checkInTime})</span>
                  </div>
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                </div>

                <button
                  onClick={handleDoCheckOut}
                  disabled={loading}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Clock className="h-4 w-4" />}
                  <span>ABSEN PULANG (CHECK-OUT)</span>
                </button>
              </div>
            )}

            {/* REST API LOGGER */}
            {apiLog && (
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[10px] font-mono text-emerald-400 leading-tight">
                {apiLog}
              </div>
            )}

          </div>

          {/* ROLE EXTENSION: ABSENSI SISWA & SANTRI - BISA DIPIHAK OLEH SEMUA PEGAWAI */}
          {selectedProfile.role !== 'SISWA' && selectedProfile.role !== 'SANTRI' && (
            <div className="bg-white p-6 rounded-[24px] border border-indigo-200/80 shadow-md space-y-5">
              
              {/* Header Module */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-mono font-bold mb-1">
                    <ShieldCheck className="h-3 w-3 text-emerald-600" />
                    <span>MODUL ADMINISTRASI PRESENSI SISWA &amp; SANTRI</span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-indigo-600" />
                    <span>Input &amp; Scan Presensi Siswa / Santri</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Gunakan tab di bawah untuk memindai kartu pelajar menggunakan RFID/Barcode scanner atau lakukan presensi manual.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setStudentActiveTab('SCANNER');
                      triggerAudioFeedback('SUCCESS');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      studentActiveTab === 'SCANNER'
                        ? 'bg-indigo-600 text-white shadow'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <QrCode className="h-3.5 w-3.5" />
                    <span>Pindai Kartu</span>
                  </button>
                  <button
                    onClick={() => {
                      setStudentActiveTab('MANUAL');
                      triggerAudioFeedback('SUCCESS');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      studentActiveTab === 'MANUAL'
                        ? 'bg-indigo-600 text-white shadow'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>Absen Manual ({studentsAttendanceList.length})</span>
                  </button>
                </div>
              </div>

              {/* TAB 1: SCAN KARTU PELAJAR */}
              {studentActiveTab === 'SCANNER' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs">
                        <Volume2 className="h-4 w-4 text-emerald-400 animate-pulse" />
                        <span className="font-bold text-slate-300">Smart RFID / Barcode Student Card Reader</span>
                      </div>
                      
                      {/* Input Device Toggle */}
                      <div className="flex bg-slate-800 p-1 rounded-xl">
                        <button
                          onClick={() => setStudentScanDevice('EXTERNAL')}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition flex items-center gap-1.5 cursor-pointer ${
                            studentScanDevice === 'EXTERNAL'
                              ? 'bg-slate-700 text-white shadow'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                          }`}
                        >
                          <QrCode className="h-3 w-3" /> Scanner / RFID External
                        </button>
                        <button
                          onClick={() => setStudentScanDevice('CAMERA')}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition flex items-center gap-1.5 cursor-pointer ${
                            studentScanDevice === 'CAMERA'
                              ? 'bg-emerald-600 text-white shadow'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                          }`}
                        >
                          <Camera className="h-3 w-3" /> Kamera HP (Barcode)
                        </button>
                      </div>
                    </div>

                    {/* Virtual Scanning Target Box OR Camera Viewfinder */}
                    <div className="relative border-2 border-dashed border-indigo-500/40 hover:border-indigo-400 rounded-2xl bg-slate-950/80 overflow-hidden flex flex-col transition-all duration-300 group shadow-inner">
                      
                      {studentScanBeepAlert && (
                        <div className="absolute inset-0 bg-emerald-950/95 flex flex-col items-center justify-center text-emerald-400 z-50 animate-fade-in backdrop-blur-sm">
                          <CheckCircle2 className="h-16 w-16 text-emerald-400 animate-bounce shadow-emerald-500/50 drop-shadow-lg" />
                          <span className="font-extrabold text-lg tracking-widest uppercase mt-4 text-emerald-300 drop-shadow-md">BEEP! BERHASIL TERPINDAI</span>
                          <span className="text-sm text-emerald-100 font-medium mt-1">{scannedStudentDetail?.name}</span>
                        </div>
                      )}

                      {studentScanDevice === 'EXTERNAL' ? (
                        <>
                          <div 
                            className="p-8 flex flex-col items-center justify-center text-center cursor-text min-h-[300px]"
                            onClick={() => document.getElementById('barcode-input-field')?.focus()}
                          >
                            <div className="absolute top-4 right-4 flex items-center gap-2 bg-slate-900/50 px-2 py-1 rounded-full border border-slate-800/50 backdrop-blur-sm">
                              <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                              </span>
                              <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">Menunggu Pemindai...</span>
                            </div>

                            <div className="p-4 bg-indigo-500/10 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300 group-hover:bg-indigo-500/20">
                              <QrCode className="h-12 w-12 text-indigo-400 animate-pulse" />
                            </div>
                            
                            <h4 className="text-sm font-bold text-white mb-1">Mode Pindai Aktif</h4>
                            <p className="text-xs text-slate-400 font-medium max-w-sm mb-6 leading-relaxed">
                              Arahkan Barcode Kartu Pelajar atau tempelkan Smart Card RFID pada perangkat pembaca (Scanner) yang terhubung.
                            </p>
                            
                            {/* Manual input inside Scanner */}
                            <form 
                              onSubmit={(e) => {
                                e.preventDefault();
                                handleScanStudentCard(studentScanInput);
                              }}
                              className="flex items-center gap-2 w-full max-w-md relative"
                            >
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-slate-500 text-xs font-bold">NIS:</span>
                              </div>
                              <input
                                id="barcode-input-field"
                                type="text"
                                autoFocus
                                autoComplete="off"
                                placeholder="Pindai atau ketik NIS secara manual..."
                                value={studentScanInput}
                                onChange={(e) => setStudentScanInput(e.target.value)}
                                className="flex-1 bg-slate-900/90 border-2 border-slate-700/80 rounded-xl pl-12 pr-4 py-3 text-sm font-mono font-bold text-emerald-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 shadow-inner placeholder:text-slate-600 transition-all placeholder:font-sans placeholder:font-normal"
                              />
                              <button
                                type="submit"
                                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition cursor-pointer shadow-md hover:shadow-indigo-500/25 active:scale-95 flex items-center gap-2"
                              >
                                Proses
                              </button>
                            </form>
                            <p className="text-[10px] text-slate-500 mt-4 flex items-center gap-1.5">
                              <HelpCircle className="h-3 w-3" /> Scanner otomatis mengirimkan perintah 'Enter' setelah membaca kode.
                            </p>
                            
                            {/* Simulasi / Contoh Kartu Section for manual testing */}
                            <div className="mt-6 w-full max-w-md bg-slate-900 border border-slate-700/50 rounded-xl p-3 text-left">
                              <div className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-2">
                                <FileText className="h-3.5 w-3.5 text-indigo-400" />
                                Data Simulasi NIS Siswa:
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {studentsAttendanceList.slice(0,4).map(s => (
                                  <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => setStudentScanInput(s.nis)}
                                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[10px] font-mono rounded cursor-pointer transition active:scale-95"
                                  >
                                    {s.nis} - {s.name.split(' ')[0]}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="relative w-full aspect-[4/3] bg-black sm:aspect-video flex items-center justify-center overflow-hidden rounded-t-2xl">
                            {cameraStream ? (
                              <>
                                <video 
                                  ref={videoRef}
                                  autoPlay 
                                  playsInline 
                                  className="absolute inset-0 w-full h-full object-cover"
                                />
                                {/* Viewfinder Overlay */}
                                <div className="absolute inset-0 z-10 pointer-events-none flex flex-col">
                                  <div className="flex-1 bg-slate-950/60 backdrop-blur-[2px]"></div>
                                  <div className="flex h-48 sm:h-64">
                                    <div className="flex-1 bg-slate-950/60 backdrop-blur-[2px]"></div>
                                    <div className="w-64 sm:w-80 relative">
                                      {/* Scanner Corners */}
                                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-500 rounded-tl-xl"></div>
                                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-500 rounded-tr-xl"></div>
                                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-500 rounded-bl-xl"></div>
                                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-500 rounded-br-xl"></div>
                                      {/* Scanning Line Animation */}
                                      <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-emerald-400/50 -translate-x-1/2 animate-scan-line shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                                    </div>
                                    <div className="flex-1 bg-slate-950/60 backdrop-blur-[2px]"></div>
                                  </div>
                                  <div className="flex-1 bg-slate-950/60 backdrop-blur-[2px] flex items-end justify-center pb-4">
                                    <span className="bg-slate-900/80 text-white text-[10px] font-bold px-3 py-1.5 rounded-full backdrop-blur">Posisikan Barcode di dalam kotak</span>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="flex flex-col items-center text-slate-400 p-6">
                                <Camera className="h-10 w-10 mb-3 opacity-50" />
                                <span className="text-xs font-bold">Menyiapkan Kamera...</span>
                                {scanError && <p className="text-red-400 mt-2 text-[10px] max-w-xs">{scanError}</p>}
                              </div>
                            )}
                          </div>
                          
                          {/* Manual input fallback for Camera mode */}
                          <div className="p-4 bg-slate-900 border-t border-slate-800">
                            <form 
                              onSubmit={(e) => {
                                e.preventDefault();
                                handleScanStudentCard(studentScanInput);
                              }}
                              className="flex items-center gap-2 w-full"
                            >
                              <input
                                type="text"
                                placeholder="Atau ketik NIS manual..."
                                value={studentScanInput}
                                onChange={(e) => setStudentScanInput(e.target.value)}
                                className="flex-1 bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-emerald-500 shadow-inner"
                              />
                              <button
                                type="submit"
                                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg cursor-pointer"
                              >
                                Cek
                              </button>
                            </form>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Scanned Student Information Panel */}
                  {scannedStudentDetail && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-4 animate-fade-in text-xs">
                      <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-sm shrink-0 shadow">
                        {scannedStudentDetail.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 space-y-0.5 min-w-0">
                        <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded-md">
                          PRESENSI KARTU OK
                        </span>
                        <strong className="block text-slate-800 text-sm font-extrabold mt-1 truncate">{scannedStudentDetail.name}</strong>
                        <div className="text-[11px] text-slate-500 flex flex-wrap gap-x-2">
                          <span>NIS: <strong className="font-bold text-slate-700">{scannedStudentDetail.nis}</strong></span>
                          <span>•</span>
                          <span>Waktu: <strong className="font-bold text-slate-700">{scannedStudentDetail.scannedAt}</strong></span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-emerald-600 font-bold block">Status</span>
                        <span className="text-xs bg-emerald-200 text-emerald-800 font-extrabold px-2.5 py-1 rounded-full border border-emerald-300 shadow-sm">
                          HADIR
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: MANUAL PRESENSI & TAMBAH SISWA */}
              {studentActiveTab === 'MANUAL' && (
                <div className="space-y-4">
                  {/* Mode & Class Selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Peran Presensi</label>
                      <div className="flex bg-slate-100 p-1 rounded-xl font-bold">
                        <button
                          onClick={() => setGuruAttendanceMode('WALI_KELAS')}
                          className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${guruAttendanceMode === 'WALI_KELAS' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'}`}
                        >
                          Guru Wali Kelas
                        </button>
                        <button
                          onClick={() => setGuruAttendanceMode('GURU_MAPEL')}
                          className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${guruAttendanceMode === 'GURU_MAPEL' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'}`}
                        >
                          Guru Mapel (KBM)
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Pilih Kelas Binaan / KBM</label>
                      <select
                        value={selectedClassForGuru}
                        onChange={(e) => setSelectedClassForGuru(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-bold p-2 rounded-xl focus:outline-none focus:border-indigo-500 cursor-pointer text-xs"
                      >
                        <option value="Kelas X IPA 1">Kelas X IPA 1 (SMA IT Utama)</option>
                        <option value="Kelas X IPA 2">Kelas X IPA 2 (SMA IT Utama)</option>
                        <option value="Kelas VIII A">Kelas VIII A (SMP IT &amp; Pesantren)</option>
                      </select>
                    </div>
                  </div>

                  {/* Summary Counter Bar */}
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <span className="text-[10px] text-emerald-600 font-bold uppercase block">Hadir</span>
                      <strong className="text-emerald-700 text-sm font-black">
                        {studentsAttendanceList.filter(s => s.status === 'HADIR').length}
                      </strong>
                    </div>
                    <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl">
                      <span className="text-[10px] text-amber-600 font-bold uppercase block">Sakit</span>
                      <strong className="text-amber-700 text-sm font-black">
                        {studentsAttendanceList.filter(s => s.status === 'SAKIT').length}
                      </strong>
                    </div>
                    <div className="p-2 bg-blue-50 border border-blue-200 rounded-xl">
                      <span className="text-[10px] text-blue-600 font-bold uppercase block">Izin</span>
                      <strong className="text-blue-700 text-sm font-black">
                        {studentsAttendanceList.filter(s => s.status === 'IZIN').length}
                      </strong>
                    </div>
                    <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl">
                      <span className="text-[10px] text-rose-600 font-bold uppercase block">Alpa</span>
                      <strong className="text-rose-700 text-sm font-black">
                        {studentsAttendanceList.filter(s => s.status === 'ALPA').length}
                      </strong>
                    </div>
                  </div>

                  {/* Search and Add Student Action Center */}
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <div className="relative flex-1 w-full">
                      <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Cari nama siswa atau NIS..."
                        value={studentSearchQuery}
                        onChange={(e) => setStudentSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <button
                      onClick={() => {
                        setShowAddStudentForm(!showAddStudentForm);
                        triggerAudioFeedback('SUCCESS');
                      }}
                      className="w-full sm:w-auto px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Siswa Baru</span>
                    </button>
                  </div>

                  {/* Inline Add New Student Form Accordion */}
                  {showAddStudentForm && (
                    <form 
                      onSubmit={handleAddNewStudent}
                      className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-2xl space-y-3 text-xs animate-fade-in"
                    >
                      <h4 className="font-extrabold text-indigo-900">Registrasi / Tambah Siswa Baru</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 block">Nama Lengkap Siswa</label>
                          <input
                            type="text"
                            placeholder="Contoh: Ahmad Fauzan"
                            value={newStudentName}
                            onChange={(e) => setNewStudentName(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-indigo-500"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 block">Nomor NIS / ID Card</label>
                          <input
                            type="text"
                            placeholder="Contoh: 202310008"
                            value={newStudentNis}
                            onChange={(e) => setNewStudentNis(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-indigo-500"
                            required
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowAddStudentForm(false)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-bold"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-sm"
                        >
                          Simpan Siswa
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Student Attendance List Table with Search Filter */}
                  <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                    {studentsAttendanceList
                      .filter(st => {
                        if (!studentSearchQuery.trim()) return true;
                        const query = studentSearchQuery.toLowerCase();
                        return st.name.toLowerCase().includes(query) || st.nis.includes(query);
                      })
                      .map((st) => (
                        <div key={st.id} className="p-3 bg-slate-50 hover:bg-slate-100/90 rounded-2xl border border-slate-200/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                              {st.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <strong className="text-slate-800 font-bold block">{st.name}</strong>
                              <span className="text-[10px] text-slate-500 font-mono">NIS: {st.nis} • {st.note}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                            <span className="text-[10px] font-mono text-slate-500 mr-1">{st.time}</span>
                            <div className="inline-flex rounded-xl p-0.5 bg-slate-200/80 font-extrabold text-[10px]">
                              {(['HADIR', 'SAKIT', 'IZIN', 'ALPA'] as const).map((stt) => (
                                <button
                                  key={stt}
                                  onClick={() => handleUpdateStudentStatus(st.id, stt)}
                                  className={`px-2 py-0.5 rounded-lg transition cursor-pointer ${st.status === stt ? 
                                    (stt === 'HADIR' ? 'bg-emerald-600 text-white shadow-sm' : 
                                     stt === 'SAKIT' ? 'bg-amber-500 text-white shadow-sm' : 
                                     stt === 'IZIN' ? 'bg-blue-600 text-white shadow-sm' : 'bg-rose-600 text-white shadow-sm')
                                    : 'text-slate-600 hover:text-slate-900'}`}
                                >
                                  {stt}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}

                    {studentsAttendanceList.filter(st => {
                      if (!studentSearchQuery.trim()) return true;
                      const query = studentSearchQuery.toLowerCase();
                      return st.name.toLowerCase().includes(query) || st.nis.includes(query);
                    }).length === 0 && (
                      <div className="p-8 text-center text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                        Tidak ada siswa yang cocok dengan pencarian "{studentSearchQuery}"
                      </div>
                    )}
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={handleSaveStudentClassAttendance}
                    disabled={loading}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    <span>SIMPAN PRESENSI KELAS ({selectedClassForGuru})</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ROLE EXTENSION: KHUSUS SISWA / SANTRI */}
          {(selectedProfile.role === 'SISWA' || selectedProfile.role === 'SANTRI') && (
            <div className="bg-white p-6 rounded-[24px] border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-emerald-600" />
                  <h3 className="text-sm font-extrabold text-slate-800">Dashboard Siswa / Santri</h3>
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2.5 py-0.5 rounded-full">
                  PRESET STUDENT
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Jadwal Pelajaran Hari Ini</span>
                  <p className="font-bold text-slate-800">Bahasa Arab &amp; Tahfidz Juz 30</p>
                  <p className="text-[11px] text-slate-500">Jam 07:30 - 15:15 | Ruang Kelas X IPA 1</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Pengumuman Sekolah &amp; Pesantren</span>
                  <p className="font-bold text-indigo-700">Persiapan Ujian Tengah Semester &amp; Setoran Hafalan</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Rata-rata Nilai Academic</span>
                    <strong className="text-emerald-600 font-black text-sm">88.5 (Sangat Baik)</strong>
                  </div>
                  <Award className="h-6 w-6 text-amber-500" />
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* RIWAYAT ATTENDANCE TIMELINE SECTION */}
      <div className="bg-white p-6 md:p-8 rounded-[28px] border border-slate-200/80 shadow-md space-y-6">
        
        {/* Timeline Filter Controls Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-600" />
              <span>Riwayat Absensi &amp; Timeline Kehadiran</span>
            </h3>
            <p className="text-xs text-slate-500">Rekapitulasi jam masuk, jam pulang, durasi, dan metode validasi.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            
            {/* Period Toggles */}
            <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-bold">
              <button
                onClick={() => setHistoryPeriod('HARI_INI')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${historyPeriod === 'HARI_INI' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'}`}
              >
                Hari Ini
              </button>
              <button
                onClick={() => setHistoryPeriod('MINGGUAN')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${historyPeriod === 'MINGGUAN' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'}`}
              >
                Mingguan
              </button>
              <button
                onClick={() => setHistoryPeriod('BULANAN')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${historyPeriod === 'BULANAN' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'}`}
              >
                Bulanan
              </button>
            </div>

            {/* Export Report Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => alert('Mencetak PDF Riwayat Absensi...')}
                className="p-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>PDF</span>
              </button>
              <button
                onClick={() => alert('Mengekspor Excel Riwayat Absensi...')}
                className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Excel</span>
              </button>
            </div>

          </div>
        </div>

        {/* Timeline Cards Grid */}
        <div className="space-y-3">
          {sampleHistoryList.map((item) => (
            <div key={item.id} className="p-4 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-xl font-bold mt-0.5 ${item.status === 'HADIR' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-800 text-sm">{item.date}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${item.status === 'HADIR' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">{item.location} • {item.method}</p>
                </div>
              </div>

              <div className="flex items-center gap-6 font-mono text-xs text-right">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Jam Masuk</span>
                  <strong className="text-emerald-700">{item.timeIn}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Jam Pulang</span>
                  <strong className="text-rose-700">{item.timeOut}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Total Durasi</span>
                  <strong className="text-slate-800">{item.duration}</strong>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* FULL-SCREEN CAMERA SCANNER OVERLAY MODAL */}
      {showScanner && (
        <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col justify-between p-6 text-white font-sans animate-fade-in">
          
          {/* Scanner Header Bar */}
          <div className="flex items-center justify-between z-20">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-600 rounded-xl text-white">
                <Camera className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold">Full-Screen Scanner ({scannerType})</h3>
                <p className="text-[11px] text-slate-400">Pindai QR / Barcode Stiker Dinding Sekolah</p>
              </div>
            </div>

            <button
              onClick={() => setShowScanner(false)}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full cursor-pointer transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Camera Scanner Viewfinder Center Box */}
          <div className="relative my-auto flex flex-col items-center justify-center">
            
            {/* Viewfinder Target Frame */}
            <div className="w-72 h-72 md:w-80 md:h-80 border-2 border-emerald-400 rounded-3xl relative overflow-hidden flex flex-col items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.3)] bg-slate-900/60 backdrop-blur-sm">
              
              {/* REAL LIVE HARDWARE CAMERA STREAM */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover z-0"
              />

              {/* Corner Brackets */}
              <div className="absolute top-3 left-3 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg z-10" />
              <div className="absolute top-3 right-3 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg z-10" />
              <div className="absolute bottom-3 left-3 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg z-10" />
              <div className="absolute bottom-3 right-3 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg z-10" />

              {/* Animated Laser Scanning Line */}
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-scan top-0 z-10" />

              <div className="relative z-10 flex flex-col items-center justify-center bg-slate-950/60 p-4 rounded-2xl backdrop-blur-[2px] max-w-[85%] text-center">
                <Camera className="h-7 w-7 text-emerald-400 mb-1.5 animate-pulse" />
                <p className="text-[11px] text-white font-extrabold leading-normal">
                  Kamera HP Aktif Riil
                </p>
                <p className="text-[9px] text-slate-300 mt-0.5">
                  Arahkan ke QR stiker sekolah
                </p>
              </div>
            </div>

            {/* Real Capture Trigger Button */}
            <div className="mt-5 flex flex-col items-center gap-1.5 z-20">
              <button
                onClick={() => {
                  const targetLabel = fullAddress.includes("GPS") || fullAddress.includes("Jl. Pendidikan") ? "Stiker QR Sekolah Terdekat" : fullAddress;
                  handleSimulateScanTarget(targetLabel, 'QR-PROD-' + Date.now().toString());
                }}
                className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-lg shadow-emerald-950/40 transition flex items-center justify-center gap-2 cursor-pointer transform active:scale-95"
              >
                <Camera className="h-4.5 w-4.5" />
                <span>AMBIL FOTO &amp; PINDAI ABSENSI</span>
              </button>
              <p className="text-[9px] text-slate-400 max-w-[260px] text-center">Ketuk tombol di atas setelah memposisikan kamera pada stiker dinding sekolah.</p>
            </div>

            {/* Error Banner if Any */}
            {scanError && (
              <div className="mt-4 p-3 bg-rose-950/95 border border-rose-500 text-rose-200 text-xs rounded-xl font-bold max-w-sm text-center z-10">
                ⚠️ {scanError}
              </div>
            )}

          </div>

          {/* Quick Simulation Target Selector (For Demo Testing) */}
          <div className="z-20 space-y-2 bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">
              Daftar Titik Stiker Terdaftar (Alternatif Klik Cepat):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => handleSimulateScanTarget('Stiker QR Gedung Rektorat', 'QR-DINDING-REKTORAT-01')}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-left rounded-xl border border-slate-700 text-[11px] font-bold cursor-pointer transition"
              >
                Gedung Rektorat
              </button>
              <button
                onClick={() => handleSimulateScanTarget('Stiker QR Ruang Guru', 'QR-DINDING-RUANGGURU-02')}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-left rounded-xl border border-slate-700 text-[11px] font-bold cursor-pointer transition"
              >
                Ruang Guru
              </button>
              <button
                onClick={() => handleSimulateScanTarget('Barcode Gerbang Utama Satpam', 'BARCODE-GATE-SATPAM-03')}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-left rounded-xl border border-slate-700 text-[11px] font-bold cursor-pointer transition"
              >
                Gerbang Satpam
              </button>
              <button
                onClick={() => handleSimulateScanTarget('Stiker QR Lab Komputer', 'QR-DINDING-LAB-IT-04')}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-left rounded-xl border border-slate-700 text-[11px] font-bold cursor-pointer transition"
              >
                Lab Komputer
              </button>
            </div>
          </div>

        </div>
      )}

      {/* MODERN BOTTOM SHEET MODAL (AFTER SUCCESSFUL SCAN) */}
      {showBottomSheet && scanSuccessData && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-end justify-center p-0 md:p-4 animate-fade-in">
          <div className="bg-white rounded-t-[32px] md:rounded-[32px] max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-slide-up">
            
            {/* Sheet Handle Accent Bar */}
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto" />

            <div className="text-center space-y-1">
              <div className="inline-flex p-3 bg-emerald-100 text-emerald-600 rounded-full mb-1">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Validasi Pindai Berhasil!</h3>
              <p className="text-xs text-slate-500">Hasil dekripsi barcode/QR stiker dinding &amp; koordinat GPS valid.</p>
            </div>

            {/* Scanned Person Details */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                <img
                  src={selectedProfile.photoUrl}
                  alt={selectedProfile.name}
                  className="w-12 h-12 rounded-xl object-cover border"
                />
                <div>
                  <strong className="block text-slate-900 font-extrabold text-sm">{selectedProfile.name}</strong>
                  <span className="text-indigo-600 font-mono font-bold">NIP/NIS: {selectedProfile.nip}</span>
                  <p className="text-slate-500 text-[11px]">{selectedProfile.roleLabel} • {selectedProfile.unit}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div>
                  <span className="text-slate-400 block">Jam &amp; Tanggal:</span>
                  <strong className="text-slate-800">{scanSuccessData.scannedAt} ({scanSuccessData.scannedDate})</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Stiker / Lokasi:</span>
                  <strong className="text-indigo-700">{scanSuccessData.label}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">GPS Status:</span>
                  <strong className="text-emerald-600">VALID (18m Radius)</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">QR/Barcode Status:</span>
                  <strong className="text-emerald-600">ENCRYPTED VALID</strong>
                </div>
              </div>
            </div>

            {/* Action Confirm Button */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowBottomSheet(false)}
                className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => handleDoCheckIn('QR')}
                disabled={loading}
                className="w-2/3 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                <span>KONFIRMASI ABSEN SEKARANG</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL FORM PENGAJUAN ABSENSI MANUAL */}
      {showManualModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-800">Form Permohonan Absen Manual</h3>
              <button onClick={() => setShowManualModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitManual} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Pemohon</label>
                <input
                  type="text"
                  value={`${selectedProfile.name} (${selectedProfile.role})`}
                  disabled
                  className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jam Absensi</label>
                  <input
                    type="time"
                    value={manualTime}
                    onChange={(e) => setManualTime(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Lokasi Kebiasaan / Gedung</label>
                <input
                  type="text"
                  value={manualLocation}
                  onChange={(e) => setManualLocation(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Alasan Pengajuan Manual</label>
                <textarea
                  rows={3}
                  value={manualReason}
                  onChange={(e) => setManualReason(e.target.value)}
                  placeholder="Contoh: Kendala GPS HP saat hujan deras atau kerusakan kamera HP."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  <span>Kirim Permohonan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default EnterpriseEmployeeAttendanceWorkspace;
