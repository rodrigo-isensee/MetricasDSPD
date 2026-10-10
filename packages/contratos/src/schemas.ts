/**
 * Schemas zod dos resultados de cada métrica. São a fonte da verdade dos DTOs
 * (os tipos em `metricas.ts` são inferidos daqui). Regras invioláveis refletidas no formato:
 * nenhum DTO expõe pessoa; equipe nunca é série; estatísticas de distribuição vêm em `Estatistica`.
 */
import { z } from 'zod'
import {
  CLASSES_SERVICO,
  METRICA_IDS,
  FASES_DETECCAO,
  MOTIVOS_BLOQUEIO,
  MOTIVOS_ENCERRAMENTO,
  MOTIVOS_ESCALACAO,
  NIVEIS_RESOLUCAO,
  ORIGENS_DEMANDA,
  PRIORIDADES,
  TIPOS_CARD,
  baseAmostralSchema,
  criteriosSchema,
  estatisticaSchema,
  faixaHistogramaSchema,
  intervaloSchema,
  janelaSchema,
  marcacaoCriterioSchema,
  percentisComMediaSchema,
  percentisSchema,
  statusMetaSchema,
  taxaSchema,
} from './comum'

const iso = z.string() // AAAA-MM-DD
const mes = z.string() // AAAA-MM
const tipo = z.enum(TIPOS_CARD)
const classe = z.enum(CLASSES_SERVICO)
const prioridade = z.enum(PRIORIDADES)

/** Campos presentes em todo resultado. */
const comum = { base: baseAmostralSchema, criterios: criteriosSchema }

/* ---------- FL1 ---------- */
export const resultadoO1 = z.object({
  ...comum,
  hoje: z.object({
    total: z.number(),
    limite: z.number(),
    bloqueados: z.number(),
    acimaDoLimite: z.number(),
  }),
  /** Só com exatamente uma equipe selecionada; senão null e usa-se `porTipoColuna`. */
  porColuna: z
    .array(
      z.object({
        coluna: z.string(),
        tipoColuna: z.enum(['fila', 'execucao']),
        itens: z.number(),
        bloqueados: z.number(),
        limite: z.number().nullable(),
      }),
    )
    .nullable(),
  porTipoColuna: z.array(
    z.object({
      tipoColuna: z.enum(['fila', 'execucao']),
      itens: z.number(),
      bloqueados: z.number(),
    }),
  ),
  equipesConsideradas: z.number(),
  serie: z.array(
    z.object({
      data: iso,
      wip: z.number(),
      bloqueados: z.number(),
      limite: z.number(),
      acimaDoLimite: z.boolean(),
    }),
  ),
  diasDentroDoLimite: taxaSchema,
  statusMeta: statusMetaSchema,
})

export const resultadoBloqueados = z.object({
  ...comum,
  itens: z.array(
    z.object({
      cardId: z.string(),
      titulo: z.string(),
      tipo,
      etapa: z.string(),
      motivo: z.enum(MOTIVOS_BLOQUEIO),
      fornecedor: z.string().nullable(),
      bloqueadoHaDiasUteis: z.number(),
    }),
  ),
})

export const situacaoItem = z.enum(['acima-p95', 'entre-p85-p95', 'dentro', 'sem-referencia'])
export const resultadoO2 = z.object({
  ...comum,
  janelaPercentis: janelaSchema,
  /** Eixo x do gráfico de pontos: colunas do fluxo (uma equipe) ou ['Fila', 'Execução']. */
  etapas: z.array(z.string()),
  agrupadoPorColuna: z.boolean(),
  tipos: z.array(
    z.object({
      tipo,
      abertos: z.number(),
      acimaP85: z.number(),
      acimaP95: z.number(),
      referencia: estatisticaSchema(percentisSchema),
    }),
  ),
  /** Tipo com mais itens acima do P85 (aba padrão do seletor local). */
  tipoSugerido: tipo.nullable(),
  itens: z.array(
    z.object({
      cardId: z.string(),
      titulo: z.string(),
      tipo,
      etapa: z.string(),
      idadeDiasUteis: z.number(),
      semMoverHaDiasUteis: z.number(),
      situacao: situacaoItem,
      bloqueioMotivo: z.enum(MOTIVOS_BLOQUEIO).nullable(),
    }),
  ),
  acimaP95: z.number(),
  statusMeta: statusMetaSchema,
})

const serieP85 = z.array(z.object({ semana: iso, n: z.number(), p85: z.number().nullable() }))
export const resultadoO3 = z.object({
  ...comum,
  janelaPercentis: janelaSchema,
  classes: z.array(
    z.object({
      tipo,
      n: z.number(),
      estatistica: estatisticaSchema(percentisComMediaSchema),
      pontos: z.array(
        z.object({
          cardId: z.string(),
          titulo: z.string(),
          dataEntrega: iso,
          cicloDiasUteis: z.number(),
        }),
      ),
      serieP85,
      variacaoP85: z.object({
        status: z.enum(['ok', 'indisponivel']),
        atual: z.number().nullable(),
        anterior: z.number().nullable(),
        variacaoPct: z.number().nullable(),
        janelaAnterior: intervaloSchema,
      }),
    }),
  ),
})

export const resultadoO4 = z.object({
  ...comum,
  semanas: z.array(
    z.object({
      semana: iso,
      itens: z.number(),
      emAndamento: z.boolean(),
      porTipo: z.array(z.object({ tipo, itens: z.number() })),
    }),
  ),
  janelaFaixa: intervaloSchema,
  faixa: estatisticaSchema(z.object({ min: z.number(), max: z.number(), mediana: z.number() })),
})

const saldoSituacao = z.enum(['cresce', 'estavel', 'diminui'])
export const resultadoO7 = z.object({
  ...comum,
  mesesExibidos: z.number(),
  totais: z.object({ entrou: z.number(), saiu: z.number() }),
  porTipo: z.array(
    z.object({
      tipo,
      entrou: z.number(),
      saiu: z.number(),
      saldoPeriodo: z.number(),
      saldoAcumulado: z.number(),
      situacao: saldoSituacao,
      /** Saldo acumulado positivo no trimestre (selo "Entrada acima da saída"). */
      entradaAcimaDaSaidaNoTrimestre: z.boolean(),
      meses: z.array(
        z.object({
          mes,
          emAndamento: z.boolean(),
          entrada: z.number(),
          saida: z.number(),
          saldoAcumulado: z.number(),
        }),
      ),
    }),
  ),
})

const tres = z.object({ cliente: percentisSchema, equipe: percentisSchema, ciclo: percentisSchema })
const doisP = z.object({ p50: z.number(), p85: z.number() }).nullable()
export const resultadoO9 = z.object({
  ...comum,
  janelaPercentis: janelaSchema,
  classes: z.array(
    z.object({
      tipo,
      n: z.number(),
      relogios: estatisticaSchema(tres.extend({ distanciaClienteCicloP50: z.number() })),
      histogramas: estatisticaSchema(
        z.object({
          cliente: z.array(faixaHistogramaSchema),
          equipe: z.array(faixaHistogramaSchema),
          ciclo: z.array(faixaHistogramaSchema),
        }),
      ),
      serieMensal: z.array(
        z.object({
          mes,
          n: z.number(),
          cliente: doisP,
          equipe: doisP,
          ciclo: doisP,
        }),
      ),
    }),
  ),
})

const histoEmpilhado = estatisticaSchema(z.object({ faixas: z.array(faixaHistogramaSchema) }))
export const resultadoO10 = z.object({
  ...comum,
  referencia: iso,
  acimaDe180: z.object({ time: z.number(), cliente: z.number() }),
  time: z.object({ n: z.number(), histograma: histoEmpilhado }),
  cliente: z.object({ n: z.number(), histograma: histoEmpilhado }),
  evolucao: z.array(
    z.object({
      tipo,
      serie: z.array(
        z.object({
          mes,
          n: z.number(),
          p50: z.number().nullable(),
          p85: z.number().nullable(),
        }),
      ),
    }),
  ),
  statusMeta: statusMetaSchema,
})

const responsabilidadeOuNao = z.object({
  Interno: z.number(),
  Solicitante: z.number(),
  Terceiro: z.number(),
  naoClassificado: z.number(),
})
export const resultadoO12 = z.object({
  ...comum,
  meses: z.array(
    z.object({
      mes,
      emAndamento: z.boolean(),
      acordos: z.number(),
      vencidos: z.number(),
      porResponsabilidade: responsabilidadeOuNao,
      pctVencidos: taxaSchema,
    }),
  ),
  totais: z.object({
    acordos: z.number(),
    vencidos: z.number(),
    porResponsabilidade: responsabilidadeOuNao,
    pctVencidos: taxaSchema,
  }),
  vencidosCausaInterna: z.number(),
  statusMeta: statusMetaSchema,
})

export const resultadoO15 = z.object({
  ...comum,
  fases: z.array(
    z.object({
      fase: z.enum(FASES_DETECCAO),
      grupo: z.enum(['contido', 'negocio', 'producao']),
      contagem: z.number(),
    }),
  ),
  contencao: taxaSchema,
  escape: taxaSchema,
  serieMensal: z.array(
    z.object({
      mes,
      emAndamento: z.boolean(),
      n: z.number(),
      contencao: taxaSchema,
      escape: taxaSchema,
    }),
  ),
})

const densidade = estatisticaSchema(z.number())
export const resultadoO18 = z.object({
  ...comum,
  meses: z.array(
    z.object({
      mes,
      emAndamento: z.boolean(),
      /** Preenchido enquanto a janela de 30 dias do mês ainda não fechou. */
      emApuracaoAte: iso.nullable(),
      entregues: z.number(),
      comBug: z.number(),
      semBug: z.number(),
      bugs: z.number(),
      taxaLimpa: taxaSchema,
      densidadeGeral: densidade,
      densidadeAfetados: densidade,
    }),
  ),
  totais: z.object({
    entregues: z.number(),
    comBug: z.number(),
    bugs: z.number(),
    taxaLimpa: taxaSchema,
    densidadeGeral: densidade,
    densidadeAfetados: densidade,
  }),
})

/* ---------- FL2 ---------- */
export const resultadoT1 = z.object({
  ...comum,
  janelaPercentis: janelaSchema,
  classes: z.array(
    z.object({
      classe,
      n: z.number(),
      estatistica: estatisticaSchema(
        z.object({
          /** Mediana de cada bloco em dias úteis. A soma NÃO é a mediana do total. */
          blocos: z.object({
            fila: z.number(),
            espera: z.number(),
            execucao: z.number(),
            homologacao: z.number(),
          }),
          total: percentisSchema,
          /** Mediana da fração fila/total por item (0 a 100). */
          fracaoFilaPct: z.number(),
        }),
      ),
    }),
  ),
})

const etapaT1 = z.enum(['Fila', 'Espera', 'Execução', 'Homologação'])
export const resultadoT2 = z.object({
  ...comum,
  janelaPercentis: janelaSchema,
  classes: z.array(
    z.object({
      classe,
      /** null = "SLE: não publicado" (Intangível ou amostra insuficiente). */
      sle: z.object({ diasUteis: z.number(), publicadoEm: iso }).nullable(),
      n: z.number(),
      dentroDoSle: taxaSchema.nullable(),
      statusMeta: statusMetaSchema,
      estouros: z.object({
        total: z.number(),
        porEtapa: z.array(z.object({ etapa: etapaT1, contagem: z.number() })),
      }),
    }),
  ),
})

const natureza = z.enum(['Sustentação', 'Evolução', 'Projetos', 'Dívida técnica'])
const medidaAlocacao = z.object({
  /** itens ou horas úteis em execução. */
  quantidade: z.number(),
  pct: z.number().nullable(),
  desvioPP: z.number().nullable(),
  statusMeta: statusMetaSchema,
})
export const resultadoT3 = z.object({
  ...comum,
  status: z.enum(['ok', 'insuficiente']),
  naturezas: z.array(
    z.object({
      natureza,
      acordadoPct: z.number(),
      itens: medidaAlocacao,
      tempo: medidaAlocacao,
    }),
  ),
})

const faixaSemanal = z.object({
  min: z.number(),
  max: z.number(),
  mediana: z.number(),
  media: z.number(),
})
export const resultadoT4 = z.object({
  ...comum,
  classes: z.array(
    z.object({
      classe,
      n: z.number(),
      estatistica: estatisticaSchema(
        z.object({
          chegada: faixaSemanal,
          vazao: faixaSemanal,
          razao: z.number().nullable(),
          backlog: z.number(),
          /** null quando a fila cresce (vazão <= chegada). */
          semanasParaZerar: z.number().nullable(),
          filaCresce: z.boolean(),
          saldo: z.number(),
        }),
      ),
      statusMeta: statusMetaSchema,
      /** Contagens do período (todas as semanas), publicadas mesmo abaixo de 20 itens. */
      totais: z.object({ chegadas: z.number(), saidas: z.number(), backlog: z.number() }),
      semanas: z.array(
        z.object({
          semana: iso,
          emAndamento: z.boolean(),
          chegada: z.number(),
          vazao: z.number(),
        }),
      ),
    }),
  ),
})

const origemOuValor = z.enum(['Demanda de valor', ...ORIGENS_DEMANDA])
const grupoT5 = z.object({
  id: z.string(),
  nome: z.string(),
  n: z.number(),
  estatistica: estatisticaSchema(
    z.object({
      pctFalha: z.number(),
      origens: z.array(z.object({ origem: origemOuValor, n: z.number(), pct: z.number() })),
      origemMaior: z.enum(ORIGENS_DEMANDA).nullable(),
    }),
  ),
})
export const resultadoT5 = z.object({
  ...comum,
  porSistema: z.array(grupoT5),
  porArea: z.array(grupoT5),
  /** Variação dos dois sistemas mais afetados contra 6 meses antes (meta -15%). */
  variacaoSemestre: z.array(
    z.object({
      sistema: z.string(),
      atualPct: z.number().nullable(),
      anteriorPct: z.number().nullable(),
      variacaoPct: z.number().nullable(),
    }),
  ),
})

export const resultadoT7 = z.object({
  ...comum,
  janelaPercentis: janelaSchema,
  kpis: z.object({
    frentesEmAndamento: z.number(),
    projetosComFrentes: z.number(),
    limiteFrentes: z.number(),
    acimaDoLimite: z.boolean(),
  }),
  porProjeto: z.array(
    z.object({ projetoId: z.string(), projeto: z.string(), abertas: z.number() }),
  ),
  idades: z.array(
    z.object({
      cardId: z.string(),
      titulo: z.string(),
      projeto: z.string(),
      idadeDiasUteis: z.number(),
      situacao: situacaoItem,
    }),
  ),
  referencia: estatisticaSchema(percentisSchema),
  histograma: estatisticaSchema(z.object({ faixas: z.array(faixaHistogramaSchema) })),
})

export const resultadoT9 = z.object({
  ...comum,
  projetos: z.array(
    z.object({
      projetoId: z.string(),
      projeto: z.string(),
      totalFrentes: z.number(),
      originais: z.number(),
      adicionadas: z.number(),
      concluidas: z.number(),
      emAndamento: z.number(),
      aFazer: z.number(),
      avancoPct: z.number(),
      /** adicionadas / originais, em %. */
      crescimentoEscopoPct: z.number(),
    }),
  ),
  projetosComEscopoCrescido: z.number(),
})

/* ---------- FL3 ---------- */
const segmentoE1 = z.object({
  /** id do tipo do projeto (Iniciativa, Melhoria): projetos de tipos diferentes nunca se misturam (briefing 4.2, decisão Q4). */
  chave: z.string(),
  rotulo: z.string(),
  /** Projetos do segmento na janela de percentis. */
  n: z.number(),
  pontos: z.array(
    z.object({
      cardId: z.string(),
      titulo: z.string(),
      concluidoEm: iso,
      trimestre: z.string(),
      leadTimeDiasUteis: z.number(),
    }),
  ),
  estatistica: estatisticaSchema(
    z.object({
      total: percentisSchema,
      medianaAntesDoInicio: z.number(),
      medianaExecucao: z.number(),
      /** Mediana da fração antes do início sobre o total, por projeto (0 a 100). */
      fracaoAntesPct: z.number(),
    }),
  ),
  variacaoMediana: z.object({
    status: z.enum(['ok', 'indisponivel']),
    atual: z.number().nullable(),
    anterior: z.number().nullable(),
    variacaoPct: z.number().nullable(),
  }),
})
export const resultadoE1 = z.object({
  ...comum,
  janelaPercentis: janelaSchema,
  segmentoPor: z.literal('tipo'),
  /** Uma estatística por tipo de projeto, nunca agregada. A UI mostra um por vez. */
  segmentos: z.array(segmentoE1),
})

const categoriaE2 = z.object({
  categoria: z.string(),
  tipo: z.enum(['objetivo', 'obrigacao-legal', 'manutencao', 'fora-de-objetivo']),
  n: z.number(),
  pct: z.number().nullable(),
})
export const resultadoE2 = z.object({
  ...comum,
  trimestres: z.array(
    z.object({
      trimestre: z.string(),
      emAndamento: z.boolean(),
      n: z.number(),
      segmentos: z.array(categoriaE2),
      evolucaoVinculada: taxaSchema,
    }),
  ),
  evolucaoVinculada: taxaSchema,
  statusMeta: statusMetaSchema,
})

export const resultadoE3 = z.object({
  ...comum,
  comFicha: z.object({ k: z.number(), n: z.number() }),
  semFicha: z.number(),
  statusMeta: statusMetaSchema,
  iniciativas: z.array(
    z.object({
      cardId: z.string(),
      nome: z.string(),
      situacao: z.enum(['em andamento', 'concluída']),
      ficha: z
        .object({
          resultadoEsperado: z.string(),
          declaradoAntesDoInicio: z.boolean(),
          unidade: z.string(),
          ganhoPrevisto: z.number(),
          ganhoMedido: z.number().nullable(),
          medida: z.string(),
          dataDeclaracao: iso,
        })
        .nullable(),
      atingimentoPct: z.number().nullable(),
    }),
  ),
})

/* ---------- Sustentação ---------- */
const classeS1 = z.object({
  alvoHoras: z.number(),
  n: z.number(),
  estatistica: estatisticaSchema(percentisComMediaSchema),
  /** mediana / alvo (1 = no alvo). null com amostra insuficiente. */
  razaoMediana: z.number().nullable(),
  razaoP85: z.number().nullable(),
  statusMeta: statusMetaSchema,
})
export const resultadoS1 = z.object({
  ...comum,
  janelaPercentis: janelaSchema,
  excecoesForaDaApuracao: z.number(),
  /** Tempos em horas úteis (calendário de expediente) para todas as prioridades. */
  prioridades: z.array(
    z.object({ prioridade, primeiroAtendimento: classeS1, restauracao: classeS1 }),
  ),
})

const celulaS2 = z.object({ taxa: taxaSchema, statusMeta: statusMetaSchema })
export const resultadoS2 = z.object({
  ...comum,
  prioridades: z.array(
    z.object({ prioridade, primeiroAtendimento: celulaS2, restauracao: celulaS2 }),
  ),
})

export const resultadoS3 = z.object({
  ...comum,
  meses: z.array(
    z.object({
      mes,
      emAndamento: z.boolean(),
      total: z.number(),
      porPrioridade: z.array(z.object({ prioridade, n: z.number(), pct: z.number().nullable() })),
      /** P1 + P2 em %, null com menos de 20 chamados no mês. */
      p1p2Pct: z.number().nullable(),
      ajustesManuais: z.number(),
    }),
  ),
})

export const resultadoS4 = z.object({
  ...comum,
  /** Sempre por prioridade (nunca agregado) e, dentro dela, por nível de resolução. */
  prioridades: z.array(
    z.object({
      prioridade,
      /** Chamados fechados da prioridade no período. */
      n: z.number(),
      niveis: z.array(
        z.object({
          nivel: z.enum(NIVEIS_RESOLUCAO),
          n: z.number(),
          /** % da prioridade; null com menos de 20 chamados na prioridade. */
          pct: z.number().nullable(),
          /** Tempo na etapa de atendimento do nível (horas úteis); null para Fornecedor. Mínimo de 20 na célula prioridade x nível. */
          tempoEtapa: estatisticaSchema(percentisSchema).nullable(),
        }),
      ),
    }),
  ),
})

const distMotivo = <T extends readonly [string, ...string[]]>(valores: T) =>
  z.object({
    ...comum,
    motivos: z.array(
      z.object({ motivo: z.enum(valores), n: z.number(), pct: z.number().nullable() }),
    ),
    evolucao: z.array(
      z.object({
        mes,
        emAndamento: z.boolean(),
        n: z.number(),
        motivos: z.array(
          z.object({ motivo: z.enum(valores), n: z.number(), pct: z.number().nullable() }),
        ),
      }),
    ),
  })
export const resultadoS5 = distMotivo(MOTIVOS_ESCALACAO).extend({
  /** Escalados (N2, N3 ou fornecedor) sem motivo de escalação: "Não informado", nunca inferido. */
  naoInformado: z.number(),
})
export const resultadoS6 = distMotivo(MOTIVOS_ENCERRAMENTO).extend({
  /** Chamados fechados sem motivo de encerramento ("Não informado"). */
  naoInformado: z.number(),
  taxaContorno: taxaSchema,
})

const blocoS7 = z.object({
  meses: z.array(
    z.object({
      mes,
      emAndamento: z.boolean(),
      total: z.number(),
      ocorrencias: z.number(),
      pct: taxaSchema,
    }),
  ),
  totais: z.object({ total: z.number(), ocorrencias: z.number() }),
})
export const resultadoS7 = z.object({
  ...comum,
  ajusteDePrioridade: blocoS7.extend({ justificados: z.object({ k: z.number(), n: z.number() }) }),
  reclassificacaoDeTipo: blocoS7,
})

/* ---------- Espera invisível ---------- */
const medianas = z.object({
  cliente: z.number(),
  time: z.number(),
  indicePct: z.number(),
  acimaDe50: z.boolean(),
})
const segmentoEI = z.object({
  /** id do tipo (FL1: demanda; FL3: projeto) ou da prioridade em minúsculas (SUST); null = nível sem segmentação (FL2). */
  chave: z.string().nullable(),
  rotulo: z.string().nullable(),
  /** Itens do segmento na janela de percentis. */
  n: z.number(),
  /** As duas visões ou nenhuma: se qualquer uma tiver < 20 itens do segmento, status = insuficiente. */
  estatistica: estatisticaSchema(medianas),
  serie: z.array(
    z.object({
      mes,
      n: z.number(),
      cliente: z.number().nullable(),
      time: z.number().nullable(),
      indicePct: z.number().nullable(),
    }),
  ),
})
export const resultadoEI = z.object({
  ...comum,
  nivel: z.enum(['FL1', 'FL2', 'FL3', 'SUST']),
  fonte: z.enum(['BusinessMap', 'Acelerato']),
  granularidade: z.enum(['demanda', 'frente', 'projeto', 'chamado']),
  unidade: z.enum(['dias-uteis', 'horas-uteis']),
  janelaPercentis: janelaSchema,
  /** Eixo da segmentação: FL1 e FL3 por tipo, SUST por prioridade, FL2 sem segmentação (a frente não tem tipo). */
  segmentoPor: z.enum(['tipo', 'prioridade']).nullable(),
  /** Nunca agregados: uma estatística e uma série por segmento (briefing 4.2). A UI mostra um por vez. */
  segmentos: z.array(segmentoEI),
})

/* ---------- Visão geral ---------- */
export const alertaCodigo = z.enum([
  'O2_ACIMA_P95',
  'O1_WIP_ACIMA_LIMITE',
  'O12_VENCIDOS_INTERNOS',
  'O10_BACKLOG_180',
  'T2_ABAIXO_85',
  'T4_RAZAO_FORA',
  'T3_DESVIO',
  'T9_ESCOPO',
  'E2_ABAIXO_60',
  'E3_SEM_RESULTADO',
  'S2_ABAIXO_90',
  'S1_MEDIANA_ACIMA_ALVO',
])
const indicadorVG = z.object({
  metrica: z.enum(METRICA_IDS),
  /** Código do indicador (métrica, ou métrica_subcorte como S2_P1). */
  codigo: z.string(),
  /** Valor principal; null quando insuficiente. */
  valor: z.number().nullable(),
  /** Segundo número (ex.: denominador "k de n"). */
  de: z.number().nullable(),
  base: z.object({ n: z.number(), unidade: z.string() }),
  status: z.enum(['dentro', 'fora', 'insuficiente', 'sem-meta']),
  amostra: z.object({ n: z.number(), minimo: z.number() }).nullable(),
})
const nivelVG = z.object({
  nivel: z.enum(['operacional', 'tatico', 'estrategico', 'sustentacao']),
  fonte: z.enum(['BusinessMap', 'Acelerato']),
  status: z.enum(['atencao', 'dentro', 'insuficiente', 'sem-meta']),
  indicadores: z.array(indicadorVG),
})
export const resultadoVisaoGeral = z.object({
  dataCorte: iso,
  recortes: z.object({
    fluxo: intervaloSchema,
    estrategico: intervaloSchema,
    sustentacao: intervaloSchema,
  }),
  alertas: z.array(
    z.object({
      nivel: z.enum(['operacional', 'tatico', 'estrategico', 'sustentacao']),
      metrica: z.string(),
      ancora: z.string(),
      codigo: alertaCodigo,
      valor: z.number(),
      de: z.number().nullable(),
    }),
  ),
  niveis: z.array(nivelVG),
  esperaInvisivel: z.array(
    z.object({
      nivel: z.enum(['FL1', 'FL2', 'FL3', 'SUST']),
      fonte: z.enum(['BusinessMap', 'Acelerato']),
      unidade: z.enum(['dias-uteis', 'horas-uteis']),
      /** Um por tipo (FL1, FL3) ou prioridade (SUST); FL2 tem um segmento sem chave. */
      segmentos: z.array(
        z.object({
          chave: z.string().nullable(),
          rotulo: z.string().nullable(),
          estatistica: estatisticaSchema(medianas),
        }),
      ),
    }),
  ),
})

export const marcacoes = marcacaoCriterioSchema
