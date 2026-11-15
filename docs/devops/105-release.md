---
tipo: revisao-devops
contrato: 1
pedido: 105-melhorias-15-11
branch: docs/105-release
commit: 4d89240da40fb458d2c4b607c52b887219e15229
parecer: aprovado
revisor: forge:devops-engineer
data: 2026-11-15
---
# Review de devops: release 105 (develop em 4d89240d contra a main), etapa E5.17

## Parecer
Aprovado, sem achado bloqueante. A release leva a `develop` inteira desde a 104 (PRs 418 a 469, o 469 mesclado às 18:36 e conferido antes de começar) mais a branch `docs/105-release` (CHANGELOG da 105 com "Ações do dono" e `docs/devops/105-roteiro-dono.md`). O merge da `develop` na branch de docs deu conflito só no `CHANGELOG.md` (a seção "Ações do dono" tinha o item do #469 como "linha prevista"); resolvi mantendo o texto do roteiro, trocando "linha prevista" por "(#469)" e trazendo o aviso do "última carga" que a `develop` já tinha. Esse commit (merge) vai na branch com este parecer.

## Achados
- A1 (recomendado) docs/devops/105-roteiro-dono.md:52 · o roteiro não traz o rollback da 0038: o `migrate down` real exige `DSPD_PERMITIR_DOWN=1` e o backup do dia em `DSPD_BACKUP_DIR` (provado abaixo); acrescentar seção curta com backup antes do `db:migrate` e o `down 1`.
- A2 (recomendado) docs/devops/105-roteiro-dono.md:65 · diz que o `ac:reprojetar-fluxo` é "da branch `feature/105-ac-reprojetar-fluxo`" e cita a ponta `0358e417` (linha 5); o PR 469 já está na `develop` (4d89240d), trocar por "vem na release".

## Observações (informativas, fora do bloco de achados)
- `scripts/db-backup.sh` ignora `PG_PORT` e lê `PGPORT` (padrão 5432): ao rodá-lo com `PG_PORT=55432` ele apontou para o banco real (falhou por falta de `pg_dump` no host; é só leitura, nada mudou). Para ensaiar em base descartável, usar `PGPORT`. Não afeta o dono.
- Lacunas de ferramenta: `actionlint` e `zizmor` fora do PATH; o hook `conformidade` recusa `pnpm install` ao papel devops. Fiz o `git worktree add` e o merge simulado da pasta da `main`, mas os comandos do servidor rodaram com o `node_modules` de outra pasta de trabalho de árvore idêntica (`git diff` vazio).

## O que mudou em `.github/`, `Dockerfile*`, `compose*` e IaC
`git diff origin/homolog origin/develop -- .github docker deploy docker-compose.yml docker-compose.homolog.yml server/Dockerfile`: 3 arquivos, 1 linha cada, todos o K-343 (`pg_isready -h 127.0.0.1 -U postgres -d metricas` em `restauracao.yml`, no `healthcheck` do `docker-compose.yml` e do `docker-compose.homolog.yml`), com parecer próprio aprovado (`docs/devops/102-k343.md`). Nenhum outro workflow, `Dockerfile`, compose ou IaC muda. `permissions:`, SHAs das ações, `timeout-minutes` e nomes dos checks inalterados; sem `continue-on-error`, `[skip ci]` ou teste pulado (`R-VERIFY`); nada escreve na `main` (`R-MAIN`); custo zero (`R-CUSTO`). A mudança em workflow vai ao remoto pelo dono (token sem escopo `workflow`), e o PR com arquivo protegido de `.github/` pede o rótulo `afrouxa-regra` na catraca enquanto esses arquivos não mudarem; avisar o `tech-lead`.

## Prova das árvores (15/11, refeita aqui)
- `git rev-parse origin/main^{tree}` e `origin/homolog^{tree}`: ambas `ae5fbd1599b257ec292b99d4a73e17867c93d74f`; `git diff origin/main origin/homolog` vazio. As árvores de `homolog` e `main` são idênticas.
- `git merge-tree --write-tree origin/main origin/develop` e `git merge-tree --write-tree origin/homolog origin/develop` dão a mesma árvore, `8c99c2ac224d5bb86bab3551eee3196fc45591df`: mesclar a `develop` na `homolog` e depois na `main` dá a mesma árvore que mesclar direto na `main`, sem conflito.
- Com a branch de docs (`origin/main` + `docs/105-release` com a `develop`): árvore `534b8c8ce9c91d4075658bbaa77ef4eea3389b1c`; numa pasta própria da `main` (worktree destacada em `origin/main`, merge da branch), `git diff` contra a branch fica vazio (`pnpm-lock.yaml` igual). O PR de release `homolog` → `main` leva, portanto, só a `develop` mais os dois arquivos de docs.

## Roteiro do dono, ensaiado sem tocar a base real
O banco real (`metricasdspd-postgres-1`, porta 5432) ficou intocado: a 0038 ainda falta nele e aplicá-la é do dono. O ensaio foi num projeto Compose descartável (`dv5scratch`, `PG_PORT=55432`, credenciais de desenvolvimento do próprio compose, volume apagado no fim) a partir do `docker-compose.yml` da release:
- `docker compose up -d --wait postgres`: saudável (o `healthcheck` do K-343 passa).
- `db:migrate` do zero: 38 migrações, 216 GRANTs, rc=0, a última é `0038_ac_dim_chamado_fluxo`; coluna `dspd_ac.dim_chamado.fluxo` criada (1).
- Repetir `db:migrate`: "No migrations to run!", rc=0 (idempotente).
- Rollback: `migrate down 1` sem as travas foi recusado como projetado (`DSPD_PERMITIR_DOWN` e backup de hoje). Com `DSPD_PERMITIR_DOWN=1` e `DSPD_BACKUP_DIR` com a confirmação do dia (arquivo escrito à mão, porque o `db-backup.sh` não alcançou a base descartável, A3): `down: 1 migração(ões), 216 GRANT(s)`, coluna removida (0); `migrate` de novo reaplica a 0038 e a coluna volta (1). A 0038 tem volta e o `down` é simétrico (`DROP COLUMN IF EXISTS`).
- `ac:reprojetar-fluxo` (comando do #469) com `PG_MIGRADOR_URL` do migrador: `{"coletaId":1,"lidos":0,"preenchidos":0,"fluxoMultiplo":0,"semFluxo":0}`, rc=0, só contagens. Base vazia: a conferência de `lidos` e `preenchidos` contra os 5144 chamados reais fica para o dono, como o roteiro escreve.
- Não verifiquei o `.env` real (nunca lido). O carregamento por caminho do roteiro (`set -a; . ~/Metricas/MetricasDSPD/.env; set +a`) é o mesmo que os scripts `db.sh` e `coleta.sh` fazem com o `.env` da pasta; sem `.env` na pasta nova, `db.sh` caiu nos padrões do compose e rodou sem erro, como o roteiro afirma. O nome do projeto Compose é fixo (`metricasdspd`), igual ao do contêiner real em execução.

## Portão da homologação e CI
A mudança de infraestrutura é só a espera do banco (K-343), então o portão da `homolog` (suíte completa, migração a partir da `main`, smoke; `fluxo-homologacao.md`) deve passar: a migração a partir da `main` aplica as 38 como acima, sem conflito de merge entre `develop` e `homolog`. CI da `develop`: `gh run list --branch develop`, run 43761981688 em 4d19dbc6 `success`; o run 43764517252, em 4d89240d (merge do #469), estava `in_progress` quando escrevi, então a evidência do verde nesse sha é do `tech-lead` na hora do PR (o PR 469 teve todos os jobs `SUCCESS`, e2e parte 2/2 era o último). Não medi duração e minutos do CI nesta passada (checkpoint por release fica para o pedido de tempo).

## Custo e rollback da release
Custo zero. Rollback de infraestrutura: nenhum serviço novo; reverter o K-343 (uma linha) se a espera do banco regredir. Rollback de dado: `migrate down 1` da 0038 com backup do dia (A1); a `main` volta por `git revert` do merge, como nas releases anteriores.
