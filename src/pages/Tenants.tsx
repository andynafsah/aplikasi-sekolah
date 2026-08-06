/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import apiClient from '../api/client';
import { 
  Building2, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Globe, 
  Phone, 
  MapPin, 
  Sliders, 
  Users,
  ShieldAlert,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface TenantFormInput {
  id?: string;
  name: string;
  subdomain: string;
  type: 'SEKOLAH' | 'PONDOK' | 'KEDUA';
  status: 'ACTIVE' | 'SUSPENDED' | 'TRIAL';
  address: string;
  phone: string;
}

export default function Tenants() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<TenantFormInput | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1. Fetch Tenants
  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action', { action: 'listTenant' });
      return res.data.data || [];
    }
  });

  // 2. Setup react-hook-form
  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<TenantFormInput>({
    defaultValues: {
      type: 'SEKOLAH',
      status: 'ACTIVE',
      address: '',
      phone: ''
    }
  });

  const watchSubdomain = watch('subdomain');

  // 3. Mutation to create/update tenant
  const saveTenantMutation = useMutation({
    mutationFn: async (data: TenantFormInput) => {
      const actionName = data.id ? 'updateTenant' : 'createTenant';
      const res = await apiClient.post('/api/action', { action: actionName, ...data });
      if (!res.data.success) {
        throw new Error(res.data.message || 'Gagal menyimpan tenant');
      }
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      setIsModalOpen(false);
      reset();
      setSelectedTenant(null);
      setErrorMsg(null);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem');
    }
  });

  // 4. Mutation to delete tenant
  const deleteTenantMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post('/api/action', { action: 'deleteTenant', id });
      if (!res.data.success) {
        throw new Error(res.data.message || 'Gagal menghapus tenant');
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    }
  });

  const handleOpenCreateModal = () => {
    setSelectedTenant(null);
    reset({
      name: '',
      subdomain: '',
      type: 'SEKOLAH',
      status: 'ACTIVE',
      address: '',
      phone: ''
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (ten: any) => {
    setSelectedTenant(ten);
    reset({
      id: ten.id,
      name: ten.name,
      subdomain: ten.subdomain,
      type: ten.type,
      status: ten.status,
      address: ten.address || '',
      phone: ten.phone || ''
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleDeleteTenant = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menonaktifkan/menghapus tenant "${name}"?`)) {
      deleteTenantMutation.mutate(id);
    }
  };

  const onSubmit = (data: TenantFormInput) => {
    saveTenantMutation.mutate(data);
  };

  // Filter and search
  const filteredTenants = tenants.filter((t: any) => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.subdomain.toLowerCase().includes(search.toLowerCase())
  );

  // Bento KPIs
  const totalTenants = tenants.length;
  const activeTenants = tenants.filter((t: any) => t.status === 'ACTIVE').length;
  const trialTenants = tenants.filter((t: any) => t.status === 'TRIAL').length;
  const suspendedTenants = tenants.filter((t: any) => t.status === 'SUSPENDED').length;

  return (
    <div className="space-y-6 font-sans text-slate-700">
      
      {/* Page Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-blue-600 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="h-4 w-4 animate-spin-slow" />
            <span>Multi-Tenant Cluster Control Panel</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800">Tenant Management</h2>
          <p className="text-xs text-slate-500 mt-1">Mengelola database sekolah dan pondok pesantren terisolasi yang berlangganan pada cluster ERP SaaS.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer self-start md:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Tenant Baru</span>
        </button>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Total Tenant</span>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{totalTenants}</h3>
          </div>
          <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Building2 className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Aktif Berlangganan</span>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{activeTenants}</h3>
          </div>
          <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Masa Trial</span>
            <h3 className="text-2xl font-black text-amber-600 mt-1">{trialTenants}</h3>
          </div>
          <div className="h-10 w-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Sliders className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Ditangguhkan (Suspended)</span>
            <h3 className="text-2xl font-black text-rose-600 mt-1">{suspendedTenants}</h3>
          </div>
          <div className="h-10 w-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <ShieldAlert className="h-5 w-5" />
          </div>
        </div>

      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        
        {/* Search & Stats Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama institusi atau subdomain..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Menampilkan <span className="font-bold text-slate-700">{filteredTenants.length}</span> dari <span className="font-bold text-slate-700">{totalTenants}</span> tenant
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-slate-400 font-mono">Memuat database tenant...</div>
          ) : filteredTenants.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Building2 className="h-10 w-10 mx-auto text-slate-300" />
              <p className="text-sm font-semibold text-slate-500">Tidak ada tenant ditemukan</p>
              <p className="text-xs text-slate-400">Silakan gunakan kriteria pencarian lain atau tambahkan tenant baru.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="p-4">Nama Institusi</th>
                  <th className="p-4">Tipe &amp; Subdomain</th>
                  <th className="p-4">Kontak &amp; Alamat</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 font-medium">
                {filteredTenants.map((ten: any) => (
                  <tr key={ten.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                          {ten.name[0]}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">{ten.name}</h4>
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">
                            ID: {ten.id}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                            ten.type === 'PONDOK' ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {ten.type === 'PONDOK' ? 'PESANTREN' : 'SEKOLAH'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                          <Globe className="h-3 w-3 text-slate-400" />
                          <span>{ten.subdomain}.school-erp.com</span>
                        </p>
                      </div>
                    </td>
                    <td className="p-4 text-slate-500">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          <span>{ten.phone || '—'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] truncate max-w-xs">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          <span>{ten.address || '—'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold font-mono border ${
                        ten.status === 'ACTIVE' 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                          : ten.status === 'TRIAL' 
                          ? 'bg-amber-50 border-amber-200 text-amber-700' 
                          : 'bg-rose-50 border-rose-200 text-rose-700'
                      }`}>
                        {ten.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(ten)}
                          className="p-1.5 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                          title="Ubah Profil Tenant"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTenant(ten.id, ten.name)}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                          title="Nonaktifkan Tenant"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>

      {/* CREATE & EDIT TENANT DIALOG MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">
                    {selectedTenant ? 'Edit Profil Tenant' : 'Registrasi Tenant Baru'}
                  </h3>
                  <p className="text-[10px] text-slate-400">Pastikan data yang diinput sesuai untuk lisensi SaaS.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            {/* Error Message banner */}
            {errorMsg && (
              <div className="mx-6 mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-700">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Nama Institusi / Yayasan *</label>
                <input
                  type="text"
                  placeholder="Contoh: SMA Unggulan Nusantara"
                  {...register('name', { required: 'Nama institusi wajib diisi' })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                {errors.name && <p className="text-[10px] text-rose-500 font-semibold">{errors.name.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Subdomain Tenant *</label>
                <div className="flex">
                  <input
                    type="text"
                    disabled={!!selectedTenant}
                    placeholder="Contoh: sma-unggulan"
                    {...register('subdomain', { 
                      required: 'Subdomain wajib diisi',
                      pattern: {
                        value: /^[a-z0-9-]+$/,
                        message: 'Subdomain hanya boleh huruf kecil, angka, dan tanda hubung (-)'
                      }
                    })}
                    className="flex-1 px-3.5 py-2 border border-slate-200 rounded-l-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-slate-50 disabled:text-slate-400"
                  />
                  <span className="bg-slate-50 border border-l-0 border-slate-200 px-3.5 py-2 rounded-r-xl text-xs text-slate-400 font-mono flex items-center">
                    .school-erp.com
                  </span>
                </div>
                {errors.subdomain && <p className="text-[10px] text-rose-500 font-semibold">{errors.subdomain.message}</p>}
                {!selectedTenant && watchSubdomain && (
                  <p className="text-[10px] text-emerald-600 font-medium font-mono mt-0.5">
                    URL Akses: https://{watchSubdomain.toLowerCase()}.school-erp.com
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Tipe Institusi</label>
                  <select
                    {...register('type')}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                  >
                    <option value="SEKOLAH">Sekolah Umum (SMA/SD/dsb)</option>
                    <option value="PONDOK">Pondok Pesantren</option>
                    <option value="KEDUA">Keduanya (Terintegrasi)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Status Lisensi</label>
                  <select
                    {...register('status')}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                  >
                    <option value="ACTIVE">Aktif (ACTIVE)</option>
                    <option value="TRIAL">Trial / Percobaan</option>
                    <option value="SUSPENDED">Ditangguhkan</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Nomor Telepon Institusi</label>
                <input
                  type="text"
                  placeholder="Contoh: 081234567890"
                  {...register('phone')}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Alamat Lengkap</label>
                <textarea
                  rows={2}
                  placeholder="Masukkan alamat lengkap sekolah..."
                  {...register('address')}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                />
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm hover:shadow-md cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
