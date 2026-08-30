---
type: test_case
title: "Busca Híbrida Ponderada com Síntese Executiva Gerada por IA (Gemini)"
key: DW-T20
description: "Validar a execução de busca híbrida ponderada (0.3 BM25 + 0.7 pgvector) com recuperação dos top 4 chunks e sintetização executiva em linguagem natural através da API Google Gemini quando summarize=true."
preconditions:
  - "O cluster PostgreSQL possui documentos indexados com pgvector e a chave da Gemini API está configurada."
  - "O cache Redis está ativo."
estimated_time: 5.0 min
tags:
  - search
  - hybrid_search
  - gemini
  - ai_summary
  - pgvector
  - bm25
  - happy_path
test_type: Functional
status: To Be Automated
folder: /Busca/Hibrida
---
# Test Case: DW-T20

## Test Steps

### Step1

- **Description**: Enviar requisição GET para '/api/v1/search' com termo de busca e flag 'summarize=true'
- **Test data**: URL: /api/v1/search?q=arquitetura+microservicos&summarize=true
- **Expected result**:
  - A API intercepta a requisição com taxa dentro do limite de 20r/s.

### Step2

- **Description**: Gerar vetor da query e executar as CTEs de busca híbrida no PostgreSQL
- **Test data**: None
- **Expected result**:
  - A query de 768 dimensões é gerada e salva no cache Redis ('emb:sha256').
  - O PostgreSQL executa BM25 (tsvector) e pgvector Cosine Distance calculando o score composto: 0.3 * BM25 + 0.7 * Vetor.
  - Os top 4 chunks mais relevantes são selecionados.

### Step3

- **Description**: Invocar a API do Google Gemini e renderizar a resposta na interface
- **Test data**: Prompt de sintetização contextual (temperatura 0.3)
- **Expected result**:
  - A Gemini API gera uma síntese executiva clara com base estrita no contexto dos chunks.
  - A API retorna status HTTP 200 OK com os resultados ranqueados e a síntese no campo 'ai_summary'.
  - O frontend SPA renderiza os DocumentCards, badges de score e o box destacado da IA.
