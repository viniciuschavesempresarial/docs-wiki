import { Material, MaterialVersao } from '@shared/contracts';
import { MaterialRepository, MaterialFilters } from '../repositories/material.repository.js';
import { VersionRepository } from '../repositories/version.repository.js';
import { NotFoundError } from './gitLike.service.js';
import { RabbitMQEventPublisher } from '../queue/eventPublisher.js';
import {
  getCachedMaterialsList,
  setCachedMaterialsList,
  invalidateMaterialsCache
} from '../cache/materialCache.js';

export interface MaterialDetailResponse {
  material: Material;
  head_version: MaterialVersao | null;
}

export class MaterialService {
  public static invalidateListCache(): void {
    invalidateMaterialsCache();
  }

  /**
   * Obtém detalhes de um material pelo ID, incluindo a versão HEAD
   */
  public static async getById(id: string): Promise<MaterialDetailResponse> {
    const material = await MaterialRepository.findById(id);
    if (!material) {
      throw new NotFoundError(`Material com ID '${id}' não encontrado.`);
    }

    let headVersion: MaterialVersao | null = null;
    if (material.versao_head_id) {
      headVersion = await VersionRepository.findById(material.versao_head_id);
    }

    return {
      material,
      head_version: headVersion
    };
  }

  /**
   * Obtém detalhes de um material pelo Slug
   */
  public static async getBySlug(slug: string): Promise<MaterialDetailResponse> {
    const material = await MaterialRepository.findBySlug(slug);
    if (!material) {
      throw new NotFoundError(`Material com slug '${slug}' não encontrado.`);
    }

    let headVersion: MaterialVersao | null = null;
    if (material.versao_head_id) {
      headVersion = await VersionRepository.findById(material.versao_head_id);
    }

    return {
      material,
      head_version: headVersion
    };
  }

  /**
   * Lista materiais com paginação e filtros com cache em memória
   */
  public static async list(filters: MaterialFilters = {}): Promise<{ materials: Material[]; total: number }> {
    const cacheKey = JSON.stringify(filters);
    const cached = getCachedMaterialsList(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await MaterialRepository.findAll(filters);
    setCachedMaterialsList(cacheKey, result);
    return result;
  }

  /**
   * Retorna todo o histórico de versões de um material
   */
  public static async getVersions(materialId: string): Promise<MaterialVersao[]> {
    const material = await MaterialRepository.findById(materialId);
    if (!material) {
      throw new NotFoundError(`Material com ID '${materialId}' não encontrado.`);
    }

    return VersionRepository.findAllByMaterialId(materialId);
  }

  /**
   * Retorna uma versão específica por número
   */
  public static async getVersionByNum(materialId: string, versaoNum: number): Promise<MaterialVersao> {
    const material = await MaterialRepository.findById(materialId);
    if (!material) {
      throw new NotFoundError(`Material com ID '${materialId}' não encontrado.`);
    }

    const version = await VersionRepository.findByMaterialAndVersionNum(materialId, versaoNum);
    if (!version) {
      throw new NotFoundError(`Versão ${versaoNum} não encontrada para o material '${materialId}'.`);
    }

    return version;
  }

  /**
   * Remove um material e suas versões
   */
  public static async delete(id: string): Promise<boolean> {
    const material = await MaterialRepository.findById(id);
    if (!material) {
      throw new NotFoundError(`Material com ID '${id}' não encontrado.`);
    }

    const deleted = await MaterialRepository.delete(id);
    if (deleted) {
      MaterialService.invalidateListCache();
      RabbitMQEventPublisher.publishMaterialExcluido({
        event: 'material.excluido',
        material_id: id,
        timestamp: new Date().toISOString()
      }).catch((err) => {
        console.error('[RabbitMQ] Falha assíncrona ao publicar evento material.excluido:', err);
      });
    }

    return deleted;
  }

  /**
   * Remove múltiplos materiais e suas versões com CASCADE
   */
  public static async bulkDelete(ids: string[]): Promise<{ count: number; deletedIds: string[] }> {
    const result = await MaterialRepository.deleteMany(ids);
    MaterialService.invalidateListCache();
    for (const id of result.deletedIds) {
      RabbitMQEventPublisher.publishMaterialExcluido({
        event: 'material.excluido',
        material_id: id,
        timestamp: new Date().toISOString()
      }).catch((err) => {
        console.error('[RabbitMQ] Falha assíncrona ao publicar evento material.excluido:', err);
      });
    }
    return result;
  }
}
