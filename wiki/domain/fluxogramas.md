---
id: "DOM-FLOWS-003"
type: "process"
title: "Mapeamento Completo dos 9 Fluxos de Valor e Negócio"
description: "Demonstração e análise técnica aprofundada de todos os 9 fluxos de negócio, branches de exceção, concorrência e loops em Mermaid."
domain: "dominio_central"
status: "active"
tech_stack:
  - mermaid
  - markdown
tags:
  - flowcharts
  - value_stream
  - diagrams
  - architecture
related_files:
  - "../diagrams/fluxos_diagramas.md"
  - "../architectural_analysis.md"
owner: "time_produto_arquitetura"
created_at: "2026-08-30"
updated_at: "2026-08-30"
---

# DOM-FLOWS-003: Mapeamento Completo dos 9 Fluxos de Valor e Negócio

> **Resumo Executivo:** Documentação técnica exaustiva dos 9 fluxos de valor e negócio implementados na plataforma Docs-Wiki, cobrindo cenários felizes, branches de exceção, loops de recuperação e concorrência otimista.

## 🎯 Visão Geral
Este documento discorre e detalha a arquitetura de execução dos 9 fluxos operacionais que regem a plataforma Docs-Wiki, estabelecendo a rastreabilidade entre eventos de interface, regras de negócio de backend, transações de banco de dados e mensageria assíncrona.

---

## 📐 Detalhes Técnicos e Análise dos Fluxos

### 1. Fluxo 1: Autenticação, Registro, Sessão HttpOnly e RBAC
**Objetivo de Negócio:** Garantir o acesso seguro, mitigar ataques de força bruta com rate limiting duplo, validar e-mails únicos, emitir tokens JWT em cookies `HttpOnly` e proteger rotas administrativas.

```mermaid
graph TD
    Start(["Início / Acesso à Plataforma"]) --> UserAction{"Qual ação o usuário deseja realizar?"}
    
    UserAction -- "Criar Nova Conta" --> RegPage["Exibir Formulário de Registro (RegisterPage)"]
    RegPage --> SubmitReg["Preencher nome, e-mail e senha -> Submeter"]
    SubmitReg --> NginxAuthLimit1{"NGINX Rate Limit (auth_limit: 5r/s)"}
    
    NginxAuthLimit1 -- "Taxa Excedida" --> ErrRateLimit["Retornar HTTP 429 Too Many Requests"]
    NginxAuthLimit1 -- "Taxa OK" --> ExpressRateLimit1{"Express Rate Limit (100 reqs / 15min)"}
    ExpressRateLimit1 -- "Excedido" --> ErrRateLimit
    ExpressRateLimit1 -- "Permitido" --> ValRegDto{"Validação Zod (AuthRegisterDTOSchema)"}
    
    ValRegDto -- "Campos Inválidos" --> ErrRegDto["Retornar HTTP 400 Bad Request"]
    ErrRegDto --> RegPage
    
    ValRegDto -- "Dados Válidos" --> CheckEmailUnique{"E-mail já existe no banco?"}
    CheckEmailUnique -- "Sim (Conflito)" --> ErrEmailConflict["Retornar HTTP 409 Conflict"]
    ErrEmailConflict --> RegPage
    
    CheckEmailUnique -- "Não" --> HashPass["Gerar Hash da Senha via Bcrypt (12 rounds)"]
    HashPass --> InsertUser["Inserir em iam.users + Role 'LEITOR'"]
    InsertUser --> RegSuccess["Retornar HTTP 201 Created"]
    RegSuccess --> AutoLogin["Redirecionar para Login"]

    UserAction -- "Entrar (Login)" --> LoginPage["Exibir Formulário de Login"]
    AutoLogin --> LoginPage
    LoginPage --> SubmitLogin["Submeter credenciais"]
    SubmitLogin --> NginxAuthLimit2{"NGINX Rate Limit"}
    NginxAuthLimit2 -- "Taxa OK" --> ValLoginDto{"Validação Zod"}
    ValLoginDto -- "Válido" --> FindUser["Buscar usuário no PostgreSQL"]
    FindUser --> UserFound{"Usuário ativo e Bcrypt compare válido?"}
    UserFound -- "Não" --> ErrAuth["Retornar HTTP 401 Unauthorized"]
    ErrAuth --> LoginPage
    
    UserFound -- "Sim" --> GenJWT["Gerar JWT (8h) + Set-Cookie HttpOnly SameSite=Lax"]
    GenJWT --> LoginSuccess["Retornar HTTP 200 OK"]
    LoginSuccess --> RedirHome["Redirecionar para Catálogo"]
```

---

### 2. Fluxo 2: Gestão de Conteúdo OKF, Versionamento Git-Like e Concorrência Otimista (OCC)
**Objetivo de Negócio:** Permitir a edição estruturada de documentos, detectar conflitos de edição simultânea sem perda de dados via `parent_version_id`, manter histórico criptográfico com SHA-256 e permitir rollbacks não-destrutivos.

```mermaid
graph TD
    Start(["Início / Submeter Versão"]) --> ValAuthEdit{"Usuário tem permissão 'materials:edit'?"}
    ValAuthEdit -- "Não" --> ErrAuth["Retornar HTTP 403 Forbidden"]
    
    ValAuthEdit -- "Sim" --> ValOKF{"Validação Zod de Frontmatter OKF"}
    ValOKF -- "Inválido" --> ErrZod["Retornar HTTP 400 Bad Request"]
    
    ValOKF -- "Válido" --> BeginTx["PostgreSQL: BEGIN & SELECT FOR UPDATE materiais WHERE id = :id"]
    BeginTx --> CheckOCC{"material.versao_head_id == parent_version_id enviado?"}
    
    CheckOCC -- "Não (Conflito de Concorrência)" --> RollbackTx["PostgreSQL: ROLLBACK -> Retornar HTTP 409 Conflict"]
    RollbackTx --> ShowConflictModal["Frontend: Alerta de Conflito -> Recarregar Versão HEAD"]
    ShowConflictModal --> Start
    
    CheckOCC -- "Sim (Versão HEAD Válida)" --> CalcSHA["Calcular SHA-256 do conteúdo OKF"]
    CalcSHA --> InsertVer["INSERT material_versoes (versao_num = MAX + 1)"]
    InsertVer --> UpdateHead["UPDATE materiais SET versao_head_id = new_version.id"]
    UpdateHead --> CommitTx["PostgreSQL: COMMIT Transaction"]
    
    CommitTx --> PublishAMQP["Publicar evento 'material.atualizado' no RabbitMQ"]
    PublishAMQP --> Return201["Retornar HTTP 201 Created"]
```

---

### 3. Fluxo 3: Pipeline Assíncrono de Ingestão NLP, Chunking e Embeddings 768d
**Objetivo de Negócio:** Ingestão desacoplada orientada a eventos para que edições no editor não fiquem bloqueadas aguardando a geração vetorial; divisão estruturada por seções Markdown e cache Redis para evitar reprocessamento de embeddings idênticos.

```mermaid
graph TD
    StartAMQP(["Evento RabbitMQ: material.criado / atualizado"]) --> Worker["nlp-service consome da fila 'nlp.processamento'"]
    Worker --> ExtractDoc["Extrair Frontmatter YAML e Métricas"]
    ExtractDoc --> UpsertParent["Upsert busca.indices_busca (com tsvector BM25)"]
    
    UpsertParent --> SplitMd["Dividir Markdown por Títulos (#, ##, ###)"]
    SplitMd --> LoopChunks["Para cada chunk: Checar Cache Redis (emb:sha256)"]
    
    LoopChunks --> CacheHit{"Cache Hit no Redis?"}
    CacheHit -- "Sim" --> UseCache["Usar vetor 768d existente"]
    CacheHit -- "Não" --> GenEmbed["Gerar Embedding 768d + Normalização L2 + Gravar Redis"]
    
    UseCache --> CollectChunks["Acumular Chunks"]
    GenEmbed --> CollectChunks
    
    CollectChunks --> BatchInsert["PostgreSQL: DELETE velhos + Batch INSERT busca.material_chunks (pgvector HNSW)"]
    BatchInsert --> EmitEnriched["Publicar 'material.enriquecido' + channel.ack(msg)"]
```

---

### 4. Fluxo 4: Busca Híbrida Ponderada (BM25 + pgvector) e Sumarização por IA
**Objetivo de Negócio:** Prover recuperação de altíssima relevância combinando precisão léxica (BM25) com compreensão semântica (pgvector) e sumarização opcional sob demanda via Gemini 2.0 Flash.

```mermaid
graph TD
    UserQuery["🔍 Entrada da Consulta (q, filtros, summarize)"] --> GenEmbed["⚡ Gerar Vetor 768d da Query (com cache Redis)"]
    GenEmbed --> RunSQL["🐘 Execução Paralela no PostgreSQL (busca)"]
    
    subgraph Postgres_Hybrid_Core ["Cálculo Híbrido"]
        BM25["ts_rank_cd(busca_texto, query)"]
        HNSW["1 - (embedding <=> query_vector)"]
        Combine["Score = 0.3 * BM25 + 0.7 * Vetor"]
    end
    
    RunSQL --> BM25
    RunSQL --> HNSW
    BM25 --> Combine
    HNSW --> Combine
    
    Combine --> CheckSum{"summarize == true e Total > 0?"}
    CheckSum -- "Não" --> ReturnJSON["Retornar Resultados Paginados"]
    CheckSum -- "Sim" --> TopChunks["Recuperar 4 chunks do documento principal"]
    TopChunks --> CallGemini["🤖 Google Gemini API (gemini-2.0-flash, temp: 0.3)"]
    CallGemini --> ReturnJSON
```

---

### 5. Fluxo 5: Painel de Chat RAG Contextual Aterrado (Grounding Gemini)
**Objetivo de Negócio:** Permitir que desenvolvedores façam perguntas técnicas aprofundadas com respostas 100% ancoradas nos documentos selecionados, eliminando alucinações através de temperatura 0.2 e fornecendo citações transparentes de similaridade.

```mermaid
graph TD
    StartChat(["Usuário seleciona documentos no painel lateral"]) --> TypeQ["Digita pergunta técnica"]
    TypeQ --> SendChat["POST /api/v1/search/chat { query, material_ids }"]
    SendChat --> VectorQ["Gerar vetor 768d da pergunta"]
    VectorQ --> FetchChunks["PostgreSQL: Buscar top 8 chunks mais próximos onde material_id IN (material_ids)"]
    FetchChunks --> GroundPrompt["Montar Prompt Estrito: 'Responda EXCLUSIVAMENTE com base nos trechos...'"]
    GroundPrompt --> CallLLM["Chamar Gemini API (temperature: 0.2, topP: 0.8)"]
    CallLLM --> ReturnResp["Retornar HTTP 200 OK { answer, sources: [{ titulo, similarity }] }"]
    ReturnResp --> RenderDOM["Frontend: Sanitizar com DOMPurify e renderizar badges de citação"]
```

---

### 6. Fluxo 6: Gestão Administrativa de Usuários, Atribuição de Roles e Proteção de Super Admin
**Objetivo de Negócio:** Permitir a governança granular de acessos sem risco de auto-rebaixamento de administradores ou exclusão acidental da conta raiz do sistema (`is_system_protected`).

```mermaid
graph TD
    AdminAccess["Admin acessa /admin/users"] --> CheckPerm{"Possui role 'ADMIN'?"}
    CheckPerm -- "Não" --> Denied403["HTTP 403 Forbidden"]
    CheckPerm -- "Sim" --> ListUsers["GET /api/iam/users -> Exibir Tabela"]
    
    ListUsers --> AdminChoice{"Ação Administrativa?"}
    
    AdminChoice -- "Alterar Papéis" --> PutRoles["PUT /api/iam/users/:id/roles"]
    PutRoles --> AutoLeitor["Garantir papel mínimo LEITOR"]
    AutoLeitor --> CheckSelfDemote{"Tentando remover próprio ADMIN?"}
    CheckSelfDemote -- "Sim" --> BlockSelf["Bloqueio de Segurança"]
    CheckSelfDemote -- "Não" --> UpdateDBRoles["Transação PostgreSQL: Atualizar iam.user_roles"]
    
    AdminChoice -- "Excluir Usuário" --> CheckProtected{"is_system_protected == true?"}
    CheckProtected -- "Sim" --> BlockProtected["HTTP 403: Usuário Mestre Protegido"]
    CheckProtected -- "Não" --> DeleteDBUser["DELETE FROM iam.users (Cascade user_roles)"]
```

---

### 7. Fluxo 7: Exclusão em Cascata e Expurgos de Materiais do Acervo
**Objetivo de Negócio:** Garantir a remoção atômica e consistente de documentos, eliminando automaticamente todas as versões históricas, índices de busca e vetores no pgvector sem deixar registros órfãos.

```mermaid
graph TD
    AdminDelete["Admin solicita exclusão de material"] --> DeleteReq["DELETE /api/v1/content/materials/:id"]
    DeleteReq --> DBTrans["PostgreSQL: DELETE FROM conteudo.materiais (FK CASCADE remove material_versoes)"]
    DBTrans --> PubAMQP["Publicar evento 'material.excluido' no RabbitMQ"]
    PubAMQP --> ReturnDel200["Retornar HTTP 200 OK"]
    
    PubAMQP -.-> WorkerNLP["nlp-service consome 'material.excluido'"]
    WorkerNLP --> DelIndices["DELETE FROM busca.indices_busca (FK CASCADE remove material_chunks)"]
    DelIndices --> AckDel["channel.ack(msg) -> Expurgo Vetorial Concluído"]
```

---

### 8. Fluxo 8: Pipeline CI/CD, Releases LTS e Rollback Automático
**Objetivo de Negócio:** Automação de deploy contínuo em ambiente Homelab com execução hermética de testes e recuperação de desastres transparente via rollback de tags LTS.

```mermaid
graph TD
    PushStaging["Push na branch staging"] --> RunGHA["GitHub Actions dispara no Self-Hosted Runner"]
    RunGHA --> Steps["1. npm ci & build monorepo<br>2. docker compose config<br>3. 88 Testes Backend (Jest)<br>4. 19 Testes Frontend (RTL)<br>5. docker compose up -d"]
    
    Steps --> Outcome{"Todos os passos passaram?"}
    Outcome -- "Sim (Sucesso)" --> TagLTS["Job 2: Gerar Tag v1.0.<run>-lts-<date> e publicar"]
    Outcome -- "Não (Falha)" --> AutoRollback["Job 3: git checkout na última tag LTS estável & rebuild containers"]
```

---

### 9. Fluxo 9: Topologia de Observabilidade e Monitoramento sem Efeito Observador
**Objetivo de Negócio:** Isolar o processamento de telemetria para garantir que coletas em tempo real de métricas e logs não degradem a performance da aplicação durante testes de carga de alta intensidade.

```mermaid
graph TD
    subgraph Node3_LoadGenerator ["Nó 3: Gerador de Carga Isolado"]
        LoadGenRunner["⚡ Executores de Carga (k6 / Locust)<br>Injeção Contínua HTTP / HTTPS"]
    end

    subgraph Node1_Staging ["Nó 1: Ambiente Sob Teste (Staging Target)"]
        NGINX_GW["🛡️ NGINX Reverse Proxy (:80 / :443)"]
        React_FE["⚛️ Frontend SPA React 19"]
        IAM_SVC["🔐 iam-service (:3001)"]
        Content_SVC["📝 content-service (:3002)"]
        Search_SVC["🔍 search-service (:3004)"]
        NLP_Worker["🧠 nlp-service (Worker Daemon)"]
        PG_DB[("🐘 PostgreSQL 16 + pgvector")]
        Redis_Cache[("⚡ Redis 7 (:6379)")]
        RMQ_Broker["🐇 RabbitMQ (:5672 / :15672)"]
        
        Telegraf_Agent["⏱️ Telegraf Agent (Impacto CPU menor que 1%)<br>Coleta métricas a cada 2s"]
        Promtail_Shipper["🔍 Promtail Log Shipper<br>Coleta logs em rotação 15MB"]
        
        NGINX_GW --> React_FE
        NGINX_GW --> IAM_SVC
        NGINX_GW --> Content_SVC
        NGINX_GW --> Search_SVC
        Content_SVC --> RMQ_Broker
        RMQ_Broker --> NLP_Worker
        NLP_Worker --> Redis_Cache
        IAM_SVC --> PG_DB
        Content_SVC --> PG_DB
        Search_SVC --> PG_DB
        NLP_Worker --> PG_DB
        
        HostMetrics["Métricas Host e Docker Sock"] -.-> Telegraf_Agent
        Redis_Cache -.-> Telegraf_Agent
        RMQ_Broker -.-> Telegraf_Agent
        ContainerLogs["Logs JSON dos Containers"] -.-> Promtail_Shipper
    end

    subgraph Node2_Observability ["Nó 2: Servidor Dedicado de Observabilidade"]
        VicMetrics[("📈 VictoriaMetrics TSDB (:8428)<br>Retenção: 14 dias")]
        Loki_Server[("📊 Grafana Loki (:3100)<br>Indexação LogQL")]
        Grafana_Dash["📉 Grafana Dashboard (:3000)<br>Auto-provisioning de Painéis"]
        
        VicMetrics --> Grafana_Dash
        Loki_Server --> Grafana_Dash
    end

    LoadGenRunner -- "Tráfego de Carga HTTP/HTTPS" --> NGINX_GW
    
    Telegraf_Agent -- "HTTP POST :8428 (Influx Protocol)" --> VicMetrics
    Promtail_Shipper -- "HTTP POST :3100 (Loki Push API)" --> Loki_Server
    
    DevOpsUser["👨‍💻 Engenheiro QA / DevOps"] -- "Visualização Web :3000" --> Grafana_Dash
```

---

## 🧪 Estratégia de Teste e Validação
Todos os diagramas possuem arquivos espelhados no formato Draw.io na pasta `diagrams/` para edição e documentação visual complementar.

---

## 📚 Citations
[1] [Mermaid Diagramming Documentation](https://mermaid.js.org/)  
[2] [Enterprise Integration Patterns (Gregor Hohpe)](https://www.enterpriseintegrationpatterns.com/)  

---

## 🔗 Conexões no Grafo (Dependências)
* **Visão Geral:** [Visão do Domínio](./overview.md)
* **Regras de Negócio:** [Regras de Domínio](./regras-de-negocio.md)
* **Diagramas Draw.io:** [`diagrams/`](../../diagrams/)
