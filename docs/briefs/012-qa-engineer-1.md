## Objetivo
QA do K-102 (fila de montagem dos gráficos que destrava o perf da visão semanal), portão obrigatório antes do PR (R-QA). Cartão K-102, worktree `/home/rodrigoisensee/MetricasDSPD-perf-semanal`, branch `fix/perf-visao-semanal`, HEAD aeacff4 (review da volta 2 aprovado).

## Ler
- `docs/reviews/k102-perf-semanal.md` (na worktree): seções "Roteiro do QA" e "Volta 2" (recomendações V2-1 e V2-2).
- `docs/architecture/adr/0003-orcamento-de-performance.md`: C6 e Lighthouse.
- `docs/tecnica/arquitetura-front.md` §10 (fila de montagem e critério de reversão).

## Entregar
- (E1) Rodar o roteiro do QA do parecer de review: `pnpm run pronto` da raiz da worktree; os E2E que leem SVG (SUS-08 em `b3-sust-ei-vg.spec.ts`, OP-05/24 em `b12-fluxo.spec.ts`, M6) duas vezes; o `perf` local (C6 e Lighthouse da rota `/operacional?cadencia=semanal` e das demais rotas do portão).
- (E1) Aplicar nos E2E as recomendações V2-1 (`b3-sust-ei-vg.spec.ts:52-55`: afirmar `fills.length >= 1` ou esperar `.recharts-bar-rectangle`) e V2-2 (`b12-fluxo.spec.ts:67-68,75`: incluir `figure` no localizador da ausência), com commit na branch, `git add` por caminho, sem push.
- (E1) Parecer em `docs/qa/k102-perf-semanal.md` com `pedido: k102-perf-semanal` (o mesmo id do parecer de review), gravado com Write e commitado na branch: resultado real de cada passo, números do C6 e do Lighthouse, bugs com passos para reproduzir.
- Fora do escopo, etapa seguinte do E1 (citada de "## Etapas"): "E1.4 (forge:ux-designer): revisão de UX do K-102."
- Fora do escopo: corrigir código de produção (bug volta ao autor); o merge da develop na branch; o PR (pedido 018).

## Decisões e restrições
- Orçamento de performance: ADR 0003. Não afrouxe orçamento nem teste.
- R-QA: no máximo 3 voltas por bug.
- NÃO tocar: `web/src` e `server/` (só testes E2E), `.github/`, a `main`, o diretório principal e as outras worktrees. Sem `--no-verify`.
- Tarefas pesadas uma por vez (R-TETO): E2E, pronto e perf em sequência, nunca em paralelo; confira `uptime` e `free -m` antes de cada uma (o node-backend roda testes na worktree `-011-fase2`).

## Pronto quando
- PQ-1 (sha): commit(s) do parecer e dos ajustes V2-1 e V2-2 em `fix/perf-visao-semanal`.
- PQ-2 (cmd): `grep -n -E "^parecer:" /home/rodrigoisensee/MetricasDSPD-perf-semanal/docs/qa/k102-perf-semanal.md` · espera: linhas=1
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-perf-semanal status --short` · espera: linhas=0

## Relatório
Até 8 linhas: estado (aprovado, aprovado com ressalvas ou reprovado); o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (rc do pronto, E2E 2x, C6 e Lighthouse por rota); riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
