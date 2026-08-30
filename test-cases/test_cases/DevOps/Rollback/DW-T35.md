---
type: test_case
title: "Recuperação Automática com Rollback para Última Tag LTS Estável em Falha de Testes"
key: DW-T35
description: "Garantir a autorrecuperação e resiliência da infraestrutura acionando o job de rollback automático quando ocorrer quebra de testes ou compilação, restaurando a última versão estável ($LATEST_LTS) com zero downtime."
preconditions:
  - "O repositório possui ao menos uma tag LTS prévia estável anotada no Git."
  - "A branch 'staging' recebe alterações que introduzem regressões na suíte de testes automatizados."
estimated_time: 8.0 min
tags:
  - devops
  - rollback
  - lts
  - github_actions
  - docker_compose
  - exception_path
test_type: Non-Functional
status: Automated
folder: /DevOps/Rollback
---
# Test Case: DW-T35

## Test Steps

### Step1

- **Description**: Submeter commit contendo regressão funcional para a branch 'staging' disparando o pipeline
- **Test data**: Commit com teste quebrado ou erro de tipagem no backend
- **Expected result**:
  - O runner inicia a esteira 'build-test-deploy'.

### Step2

- **Description**: Interceptar a falha na suíte de testes automatizados
- **Test data**: None
- **Expected result**:
  - A execução de testes Jest ou RTL falha, impedindo a continuidade do fluxo de deploy principal.
  - A condição 'Build & Testes Passaram?' é avaliada como 'Não (Falha)'.

### Step3

- **Description**: Disparar o Job 3 de Rollback Automático e restaurar a versão LTS
- **Test data**: None
- **Expected result**:
  - O workflow aciona o job 'rollback automático'.
  - O runner busca as tags de release LTS remotas e executa 'git checkout $LATEST_LTS'.
  - É executado 'npm ci & npm run build' no código estável anterior.
  - O comando 'docker compose up -d' recria os containers na versão estável.
  - O status da recuperação é finalizado com '🔄 Rollback Concluído'.
