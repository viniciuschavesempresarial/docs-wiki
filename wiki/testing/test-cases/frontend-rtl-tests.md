---
id: "TEST-CASE-002"
type: "test_case"
title: "Suíte de 19 Testes de Componentes Frontend (RTL)"
description: "Mapeamento dos 19 testes automatizados de componentes React com React Testing Library e simulação de eventos."
domain: "qualidade"
status: "active"
tech_stack:
  - react-testing-library
  - jest
  - typescript
tags:
  - test_case
  - frontend
  - rtl
  - components
related_files:
  - "../frontend/src/features/editor/__tests__/OKFEditor.test.tsx"
  - "../frontend/src/features/diff/__tests__/DiffViewer.test.tsx"
  - "../frontend/src/features/auth/__tests__/LoginPage.test.tsx"
owner: "time_qa"
created_at: "2026-08-30"
updated_at: "2026-08-30"
---

# TEST-CASE-002: Suíte de 19 Testes de Componentes Frontend (RTL)

> **Resumo Executivo:** Detalha os 19 testes de interface que validam a integridade dos formulários, visualizador de diffs e editor OKF.

## 🎯 Visão Geral
* **OKFEditor Tests:** Validação de renderização de abas (Código vs Preview), validação em tempo real de YAML e submissão com abertura do CommitModal.
* **DiffViewer Tests:** Renderização correta de linhas adicionadas (verde), removidas (vermelho) e acionamento do botão de rollback.
* **Auth & Guard Tests:** Redirecionamento automático de rotas privadas e bloqueio visual 403 para usuários sem permissão.

---

## 🔗 Conexões no Grafo (Dependências)
* **Overview Testes:** [Visão Geral de Testes](../overview.md)
