Agente destino: forge:tech-lead
Pedido: 099-nenhuma-metrica-simulada
Tipo: merge
Branch: fix/099-l2d-mock-fora-do-build   Base: develop   Base-sha: d4edc6d1c4b545daeda51ecf02533808fc9c80a2
Etapa: pr   Cobre: E2.14

## Objetivo
PR e merge do L2d do pedido 099 na develop (o mock fora do build api, com as guardas G1 e G2). Branch `fix/099-l2d-mock-fora-do-build`, worktree `/home/rodrigoisensee/MetricasDSPD-052g`, código 4bbc8f94; segurança (8694356e), QA (308e864f) e review (49435166) aprovados. Pela ADR 0030, o merge do L2d vem depois do L5 (branch `test/099-l5-guardas`, que traz a linha de Leituras), e o L5 entra depois do L4 (PR 347). Merge até a homolog pela autorização do dono de 17:51.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052g log --oneline origin/develop..origin/fix/099-l2d-mock-fora-do-build` (os commits).

## Entregar
- "E2.14 (tech-lead): PR e merge por lote do 099 na develop, pela autorização do dono de 17:51." (E2.14) Nesta delegação, o PR e o merge do L2d.
- (E2) (E2.14) Abrir o PR para a `develop` (squash) já, depois do `forge-check pr 099-nenhuma-metrica-simulada --raiz-pedidos /home/rodrigoisensee/Metricas/MetricasDSPD --ref origin/fix/099-l2d-mock-fora-do-build --base develop` aprovado (se não, pare e relate); corpo por Write no scratchpad e `--body-file` (os três pareceres, os desvios aceitos, os achados no cartão K-294, a linha `teto: excedido, 330 linhas, mock fora do build e as duas guardas`, `Cartão: K-275`). Só mesclar quando `gh pr list --head test/099-l5-guardas --state merged` mostrar o L5 mesclado; esperar em laços de até 170 s (`timeout --foreground` e `< /dev/null` em cada gh), por até 3 horas; se o L5 não entrar nesse prazo, pare e relate com o PR aberto. Um PR de cada vez na develop; imediatamente antes do merge, `gh pr view fix/099-l2d-mock-fora-do-build --json mergeStateStatus,headRefOid`: só com CLEAN; se BEHIND, `gh pr update-branch fix/099-l2d-mock-fora-do-build` e esperar os checks do head novo. Merge num comando sozinho: `gh pr merge fix/099-l2d-mock-fora-do-build --squash --match-head-commit` seguido do sha completo, nunca `--admin`. Se um check falhar ou a permissão for negada, pare e relate. Depois, CI verde na develop com o merge.
- (E1) (E3) (E4) Nada a entregar aqui: não nesta delegação.
- arquivos: web/ (escopo da entrega revisada; esta delegação não edita arquivo)

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 099-nenhuma-metrica-simulada até 967be5645c9bda0e509df2bf6ecb5085e03fbf1f3b49edd9968a74fa2952fa93 (6 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/099-nenhuma-metrica-simulada.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0030, ADR 0026, ADR 0028, ADR 0023
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, pareceres, outras worktrees, a `homolog` e a `main`; o único merge é o do PR desta delegação, na `develop`, com os checks verdes.

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

## Pronto quando
- PQ-1 (cmd): `gh pr view fix/099-l2d-mock-fora-do-build --json state` · espera: contém 'MERGED'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
