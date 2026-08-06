-- ============================================================================
-- SPRINT 29: ENTERPRISE MASTER DATA ENGINE SQL SCHEMA FOR MYSQL / MARIADB
-- TARGET: Siswa, Santri, Guru, Pegawai, SDM, DAPODIK, EMIS, Akreditasi, Audit
-- COMPATIBILITY: MySQL 8.x, MySQL 5.7, MariaDB 10.x+
-- ============================================================================

-- Disable foreign key checks during schema creation
SET FOREIGN_KEY_CHECKS = 0;

-- 1. DOCUMENT CATEGORIES
DROP TABLE IF EXISTS master_document_categories;
CREATE TABLE master_document_categories (
    id VARCHAR(50) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by VARCHAR(50),
    updated_by VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. MASTER SETTINGS
DROP TABLE IF EXISTS master_settings;
CREATE TABLE master_settings (
    id VARCHAR(50) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL UNIQUE,
    dapodik_sync_enabled BOOLEAN DEFAULT TRUE,
    emis_sync_enabled BOOLEAN DEFAULT TRUE,
    auto_generate_numbers BOOLEAN DEFAULT TRUE,
    audit_trail_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by VARCHAR(50),
    updated_by VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. MASTER PEOPLE (Base Table for shared demographic data)
DROP TABLE IF EXISTS master_people;
CREATE TABLE master_people (
    id VARCHAR(50) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    nik VARCHAR(16) UNIQUE,
    gender CHAR(1),
    place_of_birth VARCHAR(100),
    date_of_birth DATE,
    religion VARCHAR(50),
    email VARCHAR(150),
    phone VARCHAR(50),
    blood_type VARCHAR(5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    CONSTRAINT chk_gender CHECK (gender IN ('L', 'P'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. MASTER ADDRESSES
DROP TABLE IF EXISTS master_addresses;
CREATE TABLE master_addresses (
    id VARCHAR(50) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    person_id VARCHAR(50) NULL,
    address_line TEXT,
    dusun VARCHAR(100),
    rt VARCHAR(10),
    rw VARCHAR(10),
    desa VARCHAR(100),
    kecamatan VARCHAR(100),
    kabupaten VARCHAR(100),
    provinsi VARCHAR(100),
    postal_code VARCHAR(10),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    FOREIGN KEY (person_id) REFERENCES master_people(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. MASTER STUDENT STATUSES
DROP TABLE IF EXISTS master_student_statuses;
CREATE TABLE master_student_statuses (
    id VARCHAR(50) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by VARCHAR(50),
    updated_by VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. MASTER STUDENTS (DAPODIK & EMIS COMPLIANT)
DROP TABLE IF EXISTS master_students;
CREATE TABLE master_students (
    id VARCHAR(50) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    person_id VARCHAR(50) UNIQUE,
    nis VARCHAR(50) NOT NULL UNIQUE,
    nisn CHAR(10) UNIQUE,
    school_origin VARCHAR(255),
    entry_date DATE,
    grade_level VARCHAR(50),
    classroom_name VARCHAR(100),
    major_specialization VARCHAR(100),
    registration_type VARCHAR(100),
    exam_participant_number VARCHAR(100),
    certificate_serial_number VARCHAR(100),
    status_id VARCHAR(50) NULL,
    kip_recipient BOOLEAN DEFAULT FALSE,
    kip_number VARCHAR(50),
    pkh_recipient BOOLEAN DEFAULT FALSE,
    pkh_number VARCHAR(50),
    kks_recipient BOOLEAN DEFAULT FALSE,
    kks_number VARCHAR(50),
    height DECIMAL(5, 2),
    weight DECIMAL(5, 2),
    head_circumference DECIMAL(5, 2),
    transportation_mode VARCHAR(100),
    distance_to_school VARCHAR(100),
    living_arrangement VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    FOREIGN KEY (person_id) REFERENCES master_people(id) ON DELETE CASCADE,
    FOREIGN KEY (status_id) REFERENCES master_student_statuses(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. MASTER SANTRI (BOARDING & TAHFIDZ DATA)
DROP TABLE IF EXISTS master_santri;
CREATE TABLE master_santri (
    id VARCHAR(50) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    student_id VARCHAR(50) UNIQUE,
    boarding_room_number VARCHAR(50),
    juz_memorized INTEGER DEFAULT 0,
    tahfidz_status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    FOREIGN KEY (student_id) REFERENCES master_students(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. MASTER EMPLOYEE STATUSES
DROP TABLE IF EXISTS master_employee_statuses;
CREATE TABLE master_employee_statuses (
    id VARCHAR(50) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by VARCHAR(50),
    updated_by VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. MASTER TEACHERS (GTK DAPODIK COMPLIANT)
DROP TABLE IF EXISTS master_teachers;
CREATE TABLE master_teachers (
    id VARCHAR(50) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    person_id VARCHAR(50) UNIQUE,
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
    basic_salary DECIMAL(15, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    FOREIGN KEY (person_id) REFERENCES master_people(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. MASTER EMPLOYEES (Staff/Administration)
DROP TABLE IF EXISTS master_employees;
CREATE TABLE master_employees (
    id VARCHAR(50) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    person_id VARCHAR(50) UNIQUE,
    employee_number VARCHAR(50) UNIQUE,
    role_description VARCHAR(255),
    status_id VARCHAR(50) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    FOREIGN KEY (person_id) REFERENCES master_people(id) ON DELETE CASCADE,
    FOREIGN KEY (status_id) REFERENCES master_employee_statuses(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. MASTER GUARDIANS
DROP TABLE IF EXISTS master_guardians;
CREATE TABLE master_guardians (
    id VARCHAR(50) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    student_id VARCHAR(50) NULL,
    name VARCHAR(255) NOT NULL,
    nik CHAR(16),
    relationship VARCHAR(50),
    occupation VARCHAR(100),
    phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    FOREIGN KEY (student_id) REFERENCES master_students(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. MASTER FAMILY MEMBERS
DROP TABLE IF EXISTS master_family_members;
CREATE TABLE master_family_members (
    id VARCHAR(50) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    person_id VARCHAR(50) NULL,
    family_card_number VARCHAR(50) NOT NULL,
    father_name VARCHAR(255),
    mother_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    FOREIGN KEY (person_id) REFERENCES master_people(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. MASTER IDENTITY CARDS
DROP TABLE IF EXISTS master_identity_cards;
CREATE TABLE master_identity_cards (
    id VARCHAR(50) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    person_id VARCHAR(50) NULL,
    card_number VARCHAR(50) NOT NULL UNIQUE,
    expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    FOREIGN KEY (person_id) REFERENCES master_people(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. MASTER BIRTH CERTIFICATES
DROP TABLE IF EXISTS master_birth_certificates;
CREATE TABLE master_birth_certificates (
    id VARCHAR(50) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    person_id VARCHAR(50) NULL,
    certificate_number VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    FOREIGN KEY (person_id) REFERENCES master_people(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. MASTER FAMILY CARDS
DROP TABLE IF EXISTS master_family_cards;
CREATE TABLE master_family_cards (
    id VARCHAR(50) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    family_card_number VARCHAR(50) NOT NULL UNIQUE,
    head_of_family VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by VARCHAR(50),
    updated_by VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. MASTER PASSPORTS
DROP TABLE IF EXISTS master_passports;
CREATE TABLE master_passports (
    id VARCHAR(50) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    person_id VARCHAR(50) NULL,
    passport_number VARCHAR(50) NOT NULL UNIQUE,
    country_of_issue VARCHAR(100) NOT NULL,
    expiry_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    FOREIGN KEY (person_id) REFERENCES master_people(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. MASTER STUDENT DOCUMENTS
DROP TABLE IF EXISTS master_student_documents;
CREATE TABLE master_student_documents (
    id VARCHAR(50) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    student_id VARCHAR(50) NULL,
    category_id VARCHAR(50) NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    FOREIGN KEY (student_id) REFERENCES master_students(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES master_document_categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. MASTER EMPLOYEE DOCUMENTS
DROP TABLE IF EXISTS master_employee_documents;
CREATE TABLE master_employee_documents (
    id VARCHAR(50) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    employee_id VARCHAR(50) NULL,
    category_id VARCHAR(50) NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    FOREIGN KEY (employee_id) REFERENCES master_employees(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES master_document_categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 19. MASTER DOCUMENT VERSIONS
DROP TABLE IF EXISTS master_document_versions;
CREATE TABLE master_document_versions (
    id VARCHAR(50) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    document_id VARCHAR(50) NOT NULL, -- references either student_document or employee_document
    version_number INTEGER NOT NULL,
    file_url TEXT NOT NULL,
    hash_sha256 CHAR(64) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 20. MASTER DOCUMENT DOWNLOADS (AUDIT TRAIL)
DROP TABLE IF EXISTS master_document_downloads;
CREATE TABLE master_document_downloads (
    id VARCHAR(50) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    document_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    ip_address VARCHAR(45),
    downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 21. MASTER DOCUMENT UPLOAD LOGS
DROP TABLE IF EXISTS master_document_upload_logs;
CREATE TABLE master_document_upload_logs (
    id VARCHAR(50) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    document_id VARCHAR(50) NOT NULL,
    action_type VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 22. MASTER PHOTOS
DROP TABLE IF EXISTS master_photos;
CREATE TABLE master_photos (
    id VARCHAR(50) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    person_id VARCHAR(50) UNIQUE,
    photo_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    FOREIGN KEY (person_id) REFERENCES master_people(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 23. MASTER PHOTO VERSIONS
DROP TABLE IF EXISTS master_photo_versions;
CREATE TABLE master_photo_versions (
    id VARCHAR(50) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    photo_id VARCHAR(50) NULL,
    version_number INTEGER NOT NULL,
    photo_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (photo_id) REFERENCES master_photos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 24. MASTER BARCODES
DROP TABLE IF EXISTS master_barcodes;
CREATE TABLE master_barcodes (
    id VARCHAR(50) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    person_id VARCHAR(50) UNIQUE,
    barcode_value VARCHAR(100) NOT NULL UNIQUE,
    purpose VARCHAR(100), -- Absensi, Perpustakaan, CBT, LMS
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (person_id) REFERENCES master_people(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 25. MASTER QR CODES
DROP TABLE IF EXISTS master_qrcodes;
CREATE TABLE master_qrcodes (
    id VARCHAR(50) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    person_id VARCHAR(50) UNIQUE,
    qrcode_value VARCHAR(255) NOT NULL UNIQUE,
    purpose VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (person_id) REFERENCES master_people(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 26. MASTER NUMBER SEQUENCES
DROP TABLE IF EXISTS master_number_sequences;
CREATE TABLE master_number_sequences (
    id VARCHAR(50) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    sequence_type VARCHAR(50) NOT NULL UNIQUE, -- NIS, NIP, NIY
    current_value INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 27. MASTER NUMBER TEMPLATES
DROP TABLE IF EXISTS master_number_templates;
CREATE TABLE master_number_templates (
    id VARCHAR(50) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    sequence_type VARCHAR(50) NOT NULL UNIQUE,
    prefix_pattern VARCHAR(50) NOT NULL, -- [YEAR][SEQ]
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 28. MASTER NUMBER HISTORIES
DROP TABLE IF EXISTS master_number_histories;
CREATE TABLE master_number_histories (
    id VARCHAR(50) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    sequence_type VARCHAR(50) NOT NULL,
    generated_number VARCHAR(100) NOT NULL,
    allocated_to VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 29. MASTER IMPORT JOBS
DROP TABLE IF EXISTS master_import_jobs;
CREATE TABLE master_import_jobs (
    id VARCHAR(50) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    format_type VARCHAR(50) NOT NULL, -- DAPODIK, EMIS, CSV, EXCEL
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, PROCESSING, COMPLETED, FAILED
    records_processed INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 30. MASTER EXPORT JOBS
DROP TABLE IF EXISTS master_export_jobs;
CREATE TABLE master_export_jobs (
    id VARCHAR(50) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    format_type VARCHAR(50) NOT NULL, -- EXCEL, CSV, PDF, WORD
    file_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 31. MASTER DUPLICATE LOGS
DROP TABLE IF EXISTS master_duplicate_logs;
CREATE TABLE master_duplicate_logs (
    id VARCHAR(50) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    field_name VARCHAR(50) NOT NULL, -- NIK, NISN, NUPTK
    duplicate_value VARCHAR(255) NOT NULL,
    record_ids JSON NOT NULL, -- Stored as JSON array in MySQL
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 32. MASTER VALIDATION LOGS
DROP TABLE IF EXISTS master_validation_logs;
CREATE TABLE master_validation_logs (
    id VARCHAR(50) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    person_id VARCHAR(50) NULL,
    field_name VARCHAR(50) NOT NULL,
    error_message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (person_id) REFERENCES master_people(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 33. MASTER COMPLETENESS SCORES
DROP TABLE IF EXISTS master_completeness_scores;
CREATE TABLE master_completeness_scores (
    id VARCHAR(50) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    person_id VARCHAR(50) UNIQUE,
    score_percentage DECIMAL(5, 2) DEFAULT 0.00,
    missing_fields JSON NULL, -- Stored as JSON array in MySQL
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (person_id) REFERENCES master_people(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 34. MASTER OCR RESULTS
DROP TABLE IF EXISTS master_ocr_results;
CREATE TABLE master_ocr_results (
    id VARCHAR(50) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    document_type VARCHAR(50) NOT NULL, -- KTP, KK, AKTA, NPWP
    extracted_data JSON NOT NULL, -- Stored as native JSON in MySQL
    accuracy_percentage DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ============================================================================
CREATE INDEX idx_master_people_tenant ON master_people(tenant_id);
CREATE INDEX idx_master_people_nik ON master_people(nik);
CREATE INDEX idx_master_students_nis ON master_students(nis);
CREATE INDEX idx_master_students_nisn ON master_students(nisn);
CREATE INDEX idx_master_teachers_nuptk ON master_teachers(nuptk);
CREATE INDEX idx_master_teachers_nip ON master_teachers(nip);
