Agente destino: forge:react-frontend
Pedido: 070-simulado-por-cartao
Tipo: codigo
Branch: feature/070-l3-e2e   Base: develop   Base-sha: 0a4f139cc1b03d5720b481ae56e4297c9f49f5b4
Etapa: codigo   Cobre: E1.4

## Objetivo
Lote L3 do 070: os testes E2E de API T-E1 a T-E3 e a medição perf-api T-E4 do desenho, com a medição em navegador do alvo de 44 px e da marca d'água em 320 px, numa branch nova feature/070-l3-e2e a partir da develop 0a4f139cc1b03d5720b481ae56e4297c9f49f5b4 (pedido 070, E1.4, K-221). Worktree `/home/rodrigoisensee/MetricasDSPD-052f`.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052f/docs/analises/070-desenho.md` (T-E1 a T-E4 e a linha L3 da tabela de lotes); os E2E de API que já existem em `/home/rodrigoisensee/MetricasDSPD-052f/e2e/tests-api/` como modelo; `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/qa/` não precisa ser lido; o A1 do QA 070-v2 (medir 44 px e 320 px no navegador) e o A1 do review 070-v3 (folga de 1,4 KB do F9).

## Entregar
- "E1.4 (react-frontend): implementação nos cartões." (E1.4)
- (E1) (E3) (E1.4) `git -C /home/rodrigoisensee/MetricasDSPD-052f fetch origin`; `git -C /home/rodrigoisensee/MetricasDSPD-052f switch -c feature/070-l3-e2e 0a4f139cc1b03d5720b481ae56e4297c9f49f5b4`; escrever em `e2e/tests-api/` os testes T-E1 (FL1 semanal: O12 com o selo Simulado e um número, O3 sem selo), T-E2 (sustentação: S1 simulado com selo, S2 real sem selo, EI_SUST com Sem dado real) e T-E3 (Resumo: TENDENCIA_FLUXO e TENDENCIA_SUST com Sem dado real), mais a verificação em navegador do alvo de 44 px do botão "O que é simulado?" e da marca d'água contida em 320 px; a medição T-E4 no perf-api (F6 sem aumento, C6 dentro do orçamento da ADR 0003 num painel com simulado, F9 dentro de 120 KB) com o resultado no relatório; rodar os E2E novos localmente se o ambiente permitir (Chromium), senão registrar que ficam para a CI; `pnpm --filter @metricas-dspd/e2e run gate` (com o web/dist reconstruído antes), `npx eslint .` com cwd em `web/` e em `e2e/` se houver, `pnpm exec prettier --check web packages tools` e `pnpm run docs:check`; commits com `git -C /home/rodrigoisensee/MetricasDSPD-052f add <arquivos>` e `git -C /home/rodrigoisensee/MetricasDSPD-052f commit -m <mensagem> -m 'Cartão: K-221' -- <arquivos>` (sem heredoc e sem pipe); push com `git -C /home/rodrigoisensee/MetricasDSPD-052f push origin HEAD:refs/heads/feature/070-l3-e2e`; sem PR.
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
- 2026-11-05 12:06: Lote L3 começa: L1, L2 e a volta 3 estão na develop (PRs 230 e 231); o dono perguntou por que o time estava parado com carga baixa. DECISÃO TÉCNICA (Jarvis): L3 do desenho (docs/analises/070-desenho.md: E2E de API T-E1 a T-E3 e medição perf-api T-E4) com o react-frontend, numa branch feature/070-l3-e2e a partir da develop 0a4f139 na worktree 052f, incluindo a medição em navegador do alvo de 44 px e da marca d'água em 320 px (A1 do QA 070-v2); depois review, QA e o PR.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*` e não chama as APIs externas.
- Regras invioláveis do CLAUDE.md: nenhuma métrica individual (nem simulada), BusinessMap e Acelerato nunca se misturam, real e simulado nunca no mesmo gráfico ou número, todo cálculo pela biblioteca compartilhada.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: `server/`, `packages/`, o código de `web/src` (este lote só testa e mede), as ADRs, o desenho, a especificação e a revisão do UX, os pareceres, o texto validado do cabeçalho ("N cartões sem dado real"), o estado "Sem dado real" (A-12 fica como dívida), outras worktrees, o `CLAUDE.md`, os arquivos `.env*` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho de como o cartão escolhe real ou simulado (quais métricas estão sem dado real hoje, de onde vem o simulado, contrato da API) e a ADR nova que revê a 0026." · etapa de outra delegação; continua no pedido
- "E1.2 (ux-designer): especificação do selo "Simulado" e do texto de explicação, com protótipo para o dono validar." · etapa de outra delegação; continua no pedido
- "E1.3 (node-backend): implementação na API." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): code review." · etapa de outra delegação; continua no pedido
- "E1.6 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface." · etapa de outra delegação; continua no pedido
- "E1.8 (tech-lead): PR para a develop e merge." · etapa de outra delegação; continua no pedido
- "E1.9 (tech-lead): trazer a develop para a branch do 070 e resolver o conflito, sem PR, antes do review, do QA e da revisão de interface da volta 1." · etapa de outra delegação; continua no pedido
- "E1.10 (tech-lead): branch nova a partir da develop com a correção da volta 3 aplicada por cherry-pick, depois do merge do PR 230 sem ela." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (push): `git -C /home/rodrigoisensee/MetricasDSPD-052f ls-remote origin feature/070-l3-e2e` · espera: contém 'refs/heads/feature/070-l3-e2e'
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052f diff --name-only 0a4f139cc1b03d5720b481ae56e4297c9f49f5b4 origin/feature/070-l3-e2e -- e2e` · espera: linhas>=1

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).