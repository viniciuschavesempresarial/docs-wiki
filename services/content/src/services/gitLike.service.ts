import { pool } from '../config/database.js';
import { Material, MaterialVersao, calculateSHA256 } from '@shared/contracts';
import { parseOKF } from '../parser/okfParser.js';
import { MaterialRepository } from '../repositories/material.repository.js';
import { VersionRepository } from '../repositories/version.repository.js';
import { RabbitMQEventPublisher } from '../queue/eventPublisher.js';

export class NotFoundError extends Error {
  public statusCode = 404;
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class VersionConflictError extends Error {
  public statusCode = 409;
  constructor(message: string) {
    super(message);
    this.name = 'VersionConflictError';
  }
}

export class BadRequestError extends Error {
  public statusCode = 400;
  constructor(message: string) {
    super(message);
    this.name = 'BadRequestError';
  }
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function resolveAuthorId(authorId?: string, fallback = '00000000-0000-0000-0000-000000000001'): string {
  if (authorId && UUID_REGEX.test(authorId)) {
    return authorId;
  }
  if (fallback && UUID_REGEX.test(fallback)) {
    return fallback;
  }
  return '00000000-0000-0000-0000-000000000001';
}

export class GitLikeService {
  /**
   * POST /materials: Cria um novo material e insere o primeiro commit (versão 1)
   */
  public static async createMaterial(
    conteudoOkf: string,
    commitMessage: string,
    autorIdFallback: string
  ): Promise<{ material: Material; version: MaterialVersao }> {
    const { frontmatter } = parseOKF(conteudoOkf);
    const hashSha256 = calculateSHA256(conteudoOkf);

    const existing = await MaterialRepository.findBySlug(frontmatter.slug);
    if (existing) {
      throw new BadRequestError(`Já existe um material cadastrado com o slug '${frontmatter.slug}'.`);
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const material = await MaterialRepository.create(
        {
          slug: frontmatter.slug,
          tipo: frontmatter.type,
          categoria: frontmatter.category,
          status: 'published',
          versao_head_id: null
        },
        client
      );

      const autorId = resolveAuthorId(frontmatter.author_id, autorIdFallback);

      const version = await VersionRepository.create(
        {
          material_id: material.id,
          versao_num: 1,
          parent_version_id: null,
          conteudo_okf: conteudoOkf,
          conteudo_jsonb: frontmatter,
          commit_message: commitMessage,
          autor_id: autorId,
          hash_sha256: hashSha256
        },
        client
      );

      const updatedMaterial = await MaterialRepository.updateHead(
        material.id,
        version.id,
        {
          tipo: frontmatter.type,
          categoria: frontmatter.category,
          status: 'published'
        },
        client
      );

      await client.query('COMMIT');

      // Publicação assíncrona do evento no RabbitMQ
      await RabbitMQEventPublisher.publishMaterialCriado({
        event: 'material.criado',
        material_id: material.id,
        versao_num: 1,
        slug: frontmatter.slug,
        titulo: frontmatter.title,
        autor: frontmatter.author,
        autor_id: autorId,
        categoria: frontmatter.category,
        tipo: frontmatter.type,
        tags: frontmatter.tags || [],
        conteudo_okf: conteudoOkf,
        timestamp: new Date().toISOString()
      });

      return {
        material: updatedMaterial || material,
        version
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * POST /materials/:id/versions: Cria uma nova versão com controle de concorrência otimista
   */
  public static async commitVersion(
    materialId: string,
    conteudoOkf: string,
    commitMessage: string,
    parentVersionId: string,
    autorIdFallback: string
  ): Promise<{ material: Material; version: MaterialVersao }> {
    const { frontmatter } = parseOKF(conteudoOkf);
    const hashSha256 = calculateSHA256(conteudoOkf);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const material = await MaterialRepository.findByIdForUpdate(materialId, client);
      if (!material) {
        throw new NotFoundError(`Material com ID '${materialId}' não encontrado.`);
      }

      // Controle de concorrência otimista
      if (material.versao_head_id !== parentVersionId) {
        throw new VersionConflictError(
          `Conflito de versão: o parent_version_id fornecido ('${parentVersionId}') não corresponde à versão HEAD atual ('${material.versao_head_id}').`
        );
      }

      const currentMaxVer = await VersionRepository.getLatestVersionNum(materialId, client);
      const nextVerNum = currentMaxVer + 1;
      const autorId = resolveAuthorId(frontmatter.author_id, autorIdFallback);

      const newVersion = await VersionRepository.create(
        {
          material_id: materialId,
          versao_num: nextVerNum,
          parent_version_id: parentVersionId,
          conteudo_okf: conteudoOkf,
          conteudo_jsonb: frontmatter,
          commit_message: commitMessage,
          autor_id: autorId,
          hash_sha256: hashSha256
        },
        client
      );

      const updatedMaterial = await MaterialRepository.updateHead(
        materialId,
        newVersion.id,
        {
          tipo: frontmatter.type,
          categoria: frontmatter.category
        },
        client
      );

      await client.query('COMMIT');

      // Publicação do evento material.atualizado
      await RabbitMQEventPublisher.publishMaterialAtualizado({
        event: 'material.atualizado',
        material_id: materialId,
        versao_num: nextVerNum,
        slug: frontmatter.slug,
        titulo: frontmatter.title,
        autor: frontmatter.author,
        autor_id: autorId,
        categoria: frontmatter.category,
        tipo: frontmatter.type,
        tags: frontmatter.tags || [],
        conteudo_okf: conteudoOkf,
        timestamp: new Date().toISOString()
      });

      return {
        material: updatedMaterial || material,
        version: newVersion
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * POST /materials/:id/rollback: Realiza rollback seguro criando uma nova versão com o conteúdo alvo
   */
  public static async rollback(
    materialId: string,
    targetVersionNum: number,
    commitMessage: string,
    autorIdFallback: string
  ): Promise<{ material: Material; version: MaterialVersao }> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const material = await MaterialRepository.findByIdForUpdate(materialId, client);
      if (!material) {
        throw new NotFoundError(`Material com ID '${materialId}' não encontrado.`);
      }

      const targetVersion = await VersionRepository.findByMaterialAndVersionNum(
        materialId,
        targetVersionNum,
        client
      );
      if (!targetVersion) {
        throw new NotFoundError(
          `Versão ${targetVersionNum} não encontrada para o material '${materialId}'.`
        );
      }

      const { frontmatter } = parseOKF(targetVersion.conteudo_okf);
      const currentMaxVer = await VersionRepository.getLatestVersionNum(materialId, client);
      const nextVerNum = currentMaxVer + 1;
      const hashSha256 = calculateSHA256(targetVersion.conteudo_okf);

      const rollbackCommitMessage =
        commitMessage || `Rollback para a versão ${targetVersionNum}`;

      const newVersion = await VersionRepository.create(
        {
          material_id: materialId,
          versao_num: nextVerNum,
          parent_version_id: material.versao_head_id,
          conteudo_okf: targetVersion.conteudo_okf,
          conteudo_jsonb: frontmatter,
          commit_message: rollbackCommitMessage,
          autor_id: autorIdFallback || targetVersion.autor_id,
          hash_sha256: hashSha256
        },
        client
      );

      const updatedMaterial = await MaterialRepository.updateHead(
        materialId,
        newVersion.id,
        {
          tipo: frontmatter.type,
          categoria: frontmatter.category
        },
        client
      );

      await client.query('COMMIT');

      // Publicação do evento material.atualizado
      await RabbitMQEventPublisher.publishMaterialAtualizado({
        event: 'material.atualizado',
        material_id: materialId,
        versao_num: nextVerNum,
        slug: frontmatter.slug,
        titulo: frontmatter.title,
        autor: frontmatter.author,
        autor_id: newVersion.autor_id,
        categoria: frontmatter.category,
        tipo: frontmatter.type,
        tags: frontmatter.tags || [],
        conteudo_okf: targetVersion.conteudo_okf,
        timestamp: new Date().toISOString()
      });

      return {
        material: updatedMaterial || material,
        version: newVersion
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}
