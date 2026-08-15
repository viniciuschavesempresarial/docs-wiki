import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../../src/app.js';
import { config } from '../../src/config/env.js';
import { MaterialRepository } from '../../src/repositories/material.repository.js';
import { VersionRepository } from '../../src/repositories/version.repository.js';
import { UserPayload, calculateSHA256 } from '@shared/contracts';

jest.mock('../../src/config/database.js', () => {
  const mClient = {
    query: jest.fn().mockResolvedValue({ rows: [] }),
    release: jest.fn()
  };
  return {
    pool: {
      connect: jest.fn().mockResolvedValue(mClient),
      query: jest.fn().mockResolvedValue({ rows: [] })
    },
    checkDatabaseConnection: jest.fn().mockResolvedValue(true),
    closeDatabase: jest.fn().mockResolvedValue(undefined)
  };
});

jest.mock('../../src/queue/eventPublisher.js', () => ({
  RabbitMQEventPublisher: {
    publishMaterialCriado: jest.fn().mockResolvedValue(true),
    publishMaterialAtualizado: jest.fn().mockResolvedValue(true)
  }
}));

describe('Material Routes (Integration - Supertest)', () => {
  const mockAdminUser: UserPayload = {
    sub: '00000000-0000-0000-0000-000000000001',
    email: 'admin@docswiki.local',
    roles: ['ADMIN'],
    permissions: [
      'materials:create',
      'materials:edit',
      'materials:rollback',
      'materials:delete'
    ]
  };

  const adminToken = jwt.sign(mockAdminUser, config.jwtSecret, { expiresIn: '1h' });
  const authCookie = `token=${adminToken}`;

  const validOKF_v1 = `---
title: "Guia de Arquitetura de Software"
slug: "guia-arquitetura-software"
type: "artigo"
category: "engenharia"
tags: ["node", "postgres"]
author: "Admin User"
author_id: "00000000-0000-0000-0000-000000000001"
---
# Introdução aos Padrões Arquiteturais
Conteúdo da versão 1.
`;

  const validOKF_v2 = `---
title: "Guia de Arquitetura de Software - Revisado"
slug: "guia-arquitetura-software"
type: "artigo"
category: "engenharia"
tags: ["node", "postgres", "microservices"]
author: "Admin User"
author_id: "00000000-0000-0000-0000-000000000001"
---
# Introdução aos Padrões Arquiteturais
Conteúdo da versão 2 atualizado.
`;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /health', () => {
    it('deve retornar status 200 e informações do serviço', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.service).toBe('content-service');
      expect(res.body.status).toBe('ok');
    });
  });

  describe('POST /materials', () => {
    it('deve retornar 401 se não estiver autenticado', async () => {
      const res = await request(app)
        .post('/materials')
        .send({
          conteudo_okf: validOKF_v1,
          commit_message: 'Commit inicial'
        });

      expect(res.status).toBe(401);
    });

    it('deve criar um material com sucesso e retornar 201', async () => {
      jest.spyOn(MaterialRepository, 'findBySlug').mockResolvedValue(null);
      jest.spyOn(MaterialRepository, 'create').mockResolvedValue({
        id: '11111111-2222-3333-4444-555555555555',
        slug: 'guia-arquitetura-software',
        tipo: 'artigo',
        categoria: 'engenharia',
        status: 'published',
        versao_head_id: null,
        created_at: new Date(),
        updated_at: new Date()
      });

      jest.spyOn(VersionRepository, 'create').mockResolvedValue({
        id: 'aaaa1111-bbbb-2222-cccc-333333333333',
        material_id: '11111111-2222-3333-4444-555555555555',
        versao_num: 1,
        parent_version_id: null,
        conteudo_okf: validOKF_v1,
        conteudo_jsonb: {} as any,
        commit_message: 'Commit inicial',
        autor_id: mockAdminUser.sub,
        hash_sha256: calculateSHA256(validOKF_v1),
        created_at: new Date()
      });

      jest.spyOn(MaterialRepository, 'updateHead').mockResolvedValue({
        id: '11111111-2222-3333-4444-555555555555',
        slug: 'guia-arquitetura-software',
        tipo: 'artigo',
        categoria: 'engenharia',
        status: 'published',
        versao_head_id: 'aaaa1111-bbbb-2222-cccc-333333333333',
        created_at: new Date(),
        updated_at: new Date()
      });

      const res = await request(app)
        .post('/materials')
        .set('Cookie', [authCookie])
        .send({
          conteudo_okf: validOKF_v1,
          commit_message: 'Commit inicial'
        });

      expect(res.status).toBe(201);
      expect(res.body.material).toBeDefined();
      expect(res.body.version).toBeDefined();
      expect(res.body.version.versao_num).toBe(1);
    });
  });

  describe('GET /materials e GET /materials/:id', () => {
    it('deve listar materiais', async () => {
      jest.spyOn(MaterialRepository, 'findAll').mockResolvedValue({
        materials: [
          {
            id: '11111111-2222-3333-4444-555555555555',
            slug: 'guia-arquitetura-software',
            tipo: 'artigo',
            categoria: 'engenharia',
            status: 'published',
            versao_head_id: 'aaaa1111-bbbb-2222-cccc-333333333333',
            created_at: new Date(),
            updated_at: new Date()
          }
        ],
        total: 1
      });

      const res = await request(app).get('/materials');
      expect(res.status).toBe(200);
      expect(res.body.materials).toHaveLength(1);
      expect(res.body.total).toBe(1);
    });

    it('deve retornar detalhes do material por ID', async () => {
      const materialId = '11111111-2222-3333-4444-555555555555';
      const headId = 'aaaa1111-bbbb-2222-cccc-333333333333';

      jest.spyOn(MaterialRepository, 'findById').mockResolvedValue({
        id: materialId,
        slug: 'guia-arquitetura-software',
        tipo: 'artigo',
        categoria: 'engenharia',
        status: 'published',
        versao_head_id: headId,
        created_at: new Date(),
        updated_at: new Date()
      });

      jest.spyOn(VersionRepository, 'findById').mockResolvedValue({
        id: headId,
        material_id: materialId,
        versao_num: 1,
        parent_version_id: null,
        conteudo_okf: validOKF_v1,
        conteudo_jsonb: {} as any,
        commit_message: 'Commit inicial',
        autor_id: mockAdminUser.sub,
        hash_sha256: calculateSHA256(validOKF_v1),
        created_at: new Date()
      });

      const res = await request(app).get(`/materials/${materialId}`);
      expect(res.status).toBe(200);
      expect(res.body.material.id).toBe(materialId);
      expect(res.body.head_version.id).toBe(headId);
    });
  });

  describe('POST /materials/:id/versions (Commit & Concurrency)', () => {
    const materialId = '11111111-2222-3333-4444-555555555555';
    const headId = 'aaaa1111-bbbb-2222-cccc-333333333333';

    it('deve retornar 409 Conflict se parent_version_id não coincidir com HEAD', async () => {
      jest.spyOn(MaterialRepository, 'findByIdForUpdate').mockResolvedValue({
        id: materialId,
        slug: 'guia-arquitetura-software',
        versao_head_id: headId
      } as any);

      const res = await request(app)
        .post(`/materials/${materialId}/versions`)
        .set('Cookie', [authCookie])
        .send({
          conteudo_okf: validOKF_v2,
          commit_message: 'Atualização concorrente',
          parent_version_id: '99999999-9999-9999-9999-999999999999'
        });

      expect(res.status).toBe(409);
      expect(res.body.error).toContain('Conflito de versão');
    });

    it('deve criar uma nova versão com parent_version_id correto', async () => {
      jest.spyOn(MaterialRepository, 'findByIdForUpdate').mockResolvedValue({
        id: materialId,
        slug: 'guia-arquitetura-software',
        versao_head_id: headId
      } as any);

      jest.spyOn(VersionRepository, 'getLatestVersionNum').mockResolvedValue(1);

      jest.spyOn(VersionRepository, 'create').mockResolvedValue({
        id: 'bbbb2222-cccc-3333-dddd-444444444444',
        material_id: materialId,
        versao_num: 2,
        parent_version_id: headId,
        conteudo_okf: validOKF_v2,
        conteudo_jsonb: {} as any,
        commit_message: 'Atualização para v2',
        autor_id: mockAdminUser.sub,
        hash_sha256: calculateSHA256(validOKF_v2),
        created_at: new Date()
      });

      jest.spyOn(MaterialRepository, 'updateHead').mockResolvedValue({
        id: materialId,
        slug: 'guia-arquitetura-software',
        tipo: 'artigo',
        categoria: 'engenharia',
        status: 'published',
        versao_head_id: 'bbbb2222-cccc-3333-dddd-444444444444',
        created_at: new Date(),
        updated_at: new Date()
      });

      const res = await request(app)
        .post(`/materials/${materialId}/versions`)
        .set('Cookie', [authCookie])
        .send({
          conteudo_okf: validOKF_v2,
          commit_message: 'Atualização para v2',
          parent_version_id: headId
        });

      expect(res.status).toBe(201);
      expect(res.body.version.versao_num).toBe(2);
      expect(res.body.material.versao_head_id).toBe('bbbb2222-cccc-3333-dddd-444444444444');
    });
  });

  describe('POST /materials/:id/rollback', () => {
    const materialId = '11111111-2222-3333-4444-555555555555';
    const headIdV2 = 'bbbb2222-cccc-3333-dddd-444444444444';

    it('deve realizar rollback seguro criando uma nova versão (v3) com conteúdo da v1', async () => {
      jest.spyOn(MaterialRepository, 'findByIdForUpdate').mockResolvedValue({
        id: materialId,
        slug: 'guia-arquitetura-software',
        versao_head_id: headIdV2
      } as any);

      jest.spyOn(VersionRepository, 'findByMaterialAndVersionNum').mockResolvedValue({
        id: 'aaaa1111-bbbb-2222-cccc-333333333333',
        material_id: materialId,
        versao_num: 1,
        parent_version_id: null,
        conteudo_okf: validOKF_v1,
        conteudo_jsonb: {} as any,
        commit_message: 'Commit inicial',
        autor_id: mockAdminUser.sub,
        hash_sha256: calculateSHA256(validOKF_v1),
        created_at: new Date()
      });

      jest.spyOn(VersionRepository, 'getLatestVersionNum').mockResolvedValue(2);

      jest.spyOn(VersionRepository, 'create').mockResolvedValue({
        id: 'cccc3333-dddd-4444-eeee-555555555555',
        material_id: materialId,
        versao_num: 3,
        parent_version_id: headIdV2,
        conteudo_okf: validOKF_v1,
        conteudo_jsonb: {} as any,
        commit_message: 'Rollback para a versão 1',
        autor_id: mockAdminUser.sub,
        hash_sha256: calculateSHA256(validOKF_v1),
        created_at: new Date()
      });

      jest.spyOn(MaterialRepository, 'updateHead').mockResolvedValue({
        id: materialId,
        slug: 'guia-arquitetura-software',
        tipo: 'artigo',
        categoria: 'engenharia',
        status: 'published',
        versao_head_id: 'cccc3333-dddd-4444-eeee-555555555555',
        created_at: new Date(),
        updated_at: new Date()
      });

      const res = await request(app)
        .post(`/materials/${materialId}/rollback`)
        .set('Cookie', [authCookie])
        .send({
          target_version_num: 1,
          commit_message: 'Rollback para a versão 1'
        });

      expect(res.status).toBe(201);
      expect(res.body.version.versao_num).toBe(3);
      expect(res.body.material.versao_head_id).toBe('cccc3333-dddd-4444-eeee-555555555555');
    });
  });

  describe('GET /materials/:id/diff', () => {
    const materialId = '11111111-2222-3333-4444-555555555555';

    it('deve retornar diff estruturado entre duas versões', async () => {
      jest.spyOn(VersionRepository, 'findByMaterialAndVersionNum')
        .mockImplementation(async (_matId, verNum) => {
          if (verNum === 1) {
            return {
              id: 'v1-id',
              material_id: materialId,
              versao_num: 1,
              conteudo_okf: validOKF_v1
            } as any;
          }
          if (verNum === 2) {
            return {
              id: 'v2-id',
              material_id: materialId,
              versao_num: 2,
              conteudo_okf: validOKF_v2
            } as any;
          }
          return null;
        });

      const res = await request(app).get(`/materials/${materialId}/diff?v1=1&v2=2`);
      expect(res.status).toBe(200);
      expect(res.body.material_id).toBe(materialId);
      expect(res.body.v1).toBe(1);
      expect(res.body.v2).toBe(2);
      expect(Array.isArray(res.body.changes)).toBe(true);
      expect(res.body.changes.length).toBeGreaterThan(0);
    });
  });
});
