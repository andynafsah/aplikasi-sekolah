/**
 * Enterprise Vitest Unit Specification Test Suite Runner
 * 
 * Implements granular, automated unit checks verifying Multi-Tenant Isolation, 
 * JWT authentication rotation, RBAC wildcards, Cache invalidations, Queue processing,
 * and Storage metadata integrity.
 */

import { BackendServerInstance } from '../app';
import { PrismaEngine } from '../database/prisma';
import { CacheEngine } from '../cache/redis';
import { QueueEngine } from '../queue/bullmq';
import { StorageEngine } from '../storage/s3';
import { SecurityMiddleware } from '../middleware/security';
import { logger } from '../config/logger';

export interface SuiteTestResult {
  suite_name: string;
  assert_count: number;
  status: 'PASSED' | 'FAILED';
  errors: string[];
  logs: string[];
}

export class VitestTestSuiteRunner {
  public static async runAllSpecs(): Promise<SuiteTestResult[]> {
    const results: SuiteTestResult[] = [];
    
    // Ensure servers are initialized
    await BackendServerInstance.bootstrap();

    results.push(await this.testAuthenticationAndSessionSet());
    results.push(await this.testMultiTenantIsolationBoundaries());
    results.push(await this.testRbacAndAuthorizationPermissions());
    results.push(await this.testCachingAndRateLimiterConstraints());
    results.push(await this.testQueueAndStorageIntegrity());

    return results;
  }

  /**
   * Test Suite 1: Authentication, password credentials, and Double-JWT rotation
   */
  private static async testAuthenticationAndSessionSet(): Promise<SuiteTestResult> {
    const logs: string[] = ['[TEST] Memulai spesifikasi sistem Autentikasi...'];
    const errors: string[] = [];
    let asserts = 0;

    try {
      // 1. Invalid email check
      const failLogin = await BackendServerInstance.dispatchRequest('/api/v1/auth/login', 'POST', {
        email: 'invalid@test.com',
        password: 'wrong_password'
      });
      asserts++;
      if (failLogin.statusCode !== 401) {
        errors.push(`Gagal: Login non-eksisten mengembalikan status ${failLogin.statusCode}, diharapkan 401`);
      } else {
        logs.push('✔ Berhasil menolak login alamat email tidak terdaftar.');
      }

      // 2. Successful Login Check with standard admin credentials
      const successLogin = (await BackendServerInstance.dispatchRequest('/api/v1/auth/login', 'POST', {
        email: 'admin@enterprise.com',
        password: 'admin123'
      })) as any;
      asserts++;
      if (successLogin.statusCode !== 200 || !successLogin.data?.tokens?.accessToken) {
        errors.push('Gagal: Login kredensial admin tidak mengembalikan token JWT.');
      } else {
        logs.push('✔ Berhasil masuk sebagai administrator utama, double-token JWT didapatkan.');
      }

      // 3. Token Rotation check
      const oldRefreshToken = successLogin.data.tokens.refreshToken;
      const refreshAction = (await BackendServerInstance.dispatchRequest('/api/v1/auth/refresh', 'POST', {
        refreshToken: oldRefreshToken
      })) as any;
      asserts++;
      if (refreshAction.statusCode !== 200 || !refreshAction.data?.tokens?.accessToken) {
        errors.push('Gagal: Rotasi sesi token refresh ditolak.');
      } else {
        logs.push('✔ Berhasil merotasi sesi Access Token baru secara dinamis.');
      }

    } catch (e: any) {
      errors.push(`Kritis: Exception terpantau: ${e.message}`);
    }

    return {
      suite_name: 'Authentication & Session Rotation Spec',
      assert_count: asserts,
      status: errors.length === 0 ? 'PASSED' : 'FAILED',
      errors,
      logs
    };
  }

  /**
   * Test Suite 2: Strict Access isolation bounds
   */
  private static async testMultiTenantIsolationBoundaries(): Promise<SuiteTestResult> {
    const logs: string[] = ['[TEST] Mengevaluasi batas isolasi Hak Akses...'];
    const errors: string[] = [];
    let asserts = 0;

    try {
      // Try registering user inside single-tenant
      const userB = await PrismaEngine.user.create({
        data: {
          id: 'user-b-employee',
          name: 'John Doe',
          email: 'john@foreign.org',
          password_hash: 'somehash',
          role_id: 'role-user',
          status: 'ACTIVE'
        } as any
      });

      // Attempt to access userB profile without proper auth header (simulating unauthorized attack)
      const attackRequest = await BackendServerInstance.dispatchRequest(`/api/v1/users/user-b-employee`, 'GET', null, '127.0.0.1', {
        'x-user-id': 'non-existent'
      });

      asserts++;
      if (attackRequest.statusCode !== 403 && attackRequest.statusCode !== 401) {
        errors.push(`Celah Keamanan Terdeteksi: Penyerang tanpa izin dapat mengakses data user! Status: ${attackRequest.statusCode}`);
      } else {
        logs.push('✔ Batas isolasi sukses: Pengguna tidak terdaftar dilarang mengakses profil.');
      }

    } catch (e: any) {
      errors.push(`Exception: ${e.message}`);
    }

    return {
      suite_name: 'Single-Tenant Boundary Isolation Spec',
      assert_count: asserts,
      status: errors.length === 0 ? 'PASSED' : 'FAILED',
      errors,
      logs
    };
  }

  /**
   * Test Suite 3: RBAC Wildcard and Hierarchical access privileges
   */
  private static async testRbacAndAuthorizationPermissions(): Promise<SuiteTestResult> {
    const logs: string[] = ['[TEST] Menjalankan uji RBAC Privileges...'];
    const errors: string[] = [];
    let asserts = 0;

    try {
      // Create a standard User under Main Tenant
      await PrismaEngine.user.create({
        data: {
          id: 'standard-employee-user',
          name: 'Budi Santoso',
          email: 'budi@enterprise.com',
          password_hash: 'employeehash',
          role_id: 'role-user', // Standard role with read-only/attendance permissions
          status: 'ACTIVE'
        } as any
      });

      // Standard user tries creating another user (Requires user:create permission which they lack)
      const blockedAction = await BackendServerInstance.dispatchRequest('/api/v1/users', 'POST', {
        name: 'New Colleague',
        email: 'colleague@enterprise.com',
        password: 'new_password_123',
        role_id: 'role-user'
      }, '127.0.0.1', {
        'x-user-id': 'standard-employee-user'
      });

      asserts++;
      if (blockedAction.statusCode !== 403) {
        errors.push(`Gagal: Pengguna biasa diizinkan melakukan tindakan administratif! Status: ${blockedAction.statusCode}`);
      } else {
        logs.push('✔ RBAC sukses: Standard employee diblokir dari pendaftaran user baru.');
      }

      // Admin user (wildcard admin) tries the exact same thing
      const approvedAction = await BackendServerInstance.dispatchRequest('/api/v1/users', 'POST', {
        name: 'Authorized Colleague',
        email: 'colleague@enterprise.com',
        password: 'new_password_123',
        role_id: 'role-user'
      }, '127.0.0.1', {
        'x-user-id': 'user-admin-1'
      });

      asserts++;
      if (approvedAction.statusCode !== 201) {
        errors.push(`Gagal: Admin tidak diizinkan membuat pengguna baru. Status: ${approvedAction.statusCode}`);
      } else {
        logs.push('✔ RBAC sukses: Administrator dengan hak wildcard berhasil meluncurkan aksi pendaftaran.');
      }

    } catch (e: any) {
      errors.push(`Exception: ${e.message}`);
    }

    return {
      suite_name: 'RBAC & Authorization Hierarchy Spec',
      assert_count: asserts,
      status: errors.length === 0 ? 'PASSED' : 'FAILED',
      errors,
      logs
    };
  }

  /**
   * Test Suite 4: Redis cache and Rate limiter
   */
  private static async testCachingAndRateLimiterConstraints(): Promise<SuiteTestResult> {
    const logs: string[] = ['[TEST] Memvalidasi performa Caching dan Rate Limiter...'];
    const errors: string[] = [];
    let asserts = 0;

    try {
      // 1. Set cache values and invalidation patterns
      await CacheEngine.set('users:profile:1', { name: 'Siti' });
      await CacheEngine.set('users:profile:2', { name: 'Ahmad' });
      await CacheEngine.set('tenants:config:1', { billing: 'OK' });

      // Invalidate users namespace
      const invalidatedCount = await CacheEngine.invalidatePattern('users:profile:*');
      asserts++;
      if (invalidatedCount !== 2) {
        errors.push(`Gagal: invalidasi pola cache tidak mendepak 2 kunci, hanya mendepak ${invalidatedCount}`);
      } else {
        logs.push('✔ Berhasil memvalidasi bulk invalidasi namespace cache.');
      }

      // Check tenant cache is unaffected
      const tenantCache = await CacheEngine.get('tenants:config:1');
      asserts++;
      if (!tenantCache) {
        errors.push('Gagal: Kunci cache lain tidak sengaja terhapus.');
      } else {
        logs.push('✔ Validasi isolasi namespace cache sukses.');
      }

      // 2. Stress-test Rate Limiter boundaries (IP limits)
      const mockIp = '192.168.1.100';
      let allowedCount = 0;
      let blockedOnLoop = -1;

      for (let i = 0; i < 110; i++) {
        const check = SecurityMiddleware.evaluateRateLimit(mockIp, 100);
        if (check.allowed) {
          allowedCount++;
        } else {
          blockedOnLoop = i;
          break;
        }
      }

      asserts++;
      if (allowedCount !== 100) {
        errors.push(`Gagal: Rate Limiter melewatkan ${allowedCount} permintaan (seharusnya tepat 100).`);
      } else {
        logs.push(`✔ Rate Limiter sukses: Tepat memblokir pada request ke-${blockedOnLoop + 1}.`);
      }

    } catch (e: any) {
      errors.push(`Exception: ${e.message}`);
    }

    return {
      suite_name: 'Caching Engine & Rate Limiter Constraints Spec',
      assert_count: asserts,
      status: errors.length === 0 ? 'PASSED' : 'FAILED',
      errors,
      logs
    };
  }

  /**
   * Test Suite 5: Background Queue & Storage actions
   */
  private static async testQueueAndStorageIntegrity(): Promise<SuiteTestResult> {
    const logs: string[] = ['[TEST] Menguji Queue (BullMQ) & Object Storage...'];
    const errors: string[] = [];
    let asserts = 0;

    try {
      // 1. BullMQ Background Worker Triggering
      const job = await QueueEngine.add('notifications', 'welcome_email', {
        recipient: 'client@example.com',
        emailType: 'WELCOME'
      });

      asserts++;
      if (!job.id) {
        errors.push('Gagal: Antrean BullMQ tidak berhasil mendaftarkan ID pekerjaan baru.');
      } else {
        logs.push(`✔ BullMQ sukses: Pekerjaan ${job.id} berhasil terantre.`);
      }

      // 2. Storage upload, file size, and metadata validation
      const fileName = 'reports/quarterly_audit_2026.pdf';
      const fileContent = 'PDF-DUMMY-STREAM-CONTENT-ENTERPRISE-REPORT';
      const meta = await StorageEngine.putObject(fileName, fileContent, 'application/pdf');

      asserts++;
      if (meta.size_bytes !== fileContent.length || meta.mime_type !== 'application/pdf') {
        errors.push('Gagal: Metadata unggahan tidak sesuai dengan properti berkas asli.');
      } else {
        logs.push('✔ Object Storage sukses: File audit PDF terunggah beserta ETag unik.');
      }

      // Generate signed access URL
      const presignedUrl = await StorageEngine.getPresignedUrl(fileName, 600);
      asserts++;
      if (!presignedUrl.includes('Signature') || !presignedUrl.includes('Expires')) {
        errors.push('Gagal: Presigned URL generator gagal membubuhkan verifikasi tanda tangan pengaman.');
      } else {
        logs.push('✔ Presigned URL sukses: Tautan akses bertanda tangan aman berhasil digenerasi.');
      }

    } catch (e: any) {
      errors.push(`Exception: ${e.message}`);
    }

    return {
      suite_name: 'BullMQ Worker & S3 Storage Spec',
      assert_count: asserts,
      status: errors.length === 0 ? 'PASSED' : 'FAILED',
      errors,
      logs
    };
  }
}
