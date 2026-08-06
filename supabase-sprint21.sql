-- Supabase PostgreSQL Migration for ERP SaaS Multi-Tenant (Sprint 21 - AI-Powered Smart Education & Institutional Copilot Hub)

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. AI PROVIDERS
CREATE TABLE IF NOT EXISTS ai_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    name VARCHAR(100) CHECK (name IN ('Google Gemini', 'OpenAI', 'Anthropic Claude', 'DeepSeek', 'OpenRouter', 'Azure OpenAI', 'AWS Bedrock', 'Ollama', 'Custom Provider')) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    api_endpoint VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_aip_tenant ON ai_providers(tenant_id) WHERE deleted_at IS NULL;

-- 2. AI PROVIDER MODELS
CREATE TABLE IF NOT EXISTS ai_provider_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    provider_id UUID NOT NULL REFERENCES ai_providers(id) ON DELETE CASCADE,
    name VARCHAR(100) CHECK (name IN ('Gemini', 'GPT', 'Claude', 'DeepSeek', 'Llama', 'Mistral', 'Qwen', 'Custom')) NOT NULL,
    model_code VARCHAR(100) NOT NULL, -- e.g. gemini-3.5-flash, gpt-4o, etc.
    context_window INTEGER,
    input_token_cost_per_m DECIMAL(10, 4) DEFAULT 0.0000,
    output_token_cost_per_m DECIMAL(10, 4) DEFAULT 0.0000,
    status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    CONSTRAINT uq_provider_model UNIQUE (provider_id, model_code)
);
CREATE INDEX IF NOT EXISTS idx_apm_tenant ON ai_provider_models(tenant_id) WHERE deleted_at IS NULL;

-- 3. AI API KEYS
CREATE TABLE IF NOT EXISTS ai_api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    provider_id UUID NOT NULL REFERENCES ai_providers(id) ON DELETE CASCADE,
    encrypted_key TEXT NOT NULL,
    key_hint VARCHAR(50), -- e.g. "sk-proj...A5eT"
    status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'EXPIRED')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_aak_tenant ON ai_api_keys(tenant_id) WHERE deleted_at IS NULL;

-- 4. AI PROMPT CATEGORIES
CREATE TABLE IF NOT EXISTS ai_prompt_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    CONSTRAINT uq_prompt_cat_name UNIQUE (tenant_id, name)
);
CREATE INDEX IF NOT EXISTS idx_apc_tenant ON ai_prompt_categories(tenant_id) WHERE deleted_at IS NULL;

-- 5. AI PROMPTS
CREATE TABLE IF NOT EXISTS ai_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    category_id UUID NOT NULL REFERENCES ai_prompt_categories(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    system_prompt TEXT NOT NULL,
    user_template TEXT,
    variables JSONB DEFAULT '[]'::jsonb, -- dynamic placeholders like [subject, level, etc]
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ap_tenant ON ai_prompts(tenant_id) WHERE deleted_at IS NULL;

-- 6. AI PROMPT VERSIONS
CREATE TABLE IF NOT EXISTS ai_prompt_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    prompt_id UUID NOT NULL REFERENCES ai_prompts(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    system_prompt TEXT NOT NULL,
    user_template TEXT,
    change_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    CONSTRAINT uq_prompt_version UNIQUE (prompt_id, version_number)
);
CREATE INDEX IF NOT EXISTS idx_apv_tenant ON ai_prompt_versions(tenant_id) WHERE deleted_at IS NULL;

-- 7. AI CONVERSATIONS
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    title VARCHAR(255) DEFAULT 'New Chat' NOT NULL,
    assistant_type VARCHAR(100) CHECK (assistant_type IN ('Teacher', 'Student', 'Parent', 'Finance', 'HR', 'Administrator', 'Boarding', 'Library', 'Academic')) NOT NULL,
    provider_id UUID NOT NULL REFERENCES ai_providers(id),
    model_id UUID NOT NULL REFERENCES ai_provider_models(id),
    pinned BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_aconv_tenant ON ai_conversations(tenant_id) WHERE deleted_at IS NULL;

-- 8. AI MESSAGES
CREATE TABLE IF NOT EXISTS ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role VARCHAR(50) CHECK (role IN ('user', 'assistant', 'system')) NOT NULL,
    content TEXT NOT NULL,
    token_count INTEGER DEFAULT 0 NOT NULL,
    cost DECIMAL(10, 6) DEFAULT 0.000000 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_amsg_tenant ON ai_messages(tenant_id) WHERE deleted_at IS NULL;

-- 9. AI CONTEXTS
CREATE TABLE IF NOT EXISTS ai_contexts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    context_type VARCHAR(100) CHECK (context_type IN ('StudentProfile', 'GradeBook', 'LMS_Progress', 'Attendance', 'BillingStatus', 'PPDB_Details', 'SystemLogs')) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL, -- references database row IDs/snapshots
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_actx_tenant ON ai_contexts(tenant_id) WHERE deleted_at IS NULL;

-- 10. AI MEMORY PROFILES
CREATE TABLE IF NOT EXISTS ai_memory_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    memory_key VARCHAR(100) NOT NULL,
    memory_value TEXT NOT NULL,
    importance_score INTEGER DEFAULT 5 CHECK (importance_score BETWEEN 1 AND 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    CONSTRAINT uq_memory_key UNIQUE (user_id, memory_key)
);
CREATE INDEX IF NOT EXISTS idx_amp_tenant ON ai_memory_profiles(tenant_id) WHERE deleted_at IS NULL;

-- 11. AI KNOWLEDGE SOURCES
CREATE TABLE IF NOT EXISTS ai_knowledge_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    source_type VARCHAR(50) CHECK (source_type IN ('PDF', 'DOCX', 'Image', 'Audio', 'Video', 'URL', 'CustomText')) NOT NULL,
    file_url TEXT,
    content_extracted TEXT, -- full text extraction / speech-to-text transcript / OCR output
    vector_status VARCHAR(50) DEFAULT 'READY' CHECK (status IN ('PENDING', 'PROCESSING', 'READY', 'FAILED')),
    status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_aks_tenant ON ai_knowledge_sources(tenant_id) WHERE deleted_at IS NULL;

-- 12. AI DOCUMENT GENERATORS
CREATE TABLE IF NOT EXISTS ai_document_generators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    doc_type VARCHAR(50) CHECK (doc_type IN ('Letter', 'Certificate', 'Report', 'Announcement', 'Lesson Plan', 'Exam')) NOT NULL,
    prompt_template TEXT NOT NULL,
    style_settings JSONB DEFAULT '{}'::jsonb, -- margin, custom fonts, brandings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_adg_tenant ON ai_document_generators(tenant_id) WHERE deleted_at IS NULL;

-- 13. AI GENERATED DOCUMENTS
CREATE TABLE IF NOT EXISTS ai_generated_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    generator_id UUID REFERENCES ai_document_generators(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL, -- markdown / generated text content
    pdf_url TEXT,
    token_usage_total INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_agd_tenant ON ai_generated_documents(tenant_id) WHERE deleted_at IS NULL;

-- 14. AI QUESTION GENERATORS
CREATE TABLE IF NOT EXISTS ai_question_generators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    education_level VARCHAR(50) NOT NULL, -- e.g. SMA, SMP, SD
    question_type VARCHAR(50) CHECK (question_type IN ('Essay', 'Multiple Choice', 'True False', 'Case Study')) NOT NULL,
    quantity INTEGER DEFAULT 5 NOT NULL,
    difficulty VARCHAR(50) DEFAULT 'MEDIUM' CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD', 'HOTS')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_aqg_tenant ON ai_question_generators(tenant_id) WHERE deleted_at IS NULL;

-- 15. AI GENERATED QUESTIONS
CREATE TABLE IF NOT EXISTS ai_generated_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    generator_id UUID REFERENCES ai_question_generators(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options JSONB, -- list of options for multiple choice
    correct_answer TEXT,
    explanation TEXT,
    cognitive_level VARCHAR(50) DEFAULT 'C3', -- C1-C6 HOTS
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_agq_tenant ON ai_generated_questions(tenant_id) WHERE deleted_at IS NULL;

-- 16. AI LESSON PLANNERS
CREATE TABLE IF NOT EXISTS ai_lesson_planners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    grade_level VARCHAR(50) NOT NULL,
    duration_minutes INTEGER DEFAULT 90 NOT NULL,
    curriculum VARCHAR(50) DEFAULT 'Kurikulum Merdeka' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_alp_tenant ON ai_lesson_planners(tenant_id) WHERE deleted_at IS NULL;

-- 17. AI GENERATED LESSONS
CREATE TABLE IF NOT EXISTS ai_generated_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    planner_id UUID REFERENCES ai_lesson_planners(id) ON DELETE CASCADE,
    objectives TEXT NOT NULL,
    materials TEXT,
    activities JSONB DEFAULT '[]'::jsonb, -- sequence of steps (time, detail)
    assessment TEXT,
    content_raw TEXT NOT NULL, -- complete raw generated markdown
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_agl_tenant ON ai_generated_lessons(tenant_id) WHERE deleted_at IS NULL;

-- 18. AI REPORT GENERATORS
CREATE TABLE IF NOT EXISTS ai_report_generators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    report_source VARCHAR(100) CHECK (report_source IN ('Grade Book', 'Report Card', 'PPDB', 'CBT', 'LMS', 'Virtual Classroom', 'Finance Ledger')) NOT NULL,
    schedule_cron VARCHAR(50), -- for background automatic reports
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_arg_tenant ON ai_report_generators(tenant_id) WHERE deleted_at IS NULL;

-- 19. AI REPORT SUMMARIES
CREATE TABLE IF NOT EXISTS ai_report_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    generator_id UUID REFERENCES ai_report_generators(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    summary_markdown TEXT NOT NULL,
    data_snapshot JSONB NOT NULL, -- references metrics analyzed
    action_items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ars_tenant ON ai_report_summaries(tenant_id) WHERE deleted_at IS NULL;

-- 20. AI TRANSLATION JOBS
CREATE TABLE IF NOT EXISTS ai_translation_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    source_language VARCHAR(50) DEFAULT 'Indonesia' CHECK (source_language IN ('Indonesia', 'English', 'Arabic', 'Japanese')) NOT NULL,
    target_language VARCHAR(50) CHECK (target_language IN ('Indonesia', 'English', 'Arabic', 'Japanese')) NOT NULL,
    original_text TEXT NOT NULL,
    translated_text TEXT,
    status VARCHAR(50) DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_atj_tenant ON ai_translation_jobs(tenant_id) WHERE deleted_at IS NULL;

-- 21. AI OCR JOBS
CREATE TABLE IF NOT EXISTS ai_ocr_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(100) CHECK (file_type IN ('PDF', 'Image')) NOT NULL,
    extracted_text TEXT,
    status VARCHAR(50) DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_aoj_tenant ON ai_ocr_jobs(tenant_id) WHERE deleted_at IS NULL;

-- 22. AI SPEECH JOBS
CREATE TABLE IF NOT EXISTS ai_speech_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    job_type VARCHAR(50) CHECK (job_type IN ('TTS', 'STT')) NOT NULL,
    file_name VARCHAR(255),
    file_url TEXT, -- input for STT, output for TTS
    input_text TEXT, -- input for TTS, output for STT
    voice_name VARCHAR(50) DEFAULT 'Zephyr', -- for TTS
    status VARCHAR(50) DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_asj_tenant ON ai_speech_jobs(tenant_id) WHERE deleted_at IS NULL;

-- 23. AI USAGE LOGS
CREATE TABLE IF NOT EXISTS ai_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    endpoint VARCHAR(100) NOT NULL, -- e.g. aiChat, aiTeacherAssistant
    provider VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    prompt_tokens INTEGER DEFAULT 0 NOT NULL,
    completion_tokens INTEGER DEFAULT 0 NOT NULL,
    total_tokens INTEGER DEFAULT 0 NOT NULL,
    estimated_cost DECIMAL(10, 6) DEFAULT 0.000000 NOT NULL,
    status VARCHAR(50) DEFAULT 'SUCCESS' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_aul_tenant ON ai_usage_logs(tenant_id) WHERE deleted_at IS NULL;

-- 24. AI TOKEN USAGE
CREATE TABLE IF NOT EXISTS ai_token_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    prompt_tokens_total BIGINT DEFAULT 0 NOT NULL,
    completion_tokens_total BIGINT DEFAULT 0 NOT NULL,
    total_tokens_spent BIGINT DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    CONSTRAINT uq_user_token UNIQUE (user_id)
);
CREATE INDEX IF NOT EXISTS idx_atu_tenant ON ai_token_usage(tenant_id) WHERE deleted_at IS NULL;

-- 25. AI COST TRACKING
CREATE TABLE IF NOT EXISTS ai_cost_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    total_spent_usd DECIMAL(12, 6) DEFAULT 0.000000 NOT NULL,
    monthly_budget_limit DECIMAL(10, 2) DEFAULT 100.00 NOT NULL,
    alert_threshold_percent INTEGER DEFAULT 80 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    CONSTRAINT uq_tenant_cost UNIQUE (tenant_id)
);
CREATE INDEX IF NOT EXISTS idx_act_tenant ON ai_cost_tracking(tenant_id) WHERE deleted_at IS NULL;

-- 26. AI FEEDBACKS
CREATE TABLE IF NOT EXISTS ai_feedbacks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    message_id UUID NOT NULL REFERENCES ai_messages(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_afb_tenant ON ai_feedbacks(tenant_id) WHERE deleted_at IS NULL;

-- 27. AI SETTINGS
CREATE TABLE IF NOT EXISTS ai_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    default_provider_id UUID,
    default_model_id UUID,
    system_safety_filter VARCHAR(100) DEFAULT 'STANDARD' NOT NULL,
    enable_cache BOOLEAN DEFAULT true NOT NULL,
    enable_audit_log BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    CONSTRAINT uq_tenant_ai_settings UNIQUE (tenant_id)
);
CREATE INDEX IF NOT EXISTS idx_ais_tenant ON ai_settings(tenant_id) WHERE deleted_at IS NULL;
