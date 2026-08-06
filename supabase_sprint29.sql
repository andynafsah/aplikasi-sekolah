-- Enterprise Database Management SQL Script for Supabase / PostgreSQL
-- Sprint 29: Database Management, Backup, Restore, Migration and Connection Manager

-- Enable UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. database_settings
CREATE TABLE IF NOT EXISTS database_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NULL,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    created_by VARCHAR(100) NULL,
    updated_by VARCHAR(100) NULL,
    CONSTRAINT check_setting_key_not_empty CHECK (char_length(setting_key) > 0)
);

CREATE INDEX IF NOT EXISTS idx_db_settings_tenant ON database_settings(tenant_id) WHERE deleted_at IS NULL;

-- 2. database_providers
CREATE TABLE IF NOT EXISTS database_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NULL,
    provider_name VARCHAR(100) NOT NULL,
    provider_type VARCHAR(50) NOT NULL, -- e.g., 'SUPABASE_POSTGRES', 'POSTGRESQL', 'GOOGLE_CLOUD_SQL', 'NEON_POSTGRES', 'SELF_HOSTED_POSTGRES'
    is_active BOOLEAN DEFAULT true,
    logo_url VARCHAR(255) NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    created_by VARCHAR(100) NULL,
    updated_by VARCHAR(100) NULL,
    CONSTRAINT uq_provider_name_tenant UNIQUE(tenant_id, provider_name),
    CONSTRAINT check_provider_type CHECK (provider_type IN ('SUPABASE_POSTGRES', 'POSTGRESQL', 'GOOGLE_CLOUD_SQL', 'NEON_POSTGRES', 'SELF_HOSTED_POSTGRES', 'FUTURE_PROVIDER'))
);

CREATE INDEX IF NOT EXISTS idx_db_providers_tenant ON database_providers(tenant_id) WHERE deleted_at IS NULL;

-- 3. database_connections
CREATE TABLE IF NOT EXISTS database_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NULL,
    provider_id UUID NOT NULL REFERENCES database_providers(id) ON DELETE CASCADE,
    connection_name VARCHAR(100) NOT NULL,
    environment VARCHAR(50) NOT NULL DEFAULT 'production', -- e.g. production, staging, development
    host VARCHAR(255) NOT NULL,
    port INTEGER NOT NULL,
    database_name VARCHAR(100) NOT NULL,
    username VARCHAR(100) NOT NULL,
    encrypted_password TEXT NOT NULL,
    ssl_mode VARCHAR(50) DEFAULT 'require',
    is_active BOOLEAN DEFAULT true,
    connection_status VARCHAR(50) DEFAULT 'UNTESTED', -- UNTESTED, HEALTHY, WARNING, CRITICAL
    last_tested_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    created_by VARCHAR(100) NULL,
    updated_by VARCHAR(100) NULL,
    CONSTRAINT uq_conn_name_tenant UNIQUE(tenant_id, connection_name),
    CONSTRAINT check_port_range CHECK (port > 0 AND port <= 65535)
);

CREATE INDEX IF NOT EXISTS idx_db_connections_tenant ON database_connections(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_db_connections_provider ON database_connections(provider_id) WHERE deleted_at IS NULL;

-- 4. database_driver_configs
CREATE TABLE IF NOT EXISTS database_driver_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NULL,
    connection_id UUID NOT NULL REFERENCES database_connections(id) ON DELETE CASCADE,
    driver_name VARCHAR(100) NOT NULL, -- pg, tedious, mysql2, sqlite3
    driver_version VARCHAR(50) NULL,
    extra_options JSONB DEFAULT '{}'::jsonb,
    timeout_seconds INTEGER DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    created_by VARCHAR(100) NULL,
    updated_by VARCHAR(100) NULL,
    CONSTRAINT uq_driver_config_connection UNIQUE(connection_id),
    CONSTRAINT check_timeout_positive CHECK (timeout_seconds > 0)
);

-- 5. database_connection_pools
CREATE TABLE IF NOT EXISTS database_connection_pools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NULL,
    connection_id UUID NOT NULL REFERENCES database_connections(id) ON DELETE CASCADE,
    min_size INTEGER NOT NULL DEFAULT 2,
    max_size INTEGER NOT NULL DEFAULT 10,
    idle_timeout_ms INTEGER NOT NULL DEFAULT 30000,
    acquire_timeout_ms INTEGER NOT NULL DEFAULT 20000,
    active_connections INTEGER DEFAULT 0,
    idle_connections INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    created_by VARCHAR(100) NULL,
    updated_by VARCHAR(100) NULL,
    CONSTRAINT uq_pool_connection UNIQUE(connection_id),
    CONSTRAINT check_pool_sizes CHECK (min_size >= 0 AND max_size >= min_size)
);

-- 6. database_schemas
CREATE TABLE IF NOT EXISTS database_schemas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NULL,
    connection_id UUID NOT NULL REFERENCES database_connections(id) ON DELETE CASCADE,
    schema_name VARCHAR(100) NOT NULL,
    schema_definition JSONB NOT NULL, -- holds list of tables, views, triggers, columns
    version VARCHAR(50) NOT NULL DEFAULT '1.0.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    created_by VARCHAR(100) NULL,
    updated_by VARCHAR(100) NULL,
    CONSTRAINT uq_schema_name_connection UNIQUE(connection_id, schema_name)
);

-- 7. database_migrations
CREATE TABLE IF NOT EXISTS database_migrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NULL,
    connection_id UUID NOT NULL REFERENCES database_connections(id) ON DELETE CASCADE,
    version VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    sql_up TEXT NOT NULL,
    sql_down TEXT NOT NULL,
    is_executed BOOLEAN DEFAULT false,
    executed_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    created_by VARCHAR(100) NULL,
    updated_by VARCHAR(100) NULL,
    CONSTRAINT uq_migration_version_conn UNIQUE(connection_id, version)
);

CREATE INDEX IF NOT EXISTS idx_db_migrations_conn ON database_migrations(connection_id) WHERE deleted_at IS NULL;

-- 8. database_migration_logs
CREATE TABLE IF NOT EXISTS database_migration_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NULL,
    migration_id UUID NOT NULL REFERENCES database_migrations(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL, -- UP, DOWN
    status VARCHAR(50) NOT NULL, -- SUCCESS, FAILED
    error_message TEXT,
    execution_time_ms INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    created_by VARCHAR(100) NULL,
    updated_by VARCHAR(100) NULL,
    CONSTRAINT check_action_type CHECK (action_type IN ('UP', 'DOWN')),
    CONSTRAINT check_status CHECK (status IN ('SUCCESS', 'FAILED'))
);

-- 9. database_seeders
CREATE TABLE IF NOT EXISTS database_seeders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NULL,
    connection_id UUID NOT NULL REFERENCES database_connections(id) ON DELETE CASCADE,
    seeder_name VARCHAR(100) NOT NULL,
    description TEXT,
    seeder_content TEXT NOT NULL, -- SQL inserts or data objects
    last_run_at TIMESTAMP WITH TIME ZONE NULL,
    run_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, SUCCESS, FAILED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    created_by VARCHAR(100) NULL,
    updated_by VARCHAR(100) NULL,
    CONSTRAINT uq_seeder_name_conn UNIQUE(connection_id, seeder_name)
);

-- 10. database_backup_jobs
CREATE TABLE IF NOT EXISTS database_backup_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NULL,
    connection_id UUID NOT NULL REFERENCES database_connections(id) ON DELETE CASCADE,
    job_name VARCHAR(150) NOT NULL,
    backup_type VARCHAR(50) NOT NULL, -- MANUAL, AUTOMATIC, INCREMENTAL, FULL
    schedule_cron VARCHAR(100) NULL, -- for automatic/scheduled
    is_active BOOLEAN DEFAULT true,
    last_run_at TIMESTAMP WITH TIME ZONE NULL,
    next_run_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    created_by VARCHAR(100) NULL,
    updated_by VARCHAR(100) NULL,
    CONSTRAINT check_backup_type CHECK (backup_type IN ('MANUAL', 'AUTOMATIC', 'INCREMENTAL', 'FULL'))
);

-- 11. database_backup_files
CREATE TABLE IF NOT EXISTS database_backup_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NULL,
    backup_job_id UUID NULL REFERENCES database_backup_jobs(id) ON DELETE SET NULL,
    connection_id UUID NOT NULL REFERENCES database_connections(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    file_url TEXT NULL,
    backup_type VARCHAR(50) NOT NULL, -- MANUAL, AUTOMATIC, INCREMENTAL, FULL
    storage_provider_id UUID NULL, -- link to storage provider from sprint 28
    status VARCHAR(50) NOT NULL, -- COMPLETED, FAILED, RUNNING
    checksum VARCHAR(100) NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    created_by VARCHAR(100) NULL,
    updated_by VARCHAR(100) NULL,
    CONSTRAINT check_backup_file_status CHECK (status IN ('COMPLETED', 'FAILED', 'RUNNING'))
);

CREATE INDEX IF NOT EXISTS idx_db_backup_files_conn ON database_backup_files(connection_id) WHERE deleted_at IS NULL;

-- 12. database_restore_jobs
CREATE TABLE IF NOT EXISTS database_restore_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NULL,
    connection_id UUID NOT NULL REFERENCES database_connections(id) ON DELETE CASCADE,
    backup_file_id UUID NULL REFERENCES database_backup_files(id) ON DELETE SET NULL,
    restore_type VARCHAR(50) NOT NULL, -- POINT_IN_TIME, FULL_RESTORE, SELECTIVE_RESTORE
    point_in_time_target TIMESTAMP WITH TIME ZONE NULL,
    status VARCHAR(50) NOT NULL, -- PENDING, IN_PROGRESS, COMPLETED, FAILED
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE NULL,
    completed_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    created_by VARCHAR(100) NULL,
    updated_by VARCHAR(100) NULL,
    CONSTRAINT check_restore_type CHECK (restore_type IN ('POINT_IN_TIME', 'FULL_RESTORE', 'SELECTIVE_RESTORE')),
    CONSTRAINT check_restore_status CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED'))
);

-- 13. database_import_jobs
CREATE TABLE IF NOT EXISTS database_import_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NULL,
    connection_id UUID NOT NULL REFERENCES database_connections(id) ON DELETE CASCADE,
    import_type VARCHAR(50) NOT NULL, -- SQL, CSV, EXCEL, JSON
    target_table VARCHAR(100) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL, -- PENDING, RUNNING, COMPLETED, FAILED
    rows_imported INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    created_by VARCHAR(100) NULL,
    updated_by VARCHAR(100) NULL,
    CONSTRAINT check_import_type CHECK (import_type IN ('SQL', 'CSV', 'EXCEL', 'JSON')),
    CONSTRAINT check_import_status CHECK (status IN ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED'))
);

-- 14. database_export_jobs
CREATE TABLE IF NOT EXISTS database_export_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NULL,
    connection_id UUID NOT NULL REFERENCES database_connections(id) ON DELETE CASCADE,
    export_type VARCHAR(50) NOT NULL, -- SQL, CSV, EXCEL, JSON
    source_table VARCHAR(100) NULL, -- null means full DB or selective schema
    status VARCHAR(50) NOT NULL, -- PENDING, RUNNING, COMPLETED, FAILED
    file_url TEXT NULL,
    rows_exported INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    created_by VARCHAR(100) NULL,
    updated_by VARCHAR(100) NULL,
    CONSTRAINT check_export_type CHECK (export_type IN ('SQL', 'CSV', 'EXCEL', 'JSON')),
    CONSTRAINT check_export_status CHECK (status IN ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED'))
);

-- 15. database_query_histories
CREATE TABLE IF NOT EXISTS database_query_histories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NULL,
    connection_id UUID NOT NULL REFERENCES database_connections(id) ON DELETE CASCADE,
    query_text TEXT NOT NULL,
    execution_time_ms INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL, -- SUCCESS, FAILED
    error_message TEXT,
    rows_affected INTEGER DEFAULT 0,
    executed_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    created_by VARCHAR(100) NULL,
    updated_by VARCHAR(100) NULL,
    CONSTRAINT check_query_status CHECK (status IN ('SUCCESS', 'FAILED'))
);

CREATE INDEX IF NOT EXISTS idx_db_query_history_conn ON database_query_histories(connection_id) WHERE deleted_at IS NULL;

-- 16. database_saved_queries
CREATE TABLE IF NOT EXISTS database_saved_queries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NULL,
    connection_id UUID NOT NULL REFERENCES database_connections(id) ON DELETE CASCADE,
    query_title VARCHAR(150) NOT NULL,
    query_text TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    created_by VARCHAR(100) NULL,
    updated_by VARCHAR(100) NULL,
    CONSTRAINT uq_saved_query_title UNIQUE (connection_id, query_title)
);

-- 17. database_query_profiles
CREATE TABLE IF NOT EXISTS database_query_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NULL,
    connection_id UUID NOT NULL REFERENCES database_connections(id) ON DELETE CASCADE,
    query_text TEXT NOT NULL,
    explain_plan JSONB NULL,
    read_iops INTEGER DEFAULT 0,
    write_iops INTEGER DEFAULT 0,
    cpu_utilization_percent NUMERIC(5,2) DEFAULT 0.00,
    memory_mb NUMERIC(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    created_by VARCHAR(100) NULL,
    updated_by VARCHAR(100) NULL
);

-- 18. database_health_checks
CREATE TABLE IF NOT EXISTS database_health_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NULL,
    connection_id UUID NOT NULL REFERENCES database_connections(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL, -- HEALTHY, WARNING, CRITICAL
    latency_ms INTEGER NOT NULL,
    connection_pool_usage_percent NUMERIC(5,2) DEFAULT 0.00,
    is_read_only BOOLEAN DEFAULT false,
    details JSONB NULL,
    last_checked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    created_by VARCHAR(100) NULL,
    updated_by VARCHAR(100) NULL,
    CONSTRAINT check_health_status CHECK (status IN ('HEALTHY', 'WARNING', 'CRITICAL'))
);

CREATE INDEX IF NOT EXISTS idx_db_health_conn ON database_health_checks(connection_id) WHERE deleted_at IS NULL;

-- 19. database_indexes
CREATE TABLE IF NOT EXISTS database_indexes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NULL,
    connection_id UUID NOT NULL REFERENCES database_connections(id) ON DELETE CASCADE,
    table_name VARCHAR(100) NOT NULL,
    index_name VARCHAR(100) NOT NULL,
    index_definition TEXT NOT NULL,
    is_unique BOOLEAN DEFAULT false,
    size_bytes BIGINT DEFAULT 0,
    usage_count BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    created_by VARCHAR(100) NULL,
    updated_by VARCHAR(100) NULL,
    CONSTRAINT uq_conn_index_name UNIQUE (connection_id, index_name)
);

-- 20. database_statistics
CREATE TABLE IF NOT EXISTS database_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NULL,
    connection_id UUID NOT NULL REFERENCES database_connections(id) ON DELETE CASCADE,
    stat_key VARCHAR(100) NOT NULL,
    stat_value NUMERIC(15,4) NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    created_by VARCHAR(100) NULL,
    updated_by VARCHAR(100) NULL
);

-- 21. database_scheduler_jobs
CREATE TABLE IF NOT EXISTS database_scheduler_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NULL,
    connection_id UUID NOT NULL REFERENCES database_connections(id) ON DELETE CASCADE,
    job_name VARCHAR(150) NOT NULL,
    job_type VARCHAR(100) NOT NULL, -- BACKUP, MIGRATION_CHECK, STATISTICS_COLLECT, INDEX_REBUILD
    cron_expression VARCHAR(100) NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    last_fired_at TIMESTAMP WITH TIME ZONE NULL,
    next_fired_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    created_by VARCHAR(100) NULL,
    updated_by VARCHAR(100) NULL
);

-- 22. database_replication_profiles
CREATE TABLE IF NOT EXISTS database_replication_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NULL,
    connection_id UUID NOT NULL REFERENCES database_connections(id) ON DELETE CASCADE,
    replication_name VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL, -- MASTER, REPLICA
    replica_count INTEGER DEFAULT 0,
    lag_bytes BIGINT DEFAULT 0,
    replication_status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, DELAYED, DISCONNECTED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    created_by VARCHAR(100) NULL,
    updated_by VARCHAR(100) NULL,
    CONSTRAINT check_replication_role CHECK (role IN ('MASTER', 'REPLICA'))
);

-- 23. database_failover_profiles
CREATE TABLE IF NOT EXISTS database_failover_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NULL,
    connection_id UUID NOT NULL REFERENCES database_connections(id) ON DELETE CASCADE,
    primary_host VARCHAR(255) NOT NULL,
    replica_host VARCHAR(255) NOT NULL,
    failover_status VARCHAR(50) DEFAULT 'STANDBY', -- STANDBY, FAILED_OVER, FAILING_BACK
    last_failover_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    created_by VARCHAR(100) NULL,
    updated_by VARCHAR(100) NULL
);

-- 24. database_storage_usage
CREATE TABLE IF NOT EXISTS database_storage_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NULL,
    connection_id UUID NOT NULL REFERENCES database_connections(id) ON DELETE CASCADE,
    allocated_bytes BIGINT NOT NULL,
    used_bytes BIGINT NOT NULL,
    index_bytes BIGINT NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    created_by VARCHAR(100) NULL,
    updated_by VARCHAR(100) NULL
);

-- 25. database_logs
CREATE TABLE IF NOT EXISTS database_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NULL,
    connection_id UUID NOT NULL REFERENCES database_connections(id) ON DELETE CASCADE,
    log_level VARCHAR(50) NOT NULL, -- INFO, WARNING, ERROR, FATAL
    message TEXT NOT NULL,
    context JSONB NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    created_by VARCHAR(100) NULL,
    updated_by VARCHAR(100) NULL
);

CREATE INDEX IF NOT EXISTS idx_db_logs_level ON database_logs(log_level) WHERE deleted_at IS NULL;

-- 26. database_alerts
CREATE TABLE IF NOT EXISTS database_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NULL,
    connection_id UUID NOT NULL REFERENCES database_connections(id) ON DELETE CASCADE,
    alert_name VARCHAR(150) NOT NULL,
    severity VARCHAR(50) NOT NULL, -- INFO, WARNING, CRITICAL
    message TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    created_by VARCHAR(100) NULL,
    updated_by VARCHAR(100) NULL,
    CONSTRAINT check_alert_severity CHECK (severity IN ('INFO', 'WARNING', 'CRITICAL'))
);

CREATE INDEX IF NOT EXISTS idx_db_alerts_resolved ON database_alerts(is_resolved) WHERE deleted_at IS NULL;
