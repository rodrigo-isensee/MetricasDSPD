Agente destino: forge:react-frontend
Pedido: 070-simulado-por-cartao
Tipo: codigo
Branch: feature/070-simulado-por-cartao   Base: develop   Base-sha: f61570400a45a86917e5f0ee30eaaf4b0a2e7ebc
Etapa: codigo   Cobre: E1.4

## Objetivo
Volta 3 do L2 do 070: o gate de fronteiras do build reprova o PR 230 porque `web/src/data/FonteComSimulado.ts` importa `@metricas-dspd/mock`, e o chunk do mock passou do teto de tamanho; corrigir sobre a ponta 1a9b1c7ea5a136ddb657963c54fc6b354e0487c2 (pedido 070, E1.4, K-221). Worktree `/home/rodrigoisensee/MetricasDSPD-052f`, branch `feature/070-simulado-por-cartao`.

## Ler
- O log do gate: `gh run view 41983858085 --repo rodrigo-isensee/MetricasDSPD --log-failed` (job 127099916275, passo "Gate (fronteiras BM x AC, hash da base mock, tamanho)"); o script do gate em `/home/rodrigoisensee/MetricasDSPD-052f/e2e/` (comando `gate` do pacote `@metricas-dspd/e2e`); `/home/rodrigoisensee/MetricasDSPD-052f/web/src/data/FonteComSimulado.ts` e o módulo que já carrega o mock sob demanda.

## Entregar
- "E1.4 (react-frontend): implementação nos cartões." (E1.4)
- (E1) (E3) (E1.4) `git -C /home/rodrigoisensee/MetricasDSPD-052f pull --ff-only origin feature/070-simulado-por-cartao`; tirar de `web/src/data/FonteComSimulado.ts` todo import de `@metricas-dspd/mock`, sem voltar a repetir a hora de corte à mão: a hora vem do lugar que o gate permite (o módulo que já carrega o mock sob demanda, junto do resto do simulado), sem o pacote mock no bundle principal; trazer o chunk do mock com a biblioteca para até 120 KB; teste que cobre a hora de corte; rodar `pnpm --filter @metricas-dspd/e2e run gate` até sair sem violação e sem alerta de tamanho, o vitest do web com cobertura 100 por cento (no máximo 2 workers), `npx eslint .` com cwd em `web/`, `pnpm exec prettier --check web packages tools` e `pnpm run docs:check`; commits com `git -C /home/rodrigoisensee/MetricasDSPD-052f add <arquivos>` e `git -C /home/rodrigoisensee/MetricasDSPD-052f commit -m <mensagem> -m 'Cartão: K-221' -- <arquivos>` (sem heredoc e sem pipe); push com `git -C /home/rodrigoisensee/MetricasDSPD-052f push origin HEAD:refs/heads/feature/070-simulado-por-cartao`; depois do push, esperar o job `build` do PR 230 por laço com pausa (`gh pr checks feature/070-simulado-por-cartao --repo rodrigo-isensee/MetricasDSPD`, cada chamada abaixo de 2 minutos, até 30 minutos) e relatar o resultado; sem merge.
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
- 2026-11-05 04:00: Volta 3 do L2: gate de fronteiras reprova o PR 230: o tech-lead abriu o PR 230, rodou o update-branch (ponta 1a9b1c7ea5a136ddb657963c54fc6b354e0487c2, forge-check pr aprovado) e o job build reprovou no gate (run 41983858085, job 127099916275): "## fronteiras: REPROVADO ... 1 violação(ões) - painel calcula: web/src/data/FonteComSimulado.ts importa \"@metricas-dspd/mock\""; o gate também alertou o chunk do mock com a biblioteca em 123.3 KB contra o teto de 120 KB. A origem é a volta 2 (A1 do review 070-v1: hora de corte vinda de CONFIG_PADRAO do mock por import dinâmico); escape registrado (o gate só roda no build da CI). DECISÃO TÉCNICA (Jarvis): volta 3 ao react-frontend para tirar o import do pacote mock de web/src/data/FonteComSimulado.ts sem voltar a repetir a hora à mão (a hora vem de onde o gate permite, como o módulo que já carrega o mock sob demanda) e trazer o chunk para até 120 KB, conferindo o gate localmente (pnpm --filter @metricas-dspd/e2e run gate) e o build do PR 230 verde; depois review, QA e revisão de interface do delta (nomes 070-v3) e o merge.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*` e não chama as APIs externas.
- Regras invioláveis do CLAUDE.md: nenhuma métrica individual (nem simulada), BusinessMap e Acelerato nunca se misturam, real e simulado nunca no mesmo gráfico ou número, todo cálculo pela biblioteca compartilhada.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: `server/`, `packages/`, as ADRs, o desenho, a especificação e a revisão do UX, os pareceres, o texto validado do cabeçalho ("N cartões sem dado real"), o estado "Sem dado real" (A-12 fica como dívida), outras worktrees, o `CLAUDE.md`, os arquivos `.env*` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho de como o cartão escolhe real ou simulado (quais métricas estão sem dado real hoje, de onde vem o simulado, contrato da API) e a ADR nova que revê a 0026." · etapa de outra delegação; continua no pedido
- "E1.2 (ux-designer): especificação do selo "Simulado" e do texto de explicação, com protótipo para o dono validar." · etapa de outra delegação; continua no pedido
- "E1.3 (node-backend): implementação na API." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): code review." · etapa de outra delegação; continua no pedido
- "E1.6 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface." · etapa de outra delegação; continua no pedido
- "E1.8 (tech-lead): PR para a develop e merge." · etapa de outra delegação; continua no pedido
- "E1.9 (tech-lead): trazer a develop para a branch do 070 e resolver o conflito, sem PR, antes do review, do QA e da revisão de interface da volta 1." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052f show origin/feature/070-simulado-por-cartao:web/src/data/FonteComSimulado.ts` · espera: linhas>=1
- PQ-2 (run): o job build do PR 230 verde na ponta nova, com o link do run

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).