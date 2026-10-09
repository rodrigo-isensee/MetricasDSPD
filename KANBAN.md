# Quadro Kanban

> Atualizado em: 2026-10-09 18:50 · Mantido pelo Jarvis; políticas do `agile-coach` (`.claude/skills/kanban-scrum/SKILL.md`).
> WIP: Empatizar 0/2 · Idear 0/2 · Pronto para fazer 12/5 ⚠ (carga inicial dos pedidos 001–005; auditoria do agile-coach em K-021) · Em andamento 3/3 · Code review 0/2 · QA 0/3 · Bloqueados: 0
> Item mais antigo em andamento: K-004 (desde 2026-10-09 17:58)
> Pedido 001 sem validações intermediárias (pedido 005): o upstream usa a especificação de UX existente; a única validação do usuário é o PR final.

# Upstream — descoberta (Design Thinking)

## Entrada
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|

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
| K-005 | Code review da fase A (fundação em `web/`) | 001 | tech-lead | 2026-10-09 | 2026-10-09 | Aguarda K-004 |
| K-006 | Front fase B1: painel Operacional (FL1) | 001 | react-frontend | 2026-10-09 | 2026-10-09 | Aguarda K-005 |
| K-007 | Front fase B2: painéis Tático (FL2) e Estratégico (FL3) | 001 | react-frontend | 2026-10-09 | 2026-10-09 | Aguarda K-005 |
| K-008 | Front fase B3: Sustentação, Espera invisível e Visão geral | 001 | react-frontend | 2026-10-09 | 2026-10-09 | Aguarda K-005 |
| K-009 | QA: automação E2E + axe, suíte completa e parecer em `docs/qa/` | 001 | qa-engineer | 2026-10-09 | 2026-10-09 | — |
| K-010 | Revisão de UX da interface implementada | 001 | ux-designer | 2026-10-09 | 2026-10-09 | — |
| K-011 | Pré-entrega, envio da branch e descrição do PR | 001 | tech-lead | 2026-10-09 | 2026-10-09 | — |
| K-014 | Arquitetura completa: overview, data-model, ADRs, roadmap | 002 | software-architect + tech-lead | 2026-10-09 | 2026-10-09 | Após kickoff (K-013) |
| K-015 | Práticas de engenharia (`docs/engineering/praticas.md`) | 002 | tech-lead + software-architect | 2026-10-09 | 2026-10-09 | — |
| K-016 | Estrutura inicial do monorepo e pacote de cálculo compartilhado | 002 | software-architect | 2026-10-09 | 2026-10-09 | Afeta 001 |
| K-017 | Migrações iniciais e seed MySQL com os dados mockados | 002 | node-backend | 2026-10-09 | 2026-10-09 | Após K-014 |
| K-018 | ADR do orçamento de performance do projeto | 003 | software-architect | 2026-10-09 | 2026-10-09 | Saída do checkpoint K-012 |

## Em andamento (WIP 3)
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|
| K-004 | Front fase A: scaffold, biblioteca de cálculo, gerador mock, shell, filtros e componentes | 001 | react-frontend | 2026-10-09 | 2026-10-09 17:58 | — |
| K-012 | Reunião de checkpoint do pedido 001 (escopo e performance) | 003 | jarvis | 2026-10-09 | 2026-10-09 18:50 | — |
| K-013 | Kickoff do pedido 002 | 003 | jarvis | 2026-10-09 | 2026-10-09 18:50 | Junto com K-012 |

## Code review (WIP 2)
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|

## QA (WIP 3)
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|

## Aguardando sua validação
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

## Processo (pedidos 003–005)
| ID | Cartão | Pedido | Responsável | Estado | Obs. |
|---|---|---|---|---|---|
| K-019 | Popular o quadro e o histórico | 004 | jarvis | Feito 2026-10-09 18:50 | — |
| K-020 | Commit dos arquivos de time e dos pedidos 002–005 | 005 | tech-lead | Em andamento | — |
| K-021 | Auditoria do quadro e limites de WIP iniciais | 004 | agile-coach | Em andamento | — |
