---
id: "COMP-FE-001"
type: "component"
title: "Componente: OKFEditor e CommitModal"
description: "Editor de documentos no formato OKF com parsing de frontmatter YAML, validação Zod client-side, preview em tempo real e commit de versões."
domain: "frontend"
status: "active"
tech_stack:
  - react
  - typescript
  - gray-matter
  - tailwindcss
tags:
  - component
  - editor
  - markdown
  - okf
  - occ
related_files:
  - "../frontend/src/features/editor/OKFEditor.tsx"
  - "../frontend/src/features/editor/CommitModal.tsx"
  - "../frontend/src/features/editor/EditorPage.tsx"
owner: "time_frontend"
created_at: "2026-08-30"
updated_at: "2026-08-30"
---

# COMP-FE-001: Componente: OKFEditor e CommitModal

> **Resumo Executivo:** Componente central para edição, preview e commit de materiais técnicos no formato OKF com tratamento de conflitos OCC.

## 🎯 Visão Geral
O `OKFEditor` provê uma interface dividida em abas (Editor de Código e Preview Renderizado) permitindo a edição assistida de metadados YAML e texto Markdown, com suporte a atalhos de formatação e modal de commit com controle de versão.

---

## 📐 Detalhes Técnicos e Contratos

### Props e Tipagem do Componente
```typescript
export interface OKFEditorProps {
  initialContent?: string;
  materialId?: string;
  parentVersionId?: string;
  onSaveSuccess?: (material: Material, version: MaterialVersao) => void;
}
```

### Fluxo de Salvamento e Detecção de Conflitos
Ao clicar em "Salvar & Comitar":
1. Abre o `CommitModal` solicitando uma mensagem explicativa de commit.
2. Dispara a requisição `POST /api/v1/content/materials/:id/versions` enviando o `parentVersionId` capturado no momento do carregamento da versão HEAD.
3. Se o servidor responder com `409 Conflict`, o editor exibe o alerta: *"Documento modificado por outro usuário"*, mantendo o texto editado localmente para que o usuário não perca o trabalho e oferecendo a opção de recarregar a versão HEAD para resolução manual de merge.

---

## 🧪 Estratégia de Teste e Validação
Testado via React Testing Library em `frontend/src/features/editor/__tests__/OKFEditor.test.tsx` cobrindo validação de frontmatter, alternância de abas de preview e abertura de modal de commit.

---

## 🔗 Conexões no Grafo (Dependências)
* **Backend API:** [Content Endpoints](../../backend/api/content-endpoints.md)
* **Serviço Git-Like:** [GitLikeService](../../backend/services/git-like-service.md)
* **Visualizador de Diffs:** [DiffViewer](./diff-viewer.md)
