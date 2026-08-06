import { BaseRepository } from './base.repository';
import { IPayrollRepository } from '../domain/repositories/IPayrollRepository';

export class PayrollRepository extends BaseRepository<any> implements IPayrollRepository {
  constructor() {
    super('payroll_masters');
  }

  // Master Gaji Methods
  public async getMasters(tenantId?: string): Promise<any[]> {
    return await this.findAll(tenantId);
  }

  public async saveMaster(data: any, tenantId?: string): Promise<any> {
    const tId = tenantId || 'tenant-1';
    const existing = await this.findOne({ employee_id: data.employeeId } as any, tId);

    if (existing) {
      return await this.update(existing.id, {
        employee_name: data.employeeName,
        role: data.role,
        base_salary: data.baseSalary,
        daily_allowance: data.dailyAllowance,
        position_allowance: data.positionAllowance,
        family_allowance: data.familyAllowance,
        certification_allowance: data.certificationAllowance,
        functional_allowance: data.functionalAllowance,
        pondok_allowance: data.pondokAllowance,
        bpjs_subsidy: data.bpjsAllowance,
        tax_subsidy: data.taxAllowance,
      }, tId);
    } else {
      return await this.create({
        tenant_id: tId,
        employee_id: data.employeeId,
        employee_name: data.employeeName,
        role: data.role,
        base_salary: data.baseSalary,
        daily_allowance: data.dailyAllowance,
        position_allowance: data.positionAllowance,
        family_allowance: data.familyAllowance,
        certification_allowance: data.certificationAllowance,
        functional_allowance: data.functionalAllowance,
        pondok_allowance: data.pondokAllowance,
        bpjs_subsidy: data.bpjsAllowance,
        tax_subsidy: data.taxAllowance,
      }, tId);
    }
  }

  public async getMasterByEmployee(employeeId: string, tenantId?: string): Promise<any | null> {
    const masters = await this.getMasters(tenantId);
    return masters.find((item: any) => item.employee_id === employeeId) || null;
  }

  // Payroll calculations Runs
  public async getRuns(period: string, tenantId?: string): Promise<any[]> {
    return await this.findBy({ payroll_period: period }, tenantId);
  }

  public async saveRun(data: any, tenantId?: string): Promise<any> {
    const tId = tenantId || 'tenant-1';
    const existing = await this.findOne({ employee_id: data.employee_id, payroll_period: data.payroll_period } as any, tId);

    if (existing) {
      return await this.update(existing.id, {
        ...data,
      }, tId);
    } else {
      return await this.create({
        tenant_id: tId,
        ...data,
      }, tId);
    }
  }

  public async updateRunStatus(id: string, status: string, tenantId?: string): Promise<any> {
    const run = await this.findById(id, tenantId);
    if (run) {
      const updateData: any = { approval_status: status };
      if (status === 'YAYASAN_APPROVED') {
        updateData.payment_status = 'PAID';
        updateData.paid_at = new Date();
      }
      return await this.update(id, updateData, tenantId);
    }
    throw new Error('Data payroll run tidak ditemukan.');
  }

  // Loans Methods
  public async getLoans(tenantId?: string): Promise<any[]> {
    return await this.findAll(tenantId);
  }

  public async saveLoan(data: any, tenantId?: string): Promise<any> {
    const tId = tenantId || 'tenant-1';
    return await this.create({
      tenant_id: tId,
      employee_id: data.employeeId,
      employee_name: data.employeeName,
      loan_amount: Number(data.amount || 0),
      tenor_months: Number(data.tenor || 1),
      monthly_installment: Number(data.monthlyInstallment || 0),
      remaining_amount: Number(data.amount || 0),
      reason: data.reason || '',
      approval_status: data.status || 'PENDING',
      payment_status: 'ACTIVE',
    }, tId);
  }

  public async updateLoanRemaining(id: string, deduction: number, tenantId?: string): Promise<any> {
    const loan = await this.findById(id, tenantId);
    if (loan) {
      const remaining = Math.max(0, loan.remaining_amount - deduction);
      const updateData: any = { remaining_amount: remaining };
      if (remaining <= 0) {
        updateData.payment_status = 'PAID_OFF';
      }
      return await this.update(id, updateData, tenantId);
    }
    throw new Error('Pinjaman tidak ditemukan.');
  }

  // Kasbon Methods
  public async getKasbons(tenantId?: string): Promise<any[]> {
    return await this.findAll(tenantId);
  }

  public async saveKasbon(data: any, tenantId?: string): Promise<any> {
    const tId = tenantId || 'tenant-1';
    return await this.create({
      tenant_id: tId,
      employee_id: data.employeeId,
      employee_name: data.employeeName,
      kasbon_amount: Number(data.amount || 0),
      reason: data.reason || '',
      status: data.status || 'PENDING',
    }, tId);
  }

  public async updateKasbonStatus(id: string, status: string, tenantId?: string): Promise<any> {
    const kb = await this.findById(id, tenantId);
    if (!kb) {
      throw new Error('Kasbon tidak ditemukan.');
    }
    return await this.update(id, { status: status }, tenantId);
  }

  // Audit trail logger
  public async logAudit(data: any): Promise<void> {
    await this.create({
      tenant_id: data.tenantId || 'tenant-1',
      actor_id: data.actorId || 'system',
      actor_name: data.actorName || 'System',
      actor_role: data.actorRole || 'SYSTEM',
      action_type: data.actionType,
      module: data.module,
      description: data.description,
      payload: data.payload ? JSON.stringify(data.payload) : null,
    });
    console.log(`[PAYROLL AUDIT] ${data.actionType} on ${data.module}: ${data.description}`);
  }

  public async getAuditLogs(tenantId?: string): Promise<any[]> {
    return await this.findAll(tenantId);
  }
}
export default PayrollRepository;
