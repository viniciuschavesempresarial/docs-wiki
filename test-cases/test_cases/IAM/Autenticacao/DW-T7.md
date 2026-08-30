---
type: test_case
title: "Rejeição de Login por Credenciais Incorretas"
key: DW-T7
description: "Garantir que tentativas de autenticação com senhas incorretas ou contas inativas sejam rejeitadas com status HTTP 401 Unauthorized."
preconditions:
  - "Existe um usuário cadastrado na base, porém a senha inserida é inválida."
estimated_time: 4.0 min
tags:
  - iam
  - login
  - 401_unauthorized
  - invalid_credentials
  - exception_path
test_type: Functional
status: To Be Automated
folder: /IAM/Autenticacao
---
# Test Case: DW-T7

## Test Steps

### Step1

- **Description**: Acessar a página de login na rota '/login'
- **Test data**: URL /login
- **Expected result**:
  - Os campos de 'email' e 'password' devem estar acessíveis.

### Step2

- **Description**: Preencher o e-mail de um usuário existente e digitar uma senha incorreta
- **Test data**:
  - email: "admin@docswiki.local"
  - password: "SenhaTotalmenteIncorreta999"
- **Expected result**:
  - O formulário deve permitir a digitação dos dados.

### Step3

- **Description**: Clicar em 'Entrar' para submeter a requisição POST para '/api/v1/auth/login'
- **Test data**: None
- **Expected result**:
  - O serviço de autenticação deve falhar na comparação do hash Bcrypt e retornar status HTTP 401 Unauthorized.
  - Nenhum cookie de sessão JWT deve ser emitido.
  - A interface deve exibir a mensagem de erro 'Credenciais incorretas'.
