import request from 'supertest';
import { createApp } from '../../src/app.js';
import { MockUserRepository } from '../mocks/MockUserRepository.js';
import { PasswordService } from '../../src/services/PasswordService.js';
import { TokenService } from '../../src/services/TokenService.js';

describe('User Routes & Security (Integration)', () => {
  const jwtSecret = 'chave_de_teste_muito_segura_com_mais_de_32_caracteres';
  let app: any;
  let mockUserRepo: MockUserRepository;
  let tokenService: TokenService;
  let passwordService: PasswordService;

  beforeEach(() => {
    mockUserRepo = new MockUserRepository();
    passwordService = new PasswordService();
    tokenService = new TokenService(jwtSecret, '8h');

    app = createApp({
      userRepository: mockUserRepo,
      passwordService,
      tokenService,
      jwtSecret
    });
  });

  describe('GET /me', () => {
    it('deve retornar 200 com os dados do usuário autenticado via Cookie', async () => {
      const user = await mockUserRepo.create({
        email: 'leitor.autenticado@docswiki.local',
        nome: 'Leitor Autenticado',
        password_hash: 'hash'
      });
      await mockUserRepo.assignRole(user.id, 'LEITOR');

      const token = tokenService.generateToken({
        sub: user.id,
        email: user.email,
        roles: ['LEITOR'],
        permissions: ['search:query']
      });

      const response = await request(app)
        .get('/me')
        .set('Cookie', [`token=${token}`]);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(user.id);
      expect(response.body.email).toBe(user.email);
      expect(response.body.roles).toContain('LEITOR');
      expect(response.body.permissions).toContain('search:query');
    });

    it('deve retornar 401 quando o cookie não for fornecido', async () => {
      const response = await request(app).get('/me');
      expect(response.status).toBe(401);
      expect(response.body.error).toContain('não autorizado');
    });

    it('deve retornar 401 quando o cookie contiver token inválido', async () => {
      const response = await request(app)
        .get('/me')
        .set('Cookie', ['token=token_invalido_xyz']);

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Token inválido');
    });
  });

  describe('DELETE /users/:id (Proteção Super Admin & RBAC)', () => {
    it('deve retornar 403 Forbidden com erro explicito ao tentar excluir super admin com is_system_protected = TRUE', async () => {
      // Cria super admin protegido
      const superAdmin = await mockUserRepo.create({
        email: 'admin@docswiki.local',
        nome: 'Administrador do Sistema',
        password_hash: 'hash',
        is_system_protected: true
      });
      await mockUserRepo.assignRole(superAdmin.id, 'ADMIN');

      // Gera token de Admin para a requisição
      const adminToken = tokenService.generateToken({
        sub: superAdmin.id,
        email: superAdmin.email,
        roles: ['ADMIN'],
        permissions: ['admin:all']
      });

      const response = await request(app)
        .delete(`/users/${superAdmin.id}`)
        .set('Cookie', [`token=${adminToken}`]);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Usuário protegido pelo sistema não pode ser excluído');

      // Confirma que não foi deletado
      const adminInDb = await mockUserRepo.findById(superAdmin.id);
      expect(adminInDb).toBeDefined();
    });

    it('deve retornar 403 Forbidden quando usuário sem permissão admin:all tentar excluir outro usuário', async () => {
      const regularUser = await mockUserRepo.create({
        email: 'leitor@docswiki.local',
        nome: 'Leitor Comum',
        password_hash: 'hash'
      });
      await mockUserRepo.assignRole(regularUser.id, 'LEITOR');

      const leitorToken = tokenService.generateToken({
        sub: regularUser.id,
        email: regularUser.email,
        roles: ['LEITOR'],
        permissions: ['search:query']
      });

      const targetUser = await mockUserRepo.create({
        email: 'alvo@docswiki.local',
        nome: 'Alvo',
        password_hash: 'hash'
      });

      const response = await request(app)
        .delete(`/users/${targetUser.id}`)
        .set('Cookie', [`token=${leitorToken}`]);

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('admin:all');
    });

    it('deve permitir exclusão com status 200 de usuário comum por um Administrador', async () => {
      const adminUser = await mockUserRepo.create({
        email: 'admin2@docswiki.local',
        nome: 'Admin Secundário',
        password_hash: 'hash'
      });
      await mockUserRepo.assignRole(adminUser.id, 'ADMIN');

      const targetUser = await mockUserRepo.create({
        email: 'deletavel@docswiki.local',
        nome: 'Usuário Temporário',
        password_hash: 'hash',
        is_system_protected: false
      });

      const adminToken = tokenService.generateToken({
        sub: adminUser.id,
        email: adminUser.email,
        roles: ['ADMIN'],
        permissions: ['admin:all']
      });

      const response = await request(app)
        .delete(`/users/${targetUser.id}`)
        .set('Cookie', [`token=${adminToken}`]);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Usuário excluído com sucesso');

      const targetInDb = await mockUserRepo.findById(targetUser.id);
      expect(targetInDb).toBeNull();
    });
  });

  describe('GET /users & GET /users/:id', () => {
    it('deve listar usuários quando chamado por um Administrador', async () => {
      const adminUser = await mockUserRepo.create({
        email: 'admin.list@docswiki.local',
        nome: 'Admin Lista',
        password_hash: 'hash'
      });
      await mockUserRepo.assignRole(adminUser.id, 'ADMIN');

      const adminToken = tokenService.generateToken({
        sub: adminUser.id,
        email: adminUser.email,
        roles: ['ADMIN'],
        permissions: ['admin:all']
      });

      const response = await request(app)
        .get('/users')
        .set('Cookie', [`token=${adminToken}`]);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.users)).toBe(true);
    });

    it('deve obter usuário por ID autenticado', async () => {
      const user = await mockUserRepo.create({
        email: 'detalhe.route@docswiki.local',
        nome: 'Detalhe Rota',
        password_hash: 'hash'
      });
      await mockUserRepo.assignRole(user.id, 'LEITOR');

      const token = tokenService.generateToken({
        sub: user.id,
        email: user.email,
        roles: ['LEITOR'],
        permissions: ['search:query']
      });

      const response = await request(app)
        .get(`/users/${user.id}`)
        .set('Cookie', [`token=${token}`]);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(user.id);
      expect(response.body.email).toBe(user.email);
    });
  });
});
