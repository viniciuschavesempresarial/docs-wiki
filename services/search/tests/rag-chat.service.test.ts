import { jest } from '@jest/globals';
import { ragChatService } from '../src/services/rag-chat.service.js';
import { searchRepository } from '../src/repositories/search.repository.js';
import { geminiClient } from '../src/gemini/gemini.client.js';

describe('RAGChatService (Grounding & Gemini)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve realizar busca vetorial estrita nos material_ids selecionados e gerar resposta com citações', async () => {
    const mockChunks = [
      {
        material_id: '00000000-0000-0000-0000-000000000001',
        material_titulo: 'Guia de Arquitetura',
        chunk_index: 0,
        titulo_secao: 'Versionamento Git-like',
        conteudo_chunk: 'O hash das versões é calculado utilizando SHA-256 sobre o conteúdo OKF.',
        similarity: 0.92
      }
    ];

    jest
      .spyOn(searchRepository, 'getRelevantChunksForMaterials')
      .mockResolvedValue(mockChunks);

    jest
      .spyOn(geminiClient, 'generateGroundedChatResponse')
      .mockResolvedValue(
        'O hash das versões é calculado via SHA-256 para garantir a integridade dos dados (Doc: Guia de Arquitetura).'
      );

    const response = await ragChatService.executeChat({
      query: 'Como é calculado o hash das versões?',
      material_ids: ['00000000-0000-0000-0000-000000000001']
    });

    expect(response.answer).toContain('SHA-256');
    expect(response.sources).toHaveLength(1);
    expect(response.sources[0].material_id).toBe('00000000-0000-0000-0000-000000000001');
    expect(response.sources[0].titulo).toBe('Guia de Arquitetura');
    expect(response.sources[0].similarity).toBe(0.92);
  });

  it('deve retornar mensagem amigável quando nenhum chunk relevante for encontrado', async () => {
    jest
      .spyOn(searchRepository, 'getRelevantChunksForMaterials')
      .mockResolvedValue([]);

    const response = await ragChatService.executeChat({
      query: 'Pergunta sobre assunto inexistente',
      material_ids: ['00000000-0000-0000-0000-000000000001']
    });

    expect(response.answer).toContain('Nenhum conteúdo ou trecho relevante foi localizado');
    expect(response.sources).toEqual([]);
  });
});
