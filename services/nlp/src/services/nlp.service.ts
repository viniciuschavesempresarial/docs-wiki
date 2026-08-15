import matter from 'gray-matter';
import { MaterialCriadoEvent, MaterialAtualizadoEvent, MaterialEnriquecidoEvent } from '@shared/contracts';
import { splitMarkdownIntoChunks } from '../chunker/markdown-splitter.js';
import { embeddingService } from '../embeddings/embedder.js';
import { indicesRepository } from '../repositories/indices.repository.js';
import { chunksRepository, InsertChunkParams } from '../repositories/chunks.repository.js';
import { publishEvent } from '../config/rabbitmq.js';

export interface ProcessMaterialResult {
  material_id: string;
  versao_num: number;
  chunks_count: number;
  words_count: number;
  bytes_count: number;
  success: boolean;
}

export class NLPService {
  /**
   * Processa a ingestão de um material (Parent-Document Ingestion + Markdown Chunking + Embeddings + Evento).
   */
  public async processMaterialEvent(
    event: MaterialCriadoEvent | MaterialAtualizadoEvent
  ): Promise<ProcessMaterialResult> {
    console.log(`[NLP_SERVICE] Iniciando processamento de NLP para o material: ${event.material_id} (versão: ${event.versao_num})`);

    // 1. Parsing do formato OKF (YAML Frontmatter + Markdown Body)
    const parsedOkf = matter(event.conteudo_okf || '');
    const frontmatter = parsedOkf.data || {};
    const markdownBody = parsedOkf.content || '';

    // 2. Extração e cálculo de metadados do documento pai
    const words = markdownBody.trim().split(/\s+/).filter(Boolean);
    const numero_palavras = words.length;
    const tamanho_bytes = Buffer.byteLength(event.conteudo_okf || '', 'utf8');

    // Extrai resumo do frontmatter ou dos primeiros 300 caracteres do corpo
    const resumo_okf =
      frontmatter.resumo ||
      frontmatter.summary ||
      frontmatter.description ||
      (markdownBody.length > 0 ? markdownBody.slice(0, 300).trim() + '...' : '');

    const data_publicacao = frontmatter.data_publicacao
      ? new Date(frontmatter.data_publicacao)
      : new Date(event.timestamp || Date.now());

    // 3. Upsert do Documento Pai em busca.indices_busca
    await indicesRepository.upsertIndice({
      material_id: event.material_id,
      versao_num: event.versao_num,
      titulo: event.titulo || frontmatter.title || 'Sem Título',
      slug: event.slug || frontmatter.slug || event.material_id,
      autor: event.autor || frontmatter.author || 'Autor Desconhecido',
      categoria: event.categoria || frontmatter.category,
      tipo: event.tipo || frontmatter.type,
      tags: event.tags || frontmatter.tags || [],
      numero_palavras,
      tamanho_bytes,
      resumo_okf,
      data_publicacao
    });

    // 4. Chunking estruturado por capítulos/seções Markdown
    const rawChunks = splitMarkdownIntoChunks(markdownBody, {
      defaultTitle: event.titulo || 'Seção Principal'
    });

    console.log(`[NLP_SERVICE] Documento particionado em ${rawChunks.length} chunks estruturados.`);

    // 5. Geração de Embeddings 768d com Cache Redis
    const chunkRecords: InsertChunkParams[] = [];

    for (const chunk of rawChunks) {
      const embedding = await embeddingService.getEmbedding(chunk.conteudo_chunk);
      chunkRecords.push({
        material_id: event.material_id,
        chunk_index: chunk.chunk_index,
        titulo_secao: chunk.titulo_secao,
        conteudo_chunk: chunk.conteudo_chunk,
        embedding
      });
    }

    // 6. Persistência Vetorial no PostgreSQL (pgvector)
    await chunksRepository.deleteChunksByMaterialId(event.material_id);
    await chunksRepository.insertChunksBatch(chunkRecords);

    // 7. Emissão do evento material.enriquecido na Exchange RabbitMQ
    const enrichedEvent: MaterialEnriquecidoEvent = {
      event: 'material.enriquecido',
      material_id: event.material_id,
      versao_num: event.versao_num,
      chunks_count: chunkRecords.length,
      timestamp: new Date().toISOString()
    };

    await publishEvent('material.enriquecido', enrichedEvent);

    console.log(`[NLP_SERVICE] Material ${event.material_id} enriquecido com sucesso. Evento 'material.enriquecido' publicado.`);

    return {
      material_id: event.material_id,
      versao_num: event.versao_num,
      chunks_count: chunkRecords.length,
      words_count: numero_palavras,
      bytes_count: tamanho_bytes,
      success: true
    };
  }
}

export const nlpService = new NLPService();
