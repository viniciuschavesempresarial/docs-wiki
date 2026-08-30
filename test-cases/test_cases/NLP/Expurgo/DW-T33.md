---
type: test_case
title: "Consumo Assíncrono de Expurgo de Índices e Chunks Vetoriais no nlp-service"
key: DW-T33
description: "Validar o processamento assíncrono pelo worker nlp-service ao consumir o evento material.excluido, executando DELETE em busca.indices_busca, acionando a remoção em cascata dos vetores HNSW em material_chunks e confirmando via channel.ack."
preconditions:
  - "A mensagem de evento 'material.excluido' foi publicada na fila 'nlp.processamento' do RabbitMQ."
  - "Existem registros de índices e chunks persistidos no PostgreSQL para o material."
estimated_time: 4.0 min
tags:
  - nlp
  - expurgo
  - material_chunks
  - hnsw
  - cascade
  - rabbitmq
  - ack
  - alternative_path
test_type: Functional
status: To Be Automated
folder: /NLP/Expurgo
---
# Test Case: DW-T33

## Test Steps

### Step1

- **Description**: Publicar mensagem de evento 'material.excluido' na fila 'nlp.processamento'
- **Test data**: Payload contendo { "material_id": "<id_do_material_excluido>" }
- **Expected result**:
  - O daemon do nlp-service consome o evento da fila com sucesso.

### Step2

- **Description**: Executar a limpeza na tabela 'busca.indices_busca' e validar a cascata vetorial
- **Test data**: None
- **Expected result**:
  - O worker executa o comando SQL 'DELETE FROM busca.indices_busca WHERE material_id = :id'.
  - A restrição de chave estrangeira com ON DELETE CASCADE remove automaticamente todos os vetores correspondentes na tabela 'material_chunks'.

### Step3

- **Description**: Confirmar a mensagem no RabbitMQ e verificar o encerramento do ciclo
- **Test data**: None
- **Expected result**:
  - O worker dispara 'channel.ack(msg)' confirmando o consumo definitivo.
  - Nenhum vetor residual ou registro órfão permanece nas tabelas de busca e chunks.
