import pg from 'pg';
import { IRoleRepository } from './interfaces/IRoleRepository.js';
import { RoleEntity, PermissionEntity } from '../types/index.js';
import { pool } from '../config/database.js';

export class RoleRepository implements IRoleRepository {
  constructor(private db: pg.Pool = pool) {}

  async findByName(nome: string): Promise<RoleEntity | null> {
    const text = `
      SELECT id, nome, descricao
      FROM iam.roles
      WHERE UPPER(nome) = UPPER($1)
    `;
    const res = await this.db.query<RoleEntity>(text, [nome.trim()]);
    return res.rows[0] || null;
  }

  async findById(id: string): Promise<RoleEntity | null> {
    const text = `
      SELECT id, nome, descricao
      FROM iam.roles
      WHERE id = $1
    `;
    const res = await this.db.query<RoleEntity>(text, [id]);
    return res.rows[0] || null;
  }

  async getRolePermissions(roleId: string): Promise<PermissionEntity[]> {
    const text = `
      SELECT p.id, p.slug, p.descricao
      FROM iam.permissions p
      INNER JOIN iam.role_permissions rp ON rp.permission_id = p.id
      WHERE rp.role_id = $1
    `;
    const res = await this.db.query<PermissionEntity>(text, [roleId]);
    return res.rows;
  }

  async getAllRoles(): Promise<RoleEntity[]> {
    const text = `
      SELECT id, nome, descricao
      FROM iam.roles
      ORDER BY nome ASC
    `;
    const res = await this.db.query<RoleEntity>(text);
    return res.rows;
  }
}
