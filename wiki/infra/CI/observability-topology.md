---
id: "INFRA-CICD-002"
type: "infra"
title: "Topologia de Observabilidade sem Efeito Observador"
description: "Arquitetura de telemetria desacoplada com Telegraf + Promtail no nó de aplicação e VictoriaMetrics + Loki + Grafana no nó dedicado."
domain: "infraestrutura"
status: "active"
tech_stack:
  - telegraf
  - promtail
  - victoriametrics
  - loki
  - grafana
tags:
  - infra
  - observability
  - metrics
  - logs
related_files:
  - "../docker-compose.monitoring.yml"
  - "../telegraf.conf"
  - "../promtail-config.yml"
owner: "time_devops"
created_at: "2026-08-30"
updated_at: "2026-08-30"
---

# INFRA-CICD-002: Topologia de Observabilidade sem Efeito Observador

> **Resumo Executivo:** Design de telemetria distribuída para medição pura de latência e throughput sob carga pesada sem interferência na aplicação.

## 🎯 Visão Geral
Garante que a ingestão de métricas e logs em alta frequência não distorça as medições de capacidade da aplicação durante testes de estresse (k6/Locust).

---

## 🔗 Conexões no Grafo (Dependências)
* **Visão Geral Infra:** [Infra Overview](../overview.md)
