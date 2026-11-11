Agente destino: forge:tech-lead
Pedido: 092-melhorias-tecnicas-fila
Tipo: codigo
Branch: docs/k121-frontmatter   Base: develop   Base-sha: 6e42dfb898eb94f1a1e397c6daa4b5ff60cc2f13
Etapa: codigo   Cobre: E1.2

## Objetivo
Review do K-121: branch `docs/k121-frontmatter`, worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041`, ponta 80bfc064 (base develop 6e42dfb898eb94f1a1e397c6daa4b5ff60cc2f13). Só documentação, classe T: dez documentos antigos ganharam o frontmatter `contrato: 0` (anterior ao contrato), sem mudar o corpo; o commit 32d41e80 tinha posto campos inventados nos de docs/qa e foi corrigido em b4c5f702.

## Ler
- `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 diff 6e42dfb898eb94f1a1e397c6daa4b5ff60cc2f13 80bfc064 --stat` e o diff completo.

## Entregar
- "E1.2 (tech-lead): review do K-121." (E1.2)
- (E1) (E1.2) Review: no diff final só entram as linhas de frontmatter `contrato: 0` nos dez arquivos, nenhum corpo muda, nenhum campo foi inventado; `forge-check docs` não acusa mais nenhum dos dez. Parecer `docs/reviews/092-k121-frontmatter.md` (novo) pela ferramenta Write, com `pedido: 092-melhorias-tecnicas-fila`, `branch: docs/k121-frontmatter`, `commit:` o sha40 de 80bfc064 e o veredito; `## Achados` com linhas de até 300 caracteres. Commit só do parecer com `Cartão: K-121` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 push origin HEAD:refs/heads/docs/k121-frontmatter` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E2) (E3) (E5) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/reviews/092-k121-frontmatter.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 092-melhorias-tecnicas-fila até e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (0 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/092-melhorias-tecnicas-fila.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0004
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (qa-engineer): K-121, frontmatter nos 8 documentos de docs/qa que o forge-check docs acusa, na branch docs/k121-frontmatter, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041." · etapa de outra delegação; continua no pedido
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
- "E5.3 (qa-engineer): QA do K-264." · etapa de outra delegação; continua no pedido
- "E5.4 (tech-lead): PR do K-264 para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 show origin/docs/k121-frontmatter:docs/reviews/092-k121-frontmatter.md` · espera: contém 'branch: docs/k121-frontmatter'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
