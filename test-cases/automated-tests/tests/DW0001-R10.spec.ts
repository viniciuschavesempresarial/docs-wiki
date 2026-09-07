import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/LoginPage';
import { RegisterPage } from '../page-objects/RegisterPage';
import { HomePage } from '../page-objects/HomePage';
import { EditorPage } from '../page-objects/EditorPage';
import { DiffPage } from '../page-objects/DiffPage';
import { ChatPage } from '../page-objects/ChatPage';
import { UsersManagementPage } from '../page-objects/UsersManagementPage';
import { setupMockRoutes } from '../helpers/mock-routes';
import { TEST_CREDENTIALS, NEW_TEST_DOC_OKF } from '../helpers/test-data';

test.describe('Ciclo DW0001-R10: Regressão Smoke (Teste de Fumaça) E2E', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockRoutes(page);
  });

  test('DW-T3: Autenticação Completa com Sucesso e Acesso a Rota Protegida', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const editorPage = new EditorPage(page);

    // Step 1: Acessar página de login
    await loginPage.goto();
    await loginPage.assertLoginFormRendered();

    // Step 2: Inserir credenciais válidas e clicar em Entrar
    await loginPage.login(TEST_CREDENTIALS.editor.email, TEST_CREDENTIALS.editor.password);
    await page.waitForURL('/');

    // Step 3: Navegar para a rota protegida /editor
    await editorPage.goto();
    await expect(editorPage.textareaContent).toBeVisible();
  });

  test('DW-T4: Fluxo Completo de Auto-Registro Bem-Sucedido', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    // Step 1: Acessar formulário de cadastro
    await registerPage.goto();
    await registerPage.assertRegisterFormRendered();

    // Step 2 & 3: Preencher dados válidos e submeter
    await registerPage.register(
      TEST_CREDENTIALS.newUser.nome,
      TEST_CREDENTIALS.newUser.email,
      TEST_CREDENTIALS.newUser.password
    );

    // Redirecionamento com sucesso
    await expect(page).toHaveURL(/\/(login)?$/);
  });

  test('DW-T9: Execução de Rollback Seguro e Não-Destrutivo', async ({ page }) => {
    const diffPage = new DiffPage(page);

    // Step 1: Acessar histórico e comparador de diffs
    await diffPage.goto('11111111-1111-1111-1111-111111111111');

    // Step 2: Selecionar versão histórica K=1 e acionar rollback
    await diffPage.selectVersions('1', '2');
    await diffPage.triggerRollback();

    // Step 3: Validar mensagem de sucesso do rollback
    await diffPage.assertSuccessMessage('Rollback');
  });

  test('DW-T11: Criação Bem-Sucedida de Novo Material no Padrão OKF', async ({ page }) => {
    const editorPage = new EditorPage(page);

    // Step 1: Acessar tela de criação /editor
    await editorPage.goto();

    // Step 2: Preencher frontmatter YAML e conteúdo no padrão OKF
    await editorPage.setContent(NEW_TEST_DOC_OKF);

    // Step 3: Submeter criação
    await editorPage.commitVersion('feat: Criação inicial de material OKF');
    await editorPage.assertSuccessMessage('salva e comitada com sucesso');
  });

  test('DW-T12: Publicação Direta de Nova Versão Incremental com HEAD Válido', async ({ page }) => {
    const editorPage = new EditorPage(page);

    // Step 1: Abrir material existente
    await editorPage.goto('22222222-2222-2222-2222-222222222222');

    // Step 2: Alterar texto no editor
    await editorPage.appendContent('\n## Nova Seção Incrementada\nTexto adicionado com HEAD válido.');

    // Step 3: Comitar nova versão incremental
    await editorPage.commitVersion('docs: Nova versão v3 incremental');
    await editorPage.assertSuccessMessage('salva e comitada com sucesso');
  });

  test('DW-T18: Geração de Embeddings Locais com Normalização L2 e Gravação no Redis (Cache Miss)', async ({ page }) => {
    const editorPage = new EditorPage(page);

    // Step 1 & 2: Criação de conteúdo inédito para disparo do pipeline NLP
    await editorPage.goto();
    await editorPage.setContent(`---
title: NLP L2 Normalization Test
slug: nlp-l2-norm-${Date.now()}
type: artigo
category: NLP
---
# Normalização Euclidiana L2
Processamento com vetores densos de 768 dimensões.`);

    // Step 3: Commit e validação de sucesso
    await editorPage.commitVersion('feat: Indexação NLP vetorial');
    await editorPage.assertSuccessMessage('salva e comitada com sucesso');
  });

  test('DW-T20: Busca Híbrida Ponderada com Síntese Executiva Gerada por IA (Gemini)', async ({ page }) => {
    const homePage = new HomePage(page);

    // Step 1: Acessar Home e executar busca com flag summarize=true
    await homePage.goto();
    await homePage.search('arquitetura distribuida', true);

    // Step 2: Validar resultados do acervo
    await homePage.assertSearchResultsCount(2);

    // Step 3: Validar síntese executiva gerada pela IA (Gemini)
    await homePage.assertAiSummaryVisible('Síntese Executiva IA (Gemini - Mock)');
  });

  test('DW-T24: Chat RAG Contextual com Grounding Estrito no Gemini e Badges de Citação', async ({ page }) => {
    const chatPage = new ChatPage(page);

    // Step 1: Acessar painel RAG e selecionar documento
    await chatPage.goto();
    await chatPage.selectDocument('11111111-1111-1111-1111-111111111111');

    // Step 2 & 3: Submeter pergunta
    await chatPage.askQuestion('Como funciona o controle de versão Git-like?');

    // Step 4: Validar resposta fundamentada e badge de citação
    await chatPage.assertAnswerContains('Resposta Fundamentada (Gemini Mock Grounding)');
    await chatPage.assertCitationVisible(1);
  });

  test('DW-T26: Listagem e Atualização Transacional de Papéis RBAC por Administrador', async ({ page }) => {
    const usersPage = new UsersManagementPage(page);

    // Step 1: Acessar UsersManagementPage
    await usersPage.goto();
    await usersPage.assertUserInTable('usr-editor-2', true);

    // Step 2 & 3: Atualizar papel e validar transação
    await usersPage.toggleRole('usr-editor-2', 'admin', true);
    await usersPage.assertSuccessMessage('Permissões do usuário atualizadas com sucesso');
  });

  test('DW-T28: Exclusão de Usuário Permitida com Confirmação e Cascata no Banco de Dados', async ({ page }) => {
    const usersPage = new UsersManagementPage(page);

    // Step 1: Localizar usuário desprotegido e clicar em excluir
    await usersPage.goto();
    await usersPage.assertUserInTable('usr-target-delete-3', true);

    // Step 2 & 3: Confirmar exclusão no modal e validar remoção da tabela
    await usersPage.deleteUser('usr-target-delete-3');
    await usersPage.assertSuccessMessage('Usuário excluído com sucesso');
    await usersPage.assertUserInTable('usr-target-delete-3', false);
  });

  test('DW-T31: Exclusão de Material por Administrador com Cascata em Versões e Evento RabbitMQ', async ({ page }) => {
    const editorPage = new EditorPage(page);

    // Step 1 & 2: Acessar material existente e confirmar exclusão
    await editorPage.goto('11111111-1111-1111-1111-111111111111');
    await editorPage.deleteMaterial();

    // Step 3: Validar redirecionamento para Home
    await page.waitForURL('/');
    await expect(page.locator('[data-testid="page-home"]')).toBeVisible();
  });
});
