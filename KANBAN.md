# Quadro Kanban

> Atualizado em: 2026-10-09 19:15 · Mantido pelo Jarvis; políticas do `agile-coach` (`.claude/skills/kanban-scrum/SKILL.md`).
> WIP: Empatizar 0/2 · Idear 0/2 · Pronto para fazer 3/5 · Em andamento 3/3 · Code review 0/2 · QA 0/2 · Aguardando validação 0/2 · Bloqueados: 0 (auditoria K-021 em 2026-10-09: limites revisados, ver `docs/kanban/melhorias.md`)
> Item mais antigo em andamento: K-004 (desde 2026-10-09 17:58)
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
| K-022 | Front fase A2: shell, filtros na URL e componentes base | 001 | react-frontend | 2026-10-09 | 2026-10-09 | Dividido de K-004; começa quando K-004 for para Code review |
| K-014 | Arquitetura completa: overview, data-model, ADRs, roadmap | 002 | software-architect + tech-lead | 2026-10-09 | 2026-10-09 | Após K-016, em `feature/arquitetura-mysql` (worktree) — D4 |
| K-016 | Monorepo: ADR 0002 + extração para `packages/` | 002 | software-architect (ADR) + react-frontend (extração) | 2026-10-09 | 2026-10-09 | D2/D3 da ata: ADR escrita junto com K-018; extração após review e QA da fase A |

## Em andamento (WIP 3)
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|
| K-004 | Front fase A1: scaffold, biblioteca de cálculo e gerador mock (com testes) | 001 | react-frontend | 2026-10-09 | 2026-10-09 17:58 | Ajustes D6 da ata a aplicar na entrega |
| K-018 | ADR do orçamento de performance + ADR 0002 do monorepo (D1, D2) | 003 | software-architect | 2026-10-09 | 2026-10-09 19:15 | — |
| K-015 | Práticas de engenharia (`docs/engineering/praticas.md`) | 002 | tech-lead + software-architect | 2026-10-09 | 2026-10-09 19:15 | Antes da fase B (D9) |

## Code review (WIP 2)
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|

## QA (WIP 2)
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|

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

## Processo (pedidos 003–005) — fora do WIP e das métricas de fluxo
Cartões de processo e reuniões não contam no WIP do fluxo de entrega nem em lead/cycle time; têm um único estado.

| ID | Cartão | Pedido | Responsável | Estado | Obs. |
|---|---|---|---|---|---|
| K-012 | Reunião de checkpoint do pedido 001 (escopo e performance) | 003 | jarvis | Feito 2026-10-09 19:15 | Ata em `docs/alinhamentos/`; gera K-018 |
| K-013 | Kickoff do pedido 002 | 003 | jarvis | Feito 2026-10-09 19:15 | Ata em `docs/alinhamentos/`; libera K-014, K-016, K-017 |
| K-019 | Popular o quadro e o histórico | 004 | jarvis | Feito 2026-10-09 18:50 | — |
| K-020 | Commit dos arquivos de time e dos pedidos 002–005 | 005 | tech-lead | Feito 2026-10-09 | 6b2b3eb, 9f11794, 43cb7ad, afb6382 |
| K-021 | Auditoria do quadro e limites de WIP iniciais | 004 | agile-coach | Feito 2026-10-09 | Mudanças no histórico e em `melhorias.md` |

## Políticas locais (acrescentadas na auditoria K-021)
- **Entrada é o backlog:** cartão com dependência aberta de outro cartão fica em Entrada; só entra em "Pronto para fazer" o que pode ser puxado agora (a espera por ata de reunião em andamento é a única exceção, e deve constar em Obs.).
- **Code review, QA e revisão de UX são colunas, não cartões:** não criar cartão para revisar outro cartão. K-009, K-010 e K-011 são trabalho próprio (automação E2E, revisão de UX, pré-entrega) e não duplicam as colunas.
- **Um cartão em "Em andamento" por agente**, salvo reunião.
- **Tamanho:** um cartão por conjunto coeso de métricas ou por uma entrega revisável de uma vez; se o review não cabe numa sessão, dividir.
- **Aguardando sua validação:** limite 2 (para o PR não acumular; o usuário é a vaga limitante).
