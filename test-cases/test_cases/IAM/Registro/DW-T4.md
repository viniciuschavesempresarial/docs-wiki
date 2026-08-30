---
type: test_case
title: "Fluxo Completo de Auto-Registro Bem-Sucedido"
key: DW-T4
description: "Validar o cadastro de novo usuário com dados válidos, geração de hash Bcrypt (12 rounds), atribuição da role LEITOR e redirecionamento para o login."
preconditions:
  - "O e-mail 'novo.autor@docswiki.local' não existe no banco de dados."
  - "A API de IAM e o NGINX estão saudáveis."
estimated_time: 5.0 min
tags:
  - iam
  - register
  - success
  - bcrypt
  - leitor_role
  - happy_path
test_type: Functional
status: To Be Automated
folder: /IAM/Registro
---
# Test Case: DW-T4

## Test Steps

### Step1

- **Description**: Acessar o formulário de cadastro na rota '/register'
- **Test data**: URL /register
- **Expected result**:
  - O formulário de registro deve ser exibido com os campos necessários.

### Step2

- **Description**: Preencher o formulário com dados válidos e um e-mail inédito
- **Test data**:
  - nome: "Novo Autor"
  - email: "novo.autor@docswiki.local"
  - password: "StrongPassword@123"
- **Expected result**:
  - Os campos devem validar localmente via Zod client-side.

### Step3

- **Description**: Submeter o cadastro clicando em 'Criar Conta'
- **Test data**: None
- **Expected result**:
  - A API deve processar a requisição com sucesso, aplicar o hash Bcrypt (12 rounds), inserir o usuário no schema 'iam' associando a role 'LEITOR' e retornar HTTP 201 Created.
  - O frontend deve redirecionar automaticamente para a página de Login (/login) com mensagem de sucesso.
