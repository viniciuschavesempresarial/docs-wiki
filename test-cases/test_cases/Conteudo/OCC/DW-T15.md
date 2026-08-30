---
type: test_case
title: "Detecção de Conflito Concorrente OCC e Resolução de Commit em Loop"
key: DW-T15
description: "Validar a detecção de concorrência otimista com SELECT FOR UPDATE no PostgreSQL, rollback transacional com HTTP 409 Conflict e resolução em loop com recarga do HEAD."
preconditions:
  - "O documento está na versão HEAD v2 e dois editores (A e B) abriram a versão v2 simultaneamente."
estimated_time: 6.0 min
tags:
  - content
  - occ
  - concurrency
  - 409_conflict
  - select_for_update
  - loop_path
test_type: Functional
status: To Be Automated
folder: /Conteudo/OCC
---
# Test Case: DW-T15

## Test Steps

### Step1

- **Description**: O Editor A submete alterações com sucesso avançando o documento para a versão HEAD v3
- **Test data**: parent_version_id = ID da v2
- **Expected result**:
  - A API confirma o commit do Editor A gerando a versão v3 (HTTP 201 Created).
  - O campo 'versao_head_id' passa a apontar para a v3.

### Step2

- **Description**: O Editor B tenta submeter suas alterações mantendo o parent_version_id apontando para a versão v2 antiga
- **Test data**: parent_version_id = ID da v2 desatualizada
- **Expected result**:
  - A transação PostgreSQL aplica 'SELECT FOR UPDATE' e identifica que 'versao_head_id != parent_version_id'.
  - A transação sofre ROLLBACK e a API retorna HTTP 409 Conflict.
  - A interface exibe notificação de conflito orientando a recarga da versão HEAD.

### Step3

- **Description**: O Editor B clica em 'Recarregar HEAD', mescla suas edições e submete novamente com parent_version_id atualizado
- **Test data**: parent_version_id = ID da v3
- **Expected result**:
  - A validação 'SELECT FOR UPDATE' aprova a concorrência.
  - A nova versão v4 (MAX + 1) é gravada com sucesso e o evento 'material.atualizado' é publicado no RabbitMQ (HTTP 201 Created).
