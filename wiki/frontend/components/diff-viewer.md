---
id: "COMP-FE-002"
type: "component"
title: "Componente: DiffViewer (Visualizador de Diffs)"
description: "Visualizador de diferenças linha a linha entre versões históricas de materiais com base no algoritmo LCS e acionamento de Rollback."
domain: "frontend"
status: "active"
tech_stack:
  - react
  - typescript
  - tailwindcss
tags:
  - component
  - diff
  - lcs
  - versioning
  - rollback
related_files:
  - "../frontend/src/features/diff/DiffViewer.tsx"
  - "../frontend/src/features/diff/DiffPage.tsx"
owner: "time_frontend"
created_at: "2026-08-30"
updated_at: "2026-08-30"
---

# COMP-FE-002: Componente: DiffViewer (Visualizador de Diffs)

> **Resumo Executivo:** Exibe a comparação estruturada e colorida de modificações entre duas versões históricas de um material com suporte a reversão.

## 🎯 Visão Geral
O `DiffViewer` consome o endpoint `GET /api/v1/content/materials/:id/diff?v1=X&v2=Y` e renderiza as alterações com realce semântico:
* 🟢 **Verde (`added`):** Linhas adicionadas na versão mais recente (V2).
* 🔴 **Vermelho (`removed`):** Linhas removidas da versão anterior (V1).
* ⚪ **Neutro (`unchanged`):** Linhas que permaneceram inalteradas.

---

## 📐 Detalhes Técnicos e Contratos

### Contrato de Dados do Diff
```typescript
export interface DiffChangeItem {
  type: 'added' | 'removed' | 'unchanged';
  value: string;
  lineNumberV1?: number;
  lineNumberV2?: number;
}

export interface DiffResponse {
  material_id: string;
  v1: number;
  v2: number;
  changes: DiffChangeItem[];
}
```

Inclui botão integrado para acionamento do **Rollback Seguro**, permitindo que usuários autorizados revertam o documento para a versão V1 sem perder o histórico (cria a versão $N+1$).

---

## 🧪 Estratégia de Teste e Validação
Testado em `frontend/src/features/diff/__tests__/DiffViewer.test.tsx`.

---

## 🔗 Conexões no Grafo (Dependências)
* **Editor OKF:** [OKFEditor](./okf-editor.md)
* **Serviço Backend:** [GitLikeService](../../backend/services/git-like-service.md)
