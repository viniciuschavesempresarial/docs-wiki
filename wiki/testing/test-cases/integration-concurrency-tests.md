---
id: "TEST-CASE-003"
type: "test_case"
title: "Testes de Integração e Concorrência Otimista (OCC)"
description: "Cenários de teste para validação de conflitos de edição simultânea (409 Conflict), integridade SHA-256 e rollbacks lineares."
domain: "qualidade"
status: "active"
tech_stack:
  - jest
  - supertest
  - postgresql
tags:
  - test_case
  - occ
  - concurrency
  - rollback
related_files:
  - "../services/content/src/__tests__/gitLike.service.test.ts"
owner: "time_qa"
created_at: "2026-08-30"
updated_at: "2026-08-30"
---

# TEST-CASE-003: Testes de Integração e Concorrência Otimista (OCC)

> **Resumo Executivo:** Documenta os testes automatizados que garantem a impossibilidade de sobreposição de versões sem resolução prévia de conflito.

## 🎯 Visão Geral
Simula dois usuários $A$ e $B$ carregando a mesma versão $V_1$:
1. Usuário $A$ comita com sucesso, gerando $V_2$ e atualizando `versao_head_id`.
2. Usuário $B$ tenta comitar enviando `parent_version_id = V_1`.
3. O servidor detecta o descasamento e rejeita com **`HTTP 409 Conflict`**.
4. O teste verifica que a transação de $B$ foi revertida sem corromper $V_2$.

---

## 🔗 Conexões no Grafo (Dependências)
* **GitLike Service:** [GitLikeService](../../backend/services/git-like-service.md)
* **Overview Testes:** [Visão Geral de Testes](../overview.md)
