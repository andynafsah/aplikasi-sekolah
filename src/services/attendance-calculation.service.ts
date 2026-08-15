/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface WorkScheduleConfig {
  schedule_in: string; // e.g. "07:30"
  schedule_out: string; // e.g. "15:30"
  grace_period_minutes: number; // e.g. 10
}

export class AttendanceCalculationService {
  /**
   * Calculates late duration in minutes based on scheduled time, actual check-in time, and grace period.
   * Example: Schedule 07:30, Grace 10 mins. Check-in at 07:45 -> 5 minutes late (07:45 - 07:40).
   */
  public static calculateLateMinutes(
    timeIn: string | undefined,
    scheduleIn: string = '07:30',
    graceMinutes: number = 10
  ): number {
    if (!timeIn) return 0;

    const [inHours, inMins] = timeIn.split(':').map(Number);
    const [schedHours, schedMins] = scheduleIn.split(':').map(Number);

    if (isNaN(inHours) || isNaN(inMins) || isNaN(schedHours) || isNaN(schedMins)) {
      return 0;
    }

    const actualInMins = inHours * 60 + inMins;
    const allowedInMins = schedHours * 60 + schedMins + graceMinutes;

    if (actualInMins > allowedInMins) {
      return actualInMins - (schedHours * 60 + schedMins);
    }

    return 0;
  }

  /**
   * Calculates attendance rate percentage accurately.
   * Attendance Rate = ((Present + Late) / Working Days) * 100%
   */
  public static calculateAttendanceRate(
    presentCount: number,
    lateCount: number,
    totalWorkingDaysOrPersons: number
  ): number {
    if (totalWorkingDaysOrPersons <= 0) return 100;
    const attended = presentCount + lateCount;
    const rate = (attended / totalWorkingDaysOrPersons) * 100;
    return Math.min(100, Math.max(0, Math.round(rate * 10) / 10));
  }

  /**
   * Resolves date preset range (Hari ini, Kemarin, Minggu ini, Bulan ini, etc.) into ISO date strings.
   */
  public static resolveDateRange(preset?: string, customStart?: string, customEnd?: string): { startDate: string; endDate: string } {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (!preset || preset === 'CUSTOM') {
      return {
        startDate: customStart || todayStr,
        endDate: customEnd || todayStr
      };
    }

    switch (preset) {
      case 'TODAY':
      case 'HARI_INI':
        return { startDate: todayStr, endDate: todayStr };

      case 'YESTERDAY':
      case 'KEMARIN': {
        const y = new Date(now);
        y.setDate(y.getDate() - 1);
        const yStr = y.toISOString().split('T')[0];
        return { startDate: yStr, endDate: yStr };
      }

      case 'THIS_WEEK':
      case 'MINGGU_INI': {
        const day = now.getDay();
        const diffToMon = now.getDate() - day + (day === 0 ? -6 : 1);
        const mon = new Date(now.setDate(diffToMon));
        const sun = new Date(mon);
        sun.setDate(sun.getDate() + 6);
        return {
          startDate: mon.toISOString().split('T')[0],
          endDate: sun.toISOString().split('T')[0]
        };
      }

      case 'LAST_WEEK':
      case 'MINGGU_LALU': {
        const day = now.getDay();
        const diffToLastMon = now.getDate() - day - 6 + (day === 0 ? -6 : 1);
        const lastMon = new Date(now.setDate(diffToLastMon));
        const lastSun = new Date(lastMon);
        lastSun.setDate(lastSun.getDate() + 6);
        return {
          startDate: lastMon.toISOString().split('T')[0],
          endDate: lastSun.toISOString().split('T')[0]
        };
      }

      case 'THIS_MONTH':
      case 'BULAN_INI': {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return {
          startDate: startOfMonth.toISOString().split('T')[0],
          endDate: endOfMonth.toISOString().split('T')[0]
        };
      }

      case 'LAST_MONTH':
      case 'BULAN_LALU': {
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        return {
          startDate: startOfLastMonth.toISOString().split('T')[0],
          endDate: endOfLastMonth.toISOString().split('T')[0]
        };
      }

      default:
        return { startDate: customStart || todayStr, endDate: customEnd || todayStr };
    }
  }

  /**
   * Generates matrix dates array for monthly report
   */
  public static generateMonthDays(year: number, month: number): Array<{ day: number; dateStr: string; dayName: string }> {
    const days: Array<{ day: number; dateStr: string; dayName: string }> = [];
    const date = new Date(year, month - 1, 1);
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    while (date.getMonth() === month - 1) {
      const d = date.getDate();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const y = date.getFullYear();
      const dateStr = `${y}-${m}-${String(d).padStart(2, '0')}`;
      days.push({
        day: d,
        dateStr,
        dayName: dayNames[date.getDay()]
      });
      date.setDate(date.getDate() + 1);
    }
    return days;
  }
}
