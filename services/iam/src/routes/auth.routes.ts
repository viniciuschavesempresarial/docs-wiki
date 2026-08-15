import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { validateDto } from '../middlewares/validateDto.js';
import { authRateLimiter } from '../middlewares/rateLimiter.js';
import { AuthRegisterDTOSchema, AuthLoginDTOSchema } from '../dtos/auth.dto.js';

export function createAuthRoutes(authController: AuthController): Router {
  const router = Router();

  /**
   * @openapi
   * /register:
   *   post:
   *     summary: Registra um novo usuário no sistema
   *     tags: [Autenticação]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/AuthRegisterDTO'
   *     responses:
   *       201:
   *         description: Usuário cadastrado com sucesso com role padrão LEITOR
   *       400:
   *         description: Dados de entrada inválidos
   *       409:
   *         description: E-mail já cadastrado
   */
  router.post(
    '/register',
    authRateLimiter,
    validateDto(AuthRegisterDTOSchema),
    authController.register
  );

  /**
   * @openapi
   * /login:
   *   post:
   *     summary: Autentica um usuário e emite Cookie JWT
   *     tags: [Autenticação]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/AuthLoginDTO'
   *     responses:
   *       200:
   *         description: Autenticação bem-sucedida, cookie HttpOnly emitido
   *       401:
   *         description: Credenciais incorretas
   */
  router.post(
    '/login',
    authRateLimiter,
    validateDto(AuthLoginDTOSchema),
    authController.login
  );

  /**
   * @openapi
   * /logout:
   *   post:
   *     summary: Realiza logout e invalida o cookie de sessão
   *     tags: [Autenticação]
   *     responses:
   *       200:
   *         description: Logout realizado com sucesso
   */
  router.post(
    '/logout',
    authController.logout
  );

  return router;
}
