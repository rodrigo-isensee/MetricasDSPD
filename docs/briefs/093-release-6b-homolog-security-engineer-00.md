## Objetivo
Volta do parecer de segurança da release 093 sobre a develop atual (9fe4b61f): depois do parecer anterior (sobre c6e5fd8f) entraram os PRs 303 (K-172, documentação), 304 (K-263, nova tentativa do homolog-aprovada, com segurança própria aprovada), 305 (K-264, ambiente dos testes de CLI) e 307 (K-121, frontmatter de documentos antigos). Worktree `/home/rodrigoisensee/MetricasDSPD-052h`, branch `docs/093-release-b` (CHANGELOG da volta 1d1dc74ca30e03f9a3a35e2ff37615233673ddf0 e review f632f8a6).

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052h diff c6e5fd8f9025e651fb9113e4ae324bf99f47ab01 9fe4b61f --stat` e o diff dos arquivos de código, teste e CI.
- O parecer anterior `docs/security/093-release.md` (novo pelo PR 306), lido com `git show` sobre `origin/develop` na worktree.

## Entregar
- "E1.2 (security-engineer): parecer de segurança da release, na branch docs/093-release." (E1.2) Nesta volta, na branch `docs/093-release-b`, cobrindo também o delta.
- (E1) (E1.2) Revisão estática do delta (sem rodar nada contra base real nem ler `.env*`): a nova tentativa do K-263 não deixa aprovar candidato ou portão indevido (o parecer próprio dele é a base); o K-264 repassa ao filho só a pasta temporária, sem herdar segredo do ambiente; nada novo expõe dado de pessoa. Regrave `docs/security/093-release.md` inteiro pela ferramenta Write, uma vez só, com `pedido: 093-release-6b-homolog`, `branch: docs/093-release-b`, `commit: 1d1dc74ca30e03f9a3a35e2ff37615233673ddf0`, veredito e `## Achados` com linhas de até 300 caracteres; commit só desse arquivo com `Cartão: K-204` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052h push origin HEAD:refs/heads/docs/093-release-b` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- arquivos: docs/security/093-release.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052h show origin/docs/093-release-b:docs/security/093-release.md` · espera: contém 'branch: docs/093-release-b'
