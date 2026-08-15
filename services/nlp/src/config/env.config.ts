import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

const dbUser = process.env.SEARCH_DB_USER;
const dbPass = process.env.SEARCH_DB_PASSWORD;
const dbHost = process.env.POSTGRES_HOST;
const dbPort = process.env.POSTGRES_PORT;
const dbName = process.env.POSTGRES_DB;

const fallbackDbUrl =
  dbUser && dbPass && dbHost && dbPort && dbName
    ? `postgres://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}?schema=busca`
    : undefined;

const redisPass = process.env.REDIS_PASSWORD;
const redisHost = process.env.REDIS_HOST || 'redis';
const redisPort = process.env.REDIS_PORT || '6379';
const fallbackRedisUrl = redisPass ? `redis://:${redisPass}@${redisHost}:${redisPort}` : undefined;

const rmqUser = process.env.RABBITMQ_DEFAULT_USER;
const rmqPass = process.env.RABBITMQ_DEFAULT_PASS;
const rmqHost = process.env.RABBITMQ_HOST || 'rabbitmq';
const rmqPort = process.env.RABBITMQ_PORT || '5672';
const fallbackRmqUrl = rmqUser && rmqPass ? `amqp://${rmqUser}:${rmqPass}@${rmqHost}:${rmqPort}` : undefined;

const EnvSchema = z.object({
  // ── Configuração operacional (obrigatória via ambiente, sem fallbacks) ──
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  SENTENCE_TRANSFORMER_MODEL: z.string({ required_error: 'SENTENCE_TRANSFORMER_MODEL é obrigatório no .env' }),
  EMBEDDING_DIMENSIONS: z
    .string({ required_error: 'EMBEDDING_DIMENSIONS é obrigatório no .env' })
    .transform((val) => parseInt(val, 10)),
  REDIS_CACHE_TTL_SECONDS: z
    .string()
    .transform((val) => parseInt(val, 10))
    .optional(),

  // ── Credenciais e URLs com segredos (obrigatórias, sem fallback) ──
  DATABASE_URL: z.string().url().default(() => fallbackDbUrl ?? ''),
  REDIS_URL: z.string().default(() => fallbackRedisUrl ?? ''),
  RABBITMQ_URL: z.string().default(() => fallbackRmqUrl ?? '')
});

export type EnvConfig = z.infer<typeof EnvSchema>;

export function getEnvConfig(): EnvConfig {
  const result = EnvSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Variáveis de ambiente inválidas (nlp-service):', result.error.format());
    throw new Error('Configuração de ambiente inválida para o nlp-service');
  }
  return result.data;
}

export const env = getEnvConfig();
