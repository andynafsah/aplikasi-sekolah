-- Supabase PostgreSQL Migration for ERP SaaS Multi-Tenant (Sprint 22 - Parent Portal & Notification Gateway)

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. NOTIFICATION PROVIDERS
CREATE TABLE IF NOT EXISTS notification_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL, -- e.g., 'WhatsApp Cloud API', 'SendGrid', 'SMTP', etc.
    code VARCHAR(50) NOT NULL UNIQUE, -- e.g. 'whatsapp_meta', 'email_sendgrid', etc.
    status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')) NOT NULL,
    config JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_notif_prov_tenant ON notification_providers(tenant_id) WHERE deleted_at IS NULL;

-- 2. NOTIFICATION CHANNELS
CREATE TABLE IF NOT EXISTS notification_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    channel_name VARCHAR(50) CHECK (channel_name IN ('WhatsApp', 'Email', 'SMS', 'Push', 'Telegram', 'Discord', 'Slack', 'Webhook')) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    default_provider_id UUID REFERENCES notification_providers(id) ON DELETE SET NULL,
    config JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    CONSTRAINT uq_tenant_channel UNIQUE (tenant_id, channel_name)
);
CREATE INDEX IF NOT EXISTS idx_notif_chan_tenant ON notification_channels(tenant_id) WHERE deleted_at IS NULL;

-- 3. NOTIFICATION TEMPLATES
CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    channel_name VARCHAR(50) NOT NULL,
    subject VARCHAR(200), -- Nullable for WhatsApp/SMS
    body TEXT NOT NULL,
    variables JSONB DEFAULT '[]'::jsonb NOT NULL, -- list of variables, e.g. ['student_name', 'invoice_amount']
    status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_notif_temp_tenant ON notification_templates(tenant_id) WHERE deleted_at IS NULL;

-- 4. NOTIFICATION VARIABLES
CREATE TABLE IF NOT EXISTS notification_variables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    default_value VARCHAR(255),
    validation_regex VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    CONSTRAINT uq_tenant_variable UNIQUE (tenant_id, name)
);

-- 5. NOTIFICATION QUEUE
CREATE TABLE IF NOT EXISTS notification_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    template_id UUID REFERENCES notification_templates(id) ON DELETE SET NULL,
    channel_name VARCHAR(50) NOT NULL,
    recipient VARCHAR(255) NOT NULL, -- Email, phone number, token, etc.
    payload JSONB DEFAULT '{}'::jsonb NOT NULL, -- parsed variables
    status VARCHAR(50) DEFAULT 'Queued' CHECK (status IN ('Queued', 'Sending', 'Delivered', 'Read', 'Failed', 'Retry')) NOT NULL,
    retry_count INTEGER DEFAULT 0 NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_notif_queue_tenant_status ON notification_queue(tenant_id, status) WHERE deleted_at IS NULL;

-- 6. NOTIFICATION LOGS
CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    queue_id UUID REFERENCES notification_queue(id) ON DELETE SET NULL,
    channel_name VARCHAR(50) NOT NULL,
    provider_name VARCHAR(100) NOT NULL,
    recipient VARCHAR(255) NOT NULL,
    payload JSONB DEFAULT '{}'::jsonb NOT NULL,
    status VARCHAR(50) NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE,
    response_payload JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_notif_logs_tenant ON notification_logs(tenant_id) WHERE deleted_at IS NULL;

-- 7. NOTIFICATION FAILURES
CREATE TABLE IF NOT EXISTS notification_failures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    log_id UUID REFERENCES notification_logs(id) ON DELETE SET NULL,
    error_code VARCHAR(100) NOT NULL,
    error_message TEXT NOT NULL,
    raw_response TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);

-- 8. NOTIFICATION RETRY JOBS
CREATE TABLE IF NOT EXISTS notification_retry_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    queue_id UUID REFERENCES notification_queue(id) ON DELETE CASCADE NOT NULL,
    attempt INTEGER DEFAULT 1 NOT NULL,
    max_attempts INTEGER DEFAULT 3 NOT NULL,
    next_retry_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSED', 'FAILED')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);

-- 9. NOTIFICATION SETTINGS
CREATE TABLE IF NOT EXISTS notification_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    key VARCHAR(100) NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    CONSTRAINT uq_tenant_setting UNIQUE (tenant_id, key)
);

-- 10. NOTIFICATION PREFERENCES
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    user_id VARCHAR(100) NOT NULL, -- Refers to User ID (or parent ID, etc.)
    channel_name VARCHAR(50) NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    CONSTRAINT uq_tenant_user_pref UNIQUE (tenant_id, user_id, channel_name)
);

-- 11. WHATSAPP ACCOUNTS
CREATE TABLE IF NOT EXISTS whatsapp_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    provider VARCHAR(50) CHECK (provider IN ('WhatsApp Cloud API', 'Meta Business API', 'Fonnte', 'Wablas', 'Twilio', 'UltraMsg', 'Green API', 'Custom Provider')) NOT NULL,
    status VARCHAR(50) DEFAULT 'DISCONNECTED' CHECK (status IN ('CONNECTED', 'DISCONNECTED', 'SUSPENDED')) NOT NULL,
    config JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);

-- 12. WHATSAPP SESSIONS
CREATE TABLE IF NOT EXISTS whatsapp_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    account_id UUID REFERENCES whatsapp_accounts(id) ON DELETE CASCADE NOT NULL,
    session_token TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    connected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);

-- 13. WHATSAPP MESSAGES
CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    session_id UUID REFERENCES whatsapp_sessions(id) ON DELETE SET NULL,
    message_type VARCHAR(50) DEFAULT 'TEXT' NOT NULL, -- TEXT, TEMPLATE, MEDIA, etc.
    direction VARCHAR(20) CHECK (direction IN ('INBOUND', 'OUTBOUND')) NOT NULL,
    recipient_phone VARCHAR(50) NOT NULL,
    message_text TEXT NOT NULL,
    media_url TEXT,
    status VARCHAR(50) DEFAULT 'Queued' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);

-- 14. EMAIL ACCOUNTS
CREATE TABLE IF NOT EXISTS email_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email_address VARCHAR(150) NOT NULL,
    provider VARCHAR(50) CHECK (provider IN ('SMTP', 'Gmail API', 'SendGrid', 'Mailgun', 'Amazon SES')) NOT NULL,
    host VARCHAR(255),
    port INTEGER,
    username VARCHAR(100),
    encrypted_password TEXT,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);

-- 15. EMAIL MESSAGES
CREATE TABLE IF NOT EXISTS email_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    account_id UUID REFERENCES email_accounts(id) ON DELETE SET NULL,
    recipient_email VARCHAR(150) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    body_html TEXT,
    body_text TEXT,
    status VARCHAR(50) DEFAULT 'Queued' NOT NULL,
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);

-- 16. SMS ACCOUNTS
CREATE TABLE IF NOT EXISTS sms_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    provider VARCHAR(50) NOT NULL, -- e.g. Twilio, Infobip, etc.
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    api_key VARCHAR(255),
    sender_id VARCHAR(50),
    config JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);

-- 17. SMS MESSAGES
CREATE TABLE IF NOT EXISTS sms_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    account_id UUID REFERENCES sms_accounts(id) ON DELETE SET NULL,
    recipient_phone VARCHAR(50) NOT NULL,
    message_text TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Queued' NOT NULL,
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);

-- 18. PUSH DEVICES
CREATE TABLE IF NOT EXISTS push_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    user_id VARCHAR(100) NOT NULL, -- can be student, teacher, or parent account
    device_token TEXT NOT NULL,
    platform VARCHAR(50) CHECK (platform IN ('iOS', 'Android', 'Web')) NOT NULL,
    browser_name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    CONSTRAINT uq_device_token UNIQUE (device_token)
);

-- 19. PUSH NOTIFICATIONS
CREATE TABLE IF NOT EXISTS push_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    device_id UUID REFERENCES push_devices(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(150) NOT NULL,
    body TEXT NOT NULL,
    payload JSONB DEFAULT '{}'::jsonb NOT NULL,
    status VARCHAR(50) DEFAULT 'Queued' NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);

-- 20. PARENT ACCOUNTS
CREATE TABLE IF NOT EXISTS parent_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    CONSTRAINT uq_parent_email UNIQUE (tenant_id, email),
    CONSTRAINT uq_parent_username UNIQUE (tenant_id, username)
);

-- 21. PARENT STUDENTS
CREATE TABLE IF NOT EXISTS parent_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    parent_id UUID REFERENCES parent_accounts(id) ON DELETE CASCADE NOT NULL,
    student_id VARCHAR(100) NOT NULL, -- References primary student ID
    relationship VARCHAR(50) CHECK (relationship IN ('Ayah', 'Ibu', 'Wali', 'Lainnya')) NOT NULL,
    is_primary BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    CONSTRAINT uq_parent_student UNIQUE (parent_id, student_id)
);

-- 22. PARENT DASHBOARDS
CREATE TABLE IF NOT EXISTS parent_dashboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    parent_id UUID REFERENCES parent_accounts(id) ON DELETE CASCADE UNIQUE NOT NULL,
    layout_config JSONB DEFAULT '{}'::jsonb NOT NULL,
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);

-- 23. ANNOUNCEMENT CATEGORIES
CREATE TABLE IF NOT EXISTS announcement_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    CONSTRAINT uq_ann_cat_tenant UNIQUE (tenant_id, name)
);

-- 24. ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    category_id UUID REFERENCES announcement_categories(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    target_audience VARCHAR(50) CHECK (target_audience IN ('PARENTS', 'STUDENTS', 'TEACHERS', 'EMPLOYEES', 'ALL')) NOT NULL,
    status VARCHAR(50) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')) NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ann_tenant_status ON announcements(tenant_id, status) WHERE deleted_at IS NULL;

-- 25. ANNOUNCEMENT RECEIVERS
CREATE TABLE IF NOT EXISTS announcement_receivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    announcement_id UUID REFERENCES announcements(id) ON DELETE CASCADE NOT NULL,
    receiver_id VARCHAR(100) NOT NULL, -- Can be parent_id, student_id, etc.
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ann_recv_read ON announcement_receivers(announcement_id, receiver_id, is_read) WHERE deleted_at IS NULL;

-- 26. BROADCAST CAMPAIGNS
CREATE TABLE IF NOT EXISTS broadcast_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    channel_name VARCHAR(50) NOT NULL,
    template_id UUID REFERENCES notification_templates(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'QUEUED', 'SENDING', 'SENT', 'FAILED', 'PAUSED')) NOT NULL,
    total_recipients INTEGER DEFAULT 0 NOT NULL,
    sent_count INTEGER DEFAULT 0 NOT NULL,
    failed_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);

-- 27. BROADCAST RECEIVERS
CREATE TABLE IF NOT EXISTS broadcast_receivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    campaign_id UUID REFERENCES broadcast_campaigns(id) ON DELETE CASCADE NOT NULL,
    receiver_type VARCHAR(50) CHECK (receiver_type IN ('PARENT', 'STUDENT', 'TEACHER', 'EMPLOYEE', 'CUSTOM')) NOT NULL,
    receiver_id VARCHAR(100) NOT NULL, -- Refers to parent_id, student_id, etc.
    status VARCHAR(50) DEFAULT 'Queued' NOT NULL,
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);

-- 28. AUTOMATION RULES
CREATE TABLE IF NOT EXISTS automation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    name VARCHAR(150) NOT NULL,
    event_trigger VARCHAR(100) CHECK (event_trigger IN ('Admission', 'Attendance', 'Payment', 'Exam', 'Assignment', 'Birthday', 'Announcement', 'Payroll', 'Library')) NOT NULL,
    condition_config JSONB DEFAULT '{}'::jsonb NOT NULL,
    action_channel VARCHAR(50) NOT NULL, -- 'WhatsApp', 'Email', 'SMS', 'Push'
    template_id UUID REFERENCES notification_templates(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);

-- 29. AUTOMATION HISTORIES
CREATE TABLE IF NOT EXISTS automation_histories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    rule_id UUID REFERENCES automation_rules(id) ON DELETE CASCADE NOT NULL,
    trigger_event VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100) NOT NULL, -- e.g. student_id, payment_id
    status VARCHAR(50) DEFAULT 'SUCCESS' NOT NULL,
    action_taken VARCHAR(255) NOT NULL,
    execution_log TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);

-- 30. DELIVERY STATISTICS
CREATE TABLE IF NOT EXISTS delivery_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    channel_name VARCHAR(50) NOT NULL,
    sent_count INTEGER DEFAULT 0 NOT NULL,
    delivered_count INTEGER DEFAULT 0 NOT NULL,
    read_count INTEGER DEFAULT 0 NOT NULL,
    failed_count INTEGER DEFAULT 0 NOT NULL,
    cost DECIMAL(10, 4) DEFAULT 0.0000 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    CONSTRAINT uq_tenant_date_channel UNIQUE (tenant_id, date, channel_name)
);

-- 31. COMMUNICATION AUDITS
CREATE TABLE IF NOT EXISTS communication_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_comm_audit_tenant ON communication_audits(tenant_id) WHERE deleted_at IS NULL;
