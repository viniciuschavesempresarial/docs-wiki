import { UserService } from '../../src/services/UserService.js';
import { MockUserRepository } from '../mocks/MockUserRepository.js';
import { NotFoundError, ForbiddenError } from '../../src/middlewares/errorHandler.js';

describe('UserService (Unit)', () => {
  let userService: UserService;
  let mockUserRepo: MockUserRepository;

  beforeEach(() => {
    mockUserRepo = new MockUserRepository();
    userService = new UserService(mockUserRepo);
  });

  describe('getMe / getUserById', () => {
    it('deve retornar dados do usuário autenticado incluindo roles e permissões', async () => {
      const user = await mockUserRepo.create({
        email: 'leitor@docswiki.local',
        nome: 'Leitor Teste',
        password_hash: 'hash'
      });
      await mockUserRepo.assignRole(user.id, 'LEITOR');

      const result = await userService.getMe(user.id);

      expect(result.id).toBe(user.id);
      expect(result.email).toBe(user.email);
      expect(result.roles).toContain('LEITOR');
      expect(result.permissions).toContain('search:query');
    });

    it('deve lançar NotFoundError para usuário inexistente', async () => {
      await expect(userService.getMe('id-inexistente')).rejects.toThrow(NotFoundError);
    });

    it('deve obter usuário por ID via getUserById', async () => {
      const user = await mockUserRepo.create({
        email: 'detalhe@docswiki.local',
        nome: 'Detalhe Teste',
        password_hash: 'hash'
      });
      await mockUserRepo.assignRole(user.id, 'LEITOR');

      const result = await userService.getUserById(user.id);
      expect(result.id).toBe(user.id);
      expect(result.email).toBe(user.email);
    });

    it('deve lançar NotFoundError em getUserById para usuário inexistente', async () => {
      await expect(userService.getUserById('id-inexistente')).rejects.toThrow(NotFoundError);
    });

    it('deve listar todos os usuários cadastrados', async () => {
      await mockUserRepo.create({
        email: 'u1@docswiki.local',
        nome: 'U1',
        password_hash: 'hash'
      });
      await mockUserRepo.create({
        email: 'u2@docswiki.local',
        nome: 'U2',
        password_hash: 'hash'
      });

      const list = await userService.listUsers();
      expect(list.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('deleteUser (Proteção de Super Admin)', () => {
    it('deve bloquear exclusão de usuário com is_system_protected = TRUE com ForbiddenError', async () => {
      const superAdmin = await mockUserRepo.create({
        email: 'admin@docswiki.local',
        nome: 'Admin Root',
        password_hash: 'hash',
        is_system_protected: true
      });

      await expect(userService.deleteUser(superAdmin.id)).rejects.toThrow(ForbiddenError);

      const stillExists = await mockUserRepo.findById(superAdmin.id);
      expect(stillExists).toBeDefined();
    });

    it('deve permitir exclusão de usuário comum com is_system_protected = FALSE', async () => {
      const regularUser = await mockUserRepo.create({
        email: 'comum@docswiki.local',
        nome: 'Usuário Comum',
        password_hash: 'hash',
        is_system_protected: false
      });

      await userService.deleteUser(regularUser.id);

      const exists = await mockUserRepo.findById(regularUser.id);
      expect(exists).toBeNull();
    });
  });
});
