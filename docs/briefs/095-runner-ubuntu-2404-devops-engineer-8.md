## Objetivo
O PR 318 entrou na develop só com o `runs-on: ubuntu-24.04`. A correção que roda os jobs com navegador no container oficial do Playwright e o parecer novo de devops ficaram só locais na worktree `/home/rodrigoisensee/MetricasDSPD-052h`, nos dois últimos commits da branch `melhoria/runner-ubuntu-2404` ("ci(playwright): jobs com navegador no container oficial, sem apt do runner" e "docs(devops): parecer do 095 com o diagnostico do apt do runner e o container do Playwright"). Levar os dois para uma branch nova a partir da develop.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052h log -2 --stat melhoria/runner-ubuntu-2404`.
- `/home/rodrigoisensee/MetricasDSPD-052h/docs/devops/095-runner-ubuntu-2404.md`.

## Entregar
- "E1.10 (devops-engineer): o PR 318 entrou só com o runs-on; levar a correção do container e o parecer para uma branch nova fix/k269-container-playwright a partir da develop, na worktree /home/rodrigoisensee/MetricasDSPD-052h, sem push (workflow: o envio é do dono)." (E1.10)
- (E1) (E1.10) Na worktree 052h: `git fetch origin develop`, `git switch -c fix/k269-container-playwright --no-track origin/develop`, e aplicar os dois commits por `git cherry-pick melhoria/runner-ubuntu-2404~1 melhoria/runner-ubuntu-2404` (sem `--no-verify`); resolver conflito só se for trivial e relatar; o parecer de devops com `commit:` do novo commit da correção (regravar só pela ferramenta Write, em commit separado, se o sha mudou). Validar a sintaxe dos workflows (parser de YAML). Sem push (o dono envia, porque toca workflow). Relatar o comando exato de envio para o dono.
- arquivos: [.]github/workflows/ci.yml, [.]github/workflows/homolog.yml, [.]github/actions/playwright/action.yml, docs/devops/095-runner-ubuntu-2404.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052h log -3 --format=%B` · espera: contém 'Cartão: K-269'
