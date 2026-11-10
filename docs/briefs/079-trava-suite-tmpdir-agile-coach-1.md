Agente destino: forge:agile-coach
Pedido: 079-trava-suite-tmpdir
Tipo: codigo
Branch: docs/retros-2026-11-07   Base: develop   Base-sha: f412e3dd30aa69adf9ab0722ef2259e21a5169f8
Etapa: codigo   Cobre: E1.5

## Objetivo
Retrospectiva do pedido 079 (K-201: a trava da suíte única sai do /tmp fixo para o sandbox dos agentes rodar o pronto), mesclado na develop pelo dono às 11:59 de 2026-11-07 (PR 263). Na branch `docs/retros-2026-11-07` (worktree `/home/rodrigoisensee/MetricasDSPD-052e`), que já tem as retrospectivas do 081 e do 080; não na branch do Jarvis.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/079-trava-suite-tmpdir.md` (inteiro).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/kanban/conferencias.md`: só as linhas do 079.

## Entregar
- "E1.5 (agile-coach): retrospectiva do pedido 079." (E1.5)
- (E1) (E1.5) Conferir `git -C /home/rodrigoisensee/MetricasDSPD-052e rev-parse --abbrev-ref HEAD` = docs/retros-2026-11-07 e `git -C /home/rodrigoisensee/MetricasDSPD-052e status --short` vazio. Escrever pela ferramenta Write `/home/rodrigoisensee/MetricasDSPD-052e/docs/retrospectivas/2026-11-07-079-trava-suite-tmpdir.md`: o que correu bem, o que travou (o PR 263 BEHIND várias vezes pela série de merges e o update-branch com o dono), retrabalho medido pelas conferências do 079, e as linhas `MELHORIA:` (uma por linha, com o problema observado, a evidência e como medir o efeito), dizendo em cada uma se vai ao Forge ou fica no projeto, sem repetir as do 081 e do 080 já na branch (cite-as se o 079 reforçar); commit só desse arquivo com `Cartão: K-201` (mensagem gravada por Write em `/tmp/claude-1000/-home-rodrigoisensee-Metricas-MetricasDSPD/73d03d2b-ba9f-4d84-b635-cabe917583a2/scratchpad/msg-ac-079.txt` e `git -C /home/rodrigoisensee/MetricasDSPD-052e commit -F` com esse caminho literal, `git -C /home/rodrigoisensee/MetricasDSPD-052e add` explícito pelo caminho); sem push.

## Decisões e restrições
- O pedido não tem linha `DECISÃO DO DONO`; foi aberto pela autonomia de melhoria técnica do projeto (Histórico, 06:28).
- (081) 2026-11-07 11:46: Retrospectiva (agile-coach-1): não cumprida; o hook R-REVIEW recusou o commit na branch do Jarvis ("sem parecer para o pedido 073 (e mais 1)"), porque docs/jarvis-2026-10-23 está muito atrás da develop (base ae009a75, 1521 arquivos de diferença) e o hook lê os pedidos do diff. DECISÃO TÉCNICA (Jarvis): as retrospectivas de hoje saem numa branch própria a partir da develop (docs/retros-2026-11-07, worktree 052e, que está livre), com PR de documentação pelo tech-lead depois; brief agile-coach-2.
- O agente não abre, lê nem edita arquivos `.env*`.
- Sem métrica individual: a retrospectiva fala do processo, nunca de pessoa.
- Recusa de hook: pare e relate a mensagem literal, sem contornar. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: outros arquivos (o pedido, o quadro e as conferências inclusive), o `CLAUDE.md`, os arquivos `.env*`, as outras worktrees, a branch `docs/jarvis-2026-10-23`, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (devops-engineer): implementação em `scripts/suite-unica.sh` e no teste do script, com parecer de devops em docs/devops/." · etapa de outra delegação; feita
- "E1.2 (tech-lead): review." · etapa de outra delegação; feita
- "E1.3 (qa-engineer): QA." · etapa de outra delegação; feita
- "E1.4 (tech-lead): PR para a develop, depois do QA." · etapa de outra delegação; feita

## Pronto quando
- PQ-1 (cmd): `grep -c '^MELHORIA:' /home/rodrigoisensee/MetricasDSPD-052e/docs/retrospectivas/2026-11-07-079-trava-suite-tmpdir.md` · espera: rc=0
- PQ-2 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-052e log -1 --format=%H -- docs/retrospectivas/2026-11-07-079-trava-suite-tmpdir.md` · espera: linhas=1

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
