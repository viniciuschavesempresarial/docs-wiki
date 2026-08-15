import { jest } from '@jest/globals';
import request from 'supertest';
import { app } from '../src/app.js';
import { searchRepository } from '../src/repositories/search.repository.js';
import { geminiClient } from '../src/gemini/gemini.client.js';
import { dbManager } from '../src/config/database.js';

describe('Search & Chat API Integration Tests (Supertest)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /health', () => {
    it('deve retornar status 200 quando o banco de dados estiver saudável', async () => {
      jest.spyOn(dbManager, 'checkDatabaseConnection').mockResolvedValue(true);

      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.service).toBe('search-service');
      expect(res.body.status).toBe('healthy');
      expect(res.body.dependencies.database).toBe('connected');
    });

    it('deve retornar status 503 quando o banco de dados estiver desconectado', async () => {
      jest.spyOn(dbManager, 'checkDatabaseConnection').mockResolvedValue(false);

      const res = await request(app).get('/health');
      expect(res.status).toBe(503);
      expect(res.body.service).toBe('search-service');
      expect(res.body.status).toBe('degraded');
      expect(res.body.dependencies.database).toBe('disconnected');
    });
  });

  describe('GET /search', () => {
    it('deve realizar busca e retornar lista de resultados estruturada', async () => {
      jest.spyOn(searchRepository, 'hybridSearch').mockResolvedValue({
        results: [
          {
            material_id: '00000000-0000-0000-0000-000000000001',
            titulo: 'Guia de Arquitetura',
            slug: 'guia-arquitetura',
            tags: ['node', 'postgres'],
            text_score: 0.7,
            vector_score: 0.8,
            hybrid_score: 0.77
          }
        ],
        total: 1
      });

      const res = await request(app).get('/search?q=arquitetura&limit=5&page=1');

      expect(res.status).toBe(200);
      expect(res.body.results).toHaveLength(1);
      expect(res.body.total).toBe(1);
      expect(res.body.results[0].titulo).toBe('Guia de Arquitetura');
    });

    it('deve retornar ai_summary quando summarize=true', async () => {
      jest.spyOn(searchRepository, 'hybridSearch').mockResolvedValue({
        results: [
          {
            material_id: '00000000-0000-0000-0000-000000000001',
            titulo: 'Guia de Arquitetura',
            slug: 'guia-arquitetura',
            tags: ['node'],
            text_score: 0.8,
            vector_score: 0.9,
            hybrid_score: 0.87
          }
        ],
        total: 1
      });

      jest
        .spyOn(searchRepository, 'getChunksForMaterial')
        .mockResolvedValue(['Trecho de teste para resumo']);

      jest
        .spyOn(geminiClient, 'summarizeSearchResults')
        .mockResolvedValue('Resumo automático da arquitetura.');

      const res = await request(app).get('/search?q=arquitetura&summarize=true');

      expect(res.status).toBe(200);
      expect(res.body.ai_summary).toBe('Resumo automático da arquitetura.');
    });
  });

  describe('POST /chat', () => {
    it('deve responder com sucesso para payload válido de chat RAG', async () => {
      jest.spyOn(searchRepository, 'getRelevantChunksForMaterials').mockResolvedValue([
        {
          material_id: '00000000-0000-0000-0000-000000000001',
          material_titulo: 'Guia de Arquitetura',
          chunk_index: 0,
          titulo_secao: 'Introdução',
          conteudo_chunk: 'Conteúdo relevante para o teste.',
          similarity: 0.95
        }
      ]);

      jest
        .spyOn(geminiClient, 'generateGroundedChatResponse')
        .mockResolvedValue('Esta é a resposta contextual aterrada.');

      const res = await request(app)
        .post('/chat')
        .send({
          query: 'Explique a introdução do guia',
          material_ids: ['00000000-0000-0000-0000-000000000001']
        });

      expect(res.status).toBe(200);
      expect(res.body.answer).toBe('Esta é a resposta contextual aterrada.');
      expect(res.body.sources).toHaveLength(1);
      expect(res.body.sources[0].similarity).toBe(0.95);
    });

    it('deve retornar 400 Bad Request para payload sem query ou sem material_ids', async () => {
      const res = await request(app)
        .post('/chat')
        .send({
          query: 'oi', // Menor que 3 caracteres
          material_ids: [] // Vazio
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Payload inválido');
    });
  });
});
