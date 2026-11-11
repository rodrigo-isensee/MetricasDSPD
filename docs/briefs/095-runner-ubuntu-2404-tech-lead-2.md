## Objetivo
PR da troca de runner dos jobs com navegador para a develop: branch `melhoria/runner-ubuntu-2404`, worktree `/home/rodrigoisensee/MetricasDSPD-052h`, head ec6b89e2 (código 60bdc206; devops, segurança e review aprovados), base develop eac38a64b0b580d7c920f4b2b501287f7fb56599.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052h/docs/reviews/095-runner-ubuntu-2404.md`, `/home/rodrigoisensee/MetricasDSPD-052h/docs/security/095-runner-ubuntu-2404.md` e `/home/rodrigoisensee/MetricasDSPD-052h/docs/devops/095-runner-ubuntu-2404.md`.

## Entregar
- "E1.5 (tech-lead): PR para a develop; o merge é do dono." (E1.5)
- (E1) (E1.5) Abrir o PR da branch para a `develop` (squash) pelo gh, com título e corpo curtos (o motivo: o runner Ubuntu 26.04 não resolve os espelhos do apt; os 4 jobs tocados; os três pareceres; `Cartão: K-269`). Se a branch estiver atrás da develop, atualizar só por merge da develop na branch (sem rebase nem force) e relatar o novo head. Esperar os checks do PR e relatar o estado de cada um, em especial `e2e-parte` e `perf` no ubuntu-24.04 (falha: nome do check e linha do erro). Não mesclar: o merge é do dono.
- arquivos: .github/workflows/ci.yml, .github/workflows/homolog.yml, docs/reviews/095-runner-ubuntu-2404.md

## Pronto quando
- PQ-1 (cmd): `gh pr list --head melhoria/runner-ubuntu-2404 --state open --json number` · espera: contém 'number'
