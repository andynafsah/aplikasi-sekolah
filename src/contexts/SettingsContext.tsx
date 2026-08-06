import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';

export interface SettingsType {
  // 1. Profil Yayasan
  yayasan_nama: string;
  yayasan_logo: string;
  yayasan_ketua: string;
  yayasan_bendahara: string;
  yayasan_alamat: string;
  yayasan_telepon: string;
  yayasan_email: string;
  yayasan_website: string;
  yayasan_npwp: string;
  yayasan_nib: string;
  yayasan_akta: string;
  yayasan_visi: string;
  yayasan_misi: string;

  // 2. Profil Sekolah
  sekolah_nama: string;
  sekolah_npsn: string;
  sekolah_nss: string;
  sekolah_jenjang: string;
  sekolah_status: string;
  sekolah_akreditasi: string;
  sekolah_kepsek: string;
  sekolah_wakepsek: string;
  sekolah_operator: string;
  sekolah_alamat: string;
  sekolah_kecamatan: string;
  sekolah_kabupaten: string;
  sekolah_provinsi: string;
  sekolah_kodepos: string;
  sekolah_latitude: number;
  sekolah_longitude: number;
  sekolah_logo: string;
  sekolah_stempel: string;
  sekolah_foto: string;
  sekolah_telepon: string;
  sekolah_email: string;
  sekolah_website: string;

  // Multi-Unit Logos
  logo_tk: string;
  logo_sd: string;
  logo_smp: string;
  logo_sma: string;
  logo_pkbm: string;

  // 3. Profil Pondok
  pondok_nama: string;
  pondok_pimpinan: string;
  pondok_motto: string;
  pondok_visi: string;
  pondok_misi: string;
  pondok_logo: string;
  pondok_alamat: string;
  pondok_kontak: string;

  // 4. Tahun Ajaran
  ta_aktif: string;
  ta_semester: string;
  ta_kalender: string;
  ta_mulai: string;
  ta_selesai: string;

  // 5. Pengaturan KBM
  kbm_jam_mulai: string;
  kbm_durasi: number;
  kbm_hari_aktif: string[];
  kbm_shift: string;
  kbm_istirahat: string;
  kbm_pulang: string;
  kbm_kkm: number;
  kbm_kktp: number;
  kbm_kurikulum: string;

  // 6. Pengaturan Rapor
  rapor_template: string;
  rapor_kop: string;
  rapor_logo: string;
  rapor_kepsek: string;
  rapor_ttd: string;
  rapor_qr_verif: boolean;
  rapor_format_nilai: string;
  rapor_predikat: string;
  rapor_deskripsi_ai: boolean;
  rapor_penomoran: string;

  // 7. Pengaturan Leger
  leger_format: string;
  leger_kolom: number;
  leger_freeze_header: boolean;
  leger_freeze_nama: boolean;
  leger_autosave: boolean;
  leger_import_excel: boolean;
  leger_export_excel: boolean;
  leger_export_pdf: boolean;

  // 8. Pengaturan Keuangan
  keu_mata_uang: string;
  keu_spp_default: number;
  keu_va_active: boolean;
  keu_kas_default: string;
  keu_bank_nama: string;
  keu_pajak_persen: number;
  keu_format_kwitansi: string;
  keu_format_invoice: string;
  keu_format_jurnal: string;

  // 9. Pengaturan Surat
  surat_kop: string;
  surat_footer: string;
  surat_nomor_format: string;
  surat_qr_active: boolean;
  surat_barcode_active: boolean;
  surat_digital_signature: string;
  surat_watermark: string;

  // 10. Pengaturan Printer
  print_kertas: string;
  print_margin_atas: number;
  print_margin_bawah: number;
  print_margin_kiri: number;
  print_margin_kanan: number;
  print_font: string;
  print_orientasi: string;
  print_printer_default: string;
  print_preview_active: boolean;

  // 11. Pengaturan Upload
  upload_max_size: number;
  upload_allowed_types: string[];
  upload_folder: string;
  upload_compression: boolean;
  upload_watermark: boolean;

  // 12. Pengaturan Email
  email_host: string;
  email_port: number;
  email_user: string;
  email_pass: string;
  email_ssl: boolean;
  email_sender: string;

  // 13. Pengaturan WhatsApp
  wa_gateway: string;
  wa_token: string;
  wa_device: string;
  wa_default_number: string;

  // 14. Pengaturan Backup
  backup_auto: boolean;
  backup_schedule: string;
  backup_location: string;
  backup_gdrive_active: boolean;
  backup_restore_point: string;

  // 15. Pengaturan Database
  db_host: string;
  db_port: number;
  db_name: string;
  db_user: string;

  // 16. Pengaturan Security
  sec_jwt_expiry: string;
  sec_session_timeout: number;
  sec_login_attempts: number;
  sec_password_policy: string;
  sec_mfa_active: boolean;
  sec_audit_active: boolean;
  sec_activity_active: boolean;

  // 17. Pengaturan Role
  roles_list: any[];

  // 18. Pengaturan Menu
  menus_list: any[];

  // 19. Pengaturan Dashboard
  dashboard_widgets: any[];

  // 20. Pengaturan AI
  ai_api_key: string;
  ai_prompt: string;
  ai_template: string;
  ai_model: string;
  ai_temperature: number;
  ai_max_token: number;

  // 21. Pengaturan Mobile
  mobile_splash: string;
  mobile_icon: string;
  mobile_theme: string;
  mobile_primary_color: string;
  mobile_secondary_color: string;
  mobile_notification: boolean;
  mobile_version: string;

  // 22. Pengaturan Sistem
  sys_timezone: string;
  sys_language: string;
  sys_date_format: string;
  sys_time_format: string;
  sys_currency: string;
  sys_auto_number: boolean;
  sys_cache_active: boolean;
  sys_maintenance_mode: boolean;
}

interface SettingsContextProps {
  settings: SettingsType;
  loading: boolean;
  refreshSettings: () => Promise<void>;
  updateSingleSetting: (key: keyof SettingsType, value: any) => void;
  saveAllSettings: (updated: Partial<SettingsType>) => Promise<boolean>;
}

const defaultValues: SettingsType = {
  yayasan_nama: "Yayasan Darul Hadits Lima Puluh Kota",
  yayasan_logo: "/logo.png",
  yayasan_ketua: "Ustadz H. Miqdad Elfayadh, Lc.",
  yayasan_bendahara: "Hj. Siti Rahmah",
  yayasan_alamat: "Jl. Raya Payakumbuh - Pekanbaru KM 12, Lima Puluh Kota",
  yayasan_telepon: "0812-3456-7890",
  yayasan_email: "yayasan@darulhadits.org",
  yayasan_website: "www.darulhadits.org",
  yayasan_npwp: "12.345.678.9-012.000",
  yayasan_nib: "9120123456789",
  yayasan_akta: "No. 45 Tanggal 12 Mei 2018",
  yayasan_visi: "Menjadi yayasan pendidikan Islam pelopor dalam melahirkan generasi Rabbani tafaqquh fiddin.",
  yayasan_misi: "Menyelenggarakan pendidikan berkualitas berasaskan Al-Quran dan Sunnah, membangun karakter mulia, dan membina kemandirian umat.",

  sekolah_nama: "Darul Hadits Boarding School",
  sekolah_npsn: "10203040",
  sekolah_nss: "302040102030",
  sekolah_jenjang: "SMA / MA",
  sekolah_status: "SWASTA",
  sekolah_akreditasi: "A",
  sekolah_kepsek: "Ustadz Ahmad Fauzi, M.Pd.",
  sekolah_wakepsek: "Ustadz Ridwan, S.Pd.I",
  sekolah_operator: "Zulkifli, S.Kom",
  sekolah_alamat: "Jl. Raya Payakumbuh - Pekanbaru KM 12, Lima Puluh Kota",
  sekolah_kecamatan: "Harau",
  sekolah_kabupaten: "Lima Puluh Kota",
  sekolah_provinsi: "Sumatera Barat",
  sekolah_kodepos: "26271",
  sekolah_latitude: -0.2245,
  sekolah_longitude: 100.6312,
  sekolah_logo: "/logo.png",
  sekolah_stempel: "/stempel.png",
  sekolah_foto: "/gedung.jpg",
  sekolah_telepon: "(0251) 824-9011",
  sekolah_email: "info@darulhadits.org",
  sekolah_website: "www.darulhadits.org",

  logo_tk: "https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&q=80&w=150",
  logo_sd: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=150",
  logo_smp: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=150",
  logo_sma: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=150",
  logo_pkbm: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=150",

  pondok_nama: "Pondok Pesantren Darul Hadits",
  pondok_pimpinan: "K.H. Muhammad Shadiq, Lc.",
  pondok_motto: "Ikhlas, Sederhana, Berdikari, Ukhuwah Islamiyah",
  pondok_visi: "Mewujudkan lembaga pendidikan kader pemimpin umat yang unggul dalam hafalan hadits dan bahasa Arab.",
  pondok_misi: "Membina santri yang berakhlak mulia, hafal hadits-hadits pilihan, fasih berbahasa Arab aktif, dan cakap dalam kepemimpinan.",
  pondok_logo: "/logo-pondok.png",
  pondok_alamat: "Jl. Raya Payakumbuh - Pekanbaru KM 12, Lima Puluh Kota",
  pondok_kontak: "0811-9876-5432",

  ta_aktif: "2025/2026",
  ta_semester: "GANJIL",
  ta_kalender: "Kalender Akademik 2025/2026 Ganjil.pdf",
  ta_mulai: "2025-07-15",
  ta_selesai: "2025-12-20",

  kbm_jam_mulai: "07:30",
  kbm_durasi: 40,
  kbm_hari_aktif: ["SENIN", "SELASA", "RABU", "KAMIS", "SABTU", "MINGGU"],
  kbm_shift: "PAGI",
  kbm_istirahat: "10:10",
  kbm_pulang: "15:30",
  kbm_kkm: 75,
  kbm_kktp: 75,
  kbm_kurikulum: "KURIKULUM MERDEKA",

  rapor_template: "Modern Elegant MA",
  rapor_kop: "Kop Surat Resmi MA Darul Hadits",
  rapor_logo: "/logo.png",
  rapor_kepsek: "Ustadz Ahmad Fauzi, M.Pd.",
  rapor_ttd: "/ttd-kepsek.png",
  rapor_qr_verif: true,
  rapor_format_nilai: "Kuantitatif 0-100",
  rapor_predikat: "A: 90-100, B: 80-89, C: 75-79, D: <75",
  rapor_deskripsi_ai: true,
  rapor_penomoran: "MA/DH/2026/[NUMBER]",

  leger_format: "Format Standar Kemenag",
  leger_kolom: 15,
  leger_freeze_header: true,
  leger_freeze_nama: true,
  leger_autosave: true,
  leger_import_excel: true,
  leger_export_excel: true,
  leger_export_pdf: true,

  keu_mata_uang: "IDR",
  keu_spp_default: 750000,
  keu_va_active: true,
  keu_kas_default: "Kas Operasional Utama",
  keu_bank_nama: "Bank Syariah Indonesia (BSI)",
  keu_pajak_persen: 0,
  keu_format_kwitansi: "KW/[YEAR]/[MONTH]/[NUMBER]",
  keu_format_invoice: "INV/[YEAR]/[NUMBER]",
  keu_format_jurnal: "JR/[YEAR]/[NUMBER]",

  surat_kop: "Kop Surat Resmi Yayasan Darul Hadits",
  surat_footer: "Dokumen ini sah secara hukum dan dihasilkan otomatis oleh Sistem Informasi Akademik Darul Hadits.",
  surat_nomor_format: "YDH/[KODE]/[YEAR]/[NUMBER]",
  surat_qr_active: true,
  surat_barcode_active: false,
  surat_digital_signature: "/sig-digital.png",
  surat_watermark: "/logo-watermark.png",

  print_kertas: "A4",
  print_margin_atas: 20,
  print_margin_bawah: 20,
  print_margin_kiri: 25,
  print_margin_kanan: 20,
  print_font: "Inter",
  print_orientasi: "PORTRAIT",
  print_printer_default: "Network Epson L3110",
  print_preview_active: true,

  upload_max_size: 5,
  upload_allowed_types: [".jpg", ".jpeg", ".png", ".pdf", ".xls", ".xlsx", ".doc", ".docx"],
  upload_folder: "uploads/darul_hadits",
  upload_compression: true,
  upload_watermark: false,

  email_host: "smtp.gmail.com",
  email_port: 587,
  email_user: "sistem@darulhadits.org",
  email_pass: "••••••••••••••••",
  email_ssl: true,
  email_sender: "Darul Hadits Mail System",

  wa_gateway: "Fonnte API Gateway",
  wa_token: "dArUlHaDiTsWiZaRdToKeN2026",
  wa_device: "Darul Hadits Broadcast",
  wa_default_number: "08123456789",

  backup_auto: true,
  backup_schedule: "daily",
  backup_location: "CLOUD",
  backup_gdrive_active: true,
  backup_restore_point: "Point_Awal_Install.json",

  db_host: "localhost",
  db_port: 3306,
  db_name: "darul_hadits_db",
  db_user: "root",

  sec_jwt_expiry: "24h",
  sec_session_timeout: 60,
  sec_login_attempts: 5,
  sec_password_policy: "STRONG",
  sec_mfa_active: false,
  sec_audit_active: true,
  sec_activity_active: true,

  roles_list: [
    { id: "role-superadmin", name: "Super Admin", code: "SUPER_ADMIN", permissions: ["*"] },
    { id: "role-admin", name: "Admin", code: "ADMIN", permissions: ["student.view", "student.create", "student.update", "teacher.view"] },
    { id: "role-guru", name: "Guru", code: "GURU", permissions: ["student.view", "teacher.view", "grade.create"] },
    { id: "role-wali", name: "Wali Kelas", code: "WALI_KELAS", permissions: ["student.view", "grade.create"] }
  ],

  menus_list: [
    { id: "menu-dashboard", name: "Dashboard Utama", icon: "Layers", path: "dashboard", parent_id: null, role_codes: ["SUPER_ADMIN", "ADMIN", "GURU", "WALI_KELAS"], order: 1, status: true },
    { id: "menu-sivitas", name: "Data Siswa & Santri", icon: "Users", path: "sivitas", parent_id: null, role_codes: ["SUPER_ADMIN", "ADMIN"], order: 2, status: true },
    { id: "menu-pegawai", name: "Kepegawaian", icon: "Users", path: "pegawai", parent_id: null, role_codes: ["SUPER_ADMIN", "ADMIN"], order: 3, status: true }
  ],

  dashboard_widgets: [
    { role: "SUPER_ADMIN", widget_id: "widget-stats", is_active: true, order: 1 },
    { role: "SUPER_ADMIN", widget_id: "widget-finance-chart", is_active: true, order: 2 }
  ],

  ai_api_key: "AIzaSyA_example_gemini_key",
  ai_prompt: "Anda adalah asisten AI resmi dari Yayasan Darul Hadits Lima Puluh Kota.",
  ai_template: "Format Jawaban: Ringkas, Sopan, Islami.",
  ai_model: "gemini-3.5-flash",
  ai_temperature: 0.7,
  ai_max_token: 2048,

  mobile_splash: "/splash.png",
  mobile_icon: "/icon.png",
  mobile_theme: "EMERALD_GREEN",
  mobile_primary_color: "#059669",
  mobile_secondary_color: "#0f172a",
  mobile_notification: true,
  mobile_version: "1.0.4",

  sys_timezone: "Asia/Jakarta",
  sys_language: "id",
  sys_date_format: "DD/MM/YYYY",
  sys_time_format: "24h",
  sys_currency: "IDR",
  sys_auto_number: true,
  sys_cache_active: true,
  sys_maintenance_mode: false
};

const SettingsContext = createContext<SettingsContextProps | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SettingsType>(defaultValues);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await apiClient.post('/api/action', { action: 'getSettings' });
      if (res.data?.success && res.data?.data) {
        setSettings(prev => ({ ...prev, ...res.data.data }));
      }
    } catch (err) {
      console.error('Failed to load dynamic configurations from database:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSingleSetting = (key: keyof SettingsType, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveAllSettings = async (updated: Partial<SettingsType>): Promise<boolean> => {
    try {
      const fullPayload = { ...settings, ...updated };
      const res = await apiClient.post('/api/action', {
        action: 'saveSettings',
        ...fullPayload
      });
      if (res.data?.success) {
        setSettings(prev => ({ ...prev, ...res.data.data }));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to save dynamic configuration:', err);
      return false;
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        refreshSettings: fetchSettings,
        updateSingleSetting,
        saveAllSettings
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
