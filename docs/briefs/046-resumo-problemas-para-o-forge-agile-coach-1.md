Agente destino: forge:agile-coach
Pedido: 046-resumo-problemas-para-o-forge
Tipo: codigo
Branch: docs/jarvis-2026-10-23   Base: develop   Base-sha: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8
Etapa: codigo

## Objetivo
Etapa E1.1 do pedido 046 (cartão K-171): o dono quer "um resumo de todos os problemas que tivemos para passar pro Jarvis que desenvolve a forge para colocar melhorias". Escreva esse resumo num documento único, pronto para colar na sessão do Jarvis do Forge. Trabalhe no clone principal `/home/rodrigoisensee/MetricasDSPD`, sem commit.

## Ler
- As linhas `MELHORIA:` de `docs/retrospectivas/*.md` (busque por `MELHORIA:`; não leia as retros inteiras).
- No `KANBAN.md`, só as linhas de cartão com `[forge]` e as dos cartões K-147, K-156 a K-159, K-164 a K-168 e K-170.
- `docs/kanban/conferencias.md` (reprovações e notas `tardio`) e `docs/kanban/escapes.md`.
- No `## Histórico` de `docs/pedidos/*.md`, só as linhas com `MELHORIA` (busque, não leia os pedidos inteiros).
- `docs/kanban/prompt-jarvis-forge-2026-10-21.md` (F1 a F20, já levados ao Forge), para marcar o que já foi enviado.

## Entregar
- (E1.1, E1) O documento `docs/retrospectivas/2026-10-28-problemas-para-o-forge.md`, com todos os problemas de processo e de ferramenta do Forge vividos neste projeto; cada um com a evidência (pedido, cartão, PR ou retro), o custo observado (rodadas, horas ou tokens, com a marca `medido` ou `estimado`) e a melhoria proposta.
- (E1.1, E2) Fontes: as listadas em Ler; problema do produto (métricas, regras de negócio) fica fora.
- (E1.1, E3) Agrupado por tema (hooks e conferência, brief e conferente, autoria de parecer, suíte e teto de recursos, fluxo de merge e PR), com o que já tem cartão, PR no Forge ou item F1 a F20 marcado, e problemas repetidos fundidos num só, com todas as evidências. No topo, um parágrafo de contexto para o Jarvis do Forge e a lista dos 5 problemas de maior custo.

## Fora do escopo
- "E1.2 (forge:tech-lead): commit do documento numa branch de docs e PR para a develop, depois do review e do QA de documentação." · etapa de outra delegação; continua no pedido
- Abrir PR no Forge ou editar `~/Forge` e o cache do plugin; commit; editar outros arquivos, o quadro e os pedidos; ler ou editar o `.env`.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-28): recibo do 046 aceito ("Isso").
- Sem nome, e-mail nem dado de pessoa no documento; o papel do agente, sim.

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD/docs/retrospectivas/2026-10-28-problemas-para-o-forge.md`
- PQ-2 (cmd): `grep -c '^## ' /home/rodrigoisensee/MetricasDSPD/docs/retrospectivas/2026-10-28-problemas-para-o-forge.md` · espera: rc=0

## Relatório
Até 8 linhas, resultado real: quantos problemas, por tema, e os 5 de maior custo; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
