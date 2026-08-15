import { Request, Response, NextFunction } from 'express';
import {
  CreateMaterialDTOSchema,
  CommitVersionDTOSchema,
  RollbackDTOSchema
} from '@shared/contracts';
import { GitLikeService } from '../services/gitLike.service.js';
import { MaterialService } from '../services/material.service.js';
import { DiffService } from '../services/diff.service.js';

export class MaterialController {
  /**
   * POST /materials: Cria um novo material e seu commit inicial
   */
  public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsedBody = CreateMaterialDTOSchema.parse(req.body);
      const userIdFallback = req.user?.sub || '00000000-0000-0000-0000-000000000001';

      const result = await GitLikeService.createMaterial(
        parsedBody.conteudo_okf,
        parsedBody.commit_message,
        userIdFallback
      );

      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /materials: Lista materiais com paginação e filtros
   */
  public static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tipo, categoria, status, search, limit, offset } = req.query;

      const filters = {
        tipo: tipo as string | undefined,
        categoria: categoria as string | undefined,
        status: status as string | undefined,
        search: search as string | undefined,
        limit: limit ? parseInt(limit as string, 10) : 20,
        offset: offset ? parseInt(offset as string, 10) : 0
      };

      const result = await MaterialService.list(filters);
      res.status(200).json({
        ...result,
        limit: filters.limit,
        offset: filters.offset
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /materials/:id: Obtém detalhes de um material pelo ID
   */
  public static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await MaterialService.getById(id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /materials/:id/versions: Retorna o histórico de versões de um material
   */
  public static async getVersions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const versions = await MaterialService.getVersions(id);
      res.status(200).json({ material_id: id, versions });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /materials/:id/versions/:versao_num: Retorna uma versão específica
   */
  public static async getVersionByNum(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, versao_num } = req.params;
      const versionNum = parseInt(versao_num, 10);
      const version = await MaterialService.getVersionByNum(id, versionNum);
      res.status(200).json(version);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /materials/:id/versions: Cria uma nova versão com optimistic locking
   */
  public static async commitVersion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const parsedBody = CommitVersionDTOSchema.parse(req.body);
      const userIdFallback = req.user?.sub || '00000000-0000-0000-0000-000000000001';

      const result = await GitLikeService.commitVersion(
        id,
        parsedBody.conteudo_okf,
        parsedBody.commit_message,
        parsedBody.parent_version_id,
        userIdFallback
      );

      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /materials/:id/rollback: Realiza rollback para uma versão anterior
   */
  public static async rollback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const parsedBody = RollbackDTOSchema.parse(req.body);
      const userIdFallback = req.user?.sub || '00000000-0000-0000-0000-000000000001';

      const result = await GitLikeService.rollback(
        id,
        parsedBody.target_version_num,
        parsedBody.commit_message,
        userIdFallback
      );

      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /materials/:id/diff: Calcula o diff estruturado entre duas versões
   */
  public static async getDiff(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { v1, v2 } = req.query;

      const v1Num = parseInt(v1 as string, 10);
      const v2Num = parseInt(v2 as string, 10);

      const diff = await DiffService.getDiff(id, v1Num, v2Num);
      res.status(200).json(diff);
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /materials/:id: Remove um material
   */
  public static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await MaterialService.delete(id);
      res.status(200).json({ message: 'Material removido com sucesso.' });
    } catch (err) {
      next(err);
    }
  }
}
