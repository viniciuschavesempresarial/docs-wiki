---
id: "SERV-FE-001"
type: "component"
title: "Serviço Frontend: API Client (Fetch Wrapper)"
description: "Cliente HTTP centralizado com interceptação de erros, envio automático de cookies HttpOnly e tipagem estrita."
domain: "frontend"
status: "active"
tech_stack:
  - typescript
tags:
  - service
  - http_client
  - fetch
related_files:
  - "../frontend/src/api/client.ts"
owner: "time_frontend"
created_at: "2026-08-30"
updated_at: "2026-08-30"
---

# SERV-FE-001: Serviço Frontend: API Client (Fetch Wrapper)

> **Resumo Executivo:** Módulo singleton para disparo de requisições HTTP seguras com suporte a credenciais (`credentials: 'include'`).

## 🎯 Visão Geral
Centraliza todas as chamadas de API do frontend para o gateway NGINX (`/api/v1/...`), tratando timeouts, conversão de payloads JSON e formatação de erros padronizados da API.

---

## 🔗 Conexões no Grafo (Dependências)
* **Endpoints Backend:** [Endpoints Compilados](../../backend/api/endpoints-compilados.md)
