## Objetivo
PR do K-270 para a develop: branch `fix/k270-criterios-env`, worktree `/home/rodrigoisensee/MetricasDSPD-052g`, head 554f3b15 (código 3316cce9; QA em 508823c3, segurança em 1545a83e e review em 554f3b15, todos aprovados; `forge-check pr` com veredito aprovado), base develop eac38a64b0b580d7c920f4b2b501287f7fb56599.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052g/docs/reviews/096-criterios-apontamento-env.md`, `/home/rodrigoisensee/MetricasDSPD-052g/docs/qa/096-criterios-apontamento-env.md` e `/home/rodrigoisensee/MetricasDSPD-052g/docs/security/096-criterios-apontamento-env.md`.

## Entregar
- "E1.4 (tech-lead): PR para a develop; o merge é do dono." (E1.4)
- (E1) (E1.4) Abrir o PR da branch para a `develop` (squash) pelo gh, com título e corpo curtos (o que mudou: o passo de critérios do apontamento lê o `.env` sozinho e ganha o script `bm:criterios-apontamento`; os três pareceres; `Cartão: K-270`). Se a branch estiver atrás da develop, atualizar só por merge da develop na branch (sem rebase nem force) e relatar o novo head. Esperar os checks do PR e relatar o estado de cada um (falha: nome do check e linha do erro; a falha de DNS do runner Ubuntu 26.04 nos jobs com navegador é conhecida e vai pelo pedido 095). Não mesclar: o merge é do dono.
- (E2) (E1.4) O roteiro do `CHANGELOG.md` entra no mesmo PR.
- arquivos: server/src/entradas/criterios-apontamento.ts, server/package.json, server/tests/criterios-apontamento-entrada.test.ts, CHANGELOG.md, docs/reviews/096-criterios-apontamento-env.md

## Pronto quando
- PQ-1 (cmd): `gh pr list --head fix/k270-criterios-env --state open --json number` · espera: contém 'number'
