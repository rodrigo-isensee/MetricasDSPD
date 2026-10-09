# MetricasDSPD

Projeto full-stack: back-end em Node.js (`server/`), front-end em React (`web/`) e testes E2E (`e2e/`).

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
