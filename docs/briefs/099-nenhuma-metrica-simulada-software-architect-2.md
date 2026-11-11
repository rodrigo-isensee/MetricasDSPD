## Objetivo
Segunda rodada do arquiteto no pedido 099. O dono decidiu "faca tudo que for preciso para tornar elas com dados reais" (13:55) para as métricas simuladas do Operacional e aceitou as recomendações da varredura (14:05: Q-099-1 A, Q-099-2 A, Q-099-3 A). O L1 (desligar o simulador) segue com o react-frontend.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/099-nenhuma-metrica-simulada.md` (inteiro, com as decisões literais).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/099-varredura-simulado.md` (a sua varredura).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/briefing-execucao-metricas.md`: só a definição de cada métrica do Operacional que hoje é simulada.

## Entregar
- "E2.2 (software-architect): L0, ADR 0030 que revoga a 0028, e o plano de dado real de cada cartão simulado do Operacional." (E2.2)
- (E2) (E2.2) ADR `docs/architecture/adr/0030-sem-simulado-na-web.md` (novo), pela ferramenta Write, no repositório principal: revoga a 0028 pelo critério de reversão que o dono acionou, devolve à 0026 o que a 0028 tirou e anota a 0021.
- (E1) (E2) (E3) (E2.2) Plano `docs/analises/099-dado-real-operacional.md` (novo), pela ferramenta Write: para cada um dos 20 cartões simulados do Operacional (12 da Semanal e 8 da Sustentação), a fonte (BusinessMap ou Acelerato, nunca misturadas), o campo e a tabela de onde vem o dado, o que falta coletar ou projetar, o cálculo pela biblioteca compartilhada (T2.5), a regra de 20 itens, os lotes de até 150 linhas com ordem e gatilhos de segurança, e o que não tem dado em nenhuma fonte ou depende de regra de negócio sem definição (vira pergunta ao dono, com recomendação, sem resolver por inferência). Se precisar ver dado, escreva a consulta só de leitura para o dono rodar. Sem ler a base real nem `.env`. Sem commit.
- arquivos: docs/architecture/adr/0030-sem-simulado-na-web.md, docs/analises/099-dado-real-operacional.md

## Pronto quando
- PQ-1 (arquivo): `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/099-dado-real-operacional.md` · espera: existe e tem uma linha para cada um dos 20 cartões
