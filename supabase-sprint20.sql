-- Supabase PostgreSQL Migration for ERP SaaS Multi-Tenant (Sprint 20 - Enterprise Virtual Classroom, Live Learning & Video Conference)

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. VIRTUAL CLASSROOMS
CREATE TABLE IF NOT EXISTS virtual_classrooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    subject_id VARCHAR(100) NOT NULL,
    class_id VARCHAR(100) NOT NULL,
    teacher_id VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'ARCHIVED')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_vc_tenant ON virtual_classrooms(tenant_id) WHERE deleted_at IS NULL;

-- 2. VIRTUAL CLASS MEMBERS
CREATE TABLE IF NOT EXISTS virtual_class_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    virtual_classroom_id UUID NOT NULL REFERENCES virtual_classrooms(id) ON DELETE CASCADE,
    user_id VARCHAR(100) NOT NULL,
    role VARCHAR(50) CHECK (role IN ('Teacher', 'Student', 'Parent', 'Guest', 'Employee')) NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'LEFT')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    CONSTRAINT uq_vc_member UNIQUE (virtual_classroom_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_vcm_tenant ON virtual_class_members(tenant_id) WHERE deleted_at IS NULL;

-- 3. MEETING PROVIDERS
CREATE TABLE IF NOT EXISTS meeting_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    name VARCHAR(100) CHECK (name IN ('Google Meet', 'Zoom', 'Jitsi', 'Microsoft Teams', 'Custom WebRTC')) NOT NULL,
    code VARCHAR(50) NOT NULL,
    api_key VARCHAR(255),
    api_secret VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    CONSTRAINT uq_mp_code UNIQUE (tenant_id, code)
);
CREATE INDEX IF NOT EXISTS idx_mp_tenant ON meeting_providers(tenant_id) WHERE deleted_at IS NULL;

-- 4. MEETING ROOMS
CREATE TABLE IF NOT EXISTS meeting_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    provider_id UUID NOT NULL REFERENCES meeting_providers(id) ON DELETE CASCADE,
    external_room_id VARCHAR(255),
    join_url TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'IDLE' CHECK (status IN ('IDLE', 'ACTIVE', 'CLOSED')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_mr_tenant ON meeting_rooms(tenant_id) WHERE deleted_at IS NULL;

-- 5. MEETING SCHEDULES
CREATE TABLE IF NOT EXISTS meeting_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    virtual_classroom_id UUID REFERENCES virtual_classrooms(id) ON DELETE SET NULL,
    room_id UUID REFERENCES meeting_rooms(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    meeting_type VARCHAR(50) CHECK (meeting_type IN ('Class', 'Webinar', 'Training', 'Meeting', 'Interview')) NOT NULL,
    host_id VARCHAR(100) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    is_recurring BOOLEAN DEFAULT FALSE NOT NULL,
    recurrence_pattern VARCHAR(100),
    status VARCHAR(50) DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    CONSTRAINT chk_meeting_time CHECK (end_time >= start_time)
);
CREATE INDEX IF NOT EXISTS idx_ms_tenant ON meeting_schedules(tenant_id) WHERE deleted_at IS NULL;

-- 6. MEETING SESSIONS
CREATE TABLE IF NOT EXISTS meeting_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    schedule_id UUID NOT NULL REFERENCES meeting_schedules(id) ON DELETE CASCADE,
    actual_start_time TIMESTAMP WITH TIME ZONE,
    actual_end_time TIMESTAMP WITH TIME ZONE,
    recording_status VARCHAR(50) DEFAULT 'NONE' CHECK (recording_status IN ('NONE', 'ONGOING', 'COMPLETED', 'FAILED')) NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CLOSED')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_mses_tenant ON meeting_sessions(tenant_id) WHERE deleted_at IS NULL;

-- 7. MEETING PARTICIPANTS
CREATE TABLE IF NOT EXISTS meeting_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    session_id UUID NOT NULL REFERENCES meeting_sessions(id) ON DELETE CASCADE,
    user_id VARCHAR(100), -- Null for anonymous guests
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) CHECK (role IN ('Teacher', 'Student', 'Parent', 'Guest', 'Employee')) NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL,
    left_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'JOINED' CHECK (status IN ('JOINED', 'LEFT', 'BLOCKED')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_mp_session ON meeting_participants(session_id) WHERE deleted_at IS NULL;

-- 8. MEETING ATTENDANCES
CREATE TABLE IF NOT EXISTS meeting_attendances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    session_id UUID NOT NULL REFERENCES meeting_sessions(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES meeting_participants(id) ON DELETE CASCADE,
    user_id VARCHAR(100),
    status VARCHAR(50) CHECK (status IN ('Present', 'Late', 'Left Early', 'Absent')) NOT NULL,
    join_duration_minutes INTEGER DEFAULT 0 CHECK (join_duration_minutes >= 0) NOT NULL,
    synced_to_academic BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    CONSTRAINT uq_m_att UNIQUE (session_id, participant_id)
);
CREATE INDEX IF NOT EXISTS idx_matt_tenant ON meeting_attendances(tenant_id) WHERE deleted_at IS NULL;

-- 9. MEETING CHAT MESSAGES
CREATE TABLE IF NOT EXISTS meeting_chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    session_id UUID NOT NULL REFERENCES meeting_sessions(id) ON DELETE CASCADE,
    sender_id VARCHAR(100),
    sender_name VARCHAR(255) NOT NULL,
    sender_role VARCHAR(50) CHECK (sender_role IN ('Teacher', 'Student', 'Parent', 'Guest', 'Employee')) NOT NULL,
    message TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_mchat_session ON meeting_chat_messages(session_id) WHERE deleted_at IS NULL;

-- 10. MEETING POLLS
CREATE TABLE IF NOT EXISTS meeting_polls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    session_id UUID NOT NULL REFERENCES meeting_sessions(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    poll_type VARCHAR(50) CHECK (poll_type IN ('Single Choice', 'Multiple Choice', 'Rating')) NOT NULL,
    options JSONB NOT NULL, -- e.g., ["Sangat Setuju", "Setuju", "Kurang Setuju"]
    status VARCHAR(50) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_mpoll_session ON meeting_polls(session_id) WHERE deleted_at IS NULL;

-- 11. MEETING POLL ANSWERS
CREATE TABLE IF NOT EXISTS meeting_poll_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    poll_id UUID NOT NULL REFERENCES meeting_polls(id) ON DELETE CASCADE,
    user_id VARCHAR(100) NOT NULL,
    answer TEXT NOT NULL,
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    CONSTRAINT uq_m_poll_ans UNIQUE (poll_id, user_id)
);

-- 12. MEETING QUIZZES
CREATE TABLE IF NOT EXISTS meeting_quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    session_id UUID NOT NULL REFERENCES meeting_sessions(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    quiz_type VARCHAR(50) CHECK (quiz_type IN ('Multiple Choice', 'Essay', 'True False')) NOT NULL,
    questions JSONB NOT NULL,
    duration_minutes INTEGER CHECK (duration_minutes >= 0),
    status VARCHAR(50) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_mquiz_session ON meeting_quizzes(session_id) WHERE deleted_at IS NULL;

-- 13. MEETING QUIZ ANSWERS
CREATE TABLE IF NOT EXISTS meeting_quiz_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    quiz_id UUID NOT NULL REFERENCES meeting_quizzes(id) ON DELETE CASCADE,
    user_id VARCHAR(100) NOT NULL,
    score NUMERIC DEFAULT 0 CHECK (score >= 0) NOT NULL,
    answers JSONB NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    CONSTRAINT uq_m_quiz_ans UNIQUE (quiz_id, user_id)
);

-- 14. MEETING WHITEBOARDS
CREATE TABLE IF NOT EXISTS meeting_whiteboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    session_id UUID NOT NULL REFERENCES meeting_sessions(id) ON DELETE CASCADE,
    elements JSONB DEFAULT '[]'::jsonb NOT NULL, -- list of shapes, sticky notes, texts, drawings
    status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'READ_ONLY', 'CLOSED')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_mwb_session ON meeting_whiteboards(session_id) WHERE deleted_at IS NULL;

-- 15. MEETING RECORDINGS
CREATE TABLE IF NOT EXISTS meeting_recordings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    session_id UUID NOT NULL REFERENCES meeting_sessions(id) ON DELETE CASCADE,
    storage_type VARCHAR(50) CHECK (storage_type IN ('Cloud', 'Local', 'Object Storage')) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size_mb NUMERIC DEFAULT 0 CHECK (file_size_mb >= 0) NOT NULL,
    duration_seconds INTEGER DEFAULT 0 CHECK (duration_seconds >= 0) NOT NULL,
    status VARCHAR(50) DEFAULT 'AVAILABLE' CHECK (status IN ('PROCESSING', 'AVAILABLE', 'ARCHIVED', 'DELETED')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_mrec_session ON meeting_recordings(session_id) WHERE deleted_at IS NULL;

-- 16. MEETING BREAKOUT ROOMS
CREATE TABLE IF NOT EXISTS meeting_breakout_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    session_id UUID NOT NULL REFERENCES meeting_sessions(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    join_url TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CLOSED')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_mbo_session ON meeting_breakout_rooms(session_id) WHERE deleted_at IS NULL;

-- 17. MEETING BREAKOUT MEMBERS
CREATE TABLE IF NOT EXISTS meeting_breakout_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    breakout_room_id UUID NOT NULL REFERENCES meeting_breakout_rooms(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES meeting_participants(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    left_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    CONSTRAINT uq_mbo_mem UNIQUE (breakout_room_id, participant_id)
);

-- 18. MEETING WAITING ROOMS
CREATE TABLE IF NOT EXISTS meeting_waiting_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    session_id UUID NOT NULL REFERENCES meeting_sessions(id) ON DELETE CASCADE,
    user_id VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')) NOT NULL,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_mwr_session ON meeting_waiting_rooms(session_id) WHERE deleted_at IS NULL;

-- 19. MEETING RAISE HANDS
CREATE TABLE IF NOT EXISTS meeting_raise_hands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    session_id UUID NOT NULL REFERENCES meeting_sessions(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES meeting_participants(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'RAISED' CHECK (status IN ('RAISED', 'LOWERED')) NOT NULL,
    raised_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    lowered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_mrh_session ON meeting_raise_hands(session_id) WHERE deleted_at IS NULL;

-- 20. MEETING SCREEN SHARES
CREATE TABLE IF NOT EXISTS meeting_screen_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    session_id UUID NOT NULL REFERENCES meeting_sessions(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES meeting_participants(id) ON DELETE CASCADE,
    is_sharing BOOLEAN DEFAULT FALSE NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    CONSTRAINT uq_m_screen UNIQUE (session_id, participant_id)
);

-- 21. MEETING STATISTICS
CREATE TABLE IF NOT EXISTS meeting_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    session_id UUID NOT NULL REFERENCES meeting_sessions(id) ON DELETE CASCADE,
    peak_participants INTEGER DEFAULT 0 NOT NULL,
    average_duration_minutes INTEGER DEFAULT 0 NOT NULL,
    attendance_rate_percent NUMERIC DEFAULT 0 NOT NULL,
    total_chat_messages INTEGER DEFAULT 0 NOT NULL,
    total_polls_run INTEGER DEFAULT 0 NOT NULL,
    total_quizzes_run INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    CONSTRAINT uq_m_stat UNIQUE (session_id)
);

-- 22. MEETING SETTINGS
CREATE TABLE IF NOT EXISTS meeting_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    schedule_id UUID NOT NULL REFERENCES meeting_schedules(id) ON DELETE CASCADE,
    allow_guest_access BOOLEAN DEFAULT TRUE NOT NULL,
    allow_whiteboard BOOLEAN DEFAULT TRUE NOT NULL,
    allow_chat BOOLEAN DEFAULT TRUE NOT NULL,
    allow_screen_share BOOLEAN DEFAULT TRUE NOT NULL,
    require_waiting_room BOOLEAN DEFAULT FALSE NOT NULL,
    mute_on_entry BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    CONSTRAINT uq_m_setting UNIQUE (schedule_id)
);

-- 23. MEETING INTEGRATIONS
CREATE TABLE IF NOT EXISTS meeting_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    provider_code VARCHAR(50) NOT NULL,
    auth_payload JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    CONSTRAINT uq_m_int UNIQUE (tenant_id, provider_code)
);

-- 24. MEETING GUEST ACCESS
CREATE TABLE IF NOT EXISTS meeting_guest_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    session_id UUID NOT NULL REFERENCES meeting_sessions(id) ON DELETE CASCADE,
    guest_token VARCHAR(255) NOT NULL,
    guest_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'ALLOWED' CHECK (status IN ('ALLOWED', 'BLOCKED')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    CONSTRAINT uq_m_guest UNIQUE (session_id, guest_token)
);

-- 25. MEETING NOTIFICATIONS
CREATE TABLE IF NOT EXISTS meeting_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'INFO' CHECK (type IN ('INFO', 'REMINDER', 'ALARM')) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_mnot_user ON meeting_notifications(user_id) WHERE deleted_at IS NULL;

-- 26. MEETING INCIDENTS
CREATE TABLE IF NOT EXISTS meeting_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    session_id UUID NOT NULL REFERENCES meeting_sessions(id) ON DELETE CASCADE,
    reporter_id VARCHAR(100) NOT NULL,
    incident_type VARCHAR(100) NOT NULL, -- e.g., 'NETWORK', 'BEHAVIOR', 'AUDIO', 'VIDEO'
    description TEXT NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system' NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_minc_session ON meeting_incidents(session_id) WHERE deleted_at IS NULL;
