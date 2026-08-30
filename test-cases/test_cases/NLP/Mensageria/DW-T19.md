---
type: test_case
title: "Descarte e NACK de Mensagem com JSON Corrompido ou Payload Inválido"
key: DW-T19
description: "Garantir que mensagens corrompidas ou com JSON malformado sejam rejeitadas com channel.nack(msg, false, false) sem reenfileiramento para evitar poison messages."
preconditions:
  - "A fila 'nlp.processamento' recebe uma mensagem com payload malformado."
estimated_time: 4.0 min
tags:
  - nlp
  - rabbitmq
  - poison_message
  - nack
  - discard
  - exception_path
test_type: Functional
status: To Be Automated
folder: /NLP/Mensageria
---
# Test Case: DW-T19

## Test Steps

### Step1

- **Description**: Injetar na fila 'nlp.processamento' uma mensagem com corpo corrompido (ex: JSON incompleto ou string truncada)
- **Test data**: Payload: "{ \"evento\": \"material.criado\", \"incompleto"
- **Expected result**:
  - O daemon do nlp-service consome o payload para validação.

### Step2

- **Description**: Interceptar o erro de parsing durante a desserialização do JSON
- **Test data**: None
- **Expected result**:
  - A rotina de validação falha ao tentar executar 'JSON.parse'.
  - O worker captura a exceção sem quebrar a execução do processo Node.js.

### Step3

- **Description**: Rejeitar a mensagem sem reenfileirar e registrar log de erro
- **Test data**: None
- **Expected result**:
  - O worker dispara 'channel.nack(msg, false, false)' para descartar a mensagem definitivamente.
  - A mensagem não retorna para a fila do RabbitMQ.
  - Um registro de log estruturado com severidade ERROR é gravado pelo logger.
