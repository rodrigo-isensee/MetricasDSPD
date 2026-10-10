# 0014 - Stack técnica do back-end
- Status: **aceita** (stack definida pelo usuário em 2026-10-10, repassada pelo Jarvis). Uma pergunta em aberto: P14 (onde o Fastify roda).
- Data: 2026-10-10
- **Substitui parcialmente:** ADR 0013 §1 (a outbox volta), §3 ("sem eventos"), §5 (HTTP, banco, OpenAPI, testes); ADR 0005 (Kysely, `Migrator` e `kysely-codegen` saem); ADR 0002 (npm workspaces → pnpm workspaces); ADR 0007 e 0008 (Hono volta a ser Fastify 5); ADR 0010 (pnpm no CI; MySQL de teste pelo Docker Compose).
- **Não muda:** o banco. MySQL 8.4, os três databases `dspd_bm`, `dspd_ac`, `dspd_core`, as migrações 0001–0010 (o SQL), os usuários por papel, `DATETIME(3)` UTC e as regras da ADR 0004. O que se acrescenta é a tabela `dspd_core.outbox` (migração nova, `data-model.md` §5).

## Contexto
O usuário fixou a stack do back-end com uma restrição: **sem alterar o banco MySQL**. Parte da stack foi citada pelo nome de ferramentas do PostgreSQL (node-pg-migrate). Este registro diz o que se usa no MySQL no lugar delas e o que muda nas ADRs anteriores. Situação do código: ainda não há servidor HTTP. O `server/` tem Kysely + `mysql2` nas migrações, no seed, em `staging.ts` e em `src/coletas/`, e esses trechos precisam ser reescritos para `mysql2` puro (são poucos e todos têm testes).

## Decisão

### Stack
| Tema | Escolha | Observação |
|---|---|---|
| Linguagem | Node.js 24 LTS + TypeScript `strict` | igual às ADRs 0002 e 0013 |
| Gerenciador e monorepo | **pnpm** workspaces (`pnpm-workspace.yaml`, protocolo `workspace:*`, `packageManager` fixado, Corepack) | substitui npm workspaces |
| HTTP | **Fastify 5** (`^5.5.0`) | substitui Hono |
| Banco | **MySQL 8.4** (mantido) | sem mudança |
| Acesso a dados | **`mysql2/promise` puro**, sem ORM nem query builder | Kysely sai |
| Migrações | **executor próprio, mínimo, sobre `mysql2`**, usando as listas `ddl.up`/`ddl.down` já escritas | detalhes abaixo |
| Eventos | **outbox transacional** em `dspd_core.outbox`, lida por **polling** | sem BullMQ, Redis ou fila gerenciada |
| Validação | **Zod 4** (`>=4.1.5`) em toda fronteira | schemas de `@metricas-dspd/contratos` |
| OpenAPI | **fastify-type-provider-zod 7** + **@fastify/swagger 9** (`>=9.5.1`) + **openapi-types** (`^12.1.3`), gerado dos schemas Zod de `contratos` | versionado em `docs/api/openapi.json` |
| Logs | **Pino** (o logger nativo do Fastify), `requestId`, redação de segredos | igual à ADR 0008 |
| Testes | **Vitest**, **sem Testcontainers**; o banco de teste é o MySQL do Docker Compose (perfil `test`), com **um conjunto de databases por execução** | detalhes abaixo |
| Build | esbuild, um bundle por entrada | igual à ADR 0013 |

Plugins complementares do Fastify (`@fastify/helmet`, `@fastify/rate-limit` para o webhook, `@fastify/secure-session` se a ADR 0009 ficar com o BFF) entram só se forem compatíveis com Fastify 5. O `node-backend` confirma as versões no primeiro cartão de HTTP.

### Compatibilidade (verificada pelo usuário)
`zod >=4.1.5` · `fastify ^5.5.0` · `fastify-type-provider-zod 7` · `@fastify/swagger >=9.5.1` · `openapi-types ^12.1.3`. O `pnpm-lock.yaml` versionado fixa as versões. Quem atualizar uma delas confere esta tabela e roda o job `openapi`.

### Equivalentes no MySQL do que foi pedido com nomes do PostgreSQL
| Pedido / PostgreSQL | No MySQL 8.4 |
|---|---|
| `pg` (node-postgres) | `mysql2/promise` (pool, `execute` com `?`) |
| node-pg-migrate | executor próprio sobre `mysql2` (abaixo) |
| schemas | databases `dspd_bm`, `dspd_ac`, `dspd_core` na mesma instância, todo SQL qualificado |
| DDL transacional | não existe: uma mudança por migração, `down` explícito, CI `up → down → up` |
| `pg_advisory_lock` | `GET_LOCK` / `RELEASE_LOCK` |
| `LISTEN/NOTIFY` | polling da outbox |
| `FOR UPDATE SKIP LOCKED` | igual (MySQL 8.0+) |
| `JSONB` | `JSON` |
| `TIMESTAMPTZ` | `DATETIME(3)` em UTC (`timezone: 'Z'` no driver) |
| índice parcial | coluna gerada + `UNIQUE` (já usado) |
| `RETURNING` | `insertId` do resultado ou `SELECT` na mesma transação |
| `ON CONFLICT DO NOTHING` | proibido, como `INSERT IGNORE` (ADR 0004): `INSERT` e tratamento do erro 1062 |
| banco por teste (`CREATE DATABASE ... TEMPLATE`) | prefixo por execução nos três databases |

### Acesso a dados com `mysql2`
- `plataforma/db`: um pool por papel (`timezone: 'Z'`, `supportBigNumbers: true`, `dateStrings: false`, `multipleStatements: false`, `connectionLimit` 2 na Lambda), `emTransacao(pool, fn)` e `ehDuplicado(erro)` (errno 1062).
- **Nomes dos databases** vêm de um mapa único `S = { bm, ac, core }`, montado da configuração (`DSPD_SCHEMA_PREFIXO`, vazio fora dos testes). Repositórios escrevem `${S.bm}.dim_card`. Valores só entram por `?`. Identificador nunca vem de entrada do usuário.
- **Tipos:** cada repositório declara o tipo da linha da sua consulta e converte para os tipos da biblioteca. Nenhum tipo do driver sai do repositório (regra da ADR 0005 mantida). Sem `kysely-codegen`: o descompasso entre esquema e código é pego pelo teste de esquema (`information_schema` comparado a um snapshot versionado) e pelos testes de integração de cada consulta.

### Migrações: executor próprio (~80 linhas)
- **Reaproveita o que existe:** cada `migrations/NNNN_*.ts` já exporta `ddl: { up: string[]; down: string[] }`. Saem só as funções `up(db)`/`down(db)` do Kysely e o `executar` de `_util.ts`. **O SQL não muda.** Um teste estático guarda o SHA-256 do SQL de cada migração aplicada (`migrations/checksums.json`) e falha se alguém editar uma delas.
- **Registro estático** (`MIGRACOES`, como hoje): é ele que permite o bundle esbuild na Lambda `migrar`.
- **Controle:** continua na tabela `dspd_core.kysely_migration` (`name`, `timestamp`), **sem renomear**, para não tocar no banco. A exclusão mútua passa a ser `GET_LOCK('dspd:migracao', 30)`. A `kysely_migration_lock` fica sem uso, e removê-la é decisão de uma migração futura.
- **Prefixo:** o executor reescreve só os identificadores `dspd_bm.`, `dspd_ac.` e `dspd_core.` (regex com fronteira de palavra) para `<prefixo>dspd_*`. Com prefixo vazio, o SQL sai idêntico (há teste disso). Nomes de usuário (`dspd_api`...) e de lock não casam com a regex.
- Comandos: `pnpm --filter @metricas-dspd/server migrate up|down|status`.

Alternativas: **Umzug** (biblioteca pronta, aceita lista estática e armazenamento próprio) é a segunda opção. Seria preciso escrever o armazenamento e o lock do mesmo jeito, então ela acrescenta uma dependência sem tirar trabalho. **dbmate** exige converter as migrações TS em `.sql` e não tem placeholder, o que inviabiliza o prefixo. **Flyway** tem placeholders, mas é Java e não cabe numa Lambda Node. **Knex** é query builder, que o usuário excluiu. **Manter o `Migrator` do Kysely** traz o Kysely de volta.

### Outbox transacional e polling
- **Escrita:** `publicarEvento(conexao, evento)` grava em `dspd_core.outbox` **na mesma transação** da mudança que gera o evento (os databases ficam na mesma instância, então a transação InnoDB cobre os dois).
- **Eventos iniciais** (só esses; evento novo entra com o consumidor junto):
  - `bm.webhook.recebido` `{ webhookSk }`: gravado junto com `stg_webhook_evento`. Quem consome é `businessmap`, que normaliza o evento em cerca de 1 min, em vez de esperar a próxima coleta. A reconciliação com as revisions continua na coleta (T2.3).
  - `coleta.concluida` `{ fonte, coletaId, status }`: gravado quando fecha `ctl_coleta`. Quem consome é `operacao`, que avisa de `falha` ou `parcial` pelo SNS.
- **Polling:** `processarOutbox({ fonte, agora, limite })` pega lotes com `SELECT ... FOR UPDATE SKIP LOCKED`, `status = 'pendente' AND disponivel_em <= agora` (ou reserva vencida), em ordem de `evento_sk`. Marca `processando` com `reservado_ate`, faz commit e só então chama o consumidor. Depois marca `processado`; em caso de erro, reagenda com backoff (`tentativas`, `disponivel_em`, `ultimo_erro` sem dado sensível). Depois de 8 tentativas o evento vai para `falha`, que dispara alarme.
- **Garantias:** entrega pelo menos uma vez, então todo consumidor é idempotente. **Uma fonte por execução do poller:** o filtro por `fonte` é obrigatório, e consumidor de `businessmap` nunca recebe evento de `acelerato`, o que vale como regra de lint e como teste. Consumidor que precisa da exclusão da coleta tenta `GET_LOCK('dspd:bm', 0)` e, se não conseguir, reagenda o evento.
- **Quem roda o poller:** na AWS, a Lambda `coleta`, por agenda de 1 min, com `{ fonte, tarefa: 'eventos' }` e o usuário `dspd_coletor` (sem Lambda nova). Localmente, um laço no processo `local.ts`.
- **Retenção:** a outbox é operacional, não histórico (o histórico está no staging e no `ctl_coleta`). Eventos `processado` com mais de 30 dias são apagados pelo poller. Isto é uma exceção registrada à regra de não apagar, que vale só para esta tabela.
- **Grants:** `dspd_webhook` ganha `INSERT` em `outbox`. `dspd_coletor` ganha `SELECT`, `INSERT`, `UPDATE` (colunas de estado) e `DELETE` (retenção) em `outbox`. `dspd_api` não tem acesso.

### HTTP e OpenAPI
- `buildApp(deps)` monta o Fastify com `validatorCompiler`/`serializerCompiler` do type provider. Rotas declaram `querystring`, `params` e `response` com os schemas de `contratos`: entrada `strict` (400 `VALIDATION_ERROR`) e saída validada na serialização, como manda a ADR 0007. O formato de erro da ADR 0007 sai de um `setErrorHandler` único.
- O OpenAPI vem do `@fastify/swagger` com `jsonSchemaTransform`. O script `openapi:gerar` faz `app.ready()` e grava `app.swagger()` em `docs/api/openapi.json`, tipado com `openapi-types`. O job `openapi` compara o gerado com o versionado. O swagger **não é registrado** no bundle da Lambda, para partida a frio menor.
- Testes de rota com `app.inject()`, sem servidor de pé.

### Onde o Fastify roda (P14, pergunta ao usuário)
- **Recomendado, por ser a menor mudança:** continuar na Lambda (ADR 0013), com `@fastify/aws-lambda` na entrada `lambda-api.ts`. O app e a infra CDK continuam os mesmos, e o custo ocioso fica perto de zero. O preço é uma partida a frio maior que a do Hono, a medir no S1. Se estourar, a saída é concorrência provisionada 1.
- **Alternativa:** um contêiner (ECS Fargate, uma tarefa) com o mesmo `local.ts`: Fastify, poller em laço e agenda. Não tem partida a frio nem limite de 15 min, e roda num processo só, igual ao local. O custo é fixo, e entram um balanceador e a imagem Docker. Muda só `entradas/` e `infra/`.

### Testes: um conjunto de databases por execução
- O `globalSetup` do Vitest gera o prefixo `t<6 caracteres base36>_` e cria `<p>dspd_bm`, `<p>dspd_ac` e `<p>dspd_core` no `mysql-test` do `docker-compose.yml` (perfil `test`, porta 3307, tmpfs). Em seguida aplica as migrações pelo executor e os grants (`gerarGrants(prefixo)`, com usuários de teste também prefixados, até 32 caracteres). O `globalTeardown` apaga tudo (`DSPD_TESTE_MANTER=1` preserva para depuração). `pnpm db:limpar-testes` remove sobras de execuções interrompidas.
- Os testes MySQL ficam num projeto Vitest próprio, sem paralelismo de arquivos. Cada teste cria os próprios dados e não supõe tabela vazia. Duas execuções simultâneas (duas pessoas, ou CI e local) não colidem.
- Sem MySQL de pé, os testes MySQL são pulados localmente. No CI eles são obrigatórios: o job `db` sobe o mesmo compose (`docker compose --profile test up -d --wait mysql-test`), no lugar do `services` da ADR 0010.

## Alternativas consideradas
- **Manter Hono e Kysely (ADR 0013 como estava):** descartada pela decisão do usuário.
- **BullMQ + Redis para eventos:** retentativa pronta, mas é uma peça a mais e perde a atomicidade com a gravação no MySQL. Descartada pelo usuário.
- **EventBridge/SQS no lugar da outbox:** gerenciado, mas a publicação deixa de ser transacional (precisaria de outbox do mesmo jeito) e a fila não roda localmente.
- **Testcontainers:** isolamento por contêiner, mas lento e dependente de Docker por teste. Descartado pelo usuário: o prefixo dá o isolamento com o compose que já existe.
- **Executor de migração pronto:** ver a seção de migrações.

## Consequências
- **Mais fácil:** o SQL que roda é o SQL escrito, sem builder. A atomicidade do evento com o dado vem da própria transação. Os testes usam o Docker que todos já têm. O OpenAPI sai dos mesmos schemas de `contratos`.
- **Mais difícil:** consultas sem tipo gerado, cuja garantia passa a ser de teste. O executor de migração e o poller são código nosso, pequeno, mas com testes próprios. A troca para pnpm expõe dependências fantasmas (pacote usado sem estar declarado).
- **Riscos:**
  - Partida a frio do Fastify na Lambda: medir no S1 e decidir P14.
  - A regex de prefixo deixar passar algum identificador: o teste de esquema verifica que, com prefixo, nenhum objeto é criado nos databases sem prefixo.
  - A outbox crescer: a retenção de 30 dias e o índice `(fonte, status, disponivel_em)` cuidam disso. O volume esperado é de dezenas de eventos por dia.
  - Migração para pnpm alterar o resultado: vale o critério da ADR 0002 (mesmo número de testes e mesmo hash da base mock antes e depois).
