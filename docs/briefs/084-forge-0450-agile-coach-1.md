Agente destino: forge:agile-coach
Pedido: 084-forge-0450
Tipo: codigo
Branch: docs/retros-2026-11-10   Base: develop   Base-sha: 7a44f9417b6be3cb0d87767ea3c19c2c8c7083c2
Etapa: codigo   Cobre: E1.5

## Objetivo
Retrospectiva curta do pedido 084 (Forge do projeto para a 0.45.2; PR 281 mesclado pelo dono). Worktree `/home/rodrigoisensee/MetricasDSPD-052c`, branch `docs/retros-2026-11-10` (já criada sobre a develop 7a44f9417b6be3cb0d87767ea3c19c2c8c7083c2).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/084-forge-0450.md` (inteiro, curto).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/kanban/conferencias.md`: só as linhas do 084.

## Entregar
- "E1.5 (agile-coach): retrospectiva curta, junto com a próxima rodada de retrospectivas." (E1.5)
- (E1) (E1.5) Escrever pela ferramenta Write `/home/rodrigoisensee/MetricasDSPD-052c/docs/retrospectivas/2026-11-10-084-forge-0450.md`, no formato das retrospectivas da pasta: o que correu bem, o que travou (o forge-check do Windows no PATH, a troca de alvo de 0.45.0 para 0.45.2, a trava do plugin na tag), retrabalho medido pelas conferências do 084 e as linhas `MELHORIA:` (uma por linha, com a evidência; o que é do Forge marcado "vai ao Forge"). Sem commit nem push nesta delegação (o envio das retrospectivas vai em outra delegação).
- arquivos: docs/retrospectivas/2026-11-10-084-forge-0450.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 084-forge-0450 até 341194f8d4e32dee62ac9f0578ce9e4ae0ac7d0d5e3b62f3704f518dd393bb89 (4 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/084-forge-0450.md; valem todas, leia-as nas fontes)
- aplicáveis a E1.5 (copiadas literalmente):
- - 2026-11-10: DECISÃO DO DONO (literal): "sim" ao recibo "Mudo o pedido 084 para mirar a 0.45.2?". Alvo passa a 0.45.2; E1 e E1.1 reescritas (a E1.1 é do dono: atualizar o plugin, reiniciar, rodar o forge-upgrade, enviar a branch). A branch forge/upgrade-0.45.0 fica parada e será descartada quando a 0.45.2 entrar.
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum commit nem push.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (dono): atualizar o plugin Forge para 0.45.2, reiniciar a sessão, rodar o `forge-upgrade` e enviar a branch dele." · etapa de outra delegação; continua no pedido
- "E1.2 (tech-lead): review." · etapa de outra delegação; continua no pedido
- "E1.3 (qa-engineer): QA (`pnpm run pronto`)." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR para a develop, depois do QA; o merge é do dono." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `test -s /home/rodrigoisensee/MetricasDSPD-052c/docs/retrospectivas/2026-11-10-084-forge-0450.md` · espera: rc=0
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
