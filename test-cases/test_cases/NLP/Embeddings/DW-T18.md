---
type: test_case
title: "Geração de Embeddings Locais com Normalização L2 e Gravação no Redis (Cache Miss)"
key: DW-T18
description: "Validar a geração local de embeddings vetoriais de 768 dimensões em cenário de Cache Miss, aplicando normalização Euclidiana L2 (norma 1.0) e gravação no Redis com TTL de 24h."
preconditions:
  - "A mensagem de criação de material possui conteúdo inédito não presente no cache Redis."
  - "O modelo de embeddings local e o PostgreSQL (pgvector) estão ativos."
estimated_time: 5.0 min
tags:
  - nlp
  - embeddings
  - cache_miss
  - l2_normalization
  - redis_ttl
  - pgvector
  - happy_path
test_type: Functional
status: To Be Automated
folder: /NLP/Embeddings
---
# Test Case: DW-T18

## Test Steps

### Step1

- **Description**: Receber mensagem de criação de novo material com conteúdo inédito na fila 'nlp.processamento'
- **Test data**: Conteúdo inédito em formato OKF
- **Expected result**:
  - O daemon inicia o processamento e identifica Cache Miss no Redis.

### Step2

- **Description**: Executar a inferência vetorial e a normalização geométrica L2
- **Test data**: None
- **Expected result**:
  - O modelo gera vetores densos de 768 dimensões para cada chunk.
  - O sistema calcula a norma Euclidiana e normaliza o comprimento para exatamente 1.0.
  - Os vetores normalizados são gravados no Redis na chave 'emb:sha256' com TTL de 24 horas.

### Step3

- **Description**: Inserir os chunks vetoriais na base pgvector e confirmar mensagem no RabbitMQ
- **Test data**: None
- **Expected result**:
  - Os chunks são inseridos em lote na tabela 'material_chunks' com índice HNSW.
  - A mensagem é confirmada com 'channel.ack(msg)'.
  - O evento 'material.enriquecido' é disparado com sucesso.
