---
type: test_case
title: "Busca Híbrida Ponderada com Resultados Ranqueados sem Sumarização"
key: DW-T23
description: "Validar a execução de busca híbrida ponderada com ordenação de relevância composta (BM25 + Vetor) e omissão de chamada à API do Gemini quando summarize=false."
preconditions:
  - "O PostgreSQL possui materiais indexados e o usuário pesquisa com o parâmetro 'summarize=false' ou omitido."
estimated_time: 4.0 min
tags:
  - search
  - hybrid_search
  - bm25
  - pgvector
  - no_summary
  - alternative_path
test_type: Functional
status: To Be Automated
folder: /Busca/Hibrida
---
# Test Case: DW-T23

## Test Steps

### Step1

- **Description**: Realizar requisição GET de busca com termo textual e 'summarize=false'
- **Test data**: URL: /api/v1/search?q=autenticacao+jwt&summarize=false
- **Expected result**:
  - A API processa a consulta respeitando a cota de 20r/s.

### Step2

- **Description**: Executar a consulta híbrida composta no PostgreSQL
- **Test data**: None
- **Expected result**:
  - O banco calcula o score híbrido ponderado: 0.3 * BM25 + 0.7 * Vetorial.
  - Os materiais são ordenados decrescentemente pela relevância final.

### Step3

- **Description**: Validar que a síntese de IA não foi disparada e confirmar payload de retorno
- **Test data**: None
- **Expected result**:
  - Nenhuma chamada HTTP externa é emitida para a API do Google Gemini.
  - A API retorna status HTTP 200 OK contendo os itens ranqueados e 'ai_summary = null'.
  - A interface exibe a lista com badges de relevância sem o box de IA.
