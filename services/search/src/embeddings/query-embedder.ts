import crypto from 'crypto';
import { redis, getIsRedisConnected } from '../config/redis.js';
import { env } from '../config/env.config.js';

/**
 * Gera um vetor de embedding determinístico de 768 dimensões normalizado (L2 norm = 1.0)
 * para a query de busca, alinhado com o espaço semântico gerado pelo worker de NLP.
 */
export function generateDeterministicQueryEmbedding(text: string, dimensions = 768): number[] {
  const normalizedText = text.trim().toLowerCase();
  const vector: number[] = new Array(dimensions).fill(0);

  const words = normalizedText.split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    vector[0] = 1.0;
    return vector;
  }

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const hash = crypto.createHash('sha256').update(`${word}:${i % 16}`).digest();

    for (let d = 0; d < dimensions; d++) {
      const byteVal = hash[d % hash.length];
      const sign = (byteVal & 1) === 0 ? 1 : -1;
      const magnitude = (byteVal / 255.0) * Math.cos((d * Math.PI) / 180 + i);
      vector[d] += sign * magnitude;
    }
  }

  let norm = 0;
  for (let d = 0; d < dimensions; d++) {
    norm += vector[d] * vector[d];
  }
  norm = Math.sqrt(norm);

  if (norm > 0) {
    for (let d = 0; d < dimensions; d++) {
      vector[d] = parseFloat((vector[d] / norm).toFixed(6));
    }
  } else {
    vector[0] = 1.0;
  }

  return vector;
}

export class QueryEmbedderService {
  private readonly dimensions: number;
  private readonly ttlSeconds?: number;

  constructor(dimensions = env.EMBEDDING_DIMENSIONS, ttlSeconds = env.REDIS_CACHE_TTL_SECONDS) {
    this.dimensions = dimensions;
    this.ttlSeconds = ttlSeconds;
  }

  public getCacheKey(text: string): string {
    const hash = crypto.createHash('sha256').update(text, 'utf8').digest('hex');
    return `emb:${hash}`;
  }

  public async getEmbedding(query: string): Promise<number[]> {
    const cacheKey = this.getCacheKey(query);

    if (getIsRedisConnected()) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length === this.dimensions) {
            return parsed;
          }
        }
      } catch (err) {
        console.warn(`[QUERY_EMBEDDER] Falha ao ler cache (${cacheKey}):`, (err as Error).message);
      }
    }

    const embedding = generateDeterministicQueryEmbedding(query, this.dimensions);

    if (getIsRedisConnected()) {
      try {
        if (this.ttlSeconds) {
          await redis.set(cacheKey, JSON.stringify(embedding), 'EX', this.ttlSeconds);
        } else {
          await redis.set(cacheKey, JSON.stringify(embedding));
        }
      } catch (err) {
        console.warn(`[QUERY_EMBEDDER] Falha ao gravar cache (${cacheKey}):`, (err as Error).message);
      }
    }

    return embedding;
  }
}

export const queryEmbedderService = new QueryEmbedderService();
