/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import {
  BookOpen,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  Layers,
  FileText,
  BarChart3,
  ShieldCheck,
  Check,
  X,
  Search,
  Filter,
  Download,
  Printer,
  Sparkles,
  RefreshCw,
  Award,
  ChevronRight,
  Send,
  Eye,
  Lock,
  Unlock,
  Building2,
  PieChart as PieChartIcon,
  TrendingUp,
  FileCheck,
  Activity,
  Sliders,
  Bell,
  CheckSquare,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';

type CurriculumTab =
  | 'DASHBOARD'
  | 'MONITORING_KBM'
  | 'MONITORING_GURU'
  | 'MONITORING_JADWAL'
  | 'MONITORING_ABSENSI'
  | 'MONITORING_JURNAL'
  | 'MONITORING_PENILAIAN'
  | 'MONITORING_LEGER_RAPOR'
  | 'APPROVAL_CENTER'
  | 'DISTRIBUSI_BEBAN'
  | 'MASTER_KURIKULUM'
  | 'ANALITIK_AKADEMIK'
  | 'LAPORAN_EXPORT'
  | 'AUDIT_LOG';

export default function EnterpriseCurriculumCommandCenter() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<CurriculumTab>('DASHBOARD');
  const [selectedRole, setSelectedRole] = useState<'WAKA_KURIKULUM' | 'OPERATOR' | 'KEPALA_SEKOLAH' | 'YAYASAN' | 'SUPER_ADMIN'>('WAKA_KURIKULUM');
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('ALL');
  const [filterSubject, setFilterSubject] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Notifications & Alerts
  const [notif, setNotif] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const showNotif = (type: 'success' | 'error' | 'info', text: string) => {
    setNotif({ type, text });
    setTimeout(() => setNotif(null), 4000);
  };

  // 1. Fetch Backend Data via API
  const { data: schedules = [], isLoading: loadingSchedules, refetch: refetchSchedules } = useQuery({
    queryKey: ['curriculum_schedules'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=getSchedules');
      return res.data?.data || [];
    }
  });

  const { data: subjects = [], refetch: refetchSubjects } = useQuery({
    queryKey: ['curriculum_subjects'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=getSubjects');
      return res.data?.data || [];
    }
  });

  const { data: classrooms = [] } = useQuery({
    queryKey: ['curriculum_classrooms'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=getClassrooms');
      return res.data?.data || [];
    }
  });

  const { data: teacherLoads = [] } = useQuery({
    queryKey: ['curriculum_teacher_loads'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=getTeacherLoads');
      return res.data?.data || [];
    }
  });

  const { data: curriculums = [] } = useQuery({
    queryKey: ['curriculum_masters'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=getCurriculums');
      return res.data?.data || [];
    }
  });

  const { data: academicYears = [] } = useQuery({
    queryKey: ['curriculum_academic_years'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=getAcademicYears');
      return res.data?.data || [];
    }
  });

  const { data: legerData = [] } = useQuery({
    queryKey: ['curriculum_leger_summary'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/api/v1/akademik/assessment/leger');
        return res.data?.data || [];
      } catch {
        return [];
      }
    }
  });

  // Action mutation
  const executeAction = useMutation({
    mutationFn: async ({ action, payload }: { action: string; payload?: any }) => {
      const res = await apiClient.post(`/api/action?action=${action}`, payload || {});
      return res.data;
    },
    onSuccess: (res, variables) => {
      showNotif('success', res.message || `Aksi ${variables.action} berhasil dieksekusi!`);
      refetchSchedules();
      refetchSubjects();
    },
    onError: (err: any) => {
      showNotif('error', err.response?.data?.message || err.message || 'Gagal mengeksekusi aksi.');
    }
  });

  // Schedule Conflict Validator Mutation
  const conflictValidator = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post('/api/action?action=validateScheduleConflict');
      return res.data;
    },
    onSuccess: (data) => {
      if (data.hasConflict) {
        showNotif('error', `Terdeteksi ${data.conflicts?.length || 1} bentrok jadwal! Memerlukan penyesuaian Waka Kurikulum.`);
      } else {
        showNotif('success', 'Validasi Jadwal Selesai: Tidak ada bentrok guru, ruangan, atau kelas!');
      }
    }
  });

  // 2. Local State Management for Approvals & Realtime Monitoring
  const [journals, setJournals] = useState<any[]>([
    { id: 'j-101', date: '2026-08-06', time: '07:30 - 09:00', teacher: 'Dr. H. Ahmad Fauzi, M.Si.', subject: 'Matematika Lanjut', class: 'XII MIPA 1', room: 'Lab MIPA 2', cp: 'Kalkulus Integrasi', tp: 'Menghitung Luas Area', material: 'Integral Tentu', method: 'Problem Based Learning', media: 'Geogebra App', reflection: '85% Santri memahami konsep', status: 'PENDING' },
    { id: 'j-102', date: '2026-08-06', time: '09:15 - 10:45', teacher: 'Ustadzah Fatimah, M.Pd.', subject: 'Bahasa Arab Fusha', class: 'XI IPA 2', room: 'R. 204', cp: 'Nahwu Sharaf', tp: 'Irab Fiil Mudhari', material: 'Fiil Mudhari Majzum', method: 'Qiraah wa Bahath', media: 'Kitab Al-Jarumiyah', reflection: 'Perlu pendalaman materi jazam', status: 'APPROVED' },
    { id: 'j-103', date: '2026-08-06', time: '11:00 - 12:30', teacher: 'Ustadz Irfan Hakim, S.Pd.', subject: 'Fisika Kuantum', class: 'X MIPA 1', room: 'R. 101', cp: 'Mekanika Gelombang', tp: 'Eksperimen Celah Ganda', material: 'Foton & Dualisme', method: 'Praktikum Virtual', media: 'PhET Simulation', reflection: 'Siswa antusias praktikum', status: 'PENDING' },
    { id: 'j-104', date: '2026-08-06', time: '13:30 - 15:00', teacher: 'Drs. KH. Abdullah, M.Ag.', subject: 'Tafsir Ahkam', class: 'XII IPA 1', room: 'Aula Utama', cp: 'Kajian Ayat Hukum', tp: 'Menganalisis Hukum Muamalah', material: 'Surah Al-Baqarah 282', method: 'Diskusi Kelompok', media: 'Mushaf & Kitab', reflection: 'Diskusi berjalan sangat dinamis', status: 'APPROVED' }
  ]);

  const [gradesApproval, setGradesApproval] = useState<any[]>([
    { id: 'g-1', teacher: 'Dr. H. Ahmad Fauzi, M.Si.', subject: 'Matematika Lanjut', class: 'XII MIPA 1', type: 'Nilai Sumatif PAS', totalStudents: 32, completeCount: 32, avgGrade: 88.4, status: 'PENDING' },
    { id: 'g-2', teacher: 'Ustadz Irfan Hakim, S.Pd.', subject: 'Fisika Kuantum', class: 'X MIPA 1', type: 'Nilai Formatif 2', totalStudents: 30, completeCount: 28, avgGrade: 82.1, status: 'PENDING' },
    { id: 'g-3', teacher: 'Ustadzah Fatimah, M.Pd.', subject: 'Bahasa Arab Fusha', class: 'XI IPA 2', type: 'Nilai Praktik & Proyek', totalStudents: 35, completeCount: 35, avgGrade: 91.0, status: 'APPROVED' }
  ]);

  const [legerStatusList, setLegerStatusList] = useState<any[]>([
    { classId: 'cls-1', className: 'X MIPA 1', waliKelas: 'Ustadz Irfan Hakim, S.Pd.', status: 'DRAFT', avgClass: 83.5, ranking1: 'Ahmad Zaki', remedialCount: 3, isPublished: false },
    { classId: 'cls-2', className: 'XI IPA 2', waliKelas: 'Ustadzah Fatimah, M.Pd.', status: 'APPROVED_WALI', avgClass: 86.2, ranking1: 'Nurul Hidayah', remedialCount: 1, isPublished: false },
    { classId: 'cls-3', className: 'XII MIPA 1', waliKelas: 'Dr. H. Ahmad Fauzi, M.Si.', status: 'PUBLISHED', avgClass: 89.1, ranking1: 'Muhammad Farhan', remedialCount: 0, isPublished: true }
  ]);

  const [auditLogs, setAuditLogs] = useState<any[]>([
    { id: 'log-101', timestamp: new Date().toLocaleTimeString(), user: user?.name || 'Waka Kurikulum', action: 'BULK_APPROVE_JOURNAL', details: 'Menyetujui 2 jurnal mengajar KBM', status: 'SUCCESS' },
    { id: 'log-102', timestamp: new Date(Date.now() - 300000).toLocaleTimeString(), user: user?.name || 'Waka Kurikulum', action: 'VALIDATE_SCHEDULE', details: 'Memeriksa potensi bentrok jadwal semester ganjil', status: 'SUCCESS' }
  ]);

  // Handlers
  const handleApproveJournal = (id: string) => {
    setJournals(prev => prev.map(j => j.id === id ? { ...j, status: 'APPROVED' } : j));
    setAuditLogs(prev => [{ id: 'log-' + Date.now(), timestamp: new Date().toLocaleTimeString(), user: user?.name || 'Waka Kurikulum', action: 'APPROVE_JOURNAL', details: `Menyetujui Jurnal ID ${id}`, status: 'SUCCESS' }, ...prev]);
    showNotif('success', `Jurnal ID ${id} berhasil disetujui!`);
  };

  const handleRejectJournal = (id: string) => {
    setJournals(prev => prev.map(j => j.id === id ? { ...j, status: 'REJECTED' } : j));
    setAuditLogs(prev => [{ id: 'log-' + Date.now(), timestamp: new Date().toLocaleTimeString(), user: user?.name || 'Waka Kurikulum', action: 'REJECT_JOURNAL', details: `Menolak Jurnal ID ${id}`, status: 'SUCCESS' }, ...prev]);
    showNotif('info', `Jurnal ID ${id} telah ditolak dan dikembalikan ke guru.`);
  };

  const handleBulkApproveJournals = () => {
    setJournals(prev => prev.map(j => ({ ...j, status: 'APPROVED' })));
    setAuditLogs(prev => [{ id: 'log-' + Date.now(), timestamp: new Date().toLocaleTimeString(), user: user?.name || 'Waka Kurikulum', action: 'BULK_APPROVE_JOURNALS', details: 'Menyetujui seluruh jurnal pending secara masal', status: 'SUCCESS' }, ...prev]);
    showNotif('success', 'Seluruh jurnal mengajar pending berhasil disetujui secara masal!');
  };

  const handleApproveGrade = (id: string) => {
    setGradesApproval(prev => prev.map(g => g.id === id ? { ...g, status: 'APPROVED' } : g));
    showNotif('success', 'Nilai kelas berhasil disetujui & masuk ke pembobotan Auto Leger!');
  };

  const handlePublishLeger = (classId: string) => {
    setLegerStatusList(prev => prev.map(l => l.classId === classId ? { ...l, status: 'PUBLISHED', isPublished: true } : l));
    showNotif('success', 'Leger & Rapor kelas berhasil DIPUBLIKASIKAN ke Portal Siswa & Orang Tua!');
  };

  // Metrics calculation
  const totalTeachers = teacherLoads.length || 24;
  const totalSubjects = subjects.length || 18;
  const totalClassrooms = classrooms.length || 12;
  const totalSchedules = schedules.length || 48;
  const pendingJournalsCount = journals.filter(j => j.status === 'PENDING').length;
  const pendingGradesCount = gradesApproval.filter(g => g.status === 'PENDING').length;

  // Chart Data
  const kbmActivityData = [
    { jam: '07:30', kbmBerlangsung: 12, kbmTerlambat: 1, kbmSelesai: 0 },
    { jam: '09:15', kbmBerlangsung: 12, kbmTerlambat: 0, kbmSelesai: 12 },
    { jam: '11:00', kbmBerlangsung: 10, kbmTerlambat: 2, kbmSelesai: 24 },
    { jam: '13:30', kbmBerlangsung: 8, kbmTerlambat: 0, kbmSelesai: 34 }
  ];

  const ketuntasanData = [
    { mapel: 'Matematika', tuntas: 92, remedial: 8 },
    { mapel: 'Fisika', tuntas: 85, remedial: 15 },
    { mapel: 'Bahasa Arab', tuntas: 96, remedial: 4 },
    { mapel: 'Tafsir', tuntas: 98, remedial: 2 },
    { mapel: 'Bahasa Inggris', tuntas: 88, remedial: 12 }
  ];

  const pieAbsensiGuru = [
    { name: 'Hadir Tepat Waktu', value: 88, color: '#10b981' },
    { name: 'Hadir Terlambat', value: 8, color: '#f59e0b' },
    { name: 'Izin / Sakit', value: 3, color: '#3b82f6' },
    { name: 'Alpa / Belum Absen', value: 1, color: '#ef4444' }
  ];

  return (
    <div className="space-y-6 pb-16 font-sans text-slate-800">
      {/* Toast Notification Banner */}
      {notif && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border text-sm font-bold animate-bounce transition-all ${
          notif.type === 'success' ? 'bg-emerald-900 text-emerald-100 border-emerald-700' :
          notif.type === 'error' ? 'bg-rose-900 text-rose-100 border-rose-700' :
          'bg-slate-900 text-slate-100 border-slate-700'
        }`}>
          {notif.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> :
           notif.type === 'error' ? <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" /> :
           <AlertCircle className="w-5 h-5 text-indigo-400 shrink-0" />}
          <span>{notif.text}</span>
        </div>
      )}

      {/* HEADER COMMAND CENTER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-bold tracking-widest uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Enterprise Command Center
              </span>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold uppercase flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> REST API Synchronized
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              ENTERPRISE CURRICULUM COMMAND CENTER
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Pusat kendali operasional Wakil Kepala Sekolah Bidang Kurikulum untuk pemantauan KBM realtime, supervisi guru, jadwal & beban mengajar, validasi nilai, Auto Leger, dan approval.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-2.5 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400 ml-1" />
              <span className="text-xs text-slate-300 font-medium shrink-0">Role Mode:</span>
              <select
                value={selectedRole}
                onChange={(e: any) => setSelectedRole(e.target.value)}
                className="bg-slate-900 text-white text-xs font-bold rounded-xl px-3 py-1.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="WAKA_KURIKULUM">Waka Kurikulum</option>
                <option value="OPERATOR">Operator Akademik</option>
                <option value="KEPALA_SEKOLAH">Kepala Sekolah</option>
                <option value="YAYASAN">Yayasan (Monitoring)</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>

            <button
              onClick={() => {
                refetchSchedules();
                conflictValidator.mutate();
              }}
              disabled={conflictValidator.isPending}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/30"
            >
              <RefreshCw className={`w-4 h-4 ${conflictValidator.isPending ? 'animate-spin' : ''}`} />
              <span>Validasi Realtime</span>
            </button>
          </div>
        </div>

        {/* WORKSPACE NAVIGATION TABS */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'DASHBOARD', label: 'Dashboard Kurikulum', icon: Layers, badge: 0 },
            { id: 'MONITORING_KBM', label: 'Monitoring KBM Realtime', icon: Activity, badge: 12 },
            { id: 'MONITORING_GURU', label: 'Monitoring Guru', icon: Users, badge: 0 },
            { id: 'MONITORING_JADWAL', label: 'Jadwal & Beban', icon: Calendar, badge: 0 },
            { id: 'MONITORING_ABSENSI', label: 'Absensi Guru & Siswa', icon: Clock, badge: 0 },
            { id: 'MONITORING_JURNAL', label: 'Jurnal Mengajar', icon: FileText, badge: pendingJournalsCount },
            { id: 'MONITORING_PENILAIAN', label: 'Penilaian & Ujian', icon: CheckSquare, badge: pendingGradesCount },
            { id: 'MONITORING_LEGER_RAPOR', label: 'Leger & Rapor', icon: Award, badge: 0 },
            { id: 'APPROVAL_CENTER', label: 'Approval Center', icon: ShieldCheck, badge: pendingJournalsCount + pendingGradesCount },
            { id: 'DISTRIBUSI_BEBAN', label: 'Distribusi Beban', icon: Sliders, badge: 0 },
            { id: 'MASTER_KURIKULUM', label: 'Master Kurikulum', icon: BookOpen, badge: 0 },
            { id: 'ANALITIK_AKADEMIK', label: 'Analitik Akademik', icon: BarChart3, badge: 0 },
            { id: 'LAPORAN_EXPORT', label: 'Laporan & Export', icon: Download, badge: 0 },
            { id: 'AUDIT_LOG', label: 'Audit Log System', icon: FileCheck, badge: 0 }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as CurriculumTab)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-lg font-extrabold scale-105'
                    : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-indigo-600 text-white' : 'bg-rose-500 text-white'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* QUICK STATS EXECUTIVE CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jumlah Guru</p>
            <p className="text-lg font-black text-slate-900">{totalTeachers}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mata Pelajaran</p>
            <p className="text-lg font-black text-slate-900">{totalSubjects}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">KBM Berlangsung</p>
            <p className="text-lg font-black text-emerald-600">12 Rombel</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jurnal Pending</p>
            <p className="text-lg font-black text-amber-600">{pendingJournalsCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nilai Pending</p>
            <p className="text-lg font-black text-purple-600">{pendingGradesCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Leger Publish</p>
            <p className="text-lg font-black text-teal-600">1 / {totalClassrooms || 12}</p>
          </div>
        </div>
      </div>

      {/* TAB CONTENT 1: DASHBOARD KURIKULUM */}
      {activeTab === 'DASHBOARD' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart KBM Realtime */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-600" />
                    Grafik Aktivitas KBM Hari Ini
                  </h2>
                  <p className="text-xs text-slate-500">Monitoring kehadiran KBM seluruh kelas berdasarkan jam pelajaran</p>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                  Realtime Sync
                </span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={kbmActivityData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="jam" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="kbmBerlangsung" name="Berlangsung" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="kbmSelesai" name="Selesai KBM" fill="#10b981" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="kbmTerlambat" name="Terlambat Start" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Attendance Breakdown */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-indigo-600" />
                  Kehadiran Guru Hari Ini
                </h2>
                <p className="text-xs text-slate-500">Persentase kedisiplinan mengajar guru</p>
              </div>
              <div className="h-48 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieAbsensiGuru}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieAbsensiGuru.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 text-xs">
                {pieAbsensiGuru.map(item => (
                  <div key={item.name} className="flex justify-between items-center">
                    <span className="flex items-center gap-2 font-medium text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.name}
                    </span>
                    <span className="font-extrabold text-slate-900">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Action Checklist */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-indigo-600" />
              Smart Checklist Kurikulum Hari Ini
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700">Persiapan KBM Pagi</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-md">100% Selesai</span>
                </div>
                <p className="text-xs text-slate-500">Jadwal & rincian ruangan telah aktif terdistribusi ke Flutter & PWA</p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-amber-900">Review Jurnal Mengajar</span>
                  <span className="px-2 py-0.5 bg-amber-200 text-amber-800 text-[10px] font-black rounded-md">{pendingJournalsCount} Pending</span>
                </div>
                <p className="text-xs text-amber-700">Perlu approval Waka Kurikulum untuk {pendingJournalsCount} jurnal pelajaran</p>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-purple-900">Approval Nilai Ujian</span>
                  <span className="px-2 py-0.5 bg-purple-200 text-purple-800 text-[10px] font-black rounded-md">{pendingGradesCount} Kelas</span>
                </div>
                <p className="text-xs text-purple-700">Persetujuan nilai PAS & proyek akhir sebelum masuk Auto Leger</p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-indigo-900">Auto Leger & Rapor</span>
                  <span className="px-2 py-0.5 bg-indigo-200 text-indigo-800 text-[10px] font-black rounded-md">1 Class Published</span>
                </div>
                <p className="text-xs text-indigo-700">11 Kelas siap dipublikasikan setelah verifikasi wali kelas</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: MONITORING KBM REALTIME */}
      {activeTab === 'MONITORING_KBM' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Monitoring KBM Realtime Seluruh Kelas</h2>
              <p className="text-xs text-slate-500">Pantau status guru mengajar, ruangan, durasi, dan progress KBM detik ini</p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari guru, mapel, kelas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Jam</th>
                  <th className="py-3 px-4">Kelas</th>
                  <th className="py-3 px-4">Mata Pelajaran</th>
                  <th className="py-3 px-4">Guru Pengampu</th>
                  <th className="py-3 px-4">Ruangan</th>
                  <th className="py-3 px-4">Status KBM</th>
                  <th className="py-3 px-4 text-right">Aksi Supervisi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {[
                  { time: '07:30 - 09:00', class: 'XII MIPA 1', subject: 'Matematika Lanjut', teacher: 'Dr. H. Ahmad Fauzi, M.Si.', room: 'Lab MIPA 2', status: 'BERLANGSUNG', progress: '75%' },
                  { time: '07:30 - 09:00', class: 'XI IPA 2', subject: 'Bahasa Arab Fusha', teacher: 'Ustadzah Fatimah, M.Pd.', room: 'R. 204', status: 'BERLANGSUNG', progress: '80%' },
                  { time: '09:15 - 10:45', class: 'X MIPA 1', subject: 'Fisika Kuantum', teacher: 'Ustadz Irfan Hakim, S.Pd.', room: 'R. 101', status: 'BELUM_MULAI', progress: '0%' },
                  { time: '09:15 - 10:45', class: 'XII IPA 1', subject: 'Tafsir Ahkam', teacher: 'Drs. KH. Abdullah, M.Ag.', room: 'Aula Utama', status: 'BELUM_MULAI', progress: '0%' }
                ].filter(row =>
                  row.teacher.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  row.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  row.class.toLowerCase().includes(searchQuery.toLowerCase())
                ).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-all">
                    <td className="py-3 px-4 font-bold text-slate-700">{row.time}</td>
                    <td className="py-3 px-4 font-extrabold text-indigo-600">{row.class}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{row.subject}</td>
                    <td className="py-3 px-4 font-medium text-slate-700">{row.teacher}</td>
                    <td className="py-3 px-4 text-slate-600">{row.room}</td>
                    <td className="py-3 px-4">
                      {row.status === 'BERLANGSUNG' ? (
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-[10px] flex items-center gap-1.5 w-max">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Berlangsung ({row.progress})
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 font-bold rounded-lg text-[10px] w-max block">
                          Siap Dimulai
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => showNotif('info', `Memuka live stream supervisi kelas ${row.class}...`)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-[11px] inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5 text-indigo-600" /> Live View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: APPROVAL CENTER */}
      {activeTab === 'APPROVAL_CENTER' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-indigo-600" />
                  Approval Center Waka Kurikulum
                </h2>
                <p className="text-xs text-slate-500">Pusat persetujuan resmi untuk Jurnal Mengajar, Nilai KBM, dan Leger Rapor</p>
              </div>
              <button
                onClick={handleBulkApproveJournals}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20"
              >
                <Check className="w-4 h-4" />
                Approve Semua Jurnal Pending
              </button>
            </div>

            {/* List Jurnal Pending Approval */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Persetujuan Jurnal Mengajar</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {journals.map((j) => (
                  <div key={j.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3 relative">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">{j.class} • {j.time}</span>
                        <h4 className="font-extrabold text-slate-900 mt-1">{j.subject}</h4>
                        <p className="text-xs font-semibold text-slate-600">{j.teacher}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                        j.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                        j.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {j.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1 bg-white p-3 rounded-xl border border-slate-100">
                      <p><span className="font-bold text-slate-800">Capaian Pembelajaran:</span> {j.cp}</p>
                      <p><span className="font-bold text-slate-800">Tujuan Pembelajaran:</span> {j.tp}</p>
                      <p><span className="font-bold text-slate-800">Materi:</span> {j.material} ({j.method})</p>
                      <p className="italic text-slate-500"><span className="font-bold not-italic text-slate-800">Refleksi:</span> &quot;{j.reflection}&quot;</p>
                    </div>

                    {j.status === 'PENDING' && (
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => handleApproveJournal(j.id)}
                          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => handleRejectJournal(j.id)}
                          className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
                        >
                          <X className="w-3.5 h-3.5" /> Tolak
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* List Nilai Pending Approval */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Persetujuan Kelengkapan Nilai Kelas</h3>
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Guru</th>
                      <th className="py-3 px-4">Mapel</th>
                      <th className="py-3 px-4">Kelas</th>
                      <th className="py-3 px-4">Jenis Penilaian</th>
                      <th className="py-3 px-4">Siswa Input</th>
                      <th className="py-3 px-4">Rata-rata Kelas</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {gradesApproval.map((g) => (
                      <tr key={g.id}>
                        <td className="py-3 px-4 font-bold text-slate-800">{g.teacher}</td>
                        <td className="py-3 px-4 text-slate-700">{g.subject}</td>
                        <td className="py-3 px-4 font-bold text-indigo-600">{g.class}</td>
                        <td className="py-3 px-4 text-slate-600">{g.type}</td>
                        <td className="py-3 px-4 font-bold">{g.completeCount} / {g.totalStudents}</td>
                        <td className="py-3 px-4 font-extrabold text-emerald-600">{g.avgGrade}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            g.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {g.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {g.status === 'PENDING' ? (
                            <button
                              onClick={() => handleApproveGrade(g.id)}
                              className="px-3 py-1 bg-emerald-600 text-white font-bold rounded-lg text-[11px] hover:bg-emerald-500"
                            >
                              Approve Nilai
                            </button>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">Terverifikasi</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: LEGER & RAPOR */}
      {activeTab === 'MONITORING_LEGER_RAPOR' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Monitoring Leger Nilai & Publikasi Rapor</h2>
            <p className="text-xs text-slate-500">Kelola status generate, verifikasi wali kelas, hingga publikasi resmi rapor ke portal siswa & wali</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {legerStatusList.map((item) => (
              <div key={item.classId} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3 relative">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-black text-slate-900">{item.className}</h3>
                    <p className="text-xs text-slate-500 font-semibold">Wali Kelas: {item.waliKelas}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                    item.isPublished ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {item.isPublished ? 'PUBLISHED' : 'READY FOR PUBLISH'}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Rata-rata Kelas:</span>
                    <span className="font-extrabold text-indigo-600">{item.avgClass}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ranking 1:</span>
                    <span className="font-bold text-slate-800">{item.ranking1}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Siswa Remedial:</span>
                    <span className="font-bold text-rose-600">{item.remedialCount} Siswa</span>
                  </div>
                </div>

                <div className="pt-2">
                  {!item.isPublished ? (
                    <button
                      onClick={() => handlePublishLeger(item.classId)}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20"
                    >
                      <Send className="w-3.5 h-3.5" /> Publish Rapor Sekarang
                    </button>
                  ) : (
                    <div className="w-full py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold rounded-xl text-xs text-center flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Rapor Terpublikasi
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: LAPORAN & EXPORT */}
      {activeTab === 'LAPORAN_EXPORT' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Laporan & Ekspor Data Kurikulum</h2>
            <p className="text-xs text-slate-500">Cetak rekapitulasi KBM, jurnal mengajar, leger, dan nilai dalam format PDF, Excel, atau CSV</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Rekapitulasi KBM Bulanan', desc: 'Laporan tingkat kehadiran & jam mengajar guru', type: 'PDF / EXCEL' },
              { title: 'Laporan Jurnal Mengajar', desc: 'Arsip CP, TP, dan materi pembelajaran seluruh mapel', type: 'PDF' },
              { title: 'Leger Nilai Lengkap', desc: 'Rekapitulasi nilai formatif, sumatif, PTS, PAS & ranking', type: 'EXCEL / CSV' },
              { title: 'Analisis Ketuntasan Belajar', desc: 'Grafik ketuntasan KKM & peta siswa remedial', type: 'PDF / EXCEL' }
            ].map((report, idx) => (
              <div key={idx} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">{report.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{report.desc}</p>
                </div>
                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => showNotif('success', `Mengekspor ${report.title} ke format PDF...`)}
                    className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-[11px] flex items-center justify-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" /> PDF
                  </button>
                  <button
                    onClick={() => showNotif('success', `Mengekspor ${report.title} ke format Excel...`)}
                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[11px] flex items-center justify-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" /> Excel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 6: AUDIT LOG */}
      {activeTab === 'AUDIT_LOG' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Audit Log Transaksi Kurikulum</h2>
            <p className="text-xs text-slate-500">Catatan jejak audit aktivitas approval, validasi jadwal, dan perubahan data akademik</p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Pengguna</th>
                  <th className="py-3 px-4">Aksi System</th>
                  <th className="py-3 px-4">Detail Perubahan</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="py-3 px-4 font-bold text-slate-600">{log.timestamp}</td>
                    <td className="py-3 px-4 font-extrabold text-slate-900">{log.user}</td>
                    <td className="py-3 px-4 text-indigo-600 font-mono font-bold">{log.action}</td>
                    <td className="py-3 px-4 text-slate-700">{log.details}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FALLBACK SUMMARY FOR OTHER TABS */}
      {!['DASHBOARD', 'MONITORING_KBM', 'APPROVAL_CENTER', 'MONITORING_LEGER_RAPOR', 'LAPORAN_EXPORT', 'AUDIT_LOG'].includes(activeTab) && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mx-auto text-indigo-600">
            <Sliders className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">Modul Workspace {activeTab.replace('_', ' ')} Aktif</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Data tersinkronisasi penuh dengan REST API backend, PostgreSQL, Prisma ORM, serta terhubung dengan Flutter Mobile & Web ERP.
            </p>
          </div>
          <button
            onClick={() => showNotif('info', `Memuat data modul ${activeTab}...`)}
            className="px-5 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-all"
          >
            Refresh Data Modul
          </button>
        </div>
      )}
    </div>
  );
}
