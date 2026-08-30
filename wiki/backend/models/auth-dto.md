---
id: "MOD-BE-004"
type: "model"
title: "DTOs e Schemas Zod: Autenticação e Usuários"
description: "Contratos Zod para validação de credenciais de login, registro de novos usuários e alteração de permissões."
domain: "iam"
status: "active"
tech_stack:
  - typescript
  - zod
tags:
  - model
  - dto
  - zod
  - auth
related_files:
  - "../packages/shared/src/dtos/auth.dto.ts"
owner: "time_backend"
created_at: "2026-08-30"
updated_at: "2026-08-30"
---

# MOD-BE-004: DTOs e Schemas Zod: Autenticação e Usuários

> **Resumo Executivo:** Schemas para validação de formato de e-mail, complexidade de senha e arrays de roles.

## 🎯 Visão Geral
Especifica `AuthRegisterDTOSchema`, `AuthLoginDTOSchema` e `UpdateUserRolesDTOSchema`.

---

## 🔗 Conexões no Grafo (Dependências)
* **IAM Endpoints:** [IAM API](../api/iam-endpoints.md)
