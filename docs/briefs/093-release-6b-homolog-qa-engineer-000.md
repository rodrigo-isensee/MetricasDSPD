## Objetivo
Segunda volta do QA da release 093 sobre a develop atual (7b2325a9, com os PRs 303 a 311 além do 6b), na branch `docs/093-release-c` (worktree `/home/rodrigoisensee/MetricasDSPD-052h`; CHANGELOG 773876f7a2cd3a1e766ff7fbb4484e274207095a e review da311afa desta segunda volta; o parecer de segurança da primeira volta segue valendo). Com o K-264 na develop, o `pnpm run pronto` deve passar dentro do sandbox.

## Ler
- O parecer anterior `docs/qa/093-release.md` (novo pelo PR 311), lido com `git show` sobre `origin/develop` na worktree.

## Entregar
- "E1.3 (qa-engineer): QA da release (suítes na ponta da develop), parecer na branch docs/093-release." (E1.3) Nesta volta, na branch `docs/093-release-c`.
- (E1) (E1.3) Na worktree, rodar `pnpm run pronto` sozinho na máquina (tarefa pesada; dependências instaladas antes se faltarem, `registry.npmjs.org` em allowed_domains; saída para arquivo no scratchpad; em segundo plano se passar de 170 s, esperando o fim sem rodar outra suíte) e conferir o rc; falha por carga ou intermitente que passe com o arquivo sozinho vai como achado (o simulado.test.tsx:94 já falhou assim no CI). Regrave `docs/qa/093-release.md` inteiro pela ferramenta Write, uma vez só, com `pedido: 093-release-6b-homolog`, `branch: docs/093-release-c`, `commit: 773876f7a2cd3a1e766ff7fbb4484e274207095a`, veredito, contagem de bugs fora do bloco `## Achados` e `## Achados` só com linhas de achado; commit só do parecer com `Cartão: K-204` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito), depois do commit do review; push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052h push origin HEAD:refs/heads/docs/093-release-c` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- arquivos: docs/qa/093-release.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052h show origin/docs/093-release-c:docs/qa/093-release.md` · espera: contém 'branch: docs/093-release-c'
