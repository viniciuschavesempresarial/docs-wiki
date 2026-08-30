---
type: test_case
title: "Bloqueio de Busca por Excesso de Taxa de Requisições (Rate Limit)"
key: DW-T21
description: "Garantir que chamadas excessivas ao endpoint de busca sejam contidas na borda NGINX (zona api_limit: 20 req/s), retornando HTTP 429 Too Many Requests com cabeçalho Retry-After."
preconditions:
  - "A zona 'api_limit' do NGINX está configurada para limitar requisições em 20r/s."
estimated_time: 4.0 min
tags:
  - search
  - rate_limit
  - 429_too_many_requests
  - nginx
  - exception_path
test_type: Functional
status: To Be Automated
folder: /Busca/Seguranca
---
# Test Case: DW-T21

## Test Steps

### Step1

- **Description**: Disparar um volume massivo de consultas de busca concorrentes (ex: 35 requisições por segundo) para '/api/v1/search'
- **Test data**: Concorrência: 35 req/s
- **Expected result**:
  - O gateway reverso NGINX contabiliza a taxa na zona 'api_limit'.

### Step2

- **Description**: Interceptar o bloqueio na camada de borda antes de atingir os serviços backend
- **Test data**: None
- **Expected result**:
  - As requisições que excederem o limite são rejeitadas imediatamente com status HTTP 429 Too Many Requests.
  - A resposta contém o cabeçalho 'Retry-After' com o tempo de espera.
  - Nenhuma consulta adicional de busca lexical ou vetorial é enviada ao PostgreSQL.
