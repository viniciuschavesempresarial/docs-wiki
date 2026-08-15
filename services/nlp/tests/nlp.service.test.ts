import { jest } from '@jest/globals';
import { MaterialCriadoEvent } from '@shared/contracts';
import { nlpService } from '../src/services/nlp.service.js';
import { indicesRepository } from '../src/repositories/indices.repository.js';
import { chunksRepository } from '../src/repositories/chunks.repository.js';
import { rabbitmqManager } from '../src/config/rabbitmq.js';

describe('NLPService (Ingestão e Enriquecimento)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve processar o evento de criação de material, extrair metadados, criar chunks e emitir evento enriquecido', async () => {
    const upsertSpy = jest
      .spyOn(indicesRepository, 'upsertIndice')
      .mockImplementation(async () => {});

    const deleteSpy = jest
      .spyOn(chunksRepository, 'deleteChunksByMaterialId')
      .mockImplementation(async () => {});

    const insertSpy = jest
      .spyOn(chunksRepository, 'insertChunksBatch')
      .mockImplementation(async () => {});

    const publishSpy = jest
      .spyOn(rabbitmqManager, 'publishEvent')
      .mockImplementation(async () => true);

    const event: MaterialCriadoEvent = {
      event: 'material.criado',
      material_id: '00000000-0000-0000-0000-000000000001',
      versao_num: 1,
      slug: 'guia-arquitetura-software',
      titulo: 'Guia de Arquitetura de Software',
      autor: 'Tech Lead',
      autor_id: '00000000-0000-0000-0000-000000000002',
      categoria: 'Engenharia',
      tipo: 'Artigo',
      tags: ['node', 'postgres', 'rag'],
      conteudo_okf: `---
title: "Guia de Arquitetura de Software"
slug: "guia-arquitetura-software"
type: "artigo"
category: "engenharia"
tags: ["node", "postgres"]
author: "Tech Lead"
author_id: "00000000-0000-0000-0000-000000000002"
---
# Introdução

Este documento detalha a arquitetura completa da plataforma Docs-Wiki.

## Processamento de NLP

O serviço de NLP divide o texto em seções e calcula embeddings locais.
`,
      timestamp: new Date().toISOString()
    };

    const result = await nlpService.processMaterialEvent(event);

    expect(result.success).toBe(true);
    expect(result.material_id).toBe(event.material_id);
    expect(result.chunks_count).toBeGreaterThanOrEqual(2);
    expect(result.words_count).toBeGreaterThan(0);

    expect(upsertSpy).toHaveBeenCalledTimes(1);
    expect(deleteSpy).toHaveBeenCalledWith(event.material_id);
    expect(insertSpy).toHaveBeenCalledTimes(1);
    expect(publishSpy).toHaveBeenCalledWith(
      'material.enriquecido',
      expect.objectContaining({
        event: 'material.enriquecido',
        material_id: event.material_id,
        versao_num: 1
      })
    );
  });
});
