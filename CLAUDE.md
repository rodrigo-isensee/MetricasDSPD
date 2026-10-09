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
- Credenciais (apikey do BusinessMap, usuário do MySQL do Acelerato) só em `.env`, nunca no código; acesso ao MySQL somente leitura.

## O que é código e o que não é
Frentes de implementação pelo time: WS2 (coletor e base analítica), WS3 (painéis do fluxo), WS5 (painéis de sustentação) e as automações externas da T4.3. As frentes WS1, WS4 e WS6 são configuração de ferramenta e governança feitas por pessoas; o time pode gerar apoio (relatórios, roteiros de teste, consultas), mas não as executa.

## Time de agentes (`.claude/agents/`)
O `jarvis` (orquestrador) é o agente principal da sessão (definido em `.claude/settings.json`): conversa com o usuário, delega para os especialistas abaixo e cuida do git.

| Agente | Responsabilidade | Entrega em |
|---|---|---|
| `jarvis` | Planejamento, delegação, revisão das entregas, branches, commits e pull requests | git |
| `software-architect` | Arquitetura, modelo de dados, ADRs, plano técnico e divisão de tarefas | `docs/architecture/` |
| `ux-designer` | Fluxos, wireframes, estados de tela, acessibilidade, microcopy | `docs/ux/` |
| `node-backend` | APIs, regras de negócio, banco, testes do servidor | `server/`, `docs/api/` |
| `react-frontend` | Telas, componentes, integração com a API, testes de UI | `web/` |
| `qa-engineer` | Plano de testes, E2E, acessibilidade, relatórios de bug | `e2e/`, `docs/qa/` |

As convenções de cada área ficam nas skills em `.claude/skills/`.

## Fluxo para uma feature nova
1. `ux-designer` escreve a especificação em `docs/ux/<feature>.md`, com critérios de aceite e necessidades de dados.
2. `software-architect` escreve o plano técnico em `docs/architecture/features/<feature>.md` (e ADRs, se houver decisão estrutural).
3. `node-backend` define o contrato em `docs/api/<recurso>.md` e implementa.
4. `react-frontend` implementa a tela usando a especificação e o contrato.
5. `qa-engineer` escreve o plano de testes, automatiza os E2E, executa tudo e reporta bugs.
6. `ux-designer` revisa a tela implementada.

Os passos 1 e 2 podem rodar em paralelo. Os passos 3, 4 e o plano de testes do passo 5 podem rodar em paralelo depois que o contrato da API estiver definido. Bugs reportados pelo QA voltam para o agente indicado no relatório.
