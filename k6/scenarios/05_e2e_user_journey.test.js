import { check, sleep } from 'k6';
import { httpClient } from '../helpers/http_client.js';
import { authenticate } from '../helpers/auth.js';
import { getOptions } from '../config/scenarios.js';

const searchQueries = JSON.parse(open('../datasets/search_queries.json'));
const sampleDocs = JSON.parse(open('../datasets/sample_documents.json'));

export const options = getOptions(__ENV.SCENARIO || 'smoke');

/**
 * Setup lifecycle: Valida conectividade básica e obtém token inicial
 */
export function setup() {
  const token = authenticate();
  return {
    adminToken: token,
    totalQueries: searchQueries.length,
    totalDocs: sampleDocs.length,
  };
}

/**
 * Default VU lifecycle: Executa a jornada ponderada
 */
export default function (data) {
  // Sorteio de probabilidade para distribuição ponderada de tráfego
  const rand = Math.random() * 100;
  const token = data.adminToken;

  if (rand < 60) {
    // =========================================================================
    // 1. JORNADA DE LEITURA, BUSCA & RAG (60% do tráfego)
    // =========================================================================
    const queryItem = searchQueries[Math.floor(Math.random() * searchQueries.length)];

    // A. Navega na Home do Frontend (SPA)
    const homeRes = httpClient.get('/', null, { type: 'frontend' });
    check(homeRes, {
      'Frontend Home: status é 200': (r) => r.status === 200,
    });

    // B. Executa Busca Híbrida Semântica
    const searchRes = httpClient.get(`/api/v1/search?q=${encodeURIComponent(queryItem.query)}&limit=10`, token, { type: 'search' });
    check(searchRes, {
      'E2E Busca Híbrida: status é 200': (r) => r.status === 200,
    });

    // C. Faz pergunta ao assistente RAG contextual (Mock determinístico sem consumo de tokens de API)
    const ragPayload = {
      query: queryItem.ragQuestion,
      material_ids: ['00000000-0000-0000-0000-000000000001'],
    };
    const ragRes = httpClient.post('/api/v1/search/chat', ragPayload, token, { type: 'rag_mock' });
    check(ragRes, {
      'E2E RAG Chat (Mock): status é 200': (r) => r.status === 200,
    });

  } else if (rand < 85) {
    // =========================================================================
    // 2. JORNADA DE CONTEÚDO & MATERIAIS (25% do tráfego)
    // =========================================================================
    // A. Lista materiais cadastrados
    const listRes = httpClient.get('/api/v1/content/materials?limit=10', token, { type: 'content' });
    check(listRes, {
      'E2E Content Lista Materiais: status é 200': (r) => r.status === 200,
    });

    // B. Criação eventual de documento com validação de Frontmatter OKF (1 em cada 4 iterações deste ramo)
    if (Math.random() < 0.25) {
      const docItem = sampleDocs[Math.floor(Math.random() * sampleDocs.length)];
      const slug = `k6-doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const okfBody = `---
title: "${docItem.title} - ${Date.now()}"
slug: "${slug}"
type: "livro"
category: "${docItem.category || 'Geral'}"
tags: ["k6", "teste"]
author: "Administrador"
---
${docItem.content}`;

      const payload = {
        conteudo_okf: okfBody,
        commit_message: 'Commit automatizado via teste de carga k6',
      };

      const createRes = httpClient.post('/api/v1/content/materials', payload, token, { type: 'content' });
      check(createRes, {
        'E2E Content Criar Material: status 201 ou 200': (r) => r.status === 201 || r.status === 200,
      });
    }

  } else {
    // =========================================================================
    // 3. JORNADA DE AUTENTICAÇÃO E PERFIL (15% do tráfego)
    // =========================================================================
    // A. Consulta perfil do usuário autenticado no IAM
    const meRes = httpClient.get('/api/v1/auth/me', token, { type: 'auth' });
    check(meRes, {
      'E2E IAM /me: status é 200': (r) => r.status === 200,
    });
  }

  // Think Time realista entre 1s e 2s
  sleep(1 + Math.random());
}
