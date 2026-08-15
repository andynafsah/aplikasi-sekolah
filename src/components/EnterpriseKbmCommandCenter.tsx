import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Play, 
  Plus, 
  Edit3, 
  Trash2, 
  QrCode, 
  Users, 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  Layers, 
  ChevronRight, 
  ShieldCheck, 
  RefreshCw, 
  Sparkles, 
  Video, 
  Link2, 
  FileUp, 
  CheckSquare, 
  UserCheck, 
  BarChart3, 
  ArrowRightLeft, 
  Award, 
  HelpCircle,
  Eye,
  Camera,
  StopCircle,
  Unlock,
  Lock
} from 'lucide-react';

export default function EnterpriseKbmCommandCenter() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Active Sub Tab state
  const [activeTab, setActiveTab] = useState<
    | 'dashboard' 
    | 'schedules' 
    | 'my_kbm' 
    | 'journals' 
    | 'materials' 
    | 'assignments' 
    | 'attendance' 
    | 'monitoring' 
    | 'calendar' 
    | 'reschedule_cancel' 
    | 'reports'
  >('dashboard');

  // Modal & Wizard States
  const [showStartModal, setShowStartModal] = useState<boolean>(false);
  const [showJournalModal, setShowJournalModal] = useState<boolean>(false);
  const [showMaterialModal, setShowMaterialModal] = useState<boolean>(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState<boolean>(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState<boolean>(false);
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [showReportPreviewModal, setShowReportPreviewModal] = useState<boolean>(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);

  // Mulai KBM Wizard Step state (1: Detail & Confirm, 2: Smart Attendance, 3: Material, 4: Journal, 5: Assignment, 6: Finish)
  const [wizardStep, setWizardStep] = useState<number>(1);

  // Filters State
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('2026/2027');
  const [selectedSemester, setSelectedSemester] = useState<string>('Ganjil');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Toast alert
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // --- API QUERIES ---
  const { data: dashboardData, refetch: refetchDashboard } = useQuery({
    queryKey: ['kbmDashboard'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=getKbmDashboard');
      return res.data?.data || {};
    }
  });

  const { data: schedules = [], refetch: refetchSchedules } = useQuery({
    queryKey: ['kbmSchedules'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=getKbmSchedules');
      return res.data?.data || [];
    }
  });

  const { data: journals = [], refetch: refetchJournals } = useQuery({
    queryKey: ['kbmJournals'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=getKbmJournals');
      return res.data?.data || [];
    }
  });

  const { data: materials = [], refetch: refetchMaterials } = useQuery({
    queryKey: ['kbmMaterials'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=getKbmMaterials');
      return res.data?.data || [];
    }
  });

  const { data: assignments = [], refetch: refetchAssignments } = useQuery({
    queryKey: ['kbmAssignments'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=getKbmAssignments');
      return res.data?.data || [];
    }
  });

  const { data: monitoringData } = useQuery({
    queryKey: ['kbmMonitoring'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=getKbmMonitoring');
      return res.data?.data || {};
    }
  });

  const { data: calendarEvents = [] } = useQuery({
    queryKey: ['kbmCalendar'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=getKbmCalendar');
      return res.data?.data || [];
    }
  });

  // --- FORM STATES ---
  // Start KBM Session Form
  const [sessionForm, setSessionForm] = useState<any>({
    schedule_id: '',
    classroom_name: 'X MIPA 1 (Santri Terpadu)',
    course_name: 'Fisika Terpadu',
    room: 'Lab Fisika Lt. 2',
    notes: 'KBM berjalan lancar sesuai RPP',
    start_time: '07:30'
  });

  // Attendance Scan / Manual State inside Wizard
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([
    { student_id: 'std-1', name: 'Farhan Ramadhan', nis: '102401', status: 'HADIR', notes: '' },
    { student_id: 'std-2', name: 'Laila Fitriani', nis: '102402', status: 'HADIR', notes: '' },
    { student_id: 'std-3', name: 'Rizky Pratama', nis: '102305', status: 'SAKIT', notes: 'Demam tinggi' },
    { student_id: 'std-4', name: 'Zaid Al-Khair', nis: '202401', status: 'HADIR', notes: '' },
    { student_id: 'std-5', name: 'Aisyah Humaira', nis: '202402', status: 'IZIN', notes: 'Acara keluarga' }
  ]);
  const [qrInput, setQrInput] = useState<string>('');
  const [qrScanningActive, setQrScanningActive] = useState<boolean>(false);

  // Journal Form
  const [journalForm, setJournalForm] = useState<any>({
    topic: '',
    learning_objective: '',
    activities: '',
    method: 'Eksperimen & Diskusi Kelompok',
    notes: '',
    tasks: ''
  });

  // Material Form
  const [materialForm, setMaterialForm] = useState<any>({
    title: '',
    type: 'PDF Document',
    file_url: '',
    external_url: '',
    description: '',
    course_name: 'Fisika Terpadu',
    classroom_name: 'X MIPA 1 (Santri Terpadu)'
  });

  // Assignment Form
  const [assignmentForm, setAssignmentForm] = useState<any>({
    title: '',
    description: '',
    task_type: 'TUGAS',
    deadline: '',
    weight: 15,
    instructions: '',
    course_name: 'Fisika Terpadu',
    classroom_name: 'X MIPA 1 (Santri Terpadu)'
  });

  // Reschedule & Cancel Forms
  const [rescheduleForm, setRescheduleForm] = useState<any>({
    schedule_id: '',
    old_schedule_text: '',
    new_date: '',
    new_time: '',
    reason: ''
  });

  const [cancelForm, setCancelForm] = useState<any>({
    schedule_id: '',
    reason: ''
  });

  // --- MUTATIONS ---
  const startSessionMutation = useMutation({
    mutationFn: async (payload: any) => {
      return apiClient.post('/api/action?action=startKbmSession', payload);
    },
    onSuccess: (res) => {
      if (res.data?.success) {
        setSelectedSession(res.data.data);
        showToast('🚀 Session KBM Berhasil Dimulai!');
        refetchDashboard();
        setWizardStep(2); // Move to attendance
      }
    }
  });

  const finishSessionMutation = useMutation({
    mutationFn: async (payload: any) => {
      return apiClient.post('/api/action?action=finishKbmSession', payload);
    },
    onSuccess: () => {
      showToast('🎉 KBM Berhasil Diselesaikan dan Disimpan!');
      setShowStartModal(false);
      refetchDashboard();
      refetchJournals();
    }
  });

  const saveJournalMutation = useMutation({
    mutationFn: async (payload: any) => {
      return apiClient.post('/api/action?action=saveKbmJournal', payload);
    },
    onSuccess: () => {
      showToast('✅ Jurnal Mengajar Berhasil Disimpan!');
      setShowJournalModal(false);
      refetchJournals();
      refetchDashboard();
    }
  });

  const saveMaterialMutation = useMutation({
    mutationFn: async (payload: any) => {
      return apiClient.post('/api/action?action=saveKbmMaterial', payload);
    },
    onSuccess: () => {
      showToast('📚 Materi Pembelajaran Berhasil Diunggah!');
      setShowMaterialModal(false);
      refetchMaterials();
    }
  });

  const saveAssignmentMutation = useMutation({
    mutationFn: async (payload: any) => {
      return apiClient.post('/api/action?action=saveKbmAssignment', payload);
    },
    onSuccess: () => {
      showToast('📝 Tugas/Kuis Berhasil Diterbitkan!');
      setShowAssignmentModal(false);
      refetchAssignments();
    }
  });

  const scanQrMutation = useMutation({
    mutationFn: async (payload: any) => {
      return apiClient.post('/api/action?action=scanStudentQr', payload);
    },
    onSuccess: (res) => {
      if (res.data?.success) {
        showToast(`✅ ${res.data.message}`);
        if (res.data.student) {
          // Update status in list
          setAttendanceRecords(prev => prev.map(rec => 
            rec.student_id === res.data.student.id || rec.nis === res.data.student.nis
              ? { ...rec, status: 'HADIR', notes: 'Scan QR Valid' }
              : rec
          ));
        }
      } else {
        showToast(`❌ ${res.data?.message || 'Gagal scan QR'}`);
      }
      setQrInput('');
    }
  });

  const rescheduleMutation = useMutation({
    mutationFn: async (payload: any) => {
      return apiClient.post('/api/action?action=rescheduleKbmSession', payload);
    },
    onSuccess: () => {
      showToast('🔄 Jadwal KBM Berhasil Perbarui (Rescheduled)!');
      setShowRescheduleModal(false);
      refetchSchedules();
      refetchDashboard();
    }
  });

  const cancelSessionMutation = useMutation({
    mutationFn: async (payload: any) => {
      return apiClient.post('/api/action?action=cancelKbmSession', payload);
    },
    onSuccess: () => {
      showToast('⚠️ KBM Berhasil Dibatalkan.');
      setShowCancelModal(false);
      refetchSchedules();
      refetchDashboard();
    }
  });

  // Handler for QR simulation/scan
  const handleQrSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrInput.trim()) return;
    scanQrMutation.mutate({
      qr_data: qrInput.trim(),
      session_id: selectedSession?.id || 'kbm-sess-1',
      classroom_id: selectedSession?.classroom_id || 'cl-1'
    });
  };

  const metrics = dashboardData?.metrics || {
    totalScheduleToday: 12,
    kbmToday: 10,
    activeTeachers: 8,
    activeClasses: 6,
    completedKbm: 7,
    notStartedKbm: 3,
    missedKbm: 1,
    pendingJournal: 2,
    pendingAttendance: 1,
    ungradedAssignments: 4,
    pendingMaterials: 2
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-3 border border-emerald-500/40 animate-bounce">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* HEADER COMMAND CENTER */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-full border border-emerald-500/30">
                KBM Command Center v4.0
              </span>
              <span className="text-xs text-slate-300 font-mono flex items-center">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-1.5" />
                Live Engine Synchronization Active
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-2">
              Kegiatan Belajar Mengajar (KBM) Command Center
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Pusat kendali terintegrasi Tahun Ajaran, Kurikulum, Jadwal, Presensi Smart QR, Jurnal Mengajar, Materi, & Asesmen Terpadu.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setShowStartModal(true);
                setWizardStep(1);
              }}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm rounded-xl shadow-lg shadow-emerald-900/30 transition-all flex items-center space-x-2 transform active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Mulai KBM Hari Ini</span>
            </button>
            <button
              onClick={() => setShowReportPreviewModal(true)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-medium rounded-xl transition-all flex items-center space-x-2"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Cetak Rekap KBM</span>
            </button>
          </div>
        </div>

        {/* SUB-NAVIGATION TABS */}
        <div className="mt-6 border-t border-slate-700/60 pt-4 flex items-center space-x-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'dashboard', label: 'Dashboard KBM', icon: BarChart3 },
            { id: 'schedules', label: 'Jadwal KBM', icon: Calendar },
            { id: 'my_kbm', label: 'KBM Saya (Guru)', icon: BookOpen },
            { id: 'journals', label: 'Jurnal Mengajar', icon: FileText },
            { id: 'materials', label: 'Materi Pembelajaran', icon: Layers },
            { id: 'assignments', label: 'Tugas & Kuis', icon: Award },
            { id: 'attendance', label: 'Absensi & Scan QR', icon: QrCode },
            { id: 'monitoring', label: 'Monitoring Guru', icon: Users },
            { id: 'calendar', label: 'Kalender KBM', icon: Clock },
            { id: 'reschedule_cancel', label: 'Reschedule / Batal', icon: ArrowRightLeft },
            { id: 'reports', label: 'Laporan Resmi', icon: Printer }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-900/20'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* GLOBAL FILTER TOOLBAR */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-semibold text-slate-600">Filters:</span>
          </div>

          <select
            value={selectedAcademicYear}
            onChange={(e) => setSelectedAcademicYear(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="2026/2027">TA 2026/2027</option>
            <option value="2025/2026">TA 2025/2026</option>
          </select>

          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="Ganjil">Semester Ganjil</option>
            <option value="Genap">Semester Genap</option>
          </select>

          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="ALL">Semua Rombel</option>
            <option value="X MIPA 1">X MIPA 1 (Santri Terpadu)</option>
            <option value="X MIPA 2">X MIPA 2</option>
            <option value="XI MIPA 1">XI MIPA 1</option>
          </select>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="ALL">Semua Mapel</option>
            <option value="Fisika Terpadu">Fisika Terpadu</option>
            <option value="Tahfidz Al-Qur'an">Tahfidz Al-Qur'an</option>
            <option value="Kimia Organik">Kimia Organik</option>
          </select>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari guru, rombel, mapel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* --- TAB CONTENT 1: DASHBOARD --- */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* KPI METRICS GRID (11 Key Indicators) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { label: 'Jadwal Hari Ini', value: metrics.totalScheduleToday, sub: 'Jam Pelajaran', icon: Calendar, color: 'emerald' },
              { label: 'KBM Terlaksana', value: metrics.completedKbm, sub: 'Selesai Sesuai RPP', icon: CheckCircle2, color: 'teal' },
              { label: 'Guru Mengajar', value: metrics.activeTeachers, sub: 'Standby / Aktif', icon: Users, color: 'blue' },
              { label: 'Rombel Aktif', value: metrics.activeClasses, sub: 'Ruang / Lab', icon: BookOpen, color: 'indigo' },
              { label: 'KBM Belum Mulai', value: metrics.notStartedKbm, sub: 'Menunggu Jam', icon: Clock, color: 'amber' },
              { label: 'KBM Terlewat/Batal', value: metrics.missedKbm, sub: 'Perlu Reschedule', icon: AlertTriangle, color: 'rose' },
              { label: 'Jurnal Belum Diisi', value: metrics.pendingJournal, sub: 'Perlu Input Guru', icon: FileText, color: 'orange' },
              { label: 'Presensi Belum Diisi', value: metrics.pendingAttendance, sub: 'Pending QR Scan', icon: QrCode, color: 'purple' },
              { label: 'Tugas Belum Dinilai', value: metrics.ungradedAssignments, sub: 'Perlu Koreksi', icon: Award, color: 'sky' },
              { label: 'Materi Belum Diinput', value: metrics.pendingMaterials, sub: 'Perlu Upload', icon: Layers, color: 'slate' },
              { label: 'Fulfillment Rate', value: '96.8%', sub: 'Sesuai Standar KBM', icon: ShieldCheck, color: 'emerald' }
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[11px] font-semibold tracking-wide uppercase">{stat.label}</span>
                    <Icon className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-xl font-extrabold text-slate-800 mt-1">{stat.value}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{stat.sub}</div>
                </div>
              );
            })}
          </div>

          {/* ACTIVE KBM SESSIONS & TODAY'S TIMELINE */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Active KBM Cards */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Sesi KBM Berlangsung & Hari Ini</h3>
                  <p className="text-xs text-slate-500">Daftar jam pelajaran dan kelas aktif real-time hari ini.</p>
                </div>
                <button
                  onClick={() => {
                    setShowStartModal(true);
                    setWizardStep(1);
                  }}
                  className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-xs rounded-xl border border-emerald-200 transition-all flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Mulai Sesi Baru</span>
                </button>
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: 'sch-101',
                    course_name: 'Fisika Terpadu',
                    classroom_name: 'X MIPA 1 (Santri Terpadu)',
                    teacher_name: 'Ustadz Ahmad Ghozali, S.Pd.',
                    time: '07:30 - 09:00 (Jam 1-2)',
                    room: 'Lab Fisika Lt. 2',
                    status: 'COMPLETED',
                    attendance: '28/28 Hadir',
                    journal: 'Terisi (Hukum Newton I)'
                  },
                  {
                    id: 'sch-102',
                    course_name: 'Tahfidz & Tajwid Al-Qur\'an',
                    classroom_name: 'X MIPA 2',
                    teacher_name: 'Ustadz Nur Hidayat, M.Ag.',
                    time: '09:15 - 10:45 (Jam 3-4)',
                    room: 'Masjid Utama Lt. 1',
                    status: 'ONGOING',
                    attendance: '25/25 QR Scanned',
                    journal: 'Sedang Berlangsung'
                  },
                  {
                    id: 'sch-103',
                    course_name: 'Kimia Organik',
                    classroom_name: 'XI MIPA 1',
                    teacher_name: 'Ustadzah Laila Hanum, S.Si.',
                    time: '11:00 - 12:30 (Jam 5-6)',
                    room: 'Lab Kimia',
                    status: 'SCHEDULED',
                    attendance: 'Belum Presensi',
                    journal: 'Belum Diisi'
                  }
                ].map((sess, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      sess.status === 'ONGOING'
                        ? 'bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-500/20'
                        : sess.status === 'COMPLETED'
                        ? 'bg-slate-50 border-slate-200'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2.5 rounded-xl text-white ${
                        sess.status === 'ONGOING' ? 'bg-emerald-600 animate-pulse' : sess.status === 'COMPLETED' ? 'bg-slate-700' : 'bg-amber-500'
                      }`}>
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-slate-800 text-sm">{sess.course_name}</h4>
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                            sess.status === 'ONGOING' ? 'bg-emerald-100 text-emerald-800' : sess.status === 'COMPLETED' ? 'bg-slate-200 text-slate-700' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {sess.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium mt-0.5">
                          {sess.classroom_name} • <span className="text-slate-500">{sess.teacher_name}</span>
                        </p>
                        <div className="flex items-center space-x-3 text-[11px] text-slate-500 mt-1">
                          <span className="flex items-center"><Clock className="w-3 h-3 mr-1 text-emerald-600" />{sess.time}</span>
                          <span>•</span>
                          <span>{sess.room}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-end md:self-center">
                      <button
                        onClick={() => {
                          setSelectedSession(sess);
                          setShowStartModal(true);
                          setWizardStep(sess.status === 'ONGOING' ? 2 : 1);
                        }}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{sess.status === 'ONGOING' ? 'Lanjutkan Konsol' : 'Buka Detail'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Smart Attendance & Journal Status Summary */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h3 className="text-base font-bold text-slate-800 mb-3 flex items-center space-x-2">
                  <QrCode className="w-4 h-4 text-emerald-600" />
                  <span>Status Presensi Smart QR</span>
                </h3>
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="text-2xl font-black text-emerald-800">98.4%</div>
                  <p className="text-xs text-emerald-700 font-medium mt-0.5">Tingkat Kehadiran Santri/Siswa Hari Ini</p>
                  <div className="w-full bg-emerald-200 h-2 rounded-full mt-3 overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: '98.4%' }} />
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Hadir via Scan QR:</span>
                    <span className="font-bold text-slate-800">142 Santri</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Izin / Sakit Terverifikasi:</span>
                    <span className="font-bold text-amber-600">3 Santri</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Tanpa Keterangan (Alpa):</span>
                    <span className="font-bold text-rose-600">0 Santri</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h3 className="text-base font-bold text-slate-800 mb-2 flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>Compliance Jurnal Mengajar</span>
                </h3>
                <p className="text-xs text-slate-500 mb-4">Verifikasi otomatis keterisian jurnal dan kesesuaian TP/CP.</p>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <span className="font-semibold text-slate-700">Jurnal Terisi & Valid:</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-lg">10 / 12 Sesi</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB CONTENT 2: JADWAL KBM --- */}
      {activeTab === 'schedules' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Master Jadwal KBM (Scheduler Engine)</h3>
              <p className="text-xs text-slate-500">Jadwal yang bersumber langsung dari Teacher Assignment Engine & Kurikulum.</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowRescheduleModal(true)}
                className="px-3.5 py-2 bg-amber-50 text-amber-700 hover:bg-amber-100 font-semibold text-xs rounded-xl border border-amber-200 transition-all flex items-center space-x-1.5"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Reschedule Jadwal</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
                  <th className="p-3.5">Hari & Jam</th>
                  <th className="p-3.5">Rombel</th>
                  <th className="p-3.5">Mata Pelajaran</th>
                  <th className="p-3.5">Guru Pengampu</th>
                  <th className="p-3.5">Ruang / Lab</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {schedules.map((sch: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-all">
                    <td className="p-3.5 font-semibold text-slate-800">
                      <div className="text-emerald-700 font-bold">{sch.day}</div>
                      <div className="text-[11px] text-slate-500">{sch.start_time || '07:30'} - {sch.end_time || '09:00'}</div>
                    </td>
                    <td className="p-3.5 font-medium text-slate-800">{sch.classroom_name}</td>
                    <td className="p-3.5 font-bold text-slate-900">{sch.course_name}</td>
                    <td className="p-3.5 text-slate-600">{sch.teacher_name}</td>
                    <td className="p-3.5 text-slate-500">{sch.room || 'Ruang Klasik'}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 font-bold text-[10px] rounded-full ${
                        sch.status === 'Completed' ? 'bg-slate-100 text-slate-700' :
                        sch.status === 'Rescheduled' ? 'bg-amber-100 text-amber-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {sch.status || 'Scheduled'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSessionForm({
                            schedule_id: sch.id,
                            classroom_name: sch.classroom_name,
                            course_name: sch.course_name,
                            room: sch.room,
                            start_time: sch.start_time
                          });
                          setShowStartModal(true);
                          setWizardStep(1);
                        }}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] rounded-lg transition-all shadow-sm"
                      >
                        Mulai KBM
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB CONTENT 3: KBM SAYA (GURU WORKSPACE) --- */}
      {activeTab === 'my_kbm' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-900 to-emerald-950 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full border border-emerald-500/30">
                Konsol Personal Guru
              </span>
              <h2 className="text-xl font-bold mt-2">Selamat Mengajar, {user?.name || 'Ustadz Ahmad Ghozali, S.Pd.'}</h2>
              <p className="text-xs text-slate-300 mt-0.5">Kelola sesi aktif, presensi santri, jurnal mengajar, dan materi kelas Anda.</p>
            </div>
            <button
              onClick={() => {
                setShowStartModal(true);
                setWizardStep(1);
              }}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition-all shadow-lg flex items-center space-x-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Buka Konsol KBM Aktif</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>Kelas & Mapel Diampu</span>
              </h3>
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-slate-800">Fisika Terpadu</div>
                    <div className="text-slate-500">X MIPA 1 (Santri Terpadu)</div>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-md text-[10px]">4 JP/Minggu</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-slate-800">Fisika Inti & Astronomi</div>
                    <div className="text-slate-500">XI MIPA 1</div>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-md text-[10px]">4 JP/Minggu</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Aksi Cepat Guru</span>
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => setShowJournalModal(true)}
                  className="p-3 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 font-semibold rounded-xl border border-slate-200 transition-all text-left flex flex-col items-center justify-center text-center space-y-1"
                >
                  <FileText className="w-5 h-5 text-emerald-600" />
                  <span>Isi Jurnal Mengajar</span>
                </button>
                <button
                  onClick={() => setShowMaterialModal(true)}
                  className="p-3 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 font-semibold rounded-xl border border-slate-200 transition-all text-left flex flex-col items-center justify-center text-center space-y-1"
                >
                  <Layers className="w-5 h-5 text-emerald-600" />
                  <span>Unggah Materi RPP</span>
                </button>
                <button
                  onClick={() => setShowAssignmentModal(true)}
                  className="p-3 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 font-semibold rounded-xl border border-slate-200 transition-all text-left flex flex-col items-center justify-center text-center space-y-1"
                >
                  <Award className="w-5 h-5 text-emerald-600" />
                  <span>Buat Tugas / Kuis</span>
                </button>
                <button
                  onClick={() => setActiveTab('attendance')}
                  className="p-3 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 font-semibold rounded-xl border border-slate-200 transition-all text-left flex flex-col items-center justify-center text-center space-y-1"
                >
                  <QrCode className="w-5 h-5 text-emerald-600" />
                  <span>Scan QR Santri</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB CONTENT 4: JURNAL MENGAJAR --- */}
      {activeTab === 'journals' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Rekapitulasi Jurnal Mengajar Guru</h3>
              <p className="text-xs text-slate-500">Log aktivitas pembelajaran, Tujuan Pembelajaran (TP), dan catatan progres kelas.</p>
            </div>
            <button
              onClick={() => setShowJournalModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Input Jurnal Baru</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
                  <th className="p-3.5">Tanggal</th>
                  <th className="p-3.5">Guru</th>
                  <th className="p-3.5">Rombel & Mapel</th>
                  <th className="p-3.5">Materi / Topik</th>
                  <th className="p-3.5">Tujuan Pembelajaran (TP)</th>
                  <th className="p-3.5">Metode</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {journals.map((jrn: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-all">
                    <td className="p-3.5 font-semibold text-slate-700">{jrn.date}</td>
                    <td className="p-3.5 font-bold text-slate-800">{jrn.teacher_name}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-800">{jrn.course_name}</div>
                      <div className="text-[11px] text-slate-500">{jrn.classroom_name}</div>
                    </td>
                    <td className="p-3.5 font-semibold text-emerald-800 max-w-xs">{jrn.topic}</td>
                    <td className="p-3.5 text-slate-600 max-w-xs truncate">{jrn.learning_objective}</td>
                    <td className="p-3.5 text-slate-500">{jrn.method}</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full">
                        {jrn.status || 'SUBMITTED'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB CONTENT 5: MATERI PEMBELAJARAN --- */}
      {activeTab === 'materials' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800">Repositori Materi & RPP Pembelajaran</h3>
              <p className="text-xs text-slate-500">Modul, slide PDF, video interaktif, dan pranala materi per mata pelajaran.</p>
            </div>
            <button
              onClick={() => setShowMaterialModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Unggah Materi Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {materials.map((mat: any, idx: number) => (
              <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 font-bold text-[10px] rounded-md">
                      {mat.type}
                    </span>
                    <span className="text-[10px] text-slate-400">{mat.meeting_no}</span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm line-clamp-2">{mat.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{mat.description}</p>
                </div>

                <div className="mt-4 border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">{mat.author}</span>
                  <a
                    href={mat.file_url || mat.external_url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg hover:bg-emerald-100 transition-all"
                  >
                    Buka File
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB CONTENT 6: TUGAS & KUIS --- */}
      {activeTab === 'assignments' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Manajemen Tugas & Kuis KBM</h3>
              <p className="text-xs text-slate-500">Tugas, PR, Latihan, dan Kuis yang terhubung langsung ke Assessment Engine.</p>
            </div>
            <button
              onClick={() => setShowAssignmentModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Tugas Baru</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
                  <th className="p-3.5">Judul Tugas</th>
                  <th className="p-3.5">Tipe</th>
                  <th className="p-3.5">Rombel & Mapel</th>
                  <th className="p-3.5">Deadline</th>
                  <th className="p-3.5">Bobot</th>
                  <th className="p-3.5">Progres Pengumpulan</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {assignments.map((asg: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-all">
                    <td className="p-3.5 font-bold text-slate-800">{asg.title}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded-md text-[10px]">
                        {asg.task_type}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-800">{asg.course_name}</div>
                      <div className="text-[11px] text-slate-500">{asg.classroom_name}</div>
                    </td>
                    <td className="p-3.5 font-medium text-slate-700">{asg.deadline}</td>
                    <td className="p-3.5 font-bold text-slate-800">{asg.weight}%</td>
                    <td className="p-3.5">
                      <div className="text-slate-700 font-semibold">{asg.submitted_count} / {asg.total_students} Terkumpul</div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full">
                        {asg.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB CONTENT 7: ABSENSI & SCAN QR --- */}
      {activeTab === 'attendance' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Camera / QR Code Scanner Simulator */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 flex items-center space-x-2">
                <Camera className="w-5 h-5 text-emerald-600" />
                <span>Scan QR Kartu Pelajar</span>
              </h3>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                Camera Ready
              </span>
            </div>

            {/* Video Feed Placeholder */}
            <div className="relative w-full h-52 bg-slate-900 rounded-xl overflow-hidden flex flex-col items-center justify-center text-white p-4 border-2 border-dashed border-emerald-500/50">
              <QrCode className="w-16 h-16 text-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold mt-2 text-slate-300">Dekatkan QR Code Kartu Pelajar ke Kamera</span>
              <span className="text-[10px] text-emerald-400 mt-0.5">Validasi Otomatis Rombel & Sesi Aktif</span>
            </div>

            <form onSubmit={handleQrSubmit} className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700">Simulasi / Manual Scan Input (NIS / ID):</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Contoh: 102401 atau STU-102401"
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={scanQrMutation.isPending}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  Scan QR
                </button>
              </div>
            </form>
          </div>

          {/* Right: Manual Attendance List */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-base font-bold text-slate-800 mb-4">Daftar Presensi KBM Santri / Siswa (Rombel Aktif)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase">
                    <th className="p-3">NIS</th>
                    <th className="p-3">Nama Santri</th>
                    <th className="p-3">Status Presensi</th>
                    <th className="p-3">Jam Scan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {attendanceRecords.map((rec, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-3 font-mono text-slate-600">{rec.nis}</td>
                      <td className="p-3 font-bold text-slate-800">{rec.name}</td>
                      <td className="p-3">
                        <select
                          value={rec.status}
                          onChange={(e) => {
                            const newStatus = e.target.value;
                            setAttendanceRecords(prev => prev.map((item, idx) => idx === i ? { ...item, status: newStatus } : item));
                          }}
                          className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
                        >
                          <option value="HADIR">HADIR</option>
                          <option value="IZIN">IZIN</option>
                          <option value="SAKIT">SAKIT</option>
                          <option value="ALPA">ALPA</option>
                        </select>
                      </td>
                      <td className="p-3 text-slate-500">{rec.scan_time || '07:32'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB CONTENT 8: MONITORING GURU --- */}
      {activeTab === 'monitoring' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-800">Monitoring Pemantauan KBM (Kepala Sekolah & Wakasek)</h3>
            <p className="text-xs text-slate-500">Pantau kehadiran guru, ketersediaan jurnal, dan keterlaksanaan RPP real-time.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(monitoringData?.teachers || [
              { name: 'Ustadz Ahmad Ghozali, S.Pd.', subject: 'Fisika', total_assigned: 12, completed: 10, pending_journal: 1, status: 'Active Teaching' },
              { name: 'Ustadz Nur Hidayat, M.Ag.', subject: 'Tahfidz', total_assigned: 16, completed: 15, pending_journal: 0, status: 'Active Teaching' },
              { name: 'Ustadzah Laila Hanum, S.Si.', subject: 'Kimia', total_assigned: 10, completed: 8, pending_journal: 2, status: 'Need Review' }
            ]).map((tch: any, idx: number) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-slate-800 text-xs">{tch.name}</h4>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                    {tch.status}
                  </span>
                </div>
                <div className="text-xs text-slate-600">Mapel: <span className="font-semibold">{tch.subject}</span></div>
                <div className="text-xs text-slate-500">Tercapai: {tch.completed} / {tch.total_assigned} Sesi</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB CONTENT 9: KALENDER KBM --- */}
      {activeTab === 'calendar' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-800">Kalender Kegiatan Belajar Mengajar</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {calendarEvents.map((ev: any, idx: number) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-800">{ev.title}</div>
                  <div className="text-slate-500 mt-0.5">{ev.classroom} • {ev.teacher}</div>
                  <div className="text-[10px] text-emerald-700 font-semibold mt-1">{ev.start}</div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px]">
                  {ev.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB CONTENT 10: RESCHEDULE & CANCEL --- */}
      {activeTab === 'reschedule_cancel' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-slate-800">Manajemen Reschedule & Pembatalan KBM</h3>
              <p className="text-xs text-slate-500">Audit trail perubahan jadwal mengajar demi transparansi presensi.</p>
            </div>
            <button
              onClick={() => setShowRescheduleModal(true)}
              className="px-4 py-2 bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md"
            >
              Ajukan Reschedule
            </button>
          </div>
        </div>
      )}

      {/* --- TAB CONTENT 11: LAPORAN RESMI --- */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4 text-center">
          <Printer className="w-12 h-12 text-emerald-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">Laporan Resmi KBM Ready</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">Generate dokumen rekap KBM Guru, Rombel, dan Jurnal Mengajar ber-Kop Surat dan QR Signature.</p>
          <button
            onClick={() => setShowReportPreviewModal(true)}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
          >
            Pratinjau & Cetak Laporan
          </button>
        </div>
      )}

      {/* --- MODAL 1: MULAI KBM WIZARD CONSOLE --- */}
      {showStartModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Konsol Eksekusi KBM (Step {wizardStep} / 5)</h3>
                <p className="text-xs text-slate-500">{sessionForm.course_name} • {sessionForm.classroom_name}</p>
              </div>
              <button onClick={() => setShowStartModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* STEP 1: Konfirmasi detail */}
            {wizardStep === 1 && (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
                  <div className="font-bold text-slate-800 text-sm">Konfirmasi Informasi Kelas:</div>
                  <div>Mata Pelajaran: <span className="font-bold text-emerald-800">{sessionForm.course_name}</span></div>
                  <div>Rombel: <span className="font-bold text-slate-800">{sessionForm.classroom_name}</span></div>
                  <div>Ruang: <span className="font-bold text-slate-800">{sessionForm.room}</span></div>
                </div>

                <button
                  onClick={() => {
                    startSessionMutation.mutate({
                      schedule_id: sessionForm.schedule_id || 'sch-101',
                      classroom_name: sessionForm.classroom_name,
                      course_name: sessionForm.course_name,
                      room: sessionForm.room
                    });
                  }}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-all text-sm"
                >
                  Mulai KBM Sekarang
                </button>
              </div>
            )}

            {/* STEP 2: Smart Attendance */}
            {wizardStep === 2 && (
              <div className="space-y-4 text-xs">
                <h4 className="font-bold text-slate-800 text-sm">Presensi Santri / Siswa (Scan QR atau Manual)</h4>
                <div className="p-3 bg-slate-50 rounded-xl border space-y-2">
                  {attendanceRecords.map((r, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-800">{r.name} ({r.nis})</span>
                      <span className="font-bold text-emerald-700">{r.status}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setWizardStep(3)}
                  className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs"
                >
                  Lanjut ke Jurnal Mengajar
                </button>
              </div>
            )}

            {/* STEP 3: Jurnal Mengajar */}
            {wizardStep === 3 && (
              <div className="space-y-3 text-xs">
                <h4 className="font-bold text-slate-800 text-sm">Input Jurnal Pembelajaran:</h4>
                <input
                  type="text"
                  placeholder="Topik/Materi (Contoh: Hukum II Newton)"
                  value={journalForm.topic}
                  onChange={(e) => setJournalForm({ ...journalForm, topic: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
                <textarea
                  placeholder="Tujuan Pembelajaran (TP)"
                  value={journalForm.learning_objective}
                  onChange={(e) => setJournalForm({ ...journalForm, learning_objective: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
                <button
                  onClick={() => {
                    saveJournalMutation.mutate({
                      session_id: selectedSession?.id,
                      topic: journalForm.topic || 'Hukum II Newton',
                      learning_objective: journalForm.learning_objective || 'Siswa dapat menganalisis percepatan.'
                    });
                    setWizardStep(4);
                  }}
                  className="w-full py-2.5 bg-emerald-600 text-white font-bold rounded-xl"
                >
                  Simpan Jurnal & Lanjut
                </button>
              </div>
            )}

            {/* STEP 4: Finish KBM */}
            {wizardStep === 4 && (
              <div className="space-y-4 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="text-base font-bold text-slate-800">Selesaikan Sesi KBM Hari Ini?</h4>
                <p className="text-xs text-slate-500">Durasi dan rekapitulasi akan otomatis tersimpan di database.</p>
                <button
                  onClick={() => {
                    finishSessionMutation.mutate({
                      session_id: selectedSession?.id
                    });
                  }}
                  className="px-6 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-lg"
                >
                  Selesaikan KBM
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL JURNAL MENGAJAR */}
      {showJournalModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-800">Form Jurnal Mengajar</h3>
            <input
              type="text"
              placeholder="Materi / Topik"
              value={journalForm.topic}
              onChange={(e) => setJournalForm({ ...journalForm, topic: e.target.value })}
              className="w-full p-2.5 text-xs bg-slate-50 border rounded-xl"
            />
            <textarea
              placeholder="Tujuan Pembelajaran (TP)"
              value={journalForm.learning_objective}
              onChange={(e) => setJournalForm({ ...journalForm, learning_objective: e.target.value })}
              className="w-full p-2.5 text-xs bg-slate-50 border rounded-xl"
            />
            <div className="flex justify-end space-x-2">
              <button onClick={() => setShowJournalModal(false)} className="px-4 py-2 bg-slate-100 text-xs rounded-xl">Batal</button>
              <button
                onClick={() => saveJournalMutation.mutate(journalForm)}
                className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl"
              >
                Simpan Jurnal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL MATERI */}
      {showMaterialModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-800">Unggah Materi Pembelajaran</h3>
            <input
              type="text"
              placeholder="Judul Materi"
              value={materialForm.title}
              onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
              className="w-full p-2.5 text-xs bg-slate-50 border rounded-xl"
            />
            <input
              type="text"
              placeholder="URL Berkas / Google Drive / Video"
              value={materialForm.file_url}
              onChange={(e) => setMaterialForm({ ...materialForm, file_url: e.target.value })}
              className="w-full p-2.5 text-xs bg-slate-50 border rounded-xl"
            />
            <div className="flex justify-end space-x-2">
              <button onClick={() => setShowMaterialModal(false)} className="px-4 py-2 bg-slate-100 text-xs rounded-xl">Batal</button>
              <button
                onClick={() => saveMaterialMutation.mutate(materialForm)}
                className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl"
              >
                Unggah
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TUGAS */}
      {showAssignmentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-800">Buat Tugas Baru</h3>
            <input
              type="text"
              placeholder="Judul Tugas"
              value={assignmentForm.title}
              onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
              className="w-full p-2.5 text-xs bg-slate-50 border rounded-xl"
            />
            <textarea
              placeholder="Deskripsi & Instruksi"
              value={assignmentForm.description}
              onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
              className="w-full p-2.5 text-xs bg-slate-50 border rounded-xl"
            />
            <div className="flex justify-end space-x-2">
              <button onClick={() => setShowAssignmentModal(false)} className="px-4 py-2 bg-slate-100 text-xs rounded-xl">Batal</button>
              <button
                onClick={() => saveAssignmentMutation.mutate(assignmentForm)}
                className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl"
              >
                Terbitkan Tugas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL RESCHEDULE */}
      {showRescheduleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-800">Ajukan Reschedule Jadwal KBM</h3>
            <textarea
              placeholder="Alasan Perubahan Jadwal"
              value={rescheduleForm.reason}
              onChange={(e) => setRescheduleForm({ ...rescheduleForm, reason: e.target.value })}
              className="w-full p-2.5 text-xs bg-slate-50 border rounded-xl"
            />
            <div className="flex justify-end space-x-2">
              <button onClick={() => setShowRescheduleModal(false)} className="px-4 py-2 bg-slate-100 text-xs rounded-xl">Batal</button>
              <button
                onClick={() => rescheduleMutation.mutate(rescheduleForm)}
                className="px-4 py-2 bg-amber-600 text-white font-bold text-xs rounded-xl"
              >
                Proses Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL REPORT PREVIEW */}
      {showReportPreviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Kop Surat Sekolah */}
            <div className="border-b-4 border-double border-slate-800 pb-4 text-center space-y-1">
              <h2 className="text-xl font-black text-slate-900 uppercase">YAYASAN PENDIDIKAN PESANTREN TERPADU</h2>
              <h3 className="text-base font-extrabold text-emerald-800 uppercase">MADRASAH ALIYAH / SMA ISLAM TERPADU</h3>
              <p className="text-[11px] text-slate-600">Jl. Pesantren No. 1 Kompleks Utama • Telp (021) 88997766 • Website: www.pesantren.sch.id</p>
            </div>

            <div className="text-center">
              <h4 className="text-sm font-bold uppercase underline text-slate-800">LAPORAN REKAPITULASI KBM COMMAND CENTER</h4>
              <p className="text-xs text-slate-500">Tahun Ajaran {selectedAcademicYear} - Semester {selectedSemester}</p>
            </div>

            <div className="text-xs space-y-2">
              <div className="flex justify-between p-2 bg-slate-50 rounded">
                <span>Total Sesi KBM Terlaksana:</span>
                <span className="font-bold">142 Sesi</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 rounded">
                <span>Rata-Rata Presensi Kehadiran Santri:</span>
                <span className="font-bold text-emerald-700">96.8%</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 rounded">
                <span>Tingkat Keterisian Jurnal Mengajar:</span>
                <span className="font-bold text-emerald-700">98.2%</span>
              </div>
            </div>

            <div className="pt-8 flex justify-between text-xs text-slate-700 border-t">
              <div>
                <p>Wakil Kepala Sekolah Bid. Kurikulum</p>
                <div className="h-16" />
                <p className="font-bold underline">Ustadz Drs. H. Ahmad Dahlan</p>
              </div>
              <div className="text-right">
                <p>Kepala Sekolah / Madrasah</p>
                <div className="h-16" />
                <p className="font-bold underline">Ustadz Dr. KH. Abdullah, M.A.</p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button onClick={() => setShowReportPreviewModal(false)} className="px-4 py-2 bg-slate-100 text-xs rounded-xl font-semibold">Tutup</button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-5 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-1"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
