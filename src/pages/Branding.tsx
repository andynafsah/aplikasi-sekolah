/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import apiClient from '../api/client';
import { 
  Palette, 
  Upload, 
  Check, 
  CheckCircle, 
  AlertTriangle,
  Info, 
  RefreshCw,
  Eye,
  Sparkles,
  Save,
  Trash2
} from 'lucide-react';

interface BrandingFormInput {
  logo?: string;
  logo_mini?: string;
  favicon?: string;
  primary_color: string;
  secondary_color: string;
  sidebar_color: string;
  background_login?: string;
  footer?: string;
  copyright: string;
}

const DEFAULT_PRESETS = [
  { name: 'Classic Blue', primary: '#3b82f6', secondary: '#1d4ed8', sidebar: '#1e293b' },
  { name: 'Teal Islamic', primary: '#14b8a6', secondary: '#0f766e', sidebar: '#0f172a' },
  { name: 'Emerald Scholar', primary: '#10b981', secondary: '#047857', sidebar: '#022c22' },
  { name: 'Indigo Professional', primary: '#6366f1', secondary: '#4338ca', sidebar: '#111827' },
  { name: 'Corporate Charcoal', primary: '#4b5563', secondary: '#1f2937', sidebar: '#111827' }
];

export default function Branding() {
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1. Fetch Branding
  const { data: brandingData, isLoading } = useQuery({
    queryKey: ['branding'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action', { action: 'getBranding' });
      return res.data.data;
    }
  });

  // 2. Setup react-hook-form with safe, defined values to avoid uncontrolled/controlled warnings
  const safeBrandingValues = React.useMemo(() => {
    const defaultVals: BrandingFormInput = {
      primary_color: '#3b82f6',
      secondary_color: '#1d4ed8',
      sidebar_color: '#1e293b',
      logo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=150',
      logo_mini: '',
      favicon: '',
      background_login: '',
      footer: 'School ERP SaaS',
      copyright: '© 2026. All Rights Reserved.'
    };
    if (!brandingData) return defaultVals;
    return {
      primary_color: brandingData.primary_color ?? defaultVals.primary_color,
      secondary_color: brandingData.secondary_color ?? defaultVals.secondary_color,
      sidebar_color: brandingData.sidebar_color ?? defaultVals.sidebar_color,
      logo: brandingData.logo ?? defaultVals.logo,
      logo_mini: brandingData.logo_mini ?? defaultVals.logo_mini,
      favicon: brandingData.favicon ?? defaultVals.favicon,
      background_login: brandingData.background_login ?? defaultVals.background_login,
      footer: brandingData.footer ?? defaultVals.footer,
      copyright: brandingData.copyright ?? defaultVals.copyright
    };
  }, [brandingData]);

  const { register, handleSubmit, setValue, watch, formState: { isSubmitting } } = useForm<BrandingFormInput>({
    values: safeBrandingValues
  });

  // Watch color variables for instant preview
  const primaryColor = watch('primary_color');
  const secondaryColor = watch('secondary_color');
  const sidebarColor = watch('sidebar_color');
  const logoUrl = watch('logo');
  const footerText = watch('footer');
  const copyrightText = watch('copyright');

  // Apply colors live to CSS custom variables of the page container for visual demonstration
  useEffect(() => {
    if (primaryColor) {
      document.documentElement.style.setProperty('--primary-brand-color', primaryColor);
    }
  }, [primaryColor]);

  // 3. Mutation to save branding configurations
  const saveBrandingMutation = useMutation({
    mutationFn: async (data: BrandingFormInput) => {
      const res = await apiClient.post('/api/action', { action: 'saveBranding', ...data });
      if (!res.data.success) {
        throw new Error(res.data.message || 'Gagal menyimpan konfigurasi branding');
      }
      return res.data.data;
    },
    onSuccess: (updatedData) => {
      queryClient.setQueryData(['branding'], updatedData);
      setSuccessMsg('Konfigurasi Branding & Logo berhasil diperbarui!');
      setErrorMsg(null);
      setTimeout(() => setSuccessMsg(null), 4000);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem');
      setSuccessMsg(null);
    }
  });

  const onSubmit = (data: BrandingFormInput) => {
    saveBrandingMutation.mutate(data);
  };

  const handleApplyPreset = (preset: typeof DEFAULT_PRESETS[0]) => {
    setValue('primary_color', preset.primary);
    setValue('secondary_color', preset.secondary);
    setValue('sidebar_color', preset.sidebar);
  };

  // Helper for mock logo change
  const handleUploadLogoMock = (field: 'logo' | 'logo_mini' | 'favicon' | 'background_login') => {
    const urls = {
      logo: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=150',
      logo_mini: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=50',
      favicon: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=32',
      background_login: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800'
    };
    setValue(field, urls[field]);
  };

  const handleClearField = (field: 'logo' | 'logo_mini' | 'favicon' | 'background_login') => {
    setValue(field, '');
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs font-mono text-slate-400">
        Memuat data visual branding...
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans text-slate-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-pink-600 font-bold text-xs uppercase tracking-wider">
            <Palette className="h-4 w-4" />
            <span>Kustomisasi Identitas Visual SaaS</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800">Visual Branding &amp; Logo</h2>
          <p className="text-xs text-slate-500 mt-1">Sesuaikan palet warna primer aplikasi, mini logo, favicon, dan teks hak cipta pada sistem ERP sekolah Anda.</p>
        </div>
      </div>

      {/* Messaging */}
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

      {/* Main Form & Preview Split */}
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Inputs */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6">
          
          {/* Section: Upload Asset */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
              <Upload className="h-4 w-4 text-slate-400" />
              <span>Asset Logo &amp; Favicon (URL atau Berkas)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="p-4 border border-slate-200 rounded-xl space-y-3 bg-slate-50/20">
                <label className="text-xs font-bold text-slate-700 block">Logo Utama (Navbar/Sidebar)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="URL gambar logo..."
                    {...register('logo')}
                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleUploadLogoMock('logo')}
                    className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-[10px] font-bold shrink-0 cursor-pointer"
                  >
                    Simulasi
                  </button>
                </div>
                {logoUrl ? (
                  <div className="flex items-center gap-2 pt-1">
                    <img src={logoUrl} alt="Logo" className="h-10 object-contain rounded border border-slate-200 p-1 bg-white" referrerPolicy="no-referrer" />
                    <button 
                      type="button" 
                      onClick={() => handleClearField('logo')}
                      className="text-rose-500 hover:text-rose-700 text-[10px] font-bold"
                    >
                      Hapus
                    </button>
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-400 block italic">Belum ada logo diunggah.</span>
                )}
              </div>

              <div className="p-4 border border-slate-200 rounded-xl space-y-3 bg-slate-50/20">
                <label className="text-xs font-bold text-slate-700 block">Favicon Situs (Tab Browser)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="URL favicon .png/.ico..."
                    {...register('favicon')}
                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleUploadLogoMock('favicon')}
                    className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-[10px] font-bold shrink-0 cursor-pointer"
                  >
                    Simulasi
                  </button>
                </div>
                {watch('favicon') ? (
                  <div className="flex items-center gap-2 pt-1">
                    <img src={watch('favicon')} alt="Favicon" className="h-6 w-6 object-contain rounded border border-slate-200 p-1 bg-white" referrerPolicy="no-referrer" />
                    <button 
                      type="button" 
                      onClick={() => handleClearField('favicon')}
                      className="text-rose-500 hover:text-rose-700 text-[10px] font-bold"
                    >
                      Hapus
                    </button>
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-400 block italic">Belum ada favicon diunggah.</span>
                )}
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-slate-200 rounded-xl space-y-3 bg-slate-50/20">
                <label className="text-xs font-bold text-slate-700 block">Logo Mini (Mobile / Collapsed)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="URL logo mini..."
                    {...register('logo_mini')}
                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleUploadLogoMock('logo_mini')}
                    className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-[10px] font-bold shrink-0 cursor-pointer"
                  >
                    Simulasi
                  </button>
                </div>
                {watch('logo_mini') ? (
                  <div className="flex items-center gap-2 pt-1">
                    <img src={watch('logo_mini')} alt="Logo Mini" className="h-8 w-8 object-contain rounded border border-slate-200 p-1 bg-white" referrerPolicy="no-referrer" />
                    <button 
                      type="button" 
                      onClick={() => handleClearField('logo_mini')}
                      className="text-rose-500 hover:text-rose-700 text-[10px] font-bold"
                    >
                      Hapus
                    </button>
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-400 block italic">Belum ada logo mini.</span>
                )}
              </div>

              <div className="p-4 border border-slate-200 rounded-xl space-y-3 bg-slate-50/20">
                <label className="text-xs font-bold text-slate-700 block">Latar Login Screen (Wallpaper)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="URL wallpaper latar..."
                    {...register('background_login')}
                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleUploadLogoMock('background_login')}
                    className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-[10px] font-bold shrink-0 cursor-pointer"
                  >
                    Simulasi
                  </button>
                </div>
                {watch('background_login') ? (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] text-slate-500 truncate max-w-[150px] font-mono">{watch('background_login')}</span>
                    <button 
                      type="button" 
                      onClick={() => handleClearField('background_login')}
                      className="text-rose-500 hover:text-rose-700 text-[10px] font-bold"
                    >
                      Hapus
                    </button>
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-400 block italic">Default latar biru (gradiant).</span>
                )}
              </div>
            </div>
          </div>

          {/* Section: Color Palette */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
              <Palette className="h-4 w-4 text-slate-400" />
              <span>Sistem Palet Warna Tema</span>
            </h3>

            {/* Presets List */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500">Gunakan Tema Preset Instan:</span>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <div className="flex items-center gap-0.5">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: preset.primary }} />
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: preset.secondary }} />
                    </div>
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Warna Utama (Primary)</label>
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
                <label className="text-xs font-bold text-slate-700 block">Warna Sekunder (Secondary)</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    {...register('secondary_color')}
                    className="h-8 w-10 border border-slate-200 rounded-lg p-0.5 cursor-pointer"
                  />
                  <input
                    type="text"
                    {...register('secondary_color')}
                    className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Warna Menu (Sidebar)</label>
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
          </div>

          {/* Section: Text Footer & Copyright */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              Teks Footer &amp; Hak Cipta (Copyright)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Teks Footer Mini</label>
                <input
                  type="text"
                  placeholder="Contoh: SMA Unggulan Nusantara - ERP SaaS"
                  {...register('footer')}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Teks Hak Cipta (Copyright)</label>
                <input
                  type="text"
                  placeholder="Contoh: © 2026 SMA Unggulan Nusantara. All Rights Reserved."
                  {...register('copyright')}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Realtime CSS Brand Preview Panel */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
              <Eye className="h-4 w-4 text-blue-600" />
              <span>Pratinjau Visual Aplikasi Secara Real-Time</span>
            </h3>

            {/* Mock Layout Preview */}
            <div className="border border-slate-200 rounded-xl overflow-hidden font-sans">
              
              {/* Header bar */}
              <div className="h-10 px-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-[11px] font-mono">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <div className="h-2 w-2 rounded-full bg-slate-300" />
                  <div className="h-2 w-2 rounded-full bg-slate-300" />
                  <div className="h-2 w-2 rounded-full bg-slate-300" />
                </div>
                <span className="text-slate-500 truncate max-w-[200px]">erp.sekolah.sch.id</span>
              </div>

              <div className="flex h-56 bg-slate-100">
                
                {/* Mock Sidebar */}
                <div 
                  className="w-24 p-2 flex flex-col gap-3 shrink-0 text-[9px] text-white/80 transition-colors"
                  style={{ backgroundColor: sidebarColor }}
                >
                  <div className="flex items-center gap-1 font-black text-[10px] tracking-tight uppercase border-b border-white/10 pb-1.5">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="h-4 object-contain" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="h-3 w-3 bg-white/25 rounded-full" />
                    )}
                    <span className="truncate">ERP</span>
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <div className="p-1.5 rounded-md bg-white/15 font-bold">Dashboard</div>
                    <div className="p-1.5 rounded-md hover:bg-white/5">Siswa</div>
                    <div className="p-1.5 rounded-md hover:bg-white/5">Keuangan</div>
                  </div>

                  <div className="text-[7px] text-white/40 border-t border-white/5 pt-1 truncate">
                    {footerText || 'ERP SaaS'}
                  </div>
                </div>

                {/* Mock Content */}
                <div className="flex-1 p-4 flex flex-col justify-between">
                  
                  {/* Cards inside content */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center bg-white border p-2 rounded-lg shadow-sm">
                      <div className="space-y-0.5">
                        <span className="text-[7px] font-bold text-slate-400 block uppercase">Informasi Institusi</span>
                        <span className="text-[10px] font-bold text-slate-700">SMA Unggulan Nusantara</span>
                      </div>
                      <span 
                        className="px-1.5 py-0.5 text-[8px] rounded font-bold text-white uppercase transition-colors"
                        style={{ backgroundColor: primaryColor }}
                      >
                        AKTIF
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white p-2 rounded-lg border shadow-xs text-center">
                        <span className="text-[7px] text-slate-400 block">Total Siswa</span>
                        <span className="text-xs font-black text-slate-700">1,240</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border shadow-xs text-center">
                        <span className="text-[7px] text-slate-400 block">Akreditasi</span>
                        <span className="text-xs font-black" style={{ color: secondaryColor }}>A (UNGGUL)</span>
                      </div>
                    </div>
                  </div>

                  {/* Mock Copyright footer */}
                  <div className="text-[7px] text-slate-400 text-center border-t border-slate-200/50 pt-1.5 truncate">
                    {copyrightText || '© All rights reserved.'}
                  </div>

                </div>

              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-start gap-2">
              <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <p>Perubahan palet warna yang Anda pilih akan diterapkan langsung pada menu navigasi utama, panel status, tombol tindakan, dan laporan ekspor dalam sistem ERP SaaS.</p>
            </div>

          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex justify-end gap-3 shadow-sm">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Semua Branding'}</span>
            </button>
          </div>

        </div>

      </form>

    </div>
  );
}
