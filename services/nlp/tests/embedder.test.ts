import {
  generateDeterministicEmbedding,
  EmbeddingService
} from '../src/embeddings/embedder.js';

describe('EmbeddingService & Geração Local 768d', () => {
  it('deve gerar vetor determinístico exatamente com 768 dimensões', () => {
    const text = 'Arquitetura de microsserviços com busca híbrida';
    const embedding = generateDeterministicEmbedding(text, 768);

    expect(Array.isArray(embedding)).toBe(true);
    expect(embedding.length).toBe(768);
  });

  it('deve produzir o mesmo vetor para o mesmo texto de entrada (determinismo)', () => {
    const text = 'Autenticação segura via cookies HttpOnly com JWT';
    const emb1 = generateDeterministicEmbedding(text, 768);
    const emb2 = generateDeterministicEmbedding(text, 768);

    expect(emb1).toEqual(emb2);
  });

  it('deve produzir vetores normalizados com norma L2 próxima de 1.0', () => {
    const text = 'PostgreSQL pgvector com índice HNSW e distância de cosseno';
    const embedding = generateDeterministicEmbedding(text, 768);

    const norm = Math.sqrt(embedding.reduce((acc, val) => acc + val * val, 0));
    expect(norm).toBeGreaterThanOrEqual(0.99);
    expect(norm).toBeLessThanOrEqual(1.01);
  });

  it('deve calcular a chave de cache correta com prefixo emb:', () => {
    const service = new EmbeddingService(768, 3600);
    const cacheKey = service.getCacheKey('texto de teste');
    expect(cacheKey).toMatch(/^emb:[a-f0-9]{64}$/);
  });

  it('deve funcionar perfeitamente em modo de fallback quando o Redis está offline', async () => {
    const service = new EmbeddingService(768, 3600);

    // Mesmo sem Redis ativo, deve gerar a inferência local sem lançar exceção
    const embedding = await service.getEmbedding('Texto gerado offline');
    expect(embedding).toBeDefined();
    expect(embedding.length).toBe(768);
  });
});
