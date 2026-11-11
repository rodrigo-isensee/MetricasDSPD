## Objetivo
QA do K-264: branch `fix/k264-cli-tmpdir`, worktree `/home/rodrigoisensee/MetricasDSPD-052g`, código em 6d2e15be27630e6f75d21ddb7876f7b3ed18b074 (entrega conferida), review aprovado (3b3affe9), base develop 6e42dfb898eb94f1a1e397c6daa4b5ff60cc2f13.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052g diff 6e42dfb898eb94f1a1e397c6daa4b5ff60cc2f13 6d2e15be27630e6f75d21ddb7876f7b3ed18b074`.
- `/home/rodrigoisensee/MetricasDSPD-052g/docs/reviews/092-k264-cli-tmpdir.md` (novo).

## Entregar
- "E5.3 (qa-engineer): QA do K-264." (E5.3)
- (E5) (E5.3) Rodar os cinco arquivos de teste de CLI do server com no máximo 2 workers (R-TETO) dentro do sandbox e conferir que passam; conferir que o filho continua sem o `.env` real (o caso do K-261 com `.env` de mentira segue verde); uma mutação (tirar a pasta temporária do ajudante) que volta a derrubar os testes no sandbox, restaurada antes do commit. Grave `docs/qa/092-k264-cli-tmpdir.md` (novo) pela ferramenta Write, uma vez só, com `pedido: 092-melhorias-tecnicas-fila`, `branch: fix/k264-cli-tmpdir`, `commit: 6d2e15be27630e6f75d21ddb7876f7b3ed18b074`, veredito, contagem de bugs fora do bloco `## Achados` e `## Achados` só com linhas de achado de até 300 caracteres; `forge-check docs` sem erro nele. Commit só do parecer com `Cartão: K-264` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052g push origin HEAD:refs/heads/fix/k264-cli-tmpdir` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E2) (E3) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/qa/092-k264-cli-tmpdir.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052g show origin/fix/k264-cli-tmpdir:docs/qa/092-k264-cli-tmpdir.md` · espera: contém 'commit: 6d2e15be27630e6f75d21ddb7876f7b3ed18b074'
