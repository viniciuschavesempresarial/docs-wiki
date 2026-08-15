export interface User {
  id: string;
  email: string;
  nome: string;
  password_hash: string;
  is_active: boolean;
  is_system_protected: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserResponse {
  id: string;
  email: string;
  nome: string;
  roles: string[];
  permissions: string[];
}

export interface UserPayload {
  sub: string;
  email: string;
  roles: string[];
  permissions: string[];
}

export interface Role {
  id: string;
  nome: string;
  descricao?: string;
}

export interface Permission {
  id: string;
  slug: string;
  descricao?: string;
}
