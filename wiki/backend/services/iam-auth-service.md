---
id: "SERV-BE-005"
type: "concept"
title: "Serviço Backend: IAMAuthService (Tokens e Senhas)"
description: "Serviço de hashing Bcrypt (12 rounds), assinatura e verificação de tokens JWT e gestão de sessões."
domain: "iam"
status: "active"
tech_stack:
  - typescript
  - bcrypt
  - jsonwebtoken
tags:
  - service
  - auth
  - jwt
  - bcrypt
related_files:
  - "../services/iam/src/services/auth.service.ts"
  - "../services/iam/src/services/token.service.ts"
owner: "time_backend"
created_at: "2026-08-30"
updated_at: "2026-08-30"
---

# SERV-BE-005: Serviço Backend: IAMAuthService (Tokens e Senhas)

> **Resumo Executivo:** Responsável pela segurança criptográfica das credenciais e ciclo de vida dos tokens JWT.

## 🎯 Visão Geral
Aplica as melhores práticas OWASP com Bcrypt (12 rounds de salt), emissão de cookies `HttpOnly`, `SameSite=Lax` e validação de permissões RBAC.

---

## 🔗 Conexões no Grafo (Dependências)
* **IAM Endpoints:** [IAM API](../api/iam-endpoints.md)
