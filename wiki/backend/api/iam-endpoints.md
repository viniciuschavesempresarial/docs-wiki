---
id: "API-BE-002"
type: "api"
title: "API de IAM e Gestão de Usuários"
description: "Documentação técnica aprofundada das rotas de autenticação, login com cookies HttpOnly, me e administração de papéis RBAC."
domain: "iam"
status: "active"
tech_stack:
  - express
  - bcrypt
  - jsonwebtoken
  - zod
tags:
  - api
  - iam
  - auth
  - rbac
related_files:
  - "../services/iam/src/routes/auth.routes.ts"
  - "../services/iam/src/routes/user.routes.ts"
  - "../services/iam/src/controllers/auth.controller.ts"
  - "../services/iam/src/controllers/user.controller.ts"
owner: "time_backend"
created_at: "2026-08-30"
updated_at: "2026-08-30"
---

# API-BE-002: API de IAM e Gestão de Usuários

> **Resumo Executivo:** Detalha os contratos de autenticação segura, ciclo de vida do JWT em cookies HttpOnly e gerenciamento de perfis no schema `iam`.

## 🎯 Visão Geral
O microsserviço **`iam-service`** centraliza o cadastro, autenticação e controle de permissões. A segurança baseia-se em Bcrypt com 12 rounds de salt, rate limiters com `express-rate-limit` e impedimento de auto-exclusão de administradores.

---

## 📐 Detalhes Técnicos e Contratos

### `POST /api/v1/auth/register`
* **Headers:** `Content-Type: application/json`
* **Payload de Entrada:**
```json
{
  "nome": "Vinicius Chaves",
  "email": "vinicius@docswiki.local",
  "senha": "Password123"
}
```
* **Validação Zod (`AuthRegisterDTOSchema`):**
  * `nome`: string, min 3 caracteres.
  * `email`: string, formato de e-mail válido.
  * `senha`: string, min 8 caracteres, regex exigindo pelo menos 1 letra e 1 número.
* **Resposta de Sucesso (`201 Created`):**
```json
{
  "id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "nome": "Vinicius Chaves",
  "email": "vinicius@docswiki.local",
  "role": "LEITOR"
}
```

---

### `POST /api/v1/auth/login`
* **Payload de Entrada:**
```json
{
  "email": "admin@docswiki.local",
  "senha": "AdminPassword123"
}
```
* **Processamento Interno:**
  1. Busca em `iam.users WHERE email = :email`.
  2. Verifica `is_active == true`.
  3. Valida `bcrypt.compare(senha, user.password_hash)`.
  4. Recupera roles associadas (`iam.user_roles`) e permissões (`iam.role_permissions`).
  5. Assina JWT HS256 com validade de 8 horas.
* **Cabeçalhos de Resposta:**
  * `Set-Cookie: token=eyJhbGciOi...; Path=/; HttpOnly; SameSite=Lax`
* **Resposta de Sucesso (`200 OK`):**
```json
{
  "user": {
    "id": "11111111-1111-1111-1111-111111111111",
    "email": "admin@docswiki.local",
    "nome": "Administrador do Sistema",
    "roles": ["ADMIN"],
    "permissions": ["admin:all", "materials:create", "materials:edit", "materials:delete", "materials:rollback", "search:query"]
  }
}
```

---

## 🔗 Conexões no Grafo (Dependências)
* **Auth Service:** [IAMAuthService](../services/iam-auth-service.md)
* **Auth DTOs:** [Auth DTOs](../models/auth-dto.md)
