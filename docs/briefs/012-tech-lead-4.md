## Objetivo
Revalidar o review do K-102: o QA mudou os E2E depois do parecer (commit 28ddea2, ajustes V2-1 e V2-2 que o próprio review recomendou), e o `forge-check pr k102-perf-semanal` acusa o review como desatualizado. Também commitar o parecer de UX que ficou sem commit. Cartão K-102, worktree `/home/rodrigoisensee/MetricasDSPD-perf-semanal`, branch `fix/perf-visao-semanal`, HEAD 36975e6.

## Ler
- Na worktree: `docs/reviews/k102-perf-semanal.md`, seção "Volta 2" (V2-1 e V2-2).
- `git -C /home/rodrigoisensee/MetricasDSPD-perf-semanal diff aeacff4..36975e6 -- e2e/`.

## Entregar
- (E1) Revalidar o parecer de review sobre 36975e6: conferir que V2-1 e V2-2 foram aplicados como recomendado e que nenhum código de produção mudou; atualizar o frontmatter (`commit:`) e acrescentar a nota da revalidação, gravado com Write; commit na branch, `git add` por caminho, sem push.
- (E1) Commitar o parecer de UX `docs/ux/revisao-k102-perf-semanal.md` (do ux-designer, sem commit) na mesma branch, `git add` por caminho.
- Fora do escopo, etapas do E1 já feitas (citadas de "## Etapas"): "E1.3 (forge:qa-engineer): QA do K-102."; "E1.4 (forge:ux-designer): revisão de UX do K-102."
- Fora do escopo: o PR (pedido 018); o merge da develop na branch.

## Decisões e restrições
- Orçamento de performance: ADR 0003.
- NÃO tocar: código e testes da branch (ajuste volta ao autor), `.github/`, a `main`, o diretório principal e a worktree `-011-fase2`. Sem `--no-verify`.
- Teto reduzido a 2 agentes a pedido do usuário (2026-10-17): sem `pronto` nem E2E locais; o QA já rodou.

## Pronto quando
- PQ-1 (sha): commit da revalidação do review e do parecer de UX em `fix/perf-visao-semanal`.
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-perf-semanal status --short` · espera: linhas=0
- PQ-3 (cmd): `grep -n -E "^commit: 36975e6" /home/rodrigoisensee/MetricasDSPD-perf-semanal/docs/reviews/k102-perf-semanal.md` · espera: linhas=1

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (saída do `forge-check pr k102-perf-semanal` depois do commit); riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
