---
id: "API-BE-004"
type: "api"
title: "API de Busca Híbrida e Assistente RAG"
description: "Contratos detalhados para consultas de busca híbrida ponderada, busca facetada, sumarização dinâmica e Chat RAG com a Gemini API."
domain: "busca"
status: "active"
tech_stack:
  - express
  - pgvector
  - google-generative-ai
  - redis
tags:
  - api
  - search
  - rag
  - gemini
  - pgvector
related_files:
  - "../services/search/src/routes/search.routes.ts"
  - "../services/search/src/controllers/search.controller.ts"
  - "../services/search/src/controllers/chat.controller.ts"
owner: "time_backend"
created_at: "2026-08-30"
updated_at: "2026-08-30"
---

# API-BE-004: API de Busca Híbrida e Assistente RAG

> **Resumo Executivo:** Especifica as chamadas de alta performance para busca vetorial/léxica combinada e chat técnico grounded no Google Gemini.

## 🎯 Visão Geral
O microsserviço **`search-service`** disponibiliza endpoints otimizados para busca de baixa latência e recuperação semântica no schema `busca`.

---

## 📐 Detalhes Técnicos e Contratos

### `GET /api/v1/search`
* **Query Parameters:**
  * `q` (opcional): termo de busca textual.
  * `categoria` (opcional): filtro de categoria.
  * `tipo` (opcional): tipo do documento.
  * `tags` (opcional): lista separada por vírgulas.
  * `fuzzy` (opcional, boolean): habilita correspondência por trigramas (`pg_trgm`).
  * `summarize` (opcional, boolean): solicita síntese executiva por IA do documento principal.
  * `limit` (opcional, default 10) e `offset` (opcional, default 0).
* **Resposta de Sucesso (`200 OK`):**
```json
{
  "results": [
    {
      "material_id": "11111111-1111-1111-1111-111111111111",
      "titulo": "Guia de Arquitetura e Engenharia",
      "slug": "guia-arquitetura",
      "tipo": "documentation",
      "categoria": "architecture",
      "autor": "Vinicius Chaves",
      "tags": ["backend", "microservices", "pgvector"],
      "text_score": 0.8421,
      "vector_score": 0.9154,
      "hybrid_score": 0.8934,
      "data_publicacao": "2026-08-30T10:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "ai_summary": "Este documento detalha a topologia de microsserviços Node.js e a integração do PostgreSQL com pgvector..."
}
```

---

### `POST /api/v1/search/chat`
* **Payload de Entrada (`ChatRequestDTO`):**
```json
{
  "query": "Como o GitLikeService trata conflitos de concorrência em commits simultâneos?",
  "material_ids": ["11111111-1111-1111-1111-111111111111"]
}
```
* **Resposta de Sucesso (`200 OK`):**
```json
{
  "answer": "O GitLikeService utiliza Concorrência Otimista (OCC) com bloqueio transacional 'SELECT FOR UPDATE' na tabela 'conteudo.materiais'. Se o 'parent_version_id' enviado na requisição não corresponder exatamente ao 'versao_head_id' atual do banco, a transação é abortada com ROLLBACK e uma exceção 'VersionConflictError' (HTTP 409) é retornada.",
  "sources": [
    {
      "material_id": "11111111-1111-1111-1111-111111111111",
      "titulo": "Guia de Arquitetura e Engenharia",
      "chunk_index": 3,
      "similarity": 0.942
    }
  ]
}
```

---

## 🔗 Conexões no Grafo (Dependências)
* **Busca Híbrida:** [HybridSearchService](../services/hybrid-search-service.md)
* **RAG Chat Service:** [RAGChatService](../services/rag-chat-service.md)
