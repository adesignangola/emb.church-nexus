-- =====================================================
-- CHURCH PROFILE (Perfil da Igreja)
-- =====================================================

CREATE TABLE IF NOT EXISTS church_profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identificação
    name TEXT NOT NULL,
    legal_name TEXT,
    denomination TEXT,
    nif VARCHAR(20),
    registration_number TEXT,
    
    -- Contactos
    email TEXT,
    phone TEXT,
    secondary_phone TEXT,
    website TEXT,
    
    -- Endereço
    address TEXT,
    city TEXT,
    province TEXT,
    postal_code VARCHAR(10),
    country TEXT DEFAULT 'Angola',
    
    -- Localização GPS
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Informações Pastorais
    senior_pastor_name TEXT,
    senior_pastor_phone TEXT,
    senior_pastor_email TEXT,
    assistant_pastor_name TEXT,
    church_president_name TEXT,
    
    -- Sobre a Igreja
    founding_date DATE,
    mission_statement TEXT,
    vision_statement TEXT,
    values_statement TEXT,
    history_notes TEXT,
    doctrine_statement TEXT,
    
    -- Cultos
    service_times JSONB DEFAULT '[]'::jsonb,
    
    -- Redes Sociais
    facebook_url TEXT,
    instagram_url TEXT,
    youtube_url TEXT,
    tiktok_url TEXT,
    whatsapp_group_url TEXT,
    
    -- Mídia
    logo_url TEXT,
    banner_url TEXT,
    
    -- Metas e Estatísticas
    membership_goal INTEGER,
    current_members_count INTEGER DEFAULT 0,
    
    -- Configurações
    fiscal_year_start_month INTEGER DEFAULT 1,
    default_currency TEXT DEFAULT 'AOA',
    timezone TEXT DEFAULT 'Africa/Luanda',
    language TEXT DEFAULT 'pt',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_church_profile_updated_at
    BEFORE UPDATE ON church_profile
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE church_profile ENABLE ROW LEVEL SECURITY;

-- Todos os autenticados podem ver o perfil
CREATE POLICY "Authenticated users can view church profile"
    ON church_profile FOR SELECT TO authenticated USING (true);

-- Apenas admins podem editar o perfil
CREATE POLICY "Admins can manage church profile"
    ON church_profile FOR ALL TO authenticated
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN'))
    );

INSERT INTO church_profile (name, denomination, country, timezone, language, default_currency)
VALUES ('A Definir', 'Independente', 'Angola', 'Africa/Luanda', 'pt', 'AOA')
ON CONFLICT (id) DO NOTHING;
