# K-101: causa da falha da rodada noturna 38718401054 (diagnóstico do QA)

Seção destinada ao parecer do devops `docs/devops/homolog-2026-10-16.md`. O hook R-CONFORMIDADE bloqueou a escrita do QA em `docs/devops/`: o devops deve colar esta seção lá (R-DECISAO, o bloqueio não foi contornado).

- Autor: `qa-engineer`, 2026-10-15. Fonte: artefato `e2e-relatorio` do run (lido como dados: `error-context.md`, nomes de pasta e fonte do teste; nada executado). Job `e2e-homolog` 116366696200.
- **Teste que falhou:** um só, `e2e/tests/intensivo-filtros.spec.ts:401`, "IF-A /operacional?cadencia=semanal: cartão que diz "Não afetado por X" não muda quando X sai", em Chromium. Falhou na tentativa inicial e no retry 1, as duas com `Test timeout of 30000ms exceeded` (primeira: `toBeVisible` do primeiro `metrica-*` ou painel; segunda: `toHaveCount(0)` de `[aria-busy="true"]`). É a asserção que estava em curso quando os 30 s do teste inteiro acabaram. Nenhum outro teste aparece no artefato como falho.
- **Causa: defeito do teste (orçamento de tempo), já corrigido. Não é instabilidade nem ambiente.**
  - O teste navega uma vez por cartão "Não afetado por" e espera o painel assentar a cada página. Na rota semanal o total passa de 30 s no runner da CI (o comentário do código registra 25 s em `/tatico` e 31 s na semanal).
  - O run testou `3fd233c` (main, schedule) e o candidato `6242366`. Nenhum dos dois contém o commit `b5ac4f5` (PR #75, K-083, "IF-A com orçamento de tempo próprio": `test.setTimeout(120_000)`), verificado com `git merge-base --is-ancestor`. O `ddf0af1` (candidato atual) contém o commit.
  - Evidência de que o remédio funcionou: o portão de homologação 38829765873 em `ddf0af1` passou inteiro, `e2e-homolog` incluído.
- **Hipótese anterior refutada:** a suposição do devops (K-094, `seed.pg` "dois seeds simultâneos") não se sustenta. O job `banco-homolog` da mesma rodada passou, e o teste de concorrência do seed passa também no código antigo (review do K-094).
- Bug aberto: **nenhum** (já corrigido pelo K-083). O K-101 pode fechar como "corrigido por K-083 (b5ac4f5), confirmado verde no portão 38829765873".
- Risco residual: o teste continua lento (cerca de 25 a 31 s por rota na CI, orçamento de 120 s). Se a lista de métricas complementares crescer, a folga some de novo. Vale o `react-frontend` acompanhar junto do cartão de perf da rota semanal.
