import { jest } from '@jest/globals';
import { hybridSearchService } from '../src/services/hybrid-search.service.js';
import { searchRepository } from '../src/repositories/search.repository.js';
import { geminiClient } from '../src/gemini/gemini.client.js';

describe('HybridSearchService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve executar busca híbrida e retornar estrutura paginada', async () => {
    const mockResults = [
      {
        material_id: '00000000-0000-0000-0000-000000000001',
        titulo: 'Guia de Arquitetura',
        slug: 'guia-arquitetura',
        tags: ['arquitetura', 'node'],
        text_score: 0.8,
        vector_score: 0.9,
        hybrid_score: 0.87
      }
    ];

    jest.spyOn(searchRepository, 'hybridSearch').mockResolvedValue({
      results: mockResults,
      total: 1
    });

    const response = await hybridSearchService.executeSearch({
      q: 'arquitetura',
      page: 1,
      limit: 10
    });

    expect(response.total).toBe(1);
    expect(response.results).toHaveLength(1);
    expect(response.results[0].hybrid_score).toBe(0.87);
    expect(response.ai_summary).toBeUndefined();
  });

  it('deve invocar o cliente Gemini quando summarize=true', async () => {
    const mockResults = [
      {
        material_id: '00000000-0000-0000-0000-000000000001',
        titulo: 'Guia de Arquitetura',
        slug: 'guia-arquitetura',
        tags: ['arquitetura'],
        text_score: 0.8,
        vector_score: 0.9,
        hybrid_score: 0.87
      }
    ];

    jest.spyOn(searchRepository, 'hybridSearch').mockResolvedValue({
      results: mockResults,
      total: 1
    });

    jest
      .spyOn(searchRepository, 'getChunksForMaterial')
      .mockResolvedValue(['Trecho sobre microsserviços', 'Trecho sobre pgvector']);

    jest
      .spyOn(geminiClient, 'summarizeSearchResults')
      .mockResolvedValue('Este é o resumo gerado pela Gemini API.');

    const response = await hybridSearchService.executeSearch({
      q: 'como funciona a arquitetura?',
      summarize: true,
      page: 1,
      limit: 10
    });

    expect(response.ai_summary).toBe('Este é o resumo gerado pela Gemini API.');
  });
});
