# Quadro Kanban

> Atualizado em: 2026-10-10 10:55 · Mantido pelo Jarvis; políticas do `agile-coach` (`.claude/skills/kanban-scrum/SKILL.md`).
> WIP: Empatizar 0/2 · Idear 0/2 · Validação do usuário 1 (K-055) · Pronto para fazer 1/5 (K-034) · Em andamento: react-frontend 2 (K-056, K-057; 2 instâncias) · Code review 3/2 (K-017, K-053, K-054; K-053 fecha com o pai K-017) · QA 0/2 · Aguardando sua validação 1 PR (#2) · Bloqueados: 1 (K-017, depende do usuário: Docker)
> Item mais antigo em andamento: K-056/K-057 (10:31). Pedido 001 concluído (PR #1 mesclado, eff026a). Atenção: Code review acima do limite (3/2); K-017 aguarda Docker na máquina para os testes MySQL.
> Pedido 002 (`feature/arquitetura-mysql`): K-014, K-033 aprovados; K-017 re-review (bugs K-053 corrigidos, 831779d); ambiente Docker pronto (fce13e1); data-model atualizado pelo arquiteto, sem commit. Pedido 006: K-034 validado; K-035/K-036 pausados até o UX ficar livre. Pedido 007: K-055 aguarda validação (5 pontos + D-f, D-g).

# Upstream — descoberta (Design Thinking)

## Entrada (backlog: cartões com dependência aberta)
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|
| K-035 | Discovery: métricas fora do núcleo | 006 | ux-designer | 2026-10-09 | 2026-10-09 20:53 | PAUSADO; retoma (entra em Empatizar) quando o UX ficar livre |
| K-036 | Discovery: lacuna de valor na sustentação | 006 | ux-designer | 2026-10-09 | 2026-10-09 20:53 | PAUSADO; retoma quando o UX ficar livre |

## Empatizar e definir (WIP 2)
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|

## Idear e prototipar (WIP 2)
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|

## Validação do usuário
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|
| K-055 | Preferências de métricas por usuário (discovery) | 007 | ux-designer + software-architect | 2026-10-10 | 2026-10-10 10:21 | Discovery (151954d) e viabilidade (780290f) prontos; aguarda sua validação: 5 pontos + D-f, D-g |

---

**▶ Ponto de compromisso: protótipo validado pelo usuário**

# Downstream — entrega

## Pronto para fazer (WIP 5)
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|
| K-034 | Integração real (BusinessMap e Acelerato) e tela /dados | 006 | a definir | 2026-10-09 | 2026-10-10 10:04 | Validado com ajustes (decisões 2026-10-10); spec final e tela /dados em a428edf; implementação futura |

## Em andamento (WIP 1 por agente)
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|
| K-056 | Cobertura 100% dos pacotes (contratos, metricas, mock) | 001 | react-frontend (instância 1) | 2026-10-10 | 2026-10-10 10:40 | Baseline 1b9b291; QA liga thresholds depois; 2 instâncias do mesmo agente (exceção de paralelismo) |
| K-057 | Cobertura 100% do web | 001 | react-frontend (instância 2) | 2026-10-10 | 2026-10-10 10:40 | Baseline 1b9b291 (web 91,6/87,1/86,5/89,4) |

## Code review (WIP 2)
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|
| K-053 | [bug] K-017 r1 (id_origem, gravarStgCard, recomendados) | 002 | node-backend | 2026-10-10 | 2026-10-10 10:50 | origem code review; pai K-017; parecer docs/reviews/002-K-017-r1.md; corrigido (831779d), em re-review do tech-lead; fecha com o pai |
| K-054 | [bug] Timeouts dos testes do web sob carga | 001 | react-frontend | 2026-10-10 | 2026-10-10 10:50 | Feito (937efa1), em review do tech-lead |

## QA (WIP 2)
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|

## Revisado, aguardando o envio da branch (documentação, fora do WIP)
Documentos revisados e aprovados; seguem no PR de cada pedido.

| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|
| K-014 | Arquitetura completa: overview, data-model, ADRs | 002 | software-architect + tech-lead | 2026-10-09 | 2026-10-09 21:28 | Aprovado na r2 (7783107), em `feature/arquitetura-mysql`; sem PR ainda |
| K-033 | Rascunho do contrato da API (002) | 002 | node-backend | 2026-10-09 | 2026-10-09 21:22 | Aprovado na r2 (697802c), mesmo worktree; decisão frescor corpo × cabeçalho depende do K-034 |

## Aguardando sua validação (WIP 2 PRs)
PR 1 (pedido 001) mesclado pelo usuário em 2026-10-10 09:50 (eff026a).

| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|
| PR #2 | develop → main (docs técnicas do 001, guia do desenvolvedor 659ed9c, DoD com documentação eb4dc4d, UX/Figma 14394f5, spec de integração real a428edf) | 001/006 | usuário | 2026-10-10 | 2026-10-10 | Aberto pelo usuário; aguarda sua validação |

## Pronto
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|
| K-058 | Documentação técnica do 001 (`docs/tecnica/`, 6428396, 51fdb4c) | 001 | software-architect + tech-lead | 2026-10-10 | 2026-10-10 | Pronto na develop; segue no PR #2 (ID K-058 atribuído nesta atualização) |
| K-011 | Pré-entrega, envio da branch e descrição do PR | 001 | tech-lead | 2026-10-09 | 2026-10-10 09:50 | Merge do PR #1 (eff026a) pelo usuário |
| K-018 | ADR 0003 + ADR 0002 + ADR 0001 e plano rev. 3 | 003 | software-architect → tech-lead | 2026-10-09 | 2026-10-10 09:50 | Merge do PR #1 (eff026a) pelo usuário |
| K-015 | Práticas de engenharia | 002 | tech-lead → software-architect | 2026-10-09 | 2026-10-10 09:50 | Merge do PR #1 (eff026a) pelo usuário |
| K-004 | Front fase A1: scaffold, biblioteca de cálculo e gerador mock | 001 | react-frontend | 2026-10-09 | 2026-10-10 09:50 | Merge do PR #1 (eff026a) pelo usuário |
| K-022 | Front fase A2: shell, filtros, tema e componentes base | 001 | react-frontend | 2026-10-09 | 2026-10-10 09:50 | Merge do PR #1 (eff026a) pelo usuário |
| K-027 | [bug] Code review fase A (14 bloqueantes) | 001 | react-frontend | 2026-10-09 | 2026-10-10 09:50 | Merge do PR #1 (eff026a) pelo usuário |
| K-028 | [bug] UX fase A (8 altos) | 001 | react-frontend | 2026-10-09 | 2026-10-10 09:50 | Merge do PR #1 (eff026a) pelo usuário |
| K-029 | [ajuste] UX fase A (médios e baixos) | 001 | react-frontend | 2026-10-09 | 2026-10-10 09:50 | Merge do PR #1 (eff026a) pelo usuário |
| K-030 | Portão `npm run pronto`, matriz REGRAS_METRICA | 001 | react-frontend | 2026-10-09 | 2026-10-10 09:50 | Merge do PR #1 (eff026a) pelo usuário |
| K-031 | Spec da matriz REGRAS_METRICA | 001 | software-architect | 2026-10-09 | 2026-10-10 09:50 | Merge do PR #1 (eff026a) pelo usuário |
| K-016 | Monorepo: extração para `packages/` | 001 | react-frontend | 2026-10-09 | 2026-10-10 09:50 | Merge do PR #1 (eff026a) pelo usuário |
| K-032 | Aceitação dos cartões B | 001 | qa-engineer | 2026-10-09 | 2026-10-10 09:50 | Merge do PR #1 (eff026a) pelo usuário |
| K-039 | [bug] QA fase A (médios e baixos) + R3 | 001 | react-frontend | 2026-10-09 | 2026-10-10 09:50 | Merge do PR #1 (eff026a) pelo usuário |
| K-006 | Front B1a: Operacional diário | 001 | react-frontend | 2026-10-09 | 2026-10-10 09:50 | Merge do PR #1 (eff026a) pelo usuário |
| K-023 | Front B1b: Operacional semanal | 001 | react-frontend | 2026-10-09 | 2026-10-10 09:50 | Merge do PR #1 (eff026a) pelo usuário |
| K-007 | Front B2: Tático | 001 | react-frontend | 2026-10-09 | 2026-10-10 09:50 | Merge do PR #1 (eff026a) pelo usuário |
| K-024 | Front B2b: Estratégico | 001 | react-frontend | 2026-10-09 | 2026-10-10 09:50 | Merge do PR #1 (eff026a) pelo usuário |
| K-008 | Front B3a: Sustentação | 001 | react-frontend | 2026-10-09 | 2026-10-10 09:50 | Merge do PR #1 (eff026a) pelo usuário |
| K-025 | Front B3b: Espera invisível | 001 | react-frontend | 2026-10-09 | 2026-10-10 09:50 | Merge do PR #1 (eff026a) pelo usuário |
| K-026 | Front B3c: Visão geral | 001 | react-frontend | 2026-10-09 | 2026-10-10 09:50 | Merge do PR #1 (eff026a) pelo usuário |
| K-041 | [ajuste] Fronteiras ESLint ADR 0002 | 001 | react-frontend | 2026-10-09 | 2026-10-10 09:50 | Merge do PR #1 (eff026a) pelo usuário |
| K-042 | [ajuste] Integração entre painéis (EI) | 001 | react-frontend | 2026-10-09 | 2026-10-10 09:50 | Merge do PR #1 (eff026a) pelo usuário |
| K-043 | [ajuste] Rodada consolidada (B3 r1, K-041, K-042, F4) | 001 | react-frontend | 2026-10-09 | 2026-10-10 09:50 | Merge do PR #1 (eff026a) pelo usuário |
| K-044 | [bug] QA/UX B3 | 001 | react-frontend | 2026-10-09 | 2026-10-10 09:50 | Merge do PR #1 (eff026a) pelo usuário |
| K-045 | [bug] QA B12 e O7 saldo | 001 | react-frontend | 2026-10-09 | 2026-10-10 09:50 | Merge do PR #1 (eff026a) pelo usuário |
| K-046 | [bug] UX B12 (2 altos, 5 médios) | 001 | react-frontend | 2026-10-09 | 2026-10-10 09:50 | Merge do PR #1 (eff026a) pelo usuário |
| K-047 | [bug] Faixa Pede atenção com carregando/erro | 001 | react-frontend | 2026-10-09 | 2026-10-10 09:50 | Merge do PR #1 (eff026a) pelo usuário |
| K-048 | [bug] QA final: 007 (S7) e 008 (CLS) | 001 | react-frontend | 2026-10-09 | 2026-10-10 09:50 | Merge do PR #1 (eff026a) pelo usuário |
| K-049 | [bug] Reserva de altura só no esqueleto (bloqueante do branch-final) | 001 | react-frontend | 2026-10-09 | 2026-10-10 09:50 | Merge do PR #1 (eff026a) pelo usuário |
| K-050 | [bug] CLS a 375 px (008) | 001 | react-frontend | 2026-10-09 | 2026-10-10 09:50 | Merge do PR #1 (eff026a) pelo usuário |
| K-009 | QA: automação E2E + axe e parecer | 001 | qa-engineer | 2026-10-09 | 2026-10-10 09:50 | Merge do PR #1 (eff026a) pelo usuário |
| K-010 | Revisão de UX da interface implementada | 001 | ux-designer | 2026-10-09 | 2026-10-10 09:50 | Merge do PR #1 (eff026a) pelo usuário |
| K-001 | Especificação de UX do dashboard (rev. 1 e rev. 2) | 001 | ux-designer | 2026-10-09 | 2026-10-09 18:12 | Commits bf0baca, a60a37a |
| K-002 | ADR 0001 e plano técnico do dashboard mock (rev. 1 e 2) | 001 | software-architect | 2026-10-09 | 2026-10-09 18:13 | Commits f929ed1, fdb3b1d |
| K-003 | Plano de testes e esqueleto do pacote E2E | 001 | qa-engineer | 2026-10-09 | 2026-10-09 18:03 | Commit c157fdd |

## Bloqueado
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|
| K-017 | Migrações iniciais e seed | 002 | node-backend | 2026-10-09 | 2026-10-10 10:50 | Origem: Code review. Testes MySQL dependem de Docker na máquina (ação do usuário); ambiente pronto em fce13e1; re-review dos bugs K-053 em curso |

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
- **Documentação faz parte da entrega (pedido do usuário, 2026-10-10):** um cartão só sai de Em andamento com a documentação técnica atualizada (`docs/tecnica/` para front e biblioteca; `docs/architecture/` + `docs/api/` para o back) e a de UX (`docs/ux/`) coerente com a tela. O tech-lead verifica no code review (`praticas.md` seções 7 e 8); sem doc, volta ao autor.
- **Aguardando sua validação:** limite 2 **PRs** (não cartões); os cartões de um mesmo PR contam como 1 unidade de validação. Esclarecimento proposto na retro 001 (M-013), pendente de aprovação do Jarvis.

## Políticas locais: bugs e retrabalho (K-027 a K-029)
Processo completo na skill `kanban-scrum`, seção "Bugs e retrabalho". Em resumo:
- **Achado vira cartão** `[bug]` ou `[ajuste]`, agrupado por origem, área e severidade; Obs. com origem, pai, severidade, link do parecer e voltas.
- **Fluxo:** Em andamento (autor original) -> Code review -> QA -> UX se houver interface. Conta como retrabalho.
- **Pai aguardando bugs** fica em Bloqueado e **não conta no WIP** (exceção registrada); os cartões de bug contam. Cartões de retrabalho do mesmo autor podem ocupar a vaga cheia (3), em ordem de severidade.
- **Bloqueante, crítico e alto** puxam antes de trabalho novo; médio e baixo só seguem abertos com aprovação do usuário. Limite de 3 voltas por bug, depois vai ao usuário.
- **Limites:** QA 2 e Aguardando sua validação 2 (M-001, ata D14).
