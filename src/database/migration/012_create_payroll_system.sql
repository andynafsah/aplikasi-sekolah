-- MIGRATION: 012_CREATE_PAYROLL_SYSTEM
-- MODULE: PAYROLL & HUMAN RESOURCE MANAGEMENT
-- TYPE: postgresql / mysql compatible

-- 1. Create table for payroll masters (salary specs for teachers & employees)
CREATE TABLE IF NOT EXISTS payroll_masters (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    employee_id VARCHAR(50) NOT NULL UNIQUE,
    employee_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL, -- GURU, PEGAWAI
    base_salary DECIMAL(12, 2) DEFAULT 0.00,
    daily_allowance DECIMAL(12, 2) DEFAULT 0.00,
    position_allowance DECIMAL(12, 2) DEFAULT 0.00,
    family_allowance DECIMAL(12, 2) DEFAULT 0.00,
    certification_allowance DECIMAL(12, 2) DEFAULT 0.00,
    functional_allowance DECIMAL(12, 2) DEFAULT 0.00,
    pondok_allowance DECIMAL(12, 2) DEFAULT 0.00,
    bpjs_subsidy DECIMAL(12, 2) DEFAULT 0.00,
    tax_subsidy DECIMAL(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- 2. Create table for payroll runs (calculated payslip for a period)
CREATE TABLE IF NOT EXISTS payroll_runs (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    payroll_period VARCHAR(20) NOT NULL, -- e.g. "2025-07"
    employee_id VARCHAR(50) NOT NULL,
    employee_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL,
    
    -- Earning Details
    base_salary DECIMAL(12, 2) DEFAULT 0.00,
    teaching_hours INT DEFAULT 0,
    teaching_honor DECIMAL(12, 2) DEFAULT 0.00,
    substitute_honor DECIMAL(12, 2) DEFAULT 0.00,
    overtime_hours INT DEFAULT 0,
    overtime_honor DECIMAL(12, 2) DEFAULT 0.00,
    
    -- Allowances
    position_allowance DECIMAL(12, 2) DEFAULT 0.00,
    transport_allowance DECIMAL(12, 2) DEFAULT 0.00,
    makan_allowance DECIMAL(12, 2) DEFAULT 0.00,
    family_allowance DECIMAL(12, 2) DEFAULT 0.00,
    certification_allowance DECIMAL(12, 2) DEFAULT 0.00,
    functional_allowance DECIMAL(12, 2) DEFAULT 0.00,
    pondok_allowance DECIMAL(12, 2) DEFAULT 0.00,
    custom_allowance DECIMAL(12, 2) DEFAULT 0.00,
    
    -- Deductions
    late_deduction DECIMAL(12, 2) DEFAULT 0.00,
    alfa_deduction DECIMAL(12, 2) DEFAULT 0.00,
    leave_deduction DECIMAL(12, 2) DEFAULT 0.00,
    loan_deduction DECIMAL(12, 2) DEFAULT 0.00,
    kasbon_deduction DECIMAL(12, 2) DEFAULT 0.00,
    bpjs_deduction DECIMAL(12, 2) DEFAULT 0.00,
    tax_pph21 DECIMAL(12, 2) DEFAULT 0.00,
    yayasan_deduction DECIMAL(12, 2) DEFAULT 0.00,
    custom_deduction DECIMAL(12, 2) DEFAULT 0.00,
    
    -- Bonus & THR
    thr_payment DECIMAL(12, 2) DEFAULT 0.00,
    annual_bonus DECIMAL(12, 2) DEFAULT 0.00,
    
    -- Net Totals
    gross_earnings DECIMAL(12, 2) DEFAULT 0.00,
    total_deductions DECIMAL(12, 2) DEFAULT 0.00,
    net_salary DECIMAL(12, 2) DEFAULT 0.00,
    
    -- Flow State
    approval_status VARCHAR(30) DEFAULT 'STAFF_DRAFT', -- STAFF_DRAFT, IN_APPROVAL, TU_APPROVED, BENDARARA_APPROVED, PRINCIPAL_APPROVED, YAYASAN_APPROVED
    payment_status VARCHAR(20) DEFAULT 'UNPAID', -- UNPAID, PAID
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- 3. Create table for payroll loans
CREATE TABLE IF NOT EXISTS payroll_loans (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    employee_id VARCHAR(50) NOT NULL,
    employee_name VARCHAR(100) NOT NULL,
    loan_amount DECIMAL(12, 2) NOT NULL,
    tenor_months INT NOT NULL,
    monthly_installment DECIMAL(12, 2) NOT NULL,
    remaining_amount DECIMAL(12, 2) NOT NULL,
    reason TEXT,
    approval_status VARCHAR(30) DEFAULT 'PENDING', -- PENDING, APPROVED_STAFF, APPROVED_TU, APPROVED_TREASURER, APPROVED_PRINCIPAL, APPROVED_YAYASAN, REJECTED
    payment_status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, PAID_OFF
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- 4. Create table for payroll kasbon (immediate short term advance)
CREATE TABLE IF NOT EXISTS payroll_kasbon (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    employee_id VARCHAR(50) NOT NULL,
    employee_name VARCHAR(100) NOT NULL,
    kasbon_amount DECIMAL(12, 2) NOT NULL,
    reason TEXT,
    status VARCHAR(30) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED, PAID_OUT, SETTLED_FROM_SALARY
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- 5. Create table for payroll audit logs
CREATE TABLE IF NOT EXISTS payroll_audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    actor_id VARCHAR(50) NOT NULL,
    actor_name VARCHAR(100) NOT NULL,
    actor_role VARCHAR(50) NOT NULL,
    action_type VARCHAR(20) NOT NULL, -- CREATE, UPDATE, APPROVE, DISBURSE, EXPORT
    module VARCHAR(50) NOT NULL, -- MASTER_SALARY, RUN_PAYROLL, LOANS, KASBON, CONFIG
    description TEXT NOT NULL,
    payload TEXT, -- JSON snapshot string
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
