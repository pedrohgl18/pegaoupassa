-- =============================================
-- PEGA OU PASSA - ESTRUTURA DO BANCO DE DADOS
-- Supabase (PostgreSQL)
-- =============================================
-- 
-- INSTRUÇÕES:
-- 1. Acesse o Supabase Web Console
-- 2. Vá em SQL Editor
-- 3. Execute cada bloco de código na ordem
-- 
-- =============================================


-- =============================================
-- EXTENSÕES NECESSÁRIAS
-- Data: 27/11/2025
-- Descrição: Habilita extensões do PostgreSQL
-- =============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- =============================================
-- MIGRAÇÃO: Adicionar campos de onboarding
-- Data: 28/11/2025
-- Descrição: Campos para controlar progresso do onboarding
-- EXECUTAR SE A TABELA JÁ EXISTE
-- =============================================

-- IMPORTANTE: Executar estas alterações para permitir onboarding progressivo
ALTER TABLE profiles ALTER COLUMN name DROP NOT NULL;
ALTER TABLE profiles ALTER COLUMN birth_date DROP NOT NULL;
ALTER TABLE profiles ALTER COLUMN gender DROP NOT NULL;
ALTER TABLE profiles ALTER COLUMN looking_for DROP NOT NULL;

-- Adicionar colunas de onboarding se não existirem
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;


-- =============================================
-- TABELA: profiles
-- Data: 27/11/2025
-- Descrição: Perfis dos usuários do app
-- =============================================

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE,
    name TEXT,  -- Permitir NULL durante onboarding
    bio TEXT,
    birth_date DATE,  -- Permitir NULL durante onboarding
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),  -- Permitir NULL durante onboarding
    looking_for TEXT CHECK (looking_for IN ('male', 'female', 'both')),  -- Permitir NULL durante onboarding
    
    -- Controle de Onboarding
    onboarding_step INTEGER DEFAULT 0,  -- 0=não iniciado, 1=nome/bio, 2=fotos, 3=dados, 4=localização/completo
    onboarding_completed BOOLEAN DEFAULT FALSE,
    
    -- Localização
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    city TEXT,
    state TEXT,
    neighborhood TEXT,
    
    -- Informações extras
    profession TEXT,
    height INTEGER, -- em cm
    education TEXT,
    zodiac_sign TEXT,
    
    -- Configurações
    is_vip BOOLEAN DEFAULT FALSE,
    vip_expires_at TIMESTAMP WITH TIME ZONE,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    is_incognito BOOLEAN DEFAULT FALSE,
    read_receipts_enabled BOOLEAN DEFAULT TRUE,
    
    -- Filtros de busca
    filter_min_age INTEGER DEFAULT 18,
    filter_max_age INTEGER DEFAULT 50,
    filter_max_distance INTEGER DEFAULT 50, -- em km
    
    -- Contadores
    daily_likes_count INTEGER DEFAULT 0,
    daily_likes_reset_at DATE DEFAULT CURRENT_DATE,
    
    -- Timestamps
    last_online_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_profiles_gender ON profiles(gender);
CREATE INDEX idx_profiles_looking_for ON profiles(looking_for);
CREATE INDEX idx_profiles_location ON profiles(latitude, longitude);
CREATE INDEX idx_profiles_birth_date ON profiles(birth_date);
CREATE INDEX idx_profiles_is_active ON profiles(is_active);


-- =============================================
-- FUNÇÃO: calculate_age
-- Data: 27/11/2025
-- Descrição: Calcula idade a partir da data de nascimento
-- =============================================

CREATE OR REPLACE FUNCTION calculate_age(birth_date DATE)
RETURNS INTEGER AS $$
BEGIN
    RETURN DATE_PART('year', AGE(birth_date));
END;
$$ LANGUAGE plpgsql STABLE;


-- =============================================
-- TABELA: photos
-- Data: 27/11/2025
-- Descrição: Fotos dos perfis (máximo 6 por usuário)
-- =============================================

CREATE TABLE photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    position INTEGER NOT NULL CHECK (position >= 0 AND position <= 5),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, position)
);

CREATE INDEX idx_photos_user_id ON photos(user_id);


-- =============================================
-- TABELA: interests
-- Data: 27/11/2025
-- Descrição: Lista de interesses/hobbies disponíveis
-- =============================================

CREATE TABLE interests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    emoji TEXT,
    category TEXT
);

-- Inserir interesses padrão
INSERT INTO interests (name, emoji, category) VALUES
    ('Música', '', 'entretenimento'),
    ('Filmes', '', 'entretenimento'),
    ('Séries', '', 'entretenimento'),
    ('Leitura', '', 'entretenimento'),
    ('Games', '', 'entretenimento'),
    ('Viagens', '', 'lifestyle'),
    ('Fotografia', '', 'lifestyle'),
    ('Culinária', '', 'lifestyle'),
    ('Fitness', '', 'esporte'),
    ('Futebol', '', 'esporte'),
    ('Corrida', '', 'esporte'),
    ('Yoga', '', 'esporte'),
    ('Praia', '', 'lifestyle'),
    ('Natureza', '', 'lifestyle'),
    ('Pets', '', 'lifestyle'),
    ('Arte', '', 'cultura'),
    ('Tecnologia', '', 'trabalho'),
    ('Empreendedorismo', '', 'trabalho'),
    ('Café', '', 'lifestyle'),
    ('Cerveja', '', 'lifestyle'),
    ('Vinho', '', 'lifestyle'),
    ('Dança', '', 'entretenimento'),
    ('Stand-up', '', 'entretenimento'),
    ('Astrologia', '', 'lifestyle');


-- =============================================
-- TABELA: user_interests
-- Data: 27/11/2025
-- Descrição: Relação entre usuários e interesses
-- =============================================

CREATE TABLE user_interests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    interest_id UUID NOT NULL REFERENCES interests(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, interest_id)
);

CREATE INDEX idx_user_interests_user_id ON user_interests(user_id);


-- =============================================
-- TABELA: swipes
-- Data: 27/11/2025
-- Descrição: Registro de likes e passes
-- =============================================

CREATE TABLE swipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    swiper_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    swiped_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('like', 'pass', 'super_like')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(swiper_id, swiped_id)
);

CREATE INDEX idx_swipes_swiper_id ON swipes(swiper_id);
CREATE INDEX idx_swipes_swiped_id ON swipes(swiped_id);
CREATE INDEX idx_swipes_action ON swipes(action);


-- =============================================
-- TABELA: matches
-- Data: 27/11/2025
-- Descrição: Matches entre usuários
-- =============================================

CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Garantir que user1_id < user2_id para evitar duplicatas
    CHECK (user1_id < user2_id),
    UNIQUE(user1_id, user2_id)
);

CREATE INDEX idx_matches_user1 ON matches(user1_id);
CREATE INDEX idx_matches_user2 ON matches(user2_id);


-- =============================================
-- TABELA: conversations
-- Data: 27/11/2025
-- Descrição: Conversas entre usuários com match
-- =============================================

CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    last_message_at TIMESTAMP WITH TIME ZONE,
    last_message_content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(match_id)
);

CREATE INDEX idx_conversations_match_id ON conversations(match_id);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);


-- =============================================
-- TABELA: messages
-- Data: 27/11/2025
-- Descrição: Mensagens das conversas
-- =============================================

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT,
    media_url TEXT,
    media_type TEXT CHECK (media_type IN ('image', 'audio', 'gif')),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);


-- =============================================
-- TABELA: reports
-- Data: 27/11/2025
-- Descrição: Denúncias de usuários
-- =============================================

CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reported_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL CHECK (reason IN (
        'fake_profile', 
        'inappropriate_photos', 
        'harassment', 
        'spam', 
        'underage',
        'other'
    )),
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_reports_reported ON reports(reported_id);
CREATE INDEX idx_reports_status ON reports(status);


-- =============================================
-- TABELA: blocks
-- Data: 27/11/2025
-- Descrição: Usuários bloqueados
-- =============================================

CREATE TABLE blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blocker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(blocker_id, blocked_id)
);

CREATE INDEX idx_blocks_blocker ON blocks(blocker_id);
CREATE INDEX idx_blocks_blocked ON blocks(blocked_id);


-- =============================================
-- FUNÇÃO: check_for_match
-- Data: 27/11/2025
-- Descrição: Verifica e cria match quando ambos curtem
-- =============================================

CREATE OR REPLACE FUNCTION check_for_match()
RETURNS TRIGGER AS $$
DECLARE
    reverse_like_exists BOOLEAN;
    new_match_id UUID;
BEGIN
    -- Só verifica se foi um like ou super_like
    IF NEW.action IN ('like', 'super_like') THEN
        -- Verifica se existe like reverso
        SELECT EXISTS(
            SELECT 1 FROM swipes 
            WHERE swiper_id = NEW.swiped_id 
            AND swiped_id = NEW.swiper_id 
            AND action IN ('like', 'super_like')
        ) INTO reverse_like_exists;
        
        -- Se existe, cria o match
        IF reverse_like_exists THEN
            INSERT INTO matches (user1_id, user2_id)
            VALUES (
                LEAST(NEW.swiper_id, NEW.swiped_id),
                GREATEST(NEW.swiper_id, NEW.swiped_id)
            )
            ON CONFLICT DO NOTHING
            RETURNING id INTO new_match_id;
            
            -- Cria a conversa para o match
            IF new_match_id IS NOT NULL THEN
                INSERT INTO conversations (match_id)
                VALUES (new_match_id);
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para verificar match após swipe
CREATE TRIGGER trigger_check_match
AFTER INSERT ON swipes
FOR EACH ROW
EXECUTE FUNCTION check_for_match();


-- =============================================
-- FUNÇÃO: update_last_message
-- Data: 27/11/2025
-- Descrição: Atualiza timestamp da última mensagem
-- =============================================

CREATE OR REPLACE FUNCTION update_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations 
    SET 
        last_message_at = NEW.created_at,
        last_message_content = NEW.content
    WHERE id = NEW.conversation_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar última mensagem
CREATE TRIGGER trigger_update_last_message
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_last_message();


-- =============================================
-- FUNÇÃO: reset_daily_likes
-- Data: 27/11/2025
-- Descrição: Reseta contador de likes diários
-- =============================================

CREATE OR REPLACE FUNCTION reset_daily_likes()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.daily_likes_reset_at < CURRENT_DATE THEN
        NEW.daily_likes_count := 0;
        NEW.daily_likes_reset_at := CURRENT_DATE;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para resetar likes diários
CREATE TRIGGER trigger_reset_daily_likes
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION reset_daily_likes();


-- =============================================
-- FUNÇÃO: update_updated_at
-- Data: 27/11/2025
-- Descrição: Atualiza campo updated_at automaticamente
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at em profiles
CREATE TRIGGER trigger_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();


-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- Data: 27/11/2025
-- Descrição: Políticas de segurança
-- =============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Usuários podem ver perfis ativos"
ON profiles FOR SELECT
USING (is_active = true OR auth.uid() = id);

CREATE POLICY "Usuários podem editar próprio perfil"
ON profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Usuários podem criar próprio perfil"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Políticas para photos
CREATE POLICY "Todos podem ver fotos"
ON photos FOR SELECT
USING (true);

CREATE POLICY "Usuários podem gerenciar próprias fotos"
ON photos FOR ALL
USING (auth.uid() = user_id);

-- Políticas para swipes
CREATE POLICY "Usuários podem ver próprios swipes"
ON swipes FOR SELECT
USING (auth.uid() = swiper_id);

CREATE POLICY "Usuários podem criar swipes"
ON swipes FOR INSERT
WITH CHECK (auth.uid() = swiper_id);

-- Políticas para matches
CREATE POLICY "Usuários podem ver próprios matches"
ON matches FOR SELECT
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Políticas para conversations
CREATE POLICY "Usuários podem ver suas conversas"
ON conversations FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM matches m
        WHERE m.id = conversations.match_id
        AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
    )
);

CREATE POLICY "Usuários podem atualizar suas conversas"
ON conversations FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM matches m
        WHERE m.id = conversations.match_id
        AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
    )
);

-- Políticas para messages
CREATE POLICY "Usuários podem ver mensagens de suas conversas"
ON messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM conversations c
        JOIN matches m ON c.match_id = m.id
        WHERE c.id = messages.conversation_id
        AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
    )
);

CREATE POLICY "Usuários podem enviar mensagens em suas conversas"
ON messages FOR INSERT
WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
        SELECT 1 FROM conversations c
        JOIN matches m ON c.match_id = m.id
        WHERE c.id = conversation_id
        AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
    )
);


-- =============================================
-- STORAGE BUCKETS
-- Data: 27/11/2025
-- Descrição: Executar no Supabase Dashboard > Storage
-- =============================================

-- NOTA: Criar bucket "photos" no Dashboard do Supabase
-- Configurações:
-- - Nome: photos
-- - Public: true
-- - Allowed MIME types: image/jpeg, image/png, image/webp
-- - Max file size: 5MB


-- =============================================
-- POLÍTICAS PARA STORAGE - BUCKET PHOTOS
-- Data: 27/11/2025
-- Descrição: Permissões para upload/download de fotos
-- =============================================

-- Permitir usuários autenticados fazer upload de suas fotos
CREATE POLICY "Usuários podem fazer upload de suas fotos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir que qualquer pessoa veja fotos (perfis públicos)
CREATE POLICY "Fotos são públicas para visualização"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'photos');

-- Permitir usuários deletarem suas próprias fotos
CREATE POLICY "Usuários podem deletar suas fotos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);


-- =============================================
-- CORREÇÃO: RLS para ver quem curtiu
-- Data: 28/11/2025
-- Descrição: Permitir que usuários vejam swipes recebidos
-- =============================================

DROP POLICY IF EXISTS "Usuários podem ver próprios swipes" ON swipes;

CREATE POLICY "Usuários podem ver swipes envolvendo eles"
ON swipes FOR SELECT
USING (auth.uid() = swiper_id OR auth.uid() = swiped_id);


-- =============================================
-- FUNÇÃO: unmatch_user
-- Data: 28/11/2025
-- Descrição: Desfaz match e limpa swipes (Security Definer para bypass RLS)
-- =============================================

CREATE OR REPLACE FUNCTION unmatch_user(match_id UUID)
RETURNS VOID AS $$
DECLARE
    v_user1_id UUID;
    v_user2_id UUID;
    v_caller_id UUID;
BEGIN
    -- Pegar ID do usuário que chamou a função
    v_caller_id := auth.uid();

    -- Buscar dados do match
    SELECT user1_id, user2_id INTO v_user1_id, v_user2_id
    FROM matches
    WHERE id = match_id;

    -- Verificar se o match existe
    IF v_user1_id IS NULL THEN
        RAISE EXCEPTION 'Match não encontrado';
    END IF;

    -- Verificar permissão (usuário deve fazer parte do match)
    IF v_caller_id != v_user1_id AND v_caller_id != v_user2_id THEN
        RAISE EXCEPTION 'Permissão negada';
    END IF;

    -- Deletar swipes (resetar interação)
    DELETE FROM swipes 
    WHERE (swiper_id = v_user1_id AND swiped_id = v_user2_id)
       OR (swiper_id = v_user2_id AND swiped_id = v_user1_id);

    -- Deletar match (cascade deletará conversa e mensagens)
    DELETE FROM matches WHERE id = match_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =============================================
-- STORAGE BUCKET: chat-media
-- Data: 28/11/2025
-- Descrição: Bucket para fotos e áudios do chat
-- =============================================

-- 1. Criar bucket 'chat-media' no Supabase Dashboard
-- Configurações:
-- - Public: true
-- - Allowed MIME types: image/*, audio/*
-- - Max file size: 10MB

-- 2. Políticas de Segurança (RLS) para chat-media

-- Permitir upload apenas para usuários autenticados
DROP POLICY IF EXISTS "Usuários autenticados podem fazer upload de mídia" ON storage.objects;
CREATE POLICY "Usuários autenticados podem fazer upload de mídia"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'chat-media' AND
  name LIKE (auth.uid() || '/%')
);

-- Permitir visualização pública (ou restrita, mas pública é mais fácil para chat)
-- Para maior privacidade, poderíamos restringir, mas requer tokens assinados ou policies complexas
DROP POLICY IF EXISTS "Mídia do chat é pública para leitura" ON storage.objects;
CREATE POLICY "Mídia do chat é pública para leitura"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'chat-media');

-- Permitir deletar seus próprios arquivos
DROP POLICY IF EXISTS "Usuários podem deletar sua própria mídia" ON storage.objects;
CREATE POLICY "Usuários podem deletar sua própria mídia"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'chat-media' AND
  name LIKE (auth.uid() || '/%')
);


-- =============================================
-- TABELA: push_tokens
-- Data: 28/11/2025
-- Descrição: Tokens FCM para Push Notifications
-- =============================================

CREATE TABLE IF NOT EXISTS push_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('android', 'ios', 'web')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

CREATE INDEX idx_push_tokens_user_id ON push_tokens(user_id);
CREATE INDEX idx_push_tokens_token ON push_tokens(token);

-- RLS para push_tokens
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver/gerenciar apenas seus próprios tokens
CREATE POLICY "Usuários podem ver próprio token"
ON push_tokens FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir próprio token"
ON push_tokens FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar próprio token"
ON push_tokens FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar próprio token"
ON push_tokens FOR DELETE
USING (auth.uid() = user_id);


-- =============================================
-- TABELA: notifications
-- Data: 28/11/2025
-- Descrição: Log de notificações enviadas
-- =============================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('match', 'message', 'like', 'super_like')),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    data JSONB,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Referências opcionais
    sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    match_id UUID REFERENCES matches(id) ON DELETE SET NULL,
    conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_sent_at ON notifications(sent_at DESC);

-- RLS para notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver próprias notificações"
ON notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Sistema pode inserir notificações"
ON notifications FOR INSERT
WITH CHECK (true);


-- =============================================
-- NOTA SOBRE PUSH NOTIFICATIONS
-- Data: 28/11/2025
-- =============================================
-- 
-- As Push Notifications são enviadas diretamente pelo APP
-- através da Edge Function 'send-push-notification'.
-- 
-- O app chama a Edge Function quando:
-- - Novo match é criado (em lib/supabase.ts -> swipes.create)
-- - Nova mensagem é enviada (em components/ChatScreen.tsx -> handleSend)
-- 
-- NÃO usamos triggers do banco pois o Supabase não permite
-- configurar variáveis customizadas (app.edge_function_url).
-- 
-- A Edge Function foi deployada em:
-- https://ardevnlnrorffyhdsytn.supabase.co/functions/v1/send-push-notification
-- =============================================


-- =============================================
-- TABELA: boosts
-- Data: 28/11/2025
-- Descrição: Registro de boosts comprados/ativos
-- =============================================

CREATE TABLE IF NOT EXISTS boosts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    price DECIMAL(10, 2) DEFAULT 1.99,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_boosts_user_id ON boosts(user_id);
CREATE INDEX idx_boosts_expires_at ON boosts(expires_at);
CREATE INDEX idx_boosts_is_active ON boosts(is_active);

-- RLS para boosts
ALTER TABLE boosts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver próprios boosts"
ON boosts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir próprios boosts"
ON boosts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar próprios boosts"
ON boosts FOR UPDATE
USING (auth.uid() = user_id);


-- =============================================
-- TABELA: reports (Denúncias)
-- Data: 28/11/2025
-- Descrição: Sistema de denúncias de perfis
-- =============================================

CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reported_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL CHECK (reason IN ('fake_profile', 'inappropriate_photos', 'harassment', 'spam', 'underage', 'other')),
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'action_taken', 'dismissed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(reporter_id, reported_id)
);

CREATE INDEX idx_reports_reported_id ON reports(reported_id);
CREATE INDEX idx_reports_status ON reports(status);

-- RLS para reports
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem criar denúncias"
ON reports FOR INSERT
WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Usuários podem ver próprias denúncias"
ON reports FOR SELECT
USING (auth.uid() = reporter_id);


-- =============================================
-- MIGRAÇÃO: Adicionar coluna boost_expires_at em profiles
-- Data: 28/11/2025
-- Descrição: Campo para controlar boost ativo no perfil
-- =============================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS boost_expires_at TIMESTAMP WITH TIME ZONE;
CREATE INDEX IF NOT EXISTS idx_profiles_boost_expires_at ON profiles(boost_expires_at);


-- =============================================
-- MIGRAÇÃO: Adicionar coluna reply_to_id em messages
-- Data: 28/11/2025
-- Descrição: Campo para responder mensagem específica
-- =============================================

ALTER TABLE messages ADD COLUMN IF NOT EXISTS reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL;


-- =============================================
-- MIGRAÇÃO: Adicionar tabela message_reactions
-- Data: 28/11/2025
-- Descrição: Reações em mensagens
-- =============================================

CREATE TABLE IF NOT EXISTS message_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reaction TEXT NOT NULL CHECK (reaction IN ('❤️', '😂', '😮', '😢', '👍')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(message_id, user_id)
);

CREATE INDEX idx_message_reactions_message_id ON message_reactions(message_id);

-- RLS para message_reactions
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver reações"
ON message_reactions FOR SELECT
USING (true);

CREATE POLICY "Usuários podem adicionar reações"
ON message_reactions FOR INSERT
WITH CHECK (auth.uid() = user_id);


CREATE POLICY "Usuários podem remover próprias reações"
ON message_reactions FOR DELETE
USING (auth.uid() = user_id);


-- =============================================
-- NOVOS INTERESSES (FUN LIST)
-- Data: 02/12/2025
-- Descrição: Lista atualizada com gírias e categorias divertidas
-- =============================================

-- Limpar interesses antigos para substituir pela nova lista
-- DELETE FROM user_interests;
-- DELETE FROM interests;

INSERT INTO interests (name, category, emoji) VALUES
    -- 🔥 Quente (Rápido / Casual)
    ('Pente e Rala', '🔥 Quente', '😏'),
    ('Vapo Vapo', '🔥 Quente', '💨'),
    ('Só o Pente', '🔥 Quente', '🔥'),
    ('Revoada', '🔥 Quente', '🦅'),
    ('No Sigilo', '🔥 Quente', '🤫'),
    ('Sem Apego', '🔥 Quente', '🍃'),
    ('Remember', '🔥 Quente', '🔄'),
    ('Flashback', '🔥 Quente', '🔙'),
    ('Só o Mel', '🔥 Quente', '🍯'),
    ('Um Lance', '🔥 Quente', '🎲'),
    ('Só Trombada', '🔥 Quente', '💥'),
    ('Madeirada', '🔥 Quente', '🪵'),
    ('0800', '🔥 Quente', '🆓'),

    -- ❤️ Romântico (Namoro / Sério)
    ('Fechamento', '❤️ Romântico', '🔒'),
    ('Meu Dengo', '❤️ Romântico', '🥰'),
    ('Xodó', '❤️ Romântico', '🥺'),
    ('Mozão', '❤️ Romântico', '💍'),
    ('Pra Somar', '❤️ Romântico', '➕'),
    ('Lovezinho', '❤️ Romântico', '🫶'),
    ('Fiel de Fechar', '❤️ Romântico', '🤝'),
    ('Pra Casar', '❤️ Romântico', '👰'),
    ('Meu Cheiro', '❤️ Romântico', '🌹'),
    ('Contatinho Fixo', '❤️ Romântico', '📌'),

    -- 🍻 Social (Conversa / Vibe)
    ('Resenha', '🍻 Social', '🗣️'),
    ('Desenrolo', '🍻 Social', '🧶'),
    ('Sintonia', '🍻 Social', '✨'),
    ('Trocar Ideia', '🍻 Social', '💡'),
    ('De Boa', '🍻 Social', '✌️'),
    ('Só Vamo', '🍻 Social', '🚀'),
    ('Mó Fita', '🍻 Social', '📼'),

    -- 🎭 Estilo / Personalidade
    ('Mandrake', '🎭 Estilo', '🕶️'),
    ('Do Corre', '🎭 Estilo', '🏃'),
    ('Cria', '🎭 Estilo', '🤙'),
    ('Paty', '🎭 Estilo', '💅'),
    ('Biscoiteiro(a)', '🎭 Estilo', '🍪'),
    ('Low Profile', '🎭 Estilo', '👻'),
    ('Ratx de Academia', '🎭 Estilo', '💪'),

    -- 🛑 Limites
    ('Sem Lero-Lero', '🛑 Limites', '🚫'),
    ('Poucas Ideias', '🛑 Limites', '🤐'),
    ('Zero Caô', '🛑 Limites', '🤥'),
    ('Sem Drama', '🛑 Limites', '🎭'),
    ('Sem Migué', '🛑 Limites', '🙅'),
    ('Vacilão Passa', '🛑 Limites', '👋')
ON CONFLICT (name) DO UPDATE SET 
    category = EXCLUDED.category,
    emoji = EXCLUDED.emoji;


-- =============================================
-- CORREÇÃO: RLS para marcar mensagens como lidas
-- Data: 02/12/2025
-- Descrição: Permitir que usuários atualizem mensagens em suas conversas (para marcar como lida)
-- =============================================

CREATE POLICY "Usuários podem atualizar mensagens de suas conversas"
ON messages FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM conversations c
        JOIN matches m ON c.match_id = m.id
        WHERE c.id = messages.conversation_id
        AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
    )
);


-- =============================================
-- CORREÇÃO DE SEGURANÇA E LINTER
-- Data: 02/12/2025
-- Descrição: Correções de segurança apontadas pelo linter do Supabase
-- =============================================

-- 1. Habilitar RLS na tabela profiles (estava desabilitado)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Fixar search_path das funções para evitar hijacking
-- Isso é crítico especialmente para funções SECURITY DEFINER
ALTER FUNCTION public.calculate_age(DATE) SET search_path = public;
ALTER FUNCTION public.reset_daily_likes() SET search_path = public;
ALTER FUNCTION public.update_updated_at() SET search_path = public;
ALTER FUNCTION public.check_for_match() SET search_path = public;
ALTER FUNCTION public.update_last_message() SET search_path = public;
ALTER FUNCTION public.unmatch_user(UUID) SET search_path = public;

-- 3. Garantir RLS em todas as outras tabelas (prevenção)
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE boosts ENABLE ROW LEVEL SECURITY;



-- =============================================
-- FUNÇÃO: increment_like_count
-- Data: 02/12/2025
-- Descrição: Incrementa o contador de likes diários do usuário (Faltava no arquivo)
-- =============================================

CREATE OR REPLACE FUNCTION increment_like_count(user_id UUID)
RETURNS VOID AS c:\Users\Administrator\Downloads\pega-ou-passa
BEGIN
    -- Verificação de segurança: usuário só pode incrementar seu próprio contador
    IF auth.uid() != user_id THEN
        RAISE EXCEPTION 'Permissão negada';
    END IF;

    UPDATE profiles
    SET daily_likes_count = daily_likes_count + 1
    WHERE id = user_id;
END;
c:\Users\Administrator\Downloads\pega-ou-passa LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- =============================================
-- SEGURANÇA: Proteger colunas sensíveis de profiles
-- Data: 02/12/2025
-- Descrição: Impede que usuários alterem status VIP e contadores via API
-- =============================================

CREATE OR REPLACE FUNCTION protect_profile_fields()
RETURNS TRIGGER AS c:\Users\Administrator\Downloads\pega-ou-passa
BEGIN
    -- Se for service_role (admin/sistema), permite tudo
    IF (auth.role() = 'service_role') THEN
        RETURN NEW;
    END IF;

    -- Verificar se campos sensíveis foram alterados
    IF (NEW.is_vip IS DISTINCT FROM OLD.is_vip) OR
       (NEW.vip_expires_at IS DISTINCT FROM OLD.vip_expires_at) OR
       (NEW.is_verified IS DISTINCT FROM OLD.is_verified) OR
       (NEW.daily_likes_count IS DISTINCT FROM OLD.daily_likes_count) OR
       (NEW.daily_likes_reset_at IS DISTINCT FROM OLD.daily_likes_reset_at) OR
       (NEW.boost_expires_at IS DISTINCT FROM OLD.boost_expires_at) THEN
        RAISE EXCEPTION 'Você não tem permissão para alterar campos protegidos (VIP, Verificação, Boost, Likes).';
    END IF;

    RETURN NEW;
END;
c:\Users\Administrator\Downloads\pega-ou-passa LANGUAGE plpgsql;

CREATE TRIGGER trigger_protect_profile_fields
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION protect_profile_fields();


-- =============================================
-- SEGURANÇA: Permitir deletar própria conta
-- Data: 02/12/2025
-- Descrição: Policy para permitir exclusão de conta
-- =============================================

CREATE POLICY "Usuários podem deletar próprio perfil"
ON profiles FOR DELETE
USING (auth.uid() = id);


-- =============================================
-- CORREÇÃO: Policies faltantes para Interesses
-- Data: 02/12/2025
-- Descrição: Permitir gestão de interesses
-- =============================================

-- 1. Tabela interests (Lista de interesses do sistema)
ALTER TABLE interests ENABLE ROW LEVEL SECURITY;

-- Todos podem ver a lista de interesses disponíveis
DROP POLICY IF EXISTS "Interesses são públicos" ON interests;
CREATE POLICY "Interesses são públicos"
ON interests FOR SELECT
USING (true);

-- Apenas service_role pode modificar (padrão do RLS deny-all para insert/update/delete)


-- 2. Tabela user_interests (Vínculo usuário-interesse)
-- Todos podem ver interesses dos usuários (para mostrar no perfil/card)
DROP POLICY IF EXISTS "Ver interesses de usuários" ON user_interests;
CREATE POLICY "Ver interesses de usuários"
ON user_interests FOR SELECT
USING (true);

-- Usuários podem adicionar seus próprios interesses
DROP POLICY IF EXISTS "Usuários podem adicionar interesses" ON user_interests;
CREATE POLICY "Usuários podem adicionar interesses"
ON user_interests FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Usuários podem remover seus próprios interesses
DROP POLICY IF EXISTS "Usuários podem remover interesses" ON user_interests;
CREATE POLICY "Usuários podem remover interesses"
ON user_interests FOR DELETE
USING (auth.uid() = user_id);


-- =============================================
-- MIGRAÇÃO: Adicionar last_vibe_activation
-- Data: 29/11/2025
-- Descrição: Controle de limite de tempo para o Modo Agora
-- =============================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_vibe_activation TIMESTAMP WITH TIME ZONE;


-- =============================================
-- MIGRAÇÃO: Adicionar has_seen_tutorial
-- Data: 11/12/2025
-- Descrição: Persiste estado do tutorial no banco
-- =============================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_seen_tutorial BOOLEAN DEFAULT FALSE;


-- =============================================
-- TABELA: admin_logs
-- Data: 11/12/2025
-- Descrição: Logs de auditoria das ações do admin
-- =============================================

CREATE TABLE IF NOT EXISTS admin_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES profiles(id),
    action TEXT NOT NULL, -- 'vip_granted', 'vip_removed', 'user_banned', 'user_unbanned', 'report_resolved', 'report_dismissed'
    target_user_id UUID REFERENCES profiles(id),
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index para busca por data
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at DESC);

-- Index para busca por admin
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);

-- RLS
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Permitir insert para usuários autenticados
CREATE POLICY "Allow authenticated users to insert logs" ON admin_logs
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- Policy: Permitir select para usuários autenticados
CREATE POLICY "Allow authenticated users to read logs" ON admin_logs
    FOR SELECT TO authenticated
    USING (true);
