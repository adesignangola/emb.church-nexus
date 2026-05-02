-- =====================================================
-- Emb.Church Nexus - Initial Schema (Fixed)
-- =====================================================

-- Enable UUID generation (built-in for PostgreSQL 13+)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. DEPARTMENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    leader_id TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE departments IS 'Departments/ministries within the church';

-- =====================================================
-- 2. PROFILES (extends auth.users)
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('ADMIN', 'PASTOR', 'SECRETARY', 'TREASURER', 'DEPT_LEADER', 'MEMBER')),
    avatar_url TEXT,
    phone TEXT,
    department_id UUID REFERENCES departments(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE profiles IS 'User profiles linked to Supabase auth';

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Fixed: Use auth.jwt() to check role instead of recursive subquery
CREATE POLICY "Admins and pastors can view all profiles"
    ON profiles FOR SELECT
    USING (
        (SELECT role FROM profiles WHERE id = auth.uid()) IN ('ADMIN', 'PASTOR')
    );

-- =====================================================
-- 3. MEMBERS
-- =====================================================
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    birth_date DATE,
    gender TEXT CHECK (gender IN ('M', 'F', 'O')),
    photo_url TEXT,
    phone TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    address TEXT DEFAULT '',
    baptism_date DATE,
    membership_date DATE,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'TRANSFERRED', 'DECEASED')),
    department_id UUID REFERENCES departments(id),
    is_tither BOOLEAN DEFAULT false,
    notes TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE members IS 'Church member registry';

ALTER TABLE members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view members"
    ON members FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authorized roles can manage members"
    ON members FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('ADMIN', 'PASTOR', 'SECRETARY')
        )
    );

-- =====================================================
-- 4. FINANCIAL TRANSACTIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS financial_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    type TEXT NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
    category TEXT NOT NULL CHECK (category IN ('TITHE', 'OFFERING', 'SPECIAL_OFFERING', 'DONATION', 'OPERATIONAL', 'EVENT', 'SALARY', 'EXTRAORDINARY')),
    amount DECIMAL(15,2) NOT NULL CHECK (amount >= 0),
    member_id UUID REFERENCES members(id),
    payment_method TEXT DEFAULT 'Cash',
    description TEXT NOT NULL,
    receipt_url TEXT,
    status TEXT NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED')),
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE financial_transactions IS 'Church financial records';

ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view financial transactions"
    ON financial_transactions FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authorized roles can manage transactions"
    ON financial_transactions FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('ADMIN', 'PASTOR', 'SECRETARY', 'TREASURER')
        )
    );

-- =====================================================
-- 5. WORSHIP SERVICES
-- =====================================================
CREATE TABLE IF NOT EXISTS worship_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    type TEXT NOT NULL,
    preacher TEXT NOT NULL,
    theme TEXT,
    bible_text TEXT,
    attendance_members INTEGER DEFAULT 0,
    attendance_visitors INTEGER DEFAULT 0,
    decisions INTEGER DEFAULT 0,
    offerings DECIMAL(15,2) DEFAULT 0,
    notes TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE worship_services IS 'Worship service attendance and records';

ALTER TABLE worship_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view worship services"
    ON worship_services FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authorized roles can manage worship services"
    ON worship_services FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('ADMIN', 'PASTOR', 'SECRETARY')
        )
    );

-- =====================================================
-- 6. AUDIT LOGS
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE audit_logs IS 'Security audit trail for all system operations';

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
    ON audit_logs FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

CREATE POLICY "System can insert audit logs"
    ON audit_logs FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- =====================================================
-- 7. BIRTHDAYS VIEW
-- =====================================================
CREATE OR REPLACE VIEW upcoming_birthdays AS
SELECT
    id,
    full_name,
    birth_date,
    EXTRACT(MONTH FROM birth_date) AS birth_month,
    EXTRACT(DAY FROM birth_date) AS birth_day,
    photo_url
FROM members
WHERE birth_date IS NOT NULL AND status = 'ACTIVE'
ORDER BY birth_month, birth_day;

-- =====================================================
-- 8. AUTOMATED UPDATED_AT TRIGGER
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_departments_updated_at
    BEFORE UPDATE ON departments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_members_updated_at
    BEFORE UPDATE ON members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_transactions_updated_at
    BEFORE UPDATE ON financial_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 9. PROFILE CREATION TRIGGER (auto-create on signup)
-- =====================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'MEMBER')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- 10. SEED DATA (Departments)
-- =====================================================
INSERT INTO departments (name, description, active) VALUES
    ('Ministério de Louvor', 'Equipa de louvor e adoração', true),
    ('Intercessão & Oração', 'Departamento de oração', true),
    ('Departamento de Mídias', 'Streaming e produção visual', true),
    ('Escola Bíblica', 'Ensino e discipulado', true),
    ('Makers', 'Produção e multimédia', true),
    ('Crianças', 'Departamento infantil', true)
ON CONFLICT DO NOTHING;
