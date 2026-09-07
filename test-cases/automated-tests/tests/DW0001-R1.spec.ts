import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/LoginPage';
import { RegisterPage } from '../page-objects/RegisterPage';
import { EditorPage } from '../page-objects/EditorPage';
import { UsersManagementPage } from '../page-objects/UsersManagementPage';
import { NavbarComponent } from '../page-objects/NavbarComponent';
import { setupMockRoutes } from '../helpers/mock-routes';
import { TEST_CREDENTIALS } from '../helpers/test-data';

test.describe('Ciclo DW0001-R1: Testes Login, Registro e Permissões IAM', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockRoutes(page);
  });

  test('DW-T2: Navegação e Renderização da Página de Registro', async ({ page }) => {
    await setupMockRoutes(page, { userRole: null });
    const navbar = new NavbarComponent(page);
    const registerPage = new RegisterPage(page);

    await page.goto('/');
    await navbar.btnRegister.click();
    await page.waitForURL('/register');
    await registerPage.assertRegisterFormRendered();
  });

  test('DW-T4: Fluxo Completo de Auto-Registro Bem-Sucedido', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto();

    await registerPage.register(
      TEST_CREDENTIALS.newUser.nome,
      TEST_CREDENTIALS.newUser.email,
      TEST_CREDENTIALS.newUser.password
    );

    // Should redirect to home/dashboard or login upon success
    await expect(page).toHaveURL(/\/(login)?$/);
  });

  test('DW-T3: Autenticação Completa com Sucesso e Acesso a Rota Protegida', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const editorPage = new EditorPage(page);

    await loginPage.goto();
    await loginPage.assertLoginFormRendered();
    await loginPage.login(TEST_CREDENTIALS.editor.email, TEST_CREDENTIALS.editor.password);

    await page.waitForURL('/');
    await editorPage.goto();
    await expect(editorPage.textareaContent).toBeVisible();
  });

  test('DW-T1: Validação de Conflito de E-mail Duplicado no Registro', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto();

    await registerPage.register('Nome Teste', 'existente@docswiki.local', 'Senha12345');
    await registerPage.assertErrorMessage('E-mail já cadastrado');
  });

  test('DW-T5: Bloqueio de Acesso RBAC para Perfil sem Permissão', async ({ page }) => {
    await setupMockRoutes(page, { userRole: 'LEITOR' });
    const usersPage = new UsersManagementPage(page);
    await usersPage.goto();

    await expect(page.locator('text=Erro ao carregar lista de usuários')).toBeVisible();
  });

  test('DW-T6: Rejeição por Exceder Rate Limit de Requisições', async ({ page }) => {
    await page.route('**/api/iam/login', async (route) => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Taxa limite de requisições excedida (Rate limit: 20 req/s)' }),
      });
    });

    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.login('test@docswiki.local', '123456');
    await loginPage.assertErrorMessage('Taxa limite');
  });

  test('DW-T7: Rejeição de Login por Credenciais Incorretas', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.login(TEST_CREDENTIALS.invalid.email, TEST_CREDENTIALS.invalid.password);
    await loginPage.assertErrorMessage('Credenciais inválidas');
  });

  test('DW-T8: Rejeição de Registro por Dados Inválidos (Falha Zod DTO)', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto();

    // Fill with invalid short password
    await registerPage.inputNome.fill('A');
    await registerPage.inputEmail.fill('invalido');
    await registerPage.inputPassword.fill('123');
    await registerPage.btnSubmit.click();

    // Native HTML5 validation or Zod alert
    const isInvalid = await registerPage.inputEmail.evaluate((el: HTMLInputElement) => !el.checkValidity());
    expect(isInvalid).toBe(true);
  });
});
