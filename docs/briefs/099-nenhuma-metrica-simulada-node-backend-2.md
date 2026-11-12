Agente destino: forge:node-backend
Pedido: 099-nenhuma-metrica-simulada
Tipo: codigo
Branch: feature/099-d3-alvo-prioridade   Base: develop   Base-sha: ea826a9ca695f84e810387ff85ea86befa997d1f
Etapa: codigo   Cobre: E3.15

## Objetivo
O S1 precisa dos prazos em `dspd_ac.ref_alvo_prioridade` (0 linhas, sem carregador). O dono decidiu os prazos (Q-099-5a) e a unidade (Q-099-11). Lote D3.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/099-dado-real-operacional.md` (linhas OP-13 e D3).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/099-proc-sla-incidentes.md` (§1 e §5.2, Q-099-11).

## Entregar
- "E3.15 (node-backend): lote D3 do plano de dado real, o carregador versionado de ref_alvo_prioridade com os prazos da Q-099-5a e a unidade por célula da Q-099-11, branch feature/099-d3-alvo-prioridade, worktree /home/rodrigoisensee/MetricasDSPD-052g; merge depois da release 101." (E3.15)
- (E3) (E3.15) Antes de editar: `git -C /home/rodrigoisensee/MetricasDSPD-052g fetch origin develop` e `git -C /home/rodrigoisensee/MetricasDSPD-052g switch --no-track -c feature/099-d3-alvo-prioridade origin/develop` (se o config.lock antigo deixar a troca pela metade, `git -C /home/rodrigoisensee/MetricasDSPD-052g diff --cached --quiet feature/099-d3-alvo-prioridade` sai 0 e então `git -C /home/rodrigoisensee/MetricasDSPD-052g switch feature/099-d3-alvo-prioridade`; sem remover o lock, stash ou reset). Arquivo versionado em `docs/architecture/fontes/` com os 10 prazos (P1 15 min e 4 h; P2 30 min e 8 h; P3 2 h e 2 dias; P4 4 h e 5 dias; P5 1 dia e 10 dias), a unidade de cada célula (corrido em P1 e no primeiro atendimento de P2; útil nas outras) e a fonte (briefing §3.4 e PROC 30.000.010 v002); carregador pelo papel `dspd_ref`, no molde do calendário, com vigência e entrada em `ref_versao_criterio` (T2.6, afeta S1). Se a tabela não tiver onde guardar a unidade por célula, pare e relate antes de criar migração (decisão do arquiteto). Testes do carregador (vermelho antes do verde), sem rodar nada contra a base real. Só testes tocados, typecheck e eslint dos arquivos; a suíte é do CI. Commit com `Cartão: K-275` (por `git commit -F` de arquivo gravado por Write no scratchpad com nome próprio, `git add` explícito) e push em segundo plano com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052g push origin HEAD:refs/heads/feature/099-d3-alvo-prioridade` (`github.com` em allowed_domains). Sem PR, sem merge.
- (E1) (E2) (E4) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/architecture/fontes/, server/src/, server/tests/, package.json, server/package.json

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 099-nenhuma-metrica-simulada até 3d3b57259067240d3a328daedfb7ef243dfb91b621a46b2eb8786f685b1072cf (13 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/099-nenhuma-metrica-simulada.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0030, ADR 0026, ADR 0028, ADR 0023
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: arquivos fora da lista `- arquivos:` (outro arquivo necessário: pare e relate antes), os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): varredura E1 e proposta por item (E2) e da guarda (E3), sem ler a base real." · etapa de outra delegação; continua no pedido
- "E2.1 (react-frontend): L1, App.tsx sem o FonteComSimulado e testes de composição ajustados, na branch (resumo)." · etapa de outra delegação; continua no pedido
- "E2.2 (software-architect): L0, ADR 0030 que revoga a 0028, e o plano de dado real de cada cartão simulado do Operacional." · etapa de outra delegação; continua no pedido
- "E2.3 (tech-lead): review do L1." · etapa de outra delegação; continua no pedido
- "E2.4 (qa-engineer): QA do L1." · etapa de outra delegação; continua no pedido
- "E2.5 (tech-lead): PR do L1 para a develop; o merge é do dono. - Cada portão (QA, segurança, review) commita e envia o próprio parecer na branch, como nos pedidos 092 a 097; o PR continua do tech-lead." · etapa de outra delegação; continua no pedido
- "E2.6 (react-frontend): L2a, tirar a opção simulado de useMetrica e dos cartões, na branch fix/099-l2a-sem-opcao-simulado, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041b." · etapa de outra delegação; continua no pedido
- "E2.7 (tech-lead): review do L2a." · etapa de outra delegação; continua no pedido
- "E2.8 (qa-engineer): QA do L2a." · etapa de outra delegação; continua no pedido
- "E2.9 (tech-lead): PR do L2a; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E2.10 (react-frontend): L2b, apagar a fonte simulada (absorvido pelo E2.15, PR 342)." · etapa de outra delegação; continua no pedido
- "E2.11 (node-backend): L3, tirar do contrato simulavel, podeSimular e METRICAS_SEM_SIMULACAO, com testes, (resumo)." · etapa de outra delegação; continua no pedido
- "E2.12 (tech-lead): review por lote do 099 (L2b em diante)." · etapa de outra delegação; continua no pedido
- "E2.13 (qa-engineer): QA por lote do 099 (L2b em diante)." · etapa de outra delegação; continua no pedido
- "E2.14 (tech-lead): PR e merge por lote do 099 na develop, pela autorização do dono de 17:51." · etapa de outra delegação; continua no pedido
- "E2.15 (react-frontend): L2b e L2c juntos, a web sem fonte simulada nem selo Simulado (feito, PR 342)." · etapa de outra delegação; continua no pedido
- "E2.16 (ux-designer): L4, texto do catálogo (WB-1) e das 8 notas (OP-21, TA-16 a TA-18, ES-11, ES-12) sem falar em (resumo)." · etapa de outra delegação; continua no pedido
- "E2.17 (ux-designer): revisão da interface implementada no L2b e L2c (selo Simulado removido; cartão sem dado real com (resumo)." · etapa de outra delegação; continua no pedido
- "E2.18 (react-frontend): L4, aplicar na web os textos de docs/ux/099-textos-sem-simulado.md (catálogo WB-1 e as 8 (resumo)." · etapa de outra delegação; continua no pedido
- "E2.19 (ux-designer): revisão da interface implementada no L4 (catálogo e notas sem simulado), em docs/ux/099-revisao-l4.md." · etapa de outra delegação; continua no pedido
- "E2.20 (react-frontend): L2d, o mock fora do build api (App.tsx com import() só no ramo VITE_FONTE=mock) e as guardas G1 (web/scripts/sem-mock.mjs no pronto da web) e G2 (lint) da ADR 0030, branch fix/099-l2d-mock-fora-do-build a partir da develop, worktree /home/rodrigoisensee/MetricasDSPD-052g." · etapa de outra delegação; continua no pedido
- "E2.21 (security-engineer): parecer de segurança do L2d (gatilho: web/package.json; o pronto da web ganha um passo)." · etapa de outra delegação; continua no pedido
- "E2.22 (ux-designer): K-297, parte de UX: o texto do parágrafo do catálogo com a contagem que bate com o código (65 linhas, 62 códigos: 60 métricas, EI e PV1), na especificação docs/ux/099-textos-sem-simulado.md; o alinhamento do código vem depois, com o react-frontend." · etapa de outra delegação; continua no pedido
- "E3.1 (devops-engineer): comando único de consultas só de leitura dos pedidos 098 e 099 (feito, PR 329)." · etapa de outra delegação; continua no pedido
- "E3.2 (security-engineer): parecer de segurança do comando (lê o .env e os bancos reais, só leitura)." · etapa de outra delegação; continua no pedido
- "E3.3 (tech-lead): review e PR do comando; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E3.4 (qa-engineer): QA do comando (classe N pelo gatilho do package.json)." · etapa de outra delegação; continua no pedido
- "E3.5 (devops-engineer): K-277, o comando de consultas recusa U&, UESCAPE, pg_ e lo_ (feito, PR 338)." · etapa de outra delegação; continua no pedido
- "E3.6 (security-engineer): revalidação de segurança do K-277." · etapa de outra delegação; continua no pedido
- "E3.7 (qa-engineer): QA do K-277." · etapa de outra delegação; continua no pedido
- "E3.8 (tech-lead): review, PR e merge do K-277 na develop, pela autorização do dono de 17:51." · etapa de outra delegação; continua no pedido
- "E3.9 (devops-engineer): K-281, o comando de consultas recusa 5 funções que executam texto como SQL (feito, PR 343)." · etapa de outra delegação; continua no pedido
- "E3.10 (qa-engineer): L5, as guardas G3 (e2e chromium-api) e G4 (Vitest do painel sem dado real) da ADR 0030, a (resumo)." · etapa de outra delegação; continua no pedido
- "E3.11 (qa-engineer): diagnóstico do e2e L3-08 do PR 347 (feito: instabilidade, K-292)." · etapa de outra delegação; continua no pedido
- "E3.12 (react-frontend): K-292, espaçamento vertical entre os links do leia-junto do Operacional para o alvo de toque (resumo)." · etapa de outra delegação; continua no pedido
- "E3.13 (react-frontend): K-290, ajustes depois do L4 (contagem do parágrafo do catálogo, origemDaMetrica sem o estado (resumo)." · etapa de outra delegação; continua no pedido
- "E3.14 (react-frontend): K-285, estado sem dado real (motivo a 14 px no NumeroChave, faixa de selos sem espaço vazio, role=status; B-2 a B-4 da revisão de UX do L2b e L2c; o B-1 saiu, ver histórico), branch fix/k285-sem-dado-real-ux, worktree /home/rodrigoisensee/MetricasDSPD-052c." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052g log --oneline -1 origin/feature/099-d3-alvo-prioridade` · espera: contém 'D3'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
