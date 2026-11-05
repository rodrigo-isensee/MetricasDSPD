Agente destino: forge:ux-designer
Pedido: 070-simulado-por-cartao
Tipo: codigo
Branch: feature/070-simulado-por-cartao   Base: develop   Base-sha: 97ec7af9055f247297ecdedda910cbac54562d72
Etapa: review   Cobre: E1.7

## Objetivo
Revisão de interface do 070 com os lotes L1 e L2 (o selo Simulado nos cartões sobre o campo simulavel da API) na ponta 9605ead23032f5fc0c35eda72a3318f2fc5721b1, contra a especificação e o protótipo validados pelo dono (pedido 070, E1.7, K-221). Worktree `/home/rodrigoisensee/MetricasDSPD-052f`, branch `feature/070-simulado-por-cartao`.

## Ler
- Com a ferramenta Read, em `/home/rodrigoisensee/MetricasDSPD-052f/web/src` (a worktree está na ponta 222c862, que só acrescenta o parecer de review à 9605ead23032f5fc0c35eda72a3318f2fc5721b1, então o `web/` é o da 9605ead): `components/ui/SeloSimulado.tsx`, `components/ui/CartaoMetrica.tsx`, `features/coleta/OrigemDosCartoes.tsx`, `app/App.tsx` e uma amostra dos cartões alterados (`features/operacional/components/CartaoO1.tsx`, `features/sustentacao/components/CartaoS1.tsx`, `features/estrategico/components/CartaoE1.tsx`, `features/espera-invisivel/components/CartaoEI.tsx`); o desenho `/home/rodrigoisensee/MetricasDSPD-052f/docs/analises/070-desenho.md` (R1 a R7, T-W1 a T-W8) , a especificação `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/ux/070-selo-simulado/especificacao.md` e o protótipo `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/ux/070-selo-simulado/prototipo.html`.

## Entregar
- "E1.7 (ux-designer): revisão de interface." (E1.7)
- (E1, E2, E3) (E1.7) ler o código da tela listado em Ler, só leitura e sem escrever na worktree, e conferir contra a especificação e o protótipo validados: selo no cabeçalho, faixa com "O que é simulado?", borda tracejada, marca d'água, prefixo "Exemplo:", leitura acessível (texto do selo e da faixa para leitor de tela, contraste); confirmar ou recusar as decisões de tela do autor (motivo visível na faixa, cartão simulado sem dentro/fora da meta nem selo de calibração, cores pelos tokens atencao e atencao-fundo em vez dos hex do protótipo); conferir que o cartão simulado só aparece na própria aba e que o resumo mostra só dado real (segunda decisão "A" do dono); parecer em `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/ux/070-selo-simulado/revisao.md` pela ferramenta Write, com `pedido: 070-simulado-por-cartao`, `branch: feature/070-simulado-por-cartao`, `commit: 9605ead23032f5fc0c35eda72a3318f2fc5721b1`, veredito e bloco `## Achados` (até 300 caracteres por achado, severidade só entre parênteses, regra citada só pelo ID); sem commit (o Jarvis commita); nada escrito na branch nem na worktree do 070.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "Não consigo deixar os dados reais nas que já são possíveis fazer e nas que não deixar mocado?" e, ao recibo ("vou fazer: painel com dado real só com o real; sem dado real, o simulado com o selo Simulado visível; ADR nova revendo a 0026; não vou fazer: misturar real e simulado no mesmo gráfico, misturar BusinessMap e Acelerato, simulado em métrica individual; a troca é por cartão"), respondeu "Sim": dado simulado por cartão onde ainda não há dado real, com selo visível.
- DECISÃO DO DONO (2026-11-04): "A" (validação do protótipo docs/ux/070-selo-simulado/prototipo.html): protótipo aprovado como está (selo no cabeçalho, faixa com "O que é simulado?", borda tracejada, marca d'água, prefixo "Exemplo:"); ponto de compromisso do 070.
- DECISÃO DO DONO (2026-11-04): "A" (cartão simulado no resumo): o cartão com dado simulado fica fora de "O que pede atenção agora" e da Visão geral; só aparece na própria aba, com o selo; o resumo mostra só dado real.
### ADRs citadas no Histórico deste pedido (não no registro 064)
- ADR 0026 (citada no pedido): revista pela 0028
- ADR 0028 (citada no pedido): a decisão que este lote implementa
- ADR 0021 (citada no pedido): o simulado roda no Web Worker dela, só no navegador; nada muda nela
### Do Histórico deste pedido, docs/pedidos/070-simulado-por-cartao.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-05 00:13: Revisão de interface do 070 fora da branch: com o Forge 0.32.0, review do L1 e L2 aprovado no remoto (222c862, commit: 9605ead) e QA em curso na mesma ponta; o forge-check pr ainda conta mudança em docs/ux como mudança do lote (no 069 L9-a, o parecer de UX commitado na branch invalidou review e QA duas vezes). DECISÃO TÉCNICA (Jarvis): a revisão de interface (E1.7) roda em paralelo ao QA, lendo a branch na ponta 9605ead, e grava o parecer no clone principal em docs/ux/070-selo-simulado/revisao.md, ao lado da especificação validada, sem commit (o Jarvis commita com o quadro); nada é escrito na branch do 070; confirma as decisões de tela do autor (motivo visível na faixa, cartão simulado sem dentro/fora da meta nem selo de calibração, cores pelos tokens atencao e atencao-fundo). MELHORIA ao Forge: docs/ux fora das pastas de parecer ignoradas pelo forge-check pr.
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
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (arquivo): `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/ux/070-selo-simulado/revisao.md` existe e contém 'commit: 9605ead23032f5fc0c35eda72a3318f2fc5721b1'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).