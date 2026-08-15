export * from '@shared/contracts';

export interface UserEntity {
  id: string;
  email: string;
  nome: string;
  password_hash: string;
  is_active: boolean;
  is_system_protected: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface RoleEntity {
  id: string;
  nome: string;
  descricao?: string;
}

export interface PermissionEntity {
  id: string;
  slug: string;
  descricao?: string;
}

export interface RegisterResult {
  id: string;
  email: string;
  nome: string;
  role: string;
}

export interface LoginResult {
  token: string;
  user: {
    id: string;
    email: string;
    nome: string;
    roles: string[];
    permissions: string[];
  };
}
