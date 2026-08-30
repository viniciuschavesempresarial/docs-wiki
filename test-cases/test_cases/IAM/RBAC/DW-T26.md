---
type: test_case
title: "Listagem e Atualização Transacional de Papéis RBAC por Administrador"
key: DW-T26
description: "Validar a listagem na UsersManagementPage e a atualização atômica de papéis de usuários (DELETE e INSERT em iam.user_roles com COMMIT) por administrador autorizado."
preconditions:
  - "O administrador autenticado possui o token JWT com a permissão 'admin:all'."
estimated_time: 5.0 min
tags:
  - iam
  - rbac
  - admin
  - roles
  - transaction
  - happy_path
test_type: Functional
status: To Be Automated
folder: /IAM/RBAC
---
# Test Case: DW-T26

## Test Steps

### Step1

- **Description**: Acessar a tela UsersManagementPage ou enviar GET para '/api/iam/users' com credenciais de administrador
- **Test data**: Token JWT com escopo 'admin:all'
- **Expected result**:
  - A API valida a permissão e responde com status HTTP 200 OK contendo a lista de usuários e suas respectivas roles.
  - A tabela administrativa e as métricas de usuários são renderizadas no frontend.

### Step2

- **Description**: Selecionar um usuário na grade, marcar/desmarcar os checkboxes de papéis (LEITOR, EDITOR, ADMIN) e salvar
- **Test data**: Payload PUT /api/iam/users/:id/roles com { roles: ["LEITOR", "EDITOR"] }
- **Expected result**:
  - A requisição é enviada ao backend de IAM.

### Step3

- **Description**: Executar a transação atômica no banco de dados e atualizar o frontend
- **Test data**: None
- **Expected result**:
  - O PostgreSQL executa BEGIN TRANSACTION, deleta os registros antigos em 'iam.user_roles', insere as novas roles e executa COMMIT.
  - O backend responde com HTTP 200 OK.
  - O frontend dispara a invalidação da query ['admin', 'users'] no React Query refletindo os novos papéis imediatamente.
