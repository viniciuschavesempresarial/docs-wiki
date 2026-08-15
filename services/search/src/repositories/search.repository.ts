import { pool } from '../config/database.js';
import { SearchResultItem } from '@shared/contracts';

export interface HybridSearchParams {
  queryText?: string;
  queryEmbedding?: number[];
  autor?: string;
  categoria?: string;
  tipo?: string;
  tag?: string;
  date_from?: string;
  date_to?: string;
  fuzzy?: boolean;
  limit: number;
  offset: number;
}

export interface ChunkSearchResult {
  material_id: string;
  material_titulo: string;
  chunk_index: number;
  titulo_secao?: string;
  conteudo_chunk: string;
  similarity: number;
}

export class SearchRepository {
  /**
   * Executa a Busca Híbrida Ponderada combinando BM25 (tsvector) e Similaridade de Cosseno (pgvector).
   * Fórmula: Score = 0.3 * BM25 + 0.7 * Vector
   */
  public async hybridSearch(params: HybridSearchParams): Promise<{ results: SearchResultItem[]; total: number }> {
    const hasQuery = Boolean(params.queryText && params.queryText.trim().length > 0);
    const hasEmbedding = Boolean(params.queryEmbedding && params.queryEmbedding.length > 0);

    const values: any[] = [];
    let paramIndex = 1;

    let queryTextParam = '';
    let vectorParam = '';

    if (hasQuery) {
      values.push(params.queryText!.trim());
      queryTextParam = `$${paramIndex++}`;
    }

    if (hasEmbedding) {
      values.push(`[${params.queryEmbedding!.join(',')}]`);
      vectorParam = `$${paramIndex++}`;
    }

    // Monta filtros estruturados
    const filters: string[] = [];

    if (params.autor) {
      values.push(`%${params.autor}%`);
      filters.push(`b.autor ILIKE $${paramIndex++}`);
    }

    if (params.categoria) {
      values.push(params.categoria);
      filters.push(`b.categoria = $${paramIndex++}`);
    }

    if (params.tipo) {
      values.push(params.tipo);
      filters.push(`b.tipo = $${paramIndex++}`);
    }

    if (params.tag) {
      values.push(params.tag);
      filters.push(`$${paramIndex++} = ANY(b.tags)`);
    }

    if (params.date_from) {
      values.push(new Date(params.date_from));
      filters.push(`b.data_publicacao >= $${paramIndex++}`);
    }

    if (params.date_to) {
      values.push(new Date(params.date_to));
      filters.push(`b.data_publicacao <= $${paramIndex++}`);
    }

    let sqlQuery = '';

    if (hasQuery && hasEmbedding) {
      const filterClause = filters.length > 0 ? `AND ${filters.join(' AND ')}` : '';
      const fuzzyClause = params.fuzzy
        ? `OR b.titulo % ${queryTextParam} OR b.autor % ${queryTextParam}`
        : '';

      sqlQuery = `
        WITH text_search AS (
          SELECT 
            b.material_id,
            ts_rank_cd(b.busca_texto, plainto_tsquery('portuguese', ${queryTextParam})) AS text_score
          FROM busca.indices_busca b
          WHERE b.busca_texto @@ plainto_tsquery('portuguese', ${queryTextParam})
        ),
        vector_search AS (
          SELECT 
            c.material_id,
            MAX(1 - (c.embedding <=> ${vectorParam}::vector)) AS vector_score
          FROM busca.material_chunks c
          GROUP BY c.material_id
          ORDER BY vector_score DESC
          LIMIT 50
        )
        SELECT 
          b.material_id,
          b.titulo,
          b.slug,
          b.autor,
          b.categoria,
          b.tipo,
          b.tags,
          b.numero_palavras,
          b.tamanho_bytes,
          b.resumo_okf,
          b.data_publicacao,
          COALESCE(t.text_score, 0) AS text_score,
          COALESCE(v.vector_score, 0) AS vector_score,
          (0.3 * COALESCE(t.text_score, 0) + 0.7 * COALESCE(v.vector_score, 0)) AS hybrid_score
        FROM busca.indices_busca b
        LEFT JOIN text_search t ON b.material_id = t.material_id
        LEFT JOIN vector_search v ON b.material_id = v.material_id
        WHERE (t.text_score IS NOT NULL OR v.vector_score IS NOT NULL ${fuzzyClause})
        ${filterClause}
        ORDER BY hybrid_score DESC
        LIMIT $${paramIndex++} OFFSET $${paramIndex++};
      `;
    } else {
      // Busca somente por filtros / navegação
      const filterClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
      sqlQuery = `
        SELECT 
          b.material_id,
          b.titulo,
          b.slug,
          b.autor,
          b.categoria,
          b.tipo,
          b.tags,
          b.numero_palavras,
          b.tamanho_bytes,
          b.resumo_okf,
          b.data_publicacao,
          0 AS text_score,
          0 AS vector_score,
          1.0 AS hybrid_score
        FROM busca.indices_busca b
        ${filterClause}
        ORDER BY b.data_publicacao DESC
        LIMIT $${paramIndex++} OFFSET $${paramIndex++};
      `;
    }

    values.push(params.limit);
    values.push(params.offset);

    const result = await pool.query(sqlQuery, values);

    // Contagem total para paginação
    const countSql = `
      SELECT COUNT(*) as total
      FROM busca.indices_busca b
      ${filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : ''}
    `;
    const countValues = values.slice(
      (hasQuery ? 1 : 0) + (hasEmbedding ? 1 : 0),
      (hasQuery ? 1 : 0) + (hasEmbedding ? 1 : 0) + filters.length
    );
    const countRes = await pool.query(countSql, countValues);
    const total = parseInt(countRes.rows[0]?.total || result.rows.length.toString(), 10);

    const mappedResults: SearchResultItem[] = result.rows.map((row) => ({
      material_id: row.material_id,
      titulo: row.titulo,
      slug: row.slug,
      autor: row.autor,
      categoria: row.categoria,
      tipo: row.tipo,
      tags: row.tags || [],
      numero_palavras: row.numero_palavras ? parseInt(row.numero_palavras, 10) : 0,
      tamanho_bytes: row.tamanho_bytes ? parseInt(row.tamanho_bytes, 10) : 0,
      resumo_okf: row.resumo_okf,
      data_publicacao: row.data_publicacao ? row.data_publicacao.toISOString() : undefined,
      text_score: parseFloat(parseFloat(row.text_score || '0').toFixed(4)),
      vector_score: parseFloat(parseFloat(row.vector_score || '0').toFixed(4)),
      hybrid_score: parseFloat(parseFloat(row.hybrid_score || '0').toFixed(4))
    }));

    return {
      results: mappedResults,
      total
    };
  }

  /**
   * Busca os chunks semanticamente mais similares para os documentos selecionados (Chat RAG).
   */
  public async getRelevantChunksForMaterials(
    material_ids: string[],
    queryEmbedding: number[],
    limit = 8
  ): Promise<ChunkSearchResult[]> {
    const vectorString = `[${queryEmbedding.join(',')}]`;

    const sql = `
      SELECT 
        c.material_id,
        b.titulo AS material_titulo,
        c.chunk_index,
        c.titulo_secao,
        c.conteudo_chunk,
        (1 - (c.embedding <=> $1::vector)) AS similarity
      FROM busca.material_chunks c
      JOIN busca.indices_busca b ON c.material_id = b.material_id
      WHERE c.material_id = ANY($2::uuid[])
      ORDER BY similarity DESC
      LIMIT $3;
    `;

    const result = await pool.query(sql, [vectorString, material_ids, limit]);

    return result.rows.map((row) => ({
      material_id: row.material_id,
      material_titulo: row.material_titulo,
      chunk_index: row.chunk_index,
      titulo_secao: row.titulo_secao,
      conteudo_chunk: row.conteudo_chunk,
      similarity: parseFloat(parseFloat(row.similarity || '0').toFixed(4))
    }));
  }

  /**
   * Recupera os chunks de um documento específico para sumarização sintética via Gemini.
   */
  public async getChunksForMaterial(material_id: string, limit = 5): Promise<string[]> {
    const sql = `
      SELECT conteudo_chunk
      FROM busca.material_chunks
      WHERE material_id = $1
      ORDER BY chunk_index ASC
      LIMIT $2;
    `;

    const result = await pool.query(sql, [material_id, limit]);
    return result.rows.map((r) => r.conteudo_chunk);
  }
}

export const searchRepository = new SearchRepository();
