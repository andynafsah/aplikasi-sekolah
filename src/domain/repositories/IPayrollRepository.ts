import { IBaseRepository } from './IBaseRepository';

export interface IPayrollRepository extends IBaseRepository<any> {
  // Master Gaji Methods
  getMasters(tenantId?: string): Promise<any[]>;
  saveMaster(data: any, tenantId?: string): Promise<any>;
  getMasterByEmployee(employeeId: string, tenantId?: string): Promise<any | null>;

  // Payroll calculations Runs
  getRuns(period: string, tenantId?: string): Promise<any[]>;
  saveRun(data: any, tenantId?: string): Promise<any>;
  updateRunStatus(id: string, status: string, tenantId?: string): Promise<any>;

  // Loans Methods
  getLoans(tenantId?: string): Promise<any[]>;
  saveLoan(data: any, tenantId?: string): Promise<any>;
  updateLoanRemaining(id: string, deduction: number, tenantId?: string): Promise<any>;

  // Kasbon Methods
  getKasbons(tenantId?: string): Promise<any[]>;
  saveKasbon(data: any, tenantId?: string): Promise<any>;
  updateKasbonStatus(id: string, status: string, tenantId?: string): Promise<any>;

  // Audit trail logger
  logAudit(data: any): Promise<void>;
  getAuditLogs(tenantId?: string): Promise<any[]>;
}
