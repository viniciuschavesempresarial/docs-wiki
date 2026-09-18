import { check, sleep } from 'k6';
import { httpClient } from '../helpers/http_client.js';
import { authenticate } from '../helpers/auth.js';
import { teardown as teardownCleanup } from '../helpers/teardown.js';
import { getOptions } from '../config/scenarios.js';

const sampleDocs = JSON.parse(open('../datasets/sample_documents.json'));

export const options = getOptions(__ENV.SCENARIO || 'smoke');

export function setup() {
  const token = authenticate();
  return { token };
}

export function teardown(data) {
  teardownCleanup(data);
}

export default function (data) {
  const token = data.token;

  // 1. Listagem paginada de materiais
  const listRes = httpClient.get('/api/v1/content/materials?limit=10', token, { type: 'content' });
  check(listRes, {
    'Content /materials: status é 200': (r) => r.status === 200,
  });

  // 2. Criação de Material OKF de Teste (1 a cada 5 iterações)
  if (__ITER % 5 === 0 && sampleDocs && sampleDocs.length > 0) {
    const doc = sampleDocs[__ITER % sampleDocs.length];
    const slug = `k6-mat-${Date.now()}-${__ITER}`;
    const okfBody = `---
title: "[K6-TEST] ${doc.title} - ${Date.now()}"
slug: "${slug}"
type: "livro"
category: "${doc.category || 'Geral'}"
tags: ["k6", "teste"]
author: "Administrador"
---
${doc.content}`;

    const payload = {
      conteudo_okf: okfBody,
      commit_message: 'Commit de teste de carga k6',
    };

    const createRes = httpClient.post('/api/v1/content/materials', payload, token, { type: 'content' });
    check(createRes, {
      'Content criar material: status 201 ou 200': (r) => r.status === 201 || r.status === 200,
    });
  }

  sleep(1);
}
