## Objetivo
Segunda volta da release 093: os pareceres de review e QA da release (na develop pelo PR 311) citam o CHANGELOG da primeira volta sobre a develop 9fe4b61f, e depois deles entraram os PRs 308 (K-265, documentação), 309 (K-266, teste) e 310 (K-267, teste), mesclados pelo dono, cada um com review e QA próprios. O `forge-check` recusa promover com o review e o QA da release desatualizados (o parecer de segurança segue valendo). Worktree `/home/rodrigoisensee/MetricasDSPD-052h`, nova branch `docs/093-release-c` a partir da develop 7b2325a9.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052h/docs/reviews/093-release.md` na develop (o parecer anterior, novo pelo PR 311): ler com `git show` sobre `origin/develop`.
- `git -C /home/rodrigoisensee/MetricasDSPD-052h log --oneline 9fe4b61f..origin/develop`.

## Entregar
- "E1.1 (tech-lead): CHANGELOG da release e review (develop contra homolog), parecer na branch docs/093-release." (E1.1) Nesta volta, na branch `docs/093-release-c`.
- (E1) (E1.1) Criar a branch: worktree limpa; `git -C /home/rodrigoisensee/MetricasDSPD-052h fetch origin`; `git -C /home/rodrigoisensee/MetricasDSPD-052h switch --no-track -c docs/093-release-c origin/develop`; conferir `branch --show-current`. Acrescentar ao `CHANGELOG.md` as notas dos PRs 308, 309 e 310, no formato das entradas da release 093; commit só desse arquivo com `Cartão: K-204` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052h push origin HEAD:refs/heads/docs/093-release-c` (`github.com` em allowed_domains); commit e push em chamadas separadas. Depois, revisar a release inteira (develop contra homolog), cobrindo o delta (cada PR novo tem review e, se não for só documentação, QA aprovados; nenhum mexe nos arquivos do 6b nem em código de produção). Regrave `docs/reviews/093-release.md` inteiro pela ferramenta Write, uma vez só, com `pedido: 093-release-6b-homolog`, `branch: docs/093-release-c`, `commit:` o sha40 do commit do CHANGELOG desta volta, veredito e `## Achados` com linhas de até 300 caracteres; commit só do parecer, em commit separado do CHANGELOG; push como acima; sem PR.
- arquivos: CHANGELOG.md, docs/reviews/093-release.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052h show origin/docs/093-release-c:docs/reviews/093-release.md` · espera: contém 'branch: docs/093-release-c'
