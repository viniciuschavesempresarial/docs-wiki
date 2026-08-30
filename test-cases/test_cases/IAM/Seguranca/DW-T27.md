---
type: test_case
title: "Acesso Negado com HTTP 403 Forbidden para Usuários sem Permissão admin:all"
key: DW-T27
description: "Garantir o bloqueio de segurança com HTTP 403 Forbidden quando usuários sem escopo 'admin:all' tentarem acessar ou alterar dados nas rotas administrativas de IAM."
preconditions:
  - "O usuário está autenticado com papel 'LEITOR' ou 'EDITOR' sem escopo administrativo."
estimated_time: 4.0 min
tags:
  - iam
  - rbac
  - 403_forbidden
  - security
  - unauthorized
  - exception_path
test_type: Functional
status: To Be Automated
folder: /IAM/Seguranca
---
# Test Case: DW-T27

## Test Steps

### Step1

- **Description**: Autenticar com uma conta que possua apenas o perfil 'LEITOR' ou 'EDITOR'
- **Test data**: Credenciais de usuário padrão sem privilégios de administração
- **Expected result**:
  - O login é concluído com JWT gerado sem a permissão 'admin:all'.

### Step2

- **Description**: Tentar enviar GET para '/api/iam/users' ou disparar alteração de permissões em '/api/iam/users/:id/roles'
- **Test data**: None
- **Expected result**:
  - O middleware de autorização RBAC intercepta a requisição e detecta a ausência da role 'admin:all'.
  - A API responde com status HTTP 403 Forbidden.
  - O corpo da resposta traz a mensagem de erro 'Acesso Negado' sem expor registros do banco de dados.
