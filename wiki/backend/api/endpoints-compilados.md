---
id: "API-BE-001"
type: "api"
title: "Catálogo Completo de Endpoints da API"
description: "Mapeamento exaustivo de todos os endpoints RESTful, parâmetros de rota, query strings, headers, DTOs de request/response e códigos HTTP."
domain: "backend"
status: "active"
tech_stack:
  - express
  - typescript
  - zod
tags:
  - api
  - endpoints
  - contracts
  - rest
  - swagger
related_files:
  - "../services/iam/src/routes/auth.routes.ts"
  - "../services/iam/src/routes/user.routes.ts"
  - "../services/content/src/routes/material.routes.ts"
  - "../services/search/src/routes/search.routes.ts"
owner: "time_backend"
created_at: "2026-08-30"
updated_at: "2026-08-30"
---

# API-BE-001: Catálogo Completo de Endpoints da API

> **Resumo Executivo:** Mapeamento exaustivo de todos os 17 endpoints RESTful da plataforma, seus métodos, requisitos de segurança, DTOs de entrada e saídas estruturadas.

## 🎯 Visão Geral
Este catálogo compila todas as rotas expostas pelos microsserviços através do gateway NGINX. Todas as rotas autenticadas utilizam o middleware `authenticate` que decodifica o cookie `token` gerado na assinatura do JWT.

---

## 📐 Detalhes Técnicos e Contratos

### Tabela Exaustiva de Endpoints da Plataforma

| Categoria | Método | Rota | Autenticação Exigida | Parâmetros (Path / Query) | Body DTO | Resposta de Sucesso | Erros Possíveis |
| :--- | :---: | :--- | :---: | :--- | :--- | :--- | :--- |
| **IAM & Auth** | `POST` | `/api/v1/auth/register` | Pública | N/A | `AuthRegisterDTO` (`email, senha, nome`) | `201 Created` (`{ id, email, nome, role }`) | `400` (Validação Zod), `409` (Email duplicado) |
| **IAM & Auth** | `POST` | `/api/v1/auth/login` | Pública | N/A | `AuthLoginDTO` (`email, senha`) | `200 OK` (`{ user }` + Cookie HttpOnly `token`) | `400` (Incompleto), `401` (Credenciais incorretas) |
| **IAM & Auth** | `POST` | `/api/v1/auth/logout` | Pública | N/A | N/A | `200 OK` (`{ message }` + Clear-Cookie) | `500` (Erro interno) |
| **IAM & Auth** | `GET` | `/api/v1/auth/me` | `cookieAuth` | N/A | N/A | `200 OK` (`UserResponse`: id, email, nome, roles, permissions) | `401` (Token ausente/inválido) |
| **IAM & Users**| `GET` | `/api/iam/users` | `admin:all` | N/A | N/A | `200 OK` (`{ users: AdminUserItem[] }`) | `401` (Não autenticado), `403` (Acesso negado) |
| **IAM & Users**| `GET` | `/api/iam/users/:id` | `cookieAuth` | Path: `id` (UUID) | N/A | `200 OK` (`UserResponse`) | `400` (UUID inválido), `404` (Não encontrado) |
| **IAM & Users**| `PUT` | `/api/iam/users/:id/roles` | `admin:all` | Path: `id` (UUID) | `{ roles: string[] }` | `200 OK` (`{ message, user }`) | `400` (Roles inválidas), `403` (Proibido), `404` |
| **IAM & Users**| `DELETE`| `/api/iam/users/:id` | `admin:all` | Path: `id` (UUID) | N/A | `200 OK` (`{ message }`) | `403` (Usuário protegido), `404` |
| **Conteúdo** | `GET` | `/api/v1/content/materials` | Pública | Query: `tipo`, `categoria`, `status`, `search`, `limit`, `offset` | N/A | `200 OK` (`{ materials: Material[], total, limit, offset }`) | `500` |
| **Conteúdo** | `POST`| `/api/v1/content/materials` | `materials:create` | N/A | `CreateMaterialDTO` (`conteudo_okf, commit_message`) | `201 Created` (`{ material, version }`) | `400` (OKF inválido / Slug duplicado), `401`, `403` |
| **Conteúdo** | `GET` | `/api/v1/content/materials/:id` | Pública | Path: `id` (UUID) | N/A | `200 OK` (`{ material: MaterialComVersaoAtual }`) | `404` (Material não encontrado) |
| **Conteúdo** | `POST`| `/api/v1/content/materials/:id/versions`| `materials:edit` | Path: `id` (UUID) | `CommitVersionDTO` (`conteudo_okf, parent_version_id, commit_message`) | `201 Created` (`{ version: MaterialVersao }`) | `400` (Inválido), `409` (Conflito Concorrente OCC), `404` |
| **Conteúdo** | `GET` | `/api/v1/content/materials/:id/versions`| Pública | Path: `id` (UUID) | N/A | `200 OK` (`{ versions: MaterialVersao[] }`) | `404` |
| **Conteúdo** | `GET` | `/api/v1/content/materials/:id/diff` | Pública | Path: `id`, Query: `v1` (int), `v2` (int) | N/A | `200 OK` (`DiffResponse`: material_id, v1, v2, changes) | `400` (Versões não especificadas), `404` |
| **Conteúdo** | `POST`| `/api/v1/content/materials/:id/rollback`| `materials:rollback`| Path: `id` (UUID) | `RollbackDTO` (`target_version_num, commit_message`) | `201 Created` (`{ message, new_version, restored_from }`) | `400`, `403`, `404` (Versão alvo inexistente) |
| **Conteúdo** | `DELETE`| `/api/v1/content/materials/:id` | `materials:delete` | Path: `id` (UUID) | N/A | `200 OK` (`{ message: "Material removido com sucesso." }`) | `401`, `403`, `404` |
| **Busca** | `GET` | `/api/v1/search` | Pública | Query: `q, categoria, tipo, tags, data_from, data_to, fuzzy, summarize, limit, offset` | N/A | `200 OK` (`{ results: SearchResultItem[], total, page, limit, ai_summary }`) | `400` (Parâmetros inválidos), `500` |
| **Busca / RAG**| `POST`| `/api/v1/search/chat` | Pública | N/A | `ChatRequestDTO` (`query, material_ids: string[]`) | `200 OK` (`{ answer: string, sources: [{ material_id, titulo, chunk_index, similarity }] }`) | `400` (Query curta / sem docs), `500` |

---

## 🧪 Estratégia de Teste e Validação
Todos os endpoints são testados com Supertest em `services/*/src/__tests__/`.

---

## 🔗 Conexões no Grafo (Dependências)
* **IAM Endpoints:** [IAM API](./iam-endpoints.md)
* **Content Endpoints:** [Content API](./content-endpoints.md)
* **Search Endpoints:** [Search API](./search-endpoints.md)
