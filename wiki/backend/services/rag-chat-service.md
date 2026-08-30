---
id: "SERV-BE-004"
type: "concept"
title: "Serviço Backend: RAGChatService (Grounding Gemini)"
description: "Serviço de geração aumentada por recuperação para respostas técnicas fundamentadas estritamente em chunks com temperatura 0.2."
domain: "busca"
status: "active"
tech_stack:
  - typescript
  - google-generative-ai
  - pgvector
tags:
  - service
  - rag
  - gemini
  - grounding
related_files:
  - "../services/search/src/services/rag-chat.service.ts"
  - "../services/search/src/clients/gemini.client.ts"
owner: "time_backend"
created_at: "2026-08-30"
updated_at: "2026-08-30"
---

# SERV-BE-004: Serviço Backend: RAGChatService (Grounding Gemini)

> **Resumo Executivo:** Responsável pelo pipeline de recuperação de chunks vetoriais, montagem do prompt de grounding e invocação do SDK Gemini.

## 🎯 Visão Geral
1. Recebe a pergunta do usuário e o array de IDs de documentos selecionados no frontend.
2. Gera o vetor da pergunta (`queryEmbedderService`) e recupera os 8 chunks mais próximos (`embedding <=> query_vector`) pertencentes aos materiais escolhidos.
3. Formata os blocos de contexto: `[Doc: Título - Seção: Nome] Conteúdo...`.
4. Invoca o modelo `gemini-2.0-flash` com **temperatura 0.2** e **topP 0.8** para máxima aderência ao texto fonte.
5. Retorna a resposta acompanhada do array de fontes auditáveis (`sources`).

---

## 🔗 Conexões no Grafo (Dependências)
* **Frontend Selector:** [DocumentSelector](../../frontend/components/document-selector.md)
* **Search Endpoints:** [Search Endpoints](../api/search-endpoints.md)
