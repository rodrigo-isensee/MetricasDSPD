## Objetivo
Deixar a branch do K-102 pronta para o PR, com os pareceres sobre o commit final: trazer a `develop` (f81567e) e revalidar o review sobre o HEAD resultante. O `forge-check pr k102-perf-semanal` acusa review e QA desatualizados por causa do commit do parecer de UX (06f93c0), porque o `forge-check` não isenta `docs/ux/`. Cartão K-102, worktree `/home/rodrigoisensee/MetricasDSPD-perf-semanal`, branch `fix/perf-visao-semanal`, HEAD 06f93c0.

## Ler
- Na worktree: `docs/reviews/k102-perf-semanal.md`, frontmatter e a nota de revalidação.
- `git -C /home/rodrigoisensee/MetricasDSPD-perf-semanal log --oneline origin/develop -5`.

## Entregar
- (E1) Merge da `origin/develop` na branch (R-FLUXO), sem conflito esperado (o `merge-tree` não mostrou nenhum). Se houver conflito em código de produção, pare e relate.
- (E1) Revalidar o parecer de review sobre o HEAD depois do merge: o diff de código de produção do K-102 não muda com o merge (conferir com `git diff origin/develop...HEAD -- web server packages tools`); atualizar o `commit:` do frontmatter para o HEAD do merge e a nota, gravado com Write; commit, `git add` por caminho, sem push.
- Fora do escopo, etapa do E1 a refazer depois deste (citada de "## Etapas"): "E1.3 (forge:qa-engineer): QA do K-102." (revalidação do parecer do QA sobre o mesmo HEAD).
- Fora do escopo: o PR (pedido 018); a contribuição ao Forge.

## Decisões e restrições
- Orçamento de performance: ADR 0003.
- NÃO tocar: código e testes da branch, `.github/`, a `main`, o diretório principal e a worktree `-011-fase2`. Sem `--no-verify` nem `--force`.
- Teto reduzido a 2 agentes a pedido do usuário (2026-10-17): sem `pronto` nem E2E locais; o portão é a CI do PR.

## Pronto quando
- PQ-1 (sha): commit do merge da develop e commit da revalidação do review em `fix/perf-visao-semanal`.
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-perf-semanal merge-base --is-ancestor f81567e HEAD && echo contem` · espera: igual 'contem'
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-perf-semanal status --short` · espera: linhas=0

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (HEAD final e saída do `forge-check pr k102-perf-semanal`); riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
