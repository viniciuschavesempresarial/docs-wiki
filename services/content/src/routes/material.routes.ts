import { Router } from 'express';
import { authMiddleware, requirePermission } from '@shared/contracts';
import { config } from '../config/env.js';
import { MaterialController } from '../controllers/material.controller.js';

const router = Router();
const auth = authMiddleware(config.jwtSecret);

/**
 * @openapi
 * /materials:
 *   post:
 *     summary: Cria um novo material e insere o primeiro commit (versão 1)
 *     tags: [Materiais]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMaterialDTO'
 *     responses:
 *       201:
 *         description: Material criado com sucesso
 *       400:
 *         description: Erro de validação no Frontmatter ou dados inválidos
 *       401:
 *         description: Não autorizado
 */
router.post('/materials', auth, requirePermission('materials:create'), MaterialController.create);

/**
 * @openapi
 * /materials:
 *   get:
 *     summary: Lista materiais com filtros e paginação
 *     tags: [Materiais]
 *     parameters:
 *       - in: query
 *         name: tipo
 *         schema: { type: string }
 *       - in: query
 *         name: categoria
 *         schema: { type: string }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0 }
 *     responses:
 *       200:
 *         description: Lista de materiais retornada com sucesso
 */
router.get('/materials', MaterialController.list);

/**
 * @openapi
 * /materials/{id}:
 *   get:
 *     summary: Obtém os dados de um material e sua versão HEAD atual
 *     tags: [Materiais]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Detalhes do material
 *       404:
 *         description: Material não encontrado
 */
router.get('/materials/:id', MaterialController.getById);

/**
 * @openapi
 * /materials/{id}/versions:
 *   get:
 *     summary: Retorna o histórico completo de versões do material
 *     tags: [Versões]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Lista de versões ordenada descendentemente
 */
router.get('/materials/:id/versions', MaterialController.getVersions);

/**
 * @openapi
 * /materials/{id}/versions/{versao_num}:
 *   get:
 *     summary: Retorna uma versão específica do material
 *     tags: [Versões]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: versao_num
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Detalhes da versão
 *       404:
 *         description: Versão não encontrada
 */
router.get('/materials/:id/versions/:versao_num', MaterialController.getVersionByNum);

/**
 * @openapi
 * /materials/{id}/versions:
 *   post:
 *     summary: Cria uma nova versão incremental com controle de concorrência
 *     tags: [Versões]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CommitVersionDTO'
 *     responses:
 *       201:
 *         description: Nova versão comitada com sucesso
 *       409:
 *         description: Conflito de concorrência (parent_version_id incompatível com HEAD)
 */
router.post('/materials/:id/versions', auth, requirePermission('materials:edit'), MaterialController.commitVersion);

/**
 * @openapi
 * /materials/{id}/rollback:
 *   post:
 *     summary: Realiza rollback seguro gerando uma nova versão subsequente
 *     tags: [Versões]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RollbackDTO'
 *     responses:
 *       201:
 *         description: Rollback executado gerando nova versão
 *       404:
 *         description: Versão alvo ou material não encontrado
 */
router.post('/materials/:id/rollback', auth, requirePermission('materials:rollback'), MaterialController.rollback);

/**
 * @openapi
 * /materials/{id}/diff:
 *   get:
 *     summary: Calcula a comparação linha a linha estruturada entre duas versões
 *     tags: [Versões]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: v1
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: v2
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Estrutura JSON com mudanças linha a linha (added, removed, unchanged)
 */
router.get('/materials/:id/diff', MaterialController.getDiff);

/**
 * @openapi
 * /materials/{id}:
 *   delete:
 *     summary: Remove um material
 *     tags: [Materiais]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Material removido com sucesso
 */
router.delete('/materials/:id', auth, requirePermission('materials:delete'), MaterialController.delete);

export { router as materialRoutes };
