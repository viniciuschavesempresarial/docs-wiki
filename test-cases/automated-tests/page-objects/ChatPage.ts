import { Page, Locator, expect } from '@playwright/test';

export class ChatPage {
  readonly page: Page;
  readonly pageChat: Locator;
  readonly btnLimpar: Locator;
  readonly panelDocumentos: Locator;
  readonly btnSelectAll: Locator;
  readonly btnClearAll: Locator;
  readonly formChat: Locator;
  readonly inputPergunta: Locator;
  readonly btnEnviar: Locator;
  readonly boxResposta: Locator;
  readonly typingIndicator: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageChat = page.locator('[data-testid="page-ai-chat"]');
    this.btnLimpar = page.locator('[data-testid="btn-chat-limpar"]');
    this.panelDocumentos = page.locator('[data-testid="panel-seletor-documentos-rag"]');
    this.btnSelectAll = page.locator('[data-testid="btn-rag-select-all"]');
    this.btnClearAll = page.locator('[data-testid="btn-rag-clear-all"]');
    this.formChat = page.locator('[data-testid="form-chat"]');
    this.inputPergunta = page.locator('[data-testid="input-chat-pergunta"]');
    this.btnEnviar = page.locator('[data-testid="btn-chat-enviar"]');
    this.boxResposta = page.locator('[data-testid="box-chat-resposta"]');
    this.typingIndicator = page.locator('[data-testid="chat-typing-indicator"]');
  }

  async goto() {
    await this.page.goto('/ai-chat');
    await expect(this.pageChat).toBeVisible();
  }

  async selectDocument(materialId: string) {
    const chk = this.page.locator(`[data-testid="checkbox-select-doc-${materialId}"]`);
    await chk.check();
  }

  async selectAllDocuments() {
    await this.btnSelectAll.click();
  }

  async clearDocumentSelection() {
    await this.btnClearAll.click();
  }

  async askQuestion(question: string) {
    await this.inputPergunta.fill(question);
    await this.btnEnviar.click();
  }

  async assertAnswerContains(textSnippet: string) {
    await expect(this.boxResposta).toContainText(textSnippet);
  }

  async assertCitationVisible(chunkIndex?: number) {
    const fontesBox = this.page.locator('[data-testid="box-chat-fontes"]');
    await expect(fontesBox).toBeVisible();
    if (chunkIndex !== undefined) {
      await expect(fontesBox).toContainText(`Chunk #${chunkIndex}`);
    }
  }

  async clearChat() {
    await this.btnLimpar.click();
  }
}
