# Pedido 006 — Trabalho em paralelo e discovery adiantado

Solicitante: Rodrigo Isensee · Data: 2026-10-09 · Responsável: Jarvis

## O que mudou
Releia a seção **"Trabalho em paralelo (padrão do time)"** de `.claude/agents/jarvis.md` e as atualizações em `CLAUDE.md`, `ux-designer.md`, `software-architect.md` e na skill `kanban-scrum`:
- os agentes trabalham **todos ao mesmo tempo** sempre que não houver dependência real;
- o **discovery é feito em dupla por `ux-designer` e `software-architect`** e corre **à frente da entrega**;
- WIP: 1 cartão em andamento por agente.

## O que fazer agora
1. **Acione em paralelo, já**, todos os agentes que podem trabalhar sem esperar ninguém — sem interromper o que está em andamento.
2. **UX + arquiteto adiantam o discovery das próximas fases**, enquanto o pedido 001 é construído:
   - **Integração real (substituir o mock):** como os painéis vão se comportar com dados reais — atraso de coleta, dados incompletos durante o período de calibração (seção 7.4 do briefing), indicação de "dados de calibração, não cobrar", marcação de mudança de critério (T2.6), estados de falha de coleta. O arquiteto avalia junto o pedido 002 (MySQL, coletores).
   - **Métricas fora do núcleo** (O5, O6, O8, O11, O13, O14, O16, O17, T6, T8, E4, E5, S8 a S12): onde entram na navegação sem poluir os painéis.
   - **Lacuna de valor na sustentação** (pesquisa trimestral de *fit for purpose*, citada no fim da seção 6 do briefing): proposta de como coletar e exibir.
   Cada uma vira uma demanda em `docs/ux/<demanda>/` com as etapas de Design Thinking e a `viabilidade-tecnica.md` do arquiteto, e um cartão no upstream do quadro.
3. Validação: para o pedido 001 segue valendo **só o resultado final**. Os protótipos das demandas adiantadas ficam prontos aguardando a validação do usuário; não interrompa o usuário por eles — liste-os no resumo da entrega do 001.
