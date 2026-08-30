---
id: "COMP-FE-003"
type: "component"
title: "Componente: DocumentSelector (RAG Context)"
description: "Painel lateral de seleção de múltiplos documentos de contexto para o assistente de Chat RAG."
domain: "frontend"
status: "active"
tech_stack:
  - react
  - typescript
  - zustand
tags:
  - component
  - rag
  - selector
related_files:
  - "../frontend/src/features/rag/DocumentSelector.tsx"
  - "../frontend/src/features/rag/ChatPanel.tsx"
owner: "time_frontend"
created_at: "2026-08-30"
updated_at: "2026-08-30"
---

# COMP-FE-003: Componente: DocumentSelector (RAG Context)

> **Resumo Executivo:** Interface para seleção e filtragem de materiais que compõem a base de conhecimento do Chat RAG.

## 🎯 Visão Geral
Permite que o usuário filtre e selecione múltiplos materiais técnicos cadastrados. Os IDs dos documentos selecionados são mantidos no `useChatStore` e enviados no payload de busca do RAG para restringir a recuperação de chunks aos materiais desejados.

---

## 📐 Detalhes Técnicos e Contratos
* **Seleção Múltipla:** Checkbox individual com opções "Selecionar Todos" e "Limpar Seleção".
* **Contador de Contexto:** Badge informando a quantidade de documentos ativos no grounding.

---

## 🔗 Conexões no Grafo (Dependências)
* **Chat Store:** [Chat Store Service](../services/chat-store.md)
* **Backend RAG:** [RAGChatService](../../backend/services/rag-chat-service.md)
