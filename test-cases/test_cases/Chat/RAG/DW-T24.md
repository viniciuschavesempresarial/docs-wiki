---
type: test_case
title: "Chat RAG Contextual com Grounding Estrito no Gemini e Badges de Citação"
key: DW-T24
description: "Validar a execução completa do pipeline de Chat RAG contextual com recuperação dos top 8 chunks no pgvector, sintetização fundamentada no Google Gemini (temperatura 0.2), sanitização DOMPurify e renderização dos badges de citação."
preconditions:
  - "O usuário selecionou 1+ documentos técnicos no painel lateral."
  - "O banco de dados PostgreSQL pgvector contém os chunks correspondentes indexados."
estimated_time: 5.0 min
tags:
  - chat
  - rag
  - grounding
  - gemini
  - pgvector
  - dompurify
  - happy_path
test_type: Functional
status: To Be Automated
folder: /Chat/RAG
---
# Test Case: DW-T24

## Test Steps

### Step1

- **Description**: Selecionar documentos técnicos no DocumentSelector e submeter uma pergunta via POST em '/api/v1/search/chat'
- **Test data**: Payload: { "query": "Como funciona o versionamento OCC?", "material_ids": ["mat-001", "mat-002"] }
- **Expected result**:
  - A requisição é enviada ao serviço backend com os identificadores selecionados.

### Step2

- **Description**: Vetorizar a pergunta e buscar os chunks mais similares no pgvector
- **Test data**: None
- **Expected result**:
  - O 'queryEmbedderService' gera o vetor denso de 768 dimensões.
  - A query SQL recupera os top 8 chunks mais próximos filtrados pelos IDs selecionados (material_id IN selected_ids).

### Step3

- **Description**: Montar prompt de Grounding e chamar a API do Google Gemini
- **Test data**: Prompt com blocos [Doc: X - Seção: Y] e instrução de aterramento sem alucinações (temperatura 0.2, topP 0.8)
- **Expected result**:
  - O Gemini gera a resposta baseada estritamente nos trechos fornecidos.
  - O backend retorna status HTTP 200 OK com os campos 'answer' e o array 'sources' com metadados de citação.

### Step4

- **Description**: Sanitizar conteúdo e renderizar a resposta na interface do usuário
- **Test data**: None
- **Expected result**:
  - O frontend processa a resposta através do DOMPurify prevenindo injeções de script (XSS).
  - O texto fundamentado é renderizado acompanhado dos badges interativos de citação das seções de origem.
