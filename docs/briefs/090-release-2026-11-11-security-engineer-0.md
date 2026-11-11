## Objetivo
Parecer de segurança da release 090: a develop em 85394c5b (PRs 293 a 297) contra a homolog, na branch `docs/090-release` (worktree `/home/rodrigoisensee/MetricasDSPD-052h`, head 6e819bad, com o CHANGELOG 81e30293048c0448066ca1ebd831074e5c82ddfb e o review aprovado).

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052h diff origin/homolog 85394c5b --stat` e o diff dos arquivos de servidor, banco e CI.
- `/home/rodrigoisensee/MetricasDSPD-052h/docs/reviews/090-release.md` (novo), achado A3.

## Entregar
- "E1.3 (security-engineer): parecer de segurança da release, na branch docs/090-release." (E1.3)
- (E1) (E1.3) Revisão estática do delta (sem rodar nada contra base real nem ler `.env*`): o 089 não expõe dado de pessoa nem texto livre do apontamento na API nem na tela e nenhuma visão vira avaliação individual; o teste do K-261 não lê o `.env` real; o Forge 0.45.5 não afrouxa controle; as 2 vulnerabilidades moderadas que o Dependabot aponta (A3 do review): o que são e se bloqueiam. Grave `docs/security/090-release.md` (novo) pela ferramenta Write, uma vez só, com `pedido: 090-release-2026-11-11`, `branch: docs/090-release`, `commit: 81e30293048c0448066ca1ebd831074e5c82ddfb`, veredito e `## Achados`; commit só desse arquivo com `Cartão: K-213` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em primeiro plano, timeout de 600 s, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052h push origin HEAD:refs/heads/docs/090-release` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- arquivos: docs/security/090-release.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052h show origin/docs/090-release:docs/security/090-release.md` · espera: contém 'pedido: 090-release-2026-11-11'
