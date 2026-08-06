import { IBaseRepository } from '../domain/repositories/IBaseRepository';
import { PrismaEngine } from '../backend/database/prisma';

export class BaseRepository<T> implements IBaseRepository<T> {
  protected tableName: string;
  protected prisma = PrismaEngine;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  // Map plural/custom database table names to lowercase singular Prisma Client keys
  protected getModel(): any {
    const tableMap: Record<string, string> = {
      // Academic
      students: 'student',
      teachers: 'teacher',
      teacher_assignments: 'teacherAssignment',
      employees: 'employee',
      classes: 'class',
      subjects: 'subject',
      attendance: 'attendance',
      payments: 'payment',
      payroll: 'payroll',
      finance: 'finance',
      inventory: 'inventory',
      documents: 'document',
      notifications: 'notification',
      
      // System & Security
      audit_logs: 'auditLog',
      users: 'user',
      roles: 'role',
      permissions: 'permission',
      sessions: 'session',
      refresh_tokens: 'refreshToken',
      
      // Announcements
      announcements: 'announcement',
      announcement_recipients: 'announcementRecipient',
      announcement_comments: 'announcementComment',
      announcement_likes: 'announcementLike',
      broadcast_templates: 'broadcastTemplate',
      
      // Attendance Specific
      attendance_rules: 'attendanceRule',
      replacement_teachers: 'replacementTeacher',
      attendance_geofences: 'attendanceGeofence',
      
      payroll_masters: 'payrollMaster',
      payroll_runs: 'payrollRun',
      payroll_loans: 'payrollLoan',
      payroll_kasbon: 'payrollKasbon',
      payroll_audit_logs: 'payrollAuditLog',
      
      // Academic Extras
      curriculums: 'curriculum',
      subject_categories: 'subjectCategory',
      assessment_types: 'assessmentType',
      assessment_components: 'assessmentComponent',
      assessment_formulas: 'assessmentFormula',
      assessment_scores: 'assessmentScore',
      student_final_scores: 'studentFinalScore',
      
      // School Config
      schools: 'school',
      academic_years: 'academicYear',
      semesters: 'semester',
    };
    const key = tableMap[this.tableName] || this.tableName;
    return (this.prisma as any)[key];
  }

  public async findAll(tenantId?: string): Promise<T[]> {
    const model = this.getModel();
    if (!model) return [];
    try {
      const where: any = { deleted_at: null };
      if (tenantId) {
        where.tenant_id = tenantId;
      }
      return await model.findMany({
        where
      }) as T[];
    } catch (e) {
      return [];
    }
  }

  public async findById(id: string, tenantId?: string): Promise<T | null> {
    const model = this.getModel();
    if (!model) return null;
    try {
      return await model.findUnique({
        where: { id }
      }) as T;
    } catch (e) {
      return null;
    }
  }

  public async findOne(filter: Partial<T>, tenantId?: string): Promise<T | null> {
    const model = this.getModel();
    if (!model) return null;
    try {
      const cleanFilter = { ...filter, deleted_at: null };
      return await model.findFirst({
        where: cleanFilter
      }) as T;
    } catch (e) {
      return null;
    }
  }

  public async findBy(filter: Partial<T>, tenantId?: string): Promise<T[]> {
    const model = this.getModel();
    if (!model) return [];
    try {
      const cleanFilter = { ...filter, deleted_at: null };
      if (tenantId) {
        (cleanFilter as any).tenant_id = tenantId;
      }
      return await model.findMany({
        where: cleanFilter
      }) as T[];
    } catch (e) {
      return [];
    }
  }

  public async create(data: Partial<T>, tenantId?: string): Promise<T> {
    const model = this.getModel();
    if (!model) throw new Error(`Prisma model not found for table ${this.tableName}`);
    const payload = { ...data };
    delete (payload as any).created_at;
    delete (payload as any).updated_at;
    delete (payload as any).deleted_at;
    return await model.create({
      data: payload
    }) as T;
  }

  public async createMany(data: Partial<T>[], tenantId?: string): Promise<T[]> {
    const created: T[] = [];
    for (const d of data) {
      created.push(await this.create(d, tenantId));
    }
    return created;
  }

  public async update(id: string, data: Partial<T>, tenantId?: string): Promise<T | null> {
    const model = this.getModel();
    if (!model) return null;
    const payload = { ...data };
    delete (payload as any).id;
    delete (payload as any).created_at;
    delete (payload as any).updated_at;
    return await model.update({
      where: { id },
      data: payload
    }) as T;
  }

  public async updateMany(filter: Partial<T>, data: Partial<T>, tenantId?: string): Promise<number> {
    const model = this.getModel();
    if (!model) return 0;
    try {
      const cleanFilter = { ...filter, deleted_at: null };
      const items = await model.findMany({ where: cleanFilter });
      let affected = 0;
      for (const item of items) {
        const ok = await this.update((item as any).id, data, tenantId);
        if (ok) affected++;
      }
      return affected;
    } catch (e) {
      return 0;
    }
  }

  public async delete(id: string, tenantId?: string): Promise<boolean> {
    const model = this.getModel();
    if (!model) return false;
    try {
      await model.delete({
        where: { id }
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  public async softDelete(id: string, tenantId?: string): Promise<boolean> {
    const res = await this.update(id, { deleted_at: new Date() } as any, tenantId);
    return res !== null;
  }

  public async restore(id: string, tenantId?: string): Promise<boolean> {
    const res = await this.update(id, { deleted_at: null } as any, tenantId);
    return res !== null;
  }

  public async exists(id: string, tenantId?: string): Promise<boolean> {
    const item = await this.findById(id, tenantId);
    return item !== null;
  }

  public async count(filter?: Partial<T>, tenantId?: string): Promise<number> {
    const model = this.getModel();
    if (!model) return 0;
    try {
      const cleanFilter = filter ? { ...filter, deleted_at: null } : { deleted_at: null };
      return await model.count({
        where: cleanFilter
      });
    } catch (e) {
      return 0;
    }
  }

  public async paginate(
    page: number,
    limit: number,
    filter?: Partial<T>,
    tenantId?: string
  ): Promise<{ items: T[]; total: number; page: number; limit: number }> {
    const model = this.getModel();
    if (!model) return { items: [], total: 0, page, limit };
    try {
      const cleanFilter = filter ? { ...filter, deleted_at: null } : { deleted_at: null };
      const total = await model.count({ where: cleanFilter });
      const items = await model.findMany({
        where: cleanFilter,
        skip: (page - 1) * limit,
        take: limit
      });
      return {
        items: items as T[],
        total,
        page,
        limit
      };
    } catch (e) {
      return { items: [], total: 0, page, limit };
    }
  }

  public async transaction<R>(fn: (repo: this) => Promise<R>): Promise<R> {
    return await this.prisma.$transaction(async () => {
      return await fn(this);
    }) as R;
  }
}

export default BaseRepository;
