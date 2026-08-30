---
type: test_case
title: "Autenticação Completa com Sucesso e Acesso a Rota Protegida"
key: DW-T3
description: "Validar a autenticação de usuário ativo com credenciais válidas, emissão de JWT no cookie HttpOnly e acesso autorizado à rota protegida via AuthGuard."
preconditions:
  - "Existe um usuário ativo cadastrado no banco com role 'EDITOR'."
  - "O backend de IAM e o gateway NGINX estão funcionais."
estimated_time: 5.0 min
tags:
  - iam
  - login
  - jwt
  - rbac
  - auth_guard
  - happy_path
test_type: Functional
status: To Be Automated
folder: /IAM/Autenticacao
---
# Test Case: DW-T3

## Test Steps

### Step1

- **Description**: Acessar a página de login na rota '/login'
- **Test data**: URL /login
- **Expected result**:
  - O formulário de login deve ser renderizado com campos 'email' e 'password'.

### Step2

- **Description**: Inserir credenciais válidas de um usuário com perfil EDITOR e clicar em 'Entrar'
- **Test data**:
  - email: "editor@docswiki.local"
  - password: "EditorPassword123"
- **Expected result**:
  - A API deve validar a senha via Bcrypt, emitir o cookie HttpOnly 'token' (JWT com validade de 8h) e responder com status HTTP 200 OK.
  - O usuário deve ser redirecionado para a HomePage do Catálogo (/).

### Step3

- **Description**: Navegar para a rota protegida do editor de materiais '/editor'
- **Test data**: URL /editor
- **Expected result**:
  - O componente 'AuthGuard' deve identificar o token válido e a role 'EDITOR'.
  - A página 'EditorPage' deve ser renderizada com sucesso liberando o editor de markdown OKF e ferramentas de autoria.
