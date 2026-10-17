## Objetivo
Pedido 019 (resto do E1 do pedido 013): a worktree `-qa` ficou porque guarda os únicos 6 protótipos HTML de duas features (K-074 e K-075). Guardar os protótipos fora do repositório e remover a worktree, voltando ao teto do R-TETO. Cartão K-105. Diretório principal `/home/rodrigoisensee/MetricasDSPD`, na `develop`.

## Ler
- `docs/pedidos/019-remover-worktree-qa.md` (E1).
- `KANBAN.md` da branch `docs/retomada-2026-10-17` (`git show docs/retomada-2026-10-17:KANBAN.md`), cartões K-074 e K-075 (Obs.: "O protótipo HTML vai junto com a feature").

## Entregar
- (E1) Copiar, preservando o caminho relativo, os 6 HTML sem commit da `/home/rodrigoisensee/MetricasDSPD-qa` para `/home/rodrigoisensee/MetricasDSPD-local/prototipos/` (fora do repositório): `docs/ux/compatibilidade-mobile-tablet/03-prototipo/app.html` e `index.html`; `docs/ux/revisao-geral-usabilidade/03-prototipo/index.html`, `p1-ocultar-no-lugar.html`, `p2-topo-enxuto.html` e `p3-indice-secoes.html`. Conferir com `cmp` que as cópias são idênticas.
- (E1) Remover a worktree `-qa` (`git worktree remove`; se ela recusar por arquivos sem commit já conferidos e copiados, relate em vez de forçar). Manter a branch local `test/qa-intensivo-main`: ela tem 2 commits (79edf17, 1f08626) que não existem em outro lugar.
- Fora do escopo: versionar os protótipos (vão junto com as features K-074 e K-075); a branch `test/qa-intensivo-main`; o PR de docs (pedido 017, "E1.1 (forge:tech-lead): PR de docs da retomada, mesclado na develop."); os pareceres revalidados do 011-back na branch local `feature/011-metricas-tambem-back` (próximo PR de docs).

## Decisões e restrições
- Regra do time para protótipos (cartões K-074 e K-075 no `KANBAN.md` da branch `docs/retomada-2026-10-17`): o protótipo HTML vai junto com a feature; até lá, fica fora do repositório.
- NÃO tocar: `-011-fase2`, `-perf-semanal`, as branches `ref/*`, `develop`, `homolog`, `main` e a branch `docs/retomada-2026-10-17`. R-VERIFY: sem `--force`. R-CONFORMIDADE: bloqueio não se contorna; vira relato.

## Pronto quando
- PQ-1 (cmd): `ls /home/rodrigoisensee/MetricasDSPD-local/prototipos/docs/ux/compatibilidade-mobile-tablet/03-prototipo /home/rodrigoisensee/MetricasDSPD-local/prototipos/docs/ux/revisao-geral-usabilidade/03-prototipo` · espera: contém 'p3-indice-secoes.html'
- PQ-2 (cmd): `test -d /home/rodrigoisensee/MetricasDSPD-qa && echo existe || echo removida` · espera: igual 'removida'
- PQ-3 (cmd): `ls /home/rodrigoisensee/MetricasDSPD/.git/worktrees` · espera: linhas=2

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (saída do `cmp`); riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
