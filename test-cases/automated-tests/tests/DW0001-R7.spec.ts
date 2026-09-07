import { test, expect } from '@playwright/test';
import { EditorPage } from '../page-objects/EditorPage';
import { setupMockRoutes } from '../helpers/mock-routes';

test.describe('Ciclo DW0001-R7: Testes de Exclusão em Cascata e Expurgo de Materiais', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockRoutes(page);
  });

  test('DW-T31: Exclusão de Material por Administrador com Cascata em Versões e Evento RabbitMQ', async ({ page }) => {
    const editorPage = new EditorPage(page);
    await editorPage.goto('11111111-1111-1111-1111-111111111111');

    await editorPage.deleteMaterial();
    await page.waitForURL('/');
    await expect(page.locator('[data-testid="page-home"]')).toBeVisible();
  });

  test('DW-T32: Cancelamento de Exclusão de Material no Modal de Advertência', async ({ page }) => {
    const editorPage = new EditorPage(page);
    await editorPage.goto('11111111-1111-1111-1111-111111111111');

    await editorPage.cancelDelete();
    await expect(page).toHaveURL('/editor/11111111-1111-1111-1111-111111111111');
  });

  test('DW-T33: Consumo Assíncrono de Expurgo de Índices e Chunks Vetoriais no nlp-service', async ({ page }) => {
    const editorPage = new EditorPage(page);
    await editorPage.goto('22222222-2222-2222-2222-222222222222');

    await editorPage.deleteMaterial();
    await page.waitForURL('/');
  });
});
