Agente destino: forge:react-frontend
Pedido: 070-simulado-por-cartao
Tipo: codigo
Branch: feature/070-l3-e2e   Base: develop   Base-sha: 0a4f139cc1b03d5720b481ae56e4297c9f49f5b4
Etapa: codigo   Cobre: E1.4

## Objetivo
Corrigir o bug 070-001 (alta): a marca d'água "SIMULADO" reprova no axe (color-contrast séria nos cartões S1 e S7 da Sustentação), achado pelo E2E T-E6 do L3, na branch `feature/070-l3-e2e` (ponta 3af044ca44310ae2dfd574fb8a6984e46bd6e2f7) (pedido 070, E1.4, K-221). Worktree `/home/rodrigoisensee/MetricasDSPD-052f`.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052f/docs/qa/bugs/070-001-marca-dagua-simulado-contraste-axe.md` (passos para reproduzir); `/home/rodrigoisensee/MetricasDSPD-052f/web/src/components/ui/SeloSimulado.tsx` (`MarcaDaguaSimulado`); o teste T-E6 em `/home/rodrigoisensee/MetricasDSPD-052f/e2e/tests-api/simulado-070-l3.spec.ts`; a seção da marca d'água em `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/ux/070-selo-simulado/` (especificação validada).

## Entregar
- "E1.4 (react-frontend): implementação nos cartões." (E1.4)
- (E1) (E3) (E1.4) `git -C /home/rodrigoisensee/MetricasDSPD-052f pull --ff-only origin feature/070-l3-e2e`; corrigir `MarcaDaguaSimulado` para o axe não reprovar, sem mudar a aparência validada pelo dono (a marca segue decorativa, aria-hidden, mesma posição, tamanho, rotação e opacidade visual; por exemplo desenhada em SVG ou fundo CSS em vez de texto, ou outra forma que o axe aceite sem desligar nem afrouxar a regra color-contrast); teste unitário do componente atualizado com cobertura 100% em web; rodar o T-E6 e os outros testes de `e2e/tests-api/simulado-070-l3.spec.ts` como o bug descreve (stub api-stub-065 e Chromium) até passarem; `pnpm --filter @metricas-dspd/e2e run gate` com o web/dist reconstruído antes; vitest de web com no máximo 2 workers e cobertura; `npx eslint .` com cwd em `web/`; `pnpm exec prettier --check web packages tools`; `pnpm run docs:check`; commits com `git -C /home/rodrigoisensee/MetricasDSPD-052f add <arquivos>` e `git -C /home/rodrigoisensee/MetricasDSPD-052f commit -m <mensagem> -m 'Cartão: K-221' -- <arquivos>` (sem heredoc e sem pipe); push com `git -C /home/rodrigoisensee/MetricasDSPD-052f push origin HEAD:refs/heads/feature/070-l3-e2e`; sem PR.
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
- 2026-11-05 12:31: L3 entregue com o bug 070-001: o qa-engineer entregou 3af044ca44310ae2dfd574fb8a6984e46bd6e2f7 em feature/070-l3-e2e: T-E1, T-E2, T-E3 e T-E5 (44 px em 1280 e 320, marca contida em 320) passam; T-E6 (axe na Sustentação com simulado) falha com color-contrast séria na marca d'água dos cartões S1 e S7 (bug 070-001, alta, docs/qa/bugs/070-001-marca-dagua-simulado-contraste-axe.md; escape registrado); C6 com simulado 75 ms e 67 ms de mediana (limite 200 ms); F9 118,31 KB (folga 1,69 KB); F6 196,88 KB, +2,33 KB contra a base pré-070 (dentro dos 200 KB, o desenho dizia que não mudava); A2: o stub api-stub-065 devolve /referencia sem ultimaColeta e versaoCriterio, contornado no E2E por e2e/fixtures/referencia-completa.ts. DECISÃO TÉCNICA (Jarvis): E1.4 volta ao react-frontend na mesma branch para corrigir o 070-001 sem mudar a aparência validada pelo dono (a marca d'água é decorativa: deixa de ser texto medido pelo axe, por exemplo desenho em SVG ou fundo CSS com aria-hidden, ou outra forma que o axe aceite sem afrouxar a regra), até o T-E6 passar; o A2 (stub) e o A3 (F6) vão como recomendação ao review; depois review, QA, revisão de interface e o PR.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*` e não chama as APIs externas.
- Regras invioláveis do CLAUDE.md: nenhuma métrica individual (nem simulada), BusinessMap e Acelerato nunca se misturam, real e simulado nunca no mesmo gráfico ou número, todo cálculo pela biblioteca compartilhada.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: `server/`, `packages/`, os testes E2E do L3 (o T-E6 não muda nem é pulado), o código de `web/src` fora da marca d'água e do seu teste, as ADRs, o desenho, a especificação e a revisão do UX, os pareceres, o texto validado do cabeçalho ("N cartões sem dado real"), o estado "Sem dado real" (A-12 fica como dívida), outras worktrees, o `CLAUDE.md`, os arquivos `.env*` e a `main`.

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
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052f diff --name-only 3af044ca44310ae2dfd574fb8a6984e46bd6e2f7 origin/feature/070-l3-e2e -- web/src/components/ui` · espera: linhas>=1

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).