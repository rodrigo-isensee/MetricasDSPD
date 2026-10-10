# Servidor (`server/`): módulos, migrações, seed e acesso ao MySQL

Status: K-017 parte 2. Modelo de dados em `data-model.md`; decisões em ADR 0004 (MySQL), 0005 (Kysely + SQL explícito), 0006 (coletas).

## Módulos

```mermaid
flowchart LR
  subgraph server["server/ (@metricas-dspd/server)"]
    cli["src/db/cli.ts<br/>npm run migrate"]
    mig["src/db/migracoes.ts<br/>conectar + Migrator (Kysely)"]
    mg["migrations/0001..0010<br/>DDL em SQL explícito (+ _util.ts)"]
    gr["src/db/grants.ts<br/>GRANT por papel"]
    stg["src/db/staging.ts<br/>gravarStgCard (dedup pela última versão)"]
    seed["src/db/seed.ts<br/>mapear + semear"]
    scli["src/db/seed-cli.ts<br/>npm run seed"]
    col["src/coletas/<br/>repositorio (SQL, só leitura) -> eventos (mapeia ctl_coleta) -> servico"]
  end
  lib["@metricas-dspd/metricas/core<br/>montarEstadoColeta, calibracao (60 dias), frescor"]
  ctr["@metricas-dspd/contratos<br/>EstadoColeta, EventoColeta (zod .strict)"]
  mock["@metricas-dspd/mock<br/>gerarBaseMock"]
  db[("MySQL 8.4<br/>dspd_bm, dspd_ac, dspd_core")]
  cli --> mig --> mg
  mig --> db
  gr -. "GRANTs aplicados pela operação" .-> db
  stg --> db
  scli --> seed --> mock
  seed --> db
  col --> db
  col --> lib
  col --> ctr
```

`dspd_bm` (BusinessMap) e `dspd_ac` (Acelerato) nunca se misturam: nenhuma FK nem consulta cruza os dois. O pacote `@metricas-dspd/server` é workspace da raiz; `npm run pronto` na raiz roda typecheck, lint e testes do server junto com os demais pacotes (o server usa a própria configuração de ESLint).

### Estado de coleta (`src/coletas/`, integracao-real B1 a B4)

`estadoColeta(db, dominio, agora)` e `historicoColetas(db, dominio, pagina)`: leem `ctl_coleta` + `ctl_coleta_contagem` da fonte (schema fixo por domínio; BM e AC nunca na mesma consulta) e `ref_versao_criterio*`, e entregam a `montarEstadoColeta`/`paginarColetas` (regra única em `packages/metricas`; selo e calibração não são recalculados aqui). `erro_resumo` nunca sai: só a categoria (prefixo `categoria: detalhe`). Convenção com o coletor (002): contagens `arquivado_preservado` e `excluido_preservado` em `ctl_coleta_contagem.lidos`. Contrato HTTP em `docs/api/fontes.md` (sem rotas ainda: o servidor HTTP não existe nesta etapa). Testes: `tests/coletas.test.ts` (SQL compilado com driver falso, 100%) e `tests/coletas.mysql.test.ts` (pulado sem `MYSQL_TEST_URL`).

## Migrações

```mermaid
flowchart TD
  A["npm run migrate -w @metricas-dspd/server<br/>(MYSQL_MIGRADOR_URL, usuário dspd_migrador)"] --> B["criarMigrator: tabela de controle<br/>dspd_core.kysely_migration"]
  B --> C{"Há migração pendente?"}
  C -- sim --> D["aplica em ordem de nome<br/>0001 schemas, 0002-0003 controle,<br/>0004-0007 BM, 0008-0009 AC, 0010 core"]
  C -- não --> E["nada a fazer"]
  D --> F["falha? para e registra<br/>(MySQL não tem DDL transacional)"]
```

- `npm run migrate` aplica até a última; `npm run migrate -w @metricas-dspd/server -- down` desfaz a última.
- Migração aplicada nunca é editada: correção vira migração nova (ADR 0005). Cada migração exporta `ddl.up`/`ddl.down` (listas de instruções) para o teste estático.

## Seed (desenvolvimento)

```mermaid
flowchart TD
  S["npm run seed -w @metricas-dspd/server"] --> G["gerarBaseMock(semente) do pacote mock"]
  G --> M["mapearBM / mapearAC<br/>epoch ms -> DATETIME(3) UTC, ids ASCII,<br/>sem responsaveis, usuario, justificativa"]
  M --> X{"ctl_coleta 'seed-mock'<br/>já existe no schema?"}
  X -- "mesma semente" --> N["ja_semeado: nada é gravado"]
  X -- "outra semente" --> R["erro: use um banco novo"]
  X -- não --> T["transação por schema:<br/>1 ctl_coleta + INSERT em lotes de 500"]
```

- Grava `dim_card`, `fato_transicao` (`fonte = 'revision'`, `id_origem = seed-N`), `fato_bloqueio`, `ref_coluna` (BM) e `dim_chamado`, `fato_etapa_chamado` (AC). Cards arquivados e excluídos entram como estão.
- Determinístico: sem relógio; `coletado_em` = "hoje" da configuração do mock; mesma semente gera as mesmas linhas.
- Nunca apaga nem sobrescreve (sem `INSERT IGNORE`, `ON DUPLICATE KEY`, `DELETE`). `coluna_id` = `c<ordem>` (o nome com acento fica em `ref_coluna.nome`); `data_acordada` usa a data civil em America/Sao_Paulo (-03:00).
- Fora do seed (o mock não traz a informação; não foi inferida): `ref_quadro` (nível), `ref_dominio`, `ref_alvo_prioridade`, calendário, staging, `*_versao`, `evt_*` e `fato_etapa_chamado.totalizador`. Variáveis: `MYSQL_SEED_URL` (ou `MYSQL_MIGRADOR_URL`) e, opcional, `MOCK_SEMENTE`.

## Usuários e grants por papel (data-model §8; `src/db/grants.ts`)

| Usuário | Pode |
|---|---|
| `dspd_migrador` | DDL (só no job de deploy); também usado no seed em desenvolvimento |
| `dspd_coletor` | INSERT/SELECT em `stg_`, `evt_`, `*_versao`, `fato_transicao`, `rec_`; INSERT/UPDATE/DELETE nas projeções; SELECT/INSERT em `ctl_` (append-only, inclusive `ctl_automacao`), com `UPDATE (status, finalizado_em, marca_dagua_ate, erro_resumo)` em `ctl_coleta` e UPDATE em `ctl_coleta_contagem`; SELECT em `ref_` |
| `dspd_ref` | INSERT/SELECT em `ref_` e `UPDATE (vigente_ate)` por coluna |
| `dspd_webhook` | INSERT só em `dspd_bm.stg_webhook_evento` |
| `dspd_api` | SELECT em projeções, `vw_`, `ref_`, `ctl_`; sem acesso a `stg_` |
| `dspd_automacao` | INSERT/SELECT em `dspd_ac.ctl_automacao`; SELECT em `ref_` do core |

Os usuários são criados pela operação (com senha fora do repositório); `gerarGrants` produz os `GRANT` a aplicar depois das migrações. Credenciais só em `.env`.

## Ambiente local com Docker

Decisão do usuário (alinhamentos de 2026-10-10): o banco local roda em Docker. Arquivos: `docker-compose.yml`, `.env.example`, `docker/mysql/init/01-schemas-usuarios.sh`, `scripts/db.sh`, `scripts/test-mysql.sh`.

```mermaid
flowchart LR
  env[".env (não versionado)"] --> compose["docker-compose.yml"]
  compose --> dev["mysql :3306 (volume dspd-mysql-data)"]
  compose -. "perfil test" .-> tst["mysql-test :3307 (tmpfs, descartável)"]
  init["init/01-schemas-usuarios.sh"] --> dev
  dev --> mig["db:migrate: migrações + grants.ts"] --> seed["db:seed (mock)"]
  tst --> t["test:mysql: MYSQL_TEST_URL, roda e derruba"]
```

MySQL 8.4, utf8mb4, InnoDB, fuso UTC, healthcheck. O init (só na primeira criação do volume) cria `dspd_bm`, `dspd_ac`, `dspd_core` e os usuários por papel (senhas de `DSPD_PWD_*`); os `GRANT` por tabela vêm de `gerarGrants` e são aplicados ao fim de `db:migrate` (`MYSQL_GRANTS_URL`, conta root local).

| Script | Faz |
|---|---|
| `npm run db:up` / `db:down` | sobe (aguarda healthcheck) / derruba, mantendo o volume |
| `npm run db:reset` | derruba apagando o volume e sobe de novo (reexecuta o init) |
| `npm run db:migrate` | migrações com `dspd_migrador` e depois os grants |
| `npm run db:seed` | seed do mock (só desenvolvimento) |
| `npm run test:mysql` | sobe o `mysql-test`, roda os testes MySQL hoje pulados e derruba |

Primeiro uso: `cp .env.example .env`, ajuste as senhas, `npm run db:up && npm run db:migrate && npm run db:seed`.

### Instalar Docker no WSL2
1. Opção simples: Docker Desktop no Windows, com "Use the WSL 2 based engine" e a integração ligada para a distro em Settings > Resources > WSL integration.
2. Sem Desktop: no Ubuntu do WSL2, siga a instalação do Docker Engine pelo repositório apt oficial (docs.docker.com/engine/install/ubuntu), `sudo usermod -aG docker $USER`, reabra o terminal e, se o systemd não estiver ativo, adicione `[boot]\nsystemd=true` em `/etc/wsl.conf` e rode `wsl --shutdown` no Windows.
3. Confira com `docker compose version` e `docker run --rm hello-world`.

Nesta entrega os testes contra MySQL ainda não foram executados (Docker ausente na máquina); sem `MYSQL_TEST_URL` eles ficam pulados e os estáticos rodam sempre.

## Regra LGPD de colunas (`src/db/lgpd.ts`)
Módulo único, usado pelos testes estáticos das migrações e do seed (e pelo de `information_schema` no CI). O nome da coluna é dividido por `_` e falha se algum segmento casar `pessoa|responsav*|usuario*|user*|agente*|atendente*|solicitante*|autor*|criador*|email*|login*|assignee*|justificativa*`. Exceções só por `schema.tabela.coluna` (hoje `dspd_bm.dim_card.area_solicitante` e `dspd_bm.dim_card_versao.area_solicitante`, área organizacional, briefing 4.5). Decisão do usuário: nomes não são pseudonimizados; a garantia é que nenhuma view ou DTO expõe ou agrega por pessoa. O seed não grava responsáveis.

## Staging de card
`gravarStgCard(db, entrada)` recebe `quadroId`, `arquivado` e `excluidoDetectado` do coletor (nada é fixo em código). `fato_transicao.id_origem` é `VARCHAR(64) ascii` (hash SHA-256 hex do webhook). Removidos: índices `ix_*_versao_vigente` (redundantes com o UNIQUE) e `stg_webhook_evento.coleta_id`; `dim_chamado_versao` ganhou `organizacao` e `tipo`. `dspd_ref` tem `UPDATE (vigente_ate)` também em `dspd_core.ref_calendario_turno` e `ref_calendario_aplicacao`.
