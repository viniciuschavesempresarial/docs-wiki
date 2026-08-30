---
type: test_case
title: "Alerta de Seleção Obrigatória de Documento no Painel Lateral"
key: DW-T25
description: "Garantir que o frontend impeça o envio de perguntas no chat quando nenhum documento técnico estiver marcado no DocumentSelector, exibindo alerta contextual e mantendo o foco no seletor."
preconditions:
  - "O usuário está autenticado e acessou a tela de chat (/ai-chat)."
  - "Nenhum documento está marcado na lista de seleção lateral."
estimated_time: 3.0 min
tags:
  - chat
  - validacao
  - document_selector
  - alerta
  - alternative_path
test_type: Functional
status: To Be Automated
folder: /Chat/Validacao
---
# Test Case: DW-T25

## Test Steps

### Step1

- **Description**: Acessar a interface de chat em '/ai-chat' com todos os checkboxes de documentos desmarcados
- **Test data**: None
- **Expected result**:
  - A interface exibe a lista de materiais sem nenhum item ativo.

### Step2

- **Description**: Digitar uma dúvida na barra de entrada e clicar no botão de enviar (ou pressionar Enter)
- **Test data**: Texto: "Quais são as diretrizes de segurança?"
- **Expected result**:
  - O sistema bloqueia o disparo da requisição de rede.
  - A mensagem 'Alerta: Selecione ao menos um documento no painel lateral' é exibida na tela.
  - O foco de navegação é direcionado para a lista de documentos no painel lateral.
