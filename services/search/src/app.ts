import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { searchRouter } from './routes/search.routes.js';
import { healthRouter } from './routes/health.routes.js';
import { setupSwagger } from './docs/swagger.js';

export const app = express();

// Trust proxy para NGINX
app.set('trust proxy', 1);

app.use(
  cors({
    origin: true,
    credentials: true
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Documentação Swagger UI
setupSwagger(app);

// Rotas da API
app.use('/', healthRouter);
app.use('/', searchRouter);

// Middleware global de tratamento de erros
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[SEARCH_APP] Erro não tratado:', err);
  res.status(500).json({
    error: 'Erro interno no serviço de busca',
    message: process.env.NODE_ENV === 'production' ? undefined : err.message
  });
});
