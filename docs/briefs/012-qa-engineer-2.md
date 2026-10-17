## Objetivo
Revalidar o parecer do QA do K-102 sobre o HEAD final da branch (merge da develop e revalidação do review pelo tech-lead), para o PR sair com review e QA no mesmo commit. Desde o seu parecer (36975e6), o patch do K-102 não mudou: entraram o parecer de UX (06f93c0), a revalidação do review e o merge da develop, que traz o que entrou na develop desde a base 5eaf202. Cartão K-102, worktree `/home/rodrigoisensee/MetricasDSPD-perf-semanal`, branch `fix/perf-visao-semanal`.

## Ler
- Na worktree: `docs/qa/k102-perf-semanal.md` (frontmatter) e `git log --oneline 36975e6..HEAD`.

## Entregar
- (E1) Conferir que o patch do K-102 não mudou com o merge: compare `git diff 5eaf202 36975e6 -- web e2e` com `git diff origin/develop HEAD -- web e2e` (mesmos arquivos e mesmas linhas alteradas). Se o merge trouxe código que toca os arquivos do K-102 (`web/src/components/charts/`, os E2E b3 e b12), rode só os testes unitários de `web/src/components/charts/` e os E2E b3 e b12, uma vez, com load abaixo de 4; se algo falhar, relate e não revalide.
- (E1) Atualizar o `commit:` do frontmatter de `docs/qa/k102-perf-semanal.md` para o HEAD e acrescentar a nota da revalidação, gravado com Write; commit, `git add` por caminho, sem push.
- Fora do escopo, etapa do E1 já feita (citada de "## Etapas"): "E1.2 (forge:tech-lead): review do K-102."
- Fora do escopo: rodar de novo o `pronto` completo, a suíte E2E inteira ou o perf (o usuário pediu menos uso da máquina; a CI do PR roda tudo); o PR (pedido 018).

## Decisões e restrições
- R-QA: o parecer só é revalidado se o código e os testes não mudaram.
- NÃO tocar: código, testes, `.github/`, a `main`, o diretório principal e a worktree `-011-fase2`. Sem `--no-verify`.

## Pronto quando
- PQ-1 (sha): commit da revalidação do parecer do QA em `fix/perf-visao-semanal`.
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-perf-semanal status --short` · espera: linhas=0
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-perf-semanal diff --stat origin/develop HEAD -- web e2e` · espera: contém 'filaDeGraficos.ts'

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (saída do `forge-check pr k102-perf-semanal` depois do commit); riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
