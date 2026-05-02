-- =====================================================
-- MIGRATE ROLES TO ARRAY (Multi-role support)
-- =====================================================

-- Add new array column
ALTER TABLE profiles ADD COLUMN roles TEXT[] DEFAULT '{"MEMBER"}';

-- Migrate existing single role to array
UPDATE profiles SET roles = ARRAY[role] WHERE roles IS NULL OR roles = '{"MEMBER"}';

-- Update profiles policies to use roles array first
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT TO authenticated
    USING (id = auth.uid());

DROP POLICY IF EXISTS "Admins and pastors can view all profiles" ON profiles;
CREATE POLICY "Admins and pastors can view all profiles"
    ON profiles FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND ('ADMIN' = ANY(p.roles) OR 'PASTOR' = ANY(p.roles))
        )
    );

DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
CREATE POLICY "Admins can manage all profiles"
    ON profiles FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND 'ADMIN' = ANY(p.roles)
        )
    );

-- Update policies on other tables that depend on profiles.role
-- Appointments
DROP POLICY IF EXISTS "Authorized roles can manage appointments" ON appointments;
CREATE POLICY "Authorized roles can manage appointments"
    ON appointments FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND ('ADMIN' = ANY(p.roles) OR 'PASTOR' = ANY(p.roles) OR 'SECRETARY' = ANY(p.roles))
        )
    );

-- Sermons
DROP POLICY IF EXISTS "Pastors and admins can manage sermons" ON sermons;
CREATE POLICY "Pastors and admins can manage sermons"
    ON sermons FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND ('ADMIN' = ANY(p.roles) OR 'PASTOR' = ANY(p.roles))
        )
    );

-- Events
DROP POLICY IF EXISTS "Authorized roles can manage events" ON events;
CREATE POLICY "Authorized roles can manage events"
    ON events FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND ('ADMIN' = ANY(p.roles) OR 'SECRETARY' = ANY(p.roles))
        )
    );

-- Visitors
DROP POLICY IF EXISTS "Authorized roles can manage visitors" ON visitors;
CREATE POLICY "Authorized roles can manage visitors"
    ON visitors FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND ('ADMIN' = ANY(p.roles) OR 'SECRETARY' = ANY(p.roles))
        )
    );

-- Schedules
DROP POLICY IF EXISTS "Authorized roles can manage schedules" ON schedules;
CREATE POLICY "Authorized roles can manage schedules"
    ON schedules FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND ('ADMIN' = ANY(p.roles) OR 'PASTOR' = ANY(p.roles) OR 'DEPT_LEADER' = ANY(p.roles))
        )
    );

-- School Classes
DROP POLICY IF EXISTS "Authorized roles can manage school classes" ON school_classes;
CREATE POLICY "Authorized roles can manage school classes"
    ON school_classes FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND ('ADMIN' = ANY(p.roles) OR 'SECRETARY' = ANY(p.roles))
        )
    );

-- Kids Groups
DROP POLICY IF EXISTS "Authorized roles can manage kids groups" ON kids_groups;
CREATE POLICY "Authorized roles can manage kids groups"
    ON kids_groups FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND ('ADMIN' = ANY(p.roles) OR 'DEPT_LEADER' = ANY(p.roles))
        )
    );

-- Messages
DROP POLICY IF EXISTS "Authorized roles can manage messages" ON messages;
CREATE POLICY "Authorized roles can manage messages"
    ON messages FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND ('ADMIN' = ANY(p.roles) OR 'SECRETARY' = ANY(p.roles))
        )
    );

-- Leadership Positions
DROP POLICY IF EXISTS "Admins can manage leadership positions" ON leadership_positions;
CREATE POLICY "Admins can manage leadership positions"
    ON leadership_positions FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND 'ADMIN' = ANY(p.roles)
        )
    );

-- Church Profile
DROP POLICY IF EXISTS "Admins can manage church profile" ON church_profile;
CREATE POLICY "Admins can manage church profile"
    ON church_profile FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND 'ADMIN' = ANY(p.roles)
        )
    );

-- Pastoral Notes
DROP POLICY IF EXISTS "Pastors and admins can view notes" ON pastoral_notes;
CREATE POLICY "Pastors and admins can view notes"
    ON pastoral_notes FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND ('ADMIN' = ANY(p.roles) OR 'PASTOR' = ANY(p.roles))
        )
    );

DROP POLICY IF EXISTS "Pastors and admins can manage notes" ON pastoral_notes;
CREATE POLICY "Pastors and admins can manage notes"
    ON pastoral_notes FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND ('ADMIN' = ANY(p.roles) OR 'PASTOR' = ANY(p.roles))
        )
    );

-- Now safe to drop the old column
ALTER TABLE profiles DROP COLUMN role;

-- Add check constraint
ALTER TABLE profiles ADD CONSTRAINT profiles_roles_check 
    CHECK (roles IS NOT NULL AND array_length(roles, 1) > 0);

-- Helper function to check if user has a role
CREATE OR REPLACE FUNCTION has_role(check_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND check_role = ANY(roles)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update profile trigger to set roles array instead of single role
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, full_name, email, roles)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Novo Membro'),
        NEW.email,
        COALESCE(
            (SELECT array_agg(val)::TEXT[] FROM jsonb_array_elements_text(NEW.raw_user_meta_data->'roles') val),
            '{"MEMBER"}'
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
