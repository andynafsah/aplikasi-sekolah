/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import {
  GraduationCap,
  LayoutDashboard,
  Calendar,
  Settings,
  Users,
  Search,
  Plus,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Award,
  Activity,
  ShieldCheck,
  FileText,
  DollarSign,
  PlusCircle,
  TrendingUp,
  FileSpreadsheet,
  AlertCircle,
  RefreshCw,
  Eye,
  Check,
  AlertTriangle,
  UserPlus,
  ArrowRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  Cell,
  PieChart,
  Pie
} from 'recharts';

export default function Admission() {
  const queryClient = useQueryClient();
  const { tenant } = useAuth();
  const isPondok = tenant?.type === 'PONDOK' || tenant?.type === 'KEDUA';

  // Sub-navigation tabs
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'config' | 'applicants' | 'assessments' | 'selection' | 'rereg' | 'portal'>('dashboard');

  // Shared Filters / Selection States
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [selectedWave, setSelectedWave] = useState<string>('');
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Modals / Selected Items
  const [viewingAppId, setViewingAppId] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isAddingPeriod, setIsAddingPeriod] = useState<boolean>(false);
  const [isAddingWave, setIsAddingWave] = useState<boolean>(false);
  const [isAddingProgram, setIsAddingProgram] = useState<boolean>(false);
  const [isAddingSchedule, setIsAddingSchedule] = useState<boolean>(false);

  // Playground Parent Form State
  const [playgroundStep, setPlaygroundStep] = useState<1 | 2 | 3>(1);
  const [registeredResult, setRegisteredResult] = useState<any>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, string>>({});

  // 1. Fetch Queries
  const { data: dashboardData, isLoading: loadingDash } = useQuery({
    queryKey: ['admissionDashboard'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action', { action: 'admissionDashboard' });
      return res.data.data;
    }
  });

  const { data: settingsData, isLoading: loadingSettings } = useQuery({
    queryKey: ['admissionSettings'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action', { action: 'getAdmissionSettings' });
      return res.data.data;
    }
  });

  const { data: periods, isLoading: loadingPeriods } = useQuery({
    queryKey: ['admissionPeriods'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action', { action: 'admissionPeriodList' });
      return res.data.data || [];
    }
  });

  const { data: waves, isLoading: loadingWaves } = useQuery({
    queryKey: ['admissionWaves'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action', { action: 'admissionWaveList' });
      return res.data.data || [];
    }
  });

  const { data: programs, isLoading: loadingPrograms } = useQuery({
    queryKey: ['admissionPrograms'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action', { action: 'admissionProgramList' });
      return res.data.data || [];
    }
  });

  const { data: applicants, isLoading: loadingApplicants } = useQuery({
    queryKey: ['admissionApplicants', statusFilter, selectedPeriod, selectedWave, selectedProgram, searchQuery],
    queryFn: async () => {
      const res = await apiClient.post('/api/action', {
        action: 'applicationList',
        status: statusFilter || undefined,
        period_id: selectedPeriod || undefined,
        wave_id: selectedWave || undefined,
        program_id: selectedProgram || undefined,
        search: searchQuery || undefined
      });
      return res.data.data || [];
    }
  });

  const { data: activeAppDetail, isLoading: loadingDetail } = useQuery({
    queryKey: ['admissionAppDetail', viewingAppId],
    queryFn: async () => {
      if (!viewingAppId) return null;
      const res = await apiClient.post('/api/action', { action: 'applicationDetail', id: viewingAppId });
      return res.data.data;
    },
    enabled: !!viewingAppId
  });

  const { data: schedules, isLoading: loadingSchedules } = useQuery({
    queryKey: ['admissionSchedules'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action', { action: 'examSchedule' });
      return res.data.data || [];
    }
  });

  const { data: waitingLists, isLoading: loadingWL } = useQuery({
    queryKey: ['admissionWaitingLists'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action', { action: 'waitingList' });
      return res.data.data || [];
    }
  });

  // 2. Mutations
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post('/api/action', { action: 'saveAdmissionSettings', ...data });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admissionSettings'] });
      alert('Pengaturan PPDB berhasil disimpan!');
    }
  });

  const createPeriodMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post('/api/action', { action: 'admissionPeriodCreate', ...data });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admissionPeriods'] });
      setIsAddingPeriod(false);
      alert('Periode baru berhasil ditambahkan!');
    }
  });

  const createWaveMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post('/api/action', { action: 'admissionWaveCreate', ...data });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admissionWaves'] });
      setIsAddingWave(false);
      alert('Gelombang baru berhasil ditambahkan!');
    }
  });

  const createProgramMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post('/api/action', { action: 'admissionProgramCreate', ...data });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admissionPrograms'] });
      setIsAddingProgram(false);
      alert('Program baru berhasil ditambahkan!');
    }
  });

  const submitVerificationMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post('/api/action', { action: 'verificationCreate', ...data });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admissionAppDetail'] });
      queryClient.invalidateQueries({ queryKey: ['admissionApplicants'] });
      queryClient.invalidateQueries({ queryKey: ['admissionDashboard'] });
      setIsVerifying(false);
      alert('Keputusan verifikasi dokumen pendaftar berhasil disimpan!');
    }
  });

  const submitScoreMutation = useMutation({
    mutationFn: async (data: { type: 'exam' | 'interview' | 'medical' | 'tahfidz', payload: any }) => {
      const actionMap = {
        exam: 'examResult',
        interview: 'interviewResult',
        medical: 'medicalCheck',
        tahfidz: 'tahfidzTest'
      };
      const res = await apiClient.post('/api/action', { action: actionMap[data.type], ...data.payload });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admissionAppDetail'] });
      queryClient.invalidateQueries({ queryKey: ['admissionApplicants'] });
      alert('Nilai evaluasi pendaftar berhasil disimpan!');
    }
  });

  const generateScoresMutation = useMutation({
    mutationFn: async (waveId: string) => {
      const res = await apiClient.post('/api/action', { action: 'scoreGenerate', wave_id: waveId });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admissionApplicants'] });
      queryClient.invalidateQueries({ queryKey: ['admissionAppDetail'] });
      alert(data.message || 'Skor seleksi berhasil dikalkulasi otomatis!');
    }
  });

  const generateRankingsMutation = useMutation({
    mutationFn: async (waveId: string) => {
      const res = await apiClient.post('/api/action', { action: 'rankingGenerate', wave_id: waveId });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admissionApplicants'] });
      queryClient.invalidateQueries({ queryKey: ['admissionAppDetail'] });
      alert(data.message || 'Pemeringkatan ranking berhasil di-generate!');
    }
  });

  const publishSelectionResultMutation = useMutation({
    mutationFn: async (data: { application_ids: string[], status: 'Lulus' | 'Cadangan' | 'Tidak Lulus', notes?: string }) => {
      const res = await apiClient.post('/api/action', { action: 'selectionResult', ...data });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admissionApplicants'] });
      queryClient.invalidateQueries({ queryKey: ['admissionDashboard'] });
      alert('Status kelulusan berhasil dipublikasikan!');
    }
  });

  const callWaitingListMutation = useMutation({
    mutationFn: async (wlId: string) => {
      const res = await apiClient.post('/api/action', { action: 'waitingList', id: wlId, status: 'CALLED', notes: 'Ditingkatkan ke status Lulus via panitia waiting list.' });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admissionWaitingLists'] });
      queryClient.invalidateQueries({ queryKey: ['admissionApplicants'] });
      alert('Pendaftar cadangan berhasil dipanggil untuk masuk kuota utama!');
    }
  });

  const submitReRegistrationMutation = useMutation({
    mutationFn: async (appId: string) => {
      const res = await apiClient.post('/api/action', { action: 'reRegistration', application_id: appId, payment_status: 'PAID' });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admissionAppDetail'] });
      queryClient.invalidateQueries({ queryKey: ['admissionApplicants'] });
      queryClient.invalidateQueries({ queryKey: ['admissionDashboard'] });
      alert('Proses daftar ulang sukses divalidasi!');
    }
  });

  const generateStudentIdMutation = useMutation({
    mutationFn: async (appId: string) => {
      const res = await apiClient.post('/api/action', { action: 'studentGenerate', application_id: appId });
      return res.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admissionApplicants'] });
      alert(`Berhasil menggenerasi NIM siswa baru: ${res.data.student_profile.nis}!`);
    },
    onError: (err: any) => {
      alert(err.message || 'Gagal memproses data ke database utama');
    }
  });

  const simulateSubmitPlaygroundMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post('/api/action', { action: 'registrationSubmit', ...data });
      return res.data;
    },
    onSuccess: (res) => {
      if (res.success) {
        setRegisteredResult(res.data);
        setPlaygroundStep(2);
        queryClient.invalidateQueries({ queryKey: ['admissionApplicants'] });
        queryClient.invalidateQueries({ queryKey: ['admissionDashboard'] });
      } else {
        alert(res.message);
      }
    }
  });

  const simulateDocumentUploadMutation = useMutation({
    mutationFn: async (data: { application_id: string, requirement_id: string, name: string, file_url: string }) => {
      const res = await apiClient.post('/api/action', { action: 'documentUpload', ...data });
      return res.data;
    },
    onSuccess: (res, variables) => {
      setUploadProgress(prev => ({ ...prev, [variables.requirement_id]: 'SUCCESS' }));
      queryClient.invalidateQueries({ queryKey: ['admissionAppDetail'] });
    }
  });

  const simulatePayVAMutation = useMutation({
    mutationFn: async (data: { id: string }) => {
      const res = await apiClient.post('/api/action', { action: 'paymentLink', id: data.id });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admissionApplicants'] });
      queryClient.invalidateQueries({ queryKey: ['admissionDashboard'] });
      if (registeredResult?.payment) {
        setRegisteredResult((prev: any) => ({
          ...prev,
          payment: { ...prev.payment, status: 'PAID' }
        }));
      }
      alert('Pembayaran simulasi Virtual Account sukses settled!');
    }
  });

  // Color mappings
  const badgeColors: Record<string, string> = {
    SUBMITTED: 'bg-amber-100 text-amber-800 border-amber-200',
    VERIFIED: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    EXAM_COMPLETED: 'bg-purple-100 text-purple-800 border-purple-200',
    PASSED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    RE_REGISTERED: 'bg-teal-100 text-teal-800 border-teal-200',
    REJECTED: 'bg-rose-100 text-rose-800 border-rose-200',
    WAITING_LIST: 'bg-orange-100 text-orange-800 border-orange-200'
  };

  const badgeLabels: Record<string, string> = {
    SUBMITTED: 'Terkirim',
    VERIFIED: 'Berkas Terverifikasi',
    EXAM_COMPLETED: 'Ujian Selesai',
    PASSED: 'Lulus Seleksi',
    RE_REGISTERED: 'Daftar Ulang',
    REJECTED: 'Ditolak / Gagal',
    WAITING_LIST: 'Cadangan'
  };

  return (
    <div className="space-y-6">
      {/* Upper Module Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between p-6 bg-white border border-slate-200 rounded-xl gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0 border border-blue-100">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Enterprise PPDB & Admission Management</h1>
            <p className="text-xs text-slate-500">Pendaftaran, Verifikasi Berkas, Ujian Seleksi, Penilaian, Kelulusan & Registrasi NIM Baru</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              queryClient.invalidateQueries();
              alert('Sistem berhasil disinkronisasi dengan database!');
            }}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            <span>Sync Data</span>
          </button>
          <button
            onClick={() => setActiveSubTab('portal')}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Simulasi Portal Orang Tua</span>
          </button>
        </div>
      </div>

      {/* Internal Navigation Sub-tabs */}
      <div className="flex overflow-x-auto gap-1 border-b border-slate-200 pb-px scrollbar-thin">
        {[
          { id: 'dashboard', name: 'Dashboard & Analitik', icon: LayoutDashboard },
          { id: 'config', name: 'Pengaturan & Gelombang', icon: Settings },
          { id: 'applicants', name: 'Pendaftar & Verifikasi', icon: Users },
          { id: 'assessments', name: 'Ujian & Penilaian', icon: Activity },
          { id: 'selection', name: 'Kalkulasi Seleksi & Hasil', icon: Award },
          { id: 'rereg', name: 'Daftar Ulang & Generate NIM', icon: UserPlus },
          { id: 'portal', name: 'Sandbox Portal Publik', icon: FileText }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-xs whitespace-nowrap transition-all ${
                isActive
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* RENDER ACTIVE TAB */}

      {/* TAB 1: DASHBOARD & ANALYTICS */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-6">
          {loadingDash ? (
            <div className="p-8 text-center text-slate-500 text-xs font-mono">LOADING METRICS...</div>
          ) : (
            <>
              {/* Dashboard Metric Widgets */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Pendaftar</span>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-2xl font-extrabold text-slate-800">{dashboardData?.metrics?.total_applicants || 0}</span>
                    <span className="text-[10px] text-slate-500">Orang</span>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Lolos Berkas (Verified)</span>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-2xl font-extrabold text-slate-800 text-indigo-600">{dashboardData?.metrics?.verified_count || 0}</span>
                    <span className="text-[10px] text-emerald-600 font-medium">
                      {Math.round(((dashboardData?.metrics?.verified_count || 0) / (dashboardData?.metrics?.total_applicants || 1)) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Diterima Seleksi</span>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-2xl font-extrabold text-slate-800 text-emerald-600">{dashboardData?.metrics?.passed_count || 0}</span>
                    <span className="text-[10px] text-slate-400">Kuota Utama</span>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sudah Daftar Ulang</span>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-2xl font-extrabold text-slate-800 text-teal-600">{dashboardData?.metrics?.re_registered_count || 0}</span>
                    <span className="text-[10px] text-emerald-600 font-medium">
                      {Math.round(((dashboardData?.metrics?.re_registered_count || 0) / (dashboardData?.metrics?.passed_count || 1)) * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Financial Dashboard Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Pendapatan Biaya Formulir</span>
                    <h3 className="text-xl font-black text-emerald-800 mt-1">Rp {(dashboardData?.metrics?.total_revenue_form || 0).toLocaleString()}</h3>
                  </div>
                  <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg"><DollarSign className="h-5 w-5" /></div>
                </div>
                <div className="bg-teal-50 border border-teal-100 p-5 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">Pendapatan Daftar Ulang</span>
                    <h3 className="text-xl font-black text-teal-800 mt-1">Rp {(dashboardData?.metrics?.total_revenue_rereg || 0).toLocaleString()}</h3>
                  </div>
                  <div className="p-3 bg-teal-100 text-teal-600 rounded-lg"><DollarSign className="h-5 w-5" /></div>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tagihan VA Pendaftaran Pending</span>
                    <h3 className="text-xl font-black text-slate-700 mt-1">{dashboardData?.metrics?.pending_payment_va || 0} Invoice</h3>
                  </div>
                  <div className="p-3 bg-slate-200 text-slate-600 rounded-lg"><Clock className="h-5 w-5" /></div>
                </div>
              </div>

              {/* Recharts Graphical Panels */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-xl border border-slate-200 lg:col-span-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Tren Registrasi Harian</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dashboardData?.trend_data || []}>
                        <defs>
                          <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                        <Tooltip />
                        <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorTrend)" name="Pendaftar" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Demografi Pendaftar (L/P)</h3>
                  <div className="h-64 flex flex-col items-center justify-center">
                    <ResponsiveContainer width="100%" height="80%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Laki-laki', value: dashboardData?.gender_breakdown?.L || 0, color: '#3b82f6' },
                            { name: 'Perempuan', value: dashboardData?.gender_breakdown?.P || 0, color: '#ec4899' }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          <Cell fill="#3b82f6" />
                          <Cell fill="#ec4899" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex gap-4 text-xs mt-2">
                      <span className="flex items-center gap-1.5"><span className="h-3 w-3 bg-blue-500 rounded-full" /> Laki-laki ({dashboardData?.gender_breakdown?.L || 0})</span>
                      <span className="flex items-center gap-1.5"><span className="h-3 w-3 bg-pink-500 rounded-full" /> Perempuan ({dashboardData?.gender_breakdown?.P || 0})</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Waves Capacity Monitor */}
              <div className="bg-white p-5 rounded-xl border border-slate-200">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Monitor Kuota Gelombang & Program</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Gelombang list */}
                  <div className="space-y-3">
                    <span className="text-xs font-semibold text-slate-600 block border-b pb-1.5">Gelombang Pendaftaran</span>
                    {(dashboardData?.waves_breakdown || []).map((w: any) => {
                      const percentage = Math.min(100, Math.round((w.registered / w.quota) * 100));
                      return (
                        <div key={w.id} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium text-slate-700">{w.name}</span>
                            <span className="text-slate-500">{w.registered} / {w.quota} Terisi ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-blue-600 h-full rounded-full" style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Program Studi List */}
                  <div className="space-y-3">
                    <span className="text-xs font-semibold text-slate-600 block border-b pb-1.5">Program Studi / Pilihan Sekolah</span>
                    {(dashboardData?.programs_breakdown || []).map((p: any) => {
                      const percentage = Math.min(100, Math.round((p.registered / p.quota) * 100));
                      return (
                        <div key={p.id} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium text-slate-700">{p.name}</span>
                            <span className="text-slate-500">{p.registered} / {p.quota} Pendaftar ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 2: CONFIGURATION & FORMS */}
      {activeSubTab === 'config' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Pricing / Format */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 lg:col-span-1 space-y-4">
            <div className="flex items-center gap-2 border-b pb-3">
              <Settings className="h-4 w-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Konfigurasi Aturan PPDB</h3>
            </div>
            {loadingSettings ? (
              <p className="text-xs text-slate-500 font-mono">LOADING CONFIG...</p>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  updateSettingsMutation.mutate({
                    auto_generate_student_id: form.autoGen.checked,
                    student_id_format: form.idFormat.value,
                    require_all_documents: form.reqDoc.checked,
                    form_fee: Number(form.formFee.value),
                    re_registration_fee: Number(form.reregFee.value),
                    announcement_status: form.annStatus.value
                  });
                }}
                className="space-y-4 text-xs"
              >
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 block">Status Pengumuman Kelulusan</label>
                  <select name="annStatus" defaultValue={settingsData?.announcement_status} className="w-full p-2 border rounded-lg bg-slate-50">
                    <option value="OPENED">Diumumkan / Dibuka</option>
                    <option value="CLOSED">Belum Diumumkan / Ditutup</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 block">Biaya Formulir (Rp)</label>
                  <input type="number" name="formFee" defaultValue={settingsData?.form_fee} className="w-full p-2 border rounded-lg bg-slate-50" />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 block">Biaya Daftar Ulang (Rp)</label>
                  <input type="number" name="reregFee" defaultValue={settingsData?.re_registration_fee} className="w-full p-2 border rounded-lg bg-slate-50" />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 block">Format NIM Siswa Baru</label>
                  <input type="text" name="idFormat" defaultValue={settingsData?.student_id_format} className="w-full p-2 border rounded-lg bg-slate-50" />
                  <span className="text-[10px] text-slate-400 font-mono block">e.g., 2026[UNIT][SEQ]</span>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input type="checkbox" id="autoGen" name="autoGen" defaultChecked={settingsData?.auto_generate_student_id} className="rounded" />
                  <label htmlFor="autoGen" className="font-semibold text-slate-600">Otomatis Generasi NIM saat Daftar Ulang</label>
                </div>

                <div className="flex items-center gap-2">
                  <input type="checkbox" id="reqDoc" name="reqDoc" defaultChecked={settingsData?.require_all_documents} className="rounded" />
                  <label htmlFor="reqDoc" className="font-semibold text-slate-600">Wajib verifikasi seluruh berkas</label>
                </div>

                <button
                  type="submit"
                  disabled={updateSettingsMutation.isPending}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition"
                >
                  {updateSettingsMutation.isPending ? 'Menyimpan...' : 'Simpan Pengaturan'}
                </button>
              </form>
            )}
          </div>

          {/* Periods & Waves & Programs Lists */}
          <div className="lg:col-span-2 space-y-6">
            {/* Periode PPDB */}
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center mb-4 border-b pb-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tahun Periode PPDB</span>
                <button
                  onClick={() => setIsAddingPeriod(true)}
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 rounded border border-blue-200"
                >
                  <Plus className="h-3 w-3" /> Tambah Periode
                </button>
              </div>

              {isAddingPeriod && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    createPeriodMutation.mutate({
                      name: form.pName.value,
                      start_date: form.pStart.value,
                      end_date: form.pEnd.value,
                      status: form.pStatus.value,
                      description: form.pDesc.value
                    });
                  }}
                  className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600">Nama Periode</label>
                    <input type="text" name="pName" placeholder="e.g. PPDB 2026/2027" className="w-full p-2 border rounded-lg bg-white" required />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600">Status</label>
                    <select name="pStatus" className="w-full p-2 border rounded-lg bg-white">
                      <option value="ACTIVE">Aktif</option>
                      <option value="INACTIVE">Nonaktif</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600">Tanggal Mulai</label>
                    <input type="date" name="pStart" className="w-full p-2 border rounded-lg bg-white" required />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600">Tanggal Selesai</label>
                    <input type="date" name="pEnd" className="w-full p-2 border rounded-lg bg-white" required />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="font-semibold text-slate-600">Keterangan Tambahan</label>
                    <textarea name="pDesc" placeholder="Keterangan singkat..." className="w-full p-2 border rounded-lg bg-white" />
                  </div>
                  <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                    <button type="button" onClick={() => setIsAddingPeriod(false)} className="px-3 py-1.5 border rounded-lg bg-white text-slate-600">Batal</button>
                    <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-bold">Simpan</button>
                  </div>
                </form>
              )}

              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b text-slate-400 font-bold">
                      <th className="py-2">Nama Periode</th>
                      <th>Tgl Mulai</th>
                      <th>Tgl Selesai</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingPeriods ? (
                      <tr><td colSpan={4} className="py-4 text-center font-mono">LOADING PERIODS...</td></tr>
                    ) : (periods || []).map((p: any) => (
                      <tr key={p.id} className="border-b hover:bg-slate-50">
                        <td className="py-2.5 font-semibold text-slate-700">{p.name}</td>
                        <td>{p.start_date}</td>
                        <td>{p.end_date}</td>
                        <td>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}`}>
                            {p.status === 'ACTIVE' ? 'AKTIF' : 'NONAKTIF'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Gelombang PPDB */}
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center mb-4 border-b pb-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Gelombang Seleksi</span>
                <button
                  onClick={() => setIsAddingWave(true)}
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 rounded border border-blue-200"
                >
                  <Plus className="h-3 w-3" /> Tambah Gelombang
                </button>
              </div>

              {isAddingWave && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    createWaveMutation.mutate({
                      period_id: form.wPeriod.value,
                      name: form.wName.value,
                      start_date: form.wStart.value,
                      end_date: form.wEnd.value,
                      quota: Number(form.wQuota.value),
                      status: form.wStatus.value
                    });
                  }}
                  className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600">Tahun Periode</label>
                    <select name="wPeriod" className="w-full p-2 border rounded-lg bg-white" required>
                      {(periods || []).map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600">Nama Gelombang</label>
                    <input type="text" name="wName" placeholder="e.g. Gelombang I - Khusus" className="w-full p-2 border rounded-lg bg-white" required />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600">Kuota (Orang)</label>
                    <input type="number" name="wQuota" defaultValue={100} className="w-full p-2 border rounded-lg bg-white" required />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600">Status</label>
                    <select name="wStatus" className="w-full p-2 border rounded-lg bg-white">
                      <option value="ACTIVE">Aktif (Open)</option>
                      <option value="INACTIVE">Tutup (Closed)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600">Tanggal Mulai</label>
                    <input type="date" name="wStart" className="w-full p-2 border rounded-lg bg-white" required />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600">Tanggal Selesai</label>
                    <input type="date" name="wEnd" className="w-full p-2 border rounded-lg bg-white" required />
                  </div>
                  <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                    <button type="button" onClick={() => setIsAddingWave(false)} className="px-3 py-1.5 border rounded-lg bg-white text-slate-600">Batal</button>
                    <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-bold">Simpan</button>
                  </div>
                </form>
              )}

              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b text-slate-400 font-bold">
                      <th className="py-2">Nama Gelombang</th>
                      <th>Tgl Mulai</th>
                      <th>Tgl Selesai</th>
                      <th>Kuota</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingWaves ? (
                      <tr><td colSpan={5} className="py-4 text-center font-mono">LOADING WAVES...</td></tr>
                    ) : (waves || []).map((w: any) => {
                      const perObj = (periods || []).find((p: any) => p.id === w.period_id);
                      return (
                        <tr key={w.id} className="border-b hover:bg-slate-50">
                          <td className="py-2.5">
                            <span className="font-semibold text-slate-700 block">{w.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono block">{perObj ? perObj.name : ''}</span>
                          </td>
                          <td>{w.start_date}</td>
                          <td>{w.end_date}</td>
                          <td className="font-semibold">{w.quota} Orang</td>
                          <td>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${w.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                              {w.status === 'ACTIVE' ? 'OPEN' : 'CLOSED'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Program Studi / Pendaftaran */}
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center mb-4 border-b pb-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Program Studi / Jalur Pendaftaran</span>
                <button
                  onClick={() => setIsAddingProgram(true)}
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 rounded border border-blue-200"
                >
                  <Plus className="h-3 w-3" /> Tambah Program
                </button>
              </div>

              {isAddingProgram && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    createProgramMutation.mutate({
                      name: form.prName.value,
                      code: form.prCode.value,
                      quota: Number(form.prQuota.value),
                      status: form.prStatus.value
                    });
                  }}
                  className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600">Nama Program / Jurusan</label>
                    <input type="text" name="prName" placeholder="e.g. IPA Unggulan Tahfidz" className="w-full p-2 border rounded-lg bg-white" required />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600">Kode Program</label>
                    <input type="text" name="prCode" placeholder="e.g. IPA-T" className="w-full p-2 border rounded-lg bg-white" required />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600">Kuota Kuota</label>
                    <input type="number" name="prQuota" defaultValue={100} className="w-full p-2 border rounded-lg bg-white" required />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600">Status</label>
                    <select name="prStatus" className="w-full p-2 border rounded-lg bg-white">
                      <option value="ACTIVE">Aktif (Buka)</option>
                      <option value="INACTIVE">Nonaktif</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                    <button type="button" onClick={() => setIsAddingProgram(false)} className="px-3 py-1.5 border rounded-lg bg-white text-slate-600">Batal</button>
                    <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-bold">Simpan</button>
                  </div>
                </form>
              )}

              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b text-slate-400 font-bold">
                      <th className="py-2">Nama Program</th>
                      <th>Kode</th>
                      <th>Kapasitas Kuota</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingPrograms ? (
                      <tr><td colSpan={4} className="py-4 text-center font-mono">LOADING PROGRAMS...</td></tr>
                    ) : (programs || []).map((p: any) => (
                      <tr key={p.id} className="border-b hover:bg-slate-50">
                        <td className="py-2.5 font-semibold text-slate-700">{p.name}</td>
                        <td className="font-mono">{p.code}</td>
                        <td className="font-semibold">{p.quota} Kursi</td>
                        <td>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}`}>
                            {p.status === 'ACTIVE' ? 'BUKA' : 'TUTUP'}
                          </span>
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

      {/* TAB 3: APPLICANTS & VERIFICATION HUB */}
      {activeSubTab === 'applicants' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-3 items-center justify-between text-xs">
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              {/* Search */}
              <div className="relative shrink-0 w-full sm:w-48">
                <input
                  type="text"
                  placeholder="Cari nama / nomor PPDB..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border rounded-lg bg-slate-50"
                />
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              </div>

              {/* Wave selection */}
              <select
                value={selectedWave}
                onChange={(e) => setSelectedWave(e.target.value)}
                className="p-2 border rounded-lg bg-slate-50"
              >
                <option value="">-- Semua Gelombang --</option>
                {(waves || []).map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>

              {/* Program selection */}
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="p-2 border rounded-lg bg-slate-50"
              >
                <option value="">-- Semua Program Studi --</option>
                {(programs || []).map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>

              {/* Status selection */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="p-2 border rounded-lg bg-slate-50"
              >
                <option value="">-- Semua Status --</option>
                {Object.keys(badgeLabels).map(key => (
                  <option key={key} value={key}>{badgeLabels[key]}</option>
                ))}
              </select>
            </div>
            
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedWave('');
                setSelectedProgram('');
                setStatusFilter('');
              }}
              className="text-xs text-blue-600 hover:underline shrink-0"
            >
              Reset Filter
            </button>
          </div>

          {/* Table list */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b text-slate-400 font-bold">
                    <th className="p-4">No. Pendaftaran</th>
                    <th>Nama Calon Siswa</th>
                    <th>Gelombang & Program</th>
                    <th>NIK / NIK Ibu</th>
                    <th>Skor Seleksi</th>
                    <th>Status PPDB</th>
                    <th className="p-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingApplicants ? (
                    <tr><td colSpan={7} className="p-8 text-center font-mono">LOADING APPLICANTS...</td></tr>
                  ) : (applicants || []).length === 0 ? (
                    <tr><td colSpan={7} className="p-8 text-center text-slate-400">Tidak ada pendaftar yang cocok dengan filter atau pendaftaran kosong. Gunakan Sandbox untuk mendaftar!</td></tr>
                  ) : (applicants || []).map((app: any) => (
                    <tr key={app.id} className="border-b hover:bg-slate-50/40">
                      <td className="p-4 font-mono font-bold text-blue-600">{app.registration_number}</td>
                      <td>
                        <div className="font-semibold text-slate-800">{app.full_name}</div>
                        <div className="text-[10px] text-slate-400">{app.gender === 'L' ? 'Laki-laki' : 'Perempuan'} • {app.previous_school}</div>
                      </td>
                      <td>
                        <div className="font-medium">{app.wave_name}</div>
                        <div className="text-[10px] text-slate-400">{app.program_name}</div>
                      </td>
                      <td className="font-mono text-slate-600">{app.nik}</td>
                      <td className="font-bold text-slate-700">{app.score ? `${app.score} / 100` : 'Belum dinilai'}</td>
                      <td>
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold border ${badgeColors[app.status] || 'bg-slate-100 text-slate-800 border-slate-200'}`}>
                          {badgeLabels[app.status] || app.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => {
                            setViewingAppId(app.id);
                            setIsVerifying(true);
                          }}
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded border border-blue-200 font-bold transition-all"
                        >
                          Detail & Verifikasi
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ASSESSMENTS & SCORES */}
      {activeSubTab === 'assessments' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Exam Schedules Management */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 lg:col-span-1">
              <div className="flex justify-between items-center mb-4 border-b pb-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Jadwal Ujian Akademik</span>
                <button
                  onClick={() => setIsAddingSchedule(true)}
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 rounded border border-blue-200"
                >
                  <Plus className="h-3 w-3" /> Tambah
                </button>
              </div>

              {isAddingSchedule && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    createWaveMutation.mutate({
                      wave_id: form.schWave.value,
                      subject_name: form.schSubject.value,
                      exam_date: form.schDate.value,
                      start_time: form.schStart.value,
                      end_time: form.schEnd.value,
                      room_name: form.schRoom.value,
                      capacity: Number(form.schCap.value)
                    }, {
                      onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: ['admissionSchedules'] });
                        setIsAddingSchedule(false);
                      }
                    });
                  }}
                  className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4 space-y-2.5 text-xs"
                >
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600">Gelombang Seleksi</label>
                    <select name="schWave" className="w-full p-2 border rounded-lg bg-white" required>
                      {(waves || []).map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600">Mata Pelajaran Ujian</label>
                    <input type="text" name="schSubject" placeholder="e.g. Tes Potensi Akademik (TPA)" className="w-full p-2 border rounded-lg bg-white" required />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600">Tanggal Ujian</label>
                    <input type="date" name="schDate" className="w-full p-2 border rounded-lg bg-white" required />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-600">Jam Mulai</label>
                      <input type="time" name="schStart" defaultValue="08:00" className="w-full p-2 border rounded-lg bg-white" required />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-600">Jam Selesai</label>
                      <input type="time" name="schEnd" defaultValue="10:00" className="w-full p-2 border rounded-lg bg-white" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-600">Ruangan</label>
                      <input type="text" name="schRoom" placeholder="Lab Komputer 1" className="w-full p-2 border rounded-lg bg-white" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-600">Kapasitas</label>
                      <input type="number" name="schCap" defaultValue={40} className="w-full p-2 border rounded-lg bg-white" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setIsAddingSchedule(false)} className="px-3 py-1.5 border rounded-lg bg-white text-slate-600">Batal</button>
                    <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-bold">Simpan</button>
                  </div>
                </form>
              )}

              <div className="space-y-3">
                {loadingSchedules ? (
                  <p className="text-center font-mono text-slate-500">LOADING...</p>
                ) : (schedules || []).length === 0 ? (
                  <p className="text-slate-400 text-center py-4">Belum ada jadwal ujian dibuat.</p>
                ) : (schedules || []).map((sch: any) => {
                  const waveObj = (waves || []).find((w: any) => w.id === sch.wave_id);
                  return (
                    <div key={sch.id} className="p-3 border rounded-lg hover:bg-slate-50 text-xs">
                      <div className="font-bold text-slate-800">{sch.subject_name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{waveObj ? waveObj.name : ''}</div>
                      <div className="flex justify-between text-slate-500 mt-2">
                        <span>{sch.exam_date}</span>
                        <span>{sch.start_time} - {sch.end_time}</span>
                      </div>
                      <div className="text-slate-500 mt-0.5">Ruang: <span className="font-medium text-slate-700">{sch.room_name || '-'}</span></div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Score Assessment Input Panel */}
            <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block border-b pb-3 mb-4">Input Nilai Seleksi Individu</span>
              <p className="text-xs text-slate-500 mb-4">Pilih pendaftar yang berstatus terverifikasi untuk menginputkan nilai ujian, wawancara, kesehatan, atau tahfidz.</p>
              
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b text-slate-400 font-bold">
                      <th className="py-2">No. Registrasi</th>
                      <th>Nama Calon Siswa</th>
                      <th>Program</th>
                      <th>Status Berkas</th>
                      <th className="text-center">Aksi Input Nilai</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(applicants || []).filter((a: any) => ['VERIFIED', 'EXAM_COMPLETED', 'PASSED'].includes(a.status)).length === 0 ? (
                      <tr><td colSpan={5} className="py-4 text-center text-slate-400">Tidak ada pendaftar berstatus berkas terverifikasi yang tersedia.</td></tr>
                    ) : (applicants || []).filter((a: any) => ['VERIFIED', 'EXAM_COMPLETED', 'PASSED'].includes(a.status)).map((app: any) => (
                      <tr key={app.id} className="border-b hover:bg-slate-50">
                        <td className="py-2.5 font-mono font-bold text-slate-700">{app.registration_number}</td>
                        <td>
                          <div className="font-semibold text-slate-800">{app.full_name}</div>
                        </td>
                        <td>{app.program_name}</td>
                        <td>
                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-semibold rounded text-[10px]">VERIFIED</span>
                        </td>
                        <td className="text-center py-2">
                          <button
                            onClick={() => {
                              setViewingAppId(app.id);
                              setIsVerifying(true);
                            }}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded"
                          >
                            Input Evaluasi
                          </button>
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

      {/* TAB 5: SELECTION & GRADUATION */}
      {activeSubTab === 'selection' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block border-b pb-3">Sistem Kelulusan Otomatis (Auto Scoring & Ranking)</span>
            <p className="text-xs text-slate-500">
              Sistem akan menghitung bobot nilai kelulusan secara otomatis berdasarkan formula pembobotan PPDB Nasional:<br />
              <strong className="text-blue-600">TPA Akademik (30%) + Wawancara (25%) + Tes Kesehatan (15%) + Tes Tahfidz (10%) + Skor Zonasi/Jarak (20%)</strong>.
            </p>

            <div className="flex flex-wrap gap-3 items-center">
              <select
                value={selectedWave}
                onChange={(e) => setSelectedWave(e.target.value)}
                className="p-2.5 border rounded-lg bg-slate-50 text-xs font-semibold"
              >
                <option value="">-- Pilih Gelombang Seleksi --</option>
                {(waves || []).map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>

              <button
                type="button"
                disabled={!selectedWave || generateScoresMutation.isPending}
                onClick={() => generateScoresMutation.mutate(selectedWave)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg disabled:opacity-50 transition-all flex items-center gap-1.5"
              >
                <Activity className="h-4 w-4" /> Kalkulasi Nilai Akhir
              </button>

              <button
                type="button"
                disabled={!selectedWave || generateRankingsMutation.isPending}
                onClick={() => generateRankingsMutation.mutate(selectedWave)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg disabled:opacity-50 transition-all flex items-center gap-1.5"
              >
                <Award className="h-4 w-4" /> Terbitkan Urutan Ranking
              </button>
            </div>
          </div>

          {/* Ranking & Results Publishing Table */}
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Daftar Rekapitulasi Kelulusan Gelombang</span>
              {selectedWave && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const waveApps = (applicants || []).filter((a: any) => a.wave_id === selectedWave && a.status === 'EXAM_COMPLETED');
                      if (waveApps.length === 0) {
                        alert('Tidak ada siswa yang berstatus ujian selesai di gelombang ini.');
                        return;
                      }
                      publishSelectionResultMutation.mutate({
                        application_ids: waveApps.map(a => a.id),
                        status: 'Lulus',
                        notes: 'Selamat, Anda dinyatakan LULUS seleksi utama dan diterima di sekolah!'
                      });
                    }}
                    className="px-3 py-1.5 bg-emerald-600 text-white rounded text-xs font-bold hover:bg-emerald-700"
                  >
                    Luluskan Semua (EXAM_COMPLETED)
                  </button>
                  <button
                    onClick={() => {
                      const waveApps = (applicants || []).filter((a: any) => a.wave_id === selectedWave && a.status === 'EXAM_COMPLETED');
                      if (waveApps.length === 0) {
                        alert('Tidak ada siswa yang berstatus ujian selesai di gelombang ini.');
                        return;
                      }
                      publishSelectionResultMutation.mutate({
                        application_ids: waveApps.map(a => a.id),
                        status: 'Cadangan',
                        notes: 'Anda dinyatakan berstatus CADANGAN (Waiting List).'
                      });
                    }}
                    className="px-3 py-1.5 bg-orange-500 text-white rounded text-xs font-bold hover:bg-orange-600"
                  >
                    Cadangkan Semua
                  </button>
                </div>
              )}
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b text-slate-400 font-bold bg-slate-50/50">
                    <th className="p-3">Rank</th>
                    <th>Nomor PPDB</th>
                    <th>Nama Calon</th>
                    <th>Pilihan Program</th>
                    <th>Skor Akhir</th>
                    <th>Keputusan Seleksi</th>
                    <th className="text-center">Aksi Publikasi</th>
                  </tr>
                </thead>
                <tbody>
                  {!selectedWave ? (
                    <tr><td colSpan={7} className="p-8 text-center text-slate-400">Silakan pilih Gelombang terlebih dahulu untuk memunculkan tabel ranking pendaftar.</td></tr>
                  ) : (applicants || []).filter((a: any) => a.wave_id === selectedWave).length === 0 ? (
                    <tr><td colSpan={7} className="p-8 text-center text-slate-400">Belum ada pendaftar di gelombang ini.</td></tr>
                  ) : (applicants || []).filter((a: any) => a.wave_id === selectedWave)
                    .sort((a: any, b: any) => (b.score || 0) - (a.score || 0))
                    .map((app: any, idx: number) => (
                      <tr key={app.id} className="border-b hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-700">{idx + 1}</td>
                        <td className="font-mono font-bold text-slate-700">{app.registration_number}</td>
                        <td className="font-semibold text-slate-800">{app.full_name}</td>
                        <td>{app.program_name}</td>
                        <td className="font-bold text-blue-600">{app.score ? `${app.score} / 100` : 'Belum dihitung'}</td>
                        <td>
                          <span className={`px-2 py-1 rounded-full text-[9px] font-bold border ${badgeColors[app.status] || 'bg-slate-100 text-slate-800'}`}>
                            {badgeLabels[app.status] || app.status}
                          </span>
                        </td>
                        <td className="p-3 text-center flex justify-center gap-1.5">
                          <button
                            onClick={() => publishSelectionResultMutation.mutate({
                              application_ids: [app.id],
                              status: 'Lulus'
                            })}
                            className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 rounded"
                          >
                            Lulus
                          </button>
                          <button
                            onClick={() => publishSelectionResultMutation.mutate({
                              application_ids: [app.id],
                              status: 'Cadangan'
                            })}
                            className="px-2.5 py-1 bg-orange-50 text-orange-700 font-bold border border-orange-200 rounded"
                          >
                            Cadangan
                          </button>
                          <button
                            onClick={() => publishSelectionResultMutation.mutate({
                              application_ids: [app.id],
                              status: 'Tidak Lulus'
                            })}
                            className="px-2.5 py-1 bg-rose-50 text-rose-700 font-bold border border-rose-200 rounded"
                          >
                            Gagal
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: RE-REGISTRATION & STUDENT GENERATION */}
      {activeSubTab === 'rereg' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Waiting List Caller Panel */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 lg:col-span-1 space-y-4">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block border-b pb-3">Siswa Cadangan (Waiting List)</span>
            <p className="text-[11px] text-slate-500">Daftar pendaftar cadangan yang dapat dipanggil masuk jika kuota lulus utama ada yang mengundurkan diri.</p>

            <div className="space-y-3">
              {loadingWL ? (
                <p className="text-center font-mono text-xs">LOADING LIST...</p>
              ) : (waitingLists || []).length === 0 ? (
                <p className="text-slate-400 text-center py-4 text-xs">Tidak ada pendaftar berstatus cadangan saat ini.</p>
              ) : (waitingLists || []).map((wl: any) => (
                <div key={wl.id} className="p-3 border rounded-lg hover:bg-slate-50 text-xs space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-800">{wl.full_name}</span>
                    <span className="font-mono text-orange-600">Prioritas #{wl.priority_index}</span>
                  </div>
                  <div className="text-[10px] text-slate-400">{wl.registration_number} • {wl.program_name}</div>
                  <div className="flex justify-between items-center pt-2">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      wl.status === 'CALLED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {wl.status === 'CALLED' ? 'SUDAH DIPANGGIL' : 'WAITING'}
                    </span>
                    {wl.status === 'WAITING' && (
                      <button
                        onClick={() => callWaitingListMutation.mutate(wl.id)}
                        className="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-bold"
                      >
                        Panggil Lulus
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Re-Registration & Transfer SIS Student ID generation */}
          <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block border-b pb-3 mb-4">Proses Registrasi Ulang & Penginputan Data Akademik Utama</span>
            <p className="text-xs text-slate-500 mb-4">Validasi pembayaran daftar ulang pendaftar yang Lulus dan generate NIS/NIM siswa secara otomatis ke database pusat ERP.</p>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b text-slate-400 font-bold bg-slate-50/50">
                    <th className="p-3">Nomor PPDB</th>
                    <th>Nama Calon Siswa</th>
                    <th>Status PPDB</th>
                    <th>Daftar Ulang</th>
                    <th className="text-center">Integrasi Database SIS</th>
                  </tr>
                </thead>
                <tbody>
                  {(applicants || []).filter((a: any) => ['PASSED', 'RE_REGISTERED'].includes(a.status)).length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-slate-400">Belum ada siswa yang dinyatakan Lulus seleksi utama di sistem saat ini.</td></tr>
                  ) : (applicants || []).filter((a: any) => ['PASSED', 'RE_REGISTERED'].includes(a.status)).map((app: any) => (
                    <tr key={app.id} className="border-b hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-slate-700">{app.registration_number}</td>
                      <td>
                        <div className="font-semibold text-slate-800">{app.full_name}</div>
                        <div className="text-[10px] text-slate-400">{app.program_name}</div>
                      </td>
                      <td>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${badgeColors[app.status]}`}>
                          {badgeLabels[app.status]}
                        </span>
                      </td>
                      <td>
                        {app.status === 'PASSED' ? (
                          <button
                            onClick={() => submitReRegistrationMutation.mutate(app.id)}
                            className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded font-bold"
                          >
                            Setujui Registrasi
                          </button>
                        ) : (
                          <span className="text-teal-600 font-bold flex items-center gap-1">
                            <CheckCircle className="h-3.5 w-3.5" /> Lunas / Selesai
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {app.status === 'RE_REGISTERED' ? (
                          <button
                            onClick={() => generateStudentIdMutation.mutate(app.id)}
                            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold"
                          >
                            Generate NIM Utama
                          </button>
                        ) : app.status === 'PASSED' ? (
                          <span className="text-slate-400">Menunggu Registrasi</span>
                        ) : (
                          <span className="text-slate-400">Database Ready</span>
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

      {/* TAB 7: SANDBOX PUBLIC REGISTRATION PORTAL */}
      {activeSubTab === 'portal' && (
        <div className="max-w-4xl mx-auto bg-slate-900 text-slate-100 p-6 md:p-8 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden">
          {/* Neon header branding */}
          <div className="absolute top-0 right-0 p-4 font-mono text-[10px] tracking-widest text-blue-500 uppercase font-black">
            Public Admission Portal Simulation
          </div>

          <div className="flex items-center gap-3 border-b border-slate-800 pb-5 mb-6">
            <GraduationCap className="h-7 w-7 text-blue-500" />
            <div>
              <h2 className="text-lg font-black tracking-tight">{isPondok ? 'Pondok Pesantren Daarul Qur\'an Admission' : 'PPDB Online Portal Pendaftaran'}</h2>
              <p className="text-xs text-slate-400">Simulasi utuh pengisian data, upload berkas, dan pelunasan Virtual Account oleh Orang Tua / Wali murid</p>
            </div>
          </div>

          {playgroundStep === 1 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const payload = {
                  period_id: form.pPeriod.value,
                  wave_id: form.pWave.value,
                  program_id: form.pProg.value,
                  full_name: form.pFullName.value,
                  nickname: form.pNickname.value,
                  gender: form.pGender.value,
                  birth_place: form.pBirthPlace.value,
                  birth_date: form.pBirthDate.value,
                  nisn: form.pNisn.value,
                  nik: form.pNik.value,
                  phone: form.pPhone.value,
                  email: form.pEmail.value,
                  previous_school: form.pPrevSchool.value,
                  father_name: form.pFatherName.value,
                  father_nik: form.pFatherNik.value,
                  father_education: form.pFatherEdu.value,
                  father_occupation: form.pFatherOcc.value,
                  father_income: form.pFatherInc.value,
                  mother_name: form.pMotherName.value,
                  mother_nik: form.pMotherNik.value,
                  mother_education: form.pMotherEdu.value,
                  mother_occupation: form.pMotherOcc.value,
                  mother_income: form.pMotherInc.value,
                  guardian_name: form.pGuardName.value,
                  guardian_phone: form.pGuardPhone.value,
                  province: form.pProvince.value,
                  regency: form.pRegency.value,
                  district: form.pDistrict.value,
                  village: form.pVillage.value,
                  rt_rw: form.pRtRw.value,
                  address_line: form.pAddressLine.value,
                  postal_code: form.pPostal.value,
                  distance_km: Number(form.pDistance.value),
                };
                simulateSubmitPlaygroundMutation.mutate(payload);
              }}
              className="space-y-6 text-xs text-slate-300"
            >
              {/* Core selection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-800/40 p-4 rounded-xl border border-slate-800">
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 block">Tahun Ajaran Periode</label>
                  <select name="pPeriod" className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white" required>
                    {(periods || []).map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 block">Gelombang Seleksi</label>
                  <select name="pWave" className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white" required>
                    {(waves || []).filter((w: any) => w.status === 'ACTIVE').map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 block">Pilihan Jurusan / Program</label>
                  <select name="pProg" className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white" required>
                    {(programs || []).map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Data Calon Siswa */}
              <div className="space-y-4">
                <h3 className="font-black text-blue-400 border-b border-slate-800 pb-1 uppercase tracking-wider text-[11px]">I. Data Pribadi Calon Siswa</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-400 block">Nama Lengkap (Sesuai Akta)</label>
                    <input type="text" name="pFullName" defaultValue="Ahmad Syarifuddin" className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 block">Nama Panggilan</label>
                    <input type="text" name="pNickname" defaultValue="Ahmad" className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 block">Jenis Kelamin</label>
                    <select name="pGender" className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white">
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 block">NIK Calon Siswa</label>
                    <input type="text" name="pNik" defaultValue="3273100204090001" className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 block">NISN</label>
                    <input type="text" name="pNisn" defaultValue="0098765432" className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 block">Nomor HP/WA Orang Tua</label>
                    <input type="text" name="pPhone" defaultValue="081234567890" className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white" required />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 block">Tempat Lahir</label>
                    <input type="text" name="pBirthPlace" defaultValue="Bandung" className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 block">Tanggal Lahir</label>
                    <input type="date" name="pBirthDate" defaultValue="2010-04-12" className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 block">Email Pendaftar</label>
                    <input type="email" name="pEmail" defaultValue="syarif@gmail.com" className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white" />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-slate-400 block">Sekolah Asal</label>
                    <input type="text" name="pPrevSchool" defaultValue="SMP Negeri 1 Bandung" className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 block">Estimasi Jarak Rumah ke Sekolah (KM)</label>
                    <input type="number" name="pDistance" defaultValue="4.5" className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white" required />
                  </div>
                </div>
              </div>

              {/* Data Orang Tua */}
              <div className="space-y-4">
                <h3 className="font-black text-blue-400 border-b border-slate-800 pb-1 uppercase tracking-wider text-[11px]">II. Data Orang Tua / Wali</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Father */}
                  <div className="p-4 bg-slate-800/20 border border-slate-800 rounded-xl space-y-3">
                    <span className="font-bold text-slate-300 block border-b border-slate-800 pb-1 text-[10px] uppercase text-indigo-400">Data Ayah</span>
                    <div className="space-y-2">
                      <input type="text" name="pFatherName" placeholder="Nama Lengkap Ayah" defaultValue="Herman Syah" className="w-full p-2 rounded bg-slate-800 border border-slate-700 text-white" />
                      <input type="text" name="pFatherNik" placeholder="NIK Ayah" defaultValue="3273100204650002" className="w-full p-2 rounded bg-slate-800 border border-slate-700 text-white" />
                      <input type="text" name="pFatherEdu" placeholder="Pendidikan Terakhir" defaultValue="S1 Teknik" className="w-full p-2 rounded bg-slate-800 border border-slate-700 text-white" />
                      <input type="text" name="pFatherOcc" placeholder="Pekerjaan" defaultValue="Wiraswasta" className="w-full p-2 rounded bg-slate-800 border border-slate-700 text-white" />
                      <input type="text" name="pFatherInc" placeholder="Penghasilan Bulanan" defaultValue="Rp 8.000.000" className="w-full p-2 rounded bg-slate-800 border border-slate-700 text-white" />
                    </div>
                  </div>

                  {/* Mother */}
                  <div className="p-4 bg-slate-800/20 border border-slate-800 rounded-xl space-y-3">
                    <span className="font-bold text-slate-300 block border-b border-slate-800 pb-1 text-[10px] uppercase text-pink-400">Data Ibu Kandung</span>
                    <div className="space-y-2">
                      <input type="text" name="pMotherName" placeholder="Nama Lengkap Ibu" defaultValue="Dewi Sartika" className="w-full p-2 rounded bg-slate-800 border border-slate-700 text-white" />
                      <input type="text" name="pMotherNik" placeholder="NIK Ibu" defaultValue="3273100204700003" className="w-full p-2 rounded bg-slate-800 border border-slate-700 text-white" />
                      <input type="text" name="pMotherEdu" placeholder="Pendidikan Terakhir" defaultValue="D3 Ekonomi" className="w-full p-2 rounded bg-slate-800 border border-slate-700 text-white" />
                      <input type="text" name="pMotherOcc" placeholder="Pekerjaan" defaultValue="Ibu Rumah Tangga" className="w-full p-2 rounded bg-slate-800 border border-slate-700 text-white" />
                      <input type="text" name="pMotherInc" placeholder="Penghasilan Bulanan" defaultValue="-" className="w-full p-2 rounded bg-slate-800 border border-slate-700 text-white" />
                    </div>
                  </div>

                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-slate-400">Nama Wali (Jika Ada)</label>
                      <input type="text" name="pGuardName" placeholder="Kosongkan jika diwakili orang tua" className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400">Nomor Kontak Wali</label>
                      <input type="text" name="pGuardPhone" placeholder="Kosongkan jika diwakili orang tua" className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Alamat Pendaftar */}
              <div className="space-y-4">
                <h3 className="font-black text-blue-400 border-b border-slate-800 pb-1 uppercase tracking-wider text-[11px]">III. Alamat Domisili Lengkap</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-400">Provinsi</label>
                    <input type="text" name="pProvince" defaultValue="Jawa Barat" className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400">Kabupaten/Kota</label>
                    <input type="text" name="pRegency" defaultValue="Bandung" className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400">Kecamatan</label>
                    <input type="text" name="pDistrict" defaultValue="Coblong" className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400">Kelurahan/Desa</label>
                    <input type="text" name="pVillage" defaultValue="Dago" className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white" required />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400">RT / RW</label>
                    <input type="text" name="pRtRw" defaultValue="04 / 12" className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400">Kode Pos</label>
                    <input type="text" name="pPostal" defaultValue="40135" className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white" required />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-slate-400">Alamat Jalan / Blok</label>
                    <input type="text" name="pAddressLine" defaultValue="Jl. Juanda No. 125, Dago" className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white" required />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-5 flex justify-end">
                <button
                  type="submit"
                  disabled={simulateSubmitPlaygroundMutation.isPending}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  {simulateSubmitPlaygroundMutation.isPending ? 'Mengirim Formulir...' : 'Kirim Formulir Pendaftaran PPDB'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          )}

          {playgroundStep === 2 && registeredResult && (
            <div className="space-y-6 text-xs text-slate-300">
              {/* Confirmed banner */}
              <div className="bg-blue-950 border border-blue-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-blue-400 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                    Pendaftaran Berhasil Terkirim!
                  </h3>
                  <p className="text-slate-400 mt-1">Gunakan Nomor Registrasi ini untuk memantau pengumuman kelulusan.</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl text-center font-mono shrink-0">
                  <span className="text-[10px] text-slate-500 block">NOMOR REGISTRASI</span>
                  <span className="text-base font-black text-blue-400 tracking-wider">{registeredResult?.application?.registration_number}</span>
                </div>
              </div>

              {/* Billing Virtual Account simulation */}
              <div className="bg-slate-800/40 border border-slate-800 p-5 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">TAGIHAN VIRTUAL ACCOUNT</span>
                  <h4 className="text-sm font-semibold text-white">Biaya Pendaftaran Formulir</h4>
                  <p className="text-slate-400">Setiap pendaftar wajib melunasi biaya administrasi pendaftaran formulir agar berkas dapat divalidasi panitia.</p>
                  <div className="text-lg font-black text-blue-400 pt-2">Rp {registeredResult?.payment?.amount?.toLocaleString()}</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between space-y-4">
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-slate-500">BANK VA</span>
                    <span className="text-slate-300 font-bold">MANDIRI VA (Demo)</span>
                  </div>
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-slate-500">NO. REKENING VA</span>
                    <span className="text-blue-400 font-black tracking-widest">{registeredResult?.payment?.va_number}</span>
                  </div>
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-slate-500">STATUS BILLING</span>
                    <span className={`font-black ${registeredResult?.payment?.status === 'PAID' ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {registeredResult?.payment?.status === 'PAID' ? 'LUNAS (PAID)' : 'MENUNGGU PEMBAYARAN'}
                    </span>
                  </div>

                  {registeredResult?.payment?.status !== 'PAID' && (
                    <button
                      type="button"
                      onClick={() => simulatePayVAMutation.mutate({ id: registeredResult?.payment?.id })}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all"
                    >
                      Bayar Simulasi VA (Lunas)
                    </button>
                  )}
                </div>
              </div>

              {/* Documents Upload Section */}
              <div className="bg-slate-800/20 border border-slate-800 p-5 rounded-xl space-y-4">
                <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px] block">III. BERKAS PERSYARATAN ADMINISTRASI</span>
                <p className="text-slate-400">Silakan upload berkas dokumen wajib di bawah ini untuk diverifikasi panitia seleksi sekolah.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: 'req-1', name: 'Kartu Keluarga (KK)' },
                    { id: 'req-2', name: 'Akte Kelahiran' },
                    { id: 'req-3', name: 'Surat Keterangan Lulus (SKL)' },
                    { id: 'req-4', name: 'Pas Foto 3x4 Calon Siswa' }
                  ].map(doc => {
                    const status = uploadProgress[doc.id] || 'EMPTY';
                    return (
                      <div key={doc.id} className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-slate-300 block">{doc.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono block">Format PDF/JPG max 2MB</span>
                        </div>
                        {status === 'SUCCESS' ? (
                          <span className="text-emerald-500 font-bold flex items-center gap-1"><Check className="h-4 w-4" /> Berhasil</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => simulateDocumentUploadMutation.mutate({
                              application_id: registeredResult?.application?.id,
                              requirement_id: doc.id,
                              name: doc.name,
                              file_url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=600'
                            })}
                            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-bold"
                          >
                            Simulasi Upload
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-slate-800 pt-5 flex justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setPlaygroundStep(1);
                    setRegisteredResult(null);
                    setUploadProgress({});
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg"
                >
                  Daftarkan Siswa Baru Lainnya
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveSubTab('applicants');
                    setViewingAppId(registeredResult?.application?.id);
                    setIsVerifying(true);
                  }}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
                >
                  Buka Menu Verifikator Admin
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FULL VERIFICATION & DETAILED EVALUATION MODAL (SIDEBAR MODAL) */}
      {isVerifying && viewingAppId && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop overlay */}
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsVerifying(false)} />
          
          {/* Modal content body */}
          <div className="relative w-full max-w-4xl bg-white h-screen overflow-y-auto shadow-2xl flex flex-col p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-center border-b pb-4 shrink-0">
              <div>
                <h3 className="text-base font-extrabold text-slate-800">Detail Pendaftar & Panel Evaluator</h3>
                <p className="text-xs text-slate-500 font-mono">No. PPDB: {activeAppDetail?.application?.registration_number}</p>
              </div>
              <button
                onClick={() => setIsVerifying(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            {loadingDetail ? (
              <p className="text-center font-mono py-8">LOADING DETAILS...</p>
            ) : (
              <div className="flex-1 space-y-6 text-xs text-slate-700">
                {/* Visual Status Tracker */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-mono">STATUS DAFTAR</span>
                    <span className="font-bold text-slate-700 text-sm">{badgeLabels[activeAppDetail?.application?.status] || activeAppDetail?.application?.status}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-mono">GELOMBANG</span>
                    <span className="font-bold text-slate-700 text-sm">{activeAppDetail?.application?.wave_name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-mono">JALUR PROGRAM</span>
                    <span className="font-bold text-slate-700 text-sm">{activeAppDetail?.application?.program_name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-mono">SKOR SELEKSI</span>
                    <span className="font-bold text-blue-600 text-sm">{activeAppDetail?.scores?.overall_score ? `${activeAppDetail.scores.overall_score} / 100` : 'Belum dihitung'}</span>
                  </div>
                </div>

                {/* Grid Layout detail */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal details */}
                  <div className="space-y-4">
                    <div className="border-b pb-1.5"><span className="font-black text-slate-800 text-[11px] uppercase tracking-wider text-blue-600">I. Data Diri Calon Siswa</span></div>
                    <div className="space-y-2">
                      <div className="grid grid-cols-3"><span className="text-slate-400">Nama Lengkap:</span><span className="col-span-2 font-semibold text-slate-800">{activeAppDetail?.application?.full_name}</span></div>
                      <div className="grid grid-cols-3"><span className="text-slate-400">Gender:</span><span className="col-span-2">{activeAppDetail?.application?.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span></div>
                      <div className="grid grid-cols-3"><span className="text-slate-400">NIK:</span><span className="col-span-2 font-mono">{activeAppDetail?.application?.nik}</span></div>
                      <div className="grid grid-cols-3"><span className="text-slate-400">NISN:</span><span className="col-span-2 font-mono">{activeAppDetail?.application?.nisn || '-'}</span></div>
                      <div className="grid grid-cols-3"><span className="text-slate-400">Kontak HP/WA:</span><span className="col-span-2 font-mono">{activeAppDetail?.application?.phone}</span></div>
                      <div className="grid grid-cols-3"><span className="text-slate-400">Lahir:</span><span className="col-span-2">{activeAppDetail?.application?.birth_place}, {activeAppDetail?.application?.birth_date}</span></div>
                      <div className="grid grid-cols-3"><span className="text-slate-400">Sekolah Asal:</span><span className="col-span-2">{activeAppDetail?.application?.previous_school || '-'}</span></div>
                    </div>

                    <div className="border-b pb-1.5 pt-2"><span className="font-black text-slate-800 text-[11px] uppercase tracking-wider text-blue-600">II. Domisili Alamat</span></div>
                    <div className="space-y-2">
                      <div className="grid grid-cols-3"><span className="text-slate-400">Provinsi:</span><span className="col-span-2">{activeAppDetail?.address?.province}</span></div>
                      <div className="grid grid-cols-3"><span className="text-slate-400">Kota/Kab:</span><span className="col-span-2">{activeAppDetail?.address?.regency}</span></div>
                      <div className="grid grid-cols-3"><span className="text-slate-400">Kecamatan:</span><span className="col-span-2">{activeAppDetail?.address?.district}</span></div>
                      <div className="grid grid-cols-3"><span className="text-slate-400">Kelurahan:</span><span className="col-span-2">{activeAppDetail?.address?.village}</span></div>
                      <div className="grid grid-cols-3"><span className="text-slate-400">RT / RW:</span><span className="col-span-2 font-mono">{activeAppDetail?.address?.rt_rw}</span></div>
                      <div className="grid grid-cols-3"><span className="text-slate-400">Kode Pos:</span><span className="col-span-2 font-mono">{activeAppDetail?.address?.postal_code}</span></div>
                      <div className="grid grid-cols-3"><span className="text-slate-400">Jalan Lengkap:</span><span className="col-span-2">{activeAppDetail?.address?.address_line}</span></div>
                      <div className="grid grid-cols-3"><span className="text-slate-400">Jarak Zonasi:</span><span className="col-span-2 font-bold text-slate-800">{activeAppDetail?.address?.distance_km || 0} KM</span></div>
                    </div>
                  </div>

                  {/* Family details & Documents Upload */}
                  <div className="space-y-4">
                    <div className="border-b pb-1.5"><span className="font-black text-slate-800 text-[11px] uppercase tracking-wider text-blue-600">III. Orang Tua / Wali</span></div>
                    <div className="space-y-2">
                      <div className="grid grid-cols-3"><span className="text-slate-400">Nama Ayah:</span><span className="col-span-2 font-semibold text-slate-800">{activeAppDetail?.guardian?.father_name || '-'}</span></div>
                      <div className="grid grid-cols-3"><span className="text-slate-400">NIK Ayah:</span><span className="col-span-2 font-mono">{activeAppDetail?.guardian?.father_nik || '-'}</span></div>
                      <div className="grid grid-cols-3"><span className="text-slate-400">Pekerjaan Ayah:</span><span className="col-span-2">{activeAppDetail?.guardian?.father_occupation || '-'}</span></div>
                      <div className="grid grid-cols-3"><span className="text-slate-400">Nama Ibu:</span><span className="col-span-2 font-semibold text-slate-800">{activeAppDetail?.guardian?.mother_name || '-'}</span></div>
                      <div className="grid grid-cols-3"><span className="text-slate-400">NIK Ibu:</span><span className="col-span-2 font-mono">{activeAppDetail?.guardian?.mother_nik || '-'}</span></div>
                      <div className="grid grid-cols-3"><span className="text-slate-400">Pekerjaan Ibu:</span><span className="col-span-2">{activeAppDetail?.guardian?.mother_occupation || '-'}</span></div>
                    </div>

                    <div className="border-b pb-1.5 pt-2"><span className="font-black text-slate-800 text-[11px] uppercase tracking-wider text-blue-600">IV. Dokumen Persyaratan Pendaftaran</span></div>
                    <div className="space-y-2.5">
                      {(activeAppDetail?.documents || []).length === 0 ? (
                        <p className="text-slate-400 italic">Belum ada dokumen yang diunggah oleh pendaftar.</p>
                      ) : (activeAppDetail?.documents || []).map((doc: any) => (
                        <div key={doc.id} className="p-2 border rounded bg-slate-50 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-700 block">{doc.name}</span>
                            <span className="text-[10px] text-slate-400 block font-mono">{doc.file_size_kb || 250}KB • Status: {doc.status}</span>
                          </div>
                          <div className="flex gap-1.5">
                            <a
                              href={doc.file_url}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-[10px] font-bold"
                            >
                              Lihat File
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Score Evaluations & Input Form section */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  {/* Scores display */}
                  <div className="space-y-3">
                    <span className="font-bold text-slate-800 text-[10px] uppercase tracking-wider text-blue-600">Evaluasi & Nilai Seleksi PPDB</span>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-2.5 bg-white border rounded">
                        <span className="text-slate-400 block">Akademik TPA</span>
                        <span className="text-base font-black text-slate-800">{activeAppDetail?.scores?.academic_score || 'N/A'}</span>
                      </div>
                      <div className="p-2.5 bg-white border rounded">
                        <span className="text-slate-400 block">Wawancara</span>
                        <span className="text-base font-black text-slate-800">{activeAppDetail?.scores?.interview_score || 'N/A'}</span>
                      </div>
                      <div className="p-2.5 bg-white border rounded">
                        <span className="text-slate-400 block">Tes Kesehatan</span>
                        <span className="text-base font-black text-slate-800">{activeAppDetail?.scores?.medical_score || 'N/A'}</span>
                      </div>
                      <div className="p-2.5 bg-white border rounded">
                        <span className="text-slate-400 block">Tahfidz Quran</span>
                        <span className="text-base font-black text-slate-800">{activeAppDetail?.scores?.tahfidz_score || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Score input fields */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.target as HTMLFormElement;
                      const scoreType = form.sType.value as any;
                      const scoreValue = Number(form.sVal.value);
                      submitScoreMutation.mutate({
                        type: scoreType,
                        payload: {
                          application_id: viewingAppId,
                          score: scoreValue,
                          notes: form.sNotes.value,
                          // Optional sub-fields
                          subject_name: scoreType === 'exam' ? 'Akademik Umum (TPA)' : undefined,
                        }
                      });
                    }}
                    className="p-3 bg-white border rounded-xl space-y-2.5"
                  >
                    <span className="font-bold text-slate-800 text-[10px] block border-b pb-1">FORMULIR INPUT NILAI BARU</span>
                    <div className="grid grid-cols-2 gap-2">
                      <select name="sType" className="p-2 border rounded bg-slate-50 text-xs">
                        <option value="exam">Ujian Akademik TPA</option>
                        <option value="interview">Wawancara Siswa/Ortu</option>
                        <option value="medical">Pemeriksaan Kesehatan</option>
                        <option value="tahfidz">Tes Tahfidz Al-Quran</option>
                      </select>
                      <input type="number" name="sVal" placeholder="Skor (0-100)" className="p-2 border rounded bg-slate-50 text-xs" required />
                    </div>
                    <input type="text" name="sNotes" placeholder="Catatan deskripsi penilai..." className="w-full p-2 border rounded bg-slate-50 text-xs" />
                    <button
                      type="submit"
                      disabled={submitScoreMutation.isPending}
                      className="w-full py-1.5 bg-blue-600 text-white rounded font-bold"
                    >
                      {submitScoreMutation.isPending ? 'Menyimpan...' : 'Simpan Nilai'}
                    </button>
                  </form>
                </div>

                {/* Final Decision Form (Aprove/Reject) */}
                <div className="border-t border-slate-200 pt-5 space-y-3">
                  <span className="font-black text-slate-800 text-[11px] uppercase tracking-wider block">Keputusan Akhir Berkas Administrasi</span>
                  <div className="flex gap-3">
                    <button
                      onClick={() => submitVerificationMutation.mutate({
                        application_id: viewingAppId,
                        status: 'APPROVED',
                        notes: 'Berkas pendaftaran dinyatakan LENGKAP dan SAH.'
                      })}
                      className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-center"
                    >
                      Verifikasi Sukses (Setujui Berkas)
                    </button>
                    <button
                      onClick={() => submitVerificationMutation.mutate({
                        application_id: viewingAppId,
                        status: 'REJECTED',
                        notes: 'Berkas tidak sah / tidak lengkap.'
                      })}
                      className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-center"
                    >
                      Tolak Berkas (Rejeksi)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
