---
id: "SERV-FE-002"
type: "component"
title: "Serviço Frontend: Zustand Chat Store"
description: "Store reativa para controle de mensagens de chat, documentos de contexto e status de streaming/loading da IA."
domain: "frontend"
status: "active"
tech_stack:
  - zustand
  - typescript
tags:
  - service
  - state
  - zustand
  - rag
related_files:
  - "../frontend/src/stores/useChatStore.ts"
owner: "time_frontend"
created_at: "2026-08-30"
updated_at: "2026-08-30"
---

# SERV-FE-002: Serviço Frontend: Zustand Chat Store

> **Resumo Executivo:** Gerencia o estado reativo da conversa com o assistente Gemini e a lista de documentos selecionados no RAG.

## 🎯 Visão Geral
Mantém o histórico de mensagens, fontes citadas (`sources`), estados de carregamento (`isLoading`) e o array de IDs de materiais ativos no filtro de grounding (`selectedDocIds`).

---

## 🔗 Conexões no Grafo (Dependências)
* **Componente Selector:** [DocumentSelector](../components/document-selector.md)
* **Backend RAG:** [RAGChatService](../../backend/services/rag-chat-service.md)
