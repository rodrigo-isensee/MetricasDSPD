Agente destino: forge:qa-engineer
Pedido: docs/pedidos/024-e7-sem-reais-participacao.md
Branch: feature/024-e7-sem-reais   Base: develop   Base-sha: d83024ba35763c0b56bebf8184cdbdf1d8da26e0

## Objetivo
Corrigir o bug 024-001 que você achou: o teste G3 em `packages/metricas/src/businessmap/e8.test.ts` (linha 119) não passa no `format:check` (Prettier) e deixou a `rapida` da CI vermelha (run 39037889777, head 4fb04ad). Decisão técnica do Jarvis (pedido 024, 2026-10-17): o QA corrige a formatação, sem mudar o que o teste afirma. Etapa E1.9 do pedido 024, cartão K-114. Worktree `/home/rodrigoisensee/MetricasDSPD-024`, branch `feature/024-e7-sem-reais` (head 4fb04ad5756913c8d191af7f54b338d67120d442, no remoto).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-024/docs/qa/bugs/024-001-e8-test-fora-do-prettier.md` (o seu registro, sem commit).
- `packages/metricas/src/businessmap/e8.test.ts`, linhas 110 a 130.

## Entregar
- (E1) Formatar só `e8.test.ts` com o Prettier do projeto (`pnpm exec prettier --write packages/metricas/src/businessmap/e8.test.ts`), sem mudar asserção nem dado do teste; rodar da raiz da worktree `pnpm run format:check`, `pnpm run lint` e `pnpm --filter @metricas-dspd/metricas test`.
- (E1) Um commit `test(...)` com `e8.test.ts` e o registro do bug `docs/qa/bugs/024-001-e8-test-fora-do-prettier.md` (marcado como corrigido, com o sha), `git add` por caminho, e push sem `--force`.

## Fora do escopo
- "E1.10 (forge:tech-lead): rodada 5 do review, só sobre a correção de formatação do E1.9" · etapa de outro papel; vem depois.
- "E1.3 (forge:qa-engineer): QA." · o parecer vem depois da rodada 5, por outro brief.
- "E1.7 (forge:qa-engineer): testes das lacunas G1 a G3 achadas no QA (nome do E7 no catálogo, no cartão e na tela; VERSAO_CRITERIO_E7_SEM_REAIS nos critérios do E7; E8 sem efeito do período), num commit só de testes, antes da rodada 4 do review" e "E1.8 (forge:tech-lead): rodada 4 do review, só sobre os testes do E1.7" · já feitas.
- "E2.1 (forge:software-architect): plano §2 E7 e ADR.", "E3.1 (forge:node-backend): contrato do E8 e do E9 alinhado à janela do cálculo." e "E4.1 (forge:node-backend): `concluidoEm` no contrato do E6." · já feitas.
- "E5.1 (forge:node-backend): nome "Entregas por sistema" no cartão do E7 (`packages/contratos`), contratos e documentação gerada, depois do E1.6." · já feita.
- Mudar outro arquivo, código de produção ou o que os testes afirmam; o parecer de QA; o PR; o quadro (`KANBAN.md`), que é do Jarvis.

## Decisões e restrições
- DECISÃO DO DONO (pedido 021, 2026-10-17): o E7 passa a se chamar "Entregas por sistema" (opção A).
- Decisão do usuário D2 = A (pedido 011): E7 sem R$, participação percentual por entregas.
- R-MAIN: nada na `main`. R-VERIFY: sem `--no-verify` nem `--force`; commit enviado não se emenda. R-CONFORMIDADE: bloqueio não se contorna; vira relato.
- NÃO tocar: código de produção, outros testes, `docs/reviews/`, `docs/ux/`, `.github/`, o diretório principal, a worktree `-011-fase2`.
- Teto: 2 agentes de dia, uma tarefa pesada por vez (restrição do usuário de 2026-10-17, pedido 024, "Restrições do usuário"): só os comandos acima; sem `pronto` nem E2E local.

## Pronto quando
- PQ-1 (sha): commit `test(...)` na branch, com só `packages/metricas/src/businessmap/e8.test.ts` e `docs/qa/bugs/024-001-e8-test-fora-do-prettier.md`.
- PQ-2 (cmd): `pnpm --dir /home/rodrigoisensee/MetricasDSPD-024 run format:check` · espera: rc=0
- PQ-3 (cmd): `pnpm --dir /home/rodrigoisensee/MetricasDSPD-024 run lint` · espera: rc=0
- PQ-4 (push): `git -C /home/rodrigoisensee/MetricasDSPD-024 ls-remote origin refs/heads/feature/024-e7-sem-reais` igual ao head local.

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (sha, diff só de formatação, saídas de format:check, lint e testes); riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
