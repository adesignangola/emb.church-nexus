-- =====================================================
-- Emb.Church Nexus - Extended Schema
-- =====================================================

-- =====================================================
-- 1. APPOINTMENTS (Marcações Pastorais)
-- =====================================================
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    time TIME NOT NULL,
    member_name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('COUNSELING', 'VISIT', 'PRESENTATION', 'MARRIAGE', 'HOSPITAL', 'OTHER')),
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('CONFIRMED', 'PENDING', 'CANCELLED', 'COMPLETED')),
    pastor_id UUID REFERENCES profiles(id),
    notes TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view appointments"
    ON appointments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authorized roles can manage appointments"
    ON appointments FOR ALL TO authenticated
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'PASTOR', 'SECRETARY'))
    );

-- =====================================================
-- 2. SERMONS (Sermões)
-- =====================================================
CREATE TABLE IF NOT EXISTS sermons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    preacher_id UUID REFERENCES profiles(id),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    bible_text TEXT,
    theme TEXT,
    notes TEXT,
    file_url TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sermons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view sermons"
    ON sermons FOR SELECT TO authenticated USING (true);

CREATE POLICY "Pastors and admins can manage sermons"
    ON sermons FOR ALL TO authenticated
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'PASTOR'))
    );

-- =====================================================
-- 3. EVENTS (Eventos)
-- =====================================================
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TIME,
    end_date DATE,
    location TEXT,
    type TEXT NOT NULL DEFAULT 'GENERAL' CHECK (type IN ('CONFERENCE', 'WORSHIP', 'YOUTH', 'WOMEN', 'MEN', 'PRAYER', 'GENERAL')),
    image_url TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view events"
    ON events FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authorized roles can manage events"
    ON events FOR ALL TO authenticated
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'PASTOR', 'SECRETARY'))
    );

-- =====================================================
-- 4. VISITORS (Visitantes)
-- =====================================================
CREATE TABLE IF NOT EXISTS visitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
    service_type TEXT,
    referred_by UUID REFERENCES members(id),
    follow_up_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (follow_up_status IN ('PENDING', 'CONTACTED', 'FOLLOWING_UP', 'BECAME_MEMBER', 'DECLINED')),
    notes TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view visitors"
    ON visitors FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authorized roles can manage visitors"
    ON visitors FOR ALL TO authenticated
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'PASTOR', 'SECRETARY'))
    );

-- =====================================================
-- 5. SCHEDULES (Escalas de Culto)
-- =====================================================
CREATE TABLE IF NOT EXISTS schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    service_type TEXT NOT NULL,
    role TEXT NOT NULL,
    member_id UUID REFERENCES members(id),
    member_name TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view schedules"
    ON schedules FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authorized roles can manage schedules"
    ON schedules FOR ALL TO authenticated
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'PASTOR', 'SECRETARY', 'DEPT_LEADER'))
    );

-- =====================================================
-- 6. SCHOOL_CLASSES (Escolas Espirituais)
-- =====================================================
CREATE TABLE IF NOT EXISTS school_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    teacher_id UUID REFERENCES profiles(id),
    teacher_name TEXT,
    start_date DATE,
    end_date DATE,
    max_students INTEGER,
    enrolled_count INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'PLANNED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE school_classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view school classes"
    ON school_classes FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authorized roles can manage school classes"
    ON school_classes FOR ALL TO authenticated
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'PASTOR', 'SECRETARY'))
    );

-- =====================================================
-- 7. KIDS_GROUPS (Departamento Infantil)
-- =====================================================
CREATE TABLE IF NOT EXISTS kids_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    age_range TEXT NOT NULL,
    teacher_name TEXT NOT NULL,
    teacher_id UUID REFERENCES profiles(id),
    enrolled_count INTEGER DEFAULT 0,
    room TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE kids_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view kids groups"
    ON kids_groups FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authorized roles can manage kids groups"
    ON kids_groups FOR ALL TO authenticated
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'PASTOR', 'SECRETARY'))
    );

-- =====================================================
-- 8. MESSAGES (Central de Comunicação)
-- =====================================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    channel TEXT NOT NULL CHECK (channel IN ('WHATSAPP', 'EMAIL', 'SMS', 'BOTH')),
    target_audience TEXT NOT NULL DEFAULT 'ALL' CHECK (target_audience IN ('ALL', 'MEMBERS', 'VISITORS', 'DEPARTMENT', 'CUSTOM')),
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SENT', 'FAILED', 'SCHEDULED')),
    scheduled_at TIMESTAMPTZ,
    sent_count INTEGER DEFAULT 0,
    delivery_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view messages"
    ON messages FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authorized roles can manage messages"
    ON messages FOR ALL TO authenticated
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'PASTOR', 'SECRETARY'))
    );

-- =====================================================
-- 9. LEADERSHIP_POSITIONS (Organograma)
-- =====================================================
CREATE TABLE IF NOT EXISTS leadership_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    department_id UUID REFERENCES departments(id),
    leader_id UUID REFERENCES profiles(id),
    leader_name TEXT,
    level INTEGER DEFAULT 1,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE leadership_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view leadership positions"
    ON leadership_positions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage leadership positions"
    ON leadership_positions FOR ALL TO authenticated
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'PASTOR'))
    );

-- =====================================================
-- 10. UPDATED_AT TRIGGERS FOR NEW TABLES
-- =====================================================
CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sermons_updated_at
    BEFORE UPDATE ON sermons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_visitors_updated_at
    BEFORE UPDATE ON visitors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at
    BEFORE UPDATE ON schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_school_classes_updated_at
    BEFORE UPDATE ON school_classes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kids_groups_updated_at
    BEFORE UPDATE ON kids_groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leadership_positions_updated_at
    BEFORE UPDATE ON leadership_positions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 11. HELPER VIEWS
-- =====================================================
CREATE OR REPLACE VIEW visitor_stats AS
SELECT
    COUNT(*) AS total_visitors,
    COUNT(*) FILTER (WHERE follow_up_status = 'PENDING') AS pending_followup,
    COUNT(*) FILTER (WHERE follow_up_status = 'BECAME_MEMBER') AS became_members,
    COUNT(*) FILTER (WHERE visit_date >= DATE_TRUNC('month', CURRENT_DATE)) AS this_month
FROM visitors;

CREATE OR REPLACE VIEW member_demographics AS
SELECT
    COUNT(*) AS total_members,
    COUNT(*) FILTER (WHERE status = 'ACTIVE') AS active_members,
    COUNT(*) FILTER (WHERE gender = 'M') AS male_count,
    COUNT(*) FILTER (WHERE gender = 'F') AS female_count,
    COUNT(*) FILTER (WHERE is_tither = true) AS tither_count
FROM members;
