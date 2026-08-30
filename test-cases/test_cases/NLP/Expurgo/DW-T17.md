---
type: test_case
title: "Expurgo em Cascata de Índices e Chunks Vetoriais em Material Excluído"
key: DW-T17
description: "Garantir a limpeza atômica em cascata dos índices de busca e chunks vetoriais quando o evento assíncrono 'material.excluido' for processado pelo worker."
preconditions:
  - "Existem registros de índices e chunks persistidos no banco para o material sob exclusão."
estimated_time: 4.0 min
tags:
  - nlp
  - expurgo
  - material_excluido
  - cascade
  - ack
  - alternative_path
test_type: Functional
status: To Be Automated
folder: /NLP/Expurgo
---
# Test Case: DW-T17

## Test Steps

### Step1

- **Description**: Publicar mensagem de evento 'material.excluido' na fila 'nlp.processamento' com o identificador do material
- **Test data**: Payload com material_id sob exclusão
- **Expected result**:
  - O nlp-service consome o evento da fila do RabbitMQ.

### Step2

- **Description**: Validar o comando DELETE na tabela de índices e a propagação em cascata
- **Test data**: None
- **Expected result**:
  - O worker executa DELETE em 'busca.indices_busca'.
  - A restrição de integridade referencial com ON DELETE CASCADE remove automaticamente todos os registros associados em 'material_chunks'.

### Step3

- **Description**: Emitir confirmação de mensagem e notificação de enriquecimento/expurgo
- **Test data**: None
- **Expected result**:
  - O worker executa 'channel.ack(msg)'.
  - O evento 'material.enriquecido' é publicado informando a remoção total do índice sem inconsistências residuais.
