---
id: "INFRA-DOCKER-002"
type: "infra"
title: "Configuração do Gateway NGINX e Borda de Segurança"
description: "Reverse proxy com terminação SSL, cabeçalhos de segurança OWASP e rate limiters dedicados para Auth (5r/s) e APIs (20r/s)."
domain: "infraestrutura"
status: "active"
tech_stack:
  - nginx
  - ssl
tags:
  - infra
  - nginx
  - security
  - rate_limit
related_files:
  - "../nginx.conf"
owner: "time_devops"
created_at: "2026-08-30"
updated_at: "2026-08-30"
---

# INFRA-DOCKER-002: Configuração do Gateway NGINX e Borda de Segurança

> **Resumo Executivo:** Diretivas do NGINX para proteção contra sobrecarga, terminação SSL e mitigação de vulnerabilidades OWASP.

## 🎯 Visão Geral
Aplica cabeçalhos `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, zonas de rate limiting `auth_limit` e `api_limit`, e roteamento reverso.

---

## 🔗 Conexões no Grafo (Dependências)
* **Endpoints:** [Endpoints Compilados](../../backend/api/endpoints-compilados.md)
