Agente destino: forge:qa-engineer
Pedido: docs/pedidos/036-estrategicas-pendentes.md
Branch: feature/036-estrategicas-pendentes   Base: develop   Base-sha: 12018deb8e35a7b473d6e8c1b7a693795a80c1ac

## Objetivo
Medir de novo o FA-006 (CLS de /estrategico com `VITE_FONTE=api` era 0,113, acima do limite F2 < 0,1 da ADR 0003) para saber se o bug ainda existe na develop atual, antes de pedir correção. Cartão K-118, etapa E1.1 do pedido 036. Worktree `/home/rodrigoisensee/MetricasDSPD-030`, já na branch `feature/036-estrategicas-pendentes` (criada da `origin/develop` 12018de na tentativa anterior, com `pnpm install` feito). A tentativa anterior parou por falta de bibliotecas de sistema do Chromium; o dono as instalou (`ldd` do chrome-headless-shell sem "not found").

## Ler
- `docs/qa/bugs/FA-006-cls-de-estrategico-em-api-acima-do-orcamento.md` (inteiro: passos e resultado anterior).
- `docs/architecture/adr/0003-orcamento-de-performance.md`, linha da F2 (tabela) e a seção de medição (linha 84).

## Entregar
- (E1) Rodar o teste "F2 CLS e C6 tarefa longa em /estrategico" 3 vezes em `api` (passo 1 do bug, `scripts/com-api-mock.sh` sem o `flock`, que o hook do Forge recusa) e 3 vezes em mock (`pnpm run test:perf` no `e2e/`), uma suíte pesada por vez (R-TETO): antes de cada execução, confirme que não há outro playwright nem vitest rodando (`pgrep -fa 'playwright|vitest'`).
- (E1) Acrescentar ao arquivo do bug uma seção `## Reteste 2026-10-20` com os 6 valores de CLS, o sha da develop medida e a conclusão: "reproduz" (algum valor em api >= 0,1) ou "não reproduz" (os 3 em api < 0,1). Um commit só desse arquivo, com `git add` explícito (o forge:react-frontend pode ter commitado o catálogo na mesma branch: não toque em `web/`), mensagem conforme a seção de commits do `docs/engineering/praticas.md`; push da branch.

## Fora do escopo
- "E2.1 (forge:qa-engineer): teste do IFA-001 em /estrategico, na mesma branch, depois do E1.1 (R-WIP)." · etapa do mesmo papel em outro momento, no brief seguinte (K-091).
- "E1.2 (forge:react-frontend): correção do FA-006, só se a medição confirmar o estouro." · etapa de outro papel.
- "E1.3 (forge:tech-lead): code review." e "E1.5 (forge:tech-lead): PR para a develop e merge." · etapas de outro papel.
- "E1.4 (forge:qa-engineer): QA e parecer." · etapa do mesmo papel em outro momento, depois do review.
- "E3.1 (dono): decidir o texto do E7 no catálogo (feito: opção A)." · etapa do dono, cumprida.
- "E3.2 (forge:react-frontend): trocar o texto no catálogo e o teste que o cita." e "E3.3 (forge:ux-designer): trocar o texto na especificação." · etapas de outro papel.
- Corrigir código de `web/` ou mudar o limite da ADR 0003; PR; o quadro (`KANBAN.md`), que é do Jarvis.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-20): ordem das pendências: "veja se tem algo das metricas estrategicas pendentes se tem comece por ele, senao va para taticas e por ultimo operacional. Depois de tudo isso faremos as integracoes oficiais funcionar."
- DECISÃO DO DONO (2026-10-20): recibo do pedido 036 aceito ("sim").
- DECISÃO DO DONO (2026-10-20): E7 no catálogo, opção A ("A"): a pergunta passa a ser "Qual a participação de cada sistema nas nossas entregas?" (catálogo `web/src/content/catalogo-metricas.ts` e especificação `docs/ux/metricas-tambem-disponiveis/02-especificacao.md` §E7).
- ADR 0003 (citada no pedido): F2, CLS < 0,1 é limite de bloqueio; o limite não muda nesta entrega, só se mede contra ele.
- Pré-condições: Docker de pé para o `scripts/com-api-mock.sh`; Chromium do Playwright instalado. Se faltar, relatar e parar (R-CONFORMIDADE).
- R-MAIN: nada na `main`. R-VERIFY: nunca `--no-verify` nem `--force`.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-030 log -1 --format=%h` da branch · espera: o hash do commit do reteste.
- PQ-2 (push): `git ls-remote origin refs/heads/feature/036-estrategicas-pendentes` igual ao head local.
- PQ-3 (cmd): `grep -c '^## Reteste 2026-10-20' /home/rodrigoisensee/MetricasDSPD-030/docs/qa/bugs/FA-006-cls-de-estrategico-em-api-acima-do-orcamento.md` · espera: igual '1'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
