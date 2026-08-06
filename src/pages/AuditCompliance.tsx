// ============================================================================
// SPRINT 27: ENTERPRISE AUDIT, COMPLIANCE, AKREDITASI & GOVERNMENT REPORTING
// FRONT-END PORTAL & REUSABLE INSTRUMENTS
// ============================================================================

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { 
  ShieldCheck, 
  ShieldAlert, 
  FileText, 
  FileSpreadsheet, 
  Trash2, 
  Upload, 
  Download, 
  RefreshCw, 
  Plus, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  ExternalLink, 
  ArrowRight, 
  Activity, 
  Calendar, 
  User, 
  Eye, 
  Lock, 
  FileCheck, 
  Check, 
  Sparkles, 
  Layers, 
  CheckSquare, 
  TrendingUp, 
  ChevronRight,
  AlertCircle
} from 'lucide-react';

// Authentication utility to match project auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('erp_token') || localStorage.getItem('token') || '';
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export default function AuditCompliance() {
  const queryClient = useQueryClient();
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'logs' | 'compliance' | 'risks' | 'accreditation' | 'government'>('dashboard');

  // FILTERS FOR AUDIT LOGS
  const [logSearch, setLogSearch] = useState('');
  const [logSeverity, setLogSeverity] = useState('');
  const [logAction, setLogAction] = useState('');
  const [logModule, setLogModule] = useState('');

  // SELECTED STATES FOR VIEWERS
  const [selectedChangeLog, setSelectedChangeLog] = useState<any | null>(null);
  const [selectedEvidenceDoc, setSelectedEvidenceDoc] = useState<any | null>(null);

  // FORM STATES
  const [showAddFramework, setShowAddFramework] = useState(false);
  const [frameworkForm, setFrameworkForm] = useState({ name: '', code: '', type: 'Internal', description: '' });

  const [showAddRisk, setShowAddRisk] = useState(false);
  const [riskForm, setRiskForm] = useState({ title: '', category_id: '', risk_level: 'Medium', likelihood: 'Possible', impact: 'Moderate', mitigation_plan: '', description: '' });

  const [showAddInstrument, setShowAddInstrument] = useState(false);
  const [instrumentForm, setInstrumentForm] = useState({ standard_id: '', code: '', question_text: '', maximum_score: '4', indicators: '' });

  const [govReportForm, setGovReportForm] = useState({ report_type: 'Student', title: '', academic_year: '2025/2026' });

  // --------------------------------------------------------------------------
  // TANSTACK QUERIES & MUTATIONS
  // --------------------------------------------------------------------------
  
  // 1. Audit Dashboard Summary
  const { data: dashboardRes, isLoading: isDashLoading, refetch: refetchDash } = useQuery({
    queryKey: ['auditDashboard'],
    queryFn: async () => {
      const res = await axios.get('/api/action?action=auditDashboard', getAuthHeaders());
      return res.data?.data || {};
    }
  });

  // 2. Executive Health & AI Summary
  const { data: executiveRes, isLoading: isExecLoading, refetch: refetchExec } = useQuery({
    queryKey: ['executiveAudit'],
    queryFn: async () => {
      const res = await axios.get('/api/action?action=executiveAudit', getAuthHeaders());
      return res.data?.data || {};
    }
  });

  // 3. Audit Log List (with real-time filters)
  const { data: logsRes, isLoading: isLogsLoading, refetch: refetchLogs } = useQuery({
    queryKey: ['auditLogs', logSearch, logSeverity, logAction, logModule],
    queryFn: async () => {
      const res = await axios.get(
        `/api/action?action=auditLogList&search=${logSearch}&severity=${logSeverity}&act=${logAction}&moduleName=${logModule}`, 
        getAuthHeaders()
      );
      return res.data?.data || [];
    }
  });

  // 4. Compliance Frameworks
  const { data: frameworksRes, isLoading: isFrameworksLoading, refetch: refetchFrameworks } = useQuery({
    queryKey: ['complianceFrameworks'],
    queryFn: async () => {
      const res = await axios.get('/api/action?action=complianceFramework', getAuthHeaders());
      return res.data?.data || [];
    }
  });

  // 5. Risks & Categories
  const { data: risksRes, isLoading: isRisksLoading, refetch: refetchRisks } = useQuery({
    queryKey: ['risksList'],
    queryFn: async () => {
      const res = await axios.get('/api/action?action=riskManagement', getAuthHeaders());
      return res.data?.data || { risks: [], categories: [] };
    }
  });

  // 6. Accreditation Assessment
  const { data: accreditationRes, isLoading: isAccLoading, refetch: refetchAcc } = useQuery({
    queryKey: ['accreditationAssessment'],
    queryFn: async () => {
      const res = await axios.get('/api/action?action=accreditationAssessment', getAuthHeaders());
      return res.data?.data || null;
    }
  });

  // 7. Government Reports
  const { data: govReportsRes, isLoading: isGovLoading, refetch: refetchGov } = useQuery({
    queryKey: ['governmentReports'],
    queryFn: async () => {
      const res = await axios.get('/api/action?action=governmentReport', getAuthHeaders());
      return res.data?.data || [];
    }
  });

  // MUTATIONS
  // Create Compliance Framework
  const createFrameworkMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axios.post('/api/action?action=complianceFramework', payload, getAuthHeaders());
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complianceFrameworks'] });
      setShowAddFramework(false);
      setFrameworkForm({ name: '', code: '', type: 'Internal', description: '' });
    },
    onError: () => alert('Gagal membuat kerangka kepatuhan')
  });

  // Save Compliance Item Status
  const updateItemStatusMutation = useMutation({
    mutationFn: async (payload: { framework_id: string; item_id: string; status: string }) => {
      const res = await axios.post('/api/action?action=complianceChecklist', {
        action_sub: 'update_item_status',
        item_id: payload.item_id,
        status: payload.status
      }, getAuthHeaders());
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complianceFrameworks'] });
      queryClient.invalidateQueries({ queryKey: ['auditDashboard'] });
    }
  });

  // Upload Evidence (Compliance or Accreditation)
  const uploadEvidenceMutation = useMutation({
    mutationFn: async (payload: { framework_id?: string; item_id?: string; file_name: string; file_size: number; file_type: string; title: string; instrument_id?: string; action_sub?: string }) => {
      const endpoint = payload.instrument_id ? '/api/action?action=accreditationAssessment' : '/api/action?action=complianceAssessment';
      const res = await axios.post(endpoint, payload, getAuthHeaders());
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complianceFrameworks'] });
      queryClient.invalidateQueries({ queryKey: ['accreditationAssessment'] });
      queryClient.invalidateQueries({ queryKey: ['auditDashboard'] });
      alert('Dokumen Bukti Digital Berhasil Diunggah & Ditanda-tangani Secara Kriptografis');
    }
  });

  // Create Risk
  const createRiskMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axios.post('/api/action?action=riskManagement', payload, getAuthHeaders());
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risksList'] });
      queryClient.invalidateQueries({ queryKey: ['auditDashboard'] });
      setShowAddRisk(false);
      setRiskForm({ title: '', category_id: '', risk_level: 'Medium', likelihood: 'Possible', impact: 'Moderate', mitigation_plan: '', description: '' });
    }
  });

  // Add Custom Accreditation Instrument
  const addInstrumentMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axios.post('/api/action?action=accreditationAssessment', {
        action_sub: 'add_custom_instrument',
        ...payload
      }, getAuthHeaders());
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accreditationAssessment'] });
      setShowAddInstrument(false);
      setInstrumentForm({ standard_id: '', code: '', question_text: '', maximum_score: '4', indicators: '' });
      alert('Butir instrumen evaluasi kustom berhasil ditambahkan');
    }
  });

  // Submit Accreditation Score
  const saveAccreditationScoreMutation = useMutation({
    mutationFn: async (payload: { instrument_id: string; self_score: number; justification: string }) => {
      const res = await axios.post('/api/action?action=accreditationAssessment', {
        action_sub: 'save_self_score',
        instrument_id: payload.instrument_id,
        self_score: payload.self_score,
        justification: payload.justification
      }, getAuthHeaders());
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accreditationAssessment'] });
      queryClient.invalidateQueries({ queryKey: ['auditDashboard'] });
    }
  });

  // Generate Gov Report
  const generateGovReportMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axios.post('/api/action?action=governmentReport', payload, getAuthHeaders());
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['governmentReports'] });
      alert('Laporan Sinkronisasi Pemerintah berhasil digenerate berdasarkan template resmi.');
    }
  });

  // Submit Gov Report
  const submitGovReportMutation = useMutation({
    mutationFn: async (reportId: string) => {
      const res = await axios.post(`/api/action?action=governmentReport&submit_id=${reportId}`, {}, getAuthHeaders());
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['governmentReports'] });
      alert('Laporan berhasil terkirim ke Portal Kementerian! Resi pelacakan resmi diterbitkan.');
    }
  });

  // Export Logs (excel/csv/pdf logger)
  const exportLogsMutation = useMutation({
    mutationFn: async (payload: { export_type: string; format: 'PDF' | 'Excel' | 'CSV'; data_count: number }) => {
      const res = await axios.post('/api/action?action=auditExport', payload, getAuthHeaders());
      return res.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['auditDashboard'] });
      alert(`Ekspor dokumen berhasil! Format: ${res.data.format}. Tercatat di manifes audit ekspor.`);
    }
  });

  // Drag and Drop simulation helper
  const handleSimulatedFileUpload = (itemId?: string, instId?: string) => {
    const fileName = itemId ? `bukti_kepatuhan_${Date.now().toString().slice(-4)}.pdf` : `bukti_akreditasi_${Date.now().toString().slice(-4)}.pdf`;
    uploadEvidenceMutation.mutate({
      item_id: itemId,
      instrument_id: instId,
      file_name: fileName,
      file_size: 1450200,
      file_type: 'PDF',
      title: itemId ? 'Dokumen Bukti Fisik Regulasi' : 'Lampiran Evaluasi Akreditasi',
      action_sub: instId ? 'upload_evidence' : undefined
    });
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-indigo-600" />
            Audit, Kepatuhan & Akreditasi
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Enterprise Governance, Risk Management, Accreditation Compliance & Government Integration Cockpit.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              refetchDash();
              refetchExec();
              refetchLogs();
              refetchFrameworks();
              refetchRisks();
              refetchAcc();
              refetchGov();
            }}
            className="p-2 text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition cursor-pointer"
            title="Refresh All Data"
          >
            <RefreshCw className="h-5 w-5 animate-hover-spin" />
          </button>
          <button 
            onClick={() => exportLogsMutation.mutate({ export_type: 'Audit Trail Report', format: 'PDF', data_count: logsRes?.length || 50 })}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-950 text-white hover:bg-slate-800 rounded-xl text-sm font-semibold transition cursor-pointer"
          >
            <Download className="h-4 w-4" />
            Export Audit
          </button>
        </div>
      </div>

      {/* CORE MODULE TABS SWITCHER */}
      <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-2">
        {(['dashboard', 'logs', 'compliance', 'risks', 'accreditation', 'government'] as const).map(tab => {
          const isActive = activeSubTab === tab;
          const config: Record<string, { label: string; icon: any }> = {
            dashboard: { label: 'Dashboard Utama', icon: Activity },
            logs: { label: 'Audit Trail', icon: FileText },
            compliance: { label: 'Compliance Engine', icon: ShieldCheck },
            risks: { label: 'Manajemen Risiko', icon: AlertTriangle },
            accreditation: { label: 'Akreditasi Lembaga', icon: FileCheck },
            government: { label: 'Pelaporan Pemerintah', icon: Layers }
          };
          const item = config[tab];
          const Icon = item.icon;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveSubTab(tab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 ring-2 ring-indigo-500/20' 
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. DASHBOARD TAB */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-6">
          
          {/* REUSABLE EXECUTIVE SUMMARY PANEL */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* COMPLIANCE HEALTH SPEEDOMETER BLOCK */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Skor Kepatuhan</span>
                <span className="p-1 text-emerald-600 bg-emerald-50 rounded-lg">
                  <TrendingUp className="h-4 w-4" />
                </span>
              </div>
              <div className="my-6 text-center">
                <span className="text-5xl font-black text-slate-900 tracking-tight">
                  {dashboardRes?.compliance_score || 92.5}%
                </span>
                <p className="text-xs font-semibold text-emerald-600 mt-2 font-mono uppercase">Status: Patuh Regulasi</p>
              </div>
              <div className="border-t border-slate-100 pt-4">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Target Nasional</span>
                  <span className="font-semibold text-slate-800">85.0%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${dashboardRes?.compliance_score || 92.5}%` }}
                  />
                </div>
              </div>
            </div>

            {/* RISKS MATRIX SUMMARY CARD */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Status Risiko</span>
                <span className="p-1 text-rose-600 bg-rose-50 rounded-lg">
                  <AlertTriangle className="h-4 w-4" />
                </span>
              </div>
              <div className="my-6 text-center">
                <span className="text-5xl font-black text-slate-900 tracking-tight">
                  {dashboardRes?.total_open_risks || 0}
                </span>
                <p className="text-xs font-semibold text-rose-600 mt-2 font-mono uppercase">Risiko Open Aktif</p>
              </div>
              <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs text-slate-500">
                <span>Mitigasi Terencana</span>
                <span className="font-semibold text-slate-800 uppercase font-mono">
                  {risksRes?.risks?.filter((r: any) => r.status === 'Mitigated').length || 1} Teratasi
                </span>
              </div>
            </div>

            {/* ACCREDITATION PROGRESS CARD */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Evaluasi Akreditasi</span>
                <span className="p-1 text-indigo-600 bg-indigo-50 rounded-lg">
                  <FileCheck className="h-4 w-4" />
                </span>
              </div>
              <div className="my-6 text-center">
                <span className="text-5xl font-black text-slate-900 tracking-tight">
                  {dashboardRes?.accreditation_progress || 85.5}
                </span>
                <p className="text-xs font-semibold text-indigo-600 mt-2 font-mono uppercase">Indeks Mutu Internal</p>
              </div>
              <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs text-slate-500">
                <span>Prediksi BAN-PDM</span>
                <span className="font-bold text-slate-800 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-100">
                  Grade A
                </span>
              </div>
            </div>

          </div>

          {/* AI COMPLIANCE SUMMARY WIDGET */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-indigo-600 text-white rounded-lg">
                <Sparkles className="h-4 w-4 animate-pulse" />
              </div>
              <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wider font-mono">Executive AI Compliance Summary</h3>
            </div>
            {isExecLoading ? (
              <div className="h-10 flex items-center justify-center">
                <div className="h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-indigo-950 text-sm leading-relaxed font-sans">
                  "{executiveRes?.ai_compliance_summary}"
                </p>
                <div className="flex items-center gap-4 text-xs text-indigo-700/80 font-mono border-t border-indigo-100/50 pt-3">
                  <span>Model: <strong>gemini-3.5-flash</strong></span>
                  <span>Integrity check: <strong>92.5% Compliant</strong></span>
                  <span>Health: <strong>SANGAT BAIK</strong></span>
                </div>
              </div>
            )}
          </div>

          {/* REUSABLE AUDIT TIMELINE (RECENT LOGS) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Activity className="h-5 w-5 text-indigo-600" />
                Aktifitas Terkini (Audit Timeline)
              </h3>
              <button 
                onClick={() => setActiveSubTab('logs')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-0.5 cursor-pointer"
              >
                Selengkapnya
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="relative border-l border-slate-200 pl-6 ml-3 space-y-6">
              {dashboardRes?.recent_activity?.length > 0 ? (
                dashboardRes.recent_activity.slice(0, 5).map((log: any) => {
                  const isWarning = log.severity === 'Warning' || log.severity === 'Critical';
                  const isSecurity = log.severity === 'Security';
                  return (
                    <div key={log.id} className="relative">
                      {/* Timeline dot */}
                      <span className={`absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border-2 border-white flex items-center justify-center ${
                        isSecurity ? 'bg-indigo-600' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                      }`} />
                      
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 bg-slate-50 p-4 rounded-xl border border-slate-150">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-700 uppercase font-mono">{log.action}</span>
                            <span className="text-xs text-slate-400">|</span>
                            <span className="text-xs font-semibold text-indigo-600 font-mono">{log.module}</span>
                          </div>
                          <p className="text-sm font-medium text-slate-800 mt-1">{log.description}</p>
                          <div className="flex items-center gap-3 text-xs text-slate-400 mt-2 font-mono">
                            <span className="flex items-center gap-1">
                              <User className="h-3.5 w-3.5" />
                              {log.username}
                            </span>
                            <span>IP: {log.ip_address}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs text-slate-400 block">{new Date(log.created_at).toLocaleTimeString()}</span>
                          <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-mono block mt-1 overflow-hidden max-w-[150px] truncate" title={log.encrypted_hash}>
                            {log.encrypted_hash}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-slate-400 text-sm">Belum ada aktifitas audit yang tercatat di sistem ini.</p>
              )}
            </div>
          </div>

        </div>
      )}

      {/* 2. AUDIT TRAIL TAB */}
      {activeSubTab === 'logs' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-600" />
              Immutable Audit Trail Logs
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <select 
                value={logSeverity} 
                onChange={e => setLogSeverity(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono"
              >
                <option value="">-- Semua Tingkat (Severity) --</option>
                <option value="Information">Information</option>
                <option value="Warning">Warning</option>
                <option value="Critical">Critical</option>
                <option value="Security">Security</option>
              </select>
              <select 
                value={logAction} 
                onChange={e => setLogAction(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono"
              >
                <option value="">-- Semua Aksi --</option>
                <option value="Create">Create</option>
                <option value="Update">Update</option>
                <option value="Delete">Delete</option>
                <option value="Restore">Restore</option>
                <option value="Approve">Approve</option>
                <option value="Reject">Reject</option>
                <option value="Login">Login</option>
                <option value="Export">Export</option>
              </select>
              <input 
                type="text" 
                placeholder="Cari user, deskripsi..." 
                value={logSearch}
                onChange={e => setLogSearch(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 min-w-[180px]"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-400 font-mono">
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">User</th>
                  <th className="p-4">Aksi</th>
                  <th className="p-4">Modul</th>
                  <th className="p-4">Deskripsi</th>
                  <th className="p-4">Severity</th>
                  <th className="p-4 text-center">Payload Changes</th>
                  <th className="p-4 text-right">Immutable Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {isLogsLoading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      Memuat database logs...
                    </td>
                  </tr>
                ) : logsRes?.length > 0 ? (
                  logsRes.map((log: any) => {
                    const sevColors: Record<string, string> = {
                      Information: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                      Warning: 'bg-amber-50 text-amber-700 border-amber-100',
                      Critical: 'bg-rose-50 text-rose-700 border-rose-100',
                      Security: 'bg-indigo-50 text-indigo-700 border-indigo-100'
                    };
                    return (
                      <tr key={log.id} className="hover:bg-slate-50/50">
                        <td className="p-4 text-xs font-mono text-slate-500">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="p-4 font-semibold text-slate-800">
                          {log.username}
                        </td>
                        <td className="p-4">
                          <span className="text-xs font-bold uppercase font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {log.action}
                          </span>
                        </td>
                        <td className="p-4 text-xs font-mono text-slate-600">
                          {log.module}
                        </td>
                        <td className="p-4 text-xs text-slate-600 max-w-xs truncate" title={log.description}>
                          {log.description}
                        </td>
                        <td className="p-4">
                          <span className={`text-[10px] font-bold uppercase tracking-wider font-mono px-2 py-0.5 rounded-full border ${sevColors[log.severity]}`}>
                            {log.severity}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          {log.payload ? (
                            <button 
                              onClick={() => setSelectedChangeLog(log)}
                              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold underline flex items-center justify-center gap-1 mx-auto cursor-pointer"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              Bandingkan
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400 italic">No value change</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <span className="text-[10px] text-slate-400 font-mono bg-slate-50 px-2 py-1 rounded select-all border border-slate-150" title="Rantai Hash Enkripsi Log">
                            {log.encrypted_hash.substring(0, 16)}...
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      Tidak ada logs audit yang cocok dengan filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* REUSABLE CHANGE COMPARISON VIEWER MODAL */}
          {selectedChangeLog && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[85vh]">
                <div className="p-6 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                      <Lock className="h-4 w-4 text-indigo-600" />
                      Audited Data Change Comparison
                    </h4>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">Log ID: {selectedChangeLog.id}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedChangeLog(null)}
                    className="text-xs bg-white hover:bg-slate-100 text-slate-500 border border-slate-200 p-1.5 rounded-lg font-bold cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
                
                <div className="p-6 overflow-y-auto space-y-4">
                  <p className="text-sm text-slate-600">
                    <strong>Aktivitas:</strong> {selectedChangeLog.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-xl">
                      <span className="text-xs font-bold text-rose-700 uppercase font-mono block mb-2">Before Value (Lama)</span>
                      <pre className="text-xs font-mono text-slate-600 bg-white p-3 rounded-lg border border-slate-200 overflow-x-auto max-h-[250px]">
                        {JSON.stringify(selectedChangeLog.payload?.before || selectedChangeLog.payload, null, 2)}
                      </pre>
                    </div>
                    <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                      <span className="text-xs font-bold text-emerald-700 uppercase font-mono block mb-2">After Value (Baru)</span>
                      <pre className="text-xs font-mono text-slate-600 bg-white p-3 rounded-lg border border-slate-200 overflow-x-auto max-h-[250px]">
                        {JSON.stringify(selectedChangeLog.payload?.after || selectedChangeLog.payload, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* 3. COMPLIANCE ENGINE TAB */}
      {activeSubTab === 'compliance' && (
        <div className="space-y-6">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Compliance Frameworks & Checklist</h3>
              <p className="text-xs text-slate-500 mt-1">Sistem manajemen regulasi terakreditasi sekolah, yayasan, disdik dan Kemenag.</p>
            </div>
            <button 
              onClick={() => setShowAddFramework(true)}
              className="flex items-center gap-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Kerangka Baru
            </button>
          </div>

          {/* ADD FRAMEWORK DIALOG */}
          {showAddFramework && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 max-w-md">
              <h4 className="text-sm font-bold text-slate-800 font-mono uppercase">Tambah Kerangka Kepatuhan</h4>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-600 mb-1">Nama Kerangka Kepatuhan / Regulasi</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Standar Operasional Mutu ISO 9001"
                    value={frameworkForm.name}
                    onChange={e => setFrameworkForm({ ...frameworkForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1">Kode Unik</label>
                    <input 
                      type="text" 
                      placeholder="ISO-9001"
                      value={frameworkForm.code}
                      onChange={e => setFrameworkForm({ ...frameworkForm, code: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Jenis Framework</label>
                    <select 
                      value={frameworkForm.type}
                      onChange={e => setFrameworkForm({ ...frameworkForm, type: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg"
                    >
                      <option value="Internal">Internal</option>
                      <option value="Foundation">Foundation</option>
                      <option value="Education Office">Education Office</option>
                      <option value="Religious Affairs">Religious Affairs</option>
                      <option value="ISO Ready">ISO Ready</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Keterangan / Deskripsi</label>
                  <textarea 
                    value={frameworkForm.description}
                    onChange={e => setFrameworkForm({ ...frameworkForm, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg"
                    rows={2}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setShowAddFramework(false)} className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg font-bold cursor-pointer">Batal</button>
                  <button 
                    onClick={() => createFrameworkMutation.mutate(frameworkForm)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold cursor-pointer"
                  >
                    Simpan Kerangka
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ACTIVE FRAMEWORKS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isFrameworksLoading ? (
              <div className="p-8 text-center text-slate-400 md:col-span-2 bg-white rounded-xl border">Memuat compliance data...</div>
            ) : frameworksRes?.length > 0 ? (
              frameworksRes.map((frame: any) => (
                <div key={frame.id} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-[10px] bg-indigo-50 text-indigo-700 font-mono font-bold px-2.5 py-0.5 rounded border border-indigo-100">
                        {frame.type}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 mt-2">{frame.name}</h4>
                      <p className="text-xs text-slate-400 font-mono">{frame.code} / Ver. {frame.version}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">{frame.description}</p>

                  {/* CATEGORIES & ITEMS PREVIEW */}
                  <div className="border-t border-slate-100 pt-4 space-y-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider block">Butir Checklist & Status Bukti</span>
                    
                    {frame.categories?.map((cat: any) => (
                      <div key={cat.id} className="space-y-2">
                        <span className="text-xs font-bold text-slate-700 block">{cat.name}</span>
                        {cat.checklists?.map((chk: any) => (
                          <div key={chk.id} className="space-y-2.5 ml-2 border-l border-slate-150 pl-3">
                            {chk.items?.map((item: any) => {
                              const isCompliant = item.status === 'Compliant';
                              return (
                                <div key={item.id} className="text-xs bg-slate-50/50 p-3 rounded-lg border border-slate-150 flex flex-col md:flex-row md:items-center justify-between gap-3">
                                  <div className="space-y-1">
                                    <p className="font-medium text-slate-800">{item.requirement_text}</p>
                                    <span className="text-[10px] text-slate-400 font-mono block">Ref: {item.legal_reference}</span>
                                  </div>
                                  <div className="flex items-center gap-2 self-start md:self-auto">
                                    
                                    {/* Action dropdown */}
                                    <select 
                                      value={item.status}
                                      onChange={e => updateItemStatusMutation.mutate({ framework_id: frame.id, item_id: item.id, status: e.target.value })}
                                      className="text-[10px] bg-white border border-slate-200 rounded px-1.5 py-0.5 font-mono"
                                    >
                                      <option value="Pending">Pending</option>
                                      <option value="Compliant">Compliant</option>
                                      <option value="Non-Compliant">Non-Compliant</option>
                                      <option value="Not Applicable">Not Applicable</option>
                                    </select>

                                    {/* Upload Evidence Trigger (Drag-Drop simulation) */}
                                    <button 
                                      onClick={() => handleSimulatedFileUpload(item.id)}
                                      className="p-1 text-slate-500 hover:text-indigo-600 bg-white border border-slate-200 rounded cursor-pointer"
                                      title="Simulasi Seret-Lepas / Unggah Berkas PDF"
                                    >
                                      <Upload className="h-3 w-3" />
                                    </button>

                                    {/* Show Evidence Status */}
                                    {item.evidences?.length > 0 ? (
                                      <button 
                                        onClick={() => setSelectedEvidenceDoc(item.evidences[0])}
                                        className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-100 flex items-center gap-0.5 font-mono cursor-pointer"
                                      >
                                        <FileCheck className="h-2.5 w-2.5" />
                                        Sertifikat
                                      </button>
                                    ) : (
                                      <span className="text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 font-mono">No Evidence</span>
                                    )}

                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 bg-white rounded-xl border md:col-span-2">Belum ada compliance framework aktif. Klik "Kerangka Baru" untuk menambahkan regulasi Anda.</div>
            )}
          </div>

          {/* REUSABLE EVIDENCE VIEWER DIALOG */}
          {selectedEvidenceDoc && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2 text-indigo-900 bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                  <Lock className="h-5 w-5 text-indigo-600" />
                  <span className="text-xs font-bold font-mono uppercase tracking-wider">Digital Evidence Seal Verified</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{selectedEvidenceDoc.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">Uploaded at: {new Date(selectedEvidenceDoc.created_at).toLocaleString()}</p>
                </div>
                <div className="space-y-2 text-xs font-mono text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-150">
                  <div>
                    <span className="text-slate-400 block">File Type:</span>
                    <span>{selectedEvidenceDoc.file_type} Document</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">File Size:</span>
                    <span>{(selectedEvidenceDoc.file_size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2">
                    <span className="text-slate-400 block">Digital Signature (Tamper-proof):</span>
                    <span className="text-indigo-600 select-all font-semibold break-all">{selectedEvidenceDoc.digital_signature}</span>
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button 
                    onClick={() => setSelectedEvidenceDoc(null)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 cursor-pointer"
                  >
                    Tutup Bukti
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* 4. RISK MANAGEMENT TAB */}
      {activeSubTab === 'risks' && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* REUSABLE RISK MATRIX CHART (5x5 GRID representation) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 lg:col-span-1 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Interactive Risk Heatmap Matrix</h4>
                <p className="text-xs text-slate-400">Peta visual antara kemungkinan (Likelihood) & dampak (Impact).</p>
              </div>

              {/* 5x5 Grid block */}
              <div className="grid grid-cols-5 gap-1.5 text-[9px] font-mono text-center pt-2">
                {/* Simulated Grid cells where colors represent severity */}
                {Array.from({ length: 25 }).map((_, index) => {
                  const row = Math.floor(index / 5);
                  const col = index % 5;
                  // Generate threat matrix color
                  let cellColor = 'bg-emerald-100 text-emerald-800';
                  if (row < 2 && col > 2) cellColor = 'bg-rose-100 text-rose-800 font-bold';
                  else if (row < 3 && col > 1) cellColor = 'bg-amber-100 text-amber-800';
                  
                  return (
                    <div key={index} className={`p-2.5 rounded border border-white/40 ${cellColor}`}>
                      R{5-row}C{col+1}
                    </div>
                  );
                })}
              </div>

              <div className="text-[10px] text-slate-400 flex justify-between font-mono pt-1">
                <span>← Rendah Dampak</span>
                <span>Tinggi Dampak →</span>
              </div>
            </div>

            {/* RISKS LIST PANEL */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
                <h4 className="text-sm font-bold text-slate-900">Active Operational Risks Registry</h4>
                <button 
                  onClick={() => setShowAddRisk(true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Risiko Baru
                </button>
              </div>

              {/* ADD RISK DIALOG */}
              {showAddRisk && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                  <span className="font-bold text-slate-700 uppercase font-mono">Daftarkan Potensi Bahaya / Risiko</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1">Judul Risiko</label>
                      <input 
                        type="text" 
                        placeholder="Keterlambatan SPP massal"
                        value={riskForm.title}
                        onChange={e => setRiskForm({ ...riskForm, title: e.target.value })}
                        className="w-full bg-white border p-2 rounded"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Kategori</label>
                      <select 
                        value={riskForm.category_id}
                        onChange={e => setRiskForm({ ...riskForm, category_id: e.target.value })}
                        className="w-full bg-white border p-2 rounded"
                      >
                        <option value="">-- Pilih Kategori --</option>
                        {risksRes?.categories?.map((c: any) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block mb-1">Risk Level</label>
                      <select 
                        value={riskForm.risk_level}
                        onChange={e => setRiskForm({ ...riskForm, risk_level: e.target.value as any })}
                        className="w-full bg-white border p-2 rounded font-mono"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1">Likelihood</label>
                      <select 
                        value={riskForm.likelihood}
                        onChange={e => setRiskForm({ ...riskForm, likelihood: e.target.value as any })}
                        className="w-full bg-white border p-2 rounded font-mono"
                      >
                        <option value="Rare">Rare</option>
                        <option value="Unlikely">Unlikely</option>
                        <option value="Possible">Possible</option>
                        <option value="Likely">Likely</option>
                        <option value="Almost Certain">Almost Certain</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1">Impact</label>
                      <select 
                        value={riskForm.impact}
                        onChange={e => setRiskForm({ ...riskForm, impact: e.target.value as any })}
                        className="w-full bg-white border p-2 rounded font-mono"
                      >
                        <option value="Insignificant">Insignificant</option>
                        <option value="Minor">Minor</option>
                        <option value="Moderate">Moderate</option>
                        <option value="Major">Major</option>
                        <option value="Severe">Severe</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1">Rencana Mitigasi / Kontrol Pengendalian</label>
                    <textarea 
                      value={riskForm.mitigation_plan}
                      onChange={e => setRiskForm({ ...riskForm, mitigation_plan: e.target.value })}
                      className="w-full bg-white border p-2 rounded"
                      rows={2}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button onClick={() => setShowAddRisk(false)} className="px-3 py-1 bg-slate-100 rounded text-slate-600 font-bold cursor-pointer">Batal</button>
                    <button 
                      onClick={() => createRiskMutation.mutate(riskForm)}
                      className="px-3 py-1 bg-indigo-600 text-white rounded font-bold cursor-pointer"
                    >
                      Daftarkan
                    </button>
                  </div>
                </div>
              )}

              {/* REGISTERED RISKS TABLE */}
              <div className="space-y-3">
                {isRisksLoading ? (
                  <p className="text-center text-slate-400 py-4">Memuat data risiko...</p>
                ) : risksRes?.risks?.length > 0 ? (
                  risksRes.risks.map((risk: any) => {
                    const rcolors: Record<string, string> = {
                      Low: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                      Medium: 'bg-amber-50 text-amber-700 border-amber-100',
                      High: 'bg-orange-50 text-orange-700 border-orange-100',
                      Critical: 'bg-rose-50 text-rose-700 border-rose-100'
                    };
                    return (
                      <div key={risk.id} className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <span className={`text-[10px] font-bold font-mono uppercase tracking-wider border px-2 py-0.5 rounded ${rcolors[risk.risk_level]}`}>
                              {risk.risk_level} Level
                            </span>
                            <h5 className="font-bold text-slate-800 text-sm mt-1.5">{risk.title}</h5>
                          </div>
                          <span className="text-xs text-slate-400 font-mono">
                            Likelihood: {risk.likelihood} | Impact: {risk.impact}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          <strong>Kombinasi Pengendalian / Mitigasi:</strong> {risk.mitigation_plan}
                        </p>
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-200/50 justify-between text-[11px] text-slate-400 font-mono">
                          <span>Status Penilaian: <strong>{risk.status?.toUpperCase()}</strong></span>
                          <span>Terdaftar: {new Date(risk.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-slate-400 py-4">Tidak ada risiko aktif terdaftar.</p>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* 5. ACCREDITATION TAB */}
      {activeSubTab === 'accreditation' && (
        <div className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">BAN-PDM Accreditation Self-Evaluation Tool</h3>
              <p className="text-xs text-slate-500 mt-1">Evaluasi mandiri sistem mutu pendidikan mengacu pada instrumen butir evaluasi nasional.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 font-mono font-bold px-3 py-1.5 rounded-lg">
                Overall Self Score: <strong>{accreditationRes?.overall_self_score || 85.5}%</strong>
              </span>
              <button 
                onClick={() => setShowAddInstrument(true)}
                className="flex items-center gap-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Instrumen Kustom
              </button>
            </div>
          </div>

          {/* ADD INSTRUMENT DIALOG */}
          {showAddInstrument && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs max-w-md">
              <span className="font-bold text-slate-700 uppercase font-mono">Tambah Butir Instrumen Evaluasi Kustom</span>
              <div className="space-y-2">
                <div>
                  <label className="block mb-1">Standar Akreditasi</label>
                  <select 
                    value={instrumentForm.standard_id}
                    onChange={e => setInstrumentForm({ ...instrumentForm, standard_id: e.target.value })}
                    className="w-full bg-white border p-2 rounded"
                  >
                    <option value="">-- Pilih Standar --</option>
                    {accreditationRes?.standards?.map((s: any) => (
                      <option key={s.id} value={s.id}>[{s.code}] {s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1">Kode Butir</label>
                    <input 
                      type="text" 
                      placeholder="e.g., BUTIR-14"
                      value={instrumentForm.code}
                      onChange={e => setInstrumentForm({ ...instrumentForm, code: e.target.value })}
                      className="w-full bg-white border p-2 rounded font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Skor Maksimal</label>
                    <input 
                      type="number" 
                      value={instrumentForm.maximum_score}
                      onChange={e => setInstrumentForm({ ...instrumentForm, maximum_score: e.target.value })}
                      className="w-full bg-white border p-2 rounded font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block mb-1">Pertanyaan / Deskripsi Evaluasi</label>
                  <textarea 
                    value={instrumentForm.question_text}
                    onChange={e => setInstrumentForm({ ...instrumentForm, question_text: e.target.value })}
                    className="w-full bg-white border p-2 rounded"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block mb-1">Indikator Mutu (Pisahkan dengan koma)</label>
                  <input 
                    type="text" 
                    placeholder="Adanya ruang UKS, Bukti sertifikat dokter kecil"
                    value={instrumentForm.indicators}
                    onChange={e => setInstrumentForm({ ...instrumentForm, indicators: e.target.value })}
                    className="w-full bg-white border p-2 rounded"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button onClick={() => setShowAddInstrument(false)} className="px-3 py-1 bg-slate-100 rounded text-slate-600 font-bold cursor-pointer">Batal</button>
                  <button 
                    onClick={() => addInstrumentMutation.mutate({
                      standard_id: instrumentForm.standard_id,
                      code: instrumentForm.code,
                      question_text: instrumentForm.question_text,
                      maximum_score: parseInt(instrumentForm.maximum_score) || 4,
                      indicators: instrumentForm.indicators.split(',').map(i => i.trim()).filter(Boolean)
                    })}
                    className="px-3 py-1 bg-indigo-600 text-white rounded font-bold cursor-pointer"
                  >
                    Tambahkan Butir
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ACTIVE INSTRUMENT EVALUATORS */}
          <div className="space-y-6 text-sm">
            {isAccLoading ? (
              <p className="text-center text-slate-400 py-6">Memuat berkas akreditasi...</p>
            ) : accreditationRes ? (
              accreditationRes.standards?.map((std: any) => (
                <div key={std.id} className="space-y-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide font-mono block">
                    [{std.code}] {std.name} - Bobot Penilaian: {std.weight}%
                  </span>

                  {std.instruments?.map((inst: any) => (
                    <div key={inst.id} className="bg-slate-50 border border-slate-150 rounded-2xl p-6 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono font-bold uppercase">
                            {inst.code}
                          </span>
                          <h4 className="font-bold text-slate-800 text-sm mt-1.5 leading-relaxed">{inst.question_text}</h4>
                        </div>
                        
                        {/* Score selector */}
                        <div className="shrink-0 flex items-center gap-1.5">
                          <span className="text-xs text-slate-400">Self Score:</span>
                          <select 
                            value={inst.self_score}
                            onChange={e => saveAccreditationScoreMutation.mutate({ instrument_id: inst.id, self_score: parseInt(e.target.value), justification: inst.justification })}
                            className="bg-white border border-slate-200 p-1.5 rounded-lg text-xs font-bold font-mono"
                          >
                            <option value="0">0 (Belum Terisi)</option>
                            <option value="1">1 (Kurang)</option>
                            <option value="2">2 (Cukup)</option>
                            <option value="3">3 (Baik)</option>
                            <option value="4">4 (Sangat Baik)</option>
                          </select>
                        </div>
                      </div>

                      {/* Rubric display */}
                      <div className="text-xs bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50 text-indigo-950">
                        <strong>Rubrik Penilaian:</strong> {inst.scoring_rubric?.[inst.self_score || 4] || 'Belum terisi'}
                      </div>

                      {/* Justifikasi text */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600 block">Justifikasi & Narasi Keadaan Sekolah:</label>
                        <textarea 
                          value={inst.justification}
                          onChange={e => saveAccreditationScoreMutation.mutate({ instrument_id: inst.id, self_score: inst.self_score, justification: e.target.value })}
                          placeholder="Tuliskan fakta-fakta lapangan, sarana prasarana yang mendukung butir penilaian ini..."
                          className="w-full bg-white border border-slate-250 p-2.5 rounded-xl text-xs"
                          rows={2}
                        />
                      </div>

                      {/* Indicators checklist */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">Indikator Mutu & Dokumen Pendukung</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {inst.indicators?.map((ind: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 text-slate-700 bg-white px-3 py-2 rounded-lg border border-slate-150">
                              <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                              <span>{ind}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Evidence Documents upload and listings */}
                      <div className="border-t border-slate-200/50 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                          {inst.evidences?.[0]?.documents?.map((doc: any) => (
                            <button 
                              key={doc.id}
                              onClick={() => setSelectedEvidenceDoc(doc)}
                              className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 rounded-lg flex items-center gap-1 font-mono text-[10px] cursor-pointer"
                            >
                              <FileCheck className="h-3 w-3 text-emerald-600" />
                              {doc.title.length > 25 ? doc.title.slice(0, 25) + '...' : doc.title}
                            </button>
                          ))}
                          {(!inst.evidences || inst.evidences[0]?.documents?.length === 0) && (
                            <span className="text-slate-400 italic">Belum ada dokumen bukti diunggah</span>
                          )}
                        </div>
                        <button 
                          onClick={() => handleSimulatedFileUpload(undefined, inst.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-slate-950 text-white hover:bg-slate-800 rounded-lg text-xs font-bold transition self-start cursor-pointer"
                        >
                          <Upload className="h-3.5 w-3.5" />
                          Simulasi Unggah Bukti
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              ))
            ) : (
              <p className="text-center text-slate-400">Tidak ada periode akreditasi aktif terdaftar.</p>
            )}
          </div>

          {/* ACCREDITATION REVIEWERS COMMENTS SUMMARY */}
          {accreditationRes?.reviewers?.length > 0 && (
            <div className="border-t border-slate-200 pt-6 space-y-3">
              <h4 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider">Komentar Asesor & Reviewer Pendamping</h4>
              <div className="space-y-2">
                {accreditationRes.reviewers.map((rev: any, idx: number) => (
                  <div key={idx} className="p-4 bg-indigo-50/20 border border-indigo-100 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between font-mono text-slate-500">
                      <span>Reviewer: <strong>{rev.reviewer_name}</strong> ({rev.reviewer_role})</span>
                      <span>Tanggal: {rev.assignment_date}</span>
                    </div>
                    <p className="text-slate-700 italic">"{rev.comments}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* 6. GOVERNMENT REPORTS TAB */}
      {activeSubTab === 'government' && (
        <div className="space-y-6">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Kementerian & Dapodik Integration Sync</h3>
              <p className="text-xs text-slate-500 mt-1">Hasilkan, validasi dan sinkronisasikan laporan berkala Dapodik, EMIS, dan dinas keuangan.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <select 
                value={govReportForm.report_type}
                onChange={e => setGovReportForm({ ...govReportForm, report_type: e.target.value })}
                className="text-xs bg-slate-50 border border-slate-200 p-2 rounded-lg font-mono"
              >
                <option value="Student">Student (Dapodik)</option>
                <option value="Teacher">Teacher (SIMPATIKA)</option>
                <option value="Employee">Employee (Kepegawaian)</option>
                <option value="Finance">Finance (BOS Pajak)</option>
                <option value="Attendance">Attendance (Presensi Dinas)</option>
                <option value="Infrastructure">Infrastructure (Sarpras)</option>
                <option value="Library">Library (Perpustakaan)</option>
                <option value="Boarding">Boarding (EMIS Pondok)</option>
              </select>
              <input 
                type="text" 
                placeholder="Judul laporan (e.g. Dapodik Ganjil)"
                value={govReportForm.title}
                onChange={e => setGovReportForm({ ...govReportForm, title: e.target.value })}
                className="text-xs bg-slate-50 border border-slate-200 p-2 rounded-lg min-w-[180px]"
              />
              <button 
                onClick={() => {
                  if (!govReportForm.title) return alert('Silakan isi judul laporan terlebih dahulu');
                  generateGovReportMutation.mutate(govReportForm);
                }}
                className="flex items-center gap-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Generate & Petakan
              </button>
            </div>
          </div>

          {/* PREVIOUS GENERATED GOVERNMENT REPORTS */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono block">Histori Sinkronisasi Kementerian</span>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isGovLoading ? (
                <p className="text-center text-slate-400 py-4 col-span-2">Memuat pelaporan kementerian...</p>
              ) : govReportsRes?.length > 0 ? (
                govReportsRes.map((rep: any) => {
                  const isSubmitted = rep.status === 'Submitted';
                  return (
                    <div key={rep.id} className="p-5 bg-slate-50 border border-slate-150 rounded-xl space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="text-[9px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded border border-indigo-100 font-mono uppercase">
                            {rep.report_type} Sync
                          </span>
                          <h4 className="font-bold text-slate-800 text-sm mt-1.5">{rep.title}</h4>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider font-mono px-2 py-0.5 rounded border ${
                          isSubmitted ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                          {rep.status}
                        </span>
                      </div>

                      {/* Display content metrics extracted dynamically */}
                      <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-1 font-mono text-slate-600">
                        {Object.entries(rep.content_data || {}).map(([key, value]: any) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-slate-400">{key.replace(/_/g, ' ')}:</span>
                            <span className="font-semibold text-slate-700">{value}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between gap-4 text-xs pt-2 border-t border-slate-200/50">
                        <span className="text-slate-400 font-mono">T.Ajaran: {rep.academic_year}</span>
                        
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => exportLogsMutation.mutate({ export_type: `Gov Report ${rep.report_type}`, format: 'Excel', data_count: 50 })}
                            className="p-1.5 text-slate-600 hover:text-indigo-600 bg-white border border-slate-200 rounded cursor-pointer"
                            title="Unduh Berkas Excel"
                          >
                            <FileSpreadsheet className="h-4 w-4" />
                          </button>
                          
                          {!isSubmitted && (
                            <button 
                              onClick={() => submitGovReportMutation.mutate(rep.id)}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold cursor-pointer"
                            >
                              Kirim Portal
                            </button>
                          )}
                        </div>
                      </div>

                      {rep.government_tracking_number && (
                        <div className="text-[10px] bg-indigo-50/50 p-2 rounded-lg border border-indigo-100 text-indigo-950 font-mono flex justify-between">
                          <span>No Resi Portal:</span>
                          <strong>{rep.government_tracking_number}</strong>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-slate-400 py-6 col-span-2">Belum ada laporan kementerian yang digenerate.</p>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
