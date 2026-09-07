import { Page, Route } from '@playwright/test';
import { TEST_CREDENTIALS, MOCK_ADMIN_USERS_LIST } from './test-data';

export interface SetupMockOptions {
  userRole?: 'ADMIN' | 'EDITOR' | 'LEITOR' | null;
  initialMaterials?: any[];
  initialUsers?: any[];
  rateLimitExceeded?: boolean;
}

export async function setupMockRoutes(page: Page, options: SetupMockOptions = {}) {
  const currentRole = options.userRole !== undefined ? options.userRole : 'ADMIN';
  let currentUser =
    currentRole !== null
      ? {
          id: 'usr-admin-1',
          email: `${currentRole.toLowerCase()}@docswiki.local`,
          nome: `Usuário ${currentRole}`,
          roles: [currentRole],
          permissions: ['materials:read', 'materials:write', 'materials:delete', 'admin:all'],
        }
      : null;

  let materials = options.initialMaterials || [
    {
      id: '11111111-1111-1111-1111-111111111111',
      slug: 'guia-arquitetura-distribuida',
      tipo: 'livro',
      categoria: 'Arquitetura de Software',
      status: 'published',
      versao_head_id: 'ver-003',
      titulo: 'Guia de Arquitetura Distribuída',
      autor: 'Martin Fowler',
      tags: ['microsserviços', 'distribuído', 'cloud'],
      tamanho_bytes: 45200,
      numero_palavras: 6200,
      resumo_okf: 'Guia completo sobre padrões de mensageria, CQRS, event sourcing e resiliência.',
      conteudo_okf: `---
title: Guia de Arquitetura Distribuída
slug: guia-arquitetura-distribuida
type: livro
category: Arquitetura de Software
tags:
  - microsserviços
  - distribuído
author: Martin Fowler
---

# Guia de Arquitetura Distribuída
Conteúdo completo sobre microsserviços e resiliência.`,
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      slug: 'nlp-e-embeddings-modernos',
      tipo: 'artigo',
      categoria: 'Inteligência Artificial',
      status: 'published',
      versao_head_id: 'ver-002',
      titulo: 'NLP e Embeddings Modernos para Busca Híbrida',
      autor: 'Yann LeCun',
      tags: ['ia', 'nlp', 'embeddings', 'pgvector'],
      tamanho_bytes: 31800,
      numero_palavras: 4100,
      resumo_okf: 'Como combinar busca vetorial e busca lexical BM25 para obter resultados em RAG.',
      conteudo_okf: `---
title: NLP e Embeddings Modernos para Busca Híbrida
slug: nlp-e-embeddings-modernos
type: artigo
category: Inteligência Artificial
tags:
  - ia
  - nlp
author: Yann LeCun
---

# NLP e Embeddings Modernos
Texto da versão 2 sobre HNSW e normalização Euclidiana L2.`,
    },
  ];

  let users = options.initialUsers ? [...options.initialUsers] : [...MOCK_ADMIN_USERS_LIST];

  // Intercept all /api/ routes
  await page.route('**/api/**', async (route: Route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method();

    if (options.rateLimitExceeded) {
      return route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Taxa limite de requisições excedida (Rate limit: 20 req/s)' }),
      });
    }

    // --- IAM Auth ---
    if (path === '/api/iam/login' && method === 'POST') {
      const data = request.postDataJSON() || {};
      if (data.email === TEST_CREDENTIALS.invalid.email || data.password === TEST_CREDENTIALS.invalid.password) {
        return route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Credenciais inválidas. Verifique seu e-mail e senha.' }),
        });
      }

      const role = data.email.includes('editor') ? 'EDITOR' : data.email.includes('admin') ? 'ADMIN' : 'LEITOR';
      currentUser = {
        id: 'usr-session-1',
        email: data.email,
        nome: data.email.split('@')[0],
        roles: [role],
        permissions: role === 'ADMIN' ? ['admin:all'] : ['materials:read', 'materials:write'],
      };

      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'Set-Cookie': 'token=mock_jwt_token_8h; HttpOnly; Path=/; Max-Age=28800' },
        body: JSON.stringify({ user: currentUser, message: 'Autenticado com sucesso' }),
      });
    }

    if (path === '/api/iam/register' && method === 'POST') {
      const data = request.postDataJSON() || {};
      if (data.email === 'existente@docswiki.local') {
        return route.fulfill({
          status: 409,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'E-mail já cadastrado na plataforma.' }),
        });
      }
      if (!data.nome || !data.email || !data.password || data.password.length < 6) {
        return route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Dados inválidos no formulário.' }),
        });
      }

      const newUser = {
        id: `usr-${Date.now()}`,
        nome: data.nome,
        email: data.email,
        roles: ['LEITOR'],
        is_active: true,
        is_system_protected: false,
        created_at: new Date().toISOString(),
      };
      users.push(newUser);

      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ user: newUser, message: 'Conta criada com sucesso!' }),
      });
    }

    if (path === '/api/iam/me' && method === 'GET') {
      if (!currentUser) {
        return route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Não autenticado' }),
        });
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: currentUser }),
      });
    }

    if (path === '/api/iam/logout' && method === 'POST') {
      currentUser = null;
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Sessão encerrada' }),
      });
    }

    // --- Admin Users & RBAC ---
    if (path === '/api/iam/users' && method === 'GET') {
      if (!currentUser?.roles.includes('ADMIN')) {
        return route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Acesso negado: Requer permissão admin:all' }),
        });
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ users }),
      });
    }

    if (path.match(/\/api\/iam\/users\/([^/]+)\/roles/) && method === 'PUT') {
      const match = path.match(/\/api\/iam\/users\/([^/]+)\/roles/);
      const userId = match ? match[1] : '';
      const data = request.postDataJSON() || {};
      const targetUser = users.find((u) => u.id === userId);
      if (targetUser) {
        targetUser.roles = data.roles || ['LEITOR'];
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: targetUser, message: 'Papéis atualizados com sucesso' }),
      });
    }

    if (path.match(/\/api\/iam\/users\/([^/]+)/) && method === 'DELETE') {
      const match = path.match(/\/api\/iam\/users\/([^/]+)/);
      const userId = match ? match[1] : '';
      const targetUser = users.find((u) => u.id === userId);
      if (targetUser?.is_system_protected) {
        return route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Não é permitido excluir conta protegida do sistema.' }),
        });
      }
      if (targetUser?.id === currentUser?.id) {
        return route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Não é permitido auto-excluir a conta conectada.' }),
        });
      }
      users = users.filter((u) => u.id !== userId);
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Usuário removido com sucesso (Cascade em iam.user_roles)' }),
      });
    }

    // --- Content Materials ---
    if (path === '/api/content/materials' && method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ materials, items: materials, total: materials.length }),
      });
    }

    if (path.match(/\/api\/content\/materials\/([^/]+)\/versions/) && method === 'POST') {
      const match = path.match(/\/api\/content\/materials\/([^/]+)\/versions/);
      const materialId = match ? match[1] : '';
      const data = request.postDataJSON() || {};
      const targetMat = materials.find((m) => m.id === materialId);
      if (targetMat) {
        targetMat.conteudo_okf = data.conteudo_okf;
        targetMat.versao_head_id = `ver-${Date.now()}`;
      }
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          material: targetMat,
          versao: {
            id: targetMat?.versao_head_id,
            versao_num: 3,
            commit_message: data.commit_message,
            hash_sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
          },
          message: 'Nova versão publicada com HEAD válido e evento RabbitMQ emitido.',
        }),
      });
    }

    if (path.match(/\/api\/content\/materials\/([^/]+)\/diff/) && method === 'GET') {
      const match = path.match(/\/api\/content\/materials\/([^/]+)\/diff/);
      const materialId = match ? match[1] : '';
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          material_id: materialId,
          v1: 1,
          v2: 2,
          changes: [
            { type: 'unchanged', line_v1: 1, line_v2: 1, content: '---' },
            { type: 'removed', line_v1: 2, content: 'title: Versão Histórica Antiga' },
            { type: 'added', line_v2: 2, content: 'title: Versão Atualizada Modernizada' },
            { type: 'unchanged', line_v1: 3, line_v2: 3, content: 'type: artigo' },
          ],
        }),
      });
    }

    if (path.match(/\/api\/content\/materials\/([^/]+)\/rollback/) && method === 'POST') {
      const match = path.match(/\/api\/content\/materials\/([^/]+)\/rollback/);
      const materialId = match ? match[1] : '';
      const data = request.postDataJSON() || {};
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          message: `Rollback para a versão ${data.versao_num || 1} executado com sucesso (criada nova versão v4 HEAD não-destrutiva)`,
          material_id: materialId,
          versao_head: 4,
        }),
      });
    }

    if (path.match(/\/api\/content\/materials\/([^/]+)/) && method === 'GET') {
      const match = path.match(/\/api\/content\/materials\/([^/]+)/);
      const materialId = match ? match[1] : '';
      const mat = materials.find((m) => m.id === materialId || m.slug === materialId);
      if (!mat) {
        return route.fulfill({ status: 404, body: JSON.stringify({ message: 'Material não encontrado' }) });
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          material: mat,
          versao: {
            id: mat.versao_head_id,
            conteudo_okf: mat.conteudo_okf,
            versao_num: 2,
            hash_sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          },
        }),
      });
    }

    if (path.match(/\/api\/content\/materials\/([^/]+)/) && method === 'DELETE') {
      const match = path.match(/\/api\/content\/materials\/([^/]+)/);
      const materialId = match ? match[1] : '';
      materials = materials.filter((m) => m.id !== materialId);
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Material excluído com sucesso em cascata e evento RabbitMQ emitido.' }),
      });
    }

    if (path === '/api/content/materials' && method === 'POST') {
      const data = request.postDataJSON() || {};
      if (data.conteudo_okf?.includes('slug: slug-duplicado')) {
        return route.fulfill({
          status: 409,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Slug já existente no banco de dados.' }),
        });
      }
      const newMat = {
        id: `mat-${Date.now()}`,
        slug: `novo-doc-${Date.now()}`,
        tipo: 'artigo',
        categoria: 'Arquitetura de Software e Testes',
        status: 'published',
        versao_head_id: `ver-${Date.now()}`,
        titulo: 'Novo Documento TEST AUTOMATION',
        autor: 'Administrador',
        tags: ['novidade', 'docs', 'teste', 'automação'],
        tamanho_bytes: (data.conteudo_okf || '').length,
        numero_palavras: 120,
        resumo_okf: 'Documento gerado pela automação.',
        conteudo_okf: data.conteudo_okf,
      };
      materials.push(newMat);
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          material: newMat,
          versao: {
            id: newMat.versao_head_id,
            versao_num: 1,
            hash_sha256: 'b5d4045c3f466fa91fe2cc6abe79232a1a57cdf104f7a26e716e0a1e2789df78',
            commit_message: data.commit_message || 'Versão inicial',
          },
        }),
      });
    }

    // --- Search & Chat (Mocked Gemini AI) ---
    if (path === '/api/search' && method === 'GET') {
      const q = (url.searchParams.get('q') || '').toLowerCase();
      const summarize = url.searchParams.get('summarize') === 'true';

      let results = materials.map((m, idx) => ({
        material_id: m.id,
        titulo: m.titulo,
        slug: m.slug,
        autor: m.autor,
        categoria: m.categoria,
        tipo: m.tipo,
        tags: m.tags,
        resumo_okf: m.resumo_okf,
        data_publicacao: '2026-02-18',
        tamanho_bytes: m.tamanho_bytes,
        numero_palavras: m.numero_palavras,
        hybrid_score: 0.94 - idx * 0.08,
      }));

      if (q) {
        const filtered = results.filter(
          (m) =>
            m.titulo.toLowerCase().includes(q) ||
            (m.resumo_okf && m.resumo_okf.toLowerCase().includes(q)) ||
            (m.tags && m.tags.some((t: string) => t.toLowerCase().includes(q))) ||
            (m.categoria && m.categoria.toLowerCase().includes(q))
        );
        if (filtered.length > 0) {
          results = filtered;
        }
      }

      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          results,
          total: results.length,
          ai_summary: summarize
            ? `Síntese Executiva IA (Gemini - Mock): Os documentos recuperados destacam arquitetura distribuída e busca vetorial com score ponderado (0.3 BM25 + 0.7 pgvector).`
            : undefined,
        }),
      });
    }

    if (path === '/api/search/chat' && method === 'POST') {
      const data = request.postDataJSON() || {};
      const query = data.query || '';
      const docIds = data.material_ids || [];

      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          answer: `Resposta Fundamentada (Gemini Mock Grounding): Baseado nos ${docIds.length || 1} materiais técnicos fornecidos, a plataforma Docs-Wiki implementa versionamento imutável Git-like com SHA-256 e controle de concorrência otimista (OCC).`,
          sources: (docIds.length > 0 ? docIds : ['11111111-1111-1111-1111-111111111111']).map((id: string, index: number) => ({
            material_id: id,
            titulo: 'Guia de Arquitetura Distribuída',
            chunk_index: index + 1,
            similarity: 0.95 - index * 0.04,
          })),
        }),
      });
    }

    // Default fallback
    return route.continue();
  });
}
