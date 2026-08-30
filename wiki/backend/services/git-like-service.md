---
id: "SERV-BE-001"
type: "concept"
title: "Serviço Backend: GitLikeService (Versionamento e OCC)"
description: "Implementação profunda do motor de versionamento imutável, cálculo de hashes SHA-256, concorrência otimista e rollbacks lineares."
domain: "conteudo"
status: "active"
tech_stack:
  - typescript
  - crypto
  - postgresql
tags:
  - service
  - git_like
  - occ
  - sha256
related_files:
  - "../services/content/src/services/gitLike.service.ts"
  - "../services/content/src/repositories/material.repository.ts"
  - "../services/content/src/repositories/version.repository.ts"
owner: "time_backend"
created_at: "2026-08-30"
updated_at: "2026-08-30"
---

# SERV-BE-001: Serviço Backend: GitLikeService (Versionamento e OCC)

> **Resumo Executivo:** Motor central de versionamento imutável com rastreabilidade criptográfica e garantia de consistência sob concorrência.

## 🎯 Visão Geral
O `GitLikeService` implementa as regras estritas de controle de versão:
1. **Cálculo de Hash SHA-256:** Cada versão gera um hash determinístico do payload OKF completo usando `crypto.createHash('sha256').update(content).digest('hex')`.
2. **Concorrência Otimista (OCC):** Utiliza `SELECT * FROM conteudo.materiais WHERE id = $1 FOR UPDATE` em uma transação atômica. Se `material.versao_head_id !== parent_version_id`, a transação sofre rollback imediato e lança `VersionConflictError` (HTTP 409).
3. **Rollback Não-Destrutivo:** Em vez de deletar versões posteriores, a reversão para uma versão alvo $K$ cria a versão $N+1$ contendo o snapshot exato de $K$, preservando o histórico de auditoria completo.

---

## 🔗 Conexões no Grafo (Dependências)
* **Content API:** [Content Endpoints](../api/content-endpoints.md)
* **Database Schemas:** [Database Schemas](../models/database-schemas.md)
