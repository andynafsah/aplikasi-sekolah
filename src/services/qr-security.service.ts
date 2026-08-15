import crypto from 'crypto';
import { PrismaEngine } from '../backend/database/prisma';
import { logActivity } from '../../server';

export interface QrSettings {
  intervalSeconds: number; // 30, 60, 120, 300
  tokenLength: number;
  ttlSeconds: number;
  gpsRadiusMeters: number;
  maxRetryAttempts: number;
  deviceBindingRequired: boolean;
  antiFraudLevel: 'HIGH' | 'STRICT' | 'STANDARD';
}

export interface QrGenerateParams {
  qrType: 'DYNAMIC_QR' | 'STATIC_QR' | 'PERSONAL_QR' | 'LOCATION_QR' | 'CLASS_QR' | 'ROOM_QR' | 'EVENT_QR';
  personId?: string;
  role?: string;
  unitId?: string;
  classId?: string;
  roomId?: string;
  locationLat?: number;
  locationLng?: number;
  customTtlSeconds?: number;
}

export interface QrScanParams {
  qrToken: string;
  personId: string;
  personName: string;
  role: string;
  unitId?: string;
  deviceId: string;
  deviceModel?: string;
  userLat?: number;
  userLng?: number;
  ipAddress?: string;
  scanType?: 'MASUK' | 'PULANG' | 'SHALAT' | 'TAHFIDZ' | 'ASRAMA' | 'LEMBUR';
}

const DEFAULT_QR_SETTINGS: QrSettings = {
  intervalSeconds: 60,
  tokenLength: 32,
  ttlSeconds: 60,
  gpsRadiusMeters: 100,
  maxRetryAttempts: 3,
  deviceBindingRequired: true,
  antiFraudLevel: 'HIGH'
};

// In-Memory store for used QR nonces to prevent replay attacks / screenshots
const usedNoncesSet = new Set<string>();

// Store active registered devices
const registeredDevicesMap = new Map<string, { personId: string; deviceId: string; deviceName: string; trustedAt: string }>();

// Secret key for HMAC QR signing
const QR_SECRET_KEY = process.env.JWT_SECRET || 'SIMAS_PRO_ENTERPRISE_QR_SECURE_SECRET_2026';

export class QrSecurityService {
  
  // 1. Retrieve QR Security Settings
  public async getSettings(tenantId: string): Promise<QrSettings> {
    try {
      const existing = (PrismaEngine as any).inMemoryDb?.qrSettings?.[0];
      if (existing) {
        return existing;
      }
    } catch (e) {}
    return DEFAULT_QR_SETTINGS;
  }

  // 2. Save QR Security Settings
  public async saveSettings(settings: Partial<QrSettings>, tenantId: string): Promise<QrSettings> {
    const updated = { ...DEFAULT_QR_SETTINGS, ...settings };
    if (!(PrismaEngine as any).inMemoryDb) {
      (PrismaEngine as any).inMemoryDb = {};
    }
    (PrismaEngine as any).inMemoryDb.qrSettings = [updated];
    return updated;
  }

  // 3. Generate Secure QR Token Payload
  public async generateQrToken(params: QrGenerateParams, tenantId: string, createdBy: string = 'system'): Promise<{
    qrToken: string;
    qrType: string;
    expiresAt: string;
    ttlSeconds: number;
    intervalSeconds: number;
    nonce: string;
    payloadSummary: any;
  }> {
    const settings = await this.getSettings(tenantId);
    const ttl = params.customTtlSeconds || settings.ttlSeconds || 60;
    const now = Date.now();
    const expiresAtMs = now + (ttl * 1000);
    const nonce = crypto.randomBytes(12).toString('hex');

    const rawPayload = {
      tenant_id: tenantId,
      type: params.qrType,
      person_id: params.personId || 'GLOBAL',
      role: params.role || 'ALL',
      unit_id: params.unitId || 'MAIN_UNIT',
      class_id: params.classId || null,
      room_id: params.roomId || null,
      lat: params.locationLat || null,
      lng: params.locationLng || null,
      iat: now,
      exp: expiresAtMs,
      nonce: nonce
    };

    const payloadJson = JSON.stringify(rawPayload);
    const signature = crypto.createHmac('sha256', QR_SECRET_KEY).update(payloadJson).digest('hex');
    const encryptedToken = Buffer.from(`${payloadJson}.${signature}`).toString('base64url');

    return {
      qrToken: encryptedToken,
      qrType: params.qrType,
      expiresAt: new Date(expiresAtMs).toISOString(),
      ttlSeconds: ttl,
      intervalSeconds: settings.intervalSeconds,
      nonce: nonce,
      payloadSummary: rawPayload
    };
  }

  // 4. Scan & Validate QR Code
  public async scanAndValidateQr(params: QrScanParams, tenantId: string): Promise<{
    status: 'QR_VALID' | 'QR_EXPIRED' | 'QR_INVALID' | 'QR_ALREADY_USED' | 'QR_WRONG_UNIT' | 'QR_WRONG_ROLE' | 'QR_WRONG_SCHEDULE' | 'UNKNOWN_DEVICE' | 'OUT_OF_GEOFENCE';
    message: string;
    record?: any;
    auditLog?: any;
  }> {
    const settings = await this.getSettings(tenantId);
    const now = Date.now();

    // A. Unpack & Verify Token Structure
    let payload: any = null;
    let signature = '';
    try {
      const decodedStr = Buffer.from(params.qrToken, 'base64url').toString('utf-8');
      const lastDot = decodedStr.lastIndexOf('.');
      if (lastDot === -1) throw new Error('Format token QR tidak valid.');

      const jsonPart = decodedStr.substring(0, lastDot);
      signature = decodedStr.substring(lastDot + 1);
      payload = JSON.parse(jsonPart);

      // Verify HMAC signature
      const expectedSig = crypto.createHmac('sha256', QR_SECRET_KEY).update(jsonPart).digest('hex');
      if (signature !== expectedSig) {
        throw new Error('Tanda tangan kriptografi QR tidak sah! Terdeteksi pemalsuan token.');
      }
    } catch (err: any) {
      this.logFraudAlert(tenantId, params, 'QR_INVALID', `Upaya pemalsuan / QR Corrupt: ${err.message}`);
      return {
        status: 'QR_INVALID',
        message: 'QR Code tidak dapat diverifikasi (Token rusak atau palsu).'
      };
    }

    // B. Check Tenant Integrity
    if (payload.tenant_id && payload.tenant_id !== tenantId) {
      this.logFraudAlert(tenantId, params, 'QR_WRONG_UNIT', 'QR Code diterbitkan untuk instansi/tenant berbeda.');
      return {
        status: 'QR_WRONG_UNIT',
        message: 'QR Code ini berasal dari instansi / cabang sekolah lain.'
      };
    }

    // C. Check Expiry
    if (now > payload.exp) {
      this.logFraudAlert(tenantId, params, 'QR_EXPIRED', `QR Kadaluarsa ${Math.round((now - payload.exp)/1000)} detik yang lalu.`);
      return {
        status: 'QR_EXPIRED',
        message: 'QR Code telah kadaluarsa. Silakan minta tampilan QR diperbarui!'
      };
    }

    // D. Check Anti-Replay / Nonce
    if (usedNoncesSet.has(payload.nonce)) {
      this.logFraudAlert(tenantId, params, 'QR_ALREADY_USED', 'Dua kali penggunaan token QR yang sama (Anti Screenshot / Replay Attack).');
      return {
        status: 'QR_ALREADY_USED',
        message: 'QR Code ini sudah pernah digunakan untuk absen! Anti-Screenshot aktif.'
      };
    }

    // E. Role Validation
    if (payload.role && payload.role !== 'ALL' && payload.role !== params.role) {
      this.logFraudAlert(tenantId, params, 'QR_WRONG_ROLE', `Mencoba scan QR khusus ${payload.role} dengan role ${params.role}.`);
      return {
        status: 'QR_WRONG_ROLE',
        message: `Hak akses tidak sesuai! QR ini khusus untuk role ${payload.role}.`
      };
    }

    // F. Device Binding Check
    if (settings.deviceBindingRequired) {
      const boundDevice = registeredDevicesMap.get(params.personId);
      if (boundDevice && boundDevice.deviceId !== params.deviceId) {
        this.logFraudAlert(tenantId, params, 'UNKNOWN_DEVICE', `Percobaan absen dari HP tidak terdaftar. HP terdaftar: ${boundDevice.deviceName}, HP ini: ${params.deviceModel || params.deviceId}`);
        return {
          status: 'UNKNOWN_DEVICE',
          message: 'Perangkat tidak terdaftar! Presensi hanya diizinkan melalui Smartphone terikat (Trusted Device).'
        };
      }
      // Auto-bind device if not registered yet
      if (!boundDevice) {
        registeredDevicesMap.set(params.personId, {
          personId: params.personId,
          deviceId: params.deviceId,
          deviceName: params.deviceModel || params.deviceId,
          trustedAt: new Date().toISOString()
        });
      }
    }

    // G. GPS / Geofence Check (if location QR or location coords attached)
    if (payload.lat && payload.lng && params.userLat && params.userLng) {
      const distance = this.calculateDistance(params.userLat, params.userLng, payload.lat, payload.lng);
      if (distance > settings.gpsRadiusMeters) {
        this.logFraudAlert(tenantId, params, 'OUT_OF_GEOFENCE', `Lokasi GPS ${distance} meter di luar radius geofence (${settings.gpsRadiusMeters}m).`);
        return {
          status: 'OUT_OF_GEOFENCE',
          message: `Lokasi Anda (${Math.round(distance)}m) berada di luar area Geofence QR (${settings.gpsRadiusMeters}m).`
        };
      }
    }

    // F. Record Success & Mark Nonce
    usedNoncesSet.add(payload.nonce);

    // Save attendance record
    const attendanceRecord = {
      id: `att-qr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      tenant_id: tenantId,
      personId: params.personId,
      name: params.personName,
      role: params.role,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      type: params.scanType || 'MASUK',
      status: 'HADIR',
      method: 'QR',
      details: `Presensi QR Kriptografi (${payload.type}) - Device: ${params.deviceModel || 'Trusted HP'}`,
      deviceId: params.deviceId,
      lat: params.userLat,
      lng: params.userLng,
      created_at: new Date().toISOString()
    };

    // Log Activity
    logActivity(
      tenantId,
      params.personId,
      params.personName,
      params.role,
      'CREATE',
      'QR Security Engine',
      `Scan QR ${payload.type} BERHASIL untuk ${params.personName} (${params.scanType || 'MASUK'})`
    );

    // Store in Audit History
    const auditRecord = {
      id: `qraud-${Date.now()}`,
      tenant_id: tenantId,
      personId: params.personId,
      personName: params.personName,
      role: params.role,
      qrType: payload.type,
      status: 'QR_VALID',
      timestamp: new Date().toISOString(),
      deviceId: params.deviceId,
      deviceModel: params.deviceModel || 'Android Mobile',
      ipAddress: params.ipAddress || '127.0.0.1',
      lat: params.userLat,
      lng: params.userLng,
      details: 'Scan QR tervalidasi penuh oleh Security Engine'
    };
    this.saveAuditLog(auditRecord);

    return {
      status: 'QR_VALID',
      message: 'Presensi QR berhasil tervalidasi!',
      record: attendanceRecord,
      auditLog: auditRecord
    };
  }

  // 5. Verify Token without recording attendance
  public async verifyQrToken(qrToken: string, tenantId: string): Promise<{
    valid: boolean;
    reason?: string;
    payload?: any;
  }> {
    try {
      const decodedStr = Buffer.from(qrToken, 'base64url').toString('utf-8');
      const lastDot = decodedStr.lastIndexOf('.');
      if (lastDot === -1) return { valid: false, reason: 'Format token QR tidak valid.' };

      const jsonPart = decodedStr.substring(0, lastDot);
      const signature = decodedStr.substring(lastDot + 1);
      const payload = JSON.parse(jsonPart);

      const expectedSig = crypto.createHmac('sha256', QR_SECRET_KEY).update(jsonPart).digest('hex');
      if (signature !== expectedSig) return { valid: false, reason: 'Tanda tangan kriptografi QR palsu.' };

      if (Date.now() > payload.exp) return { valid: false, reason: 'QR Code telah kadaluarsa.' };
      if (usedNoncesSet.has(payload.nonce)) return { valid: false, reason: 'QR Code sudah pernah dipakai.' };

      return { valid: true, payload };
    } catch (e: any) {
      return { valid: false, reason: e.message };
    }
  }

  // 6. Get Audit History
  public getAuditHistory(tenantId: string): any[] {
    const list = (PrismaEngine as any).inMemoryDb?.qrAuditLogs || [];
    return list;
  }

  private saveAuditLog(log: any) {
    if (!(PrismaEngine as any).inMemoryDb) {
      (PrismaEngine as any).inMemoryDb = {};
    }
    if (!(PrismaEngine as any).inMemoryDb.qrAuditLogs) {
      (PrismaEngine as any).inMemoryDb.qrAuditLogs = [];
    }
    (PrismaEngine as any).inMemoryDb.qrAuditLogs.unshift(log);
  }

  private logFraudAlert(tenantId: string, params: QrScanParams, status: string, reason: string) {
    const alertRecord = {
      id: `qraud-fraud-${Date.now()}`,
      tenant_id: tenantId,
      personId: params.personId,
      personName: params.personName,
      role: params.role,
      status: status,
      timestamp: new Date().toISOString(),
      deviceId: params.deviceId,
      deviceModel: params.deviceModel || 'Unknown Device',
      ipAddress: params.ipAddress || '127.0.0.1',
      details: `[SECURITY ALERT] ${reason}`
    };
    this.saveAuditLog(alertRecord);
    logActivity(tenantId, params.personId, params.personName, params.role, 'WARNING', 'QR Security Anti-Fraud', alertRecord.details);
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

export const qrSecurityService = new QrSecurityService();

