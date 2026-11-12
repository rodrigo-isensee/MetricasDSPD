Agente destino: forge:qa-engineer
Pedido: 099-nenhuma-metrica-simulada
Tipo: qa
Branch: fix/099-l4-textos-sem-simulado   Base: develop   Base-sha: 96d9b69f1c8b5c5a264047e4eccd0f56eb5310f1
Etapa: qa   Cobre: E3.11
Revisar-sha: 1525bed8cb23d14bd18175a05697695780ff489a

## Objetivo
O PR 347 (L4 do 099) passou em todos os checks no head 15a34f64; depois do `update-branch` com a develop (que recebeu o PR 344, L7a e L7b do 097), o head b125e941 reprovou no e2e: `e2e/tests/operacional-lote3.spec.ts:142` (L3-08), axe `target-size` (serious) no 3º link de `div[data-testid="leia-junto-o15"]`, também no retry (run 43156161503). O L4 não toca o leia-junto nem o Operacional. O CI de push da develop pula o e2e, então a develop pode já estar com a falha.

## Ler
- `gh run view 43156161503 --log-failed` (ou o log do job 130976470195 pela API).
- `e2e/tests/operacional-lote3.spec.ts` (linhas 130 a 160) e o componente do leia-junto do Operacional.

## Entregar
- "E3.11 (qa-engineer): diagnóstico do e2e L3-08 (axe target-size no leia-junto-o15 do Operacional) que reprovou o PR 347 depois da atualização com a develop: reproduzir no head do PR e na develop, achar o commit que trouxe a falha e relatar." (E3.11)
- (E3) (E3.11) Na worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041b`, sem editar código: rodar o spec L3-08 no Playwright (projeto do CI) no head da develop atual e no 15a34f64 (por `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b worktree`-free: use `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b stash` não; use `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b checkout --detach` para cada sha e volte à branch `fix/099-l4-textos-sem-simulado` no fim, com `git status` vazio). Se a develop falha, achar o commit que trouxe a falha (entre 96d9b69f e a develop atual) e o arquivo; se só o PR falha, explicar a combinação. Gravar o diagnóstico em `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/qa/bugs/099-e2e-l3-08-target-size.md` (novo), pela ferramenta Write, com passos para reproduzir, o commit culpado e o dono provável da correção; sem commit. Nada contra a base real nem `.env*`.
- (E1) (E2) (E4) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/qa/bugs/099-e2e-l3-08-target-size.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 099-nenhuma-metrica-simulada até 967be5645c9bda0e509df2bf6ecb5085e03fbf1f3b49edd9968a74fa2952fa93 (6 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/099-nenhuma-metrica-simulada.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0030, ADR 0026, ADR 0028, ADR 0023
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): varredura E1 e proposta por item (E2) e da guarda (E3), sem ler a base real." · etapa de outra delegação; continua no pedido
- "E2.1 (react-frontend): L1, App.tsx sem o FonteComSimulado e testes de composição ajustados, na branch fix/099-l1-sem-simulador, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041b." · etapa de outra delegação; continua no pedido
- "E2.2 (software-architect): L0, ADR 0030 que revoga a 0028, e o plano de dado real de cada cartão simulado do Operacional." · etapa de outra delegação; continua no pedido
- "E2.3 (tech-lead): review do L1." · etapa de outra delegação; continua no pedido
- "E2.4 (qa-engineer): QA do L1." · etapa de outra delegação; continua no pedido
- "E2.5 (tech-lead): PR do L1 para a develop; o merge é do dono. - Cada portão (QA, segurança, review) commita e envia o próprio parecer na branch, como nos pedidos 092 a 097; o PR continua do tech-lead." · etapa de outra delegação; continua no pedido
- "E2.6 (react-frontend): L2a, tirar a opção simulado de useMetrica e dos cartões, na branch fix/099-l2a-sem-opcao-simulado, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041b." · etapa de outra delegação; continua no pedido
- "E2.7 (tech-lead): review do L2a." · etapa de outra delegação; continua no pedido
- "E2.8 (qa-engineer): QA do L2a." · etapa de outra delegação; continua no pedido
- "E2.9 (tech-lead): PR do L2a; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E2.10 (react-frontend): L2b, apagar FonteComSimulado.ts, simulado.ts, as exportações em data/index.ts e SemDadoRealErro.simulavel, com os testes desses arquivos, na branch fix/099-l2b-apaga-simulado, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041b." · etapa de outra delegação; continua no pedido
- "E2.11 (node-backend): L3, tirar do contrato simulavel, podeSimular e METRICAS_SEM_SIMULACAO, com testes, docs/api/metricas.md e o OpenAPI, na branch fix/099-l3-contrato-sem-simulavel, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041." · etapa de outra delegação; continua no pedido
- "E2.12 (tech-lead): review por lote do 099 (L2b em diante)." · etapa de outra delegação; continua no pedido
- "E2.13 (qa-engineer): QA por lote do 099 (L2b em diante)." · etapa de outra delegação; continua no pedido
- "E2.14 (tech-lead): PR e merge por lote do 099 na develop, pela autorização do dono de 17:51." · etapa de outra delegação; continua no pedido
- "E2.15 (react-frontend): L2b e L2c juntos (o selo importa o que o L2b apaga): além do L2b, tirar o selo Simulado da interface (SeloSimulado, ramos de CartaoMetrica, OrigemCartao.simulado, OrigemDosCartoes, StatusMeta, CartaoT3, tokens.css) com os testes do selo, e o simulavel de HttpFonteMetricas, na branch fix/099-l2b-apaga-simulado, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041b." · etapa de outra delegação; continua no pedido
- "E2.16 (ux-designer): L4, texto do catálogo (WB-1) e das 8 notas (OP-21, TA-16 a TA-18, ES-11, ES-12) sem falar em simulado, em docs/ux/099-textos-sem-simulado.md, para o react-frontend aplicar depois do L2b e L2c." · etapa de outra delegação; continua no pedido
- "E2.17 (ux-designer): revisão da interface implementada no L2b e L2c (selo Simulado removido; cartão sem dado real com "Sem dado real" e o motivo), em docs/ux/099-revisao-l2b-l2c.md." · etapa de outra delegação; continua no pedido
- "E2.18 (react-frontend): L4, aplicar na web os textos de docs/ux/099-textos-sem-simulado.md (catálogo WB-1 e as 8 notas), branch fix/099-l4-textos-sem-simulado a partir da develop, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041b." · etapa de outra delegação; continua no pedido
- "E2.19 (ux-designer): revisão da interface implementada no L4 (catálogo e notas sem simulado), em docs/ux/099-revisao-l4.md." · etapa de outra delegação; continua no pedido
- "E2.20 (react-frontend): L2d, o mock fora do build api (App.tsx com import() só no ramo VITE_FONTE=mock) e as guardas G1 (web/scripts/sem-mock.mjs no pronto da web) e G2 (lint) da ADR 0030, branch fix/099-l2d-mock-fora-do-build a partir da develop, worktree /home/rodrigoisensee/MetricasDSPD-052g." · etapa de outra delegação; continua no pedido
- "E3.1 (devops-engineer): um comando único para o dono rodar as consultas só de leitura dos pedidos 098 e 099 (PostgreSQL da demo e MySQL do Acelerato), que grava a saída num arquivo sem dado de pessoa, na branch chore/consultas-leitura-098-099, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041." · etapa de outra delegação; continua no pedido
- "E3.2 (security-engineer): parecer de segurança do comando (lê o .env e os bancos reais, só leitura)." · etapa de outra delegação; continua no pedido
- "E3.3 (tech-lead): review e PR do comando; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E3.4 (qa-engineer): QA do comando (classe N pelo gatilho do package.json)." · etapa de outra delegação; continua no pedido
- "E3.5 (devops-engineer): K-277, o comando de consultas de leitura recusa U&, UESCAPE e os prefixos pg_ e lo_ na lista de palavras (A5 da segurança), na branch fix/k277-consultas-escape a partir da develop, worktree /home/rodrigoisensee/MetricasDSPD-052g." · etapa de outra delegação; continua no pedido
- "E3.6 (security-engineer): revalidação de segurança do K-277." · etapa de outra delegação; continua no pedido
- "E3.7 (qa-engineer): QA do K-277." · etapa de outra delegação; continua no pedido
- "E3.8 (tech-lead): review, PR e merge do K-277 na develop, pela autorização do dono de 17:51." · etapa de outra delegação; continua no pedido
- "E3.9 (devops-engineer): K-281, o comando de consultas de leitura recusa query_to_xml, query_to_xmlschema, query_to_xml_and_xmlschema, ts_stat e ts_rewrite (A6 da segurança do K-277) e ganha a sonda U&"x" sem UESCAPE (A1 do review), na branch fix/k281-consultas-funcoes a partir da develop, worktree /home/rodrigoisensee/MetricasDSPD-052g." · etapa de outra delegação; continua no pedido
- "E3.10 (qa-engineer): L5, as guardas G3 (e2e chromium-api) e G4 (Vitest do painel sem dado real) da ADR 0030, a leitura vermelha da G1 e da G3 na develop e a troca dos specs que ainda esperam o selo (simulado-070-l3 e perf-api:181), branch test/099-l5-guardas a partir da develop, worktree /home/rodrigoisensee/MetricasDSPD-056d." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `grep -c 'commit' /home/rodrigoisensee/Metricas/MetricasDSPD/docs/qa/bugs/099-e2e-l3-08-target-size.md` · espera: contém '1'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
