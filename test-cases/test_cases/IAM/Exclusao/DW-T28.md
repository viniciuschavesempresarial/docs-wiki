---
type: test_case
title: "Exclusão de Usuário Permitida com Confirmação e Cascata no Banco de Dados"
key: DW-T28
description: "Validar o fluxo completo de exclusão de usuário não-protegido por administrador, com confirmação em modal, DELETE em iam.users, remoção em cascata (FK Cascade) de user_roles e atualização do frontend."
preconditions:
  - "O administrador está autenticado com 'admin:all'."
  - "O usuário alvo não é uma conta do sistema (is_system_protected=false) nem a própria conta conectada."
estimated_time: 4.0 min
tags:
  - iam
  - exclusao
  - cascade
  - rbac
  - happy_path
test_type: Functional
status: To Be Automated
folder: /IAM/Exclusao
---
# Test Case: DW-T28

## Test Steps

### Step1

- **Description**: Na UsersManagementPage, localizar o usuário alvo desprotegido e clicar no botão 'Excluir Usuário'
- **Test data**: ID de um usuário comum desprotegido
- **Expected result**:
  - O sistema exibe o modal de confirmação com a advertência 'Revogação permanente de credenciais'.

### Step2

- **Description**: Confirmar a operação de exclusão no modal
- **Test data**: None
- **Expected result**:
  - A requisição DELETE '/api/iam/users/:id' é enviada ao servidor.

### Step3

- **Description**: Validar a remoção no PostgreSQL e a atualização em tela
- **Test data**: None
- **Expected result**:
  - O registro é removido da tabela 'iam.users' e todos os registros associados em 'iam.user_roles' são excluídos automaticamente via FK Cascade.
  - A API retorna status HTTP 200 OK.
  - O cache do React Query é invalidado e a linha do usuário desaparece da tabela.
