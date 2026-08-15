import { PoolClient } from 'pg';
import { pool } from '../config/database.js';
import { Material } from '@shared/contracts';

export interface MaterialFilters {
  tipo?: string;
  categoria?: string;
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CreateMaterialInput {
  slug: string;
  tipo: string;
  categoria: string;
  status?: 'draft' | 'published' | 'archived';
  versao_head_id?: string | null;
}

export class MaterialRepository {
  public static async create(input: CreateMaterialInput, client?: PoolClient): Promise<Material> {
    const db = client || pool;
    const query = `
      INSERT INTO conteudo.materiais (slug, tipo, categoria, status, versao_head_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [
      input.slug,
      input.tipo,
      input.categoria,
      input.status || 'draft',
      input.versao_head_id || null
    ];
    const res = await db.query(query, values);
    return res.rows[0];
  }

  public static async findById(id: string, client?: PoolClient): Promise<Material | null> {
    const db = client || pool;
    const query = `SELECT * FROM conteudo.materiais WHERE id = $1;`;
    const res = await db.query(query, [id]);
    return res.rows[0] || null;
  }

  public static async findByIdForUpdate(id: string, client: PoolClient): Promise<Material | null> {
    const query = `SELECT * FROM conteudo.materiais WHERE id = $1 FOR UPDATE;`;
    const res = await client.query(query, [id]);
    return res.rows[0] || null;
  }

  public static async findBySlug(slug: string, client?: PoolClient): Promise<Material | null> {
    const db = client || pool;
    const query = `SELECT * FROM conteudo.materiais WHERE slug = $1;`;
    const res = await db.query(query, [slug]);
    return res.rows[0] || null;
  }

  public static async findAll(filters: MaterialFilters = {}, client?: PoolClient): Promise<{ materials: Material[]; total: number }> {
    const db = client || pool;
    const conditions: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (filters.tipo) {
      conditions.push(`m.tipo = $${idx++}`);
      values.push(filters.tipo);
    }
    if (filters.categoria) {
      conditions.push(`m.categoria = $${idx++}`);
      values.push(filters.categoria);
    }
    if (filters.status) {
      conditions.push(`m.status = $${idx++}`);
      values.push(filters.status);
    }
    if (filters.search) {
      conditions.push(`(m.slug ILIKE $${idx} OR m.categoria ILIKE $${idx} OR m.tipo ILIKE $${idx} OR v.conteudo_jsonb->>'title' ILIKE $${idx} OR v.conteudo_jsonb->>'titulo' ILIKE $${idx})`);
      values.push(`%${filters.search}%`);
      idx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const countRes = await db.query(
      `SELECT COUNT(*) as total FROM conteudo.materiais m LEFT JOIN conteudo.material_versoes v ON m.versao_head_id = v.id ${whereClause};`,
      values
    );
    const total = parseInt(countRes.rows[0].total, 10);

    const limit = filters.limit || 20;
    const offset = filters.offset || 0;

    const dataQuery = `
      SELECT 
        m.*,
        COALESCE(v.conteudo_jsonb->>'title', v.conteudo_jsonb->>'titulo', m.slug) as titulo,
        v.conteudo_jsonb->>'autor' as autor,
        v.conteudo_jsonb->'tags' as tags
      FROM conteudo.materiais m
      LEFT JOIN conteudo.material_versoes v ON m.versao_head_id = v.id
      ${whereClause}
      ORDER BY m.updated_at DESC
      LIMIT $${idx++} OFFSET $${idx++};
    `;
    const dataRes = await db.query(dataQuery, [...values, limit, offset]);

    return {
      materials: dataRes.rows,
      total
    };
  }

  public static async updateHead(
    materialId: string,
    headVersionId: string,
    metadata?: { tipo?: string; categoria?: string; status?: 'draft' | 'published' | 'archived' },
    client?: PoolClient
  ): Promise<Material | null> {
    const db = client || pool;
    const updates: string[] = ['versao_head_id = $1', 'updated_at = NOW()'];
    const values: unknown[] = [headVersionId, materialId];
    let idx = 3;

    if (metadata?.tipo) {
      updates.push(`tipo = $${idx++}`);
      values.push(metadata.tipo);
    }
    if (metadata?.categoria) {
      updates.push(`categoria = $${idx++}`);
      values.push(metadata.categoria);
    }
    if (metadata?.status) {
      updates.push(`status = $${idx++}`);
      values.push(metadata.status);
    }

    const query = `
      UPDATE conteudo.materiais
      SET ${updates.join(', ')}
      WHERE id = $2
      RETURNING *;
    `;
    const res = await db.query(query, values);
    return res.rows[0] || null;
  }

  public static async delete(id: string, client?: PoolClient): Promise<boolean> {
    const db = client || pool;
    // 1. Limpa a restrição circular de chave estrangeira (versao_head_id)
    await db.query(`UPDATE conteudo.materiais SET versao_head_id = NULL WHERE id = $1;`, [id]);
    // 2. Remove o material da tabela principal (as versões em conteudo.material_versoes são removidas via ON DELETE CASCADE)
    const res = await db.query(`DELETE FROM conteudo.materiais WHERE id = $1;`, [id]);
    // 3. Remove o índice de busca e metadados (os chunks em busca.material_chunks são removidos via ON DELETE CASCADE)
    await db.query(`DELETE FROM busca.indices_busca WHERE material_id = $1;`, [id]);
    return (res.rowCount || 0) > 0;
  }
}
