-- ============================================================================
-- SPRINT 28: ENTERPRISE SYSTEM SETTINGS, PLATFORM CONFIG & WHITE LABEL
-- DATABASE SCHEMA FOR SUPABASE / POSTGRESQL
-- ============================================================================

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SYSTEM SETTING CATEGORIES
CREATE TABLE IF NOT EXISTS system_setting_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255), -- NULL means global
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    CONSTRAINT uq_sys_set_cat_code UNIQUE (tenant_id, code)
);

-- 2. SYSTEM SETTING GROUPS
CREATE TABLE IF NOT EXISTS system_setting_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255),
    category_id UUID NOT NULL REFERENCES system_setting_categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    CONSTRAINT uq_sys_set_group_code UNIQUE (tenant_id, category_id, code)
);

-- 3. SYSTEM SETTINGS (Configuration Registry)
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255),
    group_id UUID NOT NULL REFERENCES system_setting_groups(id) ON DELETE CASCADE,
    key_name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    value_type VARCHAR(50) NOT NULL CHECK (value_type IN ('string', 'number', 'boolean', 'json', 'encrypted')),
    default_value TEXT,
    is_encrypted BOOLEAN DEFAULT FALSE NOT NULL,
    is_read_only BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    CONSTRAINT uq_sys_set_key UNIQUE (tenant_id, group_id, key_name)
);

-- 4. SYSTEM SETTING VALUES
CREATE TABLE IF NOT EXISTS system_setting_values (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255),
    setting_id UUID NOT NULL REFERENCES system_settings(id) ON DELETE CASCADE,
    value_text TEXT,
    encrypted_value TEXT, -- Encrypted block for keys/secrets
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    CONSTRAINT uq_sys_set_value_setting UNIQUE (tenant_id, setting_id)
);

-- 5. SYSTEM SETTING HISTORIES
CREATE TABLE IF NOT EXISTS system_setting_histories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255),
    setting_id UUID NOT NULL REFERENCES system_settings(id) ON DELETE CASCADE,
    old_value TEXT,
    new_value TEXT,
    change_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 6. TENANT SETTINGS & OVERRIDES
CREATE TABLE IF NOT EXISTS tenant_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL UNIQUE,
    app_title VARCHAR(255) NOT NULL,
    version VARCHAR(50) DEFAULT '1.0.0' NOT NULL,
    timezone VARCHAR(100) DEFAULT 'Asia/Jakarta' NOT NULL,
    locale VARCHAR(50) DEFAULT 'id-ID' NOT NULL,
    currency VARCHAR(10) DEFAULT 'IDR' NOT NULL,
    date_format VARCHAR(50) DEFAULT 'DD/MM/YYYY' NOT NULL,
    number_format VARCHAR(50) DEFAULT 'id-ID' NOT NULL,
    app_mode VARCHAR(50) DEFAULT 'Production' NOT NULL CHECK (app_mode IN ('Cloud SaaS', 'On Premise', 'Offline', 'Hybrid', 'Development', 'Staging', 'Production')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 7. TENANT DOMAINS (White Label Domains)
CREATE TABLE IF NOT EXISTS tenant_domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    custom_domain VARCHAR(255) NOT NULL,
    is_ssl_enabled BOOLEAN DEFAULT TRUE NOT NULL,
    status VARCHAR(50) DEFAULT 'Active' NOT NULL CHECK (status IN ('Pending', 'Verifying', 'Active', 'Failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    CONSTRAINT uq_tenant_custom_domain UNIQUE (custom_domain)
);

-- 8. TENANT BRANDINGS
CREATE TABLE IF NOT EXISTS tenant_brandings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL UNIQUE,
    primary_color VARCHAR(50) DEFAULT '#4F46E5' NOT NULL,
    secondary_color VARCHAR(50) DEFAULT '#0F172A' NOT NULL,
    accent_color VARCHAR(50) DEFAULT '#F59E0B' NOT NULL,
    dark_mode_enabled BOOLEAN DEFAULT FALSE NOT NULL,
    logo_url VARCHAR(512),
    favicon_url VARCHAR(512),
    login_bg_url VARCHAR(512),
    email_template TEXT,
    pdf_template TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 9. FEATURE FLAGS & RULES
CREATE TABLE IF NOT EXISTS feature_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255), -- NULL represents global flags
    flag_key VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_enabled BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    CONSTRAINT uq_feature_flag_key UNIQUE (tenant_id, flag_key)
);

CREATE TABLE IF NOT EXISTS feature_flag_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255),
    flag_id UUID NOT NULL REFERENCES feature_flags(id) ON DELETE CASCADE,
    rule_type VARCHAR(100) NOT NULL CHECK (rule_type IN ('RoleBased', 'UserPercentage', 'DateRange', 'Custom')),
    rule_criteria JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 10. ENVIRONMENT PROFILES
CREATE TABLE IF NOT EXISTS environment_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255),
    profile_name VARCHAR(100) NOT NULL, -- e.g. 'Development', 'Staging', 'Production'
    is_active BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS environment_variables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255),
    profile_id UUID NOT NULL REFERENCES environment_profiles(id) ON DELETE CASCADE,
    var_key VARCHAR(255) NOT NULL,
    var_value TEXT,
    is_secret BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    CONSTRAINT uq_env_var_key UNIQUE (profile_id, var_key)
);

-- 11. STORAGE PROVIDERS & CONNECTIONS
CREATE TABLE IF NOT EXISTS storage_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255),
    provider_name VARCHAR(100) NOT NULL CHECK (provider_name IN ('Supabase Storage', 'Google Cloud Storage', 'Amazon S3', 'Cloudflare R2', 'MinIO', 'Local Storage Ready')),
    config_details JSONB NOT NULL,
    is_default BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 12. NOTIFICATION PROVIDERS
CREATE TABLE IF NOT EXISTS notification_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255),
    provider_type VARCHAR(100) NOT NULL CHECK (provider_type IN ('WhatsApp', 'SMTP', 'Firebase', 'Telegram', 'Discord', 'Slack')),
    config_details JSONB NOT NULL,
    is_enabled BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 13. PAYMENT GATEWAY PROVIDERS
CREATE TABLE IF NOT EXISTS payment_gateway_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255),
    provider_name VARCHAR(100) NOT NULL CHECK (provider_name IN ('Midtrans', 'Xendit', 'DOKU', 'Stripe', 'PayPal', 'Manual Transfer')),
    config_details JSONB NOT NULL,
    is_enabled BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 14. AI GATEWAY PROVIDERS
CREATE TABLE IF NOT EXISTS ai_gateway_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255),
    provider_name VARCHAR(100) NOT NULL CHECK (provider_name IN ('Gemini', 'OpenAI', 'Claude', 'DeepSeek', 'OpenRouter', 'Ollama')),
    config_details JSONB NOT NULL,
    is_enabled BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 15. SECURITY POLICIES & POLICIES
CREATE TABLE IF NOT EXISTS security_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    enable_mfa BOOLEAN DEFAULT FALSE NOT NULL,
    session_timeout_minutes INT DEFAULT 30 NOT NULL,
    max_login_attempts INT DEFAULT 5 NOT NULL,
    password_min_length INT DEFAULT 8 NOT NULL,
    require_uppercase BOOLEAN DEFAULT TRUE NOT NULL,
    require_numbers BOOLEAN DEFAULT TRUE NOT NULL,
    require_special_characters BOOLEAN DEFAULT TRUE NOT NULL,
    ip_whitelist TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 16. MAINTENANCE WINDOWS & ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS maintenance_windows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS system_announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 17. LICENSE MANAGEMENT
CREATE TABLE IF NOT EXISTS license_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    license_key VARCHAR(255) NOT NULL,
    tier VARCHAR(100) NOT NULL, -- e.g. 'Standard', 'Premium', 'Enterprise'
    status VARCHAR(50) NOT NULL CHECK (status IN ('Active', 'Expired', 'Suspended')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    max_users INT DEFAULT 100 NOT NULL,
    max_storage_gb INT DEFAULT 10 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 18. SYSTEM HEALTH CHECKS
CREATE TABLE IF NOT EXISTS system_health_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255),
    service_name VARCHAR(100) NOT NULL, -- e.g. 'Database', 'Storage', 'Notification API'
    status VARCHAR(50) NOT NULL CHECK (status IN ('Healthy', 'Warning', 'Unhealthy')),
    response_time_ms INT,
    last_checked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 19. CONFIGURATION BACKUPS & RESTORES
CREATE TABLE IF NOT EXISTS configuration_backups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255),
    backup_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(512) NOT NULL,
    file_size_bytes INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);
