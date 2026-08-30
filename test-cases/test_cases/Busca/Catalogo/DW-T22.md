---
type: test_case
title: "Navegação e Listagem Paginada sem Termo de Busca (Modo Catálogo)"
key: DW-T22
description: "Validar a listagem padrão de materiais do catálogo quando nenhum termo de busca 'q' for fornecido, retornando documentos ordenados por data de atualização com scores neutros e ai_summary nulo."
preconditions:
  - "Existem materiais publicados no catálogo técnico da plataforma."
estimated_time: 4.0 min
tags:
  - search
  - catalog
  - navigation
  - pagination
  - empty_query
  - alternative_path
test_type: Functional
status: To Be Automated
folder: /Busca/Catalogo
---
# Test Case: DW-T22

## Test Steps

### Step1

- **Description**: Acessar a tela inicial do catálogo ou efetuar GET em '/api/v1/search' sem o parâmetro 'q'
- **Test data**: URL: /api/v1/search?page=1&limit=10
- **Expected result**:
  - A API detecta a ausência do parâmetro 'q' de busca textual.

### Step2

- **Description**: Executar consulta de listagem paginada direta na tabela 'indices_busca'
- **Test data**: None
- **Expected result**:
  - O PostgreSQL busca os documentos ordenados pela coluna 'updated_at' de forma decrescente.
  - Não é gerado nenhum vetor de query e o modelo de ML não é acionado.

### Step3

- **Description**: Validar a resposta estruturada e renderização na interface
- **Test data**: None
- **Expected result**:
  - A API responde com status HTTP 200 OK contendo os campos 'text_score = 0', 'vector_score = 0', 'hybrid_score = 1.0' e 'ai_summary = null'.
  - A interface renderiza a grade de materiais do catálogo com paginação habilitada.
