---
id: "TEST-CASE-001"
type: "test_case"
title: "Suíte de 88 Testes Automatizados de Backend"
description: "Mapeamento aprofundado dos 88 testes automatizados dos serviços IAM, Content, NLP Worker e Search com Jest e Supertest."
domain: "qualidade"
status: "active"
tech_stack:
  - jest
  - supertest
  - typescript
tags:
  - test_case
  - backend
  - jest
  - supertest
related_files:
  - "../services/iam/src/__tests__/"
  - "../services/content/src/__tests__/"
  - "../services/search/src/__tests__/"
  - "../services/nlp/src/__tests__/"
owner: "time_qa"
created_at: "2026-08-30"
updated_at: "2026-08-30"
---

# TEST-CASE-001: Suíte de 88 Testes Automatizados de Backend

> **Resumo Executivo:** Especifica os cenários cobertos pelos 88 testes de backend, incluindo bancos em memória, fixtures e mocks de rede.

## 🎯 Visão Geral
* **IAM Service:** 24 testes cobrindo registro de usuário, validações Zod, login com Bcrypt, geração e expiração de JWT, permissões RBAC e proteção de super admin.
* **Content Service:** 32 testes cobrindo criação OKF, parsing de metadados, validação de slug único, concorrência otimista (OCC), geração de hash SHA-256, cálculo de diffs LCS e rollback linear.
* **NLP Service:** 16 testes cobrindo divisão estruturada de Markdown por cabeçalhos (#, ##, ###), overlap de 50 palavras para seções longas, geração de embeddings 768d, normalização L2 e cache Redis.
* **Search Service:** 16 testes cobrindo busca híbrida ponderada, ordenação por relevância, busca aproximada trigram e grounding do Chat RAG com mock do SDK Gemini.

---

## 🔗 Conexões no Grafo (Dependências)
* **Overview Testes:** [Visão Geral de Testes](../overview.md)
* **Testes OCC:** [Testes de Concorrência](./integration-concurrency-tests.md)
