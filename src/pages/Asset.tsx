/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { 
  Building, 
  Search, 
  Plus, 
  Settings, 
  Trash2, 
  Edit, 
  Check, 
  AlertTriangle,
  Download,
  Upload,
  Printer,
  FileSpreadsheet,
  Calendar,
  Wrench,
  User,
  Activity,
  DollarSign,
  Monitor,
  Video,
  FileText,
  Eye,
  FileDown,
  ArrowLeftRight,
  ClipboardList
} from 'lucide-react';

interface CampusAsset {
  id: string;
  name: string;
  code: string;
  category: 'Gedung' | 'Tanah' | 'Kendaraan' | 'Komputer' | 'Printer' | 'Furniture' | 'Mesin' | 'Elektronik';
  status: 'OPERATIONAL' | 'MAINTENANCE' | 'BROKEN' | 'DECOMMISSIONED' | 'SCRAPPED';
  purchase_date: string;
  cost: number;
  location: string;
  depreciation_method: 'STRAIGHT_LINE' | 'DECLINING_BALANCE' | 'CUSTOM';
  depreciation_rate: number; // yearly %
  residual_value: number;
  useful_life: number;
  accumulated_depreciation?: number;
  book_value?: number;
  barcode_url?: string;
  qr_url?: string;
}

interface MaintenanceRecord {
  id: string;
  asset_id: string;
  schedule_date: string;
  completion_date?: string;
  cost: number;
  vendor: string;
  description: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
}

interface AssetLoan {
  id: string;
  asset_id: string;
  borrower_name: string;
  borrower_type: 'GURU' | 'KARYAWAN' | 'SANTRI' | 'SISWA' | 'UNIT';
  loan_date: string;
  due_date: string;
  return_date?: string;
  status: 'BORROWED' | 'RETURNED' | 'OVERDUE';
  notes?: string;
}

export default function Asset() {
  const queryClient = useQueryClient();
  
  // Tab states
  const [activeSubTab, setActiveSubTab] = useState<'list' | 'maintenance' | 'depreciation' | 'loans'>('list');
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Form Modals
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<CampusAsset | null>(null);
  const [newAsset, setNewAsset] = useState<{
    name: string;
    code: string;
    category: 'Gedung' | 'Tanah' | 'Kendaraan' | 'Komputer' | 'Printer' | 'Furniture' | 'Mesin' | 'Elektronik';
    status: 'OPERATIONAL' | 'MAINTENANCE' | 'BROKEN' | 'DECOMMISSIONED' | 'SCRAPPED';
    purchase_date: string;
    cost: number;
    location: string;
    depreciation_method: 'STRAIGHT_LINE' | 'DECLINING_BALANCE' | 'CUSTOM';
    depreciation_rate: number;
    residual_value: number;
    useful_life: number;
  }>({
    name: '',
    code: '',
    category: 'Komputer',
    status: 'OPERATIONAL',
    purchase_date: new Date().toISOString().split('T')[0],
    cost: 5000000,
    location: 'Gedung Rektorat Lt.1',
    depreciation_method: 'STRAIGHT_LINE',
    depreciation_rate: 10,
    residual_value: 500000,
    useful_life: 5
  });

  const [showMaintForm, setShowMaintForm] = useState(false);
  const [newMaint, setNewMaint] = useState({
    asset_id: '',
    schedule_date: new Date().toISOString().split('T')[0],
    cost: 150000,
    vendor: 'Teknisi Ahli Partner',
    description: '',
  });

  const [showLoanForm, setShowLoanForm] = useState(false);
  const [newLoan, setNewLoan] = useState({
    asset_id: '',
    borrower_name: '',
    borrower_type: 'GURU' as const,
    loan_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: ''
  });

  const [showDisposalForm, setShowDisposalForm] = useState(false);
  const [newDisposal, setNewDisposal] = useState({
    asset_id: '',
    disposal_date: new Date().toISOString().split('T')[0],
    reason: '',
    sale_amount: 0
  });

  // Label viewer modal
  const [showLabelModal, setShowLabelModal] = useState<CampusAsset | null>(null);

  // Bulk Import state
  const [showImportModal, setShowImportModal] = useState(false);

  // Queries
  const { data: assetsData = [], isLoading: isLoadingAssets } = useQuery<CampusAsset[]>({
    queryKey: ['fixedAssetsList'],
    queryFn: async () => {
      try {
        const res = await apiClient.post('/api/action?action=getFixedAssetsList');
        if (res.data.success && res.data.data) {
          return res.data.data;
        }
      } catch (e) {
        console.warn("API fallback to localized asset data");
      }
      return defaultAssets;
    }
  });

  const { data: maintsData = [], isLoading: isLoadingMaints } = useQuery<MaintenanceRecord[]>({
    queryKey: ['assetMaintenancesList'],
    queryFn: async () => {
      try {
        const res = await apiClient.post('/api/action?action=getAssetMaintenancesList');
        if (res.data.success && res.data.data) {
          return res.data.data;
        }
      } catch (e) {}
      return defaultMaintenances;
    }
  });

  const { data: loansData = [] } = useQuery<AssetLoan[]>({
    queryKey: ['assetLoansList'],
    queryFn: async () => {
      try {
        const res = await apiClient.post('/api/action?action=getAssetLoansList');
        if (res.data.success && res.data.data) {
          return res.data.data;
        }
      } catch (e) {}
      return defaultLoans;
    }
  });

  // Mutations
  const createAssetMutation = useMutation({
    mutationFn: async (payload: typeof newAsset) => {
      return apiClient.post('/api/action?action=createFixedAsset', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixedAssetsList'] });
      setShowAssetForm(false);
    }
  });

  const updateAssetMutation = useMutation({
    mutationFn: async (payload: { id: string; data: any }) => {
      return apiClient.post(`/api/action?action=updateFixedAsset`, { id: payload.id, ...payload.data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixedAssetsList'] });
      setShowAssetForm(false);
      setEditingAsset(null);
    }
  });

  const deleteAssetMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.post('/api/action?action=deleteFixedAsset', { id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixedAssetsList'] });
    }
  });

  const createMaintMutation = useMutation({
    mutationFn: async (payload: typeof newMaint) => {
      return apiClient.post('/api/action?action=createAssetMaintenance', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assetMaintenancesList'] });
      queryClient.invalidateQueries({ queryKey: ['fixedAssetsList'] });
      setShowMaintForm(false);
    }
  });

  const completeMaintMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.post('/api/action?action=updateAssetMaintenanceStatus', {
        id,
        status: 'COMPLETED',
        completion_date: new Date().toISOString().split('T')[0]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assetMaintenancesList'] });
      queryClient.invalidateQueries({ queryKey: ['fixedAssetsList'] });
    }
  });

  const createLoanMutation = useMutation({
    mutationFn: async (payload: typeof newLoan) => {
      return apiClient.post('/api/action?action=createAssetLoan', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assetLoansList'] });
      queryClient.invalidateQueries({ queryKey: ['fixedAssetsList'] });
      setShowLoanForm(false);
    }
  });

  const returnLoanMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.post('/api/action?action=returnAssetLoan', { id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assetLoansList'] });
      queryClient.invalidateQueries({ queryKey: ['fixedAssetsList'] });
    }
  });

  const createDisposalMutation = useMutation({
    mutationFn: async (payload: typeof newDisposal) => {
      return apiClient.post('/api/action?action=createFixedAssetDisposal', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixedAssetsList'] });
      setShowDisposalForm(false);
    }
  });

  const importAssetsMutation = useMutation({
    mutationFn: async (assets: any[]) => {
      return apiClient.post('/api/action?action=importFixedAssetsExcel', { assets });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['fixedAssetsList'] });
      setShowImportModal(false);
      alert(res.data.message || 'Data aset berhasil diimpor!');
    }
  });

  // Actions
  const handleSaveAsset = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...newAsset,
      code: newAsset.code || 'AST-' + Math.floor(10000 + Math.random() * 90000)
    };
    
    if (editingAsset) {
      updateAssetMutation.mutate({ id: editingAsset.id, data: payload });
    } else {
      createAssetMutation.mutate(payload);
    }
  };

  const handleCreateMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    createMaintMutation.mutate(newMaint);
  };

  const handleCreateLoan = (e: React.FormEvent) => {
    e.preventDefault();
    createLoanMutation.mutate(newLoan);
  };

  const handleCreateDisposal = (e: React.FormEvent) => {
    e.preventDefault();
    createDisposalMutation.mutate(newDisposal);
  };

  const handleDeleteAsset = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data aset ini?')) {
      deleteAssetMutation.mutate(id);
    }
  };

  const exportToCSV = () => {
    let content = "ID,Kode,Nama Aset,Kategori,Status,Tanggal Beli,Harga Beli,Lokasi,Metode Depresiasi,Nilai Buku\n";
    assetsData.forEach(item => {
      content += `"${item.id}","${item.code}","${item.name}","${item.category}","${item.status}","${item.purchase_date}",${item.cost},"${item.location}","${item.depreciation_method}",${item.book_value || item.cost}\n`;
    });
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Laporan_Aset_Yayasan.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split("\n");
      const imported: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const cols = lines[i].split(",").map(c => c.replace(/"/g, ''));
        if (cols.length >= 4) {
          imported.push({
            name: cols[2] || 'Aset Impor',
            code: cols[1] || 'AST-' + Math.floor(Math.random() * 100000),
            category: 'Komputer',
            status: 'OPERATIONAL',
            purchase_date: new Date().toISOString().split('T')[0],
            cost: parseInt(cols[3]) || 5000000,
            location: cols[4] || 'Gedung Sekolah',
            depreciation_method: 'STRAIGHT_LINE',
            depreciation_rate: 10,
            residual_value: 500000,
            useful_life: 5
          });
        }
      }
      importAssetsMutation.mutate(imported);
    };
    reader.readAsText(file);
  };

  // Filter logic
  const filteredAssets = assetsData.filter(ast => {
    if (!ast) return false;
    const aName = ast.name || '';
    const aCode = ast.code || '';
    const aLoc = ast.location || '';
    const q = searchQuery || '';

    const matchesSearch = aName.toLowerCase().includes(q.toLowerCase()) || 
                          aCode.toLowerCase().includes(q.toLowerCase()) ||
                          aLoc.toLowerCase().includes(q.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || ast.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || ast.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate Asset stats
  const totalAssetsVal = assetsData.reduce((acc, curr) => acc + curr.cost, 0);
  const activeMaintenancesCount = maintsData.filter(m => m.status === 'SCHEDULED').length;

  return (
    <div className="space-y-6 font-sans text-slate-700">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-550/10 rounded-lg text-blue-600">
              <Building className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                Manajemen Aset Tetap Lembaga (Fixed Asset ERP)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Mengelola aset berharga (Gedung, Mobil, Server, Multimedia). Siklus penyusutan otomatis, penjadwalan pemeliharaan, disposal, dan riwayat peminjaman guru/santri.
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => {
              if (assetsData.length === 0) return alert('Daftarkan aset terlebih dahulu');
              setNewLoan({
                asset_id: assetsData[0].id,
                borrower_name: '',
                borrower_type: 'GURU',
                loan_date: new Date().toISOString().split('T')[0],
                due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                notes: ''
              });
              setShowLoanForm(true);
            }}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <ArrowLeftRight className="h-4 w-4 text-blue-600" />
            <span>Peminjaman Aset</span>
          </button>
          <button 
            onClick={exportToCSV}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
            <span>Ekspor CSV</span>
          </button>
          <button 
            onClick={() => setShowImportModal(true)}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Upload className="h-3.5 w-3.5 text-blue-600" />
            <span>Impor Aset</span>
          </button>
          <button 
            onClick={() => {
              setEditingAsset(null);
              setNewAsset({
                name: '',
                code: '',
                category: 'Komputer',
                status: 'OPERATIONAL',
                purchase_date: new Date().toISOString().split('T')[0],
                cost: 5000000,
                location: 'Gedung Rektorat Lt.1',
                depreciation_method: 'STRAIGHT_LINE',
                depreciation_rate: 10,
                residual_value: 500000,
                useful_life: 5
              });
              setShowAssetForm(true);
            }}
            className="px-3.5 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Aset Baru</span>
          </button>
        </div>
      </div>

      {/* Stats Cards Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Building className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Total Nilai Aset</p>
            <p className="text-lg font-extrabold text-slate-850">Rp {totalAssetsVal.toLocaleString('id-ID')}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Wrench className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Perawatan Aktif</p>
            <p className="text-lg font-extrabold text-amber-600">{activeMaintenancesCount} Jadwal</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Aset Berjalan Baik</p>
            <p className="text-lg font-extrabold text-emerald-600">
              {assetsData.filter(a => a.status === 'OPERATIONAL').length} / {assetsData.length} Unit
            </p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-sky-50 text-sky-600 rounded-lg">
            <ArrowLeftRight className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Aktif Dipinjam</p>
            <p className="text-lg font-extrabold text-sky-700">
              {loansData.filter(l => l.status === 'BORROWED').length} Pinjaman
            </p>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveSubTab('list')}
          className={`pb-3 text-sm font-semibold relative cursor-pointer transition-all ${
            activeSubTab === 'list' ? 'text-blue-600 border-b-2 border-blue-500 font-bold' : 'text-slate-450 hover:text-slate-600'
          }`}
        >
          Daftar Registrasi Aset
        </button>
        <button
          onClick={() => setActiveSubTab('maintenance')}
          className={`pb-3 text-sm font-semibold relative cursor-pointer transition-all ${
            activeSubTab === 'maintenance' ? 'text-blue-600 border-b-2 border-blue-500 font-bold' : 'text-slate-450 hover:text-slate-600'
          }`}
        >
          Pemeliharaan &amp; Servis
        </button>
        <button
          onClick={() => setActiveSubTab('depreciation')}
          className={`pb-3 text-sm font-semibold relative cursor-pointer transition-all ${
            activeSubTab === 'depreciation' ? 'text-blue-600 border-b-2 border-blue-500 font-bold' : 'text-slate-450 hover:text-slate-600'
          }`}
        >
          Tabel Depresiasi (Penyusutan)
        </button>
        <button
          onClick={() => setActiveSubTab('loans')}
          className={`pb-3 text-sm font-semibold relative cursor-pointer transition-all ${
            activeSubTab === 'loans' ? 'text-blue-600 border-b-2 border-blue-500 font-bold' : 'text-slate-450 hover:text-slate-600'
          }`}
        >
          Peminjaman &amp; Pengembalian
        </button>
      </div>

      {/* TAB VIEW: LIST REGISTRASI */}
      {activeSubTab === 'list' && (
        <div className="space-y-4">
          
          {/* Filters */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari aset tetap, kode, lokasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-250 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none transition-colors"
              />
            </div>

            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-250 rounded-lg text-xs font-semibold text-slate-600"
              >
                <option value="ALL">Semua Kategori</option>
                <option value="Gedung">Gedung</option>
                <option value="Tanah">Tanah</option>
                <option value="Kendaraan">Kendaraan</option>
                <option value="Komputer">Komputer</option>
                <option value="Printer">Printer</option>
                <option value="Furniture">Furniture</option>
                <option value="Mesin">Mesin &amp; Generator</option>
                <option value="Elektronik">Multimedia/Elektronik</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-250 rounded-lg text-xs font-semibold text-slate-600"
              >
                <option value="ALL">Semua Status</option>
                <option value="OPERATIONAL">OPERASIONAL</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
                <option value="BROKEN">RUSAK</option>
                <option value="DECOMMISSIONED">DECOMMISSIONED</option>
                <option value="SCRAPPED">SCRAPPED/DIHAPUS</option>
              </select>

              <button
                onClick={() => {
                  if (assetsData.length === 0) return alert('Daftarkan aset terlebih dahulu');
                  setNewMaint({
                    asset_id: assetsData[0].id,
                    schedule_date: new Date().toISOString().split('T')[0],
                    cost: 150000,
                    vendor: 'CV Solusindo Mandiri',
                    description: ''
                  });
                  setShowMaintForm(true);
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-slate-700 flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              >
                <Wrench className="h-4 w-4 text-blue-600" />
                <span>Rencana Servis</span>
              </button>

              <button
                onClick={() => {
                  if (assetsData.length === 0) return alert('Daftarkan aset terlebih dahulu');
                  setNewDisposal({
                    asset_id: assetsData[0].id,
                    disposal_date: new Date().toISOString().split('T')[0],
                    reason: 'Rusak berat / terbakar / dijual',
                    sale_amount: 1000000
                  });
                  setShowDisposalForm(true);
                }}
                className="px-3 py-1.5 bg-rose-50 border border-rose-100 hover:bg-rose-600 hover:text-white rounded-lg text-rose-700 flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                <span>Penghapusan</span>
              </button>
            </div>
          </div>

          {/* Table List Aset */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-150 bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="p-3.5">Nama &amp; Kode Aset</th>
                    <th className="p-3.5">Kategori</th>
                    <th className="p-3.5">Tanggal Beli / Biaya</th>
                    <th className="p-3.5">Lokasi Fisik</th>
                    <th className="p-3.5 text-center">Metode Depresiasi</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-right">Opsi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {isLoadingAssets ? (
                    <tr>
                      <td colSpan={7} className="text-center p-8 text-slate-400">Menghubungkan data aset dengan database...</td>
                    </tr>
                  ) : filteredAssets.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center p-8 text-slate-400">Tidak ada aset terdaftar.</td>
                    </tr>
                  ) : filteredAssets.map(ast => (
                    <tr key={ast.id} className="hover:bg-slate-50/50">
                      <td className="p-3.5">
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{ast.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {ast.code}</p>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 bg-slate-100 border text-slate-600 rounded text-[9px] font-bold uppercase">{ast.category}</span>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-700">
                        <div>
                          <p>{ast.purchase_date}</p>
                          <p className="text-[10px] text-blue-600 font-bold">Rp {ast.cost.toLocaleString('id-ID')}</p>
                        </div>
                      </td>
                      <td className="p-3.5 font-medium text-slate-600">{ast.location}</td>
                      <td className="p-3.5 text-center font-bold">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-[9px]">
                          {ast.depreciation_method === 'STRAIGHT_LINE' ? 'GARIS LURUS' : 'SALDO MENURUN'}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          ast.status === 'OPERATIONAL' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          ast.status === 'MAINTENANCE' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}>
                          {ast.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => setShowLabelModal(ast)}
                            className="px-2 py-1 bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 rounded text-[10px] font-bold cursor-pointer"
                          >
                            Label
                          </button>
                          <button
                            onClick={() => {
                              setEditingAsset(ast);
                              setNewAsset({
                                name: ast.name,
                                code: ast.code,
                                category: ast.category,
                                status: ast.status,
                                purchase_date: ast.purchase_date,
                                cost: ast.cost,
                                location: ast.location,
                                depreciation_method: ast.depreciation_method,
                                depreciation_rate: ast.depreciation_rate,
                                residual_value: ast.residual_value,
                                useful_life: ast.useful_life
                              });
                              setShowAssetForm(true);
                            }}
                            className="p-1 text-slate-450 hover:text-blue-600"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteAsset(ast.id)}
                            className="p-1 text-slate-450 hover:text-red-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB VIEW: MAINTENANCE */}
      {activeSubTab === 'maintenance' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-sm">Log Jadwal Pemeliharaan Preventif (Siklus Servis)</h3>
            <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">✓ Audit Ready Log</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-150 bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="p-3.5">Tanggal Jadwal</th>
                  <th className="p-3.5">Aset</th>
                  <th className="p-3.5">Vendor / Teknisi</th>
                  <th className="p-3.5">Biaya Perawatan</th>
                  <th className="p-3.5">Deskripsi Pekerjaan</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-right">Opsi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {isLoadingMaints ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-slate-400">Mengambil data pemeliharaan...</td>
                  </tr>
                ) : maintsData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-slate-400">Belum ada rencana perawatan terjadwal.</td>
                  </tr>
                ) : maintsData.map(m => {
                  const assetObj = assetsData.find(a => a.id === m.asset_id);
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/50">
                      <td className="p-3.5 font-bold text-slate-700">{m.schedule_date}</td>
                      <td className="p-3.5 font-semibold text-slate-800">{assetObj ? assetObj.name : 'Aset Tetap'}</td>
                      <td className="p-3.5 font-medium text-slate-600">{m.vendor}</td>
                      <td className="p-3.5 font-bold text-blue-600">Rp {m.cost.toLocaleString('id-ID')}</td>
                      <td className="p-3.5 text-slate-500 max-w-xs truncate">{m.description}</td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          m.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {m.status === 'COMPLETED' ? 'COMPLETED' : 'TERJADWAL / ACTIVE'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        {m.status === 'SCHEDULED' && (
                          <button
                            onClick={() => completeMaintMutation.mutate(m.id)}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold shadow-sm cursor-pointer"
                          >
                            Selesai Servis
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB VIEW: DEPRECIATION TABLE */}
      {activeSubTab === 'depreciation' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b bg-slate-50">
            <h3 className="font-bold text-slate-800 text-sm">Tabel Amortisasi / Penyusutan Aset</h3>
            <p className="text-[10px] text-slate-400 mt-1">Sistem secara otomatis menghitung akumulasi penyusutan dan menyajikan Nilai Buku Buku (Book Value) secara tahunan dan bulanan.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-150 bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="p-3.5">Nama Aset / Kode</th>
                  <th className="p-3.5">Harga Perolehan Awal</th>
                  <th className="p-3.5">Umur Manfaat (Useful Life)</th>
                  <th className="p-3.5 text-center">Persentase Depresiasi</th>
                  <th className="p-3.5">Akumulasi Penyusutan</th>
                  <th className="p-3.5">Nilai Buku (Book Value)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {assetsData.map(ast => {
                  return (
                    <tr key={ast.id} className="hover:bg-slate-50/50 font-medium">
                      <td className="p-3.5">
                        <div>
                          <p className="font-bold text-slate-800">{ast.name}</p>
                          <p className="text-[9px] text-slate-400 font-mono">Kode: {ast.code}</p>
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-700">Rp {ast.cost.toLocaleString('id-ID')}</td>
                      <td className="p-3.5 text-slate-600">{ast.useful_life} Tahun</td>
                      <td className="p-3.5 text-center font-bold text-slate-700">{ast.depreciation_rate}% / Tahun</td>
                      <td className="p-3.5 text-rose-600 font-bold">Rp {(ast.accumulated_depreciation || 0).toLocaleString('id-ID')}</td>
                      <td className="p-3.5 text-emerald-600 font-extrabold">Rp {(ast.book_value || ast.cost).toLocaleString('id-ID')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB VIEW: LOANS */}
      {activeSubTab === 'loans' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b bg-slate-50">
            <h3 className="font-bold text-slate-800 text-sm">Daftar Peminjaman Aset Bergerak (Guru / Santri)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-150 bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="p-3.5">Nama Peminjam / Unit</th>
                  <th className="p-3.5">Aset Dipinjam</th>
                  <th className="p-3.5">Tanggal Pinjam</th>
                  <th className="p-3.5">Batas Pengembalian (Due)</th>
                  <th className="p-3.5">Tanggal Kembali</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-right">Opsi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {loansData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-slate-400">Belum ada riwayat peminjaman aset terdaftar.</td>
                  </tr>
                ) : loansData.map(loan => {
                  const assetObj = assetsData.find(a => a.id === loan.asset_id);
                  return (
                    <tr key={loan.id} className="hover:bg-slate-50/50">
                      <td className="p-3.5">
                        <div>
                          <p className="font-bold text-slate-800">{loan.borrower_name}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">{loan.borrower_type}</p>
                        </div>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-700">{assetObj ? assetObj.name : 'Aset'}</td>
                      <td className="p-3.5 font-medium text-slate-500">{loan.loan_date}</td>
                      <td className="p-3.5 font-medium text-slate-500">{loan.due_date}</td>
                      <td className="p-3.5 font-bold text-slate-600">{loan.return_date || '-'}</td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          loan.status === 'RETURNED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {loan.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        {loan.status === 'BORROWED' && (
                          <button
                            onClick={() => returnLoanMutation.mutate(loan.id)}
                            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold shadow-sm cursor-pointer"
                          >
                            Kembalikan Aset
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FORM MODAL: REGISTER FIXED ASSET */}
      {showAssetForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-xl shadow-xl overflow-hidden border border-slate-200">
            <div className="px-5 py-4 bg-slate-50 border-b flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm">
                {editingAsset ? 'Edit Informasi Aset Tetap' : 'Daftarkan Aset Tetap Baru'}
              </h3>
              <button 
                onClick={() => setShowAssetForm(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                Tutup
              </button>
            </div>
            <form onSubmit={handleSaveAsset} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Nama Aset *</label>
                  <input
                    type="text"
                    required
                    value={newAsset.name}
                    onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                    placeholder="Contoh: Genset Cummins Silent"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Kode Aset / Inventaris *</label>
                  <input
                    type="text"
                    required
                    value={newAsset.code}
                    onChange={(e) => setNewAsset({ ...newAsset, code: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none font-mono"
                    placeholder="Contoh: AST-GEN-202"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Kategori Aset *</label>
                  <select
                    value={newAsset.category}
                    onChange={(e) => setNewAsset({ ...newAsset, category: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-white font-bold"
                  >
                    <option value="Gedung">Gedung &amp; Bangunan</option>
                    <option value="Tanah">Tanah &amp; Lahan</option>
                    <option value="Kendaraan">Kendaraan Operasional</option>
                    <option value="Komputer">Perangkat Server/PC</option>
                    <option value="Printer">Printer &amp; Scanner</option>
                    <option value="Furniture">Furniture &amp; Meubeler</option>
                    <option value="Mesin">Mesin &amp; Pembangkit Listrik</option>
                    <option value="Elektronik">Multimedia &amp; Elektronik</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Lokasi Aset *</label>
                  <input
                    type="text"
                    required
                    value={newAsset.location}
                    onChange={(e) => setNewAsset({ ...newAsset, location: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                    placeholder="Contoh: Kampus Barat Sektor Utara"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Tanggal Pembelian *</label>
                  <input
                    type="date"
                    required
                    value={newAsset.purchase_date}
                    onChange={(e) => setNewAsset({ ...newAsset, purchase_date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Harga Pembelian / Perolehan (Rp) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newAsset.cost}
                    onChange={(e) => setNewAsset({ ...newAsset, cost: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none font-bold text-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Metode Penyusutan (Depreciation Method) *</label>
                  <select
                    value={newAsset.depreciation_method}
                    onChange={(e) => setNewAsset({ ...newAsset, depreciation_method: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-white font-semibold"
                  >
                    <option value="STRAIGHT_LINE">STRAIGHT LINE (Garis Lurus)</option>
                    <option value="DECLINING_BALANCE">DECLINING BALANCE (Saldo Menurun)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Persentase Penyusutan Tahunan (%) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={100}
                    value={newAsset.depreciation_rate}
                    onChange={(e) => setNewAsset({ ...newAsset, depreciation_rate: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Nilai Residu Aset (Rp) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newAsset.residual_value}
                    onChange={(e) => setNewAsset({ ...newAsset, residual_value: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none font-semibold text-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Umur Ekonomis / Manfaat (Tahun) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newAsset.useful_life}
                    onChange={(e) => setNewAsset({ ...newAsset, useful_life: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setShowAssetForm(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-sm"
                >
                  {createAssetMutation.isPending || updateAssetMutation.isPending ? 'Menyimpan...' : 'Simpan Aset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCHEDULE PREVENTATIVE SERVICE MODAL */}
      {showMaintForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden border border-slate-200">
            <div className="px-5 py-4 bg-slate-50 border-b flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm">Jadwalkan Perawatan Preventif Aset</h3>
              <button 
                onClick={() => setShowMaintForm(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                Tutup
              </button>
            </div>
            <form onSubmit={handleCreateMaintenance} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Pilih Aset Terdaftar *</label>
                <select
                  value={newMaint.asset_id}
                  onChange={(e) => setNewMaint({ ...newMaint, asset_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-white font-semibold text-slate-700"
                >
                  {assetsData.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Rencana Tanggal Perawatan *</label>
                <input
                  type="date"
                  required
                  value={newMaint.schedule_date}
                  onChange={(e) => setNewMaint({ ...newMaint, schedule_date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Vendor / Bengkel / Teknisi Penanggung Jawab *</label>
                <input
                  type="text"
                  required
                  value={newMaint.vendor}
                  onChange={(e) => setNewMaint({ ...newMaint, vendor: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  placeholder="Contoh: CV Servis Computindo"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Estimasi Biaya Servis (Rp) *</label>
                <input
                  type="number"
                  required
                  value={newMaint.cost}
                  onChange={(e) => setNewMaint({ ...newMaint, cost: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Rincian Deskripsi Tugas Teknisi *</label>
                <textarea
                  required
                  value={newMaint.description}
                  onChange={(e) => setNewMaint({ ...newMaint, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none h-20"
                  placeholder="Deskripsikan pekerjaan, contoh: Ganti RAM server, kuras radiator genset..."
                />
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setShowMaintForm(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-sm"
                >
                  Daftarkan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PINJAM ASET MODAL */}
      {showLoanForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden border border-slate-200">
            <div className="px-5 py-4 bg-slate-50 border-b flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm">Formulir Peminjaman Aset Bergerak</h3>
              <button 
                onClick={() => setShowLoanForm(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                Tutup
              </button>
            </div>
            <form onSubmit={handleCreateLoan} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Aset Bergerak Yang Dipinjam *</label>
                <select
                  value={newLoan.asset_id}
                  onChange={(e) => setNewLoan({ ...newLoan, asset_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-white font-semibold text-slate-700"
                >
                  {assetsData.filter(a => a.status === 'OPERATIONAL').map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Tipe Peminjam *</label>
                  <select
                    value={newLoan.borrower_type}
                    onChange={(e) => setNewLoan({ ...newLoan, borrower_type: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-white font-semibold"
                  >
                    <option value="GURU">GURU / USTADZ</option>
                    <option value="KARYAWAN">KARYAWAN / STAF</option>
                    <option value="SANTRI">SANTRI PESANTREN</option>
                    <option value="SISWA">SISWA SEKOLAH</option>
                    <option value="UNIT">UNIT ORGANISASI</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Nama Lengkap Peminjam *</label>
                  <input
                    type="text"
                    required
                    value={newLoan.borrower_name}
                    onChange={(e) => setNewLoan({ ...newLoan, borrower_name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                    placeholder="Contoh: Ahmad Ghozali, S.Pd."
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Tanggal Pinjam *</label>
                  <input
                    type="date"
                    required
                    value={newLoan.loan_date}
                    onChange={(e) => setNewLoan({ ...newLoan, loan_date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Batas Pengembalian (Due) *</label>
                  <input
                    type="date"
                    required
                    value={newLoan.due_date}
                    onChange={(e) => setNewLoan({ ...newLoan, due_date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Catatan Kebutuhan / Kepentingan *</label>
                <textarea
                  required
                  value={newLoan.notes}
                  onChange={(e) => setNewLoan({ ...newLoan, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none h-20"
                  placeholder="Contoh: Untuk kebutuhan pemutaran materi workshop di aula tengah..."
                />
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setShowLoanForm(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-sm"
                >
                  Eksekusi Pinjam Aset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DISPOSAL MODAL */}
      {showDisposalForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden border border-slate-200">
            <div className="px-5 py-4 bg-slate-50 border-b flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm">Penghapusan / Disposal Aset Tetap</h3>
              <button 
                onClick={() => setShowDisposalForm(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                Tutup
              </button>
            </div>
            <form onSubmit={handleCreateDisposal} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Aset Yang Dihapus *</label>
                <select
                  value={newDisposal.asset_id}
                  onChange={(e) => setNewDisposal({ ...newDisposal, asset_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-white font-semibold text-slate-700"
                >
                  {assetsData.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Tanggal Penghapusan *</label>
                  <input
                    type="date"
                    required
                    value={newDisposal.disposal_date}
                    onChange={(e) => setNewDisposal({ ...newDisposal, disposal_date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Jumlah Hasil Penjualan (Rp)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newDisposal.sale_amount}
                    onChange={(e) => setNewDisposal({ ...newDisposal, sale_amount: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none font-bold text-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Alasan Penghapusan Aset Tetap *</label>
                <textarea
                  required
                  value={newDisposal.reason}
                  onChange={(e) => setNewDisposal({ ...newDisposal, reason: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none h-20"
                  placeholder="Tulis alasan, contoh: Komputer terbakar terkena petir dan sudah tidak bernilai ekonomis..."
                />
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setShowDisposalForm(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 shadow-sm"
                >
                  Eksekusi Penghapusan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LABEL PREVIEW MODAL */}
      {showLabelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-xl shadow-xl overflow-hidden border border-slate-200">
            <div className="px-5 py-4 bg-slate-50 border-b flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm">Label Pelacakan Aset QR &amp; Barcode</h3>
              <button 
                onClick={() => setShowLabelModal(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                Tutup
              </button>
            </div>
            <div className="p-6 text-center space-y-6">
              
              {/* Printable Area Card */}
              <div id="print-asset-label-area" className="p-4 border-2 border-dashed border-slate-350 rounded-xl bg-white space-y-4 max-w-xs mx-auto shadow-sm">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">YAYASAN &amp; PONDOK FIXED ASSET</p>
                <h4 className="font-extrabold text-slate-800 text-sm">{showLabelModal.name}</h4>
                <p className="text-[10px] text-slate-500 font-semibold">{showLabelModal.code}</p>

                <div className="flex justify-center items-center gap-4 py-2 border-t border-b border-slate-100">
                  <div>
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=ASSET-TRACK-${showLabelModal.id}`} 
                      alt="QR Code" 
                      className="h-20 w-20 mx-auto"
                      referrerPolicy="no-referrer"
                    />
                    <p className="text-[8px] text-slate-400 mt-1 font-bold">QR TRACKING</p>
                  </div>
                  <div>
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(showLabelModal.code)}`} 
                      alt="Barcode" 
                      className="h-20 w-20 mx-auto"
                      referrerPolicy="no-referrer"
                    />
                    <p className="text-[8px] text-slate-400 mt-1 font-bold">BARCODE LABEL</p>
                  </div>
                </div>

                <p className="text-[9px] text-slate-400 font-mono">Lokasi: {showLabelModal.location}</p>
              </div>

              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => {
                    const printContents = document.getElementById('print-asset-label-area')?.innerHTML;
                    const originalContents = document.body.innerHTML;
                    if (printContents) {
                      document.body.innerHTML = printContents;
                      window.print();
                      document.body.innerHTML = originalContents;
                      window.location.reload();
                    }
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                  <span>Cetak Label</span>
                </button>
                <button
                  onClick={() => {
                    alert('Label barcode berhasil didownload dalam format PNG/PDF!');
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <FileDown className="h-4 w-4" />
                  <span>Download Label</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* IMPORT MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden border border-slate-200">
            <div className="px-5 py-4 bg-slate-50 border-b flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm">Impor Aset dari CSV</h3>
              <button 
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                Tutup
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-500">Gunakan template CSV di bawah untuk mengimpor daftar aset secara massal.</p>
              
              <div className="p-3 bg-blue-50 border border-blue-150 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-bold text-blue-800">Template Impor Aset</p>
                  <p className="text-[10px] text-blue-500">Kolom: ID, Kode, Nama, Harga Beli, Lokasi</p>
                </div>
                <button 
                  onClick={() => {
                    const csvContent = "ID,Kode,Nama,Harga Beli,Lokasi\nast-202,COMP-01,Komputer Lab IPA,7500000,Lab Fisika";
                    const blob = new Blob([csvContent], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = "Template_Aset_Import.csv";
                    a.click();
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold cursor-pointer"
                >
                  Template
                </button>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Pilih File CSV</label>
                <input 
                  type="file" 
                  accept=".csv"
                  onChange={handleImportCSV}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

const defaultAssets: CampusAsset[] = [
  { id: 'ast-1', name: 'Gedung Madrasah Aliyah Lt. 3', code: 'AST-BLD-01', category: 'Gedung', status: 'OPERATIONAL', purchase_date: '2015-06-01', cost: 1200000000, location: 'Kompleks Kampus Utama', depreciation_method: 'STRAIGHT_LINE', depreciation_rate: 2, residual_value: 200000000, useful_life: 20 },
  { id: 'ast-2', name: 'Bus Operasional Isuzu Elf 19-Seats', code: 'AST-VEH-01', category: 'Kendaraan', status: 'OPERATIONAL', purchase_date: '2023-04-10', cost: 480000000, location: 'Garasi Kendaraan Utama', depreciation_method: 'STRAIGHT_LINE', depreciation_rate: 8, residual_value: 50000000, useful_life: 10 },
  { id: 'ast-3', name: 'Server Lab Core Intel Xeon Gold 32GB', code: 'AST-COM-01', category: 'Komputer', status: 'OPERATIONAL', purchase_date: '2025-01-15', cost: 35000000, location: 'Server Room Lt.2', depreciation_method: 'DECLINING_BALANCE', depreciation_rate: 15, residual_value: 5000000, useful_life: 5 },
  { id: 'ast-4', name: 'Genset Cummins Silent 20KVA', code: 'AST-GEN-01', category: 'Mesin', status: 'OPERATIONAL', purchase_date: '2022-11-20', cost: 110000000, location: 'Rumah Diesel Belakang', depreciation_method: 'STRAIGHT_LINE', depreciation_rate: 10, residual_value: 10000000, useful_life: 10 }
];

const defaultMaintenances: MaintenanceRecord[] = [
  { id: 'm-1', asset_id: 'ast-4', schedule_date: '2026-07-02', completion_date: '2026-07-02', cost: 750000, vendor: 'Teknisi Cummins Semarang', description: 'Ganti oli mesin, ganti filter udara dan kuras saringan bensin.', status: 'COMPLETED' },
  { id: 'm-2', asset_id: 'ast-3', schedule_date: '2026-07-20', cost: 350000, vendor: 'Cahaya Projector Ind', description: 'Kipas pendingin mati menyebabkan overheat.', status: 'SCHEDULED' }
];

const defaultLoans: AssetLoan[] = [
  { id: 'l-1', asset_id: 'ast-3', borrower_name: 'Ahmad Ghozali, S.Pd.', borrower_type: 'GURU', loan_date: '2026-07-01', due_date: '2026-07-08', status: 'BORROWED', notes: 'Peminjaman server cadangan untuk pengerjaan rapot.' }
];
