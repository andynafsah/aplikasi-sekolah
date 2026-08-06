-- Supabase PostgreSQL Migration for ERP SaaS Multi-Tenant (Sprint 1 - Core Foundations)

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TENANTS TABLE
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE NOT NULL CHECK (subdomain ~* '^[a-z0-9-]+$'),
    type VARCHAR(50) NOT NULL CHECK (type IN ('SEKOLAH', 'PONDOK', 'KEDUA')),
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL CHECK (status IN ('ACTIVE', 'SUSPENDED', 'TRIAL')),
    logo_url TEXT,
    address TEXT,
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    deleted_by VARCHAR(100),
    version INTEGER DEFAULT 1 NOT NULL
);

-- 2. ROLES TABLE
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    deleted_by VARCHAR(100),
    version INTEGER DEFAULT 1 NOT NULL,
    CONSTRAINT unique_tenant_role_code UNIQUE (tenant_id, code)
);

-- 3. PERMISSIONS TABLE
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    code VARCHAR(100) UNIQUE NOT NULL,
    module VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    deleted_by VARCHAR(100),
    version INTEGER DEFAULT 1 NOT NULL
);

-- 4. ROLE PERMISSIONS TABLE (Pivot table)
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    deleted_by VARCHAR(100),
    version INTEGER DEFAULT 1 NOT NULL,
    CONSTRAINT unique_tenant_role_permission UNIQUE (tenant_id, role_id, permission_id)
);

-- 5. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    email VARCHAR(100) NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    username VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    deleted_by VARCHAR(100),
    version INTEGER DEFAULT 1 NOT NULL,
    CONSTRAINT unique_tenant_email UNIQUE (tenant_id, email),
    CONSTRAINT unique_tenant_username UNIQUE (tenant_id, username)
);

-- 6. SESSIONS TABLE
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ip_address VARCHAR(50),
    user_agent TEXT,
    remember_me BOOLEAN DEFAULT FALSE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) NOT NULL,
    updated_by VARCHAR(100) NOT NULL,
    deleted_by VARCHAR(100),
    version INTEGER DEFAULT 1 NOT NULL
);

-- 7. REFRESH TOKENS TABLE
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) NOT NULL,
    updated_by VARCHAR(100) NOT NULL,
    deleted_by VARCHAR(100),
    version INTEGER DEFAULT 1 NOT NULL
);

-- 8. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    module VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    old_value JSONB DEFAULT '{}'::jsonb,
    new_value JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(50),
    browser VARCHAR(100),
    device VARCHAR(100),
    user_agent TEXT,
    created_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Seed Initial Tenants and System Data
INSERT INTO tenants (id, name, subdomain, type, status)
VALUES ('tenant-1'::uuid, 'SMA Unggulan Nusantara', 'sma-unggulan', 'SEKOLAH', 'ACTIVE')
ON CONFLICT (subdomain) DO NOTHING;

INSERT INTO tenants (id, name, subdomain, type, status)
VALUES ('tenant-2'::uuid, 'Pondok Pesantren Daarul Qur''an', 'daarul-quran', 'PONDOK', 'ACTIVE')
ON CONFLICT (subdomain) DO NOTHING;

-- Seed Default Roles
INSERT INTO roles (id, tenant_id, name, code, description)
VALUES ('role-superadmin'::uuid, 'tenant-1', 'Super Administrator', 'SUPER_ADMIN', 'Global Super Administrator')
ON CONFLICT (tenant_id, code) DO NOTHING;

INSERT INTO roles (id, tenant_id, name, code, description)
VALUES ('role-tenantadmin'::uuid, 'tenant-1', 'Tenant Administrator', 'TENANT_ADMIN', 'Tenant Administrator')
ON CONFLICT (tenant_id, code) DO NOTHING;

-- Seed Base Permissions
INSERT INTO permissions (name, code, module, description)
VALUES 
('Create User', 'user:create', 'User Management', 'Allows creating new users'),
('Read User', 'user:read', 'User Management', 'Allows reading user information'),
('Update User', 'user:update', 'User Management', 'Allows updating user details'),
('Delete User', 'user:delete', 'User Management', 'Allows deleting users'),
('Write Tenant Settings', 'tenant:settings:write', 'Tenant Settings', 'Allows updating tenant settings')
ON CONFLICT (code) DO NOTHING;

-- Seed Admin User (Password 'password123' simulation hash)
INSERT INTO users (id, tenant_id, email, username, password_hash, name, role_id, status)
VALUES 
('user-1'::uuid, 'tenant-1'::uuid, 'admin@sma.com', 'admin_sma', 'password123', 'Budi Raharjo, M.Pd.', 'role-superadmin'::uuid, 'ACTIVE')
ON CONFLICT (tenant_id, email) DO NOTHING;

-- Create Indexes for Tenant Isolation
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_roles_tenant ON roles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_tenant ON role_permissions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sessions_tenant ON sessions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_tenant ON refresh_tokens(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant ON audit_logs(tenant_id);

-- Enable RLS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY tenant_isolation_tenants ON tenants 
    FOR ALL USING (id = current_setting('app.current_tenant', true)::uuid);

CREATE POLICY tenant_isolation_users ON users 
    FOR ALL USING (tenant_id = current_setting('app.current_tenant', true));

CREATE POLICY tenant_isolation_roles ON roles 
    FOR ALL USING (tenant_id = current_setting('app.current_tenant', true));

CREATE POLICY tenant_isolation_role_permissions ON role_permissions 
    FOR ALL USING (tenant_id = current_setting('app.current_tenant', true));

CREATE POLICY tenant_isolation_sessions ON sessions 
    FOR ALL USING (tenant_id = current_setting('app.current_tenant', true));

CREATE POLICY tenant_isolation_refresh_tokens ON refresh_tokens 
    FOR ALL USING (tenant_id = current_setting('app.current_tenant', true));

CREATE POLICY tenant_isolation_audit_logs ON audit_logs 
    FOR ALL USING (tenant_id = current_setting('app.current_tenant', true));
