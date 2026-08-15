import { http, HttpResponse } from 'msw';

export const mockUser = {
  id: 'usr-admin-1',
  email: 'admin@docswiki.local',
  nome: 'Administrador do Sistema',
  roles: ['ADMIN'],
  permissions: ['material:read', 'material:write', 'material:delete', 'admin:manage'],
};

export const mockMaterials = [
  {
    id: 'mat-001',
    slug: 'guia-arquitetura-distribuida',
    tipo: 'livro',
    categoria: 'Arquitetura de Software',
    status: 'published' as const,
    versao_head_id: 'ver-001',
    created_at: new Date('2026-01-15T10:00:00Z'),
    updated_at: new Date('2026-02-01T14:30:00Z'),
    titulo: 'Guia de Arquitetura Distribuída',
    autor: 'Martin Fowler',
    tags: ['microsserviços', 'distribuído', 'cloud', 'resiliência'],
    tamanho_bytes: 45200,
    numero_palavras: 6200,
    resumo_okf: 'Um guia completo sobre padrões de mensageria, CQRS, event sourcing e resiliência em microsserviços.',
    conteudo_okf: `---
title: Guia de Arquitetura Distribuída
slug: guia-arquitetura-distribuida
type: livro
category: Arquitetura de Software
tags:
  - microsserviços
  - distribuído
  - cloud
  - resiliência
author: Martin Fowler
author_id: usr-admin-1
data_publicacao: '2026-01-15'
---

# Guia de Arquitetura Distribuída

## 1. Introdução a Microsserviços
Microsserviços são uma abordagem arquitetural onde aplicações são compostas por serviços independentes e desacoplados.

## 2. Padrões de Mensageria
O uso de filas como RabbitMQ e Kafka permite comunicação assíncrona tolerante a falhas.
`,
  },
  {
    id: 'mat-002',
    slug: 'nlp-e-embeddings-modernos',
    tipo: 'artigo',
    categoria: 'Inteligência Artificial',
    status: 'published' as const,
    versao_head_id: 'ver-002',
    created_at: new Date('2026-02-10T09:00:00Z'),
    updated_at: new Date('2026-02-12T11:20:00Z'),
    titulo: 'NLP e Embeddings Modernos para Busca Híbrida',
    autor: 'Yann LeCun',
    tags: ['ia', 'nlp', 'embeddings', 'pgvector', 'rag'],
    tamanho_bytes: 31800,
    numero_palavras: 4100,
    resumo_okf: 'Como combinar busca vetorial e busca lexical BM25 para obter resultados superiores em sistemas RAG.',
    conteudo_okf: `---
title: NLP e Embeddings Modernos para Busca Híbrida
slug: nlp-e-embeddings-modernos
type: artigo
category: Inteligência Artificial
tags:
  - ia
  - nlp
  - embeddings
  - pgvector
  - rag
author: Yann LeCun
author_id: usr-admin-1
data_publicacao: '2026-02-10'
---

# NLP e Embeddings Modernos

## 1. Modelos de Embeddings Multilíngues
SentenceTransformers com MPNet fornecem vetores densos de 768 dimensões com alta acurácia semântica.

## 2. Busca Híbrida
A combinação de BM25 e Distância Cosseno no pgvector (HNSW) reduz alucinações e melhora o recall.
`,
  },
  {
    id: 'mat-003',
    slug: 'padroes-seguranca-iam-oauth2',
    tipo: 'manual',
    categoria: 'Segurança & IAM',
    status: 'published' as const,
    versao_head_id: 'ver-003',
    created_at: new Date('2026-03-01T15:00:00Z'),
    updated_at: new Date('2026-03-05T18:00:00Z'),
    titulo: 'Padrões de Segurança IAM e Cookie HttpOnly',
    autor: 'Bruce Schneier',
    tags: ['segurança', 'iam', 'jwt', 'httponly', 'rbac'],
    tamanho_bytes: 28400,
    numero_palavras: 3800,
    resumo_okf: 'Implementação de autenticação JWT segura armazenada em Cookies HttpOnly, prevenindo ataques XSS e CSRF.',
    conteudo_okf: `---
title: Padrões de Segurança IAM e Cookie HttpOnly
slug: padroes-seguranca-iam-oauth2
type: manual
category: Segurança & IAM
tags:
  - segurança
  - iam
  - jwt
  - httponly
  - rbac
author: Bruce Schneier
author_id: usr-admin-1
data_publicacao: '2026-03-01'
---

# Padrões de Segurança IAM

## 1. Proteção de Tokens JWT
Nunca armazene tokens de sessão no localStorage. Use cookies HttpOnly, Secure e SameSite.
`,
  },
];

let currentUser: typeof mockUser | null = mockUser;

export const handlers = [
  // --- IAM Auth Handlers ---
  http.post('/api/iam/login', async ({ request }) => {
    const body = (await request.json()) as { email?: string; senha?: string };
    if (!body.email || !body.senha) {
      return HttpResponse.json({ message: 'Email e senha são obrigatórios' }, { status: 400 });
    }
    currentUser = mockUser;
    return HttpResponse.json({
      user: mockUser,
      message: 'Login realizado com sucesso',
    });
  }),

  http.post('/api/iam/register', async ({ request }) => {
    const body = (await request.json()) as { nome?: string; email?: string; senha?: string };
    if (!body.nome || !body.email || !body.senha) {
      return HttpResponse.json({ message: 'Campos incompletos' }, { status: 400 });
    }
    currentUser = {
      ...mockUser,
      nome: body.nome,
      email: body.email,
    };
    return HttpResponse.json({
      user: currentUser,
      message: 'Usuário registrado com sucesso',
    });
  }),

  http.post('/api/iam/logout', () => {
    currentUser = null;
    return HttpResponse.json({ message: 'Sessão encerrada com sucesso' });
  }),

  http.get('/api/iam/me', () => {
    if (!currentUser) {
      return HttpResponse.json({ message: 'Não autenticado' }, { status: 401 });
    }
    return HttpResponse.json({ user: currentUser });
  }),

  // --- Content / Materials Handlers ---
  http.get('/api/content/materials', () => {
    return HttpResponse.json({
      materials: mockMaterials,
      items: mockMaterials,
      total: mockMaterials.length,
    });
  }),

  http.get('/api/content/materials/:id', ({ params }) => {
    const material = mockMaterials.find((m) => m.id === params.id || m.slug === params.id);
    if (!material) {
      return HttpResponse.json({ message: 'Material não encontrado' }, { status: 404 });
    }
    return HttpResponse.json({
      material,
      versao: {
        id: material.versao_head_id,
        material_id: material.id,
        versao_num: 1,
        conteudo_okf: material.conteudo_okf,
        commit_message: 'Versão inicial',
        autor_id: 'usr-admin-1',
        hash_sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        created_at: material.updated_at,
      },
    });
  }),

  http.post('/api/content/materials', async ({ request }) => {
    const body = (await request.json()) as {
      conteudo_okf: string;
      commit_message: string;
      id?: string;
    };
    const newMaterial = {
      id: body.id || `mat-${Date.now()}`,
      slug: 'material-salvo-' + Date.now(),
      tipo: 'artigo',
      categoria: 'Geral',
      status: 'published' as const,
      versao_head_id: `ver-${Date.now()}`,
      created_at: new Date(),
      updated_at: new Date(),
      titulo: 'Documento Atualizado',
      autor: currentUser?.nome || 'Administrador',
      tags: ['wiki', 'docs'],
      tamanho_bytes: body.conteudo_okf.length,
      numero_palavras: body.conteudo_okf.split(/\s+/).length,
      resumo_okf: 'Resumo do material salvo...',
      conteudo_okf: body.conteudo_okf,
    };
    return HttpResponse.json({
      material: newMaterial,
      versao: {
        id: newMaterial.versao_head_id,
        versao_num: 2,
        commit_message: body.commit_message,
        conteudo_okf: body.conteudo_okf,
      },
    });
  }),

  http.get('/api/content/materials/:id/diff', ({ request, params }) => {
    const url = new URL(request.url);
    const v1 = parseInt(url.searchParams.get('v1') || '1', 10);
    const v2 = parseInt(url.searchParams.get('v2') || '2', 10);

    return HttpResponse.json({
      material_id: params.id,
      v1,
      v2,
      changes: [
        { type: 'unchanged', line_v1: 1, line_v2: 1, content: '---' },
        { type: 'removed', line_v1: 2, content: 'title: Antigo Título do Documento' },
        { type: 'added', line_v2: 2, content: 'title: Novo Título Atualizado' },
        { type: 'unchanged', line_v1: 3, line_v2: 3, content: 'type: artigo' },
        { type: 'unchanged', line_v1: 4, line_v2: 4, content: 'category: Arquitetura' },
        { type: 'unchanged', line_v1: 5, line_v2: 5, content: '---' },
        { type: 'unchanged', line_v1: 6, line_v2: 6, content: '' },
        { type: 'removed', line_v1: 7, content: '# Introdução Antiga' },
        { type: 'added', line_v2: 7, content: '# Introdução Moderna e Detalhada' },
        { type: 'added', line_v2: 8, content: 'Novo parágrafo com explicações adicionais.' },
      ],
    });
  }),

  http.post('/api/content/materials/:id/rollback', async ({ request, params }) => {
    const body = (await request.json()) as { versao_num: number };
    return HttpResponse.json({
      message: `Rollback para a versão ${body.versao_num} executado com sucesso`,
      material_id: params.id,
      versao_head: body.versao_num,
    });
  }),

  // --- Search & NLP RAG Handlers ---
  http.get('/api/search', ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get('q') || '';
    const summarize = url.searchParams.get('summarize') === 'true';
    const categoria = url.searchParams.get('categoria');

    let filtered = mockMaterials.map((m, idx) => ({
      material_id: m.id,
      titulo: m.titulo,
      slug: m.slug,
      autor: m.autor,
      categoria: m.categoria,
      tipo: m.tipo,
      tags: m.tags,
      resumo_okf: m.resumo_okf,
      data_publicacao: '2026-02-01',
      text_score: 0.85 - idx * 0.1,
      vector_score: 0.92 - idx * 0.08,
      hybrid_score: 0.89 - idx * 0.08,
    }));

    if (q) {
      filtered = filtered.filter(
        (f) =>
          f.titulo.toLowerCase().includes(q.toLowerCase()) ||
          f.resumo_okf?.toLowerCase().includes(q.toLowerCase()) ||
          f.tags.some((t) => t.toLowerCase().includes(q.toLowerCase()))
      );
    }

    if (categoria) {
      filtered = filtered.filter((f) => f.categoria === categoria);
    }

    return HttpResponse.json({
      results: filtered,
      total: filtered.length,
      page: 1,
      limit: 10,
      ai_summary: summarize
        ? `Sumário IA para "${q || 'Acervo'}": Os materiais encontrados tratam de arquitetura de microsserviços, busca vetorial moderna com pgvector e práticas de segurança com cookies HttpOnly.`
        : undefined,
    });
  }),

  http.post('/api/search/chat', async ({ request }) => {
    const body = (await request.json()) as { query: string; material_ids?: string[] };
    const query = body.query || 'Pergunta';
    const selectedCount = body.material_ids?.length || 0;

    return HttpResponse.json({
      answer: `Com base nos ${selectedCount || 1} documentos analisados, para "${query}": A arquitetura adota mensageria assíncrona, índices HNSW no pgvector para recuperação semântica e autenticação protegida por cookies HttpOnly para segurança total.`,
      sources: (body.material_ids || ['mat-001', 'mat-002']).map((id, index) => {
        const mat = mockMaterials.find((m) => m.id === id);
        return {
          material_id: id,
          titulo: mat?.titulo || `Documento ${id}`,
          chunk_index: index + 1,
          similarity: 0.94 - index * 0.05,
        };
      }),
    });
  }),
];
