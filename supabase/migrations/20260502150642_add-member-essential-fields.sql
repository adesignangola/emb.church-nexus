-- =====================================================
-- Add essential fields to members table
-- =====================================================

ALTER TABLE members ADD COLUMN IF NOT EXISTS marital_status TEXT DEFAULT 'SINGLE'
    CHECK (marital_status IN ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'SEPARATED'));

ALTER TABLE members ADD COLUMN IF NOT EXISTS spouse_name TEXT DEFAULT '';

ALTER TABLE members ADD COLUMN IF NOT EXISTS profession TEXT DEFAULT '';

COMMENT ON COLUMN members.marital_status IS 'Estado civil do membro';
COMMENT ON COLUMN members.spouse_name IS 'Nome do cônjuge';
COMMENT ON COLUMN members.profession IS 'Profissão/Ocupação';
