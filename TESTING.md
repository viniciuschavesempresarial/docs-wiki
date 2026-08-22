# Estratégia e Arquitetura de Testes — Monorepo QAndora Docs-Wiki

Este documento apresenta a especificação técnica e arquitetura de testes automatizados do ecossistema **QAndora Docs-Wiki**. Ele serve como guia para engenheiros de software, engenheiros de QA e engenheiros de DevOps para entender a cobertura, pirâmide de testes, políticas de mock e execução em pipelines de CI/CD.

---

## 1. Visão Geral da Arquitetura de Testes

Adotamos uma abordagem baseada em **Testes Isolados e Herméticos** por componente de microsserviço no monorepo. Para garantir a velocidade nas esteiras de integração contínua (CI/CD) e eliminar flaky tests, cada pacote executa suas próprias suítes em sandbox usando mocks bem definidos nas fronteiras dos componentes de infraestrutura (bancos de dados, filas e serviços de IA externos).

### Tecnologias Globais de Teste
* **Test Runner / Assertions**: [Jest](https://jestjs.io/) e `ts-jest` para execução nativa de TypeScript.
* **Testes de API / Rotas**: [Supertest](https://github.com/ladjs/supertest) para simulação de requisições HTTP sem subir servidores HTTP reais.
* **Componentes Frontend**: [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) (RTL) para Assertions centradas no comportamento do usuário final, e `@testing-library/user-event` para simulação realista de eventos do browser.

---

## 2. Suíte de Testes do Frontend (`frontend/src/tests`)

A suíte do frontend é construída sobre **Jest** e **React Testing Library** (RTL). O foco é validar a renderização das páginas, o fluxo de navegação e as regras de interface baseando-se em interações realistas do usuário, isolando a camada de requisições HTTP por meio do mock manual do cliente de API.

* **Estratégia de Mock**: Mock completo de [`apiClient`] via `jest.mock()`. As respostas das chamadas HTTP REST para os serviços de IAM, Content, NLP e Search são dubladas (stubbed) com payloads estáticos estruturados.
* **Contextos e Provedores**: O helper [`testUtils.tsx`] fornece a função `renderWithProviders`, que envelopa os componentes sob teste no `QueryClientProvider` (React Query) e no `MemoryRouter` (React Router Dom) para simular o comportamento real de rotas e cache da aplicação.

### Detalhamento das Suítes do Frontend

#### A. Autenticação e Gestão de Contas (`auth.test.tsx`)
* **Nível de Teste**: Integração
* **Componentes Testados**: `LoginPage`, `RegisterPage` e fluxos de validação de formulários.
* **Foco do Teste**:
  * Renderização correta dos campos de e-mail, senha e nome.
  * Validação de submissão do formulário chamando o endpoint `/api/iam/login` com as credenciais preenchidas.
  * Tratamento de erros de autenticação exibidos em tela.

#### B. Catálogo e Filtros de Documentos (`catalog.test.tsx`)
* **Nível de Teste**: Integração
* **Componentes Testados**: `HomePage`, `SearchBar`, `AdvancedFilters`, `CategoryTree`.
* **Foco do Teste**:
  * Renderização da listagem de documentos baseada no retorno da busca semântica.
  * Filtragem por categorias, tags e data de publicação, refletindo as seleções na URLSearchParams enviada à API.
  * Interação da barra de buscas acionando buscas textuais e fuzzy.

#### C. Visualizador de Diferenças (`diff.test.tsx`)
* **Nível de Teste**: Integração
* **Componentes Testados**: `DiffPage`, `DiffViewer`.
* **Foco do Teste**:
  * Renderização comparativa (lado a lado ou inline) das diferenças entre duas revisões históricas de um mesmo documento.
  * Carregamento correto do seletor de versões e recuperação da rota `/api/content/materials/:id/diff?v1=X&v2=Y`.

#### D. Editor de Conteúdo OKF (`editor.test.tsx`)
* **Nível de Teste**: Integração
* **Componentes Testados**: `EditorPage`, `OKFEditor`, `CommitModal`.
* **Foco do Teste**:
  * Carregamento do template padrão OKF (YAML Frontmatter + Markdown) em novas páginas.
  * Edição de metadados estruturados e visualização do preview de renderização do Markdown.
  * Funcionamento do modal de commit (mensagem de alteração) e submissão via POST/PUT para a API de conteúdo.

#### E. Chat Inteligente RAG (`rag.test.tsx`)
* **Nível de Teste**: Integração
* **Componentes Testados**: `ChatPage`, `DocumentSelector`, `AIResponseBox`.
* **Foco do Teste**:
  * Fluxo de seleção de documentos para fixar o contexto de busca semântica do chat (RAG).
  * Envio de perguntas e exibição da resposta enriquecida da IA com a exibição de citações e fontes dos documentos originais.

---

## 3. Suíte de Testes dos Serviços (Backend)

Cada serviço na pasta `/services` é isolado e possui suítes dedicadas de testes unitários e de integração de rotas.

### A. Serviço de IAM (Gestão de Identidade e Acesso)
O serviço utiliza Jest + Supertest para garantir a segurança e robustez das políticas de autenticação e tratamento de dados de usuários.
* **Mocks Utilizados**: Repositórios de banco de dados (`UserRepository`), serviços de criptografia (`PasswordService`) e de assinatura de tokens JWT.

#### Testes Unitários (`services/iam/tests/unit/`)
* **`auth.service.spec.ts`** (**Nível de Teste**: Unitário): Valida a lógica de negócio do login, validação de hash de senha, tratamento de usuários inativos e expiração de sessões.
* **`user.service.spec.ts`** (**Nível de Teste**: Unitário): Cobre a criação, listagem, atualização de papéis (roles como `ADMIN`, `WRITER`) e deleção lógica de usuários.
* **`token.service.spec.ts`** (**Nível de Teste**: Unitário): Garante a conformidade da geração, validação e decodificação de tokens JWT com chaves criptográficas fortes.
* **`password.service.spec.ts`** (**Nível de Teste**: Unitário): Valida a geração de hashes seguros via `bcrypt` e a verificação de senhas.
* **`dto.validation.spec.ts`** (**Nível de Teste**: Unitário): Valida esquemas de entrada (Data Transfer Objects) contra injeções e payloads incompletos.

#### Testes de Integração (`services/iam/tests/integration/`)
* **`auth.routes.spec.ts`** (**Nível de Teste**: Integração): Executa requisições de ponta a ponta via Supertest nos endpoints `/api/iam/login`, `/api/iam/register` e `/api/iam/logout`, garantindo a validação de cabeçalhos e cookies.
* **`user.routes.spec.ts`** (**Nível de Teste**: Integração): Valida as rotas administrativas protegidas de gestão de usuários (`/api/iam/users`), garantindo o bloqueio de acessos não autorizados (RBAC).

---

### B. Serviço de Conteúdo
Gerencia o versionamento de documentos seguindo a especificação Git-like e a validação do formato OKF.
* **Mocks Utilizados**: Conexão com o banco de dados Postgres (`database.ts`), repositórios (`MaterialRepository`, `VersionRepository`) e o publicador de eventos RabbitMQ.

#### Testes Unitários (`services/content/tests/unit/`)
* **`okfParser.test.ts`**:
  * **Nível de Teste**: Unitário (sem mock).
  * **Foco**: Valida se o parser extrai corretamente o bloco Frontmatter em YAML (título, autor, tags) e o corpo em Markdown de um documento sob formato OKF. Valida o tratamento de erros em YAMLs inválidos ou arquivos sem delimitadores `---`.
* **`diffCalculator.test.ts`**:
  * **Nível de Teste**: Unitário (sem mock).
  * **Foco**: Valida o cálculo de diferenças de texto linha por linha para garantir a precisão visual nos comparativos históricos.
* **`gitLike.service.test.ts`**:
  * **Nível de Teste**: Unitário (com mocks).
  * **Foco**: Testa a criação de versões imutáveis de documentos, cálculo de SHA-256 com base no conteúdo OKF anterior, encadeamento de commits (parent-child relationship) e detecção de conflitos de version concorrente.

#### Testes de Integração (`services/content/tests/integration/`)
* **`material.routes.test.ts`**:
  * **Nível de Teste**: Integração (com mocks).
  * **Foco**: Testa com Supertest as rotas de criação, leitura, atualização e diff de materiais via HTTP.

---

### C. Serviço de NLP (Processamento de Linguagem Natural)
Executa o fluxo assíncrono de enriquecimento, quebra estruturada e geração de embeddings de documentos.
* **Mocks Utilizados**: Repositórios de chunks de busca, conexão do RabbitMQ e chamadas externas para geração de vetores (Embedders).

#### Testes de Suíte (`services/nlp/tests/`)
* **`markdown-splitter.test.ts`**:
  * **Nível de Teste**: Unitário (sem mock).
  * **Foco**: Garante que o documento Markdown seja quebrado em blocos semânticos (chunks) de tamanho adequado sem cortar parágrafos importantes e preservando títulos de seções para indexação.
* **`embedder.test.ts`**:
  * **Nível de Teste**: Unitário (com mocks).
  * **Foco**: Garante a conversão determinística de textos em vetores numéricos de 768 dimensões.
* **`nlp.service.test.ts`**:
  * **Nível de Teste**: Unitário (com mocks).
  * **Foco**: Valida a orquestração do processamento: quebrar o Markdown, gerar os embeddings e persistir o lote de chunks indexados.
* **`nlp.consumer.test.ts`**:
  * **Nível de Teste**: Integração (com mocks).
  * **Foco**: Garante que o consumidor escute os eventos `material.criado` e `material.atualizado` da fila e dispare o pipeline de enriquecimento assíncrono de RAG.

---

### D. Serviço de Busca (Search)

Fornece as rotas de busca híbrida inteligente e chat baseado em RAG usando LLM (Gemini).
* **Mocks Utilizados**: Repositório de busca híbrida (`searchRepository`), conexão Postgres e as APIs do Gemini (`geminiClient`).

#### Testes de Suíte (`services/search/tests/`)
* **`hybrid-score.test.ts`**:
  * **Nível de Teste**: Unitário (sem mock).
  * **Foco**: Valida o algoritmo de pontuação de busca híbrida (Reciprocal Rank Fusion - RRF ou similar), ponderando resultados de busca por palavra-chave (BM25) e vetorial semântica.
* **`search.service.test.ts`**:
  * **Nível de Teste**: Unitário (com mocks).
  * **Foco**: Valida a orquestração de buscas unificadas.
* **`rag-chat.service.test.ts`**:
  * **Nível de Teste**: Unitário (com mocks).
  * **Foco**: Testa o fluxo de RAG: obter chunks relevantes de um documento e enviá-los como contexto formatado (Grounding) para a API do Gemini, verificando se o retorno formata as citações das fontes originais corretamente.
* **`search.integration.test.ts`**:
  * **Nível de Teste**: Integração (com mocks).
  * **Foco**: Valida via Supertest as rotas de saúde `/health` do serviço (que monitora conexões ativas), a rota `/search` e a rota de conversação do assistente virtual `/search/chat`.
* **`swagger.test.ts`**:
  * **Nível de Teste**: Integração (sem mock).
  * **Foco**: Garante que o esquema de documentação de rotas Swagger/OpenAPI seja válido e esteja sincronizado com a especificação da API.

---

## 4. Integração Contínua (CI/CD) & Melhores Práticas

A esteira de integração contínua (GitHub Actions) é orquestrada para rodar os testes de maneira paralela e ultra veloz.

### Comandos de Execução
* **Testar Todo o Monorepo**: `npm run test` (roda a suíte completa no frontend e em todos os serviços).
* **Testar Apenas Frontend**: `npm run test:frontend`
* **Testar Apenas Backend**: `npm run test:backend`
* **Testes por Serviço Específico**:
  * IAM: `npm run test:iam`
  * Content: `npm run test:content`
  * NLP: `npm run test:nlp`
  * Search: `npm run test:search`

### Boas Práticas do Pipeline
1. **Isolamento de Estado**: Todos os testes que interagem com o banco de dados utilizam transações mockadas ou dublês isolados, garantindo que a ordem de execução dos testes não cause interdependências.
2. **Execução Linear (`--runInBand`)**: Nos testes integrados de backend, a flag `--runInBand` é utilizada pelo Jest para garantir que os arquivos de teste rodem sequencialmente no mesmo processo, evitando condições de corrida ou concorrência em mocks globais de infraestrutura.
3. **Mocks de IA e APIs Externas**: Nenhuma requisição de teste é direcionada para as APIs reais do Google Gemini Studio ou modelos externos de Transformers. Isso elimina custos de processamento, dependência de chaves de API nos ambientes de CI/CD e latência desnecessária.
