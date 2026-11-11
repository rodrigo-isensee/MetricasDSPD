# Pedido 096: passo de critérios do apontamento carrega o .env sozinho

- **Modo:** implementar
- **Objetivo:** na implantação do apontamento, `pnpm --filter @metricas-dspd/server exec tsx src/entradas/criterios-apontamento.ts <data>` falha com "Configuração inválida (variáveis: PG_MIGRADOR_URL)" porque não lê o .env, ao contrário do db:migrate e dos bm:*. O dono precisou carregar o .env à mão. Criar um script do pacote que carregue o .env do mesmo jeito dos bm:* e corrigir o roteiro de implantação do 089 para usá-lo.
- **Clareza:** 0 confirmado; 2 técnico; 0 suposição; 0 perguntas
- **Origem:** relato da sessão "WSL ativação" ao implantar o apontamento a pedido do dono (2026-11-11 12:37).

## Escopo
- E3. K-271: robustez da entrada criterios-apontamento (recomendados da segurança e do review do K-270) · `técnico`
- E1. Script `bm:criterios-apontamento` no `server/package.json`, carregando o .env como os bm:* já fazem, sem ler credencial no código · `técnico`
- E2. Roteiro de implantação do 089 passa a usar o script novo · `técnico`

## Etapas
- E1.1 (node-backend): script e roteiro, com teste de que o script existe e usa o mesmo carregador dos bm:*.
- E1.2 (tech-lead): review.
- E1.3 (qa-engineer): QA.
- Cada portão (QA, segurança, review) commita e envia o próprio parecer na branch, como nos pedidos 092 a 095; o PR continua do tech-lead (E1.4).
- E1.4 (tech-lead): PR para a develop; o merge é do dono.
- E1.5 (agile-coach): retrospectiva curta.
- E2.1 (node-backend): K-271, recomendados da segurança (A1 erro do banco só pela categoria; A2 data por dataCivilValida e quantidade de argumentos) e do review (A2 uso com o nome do script; A3 teste do ramo não ENOENT) na entrada criterios-apontamento, na branch fix/k271-criterios-robustez, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041b.
- E2.2 (tech-lead): review do K-271.
- E2.3 (qa-engineer): QA do K-271.
- E2.4 (tech-lead): PR do K-271; o merge é do dono.
- E1.6 (security-engineer): parecer de segurança (gatilho: server/package.json e leitura do .env).

## Fora do escopo
- Rodar o script contra a base real (é do dono) · `técnico`
- Subir api e web da demo · `técnico`

## Suposições

## Perguntas na fila

## Histórico
- 2026-11-11 12:37: pedido aberto pelo Jarvis (K-270).
- 2026-11-11 12:41: brief selado docs/briefs/096-criterios-apontamento-env-node-backend-1.md 5bad2dfaafa413a40dc8e49ae6812fadb6a9280a4f4ff10ff94b8ad06804eecc
- 2026-11-11 12:52: entrega conferida 3316cce9582e2c8aeda9180c60fc453aa123f4b0
- 2026-11-11 12:53: E1.1 entregue pelo node-backend (3316cce9; pronto rc=0; teste novo com 3 casos, sem base real nem .env de verdade) e entrega conferida. Classe N (gatilho de segurança: server/package.json): review, QA e segurança. DECISÃO TÉCNICA (Jarvis): E1.6 acrescentada (segurança); como só uma delegação escreve por branch, os portões rodam em sequência: QA, segurança, review.
- 2026-11-11 12:54: brief selado docs/briefs/096-criterios-apontamento-env-qa-engineer-2.md 07f3c8999d8c07970e03e486994c49b190975f001d9f448cc51b6343d9d8bbfc
- 2026-11-11 12:55: brief selado docs/briefs/096-criterios-apontamento-env-security-engineer-1.md b00419f2a96423e21fb665cbabfcc74ac8634dbea2c19d21324c2c08bb338277
- 2026-11-11 12:58: E1.3 QA aprovado, 0 bugs, sem achados (508823c3): 3 de 3, teste hermético, 2 mutantes mortos, roteiro do CHANGELOG sem a forma antiga. Próximo: E1.6 (segurança), depois E1.2 (review).
- 2026-11-11 12:57: brief selado docs/briefs/096-criterios-apontamento-env-tech-lead-1.md 789ba73989222cef7854ea6174bbe4d85594de1e645b407e555379b3c3b7e05a
- 2026-11-11 12:59: E1.6 segurança aprovada (1545a83e), sem bloqueante; sondas S1 a S3 sem vazar senha. A1 (pilha de erro do banco sem tratamento mostra host, porta e usuário; já existia) e A2 (data só por regex, sem dataCivilValida nem checagem de argumentos) recomendados ao node-backend: viram o cartão K-271. Próximo: E1.2 (review), quando o tech-lead terminar o PR do K-174.
- 2026-11-11 13:12: E1.2 review aprovado (554f3b15): carregador idêntico ao dos bm:*; 3 de 3; A1 (extrair o carregador repetido em 8 entradas), A2 (uso sem o nome do script) e A3 (ramo não ENOENT sem teste) recomendados, vão ao K-271. Próximo: E1.4 (PR).
- 2026-11-11 13:12: brief selado docs/briefs/096-criterios-apontamento-env-tech-lead-3.md 4ab79565962ccd25ce4ec4353c8419c76392dbc9604a6302e6ef364a5d30459a
- 2026-11-11 14:14: E1.4 PR 319 aberto pelo tech-lead (head 554f3b15, em dia com a develop): todos os checks verdes, inclusive e2e-parte 1/2 e 2/2 (o DNS do runner passou nesta rodada); CLEAN. O merge é do dono.
- 2026-11-11 14:47: DECLARAÇÃO DO DONO (literal): "mesclei tudo que tinha aberto". Na develop: PR 316 (K-174 lote 1), 317 (K-268), 318 (K-269, só o runs-on ubuntu-24.04; a correção do container 1049e819 e o parecer e5831b10 ficaram locais na 052h, sem push), 319 (K-270) e 320 (lote 9a); develop em f4c122f1.
- 2026-11-11 15:35: brief selado docs/briefs/096-criterios-apontamento-env-agile-coach-1.md fd753b391b4767da96faf8754a36316431ba15521ef7b5d3e05e98457ceea913
- 2026-11-11 15:36: E1.5 retrospectiva gravada (fc06440e, branch docs/retros-2026-11-11c, enviada): lead time cerca de 2 h 10 min (36 min até o último parecer, o resto foi espera do PR e da mescla); 0 devoluções; causa nova: o pedido não dizia quem envia o parecer de cada portão (vai ao Forge). Pedido fechado; os recomendados seguem no K-271.
- 2026-11-11 15:57: brief selado docs/briefs/096-criterios-apontamento-env-node-backend-3.md 32ce7a730d5e2ff54414f32ec9337f85ff4c311550361b2492b7bba74dd1677a
- 2026-11-11 16:16: entrega conferida 567634140ff377ac20e017ca68bd1f9e7be9df37
- 2026-11-11 16:16: E2.1 (K-271) entregue (56763414, enviado): erro do banco só pela categoria, data por dataCivilValida, argumento a mais recusado, uso com o nome do script, teste do ramo EACCES; falta do .env agora imprime "falhou: configuração: PG_MIGRADOR_URL". Entrega conferida. Classe N: QA e review. Próximo: QA.
- 2026-11-11 16:17: brief selado docs/briefs/096-criterios-apontamento-env-qa-engineer-4.md a4d1afe7c30cb022deb301df4dc303028c0a36c030e74b3082f5d22377cca2fb
- 2026-11-11 16:18: E2.3 QA do K-271 aprovado, 0 bugs (d39c5624): 8 de 8; nada de pilha, host, usuário ou segredo na saída; mutação de imprimir a pilha morta. Próximo: review.
- 2026-11-11 16:18: brief selado docs/briefs/096-criterios-apontamento-env-tech-lead-5.md 3ad6705c96b5c3314f8c983145543185da658b1917a548cbcd9599602cd86d7f
- 2026-11-11 16:21: E2.2 review do K-271 aprovado (343270ee): mesmo tratamento do ref-sync-apontamento, pool fecha no finally, testes sem vazar segredo; A1 recomendado (declarar no corpo do PR a troca da mensagem de falta do .env). Próximo: E2.4 (PR).
- 2026-11-11 16:21: brief selado docs/briefs/096-criterios-apontamento-env-tech-lead-7.md 05ad4a40ec54db9834925dd5861c651692f85d49e700486c3ceca7f8ca3e66fb
- 2026-11-11 16:37: E2.4 PR 325 (K-271) aberto; o dono atualizou a branch pelo GitHub (1d2267cf) e mesclou na develop (c7c3e092) com testes e e2e-parte ainda pendentes. Pedido 096 completo no código.
