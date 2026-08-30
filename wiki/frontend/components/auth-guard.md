---
id: "COMP-FE-004"
type: "component"
title: "Componente: AuthGuard e Roteamento Seguro"
description: "Componente de ordem superior para proteção de rotas privadas e validação de papéis RBAC no cliente."
domain: "frontend"
status: "active"
tech_stack:
  - react
  - react-router-dom
  - typescript
tags:
  - component
  - auth
  - rbac
  - guard
related_files:
  - "../frontend/src/features/auth/AuthGuard.tsx"
  - "../frontend/src/features/auth/useAuth.ts"
owner: "time_frontend"
created_at: "2026-08-30"
updated_at: "2026-08-30"
---

# COMP-FE-004: Componente: AuthGuard e Roteamento Seguro

> **Resumo Executivo:** Intercepta a navegação para rotas protegidas, garantindo autenticação válida e verificação de papéis antes de renderizar a página.

## 🎯 Visão Geral
O `AuthGuard` consome a query `['auth', 'me']` do React Query:
* Se a sessão estiver ausente ou expirada, redireciona o usuário para `/login`.
* Se o usuário não tiver o papel requerido (ex: `ADMIN` para acessar `/admin/users`), renderiza uma tela de acesso negado (HTTP 403 visual).

---

## 🔗 Conexões no Grafo (Dependências)
* **Endpoints de Autenticação:** [IAM Endpoints](../../backend/api/iam-endpoints.md)
* **API Client:** [API Client Service](../services/api-client.md)
