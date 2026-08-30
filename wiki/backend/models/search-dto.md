---
id: "MOD-BE-003"
type: "model"
title: "DTOs e Schemas Zod: Busca e Chat RAG"
description: "Contratos de validação Zod para parâmetros de consulta híbrida e payload de perguntas ao Chat RAG."
domain: "busca"
status: "active"
tech_stack:
  - typescript
  - zod
tags:
  - model
  - dto
  - zod
  - search
related_files:
  - "../packages/shared/src/dtos/search.dto.ts"
owner: "time_backend"
created_at: "2026-08-30"
updated_at: "2026-08-30"
---

# MOD-BE-003: DTOs e Schemas Zod: Busca e Chat RAG

> **Resumo Executivo:** Schemas Zod para validação de `SearchQueryDTO` e `ChatRequestDTO`.

## 🎯 Visão Geral
Garante que filtros de data, paginação, arrays de tags e perguntas do chat estejam estritamente validados antes do processamento.

---

## 🔗 Conexões no Grafo (Dependências)
* **Search Endpoints:** [Search Endpoints](../api/search-endpoints.md)
