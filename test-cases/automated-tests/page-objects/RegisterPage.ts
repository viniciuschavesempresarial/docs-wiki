import { Page, Locator, expect } from '@playwright/test';

export class RegisterPage {
  readonly page: Page;
  readonly cardRegister: Locator;
  readonly inputNome: Locator;
  readonly inputEmail: Locator;
  readonly inputPassword: Locator;
  readonly btnSubmit: Locator;
  readonly alertError: Locator;
  readonly linkLogin: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cardRegister = page.locator('[data-testid="card-register"]');
    this.inputNome = page.locator('[data-testid="input-register-nome"]');
    this.inputEmail = page.locator('[data-testid="input-register-email"]');
    this.inputPassword = page.locator('[data-testid="input-register-senha"]');
    this.btnSubmit = page.locator('[data-testid="btn-register-submit"]');
    this.alertError = page.locator('[data-testid="register-error-alert"]');
    this.linkLogin = page.locator('[data-testid="link-go-to-login"]');
  }

  async goto() {
    await this.page.goto('/register');
    await expect(this.cardRegister).toBeVisible();
  }

  async register(nome: string, email: string, password: string) {
    await this.inputNome.fill(nome);
    await this.inputEmail.fill(email);
    await this.inputPassword.fill(password);
    await this.btnSubmit.click();
  }

  async assertRegisterFormRendered() {
    await expect(this.inputNome).toBeVisible();
    await expect(this.inputEmail).toBeVisible();
    await expect(this.inputPassword).toBeVisible();
    await expect(this.btnSubmit).toBeVisible();
  }

  async assertErrorMessage(messageSnippet?: string) {
    await expect(this.alertError).toBeVisible();
    if (messageSnippet) {
      await expect(this.alertError).toContainText(messageSnippet);
    }
  }

  async clickLoginLink() {
    await this.linkLogin.click();
    await this.page.waitForURL('/login');
  }
}
