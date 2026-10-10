# 0014 - Stack técnica do back-end: PostgreSQL, pg, node-pg-migrate, outbox, Fastify, tudo local
- Status: **aceita**, revisão 2 (stack e custo definidos pelo usuário, `docs/alinhamentos/2026-10-10-decisoes-do-usuario.md` §7 e §8)
- Data: 2026-10-10 · **Revisão 2: 2026-10-10** (substitui por inteiro o texto da revisão 1, que mantinha MySQL com `mysql2` e migrador próprio)
- **Substitui:** ADR 0004 (MySQL) por inteiro.
- **Substitui parcialmente:** ADR 0005 (Kysely, `Migrator`, `kysely-codegen` e `mysql2` saem; entram `pg` e node-pg-migrate), ADR 0013 (AWS, Lambdas e RDS viram alvo futuro; hoje tudo roda em Docker Compose; P14 respondida), ADR 0010 (CI no GitHub Actions com o Postgres do compose; deploy adiado), ADR 0002 (npm → pnpm), ADR 0007 e 0008 (Fastify 5 volta).
- **Não muda:** monólito modular e módulos da ADR 0013 §2–§3, Metabase como origem do Acelerato (ADR 0013 §4), a biblioteca única (ADR 0011), o contrato da coleta (ADR 0006, partes que a 0013 manteve), as regras de camadas e de LGPD do `data-model.md` (agora em Postgres).

## Contexto
O usuário fixou a stack completa do back-end e trocou o banco para PostgreSQL. Também decidiu que **não haverá gasto agora**: tudo roda localmente em Docker Compose, o CI fica no GitHub Actions (gratuito, repositório público) e a nuvem foi adiada, sem ser descartada. A API deve sair como imagem de contêiner para continuar portátil. Por fim, os nomes de pessoas passam a existir também nas tabelas analíticas (`responsaveis`, `usuario` do modelo 4.5 do briefing), e a API não pode ler essas colunas.

Situação do código: o `server/` tem migrações MySQL 0001–0010 (Kysely + `mysql2`), `grants.ts`, `lgpd.ts`, `staging.ts`, seed e `src/coletas/`. Não há servidor HTTP. **Nenhuma migração MySQL foi aplicada em ambiente compartilhado** (só houve, no máximo, bancos locais descartáveis). Isso permite reescrever as migrações para Postgres sem migrar dados (suposição a confirmar pelo Jarvis: se alguém tiver um banco local com dados que importam, basta `db:reset` e `db:seed`).

## Decisão

### Stack
| Tema | Escolha |
|---|---|
| Linguagem | Node.js 24 LTS + TypeScript `strict` |
| Monorepo | **pnpm** workspaces (`pnpm-workspace.yaml`, `workspace:*`, `packageManager` fixado, Corepack) |
| HTTP | **Fastify 5** (`^5.5.0`) |
| Banco | **PostgreSQL 17** (mínimo 15, por `NULLS NOT DISTINCT` e `security_invoker`), imagem oficial no compose |
| Acesso a dados | **`pg` (node-postgres) puro**, `Pool` por papel, sem ORM nem query builder |
| Migrações | **node-pg-migrate**, migrações em TypeScript que emitem SQL explícito (`pgm.sql`) |
| Eventos | **outbox transacional** em `dspd_core.outbox`, lida por **polling** (`FOR UPDATE SKIP LOCKED`), sem BullMQ, Redis ou fila |
| Validação | **Zod 4** (`>=4.1.5`) em toda fronteira, schemas de `@metricas-dspd/contratos` |
| OpenAPI | **fastify-type-provider-zod 7** + **@fastify/swagger 9** (`>=9.5.1`) + **openapi-types** (`^12.1.3`), versionado em `docs/api/openapi.json` |
| Logs | **Pino** (logger do Fastify), `requestId`, redação de segredos |
| Testes | **Vitest**, **sem Testcontainers**; Postgres do Docker Compose com **um conjunto de schemas por execução de teste** |
| Execução | **Docker Compose local**: `postgres`, `migrate` (avulso), `api`, `worker`, `web`. Uma imagem do servidor, várias entradas |
| CI | GitHub Actions |

O `pnpm-lock.yaml` versionado fixa as versões. Quem atualizar uma das bibliotecas acima confere a compatibilidade e roda o job `openapi`. Plugins do Fastify (`@fastify/helmet`, `@fastify/rate-limit` no webhook, `@fastify/secure-session` se a ADR 0009 ficar com o BFF) entram só se forem compatíveis com Fastify 5.

### Banco: um database, três schemas nativos
- Database `metricas` (testes: `metricas_test`, na mesma instância), `ENCODING 'UTF8'`, `TimeZone = 'UTC'` na sessão (definido no pool). Schemas **`dspd_bm`**, **`dspd_ac`** e **`dspd_core`**. `public` sem uso (`REVOKE ALL ON SCHEMA public FROM PUBLIC`).
- **Todo SQL é qualificado pelo schema** a partir de um mapa único `S = { bm, ac, core }` montado da configuração (`DSPD_SCHEMA_PREFIXO`, vazio fora dos testes). Repositórios escrevem `${S.bm}.dim_card`. Valores só entram por `$1..$n`. Identificador nunca vem de entrada do usuário. **`search_path` não é usado** (ver testes).
- Tipos e regras de modelagem no `data-model.md` §2: `timestamptz(3)`, `jsonb`, `bigint GENERATED ALWAYS AS IDENTITY`, `text` + `CHECK` no lugar de `ENUM`, `bytea` de 32 bytes para hash, `UNIQUE NULLS NOT DISTINCT`, índices parciais, GRANT por coluna, views `security_invoker`, gatilho que impede `UPDATE`/`DELETE`/`TRUNCATE` nas tabelas append-only.

### Acesso a dados com `pg`
- `plataforma/db`: um `Pool` por papel (`dspd_api`, `dspd_webhook`, `dspd_coletor`, `dspd_ref`, `dspd_migrador`), `statement_timeout` por pool, `emTransacao(pool, fn)`, `ehDuplicado(erro)` (SQLSTATE `23505`). Parsers de tipo: `timestamptz` → `Date`, `int8` → `bigint` ou `string` (nunca `number` sem verificação), `numeric` → `string` convertido no repositório.
- **Idempotência na escrita:** `INSERT ... ON CONFLICT ON CONSTRAINT <uq_nome> DO NOTHING RETURNING <pk>` é permitido **só com alvo explícito** (a restrição da chave natural). Zero linhas devolvidas = "já existente". Isto substitui o "INSERT + erro 1062" do MySQL, porque no Postgres um erro dentro da transação a aborta inteira. `ON CONFLICT` sem alvo e `ON CONFLICT ... DO UPDATE` são **proibidos** em staging, eventos, versões, `ref_` e `ctl_` (regra de lint sobre o SQL e teste). Qualquer outro erro é falha do item.
- **Tipos:** cada repositório declara o tipo da linha da sua consulta e converte para os tipos da biblioteca. Nenhum tipo do driver sai do repositório (ADR 0005). Sem codegen: o descompasso é pego pelo teste de esquema (`information_schema`/`pg_catalog` comparado a um snapshot versionado) e pelos testes de integração de cada consulta.
- **Consultas listam colunas.** `SELECT *` é proibido em código e em views (necessário para o GRANT por coluna, abaixo).

### Migrações com node-pg-migrate
- **Reescrita, não conversão:** as migrações MySQL 0001–0010 são substituídas por migrações Postgres novas, numeradas de novo a partir de `0001`, com o mesmo conteúdo lógico mais as correções da revisão (`data-model.md` §11) e a `outbox`. As antigas saem do repositório no mesmo PR (ficam no histórico do git). A regra "migração aplicada nunca é editada" passa a valer a partir da primeira aplicação das novas.
- **Forma:** cada `migrations/NNNN_<nome>.ts` exporta `ddl(S): { up: string[]; down: string[] }` (função pura do mapa de schemas, usada pelos testes estáticos de LGPD e de tamanho de colunas) e `up(pgm)`/`down(pgm)` que chamam `pgm.sql` com essas listas. Sem os helpers de alto nível do node-pg-migrate (`pgm.createTable`): o SQL revisado é o SQL que roda.
- **Prefixo:** `S` vem da mesma configuração do runner, então não há reescrita por regex. Com prefixo vazio, o SQL é idêntico ao revisado (teste).
- **Controle e exclusão:** tabela `pgmigrations` no schema `${S.core}` (`migrationsSchema`), lock por `pg_advisory_lock` do próprio node-pg-migrate, `checkOrder` ligado. **DDL transacional:** cada migração roda numa transação (padrão), então falha no meio não deixa esquema pela metade. `CREATE INDEX CONCURRENTLY`, se um dia for preciso, vai em migração própria com `pgm.noTransaction()`.
- **Checksum:** `migrations/checksums.json` guarda o SHA-256 de `ddl(S_PADRAO)` de cada migração; teste falha se uma migração já registrada mudar.
- Comandos: `pnpm --filter @metricas-dspd/server migrate up|down|redo` (runner programático em `plataforma/db/migrar.ts`, que também aplica `gerarGrants(S)` ao final). No compose, o serviço avulso `migrate` faz isso antes de `api` e `worker` subirem.

Alternativas de migração: **migrador próprio** (revisão 1) perde o lock, a tabela de controle e a transação prontos e foi substituído pela escolha do usuário. **Arquivos `.sql` do node-pg-migrate** não aceitam parâmetro, o que inviabiliza o prefixo de teste sem reescrita textual. **Graphile Migrate / Sqitch / Flyway** acrescentam ferramenta fora da stack definida.

### Outbox transacional e polling
- **Escrita:** `publicarEvento(cliente, evento)` grava em `${S.core}.outbox` **na mesma transação** da mudança que gera o evento (mesmo database, transação única).
- **Eventos iniciais** (evento novo só entra junto com o consumidor):
  - `bm.webhook.recebido` `{ webhookSk }`: gravado junto com `stg_webhook_evento`; consumido por `businessmap`, que normaliza em cerca de 1 min. A reconciliação com as revisions continua na coleta (T2.3).
  - `coleta.concluida` `{ fonte, coletaId, status }`: gravado ao fechar `ctl_coleta`; consumido por `operacao`, que registra o alerta de `falha`/`parcial` (canal I-7; enquanto não houver canal, log `warn` + estado em `/dados`).
- **Polling:** `processarOutbox({ fonte, agora, limite })` seleciona com `FOR UPDATE SKIP LOCKED` os eventos `status = 'pendente' AND disponivel_em <= agora` (ou `processando` com `reservado_ate < agora`), em ordem de `evento_sk`, marca `processando` com `reservado_ate`, confirma e só então chama o consumidor. Sucesso: `processado`. Erro: reagenda com backoff exponencial (`tentativas`, `disponivel_em`, `ultimo_erro` só com a categoria). Após 8 tentativas: `falha` (alerta).
- **Garantias:** pelo menos uma vez, então todo consumidor é idempotente (chave `evento_id`). **Uma fonte por execução do poller**: filtro por `fonte` obrigatório; consumidor de `businessmap` nunca recebe evento de `acelerato` (lint + teste). Consumidor que precisa de exclusão com a coleta tenta `pg_try_advisory_lock` da fonte e, se não conseguir, reagenda.
- **Quem roda:** o serviço `worker` (mesma imagem, entrada `worker.ts`), em laço a cada 15 s por fonte, com o usuário `dspd_coletor`. `LISTEN/NOTIFY` fica de fora: o polling basta para dezenas de eventos por dia.
- **Retenção:** a outbox é operacional. Eventos `processado` com mais de 30 dias são apagados pelo poller (única exceção à regra de não apagar, só nesta tabela).

### HTTP e OpenAPI
- `buildApp(deps)` monta o Fastify com `validatorCompiler`/`serializerCompiler` do type provider. Rotas declaram `querystring`, `params` e `response` com os schemas de `contratos`: entrada `strict` (400 `VALIDATION_ERROR`) e saída validada na serialização (ADR 0007). Formato de erro único num `setErrorHandler`.
- OpenAPI pelo `@fastify/swagger` com `jsonSchemaTransform`; `openapi:gerar` faz `app.ready()` e grava `app.swagger()` em `docs/api/openapi.json`, tipado com `openapi-types`. O job `openapi` compara o gerado com o versionado.
- Testes de rota com `app.inject()`.

### Execução: Docker Compose local (P14 respondida)
| Serviço | Imagem / entrada | Papel no banco | Faz |
|---|---|---|---|
| `postgres` | `postgres:17`, volume `dspd-pg-data`, healthcheck | — | init cria `metricas`, `metricas_test`, os schemas e os papéis (senhas de `.env`) |
| `migrate` | imagem do servidor, `migrar.ts`, roda e sai | `dspd_migrador`, `dspd_ref` | migrações, grants, `ref:sync` |
| `api` | imagem do servidor, `api.ts` (Fastify `listen`) | `dspd_api`, `dspd_webhook` | rotas `/api/v1`, webhook, `/health/live`, `/health/ready` |
| `worker` | imagem do servidor, `worker.ts` | `dspd_coletor` | agenda diária das coletas (horário por fonte em config), varredura semanal, poller da outbox |
| `web` | build da SPA servido por `nginx:alpine` | — | estáticos e proxy `/api` → `api` |

- **Uma imagem** (`server/Dockerfile`, multi-stage, Node 24 slim, usuário não root) e entradas diferentes. É o artefato portátil para a nuvem futura (ECS, servidor da Unifique ou outro).
- `api` e `worker` separados para manter a separação de privilégio: a API nunca tem a credencial do coletor. A agenda é um laço simples no `worker`, sem biblioteca de cron; repetir uma coleta é seguro (marca d'água, staging idempotente, `pg_try_advisory_lock` por fonte).
- Para desenvolvimento, `pnpm dev` roda `api` e `worker` fora do contêiner com `tsx watch`, contra o `postgres` do compose; a `web` em dev continua no Vite com proxy.
- **Nuvem adiada:** a ADR 0013 (Lambdas, RDS, CDK) passa a ser um alvo possível, não o plano. Quando a implantação voltar, uma ADR nova escolhe entre contêiner (o caminho natural desta imagem) e Lambda. Nada de `infra/` agora.

### Testes: um conjunto de schemas por execução
- **Decisão: prefixo nos três schemas** (`t<6 caracteres base36>_dspd_bm`, `_dspd_ac`, `_dspd_core`), no database `metricas_test` do mesmo `postgres` do compose.
- `globalSetup` do Vitest gera o prefixo, roda o runner do node-pg-migrate com esse `S` (os schemas são criados pela migração 0001) e aplica `gerarGrants(S)`. Os papéis são do cluster e compartilhados entre execuções (criados pelo init); os grants são por objeto, então execuções simultâneas não colidem. `globalTeardown` faz `DROP SCHEMA ... CASCADE` dos três (`DSPD_TESTE_MANTER=1` preserva). `pnpm db:limpar-testes` remove schemas `t%_dspd_%` de execuções interrompidas.
- Testes de banco num projeto Vitest `pg`, sem paralelismo de arquivos; cada teste cria seus dados e não supõe tabela vazia. Sem Postgres de pé, são pulados localmente; no CI são obrigatórios.
- **Por que não `search_path`:** `dspd_bm` e `dspd_ac` têm tabelas com o mesmo nome (`ctl_coleta`, `ref_dominio`...), então o `search_path` deixaria ambíguo qual schema cada consulta toca e esconderia uma mistura BM × AC. O nome qualificado é também o que o teste "schemas usados por repositório" lê.

### CI (GitHub Actions)
Jobs `check` (typecheck, lint, testes unitários), `db` (`docker compose up -d --wait postgres`, testes `pg`, `migrate up → down → up`, snapshot de esquema, checksums, teste de grants), `openapi`, `e2e`, `image` (build da imagem, sem publicar). pnpm com `pnpm/action-setup`, `actions/setup-node` com `cache: pnpm`, `pnpm install --frozen-lockfile`. Sem deploy.

## Alternativas consideradas
- **Manter MySQL com `mysql2` e migrador próprio (revisão 1):** descartada pelo usuário.
- **ORM (Prisma) ou query builder (Kysely, Knex):** excluídos pela stack definida.
- **BullMQ + Redis:** retentativa pronta, mas é peça a mais e perde a atomicidade com o banco. Excluído pelo usuário.
- **Testcontainers:** isolamento por contêiner, mais lento e com Docker por teste. Excluído; o prefixo dá o isolamento.
- **Database por execução (`CREATE DATABASE ... TEMPLATE`):** isolamento total, mas exige papel com `CREATEDB` e conexão nova por database; o schema prefixado é suficiente e é o que o usuário pediu.
- **`search_path` por execução:** ver acima.
- **API e worker no mesmo processo:** um contêiner a menos, mas a API passaria a ter a credencial do coletor. Rejeitado pela separação de privilégio.
- **Lambda/AWS agora (ADR 0013):** adiado por custo.

## Consequências
- **Mais fácil:** DDL transacional (migração que falha não deixa resto); `ON CONFLICT` com alvo explícito para idempotência sem abortar a transação; índices parciais e `NULLS NOT DISTINCT` no lugar de colunas geradas e do `0` sentinela; GRANT por coluna e views `security_invoker` para esconder nomes da API; tudo roda com `docker compose up`, sem conta de nuvem; a mesma imagem vai para qualquer hospedagem.
- **Mais difícil:** consultas sem tipo gerado (garantia por teste); as dez migrações e o seed precisam ser portados (cartões S-02 e S-03); `SELECT *` proibido exige listar colunas; sem nuvem, não há disponibilidade fora da máquina de quem roda (aceito pelo usuário).
- **Riscos:**
  - Uma view criada sem `security_invoker` expor coluna de pessoa: teste de catálogo exige a opção em toda view e verifica, com `has_column_privilege`, que `dspd_api` não lê nenhuma coluna de `COLUNAS_PESSOA`.
  - `ON CONFLICT` usado sem alvo ou com `DO UPDATE` em tabela append-only: lint sobre os literais SQL + gatilho de imutabilidade no banco.
  - `int8`/`numeric` virarem `number` com perda: parsers definidos em um lugar e teste.
  - Migração para pnpm alterar o resultado: vale o critério da ADR 0002 (mesmo número de testes e mesmo hash da base mock antes e depois).
  - Agenda no `worker` não roda se a máquina estiver desligada: a coleta seguinte recupera pela marca d'água; o selo de frescor de `/dados` mostra o atraso.

## Histórico
- Revisão 1 (2026-10-10): stack com MySQL 8.4 mantido, `mysql2` puro, migrador próprio, Lambda (P14 em aberto). Substituída pela revisão 2 após as decisões §7 e §8 do usuário.
