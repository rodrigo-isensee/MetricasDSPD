# Quadro Kanban

> Atualizado em: 2026-10-17 08:25 · Mantido pelo Jarvis; políticas do `agile-coach` (skill `kanban-scrum` do Forge).
> WIP: retomada na sessão do Forge 0.19.0 (dia: teto de 2 agentes, uma tarefa pesada por vez) · Bloqueados: 0
> Retomada de 2026-10-17: pedidos 011 (seção "Retomada"), 012 (K-102), 013 (limpeza e docs), 014 (#101), 015 (montecarlo) e 016 (homolog-aprovada). Até 2026-10-16 o quadro ficou desatualizado; o registro daquele período está em `docs/kanban/estado-2026-10-14-noite.md` e no histórico.

# Upstream — descoberta (Design Thinking)

## Entrada (backlog: cartões com dependência aberta)
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|
| K-112 | Cadastro de membros por time (Q-T14-10 = B): ADR 0020 e plano §9.5 | 011 | forge:software-architect | 2026-10-17 | 2026-10-17 10:00 | Com o security-engineer. Antes da fase 3 |
| K-113 | C6 do perf do PR sem margem (188 a 215 ms contra 200) | 014 | forge:software-architect | 2026-10-17 | 2026-10-17 10:00 | Propor medida com margem sem afrouxar o orçamento (ADR 0003) |
| K-110 | Front do 011, lote 2 (táticas): T10, T11, T12, T13, T14 | 011 | forge:react-frontend | 2026-10-17 | 2026-10-17 06:30 | Depois do PR do lote 1 |
| K-111 | Front do 011, lote 3 (operacionais): O19, O20, O21, O23, O24, O25, O22, O26 | 011 | forge:react-frontend | 2026-10-17 | 2026-10-17 06:30 | Depois do PR do lote 2 |
| K-107 | [teste] montecarlo.test.ts instável por semente aleatória (E1) | 015 | forge:node-backend | 2026-10-17 | 2026-10-17 06:30 | Falhou no #96 (parecer de devops de 2026-10-16) e de novo no push do #108 em 2026-10-17 (semente 1324607460, contraexemplo [[2,0,6,5,0,7,0,8],29], 12 >= 12.15; passou ao rerrodar). Depois do K-103 ou numa vaga |
| K-108 | homolog-aprovada espera o portão terminar (E1) | 016 | forge:devops-engineer | 2026-10-17 | 2026-10-17 06:30 | Corrida vista no #90 e no #96 |
| K-091 | [teste] IFA-001: o IF-A não verifica cartão no /operacional padrão nem no /estrategico | qa-intensivo | forge:qa-engineer | 2026-10-15 | 2026-10-15 02:00 | Médio, já existia antes. Lacuna de cobertura do teste; o time escolhe filtros que exibam "Não afetado por". Decisão técnica, não vai ao usuário |
| K-092 | [teste] IF-U-operacional instável sob carga (timeout de 30 s) | qa-intensivo | forge:react-frontend | 2026-10-15 | 2026-10-15 02:00 | 1 falha em 2 rodadas no QA do K-083 |
| K-093 | [bug] SNO-005: primeira consulta depois de subir a API passa de 300 ms | sust-no-operacional | forge:node-backend | 2026-10-15 | 2026-10-15 02:00 | Baixo, já existia antes. Decisão do usuário de 2026-10-16: corrigir (SNO = C) |
| K-086 | [segurança] Erro e log sem valor do payload (B-4) | 011 | forge:node-backend | 2026-10-14 | 2026-10-14 22:00 | ADR 0020 |
| K-087 | Spike B-5: tipo do campo Time responsável e domínio fechado | 011 | forge:node-backend | 2026-10-14 | 2026-10-14 22:00 | ADR 0020; junto com a integração |
| K-088 | [segurança] Lint do coletor resistente a contorno (B-2) | 011 | forge:tech-lead | 2026-10-14 | 2026-10-14 22:00 | ADR 0020 |
| K-089 | [segurança] Teste da allow-list com a lista de campos proibidos escrita no próprio teste (B-1) | 011 | forge:qa-engineer | 2026-10-14 | 2026-10-14 22:00 | ADR 0020 |
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
| K-115 | [teste] E2E instável sob carga local: IF-U-operacional e CA-19 axe (sustentação no operacional) estouram 30 s na suíte completa | 021 | forge:qa-engineer | 2026-10-18 | 2026-10-18 02:10 | Pré-existentes; passam sozinhos e na CI. Depois da homolog, junto do K-107 |

## Em andamento (WIP 1 por agente)
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|
| K-103 | Back da fase 2 do 011: E6, E7 R$, E8, T13, T14, O22, O26 (E1, E2) | 011 | forge:tech-lead | 2026-10-17 | 2026-10-17 10:00 | worktree: -011-fase2 · os 3 lotes na develop: #105, #107 (8516ff8), #109 (5ad02ea). Falta a promoção para a homolog (pedido 023), depois do #108 e do 024 |
| K-104 | Docs da R-1 = B: ADR 0020 e plano (E3) | 011 | forge:software-architect | 2026-10-17 | 2026-10-17 10:00 | Na develop (#102). CAs da especificação (ux-designer, E3.2) pendentes |

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
| K-114 | E7 sem R$ (participação por entregas) e nome "Entregas por sistema" | 024/029 | forge:tech-lead | 2026-10-17 | 2026-10-17 12:45 | #114 (ed6ba46) na develop; R-1 aceita pelo dono; pergunta do catálogo do E7 com o dono |
| K-077 | Melhoria do Forge: autoria do parecer gravado pelo Bash | processo | usuário | 2026-10-14 | 2026-10-17 09:59 | Repassada à fábrica pelo usuário (prompt de melhorias, A4) |
| K-081 | Registro da versão 0.13.0 do Forge na develop | processo | usuário | 2026-10-14 | 2026-10-17 09:59 | Obsoleto: substituído pelo PR #113 (0.19.0) |
| K-105 | Limpeza de worktrees e docs da retomada | 013/017/019 | usuário | 2026-10-17 | 2026-10-17 09:52 | -qa removida; docs na develop (#102) |
| K-109 | Front do 011, lote 1 (estratégicas): E9, E6, E7, E8 | 011/021/028 | forge:tech-lead | 2026-10-17 | 2026-10-17 09:45 | #108 (d83024b) na develop; ressalvas baixas da UX: "Demais 1 sistema" e teste manual com leitor de tela |
| K-084 | [segurança] Coletor: allow-list (M-1, M-2, M-3) | 011 | forge:node-backend | 2026-10-14 | 2026-10-17 08:26 | #77 (0fe209a) na develop |
| K-085 | [segurança] GRANT por coluna (M-4, B-3) | 011 | forge:node-backend | 2026-10-14 | 2026-10-17 08:26 | #80 (f9d1079) na develop |
| K-102 | perf da visão semanal (fila de montagem dos gráficos) | 012/018 | forge:tech-lead | 2026-10-17 | 2026-10-17 12:05 | #103 mesclado na develop (48b909a). TBT da semanal a confirmar no perf-homolog; 4 itens manuais para a validação do usuário |
| K-106 | Checks do #101 (homolog → main) | 014 | usuário | 2026-10-17 | 2026-10-17 09:50 | #101 mesclado na main pelo usuário |
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
