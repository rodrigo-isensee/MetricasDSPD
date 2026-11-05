Agente destino: forge:react-frontend
Pedido: 070-simulado-por-cartao
Tipo: codigo
Branch: feature/070-simulado-por-cartao   Base: develop   Base-sha: 97ec7af9055f247297ecdedda910cbac54562d72
Etapa: codigo   Cobre: E1.4

## Objetivo
Lote L2 do 070 nos cartões: o cartão sem dado real e com simulavel verdadeiro mostra o dado simulado do mock com o selo "Simulado", e o real sempre ganha (pedido 070, E1.4, K-221). Worktree `/home/rodrigoisensee/MetricasDSPD-052f`, branch `feature/070-simulado-por-cartao`, sobre o L1 já revisto e testado.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052f/docs/analises/070-desenho.md` (seções da regra do cartão R1 a R6, carga sob demanda, testes T-W1 a T-W8 e 8, linha L2).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/ux/070-selo-simulado/especificacao.md` (o selo, a faixa, o texto e os critérios CA-1 a CA-13) e `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/ux/070-selo-simulado/prototipo.html` (o protótipo validado pelo dono).

## Entregar
- "E1.4 (react-frontend): implementação nos cartões." (E1.4)
- (E1) (E3) (E1.4) `git -C /home/rodrigoisensee/MetricasDSPD-052f pull --ff-only origin feature/070-simulado-por-cartao`; implementar o L2 como o desenho descreve (decorador da fonte em `web/src/data/`, origem pelo contexto `ProvedorOrigemCartoes`/`useOrigemCartao`, `useMetrica`, selo no `CartaoMetrica` pela especificação validada, filtros listados em "não afetam este cartão", carga sob demanda do Worker e do chunk do mock, e o simulado fora das faixas de atenção, do Resumo, da Visão geral, de `OrigemDosCartoes` e da exportação); testes T-W1 a T-W8; vitest do web com cobertura, no máximo 2 workers; `npx eslint .` com cwd em `web/` e `pnpm exec prettier --check web packages tools` e `pnpm run docs:check` verdes; commits com `git -C /home/rodrigoisensee/MetricasDSPD-052f add <arquivos>` e `git -C /home/rodrigoisensee/MetricasDSPD-052f commit -m <mensagem> -m 'Cartão: K-221' -- <arquivos>` (sem heredoc e sem pipe); push com `git -C /home/rodrigoisensee/MetricasDSPD-052f push origin HEAD:refs/heads/feature/070-simulado-por-cartao`; sem PR.
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
- 2026-11-04 21:54: E1.1 cumprida pelo software-architect: docs/analises/070-desenho.md e ADR 0028 (proposta), sem commit. Simulado só no navegador (mock no Web Worker da ADR 0021), a API nunca devolve número simulado; resposta sem-dado-real ganha o campo opcional simulavel; o real sempre ganha; selo falha fechado (mock com erro volta a "Sem dado real"); sem gatilho de segurança. Lotes: L1 node-backend (contrato e campo simulavel), L2 react-frontend (depois do L1), L3 E2E e desempenho com o QA. Perguntas Q-070-1 a Q-070-6: Q-070-2 (faixas e Resumo) e Q-070-6 (Visão Geral) respondidas pela decisão do dono de cartão simulado fora do resumo; Q-070-1, Q-070-3, Q-070-4 e Q-070-5 viram as suposições S1 a S3 (propostas conservadoras do desenho, não bloqueiam o L1). DECISÃO TÉCNICA (Jarvis): L1 do node-backend começa já; a ADR 0026, que a 0028 revê, está só na worktree 052b sem commit: entra na develop junto com a 0028 no PR do L1 (cópia do arquivo sem mudança de texto).
- 2026-11-04 22:53: QA do L1 aprovado: docs/qa/070-l1.md (commit c7c7efe, cita cb1a80d); server 1680 testes, pacotes com cobertura, eslint de server e contratos rc 0, a API nunca devolve número simulado; A1 recomendado: a ADR 0028 e o desenho ainda dizem proposta. DECISÃO TÉCNICA (Jarvis): o L2 do react-frontend começa na mesma branch (worktree 052f), sobre c7c7efe, com a especificação do selo validada pelo dono e as decisões do dono sobre o resumo; o status da ADR 0028 passa a aceita no PR do 070, com o software-architect. O PR do L1 não sai sozinho: L1 e L2 vão num PR só, como o desenho diz (um ramo só).
### Restrições
- O agente não abre, lê nem edita arquivos `.env*` e não chama as APIs externas.
- Regras invioláveis do CLAUDE.md: nenhuma métrica individual (nem simulada), BusinessMap e Acelerato nunca se misturam, real e simulado nunca no mesmo gráfico ou número, todo cálculo pela biblioteca compartilhada.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: `server/`, `packages/contratos/`, as ADRs, o desenho, a especificação do UX, outras worktrees, o `CLAUDE.md`, os arquivos `.env*` e a `main`.

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
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052f diff --name-only c7c7efe origin/feature/070-simulado-por-cartao -- web` · espera: linhas>=1

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).