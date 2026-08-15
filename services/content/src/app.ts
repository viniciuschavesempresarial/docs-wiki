import express, { Express, Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { ZodError } from 'zod';
import { materialRoutes } from './routes/material.routes.js';
import { OKFParseError } from './parser/okfParser.js';
import {
  NotFoundError,
  VersionConflictError,
  BadRequestError
} from './services/gitLike.service.js';

export function createApp(): Express {
  const app = express();

  // Trust proxy para NGINX
  app.set('trust proxy', 1);

  // Middlewares globais
  app.use(cors({ origin: true, credentials: true }));
  app.use(cookieParser());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      service: 'content-service',
      timestamp: new Date().toISOString()
    });
  });

  // Rotas de materiais e controle de versão (escutando a partir da raiz)
  app.use('/', materialRoutes);

  // Middleware centralizado de tratamento de erros
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof ZodError) {
      res.status(400).json({
        error: 'Erro de validação dos dados de entrada',
        details: err.errors
      });
      return;
    }

    if (err instanceof OKFParseError) {
      res.status(400).json({
        error: err.message,
        details: err.errors
      });
      return;
    }

    if (err instanceof VersionConflictError) {
      res.status(409).json({
        error: err.message
      });
      return;
    }

    if (err instanceof NotFoundError) {
      res.status(404).json({
        error: err.message
      });
      return;
    }

    if (err instanceof BadRequestError) {
      res.status(400).json({
        error: err.message
      });
      return;
    }

    console.error('[Unhandled Error in content-service]:', err);
    res.status(500).json({
      error: 'Erro interno no servidor de conteúdo',
      message: process.env.NODE_ENV === 'production' ? undefined : err.message
    });
  });

  return app;
}

export const app = createApp();
