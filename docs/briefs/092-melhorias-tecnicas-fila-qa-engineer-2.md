Agente destino: forge:qa-engineer
Pedido: 092-melhorias-tecnicas-fila
Tipo: codigo
Branch: fix/k264-cli-tmpdir   Base: develop   Base-sha: 6e42dfb898eb94f1a1e397c6daa4b5ff60cc2f13
Etapa: codigo   Cobre: E5.3

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

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 092-melhorias-tecnicas-fila até e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (0 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/092-melhorias-tecnicas-fila.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0004
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (qa-engineer): K-121, frontmatter nos 8 documentos de docs/qa que o forge-check docs acusa, na branch docs/k121-frontmatter, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041." · etapa de outra delegação; continua no pedido
- "E1.2 (tech-lead): review do K-121." · etapa de outra delegação; continua no pedido
- "E1.3 (tech-lead): PR do K-121 para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): K-121, frontmatter em docs/reviews/front-via-api.md, na mesma branch, depois da E1.1." · etapa de outra delegação; continua no pedido
- "E1.5 (software-architect): K-121, frontmatter em docs/architecture/features/front-via-api.md, na mesma branch (o tech-lead leva o arquivo ao commit)." · etapa de outra delegação; continua no pedido
- "E2.1 (tech-lead): K-172, na branch docs/k172-pronto-praticas, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041b." · etapa de outra delegação; continua no pedido
- "E2.2 (tech-lead): review do K-172." · etapa de outra delegação; continua no pedido
- "E2.3 (tech-lead): PR do K-172 para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E3.1 (node-backend): K-174, na branch fix/k174-docs-contratos-carga, worktree /home/rodrigoisensee/MetricasDSPD-052g." · etapa de outra delegação; continua no pedido
- "E3.2 (tech-lead): review do K-174." · etapa de outra delegação; continua no pedido
- "E3.3 (qa-engineer): QA do K-174 (E1 e E2 são só documentação, classe T)." · etapa de outra delegação; continua no pedido
- "E3.4 (tech-lead): PR do K-174 para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E4.1 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido
- "E5.1 (node-backend): K-264, na branch fix/k264-cli-tmpdir, worktree /home/rodrigoisensee/MetricasDSPD-052g." · etapa de outra delegação; continua no pedido
- "E5.2 (tech-lead): review do K-264." · etapa de outra delegação; continua no pedido
- "E5.4 (tech-lead): PR do K-264 para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052g show origin/fix/k264-cli-tmpdir:docs/qa/092-k264-cli-tmpdir.md` · espera: contém 'commit: 6d2e15be27630e6f75d21ddb7876f7b3ed18b074'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
