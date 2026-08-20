import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, CheckCircle2, Clock, AlertTriangle, Lock, Unlock, Download, Upload,
  Printer, RefreshCw, Search, Filter, Plus, Trash2, Edit3, Save, Eye, X, Check,
  Share2, Award, Users, BookOpen, Building2, Calendar, FileCheck, Layers, Layout,
  QrCode, FileSpreadsheet, ShieldCheck, ChevronRight, Sparkles, Sliders, Settings,
  AlertCircle, History, ExternalLink, ArrowRight, CornerDownRight, Zap, CheckSquare
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from 'recharts';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type RaporStatus = 
  | 'DRAFT' 
  | 'DIPROSES' 
  | 'BELUM_LENGKAP' 
  | 'REVIEW' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'PUBLISHED' 
  | 'LOCKED' 
  | 'ARCHIVED';

export type JenisRapor = 
  | 'Rapor Semester' 
  | 'Rapor Tengah Semester' 
  | 'Rapor Akhir Tahun' 
  | 'Rapor Kelulusan' 
  | 'Rapor Tahfidz' 
  | 'Rapor Diniyah' 
  | 'Rapor PKBM' 
  | 'Rapor Custom';

export interface SubjectGrade {
  code: string;
  name: string;
  kkm: number;
  score: number;
  grade: string;
  predicate: string;
  ketuntasan: 'Tuntas' | 'Belum Tuntas';
  description: string;
}

export interface Extracurricular {
  name: string;
  participation: string;
  grade: 'A' | 'B' | 'C' | 'D';
  description: string;
  coach: string;
}

export interface AchievementItem {
  category: string;
  name: string;
  level: string;
  rank: string;
  date: string;
  organizer: string;
}

export interface StudentRaporRecord {
  id: string;
  studentId: string;
  studentName: string;
  nis: string;
  nisn: string;
  gender: 'L' | 'P';
  birthPlace: string;
  birthDate: string;
  religion: string;
  rombel: string;
  unit: string;
  jenjang: string;
  curriculum: string;
  fase: string;
  tahunAjaran: string;
  semester: string;
  jenisRapor: JenisRapor;
  docNumber: string;
  verificationCode: string;
  verificationStatus: 'VALID' | 'REVISED' | 'REVOKED' | 'ARCHIVED';
  status: RaporStatus;
  rejectionReason?: string;
  promotionStatus: string;
  gpa: number;
  totalScore: number;
  approvedBy?: string;
  publishedAt?: string;
  catatanWaliKelas: string;
  perkembanganSiswa: string;
  saran: string;
  catatanAkademik: string;
  catatanKhusus: string;
  attendance: {
    sakit: number;
    izin: number;
    alpa: number;
    terlambat: number;
  };
  subjects: SubjectGrade[];
  extracurriculars: Extracurricular[];
  achievements: AchievementItem[];
  signatures: {
    homeroomTeacher: { name: string; nip: string; title: string; signatureUrl?: string };
    headmaster: { name: string; nip: string; title: string; signatureUrl?: string; stampUrl?: string };
    parent: { name: string; title: string };
  };
  version: number;
  revisionHistory?: Array<{
    version: number;
    revisedBy: string;
    reason: string;
    timestamp: string;
  }>;
}

export interface RaporTemplate {
  id: string;
  name: string;
  type: string;
  isDefault: boolean;
  pageSize: 'A4' | 'F4' | 'Legal' | 'Letter' | 'A5' | 'Custom';
  orientation: 'Portrait' | 'Landscape';
  fontFamily: string;
  fontSize: string;
  margin: { top: number; right: number; bottom: number; left: number };
}

// ============================================================================
// MAIN ENTERPRISE RAPOR & DOCUMENT ENGINE COMPONENT
// ============================================================================

export default function EnterpriseRaporAndDocumentEngine() {
  const queryClient = useQueryClient();
  const printRef = useRef<HTMLDivElement>(null);

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<
    'COMMAND_CENTER' | 'DAFTAR_RAPOR' | 'TEMPLATE_DESIGNER' | 'VERIFIKASI_QR' | 'MONITORING_LAPORAN'
  >('COMMAND_CENTER');

  // Filters State
  const [selectedYear, setSelectedYear] = useState<string>('2025/2026');
  const [selectedSemester, setSelectedSemester] = useState<string>('2 (Genap)');
  const [selectedUnit, setSelectedUnit] = useState<string>('ALL');
  const [selectedRombel, setSelectedRombel] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedJenisRapor, setSelectedJenisRapor] = useState<JenisRapor>('Rapor Semester');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Student Rapor Detail View & Modal States
  const [selectedRapor, setSelectedRapor] = useState<StudentRaporRecord | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState<boolean>(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState<boolean>(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState<boolean>(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState<boolean>(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState<boolean>(false);

  // Form inputs for modals
  const [catatanWaliInput, setCatatanWaliInput] = useState<string>('');
  const [perkembanganInput, setPerkembanganInput] = useState<string>('');
  const [saranInput, setSaranInput] = useState<string>('');
  const [rejectReasonInput, setRejectReasonInput] = useState<string>('');
  const [revisionReasonInput, setRevisionReasonInput] = useState<string>('');
  const [verifyCodeInput, setVerifyCodeInput] = useState<string>('');
  const [verificationResult, setVerificationResult] = useState<any>(null);

  // Bulk operation state
  const [bulkProgress, setBulkProgress] = useState<number>(0);
  const [isBulkGenerating, setIsBulkGenerating] = useState<boolean>(false);

  // --------------------------------------------------------------------------
  // DATA FETCHING (REACT QUERY)
  // --------------------------------------------------------------------------

  // 1. Fetch Rapor Dashboard Statistics
  const { data: dashboardData, refetch: refetchDashboard } = useQuery({
    queryKey: ['raporDashboard', selectedYear, selectedSemester, selectedUnit],
    queryFn: async () => {
      const res = await apiClient.post('/api/action', {
        action: 'getRaporDashboard',
        year: selectedYear,
        semester: selectedSemester,
        unit: selectedUnit
      });
      return res.data?.data || null;
    }
  });

  // 2. Fetch Rapor Records List
  const { data: raporList = [], isLoading: isLoadingRapor, refetch: refetchRaporList } = useQuery<StudentRaporRecord[]>({
    queryKey: ['raporList', selectedYear, selectedSemester, selectedUnit, selectedRombel, selectedStatus, searchQuery],
    queryFn: async () => {
      const res = await apiClient.post('/api/action', {
        action: 'getRaporList',
        year: selectedYear,
        semester: selectedSemester,
        unit: selectedUnit,
        rombel: selectedRombel,
        status: selectedStatus,
        search: searchQuery
      });
      return res.data?.data || [];
    }
  });

  // 3. Fetch Rapor Templates
  const { data: templates = [], refetch: refetchTemplates } = useQuery<RaporTemplate[]>({
    queryKey: ['raporTemplates'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action', { action: 'getReportTemplates' });
      return res.data?.data || [];
    }
  });

  // 4. Fetch Institution Kop Surat Header
  const { data: kopSuratData } = useQuery({
    queryKey: ['kopSuratHeader'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action', { action: 'getKopSurat' });
      return res.data?.data || null;
    }
  });

  // --------------------------------------------------------------------------
  // MUTATIONS (API ACTIONS)
  // --------------------------------------------------------------------------

  // Save Notes
  const saveNotesMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiClient.post('/api/action', { action: 'saveRaporNotes', ...data });
    },
    onSuccess: () => {
      refetchRaporList();
      refetchDashboard();
      setIsNotesModalOpen(false);
      alert('Catatan Wali Kelas & Saran perkembangan siswa berhasil disimpan!');
    }
  });

  // Workflow Action (Approve / Reject / Publish / Lock / Archive)
  const workflowMutation = useMutation({
    mutationFn: async ({ actionName, ids, reason, targetStatus }: any) => {
      return await apiClient.post('/api/action', { action: actionName, ids, reason, targetStatus });
    },
    onSuccess: (data, variables) => {
      refetchRaporList();
      refetchDashboard();
      setIsApprovalModalOpen(false);
      alert(data.data?.message || 'Status workflow Rapor berhasil diperbarui!');
    }
  });

  // Bulk Generate
  const bulkGenerateMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiClient.post('/api/action', { action: 'bulkGenerateRapor', ...data });
    },
    onSuccess: (res) => {
      refetchRaporList();
      refetchDashboard();
      setIsBulkGenerating(false);
      setBulkProgress(100);
      alert(res.data?.message || 'Bulk generation Rapor selesai!');
    }
  });

  // QR Verification Search
  const verifyQRMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await apiClient.post('/api/action', { action: 'verifyRaporQR', verificationCode: code, docNumber: code });
      return res.data;
    },
    onSuccess: (data) => {
      setVerificationResult(data);
    }
  });

  // Revision Mutation
  const reviseMutation = useMutation({
    mutationFn: async ({ id, reason }: any) => {
      return await apiClient.post('/api/action', { action: 'reviseRapor', id, reason });
    },
    onSuccess: () => {
      refetchRaporList();
      refetchDashboard();
      setIsRevisionModalOpen(false);
      alert('Revisi Rapor berhasil dibuka! Dokumen berpindah ke status Draft versi baru.');
    }
  });

  // Helper open notes modal
  const openNotesModal = (record: StudentRaporRecord) => {
    setSelectedRapor(record);
    setCatatanWaliInput(record.catatanWaliKelas || '');
    setPerkembanganInput(record.perkembanganSiswa || '');
    setSaranInput(record.saran || '');
    setIsNotesModalOpen(true);
  };

  // Helper open preview
  const openPreviewModal = (record: StudentRaporRecord) => {
    setSelectedRapor(record);
    setIsPreviewModalOpen(true);
  };

  // Helper handle bulk generation trigger
  const handleStartBulkGenerate = () => {
    setIsBulkGenerating(true);
    setBulkProgress(10);
    const interval = setInterval(() => {
      setBulkProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 20;
      });
    }, 400);

    bulkGenerateMutation.mutate({
      rombel: selectedRombel,
      jenisRapor: selectedJenisRapor,
      tahunAjaran: selectedYear,
      semester: selectedSemester
    });
  };

  // Browser print trigger
  const handlePrintDocument = () => {
    window.print();
  };

  // Real Export DOC / Word Document
  const handleExportDocx = () => {
    if (!selectedRapor) return;
    const kopTitle = kopSuratData?.namaYayasan || 'YAYASAN DARUL HIJRAH INDONESIA';
    const unitTitle = kopSuratData?.unitSMA?.nama || 'SMA ISLAM TERPADU DARUL HIJRAH';
    const address = kopSuratData?.unitSMA?.alamat || 'Jl. Raya Pendidikan No. 45A, Jakarta';

    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Rapor Digital - ${selectedRapor.studentName}</title>
        <style>
          body { font-family: 'Calibri', 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #111; margin: 20mm; }
          .header-box { text-align: center; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 20px; }
          .yayasan-name { font-size: 11pt; font-weight: bold; text-transform: uppercase; }
          .school-name { font-size: 15pt; font-weight: 900; text-transform: uppercase; margin: 4px 0; }
          .meta-text { font-size: 9pt; color: #555; }
          .doc-title { font-size: 13pt; font-weight: bold; text-align: center; text-transform: uppercase; margin: 15px 0 5px 0; text-decoration: underline; }
          .doc-subtitle { font-size: 10pt; font-weight: bold; text-align: center; color: #444; margin-bottom: 15px; }
          table.meta-table { width: 100%; margin-bottom: 15px; border-collapse: collapse; }
          table.meta-table td { padding: 4px 8px; font-size: 10pt; border: none; }
          table.data-table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 15px; }
          table.data-table th { border: 1px solid #333; padding: 6px 8px; font-size: 10pt; background-color: #f1f5f9; text-align: center; }
          table.data-table td { border: 1px solid #333; padding: 6px 8px; font-size: 10pt; }
          .text-center { text-align: center; }
          .text-bold { font-weight: bold; }
          .note-box { border: 1px solid #999; padding: 10px; margin-top: 15px; font-size: 10pt; }
        </style>
      </head>
      <body>
        <div class="header-box">
          <div class="yayasan-name">${kopTitle}</div>
          <div class="school-name">${unitTitle}</div>
          <div class="meta-text">${address}</div>
        </div>

        <div class="doc-title">LAPORAN HASIL BELAJAR (RAPOR SISWA)</div>
        <div class="doc-subtitle">Tahun Ajaran ${selectedRapor.tahunAjaran} - Semester ${selectedRapor.semester}</div>

        <table class="meta-table">
          <tr>
            <td width="20%"><b>Nama Siswa</b></td>
            <td width="30%">: ${selectedRapor.studentName}</td>
            <td width="20%"><b>Kelas / Rombel</b></td>
            <td width="30%">: ${selectedRapor.rombel} (${selectedRapor.fase})</td>
          </tr>
          <tr>
            <td><b>NIS / NISN</b></td>
            <td>: ${selectedRapor.nis} / ${selectedRapor.nisn}</td>
            <td><b>Kurikulum</b></td>
            <td>: ${selectedRapor.curriculum}</td>
          </tr>
          <tr>
            <td><b>Status Kenaikan</b></td>
            <td>: ${selectedRapor.promotionStatus}</td>
            <td><b>Kode QR Verifikasi</b></td>
            <td>: ${selectedRapor.verificationCode}</td>
          </tr>
        </table>

        <div style="font-weight: bold; font-size: 11pt; margin-top: 15px; margin-bottom: 5px;">A. CAPAIAN NILAI MATA PELAJARAN</div>
        <table class="data-table">
          <thead>
            <tr>
              <th width="5%">No</th>
              <th width="35%">Mata Pelajaran</th>
              <th width="10%">KKM</th>
              <th width="10%">Nilai</th>
              <th width="10%">Predikat</th>
              <th width="30%">Capaian Kompetensi / Deskripsi</th>
            </tr>
          </thead>
          <tbody>
            ${(selectedRapor.subjects || []).map((s: any, idx: number) => `
              <tr>
                <td class="text-center">${idx + 1}</td>
                <td>${s.name}</td>
                <td class="text-center">${s.kkm}</td>
                <td class="text-center text-bold">${s.score}</td>
                <td class="text-center">${s.grade}</td>
                <td>${s.description || 'Menunjukkan penguasaan kompetensi yang sangat baik.'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="note-box">
          <b>Catatan Perkembangan &amp; Karakter:</b><br/>
          ${selectedRapor.catatanWaliKelas || 'Ananda menunjukkan peningkatan prestasi belajar dan kedisiplinan yang sangat positif.'}
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Rapor_${selectedRapor.studentName.replace(/\s+/g, '_')}_${selectedRapor.semester}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Rapor Status Badge Renderer
  const renderStatusBadge = (status: RaporStatus) => {
    switch (status) {
      case 'PUBLISHED':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300"><CheckCircle2 className="w-3.5 h-3.5" /> Published</span>;
      case 'APPROVED':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300"><Check className="w-3.5 h-3.5" /> Approved</span>;
      case 'REVIEW':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300"><Clock className="w-3.5 h-3.5" /> Review Wali/Kepsek</span>;
      case 'DIPROSES':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-300"><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Auto Leger Sync</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300"><AlertCircle className="w-3.5 h-3.5" /> Perlu Perbaikan</span>;
      case 'LOCKED':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-900 text-white border border-slate-700"><Lock className="w-3.5 h-3.5" /> Final Locked</span>;
      case 'ARCHIVED':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300"><History className="w-3.5 h-3.5" /> Archived</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200"><FileText className="w-3.5 h-3.5" /> Draft</span>;
    }
  };

  return (
    <div className="space-y-6 pb-20 font-sans text-slate-900">
      
      {/* ==================================================================== */}
      {/* HEADER COMMAND BAR */}
      {/* ==================================================================== */}
      <div className="bg-slate-950 text-white p-6 rounded-3xl shadow-xl border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-mono font-bold uppercase tracking-wider">
              131 ENTERPRISE ENGINE
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Auto Leger Single Source of Truth
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold mt-2 tracking-tight">
            Enterprise Rapor & Document Engine
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-3xl">
            Pusat penerbitan rapor digital, verifikasi dokumen QR, cetak PDF/Word resmi, dan approval bertingkat terintegrasi penuh dengan Auto Leger & Academic Engine.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-extrabold transition shadow-lg shadow-blue-900/30 cursor-pointer"
          >
            <Zap className="w-4 h-4" /> Bulk Generate Rapor
          </button>
          <button
            onClick={() => setIsVerifyModalOpen(true)}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-xs font-extrabold border border-slate-700 transition cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-emerald-400" /> Verifikasi QR
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TOP NAVIGATION TABS */}
      {/* ==================================================================== */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: 'COMMAND_CENTER', label: '1. Rapor Command Center', icon: Layout },
          { id: 'DAFTAR_RAPOR', label: '2. Daftar & Workspace Rapor', icon: FileCheck },
          { id: 'TEMPLATE_DESIGNER', label: '3. Template Designer', icon: Sliders },
          { id: 'VERIFIKASI_QR', label: '4. Portal Verifikasi QR', icon: QrCode },
          { id: 'MONITORING_LAPORAN', label: '5. Audit Trail & Laporan', icon: History },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ==================================================================== */}
      {/* GLOBAL FILTER BAR */}
      {/* ==================================================================== */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-semibold">
        <div>
          <label className="block text-[10px] uppercase font-extrabold text-slate-400 mb-1">Tahun Ajaran</label>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-extrabold focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="2025/2026">2025/2026</option>
            <option value="2024/2025">2024/2025</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] uppercase font-extrabold text-slate-400 mb-1">Semester</label>
          <select
            value={selectedSemester}
            onChange={e => setSelectedSemester(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-extrabold focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1 (Ganjil)">1 (Ganjil)</option>
            <option value="2 (Genap)">2 (Genap)</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] uppercase font-extrabold text-slate-400 mb-1">Unit / Jenjang</label>
          <select
            value={selectedUnit}
            onChange={e => setSelectedUnit(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-extrabold focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Semua Unit</option>
            <option value="SD">SD / MI</option>
            <option value="SMP">SMP / MTs</option>
            <option value="SMA">SMA / MA</option>
            <option value="PKBM">PKBM / Kesetaraan</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] uppercase font-extrabold text-slate-400 mb-1">Rombel / Kelas</label>
          <select
            value={selectedRombel}
            onChange={e => setSelectedRombel(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-extrabold focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Semua Rombel</option>
            <option value="X-1">X-1 (Fase E)</option>
            <option value="X-2">X-2 (Fase E)</option>
            <option value="XI-IPA-1">XI-IPA-1 (Fase F)</option>
            <option value="XII-IPA-1">XII-IPA-1 (Fase F)</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] uppercase font-extrabold text-slate-400 mb-1">Jenis Rapor</label>
          <select
            value={selectedJenisRapor}
            onChange={e => setSelectedJenisRapor(e.target.value as JenisRapor)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-extrabold focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Rapor Semester">Rapor Semester</option>
            <option value="Rapor Tengah Semester">Rapor Tengah Semester</option>
            <option value="Rapor Akhir Tahun">Rapor Akhir Tahun</option>
            <option value="Rapor Kelulusan">Rapor Kelulusan</option>
            <option value="Rapor Tahfidz">Rapor Tahfidz</option>
            <option value="Rapor Diniyah">Rapor Diniyah</option>
            <option value="Rapor PKBM">Rapor PKBM</option>
            <option value="Rapor Custom">Rapor Custom</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] uppercase font-extrabold text-slate-400 mb-1">Status Rapor</label>
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-extrabold focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Semua Status</option>
            <option value="DRAFT">Draft</option>
            <option value="REVIEW">Menunggu Review</option>            <option value="APPROVED">Approved</option>
            <option value="PUBLISHED">Published</option>
            <option value="LOCKED">Locked</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: RAPOR COMMAND CENTER */}
      {/* ==================================================================== */}
      {activeTab === 'COMMAND_CENTER' && (
        <div className="space-y-6">
          
          {/* KPI STAT CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {[
              { label: 'Total Siswa', value: dashboardData?.totalSiswa || 240, color: 'border-slate-300 bg-white text-slate-900' },
              { label: 'Rapor Draft', value: dashboardData?.draft || 15, color: 'border-slate-200 bg-slate-50 text-slate-700' },
              { label: 'Diproses', value: dashboardData?.diproses || 20, color: 'border-indigo-200 bg-indigo-50 text-indigo-900' },
              { label: 'Belum Lengkap', value: dashboardData?.belumLengkap || 8, color: 'border-rose-200 bg-rose-50 text-rose-900' },
              { label: 'Menunggu Review', value: dashboardData?.menungguReview || 32, color: 'border-amber-200 bg-amber-50 text-amber-900' },
              { label: 'Approved', value: dashboardData?.approved || 45, color: 'border-blue-200 bg-blue-50 text-blue-900' },
              { label: 'Published', value: dashboardData?.published || 110, color: 'border-emerald-200 bg-emerald-50 text-emerald-900' },
              { label: 'Archived', value: dashboardData?.archived || 10, color: 'border-slate-300 bg-slate-100 text-slate-600' },
            ].map((kpi, idx) => (
              <div key={idx} className={`p-3.5 rounded-2xl border ${kpi.color} shadow-xs space-y-1`}>
                <p className="text-[10px] font-extrabold uppercase tracking-wide opacity-75">{kpi.label}</p>
                <p className="text-xl font-black">{kpi.value}</p>
              </div>
            ))}
          </div>

          {/* PROGRESS METRICS BREAKDOWN */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-950">Kelengkapan Variable Rapor & Auto Leger Sync</h3>
                <p className="text-xs text-slate-500 mt-0.5">Seluruh variable berasal langsung dari Auto Leger, Attendance Engine, dan Activity Center.</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold border border-emerald-300">
                100% Data Synchronized
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 pt-2">
              {[
                { label: 'Nilai Leger', pct: dashboardData?.progressMetrics?.nilai || 98 },
                { label: 'Absensi', pct: dashboardData?.progressMetrics?.absensi || 100 },
                { label: 'Catatan Wali', pct: dashboardData?.progressMetrics?.catatan || 92 },
                { label: 'Ekstrakurikuler', pct: dashboardData?.progressMetrics?.ekstrakurikuler || 95 },
                { label: 'Kepribadian', pct: dashboardData?.progressMetrics?.kepribadian || 90 },
                { label: 'Deskripsi CP', pct: dashboardData?.progressMetrics?.deskripsi || 96 },
                { label: 'Final Leger', pct: dashboardData?.progressMetrics?.leger || 100 },
                { label: 'Rapor Published', pct: dashboardData?.progressMetrics?.rapor || 72 },
              ].map((m, idx) => (
                <div key={idx} className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>{m.label}</span>
                    <span className="text-blue-600">{m.pct}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${m.pct}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* WORKFLOW PIPELINE OVERVIEW */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left: Interactive Quick Actions */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-base font-extrabold text-slate-950 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" /> Alur Penerbitan Rapor Digital (Enterprise Workflow)
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-1">
                  <p className="font-extrabold text-blue-900">1. Auto Leger Integration</p>
                  <p className="text-blue-700">Nilai akhir, KKM, dan predikat diambil dari Auto Leger. Tanpa input ulang data.</p>
                </div>
                <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-1">
                  <p className="font-extrabold text-indigo-900">2. Description Engine</p>
                  <p className="text-indigo-700">Deskripsi capaian pembelajaran dibuat otomatis dari formula CP/TP dengan opsi manual override.</p>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                  <p className="font-extrabold text-amber-900">3. Review Wali Kelas</p>
                  <p className="text-amber-700">Wali kelas merekap absensi, ekstra, dan memberikan saran perkembangan siswa.</p>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                  <p className="font-extrabold text-emerald-900">4. Approval & Publish Kepsek</p>
                  <p className="text-emerald-700">Kepala sekolah melakukan approval digital dan menerbitkan rapor bertanda tangan QR.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-xs text-blue-400 uppercase tracking-wider">Status Leger Aktif</p>
                  <p className="text-sm font-extrabold mt-0.5">Leger Semester 2 (Genap) 2025/2026 telah FINALIZED</p>
                </div>
                <button
                  onClick={() => setActiveTab('DAFTAR_RAPOR')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer"
                >
                  Buka Workspace Rapor →
                </button>
              </div>
            </div>

            {/* Right: Summary Chart */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-base font-extrabold text-slate-950">Distribusi Status Rapor</h3>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { status: 'Draft', total: dashboardData?.draft || 15 },
                    { status: 'Review', total: dashboardData?.menungguReview || 32 },
                    { status: 'Approved', total: dashboardData?.approved || 45 },
                    { status: 'Published', total: dashboardData?.published || 110 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="status" tick={{ fontSize: 10, fill: '#64748B' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }} />
                    <Bar dataKey="total" fill="#2563EB" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: DAFTAR & WORKSPACE RAPOR SISWA */}
      {/* ==================================================================== */}
      {(activeTab === 'DAFTAR_RAPOR' || activeTab === 'COMMAND_CENTER') && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-950">Daftar Rapor Digital Siswa</h3>
              <p className="text-xs text-slate-500 mt-0.5">Kelola preview, review wali kelas, approval kepala sekolah, dan pencetakan rapor PDF/Word.</p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Search Bar */}
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama, NIS, NISN..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={() => refetchRaporList()}
                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition cursor-pointer"
                title="Refresh Data"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium text-slate-700">
              <thead className="bg-slate-50 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Dokumen No / QR</th>
                  <th className="p-3.5">Identitas Siswa</th>
                  <th className="p-3.5">Rombel & Unit</th>
                  <th className="p-3.5">Rata-rata / Total</th>
                  <th className="p-3.5">Catatan Wali</th>
                  <th className="p-3.5">Status Rapor</th>
                  <th className="p-3.5 text-right">Aksi & Workflow</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold">
                {isLoadingRapor ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                      Memuat data rapor digital siswa...
                    </td>
                  </tr>
                ) : raporList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      Tidak ada dokumen rapor yang sesuai dengan filter.
                    </td>
                  </tr>
                ) : (
                  raporList.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* Doc No & QR */}
                      <td className="p-3.5 space-y-0.5">
                        <p className="font-mono text-slate-900 font-extrabold">{r.docNumber}</p>
                        <p className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                          <QrCode className="w-3 h-3 text-emerald-600" /> {r.verificationCode}
                        </p>
                      </td>

                      {/* Student Identity */}
                      <td className="p-3.5 space-y-0.5">
                        <p className="font-extrabold text-slate-950">{r.studentName}</p>
                        <p className="text-[10px] text-slate-500">
                          NIS: {r.nis} | NISN: {r.nisn} ({r.gender})
                        </p>
                      </td>

                      {/* Rombel & Unit */}
                      <td className="p-3.5 space-y-0.5">
                        <p className="font-bold text-slate-800">{r.rombel} ({r.unit})</p>
                        <p className="text-[10px] text-slate-500">{r.curriculum}</p>
                      </td>

                      {/* GPA & Total */}
                      <td className="p-3.5 space-y-0.5">
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 font-extrabold text-xs">
                          {r.gpa}
                        </span>
                        <p className="text-[10px] text-slate-500">Total: {r.totalScore}</p>
                      </td>

                      {/* Catatan Wali */}
                      <td className="p-3.5 max-w-xs truncate text-slate-600 text-[11px]" title={r.catatanWaliKelas}>
                        {r.catatanWaliKelas ? (
                          <span>{r.catatanWaliKelas}</span>
                        ) : (
                          <span className="italic text-slate-400">Belum diisi wali kelas</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        {renderStatusBadge(r.status)}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => openPreviewModal(r)}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                          title="Preview Rapor Resm"
                        >
                          <Eye className="w-3.5 h-3.5 inline mr-1" /> Preview
                        </button>

                        <button
                          onClick={() => openNotesModal(r)}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold transition cursor-pointer"
                          title="Isi Catatan Wali Kelas"
                        >
                          <Edit3 className="w-3.5 h-3.5 inline mr-1" /> Catatan
                        </button>

                        {/* Status Transition Action Buttons */}
                        {r.status === 'REVIEW' && (
                          <button
                            onClick={() => {
                              setSelectedRapor(r);
                              setIsApprovalModalOpen(true);
                            }}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                          >
                            Approve/Reject
                          </button>
                        )}

                        {r.status === 'APPROVED' && (
                          <button
                            onClick={() => workflowMutation.mutate({ actionName: 'publishRapor', ids: [r.id] })}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                          >
                            Publish
                          </button>
                        )}

                        {r.status === 'PUBLISHED' && (
                          <button
                            onClick={() => {
                              setSelectedRapor(r);
                              setIsRevisionModalOpen(true);
                            }}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-xs font-bold transition cursor-pointer"
                            title="Buka Revisi Dokumen"
                          >
                            Revisi
                          </button>
                        )}
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: TEMPLATE DESIGNER */}
      {/* ==================================================================== */}
      {activeTab === 'TEMPLATE_DESIGNER' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left: Template Selector & Settings */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-950">Desain Template Rapor</h3>
              <p className="text-xs text-slate-500 mt-0.5">Atur ukuran kertas, margin, font, dan elemen visual dokumen.</p>
            </div>

            <div className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-700 mb-1">Pilih Template Aktif</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-extrabold">
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.pageSize})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">Ukuran Kertas</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold">
                    <option value="A4">A4 (210 x 297 mm)</option>
                    <option value="F4">F4 / Folio (215 x 330 mm)</option>
                    <option value="Legal">Legal</option>
                    <option value="Letter">Letter</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Orientasi</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold">
                    <option value="Portrait">Portrait</option>
                    <option value="Landscape">Landscape</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Font Utama Dokumen</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold">
                  <option value="Arial">Arial (Clean Modern)</option>
                  <option value="Times New Roman">Times New Roman (Formal)</option>
                  <option value="Calibri">Calibri</option>
                  <option value="Cambria">Cambria</option>
                  <option value="Georgia">Georgia</option>
                </select>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <p className="text-slate-900 font-extrabold">Margin Kertas (mm)</p>
                <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                  <div><span className="text-slate-400">Atas</span><input type="number" defaultValue={20} className="w-full mt-0.5 p-1 text-center bg-white border border-slate-200 rounded-lg" /></div>
                  <div><span className="text-slate-400">Kanan</span><input type="number" defaultValue={20} className="w-full mt-0.5 p-1 text-center bg-white border border-slate-200 rounded-lg" /></div>
                  <div><span className="text-slate-400">Bawah</span><input type="number" defaultValue={20} className="w-full mt-0.5 p-1 text-center bg-white border border-slate-200 rounded-lg" /></div>
                  <div><span className="text-slate-400">Kiri</span><input type="number" defaultValue={20} className="w-full mt-0.5 p-1 text-center bg-white border border-slate-200 rounded-lg" /></div>
                </div>
              </div>

              <button
                onClick={() => alert('Pengaturan template berhasil diperbarui.')}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-extrabold transition shadow-md cursor-pointer"
              >
                Simpan Desain Template
              </button>
            </div>
          </div>

          {/* Right: Live Visual Layout Canvas */}
          <div className="lg:col-span-2 bg-slate-100 border border-slate-200 rounded-3xl p-6 shadow-inner flex flex-col items-center justify-center space-y-4">
            <div className="flex items-center justify-between w-full max-w-xl text-xs font-extrabold text-slate-600">
              <span>Visual Canvas Layout (A4 Portrait)</span>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full">Zoom 100%</span>
            </div>

            {/* Simulated Paper Sheet */}
            <div className="w-full max-w-xl bg-white border border-slate-300 shadow-2xl p-8 rounded-lg space-y-6 text-slate-900 font-serif min-h-[600px]">
              
              {/* Kop Header */}
              <div className="border-b-4 border-double border-slate-950 pb-3 flex items-center gap-4">
                <img src={kopSuratData?.logoYayasan || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=150'} alt="Logo" className="w-16 h-16 object-contain" />
                <div className="text-center flex-1 space-y-0.5 font-sans">
                  <p className="text-xs uppercase font-extrabold tracking-wider">{kopSuratData?.namaYayasan || 'YAYASAN DARUL HIJRAH INDONESIA'}</p>
                  <p className="text-sm uppercase font-black">{kopSuratData?.unitSMA?.nama || 'SMA ISLAM TERPADU DARUL HIJRAH'}</p>
                  <p className="text-[9px] text-slate-600">NPSN: 20108933 | {kopSuratData?.unitSMA?.alamat || 'Jl. Raya Pendidikan No. 45A, Jakarta'}</p>
                </div>
              </div>

              {/* Title */}
              <div className="text-center font-sans space-y-1">
                <h4 className="font-extrabold text-sm uppercase underline decoration-2">LAPORAN CAPAIAN HASIL BELAJAR (RAPOR)</h4>
                <p className="text-[11px] font-bold text-slate-600">Tahun Ajaran 2025/2026 - Semester 2 (Genap)</p>
              </div>

              {/* Student Bio Grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[11px] font-sans border border-slate-200 p-3 rounded-lg bg-slate-50/50">
                <div><span className="text-slate-500">Nama Siswa:</span> <strong className="text-slate-950">Ahmad Raihan Pratama</strong></div>
                <div><span className="text-slate-500">Kelas / Rombel:</span> <strong className="text-slate-950">X-1 (Fase E)</strong></div>
                <div><span className="text-slate-500">NIS / NISN:</span> <strong className="text-slate-950">20261001 / 0089123401</strong></div>
                <div><span className="text-slate-500">Kurikulum:</span> <strong className="text-slate-950">Kurikulum Merdeka</strong></div>
              </div>

              {/* Grades Table Preview */}
              <div className="space-y-1 font-sans">
                <p className="text-xs font-extrabold uppercase text-slate-800">A. Capaian Pengetahuan & Keterampilan</p>
                <table className="w-full text-[10px] border-collapse border border-slate-900 text-left">
                  <thead className="bg-slate-100 text-center font-bold">
                    <tr>
                      <th className="border border-slate-900 p-1">No</th>
                      <th className="border border-slate-900 p-1">Mata Pelajaran</th>
                      <th className="border border-slate-900 p-1">KKM</th>
                      <th className="border border-slate-900 p-1">Nilai</th>
                      <th className="border border-slate-900 p-1">Predikat</th>
                      <th className="border border-slate-900 p-1">Capaian Kompetensi</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="border border-slate-900 p-1 text-center">1</td><td className="border border-slate-900 p-1 font-bold">Pendidikan Agama Islam</td><td className="border border-slate-900 p-1 text-center">75</td><td className="border border-slate-900 p-1 text-center font-extrabold">92</td><td className="border border-slate-900 p-1 text-center">A</td><td className="border border-slate-900 p-1">Sangat baik dalam pemahaman Al-Quran & Tajwid.</td></tr>
                    <tr><td className="border border-slate-900 p-1 text-center">2</td><td className="border border-slate-900 p-1 font-bold">Bahasa Indonesia</td><td className="border border-slate-900 p-1 text-center">75</td><td className="border border-slate-900 p-1 text-center font-extrabold">86</td><td className="border border-slate-900 p-1 text-center">A</td><td className="border border-slate-900 p-1">Sangat terampil menyusun karya tulis ilmiah.</td></tr>
                    <tr><td className="border border-slate-900 p-1 text-center">3</td><td className="border border-slate-900 p-1 font-bold">Matematika</td><td className="border border-slate-900 p-1 text-center">75</td><td className="border border-slate-900 p-1 text-center font-extrabold">84</td><td className="border border-slate-900 p-1 text-center">B</td><td className="border border-slate-900 p-1">Menguasai fungsi trigonometri dan statistik.</td></tr>
                  </tbody>
                </table>
              </div>

              {/* Signatures & Stamp */}
              <div className="grid grid-cols-3 text-center text-[10px] font-sans pt-4">
                <div>
                  <p>Orang Tua / Wali,</p>
                  <div className="h-12"></div>
                  <p className="font-bold underline">.................................</p>
                </div>
                <div>
                  <p>Wali Kelas,</p>
                  <div className="h-12 flex items-center justify-center">
                    <span className="text-[8px] text-blue-600 border border-blue-300 px-1 py-0.5 rounded">e-Signed</span>
                  </div>
                  <p className="font-bold underline">M. Ridwan, S.Pd</p>
                </div>
                <div>
                  <p>Kepala Sekolah,</p>
                  <div className="h-12 flex items-center justify-center">
                    <span className="text-[8px] text-emerald-600 border border-emerald-300 px-1 py-0.5 rounded">e-Signed + Stamp</span>
                  </div>
                  <p className="font-bold underline">Drs. H. Ahmad Dahlan, M.Pd</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 4: PORTAL VERIFIKASI QR */}
      {/* ==================================================================== */}
      {activeTab === 'VERIFIKASI_QR' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xs max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-950">Portal Verifikasi Keaslian Rapor Digital</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Masukkan Nomor Dokumen Rapor atau Kode Verifikasi QR untuk memeriksa keabsahan dan keaslian dokumen resmi.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Contoh: VER-RPR-1001 atau RPR/2026/02/1001"
              value={verifyCodeInput}
              onChange={e => setVerifyCodeInput(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => verifyQRMutation.mutate(verifyCodeInput)}
              disabled={verifyQRMutation.isPending}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl transition cursor-pointer"
            >
              Verifikasi Dokumen
            </button>
          </div>

          {/* Verification Result Card */}
          {verificationResult && (
            <div className={`p-6 rounded-3xl border ${verificationResult.verified ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950' : 'bg-rose-50 border-rose-200 text-rose-950'} space-y-4`}>
              <div className="flex items-center justify-between border-b border-emerald-200/60 pb-3">
                <span className="font-extrabold text-sm flex items-center gap-2">
                  {verificationResult.verified ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-rose-600" />}
                  STATUS DOKUMEN: {verificationResult.status || 'VALID'}
                </span>
                <span className="text-xs font-mono text-slate-500">{new Date().toLocaleDateString('id-ID')}</span>
              </div>

              {verificationResult.verified && verificationResult.data ? (
                <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                  <div><span className="text-slate-500">Nomor Dokumen:</span> <p className="font-mono font-extrabold text-slate-900">{verificationResult.data.docNumber}</p></div>
                  <div><span className="text-slate-500">Nama Siswa:</span> <p className="font-extrabold text-slate-900">{verificationResult.data.studentName}</p></div>
                  <div><span className="text-slate-500">Rombel / Unit:</span> <p className="font-extrabold text-slate-900">{verificationResult.data.rombel} ({verificationResult.data.unit})</p></div>
                  <div><span className="text-slate-500">Penerbit:</span> <p className="font-extrabold text-slate-900">{verificationResult.data.issuedBy}</p></div>
                  <div><span className="text-slate-500">Tanggal Terbit:</span> <p className="font-extrabold text-slate-900">{verificationResult.data.publishedAt ? new Date(verificationResult.data.publishedAt).toLocaleDateString('id-ID') : '-'}</p></div>
                  <div><span className="text-slate-500">Indeks Prestasi (GPA):</span> <p className="font-extrabold text-emerald-700">{verificationResult.data.gpa}</p></div>
                </div>
              ) : (
                <p className="text-xs text-rose-800 font-bold">{verificationResult.message}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 5: AUDIT TRAIL & LAPORAN */}
      {/* ==================================================================== */}
      {activeTab === 'MONITORING_LAPORAN' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-950">Audit Trail & Activity Log Dokumen Rapor</h3>
              <p className="text-xs text-slate-500 mt-0.5">Seluruh aksi generate, preview, edit catatan, approval, revisi, dan pencetakan tersimpan secara permanen.</p>
            </div>
            <button
              onClick={() => alert('Mengekspor Rekap Audit Trail Rapor ke Format Excel...')}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Export Excel Log
            </button>
          </div>

          {/* Audit Logs Table */}
          <div className="space-y-3 text-xs font-medium">
            {[
              { time: '2026-06-25 10:15', user: 'Drs. H. Ahmad Dahlan, M.Pd (Kepala Sekolah)', action: 'PUBLISH_RAPOR', detail: 'Menerbitkan 110 Rapor Digital Rombel X-1 & X-2' },
              { time: '2026-06-25 09:30', user: 'M. Ridwan, S.Pd (Wali Kelas)', action: 'UPDATE_NOTES', detail: 'Memperbarui Catatan Wali Kelas & Perkembangan Siswa [Ahmad Raihan Pratama]' },
              { time: '2026-06-24 16:00', user: 'System Auto Leger Engine', action: 'BULK_GENERATE', detail: 'Bulk calculation Auto Leger Rombel XI-IPA-1' },
            ].map((log, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                  <div>
                    <p className="font-extrabold text-slate-900">{log.detail}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{log.user}</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-400">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 1: PREVIEW RAPOR DIGITAL RESMI & PRINT */}
      {/* ==================================================================== */}
      {isPreviewModalOpen && selectedRapor && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <div>
                  <h4 className="font-extrabold text-sm">Preview Rapor Digital Resmi</h4>
                  <p className="text-[10px] text-slate-400">{selectedRapor.studentName} - {selectedRapor.docNumber}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintDocument}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Cetak / PDF
                </button>
                <button
                  onClick={handleExportDocx}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Word (DOCX)
                </button>
                <button
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Content (Printable Document Sheet) */}
            <div id="printable-rapor-sheet" className="p-8 overflow-y-auto space-y-6 text-slate-900 font-sans" ref={printRef}>
              
              {/* KOP RAPOR */}
              <div className="border-b-4 border-double border-slate-950 pb-4 flex items-center gap-6">
                <img src={kopSuratData?.logoYayasan || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=150'} alt="Logo Yayasan" className="w-20 h-20 object-contain" />
                <div className="text-center flex-1 space-y-0.5">
                  <p className="text-xs uppercase font-extrabold tracking-widest text-slate-700">{kopSuratData?.namaYayasan || 'YAYASAN DARUL HIJRAH INDONESIA'}</p>
                  <h2 className="text-lg uppercase font-black tracking-tight">{kopSuratData?.unitSMA?.nama || 'SMA ISLAM TERPADU DARUL HIJRAH'}</h2>
                  <p className="text-xs text-slate-600">NPSN: {kopSuratData?.unitSMA?.npsn || '20108933'} | {kopSuratData?.unitSMA?.alamat || 'Jl. Raya Pendidikan No. 45A, Jakarta'}</p>
                  <p className="text-[10px] text-slate-500">Telp: {kopSuratData?.unitSMA?.telepon || '021-8490126'} | Email: {kopSuratData?.unitSMA?.email || 'sma@darulhijrah.sch.id'}</p>
                </div>
              </div>

              {/* DOCUMENT TITLE */}
              <div className="text-center space-y-1 pt-2">
                <h3 className="font-black text-base uppercase underline underline-offset-4 decoration-2">LAPORAN HASIL BELAJAR (RAPOR)</h3>
                <p className="text-xs font-bold text-slate-600">Tahun Ajaran {selectedRapor.tahunAjaran} - Semester {selectedRapor.semester}</p>
              </div>

              {/* STUDENT IDENTITY GRID */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-xs border border-slate-300 p-4 rounded-xl bg-slate-50/50">
                <div><span className="text-slate-500 font-semibold">Nama Siswa:</span> <strong className="text-slate-950 font-black">{selectedRapor.studentName}</strong></div>
                <div><span className="text-slate-500 font-semibold">Fase / Kelas:</span> <strong className="text-slate-950 font-bold">{selectedRapor.fase} / {selectedRapor.rombel}</strong></div>
                <div><span className="text-slate-500 font-semibold">NIS / NISN:</span> <strong className="text-slate-950 font-mono font-bold">{selectedRapor.nis} / {selectedRapor.nisn}</strong></div>
                <div><span className="text-slate-500 font-semibold">Kurikulum:</span> <strong className="text-slate-950 font-bold">{selectedRapor.curriculum}</strong></div>
                <div><span className="text-slate-500 font-semibold">Status Kenaikan:</span> <strong className="text-emerald-700 font-extrabold">{selectedRapor.promotionStatus}</strong></div>
                <div><span className="text-slate-500 font-semibold">Nomor Verifikasi QR:</span> <strong className="text-slate-950 font-mono font-bold">{selectedRapor.verificationCode}</strong></div>
              </div>

              {/* SUBJECT GRADES TABLE FROM AUTO LEGER */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900">A. CAPAIAN NILAI MATA PELAJARAN (AUTO LEGER SYNC)</h4>
                <table className="w-full text-xs border-collapse border border-slate-900 text-left">
                  <thead className="bg-slate-100 text-center font-bold">
                    <tr>
                      <th className="border border-slate-900 p-2 w-10">No</th>
                      <th className="border border-slate-900 p-2">Mata Pelajaran</th>
                      <th className="border border-slate-900 p-2 w-14">KKM</th>
                      <th className="border border-slate-900 p-2 w-16">Nilai</th>
                      <th className="border border-slate-900 p-2 w-16">Predikat</th>
                      <th className="border border-slate-900 p-2">Deskripsi Capaian Pembelajaran</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRapor.subjects.map((sub, idx) => (
                      <tr key={idx}>
                        <td className="border border-slate-900 p-2 text-center">{idx + 1}</td>
                        <td className="border border-slate-900 p-2 font-bold">{sub.name}</td>
                        <td className="border border-slate-900 p-2 text-center">{sub.kkm}</td>
                        <td className="border border-slate-900 p-2 text-center font-black text-slate-950">{sub.score}</td>
                        <td className="border border-slate-900 p-2 text-center font-bold">{sub.predicate}</td>
                        <td className="border border-slate-900 p-2 text-[11px] leading-snug">{sub.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* EXTRACURRICULAR & ATTENDANCE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Extra Table */}
                <div className="space-y-2">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900">B. EKSTRAKURIKULER</h4>
                  <table className="w-full text-xs border-collapse border border-slate-900">
                    <thead className="bg-slate-100 font-bold text-center">
                      <tr>
                        <th className="border border-slate-900 p-1.5">Kegiatan</th>
                        <th className="border border-slate-900 p-1.5 w-16">Nilai</th>
                        <th className="border border-slate-900 p-1.5">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRapor.extracurriculars.map((e, idx) => (
                        <tr key={idx}>
                          <td className="border border-slate-900 p-1.5 font-bold">{e.name}</td>
                          <td className="border border-slate-900 p-1.5 text-center font-bold">{e.grade}</td>
                          <td className="border border-slate-900 p-1.5 text-[10px]">{e.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Attendance Table */}
                <div className="space-y-2">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900">C. KETIDAKHADIRAN</h4>
                  <table className="w-full text-xs border-collapse border border-slate-900">
                    <tbody>
                      <tr><td className="border border-slate-900 p-2 font-semibold">1. Sakit</td><td className="border border-slate-900 p-2 font-bold text-center">{selectedRapor.attendance.sakit} hari</td></tr>
                      <tr><td className="border border-slate-900 p-2 font-semibold">2. Izin</td><td className="border border-slate-900 p-2 font-bold text-center">{selectedRapor.attendance.izin} hari</td></tr>
                      <tr><td className="border border-slate-900 p-2 font-semibold">3. Tanpa Keterangan (Alpa)</td><td className="border border-slate-900 p-2 font-bold text-center">{selectedRapor.attendance.alpa} hari</td></tr>
                    </tbody>
                  </table>
                </div>

              </div>

              {/* CATATAN WALI KELAS */}
              <div className="space-y-1 border border-slate-900 p-3 rounded-lg bg-slate-50/30">
                <h4 className="font-extrabold text-xs uppercase text-slate-900">D. CATATAN WALI KELAS & SARAN PERKEMBANGAN</h4>
                <p className="text-xs italic text-slate-800 leading-relaxed font-serif">"{selectedRapor.catatanWaliKelas}"</p>
              </div>

              {/* SIGNATURES AREA */}
              <div className="grid grid-cols-3 text-center text-xs pt-8">
                <div>
                  <p>Orang Tua / Wali Siswa,</p>
                  <div className="h-20"></div>
                  <p className="font-bold underline">..........................................</p>
                </div>
                <div>
                  <p>Wali Kelas,</p>
                  <div className="h-20 flex flex-col items-center justify-center">
                    <span className="text-[10px] text-blue-600 font-mono font-bold">DIGITALLY SIGNED</span>
                  </div>
                  <p className="font-bold underline">{selectedRapor.signatures?.homeroomTeacher?.name || 'M. Ridwan, S.Pd'}</p>
                  <p className="text-[10px] text-slate-500">NIP: {selectedRapor.signatures?.homeroomTeacher?.nip || '-'}</p>
                </div>
                <div>
                  <p>Kepala Sekolah,</p>
                  <div className="h-20 flex items-center justify-center gap-2">
                    <QrCode className="w-12 h-12 text-slate-900" />
                  </div>
                  <p className="font-bold underline">{selectedRapor.signatures?.headmaster?.name || 'Drs. H. Ahmad Dahlan, M.Pd'}</p>
                  <p className="text-[10px] text-slate-500">NIP: {selectedRapor.signatures?.headmaster?.nip || '-'}</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 2: CATATAN WALI KELAS FORM */}
      {/* ==================================================================== */}
      {isNotesModalOpen && selectedRapor && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-extrabold text-slate-950 text-base">Input Catatan Wali Kelas & Saran</h4>
              <button onClick={() => setIsNotesModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-3 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 mb-1">Catatan Utama Wali Kelas</label>
                <textarea
                  rows={3}
                  value={catatanWaliInput}
                  onChange={e => setCatatanWaliInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan catatan perkembangan belajar, keaktifan, dan ibadah..."
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Perkembangan Karakter & Kepribadian</label>
                <input
                  type="text"
                  value={perkembanganInput}
                  onChange={e => setPerkembanganInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Sangat baik dalam kepemimpinan dan kerjasama tim..."
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Saran / Rekomendasi</label>
                <input
                  type="text"
                  value={saranInput}
                  onChange={e => setSaranInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Pertahankan kebiasaan belajar dan tingkatkan hafalan Al-Quran..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setIsNotesModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer">Batal</button>
              <button
                onClick={() => saveNotesMutation.mutate({
                  id: selectedRapor.id,
                  studentId: selectedRapor.studentId,
                  catatanWali: catatanWaliInput,
                  perkembangan: perkembanganInput,
                  saran: saranInput
                })}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                Simpan Catatan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 3: BULK GENERATION MODAL */}
      {/* ==================================================================== */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-6 text-center">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
              <Zap className="w-6 h-6" />
            </div>

            <div>
              <h4 className="font-extrabold text-slate-950 text-base">Bulk Generate Rapor Digital</h4>
              <p className="text-xs text-slate-500 mt-1">Sistem akan melakukan komputasi dan snapshot nilai dari Auto Leger untuk seluruh siswa di Rombel {selectedRombel}.</p>
            </div>

            {isBulkGenerating ? (
              <div className="space-y-2">
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full transition-all duration-300" style={{ width: `${bulkProgress}%` }}></div>
                </div>
                <p className="text-xs font-bold text-blue-600">Mengkomputasi Rapor... {bulkProgress}%</p>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <button onClick={() => setIsBulkModalOpen(false)} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold cursor-pointer">Batal</button>
                <button
                  onClick={handleStartBulkGenerate}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold shadow-lg cursor-pointer"
                >
                  Mulai Generate
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 4: REVISI RAPOR DOKUMEN */}
      {/* ==================================================================== */}
      {isRevisionModalOpen && selectedRapor && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-extrabold text-slate-950 text-base">Buka Revisi Rapor</h4>
              <button onClick={() => setIsRevisionModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <p className="text-xs text-slate-600">
              Membuka revisi akan menaikkan versi dokumen ({selectedRapor.docNumber} → V{selectedRapor.version + 1}) tanpa menghapus histori versi sebelumnya.
            </p>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">Alasan Revisi / Perbaikan</label>
              <textarea
                rows={3}
                value={revisionReasonInput}
                onChange={e => setRevisionReasonInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="Contoh: Penyesuaian nilai praktik dan catatan wali kelas..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setIsRevisionModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer">Batal</button>
              <button
                onClick={() => reviseMutation.mutate({ id: selectedRapor.id, reason: revisionReasonInput })}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Konfirmasi Revisi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 5: APPROVAL / REJECTION MODAL */}
      {/* ==================================================================== */}
      {isApprovalModalOpen && selectedRapor && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-extrabold text-slate-950 text-base">Approval Rapor Kepala Sekolah</h4>
              <button onClick={() => setIsApprovalModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <p className="text-xs text-slate-600">
              Review Rapor untuk <strong>{selectedRapor.studentName}</strong> ({selectedRapor.rombel}).
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => workflowMutation.mutate({ actionName: 'rejectRapor', ids: [selectedRapor.id], reason: 'Perlu perbaikan catatan/nilai' })}
                className="px-4 py-2 bg-rose-100 text-rose-800 hover:bg-rose-200 rounded-xl text-xs font-bold cursor-pointer"
              >
                Reject (Perlu Perbaikan)
              </button>
              <button
                onClick={() => workflowMutation.mutate({ actionName: 'approveRapor', ids: [selectedRapor.id] })}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Approve Rapor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 6: VERIFIKASI QR QUICK MODAL */}
      {/* ==================================================================== */}
      {isVerifyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-extrabold text-slate-950 text-base flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-600" /> Cek Verifikasi QR Dokumen
              </h4>
              <button onClick={() => setIsVerifyModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Masukkan Nomor Dokumen / Kode QR..."
                value={verifyCodeInput}
                onChange={e => setVerifyCodeInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono font-bold"
              />
              <button
                onClick={() => verifyQRMutation.mutate(verifyCodeInput)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Verifikasi Dokumen
              </button>
            </div>

            {verificationResult && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-1">
                <p className="font-extrabold text-emerald-950">Status: {verificationResult.status}</p>
                <p className="text-emerald-800">{verificationResult.message}</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
