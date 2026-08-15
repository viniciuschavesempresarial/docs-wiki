import { IUserRepository } from '../repositories/interfaces/IUserRepository.js';
import { PasswordService } from './PasswordService.js';
import { TokenService } from './TokenService.js';
import {
  AuthRegisterDTO,
  AuthLoginDTO,
  RegisterResult,
  LoginResult
} from '../types/index.js';
import { ConflictError, UnauthorizedError } from '../middlewares/errorHandler.js';

export class AuthService {
  constructor(
    private userRepository: IUserRepository,
    private passwordService: PasswordService = new PasswordService(),
    private tokenService: TokenService = new TokenService()
  ) {}

  async register(dto: AuthRegisterDTO): Promise<RegisterResult> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictError('E-mail já cadastrado no sistema');
    }

    const password_hash = await this.passwordService.hashPassword(dto.password);

    const newUser = await this.userRepository.create({
      email: dto.email,
      nome: dto.nome,
      password_hash
    });

    const defaultRole = 'LEITOR';
    await this.userRepository.assignRole(newUser.id, defaultRole);

    return {
      id: newUser.id,
      email: newUser.email,
      nome: newUser.nome,
      role: defaultRole
    };
  }

  async login(dto: AuthLoginDTO): Promise<LoginResult> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user || !user.is_active) {
      throw new UnauthorizedError('E-mail ou senha incorretos');
    }

    const isPasswordValid = await this.passwordService.comparePassword(
      dto.password,
      user.password_hash
    );

    if (!isPasswordValid) {
      throw new UnauthorizedError('E-mail ou senha incorretos');
    }

    const { roles, permissions } = await this.userRepository.getUserRolesAndPermissions(user.id);

    const token = this.tokenService.generateToken({
      sub: user.id,
      email: user.email,
      roles,
      permissions
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome,
        roles,
        permissions
      }
    };
  }
}
