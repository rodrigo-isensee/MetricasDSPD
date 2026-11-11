## Objetivo
Volta da release 100, segurança: o PR 325 (K-271) entrou na develop depois dos pareceres, e a promoção para a homolog os recusa como desatualizados. Branch `docs/100-release-b` (a partir da develop 27ac9064fc4ffad4e7f3bf18241aa1979912c009; review revalidado em d5d9d40b), worktree `/home/rodrigoisensee/MetricasDSPD-052h`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052h diff c7c3e092~1 c7c3e092` (o K-271).
- `/home/rodrigoisensee/MetricasDSPD-052h/docs/security/100-release.md` e `/home/rodrigoisensee/MetricasDSPD-052h/docs/security/096-criterios-apontamento-env.md`.

## Entregar
- "E1.2 (security-engineer): parecer de segurança da release, na branch docs/100-release." (E1.2) Nesta volta, na branch `docs/100-release-b`.
- (E1) (E1.2) Revalidar a segurança da release sobre o delta (o K-271: a falha do banco imprime só a categoria, a data validada e o argumento a mais recusado, que fecham os A1 e A2 da segurança do 096), sem rodar nada contra base real nem ler `.env*`. Regravar `docs/security/100-release.md` inteiro pela ferramenta Write, uma vez só, com `pedido: 100-release-bloqueios-simulador`, `branch: docs/100-release-b`, `commit: 27ac9064fc4ffad4e7f3bf18241aa1979912c009`, veredito e `## Achados` com linhas de até 300 caracteres; commit só do parecer com `Cartão: K-204` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052h push origin HEAD:refs/heads/docs/100-release-b` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- arquivos: docs/security/100-release.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052h show origin/docs/100-release-b:docs/security/100-release.md` · espera: contém 'branch: docs/100-release-b'
