import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { IUserRepository } from './repositories/interfaces/IUserRepository.js';
import { UserRepository } from './repositories/UserRepository.js';
import { PasswordService } from './services/PasswordService.js';
import { TokenService } from './services/TokenService.js';
import { AuthService } from './services/AuthService.js';
import { UserService } from './services/UserService.js';
import { AuthController } from './controllers/AuthController.js';
import { UserController } from './controllers/UserController.js';
import { createApiRouter } from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';

export interface AppDependencies {
  userRepository?: IUserRepository;
  passwordService?: PasswordService;
  tokenService?: TokenService;
  jwtSecret?: string;
}

export function createApp(dependencies: AppDependencies = {}): Express {
  const app = express();

  // Trust proxy para funcionar com NGINX e express-rate-limit
  app.set('trust proxy', 1);

  // Middlewares de Segurança e Parsing
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true
    })
  );
  app.use(cookieParser(env.COOKIE_SECRET));
  app.use(express.json());

  // Injeção de Dependências (Clean Architecture)
  const userRepository = dependencies.userRepository || new UserRepository();
  const passwordService = dependencies.passwordService || new PasswordService();
  const tokenService = dependencies.tokenService || new TokenService();

  const authService = new AuthService(userRepository, passwordService, tokenService);
  const userService = new UserService(userRepository);

  const authController = new AuthController(authService);
  const userController = new UserController(userService);

  // Registro de Rotas
  const jwtSecret = dependencies.jwtSecret || env.JWT_SECRET;
  const apiRouter = createApiRouter(authController, userController, jwtSecret);
  app.use('/', apiRouter);

  // Middleware Global de Tratamento de Erros
  app.use(errorHandler);

  return app;
}
