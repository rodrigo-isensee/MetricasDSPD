# Ata — Checkpoint do pedido 001 e kickoff do pedido 002

Data: 2026-10-09, ~19:00 · Conduzida pelo Jarvis (pedido 003)
Participantes: software-architect, tech-lead, qa-engineer, ux-designer, node-backend, agile-coach. O react-frontend estava executando a fase A (K-004) e foi representado pela leitura do estado de `web/` feita pelos demais.

## 1. Estado de cada frente
| Frente | Estado |
|---|---|
| 001 — especificação de UX (K-001) | Rev. 2 commitada; vale como base (sem validação de protótipo, pedido 005) |
| 001 — plano técnico e ADR 0001 (K-002) | Rev. 2 commitada |
| 001 — plano de testes (K-003) | Commitado; precisa de rev. 2 para cobrir a spec rev. 2 |
| 001 — fase A (K-004) | Em andamento. Existem `contracts/`, `lib/metrics` (núcleo + todas as métricas do núcleo), `mock/` (BM e Acelerato), `data/` (FonteMetricas, MockFonteMetricas, useMetrica, `?mock=`), `components/ui` e `components/charts`. Faltam `main.tsx`, shell, rotas, barra de filtros, tema, `/ajuda` e `eslint.config.js` |
| 002 | Não iniciado; kickoff nesta reunião |
| Processo (004/005) | Quadro populado e auditado; commits do pedido 005 feitos (6b2b3eb, 9f11794, 43cb7ad, afb6382) |

## 2. Escopo
- **Faltando (esperado, fase A em curso):** shell, rotas, filtros na URL, tema, `/ajuda`, painéis.
- **Faltando (problema):** `eslint.config.js` não existe — as regras de fronteira do ADR 0001 (painel não calcula, BM × AC não se importam, `Math.random`/`Date.now` proibidos) estão sem garantia.
- **Sobrando / mudado (aceito, registrar):** campo `titulo` em `DimCard` (fictício, para listas O2/bloqueados — entra na lista de extensões P15); `MapaCalor` (conferir com a spec); `feriados.ts` absorvido por `calendario.ts`.
- **Nenhum desvio de escopo em relação ao pedido.** Nenhuma visão individual encontrada.

## 3. Performance (medição real, QA, ~19:00, fase A incompleta)
| Item | Medição | Orçamento proposto | Situação |
|---|---|---|---|
| Type-check | 4,2 s, passa | — | ok |
| Testes unitários | 5 arquivos, 64 testes, passam, 8,3 s | — | ok |
| Lint | **falha** (sem `eslint.config.js`) | verde | fora |
| Build | **falha** em 0,5 s (entry ausente) | verde | fora |
| Bundle inicial gzip | pendente (build quebrado) | < 200 KB | pendente |
| Geração do mock (Node) | 196–275 ms (5.788 cards, 6.062 chamados) + contexto 113–147 ms | < 500 ms total | ok |
| Cálculo por métrica | maioria ≤ 30 ms; O1 a frio 554 ms | < 50 ms p95 | **fora** (frio) |
| `VISAO_GERAL` | 655 ms | painel < 300 ms | **fora** |
| 33 métricas, filtro 12 semanas | 1,4 s somados | — | atenção |
| LCP, troca de filtro, Lighthouse | pendente (app não existe) | LCP < 2,0 s desktop; resposta < 100 ms, painel < 500 ms | pendente |

## 4. Decisões
| # | Decisão | Por quem |
|---|---|---|
| D1 | Orçamento de performance do projeto = proposta do arquiteto (seção 2 da posição dele), registrado em ADR (K-018). | arquiteto + Jarvis |
| D2 | Monorepo com npm workspaces: `packages/contratos`, `packages/metricas` (subpaths `core`, `businessmap`, `acelerato`), `packages/mock`, `server/`, `web/`, `e2e/`; escopo `@metricas-dspd/*`; pacotes como TS-fonte. ADR 0002; ADR 0001 parcialmente substituída. | arquiteto + tech-lead |
| D3 | Extração para os pacotes **depois** do code review e QA da fase A e **antes** da fase B: commit mecânico (`git mv` + imports), critério = testes verdes e mesmo hash da base mock. Executa: react-frontend. | arquiteto + tech-lead |
| D4 | Branches: monorepo e todo o 001 na `feature/dashboard-mock` (PR 1). O restante do 002 (docs completos, MySQL, migrações, seed, `server/`) em `feature/arquitetura-mysql`, criada a partir da `feature/dashboard-mock` após a extração, em `git worktree` separado (PR 2, encadeado). | tech-lead |
| D5 | O 001 chega ao usuário em **um único PR** (decisão do usuário no pedido 005). Sugestão do agile-coach de PRs por conjunto de painéis: não adotada. | Jarvis |
| D6 | Antes de fechar a fase A, o react-frontend cria `eslint.config.js` com as regras do ADR, deixa o build verde, troca `Math.min(...array)` por laço na lib, aperta o teste de tempo do gerador para 1,5 s e otimiza `VISAO_GERAL` e as chamadas a frio (memoização; Web Worker se o orçamento pedir). | Jarvis (devolvido ao autor) |
| D7 | Troca de filtro mantém o conteúdo anterior com indicação discreta de atualização; skeleton só na carga inicial e na troca de painel; cada cartão carrega de forma independente; latência simulada do mock 150–400 ms. | ux-designer |
| D8 | Code review da fase A em 4 blocos (cálculo e contratos com rigor máximo contra o briefing; mock; dados; componentes e acessibilidade); depois um review por cartão da fase B; review final da branch. Autores não commitam: o tech-lead commita após o review. | tech-lead |
| D9 | `docs/engineering/praticas.md` mínimo (K-015) antes da fase B. | tech-lead + arquiteto |
| D10 | Spec de UX movida para `docs/ux/dashboard-metricas/especificacao.md` (nova convenção), com README registrando a dispensa do Design Thinking (pedido 005); feito junto da extração, para não mexer no arquivo durante a fase A. | ux-designer, commit do tech-lead |
| D11 | Revisão de UX do shell e dos filtros ao fim da fase A, em paralelo ao code review, antes da fase B. QA entra **por cartão** da fase B, não num bloco no fim. | Jarvis |
| D12 | Fase B na ordem K-022 → K-006 → K-023 → K-007 → K-024 → K-008 → K-025 → K-026; review, QA e UX do cartão anterior correm em paralelo ao seguinte. | agile-coach |
| D13 | Ferramenta de migração (Prisma × Kysely + SQL versionado), framework da API (Fastify recomendado), schemas `dspd_bm` / `dspd_ac` / `dspd_core`, staging append-only: decididos em ADR no 002. | arquiteto + tech-lead + node-backend |
| D14 | Limites de WIP do agile-coach adotados como experimento (QA 2, Aguardando 2 — M-001; divisão de cartões — M-002; faixa Processo fora do WIP — M-003). O agile-coach alinha a skill `kanban-scrum`. | Jarvis |
| D15 | Testes no 002: paridade mock em memória × seed no MySQL; E2E com projetos `mock` e `api`; MySQL 8 em container no CI. | qa-engineer |

## 5. Riscos e bloqueios
| Risco | Responsável | Próximo passo |
|---|---|---|
| Lint de fronteiras ausente | react-frontend | D6 |
| `VISAO_GERAL` e cálculo a frio acima do orçamento | react-frontend | D6, remedir no QA |
| Tech-lead como único revisor (gargalo) | tech-lead | review de K-004 tem prioridade sobre K-014/K-015 |
| Pasta de trabalho compartilhada entre agentes | tech-lead | worktree para o 002 (D4) |
| Extensões ao modelo 4.5 viram colunas MySQL | arquiteto | registrar no data-model do 002 como provisórias |

## 6. Decisões de produto pendentes (vão no resumo final, não bloqueiam — pedido 005)
Janela de 12 semanas para frente e projeto; P1 em horas úteis ou corridas; calendário de feriados (nacional, SC, municipal); método de percentil; demais perguntas da spec (seção 11) e do plano técnico (seção 9). Para o 002: hospedagem, SSO, rede até o MySQL do Acelerato (réplica?), limite de taxa do BusinessMap, LGPD.

## 7. Ações
| Ação | Responsável | Quando |
|---|---|---|
| Concluir fase A com D6 | react-frontend | agora |
| ADR do orçamento de performance (K-018) e ADR 0002 do monorepo + ajuste do 0001 | software-architect | agora |
| `praticas.md` (K-015) | tech-lead + arquiteto | agora, antes da fase B |
| Code review da fase A | tech-lead | ao receber K-004 |
| Revisão de UX do shell | ux-designer | ao receber K-004/K-022 |
| Extração para pacotes + mover a spec | react-frontend / ux-designer / tech-lead | após review e QA da fase A |
| Plano de testes rev. 2 + medição de performance automatizada | qa-engineer | antes da fase B |
| Arquitetura completa do 002 (K-014) | arquiteto + tech-lead | após a extração, no worktree |
