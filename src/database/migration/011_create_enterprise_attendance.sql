-- MIGRATION: 011_CREATE_ENTERPRISE_ATTENDANCE
-- MODULE: ENTERPRISE ATTENDANCE MANAGEMENT
-- TYPE: postgresql / mysql compatible

-- 1. Create table for attendance rules & payroll deductions configuration
CREATE TABLE IF NOT EXISTS attendance_rules (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    late_grace_period INT DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- 2. Create sub-table for late bracket penalties
CREATE TABLE IF NOT EXISTS attendance_penalty_brackets (
    id VARCHAR(50) PRIMARY KEY,
    rule_id VARCHAR(50) NOT NULL,
    min_range INT NOT NULL, -- in minutes (e.g. 0)
    max_range INT NOT NULL, -- in minutes (e.g. 5)
    deduction_type VARCHAR(20) NOT NULL, -- PERCENTAGE, NOMINAL, PER_MINUTE, PER_HOUR, PER_DAY
    deduction_value DECIMAL(12, 2) NOT NULL,
    FOREIGN KEY (rule_id) REFERENCES attendance_rules(id) ON DELETE CASCADE
);

-- 3. Create table for replacement teachers tracker
CREATE TABLE IF NOT EXISTS replacement_teachers (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    original_teacher_id VARCHAR(50) NOT NULL,
    substitute_teacher_id VARCHAR(50) NOT NULL,
    course_id VARCHAR(50) NOT NULL,
    classroom_id VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    honor_calculated DECIMAL(12, 2) NOT NULL,
    deduction_calculated DECIMAL(12, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, APPROVED, PAID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- 4. Create table for GPS multi-location geofences
CREATE TABLE IF NOT EXISTS attendance_geofences (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    location_name VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    radius INT NOT NULL, -- in meters
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- 5. Extend main attendance table to support extra methods and GPS coordinates
-- ALTER TABLE attendances ADD COLUMN IF NOT EXISTS person_id VARCHAR(50);
-- ALTER TABLE attendances ADD COLUMN IF NOT EXISTS person_role VARCHAR(20);
-- ALTER TABLE attendances ADD COLUMN IF NOT EXISTS method VARCHAR(30);
-- ALTER TABLE attendances ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
-- ALTER TABLE attendances ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
-- ALTER TABLE attendances ADD COLUMN IF NOT EXISTS qr_token_used VARCHAR(255);
-- ALTER TABLE attendances ADD COLUMN IF NOT EXISTS is_offline BOOLEAN DEFAULT FALSE;
