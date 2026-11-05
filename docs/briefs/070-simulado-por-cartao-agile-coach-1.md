Agente destino: forge:agile-coach
Pedido: 070-simulado-por-cartao
Tipo: codigo
Branch: docs/jarvis-2026-10-23   Base: develop   Base-sha: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8
Etapa: codigo   Cobre: E1.14

## Objetivo
Retrospectiva do pedido 070 (dado simulado por cartão com selo Simulado, até a main pela release 071) (pedido 070, E1.14, K-221).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/070-simulado-por-cartao.md` (Histórico inteiro); `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/kanban/conferencias.md` (linhas do 070); `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/kanban/historico.md` (K-221).

## Entregar
- "E1.14 (agile-coach): retrospectiva do pedido 070." (E1.14)
- (E1, E2, E3) (E1.14) retrospectiva do processo do pedido inteiro (os três itens do escopo), sem trabalho novo neles: retrospectiva em `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/retrospectivas/2026-11-05-070-simulado-por-cartao.md`, gravada só com Write ou Edit: o que foi bem, o que custou tempo (hora de cada evento do Histórico, relógio local), rodadas e reprovações de brief e de entrega por classe de causa, e linhas `MELHORIA:` (uma por linha: problema, evidência por data e arquivo, medida do efeito, Forge ou projeto). Avalie pelo menos: as voltas do L3 (fixture fora do Entregar, provas por comando, QA antes do review); o bug 070-001 de contraste achado depois do review; a divergência entre forge-check entrega e forge-check pr no PR 233; as reprovações de conferência por linha "entrega conferida" fora do formato (erro de formato do Jarvis, confirmado em 2026-11-05 16:30); o tempo da validação do protótipo até a main; commit só do arquivo com `git -C /home/rodrigoisensee/Metricas/MetricasDSPD add docs/retrospectivas/2026-11-05-070-simulado-por-cartao.md` e `git -C /home/rodrigoisensee/Metricas/MetricasDSPD commit -m <mensagem> -m 'Cartão: K-221' -- docs/retrospectivas/2026-11-05-070-simulado-por-cartao.md` (sem heredoc e sem pipe), na branch docs/jarvis-2026-10-23, sem push.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "Não consigo deixar os dados reais nas que já são possíveis fazer e nas que não deixar mocado?" e, ao recibo ("vou fazer: painel com dado real só com o real; sem dado real, o simulado com o selo Simulado visível; ADR nova revendo a 0026; não vou fazer: misturar real e simulado no mesmo gráfico, misturar BusinessMap e Acelerato, simulado em métrica individual; a troca é por cartão"), respondeu "Sim": dado simulado por cartão onde ainda não há dado real, com selo visível.
- DECISÃO DO DONO (2026-11-04): "A" (validação do protótipo docs/ux/070-selo-simulado/prototipo.html): protótipo aprovado como está (selo no cabeçalho, faixa com "O que é simulado?", borda tracejada, marca d'água, prefixo "Exemplo:"); ponto de compromisso do 070.
- DECISÃO DO DONO (2026-11-04): "A" (cartão simulado no resumo): o cartão com dado simulado fica fora de "O que pede atenção agora" e da Visão geral; só aparece na própria aba, com o selo; o resumo mostra só dado real.
- DECISÃO DO DONO (2026-11-05): "A" (suposições S1 a S3 do 070, pergunta das 12:28): confirmadas as três: S1 os filtros de equipe, sistema e prioridade não se aplicam ao cartão simulado; S2 a exportação leva só o dado real; S3 as duas tendências do Resumo e o EI_SUST ficam sem simulado; com isso a ADR 0028 pode passar a vigente.
### ADRs citadas no pedido
- ADR 0026 (citada no pedido): revista pela ADR 0028 (simulado por cartão); contexto da retrospectiva
- ADR 0021 (citada no pedido): citada no pedido; nada nesta entrega
### Do Histórico deste pedido, docs/pedidos/070-simulado-por-cartao.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-05 18:02: Retrospectiva do 070 aberta: o 070 está na main pela release 071 (PR 237). DECISÃO TÉCNICA (Jarvis): retrospectiva com o agile-coach, commit na branch do Jarvis (docs/jarvis-2026-10-23), sem push, cobrindo as voltas do L3 (fixture fora do Entregar, provas por comando, QA antes do review), o bug 070-001 (contraste), o PR 233 e o tempo da validação do protótipo até a main.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*`.
- Sem métrica individual: a retrospectiva fala do processo, nunca de pessoa.
- Recusa de hook: pare e relate a mensagem literal, sem contornar. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: outros arquivos (o pedido, o quadro e as conferências inclusive), o `CLAUDE.md`, os arquivos `.env*`, as worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho de como o cartão escolhe real ou simulado (quais métricas estão sem dado real hoje, de onde vem o simulado, contrato da API) e a ADR nova que revê a 0026." · etapa de outra delegação; continua no pedido
- "E1.2 (ux-designer): especificação do selo "Simulado" e do texto de explicação, com protótipo para o dono validar." · etapa de outra delegação; continua no pedido
- "E1.3 (node-backend): implementação na API." · etapa de outra delegação; continua no pedido
- "E1.4 (react-frontend): implementação nos cartões." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): code review." · etapa de outra delegação; continua no pedido
- "E1.6 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface." · etapa de outra delegação; continua no pedido
- "E1.8 (tech-lead): PR para a develop e merge." · etapa de outra delegação; continua no pedido
- "E1.9 (tech-lead): trazer a develop para a branch do 070 e resolver o conflito, sem PR, antes do review, do QA e da revisão de interface da volta 1." · etapa de outra delegação; continua no pedido
- "E1.10 (tech-lead): branch nova a partir da develop com a correção da volta 3 aplicada por cherry-pick, depois do merge do PR 230 sem ela." · etapa de outra delegação; continua no pedido
- "E1.11 (tech-lead): branch docs/070-adr-0028-vigente a partir da develop, na worktree 052d (livre depois do merge do PR 232), enviada ao remoto sem commit novo." · etapa de outra delegação; continua no pedido
- "E1.12 (software-architect): ADR 0028 e desenho do 070 para vigente com as suposições S1 a S3 confirmadas pelo dono e a nota do F6 (+2,33 KB, A2 do review 070-v4), na branch docs/070-adr-0028-vigente." · etapa de outra delegação; continua no pedido
- "E1.13 (tech-lead): review, commit e PR só de documentação da ADR 0028 vigente para a develop, merge por squash com a CI verde." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (cmd): `grep -c '^MELHORIA:' /home/rodrigoisensee/Metricas/MetricasDSPD/docs/retrospectivas/2026-11-05-070-simulado-por-cartao.md` · espera: rc=0
- PQ-2 (sha): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD log -1 --format=%H -- docs/retrospectivas/2026-11-05-070-simulado-por-cartao.md` · espera: linhas=1

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
