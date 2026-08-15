import { Redis } from 'ioredis';
import { env } from './env.config.js';

let isRedisConnected = false;

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 1,
  retryStrategy(times) {
    if (times > 3) return null;
    return Math.min(times * 200, 1000);
  },
  lazyConnect: true,
  enableOfflineQueue: false
});

redis.on('connect', () => {
  isRedisConnected = true;
  console.log('[REDIS:SEARCH] Conexão com Redis estabelecida com sucesso.');
});

redis.on('ready', () => {
  isRedisConnected = true;
});

redis.on('error', (err) => {
  isRedisConnected = false;
  console.warn('[REDIS:SEARCH] Aviso: Redis indisponível. Operando sem cache de busca:', err.message);
});

redis.on('close', () => {
  isRedisConnected = false;
});

export function getIsRedisConnected(): boolean {
  return isRedisConnected;
}

export async function connectRedis(): Promise<void> {
  try {
    await redis.connect();
  } catch {
    isRedisConnected = false;
    console.warn('[REDIS:SEARCH] Redis offline. Continuando com inferência direta.');
  }
}
