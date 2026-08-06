export interface PayrollPeriodDTO {
  id?: string;
  month: number; // 1-12
  year: number;
  status: 'DRAFT' | 'IN_APPROVAL' | 'APPROVED' | 'PAID';
  createdBy: string;
}

export interface EmployeeSalaryMasterDTO {
  employeeId: string;
  employeeName: string;
  role: 'GURU' | 'PEGAWAI';
  baseSalary: number; // Gaji Pokok
  dailyAllowance: number; // Tunjangan harian (Makan/Transport)
  positionAllowance: number; // Tunjangan Jabatan
  familyAllowance: number; // Tunjangan Keluarga
  certificationAllowance: number; // Tunjangan Sertifikasi
  functionalAllowance: number; // Tunjangan Fungsional
  pondokAllowance: number; // Tunjangan Pondok (Pesantren)
  bpjsAllowance: number; // Subsidi BPJS
  taxAllowance: number; // Tunjangan Pajak
}

export interface LoanApplicationDTO {
  id?: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  tenor: number; // number of months
  monthlyInstallment: number;
  reason: string;
  status?: 'PENDING' | 'APPROVED_STAFF' | 'APPROVED_TU' | 'APPROVED_TREASURER' | 'APPROVED_PRINCIPAL' | 'APPROVED_YAYASAN' | 'REJECTED';
}

export interface KasbonApplicationDTO {
  id?: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  reason: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID_OUT' | 'SETTLED_FROM_SALARY';
}

export interface ThrDistributionDTO {
  id?: string;
  type: 'AUTOMATIC' | 'PERCENTAGE' | 'NOMINAL';
  multiplier: number; // e.g. 1.0 (1x month basic) or 1.5
  fixedValue?: number;
  status?: 'DRAFT' | 'DISTRIBUTED';
}
