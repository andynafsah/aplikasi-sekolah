/**
 * @file Services.ts
 * @description LEGACY COMPATIBILITY ADAPTER LAYER
 * 
 * @deprecated
 * IMPORTANT: This module is maintained solely for legacy testing suite backward compatibility.
 * All production business logic must use the Canonical Enterprise Services:
 * - Student: src/services/student.service.ts
 * - Teacher: src/services/teacher.service.ts
 * - Employee: src/services/employee.service.ts
 * - Attendance: src/services/smart-attendance.service.ts
 * - Payroll: src/services/payroll.service.ts
 * - Finance: src/services/finance.service.ts
 */

import { 
  StudentRepository, 
  TeacherRepository, 
  EmployeeRepository, 
  AttendanceRepository, 
  PayrollRepository, 
  FinanceRepository 
} from '../repositories/Repositories';
import { ConnectionManager } from '../connection/ConnectionManager';

/**
 * @deprecated Use `src/services/student.service.ts` (StudentService) as Primary Source of Truth.
 */
export class StudentService {
  private repo: StudentRepository;

  constructor() {
    this.repo = new StudentRepository();
  }

  public async getStudents(tenantId: string, limit = 50, offset = 0, search = ''): Promise<any[]> {
    return await this.repo.findAll(tenantId, limit, offset, search);
  }

  public async getStudentById(tenantId: string, id: string): Promise<any | null> {
    return await this.repo.findById(tenantId, id);
  }

  public async registerStudent(tenantId: string, data: any): Promise<any> {
    const provider = ConnectionManager.getInstance().getProvider();
    
    // Validate request
    if (!data.name || !data.nisn) {
      throw new Error('Student name and NISN are required fields.');
    }

    // Wrap in an atomic MySQL Transaction
    await provider.beginTransaction();
    try {
      const student = await this.repo.create({
        ...data,
        tenant_id: tenantId
      });
      await provider.commit();
      return student;
    } catch (err) {
      await provider.rollback();
      throw err;
    }
  }

  public async updateStudent(tenantId: string, id: string, data: any): Promise<boolean> {
    const provider = ConnectionManager.getInstance().getProvider();
    await provider.beginTransaction();
    try {
      const ok = await this.repo.update(tenantId, id, data);
      await provider.commit();
      return ok;
    } catch (err) {
      await provider.rollback();
      throw err;
    }
  }

  public async removeStudent(tenantId: string, id: string, userId: string): Promise<boolean> {
    const provider = ConnectionManager.getInstance().getProvider();
    await provider.beginTransaction();
    try {
      const ok = await this.repo.softDelete(tenantId, id, userId);
      await provider.commit();
      return ok;
    } catch (err) {
      await provider.rollback();
      throw err;
    }
  }
}

/**
 * @deprecated Use `src/services/teacher.service.ts` (TeacherService) as Primary Source of Truth.
 */
export class TeacherService {
  private repo: TeacherRepository;

  constructor() {
    this.repo = new TeacherRepository();
  }

  public async getTeachers(tenantId: string): Promise<any[]> {
    return await this.repo.findAll(tenantId);
  }

  public async getTeacherById(tenantId: string, id: string): Promise<any | null> {
    return await this.repo.findById(tenantId, id);
  }
}

/**
 * @deprecated Use `src/services/employee.service.ts` (EmployeeService) as Primary Source of Truth.
 */
export class EmployeeService {
  private repo: EmployeeRepository;

  constructor() {
    this.repo = new EmployeeRepository();
  }

  public async getEmployees(tenantId: string): Promise<any[]> {
    return await this.repo.findAll(tenantId);
  }

  public async getEmployeeById(tenantId: string, id: string): Promise<any | null> {
    return await this.repo.findById(tenantId, id);
  }
}

/**
 * @deprecated Use `src/services/smart-attendance.service.ts` (smartAttendanceService) as Primary Source of Truth.
 */
export class AttendanceService {
  private repo: AttendanceRepository;

  constructor() {
    this.repo = new AttendanceRepository();
  }

  public async recordAttendance(tenantId: string, data: any): Promise<any> {
    const provider = ConnectionManager.getInstance().getProvider();
    await provider.beginTransaction();
    try {
      const att = await this.repo.logAttendance({
        ...data,
        tenant_id: tenantId
      });
      await provider.commit();
      return att;
    } catch (err) {
      await provider.rollback();
      throw err;
    }
  }

  public async getDailyReport(tenantId: string, date: string): Promise<any[]> {
    return await this.repo.findByDate(tenantId, date);
  }
}

/**
 * @deprecated Use `src/services/payroll.service.ts` (PayrollService) as Primary Source of Truth.
 */
export class PayrollService {
  private repo: PayrollRepository;

  constructor() {
    this.repo = new PayrollRepository();
  }

  public async getPayrollRecords(tenantId: string): Promise<any[]> {
    return await this.repo.findAll(tenantId);
  }

  public async getPayrollById(tenantId: string, id: string): Promise<any | null> {
    return await this.repo.findById(tenantId, id);
  }
}

/**
 * @deprecated Use `src/services/finance.service.ts` (FinanceService) as Primary Source of Truth.
 */
export class FinanceService {
  private repo: FinanceRepository;

  constructor() {
    this.repo = new FinanceRepository();
  }

  public async getTransactions(tenantId: string): Promise<any[]> {
    return await this.repo.findAll(tenantId);
  }

  public async getTransactionById(tenantId: string, id: string): Promise<any | null> {
    return await this.repo.findById(tenantId, id);
  }
}

