import { Redis } from 'ioredis';
import { env } from './env.config.js';

let isRedisConnected = false;

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 1,
  retryStrategy(times) {
    if (times > 3) {
      // Degradação graciosa: para de tentar agressivamente após 3 tentativas
      return null;
    }
    return Math.min(times * 200, 1000);
  },
  lazyConnect: true,
  enableOfflineQueue: false
});

redis.on('connect', () => {
  isRedisConnected = true;
  console.log('[REDIS:NLP] Conexão estabelecida com sucesso com o servidor Redis.');
});

redis.on('ready', () => {
  isRedisConnected = true;
});

redis.on('error', (err) => {
  isRedisConnected = false;
  console.warn('[REDIS:NLP] Aviso: Redis offline ou indisponível. Operando em modo de fallback (sem cache):', err.message);
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
  } catch (error) {
    isRedisConnected = false;
    console.warn('[REDIS:NLP] Falha inicial ao conectar ao Redis. O serviço continuará em modo de degradação graciosa.');
  }
}
