-- =====================================================
-- Add password_changed field to profiles
-- =====================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_changed BOOLEAN DEFAULT false;

COMMENT ON COLUMN profiles.password_changed IS 'Indicates if user has changed their temporary password';
