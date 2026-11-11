## Objetivo
Parecer de devops novo para a troca de runner: o `forge-check pr` acusa o parecer atual desatualizado porque foi commitado junto com os workflows (60bdc206) e o `commit:` dele aponta a base. Branch `melhoria/runner-ubuntu-2404`, worktree `/home/rodrigoisensee/MetricasDSPD-052h`, head ec6b89e2, código em 60bdc2060232fc1cd5258bec580aa53dde08dc31.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052h/docs/devops/095-runner-ubuntu-2404.md` (o parecer atual) e a saída do `forge-check parecer delta` desse parecer, rodado da worktree.

## Entregar
- "E1.7 (devops-engineer): parecer de devops novo, em commit separado e com `commit:` do código (60bdc206), enviado pelo próprio devops (o commit só de parecer não toca workflow e não pede o escopo `workflow`, como o da segurança e o do review)." (E1.7)
- (E1) (E1.7) Regravar `docs/devops/095-runner-ubuntu-2404.md` pela ferramenta Write com o mesmo conteúdo de mérito e `commit: 60bdc2060232fc1cd5258bec580aa53dde08dc31` (o commit que mudou os workflows), acolhendo o A1 do review. Commit separado, só do parecer, com `Cartão: K-269` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito). Este commit não toca workflow, então o push sai sem o escopo `workflow`: push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052h push origin HEAD:refs/heads/melhoria/runner-ubuntu-2404` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR. Recusa do push: pare e relate.
- arquivos: docs/devops/095-runner-ubuntu-2404.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052h show origin/melhoria/runner-ubuntu-2404:docs/devops/095-runner-ubuntu-2404.md` · espera: contém 'commit: 60bdc2060232fc1cd5258bec580aa53dde08dc31'
