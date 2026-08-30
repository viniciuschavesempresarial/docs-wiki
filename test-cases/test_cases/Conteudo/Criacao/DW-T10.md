---
type: test_case
title: "Rejeição de Criação de Material por Slug Duplicado"
key: DW-T10
description: "Garantir que a tentativa de cadastrar um novo material com um slug já existente seja interceptada e rejeitada com HTTP 400 Bad Request."
preconditions:
  - "Já existe um material registrado com o slug 'manual-devops' na base de dados."
  - "O usuário está autenticado com perfil de editor."
estimated_time: 4.0 min
tags:
  - content
  - create
  - slug_conflict
  - validation
  - alternative_path
test_type: Functional
status: To Be Automated
folder: /Conteudo/Criacao
---
# Test Case: DW-T10

## Test Steps

### Step1

- **Description**: Acessar o formulário de criação de materiais na rota '/editor'
- **Test data**: URL /editor
- **Expected result**:
  - O editor de materiais OKF deve ser renderizado com campos de metadados e corpo.

### Step2

- **Description**: Informar no frontmatter o slug duplicado 'manual-devops' e preencher os demais campos obrigatórios
- **Test data**:
  - slug: "manual-devops"
  - title: "Novo Manual DevOps Duplicado"
  - author: "Editor Teste"
- **Expected result**:
  - Os campos devem aceitar a digitação normalmente.

### Step3

- **Description**: Submeter a criação clicando em 'Salvar' (POST /api/v1/content/materials)
- **Test data**: None
- **Expected result**:
  - A API deve validar a unicidade do slug e responder com status HTTP 400 Bad Request.
  - A interface deve exibir a mensagem de erro 'Slug já existente'.
  - Nenhum registro deve ser inserido no banco de dados.
