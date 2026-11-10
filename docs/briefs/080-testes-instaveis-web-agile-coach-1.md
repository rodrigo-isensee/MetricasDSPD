Agente destino: forge:agile-coach
Pedido: 080-testes-instaveis-web
Tipo: codigo
Branch: docs/retros-2026-11-07   Base: develop   Base-sha: f412e3dd30aa69adf9ab0722ef2259e21a5169f8
Etapa: codigo   Cobre: E1.6

## Objetivo
Retrospectiva do pedido 080 (K-192 e K-173: E2E L3-01 instável por axe com a página ainda mudando de altura; teste do O20), mesclado na develop pelo dono às 11:59 de 2026-11-07 (PR 265). Na branch `docs/retros-2026-11-07` (worktree `/home/rodrigoisensee/MetricasDSPD-052e`), que já tem a retrospectiva do 081; não na branch do Jarvis.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/080-testes-instaveis-web.md` (inteiro).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/kanban/conferencias.md`: só as linhas do 080.

## Entregar
- "E1.6 (agile-coach): retrospectiva do pedido 080." (E1.6)
- (E1, E2) (E1.6) Conferir `git -C /home/rodrigoisensee/MetricasDSPD-052e rev-parse --abbrev-ref HEAD` = docs/retros-2026-11-07 e `git -C /home/rodrigoisensee/MetricasDSPD-052e status --short` vazio. Escrever pela ferramenta Write `/home/rodrigoisensee/MetricasDSPD-052e/docs/retrospectivas/2026-11-07-080-testes-instaveis-web.md`: o que correu bem, o que travou (o gap-y-1 que não agia na causa e a volta 2; o QA travado por 600 s e redisparado; os timeouts sob carga 16 em 8 núcleos; o parecer com atribuição falsa ao brief), retrabalho medido pelas conferências do 080, e as linhas `MELHORIA:` (uma por linha, com o problema observado, a evidência e como medir o efeito), dizendo em cada uma se vai ao Forge ou fica no projeto; commit só desse arquivo com `Cartão: K-192` (mensagem gravada por Write em `/tmp/claude-1000/-home-rodrigoisensee-Metricas-MetricasDSPD/73d03d2b-ba9f-4d84-b635-cabe917583a2/scratchpad/msg-ac-080.txt` e `git -C /home/rodrigoisensee/MetricasDSPD-052e commit -F` com esse caminho literal, `git -C /home/rodrigoisensee/MetricasDSPD-052e add` explícito pelo caminho); sem push.

## Decisões e restrições
- O pedido não tem linha `DECISÃO DO DONO`; foi aberto pela autonomia de melhoria técnica do projeto (Histórico, 07:38).
- (081) 2026-11-07 11:46: Retrospectiva (agile-coach-1): não cumprida; o hook R-REVIEW recusou o commit na branch do Jarvis ("sem parecer para o pedido 073 (e mais 1)"), porque docs/jarvis-2026-10-23 está muito atrás da develop (base ae009a75, 1521 arquivos de diferença) e o hook lê os pedidos do diff. DECISÃO TÉCNICA (Jarvis): as retrospectivas de hoje saem numa branch própria a partir da develop (docs/retros-2026-11-07, worktree 052e, que está livre), com PR de documentação pelo tech-lead depois; brief agile-coach-2.
- O agente não abre, lê nem edita arquivos `.env*`.
- Sem métrica individual: a retrospectiva fala do processo, nunca de pessoa.
- Recusa de hook: pare e relate a mensagem literal, sem contornar. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: outros arquivos (o pedido, o quadro e as conferências inclusive), o `CLAUDE.md`, os arquivos `.env*`, as outras worktrees, a branch `docs/jarvis-2026-10-23`, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (react-frontend): implementação de E1 e E2 num lote só (mesmo papel, arquivos de teste da web e o alvo de toque)." · etapa de outra delegação; feita
- "E1.2 (tech-lead): review." · etapa de outra delegação; feita
- "E1.3 (qa-engineer): QA." · etapa de outra delegação; feita
- "E1.4 (ux-designer): revisão de interface, só se o alvo de toque mudar a tela." · etapa de outra delegação; deixou de se aplicar (DECISÃO TÉCNICA de 10:11)
- "E1.5 (tech-lead): PR para a develop, depois do QA." · etapa de outra delegação; feita

## Pronto quando
- PQ-1 (cmd): `grep -c '^MELHORIA:' /home/rodrigoisensee/MetricasDSPD-052e/docs/retrospectivas/2026-11-07-080-testes-instaveis-web.md` · espera: rc=0
- PQ-2 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-052e log -1 --format=%H -- docs/retrospectivas/2026-11-07-080-testes-instaveis-web.md` · espera: linhas=1

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
