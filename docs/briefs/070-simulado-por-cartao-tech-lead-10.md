Agente destino: forge:tech-lead
Pedido: 070-simulado-por-cartao
Tipo: codigo
Branch: feature/070-gate-fronteiras   Base: develop   Base-sha: 79b2f99e7b67c421d00ec9d48a68c94eb0da4e74
Etapa: codigo   Cobre: E1.10

## Objetivo
Levar à develop a correção da volta 3 do 070 (34fafce92e46c70604dba8b56a34218b5173665c: tira o import do pacote mock de web/src/data/FonteComSimulado.ts e traz o chunk F9 para 118 KB), que ficou fora do PR 230, por uma branch nova feature/070-gate-fronteiras a partir da develop 79b2f99e7b67c421d00ec9d48a68c94eb0da4e74 (pedido 070, E1.10, K-221). Worktree `/home/rodrigoisensee/MetricasDSPD-052c`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052c show 34fafce92e46c70604dba8b56a34218b5173665c --stat` (a correção) e o log do gate que reprovou o PR 230: `gh run view 41983858085 --repo rodrigo-isensee/MetricasDSPD --log-failed`.

## Entregar
- "E1.10 (tech-lead): branch nova a partir da develop com a correção da volta 3 aplicada por cherry-pick, depois do merge do PR 230 sem ela." (E1.10)
- (E1, E2, E3) (E1.10) sem PR: `git -C /home/rodrigoisensee/MetricasDSPD-052c fetch origin`; `git -C /home/rodrigoisensee/MetricasDSPD-052c switch -c feature/070-gate-fronteiras 79b2f99e7b67c421d00ec9d48a68c94eb0da4e74`; `git -C /home/rodrigoisensee/MetricasDSPD-052c cherry-pick 34fafce92e46c70604dba8b56a34218b5173665c` (se der conflito, `git -C /home/rodrigoisensee/MetricasDSPD-052c cherry-pick --abort`, pare e relate); rodar `pnpm --filter @metricas-dspd/e2e run gate` até sair sem violação e sem alerta de tamanho, o vitest do web com cobertura (no máximo 2 workers), `npx eslint .` com cwd em `web/`, `pnpm exec prettier --check web packages tools` e `pnpm run docs:check`; push com `git -C /home/rodrigoisensee/MetricasDSPD-052c push origin HEAD:refs/heads/feature/070-gate-fronteiras`; sem PR e sem mudar nada além do cherry-pick.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "Não consigo deixar os dados reais nas que já são possíveis fazer e nas que não deixar mocado?" e, ao recibo ("vou fazer: painel com dado real só com o real; sem dado real, o simulado com o selo Simulado visível; ADR nova revendo a 0026; não vou fazer: misturar real e simulado no mesmo gráfico, misturar BusinessMap e Acelerato, simulado em métrica individual; a troca é por cartão"), respondeu "Sim": dado simulado por cartão onde ainda não há dado real, com selo visível.
- DECISÃO DO DONO (2026-11-04): "A" (validação do protótipo docs/ux/070-selo-simulado/prototipo.html): protótipo aprovado como está (selo no cabeçalho, faixa com "O que é simulado?", borda tracejada, marca d'água, prefixo "Exemplo:"); ponto de compromisso do 070.
- DECISÃO DO DONO (2026-11-04): "A" (cartão simulado no resumo): o cartão com dado simulado fica fora de "O que pede atenção agora" e da Visão geral; só aparece na própria aba, com o selo; o resumo mostra só dado real.
### ADRs citadas no Histórico deste pedido (não no registro 064)
- ADR 0026 (citada no pedido): revista pela 0028
- ADR 0028 (citada no pedido): a decisão que este lote implementa
- ADR 0021 (citada no pedido): o simulado roda no Web Worker dela, só no navegador; nada muda nela
### Do Histórico deste pedido, docs/pedidos/070-simulado-por-cartao.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-05 08:38: Volta 3 vai por branch nova: o merge da feature/070-simulado-por-cartao na develop daria conflito add/add em web/src/data/FonteComSimulado.ts, porque o PR 230 entrou por squash na ponta 1a9b1c7 e a volta 3 (34fafce92e46c70604dba8b56a34218b5173665c) mexe no mesmo arquivo. DECISÃO TÉCNICA (Jarvis): etapa nova E1.10 com o tech-lead: branch feature/070-gate-fronteiras a partir da develop 79b2f99, cherry-pick de 34fafce9 (sem resolver nada à mão; conflito, para e relata), gate de fronteiras local e push; depois review, QA e revisão de interface do delta em paralelo (070-v3) e o PR por squash com o build verde.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*`, não chama as APIs externas e não roda nada contra a base real.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: código e testes além do cherry-pick, os pareceres, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho de como o cartão escolhe real ou simulado (quais métricas estão sem dado real hoje, de onde vem o simulado, contrato da API) e a ADR nova que revê a 0026." · etapa de outra delegação; continua no pedido
- "E1.2 (ux-designer): especificação do selo "Simulado" e do texto de explicação, com protótipo para o dono validar." · etapa de outra delegação; continua no pedido
- "E1.3 (node-backend): implementação na API." · etapa de outra delegação; continua no pedido
- "E1.4 (react-frontend): implementação nos cartões." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): code review." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface." · etapa de outra delegação; continua no pedido
- "E1.6 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- "E1.8 (tech-lead): PR para a develop e merge." · etapa de outra delegação; continua no pedido
- "E1.9 (tech-lead): trazer a develop para a branch do 070 e resolver o conflito, sem PR, antes do review, do QA e da revisão de interface da volta 1." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052c merge-base --is-ancestor 79b2f99e7b67c421d00ec9d48a68c94eb0da4e74 origin/feature/070-gate-fronteiras` · espera: rc=0
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052c grep -c metricas-dspd/mock origin/feature/070-gate-fronteiras -- web/src/data/FonteComSimulado.ts` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).