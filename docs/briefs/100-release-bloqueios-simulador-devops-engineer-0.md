## Objetivo
Parecer de devops da release 100: o range da develop contra a homolog muda `.github/actions/playwright/action.yml`, `ci.yml` e `homolog.yml` (PR 318, jobs com navegador no container oficial do Playwright), e a promoção para a homolog pede o parecer de devops da release. Branch `docs/100-release-b`, worktree `/home/rodrigoisensee/MetricasDSPD-052h`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052h diff origin/homolog 27ac9064fc4ffad4e7f3bf18241aa1979912c009 -- .github`.
- `/home/rodrigoisensee/MetricasDSPD-052h/docs/devops/095-runner-ubuntu-2404.md` e `/home/rodrigoisensee/MetricasDSPD-052h/docs/engineering/fluxo-homologacao.md` (o portão da homolog).

## Entregar
- "E1.8 (devops-engineer): parecer de devops da release (a release muda os workflows e a ação do Playwright), na branch docs/100-release-b." (E1.8)
- (E1) (E1.8) Conferir que os workflows da homolog (`homolog.yml`, portão e rodada noturna) e a ação de conferência do Chromium funcionam no container fixado, que os nomes dos checks exigidos pela proteção da `homolog` e pelo `homolog-aprovada` não mudaram, e que nada da release exige passo manual no ambiente. Parecer `docs/devops/100-release.md` (novo) pela ferramenta Write, com `pedido: 100-release-bloqueios-simulador`, `branch: docs/100-release-b`, `commit: 27ac9064fc4ffad4e7f3bf18241aa1979912c009` e o veredito; `## Achados` com linhas de até 300 caracteres. Commit só do parecer com `Cartão: K-204` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052h push origin HEAD:refs/heads/docs/100-release-b` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- arquivos: docs/devops/100-release.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052h show origin/docs/100-release-b:docs/devops/100-release.md` · espera: contém 'branch: docs/100-release-b'
