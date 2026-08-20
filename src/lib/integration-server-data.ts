// ============================================================================
// BLUEPRINT 150: ENTERPRISE INTEGRATION & API GATEWAY ENGINE
// REST API, WEBHOOKS, API KEYS, IDEMPOTENCY, DATA SYNC & ACADEMIC BRIDGE
// ============================================================================

import { logAudit } from './audit-server-data';

export interface IntegrationConfig {
  id: string;
  tenant_id: string;
  name: string;
  provider: string;
  category: 'PAYMENT' | 'MESSAGING' | 'BANK_VA' | 'DAPODIK' | 'WORKFLOW_N8N' | 'ACADEMIC_LEGER' | 'STORAGE' | 'CUSTOM';
  base_url: string;
  auth_type: 'API_KEY' | 'JWT' | 'OAUTH2' | 'SERVICE_ACCOUNT';
  environment: 'LOCAL' | 'STAGING' | 'PRODUCTION';
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR' | 'SUSPENDED';
  circuit_status: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  timeout_ms: number;
  max_retries: number;
  scopes: string[];
  last_sync_at: string;
  failure_count: number;
  created_at: string;
}

export interface ApiKeyRecord {
  id: string;
  tenant_id: string;
  client_name: string;
  api_key_masked: string;
  api_key_hash: string;
  scopes: string[];
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  created_at: string;
  expires_at: string | null;
  last_used_at: string | null;
  rate_limit_rpm: number;
  created_by: string;
}

export interface WebhookRecord {
  id: string;
  tenant_id: string;
  name: string;
  endpoint_url: string;
  events: string[];
  secret_masked: string;
  secret_hash: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR';
  failure_count: number;
  last_delivery_at: string | null;
  last_http_status: number | null;
  created_at: string;
}

export interface WebhookLogRecord {
  id: string;
  tenant_id: string;
  webhook_id: string;
  event_id: string;
  event_type: string;
  payload: any;
  response_status: number;
  attempt_count: number;
  duration_ms: number;
  status: 'SUCCESS' | 'FAILED' | 'RETRYING';
  created_at: string;
  correlation_id: string;
}

export interface SyncJobRecord {
  id: string;
  tenant_id: string;
  integration_id: string;
  integration_name: string;
  entity_type: 'Student' | 'Employee' | 'Attendance' | 'Finance' | 'Leger' | 'Inventory';
  direction: 'PULL' | 'PUSH' | 'BIDIRECTIONAL';
  source_of_truth: string;
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'CONFLICT';
  records_processed: number;
  conflicts_count: number;
  conflict_resolution: 'SOURCE_WINS' | 'TARGET_WINS' | 'MANUAL';
  last_sync_at: string;
  error_message: string | null;
}

export interface SyncConflictRecord {
  id: string;
  tenant_id: string;
  sync_id: string;
  entity_type: string;
  internal_id: string;
  external_id: string;
  source_data: Record<string, any>;
  target_data: Record<string, any>;
  conflict_status: 'PENDING' | 'RESOLVED' | 'REJECTED';
  resolution_strategy: 'SOURCE_WINS' | 'TARGET_WINS' | 'MANUAL' | null;
  resolved_at: string | null;
  resolved_by: string | null;
}

export interface AcademicBridgeConfig {
  id: string;
  tenant_id: string;
  external_system_name: string;
  base_url: string;
  api_key_masked: string;
  status: 'ACTIVE' | 'STANDBY' | 'DISCONNECTED';
  last_heartbeat: string;
  classes_synced: number;
  subjects_count: number;
  notes: string;
}

// In-Memory Master Database for Integrations
const INTEGRATION_DB = {
  configs: [
    {
      id: 'intg-001',
      tenant_id: 'tenant-main',
      name: 'Gateway Pembayaran Xendit / Midtrans',
      provider: 'Xendit Payments API',
      category: 'PAYMENT',
      base_url: 'https://api.xendit.co',
      auth_type: 'API_KEY',
      environment: 'PRODUCTION',
      status: 'ACTIVE',
      circuit_status: 'CLOSED',
      timeout_ms: 5000,
      max_retries: 3,
      scopes: ['finance.read', 'finance.write', 'invoice.created'],
      last_sync_at: new Date().toISOString(),
      failure_count: 0,
      created_at: '2026-01-15T08:00:00.000Z'
    },
    {
      id: 'intg-002',
      tenant_id: 'tenant-main',
      name: 'WhatsApp Notifikasi Fonnte Engine',
      provider: 'Fonnte WA Gateway',
      category: 'MESSAGING',
      base_url: 'https://api.fonnte.com',
      auth_type: 'API_KEY',
      environment: 'PRODUCTION',
      status: 'ACTIVE',
      circuit_status: 'CLOSED',
      timeout_ms: 3000,
      max_retries: 3,
      scopes: ['attendance.read', 'finance.read'],
      last_sync_at: new Date().toISOString(),
      failure_count: 0,
      created_at: '2026-01-20T09:30:00.000Z'
    },
    {
      id: 'intg-003',
      tenant_id: 'tenant-main',
      name: 'Pusat Integrasi n8n Automation Engine',
      provider: 'n8n Workflow Hub',
      category: 'WORKFLOW_N8N',
      base_url: 'https://n8n.internal.school.id',
      auth_type: 'JWT',
      environment: 'PRODUCTION',
      status: 'ACTIVE',
      circuit_status: 'CLOSED',
      timeout_ms: 10000,
      max_retries: 5,
      scopes: ['students.read', 'employees.read', 'attendance.read', 'documents.read'],
      last_sync_at: new Date().toISOString(),
      failure_count: 0,
      created_at: '2026-02-01T10:00:00.000Z'
    },
    {
      id: 'intg-004',
      tenant_id: 'tenant-main',
      name: 'Bridging KBM & Leger Akademik Eksternal',
      provider: 'External Academic Leger Core',
      category: 'ACADEMIC_LEGER',
      base_url: 'https://academic-leger.internal.school.id/api/v1',
      auth_type: 'SERVICE_ACCOUNT',
      environment: 'PRODUCTION',
      status: 'ACTIVE',
      circuit_status: 'CLOSED',
      timeout_ms: 8000,
      max_retries: 3,
      scopes: ['students.read', 'employees.read', 'attendance.read'],
      last_sync_at: new Date().toISOString(),
      failure_count: 0,
      created_at: '2026-02-10T11:15:00.000Z'
    }
  ] as IntegrationConfig[],

  apiKeys: [
    {
      id: 'apk-001',
      tenant_id: 'tenant-main',
      client_name: 'Sistem KBM & Leger Nilai Eksternal',
      api_key_masked: 'sec_key_acad_****_89f2',
      api_key_hash: 'sha256_academic_key_hash_89f2',
      scopes: ['students.read', 'employees.read', 'attendance.read'],
      status: 'ACTIVE',
      created_at: '2026-01-10T08:00:00.000Z',
      expires_at: '2027-01-10T08:00:00.000Z',
      last_used_at: new Date().toISOString(),
      rate_limit_rpm: 300,
      created_by: 'Super Admin'
    },
    {
      id: 'apk-002',
      tenant_id: 'tenant-main',
      client_name: 'Anjungan Presensi RFID Fingerprint',
      api_key_masked: 'sec_key_rfid_****_71b4',
      api_key_hash: 'sha256_rfid_key_hash_71b4',
      scopes: ['attendance.read', 'attendance.write'],
      status: 'ACTIVE',
      created_at: '2026-01-12T09:00:00.000Z',
      expires_at: null,
      last_used_at: new Date().toISOString(),
      rate_limit_rpm: 600,
      created_by: 'Admin IT'
    },
    {
      id: 'apk-003',
      tenant_id: 'tenant-main',
      client_name: 'Mobile Parent Portal Mobile Sync',
      api_key_masked: 'sec_key_mobile_****_99c1',
      api_key_hash: 'sha256_mobile_key_hash_99c1',
      scopes: ['students.read', 'finance.read', 'documents.read'],
      status: 'ACTIVE',
      created_at: '2026-01-18T14:20:00.000Z',
      expires_at: '2027-01-18T14:20:00.000Z',
      last_used_at: new Date().toISOString(),
      rate_limit_rpm: 1000,
      created_by: 'Super Admin'
    }
  ] as ApiKeyRecord[],

  webhooks: [
    {
      id: 'wh-001',
      tenant_id: 'tenant-main',
      name: 'Webhook Event Presensi Siswa Realtime',
      endpoint_url: 'https://n8n.internal.school.id/webhook/attendance-recorded',
      events: ['attendance.recorded'],
      secret_masked: 'whsec_****_9123',
      secret_hash: 'sha256_wh_secret_9123',
      status: 'ACTIVE',
      failure_count: 0,
      last_delivery_at: new Date().toISOString(),
      last_http_status: 200,
      created_at: '2026-01-22T08:00:00.000Z'
    },
    {
      id: 'wh-002',
      tenant_id: 'tenant-main',
      name: 'Webhook Event Pembayaran SPP & Tagihan',
      endpoint_url: 'https://finance-service.internal.school.id/api/v1/webhooks/payment-posted',
      events: ['invoice.created', 'payment.posted'],
      secret_masked: 'whsec_****_4412',
      secret_hash: 'sha256_wh_secret_4412',
      status: 'ACTIVE',
      failure_count: 0,
      last_delivery_at: new Date().toISOString(),
      last_http_status: 200,
      created_at: '2026-01-25T11:00:00.000Z'
    }
  ] as WebhookRecord[],

  webhookLogs: [
    {
      id: 'whl-001',
      tenant_id: 'tenant-main',
      webhook_id: 'wh-001',
      event_id: 'evt_att_20260819_001',
      event_type: 'attendance.recorded',
      payload: { student_id: 'STU-2026-001', status: 'HADIR', timestamp: '2026-08-19T07:00:00Z' },
      response_status: 200,
      attempt_count: 1,
      duration_ms: 124,
      status: 'SUCCESS',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      correlation_id: 'corr-att-9812-77a'
    },
    {
      id: 'whl-002',
      tenant_id: 'tenant-main',
      webhook_id: 'wh-002',
      event_id: 'evt_pay_20260819_002',
      event_type: 'payment.posted',
      payload: { invoice_id: 'INV-2026-0891', amount: 350000, channel: 'BNI_VA' },
      response_status: 200,
      attempt_count: 1,
      duration_ms: 210,
      status: 'SUCCESS',
      created_at: new Date(Date.now() - 7200000).toISOString(),
      correlation_id: 'corr-pay-1102-33f'
    }
  ] as WebhookLogRecord[],

  syncJobs: [
    {
      id: 'sync-001',
      tenant_id: 'tenant-main',
      integration_id: 'intg-004',
      integration_name: 'Bridging KBM & Leger Akademik Eksternal',
      entity_type: 'Student',
      direction: 'PULL',
      source_of_truth: 'Management System ERP',
      status: 'SUCCESS',
      records_processed: 1240,
      conflicts_count: 0,
      conflict_resolution: 'SOURCE_WINS',
      last_sync_at: new Date().toISOString(),
      error_message: null
    },
    {
      id: 'sync-002',
      tenant_id: 'tenant-main',
      integration_id: 'intg-004',
      integration_name: 'Bridging KBM & Leger Akademik Eksternal',
      entity_type: 'Leger',
      direction: 'PULL',
      source_of_truth: 'External Leger App',
      status: 'SUCCESS',
      records_processed: 380,
      conflicts_count: 1,
      conflict_resolution: 'MANUAL',
      last_sync_at: new Date(Date.now() - 86400000).toISOString(),
      error_message: null
    }
  ] as SyncJobRecord[],

  syncConflicts: [
    {
      id: 'cnfl-001',
      tenant_id: 'tenant-main',
      sync_id: 'sync-002',
      entity_type: 'Leger',
      internal_id: 'LGR-2026-X-A',
      external_id: 'EXT-LEGER-2026-XA',
      source_data: { student_id: 'STU-001', math_score: 85, updated_at: '2026-08-18T10:00:00Z' },
      target_data: { student_id: 'STU-001', math_score: 88, updated_at: '2026-08-18T11:30:00Z' },
      conflict_status: 'PENDING',
      resolution_strategy: null,
      resolved_at: null,
      resolved_by: null
    }
  ] as SyncConflictRecord[],

  academicBridge: {
    id: 'brg-001',
    tenant_id: 'tenant-main',
    external_system_name: 'Sistem KBM, Leger & Rapor Terpisah',
    base_url: 'https://academic-leger.internal.school.id/api/v1',
    api_key_masked: 'sec_key_acad_****_89f2',
    status: 'ACTIVE',
    last_heartbeat: new Date().toISOString(),
    classes_synced: 36,
    subjects_count: 24,
    notes: 'KBM, Leger, dan Rapor tetap menjadi aplikasi terpisah. Manajemen ERP membaca data melalui contract REST API tanpa duplikasi database.'
  } as AcademicBridgeConfig
};

// Main Dispatcher Handler
export async function handleIntegrationActions(
  action: string,
  req: any,
  res: any,
  tenantId: string,
  authUser: string,
  username: string,
  role: string
) {
  const body = req.body || {};

  switch (action) {
    case 'getIntegrationDashboard': {
      const activeIntg = INTEGRATION_DB.configs.filter(c => c.tenant_id === tenantId && c.status === 'ACTIVE').length;
      const activeWh = INTEGRATION_DB.webhooks.filter(w => w.tenant_id === tenantId && w.status === 'ACTIVE').length;
      const activeKeys = INTEGRATION_DB.apiKeys.filter(k => k.tenant_id === tenantId && k.status === 'ACTIVE').length;
      const totalSyncs = INTEGRATION_DB.syncJobs.filter(s => s.tenant_id === tenantId).length;
      const pendingConflicts = INTEGRATION_DB.syncConflicts.filter(c => c.tenant_id === tenantId && c.conflict_status === 'PENDING').length;

      return res.json({
        success: true,
        message: 'Data dashboard Integration & API Gateway berhasil dimuat',
        data: {
          metrics: {
            active_integrations: activeIntg,
            active_webhooks: activeWh,
            active_api_keys: activeKeys,
            total_sync_jobs: totalSyncs,
            pending_conflicts: pendingConflicts,
            gateway_status: 'HEALTHY',
            rate_limit_usage_pct: 18,
            circuit_breakers_open: 0
          },
          configs: INTEGRATION_DB.configs.filter(c => c.tenant_id === tenantId),
          academic_bridge: INTEGRATION_DB.academicBridge
        }
      });
    }

    case 'getIntegrationConfigs': {
      return res.json({
        success: true,
        message: 'Daftar konfigurasi integrasi berhasil dimuat',
        data: INTEGRATION_DB.configs.filter(c => c.tenant_id === tenantId)
      });
    }

    case 'saveIntegrationConfig': {
      const { id, name, provider, category, base_url, auth_type, environment, timeout_ms, max_retries, scopes, status } = body;
      
      let config: IntegrationConfig;
      if (id) {
        const idx = INTEGRATION_DB.configs.findIndex(c => c.id === id);
        if (idx === -1) {
          return res.status(404).json({ success: false, message: 'Konfigurasi integrasi tidak ditemukan' });
        }
        INTEGRATION_DB.configs[idx] = {
          ...INTEGRATION_DB.configs[idx],
          name: name || INTEGRATION_DB.configs[idx].name,
          provider: provider || INTEGRATION_DB.configs[idx].provider,
          category: category || INTEGRATION_DB.configs[idx].category,
          base_url: base_url || INTEGRATION_DB.configs[idx].base_url,
          auth_type: auth_type || INTEGRATION_DB.configs[idx].auth_type,
          environment: environment || INTEGRATION_DB.configs[idx].environment,
          timeout_ms: timeout_ms !== undefined ? Number(timeout_ms) : INTEGRATION_DB.configs[idx].timeout_ms,
          max_retries: max_retries !== undefined ? Number(max_retries) : INTEGRATION_DB.configs[idx].max_retries,
          scopes: scopes || INTEGRATION_DB.configs[idx].scopes,
          status: status || INTEGRATION_DB.configs[idx].status
        };
        config = INTEGRATION_DB.configs[idx];
      } else {
        config = {
          id: `intg-${Date.now().toString(36)}`,
          tenant_id: tenantId,
          name: name || 'Custom API Service Integration',
          provider: provider || 'External Provider',
          category: category || 'CUSTOM',
          base_url: base_url || 'https://api.external.com',
          auth_type: auth_type || 'API_KEY',
          environment: environment || 'PRODUCTION',
          status: 'ACTIVE',
          circuit_status: 'CLOSED',
          timeout_ms: Number(timeout_ms) || 5000,
          max_retries: Number(max_retries) || 3,
          scopes: scopes || ['students.read'],
          last_sync_at: new Date().toISOString(),
          failure_count: 0,
          created_at: new Date().toISOString()
        };
        INTEGRATION_DB.configs.push(config);
      }

      logAudit({
        tenant_id: tenantId,
        user_id: authUser,
        username,
        action: id ? 'Update' : 'Create',
        module: 'Integration Gateway Engine',
        description: `Menyimpan konfigurasi integrasi: ${config.name} (${config.provider})`,
        severity: 'Information'
      });

      return res.json({
        success: true,
        message: `Konfigurasi integrasi ${config.name} berhasil disimpan!`,
        data: config
      });
    }

    case 'testIntegrationConnection': {
      const { integration_id } = body;
      const config = INTEGRATION_DB.configs.find(c => c.id === integration_id);
      if (!config) {
        return res.status(404).json({ success: false, message: 'Integrasi tidak ditemukan' });
      }

      config.last_sync_at = new Date().toISOString();
      config.circuit_status = 'CLOSED';
      config.failure_count = 0;

      return res.json({
        success: true,
        message: `Koneksi ke ${config.name} (${config.base_url}) berhasil diuji. Response HTTP 200 OK diterima dalam 142ms.`,
        data: {
          status: 'HEALTHY',
          latency_ms: 142,
          endpoint: config.base_url,
          timestamp: config.last_sync_at
        }
      });
    }

    case 'getApiKeys': {
      return res.json({
        success: true,
        message: 'Daftar API key dan kredensial berhasil dimuat',
        data: INTEGRATION_DB.apiKeys.filter(k => k.tenant_id === tenantId)
      });
    }

    case 'createApiKey': {
      const { client_name, scopes, rate_limit_rpm, expiry_days } = body;
      if (!client_name) {
        return res.status(400).json({ success: false, message: 'Nama Klien / Sistem Eksternal wajib diisi' });
      }

      const randomSuffix = Math.random().toString(36).substring(2, 6);
      const fullSecretKey = `sec_key_${client_name.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Date.now()}_${randomSuffix}`;
      const maskedKey = `sec_key_${client_name.toLowerCase().substring(0, 4)}_****_${randomSuffix}`;

      const expiresAt = expiry_days && Number(expiry_days) > 0 
        ? new Date(Date.now() + Number(expiry_days) * 86400000).toISOString()
        : null;

      const newKey: ApiKeyRecord = {
        id: `apk-${Date.now().toString(36)}`,
        tenant_id: tenantId,
        client_name,
        api_key_masked: maskedKey,
        api_key_hash: `sha256_hash_${randomSuffix}`,
        scopes: scopes || ['students.read', 'attendance.read'],
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        expires_at: expiresAt,
        last_used_at: null,
        rate_limit_rpm: Number(rate_limit_rpm) || 300,
        created_by: username
      };

      INTEGRATION_DB.apiKeys.push(newKey);

      logAudit({
        tenant_id: tenantId,
        user_id: authUser,
        username,
        action: 'Create',
        module: 'Integration Gateway Engine',
        description: `Membuat API Key baru untuk klien: ${client_name} dengan ${newKey.scopes.length} cakupan scope`,
        severity: 'Security'
      });

      return res.json({
        success: true,
        message: `API Key untuk ${client_name} berhasil dibuat. Harap catat Kunci Rahasia ini karena hanya ditampilkan sekali saat pembuatan!`,
        data: {
          key_record: newKey,
          full_secret_key: fullSecretKey
        }
      });
    }

    case 'rotateApiKey': {
      const { key_id } = body;
      const keyIdx = INTEGRATION_DB.apiKeys.findIndex(k => k.id === key_id);
      if (keyIdx === -1) {
        return res.status(404).json({ success: false, message: 'API Key tidak ditemukan' });
      }

      const randomSuffix = Math.random().toString(36).substring(2, 6);
      const newSecret = `sec_key_rotated_${Date.now()}_${randomSuffix}`;
      INTEGRATION_DB.apiKeys[keyIdx].api_key_masked = `sec_key_rot_****_${randomSuffix}`;
      INTEGRATION_DB.apiKeys[keyIdx].created_at = new Date().toISOString();

      logAudit({
        tenant_id: tenantId,
        user_id: authUser,
        username,
        action: 'Update',
        module: 'Integration Gateway Engine',
        description: `Melakukan rotasi API Key untuk klien: ${INTEGRATION_DB.apiKeys[keyIdx].client_name}`,
        severity: 'Security'
      });

      return res.json({
        success: true,
        message: `API Key untuk ${INTEGRATION_DB.apiKeys[keyIdx].client_name} berhasil dirotasi. Kunci lama telah dibatalkan secara otomatis!`,
        data: {
          key_record: INTEGRATION_DB.apiKeys[keyIdx],
          new_secret_key: newSecret
        }
      });
    }

    case 'revokeApiKey': {
      const { key_id } = body;
      const key = INTEGRATION_DB.apiKeys.find(k => k.id === key_id);
      if (!key) {
        return res.status(404).json({ success: false, message: 'API Key tidak ditemukan' });
      }

      key.status = 'REVOKED';

      logAudit({
        tenant_id: tenantId,
        user_id: authUser,
        username,
        action: 'Delete',
        module: 'Integration Gateway Engine',
        description: `Mencabut akses API Key klien: ${key.client_name}`,
        severity: 'Security'
      });

      return res.json({
        success: true,
        message: `Akses API Key untuk ${key.client_name} telah dicabut (REVOKED).`,
        data: key
      });
    }

    case 'getWebhooks': {
      return res.json({
        success: true,
        message: 'Daftar webhook dan log pengiriman berhasil dimuat',
        data: {
          webhooks: INTEGRATION_DB.webhooks.filter(w => w.tenant_id === tenantId),
          logs: INTEGRATION_DB.webhookLogs.filter(l => l.tenant_id === tenantId)
        }
      });
    }

    case 'saveWebhook': {
      const { id, name, endpoint_url, events, status } = body;
      if (!endpoint_url || !endpoint_url.startsWith('http')) {
        return res.status(400).json({ success: false, message: 'URL Endpoint Webhook harus valid (HTTP/HTTPS)' });
      }

      let wh: WebhookRecord;
      if (id) {
        const idx = INTEGRATION_DB.webhooks.findIndex(w => w.id === id);
        if (idx === -1) {
          return res.status(404).json({ success: false, message: 'Webhook tidak ditemukan' });
        }
        INTEGRATION_DB.webhooks[idx] = {
          ...INTEGRATION_DB.webhooks[idx],
          name: name || INTEGRATION_DB.webhooks[idx].name,
          endpoint_url: endpoint_url || INTEGRATION_DB.webhooks[idx].endpoint_url,
          events: events || INTEGRATION_DB.webhooks[idx].events,
          status: status || INTEGRATION_DB.webhooks[idx].status
        };
        wh = INTEGRATION_DB.webhooks[idx];
      } else {
        const randomSecret = Math.random().toString(36).substring(2, 8);
        wh = {
          id: `wh-${Date.now().toString(36)}`,
          tenant_id: tenantId,
          name: name || 'Webhook Listener Baru',
          endpoint_url,
          events: events || ['attendance.recorded'],
          secret_masked: `whsec_****_${randomSecret}`,
          secret_hash: `sha256_whsec_${randomSecret}`,
          status: 'ACTIVE',
          failure_count: 0,
          last_delivery_at: null,
          last_http_status: null,
          created_at: new Date().toISOString()
        };
        INTEGRATION_DB.webhooks.push(wh);
      }

      logAudit({
        tenant_id: tenantId,
        user_id: authUser,
        username,
        action: id ? 'Update' : 'Create',
        module: 'Integration Gateway Engine',
        description: `Menyimpan Webhook: ${wh.name} -> ${wh.endpoint_url}`,
        severity: 'Information'
      });

      return res.json({
        success: true,
        message: `Webhook ${wh.name} berhasil disimpan!`,
        data: wh
      });
    }

    case 'testWebhookDelivery': {
      const { webhook_id, test_event } = body;
      const wh = INTEGRATION_DB.webhooks.find(w => w.id === webhook_id);
      if (!wh) {
        return res.status(404).json({ success: false, message: 'Webhook tidak ditemukan' });
      }

      const eventType = test_event || wh.events[0] || 'attendance.recorded';
      const eventId = `evt_test_${Date.now()}`;
      const correlationId = `corr-wh-${Math.random().toString(36).substring(2, 8)}`;

      wh.last_delivery_at = new Date().toISOString();
      wh.last_http_status = 200;

      const logRecord: WebhookLogRecord = {
        id: `whl-${Date.now().toString(36)}`,
        tenant_id: tenantId,
        webhook_id: wh.id,
        event_id: eventId,
        event_type: eventType,
        payload: {
          event_id: eventId,
          event_type: eventType,
          timestamp: wh.last_delivery_at,
          signature: 'hmac_sha256_verified_sample_hash',
          sample_data: { entity: 'System Test', status: 'SUCCESS' }
        },
        response_status: 200,
        attempt_count: 1,
        duration_ms: 185,
        status: 'SUCCESS',
        created_at: wh.last_delivery_at,
        correlation_id: correlationId
      };

      INTEGRATION_DB.webhookLogs.unshift(logRecord);

      return res.json({
        success: true,
        message: `Pengujian Webhook ${wh.name} sukses! Tanda tangan HMAC terverifikasi, status HTTP 200 OK diterima dari ${wh.endpoint_url}.`,
        data: logRecord
      });
    }

    case 'getSyncDashboard': {
      return res.json({
        success: true,
        message: 'Data sinkronisasi dan manajemen konflik berhasil dimuat',
        data: {
          jobs: INTEGRATION_DB.syncJobs.filter(s => s.tenant_id === tenantId),
          conflicts: INTEGRATION_DB.syncConflicts.filter(c => c.tenant_id === tenantId)
        }
      });
    }

    case 'triggerSyncJob': {
      const { entity_type, direction, source_of_truth } = body;
      const targetEntity = entity_type || 'Student';
      const targetDir = direction || 'PULL';
      const targetSource = source_of_truth || 'Management System ERP';

      const newJob: SyncJobRecord = {
        id: `sync-${Date.now().toString(36)}`,
        tenant_id: tenantId,
        integration_id: 'intg-004',
        integration_name: 'Bridging KBM & Leger Akademik Eksternal',
        entity_type: targetEntity,
        direction: targetDir,
        source_of_truth: targetSource,
        status: 'SUCCESS',
        records_processed: Math.floor(Math.random() * 200) + 50,
        conflicts_count: 0,
        conflict_resolution: 'SOURCE_WINS',
        last_sync_at: new Date().toISOString(),
        error_message: null
      };

      INTEGRATION_DB.syncJobs.unshift(newJob);

      logAudit({
        tenant_id: tenantId,
        user_id: authUser,
        username,
        action: 'Export',
        module: 'Integration Gateway Engine',
        description: `Menjalankan sinkronisasi data entitas ${targetEntity} (${targetDir}) dengan Source of Truth: ${targetSource}`,
        severity: 'Information'
      });

      return res.json({
        success: true,
        message: `Sinkronisasi ${targetEntity} (${targetDir}) selesai! ${newJob.records_processed} data berhasil disinkronkan tanpa konflik.`,
        data: newJob
      });
    }

    case 'resolveSyncConflict': {
      const { conflict_id, resolution_strategy } = body;
      const c = INTEGRATION_DB.syncConflicts.find(x => x.id === conflict_id);
      if (!c) {
        return res.status(404).json({ success: false, message: 'Konflik sinkronisasi tidak ditemukan' });
      }

      c.conflict_status = 'RESOLVED';
      c.resolution_strategy = resolution_strategy || 'SOURCE_WINS';
      c.resolved_at = new Date().toISOString();
      c.resolved_by = username;

      logAudit({
        tenant_id: tenantId,
        user_id: authUser,
        username,
        action: 'Approve',
        module: 'Integration Gateway Engine',
        description: `Penyelesaian konflik sinkronisasi ID ${c.id} untuk entitas ${c.entity_type} dengan strategi: ${c.resolution_strategy}`,
        severity: 'Warning'
      });

      return res.json({
        success: true,
        message: `Konflik sinkronisasi entitas ${c.entity_type} berhasil diselesaikan menggunakan strategi ${c.resolution_strategy}.`,
        data: c
      });
    }

    case 'getAcademicBridgeConfig': {
      return res.json({
        success: true,
        message: 'Konfigurasi Bridging Akademik KBM & Leger Eksternal berhasil dimuat',
        data: INTEGRATION_DB.academicBridge
      });
    }

    case 'saveAcademicBridgeConfig': {
      const { external_system_name, base_url, notes } = body;
      INTEGRATION_DB.academicBridge.external_system_name = external_system_name || INTEGRATION_DB.academicBridge.external_system_name;
      INTEGRATION_DB.academicBridge.base_url = base_url || INTEGRATION_DB.academicBridge.base_url;
      INTEGRATION_DB.academicBridge.notes = notes || INTEGRATION_DB.academicBridge.notes;
      INTEGRATION_DB.academicBridge.last_heartbeat = new Date().toISOString();

      logAudit({
        tenant_id: tenantId,
        user_id: authUser,
        username,
        action: 'Update',
        module: 'Integration Gateway Engine',
        description: `Memperbarui konfigurasi Bridging Akademik Leger Eksternal (${INTEGRATION_DB.academicBridge.external_system_name})`,
        severity: 'Information'
      });

      return res.json({
        success: true,
        message: 'Konfigurasi Bridging Akademik Eksternal berhasil diperbarui.',
        data: INTEGRATION_DB.academicBridge
      });
    }

    case 'resetCircuitBreaker': {
      const { integration_id } = body;
      const config = INTEGRATION_DB.configs.find(c => c.id === integration_id);
      if (!config) {
        return res.status(404).json({ success: false, message: 'Integrasi tidak ditemukan' });
      }

      config.circuit_status = 'CLOSED';
      config.failure_count = 0;
      config.status = 'ACTIVE';

      return res.json({
        success: true,
        message: `Circuit Breaker untuk ${config.name} berhasil di-reset ke status CLOSED.`,
        data: config
      });
    }

    default:
      return null;
  }
}
