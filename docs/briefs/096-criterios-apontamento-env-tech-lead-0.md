## Objetivo
Review do K-270: branch `fix/k270-criterios-env`, worktree `/home/rodrigoisensee/MetricasDSPD-052g`, código em 3316cce9582e2c8aeda9180c60fc453aa123f4b0 (o passo de critérios do apontamento carrega o `.env` da raiz como o `ref-sync-apontamento.ts`; script `bm:criterios-apontamento`; roteiro do CHANGELOG; teste novo com 3 casos), QA aprovado em 508823c3, base develop eac38a64b0b580d7c920f4b2b501287f7fb56599.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052g diff eac38a64b0b580d7c920f4b2b501287f7fb56599 3316cce9582e2c8aeda9180c60fc453aa123f4b0`.

## Entregar
- "E1.2 (tech-lead): review." (E1.2)
- (E1) (E1.2) Review: o carregador é o mesmo dos `bm:*` (sem cópia divergente), mudança mínima, teste hermético e legível, nome do script coerente com os outros. Rodar o arquivo de teste com no máximo 2 workers (R-TETO). Parecer `docs/reviews/096-criterios-apontamento-env.md` (novo) pela ferramenta Write, com `pedido: 096-criterios-apontamento-env`, `branch: fix/k270-criterios-env`, `commit: 3316cce9582e2c8aeda9180c60fc453aa123f4b0` e o veredito; `## Achados` com linhas de até 300 caracteres. Commit só do parecer com `Cartão: K-270` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052g push origin HEAD:refs/heads/fix/k270-criterios-env` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E2) (E1.2) Conferir o trecho do roteiro no `CHANGELOG.md`.
- arquivos: docs/reviews/096-criterios-apontamento-env.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052g show origin/fix/k270-criterios-env:docs/reviews/096-criterios-apontamento-env.md` · espera: contém 'branch: fix/k270-criterios-env'
