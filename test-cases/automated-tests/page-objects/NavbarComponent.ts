import { Page, Locator, expect } from '@playwright/test';

export class NavbarComponent {
  readonly page: Page;
  readonly navbar: Locator;
  readonly brandLogo: Locator;
  readonly linkAcervo: Locator;
  readonly linkEditor: Locator;
  readonly linkAiChat: Locator;
  readonly linkAdminUsers: Locator;
  readonly btnLogin: Locator;
  readonly btnRegister: Locator;
  readonly btnLogout: Locator;
  readonly userDisplayName: Locator;
  readonly userDisplayRole: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navbar = page.locator('[data-testid="main-navbar"]');
    this.brandLogo = page.locator('[data-testid="link-brand-logo"]');
    this.linkAcervo = page.locator('[data-testid="nav-link-acervo"]');
    this.linkEditor = page.locator('[data-testid="nav-link-editor"]');
    this.linkAiChat = page.locator('[data-testid="nav-link-ai-chat"]');
    this.linkAdminUsers = page.locator('[data-testid="nav-link-admin-users"]');
    this.btnLogin = page.locator('[data-testid="btn-nav-login"]');
    this.btnRegister = page.locator('[data-testid="btn-nav-register"]');
    this.btnLogout = page.locator('[data-testid="btn-logout"]');
    this.userDisplayName = page.locator('[data-testid="user-display-name"]');
    this.userDisplayRole = page.locator('[data-testid="user-display-role"]');
  }

  async goToHome() {
    await this.linkAcervo.click();
    await this.page.waitForURL('/');
  }

  async goToEditor() {
    await this.linkEditor.click();
    await this.page.waitForURL(/\/editor/);
  }

  async goToAiChat() {
    await this.linkAiChat.click();
    await this.page.waitForURL('/ai-chat');
  }

  async goToAdminUsers() {
    await this.linkAdminUsers.click();
    await this.page.waitForURL('/admin/users');
  }

  async logout() {
    await this.btnLogout.click();
    await this.page.waitForURL('/login');
  }

  async assertUserLoggedIn(name: string, role?: string) {
    await expect(this.userDisplayName).toContainText(name);
    if (role) {
      await expect(this.userDisplayRole).toContainText(role);
    }
  }

  async assertLoggedOut() {
    await expect(this.btnLogin).toBeVisible();
    await expect(this.btnRegister).toBeVisible();
  }
}
