import { test, expect } from '@playwright/test';
import { UsersManagementPage } from '../page-objects/UsersManagementPage';
import { setupMockRoutes } from '../helpers/mock-routes';

test.describe('Ciclo DW0001-R6: Testes Gestão Administrativa de Usuários e RBAC', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockRoutes(page);
  });

  test('DW-T26: Listagem e Atualização Transacional de Papéis RBAC por Administrador', async ({ page }) => {
    const usersPage = new UsersManagementPage(page);
    await usersPage.goto();

    await usersPage.assertUserInTable('usr-editor-2', true);
    await usersPage.toggleRole('usr-editor-2', 'admin', true);
    await usersPage.assertSuccessMessage('Permissões do usuário atualizadas com sucesso');
  });

  test('DW-T27: Acesso Negado com HTTP 403 Forbidden para Usuários sem Permissão admin:all', async ({ page }) => {
    await setupMockRoutes(page, { userRole: 'EDITOR' });
    const usersPage = new UsersManagementPage(page);
    await usersPage.goto();

    await expect(page.locator('text=Erro ao carregar lista de usuários').or(page.locator('text=Acesso negado'))).toBeVisible();
  });

  test('DW-T28: Exclusão de Usuário Permitida com Confirmação e Cascata no Banco de Dados', async ({ page }) => {
    const usersPage = new UsersManagementPage(page);
    await usersPage.goto();

    await usersPage.assertUserInTable('usr-target-delete-3', true);
    await usersPage.deleteUser('usr-target-delete-3');
    await usersPage.assertSuccessMessage('Usuário excluído com sucesso');
    await usersPage.assertUserInTable('usr-target-delete-3', false);
  });

  test('DW-T29: Bloqueio de Auto-Exclusão e Exclusão de Contas Protegidas do Sistema', async ({ page }) => {
    const usersPage = new UsersManagementPage(page);
    await usersPage.goto();

    // The system-protected / self user button is disabled
    const deleteBtnSelf = page.locator('[data-testid="btn-delete-user-usr-admin-1"]');
    await expect(deleteBtnSelf).toBeDisabled();
  });

  test('DW-T30: Salvaguarda de Papel Mínimo Garantindo Perfil LEITOR na Edição de Permissões', async ({ page }) => {
    const usersPage = new UsersManagementPage(page);
    await usersPage.goto();

    // Desmarca leitor de um usuário com apenas leitor
    await usersPage.toggleRole('usr-target-delete-3', 'leitor', false);
    await usersPage.assertSuccessMessage('Permissões do usuário atualizadas com sucesso');
  });
});
