---
id: "SERV-BE-003"
type: "concept"
title: "Serviço Backend: HybridSearchService (Busca Ponderada)"
description: "Mecanismo de busca híbrida ponderada unificando BM25 (tsvector) e busca vetorial por cosseno (HNSW) no PostgreSQL."
domain: "busca"
status: "active"
tech_stack:
  - typescript
  - postgresql
  - pgvector
  - pg_trgm
tags:
  - service
  - search
  - bm25
  - vector
related_files:
  - "../services/search/src/services/hybrid-search.service.ts"
  - "../services/search/src/repositories/search.repository.ts"
owner: "time_backend"
created_at: "2026-08-30"
updated_at: "2026-08-30"
---

# SERV-BE-003: Serviço Backend: HybridSearchService (Busca Ponderada)

> **Resumo Executivo:** Orquestra a execução da query SQL híbrida combinando scores léxicos e vetoriais com pesos calibrados.

## 🎯 Visão Geral
Executa a fórmula de pontuação híbrida:
$$\text{Score Híbrido} = 0.3 \times \text{ts\_rank\_cd(b.busca\_texto, query)} + 0.7 \times \max(1 - (c.embedding \Leftrightarrow query\_vector))$$
Permite filtragem por categorias, tipos e tags em tempo real, além de suporte a busca aproximada com trigramas (`pg_trgm`) caso o parâmetro `fuzzy=true` seja ativado.

---

## 🔗 Conexões no Grafo (Dependências)
* **Search Endpoints:** [Search Endpoints](../api/search-endpoints.md)
* **RAG Chat Service:** [RAGChatService](./rag-chat-service.md)
