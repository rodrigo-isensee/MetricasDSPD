Agente destino: forge:software-architect
Pedido: 099-nenhuma-metrica-simulada
Tipo: codigo
Branch: docs/jarvis-2026-10-23   Base: develop   Base-sha: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8
Etapa: codigo   Cobre: E2.2

## Objetivo
O dono mandou o documento do processo de gestão de incidentes de sistemas com os SLAs dos atendimentos ("aqui tem os slas dos atendimentos e o processo"). Ele pode responder ou mudar as perguntas do plano de dado real da sustentação (Q-099-5 sobre o S1, Q-099-8 sobre o S9) e a parametrização do Acelerato (WS4).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/referencia/PROC_30.000.010-gestao-de-incidentes-de-sistemas.pdf` (inteiro; use o parâmetro `pages` do Read).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/099-dado-real-operacional.md`: as linhas S1 a S12 e as perguntas Q-099-4 a Q-099-10.
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/briefing-execucao-metricas.md`, só a seção 3.4 (matriz de SLA e etapas).

## Entregar
- "E2.2 (software-architect): L0, ADR 0030 que revoga a 0028, e o plano de dado real de cada cartão simulado do Operacional." (E2.2) Nesta delegação, o confronto do documento do dono com o plano.
- (E1) (E2) (E2.2) Escrever `docs/analises/099-proc-sla-incidentes.md` (novo), pela ferramenta Write, no repositório principal: os prazos de primeiro atendimento e de solução por prioridade do documento, comparados com a matriz do briefing §3.4 (iguais, diferentes, faltando); as etapas e a definição de pendência e de primeiro atendimento do processo, comparadas com o que o plano propõe para o S1 e o S9; o que muda nas recomendações das Q-099-5 e Q-099-8 (e em outras, se for o caso); o que o documento resolve sem pergunta e o que ainda pede decisão do dono, com recomendação. Não copiar nome de pessoa do documento. Sem commit.
- (E3) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/analises/099-proc-sla-incidentes.md

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
- PQ-1 (arquivo): `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/099-proc-sla-incidentes.md` · espera: existe e traz a tabela de prazos por prioridade
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
