Agente destino: forge:tech-lead
Pedido: 092-melhorias-tecnicas-fila
Tipo: codigo
Branch: docs/retros-2026-11-11b   Base: develop   Base-sha: 87eaef8f022649039bdeb967d8b39023ef9998c5
Etapa: codigo   Cobre: E4.2

## Objetivo
Levar à develop as duas retrospectivas escritas e não commitadas na worktree `/home/rodrigoisensee/MetricasDSPD-052g`, branch `docs/retros-2026-11-11b` (base develop 87eaef8f): `docs/retrospectivas/2026-11-11-091-homolog-reavalia.md` e `docs/retrospectivas/2026-11-11-092-melhorias-tecnicas.md`, com o review delas.

## Ler
- Os dois arquivos acima (novo), na worktree.
- Um parecer de review recente de retrospectivas como modelo, por exemplo `docs/reviews/078-retros-2026-11-10.md` na develop.

## Entregar
- "E4.2 (tech-lead): review e envio das retrospectivas do 091 e do 092 (worktree 052g, branch docs/retros-2026-11-11b): parecer de review, commit, push e PR para a develop; o merge é do dono." (E4.2)
- (E1) (E2) (E3) (E5) (E4.2) Trazer a develop (`git merge origin/develop`, sem rebase), rodar `pnpm run docs:check` e corrigir só forma de documentação se ele acusar. Commit dos dois arquivos com `Cartão: K-121, K-172, K-174, K-263, K-264` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito pelos dois caminhos). Review das duas (forma, nenhum dado pessoal nem avaliação individual, linhas MELHORIA com evidência) e parecer `docs/reviews/092-retros-2026-11-11b.md` (novo) pela ferramenta Write, com `pedido: 092-melhorias-tecnicas-fila`, `branch: docs/retros-2026-11-11b`, `commit:` o sha40 do commit das retrospectivas e o veredito; `## Achados` com linhas de até 300 caracteres; commit só do parecer. Push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052g push origin HEAD:refs/heads/docs/retros-2026-11-11b` (`github.com` em allowed_domains); commit e push em chamadas separadas. Se aprovado, abrir o PR para a develop pelo nome da branch, a partir da worktree, com corpo gravado por Write e passado com `--body-file`, e esperar a CI em laços de até 170 s por chamada, com uma leitura final de `gh pr checks`; se o PR for mesclado no meio, registre e pare. Não mesclar.
- arquivos: docs/retrospectivas/2026-11-11-091-homolog-reavalia.md, docs/retrospectivas/2026-11-11-092-melhorias-tecnicas.md, docs/reviews/092-retros-2026-11-11b.md

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
- "E5.3 (qa-engineer): QA do K-264." · etapa de outra delegação; continua no pedido
- "E5.4 (tech-lead): PR do K-264 para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `gh pr list --repo rodrigo-isensee/MetricasDSPD --state all --head docs/retros-2026-11-11b --base develop --json number --jq .[].number` · espera: linhas=1
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
