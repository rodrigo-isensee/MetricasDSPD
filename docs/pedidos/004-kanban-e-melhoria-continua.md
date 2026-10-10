# Pedido 004 — Quadro Kanban visível e melhoria contínua

Solicitante: Rodrigo Isensee · Data: 2026-10-09 · Responsáveis: Jarvis e `agile-coach`

## Contexto
Foi criado o agente `agile-coach` (especialista em Kanban e Scrum, melhoria contínua) com a skill `kanban-scrum`, e o quadro `KANBAN.md` na raiz. Seu arquivo de agente ganhou a seção **"Quadro Kanban (obrigatório)"**. Sua sessão começou antes dessas mudanças: leia agora `.claude/agents/jarvis.md`, `.claude/agents/agile-coach.md` e `.claude/skills/kanban-scrum/SKILL.md`.

## O que fazer
1. **Popular o quadro com tudo o que existe hoje** — pedidos 001, 002, 003 e este 004, quebrados em cartões por fase e agente, cada um na coluna real em que está agora (o que já foi entregue vai para Pronto com a data real, o que está rodando vai para Em andamento, perguntas pendentes ao usuário vão para Bloqueado). Registrar os movimentos já ocorridos em `docs/kanban/historico.md` com as datas reais dos commits.
2. **Acionar o `agile-coach`** para auditar o quadro (WIP, consistência, cartões grandes demais) e propor os limites de WIP iniciais para este projeto.
3. A partir de agora, **atualizar o quadro a cada mudança de estado** e commitar junto com cada etapa.
4. Incluir o `agile-coach` nas reuniões de alinhamento e, ao fim de cada pedido, pedir a retrospectiva.

## Critério de pronto
`KANBAN.md` reflete o estado real de todos os pedidos, com o resumo de WIP no topo, e o histórico tem os movimentos já ocorridos.
