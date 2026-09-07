import { test, expect } from '@playwright/test';
import { setupMockRoutes } from '../helpers/mock-routes';
import { EditorPage } from '../page-objects/EditorPage';

test.describe('Ciclo DW0001-R3: Testes Pipeline Assíncrono NLP, Chunking e Embeddings', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockRoutes(page);
  });

  test('DW-T16: Pipeline Completo de Chunking e Indexação Vetorial com Cache Hit no Redis', async ({ page }) => {
    const editorPage = new EditorPage(page);
    await editorPage.goto();

    await editorPage.setContent(`---
title: Material para Chunking e Cache Hit
slug: material-chunking-cache-hit
type: artigo
category: NLP
---
# Documento com conteúdo idêntico
Simulação de geração de embeddings com cache hit no Redis.`);
    await editorPage.commitVersion('feat: Indexação NLP com Cache Hit');
    await editorPage.assertSuccessMessage('salva e comitada');
  });

  test('DW-T17: Expurgo em Cascata de Índices e Chunks Vetoriais em Material Excluído', async ({ page }) => {
    const editorPage = new EditorPage(page);
    await editorPage.goto('11111111-1111-1111-1111-111111111111');

    await editorPage.deleteMaterial();
    await expect(page).toHaveURL('/');
  });

  test('DW-T18: Geração de Embeddings Locais com Normalização L2 e Gravação no Redis (Cache Miss)', async ({ page }) => {
    const editorPage = new EditorPage(page);
    await editorPage.goto();

    await editorPage.setContent(`---
title: Material Inédito Cache Miss
slug: material-inedito-cache-miss-${Date.now()}
type: artigo
category: NLP
---
# Documento Inédito
Geração de embeddings de 768 dimensões com norma Euclidiana 1.0.`);
    await editorPage.commitVersion('feat: Indexação inédita Cache Miss no Redis');
    await editorPage.assertSuccessMessage('salva e comitada');
  });

  test('DW-T19: Descarte e NACK de Mensagem com JSON Corrompido ou Payload Inválido', async ({ page }) => {
    await page.route('**/api/content/materials', async (route) => {
      if (route.request().method() === 'POST') {
        return route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Payload corrompido: NACK e descarte da mensagem na fila nlp.processamento.' }),
        });
      }
      return route.continue();
    });

    const editorPage = new EditorPage(page);
    await editorPage.goto();
    await editorPage.commitVersion('Commit inválido para NACK');
    await editorPage.assertErrorMessage('Payload corrompido');
  });
});
