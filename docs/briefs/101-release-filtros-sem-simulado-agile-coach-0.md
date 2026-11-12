Agente destino: forge:agile-coach
Pedido: 101-release-filtros-sem-simulado
Tipo: review
Branch: docs/retros-2026-11-12   Base: develop   Base-sha: 0bcfbac8c7c37a3d847523649ea3c5382bf559bb
Etapa: review   Cobre: E1.7
Revisar-sha: 0bcfbac8c7c37a3d847523649ea3c5382bf559bb

## Objetivo
Retrospectiva curta do pedido 101 (release da develop para a main com os filtros do 097 e o sem simulado do 099). O dono mesclou o PR 360 na main. Worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041b`, branch `docs/retros-2026-11-12` (nova, sobre a develop).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/101-release-filtros-sem-simulado.md` (inteiro).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/kanban/conferencias.md`: só as linhas do 101.

## Entregar
- "E1.7 (agile-coach): retrospectiva curta da release." (E1.7)
- (E1) (E1.7) Escrever pela ferramenta Write `/home/rodrigoisensee/Metricas/MetricasDSPD-041b/docs/retrospectivas/2026-11-12-101-release-filtros-sem-simulado.md` (novo), no formato das retrospectivas da pasta: o que correu bem, o que travou (QA da release reprovado por specs velhos do e2e chromium-api e a volta E1.9; o teste de banco fora do sandbox, que virou a regra do dono de prova de banco pelo CI; o PR 360 BLOCKED pela proteção da main; o merge do PR 361 pela conta do dono com um check ainda pending), retrabalho pelas conferências, lead time pelo Histórico e as linhas `MELHORIA:` (uma por linha, com evidência; o que é do Forge marcado "vai ao Forge"; o que já está em `docs/kanban/melhorias.md` fica só como dado). Commit só da retrospectiva com `Cartão: K-275` (por `git commit -F` de arquivo gravado por Write no scratchpad com nome próprio, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b push origin HEAD:refs/heads/docs/retros-2026-11-12` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- arquivos: docs/retrospectivas/2026-11-12-101-release-filtros-sem-simulado.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 101-release-filtros-sem-simulado até 16829ad18af47c29b5f7d60a1cd9398db9144e0a6e39ce47455052a018ca8764 (1 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/101-release-filtros-sem-simulado.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): CHANGELOG da release e review (develop contra homolog), parecer na branch docs/101-release." · etapa de outra delegação; continua no pedido
- "E1.2 (security-engineer): parecer de segurança da release, na branch docs/101-release." · etapa de outra delegação; continua no pedido
- "E1.3 (qa-engineer): QA da release (suítes na ponta da develop), parecer na branch docs/101-release." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR da docs/101-release para a develop e merge com os checks verdes." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR da develop para a homolog e merge com o portão verde (o merge até a homolog é do time, pela autorização do dono de 17:51)." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR de release da homolog para a main, aberto; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.8 (tech-lead): PR só de documentos para a develop com o que os agentes gravaram sem commit na árvore principal (revisões de UX e análises) e a segunda rodada do UX do 097 (branch docs/097-ux-recolher-setor), branch docs/101-documentos-da-noite, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041." · etapa de outra delegação; continua no pedido
- "E1.9 (qa-engineer): specs velhos do e2e chromium-api que reprovaram o QA da release (A1 a A3 do parecer de QA da release; o A4 investigado), branch fix/101-specs-e2e-api a partir da develop, worktree /home/rodrigoisensee/MetricasDSPD-052g. - Cada portão (QA, segurança, review) commita e envia o próprio parecer na branch." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b log --oneline -1 origin/docs/retros-2026-11-12` · espera: contém '101'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
