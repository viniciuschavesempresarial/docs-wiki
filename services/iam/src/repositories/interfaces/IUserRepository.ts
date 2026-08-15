import { UserEntity } from '../../types/index.js';

export interface UserWithRoles extends UserEntity {
  roles: string[];
}

export interface IUserRepository {
  findByEmail(email: string): Promise<UserEntity | null>;
  findById(id: string): Promise<UserEntity | null>;
  create(userData: {
    email: string;
    nome: string;
    password_hash: string;
    is_active?: boolean;
    is_system_protected?: boolean;
  }): Promise<UserEntity>;
  assignRole(userId: string, roleName: string): Promise<void>;
  updateRoles(userId: string, roleNames: string[]): Promise<void>;
  getUserRolesAndPermissions(userId: string): Promise<{ roles: string[]; permissions: string[] }>;
  deleteById(id: string): Promise<boolean>;
  listAll(): Promise<UserEntity[]>;
  listAllWithRoles(): Promise<UserWithRoles[]>;
}
