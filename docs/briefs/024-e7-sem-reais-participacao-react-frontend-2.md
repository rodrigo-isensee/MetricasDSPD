Agente destino: forge:react-frontend
Pedido: docs/pedidos/024-e7-sem-reais-participacao.md
Branch: feature/024-e7-sem-reais   Base: develop   Base-sha: d83024ba35763c0b56bebf8184cdbdf1d8da26e0

## Objetivo
Corrigir o achado A-7 (bloqueante) da rodada 2 do review do pedido 024: o cartão do E8 ainda manda ler junto com a "capacidade por sistema (E7)", nome que o dono trocou por "Entregas por sistema" (pedido 021). Etapa E1.4 do pedido 024 (o front do E5), cartão K-114. Worktree `/home/rodrigoisensee/MetricasDSPD-024`, branch `feature/024-e7-sem-reais` (head 191015e67ea38dba329d21b9590b477a4dc40cd1, no remoto).

## Ler
- `docs/reviews/024-e7-sem-reais.md`, seção "Rodada 2 (2026-10-17)", achado A-7.
- `web/src/features/complementares/estrategicas.tsx`, linhas 478 a 486 (o `<Leia>` do E8).
- `web/src/features/complementares/estrategicas.test.tsx`, bloco do E8.

## Entregar
- (E5) Trocar o texto do `<Leia>` do E8 para "Leia junto com as entregas por sistema (E7)." e acrescentar no bloco do E8 de `estrategicas.test.tsx` um teste que leia esse texto na tela.
- (E5) Procurar em `web/src` qualquer outro texto exibido com "capacidade por sistema" (sem diferenciar maiúsculas) e corrigir do mesmo jeito.
- (E5) Rodar da raiz da worktree `pnpm --filter @metricas-dspd/web typecheck` e `pnpm --filter @metricas-dspd/web test`; um commit (`fix(web): ...`, `git add` por caminho) e push sem `--force`.

## Fora do escopo
- "E5.1 (forge:node-backend): nome "Entregas por sistema" no cartão do E7 (`packages/contratos`), contratos e documentação gerada, depois do E1.6." · os achados A-8 e A-9 (comentário em `e7.ts`, `describe` em `e7.test.ts`, maiúscula em `docs/api/metricas.md`) vão ao node-backend em outro brief.
- "E1.2 (forge:tech-lead): review." e "E1.3 (forge:qa-engineer): QA." · etapas de outro papel; a rodada 3 do review vem depois.
- "E5.2 (forge:ux-designer): nome novo na especificação do 011 (§5 E7) e na revisão de UX." · já feita (092d0d1).
- "E2.1 (forge:software-architect): plano §2 E7 e ADR.", "E3.1 (forge:node-backend): contrato do E8 e do E9 alinhado à janela do cálculo." e "E4.1 (forge:node-backend): `concluidoEm` no contrato do E6." · já feitas.
- Mudar `packages/`, `server/`, `docs/`; o layout do cartão; E2E local; o PR; o quadro (`KANBAN.md`), que é do Jarvis.

## Decisões e restrições
- DECISÃO DO DONO (pedido 021, 2026-10-17): o E7 passa a se chamar "Entregas por sistema" (opção A).
- Decisão do usuário D2 = A (pedido 011): E7 sem R$, participação percentual por entregas.
- R-MAIN: nada na `main`. R-VERIFY: sem `--no-verify` nem `--force`. R-CONFORMIDADE: bloqueio não se contorna; vira relato.
- NÃO tocar: `packages/`, `server/`, `docs/`, `.github/`, o diretório principal, a worktree `-011-fase2`.
- Teto: 2 agentes de dia, uma tarefa pesada por vez (restrição do usuário de 2026-10-17, pedido 024, "Restrições do usuário"): só os comandos do web acima.

## Pronto quando
- PQ-1 (sha): commit `fix(web)` na branch, só com caminhos de `web/`.
- PQ-2 (cmd): `grep -rni 'capacidade por sistema' /home/rodrigoisensee/MetricasDSPD-024/web/src | wc -l` · espera: igual '0'
- PQ-3 (cmd): `grep -c 'entregas por sistema (E7)' /home/rodrigoisensee/MetricasDSPD-024/web/src/features/complementares/estrategicas.test.tsx` · espera: linhas=1
- PQ-4 (push): `git -C /home/rodrigoisensee/MetricasDSPD-024 ls-remote origin refs/heads/feature/024-e7-sem-reais` igual ao head local.

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (sha, testes do web, push); riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
