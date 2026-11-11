Agente destino: forge:devops-engineer
Pedido: 095-runner-ubuntu-2404
Tipo: codigo
Branch: fix/k269-container-playwright   Base: develop   Base-sha: f4c122f15c05fbf5fea86797c9c348656d11ab36
Etapa: codigo   Cobre: E1.10

## Objetivo
O PR 318 entrou na develop só com o `runs-on: ubuntu-24.04`. A correção que roda os jobs com navegador no container oficial do Playwright e o parecer novo de devops ficaram só locais na worktree `/home/rodrigoisensee/MetricasDSPD-052h`, nos dois últimos commits da branch `melhoria/runner-ubuntu-2404` ("ci(playwright): jobs com navegador no container oficial, sem apt do runner" e "docs(devops): parecer do 095 com o diagnostico do apt do runner e o container do Playwright"). Levar os dois para uma branch nova a partir da develop.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052h log -2 --stat melhoria/runner-ubuntu-2404`.
- `/home/rodrigoisensee/MetricasDSPD-052h/docs/devops/095-runner-ubuntu-2404.md`.

## Entregar
- "E1.10 (devops-engineer): o PR 318 entrou só com o runs-on; levar a correção do container e o parecer para uma branch nova fix/k269-container-playwright a partir da develop, na worktree /home/rodrigoisensee/MetricasDSPD-052h, sem push (workflow: o envio é do dono)." (E1.10)
- (E1) (E1.10) Na worktree 052h: `git fetch origin develop`, `git switch -c fix/k269-container-playwright --no-track origin/develop`, e aplicar os dois commits por `git cherry-pick melhoria/runner-ubuntu-2404~1 melhoria/runner-ubuntu-2404` (sem `--no-verify`); resolver conflito só se for trivial e relatar; o parecer de devops com `commit:` do novo commit da correção (regravar só pela ferramenta Write, em commit separado, se o sha mudou). Validar a sintaxe dos workflows (parser de YAML). Sem push (o dono envia, porque toca workflow). Relatar o comando exato de envio para o dono.
- arquivos: [.]github/workflows/ci.yml, [.]github/workflows/homolog.yml, [.]github/actions/playwright/action.yml, docs/devops/095-runner-ubuntu-2404.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 095-runner-ubuntu-2404 até e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (0 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/095-runner-ubuntu-2404.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: arquivos fora da lista `- arquivos:` (outro arquivo necessário: pare e relate antes), os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (devops-engineer): mudança dos `runs-on` dos jobs com navegador e parecer de devops, na branch melhoria/runner-ubuntu-2404, worktree /home/rodrigoisensee/MetricasDSPD-052h; commit sem push (o envio de arquivo de workflow exige o escopo `workflow`, que é do dono)." · etapa de outra delegação; continua no pedido
- "E1.2 (security-engineer): parecer de segurança (gatilho CI/CD)." · etapa de outra delegação; continua no pedido
- "E1.3 (tech-lead): review." · etapa de outra delegação; continua no pedido
- "E1.4 (dono): push da branch." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.6 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido
- "E1.7 (devops-engineer): parecer de devops novo, em commit separado e com `commit:` do código, enviado pelo próprio devops (o commit só de parecer não toca workflow e não pede o escopo `workflow`, como o da segurança e o do review)." · etapa de outra delegação; continua no pedido
- "E1.8 (qa-engineer): parecer de QA (classe C), enviado pelo próprio QA." · etapa de outra delegação; continua no pedido
- "E1.9 (devops-engineer): a troca de imagem não resolveu (PR 318); diagnóstico e correção que não dependa do apt do runner na instalação do navegador (por exemplo, rodar os jobs com navegador no container oficial do Playwright, de versão fixada, ou instalar com nova tentativa e espelho alternativo), na mesma branch e worktree; commit sem push (workflow: o envio é do dono)." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052h log -3 --format=%B` · espera: contém 'Cartão: K-269'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
