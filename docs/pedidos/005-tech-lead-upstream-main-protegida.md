# Pedido 005 — Tech lead, upstream com Design Thinking e main protegida

Solicitante: Rodrigo Isensee · Data: 2026-10-09 · Responsável: Jarvis

## O que mudou no time
Releia agora `.claude/agents/jarvis.md`, `CLAUDE.md` e os novos `.claude/agents/tech-lead.md`, `.claude/skills/engineering-practices/SKILL.md`, `.claude/agents/ux-designer.md` e `.claude/skills/kanban-scrum/SKILL.md`. Resumo:
- Você passa a ser **orquestrador**. O novo agente **`tech-lead`** define, junto com o `software-architect`, as melhores práticas de desenvolvimento e de modelagem, faz **code review de toda entrega antes do QA** e **decide os commits** (granularidade, mensagens, branches, envio, pull request).
- O **`ux-designer` conduz o upstream** de toda demanda com interface usando **Design Thinking** (empatizar, definir, idear, prototipar, validar). A **validação do usuário no protótipo** é o ponto de compromisso do quadro.
- **A `main` é do usuário.** Nenhum agente faz commit, merge ou push na `main`; ela só muda por pull request validado e mesclado pelo usuário. O hook `.githooks/pre-push` (já ativo neste repositório) bloqueia envios para a `main`.
- Quadro Kanban com upstream, colunas de Code review e "Aguardando sua validação".

## Como aplicar aos pedidos em andamento
1. **Pedido 001 (dashboard mock) — sem validações intermediárias.** Decisão do usuário: como os dados ainda são mockados, ele quer ver **só o resultado final**. Para este pedido:
   - não há validação de protótipo nem paradas para o usuário no meio; a especificação de UX existente vale como base;
   - **continua obrigatório internamente**: code review do `tech-lead` em cada fase (começando pelo que já existe em `web/`, com parecer em `docs/reviews/`), QA em tudo, revisão de UX da interface pronta e as reuniões de alinhamento;
   - dúvidas que normalmente iriam ao usuário: o time decide com a melhor recomendação, registra a decisão (ADR ou especificação) e lista tudo no resumo final;
   - só procure o usuário no meio se houver um bloqueio real que impeça continuar;
   - a única validação do usuário é a final: o pull request da branch `feature/dashboard-mock`, com o app funcionando.
2. **Pedido 002 (arquitetura completa e MySQL):** conduzido pelo `software-architect` **junto com o `tech-lead`**; o tech lead escreve com o arquiteto o `docs/engineering/praticas.md` do projeto e revisa a modelagem MySQL.
3. **Pedidos 003 e 004:** continuam valendo (reuniões de alinhamento e quadro Kanban), já com as novas colunas.
4. A partir de agora, todos os commits ficam com o `tech-lead`, inclusive os dos arquivos de time e dos pedidos 002 a 005 que estão no diretório de trabalho sem commit.
5. Ao final do pedido 001, o tech lead envia a branch `feature/dashboard-mock` e você entrega ao usuário o link de comparação e a descrição do PR para validação. Os commits de documentação que estão na `main` local e não foram enviados (`6a99116`, `34e8940`) já fazem parte dessa branch e chegam à `main` pelo PR.
