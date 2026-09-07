import { test, expect } from '@playwright/test';
import { ChatPage } from '../page-objects/ChatPage';
import { setupMockRoutes } from '../helpers/mock-routes';

test.describe('Ciclo DW0001-R5: Testes Chat RAG Contextual e Grounding Gemini', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockRoutes(page);
  });

  test('DW-T24: Chat RAG Contextual com Grounding Estrito no Gemini e Badges de Citação', async ({ page }) => {
    const chatPage = new ChatPage(page);
    await chatPage.goto();

    await chatPage.selectDocument('11111111-1111-1111-1111-111111111111');
    await chatPage.askQuestion('Como funciona o versionamento Git-like e OCC?');

    await chatPage.assertAnswerContains('Resposta Fundamentada (Gemini Mock Grounding)');
    await chatPage.assertCitationVisible(1);
  });

  test('DW-T25: Alerta de Seleção Obrigatória de Documento no Painel Lateral', async ({ page }) => {
    const chatPage = new ChatPage(page);
    await chatPage.goto();

    // Check placeholder or helper message when no documents selected
    await expect(chatPage.inputPergunta).toHaveAttribute(
      'placeholder',
      /Selecione ao menos um documento/
    );
  });
});
