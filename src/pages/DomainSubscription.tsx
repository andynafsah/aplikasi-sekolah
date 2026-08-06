/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import apiClient from '../api/client';
import { 
  Globe, 
  Settings, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Lock, 
  ShieldCheck, 
  Info, 
  Activity, 
  ExternalLink,
  ChevronRight,
  Server,
  Sparkles,
  Zap,
  HelpCircle
} from 'lucide-react';

interface DomainFormInput {
  custom_domain: string;
}

export default function DomainSubscription() {
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1. Fetch Domain Settings
  const { data: domainData, isLoading: domainLoading } = useQuery({
    queryKey: ['domainSettings'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action', { action: 'getDomain' });
      return res.data.data;
    }
  });

  // 2. Fetch SaaS Plans
  const { data: plans = [] } = useQuery({
    queryKey: ['saasPlans'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action', { action: 'listPlan' });
      return res.data.data || [];
    }
  });

  // 3. Fetch Active Subscription
  const { data: subscription, isLoading: subLoading } = useQuery({
    queryKey: ['activeSubscription'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action', { action: 'getSubscription' });
      return res.data.data;
    }
  });

  // 4. Setup Custom Domain Form
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<DomainFormInput>({
    values: {
      custom_domain: domainData?.custom_domain || ''
    }
  });

  // 5. Mutation for custom domain save
  const saveDomainMutation = useMutation({
    mutationFn: async (data: DomainFormInput) => {
      const res = await apiClient.post('/api/action', { action: 'saveDomain', ...data });
      if (!res.data.success) {
        throw new Error(res.data.message || 'Gagal menyimpan pengaturan domain');
      }
      return res.data.data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['domainSettings'], updated);
      setSuccessMsg('Domain kustom berhasil disimpan! Memulai proses validasi DNS dan penerbitan sertifikat SSL gratis.');
      setErrorMsg(null);
      setTimeout(() => setSuccessMsg(null), 5000);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem');
      setSuccessMsg(null);
    }
  });

  // 6. Mutation for subscription plan upgrade/change
  const changeSubscriptionMutation = useMutation({
    mutationFn: async (planId: string) => {
      const res = await apiClient.post('/api/action', { action: 'saveSubscription', plan_id: planId });
      if (!res.data.success) {
        throw new Error(res.data.message || 'Gagal memperbarui paket langganan');
      }
      return res.data.data;
    },
    onSuccess: (updatedSub) => {
      queryClient.setQueryData(['activeSubscription'], updatedSub);
      setSuccessMsg('Paket langganan Anda berhasil diperbarui! Limit siswa dan guru disesuaikan seketika.');
      setErrorMsg(null);
      setTimeout(() => setSuccessMsg(null), 5000);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Gagal merubah paket langganan');
      setSuccessMsg(null);
    }
  });

  const onSubmitDomain = (data: DomainFormInput) => {
    saveDomainMutation.mutate(data);
  };

  const handleSelectPlan = (planId: string, currentPlanId: string) => {
    if (planId === currentPlanId) return;
    if (confirm('Apakah Anda yakin ingin mengganti paket langganan sekolah? Limitasi fungsional akan disesuaikan dengan ketentuan paket baru.')) {
      changeSubscriptionMutation.mutate(planId);
    }
  };

  if (domainLoading || subLoading) {
    return (
      <div className="p-12 text-center text-xs font-mono text-slate-400">
        Memuat data domain dan paket langganan...
      </div>
    );
  }

  const currentPlanId = subscription?.plan_id || '';

  return (
    <div className="space-y-8 font-sans text-slate-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-blue-600 font-bold text-xs uppercase tracking-wider">
            <Globe className="h-4 w-4" />
            <span>Domain, Keamanan SSL &amp; Paket SaaS</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800">Domain &amp; Berlangganan</h2>
          <p className="text-xs text-slate-500 mt-1">Kelola custom domain sekuritas web sekolah Anda, pratinjau sertifikasi SSL, dan kendalikan langganan SaaS.</p>
        </div>
      </div>

      {/* Message Notifications */}
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

      {/* TOP SECTION: Bento Grid Split for Domain & Active Plan status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Domain Configuration Form Panel (Left) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-600" />
              <span>Sistem Akses Domain</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Satu aplikasi dapat diakses melalui subdomain sistem maupun alamat domain pribadi institusi Anda.</p>
          </div>

          <div className="space-y-4">
            
            {/* Subdomain Display */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Subdomain Utama Sistem (Aktif)</span>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-700">
                  {domainData?.subdomain}.school-erp.com
                </span>
                <a 
                  href={`https://${domainData?.subdomain}.school-erp.com`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-xs font-bold flex items-center gap-1 hover:underline"
                >
                  <span>Buka Tautan</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            {/* Custom Domain Input */}
            <form onSubmit={handleSubmit(onSubmitDomain)} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Kustom Domain Pribadi (FQDN)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Contoh: sma-unggulan.sch.id atau ponpes-modern.com"
                    {...register('custom_domain', { 
                      pattern: {
                        value: /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?$/,
                        message: 'Format nama domain FQDN tidak valid (contoh: sekolah.sch.id)'
                      }
                    })}
                    className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer disabled:bg-slate-300"
                  >
                    {isSubmitting ? 'Menghubungkan...' : 'Hubungkan'}
                  </button>
                </div>
                {errors.custom_domain && <p className="text-[10px] text-rose-500 font-semibold">{errors.custom_domain.message}</p>}
              </div>
            </form>

            {/* DNS Records Instructions (if custom domain is active) */}
            {domainData?.custom_domain && (
              <div className="p-4 border border-blue-150 bg-blue-50/20 rounded-xl space-y-3">
                <div className="flex justify-between items-center border-b border-blue-100 pb-1.5">
                  <span className="text-[10px] font-bold text-blue-800 uppercase tracking-widest flex items-center gap-1.5">
                    <Server className="h-3.5 w-3.5" />
                    <span>Instruksi Pemetaan DNS Rekod</span>
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold font-mono ${
                    domainData.ssl_status === 'ACTIVE' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                  }`}>
                    SSL: {domainData.ssl_status}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500">Silakan login pada portal manajemen domain Anda (Niagahoster, Rumahweb, dsb), lalu konfigurasikan rekor DNS berikut:</p>
                
                <div className="space-y-1.5 text-[10px] font-mono bg-slate-50 border p-2.5 rounded-lg text-slate-600">
                  <div className="flex justify-between border-b border-slate-200/50 pb-1">
                    <span>Type: <strong>A</strong></span>
                    <span>Host: <strong>@ (Root)</strong></span>
                    <span>Value: <strong>103.24.52.122</strong></span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span>Type: <strong>CNAME</strong></span>
                    <span>Host: <strong>www</strong></span>
                    <span>Value: <strong>{domainData.subdomain}.school-erp.com</strong></span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Active Subscription status card (Right) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <span>Informasi Paket Langganan</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Masa lisensi operasional digitalisasi institusi Anda.</p>
              </div>
              <span className="px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full font-mono font-bold text-[9px] animate-pulse">
                {subscription?.status}
              </span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-semibold">Paket Aktif:</span>
                <span className="font-extrabold text-slate-800 uppercase text-sm tracking-wider">
                  {subscription?.plan_id === 'starter' ? 'Starter Plan' : subscription?.plan_id === 'pro' ? 'Professional' : 'Enterprise / Pesantren'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-slate-200/60 pt-2">
                <span className="text-slate-400 font-semibold">Aktif Mulai:</span>
                <span className="font-mono text-slate-700 font-bold">{subscription?.start_date ? new Date(subscription.start_date).toLocaleDateString('id-ID') : '—'}</span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-slate-200/60 pt-2">
                <span className="text-slate-400 font-semibold">Habis Tempo:</span>
                <span className="font-mono text-rose-600 font-black">{subscription?.end_date ? new Date(subscription.end_date).toLocaleDateString('id-ID') : '—'}</span>
              </div>
            </div>
          </div>

          <div className="p-4 border border-emerald-100 bg-emerald-50/30 rounded-xl text-xs space-y-2 text-emerald-800">
            <h4 className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>SLA Lisensi Terjamin</span>
            </h4>
            <p className="text-[11px] text-emerald-700 leading-relaxed">Institusi Anda dilindungi oleh jaminan ketersediaan layanan 99.99% Server Infrastructure. Dukungan darurat 24/7 diaktifkan secara default.</p>
          </div>
        </div>

      </div>

      {/* LOWER SECTION: Beautiful SaaS Plan Cards Selection */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            <span>Pilih &amp; Upgrade Paket Layanan SaaS</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">Dapatkan limit kapasitas siswa, pendidik, dan penyimpanan berkas (rapot/absensi) yang lebih tinggi dengan meningkatkan paket Anda.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan: any) => {
            const isCurrent = plan.id === currentPlanId;
            const isPro = plan.id === 'pro';
            return (
              <div 
                key={plan.id}
                className={`border rounded-3xl p-6 bg-white relative overflow-hidden transition-all flex flex-col justify-between gap-6 hover:shadow-md ${
                  isCurrent 
                    ? 'border-2 border-blue-600 ring-4 ring-blue-50' 
                    : isPro 
                    ? 'border-indigo-200' 
                    : 'border-slate-200'
                }`}
              >
                {/* Popular label badge for PRO */}
                {isPro && (
                  <div className="absolute top-3 right-3 bg-indigo-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full tracking-widest uppercase">
                    Terpopuler
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-base font-extrabold text-slate-800 uppercase tracking-tight">{plan.nama_plan}</h4>
                    <p className="text-[10px] text-slate-400 font-bold">Lisensi Sekolah / Yayasan</p>
                  </div>

                  <div className="flex items-baseline gap-1 pt-1.5">
                    <span className="text-2xl font-black text-slate-800">
                      Rp {plan.harga.toLocaleString('id-ID')}
                    </span>
                    <span className="text-slate-400 text-xs">/ bulan</span>
                  </div>

                  {/* Limits Checklist */}
                  <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs text-slate-500">
                    <div className="flex justify-between">
                      <span>Maksimal Siswa:</span>
                      <strong className="text-slate-700">{plan.maksimal_siswa.toLocaleString('id-ID')}</strong>
                    </div>
                    <div className="flex justify-between border-t border-slate-100/50 pt-2">
                      <span>Maksimal Guru:</span>
                      <strong className="text-slate-700">{plan.maksimal_guru.toLocaleString('id-ID')}</strong>
                    </div>
                    <div className="flex justify-between border-t border-slate-100/50 pt-2">
                      <span>Kapasitas Storage:</span>
                      <strong className="text-slate-700">{plan.maksimal_storage} GB Cloud</strong>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2 pt-4 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Fitur Termasuk:</span>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {plan.fitur.map((fit: string, fIdx: number) => (
                        <li key={fIdx} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{fit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Select button */}
                <button
                  type="button"
                  disabled={isCurrent}
                  onClick={() => handleSelectPlan(plan.id, currentPlanId)}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isCurrent 
                      ? 'bg-blue-50 border border-blue-200 text-blue-600 cursor-default flex items-center justify-center gap-1.5' 
                      : isPro 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-md' 
                      : 'bg-slate-50 hover:bg-slate-100 border text-slate-700'
                  }`}
                >
                  {isCurrent ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span>Paket Aktif Saat Ini</span>
                    </>
                  ) : (
                    <span>Aktifkan Paket {plan.nama_plan}</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
