Agente destino: forge:react-frontend
Pedido: docs/pedidos/036-estrategicas-pendentes.md
Branch: feature/036-estrategicas-pendentes   Base: develop   Base-sha: 12018deb8e35a7b473d6e8c1b7a693795a80c1ac

## Objetivo
Trocar a pergunta do E7 no catálogo de métricas, pela decisão do dono (opção A), para casar com o nome "Entregas por sistema" e com o que o gráfico mostra. Etapa E3.2 do pedido 036. Worktree `/home/rodrigoisensee/MetricasDSPD-030`, já na branch `feature/036-estrategicas-pendentes` (head 12018de, sem commits próprios).

## Ler
- `web/src/content/catalogo-metricas.ts`, a entrada do E7 (linha 535).
- `docs/ux/revisao-024-e7-nome.md`, achado 1 (origem da sugestão).

## Entregar
- (E3) Em `web/src/content/catalogo-metricas.ts`, trocar "Quanto da nossa capacidade vai para manter cada sistema do parque?" por "Qual a participação de cada sistema nas nossas entregas?". Se algum teste de `web/` ou `e2e/` passar a citar o texto, ajustar; hoje nenhum cita (`git grep`).
- (E3) Testes de unidade do `web/` verdes (`pnpm --filter @metricas-dspd/web test`, sem navegador) e lint verde (`pnpm run lint` na raiz da worktree); um commit, com `git add` explícito por caminho, mensagem conforme a seção de commits do `docs/engineering/praticas.md`; push da branch.

## Fora do escopo
- "E3.3 (forge:ux-designer): trocar o texto na especificação." · etapa de outro papel (a especificação em `docs/ux/` é do ux-designer).
- "E1.1 (forge:qa-engineer): medição do FA-006 (3 execuções, mock e api), na branch do pedido." e "E2.1 (forge:qa-engineer): teste do IFA-001 em /estrategico, na mesma branch, depois do E1.1 (R-WIP)." · etapas de outro papel (bloqueadas: falta biblioteca de sistema do Chromium).
- "E1.2 (forge:react-frontend): correção do FA-006, só se a medição confirmar o estouro." · etapa do mesmo papel em outro momento, depende da medição.
- "E1.3 (forge:tech-lead): code review.", "E1.4 (forge:qa-engineer): QA e parecer." e "E1.5 (forge:tech-lead): PR para a develop e merge." · etapas de outro papel.
- "E3.1 (dono): decidir o texto do E7 no catálogo (feito: opção A)." · etapa do dono, cumprida.
- Testes E2E e de desempenho (precisam do Chromium, bloqueado); PR; o quadro.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-20): ordem das pendências: "veja se tem algo das metricas estrategicas pendentes se tem comece por ele, senao va para taticas e por ultimo operacional. Depois de tudo isso faremos as integracoes oficiais funcionar."
- DECISÃO DO DONO (2026-10-20): recibo do pedido 036 aceito ("sim").
- DECISÃO DO DONO (2026-10-20): E7 no catálogo, opção A ("A"): a pergunta passa a ser "Qual a participação de cada sistema nas nossas entregas?" (catálogo `web/src/content/catalogo-metricas.ts` e especificação `docs/ux/metricas-tambem-disponiveis/02-especificacao.md` §E7).
- ADR 0003 (citada no pedido): não se aplica a esta troca de texto; nada de layout muda.
- NÃO tocar: `docs/`, `server/`, `e2e/` e o resto de `web/` além do catálogo (e de um teste, se algum passar a citar o texto).
- R-MAIN: nada na `main`. R-VERIFY: nunca `--no-verify` nem `--force`.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-030 log -1 --format=%h` da branch · espera: o hash do commit da troca.
- PQ-2 (push): `git ls-remote origin refs/heads/feature/036-estrategicas-pendentes` igual ao head local.
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-030 grep -c 'Qual a participação de cada sistema nas nossas entregas?' -- web/src/content/catalogo-metricas.ts` · espera: igual 'web/src/content/catalogo-metricas.ts:1'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
