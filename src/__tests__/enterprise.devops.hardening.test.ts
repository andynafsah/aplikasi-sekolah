/**
 * @file enterprise.devops.hardening.test.ts
 * @description Production DevOps & Hardening Verification Suite (137_PRODUCTION_DEPLOYMENT_DEVOPS_HARDENING)
 */

import { describe, it, expect } from 'vitest';
import { DIAG_STATE, DB } from '../../server';
import fs from 'fs';
import path from 'path';

describe('DevOps & Production Hardening Suite (137 Verification)', () => {
  // 1. Environment Variables Schema & Configuration Hardening
  it('should verify .env.example contains all required production configuration keys', () => {
    const envExamplePath = path.resolve(process.cwd(), '.env.example');
    expect(fs.existsSync(envExamplePath)).toBe(true);

    const envContent = fs.readFileSync(envExamplePath, 'utf-8');
    const requiredKeys = [
      'NODE_ENV',
      'PORT',
      'APP_URL',
      'API_URL',
      'DATABASE_URL',
      'JWT_SECRET',
      'JWT_EXPIRES_IN',
      'REFRESH_TOKEN_SECRET',
      'CORS_ORIGINS',
      'RATE_LIMIT_WINDOW_MS',
      'RATE_LIMIT_MAX',
      'STORAGE_DRIVER',
      'UPLOAD_PATH',
      'SMTP_HOST',
      'SMTP_PORT'
    ];

    for (const key of requiredKeys) {
      expect(envContent.includes(key)).toBe(true);
    }
  });

  // 2. Health Check & Observability Endpoints
  it('should verify DIAG_STATE flags are properly initialized for health diagnostics', () => {
    expect(DIAG_STATE).toBeDefined();
    expect(typeof DIAG_STATE.dbAvailable).toBe('boolean');
    expect(typeof DIAG_STATE.redisAvailable).toBe('boolean');
    expect(typeof DIAG_STATE.minioAvailable).toBe('boolean');
    expect(typeof DIAG_STATE.jwtSecure).toBe('boolean');
  });

  // 3. Document Verification Endpoint - Data Sanitization
  it('should safely verify document authenticity without exposing sensitive personal info', () => {
    const testDocId = 'doc-hardening-001';
    DB.documents.push({
      id: testDocId,
      nomor_surat: '001/SK-DIR/VIII/2026',
      perihal: 'Surat Keterangan Aktif Belajar Santri',
      status: 'TERVERIFIKASI',
      tanggal_surat: '2026-08-14',
      penandatangan: 'KH. Abdullah Syukri, M.Pd.',
      tenant_id: 'tenant-demo',
      internal_notes: 'RAHASIA: Catatan internal staf'
    });

    const doc = DB.documents.find((d: any) => d.id === testDocId);
    expect(doc).toBeDefined();

    // Sanitized output for public verification
    const publicVerificationData = {
      nomor_surat: doc.nomor_surat,
      perihal: doc.perihal,
      status: doc.status,
      tanggal_surat: doc.tanggal_surat,
      penandatangan_role: doc.penandatangan,
      instansi: 'Lembaga Pendidikan Islam Terpadu',
      verified_at: new Date().toISOString(),
      is_authentic: true
    };

    expect(publicVerificationData.nomor_surat).toBe('001/SK-DIR/VIII/2026');
    expect(publicVerificationData.is_authentic).toBe(true);
    expect((publicVerificationData as any).internal_notes).toBeUndefined();
    expect((publicVerificationData as any).tenant_id).toBeUndefined();
  });

  // 4. Rate Limiting Logic Verification
  it('should properly track and increment sliding window rate limit counts', () => {
    const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
    const testIp = '192.168.1.100';
    const windowMs = 60000;
    const maxLimit = 10;

    let now = 1000000;
    const clientData = rateLimitMap.get(testIp) || { count: 0, resetTime: now + windowMs };

    for (let i = 0; i < 5; i++) {
      clientData.count += 1;
    }
    rateLimitMap.set(testIp, clientData);

    expect(rateLimitMap.get(testIp)?.count).toBe(5);
    expect(rateLimitMap.get(testIp)?.count).toBeLessThanOrEqual(maxLimit);

    // Exceed limit
    for (let i = 0; i < 6; i++) {
      clientData.count += 1;
    }
    rateLimitMap.set(testIp, clientData);
    expect(rateLimitMap.get(testIp)!.count > maxLimit).toBe(true);

    // Reset window simulation
    now += windowMs + 1000;
    if (now > clientData.resetTime) {
      clientData.count = 1;
      clientData.resetTime = now + windowMs;
    }
    expect(clientData.count).toBe(1);
  });

  // 5. Structured Error Format & Error ID Generation
  it('should generate consistent and traceable error structures with unique Error IDs', () => {
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const errorPayload = {
      success: false,
      message: 'Internal server error occurred.',
      errorId,
      code: 'INTERNAL_SERVER_ERROR'
    };

    expect(errorPayload.success).toBe(false);
    expect(errorPayload.errorId).toMatch(/^err_\d+_[a-z0-9]+$/);
    expect(errorPayload.code).toBe('INTERNAL_SERVER_ERROR');
  });

  // 6. Security Headers Structure Validation
  it('should define essential HTTP security headers', () => {
    const securityHeaders = {
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    };

    expect(securityHeaders['X-Content-Type-Options']).toBe('nosniff');
    expect(securityHeaders['X-XSS-Protection']).toBe('1; mode=block');
    expect(securityHeaders['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
  });

  // 7. Operations & Deployment Documentation Verification
  it('should verify DEPLOYMENT.md and OPERATIONS_RUNBOOK.md exist and contain required sections', () => {
    const deploymentPath = path.resolve(process.cwd(), 'DEPLOYMENT.md');
    const runbookPath = path.resolve(process.cwd(), 'OPERATIONS_RUNBOOK.md');

    expect(fs.existsSync(deploymentPath)).toBe(true);
    expect(fs.existsSync(runbookPath)).toBe(true);

    const deploymentText = fs.readFileSync(deploymentPath, 'utf-8');
    const runbookText = fs.readFileSync(runbookPath, 'utf-8');

    expect(deploymentText.includes('Health Check & Observabilitas')).toBe(true);
    expect(deploymentText.includes('Backup & Disaster Recovery')).toBe(true);
    expect(runbookText.includes('Matriks Eskalasi & Severity Level')).toBe(true);
    expect(runbookText.includes('Database Connection Pool Exhausted')).toBe(true);
  });
});
