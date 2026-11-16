---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-test-pg-ambiente
commit: 0c44ef9448ecde1aba1f2ba2a2f2ba5f6816b0c6
parecer: aprovado
revisor: tech-lead
data: 2026-11-16
---

# Code review: test:pg com Postgres descartável por execução (105, K-392, E7.353)

## Revalidação (volta 1, head `0c44ef94`)
Delta lido: `forge-check parecer delta docs/reviews/105-test-pg-ambiente.md`, intervalo `944aa74c..0c44ef94` (commit `7b6a826d` e o merge da própria branch). No domínio: `.env.example`, `README.md`, `docs/engineering/carga-da-pesquisa-de-percepcao.md`, `docs/engineering/operacao-banco.md`, `scripts/test-pg.sh`.

- **A1 resolvido.** `scripts/test-pg.sh:12-14` guarda a `PG_TESTE_URL` do ambiente antes de carregar o `.env` e decide só por ela (valor vindo só do `.env` é descartado com `unset`). `.env.example:21-23` deixa a variável comentada e explica o uso. Sondas S3 a S5 abaixo: com `.env` copiado do exemplo, e até com a variável descomentada no `.env`, o descartável sobe; só a variável no ambiente o pula.
- **A3 resolvido.** `README.md:18` descreve o descartável, a exceção por `PG_TESTE_URL` no ambiente e a limpeza após `kill -9`; `carga-da-pesquisa-de-percepcao.md:10` situa o K-095 como caso só de `PG_TESTE_URL` apontando para banco antigo.
- **A4 resolvido.** `operacao-banco.md:104` diz que a CI não passa pelo script, que o `.env` é ignorado para essa variável, como limpar resto após `kill -9` e que HUP, INT e TERM são tratados. `trap 'exit 129' HUP` (`test-pg.sh:34`) conferido pela S6.
- **A2 segue aberto (recomendado).** O ADR 0014 não está no delta; a nota continua devida antes do merge na `develop` (ver abaixo).
- **shellcheck** em `scripts/test-pg.sh` no head: só SC1091 informativo na linha 13 (`. ./.env`); o SC2164 da linha 8 sumiu com o `|| exit 1`.

## Suíte
Sem PR para a branch: a suíte inteira fica para o CI do PR, e este parecer não afirma CI verde. Cito o PQ do autor: dois caminhos provados e `test:pg` 342 de 342. Não rerrodei o SHA; rodei as sondas com `docker` e `pnpm` falsos, `env -i`, numa cópia do script.

## Achados
- A1 (bloqueante) scripts/test-pg.sh:9 · resolvido em `7b6a826d`: decisão pela `PG_TESTE_URL` do ambiente antes do `.env` (S3, S4, S5).
- A2 (recomendado) docs/architecture/adr/0014-stack-tecnica-do-back-end.md:88 · nota de revisão datada pendente: `test:pg` local em instância descartável por execução; prefixo e "sem Testcontainers" mantidos; CI no service container; critério de reversão.
- A3 (recomendado) README.md:18 · resolvido em `7b6a826d`.
- A4 (recomendado) docs/engineering/operacao-banco.md:104 · resolvido em `7b6a826d`.
- A5 (recomendado) scripts/test-pg.sh:14 · a guarda nova não tem teste automatizado do ramo de falha; as sondas S3 a S5 servem de roteiro (`.env` com `PG_TESTE_URL` e o `docker` falso tem de ser chamado).

## Sondas
- S1 · (rodada 1) cópia de `scripts/test-pg.sh` com `.env` = `.env.example` no head `944aa74c` · espera: `docker compose up` chamado · obtido: `docker` não chamado, URL da 5432 compartilhada
- S2 · (rodada 1) mesma cópia, sem `.env` · espera: descartável · obtido: `DOCKER CHAMADO: compose up -d --wait postgres`, porta própria
- S3 · head `0c44ef94`, `.env` = `.env.example`, sem variável no ambiente · espera: descartável · obtido: `DOCKER CHAMADO: compose up -d --wait postgres`; `PG_TESTE_URL=...@127.0.0.1:38653/metricas_test COMPOSE_PROJECT_NAME=metricasdspd-teste-78c60d30`; rc=0
- S4 · head `0c44ef94`, `.env` com `PG_TESTE_URL` descomentada · espera: descartável (valor do `.env` ignorado) · obtido: `DOCKER CHAMADO: compose up -d --wait postgres`; porta 43763, projeto `metricasdspd-teste-b51efb82`; rc=0
- S5 · head `0c44ef94`, `PG_TESTE_URL=postgres://x@h:1/ci` no ambiente · espera: usa a URL, não sobe nada · obtido: `pnpm PG_TESTE_URL=postgres://x@h:1/ci COMPOSE_PROJECT_NAME=<vazio>`, `docker` não chamado; rc=0
- S6 · head `0c44ef94`, `kill -HUP` durante o `pnpm` · espera: sai 129 com limpeza · obtido: rc=129

## ADR 0014
Precisa de nota (A2), não de ADR nova: a decisão (Compose, prefixo por execução, sem Testcontainers) se mantém e só o ambiente local passa a ser descartável; a CI segue no banco do job, sem o script. A nota é do `software-architect` com o tech-lead, com critério de reversão (voltar ao compartilhado se subir o Postgres por execução passar a pesar no `pronto`). Não bloqueia este código, mas deve entrar antes do merge na `develop`.
