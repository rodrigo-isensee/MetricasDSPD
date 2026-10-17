Agente destino: forge:tech-lead
Pedido: docs/pedidos/024-e7-sem-reais-participacao.md
Branch: feature/024-e7-sem-reais   Base: develop   Base-sha: d83024ba35763c0b56bebf8184cdbdf1d8da26e0

## Objetivo
Rodada 3 do code review do pedido 024, só sobre os ajustes que a sua rodada 2 pediu: A-7 (texto do E8 na tela com o nome antigo do E7) e A-8 e A-9 (restos do nome no back e uma maiúscula na doc). Etapa E1.2 do pedido 024, cartão K-114. Worktree `/home/rodrigoisensee/MetricasDSPD-024`, branch `feature/024-e7-sem-reais` (head d0fcb7bd88a6bf773d49ccb451294872fa2486e7, no remoto).

## Ler
- `docs/reviews/024-e7-sem-reais.md`, seção "Rodada 2 (2026-10-17)" (A-7, A-8, A-9).
- Na worktree: `git diff 191015e67ea38dba329d21b9590b477a4dc40cd1 d0fcb7bd88a6bf773d49ccb451294872fa2486e7` (commits 19accc9, 83c5f49 e d0fcb7b).

## Entregar
- (E5) Conferir que A-7, A-8 e A-9 estão resolvidos e que o diff não traz nada além deles; o teste novo do E8 lê o texto da tela.
- (E5) Acrescentar a "Rodada 3 (2026-10-17)" ao parecer `docs/reviews/024-e7-sem-reais.md`, gravado com a ferramenta Edit ou Write (registro de autoria), com o frontmatter `commit:` no sha curto de d0fcb7bd88a6bf773d49ccb451294872fa2486e7 e `parecer:` final; commit só do parecer e push sem `--force`. Ajuste novo volta ao autor; não corrija você.
- (E5) Rodar `forge-check pr 024-e7-sem-reais --ref feature/024-e7-sem-reais --base develop` na worktree e copiar a saída (deve sobrar só a falta do parecer de QA).

## Fora do escopo
- "E1.3 (forge:qa-engineer): QA." · etapa de outro papel; vem depois deste review.
- "E1.4 (forge:react-frontend): ajustar o teste do front que lê `custoConfigurado` e os testes que citam o título do E7 (E5), depois de trazer a develop com o #108" e "E5.1 (forge:node-backend): nome "Entregas por sistema" no cartão do E7 (`packages/contratos`), contratos e documentação gerada, depois do E1.6." · já feitas, com os ajustes desta rodada.
- "E2.1 (forge:software-architect): plano §2 E7 e ADR.", "E3.1 (forge:node-backend): contrato do E8 e do E9 alinhado à janela do cálculo." e "E4.1 (forge:node-backend): `concluidoEm` no contrato do E6." · já feitas e revisadas na rodada 2.
- Reabrir o que a rodada 2 aprovou; o PR; o quadro (`KANBAN.md`), que é do Jarvis.

## Decisões e restrições
- DECISÃO DO DONO (pedido 021, 2026-10-17): o E7 passa a se chamar "Entregas por sistema" (opção A).
- Decisão do usuário D2 = A (pedido 011): E7 sem R$, participação percentual por entregas.
- O histórico de `criterios.ts` não se reescreve (regra T2.6 do `CLAUDE.md`).
- R-MAIN: nada na `main`. R-VERIFY: sem `--no-verify` nem `--force`. R-CONFORMIDADE: bloqueio não se contorna; vira relato.
- NÃO tocar: código, `.github/`, o diretório principal, a worktree `-011-fase2`.
- Teto: 2 agentes de dia, uma tarefa pesada por vez (restrição do usuário de 2026-10-17, pedido 024, "Restrições do usuário"): sem `pronto` nem E2E local.

## Pronto quando
- PQ-1 (sha): commit `docs(review)` da rodada 3, com só `docs/reviews/024-e7-sem-reais.md`.
- PQ-2 (cmd): `grep -c '^parecer: aprovado' /home/rodrigoisensee/MetricasDSPD-024/docs/reviews/024-e7-sem-reais.md` · espera: igual '1'
- PQ-3 (push): `git -C /home/rodrigoisensee/MetricasDSPD-024 ls-remote origin refs/heads/feature/024-e7-sem-reais` igual ao head local.

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (sha, achados, saída do `forge-check pr`); riscos. Se reprovar, PQ-2 fica "não cumprido" com os ajustes por autor. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
