-- =====================================================
-- Update all table RLS policies to use is_admin_or_pastor()
-- =====================================================

-- MEMBERS
DROP POLICY IF EXISTS "Authorized roles can manage members" ON members;
CREATE POLICY "members_manage"
    ON members FOR ALL
    TO authenticated
    USING (is_admin_or_pastor(auth.uid()) OR 
           EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'SECRETARY'));

-- FINANCIAL TRANSACTIONS
DROP POLICY IF EXISTS "Authorized roles can manage transactions" ON financial_transactions;
CREATE POLICY "financial_manage"
    ON financial_transactions FOR ALL
    TO authenticated
    USING (is_admin_or_pastor(auth.uid()) OR 
           EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('SECRETARY', 'TREASURER')));

-- WORSHIP SERVICES
DROP POLICY IF EXISTS "Authorized roles can manage worship services" ON worship_services;
CREATE POLICY "worship_manage"
    ON worship_services FOR ALL
    TO authenticated
    USING (is_admin_or_pastor(auth.uid()) OR 
           EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'SECRETARY'));

-- AUDIT LOGS
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
CREATE POLICY "audit_select"
    ON audit_logs FOR SELECT
    TO authenticated
    USING (is_admin_or_pastor(auth.uid()) AND 
           EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));
