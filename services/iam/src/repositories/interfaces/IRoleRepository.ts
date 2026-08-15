import { RoleEntity, PermissionEntity } from '../../types/index.js';

export interface IRoleRepository {
  findByName(nome: string): Promise<RoleEntity | null>;
  findById(id: string): Promise<RoleEntity | null>;
  getRolePermissions(roleId: string): Promise<PermissionEntity[]>;
  getAllRoles(): Promise<RoleEntity[]>;
}
