import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly cardLogin: Locator;
  readonly inputEmail: Locator;
  readonly inputPassword: Locator;
  readonly btnSubmit: Locator;
  readonly alertError: Locator;
  readonly linkRegister: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cardLogin = page.locator('[data-testid="card-login"]');
    this.inputEmail = page.locator('[data-testid="input-login-email"]');
    this.inputPassword = page.locator('[data-testid="input-login-senha"]');
    this.btnSubmit = page.locator('[data-testid="btn-login-submit"]');
    this.alertError = page.locator('[data-testid="login-error-alert"]');
    this.linkRegister = page.locator('[data-testid="link-go-to-register"]');
  }

  async goto() {
    await this.page.goto('/login');
    await expect(this.cardLogin).toBeVisible();
  }

  async login(email: string, password: string) {
    await this.inputEmail.fill(email);
    await this.inputPassword.fill(password);
    await this.btnSubmit.click();
  }

  async assertLoginFormRendered() {
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

  async clickRegisterLink() {
    await this.linkRegister.click();
    await this.page.waitForURL('/register');
  }
}
