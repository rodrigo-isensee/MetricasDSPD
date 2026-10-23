Agente destino: forge:tech-lead
Pedido: 039-limpar-branches-mescladas
Branch: develop   Base: develop   Base-sha: 794b9820cb4bab30e50b7de64748030b474a3074

## Objetivo
Apagar as branches (remotas, locais e as worktrees delas) cujo conteúdo já entrou na develop, a pedido do dono (R-FLUXO, "Depois do merge"). Etapa E1.1 do pedido 039, cartão K-124. Trabalhe a partir de `/home/rodrigoisensee/MetricasDSPD` sem trocar a branch dele (`docs/jarvis-2026-10-20-noite`, com trabalho sem commit do Jarvis).

## Ler
- `docs/pedidos/039-limpar-branches-mescladas.md`: Diagnóstico, Escopo e Fora do escopo.

## Entregar
- (E1) Apagar branch remota, local e worktree de: `forge/upgrade-0.27.0` (#134, worktree `/home/rodrigoisensee/MetricasDSPD-038`), `feature/030-dependabot-develop` (#121), `forge/upgrade-0.26.0` (#127), `docs/jarvis-quadro-2026-10-17-noite` (#118), `feature/011-metricas-tambem-back` (#92). Antes de apagar, confirme com `gh pr list --state merged --head <branch>` que o PR está mesclado na develop.
- (E2) Para `feature/011-fase2-back` (worktree `/home/rodrigoisensee/MetricasDSPD-011-fase2`), `ref/c6-cede-por-metrica`, `ref/c6-gerador-em-fases`, `test/qa-intensivo-main` e `tmp/taticas-sobre-develop`: apagar só as que não têm alteração exclusiva em relação à `origin/develop` (por `git cherry origin/develop <branch>` sem linhas `+`, ou conteúdo já na develop); as demais ficam e entram no relatório com o número de alterações exclusivas (linhas `+` do `git cherry`) e o assunto da última.
- (E1) Remover worktree só com `git worktree remove` sem `--force`; worktree com mudança pendente fica e vai ao relatório.

## Fora do escopo
- `develop`, `homolog`, `main`; `feature/025-front-taticas`, `feature/037-c6-operacional`, `docs/jarvis-2026-10-20-noite` e as worktrees -025, -037 e a principal; a worktree `-main` (HEAD destacado); o quadro; PR; nada se grava no repositório (sem commit).

## Decisões e restrições
- DECISÃO DO DONO (2026-10-21): "limpe as branchs que ja estao na develop".
- R-FLUXO, "Depois do merge": branch remota, local e worktree são apagadas; nunca `develop`, `homolog` nem `main`. R-VERIFY: nunca `--force` (nem `git branch -D` em branch com alteração exclusiva). R-MAIN: nada na `main`.

## Pronto quando
- PQ-1 (cmd): `git ls-remote origin refs/heads/forge/upgrade-0.27.0 refs/heads/feature/030-dependabot-develop` · espera: linhas=0
- PQ-2 (cmd): `git branch --list forge/upgrade-0.27.0 forge/upgrade-0.26.0 feature/030-dependabot-develop docs/jarvis-quadro-2026-10-17-noite feature/011-metricas-tambem-back` · espera: linhas=0
- PQ-3 (cmd): `git worktree list` · espera: contém 'MetricasDSPD-025'
- PQ-4 (cmd): `git branch --list develop main feature/025-front-taticas feature/037-c6-operacional docs/jarvis-2026-10-20-noite` · espera: linhas=5

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
