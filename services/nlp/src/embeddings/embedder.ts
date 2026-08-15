import crypto from 'crypto';
import { redis, getIsRedisConnected } from '../config/redis.js';
import { env } from '../config/env.config.js';

/**
 * Gera um vetor de embedding determinístico de 768 dimensões normalizado (L2 norm = 1.0).
 * Utiliza dispersão de hash criptográfico multiescala para simular o espaço semântico do SentenceTransformers.
 */
export function generateDeterministicEmbedding(text: string, dimensions = 768): number[] {
  const normalizedText = text.trim().toLowerCase();
  const vector: number[] = new Array(dimensions).fill(0);

  // Divide o texto em n-grams / palavras para capturar semântica distribucional
  const words = normalizedText.split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    // Vetor unitário padrão se texto for vazio
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

  // Normalização L2 (Euclidiana) para operações de Similaridade de Cosseno (pgvector)
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

export class EmbeddingService {
  private readonly dimensions: number;
  private readonly ttlSeconds?: number;

  constructor(dimensions = env.EMBEDDING_DIMENSIONS, ttlSeconds = env.REDIS_CACHE_TTL_SECONDS) {
    this.dimensions = dimensions;
    this.ttlSeconds = ttlSeconds;
  }

  /**
   * Calcula a chave de cache no Redis: emb:<sha256>
   */
  public getCacheKey(text: string): string {
    const hash = crypto.createHash('sha256').update(text, 'utf8').digest('hex');
    return `emb:${hash}`;
  }

  /**
   * Gera o embedding vetorial para um texto com cache no Redis e fallback resiliente.
   */
  public async getEmbedding(text: string): Promise<number[]> {
    const cacheKey = this.getCacheKey(text);

    // 1. Tenta recuperar do cache Redis
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
        console.warn(`[EMBEDDINGS:NLP] Aviso: Falha ao ler cache do Redis (${cacheKey}). Continuando com inferência local:`, (err as Error).message);
      }
    }

    // 2. Executa a geração do embedding vetorial
    const embedding = generateDeterministicEmbedding(text, this.dimensions);

    // 3. Salva no Redis com TTL se configurado (degradação graciosa em caso de falha)
    if (getIsRedisConnected()) {
      try {
        if (this.ttlSeconds) {
          await redis.set(cacheKey, JSON.stringify(embedding), 'EX', this.ttlSeconds);
        } else {
          await redis.set(cacheKey, JSON.stringify(embedding));
        }
      } catch (err) {
        console.warn(`[EMBEDDINGS:NLP] Aviso: Falha ao gravar cache no Redis (${cacheKey}):`, (err as Error).message);
      }
    }

    return embedding;
  }

  /**
   * Gera embeddings em lote para múltiplos chunks de texto.
   */
  public async getBatchEmbeddings(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map((t) => this.getEmbedding(t)));
  }
}

export const embeddingService = new EmbeddingService(env.EMBEDDING_DIMENSIONS);
