import { test, expect } from '@playwright/test';
import { EditorPage } from '../page-objects/EditorPage';
import { DiffPage } from '../page-objects/DiffPage';
import { setupMockRoutes } from '../helpers/mock-routes';
import { NEW_TEST_DOC_OKF } from '../helpers/test-data';

test.describe('Ciclo DW0001-R2: Testes de Criação, Versionamento Git-Like e Rollback', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockRoutes(page);
  });

  test('DW-T11: Criação Bem-Sucedida de Novo Material no Padrão OKF', async ({ page }) => {
    const editorPage = new EditorPage(page);
    await editorPage.goto();

    await editorPage.setContent(NEW_TEST_DOC_OKF);
    await editorPage.commitVersion('feat: Versão inicial criada pelo teste automatizado');
    await editorPage.assertSuccessMessage('salva e comitada com sucesso');
  });

  test('DW-T12: Publicação Direta de Nova Versão Incremental com HEAD Válido', async ({ page }) => {
    const editorPage = new EditorPage(page);
    await editorPage.goto('22222222-2222-2222-2222-222222222222');

    await editorPage.appendContent('\n## Nova Seção de Concorrência\nAtualização com HEAD válido.');
    await editorPage.commitVersion('docs: Atualização incremental v3 com HEAD válido');
    await editorPage.assertSuccessMessage('salva e comitada com sucesso');
  });

  test('DW-T9: Execução de Rollback Seguro e Não-Destrutivo', async ({ page }) => {
    const diffPage = new DiffPage(page);
    await diffPage.goto('11111111-1111-1111-1111-111111111111');

    await diffPage.selectVersions('1', '2');
    await diffPage.triggerRollback();
    await diffPage.assertSuccessMessage('Rollback');
  });

  test('DW-T10: Rejeição de Criação de Material por Slug Duplicado', async ({ page }) => {
    const editorPage = new EditorPage(page);
    await editorPage.goto();

    await editorPage.setContent(`---
title: Material Conflitante
slug: slug-duplicado
type: artigo
category: Geral
---
# Conflito`);
    await editorPage.commitVersion('Tentativa com slug duplicado');
    await editorPage.assertErrorMessage('Slug já existente');
  });

  test('DW-T13: Rejeição de Rollback por Versão Alvo Inexistente no Histórico', async ({ page }) => {
    await page.route('**/api/content/materials/*/rollback', async (route) => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Versão alvo inexistente no histórico do material.' }),
      });
    });

    const diffPage = new DiffPage(page);
    await diffPage.goto('11111111-1111-1111-1111-111111111111');
    await diffPage.triggerRollback();
    await diffPage.assertErrorMessage('Versão alvo inexistente');
  });

  test('DW-T14: Rejeição de Criação por Sintaxe YAML ou Frontmatter Zod Inválido', async ({ page }) => {
    await page.route('**/api/content/materials', async (route) => {
      if (route.request().method() === 'POST') {
        return route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Frontmatter inválido: Sintaxe YAML corrompida ou campos ausentes.' }),
        });
      }
      return route.continue();
    });

    const editorPage = new EditorPage(page);
    await editorPage.goto();
    await editorPage.setContent(`---
title: YAML Quebrado
slug: ::::invalido
---
# Incorreto`);
    await editorPage.commitVersion('Commit YAML Quebrado');
    await editorPage.assertErrorMessage('Frontmatter inválido');
  });

  test('DW-T15: Detecção de Conflito Concorrente OCC e Resolução de Commit em Loop', async ({ page }) => {
    let callCount = 0;
    await page.route('**/api/content/materials/*/versions', async (route) => {
      callCount++;
      if (callCount === 1) {
        return route.fulfill({
          status: 409,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Conflito de concorrência OCC: O HEAD do documento foi alterado por outro usuário.' }),
        });
      }
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Versão salva e comitada com sucesso!' }),
      });
    });

    const editorPage = new EditorPage(page);
    await editorPage.goto('22222222-2222-2222-2222-222222222222');
    await editorPage.commitVersion('Tentativa com OCC');
    await editorPage.assertErrorMessage('Conflito de concorrência OCC');
  });
});
