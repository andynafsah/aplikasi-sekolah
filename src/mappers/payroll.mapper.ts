import { EmployeeSalaryMasterDTO } from '../domain/dtos/payroll.dto';

export class PayrollMapper {
  public static toMasterEntity(dto: EmployeeSalaryMasterDTO, tenantId: string): any {
    return {
      id: `pm-${dto.employeeId}`,
      tenant_id: tenantId,
      employee_id: dto.employeeId,
      employee_name: dto.employeeName,
      role: dto.role,
      base_salary: dto.baseSalary,
      daily_allowance: dto.dailyAllowance,
      position_allowance: dto.positionAllowance,
      family_allowance: dto.familyAllowance,
      certification_allowance: dto.certificationAllowance,
      functional_allowance: dto.functionalAllowance,
      pondok_allowance: dto.pondokAllowance,
      bpjs_subsidy: dto.bpjsAllowance,
      tax_subsidy: dto.taxAllowance,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    };
  }

  public static toMasterResponse(entity: any): EmployeeSalaryMasterDTO {
    return {
      employeeId: entity.employee_id || entity.employeeId,
      employeeName: entity.employee_name || entity.employeeName,
      role: entity.role,
      baseSalary: Number(entity.base_salary || entity.baseSalary || 0),
      dailyAllowance: Number(entity.daily_allowance || entity.dailyAllowance || 0),
      positionAllowance: Number(entity.position_allowance || entity.positionAllowance || 0),
      familyAllowance: Number(entity.family_allowance || entity.familyAllowance || 0),
      certificationAllowance: Number(entity.certification_allowance || entity.certificationAllowance || 0),
      functionalAllowance: Number(entity.functional_allowance || entity.functionalAllowance || 0),
      pondokAllowance: Number(entity.pondok_allowance || entity.pondokAllowance || 0),
      bpjsAllowance: Number(entity.bpjs_subsidy || entity.bpjsAllowance || 0),
      taxAllowance: Number(entity.tax_subsidy || entity.taxAllowance || 0),
    };
  }

  public static toSlipFormat(run: any): any {
    const periodStr = run.payroll_period || run.payrollPeriod;
    const [year, month] = periodStr.split('-');
    const monthsName = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const monthLabel = monthsName[parseInt(month, 10) - 1] || 'Bulan';

    // Digital signature encryption mock
    const digitalSignature = `SIG-E-ERP-${run.id}-${Buffer.from(`${run.employee_id}-${run.net_salary}`).toString('base64').substring(0, 20)}`;
    const qrCodeMock = `https://ais-dev-cuu72c5niw56xr2fibir2x-217257253856.asia-east1.run.app/slips/verify?id=${run.id}`;
    const barcodeMock = `*PAY-${run.id}*`;

    return {
      id: run.id,
      period: periodStr,
      periodLabel: `${monthLabel} ${year}`,
      employeeId: run.employee_id,
      employeeName: run.employee_name,
      role: run.role,
      earnings: {
        baseSalary: Number(run.base_salary || 0),
        teachingHonor: Number(run.teaching_honor || 0),
        substituteHonor: Number(run.substitute_honor || 0),
        overtimeHonor: Number(run.overtime_honor || 0),
        allowances: {
          position: Number(run.position_allowance || 0),
          transport: Number(run.transport_allowance || 0),
          makan: Number(run.makan_allowance || 0),
          family: Number(run.family_allowance || 0),
          certification: Number(run.certification_allowance || 0),
          functional: Number(run.functional_allowance || 0),
          pondok: Number(run.pondok_allowance || 0),
          custom: Number(run.custom_allowance || 0)
        }
      },
      deductions: {
        late: Number(run.late_deduction || 0),
        alfa: Number(run.alfa_deduction || 0),
        leave: Number(run.leave_deduction || 0),
        loan: Number(run.loan_deduction || 0),
        kasbon: Number(run.kasbon_deduction || 0),
        bpjs: Number(run.bpjs_deduction || 0),
        taxPph21: Number(run.tax_pph21 || 0),
        yayasan: Number(run.yayasan_deduction || 0),
        custom: Number(run.custom_deduction || 0)
      },
      bonuses: {
        thr: Number(run.thr_payment || 0),
        annualBonus: Number(run.annual_bonus || 0)
      },
      totals: {
        grossEarnings: Number(run.gross_earnings || 0),
        totalDeductions: Number(run.total_deductions || 0),
        netSalary: Number(run.net_salary || 0)
      },
      meta: {
        approvalStatus: run.approval_status,
        paymentStatus: run.payment_status,
        paidAt: run.paid_at,
        digitalSignature,
        qrCodeUrl: qrCodeMock,
        barcodeValue: barcodeMock
      }
    };
  }
}
