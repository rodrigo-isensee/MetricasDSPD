## Objetivo
Volta do K-121 (parte do QA): no commit 32d41e80 da branch `docs/k121-frontmatter` (worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041`), os oito documentos antigos de `docs/qa/` ganharam o frontmatter completo com valores que eles não têm: sete são planos, medições ou diagnósticos sem veredito e receberam `parecer: aprovado` e bugs zero. O validador aceita `contrato: 0` para documento anterior ao contrato (é o que os planos antigos de `docs/architecture/features/` usam), sem inventar campo.

## Ler
- `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 show 32d41e80 --stat` e o frontmatter de cada um dos oito.
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/architecture/features/front-via-api.md`, as três primeiras linhas (o modelo `contrato: 0`).

## Entregar
- "E1.1 (qa-engineer): K-121, frontmatter nos 8 documentos de docs/qa que o forge-check docs acusa, na branch docs/k121-frontmatter, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041." (E1.1) Nesta volta, a forma honesta do frontmatter.
- (E1) (E1.1) Em cada um dos oito, trocar o frontmatter de 32d41e80 por `contrato: 0` (só esse campo entre os `---`), sem mudar o corpo; manter o frontmatter completo só onde o documento é de fato um parecer com veredito próprio, pedido e commit escritos no texto (se nenhum for, todos ficam com `contrato: 0`). `forge-check docs` sem erro nos oito. Commit com `Cartão: K-121` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito pelos oito caminhos); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 push origin HEAD:refs/heads/docs/k121-frontmatter` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR. Não tocar no arquivo de `docs/architecture/` já editado e sem commit (é do tech-lead levar).
- (E2) (E3) (E5) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/qa/011-back-plano.md, docs/qa/acabamento-ux.md, docs/qa/env-pesquisa.md, docs/qa/f4-medicao.md, docs/qa/front-via-api.md, docs/qa/intensivo-filtros.md, docs/qa/k101-rodada-noturna-2026-10-15.md, docs/qa/sustentacao-no-operacional-plano.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 show origin/docs/k121-frontmatter:docs/qa/011-back-plano.md` · espera: contém 'contrato: 0'
