# MetricasDSPD

Sistema de métricas ágeis do DSPD: coleta dados do BusinessMap (fluxo de projeto) e do Acelerato (sustentação), mantém uma base analítica e publica painéis em três níveis (FL1 operacional, FL2 tático, FL3 estratégico) mais o de sustentação.

Projeto full-stack: back-end em Node.js (`server/`), front-end em React (`web/`) e testes E2E (`e2e/`).

## Fonte da verdade
- `docs/briefing-execucao-metricas.md`: **briefing de execução**. É a especificação: regras de cálculo, catálogo de métricas, frentes WS1 a WS6, tarefas e critérios de pronto. Leia as seções 00 a 04 antes de qualquer tarefa.
- `docs/proposta-metricas-ageis.md`: proposta original, com a justificativa de cada métrica. Use para entender o porquê; em caso de conflito, vale o briefing.
- `docs/referencia/`: os HTML originais dos dois documentos.

## Regras invioláveis (do briefing)
- **Nenhuma métrica pode servir para avaliação individual.** Não implementar ranking individual como visão principal, metas por pessoa nem comparação entre times. Se aparecer como requisito, recusar e sinalizar ao usuário.
- Métricas proibidas (seção 7.1): produtividade individual, velocidade em pontos como meta, comparação entre times, percentual de conclusão de tarefa, média de tempo de ciclo sem percentis, horas apontadas como esforço.
- **BusinessMap e Acelerato nunca se misturam** em nenhum cálculo, histograma, percentil ou previsão.
- Story, frente e projeto **nunca no mesmo histograma**.
- Tempo em horas/dias úteis; percentis 50/85/95 em janela móvel de 12 semanas; **abaixo de 20 itens, não publicar** estatística.
- Carga incremental: **nunca sobrescrever histórico**; cards arquivados e excluídos permanecem na base.
- Todo cálculo de tempo, percentil e Monte Carlo passa pela biblioteca compartilhada (T2.5); nenhuma métrica com cálculo próprio.
- Mudança de critério de cálculo é registrada com data e marcada nos gráficos (T2.6).
- Dúvida de regra de negócio **não se resolve por inferência**: vira pergunta ao usuário, nunca decisão no código.
- Ordem obrigatória: configuração (WS1, WS4) → coleta (WS2, WS5) → painéis (WS3).
- Credenciais (apikey do BusinessMap, acesso ao Metabase do Acelerato, usuários do PostgreSQL) só em `.env`, nunca no código. A fonte do Acelerato é somente leitura (tabela no Metabase); a API não tem permissão de leitura das colunas de pessoa.

## O que é código e o que não é
Frentes de implementação pelo time: WS2 (coletor e base analítica), WS3 (painéis do fluxo), WS5 (painéis de sustentação) e as automações externas da T4.3. As frentes WS1, WS4 e WS6 são configuração de ferramenta e governança feitas por pessoas; o time pode gerar apoio (relatórios, roteiros de teste, consultas), mas não as executa.

## Time de agentes (`.claude/agents/`)
O `jarvis` (orquestrador) é o agente principal da sessão (definido em `.claude/settings.json`): conversa com o usuário, delega para os especialistas abaixo e mantém o quadro Kanban.

| Agente | Responsabilidade | Entrega em |
|---|---|---|
| `jarvis` | Orquestração: planejamento, delegação, quadro Kanban, reuniões de alinhamento, comunicação com o usuário | `KANBAN.md`, `docs/alinhamentos/` |
| `ux-designer` | Upstream com Design Thinking (empatia, definição, ideação, protótipo, validação), especificação e revisão de interface | `docs/ux/<demanda>/` |
| `software-architect` | Arquitetura, modelo de dados, ADRs e plano técnico — com o tech lead | `docs/architecture/` |
| `tech-lead` | Boas práticas de desenvolvimento e modelagem (com o arquiteto), code review, decisões de commit, branches e pull requests | `docs/engineering/`, `docs/reviews/`, git |
| `node-backend` | APIs, regras de negócio, banco, testes do servidor | `server/`, `docs/api/` |
| `react-frontend` | Telas, componentes, integração com a API, testes de UI | `web/` |
| `qa-engineer` | Plano de testes, E2E, acessibilidade, parecer de QA | `e2e/`, `docs/qa/` |
| `agile-coach` | Quadro Kanban, métricas de fluxo do time, retrospectivas e melhoria contínua | `docs/kanban/`, `docs/retrospectivas/` |

As convenções de cada área ficam nas skills em `.claude/skills/`.

## Fluxo de uma demanda
**Upstream (discovery)** — `ux-designer` e `software-architect` juntos: o UX conduz Design Thinking (empatizar → definir → idear → prototipar) e o arquiteto avalia em paralelo viabilidade, dados, integrações e riscos → **validação do usuário no protótipo** (ponto de compromisso).

**Trabalho em paralelo por padrão:** o discovery corre à frente da entrega (UX e arquiteto adiantam as próximas fases enquanto os desenvolvedores constroem a atual), e na entrega tudo o que não depende entre si roda ao mesmo tempo. Limite: 1 cartão em andamento por agente.

**Downstream (entrega)**
1. `software-architect` + `tech-lead`: plano técnico, modelagem, ADRs e práticas.
2. `tech-lead` cria a branch; `node-backend` e `react-frontend` implementam; `qa-engineer` prepara os testes em paralelo.
3. `tech-lead` faz code review de toda entrega.
4. `qa-engineer` testa — **todo desenvolvimento passa pelo QA**, sem exceção. Nenhuma branch é enviada sem o parecer do QA em `docs/qa/`.
5. `ux-designer` revisa a interface implementada.
6. `tech-lead` envia a branch e prepara o pull request.
7. **O usuário valida e faz o merge na `main`.**

Correções e tarefas técnicas sem impacto de interface pulam o upstream, mas nunca o code review e o QA.

## A main é do usuário
Nenhum agente faz commit, merge ou push na `main`. Toda mudança chega lá por pull request validado e mesclado pelo usuário. O hook `.githooks/pre-push` bloqueia envios para a `main`.

## Quadro de atividades
Todas as atividades do time ficam visíveis no `KANBAN.md` (raiz), atualizado pelo Jarvis a cada mudança de estado. O `agile-coach` cuida das políticas do quadro, das métricas de fluxo e das retrospectivas.
