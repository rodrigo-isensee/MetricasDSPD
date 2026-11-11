Agente destino: forge:tech-lead
Pedido: 092-melhorias-tecnicas-fila
Tipo: codigo
Branch: fix/k264-cli-tmpdir   Base: develop   Base-sha: 6e42dfb898eb94f1a1e397c6daa4b5ff60cc2f13
Etapa: codigo   Cobre: E5.2

## Objetivo
Review do K-264: branch `fix/k264-cli-tmpdir`, worktree `/home/rodrigoisensee/MetricasDSPD-052g`, commit 6d2e15be (base develop 6e42dfb898eb94f1a1e397c6daa4b5ff60cc2f13), `pnpm run pronto` verde pelo autor dentro do sandbox.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052g diff 6e42dfb898eb94f1a1e397c6daa4b5ff60cc2f13 6d2e15be`.

## Entregar
- "E5.2 (tech-lead): review do K-264." (E5.2)
- (E5) (E5.2) Review: o ajudante `server/tests/ajuda-cli-filho.ts` repassa ao filho só `PATH` e, quando definida, a pasta temporária, mais o que cada teste pede; o `.env` real continua ignorado (isolamento do K-261 mantido); nenhuma asserção dos cinco testes foi afrouxada; nada de produção mudou. Rodar os cinco arquivos com no máximo 2 workers (R-TETO). Parecer `docs/reviews/092-k264-cli-tmpdir.md` (novo) pela ferramenta Write, com `pedido: 092-melhorias-tecnicas-fila`, `branch: fix/k264-cli-tmpdir`, `commit:` o sha40 de 6d2e15be e o veredito; `## Achados` só com linhas de achado de até 300 caracteres; `forge-check docs` sem erro nele. Commit só do parecer com `Cartão: K-264` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052g push origin HEAD:refs/heads/fix/k264-cli-tmpdir` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E2) (E3) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/reviews/092-k264-cli-tmpdir.md

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
- "E5.3 (qa-engineer): QA do K-264." · etapa de outra delegação; continua no pedido
- "E5.4 (tech-lead): PR do K-264 para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052g show origin/fix/k264-cli-tmpdir:docs/reviews/092-k264-cli-tmpdir.md` · espera: contém 'branch: fix/k264-cli-tmpdir'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
