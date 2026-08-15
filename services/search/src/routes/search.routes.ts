import { Router } from 'express';
import { searchHandler } from '../controllers/search.controller.js';
import { chatHandler } from '../controllers/chat.controller.js';

export const searchRouter = Router();

/**
 * @openapi
 * /search:
 *   get:
 *     summary: Busca Híbrida Ponderada com Filtros e Sumarização Opcional por IA
 *     description: Combina pontuação textual BM25 (0.3) e similaridade vetorial por cosseno (0.7).
 *     tags:
 *       - Busca
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Termo de pesquisa livre
 *       - in: query
 *         name: autor
 *         schema:
 *           type: string
 *         description: Filtrar por nome do autor
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *         description: Filtrar por categoria
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *         description: Filtrar por tipo de material
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Filtrar por tag específica
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial de publicação
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final de publicação
 *       - in: query
 *         name: fuzzy
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *         description: Ativar busca por similaridade trigram/Levenshtein (pg_trgm)
 *       - in: query
 *         name: summarize
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *         description: Ativar sumarização sintética dos resultados via Gemini API
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Itens por página
 *     responses:
 *       200:
 *         description: Resultados da busca híbrida
 *       400:
 *         description: Parâmetros de consulta inválidos
 */
searchRouter.get('/', searchHandler);
searchRouter.get('/search', searchHandler);

/**
 * @openapi
 * /chat:
 *   post:
 *     summary: Chat RAG Contextual Aterrado (Grounding)
 *     description: Permite fazer perguntas sobre um ou mais documentos selecionados usando a Gemini API.
 *     tags:
 *       - RAG & Chat
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *               - material_ids
 *             properties:
 *               query:
 *                 type: string
 *                 example: "Como é calculado o hash das versões e qual a garantia de integridade?"
 *               material_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 example: ["00000000-0000-0000-0000-000000000001"]
 *     responses:
 *       200:
 *         description: Resposta gerada pela IA com fontes e citações
 *       400:
 *         description: Payload inválido
 *       500:
 *         description: Erro na geração da resposta
 */
searchRouter.post('/chat', chatHandler);
