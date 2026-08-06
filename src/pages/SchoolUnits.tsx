/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import apiClient from '../api/client';
import { 
  Layers, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  User, 
  Tag, 
  GraduationCap, 
  Search,
  Sparkles
} from 'lucide-react';

interface UnitFormInput {
  id?: string;
  nama_unit: string;
  kode: string;
  jenjang: string;
  kepala_unit: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export default function SchoolUnits() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<UnitFormInput | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1. Fetch Units
  const { data: units = [], isLoading } = useQuery({
    queryKey: ['schoolUnits'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action', { action: 'listUnit' });
      return res.data.data || [];
    }
  });

  // 2. Setup react-hook-form
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<UnitFormInput>({
    defaultValues: {
      status: 'ACTIVE'
    }
  });

  // 3. Mutation to save/update unit
  const saveUnitMutation = useMutation({
    mutationFn: async (data: UnitFormInput) => {
      const actionName = data.id ? 'updateUnit' : 'createUnit';
      const res = await apiClient.post('/api/action', { action: actionName, ...data });
      if (!res.data.success) {
        throw new Error(res.data.message || 'Gagal menyimpan unit sekolah');
      }
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schoolUnits'] });
      setIsModalOpen(false);
      reset();
      setSelectedUnit(null);
      setErrorMsg(null);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem');
    }
  });

  // 4. Mutation to delete unit
  const deleteUnitMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post('/api/action', { action: 'deleteUnit', id });
      if (!res.data.success) {
        throw new Error(res.data.message || 'Gagal menghapus unit sekolah');
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schoolUnits'] });
    }
  });

  const handleOpenCreateModal = () => {
    setSelectedUnit(null);
    reset({
      nama_unit: '',
      kode: '',
      jenjang: 'SMA',
      kepala_unit: '',
      status: 'ACTIVE'
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (unit: any) => {
    setSelectedUnit(unit);
    reset({
      id: unit.id,
      nama_unit: unit.nama_unit,
      kode: unit.kode,
      jenjang: unit.jenjang,
      kepala_unit: unit.kepala_unit || '',
      status: unit.status
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleDeleteUnit = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus unit sekolah "${name}"? Tindakan ini tidak dapat dibatalkan.`)) {
      deleteUnitMutation.mutate(id);
    }
  };

  const onSubmit = (data: UnitFormInput) => {
    saveUnitMutation.mutate(data);
  };

  const filteredUnits = units.filter((u: any) => 
    u.nama_unit.toLowerCase().includes(search.toLowerCase()) ||
    u.kode.toLowerCase().includes(search.toLowerCase())
  );

  const totalUnits = units.length;
  const activeUnits = units.filter((u: any) => u.status === 'ACTIVE').length;

  return (
    <div className="space-y-6 font-sans text-slate-700">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-indigo-600 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="h-4 w-4" />
            <span>Struktur Cabang &amp; Multi-Unit</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800">Manajemen Unit Sekolah</h2>
          <p className="text-xs text-slate-500 mt-1">Definisikan berbagai unit akademis terintegrasi (seperti MI, MTs, MA, SD, SMP, SMA) di bawah naungan yayasan Anda.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer self-start md:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Unit Sekolah</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 gap-4 max-w-lg">
        <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Total Unit Cabang</span>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{totalUnits}</h3>
          </div>
          <div className="h-10 w-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Layers className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Unit Aktif Beroperasi</span>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{activeUnits}</h3>
          </div>
          <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama unit atau kode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Menampilkan <span className="font-bold text-slate-700">{filteredUnits.length}</span> unit
          </div>
        </div>

        {/* Content Unit Cards */}
        {isLoading ? (
          <div className="p-12 text-center text-xs font-mono text-slate-400">Memuat data unit...</div>
        ) : filteredUnits.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Layers className="h-10 w-10 mx-auto text-slate-300" />
            <p className="text-sm font-semibold text-slate-500">Tidak ada unit sekolah yang dibuat</p>
            <p className="text-xs text-slate-400">Silakan tambahkan struktur sekolah baru dengan menekan tombol Tambah Unit di atas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-5">
            {filteredUnits.map((unit: any) => (
              <div 
                key={unit.id}
                className="p-5 border border-slate-200 hover:border-indigo-400 rounded-2xl bg-slate-50/35 flex flex-col justify-between gap-4 transition-all hover:shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">KODE: {unit.kode}</span>
                      <h4 className="text-base font-extrabold text-slate-800">{unit.nama_unit}</h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono border ${
                      unit.status === 'ACTIVE' 
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                        : 'bg-rose-50 border-rose-100 text-rose-700'
                    }`}>
                      {unit.status}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-slate-400 shrink-0" />
                      <span>Jenjang: <strong className="text-slate-700">{unit.jenjang}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-400 shrink-0" />
                      <span>Kepala Unit: <strong className="text-slate-700">{unit.kepala_unit || 'Belum diisi'}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100/50">
                  <button
                    onClick={() => handleOpenEditModal(unit)}
                    className="p-1.5 bg-white border border-slate-200 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer text-xs flex items-center gap-1.5 font-bold"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>Ubah</span>
                  </button>
                  <button
                    onClick={() => handleDeleteUnit(unit.id, unit.nama_unit)}
                    className="p-1.5 bg-white border border-slate-200 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer text-xs flex items-center gap-1.5 font-bold"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* SAVE / UPDATE MODAL DIALOG */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/65 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Layers className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">
                    {selectedUnit ? 'Edit Unit Sekolah' : 'Tambah Unit Sekolah Baru'}
                  </h3>
                  <p className="text-[10px] text-slate-400">Hubungkan unit dengan kurikulum dan data SPP terpisah.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            {/* Error messaging */}
            {errorMsg && (
              <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Nama Unit Sekolah *</label>
                <input
                  type="text"
                  placeholder="Contoh: Madrasah Tsanawiyah (MTs) Daarul Qur'an"
                  {...register('nama_unit', { required: 'Nama unit wajib diisi' })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                {errors.nama_unit && <p className="text-[10px] text-rose-500 font-semibold">{errors.nama_unit.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Tag className="h-3 w-3 text-slate-400" />
                    <span>Kode Unit *</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: MTS, SMA, SD"
                    {...register('kode', { required: 'Kode unit wajib diisi' })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  {errors.kode && <p className="text-[10px] text-rose-500 font-semibold">{errors.kode.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Jenjang Akademik</label>
                  <select
                    {...register('jenjang')}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                  >
                    <option value="TK">PAUD / TK</option>
                    <option value="SD">SD / Madrasah Ibtidaiyah</option>
                    <option value="SMP">SMP / Madrasah Tsanawiyah</option>
                    <option value="SMA">SMA / SMK / Madrasah Aliyah</option>
                    <option value="PESANTREN">Pondok Pesantren / Salafiyah</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Kepala Sekolah / Kepala Unit</label>
                <input
                  type="text"
                  placeholder="Contoh: Ustadz Muhammad Yusuf, Lc."
                  {...register('kepala_unit')}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Status Operasional</label>
                <select
                  {...register('status')}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                >
                  <option value="ACTIVE">Aktif (Bisa Diisi Data Siswa &amp; SPP)</option>
                  <option value="INACTIVE">Non-Aktif (Ditangguhkan)</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-150 flex items-center justify-end gap-3">
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
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm hover:shadow-md cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Unit'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
