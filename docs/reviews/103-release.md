---
tipo: review
contrato: 1
pedido: 103-release-2026-11-13
branch: docs/103-release
commit: 6195b23f949e9ea18430fe88f4d991a79d17c09c
parecer: aprovado
revisor: tech-lead
data: 2026-11-13
---

# Code review: release 103 (develop em 6195b23f contra a homolog)

Escopo: `git log --first-parent origin/homolog..6195b23f`, 18 PRs (#361 a #376, #378 e #379) sobre a homolog em 0528ffbd (release 101, PR 359 na `main`); 194 arquivos, +5197 −606, dos quais 114 fora de `docs/` e `.md` (+2594 −337). Etapa E1.1 do pedido `103-release-2026-11-13`. Ficam fora os PRs 377 (K-286) e 380 (K-313), abertos e fora da `develop`. Cada PR teve review, QA e, quando a classe pediu, segurança próprios (`docs/reviews/099-*`, `docs/reviews/102-*`); este parecer lê a release como um todo e não refaz os itens.

## Conferências

- **Diff por área:** biblioteca (`packages/metricas`: índice do Acelerato também em horas corridas, S1 pela unidade do alvo de cada célula, S12 com volume real, versão de critério do S12), servidor (carregador dos alvos no `ac:ref-sync`, turnos no `ref:sync-calendario`, de-para de severidade no `bm:ref-sync` e no projetor, `data_acordada` do deadline, O25 e S12 no mapa real, nomes exatos da lista fechada do Acelerato, mensagens de variável de ambiente sem valor), contratos (unidade do alvo, `horasPorDiaUtil`, nota do S12, `sem-dado`), web (S1, S9 e textos do dia útil, S12, catálogo), consultas só de leitura (B6-a e Q-RO-1), CI (lint do servidor), testes e documentos.
- **Migrações:** uma, a 0036 (`server/migrations/0036_ac_alvo_prioridade_unidade.ts`), com `checksums.json` atualizado e `down` que recusa sem mudar nada se houver unidade `corrido` gravada. A migração a partir da `main` é do portão da homolog (E1.5).
- **Contrato:** D3 torna obrigatória a `unidade` dos prazos no S1 (incompatível, aceite de uso único no #363 e #364, único consumidor a web deste repositório); D3b, D9 e K-296 são aditivos ou troca de valor do estado de origem sem consumidor externo. Registrado em "Mudanças que quebram".
- **Critério de cálculo (T2.6):** S12 com `criterio-2026-11-12-s12-volume-real` na biblioteca; D3 (S1 e Visão geral), D3b (calendário do Acelerato) e C8a (O16) gravam a versão ao carregar a referência, então a data é a do dia em que o dono roda a carga. Por isso as cargas vão no CHANGELOG como ações do dono, em ordem.
- **Regras invioláveis:** BusinessMap e Acelerato seguem separados (o dia útil de 528 min vale só no calendário do Acelerato; o BusinessMap segue com 8 h; severidade do fluxo vem só do BusinessMap); nenhum cálculo fora da biblioteca; nada simulado volta à web (G1 e G2 ajustadas no K-294); texto livre do Acelerato recusado na fronteira (D1a, K-305). Sem ranking nem comparação entre times.
- **Pessoa e segredo:** K-304 e K-311 imprimem só nomes de variável, nunca valor. Segurança da release é da E1.2; cito, não refaço.
- **Pareceres das junções fora da develop:** o review da junção do K-315 e K-306 (`docs/reviews/099-k315-k306-projetor-pg.md`, revalidado no 33edc8d5) entra nesta branch por cherry-pick de b4803d6e, da branch remota `fix/k315-k306-projetor-pg`; a segurança da junção sobe pela E1.2.
- **CI:** PR 378 com todos os checks verdes no head 33edc8d5 (inclui `e2e`, `e2e-parte` 1/2 e 2/2, `banco`). PR 379 mesclado às 17:34 com `testes`, `banco` e `e2e-parte` pendentes (runs 43474075454 e 43474083748) e o `filtro` do run de push vermelho; o CI do push na `develop` em 6195b23f (run 43474099226) estava na fila no momento deste review.
- **CHANGELOG:** os 18 PRs do range citados em [Não publicado] (conferido por script, número a número), com a seção nova "Ações do dono na base real depois desta release": `db:migrate`, `ref:sync-calendario`, `ac:ref-sync`, `bm:ref-sync`, `coleta ac --reconhecer-mudanca` e a coleta.
- **Quadro:** o `forge-check proximo` aponta o bloqueio "K-315 na develop", mas o K-315 está na `develop` pelo #378 (432dda3d); falta só mover o cartão no `KANBAN.md` (Jarvis).

## Achados

- A1 (recomendado) CHANGELOG.md:72 · O #379 (K-316) foi mesclado com testes, banco e e2e-parte pendentes; o código só muda um teste de tempo, mas o primeiro CI completo sobre 6195b23f é o do push (run 43474099226) ou o QA (E1.3). A E1.5 só segue com esse CI verde.
- A2 (recomendado) CHANGELOG.md:72 · Classe recorrente (merge com checks rodando: release 100 A2 e A4, release 101 A1, agora #379). A linha `AR-<n>` em `docs/engineering/achados-recorrentes.md` fica pendente: o arquivo não existe e está fora da lista do brief.

## Parecer

Aprovado sobre a develop em 6195b23f. A release pode seguir para a homolog quando o CI do push em 6195b23f estiver verde e os pareceres de QA (E1.3) e segurança (E1.2) desta release estiverem gravados; o meu não depende deles.
