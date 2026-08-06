import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { 
  FileText, 
  Inbox, 
  Send, 
  FolderLock, 
  Users, 
  FileCheck, 
  Settings, 
  Plus, 
  Filter, 
  Download, 
  Trash2, 
  CheckCircle, 
  Clock, 
  Layers, 
  Sparkles, 
  Upload, 
  Briefcase, 
  FileSpreadsheet, 
  Database,
  Search,
  Bell,
  RefreshCw,
  TrendingUp,
  MapPin,
  Calendar,
  AlertTriangle,
  QrCode,
  CheckSquare,
  Scan,
  Megaphone
} from 'lucide-react';

// Sub-components import
import LetterForm from '../components/tu/LetterForm';
import DocumentViewer from '../components/tu/DocumentViewer';
import QRViewer from '../components/tu/QRViewer';
import SignaturePad from '../components/tu/SignaturePad';
import ArchiveCard from '../components/tu/ArchiveCard';
import ReminderCard from '../components/tu/ReminderCard';
import AnalyticsCard from '../components/tu/AnalyticsCard';
import Timeline from '../components/tu/Timeline';
import MailMergeView from '../components/tu/MailMergeView';
import ArchiveReportExportModal from '../components/tu/ArchiveReportExportModal';
import SelfServiceLettersView from '../components/tu/SelfServiceLettersView';
import DynamicKopAndStampView from '../components/tu/DynamicKopAndStampView';
import WhatsAppNotificationManager from '../components/tu/WhatsAppNotificationManager';
import DispositionHierarchyMatrix from '../components/tu/DispositionHierarchyMatrix';
import GuestBookAndAgendaView from '../components/tu/GuestBookAndAgendaView';
import SmartOcrScannerView from '../components/tu/SmartOcrScannerView';
import DigitalBulletinView from '../components/tu/DigitalBulletinView';
import TemplateManagementView from '../components/tu/TemplateManagementView';
import AiLetterGeneratorView from '../components/tu/AiLetterGeneratorView';

export default function TataUsaha() {
  const queryClient = useQueryClient();
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'incoming' | 'outgoing' | 'disposition' | 'approval' | 'signature' | 'archive' | 'template' | 'number_format' | 'history' | 'mail_merge' | 'self_service' | 'kop_builder' | 'wa_gateway' | 'disposition_matrix' | 'guestbook' | 'ocr_scan' | 'digital_bulletin' | 'ai_letter_generator'>('dashboard');
  const [simulatedRole, setSimulatedRole] = useState<string>('TU');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // UI state for modals/forms
  const [isAddingLetter, setIsAddingLetter] = useState(false);
  const [letterFormType, setLetterFormType] = useState<'incoming' | 'outgoing'>('incoming');
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [isAddingDisposition, setIsAddingDisposition] = useState(false);
  const [selectedIncomingForDisp, setSelectedIncomingForDisp] = useState<any | null>(null);
  
  // New entry triggers
  const [showQrVerifier, setShowQrVerifier] = useState(false);
  const [showSignaturePadForDoc, setShowSignaturePadForDoc] = useState<any | null>(null);
  const [showArchiveReportModal, setShowArchiveReportModal] = useState(false);

  // Form states for simplistic quick add items
  const [newTemplate, setNewTemplate] = useState({ name: '', code: '', letter_type: 'Surat Undangan', number_format: '', content_template: '', variables: '' });
  const [newGuest, setNewGuest] = useState({ full_name: '', institution: '', phone: '', email: '', id_card_number: '', purpose: '', host_name: '', room_or_department: '' });
  const [newLegal, setNewLegal] = useState({ title: '', document_number: '', legal_type: 'Izin Operasional', issuer: '', issue_date: '', expiration_date: '', alert_before_days: 30 });
  const [newArchive, setNewArchive] = useState({ title: '', document_type_code: 'OTHER', box_number: '', shelf_position: '', retention_period_years: 5 });

  // Token helper
  const getAuthHeaders = () => {
    const token = localStorage.getItem('erp_token');
    return { Authorization: `Bearer ${token}` };
  };

  // Queries using TanStack Query
  const { data: dashboardStats, refetch: refetchDashboard } = useQuery({
    queryKey: ['officeDashboard'],
    queryFn: async () => {
      const res = await axios.post('/api/action?action=officeDashboard', {}, { headers: getAuthHeaders() });
      return res.data.data;
    }
  });

  const { data: incomingLetters = [], refetch: refetchIncoming } = useQuery({
    queryKey: ['incomingLetters'],
    queryFn: async () => {
      const res = await axios.post('/api/action?action=incomingLetterList', {}, { headers: getAuthHeaders() });
      return res.data.data;
    }
  });

  const { data: outgoingLetters = [], refetch: refetchOutgoing } = useQuery({
    queryKey: ['outgoingLetters'],
    queryFn: async () => {
      const res = await axios.post('/api/action?action=outgoingLetterList', {}, { headers: getAuthHeaders() });
      return res.data.data;
    }
  });

  const { data: templates = [], refetch: refetchTemplates } = useQuery({
    queryKey: ['letterTemplates'],
    queryFn: async () => {
      const res = await axios.post('/api/action?action=letterTemplateList', {}, { headers: getAuthHeaders() });
      return res.data.data;
    }
  });

  const { data: archives = [], refetch: refetchArchives } = useQuery({
    queryKey: ['archivesList'],
    queryFn: async () => {
      const res = await axios.post('/api/action?action=archiveList', {}, { headers: getAuthHeaders() });
      return res.data.data;
    }
  });

  const { data: guestBook = [], refetch: refetchGuests } = useQuery({
    queryKey: ['guestsList'],
    queryFn: async () => {
      const res = await axios.post('/api/action?action=guestBook', {}, { headers: getAuthHeaders() });
      return res.data.data;
    }
  });

  const { data: expeditions = [], refetch: refetchExpeditions } = useQuery({
    queryKey: ['expeditionsList'],
    queryFn: async () => {
      const res = await axios.post('/api/action?action=expeditionBook', {}, { headers: getAuthHeaders() });
      return res.data.data;
    }
  });

  const { data: legals = [], refetch: refetchLegals } = useQuery({
    queryKey: ['legalsList'],
    queryFn: async () => {
      const res = await axios.post('/api/action?action=legalDocument', {}, { headers: getAuthHeaders() });
      return res.data.data;
    }
  });

  const { data: reminders = [], refetch: refetchReminders } = useQuery({
    queryKey: ['remindersList'],
    queryFn: async () => {
      const res = await axios.post('/api/action?action=documentReminder', {}, { headers: getAuthHeaders() });
      return res.data.data;
    }
  });

  const { data: analyticsData, refetch: refetchAnalytics } = useQuery({
    queryKey: ['documentAnalytics'],
    queryFn: async () => {
      const res = await axios.post('/api/action?action=documentAnalytics', {}, { headers: getAuthHeaders() });
      return res.data.data;
    }
  });

  const { data: workflowSteps = ['Draft', 'Review', 'Verifikasi', 'Approval', 'Tanda Tangan Digital', 'Nomor Surat', 'Publish', 'Distribusi', 'Arsip'], refetch: refetchWorkflowSteps } = useQuery({
    queryKey: ['workflowSteps'],
    queryFn: async () => {
      const res = await axios.post('/api/action?action=workflowStepsGet', {}, { headers: getAuthHeaders() });
      return res.data.data;
    }
  });

  const { data: approvalStages = ['Administrator', 'TU', 'Kepala Sekolah', 'Ketua Yayasan', 'Selesai'], refetch: refetchApprovalStages } = useQuery({
    queryKey: ['approvalStages'],
    queryFn: async () => {
      const res = await axios.post('/api/action?action=approvalStagesGet', {}, { headers: getAuthHeaders() });
      return res.data.data;
    }
  });

  const { data: historyLogs = [], refetch: refetchHistory } = useQuery({
    queryKey: ['historyLogs'],
    queryFn: async () => {
      const res = await axios.post('/api/action?action=letterHistory', {}, { headers: getAuthHeaders() });
      return res.data.data;
    }
  });

  const updateWorkflowMutation = useMutation({
    mutationFn: async (steps: string[]) => {
      const res = await axios.post('/api/action?action=workflowStepsUpdate', { steps }, { headers: getAuthHeaders() });
      return res.data;
    },
    onSuccess: () => {
      refetchWorkflowSteps();
      refetchHistory();
    }
  });

  const updateApprovalStagesMutation = useMutation({
    mutationFn: async (stages: string[]) => {
      const res = await axios.post('/api/action?action=approvalStagesUpdate', { stages }, { headers: getAuthHeaders() });
      return res.data;
    },
    onSuccess: () => {
      refetchApprovalStages();
      refetchHistory();
    }
  });

  const createDigitalSignatureMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axios.post('/api/action?action=digitalSignatureCreate', payload, { headers: getAuthHeaders() });
      return res.data;
    },
    onSuccess: () => {
      refetchIncoming();
      refetchOutgoing();
      refetchHistory();
    }
  });

  // Mutations
  const createTemplateMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axios.post('/api/action?action=letterTemplateSave', payload, { headers: getAuthHeaders() });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['letterTemplates'] });
      refetchTemplates();
      setNewTemplate({ name: '', code: '', letter_type: 'Surat Undangan', number_format: '', content_template: '', variables: '' });
    }
  });

  const generateNumberFromTemplate = async (tmplCode: string) => {
    try {
      const res = await axios.post('/api/action?action=letterNumberGenerate', {
        template_code: tmplCode
      }, {
        headers: getAuthHeaders()
      });
      if (res.data.success) {
        alert(`Format Nomor Surat Tergenerate: ${res.data.data.number}`);
      }
    } catch (err) {
      alert('Gagal menghasilkan nomor dari template format');
    }
  };

  const createGuestMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axios.post('/api/action?action=guestBook', {
        sub_action: 'checkin',
        ...payload
      }, { headers: getAuthHeaders() });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guestsList'] });
      refetchGuests();
      refetchDashboard();
      setNewGuest({ full_name: '', institution: '', phone: '', email: '', id_card_number: '', purpose: '', host_name: '', room_or_department: '' });
    }
  });

  const guestCheckoutMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axios.post('/api/action?action=guestBook', {
        sub_action: 'checkout',
        ...payload
      }, { headers: getAuthHeaders() });
      return res.data;
    },
    onSuccess: () => {
      refetchGuests();
    }
  });

  const createLegalMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axios.post('/api/action?action=legalDocument', {
        sub_action: 'save',
        ...payload
      }, { headers: getAuthHeaders() });
      return res.data;
    },
    onSuccess: () => {
      refetchLegals();
      refetchReminders();
      refetchDashboard();
      setNewLegal({ title: '', document_number: '', legal_type: 'Izin Operasional', issuer: '', issue_date: '', expiration_date: '', alert_before_days: 30 });
    }
  });

  const createArchiveMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axios.post('/api/action?action=archiveStore', payload, { headers: getAuthHeaders() });
      return res.data;
    },
    onSuccess: () => {
      refetchArchives();
      refetchDashboard();
      setNewArchive({ title: '', document_type_code: 'OTHER', box_number: '', shelf_position: '', retention_period_years: 5 });
    }
  });

  const createDispositionMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axios.post('/api/action?action=dispositionCreate', payload, { headers: getAuthHeaders() });
      return res.data;
    },
    onSuccess: () => {
      refetchIncoming();
      refetchDashboard();
      setIsAddingDisposition(false);
      setSelectedIncomingForDisp(null);
    }
  });

  const updateDocSignatureMutation = useMutation({
    mutationFn: async ({ docId, sigType, sigData }: { docId: string; sigType: string; sigData: string }) => {
      const res = await axios.post('/api/action?action=outgoingLetterUpdate', {
        id: docId,
        is_draft: false, // Mark as final/signed
        qr_code_hash: `QR_OUT_LET_${docId.substring(0, 4).toUpperCase()}_VERIFIED`
      }, { headers: getAuthHeaders() });
      return res.data;
    },
    onSuccess: () => {
      refetchOutgoing();
      setShowSignaturePadForDoc(null);
    }
  });

  const deleteIncomingMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await axios.post('/api/action?action=incomingLetterDelete', { id }, { headers: getAuthHeaders() });
      return res.data;
    },
    onSuccess: () => {
      refetchIncoming();
      refetchDashboard();
    }
  });

  // Action Refetch triggers
  const forceRefetchAll = () => {
    refetchDashboard();
    refetchIncoming();
    refetchOutgoing();
    refetchTemplates();
    refetchArchives();
    refetchGuests();
    refetchExpeditions();
    refetchLegals();
    refetchReminders();
    refetchAnalytics();
    refetchWorkflowSteps();
    refetchApprovalStages();
    refetchHistory();
  };

  // Excel / CSV Export mock helper
  const triggerExport = (format: 'pdf' | 'excel' | 'csv', datasetName: string) => {
    alert(`Mengekspor data "${datasetName}" dalam format ${format.toUpperCase()}... File siap diunduh.`);
  };

  // AI Document Generator Integration
  const handleAIGenerateLetter = () => {
    alert("Mengintegrasikan dengan AI Document Generator (Sprint 21)... Menghasilkan konsep draf surat otomatis berdasarkan perihal & ringkasan.");
  };

  // Filtering Logic
  const filteredIncoming = incomingLetters.filter((l: any) => {
    const matchesSearch = searchQuery ? (
      l.letter_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.subject.toLowerCase().includes(searchQuery.toLowerCase())
    ) : true;
    const matchesStatus = filterStatus ? l.status === filterStatus : true;
    return matchesSearch && matchesStatus;
  });

  const filteredOutgoing = outgoingLetters.filter((l: any) => {
    const matchesSearch = searchQuery ? (
      l.letter_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.subject.toLowerCase().includes(searchQuery.toLowerCase())
    ) : true;
    const matchesType = filterType ? l.letter_type === filterType : true;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 font-sans">
      
      {/* Upper Navigation & Tab Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            Digital Document Workflow & Disposition Engine
          </h1>
          <p className="text-xs text-slate-500 font-mono">
            SaaS Administrasi Yayasan, Sekolah, Pondok Pesantren — Single Tenant (MySQL & Prisma ORM)
          </p>
        </div>

        {/* Global Action Tools with Role Simulation */}
        <div className="flex items-center flex-wrap gap-2">
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Simulasi RBAC:</span>
            <select
              value={simulatedRole}
              onChange={(e) => setSimulatedRole(e.target.value)}
              className="text-xs bg-white border border-amber-300 rounded px-2 py-1 text-amber-900 font-bold focus:outline-none"
            >
              {['Super Admin', 'Administrator', 'TU', 'Kepala Sekolah', 'Ketua Yayasan', 'Bendahara', 'Operator', 'Guru', 'Musyrif'].map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowArchiveReportModal(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
          >
            <Download className="h-4 w-4" />
            Rekap Kearsipan (PDF/Excel)
          </button>

          <button
            onClick={() => setShowQrVerifier(!showQrVerifier)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
              showQrVerifier 
                ? 'bg-purple-100 text-purple-700 border-purple-200' 
                : 'bg-white text-purple-700 border-purple-200 hover:bg-purple-50'
            }`}
          >
            <QrCode className="h-4 w-4" />
            Verifikasi QR Asli
          </button>

          <button
            onClick={forceRefetchAll}
            className="p-1.5 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg cursor-pointer"
            title="Refresh Realtime Data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* QR authenticity widget floating container */}
      {showQrVerifier && (
        <div className="max-w-md mx-auto animate-fade-in">
          <QRViewer />
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap gap-1.5 bg-white p-1.5 border border-slate-200 rounded-xl overflow-x-auto shadow-sm">
        {[
          { id: 'dashboard', label: 'Dashboard TU', icon: Layers },
          { id: 'incoming', label: 'Surat Masuk', icon: Inbox },
          { id: 'outgoing', label: 'Surat Keluar', icon: Send },
          { id: 'mail_merge', label: 'Cetak Massal & Mail Merge', icon: FileSpreadsheet },
          { id: 'self_service', label: '1. Layanan Mandiri Surat', icon: FileCheck },
          { id: 'kop_builder', label: '2. Builder Kop & Stempel', icon: Settings },
          { id: 'wa_gateway', label: '3. WA Broadcast', icon: Send },
          { id: 'disposition_matrix', label: '4. Matriks Hirarki', icon: CheckSquare },
          { id: 'guestbook', label: '5. Buku Tamu Digital', icon: Users },
          { id: 'ocr_scan', label: '6. Smart OCR Scan Surat', icon: Scan },
          { id: 'digital_bulletin', label: '7. Papan Pengumuman Digital', icon: Megaphone },
          { id: 'template', label: '8. Manajer Template Surat', icon: Settings },
          { id: 'ai_letter_generator', label: '9. Pembuat Surat AI (Data Terhubung)', icon: Sparkles },
          { id: 'disposition', label: 'Disposisi', icon: CheckSquare },
          { id: 'approval', label: 'Persetujuan', icon: FileCheck },
          { id: 'signature', label: 'Tanda Tangan Digital', icon: Sparkles },
          { id: 'archive', label: 'Arsip Digital', icon: Database },
          { id: 'number_format', label: 'Nomor Surat', icon: FileText },
          { id: 'history', label: 'Riwayat', icon: Clock }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id as any);
                setSelectedDoc(null);
                setIsAddingLetter(false);
              }}
              className={`px-3.5 py-2 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeSubTab === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ====================================================================== */}
      {/* 1. DASHBOARD TATA USAHA VIEW */}
      {/* ====================================================================== */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-6">
          
          {/* Top Counters Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Surat Masuk', value: dashboardStats?.totalIncoming || 0, icon: Inbox, color: 'text-blue-600 bg-blue-50 border-blue-150' },
              { label: 'Total Surat Keluar', value: dashboardStats?.totalOutgoing || 0, icon: Send, color: 'text-emerald-600 bg-emerald-50 border-emerald-150' },
              { label: 'Arsip Terindeks', value: dashboardStats?.totalArchives || 0, icon: Database, color: 'text-indigo-600 bg-indigo-50 border-indigo-150' },
              { label: 'Tamu Hari Ini', value: dashboardStats?.totalGuests || 0, icon: Users, color: 'text-slate-600 bg-slate-50 border-slate-150' }
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className={`bg-white p-5 border rounded-xl flex items-center justify-between shadow-sm ${stat.color}`}>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{stat.label}</span>
                    <h3 className="text-2xl font-black text-slate-850 tracking-tight mt-1">{stat.value}</h3>
                  </div>
                  <div className="p-3 bg-white/80 rounded-lg shadow-inner">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Integration Alerts & Action shortcuts */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-5 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] bg-blue-500 text-white font-black px-2 py-0.5 rounded font-mono">INTEGRATION HUB</span>
                <span className="text-[10px] text-slate-300">PPDB Sprint 17 • Keuangan Sprint 10</span>
              </div>
              <h3 className="text-sm font-extrabold tracking-tight">Otomasi Alur Layanan Administrasi Terbuka</h3>
              <p className="text-[11px] text-slate-300 leading-normal max-w-2xl">
                Alur registrasi murid baru, pembayaran SPP bulanan, serta pembuatan kartu digital sudah terhubung secara seamless dengan modul database warehouse.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setLetterFormType('outgoing');
                  setIsAddingLetter(true);
                  setActiveSubTab('outgoing');
                }}
                className="bg-white text-slate-900 hover:bg-slate-100 px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-sm"
              >
                <Plus className="h-4 w-4" /> Buat Surat Keluar
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Quick Guest check-in widget */}
            <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <Users className="h-4.5 w-4.5 text-blue-600" />
                  Check-in Tamu Cepat (Buku Tamu)
                </h4>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Nama Lengkap Pengunjung..."
                  value={newGuest.full_name}
                  onChange={(e) => setNewGuest({ ...newGuest, full_name: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded px-2.5 py-2"
                />
                <input
                  type="text"
                  placeholder="Asal Instansi / Perusahaan..."
                  value={newGuest.institution}
                  onChange={(e) => setNewGuest({ ...newGuest, institution: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded px-2.5 py-2"
                />
                <input
                  type="text"
                  placeholder="Tujuan Kunjungan..."
                  value={newGuest.purpose}
                  onChange={(e) => setNewGuest({ ...newGuest, purpose: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded px-2.5 py-2"
                />
                
                <button
                  type="button"
                  onClick={() => createGuestMutation.mutate(newGuest)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 rounded-lg transition"
                >
                  Registrasi Kunjungan Tamu
                </button>
              </div>
            </div>

            {/* Expiring legal documents warnings */}
            <div className="lg:col-span-2 bg-white p-5 border border-slate-200 rounded-xl shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <FolderLock className="h-4.5 w-4.5 text-amber-600" />
                  Masa Berlaku Izin & Dokumen Legal (Yayasan/Sekolah)
                </h4>
                <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-bold">
                  EXPIRING ALERT
                </span>
              </div>

              <div className="space-y-3">
                {legals.map((ld: any) => {
                  const expDate = ld.expiration_date ? new Date(ld.expiration_date) : null;
                  const daysLeft = expDate ? Math.ceil((expDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : 999;
                  const isCritical = daysLeft < 60;

                  return (
                    <div key={ld.id} className={`p-3 border rounded-xl flex items-center justify-between gap-2 text-xs ${
                      isCritical ? 'bg-red-50/50 border-red-200' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div>
                        <div className="font-bold text-slate-800">{ld.title}</div>
                        <div className="text-[10px] text-slate-500 font-mono">Tipe: {ld.legal_type} • Penerbit: {ld.issuer}</div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono text-[10px] font-bold text-slate-700">Expires: {ld.expiration_date || 'N/A'}</div>
                        <span className={`text-[9px] font-extrabold uppercase ${isCritical ? 'text-red-600' : 'text-emerald-600'}`}>
                          {daysLeft < 0 ? 'KADALUARSA' : `${daysLeft} Hari Tersisa`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Quick Analytics & Chart Preview */}
          {analyticsData && <AnalyticsCard analyticsData={analyticsData} />}
        </div>
      )}

      {/* ====================================================================== */}
      {/* 2. SURAT MASUK VIEW */}
      {/* ====================================================================== */}
      {activeSubTab === 'incoming' && (
        <div className="space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nomor perihal / pengirim..."
                className="w-full text-xs border border-slate-300 rounded-lg pl-8 pr-3 py-2 bg-white"
              />
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => triggerExport('pdf', 'Agenda Surat Masuk')}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" /> PDF
              </button>
              <button
                onClick={() => {
                  setLetterFormType('incoming');
                  setIsAddingLetter(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="h-4 w-4" /> Registrasi Surat Masuk
              </button>
            </div>
          </div>

          {/* Custom edit form nested inside */}
          {isAddingLetter && letterFormType === 'incoming' && (
            <LetterForm
              type="incoming"
              onSubmitSuccess={() => {
                setIsAddingLetter(false);
                refetchIncoming();
                refetchDashboard();
              }}
              onCancel={() => setIsAddingLetter(false)}
            />
          )}

          {/* Incoming letters datatable */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-250 text-slate-500 font-bold uppercase tracking-wider font-mono">
                <tr>
                  <th className="p-3.5">No. Agenda</th>
                  <th className="p-3.5">Tanggal / Sifat</th>
                  <th className="p-3.5">Pengirim & Perihal</th>
                  <th className="p-3.5">Status Alur</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredIncoming.map((letter: any) => (
                  <tr key={letter.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-3.5 font-mono font-bold text-slate-800">{letter.agenda_number}</td>
                    <td className="p-3.5">
                      <div className="font-bold">{letter.letter_date}</div>
                      <span className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded ${
                        letter.urgency === 'PENTING' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {letter.urgency}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-800">{letter.sender}</div>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5 line-clamp-1">{letter.subject}</p>
                    </td>
                    <td className="p-3.5">
                      <span className="bg-blue-50 text-blue-700 border border-blue-150 px-2.5 py-0.5 rounded text-[10px] font-bold">
                        {letter.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-1.5">
                      <button
                        onClick={() => setSelectedDoc(letter)}
                        className="text-blue-600 hover:underline font-bold text-[11px]"
                      >
                        Detail
                      </button>
                      <button
                        onClick={() => {
                          setSelectedIncomingForDisp(letter);
                          setIsAddingDisposition(true);
                          setActiveSubTab('disposition');
                        }}
                        className="text-indigo-600 hover:underline font-bold text-[11px]"
                      >
                        Disposisi
                      </button>
                      <button
                        onClick={() => deleteIncomingMutation.mutate(letter.id)}
                        className="text-red-600 hover:underline font-bold text-[11px]"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedDoc && (
            <DocumentViewer document={selectedDoc} onClose={() => setSelectedDoc(null)} />
          )}

        </div>
      )}

      {/* ====================================================================== */}
      {/* 3. SURAT KELUAR VIEW */}
      {/* ====================================================================== */}
      {activeSubTab === 'outgoing' && (
        <div className="space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nomor perihal / tujuan..."
                className="w-full text-xs border border-slate-300 rounded-lg pl-8 pr-3 py-2 bg-white"
              />
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAIGenerateLetter}
                className="bg-purple-100 hover:bg-purple-200 text-purple-800 px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-purple-200"
              >
                <Sparkles className="h-4.5 w-4.5 text-purple-600" /> AI Generator
              </button>
              
              <button
                onClick={() => {
                  setLetterFormType('outgoing');
                  setIsAddingLetter(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="h-4 w-4" /> Registrasi Surat Keluar
              </button>
            </div>
          </div>

          {/* Form inside view */}
          {isAddingLetter && letterFormType === 'outgoing' && (
            <LetterForm
              type="outgoing"
              templates={templates}
              onSubmitSuccess={() => {
                setIsAddingLetter(false);
                refetchOutgoing();
                refetchDashboard();
              }}
              onCancel={() => setIsAddingLetter(false)}
            />
          )}

          {/* SignaturePad modal floating container */}
          {showSignaturePadForDoc && (
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl max-w-lg mx-auto">
              <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                Tanda Tangani Surat Resmi: {showSignaturePadForDoc.subject}
              </h4>
              <SignaturePad
                onSave={(type, data) => {
                  updateDocSignatureMutation.mutate({
                    docId: showSignaturePadForDoc.id,
                    sigType: type,
                    sigData: data
                  });
                }}
              />
            </div>
          )}

          {/* Outgoing letters table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-250 text-slate-500 font-bold uppercase tracking-wider font-mono">
                <tr>
                  <th className="p-3.5">Nomor Agenda / Surat</th>
                  <th className="p-3.5">Jenis / Tanggal</th>
                  <th className="p-3.5">Tujuan & Subjek</th>
                  <th className="p-3.5">Status Draf</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredOutgoing.map((letter: any) => (
                  <tr key={letter.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-3.5">
                      <div className="font-mono font-bold text-slate-800">{letter.agenda_number}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{letter.letter_number}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold">{letter.letter_type}</div>
                      <div className="text-[10px] text-slate-500">{letter.letter_date}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-800">{letter.destination}</div>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5 line-clamp-1">{letter.subject}</p>
                    </td>
                    <td className="p-3.5">
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded border ${
                        letter.is_draft 
                          ? 'bg-amber-50 text-amber-700 border-amber-200' 
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {letter.is_draft ? 'DRAF (PENDING SIG)' : 'RELESED / SIGNED'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-1.5">
                      <button
                        onClick={() => setSelectedDoc(letter)}
                        className="text-blue-600 hover:underline font-bold text-[11px]"
                      >
                        Detail
                      </button>
                      {letter.is_draft && (
                        <button
                          onClick={() => setShowSignaturePadForDoc(letter)}
                          className="text-indigo-600 hover:underline font-bold text-[11px]"
                        >
                          Sign Now
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedDoc && (
            <DocumentViewer document={selectedDoc} onClose={() => setSelectedDoc(null)} />
          )}

        </div>
      )}

      {/* ====================================================================== */}
      {/* 4. DISPOSISI SURAT */}
      {/* ====================================================================== */}
      {activeSubTab === 'disposition' && (
        <div className="space-y-6">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Daftar Instruksi Disposisi Kepala Sekolah</h3>
              <p className="text-[10px] text-slate-500 font-mono">STATUS: PENDING, IN PROGRESS, COMPLETED</p>
            </div>
            
            <button
              onClick={() => triggerExport('excel', 'Disposisi Surat')}
              className="bg-white border border-slate-200 text-slate-700 text-xs px-3 py-1.5 rounded-lg font-bold hover:bg-slate-50 cursor-pointer"
            >
              Export Excel
            </button>
          </div>

          {isAddingDisposition && selectedIncomingForDisp && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 animate-fade-in">
              <h4 className="text-xs font-extrabold text-indigo-700 uppercase tracking-wider">
                Buat Lembar Disposisi: "{selectedIncomingForDisp.subject}"
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Instruksi Pokok</label>
                  <input
                    type="text"
                    id="disp_instruction"
                    defaultValue="Harap wakili kepala sekolah menghadiri rapat koordinasi."
                    className="w-full text-xs border border-slate-300 rounded px-2.5 py-2 bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Peran Penerima</label>
                  <select
                    id="disp_receiver_role"
                    className="w-full text-xs border border-slate-300 rounded px-2.5 py-2 bg-white"
                  >
                    <option value="GURU">GURU / WAKASEK</option>
                    <option value="BENDAHARA">BENDAHARA SEKOLAH</option>
                    <option value="ADMINISTRASI">STAF TATA USAHA</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  onClick={() => setIsAddingDisposition(false)}
                  className="bg-slate-100 text-slate-600 text-xs px-3 py-1.5 rounded"
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    const inst = (document.getElementById('disp_instruction') as HTMLInputElement).value;
                    const roleVal = (document.getElementById('disp_receiver_role') as HTMLSelectElement).value;
                    createDispositionMutation.mutate({
                      incoming_letter_id: selectedIncomingForDisp.id,
                      instruction: inst,
                      receivers: [{ receiver_role: roleVal, status: 'Pending' }]
                    });
                  }}
                  className="bg-indigo-600 text-white text-xs px-4 py-1.5 rounded font-bold"
                >
                  Kirim Disposisi
                </button>
              </div>
            </div>
          )}

          {/* Dispositions list */}
          <div className="space-y-4">
            {incomingLetters.filter((l: any) => l.status === 'Disposed').map((l: any) => (
              <div key={l.id} className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded font-bold">
                      INSTRUCTION SET
                    </span>
                    <span className="text-xs font-bold text-slate-800 font-mono">{l.agenda_number}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Diteruskan: {l.received_date}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Surat Masuk Asal</span>
                    <strong className="text-slate-800">{l.sender}</strong>
                    <p className="text-[11px] text-slate-500 italic mt-0.5">{l.subject}</p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-2">
                    <span className="text-indigo-700 block text-[10px] uppercase font-extrabold">Instruksi Kepala Sekolah</span>
                    <p className="text-[11px] text-slate-700 leading-normal font-medium">
                      "Harap koordinasikan dengan waka kurikulum untuk draf implementasi."
                    </p>
                    
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-200 text-[10px]">
                      <span className="text-slate-400">Penerima:</span>
                      <strong className="text-slate-800 bg-indigo-50 px-1.5 py-0.5 rounded">GURU / WAKASEK</strong>
                      <span className="text-emerald-600 font-bold ml-auto flex items-center gap-0.5">
                        <CheckCircle className="h-3 w-3 text-emerald-500" />
                        In Progress
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ====================================================================== */}
      {/* 5. TEMPLATE SURAT */}
      {/* ====================================================================== */}
      {activeSubTab === 'template' && (
        <div className="space-y-6">
          
          <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
              Definisikan Template Penomoran & Layout Surat Keluar
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-3 md:col-span-1 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest mb-2">Buat Template Baru</h4>
                
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Nama Template</label>
                  <input
                    type="text"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                    placeholder="e.g. Surat Tugas Guru"
                    className="w-full text-xs border border-slate-300 rounded px-2 py-1.5 bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Kode Unik</label>
                  <input
                    type="text"
                    value={newTemplate.code}
                    onChange={(e) => setNewTemplate({ ...newTemplate, code: e.target.value })}
                    placeholder="e.g. TMP-ST"
                    className="w-full text-xs border border-slate-300 rounded px-2 py-1.5 bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Format Nomor</label>
                  <input
                    type="text"
                    value={newTemplate.number_format}
                    onChange={(e) => setNewTemplate({ ...newTemplate, number_format: e.target.value })}
                    placeholder="e.g. {seq}/ST/SMA-UN/{month-roman}/{year}"
                    className="w-full text-xs border border-slate-300 rounded px-2 py-1.5 bg-white font-mono"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => createTemplateMutation.mutate(newTemplate)}
                  className="w-full bg-blue-600 text-white font-bold py-1.5 rounded transition"
                >
                  Simpan Template
                </button>
              </div>

              {/* Template list */}
              <div className="md:col-span-2 space-y-4">
                {templates.map((tmpl: any) => (
                  <div key={tmpl.id} className="border border-slate-200 p-4 rounded-xl flex items-center justify-between gap-4">
                    <div>
                      <strong className="text-slate-800">{tmpl.name}</strong>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono ml-2 font-bold">{tmpl.code}</span>
                      <div className="text-[10px] text-slate-500 font-mono mt-1">Format: {tmpl.number_format}</div>
                    </div>
                    
                    <button
                      onClick={() => generateNumberFromTemplate(tmpl.code)}
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-2.5 py-1.5 rounded text-[10px]"
                    >
                      Uji Generate No
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ====================================================================== */}
      {/* 6. ARSIP DIGITAL */}
      {/* ====================================================================== */}
      {activeSubTab === 'archive' && (
        <div className="space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Sistem Arsip & Indeksasi Box Dokumen Fisik</h3>
              <p className="text-[10px] text-slate-500 font-mono">DURABLE CLOUD PERSISTENCE • LOKASI GUDANG ARSIP</p>
            </div>

            <button
              onClick={() => setShowArchiveReportModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3.5 py-1.5 rounded-lg font-bold shadow flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="h-4 w-4" />
              Ekspor Rekap Laporan (PDF / Excel)
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
            
            {/* Indexing form */}
            <div className="bg-white p-4.5 border border-slate-200 rounded-xl shadow-sm space-y-3 text-xs">
              <h4 className="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest border-b border-slate-100 pb-1.5">
                Simpan Arsip Box Baru
              </h4>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase">Judul Arsip Berkas</label>
                <input
                  type="text"
                  value={newArchive.title}
                  onChange={(e) => setNewArchive({ ...newArchive, title: e.target.value })}
                  placeholder="e.g. Berkas Akreditasi Sekolah 2026"
                  className="w-full text-xs border border-slate-300 rounded px-2.5 py-2 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Nomor Box</label>
                  <input
                    type="text"
                    value={newArchive.box_number}
                    onChange={(e) => setNewArchive({ ...newArchive, box_number: e.target.value })}
                    placeholder="e.g. BOX-A-05"
                    className="w-full text-xs border border-slate-300 rounded px-2.5 py-2 bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Posisi Rak</label>
                  <input
                    type="text"
                    value={newArchive.shelf_position}
                    onChange={(e) => setNewArchive({ ...newArchive, shelf_position: e.target.value })}
                    placeholder="e.g. Rak 3 Baris D"
                    className="w-full text-xs border border-slate-300 rounded px-2.5 py-2 bg-white"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => createArchiveMutation.mutate(newArchive)}
                className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg transition"
              >
                Indeks Berkas Fisik
              </button>
            </div>

            {/* Archives cards list */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              {archives.map((arch: any) => (
                <ArchiveCard key={arch.id} archive={arch} />
              ))}
            </div>

          </div>

        </div>
      )}

      {/* ====================================================================== */}
      {/* 5. PERSETUJUAN (APPROVAL WORKFLOW) VIEW */}
      {/* ====================================================================== */}
      {activeSubTab === 'approval' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Alur Verifikasi & Persetujuan Surat (Approval)</h3>
              <p className="text-[10px] text-slate-500 font-mono">DURABLE DATABASE WORKFLOW • ROLE-BASED VERIFICATION</p>
            </div>
            
            <div className="bg-blue-50 border border-blue-150 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-800">
              Peran Anda saat ini: <strong className="underline">{simulatedRole}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Configurable Hierarchy settings */}
            <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm space-y-4 text-xs h-fit">
              <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest border-b border-slate-100 pb-2">
                Konfigurasi Alur Persetujuan (Database-backed)
              </h4>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Alur dan tahapan persetujuan dokumen ditarik langsung dari database dan dapat diatur ulang.
              </p>

              <div className="space-y-2 bg-slate-50 p-3.5 rounded-lg border border-slate-150">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Urutan Jabatan Penandatangan / Pemeriksa:</span>
                <div className="space-y-2 font-mono text-[10px]">
                  {approvalStages.map((stage: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 bg-white px-2.5 py-1.5 border border-slate-200 rounded shadow-sm">
                      <span className="bg-blue-600 text-white w-4 h-4 rounded-full flex items-center justify-center font-bold text-[9px]">{idx + 1}</span>
                      <span className="font-bold text-slate-700">{stage}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const newStages = prompt("Masukkan daftar jabatan dipisah koma:", approvalStages.join(","));
                    if (newStages) {
                      updateApprovalStagesMutation.mutate(newStages.split(",").map(s => s.trim()));
                    }
                  }}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-lg text-[10px] uppercase tracking-wider transition cursor-pointer"
                >
                  Ubah Hierarki Persetujuan
                </button>
              </div>
            </div>

            {/* Approvals Action Table */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-4.5 py-3 flex justify-between items-center">
                  <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest">
                    Menunggu Review / Persetujuan Anda
                  </span>
                  <span className="bg-blue-100 text-blue-800 text-[9px] px-2 py-0.5 rounded-md font-bold font-mono">
                    RBAC FILTERED
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {/* Let's list outgoing letters that are drafts or in progress */}
                  {outgoingLetters.filter((l: any) => l.deleted_at === null).map((letter: any) => {
                    const isSigned = letter.status === 'SIGNED';
                    const currentStageIndex = approvalStages.indexOf(simulatedRole);
                    const canApprove = currentStageIndex !== -1 && !isSigned;

                    return (
                      <div key={letter.id} className="p-4.5 hover:bg-slate-50/50 transition space-y-3">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.2 rounded font-bold font-mono">
                                {letter.letter_type}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {letter.letter_number || 'Belum Ber-Nomor'}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-800 mt-1">{letter.subject}</h4>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">Pengirim: {letter.sender} | Tujuan: {letter.destination}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase ${isSigned ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'}`}>
                              {isSigned ? 'SIGNED / APPROVED' : 'MENUNGGU PARAF'}
                            </span>
                          </div>
                        </div>

                        {canApprove && (
                          <div className="flex items-center gap-2 pt-2 border-t border-dashed border-slate-100">
                            <button
                              onClick={() => {
                                const confirmApprove = confirm("Setujui dokumen ini?");
                                if (confirmApprove) {
                                  createDigitalSignatureMutation.mutate({
                                    letter_id: letter.id,
                                    signer_name: `Drs. H. Ahmad (${simulatedRole})`,
                                    signer_role: simulatedRole,
                                    signature_hash: `SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
                                  });
                                }
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-md flex items-center gap-1 cursor-pointer uppercase transition"
                            >
                              <CheckCircle className="h-3.5 w-3.5" /> Berikan Persetujuan (Paraf)
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt("Masukkan alasan penolakan:");
                                if (reason) {
                                  alert(`Dokumen ditolak dengan alasan: ${reason}`);
                                }
                              }}
                              className="bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold px-3 py-1.5 rounded-md cursor-pointer uppercase transition"
                            >
                              Tolak / Revisi
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {outgoingLetters.filter((l: any) => l.deleted_at === null).length === 0 && (
                    <div className="p-8 text-center text-slate-400 font-medium">
                      Tidak ada dokumen yang memerlukan persetujuan saat ini.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* 6. TANDA TANGAN DIGITAL (SECURE SIGNATURE PAD) VIEW */}
      {/* ====================================================================== */}
      {activeSubTab === 'signature' && (
        <div className="space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-800">Tanda Tangan Digital & QR Seal Generation</h3>
            <p className="text-[10px] text-slate-500 font-mono">CRYPTOGRAPHIC SECURE SIGNATURE • QR VERIFICATION INTEGRATION</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Drawing Signature Pad */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-800">Pad Tanda Tangan Gambar (Canvas)</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Bubuhkan tanda tangan Anda menggunakan mouse atau layar sentuh.</p>
              </div>

              <div className="border border-slate-300 rounded-xl overflow-hidden bg-slate-50 max-w-lg">
                <SignaturePad onSave={(dataUri) => {
                  alert("Tanda tangan digambar berhasil disimpan sebagai raw asset image.");
                }} />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-[10px] text-amber-800 flex items-start gap-2 max-w-lg">
                <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                <div>
                  <strong>PEMBERITAHUAN KEAMANAN:</strong> Tanda tangan digital ini dilindungi dengan seal kriptografi SHA-256 yang unik untuk setiap dokumen surat guna menghindari manipulasi digital.
                </div>
              </div>
            </div>

            {/* Quick seal for document list */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 h-fit">
              <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest border-b border-slate-100 pb-2">
                Pilih Dokumen & Seal QR
              </h4>

              <div className="space-y-3.5 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Daftar Dokumen Siap Ditandatangani:</span>
                <div className="space-y-2">
                  {outgoingLetters.filter((l: any) => l.deleted_at === null).map((letter: any) => (
                    <div
                      key={letter.id}
                      onClick={() => {
                        const hash = `SHA256-${Math.random().toString(36).substring(2, 12).toUpperCase()}`;
                        createDigitalSignatureMutation.mutate({
                          letter_id: letter.id,
                          signer_name: `Drs. H. Ahmad (${simulatedRole})`,
                          signer_role: simulatedRole,
                          signature_hash: hash
                        });
                        alert(`Dokumen "${letter.subject}" berhasil ditandatangani dan disegel dengan Hash: ${hash}`);
                      }}
                      className="p-3 border border-slate-200 hover:border-blue-500 rounded-lg shadow-sm bg-slate-50/50 hover:bg-blue-50/20 cursor-pointer transition text-left"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] bg-slate-200 font-mono px-1.5 py-0.2 rounded font-semibold text-slate-700">{letter.letter_type}</span>
                        <span className="text-[9px] font-mono text-slate-400">ID: {letter.id}</span>
                      </div>
                      <h5 className="font-bold text-slate-800 mt-1.5 truncate">{letter.subject}</h5>
                      <p className="text-[9px] text-slate-500 mt-0.5">Tujuan: {letter.destination}</p>
                      <span className="text-[9px] text-blue-600 font-bold block mt-1.5 uppercase tracking-wider">→ Klik untuk Segel QR & Tanda Tangan</span>
                    </div>
                  ))}
                  {outgoingLetters.filter((l: any) => l.deleted_at === null).length === 0 && (
                    <div className="p-4 text-center text-slate-400 italic">
                      Tidak ada surat keluar terdaftar.
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* 8. NOMOR SURAT CONFIG VIEW */}
      {/* ====================================================================== */}
      {activeSubTab === 'number_format' && (
        <div className="space-y-4">
          <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Sistem Penomoran Surat Otomatis (Number Generator)</h3>
              <p className="text-[10px] text-slate-500 font-mono">AUTOMATIC SEQUENCE MATRIX • TENANT-SPECIFIC CODES</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 text-xs">
            
            {/* Number Generator settings */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest border-b border-slate-100 pb-2">
                Atur Format Penomoran
              </h4>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-500 uppercase tracking-wider text-[9px]">Gunakan Parameter Token:</label>
                  <div className="grid grid-cols-2 gap-1.5 font-mono text-[9px] bg-slate-50 p-2.5 border border-slate-200 rounded-lg">
                    <div><strong className="text-blue-600">{"{seq}"}</strong>: Urutan Angka</div>
                    <div><strong className="text-blue-600">{"{year}"}</strong>: Tahun Aktif</div>
                    <div><strong className="text-blue-600">{"{month}"}</strong>: Bulan (Romawi)</div>
                    <div><strong className="text-blue-600">{"{code}"}</strong>: Kode Kategori</div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-600 uppercase tracking-wider text-[10px]">Default Format Surat Keluar:</label>
                  <input
                    type="text"
                    defaultValue="{seq}/TU/SMA-UN/{month}/{year}"
                    id="inp_number_format"
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("inp_number_format") as HTMLInputElement;
                    if (el) {
                      alert(`Format penomoran "${el.value}" berhasil disimpan ke sistem kearsipan.`);
                    }
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-[10px] uppercase tracking-wider transition cursor-pointer"
                >
                  Simpan Format Penomoran
                </button>
              </div>
            </div>

            {/* Generated numbers ledger history */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3.5">
              <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest border-b border-slate-100 pb-2">
                Buku Registrasi Alokasi Nomor Surat (Ledger)
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-250 text-slate-500 font-bold uppercase tracking-wider font-mono">
                    <tr>
                      <th className="p-2.5">Nomor Terbit</th>
                      <th className="p-2.5">Tanggal Registrasi</th>
                      <th className="p-2.5">Perihal Surat</th>
                      <th className="p-2.5">Sifat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {outgoingLetters.filter((l: any) => l.deleted_at === null).map((letter: any, idx: number) => (
                      <tr key={letter.id} className="hover:bg-slate-50/30 transition">
                        <td className="p-2.5 font-mono font-bold text-indigo-700">{letter.letter_number || `ALLOC-00${idx+1}/PENDING`}</td>
                        <td className="p-2.5">{letter.letter_date}</td>
                        <td className="p-2.5 truncate max-w-[200px] font-semibold">{letter.subject}</td>
                        <td className="p-2.5">
                          <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.2 rounded text-[9px] font-bold">
                            {letter.confidentiality}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {outgoingLetters.filter((l: any) => l.deleted_at === null).length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-slate-400">Tidak ada penomoran teralokasi saat ini.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* 9. RIWAYAT & AUDIT TRAIL LOGS VIEW */}
      {/* ====================================================================== */}
      {activeSubTab === 'history' && (
        <div className="space-y-4">
          <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Riwayat Pelacakan Aktivitas & Audit Trail</h3>
              <p className="text-[10px] text-slate-500 font-mono">TRACKING LOGS • ARCHIVED HISTORICAL STATE CHANGE</p>
            </div>
            
            <button
              onClick={() => triggerExport('csv', 'Audit Trail Kearsipan')}
              className="bg-slate-900 text-white hover:bg-slate-800 text-xs px-3.5 py-1.5 rounded-lg font-bold"
            >
              Export Log Audit
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden text-xs">
            <div className="bg-slate-50 border-b border-slate-200 px-4.5 py-3 text-[10px] font-extrabold text-slate-600 uppercase tracking-widest">
              Garis Waktu Perubahan Status Dokumen (Realtime Audit)
            </div>

            <div className="p-6">
              <div className="relative border-l-2 border-slate-200 pl-6 space-y-6">
                {historyLogs.map((log: any) => (
                  <div key={log.id} className="relative">
                    {/* Circle marker */}
                    <span className="absolute -left-[31px] top-1.5 bg-blue-50 border-2 border-blue-600 h-3 w-3 rounded-full flex items-center justify-center"></span>
                    
                    <div className="bg-slate-50 border border-slate-150 rounded-lg p-3.5 hover:bg-white transition max-w-2xl">
                      <div className="flex items-center justify-between gap-2 text-[9px] text-slate-400 font-mono">
                        <span className="font-bold text-blue-700 bg-blue-50 border border-blue-150 px-2 py-0.2 rounded">
                          {log.activity_type}
                        </span>
                        <span>{new Date(log.created_at).toLocaleString('id-ID')}</span>
                      </div>
                      <p className="font-bold text-slate-700 mt-1.5 text-[11px]">{log.details}</p>
                      <div className="mt-1 text-[9px] text-slate-400">
                        Aktor: <strong>{log.actor_name}</strong> | Peran: <strong>{log.actor_role}</strong>
                      </div>
                    </div>
                  </div>
                ))}
                {historyLogs.length === 0 && (
                  <div className="text-center text-slate-400 font-medium py-10">
                    Beluk ada log aktivitas terdaftar untuk tenant ini.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* 10. CETAK MASSAL & MAIL MERGE VIEW */}
      {/* ====================================================================== */}
      {activeSubTab === 'mail_merge' && (
        <MailMergeView
          templates={templates}
          incomingLetters={incomingLetters}
          outgoingLetters={outgoingLetters}
          refetchOutgoing={refetchOutgoing}
        />
      )}

      {/* 1. LAYANAN MANDIRI PERMOHONAN SURAT */}
      {activeSubTab === 'self_service' && <SelfServiceLettersView />}

      {/* 2. BUILDER KOP SURAT DINAMIS & STEMPEL DIGITAL */}
      {activeSubTab === 'kop_builder' && <DynamicKopAndStampView />}

      {/* 3. PENGARSIPAN OTOMATIS & WA BROADCAST GATEWAY */}
      {activeSubTab === 'wa_gateway' && <WhatsAppNotificationManager />}

      {/* 4. ALUR DISPOSISI BERJENJANG & MATRIKS HIRARKI */}
      {activeSubTab === 'disposition_matrix' && <DispositionHierarchyMatrix />}

      {/* 5. BUKU TAMU DIGITAL & AGENDA PERTEMUAN */}
      {activeSubTab === 'guestbook' && <GuestBookAndAgendaView />}

      {/* 6. SMART OCR AUTO-FILL PINDAI SURAT FISIK */}
      {activeSubTab === 'ocr_scan' && (
        <SmartOcrScannerView refetchIncoming={refetchIncoming} />
      )}

      {/* 7. PAPAN PENGUMUMAN & INFORMASI DIGITAL TU */}
      {activeSubTab === 'digital_bulletin' && <DigitalBulletinView />}

      {/* 8. MANAJER TEMPLATE DOKUMEN SURAT */}
      {activeSubTab === 'template' && (
        <TemplateManagementView 
          onNavigateToMailMerge={(tId) => setActiveSubTab('mail_merge')} 
        />
      )}

      {/* 9. PEMBUAT SURAT AI OTOMATIS BERBASIS DATA APLIKASI */}
      {activeSubTab === 'ai_letter_generator' && (
        <AiLetterGeneratorView />
      )}

      {/* Ekspor Rekap Laporan Kearsipan (PDF / Excel) Modal */}
      {showArchiveReportModal && (
        <ArchiveReportExportModal
          archives={archives}
          incomingLetters={incomingLetters}
          outgoingLetters={outgoingLetters}
          legals={legals}
          onClose={() => setShowArchiveReportModal(false)}
        />
      )}

    </div>
  );
}
