import { EmployeeSalaryMasterDTO, LoanApplicationDTO, KasbonApplicationDTO } from '../domain/dtos/payroll.dto';

export class PayrollValidator {
  public static validateSalaryMaster(data: EmployeeSalaryMasterDTO): { isValid: boolean; message?: string } {
    if (!data.employeeId || data.employeeId.trim() === '') {
      return { isValid: false, message: 'ID Karyawan wajib diisi.' };
    }
    if (!data.employeeName || data.employeeName.trim() === '') {
      return { isValid: false, message: 'Nama Karyawan wajib diisi.' };
    }
    if (data.baseSalary < 0) {
      return { isValid: false, message: 'Gaji pokok tidak boleh negatif.' };
    }
    if (data.dailyAllowance < 0 || data.positionAllowance < 0 || data.familyAllowance < 0) {
      return { isValid: false, message: 'Tunjangan tidak boleh bernilai negatif.' };
    }
    return { isValid: true };
  }

  public static validateLoanApplication(data: LoanApplicationDTO): { isValid: boolean; message?: string } {
    if (!data.employeeId || data.employeeId.trim() === '') {
      return { isValid: false, message: 'ID Karyawan wajib diisi.' };
    }
    if (data.amount <= 0) {
      return { isValid: false, message: 'Jumlah pinjaman wajib lebih besar dari 0.' };
    }
    if (data.tenor <= 0) {
      return { isValid: false, message: 'Tenor pinjaman wajib minimal 1 bulan.' };
    }
    if (data.monthlyInstallment <= 0) {
      return { isValid: false, message: 'Angsuran bulanan tidak valid.' };
    }
    if (!data.reason || data.reason.trim() === '') {
      return { isValid: false, message: 'Alasan pinjaman wajib diisi.' };
    }
    return { isValid: true };
  }

  public static validateKasbonApplication(data: KasbonApplicationDTO): { isValid: boolean; message?: string } {
    if (!data.employeeId || data.employeeId.trim() === '') {
      return { isValid: false, message: 'ID Karyawan wajib diisi.' };
    }
    if (data.amount <= 0) {
      return { isValid: false, message: 'Jumlah kasbon wajib lebih besar dari 0.' };
    }
    if (data.amount > 2000000) {
      return { isValid: false, message: 'Jumlah kasbon darurat maksimal adalah Rp 2.000.000.' };
    }
    if (!data.reason || data.reason.trim() === '') {
      return { isValid: false, message: 'Alasan kasbon wajib diisi.' };
    }
    return { isValid: true };
  }
}
