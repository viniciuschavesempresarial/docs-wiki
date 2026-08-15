import { Router } from 'express';
import { healthHandler } from '../controllers/health.controller.js';

export const healthRouter = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Verificação de Saúde do Serviço de Busca
 *     tags:
 *       - Sistema
 *     responses:
 *       200:
 *         description: Serviço saudável
 *       503:
 *         description: Dependência essencial offline
 */
healthRouter.get('/health', healthHandler);
