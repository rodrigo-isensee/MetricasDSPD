# Pedido 096: passo de critérios do apontamento carrega o .env sozinho

- **Modo:** implementar
- **Objetivo:** na implantação do apontamento, `pnpm --filter @metricas-dspd/server exec tsx src/entradas/criterios-apontamento.ts <data>` falha com "Configuração inválida (variáveis: PG_MIGRADOR_URL)" porque não lê o .env, ao contrário do db:migrate e dos bm:*. O dono precisou carregar o .env à mão. Criar um script do pacote que carregue o .env do mesmo jeito dos bm:* e corrigir o roteiro de implantação do 089 para usá-lo.
- **Clareza:** 0 confirmado; 2 técnico; 0 suposição; 0 perguntas
- **Origem:** relato da sessão "WSL ativação" ao implantar o apontamento a pedido do dono (2026-11-11 12:37).

## Escopo
- E1. Script `bm:criterios-apontamento` no `server/package.json`, carregando o .env como os bm:* já fazem, sem ler credencial no código · `técnico`
- E2. Roteiro de implantação do 089 passa a usar o script novo · `técnico`

## Etapas
- E1.1 (node-backend): script e roteiro, com teste de que o script existe e usa o mesmo carregador dos bm:*.
- E1.2 (tech-lead): review.
- E1.3 (qa-engineer): QA.
- Cada portão (QA, segurança, review) commita e envia o próprio parecer na branch, como nos pedidos 092 a 095; o PR continua do tech-lead (E1.4).
- E1.4 (tech-lead): PR para a develop; o merge é do dono.
- E1.5 (agile-coach): retrospectiva curta.
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
