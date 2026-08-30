---
type: test_case
title: "Execução de Teste de Carga Sintética com Coleta de Métricas e Aprovação de SLAs"
key: DW-T36
description: "Validar a execução de testes de carga distribuídos via k6 a partir do Nó isolado, ingestão contínua de métricas no VictoriaMetrics via Telegraf e logs no Loki via Promtail, com visualização em dashboards Grafana e validação de conformidade de SLAs."
preconditions:
  - "A stack de observabilidade (Telegraf, VictoriaMetrics, Promtail, Loki e Grafana) está ativa."
  - "O gerador de carga k6 está provisionado em nó isolado da aplicação."
estimated_time: 90.0 min
tags:
  - performance
  - k6
  - telegraf
  - victoriametrics
  - loki
  - grafana
  - happy_path
test_type: Non-Functional
status: To Be Automated
folder: /Performance/Observabilidade
---
# Test Case: DW-T36

## Test Steps

### Step1

- **Description**: Iniciar script de teste de carga k6 injetando tráfego contínuo nas portas HTTP 80 / HTTPS 443 do NGINX Gateway
- **Test data**: Carga: 100 VUs com rampa de subida de 5 minutos
- **Expected result**:
  - O gateway recebe as conexões e distribui o tráfego entre os microsserviços (iam-service, content-service, search-service).

### Step2

- **Description**: Verificar a telemetria em tempo real no Telegraf e VictoriaMetrics
- **Test data**: None
- **Expected result**:
  - O Telegraf Agent coleta métricas de CPU, memória e rede dos containers a cada 2 segundos com buffer local de 10.000 pontos.
  - O VictoriaMetrics TSDB ingere as métricas via protocolo Influx Line no endpoint HTTP POST :8428.

### Step3

- **Description**: Verificar a centralização de logs estruturados no Promtail e Loki
- **Test data**: None
- **Expected result**:
  - O Promtail coleta os streams de stdout/stderr com rotação de 15MB e envia via HTTP POST :3100 ao Grafana Loki.
  - Os logs ficam indexados e pesquisáveis via LogQL.

### Step4

- **Description**: Analisar os dashboards do Grafana e homologar os critérios de performance
- **Test data**: None
- **Expected result**:
  - O Grafana Dashboard (:3000) apresenta Throughput estável, latência p95 abaixo do threshold contratual e taxa de erro < 0.1%.
  - A decisão 'Critérios e Resultados Adequados?' é avaliada como 'SIM'.
  - O teste é concluído com aprovação formal do relatório de desempenho.
