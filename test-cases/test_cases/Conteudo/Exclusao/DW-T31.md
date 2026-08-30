---
type: test_case
title: "Exclusão de Material por Administrador com Cascata em Versões e Evento RabbitMQ"
key: DW-T31
description: "Validar o fluxo síncrono de exclusão de material técnico por administrador na EditorPage, com confirmação em modal, DELETE com FK CASCADE em material_versoes, publicação de evento material.excluido no RabbitMQ e redirecionamento de tela."
preconditions:
  - "O usuário está autenticado com papel 'ADMIN'."
  - "O material técnico existe na base e possui versões associadas."
estimated_time: 5.0 min
tags:
  - conteudo
  - exclusao
  - cascade
  - rabbitmq
  - material_excluido
  - admin
  - happy_path
test_type: Functional
status: To Be Automated
folder: /Conteudo/Exclusao
---
# Test Case: DW-T31

## Test Steps

### Step1

- **Description**: Na EditorPage com perfil ADMIN, clicar no botão 'Excluir Material'
- **Test data**: None
- **Expected result**:
  - O sistema exibe o modal de confirmação advertindo sobre a remoção do histórico Git-like, expurgo de vetores HNSW e remoção da busca.

### Step2

- **Description**: Confirmar a operação clicando em 'Confirmar Exclusão' no modal
- **Test data**: None
- **Expected result**:
  - A requisição 'DELETE /api/v1/content/materials/:id' é enviada ao backend.

### Step3

- **Description**: Processar a exclusão no banco PostgreSQL e publicar evento de mensageria
- **Test data**: None
- **Expected result**:
  - O registro é removido da tabela 'conteudo.materiais' com propagação em cascata (FK CASCADE) para todas as entradas em 'conteudo.material_versoes'.
  - A mensagem de evento 'material.excluido' com o { material_id } é publicada na exchange do RabbitMQ.
  - A API retorna status HTTP 200 OK.
  - O frontend invalida as consultas do React Query e redireciona o usuário para a página inicial ('/').
