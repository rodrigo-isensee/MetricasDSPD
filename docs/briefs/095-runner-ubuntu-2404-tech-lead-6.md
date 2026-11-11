## Objetivo
PR da troca de runner dos jobs com navegador para a develop: branch `melhoria/runner-ubuntu-2404`, worktree `/home/rodrigoisensee/MetricasDSPD-052h`, head 4a59c880 (código 60bdc206; devops em 9919379c, segurança, review e QA em 4a59c880, todos aprovados), base develop eac38a64b0b580d7c920f4b2b501287f7fb56599. A tentativa anterior foi barrada pelo hook R-QA (faltavam QA e parecer de devops atualizado; agora estão na branch).

## Ler
- Os quatro pareceres da branch: `/home/rodrigoisensee/MetricasDSPD-052h/docs/reviews/095-runner-ubuntu-2404.md`, `/home/rodrigoisensee/MetricasDSPD-052h/docs/security/095-runner-ubuntu-2404.md`, `/home/rodrigoisensee/MetricasDSPD-052h/docs/devops/095-runner-ubuntu-2404.md` e `/home/rodrigoisensee/MetricasDSPD-052h/docs/qa/095-runner-ubuntu-2404.md`.
## Entregar
- "E1.5 (tech-lead): PR para a develop; o merge é do dono." (E1.5)
- (E1) (E1.5) Antes, rodar da worktree `forge-check pr 095-runner-ubuntu-2404` (com `--raiz-pedidos /home/rodrigoisensee/Metricas/MetricasDSPD`) e, se houver pendência, parar e relatar. Abrir o PR da branch para a `develop` (squash) pelo gh, com título e corpo curtos (o motivo: o runner Ubuntu 26.04 não resolve os espelhos do apt; os 4 jobs tocados; os quatro pareceres; `Cartão: K-269`), com a seção `## Sem teste` no corpo: mudança só de imagem do runner, sem teste local possível; a prova é o próprio CI do PR, com os jobs `e2e-parte` e `perf` verdes no ubuntu-24.04. Se a branch estiver atrás da develop, atualizar só por merge da develop na branch (sem rebase nem force) e relatar o novo head. Esperar os checks do PR e relatar o estado de cada um, em especial `e2e-parte` e `perf` no ubuntu-24.04 (falha: nome do check e linha do erro). Não mesclar: o merge é do dono.
- arquivos: [.]github/workflows/ci.yml, [.]github/workflows/homolog.yml, docs/reviews/095-runner-ubuntu-2404.md

## Pronto quando
- PQ-1 (cmd): `gh pr list --head melhoria/runner-ubuntu-2404 --state open --json number` · espera: contém 'number'
