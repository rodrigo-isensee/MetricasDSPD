## Objetivo
Volta da release 093 sobre a develop atual: os pareceres de review, segurança e QA da release (na develop pelo PR 306) citam a develop em c6e5fd8f, e depois deles entraram os PRs 303 (K-172), 304 (K-263), 305 (K-264) e 307 (K-121), mesclados pelo dono, cada um com review e QA próprios. O `forge-check` recusa promover com os pareceres da release desatualizados. Worktree `/home/rodrigoisensee/MetricasDSPD-052h`, nova branch `docs/093-release-b` a partir da develop 9fe4b61f.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052h/docs/reviews/093-release.md` na develop (o parecer anterior, novo pelo PR 306): ler com `git show` sobre `origin/develop`.
- `git -C /home/rodrigoisensee/MetricasDSPD-052h log --oneline c6e5fd8f9025e651fb9113e4ae324bf99f47ab01..origin/develop`.

## Entregar
- "E1.1 (tech-lead): CHANGELOG da release e review (develop contra homolog), parecer na branch docs/093-release." (E1.1) Nesta volta, na branch `docs/093-release-b`.
- (E1) (E1.1) Criar a branch: worktree limpa; `git -C /home/rodrigoisensee/MetricasDSPD-052h fetch origin`; `git -C /home/rodrigoisensee/MetricasDSPD-052h switch --no-track -c docs/093-release-b origin/develop`; conferir `branch --show-current`. Acrescentar ao `CHANGELOG.md` as notas dos PRs 303, 304, 305 e 307, no formato das entradas da release 093; commit só desse arquivo com `Cartão: K-204` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052h push origin HEAD:refs/heads/docs/093-release-b` (`github.com` em allowed_domains); commit e push em chamadas separadas. Depois, revisar a release inteira (develop contra homolog), cobrindo o delta (cada PR novo tem review e, se não for só documentação, QA aprovados; nenhum mexe nos arquivos do 6b). Regrave `docs/reviews/093-release.md` inteiro pela ferramenta Write, uma vez só, com `pedido: 093-release-6b-homolog`, `branch: docs/093-release-b`, `commit:` o sha40 do commit do CHANGELOG desta volta, veredito e `## Achados` com linhas de até 300 caracteres; commit só do parecer, em commit separado do CHANGELOG; push como acima; sem PR.
- arquivos: CHANGELOG.md, docs/reviews/093-release.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052h show origin/docs/093-release-b:docs/reviews/093-release.md` · espera: contém 'branch: docs/093-release-b'
