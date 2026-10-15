# Quadro Kanban

> Atualizado em: 2026-10-14 15:30 · Mantido pelo Jarvis; políticas do `agile-coach` (skill `kanban-scrum` do Forge).
> WIP: Validação do usuário 1 (K-078) · Pronto para fazer 0/5 · Em andamento: agile-coach 1 (K-077), software-architect 1 (K-079), qa-engineer 1 (K-080) · Code review 0/2 · QA 0/2 · Aguardando sua validação 0 PRs · Bloqueados: 0
> O estado detalhado, as decisões e os próximos passos estão em `docs/kanban/estado-2026-10-14-tarde.md`. Os cartões até K-064 foram concluídos e arquivados; o registro está em `docs/kanban/historico.md`. O quadro ficou parado de 2026-10-10 a 2026-10-14 e foi reconstruído em 2026-10-14.

# Upstream — descoberta (Design Thinking)

## Entrada (backlog: cartões com dependência aberta)
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|
| K-091 | [teste] IFA-001: o IF-A não verifica cartão no /operacional padrão nem no /estrategico | qa-intensivo | forge:qa-engineer | 2026-10-15 | 2026-10-15 02:00 | Médio, já existia antes. Lacuna de cobertura do teste; o time escolhe filtros que exibam "Não afetado por". Decisão técnica, não vai ao usuário |
| K-092 | [teste] IF-U-operacional instável sob carga (timeout de 30 s) | qa-intensivo | forge:react-frontend | 2026-10-15 | 2026-10-15 02:00 | 1 falha em 2 rodadas no QA do K-083 |
| K-093 | [bug] SNO-005: primeira consulta depois de subir a API passa de 300 ms | sust-no-operacional | forge:node-backend | 2026-10-15 | 2026-10-15 02:00 | Baixo, já existia antes. O usuário aceita ou prioriza na volta |
| K-085 | [segurança] GRANT por coluna: agg_ sem entregas; ref_conta_automacao fora do dspd_api (M-4, B-3) | 011 | forge:node-backend | 2026-10-14 | 2026-10-14 22:00 | ADR 0020. Antes da fase 3 |
| K-086 | [segurança] Erro e log sem valor do payload (B-4) | 011 | forge:node-backend | 2026-10-14 | 2026-10-14 22:00 | ADR 0020 |
| K-087 | Spike B-5: tipo do campo Time responsável e domínio fechado | 011 | forge:node-backend | 2026-10-14 | 2026-10-14 22:00 | ADR 0020; junto com a integração |
| K-088 | [segurança] Lint do coletor resistente a contorno (B-2) | 011 | forge:tech-lead | 2026-10-14 | 2026-10-14 22:00 | ADR 0020 |
| K-089 | [segurança] Teste da allow-list com a lista de campos proibidos escrita no próprio teste (B-1) | 011 | forge:qa-engineer | 2026-10-14 | 2026-10-14 22:00 | ADR 0020 |
| K-084 | [segurança] Coletor: allow-list na stg_card e no webhook (M-1, M-2) e lista fechada na stg_revision (M-3) | 011 | forge:node-backend | 2026-10-14 | 2026-10-14 21:30 | Parecer de segurança da ADR 0020. Antes da fase 3 do 011 |
| K-081 | Registro da versão 0.13.0 do Forge na develop | processo | usuário | 2026-10-14 | 2026-10-14 19:00 | Branch local chore/forge-0.13.0-versao. O arquivo de versão do Forge só o usuário altera (R-CONFORMIDADE); fica como ação dele |
| K-074 | Revisão geral de usabilidade: U1–U5, catálogo na Ajuda e topo enxuto | usabilidade | forge:react-frontend | 2026-10-14 | 2026-10-14 08:10 | Validado (`docs/ux/revisao-geral-usabilidade/04-decisoes.md`). Entra depois de K-073 (mesmas telas). O protótipo HTML vai junto com a feature |
| K-075 | Compatibilidade com celular, iPad e tablet (3 fatias, MOB-CA-1 a 27) | 010 | forge:react-frontend | 2026-10-14 | 2026-10-14 08:10 | O discovery está pronto. O usuário delegou as decisões ao time (D1 = B). Entra depois de K-074; o software-architect inclui o orçamento móvel na ADR 0003 |

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

## Em andamento (WIP 1 por agente)
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|
| K-072+K-073 | Sustentação no Operacional: back B1–B3 e front F1–F8 | sust-no-operacional | forge:react-frontend | 2026-10-14 | 2026-10-15 00:40 | QA aprovado com ressalvas (80d2fbf, 18d8327, 032c470). Correções: SNO-002, SNO-004 e texto da A6; SNO-001 e SNO-005 já existiam antes. Revisão de UX em paralelo |
| K-078 | Pedido 011: 17 métricas (O19–O26, T10–T14, E6–E9; T14 nova a pedido do usuário) | 011 | forge:node-backend | 2026-10-14 | 2026-10-14 21:00 | Back fase 1, B1 a B12 (ata da revisão de desenho). B1 em andamento na worktree -011-back. Plano vigente; ADR 0020 proposta (falta o review de segurança antes da fase 2). Front depois de K-074 e K-075 |
| K-077 | Retrospectiva + melhoria do Forge: parecer gravado pelo Bash fica sem autoria e trava o merge | processo | forge:agile-coach | 2026-10-14 | 2026-10-14 15:30 | Retro 002 e proposta (a, b, c) prontas. 3 PRs prontos e commitados em ~/.forge-contrib/MetricasDSPD, mas o push foi barrado pelo pre-push do Forge, que não roda dentro do Claude. Ação do usuário: push e PR pelo terminal dele |
| K-079 | Pedido 011: ajustes técnicos (T10, O25) e confirmações da API do BusinessMap (responsáveis nas revisões, tipos de vínculo, spike P-T1) | 011 | forge:software-architect | 2026-10-14 | 2026-10-14 15:30 | Feito em 2026-10-14 (plano §8). Abertas ao usuário: D-14', bordas Q-a/Q-b da D-5', motivos de descarte do O25 |
| K-080 | Plano de testes da Sustentação no Operacional (a partir da especificação, em paralelo ao review) | sust-no-operacional | forge:qa-engineer | 2026-10-14 | 2026-10-14 15:30 | Plano pronto (77 casos, 10 ambiguidades A1–A10 enviadas ao UX). A execução entra quando o review aprovar |

## Code review (WIP 2)
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|

## QA (WIP 2)
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|

## Aguardando sua validação (WIP 2 PRs)
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|

## Pronto
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|
| K-083 | [bug] E2E IF-A vermelho na CI da develop (intensivo-filtros.spec.ts:401) | qa-intensivo | forge:tech-lead | 2026-10-14 | 2026-10-15 09:20 | #75 mesclado na develop (b5ac4f5) |
| K-082 | PR de docs: orçamento móvel na ADR 0003 (K-075) | 010 | forge:tech-lead | 2026-10-14 | 2026-10-15 09:20 | #74 mesclado na develop |
| K-090 | Alinhar data-model §3.1/§9 e businessmap-api-configuracao à ADR 0020 | 011 | forge:software-architect | 2026-10-14 | 2026-10-14 22:20 | Feito, sem commit; vai no próximo PR de docs |
| K-076 | Documentação do discovery (.md) para a develop | usabilidade/sust/010 | forge:tech-lead | 2026-10-14 | 2026-10-14 15:30 | #66 na develop |
| K-071 | [bug] IS-007: teste C5 imprime NaN e anota ok | qa-intensivo | forge:qa-engineer | 2026-10-14 | 2026-10-14 15:30 | No lote #70 (develop), #71 (homolog) e release #72 na main |
| K-070 | [bug] IS-002: teste de desempenho C3 instável sob carga | qa-intensivo | forge:node-backend | 2026-10-14 | 2026-10-14 15:30 | No lote #70 (develop), #71 (homolog) e release #72 na main |
| K-069 | [bug] Lote dos testes intensivos (IF-001 a 007; IS-001, 003, 004, 005 e 006) + testes novos do QA | qa-intensivo | forge:react-frontend | 2026-10-14 | 2026-10-14 15:30 | No lote #70 (develop), #71 (homolog) e release #72 na main |
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
