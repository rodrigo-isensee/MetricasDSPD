## Objetivo
Fechar o K-102 (perf da visão semanal: a fila de montagem dos gráficos que destrava o Lighthouse da rota semanal) aplicando os ajustes R1 a R5 do code review, para seguir a QA, UX e PR. Cartão K-102, worktree `/home/rodrigoisensee/MetricasDSPD-perf-semanal`, branch `fix/perf-visao-semanal`.

## Ler
- `docs/reviews/k102-perf-semanal.md` (na worktree), seção "Ajustes recomendados" (R1 a R5) e item 4 "Acessibilidade" (testes E2E que leem o SVG).
- `git -C /home/rodrigoisensee/MetricasDSPD-perf-semanal diff`: há mudanças sem commit em 7 arquivos, do seu trabalho anterior nos R1 a R5. Confira o que já está feito antes de refazer.
- `docs/engineering/praticas.md`, seção de commits.

## Entregar
- (E1) R1: `try/finally` em volta do `flushSync(pedido)` em `web/src/components/charts/filaDeGraficos.ts`.
- (E1) R2: `docs/tecnica/arquitetura-front.md` §10 registra a exceção do `GraficoMensal` (SerieMensal) ou o passa pela fila, e escreve o critério de reversão.
- (E1) R3: `afterAll(() => definirFilaImediata(false))` em `graficos.test.tsx` e `graficos-composicao.test.tsx`.
- (E1) R4: comentário em `filaDeGraficos.ts` e linha em §10 sobre `flushSync` interromper transições.
- (E1) R5: prova forte de "um por tarefa" em `filaDeGraficos.test.tsx` (sequência 0, 1, 2, 3).
- (E1) Os ajustes nos E2E que leem o SVG (`e2e/tests/b12-fluxo.spec.ts`, `e2e/tests/b3-sust-ei-vg.spec.ts`) só se o review os pede.
- Commits na branch `fix/perf-visao-semanal`, `git add` por caminho, sem push.
- Fora do escopo, outros itens do pedido 012 (etapas de outros papéis, citadas de "## Etapas"): "E2.1 (forge:tech-lead): limpeza de worktrees."; "E3.1 (forge:tech-lead): PR de docs da retomada."; "E4.1 (forge:devops-engineer): checks vermelhos do #101."; "E5.1 (forge:node-backend): corrigir o montecarlo.test.ts instável."; "E6.1 (forge:devops-engineer): homolog-aprovada espera o portão."
- Fora do escopo, etapas seguintes do E1 (citadas de "## Etapas"): "E1.2 (forge:tech-lead): review do K-102."; "E1.3 (forge:qa-engineer): QA do K-102."; "E1.4 (forge:ux-designer): revisão de UX do K-102."; "E1.5 (forge:tech-lead): PR do K-102 para a develop."
- Fora do escopo: o front do 011 (cartão K-109, outro pedido); merge da develop na branch.

## Decisões e restrições
- Caminho (c) do K-102, decidido pelo architect: fatiar ou adiar o render da semanal (`docs/architecture/notas/c6-011.md`). O Web Worker não entra aqui.
- Orçamento de performance: ADR 0003. Não afrouxe orçamento nem teste de perf.
- NÃO tocar: `.github/`, `server/`, `packages/`, nem na `main`. Sem `--no-verify`.
- Tarefas pesadas uma por vez (R-TETO): antes do E2E ou do pronto, confira `uptime` e `free -m`; respeite o lock pesado.

## Pronto quando
- PQ-1 (sha): commit(s) dos ajustes R1 a R5 em `fix/perf-visao-semanal`.
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-perf-semanal status --short` · espera: linhas=0
- PQ-3 (cmd): `pnpm run pronto`, rodado da raiz da worktree · espera: rc=0
- PQ-4 (arquivo): `docs/tecnica/arquitetura-front.md` §10 com a exceção do GraficoMensal e o critério de reversão.

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência; riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
