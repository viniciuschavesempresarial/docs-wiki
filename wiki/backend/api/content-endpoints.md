---
id: "API-BE-003"
type: "api"
title: "API de Gestão de Conteúdo e Versionamento"
description: "Documentação técnica dos contratos de criação, commits incrementais com concorrência otimista, listagem de versões, diffs e rollback."
domain: "conteudo"
status: "active"
tech_stack:
  - express
  - gray-matter
  - amqplib
  - postgresql
tags:
  - api
  - content
  - git_like
  - occ
  - diff
related_files:
  - "../services/content/src/routes/material.routes.ts"
  - "../services/content/src/controllers/material.controller.ts"
  - "../services/content/src/services/gitLike.service.ts"
owner: "time_backend"
created_at: "2026-08-30"
updated_at: "2026-08-30"
---

# API-BE-003: API de Gestão de Conteúdo e Versionamento

> **Resumo Executivo:** Detalha os contratos para manipulação de documentos OKF, controle de concorrência otimista e publicação de eventos assíncronos.

## 🎯 Visão Geral
O microsserviço **`content-service`** opera sobre o schema `conteudo`, garantindo integridade transacional ACID em todas as mutações de materiais e disparando eventos para a fila de enriquecimento NLP.

---

## 📐 Detalhes Técnicos e Contratos

### `POST /api/v1/content/materials/:id/versions`
* **Headers:** `Content-Type: application/json`, Cookie `token` com permissão `materials:edit`.
* **Payload de Entrada (`CommitVersionDTO`):**
```json
{
  "conteudo_okf": "---\ntitle: Guia de Arquitetura\nslug: guia-arquitetura\ntype: documentation\ncategory: architecture\nauthor: Vinicius Chaves\n---\n\n# Nova Seção Adicionada\nConteúdo revisado...",
  "parent_version_id": "22222222-2222-2222-2222-222222222222",
  "commit_message": "Adiciona detalhamento sobre o motor de busca híbrida"
}
```
* **Processamento Transacional e OCC:**
  1. `BEGIN Transaction`
  2. `SELECT * FROM conteudo.materiais WHERE id = :id FOR UPDATE`
  3. Compara: `material.versao_head_id === parent_version_id`
     * Se falso: `ROLLBACK` e responde com **`HTTP 409 Conflict`** (`{ error: "VersionConflictError", message: "Documento foi modificado por outro usuário." }`).
  4. Calcula o SHA-256 do texto OKF completo.
  5. Obtém `MAX(versao_num) + 1`.
  6. `INSERT INTO conteudo.material_versoes (...)`.
  7. `UPDATE conteudo.materiais SET versao_head_id = nova_versao.id`.
  8. `COMMIT Transaction`.
  9. Publica evento `material.atualizado` no RabbitMQ.
* **Resposta de Sucesso (`201 Created`):**
```json
{
  "version": {
    "id": "33333333-3333-3333-3333-333333333333",
    "material_id": "11111111-1111-1111-1111-111111111111",
    "versao_num": 2,
    "parent_version_id": "22222222-2222-2222-2222-222222222222",
    "commit_message": "Adiciona detalhamento sobre o motor de busca híbrida",
    "conteudo_sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "created_at": "2026-08-30T11:00:00Z"
  }
}
```

---

## 🔗 Conexões no Grafo (Dependências)
* **GitLike Service:** [GitLikeService](../services/git-like-service.md)
* **Material DTOs:** [Material DTOs](../models/material-dto.md)
