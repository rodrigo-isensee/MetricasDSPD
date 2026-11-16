---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-test-pg-ambiente
commit: 9edfaccf19e293243b026b2b6b13ec94c900205d
parecer: aprovado
revisor: tech-lead
data: 2026-11-16
---

# Code review: test:pg com Postgres descartável por execução (105, K-392, E7.353)

## Revalidação (volta 2, head `9edfaccf`)
Delta lido: `forge-check parecer delta docs/reviews/105-test-pg-ambiente.md`, intervalo `0c44ef94..9edfaccf`. No domínio: só `docs/architecture/adr/0014-stack-tecnica-do-back-end.md`. Nenhum código nem teste mudou.

- **A2 resolvido.** Nota de revisão datada (2026-11-16, K-392) no cabeçalho (`0014:5`), na seção "Testes" (`0014:90`) e no "Histórico" (`0014:122-127`): `test:pg` local em instância descartável do serviço `postgres` do compose por execução, `down -v` no `trap`, `PG_TESTE_URL` só do ambiente (a do `.env` é ignorada), prefixo de schema e "sem Testcontainers" mantidos, `search_path` segue proibido, CI no service container do job `banco`. Traz motivo (12 falhas falsas do K-392) e critério de reversão mensurável (subida acima de metade do tempo do `test:pg` em três execuções seguidas, ou falha local causada pelo descartável que não se reproduz na CI). Conferi contra o código: `scripts/test-pg.sh:9,25,31-34`, `describe.skipIf(!url)` em `server/tests/*.pg.test.ts` e o job `banco` em `.github/workflows/ci.yml:103`.
- **A6 (recomendado, novo, não bloqueia).** A linha "CI" do ADR (`0014:98`), tocada neste commit, ainda cita os jobs `check`, `e2e` e `image`, que no `ci.yml` hoje são `rapida`/`testes`, `e2e-parte` e `imagem`. Texto anterior ao K-392; só `banco` foi atualizado. Ajuste quando o ADR for revisto de novo.

## Revalidação (volta 1, head `0c44ef94`)
Delta lido: intervalo `944aa74c..0c44ef94` (commit `7b6a826d` e o merge da própria branch). No domínio: `.env.example`, `README.md`, `docs/engineering/carga-da-pesquisa-de-percepcao.md`, `docs/engineering/operacao-banco.md`, `scripts/test-pg.sh`.

- **A1 resolvido.** `scripts/test-pg.sh:12-14` guarda a `PG_TESTE_URL` do ambiente antes de carregar o `.env` e decide só por ela (valor vindo só do `.env` é descartado com `unset`). `.env.example:21-23` deixa a variável comentada e explica o uso. Sondas S3 a S5.
- **A3 resolvido.** `README.md:18`; `carga-da-pesquisa-de-percepcao.md:10`.
- **A4 resolvido.** `operacao-banco.md:104`; `trap 'exit 129' HUP` (`test-pg.sh:34`) conferido pela S6.
- **shellcheck** em `scripts/test-pg.sh` no head `0c44ef94`: só SC1091 informativo na linha 13 (`. ./.env`). O script não mudou em `9edfaccf`.

## Suíte
Sem PR para a branch: a suíte inteira fica para o CI do PR, e este parecer não afirma CI verde. Cito o PQ do autor: dois caminhos provados e `test:pg` 342 de 342. Não rerrodei o SHA; o delta desta volta é só documentação.

## Achados
- A1 (bloqueante) scripts/test-pg.sh:9 · resolvido em `7b6a826d`: decisão pela `PG_TESTE_URL` do ambiente antes do `.env` (S3, S4, S5).
- A2 (recomendado) docs/architecture/adr/0014-stack-tecnica-do-back-end.md:88 · resolvido em `9edfaccf`: nota de revisão datada com motivo e critério de reversão.
- A3 (recomendado) README.md:18 · resolvido em `7b6a826d`.
- A4 (recomendado) docs/engineering/operacao-banco.md:104 · resolvido em `7b6a826d`.
- A5 (recomendado) scripts/test-pg.sh:14 · a guarda nova não tem teste automatizado do ramo de falha; as sondas S3 a S5 servem de roteiro (`.env` com `PG_TESTE_URL` e o `docker` falso tem de ser chamado).
- A6 (recomendado) docs/architecture/adr/0014-stack-tecnica-do-back-end.md:98 · nomes de jobs da CI desatualizados (`check`, `e2e`, `image`); o `ci.yml` tem `rapida`, `testes`, `e2e-parte`, `imagem`.

## Sondas
- S1 · (rodada 1) cópia de `scripts/test-pg.sh` com `.env` = `.env.example` no head `944aa74c` · espera: `docker compose up` chamado · obtido: `docker` não chamado, URL da 5432 compartilhada
- S2 · (rodada 1) mesma cópia, sem `.env` · espera: descartável · obtido: `DOCKER CHAMADO: compose up -d --wait postgres`, porta própria
- S3 · head `0c44ef94`, `.env` = `.env.example`, sem variável no ambiente · espera: descartável · obtido: `DOCKER CHAMADO: compose up -d --wait postgres`; `PG_TESTE_URL=...@127.0.0.1:38653/metricas_test COMPOSE_PROJECT_NAME=metricasdspd-teste-78c60d30`; rc=0
- S4 · head `0c44ef94`, `.env` com `PG_TESTE_URL` descomentada · espera: descartável (valor do `.env` ignorado) · obtido: `DOCKER CHAMADO: compose up -d --wait postgres`; porta 43763, projeto `metricasdspd-teste-b51efb82`; rc=0
- S5 · head `0c44ef94`, `PG_TESTE_URL=postgres://x@h:1/ci` no ambiente · espera: usa a URL, não sobe nada · obtido: `pnpm PG_TESTE_URL=postgres://x@h:1/ci COMPOSE_PROJECT_NAME=<vazio>`, `docker` não chamado; rc=0
- S6 · head `0c44ef94`, `kill -HUP` durante o `pnpm` · espera: sai 129 com limpeza · obtido: rc=129

## ADR 0014
Nota de revisão, não ADR nova: a decisão (Compose, prefixo por execução, sem Testcontainers) se mantém e só o ambiente local passa a ser descartável; a CI segue no banco do job, sem o script. A nota entrou em `9edfaccf` (A2) e libera o merge na `develop` quanto a este ponto.
