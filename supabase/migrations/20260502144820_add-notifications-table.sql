-- =====================================================
-- Notifications Table
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    type TEXT NOT NULL CHECK (type IN ('MEMBER', 'FINANCIAL', 'EVENT', 'SYSTEM', 'MESSAGE', 'BIRTHDAY', 'SERVICE')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    action_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_read_own"
    ON notifications FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "notifications_insert"
    ON notifications FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "notifications_update_own"
    ON notifications FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notifications_delete_own"
    ON notifications FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_read 
    ON notifications(user_id, is_read, created_at DESC);

-- =====================================================
-- Seed some sample notifications
-- =====================================================
INSERT INTO notifications (user_id, type, title, message, is_read)
SELECT 
    id,
    'SYSTEM',
    'Bem-vindo ao Nexus Church',
    'O seu perfil foi configurado com sucesso. Explore as funcionalidades do sistema.',
    false
FROM profiles
WHERE id IN (
    SELECT id FROM profiles WHERE role = 'ADMIN'
    LIMIT 1
);

INSERT INTO notifications (user_id, type, title, message, is_read)
SELECT 
    id,
    'MEMBER',
    'Base de Membros Ativa',
    'A base de dados de membros está pronta a ser utilizada.',
    false
FROM profiles
WHERE id IN (
    SELECT id FROM profiles WHERE role IN ('ADMIN', 'PASTOR', 'SECRETARY')
    LIMIT 1
);
