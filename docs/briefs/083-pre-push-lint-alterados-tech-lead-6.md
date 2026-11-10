pr: isento de QA: diff só de .md fora do controle (MD_DE_CONTROLE: agents/, skills/, stacks/*/agents|skills|seguranca.md|pronto.md, docs/regras/, templates/projeto/, CLAUDE.md) (R-QA); o review continua exigido (R-REVIEW)
pr: classe T (só documentação fora dos caminhos de controle); review e QA pela classe, devops e segurança também pelos gatilhos (P5; forge-check classe)
pr: isento de QA: diff só de .md fora do controle (MD_DE_CONTROLE: agents/, skills/, stacks/*/agents|skills|seguranca.md|pronto.md, docs/regras/, templates/projeto/, CLAUDE.md) (R-QA); o review continua exigido (R-REVIEW)
pr: classe T (só documentação fora dos caminhos de controle); review e QA pela classe, devops e segurança também pelos gatilhos (P5; forge-check classe)
Agente destino: forge:tech-lead
Pedido: 083-pre-push-lint-alterados
Tipo: merge
Branch: docs/retros-2026-11-09   Base: develop   Base-sha: 528ae770bee1a71af06dbea4f4a7042a383ccf57
Etapa: pr   Cobre: E1.4

## Objetivo
PR da branch `docs/retros-2026-11-09` para a develop: retrospectivas do 079, 080, 081, 082 e 083, só documentação (classe T, isenta de QA), com review aprovado e conferido (bf913e4101cf258a5caa1d021c18038f3677ea21); o merge é do dono. Worktree `/home/rodrigoisensee/MetricasDSPD-052h`.

## Ler
- Do pedido `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/083-pre-push-lint-alterados.md`, só as linhas do `## Histórico` de 2026-11-10.

## Entregar
- "E1.4 (tech-lead): PR para a develop, depois do QA; o merge é do dono." (E1.4) Nesta delegação, só o PR da branch das retrospectivas (isenta de QA pela classe T, DECISÃO TÉCNICA do Histórico de 2026-11-10 09:38).
- (E1) (E1.4) Abrir o PR em rascunho com `gh pr create --draft --repo rodrigo-isensee/MetricasDSPD --base develop --head docs/retros-2026-11-09 --title "docs(retro): retrospectivas dos pedidos 079 a 083" --body-file <arquivo gravado por Write no scratchpad>` (corpo: as cinco retrospectivas, o parecer de review e os achados recomendados A1 e A2); se o hook recusar por prazo de decisão, repita até duas vezes a partir da worktree e, persistindo, relate a mensagem literal; esperar todos os checks verdes por chamadas curtas; `gh pr ready <número> --repo rodrigo-isensee/MetricasDSPD` uma vez; não mesclar. `api.github.com` e `github.com` em allowed_domains. Sem `--admin` nem `--force`.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 083-pre-push-lint-alterados até 3f7a71dd21a9fbbf8e7b4f629c5df4aa41156a4e5dc5ee44cb9d88ce7325ace3 (2 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/083-pre-push-lint-alterados.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*`. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- forge-check: o do PATH aponta para a cópia do Windows, quebrada (Histórico do 077 de 2026-11-10 08:56); se precisar dele e falhar, relate, sem contornar.
- NÃO tocar: as retrospectivas (o review não as edita), outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (devops-engineer): implementação em `.githooks/pre-push` (e `package.json`, se precisar de script novo), com teste do hook se o projeto já testa scripts, e parecer de devops em docs/devops/." · etapa de outra delegação; continua no pedido
- "E1.2 (tech-lead): review." · etapa de outra delegação; continua no pedido
- "E1.3 (qa-engineer): QA (push com e sem `.ts` alterado; push só de docs; CI ainda com eslint inteiro)." · etapa de outra delegação; continua no pedido
- "E1.5 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido
- "E1.6 (security-engineer): parecer de segurança (o pre-push é controle local; o forge-check pr exige revisão de segurança)." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (pr): `gh pr list --repo rodrigo-isensee/MetricasDSPD --head docs/retros-2026-11-09 --state open --json number --jq length` · espera: igual '1'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
