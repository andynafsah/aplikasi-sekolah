-- ============================================================================
-- SPRINT 29: ENTERPRISE MASTER DATA ENGINE SQL SCHEMA FOR SUPABASE
-- TARGET: Siswa, Santri, Guru, Pegawai, SDM, DAPODIK, EMIS, Akreditasi, Audit
-- ============================================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. DOCUMENT CATEGORIES
CREATE TABLE master_document_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_by UUID
);

-- 2. MASTER SETTINGS
CREATE TABLE master_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL UNIQUE,
    dapodik_sync_enabled BOOLEAN DEFAULT TRUE,
    emis_sync_enabled BOOLEAN DEFAULT TRUE,
    auto_generate_numbers BOOLEAN DEFAULT TRUE,
    audit_trail_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_by UUID
);

-- 3. MASTER PEOPLE (Base Table for shared demographic data)
CREATE TABLE master_people (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    nik VARCHAR(16) UNIQUE,
    gender CHAR(1) CHECK (gender IN ('L', 'P')),
    place_of_birth VARCHAR(100),
    date_of_birth DATE,
    religion VARCHAR(50),
    email VARCHAR(150),
    phone VARCHAR(50),
    blood_type VARCHAR(5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_by UUID
);

-- 4. MASTER ADDRESSES
CREATE TABLE master_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    person_id UUID REFERENCES master_people(id) ON DELETE CASCADE,
    address_line TEXT,
    dusun VARCHAR(100),
    rt VARCHAR(10),
    rw VARCHAR(10),
    desa VARCHAR(100),
    kecamatan VARCHAR(100),
    kabupaten VARCHAR(100),
    provinsi VARCHAR(100),
    postal_code VARCHAR(10),
    latitude NUMERIC,
    longitude NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_by UUID
);

-- 5. MASTER STUDENT STATUSES
CREATE TABLE master_student_statuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_by UUID
);

-- 6. MASTER STUDENTS (DAPODIK & EMIS COMPLIANT)
CREATE TABLE master_students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    person_id UUID UNIQUE REFERENCES master_people(id) ON DELETE CASCADE,
    nis VARCHAR(50) UNIQUE NOT NULL,
    nisn CHAR(10) UNIQUE,
    school_origin VARCHAR(255),
    entry_date DATE,
    grade_level VARCHAR(50),
    classroom_name VARCHAR(100),
    major_specialization VARCHAR(100),
    registration_type VARCHAR(100),
    exam_participant_number VARCHAR(100),
    certificate_serial_number VARCHAR(100),
    status_id UUID REFERENCES master_student_statuses(id),
    kip_recipient BOOLEAN DEFAULT FALSE,
    kip_number VARCHAR(50),
    pkh_recipient BOOLEAN DEFAULT FALSE,
    pkh_number VARCHAR(50),
    kks_recipient BOOLEAN DEFAULT FALSE,
    kks_number VARCHAR(50),
    height NUMERIC,
    weight NUMERIC,
    head_circumference NUMERIC,
    transportation_mode VARCHAR(100),
    distance_to_school VARCHAR(100),
    living_arrangement VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_by UUID
);

-- 7. MASTER SANTRI (BOARDING & TAHFIDZ DATA)
CREATE TABLE master_santri (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    student_id UUID UNIQUE REFERENCES master_students(id) ON DELETE CASCADE,
    boarding_room_number VARCHAR(50),
    juz_memorized INTEGER DEFAULT 0,
    tahfidz_status VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_by UUID
);

-- 8. MASTER EMPLOYEE STATUSES
CREATE TABLE master_employee_statuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_by UUID
);

-- 9. MASTER TEACHERS (GTK DAPODIK COMPLIANT)
CREATE TABLE master_teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    person_id UUID UNIQUE REFERENCES master_people(id) ON DELETE CASCADE,
    nip VARCHAR(50) UNIQUE,
    niy VARCHAR(50) UNIQUE,
    nuptk CHAR(16) UNIQUE,
    nrg VARCHAR(50),
    npwp VARCHAR(50),
    bpjs VARCHAR(50),
    asn_status VARCHAR(50),
    gty_status BOOLEAN DEFAULT FALSE,
    gtty_status BOOLEAN DEFAULT FALSE,
    highest_education VARCHAR(100),
    certification_status VARCHAR(100),
    teaching_history TEXT,
    basic_salary NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_by UUID
);

-- 10. MASTER EMPLOYEES (Staff/Administration)
CREATE TABLE master_employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    person_id UUID UNIQUE REFERENCES master_people(id) ON DELETE CASCADE,
    employee_number VARCHAR(50) UNIQUE,
    role_description VARCHAR(255),
    status_id UUID REFERENCES master_employee_statuses(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_by UUID
);

-- 11. MASTER GUARDIANS
CREATE TABLE master_guardians (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    student_id UUID REFERENCES master_students(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    nik CHAR(16),
    relationship VARCHAR(50),
    occupation VARCHAR(100),
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_by UUID
);

-- 12. MASTER FAMILY MEMBERS
CREATE TABLE master_family_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    person_id UUID REFERENCES master_people(id) ON DELETE CASCADE,
    family_card_number VARCHAR(50) NOT NULL,
    father_name VARCHAR(255),
    mother_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_by UUID
);

-- 13. MASTER IDENTITY CARDS
CREATE TABLE master_identity_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    person_id UUID REFERENCES master_people(id) ON DELETE CASCADE,
    card_number VARCHAR(50) UNIQUE NOT NULL,
    expiry_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_by UUID
);

-- 14. MASTER BIRTH CERTIFICATES
CREATE TABLE master_birth_certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    person_id UUID REFERENCES master_people(id) ON DELETE CASCADE,
    certificate_number VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_by UUID
);

-- 15. MASTER FAMILY CARDS
CREATE TABLE master_family_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    family_card_number VARCHAR(50) UNIQUE NOT NULL,
    head_of_family VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_by UUID
);

-- 16. MASTER PASSPORTS
CREATE TABLE master_passports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    person_id UUID REFERENCES master_people(id) ON DELETE CASCADE,
    passport_number VARCHAR(50) UNIQUE NOT NULL,
    country_of_issue VARCHAR(100) NOT NULL,
    expiry_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_by UUID
);

-- 17. MASTER STUDENT DOCUMENTS
CREATE TABLE master_student_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    student_id UUID REFERENCES master_students(id) ON DELETE CASCADE,
    category_id UUID REFERENCES master_document_categories(id),
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_by UUID
);

-- 18. MASTER EMPLOYEE DOCUMENTS
CREATE TABLE master_employee_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    employee_id UUID REFERENCES master_employees(id) ON DELETE CASCADE,
    category_id UUID REFERENCES master_document_categories(id),
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_by UUID
);

-- 19. MASTER DOCUMENT VERSIONS
CREATE TABLE master_document_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    document_id UUID NOT NULL, -- references either student_document or employee_document
    version_number INTEGER NOT NULL,
    file_url TEXT NOT NULL,
    hash_sha256 CHAR(64) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID
);

-- 20. MASTER DOCUMENT DOWNLOADS (AUDIT TRAIL)
CREATE TABLE master_document_downloads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    document_id UUID NOT NULL,
    user_id UUID NOT NULL,
    ip_address VARCHAR(45),
    downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 21. MASTER DOCUMENT UPLOAD LOGS
CREATE TABLE master_document_upload_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    document_id UUID NOT NULL,
    action_type VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 22. MASTER PHOTOS
CREATE TABLE master_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    person_id UUID UNIQUE REFERENCES master_people(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_by UUID
);

-- 23. MASTER PHOTO VERSIONS
CREATE TABLE master_photo_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    photo_id UUID REFERENCES master_photos(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    photo_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 24. MASTER BARCODES
CREATE TABLE master_barcodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    person_id UUID UNIQUE REFERENCES master_people(id) ON DELETE CASCADE,
    barcode_value VARCHAR(100) UNIQUE NOT NULL,
    purpose VARCHAR(100), -- Absensi, Perpustakaan, CBT, LMS
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 25. MASTER QR CODES
CREATE TABLE master_qrcodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    person_id UUID UNIQUE REFERENCES master_people(id) ON DELETE CASCADE,
    qrcode_value VARCHAR(255) UNIQUE NOT NULL,
    purpose VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 26. MASTER NUMBER SEQUENCES
CREATE TABLE master_number_sequences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    sequence_type VARCHAR(50) UNIQUE NOT NULL, -- NIS, NIP, NIY
    current_value INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 27. MASTER NUMBER TEMPLATES
CREATE TABLE master_number_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    sequence_type VARCHAR(50) UNIQUE NOT NULL,
    prefix_pattern VARCHAR(50) NOT NULL, -- [YEAR][SEQ]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 28. MASTER NUMBER HISTORIES
CREATE TABLE master_number_histories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    sequence_type VARCHAR(50) NOT NULL,
    generated_number VARCHAR(100) NOT NULL,
    allocated_to UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 29. MASTER IMPORT JOBS
CREATE TABLE master_import_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    format_type VARCHAR(50) NOT NULL, -- DAPODIK, EMIS, CSV, EXCEL
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, PROCESSING, COMPLETED, FAILED
    records_processed INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 30. MASTER EXPORT JOBS
CREATE TABLE master_export_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    format_type VARCHAR(50) NOT NULL, -- EXCEL, CSV, PDF, WORD
    file_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 31. MASTER DUPLICATE LOGS
CREATE TABLE master_duplicate_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    field_name VARCHAR(50) NOT NULL, -- NIK, NISN, NUPTK
    duplicate_value VARCHAR(255) NOT NULL,
    record_ids UUID[] NOT NULL,
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 32. MASTER VALIDATION LOGS
CREATE TABLE master_validation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    person_id UUID REFERENCES master_people(id) ON DELETE CASCADE,
    field_name VARCHAR(50) NOT NULL,
    error_message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 33. MASTER COMPLETENESS SCORES
CREATE TABLE master_completeness_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    person_id UUID UNIQUE REFERENCES master_people(id) ON DELETE CASCADE,
    score_percentage NUMERIC DEFAULT 0,
    missing_fields TEXT[],
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 34. MASTER OCR RESULTS
CREATE TABLE master_ocr_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    document_type VARCHAR(50) NOT NULL, -- KTP, KK, AKTA, NPWP
    extracted_data JSONB NOT NULL,
    accuracy_percentage NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================================
-- AUDIT TRIGGERS AND SOFT DELETE RULES
-- ============================================================================

-- Function to handle Soft Delete filter views
CREATE OR REPLACE FUNCTION filter_deleted() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Indexes for performance & quick queries
CREATE INDEX idx_master_people_tenant ON master_people(tenant_id);
CREATE INDEX idx_master_people_nik ON master_people(nik);
CREATE INDEX idx_master_students_nis ON master_students(nis);
CREATE INDEX idx_master_students_nisn ON master_students(nisn);
CREATE INDEX idx_master_teachers_nuptk ON master_teachers(nuptk);
CREATE INDEX idx_master_teachers_nip ON master_teachers(nip);
