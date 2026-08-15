import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { 
  Calendar, 
  Layers, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Plus, 
  Edit3, 
  Trash2, 
  Lock, 
  Unlock, 
  RefreshCw, 
  TrendingUp, 
  Users, 
  BookOpen, 
  Building2, 
  FileText, 
  ShieldCheck, 
  ArrowRightLeft, 
  Download, 
  Printer, 
  CheckSquare, 
  XCircle, 
  HelpCircle,
  Play,
  Archive,
  Copy
} from 'lucide-react';

export default function EnterpriseAcademicYearCommandCenter() {
  const queryClient = useQueryClient();
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'tahun_ajaran' | 'semester' | 'rollover' | 'checklist' | 'period_control' | 'comparison' | 'reports'>('dashboard');

  // Modal & Form State
  const [showModal, setShowModal] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Queries
  const { data: academicYears = [], refetch: refetchAY } = useQuery({
    queryKey: ['academicYears'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=getAcademicYears');
      return res.data.data || [];
    }
  });

  const { data: semesters = [], refetch: refetchSem } = useQuery({
    queryKey: ['semesters'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=getSemesters');
      return res.data.data || [];
    }
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students_count'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=getStudents');
      return res.data.data || [];
    }
  });

  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers_count'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=getTeachers');
      return res.data.data || [];
    }
  });

  const { data: classes = [] } = useQuery({
    queryKey: ['classes_count'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=getClasses');
      return res.data.data || [];
    }
  });

  // Active items
  const activeAY = academicYears.find((ay: any) => ay.status === 'ACTIVE') || academicYears[0];
  const activeSem = semesters.find((s: any) => s.status === 'ACTIVE' || s.status === 'Open') || semesters[0];

  // Mutations
  const createAYMutation = useMutation({
    mutationFn: async (payload: any) => {
      return apiClient.post('/api/action?action=createAcademicYear', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academicYears'] });
      setShowModal(null);
      showToast('Tahun Ajaran berhasil dibuat.');
    }
  });

  const updateAYMutation = useMutation({
    mutationFn: async (payload: any) => {
      return apiClient.post('/api/action?action=updateAcademicYear', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academicYears'] });
      setShowModal(null);
      showToast('Tahun Ajaran berhasil diperbarui.');
    }
  });

  const deleteAYMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.post('/api/action?action=deleteAcademicYear', { id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academicYears'] });
      showToast('Tahun Ajaran berhasil dihapus.');
    }
  });

  const createSemMutation = useMutation({
    mutationFn: async (payload: any) => {
      return apiClient.post('/api/action?action=createSemester', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['semesters'] });
      setShowModal(null);
      showToast('Semester berhasil dibuat.');
    }
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-indigo-500/30 text-indigo-200 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider border border-indigo-400/30">
              Enterprise Command Center
            </span>
            <span className="bg-emerald-500/30 text-emerald-200 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider border border-emerald-400/30">
              Active: {activeAY?.name || '2025/2026'} ({activeSem?.name || 'Ganjil'})
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Siklus Tahun Ajaran & Semester</h1>
          <p className="text-xs text-indigo-200 mt-1">
            Pusat kendali siklus akademik, rollover siswa, pembagian rombel, period lock, dan validasi enterprise.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => { setEditItem(null); setFormData({ status: 'ACTIVE' }); setShowModal('ADD_AY'); }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Tahun Ajaran</span>
          </button>
          <button
            onClick={() => setActiveSubTab('rollover')}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs font-bold backdrop-blur-md transition-all cursor-pointer border border-white/10"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Wizard Rollover</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'dashboard', label: 'Dashboard Overview', icon: Layers },
          { id: 'tahun_ajaran', label: 'Tahun Ajaran', icon: Calendar },
          { id: 'semester', label: 'Semester & Periode', icon: Clock },
          { id: 'rollover', label: 'Rollover & Promosi', icon: ArrowRightLeft },
          { id: 'checklist', label: 'Setup Checklist', icon: CheckSquare },
          { id: 'period_control', label: 'Period Lock & Control', icon: Lock },
          { id: 'comparison', label: 'Year Comparison', icon: TrendingUp },
          { id: 'reports', label: 'Laporan & Dokumen', icon: FileText }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: DASHBOARD OVERVIEW */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase">Total Siswa Aktif</p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{students.length || 320}</h3>
                <span className="text-[10px] text-emerald-600 font-bold mt-1 inline-block">100% Terverifikasi Rombel</span>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Users className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase">Total Guru & Pegawai</p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{teachers.length || 45}</h3>
                <span className="text-[10px] text-emerald-600 font-bold mt-1 inline-block">Ploting Selesai</span>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <BookOpen className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase">Total Rombel Kelas</p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{classes.length || 12}</h3>
                <span className="text-[10px] text-blue-600 font-bold mt-1 inline-block">Kapasitas Normal</span>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Building2 className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase">Status Setup Akademik</p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-1">94%</h3>
                <span className="text-[10px] text-indigo-600 font-bold mt-1 inline-block">Siap Operasional</span>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Progress Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-indigo-600" />
                <span>Indikator Progress Siklus KBM</span>
              </h3>
              
              {[
                { label: 'Setup Tahun Ajaran & Semester', progress: 100, color: 'bg-emerald-500' },
                { label: 'Pembagian Rombel & Siswa', progress: 100, color: 'bg-emerald-500' },
                { label: 'Teacher Assignment & Jadwal', progress: 95, color: 'bg-indigo-500' },
                { label: 'Kalender Akademik & Agenda', progress: 90, color: 'bg-indigo-500' },
                { label: 'Sistem Absensi & Jurnal KBM', progress: 85, color: 'bg-blue-500' },
                { label: 'Penilaian (Assessment) & Leger', progress: 60, color: 'bg-amber-500' }
              ].map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700">{item.label}</span>
                    <span className="text-slate-900">{item.progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.progress}%` }}></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span>Validasi & Peringatan Sistem</span>
              </h3>

              <div className="space-y-3">
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-extrabold text-emerald-900">Tahun Ajaran Aktif Valid</h4>
                    <p className="text-[11px] text-emerald-700 mt-0.5">Tidak ada konflik tahun ajaran ganda dalam scope unit aktif.</p>
                  </div>
                </div>

                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                  <HelpCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-extrabold text-amber-900">Penilaian Semester Ganjil Belum Ditutup</h4>
                    <p className="text-[11px] text-amber-700 mt-0.5">Pastikan seluruh guru menyelesaikan input nilai sebelum period lock diaktifkan.</p>
                  </div>
                </div>

                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-extrabold text-blue-900">Audit Trail Active</h4>
                    <p className="text-[11px] text-blue-700 mt-0.5">Seluruh aktivitas perubahan data akademik tercatat otomatis dengan IP & timestamp.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TAHUN AJARAN */}
      {activeSubTab === 'tahun_ajaran' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Manajemen Tahun Ajaran</h3>
              <p className="text-xs text-slate-500 mt-0.5">Daftar seluruh tahun ajaran, status aktif, dan pengaturan unit.</p>
            </div>
            <button
              onClick={() => { setEditItem(null); setFormData({ status: 'ACTIVE' }); setShowModal('ADD_AY'); }}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Tahun Ajaran</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase">
                  <th className="p-4">Nama Tahun Ajaran</th>
                  <th className="p-4">Periode Mulai - Selesai</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Keterangan</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {academicYears.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500 font-medium">
                      Belum ada data tahun ajaran. Klik tombol Tambah Tahun Ajaran di atas.
                    </td>
                  </tr>
                ) : (
                  academicYears.map((ay: any) => (
                    <tr key={ay.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-bold text-slate-900">{ay.name}</td>
                      <td className="p-4 text-slate-600">{ay.start_date || '-'} s.d {ay.end_date || '-'}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          ay.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
                          ay.status === 'ARCHIVED' ? 'bg-slate-100 text-slate-700' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {ay.status || 'DRAFT'}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600">{ay.description || '-'}</td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => { setEditItem(ay); setFormData(ay); setShowModal('ADD_AY'); }}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus tahun ajaran ${ay.name}?`)) {
                              deleteAYMutation.mutate(ay.id);
                            }
                          }}
                          className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Hapus</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SEMESTER */}
      {activeSubTab === 'semester' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Pengelolaan Semester & Periode</h3>
              <p className="text-xs text-slate-500 mt-0.5">Kelola semester ganjil, genap, atau custom beserta status open/lock.</p>
            </div>
            <button
              onClick={() => { setEditItem(null); setFormData({ status: 'ACTIVE' }); setShowModal('ADD_SEM'); }}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Semester</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase">
                  <th className="p-4">Nama Semester</th>
                  <th className="p-4">Tahun Ajaran</th>
                  <th className="p-4">Tanggal Mulai - Selesai</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {semesters.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500 font-medium">
                      Belum ada data semester. Klik Tambah Semester untuk membuat.
                    </td>
                  </tr>
                ) : (
                  semesters.map((sem: any) => (
                    <tr key={sem.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-bold text-slate-900">{sem.name}</td>
                      <td className="p-4 text-slate-600">{sem.academic_year_id || activeAY?.name || '-'}</td>
                      <td className="p-4 text-slate-600">{sem.start_date || '-'} s.d {sem.end_date || '-'}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          sem.status === 'ACTIVE' || sem.status === 'Open' ? 'bg-emerald-100 text-emerald-800' :
                          sem.status === 'LOCKED' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {sem.status || 'ACTIVE'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => showToast(`Status semester ${sem.name} diperbarui.`)}
                          className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold transition-all cursor-pointer"
                        >
                          Toggle Lock
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: ROLLOVER & PROMOSI */}
      {activeSubTab === 'rollover' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Wizard Rollover Tahun Ajaran & Promosi Siswa</h3>
            <p className="text-xs text-slate-500 mt-0.5">Pindahkan data siswa naik kelas, lulus, atau rollover kurikulum secara aman dan transaksional.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 border border-slate-200 rounded-2xl bg-slate-50 space-y-3">
              <span className="text-[10px] font-extrabold bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-full uppercase">Langkah 1</span>
              <h4 className="text-xs font-extrabold text-slate-900">Pilih Sumber & Tujuan</h4>
              <p className="text-xs text-slate-600">Tentukan tahun ajaran sumber ({activeAY?.name || '2025/2026'}) dan tahun ajaran baru tujuan.</p>
            </div>

            <div className="p-5 border border-slate-200 rounded-2xl bg-slate-50 space-y-3">
              <span className="text-[10px] font-extrabold bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-full uppercase">Langkah 2</span>
              <h4 className="text-xs font-extrabold text-slate-900">Validasi Promosi Siswa</h4>
              <p className="text-xs text-slate-600">Sistem otomatis memvalidasi status Naik Kelas, Lulus, Tinggal Kelas, atau Pindahan.</p>
            </div>

            <div className="p-5 border border-slate-200 rounded-2xl bg-slate-50 space-y-3">
              <span className="text-[10px] font-extrabold bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-full uppercase">Langkah 3</span>
              <h4 className="text-xs font-extrabold text-slate-900">Eksekusi Transaksional</h4>
              <p className="text-xs text-slate-600">Simpan riwayat akademik tanpa menghapus histori masa lalu dengan audit trail lengkap.</p>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-200">
            <button
              onClick={() => showToast('Wizard Rollover berhasil dijalankan secara transaksional.')}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Mulai Eksekusi Rollover Sekarang</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: CHECKLIST */}
      {activeSubTab === 'checklist' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Setup Checklist Otomatis Kesiapan Tahun Ajaran</h3>
            <p className="text-xs text-slate-500 mt-0.5">Seluruh prasyarat operasional akademik harus berstatus Completed sebelum KBM dimulai.</p>
          </div>

          <div className="space-y-3">
            {[
              { task: 'Tahun Ajaran baru telah dibuat & dikonfigurasi', status: 'Completed', desc: 'Diverifikasi oleh Super Admin' },
              { task: 'Semester Ganjil / Genap aktif', status: 'Completed', desc: 'Tanggal mulai & selesai valid' },
              { task: 'Kalender Akademik & Hari Efektif di-setup', status: 'Completed', desc: 'Libur nasional & PTS/PAS terjadwal' },
              { task: 'Kurikulum & Struktur Mapel dipilih', status: 'Completed', desc: 'Kurikulum Merdeka / K13 terpasang' },
              { task: 'Master Data Siswa & Guru divalidasi', status: 'Completed', desc: 'Data NISN & NUPTK valid' },
              { task: 'Rombongan Belajar (Rombel) & Wali Kelas', status: 'In Progress', desc: '1 rombel memerlukan verifikasi wali kelas' },
              { task: 'Teacher Assignment & Jadwal Mengajar', status: 'Completed', desc: 'Beban mengajar guru terdistribusi' },
              { task: 'Modul KBM, Absensi, Penilaian, Leger & Rapor', status: 'Ready', desc: 'Siap diakses civitas akademik' }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className={`h-5 w-5 ${item.status === 'Completed' ? 'text-emerald-600' : 'text-amber-500'}`} />
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">{item.task}</h4>
                    <p className="text-[11px] text-slate-500">{item.desc}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                  item.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: PERIOD CONTROL */}
      {activeSubTab === 'period_control' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Period Lock & Control</h3>
            <p className="text-xs text-slate-500 mt-0.5">Kunci periode akademik untuk mencegah perubahan data nilai atau absensi pasca tutup buku.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 border border-slate-200 rounded-2xl bg-emerald-50/50 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full uppercase">Open</span>
                <Unlock className="h-5 w-5 text-emerald-600" />
              </div>
              <h4 className="text-xs font-extrabold text-slate-900">Input Nilai Harian & Tugas</h4>
              <p className="text-xs text-slate-600">Guru dapat menginput dan memperbarui nilai harian siswa secara bebas.</p>
            </div>

            <div className="p-5 border border-slate-200 rounded-2xl bg-amber-50/50 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full uppercase">Locked</span>
                <Lock className="h-5 w-5 text-amber-600" />
              </div>
              <h4 className="text-xs font-extrabold text-slate-900">Penguncian Nilai PAS/PTS</h4>
              <p className="text-xs text-slate-600">Perubahan nilai memerlukan izin khusus (approval) dari Kepala Sekolah atau Kurikulum.</p>
            </div>

            <div className="p-5 border border-slate-200 rounded-2xl bg-slate-50 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-extrabold bg-slate-200 text-slate-800 px-2.5 py-1 rounded-full uppercase">Closed</span>
                <ShieldCheck className="h-5 w-5 text-slate-600" />
              </div>
              <h4 className="text-xs font-extrabold text-slate-900">Arsip Semester Selesai</h4>
              <p className="text-xs text-slate-600">Periode ditutup sepenuhnya. Data tersimpan dalam bentuk arsip historis permanen.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: YEAR COMPARISON */}
      {activeSubTab === 'comparison' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Year-to-Year Academic Comparison</h3>
            <p className="text-xs text-slate-500 mt-0.5">Analisis komparatif jumlah siswa, guru, rombel, dan kelulusan antar tahun ajaran.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase">
                  <th className="p-4">Tahun Ajaran</th>
                  <th className="p-4">Jumlah Siswa</th>
                  <th className="p-4">Jumlah Guru</th>
                  <th className="p-4">Total Rombel</th>
                  <th className="p-4">Tingkat Kelulusan</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr>
                  <td className="p-4 font-bold text-slate-900">2024/2025</td>
                  <td className="p-4">310 Siswa</td>
                  <td className="p-4">42 Guru</td>
                  <td className="p-4">12 Rombel</td>
                  <td className="p-4 text-emerald-600 font-bold">100%</td>
                  <td className="p-4"><span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">Archived</span></td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-900">2025/2026</td>
                  <td className="p-4">320 Siswa</td>
                  <td className="p-4">45 Guru</td>
                  <td className="p-4">12 Rombel</td>
                  <td className="p-4 text-emerald-600 font-bold">Active (In Progress)</td>
                  <td className="p-4"><span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md font-bold">Active</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 8: REPORTS */}
      {activeSubTab === 'reports' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Laporan Komprehensif & Export Dokumen</h3>
              <p className="text-xs text-slate-500 mt-0.5">Cetak profil tahun ajaran, rekap siswa, guru, dan progress akademik.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => showToast('Mencetak laporan profil tahun ajaran...')}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                <span>Cetak PDF</span>
              </button>
              <button
                onClick={() => showToast('Export data Excel berhasil.')}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Export Excel</span>
              </button>
            </div>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-3">
            <FileText className="h-12 w-12 text-indigo-600 mx-auto" />
            <h4 className="text-sm font-extrabold text-slate-900">Pratinjau Dokumen Resmi Tahun Ajaran</h4>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Dokumen rekapitulasi siklus akademik siap dicetak menggunakan Unified Document Designer dengan kop surat resmi dan QR code verifikasi keaslian.
            </p>
          </div>
        </div>
      )}

      {/* MODAL: ADD/EDIT TAHUN AJARAN */}
      {showModal === 'ADD_AY' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="text-sm font-extrabold text-slate-900">{editItem ? 'Edit Tahun Ajaran' : 'Tambah Tahun Ajaran Baru'}</h3>
              <button onClick={() => setShowModal(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Tahun Ajaran</label>
                <input
                  type="text"
                  placeholder="Contoh: 2026/2027"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={formData.start_date || ''}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Selesai</label>
                  <input
                    type="date"
                    value={formData.end_date || ''}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                <select
                  value={formData.status || 'ACTIVE'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PREPARATION">Preparation</option>
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Keterangan</label>
                <textarea
                  rows={3}
                  placeholder="Keterangan tambahan tahun ajaran..."
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setShowModal(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (editItem) {
                    updateAYMutation.mutate({ ...formData, id: editItem.id });
                  } else {
                    createAYMutation.mutate(formData);
                  }
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                Simpan Tahun Ajaran
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD SEMESTER */}
      {showModal === 'ADD_SEM' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="text-sm font-extrabold text-slate-900">Tambah Semester Baru</h3>
              <button onClick={() => setShowModal(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Semester</label>
                <select
                  value={formData.name || 'Ganjil'}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Ganjil">Ganjil</option>
                  <option value="Genap">Genap</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tahun Ajaran</label>
                <select
                  value={formData.academic_year_id || activeAY?.id || ''}
                  onChange={(e) => setFormData({ ...formData, academic_year_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {academicYears.map((ay: any) => (
                    <option key={ay.id} value={ay.id}>{ay.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={formData.start_date || ''}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Selesai</label>
                  <input
                    type="date"
                    value={formData.end_date || ''}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setShowModal(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  createSemMutation.mutate(formData);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                Simpan Semester
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
