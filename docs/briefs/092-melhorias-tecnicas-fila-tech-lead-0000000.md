## Objetivo
K-121, parte do tech-lead: `docs/reviews/front-via-api.md` não tem frontmatter, e `docs/architecture/features/front-via-api.md` já recebeu do arquiteto o frontmatter `contrato: 0` (documento anterior ao contrato) e está sem commit. Worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041`, branch `docs/k121-frontmatter` (ponta b4c5f702, com os oito de docs/qa já com `contrato: 0`).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/reviews/front-via-api.md`.
- `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 diff -- docs/architecture/features/front-via-api.md` (só as três linhas do frontmatter).

## Entregar
- "E1.4 (tech-lead): K-121, frontmatter em docs/reviews/front-via-api.md, na mesma branch, depois da E1.1." (E1.4)
- (E1) (E1.4) Pôr `contrato: 0` (só esse campo entre os `---`) no topo de `docs/reviews/front-via-api.md`, sem mudar o corpo, salvo se o documento trouxer escritos pedido, commit e veredito próprios (aí o frontmatter completo do modelo de review). Conferir com `forge-check docs` que esse arquivo e o de `docs/architecture/` não aparecem mais. Um commit com os dois arquivos e `Cartão: K-121` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito pelos dois caminhos); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 push origin HEAD:refs/heads/docs/k121-frontmatter` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E2) (E3) (E5) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/reviews/front-via-api.md, docs/architecture/features/front-via-api.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 show origin/docs/k121-frontmatter:docs/reviews/front-via-api.md` · espera: contém 'contrato:'
