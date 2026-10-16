## Objetivo
Code review da volta 2 do K-102 (ajustes R1 a R5 da fila de montagem dos gráficos), para liberar o QA. Cartão K-102, worktree `/home/rodrigoisensee/MetricasDSPD-perf-semanal`, branch `fix/perf-visao-semanal`, commits 47a628f, 0650926 e 4bad6e6 sobre 1a18d8e.

## Ler
- `docs/reviews/k102-perf-semanal.md` (na worktree): o seu parecer da volta 1, seção "Ajustes recomendados".
- `git -C /home/rodrigoisensee/MetricasDSPD-perf-semanal diff 1a18d8e..HEAD`.
- `docs/engineering/praticas.md`, seções 2, 4 e 5.

## Entregar
- (E1) Review dos commits contra os R1 a R5 e contra os ajustes de E2E (b12 e b3). Ponto a decidir: o R5 afirma a sequência `[1, 2, 3]` (o 0 inicial fica de fora porque o MutationObserver só dispara depois de uma mudança); diga se isso prova "um por tarefa" ou se precisa de ajuste.
- (E1) Parecer atualizado em `docs/reviews/k102-perf-semanal.md` (seção da volta 2), gravado com Write, e commit dele na branch, `git add` por caminho, sem push.
- (E1) Se a branch estiver atrás da develop de forma que o PR vá conflitar, diga no relatório; não faça o merge da develop nesta delegação.
- Fora do escopo, etapas seguintes do E1 (citadas de "## Etapas"): "E1.3 (forge:qa-engineer): QA do K-102."; "E1.4 (forge:ux-designer): revisão de UX do K-102."

## Decisões e restrições
- Caminho (c) do K-102 (fatiar ou adiar o render da semanal), registrado em `docs/kanban/estado-2026-10-14-noite.md`; o Web Worker não entra aqui. Orçamento de performance: ADR 0003.
- NÃO tocar: código da branch (ajuste volta ao autor), `.github/`, a `main`, o diretório principal nem as outras worktrees. Sem `--no-verify`.
- Tarefa pesada (E2E, pronto) uma por vez (R-TETO): confira `uptime` e `free -m` antes; o node-backend roda o pronto em outra worktree.

## Pronto quando
- PQ-1 (sha): commit do parecer da volta 2 em `fix/perf-visao-semanal`.
- PQ-2 (cmd): `grep -n -i "volta 2" /home/rodrigoisensee/MetricasDSPD-perf-semanal/docs/reviews/k102-perf-semanal.md` · espera: linhas>=1
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-perf-semanal status --short` · espera: linhas=0

## Relatório
Até 8 linhas: estado (aprovado, aprovado com ajustes ou reprovado); o que precisa do usuário; suposições (com a base); o que foi feito, com evidência; riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
