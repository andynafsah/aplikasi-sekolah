/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { 
  Lock, 
  User, 
  GraduationCap, 
  Eye, 
  EyeOff, 
  HelpCircle, 
  Info, 
  CalendarDays, 
  ShieldCheck, 
  Database,
  Building,
  School,
  FileKey
} from 'lucide-react';
import apiClient from '../api/client';

export default function Login() {
  const { login } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPasswordInfo, setShowForgotPasswordInfo] = useState(false);

  // Dynamic Identity States loaded from Central Diagnostics (Database)
  const [sysConfig, setSysConfig] = useState<{
    schoolName: string;
    foundationName: string;
    logo: string;
    academicYear: string;
    semester: string;
    version: string;
    email: string;
  }>({
    schoolName: 'Yayasan Darul Hadits Lima Puluh Kota',
    foundationName: 'Yayasan Darul Hadits Lima Puluh Kota',
    logo: '',
    academicYear: '2025/2026',
    semester: 'Ganjil',
    version: 'v2026.07',
    email: 'info@darulhadits.org'
  });

  // Fetch live system diagnostics on mount to obtain database-saved values
  useEffect(() => {
    apiClient.post('/api/action', { action: 'getDiagnostics' })
      .then(res => {
        if (res.data?.success && res.data.data) {
          const { school, academicYear, semester, appVersion } = res.data.data;
          setSysConfig({
            schoolName: school?.name || 'Yayasan Darul Hadits Lima Puluh Kota',
            foundationName: school?.foundation_name || 'Yayasan Darul Hadits Lima Puluh Kota',
            logo: school?.logo || '',
            academicYear: academicYear?.name || '2025/2026',
            semester: semester?.name || 'Ganjil',
            version: appVersion || 'v2026.07',
            email: school?.email || 'info@darulhadits.org'
          });
        }
      })
      .catch(err => {
        console.warn('System configuration could not be loaded dynamically. Falling back to default identity:', err);
      });
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      identifier: '',
      password: '',
      rememberMe: false
    }
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      // Send both email and username as identifier to maintain full backend compatibility
      const response = await apiClient.post('/api/action?action=login', {
        email: data.identifier,
        username: data.identifier,
        password: data.password,
        rememberMe: data.rememberMe
      });

      if (response.data.success) {
        const { token, user, tenant } = response.data.data;
        login(token, user, tenant);
      } else {
        setErrorMsg(response.data.message || 'Kredensial login salah atau tidak terdaftar pada sistem');
      }
    } catch (err: any) {
      setErrorMsg('Gagal menyambung ke server. Silakan periksa koneksi internet Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 md:p-8 font-sans selection:bg-blue-600 selection:text-white relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-blue-950/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-indigo-950/20 rounded-full blur-[120px] pointer-events-none" />
 
      <div className="w-full max-w-5xl grid md:grid-cols-12 bg-[#1e293b] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative z-10">
        
        {/* Left Side: Brand Showcase (Dark Editorial Theme) */}
        <div className="md:col-span-5 bg-gradient-to-b from-[#1e293b] to-[#0f172a] p-8 md:p-12 text-white flex flex-col justify-between relative border-b md:border-b-0 md:border-r border-slate-800/80">
          <div className="absolute inset-0 bg-slate-950/10 mix-blend-overlay pointer-events-none" />
          
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              {sysConfig.logo ? (
                <img 
                  src={sysConfig.logo} 
                  alt="Logo" 
                  className="h-12 w-12 object-contain rounded-xl bg-slate-900/40 p-1 border border-slate-700/50"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="h-12 w-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <GraduationCap className="h-6 w-6" />
                </div>
              )}
              <div>
                <h1 className="text-xs font-black tracking-widest text-slate-400 uppercase">PORTAL ACARA MASUK</h1>
                <p className="text-[10px] text-blue-400 font-mono font-bold tracking-wider">{sysConfig.version}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white leading-tight">
                {sysConfig.foundationName}
              </h2>
              <div className="h-1 w-12 bg-blue-500 rounded-full" />
              <p className="text-slate-300 text-sm font-medium leading-relaxed">
                Enterprise School ERP &amp; Pondok Pesantren Management System
              </p>
            </div>
          </div>
  
          <div className="space-y-4 pt-8 border-t border-slate-800/80 mt-12 md:mt-0">
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <CalendarDays className="h-4.5 w-4.5 text-blue-400 shrink-0" />
              <span>Tahun Ajaran: <strong className="text-white font-semibold">{sysConfig.academicYear}</strong> ({sysConfig.semester})</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
              <span>Sistem Terenkripsi &amp; Sesi Terproteksi</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <Database className="h-4.5 w-4.5 text-[#10b981] shrink-0" />
              <span>Single-Tenant Production Database Connected</span>
            </div>
          </div>
        </div>
 
        {/* Right Side: Clean Form Portal */}
        <div className="md:col-span-7 p-8 md:p-12 flex flex-col justify-center bg-slate-900/60">
          
          <div className="mb-8">
            <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-bold tracking-widest rounded-full uppercase border border-blue-500/20">
              PORTAL LOGIN UTAMA
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight mt-3">
              Selamat Datang Kembali
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              Masukkan kredensial keamanan Anda untuk melanjutkan ke dashboard ERP.
            </p>
          </div>
  
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/30 border border-red-500/30 text-red-400 text-xs font-semibold animate-in fade-in duration-200">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 text-xs font-semibold animate-in fade-in duration-200">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Username or Email Input */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Username atau Alamat Email
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Masukkan username atau email Anda"
                  {...register('identifier', { required: 'Username atau Email wajib diisi' })}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/40 border border-slate-800 focus:border-blue-500 text-slate-100 text-xs rounded-xl outline-none transition-colors placeholder-slate-600"
                />
              </div>
              {errors.identifier && (
                <span className="text-red-400 text-[11px] mt-1.5 block font-semibold">
                  {errors.identifier.message}
                </span>
              )}
            </div>
 
            {/* Password Input */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan kata sandi Anda"
                  {...register('password', { required: 'Kata sandi wajib diisi' })}
                  className="w-full pl-10 pr-11 py-3 bg-slate-950/40 border border-slate-800 focus:border-blue-500 text-slate-100 text-xs rounded-xl outline-none transition-colors placeholder-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <span className="text-red-400 text-[11px] mt-1.5 block font-semibold">
                  {errors.password.message}
                </span>
              )}
            </div>

            {/* Remember Me & Forgot Password Links */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  {...register('rememberMe')}
                  className="h-4 w-4 rounded border-slate-800 bg-slate-950/40 text-blue-600 focus:ring-0 cursor-pointer"
                />
                <span>Ingat Saya</span>
              </label>
              
              <button
                type="button"
                onClick={() => setShowForgotPasswordInfo(!showForgotPasswordInfo)}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
              >
                Lupa Kata Sandi?
              </button>
            </div>

            {/* Forgot Password Help Panel */}
            {showForgotPasswordInfo && (
              <div className="p-4 bg-blue-950/20 border border-blue-900/40 text-slate-300 text-xs leading-relaxed rounded-xl space-y-1.5 animate-in slide-in-from-top-2 duration-150">
                <div className="flex items-center gap-1.5 text-blue-400 font-bold mb-1">
                  <Info className="h-4 w-4" />
                  <span>Petunjuk Pemulihan Akun</span>
                </div>
                <p>
                  Untuk alasan keamanan dan integritas data, pemulihan akun dilakukan secara terpusat oleh Admin SIM. Silakan hubungi:
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-blue-300 pl-1">
                  <li>Layanan Tata Usaha Pondok Pesantren</li>
                  <li>Email Admin: <span className="font-mono">{sysConfig.email}</span></li>
                </ul>
              </div>
            )}
 
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-950/30 font-sans tracking-wide uppercase mt-2"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Masuk ke Sistem'
              )}
            </button>
          </form>

          {/* Secure Production Platform footer */}
          <div className="mt-8 pt-6 border-t border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-slate-500 font-mono">
            <span>Server Status: <strong className="text-emerald-500">SECURE ACTIVE</strong></span>
            <span>Powered by Enterprise School ERP Single-Tenant</span>
          </div>
 
        </div>
      </div>
    </div>
  );
}
