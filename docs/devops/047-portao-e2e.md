---
tipo: revisao-devops
contrato: 1
pedido: 047-pendencias-decididas-2026-10-28
branch: docs/047-portao-e2e
commit: 9d7eb43a63f0eb30b768ee576390cdc655577497
parecer: aprovado
revisor: forge:devops-engineer
data: 2026-10-28
---
# Review de devops: 047-portao-e2e (K-144, K-172)

## Parecer
Aprovado. O portão do push na `homolog` roda a E2E completa em 2 partes (`--shard=1/2` e `--shard=2/2`), mais a migração a partir da main e o smoke. O workflow mudou no commit 359cec1 (E2.2, K-172) para dividir a E2E, com agregador que mantém o job `e2e`. O PR roda a bateria definida no `ci.yml`. `EXIGIR_NOTURNA` continua `false`. O risco de tempo apontado antes está resolvido.

## Evidências
- Portão no push da `homolog`: `.github/workflows/homolog.yml:7-9` (`on: push: branches: [homolog]`). A matriz `e2e-parte` (`homolog.yml:125-155`, `parte: [1, 2]`, `fail-fast: false`, `timeout-minutes: 30` por parte) roda `pnpm --filter @metricas-dspd/e2e run test:chromium --shard=N/2` (`homolog.yml:146-147`). O comando é `playwright test --project=chromium --project=chromium-semente-alt` (`e2e/package.json:10`): as 2 partes juntas cobrem a E2E inteira, sem `--grep`. O render dos diagramas Mermaid roda só na parte 1 (`homolog.yml:141-145`).
- Agregador: job `e2e` (`homolog.yml:158-170`), nome `e2e-homolog`, `needs: [escopo, e2e-parte]`, `if: always()` no escopo código; falha se `needs.e2e-parte.result` não for `success`, com `RESULTADO` em `env` (sem interpolação em `run`). Mesmo padrão do `ci.yml:190-252` (#154).
- O job `portao <sha>` (`homolog.yml:260-285`) lê `needs.e2e.result` (`homolog.yml:262` e `:273`) e exige `success` de qualidade, banco, e2e, perf e migracao-smoke (`skipped` não vale); com escopo só docs, roda só `docs:check`. Só passa com as 2 partes verdes.
- Migração a partir da main e smoke: job `migracao-smoke` (`homolog.yml:200-258`; `migracao --origem main-src` e `homolog:subir`, que semeia e roda o smoke).
- Rodada real anterior ao split, push em `homolog`, run 39984250260 (2026-10-23, success, 28 min 47 s): `e2e-homolog` levou 28 min 29 s com 690 testes, margem de 1 min 31 s sob o teto de 30 min. A suíte hoje tem 716 testes; no PR #154 (run 40677944455) as partes levaram 12 min 31 s e 16 min 25 s. Ainda não houve push em `homolog` com o split.
- PR para a develop: `.github/workflows/ci.yml:5` (`pull_request`). Bateria: `rapida`, `testes`, `banco`, `openapi`, `imagem`, `build` (gate), `e2e-parte (1/2)` e `(2/2)` com `--shard=N/2` (`ci.yml:189-229`), agregador `e2e` (`ci.yml:241-253`) e `perf` (só PR para homolog/main). O push na develop não roda E2E.
- `EXIGIR_NOTURNA = false` em `tools/homolog/src/aprovacao.ts:8`; `fluxo-homologacao.md:55` descreve a noturna como informativa. Não foi alterado.

## Achados
- A1 (recomendado) .github/workflows/homolog.yml:125 · Já resolvido em 403e12b e 359cec1 (E2.2, K-172): a E2E em job único (28 min 29 s de 30) virou matriz de 2 partes (linhas 125-155) com agregador `e2e` (158-170). Sem ação.
- A2 (recomendado) docs/engineering/fluxo-homologacao.md:50 · Texto diz que o `e2e-homolog` roda contra o mock e que a E2E no ambiente implantado está pendente (H4); segue verdadeiro. Destino: tech-lead, se quiser citar o #154 e o split.
- A3 (recomendado) .github/workflows/homolog.yml:146 · `actionlint` fora do PATH, não executado; sintaxe revisada por leitura contra o `ci.yml`. Custo de dinheiro zero (`R-CUSTO`).

## Revalidação
Em 2026-10-28 (E2.11, K-144), sobre o head 07307872d8f04f7e4ccba4a5ff52737818bea26e. Desde o commit anterior (359cec1), `git diff --stat` mostra só `server/tests/plataforma2.test.ts` (teste do E1, vindo da develop) e os pareceres em `docs/qa/`, `docs/reviews/` e `docs/security/`. Nada em `.github/`: o `homolog.yml` que avaliei (matriz `e2e-parte`, agregador `e2e`, portão) está idêntico. Veredito inalterado: aprovado.

Em 2026-10-28 (E2.15, K-144), sobre o head 9d7eb43a63f0eb30b768ee576390cdc655577497. Desde o commit anterior (07307872), `git diff --stat` mostra 1 linha do `CLAUDE.md` e, vindos da develop com o #157 (026), os pareceres `docs/qa/026-*`, `docs/reviews/026-*` e os revalidados de `docs/qa/047-select-timeout.md`, `docs/reviews/047-select-timeout.md` e `docs/security/047-portao-e2e.md`. Nada em `.github/`: o `homolog.yml` que avaliei (matriz `e2e-parte`, agregador `e2e`, portão) está idêntico. Veredito inalterado: aprovado.
