Agente destino: forge:qa-engineer
Pedido: 070-simulado-por-cartao
Tipo: codigo
Branch: feature/070-gate-fronteiras   Base: develop   Base-sha: 79b2f99e7b67c421d00ec9d48a68c94eb0da4e74
Etapa: qa   Cobre: E1.6

## Objetivo
QA da volta 3 do 070 (o import do pacote mock tirado da fonte com simulado e o chunk F9 abaixo de 120 KB, que o gate de fronteiras exige), na ponta bf3d1164825cb221575ce459a6a211ad5f2d0f76 (pedido 070, E1.6, K-221). Worktree `/home/rodrigoisensee/MetricasDSPD-052c`, branch `feature/070-gate-fronteiras`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052c diff 79b2f99e7b67c421d00ec9d48a68c94eb0da4e74..bf3d1164825cb221575ce459a6a211ad5f2d0f76 -- web` (a volta 3: o import do pacote mock tirado de web/src/data/FonteComSimulado.ts e o chunk F9 abaixo de 120 KB); o log do gate que reprovou o PR 230: `gh run view 41983858085 --repo rodrigo-isensee/MetricasDSPD --log-failed`.

## Entregar
- "E1.6 (qa-engineer): QA." (E1.6)
- (E1, E2, E3) (E1.6) `git -C /home/rodrigoisensee/MetricasDSPD-052c pull --ff-only origin feature/070-gate-fronteiras`; rodar com no máximo 2 workers o vitest do server e dos pacotes com cobertura, `pnpm exec prettier --check web packages tools` e `pnpm run docs:check`; rodar também o vitest do web com cobertura e `npx eslint .` com cwd em `web/`; conferir que a API nunca devolve número simulado, que nenhum cartão real mostra o selo, que faixas, Resumo, Visão geral e exportação ignoram o simulado, que o cartão simulado não mostra dentro/fora da meta nem o selo de desvio do T3, que o pacote mock não entra no bundle principal e que `pnpm --filter @metricas-dspd/e2e run gate` passa sem violação nem alerta (com o web/dist reconstruído antes); registrar no parecer que os testes pg não rodam no sandbox e ficam para a CI do PR; parecer em `docs/qa/070-v3.md` com o resultado real; commit só do parecer; push com `git -C /home/rodrigoisensee/MetricasDSPD-052c push origin HEAD:refs/heads/feature/070-gate-fronteiras`; sem PR.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "Não consigo deixar os dados reais nas que já são possíveis fazer e nas que não deixar mocado?" e, ao recibo ("vou fazer: painel com dado real só com o real; sem dado real, o simulado com o selo Simulado visível; ADR nova revendo a 0026; não vou fazer: misturar real e simulado no mesmo gráfico, misturar BusinessMap e Acelerato, simulado em métrica individual; a troca é por cartão"), respondeu "Sim": dado simulado por cartão onde ainda não há dado real, com selo visível.
- DECISÃO DO DONO (2026-11-04): "A" (validação do protótipo docs/ux/070-selo-simulado/prototipo.html): protótipo aprovado como está (selo no cabeçalho, faixa com "O que é simulado?", borda tracejada, marca d'água, prefixo "Exemplo:"); ponto de compromisso do 070.
- DECISÃO DO DONO (2026-11-04): "A" (cartão simulado no resumo): o cartão com dado simulado fica fora de "O que pede atenção agora" e da Visão geral; só aparece na própria aba, com o selo; o resumo mostra só dado real.
### ADRs citadas no Histórico deste pedido (não no registro 064)
- ADR 0026 (citada no pedido): revista pela 0028
- ADR 0028 (citada no pedido): a decisão que este lote implementa
- ADR 0021 (citada no pedido): o simulado roda no Web Worker dela, só no navegador; nada muda nela
### Do Histórico deste pedido, docs/pedidos/070-simulado-por-cartao.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-05 08:57: E1.10 cumprida: branch da volta 3: o tech-lead criou feature/070-gate-fronteiras a partir da develop 79b2f99 e aplicou 34fafce por cherry-pick sem conflito (bf3d1164825cb221575ce459a6a211ad5f2d0f76); gate de fronteiras aprovado localmente (F9 118,29 KB; o primeiro alerta de 121,82 KB veio de um web/dist velho), web com cobertura 100%, eslint, prettier e docs:check verdes. DECISÃO TÉCNICA (Jarvis): review, QA e revisão de interface do delta 79b2f99..bf3d116 em paralelo na worktree 052c, pareceres no nome 070-v3 (o de interface em docs/ux/070-selo-simulado/revisao-v3.md, fora da branch); depois o PR para a develop com o build verde.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*`, não chama as APIs externas e não roda nada contra a base real.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- O parecer é gravado inteiro pela ferramenta Write, com `pedido: 070-simulado-por-cartao`, `branch: feature/070-gate-fronteiras`, `commit: bf3d1164825cb221575ce459a6a211ad5f2d0f76`, veredito e bloco `## Achados` (até 300 caracteres por achado, severidade só entre parênteses, regra citada só pelo ID); o pre-push e o forge-check docs barram frase de regra copiada.
- Outros pareceres são gravados ao mesmo tempo nesta worktree: `git -C /home/rodrigoisensee/MetricasDSPD-052c pull --ff-only origin feature/070-gate-fronteiras` antes do commit; `git -C /home/rodrigoisensee/MetricasDSPD-052c add <parecer>` e `git -C /home/rodrigoisensee/MetricasDSPD-052c commit -m <mensagem> -m 'Cartão: K-221' -- <parecer>` (sem heredoc e sem pipe); se der index.lock ou push recusado por estar atrás, espere uns segundos, faça o pull e repita; se o push disser cannot lock ref, confira o `git ls-remote` antes de repetir.
- NÃO tocar: código, testes, os outros pareceres, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho de como o cartão escolhe real ou simulado (quais métricas estão sem dado real hoje, de onde vem o simulado, contrato da API) e a ADR nova que revê a 0026." · etapa de outra delegação; continua no pedido
- "E1.2 (ux-designer): especificação do selo "Simulado" e do texto de explicação, com protótipo para o dono validar." · etapa de outra delegação; continua no pedido
- "E1.3 (node-backend): implementação na API." · etapa de outra delegação; continua no pedido
- "E1.4 (react-frontend): implementação nos cartões." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): code review." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface." · etapa de outra delegação; continua no pedido
- "E1.8 (tech-lead): PR para a develop e merge." · etapa de outra delegação; continua no pedido
- "E1.9 (tech-lead): trazer a develop para a branch do 070 e resolver o conflito, sem PR, antes do review, do QA e da revisão de interface da volta 1." · etapa de outra delegação; continua no pedido
- "E1.10 (tech-lead): branch nova a partir da develop com a correção da volta 3 aplicada por cherry-pick, depois do merge do PR 230 sem ela." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052c show origin/feature/070-gate-fronteiras:docs/qa/070-v3.md` · espera: contém 'commit: bf3d1164825cb221575ce459a6a211ad5f2d0f76'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).