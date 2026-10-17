Agente destino: forge:node-backend
Pedido: docs/pedidos/024-e7-sem-reais-participacao.md
Branch: feature/024-e7-sem-reais   Base: develop   Base-sha: d83024ba35763c0b56bebf8184cdbdf1d8da26e0

## Objetivo
Corrigir os achados A-8 e A-9 (recomendados) da rodada 2 do review do pedido 024, para a rodada 3 fechar sem pendência: restos do nome antigo do E7 no back e uma maiúscula na doc da API. Etapa E5.1 do pedido 024, cartão K-114. Worktree `/home/rodrigoisensee/MetricasDSPD-024`, branch `feature/024-e7-sem-reais` (comece depois do commit do react-frontend do A-7; faça `git pull --ff-only` antes).

## Ler
- `docs/reviews/024-e7-sem-reais.md`, seção "Rodada 2 (2026-10-17)", achados A-8 e A-9.
- `packages/metricas/src/businessmap/e7.ts` (linha 14), `packages/metricas/src/businessmap/e7.test.ts` (linha 45) e `docs/api/metricas.md` (linha 159).

## Entregar
- (E5) A-8: trocar "capacidade por sistema" por "entregas por sistema" no comentário de `e7.ts` e no `describe` de `e7.test.ts`; procurar o nome antigo no resto de `packages/` e `server/`, sem tocar no registro histórico de `packages/metricas/src/core/criterios.ts`.
- (E1) A-9: em `docs/api/metricas.md`, "resposta. os três" passa a "resposta. Os três"; regenerar o que for gerado e rodar `pnpm run docs:check`.
- (E1, E5) Rodar `pnpm --filter @metricas-dspd/metricas test` da raiz da worktree; um commit (`refactor(metricas): ...` ou `docs: ...`, `git add` por caminho) e push sem `--force`.

## Fora do escopo
- "E1.4 (forge:react-frontend): ajustar o teste do front que lê `custoConfigurado` e os testes que citam o título do E7 (E5), depois de trazer a develop com o #108" · o A-7 (texto do E8 na tela) é do react-frontend, em outro brief.
- "E1.2 (forge:tech-lead): review." e "E1.3 (forge:qa-engineer): QA." · etapas de outro papel; a rodada 3 vem depois.
- "E5.2 (forge:ux-designer): nome novo na especificação do 011 (§5 E7) e na revisão de UX." · já feita.
- "E2.1 (forge:software-architect): plano §2 E7 e ADR.", "E3.1 (forge:node-backend): contrato do E8 e do E9 alinhado à janela do cálculo." e "E4.1 (forge:node-backend): `concluidoEm` no contrato do E6." · já feitas.
- Mudar cálculo; `web/`; `docs/ux/`, `docs/qa/`, `docs/reviews/`; o PR; o quadro (`KANBAN.md`), que é do Jarvis.

## Decisões e restrições
- DECISÃO DO DONO (pedido 021, 2026-10-17): o E7 passa a se chamar "Entregas por sistema" (opção A).
- Decisão do usuário D2 = A (pedido 011): E7 sem R$, participação percentual por entregas.
- O histórico de mudança de critério não se reescreve (regra T2.6 do `CLAUDE.md`).
- R-MAIN: nada na `main`. R-VERIFY: sem `--no-verify` nem `--force`. R-CONFORMIDADE: bloqueio não se contorna; vira relato.
- NÃO tocar: `web/`, `.github/`, o diretório principal, a worktree `-011-fase2`.
- Teto: 2 agentes de dia, uma tarefa pesada por vez (restrição do usuário de 2026-10-17, pedido 024, "Restrições do usuário"): só o teste de pacote e o `docs:check`.

## Pronto quando
- PQ-1 (sha): commit do A-8 e do A-9 na branch, só com caminhos de `packages/` e `docs/`.
- PQ-2 (cmd): `grep -rni 'capacidade por sistema' /home/rodrigoisensee/MetricasDSPD-024/packages/metricas/src/businessmap | wc -l` · espera: igual '0'
- PQ-3 (cmd): `grep -c 'resposta. os três' /home/rodrigoisensee/MetricasDSPD-024/docs/api/metricas.md` · espera: igual '0'
- PQ-4 (push): `git -C /home/rodrigoisensee/MetricasDSPD-024 ls-remote origin refs/heads/feature/024-e7-sem-reais` igual ao head local.

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (sha, testes, push); riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
