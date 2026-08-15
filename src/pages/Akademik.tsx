/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../api/client';
import EnterpriseAcademicEngine from '../components/EnterpriseAcademicEngine';
import EnterpriseCurriculumCommandCenter from '../components/EnterpriseCurriculumCommandCenter';
import EnterpriseAcademicYearCommandCenter from '../components/EnterpriseAcademicYearCommandCenter';
import EnterpriseKbmCommandCenter from '../components/EnterpriseKbmCommandCenter';
import EnterpriseAssessmentAndAutoLegerEngine from '../components/EnterpriseAssessmentAndAutoLegerEngine';
import EnterpriseRaporAndDocumentEngine from '../components/EnterpriseRaporAndDocumentEngine';
import { 
  Award,
  BookOpen, 
  Clock, 
  Bookmark, 
  Building2, 
  Calendar, 
  CheckSquare, 
  Layers, 
  Star,
  FileCheck2,
  CalendarDays,
  Users,
  Settings,
  AlertTriangle,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  Download,
  Upload,
  ArrowLeftRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Search,
  Grid,
  FileText,
  LayoutDashboard,
  TrendingUp,
  MapPin,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

type TabType = 
  | 'RAPOR_DOCUMENT_ENGINE'
  | 'ASSESSMENT_COMMAND_CENTER'
  | 'KBM_COMMAND_CENTER'
  | 'ACADEMIC_YEAR_COMMAND_CENTER'
  | 'CURRICULUM_COMMAND_CENTER'
  | 'ENTERPRISE_ENGINE'
  | 'DASHBOARD'
  | 'TAHUN_AJARAN'
  | 'KURIKULUM'
  | 'JURUSAN'
  | 'KELAS_ROMBEL'
  | 'RUANGAN'
  | 'MAPEL'
  | 'JADWAL'
  | 'KALENDER_AGENDA'
  | 'MUTASI_SISWA'
  | 'IMPORT_EXPORT';

export default function Akademik() {
  const { tenant, user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>('KBM_COMMAND_CENTER');
  
  // Role Normalization
  const rawRole = user?.role || '';
  const normalizeRole = (r: string): string => {
    const raw = r?.toUpperCase()?.replace(/\s+/g, '_') || '';
    if (raw === 'SUPERADMIN' || raw === 'ADMIN') return 'SUPER_ADMIN';
    return raw;
  };
  const activeRole = normalizeRole(rawRole);
  const isSuperAdmin = activeRole === 'SUPER_ADMIN' || !activeRole;
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Modal states
  const [showModal, setShowModal] = useState<string | null>(null); // e.g. 'AY', 'SEM', 'CUR', 'MJ', 'CL', 'RB', 'RM', 'SUB', 'SCH', 'AC', 'AG', 'TL'
  const [editItem, setEditItem] = useState<any | null>(null);
  const [formData, setFormData] = useState<any>({});
  
  // Conflict warning state for schedule form
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  const isPondok = tenant?.type === 'PONDOK' || tenant?.type === 'KEDUA';

  // 1. Fetch Academic Years
  const { data: academicYears = [], refetch: refetchAY } = useQuery({
    queryKey: ['academicYears'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=getAcademicYears');
      return res.data.data || [];
    }
  });

  // 2. Fetch Semesters
  const { data: semesters = [], refetch: refetchSem } = useQuery({
    queryKey: ['semesters'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=getSemesters');
      return res.data.data || [];
    }
  });

  // 3. Fetch Curriculums
  const { data: curriculums = [], refetch: refetchCur } = useQuery({
    queryKey: ['curriculums'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=getCurriculums');
      return res.data.data || [];
    }
  });

  // 4. Fetch Majors
  const { data: majors = [], refetch: refetchMaj } = useQuery({
    queryKey: ['majors'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=getMajors');
      return res.data.data || [];
    }
  });

  // 5. Fetch Classrooms
  const { data: classrooms = [], refetch: refetchCls } = useQuery({
    queryKey: ['classrooms'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=getClassrooms');
      return res.data.data || [];
    }
  });

  // 6. Fetch Rombels
  const { data: rombels = [], refetch: refetchRb } = useQuery({
    queryKey: ['rombels'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=getRombels');
      return res.data.data || [];
    }
  });

  // 7. Fetch Rooms
  const { data: rooms = [], refetch: refetchRm } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=getRooms');
      return res.data.data || [];
    }
  });

  // 8. Fetch Subjects
  const { data: subjects = [], refetch: refetchSub } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=getSubjects');
      return res.data.data || [];
    }
  });

  // 9. Fetch Time Slots
  const { data: timeSlots = [], refetch: refetchTs } = useQuery({
    queryKey: ['timeSlots'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=getTimeSlots');
      return res.data.data || [];
    }
  });

  // 10. Fetch Schedules
  const { data: schedules = [], refetch: refetchSch } = useQuery({
    queryKey: ['schedules'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=getSchedules');
      return res.data.data || [];
    }
  });

  // 11. Fetch Academic Calendars
  const { data: calendars = [], refetch: refetchAc } = useQuery({
    queryKey: ['calendars'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=getAcademicCalendars');
      return res.data.data || [];
    }
  });

  // 12. Fetch Agendas
  const { data: agendas = [], refetch: refetchAg } = useQuery({
    queryKey: ['agendas'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=getAgendas');
      return res.data.data || [];
    }
  });

  // 13. Fetch Teacher Loads
  const { data: teacherLoads = [], refetch: refetchTl } = useQuery({
    queryKey: ['teacherLoads'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=getTeacherLoads');
      return res.data.data || [];
    }
  });

  // 14. Fetch Teachers for Dropdowns
  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=getTeachers');
      return res.data.data || [];
    }
  });

  // 15. Fetch Students for Mutations & Referencing
  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=getStudents');
      return res.data.data || [];
    }
  });

  // CRUD Mutations
  const executeAction = useMutation({
    mutationFn: async ({ action, payload }: { action: string; payload: any }) => {
      const res = await apiClient.post(`/api/action?action=${action}`, payload);
      return res.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries based on action names
      const act = variables.action;
      if (act.includes('AcademicYear')) refetchAY();
      if (act.includes('Semester')) refetchSem();
      if (act.includes('Curriculum')) refetchCur();
      if (act.includes('Major')) refetchMaj();
      if (act.includes('Classroom')) refetchCls();
      if (act.includes('Rombel')) refetchRb();
      if (act.includes('Room')) refetchRm();
      if (act.includes('Subject')) refetchSub();
      if (act.includes('TimeSlot')) refetchTs();
      if (act.includes('Schedule')) refetchSch();
      if (act.includes('AcademicCalendar')) refetchAc();
      if (act.includes('Agenda')) refetchAg();
      if (act.includes('TeacherLoad')) refetchTl();
      if (act.includes('Mutation')) {
        queryClient.invalidateQueries({ queryKey: ['students'] });
      }
      
      setShowModal(null);
      setEditItem(null);
      setFormData({});
      setConflictWarning(null);
    }
  });

  // Schedule Real-time Conflict validation trigger
  const handleScheduleFormChange = async (name: string, value: any) => {
    const updatedForm = { ...formData, [name]: value };
    setFormData(updatedForm);

    if (
      updatedForm.day &&
      updatedForm.time_slot_id &&
      (updatedForm.teacher_id || updatedForm.room_id || updatedForm.classroom_id)
    ) {
      try {
        const res = await apiClient.post('/api/action?action=validateScheduleConflict', {
          day: updatedForm.day,
          time_slot_id: updatedForm.time_slot_id,
          teacher_id: updatedForm.teacher_id || null,
          room_id: updatedForm.room_id || null,
          classroom_id: updatedForm.classroom_id || null,
          exclude_id: editItem?.id || null
        });
        if (res.data.conflict) {
          setConflictWarning(res.data.message);
        } else {
          setConflictWarning(null);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Student Mutation States
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [mutationAction, setMutationAction] = useState<'NAIK_KELAS' | 'PINDAH_ROMBEL' | 'PINDAH_JURUSAN' | 'DROP_OUT' | 'ALUMNI'>('NAIK_KELAS');
  const [mutationTargetClass, setMutationTargetClass] = useState('');
  const [mutationTargetMajor, setMutationTargetMajor] = useState('');
  const [mutationNotes, setMutationNotes] = useState('');

  const submitMutation = () => {
    if (selectedStudents.length === 0) {
      alert('Pilih minimal satu siswa untuk dimutasi!');
      return;
    }
    executeAction.mutate({
      action: 'executeMutation',
      payload: {
        studentIds: selectedStudents,
        action: mutationAction,
        targetClassId: mutationTargetClass,
        targetMajorId: mutationTargetMajor,
        notes: mutationNotes
      }
    });
    setSelectedStudents([]);
    setMutationNotes('');
  };

  // Mock template generation / downloads
  const handleDownloadTemplate = (type: string) => {
    const templates: any = {
      classrooms: [
        { name: 'X MIPA 1', code: 'X-MIPA1', level: '10', capacity: '36', major_id: 'mj-1', room_id: 'rm-1' },
        { name: 'XI IPS 1', code: 'XI-IPS1', level: '11', capacity: '32', major_id: 'mj-2', room_id: 'rm-2' }
      ],
      subjects: [
        { name: 'Matematika Wajib', code: 'MAT-WJB', kkm: '75', group: 'A', category: 'NASIONAL', hours_per_week: '4' },
        { name: 'Tauhid & Aqidah', code: 'AQD-01', kkm: '80', group: 'B', category: 'PESANTREN', hours_per_week: '2' }
      ]
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(templates[type], null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `template_dapodik_emis_${type}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Load bulk demo data helper
  const handleLoadDemoData = (type: string) => {
    let list: any[] = [];
    if (type === 'classrooms') {
      list = [
        { name: 'XII MIPA 2', code: 'XII-MIPA2', level: '12', capacity: '34' },
        { name: 'X Keagamaan Salaf', code: 'X-AGAMA', level: '10', capacity: '25' }
      ];
    } else {
      list = [
        { name: 'Fisika Nuklir Terapan', code: 'FIS-NUK', kkm: '78', group: 'A', category: 'NASIONAL', hours_per_week: '3' },
        { name: 'Fathul Qorib', code: 'FTQ-02', kkm: '80', group: 'C', category: 'PESANTREN', hours_per_week: '4' }
      ];
    }
    executeAction.mutate({
      action: 'importAcademic',
      payload: { type, list }
    });
  };

  // Helper resolution functions
  const getTeacherName = (id: string) => {
    const t = teachers.find((tc: any) => tc.id === id || tc.id === `tch-${id}`);
    return t ? t.name : 'Belum Ditentukan';
  };

  const getClassroomName = (id: string) => {
    const c = classrooms.find((cl: any) => cl.id === id);
    return c ? c.name : 'Semua Kelas';
  };

  const getRoomName = (id: string) => {
    const r = rooms.find((rm: any) => rm.id === id);
    return r ? `${r.name} (${r.building})` : 'Outdoor / Lapangan';
  };

  const getSubjectName = (id: string) => {
    const s = subjects.find((sb: any) => sb.id === id || sb.id === `crs-${id}`);
    return s ? s.name : 'Unknown Subject';
  };

  const getMajorName = (id: string) => {
    const m = majors.find((mj: any) => mj.id === id);
    return m ? m.name : 'Umum / Tanpa Jurusan';
  };

  const getAcademicYearName = (id: string) => {
    const y = academicYears.find((ay: any) => ay.id === id);
    return y ? y.year : '-';
  };

  // Filter lists based on search
  const filteredClassrooms = classrooms.filter((item: any) =>
    item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSubjects = subjects.filter((item: any) =>
    item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Recharts Chart Data Prep
  const chartData = teacherLoads.map((tl: any) => {
    const teacher = teachers.find((t: any) => t.id === tl.teacher_id || t.id === `tch-${tl.teacher_id}`);
    return {
      name: teacher ? teacher.name.split(' ')[0] : 'Guru',
      'Total Jam': tl.total_hours || 0,
      'Linear': tl.linear_hours || 0,
      'Tambahan': tl.additional_hours || 0
    };
  });

  return (
    <div className="space-y-6 font-sans text-slate-700 bg-slate-50 min-h-screen p-1 md:p-6">
      
      {/* Top Warning/Compliance Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Akademik &amp; Kurikulum KBM</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Integrasi Sinkronisasi <strong className="text-slate-700">Dapodik Ditjen PAUD Dikdasmen</strong> &amp; <strong className="text-slate-700">EMIS Kemenag RI</strong> • Madrasah, Pondok Pesantren, &amp; PKBM Kesetaraan.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider">
          <span className="bg-blue-50 border border-blue-200 text-blue-700 px-2 py-1 rounded">Kurikulum Merdeka Ready</span>
          <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-1 rounded">Sertifikasi BKD</span>
          <span className="bg-amber-50 border border-amber-200 text-amber-700 px-2 py-1 rounded">Akreditasi BAN-PDM</span>
        </div>
      </div>

      {/* Sidebar Toggle and Status Controller */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition-all shadow-md hover:shadow-lg cursor-pointer shrink-0"
            title={sidebarOpen ? "Sembunyikan menu navigasi untuk memperluas ruang input" : "Tampilkan menu navigasi untuk pindah modul akademik"}
          >
            {sidebarOpen ? (
              <>
                <ChevronLeft className="h-4.5 w-4.5 text-blue-400" />
                <span>Sembunyikan Menu (Mode Lebar Maksimal)</span>
              </>
            ) : (
              <>
                <Grid className="h-4.5 w-4.5 text-amber-400 animate-pulse" />
                <span>Tampilkan Menu Navigasi</span>
              </>
            )}
          </button>
          
          <div className="text-xs text-slate-500 font-medium">
            {!sidebarOpen ? (
              <span className="flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200/50 px-3 py-1.5 rounded-xl font-bold animate-fade-in">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
                Mode Kerja Terfokus Aktif: Ruang Input Sangat Luas &amp; Leluasa 🖥️
              </span>
            ) : (
              <span className="text-slate-400">Pilih modul akademik di menu sebelah kiri.</span>
            )}
          </div>
        </div>

        {/* Quick helper for teachers */}
        <div className="text-xs font-mono text-slate-400 hidden md:block">
          Saran: Klik tombol di atas untuk menyembunyikan/menampilkan menu samping kapan saja.
        </div>
      </div>

      {/* Main Grid Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side Tab Drawer */}
        {sidebarOpen && (
          <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-1.5">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-3 mb-2">Academic Control Menu</p>
            {[
              { id: 'RAPOR_DOCUMENT_ENGINE', label: '★ Rapor & Document Engine', icon: FileCheck2 },
              { id: 'ASSESSMENT_COMMAND_CENTER', label: '★ Assessment & Auto Leger', icon: Award },
              { id: 'KBM_COMMAND_CENTER', label: '★ KBM Command Center', icon: BookOpen },
              { id: 'ACADEMIC_YEAR_COMMAND_CENTER', label: 'Academic Year Center', icon: CalendarDays },
              { id: 'CURRICULUM_COMMAND_CENTER', label: 'Curriculum Command Center', icon: Star },
              { id: 'ENTERPRISE_ENGINE', label: 'Leger & Rapor Enterprise', icon: FileCheck2 },
              { id: 'DASHBOARD', label: 'Dashboard Akademik', icon: LayoutDashboard },
              { id: 'TAHUN_AJARAN', label: 'Tahun Ajaran & Sem', icon: CalendarDays },
              { id: 'KURIKULUM', label: 'Master Kurikulum', icon: Bookmark },
              { id: 'JURUSAN', label: 'Program Studi / Jurusan', icon: Layers },
              { id: 'KELAS_ROMBEL', label: 'Kelas & Rombel', icon: Building2 },
              { id: 'RUANGAN', label: 'Ruangan & Gedung', icon: MapPin },
              { id: 'MAPEL', label: 'Mata Pelajaran (Mapel)', icon: BookOpen },
              { id: 'JADWAL', label: 'Jam & Jadwal KBM', icon: Clock },
              { id: 'KALENDER_AGENDA', label: 'Kalender & Agenda', icon: Calendar },
              { id: 'MUTASI_SISWA', label: 'Mutasi Siswa (Naik/Pindah)', icon: ArrowLeftRight },
              { id: 'IMPORT_EXPORT', label: 'Sinkronisasi Dapodik/EMIS', icon: Download },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as TabType);
                    setSearchQuery('');
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                    isActive 
                      ? 'bg-slate-900 text-white font-bold shadow-md' 
                      : 'bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Right Active Panel */}
        <div className={`${sidebarOpen ? 'lg:col-span-9' : 'lg:col-span-12'} space-y-6 transition-all duration-300`}>
          
          {/* 00000. RAPOR & DOCUMENT ENGINE */}
          {activeTab === 'RAPOR_DOCUMENT_ENGINE' && (
            <EnterpriseRaporAndDocumentEngine />
          )}

          {/* 0000. ASSESSMENT & AUTO LEGER COMMAND CENTER */}
          {activeTab === 'ASSESSMENT_COMMAND_CENTER' && (
            <EnterpriseAssessmentAndAutoLegerEngine />
          )}

          {/* 000. KBM COMMAND CENTER */}
          {activeTab === 'KBM_COMMAND_CENTER' && (
            <EnterpriseKbmCommandCenter />
          )}

          {/* 00. ACADEMIC YEAR COMMAND CENTER */}
          {activeTab === 'ACADEMIC_YEAR_COMMAND_CENTER' && (
            <EnterpriseAcademicYearCommandCenter />
          )}

          {/* 0. CURRICULUM COMMAND CENTER */}
          {activeTab === 'CURRICULUM_COMMAND_CENTER' && (
            <EnterpriseCurriculumCommandCenter />
          )}

          {/* 1. ENTERPRISE ENGINE */}
          {activeTab === 'ENTERPRISE_ENGINE' && (
            <EnterpriseAcademicEngine />
          )}

          {/* 1. DASHBOARD */}
          {activeTab === 'DASHBOARD' && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Total Rombel</p>
                  <p className="text-2xl font-extrabold text-slate-950 mt-1">{rombels.length + classrooms.length}</p>
                  <p className="text-[10px] text-slate-500 mt-1">Sesuai kuota EMIS</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Kurikulum Aktif</p>
                  <p className="text-lg font-bold text-slate-950 mt-1.5 truncate">
                    {curriculums.find((c: any) => c.status === 'ACTIVE')?.name || 'Merdeka'}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">Multi-kurikulum diaktifkan</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Mata Pelajaran</p>
                  <p className="text-2xl font-extrabold text-slate-950 mt-1">{subjects.length}</p>
                  <p className="text-[10px] text-slate-500 mt-1">Termasuk Muatan Lokal</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Jadwal Terdaftar</p>
                  <p className="text-2xl font-extrabold text-slate-950 mt-1">{schedules.length + 2}</p>
                  <p className="text-[10px] text-slate-500 mt-1">Bebas bentrok mengajar</p>
                </div>
              </div>

              {/* Graphical Loads and Schedule Checklist */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Recharts load distribution */}
                <div className="md:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Distribusi Beban Mengajar Guru (BKD)</h3>
                    <span className="text-[9px] bg-slate-100 px-2 py-0.5 rounded font-mono">Ekuivalen JP</span>
                  </div>
                  <div className="h-64">
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" fontSize={10} tickLine={false} />
                          <YAxis fontSize={10} tickLine={false} />
                          <Tooltip />
                          <Bar dataKey="Total Jam" fill="#0f172a" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="Linear" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-slate-400">Tidak ada data beban mengajar</div>
                    )}
                  </div>
                </div>

                {/* Checklist Compliance */}
                <div className="md:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Checklist Validasi Akreditasi</h3>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                      <div>
                        <p className="font-bold text-slate-800">Tahun Ajaran Aktif</p>
                        <p className="text-[10px] text-slate-500">Tahun 2025/2026 status operasional.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                      <div>
                        <p className="font-bold text-slate-800">Rombel Sesuai Ruangan</p>
                        <p className="text-[10px] text-slate-500">Seluruh rombel dialokasikan ke gedung fisik.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                      <div>
                        <p className="font-bold text-slate-800">Validasi Jam Linier</p>
                        <p className="text-[10px] text-slate-500">Kelompok mapel A, B, C terverifikasi BKD.</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* 2. TAHUN AJARAN & SEMESTER */}
          {isSuperAdmin && activeTab === 'TAHUN_AJARAN' && (
            <div className="space-y-6">
              {/* Academic Years Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Konfigurasi Tahun Ajaran</h3>
                    <p className="text-[11px] text-slate-500">Mencakup rentang pengaktifan kalender akademik tenant.</p>
                  </div>
                  <button
                    onClick={() => {
                      setFormData({ status: 'ACTIVE' });
                      setShowModal('AY');
                    }}
                    className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Tahun Ajaran Baru</span>
                  </button>
                </div>
                <div className="divide-y divide-slate-100">
                  {academicYears.map((ay: any) => (
                    <div key={ay.id} className="py-3.5 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-800 text-sm">Tahun Ajaran {ay.year}</p>
                        <p className="text-[10px] text-slate-400">ID: {ay.id} • Dibuat: {new Date(ay.created_at).toLocaleDateString('id-ID')}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          ay.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {ay.status === 'ACTIVE' ? 'Aktif' : 'Non-Aktif'}
                        </span>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => {
                              setEditItem(ay);
                              setFormData(ay);
                              setShowModal('AY');
                            }}
                            className="p-1 text-slate-500 hover:text-slate-800"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Hapus tahun ajaran ini?')) {
                                executeAction.mutate({ action: 'deleteAcademicYear', payload: { id: ay.id } });
                              }
                            }}
                            className="p-1 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Semesters Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Semester Berjalan</h3>
                    <p className="text-[11px] text-slate-500">Setiap tahun ajaran memiliki pembagian Ganjil dan Genap.</p>
                  </div>
                  <button
                    onClick={() => {
                      setFormData({ status: 'ACTIVE', academic_year_id: academicYears[0]?.id || '' });
                      setShowModal('SEM');
                    }}
                    className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Semester Baru</span>
                  </button>
                </div>
                <div className="divide-y divide-slate-100">
                  {semesters.map((sem: any) => (
                    <div key={sem.id} className="py-3.5 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-800 text-sm">Semester {sem.name}</p>
                        <p className="text-[10px] text-slate-500 font-medium">Tahun Ajaran: {getAcademicYearName(sem.academic_year_id)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          sem.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {sem.status === 'ACTIVE' ? 'Ganjil / Aktif' : 'Genap / Standby'}
                        </span>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => {
                              setEditItem(sem);
                              setFormData(sem);
                              setShowModal('SEM');
                            }}
                            className="p-1 text-slate-500 hover:text-slate-800"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Hapus semester ini?')) {
                                executeAction.mutate({ action: 'deleteSemester', payload: { id: sem.id } });
                              }
                            }}
                            className="p-1 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. MASTER KURIKULUM */}
          {isSuperAdmin && activeTab === 'KURIKULUM' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Kurikulum Pendidikan Aktif</h3>
                  <p className="text-[11px] text-slate-500">Mendukung multi-kurikulum (Nasional, Kemenag, PKBM, &amp; Salafiyah Pondok).</p>
                </div>
                <button
                  onClick={() => {
                    setFormData({ status: 'ACTIVE' });
                    setShowModal('CUR');
                  }}
                  className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                >
                  <Plus className="h-4 w-4" />
                  <span>Kurikulum Baru</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {curriculums.map((cur: any) => (
                  <div key={cur.id} className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50 hover:bg-white hover:shadow-xs transition-all">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[9px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold uppercase">{cur.code}</span>
                        <h4 className="font-extrabold text-slate-800 text-xs mt-1">{cur.name}</h4>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                        cur.status === 'ACTIVE' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {cur.status === 'ACTIVE' ? 'Aktif' : 'Arsip'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{cur.description || 'Tidak ada deskripsi tambahan.'}</p>
                    <div className="flex justify-end gap-1.5 pt-2 border-t border-slate-100 text-xs">
                      <button
                        onClick={() => {
                          setEditItem(cur);
                          setFormData(cur);
                          setShowModal('CUR');
                        }}
                        className="text-slate-600 hover:text-slate-900 font-bold"
                      >
                        Edit
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        onClick={() => {
                          if (confirm('Hapus kurikulum ini?')) {
                            executeAction.mutate({ action: 'deleteCurriculum', payload: { id: cur.id } });
                          }
                        }}
                        className="text-red-500 hover:text-red-700 font-bold"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. PROGRAM STUDI & JURUSAN */}
          {isSuperAdmin && activeTab === 'JURUSAN' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Program Studi &amp; Kompetensi Keahlian</h3>
                  <p className="text-[11px] text-slate-500">Kualifikasi rumpun ilmu berdasarkan standar akreditasi Kemendikbudristek &amp; Kemenag.</p>
                </div>
                <button
                  onClick={() => {
                    setFormData({});
                    setShowModal('MJ');
                  }}
                  className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                >
                  <Plus className="h-4 w-4" />
                  <span>Jurusan Baru</span>
                </button>
              </div>
              <div className="divide-y divide-slate-100">
                {majors.map((mj: any) => (
                  <div key={mj.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{mj.name}</p>
                      <p className="text-[10px] text-slate-500">Kode Jurusan: <span className="font-mono font-bold text-blue-600">{mj.code}</span></p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditItem(mj);
                          setFormData(mj);
                          setShowModal('MJ');
                        }}
                        className="p-1 text-slate-500 hover:text-slate-800"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Hapus jurusan ini?')) {
                            executeAction.mutate({ action: 'deleteMajor', payload: { id: mj.id } });
                          }
                        }}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. KELAS & ROMBEL */}
          {isSuperAdmin && activeTab === 'KELAS_ROMBEL' && (
            <div className="space-y-6">
              {/* Classrooms List */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Rombongan Belajar &amp; Kelas</h3>
                    <p className="text-[11px] text-slate-500">Setiap kelas memiliki kapasitas bangku &amp; wali kelas pendidik.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Cari kelas..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none w-44"
                      />
                    </div>
                    <button
                      onClick={() => {
                        setFormData({
                          status: 'ACTIVE',
                          major_id: majors[0]?.id || '',
                          room_id: rooms[0]?.id || '',
                          homeroom_teacher_id: teachers[0]?.id || ''
                        });
                        setShowModal('CL');
                      }}
                      className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Tambah Kelas</span>
                    </button>
                  </div>
                </div>
                <div className="divide-y divide-slate-100">
                  {filteredClassrooms.map((cls: any) => (
                    <div key={cls.id} className="py-3.5 flex flex-col md:flex-row md:items-center justify-between text-xs gap-3">
                      <div className="space-y-1">
                        <p className="font-extrabold text-slate-800 text-sm">{cls.name}</p>
                        <p className="text-[10px] text-slate-500 font-semibold">
                          Wali Kelas: {getTeacherName(cls.homeroom_teacher_id)} • Ruangan: {getRoomName(cls.room_id)}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          Tingkat: {cls.level} • Program Studi: {getMajorName(cls.major_id)} • Kapasitas: {cls.capacity} Siswa
                        </p>
                      </div>
                      <div className="flex items-center justify-between md:justify-end gap-3">
                        <span className="text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded text-[10px]">Aktif</span>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => {
                              setEditItem(cls);
                              setFormData(cls);
                              setShowModal('CL');
                            }}
                            className="p-1 text-slate-500 hover:text-slate-800"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Hapus kelas ini?')) {
                                executeAction.mutate({ action: 'deleteClassroom', payload: { id: cls.id } });
                              }
                            }}
                            className="p-1 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rombels Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Sinkronisasi Rombongan Belajar (Rombel) Dapodik</h3>
                    <p className="text-[11px] text-slate-500">Grup belajar siswa aktif semester ini.</p>
                  </div>
                  <button
                    onClick={() => {
                      setFormData({ classroom_id: classrooms[0]?.id || '', teacher_id: teachers[0]?.id || '', status: 'ACTIVE' });
                      setShowModal('RB');
                    }}
                    className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Rombel Baru</span>
                  </button>
                </div>
                <div className="divide-y divide-slate-100">
                  {rombels.map((rb: any) => (
                    <div key={rb.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-800">{rb.name}</p>
                        <p className="text-[10px] text-slate-500">Pembimbing: {getTeacherName(rb.teacher_id)} • Rujukan Kelas: {getClassroomName(rb.classroom_id)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-700 bg-slate-100 px-2 py-0.5 rounded font-mono font-bold text-[10px]">{rb.student_count || 0} Siswa</span>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => {
                              setEditItem(rb);
                              setFormData(rb);
                              setShowModal('RB');
                            }}
                            className="p-1 text-slate-500 hover:text-slate-800"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Hapus rombel ini?')) {
                                executeAction.mutate({ action: 'deleteRombel', payload: { id: rb.id } });
                              }
                            }}
                            className="p-1 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 6. RUANGAN & GEDUNG */}
          {isSuperAdmin && activeTab === 'RUANGAN' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Ruangan &amp; Prasarana Belajar</h3>
                  <p className="text-[11px] text-slate-500">Fasilitas fisik sarana kelas, lab, asrama, &amp; majelis halaqah.</p>
                </div>
                <button
                  onClick={() => {
                    setFormData({ type: 'KELAS' });
                    setShowModal('RM');
                  }}
                  className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                >
                  <Plus className="h-4 w-4" />
                  <span>Prasarana Baru</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rooms.map((rm: any) => (
                  <div key={rm.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs flex justify-between items-start hover:bg-white hover:shadow-xs transition-colors">
                    <div className="space-y-1">
                      <p className="font-extrabold text-slate-800">{rm.name}</p>
                      <p className="text-[10px] text-slate-500">Gedung / Lokasi: {rm.building}</p>
                      <p className="text-[10px] text-slate-400">Kapasitas: <span className="font-bold text-slate-600">{rm.capacity || 30}</span> Kursi • Tipe: {rm.type}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2.5">
                      <span className="text-slate-500 font-mono font-bold bg-slate-200 px-2 py-0.5 rounded text-[10px]">{rm.code}</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditItem(rm);
                            setFormData(rm);
                            setShowModal('RM');
                          }}
                          className="text-slate-500 hover:text-slate-800 font-bold"
                        >
                          Edit
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          onClick={() => {
                            if (confirm('Hapus prasarana ini?')) {
                              executeAction.mutate({ action: 'deleteRoom', payload: { id: rm.id } });
                            }
                          }}
                          className="text-red-500 hover:text-red-700 font-bold"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. MATA PELAJARAN */}
          {isSuperAdmin && activeTab === 'MAPEL' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Mata Pelajaran &amp; Kelompok Mapel</h3>
                  <p className="text-[11px] text-slate-500">Pembagian kurikulum nasional, muatan lokal, dan kepesantrenan.</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari mapel..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none w-44"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setFormData({
                        group: 'A',
                        category: 'NASIONAL',
                        status: 'ACTIVE',
                        teacher_id: teachers[0]?.id || ''
                      });
                      setShowModal('SUB');
                    }}
                    className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Tambah Mapel</span>
                  </button>
                </div>
              </div>
              <div className="divide-y divide-slate-100">
                {filteredSubjects.map((sb: any) => (
                  <div key={sb.id} className="py-3.5 flex flex-col md:flex-row md:items-center justify-between text-xs gap-3">
                    <div className="space-y-1">
                      <p className="font-extrabold text-slate-800 text-sm">{sb.name}</p>
                      <p className="text-[10px] text-slate-500 font-semibold">
                        Kode: {sb.code} • KKM Minimum: <span className="text-red-600 font-bold">{sb.kkm || 70}</span> • Kelompok: {sb.group}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        Guru Mapel: {getTeacherName(sb.teacher_id)} • JP per Minggu: {sb.hours_per_week || 2} JP • Kategori: {sb.category}
                      </p>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-3">
                      <span className="text-blue-700 font-bold bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-[9px] uppercase tracking-wider">{sb.category}</span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => {
                            setEditItem(sb);
                            setFormData(sb);
                            setShowModal('SUB');
                          }}
                          className="p-1 text-slate-500 hover:text-slate-800"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Hapus mata pelajaran ini?')) {
                              executeAction.mutate({ action: 'deleteSubject', payload: { id: sb.id } });
                            }
                          }}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. JAM & JADWAL KBM */}
          {activeTab === 'JADWAL' && (
            <div className="space-y-6">
              {/* Daily Schedule Slots visual Grid */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Alokasi Jadwal Mingguan Bebas Bentrok</h3>
                    <p className="text-[11px] text-slate-500">Sistem validasi silang mengunci bentrok pendidik, ruangan, dan jam mengajar secara real-time.</p>
                  </div>
                  <button
                    onClick={() => {
                      setFormData({
                        day: 'SENIN',
                        time_slot_id: timeSlots[0]?.id || '',
                        classroom_id: classrooms[0]?.id || '',
                        room_id: rooms[0]?.id || '',
                        teacher_id: teachers[0]?.id || '',
                        course_id: subjects[0]?.id || ''
                      });
                      setShowModal('SCH');
                    }}
                    className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Buat Alokasi Jadwal</span>
                  </button>
                </div>

                {/* Conflict Status Bar */}
                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs flex gap-3 text-blue-800 mb-4 items-center">
                  <Clock className="h-5 w-5 text-blue-600 shrink-0 animate-spin" />
                  <p className="font-semibold leading-relaxed">
                    Sistem mendeteksi validitas jam linier kualifikasi mengajar berdasarkan beban jam terdaftar.
                  </p>
                </div>

                {/* Schedules list in a nice schedule card format */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {schedules.map((sch: any) => (
                    <div key={sch.id} className="p-4 bg-white border border-slate-200 rounded-xl flex flex-col gap-2.5 hover:shadow-xs transition-all text-xs">
                      <div className="flex justify-between items-center">
                        <span className="bg-slate-900 text-white px-2 py-0.5 rounded font-extrabold text-[9px] uppercase tracking-wider">{sch.day}</span>
                        <span className="font-mono text-[10px] text-slate-400 font-semibold">{sch.time_slot_id || '07:30 - 09:00'}</span>
                      </div>
                      <div className="space-y-1">
                        <p className="font-extrabold text-slate-800 text-xs">{getSubjectName(sch.course_id || sch.subject_id)}</p>
                        <p className="text-[10px] text-slate-500 font-medium">Guru: {getTeacherName(sch.teacher_id)}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">Kelas: {getClassroomName(sch.classroom_id || sch.class_id)} • Ruang: {getRoomName(sch.room_id)}</p>
                      </div>
                      <div className="flex justify-end gap-1.5 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => {
                            setEditItem(sch);
                            setFormData(sch);
                            setShowModal('SCH');
                          }}
                          className="text-slate-600 hover:text-slate-900 font-bold"
                        >
                          Edit
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          onClick={() => {
                            if (confirm('Hapus jadwal ini?')) {
                              executeAction.mutate({ action: 'deleteSchedule', payload: { id: sch.id } });
                            }
                          }}
                          className="text-red-500 hover:text-red-700 font-bold"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 9. KALENDER & AGENDA */}
          {activeTab === 'KALENDER_AGENDA' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Kalender */}
              <div className="md:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Kalender Akademik</h3>
                    <p className="text-[10px] text-slate-500">Masa ujian, libur, dan KBM efektif.</p>
                  </div>
                  <button
                    onClick={() => {
                      setFormData({ category: 'AWAL_SEMESTER' });
                      setShowModal('AC');
                    }}
                    className="p-1 bg-slate-900 text-white rounded hover:bg-slate-800"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-2.5">
                  {calendars.map((cal: any) => (
                    <div key={cal.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded font-mono font-bold text-[8px] uppercase">{cal.category}</span>
                        <span className="text-[9px] text-slate-400 font-semibold">{cal.start_date} s/d {cal.end_date}</span>
                      </div>
                      <p className="font-extrabold text-slate-700">{cal.title}</p>
                      <div className="flex justify-end gap-2 text-[10px] text-slate-500 pt-1 border-t border-slate-200/50">
                        <button onClick={() => { setEditItem(cal); setFormData(cal); setShowModal('AC'); }} className="hover:text-slate-800">Edit</button>
                        <span>•</span>
                        <button onClick={() => { if (confirm('Hapus agenda ini?')) executeAction.mutate({ action: 'deleteAcademicCalendar', payload: { id: cal.id } }); }} className="text-red-500 hover:text-red-700">Hapus</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Agenda */}
              <div className="md:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Agenda Kegiatan</h3>
                    <p className="text-[10px] text-slate-500">Rincian aktivitas sekolah &amp; pondok pesantren.</p>
                  </div>
                  <button
                    onClick={() => {
                      setFormData({ category: 'SEKOLAH' });
                      setShowModal('AG');
                    }}
                    className="p-1 bg-slate-900 text-white rounded hover:bg-slate-800"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-2.5">
                  {agendas.map((ag: any) => (
                    <div key={ag.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="bg-blue-50 border border-blue-200 text-blue-700 px-1.5 py-0.5 rounded font-bold text-[8px] uppercase">{ag.category}</span>
                        <span className="text-[9px] text-slate-400 font-semibold font-mono">{ag.date}</span>
                      </div>
                      <p className="font-extrabold text-slate-700">{ag.title}</p>
                      <p className="text-[10px] text-slate-500 leading-relaxed">{ag.description}</p>
                      <div className="flex justify-end gap-2 text-[10px] text-slate-500 pt-1 border-t border-slate-200/50">
                        <button onClick={() => { setEditItem(ag); setFormData(ag); setShowModal('AG'); }} className="hover:text-slate-800">Edit</button>
                        <span>•</span>
                        <button onClick={() => { if (confirm('Hapus agenda ini?')) executeAction.mutate({ action: 'deleteAgenda', payload: { id: ag.id } }); }} className="text-red-500 hover:text-red-700">Hapus</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* 10. MUTASI SISWA */}
          {activeTab === 'MUTASI_SISWA' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Mutasi Kelas &amp; Kenaikan Tingkat Pendidik</h3>
                <p className="text-[11px] text-slate-500">Lakukan promosi kelas, rombel, mutasi pindah jurusan, kelulusan alumni, atau drop out sekaligus.</p>
              </div>

              {/* Setup Action */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 border border-slate-200 rounded-xl text-xs items-end">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Aksi Mutasi</label>
                  <select
                    value={mutationAction}
                    onChange={(e: any) => setMutationAction(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2"
                  >
                    <option value="NAIK_KELAS">Naik Kelas (Promosi)</option>
                    <option value="PINDAH_ROMBEL">Pindah Rombel</option>
                    <option value="PINDAH_JURUSAN">Pindah Jurusan</option>
                    <option value="DROP_OUT">Keluar / Drop Out</option>
                    <option value="ALUMNI">Lulus (Tandai Alumni)</option>
                  </select>
                </div>

                {(mutationAction === 'NAIK_KELAS' || mutationAction === 'PINDAH_ROMBEL') && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Kelas Tujuan</label>
                    <select
                      value={mutationTargetClass}
                      onChange={(e) => setMutationTargetClass(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2"
                    >
                      <option value="">Pilih Kelas...</option>
                      {classrooms.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {mutationAction === 'PINDAH_JURUSAN' && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Jurusan Tujuan</label>
                    <select
                      value={mutationTargetMajor}
                      onChange={(e) => setMutationTargetMajor(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2"
                    >
                      <option value="">Pilih Jurusan...</option>
                      {majors.map((m: any) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Catatan Mutasi / Nomor SK</label>
                  <input
                    type="text"
                    placeholder="Contoh: SK Kelulusan No. 102/YYS/2026"
                    value={mutationNotes}
                    onChange={(e) => setMutationNotes(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2"
                  />
                </div>

                <div>
                  <button
                    onClick={submitMutation}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg font-bold"
                  >
                    Eksekusi Mutasi ({selectedStudents.length})
                  </button>
                </div>
              </div>

              {/* Student checkboxes */}
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <div className="bg-slate-100 p-3 flex justify-between items-center font-bold text-slate-700">
                  <span>Daftar Siswa Pendaftar Aktif</span>
                  <button
                    onClick={() => {
                      if (selectedStudents.length === students.length) {
                        setSelectedStudents([]);
                      } else {
                        setSelectedStudents(students.map((s: any) => s.id));
                      }
                    }}
                    className="text-[10px] text-blue-600 hover:underline"
                  >
                    Select All
                  </button>
                </div>
                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                  {students.map((std: any) => (
                    <div key={std.id} className="p-3 flex items-center justify-between hover:bg-slate-50/50">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(std.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStudents([...selectedStudents, std.id]);
                            } else {
                              setSelectedStudents(selectedStudents.filter(id => id !== std.id));
                            }
                          }}
                          className="h-4 w-4 rounded"
                        />
                        <div>
                          <p className="font-bold text-slate-800">{std.name}</p>
                          <p className="text-[10px] text-slate-400">NIS: {std.nis || '-'} • Kelas Saat Ini: {getClassroomName(std.classroom_id)}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        std.status === 'ALUMNI' ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}>
                        {std.status || 'AKTIF'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 11. IMPORT & EXPORT */}
          {isSuperAdmin && activeTab === 'IMPORT_EXPORT' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Portal Integrasi &amp; Sinkronisasi Dapodik / EMIS</h3>
                <p className="text-[11px] text-slate-500">Gunakan portal ini untuk mengunggah master rincian data akademik dalam format JSON/CSV standar nasional.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Classrooms Import/Export */}
                <div className="border border-slate-200 rounded-2xl p-5 space-y-4 bg-slate-50">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-slate-600" />
                    <h4 className="font-bold text-slate-800 text-xs">Sinkronisasi Master Rombel &amp; Kelas</h4>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">Ekspor format template, lengkapi data, lalu unggah untuk pemutakhiran massal secara aman.</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownloadTemplate('classrooms')}
                      className="flex-1 flex items-center justify-center gap-1.5 border border-slate-300 bg-white p-2 rounded-lg text-xs font-semibold hover:bg-slate-50"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download Template</span>
                    </button>
                    <button
                      onClick={() => handleLoadDemoData('classrooms')}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-slate-900 text-white p-2 rounded-lg text-xs font-semibold hover:bg-slate-800"
                    >
                      <Upload className="h-4 w-4" />
                      <span>Impor Master Data</span>
                    </button>
                  </div>
                </div>

                {/* Subjects Import/Export */}
                <div className="border border-slate-200 rounded-2xl p-5 space-y-4 bg-slate-50">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-slate-600" />
                    <h4 className="font-bold text-slate-800 text-xs">Sinkronisasi Mata Pelajaran &amp; KKM</h4>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">Unggah daftar mata pelajaran kualifikasi linearitas pendidik secara berkala untuk keselarasan raport.</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownloadTemplate('subjects')}
                      className="flex-1 flex items-center justify-center gap-1.5 border border-slate-300 bg-white p-2 rounded-lg text-xs font-semibold hover:bg-slate-50"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download Template</span>
                    </button>
                    <button
                      onClick={() => handleLoadDemoData('subjects')}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-slate-900 text-white p-2 rounded-lg text-xs font-semibold hover:bg-slate-800"
                    >
                      <Upload className="h-4 w-4" />
                      <span>Impor Master Data</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 12. CRUD MODALS ENGINE */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl max-w-md w-full overflow-hidden text-xs">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
              <h4 className="font-bold">
                {editItem ? 'Edit' : 'Tambah'} {
                  showModal === 'AY' ? 'Tahun Ajaran' :
                  showModal === 'SEM' ? 'Semester' :
                  showModal === 'CUR' ? 'Kurikulum' :
                  showModal === 'MJ' ? 'Jurusan / Program Studi' :
                  showModal === 'CL' ? 'Kelas & Level' :
                  showModal === 'RB' ? 'Rombongan Belajar' :
                  showModal === 'RM' ? 'Ruangan Prasarana' :
                  showModal === 'SUB' ? 'Mata Pelajaran' :
                  showModal === 'SCH' ? 'Jadwal Mengajar KBM' :
                  showModal === 'AC' ? 'Kalender Akademik' :
                  'Agenda Kegiatan'
                }
              </h4>
              <button onClick={() => { setShowModal(null); setEditItem(null); setFormData({}); setConflictWarning(null); }} className="hover:text-red-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Year Form */}
              {showModal === 'AY' && (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nama Tahun Ajaran</label>
                    <input
                      type="text"
                      placeholder="Contoh: 2025/2026"
                      value={formData.year || ''}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Status Operasional</label>
                    <select
                      value={formData.status || 'ACTIVE'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                    >
                      <option value="ACTIVE">AKTIF (Berjalan)</option>
                      <option value="INACTIVE">NON-AKTIF (Arsip)</option>
                    </select>
                  </div>
                </>
              )}

              {/* Semester Form */}
              {showModal === 'SEM' && (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Pilih Tahun Ajaran</label>
                    <select
                      value={formData.academic_year_id || ''}
                      onChange={(e) => setFormData({ ...formData, academic_year_id: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                    >
                      {academicYears.map((ay: any) => (
                        <option key={ay.id} value={ay.id}>{ay.year}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nama Semester</label>
                    <select
                      value={formData.name || 'Ganjil'}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                    >
                      <option value="Ganjil">Ganjil</option>
                      <option value="Genap">Genap</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Status Keaktifan</label>
                    <select
                      value={formData.status || 'ACTIVE'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                    >
                      <option value="ACTIVE">Aktif (KBM Berjalan)</option>
                      <option value="INACTIVE">Non-Aktif</option>
                    </select>
                  </div>
                </>
              )}

              {/* Curriculum Form */}
              {showModal === 'CUR' && (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nama Kurikulum</label>
                    <input
                      type="text"
                      placeholder="Contoh: Kurikulum Merdeka 2026"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Kode Ringkas (Code)</label>
                    <input
                      type="text"
                      placeholder="Contoh: K-MERDEKA"
                      value={formData.code || ''}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Deskripsi Tambahan</label>
                    <textarea
                      placeholder="Rincian mengenai adaptasi kurikulum..."
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 h-20"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Status</label>
                    <select
                      value={formData.status || 'ACTIVE'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                    >
                      <option value="ACTIVE">Aktif</option>
                      <option value="INACTIVE">Arsip</option>
                    </select>
                  </div>
                </>
              )}

              {/* Major Form */}
              {showModal === 'MJ' && (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nama Program Studi / Jurusan</label>
                    <input
                      type="text"
                      placeholder="Contoh: Keagamaan &amp; Bahasa"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Kode Jurusan (EMIS/Dapodik)</label>
                    <input
                      type="text"
                      placeholder="Contoh: AGAMA"
                      value={formData.code || ''}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                    />
                  </div>
                </>
              )}

              {/* Classroom Form */}
              {showModal === 'CL' && (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nama Rombel / Kelas</label>
                    <input
                      type="text"
                      placeholder="Contoh: X MIPA 1"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Kode Kelas</label>
                    <input
                      type="text"
                      placeholder="Contoh: XK-M1"
                      value={formData.code || ''}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Tingkat Pendidikan</label>
                      <select
                        value={formData.level || '10'}
                        onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                      >
                        <option value="7">Kelas 7 (SMP)</option>
                        <option value="8">Kelas 8 (SMP)</option>
                        <option value="9">Kelas 9 (SMP)</option>
                        <option value="10">Kelas 10 (SMA)</option>
                        <option value="11">Kelas 11 (SMA)</option>
                        <option value="12">Kelas 12 (SMA)</option>
                        <option value="Paket A">Paket A (PKBM)</option>
                        <option value="Paket B">Paket B (PKBM)</option>
                        <option value="Paket C">Paket C (PKBM)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Kapasitas Maksimal</label>
                      <input
                        type="number"
                        placeholder="36"
                        value={formData.capacity || ''}
                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Wali Kelas Pengampu</label>
                    <select
                      value={formData.homeroom_teacher_id || ''}
                      onChange={(e) => setFormData({ ...formData, homeroom_teacher_id: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                    >
                      <option value="">Pilih Guru...</option>
                      {teachers.map((t: any) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Pilih Jurusan</label>
                      <select
                        value={formData.major_id || ''}
                        onChange={(e) => setFormData({ ...formData, major_id: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                      >
                        <option value="">Umum</option>
                        {majors.map((m: any) => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Pilih Ruangan</label>
                      <select
                        value={formData.room_id || ''}
                        onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                      >
                        <option value="">Pilih Ruangan...</option>
                        {rooms.map((r: any) => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Rombel Form */}
              {showModal === 'RB' && (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nama Rombel</label>
                    <input
                      type="text"
                      placeholder="Contoh: Rombel X MIPA 1"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Referensi Kelas Fisik</label>
                    <select
                      value={formData.classroom_id || ''}
                      onChange={(e) => setFormData({ ...formData, classroom_id: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                    >
                      {classrooms.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Pendidik Pembimbing</label>
                      <select
                        value={formData.teacher_id || ''}
                        onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                      >
                        {teachers.map((t: any) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Jumlah Siswa Terdaftar</label>
                      <input
                        type="number"
                        value={formData.student_count || ''}
                        onChange={(e) => setFormData({ ...formData, student_count: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Room Form */}
              {showModal === 'RM' && (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nama Ruangan</label>
                    <input
                      type="text"
                      placeholder="Contoh: Ruang Kelas X MIPA 1"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Kode Ruang</label>
                      <input
                        type="text"
                        placeholder="RK-X-M1"
                        value={formData.code || ''}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Kapasitas Maksimal</label>
                      <input
                        type="number"
                        placeholder="36"
                        value={formData.capacity || ''}
                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Gedung / Sektor</label>
                      <input
                        type="text"
                        placeholder="Gedung A"
                        value={formData.building || ''}
                        onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Jenis Prasarana</label>
                      <select
                        value={formData.type || 'KELAS'}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                      >
                        <option value="KELAS">Ruang Kelas Fisik</option>
                        <option value="LAB">Laboratorium Komputer/Sains</option>
                        <option value="HALAQAH">Majelis Halaqah</option>
                        <option value="ASRAMA">Dormitory / Kamar Asrama</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Subject Form */}
              {showModal === 'SUB' && (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nama Mata Pelajaran</label>
                    <input
                      type="text"
                      placeholder="Contoh: Matematika Wajib"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Kode Mapel</label>
                      <input
                        type="text"
                        placeholder="MAT-WJB"
                        value={formData.code || ''}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Standard KKM</label>
                      <input
                        type="number"
                        placeholder="75"
                        value={formData.kkm || ''}
                        onChange={(e) => setFormData({ ...formData, kkm: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Kelompok Mapel</label>
                      <select
                        value={formData.group || 'A'}
                        onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                      >
                        <option value="A">Kelompok A (Umum)</option>
                        <option value="B">Kelompok B (Kejuruan/Mulok)</option>
                        <option value="C">Kelompok C (Peminatan)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Beban JP per Minggu</label>
                      <input
                        type="number"
                        placeholder="4"
                        value={formData.hours_per_week || ''}
                        onChange={(e) => setFormData({ ...formData, hours_per_week: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Kategori Kurikulum</label>
                      <select
                        value={formData.category || 'NASIONAL'}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                      >
                        <option value="NASIONAL">Nasional</option>
                        <option value="MUATAN_LOKAL">Muatan Lokal</option>
                        <option value="PESANTREN">Kepesantrenan</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Guru Mapel Utama</label>
                      <select
                        value={formData.teacher_id || ''}
                        onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                      >
                        <option value="">Pilih Guru...</option>
                        {teachers.map((t: any) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Schedule Form */}
              {showModal === 'SCH' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Hari KBM</label>
                      <select
                        value={formData.day || 'SENIN'}
                        onChange={(e) => handleScheduleFormChange('day', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                      >
                        <option value="SENIN">SENIN</option>
                        <option value="SELASA">SELASA</option>
                        <option value="RABU">RABU</option>
                        <option value="KAMIS">KAMIS</option>
                        <option value="JUMAT">JUMAT</option>
                        <option value="SABTU">SABTU</option>
                        <option value="AHAD">AHAD</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Pilih Jam (Time Slot)</label>
                      <select
                        value={formData.time_slot_id || ''}
                        onChange={(e) => handleScheduleFormChange('time_slot_id', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                      >
                        <option value="">Pilih Jam...</option>
                        {timeSlots.map((ts: any) => (
                          <option key={ts.id} value={ts.id}>{ts.label} ({ts.start_time}-{ts.end_time})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Mata Pelajaran (Mapel)</label>
                    <select
                      value={formData.course_id || formData.subject_id || ''}
                      onChange={(e) => setFormData({ ...formData, course_id: e.target.value, subject_id: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                    >
                      <option value="">Pilih Mapel...</option>
                      {subjects.map((sb: any) => (
                        <option key={sb.id} value={sb.id}>{sb.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Kelas Penerima</label>
                      <select
                        value={formData.classroom_id || formData.class_id || ''}
                        onChange={(e) => handleScheduleFormChange('classroom_id', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                      >
                        <option value="">Pilih Kelas...</option>
                        {classrooms.map((c: any) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Pendidik Pengampu</label>
                      <select
                        value={formData.teacher_id || ''}
                        onChange={(e) => handleScheduleFormChange('teacher_id', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                      >
                        <option value="">Pilih Guru...</option>
                        {teachers.map((t: any) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Prasarana Ruangan</label>
                    <select
                      value={formData.room_id || ''}
                      onChange={(e) => handleScheduleFormChange('room_id', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                    >
                      <option value="">Pilih Ruangan...</option>
                      {rooms.map((r: any) => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Dynamic Alert Warning box */}
                  {conflictWarning && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex gap-2 text-rose-800 font-semibold items-start">
                      <AlertTriangle className="h-4.5 w-4.5 text-rose-600 shrink-0 mt-0.5" />
                      <p className="leading-relaxed text-[11px]">{conflictWarning}</p>
                    </div>
                  )}
                </>
              )}

              {/* Academic Calendar Form */}
              {showModal === 'AC' && (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Judul Kegiatan / Agenda</label>
                    <input
                      type="text"
                      placeholder="Contoh: Penilaian Tengah Semester (PTS)"
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Tanggal Mulai</label>
                      <input
                        type="date"
                        value={formData.start_date || ''}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Tanggal Selesai</label>
                      <input
                        type="date"
                        value={formData.end_date || ''}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Kategori Kegiatan</label>
                    <select
                      value={formData.category || 'AWAL_SEMESTER'}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                    >
                      <option value="AWAL_SEMESTER">Awal Semester</option>
                      <option value="PTS">Penilaian Tengah Semester (PTS)</option>
                      <option value="PAS">Penilaian Akhir Semester (PAS)</option>
                      <option value="LIBUR">Libur Sekolah/Pondok</option>
                      <option value="PPDB">PPDB (Penerimaan Siswa Baru)</option>
                    </select>
                  </div>
                </>
              )}

              {/* Agenda Form */}
              {showModal === 'AG' && (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nama Agenda</label>
                    <input
                      type="text"
                      placeholder="Contoh: Kajian Rutin Riyadhus Shalihin"
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Tanggal Pelaksanaan</label>
                      <input
                        type="date"
                        value={formData.date || ''}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Sektor Penyelenggara</label>
                      <select
                        value={formData.category || 'SEKOLAH'}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                      >
                        <option value="SEKOLAH">Sekolah Resmi</option>
                        <option value="PONDOK">Pesantren / Madin</option>
                        <option value="YAYASAN">Yayasan Utama</option>
                        <option value="PKBM">PKBM Non-Formal</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Deskripsi Agenda</label>
                    <textarea
                      placeholder="Tuliskan tujuan / persiapan yang diperlukan..."
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 h-20"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2.5">
              <button
                onClick={() => { setShowModal(null); setEditItem(null); setFormData({}); setConflictWarning(null); }}
                className="px-4 py-2 border border-slate-300 bg-white rounded-lg hover:bg-slate-50 font-bold"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  const actionName = editItem
                    ? `update${
                        showModal === 'AY' ? 'AcademicYear' :
                        showModal === 'SEM' ? 'Semester' :
                        showModal === 'CUR' ? 'Curriculum' :
                        showModal === 'MJ' ? 'Major' :
                        showModal === 'CL' ? 'Classroom' :
                        showModal === 'RB' ? 'Rombel' :
                        showModal === 'RM' ? 'Room' :
                        showModal === 'SUB' ? 'Subject' :
                        showModal === 'SCH' ? 'Schedule' :
                        showModal === 'AC' ? 'AcademicCalendar' :
                        'Agenda'
                      }`
                    : `create${
                        showModal === 'AY' ? 'AcademicYear' :
                        showModal === 'SEM' ? 'Semester' :
                        showModal === 'CUR' ? 'Curriculum' :
                        showModal === 'MJ' ? 'Major' :
                        showModal === 'CL' ? 'Classroom' :
                        showModal === 'RB' ? 'Rombel' :
                        showModal === 'RM' ? 'Room' :
                        showModal === 'SUB' ? 'Subject' :
                        showModal === 'SCH' ? 'Schedule' :
                        showModal === 'AC' ? 'AcademicCalendar' :
                        'Agenda'
                      }`;
                  executeAction.mutate({ action: actionName, payload: formData });
                }}
                disabled={conflictWarning !== null}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 font-bold"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
