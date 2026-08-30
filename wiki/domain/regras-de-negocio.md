---
id: "DOM-RULES-002"
type: "domain"
title: "Regras de Negócio e Políticas de Domínio"
description: "Catálogo exaustivo de regras de validação, integridade, autorização e concorrência otimista da plataforma Docs-Wiki."
domain: "dominio_central"
status: "active"
tech_stack:
  - typescript
  - zod
  - postgresql
tags:
  - business_rules
  - occ
  - sha256
  - validation
related_files:
  - "../packages/shared/src/dtos/material.dto.ts"
  - "../services/content/src/services/gitLike.service.ts"
  - "../services/iam/src/services/userService.ts"
owner: "time_produto_arquitetura"
created_at: "2026-08-30"
updated_at: "2026-08-30"
---

# DOM-RULES-002: Regras de Negócio e Políticas de Domínio

> **Resumo Executivo:** Documenta as regras rígidas de validação sintática OKF, concorrência otimista, RBAC e proteção de dados implementadas no código.

## 🎯 Visão Geral
Este documento lista as regras mandatórias do sistema que asseguram a consistência dos dados, a segurança contra edições concorrentes conflitantes e a integridade do grafo documental.

---

## 📐 Detalhes Técnicos e Contratos

### Matriz de Regras e Restrições de Domínio

| Domínio / Entidade | Regra / Restrição | Implementação / Validação | Tratamento de Erro |
| :--- | :--- | :--- | :--- |
| **Frontmatter OKF** | Delimitador obrigatório `---` no início e fim do cabeçalho YAML. | `gray-matter` + `parseOKF()` | `HTTP 400 Bad Request` |
| **Slug do Material** | Mínimo 3 caracteres, exclusivo por material, apenas minúsculas, números e hífens (`^[a-z0-9-]+$`). | `OKFFrontmatterSchema` (Zod) + Unique Constraint no banco | `HTTP 400` (slug inválido/duplicado) |
| **Campos Obrigatórios OKF** | `title` (min 3), `type` (min 2), `category` (min 2), `author` (min 2). | Validação Zod estrita no backend | `HTTP 400` com array de erros |
| **Concorrência Git-Like** | `parent_version_id` enviado deve coincidir exatamente com o `versao_head_id` do material. | `SELECT FOR UPDATE` + verificação no `GitLikeService` | `HTTP 409 Conflict` |
| **Integridade de Commit** | Toda versão gera um hash determinístico SHA-256 de todo o conteúdo OKF. | `calculateSHA256(conteudo_okf)` | Imutabilidade garantida |
| **Rollback Não-Destrutivo** | A reversão para a versão K cria uma nova versão `MAX + 1` com o conteúdo de K. | `GitLikeService.rollbackVersion()` | Histórico linear mantido |
| **Super Usuário Protegido** | Usuários com `is_system_protected = TRUE` não podem ser excluídos ou desativados. | `UserService.deleteUser()` | `HTTP 403 Forbidden` |
| **Perfil Mínimo de Usuário** | Nenhum usuário pode ficar sem papéis; se todos forem desmarcados, assume `LEITOR`. | `UserService.updateRoles()` | Fallback automático |
| **Prevenção de Auto-Bloqueio** | Um administrador logado não pode revogar sua própria role `ADMIN` nem se auto-excluir. | `UsersManagementPage` + Backend | Bloqueio na UI e `HTTP 403` |
| **Políticas de Senha IAM** | Senha deve conter no mínimo 8 caracteres, pelo menos 1 letra e pelo menos 1 número. | Regex Zod `^(?=.*[A-Za-z])(?=.*\d).{8,}$` | `HTTP 400 Bad Request` |
| **Isolamento de Cookies** | O token JWT é transmitido estritamente em cookies `HttpOnly`, `SameSite=Lax` e `Secure` (em HTTPS). | Express `res.cookie()` | Prevenção contra ataques XSS |

---

## 🧪 Estratégia de Teste e Validação
* **Testes de Concorrência:** Simulação de commits concorrentes em `services/content/test/concurrency.test.ts`.
* **Testes de Integridade OKF:** Testes com payloads malformados em `services/content/test/material.routes.test.ts`.

---

## 📚 Citations
[1] [NIST Special Publication 800-63B: Digital Identity Guidelines](https://pages.nist.gov/800-63-3/sp800-63b.html)  
[2] [OWASP Top 10 API Security Risks: Broken Object Level Authorization](https://owasp.org/API-Security/editions/2023/en/0xaa-prologue/)  

---

## 🔗 Conexões no Grafo (Dependências)
* **Visão do Domínio:** [Overview do Domínio](./overview.md)
* **Fluxogramas:** [Fluxos de Valor](./fluxogramas.md)
* **Componente Editor:** [OKFEditor Component](../frontend/components/okf-editor.md)
