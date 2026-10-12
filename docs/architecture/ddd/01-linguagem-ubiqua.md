# Linguagem ubíqua: termo canônico e identificador do Siegard

Propósito: fixar, para cada conceito do domínio, o termo em português usado em toda a documentação e o identificador em inglês do Siegard. Público: desenvolvedores, agentes de IA, arquiteto e QA. Revisão: 2026-10-11.

Regra: o termo canônico é o da primeira coluna (confirmação do idioma pendente, pergunta 1 do [plano](00-plano.md)). Atributos, campos e colunas não se repetem aqui; ficam no Siegard (links na coluna "Siegard"), em [`data-model.md`](../data-model.md) e em `packages/contratos`. Regras invioláveis: ver `CLAUDE.md` e [`overview.md`](../overview.md) §5.

## Como ler as tabelas
- **Siegard**: arquivo em `docs/especificacao/domain/<contexto>/`; o identificador em inglês é o nome do arquivo.
- **Onde vive**: tabela física ou tipo TypeScript; "[planejado]" quando ainda não existe no código.
- Definição de uma linha, com a fonte (briefing, seção) quando for regra.

### Contexto Fluxo (`flow`, BusinessMap)
| Termo canônico | Siegard (identificador) | Onde vive | Definição | Fonte |
|---|---|---|---|---|
| Card | [`card`](../../especificacao/domain/flow/card.md) | `dspd_bm.dim_card`; `DimCard` | Unidade de trabalho do BusinessMap, com um tipo só e os marcos de tempo | briefing 4.1, 4.5 |
| Quadro | [`board`](../../especificacao/domain/flow/board.md) | `dspd_bm.ref_quadro` | Quadro do BusinessMap; quadro de teste fica fora de todo cálculo | briefing 4.2 |
| Nível do quadro | [`board-level`](../../especificacao/domain/flow/board-level.md) | `ref_quadro` (nível) | Equipe, coordenação ou gerência (`team`, `coordination`, `management`) | briefing 02 |
| Coluna | [`board-column`](../../especificacao/domain/flow/board-column.md) | `dspd_bm.ref_coluna`; `DimColuna` | Coluna do quadro, classificada em fila ou execução | briefing 4.2 |
| Tipo de coluna (fila ou execução) | [`column-kind`](../../especificacao/domain/flow/column-kind.md) | `ref_coluna.tipo_coluna` | Fila: nome inicia por "Aguardando" ou "Pronto para"; execução: nome da atividade | briefing 4.2 |
| Transição | [`card-transition`](../../especificacao/domain/flow/card-transition.md) | `dspd_bm.fato_transicao`; `FatoTransicao` | Movimentação do card entre colunas; a canônica é a revision, o webhook só antecipa | briefing 3.1; data-model §3.2 |
| Direção da transição (avanço ou retorno) | [`transition-direction`](../../especificacao/domain/flow/transition-direction.md) | `fato_transicao.direcao` | Se a transição avança ou volta no fluxo | briefing 4.5 |
| Bloqueio | [`card-block`](../../especificacao/domain/flow/card-block.md) | `dspd_bm.fato_bloqueio`; `FatoBloqueio` | Intervalo em que o card esteve bloqueado; é marca no card e não move de coluna | briefing 4.2 |
| Motivo de bloqueio | [`block-reason`](../../especificacao/domain/flow/block-reason.md) | `ref_dominio` | Domínio fechado de motivos | briefing 4.4 |
| Evento de ciclo de vida do card | [`card-lifecycle-event`](../../especificacao/domain/flow/card-lifecycle-event.md) | `dspd_bm.evt_card` | Criação, arquivamento, desarquivamento, exclusão detectada, restauração | data-model §3.2 |
| Tipo do evento de ciclo de vida | [`card-lifecycle-event-type`](../../especificacao/domain/flow/card-lifecycle-event-type.md) | `evt_card.tipo` | Lista fechada dos cinco eventos acima | data-model §3.2 |
| Tipo de card | [`card-type`](../../especificacao/domain/flow/card-type.md) | `dim_card.tipo` | Taxonomia de sete tipos; um tipo só por card | briefing 4.3 |
| Classe de serviço | [`service-class`](../../especificacao/domain/flow/service-class.md) | `dim_card.classe_servico` | Urgente, Prazo fixo, Padrão, Intangível | briefing 4.5 |
| Granularidade | [`granularity`](../../especificacao/domain/flow/granularity.md) | `dim_card.granularidade` | Story, frente ou projeto; nunca no mesmo histograma | briefing 02, 4.2 |
| Tamanho declarado | [`declared-size`](../../especificacao/domain/flow/declared-size.md) | `dim_card.tamanho_declarado` | P, M ou G | briefing 4.4 |
| Responsabilidade do atraso | [`delay-responsibility`](../../especificacao/domain/flow/delay-responsibility.md) | `dim_card.responsabilidade_atraso` | Interno, Solicitante ou Terceiro, no vencimento | briefing 4.4 |
| Severidade | [`severity`](../../especificacao/domain/flow/severity.md) | `dim_card.severidade` | Crítica, Alta, Média, Baixa (bug) | briefing 4.4 |
| Fase de detecção | [`detection-phase`](../../especificacao/domain/flow/detection-phase.md) | `dim_card.fase_deteccao` | Onde o bug foi encontrado | briefing 4.4 |
| Causa raiz | [`root-cause`](../../especificacao/domain/flow/root-cause.md) | `dim_card.causa_raiz` | Causa do bug, preenchida no fechamento | briefing 4.4 |
| Origem da demanda | [`demand-origin`](../../especificacao/domain/flow/demand-origin.md) | `dim_card.origem_demanda` | Origem de uma demanda de falha | briefing 4.4 |

### Contexto Sustentação (`support`, Acelerato)
| Termo canônico | Siegard (identificador) | Onde vive | Definição | Fonte |
|---|---|---|---|---|
| Chamado | [`ticket`](../../especificacao/domain/support/ticket.md) | `dspd_ac.dim_chamado`; `Chamado` | Chamado de sustentação, com resultado de SLA e prioridade | briefing 3.2 |
| Etapa do chamado | [`ticket-stage-interval`](../../especificacao/domain/support/ticket-stage-interval.md) | `dspd_ac.fato_etapa_chamado`; `EtapaChamado` | Intervalo do chamado numa etapa, mapeado a um dos cinco totalizadores | briefing 3.2, 3.4 |
| Natureza do chamado | [`ticket-nature`](../../especificacao/domain/support/ticket-nature.md) | `dim_chamado.natureza` | Requisição ou incidente | briefing 3.2 |
| Equipe de sustentação | [`support-team`](../../especificacao/domain/support/support-team.md) | `dim_chamado.equipe` | SSSC TOTVS, SENIOR ou FLUIG; é filtro, nunca comparação | briefing 3.2, CLAUDE.md |
| Prioridade (P1 a P5) | [`priority`](../../especificacao/domain/support/priority.md) | `dim_chamado.prioridade` | Resultado da matriz impacto × urgência | briefing 3.4 |
| Impacto | [`impact-level`](../../especificacao/domain/support/impact-level.md) | `dim_chamado.impacto` | Alto, Médio, Baixo | briefing 3.4 |
| Urgência | [`urgency-level`](../../especificacao/domain/support/urgency-level.md) | `dim_chamado.urgencia` | Alta, Média, Baixa | briefing 3.4 |
| Alvo por prioridade | [`priority-target`](../../especificacao/domain/support/priority-target.md) | `dspd_ac.ref_alvo_prioridade` | Prazos de primeiro atendimento e de restauração por prioridade | briefing 3.4 |
| Resultado do SLA | [`sla-outcome`](../../especificacao/domain/support/sla-outcome.md) | `dim_chamado.status_sla_r`, `status_sla_pa` | Realizado no prazo ou após o vencimento | briefing 3.2 |
| Motivo de escalação | [`escalation-reason`](../../especificacao/domain/support/escalation-reason.md) | `dim_chamado.motivo_escalacao` | Domínio fechado, saída de "Em diagnóstico" | briefing 3.4 |
| Nível de resolução | [`resolution-level`](../../especificacao/domain/support/resolution-level.md) | `dim_chamado.nivel_resolucao` | Nível que resolveu o chamado | data-model §4 |
| Motivo de encerramento | [`closure-reason`](../../especificacao/domain/support/closure-reason.md) | `dim_chamado.motivo_encerramento` | Domínio fechado, no encerramento | briefing 3.4 |
| Ação de automação do chamado | [`ticket-automation-action`](../../especificacao/domain/support/ticket-automation-action.md) | `dspd_ac.ctl_automacao` | Ação da automação externa (T4.3) [planejado: sem uso até a T4.3] | briefing 3.4; data-model §4 |
| Modo da automação | [`automation-mode`](../../especificacao/domain/support/automation-mode.md) | `ctl_automacao.modo` | Simulação ou ativo | data-model §4 |

### Contexto Métricas (`metrics`)
| Termo canônico | Siegard (identificador) | Onde vive | Definição | Fonte |
|---|---|---|---|---|
| Métrica | [`metric`](../../especificacao/domain/metrics/metric.md) | `MetricaId`; `REGRAS_METRICA` | Item do catálogo (O, T, S, E) com fonte, amostra mínima e segmentação | `regras-metricas.md` |
| Estatística | [`statistic`](../../especificacao/domain/metrics/statistic.md) | `Estatistica<T>` (`packages/contratos`) | Percentis ou taxa sobre uma classe de itens de uma só fonte | briefing 4.2 |
| Conjunto de percentis | [`percentile-set`](../../especificacao/domain/metrics/percentile-set.md) | `Percentis` | P50, P85 e P95; a média nunca aparece sozinha | briefing 4.2 |
| Taxa | [`rate-figure`](../../especificacao/domain/metrics/rate-figure.md) | `Taxa` | Razão entre contagens, publicada só com amostra suficiente | briefing 4.2 |
| Janela de cálculo | [`calculation-window`](../../especificacao/domain/metrics/calculation-window.md) | `Janela` | Janela móvel, 12 semanas por padrão | briefing 4.2 |
| Unidade da janela | [`window-unit`](../../especificacao/domain/metrics/window-unit.md) | `Janela` | Unidade da janela: semana ou mês (`week`, `month`) | siegard `window-unit` |
| Faixa do histograma | [`histogram-bin`](../../especificacao/domain/metrics/histogram-bin.md) | resultados de métrica | Faixa de um histograma (`FaixaHistograma`) de uma única classe | siegard `histogram-bin`; briefing 02 |
| Fonte de dados | [`data-source`](../../especificacao/domain/metrics/data-source.md) | `Dominio` (`'businessmap'` ou `'acelerato'`) | Ferramenta de onde um cálculo lê; as duas nunca se misturam | CLAUDE.md |
| Biblioteca de cálculo | [`calculation-library`](../../especificacao/domain/metrics/calculation-library.md) | `@metricas-dspd/metricas` | Serviço de domínio único para tempo, percentil e Monte Carlo (T2.5) | CLAUDE.md |
| Amostra mínima | (regra de `metric`) | `MINIMO_AMOSTRA = 20` | Abaixo de 20 itens, a estatística não é publicada | briefing 4.2 |

### Contexto Coleta (`collection`)
| Termo canônico | Siegard (identificador) | Onde vive | Definição | Fonte |
|---|---|---|---|---|
| Execução de coleta | [`collection-run`](../../especificacao/domain/collection/collection-run.md) | `ctl_coleta` | Uma coleta por fonte por vez, com marca d'água | data-model §6 |
| Tarefa de coleta | [`collection-task`](../../especificacao/domain/collection/collection-task.md) | `ctl_coleta.tarefa` | Incremental, varredura, webhook, projeção ou reconciliação | data-model §6 |
| Resultado da coleta | [`collection-outcome`](../../especificacao/domain/collection/collection-outcome.md) | `ctl_coleta.status` | Em andamento, sucesso, parcial ou falha | data-model §6 |
| Contagem da coleta | [`collection-count`](../../especificacao/domain/collection/collection-count.md) | `ctl_coleta_contagem` | Lidos, inseridos, já existentes e falhas por entidade | data-model §6 |
| Falha da coleta | [`collection-failure`](../../especificacao/domain/collection/collection-failure.md) | `ctl_coleta_falha` | Falha por item, sem payload nem dado pessoal | data-model §6 |
| Registro de origem | [`source-record`](../../especificacao/domain/collection/source-record.md) | `stg_*` | Payload original imutável, deduplicado por hash contra a última versão | data-model §3.1 |
| Reconciliação | [`reconciliation-record`](../../especificacao/domain/collection/reconciliation-record.md) | `ctl_reconciliacao` | Contagem da ferramenta contra a da base, por dia | data-model §6 |
| Marca d'água | (atributo de `collection-run`) | `ctl_coleta.marca_dagua_ate`; `vw_marca_dagua` | Instante até onde a última coleta com sucesso leu; a próxima parte dali | data-model §6 |

### Contexto Referência (`reference`)
| Termo canônico | Siegard (identificador) | Onde vive | Definição | Fonte |
|---|---|---|---|---|
| Calendário de expediente | [`business-calendar`](../../especificacao/domain/reference/business-calendar.md) | `dspd_core.ref_calendario`; `Calendario` | Base das horas úteis; plantão é exceção explícita por classe | briefing 4.2 |
| Turno | [`calendar-shift`](../../especificacao/domain/reference/calendar-shift.md) | `dspd_core.ref_calendario_turno` | Faixa de expediente por dia da semana, com vigência | data-model §5 |
| Feriado | [`holiday`](../../especificacao/domain/reference/holiday.md) | `dspd_core.ref_feriado` | Dia sem expediente, com escopo | data-model §5 |
| Escopo do feriado | [`holiday-scope`](../../especificacao/domain/reference/holiday-scope.md) | `ref_feriado.escopo` | Nacional, estadual, municipal ou ponto facultativo | data-model §5 |
| Versão de critério | [`criteria-version`](../../especificacao/domain/reference/criteria-version.md) | `dspd_core.ref_versao_criterio`; `VersaoCriterio` | Registro datado de mudança de critério de cálculo (T2.6), marcado nos gráficos | CLAUDE.md |
| Valor de domínio fechado | [`closed-domain-value`](../../especificacao/domain/reference/closed-domain-value.md) | `ref_dominio` (em `dspd_bm` e em `dspd_ac`) | Valor de uma lista fechada, por fonte | briefing 4.4 |
| Período de vigência | [`validity-period`](../../especificacao/domain/reference/validity-period.md) | `vigente_de`, `vigente_ate` | Nunca se sobrescreve: abre-se nova vigência | data-model §1 |

## Termos que não existem no domínio
Estes termos não podem aparecer como conceito, métrica, filtro ou tela. Fonte: `CLAUDE.md` (regras invioláveis) e briefing 7.1.
- Produtividade individual, ranking individual e meta por pessoa.
- Velocidade em pontos como meta.
- Comparação entre times.
- Percentual de conclusão de tarefa.
- Média de tempo de ciclo sem percentis.
- Horas apontadas como esforço.

A pessoa responsável (`responsaveis`, `usuario`) existe só no staging e em três colunas analíticas ilegíveis pela API ([`data-model.md`](../data-model.md) §9); não faz parte do modelo lógico.

## Termos próximos que não são sinônimos
| Termo | Diferença |
|---|---|
| Entrega × aceite | Entrega é o marco "disponível em produção"; aceite (confirmação do solicitante) é medido à parte e não entra no lead time do cliente (briefing 4.1). |
| Fila × bloqueio | Fila é um tipo de coluna; bloqueio é marca no card e não move o card de coluna (briefing 4.2). |
| Arquivado × excluído | Ambos permanecem na base: arquivado vem de `evt_card` tipo `arquivado`; excluído vem de `excluido_detectado` (varredura) (data-model §3.2). |
| Marca d'água × versão de carga | Marca d'água é o instante da coleta (`ctl_coleta`); versão de carga é a chave de cache da API, formada por `coletaId:versão de critério` (`server/src/modulos/metricas/servico.ts`, método `marca`). |
