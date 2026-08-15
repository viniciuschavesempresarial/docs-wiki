import { IUserRepository } from '../repositories/interfaces/IUserRepository.js';
import { UserResponse } from '@shared/contracts';
import { NotFoundError, ForbiddenError, BadRequestError } from '../middlewares/errorHandler.js';

export interface UserListItem {
  id: string;
  email: string;
  nome: string;
  is_active: boolean;
  is_system_protected: boolean;
  roles: string[];
  created_at: Date;
}

export class UserService {
  constructor(private userRepository: IUserRepository) {}

  async getMe(userId: string): Promise<UserResponse> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    const { roles, permissions } = await this.userRepository.getUserRolesAndPermissions(userId);

    return {
      id: user.id,
      email: user.email,
      nome: user.nome,
      roles,
      permissions
    };
  }

  async getUserById(userId: string): Promise<UserResponse> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    const { roles, permissions } = await this.userRepository.getUserRolesAndPermissions(userId);

    return {
      id: user.id,
      email: user.email,
      nome: user.nome,
      roles,
      permissions
    };
  }

  async deleteUser(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    if (user.is_system_protected) {
      throw new ForbiddenError('Usuário protegido pelo sistema não pode ser excluído');
    }

    await this.userRepository.deleteById(userId);
  }

  async listUsers(): Promise<UserListItem[]> {
    const users = await this.userRepository.listAllWithRoles();
    return users.map((u) => ({
      id: u.id,
      email: u.email,
      nome: u.nome,
      is_active: u.is_active,
      is_system_protected: u.is_system_protected,
      roles: u.roles || [],
      created_at: u.created_at
    }));
  }

  async updateUserRoles(userId: string, roles: string[]): Promise<UserResponse> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    const validRoles = ['LEITOR', 'EDITOR', 'ADMIN'];
    const invalid = roles.filter((r) => !validRoles.includes(r.toUpperCase()));
    if (invalid.length > 0) {
      throw new BadRequestError(`Roles inválidas fornecidas: ${invalid.join(', ')}`);
    }

    const normalizedRoles = roles.map((r) => r.toUpperCase());
    await this.userRepository.updateRoles(userId, normalizedRoles);

    return this.getUserById(userId);
  }
}
