Agente destino: forge:react-frontend
Pedido: 099-nenhuma-metrica-simulada
Tipo: codigo
Branch: fix/k290-pos-l4   Base: develop   Base-sha: 287ff9b4f8d1112a4a37f39b4bcea862f9495f6c
Etapa: codigo   Cobre: E3.13

## Objetivo
K-290 do pedido 099: ajustes que o review e a UX do L4 deixaram (o L4 está na develop, PR 347).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/ux/099-revisao-l4.md` (achados baixos 1 e 2).
- O parecer de review do L4 na develop, por `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b show origin/develop:` seguido do caminho (pasta reviews de docs, arquivo 099-l4-textos-sem-simulado.md): A1 a A3.

## Entregar
- "E3.13 (react-frontend): K-290, ajustes depois do L4 (contagem do parágrafo do catálogo, origemDaMetrica sem o estado mock, COMP-12 exige Sem dado real no O17, docs/qa sem Fictícios), branch fix/k290-pos-l4, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041b; o merge espera a release 101." (E3.13)
- (E3) (E3.13) Na worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041b` (branch antiga já mesclada), `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b fetch origin develop` e `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b checkout -b fix/k290-pos-l4 origin/develop`; se falhar pelo config.lock, `git checkout` da branch e `git status` vazio; não remova o lock. (a) Contar as métricas do catálogo pelo código e alinhar o parágrafo, o comentário e o teste ao mesmo número (se o texto da especificação de UX precisar mudar, pare e relate). (b) `origemDaMetrica` em `packages/contratos/src/origem.ts` sem o estado `mock` nem o comentário de dado fictício, se nada de produção depender dele (senão relate). (c) COMP-12 em `e2e/tests/complementares.spec.ts:132` exige "Sem dado real" no O17. Rodar o Playwright do `complementares.spec.ts` (se o ambiente deixar), os testes da web e de contratos com `VITEST_MAX_WORKERS=2`, `format:check` e a cobertura da web em 100%. Commit com `Cartão: K-290` (por `git commit -F` de arquivo gravado por Write no scratchpad com nome próprio, `git add` explícito) e push em segundo plano com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b push -u origin HEAD:refs/heads/fix/k290-pos-l4` (`github.com` em allowed_domains); commit e push em chamadas separadas. Sem PR.
- (E1) (E2) (E4) Nada a entregar aqui: não nesta delegação.
- arquivos: web/, packages/contratos/, e2e/

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 099-nenhuma-metrica-simulada até 967be5645c9bda0e509df2bf6ecb5085e03fbf1f3b49edd9968a74fa2952fa93 (6 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/099-nenhuma-metrica-simulada.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0030, ADR 0026, ADR 0028, ADR 0023
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: arquivos fora da lista `- arquivos:` (outro arquivo necessário: pare e relate antes), os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`.

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
- "E2.10 (react-frontend): L2b, apagar a fonte simulada (absorvido pelo E2.15, PR 342)." · etapa de outra delegação; continua no pedido
- "E2.11 (node-backend): L3, tirar do contrato simulavel, podeSimular e METRICAS_SEM_SIMULACAO, com testes, docs/api/metricas.md e o OpenAPI, na branch fix/099-l3-contrato-sem-simulavel, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041." · etapa de outra delegação; continua no pedido
- "E2.12 (tech-lead): review por lote do 099 (L2b em diante)." · etapa de outra delegação; continua no pedido
- "E2.13 (qa-engineer): QA por lote do 099 (L2b em diante)." · etapa de outra delegação; continua no pedido
- "E2.14 (tech-lead): PR e merge por lote do 099 na develop, pela autorização do dono de 17:51." · etapa de outra delegação; continua no pedido
- "E2.15 (react-frontend): L2b e L2c juntos, a web sem fonte simulada nem selo Simulado (feito, PR 342)." · etapa de outra delegação; continua no pedido
- "E2.16 (ux-designer): L4, texto do catálogo (WB-1) e das 8 notas (OP-21, TA-16 a TA-18, ES-11, ES-12) sem falar em simulado, em docs/ux/099-textos-sem-simulado.md, para o react-frontend aplicar depois do L2b e L2c." · etapa de outra delegação; continua no pedido
- "E2.17 (ux-designer): revisão da interface implementada no L2b e L2c (selo Simulado removido; cartão sem dado real com "Sem dado real" e o motivo), em docs/ux/099-revisao-l2b-l2c.md." · etapa de outra delegação; continua no pedido
- "E2.18 (react-frontend): L4, aplicar na web os textos de docs/ux/099-textos-sem-simulado.md (catálogo WB-1 e as 8 notas), branch fix/099-l4-textos-sem-simulado a partir da develop, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041b." · etapa de outra delegação; continua no pedido
- "E2.19 (ux-designer): revisão da interface implementada no L4 (catálogo e notas sem simulado), em docs/ux/099-revisao-l4.md." · etapa de outra delegação; continua no pedido
- "E2.20 (react-frontend): L2d, o mock fora do build api (App.tsx com import() só no ramo VITE_FONTE=mock) e as guardas G1 (web/scripts/sem-mock.mjs no pronto da web) e G2 (lint) da ADR 0030, branch fix/099-l2d-mock-fora-do-build a partir da develop, worktree /home/rodrigoisensee/MetricasDSPD-052g." · etapa de outra delegação; continua no pedido
- "E2.21 (security-engineer): parecer de segurança do L2d (gatilho: web/package.json; o pronto da web ganha um passo)." · etapa de outra delegação; continua no pedido
- "E3.1 (devops-engineer): comando único de consultas só de leitura dos pedidos 098 e 099 (feito, PR 329)." · etapa de outra delegação; continua no pedido
- "E3.2 (security-engineer): parecer de segurança do comando (lê o .env e os bancos reais, só leitura)." · etapa de outra delegação; continua no pedido
- "E3.3 (tech-lead): review e PR do comando; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E3.4 (qa-engineer): QA do comando (classe N pelo gatilho do package.json)." · etapa de outra delegação; continua no pedido
- "E3.5 (devops-engineer): K-277, o comando de consultas recusa U&, UESCAPE, pg_ e lo_ (feito, PR 338)." · etapa de outra delegação; continua no pedido
- "E3.6 (security-engineer): revalidação de segurança do K-277." · etapa de outra delegação; continua no pedido
- "E3.7 (qa-engineer): QA do K-277." · etapa de outra delegação; continua no pedido
- "E3.8 (tech-lead): review, PR e merge do K-277 na develop, pela autorização do dono de 17:51." · etapa de outra delegação; continua no pedido
- "E3.9 (devops-engineer): K-281, o comando de consultas recusa 5 funções que executam texto como SQL (feito, PR 343)." · etapa de outra delegação; continua no pedido
- "E3.10 (qa-engineer): L5, as guardas G3 (e2e chromium-api) e G4 (Vitest do painel sem dado real) da ADR 0030, a leitura vermelha da G1 e da G3 na develop e a troca dos specs que ainda esperam o selo (simulado-070-l3 e perf-api:181), branch test/099-l5-guardas a partir da develop, worktree /home/rodrigoisensee/MetricasDSPD-056d." · etapa de outra delegação; continua no pedido
- "E3.11 (qa-engineer): diagnóstico do e2e L3-08 do PR 347 (feito: instabilidade, K-292)." · etapa de outra delegação; continua no pedido
- "E3.12 (react-frontend): K-292, espaçamento vertical entre os links do leia-junto do Operacional para o alvo de toque não oscilar no axe target-size (L3-08 instável), branch fix/k292-leia-junto-alvo, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b log -1 --format=%B origin/fix/k290-pos-l4` · espera: contém 'Cartão: K-290'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
