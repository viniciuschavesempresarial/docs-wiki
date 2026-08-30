---
type: test_case
title: "Rejeição de Rollback por Versão Alvo Inexistente no Histórico"
key: DW-T13
description: "Validar a rejeição de requisições de rollback quando a versão alvo K solicitada não existir no histórico do material, retornando HTTP 404 Not Found."
preconditions:
  - "O material possui apenas 2 versões registradas (v1 e v2)."
  - "O usuário possui permissão de rollback."
estimated_time: 4.0 min
tags:
  - content
  - rollback
  - 404_not_found
  - validation
  - exception_path
test_type: Functional
status: To Be Automated
folder: /Conteudo/Rollback
---
# Test Case: DW-T13

## Test Steps

### Step1

- **Description**: Enviar requisição POST de rollback informando um número de versão K inexistente
- **Test data**:
  - target_version_num = 99
  - Endpoint: /api/v1/content/materials/11111111-1111-1111-1111-111111111111/rollback
- **Expected result**:
  - A requisição atinge o backend de conteúdo.

### Step2

- **Description**: Validar a busca do GitLikeService na tabela 'conteudo.material_versoes'
- **Test data**: None
- **Expected result**:
  - O sistema deve verificar a inexistência da versão 99 para o material.
  - A API deve responder com status HTTP 404 Not Found e mensagem 'Versão alvo não existe'.
  - Nenhuma nova versão deve ser criada e nenhum evento publicado no RabbitMQ.
