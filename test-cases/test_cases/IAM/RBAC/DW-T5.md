---
type: test_case
title: "Bloqueio de Acesso RBAC para Perfil sem Permissão"
key: DW-T5
description: "Garantir que usuários com perfil 'LEITOR' sejam bloqueados ao tentar acessar áreas restritas (/editor e /admin), retornando HTTP 403 Forbidden."
preconditions:
  - "O usuário possui uma conta ativa e está autenticado com o perfil 'LEITOR'."
estimated_time: 4.0 min
tags:
  - iam
  - rbac
  - 403_forbidden
  - auth_guard
  - alternative_path
test_type: Functional
status: To Be Automated
folder: /IAM/RBAC
---
# Test Case: DW-T5

## Test Steps

### Step1

- **Description**: Autenticar no sistema com usuário de perfil 'LEITOR'
- **Test data**:
  - email: "leitor@docswiki.local"
  - password: "LeitorPassword123"
- **Expected result**:
  - O login deve ser realizado com sucesso e o usuário direcionado para a HomePage do Catálogo.

### Step2

- **Description**: Tentar navegar diretamente pela barra de endereços para a rota de administração '/admin' ou do editor '/editor'
- **Test data**: URL /admin ou /editor
- **Expected result**:
  - O componente 'AuthGuard' deve identificar a ausência das permissões necessárias ('admin:all' / 'materials:create').
  - A aplicação deve bloquear a renderização e exibir a tela de 'Acesso Negado' (HTTP 403 Forbidden).
