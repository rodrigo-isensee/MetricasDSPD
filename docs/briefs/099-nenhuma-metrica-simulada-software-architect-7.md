Agente destino: forge:software-architect
Pedido: 099-nenhuma-metrica-simulada
Tipo: codigo
Branch: docs/jarvis-2026-10-23   Base: develop   Base-sha: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8
Etapa: codigo   Cobre: E2.2

## Objetivo
Onze cartões do Operacional só terão dado real depois que as pessoas criarem campos no BusinessMap (O8, O12, O14, O15, O16, O24) e no Acelerato (S5, S6, S7, S9, S11). O dono precisa de uma lista exata para repassar à equipe que configura as ferramentas (frentes WS1 e WS4, que não são código).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/099-dado-real-operacional.md` (as linhas desses 11 cartões).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/099-proc-sla-incidentes.md` (o que o PROC já resolve).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/briefing-execucao-metricas.md`: só as seções das frentes WS1 e WS4 (campos e parametrização).

## Entregar
- "E2.2 (software-architect): L0, ADR 0030 que revoga a 0028, e o plano de dado real de cada cartão simulado do Operacional." (E2.2) Nesta delegação, o roteiro de configuração para os 11 cartões.
- (E1) (E2) (E2.2) Escrever `docs/analises/099-campos-para-configurar.md` (novo), pela ferramenta Write, no repositório principal, em linguagem de quem configura a ferramenta (sem jargão de código): uma tabela por ferramenta (BusinessMap, Acelerato) com o campo, o tipo, os valores permitidos, em que momento do fluxo é preenchido, quem preenche, e quais cartões ele destrava; a ordem sugerida (o que destrava mais cartões primeiro); e como o time confere, depois, que o campo chegou à coleta (sem ler a base real: a consulta só de leitura que o dono roda). Nenhum campo de pessoa nem texto livre novo além do que o briefing pede. Sem commit.
- (E3) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/analises/099-campos-para-configurar.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 099-nenhuma-metrica-simulada até 125ff73356dbd97a31ffa0e5cef650a070a5ba52949550d675466b84b2a4d243 (4 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/099-nenhuma-metrica-simulada.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0030, ADR 0026, ADR 0028, ADR 0023
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): varredura E1 e proposta por item (E2) e da guarda (E3), sem ler a base real." · etapa de outra delegação; continua no pedido
- "E2.1 (react-frontend): L1, App.tsx sem o FonteComSimulado e testes de composição ajustados, na branch fix/099-l1-sem-simulador, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041b." · etapa de outra delegação; continua no pedido
- "E2.3 (tech-lead): review do L1." · etapa de outra delegação; continua no pedido
- "E2.4 (qa-engineer): QA do L1." · etapa de outra delegação; continua no pedido
- "E2.5 (tech-lead): PR do L1 para a develop; o merge é do dono. - Cada portão (QA, segurança, review) commita e envia o próprio parecer na branch, como nos pedidos 092 a 097; o PR continua do tech-lead." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (arquivo): `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/099-campos-para-configurar.md` · espera: existe e tem as duas tabelas
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
