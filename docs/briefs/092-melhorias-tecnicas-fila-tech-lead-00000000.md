## Objetivo
Review do K-121: branch `docs/k121-frontmatter`, worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041`, ponta 80bfc064 (base develop 6e42dfb898eb94f1a1e397c6daa4b5ff60cc2f13). Só documentação, classe T: dez documentos antigos ganharam o frontmatter `contrato: 0` (anterior ao contrato), sem mudar o corpo; o commit 32d41e80 tinha posto campos inventados nos de docs/qa e foi corrigido em b4c5f702.

## Ler
- `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 diff 6e42dfb898eb94f1a1e397c6daa4b5ff60cc2f13 80bfc064 --stat` e o diff completo.

## Entregar
- "E1.2 (tech-lead): review do K-121." (E1.2)
- (E1) (E1.2) Review: no diff final só entram as linhas de frontmatter `contrato: 0` nos dez arquivos, nenhum corpo muda, nenhum campo foi inventado; `forge-check docs` não acusa mais nenhum dos dez. Parecer `docs/reviews/092-k121-frontmatter.md` (novo) pela ferramenta Write, com `pedido: 092-melhorias-tecnicas-fila`, `branch: docs/k121-frontmatter`, `commit:` o sha40 de 80bfc064 e o veredito; `## Achados` com linhas de até 300 caracteres. Commit só do parecer com `Cartão: K-121` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 push origin HEAD:refs/heads/docs/k121-frontmatter` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E2) (E3) (E5) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/reviews/092-k121-frontmatter.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 show origin/docs/k121-frontmatter:docs/reviews/092-k121-frontmatter.md` · espera: contém 'branch: docs/k121-frontmatter'
