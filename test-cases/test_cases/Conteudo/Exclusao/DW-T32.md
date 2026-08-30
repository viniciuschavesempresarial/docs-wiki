---
type: test_case
title: "Cancelamento de Exclusão de Material no Modal de Advertência"
key: DW-T32
description: "Garantir que a operação de exclusão seja cancelada com segurança quando o usuário clicar no botão 'Cancelar' no modal, fechando o diálogo e preservando o material e seus históricos intactos."
preconditions:
  - "O modal de confirmação de exclusão do material está visível na tela."
estimated_time: 3.0 min
tags:
  - conteudo
  - exclusao
  - modal_cancelar
  - rollback_ui
  - alternative_path
test_type: Functional
status: To Be Automated
folder: /Conteudo/Exclusao
---
# Test Case: DW-T32

## Test Steps

### Step1

- **Description**: Clicar no botão 'Excluir Material' na EditorPage para abrir o diálogo de confirmação
- **Test data**: None
- **Expected result**:
  - O modal de advertência destrutiva é exibido sobrepondo a interface.

### Step2

- **Description**: Clicar no botão 'Cancelar' ou pressionar 'Esc' para fechar o diálogo
- **Test data**: None
- **Expected result**:
  - O modal é imediatamente fechado sem disparar requisições HTTP de exclusão.
  - O material e todas as suas versões permanecem inalterados no banco de dados e acessíveis na interface.
