---
id: "COMP-FE-000"
type: "component"
title: "Design System Tailwind, Paleta HSL e Glassmorphism"
description: "Documentação do sistema de design visual, paleta de cores, componentes glassmorphism, micro-animações e tipografia moderna."
domain: "frontend"
status: "active"
tech_stack:
  - tailwindcss
  - css3
  - react
tags:
  - design_system
  - tailwind
  - glassmorphism
  - ui_tokens
related_files:
  - "../frontend/tailwind.config.js"
  - "../frontend/src/index.css"
owner: "time_frontend"
created_at: "2026-08-30"
updated_at: "2026-08-30"
---

# COMP-FE-000: Design System Tailwind, Paleta HSL e Glassmorphism

> **Resumo Executivo:** Especifica os tokens de cor, superfícies de vidro (glassmorphism), tipografia e micro-animações implementados no Frontend.

## 🎯 Visão Geral
A identidade visual do **Docs-Wiki** foi concebida para transmitir sofisticação técnica e alto contraste. O tema padrão é um **Dark Mode elegante** com foco na legibilidade de código-fonte, realce de sintaxe e clareza de relatórios analíticos.

---

## 📐 Detalhes Técnicos e Contratos

### 1. Paleta de Cores e Tokens do Tema

| Token / Variável | Valor Hex / Tailwind | Propósito / Aplicação |
| :--- | :--- | :--- |
| **Background Principal** | `#0f172a` (`slate-900`) | Fundo geral da aplicação e área de trabalho do editor. |
| **Superfície Secundária** | `#1e293b` (`slate-800`) | Cartões, barras laterais, tabelas e cabeçalhos. |
| **Superfície Elevada** | `#334155` (`slate-700`) | Modais, tooltips, dropdowns e inputs ativos. |
| **Bordas Sutis** | `rgba(51, 65, 85, 0.6)` (`slate-700/60`) | Linhas de divisão elegantes com baixa opacidade. |
| **Destaque Primário** | `#06b6d4` (`cyan-500`) / `#0891b2` (`cyan-600`) | Botões de ação primária, barras de relevância e badges ativas. |
| **Destaque Secundário** | `#6366f1` (`indigo-500`) | Gradientes de IA, assistente RAG e realces de busca vetorial. |
| **Sucesso / Inclusão** | `#10b981` (`emerald-500`) | Linhas adicionadas no Diff (`added`), status publicado e commits. |
| **Perigo / Exclusão** | `#ef4444` (`red-500`) | Linhas removidas no Diff (`removed`), modais de exclusão e erros. |
| **Alerta / Conflito** | `#f59e0b` (`amber-500`) | Alertas de OCC (409 Conflict) e avisos de versão desatualizada. |

### 2. Padrões de Glassmorphism Implementados
O efeito de vidro translúcido é aplicado nas camadas de topo da aplicação:
```html
<!-- Exemplo de Barra Superior com Glassmorphism -->
<nav class="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-6 py-3">
  <!-- Conteúdo de Navegação -->
</nav>

<!-- Exemplo de Modal Elevado com Efeito Vidro -->
<div class="bg-slate-900/90 backdrop-blur-xl border border-slate-700/60 shadow-2xl rounded-2xl p-6">
  <!-- Conteúdo do Modal -->
</div>
```

### 3. Micro-Animações e Transições
* **Hover de Cartões:** Transição suave com `transition-all duration-200 hover:-translate-y-1 hover:border-cyan-500/50`.
* **Indicador de IA Ativa:** Pulso suave (`animate-pulse`) durante o carregamento de respostas geradas pelo modelo Gemini.
* **Barra de Relevância Híbrida:** Preenchimento animado proporcional ao score ($0.0000$ a $1.0000$).

---

## 🧪 Estratégia de Teste e Validação
Validação visual em navegadores baseados em Chromium e Firefox com suporte à aceleração por hardware para renderização fluida de `backdrop-filter`.

---

## 🔗 Conexões no Grafo (Dependências)
* **Frontend Overview:** [Overview Frontend](../overview.md)
* **Editor OKF:** [OKFEditor](./okf-editor.md)
* **Visualizador Diff:** [DiffViewer](./diff-viewer.md)
