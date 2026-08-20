/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Building, 
  GraduationCap, 
  Home, 
  CalendarDays, 
  BookOpen, 
  FileText, 
  Sliders, 
  Wallet, 
  Printer, 
  Upload, 
  Mail, 
  MessageSquare, 
  Database, 
  ShieldCheck, 
  Users, 
  Layers, 
  Sparkles, 
  Smartphone, 
  Cpu, 
  Activity, 
  Search, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  HelpCircle,
  FileSpreadsheet,
  Terminal,
  Clock,
  KeyRound,
  Compass,
  Plus,
  Trash2,
  Copy,
  Edit3,
  Eye,
  Download,
  Shield,
  Key,
  X,
  Check,
  Award
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../api/client';
import { EnterpriseMonitoringObservabilityEngine } from '../components/EnterpriseMonitoringObservabilityEngine';
import { EnterpriseIntegrationApiGatewayEngine } from '../components/EnterpriseIntegrationApiGatewayEngine';
import { EnterpriseProductionReadinessEngine } from '../components/EnterpriseProductionReadinessEngine';

export default function Sistem() {
  const { user, previewRole } = useAuth();
  const { refreshSettings } = useSettings();

  const rawRole = previewRole || user?.role || '';
  const isSuperAdmin = rawRole.toUpperCase().replace(/\s+/g, '_') === 'SUPER_ADMIN';

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isSuperAdmin) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-2xl mx-auto my-12 text-center shadow-sm font-sans">
        <div className="h-16 w-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Akses Terbatas System &amp; Settings</h2>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          Modul Pengaturan Sistem, Konfigurasi Server &amp; RBAC Global hanya dapat diakses oleh akun dengan peran <span className="font-bold text-slate-700">SUPER_ADMIN</span>.
        </p>
        <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 font-mono">
          Peran Anda saat ini: <span className="font-bold text-indigo-600">{previewRole || user?.role || 'Pengguna'}</span>
        </div>
      </div>
    );
  }

  // Search filter for 22 tabs
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Section filter state
  const [selectedSection, setSelectedSection] = useState<string>('Semua');
  
  // Selected category tab ID
  const [activeTab, setActiveTab] = useState<string>('yayasan');

  // RBAC Engine Interactive State
  const [roleModalOpen, setRoleModalOpen] = useState<boolean>(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [permMatrixModalOpen, setPermMatrixModalOpen] = useState<boolean>(false);
  const [activeRoleForPerms, setActiveRoleForPerms] = useState<any>(null);
  const [menuModalOpen, setMenuModalOpen] = useState<boolean>(false);
  const [editingMenu, setEditingMenu] = useState<any>(null);
  const [widgetModalOpen, setWidgetModalOpen] = useState<boolean>(false);
  const [editingWidget, setEditingWidget] = useState<any>(null);

  // Test states
  const [testingSmtp, setTestingSmtp] = useState<boolean>(false);
  const [testingWa, setTestingWa] = useState<boolean>(false);
  const [optimizingDb, setOptimizingDb] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ type: 'smtp' | 'wa' | 'db', msg: string, success: boolean } | null>(null);

  // Unified configurations state (stores all 22 categories)
  const [settings, setSettings] = useState<any>({
    // 1. Profil Yayasan
    yayasan_nama: '',
    yayasan_logo: '',
    yayasan_ketua: '',
    yayasan_bendahara: '',
    yayasan_alamat: '',
    yayasan_telepon: '',
    yayasan_email: '',
    yayasan_website: '',
    yayasan_npwp: '',
    yayasan_nib: '',
    yayasan_akta: '',
    yayasan_visi: '',
    yayasan_misi: '',

    // 2. Profil Sekolah
    sekolah_nama: '',
    sekolah_npsn: '',
    sekolah_nss: '',
    sekolah_jenjang: '',
    sekolah_status: '',
    sekolah_akreditasi: '',
    sekolah_kepsek: '',
    sekolah_wakepsek: '',
    sekolah_operator: '',
    sekolah_alamat: '',
    sekolah_kecamatan: '',
    sekolah_kabupaten: '',
    sekolah_provinsi: '',
    sekolah_kodepos: '',
    sekolah_latitude: 0,
    sekolah_longitude: 0,
    sekolah_logo: '',
    sekolah_stempel: '',
    sekolah_foto: '',

    // Multi-Unit Logos
    logo_tk: '',
    logo_sd: '',
    logo_smp: '',
    logo_sma: '',
    logo_pkbm: '',

    // 3. Profil Pondok
    pondok_nama: '',
    pondok_pimpinan: '',
    pondok_motto: '',
    pondok_visi: '',
    pondok_misi: '',
    pondok_logo: '',
    pondok_alamat: '',
    pondok_kontak: '',

    // 4. Tahun Ajaran
    ta_aktif: '',
    ta_semester: 'GANJIL',
    ta_kalender: '',
    ta_mulai: '',
    ta_selesai: '',

    // 5. Pengaturan KBM
    kbm_jam_mulai: '',
    kbm_durasi: 40,
    kbm_hari_aktif: [],
    kbm_shift: '',
    kbm_istirahat: '',
    kbm_pulang: '',
    kbm_kkm: 75,
    kbm_kktp: 75,
    kbm_kurikulum: '',

    // 6. Pengaturan Rapor
    rapor_template: '',
    rapor_kop: '',
    rapor_logo: '',
    rapor_kepsek: '',
    rapor_ttd: '',
    rapor_qr_verif: true,
    rapor_format_nilai: '',
    rapor_predikat: '',
    rapor_deskripsi_ai: true,
    rapor_penomoran: '',

    // 7. Pengaturan Leger
    leger_format: '',
    leger_kolom: 10,
    leger_freeze_header: true,
    leger_freeze_nama: true,
    leger_autosave: true,
    leger_import_excel: true,
    leger_export_excel: true,
    leger_export_pdf: true,

    // 8. Pengaturan Keuangan
    keu_mata_uang: 'IDR',
    keu_spp_default: 0,
    keu_va_active: true,
    keu_kas_default: '',
    keu_bank_nama: '',
    keu_pajak_persen: 0,
    keu_format_kwitansi: '',
    keu_format_invoice: '',
    keu_format_jurnal: '',

    // 9. Pengaturan Surat
    surat_kop: '',
    surat_footer: '',
    surat_nomor_format: '',
    surat_qr_active: true,
    surat_barcode_active: false,
    surat_digital_signature: '',
    surat_watermark: '',

    // 10. Pengaturan Printer
    print_kertas: 'A4',
    print_margin_atas: 20,
    print_margin_bawah: 20,
    print_margin_kiri: 20,
    print_margin_kanan: 20,
    print_font: 'Inter',
    print_orientasi: 'PORTRAIT',
    print_printer_default: '',
    print_preview_active: true,

    // 11. Pengaturan Upload
    upload_max_size: 5,
    upload_allowed_types: [],
    upload_folder: '',
    upload_compression: true,
    upload_watermark: false,

    // 12. Pengaturan Email
    email_host: '',
    email_port: 587,
    email_user: '',
    email_pass: '',
    email_ssl: true,
    email_sender: '',

    // 13. Pengaturan WhatsApp
    wa_gateway: '',
    wa_token: '',
    wa_device: '',
    wa_default_number: '',

    // 14. Pengaturan Backup
    backup_auto: true,
    backup_schedule: 'daily',
    backup_location: 'CLOUD',
    backup_gdrive_active: true,
    backup_restore_point: '',

    // 15. Pengaturan Database
    db_host: '',
    db_port: 3306,
    db_name: '',
    db_user: '',

    // 16. Pengaturan Security
    sec_jwt_expiry: '24h',
    sec_session_timeout: 60,
    sec_login_attempts: 5,
    sec_password_policy: 'STRONG',
    sec_mfa_active: false,
    sec_audit_active: true,
    sec_activity_active: true,

    // 17. Pengaturan Role
    roles_list: [],

    // 18. Pengaturan Menu
    menus_list: [],

    // 19. Pengaturan Dashboard
    dashboard_widgets: [],

    // 20. Pengaturan AI
    ai_api_key: '',
    ai_prompt: '',
    ai_template: '',
    ai_model: '',
    ai_temperature: 0.7,
    ai_max_token: 2048,

    // 21. Pengaturan Mobile
    mobile_splash: '',
    mobile_icon: '',
    mobile_theme: '',
    mobile_primary_color: '',
    mobile_secondary_color: '',
    mobile_notification: true,
    mobile_version: '',

    // 22. Pengaturan Sistem
    sys_timezone: 'Asia/Jakarta',
    sys_language: 'id',
    sys_date_format: 'DD/MM/YYYY',
    sys_time_format: '24h',
    sys_currency: 'IDR',
    sys_auto_number: true,
    sys_cache_active: true,
    sys_maintenance_mode: false
  });

  // Load settings from backend database
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await apiClient.post('/api/action', { action: 'getSettings' });
      if (res.data?.success) {
        setSettings(res.data.data);
      } else {
        setErrorMsg(res.data?.message || 'Gagal memuat pengaturan sistem.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Koneksi ke server settings terputus.');
    } finally {
      setLoading(false);
    }
  };

  // Handle inputs dynamically
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Checkbox mapping
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setSettings((prev: any) => ({ ...prev, [name]: checked }));
    } else {
      setSettings((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  // Multiselect or customized array handler
  const handleArrayToggle = (category: string, item: string) => {
    const list = [...settings[category]];
    const idx = list.indexOf(item);
    if (idx > -1) {
      list.splice(idx, 1);
    } else {
      list.push(item);
    }
    setSettings((prev: any) => ({ ...prev, [category]: list }));
  };

  // Save updated settings to backend
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (['monitoring', 'integration-gateway', 'production-qa'].includes(activeTab)) {
      return;
    }
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const res = await apiClient.post('/api/action', {
        action: 'saveSettings',
        ...settings
      });
      if (res.data?.success) {
        setSettings(res.data.data);
        await refreshSettings();
        setSuccessMsg('Seluruh konfigurasi sistem berhasil disimpan ke database MySQL dan langsung diterapkan!');
        setTimeout(() => setSuccessMsg(null), 5000);
      } else {
        setErrorMsg(res.data?.message || 'Gagal menyimpan konfigurasi.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Kesalahan jaringan saat menyimpan konfigurasi.');
    } finally {
      setSaving(false);
    }
  };

  // Test Action helper wrappers
  const handleTestSmtp = async () => {
    setTestingSmtp(true);
    setTestResult(null);
    try {
      const res = await apiClient.post('/api/action', {
        action: 'testSmtp',
        host: settings.email_host,
        port: Number(settings.email_port),
        user: settings.email_user
      });
      setTestResult({
        type: 'smtp',
        success: res.data?.success || false,
        msg: res.data?.message || 'Pengujian SMTP selesai.'
      });
    } catch (err: any) {
      setTestResult({ type: 'smtp', success: false, msg: err.message });
    } finally {
      setTestingSmtp(false);
    }
  };

  const handleTestWa = async () => {
    setTestingWa(true);
    setTestResult(null);
    try {
      const res = await apiClient.post('/api/action', {
        action: 'testWhatsapp',
        token: settings.wa_token,
        number: settings.wa_default_number
      });
      setTestResult({
        type: 'wa',
        success: res.data?.success || false,
        msg: res.data?.message || 'Pengujian WhatsApp Gateway selesai.'
      });
    } catch (err: any) {
      setTestResult({ type: 'wa', success: false, msg: err.message });
    } finally {
      setTestingWa(false);
    }
  };

  const handleDbRepair = async (mode: 'optimize' | 'repair') => {
    setOptimizingDb(true);
    setTestResult(null);
    try {
      const actionKey = mode === 'optimize' ? 'databaseOptimization' : 'databaseRepair';
      const res = await apiClient.post('/api/action', { action: actionKey });
      setTestResult({
        type: 'db',
        success: res.data?.success || false,
        msg: res.data?.message || 'Operasi pemeliharaan database selesai.'
      });
    } catch (err: any) {
      setTestResult({ type: 'db', success: false, msg: err.message });
    } finally {
      setOptimizingDb(false);
    }
  };

  // Sidebar list of 22 tabs
  const CATEGORIES = [
    { id: 'yayasan', name: 'Profil Yayasan', icon: Building, section: 'Profil' },
    { id: 'sekolah', name: 'Profil Sekolah', icon: GraduationCap, section: 'Profil' },
    { id: 'pondok', name: 'Profil Pondok', icon: Home, section: 'Profil' },
    { id: 'ta', name: 'Tahun Ajaran', icon: CalendarDays, section: 'KBM' },
    { id: 'kbm', name: 'Pengaturan KBM', icon: BookOpen, section: 'KBM' },
    { id: 'rapor', name: 'Pengaturan Rapor', icon: FileText, section: 'KBM' },
    { id: 'leger', name: 'Pengaturan Leger', icon: FileSpreadsheet, section: 'KBM' },
    { id: 'keuangan', name: 'Pengaturan Keuangan', icon: Wallet, section: 'KBM' },
    { id: 'surat', name: 'Pengaturan Surat', icon: FileText, section: 'Operasional' },
    { id: 'printer', name: 'Pengaturan Printer', icon: Printer, section: 'Operasional' },
    { id: 'upload', name: 'Pengaturan Upload', icon: Upload, section: 'Operasional' },
    { id: 'email', name: 'Pengaturan Email', icon: Mail, section: 'Integrasi' },
    { id: 'whatsapp', name: 'Pengaturan WhatsApp', icon: MessageSquare, section: 'Integrasi' },
    { id: 'backup', name: 'Pengaturan Backup', icon: RefreshCw, section: 'Integrasi' },
    { id: 'database', name: 'Pengaturan Database', icon: Database, section: 'Keamanan' },
    { id: 'security', name: 'Pengaturan Security', icon: ShieldCheck, section: 'Keamanan' },
    { id: 'role', name: 'Pengaturan Role', icon: Users, section: 'Keamanan' },
    { id: 'menu', name: 'Pengaturan Menu', icon: Sliders, section: 'Antarmuka' },
    { id: 'dashboard', name: 'Pengaturan Dashboard', icon: Layers, section: 'Antarmuka' },
    { id: 'ai', name: 'Pengaturan AI Copilot', icon: Sparkles, section: 'Integrasi' },
    { id: 'mobile', name: 'Pengaturan Mobile', icon: Smartphone, section: 'Antarmuka' },
    { id: 'integration-gateway', name: 'Integration & API Gateway', icon: Cpu, section: 'Integrasi' },
    { id: 'sistem', name: 'Pengaturan Sistem', icon: Settings, section: 'Sistem' },
    { id: 'monitoring', name: 'Monitoring & Health Engine', icon: Activity, section: 'Sistem' },
    { id: 'production-qa', name: 'Production Readiness (Gate 151)', icon: Award, section: 'Sistem' },
  ];

  // Filtering tabs matching search and section
  const filteredCategories = CATEGORIES.filter(cat => {
    const matchesSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          cat.section.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSection = selectedSection === 'Semua' || cat.section === selectedSection;
    return matchesSearch && matchesSection;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800" id="settings-control-center">
      
      {/* Upper Status / Header bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="h-6 w-6 text-emerald-600 animate-spin-slow" />
            Pusat Pengaturan Sistem ERP
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Kelola konfigurasi, yayasan, unit, keamanan, email, whatsapp, dan integrasi database secara real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={fetchSettings}
            className="px-3.5 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition duration-200 border border-slate-200 flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Segarkan
          </button>
          
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving || loading}
            className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 rounded-xl shadow-md hover:shadow-lg transition duration-200 flex items-center gap-2 cursor-pointer"
          >
            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Menyimpan...' : 'Simpan Semua'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
          <RefreshCw className="h-10 w-10 text-emerald-600 animate-spin" />
          <span className="text-sm font-semibold text-slate-500 font-mono">Menghubungkan ke MySQL database...</span>
        </div>
      ) : (
        <div className="max-w-[1600px] mx-auto px-4 py-6 flex flex-col gap-6">
          
          {/* TOP TAB NAVIGATION BAR */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col gap-4 pointer-events-auto relative z-20">
            
            {/* Filter Section Pills & Search Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              
              {/* Category Section Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                {['Semua', 'Profil', 'KBM', 'Operasional', 'Integrasi', 'Keamanan', 'Antarmuka', 'Sistem'].map(sec => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setSelectedSection(sec)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                      selectedSection === sec
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    {sec}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative w-full md:w-72 shrink-0">
                <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Cari menu pengaturan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                />
              </div>

            </div>

            {/* TAB BUTTONS AT THE TOP */}
            <div className="flex flex-wrap gap-2">
              {filteredCategories.map(cat => {
                const Icon = cat.icon;
                const isSelected = activeTab === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveTab(cat.id)}
                    className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      isSelected 
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100 ring-2 ring-emerald-500/20' 
                        : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                    <span>{cat.name}</span>
                  </button>
                );
              })}

              {filteredCategories.length === 0 && (
                <div className="py-2 px-2 text-xs text-slate-400 italic">
                  Tidak ada menu pengaturan yang cocok dengan filter.
                </div>
              )}
            </div>

          </div>

          {/* MAIN CONFIGURATION FORM VIEW */}
          <div className="w-full bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[75vh]">
            
            {/* Feedback alert banners */}
            {successMsg && (
              <div className="bg-emerald-50 border-b border-emerald-200 p-4 flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs font-bold text-emerald-800">{successMsg}</div>
              </div>
            )}

            {errorMsg && (
              <div className="bg-rose-50 border-b border-rose-200 p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs font-bold text-rose-800">{errorMsg}</div>
              </div>
            )}

            <form onSubmit={handleSave} className="p-6 md:p-8 flex-1 flex flex-col justify-between">
              
              <div className="space-y-8">
                
                {/* 1. PROFIL YAYASAN */}
                {activeTab === 'yayasan' && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h2 className="text-base font-extrabold text-slate-950">Profil Yayasan</h2>
                      <p className="text-xs text-slate-500">Konfigurasi data akta pendirian, nama yayasan, dan ketua penanggung jawab utama.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Nama Yayasan *</label>
                        <input type="text" name="yayasan_nama" value={settings.yayasan_nama} onChange={handleChange} required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Logo Yayasan (URL/Path) *</label>
                        <input type="text" name="yayasan_logo" value={settings.yayasan_logo} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Ketua Yayasan *</label>
                        <input type="text" name="yayasan_ketua" value={settings.yayasan_ketua} onChange={handleChange} required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Bendahara Yayasan *</label>
                        <input type="text" name="yayasan_bendahara" value={settings.yayasan_bendahara} onChange={handleChange} required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Alamat Lengkap Yayasan *</label>
                        <textarea name="yayasan_alamat" value={settings.yayasan_alamat} onChange={handleChange} rows={3} required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none resize-none" />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Nomor Telepon *</label>
                        <input type="text" name="yayasan_telepon" value={settings.yayasan_telepon} onChange={handleChange} required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Email Resmi Yayasan *</label>
                        <input type="email" name="yayasan_email" value={settings.yayasan_email} onChange={handleChange} required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">NPWP Yayasan *</label>
                        <input type="text" name="yayasan_npwp" value={settings.yayasan_npwp} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">NIB / Nomor Izin Berusaha</label>
                        <input type="text" name="yayasan_nib" value={settings.yayasan_nib} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Nomor Akta Notaris Yayasan</label>
                        <input type="text" name="yayasan_akta" value={settings.yayasan_akta} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Visi Yayasan</label>
                        <textarea name="yayasan_visi" value={settings.yayasan_visi} onChange={handleChange} rows={2} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none resize-none" />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Misi Yayasan</label>
                        <textarea name="yayasan_misi" value={settings.yayasan_misi} onChange={handleChange} rows={2} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none resize-none" />
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. PROFIL SEKOLAH */}
                {activeTab === 'sekolah' && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h2 className="text-base font-extrabold text-slate-950">Profil Sekolah</h2>
                      <p className="text-xs text-slate-500">Konfigurasi entitas satuan pendidikan sekolah formal (NPSN, status akreditasi, koordinat peta).</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Nama Sekolah *</label>
                        <input type="text" name="sekolah_nama" value={settings.sekolah_nama} onChange={handleChange} required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">NPSN (Nomor Pokok Sekolah Nasional) *</label>
                        <input type="text" name="sekolah_npsn" value={settings.sekolah_npsn} onChange={handleChange} required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">NSS (Nomor Statistik Sekolah)</label>
                        <input type="text" name="sekolah_nss" value={settings.sekolah_nss} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Jenjang Pendidikan *</label>
                        <select name="sekolah_jenjang" value={settings.sekolah_jenjang} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none">
                          <option value="SD / MI">SD / MI</option>
                          <option value="SMP / MTS">SMP / MTS</option>
                          <option value="SMA / MA">SMA / MA</option>
                          <option value="SMK">SMK</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Status Sekolah *</label>
                        <select name="sekolah_status" value={settings.sekolah_status} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none">
                          <option value="SWASTA">SWASTA</option>
                          <option value="NEGERI">NEGERI</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Akreditasi *</label>
                        <select name="sekolah_akreditasi" value={settings.sekolah_akreditasi} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none">
                          <option value="A">A (Sangat Baik)</option>
                          <option value="B">B (Baik)</option>
                          <option value="C">C (Cukup)</option>
                          <option value="Belum Terakreditasi">Belum Terakreditasi</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Kepala Sekolah *</label>
                        <input type="text" name="sekolah_kepsek" value={settings.sekolah_kepsek} onChange={handleChange} required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Wakil Kepala Sekolah</label>
                        <input type="text" name="sekolah_wakepsek" value={settings.sekolah_wakepsek} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Operator Sekolah *</label>
                        <input type="text" name="sekolah_operator" value={settings.sekolah_operator} onChange={handleChange} required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Kode Pos *</label>
                        <input type="text" name="sekolah_kodepos" value={settings.sekolah_kodepos} onChange={handleChange} required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Alamat Sekolah *</label>
                        <textarea name="sekolah_alamat" value={settings.sekolah_alamat} onChange={handleChange} rows={2} required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none resize-none" />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Kecamatan *</label>
                        <input type="text" name="sekolah_kecamatan" value={settings.sekolah_kecamatan} onChange={handleChange} required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Kabupaten / Kota *</label>
                        <input type="text" name="sekolah_kabupaten" value={settings.sekolah_kabupaten} onChange={handleChange} required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Provinsi *</label>
                        <input type="text" name="sekolah_provinsi" value={settings.sekolah_provinsi} onChange={handleChange} required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-extrabold text-slate-700 mb-1">Latitude</label>
                            <input type="number" step="any" name="sekolah_latitude" value={settings.sekolah_latitude} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                          </div>
                          <div>
                            <label className="block text-[11px] font-extrabold text-slate-700 mb-1">Longitude</label>
                            <input type="number" step="any" name="sekolah_longitude" value={settings.sekolah_longitude} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* LOGO UNIT MULTI-JENJANG SECTION */}
                    <div className="pt-6 border-t border-slate-200 space-y-4">
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-mono uppercase">Multi-Unit Branding</span>
                          Logo Unit Pendidikan Specific (TK, SD, SMP, SMA, PKBM)
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">Logo ini akan otomatis disesuaikan pada Kop Rapor & Kop Surat Resmi saat dicetak per unit.</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Logo TK */}
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-xs text-slate-800">Unit TK / PAUD</span>
                            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">TK</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <img src={settings.logo_tk || "/logo-tk.png"} alt="Logo TK" className="w-12 h-12 object-contain rounded-lg border bg-white p-1" onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&q=80&w=150'; }} />
                            <input type="text" name="logo_tk" value={settings.logo_tk || ''} onChange={handleChange} placeholder="URL Logo TK..." className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-mono bg-white outline-none" />
                          </div>
                        </div>

                        {/* Logo SD */}
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-xs text-slate-800">Unit SD / MI</span>
                            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold">SD</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <img src={settings.logo_sd || "/logo-sd.png"} alt="Logo SD" className="w-12 h-12 object-contain rounded-lg border bg-white p-1" onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=150'; }} />
                            <input type="text" name="logo_sd" value={settings.logo_sd || ''} onChange={handleChange} placeholder="URL Logo SD..." className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-mono bg-white outline-none" />
                          </div>
                        </div>

                        {/* Logo SMP */}
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-xs text-slate-800">Unit SMP / MTs</span>
                            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">SMP</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <img src={settings.logo_smp || "/logo-smp.png"} alt="Logo SMP" className="w-12 h-12 object-contain rounded-lg border bg-white p-1" onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=150'; }} />
                            <input type="text" name="logo_smp" value={settings.logo_smp || ''} onChange={handleChange} placeholder="URL Logo SMP..." className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-mono bg-white outline-none" />
                          </div>
                        </div>

                        {/* Logo SMA */}
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-xs text-slate-800">Unit SMA / MA</span>
                            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-bold">SMA</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <img src={settings.logo_sma || "/logo-sma.png"} alt="Logo SMA" className="w-12 h-12 object-contain rounded-lg border bg-white p-1" onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=150'; }} />
                            <input type="text" name="logo_sma" value={settings.logo_sma || ''} onChange={handleChange} placeholder="URL Logo SMA..." className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-mono bg-white outline-none" />
                          </div>
                        </div>

                        {/* Logo PKBM */}
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-xs text-slate-800">Unit PKBM Kesetaraan</span>
                            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">PKBM</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <img src={settings.logo_pkbm || "/logo-pkbm.png"} alt="Logo PKBM" className="w-12 h-12 object-contain rounded-lg border bg-white p-1" onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=150'; }} />
                            <input type="text" name="logo_pkbm" value={settings.logo_pkbm || ''} onChange={handleChange} placeholder="URL Logo PKBM..." className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-mono bg-white outline-none" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. PROFIL PONDOK */}
                {activeTab === 'pondok' && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h2 className="text-base font-extrabold text-slate-950">Profil Pondok Pesantren</h2>
                      <p className="text-xs text-slate-500">Konfigurasi detail identitas kepesantrenan (Motto, Visi, Misi, Kontak Pimpinan).</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Nama Pondok Pesantren *</label>
                        <input type="text" name="pondok_nama" value={settings.pondok_nama} onChange={handleChange} required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Pimpinan / Kyai Pondok *</label>
                        <input type="text" name="pondok_pimpinan" value={settings.pondok_pimpinan} onChange={handleChange} required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Motto / Semboyan Pondok</label>
                        <input type="text" name="pondok_motto" value={settings.pondok_motto} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Visi Pondok Pesantren</label>
                        <textarea name="pondok_visi" value={settings.pondok_visi} onChange={handleChange} rows={2} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none resize-none" />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Misi Pondok Pesantren</label>
                        <textarea name="pondok_misi" value={settings.pondok_misi} onChange={handleChange} rows={2} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none resize-none" />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Logo Khusus Pondok (Path)</label>
                        <input type="text" name="pondok_logo" value={settings.pondok_logo} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Kontak Utama Pondok *</label>
                        <input type="text" name="pondok_kontak" value={settings.pondok_kontak} onChange={handleChange} required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Alamat Cabang Pondok</label>
                        <textarea name="pondok_alamat" value={settings.pondok_alamat} onChange={handleChange} rows={2} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none resize-none" />
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. TAHUN AJARAN */}
                {activeTab === 'ta' && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h2 className="text-base font-extrabold text-slate-950">Tahun Ajaran Aktif</h2>
                      <p className="text-xs text-slate-500">Konfigurasi siklus kalender akademik yang berlaku sekarang di seluruh ERP.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Tahun Ajaran Aktif *</label>
                        <select name="ta_aktif" value={settings.ta_aktif} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none">
                          <option value="2024/2025">2024/2025</option>
                          <option value="2025/2026">2025/2026</option>
                          <option value="2026/2027">2026/2027</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Semester Berjalan *</label>
                        <select name="ta_semester" value={settings.ta_semester} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none">
                          <option value="GANJIL">GANJIL</option>
                          <option value="GENAP">GENAP</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Tanggal Mulai Semester *</label>
                        <input type="date" name="ta_mulai" value={settings.ta_mulai} onChange={handleChange} required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Tanggal Akhir Semester *</label>
                        <input type="date" name="ta_selesai" value={settings.ta_selesai} onChange={handleChange} required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">File Lampiran Kalender Akademik (PDF)</label>
                        <input type="text" name="ta_kalender" value={settings.ta_kalender} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. PENGATURAN KBM */}
                {activeTab === 'kbm' && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h2 className="text-base font-extrabold text-slate-950">Pengaturan KBM (Kegiatan Belajar Mengajar)</h2>
                      <p className="text-xs text-slate-500">Konfigurasi durasi jam pelajaran, hari belajar, dan KKM kelulusan mata pelajaran.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Jam Mulai KBM *</label>
                        <input type="time" name="kbm_jam_mulai" value={settings.kbm_jam_mulai} onChange={handleChange} required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Durasi 1 Jam Pelajaran (Menit) *</label>
                        <input type="number" name="kbm_durasi" value={settings.kbm_durasi} onChange={handleChange} required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Waktu Istirahat KBM *</label>
                        <input type="time" name="kbm_istirahat" value={settings.kbm_istirahat} onChange={handleChange} required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Waktu Selesai / Pulang *</label>
                        <input type="time" name="kbm_pulang" value={settings.kbm_pulang} onChange={handleChange} required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Standar KKM Akademik *</label>
                        <input type="number" name="kbm_kkm" value={settings.kbm_kkm} onChange={handleChange} required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">KKTP (Kriteria Ketercapaian Tujuan Pembelajaran)</label>
                        <input type="number" name="kbm_kktp" value={settings.kbm_kktp} onChange={handleChange} required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Kurikulum yang Digunakan *</label>
                        <select name="kbm_kurikulum" value={settings.kbm_kurikulum} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none">
                          <option value="KURIKULUM 2013">KURIKULUM 2013</option>
                          <option value="KURIKULUM MERDEKA">KURIKULUM MERDEKA</option>
                          <option value="KTSP 2006">KTSP 2006</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Hari Aktif Belajar</label>
                        <div className="grid grid-cols-3 gap-3">
                          {['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU', 'MINGGU'].map(day => {
                            const isChecked = settings.kbm_hari_aktif?.includes(day);
                            return (
                              <label key={day} className="flex items-center gap-2 border border-slate-200 rounded-xl p-3 cursor-pointer hover:bg-slate-50 transition text-xs font-semibold">
                                <input 
                                  type="checkbox" 
                                  checked={isChecked} 
                                  onChange={() => handleArrayToggle('kbm_hari_aktif', day)}
                                  className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                                />
                                {day}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. PENGATURAN RAPOR */}
                {activeTab === 'rapor' && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h2 className="text-base font-extrabold text-slate-950">Pengaturan Cetak Rapor</h2>
                      <p className="text-xs text-slate-500">Konfigurasi visual halaman rapor akhir siswa (kop, stempel, QR verification).</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Template Desain Rapor *</label>
                        <select name="rapor_template" value={settings.rapor_template} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none">
                          <option value="Modern Elegant MA">Modern Elegant MA</option>
                          <option value="Minimalis Kemenag">Minimalis Kemenag</option>
                          <option value="E-Rapor Resmi">E-Rapor Resmi</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Kop Surat Rapor *</label>
                        <input type="text" name="rapor_kop" value={settings.rapor_kop} onChange={handleChange} required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Format Kelulusan Nilai</label>
                        <input type="text" name="rapor_format_nilai" value={settings.rapor_format_nilai} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Predikat & Rentang Nilai</label>
                        <input type="text" name="rapor_predikat" value={settings.rapor_predikat} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Format Nomor Rapor</label>
                        <input type="text" name="rapor_penomoran" value={settings.rapor_penomoran} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div className="flex flex-col gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/50">
                        <label className="flex items-center gap-3 cursor-pointer text-xs font-bold text-slate-700">
                          <input 
                            type="checkbox" 
                            name="rapor_qr_verif" 
                            checked={settings.rapor_qr_verif} 
                            onChange={handleChange}
                            className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                          />
                          Aktifkan QR Code Verifikasi Absah
                        </label>
                        <p className="text-[10px] text-slate-400 font-medium">Jika aktif, setiap lembar rapor yang dicetak akan memiliki QR Code berisi link verifikasi keabsahan data di server.</p>
                      </div>

                      <div className="flex flex-col gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/50">
                        <label className="flex items-center gap-3 cursor-pointer text-xs font-bold text-slate-700">
                          <input 
                            type="checkbox" 
                            name="rapor_deskripsi_ai" 
                            checked={settings.rapor_deskripsi_ai} 
                            onChange={handleChange}
                            className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                          />
                          Gunakan AI Copilot untuk Deskripsi Nilai
                        </label>
                        <p className="text-[10px] text-slate-400 font-medium">Menggunakan AI Gemini untuk otomatis menyusun kalimat deskripsi capaian pembelajaran siswa secara naratif.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 7. PENGATURAN LEGER */}
                {activeTab === 'leger' && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h2 className="text-base font-extrabold text-slate-950">Pengaturan Leger Kelas</h2>
                      <p className="text-xs text-slate-500">Konfigurasi rekapitulasi leger nilai guru (jumlah kolom, ekspor berkas).</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Format Leger Nilai *</label>
                        <input type="text" name="leger_format" value={settings.leger_format} onChange={handleChange} required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Jumlah Kolom Nilai Maksimum</label>
                        <input type="number" name="leger_kolom" value={settings.leger_kolom} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 border border-slate-200 rounded-xl p-3 cursor-pointer hover:bg-slate-50">
                          <input type="checkbox" name="leger_freeze_header" checked={settings.leger_freeze_header} onChange={handleChange} className="h-4 w-4 text-emerald-600 rounded border-slate-300" />
                          Bekukan Baris Judul Kolom (Freeze Header)
                        </label>
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 border border-slate-200 rounded-xl p-3 cursor-pointer hover:bg-slate-50">
                          <input type="checkbox" name="leger_freeze_nama" checked={settings.leger_freeze_nama} onChange={handleChange} className="h-4 w-4 text-emerald-600 rounded border-slate-300" />
                          Bekukan Kolom Nama Siswa (Freeze Column)
                        </label>
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 border border-slate-200 rounded-xl p-3 cursor-pointer hover:bg-slate-50">
                          <input type="checkbox" name="leger_autosave" checked={settings.leger_autosave} onChange={handleChange} className="h-4 w-4 text-emerald-600 rounded border-slate-300" />
                          Simpan Otomatis Leger Saat Edit (Autosave)
                        </label>
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 border border-slate-200 rounded-xl p-3 cursor-pointer hover:bg-slate-50">
                          <input type="checkbox" name="leger_import_excel" checked={settings.leger_import_excel} onChange={handleChange} className="h-4 w-4 text-emerald-600 rounded border-slate-300" />
                          Izinkan Impor dari Microsoft Excel (.xlsx)
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* 8. PENGATURAN KEUANGAN */}
                {activeTab === 'keuangan' && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h2 className="text-base font-extrabold text-slate-950">Pengaturan Keuangan</h2>
                      <p className="text-xs text-slate-500">Konfigurasi mata uang, nominal SPP default, VA, dan kode format kwitansi.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Simbol Mata Uang *</label>
                        <input type="text" name="keu_mata_uang" value={settings.keu_mata_uang} onChange={handleChange} required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Nominal SPP Default Bulanan *</label>
                        <input type="number" name="keu_spp_default" value={settings.keu_spp_default} onChange={handleChange} required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Bank Syariah Mitra Pembayaran *</label>
                        <input type="text" name="keu_bank_nama" value={settings.keu_bank_nama} onChange={handleChange} required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Format Nomor Kwitansi Pembayaran</label>
                        <input type="text" name="keu_format_kwitansi" value={settings.keu_format_kwitansi} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Format Nomor Invoice Penagihan</label>
                        <input type="text" name="keu_format_invoice" value={settings.keu_format_invoice} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/50">
                        <label className="flex items-center gap-3 cursor-pointer text-xs font-bold text-slate-700">
                          <input type="checkbox" name="keu_va_active" checked={settings.keu_va_active} onChange={handleChange} className="h-4 w-4 rounded border-slate-300 text-emerald-600" />
                          Aktifkan Virtual Account Otomatis (BSI/Midtrans)
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* 9. PENGATURAN SURAT */}
                {activeTab === 'surat' && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h2 className="text-base font-extrabold text-slate-950">Pengaturan Surat & Dokumen</h2>
                      <p className="text-xs text-slate-500">Konfigurasi kop surat keluar, stempel digital, nomor urut seri otomatis.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Teks Judul Kop Surat Resmi *</label>
                        <input type="text" name="surat_kop" value={settings.surat_kop} onChange={handleChange} required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Teks Penutup / Footer Dokumen Resmi</label>
                        <input type="text" name="surat_footer" value={settings.surat_footer} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Format Kode Seri Surat Keluar *</label>
                        <input type="text" name="surat_nomor_format" value={settings.surat_nomor_format} onChange={handleChange} required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Path Gambar Tanda Tangan Digital</label>
                        <input type="text" name="surat_digital_signature" value={settings.surat_digital_signature} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700">
                          <input type="checkbox" name="surat_qr_active" checked={settings.surat_qr_active} onChange={handleChange} className="h-4 w-4 text-emerald-600 rounded border-slate-300" />
                          Gunakan QR Code Tanda Tangan Sah
                        </label>
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700">
                          <input type="checkbox" name="surat_barcode_active" checked={settings.surat_barcode_active} onChange={handleChange} className="h-4 w-4 text-emerald-600 rounded border-slate-300" />
                          Gunakan Barcode ID Dokumen
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* 10. PENGATURAN PRINTER */}
                {activeTab === 'printer' && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h2 className="text-base font-extrabold text-slate-950">Pengaturan Printer & Cetak</h2>
                      <p className="text-xs text-slate-500">Konfigurasi ukuran kertas, margin cetak dokumen PDF, orientasi layout.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Ukuran Kertas Default *</label>
                        <select name="print_kertas" value={settings.print_kertas} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none">
                          <option value="A4">A4 (Standard)</option>
                          <option value="F4">F4 / Folio (Indonesia)</option>
                          <option value="LETTER">LETTER</option>
                          <option value="THERMAL">Thermal Roll (58mm/80mm)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Font Dokumen Cetak</label>
                        <input type="text" name="print_font" value={settings.print_font} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Orientasi Kertas Cetak</label>
                        <select name="print_orientasi" value={settings.print_orientasi} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none">
                          <option value="PORTRAIT">PORTRAIT</option>
                          <option value="LANDSCAPE">LANDSCAPE</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Printer IP / Driver Terhubung</label>
                        <input type="text" name="print_printer_default" value={settings.print_printer_default} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Margin Batas Cetak (Milimeter)</label>
                        <div className="grid grid-cols-4 gap-3">
                          <div>
                            <label className="block text-[10px] text-slate-500 font-bold mb-1">Atas</label>
                            <input type="number" name="print_margin_atas" value={settings.print_margin_atas} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold" />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-500 font-bold mb-1">Bawah</label>
                            <input type="number" name="print_margin_bawah" value={settings.print_margin_bawah} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold" />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-500 font-bold mb-1">Kiri</label>
                            <input type="number" name="print_margin_kiri" value={settings.print_margin_kiri} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold" />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-500 font-bold mb-1">Kanan</label>
                            <input type="number" name="print_margin_kanan" value={settings.print_margin_kanan} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 11. PENGATURAN UPLOAD */}
                {activeTab === 'upload' && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h2 className="text-base font-extrabold text-slate-950">Pengaturan Upload File & Media</h2>
                      <p className="text-xs text-slate-500">Konfigurasi batas maksimum ukuran unggah, ekstensi terlarang, kompresi gambar.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Maksimum Ukuran File (Megabytes) *</label>
                        <input type="number" name="upload_max_size" value={settings.upload_max_size} onChange={handleChange} required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Folder Tujuan Penyimpanan (Server Path)</label>
                        <input type="text" name="upload_folder" value={settings.upload_folder} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div className="md:col-span-2 space-y-4">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 border border-slate-200 rounded-xl p-3 cursor-pointer hover:bg-slate-50">
                          <input type="checkbox" name="upload_compression" checked={settings.upload_compression} onChange={handleChange} className="h-4 w-4 text-emerald-600 rounded border-slate-300" />
                          Aktifkan Kompresi Otomatis File Gambar (Mengurangi konsumsi server storage)
                        </label>
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 border border-slate-200 rounded-xl p-3 cursor-pointer hover:bg-slate-50">
                          <input type="checkbox" name="upload_watermark" checked={settings.upload_watermark} onChange={handleChange} className="h-4 w-4 text-emerald-600 rounded border-slate-300" />
                          Tambahkan Watermark Yayasan Darul Hadits Secara Otomatis pada Gambar Terupload
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* 12. PENGATURAN EMAIL */}
                {activeTab === 'email' && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h2 className="text-base font-extrabold text-slate-950">Integrasi Server SMTP Email</h2>
                      <p className="text-xs text-slate-500">Konfigurasi kredensial SMTP untuk pengiriman tagihan SPP, rapot, pengumuman otomatis.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">SMTP Host *</label>
                        <input type="text" name="email_host" value={settings.email_host} onChange={handleChange} required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">SMTP Port *</label>
                        <input type="number" name="email_port" value={settings.email_port} onChange={handleChange} required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">SMTP Username / Akun *</label>
                        <input type="text" name="email_user" value={settings.email_user} onChange={handleChange} required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">SMTP Password *</label>
                        <input type="password" name="email_pass" value={settings.email_pass} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Nama Pengirim Email Default *</label>
                        <input type="text" name="email_sender" value={settings.email_sender} onChange={handleChange} required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/50">
                        <label className="flex items-center gap-3 cursor-pointer text-xs font-bold text-slate-700">
                          <input type="checkbox" name="email_ssl" checked={settings.email_ssl} onChange={handleChange} className="h-4 w-4 rounded border-slate-300 text-emerald-600" />
                          Gunakan SSL / TLS Pengamanan
                        </label>
                      </div>

                      <div className="md:col-span-2 pt-4 border-t border-slate-100 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={handleTestSmtp}
                          disabled={testingSmtp}
                          className="px-4 py-2 text-xs font-extrabold text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-xl transition cursor-pointer"
                        >
                          {testingSmtp ? 'Mengirim Percobaan...' : 'Kirim Email Percobaan'}
                        </button>

                        {testResult?.type === 'smtp' && (
                          <span className={`text-xs font-bold ${testResult.success ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {testResult.msg}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 13. PENGATURAN WHATSAPP */}
                {activeTab === 'whatsapp' && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h2 className="text-base font-extrabold text-slate-950">WhatsApp API Gateway Broadcast</h2>
                      <p className="text-xs text-slate-500">Konfigurasi token Fonnte / Wablas untuk pengumuman instan ke wali murid.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">WhatsApp Gateway Provider *</label>
                        <select name="wa_gateway" value={settings.wa_gateway} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none">
                          <option value="Fonnte API Gateway">Fonnte API Gateway</option>
                          <option value="Wablas Official">Wablas Official</option>
                          <option value="Twilio WhatsApp API">Twilio WhatsApp API</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">WhatsApp Device Name / ID</label>
                        <input type="text" name="wa_device" value={settings.wa_device} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">API Token Kredensial *</label>
                        <input type="password" name="wa_token" value={settings.wa_token} onChange={handleChange} required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none font-mono" />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Nomor WhatsApp Tester (Uji Coba)</label>
                        <input type="text" name="wa_default_number" value={settings.wa_default_number} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div className="md:col-span-2 pt-4 border-t border-slate-100 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={handleTestWa}
                          disabled={testingWa}
                          className="px-4 py-2 text-xs font-extrabold text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-xl transition cursor-pointer"
                        >
                          {testingWa ? 'Menghubungkan...' : 'Koneksikan & Kirim Pesan Uji'}
                        </button>

                        {testResult?.type === 'wa' && (
                          <span className={`text-xs font-bold ${testResult.success ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {testResult.msg}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 14. PENGATURAN BACKUP */}
                {activeTab === 'backup' && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h2 className="text-base font-extrabold text-slate-950">Pencadangan Data Otomatis</h2>
                      <p className="text-xs text-slate-500">Atur penjadwalan backup database, sinkronisasi cadangan ke awan (Google Drive).</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Jadwal Backup Otomatis *</label>
                        <select name="backup_schedule" value={settings.backup_schedule} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none">
                          <option value="hourly">Setiap Jam</option>
                          <option value="daily">Setiap Malam (02:00 WIB)</option>
                          <option value="weekly">Setiap Hari Minggu</option>
                          <option value="monthly">Setiap Bulan</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Lokasi Penyimpanan Cadangan *</label>
                        <select name="backup_location" value={settings.backup_location} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none">
                          <option value="LOCAL">Local Server Disk</option>
                          <option value="CLOUD">Cloud Object Storage (MinIO S3)</option>
                        </select>
                      </div>

                      <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 border border-slate-200 rounded-xl p-3 cursor-pointer hover:bg-slate-50">
                          <input type="checkbox" name="backup_auto" checked={settings.backup_auto} onChange={handleChange} className="h-4 w-4 text-emerald-600 rounded border-slate-300" />
                          Aktifkan Sistem Auto-Backup Latar Belakang
                        </label>
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 border border-slate-200 rounded-xl p-3 cursor-pointer hover:bg-slate-50">
                          <input type="checkbox" name="backup_gdrive_active" checked={settings.backup_gdrive_active} onChange={handleChange} className="h-4 w-4 text-emerald-600 rounded border-slate-300" />
                          Sinkronisasikan Cadangan ke Google Drive Yayasan
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* 15. PENGATURAN DATABASE */}
                {activeTab === 'database' && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h2 className="text-base font-extrabold text-slate-950">Pengaturan & Pemeliharaan Database</h2>
                      <p className="text-xs text-slate-500">Melihat koneksi database MySQL aktif, mengoptimalkan indeks tabel, perbaikan integritas.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Database Host</label>
                        <input type="text" name="db_host" value={settings.db_host} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 outline-none bg-white" />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Database Port</label>
                        <input type="number" name="db_port" value={settings.db_port} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 outline-none bg-white" />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Nama Database MySQL</label>
                        <input type="text" name="db_name" value={settings.db_name} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 outline-none bg-white" />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Koneksi Database Driver</label>
                        <div className="w-full border border-emerald-200 bg-emerald-50 text-emerald-700 rounded-xl px-4 py-2.5 text-xs font-bold flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" /> Connected securely via Prisma
                        </div>
                      </div>

                      <div className="md:col-span-2 pt-6 border-t border-slate-100 flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => handleDbRepair('optimize')}
                            disabled={optimizingDb}
                            className="px-4 py-2.5 text-xs font-extrabold text-emerald-800 bg-emerald-100 hover:bg-emerald-200/80 rounded-xl transition flex items-center gap-2 cursor-pointer"
                          >
                            <Terminal className="h-4 w-4" />
                            Optimasi Indeks Tabel
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDbRepair('repair')}
                            disabled={optimizingDb}
                            className="px-4 py-2.5 text-xs font-extrabold text-rose-800 bg-rose-100 hover:bg-rose-200/80 rounded-xl transition flex items-center gap-2 cursor-pointer"
                          >
                            <AlertCircle className="h-4 w-4" />
                            Perbaiki Hubungan Relasi
                          </button>
                        </div>

                        {testResult?.type === 'db' && (
                          <div className={`text-xs font-bold font-mono p-3 rounded-xl border ${testResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                            {testResult.msg}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 16. PENGATURAN SECURITY */}
                {activeTab === 'security' && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h2 className="text-base font-extrabold text-slate-950">Kebijakan Keamanan (Security Policy)</h2>
                      <p className="text-xs text-slate-500">Konfigurasi masa kadaluarsa JWT, deteksi login gagal, mfa, kebijakan password.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Kadaluarsa Token Sesi (JWT Expiry) *</label>
                        <select name="sec_jwt_expiry" value={settings.sec_jwt_expiry} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none">
                          <option value="2h">2 Jam</option>
                          <option value="8h">8 Jam</option>
                          <option value="24h">24 Jam (Rekomendasi)</option>
                          <option value="7d">7 Hari</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Auto-Logout Setelah Tidak Aktif (Menit)</label>
                        <input type="number" name="sec_session_timeout" value={settings.sec_session_timeout} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Batas Gagal Login Sebelum Blokir *</label>
                        <input type="number" name="sec_login_attempts" value={settings.sec_login_attempts} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Kebijakan Kompleksitas Password *</label>
                        <select name="sec_password_policy" value={settings.sec_password_policy} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none">
                          <option value="STRONG">Kuat (Huruf Besar, Kecil, Angka, Karakter Khusus)</option>
                          <option value="MEDIUM">Sedang (Huruf & Angka minimal 8 karakter)</option>
                          <option value="WEAK">Lemah (Bebas)</option>
                        </select>
                      </div>

                      <div className="md:col-span-2 space-y-3">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700">
                          <input type="checkbox" name="sec_mfa_active" checked={settings.sec_mfa_active} onChange={handleChange} className="h-4 w-4 text-emerald-600 rounded border-slate-300" />
                          Wajibkan Multi-Factor Authentication (MFA/OTP) untuk Super Admin
                        </label>
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700">
                          <input type="checkbox" name="sec_audit_active" checked={settings.sec_audit_active} onChange={handleChange} className="h-4 w-4 text-emerald-600 rounded border-slate-300" />
                          Catat Log Audit untuk Setiap Perubahan Data (Audit Compliance)
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* 17. PENGATURAN ROLE (ENTERPRISE RBAC ENGINE) */}
                {activeTab === 'role' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900 text-white p-5 rounded-2xl">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Shield className="h-5 w-5 text-emerald-400" />
                          <h2 className="text-base font-extrabold text-white">Enterprise Role & Permission Engine (RBAC 2.0)</h2>
                        </div>
                        <p className="text-xs text-slate-300">
                          Pengelolaan peran & hak akses terpusat. Zero hardcoded permissions — seluruh izin modul, aksi CRUD, menu navigasi, dan scope data dikelola secara dinamis.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const standardRolePresets = [
                              { id: 'role-superadmin', name: 'Super Admin Yayasan', code: 'SUPER_ADMIN', scope: 'ALL_UNIT', description: 'Akses tanpa batas ke seluruh modul, audit compliance, database, dan sistem.', permissions: ['*'] },
                              { id: 'role-kepala-sekolah', name: 'Kepala Sekolah / Mudir', code: 'HEADMASTER', scope: 'SCHOOL_ONLY', description: 'Supervisi KBM, persetujuan rapor, dan kepegawaian unit sekolah.', permissions: ['VIEW', 'CREATE', 'UPDATE', 'APPROVE', 'REJECT', 'VERIFY', 'PRINT', 'EXPORT', 'akademik.view', 'akademik.approve_nilai', 'employee.view', 'finance.view'] },
                              { id: 'role-bendahara', name: 'Bendahara & Admin Keuangan', code: 'BENDAHARA', scope: 'ALL_UNIT', description: 'Akses penuh billing SPP, pembayaran, kas yayasan, dan laporan keuangan.', permissions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'PRINT', 'EXPORT', 'finance.view', 'finance.billing', 'finance.transaction', 'finance.report_export'] },
                              { id: 'role-guru-pengajar', name: 'Guru Pengajar / Ustadz', code: 'GURU', scope: 'CLASS_ONLY', description: 'Jurnal KBM, presensi kelas, input nilai, dan tugas pembelajaran.', permissions: ['VIEW', 'CREATE', 'UPDATE', 'PRINT', 'akademik.view', 'akademik.input_nilai', 'attendance.view', 'attendance.manual_input'] },
                              { id: 'role-wali-kelas', name: 'Wali Kelas / Homeroom', code: 'WALI_KELAS', scope: 'CLASS_ONLY', description: 'Input catatan sikap, bimbingan, persetujuan izin, dan cetak rapor kelas.', permissions: ['VIEW', 'CREATE', 'UPDATE', 'APPROVE', 'PRINT', 'EXPORT', 'akademik.view', 'akademik.input_nilai', 'akademik.rapor_print', 'attendance.approval'] },
                              { id: 'role-musyrif', name: 'Musyrif / Pengasuh Asrama', code: 'MUSYRIF', scope: 'DORM_ONLY', description: 'Absensi shalat, perizinan keluar-masuk santri, dan laporan asrama.', permissions: ['VIEW', 'CREATE', 'UPDATE', 'APPROVE', 'REJECT', 'PRINT', 'dorm.view', 'dorm.perizinan_approve', 'attendance.view'] },
                              { id: 'role-guru-tahfizh', name: 'Guru Tahfizh Al-Qur\'an', code: 'GURU_TAHFIZH', scope: 'CLASS_ONLY', description: 'Setoran ziyadah, muraqabah, evaluasi tajwid, dan sertifikat hafalan.', permissions: ['VIEW', 'CREATE', 'UPDATE', 'PRINT', 'tahfizh.view', 'tahfizh.record', 'tahfizh.sertifikat'] },
                              { id: 'role-staf-tu', name: 'Staf Administrasi TU', code: 'STAF_TU', scope: 'SCHOOL_ONLY', description: 'Arsip surat, studio dokumen, inventaris, dan pendaftaran siswa baru.', permissions: ['VIEW', 'CREATE', 'UPDATE', 'PRINT', 'DOWNLOAD', 'UPLOAD', 'document.view', 'document.print', 'sivitas.view', 'sivitas.register'] },
                              { id: 'role-operator-dapodik', name: 'Operator Dapodik', code: 'OPERATOR_DAPODIK', scope: 'SCHOOL_ONLY', description: 'Sinkronisasi data Dapodik, NIK/NISN, data pendidik & kependidikan.', permissions: ['VIEW', 'CREATE', 'UPDATE', 'IMPORT', 'EXPORT', 'SYNC', 'sivitas.view', 'employee.view'] },
                              { id: 'role-santri', name: 'Siswa / Santri Mandiri', code: 'SANTRI', scope: 'SELF_ONLY', description: 'Akses mandiri jadwal KBM, nilai, histori hafalan, dan tagihan SPP.', permissions: ['VIEW', 'PRINT', 'DOWNLOAD'] },
                              { id: 'role-orang-tua', name: 'Wali Santri / Orang Tua', code: 'WALI_SANTRI', scope: 'SELF_ONLY', description: 'Portal monitoring perkembangan santri, absensi, dan bukti bayar SPP.', permissions: ['VIEW', 'PRINT', 'DOWNLOAD', 'UPLOAD'] }
                            ];
                            setSettings((prev: any) => ({ ...prev, roles_list: standardRolePresets }));
                            setSuccessMsg('Preset 11 Peran Standar Sekolah & Pesantren berhasil dimuat ke dalam memori konfigurasi!');
                          }}
                          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm border border-indigo-500"
                        >
                          <RefreshCw className="h-4 w-4" />
                          <span>Muat Preset Role Standar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingRole({ id: `role-${Date.now().toString().slice(-4)}`, name: '', code: 'CUSTOM_ROLE', scope: 'SCHOOL_ONLY', permissions: ['VIEW'] });
                            setRoleModalOpen(true);
                          }}
                          className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Tambah Role Baru</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const blob = new Blob([JSON.stringify(settings.roles_list || [], null, 2)], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `rbac-roles-config-${Date.now()}.json`;
                            a.click();
                          }}
                          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer border border-slate-700"
                        >
                          <Download className="h-4 w-4" />
                          <span>Export JSON</span>
                        </button>
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-emerald-600" />
                          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Daftar Peran Terdaftar ({settings.roles_list?.length || 0} Role Engine)
                          </span>
                        </div>
                        <span className="text-[11px] font-mono font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                          Scope Hierarki: ALL_UNIT • SCHOOL_ONLY • CLASS_ONLY • DORM_ONLY • SELF_ONLY
                        </span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-semibold text-slate-700">
                          <thead className="bg-slate-100/70 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
                            <tr>
                              <th className="p-3.5">ID Peran</th>
                              <th className="p-3.5">Nama Tampilan Role</th>
                              <th className="p-3.5">Kode Role</th>
                              <th className="p-3.5">Data Scope</th>
                              <th className="p-3.5">Cakupan Matriks Hak Akses</th>
                              <th className="p-3.5 text-center">Aksi RBAC</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {(settings.roles_list || []).map((role: any) => (
                              <tr key={role.id} className="hover:bg-slate-50/80 transition">
                                <td className="p-3.5 font-mono text-[11px] text-slate-400">{role.id}</td>
                                <td className="p-3.5">
                                  <div className="font-extrabold text-slate-900">{role.name}</div>
                                  {role.description && (
                                    <div className="text-[10px] text-slate-500 font-normal line-clamp-1">{role.description}</div>
                                  )}
                                </td>
                                <td className="p-3.5">
                                  <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md font-mono text-[11px] font-extrabold border border-emerald-200">
                                    {role.code}
                                  </span>
                                </td>
                                <td className="p-3.5">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                                    role.scope === 'ALL_UNIT' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                    role.scope === 'SCHOOL_ONLY' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                    role.scope === 'CLASS_ONLY' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                    role.scope === 'DORM_ONLY' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                    'bg-slate-100 text-slate-700 border-slate-200'
                                  }`}>
                                    {role.scope || 'ALL_UNIT'}
                                  </span>
                                </td>
                                <td className="p-3.5 max-w-xs">
                                  <div className="flex flex-wrap gap-1">
                                    {(role.permissions || []).includes('*') ? (
                                      <span className="bg-rose-100 text-rose-800 text-[9px] font-mono font-extrabold px-2 py-0.5 rounded-md border border-rose-200">
                                        WILDCARD (FULL ACCESS)
                                      </span>
                                    ) : (
                                      <>
                                        {(role.permissions || []).slice(0, 5).map((p: string, i: number) => (
                                          <span key={i} className="bg-indigo-50 text-indigo-700 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border border-indigo-100">
                                            {p}
                                          </span>
                                        ))}
                                        {(role.permissions || []).length > 5 && (
                                          <span className="text-[10px] font-bold text-slate-400 self-center">
                                            +{(role.permissions || []).length - 5} izin
                                          </span>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </td>
                                <td className="p-3.5 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveRoleForPerms(role);
                                        setPermMatrixModalOpen(true);
                                      }}
                                      title="Kelola Matriks Izin Akses"
                                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-[11px] flex items-center gap-1 border border-indigo-200 transition cursor-pointer"
                                    >
                                      <ShieldCheck className="h-3.5 w-3.5" />
                                      <span>Matriks Izin</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingRole(role);
                                        setRoleModalOpen(true);
                                      }}
                                      title="Edit Info Role"
                                      className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition cursor-pointer"
                                    >
                                      <Edit3 className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const cloned = { ...role, id: `role-${Date.now().toString().slice(-4)}`, name: `${role.name} (Salinan)` };
                                        setSettings((prev: any) => ({ ...prev, roles_list: [...prev.roles_list, cloned] }));
                                        setSuccessMsg(`Berhasil menduplikasi peran ${role.name}`);
                                      }}
                                      title="Duplikasi Role"
                                      className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition cursor-pointer"
                                    >
                                      <Copy className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* RBAC Privilege & Access Simulator Box */}
                    <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-4">
                      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                        <Key className="h-5 w-5 text-amber-400" />
                        <div>
                          <h3 className="text-sm font-extrabold text-white">Simulator Tester Hak Akses & Scope Peran (RBAC Live Evaluator)</h3>
                          <p className="text-xs text-slate-400">Simulasikan dan uji izin akses menu atau fungsi aksi untuk memastikan kebijakan keamanan role tepat.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div>
                          <label className="block text-slate-300 font-bold mb-1">Pilih Role untuk Diuji:</label>
                          <select
                            onChange={(e) => {
                              const selCode = e.target.value;
                              const foundRole = settings.roles_list?.find((r: any) => r.code === selCode);
                              if (foundRole) setActiveRoleForPerms(foundRole);
                            }}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold outline-none focus:ring-2 focus:ring-amber-500"
                          >
                            {(settings.roles_list || []).map((r: any) => (
                              <option key={r.id} value={r.code}>{r.name} ({r.code})</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-300 font-bold mb-1">Modul / Tindakan Uji:</label>
                          <select
                            id="rbac-test-perm"
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold outline-none focus:ring-2 focus:ring-amber-500"
                          >
                            <option value="VIEW">VIEW (Akses Lihat Dasar)</option>
                            <option value="CREATE">CREATE (Tambah Data)</option>
                            <option value="UPDATE">UPDATE (Edit Data)</option>
                            <option value="DELETE">DELETE (Hapus Data)</option>
                            <option value="APPROVE">APPROVE (Persetujuan Rapor/Surat)</option>
                            <option value="akademik.input_nilai">akademik.input_nilai (Input Nilai KBM)</option>
                            <option value="finance.billing">finance.billing (Kelola Tagihan SPP)</option>
                            <option value="dorm.perizinan_approve">dorm.perizinan_approve (Izin Santri)</option>
                            <option value="system.rbac_edit">system.rbac_edit (Edit Hak Akses RBAC)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-300 font-bold mb-1 font-mono">Hasil Evaluasi Security:</label>
                          <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between">
                            <span className="font-mono text-[11px] text-slate-300">Status Akses:</span>
                            {activeRoleForPerms ? (
                              (activeRoleForPerms.permissions || []).includes('*') || (activeRoleForPerms.permissions || []).includes('VIEW') ? (
                                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-lg font-bold font-mono text-[11px] flex items-center gap-1">
                                  <CheckCircle2 className="h-3.5 w-3.5" /> DILEWATI / ALLOWED
                                </span>
                              ) : (
                                <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2.5 py-1 rounded-lg font-bold font-mono text-[11px] flex items-center gap-1">
                                  <X className="h-3.5 w-3.5" /> DIBLOKIR / DENIED
                                </span>
                              )
                            ) : (
                              <span className="text-slate-500 font-mono text-[11px]">Pilih role...</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 18. PENGATURAN MENU */}
                {activeTab === 'menu' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900 text-white p-5 rounded-2xl">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Sliders className="h-5 w-5 text-indigo-400" />
                          <h2 className="text-base font-extrabold text-white">Dynamic Navigation Menu Engine</h2>
                        </div>
                        <p className="text-xs text-slate-300">
                          Konfigurasi menu sidebar dan submenu secara terpusat berdasarkan role permission dari database.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingMenu({ id: `menu-${Date.now().toString().slice(-4)}`, name: '', path: '/new-page', order: (settings.menus_list?.length || 0) + 1, role_codes: ['SUPER_ADMIN', 'ADMINISTRATOR'], status: true });
                          setMenuModalOpen(true);
                        }}
                        className="px-3.5 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Tambah Menu Navigasi</span>
                      </button>
                    </div>

                    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                      <table className="w-full text-left text-xs font-semibold text-slate-700">
                        <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
                          <tr>
                            <th className="p-4">Nama Menu</th>
                            <th className="p-4">Path Rute</th>
                            <th className="p-4">Urutan</th>
                            <th className="p-4">Hak Akses Role</th>
                            <th className="p-4 text-center">Status</th>
                            <th className="p-4 text-center">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {settings.menus_list?.map((menu: any) => (
                            <tr key={menu.id} className="hover:bg-slate-50/80 transition">
                              <td className="p-4 font-bold text-slate-900">{menu.name}</td>
                              <td className="p-4 font-mono text-slate-500 text-[11px]">{menu.path}</td>
                              <td className="p-4 font-mono font-bold text-indigo-600">{menu.order}</td>
                              <td className="p-4 max-w-xs">
                                <div className="flex flex-wrap gap-1">
                                  {(menu.role_codes || []).map((rc: string, i: number) => (
                                    <span key={i} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-mono border border-slate-200">
                                      {rc}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="p-4 text-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = settings.menus_list.map((m: any) => m.id === menu.id ? { ...m, status: !m.status } : m);
                                    setSettings((prev: any) => ({ ...prev, menus_list: updated }));
                                  }}
                                  className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full cursor-pointer transition ${menu.status ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-400'}`}
                                >
                                  {menu.status ? 'AKTIF' : 'NON-AKTIF'}
                                </button>
                              </td>
                              <td className="p-4 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingMenu(menu);
                                      setMenuModalOpen(true);
                                    }}
                                    className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition cursor-pointer"
                                  >
                                    <Edit3 className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const filtered = settings.menus_list.filter((m: any) => m.id !== menu.id);
                                      setSettings((prev: any) => ({ ...prev, menus_list: filtered }));
                                    }}
                                    className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition cursor-pointer"
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
                )}

                {/* 19. PENGATURAN DASHBOARD */}
                {activeTab === 'dashboard' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900 text-white p-5 rounded-2xl">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Layers className="h-5 w-5 text-amber-400" />
                          <h2 className="text-base font-extrabold text-white">Dynamic Dashboard Widget Engine</h2>
                        </div>
                        <p className="text-xs text-slate-300">
                          Konfigurasi susunan widget statistik per peran pengguna (Super Admin, Kepala Sekolah, Bendahara, Guru, Wali Santri).
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingWidget({ id: `w-${Date.now().toString().slice(-4)}`, role: 'SUPER_ADMIN', widget_id: 'stat_overview', order: (settings.dashboard_widgets?.length || 0) + 1, is_active: true });
                          setWidgetModalOpen(true);
                        }}
                        className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Tambah Widget</span>
                      </button>
                    </div>

                    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                      <table className="w-full text-left text-xs font-semibold text-slate-700">
                        <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
                          <tr>
                            <th className="p-4">Peran Target</th>
                            <th className="p-4">Widget ID / Name</th>
                            <th className="p-4">Urutan Muat</th>
                            <th className="p-4 text-center">Status Aktif</th>
                            <th className="p-4 text-center">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {settings.dashboard_widgets?.map((w: any, idx: number) => (
                            <tr key={idx} className="hover:bg-slate-50/80 transition">
                              <td className="p-4 font-bold text-slate-900">{w.role}</td>
                              <td className="p-4 font-mono text-[11px] text-slate-600">{w.widget_id}</td>
                              <td className="p-4 font-mono font-bold text-amber-600">{w.order}</td>
                              <td className="p-4 text-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = settings.dashboard_widgets.map((item: any, i: number) => i === idx ? { ...item, is_active: !item.is_active } : item);
                                    setSettings((prev: any) => ({ ...prev, dashboard_widgets: updated }));
                                  }}
                                  className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full cursor-pointer transition ${w.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-400'}`}
                                >
                                  {w.is_active ? 'AKTIF' : 'NON-AKTIF'}
                                </button>
                              </td>
                              <td className="p-4 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingWidget(w);
                                      setWidgetModalOpen(true);
                                    }}
                                    className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition cursor-pointer"
                                  >
                                    <Edit3 className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const filtered = settings.dashboard_widgets.filter((_: any, i: number) => i !== idx);
                                      setSettings((prev: any) => ({ ...prev, dashboard_widgets: filtered }));
                                    }}
                                    className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition cursor-pointer"
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
                )}

                {/* 20. PENGATURAN AI */}
                {activeTab === 'ai' && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h2 className="text-base font-extrabold text-slate-950">Pengaturan AI Copilot & Asisten</h2>
                      <p className="text-xs text-slate-500">Atur kunci API Google Gemini, instruksi sistem prompt, limit token hasil analisis.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Gemini API Key *</label>
                        <input type="password" name="ai_api_key" value={settings.ai_api_key} onChange={handleChange} required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Sistem Prompt Utama AI *</label>
                        <textarea name="ai_prompt" value={settings.ai_prompt} onChange={handleChange} rows={3} required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none resize-none" />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Template Output Jawaban Resmi</label>
                        <input type="text" name="ai_template" value={settings.ai_template} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Model Generatif Utama *</label>
                        <select name="ai_model" value={settings.ai_model} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none">
                          <option value="gemini-2.5-flash">gemini-2.5-flash (Direkomendasikan)</option>
                          <option value="gemini-2.5-pro">gemini-2.5-pro (Kualitas Maksimal)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Temperature (Kreativitas) *</label>
                        <input type="number" step="0.1" min="0" max="1" name="ai_temperature" value={settings.ai_temperature} onChange={handleChange} required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>
                    </div>
                  </div>
                )}

                {/* 21. PENGATURAN MOBILE */}
                {activeTab === 'mobile' && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h2 className="text-base font-extrabold text-slate-950">Pengaturan Aplikasi Mobile Android/iOS</h2>
                      <p className="text-xs text-slate-500">Konfigurasi tema warna splash screen aplikasi mobile santri dan wali murid.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Splash Screen Image Path</label>
                        <input type="text" name="mobile_splash" value={settings.mobile_splash} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold" />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Icon Aplikasi (URL/Path)</label>
                        <input type="text" name="mobile_icon" value={settings.mobile_icon} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold" />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Primary Color Hex *</label>
                        <input type="text" name="mobile_primary_color" value={settings.mobile_primary_color} onChange={handleChange} required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Secondary Color Hex *</label>
                        <input type="text" name="mobile_secondary_color" value={settings.mobile_secondary_color} onChange={handleChange} required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>

                      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/50">
                        <label className="flex items-center gap-3 cursor-pointer text-xs font-bold text-slate-700">
                          <input type="checkbox" name="mobile_notification" checked={settings.mobile_notification} onChange={handleChange} className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300" />
                          Aktifkan Push Notification Mobile
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* 22. PENGATURAN SISTEM */}
                {activeTab === 'sistem' && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h2 className="text-base font-extrabold text-slate-950">Konfigurasi Pengaturan Sistem Utama</h2>
                      <p className="text-xs text-slate-500">Konfigurasi global timezone, bahasa, mode pemeliharaan, auto-penomoran seri.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Zona Waktu (Timezone) *</label>
                        <select name="sys_timezone" value={settings.sys_timezone} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none">
                          <option value="Asia/Jakarta">WIB - Asia/Jakarta (GMT+7)</option>
                          <option value="Asia/Makassar">WITA - Asia/Makassar (GMT+8)</option>
                          <option value="Asia/Jayapura">WIT - Asia/Jayapura (GMT+9)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Bahasa Sistem Default *</label>
                        <select name="sys_language" value={settings.sys_language} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none">
                          <option value="id">Bahasa Indonesia (Utama)</option>
                          <option value="en">English</option>
                          <option value="ar">Arab / العربية</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Format Tanggal Tampilan *</label>
                        <select name="sys_date_format" value={settings.sys_date_format} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none">
                          <option value="DD/MM/YYYY">DD/MM/YYYY (Hari/Bulan/Tahun)</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD (Standar Internasional)</option>
                          <option value="DD MMMM YYYY">DD MMMM YYYY (Indonesia Panjang)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-2">Format Tampilan Jam *</label>
                        <select name="sys_time_format" value={settings.sys_time_format} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none">
                          <option value="24h">24 Jam (Standard)</option>
                          <option value="12h">12 Jam (AM / PM)</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                          <input type="checkbox" name="sys_auto_number" checked={settings.sys_auto_number} onChange={handleChange} className="h-4 w-4 text-emerald-600 rounded border-slate-300" />
                          Gunakan Penomoran Otomatis Seri
                        </label>
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                          <input type="checkbox" name="sys_cache_active" checked={settings.sys_cache_active} onChange={handleChange} className="h-4 w-4 text-emerald-600 rounded border-slate-300" />
                          Aktifkan Cache Server Otomatis
                        </label>
                      </div>

                      <div className="flex flex-col gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl">
                        <label className="flex items-center gap-2 text-xs font-bold text-rose-800 cursor-pointer">
                          <input type="checkbox" name="sys_maintenance_mode" checked={settings.sys_maintenance_mode} onChange={handleChange} className="h-4 w-4 text-rose-600 rounded border-slate-300" />
                          Aktifkan Mode Pemeliharaan (Maintenance Mode)
                        </label>
                        <p className="text-[10px] text-rose-600/70 font-medium">Jika aktif, seluruh pengguna selain peran Super Admin tidak dapat mengakses menu ERP.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 23. MONITORING & HEALTH ENGINE (Blueprint 149) */}
                {activeTab === 'monitoring' && (
                  <EnterpriseMonitoringObservabilityEngine />
                )}

                {/* 24. ENTERPRISE INTEGRATION & API GATEWAY ENGINE (Blueprint 150) */}
                {activeTab === 'integration-gateway' && (
                  <EnterpriseIntegrationApiGatewayEngine />
                )}

                {/* 25. ENTERPRISE PRODUCTION READINESS & FINAL QA GATE (Blueprint 151) */}
                {activeTab === 'production-qa' && (
                  <EnterpriseProductionReadinessEngine />
                )}

              </div>

              {!['monitoring', 'integration-gateway', 'production-qa'].includes(activeTab) && (
                <div className="mt-12 pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 rounded-xl shadow-md hover:shadow-lg transition duration-200 flex items-center gap-2 cursor-pointer"
                  >
                    {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              )}

            </form>
          </div>

        </div>
      )}

      {/* MODAL 1: EDIT / TAMBAH ROLE BARU */}
      {roleModalOpen && editingRole && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-600" />
                <h3 className="text-sm font-extrabold text-slate-900">Form Management Role (RBAC)</h3>
              </div>
              <button
                type="button"
                onClick={() => setRoleModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 mb-1 font-bold">Nama Tampilan Role *</label>
                <input
                  type="text"
                  value={editingRole.name}
                  onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                  placeholder="Contoh: Guru Pengampu Hifdz"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Kode Unique Role *</label>
                <input
                  type="text"
                  value={editingRole.code}
                  onChange={(e) => setEditingRole({ ...editingRole, code: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
                  placeholder="GURU_HIFDZ"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono uppercase focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Cakupan Scope Data *</label>
                <select
                  value={editingRole.scope || 'ALL_UNIT'}
                  onChange={(e) => setEditingRole({ ...editingRole, scope: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="ALL_UNIT">ALL_UNIT (Seluruh Lintas Unit/Sekolah)</option>
                  <option value="SCHOOL_ONLY">SCHOOL_ONLY (Khusus Unit Sekolah Ybs)</option>
                  <option value="CLASS_ONLY">CLASS_ONLY (Khusus Rombel/Kelas Binaan)</option>
                  <option value="DORM_ONLY">DORM_ONLY (Khusus Kamar/Asrama Binaan)</option>
                  <option value="LIBRARY_ONLY">LIBRARY_ONLY (Khusus Area Perpustakaan)</option>
                  <option value="SELF_ONLY">SELF_ONLY (Khusus Data Pribadi Siswa/Santri)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRoleModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const exists = settings.roles_list?.some((r: any) => r.id === editingRole.id);
                  let updatedList = [];
                  if (exists) {
                    updatedList = settings.roles_list.map((r: any) => r.id === editingRole.id ? editingRole : r);
                  } else {
                    updatedList = [...(settings.roles_list || []), editingRole];
                  }
                  setSettings((prev: any) => ({ ...prev, roles_list: updatedList }));
                  setRoleModalOpen(false);
                  setSuccessMsg(`Peran ${editingRole.name} berhasil diperbarui di memori lokal state.`);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-sm"
              >
                Simpan Peran
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: MATRIKS PERMISSION MATRIX */}
      {permMatrixModalOpen && activeRoleForPerms && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-5 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-indigo-600" />
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Matriks Permission Access — Role: <span className="text-indigo-600">{activeRoleForPerms.name}</span> ({activeRoleForPerms.code})
                  </h3>
                </div>
                <p className="text-xs text-slate-500">Centang tindakan yang diizinkan untuk peran ini di seluruh modul ERP.</p>
              </div>
              <button
                type="button"
                onClick={() => setPermMatrixModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5">
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700">Aksi Pintas Cepat Matriks:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const allPerms = [
                        'VIEW', 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'VERIFY', 'IMPORT', 'EXPORT', 'PRINT', 'DOWNLOAD', 'UPLOAD',
                        'akademik.view', 'akademik.input_nilai', 'akademik.approve_nilai', 'akademik.rapor_print',
                        'finance.view', 'finance.billing', 'finance.transaction', 'finance.report_export',
                        'employee.view', 'employee.manage_account', 'employee.rbac_assign',
                        'dorm.view', 'dorm.perizinan_approve', 'tahfizh.view', 'tahfizh.record', 'tahfizh.sertifikat',
                        'attendance.view', 'attendance.manual_input', 'attendance.approval',
                        'document.view', 'document.print', 'document.template_edit',
                        'system.view', 'system.rbac_edit', 'system.backup'
                      ];
                      setActiveRoleForPerms({ ...activeRoleForPerms, permissions: allPerms });
                    }}
                    className="px-2.5 py-1 bg-indigo-100 text-indigo-800 text-[11px] font-bold rounded-lg hover:bg-indigo-200 transition"
                  >
                    Centang Semua Modul & Aksi
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveRoleForPerms({ ...activeRoleForPerms, permissions: ['VIEW', 'akademik.view', 'finance.view', 'dorm.view', 'tahfizh.view', 'attendance.view', 'document.view'] });
                    }}
                    className="px-2.5 py-1 bg-slate-200 text-slate-800 text-[11px] font-bold rounded-lg hover:bg-slate-300 transition"
                  >
                    Hanya Lihat (Read-Only All Modules)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveRoleForPerms({ ...activeRoleForPerms, permissions: ['*'] });
                    }}
                    className="px-2.5 py-1 bg-rose-100 text-rose-800 text-[11px] font-bold rounded-lg hover:bg-rose-200 transition"
                  >
                    Set Full Wildcard (*)
                  </button>
                </div>
              </div>

              {[
                {
                  title: '1. Aksi CRUD & Operasional Dasar',
                  items: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'VERIFY', 'IMPORT', 'EXPORT', 'PRINT', 'DOWNLOAD', 'UPLOAD', 'GENERATE', 'SYNC', 'BACKUP']
                },
                {
                  title: '2. Modul Akademik & KBM',
                  items: ['akademik.view', 'akademik.input_nilai', 'akademik.approve_nilai', 'akademik.rapor_print', 'akademik.jadwal']
                },
                {
                  title: '3. Modul Keuangan & SPP Billing',
                  items: ['finance.view', 'finance.billing', 'finance.transaction', 'finance.report_export', 'finance.kas']
                },
                {
                  title: '4. Modul Kepegawaian & HR RBAC',
                  items: ['employee.view', 'employee.manage_account', 'employee.rbac_assign', 'employee.payroll']
                },
                {
                  title: '5. Modul Asrama & Tahfizh Pesantren',
                  items: ['dorm.view', 'dorm.perizinan_approve', 'tahfizh.view', 'tahfizh.record', 'tahfizh.sertifikat']
                },
                {
                  title: '6. Modul Presensi & Fingerprint',
                  items: ['attendance.view', 'attendance.manual_input', 'attendance.approval']
                },
                {
                  title: '7. Modul Studio Dokumen & Sistem',
                  items: ['document.view', 'document.print', 'document.template_edit', 'system.view', 'system.rbac_edit', 'system.backup']
                }
              ].map((group, idx) => (
                <div key={idx} className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 space-y-2">
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">{group.title}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {group.items.map((perm) => {
                      const isChecked = (activeRoleForPerms.permissions || []).includes(perm) || (activeRoleForPerms.permissions || []).includes('*');
                      return (
                        <label
                          key={perm}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                            isChecked 
                              ? 'bg-indigo-50/90 border-indigo-300 text-indigo-900 shadow-sm' 
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              let list = [...(activeRoleForPerms.permissions || [])];
                              if (list.includes('*')) list = [];
                              const i = list.indexOf(perm);
                              if (i > -1) list.splice(i, 1);
                              else list.push(perm);
                              setActiveRoleForPerms({ ...activeRoleForPerms, permissions: list });
                            }}
                            className="h-4 w-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                          />
                          <span className="font-mono text-[11px] truncate">{perm}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPermMatrixModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const updatedList = settings.roles_list.map((r: any) => r.id === activeRoleForPerms.id ? activeRoleForPerms : r);
                  setSettings((prev: any) => ({ ...prev, roles_list: updatedList }));
                  setPermMatrixModalOpen(false);
                  setSuccessMsg(`Matriks permission untuk ${activeRoleForPerms.name} berhasil disimpan.`);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-sm"
              >
                Simpan Matriks
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT MENU */}
      {menuModalOpen && editingMenu && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="h-5 w-5 text-indigo-600" />
                <h3 className="text-sm font-extrabold text-slate-900">Form Menu Navigasi Nav</h3>
              </div>
              <button
                type="button"
                onClick={() => setMenuModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 mb-1 font-bold">Nama Menu Navigasi *</label>
                <input
                  type="text"
                  value={editingMenu.name}
                  onChange={(e) => setEditingMenu({ ...editingMenu, name: e.target.value })}
                  placeholder="Contoh: Rapor Digital Kurikulum Merdeka"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Path Rute App *</label>
                <input
                  type="text"
                  value={editingMenu.path}
                  onChange={(e) => setEditingMenu({ ...editingMenu, path: e.target.value })}
                  placeholder="/academic/rapor"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Urutan Tampil *</label>
                <input
                  type="number"
                  value={editingMenu.order}
                  onChange={(e) => setEditingMenu({ ...editingMenu, order: Number(e.target.value) })}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setMenuModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const exists = settings.menus_list?.some((m: any) => m.id === editingMenu.id);
                  let updatedList = [];
                  if (exists) {
                    updatedList = settings.menus_list.map((m: any) => m.id === editingMenu.id ? editingMenu : m);
                  } else {
                    updatedList = [...(settings.menus_list || []), editingMenu];
                  }
                  setSettings((prev: any) => ({ ...prev, menus_list: updatedList }));
                  setMenuModalOpen(false);
                  setSuccessMsg(`Menu ${editingMenu.name} berhasil disimpan.`);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-sm"
              >
                Simpan Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: EDIT DASHBOARD WIDGET */}
      {widgetModalOpen && editingWidget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-amber-500" />
                <h3 className="text-sm font-extrabold text-slate-900">Form Configuration Widget Dashboard</h3>
              </div>
              <button
                type="button"
                onClick={() => setWidgetModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 mb-1 font-bold">Role Target *</label>
                <input
                  type="text"
                  value={editingWidget.role}
                  onChange={(e) => setEditingWidget({ ...editingWidget, role: e.target.value.toUpperCase() })}
                  placeholder="SUPER_ADMIN"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono uppercase focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Widget ID *</label>
                <input
                  type="text"
                  value={editingWidget.widget_id}
                  onChange={(e) => setEditingWidget({ ...editingWidget, widget_id: e.target.value })}
                  placeholder="stat_finance_summary"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Urutan Muat *</label>
                <input
                  type="number"
                  value={editingWidget.order}
                  onChange={(e) => setEditingWidget({ ...editingWidget, order: Number(e.target.value) })}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setWidgetModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const exists = settings.dashboard_widgets?.some((w: any) => w.id === editingWidget.id);
                  let updatedList = [];
                  if (exists) {
                    updatedList = settings.dashboard_widgets.map((w: any) => w.id === editingWidget.id ? editingWidget : w);
                  } else {
                    updatedList = [...(settings.dashboard_widgets || []), editingWidget];
                  }
                  setSettings((prev: any) => ({ ...prev, dashboard_widgets: updatedList }));
                  setWidgetModalOpen(false);
                  setSuccessMsg(`Widget ${editingWidget.widget_id} berhasil dikonfigurasi.`);
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer shadow-sm"
              >
                Simpan Widget
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
