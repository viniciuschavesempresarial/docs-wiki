import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

// Carrega .env do root do projeto se existir
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

const envSchema = z.object({
  // ── Configuração operacional (obrigatória via ambiente, sem fallbacks) ──
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().optional().default(3001),
  POSTGRES_HOST: z.string({ required_error: 'POSTGRES_HOST é obrigatório no .env' }),
  POSTGRES_PORT: z.coerce.number({ required_error: 'POSTGRES_PORT é obrigatório no .env' }),
  POSTGRES_DB: z.string({ required_error: 'POSTGRES_DB é obrigatório no .env' }),
  JWT_EXPIRATION: z.string({ required_error: 'JWT_EXPIRATION é obrigatório no .env' }),
  CORS_ORIGIN: z.string().optional(),

  // ── Segredos e credenciais (obrigatórios, sem fallback) ──
  IAM_DB_USER: z.string({ required_error: 'IAM_DB_USER é obrigatório no .env' }),
  IAM_DB_PASSWORD: z.string({ required_error: 'IAM_DB_PASSWORD é obrigatório no .env' }),
  JWT_SECRET: z
    .string({ required_error: 'JWT_SECRET é obrigatório no .env' })
    .min(16, 'JWT_SECRET deve ter no mínimo 16 caracteres'),
  COOKIE_SECRET: z.string({ required_error: 'COOKIE_SECRET é obrigatório no .env' })
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Variáveis de ambiente inválidas (iam-service):', _env.error.format());
  throw new Error('Configuração de ambiente inválida para o iam-service');
}

export const env = _env.data;
