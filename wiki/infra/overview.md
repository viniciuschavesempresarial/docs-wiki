---
id: "INFRA-OVERVIEW-001"
type: "infra"
title: "Visão Geral da Infraestrutura, Deploy e Observabilidade"
description: "Topologia de containers Docker, NGINX Gateway, pipeline CI/CD no GitHub Actions e observabilidade sem efeito observador."
domain: "infraestrutura"
status: "active"
tech_stack:
  - docker
  - nginx
  - github-actions
  - telegraf
  - promtail
  - victoriametrics
  - loki
  - grafana
tags:
  - infra
  - docker
  - cicd
  - observability
related_files:
  - "../docker-compose.yml"
  - "../docker-compose.monitoring.yml"
  - "../nginx.conf"
  - "../.github/workflows/deploy.yml"
owner: "time_devops"
created_at: "2026-08-30"
updated_at: "2026-08-30"
---

# INFRA-OVERVIEW-001: Visão Geral da Infraestrutura, Deploy e Observabilidade

> **Resumo Executivo:** Apresenta o design de infraestrutura para alta performance, deploy automatizado e telemetria isolada.

## 🎯 Visão Geral
A infraestrutura do **Docs-Wiki** foi desenhada para garantir isolamento e fidelidade em testes de carga através de uma **topologia em nós separados**:
* **Nó 1 (Staging Target):** Executa os containers de aplicação e coletores ultraleves (Telegraf e Promtail, CPU < 1%).
* **Nó 2 (Observabilidade Isolada):** Hospeda VictoriaMetrics TSDB, Grafana Loki e Grafana Server sem disputar recursos de CPU/RAM com o nó de teste.

---

## 🔗 Conexões no Grafo (Dependências)
* **Docker Staging:** [Docker Compose Staging](./docker/docker-compose-staging.md)
* **NGINX Gateway:** [NGINX Reverse Proxy](./docker/nginx-reverse-proxy.md)
* **CI/CD Pipeline:** [CI/CD LTS Pipeline](./CI/cicd-lts-pipeline.md)
* **Topologia Telemetria:** [Observabilidade Isolada](./CI/observability-topology.md)
