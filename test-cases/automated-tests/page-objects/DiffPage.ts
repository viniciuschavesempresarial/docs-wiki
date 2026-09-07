import { Page, Locator, expect } from '@playwright/test';

export class DiffPage {
  readonly page: Page;
  readonly pageDiff: Locator;
  readonly btnVoltar: Locator;
  readonly btnEditar: Locator;
  readonly btnRollback: Locator;
  readonly selectV1: Locator;
  readonly selectV2: Locator;
  readonly alertSuccess: Locator;
  readonly alertError: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageDiff = page.locator('[data-testid="page-diff"]');
    this.btnVoltar = page.locator('[data-testid="btn-diff-voltar"]');
    this.btnEditar = page.locator('[data-testid="btn-diff-editar"]');
    this.btnRollback = page.locator('[data-testid="btn-executar-rollback"]');
    this.selectV1 = page.locator('[data-testid="select-diff-v1"]');
    this.selectV2 = page.locator('[data-testid="select-diff-v2"]');
    this.alertSuccess = page.locator('[data-testid="alert-rollback-success"]');
    this.alertError = page.locator('[data-testid="alert-rollback-error"]');
  }

  async goto(materialId: string) {
    await this.page.goto(`/diff/${materialId}`);
    await expect(this.pageDiff).toBeVisible();
  }

  async selectVersions(v1: string, v2: string) {
    await this.selectV1.selectOption(v1);
    await this.selectV2.selectOption(v2);
  }

  async triggerRollback() {
    this.page.once('dialog', async (dialog) => {
      await dialog.accept();
    });
    await this.btnRollback.click();
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
