---
id: "SERV-BE-002"
type: "concept"
title: "Serviço Backend: NLPService (Chunking e Embeddings 768d)"
description: "Worker assíncrono para divisão estruturada de Markdown por cabeçalhos, cálculo de embeddings de 768 dimensões, cache Redis e gravação no pgvector."
domain: "nlp"
status: "active"
tech_stack:
  - nodejs
  - ioredis
  - postgresql
  - pgvector
tags:
  - service
  - nlp
  - embeddings
  - chunking
related_files:
  - "../services/nlp/src/services/nlp.service.ts"
  - "../services/nlp/src/services/markdown-splitter.ts"
  - "../services/nlp/src/services/embedder.ts"
owner: "time_backend"
created_at: "2026-08-30"
updated_at: "2026-08-30"
---

# SERV-BE-002: Serviço Backend: NLPService (Chunking e Embeddings 768d)

> **Resumo Executivo:** Worker de processamento contínuo para geração vetorial e decomposição semântica de materiais técnicos.

## 🎯 Visão Geral
O `NLPService` é executado como um worker daemon desacoplado:
* Consome mensagens `material.criado` e `material.atualizado` da fila RabbitMQ `nlp.processamento`.
* Extrai metadados do documento pai e realiza o upsert em `busca.indices_busca` (calculando automaticamente o vetor de texto `tsvector` em português).
* Executa o algoritmo `splitMarkdownIntoChunks` que preserva hierarquias de seções (`#`, `##`, `###`) e divide seções com mais de 400 palavras em sub-chunks com sobreposição (overlap) de 50 palavras.
* Gera embeddings densos de 768 dimensões com cache Redis (`emb:<sha256>`) e normalização Euclidiana L2 ($||v||_2 = 1.0$).
* Grava os fragmentos em lote na tabela `busca.material_chunks` indexada com HNSW.

---

## 🔗 Conexões no Grafo (Dependências)
* **Busca Híbrida:** [HybridSearchService](./hybrid-search-service.md)
* **Schemas de Banco:** [Database Schemas](../models/database-schemas.md)
