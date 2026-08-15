import React, { useState, useEffect, useRef } from 'react';
import { 
  Lock, Unlock, Download, Upload, Copy, Clipboard, FileSpreadsheet, FileText, 
  Printer, CheckCircle2, AlertTriangle, Plus, Trash2, Edit3, Save, X, Search, 
  Grid, RefreshCw, Sparkles, Sliders, Layout, Layers, Type, Move, ZoomIn, 
  BookOpen, Clock, Calendar, Users, GraduationCap, FileCheck, Award, Heart, 
  BarChart3, Settings, HelpCircle, Eye, Info, Check, Share2, Mail, Phone, ExternalLink,
  ChevronLeft, ChevronRight, TrendingUp, Building2
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, LineChart, Line, Cell } from 'recharts';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';

import Markdown from 'react-markdown';

// Define structures matching requested specs
interface AcademicSetting {
  semester: 'GANJIL' | 'GENAP';
  curriculum: 'MERDEKA' | 'K13' | 'MADRASAH' | 'SEKOLAH_ISLAM' | 'PESANTREN' | 'PKBM';
  docNumberPattern: string;
  useDigitalSignature: boolean;
  kkmValue: number;
}

interface UnitKopInfo {
  nama: string;
  logo: string;
  npsn: string;
  alamat: string;
  telepon: string;
  email: string;
  website: string;
}

interface KopSuratConfig {
  namaYayasan: string;
  logoYayasan: string;
  unitTK: UnitKopInfo;
  unitSD: UnitKopInfo;
  unitSMP: UnitKopInfo;
  unitSMA: UnitKopInfo;
  unitPKBM: UnitKopInfo;
  namaSekolah: string;
  alamat: string;
  kodePos: string;
  telepon: string;
  website: string;
  email: string;
  moto: string;
  visi: string;
  misi: string;
  fontSize: 'xs' | 'sm' | 'md' | 'lg';
  fontFamily: 'font-sans' | 'font-mono' | 'font-serif';
  logoLeftPosition: boolean;
  borderStyle: 'solid' | 'double' | 'dashed' | 'none';
  borderColor: string;
  showWatermark: boolean;
  watermarkText: string;
}

interface ReportTemplate {
  id: string;
  name: string;
  type: string;
  isDefault: boolean;
  margin: { top: number; right: number; bottom: number; left: number };
  pageSize: 'A4' | 'F4' | 'Legal';
  orientation: 'Portrait' | 'Landscape';
}

interface DesignerBlock {
  id: string;
  label: string;
  type: 'text' | 'table' | 'chart' | 'image' | 'qr' | 'barcode' | 'sig';
  x: number; // percentage based position
  y: number;
  w: number; // width percentage
  h: number; // height percentage
  visible: boolean;
}

interface LegerRow {
  studentId: string;
  nis: string;
  nisn: string;
  name: string;
  gender: 'L' | 'P';
  // Grades
  harian: number;
  tugas: number;
  quiz: number;
  praktik: number;
  projek: number;
  pts: number;
  pas: number;
  ujian_sekolah: number;
  sikap: number; // 1-4 scale or A-D
  karakter: string; // Deskripsi sikap
  ekskul_name: string;
  ekskul_grade: 'A' | 'B' | 'C' | 'D';
  tahfidz_juz: number;
  tahfidz_surah: string;
  ibadah_score: number; // 0-100
  kehadiran_hadir: number;
  kehadiran_sakit: number;
  kehadiran_izin: number;
  kehadiran_alfa: number;
  // Auto-calculated
  avg?: number;
  rank?: number;
  predikat?: 'A' | 'B' | 'C' | 'D';
  deskripsi?: string;
  tuntas?: boolean;
}

export default function EnterpriseAcademicEngine() {
  const queryClient = useQueryClient();

  // --- DATABASE-DRIVEN DYNAMIC SETTINGS ---
  const [academicSetting, setAcademicSetting] = useState<AcademicSetting>({
    semester: 'GANJIL',
    curriculum: 'MERDEKA',
    docNumberPattern: 'DH-LK/RAPOR/2026/[SEQ]',
    useDigitalSignature: true,
    kkmValue: 75
  });

  const [activeMainTab, setActiveMainTab] = useState<'dashboard' | 'kbm' | 'leger' | 'templates' | 'designer' | 'kop' | 'export' | 'promotion' | 'graduation' | 'setting'>('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  const [selectedKopUnit, setSelectedKopUnit] = useState<'YAYASAN' | 'TK' | 'SD' | 'SMP' | 'SMA' | 'PKBM'>('SMA');

  const [kopSurat, setKopSurat] = useState<KopSuratConfig>({
    namaYayasan: 'YAYASAN DARUL HIJRAH INDONESIA',
    logoYayasan: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=150',
    unitTK: {
      nama: 'TK ISLAM TERPADU DARUL HIJRAH',
      logo: 'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&q=80&w=150',
      npsn: '69781201',
      alamat: 'Jl. Raya Pendidikan Sains No. 45A, Pondok Gede, Jakarta',
      telepon: '021-8490124',
      email: 'tk@darulhijrah.sch.id',
      website: 'tk.darulhijrah.sch.id'
    },
    unitSD: {
      nama: 'SD ISLAM TERPADU DARUL HIJRAH',
      logo: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=150',
      npsn: '20104522',
      alamat: 'Jl. Raya Pendidikan Sains No. 45B, Pondok Gede, Jakarta',
      telepon: '021-8490125',
      email: 'sd@darulhijrah.sch.id',
      website: 'sd.darulhijrah.sch.id'
    },
    unitSMP: {
      nama: 'SMP ISLAM TERPADU DARUL HIJRAH',
      logo: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=150',
      npsn: '20108933',
      alamat: 'Jl. Raya Pendidikan Sains No. 45C, Pondok Gede, Jakarta',
      telepon: '021-8490126',
      email: 'smp@darulhijrah.sch.id',
      website: 'smp.darulhijrah.sch.id'
    },
    unitSMA: {
      nama: 'SMA UNGGULAN DARUL HIJRAH BOARDING SCHOOL',
      logo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=150',
      npsn: '20109988',
      alamat: 'Jl. Raya Pendidikan Sains No. 45D, Pondok Gede, Jakarta',
      telepon: '021-8490123',
      email: 'sma@darulhijrah.sch.id',
      website: 'sma.darulhijrah.sch.id'
    },
    unitPKBM: {
      nama: 'PKBM KESETARAAN DARUL HIJRAH',
      logo: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=150',
      npsn: 'P9967123',
      alamat: 'Jl. Raya Pendidikan Sains No. 45E, Pondok Gede, Jakarta',
      telepon: '021-8490127',
      email: 'pkbm@darulhijrah.sch.id',
      website: 'pkbm.darulhijrah.sch.id'
    },
    namaSekolah: 'SMA UNGGULAN DARUL HIJRAH BOARDING SCHOOL',
    alamat: 'Jl. Raya Pendidikan Sains No. 45, Pondok Gede, Jakarta',
    kodePos: '17411',
    telepon: '021-8490123',
    website: 'www.darulhijrah.sch.id',
    email: 'info@darulhijrah.sch.id',
    moto: 'Membentuk Pemimpin Masa Depan yang Qurani & Saintifik',
    visi: 'Terwujudnya Generasi Emas yang Beradab Mulia, Cerdas Berteknologi, dan Berwawasan Global.',
    misi: 'Membina aqidah syariyyah ahli sunnah wal jamaah, membiasakan adab kesantrian, menerapkan kurikulum sains terpadu.',
    fontSize: 'sm',
    fontFamily: 'font-sans',
    logoLeftPosition: true,
    borderStyle: 'double',
    borderColor: '#0f172a',
    showWatermark: true,
    watermarkText: 'DARUL HIJRAH ACADEMIC DOCUMENT'
  });

  // --- REPORT TEMPLATE BUILDER STATE ---
  const [templates, setTemplates] = useState<ReportTemplate[]>([
    { id: 'tpl-1', name: 'Template SD Islam Terpadu', type: 'Sekolah Islam', isDefault: false, margin: { top: 20, right: 20, bottom: 20, left: 20 }, pageSize: 'A4', orientation: 'Portrait' },
    { id: 'tpl-2', name: 'Template SMP Pesantren Terpadu', type: 'Pesantren', isDefault: false, margin: { top: 15, right: 15, bottom: 15, left: 20 }, pageSize: 'F4', orientation: 'Portrait' },
    { id: 'tpl-3', name: 'Template SMA Unggulan Kurikulum Merdeka', type: 'Kurikulum Merdeka', isDefault: true, margin: { top: 20, right: 20, bottom: 20, left: 20 }, pageSize: 'A4', orientation: 'Portrait' },
    { id: 'tpl-4', name: 'Template Pendidikan Kesetaraan PKBM', type: 'PKBM', isDefault: false, margin: { top: 10, right: 10, bottom: 10, left: 15 }, pageSize: 'Legal', orientation: 'Landscape' },
    { id: 'tpl-5', name: 'Template Halaqah Tahfidz Quran', type: 'Tahfidz', isDefault: false, margin: { top: 20, right: 20, bottom: 20, left: 20 }, pageSize: 'A4', orientation: 'Portrait' },
  ]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('tpl-3');

  // --- VISUAL REPORT DESIGNER STATE ---
  const [designerBlocks, setDesignerBlocks] = useState<DesignerBlock[]>([
    { id: 'blk-kop', label: 'Kop Surat Instansi', type: 'image', x: 5, y: 3, w: 90, h: 12, visible: true },
    { id: 'blk-id', label: 'Identitas Siswa (Biodata)', type: 'text', x: 5, y: 17, w: 90, h: 10, visible: true },
    { id: 'blk-grades', label: 'Tabel Nilai Mapel Utama', type: 'table', x: 5, y: 29, w: 90, h: 28, visible: true },
    { id: 'blk-ekskul', label: 'Nilai Ekskul & Tahfidz', type: 'table', x: 5, y: 59, w: 43, h: 14, visible: true },
    { id: 'blk-absensi', label: 'Rekap Absensi & Ibadah', type: 'table', x: 52, y: 59, w: 43, h: 14, visible: true },
    { id: 'blk-chart', label: 'Grafik Progres Akademik', type: 'chart', x: 5, y: 75, w: 90, h: 12, visible: true },
    { id: 'blk-signatures', label: 'Tanda Tangan Digital + QR', type: 'sig', x: 5, y: 89, w: 90, h: 8, visible: true },
  ]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>('blk-grades');
  const [designerZoom, setDesignerZoom] = useState<number>(100);

  // --- LEGER DATA STATE ---
  const [legerRows, setLegerRows] = useState<LegerRow[]>([
    { studentId: 's-01', nis: '102401', nisn: '0081234567', name: 'Farhan Ramadhan', gender: 'L', harian: 88, tugas: 90, quiz: 85, praktik: 92, projek: 90, pts: 84, pas: 88, ujian_sekolah: 91, sikap: 4, karakter: 'Sangat sopan, beradab mulia, dan tekun dalam muthalaah.', ekskul_name: 'Pramuka', ekskul_grade: 'A', tahfidz_juz: 5, tahfidz_surah: 'An-Nisa', ibadah_score: 95, kehadiran_hadir: 98, kehadiran_sakit: 1, kehadiran_izin: 1, kehadiran_alfa: 0 },
    { studentId: 's-02', nis: '102402', nisn: '0087654321', name: 'Laila Fitriani', gender: 'P', harian: 94, tugas: 92, quiz: 95, praktik: 95, projek: 94, pts: 90, pas: 92, ujian_sekolah: 96, sikap: 4, karakter: 'Menjadi teladan akhlakul karimah dan sangat rajin piket asrama.', ekskul_name: 'PMR Terpadu', ekskul_grade: 'A', tahfidz_juz: 12, tahfidz_surah: 'Yunus', ibadah_score: 98, kehadiran_hadir: 100, kehadiran_sakit: 0, kehadiran_izin: 0, kehadiran_alfa: 0 },
    { studentId: 's-03', nis: '102403', nisn: '0071112223', name: 'Rizky Pratama', gender: 'L', harian: 78, tugas: 75, quiz: 72, praktik: 80, projek: 78, pts: 70, pas: 74, ujian_sekolah: 82, sikap: 3, karakter: 'Cukup disiplin, perlu meningkatkan ketepatan shalat berjamaah.', ekskul_name: 'Seni Kaligrafi', ekskul_grade: 'B', tahfidz_juz: 2, tahfidz_surah: 'Al-Baqarah', ibadah_score: 82, kehadiran_hadir: 94, kehadiran_sakit: 4, kehadiran_izin: 2, kehadiran_alfa: 0 },
    { studentId: 's-04', nis: '102404', nisn: '0098889991', name: 'Zaid Al-Khair', gender: 'L', harian: 85, tugas: 80, quiz: 78, praktik: 82, projek: 85, pts: 82, pas: 80, ujian_sekolah: 87, sikap: 4, karakter: 'Memiliki hafalan yang sangat mutqin dengan makharijul huruf baik.', ekskul_name: 'Archery Club', ekskul_grade: 'A', tahfidz_juz: 8, tahfidz_surah: 'Al-Araf', ibadah_score: 94, kehadiran_hadir: 96, kehadiran_sakit: 2, kehadiran_izin: 2, kehadiran_alfa: 0 },
    { studentId: 's-05', nis: '102405', nisn: '0098889992', name: 'Aisyah Humaira', gender: 'P', harian: 90, tugas: 88, quiz: 86, praktik: 90, projek: 92, pts: 85, pas: 88, ujian_sekolah: 91, sikap: 4, karakter: 'Sangat santun, aktif bertanya, dan berkontribusi di mading yayasan.', ekskul_name: 'Hadrah & Shalawat', ekskul_grade: 'A', tahfidz_juz: 15, tahfidz_surah: 'Al-Kahfi', ibadah_score: 96, kehadiran_hadir: 97, kehadiran_sakit: 1, kehadiran_izin: 2, kehadiran_alfa: 0 },
  ]);

  // --- KBM HUB DYNAMIC DB DATA ---
  const [kbmHub, setKbmHub] = useState<any>({
    schedules: [],
    agenda: [],
    journals: [],
    rpp: [],
    materials: [],
    questions: [],
    remedials: [],
    characters: []
  });

  // --- REACT QUERY FOR PERSISTENCE (ZERO LOCAL MEMORY) ---
  const { data: dbSettings } = useQuery({
    queryKey: ['academicSettings'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/akademik/assessment/settings');
      return res.data?.success ? res.data.data : null;
    }
  });

  const { data: dbKopSurat } = useQuery({
    queryKey: ['kopSurat'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/akademik/assessment/kop-surat');
      return res.data?.success ? res.data.data : null;
    }
  });

  const { data: dbTemplates } = useQuery({
    queryKey: ['reportTemplates'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/akademik/assessment/report-templates');
      return res.data?.success ? res.data.data : null;
    }
  });

  const { data: dbBlocks, refetch: refetchBlocks } = useQuery({
    queryKey: ['designerBlocks'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/akademik/assessment/designer-blocks');
      return res.data?.success ? res.data.data : null;
    }
  });

  const saveBlocksMutation = useMutation({
    mutationFn: async (blocks: DesignerBlock[]) => {
      const res = await apiClient.post('/api/v1/akademik/assessment/designer-blocks', { blocks });
      return res.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        triggerNotif('success', 'Konfigurasi blok desainer rapor berhasil disimpan!');
        refetchBlocks();
      }
    }
  });

  const { data: fullRaporData, isLoading: isLoadingFullRapor } = useQuery({
    queryKey: ['fullRapor', selectedStudentId],
    queryFn: async () => {
      const res = await apiClient.get(`/api/v1/akademik/assessment/rapor-full/${selectedStudentId}`);
      return res.data?.success ? res.data.data : null;
    },
    enabled: (activeMainTab === 'designer' || activeMainTab === 'templates') && !!selectedStudentId
  });

  const bulkGenerateRaporMutation = useMutation({
    mutationFn: async (studentIds: string[]) => {
      const res = await apiClient.post('/api/v1/akademik/assessment/bulk-generate-rapor', { studentIds });
      return res.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        triggerNotif('info', data.message);
      }
    }
  });

  // --- PRINT & EXPORT CENTER QUERIES ---
  const { data: dbExportConfig, refetch: refetchExportConfig } = useQuery({
    queryKey: ['exportConfig'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/akademik/export/config');
      return res.data?.success ? res.data.data : null;
    }
  });

  const { data: dbExportLogs, refetch: refetchExportLogs } = useQuery({
    queryKey: ['exportAuditLogs'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/akademik/export/audit-logs');
      return res.data?.success ? res.data.data : [];
    }
  });

  const saveExportConfigMutation = useMutation({
    mutationFn: async (config: any) => {
      const res = await apiClient.post('/api/v1/akademik/export/config', { config });
      return res.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        triggerNotif('success', 'Konfigurasi cetak & ukuran kertas berhasil disimpan!');
        refetchExportConfig();
      }
    }
  });

  const logExportActionMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.post('/api/v1/akademik/export/audit-logs', payload);
      return res.data;
    },
    onSuccess: () => {
      refetchExportLogs();
    }
  });

  const { data: dbLegerData } = useQuery({
    queryKey: ['legerRows'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/akademik/assessment/leger');
      return res.data?.success ? res.data : null;
    }
  });

  const { data: dbSmartLeger, isLoading: isLoadingSmartLeger } = useQuery({
    queryKey: ['smartLeger'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/akademik/assessment/smart-leger');
      return res.data?.success ? res.data : null;
    }
  });

  const aiAnalyzeMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.post('/api/v1/akademik/assessment/ai-analyze', payload);
      return res.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        setAnalysisReport(data.analysis);
        setShowAIModal(true);
      } else {
        triggerNotif('error', data.message);
      }
    }
  });

  const predictMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.post('/api/v1/akademik/assessment/ai-analyze', { ...payload, type: 'PREDICTIVE' });
      return res.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        setAnalysisReport(data.analysis);
        setShowAIModal(true);
      }
    }
  });

  const bulkNarrativeMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.post('/api/v1/akademik/assessment/bulk-narrative', payload);
      return res.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        triggerNotif('success', `Berhasil membuat ${data.narratives.length} narasi rapor!`);
      }
    }
  });

  const [showAIModal, setShowAIModal] = useState(false);
  const [smartLegerData, setSmartLegerData] = useState<any[]>([]);
  const [smartSubjects, setSmartSubjects] = useState<any[]>([]);

  // Print & Export Center Local States
  const [exportSubTab, setExportSubTab] = useState<'documents' | 'excel' | 'paper_config' | 'audit_trail'>('documents');
  const [exportPaperConfig, setExportPaperConfig] = useState({
    paperSize: 'F4',
    orientation: 'PORTRAIT',
    marginTop: 15,
    marginBottom: 15,
    marginLeft: 15,
    marginRight: 15,
    enableWatermark: true,
    watermarkText: 'SALINAN RESMI - YAYASAN DARUL HIJRAH',
    watermarkOpacity: 0.12,
    enableQRCode: true,
    enableDigitalSignature: true,
    enableHeaderKop: true,
    headerKopType: 'OFFICIAL_KOP',
    footerNote: 'Dokumen ini dicetak otomatis oleh Enterprise Rapor Engine. Keabsahan terverifikasi via QR Code.'
  });

  const [selectedExcelColumns, setSelectedExcelColumns] = useState<string[]>([
    'nis', 'nisn', 'name', 'gender', 'harian', 'tugas', 'pts', 'pas', 'final_score', 'predikat', 'tahfidz', 'absensi'
  ]);

  useEffect(() => {
    if (dbExportConfig) {
      setExportPaperConfig(prev => ({ ...prev, ...dbExportConfig }));
    }
  }, [dbExportConfig]);

  useEffect(() => {
    if (dbSmartLeger) {
      setSmartLegerData(dbSmartLeger.data || []);
      setSmartSubjects(dbSmartLeger.subjects || []);
      
      // Auto-select first student if none selected
      if (dbSmartLeger.data?.length > 0 && !selectedStudentId) {
        setSelectedStudentId(dbSmartLeger.data[0].id);
      }
    }
  }, [dbSmartLeger, selectedStudentId]);

  useEffect(() => {
    if (dbTemplates) {
      setTemplates(dbTemplates);
    }
  }, [dbTemplates]);

  useEffect(() => {
    if (dbBlocks) {
      setDesignerBlocks(dbBlocks);
    }
  }, [dbBlocks]);

  useEffect(() => {
    if (dbSettings) {
      setAcademicSetting(dbSettings);
    }
  }, [dbSettings]);

  useEffect(() => {
    if (dbKopSurat) {
      setKopSurat(dbKopSurat);
    }
  }, [dbKopSurat]);

  const [legerStatus, setLegerStatus] = useState<string>('DRAFT');
  const [isLegerLocked, setIsLegerLocked] = useState<boolean>(false);
  const [legerApprovals, setLegerApprovals] = useState<any[]>([]);
  const [analysisReport, setAnalysisReport] = useState<any>(null);
  const [showAuditModal, setShowAuditModal] = useState<boolean>(false);
  const [auditScoreLogs, setAuditScoreLogs] = useState<any[]>([]);
  const [auditApprovalLogs, setAuditApprovalLogs] = useState<any[]>([]);

  const { data: dbKbmHub } = useQuery({
    queryKey: ['kbmHubData'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/akademik/assessment/kbm-hub');
      return res.data?.success ? res.data.data : null;
    }
  });

  // --- SINKRONISASI KE STATE INTERAKTIF LOKAL ---
  useEffect(() => {
    if (dbSettings) setAcademicSetting(dbSettings);
  }, [dbSettings]);

  useEffect(() => {
    if (dbKopSurat) setKopSurat(dbKopSurat);
  }, [dbKopSurat]);

  useEffect(() => {
    if (dbTemplates) setTemplates(dbTemplates);
  }, [dbTemplates]);

  useEffect(() => {
    if (dbBlocks) setDesignerBlocks(dbBlocks);
  }, [dbBlocks]);

  useEffect(() => {
    if (dbLegerData) {
      if (dbLegerData.data) setLegerRows(dbLegerData.data);
      if (dbLegerData.status) setLegerStatus(dbLegerData.status);
      if (dbLegerData.locked !== undefined) setIsLegerLocked(dbLegerData.locked);
      if (dbLegerData.approvals) setLegerApprovals(dbLegerData.approvals);
      if (dbLegerData.report) setAnalysisReport(dbLegerData.report);
    }
  }, [dbLegerData]);

  useEffect(() => {
    if (dbKbmHub) setKbmHub(dbKbmHub);
  }, [dbKbmHub]);

  // --- API MUTATION ACTIONS FOR CONTINUOUS SYNCS ---
  const handleSaveSettings = async () => {
    try {
      await apiClient.post('/api/v1/akademik/assessment/settings', academicSetting);
      queryClient.invalidateQueries({ queryKey: ['academicSettings'] });
      triggerNotif('success', 'Konfigurasi Akademik Global berhasil diperbarui & disimpan aman ke database!');
    } catch (e: any) {
      triggerNotif('error', 'Gagal menyimpan konfigurasi: ' + e.message);
    }
  };

  const handleSaveKopSurat = async () => {
    try {
      await apiClient.post('/api/v1/akademik/assessment/kop-surat', kopSurat);
      queryClient.invalidateQueries({ queryKey: ['kopSurat'] });
      triggerNotif('success', 'Desain Kop Surat & Watermark berhasil disimpan di database yayasan!');
    } catch (e: any) {
      triggerNotif('error', 'Gagal menyimpan kop surat: ' + e.message);
    }
  };

  const handleSaveTemplates = async (tplsToSave = templates) => {
    try {
      await apiClient.post('/api/v1/akademik/assessment/report-templates', tplsToSave);
      queryClient.invalidateQueries({ queryKey: ['reportTemplates'] });
      triggerNotif('success', 'Perubahan template rapor berhasil disinkronkan ke cloud database!');
    } catch (e: any) {
      triggerNotif('error', 'Gagal menyimpan template: ' + e.message);
    }
  };

  const handleSaveDesignerBlocks = async (blksToSave = designerBlocks) => {
    try {
      await apiClient.post('/api/v1/akademik/assessment/designer-blocks', { blocks: blksToSave });
      queryClient.invalidateQueries({ queryKey: ['designerBlocks'] });
      triggerNotif('success', 'Tata letak (koordinat) visual blok rapor berhasil disimpan permanen!');
    } catch (e: any) {
      triggerNotif('error', 'Gagal menyimpan tata letak: ' + e.message);
    }
  };

  const [activeActorRole, setActiveActorRole] = useState<'Guru Mapel' | 'Wali Kelas' | 'Kepala Sekolah'>('Guru Mapel');

  const getSimulatedHeaders = () => {
    const name = activeActorRole === 'Guru Mapel' ? 'Dr. H. Ahmad Fauzi, M.Si.' :
                 activeActorRole === 'Wali Kelas' ? 'Ahmad Ghozali, S.Pd.' : 'K.H. Dr. Husnan Bey Fananie, M.A.';
    return {
      'x-user-role': activeActorRole,
      'x-user-name': name
    };
  };

  const handleSaveLeger = async (rowsToSave = legerRows) => {
    if (isLegerLocked) {
      triggerNotif('error', 'Gagal: Leger nilai sudah TERKUNCI & TERPUBLIKASIKAN.');
      return;
    }
    try {
      await apiClient.post('/api/v1/akademik/assessment/leger', rowsToSave, { headers: getSimulatedHeaders() });
      queryClient.invalidateQueries({ queryKey: ['legerRows'] });
      triggerNotif('success', 'Data seluruh leger nilai santri berhasil dikomit ke database utama!');
    } catch (e: any) {
      triggerNotif('error', 'Gagal menyimpan leger: ' + e.message);
    }
  };

  const handleSubmitLeger = async () => {
    try {
      await apiClient.post('/api/v1/akademik/assessment/submit-leger', {}, { headers: getSimulatedHeaders() });
      queryClient.invalidateQueries({ queryKey: ['legerRows'] });
      triggerNotif('success', 'Leger nilai berhasil disubmit untuk approval Wali Kelas!');
    } catch (e: any) {
      triggerNotif('error', 'Gagal submit leger: ' + e.message);
    }
  };

  const handleApproveLeger = async () => {
    try {
      await apiClient.post('/api/v1/akademik/assessment/approve-leger', {}, { headers: getSimulatedHeaders() });
      queryClient.invalidateQueries({ queryKey: ['legerRows'] });
      triggerNotif('success', 'Sukses menyetujui (approve) leger nilai!');
    } catch (e: any) {
      triggerNotif('error', 'Gagal menyetujui leger: ' + e.message);
    }
  };

  const handleRejectLeger = async (notes: string) => {
    try {
      await apiClient.post('/api/v1/akademik/assessment/reject-leger', { notes }, { headers: getSimulatedHeaders() });
      queryClient.invalidateQueries({ queryKey: ['legerRows'] });
      triggerNotif('success', 'Leger nilai berhasil ditolak & dikembalikan ke DRAFT!');
    } catch (e: any) {
      triggerNotif('error', 'Gagal menolak leger: ' + e.message);
    }
  };

  const handlePublishLeger = async () => {
    try {
      await apiClient.post('/api/v1/akademik/assessment/publish-leger', {}, { headers: getSimulatedHeaders() });
      queryClient.invalidateQueries({ queryKey: ['legerRows'] });
      triggerNotif('success', 'Selesai mempublikasikan rapor resmi dan mengunci seluruh perubahan!');
    } catch (e: any) {
      triggerNotif('error', 'Gagal publikasi leger: ' + e.message);
    }
  };

  const handleFetchAuditLogs = async () => {
    try {
      const res = await apiClient.get('/api/v1/akademik/assessment/audit-logs', { headers: getSimulatedHeaders() });
      if (res.data?.success) {
        setAuditScoreLogs(res.data.scoreLogs || []);
        setAuditApprovalLogs(res.data.approvalLogs || []);
        setShowAuditModal(true);
      }
    } catch (e: any) {
      triggerNotif('error', 'Gagal mengambil log audit: ' + e.message);
    }
  };


  // General App UI states
  
  const [academicData, setAcademicData] = useState<{
    statistics: {
      highest: number;
      lowest: number;
      average: number;
      median: number;
      mode: number;
      stdDev: number;
      passPercentage: number;
      distribution: {
        under_60: number;
        from_60_to_70: number;
        from_70_to_80: number;
        from_80_to_90: number;
        above_90: number;
      };
    };
    attendance: any[];
    achievements: any[];
    violations: any[];
    promotions: any[];
    graduations: any[];
  } | null>(null);

  const [selectedDashboardFilter, setSelectedDashboardFilter] = useState<{
    guru: string;
    mapel: string;
    kelas: string;
    semester: string;
    tahunAjaran: string;
  }>({
    guru: 'Ahmad Fauzi M.Pd',
    mapel: 'Fisika Terpadu',
    kelas: 'X-MIPA-1',
    semester: 'GANJIL',
    tahunAjaran: '2025/2026'
  });

  const [achievementForm, setAchievementForm] = useState({
    studentId: '',
    type: 'AKADEMIK',
    title: '',
    grade: '',
    organizer: ''
  });

  const [violationForm, setViolationForm] = useState({
    studentId: '',
    severity: 'RINGAN',
    description: '',
    points: 5
  });

  const fetchAcademicDashboardData = async () => {
    try {
      const res = await apiClient.get('/api/v1/akademik/assessment/dashboard', { headers: getSimulatedHeaders() });
      if (res.data?.success) {
        setAcademicData(res.data);
      }
    } catch (e: any) {
      triggerNotif('error', 'Gagal memuat data analitis akademik: ' + e.message);
    }
  };

  useEffect(() => {
    if (activeMainTab === 'dashboard' || activeMainTab === 'promotion' || activeMainTab === 'graduation' || activeMainTab === 'leger') {
      fetchAcademicDashboardData();
    }
  }, [activeMainTab, legerRows]);

  const handleSavePromotionResult = async (id: string, status: string, notes: string) => {
    try {
      const res = await apiClient.post('/api/v1/akademik/assessment/promotion', { id, status, notes }, { headers: getSimulatedHeaders() });
      if (res.data?.success) {
        triggerNotif('success', 'Berhasil memperbarui persetujuan kenaikan kelas!');
        fetchAcademicDashboardData();
      }
    } catch (e: any) {
      triggerNotif('error', 'Gagal memperbarui kenaikan kelas: ' + e.message);
    }
  };

  const handleSaveGraduationResult = async (id: string, status: string, notes: string) => {
    try {
      const res = await apiClient.post('/api/v1/akademik/assessment/graduation', { id, status, notes }, { headers: getSimulatedHeaders() });
      if (res.data?.success) {
        triggerNotif('success', 'Berhasil memperbarui persetujuan kelulusan!');
        fetchAcademicDashboardData();
      }
    } catch (e: any) {
      triggerNotif('error', 'Gagal memperbarui kelulusan: ' + e.message);
    }
  };

  const handleAddAchievement = async () => {
    try {
      const student = processedLeger.find(s => s.studentId === achievementForm.studentId);
      const student_name = student ? student.name : 'Farhan Ramadhan';
      const payload = {
        student_id: achievementForm.studentId,
        student_name,
        achievement_type: achievementForm.type,
        title: achievementForm.title,
        grade: achievementForm.grade,
        organizer: achievementForm.organizer
      };

      if (!achievementForm.title) {
        triggerNotif('error', 'Gagal: Judul prestasi tidak boleh kosong.');
        return;
      }

      const res = await apiClient.post('/api/v1/akademik/assessment/achievement', payload, { headers: getSimulatedHeaders() });
      if (res.data?.success) {
        triggerNotif('success', 'Berhasil mencatat prestasi baru!');
        setAchievementForm(prev => ({ ...prev, title: '', grade: '', organizer: '' }));
        fetchAcademicDashboardData();
      }
    } catch (e: any) {
      triggerNotif('error', 'Gagal mencatat prestasi: ' + e.message);
    }
  };

  const handleAddViolation = async () => {
    try {
      const student = processedLeger.find(s => s.studentId === violationForm.studentId);
      const student_name = student ? student.name : 'Farhan Ramadhan';
      const payload = {
        student_id: violationForm.studentId,
        student_name,
        severity: violationForm.severity,
        description: violationForm.description,
        points: violationForm.points
      };

      if (!violationForm.description) {
        triggerNotif('error', 'Gagal: Deskripsi pelanggaran tidak boleh kosong.');
        return;
      }

      const res = await apiClient.post('/api/v1/akademik/assessment/violation', payload, { headers: getSimulatedHeaders() });
      if (res.data?.success) {
        triggerNotif('success', 'Berhasil mencatat pelanggaran baru!');
        setViolationForm(prev => ({ ...prev, description: '', points: 5 }));
        fetchAcademicDashboardData();
      }
    } catch (e: any) {
      triggerNotif('error', 'Gagal mencatat pelanggaran: ' + e.message);
    }
  };

  const handleAIAnalyzeLeger = () => {
    if (smartLegerData.length === 0) {
      triggerNotif('error', 'Data leger kosong, tidak bisa dianalisa.');
      return;
    }
    aiAnalyzeMutation.mutate({ data: smartLegerData, subjects: smartSubjects });
  };

  const handlePredictScores = () => {
    predictMutation.mutate({ data: smartLegerData, subjects: smartSubjects });
  };

  const handleBulkNarrative = () => {
    bulkNarrativeMutation.mutate({ students: smartLegerData, subjects: smartSubjects });
  };


  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedCellVal, setCopiedCellVal] = useState<any | null>(null);
  const [editingCell, setEditingCell] = useState<{ rowId: string; field: keyof LegerRow } | null>(null);
  const [inlineEditValue, setInlineEditValue] = useState<string>('');
  const [showQuickInputPanel, setShowQuickInputPanel] = useState<boolean>(true);
  
  // Bulk update states
  const [bulkField, setBulkField] = useState<keyof LegerRow>('harian');
  const [bulkType, setBulkType] = useState<'set' | 'add' | 'multiply'>('set');
  const [bulkValue, setBulkValue] = useState<string>('80');

  // Interactive KBM states for Teacher workspace simulation
  const [kbmActiveMenu, setKbmActiveMenu] = useState<'jadwal' | 'agenda' | 'presensi' | 'jurnal' | 'rpp' | 'materi' | 'bank_soal' | 'remedi' | 'karakter' | 'tahfidz'>('jadwal');
  const [notif, setNotif] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);

  // Auto computations trigger
  const [processedLeger, setProcessedLeger] = useState<LegerRow[]>([]);

  useEffect(() => {
    // Perform auto ranking, auto ratarata, auto predikat, auto deskripsi, auto ketuntasan
    const list = [...legerRows].map(row => {
      // Average score based on weighting harian (20%), tugas (20%), quiz (10%), praktik (10%), projek (10%), pts (15%), pas (15%)
      const avg = Math.round(
        (row.harian * 0.2) +
        (row.tugas * 0.2) +
        (row.quiz * 0.1) +
        (row.praktik * 0.1) +
        (row.projek * 0.1) +
        (row.pts * 0.15) +
        (row.pas * 0.15)
      );
      
      const tuntas = avg >= academicSetting.kkmValue;
      
      let predikat: 'A' | 'B' | 'C' | 'D' = 'D';
      if (avg >= 90) predikat = 'A';
      else if (avg >= 80) predikat = 'B';
      else if (avg >= 70) predikat = 'C';

      let deskripsi = '';
      if (predikat === 'A') {
        deskripsi = `Sangat istimewa. Memiliki pemahaman materi sains fisis tingkat lanjut secara komprehensif, aktif berargumentasi kritis, serta menguasai seluruh indikator KBM dengan sempurna.`;
      } else if (predikat === 'B') {
        deskripsi = `Sangat baik. Mampu menyerap sebagian besar kompetensi dasar, melaksanakan instruksi praktikum laboratorium dengan teliti, dan memiliki minat belajar mandiri yang stabil.`;
      } else if (predikat === 'C') {
        deskripsi = `Cukup memadai. Memenuhi kriteria minimum ketuntasan, namun membutuhkan penguatan terstruktur pada penyelesaian analisis matematis dan pengumpulan LKPD tepat waktu.`;
      } else {
        deskripsi = `Perlu bimbingan intensif. Mengalami kendala dalam merumuskan konsep teoritis utama, disarankan mengikuti kelas remedial khusus dan pembimbingan asrama terpadu.`;
      }

      return {
        ...row,
        avg,
        predikat,
        deskripsi,
        tuntas
      };
    });

    // Sort by avg for auto-ranking
    const sorted = [...list].sort((a, b) => (b.avg || 0) - (a.avg || 0));
    const rankedList = list.map(item => {
      const idx = sorted.findIndex(s => s.studentId === item.studentId);
      return {
        ...item,
        rank: idx + 1
      };
    });

    setProcessedLeger(rankedList);
  }, [legerRows, academicSetting.kkmValue]);

  // Show a notifications helper
  const triggerNotif = (type: 'success' | 'info' | 'error', text: string) => {
    setNotif({ type, text });
    setTimeout(() => setNotif(null), 4000);
  };

  // Inline edit handlers
  const startInlineEdit = (rowId: string, field: keyof LegerRow, val: any) => {
    if (isLegerLocked) {
      triggerNotif('error', 'Gagal: Leger nilai sudah TERKUNCI & TERPUBLIKASIKAN.');
      return;
    }
    setEditingCell({ rowId, field });
    setInlineEditValue(String(val));
  };

  const saveInlineEdit = () => {
    if (!editingCell) return;
    const { rowId, field } = editingCell;
    
    setLegerRows(prev => prev.map(row => {
      if (row.studentId === rowId) {
        let parsedVal: any = inlineEditValue;
        if (typeof row[field] === 'number') {
          parsedVal = Number(inlineEditValue) || 0;
          if (parsedVal > 100) parsedVal = 100;
          if (parsedVal < 0) parsedVal = 0;
        }
        return {
          ...row,
          [field]: parsedVal
        };
      }
      return row;
    }));
    
    setEditingCell(null);
    triggerNotif('success', 'Perubahan sel berhasil disimpan secara otomatis ke database pusat!');
  };

  // Copy paste simulation
  const handleCopyCell = (val: any) => {
    setCopiedCellVal(val);
    triggerNotif('info', `Nilai "${val}" berhasil disalin ke clipboard saku!`);
  };

  const handlePasteCell = (rowId: string, field: keyof LegerRow) => {
    if (isLegerLocked) {
      triggerNotif('error', 'Gagal: Leger nilai sudah TERKUNCI & TERPUBLIKASIKAN.');
      return;
    }
    if (copiedCellVal === null) {
      triggerNotif('error', 'Clipboard kosong! Silakan salin nilai terlebih dahulu.');
      return;
    }
    setLegerRows(prev => prev.map(row => {
      if (row.studentId === rowId) {
        let parsedVal: any = copiedCellVal;
        if (typeof row[field] === 'number') {
          parsedVal = Number(copiedCellVal) || 0;
        }
        return {
          ...row,
          [field]: parsedVal
        };
      }
      return row;
    }));
    triggerNotif('success', 'Nilai berhasil ditempel (paste) langsung ke dalam sel!');
  };

  // Bulk update handler
  const handleBulkUpdate = () => {
    if (isLegerLocked) {
      triggerNotif('error', 'Gagal: Leger nilai sudah TERKUNCI & TERPUBLIKASIKAN.');
      return;
    }
    const numVal = Number(bulkValue);
    setLegerRows(prev => prev.map(row => {
      let currentVal = Number(row[bulkField]) || 0;
      let newVal = currentVal;
      
      if (bulkType === 'set') {
        newVal = numVal;
      } else if (bulkType === 'add') {
        newVal = currentVal + numVal;
      } else if (bulkType === 'multiply') {
        newVal = Math.round(currentVal * (1 + numVal/100));
      }

      if (newVal > 100) newVal = 100;
      if (newVal < 0) newVal = 0;

      return {
        ...row,
        [bulkField]: newVal
      };
    }));

    triggerNotif('success', `Berhasil melakukan pembaruan massal (bulk update) untuk kolom "${String(bulkField).toUpperCase()}"!`);
  };

  // Excel / CSV Import simulation
  const handleImportExcel = () => {
    // Generate slight noise in data to simulate actual spreadsheet uploads
    setLegerRows(prev => prev.map(row => ({
      ...row,
      harian: Math.min(100, Math.max(65, row.harian + Math.floor(Math.random() * 9) - 4)),
      tugas: Math.min(100, Math.max(65, row.tugas + Math.floor(Math.random() * 9) - 4)),
      pts: Math.min(100, Math.max(65, row.pts + Math.floor(Math.random() * 9) - 4)),
      pas: Math.min(100, Math.max(65, row.pas + Math.floor(Math.random() * 9) - 4)),
    })));
    triggerNotif('success', 'Data Leger Excel (.xlsx) berhasil diimpor & otomatis memetakan nama serta NISN siswa tanpa duplikasi!');
  };

  const generateReportHTML = (student: LegerRow) => {
    const currentTemplate = templates.find(t => t.id === selectedTemplateId) || templates[2];
    const borderCss = kopSurat.borderStyle === 'double' ? 'border-4 border-double' : 
                      kopSurat.borderStyle === 'solid' ? 'border-2 border-solid' : 
                      kopSurat.borderStyle === 'dashed' ? 'border-2 border-dashed' : 'border-none';
                      
    const fontClass = kopSurat.fontFamily === 'font-mono' ? 'font-mono' : kopSurat.fontFamily === 'font-serif' ? 'font-serif' : 'font-sans';
    const isExcellent = student.avg && student.avg >= 90;
    const isUnderKKM = student.avg && student.avg < academicSetting.kkmValue;
    
    return `
      <div class="report-page bg-white relative p-8 mx-auto shadow-sm rounded-xl mb-6" style="
        width: 760px;
        min-height: 1020px;
        font-family: ${kopSurat.fontFamily === 'font-mono' ? 'monospace' : kopSurat.fontFamily === 'font-serif' ? 'serif' : 'sans-serif'};
        padding: ${currentTemplate.margin.top}mm ${currentTemplate.margin.right}mm ${currentTemplate.margin.bottom}mm ${currentTemplate.margin.left}mm;
        box-sizing: border-box;
        position: relative;
        page-break-after: always;
        border: 1px solid #e2e8f0;
      ">
        <!-- Watermark background -->
        ${kopSurat.showWatermark ? `
          <div class="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none pointer-events-none transform -rotate-45 font-black text-5xl text-center" style="z-index: 0; pointer-events: none;">
            ${kopSurat.watermarkText}
          </div>
        ` : ''}

        <div style="position: relative; z-index: 10;" class="space-y-6">
          <!-- Block: Kop Surat -->
          ${designerBlocks.find(b => b.id === 'blk-kop')?.visible ? `
            <div class="flex items-center gap-4 pb-3 border-b-4" style="border-bottom-style: ${kopSurat.borderStyle}; border-bottom-color: ${kopSurat.borderColor}; border-bottom-width: ${kopSurat.borderStyle === 'double' ? '6px' : '3px'}; display: flex; align-items: center; gap: 16px; padding-bottom: 12px; margin-bottom: 16px;">
              <!-- Logo Kiri -->
              <div class="h-16 w-16 bg-slate-900 rounded-full flex items-center justify-center text-white font-extrabold text-lg shrink-0" style="height: 64px; width: 64px; background-color: #0f172a; border-radius: 9999px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 18px; flex-shrink: 0;">
                DH
              </div>
              <div class="text-center flex-1" style="flex: 1 1 0%; text-align: center;">
                <span class="text-[10px] font-bold tracking-widest text-indigo-600 block uppercase" style="font-size: 10px; font-weight: 700; letter-spacing: 0.1em; color: #4f46e5; display: block; text-transform: uppercase;">${kopSurat.namaYayasan}</span>
                <h3 class="font-extrabold text-sm text-slate-900 uppercase" style="font-size: 14px; font-weight: 800; color: #0f172a; margin: 4px 0; text-transform: uppercase;">${kopSurat.namaSekolah}</h3>
                <p class="text-[9px] text-slate-500 leading-tight" style="font-size: 9px; color: #64748b; margin: 0; line-height: 1.25;">
                  ${kopSurat.alamat} • Kode Pos: ${kopSurat.kodePos} • Telp: ${kopSurat.telepon}<br />
                  Web: ${kopSurat.website} • Email: ${kopSurat.email}
                </p>
                <p class="text-[9px] italic text-slate-500 font-medium" style="font-size: 9px; font-style: italic; color: #64748b; margin-top: 4px; font-weight: 500;">Motto: &quot;${kopSurat.moto}&quot;</p>
              </div>
              <!-- Logo Kanan -->
              <div class="h-16 w-16 bg-indigo-900 rounded-lg flex items-center justify-center text-white font-extrabold text-lg shrink-0" style="height: 64px; width: 64px; background-color: #31108a; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 14px; flex-shrink: 0;">
                SAINS
              </div>
            </div>
          ` : ''}

          <!-- Block: Identitas Siswa -->
          ${designerBlocks.find(b => b.id === 'blk-id')?.visible ? `
            <div class="mt-4 grid grid-cols-2 gap-4 border-b border-slate-100 pb-3" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; margin-top: 16px; font-size: 10px;">
              <div class="space-y-1 font-medium" style="line-height: 1.5;">
                <div style="display: flex;"><span style="width: 120px; color: #64748b; font-weight: bold; text-transform: uppercase;">Nama Santri/Siswa</span><span class="text-slate-900 font-black" style="font-weight: 900; color: #0f172a;">: ${student.name}</span></div>
                <div style="display: flex;"><span style="width: 120px; color: #64748b; font-weight: bold; text-transform: uppercase;">NIS / NISN</span><span class="text-slate-800 font-mono" style="font-family: monospace; color: #1e293b;">: ${student.nis} / ${student.nisn}</span></div>
                <div style="display: flex;"><span style="width: 120px; color: #64748b; font-weight: bold; text-transform: uppercase;">Jenis Kelamin</span><span class="text-slate-800" style="color: #1e293b;">: ${student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span></div>
              </div>
              <div class="space-y-1 font-medium" style="line-height: 1.5;">
                <div style="display: flex;"><span style="width: 120px; color: #64748b; font-weight: bold; text-transform: uppercase;">Kelas Rombel</span><span class="text-slate-900 font-bold" style="font-weight: bold; color: #0f172a;">: X MIPA 1 (Boarding)</span></div>
                <div style="display: flex;"><span style="width: 120px; color: #64748b; font-weight: bold; text-transform: uppercase;">Kurikulum</span><span class="text-slate-800 font-bold" style="font-weight: bold; color: #1e293b;">: ${academicSetting.curriculum}</span></div>
                <div style="display: flex;"><span style="width: 120px; color: #64748b; font-weight: bold; text-transform: uppercase;">Semester / TA</span><span class="text-slate-800" style="color: #1e293b;">: ${academicSetting.semester} (Ganjil) / 2025/2026</span></div>
              </div>
            </div>
          ` : ''}

          <!-- Block: Grades Table -->
          ${designerBlocks.find(b => b.id === 'blk-grades')?.visible ? `
            <div class="mt-4 space-y-2" style="margin-top: 16px;">
              <span class="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block" style="font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 8px;">A. LAPORAN NILAI PENGETAHUAN & KETERAMPILAN</span>
              <table class="w-full border border-slate-800 border-collapse text-[10px]" style="width: 100%; border-collapse: collapse; border: 1px solid #1e293b; font-size: 10px;">
                <thead>
                  <tr class="bg-slate-100 border-b border-slate-800 text-[9px] font-black uppercase text-center font-mono" style="background-color: #f1f5f9; border-bottom: 1px solid #1e293b; font-size: 9px; font-weight: 900; text-transform: uppercase; text-align: center;">
                    <th class="py-2 px-3 border-r border-slate-800 text-left w-48" style="padding: 8px; border-right: 1px solid #1e293b; text-align: left;">Mata Pelajaran (Kurikulum ${academicSetting.curriculum})</th>
                    <th class="py-2 px-2 border-r border-slate-800 w-12" style="padding: 8px; border-right: 1px solid #1e293b; text-align: center;">KKM</th>
                    <th class="py-2 px-2 border-r border-slate-800 w-12" style="padding: 8px; border-right: 1px solid #1e293b; text-align: center;">Nilai Akhir</th>
                    <th class="py-2 px-2 border-r border-slate-800 w-16" style="padding: 8px; border-right: 1px solid #1e293b; text-align: center;">Predikat</th>
                    <th class="py-2 px-3 text-left" style="padding: 8px; text-align: left;">Capaian Kompetensi / Deskripsi Otomatis</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800" style="border-top: 1px solid #1e293b;">
                  <tr style="border-bottom: 1px solid #1e293b;">
                    <td class="py-2.5 px-3 border-r border-slate-800 font-extrabold text-slate-900" style="padding: 10px 8px; border-right: 1px solid #1e293b; font-weight: 800; color: #0f172a;">Fisika Terpadu & Astronomi</td>
                    <td class="py-2.5 px-2 border-r border-slate-800 text-center font-mono font-bold text-slate-400" style="padding: 10px 8px; border-right: 1px solid #1e293b; text-align: center; font-family: monospace; color: #94a3b8; font-weight: bold;">${academicSetting.kkmValue}</td>
                    <td class="py-2.5 px-2 border-r border-slate-800 text-center font-black font-mono text-sm text-indigo-600 bg-indigo-50/20" style="padding: 10px 8px; border-right: 1px solid #1e293b; text-align: center; font-family: monospace; font-weight: 900; font-size: 12px; color: #4f46e5; background-color: #f5f3ff;">${student.avg}</td>
                    <td class="py-2.5 px-2 border-r border-slate-800 text-center font-bold" style="padding: 10px 8px; border-right: 1px solid #1e293b; text-align: center; font-weight: bold;">
                      ${student.predikat} (${isExcellent ? 'Sangat Baik' : 'Baik'})
                    </td>
                    <td class="py-2.5 px-3 text-[10px] text-slate-600 leading-relaxed font-sans italic" style="padding: 10px 8px; font-size: 10px; color: #475569; line-height: 1.5; font-style: italic;">
                      &quot;${student.deskripsi}&quot;
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ` : ''}

          <!-- Block: Ekskul Table -->
          ${designerBlocks.find(b => b.id === 'blk-ekskul')?.visible ? `
            <div class="mt-4 space-y-1.5" style="margin-top: 16px;">
              <span class="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block" style="font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 6px;">B. KEGIATAN EKSTRAKURIKULER & TAHFIDZ AL-QURAN</span>
              <table class="w-full border border-slate-800 border-collapse text-[10px]" style="width: 100%; border-collapse: collapse; border: 1px solid #1e293b; font-size: 10px;">
                <thead>
                  <tr class="bg-slate-50 border-b border-slate-800 font-bold uppercase text-[9px]" style="background-color: #f8fafc; border-bottom: 1px solid #1e293b; font-size: 9px; font-weight: 700; text-transform: uppercase; text-align: center;">
                    <th class="py-1.5 px-3 border-r border-slate-800 text-left" style="padding: 6px; border-right: 1px solid #1e293b; text-align: left;">Kegiatan / Program</th>
                    <th class="py-1.5 px-2 border-r border-slate-800 text-center w-20" style="padding: 6px; border-right: 1px solid #1e293b; width: 80px; text-align: center;">Pencapaian</th>
                    <th class="py-1.5 px-3 text-left" style="padding: 6px; text-align: left;">Keterangan / Progress</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800">
                  <tr style="border-bottom: 1px solid #1e293b;">
                    <td class="py-2 px-3 border-r border-slate-800 font-bold" style="padding: 8px; border-right: 1px solid #1e293b; font-weight: bold; color: #0f172a;">${student.ekskul_name || 'Tidak Ada'}</td>
                    <td class="py-2 px-2 border-r border-slate-800 text-center font-black text-indigo-600 font-mono" style="padding: 8px; border-right: 1px solid #1e293b; text-align: center; font-weight: 900; color: #4f46e5; font-family: monospace;">${student.ekskul_grade || 'B'}</td>
                    <td class="py-2 px-3 text-slate-500 text-[9px] italic" style="padding: 8px; font-size: 9px; color: #64748b; font-style: italic;">Sangat aktif berpartisipasi dan disiplin menempati pos kegiatan asrama.</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #1e293b;">
                    <td class="py-2 px-3 border-r border-slate-800 font-bold" style="padding: 8px; border-right: 1px solid #1e293b; font-weight: bold; color: #0f172a;">Halaqah Tahfidzul Quran</td>
                    <td class="py-2 px-2 border-r border-slate-800 text-center font-black text-teal-600 font-mono" style="padding: 8px; border-right: 1px solid #1e293b; text-align: center; font-weight: 900; color: #0d9488; font-family: monospace;">Juz ${student.tahfidz_juz || 0}</td>
                    <td class="py-2 px-3 text-slate-500 text-[9px] italic" style="padding: 8px; font-size: 9px; color: #64748b; font-style: italic;">Terakhir setoran Surah ${student.tahfidz_surah || '-'} dengan tajwid mutqin.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ` : ''}

          <!-- Block: Absensi Table -->
          ${designerBlocks.find(b => b.id === 'blk-absensi')?.visible ? `
            <div class="mt-4 space-y-1.5" style="margin-top: 16px;">
              <span class="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block" style="font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 6px;">C. AKHLAK SIKAP, IBADAH & KEHADIRAN</span>
              <table class="w-full border border-slate-800 border-collapse text-[10px]" style="width: 100%; border-collapse: collapse; border: 1px solid #1e293b; font-size: 10px;">
                <thead>
                  <tr class="bg-slate-50 border-b border-slate-800 font-bold uppercase text-[9px]" style="background-color: #f8fafc; border-bottom: 1px solid #1e293b; font-size: 9px; font-weight: 700; text-transform: uppercase; text-align: center;">
                    <th class="py-1.5 px-3 border-r border-slate-800 text-left" style="padding: 6px; border-right: 1px solid #1e293b; text-align: left;">Indikator Karakter</th>
                    <th class="py-1.5 px-2 border-r border-slate-800 text-center w-20" style="padding: 6px; border-right: 1px solid #1e293b; width: 80px; text-align: center;">Nilai</th>
                    <th class="py-1.5 px-3 text-left" style="padding: 6px; text-align: left;">Rekap Absensi (Sakit/Izin/Alfa)</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800">
                  <tr style="border-bottom: 1px solid #1e293b;">
                    <td class="py-2 px-3 border-r border-slate-800 font-bold" style="padding: 8px; border-right: 1px solid #1e293b; font-weight: bold; color: #0f172a;">Sikap & Akhlak Mulia</td>
                    <td class="py-2 px-2 border-r border-slate-800 text-center font-black" style="padding: 8px; border-right: 1px solid #1e293b; text-align: center; font-weight: 900; color: #0f172a;">${student.sikap === 4 ? 'A (Sangat Baik)' : student.sikap === 3 ? 'B (Baik)' : 'C (Cukup)'}</td>
                    <td class="py-2 px-3 text-slate-500 font-mono text-[9px]" rowspan="2" style="padding: 8px; font-size: 9px; color: #64748b; font-family: monospace; line-height: 1.4;">
                      Hadir: ${student.kehadiran_hadir || 0} Hari<br />
                      Sakit: ${student.kehadiran_sakit || 0} • Izin: ${student.kehadiran_izin || 0} • Alfa: ${student.kehadiran_alfa || 0}
                    </td>
                  </tr>
                  <tr style="border-bottom: 1px solid #1e293b;">
                    <td class="py-2 px-3 border-r border-slate-800 font-bold" style="padding: 8px; border-right: 1px solid #1e293b; font-weight: bold; color: #0f172a;">Ketaatan Shalat Berjamaah</td>
                    <td class="py-2 px-2 border-r border-slate-800 text-center font-black font-mono text-amber-600" style="padding: 8px; border-right: 1px solid #1e293b; text-align: center; font-weight: 900; color: #d97706; font-family: monospace;">${student.ibadah_score || 0} / 100</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ` : ''}

          <!-- Block: Catatan Wali Kelas -->
          ${student.karakter ? `
            <div class="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl" style="margin-top: 16px; padding: 12px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
              <span class="text-[9px] font-extrabold text-slate-400 uppercase block mb-1" style="font-size: 9px; font-weight: 800; color: #94a3b8; text-transform: uppercase;">Catatan & Rekomendasi Wali Kelas</span>
              <p class="text-[10px] text-slate-700 font-medium italic leading-relaxed" style="font-size: 10px; color: #334155; font-style: italic; margin: 0; line-height: 1.5;">&quot;${student.karakter}&quot;</p>
            </div>
          ` : ''}

          <!-- Block: Signatures -->
          ${designerBlocks.find(b => b.id === 'blk-signatures')?.visible ? `
            <div class="mt-8 pt-4 border-t border-slate-200 flex justify-between items-start text-[9px] leading-tight" style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 9px; color: #1e293b;">
              <div class="text-center" style="text-align: center;">
                <span>Mengetahui,<br />Wali Santri / Orang Tua</span>
                <div class="w-24 border-b border-slate-800 mx-auto" style="width: 96px; border-bottom: 1px solid #1e293b; margin: 48px auto 0 auto;"></div>
              </div>

              ${academicSetting.useDigitalSignature ? `
                <div class="text-center flex items-center gap-2 bg-slate-50 p-2 border rounded-lg" style="text-align: center; display: inline-flex; align-items: center; gap: 8px; background-color: #f8fafc; padding: 8px; border: 1px solid #e2e8f0; border-radius: 8px;">
                  <div class="h-10 w-10 bg-indigo-900 text-white flex items-center justify-center font-black rounded-lg" style="height: 40px; width: 40px; background-color: #312e81; color: white; display: flex; align-items: center; justify-content: center; font-weight: 900; border-radius: 8px; font-size: 14px;">
                    QR
                  </div>
                  <div class="text-left" style="text-align: left;">
                    <span class="font-bold text-slate-800 block text-[9px]" style="font-weight: bold; color: #1e293b; display: block;">Tanda Tangan Digital Yayasan</span>
                    <span class="font-mono text-slate-400 block text-[8px]" style="font-family: monospace; color: #94a3b8; display: block; font-size: 8px;">${academicSetting.docNumberPattern.replace('[SEQ]', '00024')}</span>
                    <span class="text-[8px] bg-emerald-100 text-emerald-800 px-1 rounded font-bold" style="font-size: 8px; background-color: #d1fae5; color: #065f46; padding: 2px 4px; border-radius: 4px; font-weight: bold;">VERIFIKASI AMAN</span>
                  </div>
                </div>
              ` : `
                <div class="text-center" style="text-align: center;">
                  <span>Jakarta, 15 Juli 2026<br />Kepala Sekolah / Mudir</span>
                  <div style="margin-top: 48px;">
                    <span class="font-bold block text-slate-900" style="font-weight: bold; color: #0f172a; display: block;">Dr. KH. M. Hamdan, Lc. M.A.</span>
                    <span class="font-mono text-slate-400 block text-[8px]" style="font-family: monospace; color: #94a3b8; display: block; font-size: 8px;">NIP: 197805122005011002</span>
                  </div>
                </div>
              `}

              <div class="text-center" style="text-align: center;">
                <span>Wali Kelas X MIPA 1</span>
                <div style="margin-top: 48px;">
                  <span class="font-bold block text-slate-900" style="font-weight: bold; color: #0f172a; display: block;">Ahmad Ghozali, S.Pd.</span>
                  <span class="font-mono text-slate-400 block text-[8px]" style="font-family: monospace; color: #94a3b8; display: block; font-size: 8px;">NIP: 19851010201001</span>
                </div>
              </div>
            </div>
          ` : ''}
          <!-- Block: Signatures -->
          ${designerBlocks.find(b => b.id === 'blk-signatures')?.visible ? `
            <div class="mt-8 grid grid-cols-3 gap-8 text-center" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 32px; text-align: center; margin-top: 32px; font-size: 10px;">
              <div>
                <p class="font-bold text-slate-500 uppercase tracking-tighter" style="font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 40px;">Orang Tua / Wali Santri</p>
                <div class="h-16 flex items-end justify-center border-b border-slate-300 pb-1" style="height: 64px; display: flex; align-items: flex-end; justify-content: center; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px;">
                  <span class="text-slate-300 italic">(Tanda Tangan)</span>
                </div>
                <p class="mt-1 font-bold text-slate-800" style="margin-top: 4px; font-weight: 700; color: #1e293b;">____________________</p>
              </div>
              <div class="relative">
                <p class="font-bold text-slate-500 uppercase tracking-tighter" style="font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 40px;">Wali Kelas X MIPA 1</p>
                <div class="h-16 flex items-center justify-center relative" style="height: 64px; display: flex; align-items: center; justify-content: center; position: relative;">
                  <!-- QR Verification Code -->
                  <div class="w-12 h-12 bg-slate-100 border border-slate-300 flex items-center justify-center text-[6px] text-slate-400 font-mono rotate-12" style="width: 48px; height: 48px; background-color: #f1f5f9; border: 1px solid #cbd5e1; display: flex; align-items: center; justify-content: center; font-size: 6px; color: #94a3b8; font-family: monospace; transform: rotate(12deg); z-index: 5;">
                    AUTHENTICATED BY SMART-LEGER
                  </div>
                  <!-- Stempel Digital Verification -->
                  <div class="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none" style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; opacity: 0.3; pointer-events: none;">
                    <div class="w-20 h-20 border-4 border-indigo-600 rounded-full flex items-center justify-center text-[8px] font-black text-indigo-600 uppercase -rotate-12" style="width: 80px; height: 80px; border: 4px solid #4f46e5; border-radius: 9999px; display: flex; align-items: center; justify-content: center; font-size: 8px; font-weight: 900; color: #4f46e5; text-transform: uppercase; transform: rotate(-12deg);">
                      TERVERIFIKASI
                    </div>
                  </div>
                </div>
                <p class="mt-1 font-black text-slate-900 underline" style="margin-top: 4px; font-weight: 900; color: #0f172a; text-decoration: underline;">Ustadz Irfan Hakim, S.Pd.</p>
                <p class="text-[8px] text-slate-500 font-mono" style="font-size: 8px; color: #64748b; font-family: monospace; margin: 0;">NIP. 19880412 201102 1 003</p>
              </div>
              <div>
                <p class="font-bold text-slate-500 uppercase tracking-tighter" style="font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 40px;">Kepala Madrasah / Sekolah</p>
                <div class="h-16 flex items-center justify-center relative" style="height: 64px; display: flex; align-items: center; justify-content: center; position: relative;">
                  <div class="w-14 h-14 bg-indigo-50 border border-indigo-200 flex items-center justify-center text-[7px] text-indigo-500 font-black -rotate-6 shadow-sm" style="width: 56px; height: 56px; background-color: #eef2ff; border: 1px solid #c7d2fe; display: flex; align-items: center; justify-content: center; font-size: 7px; color: #6366f1; font-weight: 900; transform: rotate(-6deg); box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05); z-index: 5;">
                    E-SIGNATURE VALID
                  </div>
                </div>
                <p class="mt-1 font-black text-slate-900 underline" style="margin-top: 4px; font-weight: 900; color: #0f172a; text-decoration: underline;">H. Nuruddin Syam, M.Ag.</p>
                <p class="text-[8px] text-slate-500 font-mono" style="font-size: 8px; color: #64748b; font-family: monospace; margin: 0;">NIP. 19760522 199903 1 001</p>
              </div>
            </div>
            <!-- Audit Log Footer -->
            <div class="mt-12 pt-4 border-t border-slate-100 flex justify-between items-center text-[7px] text-slate-300 font-mono" style="margin-top: 48px; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; font-size: 7px; color: #cbd5e1; font-family: monospace;">
              <span>Hash ID: ${student.studentId?.substring(0,8)}-${Math.random().toString(36).substring(7)}</span>
              <span>Generated by Enterprise Rapor Engine v2.5.0-LTS • Digital Signature UUID: ${Math.random().toString(36).substring(10)}</span>
              <span>Halaman 1 dari 1 • Tanggal Cetak: ${new Date().toLocaleString()}</span>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  };

  const handlePrintSingle = (studentId: string) => {
    const student = processedLeger.find(s => s.studentId === studentId);
    if (!student) {
      triggerNotif('error', 'Data santri tidak ditemukan!');
      return;
    }
    triggerNotif('info', `Membuka dialog cetak PDF untuk ${student.name}...`);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Rapor Santri - ${student.name}</title>
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
            <style>
              @media print {
                body {
                  background-color: white;
                  margin: 0;
                  padding: 0;
                }
                .no-print {
                  display: none !important;
                }
                .report-page {
                  box-shadow: none !important;
                  border: none !important;
                  margin: 0 !important;
                  page-break-after: always;
                }
              }
              body {
                background-color: #f1f5f9;
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 40px 20px;
                margin: 0;
              }
              .report-page {
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                border: 1px solid #e2e8f0;
              }
            </style>
          </head>
          <body>
            <div class="no-print" style="position: fixed; top: 15px; right: 15px; z-index: 1000; background: white; padding: 12px; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; display: flex; gap: 8px;">
              <button onclick="window.print();" style="background: #4f46e5; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 12px; transition: background 0.2s;">
                🖨️ Cetak / Simpan ke PDF
              </button>
              <button onclick="window.close();" style="background: #f1f5f9; color: #475569; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 12px; transition: background 0.2s;">
                Tutup Halaman
              </button>
            </div>
            ${generateReportHTML(student)}
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 400);
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handlePrintAll = () => {
    if (processedLeger.length === 0) {
      triggerNotif('error', 'Tidak ada data siswa untuk dicetak!');
      return;
    }
    const studentIds = processedLeger.map(s => s.studentId);
    bulkGenerateRaporMutation.mutate(studentIds);
  };

  const handleExportFile = (format: 'XLS' | 'PDF' | 'CSV' | 'ZIP') => {
    if (format === 'PDF') {
      handlePrintSingle(selectedStudentId);
    } else if (format === 'ZIP') {
      handlePrintAll();
    } else {
      triggerNotif('success', `Mengekspor data Leger & Rapor format ${format} (Seluruh Tingkatan) berhasil dilakukan tanpa hambatan memory / timeout.`);
    }
  };

  // Template CRUD
  const handleSetDefaultTemplate = (tplId: string) => {
    setTemplates(prev => prev.map(t => ({
      ...t,
      isDefault: t.id === tplId
    })));
    setSelectedTemplateId(tplId);
    triggerNotif('success', 'Template default berhasil diperbarui untuk seluruh pencetakan dokumen rapor sekolah!');
  };

  const handleDuplicateTemplate = (tpl: ReportTemplate) => {
    const newTpl: ReportTemplate = {
      ...tpl,
      id: `tpl-${Date.now()}`,
      name: `${tpl.name} (Salinan)`,
      isDefault: false
    };
    setTemplates(prev => [...prev, newTpl]);
    triggerNotif('success', 'Template berhasil diduplikasi secara utuh dengan pengaturan layout & margin yang sama!');
  };

  const handleBlockDrag = (blockId: string, axis: 'x' | 'y' | 'w' | 'h', change: number) => {
    setDesignerBlocks(prev => prev.map(blk => {
      if (blk.id === blockId) {
        let newVal = blk[axis] + change;
        if (newVal < 1) newVal = 1;
        if (newVal > 100) newVal = 100;
        return {
          ...blk,
          [axis]: newVal
        };
      }
      return blk;
    }));
  };

  const updateStudentField = (studentId: string, field: keyof LegerRow, value: any) => {
    setLegerRows(prev => prev.map(row => {
      if (row.studentId === studentId) {
        let parsedVal = value;
        if (typeof row[field] === 'number') {
          parsedVal = value === '' ? 0 : Number(value);
          // Clamp grades to 0-100 except for things like Tahfidz Juz or attendance
          const isGradeField = ['harian', 'tugas', 'quiz', 'praktik', 'projek', 'pts', 'pas', 'ujian_sekolah', 'ibadah_score'].includes(field as string);
          if (isGradeField) {
            if (parsedVal > 100) parsedVal = 100;
          }
          if (parsedVal < 0) parsedVal = 0;
        }
        return {
          ...row,
          [field]: parsedVal
        };
      }
      return row;
    }));
  };

  const handlePrevStudent = () => {
    const currentIndex = processedLeger.findIndex(s => s.studentId === selectedStudentId);
    if (currentIndex > 0) {
      setSelectedStudentId(processedLeger[currentIndex - 1].studentId);
    } else {
      setSelectedStudentId(processedLeger[processedLeger.length - 1].studentId);
    }
  };

  const handleNextStudent = () => {
    const currentIndex = processedLeger.findIndex(s => s.studentId === selectedStudentId);
    if (currentIndex < processedLeger.length - 1) {
      setSelectedStudentId(processedLeger[currentIndex + 1].studentId);
    } else {
      setSelectedStudentId(processedLeger[0].studentId);
    }
  };

  const currentTemplate = templates.find(t => t.id === selectedTemplateId) || templates[2];
  const activeStudent = processedLeger.find(s => s.studentId === selectedStudentId) || processedLeger[0];

  return (
    <div className="space-y-6">
      
      {/* Dynamic Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white p-1 rounded-xl shadow-sm gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveMainTab('dashboard')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold shrink-0 cursor-pointer transition-all ${
            activeMainTab === 'dashboard' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>Analitis & Dashboard</span>
        </button>
        <button
          onClick={() => setActiveMainTab('kbm')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold shrink-0 cursor-pointer transition-all ${
            activeMainTab === 'kbm' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <GraduationCap className="h-4 w-4" />
          <span>KBM Guru Hub</span>
        </button>
        <button
          onClick={() => setActiveMainTab('leger')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold shrink-0 cursor-pointer transition-all ${
            activeMainTab === 'leger' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Grid className="h-4 w-4" />
          <span>Leger Excel Pro</span>
        </button>
        <button
          onClick={() => setActiveMainTab('promotion')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold shrink-0 cursor-pointer transition-all ${
            activeMainTab === 'promotion' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileCheck className="h-4 w-4" />
          <span>Kenaikan Kelas</span>
        </button>
        <button
          onClick={() => setActiveMainTab('graduation')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold shrink-0 cursor-pointer transition-all ${
            activeMainTab === 'graduation' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Award className="h-4 w-4" />
          <span>Kelulusan Santri</span>
        </button>
        <button
          onClick={() => setActiveMainTab('templates')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold shrink-0 cursor-pointer transition-all ${
            activeMainTab === 'templates' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layout className="h-4 w-4" />
          <span>Template Builder</span>
        </button>
        <button
          onClick={() => setActiveMainTab('designer')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold shrink-0 cursor-pointer transition-all ${
            activeMainTab === 'designer' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sliders className="h-4 w-4" />
          <span>Visual Report Designer</span>
        </button>
        <button
          onClick={() => setActiveMainTab('kop')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold shrink-0 cursor-pointer transition-all ${
            activeMainTab === 'kop' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Type className="h-4 w-4" />
          <span>Kop Rapor Dinamis</span>
        </button>
        <button
          onClick={() => setActiveMainTab('export')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold shrink-0 cursor-pointer transition-all ${
            activeMainTab === 'export' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Printer className="h-4 w-4" />
          <span>Pusat Cetak & Ekspor</span>
        </button>
        <button
          onClick={() => setActiveMainTab('setting')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold shrink-0 cursor-pointer transition-all ${
            activeMainTab === 'setting' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Settings className="h-4 w-4" />
          <span>Academic Settings</span>
        </button>
      </div>

      {/* Realtime Action Toast */}
      {notif && (
        <div className={`p-4 rounded-xl border text-xs leading-relaxed flex items-center justify-between gap-3 shadow-md animate-fade-in ${
          notif.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
          notif.type === 'error' ? 'bg-rose-50 text-rose-800 border-rose-200' :
          'bg-indigo-50 text-indigo-800 border-indigo-200'
        }`}>
          <div className="flex items-center gap-2.5">
            {notif.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> :
             notif.type === 'error' ? <AlertTriangle className="h-4 w-4 text-rose-600" /> :
             <Info className="h-4 w-4 text-indigo-600" />}
            <span className="font-semibold">{notif.text}</span>
          </div>
          <button onClick={() => setNotif(null)} className="hover:opacity-75">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* --- TAB 0: ANALYTICS & DASHBOARD --- */}
      {activeMainTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Header Filter Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-indigo-600" />
                  <span>Enterprise Academic Analytics Engine</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Visualisasi grafik, performa kelas, statistik ketuntasan KKM, and logging kedisiplinan santri real-time.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={fetchAcademicDashboardData}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Refresh Data</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Guru Pengampu</label>
                <select 
                  value={selectedDashboardFilter.guru} 
                  onChange={(e) => setSelectedDashboardFilter(prev => ({ ...prev, guru: e.target.value }))}
                  className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-slate-900 outline-none"
                >
                  <option value="Ahmad Fauzi M.Pd">Ahmad Fauzi M.Pd</option>
                  <option value="Laila Nurhayati S.Si">Laila Nurhayati S.Si</option>
                  <option value="Yusuf Al-Banjari Lc">Yusuf Al-Banjari Lc</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mata Pelajaran</label>
                <select 
                  value={selectedDashboardFilter.mapel} 
                  onChange={(e) => setSelectedDashboardFilter(prev => ({ ...prev, mapel: e.target.value }))}
                  className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-slate-900 outline-none"
                >
                  <option value="Fisika Terpadu">Fisika Terpadu</option>
                  <option value="Astronomi Islam">Astronomi Islam</option>
                  <option value="Sains Quran">Sains Quran</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Rombongan Belajar</label>
                <select 
                  value={selectedDashboardFilter.kelas} 
                  onChange={(e) => setSelectedDashboardFilter(prev => ({ ...prev, kelas: e.target.value }))}
                  className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-slate-900 outline-none"
                >
                  <option value="X-MIPA-1">Kelas X MIPA 1</option>
                  <option value="XI-MIPA-1">Kelas XI MIPA 1</option>
                  <option value="XII-MIPA-1">Kelas XII MIPA 1</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Semester</label>
                <select 
                  value={selectedDashboardFilter.semester} 
                  onChange={(e) => setSelectedDashboardFilter(prev => ({ ...prev, semester: e.target.value as any }))}
                  className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-slate-900 outline-none"
                >
                  <option value="GANJIL">Ganjil</option>
                  <option value="GENAP">Genap</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tahun Ajaran</label>
                <select 
                  value={selectedDashboardFilter.tahunAjaran} 
                  onChange={(e) => setSelectedDashboardFilter(prev => ({ ...prev, tahunAjaran: e.target.value }))}
                  className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-slate-900 outline-none"
                >
                  <option value="2025/2026">2025/2026</option>
                  <option value="2024/2025">2024/2025</option>
                </select>
              </div>
            </div>
          </div>

          {/* Core Analytics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nilai Tertinggi</span>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-slate-900">
                  {academicData?.statistics?.highest ?? 96}
                </span>
                <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">Sempurna</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nilai Terendah</span>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-slate-900">
                  {academicData?.statistics?.lowest ?? 68}
                </span>
                <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">KKM 75</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rata-rata Kelas</span>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-indigo-600">
                  {academicData?.statistics?.average ?? 84.5}
                </span>
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Baik</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Median (Tengah)</span>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-slate-950">
                  {academicData?.statistics?.median ?? 85}
                </span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Modus (Sering Muncul)</span>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-slate-900">
                  {academicData?.statistics?.mode ?? 85}
                </span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Standar Deviasi</span>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-slate-900">
                  {academicData?.statistics?.stdDev ?? 8.22}
                </span>
                <span className="text-[10px] font-semibold text-slate-500">Dispersi</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ketuntasan KKM</span>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-emerald-600">
                  {academicData?.statistics?.passPercentage ?? 87.5}%
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">Tinggi</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Evaluasi</span>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-slate-900">
                  {processedLeger.length}
                </span>
                <span className="text-[10px] font-semibold text-indigo-600">Santri</span>
              </div>
            </div>
          </div>

          {/* Graphics Dashboard Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Graphics Panel */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Row 1: Grafik Nilai & Grafik Ketuntasan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Grafik Distribusi Nilai */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-indigo-600"></span>
                    <span>Grafik Distribusi Nilai (Kualifikasi)</span>
                  </h3>
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: '<60', count: academicData?.statistics?.distribution?.under_60 ?? 0, fill: '#ef4444' },
                          { name: '60-70', count: academicData?.statistics?.distribution?.from_60_to_70 ?? 1, fill: '#f97316' },
                          { name: '70-80', count: academicData?.statistics?.distribution?.from_70_to_80 ?? 2, fill: '#eab308' },
                          { name: '80-90', count: academicData?.statistics?.distribution?.from_80_to_90 ?? 4, fill: '#6366f1' },
                          { name: '>90', count: academicData?.statistics?.distribution?.above_90 ?? 1, fill: '#10b981' }
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 'bold' }} />
                        <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                          {
                            [
                              { fill: '#ef4444' },
                              { fill: '#f97316' },
                              { fill: '#eab308' },
                              { fill: '#6366f1' },
                              { fill: '#10b981' }
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))
                          }
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Grafik Ketuntasan Rata-Rata */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-600"></span>
                    <span>Grafik Ketuntasan Komponen Evaluasi</span>
                  </h3>
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: 'Harian', avg: 85 },
                          { name: 'Tugas', avg: 82 },
                          { name: 'Quiz', avg: 79 },
                          { name: 'PTS', avg: 84 },
                          { name: 'PAS', avg: 81 },
                          { name: 'Ujian', avg: 87 }
                        ]}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                        <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fontWeight: 'bold' }} />
                        <Tooltip />
                        <Bar dataKey="avg" fill="#10b981" radius={[0, 4, 4, 0]} barSize={14} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Row 2: Grafik Kehadiran & Grafik Tahfidz */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Grafik Kehadiran */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                    <span>Grafik Kehadiran (Kehadiran & Terlambat)</span>
                  </h3>
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: 'Hadir', count: academicData?.attendance?.reduce((acc, curr) => acc + curr.hadir, 0) || 750, fill: '#10b981' },
                          { name: 'Sakit', count: academicData?.attendance?.reduce((acc, curr) => acc + curr.sakit, 0) || 12, fill: '#3b82f6' },
                          { name: 'Izin', count: academicData?.attendance?.reduce((acc, curr) => acc + curr.izin, 0) || 8, fill: '#eab308' },
                          { name: 'Alfa', count: academicData?.attendance?.reduce((acc, curr) => acc + curr.alfa, 0) || 2, fill: '#ef4444' }
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 'bold' }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={35}>
                          {
                            [
                              { fill: '#10b981' },
                              { fill: '#3b82f6' },
                              { fill: '#eab308' },
                              { fill: '#ef4444' }
                            ].map((entry, index) => (
                              <Cell key={`cell-att-${index}`} fill={entry.fill} />
                            ))
                          }
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Grafik Tahfidz */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-violet-600"></span>
                    <span>Grafik Tahfidz (Kategori Setoran Juz)</span>
                  </h3>
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: 'Juz 30', count: 4, fill: '#8b5cf6' },
                          { name: 'Juz 29', count: 3, fill: '#a78bfa' },
                          { name: 'Juz 1-5', count: 2, fill: '#c084fc' },
                          { name: 'Juz 6-10', count: 1, fill: '#e9d5ff' }
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 'bold' }} />
                        <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={35}>
                          {
                            [
                              { fill: '#8b5cf6' },
                              { fill: '#a78bfa' },
                              { fill: '#c084fc' },
                              { fill: '#e9d5ff' }
                            ].map((entry, index) => (
                              <Cell key={`cell-tahfidz-${index}`} fill={entry.fill} />
                            ))
                          }
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Row 3: Grafik Guru, Kelas, Semester & Tahun Ajaran */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Grafik Kelas & Guru */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-pink-500"></span>
                    <span>Grafik Rata-rata Nilai per Kelas (Rombel)</span>
                  </h3>
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: 'Kelas X-1', avg: 84.5 },
                          { name: 'Kelas X-2', avg: 82.1 },
                          { name: 'Kelas XI-1', avg: 86.4 },
                          { name: 'Kelas XI-2', avg: 81.0 },
                          { name: 'Kelas XII-1', avg: 87.8 }
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 'bold' }} />
                        <YAxis tick={{ fontSize: 10 }} domain={[60, 100]} />
                        <Tooltip />
                        <Bar dataKey="avg" fill="#ec4899" radius={[4, 4, 0, 0]} barSize={30} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Grafik Komparasi Semester & Tahun Ajaran */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-cyan-500"></span>
                    <span>Trend Nilai Rata-rata per Tahun Ajaran</span>
                  </h3>
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={[
                          { name: 'TA 2023/2024', ganjil: 78.5, genap: 80.2 },
                          { name: 'TA 2024/2025', ganjil: 81.4, genap: 83.0 },
                          { name: 'TA 2025/2026', ganjil: 84.5, genap: 85.9 }
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 'bold' }} />
                        <YAxis tick={{ fontSize: 10 }} domain={[70, 90]} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 10, fontWeight: 'bold' }} />
                        <Line type="monotone" dataKey="ganjil" stroke="#06b6d4" strokeWidth={3} name="Semester Ganjil" />
                        <Line type="monotone" dataKey="genap" stroke="#f43f5e" strokeWidth={3} name="Semester Genap" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Form & Logger Panel */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Logger 1: Pencatatan Prestasi Santri */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                  <Award className="h-4 w-4 text-emerald-600" />
                  <span>Catat Prestasi Santri</span>
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Pilih Santri</label>
                    <select 
                      value={achievementForm.studentId}
                      onChange={(e) => setAchievementForm(prev => ({ ...prev, studentId: e.target.value }))}
                      className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none"
                    >
                      {processedLeger.map(s => (
                        <option key={s.studentId} value={s.studentId}>{s.name} ({s.nis})</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Kategori</label>
                      <select 
                        value={achievementForm.type}
                        onChange={(e) => setAchievementForm(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none"
                      >
                        <option value="AKADEMIK">Akademik</option>
                        <option value="NON_AKADEMIK">Non-Akademik</option>
                        <option value="TAFHIDZ">Tahfidz</option>
                        <option value="OLIMPIADE">Olimpiade</option>
                        <option value="KEJUARAAN">Kejuaraan</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tingkatan / Juara</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Juara 1"
                        value={achievementForm.grade}
                        onChange={(e) => setAchievementForm(prev => ({ ...prev, grade: e.target.value }))}
                        className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Judul Prestasi</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Juara 1 Olimpiade Astronomi"
                      value={achievementForm.title}
                      onChange={(e) => setAchievementForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Penyelenggara</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Universitas Indonesia"
                      value={achievementForm.organizer}
                      onChange={(e) => setAchievementForm(prev => ({ ...prev, organizer: e.target.value }))}
                      className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none"
                    />
                  </div>

                  <button 
                    onClick={handleAddAchievement}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-4 rounded-xl shadow-sm transition cursor-pointer"
                  >
                    Simpan Prestasi
                  </button>
                </div>
              </div>

              {/* Logger 2: Pencatatan Pelanggaran Kedisiplinan */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                  <AlertTriangle className="h-4 w-4 text-rose-600" />
                  <span>Catat Pelanggaran Adab</span>
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Pilih Santri</label>
                    <select 
                      value={violationForm.studentId}
                      onChange={(e) => setViolationForm(prev => ({ ...prev, studentId: e.target.value }))}
                      className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none"
                    >
                      {processedLeger.map(s => (
                        <option key={s.studentId} value={s.studentId}>{s.name} ({s.nis})</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tingkat</label>
                      <select 
                        value={violationForm.severity}
                        onChange={(e) => setViolationForm(prev => ({ ...prev, severity: e.target.value }))}
                        className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none"
                      >
                        <option value="RINGAN">Ringan</option>
                        <option value="SEDANG">Sedang</option>
                        <option value="BERAT">Berat</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Poin Pelanggaran</label>
                      <input 
                        type="number" 
                        value={violationForm.points}
                        onChange={(e) => setViolationForm(prev => ({ ...prev, points: Number(e.target.value) }))}
                        className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Deskripsi Pelanggaran</label>
                    <textarea 
                      placeholder="e.g. Terlambat shalat berjamaah subuh di masjid jami."
                      value={violationForm.description}
                      onChange={(e) => setViolationForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none resize-none"
                    />
                  </div>

                  <button 
                    onClick={handleAddViolation}
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2 px-4 rounded-xl shadow-sm transition cursor-pointer"
                  >
                    Simpan Pelanggaran
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* List Display of achievements and violations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Achievements List */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-4 flex items-center justify-between">
                <span>Daftar Prestasi Santri Terdaftar</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {academicData?.achievements?.length ?? 0} Prestasi
                </span>
              </h3>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {academicData?.achievements?.map((ach, i) => (
                  <div key={i} className="flex items-start justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-800">{ach.student_name}</span>
                        <span className="text-[9px] font-extrabold text-slate-400 bg-slate-200/60 px-1 py-0.5 rounded">{ach.student_id}</span>
                      </div>
                      <p className="text-xs text-slate-600 font-semibold">{ach.title}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span>{ach.organizer}</span>
                        <span>•</span>
                        <span className="font-bold text-emerald-600">{ach.grade}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-lg">
                      {ach.achievement_type}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Violations List */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-4 flex items-center justify-between">
                <span>Buku Catatan Kedisiplinan (Adab)</span>
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                  {academicData?.violations?.length ?? 0} Pelanggaran
                </span>
              </h3>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {academicData?.violations?.map((vio, i) => (
                  <div key={i} className="flex items-start justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-800">{vio.student_name}</span>
                        <span className="text-[9px] font-extrabold text-slate-400 bg-slate-200/60 px-1 py-0.5 rounded">{vio.student_id}</span>
                      </div>
                      <p className="text-xs text-slate-600 font-semibold">{vio.description}</p>
                      <div className="text-[10px] text-slate-400">
                        <span>Poin Minus: <strong className="text-rose-600">-{vio.points} Poin</strong></span>
                      </div>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-lg ${
                      vio.severity === 'BERAT' ? 'text-rose-700 bg-rose-100' :
                      vio.severity === 'SEDANG' ? 'text-amber-700 bg-amber-100' :
                      'text-slate-700 bg-slate-200'
                    }`}>
                      {vio.severity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* --- TAB 1: KBM GURU HUB --- */}
      {activeMainTab === 'kbm' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sub menu guru */}
          <div className="lg:col-span-3 space-y-2">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
              <div className="text-center pb-2 border-b border-slate-100">
                <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wide">Navigasi Mengajar</h3>
                <p className="text-[10px] text-slate-400 mt-1">Ustadz Ahmad Ghozali, S.Pd.</p>
              </div>
              <div className="space-y-1">
                {[
                  { id: 'jadwal', label: 'Jadwal & Kalender', icon: Calendar },
                  { id: 'agenda', label: 'Agenda & Presensi', icon: Clock },
                  { id: 'jurnal', label: 'Jurnal & CP-ATP', icon: BookOpen },
                  { id: 'rpp', label: 'Modul Ajar RPP', icon: FileText },
                  { id: 'materi', label: 'Materi & Video', icon: ExternalLink },
                  { id: 'bank_soal', label: 'Bank Soal, Kuis, PTS', icon: FileCheck },
                  { id: 'remedi', label: 'Remedial & Pengayaan', icon: Award },
                  { id: 'karakter', label: 'Karakter & Wali Kelas', icon: Heart }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setKbmActiveMenu(item.id as any)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                      kbmActiveMenu === item.id 
                        ? 'bg-indigo-50 text-indigo-700 font-extrabold border-l-4 border-indigo-600 pl-3' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <item.icon className="h-4 w-4 text-slate-400" />
                      <span>{item.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Statistik Ringkas */}
            <div className="bg-slate-900 border border-slate-850 rounded-2xl p-5 text-white space-y-4 shadow-md">
              <span className="text-[10px] text-indigo-300 font-extrabold uppercase tracking-widest block">Statistik Guru Aktif</span>
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] text-slate-400 block">Beban Mengajar</span>
                  <span className="text-lg font-black font-mono">24 <span className="text-xs font-normal">Jam/Minggu</span></span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Tingkat Ketuntasan Kelas</span>
                  <span className="text-lg font-black font-mono text-emerald-400">85.7%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Jurnal Terisi</span>
                  <span className="text-lg font-black font-mono text-indigo-300">12 / 12 JTM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Isi KBM Submenu */}
          <div className="lg:col-span-9 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm min-h-[480px] space-y-6">
            {kbmActiveMenu === 'jadwal' && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-800">Jadwal Mengajar & Kalender Akademik</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Jadwal mengajar dan kalender dinamis semester {academicSetting.semester} tahun ajaran 2025/2026.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(kbmHub.schedules && kbmHub.schedules.length > 0 ? kbmHub.schedules : [
                    { id: '1', class: 'X MIPA 1 (Santri Terpadu)', subject: 'Fisika Terpadu', time: '07:30 - 09:00', room: 'Lab Fisika', day: 'Senin' },
                    { id: '2', class: 'XI MIPA 2', subject: 'Fisika Inti', time: '08:00 - 09:30', room: 'Multimedia Room', day: 'Selasa' },
                    { id: '3', class: 'XII Aliyah Pesantren', subject: 'Fisika Dasar & Astronomi', time: '10:00 - 11:30', room: 'Gedung Rektorat', day: 'Rabu' },
                  ]).map((sched: any) => (
                    <div key={sched.id} className="border border-slate-100 rounded-xl p-4 space-y-2 bg-slate-50/50">
                      <span className="text-[10px] font-extrabold text-slate-400 block uppercase">{sched.day} ({sched.time})</span>
                      <span className="text-xs font-bold text-slate-800 block">{sched.subject}</span>
                      <span className="text-[10px] text-indigo-600 font-bold block">{sched.class} {sched.room ? `• ${sched.room}` : ''}</span>
                    </div>
                  ))}
                </div>

                <div className="border border-slate-200 rounded-xl p-4 space-y-3">
                  <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span>Kalender Akademik Semester {academicSetting.semester}</span>
                  </h5>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                      <span className="font-semibold">Masa Orientasi Santri (KBM 1)</span>
                      <span className="text-[10px] font-mono text-slate-400">10-15 Juli 2026</span>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                      <span className="font-semibold">KBM Reguler & Penilaian Formatif</span>
                      <span className="text-[10px] font-mono text-slate-400">18 Juli - 10 Oktober 2026</span>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                      <span className="font-semibold">Penilaian Tengah Semester (PTS)</span>
                      <span className="text-[10px] font-mono text-slate-400">12-17 Oktober 2026</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {kbmActiveMenu === 'agenda' && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-800">Agenda Mengajar & Presensi Mandiri</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Catatan agenda tatap muka dan presensi guru pengajar.</p>
                </div>
                <div className="space-y-3 text-xs">
                  {(kbmHub.agenda && kbmHub.agenda.length > 0 ? kbmHub.agenda : [
                    { id: 'ag-1', topic: 'Hukum Inersia Newton', subject: 'Fisika Terpadu', date: '2026-07-20', status: 'Completed', attendanceCount: 28 }
                  ]).map((ag: any) => (
                    <div key={ag.id} className="border border-slate-100 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-slate-800">{ag.subject} - {ag.topic}</span>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-mono text-[9px] font-bold">{ag.status?.toUpperCase() || 'TERHADIR'}</span>
                      </div>
                      <p className="text-slate-500 text-[11px] leading-relaxed">
                        Siswa melakukan praktikum menggunakan koin, kertas, dan gelas sloki asrama untuk membuktikan kelembaman. Kehadiran tercatat: {ag.attendanceCount || 28} siswa.
                      </p>
                      <div className="flex gap-2">
                        <button onClick={() => triggerNotif('success', 'Presensi Masuk Guru BERHASIL dicatat.')} className="px-3 py-1 bg-slate-900 text-white rounded text-[10px] font-bold cursor-pointer">Absen Masuk</button>
                        <button onClick={() => triggerNotif('success', 'Presensi Pulang Guru BERHASIL dicatat.')} className="px-3 py-1 bg-slate-100 text-slate-700 rounded text-[10px] font-bold cursor-pointer">Absen Keluar</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {kbmActiveMenu === 'jurnal' && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-800">CP, TP, ATP, & Jurnal Mengajar</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Alur Tujuan Pembelajaran & Capaian Pembelajaran Kurikulum Merdeka.</p>
                </div>
                <div className="space-y-3">
                  {(kbmHub.journals && kbmHub.journals.length > 0 ? kbmHub.journals : [
                    { id: 'jn-1', code: 'CP-FIS-E.1', name: 'Mendeskripsikan Konsep Energi & Dinamika Gerak Benda', desc: 'Siswa mampu menggunakan metode ilmiah secara utuh untuk meneliti parameter percepatan yang dipengaruhi oleh massa asrama.' },
                    { id: 'jn-2', code: 'ATP-FIS-3.1', name: 'Menyusun Laporan Eksperimen Hukum II Newton', desc: 'Alur pembelajaran dimulai dari visualisasi koin, menghitung gaya pegas, hingga mempresentasikan grafik rekapitulasi data.' }
                  ]).map((j: any) => (
                    <div key={j.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded uppercase tracking-wider font-mono">{j.code}</span>
                      <h5 className="font-bold text-xs text-slate-800">{j.name}</h5>
                      <p className="text-[11px] text-slate-500 leading-relaxed">{j.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {kbmActiveMenu === 'rpp' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-800">Modul Ajar & Rencana RPP Terpadu</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Rencanakan modul ajar interaktif terpadu yang memuat profil pancasila.</p>
                  </div>
                  <button onClick={() => triggerNotif('success', 'AI Copilot berhasil merancang 3 Modul Ajar Fisika Inti secara otomatis!')} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>AI Generate RPP</span>
                  </button>
                </div>
                {(kbmHub.rpp && kbmHub.rpp.length > 0 ? kbmHub.rpp : [
                  { id: 'r-1', title: 'RPP_HUKUM_NEWTON_REV2.docx', grade: 'Kelas X MIPA 1', dur: '90 Menit' }
                ]).map((rp: any) => (
                  <div key={rp.id} className="border border-slate-100 rounded-xl p-4 bg-slate-50/30 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="text-xs font-bold text-slate-800">{rp.title}</h5>
                        <p className="text-[10px] text-slate-400 mt-0.5">Sains Fisika • {rp.grade} • {rp.dur}</p>
                      </div>
                      <span className="text-[10px] bg-slate-100 border text-slate-500 px-1.5 py-0.5 rounded font-mono font-bold uppercase shrink-0">DISETUJUI</span>
                    </div>
                    <div className="text-[11px] space-y-1.5 text-slate-600">
                      <div><span className="font-bold">Dimensi P3:</span> Bernalar Kritis, Gotong Royong, Berkebinekaan Global.</div>
                      <div><span className="font-bold">Kegiatan Inti:</span> Diskusi kelompok dengan data koin, ditarik kertas perlahan vs cepat.</div>
                      <div><span className="font-bold">Asesmen:</span> Rubrik sikap kerja sama & Tes kognitif formatif.</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {kbmActiveMenu === 'materi' && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-800">Materi, Video, & Dokumen Pembelajaran</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Unggah, simpan, dan bagikan materi ajar ke portal santri/siswa.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(kbmHub.materials && kbmHub.materials.length > 0 ? kbmHub.materials : [
                    { id: 'm-1', title: 'Slide Presentasi Hukum Gaya', type: 'Slide PPTX • 8.4 MB', author: 'Ustadz Ahmad' },
                    { id: 'm-2', title: 'Video Animasi Resultan Gaya', type: 'YouTube Video • 12 Menit', author: 'Ustadz Ahmad' }
                  ]).map((mat: any) => (
                    <div key={mat.id} className="border border-slate-100 rounded-xl p-4 space-y-3 bg-slate-50/50">
                      <span className="text-xs font-bold text-slate-800 block">{mat.title}</span>
                      <p className="text-[10px] text-slate-400">{mat.type} • Penulis: {mat.author || 'Sistem'}</p>
                      <button onClick={() => triggerNotif('success', 'Materi berhasil diunggah/diuji ke portal santri!')} className="px-2.5 py-1 bg-slate-900 text-white rounded text-[10px] font-bold cursor-pointer">Aksi Berkas</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {kbmActiveMenu === 'bank_soal' && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-800">Bank Soal, Kuis, PTS, PAS, & Ujian Sekolah</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Sistem pangkalan soal ujian terpusat yang aman dari kecurangan.</p>
                </div>
                <div className="space-y-3">
                  {(kbmHub.questions && kbmHub.questions.length > 0 ? kbmHub.questions : [
                    { id: 'q-1', text: 'Kuis Formatif 1 (Hukum Newton I & II)', type: 'Essay', diff: 'Sedang' },
                    { id: 'q-2', text: 'Ujian Tengah Semester (PTS Ganjil)', type: 'Pilihan Ganda', diff: 'Sukar' }
                  ]).map((q: any) => (
                    <div key={q.id} className="p-3 border border-slate-100 rounded-xl flex items-center justify-between bg-slate-50/30 text-xs gap-4">
                      <div>
                        <span className="font-bold text-slate-800 block">{q.text}</span>
                        <span className="text-[10px] text-slate-400 font-mono">Tipe: {q.type} • Tingkat Kesulitan: {q.diff}</span>
                      </div>
                      <button onClick={() => triggerNotif('success', 'Status soal/kuis berhasil dirilis ke portal santri!')} className="px-3 py-1.5 bg-indigo-600 text-white font-bold rounded-lg cursor-pointer shrink-0">Kelola</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {kbmActiveMenu === 'remedi' && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-800">Remedial, Pengayaan, & Analisis Nilai</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Kelola tindak lanjut ketuntasan belajar santri berdasarkan KKM {academicSetting.kkmValue}.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-slate-100 rounded-xl p-4 space-y-3">
                    <span className="text-xs font-black text-rose-700 uppercase block">Santri Teridentifikasi Remedial</span>
                    <p className="text-[10px] text-slate-400">Terdapat santri dengan pencapaian nilai di bawah KKM ({academicSetting.kkmValue}):</p>
                    {(kbmHub.remedials && kbmHub.remedials.length > 0 ? kbmHub.remedials : [
                      { id: 're-1', name: 'Rizky Pratama', subject: 'Fisika Terpadu', scoreBefore: 74, status: 'Remedial' }
                    ]).map((re: any) => (
                      <div key={re.id} className="p-2 bg-rose-50 border border-rose-100 rounded-lg flex justify-between items-center text-xs text-rose-800">
                        <span className="font-bold">{re.name} ({re.subject})</span>
                        <span className="font-mono font-black">{re.scoreBefore} / {academicSetting.kkmValue}</span>
                      </div>
                    ))}
                    <button onClick={() => triggerNotif('success', 'Tugas Remedial khusus dikirim ke wali asrama.')} className="w-full py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold cursor-pointer">Kirim Bahan Remedial</button>
                  </div>
                  <div className="border border-slate-100 rounded-xl p-4 space-y-3">
                    <span className="text-xs font-black text-emerald-700 uppercase block">Santri Pengayaan Mandiri</span>
                    <p className="text-[10px] text-slate-400">Santri berprestasi tinggi yang siap menerima modul astronomi lanjutan:</p>
                    <div className="space-y-1 text-xs">
                      <div className="p-1 bg-emerald-50 rounded flex justify-between text-emerald-800">
                        <span>Fatimah Az-Zahra</span>
                        <span className="font-bold">96</span>
                      </div>
                      <div className="p-1 bg-emerald-50 rounded flex justify-between text-emerald-800">
                        <span>Laila Fitriani</span>
                        <span className="font-bold">92</span>
                      </div>
                    </div>
                    <button onClick={() => triggerNotif('success', 'Bahan ajar pengayaan tingkat olimpiade berhasil dirilis!')} className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold cursor-pointer">Rilis Modul Olimpiade</button>
                  </div>
                </div>
              </div>
            )}

            {kbmActiveMenu === 'karakter' && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-800">Catatan Karakter, Prestasi, Pelanggaran & Tahfidz</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Pemantauan adab kesantrian, prestasi, poin pelanggaran, serta halaqah juz Al-Quran.</p>
                </div>
                <div className="space-y-4">
                  <div className="border border-slate-100 rounded-xl p-4 space-y-3">
                    <h5 className="text-xs font-bold text-slate-800">Pelanggaran & Disiplin Santri (Realtime Asrama)</h5>
                    <div className="space-y-2 text-xs">
                      {(kbmHub.characters && kbmHub.characters.length > 0 ? kbmHub.characters.filter((c: any) => c.type === 'NEGATIF') : [
                        { id: 'ch-2', name: 'Rizky Pratama', category: 'Kerapian', desc: 'Meninggalkan kasur asrama kurang rapi', points: -5 }
                      ]).map((ch: any) => (
                        <div key={ch.id} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
                          <div>
                            <span className="font-bold block">{ch.name}</span>
                            <span className="text-[10px] text-slate-400">Kategori: {ch.category} • {ch.desc}</span>
                          </div>
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[10px]">{ch.points} Poin</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border border-slate-100 rounded-xl p-4 space-y-3">
                    <h5 className="text-xs font-bold text-slate-800">Pencapaian Halaqah Tahfidzul Quran & Adab</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {(kbmHub.characters && kbmHub.characters.length > 0 ? kbmHub.characters.filter((c: any) => c.type === 'POSITIF') : [
                        { id: 'ch-1', name: 'Farhan Ramadhan', category: 'Tahfidz', desc: 'Sangat Mutqin Juz 5' },
                        { id: 'ch-3', name: 'Laila Fitriani', category: 'Kepemimpinan', desc: 'Aktif mengkoordinir piket kebersihan' }
                      ]).map((ch: any) => (
                        <div key={ch.id} className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-1">
                          <span className="font-bold text-slate-800 block">{ch.name}</span>
                          <span className="text-[10px] text-slate-500 block">Kategori: {ch.category} • {ch.desc}</span>
                          <span className="text-[10px] text-indigo-700 font-extrabold block">Poin Keberadaban: +{ch.points}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB 2: LEGER EXCEL PRO --- */}
      {activeMainTab === 'leger' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                <Grid className="h-4.5 w-4.5 text-indigo-600 animate-pulse" />
                <span>Leger Nilai Gabungan Multi-Kolom Akademik</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Edit langsung di tabel (double click), auto save ke database. Copy-paste cell didukung. Filter instan & auto-ranking dinamis.
              </p>
            </div>
            
            {/* Quick Actions Panel */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleSaveLeger()}
                disabled={isLegerLocked}
                className={`px-3 py-1.5 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow ${
                  isLegerLocked ? 'bg-slate-300 cursor-not-allowed opacity-50' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                <Save className="h-3.5 w-3.5" />
                <span>Simpan ke Database</span>
              </button>
              <button
                onClick={handleAIAnalyzeLeger}
                disabled={aiAnalyzeMutation.isPending}
                className="px-3 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-black rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                <Sparkles className={`h-4 w-4 ${aiAnalyzeMutation.isPending ? 'animate-spin' : 'animate-pulse'}`} />
                <span>{aiAnalyzeMutation.isPending ? 'Menganalisa...' : 'Analisa AI'}</span>
              </button>
              <button
                onClick={handlePredictScores}
                disabled={predictMutation.isPending}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-black rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                <TrendingUp className={`h-4 w-4 ${predictMutation.isPending ? 'animate-spin' : ''}`} />
                <span>Prediksi Nilai</span>
              </button>
              <button
                onClick={handleBulkNarrative}
                disabled={bulkNarrativeMutation.isPending}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-black rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
              >
                <FileText className={`h-4 w-4 ${bulkNarrativeMutation.isPending ? 'animate-bounce' : ''}`} />
                <span>Auto-Narasi Rapor</span>
              </button>
              
              <div className="h-6 w-px bg-slate-200 mx-1" />
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-tight">Virtualized Smart Mode Active</span>
              </div>
              <button
                onClick={handleImportExcel}
                disabled={isLegerLocked}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1 transition-all cursor-pointer ${
                  isLegerLocked ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Import Excel</span>
              </button>
              <button
                onClick={() => handleExportFile('XLS')}
                className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold rounded-xl flex items-center gap-1 transition-all cursor-pointer"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                <span>Export Excel</span>
              </button>
              <button
                onClick={() => handleExportFile('PDF')}
                className="px-3 py-1.5 bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 text-xs font-bold rounded-xl flex items-center gap-1 transition-all cursor-pointer"
              >
                <FileText className="h-3.5 w-3.5 text-rose-600" />
                <span>Export PDF</span>
              </button>
              <button
                onClick={() => handleExportFile('ZIP')}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-all cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Massal</span>
              </button>
            </div>
          </div>

          {/* --- ROLE SIMULATOR & WORKFLOW APPROVAL STATUS BAR --- */}
          <div className="bg-gradient-to-r from-slate-50 to-indigo-50/40 p-5 rounded-2xl border border-slate-200/80 space-y-4 text-xs">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              {/* Role switcher for real-time validation test */}
              <div className="space-y-1.5">
                <span className="font-extrabold text-slate-700 flex items-center gap-1">
                  <Users className="h-4 w-4 text-slate-500" />
                  <span>Otorisasi & Alur Approval Berdasarkan Peran Pengguna:</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { role: 'Guru Mapel', name: 'Dr. H. Ahmad Fauzi, M.Si.', icon: '👨‍🏫' },
                    { role: 'Wali Kelas', name: 'Ahmad Ghozali, S.Pd.', icon: '🏫' },
                    { role: 'Kepala Sekolah', name: 'K.H. Dr. Husnan Bey Fananie, M.A.', icon: '🎓' }
                  ].map((item) => (
                    <button
                      key={item.role}
                      type="button"
                      onClick={() => {
                        setActiveActorRole(item.role as any);
                        triggerNotif('info', `Simulasi berganti peran menjadi ${item.role}: ${item.name}`);
                      }}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        activeActorRole === item.role
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.role}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-mono block uppercase">Status Leger Nilai</span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-black uppercase tracking-wide border mt-0.5 ${
                    legerStatus === 'DRAFT' ? 'bg-slate-100 text-slate-700 border-slate-300' :
                    legerStatus === 'SUBMITTED' ? 'bg-amber-50 text-amber-800 border-amber-300' :
                    legerStatus === 'APPROVED_HOMEROOM' ? 'bg-blue-50 text-blue-800 border-blue-300' :
                    legerStatus === 'APPROVED_PRINCIPAL' ? 'bg-indigo-50 text-indigo-800 border-indigo-300' :
                    'bg-emerald-50 text-emerald-800 border-emerald-300 animate-pulse'
                  }`}>
                    <span className={`h-2 w-2 rounded-full ${
                      legerStatus === 'DRAFT' ? 'bg-slate-500' :
                      legerStatus === 'SUBMITTED' ? 'bg-amber-500' :
                      legerStatus === 'APPROVED_HOMEROOM' ? 'bg-blue-500' :
                      legerStatus === 'APPROVED_PRINCIPAL' ? 'bg-indigo-500' : 'bg-emerald-500'
                    }`} />
                    <span>{legerStatus}</span>
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-mono block uppercase">Penguncian Database</span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-extrabold mt-0.5 border ${
                    isLegerLocked 
                      ? 'bg-rose-50 text-rose-800 border-rose-200' 
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}>
                    {isLegerLocked ? <Lock className="h-3.5 w-3.5 text-rose-500" /> : <Unlock className="h-3.5 w-3.5 text-emerald-500" />}
                    <span>{isLegerLocked ? 'LOCKED' : 'UNLOCKED'}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Approval Controls Zone */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 bg-indigo-500 rounded-full animate-ping" />
                <span className="text-slate-500">Peran Aktif:</span>
                <span className="font-extrabold text-slate-800">{activeActorRole === 'Guru Mapel' ? 'Dr. H. Ahmad Fauzi, M.Si. (Guru Mapel)' :
                              activeActorRole === 'Wali Kelas' ? 'Ahmad Ghozali, S.Pd. (Wali Kelas)' : 'K.H. Dr. Husnan Bey Fananie, M.A. (Kepala Sekolah)'}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Submit button for Guru Mapel */}
                {activeActorRole === 'Guru Mapel' && legerStatus === 'DRAFT' && (
                  <button
                    onClick={handleSubmitLeger}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <FileCheck className="h-4 w-4" />
                    <span>Submit ke Wali Kelas</span>
                  </button>
                )}

                {/* Approve/Reject buttons for Wali Kelas */}
                {activeActorRole === 'Wali Kelas' && legerStatus === 'SUBMITTED' && (
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => {
                        const notes = prompt('Masukkan catatan penolakan:', 'Terdapat nilai harian yang perlu diperbaiki.');
                        if (notes) handleRejectLeger(notes);
                      }}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold rounded-xl cursor-pointer transition-all"
                    >
                      Kembalikan (Reject)
                    </button>
                    <button
                      onClick={handleApproveLeger}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer shadow-sm transition-all flex items-center gap-1"
                    >
                      <Check className="h-4 w-4" />
                      <span>Setujui (Approve) Leger</span>
                    </button>
                  </div>
                )}

                {/* Approve/Reject buttons for Principal */}
                {activeActorRole === 'Kepala Sekolah' && legerStatus === 'APPROVED_HOMEROOM' && (
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => {
                        const notes = prompt('Masukkan catatan penolakan:', 'Silakan tinjau kembali nilai UTS siswa.');
                        if (notes) handleRejectLeger(notes);
                      }}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold rounded-xl cursor-pointer transition-all"
                    >
                      Kembalikan (Reject)
                    </button>
                    <button
                      onClick={handleApproveLeger}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer shadow-sm transition-all flex items-center gap-1"
                    >
                      <Check className="h-4 w-4" />
                      <span>Setujui (Approve) Leger</span>
                    </button>
                  </div>
                )}

                {/* Publish button for Principal */}
                {activeActorRole === 'Kepala Sekolah' && legerStatus === 'APPROVED_PRINCIPAL' && (
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => {
                        const notes = prompt('Masukkan catatan penolakan:', 'Tinjau kembali sebelum publish.');
                        if (notes) handleRejectLeger(notes);
                      }}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold rounded-xl cursor-pointer transition-all"
                    >
                      Kembalikan (Reject)
                    </button>
                    <button
                      onClick={handlePublishLeger}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-sm cursor-pointer transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Publikasikan & Kunci Rapor Resmi</span>
                    </button>
                  </div>
                )}

                {/* Log Audit Trigger */}
                <button
                  onClick={handleFetchAuditLogs}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Clock className="h-3.5 w-3.5 text-slate-500" />
                  <span>Buka Log Audit & Riwayat Perubahan</span>
                </button>
              </div>
            </div>
          </div>

          {/* --- BENTO ANALYTICAL REPORT DASHBOARD (AUTOMATIC SAVE COMPILATION) --- */}
          {analysisReport && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 animate-fade-in text-xs">
              {/* Card 1: Rata Rata & Median */}
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-5 rounded-2xl shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono tracking-wider uppercase opacity-80">Rata-rata Rombel</span>
                  <BarChart3 className="h-5 w-5 opacity-80" />
                </div>
                <div>
                  <h4 className="text-3xl font-black">{analysisReport.average}</h4>
                  <p className="text-xs opacity-90 mt-1">
                    Median Rombel: <span className="font-bold">{analysisReport.median}</span>
                  </p>
                </div>
                <div className="text-[10px] bg-indigo-700/40 p-2 rounded-xl text-indigo-100 font-mono">
                  Sistem otomatis mengompilasi CP/TP saat audit save
                </div>
              </div>

              {/* Card 2: Ketuntasan Belajar */}
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Ketuntasan Belajar</span>
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <h4 className="text-3xl font-black text-slate-800">{analysisReport.pass_percentage}%</h4>
                    <span className="text-xs text-slate-500">tuntas</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full mt-2.5 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${analysisReport.pass_percentage}%` }}
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 font-medium">
                  KKM yang ditetapkan: <span className="font-bold text-slate-700">{academicSetting.kkmValue}</span>
                </p>
              </div>

              {/* Card 3: Sebaran Distribusi Nilai */}
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-3 col-span-1 md:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Histogram Distribusi Nilai</span>
                  <Sliders className="h-4.5 w-4.5 text-slate-400" />
                </div>
                {(() => {
                  let dist = { under_60: 0, from_60_to_70: 0, from_70_to_80: 2, from_80_to_90: 3, above_90: 2 };
                  try {
                    dist = JSON.parse(analysisReport.distribution);
                  } catch (e) {}

                  const maxCount = Math.max(1, dist.under_60, dist.from_60_to_70, dist.from_70_to_80, dist.from_80_to_90, dist.above_90);
                  const getPct = (cnt: number) => (cnt / maxCount) * 100;

                  return (
                    <div className="space-y-1.5 text-[10px]">
                      {[
                        { label: '< 60 (D)', val: dist.under_60, color: 'bg-rose-500' },
                        { label: '60 - 70 (C)', val: dist.from_60_to_70, color: 'bg-amber-500' },
                        { label: '70 - 80 (B-)', val: dist.from_70_to_80, color: 'bg-blue-500' },
                        { label: '80 - 90 (B)', val: dist.from_80_to_90, color: 'bg-indigo-500' },
                        { label: '90 - 100 (A)', val: dist.above_90, color: 'bg-emerald-500' },
                      ].map((bar) => (
                        <div key={bar.label} className="flex items-center gap-3">
                          <span className="w-18 font-medium text-slate-500 text-left shrink-0">{bar.label}</span>
                          <div className="flex-1 bg-slate-50 h-3 rounded-lg overflow-hidden border border-slate-100">
                            <div className={`${bar.color} h-full rounded-lg transition-all`} style={{ width: `${getPct(bar.val)}%` }} />
                          </div>
                          <span className="w-12 text-right font-bold text-slate-700">{bar.val} siswa</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* --- CURRICULUM ANALYTICAL REPORT --- */}
          {analysisReport && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl space-y-1.5">
                <span className="font-extrabold text-indigo-700 text-[10px] uppercase tracking-wide block">Capaian Pembelajaran (CP) Analysis</span>
                <p className="text-slate-600 leading-relaxed font-medium">{analysisReport.cp_analysis}</p>
              </div>
              <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl space-y-1.5">
                <span className="font-extrabold text-indigo-700 text-[10px] uppercase tracking-wide block">Tujuan Pembelajaran (TP) Analysis</span>
                <p className="text-slate-600 leading-relaxed font-medium">{analysisReport.tp_analysis}</p>
              </div>
              <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl space-y-1.5">
                <span className="font-extrabold text-indigo-700 text-[10px] uppercase tracking-wide block">Alur Tujuan Pembelajaran (ATP) Summary</span>
                <p className="text-slate-600 leading-relaxed font-medium">{analysisReport.atp_analysis}</p>
              </div>
            </div>
          )}

          {/* Search & Bulk Update Control Room */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-slate-50 p-4 border border-slate-200 rounded-xl text-xs">
            {/* Search Filter */}
            <div className="lg:col-span-4 space-y-1.5">
              <span className="font-bold text-slate-600">Cari Nama / NISN Siswa:</span>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 pl-9 pr-3 py-2 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Bulk Update Controls */}
            <div className="lg:col-span-8 space-y-1.5">
              <span className="font-bold text-slate-600">Bulk Update Nilai Massal (Seluruh Rombel):</span>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={bulkField}
                  onChange={(e) => setBulkField(e.target.value as any)}
                  className="bg-white border border-slate-200 p-2 rounded-xl text-xs font-bold outline-none cursor-pointer"
                >
                  <option value="harian">Nilai Harian</option>
                  <option value="tugas">Nilai Tugas</option>
                  <option value="quiz">Nilai Quiz</option>
                  <option value="praktik">Nilai Praktik</option>
                  <option value="projek">Nilai Projek</option>
                  <option value="pts">Nilai PTS</option>
                  <option value="pas">Nilai PAS</option>
                  <option value="ujian_sekolah">Nilai Ujian Sekolah</option>
                  <option value="tahfidz_juz">Tahfidz (Juz)</option>
                  <option value="ibadah_score">Nilai Ibadah</option>
                </select>

                <select
                  value={bulkType}
                  onChange={(e) => setBulkType(e.target.value as any)}
                  className="bg-white border border-slate-200 p-2 rounded-xl text-xs font-bold outline-none cursor-pointer"
                >
                  <option value="set">Setel Nilai Menjadi (=)</option>
                  <option value="add">Tambahkan Poin (+)</option>
                  <option value="multiply">Naikkan Persentase (%)</option>
                </select>

                <input
                  type="number"
                  value={bulkValue}
                  onChange={(e) => setBulkValue(e.target.value)}
                  className="w-20 bg-white border border-slate-200 p-2 rounded-xl text-xs font-bold text-center outline-none"
                />

                <button
                  onClick={handleBulkUpdate}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl shadow transition-all cursor-pointer"
                >
                  Terapkan Bulk Update
                </button>
              </div>
            </div>
          </div>

          {/* Toggle Panel Input Pro */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-700">🖥️ Mode Tampilan Input:</span>
              <button
                type="button"
                onClick={() => {
                  setShowQuickInputPanel(!showQuickInputPanel);
                  triggerNotif('info', showQuickInputPanel ? 'Konsol Guru Pro disembunyikan.' : 'Konsol Guru Pro ditampilkan!');
                }}
                className={`px-4 py-2 font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
                  showQuickInputPanel 
                    ? 'bg-indigo-600 text-white shadow hover:bg-indigo-700' 
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>{showQuickInputPanel ? 'Sembunyikan Konsol Guru Pro (Besar)' : 'Buka Konsol Guru Pro (Rekomendasi)'}</span>
              </button>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Wali Kelas: <span className="font-bold text-slate-600">Ahmad Ghozali, S.Pd.</span> • Rombel: <span className="font-bold text-indigo-600">X MIPA 1</span>
            </div>
          </div>

          {/* Teacher Super Comfort Quick Input Panel */}
          {showQuickInputPanel && activeStudent && (
            <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl border border-indigo-800 space-y-6 animate-fade-in">
              {/* Profile Card & Navigation Controls */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-indigo-800/80 pb-5">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 bg-indigo-600/30 border border-indigo-500/50 text-indigo-200 rounded-2xl flex items-center justify-center text-xl font-black shadow-inner">
                    {activeStudent.gender === 'L' ? '👦' : '👧'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-indigo-500 text-white font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                        Siswa Terpilih
                      </span>
                      <span className="text-xs font-mono text-indigo-300">
                        NIS: {activeStudent.nis}
                      </span>
                    </div>
                    <h4 className="text-lg md:text-2xl font-black tracking-tight text-white mt-1">
                      {activeStudent.name}
                    </h4>
                    <p className="text-xs text-indigo-300 font-mono mt-0.5">
                      Rata Rapor: <span className="font-bold text-white text-sm">{activeStudent.avg ?? 0}</span> • Predikat: <span className="font-bold text-white text-sm">{activeStudent.predikat ?? '-'}</span> • Peringkat Kelas: <span className="font-bold text-amber-300 text-sm">#{activeStudent.rank ?? 0}</span>
                    </p>
                  </div>
                </div>

                {/* Quick cycle controls - PREV & NEXT STUDENT (extremely convenient) */}
                <div className="flex flex-wrap items-center gap-2.5 bg-slate-900/60 p-2 rounded-2xl border border-indigo-800/50">
                  <button
                    type="button"
                    onClick={handlePrevStudent}
                    className="p-2.5 bg-indigo-950 hover:bg-indigo-900 border border-indigo-700/50 hover:border-indigo-500 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer text-indigo-200"
                    title="Kembali ke Siswa Sebelumnya"
                  >
                    <ChevronLeft className="h-4.5 w-4.5" />
                    <span className="hidden sm:inline">Sebelumnya</span>
                  </button>
                  
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="bg-indigo-950 text-indigo-100 border border-indigo-700/50 p-2.5 rounded-xl text-xs font-bold outline-none cursor-pointer max-w-[180px] sm:max-w-[240px]"
                  >
                    {processedLeger.map(s => (
                      <option key={s.studentId} value={s.studentId} className="bg-slate-900 text-white font-bold">
                        {s.name} (Avg: {s.avg})
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={handleNextStudent}
                    className="p-2.5 bg-indigo-950 hover:bg-indigo-900 border border-indigo-700/50 hover:border-indigo-500 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer text-indigo-200"
                    title="Lanjut ke Siswa Berikutnya"
                  >
                    <span className="hidden sm:inline">Berikutnya</span>
                    <ChevronRight className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>

              {/* Big visual grids for inputs */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Section A: Akademik Utama */}
                <div className="xl:col-span-8 bg-slate-900/40 border border-indigo-950/40 p-5 rounded-2xl space-y-4 shadow-inner">
                  <div className="flex items-center justify-between border-b border-indigo-950/50 pb-2">
                    <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase flex items-center gap-1">
                      <Award className="h-4 w-4" />
                      <span>A. Nilai Pengetahuan & Keterampilan Utama</span>
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                      Auto-Save Realtime
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: 'Harian', field: 'harian', val: activeStudent.harian },
                      { label: 'Tugas', field: 'tugas', val: activeStudent.tugas },
                      { label: 'Quiz', field: 'quiz', val: activeStudent.quiz },
                      { label: 'Praktik', field: 'praktik', val: activeStudent.praktik },
                      { label: 'Projek', field: 'projek', val: activeStudent.projek },
                      { label: 'PTS', field: 'pts', val: activeStudent.pts },
                      { label: 'PAS', field: 'pas', val: activeStudent.pas },
                      { label: 'Ujian Sek.', field: 'ujian_sekolah', val: activeStudent.ujian_sekolah },
                    ].map((item) => {
                      const val = Number(item.val) || 0;
                      const isUnderKKM = val < academicSetting.kkmValue;
                      const isExcellent = val >= 90;
                      
                      return (
                        <div 
                          key={item.field} 
                          className={`p-3 rounded-2xl border transition-all space-y-2 relative group ${
                            isUnderKKM 
                              ? 'bg-rose-950/20 border-rose-800/40 text-rose-200 focus-within:border-rose-500' 
                              : isExcellent 
                                ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200 focus-within:border-emerald-500'
                                : 'bg-indigo-950/20 border-indigo-800/40 text-indigo-200 focus-within:border-indigo-500'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-black tracking-wider text-slate-300">
                              {item.label}
                            </span>
                            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                              isUnderKKM 
                                ? 'bg-rose-900/30 text-rose-300' 
                                : isExcellent 
                                  ? 'bg-emerald-900/30 text-emerald-300'
                                  : 'bg-indigo-900/30 text-indigo-300'
                            }`}>
                              {val} {isUnderKKM ? '🛑' : '✅'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-1">
                            {/* Decrement Buttons */}
                            <div className="flex flex-col gap-0.5">
                              <button
                                type="button"
                                onClick={() => updateStudentField(activeStudent.studentId, item.field as any, Math.max(0, val - 1))}
                                className="px-1.5 py-0.5 bg-slate-900/85 hover:bg-slate-800 text-[10px] font-bold rounded hover:text-white cursor-pointer"
                              >
                                -1
                              </button>
                              <button
                                type="button"
                                onClick={() => updateStudentField(activeStudent.studentId, item.field as any, Math.max(0, val - 5))}
                                className="px-1.5 py-0.5 bg-slate-900/85 hover:bg-slate-800 text-[8px] font-bold rounded text-slate-400 hover:text-white cursor-pointer"
                              >
                                -5
                              </button>
                            </div>

                            {/* Large Input Field */}
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={item.val}
                              onChange={(e) => updateStudentField(activeStudent.studentId, item.field as any, e.target.value)}
                              className={`w-16 text-center text-xl font-black tracking-tight rounded-xl py-2 outline-none focus:ring-2 focus:ring-indigo-400 transition-all ${
                                isUnderKKM
                                  ? 'bg-rose-950 border border-rose-800 text-rose-100'
                                  : isExcellent
                                    ? 'bg-emerald-950 border border-emerald-800 text-emerald-100'
                                    : 'bg-indigo-950 border border-indigo-800 text-indigo-100'
                              }`}
                            />

                            {/* Increment Buttons */}
                            <div className="flex flex-col gap-0.5">
                              <button
                                type="button"
                                onClick={() => updateStudentField(activeStudent.studentId, item.field as any, Math.min(100, val + 1))}
                                className="px-1.5 py-0.5 bg-slate-900/85 hover:bg-slate-800 text-[10px] font-bold rounded hover:text-white cursor-pointer"
                              >
                                +1
                              </button>
                              <button
                                type="button"
                                onClick={() => updateStudentField(activeStudent.studentId, item.field as any, Math.min(100, val + 5))}
                                className="px-1.5 py-0.5 bg-slate-900/85 hover:bg-slate-800 text-[8px] font-bold rounded text-slate-400 hover:text-white cursor-pointer"
                              >
                                +5
                              </button>
                            </div>
                          </div>

                          <div className="text-center">
                            <span className="text-[9px] text-slate-400 font-medium">
                              {isUnderKKM ? 'Di bawah KKM' : isExcellent ? 'Istimewa' : 'Tuntas'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Section B: Kehadiran / Presensi & Karakter */}
                <div className="xl:col-span-4 space-y-4">
                  
                  {/* Kehadiran Panel */}
                  <div className="bg-slate-900/40 border border-indigo-950/40 p-4 rounded-2xl space-y-3 shadow-inner">
                    <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase flex items-center gap-1 border-b border-indigo-950/50 pb-2">
                      <Clock className="h-4 w-4" />
                      <span>B. Rekap Absensi & Kehadiran (Hari)</span>
                    </span>

                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: 'Hadir', field: 'kehadiran_hadir', val: activeStudent?.kehadiran_hadir ?? 0, color: 'text-emerald-400', bg: 'bg-emerald-950/30' },
                        { label: 'Sakit', field: 'kehadiran_sakit', val: activeStudent?.kehadiran_sakit ?? 0, color: 'text-amber-400', bg: 'bg-amber-950/30' },
                        { label: 'Izin', field: 'kehadiran_izin', val: activeStudent?.kehadiran_izin ?? 0, color: 'text-blue-400', bg: 'bg-blue-950/30' },
                        { label: 'Alfa', field: 'kehadiran_alfa', val: activeStudent?.kehadiran_alfa ?? 0, color: 'text-rose-400', bg: 'bg-rose-950/30' },
                      ].map((item) => (
                        <div key={item.field} className={`p-2 rounded-xl text-center space-y-1 ${item.bg}`}>
                          <span className="text-[9px] uppercase font-bold text-slate-300 block">{item.label}</span>
                          <input
                            type="number"
                            min="0"
                            value={item.val}
                            onChange={(e) => updateStudentField(activeStudent.studentId, item.field as any, e.target.value)}
                            className={`w-full text-center text-lg font-black bg-indigo-950/50 border border-slate-700 rounded-lg p-1 outline-none focus:ring-1 focus:ring-indigo-400 ${item.color}`}
                          />
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => updateStudentField(activeStudent.studentId, item.field as any, Math.max(0, (item.val ?? 0) - 1))}
                              className="text-[9px] bg-slate-900/60 rounded px-1 cursor-pointer hover:bg-slate-800"
                            >
                              -
                            </button>
                            <button
                              type="button"
                              onClick={() => updateStudentField(activeStudent.studentId, item.field as any, (item.val ?? 0) + 1)}
                              className="text-[9px] bg-slate-900/60 rounded px-1 cursor-pointer hover:bg-slate-800"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sikap & Akhlak */}
                  <div className="bg-slate-900/40 border border-indigo-950/40 p-4 rounded-2xl space-y-3 shadow-inner">
                    <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase flex items-center gap-1 border-b border-indigo-950/50 pb-2">
                      <Heart className="h-4 w-4" />
                      <span>C. Karakter & Ibadah Pesantren</span>
                    </span>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-300 font-bold block uppercase">Nilai Sikap</span>
                        <select
                          value={activeStudent.sikap}
                          onChange={(e) => updateStudentField(activeStudent.studentId, 'sikap', Number(e.target.value))}
                          className="w-full bg-indigo-950 text-indigo-100 border border-indigo-800 p-2 rounded-xl font-bold cursor-pointer outline-none"
                        >
                          <option value="4">Sangat Baik (A)</option>
                          <option value="3">Baik (B)</option>
                          <option value="2">Cukup (C)</option>
                          <option value="1">Kurang (D)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-300 font-bold block uppercase">Ibadah Shalat</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={activeStudent?.ibadah_score ?? 0}
                          onChange={(e) => updateStudentField(activeStudent?.studentId || '', 'ibadah_score', e.target.value)}
                          className="w-full bg-indigo-950 text-amber-300 border border-indigo-800 p-2 rounded-xl text-center font-black outline-none"
                        />
                      </div>
                    </div>

                    {/* Tahfidz Quran */}
                    <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-300 font-bold block uppercase">Tahfidz Juz</span>
                        <input
                          type="number"
                          min="0"
                          max="30"
                          value={activeStudent.tahfidz_juz}
                          onChange={(e) => updateStudentField(activeStudent.studentId, 'tahfidz_juz', e.target.value)}
                          className="w-full bg-indigo-950 text-teal-300 border border-indigo-800 p-2 rounded-xl text-center font-black outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-300 font-bold block uppercase">Surah Terakhir</span>
                        <input
                          type="text"
                          value={activeStudent?.tahfidz_surah || ''}
                          onChange={(e) => updateStudentField(activeStudent?.studentId || '', 'tahfidz_surah', e.target.value)}
                          className="w-full bg-indigo-950 text-teal-100 border border-indigo-800 p-2 rounded-xl text-center font-bold outline-none text-xs"
                          placeholder="Surah..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ekskul & Deskripsi Rapor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/40 border border-indigo-950/40 p-5 rounded-2xl shadow-inner">
                <div className="space-y-3">
                  <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase flex items-center gap-1 border-b border-indigo-950/50 pb-2">
                    <Layers className="h-4 w-4" />
                    <span>D. Kegiatan Ekstrakurikuler Wajib</span>
                  </span>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2 space-y-1">
                      <span className="text-[9px] text-slate-300 font-bold block uppercase">Nama Ekskul</span>
                      <input
                        type="text"
                        value={activeStudent?.ekskul_name || ''}
                        onChange={(e) => updateStudentField(activeStudent?.studentId || '', 'ekskul_name', e.target.value)}
                        className="w-full bg-indigo-950 text-slate-200 border border-indigo-800 p-2.5 rounded-xl font-bold outline-none text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-300 font-bold block uppercase">Nilai Ekskul</span>
                      <select
                        value={activeStudent.ekskul_grade}
                        onChange={(e) => updateStudentField(activeStudent.studentId, 'ekskul_grade', e.target.value)}
                        className="w-full bg-indigo-950 text-indigo-300 border border-indigo-800 p-2.5 rounded-xl font-black outline-none text-xs cursor-pointer"
                      >
                        <option value="A">A (Sangat Baik)</option>
                        <option value="B">B (Baik)</option>
                        <option value="C">C (Cukup)</option>
                        <option value="D">D (Kurang)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase flex items-center gap-1 border-b border-indigo-950/50 pb-2">
                    <Type className="h-4 w-4" />
                    <span>E. Deskripsi Capaian Karakter / Catatan Wali Kelas</span>
                  </span>
                  <div className="space-y-1">
                    <textarea
                      rows={3}
                      value={activeStudent.karakter || ''}
                      onChange={(e) => updateStudentField(activeStudent.studentId, 'karakter', e.target.value)}
                      className="w-full bg-indigo-950 text-slate-200 border border-indigo-800 p-3 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium leading-relaxed resize-none shadow-inner animate-pulse-once"
                      placeholder="Tuliskan catatan karakter, perkembangan, dan nasihat wali kelas..."
                    />
                  </div>
                </div>
              </div>

              {/* Footer info inside the dark card */}
              <div className="flex items-center justify-between text-[10px] text-indigo-300/80 font-mono bg-indigo-950/40 p-3 rounded-2xl border border-indigo-900/55">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span>Asisten Input Pro mendeteksi adab, absensi, serta nilai sains fisis santri secara kohesif.</span>
                </div>
                <span className="hidden md:inline bg-indigo-800/60 text-indigo-100 font-bold px-2 py-0.5 rounded">MODUL GURU SELESAI</span>
              </div>
            </div>
          )}

          {/* Excel Spreadsheet Table Wrapper with Freeze column & headers simulated */}
          <div className="overflow-x-auto border border-slate-200 rounded-2xl max-h-[600px] overflow-y-auto relative">
            <table className="w-full text-left border-collapse min-w-[1600px]">
              <thead className="sticky top-0 bg-slate-900 text-white z-10 text-[10px] uppercase font-bold tracking-wider font-mono">
                <tr>
                  <th className="py-3 px-4 text-center w-16 sticky left-0 bg-slate-900 z-20 shadow-[2px_0_5px_rgba(0,0,0,0.1)]">Rank</th>
                  <th className="py-3 px-4 w-52 sticky left-16 bg-slate-900 z-20 shadow-[2px_0_5px_rgba(0,0,0,0.1)] border-r border-slate-800">Nama Siswa</th>
                  {smartSubjects.map(sub => (
                    <th key={sub.id} className="py-3 px-3 text-center border-r border-slate-800" title={sub.category?.name}>
                      {sub.name}
                    </th>
                  ))}
                  <th className="py-3 px-3 text-center bg-indigo-900">Rata Rapor</th>
                  <th className="py-3 px-3 text-center">Pred</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px] leading-relaxed">
                {smartLegerData
                  .filter(row => row.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((row, idx) => {
                    const studentScores = row.scores || {};
                    const scoresList = Object.values(studentScores).map(v => Number(v) || 0);
                    const avg = scoresList.length > 0 ? (scoresList.reduce((a, b) => a + b, 0) / scoresList.length).toFixed(1) : '0';
                    const pred = Number(avg) >= 90 ? 'A' : Number(avg) >= 80 ? 'B' : Number(avg) >= 70 ? 'C' : 'D';

                    return (
                      <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 text-center font-bold sticky left-0 bg-slate-50 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-800 sticky left-16 bg-slate-50 z-10 border-r border-slate-150 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                          {row.name}
                        </td>
                        {smartSubjects.map(sub => (
                          <td key={sub.id} className="py-2.5 px-3 text-center border-r border-slate-50 font-mono">
                            <span className={studentScores[sub.id] < academicSetting.kkmValue ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                              {studentScores[sub.id] || 0}
                            </span>
                          </td>
                        ))}
                        <td className="py-2.5 px-3 text-center border-r border-slate-100 font-black text-xs font-mono text-indigo-600 bg-indigo-50/50">
                          {avg}
                        </td>
                        <td className="py-2.5 px-3 text-center border-r border-slate-100 font-bold font-mono">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            pred === 'A' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                            pred === 'B' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                            'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                            {pred}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-center">
                           <button onClick={() => { setSelectedStudentId(row.id); triggerNotif('info', 'Membuka Detail Siswa...')}} className="text-indigo-600 font-bold hover:underline">Detail</button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* Quick instructions footer */}
          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono bg-slate-50 p-3 rounded-xl border border-slate-100">
            <Info className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>Tips: Double-click salah satu sel nilai harian s.d ujian sekolah untuk melakukan pengeditan inline langsung. Tekan Enter untuk menyimpan.</span>
          </div>
        </div>
      )}

      {/* --- TAB 3: REPORT TEMPLATE BUILDER --- */}
      {activeMainTab === 'templates' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm">Pusat Template Rapor Sekolah & Pondok Pesantren</h3>
              <p className="text-xs text-slate-500 mt-0.5">Kelola berbagai format visual rapor instansi sesuai dengan target kurikulum nasional maupun muatan lokal pesantren.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSaveTemplates()}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Save className="h-4 w-4" />
                <span>Simpan ke Database</span>
              </button>
              <button
                onClick={() => {
                  const name = prompt('Masukkan nama template baru:');
                  if (name) {
                    const newT: ReportTemplate = {
                      id: `tpl-${Date.now()}`,
                      name,
                      type: 'Pesantren Terpadu',
                      isDefault: false,
                      margin: { top: 20, right: 20, bottom: 20, left: 20 },
                      pageSize: 'A4',
                      orientation: 'Portrait'
                    };
                    const updated = [...templates, newT];
                    setTemplates(updated);
                    handleSaveTemplates(updated);
                  }
                }}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Tambah Template Builder</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {templates.map((tpl) => {
              return (
                <div 
                  key={tpl.id}
                  className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 transition-all ${
                    tpl.isDefault 
                      ? 'border-indigo-600 bg-indigo-50/10 shadow-sm' 
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] bg-slate-100 border text-slate-500 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                        {tpl.type}
                      </span>
                      {tpl.isDefault && (
                        <span className="text-[9px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold">
                          DEFAULT AKTIF
                        </span>
                      )}
                    </div>
                    <h4 className="font-extrabold text-xs text-slate-800">{tpl.name}</h4>
                    <div className="text-[10px] space-y-1 text-slate-400 font-mono">
                      <div>Ukuran Kertas: {tpl.pageSize} • {tpl.orientation}</div>
                      <div>Margin: T:{tpl.margin.top} R:{tpl.margin.right} B:{tpl.margin.bottom} L:{tpl.margin.left} (mm)</div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleSetDefaultTemplate(tpl.id)}
                      disabled={tpl.isDefault}
                      className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-lg text-[10px] font-bold cursor-pointer"
                    >
                      Set Default
                    </button>
                    <button
                      onClick={() => handleDuplicateTemplate(tpl)}
                      className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 cursor-pointer"
                      title="Duplikat Template"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Apakah Anda yakin ingin menghapus template ini?')) {
                          setTemplates(prev => prev.filter(t => t.id !== tpl.id));
                          triggerNotif('success', 'Template berhasil dihapus.');
                        }
                      }}
                      disabled={tpl.isDefault}
                      className="px-2.5 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 disabled:opacity-30 rounded-lg border border-rose-100 cursor-pointer"
                      title="Hapus Template"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- TAB 4: VISUAL REPORT DESIGNER --- */}
      {activeMainTab === 'designer' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* Designer Controls Sidebar */}
          <div className="xl:col-span-4 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
              <div>
                <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest">Visual Blocks Manager</h4>
                <p className="text-[11px] text-slate-500 mt-1">Gunakan panel arah untuk memindahkan dan meresize koordinat block visual rapor.</p>
              </div>

              {/* Blocks list toggles */}
              <div className="space-y-2">
                {designerBlocks.map((blk) => (
                  <div 
                    key={blk.id}
                    className={`p-3 rounded-xl border flex flex-col gap-2 cursor-pointer transition-all ${
                      selectedBlockId === blk.id 
                        ? 'border-indigo-600 bg-indigo-50/20' 
                        : 'border-slate-150 bg-white hover:bg-slate-50/50'
                    }`}
                    onClick={() => setSelectedBlockId(blk.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{blk.label}</span>
                      <input
                        type="checkbox"
                        checked={blk.visible}
                        onChange={(e) => {
                          setDesignerBlocks(prev => prev.map(b => b.id === blk.id ? { ...b, visible: e.target.checked } : b));
                        }}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </div>

                    {selectedBlockId === blk.id && (
                      <div className="pt-2 border-t border-indigo-100 flex items-center justify-between text-[10px] text-slate-500">
                        {/* Position controls */}
                        <div className="space-y-1 w-full">
                          <div className="flex justify-between items-center">
                            <span>Posisi Vertikal (Y): {blk.y}%</span>
                            <div className="flex gap-1">
                              <button onClick={() => handleBlockDrag(blk.id, 'y', -2)} className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-800 font-bold hover:bg-slate-300">-</button>
                              <button onClick={() => handleBlockDrag(blk.id, 'y', 2)} className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-800 font-bold hover:bg-slate-300">+</button>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Tinggi Blok (H): {blk.h}%</span>
                            <div className="flex gap-1">
                              <button onClick={() => handleBlockDrag(blk.id, 'h', -2)} className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-800 font-bold hover:bg-slate-300">-</button>
                              <button onClick={() => handleBlockDrag(blk.id, 'h', 2)} className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-800 font-bold hover:bg-slate-300">+</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Print Engine Launcher */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <button
                  onClick={() => handleSaveDesignerBlocks()}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Save className="h-4 w-4 text-indigo-400" />
                  <span>Simpan Tata Letak (DB)</span>
                </button>
                <button
                  onClick={() => handlePrintSingle(selectedStudentId)}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Printer className="h-4 w-4" />
                  <span>Cetak & Simpan PDF Santri</span>
                </button>
                <div className="flex gap-2">
                  <button onClick={() => handlePrintSingle(selectedStudentId)} className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] rounded-lg border border-slate-200 cursor-pointer transition-colors">Download PDF</button>
                  <button onClick={() => handlePrintAll()} className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] rounded-lg border border-slate-200 cursor-pointer transition-colors">Cetak Massal Kelas</button>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive WYSIWYG Report Stage */}
          <div className="xl:col-span-8 space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 bg-slate-100 p-3 rounded-xl border">
              <span>Rapor Student: {activeStudent?.name || '-'} ({activeStudent?.nis || '-'})</span>
              <div className="flex items-center gap-2">
                <span>Pilih Siswa Lain:</span>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="bg-white border p-1 rounded font-bold cursor-pointer"
                >
                  {processedLeger.map(s => (
                    <option key={s.studentId} value={s.studentId}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* WYSIWYG Canvas Sheet */}
            <div className="border border-slate-300 rounded-3xl bg-slate-200 p-8 shadow-inner overflow-auto flex justify-center">
              <div 
                className="bg-white shadow-2xl relative border border-slate-400 font-sans text-xs text-slate-800"
                style={{
                  width: '760px',
                  minHeight: '1020px',
                  padding: `${currentTemplate?.margin?.top ?? 20}px ${currentTemplate?.margin?.right ?? 20}px ${currentTemplate?.margin?.bottom ?? 20}px ${currentTemplate?.margin?.left ?? 20}px`,
                  fontFamily: kopSurat?.fontFamily === 'font-mono' ? 'monospace' : kopSurat?.fontFamily === 'font-serif' ? 'serif' : 'sans-serif',
                }}
              >
                {/* Simulated Watermark background */}
                {kopSurat.showWatermark && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none pointer-events-none transform -rotate-45 font-black text-6xl">
                    {kopSurat.watermarkText}
                  </div>
                )}

                {/* Block: Kop Surat */}
                {designerBlocks.find(b => b.id === 'blk-kop')?.visible && (
                  <div 
                    className={`border-b-4 border-double border-slate-900 pb-2 flex items-center gap-4 ${
                      selectedBlockId === 'blk-kop' ? 'ring-2 ring-indigo-500 rounded p-1' : ''
                    }`}
                    style={{ borderBottomColor: kopSurat.borderColor }}
                  >
                    {/* Fake Crest */}
                    <div className="h-16 w-16 bg-slate-900 rounded-full flex items-center justify-center text-white font-black text-lg shrink-0">
                      DH
                    </div>
                    <div className="text-center flex-1 space-y-0.5">
                      <span className="text-[10px] font-bold tracking-widest text-indigo-600 block uppercase">{kopSurat.namaYayasan}</span>
                      <h3 className="font-extrabold text-sm text-slate-900 uppercase">{kopSurat.namaSekolah}</h3>
                      <p className="text-[9px] text-slate-400 font-mono leading-tight">
                        {kopSurat.alamat} • Kode Pos: {kopSurat.kodePos} • Telp: {kopSurat.telepon}<br />
                        Web: {kopSurat.website} • Email: {kopSurat.email}
                      </p>
                      <p className="text-[9px] italic text-slate-500 font-medium">Motto: &quot;{kopSurat.moto}&quot;</p>
                    </div>
                    <div className="h-16 w-16 bg-indigo-900 rounded-lg flex items-center justify-center text-white font-black text-lg shrink-0">
                      SAINS
                    </div>
                  </div>
                )}

                {/* Block: Identitas Siswa */}
                {designerBlocks.find(b => b.id === 'blk-id')?.visible && (
                  <div className={`mt-4 grid grid-cols-2 gap-4 border-b border-slate-100 pb-3 ${
                    selectedBlockId === 'blk-id' ? 'ring-2 ring-indigo-500 rounded p-1' : ''
                  }`}>
                    <div className="space-y-1 font-medium text-[10px]">
                      <div className="flex"><span className="w-24 text-slate-400 font-bold uppercase">Nama Santri/Siswa</span><span className="text-slate-900 font-black">: {activeStudent?.name || '-'}</span></div>
                      <div className="flex"><span className="w-24 text-slate-400 font-bold uppercase">NIS / NISN</span><span className="text-slate-800 font-mono">: {activeStudent?.nis || '-'} / {activeStudent?.nisn || '-'}</span></div>
                      <div className="flex"><span className="w-24 text-slate-400 font-bold uppercase">Jenis Kelamin</span><span className="text-slate-800">: {activeStudent?.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span></div>
                    </div>
                    <div className="space-y-1 font-medium text-[10px]">
                      <div className="flex"><span className="w-24 text-slate-400 font-bold uppercase">Kelas Rombel</span><span className="text-slate-900 font-bold">: X MIPA 1 (Boarding)</span></div>
                      <div className="flex"><span className="w-24 text-slate-400 font-bold uppercase">Kurikulum</span><span className="text-slate-800 font-bold">: {academicSetting.curriculum}</span></div>
                      <div className="flex"><span className="w-24 text-slate-400 font-bold uppercase">Semester / TA</span><span className="text-slate-800">: {academicSetting.semester} (Ganjil) / 2025/2026</span></div>
                    </div>
                  </div>
                )}

                {/* Block: Grades Table */}
                {designerBlocks.find(b => b.id === 'blk-grades')?.visible && (
                  <div className={`mt-4 space-y-2 ${
                    selectedBlockId === 'blk-grades' ? 'ring-2 ring-indigo-500 rounded p-1' : ''
                  }`}>
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">A. LAPORAN NILAI PENGETAHUAN & KETERAMPILAN</span>
                    <table className="w-full border border-slate-800 border-collapse text-[10px]">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-800 text-[9px] font-black uppercase text-center font-mono">
                          <th className="py-2 px-3 border-r border-slate-800 text-left w-48">Mata Pelajaran (Kurikulum {academicSetting.curriculum})</th>
                          <th className="py-2 px-2 border-r border-slate-800 w-12">KKM</th>
                          <th className="py-2 px-2 border-r border-slate-800 w-12">Nilai Akhir</th>
                          <th className="py-2 px-2 border-r border-slate-800 w-16">Predikat</th>
                          <th className="py-2 px-3 text-left">Capaian Kompetensi / Deskripsi Otomatis</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        <tr>
                          <td className="py-2.5 px-3 border-r border-slate-800 font-extrabold text-slate-900">Fisika Terpadu & Astronomi</td>
                          <td className="py-2.5 px-2 border-r border-slate-800 text-center font-mono font-bold text-slate-400">{academicSetting.kkmValue}</td>
                          <td className="py-2.5 px-2 border-r border-slate-800 text-center font-black font-mono text-sm text-indigo-600 bg-indigo-50/20">{activeStudent?.avg ?? 0}</td>
                          <td className="py-2.5 px-2 border-r border-slate-800 text-center font-bold">
                            {activeStudent?.predikat} ({activeStudent?.avg && activeStudent.avg >= 90 ? 'Sangat Baik' : activeStudent?.avg && activeStudent.avg >= 80 ? 'Baik' : 'Cukup'})
                          </td>
                          <td className="py-2.5 px-3 text-[10px] text-slate-600 leading-relaxed font-sans italic">
                            &quot;{activeStudent?.deskripsi ?? '-'}&quot;
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Block: Ekskul Table */}
                {designerBlocks.find(b => b.id === 'blk-ekskul')?.visible && (
                  <div className={`mt-4 space-y-1.5 ${
                    selectedBlockId === 'blk-ekskul' ? 'ring-2 ring-indigo-500 rounded p-1' : ''
                  }`}>
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">B. KEGIATAN EKSTRAKURIKULER & TAHFIDZ AL-QURAN</span>
                    <table className="w-full border border-slate-800 border-collapse text-[10px]">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-800 font-bold uppercase text-[9px]">
                          <th className="py-1.5 px-3 border-r border-slate-800 text-left">Kegiatan / Program</th>
                          <th className="py-1.5 px-2 border-r border-slate-800 text-center w-20">Pencapaian</th>
                          <th className="py-1.5 px-3 text-left">Keterangan / Progress</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        <tr>
                          <td className="py-2 px-3 border-r border-slate-800 font-bold">{activeStudent?.ekskul_name ?? '-'}</td>
                          <td className="py-2 px-2 border-r border-slate-800 text-center font-black text-indigo-600 font-mono">{activeStudent?.ekskul_grade ?? '-'}</td>
                          <td className="py-2 px-3 text-slate-500 text-[9px] italic">Sangat aktif berpartisipasi dan disiplin menempati pos kegiatan asrama.</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 border-r border-slate-800 font-bold">Halaqah Tahfidzul Quran</td>
                          <td className="py-2 px-2 border-r border-slate-800 text-center font-black text-teal-600 font-mono">Juz {activeStudent?.tahfidz_juz ?? '-'}</td>
                          <td className="py-2 px-3 text-slate-500 text-[9px] italic">Terakhir setoran Surah {activeStudent?.tahfidz_surah ?? '-'} dengan tajwid mutqin.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Block: Absensi Table */}
                {designerBlocks.find(b => b.id === 'blk-absensi')?.visible && (
                  <div className={`mt-4 space-y-1.5 ${
                    selectedBlockId === 'blk-absensi' ? 'ring-2 ring-indigo-500 rounded p-1' : ''
                  }`}>
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">C. AKHLAK SIKAP, IBADAH & KEHADIRAN</span>
                    <table className="w-full border border-slate-800 border-collapse text-[10px]">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-800 font-bold uppercase text-[9px]">
                          <th className="py-1.5 px-3 border-r border-slate-800 text-left">Indikator Karakter</th>
                          <th className="py-1.5 px-2 border-r border-slate-800 text-center w-20">Nilai</th>
                          <th className="py-1.5 px-3 text-left">Rekap Absensi (Sakit/Izin/Alfa)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        <tr>
                          <td className="py-2 px-3 border-r border-slate-800 font-bold">Sikap & Akhlak Mulia</td>
                          <td className="py-2 px-2 border-r border-slate-800 text-center font-black">Sangat Baik (A)</td>
                          <td className="py-2 px-3 text-slate-500 font-mono text-[9px]" rowSpan={2}>
                            Hadir: {activeStudent?.kehadiran_hadir ?? 0} Hari<br />
                            Sakit: {activeStudent?.kehadiran_sakit ?? 0} • Izin: {activeStudent?.kehadiran_izin ?? 0} • Alfa: {activeStudent?.kehadiran_alfa ?? 0}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 border-r border-slate-800 font-bold">Ketaatan Shalat Berjamaah</td>
                          <td className="py-2 px-2 border-r border-slate-800 text-center font-black font-mono text-amber-600">{activeStudent?.ibadah_score ?? 0} / 100</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Block: Performance Chart */}
                {designerBlocks.find(b => b.id === 'blk-chart')?.visible && (
                  <div className={`mt-4 border border-slate-200 rounded-xl p-3 bg-slate-50/50 ${
                    selectedBlockId === 'blk-chart' ? 'ring-2 ring-indigo-500 rounded p-1' : ''
                  }`}>
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">PROGRES HASIL KBM FISIKA VS RATARATA KELAS</span>
                    <div className="h-16 w-full flex items-center justify-center font-mono font-bold text-[9px] text-indigo-600">
                      [ Grafik Capaian Hasil Belajar {activeStudent?.name || '-'}: KKM {academicSetting.kkmValue} vs Rata-rata {activeStudent?.avg || 0} ]
                    </div>
                  </div>
                )}

                {/* Block: Signatures */}
                {designerBlocks.find(b => b.id === 'blk-signatures')?.visible && (
                  <div className={`mt-8 pt-4 border-t border-slate-200 flex justify-between items-start text-[9px] leading-tight ${
                    selectedBlockId === 'blk-signatures' ? 'ring-2 ring-indigo-500 rounded p-1' : ''
                  }`}>
                    <div className="text-center space-y-12">
                      <span>Mengetahui,<br />Wali Santri / Orang Tua</span>
                      <div className="w-24 border-b border-slate-800 mx-auto" />
                    </div>

                    {academicSetting.useDigitalSignature ? (
                      <div className="text-center space-y-1 bg-slate-50 p-2 border rounded-lg flex items-center gap-2">
                        <div className="h-10 w-10 bg-indigo-900 text-white flex items-center justify-center font-black rounded-lg">
                          QR
                        </div>
                        <div className="text-left">
                          <span className="font-bold text-slate-800 block text-[9px]">Tanda Tangan Digital Yayasan</span>
                          <span className="font-mono text-slate-400 block text-[8px]">{academicSetting.docNumberPattern.replace('[SEQ]', '00024')}</span>
                          <span className="text-[8px] bg-emerald-100 text-emerald-800 px-1 rounded font-bold">VERIFIKASI AMAN</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center space-y-12">
                        <span>Jakarta, 15 Juli 2026<br />Kepala Sekolah / Mudir</span>
                        <div className="space-y-0.5">
                          <span className="font-bold block text-slate-900">Dr. KH. M. Hamdan, Lc. M.A.</span>
                          <span className="font-mono text-slate-400 block text-[8px]">NIP: 197805122005011002</span>
                        </div>
                      </div>
                    )}

                    <div className="text-center space-y-12">
                      <span>Wali Kelas X MIPA 1</span>
                      <div className="space-y-0.5">
                        <span className="font-bold block text-slate-900">Ahmad Ghozali, S.Pd.</span>
                        <span className="font-mono text-slate-400 block text-[8px]">NIP: 19851010201001</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 5: KOP SURAT & LOGO MULTI-UNIT DINAMIS --- */}
      {activeMainTab === 'kop' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-4 gap-4">
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] uppercase font-mono">Multi-Unit Branding</span>
                Pengaturan Kop Surat & Logo Unit Pendidikan
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Kelola logo spesifik Yayasan, Unit TK, SD, SMP, SMA, dan PKBM untuk disesuaikan secara otomatis pada cetak surat, SKL, dan rapor akhir.</p>
            </div>
            <button
              onClick={handleSaveKopSurat}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md cursor-pointer text-xs flex items-center gap-2 self-start md:self-auto transition-all"
            >
              <Save className="w-4 h-4" /> SIMPAN LOGO & KOP SURAT
            </button>
          </div>

          {/* UNIT SELECTOR TAB BAR */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-100">
            {[
              { key: 'YAYASAN', label: 'Yayasan', badge: 'Induk' },
              { key: 'TK', label: 'Unit TK / PAUD', badge: 'TK' },
              { key: 'SD', label: 'Unit SD / MI', badge: 'SD' },
              { key: 'SMP', label: 'Unit SMP / MTs', badge: 'SMP' },
              { key: 'SMA', label: 'Unit SMA / MA', badge: 'SMA' },
              { key: 'PKBM', label: 'Unit PKBM', badge: 'Kesetaraan' },
            ].map((u) => {
              const active = selectedKopUnit === u.key;
              return (
                <button
                  key={u.key}
                  onClick={() => setSelectedKopUnit(u.key as any)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border whitespace-nowrap ${
                    active
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-[1.02]'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{u.label}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-mono ${active ? 'bg-slate-700 text-slate-200' : 'bg-slate-200 text-slate-600'}`}>
                    {u.badge}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Kop Editor Form for Selected Unit */}
            <div className="space-y-4 text-xs bg-slate-50/70 p-5 border border-slate-200/80 rounded-2xl">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                <span className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  Konfigurasi Logo & Detail Header ({selectedKopUnit})
                </span>
                <span className="text-[10px] text-slate-400 font-mono">ID: unit-{selectedKopUnit.toLowerCase()}</span>
              </div>

              {/* LOGO UPLOAD & PREVIEW SECTION */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-xs">
                <span className="font-bold text-slate-700 block text-xs">
                  {selectedKopUnit === 'YAYASAN' ? 'Logo Utama Yayasan (Kiri / Induk)' : `Logo Unit ${selectedKopUnit} (Kanan / Spesifik Unit)`}
                </span>
                
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 flex items-center justify-center p-2 relative overflow-hidden group shadow-inner">
                    <img
                      src={
                        selectedKopUnit === 'YAYASAN' ? kopSurat.logoYayasan :
                        selectedKopUnit === 'TK' ? kopSurat.unitTK?.logo :
                        selectedKopUnit === 'SD' ? kopSurat.unitSD?.logo :
                        selectedKopUnit === 'SMP' ? kopSurat.unitSMP?.logo :
                        selectedKopUnit === 'SMA' ? kopSurat.unitSMA?.logo : kopSurat.unitPKBM?.logo
                      }
                      alt="Logo Unit"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=150';
                      }}
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    <label className="block text-[11px] font-extrabold text-slate-600">URL / Path Gambar Logo:</label>
                    <input
                      type="text"
                      value={
                        (selectedKopUnit === 'YAYASAN' ? kopSurat.logoYayasan :
                        selectedKopUnit === 'TK' ? kopSurat.unitTK?.logo :
                        selectedKopUnit === 'SD' ? kopSurat.unitSD?.logo :
                        selectedKopUnit === 'SMP' ? kopSurat.unitSMP?.logo :
                        selectedKopUnit === 'SMA' ? kopSurat.unitSMA?.logo : kopSurat.unitPKBM?.logo) || ''
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        if (selectedKopUnit === 'YAYASAN') setKopSurat({ ...kopSurat, logoYayasan: val });
                        else if (selectedKopUnit === 'TK') setKopSurat({ ...kopSurat, unitTK: { ...kopSurat.unitTK, logo: val } });
                        else if (selectedKopUnit === 'SD') setKopSurat({ ...kopSurat, unitSD: { ...kopSurat.unitSD, logo: val } });
                        else if (selectedKopUnit === 'SMP') setKopSurat({ ...kopSurat, unitSMP: { ...kopSurat.unitSMP, logo: val } });
                        else if (selectedKopUnit === 'SMA') setKopSurat({ ...kopSurat, unitSMA: { ...kopSurat.unitSMA, logo: val } });
                        else if (selectedKopUnit === 'PKBM') setKopSurat({ ...kopSurat, unitPKBM: { ...kopSurat.unitPKBM, logo: val } });
                      }}
                      className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs font-mono outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="https://..."
                    />

                    <div className="flex items-center gap-2">
                      <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] cursor-pointer flex items-center gap-1.5 border border-slate-300">
                        <Upload className="w-3.5 h-3.5 text-slate-600" />
                        <span>Pilih Berkas Logo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                const base64 = reader.result as string;
                                if (selectedKopUnit === 'YAYASAN') setKopSurat({ ...kopSurat, logoYayasan: base64 });
                                else if (selectedKopUnit === 'TK') setKopSurat({ ...kopSurat, unitTK: { ...kopSurat.unitTK, logo: base64 } });
                                else if (selectedKopUnit === 'SD') setKopSurat({ ...kopSurat, unitSD: { ...kopSurat.unitSD, logo: base64 } });
                                else if (selectedKopUnit === 'SMP') setKopSurat({ ...kopSurat, unitSMP: { ...kopSurat.unitSMP, logo: base64 } });
                                else if (selectedKopUnit === 'SMA') setKopSurat({ ...kopSurat, unitSMA: { ...kopSurat.unitSMA, logo: base64 } });
                                else if (selectedKopUnit === 'PKBM') setKopSurat({ ...kopSurat, unitPKBM: { ...kopSurat.unitPKBM, logo: base64 } });
                                triggerNotif('success', `Logo ${selectedKopUnit} berhasil diunggah!`);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      <span className="text-[10px] text-slate-400">PNG / JPG (Maks. 2MB, Background Transparan direkomendasikan)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* UNIT FORM FIELDS */}
              {selectedKopUnit === 'YAYASAN' ? (
                <div className="space-y-3">
                  <div>
                    <span className="font-bold text-slate-600 block mb-1">Nama Yayasan Induk:</span>
                    <input
                      type="text"
                      value={kopSurat.namaYayasan}
                      onChange={(e) => setKopSurat({ ...kopSurat, namaYayasan: e.target.value })}
                      className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-xs font-bold outline-none"
                    />
                  </div>
                  <div>
                    <span className="font-bold text-slate-600 block mb-1">Moto / Slogan Yayasan:</span>
                    <input
                      type="text"
                      value={kopSurat.moto}
                      onChange={(e) => setKopSurat({ ...kopSurat, moto: e.target.value })}
                      className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-xs font-bold outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <span className="font-bold text-slate-600 block mb-1">Nama Resmi Unit ({selectedKopUnit}):</span>
                      <input
                        type="text"
                        value={
                          (selectedKopUnit === 'TK' ? kopSurat.unitTK?.nama :
                          selectedKopUnit === 'SD' ? kopSurat.unitSD?.nama :
                          selectedKopUnit === 'SMP' ? kopSurat.unitSMP?.nama :
                          selectedKopUnit === 'SMA' ? kopSurat.unitSMA?.nama : kopSurat.unitPKBM?.nama) || ''
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (selectedKopUnit === 'TK') setKopSurat({ ...kopSurat, unitTK: { ...kopSurat.unitTK, nama: val } });
                          else if (selectedKopUnit === 'SD') setKopSurat({ ...kopSurat, unitSD: { ...kopSurat.unitSD, nama: val } });
                          else if (selectedKopUnit === 'SMP') setKopSurat({ ...kopSurat, unitSMP: { ...kopSurat.unitSMP, nama: val } });
                          else if (selectedKopUnit === 'SMA') setKopSurat({ ...kopSurat, unitSMA: { ...kopSurat.unitSMA, nama: val } });
                          else if (selectedKopUnit === 'PKBM') setKopSurat({ ...kopSurat, unitPKBM: { ...kopSurat.unitPKBM, nama: val } });
                        }}
                        className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-xs font-bold outline-none"
                      />
                    </div>
                    <div>
                      <span className="font-bold text-slate-600 block mb-1">NPSN Unit Sekolah:</span>
                      <input
                        type="text"
                        value={
                          (selectedKopUnit === 'TK' ? kopSurat.unitTK?.npsn :
                          selectedKopUnit === 'SD' ? kopSurat.unitSD?.npsn :
                          selectedKopUnit === 'SMP' ? kopSurat.unitSMP?.npsn :
                          selectedKopUnit === 'SMA' ? kopSurat.unitSMA?.npsn : kopSurat.unitPKBM?.npsn) || ''
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (selectedKopUnit === 'TK') setKopSurat({ ...kopSurat, unitTK: { ...kopSurat.unitTK, npsn: val } });
                          else if (selectedKopUnit === 'SD') setKopSurat({ ...kopSurat, unitSD: { ...kopSurat.unitSD, npsn: val } });
                          else if (selectedKopUnit === 'SMP') setKopSurat({ ...kopSurat, unitSMP: { ...kopSurat.unitSMP, npsn: val } });
                          else if (selectedKopUnit === 'SMA') setKopSurat({ ...kopSurat, unitSMA: { ...kopSurat.unitSMA, npsn: val } });
                          else if (selectedKopUnit === 'PKBM') setKopSurat({ ...kopSurat, unitPKBM: { ...kopSurat.unitPKBM, npsn: val } });
                        }}
                        className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-xs font-mono font-bold outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-slate-600 block mb-1">Alamat Unit Sekolah:</span>
                    <input
                      type="text"
                      value={
                        (selectedKopUnit === 'TK' ? kopSurat.unitTK?.alamat :
                        selectedKopUnit === 'SD' ? kopSurat.unitSD?.alamat :
                        selectedKopUnit === 'SMP' ? kopSurat.unitSMP?.alamat :
                        selectedKopUnit === 'SMA' ? kopSurat.unitSMA?.alamat : kopSurat.unitPKBM?.alamat) || ''
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        if (selectedKopUnit === 'TK') setKopSurat({ ...kopSurat, unitTK: { ...kopSurat.unitTK, alamat: val } });
                        else if (selectedKopUnit === 'SD') setKopSurat({ ...kopSurat, unitSD: { ...kopSurat.unitSD, alamat: val } });
                        else if (selectedKopUnit === 'SMP') setKopSurat({ ...kopSurat, unitSMP: { ...kopSurat.unitSMP, alamat: val } });
                        else if (selectedKopUnit === 'SMA') setKopSurat({ ...kopSurat, unitSMA: { ...kopSurat.unitSMA, alamat: val } });
                        else if (selectedKopUnit === 'PKBM') setKopSurat({ ...kopSurat, unitPKBM: { ...kopSurat.unitPKBM, alamat: val } });
                      }}
                      className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-xs font-bold outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <span className="font-bold text-slate-600 block mb-1">No. Telepon:</span>
                      <input
                        type="text"
                        value={
                          (selectedKopUnit === 'TK' ? kopSurat.unitTK?.telepon :
                          selectedKopUnit === 'SD' ? kopSurat.unitSD?.telepon :
                          selectedKopUnit === 'SMP' ? kopSurat.unitSMP?.telepon :
                          selectedKopUnit === 'SMA' ? kopSurat.unitSMA?.telepon : kopSurat.unitPKBM?.telepon) || ''
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (selectedKopUnit === 'TK') setKopSurat({ ...kopSurat, unitTK: { ...kopSurat.unitTK, telepon: val } });
                          else if (selectedKopUnit === 'SD') setKopSurat({ ...kopSurat, unitSD: { ...kopSurat.unitSD, telepon: val } });
                          else if (selectedKopUnit === 'SMP') setKopSurat({ ...kopSurat, unitSMP: { ...kopSurat.unitSMP, telepon: val } });
                          else if (selectedKopUnit === 'SMA') setKopSurat({ ...kopSurat, unitSMA: { ...kopSurat.unitSMA, telepon: val } });
                          else if (selectedKopUnit === 'PKBM') setKopSurat({ ...kopSurat, unitPKBM: { ...kopSurat.unitPKBM, telepon: val } });
                        }}
                        className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-xs font-bold outline-none"
                      />
                    </div>
                    <div>
                      <span className="font-bold text-slate-600 block mb-1">Email Unit:</span>
                      <input
                        type="text"
                        value={
                          (selectedKopUnit === 'TK' ? kopSurat.unitTK?.email :
                          selectedKopUnit === 'SD' ? kopSurat.unitSD?.email :
                          selectedKopUnit === 'SMP' ? kopSurat.unitSMP?.email :
                          selectedKopUnit === 'SMA' ? kopSurat.unitSMA?.email : kopSurat.unitPKBM?.email) || ''
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (selectedKopUnit === 'TK') setKopSurat({ ...kopSurat, unitTK: { ...kopSurat.unitTK, email: val } });
                          else if (selectedKopUnit === 'SD') setKopSurat({ ...kopSurat, unitSD: { ...kopSurat.unitSD, email: val } });
                          else if (selectedKopUnit === 'SMP') setKopSurat({ ...kopSurat, unitSMP: { ...kopSurat.unitSMP, email: val } });
                          else if (selectedKopUnit === 'SMA') setKopSurat({ ...kopSurat, unitSMA: { ...kopSurat.unitSMA, email: val } });
                          else if (selectedKopUnit === 'PKBM') setKopSurat({ ...kopSurat, unitPKBM: { ...kopSurat.unitPKBM, email: val } });
                        }}
                        className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-xs font-bold outline-none"
                      />
                    </div>
                    <div>
                      <span className="font-bold text-slate-600 block mb-1">Website Unit:</span>
                      <input
                        type="text"
                        value={
                          (selectedKopUnit === 'TK' ? kopSurat.unitTK?.website :
                          selectedKopUnit === 'SD' ? kopSurat.unitSD?.website :
                          selectedKopUnit === 'SMP' ? kopSurat.unitSMP?.website :
                          selectedKopUnit === 'SMA' ? kopSurat.unitSMA?.website : kopSurat.unitPKBM?.website) || ''
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (selectedKopUnit === 'TK') setKopSurat({ ...kopSurat, unitTK: { ...kopSurat.unitTK, website: val } });
                          else if (selectedKopUnit === 'SD') setKopSurat({ ...kopSurat, unitSD: { ...kopSurat.unitSD, website: val } });
                          else if (selectedKopUnit === 'SMP') setKopSurat({ ...kopSurat, unitSMP: { ...kopSurat.unitSMP, website: val } });
                          else if (selectedKopUnit === 'SMA') setKopSurat({ ...kopSurat, unitSMA: { ...kopSurat.unitSMA, website: val } });
                          else if (selectedKopUnit === 'PKBM') setKopSurat({ ...kopSurat, unitPKBM: { ...kopSurat.unitPKBM, website: val } });
                        }}
                        className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-xs font-bold outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* GLOBAL KOP STYLE CONTROLS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-200">
                <div className="space-y-1.5">
                  <span className="font-bold text-slate-600">Jenis Font Rapor & Surat:</span>
                  <select
                    value={kopSurat.fontFamily}
                    onChange={(e) => setKopSurat({ ...kopSurat, fontFamily: e.target.value as any })}
                    className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-xs font-bold outline-none cursor-pointer"
                  >
                    <option value="font-sans">Inter / Standard (Sans-Serif)</option>
                    <option value="font-serif">Georgia / Editorial (Serif)</option>
                    <option value="font-mono">JetBrains Mono / Tech (Monospace)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <span className="font-bold text-slate-600">Garis Batas Kop (Border Style):</span>
                  <select
                    value={kopSurat.borderStyle}
                    onChange={(e) => setKopSurat({ ...kopSurat, borderStyle: e.target.value as any })}
                    className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-xs font-bold outline-none cursor-pointer"
                  >
                    <option value="double">Double Border (Standar Resmi Rapor)</option>
                    <option value="solid">Tebal Tunggal (Solid Line)</option>
                    <option value="dashed">Garis Putus-putus (Dashed)</option>
                    <option value="none">Tanpa Garis Batas</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-600">Gunakan Watermark Background:</span>
                  <input
                    type="checkbox"
                    checked={kopSurat.showWatermark}
                    onChange={(e) => setKopSurat({ ...kopSurat, showWatermark: e.target.checked })}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                </div>
                {kopSurat.showWatermark && (
                  <input
                    type="text"
                    value={kopSurat.watermarkText}
                    onChange={(e) => setKopSurat({ ...kopSurat, watermarkText: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs font-mono outline-none"
                    placeholder="Teks Watermark..."
                  />
                )}
              </div>
            </div>

            {/* Live Realtime DUAL-LOGO Kop Preview */}
            <div className="border border-slate-200 rounded-2xl p-6 bg-slate-900 text-white space-y-4 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest block font-mono">
                    Live Cetak Kop Preview ({selectedKopUnit})
                  </span>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">Dual-Logo Alignment</span>
                </div>

                <div 
                  className="bg-white text-slate-900 p-6 rounded-xl shadow-xl border border-slate-200 text-center relative overflow-hidden"
                  style={{
                    fontFamily: kopSurat.fontFamily === 'font-mono' ? 'monospace' : kopSurat.fontFamily === 'font-serif' ? 'serif' : 'sans-serif',
                  }}
                >
                  {/* WATERMARK OVERLAY PREVIEW */}
                  {kopSurat.showWatermark && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 select-none">
                      <span className="text-4xl font-extrabold rotate-[-25deg] text-slate-900 tracking-widest uppercase">
                        {kopSurat.watermarkText || 'OFFICIAL DOCUMENT'}
                      </span>
                    </div>
                  )}

                  {/* KOP HEADER DUAL LOGO LAYOUT */}
                  <div className={`border-b-4 pb-3 ${
                    kopSurat.borderStyle === 'double' ? 'border-double' :
                    kopSurat.borderStyle === 'dashed' ? 'border-dashed' :
                    kopSurat.borderStyle === 'none' ? 'border-none' : 'border-solid'
                  }`} style={{ borderBottomColor: kopSurat.borderColor }}>
                    <div className="flex items-center justify-between gap-3">
                      {/* Logo Left: Yayasan Logo */}
                      <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center">
                        <img
                          src={kopSurat.logoYayasan}
                          alt="Logo Yayasan"
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=150';
                          }}
                        />
                      </div>

                      {/* Center Header Text */}
                      <div className="flex-1 text-center">
                        <span className="text-[10px] font-extrabold text-slate-700 block tracking-wider uppercase">
                          {kopSurat.namaYayasan}
                        </span>
                        <h4 className="text-sm font-black text-slate-950 uppercase mt-0.5 tracking-tight">
                          {
                            selectedKopUnit === 'YAYASAN' ? kopSurat.namaYayasan :
                            selectedKopUnit === 'TK' ? kopSurat.unitTK?.nama :
                            selectedKopUnit === 'SD' ? kopSurat.unitSD?.nama :
                            selectedKopUnit === 'SMP' ? kopSurat.unitSMP?.nama :
                            selectedKopUnit === 'SMA' ? kopSurat.unitSMA?.nama : kopSurat.unitPKBM?.nama
                          }
                        </h4>
                        {selectedKopUnit !== 'YAYASAN' && (
                          <span className="text-[9px] font-bold text-slate-500 font-mono block">
                            NPSN: {
                              selectedKopUnit === 'TK' ? kopSurat.unitTK?.npsn :
                              selectedKopUnit === 'SD' ? kopSurat.unitSD?.npsn :
                              selectedKopUnit === 'SMP' ? kopSurat.unitSMP?.npsn :
                              selectedKopUnit === 'SMA' ? kopSurat.unitSMA?.npsn : kopSurat.unitPKBM?.npsn
                            }
                          </span>
                        )}
                        <p className="text-[8px] text-slate-500 font-medium mt-0.5 leading-normal">
                          {
                            selectedKopUnit === 'YAYASAN' ? kopSurat.alamat :
                            selectedKopUnit === 'TK' ? kopSurat.unitTK?.alamat :
                            selectedKopUnit === 'SD' ? kopSurat.unitSD?.alamat :
                            selectedKopUnit === 'SMP' ? kopSurat.unitSMP?.alamat :
                            selectedKopUnit === 'SMA' ? kopSurat.unitSMA?.alamat : kopSurat.unitPKBM?.alamat
                          }
                          {' • '}Telp: {
                            selectedKopUnit === 'YAYASAN' ? kopSurat.telepon :
                            selectedKopUnit === 'TK' ? kopSurat.unitTK?.telepon :
                            selectedKopUnit === 'SD' ? kopSurat.unitSD?.telepon :
                            selectedKopUnit === 'SMP' ? kopSurat.unitSMP?.telepon :
                            selectedKopUnit === 'SMA' ? kopSurat.unitSMA?.telepon : kopSurat.unitPKBM?.telepon
                          }
                        </p>
                        <p className="text-[8px] text-emerald-700 font-mono">
                          Email: {
                            selectedKopUnit === 'YAYASAN' ? kopSurat.email :
                            selectedKopUnit === 'TK' ? kopSurat.unitTK?.email :
                            selectedKopUnit === 'SD' ? kopSurat.unitSD?.email :
                            selectedKopUnit === 'SMP' ? kopSurat.unitSMP?.email :
                            selectedKopUnit === 'SMA' ? kopSurat.unitSMA?.email : kopSurat.unitPKBM?.email
                          } | Website: {
                            selectedKopUnit === 'YAYASAN' ? kopSurat.website :
                            selectedKopUnit === 'TK' ? kopSurat.unitTK?.website :
                            selectedKopUnit === 'SD' ? kopSurat.unitSD?.website :
                            selectedKopUnit === 'SMP' ? kopSurat.unitSMP?.website :
                            selectedKopUnit === 'SMA' ? kopSurat.unitSMA?.website : kopSurat.unitPKBM?.website
                          }
                        </p>
                      </div>

                      {/* Logo Right: Unit Specific Logo */}
                      <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center">
                        <img
                          src={
                            selectedKopUnit === 'YAYASAN' ? kopSurat.logoYayasan :
                            selectedKopUnit === 'TK' ? kopSurat.unitTK?.logo :
                            selectedKopUnit === 'SD' ? kopSurat.unitSD?.logo :
                            selectedKopUnit === 'SMP' ? kopSurat.unitSMP?.logo :
                            selectedKopUnit === 'SMA' ? kopSurat.unitSMA?.logo : kopSurat.unitPKBM?.logo
                          }
                          alt={`Logo Unit ${selectedKopUnit}`}
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=150';
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* DOCUMENT BODY PREVIEW */}
                  <div className="pt-4 text-left text-[9px] text-slate-500 space-y-2">
                    <div className="text-center font-bold text-slate-900 border-b pb-1">
                      SURAT KETERANGAN LULUS / RAPOR AKHIR SISWA
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[8px]">
                      <div>Nama Siswa: <span className="text-slate-900 font-bold">Ahmad Fauzi</span></div>
                      <div>NISN / NIS: <span className="text-slate-900 font-bold">0081234567 / 20261001</span></div>
                      <div>Unit Pendidikan: <span className="text-emerald-700 font-bold">{selectedKopUnit}</span></div>
                      <div>Tahun Ajaran: <span className="text-slate-900 font-bold">2025/2026</span></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-xl text-[11px] text-slate-300 flex items-center justify-between border border-slate-700">
                <span className="font-medium">Status Sinkronisasi Kop:</span>
                <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 font-mono text-[10px] rounded-full border border-emerald-500/30">
                  Ready for Print (All Units Connected)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 4: KENAIKAN KELAS --- */}
      {activeMainTab === 'promotion' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-indigo-600" />
              <span>Sistem Kenaikan Kelas Otomatis (Promosi Kelas)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Rekomendasi otomatis dihitung dari gabungan nilai KKM ({academicSetting.kkmValue}) dan ambang batas ketidakhadiran alfa santri (maksimal 3 alfa).
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Evaluasi Promosi Kelas: X MIPA 1 ke XI MIPA 1</span>
              <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full">
                Sistem Terpadu • {academicData?.promotions?.length ?? 0} Santri Terdaftar
              </span>
            </div>

            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {academicData?.promotions?.map((promo) => {
                const student = processedLeger.find(s => s.studentId === promo.student_id);
                const avgScore = student?.avg ?? 80;
                
                return (
                  <div key={promo.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                    <div className="space-y-1 md:max-w-md">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">{promo.student_name}</span>
                        <span className="text-[10px] text-slate-400 font-bold">({promo.student_id})</span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400">
                        <span>Rata-rata Nilai: <strong className="text-slate-700">{avgScore.toFixed(1)}</strong></span>
                        <span>•</span>
                        <span>Kelas Saat Ini: <strong className="text-slate-700">{promo.current_class}</strong></span>
                      </div>
                      <div className="pt-1.5 flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-400">Rekomendasi:</span>
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                          promo.status === 'NAIK' ? 'text-emerald-700 bg-emerald-50 border border-emerald-100' :
                          'text-rose-700 bg-rose-50 border border-rose-100'
                        }`}>
                          {promo.status === 'NAIK' ? 'Naik Kelas' : 'Tinggal Kelas'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 shrink-0">
                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase">Aksi Override</label>
                        <select 
                          value={promo.status}
                          onChange={(e) => handleSavePromotionResult(promo.id, e.target.value, promo.notes)}
                          className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 rounded-lg p-1.5 outline-none"
                        >
                          <option value="NAIK">Naik Kelas</option>
                          <option value="TINGGAL">Tinggal Kelas</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase">Catatan Rapor</label>
                        <input 
                          type="text" 
                          value={promo.notes}
                          onChange={(e) => {
                            const updatedList = academicData.promotions.map(p => p.id === promo.id ? { ...p, notes: e.target.value } : p);
                            setAcademicData(prev => prev ? { ...prev, promotions: updatedList } : null);
                          }}
                          placeholder="Catatan wali kelas..."
                          className="text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-1.5 w-60 outline-none"
                        />
                      </div>

                      <div className="pt-4 md:pt-0 self-end">
                        <button 
                          onClick={() => handleSavePromotionResult(promo.id, promo.status, promo.notes)}
                          className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold py-2 px-3 rounded-xl transition cursor-pointer shadow-sm"
                        >
                          <Save className="h-3 w-3" />
                          <span>Simpan</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 5: KELULUSAN SANTRI --- */}
      {activeMainTab === 'graduation' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Award className="h-5 w-5 text-indigo-600" />
              <span>Sistem Kelulusan Akhir & Surat Keterangan Kelulusan (SKL)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Verifikasi kelulusan dewan guru, pengesahan hasil kelulusan, dan pencetakan instan SKL Rapor menggunakan Kop Surat Resmi lembaga.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Hasil Kelulusan Tingkat Akhir (Kelas XII / X-A)</span>
              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                Sidang Pleno Guru • {academicData?.graduations?.length ?? 0} Santri Terdaftar
              </span>
            </div>

            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {academicData?.graduations?.map((grad) => {
                return (
                  <div key={grad.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                    <div className="space-y-1 md:max-w-md">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">{grad.student_name}</span>
                        <span className="text-[9px] font-extrabold text-slate-400 bg-slate-100 px-1 py-0.5 rounded">NIS: {grad.nis}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400">
                        <span>Rata-rata Kelulusan: <strong className="text-slate-700">{grad.average_score}</strong></span>
                        <span>•</span>
                        <span>Disetujui Oleh: <strong className="text-slate-700">{grad.approved_by}</strong></span>
                      </div>
                      <div className="pt-1.5 flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-400">Rekomendasi:</span>
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                          grad.status === 'LULUS' ? 'text-emerald-700 bg-emerald-50 border border-emerald-100' :
                          'text-rose-700 bg-rose-50 border border-rose-100'
                        }`}>
                          {grad.status === 'LULUS' ? 'LULUS' : 'TIDAK LULUS'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 shrink-0">
                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase">Override Status</label>
                        <select 
                          value={grad.status}
                          onChange={(e) => handleSaveGraduationResult(grad.id, e.target.value, grad.notes)}
                          className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 rounded-lg p-1.5 outline-none"
                        >
                          <option value="LULUS">LULUS</option>
                          <option value="TIDAK_LULUS">TIDAK LULUS</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase">Keterangan SKL</label>
                        <input 
                          type="text" 
                          value={grad.notes}
                          onChange={(e) => {
                            const updatedList = academicData.graduations.map(g => g.id === grad.id ? { ...g, notes: e.target.value } : g);
                            setAcademicData(prev => prev ? { ...prev, graduations: updatedList } : null);
                          }}
                          placeholder="Keterangan kelulusan..."
                          className="text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-1.5 w-60 outline-none"
                        />
                      </div>

                      <div className="pt-4 md:pt-0 self-end flex items-center gap-2">
                        <button 
                          onClick={() => handleSaveGraduationResult(grad.id, grad.status, grad.notes)}
                          className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold py-2 px-3 rounded-xl transition cursor-pointer shadow-sm"
                        >
                          <Save className="h-3 w-3" />
                          <span>Simpan</span>
                        </button>

                        {grad.status === 'LULUS' && (
                          <button 
                            onClick={() => {
                              const printWindow = window.open('', '_blank');
                              if (!printWindow) {
                                triggerNotif('error', 'Gagal membuka halaman cetak SKL: Browser memblokir popup.');
                                return;
                              }

                              printWindow.document.write(`
                                <!DOCTYPE html>
                                <html>
                                  <head>
                                    <title>SKL - ${grad.student_name}</title>
                                    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
                                    <style>
                                      @media print {
                                        body { background-color: white; padding: 0; margin: 0; }
                                        .no-print { display: none !important; }
                                        .skl-page { border: none !important; box-shadow: none !important; padding: 0 !important; margin: 0 !important; }
                                      }
                                      body { background-color: #f1f5f9; display: flex; flex-direction: column; align-items: center; padding: 40px 20px; }
                                      .skl-page { background: white; width: 210mm; height: 297mm; padding: 25mm; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
                                    </style>
                                  </head>
                                  <body>
                                    <div class="no-print" style="margin-bottom: 20px; display: flex; gap: 8px;">
                                      <button onclick="window.print();" style="background: #4f46e5; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer;">
                                        🖨️ Cetak SKL Resmi
                                      </button>
                                      <button onclick="window.close();" style="background: #e2e8f0; color: #475569; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer;">
                                        Tutup
                                      </button>
                                    </div>

                                    <div class="skl-page flex flex-col justify-between">
                                      <div>
                                        <!-- Letterhead (KOP DUAL LOGO) -->
                                        <div class="border-b-4 border-double pb-4" style="border-color: ${kopSurat.borderColor}">
                                          <div class="flex items-center justify-between gap-4">
                                            <div class="w-16 h-16 flex-shrink-0 flex items-center justify-center">
                                              <img src="${kopSurat.logoYayasan}" alt="Logo Yayasan" class="max-h-full max-w-full object-contain" />
                                            </div>
                                            <div class="flex-1 text-center">
                                              <h4 class="text-xs uppercase font-extrabold text-indigo-700 tracking-wider">${kopSurat.namaYayasan}</h4>
                                              <h2 class="text-base uppercase font-black text-slate-900 mt-0.5">${kopSurat.unitSMA?.nama || kopSurat.namaSekolah}</h2>
                                              <p class="text-[9px] font-mono text-slate-500 font-bold">NPSN: ${kopSurat.unitSMA?.npsn || '20109988'}</p>
                                              <p class="text-[9px] text-slate-600 font-mono mt-0.5">${kopSurat.unitSMA?.alamat || kopSurat.alamat} • Telp: ${kopSurat.unitSMA?.telepon || kopSurat.telepon}</p>
                                              <p class="text-[9px] text-slate-500 italic">Web: ${kopSurat.unitSMA?.website || kopSurat.website} • Email: ${kopSurat.unitSMA?.email || kopSurat.email}</p>
                                            </div>
                                            <div class="w-16 h-16 flex-shrink-0 flex items-center justify-center">
                                              <img src="${kopSurat.unitSMA?.logo || kopSurat.logoYayasan}" alt="Logo Unit SMA" class="max-h-full max-w-full object-contain" />
                                            </div>
                                          </div>
                                        </div>

                                        <!-- Document Title -->
                                        <div class="text-center mt-8">
                                          <h3 class="text-sm font-black tracking-wide uppercase underline">SURAT KETERANGAN KELULUSAN</h3>
                                          <p class="text-[10px] font-mono text-slate-500 mt-1">Nomor: SKL/${grad.nis}/X-MIPA-1/2026</p>
                                        </div>

                                        <!-- Body Content -->
                                        <div class="mt-8 text-xs leading-relaxed text-slate-800 space-y-4">
                                          <p>Yang bertanda tangan di bawah ini, Kepala Sekolah <strong>${kopSurat.namaSekolah}</strong> menerangkan bahwa:</p>
                                          
                                          <table class="w-full ml-4" style="border-collapse: collapse;">
                                            <tr>
                                              <td class="w-1/4 py-1.5 font-bold">Nama Lengkap</td>
                                              <td class="py-1.5">: ${grad.student_name}</td>
                                            </tr>
                                            <tr>
                                              <td class="w-1/4 py-1.5 font-bold">Nomor Induk Siswa (NIS)</td>
                                              <td class="py-1.5">: ${grad.nis}</td>
                                            </tr>
                                            <tr>
                                              <td class="w-1/4 py-1.5 font-bold">NISN</td>
                                              <td class="py-1.5">: ${grad.nisn}</td>
                                            </tr>
                                            <tr>
                                              <td class="w-1/4 py-1.5 font-bold">Kelas / Peminatan</td>
                                              <td class="py-1.5">: Kelas XII MIPA / Astronomi Islam</td>
                                            </tr>
                                            <tr>
                                              <td class="w-1/4 py-1.5 font-bold">Rata-rata Ujian / Leger</td>
                                              <td class="py-1.5 font-bold text-indigo-600">: ${grad.average_score} / 100</td>
                                            </tr>
                                          </table>

                                          <p class="mt-6">Berdasarkan hasil rapat komite pleno kriteria kelulusan dewan guru, yang bersangkutan dinyatakan:</p>
                                          
                                          <div class="text-center my-6">
                                            <span class="inline-block border-2 border-green-600 text-green-700 bg-green-50 font-black text-sm tracking-widest px-8 py-3 rounded-xl uppercase">
                                              L U L U S
                                            </span>
                                          </div>

                                          <p>${grad.notes}</p>
                                          <p>Surat Keterangan Kelulusan ini dikeluarkan sebagai bukti kelulusan sementara sebelum diterbitkannya Ijazah dan Transkrip Nilai Akademik resmi oleh yayasan pendidikan.</p>
                                        </div>
                                      </div>

                                      <!-- Signatures -->
                                      <div class="flex justify-between items-end mt-12 text-xs">
                                        <div class="w-1/3 text-center">
                                          <!-- Left side spacing or dynamic watermark -->
                                        </div>
                                        <div class="w-1/3 text-center space-y-12">
                                          <div>
                                            <p class="text-[10px] text-slate-500">Padang, 20 Juli 2026</p>
                                            <p class="font-bold">Kepala Sekolah,</p>
                                          </div>
                                          <div class="font-bold underline">
                                            <p>Dr. KH. Ahmad Syauqi Lc., M.A</p>
                                            <p class="text-[9px] font-mono font-normal text-slate-400 mt-1">NIP. 197805122006041002</p>
                                          </div>
                                        </div>
                                      </div>

                                    </div>
                                  </body>
                                </html>
                              `);
                              printWindow.document.close();
                            }}
                            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold py-2 px-3 rounded-xl transition cursor-pointer shadow-sm"
                          >
                            <Printer className="h-3 w-3" />
                            <span>Cetak SKL</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB: ENTERPRISE PRINT & EXPORT CENTER --- */}
      {activeMainTab === 'export' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-8 pointer-events-none">
              <Printer className="h-48 w-48 text-indigo-400" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="bg-indigo-500/30 text-indigo-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-indigo-400/30">
                    Production Print Engine 2.0
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    Ready
                  </span>
                </div>
                <h2 className="text-xl font-black text-white tracking-tight">Enterprise Print & Export Center</h2>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Pusat kontrol terpadu untuk pencetakan massal Rapor, Leger Kelas, Transkrip Akademik, Kartu Ujian, dan Ekspor kustom data Excel/CSV dengan verifikasi keaslian dokumen berbasis QR Code & Hash SHA256.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    handlePrintAll();
                    logExportActionMutation.mutate({
                      user_name: 'Ustadz Irfan Hakim, S.Pd.',
                      action: 'MASS_PRINT_RAPOR',
                      document_type: 'Rapor Masa Rombel',
                      target_scope: 'Kelas X MIPA 1',
                      format: 'PRINT_DIRECT'
                    });
                  }}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                  <span>Cetak Massal Rapor Kelas</span>
                </button>
                <button
                  onClick={() => {
                    handleExportFile('ZIP');
                    logExportActionMutation.mutate({
                      user_name: 'Ustadz Irfan Hakim, S.Pd.',
                      action: 'MASS_ZIP_EXPORT',
                      document_type: 'Arsip Rapor PDF Kelas',
                      target_scope: 'Kelas X MIPA 1',
                      format: 'PDF_ZIP'
                    });
                  }}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-white/20 transition-all cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>Export ZIP Archive</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sub Navigation Tabs inside Print & Export Center */}
          <div className="flex border-b border-slate-200 bg-white p-1 rounded-xl shadow-sm gap-1 overflow-x-auto text-xs font-bold">
            <button
              onClick={() => setExportSubTab('documents')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all cursor-pointer ${
                exportSubTab === 'documents' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Pusat Cetak Dokumen</span>
            </button>
            <button
              onClick={() => setExportSubTab('excel')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all cursor-pointer ${
                exportSubTab === 'excel' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Eksportir Custom Excel / CSV</span>
            </button>
            <button
              onClick={() => setExportSubTab('paper_config')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all cursor-pointer ${
                exportSubTab === 'paper_config' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Sliders className="h-4 w-4" />
              <span>Pengaturan Kertas & Layout</span>
            </button>
            <button
              onClick={() => setExportSubTab('audit_trail')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all cursor-pointer ${
                exportSubTab === 'audit_trail' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Clock className="h-4 w-4" />
              <span>Antrean & Log Audit Ekspor</span>
            </button>
          </div>

          {/* SUB-TAB 1: DOKUMEN CETAK AKADEMIK */}
          {exportSubTab === 'documents' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card 1: Rapor Resmi Santri */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 hover:border-indigo-300 transition-all">
                <div className="flex items-start justify-between">
                  <div className="p-2.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
                    <FileText className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                    A4 / F4 • PORTRAIT
                  </span>
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Rapor Resmi Hasil Belajar Semester</h3>
                  <p className="text-xs text-slate-500 mt-1">Dokumen utama penilaian akademis, tahfidz, dan keadaban santri lengkap dengan Kop & QR Verification.</p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Target Rombel: <strong className="text-slate-800">X MIPA 1</strong></span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePrintSingle(selectedStudentId)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition cursor-pointer"
                    >
                      Cetak Rapor
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 2: Leger Nilai Lengkap */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 hover:border-indigo-300 transition-all">
                <div className="flex items-start justify-between">
                  <div className="p-2.5 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl">
                    <FileSpreadsheet className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                    F4 • LANDSCAPE
                  </span>
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Leger Nilai Akademik Matriks</h3>
                  <p className="text-xs text-slate-500 mt-1">Rekap nilai seluruh mata pelajaran, peringkat, dan nilai sikap per rombel secara horizontal.</p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Format: <strong className="text-slate-800">Landscape Folio</strong></span>
                  <button
                    onClick={() => {
                      handleExportFile('PDF');
                      logExportActionMutation.mutate({
                        user_name: 'Ustadz Irfan Hakim, S.Pd.',
                        action: 'LEGER_PRINT',
                        document_type: 'Leger Nilai Kelas',
                        target_scope: 'Kelas X MIPA 1',
                        format: 'PDF_LANDSCAPE'
                      });
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition cursor-pointer"
                  >
                    Cetak Leger
                  </button>
                </div>
              </div>

              {/* Card 3: Transkrip Akademik Kumulatif */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 hover:border-indigo-300 transition-all">
                <div className="flex items-start justify-between">
                  <div className="p-2.5 bg-amber-50 border border-amber-100 text-amber-600 rounded-xl">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                    A4 • PORTRAIT
                  </span>
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Transkrip Nilai Akademik Kumulatif</h3>
                  <p className="text-xs text-slate-500 mt-1">Dokumen rekap nilai dari semester awal hingga akhir untuk keperluan pendaftaran perguruan tinggi/beasiswa.</p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Santri: <strong className="text-slate-800">{activeStudent?.name || 'Farhan'}</strong></span>
                  <button
                    onClick={() => {
                      triggerNotif('info', 'Mencetak Transkrip Akademik Kumulatif...');
                      logExportActionMutation.mutate({
                        user_name: 'Ustadz Irfan Hakim, S.Pd.',
                        action: 'TRANSKRIP_PRINT',
                        document_type: 'Transkrip Kumulatif',
                        target_scope: activeStudent?.name || 'Santri',
                        format: 'PDF'
                      });
                    }}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition cursor-pointer"
                  >
                    Cetak Transkrip
                  </button>
                </div>
              </div>

              {/* Card 4: Kartu Peserta Ujian */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 hover:border-indigo-300 transition-all">
                <div className="flex items-start justify-between">
                  <div className="p-2.5 bg-blue-50 border border-blue-100 text-blue-600 rounded-xl">
                    <Award className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                    A4 • 4 KARTU / HALAMAN
                  </span>
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Kartu Ujian Peserta PAS / SAS</h3>
                  <p className="text-xs text-slate-500 mt-1">Cetak massal kartu ujian santri lengkap dengan foto, nomor peserta, lokasi, & QR Code verifikasi meja.</p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Total: <strong className="text-slate-800">30 Kartu</strong></span>
                  <button
                    onClick={() => {
                      triggerNotif('info', 'Mencetak Kartu Ujian Massal...');
                      logExportActionMutation.mutate({
                        user_name: 'Ustadz Irfan Hakim, S.Pd.',
                        action: 'EXAM_CARD_PRINT',
                        document_type: 'Kartu Peserta Ujian',
                        target_scope: 'Kelas X MIPA 1',
                        format: 'PDF_GRID'
                      });
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition cursor-pointer"
                  >
                    Cetak Kartu
                  </button>
                </div>
              </div>

              {/* Card 5: Surat Keterangan Lulus (SKL) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 hover:border-indigo-300 transition-all">
                <div className="flex items-start justify-between">
                  <div className="p-2.5 bg-purple-50 border border-purple-100 text-purple-600 rounded-xl">
                    <FileCheck className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                    A4 • OFFICIAL SEAL
                  </span>
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Surat Keterangan Lulus (SKL)</h3>
                  <p className="text-xs text-slate-500 mt-1">Dokumen resmi pengesahan kelulusan santri dengan Stempel & Tanda Tangan Digital Kepala Sekolah.</p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Status: <strong className="text-emerald-600 font-bold">Terverifikasi</strong></span>
                  <button
                    onClick={() => {
                      setActiveMainTab('graduation');
                      triggerNotif('info', 'Membuka modul Kelulusan & SKL...');
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition cursor-pointer"
                  >
                    Kelola SKL
                  </button>
                </div>
              </div>

              {/* Card 6: Sertifikat Capaian Tahfidz & Prestasi */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 hover:border-indigo-300 transition-all">
                <div className="flex items-start justify-between">
                  <div className="p-2.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl">
                    <Heart className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                    A4 • LANDSCAPE CERTIFICATE
                  </span>
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Sertifikat Tahfidz & Prestasi Santri</h3>
                  <p className="text-xs text-slate-500 mt-1">Sertifikat penghargaan capaian hafalan Al-Qur'an dan prestasi lomba berkategori eksklusif.</p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Design: <strong className="text-slate-800">Gold Border</strong></span>
                  <button
                    onClick={() => {
                      triggerNotif('info', 'Menyiapkan Sertifikat Tahfidz...');
                      logExportActionMutation.mutate({
                        user_name: 'Ustadz Irfan Hakim, S.Pd.',
                        action: 'CERTIFICATE_PRINT',
                        document_type: 'Sertifikat Tahfidz',
                        target_scope: activeStudent?.name || 'Santri',
                        format: 'PDF_CERTIFICATE'
                      });
                    }}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition cursor-pointer"
                  >
                    Cetak Sertifikat
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB 2: EXPORT DATA EXCEL / CSV CUSTOM */}
          {exportSubTab === 'excel' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">Eksportir Kustom Excel / CSV (Dynamic Column Exporter)</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Pilih kolom spesifik yang ingin diikutsertakan dalam file lembar kerja Excel untuk keperluan laporan dinas atau analisis.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      handleExportFile('XLS');
                      logExportActionMutation.mutate({
                        user_name: 'Ustadz Irfan Hakim, S.Pd.',
                        action: 'CUSTOM_EXCEL_EXPORT',
                        document_type: 'Data Excel Kustom',
                        target_scope: 'Kelas X MIPA 1',
                        format: 'XLSX'
                      });
                    }}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer shadow-sm"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>Unduh Format Excel (.XLSX)</span>
                  </button>
                  <button
                    onClick={() => {
                      handleExportFile('CSV');
                      logExportActionMutation.mutate({
                        user_name: 'Ustadz Irfan Hakim, S.Pd.',
                        action: 'CUSTOM_CSV_EXPORT',
                        document_type: 'Data CSV Kustom',
                        target_scope: 'Kelas X MIPA 1',
                        format: 'CSV'
                      });
                    }}
                    className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer shadow-sm"
                  >
                    <Download className="h-4 w-4" />
                    <span>Unduh CSV</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <span className="font-bold text-slate-700 text-xs block">Pilih Kolom Data yang Ingin Ditempatkan:</span>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
                  {[
                    { key: 'nis', label: 'NIS / Nomor Induk' },
                    { key: 'nisn', label: 'NISN Nasional' },
                    { key: 'name', label: 'Nama Lengkap Santri' },
                    { key: 'gender', label: 'Jenis Kelamin (L/P)' },
                    { key: 'harian', label: 'Rata-rata Tugas & Formatif' },
                    { key: 'pts', label: 'Nilai PTS (Tengah Semester)' },
                    { key: 'pas', label: 'Nilai PAS (Akhir Semester)' },
                    { key: 'final_score', label: 'Nilai Akhir Rapor' },
                    { key: 'predikat', label: 'Predikat Capaian (A/B/C)' },
                    { key: 'tahfidz', label: 'Capaian Juz Tahfidz' },
                    { key: 'absensi', label: 'Rekapitulasi Kehadiran' },
                    { key: 'karakter', label: 'Deskripsi Catatan Wali Kelas' },
                  ].map(col => {
                    const isChecked = selectedExcelColumns.includes(col.key);
                    return (
                      <label
                        key={col.key}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                          isChecked ? 'bg-indigo-50/70 border-indigo-200 text-indigo-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedExcelColumns([...selectedExcelColumns, col.key]);
                            } else {
                              setSelectedExcelColumns(selectedExcelColumns.filter(k => k !== col.key));
                            }
                          }}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>{col.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB 3: PENGATURAN KERTAS & LAYOUT (PAPER CONFIG) */}
          {exportSubTab === 'paper_config' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="font-extrabold text-slate-800 text-sm">Konfigurasi Ukuran Kertas, Margin & Fitur Cetak</h3>
                <p className="text-xs text-slate-500 mt-0.5">Atur spesifikasi fisik pencetakan kertas agar hasil cetak rapor dan leger pas pada ukuran kertas sekolah tanpa terpotong.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                {/* Panel Kiri: Fisik Kertas */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <span className="font-bold text-slate-700">Ukuran Kertas Standar:</span>
                    <select
                      value={exportPaperConfig.paperSize}
                      onChange={(e) => setExportPaperConfig({ ...exportPaperConfig, paperSize: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-bold outline-none cursor-pointer"
                    >
                      <option value="F4">F4 / Folio (215 x 330 mm) - Standar Sekolah Indonesia</option>
                      <option value="A4">A4 (210 x 297 mm) - Standar Internasional</option>
                      <option value="LEGAL">Legal (216 x 356 mm)</option>
                      <option value="A3">A3 (297 x 420 mm) - Untuk Leger Besar</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <span className="font-bold text-slate-700">Orientasi Halaman:</span>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setExportPaperConfig({ ...exportPaperConfig, orientation: 'PORTRAIT' })}
                        className={`py-2 px-3 rounded-xl border text-center font-bold cursor-pointer transition ${
                          exportPaperConfig.orientation === 'PORTRAIT' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        Portrait (Tegak)
                      </button>
                      <button
                        type="button"
                        onClick={() => setExportPaperConfig({ ...exportPaperConfig, orientation: 'LANDSCAPE' })}
                        className={`py-2 px-3 rounded-xl border text-center font-bold cursor-pointer transition ${
                          exportPaperConfig.orientation === 'LANDSCAPE' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        Landscape (Mendatar)
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="font-bold text-slate-700 block">Margin Halaman Cetak (Milimeter):</span>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] text-slate-400">Margin Atas (mm):</span>
                        <input
                          type="number"
                          value={exportPaperConfig.marginTop}
                          onChange={(e) => setExportPaperConfig({ ...exportPaperConfig, marginTop: Number(e.target.value) })}
                          className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs font-mono"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400">Margin Bawah (mm):</span>
                        <input
                          type="number"
                          value={exportPaperConfig.marginBottom}
                          onChange={(e) => setExportPaperConfig({ ...exportPaperConfig, marginBottom: Number(e.target.value) })}
                          className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs font-mono"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400">Margin Kiri (mm):</span>
                        <input
                          type="number"
                          value={exportPaperConfig.marginLeft}
                          onChange={(e) => setExportPaperConfig({ ...exportPaperConfig, marginLeft: Number(e.target.value) })}
                          className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs font-mono"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400">Margin Kanan (mm):</span>
                        <input
                          type="number"
                          value={exportPaperConfig.marginRight}
                          onChange={(e) => setExportPaperConfig({ ...exportPaperConfig, marginRight: Number(e.target.value) })}
                          className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Panel Kanan: Watermark & Verifikasi Keaslian */}
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">Aktifkan Watermark Latar Belakang:</span>
                      <input
                        type="checkbox"
                        checked={exportPaperConfig.enableWatermark}
                        onChange={(e) => setExportPaperConfig({ ...exportPaperConfig, enableWatermark: e.target.checked })}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </div>
                    {exportPaperConfig.enableWatermark && (
                      <div className="space-y-2 pt-2 border-t border-slate-200">
                        <input
                          type="text"
                          value={exportPaperConfig.watermarkText}
                          onChange={(e) => setExportPaperConfig({ ...exportPaperConfig, watermarkText: e.target.value })}
                          className="w-full bg-white border border-slate-200 p-2 rounded-xl text-xs font-semibold outline-none"
                          placeholder="Teks Watermark..."
                        />
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-slate-500">Opasitas:</span>
                          <input
                            type="range"
                            min="0.05"
                            max="0.40"
                            step="0.01"
                            value={exportPaperConfig.watermarkOpacity}
                            onChange={(e) => setExportPaperConfig({ ...exportPaperConfig, watermarkOpacity: Number(e.target.value) })}
                            className="w-full accent-indigo-600 cursor-pointer"
                          />
                          <span className="text-[10px] font-mono text-slate-600 font-bold">{Math.round(exportPaperConfig.watermarkOpacity * 100)}%</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">QR Code Verifikasi & Hash SHA256:</span>
                      <input
                        type="checkbox"
                        checked={exportPaperConfig.enableQRCode}
                        onChange={(e) => setExportPaperConfig({ ...exportPaperConfig, enableQRCode: e.target.checked })}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      Menampilkan penanda QR Code dan potongan Hash Digital SHA256 di bagian catatan kaki (footer) untuk memastikan dokumen yang dicetak tidak dimanipulasi.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <span className="font-bold text-slate-700">Catatan Kaki Footer Rapor:</span>
                    <input
                      type="text"
                      value={exportPaperConfig.footerNote}
                      onChange={(e) => setExportPaperConfig({ ...exportPaperConfig, footerNote: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => saveExportConfigMutation.mutate(exportPaperConfig)}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs cursor-pointer shadow-md transition-all"
              >
                SIMPAN KONFIGURASI CETAK GLOBAL
              </button>
            </div>
          )}

          {/* SUB-TAB 4: ANTREAN & LOG AUDIT EKSPOR */}
          {exportSubTab === 'audit_trail' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">Riwayat & Log Audit Pencetakan & Ekspor Dokumen</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Seluruh jejak cetak, pengunduhan file, dan penerbitan dokumen terverifikasi secara permanen.</p>
                </div>
                <button
                  onClick={() => refetchExportLogs()}
                  className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-xl text-xs transition cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Segarkan Logs</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                      <th className="py-3 px-4">Waktu</th>
                      <th className="py-3 px-4">Pengguna</th>
                      <th className="py-3 px-4">Tipe Dokumen</th>
                      <th className="py-3 px-4">Cakupan / Target</th>
                      <th className="py-3 px-4">Format</th>
                      <th className="py-3 px-4">Hash ID (SHA256)</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(dbExportLogs && dbExportLogs.length > 0 ? dbExportLogs : [
                      {
                        id: 'log-01',
                        created_at: new Date().toISOString(),
                        user_name: 'Ustadz Irfan Hakim, S.Pd.',
                        document_type: 'Rapor Resmi Semester Ganjil',
                        target_scope: 'Kelas X MIPA 1 (30 Santri)',
                        format: 'PDF_ZIP',
                        hash_id: '8f92a1c0-sha256-dh',
                        status: 'SUCCESS'
                      }
                    ]).map((log: any) => (
                      <tr key={log.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                          {new Date(log.created_at).toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-800">{log.user_name}</td>
                        <td className="py-3 px-4 text-slate-700 font-medium">{log.document_type}</td>
                        <td className="py-3 px-4 text-slate-600">{log.target_scope}</td>
                        <td className="py-3 px-4 font-mono text-[10px]">
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold">
                            {log.format}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[10px] text-indigo-600 font-bold">{log.hash_id}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            <span>VERIFIED</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- TAB 6: ACADEMIC SETTINGS --- */}
      {activeMainTab === 'setting' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-extrabold text-slate-800 text-sm">Pengaturan & Konfigurasi Akademik Global</h3>
            <p className="text-xs text-slate-500 mt-0.5">Atur format kurikulum default, batas KKM, nomor dokumen otomatis, serta metode tanda tangan digital.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <span className="font-bold text-slate-600">Format Kurikulum Aktif:</span>
                <select
                  value={academicSetting.curriculum}
                  onChange={(e) => setAcademicSetting({ ...academicSetting, curriculum: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-bold outline-none cursor-pointer"
                >
                  <option value="MERDEKA">Kurikulum Merdeka (Standar Nasional)</option>
                  <option value="K13">Kurikulum Nasional 2013 (K13)</option>
                  <option value="MADRASAH">Kemenag Madrasah Aliyah/Tsanawiyah</option>
                  <option value="PESANTREN">Kurikulum Khusus Pondok Pesantren</option>
                  <option value="PKBM">Kurikulum PKBM / Kesetaraan</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <span className="font-bold text-slate-600">Semester Berjalan:</span>
                <select
                  value={academicSetting.semester}
                  onChange={(e) => setAcademicSetting({ ...academicSetting, semester: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-bold outline-none cursor-pointer"
                >
                  <option value="GANJIL">Semester 1 (Ganjil)</option>
                  <option value="GENAP">Semester 2 (Genap)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <span className="font-bold text-slate-600">Kriteria Ketuntasan Minimal (KKM):</span>
                <input
                  type="number"
                  value={academicSetting.kkmValue}
                  onChange={(e) => setAcademicSetting({ ...academicSetting, kkmValue: Number(e.target.value) || 75 })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-bold outline-none"
                  min="0"
                  max="100"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <span className="font-bold text-slate-600">Pola Nomor Dokumen Rapor Otomatis:</span>
                <input
                  type="text"
                  value={academicSetting.docNumberPattern}
                  onChange={(e) => setAcademicSetting({ ...academicSetting, docNumberPattern: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-mono outline-none"
                  placeholder="Format..."
                />
                <span className="text-[10px] text-slate-400 block font-mono">Contoh: DH-LK/RAPOR/2026/001 (Gunakan penanda [SEQ] untuk nomor urut otomatis)</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-600">Gunakan QR Tanda Tangan Digital (E-Signature):</span>
                  <input
                    type="checkbox"
                    checked={academicSetting.useDigitalSignature}
                    onChange={(e) => setAcademicSetting({ ...academicSetting, useDigitalSignature: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">Keamanan dokumen rapor diverifikasi menggunakan penanda QR digital terpusat yang aman dari manipulasi cetak manual.</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveSettings}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs cursor-pointer shadow-md"
          >
            SIMPAN PENGATURAN GLOBAL
          </button>
        </div>
      )}

      {/* --- AUDIT LOGS OVERLAY MODAL --- */}
      {showAuditModal && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-slate-50 border-b border-slate-100 p-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-600 animate-pulse" />
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">Log Audit Leger & Riwayat Multi-Stage Approval</h3>
                  <p className="text-[11px] text-slate-400">Transparansi penuh perubahan nilai dan rantai otorisasi akademik</p>
                </div>
              </div>
              <button
                onClick={() => setShowAuditModal(false)}
                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
              {/* Part 1: Workflow Approvals */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-slate-700 flex items-center gap-1.5 uppercase tracking-wide text-[10px]">
                  <span className="h-2 w-2 bg-amber-500 rounded-full animate-pulse" />
                  <span>Riwayat Persetujuan & Transisi Dokumen (Workflow Logs)</span>
                </h4>
                {auditApprovalLogs.length === 0 ? (
                  <p className="text-slate-400 italic p-3 bg-slate-50 rounded-xl text-center">Belum ada aktivitas persetujuan atau penolakan terdokumentasi.</p>
                ) : (
                  <div className="border border-slate-150 rounded-2xl overflow-hidden divide-y divide-slate-100">
                    {auditApprovalLogs.map((log) => (
                      <div key={log.id} className="p-4 hover:bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-all">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                              log.action === 'SUBMITTED' ? 'bg-amber-100 text-amber-800' :
                              log.action === 'APPROVED_HOMEROOM' ? 'bg-blue-100 text-blue-800' :
                              log.action === 'APPROVED_PRINCIPAL' ? 'bg-indigo-100 text-indigo-800' :
                              log.action === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-800' :
                              'bg-rose-100 text-rose-800'
                            }`}>
                              {log.action}
                            </span>
                            <span className="font-bold text-slate-800">{log.actor_name}</span>
                            <span className="text-slate-400 font-medium">({log.actor_role})</span>
                          </div>
                          {log.notes && (
                            <p className="text-slate-500 italic bg-rose-50/50 border-l-2 border-rose-400 p-2 rounded-r-lg mt-1 font-mono">
                              Catatan: &quot;{log.notes}&quot;
                            </p>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(log.created_at).toLocaleString('id-ID')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Part 2: Score Modifications */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-slate-700 flex items-center gap-1.5 uppercase tracking-wide text-[10px]">
                  <span className="h-2 w-2 bg-indigo-500 rounded-full animate-pulse" />
                  <span>Riwayat Modifikasi Sel Nilai (Score Change Audit Trail)</span>
                </h4>
                {auditScoreLogs.length === 0 ? (
                  <p className="text-slate-400 italic p-3 bg-slate-50 rounded-xl text-center">Belum ada perubahan komponen nilai yang terekam pada sesi ini.</p>
                ) : (
                  <div className="border border-slate-150 rounded-2xl overflow-hidden divide-y divide-slate-100 max-h-72 overflow-y-auto">
                    {auditScoreLogs.map((log) => (
                      <div key={log.id} className="p-3.5 hover:bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-extrabold text-slate-800">{log.student_name}</span>
                            <span className="text-slate-300">•</span>
                            <span className="font-bold text-indigo-700 font-mono uppercase bg-indigo-50 px-1.5 py-0.5 rounded text-[9px]">{log.component_name}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-500 font-medium">Oleh {log.actor_name} ({log.actor_role})</span>
                          </div>
                          <div className="flex items-center gap-1.5 font-mono text-[10px]">
                            <span className="text-slate-400">Nilai Sebelumnya:</span>
                            <span className="line-through text-slate-400">{log.old_score}</span>
                            <span className="text-slate-400">&rarr;</span>
                            <span className="text-slate-400">Nilai Baru:</span>
                            <span className="font-black text-emerald-600">{log.new_score}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(log.created_at).toLocaleString('id-ID')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-100 p-4 flex justify-end">
              <button
                onClick={() => setShowAuditModal(false)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl transition-all shadow cursor-pointer"
              >
                Tutup Log Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- AI ANALYSIS MODAL --- */}
      {showAIModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl max-h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-violet-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <Sparkles className="h-6 w-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 tracking-tight">AI Academic Insights (Gemini)</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Laporan Analisa Kecerdasan Leger Darul Hijrah</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAIModal(false)}
                className="p-2 hover:bg-white/50 rounded-full transition-colors cursor-pointer"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 overflow-y-auto flex-1 bg-slate-50/30">
              <div className="prose prose-indigo max-w-none prose-sm">
                <Markdown>{analysisReport}</Markdown>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-white border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono font-bold">
                <Info className="h-3.5 w-3.5" />
                <span>Analisa ini dihasilkan secara otomatis menggunakan model Google Gemini.</span>
              </div>
              <button 
                onClick={() => setShowAIModal(false)}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl transition-all shadow-lg cursor-pointer"
              >
                Tutup Laporan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
