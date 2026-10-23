# Pedido 036: pendências das métricas estratégicas

- **Data:** 2026-10-20
- **Origem:** usuário: "veja se tem algo das metricas estrategicas pendentes se tem comece por ele, senao va para taticas e por ultimo operacional. Depois de tudo isso faremos as integracoes oficiais funcionar."
- **Modo:** implementar
- **Objetivo:** fechar o que falta das métricas estratégicas antes de passar às táticas.
- **Clareza:** 3 confirmado, 1 suposição, 0 técnico; 1 pergunta na fila (texto do E7 no catálogo).

## Escopo
- E1. FA-006: medir de novo o CLS de /estrategico com `VITE_FONTE=api` (bug `docs/qa/bugs/FA-006-cls-de-estrategico-em-api-acima-do-orcamento.md`, 0,113 contra 0,1 da ADR 0003 F2); se continuar acima, corrigir. · `confirmado`
- E2. IFA-001 (K-091), parte do /estrategico: o teste de "Não afetado por" passa a verificar o cartão em /estrategico. · `confirmado`
- E3. Texto do E7 no catálogo: trocar "Quanto da nossa capacidade vai para manter cada sistema do parque?" por "Qual a participação de cada sistema nas nossas entregas?" no catálogo e na especificação. · `confirmado` (decisão do dono, opção A)

## Etapas
- E1.1 (forge:qa-engineer): medição do FA-006 (3 execuções, mock e api), na branch do pedido.
- E2.1 (forge:qa-engineer): teste do IFA-001 em /estrategico, na mesma branch, depois do E1.1 (R-WIP).
- E1.2 (forge:react-frontend): correção do FA-006, só se a medição confirmar o estouro.
- E1.3 (forge:tech-lead): code review.
- E1.4 (forge:qa-engineer): QA e parecer.
- E1.6 (forge:ux-designer): revisão de UX da interface implementada (texto do E7 no cartão de /estrategico) contra a especificação, antes do PR; parecer gravado sem commit (o UX não tem Bash), commitado pelo tech-lead no E1.5.
- E1.5 (forge:tech-lead): PR para a develop e merge.
- E3.1 (dono): decidir o texto do E7 no catálogo (feito: opção A).
- E3.2 (forge:react-frontend): trocar o texto no catálogo e o teste que o cita.
- E3.3 (forge:ux-designer): trocar o texto na especificação.

## Fora do escopo
- IFA-001 no /operacional (vai com as operacionais, lote 3). · `confirmado`
- Táticas (K-110) e operacionais (K-111): pedidos seguintes, nesta ordem. · `confirmado`
- Integrações oficiais (fase 3 do 011): depois das operacionais. · `confirmado`

## Suposições
- O pedido pula o discovery (R-DISCOVERY: correção e teste sem impacto de interface); o Jarvis avisou o usuário. · `suposição` · base: R-DISCOVERY, regra da fábrica.

## Critério de pronto
- PQ-1 CLS de /estrategico < 0,1 em api e mock, 3 de 3 execuções · prova: cmd · `técnico`
- PQ-2 teste do IFA-001 em /estrategico verde na CI · prova: run · `técnico`
- PQ-3 PR mesclado na develop com review e QA · prova: merge · `técnico`

## Decisões do usuário (registro literal)
DECISÃO DO DONO (2026-10-20): ordem das pendências: "veja se tem algo das metricas estrategicas pendentes se tem comece por ele, senao va para taticas e por ultimo operacional. Depois de tudo isso faremos as integracoes oficiais funcionar."
DECISÃO DO DONO (2026-10-20): recibo do pedido 036 aceito ("sim").
DECISÃO DO DONO (2026-10-20): E7 no catálogo, opção A ("A"): a pergunta passa a ser "Qual a participação de cada sistema nas nossas entregas?" (catálogo `web/src/content/catalogo-metricas.ts` e especificação `docs/ux/metricas-tambem-disponiveis/02-especificacao.md` §E7).

## Andamento
- 2026-10-20 — Recibo ao usuário: vou fazer: QA mede o FA-006 e completa o IFA-001 no /estrategico; react-frontend corrige o FA-006 se ainda estourar; review, QA e PR na develop; não vou fazer: IFA-001 no /operacional, táticas, operacionais e integrações (vêm depois, nesta ordem). Usuário: "sim".
- 2026-10-20 22:50 — E1.5 (tech-lead, brief tech-lead-2): commitou a revisão de UX (90d35a6, aprovada, sem bloqueante; push) e revalidou o review por delta (fe6a50a, local). Parou antes do PR: o commit do UX deixou o parecer de QA desatualizado no `forge-check pr`. PQ-1 a PQ-4 não cumpridos (relato do autor); a entrega é conferida junto com a do PR. Próximo: QA revalida por delta (brief qa-engineer-5), depois o tech-lead abre o PR (novo brief).
- 2026-10-20 23:15 — E1.5 (tech-lead, brief tech-lead-3): PR #133 aberto às 23:01 pela conta dos agentes (rodrigoisenseemobile-eng). Às 23:03:32 a conta do dono (rodrigo-isensee) fez "Update branch" (c03a960, merge da develop na branch) e às 23:03:41 o squash merge (568ea48), antes de os checks do PR terminarem. O tech-lead só esperava os checks: a tentativa dele, às 23:11, recebeu "already merged". O CI do push na develop (568ea48) ficou verde. A linha `Cartão: K-118` não entrou no squash (vai registrada aqui: o K-118 é o FA-006, E1). Limpeza da branch e da worktree -030 feita.
- NAO-ENTENDI: 2026-10-20 · merge do #133 pela conta do dono; dono: "acredito que nao fui eu". Evidência e sugestão (sessões da conta; proteção da develop com checks obrigatórios) levadas ao dono.

## Pedido × entregue (2026-10-20)
| Item | Pedido | Entregue | Prova |
|---|---|---|---|
| E1 | FA-006: medir de novo o CLS de /estrategico em api; corrigir se acima | Não reproduz (CLS 0,021 em api); sem correção | f3a2995; squash 568ea48 (#133) |
| E2 | IFA-001 em /estrategico: o teste de "Não afetado por" verifica o cartão | IF-A em /estrategico com mínimo de 1 cartão verificado | 154f43a; squash 568ea48 (#133) |
| E3 | Texto do E7 no catálogo e na especificação (opção A) | Catálogo e especificação trocados; revisão de UX aprovada | bf137a9, a711371, 90d35a6; squash 568ea48 (#133) |

Pendências: o merge do #133 foi feito pela conta do dono via web, antes de os checks do PR terminarem (CI da develop verde depois); a linha `Cartão: K-118` não está no squash. Promoção para a homolog vai com o pedido 037.

Retrospectiva: `docs/retrospectivas/2026-10-20-036-estrategicas-pendentes.md` (agile-coach). Destino das MELHORIA:
- (1) M16, (2) UX depois do QA (M19), (3) brief com commit a agente sem Bash (M17) e (5) cartão sem código (M20): fábrica Forge, no prompt ao Jarvis da fábrica que o dono leva.
- (4) proteção da develop: decisão perguntada ao dono.
- (6) e (7): já nos cartões K-120 e K-121.

O custo em tokens foi lançado em `docs/kanban/entregas.md`, com a ressalva M21. Pedido encerrado.

## Registro de clareza
- PERGUNTA: 2026-10-20 · recibo do pedido 036
- 2026-10-20 — K-118: brief do QA (reteste do FA-006) aprovado pelo conferente na rodada 1 e delegado ao forge:qa-engineer (worktree -030, branch feature/036-estrategicas-pendentes). Discovery pulado (R-DISCOVERY: correção sem impacto de interface); usuário avisado.
- PERGUNTA: 2026-10-20 · texto do E7 no catálogo: A "Qual a participação de cada sistema nas nossas entregas?" (sugestão da revisão de UX, docs/ux/revisao-024-e7-nome.md); B manter o texto atual. Recomendação: A.
- 2026-10-20 — Usuário: "A" (texto do E7). Registrado em Decisões.
- 2026-10-20 — E1.1 não cumprido (QA): o Chromium do Playwright não abre: faltam bibliotecas de sistema (`libnspr4.so`). Branch feature/036-estrategicas-pendentes criada em 12018de, sem commit. Ação pendente do dono: `cd /home/rodrigoisensee/MetricasDSPD/e2e && sudo pnpm exec playwright install-deps chromium`. O hook do Forge recusou `flock` (vai como melhoria ao Forge). Enquanto isso, o E3 (texto do E7) segue sem navegador.
- 2026-10-20 — E1.1: FA-006 não reproduz na develop 12018de (CLS de /estrategico em api 0,021 nas 3 execuções; mock 0,001); reteste em f3a2995. A E1.2 (correção) não se aplica: a condição do E1 ("se continuar acima, corrigir") não se cumpriu. Ruído de C6 em mock (212 ms numa de 3) vai para o K-113.
- MELHORIA: 2026-10-20 · previews órfãos de outra worktree na porta 4173 bloqueiam o `test:perf` (playwright.config.ts fixa 4173/4174 com reuseExistingServer); vira cartão K-120 (tech-lead, melhoria técnica do projeto).
- 2026-10-20 — E3.3: o forge:ux-designer trocou a pergunta do E7 na especificação (§5 linha 238 e §11), sem commit: o agente não tem Bash e o brief pedia commit e push (falha do brief do Jarvis). O commit do arquivo entra no brief do forge:tech-lead (E1.3, review), antes do review.
- 2026-10-20 — E2.1 (QA): IF-A de /estrategico com filtros `sistema=protheus,crm` e `periodo=6m`, mínimo de 1 verificado (2 verificados: E9, E8); a mutação falha; 4 rotas do IF-A verdes (154f43a). Conferência: "não cumpriu" só pela mensagem do commit sem "Cartão: K-091" (praticas §9); sem reescrever commit enviado, a linha vai na mensagem do squash do PR (E1.5).
- 2026-10-20 — E1.3: review aprovado (fc9ecf2), sem bloqueante; especificação commitada em a711371; `pnpm run pronto` rc=0. Recomendações: A1 linha "Cartão: K-091" no squash (E1.5); A2 nota do IFA-001 linha 36 diz "pedido 036" para o /operacional (vai no lote 3), o QA corrige no E1.4.
- MELHORIA: 2026-10-20 · `forge-check docs` com 10 documentos antigos sem frontmatter (ADR 0004) esconde achados novos; cartão K-121 (tech-lead).
- 2026-10-20 — E1.4: QA aprovado, 0 bug, sobre cc88922 (A2 corrigido); parecer 97f8545; E7 visível no cartão de /estrategico; IF-A 4/4, lote 1 10/10. Entra a revisão de UX (E1.6) antes do PR, pelo fluxo do projeto (passo 5 do CLAUDE.md).

## Histórico
- 2026-10-20 21:48: entrega conferida bf137a9f90cdfb4f27e941da41668895d1d37b93
- 2026-10-20 21:59: entrega conferida f3a299580596cb03220a282447ab0f442bb20294
- 2026-10-20 22:24: entrega conferida fc9ecf2ff8813b59687042c15d25ec0eda88ed36
- 2026-10-20 22:45: entrega conferida 97f854520563ad8e634dc935819b0be8c214f68b
- 2026-10-20 — E1.6: revisão de UX aprovada, sem achado (docs/ux/revisao-036-e7-pergunta.md, sem commit; o tech-lead commita no E1.5). Observação sem ação: 01-cobertura.md:47 ainda cita "capacidade" e "custo em R$" na cobertura histórica.
