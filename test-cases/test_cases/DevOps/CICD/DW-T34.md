---
type: test_case
title: "Esteira Completa de CI/CD com Sucesso nos Testes e Criação de Tag LTS"
key: DW-T34
description: "Validar a execução íntegra do pipeline de entrega contínua no runner Self-Hosted do GitHub Actions com injeção de segredos, build dos workspaces, validação Docker Compose, 88 testes Jest, 19 testes RTL, deploy dos containers e publicação automatizada de tag anotada LTS."
preconditions:
  - "O runner self-hosted está ativo e operacional."
  - "O código enviado para a branch 'staging' atende a todos os critérios de qualidade e linters."
estimated_time: 10.0 min
tags:
  - devops
  - cicd
  - github_actions
  - lts
  - docker_compose
  - happy_path
test_type: Non-Functional
status: Automated
folder: /DevOps/CICD
---
# Test Case: DW-T34

## Test Steps

### Step1

- **Description**: Realizar o disparo do pipeline através de push na branch 'staging'
- **Test data**: Comando: git push origin staging
- **Expected result**:
  - O workflow 'build-test-deploy' é iniciado no GitHub Actions Self-Hosted Runner.

### Step2

- **Description**: Executar as etapas de injeção de segredos, compilação e validação estática
- **Test data**: None
- **Expected result**:
  - O arquivo de variáveis de ambiente '.env' é injetado com segurança.
  - O comando 'npm ci & npm run build' compila todos os workspaces sem erros.
  - O comando 'docker compose config' valida a sintaxe dos manifestos de container.

### Step3

- **Description**: Executar suítes de testes automatizados unitários e de integração
- **Test data**: None
- **Expected result**:
  - Os 88 testes Jest do backend são executados com 100% de aprovação.
  - Os 19 testes RTL do frontend são executados com 100% de aprovação.

### Step4

- **Description**: Gerar certificados SSL e realizar o provisionamento dos containers
- **Test data**: None
- **Expected result**:
  - Os certificados TLS locais são gerados/renovados no diretório 'certs/'.
  - O comando 'docker compose up -d' provisiona e inicializa todos os microsserviços.

### Step5

- **Description**: Criar e publicar a tag de versão anotada LTS no repositório Git
- **Test data**: Tag format: v1.0.{run}-lts-{date}
- **Expected result**:
  - O job 'tag-lts' calcula a versão, executa 'git tag -a' e faz o push da tag para a origin.
  - A esteira conclui com status '✅ Deploy LTS Concluído'.
