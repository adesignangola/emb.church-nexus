-- =====================================================
-- PASTORAL NOTES
-- =====================================================
CREATE TABLE IF NOT EXISTS pastoral_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    related_member_id UUID REFERENCES members(id),
    related_member_name TEXT,
    is_private BOOLEAN DEFAULT true,
    pastor_id UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pastoral_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pastors and admins can view notes"
    ON pastoral_notes FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'PASTOR'))
    );

CREATE POLICY "Pastors and admins can manage notes"
    ON pastoral_notes FOR ALL TO authenticated
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'PASTOR'))
    );

CREATE TRIGGER update_pastoral_notes_updated_at
    BEFORE UPDATE ON pastoral_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
