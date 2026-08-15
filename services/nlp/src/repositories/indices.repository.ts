import { pool } from '../config/database.js';

export interface UpsertIndiceBuscaParams {
  material_id: string;
  versao_num: number;
  titulo: string;
  slug: string;
  autor?: string;
  categoria?: string;
  tipo?: string;
  tags: string[];
  numero_palavras: number;
  tamanho_bytes: number;
  resumo_okf?: string;
  data_publicacao?: Date;
}

export class IndicesRepository {
  public async upsertIndice(params: UpsertIndiceBuscaParams): Promise<void> {
    const query = `
      INSERT INTO busca.indices_busca (
        material_id,
        versao_num,
        titulo,
        slug,
        autor,
        categoria,
        tipo,
        tags,
        numero_palavras,
        tamanho_bytes,
        resumo_okf,
        data_publicacao,
        updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW()
      )
      ON CONFLICT (material_id) DO UPDATE SET
        versao_num = EXCLUDED.versao_num,
        titulo = EXCLUDED.titulo,
        slug = EXCLUDED.slug,
        autor = EXCLUDED.autor,
        categoria = EXCLUDED.categoria,
        tipo = EXCLUDED.tipo,
        tags = EXCLUDED.tags,
        numero_palavras = EXCLUDED.numero_palavras,
        tamanho_bytes = EXCLUDED.tamanho_bytes,
        resumo_okf = EXCLUDED.resumo_okf,
        data_publicacao = COALESCE(EXCLUDED.data_publicacao, busca.indices_busca.data_publicacao),
        updated_at = NOW();
    `;

    const values = [
      params.material_id,
      params.versao_num,
      params.titulo,
      params.slug,
      params.autor || null,
      params.categoria || null,
      params.tipo || null,
      params.tags,
      params.numero_palavras,
      params.tamanho_bytes,
      params.resumo_okf || null,
      params.data_publicacao || new Date()
    ];

    await pool.query(query, values);
  }

  public async getIndiceByMaterialId(material_id: string): Promise<UpsertIndiceBuscaParams | null> {
    const res = await pool.query(
      'SELECT * FROM busca.indices_busca WHERE material_id = $1',
      [material_id]
    );
    return res.rows[0] || null;
  }

  public async deleteIndice(material_id: string): Promise<void> {
    // busca.material_chunks é deletado automaticamente via ON DELETE CASCADE
    await pool.query('DELETE FROM busca.indices_busca WHERE material_id = $1', [material_id]);
  }
}

export const indicesRepository = new IndicesRepository();
