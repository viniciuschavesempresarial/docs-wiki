import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: env.NODE_ENV === 'test' ? 10000 : 100, // limite de requisições
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Muitas tentativas a partir deste IP, tente novamente mais tarde.'
  }
});
