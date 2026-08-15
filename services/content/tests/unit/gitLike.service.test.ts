import { calculateSHA256 } from '@shared/contracts';
import {
  GitLikeService,
  VersionConflictError,
  NotFoundError,
  BadRequestError
} from '../../src/services/gitLike.service.js';
import { MaterialRepository } from '../../src/repositories/material.repository.js';
import { VersionRepository } from '../../src/repositories/version.repository.js';
import { RabbitMQEventPublisher } from '../../src/queue/eventPublisher.js';

jest.mock('../../src/config/database.js', () => {
  const mClient = {
    query: jest.fn().mockResolvedValue({ rows: [] }),
    release: jest.fn()
  };
  return {
    pool: {
      connect: jest.fn().mockResolvedValue(mClient),
      query: jest.fn()
    }
  };
});

jest.mock('../../src/queue/eventPublisher.js', () => ({
  RabbitMQEventPublisher: {
    publishMaterialCriado: jest.fn().mockResolvedValue(true),
    publishMaterialAtualizado: jest.fn().mockResolvedValue(true)
  }
}));

describe('GitLikeService (Unit)', () => {
  const validOKF = `---
title: "Documento Git-Like"
slug: "doc-git-like"
type: "artigo"
category: "engenharia"
tags: ["git", "versionamento"]
author: "Engenheiro"
author_id: "00000000-0000-0000-0000-000000000001"
---
# Conteudo da versao 1
`;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve calcular SHA-256 de forma determinística', () => {
    const hash1 = calculateSHA256(validOKF);
    const hash2 = calculateSHA256(validOKF);
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
  });

  it('deve criar um material e o commit inicial (versão 1)', async () => {
    jest.spyOn(MaterialRepository, 'findBySlug').mockResolvedValue(null);
    jest.spyOn(MaterialRepository, 'create').mockResolvedValue({
      id: 'mat-uuid-1',
      slug: 'doc-git-like',
      tipo: 'artigo',
      categoria: 'engenharia',
      status: 'published',
      versao_head_id: null,
      created_at: new Date(),
      updated_at: new Date()
    });

    jest.spyOn(VersionRepository, 'create').mockResolvedValue({
      id: 'ver-uuid-1',
      material_id: 'mat-uuid-1',
      versao_num: 1,
      parent_version_id: null,
      conteudo_okf: validOKF,
      conteudo_jsonb: {} as any,
      commit_message: 'Commit inicial',
      autor_id: '00000000-0000-0000-0000-000000000001',
      hash_sha256: calculateSHA256(validOKF),
      created_at: new Date()
    });

    jest.spyOn(MaterialRepository, 'updateHead').mockResolvedValue({
      id: 'mat-uuid-1',
      slug: 'doc-git-like',
      tipo: 'artigo',
      categoria: 'engenharia',
      status: 'published',
      versao_head_id: 'ver-uuid-1',
      created_at: new Date(),
      updated_at: new Date()
    });

    const result = await GitLikeService.createMaterial(
      validOKF,
      'Commit inicial',
      '00000000-0000-0000-0000-000000000001'
    );

    expect(result.material.id).toBe('mat-uuid-1');
    expect(result.material.versao_head_id).toBe('ver-uuid-1');
    expect(result.version.versao_num).toBe(1);
    expect(RabbitMQEventPublisher.publishMaterialCriado).toHaveBeenCalledTimes(1);
  });

  it('deve lançar erro se o slug já existir', async () => {
    jest.spyOn(MaterialRepository, 'findBySlug').mockResolvedValue({
      id: 'existing-mat',
      slug: 'doc-git-like'
    } as any);

    await expect(
      GitLikeService.createMaterial(validOKF, 'Commit', '00000000-0000-0000-0000-000000000001')
    ).rejects.toThrow(BadRequestError);
  });

  it('deve lançar VersionConflictError (409) quando o parent_version_id for incompatível', async () => {
    jest.spyOn(MaterialRepository, 'findByIdForUpdate').mockResolvedValue({
      id: 'mat-uuid-1',
      slug: 'doc-git-like',
      versao_head_id: 'ver-uuid-head-atual'
    } as any);

    await expect(
      GitLikeService.commitVersion(
        'mat-uuid-1',
        validOKF,
        'Novo commit',
        'ver-uuid-desatualizado',
        '00000000-0000-0000-0000-000000000001'
      )
    ).rejects.toThrow(VersionConflictError);
  });

  it('deve lançar NotFoundError ao tentar rollback de versão inexistente', async () => {
    jest.spyOn(MaterialRepository, 'findByIdForUpdate').mockResolvedValue({
      id: 'mat-uuid-1',
      versao_head_id: 'ver-uuid-head'
    } as any);

    jest.spyOn(VersionRepository, 'findByMaterialAndVersionNum').mockResolvedValue(null);

    await expect(
      GitLikeService.rollback('mat-uuid-1', 999, 'Rollback invalido', 'user-1')
    ).rejects.toThrow(NotFoundError);
  });
});
