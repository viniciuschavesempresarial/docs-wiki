import { PoolClient } from 'pg';
import { pool } from '../config/database.js';
import { MaterialVersao, OKFFrontmatter } from '@shared/contracts';

export interface CreateVersionInput {
  material_id: string;
  versao_num: number;
  parent_version_id?: string | null;
  conteudo_okf: string;
  conteudo_jsonb: OKFFrontmatter;
  commit_message: string;
  autor_id: string;
  hash_sha256: string;
}

export class VersionRepository {
  public static async create(input: CreateVersionInput, client?: PoolClient): Promise<MaterialVersao> {
    const db = client || pool;
    const query = `
      INSERT INTO conteudo.material_versoes (
        material_id, versao_num, parent_version_id, conteudo_okf, conteudo_jsonb, commit_message, autor_id, hash_sha256
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const values = [
      input.material_id,
      input.versao_num,
      input.parent_version_id || null,
      input.conteudo_okf,
      JSON.stringify(input.conteudo_jsonb),
      input.commit_message,
      input.autor_id,
      input.hash_sha256
    ];
    const res = await db.query(query, values);
    return res.rows[0];
  }

  public static async findById(id: string, client?: PoolClient): Promise<MaterialVersao | null> {
    const db = client || pool;
    const query = `SELECT * FROM conteudo.material_versoes WHERE id = $1;`;
    const res = await db.query(query, [id]);
    return res.rows[0] || null;
  }

  public static async findByMaterialAndVersionNum(
    materialId: string,
    versionNum: number,
    client?: PoolClient
  ): Promise<MaterialVersao | null> {
    const db = client || pool;
    const query = `
      SELECT * FROM conteudo.material_versoes
      WHERE material_id = $1 AND versao_num = $2;
    `;
    const res = await db.query(query, [materialId, versionNum]);
    return res.rows[0] || null;
  }

  public static async findHeadByMaterialId(materialId: string, client?: PoolClient): Promise<MaterialVersao | null> {
    const db = client || pool;
    const query = `
      SELECT v.* FROM conteudo.material_versoes v
      INNER JOIN conteudo.materiais m ON m.versao_head_id = v.id
      WHERE m.id = $1;
    `;
    const res = await db.query(query, [materialId]);
    return res.rows[0] || null;
  }

  public static async findAllByMaterialId(materialId: string, client?: PoolClient): Promise<MaterialVersao[]> {
    const db = client || pool;
    const query = `
      SELECT * FROM conteudo.material_versoes
      WHERE material_id = $1
      ORDER BY versao_num DESC;
    `;
    const res = await db.query(query, [materialId]);
    return res.rows;
  }

  public static async getLatestVersionNum(materialId: string, client?: PoolClient): Promise<number> {
    const db = client || pool;
    const query = `
      SELECT COALESCE(MAX(versao_num), 0) as max_ver
      FROM conteudo.material_versoes
      WHERE material_id = $1;
    `;
    const res = await db.query(query, [materialId]);
    return parseInt(res.rows[0].max_ver, 10);
  }
}
