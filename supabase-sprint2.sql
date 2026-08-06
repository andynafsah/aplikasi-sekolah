-- Supabase PostgreSQL Migration for ERP SaaS Multi-Tenant (Sprint 2)

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PLANS TABLE
CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_plan VARCHAR(100) UNIQUE NOT NULL,
    harga NUMERIC NOT NULL CHECK (harga >= 0),
    maksimal_siswa INTEGER NOT NULL CHECK (maksimal_siswa >= 0),
    maksimal_guru INTEGER NOT NULL CHECK (maksimal_guru >= 0),
    maksimal_storage BIGINT NOT NULL CHECK (maksimal_storage >= 0),
    fitur JSONB NOT NULL DEFAULT '[]'::jsonb,
    aktif BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);

-- Seed Plans
INSERT INTO plans (nama_plan, harga, maksimal_siswa, maksimal_guru, maksimal_storage, fitur, aktif)
VALUES 
('Starter', 500000, 150, 15, 5368709120, '["KBM & Akademik", "Keuangan SPP Dasar"]'::jsonb, TRUE)
ON CONFLICT (nama_plan) DO UPDATE SET 
    harga = EXCLUDED.harga,
    maksimal_siswa = EXCLUDED.maksimal_siswa,
    maksimal_guru = EXCLUDED.maksimal_guru,
    maksimal_storage = EXCLUDED.maksimal_storage,
    fitur = EXCLUDED.fitur;

INSERT INTO plans (nama_plan, harga, maksimal_siswa, maksimal_guru, maksimal_storage, fitur, aktif)
VALUES 
('Professional', 1500000, 1000, 80, 26843545600, '["KBM & Akademik", "Keuangan SPP Lengkap", "Asrama & Kamar", "Sistem Perizinan"]'::jsonb, TRUE)
ON CONFLICT (nama_plan) DO UPDATE SET 
    harga = EXCLUDED.harga,
    maksimal_siswa = EXCLUDED.maksimal_siswa,
    maksimal_guru = EXCLUDED.maksimal_guru,
    maksimal_storage = EXCLUDED.maksimal_storage,
    fitur = EXCLUDED.fitur;

INSERT INTO plans (nama_plan, harga, maksimal_siswa, maksimal_guru, maksimal_storage, fitur, aktif)
VALUES 
('Enterprise', 5000000, 9999, 999, 107374182400, '["KBM & Akademik", "Keuangan SPP Lengkap & Neraca", "Asrama & Kamar", "Sistem Perizinan", "Multi-Unit", "Custom Domain"]'::jsonb, TRUE)
ON CONFLICT (nama_plan) DO UPDATE SET 
    harga = EXCLUDED.harga,
    maksimal_siswa = EXCLUDED.maksimal_siswa,
    maksimal_guru = EXCLUDED.maksimal_guru,
    maksimal_storage = EXCLUDED.maksimal_storage,
    fitur = EXCLUDED.fitur;


-- 2. SCHOOLS TABLE (School Profile per Tenant)
CREATE TABLE IF NOT EXISTS schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    nama_yayasan VARCHAR(255),
    nama_sekolah VARCHAR(255) NOT NULL,
    npsn VARCHAR(50),
    nsm VARCHAR(50),
    akreditasi VARCHAR(10) CHECK (akreditasi IN ('A', 'B', 'C', 'TT', 'UNGGUL')),
    nomor_izin VARCHAR(100),
    tanggal_berdiri DATE,
    email VARCHAR(100) CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    website VARCHAR(100),
    telepon VARCHAR(50),
    whatsapp VARCHAR(50),
    facebook VARCHAR(100),
    instagram VARCHAR(100),
    youtube VARCHAR(100),
    alamat TEXT NOT NULL,
    provinsi VARCHAR(100) NOT NULL,
    kabupaten VARCHAR(100) NOT NULL,
    kecamatan VARCHAR(100) NOT NULL,
    kelurahan VARCHAR(100),
    kode_pos VARCHAR(20),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) NOT NULL,
    updated_by VARCHAR(100) NOT NULL,
    CONSTRAINT unique_tenant_school UNIQUE (tenant_id)
);


-- 3. SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL UNIQUE,
    plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL CHECK (end_date >= start_date),
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL CHECK (status IN ('ACTIVE', 'EXPIRED', 'PENDING_PAYMENT', 'CANCELLED', 'TRIAL')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) NOT NULL,
    updated_by VARCHAR(100) NOT NULL
);


-- 4. SCHOOL UNITS TABLE
CREATE TABLE IF NOT EXISTS school_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    nama_unit VARCHAR(100) NOT NULL, -- e.g. "SD IT", "SMP", "MTs", "SMA"
    kode VARCHAR(50) NOT NULL, -- e.g. "SD", "SMP", "MTS", "SMA"
    jenjang VARCHAR(50) NOT NULL, -- e.g. "SD", "SMP", "SMA", "PESANTREN"
    kepala_unit VARCHAR(150),
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) NOT NULL,
    updated_by VARCHAR(100) NOT NULL,
    CONSTRAINT unique_tenant_unit_kode UNIQUE (tenant_id, kode)
);


-- 5. TENANT DOMAINS TABLE
CREATE TABLE IF NOT EXISTS tenant_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL UNIQUE,
    subdomain VARCHAR(100) UNIQUE NOT NULL CHECK (subdomain ~* '^[a-z0-9-]+$'),
    custom_domain VARCHAR(255) UNIQUE CHECK (custom_domain ~* '^[a-z0-9.-]+\.[a-z]{2,}$'),
    ssl_status VARCHAR(50) DEFAULT 'PENDING' NOT NULL CHECK (ssl_status IN ('PENDING', 'ACTIVE', 'FAILED')),
    verified BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) NOT NULL,
    updated_by VARCHAR(100) NOT NULL
);


-- 6. TENANT SETTINGS TABLE
CREATE TABLE IF NOT EXISTS tenant_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL UNIQUE,
    timezone VARCHAR(50) DEFAULT 'Asia/Jakarta' NOT NULL,
    bahasa VARCHAR(10) DEFAULT 'id' NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL CHECK (status IN ('ACTIVE', 'SUSPENDED', 'TRIAL')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) NOT NULL,
    updated_by VARCHAR(100) NOT NULL
);


-- 7. BRANDING TABLE
CREATE TABLE IF NOT EXISTS branding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL UNIQUE,
    logo TEXT, -- Base64 or Image URL
    logo_mini TEXT,
    favicon TEXT,
    primary_color VARCHAR(30) DEFAULT '#3b82f6' NOT NULL,
    secondary_color VARCHAR(30) DEFAULT '#14b8a6' NOT NULL,
    sidebar_color VARCHAR(30) DEFAULT '#1e293b' NOT NULL,
    background_login TEXT, -- URL or Base64
    footer TEXT,
    copyright VARCHAR(255) DEFAULT '© Copyright School ERP SaaS' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) NOT NULL,
    updated_by VARCHAR(100) NOT NULL
);


-- 8. SETUP WIZARD TABLE
CREATE TABLE IF NOT EXISTS setup_wizard (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL UNIQUE,
    current_step INTEGER DEFAULT 1 NOT NULL CHECK (current_step BETWEEN 1 AND 6),
    completed BOOLEAN DEFAULT FALSE NOT NULL,
    wizard_data JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) NOT NULL,
    updated_by VARCHAR(100) NOT NULL
);


-- Create Indexing for Fast Querying under Tenant Isolation
CREATE INDEX IF NOT EXISTS idx_schools_tenant ON schools(tenant_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_tenant ON subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_school_units_tenant ON school_units(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_domains_tenant ON tenant_domains(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_settings_tenant ON tenant_settings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_branding_tenant ON branding(tenant_id);
CREATE INDEX IF NOT EXISTS idx_setup_wizard_tenant ON setup_wizard(tenant_id);

-- Enable Row Level Security (RLS) on all tables for strict tenant isolation
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE setup_wizard ENABLE ROW LEVEL SECURITY;

-- Create Policies for RLS (assuming auth.uid() can be resolved or tenant claim exists in JWT)
CREATE POLICY tenant_isolation_schools ON schools 
    FOR ALL USING (tenant_id = current_setting('app.current_tenant', true));

CREATE POLICY tenant_isolation_subscriptions ON subscriptions 
    FOR ALL USING (tenant_id = current_setting('app.current_tenant', true));

CREATE POLICY tenant_isolation_school_units ON school_units 
    FOR ALL USING (tenant_id = current_setting('app.current_tenant', true));

CREATE POLICY tenant_isolation_tenant_domains ON tenant_domains 
    FOR ALL USING (tenant_id = current_setting('app.current_tenant', true));

CREATE POLICY tenant_isolation_tenant_settings ON tenant_settings 
    FOR ALL USING (tenant_id = current_setting('app.current_tenant', true));

CREATE POLICY tenant_isolation_branding ON branding 
    FOR ALL USING (tenant_id = current_setting('app.current_tenant', true));

CREATE POLICY tenant_isolation_setup_wizard ON setup_wizard 
    FOR ALL USING (tenant_id = current_setting('app.current_tenant', true));
