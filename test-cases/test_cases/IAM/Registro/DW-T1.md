---
type: test_case
title: "Validação de Conflito de E-mail Duplicado no Registro"
key: DW-T1
description: "Garantir que a tentativa de auto-registro com um e-mail já existente na tabela 'iam.users' seja rejeitada com HTTP 409 Conflict."
preconditions:
  - "A aplicação Docs-Wiki está em execução com o banco de dados PostgreSQL ativo."
  - "Já existe um usuário cadastrado com o e-mail 'usuario.existente@docswiki.local' na tabela 'iam.users'."
estimated_time: 5.0 min
tags:
  - iam
  - register
  - conflict
  - validation
  - alternative_path
test_type: Functional
status: To Be Automated
folder: /IAM/Registro
---
# Test Case: DW-T1

## Test Steps

### Step1

- **Description**: Acessar o formulário de cadastro na rota '/register'
- **Test data**: URL /register
- **Expected result**:
  - O formulário de registro deve ser exibido com os campos 'nome', 'email' e 'password'.

### Step2

- **Description**: Preencher o formulário informando o e-mail já cadastrado 'usuario.existente@docswiki.local', nome 'Usuário Teste' e uma senha válida
- **Test data**:
  - nome: "Usuário Teste"
  - email: "usuario.existente@docswiki.local"
  - password: "Password123"
- **Expected result**:
  - Os campos devem aceitar a digitação normalmente.

### Step3

- **Description**: Clicar no botão de submissão para enviar a requisição POST para '/api/v1/auth/register'
- **Test data**: None
- **Expected result**:
  - A API deve identificar a duplicidade do e-mail e responder com status HTTP 409 Conflict.
  - A interface deve exibir a mensagem de erro 'E-mail já cadastrado'.
  - Nenhum novo registro deve ser persistido no banco de dados.
