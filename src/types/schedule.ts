/**
 * Enterprise Attendance Schedule & Working Calendar Core Types
 */

export interface AttendanceSchedule {
  id: string;
  tenant_id: string;
  name: string;
  unit_id: string | null;
  type: 'REGULAR' | 'SHIFT' | 'STUDENT' | 'CUSTOM' | 'SECURITY';
  start_time: string; // "07:30"
  end_time: string; // "15:30"
  grace_period: number; // in minutes, e.g. 10
  checkin_open: string | null; // "06:00"
  checkin_close: string | null; // "09:00"
  checkout_open: string | null; // "14:00"
  checkout_close: string | null; // "18:00"
  active: boolean;
  effective_from: Date | string | null;
  effective_until: Date | string | null;
  created_at?: Date | string;
  updated_at?: Date | string;
  deleted_at?: Date | string | null;
}

export interface ScheduleAssignment {
  id: string;
  tenant_id: string;
  schedule_id: string;
  target_type: 'PERSON' | 'ROLE' | 'UNIT' | 'ROMBEL' | 'DEPARTMENT' | 'SHIFT';
  target_id: string; // user_id, role code (e.g. "SECURITY", "TEACHER"), unit_id, rombel_id, etc.
  priority: number; // PERSON=5, ROLE/SHIFT=4, ROMBEL=3, UNIT=2, ORGANIZATION=1
  active: boolean;
  created_at?: Date | string;
  updated_at?: Date | string;
  deleted_at?: Date | string | null;
}

export interface WorkingCalendar {
  id: string;
  tenant_id: string;
  name: string;
  type: 'ACADEMIC' | 'EMPLOYEE' | 'STUDENT' | 'SECURITY' | 'CUSTOM';
  working_days: string; // JSON array string e.g. "[\"Senin\", \"Selasa\", \"Rabu\", \"Kamis\", \"Jumat\"]"
  active: boolean;
  created_at?: Date | string;
  updated_at?: Date | string;
  deleted_at?: Date | string | null;
}

export interface CalendarHoliday {
  id: string;
  tenant_id: string;
  calendar_id: string | null; // Null means system global default holiday
  name: string;
  date_start: Date | string;
  date_end: Date | string | null;
  type: 'NATIONAL' | 'ORGANIZATION' | 'UNIT' | 'ACADEMIC' | 'CUSTOM';
  description: string | null;
  created_at?: Date | string;
  updated_at?: Date | string;
  deleted_at?: Date | string | null;
}

export interface ScheduleOverride {
  id: string;
  tenant_id: string;
  target_type: 'PERSON' | 'ROLE' | 'ROMBEL' | 'UNIT';
  target_id: string;
  date: Date | string;
  schedule_id: string | null; // NULL means Holiday/Off Day override
  name: string | null; // Reason e.g. "Ramadhan", "Ujian"
  created_at?: Date | string;
  updated_at?: Date | string;
  deleted_at?: Date | string | null;
}
