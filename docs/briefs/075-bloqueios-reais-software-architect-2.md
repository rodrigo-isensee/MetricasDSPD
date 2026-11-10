Agente destino: forge:software-architect
Pedido: 075-bloqueios-reais
Tipo: codigo
Branch: docs/jarvis-2026-10-23   Base: develop   Base-sha: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8
Etapa: codigo   Cobre: E3.1

## Objetivo
Plano técnico com lotes dos bloqueios reais (K-204), pelo desenho validado e pelas decisões do dono de 11:11, cobrindo a coleta e a projeção (E1), os controles do modelo de ameaças (E2) e O19, T10 e T12 no mapa real (E4) (pedido 075, E3.1). Leitura na develop em `/home/rodrigoisensee/MetricasDSPD-056d` (f21220fe).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/075-desenho.md` e `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/security/075-modelo-ameacas.md` (controles e casos de abuso CA-075-1 a 14).
- Na 056d, só os trechos que o plano exige (O19, T10 e T12: procure em `server/src/modulos/metricas/origem.ts` e na biblioteca de métricas).

## Entregar
- "E3.1 (software-architect): plano técnico com lotes depois da validação, cobrindo E1, E2 e E4, com as decisões do dono de 11:11." (E3.1)
- (E3) (E3.1) Escrever `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/075-plano.md` pela ferramenta Write, sem commit: lotes pequenos em ordem (cada um com arquivos, contrato, migração se houver, testes, versão de critério T2.6, gatilho de segurança e a CI do push como prova), quem faz cada lote (node-backend, react-frontend), o que o UX especifica (motivo "não classificado" e marca de histórico parcial) e o teto de linhas por lote.
- (E1, E2, E4) (E3.1) Cada decisão do dono de 11:11 e cada controle do modelo de ameaças aparece em algum lote; O19, T10 e T12 com o que falta para entrarem no mapa real.
- (E5) Nada a entregar aqui: não nesta delegação.

## Decisões e restrições
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-075-1): a via A: o bloqueio vem da comparação entre coletas do que já chega ao stg_card (is_blocked, block_reason_id, current_block_time), sem dado novo da fonte; perde bloqueio curto e o passado anterior à primeira coleta.
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-075-2): início e fim do bloqueio = instante da coleta que viu a mudança.
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-075-3): motivo sem mapa para os 7 do briefing aparece como "não classificado" na tela (o mapa dos motivos fica para quando as pessoas o definirem). DECISÃO DO DONO: "A" (P-075-3b): trocar de motivo sem desbloquear é o mesmo bloqueio.
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-075-4): o fornecedor do bloqueio é o do card no início do bloqueio.
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-075-5): card arquivado, descartado ou entregue ainda bloqueado: o bloqueio fecha nesse instante.
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-075-6): O5 e a série do O1 voltam já com o histórico parcial, marcados nos gráficos (T2.6), respeitando o mínimo de 20 itens.
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-075-7): a coleta do BusinessMap passa a ter agenda diária (depois da VM).
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-075-8): O19, T10 e T12 entram no mapa real neste pedido.
- ADR 0020 (citada no pedido): a revisão 5 dela é a condição da via B (histórico block_times), que o dono não escolheu; nada nesta entrega além de citá-la como limite.
- ADR 0022 (citada no pedido): o item 3 nega o stg_bloqueio por padrão; a via A não o usa.
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real.
- NÃO tocar: outros arquivos (ADRs, código, testes, `CLAUDE.md`), as worktrees (só leitura na 056d), a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho em docs/analises/075-desenho.md, só leitura, sem commit; regra de negócio vira pergunta ao dono." · etapa de outra delegação; continua no pedido
- "E1.2 (security-engineer): modelo de ameaças em docs/security/075-modelo-ameacas.md, só leitura, sem commit." · etapa de outra delegação; continua no pedido
- "E1.3 (dono): validar o desenho e responder as perguntas." · etapa de outra delegação; continua no pedido
- "E3.2 (ux-designer): especificação curta do motivo "não classificado" e da marca de histórico parcial na tela de bloqueados e no O5, em docs/ux/, sem commit." · etapa de outra delegação; continua no pedido
- "E5.1 (devops-engineer): agenda diária da coleta do BusinessMap, depois da migração para a VM." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/075-plano.md` · o plano existe com os lotes em ordem

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
