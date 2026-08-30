---
type: test_case
title: "Salvaguarda de Papel Mínimo Garantindo Perfil LEITOR na Edição de Permissões"
key: DW-T30
description: "Validar a regra de salvaguarda que impede que um usuário ativo fique sem papéis, garantindo que o perfil base LEITOR permaneça atribuído mesmo se todos os checkboxes forem desmarcados."
preconditions:
  - "O administrador está editando as permissões de um usuário na tabela administrativa."
estimated_time: 3.0 min
tags:
  - iam
  - rbac
  - papel_minimo
  - leitor
  - salvaguarda
  - alternative_path
test_type: Functional
status: To Be Automated
folder: /IAM/RBAC
---
# Test Case: DW-T30

## Test Steps

### Step1

- **Description**: Abrir a gaveta ou modal de edição de papéis de um usuário na UsersManagementPage
- **Test data**: Usuário com papéis ['ADMIN', 'EDITOR', 'LEITOR']
- **Expected result**:
  - Os checkboxes de cada papel são exibidos ativos.

### Step2

- **Description**: Desmarcar todos os checkboxes de papéis (inclusive LEITOR) e clicar em salvar
- **Test data**: None
- **Expected result**:
  - O frontend impede o envio de lista vazia ou ajusta o payload para conter ['LEITOR'].

### Step3

- **Description**: Submeter a requisição 'PUT /api/iam/users/:id/roles' e verificar a persistência
- **Test data**: None
- **Expected result**:
  - A API valida a regra de papel mínimo e insere 'LEITOR' na tabela 'iam.user_roles'.
  - A API responde com HTTP 200 OK.
  - A interface exibe o badge 'LEITOR' atribuído ao usuário.
