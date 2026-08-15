import { Router } from 'express';
import { UserController } from '../controllers/UserController.js';
import { authMiddleware, requirePermission } from '@shared/contracts';
import { validateDto } from '../middlewares/validateDto.js';
import { UserIdParamSchema } from '../dtos/auth.dto.js';
import { env } from '../config/env.js';

export function createUserRoutes(
  userController: UserController,
  jwtSecret: string = env.JWT_SECRET
): Router {
  const router = Router();
  const auth = authMiddleware(jwtSecret);

  /**
   * @openapi
   * /me:
   *   get:
   *     summary: Retorna os dados completos do usuário autenticado
   *     tags: [Usuários]
   *     security:
   *       - cookieAuth: []
   *     responses:
   *       200:
   *         description: Dados do perfil, roles e permissões
   *       401:
   *         description: Não autenticado ou token inválido
   */
  router.get(
    '/me',
    auth,
    userController.getMe
  );

  /**
   * @openapi
   * /users:
   *   get:
   *     summary: Lista todos os usuários cadastrados (Requer permissão admin:all)
   *     tags: [Usuários]
   *     security:
   *       - cookieAuth: []
   *     responses:
   *       200:
   *         description: Lista de usuários
   *       401:
   *         description: Não autenticado
   *       403:
   *         description: Acesso negado
   */
  router.get(
    '/users',
    auth,
    requirePermission('admin:all'),
    userController.listUsers
  );

  /**
   * @openapi
   * /users/{id}:
   *   get:
   *     summary: Obtém detalhes de um usuário específico por ID
   *     tags: [Usuários]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Dados do usuário
   *       404:
   *         description: Usuário não encontrado
   */
  router.get(
    '/users/:id',
    auth,
    validateDto(UserIdParamSchema, 'params'),
    userController.getUserById
  );

  /**
   * @openapi
   * /users/{id}:
   *   delete:
   *     summary: Exclui um usuário do sistema (Bloqueia super admins protegidos)
   *     tags: [Usuários]
   *     security:
   *       - cookieAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Usuário excluído com sucesso
   *       403:
   *         description: Usuário protegido pelo sistema não pode ser excluído
   *       404:
   *         description: Usuário não encontrado
   */
  router.delete(
    '/users/:id',
    auth,
    requirePermission('admin:all'),
    validateDto(UserIdParamSchema, 'params'),
    userController.deleteUser
  );

  /**
   * @openapi
   * /users/{id}/roles:
   *   put:
   *     summary: Atualiza os papéis e permissões de um usuário (Requer permissão admin:all)
   *     tags: [Usuários]
   *     security:
   *       - cookieAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [roles]
   *             properties:
   *               roles:
   *                 type: array
   *                 items:
   *                   type: string
   *                   enum: [LEITOR, EDITOR, ADMIN]
   *     responses:
   *       200:
   *         description: Permissões atualizadas com sucesso
   *       400:
   *         description: Dados de entrada inválidos
   *       401:
   *         description: Não autenticado
   *       403:
   *         description: Acesso negado
   *       404:
   *         description: Usuário não encontrado
   */
  router.put(
    '/users/:id/roles',
    auth,
    requirePermission('admin:all'),
    validateDto(UserIdParamSchema, 'params'),
    userController.updateUserRoles
  );

  return router;
}
