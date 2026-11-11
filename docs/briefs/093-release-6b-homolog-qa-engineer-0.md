## Objetivo
QA da release 093: a develop em c6e5fd8f9025e651fb9113e4ae324bf99f47ab01 (PR 298, lote 6b, e PR 302) na branch `docs/093-release` (worktree `/home/rodrigoisensee/MetricasDSPD-052h`, com o CHANGELOG ce704f9b61bb23ae2b1e197d50b71394f4dbf622, o review e o parecer de segurança).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052h/docs/reviews/093-release.md` (novo) e `/home/rodrigoisensee/MetricasDSPD-052h/docs/security/093-release.md` (novo).

## Entregar
- "E1.3 (qa-engineer): QA da release (suítes na ponta da develop), parecer na branch docs/093-release." (E1.3)
- (E1) (E1.3) Na worktree, rodar `pnpm run pronto` sozinho na máquina (tarefa pesada; instale as dependências antes, se faltarem, com `CI=true pnpm install --frozen-lockfile`, `registry.npmjs.org` em allowed_domains; a saída vai para arquivo no scratchpad desde o início; em segundo plano se passar de 170 s, esperando o fim sem rodar outra suíte) e conferir o rc; falhas dos testes de CLI do server por ENOENT na pasta temporária do tsx são do sandbox (K-264, ainda fora da develop) e vão como achado, com a suíte completa provada pela CI do PR. Falha que for carga da máquina (tempo estourado) e passar ao rodar o arquivo sozinho vai como achado, não como bug. Grave `docs/qa/093-release.md` (novo) pela ferramenta Write, uma vez só, com `pedido: 093-release-6b-homolog`, `branch: docs/093-release`, `commit: ce704f9b61bb23ae2b1e197d50b71394f4dbf622`, veredito, contagem de bugs fora do bloco `## Achados` e `## Achados` só com linhas de achado; commit só do parecer com `Cartão: K-204` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em primeiro plano, timeout de 600 s, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052h push origin HEAD:refs/heads/docs/093-release` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- arquivos: docs/qa/093-release.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052h show origin/docs/093-release:docs/qa/093-release.md` · espera: contém 'pedido: 093-release-6b-homolog'
