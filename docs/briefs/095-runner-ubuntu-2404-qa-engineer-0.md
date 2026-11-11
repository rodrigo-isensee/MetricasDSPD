## Objetivo
QA da troca de runner dos jobs com navegador (classe C): branch `melhoria/runner-ubuntu-2404`, worktree `/home/rodrigoisensee/MetricasDSPD-052h`, código em 60bdc2060232fc1cd5258bec580aa53dde08dc31 (só `runs-on: ubuntu-24.04` em 4 jobs de `ci.yml` e `homolog.yml`), base develop eac38a64b0b580d7c920f4b2b501287f7fb56599. Devops, segurança e review aprovados.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052h diff eac38a64b0b580d7c920f4b2b501287f7fb56599 60bdc2060232fc1cd5258bec580aa53dde08dc31`.
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/devops/093-runner-ubuntu26-dns.md` (a falha que motivou).

## Entregar
- "E1.8 (qa-engineer): parecer de QA (classe C), enviado pelo próprio QA." (E1.8)
- (E1) (E1.8) Conferir que o conjunto de testes que cada job roda não mudou (mesmos comandos, shards e filtros; só a imagem), que os 4 jobs são todos os que instalam navegador (nenhum ficou de fora no `ubuntu-latest`) e que nenhum teste foi pulado ou afrouxado. A prova de execução é o CI do PR (o tech-lead relata os checks); declare isso no parecer. Não rodar a suíte E2E local (R-TETO). Grave `docs/qa/095-runner-ubuntu-2404.md` (novo) pela ferramenta Write, com `pedido: 095-runner-ubuntu-2404`, `branch: melhoria/runner-ubuntu-2404`, `commit: 60bdc2060232fc1cd5258bec580aa53dde08dc31`, veredito, contagem de bugs fora do bloco `## Achados` e `## Achados` só com linhas de achado (vazio se não houver). Commit só do parecer com `Cartão: K-269` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052h push origin HEAD:refs/heads/melhoria/runner-ubuntu-2404` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- arquivos: docs/qa/095-runner-ubuntu-2404.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052h show origin/melhoria/runner-ubuntu-2404:docs/qa/095-runner-ubuntu-2404.md` · espera: contém 'commit: 60bdc2060232fc1cd5258bec580aa53dde08dc31'
