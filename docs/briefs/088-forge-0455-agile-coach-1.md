Agente destino: forge:agile-coach
Pedido: 088-forge-0455
Tipo: codigo
Branch: docs/retros-2026-11-11   Base: develop   Base-sha: 61c30b1ea25982fcfa84f16466f79448cc46296a
Etapa: codigo   Cobre: E1.6

## Objetivo
Retrospectiva curta do pedido 088 (Forge 0.45.5 no projeto, PR 296, e a correção do K-261, PR 297, os dois na develop). Worktree `/home/rodrigoisensee/MetricasDSPD-052c`, branch `docs/retros-2026-11-11` (já tem, sem commit, a retrospectiva do 089, que não deve ser tocada).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/088-forge-0455.md` (inteiro).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/kanban/conferencias.md`: só as linhas do 088.

## Entregar
- "E1.6 (agile-coach): retrospectiva curta." (E1.6)
- (E1.6) Escrever pela ferramenta Write `/home/rodrigoisensee/MetricasDSPD-052c/docs/retrospectivas/2026-11-11-088-forge-0455.md` (novo), no formato das retrospectivas da pasta: o que correu bem, o que travou (upgrade a partir de develop local desatualizada; o PR pelo dono; o `pnpm run pronto` do K-261 caindo por carga com duas suítes na mesma hora, com o `ERRO-JARVIS` do Histórico como dado; merge preso no pedido de permissão com o PR atrás da develop), retrabalho medido pelas conferências do 088, lead time pelo Histórico e as linhas `MELHORIA:` (uma por linha, com a evidência; o que é do Forge marcado "vai ao Forge"; o que já tem cartão fica só como dado). Sem commit nem push nesta delegação.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 088-forge-0455 até 80faea8e93bd74c8642a8b15c879cde3e9d6be9fb4fd0c141a199c072007273d (2 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/088-forge-0455.md; valem todas, leia-as nas fontes)
- aplicáveis a E1.6 (copiadas literalmente):
- - 2026-11-10 23:29: DECISÃO DO DONO (literal): "feito". PR 296 (Forge 0.45.5) mesclado na develop pelo dono (2026-11-11 02:28 UTC). Falta: K-261 (E1.7 a E1.10) e a retrospectiva (E1.6).
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum commit nem push.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (dono): trocar o ref do marketplace do Forge de v0.45.2 para v0.45.5, atualizar o plugin e reiniciar a sessão." · etapa de outra delegação; continua no pedido
- "E1.2 (Jarvis, por ordem do dono, como no 084): `forge-upgrade` numa worktree limpa a partir da develop e envio da branch." · etapa de outra delegação; continua no pedido
- "E1.3 (tech-lead): review." · etapa de outra delegação; continua no pedido
- "E1.4 (qa-engineer): QA (`pnpm run pronto`)." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR para a develop, depois do QA; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.7 (node-backend): correção do BUG-088-QA1 (K-261): o teste `server/tests/ref-sync-apontamento-entrada.test.ts` do caso sem configuração fica hermético (não depende do .env da máquina), na branch fix/k261-teste-hermetico a partir da develop, worktree /home/rodrigoisensee/MetricasDSPD-056." · etapa de outra delegação; continua no pedido
- "E1.8 (tech-lead): review do K-261." · etapa de outra delegação; continua no pedido
- "E1.9 (qa-engineer): QA do K-261." · etapa de outra delegação; continua no pedido
- "E1.10 (tech-lead): PR do K-261 para a develop, depois do QA." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `test -s /home/rodrigoisensee/MetricasDSPD-052c/docs/retrospectivas/2026-11-11-088-forge-0455.md` · espera: rc=0
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
