---
type: test_case
title: "Bloqueio de Auto-Exclusão e Exclusão de Contas Protegidas do Sistema"
key: DW-T29
description: "Garantir a integridade do sistema impedindo que administradores excluam a própria conta autenticada ou contas marcadas com a flag is_system_protected=true, retornando HTTP 403 Forbidden."
preconditions:
  - "O administrador está autenticado."
  - "O usuário alvo é a própria conta conectada ou possui is_system_protected=true."
estimated_time: 4.0 min
tags:
  - iam
  - 403_forbidden
  - exception_path
test_type: Functional
status: To Be Automated
folder: /IAM/Seguranca
---
# Test Case: DW-T29

## Test Steps

### Step1

- **Description**: Tentar acionar o botão de exclusão na linha correspondente à própria conta conectada na UsersManagementPage
- **Test data**: None
- **Expected result**:
  - O botão de exclusão encontra-se desabilitado no frontend para a própria conta e para usuários protegidos do sistema.

### Step2

- **Description**: Forçar uma chamada direta via API 'DELETE /api/iam/users/:id' enviando o ID protegido ou o próprio ID da sessão
- **Test data**: DELETE /api/iam/users/<id_protegido_ou_proprio>
- **Expected result**:
  - O backend intercepta a operação antes de executar comandos no banco de dados.
  - A API retorna status HTTP 403 Forbidden com a mensagem 'Usuário Protegido: Ação não permitida'.
  - Nenhum registro é alterado ou deletado do banco de dados.
