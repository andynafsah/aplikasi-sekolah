/**
 * @file enterprise.migration.setup.test.ts
 * @description Enterprise Initial Setup & Data Migration Verification Suite (138_ENTERPRISE_DATA_MIGRATION_AND_INITIAL_SETUP)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DataMigrationEngine } from '../services/migration.service';
import { MigrationController } from '../controllers/migration.controller';

describe('Task 138: Enterprise Data Migration & Initial Setup Engine', () => {
  let mockDB: any;
  const testTenantId = 'tenant-test-138';

  beforeEach(() => {
    mockDB = {
      schools: [],
      schoolUnits: [],
      academicYears: [],
      students: [],
      teachers: [],
      employees: [],
      courses: [],
      classrooms: [],
      schedules: [],
      grades: [],
      attendances: [],
      brandings: [],
      setupWizards: [],
      dataMigrations: [],
      backups: []
    };
  });

  describe('1. System Health Check & Evaluation', () => {
    it('should evaluate system health correctly when database is operational', () => {
      const diagState = {
        dbAvailable: true,
        dbMessage: 'PostgreSQL/MySQL operational',
        redisAvailable: true,
        minioAvailable: true
      };

      const health = DataMigrationEngine.evaluateSystemHealth(diagState);
      expect(health.database.status).toBe('PASS');
      expect(health.storage.status).toBe('PASS');
      expect(health.migration.status).toBe('PASS');
      expect(health.overall).toBe('PASS');
    });

    it('should report WARNING status gracefully when fallback is used', () => {
      const diagState = {
        dbAvailable: false,
        dbError: false,
        redisAvailable: false
      };

      const health = DataMigrationEngine.evaluateSystemHealth(diagState);
      expect(health.database.status).toBe('WARNING');
      expect(health.overall).toBe('PASS');
    });
  });

  describe('2. CSV Parsing & Import Engine', () => {
    it('should correctly parse CSV raw text with quotes and headers', () => {
      const csv = `nama_lengkap,nis,nisn,nik,gender\n"Muhammad Rayhan","20261001","0081234567","3201012345670001","L"\n"Aisyah Nur","20261002","0081234568","3201012345670002","P"`;
      const parsed = DataMigrationEngine.parseCsv(csv);

      expect(parsed.headers).toEqual(['nama_lengkap', 'nis', 'nisn', 'nik', 'gender']);
      expect(parsed.rows.length).toBe(2);
      expect(parsed.rows[0].nama_lengkap).toBe('Muhammad Rayhan');
      expect(parsed.rows[1].gender).toBe('P');
    });

    it('should execute import for students with QR identifier and duplicate skipping', () => {
      const rawRows = [
        { nama_lengkap: 'Siswa Satu', nis: '1001', nisn: '001', nik: '3201', gender: 'L' },
        { nama_lengkap: 'Siswa Dua', nis: '1002', nisn: '002', nik: '3202', gender: 'P' },
        { nama_lengkap: 'Siswa Duplikat', nis: '1001', nisn: '001', nik: '3201', gender: 'L' } // duplicate NIS
      ];

      const config = {
        source_type: 'CSV' as const,
        target_entity: 'STUDENTS' as const,
        field_mappings: {
          nama_lengkap: 'nama_lengkap',
          nis: 'nis',
          nisn: 'nisn',
          nik: 'nik',
          gender: 'gender'
        },
        options: {
          skip_duplicates: true,
          rollback_on_error: false,
          auto_generate_ids: true,
          generate_accounts: true,
          default_unit_id: 'unit-sma-01'
        }
      };

      const result = DataMigrationEngine.executeImport(config, rawRows, mockDB, testTenantId, 'user-admin');

      expect(result.total_source).toBe(3);
      expect(result.total_imported).toBe(2);
      expect(result.total_skipped).toBe(1);
      expect(result.total_duplicate).toBe(1);
      expect(result.status).toBe('SUCCESS');
      expect(mockDB.students.length).toBe(2);
      expect(mockDB.students[0].qr_code_identifier).toContain('STD-tenant-test-138');
    });
  });

  describe('3. Data Reconciliation & Orphan Audit', () => {
    it('should confirm 0 orphan records when entities are cleanly linked', () => {
      mockDB.classrooms.push({ id: 'cls-1', tenant_id: testTenantId, nama: 'X-A', deleted_at: null });
      mockDB.students.push({ id: 'std-1', tenant_id: testTenantId, nama_lengkap: 'Ahmad', classroom_id: 'cls-1', deleted_at: null });
      mockDB.teachers.push({ id: 'tch-1', tenant_id: testTenantId, nama_lengkap: 'Ustadz Ali', deleted_at: null });

      const reconciliation = DataMigrationEngine.reconcileData(mockDB, testTenantId);

      expect(reconciliation.student_count.current_db).toBe(1);
      expect(reconciliation.orphan_checks.orphan_students).toBe(0);
      expect(reconciliation.orphan_checks.all_zero).toBe(true);
      expect(reconciliation.overall_consistent).toBe(true);
    });

    it('should detect orphaned classroom relation if student points to non-existent classroom', () => {
      mockDB.students.push({ id: 'std-2', tenant_id: testTenantId, nama_lengkap: 'Budi', classroom_id: 'cls-non-existent', deleted_at: null });

      const reconciliation = DataMigrationEngine.reconcileData(mockDB, testTenantId);

      expect(reconciliation.orphan_checks.orphan_students).toBe(1);
      expect(reconciliation.orphan_checks.all_zero).toBe(false);
      expect(reconciliation.overall_consistent).toBe(false);
    });
  });

  describe('4. Migration Controller Action Dispatcher', () => {
    const controller = new MigrationController();

    const mockRes = () => {
      const res: any = {};
      res.status = (code: number) => { res.statusCode = code; return res; };
      res.json = (data: any) => { res.jsonData = data; return res; };
      return res;
    };

    it('should handle getSetupStatus and initialize default NOT_STARTED state', async () => {
      const req: any = { body: { tenant_id: testTenantId } };
      const res = mockRes();

      await controller.handle('getSetupStatus', req, res, testTenantId, { id: 'admin-1' }, 'superadmin', 'SUPER_ADMIN');

      expect(res.jsonData.success).toBe(true);
      expect(res.jsonData.data.total_steps).toBe(16);
      expect(res.jsonData.data.setup_status).toBe('NOT_STARTED');
    });

    it('should handle saveSetupStep and dynamically update organization profile', async () => {
      const req: any = {
        body: {
          tenant_id: testTenantId,
          step: 2,
          step_data: {
            organization: {
              nama_yayasan: 'Yayasan Darul Ulum',
              nama_legal: 'SMA IT Darul Ulum',
              npsn: '20104567',
              alamat: 'Jl. Lembang No. 100'
            }
          },
          mark_completed: true
        }
      };
      const res = mockRes();

      await controller.handle('saveSetupStep', req, res, testTenantId, { id: 'admin-1' }, 'superadmin', 'SUPER_ADMIN');

      expect(res.jsonData.success).toBe(true);
      expect(res.jsonData.data.completed_steps).toContain(2);
    });

    it('should create initial production baseline backup', async () => {
      const req: any = { body: { tenant_id: testTenantId } };
      const res = mockRes();

      await controller.handle('createBaselineBackup', req, res, testTenantId, { id: 'admin-1' }, 'superadmin', 'SUPER_ADMIN');

      expect(res.jsonData.success).toBe(true);
      expect(res.jsonData.data.id).toContain('INITIAL_PRODUCTION_BASELINE');
    });

    it('should lock setup when requested and unlock only with SUPER_ADMIN privileges', async () => {
      // First save step to initialize
      const reqInit: any = { body: { tenant_id: testTenantId, step: 1, step_data: {} } };
      await controller.handle('saveSetupStep', reqInit, mockRes(), testTenantId, { id: 'admin-1' }, 'superadmin', 'SUPER_ADMIN');

      // Lock setup
      const reqLock: any = { body: { tenant_id: testTenantId } };
      const resLock = mockRes();
      await controller.handle('lockSetup', reqLock, resLock, testTenantId, { id: 'admin-1' }, 'superadmin', 'SUPER_ADMIN');

      expect(resLock.jsonData.success).toBe(true);
      expect(resLock.jsonData.data.setup_status).toBe('LOCKED');

      // Attempt unlock with GURU role (should fail)
      const resUnlockDenied = mockRes();
      await controller.handle('unlockSetup', reqLock, resUnlockDenied, testTenantId, { id: 'guru-1' }, 'guru1', 'GURU');
      expect(resUnlockDenied.statusCode).toBe(403);

      // Attempt unlock with SUPER_ADMIN role (should succeed)
      const resUnlockAllowed = mockRes();
      await controller.handle('unlockSetup', reqLock, resUnlockAllowed, testTenantId, { id: 'admin-1' }, 'superadmin', 'SUPER_ADMIN');
      expect(resUnlockAllowed.jsonData.success).toBe(true);
      expect(resUnlockAllowed.jsonData.data.setup_status).toBe('IN_PROGRESS');
    });

    it('should run smoke test and verify 10 operational modules', async () => {
      const req: any = { body: { tenant_id: testTenantId } };
      const res = mockRes();

      await controller.handle('runSetupSmokeTest', req, res, testTenantId, { id: 'admin-1' }, 'superadmin', 'SUPER_ADMIN');

      expect(res.jsonData.success).toBe(true);
      expect(res.jsonData.data.overall).toBe('PASS');
      expect(res.jsonData.data.total_tested).toBe(10);
      expect(res.jsonData.data.total_passed).toBe(10);
    });
  });
});
