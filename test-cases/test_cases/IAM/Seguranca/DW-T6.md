---
type: test_case
title: "Rejeição por Exceder Rate Limit de Requisições"
key: DW-T6
description: "Validar a contenção de requisições excessivas (força bruta/DoS) na borda NGINX (zona auth_limit: 5 req/s), retornando HTTP 429 Too Many Requests."
preconditions:
  - "O gateway NGINX e o serviço de IAM estão em execução."
  - "O rate limiter está configurado para o limite de 5 req/s."
estimated_time: 5.0 min
tags:
  - security
  - rate_limit
  - 429_too_many_requests
  - nginx
  - exception_path
test_type: Functional
status: To Be Automated
folder: /IAM/Seguranca
---
# Test Case: DW-T6

## Test Steps

### Step1

- **Description**: Disparar uma rajada de requisições concorrentes (ex: 10 requisições simultâneas em menos de 1 segundo) para o endpoint 'POST /api/v1/auth/register'
- **Test data**:
  - Requisições: 10 chamadas concorrentes
  - Endpoint: /api/v1/auth/register
- **Expected result**:
  - As requisições que excederem o limite de taxa de 5 req/s devem ser bloqueadas na borda pelo NGINX com status HTTP 429 Too Many Requests.
  - A resposta deve incluir o cabeçalho 'Retry-After'.
  - Nenhuma requisição bloqueada deve sobrecarregar o banco de dados.
