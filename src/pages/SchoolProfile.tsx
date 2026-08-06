/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import apiClient from '../api/client';
import { useSettings } from '../contexts/SettingsContext';
import { 
  GraduationCap, 
  MapPin, 
  Globe, 
  Phone, 
  Award, 
  Calendar, 
  CheckCircle, 
  AlertTriangle,
  FileText,
  Mail,
  Instagram,
  Facebook,
  Youtube,
  Save,
  Compass,
  Building2,
  Sparkles
} from 'lucide-react';

interface SchoolFormInput {
  nama_yayasan: string;
  nama_sekolah: string;
  npsn: string;
  nsm: string;
  akreditasi: 'A' | 'B' | 'C' | 'TT' | 'UNGGUL';
  nomor_izin: string;
  tanggal_berdiri: string;
  email: string;
  website: string;
  telepon: string;
  whatsapp: string;
  facebook: string;
  instagram: string;
  youtube: string;
  alamat: string;
  provinsi: string;
  kabupaten: string;
  kecamatan: string;
  kelurahan: string;
  kode_pos: string;
  latitude: number;
  longitude: number;
}

type TabType = 'BASIS' | 'CONTACT' | 'LOCATION';

export default function SchoolProfile() {
  const queryClient = useQueryClient();
  const { refreshSettings } = useSettings();
  const [activeTab, setActiveTab] = useState<TabType>('BASIS');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1. Fetch School Profile
  const { data: schoolProfile, isLoading } = useQuery({
    queryKey: ['schoolProfile'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action', { action: 'getSchool' });
      return res.data.data;
    }
  });

  // 2. Setup react-hook-form with safe, defined values to avoid uncontrolled/controlled warnings
  const safeSchoolValues = React.useMemo(() => {
    const defaultVals: SchoolFormInput = {
      nama_yayasan: '',
      nama_sekolah: '',
      npsn: '',
      nsm: '',
      akreditasi: 'A',
      nomor_izin: '',
      tanggal_berdiri: '',
      email: '',
      website: '',
      telepon: '',
      whatsapp: '',
      facebook: '',
      instagram: '',
      youtube: '',
      alamat: '',
      provinsi: '',
      kabupaten: '',
      kecamatan: '',
      kelurahan: '',
      kode_pos: '',
      latitude: 0,
      longitude: 0,
    };
    if (!schoolProfile) return defaultVals;
    return {
      nama_yayasan: schoolProfile.nama_yayasan ?? '',
      nama_sekolah: schoolProfile.nama_sekolah ?? '',
      npsn: schoolProfile.npsn ?? '',
      nsm: schoolProfile.nsm ?? '',
      akreditasi: schoolProfile.akreditasi ?? 'A',
      nomor_izin: schoolProfile.nomor_izin ?? '',
      tanggal_berdiri: schoolProfile.tanggal_berdiri ?? '',
      email: schoolProfile.email ?? '',
      website: schoolProfile.website ?? '',
      telepon: schoolProfile.telepon ?? '',
      whatsapp: schoolProfile.whatsapp ?? '',
      facebook: schoolProfile.facebook ?? '',
      instagram: schoolProfile.instagram ?? '',
      youtube: schoolProfile.youtube ?? '',
      alamat: schoolProfile.alamat ?? '',
      provinsi: schoolProfile.provinsi ?? '',
      kabupaten: schoolProfile.kabupaten ?? '',
      kecamatan: schoolProfile.kecamatan ?? '',
      kelurahan: schoolProfile.kelurahan ?? '',
      kode_pos: schoolProfile.kode_pos ?? '',
      latitude: Number(schoolProfile.latitude) || 0,
      longitude: Number(schoolProfile.longitude) || 0,
    };
  }, [schoolProfile]);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<SchoolFormInput>({
    values: safeSchoolValues
  });

  // 3. Mutation for saving school profile
  const saveProfileMutation = useMutation({
    mutationFn: async (data: SchoolFormInput) => {
      const res = await apiClient.post('/api/action', { action: 'updateSchool', ...data });
      if (!res.data.success) {
        throw new Error(res.data.message || 'Gagal menyimpan profil sekolah');
      }
      return res.data.data;
    },
    onSuccess: (updatedData) => {
      queryClient.setQueryData(['schoolProfile'], updatedData);
      refreshSettings();
      setSuccessMsg('Profil sekolah berhasil diperbarui!');
      setErrorMsg(null);
      setTimeout(() => setSuccessMsg(null), 4000);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem');
      setSuccessMsg(null);
    }
  });

  const onSubmit = (data: SchoolFormInput) => {
    saveProfileMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs font-mono text-slate-400">
        Memuat data profil sekolah...
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans text-slate-700">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-teal-600 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="h-4 w-4 animate-pulse" />
            <span>Konfigurasi Lembaga Pendidikan</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800">Profil Sekolah &amp; Yayasan</h2>
          <p className="text-xs text-slate-500 mt-1">Sesuaikan identitas legalitas, kontak instansi, dan titik spasial koordinat geografi sekolah Anda.</p>
        </div>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-in fade-in duration-200">
          <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-in fade-in duration-200">
          <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Form container */}
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left column navigation tabs */}
        <div className="lg:col-span-3 space-y-2 bg-white p-3 border border-slate-200 rounded-2xl shadow-sm">
          {[
            { id: 'BASIS', label: 'Profil Dasar & Legalitas', icon: Building2 },
            { id: 'CONTACT', label: 'Kontak & Media Sosial', icon: Mail },
            { id: 'LOCATION', label: 'Alamat & Geoposition', icon: MapPin }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${
                  activeTab === tab.id 
                    ? 'bg-blue-50 text-blue-700 font-extrabold border-l-4 border-blue-600' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right column detailed form panel */}
        <div className="lg:col-span-9 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          
          <div className="p-6 space-y-6">
            
            {/* TAB 1: BASIS */}
            {activeTab === 'BASIS' && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-slate-800 border-b pb-2 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-blue-600" />
                  <span>Informasi Identitas &amp; Legalitas Sekolah</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Nama Yayasan Pengampu</label>
                    <input
                      type="text"
                      placeholder="Contoh: Yayasan Abdi Bangsa Indonesia"
                      {...register('nama_yayasan')}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Nama Sekolah / Lembaga *</label>
                    <input
                      type="text"
                      placeholder="Contoh: SMA Unggulan Nusantara"
                      {...register('nama_sekolah', { required: 'Nama sekolah wajib diisi' })}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    {errors.nama_sekolah && <p className="text-[10px] text-rose-500 font-semibold">{errors.nama_sekolah.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">NPSN (Nomor Pokok Sekolah Nasional)</label>
                    <input
                      type="text"
                      placeholder="Contoh: 20101234"
                      {...register('npsn')}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">NSM / NSS (Nomor Statistik Madrasah)</label>
                    <input
                      type="text"
                      placeholder="Contoh: 1212345678"
                      {...register('nsm')}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Akreditasi</label>
                    <select
                      {...register('akreditasi')}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                    >
                      <option value="A">Terakreditasi A (Sangat Baik)</option>
                      <option value="B">Terakreditasi B (Baik)</option>
                      <option value="C">Terakreditasi C (Cukup)</option>
                      <option value="UNGGUL">Unggul (Pesantren)</option>
                      <option value="TT">Belum Terakreditasi (TT)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Nomor SK Pendirian / Izin Operasional</label>
                    <input
                      type="text"
                      placeholder="Contoh: 421/332/SK/2018"
                      {...register('nomor_izin')}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Tanggal Berdiri Sekolah</label>
                    <input
                      type="date"
                      {...register('tanggal_berdiri')}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CONTACT */}
            {activeTab === 'CONTACT' && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-slate-800 border-b pb-2 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-600" />
                  <span>Kontak Resmi &amp; Media Sosial Sekolah</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Email Instansi</label>
                    <input
                      type="email"
                      placeholder="info@smanusantara.sch.id"
                      {...register('email', { 
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Format email tidak valid'
                        }
                      })}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    {errors.email && <p className="text-[10px] text-rose-500 font-semibold">{errors.email.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Alamat Website Resmi</label>
                    <input
                      type="text"
                      placeholder="www.smanusantara.sch.id"
                      {...register('website')}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Nomor Telepon Kantor</label>
                    <input
                      type="text"
                      placeholder="021-5551234"
                      {...register('telepon')}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Nomor WhatsApp Humas</label>
                    <input
                      type="text"
                      placeholder="081234567890"
                      {...register('whatsapp')}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tautan Media Sosial</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5">
                        <Facebook className="h-3.5 w-3.5 text-blue-600" />
                        <span>Halaman Facebook</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: smanusantara"
                        {...register('facebook')}
                        className="w-full px-3.5 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5">
                        <Instagram className="h-3.5 w-3.5 text-pink-600" />
                        <span>Akun Instagram</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: @smanusantara"
                        {...register('instagram')}
                        className="w-full px-3.5 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5">
                        <Youtube className="h-3.5 w-3.5 text-rose-600" />
                        <span>Saluran YouTube</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: SMANusantaraChannel"
                        {...register('youtube')}
                        className="w-full px-3.5 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: LOCATION */}
            {activeTab === 'LOCATION' && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-slate-800 border-b pb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span>Alamat Spasial &amp; Titik Koordinat</span>
                </h3>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Alamat Lengkap Kantor *</label>
                  <textarea
                    rows={2}
                    placeholder="Masukkan jalan, nomor, RT/RW, lingkungan dusun..."
                    {...register('alamat', { required: 'Alamat lengkap wajib diisi' })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                  />
                  {errors.alamat && <p className="text-[10px] text-rose-500 font-semibold">{errors.alamat.message}</p>}
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Provinsi *</label>
                    <input
                      type="text"
                      placeholder="DKI Jakarta"
                      {...register('provinsi', { required: 'Provinsi wajib diisi' })}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    {errors.provinsi && <p className="text-[10px] text-rose-500 font-semibold">{errors.provinsi.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Kabupaten/Kota *</label>
                    <input
                      type="text"
                      placeholder="Jakarta Selatan"
                      {...register('kabupaten', { required: 'Kabupaten wajib diisi' })}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    {errors.kabupaten && <p className="text-[10px] text-rose-500 font-semibold">{errors.kabupaten.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Kecamatan *</label>
                    <input
                      type="text"
                      placeholder="Kebayoran Baru"
                      {...register('kecamatan', { required: 'Kecamatan wajib diisi' })}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    {errors.kecamatan && <p className="text-[10px] text-rose-500 font-semibold">{errors.kecamatan.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Kelurahan / Desa</label>
                    <input
                      type="text"
                      placeholder="Selong"
                      {...register('kelurahan')}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Kode Pos</label>
                    <input
                      type="text"
                      placeholder="12110"
                      {...register('kode_pos')}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Compass className="h-3.5 w-3.5 text-slate-400" />
                      <span>Garis Lintang (Latitude)</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="-6.2345"
                      {...register('latitude', { valueAsNumber: true })}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Compass className="h-3.5 w-3.5 text-slate-400" />
                      <span>Garis Bujur (Longitude)</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="106.8123"
                      {...register('longitude', { valueAsNumber: true })}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Footer Save panel */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
            <span className="text-[10px] text-slate-400 font-semibold italic">Tanda (*) menandakan ruas input wajib diisi.</span>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-md cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Profil'}</span>
            </button>
          </div>

        </div>

      </form>

    </div>
  );
}
