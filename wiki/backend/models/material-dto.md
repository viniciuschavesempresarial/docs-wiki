---
id: "MOD-BE-002"
type: "model"
title: "DTOs e Schemas Zod: Material e Versionamento"
description: "Contratos de validação Zod para submissão de OKF, criação de materiais, commits incrementais e rollback."
domain: "conteudo"
status: "active"
tech_stack:
  - typescript
  - zod
tags:
  - model
  - dto
  - zod
related_files:
  - "../packages/shared/src/dtos/material.dto.ts"
owner: "time_backend"
created_at: "2026-08-30"
updated_at: "2026-08-30"
---

# MOD-BE-002: DTOs e Schemas Zod: Material e Versionamento

> **Resumo Executivo:** Tipos e schemas Zod compartilhados (`@shared/contracts`) para controle de integridade de materiais.

## 🎯 Visão Geral
Define `CreateMaterialDTOSchema`, `CommitVersionDTOSchema`, `RollbackDTOSchema` e `OKFFrontmatterSchema`.

---

## 🔗 Conexões no Grafo (Dependências)
* **Content Endpoints:** [Content API](../api/content-endpoints.md)
