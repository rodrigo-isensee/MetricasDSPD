---
tipo: review
contrato: 1
pedido: 107-ci-sem-gasto
branch: ci/107-runs-on-proprio
commit: acb62951646cfebc2243c8429e1f6582bc9d1175
parecer: aprovado
revisor: tech-lead
data: 2026-11-17
---

# Code review: workflows nos runners próprios (pedido 107, E1.13; revalidação E1.17)

Diff ainda sem commit da worktree 091 (`ci/107-runs-on-proprio`) contra a develop `acb62951`. Na primeira passada: `.github/workflows/ci.yml`, `homolog.yml`, `restauracao.yml` e `changelog.d/ci-107-runs-on-proprio.md`. Na revalidação entram também `.github/actions/playwright/action.yml` e `tools/homolog/src/artefatos.test.ts`.

## Parecer
**Aprovado na revalidação (E1.17).** Na primeira passada foi reprovado, com os bloqueantes A1 e A2, que o diff resolveu (seção "Revalidação"). O desenho confere com `docs/devops/107-runner-v2.md` §5:
- `runs-on: [self-hosted, metricas]` em todos os jobs dos três workflows, menos `imagem` (`ci.yml:165`) e `smoke` (`homolog.yml:236`); `homolog-aprovada` e `homolog-reavalia` seguem em `ubuntu-latest`.
- Saem os 3 `services: postgres` e os 4 `container:` do Playwright. As variáveis de banco ficam iguais (127.0.0.1:5432, postgres/postgres_ci), e o Postgres por job vem do `pg-start.sh` do entrypoint do runner efêmero (um contêiner por job, sem disputa da porta 5432).
- O gitleaks vira o binário fixado na imagem, no mesmo job informativo.
- `imagem` passa a depender do `filtro` (saída nova `imagem`). Quando é pulado, o check exigido conta como aprovado.
- `restauracao.yml`: o `docker run pgci` vira `01-databases-papeis.sh`, e o `DSPD_PG_CONTAINER` sai; `scripts/lib-pg.sh:26` usa os binários do host.
- Sem `continue-on-error` novo (o único continua no `seguranca`, que já o tinha), sem teste pulado e sem custo novo além do `smoke` hospedado, que roda só na promoção.
- Checks exigidos da develop (`rapida`, `testes`, `build`, `e2e`, `filtro`, `banco`, `openapi`, `imagem`, `seguranca`): nenhum nome some e o agregador `e2e` continua.

**Condição para o merge, fora do diff:** o runner v2 precisa estar de pé, com a sonda e a prova do JIT. É o A1 de `docs/security/107-runs-on-proprio.md` e o A4 de `docs/devops/107-runs-on-proprio-revisao.md`, e depende do `sudo` do dono. Sem esse runner, todo job `[self-hosted, metricas]` fica pendente e nenhum PR fecha. Mesmo com a condição atendida, o merge só sai com o CI do head todo verde, e2e incluso (`gh pr checks <n>`).

## Decisão do migracao-smoke
Nem "manter o job inteiro em `ubuntu-latest`" nem "refazer o smoke sem compose". **Separar em dois jobs:**
- `migracao` (H1, `runs-on: [self-hosted, metricas]`): checkout da main, `01-databases-papeis.sh` e `tools/homolog ... migracao`. Não usa Docker (`tools/homolog/src/comandos.ts:101`) e é a parte que mais quebra na promoção. Fica sem custo e não depende de cota.
- `smoke` (H2, `runs-on: ubuntu-latest`): `.env.homolog`, `homolog:subir` e `homolog:derrubar`. Não precisa de `services:`, porque o compose traz o próprio Postgres. Roda no push em `homolog` e no `workflow_dispatch`, e não no `schedule`.
- `portao`: exige `migracao` e `smoke`. Na noturna (`EVENTO=schedule`), aceita o `smoke` em `skipped`.

Por que não refazer o smoke sem compose: o H2 existe para provar a imagem e o `docker-compose.homolog.yml`, que são o que a homologação sobe. Por que não deixar o job inteiro hospedado: o H1 ficaria preso à cota sem precisar dela. Risco que fica: sem cota, o `smoke` fica pendente e trava só a release, não os PRs para a develop.

Reversão: voltar o job único `migracao-smoke` em `ubuntu-latest` com o `services: postgres` da develop `acb62951` (registrado no fragmento do changelog).

## Revalidação
Delta lido: `git diff acb62951` e `git status` na 091, que segue sem commit (`ci.yml`, `homolog.yml`, `restauracao.yml`, `playwright/action.yml`, `artefatos.test.ts` e o fragmento do changelog). O parecer fica preso ao `Revisar-sha` do brief (`acb62951`) porque não há commit da branch. Ele vale para a árvore lida hoje: quando houver commit, o `forge-check parecer delta` aponta o que mudou depois dele.
- **A1, resolvido:** `artefatos.test.ts:207-211` troca a regex do `docker run` por asserções de que o `restauracao.yml` não tem `docker run`, tem `PGHOST: 127.0.0.1` e roda `01-databases-papeis.sh`. O `restauracao.yml` ganha o `PGPASSWORD`, que o `psql` do script (linhas 6 e 23) usa junto com o `PGHOST`.
- **A2, resolvido** pela separação descrita acima:
  - `migracao` (`homolog.yml:196`) roda no runner próprio, sem Docker.
  - `smoke` (`homolog.yml:236`) roda em `ubuntu-latest`, com `github.event_name != 'schedule'`.
  - O `portao` traz os dois em `needs`. O `migracao` entra em `RESULTADOS_CODIGO`; o `RESULTADO_SMOKE` precisa de `success` fora da noturna e aceita `skipped` só quando `EVENTO=schedule` (`homolog.yml:287-291`).
  - Escopo docs ou escopo falho continuam reprovando.
  - Há teste novo em `artefatos.test.ts:137`, e as três listas de jobs foram ajustadas.
- **A3, resolvido:** o comentário e a mensagem de erro do `playwright/action.yml` falam da imagem do runner.
- **A4, aberto** (recomendado; ver Achados).
- **A5, resolvido em parte:** o filtro `imagem` agora cobre também os manifestos e o lockfile, e o job roda sempre em PR para `homolog` e `main`. Falta a nota no PR (ver Achados).
- **Só citado, é da segurança:** o gitleaks falha fechado quando o binário falta (`ci.yml:297`), mas um erro de execução, com código diferente de 1, ainda cai no `||` como aviso (`ci.yml:298`). Isso fecha só em parte o A3 da segurança; quem decide é o parecer dela.

## Achados
- A4 (recomendado) .github/workflows/homolog.yml:69 · Continua aberto: `qualidade` em 20 min e `e2e-homolog-parte` em 30 min (`homolog.yml:125`), contra `testes` 25 min e `e2e-parte` 45 min no `ci.yml`, num runner com 3 CPUs e 4 GB por vaga. Alinhar com o `ci.yml` ou medir na primeira rodada do portão.
- A5 (recomendado) .github/workflows/ci.yml:165 · O filtro e a regra de PR para `homolog` e `main` foram resolvidos. Falta registrar no corpo do PR que, sem cota hospedada, o `imagem` e o `smoke` ficam pendentes e travam a promoção.

## Sondas
- S1 · regex `/docker run[\s\S]*?postgres:17/` do antigo `artefatos.test.ts:200` sobre o `restauracao.yml` da 091 e da develop (092) · espera: casa na develop e não casa na 091 · obtido: `match: null` (091), `base: true` (092). Era a prova do A1 da primeira passada; a asserção foi trocada na revalidação.

## Verificação
Leitura do diff. Na primeira passada, comparei a 091 com a 092 (mesma develop) e rodei só a sonda S1, com `node -e`. Na revalidação, usei `git diff` e `git status` só para leitura. Também lidos `docs/devops/107-runner-v2.md` §1, §5 e §6, `tools/homolog/src/comandos.ts`, `docker/postgres/init/01-databases-papeis.sh`, `scripts/lib-pg.sh` e `docs/engineering/fluxo-homologacao.md` §15. Não rodei git de escrita, pnpm nem docker, como o dono pediu. A suíte, incluído o teste novo do `artefatos.test.ts`, fica para o CI do PR. O `praticas.md` não tem regras "decidida por", então não há saída de ferramenta a citar.
