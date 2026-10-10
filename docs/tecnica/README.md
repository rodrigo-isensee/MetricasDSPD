# Documentação do MetricasDSPD — índice

Ponto de entrada de toda a documentação. A especificação é o briefing; o restante explica, decide ou registra.
Os diagramas são Mermaid (o GitHub renderiza). Quando uma decisão já está em ADR, os documentos técnicos linkam a ADR em vez de repetir.

## 1. Especificação (fonte da verdade)
| Documento | Para quê |
|---|---|
| [Briefing de execução](../briefing-execucao-metricas.md) | Regras de cálculo, catálogo de métricas, frentes WS1 a WS6, critérios de pronto. Vence qualquer conflito. |
| [Proposta de métricas ágeis](../proposta-metricas-ageis.md) | O porquê de cada métrica. |
| [Originais em HTML](../referencia/) | `briefing-execucao-metricas.html`, `proposta-metricas-ageis-unificada.html`. |

## 2. Pedidos do usuário
| Pedido | Tema |
|---|---|
| [001](../pedidos/001-dashboard-mock.md) | Dashboard de métricas com dados mockados (entregue, na `main`) |
| [002](../pedidos/002-arquitetura-completa.md) | Arquitetura completa do sistema |
| [003](../pedidos/003-reunioes-alinhamento.md) | Reuniões de alinhamento de escopo e performance |
| [004](../pedidos/004-kanban-e-melhoria-continua.md) | Quadro Kanban e melhoria contínua |
| [005](../pedidos/005-tech-lead-upstream-main-protegida.md) | Tech lead, upstream com Design Thinking, `main` protegida |
| [006](../pedidos/006-paralelismo-e-discovery-adiantado.md) | Paralelismo e discovery adiantado |
| [007](../pedidos/007-preferencias-de-metricas.md) | Preferências de métricas por usuário |

## 3. Arquitetura (decisões)
| Documento | Conteúdo |
|---|---|
| [ADR 0001 - Stack do front (etapa mock)](../architecture/adr/0001-stack-front-dashboard-mock.md) | React + Vite + TanStack Query + Recharts; `FonteMetricas` como fronteira |
| [ADR 0002 - Monorepo e pacotes compartilhados](../architecture/adr/0002-monorepo-pacotes-compartilhados.md) | `contratos`, `metricas`, `mock`, `web`; grafo e exports |
| [ADR 0003 - Orçamento de performance](../architecture/adr/0003-orcamento-de-performance.md) | Metas de bundle, tarefa longa, geração da base |
| [ADRs 0004 a 0012](../architecture/adr/) | MySQL, Kysely, coletas, contratos, framework, autenticação, implantação, pacote de cálculo, gráficos (0006, 0008 e 0010 substituídas pela 0013) |
| [ADR 0013 - Back-end modular serverless](../architecture/adr/0013-arquitetura-modular-serverless.md) | Um back-end Node com módulos em pastas, duas Lambdas (`api`, `coleta`), Hono + Kysely, AWS, Acelerato via Metabase |
| [Visão geral (C4 1 e 2)](../architecture/overview.md) | Contexto, containers na AWS, módulos, fluxo da coleta ao cartão, onde cada regra é garantida |
| [Modelo de dados](../architecture/data-model.md), [servidor](../architecture/server.md) e [roadmap](../architecture/roadmap.md) | Schemas e tabelas; organização do `server/`; ordem de implementação |
| [Plano técnico do dashboard mock](../architecture/features/dashboard-mock.md) | Módulos, contratos, divisão de tarefas do 001 |
| [Matriz de regras por métrica (M-005)](../architecture/regras-metricas.md) | Regra de cálculo de cada métrica rastreada ao briefing |

## 4. Documentação técnica (`docs/tecnica/`)
| Documento | Conteúdo |
|---|---|
| [Arquitetura do front](arquitetura-front.md) | C4 nível 3 do `web/`, fronteiras de lint, fluxo de dados até o cartão, filtros na URL, troca do mock pela API |
| [Modelo de dados do mock](modelo-de-dados-mock.md) | ER do BusinessMap (4.5 + extensões) e do Acelerato; parâmetros do gerador; hash da base |
| [Biblioteca de cálculo](biblioteca-de-calculo.md) | Núcleo compartilhado (T2.5): tempo útil, percentis, amostra, Monte Carlo |
| [Qualidade e testes](qualidade-e-testes.md) | Pirâmide de testes, gates, E2E, acessibilidade, performance |

## 5. Engenharia
| Documento | Conteúdo |
|---|---|
| [Guia do desenvolvedor](../engineering/guia-do-desenvolvedor.md) | Setup, scripts, como adicionar uma métrica |
| [Práticas de engenharia](../engineering/praticas.md) | Regras de código, fronteiras, revisão |

## 6. UX e Figma
| Documento | Conteúdo |
|---|---|
| [Dashboard de métricas — visão](../ux/dashboard-metricas/README.md) e [especificação](../ux/dashboard-metricas/especificacao.md) | Spec do 001: painéis, filtros (cap. 2), estados (cap. 6), `?mock=` (6.6) |
| [Design system](../ux/design-system.md) | Tokens, componentes, padrões |
| [Checklist de UX por cartão](../ux/checklist-cartao.md) | Critérios de revisão de cada cartão |
| Integração real: [empatia](../ux/integracao-real/01-empatia.md), [definição](../ux/integracao-real/02-definicao.md), [ideação](../ux/integracao-real/03-ideacao.md), [protótipo](../ux/integracao-real/04-prototipo.md), [especificação](../ux/integracao-real/05-especificacao.md) | Discovery da troca do mock pelos dados reais |
| Preferências de métricas: [empatia](../ux/preferencias-metricas/01-empatia.md), [definição](../ux/preferencias-metricas/02-definicao.md), [ideação](../ux/preferencias-metricas/03-ideacao.md), [protótipo](../ux/preferencias-metricas/04-prototipo/index.html), [validação](../ux/preferencias-metricas/05-validacao.md) | Discovery do pedido 007 |
| [Roteiro de importação no Figma](../ux/figma/roteiro-importacao.md) e [protótipos HTML](../ux/figma/prototipos/index.html) | html.to.design: design system, integração real, dados, preferências (1280 e 375) |

## 7. QA
| Documento | Conteúdo |
|---|---|
| [Plano de testes do dashboard mock](../qa/plano-testes-dashboard-mock.md) | Casos, critérios, cobertura |
| [Gate do autor](../qa/gate-do-autor.md) | O que o autor roda antes de pedir revisão |
| Relatórios: [fase A](../qa/001-fase-a.md), [B3](../qa/001-B3.md), [B12](../qa/001-B12.md), [final](../qa/001-dashboard-mock.md) | Execuções do 001 |
| [Aceitação por cartão do Kanban](../qa/aceitacao/) | K-006 a K-026 |
| [Bugs](../qa/bugs/) | Um arquivo por bug, com dono e estado |
| [Evidências](../qa/evidencias/) | Capturas, `axe-resumo.json`, [hash da base](../qa/evidencias/hash-base-fase-a.json) |

## 8. Reviews
Revisões de código e de UX do 001, em [`docs/reviews/`](../reviews/): por fase ([fase A](../reviews/001-fase-a.md), [r2](../reviews/001-fase-a-r2.md), [UX](../reviews/001-fase-a-ux.md)), por bloco (B1, B2, B3, B12), por cartão K-xxx, e as finais ([branch](../reviews/001-branch-final.md), [UX](../reviews/001-ux-final.md), [PR](../reviews/001-pr.md), [docs/ADR/práticas](../reviews/001-docs-adr-praticas.md)).

## 9. Alinhamentos, Kanban e retrospectivas
| Documento | Conteúdo |
|---|---|
| [Checkpoint 001 e kickoff 002](../alinhamentos/2026-10-09-checkpoint-001-kickoff-002.md) | Alinhamento de escopo |
| [Melhoria 01, fase A](../alinhamentos/2026-10-09-melhoria-01-fase-a.md) | Ajustes da fase A |
| [Decisões da review da fase A](../alinhamentos/2026-10-09-decisoes-review-fase-a.md) | Decisões do usuário |
| [Decisões do usuário (10/10)](../alinhamentos/2026-10-10-decisoes-do-usuario.md) | 001, integração real, 002, janela de calibração |
| [Histórico do quadro](../kanban/historico.md) e [experimentos de melhoria](../kanban/melhorias.md) | Kanban (pedido 004) |
| [Retrospectiva do 001](../retrospectivas/2026-10-10-001.md) | O que manter e mudar |

## 10. Onde está o código
| Pasta | Pacote | Documentação |
|---|---|---|
| `packages/contratos` | `@metricas-dspd/contratos` | [ADR 0002](../architecture/adr/0002-monorepo-pacotes-compartilhados.md) |
| `packages/metricas` | `@metricas-dspd/metricas` | [biblioteca-de-calculo.md](biblioteca-de-calculo.md) |
| `packages/mock` | `@metricas-dspd/mock` | [modelo-de-dados-mock.md](modelo-de-dados-mock.md) |
| `web/` | `@metricas-dspd/web` | [arquitetura-front.md](arquitetura-front.md) |
| `e2e/` | testes Playwright | [qualidade-e-testes.md](qualidade-e-testes.md) |
| `server/` | `@metricas-dspd/server` (migrações, seed, estado de coleta; HTTP e coletas a implementar, ADR 0013) | [server.md](../architecture/server.md) |
