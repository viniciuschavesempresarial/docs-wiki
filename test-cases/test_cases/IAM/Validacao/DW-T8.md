---
type: test_case
title: "Rejeição de Registro por Dados Inválidos (Falha Zod DTO)"
key: DW-T8
description: "Validar a rejeição de submissão de cadastro com dados inválidos pelo schema Zod 'AuthRegisterDTOSchema', retornando HTTP 400 Bad Request."
preconditions:
  - "O endpoint 'POST /api/v1/auth/register' está ativo com middleware de validação Zod."
estimated_time: 4.0 min
tags:
  - iam
  - validation
  - 400_bad_request
  - zod_schema
  - exception_path
test_type: Functional
status: To Be Automated
folder: /IAM/Validacao
---
# Test Case: DW-T8

## Test Steps

### Step1

- **Description**: Acessar a tela de cadastro na rota '/register'
- **Test data**: URL /register
- **Expected result**:
  - O formulário de registro deve estar disponível para preenchimento.

### Step2

- **Description**: Preencher o formulário violando regras do schema (ex: nome com menos de 3 caracteres, e-mail sem formato válido ou senha fraca de 3 caracteres)
- **Test data**:
  - nome: "Ab"
  - email: "email_invalido_sem_arroba"
  - password: "123"
- **Expected result**:
  - Os campos devem aceitar a digitação para validação de submissão.

### Step3

- **Description**: Submeter a requisição POST para '/api/v1/auth/register'
- **Test data**: None
- **Expected result**:
  - O backend deve interceptar a requisição com o schema Zod e responder com status HTTP 400 Bad Request.
  - O corpo da resposta deve conter o array com os detalhes específicos de cada campo rejeitado.
  - O fluxo deve ser interrompido sem gravar nenhum dado no banco.
