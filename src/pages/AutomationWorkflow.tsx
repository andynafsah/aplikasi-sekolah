/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Sliders, 
  Database, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Sparkles, 
  GitPullRequest, 
  Layers, 
  Send, 
  RefreshCw, 
  UserCheck, 
  ShieldAlert, 
  Code, 
  Copy, 
  Search, 
  AlertCircle,
  ArrowRight,
  ChevronUp,
  ChevronDown,
  Server,
  Settings,
  Terminal,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../api/client';

export default function AutomationWorkflow() {
  const { user, tenant } = useAuth();
  
  // Tab states
  const [activeSubTab, setActiveSubTab] = useState<'runs' | 'tasks' | 'definitions' | 'n8n' | 'sql'>('runs');

  // Loading states
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Data states
  const [categories, setCategories] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [definitions, setDefinitions] = useState<any[]>([]);
  const [instances, setInstances] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [integrations, setIntegrations] = useState<any[]>([]);

  // Search/Filter states
  const [searchTerm, setSearchTerm] = useState('');

  // Active designer state
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [editingDefinition, setEditingDefinition] = useState<any | null>(null);
  const [defName, setDefName] = useState('');
  const [defDescription, setDefDescription] = useState('');
  const [defCategory, setDefCategory] = useState('');
  const [defNodes, setDefNodes] = useState<any[]>([]);

  // New instance builder state
  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const [launchWorkflow, setLaunchWorkflow] = useState<any | null>(null);
  const [launchTitle, setLaunchTitle] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentReason, setStudentReason] = useState('');
  const [studentStartDate, setStudentStartDate] = useState('');
  const [studentEndDate, setStudentEndDate] = useState('');

  // Task processing state
  const [processingTask, setProcessingTask] = useState<any | null>(null);
  const [taskNotes, setTaskNotes] = useState('');

  // n8n Integrator state
  const [editingN8n, setEditingN8n] = useState<any | null>(null);
  const [n8nName, setN8nName] = useState('');
  const [n8nWebhookUrl, setN8nWebhookUrl] = useState('');
  const [n8nAuthToken, setN8nAuthToken] = useState('');
  const [n8nTriggers, setN8nTriggers] = useState<string[]>([]);
  const [n8nActive, setN8nActive] = useState(true);

  // n8n simulator state
  const [testIntegration, setTestIntegration] = useState<any | null>(null);
  const [testPayload, setTestPayload] = useState('{\n  "event": "LEAVE_PERMISSION_APPROVED",\n  "student_name": "Ahmad Fauzi",\n  "reason": "Kontrol Gigi",\n  "status": "APPROVED",\n  "approved_by": "Kyai Hasan"\n}');
  const [testResult, setTestResult] = useState<any | null>(null);

  // Toast / Status messaging
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Fetch all automation data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, tplRes, defRes, instRes, taskRes, n8nRes] = await Promise.all([
        apiClient.post('/api/action?action=getWorkflowCategories'),
        apiClient.post('/api/action?action=getWorkflowTemplates'),
        apiClient.post('/api/action?action=getWorkflowDefinitions'),
        apiClient.post('/api/action?action=getWorkflowInstances'),
        apiClient.post('/api/action?action=getWorkflowTasks'),
        apiClient.post('/api/action?action=getN8nIntegrations')
      ]);

      if (catRes.data.success) setCategories(catRes.data.data);
      if (tplRes.data.success) setTemplates(tplRes.data.data);
      if (defRes.data.success) setDefinitions(defRes.data.data);
      if (instRes.data.success) setInstances(instRes.data.data);
      if (taskRes.data.success) setTasks(taskRes.data.data);
      if (n8nRes.data.success) setIntegrations(n8nRes.data.data);
    } catch (err) {
      console.error('Failed to load automation records', err);
      showToast('Gagal memuat konfigurasi alur kerja', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle workflow save
  const handleSaveWorkflow = async () => {
    if (!defName || !defCategory) {
      showToast('Nama alur dan kategori wajib diisi', 'error');
      return;
    }

    setActionLoading('saveWorkflow');
    try {
      const response = await apiClient.post('/api/action?action=saveWorkflowDefinition', {
        id: editingDefinition?.id,
        category_id: defCategory,
        name: defName,
        description: defDescription,
        nodes: defNodes,
        is_active: true
      });

      if (response.data.success) {
        showToast('Alur Kerja (BPM Workflow) berhasil disimpan!');
        setEditingDefinition(null);
        setSelectedTemplate(null);
        fetchData();
      } else {
        showToast(response.data.message || 'Gagal menyimpan', 'error');
      }
    } catch (err) {
      showToast('Terjadi kesalahan sistem saat menyimpan alur kerja', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Launch workflow run modal opener
  const handleOpenLaunch = (wf: any) => {
    setLaunchWorkflow(wf);
    setLaunchTitle(`${wf.name} - ${new Date().toLocaleDateString('id-ID')}`);
    setStudentName('');
    setStudentReason('');
    setStudentStartDate(new Date().toISOString().split('T')[0]);
    setStudentEndDate(new Date().toISOString().split('T')[0]);
    setShowLaunchModal(true);
  };

  // Launch Workflow Instance run trigger
  const handleLaunchWorkflow = async () => {
    if (!launchTitle) {
      showToast('Judul eksekusi wajib diisi', 'error');
      return;
    }

    setActionLoading('launch');
    try {
      const response = await apiClient.post('/api/action?action=createWorkflowInstance', {
        workflow_id: launchWorkflow.id,
        title: launchTitle,
        variables: {
          student_name: studentName || 'Nama Siswa Custom',
          reason: studentReason || 'Keperluan pribadi',
          start_date: studentStartDate,
          end_date: studentEndDate
        }
      });

      if (response.data.success) {
        showToast('Alur Kerja Berhasil Dijalankan (Instance Active)!');
        setShowLaunchModal(false);
        setActiveSubTab('runs');
        fetchData();
      } else {
        showToast(response.data.message || 'Gagal menjalankan', 'error');
      }
    } catch (err) {
      showToast('Kesalahan sistem saat menjalankan workflow', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Approve / Reject active BPM task
  const handleProcessTask = async (status: 'APPROVED' | 'REJECTED') => {
    if (!processingTask) return;

    setActionLoading(`task-${processingTask.id}`);
    try {
      const response = await apiClient.post('/api/action?action=processWorkflowTask', {
        task_id: processingTask.id,
        approval_status: status,
        notes: taskNotes
      });

      if (response.data.success) {
        showToast(`Tindakan "${status === 'APPROVED' ? 'Setujui' : 'Tolak'}" berhasil diproses!`);
        setProcessingTask(null);
        setTaskNotes('');
        fetchData();
      } else {
        showToast(response.data.message || 'Gagal memproses tindakan', 'error');
      }
    } catch (err) {
      showToast('Error memproses persetujuan tugas', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Delete Workflow definition
  const handleDeleteDefinition = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menonaktifkan & menghapus alur kerja ini?')) return;

    try {
      const response = await apiClient.post('/api/action?action=deleteWorkflowDefinition', { id });
      if (response.data.success) {
        showToast('Definisi alur kerja berhasil dihapus.');
        fetchData();
      }
    } catch (err) {
      showToast('Gagal menghapus alur', 'error');
    }
  };

  // Save n8n integration configuration
  const handleSaveN8n = async () => {
    if (!n8nName || !n8nWebhookUrl) {
      showToast('Nama konektor dan Webhook URL wajib diisi', 'error');
      return;
    }

    setActionLoading('saveN8n');
    try {
      const response = await apiClient.post('/api/action?action=saveN8nIntegration', {
        id: editingN8n?.id,
        name: n8nName,
        webhook_url: n8nWebhookUrl,
        auth_token: n8nAuthToken,
        event_triggers: n8nTriggers,
        is_active: n8nActive
      });

      if (response.data.success) {
        showToast('Konektor Integrasi n8n berhasil disimpan!');
        setEditingN8n(null);
        fetchData();
      } else {
        showToast(response.data.message || 'Gagal menyimpan', 'error');
      }
    } catch (err) {
      showToast('Gagal menyimpan integrasi n8n', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Trigger manual webhook n8n test
  const handleTestN8n = async () => {
    if (!testIntegration) return;

    let parsedPayload;
    try {
      parsedPayload = JSON.parse(testPayload);
    } catch (err) {
      showToast('Payload JSON tidak valid!', 'error');
      return;
    }

    setActionLoading('testN8n');
    setTestResult(null);
    try {
      const response = await apiClient.post('/api/action?action=triggerN8nManual', {
        integration_id: testIntegration.id,
        payload: parsedPayload
      });

      if (response.data.success) {
        setTestResult(response.data.data);
        showToast('Koneksi Webhook n8n Terverifikasi!');
      } else {
        showToast(response.data.message || 'Uji coba n8n gagal', 'error');
      }
    } catch (err) {
      showToast('Kesalahan menghubungi server simulasi n8n', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Setup template in designer
  const handleLoadTemplate = (tpl: any) => {
    setSelectedTemplate(tpl);
    setEditingDefinition(null);
    setDefName(tpl.name);
    setDefDescription(tpl.description);
    setDefCategory(tpl.category_id);
    setDefNodes(JSON.parse(JSON.stringify(tpl.nodes))); // deep clone
  };

  // Setup existing definition for editing
  const handleLoadDefinitionForEdit = (def: any) => {
    setEditingDefinition(def);
    setSelectedTemplate(null);
    setDefName(def.name);
    setDefDescription(def.description);
    setDefCategory(def.category_id);
    setDefNodes(JSON.parse(JSON.stringify(def.nodes)));
  };

  // Add a step in node designer
  const handleAddNode = () => {
    const newNode = {
      id: `step-${Date.now()}`,
      type: 'approval',
      label: 'Tahap Persetujuan Baru',
      assignee: 'WALI_KELAS'
    };
    setDefNodes([...defNodes, newNode]);
  };

  // Remove a step in node designer
  const handleRemoveNode = (idx: number) => {
    if (defNodes[idx].type === 'trigger') {
      showToast('Langkah trigger tidak boleh dihapus', 'error');
      return;
    }
    const updated = [...defNodes];
    updated.splice(idx, 1);
    setDefNodes(updated);
  };

  // Update a step inside node designer
  const handleUpdateNode = (idx: number, fields: any) => {
    const updated = [...defNodes];
    updated[idx] = { ...updated[idx], ...fields };
    setDefNodes(updated);
  };

  // Move step up in sequence
  const handleMoveNodeUp = (idx: number) => {
    if (idx <= 1) return; // Don't move trigger or above trigger
    const updated = [...defNodes];
    const temp = updated[idx];
    updated[idx] = updated[idx - 1];
    updated[idx - 1] = temp;
    setDefNodes(updated);
  };

  // Move step down in sequence
  const handleMoveNodeDown = (idx: number) => {
    if (idx <= 0 || idx >= defNodes.length - 1) return;
    const updated = [...defNodes];
    const temp = updated[idx];
    updated[idx] = updated[idx + 1];
    updated[idx + 1] = temp;
    setDefNodes(updated);
  };

  // SQL Script generator for Supabase Postgres
  const generatedSql = `-- SPRINT 24: ENTERPRISE BPM WORKFLOWS & N8N INTEGRATIONS
-- SQL Supabase / PostgreSQL Tables Schema Definition

-- 1. Create Workflow Categories
CREATE TABLE IF NOT EXISTS public.workflow_categories (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 2. Create Workflow Definitions / Activators
CREATE TABLE IF NOT EXISTS public.workflow_definitions (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    category_id VARCHAR(50) REFERENCES public.workflow_categories(id),
    name VARCHAR(150) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    nodes JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(50),
    updated_by VARCHAR(50)
);

-- 3. Create Workflow Instances (Tracks Running Processes)
CREATE TABLE IF NOT EXISTS public.workflow_instances (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    workflow_id VARCHAR(50) REFERENCES public.workflow_definitions(id),
    title VARCHAR(200) NOT NULL,
    status VARCHAR(50) DEFAULT 'RUNNING', -- RUNNING, APPROVED, REJECTED, COMPLETED
    current_step_id VARCHAR(50) NOT NULL,
    variables JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(50),
    updated_by VARCHAR(50)
);

-- 4. Create Workflow Tasks (Queue for Person-In-Charge Approvals)
CREATE TABLE IF NOT EXISTS public.workflow_tasks (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    instance_id VARCHAR(50) REFERENCES public.workflow_instances(id) ON DELETE CASCADE,
    step_id VARCHAR(50) NOT NULL,
    label VARCHAR(200) NOT NULL,
    assignee_role VARCHAR(50) NOT NULL, -- e.g. WALI_KELAS, KEPALA_SEKOLAH, BENDAHARA
    assignee_user_id VARCHAR(50),
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    notes TEXT,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 5. Create n8n Webhook Integrations
CREATE TABLE IF NOT EXISTS public.n8n_integrations (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    webhook_url TEXT NOT NULL,
    auth_token TEXT,
    event_triggers TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(50),
    updated_by VARCHAR(50)
);

-- Enable Row Level Security (RLS) on new structures
ALTER TABLE public.workflow_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.n8n_integrations ENABLE ROW LEVEL SECURITY;

-- Seeding Default Categories
INSERT INTO public.workflow_categories (id, tenant_id, name, description)
VALUES 
('cat-1', 'tenant-1', 'Keuangan & SPP', 'Otomasi proses keuangan, penagihan, keringanan SPP'),
('cat-2', 'tenant-1', 'KBM & Perizinan', 'Otomasi perizinan santri/siswa, absen, dan dispensasi'),
('cat-3', 'tenant-1', 'Operasional & PO', 'Alur persetujuan PO, pengadaan logistik, aset sekolah')
ON CONFLICT (id) DO NOTHING;
`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(generatedSql);
    showToast('SQL script disalin ke clipboard!');
  };

  // Helper colors
  const isPondok = tenant?.type === 'PONDOK' || tenant?.type === 'KEDUA';
  const accentColor = isPondok ? 'teal' : 'blue';
  const accentBg = isPondok ? 'bg-teal-600 hover:bg-teal-500' : 'bg-blue-600 hover:bg-blue-500';
  const accentBorder = isPondok ? 'border-teal-600 text-teal-600' : 'border-blue-600 text-blue-600';
  const accentRing = isPondok ? 'focus:ring-teal-500' : 'focus:ring-blue-500';

  // Filters definitions & instances
  const filteredDefinitions = definitions.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50">
      
      {/* Toast Alert */}
      {toastMsg && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl border transition-all animate-bounce ${
          toastMsg.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {toastMsg.type === 'success' ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <AlertCircle className="h-5 w-5 text-rose-600" />}
          <span className="text-sm font-semibold">{toastMsg.text}</span>
        </div>
      )}

      {/* Title Header Section */}
      <div className="p-6 md:p-8 border-b border-slate-200 shrink-0 bg-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl bg-${accentColor}-50 text-${accentColor}-600`}>
              <Zap className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Otomasi Alur Kerja & BPM</h1>
                <span className="text-[10px] bg-slate-100 text-slate-500 font-mono px-2 py-0.5 rounded-full border border-slate-200">Sprint 24</span>
              </div>
              <p className="text-slate-500 text-xs mt-1">
                Sistem Manajemen Proses Bisnis (BPM) Enterprise terintegrasi penuh dengan webhook real-time n8n, persetujuan multi-level instansi {isPondok ? 'pesantren' : 'sekolah'}.
              </p>
            </div>
          </div>
          
          {/* Header Action Controls */}
          <div className="flex items-center gap-2">
            <button 
              onClick={fetchData}
              disabled={loading}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg border border-slate-200 transition-colors cursor-pointer disabled:opacity-50"
              title="Sinkronkan Data"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => {
                // Initialize clean workflow designer
                setSelectedTemplate(null);
                setEditingDefinition({ id: null });
                setDefName('Alur Kerja Kustom Baru');
                setDefDescription('Deskripsi alur kerja kustom Anda...');
                setDefCategory(categories[0]?.id || 'cat-2');
                setDefNodes([
                  { id: 'start', type: 'trigger', label: 'Trigger Inisiasi', assignee: 'SANTRI' },
                  { id: 'step-1', type: 'approval', label: 'Tahap Verifikasi', assignee: 'WALI_KELAS' }
                ]);
                setActiveSubTab('definitions');
              }}
              className={`px-4 py-2 text-white font-semibold text-xs rounded-lg transition-all shadow-sm flex items-center gap-2 cursor-pointer ${accentBg}`}
            >
              <Plus className="h-4 w-4" />
              <span>Desain Alur Baru</span>
            </button>
          </div>
        </div>

        {/* Custom Tab Navigation Bar */}
        <div className="flex border-b border-slate-200 mt-6 overflow-x-auto gap-6 shrink-0">
          <button
            onClick={() => setActiveSubTab('runs')}
            className={`pb-3 text-xs font-bold transition-all relative border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeSubTab === 'runs' 
                ? `border-${accentColor}-600 text-${accentColor}-600` 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <GitPullRequest className="h-4 w-4" />
            <span>Eksekusi Aktif ({instances.length})</span>
            {instances.filter(i => i.status === 'RUNNING').length > 0 && (
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping absolute top-0.5 right-0" />
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('tasks')}
            className={`pb-3 text-xs font-bold transition-all relative border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeSubTab === 'tasks' 
                ? `border-${accentColor}-600 text-${accentColor}-600` 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <UserCheck className="h-4 w-4" />
            <span>Kotak Masuk Persetujuan ({tasks.filter(t => t.status === 'PENDING').length})</span>
            {tasks.filter(t => t.status === 'PENDING').length > 0 && (
              <span className="px-1.5 py-0.25 text-[9px] bg-rose-500 text-white rounded-full font-bold ml-1">
                {tasks.filter(t => t.status === 'PENDING').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('definitions')}
            className={`pb-3 text-xs font-bold transition-all relative border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeSubTab === 'definitions' 
                ? `border-${accentColor}-600 text-${accentColor}-600` 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Sliders className="h-4 w-4" />
            <span>Desain Alur & Template</span>
          </button>

          <button
            onClick={() => setActiveSubTab('n8n')}
            className={`pb-3 text-xs font-bold transition-all relative border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeSubTab === 'n8n' 
                ? `border-${accentColor}-600 text-${accentColor}-600` 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Server className="h-4 w-4" />
            <span>Integrasi n8n Webhooks</span>
          </button>

          <button
            onClick={() => setActiveSubTab('sql')}
            className={`pb-3 text-xs font-bold transition-all relative border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeSubTab === 'sql' 
                ? `border-${accentColor}-600 text-${accentColor}-600` 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Database className="h-4 w-4" />
            <span>Skema SQL Supabase</span>
          </button>
        </div>
      </div>

      {/* Main Container / Content Frame */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        
        {/* ==================================================== */}
        {/* SUBTAB 1: ACTIVE INSTANCES & RUNS */}
        {/* ==================================================== */}
        {activeSubTab === 'runs' && (
          <div className="space-y-6">
            
            {/* Header / Intro section inside Tab */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Play className="h-5 w-5 text-emerald-400" />
                  <span>Pelacakan Proses Aktif (BPM Engine)</span>
                </h3>
                <p className="text-slate-300 text-xs mt-1">
                  Keluarkan pengajuan baru atau pantau alur proses yang sedang berjalan di setiap tingkat penanggung jawab secara visual.
                </p>
              </div>
              
              {/* Quick Trigger Button */}
              <div className="flex gap-2">
                {definitions.length > 0 ? (
                  <button
                    onClick={() => handleOpenLaunch(definitions[0])}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play className="h-3.5 w-3.5" />
                    <span>Luncurkan Form Izin</span>
                  </button>
                ) : (
                  <div className="text-xs text-slate-400 italic">Buat desain alur terlebih dahulu</div>
                )}
              </div>
            </div>

            {/* List of active runs */}
            {instances.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <GitPullRequest className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <h4 className="font-bold text-slate-700 text-sm">Belum Ada Eksekusi Proses</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  Silakan luncurkan instansi alur kerja atau aktifkan template proses untuk memulai otomatisasi alur kerja Anda.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {instances.map((inst) => {
                  const wfDef = definitions.find(d => d.id === inst.workflow_id) || templates.find(t => t.id === inst.workflow_id);
                  const activeStepIdx = wfDef ? wfDef.nodes.findIndex((n: any) => n.id === inst.current_step_id) : -1;
                  
                  return (
                    <div key={inst.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
                      
                      {/* Run Info Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-800 text-sm">{inst.title}</h4>
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                              inst.status === 'RUNNING' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                              inst.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                              'bg-rose-50 text-rose-700 border border-rose-100'
                            }`}>
                              {inst.status === 'RUNNING' ? 'Proses Berjalan' :
                               inst.status === 'COMPLETED' ? 'Selesai Terverifikasi' : 'Ditolak / Gagal'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono mt-1">
                            <span>ID: {inst.id}</span>
                            <span>•</span>
                            <span>Mulai: {new Date(inst.created_at).toLocaleString('id-ID')}</span>
                          </div>
                        </div>

                        {/* Variables info block */}
                        <div className="text-right text-[11px] bg-slate-50 border border-slate-100 rounded-lg p-2 font-mono">
                          <div className="text-slate-500"><span className="font-bold text-slate-700">Siswa:</span> {inst.variables.student_name}</div>
                          <div className="text-slate-400 mt-0.5"><span className="font-bold text-slate-600">Alasan:</span> {inst.variables.reason}</div>
                        </div>
                      </div>

                      {/* VISUAL BPMN FLOW TRACKER */}
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-3">Peta Perjalanan Alur Kerja (BPM Stepper)</span>
                        
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                          {wfDef?.nodes?.map((node: any, idx: number) => {
                            const isCompleted = idx < activeStepIdx || inst.status === 'COMPLETED';
                            const isActive = idx === activeStepIdx && inst.status === 'RUNNING';
                            const isFailed = inst.status === 'REJECTED' && idx === activeStepIdx;

                            return (
                              <div key={node.id} className="relative flex flex-col items-center text-center p-3 rounded-xl border transition-all duration-300 bg-white shadow-sm">
                                
                                {/* Top Connector Line */}
                                {idx > 0 && (
                                  <div className={`hidden md:block absolute top-1/2 -left-3.5 w-6 h-0.5 z-0 ${
                                    isCompleted ? `bg-emerald-500` : isActive ? `bg-${accentColor}-500 animate-pulse` : 'bg-slate-200'
                                  }`} />
                                )}

                                {/* Icon indicator */}
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center z-10 text-xs font-bold mb-2 ${
                                  isCompleted ? 'bg-emerald-500 text-white shadow-emerald-100 shadow-md' :
                                  isActive ? `bg-${accentColor}-600 text-white shadow-md animate-pulse` :
                                  isFailed ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-400 border border-slate-200'
                                }`}>
                                  {isCompleted ? <Check className="h-4 w-4" /> :
                                   isFailed ? <X className="h-4 w-4" /> :
                                   idx + 1}
                                </div>

                                <div className="space-y-0.5">
                                  <span className={`text-xs font-bold block ${
                                    isActive ? `text-${accentColor}-700` : isCompleted ? 'text-emerald-700' : isFailed ? 'text-rose-700' : 'text-slate-500'
                                  }`}>
                                    {node.label}
                                  </span>
                                  <span className="text-[9px] font-mono text-slate-400 block">
                                    {node.type === 'trigger' ? 'Pemohon' : node.assignee}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* SUBTAB 2: MY TASKS (APPROVAL QUEUE) */}
        {/* ==================================================== */}
        {activeSubTab === 'tasks' && (
          <div className="space-y-6">
            
            <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center justify-between shadow-sm">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Kotak Masuk Tugas Persetujuan Anda</h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  Sebagai Super Admin / Kepala Sekolah, setujui atau tolak pengujian pengajuan di bawah ini.
                </p>
              </div>
              <div className="h-9 w-9 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
                <UserCheck className="h-5 w-5" />
              </div>
            </div>

            {/* Tasks list filter */}
            {tasks.filter(t => t.status === 'PENDING').length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
                <h4 className="font-bold text-slate-700 text-sm">Semua Tugas Sudah Selesai!</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Saat ini tidak ada antrean tugas persetujuan yang tertunda untuk peran Anda.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tasks.filter(t => t.status === 'PENDING').map((task) => (
                  <div key={task.id} className="bg-white rounded-xl border border-amber-200 bg-amber-50/20 p-6 shadow-sm space-y-4">
                    
                    {/* Header */}
                    <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                          <h4 className="font-bold text-slate-800 text-sm">{task.label}</h4>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono mt-1">Task ID: {task.id}</p>
                      </div>
                      <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200 uppercase font-mono">
                        {task.assignee_role}
                      </span>
                    </div>

                    {/* Parameters details */}
                    <div className="bg-white border border-slate-100 rounded-lg p-3 space-y-2 text-xs">
                      <div className="grid grid-cols-3">
                        <span className="text-slate-400 font-semibold">Instansi Run:</span>
                        <span className="col-span-2 text-slate-700 font-bold font-mono">{task.instance_title}</span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="text-slate-400 font-semibold">Nama Siswa:</span>
                        <span className="col-span-2 text-slate-700 font-semibold">{task.variables.student_name}</span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="text-slate-400 font-semibold">Alasan Izin:</span>
                        <span className="col-span-2 text-slate-700 font-medium italic">"{task.variables.reason}"</span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="text-slate-400 font-semibold">Durasi:</span>
                        <span className="col-span-2 text-slate-600 font-mono">
                          {task.variables.start_date} s/d {task.variables.end_date}
                        </span>
                      </div>
                    </div>

                    {/* Process Actions */}
                    {processingTask?.id === task.id ? (
                      <div className="space-y-3 pt-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Tambahkan Catatan / Alasan</label>
                        <textarea
                          placeholder="Masukkan catatan persetujuan atau penolakan..."
                          value={taskNotes}
                          onChange={(e) => setTaskNotes(e.target.value)}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-blue-500"
                          rows={2}
                        />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleProcessTask('APPROVED')}
                            disabled={actionLoading === `task-${task.id}`}
                            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Check className="h-4 w-4" />
                            <span>Konfirmasi Setujui</span>
                          </button>
                          <button
                            onClick={() => handleProcessTask('REJECTED')}
                            disabled={actionLoading === `task-${task.id}`}
                            className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <X className="h-4 w-4" />
                            <span>Tolak Pengajuan</span>
                          </button>
                          <button
                            onClick={() => setProcessingTask(null)}
                            className="p-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-500 rounded-lg"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setProcessingTask(task); setTaskNotes(''); }}
                        className={`w-full py-2.5 border font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${accentBorder} hover:bg-slate-50`}
                      >
                        <Sliders className="h-4 w-4" />
                        <span>Ambil Tindakan Keputusan</span>
                      </button>
                    )}

                  </div>
                ))}
              </div>
            )}
            
            {/* Audited Task History */}
            <div className="space-y-3 pt-6 border-t border-slate-200">
              <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Histori Tindakan Selesai</h3>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 font-bold border-b">
                      <th className="p-4">Tugas</th>
                      <th className="p-4">Keputusan</th>
                      <th className="p-4">Catatan</th>
                      <th className="p-4">Tanggal Diproses</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-600">
                    {tasks.filter(t => t.status !== 'PENDING').length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-slate-400 italic">Belum ada tugas yang diselesaikan.</td>
                      </tr>
                    ) : (
                      tasks.filter(t => t.status !== 'PENDING').map(t => (
                        <tr key={t.id} className="hover:bg-slate-50">
                          <td className="p-4 font-semibold">{t.label}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 font-bold rounded-full text-[10px] ${
                              t.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                            }`}>
                              {t.status === 'APPROVED' ? 'DISETUJUI' : 'DITOLAK'}
                            </span>
                          </td>
                          <td className="p-4 italic text-slate-400">{t.notes || 'Tanpa catatan.'}</td>
                          <td className="p-4 font-mono text-slate-400">{new Date(t.processed_at).toLocaleString('id-ID')}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ==================================================== */}
        {/* SUBTAB 3: WORKFLOW DESIGNER / TEMPLATES */}
        {/* ==================================================== */}
        {activeSubTab === 'definitions' && (
          <div className="space-y-6">
            
            {/* Template Library Slider / Grid */}
            <div className="space-y-3">
              <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Pustaka Template Alur Kerja Siap Pakai</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map(tpl => (
                  <div key={tpl.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-300 transition-all shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg bg-${accentColor}-50 text-${accentColor}-600`}>
                          <Zap className="h-4 w-4" />
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm">{tpl.name}</h4>
                      </div>
                      <p className="text-slate-500 text-xs mt-2">{tpl.description}</p>
                      
                      {/* Steps mini summary */}
                      <div className="flex flex-wrap items-center gap-2 mt-4">
                        {tpl.nodes.map((n: any, i: number) => (
                          <div key={n.id} className="flex items-center gap-1 text-[10px] bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md font-mono text-slate-500">
                            <span>{n.label}</span>
                            {i < tpl.nodes.length - 1 && <ArrowRight className="h-3 w-3 text-slate-300" />}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t flex justify-end">
                      <button
                        onClick={() => handleLoadTemplate(tpl)}
                        className={`px-3 py-1.5 border font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${accentBorder} hover:bg-slate-50`}
                      >
                        <Sliders className="h-3.5 w-3.5" />
                        <span>Muat ke Designer</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Workflow Designer Canvas */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-800 text-white p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    <span>Visual Workflow & BPM Designer</span>
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Desain dan konfigurasikan setiap simpul langkah, penanggung jawab tugas, dan alur n8n secara visual.
                  </p>
                </div>

                <button
                  onClick={handleSaveWorkflow}
                  disabled={actionLoading === 'saveWorkflow'}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Check className="h-4 w-4" />
                  <span>Simpan Alur Aktif</span>
                </button>
              </div>

              {/* Designer Form & Canvas container */}
              <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Inputs & configs */}
                <div className="space-y-5">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b pb-2">Informasi Alur</h4>
                  
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nama Alur Kerja *</label>
                    <input
                      type="text"
                      placeholder="e.g. Alur Dispensasi Izin Siswa"
                      value={defName}
                      onChange={(e) => setDefName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Deskripsi Tujuan Alur</label>
                    <textarea
                      placeholder="Tulis detail operasional..."
                      value={defDescription}
                      onChange={(e) => setDefDescription(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:border-blue-500"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Kategori Integrasi *</label>
                    <select
                      value={defCategory}
                      onChange={(e) => setDefCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:border-blue-500"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* VISUAL LAYOUT EDITOR (SIMULATED CANVAS WITH GLOW EFFECTS) */}
                <div className="col-span-2 space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Tahap-tahap Alur (Nodes Canvas)</h4>
                    <button
                      onClick={handleAddNode}
                      className={`px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-${accentColor}-700 font-bold text-xs rounded-lg border border-slate-200 flex items-center gap-1 cursor-pointer`}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Tambah Tahap</span>
                    </button>
                  </div>

                  {/* List of nodes (simulating visual nodes) */}
                  <div className="space-y-3">
                    {defNodes.map((node, index) => (
                      <div key={node.id} className="flex items-center gap-3">
                        
                        {/* Connecting Line indicator */}
                        <div className="flex flex-col items-center justify-center font-mono text-[10px] text-slate-400 font-bold bg-slate-100 h-8 w-8 rounded-full border">
                          {index + 1}
                        </div>

                        {/* Node Card design */}
                        <div className="flex-1 bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col md:flex-row items-center gap-4 shadow-sm relative">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                              <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md font-mono ${
                                node.type === 'trigger' ? 'bg-amber-100 text-amber-800' :
                                node.type === 'approval' ? 'bg-indigo-100 text-indigo-800' :
                                'bg-emerald-100 text-emerald-800'
                              }`}>
                                {node.type === 'trigger' ? 'TRIGGER / AWAL' :
                                 node.type === 'approval' ? 'APPROVAL QUEUE' : 'ACTION / SYNC'}
                              </span>
                              
                              <input
                                type="text"
                                value={node.label}
                                onChange={(e) => handleUpdateNode(index, { label: e.target.value })}
                                className="font-bold text-xs text-slate-700 bg-transparent border-b border-dashed border-slate-300 focus:outline-none focus:border-blue-500 flex-1"
                              />
                            </div>
                            
                            {/* Role / action select details */}
                            <div className="flex items-center gap-4 text-xs">
                              {node.type !== 'action' ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-slate-400">Penanggung Jawab:</span>
                                  <select
                                    value={node.assignee}
                                    onChange={(e) => handleUpdateNode(index, { assignee: e.target.value })}
                                    className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-600 focus:outline-none"
                                  >
                                    <option value="SANTRI">{isPondok ? 'Santri Mandiri' : 'Siswa'}</option>
                                    <option value="WALI_KELAS">Wali Kelas / Guru</option>
                                    <option value="KEPALA_SEKOLAH">{isPondok ? 'Kyai / Pengasuh' : 'Kepala Sekolah'}</option>
                                    <option value="BENDAHARA">Bendahara Keuangan</option>
                                    <option value="ORANG_TUA">Orang Tua / Wali Murid</option>
                                    <option value="SUPER_ADMIN">SaaS Super Admin</option>
                                  </select>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-slate-400">Pemicu Aksi:</span>
                                  <select
                                    value={node.action}
                                    onChange={(e) => handleUpdateNode(index, { action: e.target.value })}
                                    className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-600 focus:outline-none"
                                  >
                                    <option value="TRIGGER_N8N">Sinkronisasi Webhook n8n</option>
                                    <option value="SEND_WA_PARENT">Kirim Notifikasi WA Ortu</option>
                                    <option value="UPDATE_INVOICE">Update SPP / Invoice</option>
                                  </select>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Node Control Actions */}
                          <div className="flex items-center gap-1">
                            {node.type !== 'trigger' && index > 1 && (
                              <button
                                onClick={() => handleMoveNodeUp(index)}
                                className="p-1.5 text-slate-500 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                                title="Geser Naik"
                              >
                                <ChevronUp className="h-4 w-4" />
                              </button>
                            )}
                            {node.type !== 'trigger' && index < defNodes.length - 1 && (
                              <button
                                onClick={() => handleMoveNodeDown(index)}
                                className="p-1.5 text-slate-500 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                                title="Geser Turun"
                              >
                                <ChevronDown className="h-4 w-4" />
                              </button>
                            )}
                            {node.type !== 'trigger' && (
                              <button
                                onClick={() => handleRemoveNode(index)}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Hapus Simpul"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* List of active created definitions */}
            <div className="space-y-3 pt-6">
              <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Daftar Desain Alur Kerja Kustom Aktif</h3>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 font-bold border-b">
                      <th className="p-4">Nama Alur</th>
                      <th className="p-4">Deskripsi</th>
                      <th className="p-4">Kategori</th>
                      <th className="p-4">Tahapan</th>
                      <th className="p-4 text-right">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-600">
                    {definitions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-slate-400 italic">Belum ada alur kustom yang aktif.</td>
                      </tr>
                    ) : (
                      definitions.map(def => (
                        <tr key={def.id} className="hover:bg-slate-50">
                          <td className="p-4 font-bold text-slate-800">{def.name}</td>
                          <td className="p-4 text-slate-500">{def.description}</td>
                          <td className="p-4 font-mono">{categories.find(c => c.id === def.category_id)?.name || def.category_id}</td>
                          <td className="p-4">
                            <span className="font-bold bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-mono text-[10px]">
                              {def.nodes?.length || 0} Nodes
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => handleOpenLaunch(def)}
                              className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded text-[10px] cursor-pointer"
                            >
                              Luncurkan
                            </button>
                            <button
                              onClick={() => handleLoadDefinitionForEdit(def)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] border border-slate-200 cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteDefinition(def.id)}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded text-[10px] cursor-pointer"
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ==================================================== */}
        {/* SUBTAB 4: n8n INTEGRATIONS & MANUAL TESTER */}
        {/* ==================================================== */}
        {activeSubTab === 'n8n' && (
          <div className="space-y-6">
            
            {/* n8n connection details editor */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Form panel to save integration */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
                <div className="flex items-center gap-2 border-b pb-3">
                  <div className="h-8 w-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold">N</div>
                  <h3 className="font-bold text-slate-800 text-sm">Integrasi Konektor n8n Webhook</h3>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nama Konektor *</label>
                  <input
                    type="text"
                    placeholder="e.g. Server n8n Lokal Sekolah"
                    value={n8nName}
                    onChange={(e) => setN8nName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">n8n Webhook URL *</label>
                  <input
                    type="url"
                    placeholder="https://n8n.yourdomain.com/webhook/..."
                    value={n8nWebhookUrl}
                    onChange={(e) => setN8nWebhookUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Authorization Token (Secured Bearer)</label>
                  <input
                    type="password"
                    placeholder="Bearer n8n_token_..."
                    value={n8nAuthToken}
                    onChange={(e) => setN8nAuthToken(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Pemicu Event Transmisi</label>
                  <div className="space-y-2 text-xs text-slate-600">
                    {['STUDENT_REGISTER', 'PAYMENT_RECEIVE', 'LEAVE_PERMISSION_APPROVED'].map(trigger => (
                      <label key={trigger} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={n8nTriggers.includes(trigger)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setN8nTriggers([...n8nTriggers, trigger]);
                            } else {
                              setN8nTriggers(n8nTriggers.filter(t => t !== trigger));
                            }
                          }}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="font-mono">{trigger}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSaveN8n}
                  disabled={actionLoading === 'saveN8n'}
                  className={`w-full py-2.5 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${accentBg}`}
                >
                  <Check className="h-4 w-4" />
                  <span>Simpan Konektor n8n</span>
                </button>
              </div>

              {/* Simulation Manual Tester */}
              <div className="lg:col-span-2 bg-slate-900 text-slate-100 rounded-2xl shadow-xl p-6 flex flex-col justify-between border border-slate-800">
                
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Terminal className="h-5 w-5 text-orange-400" />
                      <h3 className="font-bold text-sm text-slate-100">Simulator Payload & Pengujian Manual n8n</h3>
                    </div>
                    
                    <select
                      onChange={(e) => {
                        const conn = integrations.find(i => i.id === e.target.value);
                        setTestIntegration(conn);
                      }}
                      className="bg-slate-800 text-slate-300 border border-slate-700 rounded px-2 py-1 text-xs focus:outline-none"
                    >
                      <option value="">-- Pilih Konektor Uji --</option>
                      {integrations.map(conn => (
                        <option key={conn.id} value={conn.id}>{conn.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Body Payload editor */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Left Column: Payload input */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Payload JSON Transmisi</label>
                      <textarea
                        value={testPayload}
                        onChange={(e) => setTestPayload(e.target.value)}
                        className="w-full h-44 p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-400 focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    {/* Right Column: Execution Response Console */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Konsol Respons Webhook n8n</label>
                      <div className="w-full h-44 p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-amber-400 overflow-y-auto">
                        {testResult ? (
                          <pre className="whitespace-pre-wrap">{JSON.stringify(testResult, null, 2)}</pre>
                        ) : (
                          <span className="text-slate-600 italic">Klik tombol "Uji Webhook" di bawah untuk melihat simulasi output respons HTTP dari n8n.</span>
                        )}
                      </div>
                    </div>

                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={handleTestN8n}
                    disabled={actionLoading === 'testN8n' || !testIntegration}
                    className="px-5 py-2.5 bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    <span>Uji Webhook / Kirim Payload</span>
                  </button>
                </div>

              </div>
            </div>

            {/* List of active Integrations */}
            <div className="space-y-3 pt-6">
              <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider font-sans">Daftar Konektor Webhook Terdaftar</h3>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 font-bold border-b">
                      <th className="p-4">Nama Integrasi</th>
                      <th className="p-4">Webhook URL</th>
                      <th className="p-4">Event Triggers</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-600">
                    {integrations.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-slate-400 italic">Belum ada konektor n8n yang terdaftar.</td>
                      </tr>
                    ) : (
                      integrations.map(conn => (
                        <tr key={conn.id} className="hover:bg-slate-50">
                          <td className="p-4 font-bold text-slate-800">{conn.name}</td>
                          <td className="p-4 font-mono text-slate-500 truncate max-w-xs">{conn.webhook_url}</td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1">
                              {conn.event_triggers?.map((t: string) => (
                                <span key={t} className="px-1.5 py-0.25 bg-slate-100 text-slate-600 font-mono text-[9px] rounded-md border">{t}</span>
                              ))}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 font-bold text-[10px] rounded-full ${
                              conn.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-500'
                            }`}>
                              {conn.is_active ? 'AKTIF' : 'NON-AKTIF'}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => {
                                setEditingN8n(conn);
                                setN8nName(conn.name);
                                setN8nWebhookUrl(conn.webhook_url);
                                setN8nAuthToken(conn.auth_token || '');
                                setN8nTriggers(conn.event_triggers || []);
                                setN8nActive(conn.is_active);
                              }}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] border border-slate-200 cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                setTestIntegration(conn);
                                setActiveSubTab('n8n');
                              }}
                              className="px-2 py-1 bg-orange-500 text-slate-950 font-bold rounded text-[10px] cursor-pointer"
                            >
                              Uji
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ==================================================== */}
        {/* SUBTAB 5: SUPABASE RELATIONAL SQL GENERATOR */}
        {/* ==================================================== */}
        {activeSubTab === 'sql' && (
          <div className="space-y-6">
            
            <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Skema Supabase DDL SQL (`supabase-sprint24.sql`)</h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  Salin skrip SQL relational ini untuk memigrasi tabel database workflow, task approval, dan n8n di production Supabase.
                </p>
              </div>
              <button
                onClick={copySqlToClipboard}
                className={`px-4 py-2 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${accentBg}`}
              >
                <Copy className="h-4 w-4" />
                <span>Salin Skrip SQL</span>
              </button>
            </div>

            {/* SQL Display Console Container */}
            <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-lg border border-slate-800 overflow-hidden">
              <div className="bg-slate-800 px-5 py-3 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono">supabase-sprint24.sql</span>
                <span className="bg-slate-900 px-2 py-0.5 rounded font-bold text-orange-400">PostgreSQL / Supabase</span>
              </div>
              
              <div className="p-6 font-mono text-xs overflow-x-auto h-96 text-emerald-400 whitespace-pre">
                <code>{generatedSql}</code>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* ========================================== */}
      {/* LAUNCH NEW PROCESS RUNNING MODAL */}
      {/* ========================================== */}
      {showLaunchModal && launchWorkflow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay backdrop */}
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowLaunchModal(false)} />
          
          {/* Modal Form Container */}
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className={`p-5 text-white flex items-center justify-between ${accentBg}`}>
              <div className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                <h3 className="font-bold text-sm">Luncurkan Alur Kerja Baru</h3>
              </div>
              <button onClick={() => setShowLaunchModal(false)} className="p-1 hover:bg-white/20 rounded-lg">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Judul Eksekusi (Instance Title) *</label>
                <input
                  type="text"
                  required
                  value={launchTitle}
                  onChange={(e) => setLaunchTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none"
                  placeholder="e.g. Persetujuan Izin Ahmad"
                />
              </div>

              {/* Dynamic inputs based on variables */}
              <div className="space-y-3 pt-2 border-t">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Variabel Input Pengajuan</h4>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{isPondok ? 'Nama Santri *' : 'Nama Siswa *'}</label>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none"
                    placeholder="Masukkan nama lengkap..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Alasan Pengisian Izin / Dispensasi *</label>
                  <input
                    type="text"
                    required
                    value={studentReason}
                    onChange={(e) => setStudentReason(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none"
                    placeholder="Alasan detail..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Tanggal Mulai</label>
                    <input
                      type="date"
                      value={studentStartDate}
                      onChange={(e) => setStudentStartDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Tanggal Selesai</label>
                    <input
                      type="date"
                      value={studentEndDate}
                      onChange={(e) => setStudentEndDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowLaunchModal(false)}
                className="px-4 py-2 border text-slate-500 hover:bg-slate-100 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleLaunchWorkflow}
                disabled={actionLoading === 'launch'}
                className={`px-4 py-2 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer ${accentBg}`}
              >
                <span>Luncurkan Alur</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
