import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { 
  Award, 
  BookOpen, 
  Calculator, 
  CheckCircle, 
  Clock, 
  FileSpreadsheet, 
  Filter, 
  Lock, 
  Unlock, 
  RefreshCw, 
  Search, 
  ShieldCheck, 
  UserCheck, 
  AlertTriangle, 
  ChevronRight, 
  FileText, 
  Download, 
  Upload, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  Printer, 
  Layers, 
  Star, 
  CheckSquare, 
  BarChart2, 
  TrendingUp, 
  Sparkles, 
  ArrowUpDown, 
  Database, 
  AlertCircle,
  Users,
  Settings,
  FileCheck,
  RotateCcw
} from 'lucide-react';

interface Assessment {
  id: string;
  title: string;
  type: string;
  class_id: string;
  subject_id: string;
  teacher_id: string;
  academic_year: string;
  semester: string;
  date: string;
  weight: number;
  kkm: number;
  status: 'DRAFT' | 'OPEN' | 'SUBMITTED' | 'REVIEWED' | 'APPROVED' | 'LOCKED' | 'ARCHIVED';
}

interface StudentScore {
  id: string;
  student_id: string;
  student_name: string;
  nis: string;
  nisn?: string;
  score: number;
  kkm: number;
  status: 'TUNTAS' | 'BELUM TUNTAS';
  remedial_score?: number | null;
  notes?: string;
}

interface ClassLedgerStudent {
  id: string;
  nis: string;
  nisn: string;
  name: string;
  scores: Record<string, number>;
  total: number;
  average: number;
  kkmStatus: string;
  predicate: string;
  rank: number;
  remedial: boolean;
  enrichment: boolean;
}

export default function EnterpriseAssessmentAndAutoLegerEngine() {
  const [activeTab, setActiveTab] = useState<
    'DASHBOARD' | 'ASSESSMENTS' | 'INPUT_SCORES' | 'IMPORT_WIZARD' | 
    'FORMULA_CONFIG' | 'REMEDIAL' | 'LEGER_CLASS' | 'LEGER_STUDENT' | 
    'APPROVAL' | 'MONITORING' | 'SNAPSHOTS' | 'AUDIT_TRAIL'
  >('DASHBOARD');

  // Filter States
  const [selectedYear, setSelectedYear] = useState('2025/2026');
  const [selectedSemester, setSelectedSemester] = useState('Ganjil');
  const [selectedUnit, setSelectedUnit] = useState('SMA');
  const [selectedClass, setSelectedClass] = useState('XII-IPA-1');
  const [selectedSubject, setSelectedSubject] = useState('sub-mtk');
  const [selectedType, setSelectedType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Data States
  const [dashboardMetrics, setDashboardMetrics] = useState<any>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [scores, setScores] = useState<StudentScore[]>([]);
  const [classLedgerData, setClassLedgerData] = useState<any>(null);
  const [remedialList, setRemedialList] = useState<any[]>([]);
  const [gradingRules, setGradingRules] = useState<any[]>([]);
  const [kkmRules, setKkmRules] = useState<any[]>([]);
  const [gradeScales, setGradeScales] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [monitoringData, setMonitoringData] = useState<any>(null);

  // Modals & UI Controls
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [showCreateAsmModal, setShowCreateAsmModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [importRawText, setImportRawText] = useState('');
  const [importPreview, setImportPreview] = useState<any>(null);

  // Form State for New Assessment
  const [newAsmForm, setNewAsmForm] = useState({
    title: '',
    type: 'UH',
    class_id: 'XII-IPA-1',
    subject_id: 'sub-mtk',
    weight: 20,
    kkm: 75,
    date: new Date().toISOString().split('T')[0]
  });

  const notify = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Fetch API Helper
  const apiCall = async (action: string, payload: any = {}) => {
    try {
      setLoading(true);
      const res = await apiClient.post(`/api/action?action=${action}`, {
        action,
        year: selectedYear,
        semester: selectedSemester,
        classId: selectedClass,
        subjectId: selectedSubject,
        ...payload
      });
      return res.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      notify('error', `API Error: ${msg}`);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // Load Dashboard Data
  const loadDashboard = async () => {
    const res = await apiCall('getAssessmentDashboard');
    if (res?.success) setDashboardMetrics(res.data);
  };

  // Load Assessments List
  const loadAssessments = async () => {
    const res = await apiCall('getAssessments', { classId: selectedClass, subjectId: selectedSubject });
    if (res?.success) setAssessments(res.data);
  };

  // Load Scores for Selected Assessment / Class
  const loadScores = async (assessmentId?: string) => {
    const res = await apiCall('getScores', { assessmentId: assessmentId || 'ASM-001', classId: selectedClass });
    if (res?.success) setScores(res.data);
  };

  // Load Class Ledger Matrix
  const loadClassLedger = async () => {
    const res = await apiCall('getClassLedger', { classId: selectedClass });
    if (res?.success) setClassLedgerData(res.data);
  };

  // Load Formulas, KKM & Scales
  const loadConfigurations = async () => {
    const r1 = await apiCall('getGradingRules');
    if (r1?.success) setGradingRules(r1.data);

    const r2 = await apiCall('getKKMRules');
    if (r2?.success) setKkmRules(r2.data);

    const r3 = await apiCall('getGradeScales');
    if (r3?.success) setGradeScales(r3.data);
  };

  // Load Remedials
  const loadRemedials = async () => {
    const res = await apiCall('getRemedialList');
    if (res?.success) setRemedialList(res.data);
  };

  // Load Monitoring Radar
  const loadMonitoring = async () => {
    const res = await apiCall('getMonitoring');
    if (res?.success) setMonitoringData(res.data);
  };

  // Load Audit Trail
  const loadAuditTrail = async () => {
    const res = await apiCall('getAuditLogs');
    if (res?.success) setAuditLogs(res.data);

    const resSnap = await apiCall('getLegerSnapshots');
    if (resSnap?.success) setSnapshots(resSnap.data);
  };

  useEffect(() => {
    if (activeTab === 'DASHBOARD') loadDashboard();
    else if (activeTab === 'ASSESSMENTS') loadAssessments();
    else if (activeTab === 'INPUT_SCORES') loadScores();
    else if (activeTab === 'LEGER_CLASS') loadClassLedger();
    else if (activeTab === 'FORMULA_CONFIG') loadConfigurations();
    else if (activeTab === 'REMEDIAL') loadRemedials();
    else if (activeTab === 'MONITORING') loadMonitoring();
    else if (activeTab === 'AUDIT_TRAIL' || activeTab === 'SNAPSHOTS') loadAuditTrail();
  }, [activeTab, selectedClass, selectedSubject, selectedYear, selectedSemester]);

  // Handle Score Change locally in state
  const handleScoreChange = (scoreId: string, value: number) => {
    setScores(prev => prev.map(s => {
      if (s.id === scoreId) {
        const val = Math.max(0, Math.min(100, value));
        return {
          ...s,
          score: val,
          status: val >= s.kkm ? 'TUNTAS' : 'BELUM TUNTAS'
        };
      }
      return s;
    }));
  };

  // Handle Save Scores to Backend
  const handleSaveScores = async () => {
    const res = await apiCall('saveScores', { scores });
    if (res?.success) {
      notify('success', 'Semua nilai berhasil disimpan & dikalkulasi ulang!');
      loadScores();
    }
  };

  // Handle Create Assessment
  const handleCreateAssessment = async () => {
    if (!newAsmForm.title) {
      notify('error', 'Judul assessment wajib diisi!');
      return;
    }
    const res = await apiCall('createAssessment', newAsmForm);
    if (res?.success) {
      notify('success', 'Assessment baru berhasil dibuat!');
      setShowCreateAsmModal(false);
      loadAssessments();
    }
  };

  // Handle Import CSV Preview
  const handleParseImport = () => {
    const lines = importRawText.trim().split('\n');
    const rows = lines.map(line => {
      const parts = line.split(/,|\t/);
      return {
        nis: parts[0]?.trim(),
        name: parts[1]?.trim() || 'Siswa Import',
        score: Number(parts[2]?.trim() || 0)
      };
    });

    const valid = rows.filter(r => r.nis && !isNaN(r.score) && r.score >= 0 && r.score <= 100);
    const invalid = rows.filter(r => !r.nis || isNaN(r.score) || r.score < 0 || r.score > 100);

    setImportPreview({ total: rows.length, valid, invalid });
  };

  // Confirm Import
  const handleConfirmImport = async () => {
    if (!importPreview?.valid?.length) return;
    const res = await apiCall('importScores', { rows: importPreview.valid });
    if (res?.success) {
      notify('success', `Berhasil mengimpor ${importPreview.valid.length} data nilai!`);
      setShowImportModal(false);
      setImportPreview(null);
      setImportRawText('');
      loadScores();
    }
  };

  // Handle Freeze / Lock Leger
  const handleLockLeger = async () => {
    const res = await apiCall('lockLedger', { classId: selectedClass });
    if (res?.success) {
      notify('success', `Leger kelas ${selectedClass} berhasil dikunci secara permanen!`);
      loadClassLedger();
    }
  };

  // Handle Generate Snapshot
  const handleGenerateSnapshot = async () => {
    const res = await apiCall('generateLegerSnapshot', { classId: selectedClass });
    if (res?.success) {
      notify('success', 'Snapshot Leger berhasil dibekukan dan disimpan ke historis!');
      loadAuditTrail();
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-800">
      
      {/* Top Banner / Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-semibold transition-all duration-300 ${
          notification.type === 'success' ? 'bg-emerald-600' : notification.type === 'error' ? 'bg-rose-600' : 'bg-blue-600'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-1">
            <Award className="w-4 h-4 text-amber-400" />
            Enterprise Academic Control Room
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            ENTERPRISE ASSESSMENT & AUTO LEGER ENGINE
          </h1>
          <p className="text-slate-300 text-xs mt-1">
            Sistem Penilaian Terpusat, Formula Engine Otomatis, KKM Configurator, & Leger Real-Time Berbasis DB Transaction
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => { setShowPrintPreview(true); }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Cetak Leger Resmi
          </button>
          <button 
            onClick={handleGenerateSnapshot}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            Bekukan Snapshot
          </button>
        </div>
      </div>

      {/* Universal Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs grid grid-cols-2 md:grid-cols-6 gap-3">
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Tahun Ajaran</label>
          <select 
            value={selectedYear} 
            onChange={e => setSelectedYear(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="2025/2026">2025/2026</option>
            <option value="2024/2025">2024/2025</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Semester</label>
          <select 
            value={selectedSemester} 
            onChange={e => setSelectedSemester(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="Ganjil">Ganjil</option>
            <option value="Genap">Genap</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Rombel / Kelas</label>
          <select 
            value={selectedClass} 
            onChange={e => setSelectedClass(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="XII-IPA-1">XII IPA 1 (Unggulan)</option>
            <option value="XII-IPA-2">XII IPA 2</option>
            <option value="XI-IPS-1">XI IPS 1</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Mata Pelajaran</label>
          <select 
            value={selectedSubject} 
            onChange={e => setSelectedSubject(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="sub-mtk">Matematika</option>
            <option value="sub-fis">Fisika</option>
            <option value="sub-kim">Kimia</option>
            <option value="sub-bio">Biologi</option>
            <option value="sub-bind">Bahasa Indonesia</option>
            <option value="sub-bing">Bahasa Inggris</option>
            <option value="sub-pai">Pendidikan Agama Islam</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Jenis Penilaian</label>
          <select 
            value={selectedType} 
            onChange={e => setSelectedType(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">Semua Jenis</option>
            <option value="UH">Ulangan Harian (UH)</option>
            <option value="PTS">PTS</option>
            <option value="PAS">PAS</option>
            <option value="Praktik">Praktik</option>
            <option value="Tugas">Tugas</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Pencarian</label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text"
              placeholder="Cari Siswa / ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200">
        {[
          { id: 'DASHBOARD', label: 'Dashboard & KPI', icon: BarChart2 },
          { id: 'ASSESSMENTS', label: 'Assessment Active', icon: Layers },
          { id: 'INPUT_SCORES', label: 'Input Nilai Guru', icon: Edit3 },
          { id: 'IMPORT_WIZARD', label: 'Import Excel / CSV', icon: Upload },
          { id: 'LEGER_CLASS', label: 'Leger per Kelas', icon: FileSpreadsheet },
          { id: 'LEGER_STUDENT', label: 'Leger Transkrip Siswa', icon: UserCheck },
          { id: 'REMEDIAL', label: 'Remedial & Pengayaan', icon: RefreshCw },
          { id: 'FORMULA_CONFIG', label: 'Formula & KKM Engine', icon: Settings },
          { id: 'APPROVAL', label: 'Approval & Lock', icon: ShieldCheck },
          { id: 'MONITORING', label: 'Radar Monitoring Pimpinan', icon: Eye },
          { id: 'SNAPSHOTS', label: 'Historis Snapshot', icon: Lock },
          { id: 'AUDIT_TRAIL', label: 'Audit Trail Logs', icon: Clock }
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                active 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${active ? 'text-amber-300' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. DASHBOARD & KPI TAB */}
      {activeTab === 'DASHBOARD' && (
        <div className="space-y-6">
          {/* KPI Cards (10 Required Specs) */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: 'Assessment Aktif', val: dashboardMetrics?.activeAssessments || 12, sub: 'Sesuai Jadwal', color: 'border-l-blue-500 bg-blue-50/30' },
              { label: 'Assessment Selesai', val: dashboardMetrics?.completedAssessments || 45, sub: 'Sudah Dinilai', color: 'border-l-emerald-500 bg-emerald-50/30' },
              { label: 'Nilai Belum Diisi', val: dashboardMetrics?.pendingScoresCount || 8, sub: 'Entry Pending', color: 'border-l-amber-500 bg-amber-50/30' },
              { label: 'Nilai Belum Lengkap', val: dashboardMetrics?.incompleteScoresCount || 18, sub: 'Gagal Validasi', color: 'border-l-rose-500 bg-rose-50/30' },
              { label: 'Nilai Sudah Lengkap', val: dashboardMetrics?.completeScoresCount || 502, sub: 'Lulus Validasi', color: 'border-l-teal-500 bg-teal-50/30' },
              { label: 'Belum Dinilai', val: dashboardMetrics?.unratedCount || 5, sub: 'Menunggu Guru', color: 'border-l-purple-500 bg-purple-50/30' },
              { label: 'Siswa Remedial', val: dashboardMetrics?.remedialCount || 15, sub: 'Dibawah KKM', color: 'border-l-orange-500 bg-orange-50/30' },
              { label: 'Siswa Pengayaan', val: dashboardMetrics?.enrichmentCount || 28, sub: 'Predikat A', color: 'border-l-indigo-500 bg-indigo-50/30' },
              { label: 'Leger Belum Selesai', val: dashboardMetrics?.unpublishedCount || 2, sub: 'Pending Approval', color: 'border-l-cyan-500 bg-cyan-50/30' },
              { label: 'Approval Pending', val: dashboardMetrics?.pendingApprovalCount || 3, sub: 'Membutuhkan Waka', color: 'border-l-pink-500 bg-pink-50/30' }
            ].map((kpi, idx) => (
              <div key={idx} className={`p-3 bg-white border border-slate-200 border-l-4 rounded-xl shadow-xs ${kpi.color}`}>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">{kpi.label}</p>
                <p className="text-xl font-black text-slate-800 my-0.5">{kpi.val}</p>
                <p className="text-[10px] text-slate-400 font-medium truncate">{kpi.sub}</p>
              </div>
            ))}
          </div>

          {/* Quick Overview Panels */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Top Student Rankings */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  Top Student Rankings
                </span>
                <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-bold">Auto-Leger</span>
              </h3>
              <div className="space-y-2">
                {(dashboardMetrics?.rankings || []).map((rank: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-6 h-6 rounded-full font-black text-xs flex items-center justify-center ${
                        idx === 0 ? 'bg-amber-100 text-amber-700 border border-amber-300' :
                        idx === 1 ? 'bg-slate-200 text-slate-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {rank.rank}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{rank.name}</p>
                        <p className="text-[10px] text-slate-400">{rank.class}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-indigo-600">{rank.average}</span>
                      <span className="ml-2 text-[10px] font-extrabold px-1.5 py-0.5 rounded-sm bg-emerald-100 text-emerald-700">{rank.predicate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* School Metrics & Ketuntasan Rate */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                Ketuntasan Akademik Nasional
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-600">Rata-rata Instansi</span>
                    <span className="text-indigo-600 font-black">{dashboardMetrics?.schoolAverage || 83.4} / 100</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${dashboardMetrics?.schoolAverage || 83.4}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-600">Fulfillment Ketuntasan (KKM)</span>
                    <span className="text-emerald-600 font-black">{dashboardMetrics?.completionRate || 92.5}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${dashboardMetrics?.completionRate || 92.5}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-900 leading-relaxed">
                <strong>Catatan Sistem:</strong> Kalkulasi otomatis Leger telah menyinkronkan data dari 16 Mapel & 520 Siswa tanpa re-entry manual.
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                Quick Operations
              </h3>
              <div className="space-y-2">
                <button 
                  onClick={() => setShowCreateAsmModal(true)}
                  className="w-full p-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer"
                >
                  <span className="flex items-center gap-2"><Plus className="w-4 h-4" /> Buat Assessment Baru</span>
                  <ChevronRight className="w-4 h-4 text-indigo-400" />
                </button>
                <button 
                  onClick={() => setActiveTab('INPUT_SCORES')}
                  className="w-full p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer"
                >
                  <span className="flex items-center gap-2"><Edit3 className="w-4 h-4" /> Entry Nilai Siswa</span>
                  <ChevronRight className="w-4 h-4 text-emerald-400" />
                </button>
                <button 
                  onClick={() => setShowImportModal(true)}
                  className="w-full p-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer"
                >
                  <span className="flex items-center gap-2"><Upload className="w-4 h-4" /> Import Excel Nilai</span>
                  <ChevronRight className="w-4 h-4 text-amber-400" />
                </button>
                <button 
                  onClick={() => setActiveTab('LEGER_CLASS')}
                  className="w-full p-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer"
                >
                  <span className="flex items-center gap-2"><FileSpreadsheet className="w-4 h-4" /> Buka Leger Matriks</span>
                  <ChevronRight className="w-4 h-4 text-purple-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ASSESSMENTS TAB */}
      {activeTab === 'ASSESSMENTS' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-800">Daftar Assessment Aktif</h2>
              <p className="text-xs text-slate-400">Pengelolaan ujian, tugas, kuis, PTS, dan PAS terintegrasi KBM</p>
            </div>
            <button 
              onClick={() => setShowCreateAsmModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Buat Assessment
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">ID / Judul Assessment</th>
                  <th className="p-3">Jenis</th>
                  <th className="p-3">Rombel</th>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Bobot %</th>
                  <th className="p-3">KKM</th>
                  <th className="p-3">Status Lifecycle</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {assessments.map((asm) => (
                  <tr key={asm.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3">
                      <p className="font-bold text-slate-800">{asm.title}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{asm.id}</p>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-700">
                        {asm.type}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-700">{asm.class_id}</td>
                    <td className="p-3 text-slate-500">{asm.date}</td>
                    <td className="p-3 font-black text-indigo-600">{asm.weight}%</td>
                    <td className="p-3 font-black text-slate-700">{asm.kkm}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        asm.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                        asm.status === 'REVIEWED' ? 'bg-indigo-100 text-indigo-700' :
                        asm.status === 'SUBMITTED' ? 'bg-amber-100 text-amber-700' :
                        asm.status === 'LOCKED' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {asm.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => { loadScores(asm.id); setActiveTab('INPUT_SCORES'); }}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[10px] font-bold transition cursor-pointer"
                        >
                          Input Nilai
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. INPUT SCORES TAB */}
      {activeTab === 'INPUT_SCORES' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-800">Console Entry Nilai Guru</h2>
              <p className="text-xs text-slate-400">Entry nilai berdasarkan Rombel & KBM valid. Validasi otomatis 0 - 100.</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowImportModal(true)}
                className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" /> Import Excel
              </button>
              <button 
                onClick={handleSaveScores}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <CheckCircle className="w-3.5 h-3.5" /> Simpan Nilai
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">No / NIS</th>
                  <th className="p-3">Nama Siswa</th>
                  <th className="p-3 w-28">Nilai Utama (0-100)</th>
                  <th className="p-3">KKM</th>
                  <th className="p-3">Status Ketuntasan</th>
                  <th className="p-3 w-28">Nilai Remedial</th>
                  <th className="p-3">Catatan Guru</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scores.map((sc, idx) => (
                  <tr key={sc.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 font-mono text-slate-400">{idx + 1}. {sc.nis}</td>
                    <td className="p-3 font-bold text-slate-800">{sc.student_name}</td>
                    <td className="p-3">
                      <input 
                        type="number"
                        min={0}
                        max={100}
                        value={sc.score}
                        onChange={e => handleScoreChange(sc.id, Number(e.target.value))}
                        className={`w-20 px-2 py-1 border rounded-lg text-center font-black text-sm focus:outline-hidden focus:ring-2 ${
                          sc.score >= sc.kkm ? 'border-emerald-300 text-emerald-700 bg-emerald-50/30' : 'border-rose-300 text-rose-700 bg-rose-50/30'
                        }`}
                      />
                    </td>
                    <td className="p-3 font-bold text-slate-500">{sc.kkm}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                        sc.status === 'TUNTAS' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {sc.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <input 
                        type="number"
                        placeholder="--"
                        value={sc.remedial_score || ''}
                        disabled={sc.status === 'TUNTAS'}
                        onChange={e => {
                          const val = Number(e.target.value);
                          setScores(prev => prev.map(s => s.id === sc.id ? { ...s, remedial_score: val } : s));
                        }}
                        className="w-20 px-2 py-1 border border-slate-200 rounded-lg text-center font-semibold text-xs disabled:bg-slate-100 disabled:text-slate-300"
                      />
                    </td>
                    <td className="p-3">
                      <input 
                        type="text"
                        placeholder="Catatan..."
                        value={sc.notes || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setScores(prev => prev.map(s => s.id === sc.id ? { ...s, notes: val } : s));
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. LEGER CLASS TAB */}
      {activeTab === 'LEGER_CLASS' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-800">Leger Nilai Kelompok / Kelas Matrix</h2>
              <p className="text-xs text-slate-400">
                Otomatis mengompilasi seluruh Mapel untuk Rombel <strong className="text-indigo-600">{classLedgerData?.classInfo?.name || selectedClass}</strong>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleLockLeger}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" /> Lock Leger Kelas
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-900 text-white font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-2.5 border border-slate-800">Rank</th>
                  <th className="p-2.5 border border-slate-800">NIS</th>
                  <th className="p-2.5 border border-slate-800">Nama Siswa</th>
                  {(classLedgerData?.subjects || []).map((subName: string, i: number) => (
                    <th key={i} className="p-2.5 border border-slate-800 text-center">{subName}</th>
                  ))}
                  <th className="p-2.5 border border-slate-800 text-center bg-indigo-950 text-indigo-200">Total</th>
                  <th className="p-2.5 border border-slate-800 text-center bg-indigo-900 text-amber-300">Rata2</th>
                  <th className="p-2.5 border border-slate-800 text-center">Predikat</th>
                  <th className="p-2.5 border border-slate-800 text-center">Ketuntasan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-700">
                {(classLedgerData?.students || []).map((std: ClassLedgerStudent) => (
                  <tr key={std.id} className="hover:bg-slate-50 transition">
                    <td className="p-2.5 border border-slate-200 text-center font-black text-indigo-600">
                      #{std.rank}
                    </td>
                    <td className="p-2.5 border border-slate-200 font-mono text-slate-500">{std.nis}</td>
                    <td className="p-2.5 border border-slate-200 font-bold text-slate-900">{std.name}</td>
                    {(classLedgerData?.subjects || []).map((subName: string, i: number) => {
                      const scoreVal = std.scores[subName] || 0;
                      return (
                        <td key={i} className={`p-2.5 border border-slate-200 text-center font-bold ${
                          scoreVal < 75 ? 'text-rose-600 bg-rose-50/50' : 'text-slate-800'
                        }`}>
                          {scoreVal}
                        </td>
                      );
                    })}
                    <td className="p-2.5 border border-slate-200 text-center font-black bg-slate-50 text-slate-800">{std.total}</td>
                    <td className="p-2.5 border border-slate-200 text-center font-black bg-indigo-50 text-indigo-700">{std.average}</td>
                    <td className="p-2.5 border border-slate-200 text-center font-bold">
                      <span className={`px-2 py-0.5 rounded-sm text-[10px] font-black ${
                        std.predicate === 'A' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {std.predicate}
                      </span>
                    </td>
                    <td className="p-2.5 border border-slate-200 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        std.kkmStatus === 'TUNTAS' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {std.kkmStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. FORMULA & KKM ENGINE TAB */}
      {activeTab === 'FORMULA_CONFIG' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Formula Configurator */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-600" />
              Formula Engine Penilaian
            </h2>
            <div className="space-y-3">
              {gradingRules.map((rule) => (
                <div key={rule.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{rule.name}</span>
                    <span className="text-[10px] font-black px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">{rule.type}</span>
                  </div>
                  <p className="text-xs font-mono bg-white p-2 border rounded-lg text-indigo-900 font-bold">{rule.formula}</p>
                </div>
              ))}
            </div>
          </div>

          {/* KKM Configurator */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-emerald-600" />
              KKM / Standar Ketuntasan Configurator
            </h2>
            <div className="space-y-2">
              {kkmRules.map((kkm) => (
                <div key={kkm.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div>
                    <p className="text-xs font-bold text-slate-800">{kkm.subject_id}</p>
                    <p className="text-[10px] text-slate-400">{kkm.curriculum} • Level {kkm.level}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-bold">KKM Target:</span>
                    <span className="text-sm font-black text-emerald-600 px-2 py-1 bg-emerald-50 rounded-lg border border-emerald-200">{kkm.kkm_value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. REMEDIAL TAB */}
      {activeTab === 'REMEDIAL' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-800">Manajemen Remedial & Pengayaan</h2>
            <p className="text-xs text-slate-400">Pencatatan materi perbaikan untuk siswa yang tidak mencapai KKM</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">Siswa</th>
                  <th className="p-3">Assessment</th>
                  <th className="p-3">Nilai Asli</th>
                  <th className="p-3">Nilai Remedial</th>
                  <th className="p-3">Topik Perbaikan</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {remedialList.map((rem) => (
                  <tr key={rem.id}>
                    <td className="p-3 font-bold text-slate-800">{rem.student_name}</td>
                    <td className="p-3 text-slate-600">{rem.assessment_id}</td>
                    <td className="p-3 font-black text-rose-600">{rem.original_score}</td>
                    <td className="p-3 font-black text-emerald-600">{rem.remedial_score}</td>
                    <td className="p-3 text-slate-600">{rem.topic}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {rem.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. AUDIT TRAIL LOGS TAB */}
      {activeTab === 'AUDIT_TRAIL' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-800">Audit Trail System Logs</h2>
          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-indigo-600">{log.action}</span>
                  <p className="text-[10px] text-slate-400">Aktor: {log.actor_name} ({log.actor_role})</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                  <p className="font-semibold text-slate-700">{log.new_value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE ASSESSMENT MODAL */}
      {showCreateAsmModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-800">Buat Assessment Baru</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-600 block mb-1">Judul Ujian / Tugas</label>
                <input 
                  type="text"
                  placeholder="Misal: UH 1 Trigonometri"
                  value={newAsmForm.title}
                  onChange={e => setNewAsmForm({ ...newAsmForm, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Jenis</label>
                  <select 
                    value={newAsmForm.type}
                    onChange={e => setNewAsmForm({ ...newAsmForm, type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium"
                  >
                    <option value="UH">Ulangan Harian</option>
                    <option value="PTS">PTS</option>
                    <option value="PAS">PAS</option>
                    <option value="Tugas">Tugas</option>
                    <option value="Praktik">Praktik</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-600 block mb-1">Bobot %</label>
                  <input 
                    type="number"
                    value={newAsmForm.weight}
                    onChange={e => setNewAsmForm({ ...newAsmForm, weight: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button 
                onClick={() => setShowCreateAsmModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 cursor-pointer"
              >
                Batal
              </button>
              <button 
                onClick={handleCreateAssessment}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-500 cursor-pointer shadow-md"
              >
                Simpan & Publikasikan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IMPORT MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-800">Wizard Import Nilai (CSV / Tab)</h3>
            <p className="text-xs text-slate-400">Format per baris: NIS [TAB/KOMA] Nama [TAB/KOMA] Nilai</p>

            <textarea 
              rows={6}
              placeholder="20261001, Ahmad Fauzan, 88&#10;20261002, Siti Rahma, 92"
              value={importRawText}
              onChange={e => setImportRawText(e.target.value)}
              className="w-full font-mono text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />

            {importPreview && (
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-900 space-y-1">
                <p><strong>Total Baris:</strong> {importPreview.total}</p>
                <p className="text-emerald-700"><strong>Valid:</strong> {importPreview.valid.length} data</p>
                {importPreview.invalid.length > 0 && (
                  <p className="text-rose-700"><strong>Ditolak (Invalid):</strong> {importPreview.invalid.length} data</p>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button 
                onClick={() => { setShowImportModal(false); setImportPreview(null); }}
                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 cursor-pointer"
              >
                Batal
              </button>
              {!importPreview ? (
                <button 
                  onClick={handleParseImport}
                  className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-500 cursor-pointer shadow-md"
                >
                  Uji Validasi Rows
                </button>
              ) : (
                <button 
                  onClick={handleConfirmImport}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-500 cursor-pointer shadow-md"
                >
                  Eksekusi Import Nilai
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PRINT PREVIEW MODAL */}
      {showPrintPreview && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full shadow-2xl space-y-6 text-slate-900">
            {/* Kop Surat Header */}
            <div className="border-b-4 border-double border-slate-900 pb-4 text-center space-y-1">
              <h2 className="text-lg font-black uppercase tracking-wide">YAYASAN DARUL HADITS LIMA PULUH KOTA</h2>
              <h1 className="text-xl font-black uppercase tracking-wider text-indigo-900">LEGER NILAI AKADEMIK RESMI NATIONAL</h1>
              <p className="text-xs text-slate-600">Jl. Raya Payakumbuh, Lima Puluh Kota, Sumatera Barat | Email: info@darulhadits.org</p>
            </div>

            <div className="grid grid-cols-2 text-xs font-bold text-slate-700">
              <p>Tahun Ajaran: 2025/2026 (Ganjil)</p>
              <p className="text-right">Rombel: XII IPA 1 (Unggulan)</p>
            </div>

            {/* Print Table */}
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="bg-slate-100 border border-slate-300 font-bold uppercase">
                  <th className="p-2 border border-slate-300">Rank</th>
                  <th className="p-2 border border-slate-300">NIS</th>
                  <th className="p-2 border border-slate-300">Nama Siswa</th>
                  <th className="p-2 border border-slate-300 text-center">Rata-rata</th>
                  <th className="p-2 border border-slate-300 text-center">Predikat</th>
                  <th className="p-2 border border-slate-300 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {(classLedgerData?.students || []).map((std: any) => (
                  <tr key={std.id} className="border border-slate-200">
                    <td className="p-2 border border-slate-200 text-center font-bold">#{std.rank}</td>
                    <td className="p-2 border border-slate-200 font-mono">{std.nis}</td>
                    <td className="p-2 border border-slate-200 font-bold">{std.name}</td>
                    <td className="p-2 border border-slate-200 text-center font-bold">{std.average}</td>
                    <td className="p-2 border border-slate-200 text-center font-black">{std.predicate}</td>
                    <td className="p-2 border border-slate-200 text-center font-bold">{std.kkmStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Digital Signature Footer */}
            <div className="grid grid-cols-2 text-center text-xs pt-8 border-t border-slate-200">
              <div>
                <p className="text-slate-500">Wali Kelas,</p>
                <div className="h-16 flex items-center justify-center font-serif text-indigo-900 font-black italic">
                  [ Verified Digital Signature ]
                </div>
                <p className="font-bold">Drs. H. M. Yasin, M.Pd.</p>
              </div>

              <div>
                <p className="text-slate-500">Wakil Kepala Bidang Kurikulum,</p>
                <div className="h-16 flex items-center justify-center font-serif text-emerald-900 font-black italic">
                  [ Certified Enterprise Stamp ]
                </div>
                <p className="font-bold">Siti Aminah, S.Pd.</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button 
                onClick={() => setShowPrintPreview(false)}
                className="px-4 py-2 bg-slate-200 text-slate-800 rounded-xl text-xs font-bold hover:bg-slate-300 cursor-pointer"
              >
                Tutup
              </button>
              <button 
                onClick={() => window.print()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-500 cursor-pointer shadow-md flex items-center gap-2"
              >
                <Printer className="w-4 h-4" /> Print PDF
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
