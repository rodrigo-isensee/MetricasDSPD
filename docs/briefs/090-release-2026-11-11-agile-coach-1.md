Agente destino: forge:agile-coach
Pedido: 090-release-2026-11-11
Tipo: codigo
Branch: docs/retros-2026-11-11   Base: develop   Base-sha: 61c30b1ea25982fcfa84f16466f79448cc46296a
Etapa: codigo   Cobre: E1.7

## Objetivo
Retrospectiva do pedido 090 (release de 2026-11-11: PRs 299 e 300 mesclados, PR de release 301 da homolog para a main aberto com os checks verdes). Worktree `/home/rodrigoisensee/MetricasDSPD-052c`, branch `docs/retros-2026-11-11` (já tem, sem commit, as retrospectivas do 088 e do 089, que não devem ser tocadas).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/090-release-2026-11-11.md` (inteiro).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/kanban/conferencias.md`: só as linhas do 090.

## Entregar
- "E1.7 (agile-coach): retrospectiva do pedido 090." (E1.7)
- (E1) (E1.7) Escrever pela ferramenta Write `/home/rodrigoisensee/MetricasDSPD-052c/docs/retrospectivas/2026-11-11-090-release.md` (novo), no formato das retrospectivas da pasta: o que correu bem, o que travou (merges que dependem do dono ou da sessão que roda os comandos dele, com o pedido de permissão parado; conferências reprovadas por cartão e por estado; a reavaliação do homolog-aprovada, K-263), retrabalho medido pelas conferências do 090, lead time pelo Histórico e as linhas `MELHORIA:` (uma por linha, com a evidência; o que é do Forge marcado "vai ao Forge"; o que já tem cartão fica só como dado). Sem commit nem push nesta delegação.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 090-release-2026-11-11 até 74c4dff7f5ff7c6b2a452e50513f874c9b5e939e9a4dbc648c9394baafa2de7b (2 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/090-release-2026-11-11.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum commit nem push.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): CHANGELOG da release e review (develop contra homolog), parecer na branch docs/090-release." · etapa de outra delegação; continua no pedido
- "E1.2 (qa-engineer): QA da release (suítes na ponta da develop), parecer na branch docs/090-release." · etapa de outra delegação; continua no pedido
- "E1.3 (security-engineer): parecer de segurança da release, na branch docs/090-release." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR da docs/090-release para a develop, squash com a CI verde, antes da E1.5; o merge é do dono (K-250)." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR da develop para a homolog, merge commit com o portão verde; o merge é do tech-lead pelo CLAUDE.md (DECISÃO TÉCNICA de 2026-11-11 02:58), ou do dono se o hook recusar (K-250)." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR de release da homolog para a main, aberto; o merge é do dono." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `test -s /home/rodrigoisensee/MetricasDSPD-052c/docs/retrospectivas/2026-11-11-090-release.md` · espera: rc=0
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
