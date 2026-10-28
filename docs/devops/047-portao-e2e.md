---
tipo: revisao-devops
contrato: 1
pedido: 047-pendencias-decididas-2026-10-28
branch: docs/047-portao-e2e
commit: 403e12b841349dce5c5a5556cd6501075bc2ee79
parecer: aprovado
revisor: forge:devops-engineer
data: 2026-10-28
---
# Review de devops: 047-portao-e2e (K-144)

## Parecer
Aprovado, sem mudança de workflow. O portão do push na `homolog` roda a E2E completa, a migração a partir da main e o smoke; o PR roda a bateria definida no `ci.yml`; `EXIGIR_NOTURNA` continua `false`. Há um risco de tempo no portão (achado 1).

## Evidências
- Portão no push da `homolog`: `.github/workflows/homolog.yml:7-9` (`on: push: branches: [homolog]`). Job `e2e-homolog` (`homolog.yml:125-148`) roda `pnpm --filter @metricas-dspd/e2e run test:chromium` (`homolog.yml:140`), que é `playwright test --project=chromium --project=chromium-semente-alt` (`e2e/package.json:10`): a E2E inteira, sem `--shard` nem `--grep`, mais o render dos diagramas Mermaid (`homolog.yml:136-139`). Isto cobre as 2 partes do #154 somadas (o #154 só dividiu o `ci.yml` em shards; o conjunto de projetos é o mesmo).
- Migração a partir da main e smoke: job `migracao-smoke` (`homolog.yml:179`), passos em `homolog.yml:220-223` (`migracao --origem main-src`) e `homolog.yml:232-233` (`homolog:subir`, que semeia e roda o smoke).
- O job `portao <sha>` (`homolog.yml:238-257`) exige `success` de qualidade, banco, e2e, perf e migracao-smoke (`skipped` não vale); se o escopo for só docs, roda só `docs:check`.
- Rodada real, push em `homolog`, run 39984250260 (2026-10-23, success, 28 min 47 s): `escopo`, `e2e-homolog` (28 min 29 s, "Running 690 tests"), `migracao-smoke` (2 min 15 s), `perf-homolog`, `banco-homolog`, `qualidade` e `portao 7486836a...` em success; `portao-docs` skipped (escopo código). É a última rodada do portão em `homolog`.
- PR para a develop: `.github/workflows/ci.yml:5` (`pull_request`). Bateria: `rapida`, `testes`, `banco`, `openapi`, `imagem`, `build` (gate), `e2e-parte (1/2)` e `(2/2)` com `--shard=N/2` (`ci.yml:189-229`), agregador `e2e` (`ci.yml:241-253`) e `perf` (só PR para homolog/main, `ci.yml:255-258`). O push na develop não roda E2E (`ci.yml:192`, `if` pull_request ou dispatch); ela corre no PR.
- `EXIGIR_NOTURNA = false` em `tools/homolog/src/aprovacao.ts:8`; `fluxo-homologacao.md:55` descreve a noturna como informativa. Não foi alterado.

## Achados
1. RESOLVIDO em 403e12b (E2.2, K-172): o `e2e-homolog` virou matriz `e2e-parte` (`parte: [1, 2]`, `--shard=N/2`, Mermaid só na parte 1, timeout de 30 min por parte, `fail-fast: false`) e o job `e2e` passou a agregador (nome `e2e-homolog`, `needs: [escopo, e2e-parte]`, `if: always()` no escopo código, falha se o resultado das partes não for `success`); o `portao` segue lendo `needs.e2e.result` e só passa com as 2 partes verdes. Achado original: `.github/workflows/homolog.yml:125-130` e `:140`: o `e2e-homolog` roda a suíte inteira num job só com `timeout-minutes: 30`. A última rodada levou 28 min 29 s com 690 testes (margem de 1 min 31 s). A suíte hoje tem 716 testes (PR #154, run 40677944455: 358 + 358, partes de 12 min 31 s e 16 min 25 s): é o mesmo crescimento que estourou o teto no CI (motivo do #154). Sem prova de falha ainda, porque não houve push em `homolog` depois do #154, mas a próxima rodada tem alta chance de estourar o teto e deixar o `portao` vermelho, o que bloqueia o `homolog-aprovada`. Destino: devops-engineer em pedido próprio, aplicando o mesmo padrão do #154 ao `homolog.yml` (matriz `parte: [1, 2]`, `--shard=N/2`, agregador mantendo o job id `e2e` que o `portao` consome), em branch `melhoria/*` pelo dono (`.github/`, `R-CONFORMIDADE`). Não alterei o workflow aqui: o brief só autoriza mudança se faltasse parte da E2E, e não falta.
2. recomendado, `fluxo-homologacao.md:50` e `:119`: o texto diz que o `e2e-homolog` roda contra o mock e que a E2E contra o ambiente implantado está pendente (H4); continua verdadeiro, sem ação aqui. Destino: tech-lead, se quiser citar o #154 na tabela.
3. Lacuna: `actionlint` fora do PATH, não executado (a sintaxe do workflow editado não foi validada por ferramenta; revisada por leitura contra o `ci.yml`). Custo de dinheiro zero (`R-CUSTO`).
