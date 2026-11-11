## Objetivo
Parecer de segurança da release 090: a develop em c6e5fd8f (PR 298, lote 6b, e PR 302) contra a homolog, na branch `docs/093-release` (worktree `/home/rodrigoisensee/MetricasDSPD-052h`, head 56e4e8af, com o CHANGELOG ce704f9b61bb23ae2b1e197d50b71394f4dbf622 e o review aprovado).

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052h diff origin/homolog c6e5fd8f9025e651fb9113e4ae324bf99f47ab01 --stat` e o diff dos arquivos de servidor, banco e CI.
- `/home/rodrigoisensee/MetricasDSPD-052h/docs/reviews/093-release.md` (novo).

## Entregar
- "E1.2 (security-engineer): parecer de segurança da release, na branch docs/093-release." (E1.2)
- (E1) (E1.2) Revisão estática do delta (sem rodar nada contra base real nem ler `.env*`): a publicação real de BLOQUEADOS, O1, O2, O5 e O19 não expõe dado de pessoa nem texto livre do motivo de bloqueio na API, na exportação nem na tela, e nenhuma visão vira avaliação individual (o parecer do lote, docs/security/075-l6b-publicacao-real.md, é a base); o patch mesclado é o mesmo do lote revisado. Grave `docs/security/093-release.md` (novo) pela ferramenta Write, uma vez só, com `pedido: 093-release-6b-homolog`, `branch: docs/093-release`, `commit: ce704f9b61bb23ae2b1e197d50b71394f4dbf622`, veredito e `## Achados`; commit só desse arquivo com `Cartão: K-204` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em primeiro plano, timeout de 600 s, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052h push origin HEAD:refs/heads/docs/093-release` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- arquivos: docs/security/093-release.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052h show origin/docs/093-release:docs/security/093-release.md` · espera: contém 'pedido: 093-release-6b-homolog'
