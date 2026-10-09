# Quadro Kanban

> Atualizado em: 2026-10-09 20:22 · Mantido pelo Jarvis; políticas do `agile-coach` (`.claude/skills/kanban-scrum/SKILL.md`).
> WIP: Empatizar 0/2 · Idear 0/2 · Pronto para fazer 2/5 · Em andamento 3/3 (3 cartões de bug) · Code review 0/2 · QA 0/2 · Aguardando validação 0/2 · Bloqueados: 2 (pais K-004 e K-022 aguardando bugs; fora do WIP por exceção) (auditoria K-021 em 2026-10-09: limites revisados, ver `docs/kanban/melhorias.md`)
> Item mais antigo em andamento: K-004 (pai, bloqueado aguardando bugs; cycle time corrido desde 2026-10-09 17:58). Retrabalho aberto: K-027, K-028, K-029 (40 achados: 14 do code review, 26 da UX)
> Pedido 001 sem validações intermediárias (pedido 005): o upstream usa a especificação de UX existente; a única validação do usuário é o PR final.

# Upstream — descoberta (Design Thinking)

## Entrada (backlog: cartões com dependência aberta)
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|
| K-006 | Front fase B1a: painel Operacional (FL1), visão diária O1 a O4 | 001 | react-frontend | 2026-10-09 | 2026-10-09 | Aguarda K-004 e K-022 revisados |
| K-023 | Front fase B1b: FL1 restante (O7, O9, O10, O12, O15, O18) | 001 | react-frontend | 2026-10-09 | 2026-10-09 | Aguarda K-004 e K-022; dividido de K-006 |
| K-007 | Front fase B2: painel Tático (FL2): T1 a T5, T7, T9 | 001 | react-frontend | 2026-10-09 | 2026-10-09 | Aguarda K-004 e K-022 |
| K-024 | Front fase B2b: painel Estratégico (FL3): E1 a E3 | 001 | react-frontend | 2026-10-09 | 2026-10-09 | Aguarda K-004 e K-022; dividido de K-007 |
| K-008 | Front fase B3a: painel Sustentação (S1 a S7, só Acelerato) | 001 | react-frontend | 2026-10-09 | 2026-10-09 | Aguarda K-004 e K-022 |
| K-025 | Front fase B3b: Espera invisível (visão cliente e time, por nível) | 001 | react-frontend | 2026-10-09 | 2026-10-09 | Aguarda K-004 e K-022; dividido de K-008 |
| K-026 | Front fase B3c: Visão geral | 001 | react-frontend | 2026-10-09 | 2026-10-09 | Depende dos painéis B1 a B3; dividido de K-008 |
| K-009 | QA: automação E2E + axe, suíte completa e parecer em `docs/qa/` | 001 | qa-engineer | 2026-10-09 | 2026-10-09 | Começa por painel, conforme cada cartão B chega ao QA |
| K-010 | Revisão de UX da interface implementada | 001 | ux-designer | 2026-10-09 | 2026-10-09 | Após QA dos painéis |
| K-011 | Pré-entrega, envio da branch e descrição do PR | 001 | tech-lead | 2026-10-09 | 2026-10-09 | Após parecer do QA |
| K-017 | Migrações iniciais e seed MySQL com os dados mockados | 002 | node-backend | 2026-10-09 | 2026-10-09 | Após K-014 |

## Empatizar e definir (WIP 2)
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|

## Idear e prototipar (WIP 2)
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|

## Validação do usuário
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|

---

**▶ Ponto de compromisso: protótipo validado pelo usuário**

# Downstream — entrega

## Pronto para fazer (WIP 5)
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|
| K-014 | Arquitetura completa: overview, data-model, ADRs, roadmap | 002 | software-architect + tech-lead | 2026-10-09 | 2026-10-09 | Após K-016, em `feature/arquitetura-mysql` (worktree) — D4 |
| K-016 | Monorepo: ADR 0002 + extração para `packages/` | 002 | software-architect (ADR) + react-frontend (extração) | 2026-10-09 | 2026-10-09 | D2/D3 da ata: ADR escrita junto com K-018; extração após review e QA da fase A |

## Em andamento (WIP 3)
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|
| K-027 | [bug] Code review fase A: 10 bloqueantes + 4 recomendados (EI por tipo/prioridade, fronteira BM x AC e lint, spread min/max, orçamento de performance, latência mock D7, testes) | 001 | react-frontend | 2026-10-09 | 2026-10-09 20:22 | origem: code review; pai: K-004, K-022; severidade: bloqueante; parecer: docs/reviews/001-fase-a.md (versão final: 14 bloqueantes, 19 recomendados; inclui arquivado≠descartado, T5 ordem neutra, testes de ~20 métricas, lint de charts); decisões Q1–Q6 em docs/alinhamentos/2026-10-09-decisoes-review-fase-a.md; inclui bug QA docs/qa/bugs/001 (mesmo achado do CRITERIOS_MOCK); voltas: 0 |
| K-028 | [bug] UX fase A: 8 altos (A1 a A8: aviso de consolidação, parâmetros e sessão, períodos do Estratégico, remover filtro, janela do O4, variante lenta, cabeçalho, período em andamento) | 001 | react-frontend | 2026-10-09 | 2026-10-09 20:22 | origem: UX; pai: K-004, K-022; severidade: alto; parecer: docs/reviews/001-fase-a-ux.md A1 a A8 + docs/reviews/001-fase-a-ux-adendo.md v1-A4, v1-A6, v1-A7; voltas: 0 |
| K-029 | [ajuste] UX fase A: médios M1 a M10 e baixos B1 a B8 | 001 | react-frontend | 2026-10-09 | 2026-10-09 20:22 | origem: UX; pai: K-004, K-022; severidade: médio; parecer: docs/reviews/001-fase-a-ux.md M1 a M10, B1 a B8 (o parecer conta 10 médios e 8 baixos) + adendo v1-M (7 médios); voltas: 0 |

## Code review (WIP 2)
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|

## QA (WIP 2)
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|

## Revisado, aguardando o envio da branch (documentação, fora do WIP)
Documentos revisados e commitados na `feature/dashboard-mock`; seguem no PR 1 e vão para "Aguardando sua validação" junto com ele.

| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|
| K-018 | ADR 0003 (orçamento de performance) + ADR 0002 (monorepo) + ADR 0001 e plano rev. 3 | 003 | software-architect → tech-lead | 2026-10-09 | 2026-10-09 19:02 | Revisado e aprovado (docs/reviews/001-docs-adr-praticas.md); commits 297674f, 5fdd24f |
| K-015 | Práticas de engenharia (`docs/engineering/praticas.md`) | 002 | tech-lead → software-architect | 2026-10-09 | 2026-10-09 19:02 | Revisado e aprovado (docs/reviews/001-docs-adr-praticas.md); commits 297674f, 5fdd24f |

## Aguardando sua validação (WIP 2)
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|

## Pronto
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|
| K-001 | Especificação de UX do dashboard (rev. 1 e rev. 2) | 001 | ux-designer | 2026-10-09 | 2026-10-09 18:12 | Commits bf0baca, a60a37a |
| K-002 | ADR 0001 e plano técnico do dashboard mock (rev. 1 e rev. 2) | 001 | software-architect | 2026-10-09 | 2026-10-09 18:13 | Commits f929ed1, fdb3b1d |
| K-003 | Plano de testes e esqueleto do pacote E2E | 001 | qa-engineer | 2026-10-09 | 2026-10-09 18:03 | Commit c157fdd |

## Bloqueado
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|
| K-004 | Front fase A1: scaffold, biblioteca de cálculo e gerador mock (com testes) | 001 | react-frontend | 2026-10-09 | 2026-10-09 20:22 | Origem: Em andamento (devolvido do Code review às 20:18). Aguardando bugs K-027, K-028, K-029; fora do WIP (exceção de retrabalho) |
| K-022 | Front fase A2: shell, filtros na URL, tema e componentes base | 001 | react-frontend | 2026-10-09 | 2026-10-09 20:22 | Origem: Em andamento (devolvido do Code review às 20:18). Aguardando bugs K-027, K-028, K-029; fora do WIP (exceção de retrabalho) |

## Processo (pedidos 003–005) — fora do WIP e das métricas de fluxo
Cartões de processo e reuniões não contam no WIP do fluxo de entrega nem em lead/cycle time; têm um único estado.

| ID | Cartão | Pedido | Responsável | Estado | Obs. |
|---|---|---|---|---|---|
| K-012 | Reunião de checkpoint do pedido 001 (escopo e performance) | 003 | jarvis | Feito 2026-10-09 18:52 | Ata em `docs/alinhamentos/`; gera K-018 |
| K-013 | Kickoff do pedido 002 | 003 | jarvis | Feito 2026-10-09 18:52 | Ata em `docs/alinhamentos/`; libera K-014, K-016, K-017 |
| K-019 | Popular o quadro e o histórico | 004 | jarvis | Feito 2026-10-09 18:50 | — |
| K-020 | Commit dos arquivos de time e dos pedidos 002–005 | 005 | tech-lead | Feito 2026-10-09 | 6b2b3eb, 9f11794, 43cb7ad, afb6382 |
| K-021 | Auditoria do quadro e limites de WIP iniciais | 004 | agile-coach | Feito 2026-10-09 | Mudanças no histórico e em `melhorias.md` |

## Políticas locais (acrescentadas na auditoria K-021)
- **Entrada é o backlog:** cartão com dependência aberta de outro cartão fica em Entrada; só entra em "Pronto para fazer" o que pode ser puxado agora (a espera por ata de reunião em andamento é a única exceção, e deve constar em Obs.).
- **Code review, QA e revisão de UX são colunas, não cartões:** não criar cartão para revisar outro cartão. K-009, K-010 e K-011 são trabalho próprio (automação E2E, revisão de UX, pré-entrega) e não duplicam as colunas.
- **Um cartão em "Em andamento" por agente**, salvo reunião.
- **Tamanho:** um cartão por conjunto coeso de métricas ou por uma entrega revisável de uma vez; se o review não cabe numa sessão, dividir.
- **Aguardando sua validação:** limite 2 (para o PR não acumular; o usuário é a vaga limitante).

## Políticas locais: bugs e retrabalho (K-027 a K-029)
Processo completo na skill `kanban-scrum`, seção "Bugs e retrabalho". Em resumo:
- **Achado vira cartão** `[bug]` ou `[ajuste]`, agrupado por origem, área e severidade; Obs. com origem, pai, severidade, link do parecer e voltas.
- **Fluxo:** Em andamento (autor original) -> Code review -> QA -> UX se houver interface. Conta como retrabalho.
- **Pai aguardando bugs** fica em Bloqueado e **não conta no WIP** (exceção registrada); os cartões de bug contam. Cartões de retrabalho do mesmo autor podem ocupar a vaga cheia (3), em ordem de severidade.
- **Bloqueante, crítico e alto** puxam antes de trabalho novo; médio e baixo só seguem abertos com aprovação do usuário. Limite de 3 voltas por bug, depois vai ao usuário.
- **Limites:** QA 2 e Aguardando sua validação 2 (M-001, ata D14).
