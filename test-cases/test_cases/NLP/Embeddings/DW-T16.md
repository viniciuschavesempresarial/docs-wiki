---
type: test_case
title: "Pipeline Completo de Chunking e Indexação Vetorial com Cache Hit no Redis"
key: DW-T16
description: "Validar a ingestão assíncrona de eventos de materiais no nlp-service com reaproveitamento de vetores de 768 dimensões a partir de Cache Hit no Redis ('emb:sha256') e persistência pgvector HNSW."
preconditions:
  - "O RabbitMQ, PostgreSQL (pgvector) e Redis estão operacionais com o cache 'emb:sha256' populado."
estimated_time: 5.0 min
tags:
  - nlp
  - embeddings
  - chunking
  - redis_hit
  - pgvector
  - hnsw
  - alternative_path
test_type: Functional
status: To Be Automated
folder: /NLP/Embeddings
---
# Test Case: DW-T16

## Test Steps

### Step1

- **Description**: Publicar mensagem de evento 'material.criado' na exchange do RabbitMQ direcionada para a fila 'nlp.processamento'
- **Test data**: Payload contendo ID do material e conteúdo OKF com hashes correspondentes a vetores já cacheados
- **Expected result**:
  - O daemon worker 'nlp-service' consome a mensagem da fila.

### Step2

- **Description**: Executar parsing OKF, extração de métricas de texto e segmentação de chunks estruturados
- **Test data**: None
- **Expected result**:
  - O documento é dividido em seções por títulos (#, ##, ###) com limite de 400 palavras.
  - A consulta de chaves 'emb:sha256' no Redis retorna Cache Hit para todos os chunks.

### Step3

- **Description**: Persistir os chunks vetoriais no PostgreSQL e confirmar consumo da mensagem
- **Test data**: None
- **Expected result**:
  - Os vetores 768d recuperados do Redis são gravados em lote na tabela 'material_chunks' com índice HNSW.
  - O evento 'material.enriquecido' é emitido na exchange do RabbitMQ.
  - O worker executa 'channel.ack(msg)' confirmando o processamento com sucesso.
