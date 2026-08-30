---
id: "INFRA-DOCKER-001"
type: "infra"
title: "Orquestração Docker Compose para Staging"
description: "Especificação dos 9 serviços dockerizados, limites de recursos, volumes persistentes e redes internas isoladas."
domain: "infraestrutura"
status: "active"
tech_stack:
  - docker
  - docker-compose
tags:
  - infra
  - docker
  - compose
related_files:
  - "../docker-compose.yml"
owner: "time_devops"
created_at: "2026-08-30"
updated_at: "2026-08-30"
---

# INFRA-DOCKER-001: Orquestração Docker Compose para Staging

> **Resumo Executivo:** Mapeamento detalhado dos 9 containers da aplicação no nó de staging.

## 🎯 Visão Geral
Define as configurações de inicialização e variáveis de ambiente dos serviços `postgres`, `redis`, `rabbitmq`, `iam-service`, `content-service`, `search-service`, `nlp-worker`, `frontend` e `nginx-gateway`.

---

## 🔗 Conexões no Grafo (Dependências)
* **NGINX:** [NGINX Reverse Proxy](./nginx-reverse-proxy.md)
