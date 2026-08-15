import { AuthService } from '../../src/services/AuthService.js';
import { PasswordService } from '../../src/services/PasswordService.js';
import { TokenService } from '../../src/services/TokenService.js';
import { MockUserRepository } from '../mocks/MockUserRepository.js';
import { ConflictError, UnauthorizedError } from '../../src/middlewares/errorHandler.js';

describe('AuthService (Unit)', () => {
  let authService: AuthService;
  let mockUserRepo: MockUserRepository;
  let passwordService: PasswordService;
  let tokenService: TokenService;

  beforeEach(() => {
    mockUserRepo = new MockUserRepository();
    passwordService = new PasswordService();
    tokenService = new TokenService('jwt_secret_test_key_1234567890123456', '1h');
    authService = new AuthService(mockUserRepo, passwordService, tokenService);
  });

  describe('register', () => {
    it('deve registrar um novo usuário com role padrão LEITOR e senha hasheada', async () => {
      const registerDto = {
        email: 'novo@docswiki.local',
        nome: 'Novo Usuário',
        password: 'Password123'
      };

      const result = await authService.register(registerDto);

      expect(result.id).toBeDefined();
      expect(result.email).toBe(registerDto.email);
      expect(result.nome).toBe(registerDto.nome);
      expect(result.role).toBe('LEITOR');

      const savedUser = await mockUserRepo.findByEmail(registerDto.email);
      expect(savedUser).toBeDefined();
      expect(savedUser!.password_hash).not.toBe(registerDto.password);
      expect(savedUser!.password_hash).toMatch(/^\$2[aby]?\$12\$/);
    });

    it('deve lançar ConflictError ao tentar registrar um e-mail já existente', async () => {
      const registerDto = {
        email: 'duplicado@docswiki.local',
        nome: 'Usuário Teste',
        password: 'Password123'
      };

      await authService.register(registerDto);

      await expect(authService.register(registerDto)).rejects.toThrow(ConflictError);
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await authService.register({
        email: 'usuario@docswiki.local',
        nome: 'Usuário Ativo',
        password: 'Password123'
      });
    });

    it('deve autenticar com sucesso e retornar token e dados do usuário', async () => {
      const loginDto = {
        email: 'usuario@docswiki.local',
        password: 'Password123'
      };

      const result = await authService.login(loginDto);

      expect(result.token).toBeDefined();
      expect(result.user.email).toBe(loginDto.email);
      expect(result.user.roles).toContain('LEITOR');
    });

    it('deve lançar UnauthorizedError quando a senha estiver errada', async () => {
      const loginDto = {
        email: 'usuario@docswiki.local',
        password: 'SenhaIncorreta99'
      };

      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedError);
    });

    it('deve lançar UnauthorizedError quando o e-mail não existir', async () => {
      const loginDto = {
        email: 'inexistente@docswiki.local',
        password: 'Password123'
      };

      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedError);
    });
  });
});
