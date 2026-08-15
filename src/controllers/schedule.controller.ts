import { Request, Response } from 'express';
import { PrismaEngine } from '../backend/database/prisma';
import { ScheduleEngineService } from '../services/schedule-engine.service';
import { verifyJWT } from '../../server';

// Helper to extract authentication context
function getAuthContext(req: any) {
  const token = req.headers.authorization?.split(' ')[1] || req.body?.token || req.query?.token;
  const authUser = token ? verifyJWT(String(token)) : null;
  const tenantId = authUser ? authUser.tenant_id : (req.body?.tenant_id || req.query?.tenant_id || 'system');
  const userId = authUser ? authUser.id : (req.body?.user_id || req.query?.user_id || 'system-user');
  const role = authUser ? authUser.role : (req.body?.role || req.query?.role || 'EMPLOYEE');
  return { authUser, tenantId, userId, role };
}

export class ScheduleController {

  // ==========================================
  // 1. Attendance Schedules CRUD
  // ==========================================

  public async getSchedules(req: Request, res: Response) {
    try {
      const { tenantId } = getAuthContext(req);
      const schedules = await PrismaEngine.attendanceSchedule.findMany({
        where: { tenant_id: tenantId, deleted_at: null }
      });
      return res.status(200).json({ success: true, data: schedules });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  public async createSchedule(req: Request, res: Response) {
    try {
      const { tenantId } = getAuthContext(req);
      const { 
        name, 
        type, 
        start_time, 
        end_time, 
        grace_period = 10, 
        checkin_open, 
        checkin_close, 
        checkout_open, 
        checkout_close,
        unit_id,
        effective_from,
        effective_until
      } = req.body;

      if (!name || !type || !start_time || !end_time) {
        return res.status(400).json({ success: false, message: 'Missing required parameters (name, type, start_time, end_time).' });
      }

      const schedule = await PrismaEngine.attendanceSchedule.create({
        data: {
          tenant_id: tenantId,
          name,
          type,
          start_time,
          end_time,
          grace_period: Number(grace_period),
          checkin_open: checkin_open || null,
          checkin_close: checkin_close || null,
          checkout_open: checkout_open || null,
          checkout_close: checkout_close || null,
          unit_id: unit_id || null,
          effective_from: effective_from ? new Date(effective_from) : null,
          effective_until: effective_until ? new Date(effective_until) : null,
          active: true
        }
      });

      return res.status(210).json({ success: true, message: 'Attendance Schedule created successfully.', data: schedule });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  public async updateSchedule(req: Request, res: Response) {
    try {
      const { tenantId } = getAuthContext(req);
      const { id } = req.params;
      const data = { ...req.body };
      delete data.id;
      delete data.tenant_id;

      if (data.grace_period !== undefined) data.grace_period = Number(data.grace_period);
      if (data.effective_from) data.effective_from = new Date(data.effective_from);
      if (data.effective_until) data.effective_until = new Date(data.effective_until);

      const schedule = await PrismaEngine.attendanceSchedule.update({
        where: { id },
        data: data
      });

      return res.status(200).json({ success: true, message: 'Attendance Schedule updated successfully.', data: schedule });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  public async deleteSchedule(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await PrismaEngine.attendanceSchedule.update({
        where: { id },
        data: { deleted_at: new Date(), active: false }
      });
      return res.status(200).json({ success: true, message: 'Attendance Schedule deleted successfully.' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // ==========================================
  // 2. Working Calendar CRUD
  // ==========================================

  public async getCalendars(req: Request, res: Response) {
    try {
      const { tenantId } = getAuthContext(req);
      const calendars = await PrismaEngine.workingCalendar.findMany({
        where: { tenant_id: tenantId, deleted_at: null }
      });
      return res.status(200).json({ success: true, data: calendars });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  public async createCalendar(req: Request, res: Response) {
    try {
      const { tenantId } = getAuthContext(req);
      const { name, type, working_days } = req.body;

      if (!name || !type || !working_days) {
        return res.status(400).json({ success: false, message: 'Missing required parameters (name, type, working_days).' });
      }

      const calendar = await PrismaEngine.workingCalendar.create({
        data: {
          tenant_id: tenantId,
          name,
          type,
          working_days: typeof working_days === 'string' ? working_days : JSON.stringify(working_days),
          active: true
        }
      });

      return res.status(210).json({ success: true, message: 'Working Calendar created successfully.', data: calendar });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  public async updateCalendar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, type, working_days, active } = req.body;

      const calendar = await PrismaEngine.workingCalendar.update({
        where: { id },
        data: {
          name,
          type,
          working_days: typeof working_days === 'string' ? working_days : JSON.stringify(working_days),
          active: active !== undefined ? Boolean(active) : undefined
        }
      });

      return res.status(200).json({ success: true, message: 'Working Calendar updated successfully.', data: calendar });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  public async deleteCalendar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await PrismaEngine.workingCalendar.update({
        where: { id },
        data: { deleted_at: new Date(), active: false }
      });
      return res.status(200).json({ success: true, message: 'Working Calendar deleted successfully.' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // ==========================================
  // 3. Holidays CRUD
  // ==========================================

  public async getHolidays(req: Request, res: Response) {
    try {
      const { tenantId } = getAuthContext(req);
      const holidays = await PrismaEngine.calendarHoliday.findMany({
        where: { tenant_id: tenantId, deleted_at: null }
      });
      return res.status(200).json({ success: true, data: holidays });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  public async createHoliday(req: Request, res: Response) {
    try {
      const { tenantId } = getAuthContext(req);
      const { name, date_start, date_end, type, description, calendar_id } = req.body;

      if (!name || !date_start || !type) {
        return res.status(400).json({ success: false, message: 'Missing required parameters (name, date_start, type).' });
      }

      const holiday = await PrismaEngine.calendarHoliday.create({
        data: {
          tenant_id: tenantId,
          calendar_id: calendar_id || null,
          name,
          date_start: new Date(date_start),
          date_end: date_end ? new Date(date_end) : null,
          type,
          description: description || null
        }
      });

      return res.status(210).json({ success: true, message: 'Holiday created successfully.', data: holiday });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  public async updateHoliday(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = { ...req.body };
      delete data.id;

      if (data.date_start) data.date_start = new Date(data.date_start);
      if (data.date_end) data.date_end = new Date(data.date_end);

      const holiday = await PrismaEngine.calendarHoliday.update({
        where: { id },
        data: data
      });

      return res.status(200).json({ success: true, message: 'Holiday updated successfully.', data: holiday });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  public async deleteHoliday(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await PrismaEngine.calendarHoliday.update({
        where: { id },
        data: { deleted_at: new Date() }
      });
      return res.status(200).json({ success: true, message: 'Holiday deleted successfully.' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // ==========================================
  // 4. Overrides CRUD
  // ==========================================

  public async getOverrides(req: Request, res: Response) {
    try {
      const { tenantId } = getAuthContext(req);
      const overrides = await PrismaEngine.scheduleOverride.findMany({
        where: { tenant_id: tenantId, deleted_at: null }
      });
      return res.status(200).json({ success: true, data: overrides });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  public async createOverride(req: Request, res: Response) {
    try {
      const { tenantId } = getAuthContext(req);
      const { target_type, target_id, date, schedule_id, name } = req.body;

      if (!target_type || !target_id || !date) {
        return res.status(400).json({ success: false, message: 'Missing required parameters (target_type, target_id, date).' });
      }

      const override = await PrismaEngine.scheduleOverride.create({
        data: {
          tenant_id: tenantId,
          target_type,
          target_id,
          date: new Date(date),
          schedule_id: schedule_id || null,
          name: name || null
        }
      });

      return res.status(210).json({ success: true, message: 'Schedule Override created successfully.', data: override });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  public async updateOverride(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = { ...req.body };
      delete data.id;

      if (data.date) data.date = new Date(data.date);

      const override = await PrismaEngine.scheduleOverride.update({
        where: { id },
        data: data
      });

      return res.status(200).json({ success: true, message: 'Schedule Override updated successfully.', data: override });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  public async deleteOverride(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await PrismaEngine.scheduleOverride.update({
        where: { id },
        data: { deleted_at: new Date() }
      });
      return res.status(200).json({ success: true, message: 'Schedule Override deleted successfully.' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // ==========================================
  // 5. Assignments CRUD
  // ==========================================

  public async getAssignments(req: Request, res: Response) {
    try {
      const { tenantId } = getAuthContext(req);
      const assignments = await PrismaEngine.scheduleAssignment.findMany({
        where: { tenant_id: tenantId, deleted_at: null }
      });
      return res.status(200).json({ success: true, data: assignments });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  public async createAssignment(req: Request, res: Response) {
    try {
      const { tenantId } = getAuthContext(req);
      const { schedule_id, target_type, target_id, priority = 1 } = req.body;

      if (!schedule_id || !target_type || !target_id) {
        return res.status(400).json({ success: false, message: 'Missing required parameters (schedule_id, target_type, target_id).' });
      }

      // Check if assignment priority is logical or assign custom standard priority based on target_type
      let resolvedPriority = Number(priority);
      if (resolvedPriority === 1) {
        if (target_type === 'PERSON') resolvedPriority = 5;
        else if (target_type === 'ROLE' || target_type === 'SHIFT') resolvedPriority = 4;
        else if (target_type === 'ROMBEL') resolvedPriority = 3;
        else if (target_type === 'UNIT') resolvedPriority = 2;
      }

      const assignment = await PrismaEngine.scheduleAssignment.create({
        data: {
          tenant_id: tenantId,
          schedule_id,
          target_type,
          target_id,
          priority: resolvedPriority,
          active: true
        }
      });

      return res.status(210).json({ success: true, message: 'Schedule Assignment created successfully.', data: assignment });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  public async deleteAssignment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await PrismaEngine.scheduleAssignment.update({
        where: { id },
        data: { deleted_at: new Date(), active: false }
      });
      return res.status(200).json({ success: true, message: 'Schedule Assignment deleted successfully.' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // ==========================================
  // 6. Dynamic Evaluation & Conflict Reports
  // ==========================================

  public async getMyTodaySchedule(req: Request, res: Response) {
    try {
      const { tenantId, userId, role } = getAuthContext(req);
      const date = req.query.date ? new Date(String(req.query.date)) : new Date();

      const resolved = await ScheduleEngineService.resolveScheduleForUser({
        tenantId,
        userId,
        role,
        date
      });

      return res.status(200).json({ success: true, data: resolved });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  public async getConflictReport(req: Request, res: Response) {
    try {
      const { tenantId } = getAuthContext(req);
      const conflicts = await ScheduleEngineService.detectAllConflicts(tenantId);
      return res.status(200).json({ success: true, data: conflicts });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
