import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Carrega variáveis de ambiente do arquivo .env raiz ou local
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().optional().default(3002),
  DATABASE_URL: z.string().url().optional(),
  RABBITMQ_URL: z.string().optional(),
  JWT_SECRET: z
    .string({ required_error: 'JWT_SECRET é obrigatório no .env' })
    .min(16, 'JWT_SECRET deve ter no mínimo 16 caracteres')
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Variáveis de ambiente inválidas (content-service):', _env.error.format());
  throw new Error('Configuração de ambiente inválida para o content-service');
}

const dbUser = process.env.CONTENT_DB_USER;
const dbPass = process.env.CONTENT_DB_PASSWORD;
const dbHost = process.env.POSTGRES_HOST;
const dbPort = process.env.POSTGRES_PORT;
const dbName = process.env.POSTGRES_DB;

const rmqUser = process.env.RABBITMQ_DEFAULT_USER;
const rmqPass = process.env.RABBITMQ_DEFAULT_PASS;
const rmqHost = process.env.RABBITMQ_HOST || 'rabbitmq';
const rmqPort = process.env.RABBITMQ_PORT || '5672';

const databaseUrl =
  _env.data.DATABASE_URL ||
  (dbUser && dbPass && dbName && dbHost && dbPort
    ? `postgres://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}?schema=conteudo`
    : '');

const rabbitmqUrl =
  _env.data.RABBITMQ_URL ||
  (rmqUser && rmqPass
    ? `amqp://${rmqUser}:${rmqPass}@${rmqHost}:${rmqPort}`
    : '');

export interface Config {
  port: number;
  nodeEnv: string;
  databaseUrl: string;
  rabbitmqUrl: string;
  jwtSecret: string;
}

export const config: Config = {
  port: _env.data.PORT,
  nodeEnv: _env.data.NODE_ENV,
  databaseUrl,
  rabbitmqUrl,
  jwtSecret: _env.data.JWT_SECRET
};
