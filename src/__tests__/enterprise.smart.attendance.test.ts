/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { smartAttendanceService, SmartAttendanceService } from '../services/smart-attendance.service';
import { DB } from '../../server';

describe('139_SCHOOL_PESANTREN_SMART_ATTENDANCE_CORE Verification Suite', () => {
  const tenantId = 'test-school-pesantren';

  beforeEach(() => {
    // Seed test students
    DB.students = [
      {
        id: 'std-test-01',
        tenant_id: tenantId,
        name: 'Muhammad Faiz Pratama',
        nis: '2026001',
        nisn: '0012345678',
        kelas: 'X-A',
        rombel: 'X-A',
        unit: 'MA Tahfidz',
        status: 'AKTIF',
        is_santri: 'YA',
        qr_identifier: 'STUDENT:std-test-01',
        deleted_at: null
      },
      {
        id: 'std-test-02',
        tenant_id: tenantId,
        name: 'Aisyah Nur Rahma',
        nis: '2026002',
        nisn: '0012345679',
        kelas: 'X-B',
        rombel: 'X-B',
        unit: 'MA Tahfidz',
        status: 'AKTIF',
        is_santri: 'YA',
        qr_identifier: 'STUDENT:std-test-02',
        deleted_at: null
      }
    ];
  });

  describe('1. Geofence & Haversine Distance Engine', () => {
    it('should calculate distance accurately between two GPS points', () => {
      const service = new SmartAttendanceService();
      // Point 1: -6.2088, 106.8456
      // Point 2: -6.2088, 106.8456 (same point => 0m)
      const distZero = service.calculateDistance(-6.2088, 106.8456, -6.2088, 106.8456);
      expect(distZero).toBe(0);

      // Nearby point (~50m away)
      const distNearby = service.calculateDistance(-6.2088, 106.8456, -6.2085, 106.8456);
      expect(distNearby).toBeGreaterThan(0);
      expect(distNearby).toBeLessThan(100);
    });
  });

  describe('2. Student QR Gate Scanner (Security Gate Mode)', () => {
    it('should successfully record attendance for active student and return minimal safe profile', async () => {
      const res = await smartAttendanceService.scanStudentQr({
        token: 'STUDENT:std-test-01',
        source: 'SECURITY_GATE',
        scannedBy: 'Satpam Gerbang Utama',
        role: 'SATPAM',
        tenantId
      });

      expect(res.status).toBe('SUCCESS');
      expect(res.student).toBeDefined();
      expect(res.student?.name).toBe('Muhammad Faiz Pratama');
      expect(res.student?.nis).toBe('2026001');
      // Verify no sensitive PII is exposed (Section 45)
      expect((res.student as any).nik).toBeUndefined();
      expect((res.student as any).kartu_keluarga).toBeUndefined();
      expect((res.student as any).alamat_lengkap).toBeUndefined();
    });

    it('should reject invalid or unknown QR code', async () => {
      const res = await smartAttendanceService.scanStudentQr({
        token: 'STUDENT:unknown-id-999',
        source: 'SECURITY_GATE',
        scannedBy: 'Satpam Gerbang Utama',
        role: 'SATPAM',
        tenantId
      });

      expect(res.status).toBe('INVALID');
    });

    it('should detect duplicate scan within the same day/session', async () => {
      // First scan
      await smartAttendanceService.scanStudentQr({
        token: 'STUDENT:std-test-02',
        source: 'SECURITY_GATE',
        scannedBy: 'Satpam Gerbang Utama',
        role: 'SATPAM',
        tenantId
      });

      // Second scan (duplicate)
      const res2 = await smartAttendanceService.scanStudentQr({
        token: 'STUDENT:std-test-02',
        source: 'SECURITY_GATE',
        scannedBy: 'Satpam Gerbang Utama',
        role: 'SATPAM',
        tenantId
      });

      expect(res2.status).toBe('DUPLICATE');
      expect(res2.message).toContain('sudah melakukan absensi masuk');
    });
  });

  describe('3. Employee GPS Geofencing Attendance', () => {
    it('should reject employee attendance outside geofence radius', async () => {
      // Location far from campus (-6.5000, 107.0000 is ~35km away)
      const res = await smartAttendanceService.processEmployeeGpsAttendance({
        employeeId: 'emp-001',
        employeeName: 'Ustadz Budi',
        role: 'GURU',
        latitude: -6.5000,
        longitude: 107.0000,
        accuracy: 10,
        type: 'MASUK',
        tenantId
      });

      expect(res.success).toBe(false);
      expect(res.status).toBe('OUT_OF_RADIUS');
      expect(res.distanceMeters).toBeGreaterThan(100);
    });

    it('should reject attendance when mock location is detected', async () => {
      const res = await smartAttendanceService.processEmployeeGpsAttendance({
        employeeId: 'emp-002',
        employeeName: 'Pegawai TU',
        role: 'PEGAWAI',
        latitude: -6.2088,
        longitude: 106.8456,
        accuracy: 10,
        isMockLocation: true,
        type: 'MASUK',
        tenantId
      });

      expect(res.success).toBe(false);
      expect(res.status).toBe('SUSPICIOUS');
    });

    it('should accept employee attendance within valid radius', async () => {
      const res = await smartAttendanceService.processEmployeeGpsAttendance({
        employeeId: 'emp-003',
        employeeName: 'Ustadz Ahmad',
        role: 'GURU',
        latitude: -6.20882,
        longitude: 106.84561,
        accuracy: 15,
        type: 'MASUK',
        tenantId
      });

      expect(res.success).toBe(true);
      expect(res.distanceMeters).toBeLessThanOrEqual(100);
    });
  });

  describe('4. Employee QR Point Attendance', () => {
    it('should record attendance via active School Location QR point', async () => {
      const points = smartAttendanceService.getLocationPoints(tenantId);
      const gatePoint = points[0];

      const res = await smartAttendanceService.processEmployeeQrAttendance({
        employeeId: 'emp-004',
        employeeName: 'Staff Keuangan',
        role: 'PEGAWAI',
        qrToken: gatePoint.qrToken,
        type: 'MASUK',
        tenantId
      });

      expect(res.success).toBe(true);
      expect(res.locationName).toBe(gatePoint.name);
    });
  });

  describe('5. Teacher Manual Attendance Scope', () => {
    it('should save bulk attendance for assigned class rombel', async () => {
      const today = new Date().toISOString().split('T')[0];
      const res = await smartAttendanceService.saveStudentManualAttendance({
        rombel: 'X-A',
        unit: 'MA Tahfidz',
        date: today,
        records: [
          { studentId: 'std-test-01', studentName: 'Muhammad Faiz', status: 'PRESENT' },
          { studentId: 'std-test-02', studentName: 'Aisyah Nur', status: 'PERMITTED', notes: 'Izin lomba' }
        ],
        teacherId: 'TCH-01',
        teacherName: 'Ustadz Pembimbing',
        tenantId
      });

      expect(res.success).toBe(true);
      expect(res.count).toBe(2);
    });
  });

  describe('6. Attendance Correction & Approval Workflow', () => {
    it('should submit correction request and approve it to update attendance record', () => {
      const req = smartAttendanceService.requestCorrection({
        personId: 'emp-005',
        personName: 'Ustadzah Siti',
        role: 'GURU',
        date: '2026-07-01',
        targetStatus: 'PRESENT',
        reason: 'Lupa scan saat mengawas ujian santri',
        tenantId,
        requestedBy: 'Ustadzah Siti'
      });

      expect(req.data?.id).toBeDefined();
      expect(req.data?.status).toBe('PENDING');

      const approved = smartAttendanceService.approveCorrection({
        correctionId: req.data!.id,
        status: 'APPROVED',
        approvedBy: 'Kepala Sekolah',
        tenantId
      });

      expect(approved.data).not.toBeNull();
      expect(approved.data?.status).toBe('APPROVED');
      expect(approved.data?.approved_by).toBe('Kepala Sekolah');
    });
  });

  describe('7. Attendance Reporting & Filtering', () => {
    it('should aggregate reports with summaries across sources and roles', () => {
      const reports = smartAttendanceService.getReports({ tenantId });
      expect(reports.records).toBeDefined();
      expect(reports.summary.total).toBeGreaterThanOrEqual(0);
      expect(reports.summary.bySource).toBeDefined();
    });
  });
});
