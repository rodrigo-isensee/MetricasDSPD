Agente destino: forge:software-architect
Pedido: 075-bloqueios-reais
Tipo: codigo
Branch: docs/jarvis-2026-10-23   Base: develop   Base-sha: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8
Etapa: codigo   Cobre: E3.1

## Objetivo
Plano técnico com lotes dos bloqueios reais (K-204), pelo desenho validado e pelas decisões do dono de 11:11, cobrindo a coleta e a projeção (E1), os controles do modelo de ameaças (E2) e O19, T10 e T12 no mapa real (E4) (pedido 075, E3.1). Leitura na develop em `/home/rodrigoisensee/MetricasDSPD-056d` (f21220fe).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/075-desenho.md` e `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/security/075-modelo-ameacas.md` (controles e casos de abuso CA-075-1 a 14).
- Na 056d, só os trechos que o plano exige (O19, T10 e T12: procure em `server/src/modulos/metricas/servico.ts`, `schemas.ts` e na biblioteca de métricas em `packages/`).

## Entregar
- "E3.1 (software-architect): plano técnico com lotes depois da validação, cobrindo E1, E2 e E4, com as decisões do dono de 11:11." (E3.1)
- (E3) (E3.1) Escrever `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/075-plano.md` pela ferramenta Write, sem commit, com uma seção `## Lote <n>` por lote: lotes pequenos em ordem (cada um com arquivos, contrato, migração se houver, testes, versão de critério T2.6, gatilho de segurança e a CI do push como prova), quem faz cada lote (node-backend, react-frontend), o que o UX especifica (motivo "não classificado" e marca de histórico parcial) e o teto de linhas por lote.
- (E1, E2, E4) (E3.1) Cada decisão do dono de 11:11 e cada controle do modelo de ameaças aparece em algum lote; O19, T10 e T12 com o que falta para entrarem no mapa real.
- (E5) Nada a entregar aqui: não nesta delegação.

## Decisões e restrições
### Dos pedidos de que este depende (064, 065), literais
- (064) DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: o "sem mudar código" vale para este levantamento; as correções viram pedidos próprios, como o 065, decidido pelo dono na "C".]
- (064) 2026-11-04 08:04: DECISÃO DO DONO "C" (bloqueados no mapa real): A agora (tirar a tela de bloqueados do mapa real, Sem dado real até a coleta gravar bloqueios) e B depois (coleta grava bloqueios) como cartão. DECISÃO TÉCNICA (Jarvis): A vira o pedido 065 (modo implementar; este pedido segue em analisar); B vira o cartão K-204.
- (064) 2026-11-04 14:11: DECISÃO DO DONO "B" (S8): contar só os incidentes com resposta; abaixo de 20 não publica. DECISÃO TÉCNICA (Jarvis): vira o pedido 066 (implementar).
- (064) 2026-11-04 14:13: DECISÃO DO DONO "Atipico acima de 10 horas" (L6): o dia atípico passa a acima de 10 h. DECISÃO TÉCNICA (Jarvis): vira o pedido 067 (implementar); os outros limites seguem provisórios até o dono dizer o contrário (suposição no recibo).
- (065) DECISÃO DO DONO (2026-11-04): "C" (bloqueados no mapa real, pedido 064): fazer A agora (tirar a tela de bloqueados do mapa real; ela mostra "Sem dado real" até a coleta gravar bloqueios) e B depois (corrigir a coleta para gravar os bloqueios), como cartão.
- (065) DECISÃO DO DONO (2026-11-04): "isso" (recibo do 065): tirar BLOQUEADOS do mapa real e mostrar "Sem dado real" também nas partes do O1 (bloqueados), do O2 (motivo do bloqueio) e do O5 (horas bloqueadas), em vez de zero; a coleta gravar bloqueios fica no K-204.
- (065) DECISÃO DO DONO (2026-11-04): "B" (Q-065-1, percentual de eficiência do O5): o O5 inteiro mostra "Sem dado real" até a coleta gravar bloqueios (K-204), em vez de publicar o percentual com ressalva.
- Nota do Jarvis: as decisões do 064 sobre S8 e dia atípico não tocam esta entrega; as do 065 que tiram BLOQUEADOS e o O5 do mapa real valem "até a coleta gravar bloqueios" (parte B da decisão "C"); este pedido é essa parte B, e a P-075-6 ("A") diz como eles voltam.
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
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/075-plano.md` · o plano existe
- PQ-2 (cmd): `grep -c "^## Lote" /home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/075-plano.md` · espera: linhas>=1

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
