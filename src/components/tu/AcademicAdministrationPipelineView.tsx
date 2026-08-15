import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  ListChecks, 
  ShieldCheck, 
  FileSpreadsheet, 
  Download, 
  RefreshCw, 
  ArrowRight, 
  Check, 
  FileText,
  UserCheck,
  Building2,
  Calendar,
  Layers,
  BookOpen,
  Send,
  Award,
  Archive,
  Search,
  Filter
} from 'lucide-react';

interface AcademicAdministrationPipelineViewProps {
  getAuthHeaders: () => { Authorization: string };
  simulatedRole?: string;
}

export default function AcademicAdministrationPipelineView({ getAuthHeaders, simulatedRole = 'TU' }: AcademicAdministrationPipelineViewProps) {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'checklist' | 'validation' | 'report'>('pipeline');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 1. Fetch Workflow Pipeline
  const { data: workflowSteps = [], refetch: refetchWorkflow } = useQuery({
    queryKey: ['academicWorkflowPipeline'],
    queryFn: async () => {
      const res = await axios.post('/api/action?action=academicAdministrationWorkflowGet', {}, { headers: getAuthHeaders() });
      return res.data.data || [];
    }
  });

  // 2. Fetch Academic Checklist
  const { data: checklistItems = [], refetch: refetchChecklist } = useQuery({
    queryKey: ['academicChecklist'],
    queryFn: async () => {
      const res = await axios.post('/api/action?action=academicAdministrationChecklistGet', {}, { headers: getAuthHeaders() });
      return res.data.data || [];
    }
  });

  // 3. Fetch Validation Center
  const { data: validationData, refetch: refetchValidation } = useQuery({
    queryKey: ['validationCenter'],
    queryFn: async () => {
      const res = await axios.post('/api/action?action=validationCenterCheck', {}, { headers: getAuthHeaders() });
      return res.data.data || { rules: [] };
    }
  });

  // 4. Fetch Report Center
  const { data: reportData, refetch: refetchReports } = useQuery({
    queryKey: ['academicReportCenter'],
    queryFn: async () => {
      const res = await axios.post('/api/action?action=academicReportCenterGet', {}, { headers: getAuthHeaders() });
      return res.data.data || { reportsList: [], summaryMetrics: {} };
    }
  });

  // Mutation: Update Workflow Step
  const updateStepMutation = useMutation({
    mutationFn: async ({ step, status }: { step: number; status: string }) => {
      const res = await axios.post('/api/action?action=academicAdministrationWorkflowUpdate', { step, status }, { headers: getAuthHeaders() });
      return res.data;
    },
    onSuccess: () => {
      refetchWorkflow();
    }
  });

  // Mutation: Update Checklist Item
  const updateChecklistMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await axios.post('/api/action?action=academicAdministrationChecklistUpdate', { id, status }, { headers: getAuthHeaders() });
      return res.data;
    },
    onSuccess: () => {
      refetchChecklist();
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800"><CheckCircle2 className="w-3.5 h-3.5" /> Selesai</span>;
      case 'In Progress':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800"><Clock className="w-3.5 h-3.5" /> Berlangsung</span>;
      case 'Blocked':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800"><XCircle className="w-3.5 h-3.5" /> Terblokir</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600"><Clock className="w-3.5 h-3.5" /> Belum Mulai</span>;
    }
  };

  const completedChecklistCount = checklistItems.filter((i: any) => i.status === 'Completed').length;
  const progressPercentage = checklistItems.length ? Math.round((completedChecklistCount / checklistItems.length) * 100) : 0;

  const filteredChecklist = checklistItems.filter((i: any) => {
    const matchesCat = selectedCategory === 'ALL' || i.category === selectedCategory;
    const matchesQuery = !searchQuery || i.item.toLowerCase().includes(searchQuery.toLowerCase()) || i.pic.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleExportReport = (reportName: string, format: string) => {
    alert(`Mengekspor "${reportName}" dalam format ${format}... Dokumen siap diunduh.`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-blue-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full text-xs font-mono font-bold tracking-wide">
                TAHUN AJARAN 2026/2027 — SEMESTER GANJIL
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-xs font-mono font-bold">
                AKTIF
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Building2 className="h-7 w-7 text-blue-400" />
              Academic Administration Pipeline Engine
            </h2>
            <p className="text-xs text-blue-200/80 max-w-2xl mt-1">
              Pusat alur operasional administrasi akademik terpadu yang menghubungkan Siklus Tahun Ajaran, Rombel, Penugasan, SK, Surat Tugas, Surat Orang Tua, KBM, Absensi, Penilaian, Leger, Rapor, hingga Kearsipan Digital.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl flex items-center gap-4 min-w-[220px]">
            <div className="flex-1">
              <p className="text-[10px] text-blue-200 uppercase font-mono tracking-wider">Progress Administrasi</p>
              <p className="text-2xl font-black text-white">{progressPercentage}%</p>
              <div className="w-full bg-blue-950/60 rounded-full h-2 mt-1 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-400 to-emerald-400 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${progressPercentage}%` }} 
                />
              </div>
            </div>
            <button 
              onClick={() => { refetchWorkflow(); refetchChecklist(); refetchValidation(); refetchReports(); }}
              className="p-2.5 bg-white/10 hover:bg-white/20 rounded-lg text-white transition cursor-pointer"
              title="Refresh Engine"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation inside Pipeline */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/10 overflow-x-auto">
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'pipeline'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-white/10 text-blue-100 hover:bg-white/20'
            }`}
          >
            <Layers className="h-4 w-4" />
            Alur Alur Utama (15 Tahap)
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'checklist'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-white/10 text-blue-100 hover:bg-white/20'
            }`}
          >
            <ListChecks className="h-4 w-4" />
            Checklist Administrasi ({completedChecklistCount}/{checklistItems.length})
          </button>
          <button
            onClick={() => setActiveTab('validation')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'validation'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-white/10 text-blue-100 hover:bg-white/20'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            Validation Center (Backend Rules)
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'report'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-white/10 text-blue-100 hover:bg-white/20'
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Report Center & Export Rekap
          </button>
        </div>
      </div>

      {/* TAB 1: PIPELINE WORKFLOW */}
      {activeTab === 'pipeline' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Layers className="h-5 w-5 text-blue-600" />
                Matriks Tahapan Operasional Administrasi Akademik
              </h3>
              <p className="text-xs text-slate-500">
                15 Tahap Wajib Terintegrasi Otomatis dari Database Tanpa Redundansi Input Data.
              </p>
            </div>
            <span className="text-xs font-mono bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200">
              Role: {simulatedRole}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workflowSteps.map((stepItem: any) => (
              <div 
                key={stepItem.step}
                className={`p-4 rounded-xl border transition flex flex-col justify-between space-y-3 ${
                  stepItem.status === 'Completed' 
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : stepItem.status === 'In Progress'
                    ? 'bg-blue-50/50 border-blue-200 ring-2 ring-blue-500/20'
                    : 'bg-slate-50/60 border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-black font-mono px-2 py-0.5 bg-slate-900 text-white rounded">
                      STEP {String(stepItem.step).padStart(2, '0')}
                    </span>
                    {getStatusBadge(stepItem.status)}
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">{stepItem.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-mono">
                    <span className="text-slate-400">Prasyarat:</span> {stepItem.requirement}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-medium text-slate-500">
                    {stepItem.mandatory ? 'Wajib' : 'Opsional'}
                  </span>
                  
                  <div className="flex items-center gap-1">
                    {stepItem.status !== 'Completed' && (
                      <button
                        onClick={() => updateStepMutation.mutate({ step: stepItem.step, status: 'Completed' })}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[11px] transition cursor-pointer flex items-center gap-1"
                      >
                        <Check className="h-3 w-3" /> Tandai Selesai
                      </button>
                    )}
                    {stepItem.status === 'Completed' && (
                      <button
                        onClick={() => updateStepMutation.mutate({ step: stepItem.step, status: 'In Progress' })}
                        className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded text-[11px] transition cursor-pointer"
                      >
                        Revisi
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CHECKLIST ADMINISTRASI */}
      {activeTab === 'checklist' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-blue-600" />
                Academic Administration Checklist
              </h3>
              <p className="text-xs text-slate-500">
                Checklist kesiapan seluruh berkas & proses administrasi akademik per Tahun Ajaran.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari item checklist / PIC..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 font-bold focus:outline-none"
              >
                <option value="ALL">Semua Kategori</option>
                <option value="PERENCANAAN">Perencanaan</option>
                <option value="MASTER_DATA">Master Data</option>
                <option value="ROMBEL">Rombel</option>
                <option value="PENUGASAN">Penugasan</option>
                <option value="DOKUMEN_SK">Dokumen SK</option>
                <option value="KOMUNIKASI">Komunikasi</option>
                <option value="KBM">KBM</option>
                <option value="ABSENSI">Absensi</option>
                <option value="PENILAIAN">Penilaian</option>
                <option value="EVALUASI">Evaluasi</option>
                <option value="KARSIPAN">Kearsipan</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-y border-slate-200 font-mono">
                  <th className="p-3">Item Administrasi</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3">PIC Penanggung Jawab</th>
                  <th className="p-3">Status Checklist</th>
                  <th className="p-3">Terakhir Diperbarui</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredChecklist.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${item.status === 'Completed' ? 'bg-emerald-500' : item.status === 'In Progress' ? 'bg-blue-500' : 'bg-slate-300'}`} />
                      {item.item}
                    </td>
                    <td className="p-3">
                      <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-semibold">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-slate-700">{item.pic}</td>
                    <td className="p-3">{getStatusBadge(item.status)}</td>
                    <td className="p-3 text-slate-400 font-mono text-[11px]">
                      {new Date(item.updated_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="p-3 text-right">
                      <select
                        value={item.status}
                        onChange={(e) => updateChecklistMutation.mutate({ id: item.id, status: e.target.value })}
                        className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-800 font-semibold focus:outline-none cursor-pointer"
                      >
                        <option value="Not Started">Belum Mulai</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Blocked">Blocked</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: VALIDATION CENTER */}
      {activeTab === 'validation' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
                Backend Validation Center & Integrity Gatekeeper
              </h3>
              <p className="text-xs text-slate-500">
                Memastikan bahwa seluruh syarat prasyarat terpenuhi sebelum mengaktifkan modul berikutnya (Rombel, SK, Surat Tugas, Leger, Rapor).
              </p>
            </div>

            <button
              onClick={() => refetchValidation()}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer border border-blue-200"
            >
              <RefreshCw className="h-4 w-4" /> Run System Audit
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
              <p className="text-[10px] font-mono text-emerald-700 uppercase font-bold">Aturan Lolos (Passed)</p>
              <p className="text-3xl font-black text-emerald-800 mt-1">{validationData?.passedCount || 0}</p>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center">
              <p className="text-[10px] font-mono text-amber-700 uppercase font-bold">Peringatan (Warning)</p>
              <p className="text-3xl font-black text-amber-800 mt-1">{validationData?.warningCount || 0}</p>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-center">
              <p className="text-[10px] font-mono text-blue-700 uppercase font-bold">Informasi Progress</p>
              <p className="text-3xl font-black text-blue-800 mt-1">{validationData?.infoCount || 0}</p>
            </div>
          </div>

          <div className="space-y-3">
            {validationData?.rules?.map((rule: any) => (
              <div key={rule.code} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-slate-200 text-slate-800 rounded">
                      {rule.code}
                    </span>
                    {rule.status === 'PASSED' && <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> PASSED</span>}
                    {rule.status === 'WARNING' && <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs font-bold flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> WARNING</span>}
                    {rule.status === 'INFO' && <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-bold flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> IN PROGRESS</span>}
                    <h4 className="font-bold text-sm text-slate-900">{rule.title}</h4>
                  </div>

                  <p className="text-xs text-slate-600">{rule.details}</p>
                  <p className="text-[11px] text-blue-700 font-medium font-mono">
                    💡 Rekomendasi: {rule.recommendation}
                  </p>
                </div>

                <div className="shrink-0">
                  <button 
                    onClick={() => alert(`Membuka menu perbaikan untuk rule: ${rule.code}`)}
                    className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-lg transition cursor-pointer"
                  >
                    Atasi Masalah
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: REPORT CENTER */}
      {activeTab === 'report' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-blue-600" />
              Academic Report Center & Executive Summaries
            </h3>
            <p className="text-xs text-slate-500">
              Pusat ekspor rekapitulasi data administrasi operasional akademik (Siswa, Guru, SK, KBM, Leger, Rapor, Arsip) dalam format PDF, Excel, & CSV.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <p className="text-[10px] font-mono text-slate-500 uppercase">Total Siswa & Santri</p>
              <p className="text-2xl font-black text-slate-900">{reportData?.summaryMetrics?.totalSiswa || 0}</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <p className="text-[10px] font-mono text-slate-500 uppercase">Total Rombel Aktif</p>
              <p className="text-2xl font-black text-slate-900">{reportData?.summaryMetrics?.totalRombel || 0}</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <p className="text-[10px] font-mono text-slate-500 uppercase">Total SK Terbit</p>
              <p className="text-2xl font-black text-slate-900">{reportData?.summaryMetrics?.totalSK || 0}</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <p className="text-[10px] font-mono text-slate-500 uppercase">Arsip Terdata</p>
              <p className="text-2xl font-black text-slate-900">{reportData?.summaryMetrics?.totalArsip || 0}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportData?.reportsList?.map((rep: any) => (
              <div key={rep.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50/60 hover:bg-slate-50 transition flex items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                    {rep.category}
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 mt-1">{rep.name}</h4>
                </div>

                <div className="flex items-center gap-1.5">
                  {rep.formats.map((fmt: string) => (
                    <button
                      key={fmt}
                      onClick={() => handleExportReport(rep.name, fmt)}
                      className="px-2.5 py-1 bg-white hover:bg-slate-200 border border-slate-300 text-slate-800 text-[11px] font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="h-3 w-3" /> {fmt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
