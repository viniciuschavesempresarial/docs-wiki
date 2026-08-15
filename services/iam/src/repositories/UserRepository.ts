import pg from 'pg';
import { IUserRepository, UserWithRoles } from './interfaces/IUserRepository.js';
import { UserEntity } from '../types/index.js';
import { pool } from '../config/database.js';

export class UserRepository implements IUserRepository {
  constructor(private db: pg.Pool = pool) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    const text = `
      SELECT id, email, nome, password_hash, is_active, is_system_protected, created_at, updated_at
      FROM iam.users
      WHERE LOWER(email) = LOWER($1)
    `;
    const res = await this.db.query<UserEntity>(text, [email.trim()]);
    return res.rows[0] || null;
  }

  async findById(id: string): Promise<UserEntity | null> {
    const text = `
      SELECT id, email, nome, password_hash, is_active, is_system_protected, created_at, updated_at
      FROM iam.users
      WHERE id = $1
    `;
    const res = await this.db.query<UserEntity>(text, [id]);
    return res.rows[0] || null;
  }

  async create(userData: {
    email: string;
    nome: string;
    password_hash: string;
    is_active?: boolean;
    is_system_protected?: boolean;
  }): Promise<UserEntity> {
    const text = `
      INSERT INTO iam.users (
        email,
        nome,
        password_hash,
        is_active,
        is_system_protected
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, nome, password_hash, is_active, is_system_protected, created_at, updated_at
    `;
    const values = [
      userData.email.trim().toLowerCase(),
      userData.nome.trim(),
      userData.password_hash,
      userData.is_active ?? true,
      userData.is_system_protected ?? false
    ];

    const res = await this.db.query<UserEntity>(text, values);
    return res.rows[0];
  }

  async assignRole(userId: string, roleName: string): Promise<void> {
    const text = `
      INSERT INTO iam.user_roles (user_id, role_id)
      SELECT $1, r.id
      FROM iam.roles r
      WHERE r.nome = $2
      ON CONFLICT DO NOTHING
    `;
    await this.db.query(text, [userId, roleName]);
  }

  async updateRoles(userId: string, roleNames: string[]): Promise<void> {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM iam.user_roles WHERE user_id = $1', [userId]);

      if (roleNames.length > 0) {
        const insertQuery = `
          INSERT INTO iam.user_roles (user_id, role_id)
          SELECT $1, r.id
          FROM iam.roles r
          WHERE r.nome = ANY($2)
          ON CONFLICT DO NOTHING
        `;
        await client.query(insertQuery, [userId, roleNames]);
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async getUserRolesAndPermissions(
    userId: string
  ): Promise<{ roles: string[]; permissions: string[] }> {
    const rolesQuery = `
      SELECT r.nome
      FROM iam.roles r
      INNER JOIN iam.user_roles ur ON ur.role_id = r.id
      WHERE ur.user_id = $1
    `;
    const rolesRes = await this.db.query<{ nome: string }>(rolesQuery, [userId]);
    const roles = rolesRes.rows.map((row) => row.nome);

    const permissionsQuery = `
      SELECT DISTINCT p.slug
      FROM iam.permissions p
      INNER JOIN iam.role_permissions rp ON rp.permission_id = p.id
      INNER JOIN iam.roles r ON r.id = rp.role_id
      INNER JOIN iam.user_roles ur ON ur.role_id = r.id
      WHERE ur.user_id = $1
    `;
    const permissionsRes = await this.db.query<{ slug: string }>(permissionsQuery, [userId]);
    const permissions = permissionsRes.rows.map((row) => row.slug);

    return { roles, permissions };
  }

  async deleteById(id: string): Promise<boolean> {
    const text = `
      DELETE FROM iam.users
      WHERE id = $1
    `;
    const res = await this.db.query(text, [id]);
    return (res.rowCount ?? 0) > 0;
  }

  async listAll(): Promise<UserEntity[]> {
    const text = `
      SELECT id, email, nome, password_hash, is_active, is_system_protected, created_at, updated_at
      FROM iam.users
      ORDER BY created_at ASC
    `;
    const res = await this.db.query<UserEntity>(text);
    return res.rows;
  }

  async listAllWithRoles(): Promise<UserWithRoles[]> {
    const text = `
      SELECT 
        u.id, 
        u.email, 
        u.nome, 
        u.password_hash, 
        u.is_active, 
        u.is_system_protected, 
        u.created_at, 
        u.updated_at,
        COALESCE(
          array_agg(r.nome) FILTER (WHERE r.nome IS NOT NULL),
          '{}'
        ) AS roles
      FROM iam.users u
      LEFT JOIN iam.user_roles ur ON ur.user_id = u.id
      LEFT JOIN iam.roles r ON r.id = ur.role_id
      GROUP BY u.id
      ORDER BY u.created_at ASC
    `;
    const res = await this.db.query<UserWithRoles>(text);
    return res.rows;
  }
}
