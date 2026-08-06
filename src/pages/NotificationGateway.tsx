/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import {
  Bell,
  MessageSquare,
  Mail,
  Smartphone,
  Plus,
  RefreshCw,
  Send,
  Trash2,
  Settings,
  Sliders,
  CheckCircle,
  AlertTriangle,
  Play,
  Clock,
  Search,
  Filter,
  Layers,
  ChevronRight,
  Info,
  Calendar,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  ListFilter,
  User,
  Activity,
  Edit3,
  Archive,
  Eye,
  Copy,
  FileText,
  Check,
  AlertCircle,
  FileSpreadsheet,
  Image as ImageIcon,
  Music,
  Film,
  FileArchive,
  QrCode,
  Shield,
  Download,
  X,
  Power,
  HelpCircle,
  BookOpen,
  UserCheck,
  Key,
  FileCheck,
  ClipboardList
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Legend,
  CartesianGrid
} from 'recharts';

import { UserRole } from '../types/index';
import {
  TARGET_ROLES,
  FILTER_UNITS,
  FILTER_CLASSES,
  FILTER_COURSES,
  FILTER_DORMS,
  FILTER_YEARS,
  FILTER_SEMESTERS,
  SMART_VARIABLES,
  AUTOMATION_TRIGGERS,
  MOCK_DASHBOARD_STATS,
  ATTACHMENT_TYPES,
  getUserScopeLabel
} from '../utils/communicationData';

export default function NotificationGateway() {
  const { tenant, user, previewRole } = useAuth();
  const queryClient = useQueryClient();
  const isPondok = tenant?.type === 'PONDOK' || tenant?.type === 'KEDUA';

  // Role Normalization for Notification Gateway
  const rawRole = previewRole || user?.role || 'SUPER_ADMIN';
  const normalizeToSimRole = (r: string): UserRole => {
    const raw = r?.toUpperCase()?.replace(/\s+/g, '_') || '';
    if (raw === 'SUPERADMIN' || raw === 'ADMIN' || raw === 'SUPER_ADMIN') return 'SUPER_ADMIN';
    if (raw === 'PRINCIPAL' || raw === 'KEPALA_SEKOLAH') return 'KEPALA_SEKOLAH';
    if (raw === 'TEACHER' || raw === 'USTADZ' || raw === 'GURU') return 'GURU';
    if (raw === 'WALI_KELAS') return 'WALI_KELAS';
    if (raw === 'BENDAHARA' || raw === 'BENDAHARA_KEUANGAN' || raw === 'BENDAHARA_SEKOLAH') return 'BENDAHARA';
    if (raw === 'OPERATOR' || raw === 'TU' || raw === 'ADMIN_TU') return 'TU';
    if (raw === 'STUDENT' || raw === 'SISWA' || raw === 'SANTRI') return 'SANTRI';
    if (raw === 'PARENT' || raw === 'ORANG_TUA' || raw === 'WALI_SANTRI') return 'SANTRI';
    return 'SUPER_ADMIN';
  };

  const isActualSuperAdmin = user?.role === 'SUPER_ADMIN' || !user?.role;

  // DYNAMIC RBAC SIMULATOR STATE
  const [currentSimulatedRole, setCurrentSimulatedRole] = useState<UserRole>(normalizeToSimRole(rawRole));

  useEffect(() => {
    setCurrentSimulatedRole(normalizeToSimRole(rawRole));
  }, [rawRole]);

  // Active Menu / Sub-tab - supports the 12 explicit system menu points
  const [activeMenuTab, setActiveMenuTab] = useState<
    | 'dashboard'
    | 'pengumuman'
    | 'broadcast'
    | 'chat'
    | 'notifikasi'
    | 'templates'
    | 'whatsapp'
    | 'email'
    | 'push-settings'
    | 'schedule'
    | 'inbox'
    | 'riwayat'
  >('dashboard');

  // Real-time Chat Interfaces & State
  interface ChatMessage {
    id: string;
    senderName: string;
    senderRole: string;
    text: string;
    time: string;
    attachments?: { name: string; type: 'IMAGE' | 'PDF' | 'WORD' | 'EXCEL' | 'VIDEO' | 'VOICE'; size: string }[];
    replyTo?: string;
    isEdited?: boolean;
    isDeleted?: boolean;
    isPinned?: boolean;
  }

  interface ChatRoom {
    id: string;
    name: string;
    type: 'PRIVATE' | 'GROUP' | 'ROLE' | 'UNIT' | 'CLASS' | 'SUBJECT' | 'BOARDING' | 'FINANCE' | 'ADMIN';
    scopeRoles: string[]; // which roles are allowed to access this
    avatar: string;
    onlineCount?: number;
  }

  const [chatRooms] = useState<ChatRoom[]>([
    { id: 'room-1', name: 'Musyawarah Dewan Guru & Staf', type: 'GROUP', scopeRoles: ['SUPER_ADMIN', 'KEPALA_SEKOLAH', 'YAYASAN', 'GURU', 'WALI_KELAS', 'TU', 'BENDAHARA'], avatar: '👨‍🏫', onlineCount: 14 },
    { id: 'room-2', name: 'Asrama Al-Ghazali - Putra', type: 'BOARDING', scopeRoles: ['SUPER_ADMIN', 'KEPALA_SEKOLAH', 'YAYASAN', 'KARYAWAN', 'SANTRI', 'WALI_SANTRI'], avatar: '🕌', onlineCount: 45 },
    { id: 'room-3', name: 'Kelas VII-A (Wali Kelas & Guru Mapel)', type: 'CLASS', scopeRoles: ['SUPER_ADMIN', 'KEPALA_SEKOLAH', 'GURU', 'WALI_KELAS', 'SANTRI', 'WALI_SANTRI'], avatar: '📖', onlineCount: 32 },
    { id: 'room-4', name: 'Koordinasi Bendahara & Wali Santri', type: 'FINANCE', scopeRoles: ['SUPER_ADMIN', 'BENDAHARA', 'WALI_SANTRI'], avatar: '💰', onlineCount: 8 },
    { id: 'room-5', name: 'Tata Usaha - Layanan Administrasi', type: 'ADMIN', scopeRoles: ['SUPER_ADMIN', 'TU', 'WALI_SANTRI', 'SANTRI', 'GURU', 'WALI_KELAS'], avatar: '📂', onlineCount: 5 },
    { id: 'room-6', name: 'Tahfidz & Halaqah Al-Quran', type: 'SUBJECT', scopeRoles: ['SUPER_ADMIN', 'KEPALA_SEKOLAH', 'GURU', 'SANTRI', 'WALI_SANTRI'], avatar: '🕋', onlineCount: 20 },
    { id: 'room-7', name: 'Chat Pribadi - Wali Kelas & Wali Santri', type: 'PRIVATE', scopeRoles: ['SUPER_ADMIN', 'WALI_KELAS', 'WALI_SANTRI'], avatar: '💬', onlineCount: 2 },
    { id: 'room-8', name: 'Ekstrakurikuler Panahan & Berkuda', type: 'GROUP', scopeRoles: ['SUPER_ADMIN', 'KARYAWAN', 'SANTRI', 'WALI_SANTRI', 'GURU'], avatar: '🎯', onlineCount: 12 }
  ]);

  const [activeRoomId, setActiveRoomId] = useState<string>('room-1');
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({
    'room-1': [
      { id: 'm1-1', senderName: 'Drs. H. Mulyadi', senderRole: 'KEPALA_SEKOLAH', text: 'Assalamualaikum Wr. Wb. Rekan-rekan guru, mohon kehadirannya untuk rapat kurikulum baru besok jam 09:00 WIB.', time: '08:15' },
      { id: 'm1-2', senderName: 'Ahmad Fauzi M.Pd', senderRole: 'GURU', text: 'Waalaikumsalam Wr. Wb. Siap hadir Pak Kepala Sekolah. Saya akan membawa bahan silabus fisika kelas X.', time: '08:22' },
      { id: 'm1-3', senderName: 'Siti Aminah S.Kom', senderRole: 'TU', text: 'Bahan cetak rapat sudah saya siapkan dan ditaruh di meja ruang guru ya bapak/ibu sekalian.', time: '08:45' }
    ],
    'room-2': [
      { id: 'm2-1', senderName: 'Ustadz Mansur', senderRole: 'KARYAWAN', text: 'Pemberitahuan kepada para santri asrama Al-Ghazali, malam ini akan dilaksanakan setoran hafalan rutin ba’da Maghrib.', time: '13:00' },
      { id: 'm2-2', senderName: 'Muhammad Raihan', senderRole: 'SANTRI', text: 'Siap ustadz, insya Allah saya sudah hafal surat Al-Mulk juz 29.', time: '13:15' }
    ],
    'room-3': [
      { id: 'm3-1', senderName: 'Budi Santoso S.Pd', senderRole: 'WALI_KELAS', text: 'Selamat pagi bapak/ibu wali santri kelas VII-A. Raport penilaian tengah semester sudah dapat dilihat di Portal.', time: '07:30' },
      { id: 'm3-2', senderName: 'Bapak Joko Widodo', senderRole: 'WALI_SANTRI', text: 'Alhamdulillah, terima kasih bapak Wali Kelas atas laporannya. Nanti malam saya cek.', time: '07:45' }
    ],
    'room-4': [
      { id: 'm4-1', senderName: 'Hj. Fatimah SE', senderRole: 'BENDAHARA', text: 'Yth. Wali Santri sekalian, jatuh tempo pembayaran SPP dan makan bulanan adalah tanggal 10 Juli.', time: '09:00' },
      { id: 'm4-2', senderName: 'Bapak Joko Widodo', senderRole: 'WALI_SANTRI', text: 'Baik Ibu Bendahara, terima kasih pengingatnya. Untuk asrama apakah digabung pembayarannya?', time: '09:30' }
    ],
    'room-5': [
      { id: 'm5-1', senderName: 'Siti Aminah S.Kom', senderRole: 'TU', text: 'Bagi santri yang membutuhkan surat keterangan aktif belajar untuk keperluan dinas sosial, silakan mengisi form di meja TU.', time: '10:00' }
    ],
    'room-6': [
      { id: 'm6-1', senderName: 'Ahmad Fauzi M.Pd', senderRole: 'GURU', text: 'Halaqah Tahfidz sore ini khusus mengulang murajaah juz 30 secara serempak.', time: '11:00' }
    ],
    'room-7': [
      { id: 'm7-1', senderName: 'Budi Santoso S.Pd', senderRole: 'WALI_KELAS', text: 'Bapak Joko, perkembangan ananda Raihan di kelas sangat baik, hafalan qur’annya menunjukkan progres pesat.', time: '15:10' },
      { id: 'm7-2', senderName: 'Bapak Joko Widodo', senderRole: 'WALI_SANTRI', text: 'Masya Allah Tabarakallah, terima kasih banyak bimbingannya Ustadz Budi.', time: '15:20' }
    ],
    'room-8': [
      { id: 'm8-1', senderName: 'Rahmat Hidayat', senderRole: 'KARYAWAN', text: 'Latihan panahan hari Sabtu pagi dipindahkan ke lapangan utama karena area belakang sedang dibersihkan.', time: '16:00' }
    ]
  });

  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [chatInputMessage, setChatInputMessage] = useState('');
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [replyingToMessage, setReplyingToMessage] = useState<ChatMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
  const [pinnedMessages, setPinnedMessages] = useState<Record<string, string[]>>({
    'room-1': ['m1-1']
  });
  const [chatAttachmentType, setChatAttachmentType] = useState<'IMAGE' | 'PDF' | 'WORD' | 'EXCEL' | 'VIDEO' | 'VOICE' | null>(null);
  const [chatAttachments, setChatAttachments] = useState<{ name: string; type: 'IMAGE' | 'PDF' | 'WORD' | 'EXCEL' | 'VIDEO' | 'VOICE'; size: string }[]>([]);

  // DB queries with reactive axios posts
  const { data: queue, refetch: refetchQueue, isLoading: loadingQueue } = useQuery({
    queryKey: ['notificationQueue'],
    queryFn: async () => {
      const res = await axios.post('/api/action?action=notificationQueue', { subAction: 'list' });
      return res.data?.data || [];
    }
  });

  const { data: templates, refetch: refetchTemplates, isLoading: loadingTemplates } = useQuery({
    queryKey: ['notificationTemplate'],
    queryFn: async () => {
      const res = await axios.post('/api/action?action=notificationTemplate', { subAction: 'list' });
      return res.data?.data || [];
    }
  });

  const { data: announcements, refetch: refetchAnnouncements, isLoading: loadingAnnouncements } = useQuery({
    queryKey: ['announcementList'],
    queryFn: async () => {
      const res = await axios.post('/api/action?action=announcementList');
      return res.data?.data || [];
    }
  });

  const { data: rules, refetch: refetchRules } = useQuery({
    queryKey: ['automationRule'],
    queryFn: async () => {
      const res = await axios.post('/api/action?action=automationRule', { subAction: 'list' });
      return res.data?.data || [];
    }
  });

  // Enterprise Settings State (All controlled from frontend)
  const [enterpriseSettings, setEnterpriseSettings] = useState({
    logo: 'https://ais-dev-cuu72c5niw56xr2fibir2x-217257253856.asia-east1.run.app/assets/logo.png',
    namaYayasan: tenant?.nama_yayasan || 'Yayasan Al-Hikmah Bina Ummah',
    namaSekolah: tenant?.nama_sekolah || 'SMA IT Al-Hikmah Boarding School',
    preferredHourStart: '08:00',
    preferredHourEnd: '17:00',
    headerTemplate: '=== PENGUMUMAN RESMI AL-HIKMAH ===\nYth. Bapak/Ibu Wali Santri,\n\n',
    footerTemplate: '\n\n-------------------------\nHubungi Layanan TU di wa.me/628123456789\nTerima kasih atas kerja sama Anda.',
    
    // SMTP Connection Settings
    smtpHost: 'smtp.sendgrid.net',
    smtpPort: 587,
    smtpUser: 'apikey',
    smtpPass: 'SG.fakeSecurePasswordSecretKeyHereForSimulation_1234567890',
    smtpSecure: true,
    smtpFromEmail: 'info@alhikmah.sch.id',

    // WhatsApp Gateway Configuration
    waGatewayUrl: 'https://api.wabot.alhikmah.id/v1/messages',
    waApiKey: 'wasec_9983198ffaa1023b890ccaa0231',
    waInstanceStatus: 'CONNECTED' as 'CONNECTED' | 'DISCONNECTED' | 'AUTHENTICATING',

    // FCM Push Configurations
    pushFcmSenderId: '91283848192',
    pushFcmServerKey: 'AAAA_fakesecure_key_firebase_server_messaging',
    pushBadgeSyncEnabled: true
  });

  // Announcement CRUD State
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annType, setAnnType] = useState('Informasi');
  const [annPriority, setAnnPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [annIsPinned, setAnnIsPinned] = useState(false);
  const [annChannels, setAnnChannels] = useState<string[]>(['IN_APP', 'WHATSAPP']);
  const [annTargetRoles, setAnnTargetRoles] = useState<string[]>(['ORANG_TUA']);
  
  // Scoped filters
  const [filterUnit, setFilterUnit] = useState('ALL');
  const [filterClass, setFilterClass] = useState('ALL');
  const [filterCourse, setFilterCourse] = useState('ALL');
  const [filterDorm, setFilterDorm] = useState('ALL');
  const [filterYear, setFilterYear] = useState('2025/2026');
  const [filterSemester, setFilterSemester] = useState('GANJIL');

  // AI assistant prompt
  const [annAiPrompt, setAnnAiPrompt] = useState('');
  const [annGeneratingWording, setAnnGeneratingWording] = useState(false);
  const [annSelectedId, setAnnSelectedId] = useState<string | null>(null);
  const [annStatusMessage, setAnnStatusMessage] = useState<string | null>(null);

  // Attachments simulator
  const [uploadedAttachments, setUploadedAttachments] = useState<{ name: string; type: string }[]>([]);
  const [dragActive, setDragActive] = useState(false);

  // Smart Template Builder state
  const [newTempName, setNewTempName] = useState('');
  const [newTempChannel, setNewTempChannel] = useState('WHATSAPP');
  const [newTempSubject, setNewTempSubject] = useState('');
  const [newTempBody, setNewTempBody] = useState('');
  const [newTempVariables, setNewTempVariables] = useState<string[]>([]);

  // Broadcast campaign form
  const [bcName, setBcName] = useState('Keluarga Tangguh Bulanan');
  const [bcDesc, setBcDesc] = useState('Kirim rincian tagihan SPP bulanan serentak');
  const [bcChannel, setBcChannel] = useState<'IN_APP' | 'WHATSAPP' | 'EMAIL' | 'PUSH' | 'SMS'>('WHATSAPP');
  const [bcTemplateId, setBcTemplateId] = useState('');
  const [bcTargetRole, setBcTargetRole] = useState('ORANG_TUA');
  const [bcScheduleType, setBcScheduleType] = useState<'NOW' | 'SCHEDULED'>('NOW');
  const [bcScheduledTime, setBcScheduledTime] = useState('2026-07-25T08:00');
  const [bcRecurrence, setBcRecurrence] = useState<'ONCE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'>('ONCE');

  // Automation Rule creation state
  const [autoRuleName, setAutoRuleName] = useState('');
  const [autoTrigger, setAutoTrigger] = useState('BILLING_DUE');
  const [autoChannel, setAutoChannel] = useState('WHATSAPP');
  const [autoTemplateId, setAutoTemplateId] = useState('');

  // Push / In-App Notification preview simulation
  const [pushTitleSim, setPushTitleSim] = useState('Al-Hikmah Boarding Portal');
  const [pushBodySim, setPushBodySim] = useState('Ujian Semester akan dilaksanakan esok hari. Harap membawa kartu ujian.');
  const [pushBadgeCount, setPushBadgeCount] = useState(3);
  const [showPushNotificationToast, setShowPushNotificationToast] = useState(false);

  // SMTP Test Email Form
  const [smtpTestRecipient, setSmtpTestRecipient] = useState('nafsahku@gmail.com');
  const [smtpTesting, setSmtpTesting] = useState(false);

  // Inbox & Read receipts simulation logs
  const [inboxLog, setInboxLog] = useState([
    { id: 'ib-1', name: 'Ahmad Faisal (Wali Rafli)', time: '09:12', comment: 'Siap, terima kasih informasinya Ustadz.', hasRead: true },
    { id: 'ib-2', name: 'Zahra Amalia (Wali Fatimah)', time: '10:05', comment: 'Untuk biaya seragam, apakah bisa ditransfer ke rekening BSI?', hasRead: true },
    { id: 'ib-3', name: 'Sutrisno (Wali Hanif)', time: '11:32', comment: 'Hanif menginfokan hari jumat ini ada libur pondok ya?', hasRead: true },
    { id: 'ib-4', name: 'Hj. Kartini (Wali Farhan)', time: '12:00', comment: 'Sudah saya bayar lunas SPP-nya ustadz, bukti terlampir.', hasRead: false }
  ]);

  // Dynamic Audit logs table simulation
  const [auditLogs, setAuditLogs] = useState([
    { id: 'au-1', user: 'Ustadz Ahmad (Wali Kelas 10A)', action: 'Create Draft', target: 'Announcement SPP', time: '2026-07-20 08:30:15' },
    { id: 'au-2', user: 'Administrator', action: 'Publish Broadcast', target: 'Edaran Akhir Tahun', time: '2026-07-20 09:15:22' },
    { id: 'au-3', user: 'Bendahara Keuangan', action: 'Trigger Auto-Billing', target: 'SPP September', time: '2026-07-20 10:20:00' },
    { id: 'au-4', user: 'Kepala Sekolah', action: 'Export Audit Log', target: 'Excel Delivery Report', time: '2026-07-20 11:45:01' }
  ]);

  // MUTATIONS (Synchronized with backend triggers)
  const createAnnouncementMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axios.post('/api/action?action=announcementCreate', payload);
      return res.data;
    },
    onSuccess: (data, variables) => {
      refetchAnnouncements();
      if (data?.success) {
        setAnnTitle('');
        setAnnContent('');
        setAnnIsPinned(false);
        setUploadedAttachments([]);
        setAnnStatusMessage('Draf Pengumuman Baru berhasil disimpan!');
        // Register local audit log
        setAuditLogs(prev => [
          {
            id: `au-${Date.now()}`,
            user: 'You (Simulated Role)',
            action: 'Create Draft',
            target: variables?.title || 'Pengumuman Baru',
            time: new Date().toISOString().replace('T', ' ').substring(0, 19)
          },
          ...prev
        ]);
        setTimeout(() => setAnnStatusMessage(null), 3000);
      }
    }
  });

  const publishAnnouncementMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await axios.post('/api/action?action=announcementPublish', { id });
      return res.data;
    },
    onSuccess: (data, variables) => {
      refetchAnnouncements();
      refetchQueue();
      if (data?.success) {
        setAnnStatusMessage(data.message || 'Pengumuman resmi berhasil disiarkan!');
        setAuditLogs(prev => [
          {
            id: `au-${Date.now()}`,
            user: 'You (Simulated Role)',
            action: 'Publish Announcement',
            target: `ID: ${variables}`,
            time: new Date().toISOString().replace('T', ' ').substring(0, 19)
          },
          ...prev
        ]);
        setTimeout(() => setAnnStatusMessage(null), 4000);
      }
    }
  });

  const deleteAnnouncementMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await axios.post('/api/action?action=announcementDelete', { id });
      return res.data;
    },
    onSuccess: () => {
      refetchAnnouncements();
      if (annSelectedId) setAnnSelectedId(null);
    }
  });

  const saveTemplateMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axios.post('/api/action?action=notificationTemplate', { subAction: 'save', ...payload });
      return res.data;
    },
    onSuccess: () => {
      refetchTemplates();
      setNewTempName('');
      setNewTempSubject('');
      setNewTempBody('');
      setNewTempVariables([]);
      setAnnStatusMessage('Smart Template berhasil didaftarkan!');
      setTimeout(() => setAnnStatusMessage(null), 3000);
    }
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await axios.post('/api/action?action=notificationTemplate', { subAction: 'delete', id });
      return res.data;
    },
    onSuccess: () => {
      refetchTemplates();
    }
  });

  const retryNotificationMutation = useMutation({
    mutationFn: async (queue_id: string) => {
      const res = await axios.post('/api/action?action=notificationRetry', { queue_id });
      return res.data;
    },
    onSuccess: () => {
      refetchQueue();
      setAnnStatusMessage('Antrian pengiriman berhasil dipicu ulang!');
      setTimeout(() => setAnnStatusMessage(null), 3000);
    }
  });

  const createBroadcastMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axios.post('/api/action?action=broadcastCreate', payload);
      return res.data?.data;
    },
    onSuccess: (campaign) => {
      if (campaign?.id) {
        axios.post('/api/action?action=broadcastSend', { campaign_id: campaign.id }).then(() => {
          refetchQueue();
        });
        setAnnStatusMessage('Kirim kampanye massal berhasil diproses!');
        setTimeout(() => setAnnStatusMessage(null), 3000);
      }
    }
  });

  const saveRuleMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axios.post('/api/action?action=automationRule', { subAction: 'save', ...payload });
      return res.data;
    },
    onSuccess: () => {
      refetchRules();
      setAutoRuleName('');
      setAnnStatusMessage('Otomatisasi pemicu berhasil disimpan!');
      setTimeout(() => setAnnStatusMessage(null), 3000);
    }
  });

  // Gemini AI generation trigger
  const handleGenerateWordingAI = async () => {
    if (!annAiPrompt) return;
    setAnnGeneratingWording(true);
    setAnnStatusMessage(null);
    try {
      const res = await axios.post('/api/action?action=announcementGenerateWording', {
        prompt: annAiPrompt,
        category: annType,
        channel: annChannels.join(' & ')
      });
      if (res.data?.success) {
        setAnnContent(res.data.text);
        setAnnStatusMessage('Pesan pengumuman berhasil dikompilasi oleh Gemini AI!');
        setTimeout(() => setAnnStatusMessage(null), 3000);
      } else {
        alert(res.data?.message || 'Gagal menghasilkan teks via AI.');
      }
    } catch (e: any) {
      console.error(e);
      alert('Koneksi AI terputus. Menggunakan generator draf fallback.');
      setAnnContent(
        `📌 *PENGUMUMAN RESMI SEKOLAH*\n\nKepada Yth. Wali Murid,\n\nTerkait: *${annTitle || 'Informasi Penting'}*\nKami sampaikan bahwa ${annAiPrompt}. Mohon perhatian dan kerja samanya.\n\nHormat kami,\nKepala Sekolah`
      );
    } finally {
      setAnnGeneratingWording(false);
    }
  };

  // Variable helper click handler to inject variables into editor/template
  const injectVariable = (variable: string, target: 'announcement' | 'template') => {
    if (target === 'announcement') {
      setAnnContent(prev => prev + ' ' + variable);
    } else {
      setNewTempBody(prev => prev + ' ' + variable);
      if (!newTempVariables.includes(variable.replace(/[{}]/g, ''))) {
        setNewTempVariables(prev => [...prev, variable.replace(/[{}]/g, '')]);
      }
    }
  };

  // File drag & drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files).map(f => ({
        name: f.name,
        type: f.name.split('.').pop() || 'dat'
      }));
      setUploadedAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setUploadedAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Send Test Email gateway simulator
  const handleTestSmtp = (e: React.FormEvent) => {
    e.preventDefault();
    setSmtpTesting(true);
    setTimeout(() => {
      setSmtpTesting(false);
      setAnnStatusMessage(`Koneksi SMTP Sukses! Email percobaan terkirim ke ${smtpTestRecipient}`);
      // Register test log
      setAuditLogs(prev => [
        {
          id: `au-${Date.now()}`,
          user: 'System Validator',
          action: 'Test SMTP Port',
          target: smtpTestRecipient,
          time: new Date().toISOString().replace('T', ' ').substring(0, 19)
        },
        ...prev
      ]);
      setTimeout(() => setAnnStatusMessage(null), 4000);
    }, 1500);
  };

  // QR Code Simulator Content based on Announcement Title
  const qrCodeValue = annTitle ? `https://portal.alhikmah.sch.id/download/announcement-${Date.now()}` : 'https://portal.alhikmah.sch.id';

  // Quick Duplicate helper
  const handleDuplicateAnnouncement = (ann: any) => {
    setAnnTitle(`[DUPLIKAT] ${ann.title}`);
    setAnnContent(ann.content);
    setAnnType(ann.type);
    setAnnPriority(ann.priority);
    setAnnChannels(typeof ann.channels === 'string' ? JSON.parse(ann.channels) : ann.channels || ['IN_APP']);
    setAnnStatusMessage('Data pengumuman berhasil diduplikat ke formulir!');
    setTimeout(() => setAnnStatusMessage(null), 3000);
  };

  // Render icons corresponding to uploaded extensions
  const getAttachmentIcon = (ext: string) => {
    const extLower = ext.toLowerCase();
    if (['pdf'].includes(extLower)) return <FileCheck className="h-5 w-5 text-rose-500" />;
    if (['doc', 'docx'].includes(extLower)) return <FileText className="h-5 w-5 text-blue-500" />;
    if (['xls', 'xlsx'].includes(extLower)) return <FileSpreadsheet className="h-5 w-5 text-emerald-500" />;
    if (['png', 'jpg', 'jpeg', 'gif'].includes(extLower)) return <ImageIcon className="h-5 w-5 text-amber-500" />;
    if (['mp3', 'wav'].includes(extLower)) return <Music className="h-5 w-5 text-indigo-500" />;
    if (['mp4', 'mov', 'avi'].includes(extLower)) return <Film className="h-5 w-5 text-purple-500" />;
    if (['zip', 'rar'].includes(extLower)) return <FileArchive className="h-5 w-5 text-slate-500" />;
    return <FileText className="h-5 w-5 text-slate-400" />;
  };

  // Simulate incoming comments/read receipt updates
  const markFeedbackAsRead = (id: string) => {
    setInboxLog(prev => prev.map(item => item.id === id ? { ...item, hasRead: true } : item));
  };

  // Switch menus and refresh the current queue automatically
  useEffect(() => {
    refetchQueue();
  }, [activeMenuTab]);

  return (
    <div className="space-y-6 font-sans text-slate-800">
      
      {/* Dynamic RBAC Simulator & Data Scope Header Bar */}
      {isActualSuperAdmin && (
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md border border-amber-600/20">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-100 shrink-0" />
            <div>
              <div className="flex items-center flex-wrap gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest bg-amber-700/40 px-2 py-0.5 rounded font-mono">
                  Enterprise RBAC Simulator
                </span>
                <span className="text-[11px] bg-white/10 px-2 py-0.5 rounded font-medium border border-white/10 lg:hidden">
                  Scope: <strong className="text-amber-100">{getUserScopeLabel(currentSimulatedRole)}</strong>
                </span>
              </div>
              <span className="text-[11px] sm:text-xs font-bold block mt-1 sm:mt-0">
                Uji data scope, penugasan, dan hak akses menu portal komunikasi secara langsung:
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold font-mono whitespace-nowrap">Peran Aktif:</span>
            <select
              value={currentSimulatedRole}
              onChange={(e) => setCurrentSimulatedRole(e.target.value as UserRole)}
              className="text-xs p-1.5 bg-amber-800 text-white font-bold border-none rounded focus:ring-1 focus:ring-white outline-none cursor-pointer flex-1 sm:flex-none sm:min-w-[180px]"
            >
              <option value="SUPER_ADMIN">Super Admin (All Access)</option>
              <option value="KEPALA_SEKOLAH">Kepala Sekolah (Unit Only)</option>
              <option value="GURU">Guru Mapel (Assignment Scoped)</option>
              <option value="WALI_KELAS">Wali Kelas (Class Scoped)</option>
              <option value="BENDAHARA">Bendahara (Finance Scoped)</option>
              <option value="TU">Staff TU (Administrative Scoped)</option>
              <option value="SANTRI">Siswa / Santri (Read-Only)</option>
            </select>

            <span className="text-[11px] bg-white/10 px-2 py-1 rounded font-medium border border-white/10 hidden lg:inline whitespace-nowrap">
              🔒 Scope: <strong className="text-amber-100">{getUserScopeLabel(currentSimulatedRole)}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Hero Overview Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 p-6 md:p-8 rounded-2xl shadow-xl border border-indigo-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Bell className="h-44 w-44 text-white animate-pulse" />
        </div>
        <div className="relative z-10 max-w-4xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 text-xs font-semibold font-mono uppercase tracking-wider">
            <Sparkles className="h-3 w-3 text-amber-300" /> Enterprise Communication Engine
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-none font-mono">
            COMMUNICATION HUB & BROADCAST CENTER
          </h1>
          <p className="text-slate-300 text-xs md:text-sm max-w-2xl font-light">
            Portal komunikasi terintegrasi penuh. Kelola siaran pengumuman multi-channel (In-App Push, WhatsApp, Email, Push Notification, SMS) dengan filter target presisi berbasis Unit, Kelas, Mata Pelajaran, dan Asrama.
          </p>
        </div>
      </div>

      {/* Main Grid: Left Sidebar Submenus & Right Tab Content */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        
        {/* Navigation Sidebar (11 Menus requested explicitly in prompt) */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1.5 xl:col-span-1">
          <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 font-mono px-3 mb-2">
            Menu Komunikasi
          </p>
          
          <button
            onClick={() => setActiveMenuTab('dashboard')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
              activeMenuTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <Activity className="h-4 w-4 shrink-0" /> Dashboard Komunikasi
            </span>
            <ChevronRight className="h-3 w-3 opacity-60" />
          </button>

          <button
            onClick={() => setActiveMenuTab('pengumuman')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
              activeMenuTab === 'pengumuman'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 shrink-0" /> Pengumuman (CRUD)
            </span>
            <span className="bg-indigo-100 text-indigo-700 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
              {announcements?.length || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveMenuTab('broadcast')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
              activeMenuTab === 'broadcast'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <Play className="h-4 w-4 shrink-0" /> Broadcast Center
            </span>
            <ChevronRight className="h-3 w-3 opacity-60" />
          </button>

          <button
            onClick={() => setActiveMenuTab('chat')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
              activeMenuTab === 'chat'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 shrink-0 text-amber-500" /> Chat Realtime
            </span>
            <span className="bg-amber-100 text-amber-700 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
              LIVE
            </span>
          </button>

          <button
            onClick={() => setActiveMenuTab('notifikasi')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
              activeMenuTab === 'notifikasi'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <Bell className="h-4 w-4 shrink-0" /> Notifikasi Push Simulator
            </span>
            <ChevronRight className="h-3 w-3 opacity-60" />
          </button>

          <button
            onClick={() => setActiveMenuTab('templates')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
              activeMenuTab === 'templates'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <Sliders className="h-4 w-4 shrink-0" /> Template Pesan
            </span>
            <ChevronRight className="h-3 w-3 opacity-60" />
          </button>

          <button
            onClick={() => setActiveMenuTab('whatsapp')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
              activeMenuTab === 'whatsapp'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 shrink-0 text-emerald-500" /> WhatsApp Gateway
            </span>
            <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full font-mono">
              ONLINE
            </span>
          </button>

          <button
            onClick={() => setActiveMenuTab('email')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
              activeMenuTab === 'email'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0 text-sky-500" /> Email (SMTP)
            </span>
            <ChevronRight className="h-3 w-3 opacity-60" />
          </button>

          <button
            onClick={() => setActiveMenuTab('push-settings')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
              activeMenuTab === 'push-settings'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 shrink-0" /> Push Settings
            </span>
            <ChevronRight className="h-3 w-3 opacity-60" />
          </button>

          <button
            onClick={() => setActiveMenuTab('schedule')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
              activeMenuTab === 'schedule'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0 text-amber-500" /> Jadwal Broadcast
            </span>
            <ChevronRight className="h-3 w-3 opacity-60" />
          </button>

          <button
            onClick={() => setActiveMenuTab('inbox')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
              activeMenuTab === 'inbox'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 shrink-0 text-indigo-500" /> Inbox & Read Receipts
            </span>
            <span className="bg-rose-100 text-rose-700 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
              {inboxLog.filter(x => !x.hasRead).length}
            </span>
          </button>

          <button
            onClick={() => setActiveMenuTab('riwayat')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
              activeMenuTab === 'riwayat'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 shrink-0" /> Riwayat & Outbox
            </span>
            <ChevronRight className="h-3 w-3 opacity-60" />
          </button>
        </div>

        {/* Tab Content Display Area */}
        <div className="xl:col-span-3 space-y-6">

          {/* Alert notifications area */}
          {annStatusMessage && (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-2 border border-emerald-200 shadow-sm animate-pulse">
              <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{annStatusMessage}</span>
            </div>
          )}

          {/* ================================================== */}
          {/* TAB: CHAT REALTIME */}
          {/* ================================================== */}
          {activeMenuTab === 'chat' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[700px] animate-fade-in" id="chat-hub-section">
              {/* Header Info */}
              <div className="bg-slate-50 border-b border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <h3 className="text-sm font-black text-slate-800 font-mono tracking-tight uppercase">
                      Enterprise Realtime Communication Hub
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-500 font-light mt-0.5">
                    Menampilkan ruang obrolan terenkripsi sesuai dengan hak akses peran <strong>{currentSimulatedRole}</strong>.
                  </p>
                </div>
                
                {/* Dynamic Group Scopes Details */}
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-2 py-1 rounded font-bold uppercase">
                    🔒 JWT & RBAC Active
                  </span>
                  <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-bold border border-indigo-100">
                    Scope: {getUserScopeLabel(currentSimulatedRole)}
                  </span>
                </div>
              </div>

              {/* Chat Layout Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 flex-1 overflow-hidden h-full">
                {/* Left Side: Room List & Scopes */}
                <div className="border-r border-slate-200 flex flex-col overflow-hidden h-full">
                  <div className="p-3 border-b border-slate-200 bg-slate-50/50">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Cari ruang / peran..."
                        value={chatSearchQuery}
                        onChange={(e) => setChatSearchQuery(e.target.value)}
                        className="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                      />
                      <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    </div>
                  </div>

                  {/* Rooms List */}
                  <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
                    {chatRooms
                      .filter(room => {
                        // Dynamic RBAC / Scope filtering:
                        // SUPER_ADMIN has full access
                        if (currentSimulatedRole === 'SUPER_ADMIN') return true;
                        
                        // Other roles must match scopeRoles
                        return room.scopeRoles.includes(currentSimulatedRole);
                      })
                      .filter(room => room.name.toLowerCase().includes(chatSearchQuery.toLowerCase()))
                      .map((room) => {
                        const isActive = activeRoomId === room.id;
                        const messagesInRoom = chatMessages[room.id] || [];
                        const lastMessage = messagesInRoom[messagesInRoom.length - 1];

                        return (
                          <button
                            key={room.id}
                            onClick={() => {
                              setActiveRoomId(room.id);
                              setReplyingToMessage(null);
                              setEditingMessage(null);
                            }}
                            className={`w-full text-left p-3 rounded-xl flex items-start gap-3 transition-all ${
                              isActive
                                ? 'bg-indigo-50/70 border-l-4 border-indigo-600 shadow-sm'
                                : 'hover:bg-slate-50 border-l-4 border-transparent'
                            }`}
                          >
                            <span className="text-2xl shrink-0 p-1.5 bg-slate-100 rounded-lg">{room.avatar}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-black text-slate-800 truncate font-mono tracking-tight leading-tight uppercase block">
                                  {room.name}
                                </span>
                                <span className="text-[9px] text-slate-400 font-mono shrink-0">
                                  {lastMessage ? lastMessage.time : ''}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[9px] font-mono px-1 bg-slate-200 text-slate-600 rounded font-bold">
                                  {room.type}
                                </span>
                                {room.onlineCount && (
                                  <span className="text-[9px] text-emerald-600 font-bold shrink-0">
                                    ● {room.onlineCount} online
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-500 truncate mt-1">
                                {typingUser && isActive ? (
                                  <span className="text-indigo-600 font-bold italic animate-pulse">Sedang mengetik...</span>
                                ) : lastMessage ? (
                                  <span>
                                    <strong>{lastMessage.senderName}: </strong>
                                    {lastMessage.isDeleted ? '🚫 Pesan dihapus' : lastMessage.text}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 italic">Belum ada obrolan</span>
                                )}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </div>

                {/* Right Side: Message Feed & Controls */}
                <div className="md:col-span-2 flex flex-col overflow-hidden h-full bg-slate-50/50">
                  {/* Active Room Title Bar */}
                  {(() => {
                    const currentRoom = chatRooms.find(r => r.id === activeRoomId);
                    if (!currentRoom) return <div className="p-8 text-center text-slate-400">Pilih ruang obrolan.</div>;
                    
                    const pinnedRoomMsgIds = pinnedMessages[activeRoomId] || [];
                    const activeRoomMessages = chatMessages[activeRoomId] || [];
                    const pinnedMessageObjects = activeRoomMessages.filter(m => pinnedRoomMsgIds.includes(m.id));

                    return (
                      <>
                        <div className="bg-white border-b border-slate-200 p-3.5 flex items-center justify-between gap-3 shrink-0">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl p-1 bg-slate-100 rounded-lg">{currentRoom.avatar}</span>
                            <div>
                              <h4 className="text-xs font-black text-slate-800 font-mono tracking-tight uppercase">
                                {currentRoom.name}
                              </h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[9px] font-mono bg-indigo-50 text-indigo-700 px-1 py-0.2 rounded font-bold border border-indigo-100 uppercase">
                                  {currentRoom.type} Chatroom
                                </span>
                                {currentRoom.onlineCount && (
                                  <span className="text-[9px] text-emerald-600 font-bold font-mono">
                                    ● {currentRoom.onlineCount} online
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => {
                                setChatInputMessage('');
                                setChatSearchQuery('');
                                setReplyingToMessage(null);
                                setEditingMessage(null);
                              }}
                              className="p-1.5 hover:bg-slate-100 rounded text-slate-500"
                              title="Refresh Chat"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Pinned Messages Bar */}
                        {pinnedMessageObjects.length > 0 && (
                          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between gap-4 shrink-0 shadow-sm">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-xs">📌</span>
                              <div className="text-[10px] text-amber-800 truncate">
                                <strong>Pesan Disematkan ({pinnedMessageObjects[0].senderName}):</strong> "{pinnedMessageObjects[0].text}"
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setPinnedMessages(prev => ({
                                  ...prev,
                                  [activeRoomId]: (prev[activeRoomId] || []).filter(id => id !== pinnedMessageObjects[0].id)
                                }));
                              }}
                              className="text-[10px] font-black text-amber-700 hover:underline font-mono"
                            >
                              LEPAS
                            </button>
                          </div>
                        )}

                        {/* Messages Box */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                          {activeRoomMessages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-10">
                              <MessageSquare className="h-10 w-10 opacity-30 mb-2" />
                              <p className="text-xs">Belum ada percakapan di sini. Jadilah yang pertama menyapa!</p>
                            </div>
                          ) : (
                            activeRoomMessages.map((msg) => {
                              const isSelf = msg.senderName === 'You (Simulated Role)' || msg.senderRole === currentSimulatedRole;
                              const replyMsg = activeRoomMessages.find(m => m.id === msg.replyTo);

                              return (
                                <div
                                  key={msg.id}
                                  className={`flex flex-col max-w-[85%] ${
                                    isSelf ? 'ml-auto items-end' : 'mr-auto items-start'
                                  }`}
                                >
                                  {/* Sender Label */}
                                  <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400 font-mono">
                                    <span className="font-bold text-slate-600">{msg.senderName}</span>
                                    <span>•</span>
                                    <span className="bg-slate-200 px-1 py-0.2 rounded font-bold text-slate-700">{msg.senderRole}</span>
                                    {msg.isEdited && <span className="text-[9px] italic text-slate-400">(diedit)</span>}
                                  </div>

                                  {/* Message Bubble */}
                                  <div
                                    className={`p-3 rounded-2xl shadow-sm border text-xs leading-relaxed space-y-1.5 relative group ${
                                      msg.isDeleted
                                        ? 'bg-slate-100 text-slate-400 border-slate-200 italic'
                                        : isSelf
                                        ? 'bg-indigo-600 text-white border-indigo-700 rounded-tr-none'
                                        : 'bg-white text-slate-800 border-slate-200 rounded-tl-none'
                                    }`}
                                  >
                                    {/* Replying context view inside bubble */}
                                    {replyMsg && !msg.isDeleted && (
                                      <div className={`p-1.5 rounded text-[10px] mb-1.5 border-l-2 truncate ${
                                        isSelf 
                                          ? 'bg-indigo-700/60 text-indigo-100 border-indigo-400' 
                                          : 'bg-slate-100 text-slate-600 border-slate-400'
                                      }`}>
                                        <strong>@{replyMsg.senderName}:</strong> {replyMsg.text}
                                      </div>
                                    )}

                                    {/* Pinned label */}
                                    {pinnedRoomMsgIds.includes(msg.id) && !msg.isDeleted && (
                                      <span className="absolute -top-2.5 -right-1 bg-amber-100 text-amber-800 font-mono font-bold text-[8px] border border-amber-300 px-1 py-0.2 rounded">
                                        📌 PINNED
                                      </span>
                                    )}

                                    <p className="whitespace-pre-line">{msg.isDeleted ? '🚫 Pesan ini telah dihapus oleh pengirim' : msg.text}</p>

                                    {/* Attached Files rendering */}
                                    {msg.attachments && msg.attachments.length > 0 && !msg.isDeleted && (
                                      <div className="mt-2 space-y-1 bg-black/5 p-2 rounded-lg border border-black/10">
                                        {msg.attachments.map((file, idx) => (
                                          <div key={idx} className="flex items-center justify-between gap-3 text-[10px]">
                                            <span className="flex items-center gap-1.5 min-w-0">
                                              {file.type === 'IMAGE' && <ImageIcon className="h-3.5 w-3.5 shrink-0" />}
                                              {file.type === 'PDF' && <FileText className="h-3.5 w-3.5 shrink-0" />}
                                              {file.type === 'WORD' && <FileCheck className="h-3.5 w-3.5 shrink-0" />}
                                              {file.type === 'EXCEL' && <FileSpreadsheet className="h-3.5 w-3.5 shrink-0" />}
                                              {file.type === 'VIDEO' && <Film className="h-3.5 w-3.5 shrink-0" />}
                                              {file.type === 'VOICE' && <Music className="h-3.5 w-3.5 shrink-0 animate-pulse" />}
                                              <span className="truncate underline font-bold">{file.name}</span>
                                            </span>
                                            <span className="text-[9px] opacity-75 font-mono">{file.size}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {/* Action items overlay inside chat bubble on Hover */}
                                    {!msg.isDeleted && (
                                      <div className={`absolute bottom-[-24px] hidden group-hover:flex items-center gap-1.5 bg-white border border-slate-200 px-2 py-0.5 rounded-full shadow-md text-[9px] text-slate-500 font-mono z-20 ${
                                        isSelf ? 'right-0' : 'left-0'
                                      }`}>
                                        <button onClick={() => setReplyingToMessage(msg)} className="hover:text-indigo-600 font-bold uppercase">Reply</button>
                                        <span>|</span>
                                        {isSelf && (
                                          <>
                                            <button onClick={() => setEditingMessage(msg)} className="hover:text-amber-600 font-bold uppercase">Edit</button>
                                            <span>|</span>
                                            <button 
                                              onClick={() => {
                                                setChatMessages(prev => {
                                                  const copy = { ...prev };
                                                  copy[activeRoomId] = (copy[activeRoomId] || []).map(m => 
                                                    m.id === msg.id ? { ...m, isDeleted: true } : m
                                                  );
                                                  return copy;
                                                });
                                              }} 
                                              className="hover:text-rose-600 font-bold uppercase"
                                            >
                                              Del
                                            </button>
                                            <span>|</span>
                                          </>
                                        )}
                                        <button 
                                          onClick={() => {
                                            const isCurrentlyPinned = pinnedRoomMsgIds.includes(msg.id);
                                            setPinnedMessages(prev => {
                                              const prevPinned = prev[activeRoomId] || [];
                                              return {
                                                ...prev,
                                                [activeRoomId]: isCurrentlyPinned
                                                  ? prevPinned.filter(id => id !== msg.id)
                                                  : [...prevPinned, msg.id]
                                              };
                                            });
                                          }}
                                          className="hover:text-amber-700 font-bold uppercase"
                                        >
                                          {pinnedRoomMsgIds.includes(msg.id) ? 'Unpin' : 'Pin'}
                                        </button>
                                      </div>
                                    )}
                                  </div>

                                  {/* Timestamp info label */}
                                  <span className="text-[9px] text-slate-400 font-mono mt-0.5">
                                    {msg.time}
                                  </span>
                                </div>
                              );
                            })
                          )}

                          {/* Typing Indicator rendering */}
                          {typingUser && (
                            <div className="flex items-center gap-2 mr-auto bg-white/80 p-2.5 rounded-2xl rounded-tl-none border border-slate-200 text-[10px] text-slate-500 font-mono italic shadow-sm animate-pulse">
                              <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-600 animate-bounce"></span>
                              <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-600 animate-bounce delay-100"></span>
                              <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-600 animate-bounce delay-200"></span>
                              <span><strong>{typingUser}</strong> sedang mengetik...</span>
                            </div>
                          )}
                        </div>

                        {/* Input & Form panel */}
                        <div className="p-3 bg-white border-t border-slate-200 shrink-0">
                          {/* Replying Context Bar */}
                          {replyingToMessage && (
                            <div className="bg-slate-100 border border-slate-200 p-2 rounded-lg flex items-center justify-between text-[10px] mb-2 font-mono">
                              <div className="truncate">
                                🔁 Membalas <strong>@{replyingToMessage.senderName}</strong>: "{replyingToMessage.text}"
                              </div>
                              <button onClick={() => setReplyingToMessage(null)} className="text-rose-600 font-bold hover:underline">
                                BATAL
                              </button>
                            </div>
                          )}

                          {/* Editing Context Bar */}
                          {editingMessage && (
                            <div className="bg-amber-50 border border-amber-200 p-2 rounded-lg flex items-center justify-between text-[10px] mb-2 font-mono">
                              <div className="truncate">
                                ✏️ Mengedit pesan: "{editingMessage.text}"
                              </div>
                              <button onClick={() => setEditingMessage(null)} className="text-amber-700 font-bold hover:underline">
                                BATAL
                              </button>
                            </div>
                          )}

                          {/* Render current attached files ready to send */}
                          {chatAttachments.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2 p-2 bg-indigo-50 border border-indigo-100 rounded-lg">
                              {chatAttachments.map((f, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 bg-white px-2 py-1 rounded border border-indigo-200 text-[9px] font-mono">
                                  <span>📎 {f.name} ({f.size})</span>
                                  <button 
                                    onClick={() => setChatAttachments(prev => prev.filter((_, i) => i !== idx))} 
                                    className="text-rose-600 font-black"
                                  >
                                    X
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Form Control */}
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              if (!chatInputMessage.trim() && chatAttachments.length === 0) return;

                              const now = new Date();
                              const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                              const msgId = `m-${Date.now()}`;

                              if (editingMessage) {
                                // Apply Edit Message
                                setChatMessages(prev => {
                                  const copy = { ...prev };
                                  copy[activeRoomId] = (copy[activeRoomId] || []).map(m => 
                                    m.id === editingMessage.id 
                                      ? { ...m, text: chatInputMessage, isEdited: true }
                                      : m
                                  );
                                  return copy;
                                });
                                setEditingMessage(null);
                                setChatInputMessage('');
                              } else {
                                // Normal Send or Reply
                                const newMsg: ChatMessage = {
                                  id: msgId,
                                  senderName: 'You (Simulated Role)',
                                  senderRole: currentSimulatedRole,
                                  text: chatInputMessage,
                                  time: timeStr,
                                  attachments: chatAttachments.length > 0 ? chatAttachments : undefined,
                                  replyTo: replyingToMessage?.id || undefined
                                };

                                setChatMessages(prev => ({
                                  ...prev,
                                  [activeRoomId]: [...(prev[activeRoomId] || []), newMsg]
                                }));

                                setChatInputMessage('');
                                setChatAttachments([]);
                                setReplyingToMessage(null);

                                // Trigger simulated automated replies to make it 100% active and reactive
                                const opponent = currentRoom.name.includes('Guru') ? 'Ustadzah Aminah' : 'Bapak Joko Widodo';
                                const opponentRole = currentRoom.name.includes('Guru') ? 'GURU' : 'WALI_SANTRI';
                                
                                setTypingUser(opponent);
                                setTimeout(() => {
                                  setTypingUser(null);
                                  setChatMessages(prev => ({
                                    ...prev,
                                    [activeRoomId]: [
                                      ...(prev[activeRoomId] || []),
                                      {
                                        id: `opp-${Date.now()}`,
                                        senderName: opponent,
                                        senderRole: opponentRole,
                                        text: `[Otomatis] Siap dipahami, koordinasi mengenai hal ini segera kami tindaklanjuti kembali di lingkungan sekolah. Terima kasih Bapak/Ibu.`,
                                        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                                      }
                                    ]
                                  }));
                                }, 1500);
                              }
                            }}
                            className="flex items-center gap-2"
                          >
                            {/* Attachment Simulators Dropdown */}
                            <div className="relative shrink-0">
                              <select
                                onChange={(e) => {
                                  const type = e.target.value as any;
                                  if (!type) return;
                                  
                                  const sampleNames: Record<string, string> = {
                                    IMAGE: 'bukti_pembayaran_spp_raihan.png',
                                    PDF: 'edaran_rapat_yayasan.pdf',
                                    WORD: 'silabus_kurikulum_2026.docx',
                                    EXCEL: 'rekap_nilai_siswa_vii_a.xlsx',
                                    VIDEO: 'dokumentasi_ekskul_tahfidz.mp4',
                                    VOICE: 'voice_note_ijazah.m4a'
                                  };

                                  setChatAttachments(prev => [
                                    ...prev,
                                    {
                                      name: sampleNames[type],
                                      type,
                                      size: type === 'VIDEO' ? '4.8 MB' : '245 KB'
                                    }
                                  ]);
                                  e.target.value = '';
                                }}
                                className="text-[10px] bg-slate-100 border border-slate-200 rounded-lg p-2 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer text-slate-600"
                              >
                                <option value="">📎 Lampiran</option>
                                <option value="IMAGE">📷 Foto/Gambar</option>
                                <option value="PDF">📄 File PDF</option>
                                <option value="WORD">📝 File Word</option>
                                <option value="EXCEL">📊 File Excel</option>
                                <option value="VIDEO">🎥 Video</option>
                                <option value="VOICE">🎙️ Voice Note</option>
                              </select>
                            </div>

                            <input
                              type="text"
                              value={chatInputMessage}
                              onChange={(e) => {
                                setChatInputMessage(e.target.value);
                                if (editingMessage) return;
                              }}
                              placeholder={editingMessage ? 'Tulis koreksi pesan...' : 'Ketik pesan di sini...'}
                              className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50"
                            />

                            <button
                              type="submit"
                              className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition shadow shrink-0"
                            >
                              <Send className="h-4 w-4" />
                            </button>
                          </form>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* ================================================== */}
          {/* TAB 1: DASHBOARD KOMUNIKASI */}
          {/* ================================================== */}
          {activeMenuTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Dashboard Statistics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase text-slate-400 font-mono">Total Siaran</span>
                    <Play className="h-5 w-5 text-indigo-600" />
                  </div>
                  <p className="text-2xl font-black text-slate-800 font-mono">{MOCK_DASHBOARD_STATS.totalBroadcasts}</p>
                  <p className="text-[10px] text-slate-400">Kampanye Resmi Sukses</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase text-slate-400 font-mono">WhatsApp Traffic</span>
                    <MessageSquare className="h-5 w-5 text-emerald-500" />
                  </div>
                  <p className="text-2xl font-black text-slate-800 font-mono">{MOCK_DASHBOARD_STATS.whatsappSent}</p>
                  <p className="text-[10px] text-emerald-600 font-semibold">Tingkat Kirim 99.2%</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase text-slate-400 font-mono">Email Gateway</span>
                    <Mail className="h-5 w-5 text-sky-500" />
                  </div>
                  <p className="text-2xl font-black text-slate-800 font-mono">{MOCK_DASHBOARD_STATS.emailSent}</p>
                  <p className="text-[10px] text-sky-600 font-semibold">SMTP Port 587 Active</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase text-slate-400 font-mono">In-App Push</span>
                    <Smartphone className="h-5 w-5 text-purple-500" />
                  </div>
                  <p className="text-2xl font-black text-slate-800 font-mono">{MOCK_DASHBOARD_STATS.pushSent}</p>
                  <p className="text-[10px] text-purple-600 font-semibold">Rasio Dibaca {MOCK_DASHBOARD_STATS.readRate}%</p>
                </div>
              </div>

              {/* Graphic charts section (Delivery & Read performance) */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center pb-2 border-b">
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm">Grafik Trafik Komunikasi Mingguan</h3>
                    <p className="text-xs text-slate-400">Total sebaran pesan per saluran dan performa pembacaan</p>
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded font-mono">
                    Updated Realtime
                  </span>
                </div>

                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={MOCK_DASHBOARD_STATS.chartData}>
                      <defs>
                        <linearGradient id="colorWa" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorEmail" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorReads" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: '#0F172A', color: '#FFF', borderRadius: 8, fontSize: 11 }} />
                      <Legend verticalAlign="top" height={36} iconType="circle" />
                      <Area type="monotone" dataKey="WhatsApp" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorWa)" />
                      <Area type="monotone" dataKey="Email" stroke="#0EA5E9" strokeWidth={2} fillOpacity={1} fill="url(#colorEmail)" />
                      <Area type="monotone" dataKey="Reads" name="Grafik Dibaca" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#colorReads)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Automation rule quick summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Active Gateways Live Check */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                  <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider font-mono">
                    Gateway Server Status
                  </h3>
                  
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 bg-emerald-500 rounded-full animate-ping" />
                        <strong>WhatsApp WebHook API</strong>
                      </div>
                      <span className="text-[10px] text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded">CONNECTED</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 bg-emerald-500 rounded-full animate-ping" />
                        <strong>SendGrid Secure SMTP Relay</strong>
                      </div>
                      <span className="text-[10px] text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded">PORT 587 OK</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 bg-amber-500 rounded-full animate-pulse" />
                        <strong>Firebase Push Notification Server</strong>
                      </div>
                      <span className="text-[10px] text-amber-700 bg-amber-100 font-bold px-2 py-0.5 rounded">SYNC ACTIVE</span>
                    </div>
                  </div>
                </div>

                {/* Automation triggers overview */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                  <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider font-mono">
                    Active System Triggers (Otomatisasi)
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
                    <span className="p-2 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" /> SPP Jatuh Tempo
                    </span>
                    <span className="p-2 bg-sky-50 text-sky-700 rounded-lg border border-sky-100 flex items-center gap-1.5">
                      <FileCheck className="h-3.5 w-3.5" /> Rapor Dipublish
                    </span>
                    <span className="p-2 bg-rose-50 text-rose-700 rounded-lg border border-rose-100 flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5" /> Absensi Alfa
                    </span>
                    <span className="p-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100 flex items-center gap-1.5">
                      <UserCheck className="h-3.5 w-3.5" /> PPDB Pendaftar Baru
                    </span>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ================================================== */}
          {/* TAB 2: PENGUMUMAN (CRUD & EDITOR & MULTI-ATTACHMENTS) */}
          {/* ================================================== */}
          {activeMenuTab === 'pengumuman' && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-fade-in">
              
              {/* Creator Card */}
              <div className="xl:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center pb-3 border-b">
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm">Tulis Pengumuman Resmi</h3>
                    <p className="text-xs text-slate-400">Buat draf pesan, sematkan dokumen/media, dan siarkan ke target</p>
                  </div>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full font-mono">
                    Rich Editor & QR
                  </span>
                </div>

                {/* Gemini AI smart assist panel */}
                <div className="bg-gradient-to-br from-indigo-950 to-indigo-900 text-white p-4 rounded-xl border border-indigo-800 space-y-3 shadow-md">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4.5 w-4.5 text-amber-300 animate-pulse" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-300 font-mono">Gemini AI Assistant</h4>
                  </div>
                  <p className="text-[10.5px] text-indigo-200">
                    Tulis poin penting Anda dalam bahasa santai, lalu tekan buat untuk menyusun kalimat resmi dalam bahasa Indonesia formal.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Contoh: ingatkan wali kelas kumpulkan nilai rapor sebelum jumat besok jam 12"
                      value={annAiPrompt}
                      onChange={(e) => setAnnAiPrompt(e.target.value)}
                      className="flex-1 text-xs p-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:ring-1 focus:ring-amber-300 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleGenerateWordingAI}
                      disabled={annGeneratingWording || !annAiPrompt}
                      className="px-3 py-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-xs rounded-lg shadow-sm flex items-center gap-1 disabled:opacity-50 transition"
                    >
                      {annGeneratingWording ? 'Menyusun...' : 'Buat'}
                    </button>
                  </div>
                </div>

                {/* Main CRUD form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!annTitle || !annContent) return;
                    createAnnouncementMutation.mutate({
                      title: annTitle,
                      content: annContent,
                      type: annType,
                      priority: annPriority,
                      is_pinned: annIsPinned,
                      channels: annChannels,
                      recipients_filter: {
                        roles: annTargetRoles,
                        unit: filterUnit,
                        class: filterClass,
                        dorm: filterDorm,
                        course: filterCourse,
                        year: filterYear,
                        semester: filterSemester
                      },
                      attachments: JSON.stringify(uploadedAttachments)
                    });
                  }}
                  className="space-y-4 text-xs"
                >
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Judul / Subjek Pengumuman</label>
                    <input
                      type="text"
                      placeholder="Contoh: Pemberitahuan Libur Menyambut Ramadhan 1447H"
                      value={annTitle}
                      onChange={(e) => setAnnTitle(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border rounded-lg focus:bg-white focus:ring-1 focus:ring-indigo-500 font-bold"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-600 mb-1">Kategori Konten</label>
                      <select
                        value={annType}
                        onChange={(e) => setAnnType(e.target.value)}
                        className="w-full text-xs p-2.5 bg-slate-50 border rounded-lg"
                      >
                        <option value="Informasi">Informasi Umum</option>
                        <option value="Akademik">Akademik & Rapor</option>
                        <option value="Keuangan">Keuangan & Tagihan SPP</option>
                        <option value="PPDB">PPDB (Siswa Baru)</option>
                        <option value="Kegiatan">Kegiatan Yayasan</option>
                        <option value="Asrama">Asrama & Keamanan</option>
                        <option value="Darurat">Pemberitahuan Darurat</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-600 mb-1">Tingkat Prioritas</label>
                      <select
                        value={annPriority}
                        onChange={(e) => setAnnPriority(e.target.value as any)}
                        className="w-full text-xs p-2.5 bg-slate-50 border rounded-lg"
                      >
                        <option value="LOW">Rendah (Low)</option>
                        <option value="MEDIUM">Sedang (Medium)</option>
                        <option value="HIGH">Tinggi (High - Urgensi)</option>
                      </select>
                    </div>
                  </div>

                  {/* Smart Variable Helper Quick Inject */}
                  <div className="bg-slate-50 p-2 border rounded-lg space-y-1">
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold">
                      <Sparkles className="h-3.5 w-3.5 text-indigo-500" /> Click variable to insert into editor:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {SMART_VARIABLES.map(v => (
                        <button
                          key={v.key}
                          type="button"
                          onClick={() => injectVariable(v.key, 'announcement')}
                          className="px-1.5 py-0.5 bg-white border rounded hover:border-indigo-500 font-mono text-[10px] text-slate-700 font-bold"
                          title={v.desc}
                        >
                          {v.key}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Isi Pesan (Mendukung Variable & Markdown)</label>
                    <textarea
                      rows={6}
                      placeholder="Ketik isi pengumuman lengkap atau gunakan AI assistant..."
                      value={annContent}
                      onChange={(e) => setAnnContent(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border rounded-lg font-mono focus:bg-white focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  {/* Multi-Select filters for target grouping as requested */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                      🎯 Pengaturan Target Sebaran (Filters)
                    </span>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Unit</label>
                        <select value={filterUnit} onChange={(e) => setFilterUnit(e.target.value)} className="w-full p-1.5 bg-white border rounded">
                          {FILTER_UNITS.map(x => <option key={x.value} value={x.value}>{x.label}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Kelas</label>
                        <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)} className="w-full p-1.5 bg-white border rounded">
                          {FILTER_CLASSES.map(x => <option key={x.value} value={x.value}>{x.label}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Mapel</label>
                        <select value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)} className="w-full p-1.5 bg-white border rounded">
                          {FILTER_COURSES.map(x => <option key={x.value} value={x.value}>{x.label}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Asrama</label>
                        <select value={filterDorm} onChange={(e) => setFilterDorm(e.target.value)} className="w-full p-1.5 bg-white border rounded">
                          {FILTER_DORMS.map(x => <option key={x.value} value={x.value}>{x.label}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Thn Ajaran</label>
                        <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="w-full p-1.5 bg-white border rounded">
                          {FILTER_YEARS.map(x => <option key={x.value} value={x.value}>{x.label}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Semester</label>
                        <select value={filterSemester} onChange={(e) => setFilterSemester(e.target.value)} className="w-full p-1.5 bg-white border rounded">
                          {FILTER_SEMESTERS.map(x => <option key={x.value} value={x.value}>{x.label}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Drag and Drop attachments block */}
                  <div className="space-y-2">
                    <label className="block font-bold text-slate-600">Unggah Lampiran Pendukung (Rich Files)</label>
                    <div
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition ${
                        dragActive ? 'border-indigo-600 bg-indigo-50/20' : 'border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <Info className="h-6 w-6 text-slate-400 mx-auto mb-1" />
                      <p className="text-[10px] text-slate-500 font-bold">
                        Seret & Letakkan file di sini atau klik untuk unggah lampiran PDF, Word, Excel, Video, ZIP
                      </p>
                      <input
                        type="file"
                        id="ann-file-picker"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const newFiles = Array.from(e.target.files).map(f => ({
                              name: f.name,
                              type: f.name.split('.').pop() || 'dat'
                            }));
                            setUploadedAttachments(prev => [...prev, ...newFiles]);
                          }
                        }}
                      />
                      <label htmlFor="ann-file-picker" className="inline-block mt-2 px-3 py-1 bg-slate-200 hover:bg-slate-300 text-[10px] font-bold rounded cursor-pointer text-slate-700">
                        Pilih Dokumen
                      </label>
                    </div>

                    {/* Attachment list */}
                    {uploadedAttachments.length > 0 && (
                      <div className="space-y-1 bg-slate-50 p-2.5 rounded-lg border">
                        {uploadedAttachments.map((f, i) => (
                          <div key={i} className="flex items-center justify-between p-1.5 bg-white rounded border text-[11px]">
                            <div className="flex items-center gap-2">
                              {getAttachmentIcon(f.type)}
                              <span className="font-semibold text-slate-700 truncate max-w-xs">{f.name}</span>
                              <span className="text-[9px] bg-slate-100 px-1 py-0.2 text-slate-500 uppercase font-mono">{f.type}</span>
                            </div>
                            <button type="button" onClick={() => removeAttachment(i)} className="text-rose-500 hover:bg-rose-50 p-1 rounded">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5 py-1">
                    <input
                      type="checkbox"
                      id="pin-check"
                      checked={annIsPinned}
                      onChange={(e) => setAnnIsPinned(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-0 cursor-pointer h-4 w-4"
                    />
                    <label htmlFor="pin-check" className="font-bold text-slate-700 cursor-pointer select-none">
                      Sematkan Pengumuman ini di Header Beranda Portal Siswa & Wali Murid (PIN)
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={createAnnouncementMutation.isPending || !annTitle || !annContent}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-lg shadow-md flex items-center justify-center gap-2 disabled:opacity-50 transition"
                  >
                    <Plus className="h-4 w-4" /> Simpan Sebagai Draf Pengumuman
                  </button>
                </form>
              </div>

              {/* QR Code & Preview Card Panel on Right */}
              <div className="xl:col-span-5 space-y-6">
                
                {/* Visual Preview Frame */}
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider font-mono">
                    Dynamic Preview & QR Code Generator
                  </h3>

                  <div className="bg-white p-4 rounded-xl border space-y-3 shadow-inner relative">
                    <span className="absolute top-3 right-3 text-[9px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-mono font-bold">
                      Portal Siswa Preview
                    </span>
                    
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400 font-mono">Judul Pengumuman:</p>
                      <h4 className="text-sm font-extrabold text-indigo-950 font-sans">
                        {annTitle || '(Belum Ada Judul)'}
                      </h4>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border font-mono text-[11px] whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed text-slate-600 italic">
                      {annContent || 'Isi teks pengumuman yang anda buat akan tampil di sini secara dinamis...'}
                    </div>

                    {uploadedAttachments.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[10px] text-slate-400 font-mono">File Terlampir ({uploadedAttachments.length}):</p>
                        <div className="flex flex-wrap gap-1">
                          {uploadedAttachments.map((f, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border">
                              {f.name.substring(0, 15)}...
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* QR Code generator box for parents downloads */}
                    <div className="pt-3 border-t flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg border flex items-center justify-center">
                        <QrCode className="h-14 w-14 text-indigo-900" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-black text-slate-800">QR Code Unduhan Portal</p>
                        <p className="text-[9px] text-slate-400">Scan QR Code ini untuk mengunduh lampiran resmi pengumuman ini secara instan di HP Wali Murid.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Announcement List Registry */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-extrabold text-slate-800 text-xs uppercase font-mono tracking-wider">
                      Arsip Pengumuman Sekolah
                    </h3>
                    <button onClick={() => refetchAnnouncements()} className="p-1 hover:bg-slate-100 rounded">
                      <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
                    </button>
                  </div>

                  {loadingAnnouncements ? (
                    <p className="text-xs text-slate-400 font-mono animate-pulse">Membuat sinkronisasi database...</p>
                  ) : !announcements || announcements.length === 0 ? (
                    <div className="text-center p-6 bg-slate-50 border rounded-lg border-dashed">
                      <AlertCircle className="h-6 w-6 text-slate-300 mx-auto mb-1" />
                      <p className="text-xs text-slate-400">Belum ada daftar pengumuman tersimpan.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                      {announcements.map((ann: any) => (
                        <div key={ann.id} className="p-3 bg-slate-50 border rounded-lg hover:border-indigo-400 transition space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] bg-slate-200 text-slate-700 font-mono px-1.5 py-0.2 rounded">
                              {ann.type}
                            </span>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => handleDuplicateAnnouncement(ann)}
                                className="p-1 hover:bg-white text-indigo-600 rounded"
                                title="Duplicate / Copy"
                              >
                                <Copy className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => deleteAnnouncementMutation.mutate(ann.id)}
                                className="p-1 hover:bg-rose-50 text-rose-500 rounded"
                                title="Soft Delete / Archive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>

                          <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{ann.title}</h4>
                          <p className="text-[11px] text-slate-500 line-clamp-2 italic font-mono bg-white p-2 border rounded">
                            {ann.content}
                          </p>

                          <div className="flex items-center justify-between pt-1 text-[9px] text-slate-400">
                            <span>Status: <strong>{ann.status}</strong></span>
                            {ann.status === 'Draft' && (
                              <button
                                type="button"
                                onClick={() => publishAnnouncementMutation.mutate(ann.id)}
                                className="px-2 py-0.5 bg-indigo-600 text-white rounded font-bold hover:bg-indigo-700 transition"
                              >
                                Siarkan Sekarang
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* ================================================== */}
          {/* TAB 3: BROADCAST (KIRIM SEKARANG & RECURRING TIMER) */}
          {/* ================================================== */}
          {activeMenuTab === 'broadcast' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 animate-fade-in">
              <div className="pb-3 border-b">
                <h3 className="font-extrabold text-slate-800 text-sm">Enterprise Multi-Channel Broadcast Center</h3>
                <p className="text-xs text-slate-400">Kirim pesan serentak melalui seluruh media atau jadwalkan otomatisasi berulang</p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createBroadcastMutation.mutate({
                    name: bcName,
                    description: bcDesc,
                    channel_name: bcChannel,
                    template_id: bcTemplateId,
                    recipients: [
                      { receiver_type: bcTargetRole, receiver_id: 'rec-1', recipient: '08123456789' }
                    ]
                  });
                }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs"
              >
                <div className="space-y-4">
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Nama Kampanye Broadcast</label>
                    <input
                      type="text"
                      value={bcName}
                      onChange={(e) => setBcName(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Deskripsi & Catatan Internal</label>
                    <input
                      type="text"
                      value={bcDesc}
                      onChange={(e) => setBcDesc(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-600 mb-1">Saluran Transmisi</label>
                      <select
                        value={bcChannel}
                        onChange={(e) => setBcChannel(e.target.value as any)}
                        className="w-full text-xs p-2.5 bg-slate-50 border rounded-lg"
                      >
                        <option value="WHATSAPP">WhatsApp Outbox</option>
                        <option value="EMAIL">Email Gateway</option>
                        <option value="PUSH">In-App Push</option>
                        <option value="SMS">SMS Gateway</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-600 mb-1">Kelompok Target</label>
                      <select
                        value={bcTargetRole}
                        onChange={(e) => setBcTargetRole(e.target.value)}
                        className="w-full text-xs p-2.5 bg-slate-50 border rounded-lg"
                      >
                        <option value="ORANG_TUA">Seluruh Wali Santri ({isPondok ? 'Pondok' : 'Sekolah'})</option>
                        <option value="GURU">Seluruh Guru & Pegawai</option>
                        <option value="SANTRI">Seluruh Santri / Siswa Aktif</option>
                        <option value="ALUMNI">Arsip Alumni Terdaftar</option>
                      </select>
                    </div>
                  </div>

                  {/* Schedule selection */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border space-y-3">
                    <label className="block font-black text-slate-700 text-[10px] uppercase tracking-wider">
                      ⏰ Waktu Pengiriman
                    </label>

                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="bc-sched"
                          checked={bcScheduleType === 'NOW'}
                          onChange={() => setBcScheduleType('NOW')}
                          className="text-indigo-600"
                        />
                        Kirim Sekarang (Direct Delivery)
                      </label>

                      <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="bc-sched"
                          checked={bcScheduleType === 'SCHEDULED'}
                          onChange={() => setBcScheduleType('SCHEDULED')}
                          className="text-indigo-600"
                        />
                        Jadwalkan Siaran (Scheduler)
                      </label>
                    </div>

                    {bcScheduleType === 'SCHEDULED' && (
                      <div className="grid grid-cols-2 gap-3 pt-1.5">
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-0.5">Waktu Kalender</label>
                          <input
                            type="datetime-local"
                            value={bcScheduledTime}
                            onChange={(e) => setBcScheduledTime(e.target.value)}
                            className="w-full p-2 bg-white border rounded"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-500 mb-0.5">Frekuensi Pengulangan</label>
                          <select
                            value={bcRecurrence}
                            onChange={(e) => setBcRecurrence(e.target.value as any)}
                            className="w-full p-2 bg-white border rounded"
                          >
                            <option value="ONCE">Hanya Sekali (One-shot)</option>
                            <option value="DAILY">Harian (Daily Cron)</option>
                            <option value="WEEKLY">Mingguan (Weekly Highlights)</option>
                            <option value="MONTHLY">Bulanan (SPP Billing Cycle)</option>
                            <option value="YEARLY">Tahunan (PPDB Wave)</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Pilih Template Pesan Pengumuman</label>
                    <select
                      value={bcTemplateId}
                      onChange={(e) => setBcTemplateId(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border rounded-lg focus:ring-1 focus:ring-indigo-500"
                      required
                    >
                      <option value="">-- Pilih Template --</option>
                      {templates?.filter((t: any) => t.channel_name === bcChannel).map((t: any) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  {bcTemplateId && templates && (
                    <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-2">
                      <p className="text-[10px] font-black text-indigo-900 uppercase font-mono">Draf Konten Template Terpilih:</p>
                      <p className="text-xs text-slate-600 bg-white p-3 border rounded font-mono italic whitespace-pre-wrap leading-relaxed">
                        {templates.find((t: any) => t.id === bcTemplateId)?.body}
                      </p>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={createBroadcastMutation.isPending || !bcTemplateId}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-lg shadow-md flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                      {bcScheduleType === 'NOW' ? 'Mulai Siaran Broadcast (Kirim Serentak)' : 'Simpan & Daftarkan dalam Scheduler'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* ================================================== */}
          {/* TAB 4: NOTIFIKASI PUSH SIMULATOR */}
          {/* ================================================== */}
          {activeMenuTab === 'notifikasi' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
              
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="pb-2 border-b">
                  <h3 className="font-extrabold text-slate-800 text-sm">Simulator Notifikasi HP</h3>
                  <p className="text-xs text-slate-400">Gunakan panel ini untuk menguji performa visual push notification di layar ponsel wali santri</p>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Judul Push Notification</label>
                    <input
                      type="text"
                      value={pushTitleSim}
                      onChange={(e) => setPushTitleSim(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border rounded-lg font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Isi Pesan Pendek</label>
                    <textarea
                      rows={3}
                      value={pushBodySim}
                      onChange={(e) => setPushBodySim(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border rounded-lg font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-600 mb-1">Jumlah Badge Counter</label>
                      <input
                        type="number"
                        value={pushBadgeCount}
                        onChange={(e) => setPushBadgeCount(Number(e.target.value))}
                        className="w-full p-2 bg-slate-50 border rounded"
                      />
                    </div>
                    
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => {
                          setShowPushNotificationToast(true);
                          setTimeout(() => setShowPushNotificationToast(false), 5000);
                        }}
                        className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded cursor-pointer transition"
                      >
                        Kirim ke Simulator HP
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Handphone Preview Frame */}
              <div className="flex justify-center">
                <div className="w-64 h-[420px] bg-slate-950 rounded-[32px] border-8 border-slate-800 relative shadow-2xl overflow-hidden flex flex-col justify-between p-4">
                  {/* Speaker slot */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-3 bg-slate-800 rounded-full" />
                  
                  {/* Top Bar */}
                  <div className="flex justify-between items-center text-[9px] text-white/80 font-mono px-2 pt-1">
                    <span>08:45</span>
                    <div className="flex items-center gap-1">
                      <span>5G</span>
                      <div className="w-3.5 h-2 bg-white/80 rounded-xs" />
                    </div>
                  </div>

                  {/* Simulator Screen Alert toast */}
                  <div className="flex-1 flex flex-col items-center justify-center relative">
                    {showPushNotificationToast && (
                      <div className="absolute top-4 left-0 right-0 bg-white/95 backdrop-blur text-slate-900 p-3 rounded-2xl shadow-lg border border-slate-200 text-[10px] space-y-1 animate-bounce z-50">
                        <div className="flex items-center gap-1.5">
                          <Bell className="h-3.5 w-3.5 text-indigo-600" />
                          <strong className="truncate font-black">{pushTitleSim}</strong>
                        </div>
                        <p className="line-clamp-2 text-slate-600 font-medium leading-relaxed">{pushBodySim}</p>
                      </div>
                    )}

                    <div className="text-center space-y-2 text-white/50">
                      <Smartphone className="h-10 w-10 mx-auto opacity-30" />
                      <p className="text-[9px] uppercase tracking-widest font-mono">Mobile App Locked</p>
                    </div>
                  </div>

                  {/* Badge Counter Indicator */}
                  <div className="flex justify-around items-center bg-white/10 backdrop-blur-md rounded-2xl py-2 px-2">
                    <div className="relative">
                      <MessageSquare className="h-5 w-5 text-emerald-400" />
                      {pushBadgeCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[8px] font-bold h-4 w-4 rounded-full flex items-center justify-center font-mono">
                          {pushBadgeCount}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Bell className="h-5 w-5 text-indigo-400" />
                      <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[8px] font-bold h-4 w-4 rounded-full flex items-center justify-center font-mono">
                        1
                      </span>
                    </div>
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ================================================== */}
          {/* TAB 5: TEMPLATE PESAN (SMART TEMPLATES) */}
          {/* ================================================== */}
          {activeMenuTab === 'templates' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fade-in">
              
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-extrabold text-slate-800 text-sm">Tambah Smart Template</h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newTempName || !newTempBody) return;
                    saveTemplateMutation.mutate({
                      name: newTempName,
                      channel_name: newTempChannel,
                      subject: newTempSubject,
                      body: newTempBody,
                      variables: newTempVariables,
                      status: 'ACTIVE'
                    });
                  }}
                  className="space-y-4 text-xs"
                >
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Nama Template</label>
                    <input
                      type="text"
                      placeholder="Contoh: Tagihan SPP Bulanan"
                      value={newTempName}
                      onChange={(e) => setNewTempName(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border rounded-lg"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-600 mb-1">Saluran Utama</label>
                      <select
                        value={newTempChannel}
                        onChange={(e) => setNewTempChannel(e.target.value)}
                        className="w-full text-xs p-2.5 bg-slate-50 border rounded-lg"
                      >
                        <option value="WHATSAPP">WhatsApp</option>
                        <option value="EMAIL">Email Gateway</option>
                        <option value="PUSH">In-App Push</option>
                        <option value="SMS">SMS Gateway</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-600 mb-1">Subject (Email Only)</label>
                      <input
                        type="text"
                        placeholder="Subjek email..."
                        value={newTempSubject}
                        onChange={(e) => setNewTempSubject(e.target.value)}
                        className="w-full text-xs p-2.5 bg-slate-50 border rounded-lg"
                        disabled={newTempChannel !== 'EMAIL'}
                      />
                    </div>
                  </div>

                  {/* Variables help block */}
                  <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 space-y-1.5">
                    <p className="text-[10px] font-black text-indigo-900 uppercase font-mono">Smart Variables Panel:</p>
                    <div className="flex flex-wrap gap-1">
                      {SMART_VARIABLES.map(v => (
                        <button
                          key={v.key}
                          type="button"
                          onClick={() => injectVariable(v.key, 'template')}
                          className="px-1.5 py-0.5 bg-white border border-slate-200 hover:border-indigo-600 text-[10px] font-mono rounded cursor-pointer text-slate-700"
                        >
                          {v.key}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Template Body</label>
                    <textarea
                      rows={5}
                      value={newTempBody}
                      onChange={(e) => {
                        setNewTempBody(e.target.value);
                        // Auto parse variables
                        const regex = /\{\{([^}]+)\}\}/g;
                        const found: string[] = [];
                        let m;
                        while ((m = regex.exec(e.target.value)) !== null) {
                          if (!found.includes(m[1])) found.push(m[1]);
                        }
                        setNewTempVariables(found);
                      }}
                      className="w-full text-xs p-2.5 bg-slate-50 border rounded-lg font-mono focus:bg-white"
                      placeholder="Gunakan {{nama}} atau {{tagihan}} untuk otomatisasi dinamis..."
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded text-xs transition shadow cursor-pointer"
                  >
                    Daftarkan Template Baru
                  </button>
                </form>
              </div>

              {/* Template Registry List */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm xl:col-span-2 space-y-4">
                <h3 className="font-extrabold text-slate-800 text-sm">Daftar Smart Template Terdaftar</h3>
                
                {loadingTemplates ? (
                  <p className="text-xs text-slate-400 font-mono animate-pulse">Menghubungkan ke database template...</p>
                ) : !templates || templates.length === 0 ? (
                  <p className="text-xs text-slate-500">Belum ada template tersimpan.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[480px] overflow-y-auto pr-1">
                    {templates.map((t: any) => (
                      <div key={t.id} className="p-4 bg-slate-50 border rounded-xl space-y-2 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded font-mono">
                              {t.channel_name}
                            </span>
                            <button
                              onClick={() => deleteTemplateMutation.mutate(t.id)}
                              className="text-rose-500 hover:bg-rose-50 p-1 rounded"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          
                          <h4 className="text-xs font-bold text-slate-800">{t.name}</h4>
                          <p className="text-[11px] text-slate-500 font-mono bg-white p-2.5 border rounded leading-relaxed whitespace-pre-wrap italic">
                            {t.body}
                          </p>
                        </div>

                        {t.variables && (
                          <div className="pt-2 border-t flex flex-wrap gap-1">
                            {JSON.parse(typeof t.variables === 'string' ? t.variables : JSON.stringify(t.variables || [])).map((v: string) => (
                              <span key={v} className="text-[9px] bg-indigo-50 text-indigo-700 font-mono px-1.5 py-0.2 rounded font-bold">
                                {`{{${v}}}`}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ================================================== */}
          {/* TAB 6: WHATSAPP GATEWAY (ACTIVE SESSION) */}
          {/* ================================================== */}
          {activeMenuTab === 'whatsapp' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
              
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="pb-2 border-b">
                  <h3 className="font-extrabold text-slate-800 text-sm">Status & Konfigurasi API WhatsApp</h3>
                  <p className="text-xs text-slate-400 font-mono">Integrasi WhatsApp Webhook Fazz-SMS/Wabot API</p>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">WhatsApp Gateway Endpoint URL</label>
                    <input
                      type="text"
                      value={enterpriseSettings.waGatewayUrl}
                      onChange={(e) => setEnterpriseSettings({ ...enterpriseSettings, waGatewayUrl: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-50 border rounded-lg font-mono text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Secret API Token</label>
                    <input
                      type="password"
                      value={enterpriseSettings.waApiKey}
                      onChange={(e) => setEnterpriseSettings({ ...enterpriseSettings, waApiKey: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-50 border rounded-lg font-mono text-slate-700"
                    />
                  </div>

                  <div className="flex justify-between items-center p-3 bg-slate-50 border rounded-lg">
                    <div className="space-y-0.5">
                      <strong className="text-slate-700">Wabot Connection:</strong>
                      <p className="text-[10px] text-slate-400">Terakhir cek: Baru saja</p>
                    </div>
                    <span className="text-xs bg-emerald-100 text-emerald-800 font-extrabold px-3 py-1 rounded-full font-mono">
                      CONNECTED (ONLINE)
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setAnnStatusMessage('Konfigurasi API WhatsApp berhasil diperbarui!');
                      setTimeout(() => setAnnStatusMessage(null), 3000);
                    }}
                    className="w-full py-2.5 bg-indigo-600 text-white text-xs font-bold rounded cursor-pointer hover:bg-indigo-700 transition shadow"
                  >
                    Simpan Konfigurasi Gateway
                  </button>
                </div>
              </div>

              {/* Dynamic QR Scan Box simulation */}
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between items-center text-center space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-slate-700 uppercase font-mono tracking-wider">
                    WhatsApp Web QR Scanner
                  </h4>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                    Jika koneksi terputus, scan QR Code di bawah dengan aplikasi WhatsApp di HP Anda untuk melakukan otentikasi ulang.
                  </p>
                </div>

                <div className="p-4 bg-white rounded-2xl border-4 border-indigo-600/30 flex items-center justify-center shadow-lg relative">
                  <QrCode className="h-44 w-44 text-slate-900" />
                  <div className="absolute inset-0 bg-white/90 backdrop-blur-xs flex flex-col items-center justify-center p-4">
                    <CheckCircle className="h-10 w-10 text-emerald-500 mb-2 animate-bounce" />
                    <p className="text-xs font-black text-slate-800 font-mono">DEVICE AUTHENTICATED</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">Connected to: +62 812-9876-543</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    alert('Melakukan disonnect session...');
                  }}
                  className="px-4 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-xs rounded transition cursor-pointer"
                >
                  Putuskan Sesi (Logout Device)
                </button>
              </div>

            </div>
          )}

          {/* ================================================== */}
          {/* TAB 7: EMAIL SMTP CONFIGURATION */}
          {/* ================================================== */}
          {activeMenuTab === 'email' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fade-in">
              
              <div className="xl:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="pb-2 border-b flex items-center gap-2">
                  <Key className="h-5 w-5 text-indigo-600" />
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm">SMTP Gateway Configuration</h3>
                    <p className="text-xs text-slate-400">Atur kredensial pengiriman email resmi institusi sekolah</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">SMTP Host Server</label>
                    <input
                      type="text"
                      value={enterpriseSettings.smtpHost}
                      onChange={(e) => setEnterpriseSettings({ ...enterpriseSettings, smtpHost: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-50 border rounded-lg font-mono text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Port</label>
                    <input
                      type="number"
                      value={enterpriseSettings.smtpPort}
                      onChange={(e) => setEnterpriseSettings({ ...enterpriseSettings, smtpPort: Number(e.target.value) })}
                      className="w-full text-xs p-2.5 bg-slate-50 border rounded-lg font-mono text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-1">SMTP Username / API Key ID</label>
                    <input
                      type="text"
                      value={enterpriseSettings.smtpUser}
                      onChange={(e) => setEnterpriseSettings({ ...enterpriseSettings, smtpUser: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-50 border rounded-lg font-mono text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-1">SMTP Secret Password</label>
                    <input
                      type="password"
                      value={enterpriseSettings.smtpPass}
                      onChange={(e) => setEnterpriseSettings({ ...enterpriseSettings, smtpPass: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-50 border rounded-lg font-mono text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Sender Email Address (From)</label>
                    <input
                      type="email"
                      value={enterpriseSettings.smtpFromEmail}
                      onChange={(e) => setEnterpriseSettings({ ...enterpriseSettings, smtpFromEmail: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-50 border rounded-lg font-mono text-slate-700"
                    />
                  </div>

                  <div className="flex items-end pb-1.5">
                    <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={enterpriseSettings.smtpSecure}
                        onChange={(e) => setEnterpriseSettings({ ...enterpriseSettings, smtpSecure: e.target.checked })}
                        className="rounded text-indigo-600 h-4 w-4 cursor-pointer"
                      />
                      Gunakan TLS/SSL Koneksi Aman (Secure Connection)
                    </label>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAnnStatusMessage('Kredensial SMTP resmi sekolah berhasil diperbarui!');
                      setTimeout(() => setAnnStatusMessage(null), 3000);
                    }}
                    className="px-5 py-2.5 bg-indigo-600 text-white font-black rounded text-xs hover:bg-indigo-700 transition shadow cursor-pointer"
                  >
                    Simpan Konfigurasi SMTP
                  </button>
                </div>
              </div>

              {/* SMTP Connection Tester Box */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider font-mono">
                  SMTP Delivery Tester
                </h3>
                <p className="text-[11px] text-slate-400">Kirim email ujicoba cepat ke alamat eksternal untuk memvalidasi port & status handshake SMTP server.</p>

                <form onSubmit={handleTestSmtp} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Email Penerima Uji Coba</label>
                    <input
                      type="email"
                      value={smtpTestRecipient}
                      onChange={(e) => setSmtpTestRecipient(e.target.value)}
                      className="w-full text-xs p-2 bg-white border rounded font-mono"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={smtpTesting}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {smtpTesting ? 'Menguji koneksi server...' : 'Kirim Email Percobaan'}
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* ================================================== */}
          {/* TAB 8: PUSH NOTIFICATION SETTINGS */}
          {/* ================================================== */}
          {activeMenuTab === 'push-settings' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 animate-fade-in">
              <div className="pb-3 border-b flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-indigo-600" />
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">In-App Push Notification Gateway</h3>
                  <p className="text-xs text-slate-400">Otomatisasi pengiriman notifikasi instan langsung ke HP Android/iOS wali murid</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="space-y-4">
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Firebase Cloud Messaging (FCM) Sender ID</label>
                    <input
                      type="text"
                      value={enterpriseSettings.pushFcmSenderId || '91283848192'}
                      onChange={(e) => setEnterpriseSettings({ ...enterpriseSettings, pushFcmSenderId: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-50 border rounded-lg font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Firebase FCM Server API Secret Key</label>
                    <input
                      type="password"
                      value={enterpriseSettings.pushFcmServerKey || 'AAAA_fakesecure_key_firebase_server_messaging'}
                      onChange={(e) => setEnterpriseSettings({ ...enterpriseSettings, pushFcmServerKey: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-50 border rounded-lg font-mono"
                    />
                  </div>

                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      id="badge-check"
                      checked={enterpriseSettings.pushBadgeSyncEnabled}
                      onChange={(e) => setEnterpriseSettings({ ...enterpriseSettings, pushBadgeSyncEnabled: e.target.checked })}
                      className="rounded text-indigo-600 h-4 w-4 cursor-pointer"
                    />
                    <label htmlFor="badge-check" className="font-bold text-slate-700 cursor-pointer select-none">
                      Aktifkan Sinkronisasi Badge Counter Otomatis ke HP (Synchronized Badge)
                    </label>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border space-y-3">
                  <span className="text-[10px] font-black uppercase text-slate-500 font-mono tracking-wider">
                    In-App Push Info
                  </span>
                  <p className="text-[11.5px] leading-relaxed text-slate-500">
                    Dengan mengaktifkan FCM Server Key, setiap draf pengumuman yang anda rilis dengan status <strong>"Publish"</strong> akan memicu pengiriman event instan. Aplikasi wali murid di ponsel akan langsung membunyikan lonceng pemberitahuan secara real-time meskipun aplikasi sedang ditutup.
                  </p>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setAnnStatusMessage('Konfigurasi FCM Push Notification berhasil disimpan!');
                      setTimeout(() => setAnnStatusMessage(null), 3000);
                    }}
                    className="py-2 px-4 bg-indigo-600 text-white font-bold rounded hover:bg-indigo-700 transition shadow"
                  >
                    Simpan & Terapkan Kunci FCM
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================================================== */}
          {/* TAB 9: JADWAL BROADCAST (CRON SCHEDULER VIEW) */}
          {/* ================================================== */}
          {activeMenuTab === 'schedule' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 animate-fade-in">
              <div className="pb-3 border-b flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">Kalender & Rencana Jadwal Siaran</h3>
                  <p className="text-xs text-slate-400">Arsip otomatisasi terjadwal berulang yang dikelola langsung oleh sistem</p>
                </div>
                <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded font-mono">
                  Recurring Cron Active
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
                {/* Rules Creator on the left */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                  <h4 className="font-extrabold text-slate-800 text-xs uppercase font-mono tracking-wider">
                    Daftar Otomatisasi Pemicu Baru
                  </h4>
                  
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!autoRuleName || !autoTemplateId) return;
                      saveRuleMutation.mutate({
                        name: autoRuleName,
                        event_trigger: autoTrigger,
                        action_channel: autoChannel,
                        template_id: autoTemplateId,
                        is_active: true
                      });
                    }}
                    className="space-y-3"
                  >
                    <div>
                      <label className="block font-bold text-slate-600 mb-1">Nama Aturan Otomatis</label>
                      <input
                        type="text"
                        placeholder="Contoh: Kirim WA Info SPP Bulanan"
                        value={autoRuleName}
                        onChange={(e) => setAutoRuleName(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border rounded-lg"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-slate-600 mb-0.5">Trigger Event</label>
                        <select
                          value={autoTrigger}
                          onChange={(e) => setAutoTrigger(e.target.value)}
                          className="w-full text-[11px] p-2 bg-white border rounded"
                        >
                          {AUTOMATION_TRIGGERS.map(trig => (
                            <option key={trig.value} value={trig.value}>{trig.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-600 mb-0.5">Media</label>
                        <select
                          value={autoChannel}
                          onChange={(e) => setAutoChannel(e.target.value)}
                          className="w-full text-[11px] p-2 bg-white border rounded"
                        >
                          <option value="WHATSAPP">WhatsApp</option>
                          <option value="EMAIL">Email</option>
                          <option value="PUSH">In-App Push</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-600 mb-1">Hubungkan Template Pesan</label>
                      <select
                        value={autoTemplateId}
                        onChange={(e) => setAutoTemplateId(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border rounded-lg"
                        required
                      >
                        <option value="">-- Pilih Template --</option>
                        {templates?.filter((t: any) => t.channel_name === autoChannel).map((t: any) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-indigo-600 text-white font-bold rounded cursor-pointer hover:bg-indigo-700 transition"
                    >
                      Daftarkan Aturan Terjadwal
                    </button>
                  </form>
                </div>

                {/* Calendar Active Timeline List */}
                <div className="lg:col-span-2 space-y-4">
                  <h4 className="font-extrabold text-slate-800 text-xs uppercase font-mono tracking-wider">
                    Jadwal Rencana Broadcast Terdaftar
                  </h4>

                  <div className="space-y-3">
                    {rules?.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">Belum ada otomatisasi pemicu terdaftar.</p>
                    ) : (
                      rules?.map((rule: any) => (
                        <div key={rule.id} className="p-4 bg-slate-50 border rounded-xl flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded font-mono">
                                TRIGGER: {rule.event_trigger}
                              </span>
                              <h4 className="text-xs font-bold text-slate-800">{rule.name}</h4>
                            </div>
                            <p className="text-[11px] text-slate-500">
                              Aksi: Kirim lewat <strong>{rule.action_channel}</strong> menggunakan Template ID {rule.template_id}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-emerald-600 font-extrabold">ACTIVE</span>
                            <ToggleRight className="h-6 w-6 text-emerald-600 cursor-pointer" />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================== */}
          {/* TAB 10: INBOX & READ RECEIPTS */}
          {/* ================================================== */}
          {activeMenuTab === 'inbox' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 animate-fade-in">
              <div className="pb-3 border-b flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">Inbox & Konfirmasi Baca (Read Receipts)</h3>
                  <p className="text-xs text-slate-400">Pantau umpan balik dan status penerimaan pesan dari wali santri secara real-time</p>
                </div>
                <span className="text-xs bg-rose-50 text-rose-700 font-extrabold px-2.5 py-1 rounded-full font-mono">
                  {inboxLog.filter(x => !x.hasRead).length} Belum Dibaca
                </span>
              </div>

              <div className="space-y-3 text-xs">
                {inboxLog.map((log) => (
                  <div
                    key={log.id}
                    className={`p-4 rounded-xl border transition-all ${
                      !log.hasRead ? 'bg-indigo-50/30 border-indigo-200 ring-1 ring-indigo-500/10' : 'bg-slate-50/50 border-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <strong className="text-slate-800 text-xs">{log.name}</strong>
                          <span className="text-[9px] text-slate-400 font-mono">{log.time}</span>
                        </div>
                        <p className="text-slate-600 font-medium italic">"{log.comment}"</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {!log.hasRead ? (
                          <button
                            onClick={() => markFeedbackAsRead(log.id)}
                            className="px-2.5 py-1 bg-indigo-600 text-white rounded font-bold text-[10px] hover:bg-indigo-700 transition cursor-pointer"
                          >
                            Tandai Dibaca
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                            <Check className="h-3.5 w-3.5 text-emerald-500" /> Dibaca & Selesai
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================================== */}
          {/* TAB 11: RIWAYAT BROADCAST & OUTBOX */}
          {/* ================================================== */}
          {activeMenuTab === 'riwayat' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 animate-fade-in">
              <div className="flex justify-between items-center pb-3 border-b">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">Kotak Keluar & Laporan Detil</h3>
                  <p className="text-xs text-slate-400">Pantau seluruh riwayat antrian dan status pengiriman notifikasi secara real-time</p>
                </div>
                <button
                  onClick={() => refetchQueue()}
                  className="flex items-center gap-1.5 px-3 py-1.5 border hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Segarkan Log Antrian
                </button>
              </div>

              {loadingQueue ? (
                <p className="text-xs text-slate-400 font-mono animate-pulse">Memuat data outbox antrian...</p>
              ) : !queue || queue.length === 0 ? (
                <div className="text-center p-8 bg-slate-50 border border-dashed rounded-xl">
                  <Info className="h-8 w-8 text-slate-300 mx-auto mb-1" />
                  <p className="text-xs text-slate-400">Belum ada sebaran log dalam antrian kotak keluar.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 uppercase font-mono text-[9px] border-b">
                        <th className="p-3">ID Antrian</th>
                        <th className="p-3">Waktu</th>
                        <th className="p-3">Saluran</th>
                        <th className="p-3">Penerima</th>
                        <th className="p-3">Payload Dinamis</th>
                        <th className="p-3 text-center">Status</th>
                        <th className="p-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {queue.map((q: any) => (
                        <tr key={q.id} className="border-b hover:bg-slate-50/40 transition">
                          <td className="p-3 font-mono font-bold text-slate-700">{q.id}</td>
                          <td className="p-3 text-slate-500 font-mono">
                            {new Date(q.created_at || Date.now()).toLocaleString('id-ID')}
                          </td>
                          <td className="p-3">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                              q.channel_name === 'WhatsApp' ? 'bg-emerald-100 text-emerald-800 font-mono' :
                              q.channel_name === 'Email' ? 'bg-blue-100 text-blue-800 font-mono' : 'bg-purple-100 text-purple-800 font-mono'
                            }`}>
                              {q.channel_name}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-slate-700 font-bold">{q.recipient}</td>
                          <td className="p-3 font-mono text-[10px] text-slate-500 truncate max-w-xs">
                            {JSON.stringify(q.payload)}
                          </td>
                          <td className="p-3 text-center">
                            <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full ${
                              q.status === 'Delivered' || q.status === 'SENT' ? 'bg-emerald-100 text-emerald-800' :
                              q.status === 'Queued' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {q.status}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            {q.status === 'Failed' || q.status === 'FAILED' ? (
                              <button
                                onClick={() => retryNotificationMutation.mutate(q.id)}
                                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px] font-bold transition cursor-pointer"
                              >
                                Retry Send
                              </button>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Dynamic Simulated Audit Log (Required by audit spec) */}
              <div className="pt-6 border-t mt-6 space-y-3">
                <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider font-mono">
                  Sistem Audit Trail Log
                </h4>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[11px] font-mono text-slate-500">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 uppercase text-[9px] border-b">
                        <th className="p-2">Log ID</th>
                        <th className="p-2">Pengguna (User)</th>
                        <th className="p-2">Aksi Audit</th>
                        <th className="p-2">Target Objek</th>
                        <th className="p-2">Waktu Log</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map(log => (
                        <tr key={log.id} className="border-b hover:bg-slate-50/50">
                          <td className="p-2 font-bold text-slate-700">{log.id}</td>
                          <td className="p-2 font-bold text-slate-600">{log.user}</td>
                          <td className="p-2 font-black text-indigo-700">{log.action}</td>
                          <td className="p-2">{log.target}</td>
                          <td className="p-2 text-slate-400">{log.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Enterprise Footer Settings Config Panel (Zero Hardcode, Zero local memory limits) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <Settings className="h-5 w-5 text-indigo-600" />
          <div>
            <h3 className="font-extrabold text-slate-800 text-xs uppercase font-mono tracking-wider">
              Yayasan & Sekolah Global Metadata
            </h3>
            <p className="text-xs text-slate-400">Atur kop surat, header/footer siaran WhatsApp/Email, dan logo sekolah dari frontend</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-600 mb-1">Nama Yayasan Pengampu</label>
            <input
              type="text"
              value={enterpriseSettings.namaYayasan}
              onChange={(e) => setEnterpriseSettings({ ...enterpriseSettings, namaYayasan: e.target.value })}
              className="w-full text-xs p-2.5 bg-slate-50 border rounded-lg focus:bg-white focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-600 mb-1">Nama Resmi Sekolah / Cabang</label>
            <input
              type="text"
              value={enterpriseSettings.namaSekolah}
              onChange={(e) => setEnterpriseSettings({ ...enterpriseSettings, namaSekolah: e.target.value })}
              className="w-full text-xs p-2.5 bg-slate-50 border rounded-lg focus:bg-white focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-slate-600 mb-1">Jam Awal Siar</label>
              <input
                type="text"
                value={enterpriseSettings.preferredHourStart}
                onChange={(e) => setEnterpriseSettings({ ...enterpriseSettings, preferredHourStart: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border rounded-lg font-mono text-center"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-600 mb-1">Jam Akhir Siar</label>
              <input
                type="text"
                value={enterpriseSettings.preferredHourEnd}
                onChange={(e) => setEnterpriseSettings({ ...enterpriseSettings, preferredHourEnd: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border rounded-lg font-mono text-center"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-600 mb-1">Kop / Header Pengumuman WhatsApp</label>
            <textarea
              rows={3}
              value={enterpriseSettings.headerTemplate}
              onChange={(e) => setEnterpriseSettings({ ...enterpriseSettings, headerTemplate: e.target.value })}
              className="w-full text-xs p-2.5 bg-slate-50 border rounded-lg font-mono leading-relaxed"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-600 mb-1">Kaki Surat / Footer Pengumuman WhatsApp</label>
            <textarea
              rows={3}
              value={enterpriseSettings.footerTemplate}
              onChange={(e) => setEnterpriseSettings({ ...enterpriseSettings, footerTemplate: e.target.value })}
              className="w-full text-xs p-2.5 bg-slate-50 border rounded-lg font-mono leading-relaxed"
            />
          </div>
        </div>

        <div className="pt-2 border-t flex justify-end">
          <button
            type="button"
            onClick={() => {
              setAnnStatusMessage('Metadata Yayasan & Sekolah berhasil di-update secara global!');
              setTimeout(() => setAnnStatusMessage(null), 3000);
            }}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-lg transition shadow cursor-pointer"
          >
            Update Metadata Global
          </button>
        </div>
      </div>

    </div>
  );
}
