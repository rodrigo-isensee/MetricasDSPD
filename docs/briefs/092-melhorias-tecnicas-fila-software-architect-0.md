## Objetivo
K-121, parte do arquiteto: `docs/architecture/features/front-via-api.md` não tem o frontmatter que o `forge-check docs` exige. Worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041`, branch `docs/k121-frontmatter` (já com o commit do QA 32d41e80).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/architecture/features/front-via-api.md`.
- Um documento de `docs/architecture/features/` com frontmatter válido, como modelo (o primeiro que o `forge-check docs` não acusa).

## Entregar
- "E1.5 (software-architect): K-121, frontmatter em docs/architecture/features/front-via-api.md, na mesma branch (o tech-lead leva o arquivo ao commit)." (E1.5)
- (E1) (E1.5) Acrescentar no topo do arquivo o frontmatter no formato do modelo, sem mudar o corpo, com valores tirados do próprio documento; o que não se souber fica como o validador aceita para campo desconhecido, sem inventar decisão nem estado que o documento não tenha. Gravar pela ferramenta Edit ou Write, só esse arquivo. Sem commit nem push (o tech-lead leva o arquivo ao commit, E1.4).
- (E2) (E3) (E5) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/architecture/features/front-via-api.md

## Pronto quando
- PQ-1 (cmd): `head -3 /home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/architecture/features/front-via-api.md` · espera: contém '---'
