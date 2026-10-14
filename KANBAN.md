# Quadro Kanban

> Atualizado em: 2026-10-14 08:10 · Mantido pelo Jarvis; políticas do `agile-coach` (skill `kanban-scrum` do Forge).
> WIP: Empatizar 0/2 · Idear 0/2 · Validação do usuário 0 · Pronto para fazer 2/5 · Em andamento: react-frontend 1 (K-069), node-backend 1 (K-072), tech-lead 1 (K-076) · Code review 0/2 · QA 0/2 · Aguardando sua validação 1 PR (#63) · Bloqueados: 0
> O estado detalhado, as decisões e os próximos passos estão em `docs/kanban/estado-2026-10-14.md`. Os cartões até K-064 foram concluídos e arquivados; o registro está em `docs/kanban/historico.md`. O quadro ficou parado de 2026-10-10 a 2026-10-14 e foi reconstruído em 2026-10-14.

# Upstream — descoberta (Design Thinking)

## Entrada (backlog: cartões com dependência aberta)
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|
| K-073 | Sustentação no Operacional: front F1–F8 (visões Resumo, Diária, Semanal e Sustentação) | sust-no-operacional | forge:react-frontend | 2026-10-14 | 2026-10-14 08:10 | Depende de K-069 (mexe nos mesmos filtros) e de K-072 (contratos B1 e B2). O plano está em `docs/architecture/plano-sustentacao-no-operacional.md` e vai junto com K-072 |
| K-074 | Revisão geral de usabilidade: U1–U5, catálogo na Ajuda e topo enxuto | usabilidade | forge:react-frontend | 2026-10-14 | 2026-10-14 08:10 | Validado (`docs/ux/revisao-geral-usabilidade/04-decisoes.md`). Entra depois de K-073 (mesmas telas). O protótipo HTML vai junto com a feature |
| K-075 | Compatibilidade com celular, iPad e tablet (3 fatias, MOB-CA-1 a 27) | 010 | forge:react-frontend | 2026-10-14 | 2026-10-14 08:10 | O discovery está pronto. O usuário delegou as decisões ao time (D1 = B). Entra depois de K-074; o software-architect inclui o orçamento móvel na ADR 0003 |
| K-077 | Retrospectiva + melhoria do Forge: parecer gravado pelo Bash fica sem autoria e trava o merge | processo | forge:agile-coach | 2026-10-14 | 2026-10-14 08:10 | Travou o #64 por horas na noite de 13 para 14. Vira PR no Forge para instruir os agentes a gravar os pareceres só com Write ou Edit |

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
| K-070 | [bug] IS-002: teste de desempenho C3 instável sob carga | qa-intensivo | forge:node-backend | 2026-10-14 | 2026-10-14 08:10 | Severidade baixa, parecer em `docs/qa/intensivo-sistemico.md`. Entra no PR do lote K-069 ou logo depois |
| K-071 | [bug] IS-007: teste C5 imprime NaN e anota ok | qa-intensivo | forge:qa-engineer | 2026-10-14 | 2026-10-14 08:10 | Severidade baixa. Medido à parte: 30,1 MB |

## Em andamento (WIP 1 por agente)
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|
| K-069 | [bug] Lote dos testes intensivos (IF-001 a 007; IS-001, 003, 004, 005 e 006) + testes novos do QA | qa-intensivo | forge:react-frontend | 2026-10-14 | 2026-10-14 07:40 | Worktree `../MetricasDSPD-bugs`, branch `fix/bugs-intensivos` (develop 376d997 + `test/qa-intensivo-main`). IF-004: a O6 segue o filtro de tipo (decisão do usuário). IS-004 já resolvido pela espera invisível |
| K-072 | Sustentação no Operacional: back B1–B3 (contratos de tendência, biblioteca e API) + ADR 0019 | sust-no-operacional | forge:node-backend | 2026-10-14 | 2026-10-14 07:40 | Worktree `../MetricasDSPD-sust`, branch `feature/sustentacao-no-operacional`. As respostas P1 a P4 estão no plano, seção 10 |
| K-076 | Documentação do discovery (.md) para a develop | usabilidade/sust/010 | forge:tech-lead | 2026-10-14 | 2026-10-14 07:50 | Branch `docs/discovery-md`, só com .md; os protótipos HTML seguem com cada feature. Falta apagar a branch antiga `docs/discovery-usabilidade-sust-mobile` |

## Code review (WIP 2)
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|

## QA (WIP 2)
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|

## Aguardando sua validação (WIP 2 PRs)
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|
| PR #63 | Release homolog → main: espera invisível nos painéis (K-065), front via API (K-066) e correção do E2E de desempenho | — | usuário | 2026-10-13 | 2026-10-14 07:00 | Portão verde (5d2b70a) e homolog-aprovada verde. Falta a sua aprovação (Review → Approve) e o merge com merge commit. Muda a interface |

## Pronto
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|
| K-065 | Espera invisível dentro de cada painel | espera-invisivel | forge:react-frontend | 2026-10-13 | 2026-10-14 07:00 | #64 (376d997) na develop e #65 na homolog; segue no PR #63 |
| K-066 | Front via API (HttpFonteMetricas, VITE_FONTE) | — | forge:react-frontend | 2026-10-13 | 2026-10-13 22:44 | #59 e #61 na homolog; segue no PR #63 |
| K-067 | QA intensivo de filtros na main (IF-001 a 007) | qa-intensivo | forge:qa-engineer | 2026-10-13 | 2026-10-13 | Parecer em `docs/qa/intensivo-filtros.md`; os testes vão com K-069 |
| K-068 | QA intensivo sistêmico na main (IS-001 a 007) | qa-intensivo | forge:qa-engineer | 2026-10-13 | 2026-10-13 | Aprovado com ressalvas, sem bugs críticos nem altos; os testes vão com K-069 |

## Bloqueado
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|

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
