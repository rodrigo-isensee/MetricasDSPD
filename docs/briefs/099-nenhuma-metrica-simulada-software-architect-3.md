Agente destino: forge:software-architect
Pedido: 099-nenhuma-metrica-simulada
Tipo: codigo
Branch: docs/jarvis-2026-10-23   Base: develop   Base-sha: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8
Etapa: codigo   Cobre: E2.2

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

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 099-nenhuma-metrica-simulada até 125ff73356dbd97a31ffa0e5cef650a070a5ba52949550d675466b84b2a4d243 (4 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/099-nenhuma-metrica-simulada.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0030, ADR 0026, ADR 0028
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): varredura E1 e proposta por item (E2) e da guarda (E3), sem ler a base real." · etapa de outra delegação; continua no pedido
- "E2.1 (react-frontend): L1, App.tsx sem o FonteComSimulado e testes de composição ajustados, na branch fix/099-l1-sem-simulador, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041b." · etapa de outra delegação; continua no pedido
- "E2.3 (tech-lead): review do L1." · etapa de outra delegação; continua no pedido
- "E2.4 (qa-engineer): QA do L1." · etapa de outra delegação; continua no pedido
- "E2.5 (tech-lead): PR do L1 para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (arquivo): `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/099-dado-real-operacional.md` · espera: existe e tem uma linha para cada um dos 20 cartões
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
