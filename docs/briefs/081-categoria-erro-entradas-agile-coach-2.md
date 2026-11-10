Agente destino: forge:agile-coach
Pedido: 081-categoria-erro-entradas
Tipo: codigo
Branch: docs/retros-2026-11-07   Base: develop   Base-sha: f412e3dd30aa69adf9ab0722ef2259e21a5169f8
Etapa: codigo   Cobre: E1.6

## Objetivo
Retrospectiva do pedido 081 (K-241: as entradas de referência dizem a categoria do erro, sem expor valor), mesclado na develop pelo dono às 11:35 de 2026-11-07 (PR 264). Pela DECISÃO TÉCNICA de 2026-11-07 11:46 deste pedido, ela sai numa branch nova `docs/retros-2026-11-07` a partir da develop, na worktree `/home/rodrigoisensee/MetricasDSPD-052e` (livre, HEAD destacado), e não na branch do Jarvis.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/081-categoria-erro-entradas.md` (inteiro, curto).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/kanban/conferencias.md`: só as linhas do 081.
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/073-melhorias-tecnicas-2026-11-05.md`: só as linhas do `## Histórico` de 2026-11-07 com "PR 258" ou "sandbox" (o mesmo bloqueio do gh pr merge).

## Entregar
- "E1.6 (agile-coach): retrospectiva do pedido 081." (E1.6)
- (E1) (E1.6) Preparar a worktree: `git -C /home/rodrigoisensee/MetricasDSPD-052e status --short` vazio, `git -C /home/rodrigoisensee/MetricasDSPD-052e fetch origin develop`, `git -C /home/rodrigoisensee/MetricasDSPD-052e switch -c docs/retros-2026-11-07 f412e3dd30aa69adf9ab0722ef2259e21a5169f8`. Escrever pela ferramenta Write `/home/rodrigoisensee/MetricasDSPD-052e/docs/retrospectivas/2026-11-07-081-categoria-erro-entradas.md`: o que correu bem, o que travou (o gh pr merge barrado pelo sandbox no GraphQL às 09:28, a série de merges que deixa os outros PRs BEHIND e o update-branch com o dono, e o hook R-REVIEW que barrou o commit desta retrospectiva na branch do Jarvis), retrabalho medido pelas conferências do 081, e as linhas `MELHORIA:` (uma por linha, com o problema observado, a evidência e como medir o efeito), dizendo em cada uma se vai ao Forge ou fica no projeto; commit só desse arquivo com `Cartão: K-241` (mensagem gravada por Write em `/tmp/claude-1000/-home-rodrigoisensee-Metricas-MetricasDSPD/73d03d2b-ba9f-4d84-b635-cabe917583a2/scratchpad/msg-ac-081.txt` e `git -C /home/rodrigoisensee/MetricasDSPD-052e commit -F` com esse caminho literal, `git -C /home/rodrigoisensee/MetricasDSPD-052e add` explícito pelo caminho); sem push.

## Decisões e restrições
- O pedido não tem linha `DECISÃO DO DONO`; foi aberto pela autonomia de melhoria técnica do projeto (Histórico, 08:04).
- 2026-11-07 11:46: Retrospectiva (agile-coach-1): não cumprida; o hook R-REVIEW recusou o commit na branch do Jarvis ("sem parecer para o pedido 073 (e mais 1)"), porque docs/jarvis-2026-10-23 está muito atrás da develop (base ae009a75, 1521 arquivos de diferença) e o hook lê os pedidos do diff. DECISÃO TÉCNICA (Jarvis): as retrospectivas de hoje saem numa branch própria a partir da develop (docs/retros-2026-11-07, worktree 052e, que está livre), com PR de documentação pelo tech-lead depois; brief agile-coach-2.
- O agente não abre, lê nem edita arquivos `.env*`.
- Sem métrica individual: a retrospectiva fala do processo, nunca de pessoa.
- Recusa de hook: pare e relate a mensagem literal, sem contornar. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: outros arquivos (o pedido, o quadro e as conferências inclusive), o `CLAUDE.md`, os arquivos `.env*`, as outras worktrees, a branch `docs/jarvis-2026-10-23`, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (node-backend): implementação com testes, numa função única de classificação usada pelas entradas de referência." · etapa de outra delegação; feita
- "E1.2 (tech-lead): review." · etapa de outra delegação; feita
- "E1.3 (security-engineer): parecer de segurança (mensagem de erro e log de entrada que lida com segredo)." · etapa de outra delegação; feita
- "E1.4 (qa-engineer): QA." · etapa de outra delegação; feita
- "E1.5 (tech-lead): PR para a develop, depois do QA." · etapa de outra delegação; feita

## Pronto quando
- PQ-1 (cmd): `grep -c '^MELHORIA:' /home/rodrigoisensee/MetricasDSPD-052e/docs/retrospectivas/2026-11-07-081-categoria-erro-entradas.md` · espera: rc=0
- PQ-2 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-052e log -1 --format=%H -- docs/retrospectivas/2026-11-07-081-categoria-erro-entradas.md` · espera: linhas=1

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
