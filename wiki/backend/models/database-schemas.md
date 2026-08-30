---
id: "MOD-BE-001"
type: "model"
title: "Modelos de Dados e Schemas PostgreSQL"
description: "Esquema completo das tabelas nos schemas iam, conteudo e busca, com índices HNSW, GIN e Trigram."
domain: "database"
status: "active"
tech_stack:
  - postgresql
  - pgvector
  - pg_trgm
tags:
  - database
  - schema
  - sql
  - hnsw
related_files:
  - "../init-schemas.sql"
owner: "time_backend"
created_at: "2026-08-30"
updated_at: "2026-08-30"
---

# MOD-BE-001: Modelos de Dados e Schemas PostgreSQL

> **Resumo Executivo:** Mapeamento DDL das tabelas e índices otimizados do banco de dados relacional e vetorial.

## 🎯 Visão Geral
O banco PostgreSQL 16 é particionado nos schemas `iam`, `conteudo` e `busca`:
* **Índices de Performance:**
  * `busca.material_chunks`: Índice HNSW com `vector_cosine_ops` ($m=16, ef\_construction=64$).
  * `busca.indices_busca`: Índice GIN na coluna `busca_texto` (TSVector) e índice GIN na coluna `tags`.
  * `busca.indices_busca`: Índice Trigram GIN (`gin_trgm_ops`) em `titulo` e `autor`.

---

## 🔗 Conexões no Grafo (Dependências)
* **Visão Geral Backend:** [Backend Overview](../overview.md)
