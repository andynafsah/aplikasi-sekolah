import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../core/base.controller';
import { DB, generateJWT, verifyJWT, logActivity, runAIGateway, DIAG_STATE } from '../../server';
import { AttendanceRepository } from '../repositories/attendance.repository';
import { AttendanceService } from '../services/attendance.service';
import { QrSecurityService } from '../services/qr-security.service';
import { smartAttendanceService } from '../services/smart-attendance.service';
import { PrismaEngine } from '../backend/database/prisma';

const qrSecurityService = new QrSecurityService();

export class AttendanceController extends BaseController {

  public async index(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.success(res, [], 'Index method');
    } catch (error) {
      next(error);
    }
  }

  public async show(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.success(res, null, 'Show method');
    } catch (error) {
      next(error);
    }
  }

  public async store(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.created(res, null, 'Store method');
    } catch (error) {
      next(error);
    }
  }

  public async update(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.updated(res, null, 'Update method');
    } catch (error) {
      next(error);
    }
  }

  public async destroy(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.deleted(res, 'Destroy method');
    } catch (error) {
      next(error);
    }
  }

  public async search(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.success(res, [], 'Search method');
    } catch (error) {
      next(error);
    }
  }

  public async export(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.success(res, { url: '#' }, 'Export method');
    } catch (error) {
      next(error);
    }
  }

  public async import(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.success(res, null, 'Import method');
    } catch (error) {
      next(error);
    }
  }


  public async handle(
  action: string,
  req: any,
  res: any,
  tenantId: string,
  authUser: any,
  username: string,
  role: string
): Promise<any> {
  switch (action) {
    case 'getAttendanceQr':
    case 'getQr': {
      try {
        const result = await qrSecurityService.generateQrToken({
          qrType: req.body.qrType || req.query.qrType || 'DYNAMIC_QR',
          personId: req.body.personId || authUser?.id,
          role: req.body.role || role,
          unitId: req.body.unitId,
          classId: req.body.classId,
          roomId: req.body.roomId,
          locationLat: req.body.locationLat ? Number(req.body.locationLat) : undefined,
          locationLng: req.body.locationLng ? Number(req.body.locationLng) : undefined,
          customTtlSeconds: req.body.ttlSeconds ? Number(req.body.ttlSeconds) : undefined
        }, tenantId, authUser?.id || 'system');
        return res.json({ success: true, message: 'QR Token generated successfully', data: result });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    case 'scanAttendanceQr':
    case 'scanQr': {
      try {
        const result = await qrSecurityService.scanAndValidateQr({
          qrToken: req.body.qrToken,
          personId: req.body.personId || authUser?.id || 'PERS-001',
          personName: req.body.personName || username || 'Pegawai/Guru',
          role: req.body.role || role || 'PEGAWAI',
          unitId: req.body.unitId,
          deviceId: req.body.deviceId || 'DEV-MOBILE-TRUSTED-1',
          deviceModel: req.body.deviceModel || 'Enterprise Mobile App',
          userLat: req.body.userLat !== undefined ? Number(req.body.userLat) : undefined,
          userLng: req.body.userLng !== undefined ? Number(req.body.userLng) : undefined,
          ipAddress: req.ip || '127.0.0.1',
          scanType: req.body.scanType || 'MASUK'
        }, tenantId);

        if (result.status === 'QR_VALID') {
          return res.json({ success: true, message: result.message, data: result });
        } else {
          return res.json({ success: false, status: result.status, message: result.message, data: result });
        }
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    case 'getAttendanceHistory':
    case 'getQrHistory': {
      try {
        const history = qrSecurityService.getAuditHistory(tenantId);
        return res.json({ success: true, message: 'Audit history retrieved', data: history });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    case 'verifyAttendanceQr':
    case 'verifyQr': {
      try {
        const result = await qrSecurityService.verifyQrToken(req.body.qrToken, tenantId);
        return res.json({ success: result.valid, message: result.reason || 'QR Valid', data: result });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    case 'getQrSettings': {
      try {
        const settings = await qrSecurityService.getSettings(tenantId);
        return res.json({ success: true, message: 'QR settings loaded', data: settings });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    case 'saveQrSettings': {
      try {
        const saved = await qrSecurityService.saveSettings(req.body, tenantId);
        logActivity(tenantId, authUser?.id || 'system', username, role, 'UPDATE', 'QR Security Engine', 'Memperbarui konfigurasi parameter QR Security');
        return res.json({ success: true, message: 'Setelan QR Security berhasil disimpan', data: saved });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    case 'getAttendances': {
      const { date } = req.body || {};
      const targetDate = date || new Date().toISOString().split('T')[0];
      try {
        const smartRecords = smartAttendanceService.getRecords(tenantId);
        const filtered = smartRecords.filter(r => !targetDate || r.date === targetDate);
        
        const mapped = filtered.map((r: any, idx: number) => ({
          id: r.id || `ATT-${idx + 1}`,
          personId: r.person_id || `P-${idx + 1}`,
          name: r.person_name || 'Staff/Siswa',
          role: r.role || 'GURU',
          nipNis: r.nip || r.nis || r.person_id || `ID-${idx + 100}`,
          unit: r.unit || 'SMA IT',
          classOrPosition: r.rombel || r.notes || 'Reguler',
          checkInTime: r.time_in || '07:00',
          checkOutTime: r.time_out,
          status: r.status === 'PRESENT' ? 'HADIR' : (r.status === 'LATE' ? 'TERLAMBAT' : (r.status === 'ABSENT' ? 'ALPHA' : (r.status === 'PERMITTED' ? 'IZIN' : (r.status === 'SICK' ? 'SAKIT' : r.status)))),
          method: String(r.source).includes('QR') ? 'QR' : (String(r.source).includes('GPS') ? 'GPS' : (String(r.source).includes('FACE') ? 'FACE' : 'MANUAL')),
          locationName: r.location_name || 'Kampus Utama Gedung A',
          lat: r.lat || -6.208851,
          lng: r.lng || 106.84562,
          shift: 'Shift Reguler (07:00 - 15:30)',
          isTeachingNow: r.role === 'GURU' && idx % 2 === 0,
          isOvertime: idx % 5 === 0,
          alertType: r.status === 'LATE' ? 'LATE' : 'NONE',
          date: r.date || targetDate
        }));

        const stats = smartAttendanceService.getDashboardStats(tenantId, targetDate);
        return res.json({ success: true, message: 'Success', data: mapped, stats });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    case 'getDashboard':
    case 'getDashboardStats': {
      try {
        const targetDate = req.body?.date || req.query?.date || new Date().toISOString().split('T')[0];
        const stats = smartAttendanceService.getDashboardStats(tenantId, String(targetDate));
        return res.json({ success: true, message: 'Dashboard stats loaded', data: stats });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    case 'getLiveActivity':
    case 'getActivity': {
      try {
        const logs = smartAttendanceService.getAuditLogs(tenantId, req.body);
        return res.json({ success: true, message: 'Live activity logs loaded', data: logs });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    case 'getCorrections': {
      try {
        const { status, type, personId, date, unit } = { ...req.query, ...req.body };
        const corrections = smartAttendanceService.getCorrections(tenantId, { status, type, personId, date, unit });
        return res.json({ success: true, message: 'Koreksi presensi loaded', data: corrections });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    case 'getCorrectionDetail':
    case 'getCorrectionById': {
      try {
        const id = req.params?.id || req.body?.id || req.query?.id;
        const correction = smartAttendanceService.getCorrectionById(tenantId, String(id));
        if (!correction) {
          return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Detail koreksi tidak ditemukan.' } });
        }
        return res.json({ success: true, message: 'Detail koreksi loaded', data: correction });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    case 'getMyCorrections': {
      try {
        const userId = authUser?.user_id || username || 'GURU-01';
        const corrections = smartAttendanceService.getMyCorrections(tenantId, userId);
        return res.json({ success: true, message: 'Koreksi presensi saya loaded', data: corrections });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    case 'requestCorrection': {
      try {
        const result = smartAttendanceService.requestCorrection({
          personId: req.body.personId || req.body.person_id || authUser?.user_id || 'P-101',
          personName: req.body.personName || req.body.person_name || username || 'Staff / Guru',
          role: req.body.role || role || 'GURU',
          date: req.body.date,
          requestedDate: req.body.requestedDate || req.body.requested_date,
          attendanceId: req.body.attendanceId || req.body.attendance_id,
          type: req.body.type || req.body.correction_type || 'MISSED_CHECK_OUT',
          targetStatus: req.body.targetStatus || req.body.requested_status || 'PRESENT',
          requestedStatus: req.body.requestedStatus || req.body.requested_status || 'PRESENT',
          checkInTime: req.body.checkInTime || req.body.requested_check_in,
          checkOutTime: req.body.checkOutTime || req.body.requested_check_out,
          reason: req.body.reason || 'Koreksi Kehadiran',
          proofUrl: req.body.proofUrl || req.body.proof_url,
          attachments: req.body.attachments,
          unit: req.body.unit,
          unitId: req.body.unitId || req.body.unit_id,
          tenantId,
          requestedBy: username || 'Operator',
          requestedById: authUser?.user_id || `USR-${username}`
        });

        if (!result.success) {
          return res.status(400).json({ success: false, error: result.error });
        }

        return res.status(201).json({ success: true, message: 'Pengajuan koreksi berhasil dikirim', data: result.data });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    case 'submitCorrection': {
      try {
        const id = req.params?.id || req.body?.id;
        const result = smartAttendanceService.submitCorrection(tenantId, String(id), authUser?.user_id || username);
        if (!result) {
          return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Koreksi tidak ditemukan.' } });
        }
        return res.json({ success: true, message: 'Pengajuan koreksi submitted.', data: result });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    case 'reviewCorrection': {
      try {
        const id = req.params?.id || req.body?.id;
        const result = smartAttendanceService.reviewCorrection({
          tenantId,
          correctionId: String(id),
          reviewerId: authUser?.user_id || 'REV-01',
          reviewerName: username || 'Peninjau Administrasi',
          comment: req.body?.comment
        });
        if (!result) {
          return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Koreksi tidak ditemukan.' } });
        }
        return res.json({ success: true, message: 'Koreksi dalam proses review.', data: result });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    case 'approveCorrection': {
      try {
        const id = req.params?.id || req.body?.correctionId || req.body?.id;
        const corrStatus = req.body?.status || 'APPROVED';
        const result = smartAttendanceService.approveCorrection({
          correctionId: String(id),
          status: corrStatus,
          approvedBy: username || 'Admin Approver',
          approverId: authUser?.user_id || `USR-${username}`,
          rejectionReason: req.body?.rejectionReason || req.body?.reason,
          comment: req.body?.comment,
          tenantId
        });

        if (!result.success) {
          return res.status(400).json({ success: false, error: result.error });
        }

        return res.json({ success: true, message: `Pengajuan koreksi berhasil di-${corrStatus.toLowerCase()}`, data: result.data });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    case 'rejectCorrection': {
      try {
        const id = req.params?.id || req.body?.correctionId || req.body?.id;
        const reason = req.body?.reason || req.body?.rejectionReason || req.body?.comment;

        if (!reason) {
          return res.status(400).json({ success: false, error: { code: 'REASON_REQUIRED', message: 'Alasan penolakan wajib diisi.' } });
        }

        const result = smartAttendanceService.approveCorrection({
          correctionId: String(id),
          status: 'REJECTED',
          approvedBy: username || 'Admin Approver',
          approverId: authUser?.user_id || `USR-${username}`,
          rejectionReason: reason,
          comment: reason,
          tenantId
        });

        if (!result.success) {
          return res.status(400).json({ success: false, error: result.error });
        }

        return res.json({ success: true, message: 'Pengajuan koreksi berhasil ditolak', data: result.data });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    case 'cancelCorrection': {
      try {
        const id = req.params?.id || req.body?.id;
        const result = smartAttendanceService.cancelCorrection({
          tenantId,
          correctionId: String(id),
          requesterId: authUser?.user_id || username
        });

        if (!result.success) {
          return res.status(400).json({ success: false, error: result.error });
        }

        return res.json({ success: true, message: 'Pengajuan koreksi berhasil dibatalkan.', data: result.data });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    case 'getSecurityAlerts': {
      try {
        const gateStats = smartAttendanceService.getGateStats(tenantId);
        const logs = smartAttendanceService.getAuditLogs(tenantId);
        const alerts = logs.filter((l: any) => l.action?.includes('FAIL') || l.result === 'REJECTED' || l.action?.includes('DENIED') || l.details?.includes('Terlambat') || l.details?.includes('MOCK'));
        return res.json({ success: true, message: 'Security alerts loaded', data: alerts, gateStats });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    case 'getAttendanceReports':
    case 'getSummaryReport': {
      try {
        const queryParams = { ...req.query, ...req.body };
        const reports = smartAttendanceService.getReports({ tenantId, userAuth: authUser, ...queryParams });
        return res.json({ success: true, message: 'Reports summary loaded', data: reports });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    case 'getStudentReport': {
      try {
        const queryParams = { ...req.query, ...req.body };
        const reports = smartAttendanceService.getStudentReport({ tenantId, userAuth: authUser, ...queryParams });
        return res.json({ success: true, message: 'Laporan presensi siswa loaded', ...reports });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    case 'getEmployeeReport': {
      try {
        const queryParams = { ...req.query, ...req.body };
        const reports = smartAttendanceService.getEmployeeReport({ tenantId, userAuth: authUser, ...queryParams });
        return res.json({ success: true, message: 'Laporan presensi karyawan loaded', ...reports });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    case 'getTeacherReport': {
      try {
        const queryParams = { ...req.query, ...req.body };
        const reports = smartAttendanceService.getEmployeeReport({ tenantId, role: 'GURU', userAuth: authUser, ...queryParams });
        return res.json({ success: true, message: 'Laporan presensi guru loaded', ...reports });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    case 'getLateReport': {
      try {
        const queryParams = { ...req.query, ...req.body };
        const reports = smartAttendanceService.getLateReport({ tenantId, userAuth: authUser, ...queryParams });
        return res.json({ success: true, message: 'Laporan keterlambatan loaded', ...reports });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    case 'getAbsenceReport': {
      try {
        const queryParams = { ...req.query, ...req.body };
        const reports = smartAttendanceService.getAbsenceReport({ tenantId, userAuth: authUser, ...queryParams });
        return res.json({ success: true, message: 'Laporan ketidakhadiran loaded', ...reports });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    case 'getGateReport': {
      try {
        const queryParams = { ...req.query, ...req.body };
        const reports = smartAttendanceService.getGateReport({ tenantId, userAuth: authUser, ...queryParams });
        return res.json({ success: true, message: 'Laporan gate security loaded', ...reports });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    case 'getQrReport': {
      try {
        const queryParams = { ...req.query, ...req.body };
        const reports = smartAttendanceService.getQrReport({ tenantId, userAuth: authUser, ...queryParams });
        return res.json({ success: true, message: 'Laporan scanning QR loaded', ...reports });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    case 'getGpsReport': {
      try {
        const queryParams = { ...req.query, ...req.body };
        const reports = smartAttendanceService.getGpsReport({ tenantId, userAuth: authUser, ...queryParams });
        return res.json({ success: true, message: 'Laporan GPS check-in loaded', ...reports });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    case 'getManualReport': {
      try {
        const queryParams = { ...req.query, ...req.body };
        const reports = smartAttendanceService.getManualReport({ tenantId, userAuth: authUser, ...queryParams });
        return res.json({ success: true, message: 'Laporan presensi manual loaded', ...reports });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    case 'getCorrectionReport': {
      try {
        const queryParams = { ...req.query, ...req.body };
        const reports = smartAttendanceService.getCorrectionReport({ tenantId, userAuth: authUser, ...queryParams });
        return res.json({ success: true, message: 'Laporan koreksi presensi loaded', ...reports });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    case 'getAuditReport': {
      try {
        const queryParams = { ...req.query, ...req.body };
        const reports = smartAttendanceService.getAuditReport({ tenantId, userAuth: authUser, ...queryParams });
        return res.json({ success: true, message: 'Laporan audit trail loaded', ...reports });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    case 'exportReport': {
      try {
        const reportType = req.body?.reportType || req.query?.reportType || 'summary';
        const format = req.body?.format || req.query?.format || 'pdf';
        const filters = req.body?.filters || req.query || {};

        const exportResult = smartAttendanceService.exportReportEngine({
          tenantId,
          userId: authUser?.user_id || `USR-${username}`,
          username: username || 'Operator',
          reportType,
          format,
          filters
        });

        if (format === 'csv') {
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', `attachment; filename="${exportResult.job.filename}"`);
          return res.send(exportResult.content);
        }

        return res.json({
          success: true,
          message: 'Export job generated successfully',
          data: exportResult.job,
          htmlPreview: exportResult.content
        });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    case 'getExportHistory': {
      try {
        const history = smartAttendanceService.getExportHistory(tenantId, authUser?.user_id);
        return res.json({ success: true, message: 'Export history loaded', data: history });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    case 'getExportJobDetail': {
      try {
        const jobId = req.params?.id || req.query?.jobId || req.body?.jobId;
        const job = smartAttendanceService.getExportJobDetail(String(jobId), tenantId);
        if (!job) {
          return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Job ekspor tidak ditemukan.' } });
        }
        return res.json({ success: true, message: 'Detail job ekspor loaded', data: job });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    case 'checkIn':
    case 'check-in': {
      try {
        const method = req.body.method || 'GPS';
        let result: any;
        if (method === 'QR') {
          result = await smartAttendanceService.processEmployeeQrAttendance({
            employeeId: req.body.personId || req.body.person_id || authUser?.id || 'EMP-01',
            employeeName: req.body.personName || req.body.name || username || authUser?.username || 'Pegawai',
            role: role || req.body.role || 'PEGAWAI',
            qrToken: req.body.qrToken || req.body.token,
            type: 'MASUK',
            tenantId,
            clientTxId: req.body.clientTxId
          });
        } else {
          result = await smartAttendanceService.processEmployeeGpsAttendance({
            employeeId: req.body.personId || req.body.person_id || authUser?.id || 'EMP-01',
            employeeName: req.body.personName || req.body.name || username || authUser?.username || 'Pegawai',
            role: role || req.body.role || 'PEGAWAI',
            latitude: Number(req.body.latitude || req.body.lat || 0),
            longitude: Number(req.body.longitude || req.body.lng || 0),
            accuracy: Number(req.body.accuracy || 10),
            isMockLocation: Boolean(req.body.isMockLocation || req.body.is_mock),
            type: 'MASUK',
            tenantId,
            notes: req.body.notes || req.body.details,
            clientTxId: req.body.clientTxId
          });
        }

        if (result.success || result.status === 'SUCCESS' || result.status === 'PRESENT' || result.status === 'LATE') {
          logActivity(tenantId, authUser?.id || 'system', username, role, 'CREATE', 'Absensi Enterprise', `Absen Masuk via ${method} sukses untuk ${req.body.personName || req.body.name || username}`);
          return res.json({ success: true, message: 'Presensi Check-In berhasil dicatat!', data: result.record || result });
        } else {
          return res.json({ success: false, message: result.message || 'Presensi Check-In gagal.' });
        }
      } catch (err: any) {
        return res.json({ success: false, message: err.message });
      }
    }

    case 'checkOut':
    case 'check-out': {
      try {
        const method = req.body.method || 'GPS';
        let result: any;
        if (method === 'QR') {
          result = await smartAttendanceService.processEmployeeQrAttendance({
            employeeId: req.body.personId || req.body.person_id || authUser?.id || 'EMP-01',
            employeeName: req.body.personName || req.body.name || username || authUser?.username || 'Pegawai',
            role: role || req.body.role || 'PEGAWAI',
            qrToken: req.body.qrToken || req.body.token,
            type: 'PULANG',
            tenantId,
            clientTxId: req.body.clientTxId
          });
        } else {
          result = await smartAttendanceService.processEmployeeGpsAttendance({
            employeeId: req.body.personId || req.body.person_id || authUser?.id || 'EMP-01',
            employeeName: req.body.personName || req.body.name || username || authUser?.username || 'Pegawai',
            role: role || req.body.role || 'PEGAWAI',
            latitude: Number(req.body.latitude || req.body.lat || 0),
            longitude: Number(req.body.longitude || req.body.lng || 0),
            accuracy: Number(req.body.accuracy || 10),
            isMockLocation: Boolean(req.body.isMockLocation || req.body.is_mock),
            type: 'PULANG',
            tenantId,
            notes: req.body.notes || req.body.details,
            clientTxId: req.body.clientTxId
          });
        }

        if (result.success || result.status === 'SUCCESS' || result.status === 'PRESENT' || result.status === 'LATE') {
          logActivity(tenantId, authUser?.id || 'system', username, role, 'UPDATE', 'Absensi Enterprise', `Absen Pulang via ${method} sukses untuk ${req.body.personName || req.body.name || username}`);
          return res.json({ success: true, message: 'Presensi Check-Out berhasil dicatat!', data: result.record || result });
        } else {
          return res.json({ success: false, message: result.message || 'Presensi Check-Out gagal.' });
        }
      } catch (err: any) {
        return res.json({ success: false, message: err.message });
      }
    }

    case 'today':
    case 'getToday': {
      try {
        const personId = req.query.personId || req.body.personId || authUser?.id || 'G-002';
        const dateToday = new Date().toISOString().split('T')[0];
        
        // Query the main source of truth (Prisma)
        const record = await PrismaEngine.attendance.findFirst({
          where: {
            tenant_id: tenantId,
            OR: [
              { student_id: String(personId) },
              { user_id: String(personId) }
            ],
            date: dateToday,
            deleted_at: null
          }
        }).catch(() => null);

        const data = {
          date: dateToday,
          hasCheckIn: !!record,
          hasCheckOut: !!(record && record.time_out),
          record: record ? {
            id: record.id,
            personId: record.student_id || record.user_id,
            personName: authUser?.name || 'User',
            date: record.date,
            timeIn: record.time_in ? new Date(record.time_in).toTimeString().substring(0, 8) : null,
            timeOut: record.time_out ? new Date(record.time_out).toTimeString().substring(0, 8) : null,
            status: record.status === 'HADIR' ? 'HADIR' : record.status,
            type: record.type,
            details: record.notes || ''
          } : null,
          shift: {
            code: 'REG-PAGI',
            name: 'Shift Reguler Pagi',
            timeIn: '07:00',
            timeOut: '15:30',
            gracePeriodMinutes: 10
          }
        };

        return res.json({ success: true, message: 'Status presensi hari ini berhasil dimuat', data });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    case 'myHistory':
    case 'history': {
      try {
        const personId = req.query.personId || req.body.personId || authUser?.id || 'G-002';
        const month = req.query.month || req.body.month;
        const year = req.query.year || req.body.year;

        const records = await PrismaEngine.attendance.findMany({
          where: {
            tenant_id: tenantId,
            OR: [
              { student_id: String(personId) },
              { user_id: String(personId) }
            ],
            deleted_at: null
          },
          orderBy: { date: 'desc' }
        }).catch(() => []);

        let filtered = records;
        if (month && year) {
          filtered = records.filter((r: any) => {
            const parts = r.date.split('-');
            return Number(parts[1]) === Number(month) && Number(parts[0]) === Number(year);
          });
        }

        const data = filtered.map((r: any) => ({
          id: r.id,
          personId: r.student_id || r.user_id,
          date: r.date,
          timeIn: r.time_in ? new Date(r.time_in).toTimeString().substring(0, 8) : null,
          timeOut: r.time_out ? new Date(r.time_out).toTimeString().substring(0, 8) : null,
          status: r.status === 'HADIR' ? 'HADIR' : r.status,
          type: r.type,
          details: r.notes || ''
        }));

        return res.json({ success: true, message: 'Riwayat presensi berhasil dimuat', data });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    case 'manualRequest':
    case 'manual-request': {
      try {
        const result = smartAttendanceService.requestCorrection({
          personId: req.body.personId || req.body.person_id || authUser?.id || 'P-101',
          personName: req.body.personName || req.body.name || username || 'Staff / Guru',
          role: req.body.role || role || 'GURU',
          date: req.body.date || new Date().toISOString().split('T')[0],
          requestedDate: req.body.date || new Date().toISOString().split('T')[0],
          type: 'MANUAL_ATTENDANCE_REQUEST',
          targetStatus: req.body.status || 'PRESENT',
          requestedStatus: req.body.status || 'PRESENT',
          checkInTime: req.body.time || '07:00',
          reason: req.body.reason || 'Kamera HP Bermasalah / GPS Glitch',
          proofUrl: req.body.proofPhoto || req.body.attachmentBase64,
          tenantId,
          requestedBy: username || 'Operator',
          requestedById: authUser?.id || `USR-${username}`
        });

        if (!result.success) {
          return res.status(400).json({ success: false, error: result.error });
        }

        logActivity(tenantId, authUser?.id || 'system', username, role, 'CREATE', 'Absensi Enterprise', `Pengajuan absensi manual oleh ${req.body.personName || username}`);
        return res.json({ success: true, message: 'Pengajuan absensi manual berhasil dikirim & menunggu approval.', data: result.data });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    case 'submitLeave':
    case 'leave': {
      try {
        const leaveData = {
          id: `LEAVE-${Date.now()}`,
          tenant_id: tenantId,
          person_id: req.body.personId || authUser?.id,
          person_name: req.body.personName || username,
          role: req.body.role || role,
          type: req.body.type || 'IZIN', // IZIN, SAKIT, CUTI, DL
          start_date: req.body.startDate || req.body.start_date,
          end_date: req.body.endDate || req.body.end_date,
          reason: req.body.reason || '',
          attachment_base64: req.body.attachmentBase64 || '',
          status: 'PENDING_APPROVAL',
          created_at: new Date().toISOString()
        };
        const leavePermission = await PrismaEngine.leavePermission.create({
          data: {
            id: leaveData.id,
            tenant_id: tenantId,
            student_id: leaveData.person_id || 'PER-01',
            reason: leaveData.reason,
            start_date: new Date(leaveData.start_date || new Date()),
            end_date: new Date(leaveData.end_date || new Date()),
            status: 'PENDING',
            created_at: new Date(),
            updated_at: new Date()
          }
        }).catch(() => leaveData);

        logActivity(tenantId, authUser?.id || 'system', username, role, 'CREATE', 'Perizinan Mobile', `Pengajuan ${leaveData.type} oleh ${leaveData.person_name}`);
        return res.json({ success: true, message: 'Pengajuan izin berhasil dikirim & menunggu persetujuan.', data: leavePermission });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    case 'report':
    case 'getReport': {
      try {
        const { startDate, endDate, role: filterRole, department } = req.body || req.query || {};
        
        const records = await PrismaEngine.attendance.findMany({
          where: {
            tenant_id: tenantId,
            deleted_at: null
          }
        }).catch(() => []);

        let filtered = records;
        if (startDate && endDate) {
          filtered = records.filter((r: any) => r.date >= startDate && r.date <= endDate);
        }
        if (filterRole) {
          filtered = filtered.filter((r: any) => r.type === filterRole);
        }

        const totalHadir = filtered.filter((r: any) => r.status === 'HADIR' || r.status === 'PRESENT').length;
        const totalTerlambat = filtered.filter((r: any) => r.status === 'TERLAMBAT' || r.status === 'LATE').length;
        const totalIzin = filtered.filter((r: any) => r.status === 'IZIN' || r.status === 'PERMITTED').length;
        const totalSakit = filtered.filter((r: any) => r.status === 'SAKIT' || r.status === 'SICK').length;
        const totalCuti = filtered.filter((r: any) => r.status === 'CUTI').length;
        const totalAlpha = filtered.filter((r: any) => r.status === 'ALPHA' || r.status === 'ALFA' || r.status === 'ABSENT').length;

        const data = {
          summary: {
            totalRecords: filtered.length,
            totalHadir,
            totalTerlambat,
            totalIzin,
            totalSakit,
            totalCuti,
            totalAlpha,
            punctualityPercentage: filtered.length > 0 ? Math.round((totalHadir / filtered.length) * 100) : 100
          },
          records: filtered.map((r: any) => ({
            id: r.id,
            personId: r.student_id || r.user_id,
            personName: r.student_id ? 'Siswa' : 'Staff',
            date: r.date,
            timeIn: r.time_in ? new Date(r.time_in).toTimeString().substring(0, 8) : null,
            timeOut: r.time_out ? new Date(r.time_out).toTimeString().substring(0, 8) : null,
            status: r.status === 'HADIR' || r.status === 'PRESENT' ? 'HADIR' : r.status,
            type: r.type,
            details: r.notes || ''
          }))
        };

        return res.json({ success: true, message: 'Laporan presensi berhasil dibuat', data });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }
    
    case 'smartAttendance': {
      try {
        const { method, data, type: typeBody, location_lat, location_lng } = req.body;
        const userId = authUser?.id || data?.user_id || 'USR-01';
        const personName = data?.personName || username || 'User';

        if (typeBody === 'STUDENT') {
          const result = await smartAttendanceService.scanStudentQr({
            token: data?.qrToken || data?.token || 'STUDENT:S-101',
            source: 'SECURITY_GATE',
            scannedBy: username || 'Smart Gateway',
            role: role || 'SECURITY',
            tenantId
          });
          return res.json({ success: result.status === 'SUCCESS', ...result });
        } else {
          let result: any;
          if (method === 'QR_CODE') {
            result = await smartAttendanceService.processEmployeeQrAttendance({
              employeeId: userId,
              employeeName: personName,
              role: role || 'PEGAWAI',
              qrToken: data?.qrToken || data?.token || 'QR-LOC-GATE-UTAMA-2026',
              type: 'MASUK',
              tenantId
            });
          } else {
            result = await smartAttendanceService.processEmployeeGpsAttendance({
              employeeId: userId,
              employeeName: personName,
              role: role || 'PEGAWAI',
              latitude: Number(location_lat || data?.latitude || -6.2088),
              longitude: Number(location_lng || data?.longitude || 106.8456),
              accuracy: 10,
              isMockLocation: false,
              type: 'MASUK',
              tenantId
            });
          }
          return res.json({ success: result.success, message: result.message, data: result.record });
        }
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    case 'getRules': {
      const repo = new AttendanceRepository();
      const service = new AttendanceService(repo);
      try {
        const data = await service.getRules(tenantId);
        return res.json({ success: true, message: 'Success', data: data[0] || {} });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    case 'saveRules': {
      const repo = new AttendanceRepository();
      const service = new AttendanceService(repo);
      try {
        const data = await service.saveRules(req.body, tenantId);
        logActivity(tenantId, authUser?.id || 'system', username, role, 'UPDATE', 'Absensi Enterprise', 'Mengubah konfigurasi aturan absensi');
        return res.json({ success: true, message: 'Aturan absensi berhasil diperbarui!', data });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    case 'getReplacements': {
      const repo = new AttendanceRepository();
      const service = new AttendanceService(repo);
      try {
        const data = await service.getReplacements(tenantId);
        return res.json({ success: true, message: 'Success', data });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    case 'saveReplacement': {
      const repo = new AttendanceRepository();
      const service = new AttendanceService(repo);
      try {
        const data = await service.saveReplacement(req.body, tenantId);
        logActivity(tenantId, authUser?.id || 'system', username, role, 'CREATE', 'Absensi Enterprise', `Pilih guru pengganti ${req.body.substituteTeacherName} untuk ${req.body.courseName}`);
        return res.json({ success: true, message: 'Guru pengganti berhasil dijadwalkan!', data });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    case 'getGeofences': {
      const repo = new AttendanceRepository();
      const service = new AttendanceService(repo);
      try {
        const data = await service.getGeofences(tenantId);
        return res.json({ success: true, message: 'Success', data });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    case 'saveGeofence': {
      const repo = new AttendanceRepository();
      const service = new AttendanceService(repo);
      try {
        const data = await service.saveGeofence(req.body, tenantId);
        logActivity(tenantId, authUser?.id || 'system', username, role, 'CREATE', 'Absensi Enterprise', `Menambahkan geofence lokasi ${req.body.location_name}`);
        return res.json({ success: true, message: 'Lokasi geofence berhasil ditambahkan!', data });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    case 'importAttendances': {
      try {
        const list = req.body.items || [];
        for (const item of list) {
          if (item.type === 'STUDENT' || item.role === 'SISWA' || item.role === 'SANTRI') {
            await smartAttendanceService.scanStudentQr({
              token: item.qrToken || item.personId || item.studentId || 'S-101',
              source: 'SECURITY_GATE',
              scannedBy: 'System Import',
              role: 'SECURITY',
              tenantId
            });
          } else {
            await smartAttendanceService.processEmployeeGpsAttendance({
              employeeId: item.personId || item.employeeId || 'EMP-01',
              employeeName: item.personName || item.name || 'Staff',
              role: item.role || 'PEGAWAI',
              latitude: Number(item.latitude || item.lat || -6.2088),
              longitude: Number(item.longitude || item.lng || 106.8456),
              accuracy: 10,
              isMockLocation: false,
              type: 'MASUK',
              tenantId,
              notes: item.notes || 'Imported'
            });
          }
        }
        logActivity(tenantId, authUser?.id || 'system', username, role, 'IMPORT', 'Absensi Enterprise', `Import ${list.length} data presensi sukses.`);
        return res.json({ success: true, message: `Berhasil mengimpor ${list.length} data presensi!` });
      } catch (err: any) {
        return res.json({ success: false, message: err.message });
      }
    }

    case 'getLeavePermissions': {
      const list = await PrismaEngine.leavePermission.findMany({
        where: { tenant_id: tenantId, deleted_at: null }
      });
      return res.json({ success: true, message: 'Success', data: list });
    }

    case 'updateLeavePermission': {
      const { id, status } = req.body;
      const perm = await PrismaEngine.leavePermission.findFirst({
        where: { id, tenant_id: tenantId }
      });
      if (!perm) return res.json({ success: false, message: 'Izin tidak ditemukan' });

      const updated = await PrismaEngine.leavePermission.update({
        where: { id },
        data: {
          status,
          updated_at: new Date(),
          updated_by: authUser.id
        }
      });
      logActivity(tenantId, authUser.id, username, role, 'UPDATE', 'Perizinan', `Mengubah status izin santri ID ${perm.student_id} menjadi ${status}`);
      return res.json({ success: true, message: 'Status izin berhasil diperbarui', data: updated });
    }

    case 'meetingJoin': {
      const tId = req.body.tenant_id || tenantId;
      const { schedule_id, guest_name, role_override } = req.body;
      if (!schedule_id) {
        return res.status(400).json({ success: false, message: 'Schedule ID is required' });
      }

      const schedule = await PrismaEngine.meetingSchedule.findFirst({
        where: { id: schedule_id, deleted_at: null }
      });
      if (!schedule) {
        return res.status(404).json({ success: false, message: 'Schedule not found' });
      }

      // Find or create active session
      let session = await PrismaEngine.meetingSession.findFirst({
        where: { schedule_id, status: 'ACTIVE', deleted_at: null }
      });
      if (!session) {
        session = await PrismaEngine.meetingSession.create({
          data: {
            id: `mses-active-${Date.now()}`,
            tenant_id: tId,
            schedule_id,
            actual_start_time: new Date(),
            actual_end_time: null,
            recording_status: 'NONE',
            status: 'ACTIVE',
            created_at: new Date(),
            updated_at: new Date(),
            deleted_at: null,
            created_by: authUser.id,
            updated_by: authUser.id
          }
        });

        // Update schedule status to ONGOING
        await PrismaEngine.meetingSchedule.update({
          where: { id: schedule_id },
          data: { status: 'ONGOING' }
        });
      }

      // Check waiting room constraint
      const mSettings = await PrismaEngine.meetingSetting.findFirst({
        where: { schedule_id }
      });
      const isHost = schedule.host_id === authUser.id;

      if (mSettings?.require_waiting_room && !isHost && authUser.role !== 'SUPER_ADMIN') {
        const waitId = `mwr-${Date.now()}`;
        await PrismaEngine.meetingWaitingRoom.create({
          data: {
            id: waitId,
            tenant_id: tId,
            session_id: session.id,
            user_id: authUser.id,
            name: authUser.name,
            role: authUser.role,
            status: 'PENDING',
            requested_at: new Date(),
            created_at: new Date(),
            updated_at: new Date(),
            deleted_at: null,
            created_by: authUser.id,
            updated_by: authUser.id
          }
        });
        return res.json({ success: true, waiting: true, waiting_room_id: waitId, session_id: session.id, message: 'Harap tunggu di ruang tunggu sampai host menyetujui Anda.' });
      }

      // Create participant entry
      const pId = `mpar-join-${Date.now()}`;
      const newParticipant = await PrismaEngine.meetingParticipant.create({
        data: {
          id: pId,
          tenant_id: tId,
          session_id: session.id,
          user_id: authUser.id,
          name: guest_name || authUser.name,
          role: role_override || (authUser.role === 'GURU' ? 'Teacher' : authUser.role === 'SUPER_ADMIN' ? 'Teacher' : 'Student'),
          joined_at: new Date(),
          left_at: null,
          status: 'JOINED',
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
          created_by: authUser.id,
          updated_by: authUser.id
        }
      });

      logActivity(tId, authUser.id, authUser.username, authUser.role, 'JOIN', 'Video Conference', `User ${authUser.name} bergabung ke room "${schedule.title}"`);
      return res.json({ success: true, waiting: false, data: { session, participant: newParticipant, schedule } });
    }

    case 'meetingAttendance': {
      const tId = req.body.tenant_id || tenantId;
      const { session_id, participant_id, status, join_duration_minutes, sync } = req.body;

      if (session_id && participant_id && status) {
        const existingAtt = await PrismaEngine.meetingAttendance.findFirst({
          where: { session_id, participant_id }
        });
        const participant = await PrismaEngine.meetingParticipant.findFirst({
          where: { id: participant_id }
        });
        const mSession = await PrismaEngine.meetingSession.findFirst({
          where: { id: session_id }
        });
        const schedule = mSession ? await PrismaEngine.meetingSchedule.findFirst({
          where: { id: mSession.schedule_id }
        }) : null;

        let attObj: any;
        if (existingAtt) {
          attObj = await PrismaEngine.meetingAttendance.update({
            where: { id: existingAtt.id },
            data: {
              status,
              join_duration_minutes: join_duration_minutes || existingAtt.join_duration_minutes,
              updated_at: new Date()
            }
          });
        } else {
          attObj = await PrismaEngine.meetingAttendance.create({
            data: {
              id: `matt-${Date.now()}`,
              tenant_id: tId,
              session_id,
              participant_id,
              user_id: participant ? participant.user_id : null,
              status,
              join_duration_minutes: join_duration_minutes || 0,
              synced_to_academic: false,
              created_at: new Date(),
              updated_at: new Date(),
              deleted_at: null,
              created_by: authUser.id,
              updated_by: authUser.id
            }
          });
        }

        // AUTO-SYNC TO ACADEMIC ATTENDANCE
        if ((sync || schedule?.meeting_type === 'Class') && attObj.user_id && !attObj.synced_to_academic) {
          const student = await PrismaEngine.student.findFirst({
            where: { id: attObj.user_id, deleted_at: null }
          });
          if (student) {
            const mappedStatus = status === 'Present' || status === 'Late' ? 'HADIR' : status === 'Left Early' ? 'HADIR' : 'ALFA';
            const noteText = status === 'Late' ? 'Terlambat via Kelas Online' : status === 'Left Early' ? 'Pulang Cepat via Kelas Online' : 'Kelas Online';

            await PrismaEngine.attendance.create({
              data: {
                id: `att-online-${Date.now()}`,
                tenant_id: tId,
                student_id: student.id,
                date: new Date().toISOString().split('T')[0],
                status: mappedStatus,
                notes: noteText,
                created_at: new Date(),
                updated_at: new Date(),
                deleted_at: null,
                created_by: 'system_meeting_sync',
                updated_by: 'system_meeting_sync'
              } as any
            });

            attObj = await PrismaEngine.meetingAttendance.update({
              where: { id: attObj.id },
              data: { synced_to_academic: true }
            });
          }
        }

        return res.json({ success: true, message: 'Attendance recorded successfully', data: attObj });
      }

      // Query attendance reports
      const attendancesList = await PrismaEngine.meetingAttendance.findMany({
        where: { tenant_id: tId }
      });
      const enriched = await Promise.all(attendancesList.map(async (att: any) => {
        const p = await PrismaEngine.meetingParticipant.findFirst({
          where: { id: att.participant_id }
        });
        const ses = await PrismaEngine.meetingSession.findFirst({
          where: { id: att.session_id }
        });
        const sch = ses ? await PrismaEngine.meetingSchedule.findFirst({
          where: { id: ses.schedule_id }
        }) : null;
        return {
          ...att,
          participant_name: p ? p.name : 'Unknown User',
          participant_role: p ? p.role : 'Guest',
          meeting_title: sch ? sch.title : 'Live Meeting',
          meeting_date: sch ? sch.start_time : ''
        };
      }));

      return res.json({ success: true, message: 'Success', data: enriched });
    }

    case 'meetingRecording': {
      const tId = req.body.tenant_id || tenantId;
      if (req.method === 'POST' || req.body.create) {
        const { session_id, storage_type, file_name, file_url, file_size_mb, duration_seconds } = req.body;
        if (!session_id || !file_name || !file_url) {
          return res.status(400).json({ success: false, message: 'Session ID, file name, and URL are required' });
        }

        const newRec = await PrismaEngine.meetingRecording.create({
          data: {
            id: `mrec-${Date.now()}`,
            tenant_id: tId,
            session_id,
            storage_type: storage_type || 'Cloud',
            file_name,
            file_url,
            file_size_mb: file_size_mb || 50,
            duration_seconds: duration_seconds || 3600,
            status: 'AVAILABLE',
            created_at: new Date(),
            updated_at: new Date(),
            deleted_at: null,
            created_by: authUser.id,
            updated_by: authUser.id
          }
        });
        return res.json({ success: true, message: 'Recording added successfully', data: newRec });
      }

      // GET recordings library
      const list = await PrismaEngine.meetingRecording.findMany({
        where: { tenant_id: tId, deleted_at: null }
      });
      const enriched = await Promise.all(list.map(async (rec: any) => {
        const ses = await PrismaEngine.meetingSession.findFirst({
          where: { id: rec.session_id }
        });
        const sch = ses ? await PrismaEngine.meetingSchedule.findFirst({
          where: { id: ses.schedule_id }
        }) : null;
        const host = sch ? await PrismaEngine.user.findFirst({
          where: { id: sch.host_id }
        }) : null;
        return {
          ...rec,
          meeting_title: sch ? sch.title : 'Saved Session',
          meeting_type: sch ? sch.meeting_type : 'Meeting',
          host_name: host ? host.name : 'Sistem'
        };
      }));

      return res.json({ success: true, message: 'Success', data: enriched });
    }

    case 'meetingChat': {
      const tId = req.body.tenant_id || tenantId;
      const { session_id, message } = req.body;
      if (req.method === 'POST' || message) {
        if (!session_id || !message) {
          return res.status(400).json({ success: false, message: 'Session ID and message are required' });
        }
        const newMsg = await PrismaEngine.meetingChatMessage.create({
          data: {
            id: `mmsg-${Date.now()}`,
            tenant_id: tId,
            session_id,
            sender_id: authUser.id,
            sender_name: authUser.name,
            sender_role: authUser.role === 'GURU' ? 'Teacher' : authUser.role === 'SUPER_ADMIN' ? 'Teacher' : 'Student',
            message,
            sent_at: new Date(),
            created_at: new Date(),
            updated_at: new Date(),
            deleted_at: null,
            created_by: authUser.id,
            updated_by: authUser.id
          }
        });
        return res.json({ success: true, message: 'Message sent successfully', data: newMsg });
      }

      const sessionMessages = await PrismaEngine.meetingChatMessage.findMany({
        where: { session_id, deleted_at: null }
      });
      return res.json({ success: true, message: 'Success', data: sessionMessages });
    }

    case 'meetingPoll': {
      const tId = req.body.tenant_id || tenantId;
      const { session_id, question, poll_type, options, poll_id, answer } = req.body;

      // Vote operation
      if (poll_id && answer) {
        const existingAns = await PrismaEngine.meetingPollAnswer.findFirst({
          where: { poll_id, user_id: authUser.id }
        });
        if (existingAns) {
          await PrismaEngine.meetingPollAnswer.update({
            where: { id: existingAns.id },
            data: {
              answer,
              updated_at: new Date()
            }
          });
        } else {
          await PrismaEngine.meetingPollAnswer.create({
            data: {
              id: `mpoa-${Date.now()}`,
              tenant_id: tId,
              poll_id,
              user_id: authUser.id,
              answer,
              answered_at: new Date(),
              created_at: new Date(),
              updated_at: new Date(),
              deleted_at: null,
              created_by: authUser.id,
              updated_by: authUser.id
            }
          });
        }
        return res.json({ success: true, message: 'Answer recorded successfully' });
      }

      // Create operation
      if (session_id && question && poll_type) {
        const newPoll = await PrismaEngine.meetingPoll.create({
          data: {
            id: `mpol-${Date.now()}`,
            tenant_id: tId,
            session_id,
            question,
            poll_type,
            options: options || [],
            status: 'OPEN',
            created_at: new Date(),
            updated_at: new Date(),
            deleted_at: null,
            created_by: authUser.id,
            updated_by: authUser.id
          }
        });
        return res.json({ success: true, message: 'Poll created successfully', data: newPoll });
      }

      // GET Polls with tallies
      const polls = await PrismaEngine.meetingPoll.findMany({
        where: { session_id, deleted_at: null }
      });
      const pollsEnriched = await Promise.all(polls.map(async (p: any) => {
        const answers = await PrismaEngine.meetingPollAnswer.findMany({
          where: { poll_id: p.id }
        });
        const results: Record<string, number> = {};
        if (p.options) {
          p.options.forEach((opt: string) => { results[opt] = 0; });
        }
        answers.forEach((ans: any) => {
          if (results[ans.answer] !== undefined) results[ans.answer]++;
          else results[ans.answer] = 1;
        });

        return {
          ...p,
          results,
          total_votes: answers.length,
          my_answer: answers.find((a: any) => a.user_id === authUser.id)?.answer
        };
      }));

      return res.json({ success: true, message: 'Success', data: pollsEnriched });
    }

    case 'meetingQuiz': {
      const tId = req.body.tenant_id || tenantId;
      const { session_id, title, quiz_type, questions, duration_minutes, quiz_id, score, answers } = req.body;

      // Submit Quiz Answer
      if (quiz_id && answers) {
        const existingAns = await PrismaEngine.meetingQuizAnswer.findFirst({
          where: { quiz_id, user_id: authUser.id }
        });
        const savedAnsData = {
          id: existingAns ? existingAns.id : `mqza-${Date.now()}`,
          tenant_id: tId,
          quiz_id,
          user_id: authUser.id,
          score: score || 0,
          answers,
          submitted_at: new Date(),
          created_at: existingAns ? existingAns.created_at : new Date(),
          updated_at: new Date(),
          deleted_at: null,
          created_by: authUser.id,
          updated_by: authUser.id
        };

        let savedAns: any;
        if (existingAns) {
          savedAns = await PrismaEngine.meetingQuizAnswer.update({
            where: { id: existingAns.id },
            data: {
              score: score || 0,
              answers,
              updated_at: new Date()
            }
          });
        } else {
          savedAns = await PrismaEngine.meetingQuizAnswer.create({
            data: savedAnsData
          });
        }

        return res.json({ success: true, message: 'Quiz submitted successfully', data: savedAns });
      }

      // Create Quiz
      if (session_id && title && quiz_type) {
        const newQuiz = await PrismaEngine.meetingQuiz.create({
          data: {
            id: `mqz-${Date.now()}`,
            tenant_id: tId,
            session_id,
            title,
            quiz_type,
            questions: questions || [],
            duration_minutes: duration_minutes || 10,
            status: 'OPEN',
            created_at: new Date(),
            updated_at: new Date(),
            deleted_at: null,
            created_by: authUser.id,
            updated_by: authUser.id
          }
        });
        return res.json({ success: true, message: 'Quiz created successfully', data: newQuiz });
      }

      // GET Quizzes list
      const quizzes = await PrismaEngine.meetingQuiz.findMany({
        where: { session_id, deleted_at: null }
      });
      const quizzesEnriched = await Promise.all(quizzes.map(async (q: any) => {
        const subs = await PrismaEngine.meetingQuizAnswer.findMany({
          where: { quiz_id: q.id }
        });
        const mySub = subs.find((qa: any) => qa.user_id === authUser.id);
        return {
          ...q,
          submissions_count: subs.length,
          my_submission: mySub ? { score: mySub.score, answers: mySub.answers } : null
        };
      }));

      return res.json({ success: true, message: 'Success', data: quizzesEnriched });
    }

    case 'meetingWhiteboard': {
      const tId = req.body.tenant_id || tenantId;
      const { session_id, elements, status } = req.body;

      if (!session_id) {
        return res.status(400).json({ success: false, message: 'Session ID is required' });
      }

      let wb = await PrismaEngine.meetingWhiteboard.findFirst({
        where: { session_id, deleted_at: null }
      });
      if (elements) {
        if (wb) {
          wb = await PrismaEngine.meetingWhiteboard.update({
            where: { id: wb.id },
            data: {
              elements,
              status: status || wb.status,
              updated_at: new Date(),
              updated_by: authUser.id
            }
          });
        } else {
          wb = await PrismaEngine.meetingWhiteboard.create({
            data: {
              id: `mwb-${Date.now()}`,
              tenant_id: tId,
              session_id,
              elements: elements || [],
              status: status || 'ACTIVE',
              created_at: new Date(),
              updated_at: new Date(),
              deleted_at: null,
              created_by: authUser.id,
              updated_by: authUser.id
            }
          });
        }
        return res.json({ success: true, message: 'Whiteboard saved successfully', data: wb });
      }

      if (!wb) {
        wb = await PrismaEngine.meetingWhiteboard.create({
          data: {
            id: `mwb-${Date.now()}`,
            tenant_id: tId,
            session_id,
            elements: [],
            status: 'ACTIVE',
            created_at: new Date(),
            updated_at: new Date(),
            deleted_at: null,
            created_by: authUser.id,
            updated_by: authUser.id
          }
        });
      }

      return res.json({ success: true, message: 'Success', data: wb });
    }

    case 'meetingAnalytics': {
      const tId = req.body.tenant_id || tenantId;

      const sessions = await PrismaEngine.meetingSession.findMany({
        where: { tenant_id: tId, deleted_at: null }
      });
      const schedules = await PrismaEngine.meetingSchedule.findMany({
        where: { tenant_id: tId, deleted_at: null }
      });
      const attendances = await PrismaEngine.meetingAttendance.findMany({
        where: { tenant_id: tId, deleted_at: null }
      });
      const recordings = await PrismaEngine.meetingRecording.findMany({
        where: { tenant_id: tId, deleted_at: null }
      });

      const totalMeetingsCount = schedules.length;
      const totalSessionsCount = sessions.length;

      // Calculate rates
      const participants = await PrismaEngine.meetingParticipant.findMany({
        where: { tenant_id: tId }
      });
      const totalParticipantsCount = participants.length;
      const totalPresents = attendances.filter((a: any) => a.status === 'Present').length;
      const totalLate = attendances.filter((a: any) => a.status === 'Late').length;
      const attendanceRate = attendances.length > 0 ? Math.round(((totalPresents + totalLate) / attendances.length) * 100) : 85;

      // Provider breakdown
      const providerBreakdown: Record<string, number> = {};
      for (const sc of schedules) {
        const room = await PrismaEngine.meetingRoom.findFirst({
          where: { id: sc.room_id }
        });
        const prov = room ? await PrismaEngine.meetingProvider.findFirst({
          where: { id: room.provider_id }
        }) : null;
        const name = prov ? prov.name : 'Custom WebRTC';
        providerBreakdown[name] = (providerBreakdown[name] || 0) + 1;
      }

      // Type breakdown
      const typeBreakdown: Record<string, number> = {};
      schedules.forEach((sc: any) => {
        typeBreakdown[sc.meeting_type] = (typeBreakdown[sc.meeting_type] || 0) + 1;
      });

      // Daily meeting timeline (last 7 days)
      const dailyMeetingTimeline: Record<string, number> = {};
      schedules.forEach((sc: any) => {
        if (sc.start_time) {
          const dateString = (sc.start_time instanceof Date)
            ? sc.start_time.toISOString()
            : String(sc.start_time);
          const day = dateString.split('T')[0];
          dailyMeetingTimeline[day] = (dailyMeetingTimeline[day] || 0) + 1;
        }
      });

      const timelineData = Object.keys(dailyMeetingTimeline).sort().map(key => ({
        date: key,
        count: dailyMeetingTimeline[key]
      }));

      const chatMessages = await PrismaEngine.meetingChatMessage.findMany({
        where: { tenant_id: tId }
      });

      return res.json({
        success: true,
        message: 'Success',
        data: {
          metrics: {
            total_meetings: totalMeetingsCount,
            completed_sessions: totalSessionsCount,
            attendance_rate: attendanceRate,
            average_duration_minutes: 74,
            recording_storage_used_gb: recordings.reduce((sum: number, r: any) => sum + (r.file_size_mb || 0), 0) / 1024,
            chat_messages_count: chatMessages.length
          },
          provider_breakdown: providerBreakdown,
          type_breakdown: typeBreakdown,
          timeline_data: timelineData.length > 0 ? timelineData : [{ date: new Date().toISOString().split('T')[0], count: totalMeetingsCount }]
        }
      });
    }

    case 'breakoutRoom': {
      const tId = req.body.tenant_id || tenantId;
      const { session_id, name, join_url, status } = req.body;
      if (req.method === 'POST' || req.body.create) {
        if (!session_id || !name) {
          return res.status(400).json({ success: false, message: 'Session ID and room name are required' });
        }
        const newBo = await PrismaEngine.meetingBreakoutRoom.create({
          data: {
            id: `mbo-${Date.now()}`,
            tenant_id: tId,
            session_id,
            name,
            join_url: join_url || `/learning/live-classroom?session_id=${session_id}&breakout=${Date.now()}`,
            status: status || 'ACTIVE',
            created_at: new Date(),
            updated_at: new Date(),
            deleted_at: null,
            created_by: authUser.id,
            updated_by: authUser.id
          }
        });
        return res.json({ success: true, message: 'Breakout room created', data: newBo });
      }

      const list = await PrismaEngine.meetingBreakoutRoom.findMany({
        where: { session_id, deleted_at: null }
      });
      return res.json({ success: true, message: 'Success', data: list });
    }

    case 'waitingRoom': {
      const { session_id, wait_id, status } = req.body;
      if (wait_id && status) {
        const wr = await PrismaEngine.meetingWaitingRoom.findFirst({
          where: { id: wait_id }
        });
        if (wr) {
          const updated = await PrismaEngine.meetingWaitingRoom.update({
            where: { id: wait_id },
            data: {
              status,
              updated_at: new Date(),
              updated_by: authUser.id
            }
          });
          return res.json({ success: true, message: `User ${status.toLowerCase()} successfully`, data: updated });
        }
        return res.status(404).json({ success: false, message: 'Waiting room record not found' });
      }

      const waiting = await PrismaEngine.meetingWaitingRoom.findMany({
        where: { session_id, status: 'PENDING', deleted_at: null }
      });
      return res.json({ success: true, message: 'Success', data: waiting });
    }

    case 'raiseHand': {
      const tId = req.body.tenant_id || tenantId;
      const { session_id, participant_id, status } = req.body;
      if (session_id && participant_id && status) {
        const existingRh = await PrismaEngine.meetingRaiseHand.findFirst({
          where: { session_id, participant_id }
        });
        if (existingRh) {
          const data: any = {
            status,
            updated_at: new Date()
          };
          if (status === 'LOWERED') data.lowered_at = new Date();
          await PrismaEngine.meetingRaiseHand.update({
            where: { id: existingRh.id },
            data
          });
        } else {
          await PrismaEngine.meetingRaiseHand.create({
            data: {
              id: `mrh-${Date.now()}`,
              tenant_id: tId,
              session_id,
              participant_id,
              status,
              raised_at: new Date(),
              lowered_at: null,
              created_at: new Date(),
              updated_at: new Date(),
              deleted_at: null,
              created_by: authUser.id,
              updated_by: authUser.id
            }
          });
        }
        return res.json({ success: true, message: 'Raise hand status updated successfully' });
      }

      const hands = await PrismaEngine.meetingRaiseHand.findMany({
        where: { session_id, status: 'RAISED', deleted_at: null }
      });
      return res.json({ success: true, message: 'Success', data: hands });
    }

    case 'meetingNotification': {
      const tId = req.body.tenant_id || tenantId;
      const { notification_id, is_read } = req.body;
      if (notification_id && is_read !== undefined) {
        const notif = await PrismaEngine.meetingNotification.findFirst({
          where: { id: notification_id }
        });
        if (notif) {
          await PrismaEngine.meetingNotification.update({
            where: { id: notification_id },
            data: {
              is_read,
              updated_at: new Date()
            }
          });
          return res.json({ success: true, message: 'Notification updated' });
        }
      }

      const list = await PrismaEngine.meetingNotification.findMany({
        where: { tenant_id: tId, user_id: authUser.id, deleted_at: null }
      });
      return res.json({ success: true, message: 'Success', data: list });
    }

    // =========================================================================
    // TASK 139: SMART ATTENDANCE CORE (SCHOOL & PESANTREN MANAGEMENT)
    // =========================================================================
    case 'studentScan':
    case 'scanStudentQr': {
      try {
        const token = req.body.token || req.body.qrToken || req.body.qrPayload;
        const source = req.body.source || 'SECURITY_GATE';
        const result = await smartAttendanceService.scanStudentQr({
          token,
          source,
          scannedBy: username || authUser?.username || 'Petugas Security',
          role: role || 'SECURITY',
          tenantId,
          clientTxId: req.body.clientTxId,
          unitId: req.body.unitId,
          classId: req.body.classId
        });
        return res.json({ success: result.status === 'SUCCESS', ...result });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    case 'studentManual':
    case 'saveStudentManualAttendance': {
      try {
        const result = await smartAttendanceService.saveStudentManualAttendance({
          rombel: req.body.rombel,
          unit: req.body.unit,
          date: req.body.date || new Date().toISOString().split('T')[0],
          records: req.body.records || [],
          teacherId: authUser?.id || 'TCH-01',
          teacherName: username || authUser?.username || 'Guru Pengampu',
          tenantId
        });
        return res.json(result);
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    case 'employeeGps':
    case 'processEmployeeGps': {
      try {
        const result = await smartAttendanceService.processEmployeeGpsAttendance({
          employeeId: req.body.employeeId || authUser?.id || 'EMP-01',
          employeeName: req.body.employeeName || username || authUser?.username || 'Pegawai',
          role: req.body.role || role || 'PEGAWAI',
          latitude: Number(req.body.latitude || req.body.lat),
          longitude: Number(req.body.longitude || req.body.lng),
          accuracy: Number(req.body.accuracy || 10),
          isMockLocation: Boolean(req.body.isMockLocation || req.body.is_mock),
          type: req.body.type || 'MASUK',
          tenantId,
          notes: req.body.notes,
          clientTxId: req.body.clientTxId
        });
        return res.json(result);
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    case 'employeeQr':
    case 'processEmployeeQr': {
      try {
        const result = await smartAttendanceService.processEmployeeQrAttendance({
          employeeId: req.body.employeeId || authUser?.id || 'EMP-01',
          employeeName: req.body.employeeName || username || authUser?.username || 'Pegawai',
          role: req.body.role || role || 'PEGAWAI',
          qrToken: req.body.qrToken,
          type: req.body.type || 'MASUK',
          tenantId,
          clientTxId: req.body.clientTxId
        });
        return res.json(result);
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    case 'getLocationPoints': {
      try {
        const points = smartAttendanceService.getLocationPoints(tenantId);
        return res.json({ success: true, data: points });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    case 'saveLocationPoint': {
      try {
        const point = smartAttendanceService.saveLocationPoint(req.body, tenantId);
        logActivity(tenantId, authUser?.id || 'system', username, role, 'UPDATE', 'Lokasi Presensi', `Memperbarui titik lokasi presensi ${point.name}`);
        return res.json({ success: true, message: 'Titik lokasi presensi berhasil disimpan', data: point });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    case 'deleteLocationPoint': {
      try {
        smartAttendanceService.deleteLocationPoint(req.body.id, tenantId);
        logActivity(tenantId, authUser?.id || 'system', username, role, 'DELETE', 'Lokasi Presensi', `Menghapus titik lokasi presensi ${req.body.id}`);
        return res.json({ success: true, message: 'Titik lokasi berhasil dihapus' });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    case 'getGateStats': {
      try {
        const stats = smartAttendanceService.getGateStats(tenantId, req.body.date || req.query.date);
        return res.json({ success: true, data: stats });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    case 'bulkGenerateStudentQr': {
      try {
        const studentIds = req.body.studentIds || [];
        const result = smartAttendanceService.bulkGenerateStudentQr(studentIds, tenantId);
        logActivity(tenantId, authUser?.id || 'system', username, role, 'UPDATE', 'Smart Attendance Cards', `Generate QR batch untuk ${result.length} siswa`);
        return res.json({ success: true, message: `Berhasil generate ${result.length} kartu QR siswa.`, data: result });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    default:
      return null;
  }
}
}
