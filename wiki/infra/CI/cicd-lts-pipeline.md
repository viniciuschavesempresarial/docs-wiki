---
id: "INFRA-CICD-001"
type: "infra"
title: "Pipeline CI/CD, Releases LTS e Rollback Automático"
description: "Automação no GitHub Actions com 3 jobs: build-test-deploy, geração de tag LTS semântica e auto-rollback em falhas, com análise de prós e contras."
domain: "infraestrutura"
status: "active"
tech_stack:
  - github-actions
  - bash
tags:
  - infra
  - cicd
  - pipeline
  - rollback
  - self_hosted
related_files:
  - "../.github/workflows/deploy.yml"
owner: "time_devops"
created_at: "2026-08-30"
updated_at: "2026-08-30"
---

# INFRA-CICD-001: Pipeline CI/CD, Releases LTS e Rollback Automático

> **Resumo Executivo:** Análise aprofundada da pipeline GitHub Actions com Self-Hosted Runner, estratégia de releases LTS e recuperação automática de falhas.

## 🎯 Visão Geral
O fluxo de CI/CD automatiza o ciclo de vida de deploy contínuo acionado por push na branch `staging`.

### Análise de Vantagens e Desvantagens (Trade-offs):
* **Vantagens do Runner Self-Hosted:**
  * Zero custo de minutos de computação em nuvem no GitHub Actions.
  * Acesso direto à rede interna e aos containers Docker locais sem necessidade de túneis ou VPN.
  * Reuso instantâneo de cache de camadas Docker locais e `node_modules`.
* **Desvantagens e Riscos Mitigados:**
  * Disputa potencial de recursos com a máquina hospedeira (mitigada executando a suíte antes do deploy dos containers).
  * Necessidade de manutenção manual do ambiente de runtime (Node.js 20, Docker engine).

---

## 🔗 Conexões no Grafo (Dependências)
* **Testes de Backend:** [Testes Herméticos Backend](../../testing/test-cases/unit-e2e-backend.md)
