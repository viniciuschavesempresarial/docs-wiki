import { ChatRequestDTO, ChatResponse, ChatSourceCitation } from '@shared/contracts';
import { queryEmbedderService } from '../embeddings/query-embedder.js';
import { searchRepository } from '../repositories/search.repository.js';
import { geminiClient, GroundingContextItem } from '../gemini/gemini.client.js';

export class RAGChatService {
  /**
   * Executa o chat RAG contextual estritamente aterrado aos documentos selecionados.
   */
  public async executeChat(dto: ChatRequestDTO): Promise<ChatResponse> {
    const { query, material_ids } = dto;

    // 1. Gera embedding da query do usuário
    const queryEmbedding = await queryEmbedderService.getEmbedding(query.trim());

    // 2. Busca chunks mais similares estritamente dentro dos material_ids fornecidos
    const relevantChunks = await searchRepository.getRelevantChunksForMaterials(
      material_ids,
      queryEmbedding,
      8
    );

    if (relevantChunks.length === 0) {
      return {
        answer: 'Nenhum conteúdo ou trecho relevante foi localizado nos documentos selecionados para responder à pergunta.',
        sources: []
      };
    }

    // 3. Monta o contexto para Grounding no Gemini
    const contextItems: GroundingContextItem[] = relevantChunks.map((chunk) => ({
      documentTitle: chunk.material_titulo,
      sectionTitle: chunk.titulo_secao,
      content: chunk.conteudo_chunk
    }));

    // 4. Invoca o modelo Gemini com temperatura 0.2
    const answer = await geminiClient.generateGroundedChatResponse(query, contextItems);

    // 5. Mapeia fontes e citações
    const sources: ChatSourceCitation[] = relevantChunks.map((chunk) => ({
      material_id: chunk.material_id,
      titulo: chunk.material_titulo,
      chunk_index: chunk.chunk_index,
      similarity: chunk.similarity
    }));

    return {
      answer,
      sources
    };
  }
}

export const ragChatService = new RAGChatService();
