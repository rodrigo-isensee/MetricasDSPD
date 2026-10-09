---
name: kanban-scrum
description: Práticas de Kanban e Scrum do time - estrutura do quadro KANBAN.md, formato de cartão, políticas de coluna e WIP, registro de transições, métricas de fluxo, retrospectiva e experimentos de melhoria contínua. Use ao mover cartões, auditar o quadro, calcular métricas do time ou conduzir retrospectivas.
---

# Kanban e Scrum do time

## Quadro (`KANBAN.md`, na raiz)
Visível no GitHub e no editor. Duas partes, separadas pelo **ponto de compromisso**.

**Upstream — descoberta (Design Thinking, conduzido pelo `ux-designer`)**

| Coluna | Entra quando | Limite de WIP |
|---|---|---|
| **Entrada** | Pedido registrado em `docs/pedidos/` | — |
| **Empatizar e definir** | UX começou a entender o problema | 2 |
| **Idear e prototipar** | Problema definido e aceito | 2 |
| **Validação do usuário** | Protótipo pronto, aguardando o usuário | — |

▶ **Ponto de compromisso:** protótipo validado pelo usuário. Correções e tarefas técnicas sem interface entram direto em "Pronto para fazer".

**Downstream — entrega**

| Coluna | Entra quando | Limite de WIP |
|---|---|---|
| **Pronto para fazer** | Validado, quebrado em cartões, critério de pronto claro | 5 |
| **Em andamento** | Um agente começou a implementar | 3 |
| **Code review** | Implementação entregue ao `tech-lead` | 2 |
| **QA** | Code review aprovado | 3 |
| **Aguardando sua validação** | QA aprovado, branch enviada, PR pronto para o usuário | — |
| **Pronto** | Usuário validou e fez o merge na `main` | — |
| **Bloqueado** | Dependência externa ou decisão pendente (registrar motivo e coluna de origem) | conta no WIP da origem |

Políticas:
- Puxar, não empurrar: só entra numa coluna se houver vaga no WIP.
- Terminar antes de começar: com WIP cheio, o time ajuda a destravar o que existe.
- Nenhuma coluna é pulada no downstream: todo cartão passa por Code review e QA.
- Só o usuário move um cartão para "Pronto" (ao fazer o merge).
- Bloqueio: o cartão vai para "Bloqueado" com a coluna de origem anotada e volta para ela.
- Cartão devolvido no code review ou no QA volta para "Em andamento" e conta como retrabalho.

## Formato do cartão
Uma linha de tabela por cartão, em cada coluna:

```markdown
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|
| K-012 | Painel FL1 - O1 a O4 | 001 | react-frontend | 2026-10-09 | 2026-10-10 | — |
```

- ID sequencial `K-NNN`, nunca reutilizado.
- Responsável é um agente (ou "usuário" quando depende de você).
- Tamanho: um cartão cabe em até uma fase do pedido; se for maior, quebrar.
- No topo do quadro: data/hora da última atualização e um resumo (WIP por coluna × limite, itens bloqueados, item mais antigo em andamento).

## Histórico (`docs/kanban/historico.md`)
Append-only, uma linha por movimento — é a fonte das métricas:

```markdown
| Data/hora | Cartão | De | Para | Motivo |
|---|---|---|---|---|
| 2026-10-10 14:05 | K-012 | Pronto para fazer | Em andamento | — |
```

## Métricas de fluxo do time
- **Lead time:** entrada no Backlog → Pronto. **Cycle time:** entrada em "Em andamento" → Pronto.
- **Vazão:** cartões em Pronto por semana.
- **Idade do WIP:** tempo desde a entrada em "Em andamento" dos cartões abertos.
- **Tempo bloqueado** e **motivos de bloqueio**.
- **Retrabalho:** % de cartões que voltaram de "Em revisão / QA" para "Em andamento".
- **Escape:** bugs encontrados depois do parecer do QA.
- Percentis P50/P85 só com 20+ itens; abaixo disso, mostrar os valores individuais. Nunca média sozinha.

## Retrospectiva (`docs/retrospectivas/AAAA-MM-DD-<pedido>.md`)
1. Dados do pedido: lead time, cycle time, vazão, retrabalho, bloqueios.
2. O que funcionou.
3. O que atrapalhou (fatos, não pessoas).
4. Até 3 ações — cada uma com responsável, mudança exata e como medir.
5. Revisão das ações da retrospectiva anterior: funcionou, não funcionou, abandonar.

## Experimentos de melhoria (`docs/kanban/melhorias.md`)
| ID | Hipótese | Mudança | Métrica | Início | Revisão | Resultado |
Uma mudança por vez em cada parte do processo, para saber o que causou o efeito.

## Elementos de Scrum usados
O time trabalha em fluxo contínuo (Kanban), aproveitando de Scrum: **objetivo claro por pedido** (como meta de sprint), **revisão** com o usuário ao fim de cada pedido, **retrospectiva** com ações concretas e **definição de pronto** compartilhada. Não há sprints de duração fixa nem pontos de estória.
