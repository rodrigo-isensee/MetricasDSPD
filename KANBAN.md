# Quadro Kanban

> Atualizado em: 2026-10-10 02:58 (reconciliado com historico.md e git log; o quadro estava parado em 2026-10-09 22:09) · Mantido pelo Jarvis; políticas do `agile-coach` (`.claude/skills/kanban-scrum/SKILL.md`).
> WIP: Empatizar 0/2 · Idear 0/2 · Validação do usuário 1 (K-034) · Pronto para fazer 0/5 · Em andamento: tech-lead 1 (K-011) · Code review 1/2 (K-017 parte 1) · QA 0/2 · Aguardando sua validação 1 PR (001, 29 cartões; limite conta PRs) · Bloqueados: 0
> Item mais antigo em andamento: K-011 (pré-entrega do PR 1). Pedido 001 passou no QA final (r3, 2026-10-10 02:56); aguarda sua validação do PR. Retrospectiva: `docs/retrospectivas/2026-10-10-001.md`.
> Pedido 002: K-014 e K-033 aprovados; K-017 parte 1 (migrações, 324b472) entregue sem review; seed pendente. Pedido 006: K-034 aguarda validação; K-035 e K-036 pausados por decisão do usuário até o fim do 001 (2026-10-09 21:03).

# Upstream — descoberta (Design Thinking)

## Entrada (backlog: cartões com dependência aberta)
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|
| K-035 | Discovery: métricas fora do núcleo | 006 | ux-designer | 2026-10-09 | 2026-10-09 20:53 | PAUSADO por decisão do usuário até o fim do 001 (2026-10-09 21:03); entra em Empatizar ao retomar |
| K-036 | Discovery: lacuna de valor na sustentação | 006 | ux-designer | 2026-10-09 | 2026-10-09 20:53 | PAUSADO por decisão do usuário até o fim do 001 (2026-10-09 21:03) |

## Empatizar e definir (WIP 2)
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|

## Idear e prototipar (WIP 2)
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|

## Validação do usuário
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|
| K-034 | Discovery: integração real (BusinessMap e Acelerato) | 006 | ux-designer | 2026-10-09 | 2026-10-09 21:03 | Pronto (ec96623); aguarda sua validação. Viabilidade pelo software-architect depois |

---

**▶ Ponto de compromisso: protótipo validado pelo usuário**

# Downstream — entrega

## Pronto para fazer (WIP 5)
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|

## Em andamento (WIP 1 por agente)
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|
| K-011 | Pré-entrega, envio da branch e descrição do PR | 001 | tech-lead | 2026-10-09 | 2026-10-10 02:56 | QA r3 aprovado; reconciliar com o parecer 001-branch-final r2. Itens abertos no PR: baixos C5, C6, 001, 006 |

## Code review (WIP 2)
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|
| K-017 | Migrações iniciais (parte 1; seed pendente) | 002 | node-backend | 2026-10-09 | 2026-10-09 21:35 | Entregue em 324b472 (worktree feature/arquitetura-mysql), sem review até agora |

## QA (WIP 2)
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|

## Revisado, aguardando o envio da branch (documentação, fora do WIP)
Documentos revisados e aprovados; seguem no PR de cada pedido.

| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|
| K-018 | ADR 0003 + ADR 0002 + ADR 0001 e plano rev. 3 | 003 | software-architect → tech-lead | 2026-10-09 | 2026-10-09 19:02 | Aprovado; adendo da ADR 0002 em 8a88f83; segue no PR 1 |
| K-015 | Práticas de engenharia | 002 | tech-lead → software-architect | 2026-10-09 | 2026-10-09 19:02 | Aprovado; segue no PR 1 |
| K-014 | Arquitetura completa: overview, data-model, ADRs | 002 | software-architect + tech-lead | 2026-10-09 | 2026-10-09 21:28 | Aprovado na r2 (7783107), em `feature/arquitetura-mysql`; sem PR ainda |
| K-033 | Rascunho do contrato da API (002) | 002 | node-backend | 2026-10-09 | 2026-10-09 21:22 | Aprovado na r2 (697802c), mesmo worktree; decisão frescor corpo × cabeçalho depende do K-034 |

## Aguardando sua validação (WIP 2 PRs)
Todos no PR 1 do pedido 001, `develop` 4811cb9, QA r3 aprovado.

| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|
| K-004 | Front fase A1: scaffold, biblioteca de cálculo e gerador mock | 001 | react-frontend | 2026-10-09 | 2026-10-10 02:56 | PR 1 (feature/dashboard-mock); QA fase A 22:38; QA final r3 aprovado 2026-10-10 02:56; retrabalho K-027..K-029 |
| K-022 | Front fase A2: shell, filtros, tema e componentes base | 001 | react-frontend | 2026-10-09 | 2026-10-10 02:56 | PR 1 (feature/dashboard-mock); idem K-004 |
| K-027 | [bug] Code review fase A (14 bloqueantes) | 001 | react-frontend | 2026-10-09 | 2026-10-10 02:56 | PR 1 (feature/dashboard-mock); fechado com K-004/K-022; voltas: 1 (queda de API) |
| K-028 | [bug] UX fase A (8 altos) | 001 | react-frontend | 2026-10-09 | 2026-10-10 02:56 | PR 1 (feature/dashboard-mock); fechado com K-004/K-022 |
| K-029 | [ajuste] UX fase A (médios e baixos) | 001 | react-frontend | 2026-10-09 | 2026-10-10 02:56 | PR 1 (feature/dashboard-mock); fechado com K-004/K-022 |
| K-030 | Portão `npm run pronto`, matriz REGRAS_METRICA | 001 | react-frontend | 2026-10-09 | 2026-10-10 02:56 | PR 1 (feature/dashboard-mock); r1 com ajustes, fechados em K-043/K-016; voltas: 1; merge antecipado registrado |
| K-031 | Spec da matriz REGRAS_METRICA | 001 | software-architect | 2026-10-09 | 2026-10-10 02:56 | PR 1 (feature/dashboard-mock); doc usada pelo K-030 |
| K-016 | Monorepo: extração para `packages/` | 001 | react-frontend | 2026-10-09 | 2026-10-10 02:56 | PR 1 (feature/dashboard-mock); r1 com 2 bloqueantes, fechados (c410727, 19440cf) |
| K-032 | Aceitação dos cartões B | 001 | qa-engineer | 2026-10-09 | 2026-10-10 02:56 | PR 1 (feature/dashboard-mock); review aprovado (cc0ae07) |
| K-039 | [bug] QA fase A (médios e baixos) + R3 | 001 | react-frontend | 2026-10-09 | 2026-10-10 02:56 | PR 1 (feature/dashboard-mock); com K-006 |
| K-006 | Front B1a: Operacional diário | 001 | react-frontend | 2026-10-09 | 2026-10-10 02:56 | PR 1 (feature/dashboard-mock); B1 r1 aprovado |
| K-023 | Front B1b: Operacional semanal | 001 | react-frontend | 2026-10-09 | 2026-10-10 02:56 | PR 1 (feature/dashboard-mock); B1 r1 aprovado |
| K-007 | Front B2: Tático | 001 | react-frontend | 2026-10-09 | 2026-10-10 02:56 | PR 1 (feature/dashboard-mock); B2 r1 aprovado |
| K-024 | Front B2b: Estratégico | 001 | react-frontend | 2026-10-09 | 2026-10-10 02:56 | PR 1 (feature/dashboard-mock); B2 r1 aprovado |
| K-008 | Front B3a: Sustentação | 001 | react-frontend | 2026-10-09 | 2026-10-10 02:56 | PR 1 (feature/dashboard-mock); B3 r1 aprovado |
| K-025 | Front B3b: Espera invisível | 001 | react-frontend | 2026-10-09 | 2026-10-10 02:56 | PR 1 (feature/dashboard-mock); B3 r1 aprovado |
| K-026 | Front B3c: Visão geral | 001 | react-frontend | 2026-10-09 | 2026-10-10 02:56 | PR 1 (feature/dashboard-mock); B3 r1 aprovado |
| K-041 | [ajuste] Fronteiras ESLint ADR 0002 | 001 | react-frontend | 2026-10-09 | 2026-10-10 02:56 | PR 1 (feature/dashboard-mock); c410727; aprovado em 001-K-043-r1 |
| K-042 | [ajuste] Integração entre painéis (EI) | 001 | react-frontend | 2026-10-09 | 2026-10-10 02:56 | PR 1 (feature/dashboard-mock); 8eb5cd3; aprovado em 001-K-043-r1 |
| K-043 | [ajuste] Rodada consolidada (B3 r1, K-041, K-042, F4) | 001 | react-frontend | 2026-10-09 | 2026-10-10 02:56 | PR 1 (feature/dashboard-mock); voltas: 2; aprovado em 001-K-044-045-r1 |
| K-044 | [bug] QA/UX B3 | 001 | react-frontend | 2026-10-09 | 2026-10-10 02:56 | PR 1 (feature/dashboard-mock); aprovado em 001-K-044-045-r1 |
| K-045 | [bug] QA B12 e O7 saldo | 001 | react-frontend | 2026-10-09 | 2026-10-10 02:56 | PR 1 (feature/dashboard-mock); aprovado em 001-K-044-045-r1 |
| K-046 | [bug] UX B12 (2 altos, 5 médios) | 001 | react-frontend | 2026-10-09 | 2026-10-10 02:56 | PR 1 (feature/dashboard-mock); aprovado em 001-K-046-r1 |
| K-047 | [bug] Faixa Pede atenção com carregando/erro | 001 | react-frontend | 2026-10-09 | 2026-10-10 02:56 | PR 1 (feature/dashboard-mock); aprovado em 001-K-047-048-r1 |
| K-048 | [bug] QA final: 007 (S7) e 008 (CLS) | 001 | react-frontend | 2026-10-09 | 2026-10-10 02:56 | PR 1 (feature/dashboard-mock); 007 ok; 008 voltas: 3 (K-048, K-049, K-050) |
| K-049 | [bug] Reserva de altura só no esqueleto (bloqueante do branch-final) | 001 | react-frontend | 2026-10-09 | 2026-10-10 02:56 | PR 1 (feature/dashboard-mock); aprovado em 001-K-049-050-r1 |
| K-050 | [bug] CLS a 375 px (008) | 001 | react-frontend | 2026-10-09 | 2026-10-10 02:56 | PR 1 (feature/dashboard-mock); aprovado; QA r3 fecha 008 |
| K-009 | QA: automação E2E + axe e parecer | 001 | qa-engineer | 2026-10-09 | 2026-10-10 02:56 | PR 1 (feature/dashboard-mock); docs/qa/001-dashboard-mock.md r3: APROVADO (188/189, C6 instável isolado ok) |
| K-010 | Revisão de UX da interface implementada | 001 | ux-designer | 2026-10-09 | 2026-10-10 02:56 | PR 1 (feature/dashboard-mock); revisões B3 e B12 feitas; confirmar com o UX se há revisão final após K-050 |

## Pronto
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|
| K-001 | Especificação de UX do dashboard (rev. 1 e rev. 2) | 001 | ux-designer | 2026-10-09 | 2026-10-09 18:12 | Commits bf0baca, a60a37a |
| K-002 | ADR 0001 e plano técnico do dashboard mock (rev. 1 e 2) | 001 | software-architect | 2026-10-09 | 2026-10-09 18:13 | Commits f929ed1, fdb3b1d |
| K-003 | Plano de testes e esqueleto do pacote E2E | 001 | qa-engineer | 2026-10-09 | 2026-10-09 18:03 | Commit c157fdd |

## Bloqueado
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|

## Processo (pedidos 003–005) — fora do WIP e das métricas de fluxo
Cartões de processo e reuniões não contam no WIP do fluxo de entrega nem em lead/cycle time; têm um único estado.

| ID | Cartão | Pedido | Responsável | Estado | Obs. |
|---|---|---|---|---|---|
| K-012 | Reunião de checkpoint do pedido 001 (escopo e performance) | 003 | jarvis | Feito 2026-10-09 18:52 | Ata em `docs/alinhamentos/`; gera K-018 |
| K-013 | Kickoff do pedido 002 | 003 | jarvis | Feito 2026-10-09 18:52 | Ata em `docs/alinhamentos/`; libera K-014, K-016, K-017 |
| K-019 | Popular o quadro e o histórico | 004 | jarvis | Feito 2026-10-09 18:50 | — |
| K-020 | Commit dos arquivos de time e dos pedidos 002–005 | 005 | tech-lead | Feito 2026-10-09 | 6b2b3eb, 9f11794, 43cb7ad, afb6382 |
| K-021 | Auditoria do quadro e limites de WIP iniciais | 004 | agile-coach | Feito 2026-10-09 | Mudanças no histórico e em `melhorias.md` |
| K-037 | Pedido 006: paralelismo e discovery adiantado | 006 | jarvis | Em curso (K-035/K-036 pausados) | `docs/pedidos/006-*.md`; gera K-034..K-036 |
| K-038 | Reunião de melhoria nº 1 (fase A) | 006 | jarvis | Feito 2026-10-09 | Ata `docs/alinhamentos/2026-10-09-melhoria-01-fase-a.md`; M-004..M-012; branch `develop` e worktree 002 (84d8f14); gerou K-030 |
| K-051 | Retrospectiva do pedido 001 | 001 | agile-coach | Feito 2026-10-10 | `docs/retrospectivas/2026-10-10-001.md` |

## Políticas locais (acrescentadas na auditoria K-021)
- **Entrada é o backlog:** cartão com dependência aberta de outro cartão fica em Entrada; só entra em "Pronto para fazer" o que pode ser puxado agora (a espera por ata de reunião em andamento é a única exceção, e deve constar em Obs.).
- **Code review, QA e revisão de UX são colunas, não cartões:** não criar cartão para revisar outro cartão. K-009, K-010 e K-011 são trabalho próprio (automação E2E, revisão de UX, pré-entrega) e não duplicam as colunas.
- **Um cartão em "Em andamento" por agente**, salvo reunião e o lote de retrabalho do mesmo autor (K-027..K-029, ver política de bugs). Ver pedido 006.
- **Reunião de melhoria a cada entrega (M-011):** ao fim de cada entrega ao usuário, o Jarvis convoca reunião de melhoria e registra ata e experimentos em `melhorias.md`.
- **Tamanho:** um cartão por conjunto coeso de métricas ou por uma entrega revisável de uma vez; se o review não cabe numa sessão, dividir.
- **Aguardando sua validação:** limite 2 **PRs** (não cartões); os cartões de um mesmo PR contam como 1 unidade de validação. Esclarecimento proposto na retro 001 (M-013), pendente de aprovação do Jarvis.

## Políticas locais: bugs e retrabalho (K-027 a K-029)
Processo completo na skill `kanban-scrum`, seção "Bugs e retrabalho". Em resumo:
- **Achado vira cartão** `[bug]` ou `[ajuste]`, agrupado por origem, área e severidade; Obs. com origem, pai, severidade, link do parecer e voltas.
- **Fluxo:** Em andamento (autor original) -> Code review -> QA -> UX se houver interface. Conta como retrabalho.
- **Pai aguardando bugs** fica em Bloqueado e **não conta no WIP** (exceção registrada); os cartões de bug contam. Cartões de retrabalho do mesmo autor podem ocupar a vaga cheia (3), em ordem de severidade.
- **Bloqueante, crítico e alto** puxam antes de trabalho novo; médio e baixo só seguem abertos com aprovação do usuário. Limite de 3 voltas por bug, depois vai ao usuário.
- **Limites:** QA 2 e Aguardando sua validação 2 (M-001, ata D14).
