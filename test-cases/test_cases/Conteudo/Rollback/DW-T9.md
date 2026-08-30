---
type: test_case
title: "Execução de Rollback Seguro e Não-Destrutivo"
key: DW-T9
description: "Validar a restauração não-destrutiva de uma versão histórica K de material técnico, criando uma nova versão MAX + 1 e atualizando o apontamento de HEAD."
preconditions:
  - "O material '11111111-1111-1111-1111-111111111111' existe no banco com 3 versões históricas registradas (v1, v2, v3)."
  - "O usuário possui a permissão 'materials:rollback'."
estimated_time: 5.0 min
tags:
  - content
  - git_like
  - rollback
  - non_destructive
  - sha256
  - happy_path
test_type: Functional
status: To Be Automated
folder: /Conteudo/Rollback
---
# Test Case: DW-T9

## Test Steps

### Step1

- **Description**: Acessar o histórico de versões do material no painel do editor
- **Test data**: ID do Material: 11111111-1111-1111-1111-111111111111
- **Expected result**:
  - A lista de versões v1, v2 e v3 deve ser renderizada com timestamps e autores.

### Step2

- **Description**: Selecionar a versão histórica K=1 e disparar a requisição de rollback
- **Test data**: target_version_num = 1
- **Expected result**:
  - A API deve enviar POST para '/api/v1/content/materials/11111111-1111-1111-1111-111111111111/rollback'.

### Step3

- **Description**: Validar o processamento do rollback no banco e no RabbitMQ
- **Test data**: None
- **Expected result**:
  - O sistema deve copiar o conteúdo OKF da versão 1 e gravar a nova versão v4 (MAX + 1).
  - O campo 'versao_head_id' na tabela 'conteudo.materiais' deve ser atualizado para a versão v4.
  - O evento 'material.atualizado' deve ser publicado na exchange do RabbitMQ.
  - A API deve responder com status HTTP 201 Created.
