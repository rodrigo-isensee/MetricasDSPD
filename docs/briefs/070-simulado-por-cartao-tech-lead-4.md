Agente destino: forge:tech-lead
Pedido: 070-simulado-por-cartao
Tipo: codigo
Branch: feature/070-simulado-por-cartao   Base: develop   Base-sha: 97ec7af9055f247297ecdedda910cbac54562d72
Etapa: codigo   Cobre: E1.9

## Objetivo
Trazer a develop (com o L9-a do 069, PR 225) para a branch do 070 sobre a ponta 518ae82b00bdb8f1735a87818578fd8f264768d7 e resolver o conflito em `packages/contratos/src/origem.test.ts`, antes do review, do QA e da revisão de interface da volta 1 (pedido 070, E1.9, K-221). Worktree `/home/rodrigoisensee/MetricasDSPD-052f`, branch `feature/070-simulado-por-cartao`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052f log --oneline 518ae82b00bdb8f1735a87818578fd8f264768d7..origin/develop` e `git -C /home/rodrigoisensee/MetricasDSPD-052f diff 518ae82b00bdb8f1735a87818578fd8f264768d7...origin/develop -- packages/contratos/src/origem.ts packages/contratos/src/origem.test.ts web/src/components/ui/CartaoMetrica.tsx` (o que o L9-a mudou nos arquivos que o 070 também muda).

## Entregar
- "E1.9 (tech-lead): trazer a develop para a branch do 070 e resolver o conflito, sem PR, antes do review, do QA e da revisão de interface da volta 1." (E1.9)
- (E1, E2, E3) (E1.9) sem PR: `git -C /home/rodrigoisensee/MetricasDSPD-052f pull --ff-only origin feature/070-simulado-por-cartao`; `git -C /home/rodrigoisensee/MetricasDSPD-052f merge --no-ff origin/develop`; resolver o conflito em `packages/contratos/src/origem.test.ts` mantendo os testes dos dois lados (o do L9-a e o do 070) e conferir, sem conflito marcado, que `packages/contratos/src/origem.ts`, `web/src/components/ui/CartaoMetrica.tsx`, `CartaoS2.tsx` e `CartaoS3.tsx` ficaram com as mudanças dos dois lados; com no máximo 2 workers, vitest de `packages/contratos` e do web com cobertura, `npx eslint .` com cwd em `web/`, `pnpm exec prettier --check web packages tools` e `pnpm run docs:check` verdes; commit do merge com `git -C /home/rodrigoisensee/MetricasDSPD-052f commit --no-edit`; push com `git -C /home/rodrigoisensee/MetricasDSPD-052f push origin HEAD:refs/heads/feature/070-simulado-por-cartao`; sem PR e sem mudar nada além da resolução.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "Não consigo deixar os dados reais nas que já são possíveis fazer e nas que não deixar mocado?" e, ao recibo ("vou fazer: painel com dado real só com o real; sem dado real, o simulado com o selo Simulado visível; ADR nova revendo a 0026; não vou fazer: misturar real e simulado no mesmo gráfico, misturar BusinessMap e Acelerato, simulado em métrica individual; a troca é por cartão"), respondeu "Sim": dado simulado por cartão onde ainda não há dado real, com selo visível.
- DECISÃO DO DONO (2026-11-04): "A" (validação do protótipo docs/ux/070-selo-simulado/prototipo.html): protótipo aprovado como está (selo no cabeçalho, faixa com "O que é simulado?", borda tracejada, marca d'água, prefixo "Exemplo:"); ponto de compromisso do 070.
- DECISÃO DO DONO (2026-11-04): "A" (cartão simulado no resumo): o cartão com dado simulado fica fora de "O que pede atenção agora" e da Visão geral; só aparece na própria aba, com o selo; o resumo mostra só dado real.
### ADRs citadas no Histórico deste pedido (não no registro 064)
- ADR 0026 (citada no pedido): revista pela 0028
- ADR 0028 (citada no pedido): a decisão que este lote implementa
- ADR 0021 (citada no pedido): o simulado roda no Web Worker dela, só no navegador; nada muda nela
### Do Histórico deste pedido, docs/pedidos/070-simulado-por-cartao.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-05 00:40: Volta 1 entregue e develop em conflito: o react-frontend corrigiu os sete achados em 518ae82b00bdb8f1735a87818578fd8f264768d7 (StatusMeta some no cartão simulado pelo ProvedorCartaoSimulado, com teste que falhou antes; selo com role img e a frase completa; sigla tirada só no motivo da faixa do simulado, na web, porque motivoDaOrigemMock está em packages/; marca d'água só no gráfico; botão com min-h-11; HORA_DE_CORTE vinda do mock por import dinâmico; CartaoEI sem pedido de simulado; web 1467 testes com cobertura 100%). A develop recebeu o L9-a (PR 225, 27ab54638be12c2f396fd59c6ae74b85e763327d), que muda arquivos do 070; o merge dá conflito só em packages/contratos/src/origem.test.ts. DECISÃO TÉCNICA (Jarvis): o tech-lead traz a develop para a branch do 070 e resolve o conflito mantendo os testes dos dois lados, antes do novo review, QA e revisão de interface, para que os pareceres saiam sobre a ponta com a develop.
- 2026-11-05 00:42: Entrega da volta 1 do react-frontend conferida como não cumprida só pelo intervalo: PQ-1 e PQ-2 cumpriram (518ae82 no remoto, 8 arquivos de web, os sete achados com commit e teste); o conferente contou 7 arquivos do L1 (2b026ea, cb1a80d), que não têm entrega conferida, e o forge-check entrega recusa juntar o brief do node-backend. Brief do preparo do merge reprovado: citava a E1.8 (PR e merge) para um preparo sem PR. DECISÃO TÉCNICA (Jarvis): sem volta ao react-frontend, o trabalho dele cumpriu; etapa nova E1.9 (tech-lead) para trazer a develop e resolver o conflito, sem PR; a E1.8 fica para depois do review, do QA e da revisão de interface.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*`, não chama as APIs externas e não roda nada contra a base real.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: código e testes além da resolução do conflito, os pareceres, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho de como o cartão escolhe real ou simulado (quais métricas estão sem dado real hoje, de onde vem o simulado, contrato da API) e a ADR nova que revê a 0026." · etapa de outra delegação; continua no pedido
- "E1.2 (ux-designer): especificação do selo "Simulado" e do texto de explicação, com protótipo para o dono validar." · etapa de outra delegação; continua no pedido
- "E1.3 (node-backend): implementação na API." · etapa de outra delegação; continua no pedido
- "E1.4 (react-frontend): implementação nos cartões." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): code review." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface." · etapa de outra delegação; continua no pedido
- "E1.6 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- "E1.8 (tech-lead): PR para a develop e merge." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052f merge-base --is-ancestor 27ab54638be12c2f396fd59c6ae74b85e763327d origin/feature/070-simulado-por-cartao` · espera: rc=0
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052f grep -c '^<<<<<<<' origin/feature/070-simulado-por-cartao -- packages web` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).