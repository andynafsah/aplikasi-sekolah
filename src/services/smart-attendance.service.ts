/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import crypto from 'crypto';
import { DB, logActivity } from '../../server';
import { PrismaEngine } from '../backend/database/prisma';
import { NotificationService } from './notification.service';
import { AttendanceCalculationService } from './attendance-calculation.service';
import { AttendanceExportService } from './attendance-export.service';
import { ScheduleEngineService } from './schedule-engine.service';

export interface MinimalStudentProfile {
  id: string;
  name: string;
  nis: string;
  rombel: string;
  unit: string;
  photo?: string;
  status: string;
}

export interface StudentScanResult {
  status: 'SUCCESS' | 'DUPLICATE' | 'ERROR' | 'INVALID';
  message: string;
  student?: MinimalStudentProfile;
  attendanceTime?: string;
  previousTime?: string;
  attendanceStatus?: 'PRESENT' | 'LATE' | 'SICK' | 'PERMITTED' | 'ABSENT' | 'OFF_DAY' | 'HOLIDAY' | 'CORRECTED' | 'VOID' | string;
  source?: string;
}

export interface LocationPoint {
  id: string;
  name: string;
  code: string;
  qrToken: string;
  unit: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
  status: 'ACTIVE' | 'INACTIVE';
  isRotatingToken?: boolean;
}

export interface SmartAttendanceRecord {
  id: string;
  tenant_id: string;
  person_id: string;
  person_name: string;
  role: 'SISWA' | 'SANTRI' | 'GURU' | 'PEGAWAI';
  unit: string;
  rombel?: string;
  date: string;
  time_in?: string;
  time_out?: string;
  type: 'MASUK' | 'PULANG' | 'KEGIATAN' | 'SHALAT' | 'ASRAMA';
  status: 'PRESENT' | 'LATE' | 'SICK' | 'PERMITTED' | 'ABSENT' | 'OFF_DAY' | 'HOLIDAY' | 'CORRECTED' | 'VOID';
  source: 'SECURITY_GATE' | 'TEACHER_QR' | 'TEACHER_MANUAL' | 'EMPLOYEE_GPS' | 'EMPLOYEE_QR' | 'ADMIN_MANUAL';
  location_name?: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  distance_meters?: number;
  is_suspicious?: boolean;
  anomaly_reason?: string;
  client_transaction_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AttendanceCorrectionAttachment {
  file_id: string;
  filename: string;
  mime_type: string;
  size: number;
  uploaded_by: string;
}

export interface AttendanceCorrection {
  id: string;
  tenant_id: string;
  attendance_id?: string;
  person_id: string;
  person_name: string;
  role: string;
  unit_id?: string;
  unit?: string;
  type: 'MISSED_CHECK_IN' | 'MISSED_CHECK_OUT' | 'WRONG_STATUS' | 'WRONG_TIME' | 'GPS_FAILURE' | 'QR_FAILURE' | 'DEVICE_FAILURE' | 'MANUAL_ATTENDANCE_REQUEST' | 'OTHER' | string;
  status: 'DRAFT' | 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'EXPIRED';
  requested_date: string;
  date: string; // alias for backwards compatibility
  target_status: 'PRESENT' | 'LATE' | 'SICK' | 'PERMITTED' | 'ABSENT' | string;
  original_data?: {
    original_status?: string;
    original_check_in?: string;
    original_check_out?: string;
    original_method?: string;
    original_location?: string;
  };
  requested_data?: {
    requested_status?: string;
    requested_check_in?: string;
    requested_check_out?: string;
    requested_method?: string;
    requested_location?: string;
    requested_reason?: string;
  };
  reason: string;
  proof_url?: string;
  attachment_ids?: string[];
  attachments?: AttendanceCorrectionAttachment[];
  requested_by: string;
  requested_by_id?: string;
  reviewer_id?: string;
  reviewer_name?: string;
  reviewed_at?: string;
  approver_id?: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  comment?: string;
  created_at: string;
  updated_at: string;
}

// In-memory data store for fallback & speed
const locationPointsStore: Map<string, LocationPoint[]> = new Map();
const smartAttendanceStore: Map<string, SmartAttendanceRecord[]> = new Map();
const correctionStore: Map<string, AttendanceCorrection[]> = new Map();

export class SmartAttendanceService {
  // Haversine formula to calculate distance in meters
  public calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // metres
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c); // Distance in meters
  }

  // Get or seed default location points
  public getLocationPoints(tenantId: string): LocationPoint[] {
    if (!locationPointsStore.has(tenantId)) {
      const defaults: LocationPoint[] = [
        {
          id: 'LOC-GATE-01',
          name: 'Gerbang Utama (Security Gate)',
          code: 'GERBANG_UTAMA',
          qrToken: 'QR-LOC-GATE-UTAMA-2026',
          unit: 'SEMUA_UNIT',
          latitude: -6.2088,
          longitude: 106.8456,
          radius: 100,
          status: 'ACTIVE',
          isRotatingToken: false
        },
        {
          id: 'LOC-GURU-01',
          name: 'Ruang Guru & Tata Usaha',
          code: 'RUANG_GURU_TU',
          qrToken: 'QR-LOC-RUANG-GURU-2026',
          unit: 'SMA / MA',
          latitude: -6.2089,
          longitude: 106.8458,
          radius: 80,
          status: 'ACTIVE',
          isRotatingToken: false
        },
        {
          id: 'LOC-PONDOK-01',
          name: 'Kompleks Asrama & Pondok Pesantren',
          code: 'ASRAMA_PONDOK',
          qrToken: 'QR-LOC-ASRAMA-PONDOK-2026',
          unit: 'PONDOK',
          latitude: -6.2092,
          longitude: 106.8462,
          radius: 150,
          status: 'ACTIVE',
          isRotatingToken: false
        },
        {
          id: 'LOC-MASJID-01',
          name: 'Masjid Jami Kampus Terpadu',
          code: 'MASJID_JAMI',
          qrToken: 'QR-LOC-MASJID-JAMI-2026',
          unit: 'SEMUA_UNIT',
          latitude: -6.2085,
          longitude: 106.8453,
          radius: 120,
          status: 'ACTIVE',
          isRotatingToken: false
        }
      ];
      locationPointsStore.set(tenantId, defaults);
    }
    return locationPointsStore.get(tenantId) || [];
  }

  public saveLocationPoint(point: Partial<LocationPoint>, tenantId: string): LocationPoint {
    const list = this.getLocationPoints(tenantId);
    if (point.id) {
      const idx = list.findIndex(p => p.id === point.id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...point } as LocationPoint;
        locationPointsStore.set(tenantId, list);
        return list[idx];
      }
    }
    const newPoint: LocationPoint = {
      id: `LOC-${Date.now()}`,
      name: point.name || 'Titik Lokasi Baru',
      code: (point.code || `LOC_${Date.now()}`).toUpperCase().replace(/\s+/g, '_'),
      qrToken: point.qrToken || `QR-${Date.now()}`,
      unit: point.unit || 'SEMUA_UNIT',
      latitude: point.latitude !== undefined ? Number(point.latitude) : -6.2088,
      longitude: point.longitude !== undefined ? Number(point.longitude) : 106.8456,
      radius: point.radius ? Number(point.radius) : 100,
      status: point.status || 'ACTIVE',
      isRotatingToken: point.isRotatingToken || false
    };
    list.push(newPoint);
    locationPointsStore.set(tenantId, list);
    return newPoint;
  }

  public deleteLocationPoint(id: string, tenantId: string): boolean {
    const list = this.getLocationPoints(tenantId);
    const filtered = list.filter(p => p.id !== id);
    locationPointsStore.set(tenantId, filtered);
    return true;
  }

  // Find Student by QR Token or identifier
  public findStudentByQr(token: string, tenantId: string): any {
    let studentId = token.trim();
    if (studentId.startsWith('STUDENT:')) {
      studentId = studentId.replace('STUDENT:', '').trim();
    }

    const students = DB.students || [];
    // Search by ID, NIS, NISN, or qr_identifier
    const student = students.find((s: any) => 
      s.tenant_id === tenantId &&
      s.deleted_at === null &&
      (s.id === studentId || s.nis === studentId || s.nisn === studentId || s.qr_identifier === token || s.qr_code === token)
    );

    if (student) return student;

    // Search without prefix if not found
    return students.find((s: any) => 
      s.tenant_id === tenantId &&
      s.deleted_at === null &&
      (s.nis?.toLowerCase() === studentId.toLowerCase() || s.id?.toLowerCase() === studentId.toLowerCase())
    );
  }

  // 1. Student Gate / QR Scan Method
  public async scanStudentQr(params: {
    token: string;
    source: 'SECURITY_GATE' | 'TEACHER_QR';
    scannedBy: string;
    role: string;
    tenantId: string;
    clientTxId?: string;
    unitId?: string;
    classId?: string;
  }): Promise<StudentScanResult> {
    const { token, source, scannedBy, tenantId, clientTxId } = params;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().substring(0, 8);

    if (!token || !token.trim()) {
      return {
        status: 'INVALID',
        message: 'Kode QR kosong atau tidak dapat dibaca.'
      };
    }

    const student = this.findStudentByQr(token, tenantId);
    if (!student) {
      this.recordAuditLog({
        tenantId,
        action: 'FAILED',
        actor: scannedBy,
        qrType: 'STUDENT_QR',
        reference: token,
        source,
        result: 'INVALID_QR',
        details: 'Token QR siswa tidak dikenal'
      });
      NotificationService.triggerNotification({
        recipient_id: scannedBy || 'admin',
        type: 'qr_invalid',
        title: 'Percobaan Scan QR Tidak Dikenal',
        message: `Terdeteksi pencindaian kode QR tidak dikenal (${token}) pada pintu gerbang ${source}.`,
        tenant_id: tenantId,
        channels: ['IN_APP', 'PUSH']
      }).catch(err => console.error(err));

      return {
        status: 'INVALID',
        message: 'Kartu QR tidak dikenali. Data siswa tidak ditemukan dalam sistem.'
      };
    }

    // Check QR status (revoked/inactive)
    if (student.qr_status === 'REVOKED' || student.qr_status === 'INACTIVE') {
      this.recordAuditLog({
        tenantId,
        action: 'FAILED',
        actor: scannedBy,
        qrType: 'STUDENT_QR',
        reference: student.id,
        source,
        result: 'QR_REVOKED',
        details: `Kartu QR ${student.name} (${student.id}) sudah dicabut/REVOKED`
      });

      NotificationService.triggerNotification({
        recipient_id: student.id,
        type: 'qr_revoked',
        title: 'Kartu QR Dicabut / Nonaktif',
        message: `Kartu QR Anda telah dinonaktifkan atau dicabut (REVOKED). Silakan hubungi bagian Tata Usaha.`,
        entity_type: 'student',
        entity_id: student.id,
        tenant_id: tenantId,
        channels: ['IN_APP']
      }).catch(err => console.error(err));

      NotificationService.triggerNotification({
        recipient_id: scannedBy || 'admin',
        type: 'qr_revoked',
        title: 'Akses Ditolak: QR Dicabut',
        message: `Siswa ${student.name} mencoba menggunakan kartu QR yang sudah dicabut/REVOKED di gerbang ${source}.`,
        entity_type: 'student',
        entity_id: student.id,
        tenant_id: tenantId,
        channels: ['IN_APP']
      }).catch(err => console.error(err));

      return {
        status: 'INVALID',
        message: 'Kartu sudah tidak aktif. Kode QR siswa ini telah dicabut (REVOKED).'
      };
    }

    // Check scope assignment (Unit Mismatch)
    if (params.unitId && student.unit && !student.unit.toLowerCase().includes(params.unitId.toLowerCase()) && !params.unitId.toLowerCase().includes(student.unit.toLowerCase())) {
      this.recordAuditLog({
        tenantId,
        action: 'FAILED',
        actor: scannedBy,
        qrType: 'STUDENT_QR',
        reference: student.id,
        source,
        result: 'STUDENT_OUT_OF_SCOPE',
        details: `Siswa unit (${student.unit}) di luar cakupan unit scanner (${params.unitId})`
      });
      return {
        status: 'ERROR',
        message: 'Siswa tidak berada dalam cakupan unit/gate Anda.'
      };
    }

    // Check student status
    if (student.status && student.status !== 'AKTIF') {
      this.recordAuditLog({
        tenantId,
        action: 'FAILED',
        actor: scannedBy,
        qrType: 'STUDENT_QR',
        reference: student.id,
        source,
        result: 'STUDENT_INACTIVE',
        details: `Siswa status [${student.status}]`
      });
      return {
        status: 'ERROR',
        message: `Siswa berstatus [${student.status}]. Tidak dapat melakukan absensi aktif.`,
        student: {
          id: student.id,
          name: student.name,
          nis: student.nis || '-',
          rombel: student.kelas || student.rombel || '-',
          unit: student.unit || 'Madrasah',
          photo: student.photo || student.foto,
          status: student.status
        }
      };
    }

    const records = this.getRecords(tenantId);
    const existing = records.find(r => 
      r.person_id === student.id &&
      r.date === todayStr &&
      r.type === 'MASUK' &&
      r.status !== 'VOID'
    );

    const minimalProfile: MinimalStudentProfile = {
      id: student.id,
      name: student.name,
      nis: student.nis || '-',
      rombel: student.kelas || student.rombel || '-',
      unit: student.unit || 'Madrasah / Sekolah',
      photo: student.photo || student.foto,
      status: student.status || 'AKTIF'
    };

    // Duplicate Check Rule (Section 12 & 27)
    if (existing) {
      this.recordAuditLog({
        tenantId,
        action: 'FAILED',
        actor: scannedBy,
        qrType: 'STUDENT_QR',
        reference: student.id,
        source,
        result: 'DUPLICATE',
        details: `Duplikat presensi siswa pada pukul ${existing.time_in}`
      });

      NotificationService.triggerNotification({
        recipient_id: student.id,
        type: 'qr_duplicate',
        title: 'Deteksi Scan Duplikat',
        message: `Percobaan scan QR ganda terdeteksi pada pukul ${timeStr}. Presensi Anda hari ini sudah tercatat pada pukul ${existing.time_in}.`,
        entity_type: 'attendance',
        entity_id: existing.id,
        tenant_id: tenantId,
        channels: ['IN_APP']
      }).catch(err => console.error(err));

      return {
        status: 'DUPLICATE',
        message: `Absensi siswa sudah tercatat hari ini pada pukul ${existing.time_in}.`,
        student: minimalProfile,
        previousTime: existing.time_in,
        attendanceStatus: existing.status,
        source: existing.source
      };
    }

    // D. Resolve schedule dynamically from Working Calendar & Assignments
    const resolved = await ScheduleEngineService.resolveScheduleForUser({
      tenantId,
      userId: student.id,
      role: 'STUDENT',
      rombelId: student.kelas || student.rombel || null,
      unitId: student.unit || null,
      date: now
    });

    if (!resolved.isWorkingDay) {
      return {
        status: 'INVALID',
        message: `Hari ini bukan hari aktif belajar/sekolah (${resolved.holidayName || 'Hari Libur / Akhir Pekan'}). Absensi ditutup.`,
        student: minimalProfile
      };
    }

    const schedule = resolved.schedule;
    let isLate = false;
    let attendanceStatus: 'PRESENT' | 'LATE' = 'PRESENT';
    let notes = '';

    if (schedule) {
      // Validate check-in window
      const checkinWindow = ScheduleEngineService.isTimeWithinWindow(
        timeStr,
        schedule.checkin_open,
        schedule.checkin_close
      );

      if (!checkinWindow.success) {
        return {
          status: 'INVALID',
          message: checkinWindow.message || 'Presensi berada di luar jendela waktu check-in yang diizinkan.',
          student: minimalProfile
        };
      }

      // Evaluate late
      isLate = ScheduleEngineService.evaluateIsLate(
        timeStr,
        schedule.start_time,
        schedule.grace_period
      );

      attendanceStatus = isLate ? 'LATE' : 'PRESENT';
      notes = isLate 
        ? `Terlambat hadir. Jadwal: ${schedule.name} (Batas masuk: ${schedule.start_time}, Grace: ${schedule.grace_period}m) via ${source}`
        : `Hadir tepat waktu. Jadwal: ${schedule.name} (${schedule.start_time}) via ${source}`;
    } else {
      // Fallback if no schedule is assigned
      const hour = now.getHours();
      const minute = now.getMinutes();
      isLate = hour > 7 || (hour === 7 && minute > 15);
      attendanceStatus = isLate ? 'LATE' : 'PRESENT';
      notes = isLate 
        ? `Terlambat hadir (Tanpa jadwal di database, menggunakan toleransi default 07:15) via ${source}`
        : `Hadir tepat waktu (Tanpa jadwal di database, menggunakan toleransi default 07:15) via ${source}`;
    }

    // Create Attendance Record
    const record: SmartAttendanceRecord = {
      id: `ATT-STD-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      tenant_id: tenantId,
      person_id: student.id,
      person_name: student.name,
      role: student.is_santri === 'YA' ? 'SANTRI' : 'SISWA',
      unit: student.unit || 'Sekolah / Pesantren',
      rombel: student.kelas || student.rombel,
      date: todayStr,
      time_in: timeStr,
      type: 'MASUK',
      status: attendanceStatus,
      source: source,
      client_transaction_id: clientTxId || `TX-${Date.now()}`,
      notes: notes,
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    };

    records.unshift(record);
    smartAttendanceStore.set(tenantId, records);

    // Persist to database if available
    PrismaEngine.attendance.create({
      data: {
        id: record.id,
        tenant_id: tenantId,
        user_id: student.id,
        date: todayStr,
        time_in: now.toISOString(),
        status: attendanceStatus === 'PRESENT' ? 'HADIR' : 'TERLAMBAT',
        type: 'STUDENT',
        notes: record.notes,
        created_at: now,
        updated_at: now
      } as any
    }).then(() => {
      NotificationService.triggerNotification({
        recipient_id: student.id,
        type: attendanceStatus === 'PRESENT' ? 'student_attendance_created' : 'late_attendance',
        title: attendanceStatus === 'PRESENT' ? 'Presensi Berhasil' : 'Pemberitahuan Terlambat',
        message: attendanceStatus === 'PRESENT'
          ? `Presensi masuk Anda berhasil dicatat via ${source} pada pukul ${timeStr}.`
          : `Anda tercatat terlambat melakukan presensi masuk via ${source} pada pukul ${timeStr}.`,
        entity_type: 'attendance',
        entity_id: record.id,
        tenant_id: tenantId,
        channels: ['IN_APP', 'PUSH']
      }).catch(err => console.error(err));
    }).catch(() => {
      // In-memory fallback is active, trigger notification directly
      NotificationService.triggerNotification({
        recipient_id: student.id,
        type: attendanceStatus === 'PRESENT' ? 'student_attendance_created' : 'late_attendance',
        title: attendanceStatus === 'PRESENT' ? 'Presensi Berhasil' : 'Pemberitahuan Terlambat',
        message: attendanceStatus === 'PRESENT'
          ? `Presensi masuk Anda berhasil dicatat via ${source} pada pukul ${timeStr}.`
          : `Anda tercatat terlambat melakukan presensi masuk via ${source} pada pukul ${timeStr}.`,
        entity_type: 'attendance',
        entity_id: record.id,
        tenant_id: tenantId,
        channels: ['IN_APP', 'PUSH']
      }).catch(err => console.error(err));
    });

    logActivity(
      tenantId,
      scannedBy,
      scannedBy,
      params.role,
      'CREATE',
      'Smart Attendance Gate',
      `Absensi ${minimalProfile.name} (${minimalProfile.nis}) berhasil dicatat via ${source} [${attendanceStatus}]`
    );

    return {
      status: 'SUCCESS',
      message: isLate ? 'Absensi tercatat (TERLAMBAT).' : 'Absensi berhasil dicatat (HADIR TEPAT WAKTU).',
      student: minimalProfile,
      attendanceTime: timeStr,
      attendanceStatus: attendanceStatus,
      source: source
    };
  }

  // 2. Teacher Manual Attendance for assigned Rombel
  public async saveStudentManualAttendance(params: {
    rombel: string;
    unit?: string;
    date: string;
    records: Array<{
      studentId: string;
      studentName: string;
      nis?: string;
      status: 'PRESENT' | 'LATE' | 'SICK' | 'PERMITTED' | 'ABSENT';
      notes?: string;
    }>;
    teacherId: string;
    teacherName: string;
    tenantId: string;
  }): Promise<{ success: boolean; count: number; message: string }> {
    const { rombel, unit, date, records: studentEntries, teacherId, teacherName, tenantId } = params;
    const now = new Date();
    const existingRecords = this.getRecords(tenantId);

    let savedCount = 0;
    for (const entry of studentEntries) {
      const idx = existingRecords.findIndex(r => 
        r.person_id === entry.studentId && 
        r.date === date && 
        r.type === 'MASUK'
      );

      if (idx >= 0) {
        existingRecords[idx].status = entry.status;
        existingRecords[idx].notes = entry.notes || existingRecords[idx].notes;
        existingRecords[idx].source = 'TEACHER_MANUAL';
        existingRecords[idx].updated_at = now.toISOString();
      } else {
        const newRec: SmartAttendanceRecord = {
          id: `ATT-MAN-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          tenant_id: tenantId,
          person_id: entry.studentId,
          person_name: entry.studentName,
          role: 'SISWA',
          unit: unit || 'Sekolah',
          rombel: rombel,
          date: date,
          time_in: now.toTimeString().substring(0, 8),
          type: 'MASUK',
          status: entry.status,
          source: 'TEACHER_MANUAL',
          notes: entry.notes || `Presensi manual oleh ${teacherName}`,
          created_at: now.toISOString(),
          updated_at: now.toISOString()
        };
        existingRecords.unshift(newRec);
      }
      savedCount++;
    }

    smartAttendanceStore.set(tenantId, existingRecords);

    logActivity(
      tenantId,
      teacherId,
      teacherName,
      'GURU',
      'CREATE',
      'Smart Attendance Manual',
      `Menyimpan presensi manual untuk ${savedCount} siswa di kelas ${rombel} pada tanggal ${date}`
    );

    return {
      success: true,
      count: savedCount,
      message: `Presensi ${savedCount} siswa kelas ${rombel} berhasil disimpan.`
    };
  }

  // 3. Employee GPS Attendance
  public async processEmployeeGpsAttendance(params: {
    employeeId: string;
    employeeName: string;
    role: string;
    latitude: number;
    longitude: number;
    accuracy: number;
    isMockLocation?: boolean;
    type: 'MASUK' | 'PULANG';
    tenantId: string;
    notes?: string;
    clientTxId?: string;
  }): Promise<{
    success: boolean;
    status: 'PRESENT' | 'LATE' | 'PULANG' | 'OUT_OF_RADIUS' | 'SUSPICIOUS' | 'DUPLICATE';
    message: string;
    distanceMeters: number;
    nearestLocation?: LocationPoint;
    record?: SmartAttendanceRecord;
  }> {
    const {
      employeeId,
      employeeName,
      role,
      latitude,
      longitude,
      accuracy,
      isMockLocation,
      type,
      tenantId,
      notes,
      clientTxId
    } = params;

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().substring(0, 8);

    // A. Check mock location & accuracy
    if (isMockLocation) {
      NotificationService.triggerNotification({
        recipient_id: employeeId,
        type: 'security_alert',
        title: 'Deteksi Lokasi Palsu (Mock GPS)',
        message: 'Sistem mendeteksi indikator Lokasi Palsu (Mock Location/Spoofing) pada perangkat Anda. Presensi GPS dibatalkan.',
        tenant_id: tenantId,
        channels: ['IN_APP']
      }).catch(err => console.error(err));

      NotificationService.triggerNotification({
        recipient_id: 'admin',
        type: 'security_alert',
        title: 'Pelanggaran Keamanan GPS',
        message: `Karyawan ${employeeName} mencoba menggunakan Mock Location (Spoofing GPS) untuk melakukan presensi.`,
        tenant_id: tenantId,
        channels: ['IN_APP']
      }).catch(err => console.error(err));

      return {
        success: false,
        status: 'SUSPICIOUS',
        message: 'Indikator Lokasi Palsu (Mock Location / Spoofing) terdeteksi! Absensi GPS ditolak oleh sistem keamanan.',
        distanceMeters: 0
      };
    }

    if (accuracy > 200) {
      NotificationService.triggerNotification({
        recipient_id: employeeId,
        type: 'gps_accuracy_failure',
        title: 'Akurasi GPS Rendah',
        message: `Sinyal GPS perangkat terlalu rendah (${Math.round(accuracy)}m). Silakan berpindah ke tempat terbuka.`,
        tenant_id: tenantId,
        channels: ['IN_APP']
      }).catch(err => console.error(err));

      return {
        success: false,
        status: 'SUSPICIOUS',
        message: `Akurasi sinyal GPS perangkat terlalu rendah (${Math.round(accuracy)}m). Pastikan GPS aktif dan coba lagi di area terbuka.`,
        distanceMeters: 0
      };
    }

    // B. Calculate Distance to Location Points
    const locationPoints = this.getLocationPoints(tenantId).filter(p => p.status === 'ACTIVE');
    let nearestLoc: LocationPoint | null = null;
    let minDistance = Infinity;

    for (const loc of locationPoints) {
      const dist = this.calculateDistance(latitude, longitude, loc.latitude, loc.longitude);
      if (dist < minDistance) {
        minDistance = dist;
        nearestLoc = loc;
      }
    }

    const activeLoc = nearestLoc || {
      id: 'LOC-DEFAULT',
      name: 'Kampus Sekolah',
      code: 'DEFAULT',
      qrToken: '',
      unit: 'SEMUA',
      latitude: -6.2088,
      longitude: 106.8456,
      radius: 100,
      status: 'ACTIVE'
    };

    const maxAllowedRadius = activeLoc.radius || 100;
    if (minDistance > maxAllowedRadius) {
      NotificationService.triggerNotification({
        recipient_id: employeeId,
        type: 'gps_outside_radius',
        title: 'Di Luar Radius Presensi',
        message: `Presensi dibatalkan. Posisi Anda berada ${Math.round(minDistance)} meter dari titik ${activeLoc.name} (Max radius ${maxAllowedRadius}m).`,
        tenant_id: tenantId,
        channels: ['IN_APP']
      }).catch(err => console.error(err));

      return {
        success: false,
        status: 'OUT_OF_RADIUS',
        message: `Presensi GPS Gagal! Jarak Anda ${minDistance} meter dari titik [${activeLoc.name}]. Maksimal radius adalah ${maxAllowedRadius} meter.`,
        distanceMeters: minDistance,
        nearestLocation: activeLoc
      };
    }

    // C. Duplicate check
    const records = this.getRecords(tenantId);
    const existing = records.find(r => 
      r.person_id === employeeId &&
      r.date === todayStr &&
      r.type === type &&
      r.status !== 'VOID'
    );

    if (existing) {
      return {
        success: false,
        status: 'DUPLICATE',
        message: `Anda sudah melakukan presensi ${type === 'MASUK' ? 'Masuk' : 'Pulang'} hari ini pada pukul ${existing.time_in || existing.time_out}.`,
        distanceMeters: minDistance,
        nearestLocation: activeLoc,
        record: existing
      };
    }

    // D. Resolve schedule dynamically from Working Calendar & Assignments
    const resolved = await ScheduleEngineService.resolveScheduleForUser({
      tenantId,
      userId: employeeId,
      role: role.includes('GURU') ? 'GURU' : 'PEGAWAI',
      rombelId: null,
      unitId: activeLoc.unit === 'SEMUA' ? null : activeLoc.unit,
      date: now
    });

    if (!resolved.isWorkingDay) {
      return {
        success: false,
        status: 'OUT_OF_RADIUS', // Treat non-working day check-in as invalid status
        message: `Presensi GPS Gagal! Hari ini bukan hari kerja aktif Anda (${resolved.holidayName || 'Hari Libur / Akhir Pekan'}).`,
        distanceMeters: minDistance,
        nearestLocation: activeLoc
      };
    }

    const schedule = resolved.schedule;
    let isLate = false;
    let finalStatus: 'PRESENT' | 'LATE' = 'PRESENT';
    let gpsNotes = '';

    if (schedule) {
      if (type === 'MASUK') {
        // Validate check-in window
        const checkinWindow = ScheduleEngineService.isTimeWithinWindow(
          timeStr,
          schedule.checkin_open,
          schedule.checkin_close
        );

        if (!checkinWindow.success) {
          return {
            success: false,
            status: 'SUSPICIOUS',
            message: checkinWindow.message || 'Presensi masuk berada di luar jendela waktu yang diizinkan.',
            distanceMeters: minDistance,
            nearestLocation: activeLoc
          };
        }

        // Evaluate late
        isLate = ScheduleEngineService.evaluateIsLate(
          timeStr,
          schedule.start_time,
          schedule.grace_period
        );

        finalStatus = isLate ? 'LATE' : 'PRESENT';
        gpsNotes = isLate 
          ? `Terlambat hadir GPS. Jadwal: ${schedule.name} (Batas masuk: ${schedule.start_time}, Grace: ${schedule.grace_period}m) di ${activeLoc.name}`
          : `Hadir tepat waktu GPS. Jadwal: ${schedule.name} (${schedule.start_time}) di ${activeLoc.name}`;
      } else {
        // Validate check-out window
        const checkoutWindow = ScheduleEngineService.isTimeWithinWindow(
          timeStr,
          schedule.checkout_open,
          schedule.checkout_close
        );

        if (!checkoutWindow.success) {
          return {
            success: false,
            status: 'SUSPICIOUS',
            message: checkoutWindow.message || 'Presensi pulang berada di luar jendela waktu yang diizinkan.',
            distanceMeters: minDistance,
            nearestLocation: activeLoc
          };
        }

        finalStatus = 'PRESENT'; // standard for checkout
        gpsNotes = `Absen Pulang GPS di ${activeLoc.name}. Jadwal: ${schedule.name} (${schedule.end_time})`;
      }
    } else {
      // Fallback if no schedule is assigned in DB
      if (type === 'MASUK') {
        const hour = now.getHours();
        const minute = now.getMinutes();
        isLate = hour > 7 || (hour === 7 && minute > 30);
        finalStatus = isLate ? 'LATE' : 'PRESENT';
        gpsNotes = isLate 
          ? `Terlambat hadir GPS (Tanpa jadwal di database, menggunakan toleransi default 07:30) di ${activeLoc.name}`
          : `Hadir tepat waktu GPS (Tanpa jadwal di database, menggunakan toleransi default 07:30) di ${activeLoc.name}`;
      } else {
        finalStatus = 'PRESENT';
        gpsNotes = `Absen Pulang GPS di ${activeLoc.name} (Tanpa jadwal di database)`;
      }
    }

    const record: SmartAttendanceRecord = {
      id: `ATT-EMP-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      tenant_id: tenantId,
      person_id: employeeId,
      person_name: employeeName,
      role: role.includes('GURU') ? 'GURU' : 'PEGAWAI',
      unit: activeLoc.unit,
      date: todayStr,
      time_in: type === 'MASUK' ? timeStr : undefined,
      time_out: type === 'PULANG' ? timeStr : undefined,
      type: type,
      status: finalStatus,
      source: 'EMPLOYEE_GPS',
      location_name: activeLoc.name,
      latitude: latitude,
      longitude: longitude,
      accuracy: accuracy,
      distance_meters: minDistance,
      client_transaction_id: clientTxId || `TX-GPS-${Date.now()}`,
      notes: notes || gpsNotes,
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    };

    records.unshift(record);
    smartAttendanceStore.set(tenantId, records);

    // Persist to database if available
    (async () => {
      try {
        if (type === 'MASUK') {
          await PrismaEngine.attendance.create({
            data: {
              id: record.id,
              tenant_id: tenantId,
              user_id: employeeId,
              date: todayStr,
              time_in: now.toISOString(),
              status: finalStatus === 'PRESENT' ? 'HADIR' : 'TERLAMBAT',
              type: role.includes('GURU') ? 'TEACHER' : 'EMPLOYEE',
              notes: record.notes,
              location_lat: latitude,
              location_lng: longitude,
              created_at: now,
              updated_at: now
            } as any
          });
        } else {
          // If checkout, try to update existing check-in row
          const existingRow = await PrismaEngine.attendance.findFirst({
            where: {
              tenant_id: tenantId,
              user_id: employeeId,
              date: todayStr,
              type: { in: ['TEACHER', 'EMPLOYEE'] },
              deleted_at: null
            }
          });
          if (existingRow) {
            await PrismaEngine.attendance.update({
              where: { id: existingRow.id },
              data: {
                time_out: now.toISOString(),
                notes: `${existingRow.notes || ''}\nCheckout: ${record.notes}`.trim(),
                updated_at: now
              }
            });
          } else {
            await PrismaEngine.attendance.create({
              data: {
                id: record.id,
                tenant_id: tenantId,
                user_id: employeeId,
                date: todayStr,
                time_out: now.toISOString(),
                status: 'HADIR',
                type: role.includes('GURU') ? 'TEACHER' : 'EMPLOYEE',
                notes: record.notes,
                location_lat: latitude,
                location_lng: longitude,
                created_at: now,
                updated_at: now
              } as any
            });
          }
        }
      } catch (err) {
        console.error('Failed to persist employee GPS attendance:', err);
      }
    })();

    logActivity(
      tenantId,
      employeeId,
      employeeName,
      role,
      'CREATE',
      'Smart Attendance GPS',
      `Absensi ${type} GPS sukses di ${activeLoc.name} (${minDistance}m) [${finalStatus}]`
    );

    // Trigger notification for employee
    const notifType = type === 'MASUK' 
      ? (isLate ? 'late_attendance' : 'employee_attendance_created')
      : 'employee_attendance_created';
    const notifTitle = type === 'MASUK'
      ? (isLate ? 'Pemberitahuan Terlambat' : 'Presensi Masuk Berhasil')
      : 'Presensi Pulang Berhasil';
    const notifMsg = type === 'MASUK'
      ? (isLate ? `Anda tercatat terlambat melakukan presensi masuk via GPS pada pukul ${timeStr}.` : `Presensi masuk Anda berhasil dicatat via GPS pada pukul ${timeStr}.`)
      : `Presensi pulang Anda berhasil dicatat via GPS pada pukul ${timeStr}.`;

    NotificationService.triggerNotification({
      recipient_id: employeeId,
      type: notifType,
      title: notifTitle,
      message: notifMsg,
      entity_type: 'attendance',
      entity_id: record.id,
      tenant_id: tenantId,
      channels: ['IN_APP', 'PUSH']
    }).catch(err => console.error(err));

    return {
      success: true,
      status: finalStatus,
      message: `Presensi ${type === 'MASUK' ? 'Masuk' : 'Pulang'} berhasil dicatat via GPS (${minDistance}m dari ${activeLoc.name}).`,
      distanceMeters: minDistance,
      nearestLocation: activeLoc,
      record
    };
  }

  // 4. Employee School QR Attendance
  public async processEmployeeQrAttendance(params: {
    employeeId: string;
    employeeName: string;
    role: string;
    qrToken: string;
    type: 'MASUK' | 'PULANG';
    tenantId: string;
    clientTxId?: string;
  }): Promise<{
    success: boolean;
    status: 'PRESENT' | 'LATE' | 'INVALID_QR' | 'DUPLICATE';
    message: string;
    locationName?: string;
    record?: SmartAttendanceRecord;
  }> {
    const { employeeId, employeeName, role, qrToken, type, tenantId, clientTxId } = params;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().substring(0, 8);

    const locations = this.getLocationPoints(tenantId);
    const loc = locations.find(l => l.qrToken === qrToken && l.status === 'ACTIVE');

    if (!loc) {
      return {
        success: false,
        status: 'INVALID_QR',
        message: 'Kode QR Lokasi Sekolah tidak valid atau sudah tidak aktif.'
      };
    }

    const records = this.getRecords(tenantId);
    const existing = records.find(r => 
      r.person_id === employeeId &&
      r.date === todayStr &&
      r.type === type &&
      r.status !== 'VOID'
    );

    if (existing) {
      return {
        success: false,
        status: 'DUPLICATE',
        message: `Anda sudah melakukan presensi ${type === 'MASUK' ? 'Masuk' : 'Pulang'} hari ini pada pukul ${existing.time_in || existing.time_out}.`,
        locationName: loc.name,
        record: existing
      };
    }

    const hour = now.getHours();
    const minute = now.getMinutes();
    const isLate = type === 'MASUK' && (hour > 7 || (hour === 7 && minute > 30));
    const finalStatus = type === 'PULANG' ? 'PRESENT' : (isLate ? 'LATE' : 'PRESENT');

    const record: SmartAttendanceRecord = {
      id: `ATT-QR-EMP-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      tenant_id: tenantId,
      person_id: employeeId,
      person_name: employeeName,
      role: role.includes('GURU') ? 'GURU' : 'PEGAWAI',
      unit: loc.unit,
      date: todayStr,
      time_in: type === 'MASUK' ? timeStr : undefined,
      time_out: type === 'PULANG' ? timeStr : undefined,
      type: type,
      status: finalStatus,
      source: 'EMPLOYEE_QR',
      location_name: loc.name,
      client_transaction_id: clientTxId || `TX-QR-${Date.now()}`,
      notes: `Absen ${type} scan QR di ${loc.name}`,
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    };

    records.unshift(record);
    smartAttendanceStore.set(tenantId, records);

    // Persist to database if available
    (async () => {
      try {
        if (type === 'MASUK') {
          await PrismaEngine.attendance.create({
            data: {
              id: record.id,
              tenant_id: tenantId,
              user_id: employeeId,
              date: todayStr,
              time_in: now.toISOString(),
              status: finalStatus === 'PRESENT' ? 'HADIR' : 'TERLAMBAT',
              type: role.includes('GURU') ? 'TEACHER' : 'EMPLOYEE',
              notes: record.notes,
              created_at: now,
              updated_at: now
            } as any
          });
        } else {
          const existingRow = await PrismaEngine.attendance.findFirst({
            where: {
              tenant_id: tenantId,
              user_id: employeeId,
              date: todayStr,
              type: { in: ['TEACHER', 'EMPLOYEE'] },
              deleted_at: null
            }
          });
          if (existingRow) {
            await PrismaEngine.attendance.update({
              where: { id: existingRow.id },
              data: {
                time_out: now.toISOString(),
                notes: `${existingRow.notes || ''}\nCheckout: ${record.notes}`.trim(),
                updated_at: now
              }
            });
          } else {
            await PrismaEngine.attendance.create({
              data: {
                id: record.id,
                tenant_id: tenantId,
                user_id: employeeId,
                date: todayStr,
                time_out: now.toISOString(),
                status: 'HADIR',
                type: role.includes('GURU') ? 'TEACHER' : 'EMPLOYEE',
                notes: record.notes,
                created_at: now,
                updated_at: now
              } as any
            });
          }
        }
      } catch (err) {
        console.error('Failed to persist employee QR attendance:', err);
      }
    })();

    logActivity(
      tenantId,
      employeeId,
      employeeName,
      role,
      'CREATE',
      'Smart Attendance QR',
      `Absensi ${type} scan QR di ${loc.name} sukses`
    );

    return {
      success: true,
      status: finalStatus,
      message: `Presensi ${type === 'MASUK' ? 'Masuk' : 'Pulang'} berhasil dicatat di lokasi ${loc.name}.`,
      locationName: loc.name,
      record
    };
  }

  // 5. Attendance Correction Workflow (Spec 147)
  public getCorrections(tenantId: string, filter?: { status?: string; type?: string; personId?: string; date?: string; unit?: string }): AttendanceCorrection[] {
    if (!correctionStore.has(tenantId)) {
      const todayStr = new Date().toISOString().split('T')[0];
      const defaults: AttendanceCorrection[] = [
        {
          id: 'CORR-1001',
          tenant_id: tenantId,
          attendance_id: 'ATT-1001',
          person_id: 'P-101',
          person_name: 'Ahmad Fauzi, S.Pd.',
          role: 'GURU',
          unit: 'SMA IT',
          unit_id: 'UNIT-SMA',
          type: 'MISSED_CHECK_OUT',
          status: 'PENDING',
          requested_date: todayStr,
          date: todayStr,
          target_status: 'PRESENT',
          original_data: {
            original_status: 'HADIR',
            original_check_in: '06:55:00',
            original_check_out: '-',
            original_method: 'TEACHER_QR',
            original_location: 'Gerbang Utama'
          },
          requested_data: {
            requested_status: 'HADIR',
            requested_check_in: '06:55:00',
            requested_check_out: '15:30:00',
            requested_method: 'CORRECTED_MANUAL',
            requested_reason: 'Lupa scan QR saat jam pulang'
          },
          reason: 'Lupa melakukan scan QR saat pulang jam 15:30 karena ada rapat OSIS.',
          requested_by: 'Ahmad Fauzi, S.Pd.',
          requested_by_id: 'USR-GURU-01',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          updated_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 'CORR-1002',
          tenant_id: tenantId,
          attendance_id: 'ATT-1002',
          person_id: 'P-102',
          person_name: 'Siti Aminah, M.Pd.',
          role: 'GURU',
          unit: 'SMP IT',
          unit_id: 'UNIT-SMP',
          type: 'GPS_FAILURE',
          status: 'UNDER_REVIEW',
          requested_date: todayStr,
          date: todayStr,
          target_status: 'PRESENT',
          original_data: {
            original_status: 'ABSENT',
            original_check_in: '-',
            original_check_out: '-',
            original_method: 'EMPLOYEE_GPS',
            original_location: 'Luar Area / No GPS'
          },
          requested_data: {
            requested_status: 'HADIR',
            requested_check_in: '07:10:00',
            requested_check_out: '15:00:00',
            requested_method: 'CORRECTED_MANUAL',
            requested_reason: 'Sinyal GPS smartphone bermasalah'
          },
          reason: 'Sinyal GPS smartphone error di area Gedung B. Sudah hadir di kelas jam 07:10.',
          requested_by: 'Siti Aminah, M.Pd.',
          requested_by_id: 'USR-GURU-02',
          reviewer_id: 'USR-TU-01',
          reviewer_name: 'Staf TU Administrasi',
          reviewed_at: new Date(Date.now() - 1800000).toISOString(),
          created_at: new Date(Date.now() - 7200000).toISOString(),
          updated_at: new Date(Date.now() - 1800000).toISOString()
        },
        {
          id: 'CORR-1003',
          tenant_id: tenantId,
          attendance_id: 'ATT-1003',
          person_id: 'P-103',
          person_name: 'Budi Santoso',
          role: 'PEGAWAI',
          unit: 'SMA IT',
          unit_id: 'UNIT-SMA',
          type: 'WRONG_STATUS',
          status: 'APPROVED',
          requested_date: todayStr,
          date: todayStr,
          target_status: 'PERMITTED',
          original_data: {
            original_status: 'TERLAMBAT',
            original_check_in: '07:45:00',
            original_check_out: '16:00:00',
            original_method: 'SECURITY_GATE',
            original_location: 'Gerbang Utama'
          },
          requested_data: {
            requested_status: 'PERMITTED',
            requested_check_in: '07:45:00',
            requested_check_out: '16:00:00',
            requested_method: 'CORRECTED_MANUAL',
            requested_reason: 'Tugas Dinas Luar Kantor'
          },
          reason: 'Tugas luar mengambil dokumen di Dinas Pendidikan.',
          requested_by: 'Budi Santoso',
          requested_by_id: 'USR-PEG-01',
          approver_id: 'USR-KEPSEK-01',
          approved_by: 'Kepala Sekolah SMA IT',
          approved_at: new Date(Date.now() - 900000).toISOString(),
          created_at: new Date(Date.now() - 14400000).toISOString(),
          updated_at: new Date(Date.now() - 900000).toISOString()
        }
      ];
      correctionStore.set(tenantId, defaults);
    }

    let list = correctionStore.get(tenantId) || [];

    if (filter) {
      if (filter.status) list = list.filter(c => c.status === filter.status);
      if (filter.type) list = list.filter(c => c.type === filter.type);
      if (filter.personId) list = list.filter(c => c.person_id === filter.personId);
      if (filter.date) list = list.filter(c => c.requested_date === filter.date || c.date === filter.date);
      if (filter.unit) list = list.filter(c => c.unit === filter.unit || c.unit_id === filter.unit);
    }

    return list;
  }

  public getCorrectionById(tenantId: string, id: string): AttendanceCorrection | null {
    const list = this.getCorrections(tenantId);
    return list.find(c => c.id === id) || null;
  }

  public getMyCorrections(tenantId: string, userId: string): AttendanceCorrection[] {
    const list = this.getCorrections(tenantId);
    return list.filter(c => c.requested_by_id === userId || c.person_id === userId || c.requested_by === userId);
  }

  public requestCorrection(params: {
    personId: string;
    personName: string;
    role: string;
    date?: string;
    requestedDate?: string;
    attendanceId?: string;
    type?: string;
    targetStatus?: string;
    requestedStatus?: string;
    checkInTime?: string;
    checkOutTime?: string;
    reason: string;
    proofUrl?: string;
    attachments?: AttendanceCorrectionAttachment[];
    tenantId: string;
    requestedBy: string;
    requestedById?: string;
    unit?: string;
    unitId?: string;
  }): { success: boolean; data?: AttendanceCorrection; error?: { code: string; message: string } } {
    const list = this.getCorrections(params.tenantId);
    const targetDate = params.requestedDate || params.date || new Date().toISOString().split('T')[0];
    const todayStr = new Date().toISOString().split('T')[0];

    // Validation 1: Future Date Check
    if (targetDate > todayStr) {
      return {
        success: false,
        error: { code: 'FUTURE_ATTENDANCE_NOT_ALLOWED', message: 'Pengajuan koreksi presensi untuk tanggal masa depan tidak diperbolehkan.' }
      };
    }

    // Validation 2: Time Sequence Check
    if (params.checkInTime && params.checkOutTime && params.checkOutTime <= params.checkInTime) {
      return {
        success: false,
        error: { code: 'INVALID_ATTENDANCE_TIME_SEQUENCE', message: 'Jam keluar tidak boleh lebih awal atau sama dengan jam masuk.' }
      };
    }

    // Validation 3: Duplicate Check
    const existingPending = list.find(c => 
      c.person_id === params.personId &&
      (c.requested_date === targetDate || c.date === targetDate) &&
      (c.status === 'PENDING' || c.status === 'UNDER_REVIEW')
    );

    if (existingPending) {
      return {
        success: false,
        error: { code: 'CORRECTION_ALREADY_PENDING', message: 'Sudah ada pengajuan koreksi yang sedang diproses untuk tanggal ini.' }
      };
    }

    // Snapshot original data from attendance store
    const records = this.getRecords(params.tenantId);
    const orig = records.find(r => (params.attendanceId && r.id === params.attendanceId) || (r.person_id === params.personId && r.date === targetDate));

    const original_data = orig ? {
      original_status: orig.status,
      original_check_in: orig.time_in || '-',
      original_check_out: orig.time_out || '-',
      original_method: orig.source,
      original_location: orig.location_name || 'Kampus Utama'
    } : {
      original_status: 'ABSENT',
      original_check_in: '-',
      original_check_out: '-',
      original_method: 'NO_RECORD',
      original_location: '-'
    };

    const requested_data = {
      requested_status: params.requestedStatus || params.targetStatus || 'PRESENT',
      requested_check_in: params.checkInTime || (orig?.time_in || '07:00:00'),
      requested_check_out: params.checkOutTime || (orig?.time_out || '15:30:00'),
      requested_method: 'CORRECTED_MANUAL',
      requested_reason: params.reason
    };

    const item: AttendanceCorrection = {
      id: `CORR-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      tenant_id: params.tenantId,
      attendance_id: params.attendanceId || orig?.id,
      person_id: params.personId,
      person_name: params.personName,
      role: params.role || 'GURU',
      unit: params.unit || orig?.unit || 'SMA IT',
      unit_id: params.unitId,
      type: params.type || 'MISSED_CHECK_OUT',
      status: 'PENDING',
      requested_date: targetDate,
      date: targetDate,
      target_status: (requested_data.requested_status === 'HADIR' ? 'PRESENT' : (requested_data.requested_status === 'TERLAMBAT' ? 'LATE' : requested_data.requested_status)) as any,
      original_data,
      requested_data,
      reason: params.reason,
      proof_url: params.proofUrl,
      attachments: params.attachments || [],
      requested_by: params.requestedBy,
      requested_by_id: params.requestedById || `USR-${params.personId}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    list.unshift(item);
    correctionStore.set(params.tenantId, list);

    logActivity(
      params.tenantId,
      params.requestedBy,
      params.requestedBy,
      params.role,
      'CORRECTION_SUBMITTED',
      'Koreksi Presensi',
      `[CORRECTION_SUBMITTED] Request ID ${item.id} oleh ${params.personName} (${params.role}) pada ${targetDate}. Reason: ${params.reason}`,
      { before: original_data, after: requested_data }
    );

    return { success: true, data: item };
  }

  public submitCorrection(tenantId: string, id: string, userId: string): AttendanceCorrection | null {
    const list = this.getCorrections(tenantId);
    const item = list.find(c => c.id === id);
    if (!item) return null;
    item.status = 'PENDING';
    item.updated_at = new Date().toISOString();

    logActivity(
      tenantId,
      userId,
      item.requested_by,
      item.role,
      'CORRECTION_SUBMITTED',
      'Koreksi Presensi',
      `[CORRECTION_SUBMITTED] Request ID ${id} submitted.`
    );
    return item;
  }

  public reviewCorrection(params: {
    tenantId: string;
    correctionId: string;
    reviewerId: string;
    reviewerName: string;
    comment?: string;
  }): AttendanceCorrection | null {
    const list = this.getCorrections(params.tenantId);
    const item = list.find(c => c.id === params.correctionId);
    if (!item) return null;

    item.status = 'UNDER_REVIEW';
    item.reviewer_id = params.reviewerId;
    item.reviewer_name = params.reviewerName;
    item.reviewed_at = new Date().toISOString();
    if (params.comment) item.comment = params.comment;
    item.updated_at = new Date().toISOString();

    logActivity(
      params.tenantId,
      params.reviewerName,
      params.reviewerName,
      'REVIEWER',
      'CORRECTION_REVIEWED',
      'Koreksi Presensi',
      `[CORRECTION_REVIEWED] Request ID ${params.correctionId} sedang ditinjau oleh ${params.reviewerName}`
    );
    return item;
  }

  public approveCorrection(params: {
    correctionId: string;
    status: 'APPROVED' | 'REJECTED';
    approvedBy: string;
    approverId?: string;
    rejectionReason?: string;
    comment?: string;
    tenantId: string;
  }): { success: boolean; data?: AttendanceCorrection; error?: { code: string; message: string } } {
    const list = this.getCorrections(params.tenantId);
    const idx = list.findIndex(c => c.id === params.correctionId);
    if (idx < 0) {
      return { success: false, error: { code: 'NOT_FOUND', message: 'Pengajuan koreksi tidak ditemukan.' } };
    }

    const item = list[idx];

    // Validation 1: Self Approval Check
    if (params.approverId && item.requested_by_id && params.approverId === item.requested_by_id) {
      return {
        success: false,
        error: { code: 'SELF_APPROVAL_NOT_ALLOWED', message: 'Pemohon tidak diperbolehkan menyetujui atau menolak pengajuannya sendiri.' }
      };
    }

    // Validation 2: Status check
    if (item.status === 'APPROVED' || item.status === 'REJECTED' || item.status === 'CANCELLED') {
      return {
        success: false,
        error: { code: 'INVALID_STATUS', message: `Pengajuan koreksi ini sudah berstatus ${item.status} dan tidak dapat diubah lagi.` }
      };
    }

    // Handle REJECTED
    if (params.status === 'REJECTED') {
      const reason = params.rejectionReason || params.comment || 'Pengajuan koreksi ditolak oleh peninjau.';
      item.status = 'REJECTED';
      item.approver_id = params.approverId || `USR-APPROVER`;
      item.approved_by = params.approvedBy;
      item.approved_at = new Date().toISOString();
      item.rejection_reason = reason;
      item.comment = reason;
      item.updated_at = new Date().toISOString();

      logActivity(
        params.tenantId,
        params.approvedBy,
        params.approvedBy,
        'APPROVER',
        'CORRECTION_REJECTED',
        'Koreksi Presensi',
        `[CORRECTION_REJECTED] Request ${item.id} ditolak oleh ${params.approvedBy}. Alasan: ${reason}`
      );

      correctionStore.set(params.tenantId, list);

      NotificationService.triggerNotification({
        recipient_id: item.person_id,
        type: 'correction_rejected',
        title: 'Pengajuan Koreksi Ditolak',
        message: `Pengajuan koreksi presensi Anda pada tanggal ${item.requested_date} ditolak oleh ${params.approvedBy}. Alasan: ${reason}`,
        entity_type: 'correction',
        entity_id: item.id,
        tenant_id: params.tenantId,
        channels: ['IN_APP', 'PUSH']
      }).catch(err => console.error(err));

      return { success: true, data: item };
    }

    // Handle APPROVED
    item.status = 'APPROVED';
    item.approver_id = params.approverId || `USR-APPROVER`;
    item.approved_by = params.approvedBy;
    item.approved_at = new Date().toISOString();
    if (params.comment) item.comment = params.comment;
    item.updated_at = new Date().toISOString();

    // Update Attendance Record in Store
    const records = this.getRecords(params.tenantId);
    let existing = records.find(r => 
      (item.attendance_id && r.id === item.attendance_id) ||
      (r.person_id === item.person_id && r.date === item.requested_date)
    );

    const targetStatusMapped = item.target_status === 'HADIR' ? 'PRESENT' : (item.target_status === 'TERLAMBAT' ? 'LATE' : (item.target_status === 'PERMITTED' ? 'PERMITTED' : (item.target_status === 'SICK' ? 'SICK' : 'PRESENT')));

    const beforeSnapshot = existing ? { ...existing } : null;

    if (existing) {
      existing.status = targetStatusMapped as any;
      if (item.requested_data?.requested_check_in && item.requested_data.requested_check_in !== '-') {
        existing.time_in = item.requested_data.requested_check_in;
      }
      if (item.requested_data?.requested_check_out && item.requested_data.requested_check_out !== '-') {
        existing.time_out = item.requested_data.requested_check_out;
      }
      existing.notes = `[Koreksi Disetujui (${params.approvedBy}): ${item.reason}]`;
      existing.source = 'ADMIN_MANUAL';
      existing.updated_at = new Date().toISOString();
    } else {
      const newRecord: SmartAttendanceRecord = {
        id: `ATT-CORR-${Date.now()}`,
        tenant_id: params.tenantId,
        person_id: item.person_id,
        person_name: item.person_name,
        role: item.role.includes('GURU') ? 'GURU' : (item.role.includes('SISWA') ? 'SISWA' : 'PEGAWAI'),
        unit: item.unit || 'SMA IT',
        date: item.requested_date || item.date,
        time_in: item.requested_data?.requested_check_in || '07:00:00',
        time_out: item.requested_data?.requested_check_out || '15:30:00',
        type: 'MASUK',
        status: targetStatusMapped as any,
        source: 'ADMIN_MANUAL',
        notes: `Koreksi presensi disetujui oleh ${params.approvedBy}: ${item.reason}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      records.unshift(newRecord);
      existing = newRecord;
    }

    smartAttendanceStore.set(params.tenantId, records);
    correctionStore.set(params.tenantId, list);

    NotificationService.triggerNotification({
      recipient_id: item.person_id,
      type: 'correction_approved',
      title: 'Pengajuan Koreksi Disetujui',
      message: `Pengajuan koreksi presensi Anda pada tanggal ${item.requested_date || item.date} telah disetujui oleh ${params.approvedBy}.`,
      entity_type: 'correction',
      entity_id: item.id,
      tenant_id: params.tenantId,
      channels: ['IN_APP', 'PUSH']
    }).catch(err => console.error(err));

    logActivity(
      params.tenantId,
      params.approvedBy,
      params.approvedBy,
      'APPROVER',
      'CORRECTION_APPROVED',
      'Koreksi Presensi',
      `[CORRECTION_APPROVED] Request ${item.id} disetujui oleh ${params.approvedBy}. Data presensi diperbarui.`
    );

    logActivity(
      params.tenantId,
      params.approvedBy,
      params.approvedBy,
      'SYSTEM',
      'ATTENDANCE_UPDATED_BY_CORRECTION',
      'Sistem Presensi',
      `[ATTENDANCE_UPDATED_BY_CORRECTION] Record ${existing.id} updated via Correction ${item.id}`,
      { before: beforeSnapshot, after: existing }
    );

    return { success: true, data: item };
  }

  public cancelCorrection(params: {
    tenantId: string;
    correctionId: string;
    requesterId: string;
  }): { success: boolean; data?: AttendanceCorrection; error?: { code: string; message: string } } {
    const list = this.getCorrections(params.tenantId);
    const item = list.find(c => c.id === params.correctionId);
    if (!item) {
      return { success: false, error: { code: 'NOT_FOUND', message: 'Pengajuan koreksi tidak ditemukan.' } };
    }

    if (item.status !== 'DRAFT' && item.status !== 'PENDING') {
      return { success: false, error: { code: 'CANNOT_CANCEL', message: 'Hanya pengajuan DRAFT atau PENDING yang dapat dibatalkan.' } };
    }

    item.status = 'CANCELLED';
    item.updated_at = new Date().toISOString();

    logActivity(
      params.tenantId,
      params.requesterId,
      item.requested_by,
      item.role,
      'CORRECTION_CANCELLED',
      'Koreksi Presensi',
      `[CORRECTION_CANCELLED] Request ${params.correctionId} dibatalkan oleh pemohon.`
    );

    return { success: true, data: item };
  }

  // 6. Security Gate Statistics (Section 10 & 37)
  public getGateStats(tenantId: string, dateStr?: string): {
    today: string;
    totalStudents: number;
    presentCount: number;
    lateCount: number;
    absentCount: number;
    scannedCount: number;
    duplicateCount: number;
    recentScans: SmartAttendanceRecord[];
  } {
    const today = dateStr || new Date().toISOString().split('T')[0];
    const students = (DB.students || []).filter((s: any) => s.tenant_id === tenantId && s.deleted_at === null);
    const records = this.getRecords(tenantId).filter(r => r.date === today && r.status !== 'VOID');

    const presentCount = records.filter(r => r.status === 'PRESENT').length;
    const lateCount = records.filter(r => r.status === 'LATE').length;
    const totalPresent = presentCount + lateCount;
    const absentCount = Math.max(0, students.length - totalPresent);

    return {
      today,
      totalStudents: students.length || 150,
      presentCount,
      lateCount,
      absentCount,
      scannedCount: records.length,
      duplicateCount: 0,
      recentScans: records.slice(0, 15)
    };
  }

  // 7. Attendance Records & Reporting (Section 36)
  public getRecords(tenantId: string): SmartAttendanceRecord[] {
    if (!smartAttendanceStore.has(tenantId)) {
      const sampleRecords: SmartAttendanceRecord[] = [
        {
          id: 'ATT-SAMPLE-01',
          tenant_id: tenantId,
          person_id: 'std-001',
          person_name: 'Muhammad Faiz Pratama',
          role: 'SANTRI',
          unit: 'MA Tahfidz',
          rombel: 'X-A',
          date: new Date().toISOString().split('T')[0],
          time_in: '06:45:12',
          type: 'MASUK',
          status: 'PRESENT',
          source: 'SECURITY_GATE',
          location_name: 'Gerbang Utama',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'ATT-SAMPLE-02',
          tenant_id: tenantId,
          person_id: 'std-002',
          person_name: 'Aisyah Nur Rahma',
          role: 'SANTRI',
          unit: 'MA Tahfidz',
          rombel: 'X-B',
          date: new Date().toISOString().split('T')[0],
          time_in: '07:18:40',
          type: 'MASUK',
          status: 'LATE',
          source: 'SECURITY_GATE',
          location_name: 'Gerbang Utama',
          notes: 'Terlambat 3 menit',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'ATT-SAMPLE-03',
          tenant_id: tenantId,
          person_id: 'emp-001',
          person_name: 'Ustadz Ahmad Fauzi, M.Pd.',
          role: 'GURU',
          unit: 'MA Tahfidz',
          date: new Date().toISOString().split('T')[0],
          time_in: '06:50:00',
          type: 'MASUK',
          status: 'PRESENT',
          source: 'EMPLOYEE_GPS',
          location_name: 'Gerbang Utama',
          distance_meters: 25,
          accuracy: 12,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      smartAttendanceStore.set(tenantId, sampleRecords);
    }
    return smartAttendanceStore.get(tenantId) || [];
  }

  // Helper: Apply filters & RBAC scope isolation to attendance records
  private filterAttendanceRecords(
    tenantId: string,
    params: {
      startDate?: string;
      endDate?: string;
      preset?: string;
      role?: string;
      unit?: string;
      rombel?: string;
      status?: string;
      source?: string;
      search?: string;
      personId?: string;
      userAuth?: any;
    }
  ): SmartAttendanceRecord[] {
    let records = this.getRecords(tenantId);
    const { startDate, endDate, preset, role, unit, rombel, status, source, search, personId, userAuth } = params;

    const range = AttendanceCalculationService.resolveDateRange(preset, startDate, endDate);
    if (range.startDate) records = records.filter(r => r.date >= range.startDate);
    if (range.endDate) records = records.filter(r => r.date <= range.endDate);

    if (role && role !== 'ALL') records = records.filter(r => r.role === role);
    if (unit && unit !== 'ALL') records = records.filter(r => r.unit === unit);
    if (rombel && rombel !== 'ALL') records = records.filter(r => r.rombel === rombel);
    if (status && status !== 'ALL') records = records.filter(r => r.status === status);
    if (source && source !== 'ALL') records = records.filter(r => r.source === source);
    if (personId) records = records.filter(r => r.person_id === personId);

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      records = records.filter(r =>
        r.person_name.toLowerCase().includes(q) ||
        r.person_id.toLowerCase().includes(q) ||
        (r.rombel && r.rombel.toLowerCase().includes(q)) ||
        (r.unit && r.unit.toLowerCase().includes(q))
      );
    }

    // Role-based scope isolation
    if (userAuth) {
      const uRole = userAuth.role || '';
      if (uRole === 'GURU' || uRole === 'WALI_KELAS') {
        if (userAuth.rombel) records = records.filter(r => r.rombel === userAuth.rombel);
      } else if (uRole === 'SATPAM' || uRole === 'SECURITY') {
        records = records.filter(r => r.source === 'SECURITY_GATE');
      } else if (uRole === 'PEGAWAI' || uRole === 'KARYAWAN') {
        records = records.filter(r => r.person_id === (userAuth.id || userAuth.person_id));
      }
    }

    return records;
  }

  // Helper: Paginate & Sort array
  private paginateAndSort<T>(
    items: T[],
    params: { page?: number; per_page?: number; sortBy?: string; sortOrder?: 'asc' | 'desc' }
  ) {
    const page = Math.max(1, Number(params.page) || 1);
    const perPage = Math.max(1, Math.min(500, Number(params.per_page) || 25));
    let list = [...items];

    if (params.sortBy) {
      const key = params.sortBy as keyof T;
      const order = params.sortOrder === 'desc' ? -1 : 1;
      list.sort((a, b) => {
        const valA = a[key] ?? '';
        const valB = b[key] ?? '';
        if (valA < valB) return -1 * order;
        if (valA > valB) return 1 * order;
        return 0;
      });
    }

    const total = list.length;
    const totalPages = Math.ceil(total / perPage) || 1;
    const start = (page - 1) * perPage;
    const paginatedData = list.slice(start, start + perPage);

    return {
      data: paginatedData,
      meta: {
        page,
        per_page: perPage,
        total,
        total_pages: totalPages
      }
    };
  }

  // 1. Core Laporan & Summary API (Spec 148 Section 6, 29)
  public getReports(params: {
    tenantId: string;
    startDate?: string;
    endDate?: string;
    preset?: string;
    role?: string;
    unit?: string;
    rombel?: string;
    status?: string;
    source?: string;
    search?: string;
    page?: number;
    per_page?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    userAuth?: any;
  }): {
    records: SmartAttendanceRecord[];
    summary: {
      total: number;
      present: number;
      late: number;
      sick: number;
      permitted: number;
      absent: number;
      not_recorded: number;
      attendance_rate: number;
      bySource: Record<string, number>;
      byUnit: Record<string, number>;
    };
    meta?: any;
  } {
    const { tenantId, ...restParams } = params;
    const filteredRecords = this.filterAttendanceRecords(tenantId, restParams);

    const present = filteredRecords.filter(r => r.status === 'PRESENT').length;
    const late = filteredRecords.filter(r => r.status === 'LATE').length;
    const sick = filteredRecords.filter(r => r.status === 'SICK').length;
    const permitted = filteredRecords.filter(r => r.status === 'PERMITTED').length;
    const absent = filteredRecords.filter(r => r.status === 'ABSENT').length;
    const not_recorded = filteredRecords.filter(r => !r.status || (r.status as string) === 'VOID' || (r.status as string) === 'NOT_RECORDED').length;

    const totalCount = filteredRecords.length;
    const attendanceRate = AttendanceCalculationService.calculateAttendanceRate(present, late, totalCount);

    const bySource: Record<string, number> = {
      SECURITY_GATE: filteredRecords.filter(r => r.source === 'SECURITY_GATE').length,
      TEACHER_QR: filteredRecords.filter(r => r.source === 'TEACHER_QR').length,
      TEACHER_MANUAL: filteredRecords.filter(r => r.source === 'TEACHER_MANUAL').length,
      EMPLOYEE_GPS: filteredRecords.filter(r => r.source === 'EMPLOYEE_GPS').length,
      EMPLOYEE_QR: filteredRecords.filter(r => r.source === 'EMPLOYEE_QR').length,
      ADMIN_MANUAL: filteredRecords.filter(r => r.source === 'ADMIN_MANUAL').length
    };

    const byUnit: Record<string, number> = {};
    filteredRecords.forEach(r => {
      const u = r.unit || 'UMUM';
      byUnit[u] = (byUnit[u] || 0) + 1;
    });

    const summary = {
      total: totalCount,
      present,
      late,
      sick,
      permitted,
      absent,
      not_recorded,
      attendance_rate: attendanceRate,
      bySource,
      byUnit
    };

    if (params.page) {
      const paginated = this.paginateAndSort(filteredRecords, params);
      return { records: paginated.data, summary, meta: paginated.meta };
    }

    return { records: filteredRecords, summary };
  }

  // 2. Student Report & Monthly Matrix (Spec 148 Section 9, 10, 60)
  public getStudentReport(params: {
    tenantId: string;
    startDate?: string;
    endDate?: string;
    preset?: string;
    unit?: string;
    rombel?: string;
    search?: string;
    page?: number;
    per_page?: number;
    userAuth?: any;
  }) {
    const { tenantId, ...rest } = params;
    const records = this.filterAttendanceRecords(tenantId, { ...rest, role: 'SISWA' });
    const students = DB.students || [];

    // Map monthly matrix if date range is within a month
    const range = AttendanceCalculationService.resolveDateRange(rest.preset, rest.startDate, rest.endDate);
    const matrixList = students
      .filter((s: any) => s.tenant_id === tenantId)
      .filter((s: any) => !rest.unit || rest.unit === 'ALL' || s.unit === rest.unit)
      .filter((s: any) => !rest.rombel || rest.rombel === rest.rombel)
      .map((st: any) => {
        const studentRecords = records.filter(r => r.person_id === st.id || r.person_name === st.name);
        const present = studentRecords.filter(r => r.status === 'PRESENT').length;
        const late = studentRecords.filter(r => r.status === 'LATE').length;
        const sick = studentRecords.filter(r => r.status === 'SICK').length;
        const permitted = studentRecords.filter(r => r.status === 'PERMITTED').length;
        const absent = studentRecords.filter(r => r.status === 'ABSENT').length;

        return {
          id: st.id,
          nis: st.nis || st.id,
          name: st.name,
          unit: st.unit || 'SD',
          rombel: st.rombel || 'I-A',
          total_records: studentRecords.length,
          present,
          late,
          sick,
          permitted,
          absent,
          attendance_rate: AttendanceCalculationService.calculateAttendanceRate(present, late, studentRecords.length || 1),
          records: studentRecords
        };
      });

    const paginated = this.paginateAndSort(matrixList, params);
    return {
      period: range,
      summary: {
        total_students: matrixList.length,
        total_records: records.length,
        present: records.filter(r => r.status === 'PRESENT').length,
        late: records.filter(r => r.status === 'LATE').length,
        sick: records.filter(r => r.status === 'SICK').length,
        permitted: records.filter(r => r.status === 'PERMITTED').length,
        absent: records.filter(r => r.status === 'ABSENT').length
      },
      data: paginated.data,
      meta: paginated.meta
    };
  }

  // 3. Employee & Teacher Report (Spec 148 Section 11, 12, 13)
  public getEmployeeReport(params: {
    tenantId: string;
    role?: string; // GURU or PEGAWAI
    startDate?: string;
    endDate?: string;
    preset?: string;
    unit?: string;
    search?: string;
    page?: number;
    per_page?: number;
    userAuth?: any;
  }) {
    const { tenantId, role, ...rest } = params;
    const targetRole = role || 'PEGAWAI';
    const records = this.filterAttendanceRecords(tenantId, { ...rest, role: targetRole });
    const employees = DB.employees || [];

    const list = employees
      .filter((e: any) => e.tenant_id === tenantId)
      .map((emp: any) => {
        const empRecords = records.filter(r => r.person_id === emp.id || r.person_name === emp.name);
        const present = empRecords.filter(r => r.status === 'PRESENT').length;
        const late = empRecords.filter(r => r.status === 'LATE').length;
        const sick = empRecords.filter(r => r.status === 'SICK').length;
        const permitted = empRecords.filter(r => r.status === 'PERMITTED').length;
        const absent = empRecords.filter(r => r.status === 'ABSENT').length;

        let totalLateMinutes = 0;
        empRecords.forEach(r => {
          if (r.status === 'LATE' && r.time_in) {
            totalLateMinutes += AttendanceCalculationService.calculateLateMinutes(r.time_in, '07:30', 10);
          }
        });

        return {
          id: emp.id,
          nip_niy: emp.nip || emp.niy || emp.id,
          name: emp.name,
          role: emp.role || targetRole,
          unit: emp.unit || 'UMUM',
          total_days: empRecords.length,
          present,
          late,
          sick,
          permitted,
          absent,
          total_late_minutes: totalLateMinutes,
          attendance_rate: AttendanceCalculationService.calculateAttendanceRate(present, late, empRecords.length || 1),
          records: empRecords
        };
      });

    const paginated = this.paginateAndSort(list, params);
    return {
      summary: {
        total_employees: list.length,
        total_records: records.length,
        present: records.filter(r => r.status === 'PRESENT').length,
        late: records.filter(r => r.status === 'LATE').length,
        sick: records.filter(r => r.status === 'SICK').length,
        permitted: records.filter(r => r.status === 'PERMITTED').length,
        absent: records.filter(r => r.status === 'ABSENT').length
      },
      data: paginated.data,
      meta: paginated.meta
    };
  }

  // 4. Late Report (Spec 148 Section 15, 16)
  public getLateReport(params: {
    tenantId: string;
    startDate?: string;
    endDate?: string;
    preset?: string;
    unit?: string;
    rombel?: string;
    role?: string;
    search?: string;
    page?: number;
    per_page?: number;
    userAuth?: any;
  }) {
    const { tenantId, ...rest } = params;
    const records = this.filterAttendanceRecords(tenantId, { ...rest, status: 'LATE' });

    const lateList = records.map(r => {
      const lateMins = AttendanceCalculationService.calculateLateMinutes(r.time_in, '07:30', 10);
      return {
        id: r.id,
        person_id: r.person_id,
        person_name: r.person_name,
        role: r.role,
        unit: r.unit,
        rombel: r.rombel || '-',
        date: r.date,
        schedule_time: '07:30',
        actual_time: r.time_in || '-',
        grace_period: '10 menit',
        late_duration_minutes: lateMins || 15,
        source: r.source,
        notes: r.notes || 'Terlambat check-in'
      };
    });

    const paginated = this.paginateAndSort(lateList, params);
    return {
      summary: {
        total_late_cases: lateList.length,
        total_late_minutes: lateList.reduce((acc, curr) => acc + curr.late_duration_minutes, 0)
      },
      data: paginated.data,
      meta: paginated.meta
    };
  }

  // 5. Absence Report (Spec 148 Section 17)
  public getAbsenceReport(params: {
    tenantId: string;
    startDate?: string;
    endDate?: string;
    preset?: string;
    unit?: string;
    rombel?: string;
    role?: string;
    search?: string;
    page?: number;
    per_page?: number;
    userAuth?: any;
  }) {
    const { tenantId, ...rest } = params;
    const records = this.filterAttendanceRecords(tenantId, rest).filter(r =>
      ['ABSENT', 'SICK', 'PERMITTED', 'NOT_RECORDED'].includes(r.status)
    );

    const paginated = this.paginateAndSort(records, params);
    return {
      summary: {
        total_absences: records.length,
        sick: records.filter(r => r.status === 'SICK').length,
        permitted: records.filter(r => r.status === 'PERMITTED').length,
        absent: records.filter(r => r.status === 'ABSENT').length,
        not_recorded: records.filter(r => (r.status as string) === 'NOT_RECORDED').length
      },
      data: paginated.data,
      meta: paginated.meta
    };
  }

  // 6. Security Gate Report (Spec 148 Section 18)
  public getGateReport(params: {
    tenantId: string;
    startDate?: string;
    endDate?: string;
    preset?: string;
    unit?: string;
    search?: string;
    page?: number;
    per_page?: number;
    userAuth?: any;
  }) {
    const { tenantId, ...rest } = params;
    const records = this.filterAttendanceRecords(tenantId, { ...rest, source: 'SECURITY_GATE' });

    const gateList = records.map(r => ({
      id: r.id,
      date: r.date,
      time: r.time_in || r.time_out || '-',
      person_id: r.person_id,
      person_name: r.person_name,
      role: r.role,
      unit: r.unit,
      gate_location: r.location_name || 'Gerbang Utama',
      scanner: 'Gate Scanner #1',
      result: r.status === 'VOID' ? 'REVOKED' : (r.is_suspicious ? 'UNAUTHORIZED' : 'SUCCESS')
    }));

    const paginated = this.paginateAndSort(gateList, params);
    return {
      summary: {
        total_scans: gateList.length,
        success: gateList.filter(g => g.result === 'SUCCESS').length,
        invalid: gateList.filter(g => g.result === 'INVALID').length,
        duplicate: gateList.filter(g => g.result === 'DUPLICATE').length,
        revoked: gateList.filter(g => g.result === 'REVOKED').length
      },
      data: paginated.data,
      meta: paginated.meta
    };
  }

  // 7. QR Scan Report (Spec 148 Section 19)
  public getQrReport(params: {
    tenantId: string;
    startDate?: string;
    endDate?: string;
    preset?: string;
    search?: string;
    page?: number;
    per_page?: number;
    userAuth?: any;
  }) {
    const { tenantId, ...rest } = params;
    const records = this.filterAttendanceRecords(tenantId, rest).filter(r =>
      ['SECURITY_GATE', 'TEACHER_QR', 'EMPLOYEE_QR'].includes(r.source)
    );

    const qrList = records.map(r => ({
      id: r.id,
      date: r.date,
      time: r.time_in || r.time_out || '-',
      person_name: r.person_name,
      role: r.role,
      qr_type: r.role === 'SISWA' ? 'STUDENT_CARD' : 'LOCATION_QR',
      scanner: r.source,
      location: r.location_name || r.unit || 'Kampus Utama',
      result: r.status === 'VOID' ? 'REVOKED' : 'SUCCESS'
    }));

    const paginated = this.paginateAndSort(qrList, params);
    return {
      summary: {
        total_qr_scans: qrList.length,
        student_cards: qrList.filter(q => q.qr_type === 'STUDENT_CARD').length,
        location_qrs: qrList.filter(q => q.qr_type === 'LOCATION_QR').length
      },
      data: paginated.data,
      meta: paginated.meta
    };
  }

  // 8. GPS Location Report (Spec 148 Section 20, 66, 67)
  public getGpsReport(params: {
    tenantId: string;
    startDate?: string;
    endDate?: string;
    preset?: string;
    search?: string;
    page?: number;
    per_page?: number;
    userAuth?: any;
  }) {
    const { tenantId, ...rest } = params;
    const records = this.filterAttendanceRecords(tenantId, { ...rest, source: 'EMPLOYEE_GPS' });

    const gpsList = records.map(r => {
      const dist = r.distance_meters || 15;
      const isInside = dist <= 100;
      return {
        id: r.id,
        person_name: r.person_name,
        date: r.date,
        time: r.time_in || '-',
        latitude: r.latitude || -6.2088,
        longitude: r.longitude || 106.8456,
        accuracy_meters: r.accuracy || 12,
        distance_meters: dist,
        location_name: r.location_name || 'Kantor Pusat / Sekolah',
        radius_status: isInside ? 'INSIDE_RADIUS' : 'OUTSIDE_RADIUS',
        status: r.status
      };
    });

    const paginated = this.paginateAndSort(gpsList, params);
    return {
      summary: {
        total_gps_logs: gpsList.length,
        inside_radius: gpsList.filter(g => g.radius_status === 'INSIDE_RADIUS').length,
        outside_radius: gpsList.filter(g => g.radius_status === 'OUTSIDE_RADIUS').length
      },
      data: paginated.data,
      meta: paginated.meta
    };
  }

  // 9. Manual Attendance Report (Spec 148 Section 21)
  public getManualReport(params: {
    tenantId: string;
    startDate?: string;
    endDate?: string;
    preset?: string;
    search?: string;
    page?: number;
    per_page?: number;
    userAuth?: any;
  }) {
    const { tenantId, ...rest } = params;
    const records = this.filterAttendanceRecords(tenantId, rest).filter(r =>
      ['TEACHER_MANUAL', 'ADMIN_MANUAL'].includes(r.source)
    );

    const manualList = records.map(r => ({
      id: r.id,
      person_name: r.person_name,
      role: r.role,
      date: r.date,
      status: r.status,
      input_by: r.notes?.includes('Oleh') ? r.notes : 'Admin TU / Guru piket',
      reason: r.notes || 'Pencatatan Manual',
      approval: 'APPROVED',
      created_at: r.created_at
    }));

    const paginated = this.paginateAndSort(manualList, params);
    return {
      summary: {
        total_manual_entries: manualList.length
      },
      data: paginated.data,
      meta: paginated.meta
    };
  }

  // 10. Correction Report (Spec 148 Section 22, 68)
  public getCorrectionReport(params: {
    tenantId: string;
    startDate?: string;
    endDate?: string;
    preset?: string;
    status?: string;
    search?: string;
    page?: number;
    per_page?: number;
    userAuth?: any;
  }) {
    const { tenantId, status, search, ...rest } = params;
    let list = this.getCorrections(tenantId);

    if (status && status !== 'ALL') list = list.filter((c: any) => c.status === status);
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((c: any) =>
        c.person_name.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q) ||
        c.reason.toLowerCase().includes(q)
      );
    }

    const reportList = list.map((c: any) => ({
      id: c.id,
      request_date: c.created_at || c.requested_date,
      attendance_date: c.requested_date || c.date,
      requester: c.person_name,
      role: c.role,
      type: c.type,
      original_status: c.original_data?.original_status || 'ABSENT',
      requested_status: c.target_status,
      reason: c.reason,
      status: c.status,
      approver: c.reviewed_by || c.approved_by || '-',
      decision_date: c.reviewed_at || '-'
    }));

    const paginated = this.paginateAndSort(reportList, params);
    return {
      summary: {
        total: list.length,
        pending: list.filter((c: any) => c.status === 'PENDING').length,
        approved: list.filter((c: any) => c.status === 'APPROVED').length,
        rejected: list.filter((c: any) => c.status === 'REJECTED').length
      },
      data: paginated.data,
      meta: paginated.meta
    };
  }

  // 11. Attendance Audit Report (Spec 148 Section 23)
  public getAuditReport(params: {
    tenantId: string;
    search?: string;
    page?: number;
    per_page?: number;
    userAuth?: any;
  }) {
    const { tenantId, search } = params;
    const logs = this.getAuditLogs(tenantId);

    let list = logs.map((l: any) => ({
      id: l.id || `audit-${Math.random()}`,
      timestamp: l.created_at || l.timestamp || new Date().toISOString(),
      actor: l.actor || 'System Admin',
      action: l.action || 'UPDATE_ATTENDANCE',
      entity: l.qrType || l.entity || 'AttendanceRecord',
      entity_id: l.reference || l.attendance_id || '-',
      details: l.details || l.reason || 'Audit log entry',
      result: l.result || 'SUCCESS'
    }));

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(l =>
        l.actor.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q)
      );
    }

    const paginated = this.paginateAndSort(list, params);
    return {
      summary: {
        total_logs: list.length
      },
      data: paginated.data,
      meta: paginated.meta
    };
  }

  // 12. Enterprise Report Export Engine (Spec 148 Section 31-40)
  public exportReportEngine(params: {
    tenantId: string;
    userId: string;
    username: string;
    reportType: string;
    format: 'pdf' | 'xlsx' | 'csv' | 'print';
    filters: any;
  }): any {
    const { tenantId, userId, username, reportType, format, filters } = params;
    let title = 'Laporan Presensi Sekolah';
    let rows: any[] = [];
    let cols: Array<{ key: string; label: string; align?: 'left' | 'center' | 'right' }> = [];
    let summaryItems: Array<{ label: string; value: string | number; color?: string }> = [];

    switch (reportType) {
      case 'students': {
        title = 'Laporan Presensi Siswa';
        const rep = this.getStudentReport({ tenantId, ...filters });
        rows = rep.data;
        cols = [
          { key: 'nis', label: 'NIS' },
          { key: 'name', label: 'Nama Siswa' },
          { key: 'unit', label: 'Unit' },
          { key: 'rombel', label: 'Rombel' },
          { key: 'present', label: 'Hadir', align: 'center' },
          { key: 'late', label: 'Terlambat', align: 'center' },
          { key: 'sick', label: 'Sakit', align: 'center' },
          { key: 'permitted', label: 'Izin', align: 'center' },
          { key: 'absent', label: 'Alpa', align: 'center' },
          { key: 'attendance_rate', label: 'Rate (%)', align: 'right' }
        ];
        summaryItems = [
          { label: 'Total Siswa', value: rep.summary.total_students },
          { label: 'Hadir', value: rep.summary.present, color: '#16a34a' },
          { label: 'Terlambat', value: rep.summary.late, color: '#d97706' },
          { label: 'Sakit/Izin', value: rep.summary.sick + rep.summary.permitted, color: '#2563eb' },
          { label: 'Alpa', value: rep.summary.absent, color: '#dc2626' }
        ];
        break;
      }

      case 'employees':
      case 'teachers': {
        title = reportType === 'teachers' ? 'Laporan Presensi Guru' : 'Laporan Presensi Karyawan';
        const rep = this.getEmployeeReport({ tenantId, role: reportType === 'teachers' ? 'GURU' : 'PEGAWAI', ...filters });
        rows = rep.data;
        cols = [
          { key: 'nip_niy', label: 'NIP / NIY' },
          { key: 'name', label: 'Nama Lengkap' },
          { key: 'role', label: 'Jabatan / Role' },
          { key: 'unit', label: 'Unit Kerja' },
          { key: 'present', label: 'Hadir', align: 'center' },
          { key: 'late', label: 'Terlambat', align: 'center' },
          { key: 'total_late_minutes', label: 'Total Mins Late', align: 'center' },
          { key: 'absent', label: 'Alpa', align: 'center' },
          { key: 'attendance_rate', label: 'Attendance Rate', align: 'right' }
        ];
        summaryItems = [
          { label: 'Total Personil', value: rep.summary.total_employees },
          { label: 'Hadir', value: rep.summary.present, color: '#16a34a' },
          { label: 'Terlambat', value: rep.summary.late, color: '#d97706' },
          { label: 'Alpa', value: rep.summary.absent, color: '#dc2626' }
        ];
        break;
      }

      case 'late': {
        title = 'Laporan Keterlambatan Presensi';
        const rep = this.getLateReport({ tenantId, ...filters });
        rows = rep.data;
        cols = [
          { key: 'date', label: 'Tanggal' },
          { key: 'person_name', label: 'Nama Lengkap' },
          { key: 'role', label: 'Role' },
          { key: 'unit', label: 'Unit' },
          { key: 'schedule_time', label: 'Jadwal', align: 'center' },
          { key: 'actual_time', label: 'Scan Absen', align: 'center' },
          { key: 'late_duration_minutes', label: 'Durasi (Mins)', align: 'right' }
        ];
        summaryItems = [
          { label: 'Total Kejadian Terlambat', value: rep.summary.total_late_cases, color: '#d97706' },
          { label: 'Total Akumulasi Menit', value: `${rep.summary.total_late_minutes} Mins`, color: '#dc2626' }
        ];
        break;
      }

      default: {
        title = 'Laporan Rekapitulasi Presensi';
        const rep = this.getReports({ tenantId, ...filters });
        rows = rep.records.map(r => ({
          date: r.date,
          time: r.time_in || r.time_out || '-',
          person_name: r.person_name,
          role: r.role,
          unit: r.unit || '-',
          rombel: r.rombel || '-',
          source: r.source,
          status: r.status
        }));
        cols = [
          { key: 'date', label: 'Tanggal' },
          { key: 'time', label: 'Waktu' },
          { key: 'person_name', label: 'Nama' },
          { key: 'role', label: 'Role' },
          { key: 'unit', label: 'Unit' },
          { key: 'source', label: 'Sumber' },
          { key: 'status', label: 'Status' }
        ];
        summaryItems = [
          { label: 'Total Presensi', value: rep.summary.total },
          { label: 'Hadir', value: rep.summary.present, color: '#16a34a' },
          { label: 'Terlambat', value: rep.summary.late, color: '#d97706' },
          { label: 'Rate %', value: `${rep.summary.attendance_rate}%`, color: '#2563eb' }
        ];
        break;
      }
    }

    const range = AttendanceCalculationService.resolveDateRange(filters?.preset, filters?.startDate, filters?.endDate);
    const periodStr = `${range.startDate} s/d ${range.endDate}`;
    const filterStr = `Unit: ${filters?.unit || 'Semua'} | Rombel: ${filters?.rombel || 'Semua'}`;
    const filename = `Laporan_${reportType}_${tenantId}_${Date.now()}.${format === 'xlsx' ? 'xlsx' : format}`;

    if (format === 'csv') {
      const csvStr = AttendanceExportService.generateCsvContent(cols, rows);
      const job = AttendanceExportService.createExportJob({
        tenantId,
        userId,
        username,
        reportType,
        format: 'csv',
        filters,
        recordCount: rows.length,
        filename
      });
      return { job, content: csvStr, contentType: 'text/csv' };
    }

    // Default HTML for PDF / Print / XLSX Preview
    const htmlStr = AttendanceExportService.generateDocumentHtml({
      tenantId,
      reportTitle: title,
      periodLabel: periodStr,
      filtersLabel: filterStr,
      columns: cols,
      rows,
      summaryItems,
      unitName: filters?.unit,
      orientation: cols.length > 7 ? 'landscape' : 'portrait'
    });

    const job = AttendanceExportService.createExportJob({
      tenantId,
      userId,
      username,
      reportType,
      format,
      filters,
      recordCount: rows.length,
      filename
    });

    return { job, content: htmlStr, contentType: 'text/html' };
  }

  // 13. Export History & Jobs API (Spec 148 Section 52, 53)
  public getExportHistory(tenantId: string, userId?: string) {
    return AttendanceExportService.getExportHistory(tenantId, userId);
  }

  public getExportJobDetail(jobId: string, tenantId: string) {
    return AttendanceExportService.getExportJobById(jobId, tenantId);
  }

  // 8. Student QR Card Generation & Bulk Generation (Section 7)
  public bulkGenerateStudentQr(studentIds: string[], tenantId: string, actor: string = 'Admin'): Array<{
    studentId: string;
    qrPayload: string;
    token: string;
  }> {
    const students = DB.students || [];
    const results: Array<{ studentId: string; qrPayload: string; token: string }> = [];

    for (const id of studentIds) {
      const student = students.find((s: any) => s.id === id && s.tenant_id === tenantId);
      if (student) {
        const randomEntropy = crypto.randomBytes(8).toString('hex').toUpperCase();
        const qrPayload = `SCHOOL-STUDENT:${student.id}:${randomEntropy}`;
        student.qr_identifier = qrPayload;
        student.qr_code = qrPayload;
        student.qr_status = 'ACTIVE';
        student.qr_issued_at = new Date().toISOString();
        student.qr_revoked_at = null;
        student.qr_revoke_reason = null;

        results.push({
          studentId: student.id,
          qrPayload,
          token: qrPayload
        });

        this.recordAuditLog({
          tenantId,
          action: 'GENERATED',
          actor,
          qrType: 'STUDENT_QR',
          reference: student.id,
          source: 'BULK_GENERATION',
          result: 'SUCCESS',
          details: `Bulk generated Student QR for ${student.name} (${student.id})`
        });
      }
    }

    return results;
  }

  // Location Management Extensions
  public getLocationById(id: string, tenantId: string): LocationPoint | null {
    const locations = this.getLocationPoints(tenantId);
    return locations.find(l => l.id === id || l.code === id) || null;
  }

  public updateLocationPoint(id: string, updates: Partial<LocationPoint>, tenantId: string): LocationPoint | null {
    const locations = this.getLocationPoints(tenantId);
    const idx = locations.findIndex(l => l.id === id || l.code === id);
    if (idx < 0) return null;

    locations[idx] = {
      ...locations[idx],
      ...updates
    };
    locationPointsStore.set(tenantId, locations);
    return locations[idx];
  }

  public regenerateLocationQr(id: string, tenantId: string, actor: string = 'Admin'): { success: boolean; qrToken?: string; message: string } {
    const loc = this.getLocationById(id, tenantId);
    if (!loc) return { success: false, message: 'Titik lokasi tidak ditemukan.' };

    const randomEntropy = crypto.randomBytes(8).toString('hex').toUpperCase();
    const newQr = `SCHOOL-LOC:${loc.code || loc.id}:${randomEntropy}`;
    loc.qrToken = newQr;
    loc.status = 'ACTIVE';
    this.updateLocationPoint(loc.id, { qrToken: newQr, status: 'ACTIVE' }, tenantId);

    this.recordAuditLog({
      tenantId,
      action: 'REGENERATED',
      actor,
      qrType: 'LOCATION_QR',
      reference: loc.id,
      source: 'LOCATION_MANAGEMENT',
      result: 'SUCCESS',
      details: `Regenerated Location QR for ${loc.name} (${loc.id})`
    });

    return { success: true, qrToken: newQr, message: 'Kode QR lokasi berhasil diperbarui dan diaktifkan.' };
  }

  public revokeLocationQr(id: string, tenantId: string, actor: string = 'Admin'): { success: boolean; message: string } {
    const loc = this.getLocationById(id, tenantId);
    if (!loc) return { success: false, message: 'Titik lokasi tidak ditemukan.' };

    loc.qrToken = '';
    loc.status = 'INACTIVE';
    this.updateLocationPoint(loc.id, { qrToken: '', status: 'INACTIVE' }, tenantId);

    this.recordAuditLog({
      tenantId,
      action: 'REVOKED',
      actor,
      qrType: 'LOCATION_LOCATION_QR',
      reference: loc.id,
      source: 'LOCATION_MANAGEMENT',
      result: 'SUCCESS',
      details: `Revoked Location QR for ${loc.name} (${loc.id})`
    });

    return { success: true, message: 'Kode QR lokasi berhasil dicabut.' };
  }

  // Dedicated Employee Check-out Handler
  public async processEmployeeCheckOut(params: {
    employeeId: string;
    employeeName: string;
    role: string;
    latitude: number;
    longitude: number;
    accuracy: number;
    isMockLocation?: boolean;
    tenantId: string;
    notes?: string;
    clientTxId?: string;
  }): Promise<{
    success: boolean;
    errorCode?: string;
    message: string;
    data?: any;
  }> {
    const { employeeId, employeeName, role, latitude, longitude, accuracy, isMockLocation, tenantId, notes, clientTxId } = params;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().substring(0, 8);

    if (isMockLocation) {
      return {
        success: false,
        errorCode: 'SUSPICIOUS_LOCATION',
        message: 'Indikator Lokasi Palsu (Mock Location / Spoofing) terdeteksi! Presensi ditolak.'
      };
    }

    if (accuracy > 200) {
      return {
        success: false,
        errorCode: 'GPS_ACCURACY_TOO_LOW',
        message: 'Lakukan pembaruan lokasi.'
      };
    }

    // Check radius
    const locations = this.getLocationPoints(tenantId).filter(l => l.status === 'ACTIVE');
    let nearestLoc: LocationPoint | null = null;
    let minDist = Infinity;
    for (const loc of locations) {
      const d = this.calculateDistance(latitude, longitude, loc.latitude, loc.longitude);
      if (d < minDist) {
        minDist = d;
        nearestLoc = loc;
      }
    }

    const activeLoc = nearestLoc || {
      id: 'LOC-DEFAULT',
      name: 'Kampus Utama',
      code: 'DEFAULT',
      latitude: -6.2088,
      longitude: 106.8456,
      radius: 100,
      status: 'ACTIVE',
      qrToken: '',
      unit: 'SEMUA'
    };

    if (minDist > (activeLoc.radius || 100)) {
      return {
        success: false,
        errorCode: 'OUTSIDE_ATTENDANCE_RADIUS',
        message: 'Anda berada di luar area absensi.'
      };
    }

    const records = this.getRecords(tenantId);
    const existingCheckIn = records.find(r => 
      r.person_id === employeeId && 
      r.date === todayStr && 
      (r.type === 'MASUK' || r.time_in !== undefined) &&
      r.status !== 'VOID'
    );

    if (!existingCheckIn) {
      return {
        success: false,
        errorCode: 'CHECK_IN_NOT_FOUND',
        message: 'Belum ada catatan presensi masuk hari ini.'
      };
    }

    if (existingCheckIn.time_out) {
      return {
        success: false,
        errorCode: 'ATTENDANCE_ALREADY_CHECKED_OUT',
        message: 'Anda sudah melakukan check-out hari ini.'
      };
    }

    existingCheckIn.time_out = timeStr;
    existingCheckIn.updated_at = now.toISOString();
    existingCheckIn.notes = `${existingCheckIn.notes || ''} | Check-out GPS di ${activeLoc.name} (${minDist}m)`.trim();
    smartAttendanceStore.set(tenantId, records);

    logActivity(
      tenantId,
      employeeId,
      employeeName,
      role,
      'UPDATE',
      'Employee Check-Out',
      `Check-out presensi berhasil untuk ${employeeName} pada pukul ${timeStr}`
    );

    return {
      success: true,
      message: 'Presensi pulang berhasil dicatat.',
      data: {
        attendance_id: existingCheckIn.id,
        status: existingCheckIn.status,
        check_in_at: existingCheckIn.time_in,
        check_out_at: timeStr,
        distance_meters: minDist,
        accuracy: accuracy
      }
    };
  }

  // Current User Today & History
  public getTodayAttendanceForUser(userId: string, tenantId: string): any {
    const todayStr = new Date().toISOString().split('T')[0];
    const records = this.getRecords(tenantId);
    const record = records.find(r => r.person_id === userId && r.date === todayStr && r.status !== 'VOID');

    if (!record) {
      return {
        date: todayStr,
        check_in: null,
        check_out: null,
        status: 'NONE',
        method: null
      };
    }

    return {
      date: record.date,
      check_in: record.time_in || null,
      check_out: record.time_out || null,
      status: record.status,
      method: record.source
    };
  }

  public getAttendanceHistoryForUser(userId: string, tenantId: string, params: {
    page?: number;
    per_page?: number;
    start_date?: string;
    end_date?: string;
    status?: string;
  }): any {
    const page = Math.max(1, Number(params.page || 1));
    const perPage = Math.max(1, Math.min(100, Number(params.per_page || 10)));
    let records = this.getRecords(tenantId).filter(r => r.person_id === userId);

    if (params.start_date) {
      records = records.filter(r => r.date >= params.start_date!);
    }
    if (params.end_date) {
      records = records.filter(r => r.date <= params.end_date!);
    }
    if (params.status && params.status !== 'ALL') {
      records = records.filter(r => r.status === params.status);
    }

    const total = records.length;
    const totalPages = Math.ceil(total / perPage) || 1;
    const startIdx = (page - 1) * perPage;
    const items = records.slice(startIdx, startIdx + perPage);

    return {
      items,
      pagination: {
        page,
        per_page: perPage,
        total,
        total_pages: totalPages
      }
    };
  }

  // Dashboard Stats
  public getDashboardStats(tenantId: string, dateStr?: string): any {
    const date = dateStr || new Date().toISOString().split('T')[0];
    const students = (DB.students || []).filter((s: any) => s.tenant_id === tenantId && s.deleted_at === null);
    const employees = (DB.teachers || []).concat(DB.employees || []).filter((e: any) => e.tenant_id === tenantId && e.deleted_at === null);
    const records = this.getRecords(tenantId).filter(r => r.date === date && r.status !== 'VOID');

    const studentRecords = records.filter(r => r.role === 'SISWA' || r.role === 'SANTRI');
    const employeeRecords = records.filter(r => r.role === 'GURU' || r.role === 'PEGAWAI');

    const presentStudents = studentRecords.filter(r => r.status === 'PRESENT').length;
    const lateStudents = studentRecords.filter(r => r.status === 'LATE').length;
    const sickStudents = studentRecords.filter(r => r.status === 'SICK').length;
    const permittedStudents = studentRecords.filter(r => r.status === 'PERMITTED').length;
    const absentStudents = Math.max(0, (students.length || 100) - (presentStudents + lateStudents + sickStudents + permittedStudents));

    const presentEmployees = employeeRecords.filter(r => r.status === 'PRESENT').length;
    const lateEmployees = employeeRecords.filter(r => r.status === 'LATE').length;
    const absentEmployees = Math.max(0, (employees.length || 30) - (presentEmployees + lateEmployees));

    return {
      total_students: students.length || 150,
      present: presentStudents,
      late: lateStudents,
      sick: sickStudents,
      permitted: permittedStudents,
      absent: absentStudents,
      total_employees: employees.length || 35,
      employee_present: presentEmployees,
      employee_late: lateEmployees,
      employee_absent: absentEmployees
    };
  }

  // Helper to record audit log
  public recordAuditLog(params: {
    tenantId: string;
    action: string;
    actor: string;
    qrType: string;
    reference: string;
    source?: string;
    result: string;
    details?: string;
  }) {
    if (!DB.audit_logs) {
      DB.audit_logs = [];
    }
    const logItem = {
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      tenant_id: params.tenantId,
      action: params.action,
      actor: params.actor || 'SYSTEM',
      qr_type: params.qrType,
      reference: params.reference,
      source: params.source || 'REST_API',
      result: params.result,
      details: params.details || '',
      created_at: new Date().toISOString()
    };
    DB.audit_logs.unshift(logItem);

    // Persist to DB if possible
    PrismaEngine.auditLog.create({
      data: {
        id: logItem.id,
        tenant_id: params.tenantId,
        user_id: params.reference,
        user_name: params.actor,
        action: params.action,
        module: 'QR_ENGINE',
        details: `${params.qrType} [${params.result}]: ${params.details || ''}`,
        ip_address: '127.0.0.1',
        user_agent: params.source || 'API_GATEWAY',
        created_at: new Date()
      } as any
    }).catch(() => {});

    return logItem;
  }

  // Student QR Operations
  public getStudentQr(studentId: string, tenantId: string): any {
    const students = DB.students || [];
    const student = students.find((s: any) => (s.id === studentId || s.nis === studentId) && s.tenant_id === tenantId);
    if (!student) return null;

    const qrToken = student.qr_code || student.qr_identifier || `SCHOOL-STUDENT:${student.id}:${student.nis || '001'}`;
    const qrStatus = student.qr_status || 'ACTIVE';

    return {
      student_id: student.id,
      student_name: student.name,
      nis: student.nis || '-',
      rombel: student.kelas || student.rombel || '-',
      unit: student.unit || 'Madrasah',
      photo: student.photo || student.foto || null,
      qr_token: qrToken,
      qr_payload: qrToken,
      status: qrStatus,
      issued_at: student.qr_issued_at || new Date().toISOString(),
      revoked_at: student.qr_revoked_at || null,
      revoke_reason: student.qr_revoke_reason || null
    };
  }

  public generateStudentQr(studentId: string, tenantId: string, actor: string = 'Admin'): any {
    const students = DB.students || [];
    const student = students.find((s: any) => (s.id === studentId || s.nis === studentId) && s.tenant_id === tenantId);
    if (!student) return null;

    const randomEntropy = crypto.randomBytes(8).toString('hex').toUpperCase();
    const qrToken = `SCHOOL-STUDENT:${student.id}:${randomEntropy}`;
    student.qr_code = qrToken;
    student.qr_identifier = qrToken;
    student.qr_status = 'ACTIVE';
    student.qr_issued_at = new Date().toISOString();
    student.qr_revoked_at = null;
    student.qr_revoke_reason = null;

    this.recordAuditLog({
      tenantId,
      action: 'GENERATED',
      actor,
      qrType: 'STUDENT_QR',
      reference: student.id,
      source: 'ADMIN_QR_MANAGEMENT',
      result: 'SUCCESS',
      details: `Generated new Student QR Token for ${student.name} (${student.id})`
    });

    return {
      student_id: student.id,
      qr_token: qrToken,
      status: 'ACTIVE',
      issued_at: student.qr_issued_at,
      message: 'Kode QR siswa berhasil dibuat dan diaktifkan.'
    };
  }

  public revokeStudentQr(studentId: string, tenantId: string, reason: string = 'Lost Card', actor: string = 'Admin'): any {
    const students = DB.students || [];
    const student = students.find((s: any) => (s.id === studentId || s.nis === studentId) && s.tenant_id === tenantId);
    if (!student) return null;

    student.qr_status = 'REVOKED';
    student.qr_revoked_at = new Date().toISOString();
    student.qr_revoke_reason = reason;

    this.recordAuditLog({
      tenantId,
      action: 'REVOKED',
      actor,
      qrType: 'STUDENT_QR',
      reference: student.id,
      source: 'ADMIN_QR_MANAGEMENT',
      result: 'SUCCESS',
      details: `Revoked Student QR for ${student.name} (${student.id}). Reason: ${reason}`
    });

    return {
      student_id: student.id,
      status: 'REVOKED',
      revoked_at: student.qr_revoked_at,
      revoke_reason: reason,
      message: `Kode QR siswa berhasil dicabut. Alasan: ${reason}`
    };
  }

  public regenerateStudentQr(studentId: string, tenantId: string, reason: string = 'Replacement', actor: string = 'Admin'): any {
    const students = DB.students || [];
    const student = students.find((s: any) => (s.id === studentId || s.nis === studentId) && s.tenant_id === tenantId);
    if (!student) return null;

    // First revoke
    this.revokeStudentQr(studentId, tenantId, reason, actor);

    // Then generate new token
    const newQr = this.generateStudentQr(studentId, tenantId, actor);

    this.recordAuditLog({
      tenantId,
      action: 'REGENERATED',
      actor,
      qrType: 'STUDENT_QR',
      reference: student.id,
      source: 'ADMIN_QR_MANAGEMENT',
      result: 'SUCCESS',
      details: `Regenerated Student QR for ${student.name} (${student.id})`
    });

    return {
      ...newQr,
      message: 'Kode QR siswa berhasil diperbarui (Regenerated).'
    };
  }

  // Audit Logs
  public getAuditLogs(tenantId: string, params?: any): any[] {
    const logs = DB.audit_logs || [];
    return logs.filter((l: any) => l.tenant_id === tenantId || !l.tenant_id).slice(0, 100);
  }

  public getAuditForRecord(attendanceId: string, tenantId: string): any[] {
    const logs = DB.audit_logs || [];
    return logs.filter((l: any) => l.details?.includes(attendanceId) || l.action?.includes(attendanceId));
  }

  // Reports & Export
  public exportReport(tenantId: string, format: string, params: any): any {
    const { records, summary } = this.getReports({ tenantId, ...params });
    return {
      format: format.toLowerCase(),
      download_url: `/api/v1/attendance/reports/download?format=${format}&tenant=${tenantId}&t=${Date.now()}`,
      generated_at: new Date().toISOString(),
      record_count: records.length,
      summary
    };
  }
}

export const smartAttendanceService = new SmartAttendanceService();

