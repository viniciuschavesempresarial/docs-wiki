---
type: test_case
title: "Criação Bem-Sucedida de Novo Material no Padrão OKF"
key: DW-T11
description: "Validar a criação de novo material técnico no padrão OKF com cálculo de hash SHA-256, gravação da versão inicial e disparo do evento material.criado via RabbitMQ."
preconditions:
  - "O usuário está autenticado com a role 'EDITOR' (permissão materials:create)."
  - "O slug 'guia-arquitetura' não existe previamente no banco."
estimated_time: 5.0 min
tags:
  - content
  - create
  - okf
  - zod
  - sha256
  - amqp
  - happy_path
test_type: Functional
status: To Be Automated
folder: /Conteudo/Criacao
---
# Test Case: DW-T11

## Test Steps

### Step1

- **Description**: Acessar a tela de criação de materiais na rota '/editor'
- **Test data**: URL /editor
- **Expected result**:
  - O editor de texto com suporte a Markdown e painel de frontmatter deve ser renderizado.

### Step2

- **Description**: Preencher o frontmatter YAML com metadados válidos e inserir o conteúdo do documento
- **Test data**:
  - slug: "guia-arquitetura"
  - title: "Guia de Arquitetura Limpa"
  - author: "Tech Lead"
  - tags: ["arquitetura", "backend"]
- **Expected result**:
  - A validação Zod client-side deve aprovar os metadados.

### Step3

- **Description**: Submeter a criação enviando a requisição POST para '/api/v1/content/materials'
- **Test data**: None
- **Expected result**:
  - A transação PostgreSQL deve calcular o SHA-256, inserir o material em 'conteudo.materiais' e a versão 1 em 'conteudo.material_versoes'.
  - O campo 'versao_head_id' deve ser atualizado para apontar para a versão 1.
  - O evento 'material.criado' deve ser publicado no RabbitMQ.
  - A API deve retornar HTTP 201 Created.
