import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../core/base.controller';
import { DB, generateJWT, verifyJWT, logActivity, runAIGateway, DIAG_STATE } from '../../server';
import { AttendanceRepository } from '../repositories/attendance.repository';
import { AttendanceService } from '../services/attendance.service';
import { QrSecurityService } from '../services/qr-security.service';
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
      const { date } = req.body;
      const repo = new AttendanceRepository();
      const service = new AttendanceService(repo);
      try {
        const data = date 
          ? await service.getDailyReport(date, tenantId)
          : await service.findAll(tenantId);
        return res.json({ success: true, message: 'Success', data });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    case 'checkIn':
    case 'check-in': {
      const repo = new AttendanceRepository();
      const service = new AttendanceService(repo);
      try {
        const data = await service.processCheckIn(req.body, tenantId, authUser);
        logActivity(tenantId, authUser?.id || 'system', username, role, 'CREATE', 'Absensi Enterprise', `Absen Masuk via ${req.body.method || 'MOBILE'} sukses untuk ${req.body.personName || req.body.name || username}`);
        return res.json({ success: true, message: 'Presensi Check-In berhasil dicatat!', data });
      } catch (err: any) {
        return res.json({ success: false, message: err.message });
      }
    }

    case 'checkOut':
    case 'check-out': {
      const repo = new AttendanceRepository();
      const service = new AttendanceService(repo);
      try {
        const data = await service.processCheckOut(req.body, tenantId, authUser);
        logActivity(tenantId, authUser?.id || 'system', username, role, 'UPDATE', 'Absensi Enterprise', `Absen Pulang via ${req.body.method || 'MOBILE'} sukses untuk ${req.body.personName || req.body.name || username}`);
        return res.json({ success: true, message: 'Presensi Check-Out berhasil dicatat!', data });
      } catch (err: any) {
        return res.json({ success: false, message: err.message });
      }
    }

    case 'today':
    case 'getToday': {
      const repo = new AttendanceRepository();
      const service = new AttendanceService(repo);
      try {
        const personId = req.query.personId || req.body.personId || authUser?.id || 'G-002';
        const data = await service.getTodayAttendance(String(personId), tenantId);
        return res.json({ success: true, message: 'Status presensi hari ini berhasil dimuat', data });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    case 'myHistory':
    case 'history': {
      const repo = new AttendanceRepository();
      const service = new AttendanceService(repo);
      try {
        const personId = req.query.personId || req.body.personId || authUser?.id || 'G-002';
        const month = req.query.month || req.body.month;
        const year = req.query.year || req.body.year;
        const data = await service.getHistory(String(personId), tenantId, month ? Number(month) : undefined, year ? Number(year) : undefined);
        return res.json({ success: true, message: 'Riwayat presensi berhasil dimuat', data });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    case 'manualRequest':
    case 'manual-request': {
      const repo = new AttendanceRepository();
      const service = new AttendanceService(repo);
      try {
        const data = await service.processManualRequest(req.body, tenantId, authUser);
        logActivity(tenantId, authUser?.id || 'system', username, role, 'CREATE', 'Absensi Enterprise', `Pengajuan absensi manual oleh ${req.body.personName || username}`);
        return res.json({ success: true, message: 'Pengajuan absensi manual berhasil dikirim & menunggu approval bertingkat.', data });
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
      const repo = new AttendanceRepository();
      const service = new AttendanceService(repo);
      try {
        const data = await service.getReport(req.body || req.query, tenantId);
        return res.json({ success: true, message: 'Laporan presensi berhasil dibuat', data });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }
    
    case 'smartAttendance': {
      const { method, data, type, location_lat, location_lng } = req.body;
      const userId = authUser?.id || data?.user_id;
      
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User tidak ditemukan' });
      }

      // Handle AI/Smart logic based on method (Face, Fingerprint, Geolocation, QR)
      let status = 'Present';
      let confidence = 1.0;
      
      if (method === 'FACE_RECOGNITION') {
        // Mocking AI face recognition verification
        confidence = 0.98;
      } else if (method === 'GEOFENCE') {
        // Mocking Geofence calculation
        confidence = 1.0;
      } else if (method === 'QR_CODE') {
        confidence = 1.0;
      }

      try {
        const result = await PrismaEngine.attendance.create({
          data: {
            tenant_id: tenantId,
            user_id: userId,
            date: new Date().toISOString().split('T')[0],
            time_in: new Date().toISOString(),
            status: status,
            type: type || 'STUDENT',
            notes: `Smart Attendance via ${method} (Confidence: ${confidence * 100}%)`,
            location_lat: location_lat,
            location_lng: location_lng,
            created_at: new Date(),
            updated_at: new Date()
          } as any
        });

        logActivity(tenantId, authUser?.id || 'system', username, role, 'CREATE', 'Smart Attendance', `Absen ${type || 'STUDENT'} via ${method} sukses`);
        return res.json({ success: true, message: 'Smart Attendance berhasil dicatat!', data: result });
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
      const repo = new AttendanceRepository();
      const service = new AttendanceService(repo);
      try {
        const list = req.body.items || [];
        for (const item of list) {
          await service.processCheckIn(item, tenantId, authUser);
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

    default:
      return null;
  }
}
}
