import { SearchQueryDTO, SearchResponse } from '@shared/contracts';
import { queryEmbedderService } from '../embeddings/query-embedder.js';
import { searchRepository } from '../repositories/search.repository.js';
import { geminiClient } from '../gemini/gemini.client.js';

export class HybridSearchService {
  private readonly searchCache = new Map<string, { data: SearchResponse; expiresAt: number }>();
  private readonly CACHE_TTL_MS = 15000; // 15 segundos de cache para absorver rajadas
  private readonly MAX_CACHE_ENTRIES = 500;

  private getCacheKey(params: SearchQueryDTO, forceMock: boolean): string {
    return JSON.stringify({ ...params, forceMock });
  }

  private setCache(key: string, data: SearchResponse): void {
    if (this.searchCache.size >= this.MAX_CACHE_ENTRIES) {
      const firstKey = this.searchCache.keys().next().value;
      if (firstKey) this.searchCache.delete(firstKey);
    }
    this.searchCache.set(key, {
      data,
      expiresAt: Date.now() + this.CACHE_TTL_MS
    });
  }

  /**
   * Executa a busca híbrida ponderada com suporte a filtros e sumarização via IA.
   */
  public async executeSearch(params: SearchQueryDTO, forceMock = false): Promise<SearchResponse> {
    const cacheKey = this.getCacheKey(params, forceMock);
    const cached = this.searchCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    let queryEmbedding: number[] | undefined = undefined;

    if (params.q && params.q.trim().length > 0) {
      queryEmbedding = await queryEmbedderService.getEmbedding(params.q.trim());
    }

    const { results, total } = await searchRepository.hybridSearch({
      queryText: params.q,
      queryEmbedding,
      autor: params.autor,
      categoria: params.categoria,
      tipo: params.tipo,
      tag: params.tag,
      date_from: params.date_from,
      date_to: params.date_to,
      fuzzy: params.fuzzy,
      limit,
      offset
    });

    let ai_summary: string | undefined = undefined;

    // Se o usuário solicitou sumarização por IA e há resultados retornados
    if (params.summarize && results.length > 0 && params.q) {
      const topMaterial = results[0];
      const contextChunks = await searchRepository.getChunksForMaterial(topMaterial.material_id, 4);

      if (contextChunks.length > 0) {
        ai_summary = await geminiClient.summarizeSearchResults(params.q, contextChunks, forceMock);
      }
    }

    const response: SearchResponse = {
      results,
      total,
      page,
      limit,
      ai_summary
    };

    this.setCache(cacheKey, response);
    return response;
  }
}

export const hybridSearchService = new HybridSearchService();
