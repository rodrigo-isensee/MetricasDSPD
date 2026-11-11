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

## Pronto quando
- PQ-1 (arquivo): `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/099-campos-para-configurar.md` · espera: existe e tem as duas tabelas
