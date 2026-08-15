import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { UserController } from '../controllers/UserController.js';
import { createAuthRoutes } from './auth.routes.js';
import { createUserRoutes } from './user.routes.js';

export function createApiRouter(
  authController: AuthController,
  userController: UserController,
  jwtSecret?: string
): Router {
  const router = Router();

  // Health check endpoint
  router.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', service: 'iam-service' });
  });

  // Rotas escutando na raiz conforme especificação
  router.use('/', createAuthRoutes(authController));
  router.use('/', createUserRoutes(userController, jwtSecret));

  return router;
}
