import { test, expect } from '@playwright/test';
import { HomePage } from '../page-objects/HomePage';
import { setupMockRoutes } from '../helpers/mock-routes';

test.describe('Ciclo DW0001-R4: Testes Busca Híbrida Ponderada e Sumarização IA', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockRoutes(page);
  });

  test('DW-T20: Busca Híbrida Ponderada com Síntese Executiva Gerada por IA (Gemini)', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    await homePage.search('arquitetura distribuida', true);
    await homePage.assertSearchResultsCount(1);
    await homePage.assertAiSummaryVisible('Síntese Executiva IA (Gemini - Mock)');
  });

  test('DW-T22: Navegação e Listagem Paginada sem Termo de Busca (Modo Catálogo)', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    await homePage.assertSearchResultsCount(2);
    await expect(homePage.boxAiSummary).not.toBeVisible();
  });

  test('DW-T23: Busca Híbrida Ponderada com Resultados Ranqueados sem Sumarização', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    await homePage.search('embeddings', false);
    await homePage.assertSearchResultsCount(1);
    await expect(homePage.boxAiSummary).not.toBeVisible();
  });

  test('DW-T21: Bloqueio de Busca por Excesso de Taxa de Requisições (Rate Limit)', async ({ page }) => {
    await page.route('**/api/search**', async (route) => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Taxa limite de requisições excedida (Rate limit: 20 req/s)' }),
      });
    });

    const homePage = new HomePage(page);
    await homePage.goto();

    await homePage.search('teste limite', false);
    await expect(homePage.searchError).toBeVisible();
  });
});
