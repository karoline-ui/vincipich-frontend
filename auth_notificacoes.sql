-- ═══════════════════════════════════════════════════════════════════════════════
-- VINCIPITCH.AI - TABELAS DE USUÁRIOS E NOTIFICAÇÕES
-- Execute no Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Tabela de usuários (perfil)
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    nome TEXT,
    empresa TEXT,
    cargo TEXT,
    avatar_url TEXT,
    notif_analise BOOLEAN DEFAULT true,
    notif_ranking BOOLEAN DEFAULT true,
    notif_email BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de notificações
CREATE TABLE IF NOT EXISTS notificacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK (tipo IN ('analise_concluida', 'ranking_atualizado', 'nova_empresa', 'erro')),
    titulo TEXT NOT NULL,
    mensagem TEXT NOT NULL,
    lida BOOLEAN DEFAULT false,
    empresa_id UUID REFERENCES empresas(id) ON DELETE SET NULL,
    analise_id UUID REFERENCES analises(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Índices para performance
CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario ON notificacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON notificacoes(usuario_id, lida);
CREATE INDEX IF NOT EXISTS idx_notificacoes_created ON notificacoes(created_at DESC);

-- 4. Permissões RLS (Row Level Security)
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios
DROP POLICY IF EXISTS "Usuarios podem ver seu próprio perfil" ON usuarios;
CREATE POLICY "Usuarios podem ver seu próprio perfil" ON usuarios
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuarios podem atualizar seu próprio perfil" ON usuarios;
CREATE POLICY "Usuarios podem atualizar seu próprio perfil" ON usuarios
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuarios podem inserir seu próprio perfil" ON usuarios;
CREATE POLICY "Usuarios podem inserir seu próprio perfil" ON usuarios
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para notificacoes
DROP POLICY IF EXISTS "Usuarios podem ver suas notificacoes" ON notificacoes;
CREATE POLICY "Usuarios podem ver suas notificacoes" ON notificacoes
    FOR SELECT USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Usuarios podem atualizar suas notificacoes" ON notificacoes;
CREATE POLICY "Usuarios podem atualizar suas notificacoes" ON notificacoes
    FOR UPDATE USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Sistema pode inserir notificacoes" ON notificacoes;
CREATE POLICY "Sistema pode inserir notificacoes" ON notificacoes
    FOR INSERT WITH CHECK (true);

-- 5. Função para criar perfil automaticamente ao criar usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.usuarios (id, email, nome)
    VALUES (
        NEW.id, 
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Função para notificar análise concluída
CREATE OR REPLACE FUNCTION public.notify_analise_concluida()
RETURNS TRIGGER AS $$
DECLARE
    empresa_nome TEXT;
BEGIN
    -- Só notifica quando status muda para concluida
    IF NEW.status = 'concluida' AND (OLD.status IS NULL OR OLD.status != 'concluida') THEN
        -- Pega nome da empresa
        SELECT nome INTO empresa_nome FROM empresas WHERE id = NEW.empresa_id;
        
        -- Insere notificação para todos os usuários (você pode filtrar se quiser)
        INSERT INTO notificacoes (usuario_id, tipo, titulo, mensagem, empresa_id, analise_id)
        SELECT 
            id,
            'analise_concluida',
            'Análise Concluída',
            'A análise de ' || COALESCE(empresa_nome, 'empresa') || ' foi finalizada com nota ' || ROUND(NEW.nota_final::numeric, 2) || '.',
            NEW.empresa_id,
            NEW.id
        FROM usuarios;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para notificar
DROP TRIGGER IF EXISTS on_analise_concluida ON analises;
CREATE TRIGGER on_analise_concluida
    AFTER UPDATE ON analises
    FOR EACH ROW EXECUTE FUNCTION public.notify_analise_concluida();

-- 7. Habilitar Realtime nas tabelas
ALTER PUBLICATION supabase_realtime ADD TABLE notificacoes;
ALTER PUBLICATION supabase_realtime ADD TABLE analises;

-- 8. Verificar
SELECT '✅ Tabelas de usuários e notificações criadas!' as status;
