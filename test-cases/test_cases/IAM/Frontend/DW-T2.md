---
type: test_case
title: "Navegação e Renderização da Página de Registro"
key: DW-T2
description: "Validar que um visitante não autenticado consegue navegar até a página de registro e visualizar todos os campos do formulário."
preconditions:
  - "O frontend SPA está carregado no navegador."
  - "O visitante não possui sessão ativa."
estimated_time: 3.0 min
tags:
  - frontend
  - navigation
  - register_page
  - alternative_path
test_type: Functional
status: To Be Automated
folder: /IAM/Frontend
---
# Test Case: DW-T2

## Test Steps

### Step1

- **Description**: Acessar a aplicação Docs-Wiki na página inicial
- **Test data**: None
- **Expected result**:
  - A interface da HomePage deve ser carregada exibindo a barra de navegação com a opção de registrar conta.

### Step2

- **Description**: Clicar na opção 'Cadastrar' ou navegar diretamente para a rota '/register'
- **Test data**: URL /register
- **Expected result**:
  - O componente 'RegisterPage' deve ser renderizado com sucesso.
  - Os campos de entrada 'nome', 'email' e 'password' devem estar visíveis e habilitados.
  - O botão de submissão do formulário de cadastro deve estar visível e acessível.
