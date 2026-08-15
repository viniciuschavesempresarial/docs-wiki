import { pool } from '../config/database.js';

export interface InsertChunkParams {
  material_id: string;
  chunk_index: number;
  titulo_secao?: string;
  conteudo_chunk: string;
  embedding: number[];
}

export class ChunksRepository {
  /**
   * Remove todos os chunks pertencentes a uma versão anterior do material.
   */
  public async deleteChunksByMaterialId(material_id: string): Promise<void> {
    await pool.query('DELETE FROM busca.material_chunks WHERE material_id = $1', [material_id]);
  }

  /**
   * Insere um conjunto de chunks vetoriais em uma transação segura.
   */
  public async insertChunksBatch(chunks: InsertChunkParams[]): Promise<void> {
    if (chunks.length === 0) return;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const insertQuery = `
        INSERT INTO busca.material_chunks (
          material_id,
          chunk_index,
          titulo_secao,
          conteudo_chunk,
          embedding,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, NOW())
      `;

      for (const chunk of chunks) {
        // Formata o vetor para a sintaxe do pgvector: '[0.123, 0.456, ...]'
        const vectorString = `[${chunk.embedding.join(',')}]`;
        await client.query(insertQuery, [
          chunk.material_id,
          chunk.chunk_index,
          chunk.titulo_secao || null,
          chunk.conteudo_chunk,
          vectorString
        ]);
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Recupera chunks para verificação e testes.
   */
  public async getChunksByMaterialId(material_id: string): Promise<InsertChunkParams[]> {
    const res = await pool.query(
      'SELECT material_id, chunk_index, titulo_secao, conteudo_chunk, embedding::text FROM busca.material_chunks WHERE material_id = $1 ORDER BY chunk_index ASC',
      [material_id]
    );

    return res.rows.map((row) => ({
      material_id: row.material_id,
      chunk_index: row.chunk_index,
      titulo_secao: row.titulo_secao,
      conteudo_chunk: row.conteudo_chunk,
      embedding: typeof row.embedding === 'string'
        ? JSON.parse(row.embedding)
        : row.embedding
    }));
  }
}

export const chunksRepository = new ChunksRepository();
