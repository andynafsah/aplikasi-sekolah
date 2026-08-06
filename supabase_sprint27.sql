-- ============================================================================
-- SPRINT 27: ENTERPRISE AUDIT, COMPLIANCE, AKREDITASI & GOVERNMENT REPORTING
-- DATABASE SCHEMA FOR SUPABASE / POSTGRESQL
-- ============================================================================

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. AUDIT DASHBOARDS
CREATE TABLE IF NOT EXISTS audit_dashboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    total_audit_logs INT DEFAULT 0,
    total_compliance_frameworks INT DEFAULT 0,
    total_open_risks INT DEFAULT 0,
    total_accreditations INT DEFAULT 0,
    compliance_score DECIMAL(5,2) DEFAULT 0.00,
    risk_score DECIMAL(5,2) DEFAULT 0.00,
    accreditation_progress DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_audit_dashboards_tenant ON audit_dashboards(tenant_id) WHERE deleted_at IS NULL;

-- 2. AUDIT EVENTS
CREATE TABLE IF NOT EXISTS audit_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(100) NOT NULL CHECK (event_type IN ('Create', 'Update', 'Delete', 'Restore', 'Approve', 'Reject', 'Login', 'Logout', 'Export', 'Import')),
    event_name VARCHAR(255) NOT NULL,
    description TEXT,
    module_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_audit_events_tenant_type ON audit_events(tenant_id, event_type) WHERE deleted_at IS NULL;

-- 3. AUDIT LOGS (Immutable Audit Log)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL CHECK (action IN ('Create', 'Update', 'Delete', 'Restore', 'Approve', 'Reject', 'Login', 'Logout', 'Export', 'Import')),
    module VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(50) NOT NULL CHECK (severity IN ('Information', 'Warning', 'Critical', 'Security')),
    ip_address VARCHAR(50),
    user_agent TEXT,
    payload JSONB,
    encrypted_hash VARCHAR(255) NOT NULL, -- Cryptographic link verifying immutability
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_action ON audit_logs(tenant_id, action) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- 4. AUDIT ENTITIES
CREATE TABLE IF NOT EXISTS audit_entities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    entity_name VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    CONSTRAINT uq_audit_entity_tenant_table UNIQUE (tenant_id, table_name)
);

-- 5. AUDIT ENTITY CHANGES (Data Change History with before & after values)
CREATE TABLE IF NOT EXISTS audit_entity_changes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    audit_log_id UUID REFERENCES audit_logs(id) ON DELETE SET NULL,
    entity_id VARCHAR(255) NOT NULL,
    entity_type VARCHAR(255) NOT NULL,
    before_value JSONB,
    after_value JSONB,
    changed_fields TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_audit_changes_entity ON audit_entity_changes(tenant_id, entity_type, entity_id) WHERE deleted_at IS NULL;

-- 6. AUDIT SNAPSHOTS
CREATE TABLE IF NOT EXISTS audit_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    entity_type VARCHAR(255) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    snapshot_data JSONB NOT NULL,
    version INT DEFAULT 1 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_audit_snapshots_lookup ON audit_snapshots(tenant_id, entity_type, entity_id, version) WHERE deleted_at IS NULL;

-- 7. AUDIT USER SESSIONS (User Activity Monitoring)
CREATE TABLE IF NOT EXISTS audit_user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    session_token VARCHAR(255) NOT NULL,
    ip_address VARCHAR(50),
    login_time TIMESTAMP WITH TIME ZONE NOT NULL,
    logout_time TIMESTAMP WITH TIME ZONE,
    last_activity_time TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_audit_sessions_token ON audit_user_sessions(session_token) WHERE deleted_at IS NULL;

-- 8. AUDIT LOGIN HISTORIES (Immutable Login Records)
CREATE TABLE IF NOT EXISTS audit_login_histories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    ip_address VARCHAR(50),
    user_agent TEXT,
    status VARCHAR(50) NOT NULL, -- e.g. 'SUCCESS', 'FAILED'
    failure_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_audit_login_histories_tenant ON audit_login_histories(tenant_id, username, status) WHERE deleted_at IS NULL;

-- 9. AUDIT API LOGS
CREATE TABLE IF NOT EXISTS audit_api_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255),
    method VARCHAR(10) NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    status_code INT NOT NULL,
    execution_time_ms INT NOT NULL,
    request_payload JSONB,
    response_payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_audit_api_logs_lookup ON audit_api_logs(tenant_id, endpoint, status_code) WHERE deleted_at IS NULL;

-- 10. AUDIT PERMISSIONS
CREATE TABLE IF NOT EXISTS audit_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    role_name VARCHAR(100) NOT NULL,
    module_name VARCHAR(100) NOT NULL,
    can_create BOOLEAN DEFAULT FALSE NOT NULL,
    can_read BOOLEAN DEFAULT TRUE NOT NULL,
    can_update BOOLEAN DEFAULT FALSE NOT NULL,
    can_delete BOOLEAN DEFAULT FALSE NOT NULL,
    can_approve BOOLEAN DEFAULT FALSE NOT NULL,
    can_export BOOLEAN DEFAULT FALSE NOT NULL,
    can_import BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    CONSTRAINT uq_audit_permission_role_module UNIQUE (tenant_id, role_name, module_name)
);

-- 11. AUDIT APPROVAL LOGS
CREATE TABLE IF NOT EXISTS audit_approval_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    workflow_id VARCHAR(255) NOT NULL,
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('Approve', 'Reject')),
    step_name VARCHAR(255) NOT NULL,
    approver_id VARCHAR(255) NOT NULL,
    approver_name VARCHAR(255) NOT NULL,
    notes TEXT,
    payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_audit_approval_workflow ON audit_approval_logs(tenant_id, workflow_id) WHERE deleted_at IS NULL;

-- 12. AUDIT DOCUMENT ACCESS (Digital Evidence & Document security logging)
CREATE TABLE IF NOT EXISTS audit_document_access (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    document_id VARCHAR(255) NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    access_type VARCHAR(50) NOT NULL, -- e.g. 'VIEW', 'DOWNLOAD', 'VERIFY', 'DELETE'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_audit_doc_access_lookup ON audit_document_access(tenant_id, document_id) WHERE deleted_at IS NULL;

-- 13. AUDIT EXPORTS (All Exports Registered)
CREATE TABLE IF NOT EXISTS audit_exports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    export_type VARCHAR(100) NOT NULL, -- e.g. 'Audit Report', 'Compliance Report', etc.
    format VARCHAR(10) NOT NULL CHECK (format IN ('PDF', 'Excel', 'CSV')),
    query_parameters JSONB,
    record_count INT DEFAULT 0 NOT NULL,
    file_url VARCHAR(512),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 14. AUDIT REPORTS
CREATE TABLE IF NOT EXISTS audit_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    report_type VARCHAR(100) NOT NULL,
    generated_by VARCHAR(255) NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'PENDING', 'COMPLETED', 'FAILED'
    file_url VARCHAR(512),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 15. AUDIT RISK CATEGORIES
CREATE TABLE IF NOT EXISTS audit_risk_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    CONSTRAINT uq_risk_category_tenant UNIQUE (tenant_id, name)
);

-- 16. AUDIT RISKS
CREATE TABLE IF NOT EXISTS audit_risks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    category_id UUID REFERENCES audit_risk_categories(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    risk_level VARCHAR(50) NOT NULL CHECK (risk_level IN ('Low', 'Medium', 'High', 'Critical')),
    likelihood VARCHAR(50) NOT NULL, -- 'Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'
    impact VARCHAR(50) NOT NULL, -- 'Insignificant', 'Minor', 'Moderate', 'Major', 'Severe'
    mitigation_plan TEXT,
    status VARCHAR(50) NOT NULL CHECK (status IN ('Open', 'Mitigated', 'Closed', 'Accepted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 17. AUDIT FINDINGS
CREATE TABLE IF NOT EXISTS audit_findings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    risk_id UUID REFERENCES audit_risks(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    auditor_name VARCHAR(255),
    finding_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('Draft', 'Open', 'Resolved', 'Overdue')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 18. AUDIT RECOMMENDATIONS
CREATE TABLE IF NOT EXISTS audit_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    finding_id UUID REFERENCES audit_findings(id) ON DELETE CASCADE,
    recommendation TEXT NOT NULL,
    priority VARCHAR(50) NOT NULL CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 19. AUDIT CORRECTIVE ACTIONS
CREATE TABLE IF NOT EXISTS audit_corrective_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    recommendation_id UUID REFERENCES audit_recommendations(id) ON DELETE CASCADE,
    action_plan TEXT NOT NULL,
    target_date DATE NOT NULL,
    assignee_id VARCHAR(255),
    assignee_name VARCHAR(255),
    status VARCHAR(50) NOT NULL CHECK (status IN ('Not Started', 'In Progress', 'Completed', 'Delayed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 20. AUDIT FOLLOWUPS
CREATE TABLE IF NOT EXISTS audit_followups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    corrective_action_id UUID REFERENCES audit_corrective_actions(id) ON DELETE CASCADE,
    notes TEXT NOT NULL,
    verified_by VARCHAR(255) NOT NULL,
    verification_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('Verified', 'Partially Verified', 'Rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 21. COMPLIANCE FRAMEWORKS (Supports custom & addition of frameworks)
CREATE TABLE IF NOT EXISTS compliance_frameworks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) NOT NULL,
    type VARCHAR(100) NOT NULL CHECK (type IN ('Internal', 'Foundation', 'Education Office', 'Religious Affairs', 'ISO Ready', 'Custom')),
    description TEXT,
    version VARCHAR(50) DEFAULT '1.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    CONSTRAINT uq_compliance_framework_tenant_code UNIQUE (tenant_id, code)
);

-- 22. COMPLIANCE CATEGORIES
CREATE TABLE IF NOT EXISTS compliance_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    framework_id UUID REFERENCES compliance_frameworks(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 23. COMPLIANCE CHECKLISTS (Checklist Builder)
CREATE TABLE IF NOT EXISTS compliance_checklists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    category_id UUID REFERENCES compliance_categories(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 24. COMPLIANCE ITEMS
CREATE TABLE IF NOT EXISTS compliance_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    checklist_id UUID REFERENCES compliance_checklists(id) ON DELETE CASCADE,
    requirement_text TEXT NOT NULL,
    legal_reference TEXT,
    is_mandatory BOOLEAN DEFAULT TRUE NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending' NOT NULL CHECK (status IN ('Pending', 'Compliant', 'Non-Compliant', 'Not Applicable')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 25. COMPLIANCE EVIDENCES (With Digital Evidence Validation / signature)
CREATE TABLE IF NOT EXISTS compliance_evidences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    item_id UUID REFERENCES compliance_items(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    file_path VARCHAR(512) NOT NULL,
    file_type VARCHAR(10) NOT NULL CHECK (file_type IN ('PDF', 'DOCX', 'XLSX', 'JPG', 'PNG', 'ZIP')),
    file_size INT NOT NULL,
    digital_signature VARCHAR(255) NOT NULL, -- SHA256 of file & context for tamper-proofing
    verification_status VARCHAR(50) DEFAULT 'Unverified' NOT NULL CHECK (verification_status IN ('Unverified', 'Verified', 'Rejected')),
    verified_by VARCHAR(255),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 26. COMPLIANCE ASSESSMENTS
CREATE TABLE IF NOT EXISTS compliance_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    framework_id UUID REFERENCES compliance_frameworks(id) ON DELETE CASCADE,
    assessor_name VARCHAR(255) NOT NULL,
    assessment_date DATE NOT NULL,
    total_items INT DEFAULT 0 NOT NULL,
    compliant_items INT DEFAULT 0 NOT NULL,
    compliance_rate DECIMAL(5,2) DEFAULT 0.00 NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 27. COMPLIANCE SCORES
CREATE TABLE IF NOT EXISTS compliance_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    framework_id UUID REFERENCES compliance_frameworks(id) ON DELETE CASCADE,
    score DECIMAL(5,2) DEFAULT 0.00 NOT NULL,
    evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 28. GOVERNMENT REPORTS (Using template mapping)
CREATE TABLE IF NOT EXISTS government_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    report_type VARCHAR(100) NOT NULL CHECK (report_type IN ('Student', 'Teacher', 'Employee', 'Finance', 'Attendance', 'Infrastructure', 'Library', 'Boarding')),
    title VARCHAR(255) NOT NULL,
    academic_year VARCHAR(50) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    content_data JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'Draft' NOT NULL CHECK (status IN ('Draft', 'Generated', 'Submitted', 'Approved')),
    submission_date DATE,
    government_tracking_number VARCHAR(100),
    file_url VARCHAR(512),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_gov_reports_lookup ON government_reports(tenant_id, report_type) WHERE deleted_at IS NULL;

-- 29. GOVERNMENT REPORT TEMPLATES
CREATE TABLE IF NOT EXISTS government_report_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    report_type VARCHAR(100) NOT NULL CHECK (report_type IN ('Student', 'Teacher', 'Employee', 'Finance', 'Attendance', 'Infrastructure', 'Library', 'Boarding')),
    name VARCHAR(255) NOT NULL,
    format_definition JSONB NOT NULL, -- structure / excel configurations
    version VARCHAR(50) DEFAULT '1.0' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    CONSTRAINT uq_gov_report_template_tenant_type UNIQUE (tenant_id, report_type, version)
);

-- 30. GOVERNMENT REPORT EXPORTS
CREATE TABLE IF NOT EXISTS government_report_exports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    report_id UUID REFERENCES government_reports(id) ON DELETE CASCADE,
    format VARCHAR(10) NOT NULL CHECK (format IN ('PDF', 'Excel', 'CSV')),
    exported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    exported_by VARCHAR(255) NOT NULL,
    file_url VARCHAR(512),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 31. ACCREDITATION PERIODS
CREATE TABLE IF NOT EXISTS accreditation_periods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    institution_type VARCHAR(100) NOT NULL CHECK (institution_type IN ('School', 'Madrasah', 'Pesantren', 'Training Center')),
    status VARCHAR(50) DEFAULT 'Upcoming' NOT NULL CHECK (status IN ('Upcoming', 'Active', 'Finished', 'Extended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 32. ACCREDITATION STANDARDS
CREATE TABLE IF NOT EXISTS accreditation_standards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    period_id UUID REFERENCES accreditation_periods(id) ON DELETE CASCADE,
    code VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    weight DECIMAL(5,2) DEFAULT 0.00 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    CONSTRAINT uq_accreditation_standard_code UNIQUE (tenant_id, period_id, code)
);

-- 33. ACCREDITATION INSTRUMENTS (Custom instrument support)
CREATE TABLE IF NOT EXISTS accreditation_instruments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    standard_id UUID REFERENCES accreditation_standards(id) ON DELETE CASCADE,
    code VARCHAR(100) NOT NULL,
    question_text TEXT NOT NULL,
    scoring_rubric JSONB,
    maximum_score INT DEFAULT 4 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    CONSTRAINT uq_accreditation_inst_code UNIQUE (tenant_id, standard_id, code)
);

-- 34. ACCREDITATION INDICATORS
CREATE TABLE IF NOT EXISTS accreditation_indicators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    instrument_id UUID REFERENCES accreditation_instruments(id) ON DELETE CASCADE,
    indicator_text TEXT NOT NULL,
    target_value VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 35. ACCREDITATION ASSESSMENTS
CREATE TABLE IF NOT EXISTS accreditation_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    period_id UUID REFERENCES accreditation_periods(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'Not Started' NOT NULL CHECK (status IN ('Not Started', 'Self Evaluation', 'Assessor Visitation', 'Review', 'Finalized')),
    overall_self_score DECIMAL(5,2) DEFAULT 0.00 NOT NULL,
    overall_assessor_score DECIMAL(5,2) DEFAULT 0.00 NOT NULL,
    final_grade VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 36. ACCREDITATION SCORES (Self score and assessor verification scores)
CREATE TABLE IF NOT EXISTS accreditation_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    assessment_id UUID REFERENCES accreditation_assessments(id) ON DELETE CASCADE,
    instrument_id UUID REFERENCES accreditation_instruments(id) ON DELETE CASCADE,
    self_score INT DEFAULT 0 NOT NULL,
    assessor_score INT DEFAULT 0 NOT NULL,
    justification TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    CONSTRAINT uq_accreditation_score_inst_assess UNIQUE (tenant_id, assessment_id, instrument_id)
);

-- 37. ACCREDITATION EVIDENCES (Evidence Repository link)
CREATE TABLE IF NOT EXISTS accreditation_evidences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    instrument_id UUID REFERENCES accreditation_instruments(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 38. ACCREDITATION DOCUMENTS (Evidence documents)
CREATE TABLE IF NOT EXISTS accreditation_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    evidence_id UUID REFERENCES accreditation_evidences(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    file_path VARCHAR(512) NOT NULL,
    file_type VARCHAR(10) NOT NULL CHECK (file_type IN ('PDF', 'DOCX', 'XLSX', 'JPG', 'PNG', 'ZIP')),
    file_size INT NOT NULL,
    digital_signature VARCHAR(255) NOT NULL, -- Cryptographic hash for digital evidence verification
    verification_status VARCHAR(50) DEFAULT 'Unverified' NOT NULL CHECK (verification_status IN ('Unverified', 'Verified', 'Rejected')),
    verified_by VARCHAR(255),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 39. ACCREDITATION REVIEWERS
CREATE TABLE IF NOT EXISTS accreditation_reviewers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    assessment_id UUID REFERENCES accreditation_assessments(id) ON DELETE CASCADE,
    reviewer_name VARCHAR(255) NOT NULL,
    reviewer_role VARCHAR(100) DEFAULT 'INTERNAL' NOT NULL, -- 'INTERNAL', 'EXTERNAL'
    assignment_date DATE NOT NULL,
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 40. ACCREDITATION SETTINGS
CREATE TABLE IF NOT EXISTS accreditation_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    auto_sync_enabled BOOLEAN DEFAULT FALSE NOT NULL,
    sispena_integration_key VARCHAR(255),
    alert_recipient_email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);
