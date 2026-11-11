## Objetivo
QA da release 090: a develop em 85394c5b (PRs 293 a 297) na branch `docs/090-release` (worktree `/home/rodrigoisensee/MetricasDSPD-052h`, com o CHANGELOG 81e30293048c0448066ca1ebd831074e5c82ddfb, o review e o parecer de segurança).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052h/docs/reviews/090-release.md` (novo) e `/home/rodrigoisensee/MetricasDSPD-052h/docs/security/090-release.md` (novo).

## Entregar
- "E1.2 (qa-engineer): QA da release (suítes na ponta da develop), parecer na branch docs/090-release." (E1.2)
- (E1) (E1.2) Na worktree, rodar `pnpm run pronto` sozinho na máquina (tarefa pesada; instale as dependências antes, se faltarem, com `CI=true pnpm install --frozen-lockfile`, `registry.npmjs.org` em allowed_domains; a saída vai para arquivo no scratchpad desde o início; em segundo plano se passar de 170 s, esperando o fim sem rodar outra suíte) e conferir o rc. Falha que for carga da máquina (tempo estourado) e passar ao rodar o arquivo sozinho vai como achado, não como bug. Grave `docs/qa/090-release.md` (novo) pela ferramenta Write, uma vez só, com `pedido: 090-release-2026-11-11`, `branch: docs/090-release`, `commit: 81e30293048c0448066ca1ebd831074e5c82ddfb`, veredito, contagem de bugs fora do bloco `## Achados` e `## Achados` só com linhas de achado; commit só do parecer com `Cartão: K-262` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em primeiro plano, timeout de 600 s, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052h push origin HEAD:refs/heads/docs/090-release` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- arquivos: docs/qa/090-release.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052h show origin/docs/090-release:docs/qa/090-release.md` · espera: contém 'pedido: 090-release-2026-11-11'
