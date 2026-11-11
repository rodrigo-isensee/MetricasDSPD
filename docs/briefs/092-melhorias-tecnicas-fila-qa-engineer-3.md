Agente destino: forge:qa-engineer
Pedido: 092-melhorias-tecnicas-fila
Tipo: codigo
Branch: docs/k121-frontmatter   Base: develop   Base-sha: 6e42dfb898eb94f1a1e397c6daa4b5ff60cc2f13
Etapa: codigo   Cobre: E1.1

## Objetivo
Volta do K-121 (parte do QA): no commit 32d41e80 da branch `docs/k121-frontmatter` (worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041`), os oito documentos antigos de `docs/qa/` ganharam o frontmatter completo com valores que eles não têm: sete são planos, medições ou diagnósticos sem veredito e receberam `parecer: aprovado` e bugs zero. O validador aceita `contrato: 0` para documento anterior ao contrato (é o que os planos antigos de `docs/architecture/features/` usam), sem inventar campo.

## Ler
- `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 show 32d41e80 --stat` e o frontmatter de cada um dos oito.
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/architecture/features/front-via-api.md`, as três primeiras linhas (o modelo `contrato: 0`).

## Entregar
- "E1.1 (qa-engineer): K-121, frontmatter nos 8 documentos de docs/qa que o forge-check docs acusa, na branch docs/k121-frontmatter, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041." (E1.1) Nesta volta, a forma honesta do frontmatter.
- (E1) (E1.1) Em cada um dos oito, trocar o frontmatter de 32d41e80 por `contrato: 0` (só esse campo entre os `---`), sem mudar o corpo; manter o frontmatter completo só onde o documento é de fato um parecer com veredito próprio, pedido e commit escritos no texto (se nenhum for, todos ficam com `contrato: 0`). `forge-check docs` sem erro nos oito. Commit com `Cartão: K-121` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito pelos oito caminhos); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 push origin HEAD:refs/heads/docs/k121-frontmatter` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR. Não tocar no arquivo de `docs/architecture/` já editado e sem commit (é do tech-lead levar).
- (E2) (E3) (E5) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/qa/011-back-plano.md, docs/qa/acabamento-ux.md, docs/qa/env-pesquisa.md, docs/qa/f4-medicao.md, docs/qa/front-via-api.md, docs/qa/intensivo-filtros.md, docs/qa/k101-rodada-noturna-2026-10-15.md, docs/qa/sustentacao-no-operacional-plano.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 092-melhorias-tecnicas-fila até e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (0 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/092-melhorias-tecnicas-fila.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0004
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: arquivos fora da lista `- arquivos:` (outro arquivo necessário: pare e relate antes), os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
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
- "E5.3 (qa-engineer): QA do K-264." · etapa de outra delegação; continua no pedido
- "E5.4 (tech-lead): PR do K-264 para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 show origin/docs/k121-frontmatter:docs/qa/011-back-plano.md` · espera: contém 'contrato: 0'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
