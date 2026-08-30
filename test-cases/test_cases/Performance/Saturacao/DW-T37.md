---
type: test_case
title: "Detecção de Degradação de Performance e Análise de Gargalo"
key: DW-T37
description: "Garantir que a violação de SLAs não-funcionais (como aumento excessivo de latência p99, saturação de memória ou taxas de erro HTTP 5xx) seja identificada na avaliação comparativa e resulte na abertura de issue de erro de performance."
preconditions:
  - "A stack de observabilidade (Telegraf, VictoriaMetrics, Promtail, Loki e Grafana) está ativa."
  - "O gerador de carga k6 está provisionado em nó isolado da aplicação."
  - "O pipeline de testes de estresse k6 está em execução com volume de requisições que excede a capacidade planejada ou simula gargalo no banco PostgreSQL."
estimated_time: 30.0 min
tags:
  - performance
  - degradacao
  - k6
  - telegraf
  - victoriametrics
  - loki
  - grafana
  - exception_path
test_type: Non-Functional
status: To Be Automated
folder: /Performance/Saturacao
---
# Test Case: DW-T37

## Test Steps

### Step1

- **Description**: Executar teste de estresse elevando a concorrência de usuários simultâneos além do limite operacional
- **Test data**: Carga: 500 VUs com queries pesadas de busca semântica HNSW
- **Expected result**:
  - Os serviços acusam aumento de latência e consumo elevado de recursos.

### Step2

- **Description**: Monitorar os indicadores de saturação nos painéis Grafana
- **Test data**: None
- **Expected result**:
  - O painel indica que a latência p99 ultrapassou o limite máximo estipulado (ex: > 1500ms) e taxa de erros 504 Gateway Timeout aumentou.

### Step3

- **Description**: Processar a etapa de avaliação comparativa de resultados
- **Test data**: None
- **Expected result**:
  - A decisão 'Critérios e Resultados Adequados?' é avaliada como 'NÃO'.
    - Registrar Issue de não-conformidade de desempenho
    - O sistema registra uma Issue de erro de performance anexando snapshot do Grafana, métricas do VictoriaMetrics e stack traces extraídos do Loki para diagnóstico de engenharia.
  - A decisão 'Critérios e Resultados Adequados?' é avaliada como 'SIM'.
    - O teste é concluído com aprovação formal do relatório de desempenho.
