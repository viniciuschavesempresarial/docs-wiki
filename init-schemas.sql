-- =============================================================================
-- 1. EXTENSÕES DO POSTGRESQL
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================================================
-- 2. CRIAÇÃO DOS SCHEMAS
-- =============================================================================
CREATE SCHEMA IF NOT EXISTS iam;
CREATE SCHEMA IF NOT EXISTS conteudo;
CREATE SCHEMA IF NOT EXISTS busca;

-- =============================================================================
-- 3. CRIAÇÃO DE ROLES / USUÁRIOS DE BANCO
-- =============================================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'iam_user') THEN
        CREATE USER iam_user WITH PASSWORD 'senha_iam_segura';
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'content_user') THEN
        CREATE USER content_user WITH PASSWORD 'senha_content_segura';
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'search_user') THEN
        CREATE USER search_user WITH PASSWORD 'senha_search_segura';
    END IF;
END $$;

-- Define o search_path padrão para cada serviço (incluindo public para extensões como vector e pg_trgm)
ALTER USER iam_user SET search_path TO iam, public;
ALTER USER content_user SET search_path TO conteudo, public;
ALTER USER search_user SET search_path TO busca, public;

-- Concessão de Privilégios Mínimos por Schema
GRANT USAGE ON SCHEMA iam TO iam_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA iam TO iam_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA iam TO iam_user;

GRANT USAGE ON SCHEMA conteudo TO content_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA conteudo TO content_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA conteudo TO content_user;
GRANT USAGE ON SCHEMA busca TO content_user;
GRANT SELECT, DELETE ON ALL TABLES IN SCHEMA busca TO content_user;

GRANT USAGE ON SCHEMA busca TO search_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA busca TO search_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA busca TO search_user;

-- =============================================================================
-- 4. SCHEMA IAM (AUTENTICAÇÃO & RBAC)
-- =============================================================================
CREATE TABLE iam.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    nome VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_system_protected BOOLEAN NOT NULL DEFAULT FALSE, -- Impede deleção de super admins
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE iam.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(50) UNIQUE NOT NULL,
    descricao TEXT
);

CREATE TABLE iam.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    descricao TEXT
);

CREATE TABLE iam.user_roles (
    user_id UUID NOT NULL REFERENCES iam.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES iam.roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE iam.role_permissions (
    role_id UUID NOT NULL REFERENCES iam.roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES iam.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- Índices FK do Schema IAM
CREATE INDEX idx_user_roles_role_id ON iam.user_roles(role_id);
CREATE INDEX idx_role_permissions_permission_id ON iam.role_permissions(permission_id);

-- SEED: Roles e Permissões Básicas
INSERT INTO iam.roles (id, nome, descricao) VALUES
    ('11111111-1111-1111-1111-111111111111', 'ADMIN', 'Acesso irrestrito ao sistema'),
    ('22222222-2222-2222-2222-222222222222', 'EDITOR', 'Criação e edição de conteúdos'),
    ('33333333-3333-3333-3333-333333333333', 'LEITOR', 'Acesso de leitura e busca')
ON CONFLICT (nome) DO NOTHING;

INSERT INTO iam.permissions (slug, descricao) VALUES
    ('materials:create', 'Permissão para criar materiais'),
    ('materials:edit', 'Permissão para editar materiais e criar versões'),
    ('materials:rollback', 'Permissão para executar rollback de versões'),
    ('materials:delete', 'Permissão para arquivar/excluir materiais'),
    ('search:query', 'Permissão para executar buscas híbridas e RAG'),
    ('admin:all', 'Permissão de administração global')
ON CONFLICT (slug) DO NOTHING;

-- SEED: Usuário Super Admin Inicial (Senha: 123456 -> Hash Bcrypt 12 rounds)
INSERT INTO iam.users (id, email, nome, password_hash, is_active, is_system_protected) VALUES
    ('00000000-0000-0000-0000-000000000001', 'admin@docswiki.local', 'Administrador do Sistema', '$2b$12$gCaVHlfBFxm35sLYFypJjOwRZ8faBfhoIvnfBl6sqEiGq/UqHaMxS', TRUE, TRUE)
ON CONFLICT (email) DO NOTHING;

INSERT INTO iam.user_roles (user_id, role_id) VALUES
    ('00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 5. SCHEMA CONTEUDO (OKF & HISTÓRICO GIT-LIKE)
-- =============================================================================
CREATE TABLE conteudo.materiais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    versao_head_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE conteudo.material_versoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_id UUID NOT NULL REFERENCES conteudo.materiais(id) ON DELETE CASCADE,
    versao_num INT NOT NULL,
    parent_version_id UUID REFERENCES conteudo.material_versoes(id),
    conteudo_okf TEXT NOT NULL,         -- YAML Frontmatter + Markdown Body completo
    conteudo_jsonb JSONB NOT NULL,     -- Metadados estruturados extraídos do Frontmatter
    commit_message TEXT NOT NULL,
    autor_id UUID NOT NULL,            -- Referência lógica ao usuário no IAM
    hash_sha256 VARCHAR(64) NOT NULL,  -- Hash determinístico do conteúdo
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_material_versao UNIQUE (material_id, versao_num)
);

ALTER TABLE conteudo.materiais 
ADD CONSTRAINT fk_versao_head FOREIGN KEY (versao_head_id) REFERENCES conteudo.material_versoes(id);

-- Índices FK e Buscas no Schema Conteúdo
CREATE INDEX idx_material_versoes_material_id ON conteudo.material_versoes(material_id);
CREATE INDEX idx_material_versoes_autor_id ON conteudo.material_versoes(autor_id);
CREATE INDEX idx_material_versoes_parent_id ON conteudo.material_versoes(parent_version_id);
CREATE INDEX idx_materiais_categoria ON conteudo.materiais(categoria);
CREATE INDEX idx_materiais_tipo ON conteudo.materiais(tipo);

-- =============================================================================
-- 6. SCHEMA BUSCA (PARENT-DOCUMENT RETRIEVER & VETORES HNSW)
-- =============================================================================

-- Tabela Pai (Metadados do Documento e Busca Textual Global)
CREATE TABLE busca.indices_busca (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_id UUID NOT NULL UNIQUE,
    versao_num INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    autor VARCHAR(255),
    categoria VARCHAR(100),
    tipo VARCHAR(50),
    tags TEXT[] NOT NULL DEFAULT '{}',
    numero_palavras INT NOT NULL DEFAULT 0,
    tamanho_bytes INT NOT NULL DEFAULT 0,
    resumo_okf TEXT,
    data_publicacao TIMESTAMPTZ DEFAULT NOW(),
    busca_texto tsvector GENERATED ALWAYS AS (
        to_tsvector('portuguese', 
            coalesce(titulo, '') || ' ' || 
            coalesce(autor, '') || ' ' || 
            coalesce(categoria, '') || ' ' || 
            coalesce(resumo_okf, '')
        )
    ) STORED,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela Filha (Chunks Estruturados por Capítulos para Parent-Document Retriever)
-- Modelo SentenceTransformers: 768 dimensões
CREATE TABLE busca.material_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_id UUID NOT NULL REFERENCES busca.indices_busca(material_id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    titulo_secao VARCHAR(255),
    conteudo_chunk TEXT NOT NULL,
    embedding vector(768) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_material_chunk UNIQUE (material_id, chunk_index)
);

-- =============================================================================
-- 7. ÍNDICES DE ALTO DESEMPENHO NO SCHEMA BUSCA
-- =============================================================================
-- 1. Full-Text Search (GIN)
CREATE INDEX idx_busca_texto_gin ON busca.indices_busca USING GIN (busca_texto);

-- 2. Tags Array Search (GIN)
CREATE INDEX idx_busca_tags_gin ON busca.indices_busca USING GIN (tags);

-- 3. Busca Fuzzy / Distância de Levenshtein (Trigram GIN)
CREATE INDEX idx_busca_titulo_trgm ON busca.indices_busca USING GIN (titulo gin_trgm_ops);
CREATE INDEX idx_busca_autor_trgm ON busca.indices_busca USING GIN (autor gin_trgm_ops);

-- 4. Busca Vetorial Semântica (HNSW com Cosseno)
CREATE INDEX idx_chunks_embedding_hnsw ON busca.material_chunks 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- 5. Foreign Key Index
CREATE INDEX idx_material_chunks_material_id ON busca.material_chunks(material_id);
