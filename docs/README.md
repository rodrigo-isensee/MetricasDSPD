# Documentação do MetricasDSPD

Propósito: ponto de entrada único; leva cada leitor ao documento certo em até 2 cliques. Público: time, agentes de IA, arquiteto, QA, gerência e DPO. Revisão: 2026-10-11.

## Como ler
- **O briefing vence.** [`briefing-execucao-metricas.md`](briefing-execucao-metricas.md) é a especificação; a [proposta](proposta-metricas-ageis.md) explica o porquê.
- **Tipos de documento:** decisão (ADR), contrato (API), domínio (especificação), guia (como fazer) e registro (QA, reviews, alinhamentos).
- **Código:** `server/` (API e coleta), `web/` (painéis), `packages/` (contratos, cálculo, mock), `e2e/` (testes). Mapa em [`tecnica/README.md`](tecnica/README.md).
- **Regras invioláveis** (sem avaliação individual, BusinessMap e Acelerato nunca se misturam) ficam no [briefing](briefing-execucao-metricas.md) e no `CLAUDE.md`; não são copiadas aqui.
- Operação do banco (backup, restauração, agendamento): [`engineering/operacao-banco.md`](engineering/operacao-banco.md).
- Padrão das páginas e dos diagramas: [`engineering/padrao-de-documentacao.md`](engineering/padrao-de-documentacao.md).

## Por pergunta
| Quero... | Vá para |
|---|---|
| Chamar a API ou ver um DTO | [`api/openapi.json`](api/openapi.json), [`api/metricas.md`](api/metricas.md), [`api/fontes.md`](api/fontes.md) |
| Ver os contratos entre contextos | [`contratos/README.md`](contratos/README.md) |
| Entender um agregado e suas invariantes | [Mapa de domínio](especificacao/domain/README.md), depois o `_context.md` do contexto |
| Ver os diagramas de domínio (DDD) | [`architecture/ddd/README.md`](architecture/ddd/README.md) ([plano](architecture/ddd/00-plano.md), [agregados](architecture/ddd/03-agregados.md)) |
| Entender o desenho geral (C4) | [`architecture/overview.md`](architecture/overview.md) |
| Saber por que Postgres, Fastify ou Kysely | [ADR 0014](architecture/adr/0014-stack-tecnica-do-back-end.md) e [ADR 0015](architecture/adr/0015-bibliotecas-e-praticas-do-back-end.md) |
| Ver tabelas e schemas | [`architecture/data-model.md`](architecture/data-model.md) |
| Ver a regra de cálculo de uma métrica | [`architecture/regras-metricas.md`](architecture/regras-metricas.md) |
| Subir o ambiente e adicionar uma métrica | [`engineering/guia-do-desenvolvedor.md`](engineering/guia-do-desenvolvedor.md) |
| Saber quais dados pessoais são lidos | [`security/revisao-de-seguranca.md`](security/revisao-de-seguranca.md) |
| Ver o plano de testes e o gate | [`tecnica/qualidade-e-testes.md`](tecnica/qualidade-e-testes.md), [`qa/`](qa/README.md) |
| Ver a spec de tela e o design system | [`ux/`](ux/README.md) |

## Por papel (ordem de leitura)
| Papel | Leia nesta ordem |
|---|---|
| Desenvolvedor novo | 1. este índice; 2. briefing, seções 00 a 04; 3. [`architecture/overview.md`](architecture/overview.md); 4. [guia do desenvolvedor](engineering/guia-do-desenvolvedor.md); 5. o `_context.md` do contexto da tarefa |
| Agente de IA | 1. `CLAUDE.md`; 2. regras do briefing; 3. [`regras-metricas.md`](architecture/regras-metricas.md); 4. [mapa de domínio](especificacao/domain/README.md); 5. [`api/openapi.json`](api/openapi.json) |
| Arquiteto | 1. [`overview.md`](architecture/overview.md); 2. ADRs vigentes (abaixo); 3. [`data-model.md`](architecture/data-model.md); 4. [`ddd/00-plano.md`](architecture/ddd/00-plano.md) |
| QA | 1. [`qualidade-e-testes.md`](tecnica/qualidade-e-testes.md); 2. [`qa/`](qa/README.md); 3. [`qa/aceitacao/`](qa/aceitacao/K-006.md) |
| Gerente / DPO | 1. catálogo de métricas no briefing; 2. [`api/metricas.md`](api/metricas.md); 3. [`api/fontes.md`](api/fontes.md); 4. [`security/revisao-de-seguranca.md`](security/revisao-de-seguranca.md) |

## Mapa por pasta
| Pasta | Conteúdo |
|---|---|
| [`architecture/`](architecture/overview.md) | Decisões: ADRs, C4, modelo de dados, roadmap, planos de feature, [DDD](architecture/ddd/00-plano.md) |
| `contratos/` | [Contratos](contratos/README.md) |
| [`api/`](api/openapi.json) | OpenAPI e necessidades de dados |
| [`especificacao/domain/`](especificacao/domain/README.md) | Domínio por contexto |
| [`tecnica/`](tecnica/README.md) | Como o código funciona hoje |
| [`engineering/`](engineering/guia-do-desenvolvedor.md) | Práticas, guia, [padrão de documentação](engineering/padrao-de-documentacao.md) |
| [`security/`](security/revisao-de-seguranca.md) | Revisão de segurança |
| [`ux/`](ux/README.md) | Discovery, especificações, design system |
| [`qa/`](qa/README.md) | Planos, relatórios, bugs, evidências |
| [`pedidos/`](pedidos/001-dashboard-mock.md) | Pedidos do usuário (001 a 009) |
| `reviews/`, `alinhamentos/`, `kanban/`, `retrospectivas/` | Registros; alcançados pelas pastas acima, fora do índice |

## ADRs: vigentes e substituídas
Estado de cada ADR conforme [o padrão](engineering/padrao-de-documentacao.md#estado-das-adrs).

| Estado | ADR |
|---|---|
| Vigente | [0014 Stack do back-end](architecture/adr/0014-stack-tecnica-do-back-end.md) (parcial: acesso a dados e tipos pela 0015), [0015 Bibliotecas e práticas](architecture/adr/0015-bibliotecas-e-praticas-do-back-end.md), [0013 Monólito modular](architecture/adr/0013-arquitetura-modular-serverless.md) (AWS é alvo futuro, ver 0014) |
| Vigente | [0001 Stack do front](architecture/adr/0001-stack-front-dashboard-mock.md), [0002 Monorepo](architecture/adr/0002-monorepo-pacotes-compartilhados.md), [0003 Performance](architecture/adr/0003-orcamento-de-performance.md), [0005 Acesso a dados](architecture/adr/0005-acesso-a-dados-e-migracoes.md), [0007 Contratos](architecture/adr/0007-contratos-e-validacao-front-back.md), [0011 Cálculo compartilhado](architecture/adr/0011-pacote-de-calculo-compartilhado.md), [0012 Gráficos](architecture/adr/0012-biblioteca-de-graficos.md) (algumas com trechos substituídos, marcados no texto) |
| Proposta | [0009 Autenticação](architecture/adr/0009-autenticacao-e-autorizacao.md) (aguarda SSO) |
| Substituída | [0004 MySQL](architecture/adr/0004-banco-mysql-base-analitica.md) por 0014; [0006 Coletas e webhook](architecture/adr/0006-processos-coleta-webhook-automacoes.md) por 0013; [0008 Framework](architecture/adr/0008-framework-da-api.md) por 0013 e 0014; [0010 Implantação e CI](architecture/adr/0010-implantacao-e-ci.md) por 0013 e 0014 |
| Arquivadas | [`architecture/propostas/`](architecture/propostas/README.md): não valem |

## Pedidos, planos e especificação de tela
- Pedidos do usuário: [`pedidos/`](pedidos/001-dashboard-mock.md).
- Planos de feature: [dashboard mock](architecture/features/dashboard-mock.md), [integração real](architecture/features/integracao-real.md), [exportar métricas](architecture/features/exportar-metricas.md).
- Especificação de tela: [dashboard](ux/dashboard-metricas/especificacao.md), [integração real](ux/integracao-real/05-especificacao.md), [preferências](ux/preferencias-metricas/06-especificacao.md).

## Roteiro de achabilidade (meta: 60 s por tarefa)
Quem testa parte deste índice, sem buscar no repositório. Cronometre; sucesso é chegar ao arquivo certo em até 2 cliques e 60 s.

| # | Leitor | Tarefa | Destino esperado |
|---|---|---|---|
| 1 | Desenvolvedor novo | Achar como subir o ambiente | `engineering/guia-do-desenvolvedor.md` |
| 2 | Agente de IA | Achar o contrato da rota de métricas | `api/openapi.json` |
| 3 | Arquiteto | Achar por que o banco é Postgres | ADR 0014 |
| 4 | QA | Achar o gate antes do PR | `tecnica/qualidade-e-testes.md` |
| 5 | Gerente / DPO | Achar quais dados pessoais são lidos | `security/revisao-de-seguranca.md` |
| 6 | Qualquer | Achar o diagrama do contexto `flow` | `especificacao/domain/flow/_context.md` |

Registro dos resultados em `docs/ux/documentacao-tecnica/validacao.md`.
