import { Page, Locator, expect } from '@playwright/test';

export class EditorPage {
  readonly page: Page;
  readonly pageEditor: Locator;
  readonly btnVoltar: Locator;
  readonly btnViewSplit: Locator;
  readonly btnViewEdit: Locator;
  readonly btnViewPreview: Locator;
  readonly btnAbrirCommitModal: Locator;
  readonly btnAbrirDeleteModal: Locator;
  readonly textareaContent: Locator;
  readonly alertSuccess: Locator;
  readonly alertError: Locator;

  // Commit Modal
  readonly inputCommitMessage: Locator;
  readonly btnConfirmarCommit: Locator;
  readonly btnCancelarCommit: Locator;

  // Delete Modal
  readonly btnConfirmarDelete: Locator;
  readonly btnCancelarDelete: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageEditor = page.locator('[data-testid="page-editor"]');
    this.btnVoltar = page.locator('[data-testid="btn-editor-voltar"]');
    this.btnViewSplit = page.locator('[data-testid="btn-view-split"]');
    this.btnViewEdit = page.locator('[data-testid="btn-view-edit"]');
    this.btnViewPreview = page.locator('[data-testid="btn-view-preview"]');
    this.btnAbrirCommitModal = page.locator('[data-testid="btn-abrir-commit-modal"]');
    this.btnAbrirDeleteModal = page.locator('[data-testid="btn-abrir-delete-modal"]');
    this.textareaContent = page.locator('[data-testid="textarea-okf-editor"]');
    this.alertSuccess = page.locator('[data-testid="alert-editor-success"]');
    this.alertError = page.locator('[data-testid="alert-editor-error"]');

    this.inputCommitMessage = page.locator('[data-testid="input-commit-message"]');
    this.btnConfirmarCommit = page.locator('[data-testid="btn-confirmar-commit"]');
    this.btnCancelarCommit = page.locator('[data-testid="btn-cancelar-commit"]');

    this.btnConfirmarDelete = page.locator('[data-testid="btn-confirm-delete"]');
    this.btnCancelarDelete = page.locator('[data-testid="btn-cancel-delete"]');
  }

  async goto(materialId?: string) {
    if (materialId) {
      await this.page.goto(`/editor/${materialId}`);
    } else {
      await this.page.goto('/editor');
    }
    await expect(this.pageEditor).toBeVisible();
  }

  async setContent(content: string) {
    await this.textareaContent.fill(content);
  }

  async appendContent(content: string) {
    const current = await this.textareaContent.inputValue();
    await this.textareaContent.fill(current + '\n' + content);
  }

  async commitVersion(commitMessage: string) {
    await this.btnAbrirCommitModal.click();
    await expect(this.inputCommitMessage).toBeVisible();
    await this.inputCommitMessage.fill(commitMessage);
    await this.btnConfirmarCommit.click();
  }

  async deleteMaterial() {
    await this.btnAbrirDeleteModal.click();
    await expect(this.btnConfirmarDelete).toBeVisible();
    await this.btnConfirmarDelete.click();
  }

  async cancelDelete() {
    await this.btnAbrirDeleteModal.click();
    await expect(this.btnCancelarDelete).toBeVisible();
    await this.btnCancelarDelete.click();
    await expect(this.btnConfirmarDelete).not.toBeVisible();
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
