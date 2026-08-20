/**
 * Enterprise Attendance Schedule & Working Calendar Calculation Engine
 */

import PrismaEngine from '../backend/database/prisma';
import { 
  AttendanceSchedule, 
  ScheduleAssignment, 
  WorkingCalendar, 
  CalendarHoliday, 
  ScheduleOverride 
} from '../types/schedule';

export class ScheduleEngineService {
  
  /**
   * Parse "HH:MM" or "HH:MM:SS" into minutes since midnight
   */
  public static parseTimeToMinutes(timeStr: string): number {
    if (!timeStr) return 0;
    const parts = timeStr.split(':');
    const hours = parseInt(parts[0], 10) || 0;
    const minutes = parseInt(parts[1], 10) || 0;
    return hours * 60 + minutes;
  }

  /**
   * Convert minutes since midnight back into "HH:MM"
   */
  public static minutesToTimeStr(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  /**
   * Check if a given time is within the allowed open and close window.
   */
  public static isTimeWithinWindow(
    currentTimeStr: string,
    openTimeStr: string | null,
    closeTimeStr: string | null
  ): { success: boolean; message?: string } {
    const current = this.parseTimeToMinutes(currentTimeStr);
    
    if (openTimeStr) {
      const open = this.parseTimeToMinutes(openTimeStr);
      if (current < open) {
        return { 
          success: false, 
          message: `Absensi belum dibuka. Sesi baru dibuka pukul ${openTimeStr}.` 
        };
      }
    }

    if (closeTimeStr) {
      const close = this.parseTimeToMinutes(closeTimeStr);
      if (current > close) {
        return { 
          success: false, 
          message: `Absensi sudah ditutup. Batas akhir pukul ${closeTimeStr}.` 
        };
      }
    }

    return { success: true };
  }

  /**
   * Determine if checkin is late based on start time and grace period
   */
  public static evaluateIsLate(
    currentTimeStr: string,
    startTimeStr: string,
    gracePeriodMinutes: number
  ): boolean {
    const current = this.parseTimeToMinutes(currentTimeStr);
    const start = this.parseTimeToMinutes(startTimeStr);
    return current > (start + gracePeriodMinutes);
  }

  /**
   * Translate JS day index (0-6) to Indonesian day name
   */
  public static getIndonesianDayName(dayIndex: number): string {
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return dayNames[dayIndex];
  }

  /**
   * Helper to parse string date or Date into "YYYY-MM-DD" format
   */
  public static formatDateString(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Resolve working schedule, calendar status, holiday details, etc., for a specific person on a given date.
   */
  public static async resolveScheduleForUser(params: {
    tenantId: string;
    userId: string;
    role: string;
    rombelId?: string | null;
    unitId?: string | null;
    date: Date | string;
  }): Promise<{
    isWorkingDay: boolean;
    isHoliday: boolean;
    isOffDay: boolean;
    holidayName: string | null;
    schedule: AttendanceSchedule | null;
    hasConflict: boolean;
    conflictMessage: string | null;
    source: 'OVERRIDE' | 'ASSIGNMENT' | 'DEFAULT' | 'HOLIDAY' | 'OFF_DAY';
  }> {
    const { tenantId, userId, role, rombelId = null, unitId = null, date } = params;
    const dateStr = this.formatDateString(date);
    const targetDate = new Date(dateStr);
    const dayOfWeek = this.getIndonesianDayName(targetDate.getDay());

    // 1. Check Date Overrides (Priority: PERSON -> ROLE -> ROMBEL -> UNIT)
    const overrides = await PrismaEngine.scheduleOverride.findMany({
      where: {
        tenant_id: tenantId,
        date: {
          gte: new Date(`${dateStr}T00:00:00.000Z`),
          lte: new Date(`${dateStr}T23:59:59.999Z`)
        }
      }
    }) as any[];

    // Sort overrides by target specificity priority
    const overridePriority = (type: string) => {
      switch (type) {
        case 'PERSON': return 4;
        case 'ROLE': return 3;
        case 'ROMBEL': return 2;
        case 'UNIT': return 1;
        default: return 0;
      }
    };

    const matchingOverrides = overrides.filter(ov => {
      if (ov.target_type === 'PERSON' && ov.target_id === userId) return true;
      if (ov.target_type === 'ROLE' && ov.target_id === role) return true;
      if (ov.target_type === 'ROMBEL' && rombelId && ov.target_id === rombelId) return true;
      if (ov.target_type === 'UNIT' && unitId && ov.target_id === unitId) return true;
      return false;
    }).sort((a, b) => overridePriority(b.target_type) - overridePriority(a.target_type));

    if (matchingOverrides.length > 0) {
      const activeOverride = matchingOverrides[0];
      if (!activeOverride.schedule_id) {
        // Overridden to be an Off Day / Holiday
        return {
          isWorkingDay: false,
          isHoliday: false,
          isOffDay: true,
          holidayName: activeOverride.name || 'Overridden as Off Day',
          schedule: null,
          hasConflict: false,
          conflictMessage: null,
          source: 'OVERRIDE'
        };
      } else {
        // Overridden to use a specific schedule
        const sched = await PrismaEngine.attendanceSchedule.findUnique({
          where: { id: activeOverride.schedule_id }
        }) as AttendanceSchedule | null;

        if (sched && sched.active) {
          return {
            isWorkingDay: true,
            isHoliday: false,
            isOffDay: false,
            holidayName: null,
            schedule: sched,
            hasConflict: false,
            conflictMessage: null,
            source: 'OVERRIDE'
          };
        }
      }
    }

    // 2. Resolve working calendar type based on user role
    let calType: 'ACADEMIC' | 'EMPLOYEE' | 'STUDENT' | 'SECURITY' | 'CUSTOM' = 'EMPLOYEE';
    if (role.toUpperCase() === 'STUDENT' || role.toUpperCase() === 'SISWA') {
      calType = 'STUDENT';
    } else if (role.toUpperCase() === 'SECURITY' || role.toUpperCase() === 'SATPAM') {
      calType = 'SECURITY';
    } else if (role.toUpperCase() === 'TEACHER' || role.toUpperCase() === 'GURU') {
      calType = 'ACADEMIC';
    }

    // Find custom or type-specific calendar
    const calendars = await PrismaEngine.workingCalendar.findMany({
      where: { tenant_id: tenantId, active: true }
    }) as WorkingCalendar[];

    let resolvedCalendar = calendars.find(c => c.type === calType);
    if (!resolvedCalendar) {
      resolvedCalendar = calendars.find(c => c.type === 'EMPLOYEE') || calendars[0];
    }

    // Default Fallback Calendar if none exists in database (Boarding/Pesantren and Security operates 7 days)
    const defaultWorkingDays = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    const activeWorkingDays = resolvedCalendar 
      ? JSON.parse(resolvedCalendar.working_days) 
      : defaultWorkingDays;

    // 3. Check Holidays (Prisma calendarHoliday)
    const holidays = await PrismaEngine.calendarHoliday.findMany({
      where: {
        tenant_id: tenantId,
        date_start: { lte: new Date(`${dateStr}T23:59:59.999Z`) },
        OR: [
          { date_end: null },
          { date_end: { gte: new Date(`${dateStr}T00:00:00.000Z`) } }
        ]
      }
    }) as CalendarHoliday[];

    // Filter holidays applicable to this user's calendar or global organization holidays
    const matchingHoliday = holidays.find(h => {
      return !h.calendar_id || (resolvedCalendar && h.calendar_id === resolvedCalendar.id);
    });

    if (matchingHoliday) {
      return {
        isWorkingDay: false,
        isHoliday: true,
        isOffDay: false,
        holidayName: matchingHoliday.name,
        schedule: null,
        hasConflict: false,
        conflictMessage: null,
        source: 'HOLIDAY'
      };
    }

    // 4. Check if day is a Working Day
    const isWorkingDay = activeWorkingDays.includes(dayOfWeek);
    if (!isWorkingDay) {
      return {
        isWorkingDay: false,
        isHoliday: false,
        isOffDay: true,
        holidayName: 'Hari Libur Akhir Pekan / Off Day',
        schedule: null,
        hasConflict: false,
        conflictMessage: null,
        source: 'OFF_DAY'
      };
    }

    // 5. Resolve active schedules through assignments
    const assignments = await PrismaEngine.scheduleAssignment.findMany({
      where: { tenant_id: tenantId, active: true }
    }) as ScheduleAssignment[];

    // Filter matching assignments for this user
    const userAssignments = assignments.filter(asm => {
      if (asm.target_type === 'PERSON' && asm.target_id === userId) return true;
      if (asm.target_type === 'ROLE' && asm.target_id.toUpperCase() === role.toUpperCase()) return true;
      if (asm.target_type === 'ROMBEL' && rombelId && asm.target_id === rombelId) return true;
      if (asm.target_type === 'UNIT' && unitId && asm.target_id === unitId) return true;
      if (asm.target_type === 'DEPARTMENT' && asm.target_id.toUpperCase() === role.toUpperCase()) return true;
      return false;
    });

    if (userAssignments.length === 0) {
      // Default general organization schedule
      const generalSchedule = await PrismaEngine.attendanceSchedule.findFirst({
        where: { tenant_id: tenantId, type: 'REGULAR', active: true }
      }) as AttendanceSchedule | null;

      return {
        isWorkingDay: true,
        isHoliday: false,
        isOffDay: false,
        holidayName: null,
        schedule: generalSchedule,
        hasConflict: false,
        conflictMessage: null,
        source: 'DEFAULT'
      };
    }

    // Sort matching assignments by priority descending
    userAssignments.sort((a, b) => b.priority - a.priority);

    // Conflict detection: If there are multiple assignments at the highest matching priority with different schedules
    const highestPriority = userAssignments[0].priority;
    const topAssignments = userAssignments.filter(a => a.priority === highestPriority);
    
    let hasConflict = false;
    let conflictMessage: string | null = null;
    if (topAssignments.length > 1) {
      const uniqueScheduleIds = Array.from(new Set(topAssignments.map(a => a.schedule_id)));
      if (uniqueScheduleIds.length > 1) {
        hasConflict = true;
        conflictMessage = `Overlap terdeteksi: Terdapat ${topAssignments.length} jadwal aktif bertentangan dengan tingkat prioritas sama (${highestPriority}).`;
      }
    }

    // Retrieve active schedule
    const activeScheduleId = topAssignments[0].schedule_id;
    const sched = await PrismaEngine.attendanceSchedule.findUnique({
      where: { id: activeScheduleId }
    }) as AttendanceSchedule | null;

    // Validate effective dates
    if (sched && sched.active) {
      const effFrom = sched.effective_from ? new Date(sched.effective_from) : null;
      const effUntil = sched.effective_until ? new Date(sched.effective_until) : null;

      if (effFrom && targetDate < effFrom) {
        return {
          isWorkingDay: true,
          isHoliday: false,
          isOffDay: false,
          holidayName: null,
          schedule: null,
          hasConflict,
          conflictMessage: 'Jadwal belum efektif.',
          source: 'ASSIGNMENT'
        };
      }
      if (effUntil && targetDate > effUntil) {
        return {
          isWorkingDay: true,
          isHoliday: false,
          isOffDay: false,
          holidayName: null,
          schedule: null,
          hasConflict,
          conflictMessage: 'Jadwal sudah kadaluarsa.',
          source: 'ASSIGNMENT'
        };
      }

      return {
        isWorkingDay: true,
        isHoliday: false,
        isOffDay: false,
        holidayName: null,
        schedule: sched,
        hasConflict,
        conflictMessage,
        source: 'ASSIGNMENT'
      };
    }

    return {
      isWorkingDay: true,
      isHoliday: false,
      isOffDay: false,
      holidayName: null,
      schedule: null,
      hasConflict: false,
      conflictMessage: 'Jadwal tidak ditemukan atau tidak aktif.',
      source: 'DEFAULT'
    };
  }

  /**
   * Scan active assignments for overlapping/conflict assignments
   */
  public static async detectAllConflicts(tenantId: string): Promise<any[]> {
    const assignments = await PrismaEngine.scheduleAssignment.findMany({
      where: { tenant_id: tenantId, active: true }
    }) as ScheduleAssignment[];

    const conflicts: any[] = [];
    const groupedByTarget = new Map<string, ScheduleAssignment[]>();

    for (const asm of assignments) {
      const key = `${asm.target_type}:${asm.target_id}`;
      if (!groupedByTarget.has(key)) {
        groupedByTarget.set(key, []);
      }
      groupedByTarget.get(key)!.push(asm);
    }

    for (const [key, list] of groupedByTarget.entries()) {
      if (list.length > 1) {
        const uniqueSchedules = Array.from(new Set(list.map(l => l.schedule_id)));
        if (uniqueSchedules.length > 1) {
          conflicts.push({
            target: key,
            assignments: list.map(l => ({
              id: l.id,
              schedule_id: l.schedule_id,
              priority: l.priority
            })),
            message: `Target ${key} memiliki ${list.length} tugas jadwal yang bertentangan secara bersamaan.`
          });
        }
      }
    }

    return conflicts;
  }
}
