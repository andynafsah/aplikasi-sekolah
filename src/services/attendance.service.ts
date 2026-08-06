import { IAttendanceRepository } from '../domain/repositories/IAttendanceRepository';
import { AttendanceMapper } from '../mappers/attendance.mapper';
import { AttendanceValidator } from '../validators/attendance.validator';

export class AttendanceService {
  constructor(private readonly attendanceRepository: IAttendanceRepository) {}

  public async getDailyReport(date: string, tenantId: string): Promise<any[]> {
    return await this.attendanceRepository.findByDate(date, tenantId);
  }

  public async findAll(tenantId: string): Promise<any[]> {
    return await this.attendanceRepository.findAll(tenantId);
  }

  // 1. Process Check-In with Rules & Validations
  public async processCheckIn(data: any, tenantId: string, authUser?: any): Promise<any> {
    // A. Validate Input
    const valResult = AttendanceValidator.validateCheckIn(data);
    if (!valResult.isValid) {
      throw new Error(valResult.message || 'Data tidak valid.');
    }

    // B. Check-In Schedule Check & Double Scan Detection
    const dateToday = data.timestamp ? data.timestamp.split('T')[0] : new Date().toISOString().split('T')[0];
    const todayRecords = await this.attendanceRepository.findByDate(dateToday, tenantId);
    const personId = data.personId || data.person_id || authUser?.id;
    
    const hasDoubleScan = todayRecords.some((r: any) => 
      (r.person_id === personId || r.user_id === personId) && 
      (r.type === data.type || r.type === 'MASUK') &&
      r.deleted_at === null
    );

    if (hasDoubleScan) {
      throw new Error(`Double Scan Terdeteksi! ${data.name || data.personName || 'User'} sudah melakukan presensi masuk hari ini.`);
    }

    // C. GPS Radius Check against Geofences
    if (data.method === 'GPS' && (data.lat !== undefined || data.latitude !== undefined) && (data.lng !== undefined || data.longitude !== undefined)) {
      const lat = data.latitude !== undefined ? Number(data.latitude) : Number(data.lat);
      const lng = data.longitude !== undefined ? Number(data.longitude) : Number(data.lng);
      const geofences = await this.attendanceRepository.getGeofences(tenantId);
      if (geofences.length > 0) {
        let insideAny = false;
        for (const geo of geofences) {
          const dist = this.calculateDistance(lat, lng, geo.latitude, geo.longitude);
          if (dist <= geo.radius) {
            insideAny = true;
            data.details = `${data.details || ''} [Radius OK - ${geo.location_name}]`.trim();
            break;
          }
        }
        if (!insideAny) {
          throw new Error('Presensi Gagal! Posisi Anda di luar radius lokasi geofence yang diizinkan.');
        }
      }
    }

    // D. KBM Constraint (For Teacher/Guru)
    if ((data.role === 'GURU' || data.type === 'GURU') && (data.type === 'MASUK' || !data.type)) {
      const timeNow = data.timestamp ? data.timestamp.split('T')[1]?.substring(0, 5) : new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      if (timeNow < '06:00') {
        throw new Error('Presensi Gagal! Anda tidak bisa absen masuk sebelum jam KBM/Sholat Subuh berjamaah (06:00).');
      }
    }

    // E. Calculate Late & Payroll Deductions
    let status: any = data.status || 'HADIR';
    let details = data.details || '';
    let penaltyAmount = 0;

    const timeNow = data.checkInTime || (data.timestamp ? data.timestamp.split('T')[1]?.substring(0, 5) : new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
    const targetTime = '07:00'; // Default Jam Masuk
    
    if (timeNow > targetTime && status === 'HADIR') {
      const diffMinutes = this.calculateTimeDiff(targetTime, timeNow);
      const rulesList = await this.getRules(tenantId);
      const activeRule = rulesList[0] || { lateGracePeriod: 10, rules: [] };
      
      if (diffMinutes > activeRule.lateGracePeriod) {
        status = 'TERLAMBAT';
        penaltyAmount = this.calculatePayrollCut(diffMinutes, activeRule);
        details = `${details} [Terlambat ${diffMinutes} m - Potongan: Rp ${penaltyAmount.toLocaleString('id-ID')}]`.trim();
      }
    }

    // F. Transform via Mapper & Persist
    const attendanceEntity = AttendanceMapper.toEntity({
      ...data,
      person_id: personId,
      person_name: data.personName || data.name || authUser?.username,
      status,
      details: details || `Absensi via ${data.method || 'MOBILE'}`
    }, tenantId);

    attendanceEntity.payroll_deduction = penaltyAmount;

    const saved = await this.attendanceRepository.logAttendance(attendanceEntity, tenantId);

    // G. Trigger Notifications
    this.sendNotificationTrigger(saved, tenantId);

    return AttendanceMapper.toResponse(saved);
  }

  // 1b. Process Check-Out
  public async processCheckOut(data: any, tenantId: string, authUser?: any): Promise<any> {
    const personId = data.personId || data.person_id || authUser?.id;
    const dateToday = data.date || new Date().toISOString().split('T')[0];
    const todayRecords = await this.attendanceRepository.findByDate(dateToday, tenantId);

    const record = todayRecords.find((r: any) => 
      (r.person_id === personId || r.user_id === personId) && r.deleted_at === null
    );

    const checkOutTime = data.checkOutTime || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    if (!record) {
      // If no check-in was found, create an automatic check-out record
      const newEntity = AttendanceMapper.toEntity({
        ...data,
        person_id: personId,
        person_name: data.personName || data.name || authUser?.username,
        status: 'HADIR',
        time_in: '07:00',
        time_out: checkOutTime,
        details: `Check-out langsung via ${data.method || 'MOBILE'}`
      }, tenantId);

      const saved = await this.attendanceRepository.logAttendance(newEntity, tenantId);
      return AttendanceMapper.toResponse(saved);
    }

    // Calculate work duration & overtime
    const timeIn = record.time_in || '07:00';
    const workMinutes = this.calculateTimeDiff(timeIn, checkOutTime);
    const workHours = Number((workMinutes / 60).toFixed(1));
    const overtimeHours = workHours > 8 ? Number((workHours - 8).toFixed(1)) : 0;

    record.time_out = checkOutTime;
    record.work_duration_hours = workHours;
    record.overtime_hours = overtimeHours;
    record.checkout_lat = data.latitude || data.lat;
    record.checkout_lng = data.longitude || data.lng;
    record.updated_at = new Date().toISOString();

    return AttendanceMapper.toResponse(record);
  }

  // 1c. Get Today Attendance Status for Person
  public async getTodayAttendance(personId: string, tenantId: string): Promise<any> {
    const dateToday = new Date().toISOString().split('T')[0];
    const todayRecords = await this.attendanceRepository.findByDate(dateToday, tenantId);
    const userRecord = todayRecords.find((r: any) => 
      (r.person_id === personId || r.user_id === personId) && r.deleted_at === null
    );

    return {
      date: dateToday,
      hasCheckIn: !!userRecord,
      hasCheckOut: !!(userRecord && userRecord.time_out),
      record: userRecord ? AttendanceMapper.toResponse(userRecord) : null,
      shift: {
        code: 'REG-PAGI',
        name: 'Shift Reguler Pagi',
        timeIn: '07:00',
        timeOut: '15:30',
        gracePeriodMinutes: 10
      }
    };
  }

  // 1d. Get Personal Attendance History
  public async getHistory(personId: string, tenantId: string, month?: number, year?: number): Promise<any[]> {
    const all = await this.attendanceRepository.findAll(tenantId);
    let filtered = all.filter((r: any) => 
      (r.person_id === personId || r.user_id === personId) && r.deleted_at === null
    );

    if (month && year) {
      filtered = filtered.filter((r: any) => {
        if (!r.date) return false;
        const d = new Date(r.date);
        return d.getMonth() + 1 === Number(month) && d.getFullYear() === Number(year);
      });
    }

    return filtered.map(item => AttendanceMapper.toResponse(item));
  }

  // 1e. Submit Manual Attendance Request
  public async processManualRequest(data: any, tenantId: string, authUser?: any): Promise<any> {
    const dbAny = (this.attendanceRepository as any);
    const newRequest = {
      id: `MANUAL-${Date.now()}`,
      tenant_id: tenantId,
      person_id: data.personId || data.person_id || authUser?.id,
      person_name: data.personName || data.name || authUser?.username,
      role: data.role || authUser?.role || 'PEGAWAI',
      date: data.date || new Date().toISOString().split('T')[0],
      time: data.time || '07:00',
      type: data.type || 'MASUK', // MASUK or PULANG
      location: data.location || 'Kampus Utama',
      reason: data.reason || 'Kamera HP Bermasalah / GPS Glitch',
      proof_photo: data.proofPhoto || data.attachmentBase64 || '',
      status: 'PENDING_APPROVAL', // PENDING_APPROVAL -> APPROVED -> REJECTED
      approvals: [
        { tier: 1, role: 'KEPALA_TU', name: 'Kepala TU', status: 'PENDING' },
        { tier: 2, role: 'KEPALA_SEKOLAH', name: 'Kepala Sekolah', status: 'PENDING' },
        { tier: 3, role: 'YAYASAN', name: 'Pengurus Yayasan', status: 'PENDING' }
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (!(dbAny as any).manual_requests) {
      (dbAny as any).manual_requests = [];
    }
    (dbAny as any).manual_requests.push(newRequest);

    return newRequest;
  }

  // 1f. Attendance Report Generator
  public async getReport(filters: any, tenantId: string): Promise<any> {
    const all = await this.attendanceRepository.findAll(tenantId);
    const { startDate, endDate, role, department } = filters || {};

    let records = all.filter((r: any) => r.deleted_at === null);
    if (role) records = records.filter((r: any) => r.role === role);
    if (department) records = records.filter((r: any) => r.department === department);

    const totalHadir = records.filter((r: any) => r.status === 'HADIR').length;
    const totalTerlambat = records.filter((r: any) => r.status === 'TERLAMBAT').length;
    const totalIzin = records.filter((r: any) => r.status === 'IZIN').length;
    const totalSakit = records.filter((r: any) => r.status === 'SAKIT').length;
    const totalCuti = records.filter((r: any) => r.status === 'CUTI').length;
    const totalAlpha = records.filter((r: any) => r.status === 'ALPHA' || r.status === 'ALFA').length;

    return {
      summary: {
        totalRecords: records.length,
        totalHadir,
        totalTerlambat,
        totalIzin,
        totalSakit,
        totalCuti,
        totalAlpha,
        punctualityPercentage: records.length > 0 ? Math.round((totalHadir / records.length) * 100) : 100
      },
      records: records.map(r => AttendanceMapper.toResponse(r))
    };
  }

  // 2. Manage Rules & Late Configs
  public async getRules(tenantId: string): Promise<any[]> {
    let rules = await this.attendanceRepository.getRules(tenantId);
    if (rules.length === 0) {
      // Seed default enterprise attendance rules
      const defaultRule = {
        lateGracePeriod: 10,
        rules: [
          { minRange: 0, maxRange: 5, deductionType: 'NOMINAL', deductionValue: 0 },
          { minRange: 6, maxRange: 15, deductionType: 'NOMINAL', deductionValue: 15000 },
          { minRange: 16, maxRange: 30, deductionType: 'NOMINAL', deductionValue: 30000 },
          { minRange: 31, maxRange: 60, deductionType: 'NOMINAL', deductionValue: 50000 },
          { minRange: 61, maxRange: 9999, deductionType: 'PERCENTAGE', deductionValue: 10 } // 10% daily cut
        ]
      };
      await this.attendanceRepository.saveRules(defaultRule, tenantId);
      rules = [defaultRule];
    }
    return rules;
  }

  public async saveRules(data: any, tenantId: string): Promise<any> {
    return await this.attendanceRepository.saveRules(data, tenantId);
  }

  // 3. Replacement Teachers Tracker
  public async getReplacements(tenantId: string): Promise<any[]> {
    return await this.attendanceRepository.getReplacements(tenantId);
  }

  public async saveReplacement(data: any, tenantId: string): Promise<any> {
    // Auto calculate Honor & transferred teach slot history
    const honor = (data.hourlyHonor || 50000) * 2; // Assuming default 2 hours slot
    const payload = {
      ...data,
      honorCalculated: honor,
      deductionCalculated: honor * 0.7, // Original teacher deduction is 70% of transferred cost
      status: 'APPROVED'
    };
    return await this.attendanceRepository.saveReplacement(payload, tenantId);
  }

  // 4. Geofences Management
  public async getGeofences(tenantId: string): Promise<any[]> {
    return await this.attendanceRepository.getGeofences(tenantId);
  }

  public async saveGeofence(data: any, tenantId: string): Promise<any> {
    return await this.attendanceRepository.saveGeofence(data, tenantId);
  }

  // ============================================================================
  // PRIVATE BUSINESS ENGINE CALCULATIONS
  // ============================================================================
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // metres
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in meters
  }

  private calculateTimeDiff(start: string, end: string): number {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    const diffMs = (endH * 60 + endM) - (startH * 60 + startM);
    return diffMs > 0 ? diffMs : 0;
  }

  private calculatePayrollCut(lateMinutes: number, ruleConfig: any): number {
    if (!ruleConfig.rules || ruleConfig.rules.length === 0) {
      return 0;
    }
    const match = ruleConfig.rules.find((r: any) => lateMinutes >= r.minRange && lateMinutes <= r.maxRange);
    if (!match) return 0;

    if (match.deductionType === 'NOMINAL') {
      return match.deductionValue;
    } else if (match.deductionType === 'PERCENTAGE') {
      // percentage of standard daily base salary (simulated base of Rp 300.000 / day)
      const baseSalary = 300000;
      return (match.deductionValue / 100) * baseSalary;
    } else if (match.deductionType === 'PER_MINUTE') {
      return match.deductionValue * lateMinutes;
    }
    return 0;
  }

  private sendNotificationTrigger(record: any, tenantId: string) {
    // 1. WhatsApp / Email Trigger Simulator (Logs successfully generated)
    console.log(`[Notification Engine] sending triggers via WhatsApp, Email, & Push:`, {
      recipient: record.name,
      status: record.status,
      method: record.method
    });

    // 2. Parent Notification Auto Trigger (For Students / Santri who are absent/terlambat)
    if ((record.role === 'SISWA' || record.role === 'SANTRI') && record.status !== 'HADIR') {
      console.log(`[Parent Portal Sync] Auto WhatsApp sent to Guardian of ${record.name}: "Putra/Putri Anda berstatus ${record.status} pada KBM hari ini."`);
    }
  }
}
export default AttendanceService;
