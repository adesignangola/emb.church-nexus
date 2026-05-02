-- =====================================================
-- Update ALL table policies to use is_admin_or_pastor()
-- =====================================================

-- MEMBERS
DROP POLICY IF EXISTS "Authorized roles can manage members" ON members;
DROP POLICY IF EXISTS "members_manage" ON members;
CREATE POLICY "members_read"
    ON members FOR SELECT
    TO authenticated
    USING (true);
CREATE POLICY "members_write"
    ON members FOR ALL
    TO authenticated
    USING (
        is_admin_or_pastor(auth.uid()) OR 
        has_role(auth.uid(), 'SECRETARY')
    );

-- FINANCIAL TRANSACTIONS
DROP POLICY IF EXISTS "Authorized roles can manage transactions" ON financial_transactions;
DROP POLICY IF EXISTS "financial_manage" ON financial_transactions;
CREATE POLICY "financial_read"
    ON financial_transactions FOR SELECT
    TO authenticated
    USING (true);
CREATE POLICY "financial_write"
    ON financial_transactions FOR ALL
    TO authenticated
    USING (
        is_admin_or_pastor(auth.uid()) OR 
        has_role(auth.uid(), 'SECRETARY') OR 
        has_role(auth.uid(), 'TREASURER')
    );

-- WORSHIP SERVICES
DROP POLICY IF EXISTS "Authorized roles can manage worship services" ON worship_services;
DROP POLICY IF EXISTS "worship_manage" ON worship_services;
CREATE POLICY "worship_read"
    ON worship_services FOR SELECT
    TO authenticated
    USING (true);
CREATE POLICY "worship_write"
    ON worship_services FOR ALL
    TO authenticated
    USING (
        is_admin_or_pastor(auth.uid()) OR 
        has_role(auth.uid(), 'SECRETARY')
    );

-- AUDIT LOGS
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
DROP POLICY IF EXISTS "audit_select" ON audit_logs;
CREATE POLICY "audit_read"
    ON audit_logs FOR SELECT
    TO authenticated
    USING (has_role(auth.uid(), 'ADMIN'));
CREATE POLICY "audit_write"
    ON audit_logs FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- DEPARTMENTS
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "departments_read" ON departments;
DROP POLICY IF EXISTS "departments_write" ON departments;
CREATE POLICY "departments_read"
    ON departments FOR SELECT
    TO authenticated
    USING (true);
CREATE POLICY "departments_write"
    ON departments FOR ALL
    TO authenticated
    USING (is_admin_or_pastor(auth.uid()));
