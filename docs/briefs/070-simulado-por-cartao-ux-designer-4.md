Agente destino: forge:ux-designer
Pedido: 070-simulado-por-cartao
Tipo: codigo
Branch: feature/070-simulado-por-cartao   Base: develop   Base-sha: 97ec7af9055f247297ecdedda910cbac54562d72
Etapa: review   Cobre: E1.7

## Objetivo
Revisão de interface da volta 2 do 070 (A-9, A-10 e A-11) na ponta e8c148ba97d99eaf2cac3eb5e5557bc302d481c1, contra a especificação e o protótipo validados pelo dono (pedido 070, E1.7, K-221). Worktree `/home/rodrigoisensee/MetricasDSPD-052f`, branch `feature/070-simulado-por-cartao`.

## Ler
- Com a ferramenta Read, em `/home/rodrigoisensee/MetricasDSPD-052f/web/src` (a worktree está na ponta e8c148b): `components/ui/SeloSimulado.tsx`, `features/tatico/components/CartaoT3.tsx` e `styles/tokens.css`, e a revisão anterior `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/ux/070-selo-simulado/revisao-v1.md`; o desenho `/home/rodrigoisensee/MetricasDSPD-052f/docs/analises/070-desenho.md` (R1 a R7, T-W1 a T-W8) , a especificação `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/ux/070-selo-simulado/especificacao.md` e o protótipo `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/ux/070-selo-simulado/prototipo.html`.

## Entregar
- "E1.7 (ux-designer): revisão de interface." (E1.7)
- (E1, E2, E3) (E1.7) ler o código da tela listado em Ler, só leitura e sem escrever na worktree, e conferir que A-9, A-10 e A-11 da revisão anterior foram resolvidos conforme a especificação e o protótipo validados, sem mudar o que já estava conforme; parecer em `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/ux/070-selo-simulado/revisao-v2.md` pela ferramenta Write, com `pedido: 070-simulado-por-cartao`, `branch: feature/070-simulado-por-cartao`, `commit: e8c148ba97d99eaf2cac3eb5e5557bc302d481c1`, veredito e bloco `## Achados` (até 300 caracteres por achado, severidade só entre parênteses, regra citada só pelo ID); sem commit (o Jarvis commita); nada escrito na branch nem na worktree do 070.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "Não consigo deixar os dados reais nas que já são possíveis fazer e nas que não deixar mocado?" e, ao recibo ("vou fazer: painel com dado real só com o real; sem dado real, o simulado com o selo Simulado visível; ADR nova revendo a 0026; não vou fazer: misturar real e simulado no mesmo gráfico, misturar BusinessMap e Acelerato, simulado em métrica individual; a troca é por cartão"), respondeu "Sim": dado simulado por cartão onde ainda não há dado real, com selo visível.
- DECISÃO DO DONO (2026-11-04): "A" (validação do protótipo docs/ux/070-selo-simulado/prototipo.html): protótipo aprovado como está (selo no cabeçalho, faixa com "O que é simulado?", borda tracejada, marca d'água, prefixo "Exemplo:"); ponto de compromisso do 070.
- DECISÃO DO DONO (2026-11-04): "A" (cartão simulado no resumo): o cartão com dado simulado fica fora de "O que pede atenção agora" e da Visão geral; só aparece na própria aba, com o selo; o resumo mostra só dado real.
### ADRs citadas no Histórico deste pedido (não no registro 064)
- ADR 0026 (citada no pedido): revista pela 0028
- ADR 0028 (citada no pedido): a decisão que este lote implementa
- ADR 0021 (citada no pedido): o simulado roda no Web Worker dela, só no navegador; nada muda nela
### Do Histórico deste pedido, docs/pedidos/070-simulado-por-cartao.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-05 01:27: Volta 2 entregue: o react-frontend corrigiu A-9 (SeloDesvio do T3 some no cartão simulado, com teste que falhou antes), A-10 (classe .alvo-44 sem mudar a .alvo), A-11 (marca d'água em contêiner overflow-hidden), A1 do review (o mock e a hora de corte só no chunk sob demanda) e A2 do review (teste com as constantes de origem.ts) em e8c148ba97d99eaf2cac3eb5e5557bc302d481c1; web 1469 testes com cobertura 100%, tsc, eslint, prettier e docs:check verdes; load chegou a 5,18 nas suítes. DECISÃO TÉCNICA (Jarvis): review, QA e revisão de interface do delta c193313..e8c148b, pareceres no nome 070-v2 (o de interface em docs/ux/070-selo-simulado/revisao-v2.md, fora da branch); QA com no máximo 2 workers e o load conferido antes de cada suíte; depois o PR do 070 (E1.8).
### Restrições
- O agente não abre, lê nem edita arquivos `.env*`, não chama as APIs externas e não roda nada contra a base real.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: código, testes, a branch e a worktree do 070, os outros pareceres, a especificação e o protótipo, o `CLAUDE.md`, os arquivos `.env*` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho de como o cartão escolhe real ou simulado (quais métricas estão sem dado real hoje, de onde vem o simulado, contrato da API) e a ADR nova que revê a 0026." · etapa de outra delegação; continua no pedido
- "E1.2 (ux-designer): especificação do selo "Simulado" e do texto de explicação, com protótipo para o dono validar." · etapa de outra delegação; continua no pedido
- "E1.3 (node-backend): implementação na API." · etapa de outra delegação; continua no pedido
- "E1.4 (react-frontend): implementação nos cartões." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): code review." · etapa de outra delegação; continua no pedido
- "E1.6 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- "E1.8 (tech-lead): PR para a develop e merge." · etapa de outra delegação; continua no pedido
- "E1.9 (tech-lead): trazer a develop para a branch do 070 e resolver o conflito, sem PR, antes do review, do QA e da revisão de interface da volta 1." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (arquivo): `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/ux/070-selo-simulado/revisao-v2.md` existe e contém 'commit: e8c148ba97d99eaf2cac3eb5e5557bc302d481c1'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).