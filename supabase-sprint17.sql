-- Supabase PostgreSQL Migration for ERP SaaS Multi-Tenant (Sprint 17 - Enterprise PPDB Online & Admission Management)

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ADMISSION SETTINGS
CREATE TABLE IF NOT EXISTS admission_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    auto_generate_student_id BOOLEAN DEFAULT FALSE NOT NULL,
    student_id_format VARCHAR(100) DEFAULT 'YYYY[UNIT][SEQ]' NOT NULL,
    require_all_documents BOOLEAN DEFAULT TRUE NOT NULL,
    form_fee NUMERIC DEFAULT 0 CHECK (form_fee >= 0) NOT NULL,
    re_registration_fee NUMERIC DEFAULT 0 CHECK (re_registration_fee >= 0) NOT NULL,
    announcement_status VARCHAR(50) DEFAULT 'CLOSED' CHECK (announcement_status IN ('OPENED', 'CLOSED', 'SCHEDULED')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);

-- Index for Tenant Setting
CREATE INDEX IF NOT EXISTS idx_adm_settings_tenant ON admission_settings(tenant_id) WHERE deleted_at IS NULL;

-- 2. ADMISSION PERIODS
CREATE TABLE IF NOT EXISTS admission_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL, -- e.g., "TP 2026/2027"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'INACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'ARCHIVED')) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    CONSTRAINT chk_period_dates CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_adm_periods_tenant ON admission_periods(tenant_id) WHERE deleted_at IS NULL;

-- 3. ADMISSION WAVES
CREATE TABLE IF NOT EXISTS admission_waves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    period_id UUID NOT NULL REFERENCES admission_periods(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- Gelombang 1, Gelombang 2, Gelombang 3, Jalur Prestasi, Jalur Reguler, Jalur Beasiswa
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'INACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'CLOSED')) NOT NULL,
    quota INTEGER CHECK (quota >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    CONSTRAINT chk_wave_dates CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_adm_waves_tenant ON admission_waves(tenant_id) WHERE deleted_at IS NULL;

-- 4. ADMISSION PROGRAMS
CREATE TABLE IF NOT EXISTS admission_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL, -- TK, SD, SMP, SMA, SMK, PKBM, Pesantren
    code VARCHAR(50) NOT NULL, -- e.g., "TK", "SD", "SMP", "SMA", "SMK"
    status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')) NOT NULL,
    quota INTEGER CHECK (quota >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    CONSTRAINT uq_tenant_program_code UNIQUE (tenant_id, code)
);

CREATE INDEX IF NOT EXISTS idx_adm_programs_tenant ON admission_programs(tenant_id) WHERE deleted_at IS NULL;

-- 5. ADMISSION FORM TEMPLATES
CREATE TABLE IF NOT EXISTS admission_form_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    program_id UUID REFERENCES admission_programs(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_adm_templates_tenant ON admission_form_templates(tenant_id) WHERE deleted_at IS NULL;

-- 6. ADMISSION FORM FIELDS
CREATE TABLE IF NOT EXISTS admission_form_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    template_id UUID NOT NULL REFERENCES admission_form_templates(id) ON DELETE CASCADE,
    field_name VARCHAR(100) NOT NULL, -- internal identifier
    label VARCHAR(150) NOT NULL, -- label shown to user
    field_type VARCHAR(50) DEFAULT 'TEXT' CHECK (field_type IN ('TEXT', 'NUMBER', 'DATE', 'SELECT', 'TEXTAREA', 'CHECKBOX', 'RADIO')) NOT NULL,
    required BOOLEAN DEFAULT TRUE NOT NULL,
    options JSONB, -- for select, checkbox, radio e.g., ["L", "P"]
    placeholder VARCHAR(200),
    order_index INTEGER DEFAULT 0 NOT NULL,
    is_conditional BOOLEAN DEFAULT FALSE NOT NULL,
    condition_rule JSONB, -- e.g., { "depends_on": "has_achievement", "value": "true" }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_adm_fields_template ON admission_form_fields(template_id) WHERE deleted_at IS NULL;

-- 7. ADMISSION REQUIREMENTS
CREATE TABLE IF NOT EXISTS admission_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    program_id UUID REFERENCES admission_programs(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL, -- KTP Orang Tua, KK, Akta Lahir, Ijazah, Rapor, Pas Foto, Surat Kesehatan, Sertifikat
    code VARCHAR(50) NOT NULL,
    required BOOLEAN DEFAULT TRUE NOT NULL,
    allowed_types JSONB NOT NULL DEFAULT '["pdf", "jpg", "png"]'::jsonb, -- e.g., ["pdf", "jpg", "png", "docx"]
    max_size_kb INTEGER DEFAULT 2048 CHECK (max_size_kb > 0) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_adm_reqs_program ON admission_requirements(program_id) WHERE deleted_at IS NULL;

-- 8. ADMISSION APPLICATIONS
CREATE TABLE IF NOT EXISTS admission_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    period_id UUID NOT NULL REFERENCES admission_periods(id),
    wave_id UUID NOT NULL REFERENCES admission_waves(id),
    program_id UUID NOT NULL REFERENCES admission_programs(id),
    registration_number VARCHAR(100) UNIQUE NOT NULL, -- generated format e.g., PPDB/2026/00001
    full_name VARCHAR(255) NOT NULL,
    nickname VARCHAR(100),
    gender VARCHAR(10) CHECK (gender IN ('L', 'P')) NOT NULL,
    birth_place VARCHAR(150) NOT NULL,
    birth_date DATE NOT NULL,
    nisn VARCHAR(50),
    nik VARCHAR(50) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(150),
    previous_school VARCHAR(200),
    status VARCHAR(50) DEFAULT 'SUBMITTED' CHECK (status IN ('DRAFT', 'SUBMITTED', 'VERIFIED', 'REJECTED', 'EXAM_COMPLETED', 'INTERVIEW_COMPLETED', 'PASSED', 'RE_REGISTERED', 'WAITING_LIST')) NOT NULL,
    custom_form_values JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_adm_apps_tenant ON admission_applications(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_adm_apps_status ON admission_applications(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_adm_apps_reg_num ON admission_applications(registration_number);

-- 9. ADMISSION GUARDIANS
CREATE TABLE IF NOT EXISTS admission_guardians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    application_id UUID NOT NULL REFERENCES admission_applications(id) ON DELETE CASCADE,
    father_name VARCHAR(255) NOT NULL,
    father_nik VARCHAR(50),
    father_education VARCHAR(100),
    father_occupation VARCHAR(100),
    father_income VARCHAR(100),
    mother_name VARCHAR(255) NOT NULL,
    mother_nik VARCHAR(50),
    mother_education VARCHAR(100),
    mother_occupation VARCHAR(100),
    mother_income VARCHAR(100),
    guardian_name VARCHAR(255),
    guardian_phone VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_adm_guardians_app ON admission_guardians(application_id) WHERE deleted_at IS NULL;

-- 10. ADMISSION ADDRESSES
CREATE TABLE IF NOT EXISTS admission_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    application_id UUID NOT NULL REFERENCES admission_applications(id) ON DELETE CASCADE,
    province VARCHAR(100) NOT NULL,
    regency VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    village VARCHAR(100) NOT NULL,
    rt_rw VARCHAR(20),
    address_line TEXT NOT NULL,
    postal_code VARCHAR(10),
    distance_km NUMERIC CHECK (distance_km >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_adm_addresses_app ON admission_addresses(application_id) WHERE deleted_at IS NULL;

-- 11. ADMISSION DOCUMENTS
CREATE TABLE IF NOT EXISTS admission_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    application_id UUID NOT NULL REFERENCES admission_applications(id) ON DELETE CASCADE,
    requirement_id UUID REFERENCES admission_requirements(id),
    name VARCHAR(150) NOT NULL, -- e.g., "KTP Ayah.pdf"
    file_url TEXT NOT NULL,
    file_size_kb INTEGER,
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')) NOT NULL,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_adm_docs_app ON admission_documents(application_id) WHERE deleted_at IS NULL;

-- 12. ADMISSION VERIFICATIONS
CREATE TABLE IF NOT EXISTS admission_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    application_id UUID NOT NULL REFERENCES admission_applications(id) ON DELETE CASCADE,
    verified_by VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'APPROVED' CHECK (status IN ('APPROVED', 'REJECTED')) NOT NULL,
    notes TEXT,
    verification_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_adm_verif_app ON admission_verifications(application_id) WHERE deleted_at IS NULL;

-- 13. ADMISSION EXAM SCHEDULES
CREATE TABLE IF NOT EXISTS admission_exam_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    wave_id UUID NOT NULL REFERENCES admission_waves(id),
    subject_name VARCHAR(150) NOT NULL, -- e.g., "Matematika", "Tes Potensi Akademik"
    exam_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room_name VARCHAR(100) NOT NULL,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_adm_examsched_wave ON admission_exam_schedules(wave_id) WHERE deleted_at IS NULL;

-- 14. ADMISSION EXAM RESULTS
CREATE TABLE IF NOT EXISTS admission_exam_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    application_id UUID NOT NULL REFERENCES admission_applications(id) ON DELETE CASCADE,
    schedule_id UUID REFERENCES admission_exam_schedules(id) ON DELETE SET NULL,
    subject_name VARCHAR(150) NOT NULL,
    score NUMERIC CHECK (score >= 0 AND score <= 100) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_adm_examres_app ON admission_exam_results(application_id) WHERE deleted_at IS NULL;

-- 15. ADMISSION INTERVIEWS
CREATE TABLE IF NOT EXISTS admission_interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    application_id UUID NOT NULL REFERENCES admission_applications(id) ON DELETE CASCADE,
    interviewer_name VARCHAR(200) NOT NULL,
    interview_date DATE NOT NULL,
    score NUMERIC CHECK (score >= 0 AND score <= 100) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_adm_interviews_app ON admission_interviews(application_id) WHERE deleted_at IS NULL;

-- 16. ADMISSION MEDICAL CHECKS
CREATE TABLE IF NOT EXISTS admission_medical_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    application_id UUID NOT NULL REFERENCES admission_applications(id) ON DELETE CASCADE,
    doctor_name VARCHAR(200),
    check_date DATE NOT NULL,
    blood_type VARCHAR(5),
    height_cm INTEGER CHECK (height_cm > 0),
    weight_kg INTEGER CHECK (weight_kg > 0),
    color_blindness BOOLEAN DEFAULT FALSE NOT NULL,
    score NUMERIC CHECK (score >= 0 AND score <= 100) NOT NULL, -- general health assessment
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_adm_medical_app ON admission_medical_checks(application_id) WHERE deleted_at IS NULL;

-- 17. ADMISSION TAHFIDZ TESTS
CREATE TABLE IF NOT EXISTS admission_tahfidz_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    application_id UUID NOT NULL REFERENCES admission_applications(id) ON DELETE CASCADE,
    tester_name VARCHAR(200) NOT NULL,
    test_date DATE NOT NULL,
    juz_memorized INTEGER DEFAULT 0 CHECK (juz_memorized >= 0 AND juz_memorized <= 30) NOT NULL,
    fluency_score NUMERIC CHECK (fluency_score >= 0 AND fluency_score <= 100) NOT NULL, -- Kelancaran
    tajweed_score NUMERIC CHECK (tajweed_score >= 0 AND tajweed_score <= 100) NOT NULL, -- Tajwid
    score NUMERIC CHECK (score >= 0 AND score <= 100) NOT NULL, -- Overall Tahfidz Score
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_adm_tahfidz_app ON admission_tahfidz_tests(application_id) WHERE deleted_at IS NULL;

-- 18. ADMISSION SCORES
CREATE TABLE IF NOT EXISTS admission_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    application_id UUID NOT NULL REFERENCES admission_applications(id) ON DELETE CASCADE,
    academic_score NUMERIC DEFAULT 0 CHECK (academic_score >= 0 AND academic_score <= 100) NOT NULL,
    interview_score NUMERIC DEFAULT 0 CHECK (interview_score >= 0 AND interview_score <= 100) NOT NULL,
    medical_score NUMERIC DEFAULT 0 CHECK (medical_score >= 0 AND medical_score <= 100) NOT NULL,
    tahfidz_score NUMERIC DEFAULT 0 CHECK (tahfidz_score >= 0 AND tahfidz_score <= 100) NOT NULL,
    distance_score NUMERIC DEFAULT 0 CHECK (distance_score >= 0 AND distance_score <= 100) NOT NULL,
    overall_score NUMERIC DEFAULT 0 CHECK (overall_score >= 0 AND overall_score <= 100) NOT NULL, -- Weighted sum
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_adm_scores_app ON admission_scores(application_id) WHERE deleted_at IS NULL;

-- 19. ADMISSION RANKINGS
CREATE TABLE IF NOT EXISTS admission_rankings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    period_id UUID NOT NULL REFERENCES admission_periods(id) ON DELETE CASCADE,
    wave_id UUID NOT NULL REFERENCES admission_waves(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES admission_programs(id) ON DELETE CASCADE,
    application_id UUID NOT NULL REFERENCES admission_applications(id) ON DELETE CASCADE,
    rank_index INTEGER NOT NULL CHECK (rank_index > 0),
    overall_score NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    CONSTRAINT uq_rank_application UNIQUE (application_id)
);

CREATE INDEX IF NOT EXISTS idx_adm_rankings_group ON admission_rankings(period_id, wave_id, program_id);

-- 20. ADMISSION RESULTS
CREATE TABLE IF NOT EXISTS admission_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    application_id UUID NOT NULL REFERENCES admission_applications(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'Lulus' CHECK (status IN ('Lulus', 'Cadangan', 'Tidak Lulus')) NOT NULL,
    announcement_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_adm_results_app ON admission_results(application_id) WHERE deleted_at IS NULL;

-- 21. ADMISSION WAITING LISTS
CREATE TABLE IF NOT EXISTS admission_waiting_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    application_id UUID NOT NULL REFERENCES admission_applications(id) ON DELETE CASCADE,
    priority_index INTEGER NOT NULL CHECK (priority_index > 0),
    status VARCHAR(50) DEFAULT 'WAITING' CHECK (status IN ('WAITING', 'CALLED', 'EXPIRED')) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_adm_waitlist_app ON admission_waiting_lists(application_id) WHERE deleted_at IS NULL;

-- 22. ADMISSION RE-REGISTRATIONS
CREATE TABLE IF NOT EXISTS admission_re_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    application_id UUID NOT NULL REFERENCES admission_applications(id) ON DELETE CASCADE,
    re_registration_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'PAID' CHECK (payment_status IN ('UNPAID', 'PENDING', 'PAID')) NOT NULL,
    verified_by VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_adm_rereg_app ON admission_re_registrations(application_id) WHERE deleted_at IS NULL;

-- 23. ADMISSION STUDENT GENERATIONS
CREATE TABLE IF NOT EXISTS admission_student_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    application_id UUID NOT NULL REFERENCES admission_applications(id) ON DELETE CASCADE,
    student_id VARCHAR(100) NOT NULL, -- generated student registration NIM/NIS
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_adm_stugen_app ON admission_student_generations(application_id) WHERE deleted_at IS NULL;

-- 24. ADMISSION PAYMENT LINKS
CREATE TABLE IF NOT EXISTS admission_payment_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    application_id UUID NOT NULL REFERENCES admission_applications(id) ON DELETE CASCADE,
    payment_type VARCHAR(50) CHECK (payment_type IN ('Formulir', 'Daftar Ulang', 'Uang Pangkal', 'SPP')) NOT NULL,
    amount NUMERIC CHECK (amount >= 0) NOT NULL,
    payment_gateway_url VARCHAR(255) NOT NULL,
    va_number VARCHAR(100),
    status VARCHAR(50) DEFAULT 'UNPAID' CHECK (status IN ('UNPAID', 'PENDING', 'PAID', 'EXPIRED')) NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_adm_paylinks_app ON admission_payment_links(application_id) WHERE deleted_at IS NULL;
