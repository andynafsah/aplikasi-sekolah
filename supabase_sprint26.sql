-- ============================================================================
-- SPRINT 26: ENTERPRISE TATA USAHA, ADMINISTRASI SEKOLAH, PONDOK & YAYASAN
-- DATABASE SCHEMA FOR SUPABASE / POSTGRESQL
-- ============================================================================

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. OFFICE DASHBOARDS TABLE
CREATE TABLE IF NOT EXISTS office_dashboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    total_incoming_letters INT DEFAULT 0,
    total_outgoing_letters INT DEFAULT 0,
    total_dispositions INT DEFAULT 0,
    total_archives INT DEFAULT 0,
    total_guests INT DEFAULT 0,
    pending_tasks INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 2. OFFICE DOCUMENT CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS office_document_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    CONSTRAINT uq_category_code_tenant UNIQUE (tenant_id, code)
);

-- 3. OFFICE DOCUMENT TYPES TABLE
CREATE TABLE IF NOT EXISTS office_document_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL, -- Surat Masuk, Surat Keluar, Surat Keputusan, Surat Tugas, dll.
    code VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    CONSTRAINT uq_doc_type_code_tenant UNIQUE (tenant_id, code)
);

-- 4. OFFICE LETTER TEMPLATES TABLE
CREATE TABLE IF NOT EXISTS office_letter_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) NOT NULL,
    letter_type VARCHAR(100) NOT NULL, -- Surat Edaran, Surat Keputusan, etc.
    number_format VARCHAR(255) NOT NULL, -- e.g., {number}/YYS-DS/{month-roman}/{year}
    content_template TEXT NOT NULL,
    variables JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    CONSTRAINT uq_template_code_tenant UNIQUE (tenant_id, code)
);

-- 5. OFFICE LETTER NUMBERS TABLE (Auto numbering generator/sequence tracker)
CREATE TABLE IF NOT EXISTS office_letter_numbers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    template_code VARCHAR(100) NOT NULL,
    current_number INT DEFAULT 0,
    reset_cycle VARCHAR(50) DEFAULT 'ANNUALLY', -- ANNUALLY, MONTHLY, NEVER
    last_reset_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    CONSTRAINT uq_let_num_code_tenant UNIQUE (tenant_id, template_code)
);

-- 6. OFFICE INCOMING LETTERS TABLE
CREATE TABLE IF NOT EXISTS office_incoming_letters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    letter_number VARCHAR(255) NOT NULL,
    agenda_number VARCHAR(255) NOT NULL,
    letter_date DATE NOT NULL,
    received_date DATE NOT NULL,
    sender VARCHAR(255) NOT NULL,
    receiver VARCHAR(255) NOT NULL,
    subject TEXT NOT NULL,
    category_id UUID REFERENCES office_document_categories(id),
    letter_type VARCHAR(100) NOT NULL, -- Surat Masuk
    summary TEXT,
    confidentiality VARCHAR(50) DEFAULT 'BIASA', -- BIASA, RAHASIA, SANGAT_RAHASIA
    urgency VARCHAR(50) DEFAULT 'BIASA', -- SEGERA, BIASA, PENTING
    status VARCHAR(50) DEFAULT 'Pending', -- Pending, Read, Disposed, Archived
    file_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 7. OFFICE OUTGOING LETTERS TABLE
CREATE TABLE IF NOT EXISTS office_outgoing_letters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    letter_number VARCHAR(255) NOT NULL,
    agenda_number VARCHAR(255) NOT NULL,
    letter_date DATE NOT NULL,
    sender VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    subject TEXT NOT NULL,
    category_id UUID REFERENCES office_document_categories(id),
    letter_type VARCHAR(100) NOT NULL, -- Surat Keluar, SK, Surat Tugas, etc.
    summary TEXT,
    confidentiality VARCHAR(50) DEFAULT 'BIASA',
    urgency VARCHAR(50) DEFAULT 'BIASA',
    is_draft BOOLEAN DEFAULT TRUE,
    file_path TEXT,
    qr_code_hash VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 8. OFFICE DISPOSITIONS TABLE
CREATE TABLE IF NOT EXISTS office_dispositions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    incoming_letter_id UUID REFERENCES office_incoming_letters(id) ON DELETE CASCADE,
    disposition_date DATE NOT NULL,
    instruction TEXT NOT NULL,
    sender_id VARCHAR(255) NOT NULL, -- Who disposed (usually Kepala Sekolah or Ketua Yayasan)
    status VARCHAR(50) DEFAULT 'Pending', -- Pending, Read, In Progress, Completed, Rejected
    urgency VARCHAR(50) DEFAULT 'BIASA',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 9. OFFICE DISPOSITION RECEIVERS TABLE
CREATE TABLE IF NOT EXISTS office_disposition_receivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    disposition_id UUID REFERENCES office_dispositions(id) ON DELETE CASCADE,
    receiver_role VARCHAR(100) NOT NULL, -- GURU, KEPALA_SEKOLAH, BENDAHARA, etc.
    receiver_user_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Pending',
    notes TEXT,
    read_at TIMESTAMP WITH TIME ZONE,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 10. OFFICE ARCHIVE LOCATIONS TABLE
CREATE TABLE IF NOT EXISTS office_archive_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    building VARCHAR(255) NOT NULL,
    room VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 11. OFFICE ARCHIVE BOXES TABLE
CREATE TABLE IF NOT EXISTS office_archive_boxes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    location_id UUID REFERENCES office_archive_locations(id) ON DELETE SET NULL,
    box_number VARCHAR(100) NOT NULL,
    label VARCHAR(255) NOT NULL,
    capacity INT DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 12. OFFICE DOCUMENT ARCHIVES TABLE
CREATE TABLE IF NOT EXISTS office_document_archives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    archive_number VARCHAR(255) NOT NULL,
    document_id UUID, -- References letter or legal document
    document_type_code VARCHAR(100) NOT NULL, -- INCOMING, OUTGOING, LEGAL, etc.
    box_id UUID REFERENCES office_archive_boxes(id) ON DELETE SET NULL,
    shelf_position VARCHAR(100),
    archive_status VARCHAR(50) DEFAULT 'Active', -- Active, Inactive, Permanent, Destroyed
    retention_period_years INT DEFAULT 5,
    is_digital BOOLEAN DEFAULT TRUE,
    file_path TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 13. OFFICE EXPEDITIONS TABLE (Buku Ekspedisi Pengiriman Surat)
CREATE TABLE IF NOT EXISTS office_expeditions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    expedition_number VARCHAR(100) NOT NULL,
    dispatch_date DATE NOT NULL,
    dispatcher VARCHAR(255) NOT NULL, -- Pengirim/Kurir
    courier_service VARCHAR(255) DEFAULT 'Internal', -- JNE, J&T, Pos Indo, Kantor Pos, Internal, dll.
    tracking_number VARCHAR(255),
    notes TEXT,
    status VARCHAR(50) DEFAULT 'Dalam Perjalanan', -- Draft, Dikirim, Diterima, Gagal
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 14. OFFICE EXPEDITION ITEMS TABLE
CREATE TABLE IF NOT EXISTS office_expedition_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    expedition_id UUID REFERENCES office_expeditions(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL, -- OUTGOING_LETTER, etc.
    reference_id UUID NOT NULL, -- UUID references outgoing_letter or legal doc
    receiver_name VARCHAR(255) NOT NULL,
    delivery_status VARCHAR(50) DEFAULT 'Delivered',
    delivered_at TIMESTAMP WITH TIME ZONE,
    recipient_signature TEXT, -- Digital drawing URL or name
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 15. OFFICE GUEST BOOKS TABLE
CREATE TABLE IF NOT EXISTS office_guest_books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    institution VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    id_card_number VARCHAR(100),
    photo_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 16. OFFICE GUEST VISITS TABLE
CREATE TABLE IF NOT EXISTS office_guest_visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    guest_book_id UUID REFERENCES office_guest_books(id) ON DELETE CASCADE,
    visit_date DATE NOT NULL,
    visit_time TIME NOT NULL,
    purpose TEXT NOT NULL, -- Keperluan kunjungan
    host_name VARCHAR(255) NOT NULL, -- Person being visited
    room_or_department VARCHAR(100) NOT NULL,
    signature_path TEXT,
    temperature VARCHAR(50),
    badge_number VARCHAR(100),
    check_out_time TIME,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 17. OFFICE LEGAL DOCUMENTS TABLE (Akta, SK, NPWP, dll)
CREATE TABLE IF NOT EXISTS office_legal_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    document_number VARCHAR(255) NOT NULL,
    legal_type VARCHAR(100) NOT NULL, -- Akta Yayasan, SK Kemenkumham, NPWP, NIB, Izin Operasional, NPSN, NSPP, Piagam, Sertifikat, MoU
    issuer VARCHAR(255) NOT NULL, -- Instansi Penerbit
    issue_date DATE NOT NULL,
    expiration_date DATE,
    alert_before_days INT DEFAULT 30,
    status VARCHAR(50) DEFAULT 'Active', -- Active, Expired, Revoked, Draft
    file_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 18. OFFICE DOCUMENT VERSIONS TABLE
CREATE TABLE IF NOT EXISTS office_document_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    document_type VARCHAR(100) NOT NULL, -- LEGAL_DOC, INCOMING, OUTGOING, TEMPLATE, etc.
    document_id UUID NOT NULL,
    version_number INT NOT NULL DEFAULT 1,
    file_path TEXT NOT NULL,
    change_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 19. OFFICE DOCUMENT ATTACHMENTS TABLE
CREATE TABLE IF NOT EXISTS office_document_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    document_id UUID NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size_bytes INT,
    file_type VARCHAR(50) NOT NULL, -- PDF, DOCX, XLSX, JPG, PNG, etc.
    file_path TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 20. OFFICE DOCUMENT QRCODES TABLE
CREATE TABLE IF NOT EXISTS office_document_qrcodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    document_id UUID NOT NULL,
    qrcode_hash VARCHAR(255) NOT NULL UNIQUE,
    verification_url TEXT NOT NULL,
    scans_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 21. OFFICE DOCUMENT SIGNATURES TABLE
CREATE TABLE IF NOT EXISTS office_document_signatures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    document_id UUID NOT NULL,
    signer_name VARCHAR(255) NOT NULL,
    signer_role VARCHAR(255) NOT NULL,
    signature_type VARCHAR(100) NOT NULL, -- Manual, QR Signature, Digital Signature, Electronic Signature Ready
    signature_data TEXT, -- Cryptographic hash or signature drawing URL
    is_valid BOOLEAN DEFAULT TRUE,
    signed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 22. OFFICE DOCUMENT EXPIRATIONS TABLE
CREATE TABLE IF NOT EXISTS office_document_expirations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    document_id UUID NOT NULL,
    expiration_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, RENEWED, EXPIRED
    renewed_at DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 23. OFFICE DOCUMENT REMINDERS TABLE
CREATE TABLE IF NOT EXISTS office_document_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    document_id UUID NOT NULL,
    reminder_title VARCHAR(255) NOT NULL,
    reminder_message TEXT,
    reminder_date DATE NOT NULL,
    is_sent BOOLEAN DEFAULT FALSE,
    frequency VARCHAR(50) DEFAULT 'ONCE', -- ONCE, DAILY, WEEKLY
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 24. OFFICE DOCUMENT LOGS TABLE (Document Specific Audit Trail)
CREATE TABLE IF NOT EXISTS office_document_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    document_id UUID NOT NULL,
    activity_type VARCHAR(100) NOT NULL, -- CREATED, EDITED, SIGNED, QR_VERIFIED, ARCHIVED, DELETED
    actor_name VARCHAR(255) NOT NULL,
    actor_role VARCHAR(255) NOT NULL,
    ip_address VARCHAR(50),
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 25. OFFICE DOCUMENT STATISTICS TABLE
CREATE TABLE IF NOT EXISTS office_document_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    category_id UUID,
    incoming_count INT DEFAULT 0,
    outgoing_count INT DEFAULT 0,
    pending_disposition_count INT DEFAULT 0,
    expired_count INT DEFAULT 0,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 26. OFFICE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS office_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL UNIQUE,
    header_template TEXT, -- Kop Surat Yayasan / Sekolah
    signature_anchor TEXT, -- Penandatangan utama
    auto_number_format VARCHAR(255) DEFAULT '{seq}/SK-TU/{month}/{year}',
    enable_qr_verification BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- ============================================================================
-- INDEXES FOR MAXIMUM QUERY OPTIMIZATION & PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_off_dash_tenant ON office_dashboards(tenant_id);
CREATE INDEX IF NOT EXISTS idx_off_inc_let_tenant_no ON office_incoming_letters(tenant_id, letter_number);
CREATE INDEX IF NOT EXISTS idx_off_out_let_tenant_no ON office_outgoing_letters(tenant_id, letter_number);
CREATE INDEX IF NOT EXISTS idx_off_disp_letter ON office_dispositions(incoming_letter_id);
CREATE INDEX IF NOT EXISTS idx_off_doc_arch_box ON office_document_archives(box_id);
CREATE INDEX IF NOT EXISTS idx_off_guest_visit_date ON office_guest_visits(visit_date);
CREATE INDEX IF NOT EXISTS idx_off_legal_doc_exp ON office_legal_documents(expiration_date);
CREATE INDEX IF NOT EXISTS idx_off_doc_vers_doc ON office_document_versions(document_type, document_id);
CREATE INDEX IF NOT EXISTS idx_off_doc_rem_date ON office_document_reminders(reminder_date, is_sent);
CREATE INDEX IF NOT EXISTS idx_off_doc_logs_doc ON office_document_logs(document_type, document_id);
