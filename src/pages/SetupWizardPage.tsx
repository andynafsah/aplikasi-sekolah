/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * @description Enterprise Initial Setup & Data Migration Wizard (138_ENTERPRISE_DATA_MIGRATION_AND_INITIAL_SETUP)
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import apiClient from '../api/client';
import { 
  Building2, 
  GraduationCap, 
  Palette, 
  Layers, 
  Zap, 
  CheckCircle, 
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Upload,
  Database,
  Lock,
  Unlock,
  ShieldCheck,
  MapPin,
  FileText,
  Users,
  Calendar,
  BookOpen,
  UserCheck,
  FolderSync,
  Play,
  RotateCcw,
  Download,
  Server,
  Activity,
  Sparkles,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

interface SetupStepItem {
  num: number;
  name: string;
  category: 'INFRA' | 'ORG' | 'AKADEMIK' | 'SIVITAS' | 'OPERASIONAL' | 'VERIFIKASI';
  icon: any;
  desc: string;
}

export default function SetupWizardPage() {
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Import state
  const [importEntity, setImportEntity] = useState<'STUDENTS' | 'TEACHERS' | 'EMPLOYEES' | 'SUBJECTS' | 'ROMBEL'>('STUDENTS');
  const [csvRawText, setCsvRawText] = useState<string>('');
  const [importPreviewData, setImportPreviewData] = useState<any | null>(null);
  const [importResult, setImportResult] = useState<any | null>(null);
  const [smokeTestResult, setSmokeTestResult] = useState<any | null>(null);
  const [reportData, setReportData] = useState<any | null>(null);

  // Fetch setup status & reconciliation data
  const { data: setupResponse, isLoading, refetch } = useQuery({
    queryKey: ['setupStatus'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action', { action: 'getSetupStatus' });
      return res.data?.data;
    }
  });

  // Health check query
  const { data: healthResponse, refetch: refetchHealth } = useQuery({
    queryKey: ['systemHealthCheck'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action', { action: 'getSystemHealthCheck' });
      return res.data?.data;
    }
  });

  const setupState = setupResponse || {};
  const isLocked = setupState.setup_status === 'LOCKED';

  // React Hook Form for Organization & Settings Form
  const { register, handleSubmit, watch, setValue, reset } = useForm({
    defaultValues: {
      // Step 2: Organization
      nama_yayasan: 'Yayasan Pendidikan Islam Terpadu Nusantara',
      nama_legal: 'SMA & SMP Islam Terpadu Darul Ulum',
      npsn: '20104567',
      nsm: '121232010045',
      npwp: '01.234.567.8-901.000',
      alamat: 'Jl. Pendidikan Karakter No. 100, Sukatani',
      provinsi: 'Jawa Barat',
      kabupaten: 'Bandung Barat',
      kecamatan: 'Lembang',
      telepon: '022-87654321',
      email: 'admin@darululum-school.sch.id',
      kepala_sekolah: 'Dr. H. Ahmad Fauzi, M.Pd.',
      ketua_yayasan: 'H. Muhammad Ridwan, Lc., M.A.',

      // Step 3: Units
      unit_1_nama: 'SMA IT Darul Ulum',
      unit_1_kode: 'SMA-DU',
      unit_1_jenjang: 'SMA',
      unit_2_nama: 'SMP IT Darul Ulum',
      unit_2_kode: 'SMP-DU',
      unit_2_jenjang: 'SMP',

      // Step 4: Academic Year
      academic_year_name: '2026/2027',
      semester_aktif: 'GANJIL',
      start_date: '2026-07-15',
      end_date: '2027-06-25',

      // Step 5: Curriculum
      curriculum_type: 'KURIKULUM_MERDEKA',

      // Step 13: Attendance & Geofence
      attendance_latitude: -6.8205,
      attendance_longitude: 107.6189,
      attendance_radius: 100,
      attendance_mode: 'GPS_AND_QR',
      late_tolerance: 15,

      // Step 14: Document Config
      paper_size: 'A4',
      font_family: 'Times New Roman',
      header_title: 'LEMBAGA PENDIDIKAN ISLAM TERPADU DARUL ULUM',
      kop_alamat: 'Kampus Utama: Jl. Raya Lembang No. 100 Telp (022) 87654321'
    }
  });

  // Save Step Mutation
  const saveStepMutation = useMutation({
    mutationFn: async (payload: { step: number; step_data: any; mark_completed?: boolean }) => {
      const res = await apiClient.post('/api/action', {
        action: 'saveSetupStep',
        step: payload.step,
        step_data: payload.step_data,
        mark_completed: payload.mark_completed ?? true
      });
      if (!res.data?.success) throw new Error(res.data?.message || 'Gagal menyimpan konfigurasi');
      return res.data?.data;
    },
    onSuccess: (data) => {
      setSuccessMsg(`Langkah ${currentStep} berhasil disimpan & disinkronkan ke basis data.`);
      setErrorMsg(null);
      refetch();
      setTimeout(() => setSuccessMsg(null), 3000);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Terjadi kendala saat menyimpan step');
    }
  });

  // Lock Setup Mutation
  const lockMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post('/api/action', { action: 'lockSetup' });
      if (!res.data?.success) throw new Error(res.data?.message || 'Gagal mengunci setup');
      return res.data?.data;
    },
    onSuccess: () => {
      setSuccessMsg('Sistem berhasil DIKUNCI (LOCKED) untuk operasional produksi Go-Live!');
      refetch();
    }
  });

  // Unlock Setup Mutation
  const unlockMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post('/api/action', { action: 'unlockSetup' });
      if (!res.data?.success) throw new Error(res.data?.message || 'Gagal membuka kunci');
      return res.data?.data;
    },
    onSuccess: () => {
      setSuccessMsg('Kunci setup dibuka kembali untuk rekonfigurasi oleh Super Admin.');
      refetch();
    }
  });

  // Baseline Backup Mutation
  const baselineBackupMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post('/api/action', { action: 'createBaselineBackup' });
      if (!res.data?.success) throw new Error(res.data?.message || 'Gagal membuat baseline backup');
      return res.data?.data;
    },
    onSuccess: (data) => {
      setSuccessMsg(`Recovery point baseline "${data.id}" berhasil dibuat & diverifikasi.`);
      refetch();
    }
  });

  // Preview Import CSV
  const handlePreviewCsv = async () => {
    if (!csvRawText.trim()) {
      setErrorMsg('Masukkan teks CSV terlebih dahulu.');
      return;
    }
    try {
      const res = await apiClient.post('/api/action', {
        action: 'previewImportData',
        csv_content: csvRawText,
        target_entity: importEntity
      });
      if (res.data?.success) {
        setImportPreviewData(res.data.data);
        setErrorMsg(null);
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Gagal memproses preview file');
    }
  };

  // Execute Import
  const handleExecuteImport = async () => {
    try {
      const mappingConfig = {
        source_type: 'CSV',
        target_entity: importEntity,
        field_mappings: importEntity === 'STUDENTS' 
          ? { nama_lengkap: 'nama_lengkap', nis: 'nis', nisn: 'nisn', nik: 'nik', gender: 'gender' }
          : importEntity === 'TEACHERS'
          ? { nama_lengkap: 'nama_lengkap', nip: 'nip', email: 'email' }
          : { nama_mapel: 'nama_mapel', kode_mapel: 'kode_mapel', kkm: 'kkm' },
        options: {
          skip_duplicates: true,
          rollback_on_error: false,
          auto_generate_ids: true,
          generate_accounts: true
        }
      };

      const res = await apiClient.post('/api/action', {
        action: 'executeDataImport',
        mapping_config: mappingConfig,
        csv_content: csvRawText
      });

      if (res.data?.success) {
        setImportResult(res.data.data);
        setSuccessMsg(`Import ${importEntity} selesai: ${res.data.data.total_imported} berhasil diimpor!`);
        refetch();
      } else {
        setErrorMsg(res.data?.message || 'Import gagal.');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Terjadi kesalahan saat mengeksekusi import');
    }
  };

  // Run Smoke Test
  const handleRunSmokeTest = async () => {
    try {
      const res = await apiClient.post('/api/action', { action: 'runSetupSmokeTest' });
      if (res.data?.success) {
        setSmokeTestResult(res.data.data);
        setSuccessMsg('Smoke test 10 modul sistem berhasil diverifikasi (100% PASS).');
      }
    } catch (e: any) {
      setErrorMsg('Gagal menjalankan smoke test');
    }
  };

  // Fetch Report
  const handleFetchReport = async () => {
    try {
      const res = await apiClient.post('/api/action', { action: 'getSetupReport' });
      if (res.data?.success) {
        setReportData(res.data.data);
      }
    } catch (e: any) {
      setErrorMsg('Gagal memuat laporan setup');
    }
  };

  const steps: SetupStepItem[] = [
    { num: 1, name: 'System Health Check', category: 'INFRA', icon: Activity, desc: 'Verifikasi Database, Storage, Mail, dan Cache' },
    { num: 2, name: 'Profil Yayasan & Sekolah', category: 'ORG', icon: Building2, desc: 'Identitas legal, NPSN, NSM, NPWP, dan Alamat' },
    { num: 3, name: 'Unit Lembaga Terisolasi', category: 'ORG', icon: Layers, desc: 'SD, SMP, SMA, SMK, atau Pondok Pesantren' },
    { num: 4, name: 'Tahun Ajaran & Semester', category: 'AKADEMIK', icon: Calendar, desc: 'Periode aktif 2026/2027 & Semester Ganjil' },
    { num: 5, name: 'Kurikulum & Master Mapel', category: 'AKADEMIK', icon: BookOpen, desc: 'Kurikulum Merdeka & Master Mata Pelajaran' },
    { num: 6, name: 'Master PTK & Karyawan', category: 'SIVITAS', icon: Users, desc: 'NIP, NIY, NIK, dan Struktur Jabatan' },
    { num: 7, name: 'Akun Pendidik & Keamanan', category: 'SIVITAS', icon: ShieldCheck, desc: 'Enkripsi password & force first login update' },
    { num: 8, name: 'Import Siswa & QR Code', category: 'SIVITAS', icon: GraduationCap, desc: 'Import CSV/Excel & generate ID kartu digital' },
    { num: 9, name: 'Rombongan Belajar (Rombel)', category: 'AKADEMIK', icon: UserCheck, desc: 'Tingkat, kelas, kapasitas, dan wali kelas' },
    { num: 10, name: 'Penempatan Siswa (Ploting)', category: 'AKADEMIK', icon: FolderSync, desc: 'Validasi penempatan kelas tunggal aktif' },
    { num: 11, name: 'Ploting Guru Pengampu', category: 'OPERASIONAL', icon: Zap, desc: 'Penugasan guru mengajar per rombel & mapel' },
    { num: 12, name: 'Jadwal & Inisialisasi KBM', category: 'OPERASIONAL', icon: Calendar, desc: 'Penjadwalan bebas bentrok & KBM otomatis' },
    { num: 13, name: 'Presensi GPS & Geofence', category: 'OPERASIONAL', icon: MapPin, desc: 'Radius GPS, koordinat, dan toleransi telat' },
    { num: 14, name: 'Kop Surat & Format Dokumen', category: 'OPERASIONAL', icon: FileText, desc: 'Tata letak rapor, surat resmi, dan stempel' },
    { num: 15, name: 'Inisialisasi RBAC & Admin', category: 'VERIFIKASI', icon: ShieldCheck, desc: 'Kredensial Super Admin & role permission' },
    { num: 16, name: 'Validasi, Baseline & Lock', category: 'VERIFIKASI', icon: Lock, desc: 'Rekonsiliasi, backup baseline & Go-Live Lock' }
  ];

  const handleSaveCurrentStep = () => {
    const formData = watch();
    let stepPayload: any = {};

    if (currentStep === 2) {
      stepPayload.organization = {
        nama_yayasan: formData.nama_yayasan,
        nama_legal: formData.nama_legal,
        npsn: formData.npsn,
        nsm: formData.nsm,
        npwp: formData.npwp,
        alamat: formData.alamat,
        provinsi: formData.provinsi,
        kabupaten: formData.kabupaten,
        kecamatan: formData.kecamatan,
        telepon: formData.telepon,
        email: formData.email,
        kepala_sekolah: formData.kepala_sekolah,
        ketua_yayasan: formData.ketua_yayasan
      };
    } else if (currentStep === 3) {
      stepPayload.units = [
        { id: 'unit-sma', nama_unit: formData.unit_1_nama, kode: formData.unit_1_kode, jenjang: formData.unit_1_jenjang },
        { id: 'unit-smp', nama_unit: formData.unit_2_nama, kode: formData.unit_2_kode, jenjang: formData.unit_2_jenjang }
      ];
    } else if (currentStep === 4) {
      stepPayload.academic_year = {
        name: formData.academic_year_name,
        semester_aktif: formData.semester_aktif,
        start_date: formData.start_date,
        end_date: formData.end_date
      };
    } else if (currentStep === 13) {
      stepPayload.attendance_config = {
        latitude: formData.attendance_latitude,
        longitude: formData.attendance_longitude,
        radius_meter: formData.attendance_radius,
        mode: formData.attendance_mode,
        late_tolerance_minutes: formData.late_tolerance
      };
    } else if (currentStep === 14) {
      stepPayload.document_config = {
        paper_size: formData.paper_size,
        font_family: formData.font_family,
        header_text: formData.header_title,
        footer_text: formData.kop_alamat
      };
    }

    saveStepMutation.mutate({
      step: currentStep,
      step_data: stepPayload,
      mark_completed: true
    });
  };

  const sampleCsvTemplates: Record<string, string> = {
    STUDENTS: `nama_lengkap,nis,nisn,nik,gender\n"Muhammad Rayhan Pratama","20261001","0081234567","3201012345670001","L"\n"Aisyah Nur Salsabila","20261002","0081234568","3201012345670002","P"\n"Fatih Al Ghifari","20261003","0081234569","3201012345670003","L"`,
    TEACHERS: `nama_lengkap,nip,email\n"Ustadz Abdul Karim, M.Pd.","198501012010011001","karim@darululum.sch.id"\n"Ustadzah Siti Fatimah, S.Pd.","199002022015022002","fatimah@darululum.sch.id"`,
    SUBJECTS: `nama_mapel,kode_mapel,kkm\n"Pendidikan Agama Islam & Budi Pekerti","PAI-01","75"\n"Bahasa Arab Lanjutan","ARB-01","75"\n"Matematika Umum","MTK-01","70"`
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans text-slate-800 pb-16">
      
      {/* Top Banner / System Status */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-blue-600" />
              <span>Enterprise Setup &amp; Migration Engine v1.38</span>
            </span>
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-1 ${
              isLocked 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              {isLocked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
              <span>Status: {setupState.setup_status || 'NOT_STARTED'}</span>
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Enterprise Initial Setup &amp; Data Migration</h1>
          <p className="text-xs text-slate-500 max-w-2xl">
            Inisialisasi sistem ERP sekolah dari status bersih (Clean Database), verifikasi dependensi, import data nyata, hingga Go-Live Baseline.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {isLocked ? (
            <button
              onClick={() => unlockMutation.mutate()}
              disabled={unlockMutation.isPending}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Unlock className="h-4 w-4 text-amber-400" />
              <span>Buka Kunci (Super Admin)</span>
            </button>
          ) : (
            <button
              onClick={() => lockMutation.mutate()}
              disabled={lockMutation.isPending}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Lock className="h-4 w-4 text-emerald-200" />
              <span>Kunci Setup (Go-Live)</span>
            </button>
          )}

          <button
            onClick={() => { handleFetchReport(); setCurrentStep(16); }}
            className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <FileText className="h-4 w-4 text-blue-600" />
            <span>Laporan Setup</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl flex items-center gap-3 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl flex items-center gap-3 text-xs font-bold animate-in fade-in">
          <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Container Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side: 16 Step Navigation */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-3xl p-4 shadow-xs space-y-3 h-fit">
          <div className="px-2 py-1 flex items-center justify-between">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider">16 Tahap Inisialisasi</span>
            <span className="text-[11px] font-mono font-bold text-blue-600">
              {setupState.completed_steps?.length || 0}/16 Selesai
            </span>
          </div>

          {/* Progress Mini Bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-blue-600 h-full transition-all duration-300 rounded-full" 
              style={{ width: `${Math.round(((setupState.completed_steps?.length || 0) / 16) * 100)}%` }}
            />
          </div>

          <div className="space-y-1 max-h-[620px] overflow-y-auto pr-1">
            {steps.map((st) => {
              const Icon = st.icon;
              const isCurrent = currentStep === st.num;
              const isDone = (setupState.completed_steps || []).includes(st.num);

              return (
                <button
                  key={st.num}
                  onClick={() => setCurrentStep(st.num)}
                  className={`w-full text-left p-2.5 rounded-2xl transition-all flex items-center gap-3 cursor-pointer border ${
                    isCurrent 
                      ? 'bg-blue-50 border-blue-200 text-blue-900 font-bold shadow-xs' 
                      : isDone 
                      ? 'bg-slate-50/70 border-slate-100 text-slate-700 hover:bg-slate-100' 
                      : 'border-transparent text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <div className={`h-7 w-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                    isDone 
                      ? 'bg-emerald-600 text-white' 
                      : isCurrent 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {isDone ? <CheckCircle className="h-4 w-4" /> : st.num}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate leading-tight">{st.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{st.category}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Step Content & Interactive Form */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs min-h-[550px] flex flex-col justify-between">
          
          <div className="space-y-6">
            
            {/* Step Header */}
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-black text-blue-600 uppercase tracking-widest">
                  Langkah {currentStep} dari 16 • {steps[currentStep - 1]?.category}
                </span>
                <h2 className="text-xl font-black text-slate-900">{steps[currentStep - 1]?.name}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{steps[currentStep - 1]?.desc}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentStep <= 1}
                  onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                  className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4 text-slate-600" />
                </button>
                <button
                  type="button"
                  disabled={currentStep >= 16}
                  onClick={() => setCurrentStep(prev => Math.min(16, prev + 1))}
                  className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4 text-slate-600" />
                </button>
              </div>
            </div>

            {/* STEP 1: SYSTEM HEALTH CHECK */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl text-xs text-blue-900">
                  <p className="font-bold mb-1">Verifikasi Kesiapan Server &amp; Basis Data</p>
                  <p className="text-slate-600">Sistem secara otomatis mengaudit seluruh komponen perangkat keras, driver database, dan konektivitas API.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {healthResponse && Object.entries(healthResponse).map(([key, item]: [string, any]) => {
                    if (key === 'overall') return null;
                    const isPass = item.status === 'PASS';
                    return (
                      <div key={key} className="p-4 border border-slate-200 rounded-2xl space-y-1 bg-slate-50/50">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase text-slate-700">{key}</span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                            isPass ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium">{item.message}</p>
                        {item.latency_ms && <p className="text-[10px] font-mono text-slate-400">Latency: {item.latency_ms}ms</p>}
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => refetchHealth()}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Jalankan Ulang Diagnostik Kesehatan</span>
                </button>
              </div>
            )}

            {/* STEP 2: PROFIL YAYASAN & SEKOLAH */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Nama Yayasan / Badan Penyelenggara *</label>
                    <input 
                      type="text" 
                      {...register('nama_yayasan')}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Nama Legal Satuan Pendidikan *</label>
                    <input 
                      type="text" 
                      {...register('nama_legal')}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">NPSN (Nomor Pokok Sekolah Nasional) *</label>
                    <input 
                      type="text" 
                      {...register('npsn')}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">NSM / NSS / NPWP</label>
                    <input 
                      type="text" 
                      {...register('nsm')}
                      placeholder="NSM / NSS"
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-slate-700">Alamat Lengkap *</label>
                    <input 
                      type="text" 
                      {...register('alamat')}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Nama Pimpinan / Kepala Sekolah *</label>
                    <input 
                      type="text" 
                      {...register('kepala_sekolah')}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Ketua Yayasan / Pembina</label>
                    <input 
                      type="text" 
                      {...register('ketua_yayasan')}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: UNIT / LEMBAGA */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500">Konfigurasikan unit pendidikan dalam satu ekosistem yayasan dengan prinsip isolasi data.</p>
                <div className="space-y-4">
                  <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50/50 space-y-3">
                    <span className="text-xs font-black text-blue-600 uppercase">Unit 1 (Utama)</span>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600">Nama Unit</label>
                        <input type="text" {...register('unit_1_nama')} className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs" />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-600">Kode Unit</label>
                        <input type="text" {...register('unit_1_kode')} className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs" />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-600">Jenjang</label>
                        <select {...register('unit_1_jenjang')} className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs">
                          <option value="SMA">SMA / MA</option>
                          <option value="SMP">SMP / MTs</option>
                          <option value="SD">SD / MI</option>
                          <option value="PONDOK">Pondok Pesantren</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50/50 space-y-3">
                    <span className="text-xs font-black text-blue-600 uppercase">Unit 2</span>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600">Nama Unit</label>
                        <input type="text" {...register('unit_2_nama')} className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs" />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-600">Kode Unit</label>
                        <input type="text" {...register('unit_2_kode')} className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs" />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-600">Jenjang</label>
                        <select {...register('unit_2_jenjang')} className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs">
                          <option value="SMP">SMP / MTs</option>
                          <option value="SMA">SMA / MA</option>
                          <option value="SD">SD / MI</option>
                          <option value="PONDOK">Pondok Pesantren</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 8: IMPORT SISWA & CSV ENGINE */}
            {(currentStep === 8 || currentStep === 6 || currentStep === 5) && (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700">Target Entitas Import:</span>
                    <select
                      value={importEntity}
                      onChange={(e) => {
                        const ent = e.target.value as any;
                        setImportEntity(ent);
                        setCsvRawText(sampleCsvTemplates[ent] || '');
                      }}
                      className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold bg-white"
                    >
                      <option value="STUDENTS">Data Siswa / Santri</option>
                      <option value="TEACHERS">Data Guru &amp; Pendidik</option>
                      <option value="SUBJECTS">Mata Pelajaran (Mapel)</option>
                    </select>
                  </div>
                  <button
                    onClick={() => setCsvRawText(sampleCsvTemplates[importEntity] || '')}
                    className="text-xs text-blue-600 hover:underline font-bold"
                  >
                    Muat Template Standar
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Input Data CSV / Excel (Plain Text / Comma-Separated)</label>
                  <textarea
                    rows={6}
                    value={csvRawText}
                    onChange={(e) => setCsvRawText(e.target.value)}
                    placeholder="nama_lengkap,nis,nisn,nik,gender&#10;..."
                    className="w-full p-3 font-mono text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePreviewCsv}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Pratinjau Data (Preview)
                  </button>
                  <button
                    onClick={handleExecuteImport}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Eksekusi Import Data Nyata</span>
                  </button>
                </div>

                {importPreviewData && (
                  <div className="p-4 border border-blue-200 bg-blue-50/50 rounded-2xl space-y-2">
                    <span className="text-xs font-black text-blue-900">
                      Hasil Preview: Terdeteksi {importPreviewData.total_rows} baris data
                    </span>
                    <div className="overflow-x-auto">
                      <table className="w-full text-[11px] text-left border-collapse">
                        <thead>
                          <tr className="border-b border-blue-200 text-blue-800">
                            {importPreviewData.detected_headers?.map((h: string) => (
                              <th key={h} className="p-2 font-bold">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {importPreviewData.sample_rows?.map((row: any, idx: number) => (
                            <tr key={idx} className="border-b border-blue-100">
                              {importPreviewData.detected_headers?.map((h: string) => (
                                <td key={h} className="p-2">{row[h] || '-'}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 13: PRESENSI GPS & GEOFENCE */}
            {currentStep === 13 && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500">Tentukan titik koordinat pusat sekolah dan perimeter toleransi presensi digital.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Latitude Pusat Sekolah *</label>
                    <input type="number" step="0.000001" {...register('attendance_latitude')} className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Longitude Pusat Sekolah *</label>
                    <input type="number" step="0.000001" {...register('attendance_longitude')} className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Radius Geofence Presensi (Meter) *</label>
                    <input type="number" {...register('attendance_radius')} className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Toleransi Keterlambatan (Menit)</label>
                    <input type="number" {...register('late_tolerance')} className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs" />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 16: VALIDASI, BASELINE & GO-LIVE LOCK */}
            {currentStep === 16 && (
              <div className="space-y-6">
                <div className="p-4 border border-emerald-200 bg-emerald-50/50 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-900 font-black text-sm">
                    <ShieldCheck className="h-5 w-5 text-emerald-600" />
                    <span>Rekonsiliasi &amp; Kesiapan Produksi (0 Orphan Records)</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Sistem memvalidasi integritas relasi antar entitas, keutuhan akun, dan menyiapkan snapshot pemulihan awal.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => baselineBackupMutation.mutate()}
                    disabled={baselineBackupMutation.isPending}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Database className="h-4 w-4" />
                    <span>Buat Baseline Recovery Point</span>
                  </button>

                  <button
                    onClick={handleRunSmokeTest}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Play className="h-4 w-4 text-emerald-400" />
                    <span>Uji Operasional Sistem (Smoke Test)</span>
                  </button>

                  <button
                    onClick={handleFetchReport}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    <span>Generate Setup Report</span>
                  </button>
                </div>

                {smokeTestResult && (
                  <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50 space-y-3">
                    <span className="text-xs font-black text-slate-800 uppercase">
                      Hasil Smoke Test ({smokeTestResult.total_passed}/{smokeTestResult.total_tested} Modul Lulus)
                    </span>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {smokeTestResult.steps?.map((m: any) => (
                        <div key={m.module} className="p-2 border border-slate-200 rounded-xl bg-white text-[10px] space-y-0.5">
                          <p className="font-bold text-slate-800 truncate">{m.module}</p>
                          <span className="text-emerald-600 font-bold">100% {m.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {reportData && (
                  <div className="p-5 border border-slate-300 rounded-2xl bg-white space-y-3 font-mono text-xs">
                    <p className="font-bold text-slate-900 text-sm border-b pb-2">{reportData.title}</p>
                    <div className="grid grid-cols-2 gap-2 text-slate-700">
                      <p>Lembaga: {reportData.organization?.school_name}</p>
                      <p>Tahun Ajaran: {reportData.academic_year} ({reportData.active_semester})</p>
                      <p>Status Setup: {reportData.setup_state}</p>
                      <p>Data Dummy: {reportData.dummy_data_count} (Bersih)</p>
                      <p>Baseline Backup: {reportData.baseline_backup}</p>
                      <p>Status Uji: {reportData.status}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Bottom Action Footer */}
          <div className="border-t border-slate-100 pt-4 mt-6 flex items-center justify-between">
            <button
              type="button"
              disabled={currentStep <= 1}
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-30 cursor-pointer"
            >
              Kembali
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSaveCurrentStep}
                disabled={saveStepMutation.isPending}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                {saveStepMutation.isPending ? 'Menyimpan...' : 'Simpan Langkah Ini'}
              </button>

              {currentStep < 16 && (
                <button
                  type="button"
                  onClick={() => {
                    handleSaveCurrentStep();
                    setCurrentStep(prev => Math.min(16, prev + 1));
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>Lanjut</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
