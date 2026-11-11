Agente destino: forge:agile-coach
Pedido: 092-melhorias-tecnicas-fila
Tipo: codigo
Branch: docs/retros-2026-11-11b   Base: develop   Base-sha: 87eaef8f022649039bdeb967d8b39023ef9998c5
Etapa: codigo   Cobre: E4.1

## Objetivo
Retrospectiva curta do pedido 092 (K-121, K-172 e K-264 na develop pelos PRs 307, 303 e 305; K-174 sem PR, causa não reproduzida). Worktree `/home/rodrigoisensee/MetricasDSPD-052g`, branch `docs/retros-2026-11-11b` (já tem, sem commit, a retrospectiva do 091, que não deve ser tocada).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/092-melhorias-tecnicas-fila.md` (inteiro).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/kanban/conferencias.md`: só as linhas do 092.

## Entregar
- "E4.1 (agile-coach): retrospectiva curta." (E4.1)
- (E1) (E2) (E3) (E5) (E4.1) Escrever pela ferramenta Write `/home/rodrigoisensee/MetricasDSPD-052g/docs/retrospectivas/2026-11-11-092-melhorias-tecnicas.md` (novo), no formato das retrospectivas da pasta: o que correu bem, o que travou (K-121 com papel errado no primeiro brief e campos inventados no frontmatter, corrigidos com `contrato: 0`; K-174 sem causa reproduzida; modelos de parecer ausentes no projeto; merge da develop pelo dono durante a espera da CI), retrabalho medido pelas conferências do 092, lead time pelo Histórico e as linhas `MELHORIA:` (uma por linha, com a evidência; o que é do Forge marcado "vai ao Forge"; o que já está em `docs/kanban/melhorias.md` ou tem cartão fica só como dado). Sem commit nem push nesta delegação.

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
- "E5.1 (node-backend): K-264, na branch fix/k264-cli-tmpdir, worktree /home/rodrigoisensee/MetricasDSPD-052g." · etapa de outra delegação; continua no pedido
- "E5.2 (tech-lead): review do K-264." · etapa de outra delegação; continua no pedido
- "E5.3 (qa-engineer): QA do K-264." · etapa de outra delegação; continua no pedido
- "E5.4 (tech-lead): PR do K-264 para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `test -s /home/rodrigoisensee/MetricasDSPD-052g/docs/retrospectivas/2026-11-11-092-melhorias-tecnicas.md` · espera: rc=0
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
