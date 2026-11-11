## Objetivo
QA do K-270: branch `fix/k270-criterios-env`, worktree `/home/rodrigoisensee/MetricasDSPD-052g`, código em 3316cce9582e2c8aeda9180c60fc453aa123f4b0 (o passo de critérios do apontamento carrega o `.env` da raiz como o `ref-sync-apontamento.ts`; script `bm:criterios-apontamento`; roteiro do CHANGELOG), base develop eac38a64b0b580d7c920f4b2b501287f7fb56599.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052g diff eac38a64b0b580d7c920f4b2b501287f7fb56599 3316cce9582e2c8aeda9180c60fc453aa123f4b0`.

## Entregar
- "E1.3 (qa-engineer): QA." (E1.3)
- (E1) (E1.3) Rodar `server/tests/criterios-apontamento-entrada.test.ts` com no máximo 2 workers (R-TETO); uma mutação (tirar a chamada do carregador do `.env` ou trocar a pasta raiz) que o teste pega, restaurada antes do commit; conferir que a falha sem `.env` não imprime nada do `.env` e que nenhum teste usa base real nem `.env` de verdade (só arquivo de teste em pasta temporária). Grave `docs/qa/096-criterios-apontamento-env.md` (novo) pela ferramenta Write, com `pedido: 096-criterios-apontamento-env`, `branch: fix/k270-criterios-env`, `commit: 3316cce9582e2c8aeda9180c60fc453aa123f4b0`, veredito, contagem de bugs fora do bloco `## Achados` e `## Achados` só com linhas de achado (vazio se não houver). Commit só do parecer com `Cartão: K-270` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052g push origin HEAD:refs/heads/fix/k270-criterios-env` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E2) (E1.3) Conferir no `CHANGELOG.md` que o passo de critérios do roteiro usa o script novo.
- arquivos: docs/qa/096-criterios-apontamento-env.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052g show origin/fix/k270-criterios-env:docs/qa/096-criterios-apontamento-env.md` · espera: contém 'commit: 3316cce9582e2c8aeda9180c60fc453aa123f4b0'
