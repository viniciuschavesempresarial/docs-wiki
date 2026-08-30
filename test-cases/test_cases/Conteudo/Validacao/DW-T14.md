---
type: test_case
title: "Rejeição de Criação por Sintaxe YAML ou Frontmatter Zod Inválido"
key: DW-T14
description: "Garantir que submissões com blocos YAML malformados ou campos de metadados inválidos sejam interceptadas pelo parser e rejeitadas com HTTP 400 Bad Request."
preconditions:
  - "O endpoint 'POST /api/v1/content/materials' conta com middleware de validação gray-matter e Zod."
estimated_time: 4.0 min
tags:
  - content
  - validation
  - yaml_syntax
  - zod_error
  - 400_bad_request
  - exception_path
test_type: Functional
status: To Be Automated
folder: /Conteudo/Validacao
---
# Test Case: DW-T14

## Test Steps

### Step1

- **Description**: Acessar a tela do editor de materiais na rota '/editor'
- **Test data**: URL /editor
- **Expected result**:
  - O editor de texto deve ser carregado com suporte a sintaxe Markdown.

### Step2

- **Description**: Preencher o documento inserindo um bloco YAML com sintaxe inválida (ex: tabs indevidas ou ausência de delimitador de fechamento)
- **Test data**:
  - Bloco inválido: "---\ntitle: Exemplo Incompleto\n\ttag_com_tab_invalida: [123\n"
- **Expected result**:
  - O editor aceita a digitação do texto para validação no backend.

### Step3

- **Description**: Submeter a requisição POST para '/api/v1/content/materials'
- **Test data**: None
- **Expected result**:
  - O parser gray-matter e o validador Zod devem interceptar o payload corrompido.
  - A API deve retornar status HTTP 400 Bad Request com o array descritivo dos erros de validação.
  - O fluxo deve ser abortado sem gravação de registros no PostgreSQL.
