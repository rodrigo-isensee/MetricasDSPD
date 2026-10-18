Agente destino: forge:tech-lead
Pedido: docs/pedidos/024-e7-sem-reais-participacao.md
Branch: feature/024-e7-sem-reais   Base: develop   Base-sha: d83024ba35763c0b56bebf8184cdbdf1d8da26e0

## Objetivo
Rodada 5 do code review do pedido 024, só sobre o commit b390b0c7d88bc30d4e0749a801710b009fcd48a3, com que o QA corrigiu a formatação do teste G3 em `e8.test.ts` (bug 024-001, que deixou a `rapida` vermelha no run 39037889777). Etapa E1.10 do pedido 024, cartão K-114. Worktree `/home/rodrigoisensee/MetricasDSPD-024`, branch `feature/024-e7-sem-reais` (head b390b0c7d88bc30d4e0749a801710b009fcd48a3, no remoto).

## Ler
- `docs/reviews/024-e7-sem-reais.md`, frontmatter e "Rodada 4".
- Na worktree: `git show b390b0c7d88bc30d4e0749a801710b009fcd48a3` e `git diff --word-diff=plain 4fb04ad5756913c8d191af7f54b338d67120d442 b390b0c7d88bc30d4e0749a801710b009fcd48a3 -- packages/metricas/src/businessmap/e8.test.ts` (deve mostrar só quebra de linha e vírgula final, os mesmos tokens e asserções; `git diff -w` não serve, porque não ignora quebra de linha).

## Entregar
- (E1) Conferir que o commit só reformata `e8.test.ts` (sem mudar asserção nem dado) e acrescenta o registro do bug em `docs/qa/bugs/`; rodar `pnpm run format:check` e `pnpm run lint` da raiz da worktree.
- (E1) Acrescentar a "Rodada 5 (2026-10-17)" ao parecer `docs/reviews/024-e7-sem-reais.md`, gravado com a ferramenta Edit (registro de autoria), com o frontmatter `commit:` no sha curto de b390b0c7d88bc30d4e0749a801710b009fcd48a3 e `parecer:` final; um commit só do parecer e push sem `--force`.

## Fora do escopo
- "E1.3 (forge:qa-engineer): QA." · o parecer de QA vem depois desta rodada.
- "E1.9 (forge:qa-engineer): corrigir a formatação de `e8.test.ts` (bug 024-001, Prettier na linha 119), sem mudar o que o teste afirma, com `format:check` e `lint` verdes" · já feita (b390b0c7d88bc30d4e0749a801710b009fcd48a3).
- "E2.1 (forge:software-architect): plano §2 E7 e ADR.", "E3.1 (forge:node-backend): contrato do E8 e do E9 alinhado à janela do cálculo.", "E4.1 (forge:node-backend): `concluidoEm` no contrato do E6." e "E5.1 (forge:node-backend): nome "Entregas por sistema" no cartão do E7 (`packages/contratos`), contratos e documentação gerada, depois do E1.6." · já feitas e revisadas.
- Reabrir o que as rodadas 2 a 4 aprovaram; o PR; o quadro (`KANBAN.md`), que é do Jarvis.

## Decisões e restrições
- DECISÃO DO DONO (pedido 021, 2026-10-17): o E7 passa a se chamar "Entregas por sistema" (opção A).
- Decisão técnica do time (pedido 024, 2026-10-17): o QA corrige a formatação (E1.9) e a rodada 5 do review olha só essa correção.
- R-MAIN: nada na `main`. R-VERIFY: sem `--no-verify` nem `--force`; commit enviado não se emenda. R-CONFORMIDADE: bloqueio não se contorna; vira relato.
- NÃO tocar: código, testes, `.github/`, o diretório principal, a worktree `-011-fase2`.
- Teto: 2 agentes de dia, uma tarefa pesada por vez (restrição do usuário de 2026-10-17, pedido 024, "Restrições do usuário"): só `format:check` e `lint`; sem `pronto` nem E2E local.

## Pronto quando
- PQ-1 (sha): commit `docs(review)` da rodada 5, com só `docs/reviews/024-e7-sem-reais.md`.
- PQ-2 (cmd): `grep -c '^parecer: aprovado' /home/rodrigoisensee/MetricasDSPD-024/docs/reviews/024-e7-sem-reais.md` · espera: igual '1'
- PQ-3 (cmd): `grep -c '^commit: b390b0c' /home/rodrigoisensee/MetricasDSPD-024/docs/reviews/024-e7-sem-reais.md` · espera: igual '1'
- PQ-4 (push): `git -C /home/rodrigoisensee/MetricasDSPD-024 ls-remote origin refs/heads/feature/024-e7-sem-reais` igual ao head local.

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (sha, word-diff só de formatação, format:check, lint, saída do `forge-check pr 024-e7-sem-reais --ref feature/024-e7-sem-reais --base develop`); riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
