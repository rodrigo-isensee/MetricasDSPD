## Objetivo
Volta da release 100: o dono mesclou o PR 325 (K-271, `server/src/entradas/criterios-apontamento.ts` e o teste dele) na develop depois dos pareceres da release, e o `forge-check brief gerar` da promoção para a homolog recusa os três pareceres como desatualizados contra a homolog e pede também um parecer de devops (a release muda `.github/actions/playwright/action.yml`). Nova branch `docs/100-release-b` a partir da develop atual (27ac9064fc4ffad4e7f3bf18241aa1979912c009), worktree `/home/rodrigoisensee/MetricasDSPD-052h`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052h diff c7c3e092~1 c7c3e092 --stat` (o que entrou depois dos pareceres).
- O parecer `docs/reviews/100-release.md` (pela develop) e o parecer próprio do K-271 `docs/reviews/096-k271-criterios-robustez.md`.

## Entregar
- "E1.1 (tech-lead): CHANGELOG da release e review (develop contra homolog), parecer na branch docs/100-release, worktree /home/rodrigoisensee/MetricasDSPD-052h." (E1.1) Nesta volta, na branch `docs/100-release-b`, só o review.
- (E1) (E1.1) Conferir `git -C /home/rodrigoisensee/MetricasDSPD-052h status --short` vazio; `git -C /home/rodrigoisensee/MetricasDSPD-052h fetch origin`; `git -C /home/rodrigoisensee/MetricasDSPD-052h switch --no-track -c docs/100-release-b 27ac9064fc4ffad4e7f3bf18241aa1979912c009`; conferir `branch --show-current`. Revalidar o review da release sobre o delta (o K-271, com review próprio aprovado) e regravar `docs/reviews/100-release.md` inteiro pela ferramenta Write, uma vez só, com `pedido: 100-release-bloqueios-simulador`, `branch: docs/100-release-b`, `commit: 27ac9064fc4ffad4e7f3bf18241aa1979912c009`, veredito e `## Achados` com linhas de até 300 caracteres; commit só do parecer com `Cartão: K-204` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052h push origin HEAD:refs/heads/docs/100-release-b` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- arquivos: docs/reviews/100-release.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052h show origin/docs/100-release-b:docs/reviews/100-release.md` · espera: contém 'branch: docs/100-release-b'
