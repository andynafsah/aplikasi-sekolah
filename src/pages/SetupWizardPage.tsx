/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import apiClient from '../api/client';
import { 
  CheckCircle, 
  ChevronRight, 
  ChevronLeft, 
  Building2, 
  GraduationCap, 
  Palette, 
  Layers, 
  Zap, 
  Award, 
  AlertTriangle,
  Globe,
  Sparkles,
  Users,
  Compass
} from 'lucide-react';

interface WizardInput {
  name: string;
  subdomain: string;
  type: 'SEKOLAH' | 'PONDOK' | 'KEDUA';
  
  nama_yayasan: string;
  nama_sekolah: string;
  npsn: string;
  akreditasi: string;
  alamat: string;
  provinsi: string;
  kabupaten: string;
  kecamatan: string;
  
  primary_color: string;
  sidebar_color: string;
  footer: string;
  copyright: string;
  
  unit_nama: string;
  unit_kode: string;
  unit_jenjang: string;
  
  plan_id: string;
}

export default function SetupWizardPage() {
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch initial wizard data if exists
  const { data: wizardState, isLoading } = useQuery({
    queryKey: ['setupWizardState'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action', { action: 'setupWizard', current_step: currentStep });
      return res.data.data;
    }
  });

  // Setup react-hook-form with safe, defined values to avoid uncontrolled/controlled warnings
  const safeWizardValues = React.useMemo(() => {
    const defaultVals: WizardInput = {
      name: '',
      subdomain: '',
      type: 'SEKOLAH',
      nama_yayasan: '',
      nama_sekolah: '',
      npsn: '',
      akreditasi: 'A',
      alamat: '',
      provinsi: '',
      kabupaten: '',
      kecamatan: '',
      primary_color: '#3b82f6',
      sidebar_color: '#1e293b',
      footer: 'ERP Sekolah',
      copyright: '© 2026. All Rights Reserved.',
      unit_nama: '',
      unit_kode: '',
      unit_jenjang: 'SMA',
      plan_id: 'starter'
    };
    if (!wizardState?.wizard_data) return defaultVals;
    const d = wizardState.wizard_data;
    return {
      name: d.name ?? '',
      subdomain: d.subdomain ?? '',
      type: d.type ?? 'SEKOLAH',
      nama_yayasan: d.nama_yayasan ?? '',
      nama_sekolah: d.nama_sekolah ?? '',
      npsn: d.npsn ?? '',
      akreditasi: d.akreditasi ?? 'A',
      alamat: d.alamat ?? '',
      provinsi: d.provinsi ?? '',
      kabupaten: d.kabupaten ?? '',
      kecamatan: d.kecamatan ?? '',
      primary_color: d.primary_color ?? '#3b82f6',
      sidebar_color: d.sidebar_color ?? '#1e293b',
      footer: d.footer ?? 'ERP Sekolah',
      copyright: d.copyright ?? '© 2026. All Rights Reserved.',
      unit_nama: d.unit_nama ?? '',
      unit_kode: d.unit_kode ?? '',
      unit_jenjang: d.unit_jenjang ?? 'SMA',
      plan_id: d.plan_id ?? 'starter'
    };
  }, [wizardState]);

  const { register, handleSubmit, watch, trigger, formState: { errors } } = useForm<WizardInput>({
    values: safeWizardValues
  });

  const watchData = watch();

  // Save progress mutation
  const saveWizardProgress = useMutation({
    mutationFn: async (data: { step: number; values: WizardInput }) => {
      const res = await apiClient.post('/api/action', { 
        action: 'setupWizard', 
        current_step: data.step,
        completed: data.step === 6,
        wizard_data: data.values
      });
      if (!res.data.success) {
        throw new Error(res.data.message || 'Gagal menyimpan progress wizard');
      }
      return res.data.data;
    },
    onSuccess: (resData) => {
      queryClient.setQueryData(['setupWizardState'], resData);
      setSuccessMsg('Progress wizard berhasil disimpan secara cloud!');
      setErrorMsg(null);
      setTimeout(() => setSuccessMsg(null), 3000);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem');
    }
  });

  const handleNext = async () => {
    // Validate fields based on current step
    let fieldsToValidate: any[] = [];
    if (currentStep === 1) {
      fieldsToValidate = ['name', 'subdomain'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['nama_sekolah', 'alamat', 'provinsi', 'kabupaten', 'kecamatan'];
    } else if (currentStep === 3) {
      fieldsToValidate = ['primary_color', 'sidebar_color', 'footer', 'copyright'];
    } else if (currentStep === 4) {
      fieldsToValidate = ['unit_nama', 'unit_kode'];
    }

    const isValid = await trigger(fieldsToValidate);
    if (!isValid) return;

    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    saveWizardProgress.mutate({ step: nextStep, values: watchData });
  };

  const handleBack = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      saveWizardProgress.mutate({ step: prevStep, values: watchData });
    }
  };

  const handleFinishWizard = () => {
    saveWizardProgress.mutate({ step: 6, values: watchData }, {
      onSuccess: () => {
        setSuccessMsg('Selamat! Setup awal profil sekolah Anda telah berhasil diselesaikan secara paripurna. Sistem diaktifkan!');
        setTimeout(() => {
          // Redirect or reload
          window.location.reload();
        }, 1500);
      }
    });
  };

  const steps = [
    { num: 1, name: 'Identitas Sekolah', icon: Building2 },
    { num: 2, name: 'Profil Detail', icon: GraduationCap },
    { num: 3, name: 'Visual Branding', icon: Palette },
    { num: 4, name: 'Unit / Cabang', icon: Layers },
    { num: 5, name: 'Pilih Paket', icon: Zap },
    { num: 6, name: 'Selesai', icon: CheckCircle }
  ];

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs font-mono text-slate-400">
        Menghubungkan ke wizard setup cloud...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans text-slate-700 pb-12">
      
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-blue-600 font-extrabold text-xs uppercase tracking-widest">
          <Sparkles className="h-4 w-4 animate-spin-slow" />
          <span>Lembaga Baru Wizard Inisialisasi</span>
        </div>
        <h2 className="text-2xl font-black tracking-tight text-slate-800">Initial Setup Wizard</h2>
        <p className="text-xs text-slate-500 max-w-xl mx-auto">Selamat datang! Ikuti 6 langkah asisten interaktif di bawah untuk mengonfigurasi dan meluncurkan sistem ERP sekolah Anda.</p>
      </div>

      {/* Steper Nav progress bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex justify-between items-center relative">
          
          {/* Progress bar line background */}
          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-100 z-0" />
          <div 
            className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-blue-600 transition-all duration-300 z-0" 
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />

          {steps.map((st) => {
            const Icon = st.icon;
            const isCompleted = currentStep > st.num;
            const isActive = currentStep === st.num;
            return (
              <div key={st.num} className="flex flex-col items-center gap-2 relative z-10">
                <div 
                  className={`h-10 w-10 rounded-full flex items-center justify-center transition-all border ${
                    isCompleted 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : isActive 
                      ? 'bg-white border-blue-600 text-blue-600 ring-4 ring-blue-50 font-black' 
                      : 'bg-white border-slate-200 text-slate-400'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span className={`text-[10px] font-bold ${isActive ? 'text-blue-600 font-black' : 'text-slate-400'}`}>
                  {st.name}
                </span>
              </div>
            );
          })}

        </div>
      </div>

      {/* Message Notifications */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-in fade-in duration-100">
          <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-in fade-in duration-100">
          <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Wizard Content Cards */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm min-h-[300px] flex flex-col justify-between gap-8">
        
        <div className="space-y-6">
          
          {/* STEP 1: CREATE TENANT */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <span>Langkah 1: Profil Dasar &amp; Subdomain Sekolah</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">Definisikan alamat sub-domain unik dan nama organisasi pengampu untuk pendaftaran sistem digital.</p>
              </div>

              <div className="space-y-4 max-w-xl">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Nama Institusi / Yayasan *</label>
                  <input
                    type="text"
                    placeholder="Contoh: Pondok Pesantren Daarul Qur'an"
                    {...register('name', { required: 'Nama institusi wajib diisi' })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  {errors.name && <p className="text-[10px] text-rose-500 font-semibold">{errors.name.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Alamat Subdomain Akses *</label>
                  <div className="flex">
                    <input
                      type="text"
                      placeholder="Contoh: pq-daarulquran"
                      {...register('subdomain', { 
                        required: 'Subdomain wajib diisi',
                        pattern: {
                          value: /^[a-z0-9-]+$/,
                          message: 'Hanya boleh huruf kecil, angka, dan tanda hubung (-)'
                        }
                      })}
                      className="flex-1 px-3.5 py-2 border border-slate-200 rounded-l-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <span className="bg-slate-50 border border-l-0 border-slate-200 px-3.5 py-2 rounded-r-xl text-xs text-slate-400 font-mono flex items-center">
                      .school-erp.com
                    </span>
                  </div>
                  {errors.subdomain && <p className="text-[10px] text-rose-500 font-semibold">{errors.subdomain.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Tipe Organisasi</label>
                  <select
                    {...register('type')}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="SEKOLAH">Sekolah Umum (PAUD/SD/SMP/SMA)</option>
                    <option value="PONDOK">Pondok Pesantren / Madrasah</option>
                    <option value="KEDUA">Keduanya (Terintegrasi Penuh)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: SCHOOL PROFILE */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                  <span>Langkah 2: Legalitas &amp; Profil Lengkap Lembaga</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">Lengkapi data profil formal instansi guna verifikasi legalitas, akreditasi, dan penerbitan rapot.</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Nama Yayasan</label>
                    <input
                      type="text"
                      placeholder="Yayasan Daarul Qur'an Indonesia"
                      {...register('nama_yayasan')}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Nama Resmi Sekolah / Lembaga *</label>
                    <input
                      type="text"
                      placeholder="Madrasah Aliyah Daarul Qur'an"
                      {...register('nama_sekolah', { required: 'Nama sekolah wajib diisi' })}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    {errors.nama_sekolah && <p className="text-[10px] text-rose-500 font-semibold">{errors.nama_sekolah.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">NPSN (Opsional)</label>
                    <input
                      type="text"
                      placeholder="20101234"
                      {...register('npsn')}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Akreditasi</label>
                    <select
                      {...register('akreditasi')}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                      <option value="A">Sangat Baik (A)</option>
                      <option value="B">Baik (B)</option>
                      <option value="C">Cukup (C)</option>
                      <option value="UNGGUL">Unggul (Pesantren)</option>
                      <option value="TT">Belum Terakreditasi (TT)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Alamat Fisik Kantor *</label>
                  <input
                    type="text"
                    placeholder="Jalan Ketapang No. 34, RT 02 / RW 05"
                    {...register('alamat', { required: 'Alamat wajib diisi' })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  {errors.alamat && <p className="text-[10px] text-rose-500 font-semibold">{errors.alamat.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Provinsi *</label>
                    <input
                      type="text"
                      placeholder="Jawa Tengah"
                      {...register('provinsi', { required: 'Provinsi wajib diisi' })}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    {errors.provinsi && <p className="text-[10px] text-rose-500 font-semibold">{errors.provinsi.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Kabupaten *</label>
                    <input
                      type="text"
                      placeholder="Cilacap"
                      {...register('kabupaten', { required: 'Kabupaten wajib diisi' })}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    {errors.kabupaten && <p className="text-[10px] text-rose-500 font-semibold">{errors.kabupaten.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Kecamatan *</label>
                    <input
                      type="text"
                      placeholder="Kroya"
                      {...register('kecamatan', { required: 'Kecamatan wajib diisi' })}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    {errors.kecamatan && <p className="text-[10px] text-rose-500 font-semibold">{errors.kecamatan.message}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: LOGO & BRANDING */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                  <Palette className="h-5 w-5 text-blue-600" />
                  <span>Langkah 3: Desain Visual &amp; Warna Identitas</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">Konfigurasikan palet warna dominan dan teks hak cipta hak paten aplikasi Anda.</p>
              </div>

              <div className="space-y-4 max-w-xl">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Warna Utama Aplikasi *</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        {...register('primary_color')}
                        className="h-8 w-10 border border-slate-200 rounded-lg p-0.5 cursor-pointer"
                      />
                      <input
                        type="text"
                        {...register('primary_color')}
                        className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Warna Sidebar Menu *</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        {...register('sidebar_color')}
                        className="h-8 w-10 border border-slate-200 rounded-lg p-0.5 cursor-pointer"
                      />
                      <input
                        type="text"
                        {...register('sidebar_color')}
                        className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Teks Footer Mini</label>
                    <input
                      type="text"
                      placeholder="Daarul Qur'an ERP Sekolah"
                      {...register('footer')}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Hak Cipta (Copyright)</label>
                    <input
                      type="text"
                      placeholder="© 2026. All Rights Reserved."
                      {...register('copyright')}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: ADD SCHOOL UNIT */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                  <Layers className="h-5 w-5 text-blue-600" />
                  <span>Langkah 4: Daftarkan Unit / Cabang Pertama</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">Setiap tenant dapat memiliki banyak unit/jenjang. Buat satu unit operasional awal Anda saat ini.</p>
              </div>

              <div className="space-y-4 max-w-xl">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Nama Unit Akademik *</label>
                  <input
                    type="text"
                    placeholder="Contoh: Madrasah Aliyah (MA) Putra"
                    {...register('unit_nama', { required: 'Nama unit perdana wajib diisi' })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  {errors.unit_nama && <p className="text-[10px] text-rose-500 font-semibold">{errors.unit_nama.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Kode Unit *</label>
                    <input
                      type="text"
                      placeholder="Contoh: MA-PUTRA, SMA-1, SDIT"
                      {...register('unit_kode', { required: 'Kode unit perdana wajib diisi' })}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    {errors.unit_kode && <p className="text-[10px] text-rose-500 font-semibold">{errors.unit_kode.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Jenjang Pendidikan</label>
                    <select
                      {...register('unit_jenjang')}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                      <option value="SD">MI / SD / Madrasah Ibtidaiyah</option>
                      <option value="SMP">MTs / SMP / Tsanawiyah</option>
                      <option value="SMA">MA / SMA / Madrasah Aliyah</option>
                      <option value="PESANTREN">Pondok Pesantren Terintegrasi</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: SELECT PLAN */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                  <Zap className="h-5 w-5 text-blue-600" />
                  <span>Langkah 5: Tentukan Lisensi Sistem Sekolah</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">Pilih paket lisensi awal yang sesuai dengan kuota jumlah siswa, guru, dan berkas sekolah Anda.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {[
                  { id: 'starter', name: 'Starter Plan', price: 'Rp 250.000', students: 'Maks. 250 Siswa', teachers: 'Maks. 20 Guru' },
                  { id: 'pro', name: 'Professional', price: 'Rp 750.000', students: 'Maks. 1.000 Siswa', teachers: 'Maks. 75 Guru', border: 'border-blue-500 bg-blue-50/10' },
                  { id: 'enterprise', name: 'Enterprise', price: 'Rp 2.000.000', students: 'Siswa Tanpa Batas', teachers: 'Guru Tanpa Batas' }
                ].map((pl) => (
                  <label 
                    key={pl.id}
                    className={`p-5 border rounded-2xl flex flex-col justify-between gap-4 cursor-pointer hover:shadow-xs transition-all ${
                      watchData.plan_id === pl.id 
                        ? 'border-2 border-blue-600 ring-4 ring-blue-50 bg-blue-50/20' 
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black uppercase text-slate-800">{pl.name}</span>
                        <input
                          type="radio"
                          value={pl.id}
                          {...register('plan_id')}
                          className="h-4 w-4 text-blue-600"
                        />
                      </div>
                      <span className="text-lg font-black text-slate-900 block">{pl.price} <span className="text-[10px] text-slate-400 font-normal">/ bln</span></span>
                    </div>

                    <div className="text-[10px] text-slate-500 font-mono space-y-1 border-t pt-2">
                      <div>• {pl.students}</div>
                      <div>• {pl.teachers}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* STEP 6: FINISH / SUMMARY */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                  <CheckCircle className="h-5 w-5 text-emerald-600 animate-bounce" />
                  <span>Langkah 6: Konfirmasi Akhir &amp; Aktifkan Sistem</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">Periksa ringkasan konfigurasi sebelum sistem menerbitkan database untuk sekolah Anda.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1">
                <div className="space-y-1.5">
                  <h4 className="font-bold text-[11px] text-slate-400 uppercase tracking-widest border-b pb-1">Identitas Sistem</h4>
                  <div className="flex justify-between"><span>Nama Sekolah/Yayasan:</span> <strong>{watchData.name}</strong></div>
                  <div className="flex justify-between"><span>Akses Subdomain:</span> <strong>{watchData.subdomain}.school-erp.com</strong></div>
                  <div className="flex justify-between"><span>Tipe Organisasi:</span> <strong className="text-blue-600">{watchData.type}</strong></div>
                </div>

                <div className="space-y-1.5 md:border-l md:pl-4">
                  <h4 className="font-bold text-[11px] text-slate-400 uppercase tracking-widest border-b pb-1">Cabang &amp; Lisensi</h4>
                  <div className="flex justify-between"><span>Unit Pertama:</span> <strong>{watchData.unit_nama} ({watchData.unit_kode})</strong></div>
                  <div className="flex justify-between"><span>Paket Lisensi:</span> <strong className="uppercase text-amber-600">{watchData.plan_id} Plan</strong></div>
                  <div className="flex justify-between"><span>Kota/Lokasi:</span> <strong>{watchData.kabupaten}, {watchData.provinsi}</strong></div>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 text-[11px] rounded-xl leading-relaxed">
                Dengan mengklik <strong>Aktifkan Sistem Sekolah</strong> di bawah, sistem cloud akan menginisialisasi database secara aman untuk institusi sekolah Anda.
              </div>
            </div>
          )}

        </div>

        {/* Navigation bottom bar inside card */}
        <div className="flex justify-between items-center border-t border-slate-100 pt-5">
          <button
            type="button"
            disabled={currentStep === 1}
            onClick={handleBack}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Sebelumnya</span>
          </button>

          {currentStep === 6 ? (
            <button
              type="button"
              onClick={handleFinishWizard}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer animate-pulse hover:animate-none"
            >
              <span>Aktifkan &amp; Luncurkan Sistem Sekolah</span>
              <CheckCircle className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <span>Langkah Selanjutnya</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
