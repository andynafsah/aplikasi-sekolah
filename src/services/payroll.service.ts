import { IPayrollRepository } from '../domain/repositories/IPayrollRepository';
import { IAttendanceRepository } from '../domain/repositories/IAttendanceRepository';
import { AttendanceRepository } from '../repositories/attendance.repository';
import { PayrollMapper } from '../mappers/payroll.mapper';
import { DB } from '../../server';
import { AutoNumberService } from './autonumber.service';

export class PayrollService {
  private attendanceRepo: IAttendanceRepository;

  constructor(private readonly payrollRepository: IPayrollRepository) {
    this.attendanceRepo = new AttendanceRepository();
  }

  // 1. Core Payroll Engine: Dynamic Calculation of Period Payroll
  public async calculatePeriodPayroll(period: string, tenantId: string, actor: any): Promise<any[]> {
    const masters = await this.payrollRepository.getMasters(tenantId);
    
    // Seed default masters if none exist so user has data on first run
    if (masters.length === 0) {
      await this.seedDefaultMasters(tenantId);
    }
    
    const activeMasters = await this.payrollRepository.getMasters(tenantId);
    const calculatedRuns: any[] = [];

    // Retrieve external integrations
    // A. Attendance records for late penalties or alphas
    const attendances = await this.attendanceRepo.findAll(tenantId);
    const filteredAtt = attendances.filter((a: any) => a.date?.startsWith(period));

    // B. Replacement teacher records
    const replacements = await this.attendanceRepo.getReplacements(tenantId);
    const periodReplacements = replacements.filter((r: any) => r.date?.startsWith(period) && r.deleted_at === null);

    // C. Active loans
    const loans = await this.payrollRepository.getLoans(tenantId);
    const activeLoans = loans.filter((l: any) => l.approval_status.includes('APPROVED') && l.payment_status === 'ACTIVE');

    // D. Active kasbons
    const kasbons = await this.payrollRepository.getKasbons(tenantId);
    const approvedKasbons = kasbons.filter((k: any) => k.status === 'APPROVED');

    for (const master of activeMasters) {
      const empId = master.employee_id;
      const empName = master.employee_name;

      // Calculate teaching schedules/hours (Simulated schedule logic: 16 teaching sessions/month base)
      const isTeacher = master.role === 'GURU';
      const baseTeachingHours = isTeacher ? 20 : 0;
      const hourlyTeachingRate = isTeacher ? 45000 : 0;
      const teachingHonor = baseTeachingHours * hourlyTeachingRate;

      // Calculate substitute honors or original teacher penalties
      let substituteHonor = 0;
      let replacementDeduction = 0;

      // Substitute teacher gets standard slot honor
      const substitutedList = periodReplacements.filter((r: any) => r.substitute_teacher_id === empId);
      substituteHonor = substitutedList.reduce((acc: number, item: any) => acc + Number(item.honorCalculated || 0), 0);

      // Original teacher who missed gets standard penalization (transferred teach cost)
      const replacedList = periodReplacements.filter((r: any) => r.original_teacher_id === empId);
      replacementDeduction = replacedList.reduce((acc: number, item: any) => acc + Number(item.deductionCalculated || 0), 0);

      // Overtime logs calculation (Lembur per hour base - simulated logic)
      const overtimeHours = master.role === 'PEGAWAI' ? 8 : 2; // default simulation values
      const overtimeRate = 25000;
      const overtimeHonor = overtimeHours * overtimeRate;

      // Attendance penalties: Count late instances and alpha
      const empAtts = filteredAtt.filter((a: any) => a.person_id === empId || a.personId === empId);
      const lateInstances = empAtts.filter((a: any) => a.status === 'TERLAMBAT');
      const alphaInstances = empAtts.filter((a: any) => a.status === 'ALFA');

      // Base deductions from attendance lates and alphas
      const lateDeduction = lateInstances.reduce((sum: number, rec: any) => sum + Number(rec.payroll_deduction || 15000), 0);
      const alphaDeduction = alphaInstances.length * 150000; // Rp 150,000 per alpha absence

      // Loans installments deduction
      const empLoan = activeLoans.find((l: any) => l.employee_id === empId);
      const loanDeduction = empLoan ? Math.min(empLoan.monthly_installment, empLoan.remaining_amount) : 0;

      // Kasbon (immediate cash advance) deduction
      const empKasbons = approvedKasbons.filter((k: any) => k.employee_id === empId);
      const kasbonDeduction = empKasbons.reduce((sum: number, k: any) => sum + Number(k.kasbon_amount), 0);

      // BPJS & PPh21 Tax standard calculations
      const bpjsSubsidy = Number(master.bpjs_subsidy || 0);
      const bpjsDeduction = Number(master.base_salary) * 0.02 + bpjsSubsidy; // 2% employee contribution + subsidy
      
      const taxSubsidy = Number(master.tax_subsidy || 0);
      const taxPph21 = this.calculatePPh21Tax(Number(master.base_salary)) + taxSubsidy; // 5% tier simulation

      // Aggregate earnings & deductions
      const grossEarnings = 
        Number(master.base_salary) +
        teachingHonor +
        substituteHonor +
        overtimeHonor +
        Number(master.daily_allowance || 0) * 20 + // assuming 20 working days
        Number(master.position_allowance || 0) +
        Number(master.family_allowance || 0) +
        Number(master.certification_allowance || 0) +
        Number(master.functional_allowance || 0) +
        Number(master.pondok_allowance || 0) +
        bpjsSubsidy +
        taxSubsidy;

      const totalDeductions =
        lateDeduction +
        alphaDeduction +
        replacementDeduction +
        loanDeduction +
        kasbonDeduction +
        bpjsDeduction +
        taxPph21;

      const netSalary = Math.max(0, grossEarnings - totalDeductions);

      // Create Run Payload
      const runPayload = {
        payroll_period: period,
        employee_id: empId,
        employee_name: empName,
        role: master.role,
        
        base_salary: Number(master.base_salary),
        teaching_hours: baseTeachingHours,
        teaching_honor: teachingHonor,
        substitute_honor: substituteHonor,
        overtime_hours: overtimeHours,
        overtime_honor: overtimeHonor,

        position_allowance: Number(master.position_allowance || 0),
        transport_allowance: Number(master.daily_allowance || 0) * 10, // partial daily allowance transport
        makan_allowance: Number(master.daily_allowance || 0) * 10,
        family_allowance: Number(master.family_allowance || 0),
        certification_allowance: Number(master.certification_allowance || 0),
        functional_allowance: Number(master.functional_allowance || 0),
        pondok_allowance: Number(master.pondok_allowance || 0),
        custom_allowance: 0,

        late_deduction: lateDeduction,
        alfa_deduction: alphaDeduction,
        leave_deduction: replacementDeduction,
        loan_deduction: loanDeduction,
        kasbon_deduction: kasbonDeduction,
        bpjs_deduction: bpjsDeduction,
        tax_pph21: taxPph21,
        yayasan_deduction: 25000, // Standard yayasan social fund cut
        custom_deduction: 0,

        thr_payment: 0, // calculated during THR event
        annual_bonus: 0,

        gross_earnings: grossEarnings,
        total_deductions: totalDeductions + 25000,
        net_salary: netSalary - 25000,

        approval_status: 'STAFF_DRAFT',
        payment_status: 'UNPAID'
      };

      const savedRun = await this.payrollRepository.saveRun(runPayload, tenantId);
      calculatedRuns.push(savedRun);
    }

    await this.payrollRepository.logAudit({
      tenantId,
      actorId: actor?.id || 'system',
      actorName: actor?.name || 'Staff Keuangan',
      actorRole: actor?.role || 'FINANCE_STAFF',
      actionType: 'CREATE',
      module: 'RUN_PAYROLL',
      description: `Menghitung otomatis gaji bulanan periode ${period} untuk ${activeMasters.length} karyawan`,
      payload: { period }
    });

    return calculatedRuns;
  }

  // Helper Tax brackets
  private calculatePPh21Tax(monthlySalary: number): number {
    const annualSalary = monthlySalary * 12;
    // PTKP standard deduction of Rp 54,000,000
    const taxableIncome = Math.max(0, annualSalary - 54000000);
    if (taxableIncome === 0) return 0;
    // Standard 5% tax bracket divided by 12
    return parseFloat(((taxableIncome * 0.05) / 12).toFixed(2));
  }

  // 2. Setup Gaji Master Methods
  public async getMasters(tenantId: string): Promise<any[]> {
    const list = await this.payrollRepository.getMasters(tenantId);
    return list.map(item => PayrollMapper.toMasterResponse(item));
  }

  public async saveMaster(data: any, tenantId: string, actor: any): Promise<any> {
    const saved = await this.payrollRepository.saveMaster(data, tenantId);
    
    await this.payrollRepository.logAudit({
      tenantId,
      actorId: actor?.id || 'system',
      actorName: actor?.name || 'Staff Keuangan',
      actorRole: actor?.role || 'FINANCE_STAFF',
      actionType: 'UPDATE',
      module: 'MASTER_SALARY',
      description: `Memperbarui master gaji karyawan ${data.employeeName} (${data.employeeId})`,
      payload: data
    });

    return PayrollMapper.toMasterResponse(saved);
  }

  // 3. Loans Operations
  public async getLoans(tenantId: string): Promise<any[]> {
    return await this.payrollRepository.getLoans(tenantId);
  }

  public async submitLoan(data: any, tenantId: string, actor: any): Promise<any> {
    const payload = {
      ...data,
      status: 'PENDING'
    };
    const saved = await this.payrollRepository.saveLoan(payload, tenantId);
    
    await this.payrollRepository.logAudit({
      tenantId,
      actorId: actor?.id || 'system',
      actorName: actor?.name || 'Staff Keuangan',
      actorRole: actor?.role || 'FINANCE_STAFF',
      actionType: 'CREATE',
      module: 'LOANS',
      description: `Mengajukan pinjaman baru atas nama ${data.employeeName} senilai Rp ${Number(data.amount).toLocaleString('id-ID')}`,
      payload: data
    });

    return saved;
  }

  public async approveLoan(id: string, currentRole: string, tenantId: string, actor: any): Promise<any> {
    const loans = await this.getLoans(tenantId);
    const loan = loans.find(l => l.id === id);
    if (!loan) throw new Error('Pinjaman tidak ditemukan.');

    // Hierarchical workflow transition
    let nextStatus = loan.approval_status;
    if (currentRole === 'TU' || currentRole === 'KEPALA_TU') nextStatus = 'APPROVED_TU';
    else if (currentRole === 'TREASURER' || currentRole === 'BENDAHARA') nextStatus = 'APPROVED_TREASURER';
    else if (currentRole === 'PRINCIPAL' || currentRole === 'KEPALA_SEKOLAH') nextStatus = 'APPROVED_PRINCIPAL';
    else if (currentRole === 'YAYASAN' || currentRole === 'KETUA_YAYASAN') nextStatus = 'APPROVED_YAYASAN';
    else nextStatus = 'APPROVED_STAFF';

    const dbAny = DB as any;
    const match = dbAny.payroll_loans.find((l: any) => l.id === id);
    if (match) {
      match.approval_status = nextStatus;
      match.updated_at = new Date().toISOString();
    }

    await this.payrollRepository.logAudit({
      tenantId,
      actorId: actor?.id || 'system',
      actorName: actor?.name || 'Approver',
      actorRole: currentRole,
      actionType: 'APPROVE',
      module: 'LOANS',
      description: `Menyetujui pinjaman ${loan.employee_name} ke tingkat ${nextStatus}`,
      payload: { id, nextStatus }
    });

    return match;
  }

  // 4. Kasbon Operations
  public async getKasbons(tenantId: string): Promise<any[]> {
    return await this.payrollRepository.getKasbons(tenantId);
  }

  public async submitKasbon(data: any, tenantId: string, actor: any): Promise<any> {
    const payload = { ...data, status: 'PENDING' };
    const saved = await this.payrollRepository.saveKasbon(payload, tenantId);
    
    await this.payrollRepository.logAudit({
      tenantId,
      actorId: actor?.id || 'system',
      actorName: actor?.name || 'Karyawan',
      actorRole: actor?.role || 'STAFF',
      actionType: 'CREATE',
      module: 'KASBON',
      description: `Mengajukan kasbon darurat sebesar Rp ${Number(data.amount).toLocaleString('id-ID')}`,
      payload: data
    });

    return saved;
  }

  public async approveKasbon(id: string, tenantId: string, actor: any): Promise<any> {
    const saved = await this.payrollRepository.updateKasbonStatus(id, 'APPROVED', tenantId);

    await this.payrollRepository.logAudit({
      tenantId,
      actorId: actor?.id || 'system',
      actorName: actor?.name || 'Bendahara',
      actorRole: actor?.role || 'BENDAHARA',
      actionType: 'APPROVE',
      module: 'KASBON',
      description: `Bendahara menyetujui pencairan kasbon ID: ${id}`,
      payload: { id }
    });

    return saved;
  }

  // 5. THR Payout Distributions Events
  public async distributeThr(data: any, tenantId: string, actor: any): Promise<any> {
    const runs = await this.payrollRepository.getRuns(data.period, tenantId);
    const dbAny = DB as any;

    for (const run of runs) {
      let thrVal = 0;
      if (data.type === 'AUTOMATIC') {
        thrVal = Number(run.base_salary) * (data.multiplier || 1.0);
      } else if (data.type === 'PERCENTAGE') {
        thrVal = Number(run.base_salary) * ((data.multiplier || 100) / 100);
      } else {
        thrVal = Number(data.fixedValue || 1500000);
      }

      // Find match and update
      const rMatch = dbAny.payroll_runs.find((item: any) => item.id === run.id);
      if (rMatch) {
        rMatch.thr_payment = thrVal;
        rMatch.gross_earnings = Number(rMatch.gross_earnings) + thrVal;
        rMatch.net_salary = Number(rMatch.net_salary) + thrVal;
        rMatch.updated_at = new Date().toISOString();
      }
    }

    await this.payrollRepository.logAudit({
      tenantId,
      actorId: actor?.id || 'system',
      actorName: actor?.name || 'Staff Keuangan',
      actorRole: actor?.role || 'FINANCE_STAFF',
      actionType: 'CREATE',
      module: 'RUN_PAYROLL',
      description: `Mendistribusikan Tunjangan Hari Raya (THR) periode ${data.period} dengan metode ${data.type}`,
      payload: data
    });

    return { success: true, message: `THR berhasil didistribusikan untuk ${runs.length} karyawan!` };
  }

  // 6. Multi-level Approval Flow & Disbursement
  public async approvePayrollPeriod(period: string, stepRole: string, tenantId: string, actor: any): Promise<any> {
    const runs = await this.payrollRepository.getRuns(period, tenantId);
    let nextStatus = 'STAFF_DRAFT';

    if (stepRole === 'TU' || stepRole === 'KEPALA_TU') nextStatus = 'TU_APPROVED';
    else if (stepRole === 'TREASURER' || stepRole === 'BENDAHARA') nextStatus = 'BENDAHARA_APPROVED';
    else if (stepRole === 'PRINCIPAL' || stepRole === 'KEPALA_SEKOLAH') nextStatus = 'PRINCIPAL_APPROVED';
    else if (stepRole === 'YAYASAN' || stepRole === 'KETUA_YAYASAN') nextStatus = 'YAYASAN_APPROVED';
    else nextStatus = 'IN_APPROVAL';

    const dbAny = DB as any;
    for (const r of runs) {
      const match = dbAny.payroll_runs.find((item: any) => item.id === r.id);
      if (match) {
        match.approval_status = nextStatus;
        if (nextStatus === 'YAYASAN_APPROVED') {
          match.payment_status = 'PAID';
          match.paid_at = new Date().toISOString();

          // Subtract actual loan balances upon disbursement payout
          const activeLoan = dbAny.payroll_loans?.find((l: any) => l.employee_id === match.employee_id && l.payment_status === 'ACTIVE');
          if (activeLoan && Number(match.loan_deduction) > 0) {
            activeLoan.remaining_amount = Math.max(0, activeLoan.remaining_amount - Number(match.loan_deduction));
            if (activeLoan.remaining_amount <= 0) {
              activeLoan.payment_status = 'PAID_OFF';
            }
          }

          // Mark Kasbon advances settled from salary
          if (dbAny.payroll_kasbon && Number(match.kasbon_deduction) > 0) {
            dbAny.payroll_kasbon.forEach((k: any) => {
              if (k.employee_id === match.employee_id && k.status === 'APPROVED') {
                k.status = 'SETTLED_FROM_SALARY';
              }
            });
          }
        }
        match.updated_at = new Date().toISOString();
      }
    }

    if (nextStatus === 'YAYASAN_APPROVED') {
      let totalNetGaji = 0;
      for (const r of runs) {
        totalNetGaji += Number(r.net_salary || 0);
      }

      if (totalNetGaji > 0) {
        // Initialize arrays if they don't exist
        if (!dbAny.journalVouchers) dbAny.journalVouchers = [];
        if (!dbAny.journalDetails) dbAny.journalDetails = [];
        if (!dbAny.ledgerEntries) dbAny.ledgerEntries = [];
        if (!dbAny.cashTransactions) dbAny.cashTransactions = [];

        const jvId = `jv-${Date.now()}`;
        const jvNo = AutoNumberService.generateNextNumber(tenantId, 'PAYROLL');

        // 1. Create Journal Voucher
        dbAny.journalVouchers.push({
          id: jvId,
          tenant_id: tenantId,
          date: new Date().toISOString().split('T')[0],
          voucher_no: jvNo,
          description: `Auto Journal - Pembayaran Gaji & Honor Pegawai Periode ${period}`,
          is_recurring: false,
          status: 'POSTED',
          approved_by: actor?.name || 'system',
          created_at: new Date().toISOString()
        });

        // 2. Create Journal Details
        dbAny.journalDetails.push(
          { id: `jd-${Date.now()}-dr`, journal_voucher_id: jvId, tenant_id: tenantId, account_code: '51101', account_name: 'Beban Gaji & Honor Guru', debit: totalNetGaji, credit: 0 },
          { id: `jd-${Date.now()}-cr`, journal_voucher_id: jvId, tenant_id: tenantId, account_code: '11101', account_name: 'Kas Utama', debit: 0, credit: totalNetGaji }
        );

        // 3. Post to General Ledger
        dbAny.ledgerEntries.push(
          { id: `led-${Date.now()}-dr`, tenant_id: tenantId, date: new Date().toISOString().split('T')[0], account_code: '51101', account_name: 'Beban Gaji & Honor Guru', debit: totalNetGaji, credit: 0, description: `Pencatatan Beban Gaji & Honor Guru Periode ${period}`, created_at: new Date().toISOString(), created_by: actor?.name || 'system', updated_at: new Date().toISOString(), deleted_at: null, updated_by: actor?.name || 'system' },
          { id: `led-${Date.now()}-cr`, tenant_id: tenantId, date: new Date().toISOString().split('T')[0], account_code: '11101', account_name: 'Kas Utama', debit: 0, credit: totalNetGaji, description: `Pencatatan Pembayaran Gaji dari Kas Periode ${period}`, created_at: new Date().toISOString(), created_by: actor?.name || 'system', updated_at: new Date().toISOString(), deleted_at: null, updated_by: actor?.name || 'system' }
        );

        // 4. Record Cash outflow in Cash Book (BKU)
        dbAny.cashTransactions.push({
          id: `csh-${Date.now()}`,
          tenant_id: tenantId,
          date: new Date().toISOString().split('T')[0],
          type: 'OUT',
          amount: totalNetGaji,
          description: `Pembayaran Gaji & Honor Pegawai Periode ${period}`,
          category: 'GAJI',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null,
          created_by: actor?.name || 'system',
          updated_by: actor?.name || 'system'
        });
      }
    }

    await this.payrollRepository.logAudit({
      tenantId,
      actorId: actor?.id || 'system',
      actorName: actor?.name || 'User Approver',
      actorRole: stepRole,
      actionType: 'APPROVE',
      module: 'RUN_PAYROLL',
      description: `Menyetujui pencairan gaji periode ${period} di tingkat level ${stepRole}`,
      payload: { period, nextStatus }
    });

    return { success: true, nextStatus };
  }

  // Audit Logs
  public async getAuditLogs(tenantId: string): Promise<any[]> {
    return await this.payrollRepository.getAuditLogs(tenantId);
  }

  // Seed Default Masters
  private async seedDefaultMasters(tenantId: string): Promise<void> {
    const seeds = [
      {
        employeeId: 'emp-001',
        employeeName: 'Ahmad Baihaqi, S.Pd',
        role: 'GURU',
        baseSalary: 4500000,
        dailyAllowance: 25000,
        positionAllowance: 750000,
        familyAllowance: 500000,
        certificationAllowance: 1500000,
        functionalAllowance: 250000,
        pondokAllowance: 300000,
        bpjsAllowance: 150000,
        taxAllowance: 50000
      },
      {
        employeeId: 'emp-002',
        employeeName: 'Ustadz Hamzah',
        role: 'GURU',
        baseSalary: 4000000,
        dailyAllowance: 25000,
        positionAllowance: 500000,
        familyAllowance: 400000,
        certificationAllowance: 0,
        functionalAllowance: 200000,
        pondokAllowance: 1000000, // High pondok allowance
        bpjsAllowance: 120000,
        taxAllowance: 0
      },
      {
        employeeId: 'emp-003',
        employeeName: 'Nafsiah Wahyuni',
        role: 'PEGAWAI', // TU Staff
        baseSalary: 3200000,
        dailyAllowance: 20000,
        positionAllowance: 250000,
        familyAllowance: 0,
        certificationAllowance: 0,
        functionalAllowance: 100000,
        pondokAllowance: 0,
        bpjsAllowance: 100000,
        taxAllowance: 0
      }
    ];

    for (const seed of seeds) {
      await this.payrollRepository.saveMaster(seed, tenantId);
    }
  }
}
export default PayrollService;
