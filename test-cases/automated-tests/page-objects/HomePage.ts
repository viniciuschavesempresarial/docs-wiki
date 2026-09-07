import { Page, Locator, expect } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly pageHome: Locator;
  readonly formSearch: Locator;
  readonly inputSearch: Locator;
  readonly btnSearch: Locator;
  readonly toggleSummarize: Locator;
  readonly boxAiSummary: Locator;
  readonly gridSearchResults: Locator;
  readonly searchLoading: Locator;
  readonly searchError: Locator;
  readonly searchEmptyState: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageHome = page.locator('[data-testid="page-home"]');
    this.formSearch = page.locator('[data-testid="form-busca-principal"]');
    this.inputSearch = page.locator('[data-testid="input-busca-termo"]');
    this.btnSearch = page.locator('[data-testid="btn-executar-busca"]');
    this.toggleSummarize = page.locator('[data-testid="toggle-ia-summarize"]');
    this.boxAiSummary = page.locator('[data-testid="box-ai-summary"]');
    this.gridSearchResults = page.locator('[data-testid="grid-search-results"]');
    this.searchLoading = page.locator('[data-testid="search-loading"]');
    this.searchError = page.locator('[data-testid="search-error"]');
    this.searchEmptyState = page.locator('[data-testid="search-empty-state"]');
  }

  async goto() {
    await this.page.goto('/');
    await expect(this.pageHome).toBeVisible();
  }

  async search(query: string, enableAiSummary: boolean = false) {
    await this.inputSearch.fill(query);
    const isChecked = await this.toggleSummarize.isChecked();
    if (enableAiSummary !== isChecked) {
      await this.toggleSummarize.setChecked(enableAiSummary);
    }
    await this.btnSearch.click();
  }

  async assertAiSummaryVisible(textSnippet?: string) {
    await expect(this.boxAiSummary).toBeVisible();
    if (textSnippet) {
      await expect(this.boxAiSummary).toContainText(textSnippet);
    }
  }

  async assertSearchResultsCount(minCount: number = 1) {
    await expect(this.gridSearchResults).toBeVisible();
    const cards = this.gridSearchResults.locator('[data-testid^="card-doc-"]');
    await expect(cards.first()).toBeVisible();
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(minCount);
  }

  async assertEmptyState() {
    await expect(this.searchEmptyState).toBeVisible();
  }

  async selectDocForRAG(materialId: string) {
    const btn = this.page.locator(`[data-testid="btn-select-rag-${materialId}"]`);
    await btn.click();
  }

  async clickEditDoc(materialId: string) {
    const btn = this.page.locator(`[data-testid="btn-doc-edit-${materialId}"]`);
    await btn.click();
    await this.page.waitForURL(`/editor/${materialId}`);
  }

  async clickDiffDoc(materialId: string) {
    const btn = this.page.locator(`[data-testid="btn-doc-diff-${materialId}"]`);
    await btn.click();
    await this.page.waitForURL(`/diff/${materialId}`);
  }
}
