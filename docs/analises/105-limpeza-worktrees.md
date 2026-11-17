# 105 · E7.511: limpeza única de worktrees (17/11/2026)

Limpeza autorizada uma vez pelo dono (decisão A, exceção à R-LIMITES), feita pelo tech-lead com as travas do detalhe: árvore limpa (`git status --porcelain` vazio), nenhum commit fora da origem, branch já integrada e fora da lista NUNCA. Remoção só com `git worktree remove` (sem `--force`), seguida de `git worktree prune`; branch local só com `git branch -d`. Nenhuma branch remota apagada; `develop`, `homolog` e `main` intocadas.

## Espaço liberado

| Local | Antes (`du -sh`) | Depois (`du -sh`) | Liberado |
|---|---|---|---|
| `~/.forge-contrib/wt` (clone `/home/rodrigoisensee/Forge`) | 4,0 GB | 2,6 GB | 1,4 GB |
| worktrees deste projeto (fora o checkout principal) | 16 GB | 13 GB | 3 GB (soma `du -sc` das 11 apagadas: 3,8 GB) |
| **Total** | | | **cerca de 5 GB liberado** (`df /`: 44 GB usados antes, 40 GB depois) |

## Contagem

| Repositório | Worktrees antes | Apagadas | Ficaram |
|---|---|---|---|
| Forge (`~/.forge-contrib/wt`) | 268 | 89 | 179 |
| MetricasDSPD (fora o checkout principal) | 39 | 11 | 28 |

Critério de integração aceito: HEAD ancestral da `origin/develop` (18 no Forge, 2 aqui), ou HEAD igual ou ancestral do head de um PR MERGED/CLOSED, sem PR aberto da branch. Para a trava 2, quando a branch remota já tinha sido apagada depois do squash, valeu o head guardado na origem em `refs/pull/<n>/head` (conferido por `git ls-remote`), igual ao HEAD da worktree (71 no Forge, 1 aqui: `MetricasDSPD-forge033`).

Branch local: `git branch -d` recusou 17 branches (merge por squash não as torna ancestrais); ficaram, sem `-D`. Apagadas com `-d`: 3 no Forge.

## O que ficou, por motivo

### Forge (179)
- **Commit fora da origem, sem PR MERGED/CLOSED com esse head** (178): commits locais que nenhum ref remoto guarda. Ficam até alguém decidir se são descartáveis.
- **Alteração sem commit** (1): `lote-fc-seguranca`.
- Fora da pasta: 14 arquivos soltos (`push-*.log`, `*-msg*.txt`), que não são worktrees e não foram tocados.

### MetricasDSPD (28)
- **Lista NUNCA, em uso** (7 + checkout principal): 059, 061, 065, 067, 068, 076, 077.
- **Do assistente e conferência** (4): `assistente-wt-509`, `assistente-wt-516`, `assistente-wt-base`, `wt-conf`.
- **Alteração sem commit ou arquivo novo** (11): 041b, 052b, 052c, 052e, 052f, 052g, 056, 056d, 060, 062, 066.
- **Não entrou na develop / commit fora da origem** (4): 041, `-demo`, d3ci, forge034.
- **Tem `.env` (credencial em arquivo ignorado, que o remove apagaria)** (1): 052d.
- **Na dúvida, fica** (1): `Metricas/MetricasDSPD-main`, que passou nas travas, mas é a worktree da main usada para cargas e homologação (pedido 034 e histórico do 105).
