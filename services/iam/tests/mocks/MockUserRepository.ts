import crypto from 'crypto';
import { IUserRepository } from '../../src/repositories/interfaces/IUserRepository.js';
import { UserEntity } from '../../src/types/index.js';

export class MockUserRepository implements IUserRepository {
  public users: Map<string, UserEntity> = new Map();
  public userRoles: Map<string, Set<string>> = new Map();
  public rolePermissions: Map<string, Set<string>> = new Map();

  constructor() {
    // Permissões padrão para testes
    this.rolePermissions.set('ADMIN', new Set(['admin:all', 'materials:create', 'materials:edit', 'materials:delete', 'search:query']));
    this.rolePermissions.set('EDITOR', new Set(['materials:create', 'materials:edit', 'search:query']));
    this.rolePermissions.set('LEITOR', new Set(['search:query']));
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const lowerEmail = email.trim().toLowerCase();
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === lowerEmail) {
        return { ...user };
      }
    }
    return null;
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = this.users.get(id);
    return user ? { ...user } : null;
  }

  async create(userData: {
    email: string;
    nome: string;
    password_hash: string;
    is_active?: boolean;
    is_system_protected?: boolean;
  }): Promise<UserEntity> {
    const id = crypto.randomUUID();
    const now = new Date();
    const newUser: UserEntity = {
      id,
      email: userData.email.trim().toLowerCase(),
      nome: userData.nome.trim(),
      password_hash: userData.password_hash,
      is_active: userData.is_active ?? true,
      is_system_protected: userData.is_system_protected ?? false,
      created_at: now,
      updated_at: now
    };

    this.users.set(id, newUser);
    return { ...newUser };
  }

  async assignRole(userId: string, roleName: string): Promise<void> {
    if (!this.userRoles.has(userId)) {
      this.userRoles.set(userId, new Set());
    }
    this.userRoles.get(userId)!.add(roleName);
  }

  async getUserRolesAndPermissions(
    userId: string
  ): Promise<{ roles: string[]; permissions: string[] }> {
    const rolesSet = this.userRoles.get(userId) || new Set<string>();
    const roles = Array.from(rolesSet);

    const permissionsSet = new Set<string>();
    for (const role of roles) {
      const perms = this.rolePermissions.get(role);
      if (perms) {
        perms.forEach((p) => permissionsSet.add(p));
      }
    }

    return {
      roles,
      permissions: Array.from(permissionsSet)
    };
  }

  async updateRoles(userId: string, roleNames: string[]): Promise<void> {
    this.userRoles.set(userId, new Set(roleNames));
  }

  async listAllWithRoles(): Promise<Array<UserEntity & { roles: string[] }>> {
    return Array.from(this.users.values()).map((u) => {
      const roles = Array.from(this.userRoles.get(u.id) || new Set<string>());
      return {
        ...u,
        roles
      };
    });
  }

  async deleteById(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  async listAll(): Promise<UserEntity[]> {
    return Array.from(this.users.values()).map((u) => ({ ...u }));
  }

  clear(): void {
    this.users.clear();
    this.userRoles.clear();
  }
}
