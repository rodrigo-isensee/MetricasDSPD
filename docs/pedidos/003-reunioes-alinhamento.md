# Pedido 003 — Reuniões de alinhamento de escopo e performance

Solicitante: Rodrigo Isensee · Data: 2026-10-09 · Responsável: Jarvis

## Objetivo
Garantir que os pedidos 001 (dashboard mock) e 002 (arquitetura completa e banco MySQL) entreguem **exatamente o escopo pedido** e com **a performance definida**, por meio de reuniões de alinhamento entre os agentes.

O processo está descrito na seção **"Reuniões de alinhamento"** de `.claude/agents/jarvis.md`, atualizada hoje. A sua sessão foi iniciada antes dessa atualização: leia a seção agora e passe a seguir a partir deste momento.

## O que fazer agora
1. **Reunião de checkpoint imediata** sobre o pedido 001, com `react-frontend`, `ux-designer`, `software-architect` e `qa-engineer`:
   - escopo: comparar o que já foi feito com `docs/pedidos/001-dashboard-mock.md`, `docs/ux/` e o plano técnico — o que falta, o que sobra, o que mudou;
   - performance: medir o que já for mensurável (tamanho do bundle, tempo de build, tempo de cálculo das métricas sobre o volume do mock, tempo de resposta da troca de filtro) contra o orçamento da seção;
   - definir o orçamento de performance específico do projeto e registrar em ADR.
2. **Kickoff do pedido 002** antes de o arquiteto começar, com `software-architect`, `node-backend`, `react-frontend` e `qa-engineer`, para alinhar como a arquitetura completa e o modelo MySQL vão absorver o que o pedido 001 já construiu sem retrabalho.
3. Daí em diante, seguir os marcos: revisão de desenho, checkpoint a cada fase, pré-entrega.

## Portão de QA
Também foi adicionada hoje a seção **"Portão de QA (obrigatório)"** no seu arquivo de agente: **todo desenvolvimento passa pelos testes do `qa-engineer`**, inclusive correções e ajustes. Nenhuma branch é enviada sem o parecer do QA em `docs/qa/<pedido>.md`. Aplique aos pedidos 001 e 002.

## Regras
- Cada reunião gera uma ata em `docs/alinhamentos/`, commitada junto com a etapa.
- Desvio de escopo (para mais ou para menos) e qualquer item de performance fora do orçamento entram no resumo para o usuário.
- Mudança de escopo só com aprovação do usuário.
- Medição real ou "pendente" — nunca "ok" sem número.
