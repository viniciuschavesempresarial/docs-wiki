import request from 'supertest';
import { createApp } from '../../src/app.js';
import { MockUserRepository } from '../mocks/MockUserRepository.js';
import { PasswordService } from '../../src/services/PasswordService.js';
import { TokenService } from '../../src/services/TokenService.js';

describe('Auth Routes (Integration)', () => {
  let app: any;
  let mockUserRepo: MockUserRepository;

  beforeEach(() => {
    mockUserRepo = new MockUserRepository();
    const passwordService = new PasswordService();
    const tokenService = new TokenService('chave_de_teste_muito_segura_com_mais_de_32_caracteres', '8h');

    app = createApp({
      userRepository: mockUserRepo,
      passwordService,
      tokenService
    });
  });

  describe('POST /register', () => {
    it('deve registrar usuário com sucesso e retornar status 201 com role LEITOR', async () => {
      const response = await request(app)
        .post('/register')
        .send({
          email: 'novo.usuario@docswiki.local',
          nome: 'Novo Usuário',
          password: 'Password123'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe('novo.usuario@docswiki.local');
      expect(response.body.nome).toBe('Novo Usuário');
      expect(response.body.role).toBe('LEITOR');
    });

    it('deve retornar status 409 ao tentar registrar email duplicado', async () => {
      await request(app)
        .post('/register')
        .send({
          email: 'duplicado@docswiki.local',
          nome: 'Primeiro Cadastro',
          password: 'Password123'
        });

      const response = await request(app)
        .post('/register')
        .send({
          email: 'duplicado@docswiki.local',
          nome: 'Segundo Cadastro',
          password: 'Password123'
        });

      expect(response.status).toBe(409);
      expect(response.body.error).toContain('já cadastrado');
    });

    it('deve retornar status 400 ao enviar dados inválidos', async () => {
      const response = await request(app)
        .post('/register')
        .send({
          email: 'email-invalido',
          nome: 'A',
          password: '123'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/register')
        .send({
          email: 'login.test@docswiki.local',
          nome: 'Login Test',
          password: 'Password123'
        });
    });

    it('deve autenticar usuário válido e emitir cookie token HttpOnly com SameSite=Lax', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          email: 'login.test@docswiki.local',
          password: 'Password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('login.test@docswiki.local');
      expect(response.body.user.roles).toContain('LEITOR');

      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toMatch(/token=/);
      expect(cookies[0]).toMatch(/HttpOnly/i);
      expect(cookies[0]).toMatch(/SameSite=Lax/i);
    });

    it('deve rejeitar login com senha incorreta com status 401', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          email: 'login.test@docswiki.local',
          password: 'SenhaErrada999'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('incorretos');
    });

    it('deve rejeitar login de usuário inexistente com status 401', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          email: 'naoexiste@docswiki.local',
          password: 'Password123'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /logout', () => {
    it('deve limpar cookie de autenticação e retornar status 200', async () => {
      const response = await request(app).post('/logout');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Logout realizado com sucesso');

      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toMatch(/token=;/);
    });
  });
});
