Agente destino: forge:react-frontend
Pedido: 070-simulado-por-cartao
Tipo: codigo
Branch: feature/070-simulado-por-cartao   Base: develop   Base-sha: 97ec7af9055f247297ecdedda910cbac54562d72
Etapa: codigo   Cobre: E1.4

## Objetivo
Volta 1 do L2 do 070 nos cartões: corrigir os achados da revisão de interface, do code review e do QA sobre a ponta abc07cc1d58a6810f3c57dd3eadc4c9ab5043fb6 (pedido 070, E1.4, K-221). Worktree `/home/rodrigoisensee/MetricasDSPD-052f`, branch `feature/070-simulado-por-cartao`.

## Ler
- Os achados: `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/ux/070-selo-simulado/revisao.md` (A-1, A-2, A-4, A-5, A-7), `/home/rodrigoisensee/MetricasDSPD-052f/docs/reviews/070-l2.md` (A1, A2) e `/home/rodrigoisensee/MetricasDSPD-052f/docs/qa/070-l2.md` (A2).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/ux/070-selo-simulado/especificacao.md` (CA-3, CA-5) e `/home/rodrigoisensee/MetricasDSPD-052f/docs/analises/070-desenho.md` (R6).

## Entregar
- "E1.4 (react-frontend): implementação nos cartões." (E1.4)
- (E1) (E3) (E1.4) `git -C /home/rodrigoisensee/MetricasDSPD-052f pull --ff-only origin feature/070-simulado-por-cartao`; corrigir: (1) A-1 da revisão de interface e A1 do review: o cartão simulado não mostra dentro/fora da meta em lugar nenhum, nem no corpo (S1, T2, T3, T4, T7, S7 e o complementar de sustentação e qualquer outro que use `StatusMeta`), pelo contexto do cartão, com teste que falha antes da correção; (2) A-2: o selo tem nome acessível com a frase completa da especificação (texto visualmente oculto ou `role="img"` com nome), com teste; (3) A-4: o motivo da faixa sem sigla interna (traduzir ou ocultar no `motivoDaOrigemMock`); (4) A-5: a marca d'água não aparece no modo "Ver como tabela"; (5) A-7: alvo de 44 px no botão "O que é simulado?" também no desktop; (6) A2 do review: `HORA_DE_CORTE` de `web/src/data/FonteComSimulado.ts` derivada do padrão do mock, não repetida à mão; (7) A2 do QA: `CartaoEI` não pede simulado para o EI_SUST; vitest do web com cobertura 100 por cento, no máximo 2 workers; `npx eslint .` com cwd em `web/`, `pnpm exec prettier --check web packages tools` e `pnpm run docs:check` verdes; commits com `git -C /home/rodrigoisensee/MetricasDSPD-052f add <arquivos>` e `git -C /home/rodrigoisensee/MetricasDSPD-052f commit -m <mensagem> -m 'Cartão: K-221' -- <arquivos>` (sem heredoc e sem pipe); push com `git -C /home/rodrigoisensee/MetricasDSPD-052f push origin HEAD:refs/heads/feature/070-simulado-por-cartao`; sem PR.
- (E2) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "Não consigo deixar os dados reais nas que já são possíveis fazer e nas que não deixar mocado?" e, ao recibo ("vou fazer: painel com dado real só com o real; sem dado real, o simulado com o selo Simulado visível; ADR nova revendo a 0026; não vou fazer: misturar real e simulado no mesmo gráfico, misturar BusinessMap e Acelerato, simulado em métrica individual; a troca é por cartão"), respondeu "Sim": dado simulado por cartão onde ainda não há dado real, com selo visível.
- DECISÃO DO DONO (2026-11-04): "A" (validação do protótipo docs/ux/070-selo-simulado/prototipo.html): protótipo aprovado como está (selo no cabeçalho, faixa com "O que é simulado?", borda tracejada, marca d'água, prefixo "Exemplo:"); ponto de compromisso do 070.
- DECISÃO DO DONO (2026-11-04): "A" (cartão simulado no resumo): o cartão com dado simulado fica fora de "O que pede atenção agora" e da Visão geral; só aparece na própria aba, com o selo; o resumo mostra só dado real.
### ADRs citadas no Histórico deste pedido (não no registro 064)
- ADR 0026 (citada no pedido): revista pela 0028
- ADR 0028 (citada no pedido): a decisão que este lote implementa
- ADR 0021 (citada no pedido): o simulado roda no Web Worker dela, só no navegador; nada muda nela
### Do Histórico deste pedido, docs/pedidos/070-simulado-por-cartao.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-05 00:25: Volta 1 do L2 ao react-frontend: QA do L1 e L2 aprovado (parecer 070-l2, commit: 9605ead, 0 bugs, enviado em abc07cc; web 1463 testes com cobertura 100%; A2: CartaoEI ainda pede simulado para o EI_SUST); review 070-l2 aprovado (A1: StatusMeta no corpo dos cartões simulados, UX decide; A2: HORA_DE_CORTE repetida à mão em FonteComSimulado.ts); a revisão de interface pede a correção do A-1 (alto). DECISÃO TÉCNICA (Jarvis): brief único ao react-frontend na mesma branch, sobre abc07cc, com o A-1 de UX e o A1 do review (esconder dentro/fora da meta no corpo do cartão simulado pelo contexto do cartão, com teste), o A-2 de UX (nome acessível do selo com a frase completa), o A-4 (sem sigla interna no motivo da faixa), o A-5 (marca d'água fora do modo tabela), o A-7 (alvo de 44 px no botão "O que é simulado?"), o A2 do review (HORA_DE_CORTE derivada do mock) e o A2 do QA (CartaoEI sem pedido de simulado para o EI_SUST); A-6 e A-8 ficam como estão; depois review, QA e revisão de interface do delta.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*` e não chama as APIs externas.
- Regras invioláveis do CLAUDE.md: nenhuma métrica individual (nem simulada), BusinessMap e Acelerato nunca se misturam, real e simulado nunca no mesmo gráfico ou número, todo cálculo pela biblioteca compartilhada.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: `server/`, `packages/`, as ADRs, o desenho, a especificação e a revisão do UX, os pareceres, o texto validado do cabeçalho ("N cartões sem dado real"), outras worktrees, o `CLAUDE.md`, os arquivos `.env*` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho de como o cartão escolhe real ou simulado (quais métricas estão sem dado real hoje, de onde vem o simulado, contrato da API) e a ADR nova que revê a 0026." · etapa de outra delegação; continua no pedido
- "E1.2 (ux-designer): especificação do selo "Simulado" e do texto de explicação, com protótipo para o dono validar." · etapa de outra delegação; continua no pedido
- "E1.3 (node-backend): implementação na API." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): code review." · etapa de outra delegação; continua no pedido
- "E1.6 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface." · etapa de outra delegação; continua no pedido
- "E1.8 (tech-lead): PR para a develop e merge." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (push): `git -C /home/rodrigoisensee/MetricasDSPD-052f ls-remote origin feature/070-simulado-por-cartao` · espera: contém 'refs/heads/feature/070-simulado-por-cartao'
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052f diff --name-only abc07cc1d58a6810f3c57dd3eadc4c9ab5043fb6 origin/feature/070-simulado-por-cartao -- web` · espera: linhas>=1

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).