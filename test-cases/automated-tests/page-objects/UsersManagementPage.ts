import { Page, Locator, expect } from '@playwright/test';

export class UsersManagementPage {
  readonly page: Page;
  readonly pageAdminUsers: Locator;
  readonly btnRefresh: Locator;
  readonly inputSearch: Locator;
  readonly btnClearSearch: Locator;
  readonly tableUsers: Locator;
  readonly alertSuccess: Locator;
  readonly alertError: Locator;
  readonly btnConfirmDeleteUser: Locator;
  readonly btnCancelDeleteUser: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageAdminUsers = page.locator('[data-testid="page-admin-users"]');
    this.btnRefresh = page.locator('[data-testid="btn-refresh-users"]');
    this.inputSearch = page.locator('[data-testid="input-search-users"]');
    this.btnClearSearch = page.locator('[data-testid="btn-clear-search-users"]');
    this.tableUsers = page.locator('[data-testid="table-admin-users"]');
    this.alertSuccess = page.locator('[data-testid="alert-users-success"]');
    this.alertError = page.locator('[data-testid="alert-users-error"]');
    this.btnConfirmDeleteUser = page.locator('[data-testid="btn-confirm-delete-user"]');
    this.btnCancelDeleteUser = page.locator('[data-testid="btn-cancel-delete-user"]');
  }

  async goto() {
    await this.page.goto('/admin/users');
    await expect(this.pageAdminUsers).toBeVisible();
  }

  async searchUser(term: string) {
    await this.inputSearch.fill(term);
  }

  async toggleRole(userId: string, role: 'leitor' | 'editor' | 'admin', check?: boolean) {
    const chk = this.page.locator(`[data-testid="chk-${role}-${userId}"]`);
    await chk.click();
  }

  async deleteUser(userId: string) {
    const btn = this.page.locator(`[data-testid="btn-delete-user-${userId}"]`);
    await btn.click();
    await expect(this.btnConfirmDeleteUser).toBeVisible();
    await this.btnConfirmDeleteUser.click();
  }

  async cancelDeleteUser(userId: string) {
    const btn = this.page.locator(`[data-testid="btn-delete-user-${userId}"]`);
    await btn.click();
    await expect(this.btnCancelDeleteUser).toBeVisible();
    await this.btnCancelDeleteUser.click();
    await expect(this.btnConfirmDeleteUser).not.toBeVisible();
  }

  async assertUserInTable(userId: string, shouldBePresent: boolean = true) {
    const row = this.page.locator(`[data-testid="row-user-${userId}"]`);
    if (shouldBePresent) {
      await expect(row).toBeVisible();
    } else {
      await expect(row).not.toBeVisible();
    }
  }

  async assertSuccessMessage(messageSnippet?: string) {
    await expect(this.alertSuccess).toBeVisible();
    if (messageSnippet) {
      await expect(this.alertSuccess).toContainText(messageSnippet);
    }
  }

  async assertErrorMessage(messageSnippet?: string) {
    await expect(this.alertError).toBeVisible();
    if (messageSnippet) {
      await expect(this.alertError).toContainText(messageSnippet);
    }
  }
}
