---
type: test_case
title: "Publicação Direta de Nova Versão Incremental com HEAD Válido"
key: DW-T12
description: "Validar a publicação de nova versão incremental com SELECT FOR UPDATE no PostgreSQL, garantindo HEAD válido, cálculo de hash SHA-256 e incremento MAX + 1."
preconditions:
  - "O material existe no banco na versão HEAD v2."
  - "O editor submete o formulário com 'parent_version_id' correspondente a v2."
estimated_time: 5.0 min
tags:
  - content
  - new_version
  - git_like
  - sha256
  - select_for_update
  - happy_path
test_type: Functional
status: To Be Automated
folder: /Conteudo/Versoes
---
# Test Case: DW-T12

## Test Steps

### Step1

- **Description**: Abrir o material existente na versão HEAD v2 no editor OKF
- **Test data**: ID do Material: 22222222-2222-2222-2222-222222222222
- **Expected result**:
  - O conteúdo e metadados da versão 2 devem ser carregados no editor.

### Step2

- **Description**: Realizar alterações no texto e clicar no botão 'Publicar Versão'
- **Test data**: parent_version_id = ID da versão 2
- **Expected result**:
  - A requisição POST deve ser enviada para '/api/v1/content/materials/22222222-2222-2222-2222-222222222222/versions'.

### Step3

- **Description**: Validar o bloqueio de concorrência e commit da nova versão
- **Test data**: None
- **Expected result**:
  - A transação PostgreSQL deve aplicar 'SELECT FOR UPDATE' e confirmar que 'versao_head_id == parent_version_id'.
  - O hash SHA-256 do novo conteúdo deve ser calculado.
  - Um novo registro deve ser inserido em 'conteudo.material_versoes' com 'versao_num = 3' (MAX + 1).
  - O campo 'versao_head_id' deve ser atualizado para apontar para a nova versão.
  - O evento 'material.atualizado' deve ser emitido via RabbitMQ e a API responder com HTTP 201 Created.
