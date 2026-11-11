## Objetivo
K-121, parte do QA: oito documentos antigos de `docs/qa/` não têm o frontmatter exigido pela regra de documentação do projeto e fazem o `forge-check docs` listar erros antigos, que escondem achado novo. Worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041`, branch `docs/k121-frontmatter` (a partir da develop 6e42dfb898eb94f1a1e397c6daa4b5ff60cc2f13).

## Ler
- Os oito arquivos, na worktree: `docs/qa/011-back-plano.md`, `docs/qa/acabamento-ux.md`, `docs/qa/env-pesquisa.md`, `docs/qa/f4-medicao.md`, `docs/qa/front-via-api.md`, `docs/qa/intensivo-filtros.md`, `docs/qa/k101-rodada-noturna-2026-10-15.md` e `docs/qa/sustentacao-no-operacional-plano.md`.
- Um parecer recente de `docs/qa/` com frontmatter válido, como modelo (por exemplo `docs/qa/090-release.md`), e a saída de `forge-check docs` rodada da raiz da worktree.

## Entregar
- "E1.1 (qa-engineer): K-121, frontmatter nos 8 documentos de docs/qa que o forge-check docs acusa, na branch docs/k121-frontmatter, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041." (E1.1)
- (E1) (E1.1) Acrescentar no topo de cada um dos oito o frontmatter no formato do modelo, sem mudar o corpo; os valores vêm do próprio documento (pedido, data, tipo); o que não der para saber fica como o validador aceita para campo desconhecido. Rodar `forge-check docs` e `pnpm run docs:check` da raiz da worktree antes e depois: os oito somem da lista e nada novo aparece. Commit com `Cartão: K-121` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito pelos oito caminhos); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 push origin HEAD:refs/heads/docs/k121-frontmatter` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E2) (E3) (E5) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/qa/011-back-plano.md, docs/qa/acabamento-ux.md, docs/qa/env-pesquisa.md, docs/qa/f4-medicao.md, docs/qa/front-via-api.md, docs/qa/intensivo-filtros.md, docs/qa/k101-rodada-noturna-2026-10-15.md, docs/qa/sustentacao-no-operacional-plano.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 log -1 --format=%B origin/docs/k121-frontmatter` · espera: contém 'Cartão: K-121'
