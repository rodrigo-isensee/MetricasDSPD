Agente destino: forge:devops-engineer
Pedido: 095-runner-ubuntu-2404
Tipo: codigo
Branch: melhoria/runner-ubuntu-2404   Base: develop   Base-sha: eac38a64b0b580d7c920f4b2b501287f7fb56599
Etapa: codigo   Cobre: E1.7

## Objetivo
Parecer de devops novo para a troca de runner: o `forge-check pr` acusa o parecer atual desatualizado porque foi commitado junto com os workflows (60bdc206) e o `commit:` dele aponta a base. Branch `melhoria/runner-ubuntu-2404`, worktree `/home/rodrigoisensee/MetricasDSPD-052h`, head ec6b89e2, código em 60bdc2060232fc1cd5258bec580aa53dde08dc31.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052h/docs/devops/095-runner-ubuntu-2404.md` (o parecer atual) e a saída do `forge-check parecer delta` desse parecer, rodado da worktree.

## Entregar
- "E1.7 (devops-engineer): parecer de devops novo, em commit separado e com `commit:` do código (60bdc206), enviado pelo próprio devops (o commit só de parecer não toca workflow e não pede o escopo `workflow`, como o da segurança e o do review)." (E1.7)
- (E1) (E1.7) Regravar `docs/devops/095-runner-ubuntu-2404.md` pela ferramenta Write com o mesmo conteúdo de mérito e `commit: 60bdc2060232fc1cd5258bec580aa53dde08dc31` (o commit que mudou os workflows), acolhendo o A1 do review. Commit separado, só do parecer, com `Cartão: K-269` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito). Este commit não toca workflow, então o push sai sem o escopo `workflow`: push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052h push origin HEAD:refs/heads/melhoria/runner-ubuntu-2404` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR. Recusa do push: pare e relate.
- arquivos: docs/devops/095-runner-ubuntu-2404.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 095-runner-ubuntu-2404 até e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (0 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/095-runner-ubuntu-2404.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (devops-engineer): mudança dos `runs-on` dos jobs com navegador e parecer de devops, na branch melhoria/runner-ubuntu-2404, worktree /home/rodrigoisensee/MetricasDSPD-052h; commit sem push (o envio de arquivo de workflow exige o escopo `workflow`, que é do dono)." · etapa de outra delegação; continua no pedido
- "E1.2 (security-engineer): parecer de segurança (gatilho CI/CD)." · etapa de outra delegação; continua no pedido
- "E1.3 (tech-lead): review." · etapa de outra delegação; continua no pedido
- "E1.4 (dono): push da branch." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.6 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido
- "E1.8 (qa-engineer): parecer de QA (classe C), enviado pelo próprio QA." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052h show origin/melhoria/runner-ubuntu-2404:docs/devops/095-runner-ubuntu-2404.md` · espera: contém 'commit: 60bdc2060232fc1cd5258bec580aa53dde08dc31'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
