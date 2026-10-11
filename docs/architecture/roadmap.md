# Roadmap de implementação (pedido 002)

- Data: 2026-10-09 · Revisão: 2026-10-10 (ADR 0013; ADR 0014 revisão 2: PostgreSQL, Docker Compose local, nuvem adiada) · Base: `overview.md`, `data-model.md`, ADRs 0004–0014
- Ordem obrigatória do briefing: configuração (WS1, WS4, por pessoas) → coleta (WS2, WS5) → painéis (WS3). Os painéis do 001 já existem sobre o mock; aqui "painel" = ligar na API real, o que só acontece depois do critério de pronto da coleta do domínio.
- Domínios avançam separados: BM pode ir à produção sem AC e vice-versa (flag de fonte por domínio no web).

```mermaid
flowchart LR
  R0[R0 Fundação do servidor] --> R1[R1 WS2 coleta BM]
  R0 --> R2[R2 WS5 coleta AC T5.1]
  R1 --> R3a[R3 WS3 painéis de fluxo na API]
  R2 --> R3b[R3 WS5 painéis de sustentação na API]
  WS1([WS1 config BM, pessoas]) -.->|T1.1, T1.3| R1
  WS4([WS4 parametrização AC, pessoas]) -.->|T4.1| R3b
  WS4 -.->|T4.1| R4[R4 T4.3 automações]
  R2 --> R4
```

## Fases

| Fase | Briefing | Entrega | Pronto quando | Depende de |
|---|---|---|---|---|
| **R0 Fundação** (K-017) | — | pnpm workspaces; `server/` com Fastify 5, **PostgreSQL com `pg` puro, node-pg-migrate** (port das migrações e do seed), outbox + poller (ADR 0014 r2) e módulos em pastas (ADR 0013); entradas `api`, `worker`, `migrar`, `coleta-cli`; saúde, config zod, pino; testes por schema, `ref:sync`, papéis e grants por coluna; **Docker Compose local** (`postgres`, `migrate`, `api`, `worker`, `web`); jobs `check`, `db`, `openapi`, `image` no GitHub Actions; autenticador falso | `up/down/up` verde; paridade mock × seed verde em todas as métricas; testes de catálogo verdes (esquema, gatilhos, `security_invoker`, grants, LGPD); `pnpm stack:up` sobe tudo; A1/M1 medidos sobre 2 anos de seed | extração do 001 (D3) |
| **R1 WS2 BusinessMap** | T2.1 → T2.2 → T2.4 → T2.3; T2.5/T2.6 integrados | de-para da OpenAPI (apoio ao T2.1), coletor incremental, varredura semanal de excluídos, normalizador (inclusive do webhook), projetor (marcos via biblioteca, `responsaveis`/`usuario` gravados do staging), webhook + reconciliação, `ctl_*` e alertas | T2.2: 7 execuções seguidas sem falha, contagem reconcilia, arquivados presentes; T2.4: 20 cards sorteados conferem; T2.3: divergência < 1 % em 1 semana (exige webhook com endereço público; sem ele, T2.3 fica pendente); K1, K3, K4 | T1.1, T1.3 (WS1); I-5, P13 |
| **R2 WS5 Acelerato (base)** | T5.1 | cliente do Metabase com schema zod da tabela, SQL da pergunta versionado, staging AC com versão e ausência, projeções, views do recorte, exceção de SLA segregada | contagem de fechados e abertos reconcilia com o painel atual em 1 %; M3, K2 dentro do orçamento | **P5–P10, P12** (substituem I-4, I-4b); independe de WS4 |
| **R3 Painéis na API** | WS3 (T3.1–T3.4), WS5 (T5.2–T5.4) | `HttpFonteMetricas`, rotas `/api/v1` por métrica, cache, aquecimento; troca de fonte por domínio; E2E projeto `api` | painéis idênticos ao mock sobre o seed (paridade) e coerentes com dados reais; A1, F1–F5 dentro do orçamento; S-métricas só publicadas após T4.1 (as que dependem de 3.4) | R1 para fluxo; R2 + T4.1/T4.2 para sustentação; I-3 para produção |
| **R4 Automações** (fora até P4/I-6; nova ADR ao voltar) | T4.3 | entrada própria na mesma imagem, cliente de escrita com ações fechadas, idempotência, modo simulação, alertas | cada automação testada em homologação em simulação e depois ativa, com registro no chamado e sem tocar no relógio de SLA | T4.1 (WS4), I-6, I-7 |
| Contínuo | T5.5, T6.x | apoio: consulta trimestral das justificativas (pessoa autorizada), relatórios de higiene | — | — |

R1 e R2 correm em paralelo depois do R0 (módulos e schemas distintos, sem dependência entre si).

## O que cada agente faz

| Agente | R0 | R1 | R2 | R3 | R4 |
|---|---|---|---|---|---|
| `software-architect` | revisão de modelagem das migrações; ajuste das ADRs com respostas I-* e L-* | de-para T2.1 (apoio), regras de reconciliação | mapeamento das colunas do Acelerato | plano técnico da troca de fonte | revisão da lista fechada de ações |
| `node-backend` | K-017: servidor, migrações, seed, `ref:sync`, CI `db` | coletor, normalizador, projetor, webhook, contratos `docs/api/` | leitor AC, views, projeções | rotas, cache, aquecimento, OpenAPI | processo de automações |
| `react-frontend` | ajuste dos tipos da biblioteca/mock (L-1) e função única de marcos em `metricas/businessmap` | — | — | `HttpFonteMetricas`, flag de fonte por domínio, estados de frescor (`GET /fontes/:dominio/estado`) | — |
| `ux-designer` | — | — | — | microcopy de dados defasados, marcação de critério e "dados reais" | texto dos registros no chamado |
| `qa-engineer` | paridade, teste de esquema, `up/down/up` | testes de idempotência (rodar 2×), reconciliação, sorteio dos 20 cards | reconciliação 1 % com o painel atual | E2E `api`, perf A1/F*, Lighthouse | roteiro de homologação T4.3 em simulação |
| `tech-lead` | review de modelagem e de código, commits | idem | idem | idem | idem |
| `jarvis` | levar I-*, L-*, N-* ao usuário | — | — | — | — |

## Cartões do `node-backend` pela ADR 0014 revisão 2 (para o quadro)
Estado do `server/` na `main`: Kysely + `mysql2`, migrações MySQL 0001–0010, `grants.ts`, `lgpd.ts`, `staging.ts`, seed e `src/coletas/` (estado de coleta). **Não há servidor HTTP.** Tudo é portado para PostgreSQL. A numeração abaixo substitui a da revisão 1 (que tinha `mysql2`, migrador próprio e CDK). Sem cartão de nuvem: a implantação foi adiada pelo usuário.

| # | Cartão | Pronto quando | Depende de |
|---|---|---|---|
| S-00 | **pnpm workspaces** na raiz (`pnpm-workspace.yaml`, `workspace:*`, `packageManager` via Corepack, `pnpm-lock.yaml`, remove `package-lock.json`); scripts e README com `pnpm`; CI com `pnpm/action-setup` e `--frozen-lockfile`. Junto com o `react-frontend` (web/e2e) | install limpo; mesmo nº de testes e mesmo hash da base mock (ADR 0002); CI verde | — |
| S-01 | **Postgres no Docker Compose**: troca o serviço `mysql`/`mysql-test` por `postgres:17` (volume `dspd-pg-data`, healthcheck), init `docker/postgres/init/01-databases-papeis.sh` (databases `metricas` e `metricas_test`, papéis com `LOGIN`, `REVOKE` em `public`), `.env.example` (`PG_*_URL`, `DSPD_PWD_*`), scripts `db:up/down/reset`; remove `docker/mysql` e `scripts/test-mysql.sh` | `pnpm db:up` sobe e fica saudável; `psql` com cada papel conecta | S-00 |
| S-02 | Reorganizar em `src/plataforma/` (config zod, log pino, erros) e `src/modulos/<m>/index.ts`; **`plataforma/db` com `pg`**: `Pool` por papel, `TimeZone=UTC`, `statement_timeout`, parsers de tipo, `emTransacao`, `ehDuplicado` (`23505`), mapa `S` com `DSPD_SCHEMA_PREFIXO`; mover `src/coletas/` → `modulos/operacao`, `staging.ts` → `modulos/businessmap` | testes unitários atuais verdes; imports só por `index.ts`; nenhum import de `mysql2` em `plataforma/` | S-00 |
| S-03 | **node-pg-migrate + port das migrações**: runner programático (`plataforma/db/migrar.ts`, `migrationsSchema = S.core`, `checkOrder`), migrações Postgres novas a partir de `0001` com `ddl(S)` + `pgm.sql`: schemas e `proibir_alteracao()`, controle BM/AC, BM, AC (com `ausente_na_extracao` e `dim_chamado` completo), core, `outbox`; correções C1–C6 do `data-model.md` §11; `gerarGrants(S)` com GRANT por coluna e `COLUNAS_PESSOA`; `migrations/checksums.json`; remove as migrações MySQL, `kysely`, `kysely-codegen`, `tipos.gen.ts` | `migrate up → down → up` verde no Postgres do compose; testes estáticos (LGPD, tipos de `ref_dominio`, checksum) verdes; revisão de modelagem aprovada | S-01, S-02 |
| S-04 | **Testes por schema**: `globalSetup`/`globalTeardown` com prefixo nos três schemas em `metricas_test`, migração + grants; projeto Vitest `pg`; `db:limpar-testes`; testes de catálogo (snapshot de esquema, gatilho em toda append-only, `security_invoker` em toda view, grants, `dspd_api` sem coluna de pessoa, nada fora do prefixo); job `db` no GitHub Actions com `docker compose up -d --wait postgres` | duas execuções simultâneas verdes sem colisão; nada sobra após teardown; CI verde | S-03 |
| S-05 | **Port do seed, staging, coletas e lgpd para `pg`**: `staging.ts` com `ON CONFLICT ON CONSTRAINT ... DO NOTHING RETURNING` + releitura; seed com `INSERT` multi-linha em lotes; repositório de `operacao`; `lgpd.ts` com `COLUNAS_PESSOA`; tipo de linha por repositório | seed com o mesmo hash da base mock; testes de borda da staging (A → B → A, recoleta, duas conexões simultâneas) verdes; `coletas.pg.test.ts` verde | S-04 |
| S-06 | Regras de lint da ADR 0013 §9 + "consumidor da outbox só da própria fonte" + SQL proibido (`SELECT *`, `ON CONFLICT` sem alvo, `DO UPDATE` fora das projeções) + teste que lista os schemas usados por repositório | lint falha com exemplo proibido em cada regra | S-02 |
| S-07 | **Fastify 5**: `buildApp(deps)` com fastify-type-provider-zod 7 e schemas de `contratos`; `setErrorHandler` no formato da ADR 0007; `requestId` (pino); `/health/live`, `/health/ready` (consulta ao banco); rotas `/api/v1/fontes/*` sobre `operacao`; testes com `app.inject()`; plugins (helmet, rate-limit) compatíveis | `docs/api/fontes.md` atendido; entrada `strict` recusa `?responsavel=`; resposta fora do schema = 500 | S-05 |
| S-08 | **OpenAPI**: `@fastify/swagger` 9 + `jsonSchemaTransform`; `openapi:gerar` (sem `listen`) grava `docs/api/openapi.json` tipado com `openapi-types`; job `openapi` | gerado = versionado | S-07 |
| S-09 | **Outbox + poller**: `publicarEvento(cliente, evento)`; `processarOutbox({ fonte, agora, limite })` com `FOR UPDATE SKIP LOCKED`, reserva, backoff, `falha` após 8, retenção 30 dias; registro de consumidores por fonte; `coleta.concluida` ao fechar `ctl_coleta` | evento só existe se a transação confirmou (teste de rollback); dois pollers simultâneos não processam o mesmo evento; consumidor reexecutado não duplica | S-04, S-05 |
| S-10 | **Entradas, imagem e compose completo**: `api.ts` (`listen`), `worker.ts` (agenda diária por fonte com `pg_try_advisory_lock`, varredura semanal, laço do poller), `migrar.ts` (migrações + grants + `ref:sync`), `coleta-cli.ts`; `server/Dockerfile` multi-stage não root; serviços `migrate`, `api`, `worker` e `web` (nginx + proxy `/api`, junto com o `react-frontend`) no compose; scripts `dev` (`tsx watch`), `stack:up`, `build`; job `image` no CI (build sem publicar) | `pnpm stack:up` sobe tudo e `/health/ready` responde; `api` não tem a credencial do coletor; worker recusa fonte desconhecida | S-07, S-09 |
| S-11 | Módulo `metricas`: `BaseBM`/`BaseAC` das projeções (colunas explícitas, sem pessoa), cache por `(metricaId, filtros, versão de carga)`, versão relida a cada 60 s; rotas `/api/v1/metricas/:id` | paridade mock × seed verde; A1 medido | S-07 |
| S-12 | Webhook `POST /webhooks/businessmap` (segredo, 256 KB, `dspd_webhook`, hash único, 202): `stg_webhook_evento` + `bm.webhook.recebido` na mesma transação; consumidor em `businessmap` normaliza | reenvio não duplica; K4 < 1 s; evento normalizado em até 2 min (testado localmente; em uso real exige endereço público, I-5) | S-07, S-09 |
| S-13 | Cliente do Metabase (`modulos/acelerato/cliente-api.ts`): chave por env, timeout e retentativa, schema zod da tabela, falha explícita em coluna divergente; testes com resposta gravada | **bloqueado** até P6/P12 (só esqueleto com falso) | S-02 |

Ordem: S-00 → S-01 e S-02 em paralelo → S-03 → S-04 → S-05; S-06 e S-13 após S-02 (paralelo ao resto); S-07 após S-05; S-08 e S-11 após S-07; S-09 após S-05; S-10 após S-07 e S-09; S-12 após S-07 e S-09.


## Gates entre fases
- Nenhuma migração sem revisão de modelagem (praticas §6).
- Nenhum painel ligado à API real sem o critério de pronto da coleta do domínio.
- Nenhuma automação ativa sem homologação em modo simulação e sem I-6 respondida.
- Pergunta de regra de negócio pendente vira célula `pendente-usuario`, nunca escolha no código.
