import { check, sleep } from 'k6';
import { httpClient } from '../helpers/http_client.js';
import { authenticate } from '../helpers/auth.js';
import { getOptions } from '../config/scenarios.js';

const searchQueries = JSON.parse(open('../datasets/search_queries.json'));

export const options = getOptions(__ENV.SCENARIO || 'smoke');

export function setup() {
  const token = authenticate();
  return { token };
}

export default function (data) {
  const token = data.token;
  const item = searchQueries[__ITER % searchQueries.length];

  // 1. Busca Híbrida Semântica / Textual
  const searchUrl = `/api/v1/search?q=${encodeURIComponent(item.query)}&limit=5`;
  const searchRes = httpClient.get(searchUrl, token, { type: 'search' });
  check(searchRes, {
    'Search /search: status é 200': (r) => r.status === 200,
  });

  // 2. RAG Chat Contextual Aterrado (Mocked / Zero custo de tokens)
  const ragPayload = {
    query: item.ragQuestion,
    material_ids: ['00000000-0000-0000-0000-000000000001'],
  };
  const ragRes = httpClient.post('/api/v1/search/chat', ragPayload, token, { type: 'rag_mock' });
  check(ragRes, {
    'Search RAG Chat: status é 200': (r) => r.status === 200,
  });

  sleep(1);
}
