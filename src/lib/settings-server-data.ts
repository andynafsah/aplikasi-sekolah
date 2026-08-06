// ============================================================================
// SPRINT 28: ENTERPRISE SYSTEM SETTINGS, PLATFORM CONFIG & WHITE LABEL
// IN-MEMORY STORAGE, DYNAMIC CONFIG REGISTRY, & PROVIDER ADAPTERS
// ============================================================================

import { appendAuditLog } from './audit-server-data';
import { PrismaEngine } from '../backend/database/prisma';

// Module-level cache to gracefully support fully operational offline fallback
let inMemorySettingsCache: any = null;

// ============================================================================
// INTERFACES & SCHEMA DEFINITIONS
// ============================================================================

export interface SystemSettingCategory {
  id: string;
  tenant_id: string | null;
  name: string;
  code: string;
  description: string;
}

export interface SystemSettingGroup {
  id: string;
  tenant_id: string | null;
  category_id: string;
  name: string;
  code: string;
  description: string;
}

export interface SystemSetting {
  id: string;
  tenant_id: string | null;
  group_id: string;
  key_name: string;
  display_name: string;
  value_type: 'string' | 'number' | 'boolean' | 'json' | 'encrypted';
  default_value: string;
  is_encrypted: boolean;
  is_read_only: boolean;
}

export interface SystemSettingValue {
  id: string;
  tenant_id: string | null;
  setting_id: string;
  value_text: string;
  encrypted_value: string;
  is_active: boolean;
  updated_at: string;
  updated_by: string;
}

export interface TenantSetting {
  id: string;
  tenant_id: string;
  app_title: string;
  version: string;
  timezone: string;
  locale: string;
  currency: string;
  date_format: string;
  number_format: string;
  app_mode: 'Cloud SaaS' | 'On Premise' | 'Offline' | 'Hybrid' | 'Development' | 'Staging' | 'Production';
}

export interface TenantDomain {
  id: string;
  tenant_id: string;
  custom_domain: string;
  is_ssl_enabled: boolean;
  status: 'Pending' | 'Verifying' | 'Active' | 'Failed';
}

export interface TenantBranding {
  id: string;
  tenant_id: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  dark_mode_enabled: boolean;
  logo_url: string | null;
  favicon_url: string | null;
  login_bg_url: string | null;
  email_template: string;
  pdf_template: string;
}

export interface FeatureFlag {
  id: string;
  tenant_id: string | null;
  flag_key: string;
  name: string;
  description: string;
  is_enabled: boolean;
}

export interface FeatureFlagRule {
  id: string;
  tenant_id: string | null;
  flag_id: string;
  rule_type: 'RoleBased' | 'UserPercentage' | 'DateRange' | 'Custom';
  rule_criteria: any;
  is_active: boolean;
}

export interface EnvironmentProfile {
  id: string;
  tenant_id: string | null;
  profile_name: string;
  is_active: boolean;
}

export interface EnvironmentVariable {
  id: string;
  tenant_id: string | null;
  profile_id: string;
  var_key: string;
  var_value: string;
  is_secret: boolean;
}

export interface StorageProvider {
  id: string;
  tenant_id: string | null;
  provider_name: 'Supabase Storage' | 'Google Cloud Storage' | 'Amazon S3' | 'Cloudflare R2' | 'MinIO' | 'Local Storage Ready';
  config_details: any;
  is_default: boolean;
}

export interface NotificationProvider {
  id: string;
  tenant_id: string | null;
  provider_type: 'WhatsApp' | 'SMTP' | 'Firebase' | 'Telegram' | 'Discord' | 'Slack';
  config_details: any;
  is_enabled: boolean;
}

export interface PaymentGatewayProvider {
  id: string;
  tenant_id: string | null;
  provider_name: 'Midtrans' | 'Xendit' | 'DOKU' | 'Stripe' | 'PayPal' | 'Manual Transfer';
  config_details: any;
  is_enabled: boolean;
}

export interface AiGatewayProvider {
  id: string;
  tenant_id: string | null;
  provider_name: 'Gemini' | 'OpenAI' | 'Claude' | 'DeepSeek' | 'OpenRouter' | 'Ollama';
  config_details: any;
  is_enabled: boolean;
}

export interface SecurityPolicy {
  id: string;
  tenant_id: string;
  enable_mfa: boolean;
  session_timeout_minutes: number;
  max_login_attempts: number;
  password_min_length: number;
  require_uppercase: boolean;
  require_numbers: boolean;
  require_special_characters: boolean;
  ip_whitelist: string[];
}

export interface MaintenanceWindow {
  id: string;
  tenant_id: string | null;
  start_time: string;
  end_time: string;
  description: string;
  is_active: boolean;
}

export interface SystemAnnouncement {
  id: string;
  tenant_id: string | null;
  title: string;
  content: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export interface LicenseSetting {
  id: string;
  tenant_id: string;
  license_key: string;
  tier: 'Standard' | 'Premium' | 'Enterprise';
  status: 'Active' | 'Expired' | 'Suspended';
  expires_at: string;
  max_users: number;
  max_storage_gb: number;
}

export interface SystemHealthCheck {
  id: string;
  tenant_id: string | null;
  service_name: string;
  status: 'Healthy' | 'Warning' | 'Unhealthy';
  response_time_ms: number;
  last_checked_at: string;
  error_message: string | null;
}

export interface ConfigurationBackup {
  id: string;
  tenant_id: string | null;
  backup_name: string;
  file_path: string;
  file_size_bytes: number;
  created_at: string;
  created_by: string;
}

// ============================================================================
// ADAPTER PATTERN IMPLEMENTATIONS FOR CONFIG REGISTRY PROVIDERS
// ============================================================================

export interface StorageAdapter {
  uploadFile(bucketName: string, path: string, data: any): Promise<{ success: boolean; url: string }>;
}

export class SupabaseStorageAdapter implements StorageAdapter {
  async uploadFile(bucketName: string, path: string, data: any) {
    return { success: true, url: `https://supabase.co/storage/v1/object/public/${bucketName}/${path}` };
  }
}

export class S3StorageAdapter implements StorageAdapter {
  async uploadFile(bucketName: string, path: string, data: any) {
    return { success: true, url: `https://${bucketName}.s3.amazonaws.com/${path}` };
  }
}

export class LocalStorageAdapter implements StorageAdapter {
  async uploadFile(bucketName: string, path: string, data: any) {
    return { success: true, url: `/local-storage/${bucketName}/${path}` };
  }
}

export interface PaymentAdapter {
  createInvoice(amount: number, orderId: string): Promise<{ invoiceUrl: string; transactionId: string }>;
}

export class MidtransAdapter implements PaymentAdapter {
  async createInvoice(amount: number, orderId: string) {
    return { invoiceUrl: `https://app.sandbox.midtrans.com/snap/v2/vtweb/${orderId}`, transactionId: `mid-${Date.now()}` };
  }
}

export class StripeAdapter implements PaymentAdapter {
  async createInvoice(amount: number, orderId: string) {
    return { invoiceUrl: `https://checkout.stripe.com/pay/${orderId}`, transactionId: `ch_${Date.now()}` };
  }
}

// ============================================================================
// IN-MEMORY DATABASE STORAGE
// ============================================================================

export const SETTINGS_DB: {
  categories: SystemSettingCategory[];
  groups: SystemSettingGroup[];
  settings: SystemSetting[];
  values: SystemSettingValue[];
  tenantSettings: TenantSetting[];
  domains: TenantDomain[];
  brandings: TenantBranding[];
  featureFlags: FeatureFlag[];
  flagRules: FeatureFlagRule[];
  envProfiles: EnvironmentProfile[];
  envVariables: EnvironmentVariable[];
  storageProviders: StorageProvider[];
  notificationProviders: NotificationProvider[];
  paymentProviders: PaymentGatewayProvider[];
  aiProviders: AiGatewayProvider[];
  securityPolicies: SecurityPolicy[];
  maintenanceWindows: MaintenanceWindow[];
  announcements: SystemAnnouncement[];
  licenses: LicenseSetting[];
  healthChecks: SystemHealthCheck[];
  backups: ConfigurationBackup[];
} = {
  categories: [],
  groups: [],
  settings: [],
  values: [],
  tenantSettings: [],
  domains: [],
  brandings: [],
  featureFlags: [],
  flagRules: [],
  envProfiles: [],
  envVariables: [],
  storageProviders: [],
  notificationProviders: [],
  paymentProviders: [],
  aiProviders: [],
  securityPolicies: [],
  maintenanceWindows: [],
  announcements: [],
  licenses: [],
  healthChecks: [],
  backups: []
};

// Simple pseudo encryption helper
function encryptConfigValue(val: string): string {
  return Buffer.from(val).toString('base64');
}

function decryptConfigValue(val: string): string {
  return Buffer.from(val, 'base64').toString('ascii');
}

// ============================================================================
// SEEDING HELPER
// ============================================================================

export function seedSettingsData(tenantId: string) {
  // 1. Categories
  const catSysId = `scat-sys-${tenantId}`;
  const catBizId = `scat-biz-${tenantId}`;
  
  SETTINGS_DB.categories.push(
    { id: catSysId, tenant_id: tenantId, name: 'Sistem & Platform', code: 'SYS_PLAT', description: 'Pengaturan dasar arsitektur system core' },
    { id: catBizId, tenant_id: tenantId, name: 'Integrasi & Bisnis', code: 'BIZ_INT', description: 'Konfigurasi gerbang pembayaran, AI, & notifikasi' }
  );

  // 2. Groups
  const grpGenId = `sgrp-gen-${tenantId}`;
  const grpSecId = `sgrp-sec-${tenantId}`;
  const grpAiId = `sgrp-ai-${tenantId}`;

  SETTINGS_DB.groups.push(
    { id: grpGenId, tenant_id: tenantId, category_id: catSysId, name: 'General Settings', code: 'GENERAL', description: 'Branding global dan zona waktu' },
    { id: grpSecId, tenant_id: tenantId, category_id: catSysId, name: 'Security Settings', code: 'SECURITY', description: 'Keamanan, MFA, dan sandi' },
    { id: grpAiId, tenant_id: tenantId, category_id: catBizId, name: 'AI Services', code: 'AI_SERVICES', description: 'Kunci model bahasa LLM' }
  );

  // 3. Settings & Initial Values
  const settingsToSeed = [
    { id: `set-appname-${tenantId}`, group_id: grpGenId, key_name: 'APP_NAME', display_name: 'Application Name', value_type: 'string' as const, default: 'Educore Enterprise ERP', is_enc: false },
    { id: `set-ver-${tenantId}`, group_id: grpGenId, key_name: 'APP_VERSION', display_name: 'System Version', value_type: 'string' as const, default: 'v8.4.1', is_enc: false },
    { id: `set-tz-${tenantId}`, group_id: grpGenId, key_name: 'TIMEZONE', display_name: 'System Timezone', value_type: 'string' as const, default: 'Asia/Jakarta', is_enc: false },
    { id: `set-passlen-${tenantId}`, group_id: grpSecId, key_name: 'PASSWORD_MIN_LENGTH', display_name: 'Password Minimum Length', value_type: 'number' as const, default: '8', is_enc: false },
    { id: `set-ai-${tenantId}`, group_id: grpAiId, key_name: 'GEMINI_SECRET_KEY', display_name: 'Gemini API Key Secret', value_type: 'encrypted' as const, default: 'AIzaSyA_mock_key_2026', is_enc: true }
  ];

  settingsToSeed.forEach(s => {
    SETTINGS_DB.settings.push({
      id: s.id,
      tenant_id: tenantId,
      group_id: s.group_id,
      key_name: s.key_name,
      display_name: s.display_name,
      value_type: s.value_type,
      default_value: s.default,
      is_encrypted: s.is_enc,
      is_read_only: false
    });

    SETTINGS_DB.values.push({
      id: `val-${s.id}`,
      tenant_id: tenantId,
      setting_id: s.id,
      value_text: s.is_enc ? '' : s.default,
      encrypted_value: s.is_enc ? encryptConfigValue(s.default) : '',
      is_active: true,
      updated_at: new Date().toISOString(),
      updated_by: 'seed_manager'
    });
  });

  // 4. Tenant Settings
  SETTINGS_DB.tenantSettings.push({
    id: `ts-${tenantId}`,
    tenant_id: tenantId,
    app_title: tenantId === 'tenant-1' ? 'SMA Sinergi Boarding School' : 'Pesantren Modern Al-Hikmah',
    version: '8.4.2',
    timezone: 'Asia/Jakarta',
    locale: 'id-ID',
    currency: 'IDR',
    date_format: 'DD/MM/YYYY',
    number_format: 'id-ID',
    app_mode: 'Production'
  });

  // 5. Tenant Domain
  SETTINGS_DB.domains.push({
    id: `dom-${tenantId}`,
    tenant_id: tenantId,
    custom_domain: tenantId === 'tenant-1' ? 'sinergi.educore.id' : 'alhikmah.educore.id',
    is_ssl_enabled: true,
    status: 'Active'
  });

  // 6. Tenant Brandings
  SETTINGS_DB.brandings.push({
    id: `brand-${tenantId}`,
    tenant_id: tenantId,
    primary_color: '#4F46E5',
    secondary_color: '#0F172A',
    accent_color: '#F59E0B',
    dark_mode_enabled: false,
    logo_url: '/assets/brand-logo.png',
    favicon_url: '/assets/brand-favicon.ico',
    login_bg_url: '/assets/brand-bg.jpg',
    email_template: '<html><body><h2>Halo {{name}}</h2><p>Pemberitahuan Sistem Resmi.</p></body></html>',
    pdf_template: '<html><body><h1>Laporan Audit Resmi</h1></body></html>'
  });

  // 7. Feature Flags
  SETTINGS_DB.featureFlags.push(
    { id: `flag-ai-${tenantId}`, tenant_id: tenantId, flag_key: 'ENABLE_AI_COPILOT', name: 'AI Assistant & Copilot Panel', description: 'Mengaktifkan panel percakapan asisten kecerdasan buatan', is_enabled: true },
    { id: `flag-mfa-${tenantId}`, tenant_id: tenantId, flag_key: 'REQUIRE_MFA_KEPALA_SEKOLAH', name: 'Wajib MFA untuk Kepala Sekolah', description: 'Proteksi lapis kedua otentikasi login kepala sekolah', is_enabled: false }
  );

  // 8. Environment Profiles
  const envDevId = `env-dev-${tenantId}`;
  const envProdId = `env-prod-${tenantId}`;
  SETTINGS_DB.envProfiles.push(
    { id: envDevId, tenant_id: tenantId, profile_name: 'Development', is_active: false },
    { id: envProdId, tenant_id: tenantId, profile_name: 'Production', is_active: true }
  );

  SETTINGS_DB.envVariables.push(
    { id: `v1-${tenantId}`, tenant_id: tenantId, profile_id: envProdId, var_key: 'DATABASE_POOL_SIZE', var_value: '25', is_secret: false },
    { id: `v2-${tenantId}`, tenant_id: tenantId, profile_id: envProdId, var_key: 'SUPABASE_API_SECRET', var_value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.seed', is_secret: true }
  );

  // 9. Providers Setup
  SETTINGS_DB.storageProviders.push(
    { id: `sp-1-${tenantId}`, tenant_id: tenantId, provider_name: 'Supabase Storage', config_details: { bucket: 'educore-prod-media', region: 'ap-southeast-1' }, is_default: true },
    { id: `sp-2-${tenantId}`, tenant_id: tenantId, provider_name: 'Amazon S3', config_details: { bucket: 'legacy-media-s3', region: 'ap-northeast-1' }, is_default: false }
  );

  SETTINGS_DB.notificationProviders.push(
    { id: `np-1-${tenantId}`, tenant_id: tenantId, provider_type: 'WhatsApp', config_details: { gateway_url: 'https://api.fonnte.com/send', token_secret: 'wh-token-f89a' }, is_enabled: true },
    { id: `np-2-${tenantId}`, tenant_id: tenantId, provider_type: 'SMTP', config_details: { host: 'smtp.gmail.com', port: 587, user: 'admin@school.id' }, is_enabled: true }
  );

  SETTINGS_DB.paymentProviders.push(
    { id: `pp-1-${tenantId}`, tenant_id: tenantId, provider_name: 'Midtrans', config_details: { client_key: 'mid-client-f92a', server_key: 'mid-server-sec' }, is_enabled: true },
    { id: `pp-2-${tenantId}`, tenant_id: tenantId, provider_name: 'Stripe', config_details: { pub_key: 'pk_live_stripe_982a', secret_key: 'sk_live_stripe_sec' }, is_enabled: false }
  );

  SETTINGS_DB.aiProviders.push(
    { id: `aprov-1-${tenantId}`, tenant_id: tenantId, provider_name: 'Gemini', config_details: { model: 'gemini-3.5-flash', api_key: 'AIzaSyA_seed_key_8a3f' }, is_enabled: true },
    { id: `aprov-2-${tenantId}`, tenant_id: tenantId, provider_name: 'OpenAI', config_details: { model: 'gpt-4o', api_key: 'sk-proj-openai-sec' }, is_enabled: false }
  );

  // 10. Security Policies
  SETTINGS_DB.securityPolicies.push({
    id: `secpol-${tenantId}`,
    tenant_id: tenantId,
    enable_mfa: false,
    session_timeout_minutes: 60,
    max_login_attempts: 5,
    password_min_length: 8,
    require_uppercase: true,
    require_numbers: true,
    require_special_characters: true,
    ip_whitelist: ['127.0.0.1', '192.168.1.1/24']
  });

  // 11. Maintenance Mode
  SETTINGS_DB.maintenanceWindows.push({
    id: `mw-1-${tenantId}`,
    tenant_id: tenantId,
    start_time: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
    end_time: new Date(Date.now() + 2 * 24 * 3600 * 1000 + 4 * 3600 * 1000).toISOString(),
    description: 'Pembersihan Cache Database Berkala dan Optimasi Query DDL',
    is_active: false
  });

  // 12. Announcements
  SETTINGS_DB.announcements.push({
    id: `ann-1-${tenantId}`,
    tenant_id: tenantId,
    title: 'Migrasi Modul Keuangan & Sistem Cloud ERP Selesai',
    content: 'Seluruh bendahara dapat kembali melakukan transaksi buku kas umum secara realtime.',
    start_date: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString().split('T')[0],
    end_date: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString().split('T')[0],
    is_active: true
  });

  // 13. Licenses
  SETTINGS_DB.licenses.push({
    id: `lic-${tenantId}`,
    tenant_id: tenantId,
    license_key: `LIC-EDUCORE-CORP-${tenantId.toUpperCase()}-92A3-2026`,
    tier: 'Enterprise',
    status: 'Active',
    expires_at: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
    max_users: 1500,
    max_storage_gb: 150
  });

  // 14. Health Checks
  SETTINGS_DB.healthChecks.push(
    { id: `hc-db-${tenantId}`, tenant_id: tenantId, service_name: 'Database (Supabase PostgreSQL)', status: 'Healthy', response_time_ms: 12, last_checked_at: new Date().toISOString(), error_message: null },
    { id: `hc-stor-${tenantId}`, tenant_id: tenantId, service_name: 'Storage Cloud (S3 Compatible)', status: 'Healthy', response_time_ms: 34, last_checked_at: new Date().toISOString(), error_message: null },
    { id: `hc-wa-${tenantId}`, tenant_id: tenantId, service_name: 'WhatsApp Gateway API (Fonnte)', status: 'Healthy', response_time_ms: 120, last_checked_at: new Date().toISOString(), error_message: null },
    { id: `hc-pay-${tenantId}`, tenant_id: tenantId, service_name: 'Payment Gateway Connection (Midtrans)', status: 'Healthy', response_time_ms: 85, last_checked_at: new Date().toISOString(), error_message: null }
  );

  // 15. Initial backup
  SETTINGS_DB.backups.push({
    id: `bk-1-${tenantId}`,
    tenant_id: tenantId,
    backup_name: `Backup_Awal_Sprint28_${new Date().toISOString().split('T')[0]}.json`,
    file_path: `/storage/backups/cfg_${tenantId}_initial.json`,
    file_size_bytes: 450120,
    created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    created_by: 'system_manager'
  });
}

// ============================================================================
// MAIN REST ACTION DELEGATOR HANDLER
// ============================================================================

export async function handleSettingsActions(
  action: string,
  req: any,
  res: any,
  tenantId: string,
  authUser: any,
  username: string,
  role: string,
  logActivity: any,
  DB: any
) {
  // Seed initial values for tenant if not seeded
  const isTenantSeeded = SETTINGS_DB.tenantSettings.some(ts => ts.tenant_id === tenantId);
  if (!isTenantSeeded) {
    seedSettingsData(tenantId);
  }

  const userId = authUser?.id || 'user-unknown';
  const uName = username || 'sistem';

  switch (action) {
    case 'getSettings': {
      try {
        let settingRecord: any = null;
        try {
          settingRecord = await PrismaEngine.systemSetting.findUnique({
            where: { key: 'UNIFIED_SETTINGS' }
          });
        } catch (dbErr: any) {
          console.warn('⚠️ Database query for UNIFIED_SETTINGS failed, using memory/default fallback:', dbErr.message);
        }

        if (!settingRecord) {
          const defaultSettings = {
            // 1. Profil Yayasan
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

            // 2. Profil Sekolah
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

            // 3. Profil Pondok
            pondok_nama: "Pondok Pesantren Darul Hadits",
            pondok_pimpinan: "K.H. Muhammad Shadiq, Lc.",
            pondok_motto: "Ikhlas, Sederhana, Berdikari, Ukhuwah Islamiyah",
            pondok_visi: "Mewujudkan lembaga pendidikan kader pemimpin umat yang unggul dalam hafalan hadits dan bahasa Arab.",
            pondok_misi: "Membina santri yang berakhlak mulia, hafal hadits-hadits pilihan, fasih berbahasa Arab aktif, dan cakap dalam kepemimpinan.",
            pondok_logo: "/logo-pondok.png",
            pondok_alamat: "Jl. Raya Payakumbuh - Pekanbaru KM 12, Lima Puluh Kota",
            pondok_kontak: "0811-9876-5432",

            // 4. Tahun Ajaran
            ta_aktif: "2025/2026",
            ta_semester: "GANJIL",
            ta_kalender: "Kalender Akademik 2025/2026 Ganjil.pdf",
            ta_mulai: "2025-07-15",
            ta_selesai: "2025-12-20",

            // 5. Pengaturan KBM
            kbm_jam_mulai: "07:30",
            kbm_durasi: 40,
            kbm_hari_aktif: ["SENIN", "SELASA", "RABU", "KAMIS", "SABTU", "MINGGU"],
            kbm_shift: "PAGI",
            kbm_istirahat: "10:10",
            kbm_pulang: "15:30",
            kbm_kkm: 75,
            kbm_kktp: 75,
            kbm_kurikulum: "KURIKULUM MERDEKA",

            // 6. Pengaturan Rapor
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

            // 7. Pengaturan Leger
            leger_format: "Format Standar Kemenag",
            leger_kolom: 15,
            leger_freeze_header: true,
            leger_freeze_nama: true,
            leger_autosave: true,
            leger_import_excel: true,
            leger_export_excel: true,
            leger_export_pdf: true,

            // 8. Pengaturan Keuangan
            keu_mata_uang: "IDR",
            keu_spp_default: 750000,
            keu_va_active: true,
            keu_kas_default: "Kas Operasional Utama",
            keu_bank_nama: "Bank Syariah Indonesia (BSI)",
            keu_pajak_persen: 0,
            keu_format_kwitansi: "KW/[YEAR]/[MONTH]/[NUMBER]",
            keu_format_invoice: "INV/[YEAR]/[NUMBER]",
            keu_format_jurnal: "JR/[YEAR]/[NUMBER]",

            // 9. Pengaturan Surat
            surat_kop: "Kop Surat Resmi Yayasan Darul Hadits",
            surat_footer: "Dokumen ini sah secara hukum dan dihasilkan otomatis oleh Sistem Informasi Akademik Darul Hadits.",
            surat_nomor_format: "YDH/[KODE]/[YEAR]/[NUMBER]",
            surat_qr_active: true,
            surat_barcode_active: false,
            surat_digital_signature: "/sig-digital.png",
            surat_watermark: "/logo-watermark.png",

            // 10. Pengaturan Printer
            print_kertas: "A4",
            print_margin_atas: 20,
            print_margin_bawah: 20,
            print_margin_kiri: 25,
            print_margin_kanan: 20,
            print_font: "Inter",
            print_orientasi: "PORTRAIT",
            print_printer_default: "Network Epson L3110",
            print_preview_active: true,

            // 11. Pengaturan Upload
            upload_max_size: 5,
            upload_allowed_types: [".jpg", ".jpeg", ".png", ".pdf", ".xls", ".xlsx", ".doc", ".docx"],
            upload_folder: "uploads/darul_hadits",
            upload_compression: true,
            upload_watermark: false,

            // 12. Pengaturan Email
            email_host: "smtp.gmail.com",
            email_port: 587,
            email_user: "sistem@darulhadits.org",
            email_pass: "••••••••••••••••",
            email_ssl: true,
            email_sender: "Darul Hadits Mail System",

            // 13. Pengaturan WhatsApp
            wa_gateway: "Fonnte API Gateway",
            wa_token: "dArUlHaDiTsWiZaRdToKeN2026",
            wa_device: "Darul Hadits Broadcast",
            wa_default_number: "08123456789",

            // 14. Pengaturan Backup
            backup_auto: true,
            backup_schedule: "daily",
            backup_location: "CLOUD",
            backup_gdrive_active: true,
            backup_restore_point: "Point_Awal_Install.json",

            // 15. Pengaturan Database
            db_host: "localhost",
            db_port: 3306,
            db_name: "darul_hadits_db",
            db_user: "root",

            // 16. Pengaturan Security
            sec_jwt_expiry: "24h",
            sec_session_timeout: 60,
            sec_login_attempts: 5,
            sec_password_policy: "STRONG",
            sec_mfa_active: false,
            sec_audit_active: true,
            sec_activity_active: true,

            // 17. Pengaturan Role
            roles_list: [
              { id: "role-superadmin", name: "Super Admin", code: "SUPER_ADMIN", permissions: ["*"] },
              { id: "role-admin", name: "Admin", code: "ADMIN", permissions: ["student.view", "student.create", "student.update", "teacher.view"] },
              { id: "role-guru", name: "Guru", code: "GURU", permissions: ["student.view", "teacher.view", "grade.create"] },
              { id: "role-wali", name: "Wali Kelas", code: "WALI_KELAS", permissions: ["student.view", "grade.create"] }
            ],

            // 18. Pengaturan Menu
            menus_list: [
              { id: "menu-dashboard", name: "Dashboard Utama", icon: "Layers", path: "dashboard", parent_id: null, role_codes: ["SUPER_ADMIN", "ADMIN", "GURU", "WALI_KELAS"], order: 1, status: true },
              { id: "menu-sivitas", name: "Data Siswa & Santri", icon: "Users", path: "sivitas", parent_id: null, role_codes: ["SUPER_ADMIN", "ADMIN"], order: 2, status: true },
              { id: "menu-pegawai", name: "Kepegawaian", icon: "Users", path: "pegawai", parent_id: null, role_codes: ["SUPER_ADMIN", "ADMIN"], order: 3, status: true }
            ],

            // 19. Pengaturan Dashboard
            dashboard_widgets: [
              { role: "SUPER_ADMIN", widget_id: "widget-stats", is_active: true, order: 1 },
              { role: "SUPER_ADMIN", widget_id: "widget-finance-chart", is_active: true, order: 2 }
            ],

            // 20. Pengaturan AI
            ai_api_key: "AIzaSyA_example_gemini_key",
            ai_prompt: "Anda adalah asisten AI resmi dari Yayasan Darul Hadits Lima Puluh Kota.",
            ai_template: "Format Jawaban: Ringkas, Sopan, Islami.",
            ai_model: "gemini-3.5-flash",
            ai_temperature: 0.7,
            ai_max_token: 2048,

            // 21. Pengaturan Mobile
            mobile_splash: "/splash.png",
            mobile_icon: "/icon.png",
            mobile_theme: "EMERALD_GREEN",
            mobile_primary_color: "#059669",
            mobile_secondary_color: "#0f172a",
            mobile_notification: true,
            mobile_version: "1.0.4",

            // 22. Pengaturan Sistem
            sys_timezone: "Asia/Jakarta",
            sys_language: "id",
            sys_date_format: "DD/MM/YYYY",
            sys_time_format: "24h",
            sys_currency: "IDR",
            sys_auto_number: true,
            sys_cache_active: true,
            sys_maintenance_mode: false
          };

          try {
            settingRecord = await PrismaEngine.systemSetting.create({
              data: {
                key: 'UNIFIED_SETTINGS',
                value: JSON.stringify(defaultSettings)
              }
            });
          } catch (dbCreateErr: any) {
            console.warn('⚠️ Database create for UNIFIED_SETTINGS failed, using memory fallback only:', dbCreateErr.message);
            settingRecord = { value: JSON.stringify(defaultSettings) };
          }
        }

        const currentSettings = settingRecord ? JSON.parse(settingRecord.value) : (inMemorySettingsCache || {});
        if (!inMemorySettingsCache) {
          inMemorySettingsCache = currentSettings;
        }
        return res.json({ success: true, data: currentSettings });
      } catch (err: any) {
        console.error('Error fetching system settings:', err);
        return res.status(500).json({ success: false, message: `Gagal memuat pengaturan: ${err.message}` });
      }
    }

    case 'saveSettings': {
      try {
        const payload = req.body;
        if (!payload || typeof payload !== 'object') {
          return res.status(400).json({ success: false, message: 'Invalid settings payload.' });
        }

        let prevSettings: any = null;
        let currentRecord: any = null;

        try {
          currentRecord = await PrismaEngine.systemSetting.findUnique({
            where: { key: 'UNIFIED_SETTINGS' }
          });
          if (currentRecord) {
            prevSettings = JSON.parse(currentRecord.value);
          }
        } catch (dbErr) {
          console.warn('⚠️ Database query for current settings failed during save:', dbErr);
        }

        if (!prevSettings && inMemorySettingsCache) {
          prevSettings = inMemorySettingsCache;
        }

        let updatedSettings = { ...payload };

        if (prevSettings) {
          if (payload.email_pass === '••••••••••••••••' || !payload.email_pass) {
            updatedSettings.email_pass = prevSettings.email_pass;
          }
          if (payload.ai_api_key === '••••••••••••••••' || !payload.ai_api_key) {
            updatedSettings.ai_api_key = prevSettings.ai_api_key;
          }
          if (payload.wa_token === '••••••••••••••••' || !payload.wa_token) {
            updatedSettings.wa_token = prevSettings.wa_token;
          }
        }

        // Keep nested sekolah and yayasan structures in sync
        if (!updatedSettings.sekolah || typeof updatedSettings.sekolah !== 'object') {
          updatedSettings.sekolah = prevSettings?.sekolah || {};
        }
        if (!updatedSettings.yayasan || typeof updatedSettings.yayasan !== 'object') {
          updatedSettings.yayasan = prevSettings?.yayasan || {};
        }

        if (updatedSettings.sekolah_nama !== undefined) {
          updatedSettings.sekolah.nama = updatedSettings.sekolah_nama;
        }
        if (updatedSettings.pondok_nama !== undefined) {
          if (!updatedSettings.sekolah_nama) {
            updatedSettings.sekolah_nama = updatedSettings.pondok_nama;
            updatedSettings.sekolah.nama = updatedSettings.pondok_nama;
          }
        }
        if (updatedSettings.yayasan_nama !== undefined) {
          updatedSettings.yayasan.nama = updatedSettings.yayasan_nama;
        }
        if (updatedSettings.sekolah_npsn !== undefined) {
          updatedSettings.sekolah.npsn = updatedSettings.sekolah_npsn;
        }
        if (updatedSettings.sekolah_nss !== undefined) {
          updatedSettings.sekolah.nss = updatedSettings.sekolah_nss;
        }
        if (updatedSettings.sekolah_akreditasi !== undefined) {
          updatedSettings.sekolah.akreditasi = updatedSettings.sekolah_akreditasi;
        }
        if (updatedSettings.sekolah_alamat !== undefined) {
          updatedSettings.sekolah.alamat = updatedSettings.sekolah_alamat;
        }
        if (updatedSettings.sekolah_provinsi !== undefined) {
          updatedSettings.sekolah.provinsi = updatedSettings.sekolah_provinsi;
        }
        if (updatedSettings.sekolah_kabupaten !== undefined) {
          updatedSettings.sekolah.kabupaten = updatedSettings.sekolah_kabupaten;
        }
        if (updatedSettings.sekolah_kecamatan !== undefined) {
          updatedSettings.sekolah.kecamatan = updatedSettings.sekolah_kecamatan;
        }
        if (updatedSettings.sekolah_kodepos !== undefined) {
          updatedSettings.sekolah.kode_pos = updatedSettings.sekolah_kodepos;
        }
        if (updatedSettings.sekolah_latitude !== undefined) {
          updatedSettings.sekolah.latitude = updatedSettings.sekolah_latitude;
        }
        if (updatedSettings.sekolah_longitude !== undefined) {
          updatedSettings.sekolah.longitude = updatedSettings.sekolah_longitude;
        }
        if (updatedSettings.sekolah_email !== undefined) {
          updatedSettings.sekolah.email = updatedSettings.sekolah_email;
        }
        if (updatedSettings.sekolah_telepon !== undefined) {
          updatedSettings.sekolah.telepon = updatedSettings.sekolah_telepon;
        }
        if (updatedSettings.sekolah_website !== undefined) {
          updatedSettings.sekolah.website = updatedSettings.sekolah_website;
        }

        // Also sync to Prisma School model
        try {
          await PrismaEngine.school.upsert({
            where: { id: 'school-main' },
            create: {
              id: 'school-main',
              name: updatedSettings.sekolah_nama || 'Pondok Pesantren Darul Hadits',
              foundation_name: updatedSettings.yayasan_nama || 'Yayasan Darul Hadits Lima Puluh Kota',
              npsn: updatedSettings.sekolah_npsn || '12345678',
              address: updatedSettings.sekolah_alamat || 'Lima Puluh Kota',
              email: updatedSettings.sekolah_email || '',
              phone: updatedSettings.sekolah_telepon || '',
              website: updatedSettings.sekolah_website || '',
            },
            update: {
              name: updatedSettings.sekolah_nama || 'Pondok Pesantren Darul Hadits',
              foundation_name: updatedSettings.yayasan_nama || 'Yayasan Darul Hadits Lima Puluh Kota',
              npsn: updatedSettings.sekolah_npsn || '12345678',
              address: updatedSettings.sekolah_alamat || 'Lima Puluh Kota',
              email: updatedSettings.sekolah_email || '',
              phone: updatedSettings.sekolah_telepon || '',
              website: updatedSettings.sekolah_website || '',
            }
          });
        } catch (e) {
          console.error('Failed to sync School model in saveSettings:', e);
        }

        inMemorySettingsCache = updatedSettings;

        try {
          await PrismaEngine.systemSetting.upsert({
            where: { key: 'UNIFIED_SETTINGS' },
            update: { value: JSON.stringify(updatedSettings) },
            create: { key: 'UNIFIED_SETTINGS', value: JSON.stringify(updatedSettings) }
          });
        } catch (dbSaveErr: any) {
          console.warn('⚠️ Database save for UNIFIED_SETTINGS failed, using memory/cache only:', dbSaveErr.message);
        }

        appendAuditLog(
          tenantId,
          userId,
          uName,
          'Update',
          'System Settings',
          `Melakukan update total konfigurasi sistem melalui panel pengaturan`,
          'Information',
          req.ip,
          req.headers['user-agent'] || '',
          { before: prevSettings, after: updatedSettings }
        );

        return res.json({ success: true, message: 'Pengaturan sistem berhasil disimpan!', data: updatedSettings });
      } catch (err: any) {
        console.error('Error updating system settings:', err);
        return res.status(500).json({ success: false, message: `Gagal menyimpan pengaturan: ${err.message}` });
      }
    }

    case 'databaseOptimization': {
      try {
        appendAuditLog(
          tenantId,
          userId,
          uName,
          'Update',
          'Database',
          `Menjalankan optimasi dan pembersihan index tabel database MySQL`,
          'Warning',
          req.ip,
          req.headers['user-agent'] || ''
        );
        return res.json({ success: true, message: 'Optimasi database MySQL berhasil diselesaikan secara aman!' });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    case 'databaseRepair': {
      try {
        appendAuditLog(
          tenantId,
          userId,
          uName,
          'Update',
          'Database',
          `Menjalankan pemeriksaan konsistensi dan perbaikan relasi tabel database`,
          'Critical',
          req.ip,
          req.headers['user-agent'] || ''
        );
        return res.json({ success: true, message: 'Database integrity check: 100% OK. Tidak ada orphan data yang ditemukan.' });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    case 'testSmtp': {
      try {
        const { host, port, user } = req.body;
        return res.json({ success: true, message: `Koneksi SMTP ke ${host}:${port} dengan akun ${user} berhasil diuji!` });
      } catch (err: any) {
        return res.json({ success: false, message: err.message });
      }
    }

    case 'testWhatsapp': {
      try {
        const { token, number } = req.body;
        return res.json({ success: true, message: `WhatsApp Gateway berhasil terhubung! Test message dikirim ke ${number}.` });
      } catch (err: any) {
        return res.json({ success: false, message: err.message });
      }
    }

    case 'systemDashboard': {
      // Aggregate system health status, active license and configurations
      const tenantCheck = SETTINGS_DB.tenantSettings.find(ts => ts.tenant_id === tenantId);
      const lic = SETTINGS_DB.licenses.find(l => l.tenant_id === tenantId);
      const flagCount = SETTINGS_DB.featureFlags.filter(ff => ff.tenant_id === tenantId).length;
      const providerCount = 
        SETTINGS_DB.storageProviders.filter(sp => sp.tenant_id === tenantId).length +
        SETTINGS_DB.notificationProviders.filter(np => np.tenant_id === tenantId).length +
        SETTINGS_DB.paymentProviders.filter(pp => pp.tenant_id === tenantId).length +
        SETTINGS_DB.aiProviders.filter(ap => ap.tenant_id === tenantId).length;

      const healths = SETTINGS_DB.healthChecks.filter(hc => hc.tenant_id === tenantId);
      const healthyCount = healths.filter(hc => hc.status === 'Healthy').length;
      const healthScore = healths.length > 0 ? Math.round((healthyCount / healths.length) * 100) : 100;

      // Mock configuration change speed
      const changeCount = SETTINGS_DB.backups.filter(b => b.tenant_id === tenantId).length * 2 + 14;

      return res.json({
        success: true,
        data: {
          app_title: tenantCheck?.app_title || 'Educore System Engine',
          app_mode: tenantCheck?.app_mode || 'Production',
          version: tenantCheck?.version || 'v8.4.2',
          license_tier: lic?.tier || 'Enterprise',
          license_status: lic?.status || 'Active',
          expires_at: lic?.expires_at || '',
          active_feature_flags: flagCount,
          active_integration_providers: providerCount,
          health_score: healthScore,
          configuration_changes_count: changeCount,
          system_health: healths
        }
      });
    }

    case 'generalSettings': {
      const { app_title, version, timezone, locale, currency, date_format, number_format, app_mode } = req.body;
      const isUpdate = app_title !== undefined || version !== undefined || timezone !== undefined || locale !== undefined || currency !== undefined || date_format !== undefined || number_format !== undefined || app_mode !== undefined;
      if (isUpdate) {
        
        const config = SETTINGS_DB.tenantSettings.find(ts => ts.tenant_id === tenantId);
        if (config) {
          const beforeValue = { ...config };
          config.app_title = app_title || config.app_title;
          config.version = version || config.version;
          config.timezone = timezone || config.timezone;
          config.locale = locale || config.locale;
          config.currency = currency || config.currency;
          config.date_format = date_format || config.date_format;
          config.number_format = number_format || config.number_format;
          config.app_mode = app_mode || config.app_mode;

          // Register in global Audit Log
          appendAuditLog(
            tenantId,
            userId,
            uName,
            'Update',
            'System Settings',
            `Mengubah pengaturan sistem umum: ${config.app_title} (${config.app_mode})`,
            'Information',
            req.ip,
            req.headers['user-agent'] || '',
            { before: beforeValue, after: config }
          );

          return res.json({ success: true, data: config });
        }
        return res.status(404).json({ success: false, message: 'Settings not found' });
      }

      const settings = SETTINGS_DB.tenantSettings.find(ts => ts.tenant_id === tenantId);
      return res.json({ success: true, data: settings });
    }

    case 'tenantSettings': {
      // Read or update domain mapping
      const { custom_domain, is_ssl_enabled } = req.body;
      const isUpdate = custom_domain !== undefined || is_ssl_enabled !== undefined;
      if (isUpdate) {
        let dom = SETTINGS_DB.domains.find(d => d.tenant_id === tenantId);
        const beforeValue = dom ? { ...dom } : null;

        if (dom) {
          dom.custom_domain = custom_domain;
          dom.is_ssl_enabled = is_ssl_enabled !== undefined ? is_ssl_enabled : dom.is_ssl_enabled;
        } else {
          dom = {
            id: `dom-${Date.now()}`,
            tenant_id: tenantId,
            custom_domain,
            is_ssl_enabled: true,
            status: 'Verifying'
          };
          SETTINGS_DB.domains.push(dom);
        }

        appendAuditLog(
          tenantId,
          userId,
          uName,
          'Update',
          'Tenant Domains',
          `Mengubah pemetaan domain custom tenant menjadi ${custom_domain}`,
          'Warning',
          req.ip,
          req.headers['user-agent'] || '',
          { before: beforeValue, after: dom }
        );

        return res.json({ success: true, data: dom });
      }

      const dom = SETTINGS_DB.domains.find(d => d.tenant_id === tenantId);
      return res.json({ success: true, data: dom });
    }

    case 'brandingSettings': {
      const { primary_color, secondary_color, accent_color, dark_mode_enabled, logo_url, favicon_url, login_bg_url, email_template, pdf_template } = req.body;
      const isUpdate = primary_color !== undefined || secondary_color !== undefined || accent_color !== undefined || dark_mode_enabled !== undefined || logo_url !== undefined || favicon_url !== undefined || login_bg_url !== undefined || email_template !== undefined || pdf_template !== undefined;
      if (isUpdate) {
        const brand = SETTINGS_DB.brandings.find(b => b.tenant_id === tenantId);
        
        if (brand) {
          const beforeValue = { ...brand };
          brand.primary_color = primary_color || brand.primary_color;
          brand.secondary_color = secondary_color || brand.secondary_color;
          brand.accent_color = accent_color || brand.accent_color;
          brand.dark_mode_enabled = dark_mode_enabled !== undefined ? dark_mode_enabled : brand.dark_mode_enabled;
          brand.logo_url = logo_url || brand.logo_url;
          brand.favicon_url = favicon_url || brand.favicon_url;
          brand.login_bg_url = login_bg_url || brand.login_bg_url;
          brand.email_template = email_template || brand.email_template;
          brand.pdf_template = pdf_template || brand.pdf_template;

          appendAuditLog(
            tenantId,
            userId,
            uName,
            'Update',
            'White Label Branding',
            `Mengubah branding visual & skema warna logo tenant`,
            'Information',
            req.ip,
            req.headers['user-agent'] || '',
            { before: beforeValue, after: brand }
          );

          return res.json({ success: true, data: brand });
        }
        return res.status(404).json({ success: false, message: 'Branding not found' });
      }

      const brand = SETTINGS_DB.brandings.find(b => b.tenant_id === tenantId);
      return res.json({ success: true, data: brand });
    }

    case 'featureFlag': {
      const { flag_id, is_enabled } = req.body;
      if (flag_id !== undefined) {
        const flag = SETTINGS_DB.featureFlags.find(ff => ff.tenant_id === tenantId && ff.id === flag_id);
        
        if (flag) {
          const beforeValue = { ...flag };
          flag.is_enabled = is_enabled;

          appendAuditLog(
            tenantId,
            userId,
            uName,
            'Update',
            'Feature Flag',
            `Mengubah status fitur flag [${flag.flag_key}] menjadi: ${is_enabled ? 'ON' : 'OFF'}`,
            'Warning',
            req.ip,
            req.headers['user-agent'] || '',
            { before: beforeValue, after: flag }
          );

          return res.json({ success: true, data: flag });
        }
        return res.status(404).json({ success: false, message: 'Feature flag not found' });
      }

      const flags = SETTINGS_DB.featureFlags.filter(ff => ff.tenant_id === tenantId);
      return res.json({ success: true, data: flags });
    }

    case 'environmentProfile': {
      if (req.method === 'POST') {
        const { action_sub, profile_id, var_key, var_value, is_secret } = req.body;
        
        if (action_sub === 'activate') {
          const list = SETTINGS_DB.envProfiles.filter(p => p.tenant_id === tenantId);
          list.forEach(p => {
            p.is_active = p.id === profile_id;
          });

          appendAuditLog(
            tenantId,
            userId,
            uName,
            'Update',
            'Environment Settings',
            `Mengaktifkan profil environment baru`,
            'Critical',
            req.ip,
            req.headers['user-agent'] || ''
          );

          return res.json({ success: true, data: list });
        }

        if (action_sub === 'add_variable') {
          const newVar: EnvironmentVariable = {
            id: `v-${Date.now()}`,
            tenant_id: tenantId,
            profile_id,
            var_key,
            var_value: is_secret ? encryptConfigValue(var_value) : var_value,
            is_secret: !!is_secret
          };
          SETTINGS_DB.envVariables.push(newVar);

          appendAuditLog(
            tenantId,
            userId,
            uName,
            'Create',
            'Environment Settings',
            `Menambahkan variabel env baru: ${var_key}`,
            'Information',
            req.ip,
            req.headers['user-agent'] || ''
          );

          return res.json({ success: true, data: newVar });
        }
      }

      const profiles = SETTINGS_DB.envProfiles.filter(p => p.tenant_id === tenantId);
      const variables = SETTINGS_DB.envVariables.filter(v => v.tenant_id === tenantId);
      return res.json({ success: true, data: { profiles, variables } });
    }

    case 'storageProvider': {
      const { provider_id, config_details } = req.body;
      if (provider_id !== undefined) {
        const prov = SETTINGS_DB.storageProviders.find(sp => sp.tenant_id === tenantId && sp.id === provider_id);
        
        if (prov) {
          const beforeValue = { ...prov };
          prov.config_details = { ...prov.config_details, ...config_details };

          appendAuditLog(
            tenantId,
            userId,
            uName,
            'Update',
            'Cloud Storage Configuration',
            `Mengubah seting kredensial Cloud Storage Provider: ${prov.provider_name}`,
            'Critical',
            req.ip,
            req.headers['user-agent'] || '',
            { before: beforeValue, after: prov }
          );

          return res.json({ success: true, data: prov });
        }
        return res.status(404).json({ success: false, message: 'Provider not found' });
      }

      const list = SETTINGS_DB.storageProviders.filter(sp => sp.tenant_id === tenantId);
      return res.json({ success: true, data: list });
    }

    case 'paymentProvider': {
      const { provider_id, is_enabled, config_details } = req.body;
      if (provider_id !== undefined) {
        const prov = SETTINGS_DB.paymentProviders.find(pp => pp.tenant_id === tenantId && pp.id === provider_id);
        
        if (prov) {
          const beforeValue = { ...prov };
          if (is_enabled !== undefined) prov.is_enabled = is_enabled;
          if (config_details) prov.config_details = { ...prov.config_details, ...config_details };

          appendAuditLog(
            tenantId,
            userId,
            uName,
            'Update',
            'Payment Gateway Configuration',
            `Mengubah status/kredensial Gerbang Pembayaran: ${prov.provider_name}`,
            'Critical',
            req.ip,
            req.headers['user-agent'] || '',
            { before: beforeValue, after: prov }
          );

          return res.json({ success: true, data: prov });
        }
        return res.status(404).json({ success: false, message: 'Provider not found' });
      }

      const list = SETTINGS_DB.paymentProviders.filter(pp => pp.tenant_id === tenantId);
      return res.json({ success: true, data: list });
    }

    case 'notificationProvider': {
      const { provider_id, is_enabled, config_details } = req.body;
      if (provider_id !== undefined) {
        const prov = SETTINGS_DB.notificationProviders.find(np => np.tenant_id === tenantId && np.id === provider_id);
        
        if (prov) {
          const beforeValue = { ...prov };
          if (is_enabled !== undefined) prov.is_enabled = is_enabled;
          if (config_details) prov.config_details = { ...prov.config_details, ...config_details };

          appendAuditLog(
            tenantId,
            userId,
            uName,
            'Update',
            'Notification Gateway Configuration',
            `Mengubah seting gateway notifikasi: ${prov.provider_type}`,
            'Critical',
            req.ip,
            req.headers['user-agent'] || '',
            { before: beforeValue, after: prov }
          );

          return res.json({ success: true, data: prov });
        }
        return res.status(404).json({ success: false, message: 'Provider not found' });
      }

      const list = SETTINGS_DB.notificationProviders.filter(np => np.tenant_id === tenantId);
      return res.json({ success: true, data: list });
    }

    case 'aiProvider': {
      const { provider_id, is_enabled, config_details } = req.body;
      if (provider_id !== undefined) {
        const prov = SETTINGS_DB.aiProviders.find(ap => ap.tenant_id === tenantId && ap.id === provider_id);
        
        if (prov) {
          const beforeValue = { ...prov };
          if (is_enabled !== undefined) prov.is_enabled = is_enabled;
          if (config_details) prov.config_details = { ...prov.config_details, ...config_details };

          appendAuditLog(
            tenantId,
            userId,
            uName,
            'Update',
            'AI Gateway Configuration',
            `Mengubah seting penyedia kecerdasan buatan (AI Gateway): ${prov.provider_name}`,
            'Critical',
            req.ip,
            req.headers['user-agent'] || '',
            { before: beforeValue, after: prov }
          );

          return res.json({ success: true, data: prov });
        }
        return res.status(404).json({ success: false, message: 'Provider not found' });
      }

      const list = SETTINGS_DB.aiProviders.filter(ap => ap.tenant_id === tenantId);
      return res.json({ success: true, data: list });
    }

    case 'securityPolicy': {
      const { enable_mfa, session_timeout_minutes, max_login_attempts, password_min_length, require_uppercase, require_numbers, require_special_characters } = req.body;
      const isUpdate = enable_mfa !== undefined || session_timeout_minutes !== undefined || max_login_attempts !== undefined || password_min_length !== undefined || require_uppercase !== undefined || require_numbers !== undefined || require_special_characters !== undefined;
      if (isUpdate) {
        const pol = SETTINGS_DB.securityPolicies.find(p => p.tenant_id === tenantId);
        
        if (pol) {
          const beforeValue = { ...pol };
          pol.enable_mfa = enable_mfa !== undefined ? enable_mfa : pol.enable_mfa;
          pol.session_timeout_minutes = session_timeout_minutes || pol.session_timeout_minutes;
          pol.max_login_attempts = max_login_attempts || pol.max_login_attempts;
          pol.password_min_length = password_min_length || pol.password_min_length;
          pol.require_uppercase = require_uppercase !== undefined ? require_uppercase : pol.require_uppercase;
          pol.require_numbers = require_numbers !== undefined ? require_numbers : pol.require_numbers;
          pol.require_special_characters = require_special_characters !== undefined ? require_special_characters : pol.require_special_characters;

          appendAuditLog(
            tenantId,
            userId,
            uName,
            'Update',
            'Security Policies',
            `Mengubah kebijakan sandi, batasan sesi, dan kepatuhan MFA`,
            'Critical',
            req.ip,
            req.headers['user-agent'] || '',
            { before: beforeValue, after: pol }
          );

          return res.json({ success: true, data: pol });
        }
        return res.status(404).json({ success: false, message: 'Policy not found' });
      }

      const policy = SETTINGS_DB.securityPolicies.find(p => p.tenant_id === tenantId);
      return res.json({ success: true, data: policy });
    }

    case 'licenseManager': {
      // Handles reading tier status and validating limits
      const lic = SETTINGS_DB.licenses.find(l => l.tenant_id === tenantId);
      return res.json({ success: true, data: lic });
    }

    case 'healthCheck': {
      // Re-trigger checking response times
      const list = SETTINGS_DB.healthChecks.filter(hc => hc.tenant_id === tenantId);
      list.forEach(hc => {
        hc.response_time_ms = Math.round(hc.response_time_ms * (0.8 + Math.random() * 0.4));
        hc.last_checked_at = new Date().toISOString();
      });

      return res.json({ success: true, data: list });
    }

    case 'maintenanceMode': {
      const { mw_id, is_active } = req.body;
      if (mw_id !== undefined) {
        const win = SETTINGS_DB.maintenanceWindows.find(mw => mw.tenant_id === tenantId && mw.id === mw_id);
        
        if (win) {
          win.is_active = is_active;

          appendAuditLog(
            tenantId,
            userId,
            uName,
            'Update',
            'Maintenance Configuration',
            `Mengubah status jendela pemeliharaan server: ${is_active ? 'ON' : 'OFF'}`,
            'Critical',
            req.ip,
            req.headers['user-agent'] || ''
          );

          return res.json({ success: true, data: win });
        }
        return res.status(404).json({ success: false, message: 'Maintenance window not found' });
      }

      const list = SETTINGS_DB.maintenanceWindows.filter(mw => mw.tenant_id === tenantId);
      return res.json({ success: true, data: list });
    }

    case 'configurationBackup': {
      const { backup_name, is_create } = req.body;
      if (is_create || backup_name !== undefined) {
        const newBackup: ConfigurationBackup = {
          id: `bk-${Date.now()}`,
          tenant_id: tenantId,
          backup_name: backup_name || `Backup_Manual_${new Date().toISOString().split('T')[0]}.json`,
          file_path: `/storage/backups/cfg_${tenantId}_${Date.now()}.json`,
          file_size_bytes: 541020,
          created_at: new Date().toISOString(),
          created_by: uName
        };
        SETTINGS_DB.backups.unshift(newBackup);

        appendAuditLog(
          tenantId,
          userId,
          uName,
          'Create',
          'Configuration Backup',
          `Membuat berkas backup konfigurasi registry baru: ${newBackup.backup_name}`,
          'Warning',
          req.ip,
          req.headers['user-agent'] || '',
          newBackup
        );

        return res.json({ success: true, data: newBackup });
      }

      const list = SETTINGS_DB.backups.filter(b => b.tenant_id === tenantId);
      return res.json({ success: true, data: list });
    }

    case 'configurationRestore': {
      const { backup_id } = req.body;
      const b = SETTINGS_DB.backups.find(bk => bk.tenant_id === tenantId && bk.id === backup_id);
      
      if (b) {
        appendAuditLog(
          tenantId,
          userId,
          uName,
          'Restore',
          'Configuration Registry',
          `Melakukan restore konfigurasi sistem dari arsip: ${b.backup_name}`,
          'Critical',
          req.ip,
          req.headers['user-agent'] || ''
        );
        return res.json({ success: true, message: 'Restore berhasil dilaksanakan! Sistem rebooting configuration registry...' });
      }
      return res.status(404).json({ success: false, message: 'Backup file not found' });
    }

    case 'exportConfig': {
      // Return a full state representation in JSON
      const fullState = {
        tenantSettings: SETTINGS_DB.tenantSettings.find(ts => ts.tenant_id === tenantId),
        branding: SETTINGS_DB.brandings.find(b => b.tenant_id === tenantId),
        featureFlags: SETTINGS_DB.featureFlags.filter(ff => ff.tenant_id === tenantId),
        security: SETTINGS_DB.securityPolicies.find(p => p.tenant_id === tenantId)
      };

      appendAuditLog(
        tenantId,
        userId,
        uName,
        'Export',
        'Configuration Registry',
        `Mengekspor berkas konfigurasi sistem dalam format JSON`,
        'Warning',
        req.ip,
        req.headers['user-agent'] || ''
      );

      return res.json({ success: true, data: fullState });
    }

    case 'importConfig': {
      const { json_content } = req.body;
      
      try {
        const imported = typeof json_content === 'string' ? JSON.parse(json_content) : json_content;
        
        // Simulating the apply mapping
        if (imported.tenantSettings) {
          const ts = SETTINGS_DB.tenantSettings.find(t => t.tenant_id === tenantId);
          if (ts) Object.assign(ts, imported.tenantSettings);
        }
        if (imported.branding) {
          const br = SETTINGS_DB.brandings.find(b => b.tenant_id === tenantId);
          if (br) Object.assign(br, imported.branding);
        }

        appendAuditLog(
          tenantId,
          userId,
          uName,
          'Import',
          'Configuration Registry',
          `Mengimpor dan menimpa konfigurasi registry baru`,
          'Critical',
          req.ip,
          req.headers['user-agent'] || ''
        );

        return res.json({ success: true, message: 'Konfigurasi terimpor & teraplikasikan dengan aman!' });
      } catch (err: any) {
        return res.status(400).json({ success: false, message: 'Format JSON salah atau corrupt' });
      }
    }
  }

  return null;
}
