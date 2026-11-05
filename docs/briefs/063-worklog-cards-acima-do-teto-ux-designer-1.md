Agente destino: forge:ux-designer
Pedido: 063-worklog-cards-acima-do-teto
Tipo: codigo
Branch: docs/063-worklog-teto   Base: develop   Base-sha: c6a75a03245d6672c18c7c689df6e58ae930b51f
Etapa: codigo   Cobre: E1.2

## Objetivo
Texto e lugar do aviso de registro de horas incompleto na aba do apontamento (pedido 063, E1.2, K-200). Worktree `/home/rodrigoisensee/MetricasDSPD-052d`.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052d/docs/ux/059-aba-apontamento.md` e `/home/rodrigoisensee/MetricasDSPD-052d/docs/ux/059-aba-apontamento-textos.md`; `/home/rodrigoisensee/MetricasDSPD-052d/web/src/features/apontamento/ApontamentoPage.tsx`.

## Entregar
- "E1.2 (ux-designer): texto e lugar do aviso de incompleto na aba do apontamento, que some quando a coleta por período completar o card, em paralelo à E1.1." (E1.2)
- (E1.2) Especificação em `/home/rodrigoisensee/MetricasDSPD-052d/docs/ux/063-aviso-registro-incompleto.md`: onde o aviso aparece (no card e, se fizer sentido, um resumo na aba), o texto em linguagem simples (sem jargão técnico, sem número estimado), o comportamento em tela estreita e a acessibilidade (o aviso não depende só de cor); sem ranking nem destaque por pessoa; o aviso some quando a coleta por período completar o card.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-03): "Isso" (recibo do 063): o software-architect faz o discovery (API do BusinessMap aceita consultar um card por faixa de datas, só GET; como a coleta marca o card no teto; plano e revisão da ADR 0025 se precisar) e o ux-designer define o texto e o lugar do aviso de registro de horas incompleto, em paralelo; o dono valida antes de qualquer código; não estimar horas, não escrever no BusinessMap, nenhuma métrica por pessoa.
- DECISÃO DO DONO (2026-11-03): "B" (os 5 cards com registro de horas incompleto): pedido novo para buscar o restante; o arquiteto avalia se a API deixa consultar um único card por faixa de datas e, se deixar, a coleta divide por período até caber nas 1000; enquanto isso, entra o aviso de registro de horas incompleto nesses cards.
- ADR 0025 (citada no pedido): decide a coleta do worklog: só /loggedTime, divisão de lote no teto de 1000, card sozinho acima do teto fica incompleto; pode ser revista pelo arquiteto nesta etapa
- 2026-11-03 07:02: recibo confirmado pelo dono: "Isso". Cartão K-200. DECISÃO TÉCNICA (Jarvis): discovery na worktree /home/rodrigoisensee/MetricasDSPD-052d (branch das guardas já mesclada, limpa), arquivos sem commit; o commit e o PR de documentação ficam na E1.4.
- O agente não abre nem lê arquivos `.env*`; não chama a API do BusinessMap (a verificação é pela documentação pública e pelo código já existente); nada é escrito no BusinessMap.
- Arquivos gravados pela ferramenta Write na worktree, sem commit (o commit é a E1.4 do tech-lead).
- Regras invioláveis do CLAUDE.md: nenhuma métrica pode servir para avaliação individual; dúvida de regra de negócio não se resolve por inferência (vira pergunta ao dono); carga incremental nunca sobrescreve histórico.
- NÃO tocar: código, testes, as especificações do 059, o `CLAUDE.md`, os arquivos `.env*`, as outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): discovery: como a coleta marca o card que parou no teto e como a API mostra isso; se a API do BusinessMap aceita consultar um card por faixa de datas (só leitura, só GET); plano do aviso e da coleta por período, com revisão da ADR 0025 se precisar." · etapa de outra delegação; continua no pedido
- "E1.3 (dono): validar o plano e o aviso." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): branch docs/063-worklog-teto a partir da develop, commit e PR só de documentação do discovery (plano do arquiteto e especificação do aviso) para a develop." · etapa de outra delegação; continua no pedido
- "E2.1 (node-backend): coleta do registro de horas por período até caber no teto, se a E1.1 confirmar o filtro por card e data e o dono validar o plano (E1.3); com review, segurança e QA em etapas próprias, abertas depois do plano." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (arquivo): `/home/rodrigoisensee/MetricasDSPD-052d/docs/ux/063-aviso-registro-incompleto.md` existe e descreve lugar, texto, tela estreita e acessibilidade do aviso

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).