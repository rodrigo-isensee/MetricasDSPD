Agente destino: forge:tech-lead
Pedido: docs/pedidos/024-e7-sem-reais-participacao.md
Branch: feature/024-e7-sem-reais   Base: develop   Base-sha: d83024ba35763c0b56bebf8184cdbdf1d8da26e0

## Objetivo
Preparar a branch do pedido 024 (E7 sem R$) para o ajuste do front e a rodada 2 do review: commitar a correção A-5 do arquiteto e trazer a develop, que agora tem o front das estratégicas (#108, d83024ba35763c0b56bebf8184cdbdf1d8da26e0). Etapa E1.5 do pedido 024, cartão K-114. Worktree `/home/rodrigoisensee/MetricasDSPD-024`, branch `feature/024-e7-sem-reais` (head 8913d54030f526bf569a8c3decb9fb6bb9f33681).

## Ler
- `docs/pedidos/024-e7-sem-reais-participacao.md`, seções "Etapas" e "Decisões técnicas do time".
- Na worktree: `git diff -- docs/architecture/features/metricas-tambem-disponiveis.md` (a correção A-5, sem commit).

## Entregar
- (E2) Rodar `pnpm run docs:check` da raiz da worktree e commitar a correção A-5 num commit próprio (`docs(architecture): ...`, `git add` só de `docs/architecture/features/metricas-tambem-disponiveis.md`), pela decisão técnica do time de 2026-10-17 (pedido 024).
- (E1) Trazer a develop para a branch por merge (`git merge origin/develop`, sem rebase), depois de `git fetch`. Conflito só de documentação ou de import: resolva e registre no corpo do commit de merge. Conflito em lógica de cálculo, contrato ou teste: pare sem concluir o merge (`git merge --abort`) e relate os arquivos.
- (E1) Push da branch, sem `--force`.

## Fora do escopo
- "E1.4 (forge:react-frontend): ajustar o teste do front que lê `custoConfigurado`, depois de trazer a develop com o #108" · etapa de outro papel; continua no pedido.
- "E1.2 (forge:tech-lead): review." · a rodada 2 vem depois do E1.4, por outro brief.
- "E1.3 (forge:qa-engineer): QA." · etapa de outro papel.
- "E3.1 (forge:node-backend): contrato do E8 e do E9 alinhado à janela do cálculo." · etapa de outro papel, já feita (E3, 7e92cd9c9eba973156595de9760892957c979597).
- "E4.1 (forge:node-backend): `concluidoEm` no contrato do E6." · etapa de outro papel, já feita (E4, beb71c64b4a043e7845eace5cf41effe586a3c58).
- Corrigir testes que quebrarem pelo merge (vão ao react-frontend no E1.4 ou ao node-backend); o PR; o nome do E7 (pendente de confirmação do usuário); o quadro (`KANBAN.md`), que é do Jarvis.

## Decisões e restrições
- Decisão do usuário D2 = A (pedido 011): E7 sem R$, participação percentual por entregas; renomear o E7 está pendente de confirmação do usuário (pedido 021).
- Decisões técnicas do time (pedido 024, 2026-10-17): documentos do arquiteto commitados pelo tech-lead; a branch traz a develop depois do merge do #108 e o react-frontend ajusta o teste do front nela, antes do QA.
- R-MAIN: nada na `main`. R-VERIFY: sem `--no-verify` nem `--force`. R-CONFORMIDADE: bloqueio não se contorna; vira relato.
- NÃO tocar: código e pareceres além do que o merge trouxer, `.github/`, o diretório principal, a worktree `-011-fase2`.
- Teto: 2 agentes de dia, uma tarefa pesada por vez (restrição do usuário de 2026-10-17, pedido 024, "Restrições do usuário"): sem `pronto` nem E2E local; rode só o `docs:check` e, depois do merge, `pnpm -r typecheck` para relatar se algo quebrou (sem corrigir).

## Pronto quando
- PQ-1 (sha): commit `docs(architecture)` da correção A-5 na branch, só com `docs/architecture/features/metricas-tambem-disponiveis.md`.
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-024 merge-base --is-ancestor d83024ba35763c0b56bebf8184cdbdf1d8da26e0 HEAD && echo contem` · espera: igual 'contem'
- PQ-3 (push): `git -C /home/rodrigoisensee/MetricasDSPD-024 ls-remote origin refs/heads/feature/024-e7-sem-reais` igual ao head local.
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-024 status --porcelain` · espera: linhas=0

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (shas, conflitos e como resolveu, resultado do `typecheck`); riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
