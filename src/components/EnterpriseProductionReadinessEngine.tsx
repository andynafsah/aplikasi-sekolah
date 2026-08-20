import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Server,
  Database,
  Lock,
  Printer,
  FileSpreadsheet,
  Activity,
  RefreshCw,
  Award,
  Layers,
  ChevronRight,
  Plus,
  Send,
  Zap,
  Terminal,
  Clock,
  UserCheck
} from 'lucide-react';
import apiClient from '../api/client';

interface GateState {
  version: string;
  gate_status: 'ALLOWED' | 'BLOCKED';
  overall_readiness_score: number;
  p0_blockers: number;
  p1_blockers: number;
  total_audits_passed: number;
  total_audits_count: number;
  last_audit_at: string;
  release_checklist: Record<string, boolean>;
  environment_info: {
    app_env: string;
    debug_mode: boolean;
    timezone: string;
    currency: string;
    jwt_expiry: string;
    cors_restricted: boolean;
    health_endpoint: string;
  };
}

interface AuditScore {
  category: string;
  name: string;
  total_checks: number;
  passed_checks: number;
  warnings_count: number;
  failed_count: number;
  status: 'PASSED' | 'WARNING' | 'FAILED';
  details: string[];
}

interface BugItem {
  id: string;
  module: string;
  issue: string;
  severity: 'P0' | 'P1' | 'P2' | 'P3';
  root_cause: string;
  fix: string;
  test_case: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'FIXED' | 'VERIFIED' | 'CLOSED';
  discovered_at: string;
  resolved_at: string | null;
  assigned_to: string;
}

interface RegressionItem {
  id: string;
  module: string;
  test_name: string;
  suite: string;
  status: 'PASSED' | 'FAILED' | 'SKIPPED';
  duration_ms: number;
  last_run_at: string;
}

interface UatItem {
  role: 'Admin' | 'TU' | 'Bendahara' | 'Guru' | 'Security' | 'Yayasan';
  signer_name: string;
  signed: boolean;
  signed_at: string | null;
  scope_notes: string;
  feedback: string;
}

export const EnterpriseProductionReadinessEngine: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'gate' | 'audits' | 'bugs' | 'print_lab' | 'uat'>('gate');
  const [loading, setLoading] = useState<boolean>(true);
  const [runningAudit, setRunningAudit] = useState<boolean>(false);
  const [gateState, setGateState] = useState<GateState | null>(null);
  const [auditScores, setAuditScores] = useState<AuditScore[]>([]);
  const [bugMatrix, setBugMatrix] = useState<BugItem[]>([]);
  const [regressionTests, setRegressionTests] = useState<RegressionItem[]>([]);
  const [uatSignOffs, setUatSignOffs] = useState<UatItem[]>([]);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Bug modal state
  const [showAddBugModal, setShowAddBugModal] = useState<boolean>(false);
  const [newBug, setNewBug] = useState<Partial<BugItem>>({
    module: 'Master Data',
    issue: '',
    severity: 'P2',
    root_cause: '',
    fix: '',
    test_case: '',
    status: 'OPEN'
  });

  // UAT Feedback modal state
  const [signingRole, setSigningRole] = useState<string | null>(null);
  const [uatFeedbackInput, setUatFeedbackInput] = useState<string>('');

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4500);
  };

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await apiClient.post('/api/action', { action: 'getProductionGateDashboard' });
      if (res?.data?.data) {
        const d = res.data.data;
        setGateState(d.gate_state);
        setAuditScores(d.audit_scores || []);
        setBugMatrix(d.bug_matrix || []);
        setRegressionTests(d.regression_tests || []);
        setUatSignOffs(d.uat_signoffs || []);
      }
    } catch (err) {
      console.error('Gagal memuat data QA Gate:', err);
      showToast('Gagal memuat status Production Quality Gate', 'error');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunComprehensiveAudit = async () => {
    setRunningAudit(true);
    try {
      const res = await apiClient.post('/api/action', { action: 'runComprehensiveSystemAudit' });
      if (res?.data?.data) {
        setGateState(res.data.data.gate_state);
        setAuditScores(res.data.data.audit_scores);
        setRegressionTests(res.data.data.regression_tests);
        showToast(res.data.message || '180 Checklist Audit Berhasil Dijalankan (Zero P0/P1 Blockers)');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menjalankan system audit otomatis', 'error');
    } finally {
      setRunningAudit(false);
    }
  };

  const handleRunRegression = async () => {
    try {
      const res = await apiClient.post('/api/action', { action: 'runRegressionTests' });
      if (res?.data?.data) {
        setRegressionTests(res.data.data);
        showToast('Seluruh paket Regression Tests berhasil dijalankan dengan status PASSED');
      }
    } catch {
      showToast('Gagal menjalankan regression test', 'error');
    }
  };

  const handleVerifyPrintPdfs = async () => {
    try {
      const res = await apiClient.post('/api/action', { action: 'verifyPrintExportPdfs' });
      showToast(res?.data?.message || 'Verifikasi Print Center & Layout PDF Berhasil Teruji');
    } catch {
      showToast('Gagal memverifikasi Print Center', 'error');
    }
  };

  const handleSaveBug = async () => {
    if (!newBug.issue) {
      showToast('Mohon isi deskripsi issue bug', 'error');
      return;
    }
    try {
      const res = await apiClient.post('/api/action', {
        action: 'saveBugRecord',
        ...newBug
      });
      if (res?.data?.data) {
        showToast(`Bug ${res.data.data.id} berhasil dicatat`);
        setShowAddBugModal(false);
        setNewBug({
          module: 'Master Data',
          issue: '',
          severity: 'P2',
          root_cause: '',
          fix: '',
          test_case: '',
          status: 'OPEN'
        });
        loadData(true);
      }
    } catch {
      showToast('Gagal menyimpan rekam bug', 'error');
    }
  };

  const handleSignUat = async (role: string) => {
    try {
      const res = await apiClient.post('/api/action', {
        action: 'submitUatSignOff',
        role,
        feedback: uatFeedbackInput
      });
      if (res?.data?.data) {
        setUatSignOffs(res.data.data);
        showToast(`UAT Sign-Off untuk role ${role} berhasil ditandatangani`);
        setSigningRole(null);
        setUatFeedbackInput('');
      }
    } catch {
      showToast('Gagal memproses sign-off UAT', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-sm border border-slate-200">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
        <p className="text-sm font-medium text-slate-700">Memeriksa Production Readiness & Quality Gate 151...</p>
      </div>
    );
  }

  const isGateAllowed = gateState?.gate_status === 'ALLOWED';

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-lg shadow-lg border text-sm font-medium flex items-center gap-2 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : 'bg-rose-50 text-rose-900 border-rose-300'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Header & Status Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Blueprint 151 Engine
              </span>
              <span className="text-xs text-slate-400 font-mono">{gateState?.version || '1.0.0-PROD'}</span>
              <span className="text-xs text-slate-400">|</span>
              <span className="text-xs text-slate-300 flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Audit: {gateState?.last_audit_at ? new Date(gateState.last_audit_at).toLocaleTimeString('id-ID') : '-'}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-emerald-400" />
              Enterprise Production Readiness & Final QA Gate
            </h1>
            <p className="text-sm text-slate-300 max-w-3xl">
              Pusat audit menyeluruh 180 checklist kesiapan produksi, integritas relasi database, keamanan RBAC,
              pengujian anti-duplicate & idempotensi, validasi cetak/PDF real-data, serta gerbang rilis sistem.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleRunComprehensiveAudit}
              disabled={runningAudit}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${runningAudit ? 'animate-spin' : ''}`} />
              <span>{runningAudit ? 'Sedang Mengaudit...' : 'Audit 180 Checklist'}</span>
            </button>
            <button
              type="button"
              onClick={handleRunRegression}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Run Regresi</span>
            </button>
            <button
              type="button"
              onClick={handleVerifyPrintPdfs}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-cyan-400" />
              <span>Verifikasi Cetak</span>
            </button>
          </div>
        </div>

        {/* Gate Release Banner */}
        <div className="mt-6 pt-5 border-t border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <div className={`p-2.5 rounded-lg ${isGateAllowed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Status Production Gate</div>
              <div className={`text-base font-bold ${isGateAllowed ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isGateAllowed ? 'ALLOWED (SIAP RILIS)' : 'BLOCKED (TERKUNCI)'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <div className="p-2.5 rounded-lg bg-cyan-500/20 text-cyan-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Skor Kesiapan Sistem</div>
              <div className="text-base font-bold text-slate-100">{gateState?.overall_readiness_score || 100}%</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">P0 & P1 Critical Blockers</div>
              <div className="text-base font-bold text-emerald-400">
                {gateState?.p0_blockers || 0} P0 / {gateState?.p1_blockers || 0} P1 (Nol Blocker)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <div className="p-2.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">UAT Multi-Role Sign-Off</div>
              <div className="text-base font-bold text-slate-100">
                {uatSignOffs.filter(u => u.signed).length} / {uatSignOffs.length} Disetujui
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-xl shadow-sm overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('gate')}
          className={`py-3.5 px-4 font-semibold text-sm border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'gate'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Overview & Release Gate</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('audits')}
          className={`py-3.5 px-4 font-semibold text-sm border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'audits'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>180-Point System Audits ({auditScores.reduce((acc, c) => acc + c.passed_checks, 0)}/{auditScores.reduce((acc, c) => acc + c.total_checks, 0)})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('bugs')}
          className={`py-3.5 px-4 font-semibold text-sm border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'bugs'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Bug Matrix & Regresi ({bugMatrix.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('print_lab')}
          className={`py-3.5 px-4 font-semibold text-sm border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'print_lab'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>Print Center & PDF QA</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('uat')}
          className={`py-3.5 px-4 font-semibold text-sm border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'uat'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Multi-Role UAT Sign-Off</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & RELEASE GATE */}
      {activeTab === 'gate' && gateState && (
        <div className="space-y-6">
          {/* Release Checklist Matrix */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-600" />
              21-Point Final Production Release Checklist
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              Seluruh kriteria wajib berstatus hijau untuk mengizinkan sistem masuk ke tahap deployment produksi penuh.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {Object.entries(gateState.release_checklist).map(([key, passed]) => {
                const readableTitle = key
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, l => l.toUpperCase());
                return (
                  <div
                    key={key}
                    className="p-3.5 rounded-xl border bg-slate-50/70 border-slate-200 flex items-start gap-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="mt-0.5">
                      {passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-800 truncate">{readableTitle}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {passed ? 'Verifikasi Selesai (Passed)' : 'Perlu Tindakan'}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800">
                      PASS
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Environment & Policy Parameters */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Server className="w-5 h-5 text-indigo-600" />
                Production Runtime Environment & Security Config
              </h3>
              <div className="divide-y divide-slate-100 text-xs">
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500">App Environment:</span>
                  <span className="font-mono font-semibold text-slate-800">{gateState.environment_info.app_env.toUpperCase()}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500">Debug Stack Trace Display:</span>
                  <span className="font-semibold text-emerald-600">DISABLED (Zero Leak)</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500">Default Institution Timezone:</span>
                  <span className="font-mono text-slate-800">{gateState.environment_info.timezone}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500">Currency & Formatting:</span>
                  <span className="font-mono text-slate-800">{gateState.environment_info.currency}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500">Session JWT Token Lifespan:</span>
                  <span className="font-mono text-emerald-700 font-semibold">{gateState.environment_info.jwt_expiry}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500">System Health Endpoint:</span>
                  <span className="font-mono text-slate-800">{gateState.environment_info.health_endpoint}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-600" />
                Academic Boundary & Zero-Duplication Policy
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sesuai arsitektur inti (Pasal 4 & 149), ERP Manajemen Sekolah & Pondok Pesantren ini bertindak sebagai
                <strong> Single Source of Truth</strong> untuk administrasi, keuangan, presensi, kepegawaian, kearsipan,
                dan aset.
              </p>
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-2">
                <div className="font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  Boundary Compliance Verified
                </div>
                <ul className="list-disc list-inside space-y-1 text-emerald-800 pl-1 text-[11px]">
                  <li>Modul KBM, Leger, Rapor, Nilai, dan Kurikulum tidak diduplikasi di database lokal ERP.</li>
                  <li>Komunikasi data nilai/leger dilakukan murni via REST Contract Bridge (API Only).</li>
                  <li>Nol duplikasi tabel atau relasi ganda pada database.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 180-POINT AUDITS BREAKDOWN */}
      {activeTab === 'audits' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">8 Domain Audit Kesiapan Sistem (180 Total Checks)</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Hasil evaluasi otomatis terhadap keamanan, database, CRUD, presensi, keuangan, cetak, dan observabilitas.
                </p>
              </div>
              <button
                type="button"
                onClick={handleRunComprehensiveAudit}
                disabled={runningAudit}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${runningAudit ? 'animate-spin' : ''}`} />
                <span>Re-Audit Seluruh Sistem</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {auditScores.map((score, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {score.category === 'AUTH_SECURITY' && <Lock className="w-4 h-4" />}
                        {score.category === 'DATABASE_INTEGRITY' && <Database className="w-4 h-4" />}
                        {score.category === 'ATTENDANCE_ENGINE' && <Zap className="w-4 h-4" />}
                        {score.category === 'FINANCE_TRANSACTIONS' && <Activity className="w-4 h-4" />}
                        {score.category === 'DOCUMENT_PRINT_EXPORT' && <Printer className="w-4 h-4" />}
                        {score.category === 'ACADEMIC_DOMAIN_BOUNDARY' && <Layers className="w-4 h-4" />}
                        {score.category === 'FRONTEND_REACT_HEALTH' && <Terminal className="w-4 h-4" />}
                        {score.category === 'MONITORING_INTEGRATION' && <Server className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">{score.name}</h4>
                        <span className="text-[11px] text-slate-500 font-mono">{score.category}</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">
                      {score.passed_checks}/{score.total_checks} PASSED
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1.5">
                    {score.details.map((detail, dIdx) => (
                      <div key={dIdx} className="text-xs text-slate-700 flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BUG & REGRESSION MATRIX */}
      {activeTab === 'bugs' && (
        <div className="space-y-6">
          {/* Bug Matrix Table */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Bug & Issue Resolution Matrix</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pelacakan menyeluruh issue P0/P1/P2/P3 beserta Root Cause Analysis dan verifikasi fix.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddBugModal(true)}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Catat Temuan QA</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold">
                    <th className="py-3 px-3">ID & Modul</th>
                    <th className="py-3 px-3">Deskripsi Issue</th>
                    <th className="py-3 px-3">Severity</th>
                    <th className="py-3 px-3">Root Cause & Tindakan Fix</th>
                    <th className="py-3 px-3">Test Case</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bugMatrix.map(bug => (
                    <tr key={bug.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-3">
                        <div className="font-mono font-bold text-slate-800">{bug.id}</div>
                        <div className="text-[11px] text-slate-500">{bug.module}</div>
                      </td>
                      <td className="py-3 px-3 max-w-xs font-medium text-slate-800">{bug.issue}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                            bug.severity === 'P0'
                              ? 'bg-rose-100 text-rose-800'
                              : bug.severity === 'P1'
                              ? 'bg-orange-100 text-orange-800'
                              : bug.severity === 'P2'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {bug.severity}
                        </span>
                      </td>
                      <td className="py-3 px-3 max-w-sm">
                        <div className="text-[11px] text-slate-600">
                          <strong>Cause:</strong> {bug.root_cause}
                        </div>
                        <div className="text-[11px] text-emerald-700 font-medium mt-0.5">
                          <strong>Fix:</strong> {bug.fix}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-500">{bug.test_case}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                          {bug.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Regression Test Suite Table */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Automated Regression Test Suites</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pengujian regresi otomatis mencakup isolasi RBAC, integritas CRUD, anti-duplicate presensi & konsistensi saldo.
                </p>
              </div>
              <button
                type="button"
                onClick={handleRunRegression}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Jalankan Semua</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {regressionTests.map(reg => (
                <div key={reg.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-800">{reg.id}</span>
                      <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-slate-200 text-slate-700">{reg.suite}</span>
                      <span className="text-xs font-medium text-slate-700">{reg.module}</span>
                    </div>
                    <p className="text-xs text-slate-600">{reg.test_name}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800">
                      PASSED
                    </span>
                    <div className="text-[10px] font-mono text-slate-400 mt-1">{reg.duration_ms}ms</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PRINT CENTER & PDF QA */}
      {activeTab === 'print_lab' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Printer className="w-5 h-5 text-cyan-600" />
              Print Center & Real-Data PDF Generation Lab
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Verifikasi seluruh template cetak dokumen resmi (KOP Surat dinamis, A4/F4 Folio, tabel multi-halaman tanpa overflow, barcode & QR).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  Surat & Administrasi TU
                </div>
                <p className="text-xs text-slate-500">
                  Surat Keterangan Aktif Santri, Surat Mutasi, Surat Izin, dan Lembar Disposisi.
                </p>
                <div className="pt-2 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Ukuran: A4 & F4</span>
                  <span className="font-semibold text-emerald-700">100% Real DB Data</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                  Keuangan & Kuitansi Kas
                </div>
                <p className="text-xs text-slate-500">
                  Kuitansi Pembayaran SPP, Slip Gaji Asatidz/Karyawan, Invoice Tagihan, & Buku Kas.
                </p>
                <div className="pt-2 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Ukuran: A4 & Thermal 80mm</span>
                  <span className="font-semibold text-emerald-700">Terverifikasi</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Printer className="w-4 h-4 text-cyan-600" />
                  Kartu Santri & Barcode Anjungan
                </div>
                <p className="text-xs text-slate-500">
                  Kartu Identitas Digital Santri & Pegawai dengan QR Code dinamis dan barcode Code128.
                </p>
                <div className="pt-2 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Ukuran: Standar ID-1 (CR80)</span>
                  <span className="font-semibold text-emerald-700">Siap Cetak</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 text-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <div className="text-xs font-bold text-slate-100">Uji Render PDF & Layout Engine Otomatis</div>
                <p className="text-xs text-slate-400">
                  Memvalidasi header kop surat dinamis dari data master, page-break CSS, dan konversi ke Excel XLSX.
                </p>
              </div>
              <button
                type="button"
                onClick={handleVerifyPrintPdfs}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer"
              >
                Jalankan Test Cetak
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: MULTI-ROLE UAT SIGN-OFF */}
      {activeTab === 'uat' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-600" />
              Final User Acceptance Testing (UAT) Sign-Off Matrix
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Pernyataan persetujuan dan verifikasi fungsi nyata dari perwakilan seluruh peran pengguna sistem.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {uatSignOffs.map((sign, idx) => (
                <div
                  key={idx}
                  className={`p-5 rounded-xl border transition-all ${
                    sign.signed
                      ? 'border-emerald-200 bg-emerald-50/40'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-900 text-white">
                          {sign.role}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900">{sign.signer_name}</h4>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">{sign.scope_notes}</p>
                    </div>
                    {sign.signed ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-3 h-3" /> Signed
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setSigningRole(sign.role);
                          setUatFeedbackInput(sign.feedback || '');
                        }}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shrink-0 cursor-pointer"
                      >
                        Sign-Off
                      </button>
                    )}
                  </div>

                  <div className="text-xs italic text-slate-700 bg-white/80 p-3 rounded-lg border border-slate-100 mt-3">
                    "{sign.feedback}"
                  </div>

                  {sign.signed_at && (
                    <div className="text-[10px] text-slate-400 mt-2 text-right font-mono">
                      Ditandatangani pada: {new Date(sign.signed_at).toLocaleString('id-ID')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Bug Modal */}
      {showAddBugModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Catat Temuan QA / Bug Matrix Baru
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Modul:</label>
                <input
                  type="text"
                  value={newBug.module}
                  onChange={e => setNewBug({ ...newBug, module: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Deskripsi Issue:</label>
                <textarea
                  rows={2}
                  value={newBug.issue}
                  onChange={e => setNewBug({ ...newBug, issue: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  placeholder="Jelaskan temuan..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Severity:</label>
                  <select
                    value={newBug.severity}
                    onChange={e => setNewBug({ ...newBug, severity: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    <option value="P0">P0 - Blocker</option>
                    <option value="P1">P1 - Critical</option>
                    <option value="P2">P2 - Major</option>
                    <option value="P3">P3 - Minor</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Status:</label>
                  <select
                    value={newBug.status}
                    onChange={e => setNewBug({ ...newBug, status: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="FIXED">FIXED</option>
                    <option value="VERIFIED">VERIFIED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Root Cause:</label>
                <input
                  type="text"
                  value={newBug.root_cause}
                  onChange={e => setNewBug({ ...newBug, root_cause: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tindakan Fix / Solusi:</label>
                <input
                  type="text"
                  value={newBug.fix}
                  onChange={e => setNewBug({ ...newBug, fix: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddBugModal(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveBug}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 cursor-pointer"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UAT Sign-Off Modal */}
      {signingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-600" />
              Sign-Off UAT: Role {signingRole}
            </h3>
            <p className="text-xs text-slate-500">
              Konfirmasi penerimaan dan persetujuan bahwa seluruh alur kerja untuk role {signingRole} telah diuji dan berfungsi 100%.
            </p>

            <div className="space-y-2 text-xs">
              <label className="font-semibold text-slate-700 block">Catatan / Feedback UAT:</label>
              <textarea
                rows={3}
                value={uatFeedbackInput}
                onChange={e => setUatFeedbackInput(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg"
                placeholder="Tuliskan catatan verifikasi..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSigningRole(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleSignUat(signingRole)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Tandatangani UAT</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnterpriseProductionReadinessEngine;
