/**
 * Contratos das métricas "também disponíveis" da fase 1 (pedido 011, cartão B1). São só os schemas: nenhum
 * id entra em `METRICA_IDS` aqui, cada id entra com o seu cálculo (B2 a B11), para não existir rota que
 * devolva dado inventado. Regras inviolaveis refletidas no formato:
 * - todo objeto é `strict`: campo extra (inclusive de pessoa) é rejeitado, nunca descartado em silêncio;
 * - nenhum campo de pessoa nem de equipe como série (briefing 7.1); `tambem.test.ts` varre os nomes;
 * - estatística de distribuição e taxa vêm de `estatisticaSchema`/`taxaSchema`: abaixo de 20 itens só "k de n";
 * - séries devolvem `marcacoes` (T2.6, praticas.md §3), exceto o O20, que usa `mudancasCriterio` (plano §2).
 */
import { z } from 'zod'
import {
  MINIMO_AMOSTRA,
  MOTIVOS_BLOQUEIO,
  NATUREZAS_ENTREGA,
  TIPOS_CARD,
  baseAmostralSchema,
  criteriosSchema,
  estatisticaSchema,
  marcacaoCriterioSchema,
  percentisSchema,
  taxaSchema,
} from './comum'

/** Objeto fechado: chave que não está no schema invalida o resultado. */
const fechado = <T extends z.ZodRawShape>(forma: T) => z.object(forma).strict()

const comum = { base: baseAmostralSchema, criterios: criteriosSchema }
const duracao = estatisticaSchema(percentisSchema)
const tipo = z.enum(TIPOS_CARD)
const marcacoes = z.array(marcacaoCriterioSchema)
const mes = z.string() // AAAA-MM
const iso = z.string() // AAAA-MM-DD

/** O23, bloco do O2 (sem id próprio): estoque parado dentro do WIP. O limite é constante única na biblioteca. */
export const paradosSchema = fechado({
  limiteDiasUteis: z.number(),
  taxa: taxaSchema,
  porEtapa: z.array(fechado({ etapa: z.string(), k: z.number() })),
})

/**
 * Participação da causa no total de dias úteis bloqueados (O19-pct = B, 2026-10-16). O percentual é sobre os DIAS úteis;
 * o mínimo de 20 vale sobre o número de BLOQUEIOS da causa (abaixo, só `diasUteis` de `totalDiasUteis`, sem `pct`).
 */
export const pctDiasUteisSchema = z.discriminatedUnion('status', [
  z.object({
    status: z.literal('ok'),
    bloqueios: z.number().int().min(MINIMO_AMOSTRA),
    diasUteis: z.number(),
    totalDiasUteis: z.number(),
    pct: z.number(),
  }),
  z.object({
    status: z.literal('insuficiente'),
    bloqueios: z
      .number()
      .int()
      .max(MINIMO_AMOSTRA - 1),
    diasUteis: z.number(),
    totalDiasUteis: z.number(),
    minimo: z.literal(MINIMO_AMOSTRA),
  }),
])
export type PctDiasUteis = z.infer<typeof pctDiasUteisSchema>

/** O19 Bloqueios por causa: 7 motivos em ordem neutra do domínio; a interface é que ordena por soma. */
export const resultadoO19 = fechado({
  ...comum,
  motivos: z.array(
    fechado({
      motivo: z.enum(MOTIVOS_BLOQUEIO),
      bloqueios: z.number(),
      diasUteis: z.number(),
      pctDoTotal: pctDiasUteisSchema,
      duracao,
    }),
  ),
  abertosForaDaSoma: z.number(),
  totalDiasUteis: z.number(),
})

/** O20 Fluxo cumulativo: faixa por coluna (uma equipe) ou por papel ("Todas"). */
export const resultadoO20 = fechado({
  ...comum,
  agrupamento: z.enum(['coluna', 'papel']),
  faixas: z.array(
    fechado({
      chave: z.string(),
      rotulo: z.string(),
      ordem: z.number(),
      tipoColuna: z.enum(['fila', 'execucao']),
    }),
  ),
  dias: z.array(fechado({ dia: iso, contagens: z.array(z.number()), emProgresso: z.number() })),
  destaque: fechado({ faixa: z.string(), de: z.number(), para: z.number() }).nullable(),
  mudancasCriterio: marcacoes,
})

/**
 * O21 Fluxo reverso. O par com × sem é por tipo (regra 7) e exige 20 em cada grupo: cada `estatistica` diz o seu n e
 * `grupoAbaixoDoMinimo` diz qual grupo faltou (CA-6). A célula `reaberto` marca o retorno a partir de "Entregue".
 */
export const resultadoO21 = fechado({
  ...comum,
  entregas: taxaSchema,
  matriz: fechado({
    eixo: z.enum(['coluna', 'papel']),
    celulas: z.array(
      fechado({
        origem: z.string(),
        destino: z.string(),
        retornos: z.number(),
        reaberto: z.boolean(),
      }),
    ),
  }),
  reaberturas: z.number(),
  segmentoPor: z.literal('tipo'),
  comparacoes: z.array(
    fechado({
      tipo,
      com: duracao,
      sem: duracao,
      grupoAbaixoDoMinimo: z.enum(['com', 'sem', 'ambos']).nullable(),
    }),
  ),
})

/** O24 Ordem de chegada. O grupo é literal único (D-6' = A). */
export const resultadoO24 = fechado({
  ...comum,
  inicios: taxaSchema,
  meses: z.array(
    fechado({
      mes,
      emOrdem: z.number(),
      foraDeOrdem: z.number(),
      emAndamento: z.boolean(),
    }),
  ),
  marcacoes,
  /**
   * Espera dos ultrapassados (R-1 = A): dias úteis entre o início do primeiro item que passou na frente e o início
   * do ultrapassado. Só dentro de cada tipo (regra 7; a interface mostra um por vez); mínimo 20 por tipo.
   */
  custo: fechado({
    segmentoPor: z.literal('tipo'),
    porTipo: z.array(fechado({ tipo, ultrapassados: z.number(), estatistica: duracao })),
  }),
  grupo: z.literal('equipe-tipo-padrao'),
})

/** O25 Descarte. `porMotivo` é anulável (CA-44); o aviso de preenchimento fica fora da taxa (R-2', CA-26). */
export const resultadoO25 = fechado({
  ...comum,
  encerrados: taxaSchema,
  meses: z.array(fechado({ mes, taxa: taxaSchema, emAndamento: z.boolean() })),
  marcacoes,
  consumido: fechado({
    antesDoInicio: fechado({ itens: z.number() }),
    depoisDoInicio: fechado({
      itens: z.number(),
      diasUteis: z.number(),
      segmentoPor: z.literal('tipo'),
      /** P50/P85/P95 do tempo consumido só dentro de cada tipo (regra 7); mínimo 20 por tipo; a UI mostra um por vez. */
      porTipo: z.array(
        fechado({ tipo, itens: z.number(), diasUteis: z.number(), estatistica: duracao }),
      ),
    }),
  }),
  /** Descartes cujo instante veio da última revisão (aproximado). */
  instanteAproximado: fechado({ itens: z.number() }),
  /** Cards com motivo sem descarte nem exclusão: aviso, nunca entra na taxa. */
  avisoPreenchimento: fechado({ itens: z.number() }),
  porMotivo: z.array(fechado({ motivo: z.string(), itens: z.number() })).nullable(),
})

/** T10 Tempo de terceiros: sem prazo contratado, sem status (D-10 = A, CA-36). */
export const resultadoT10 = fechado({
  ...comum,
  fornecedores: z.array(
    fechado({
      fornecedor: z.string(),
      bloqueios: z.number(),
      diasUteis: z.number(),
      duracao,
    }),
  ),
  totalDiasUteis: z.number(),
})

/** T11 Sazonalidade da chegada: 24 meses fechados mais o corrente, sem depender do período do filtro (CA-12). */
export const resultadoT11 = fechado({
  ...comum,
  anos: z.array(
    fechado({
      ano: z.number().int(),
      meses: z.array(
        fechado({
          mes: z.number().int().min(1).max(12),
          entradas: z.number().nullable(),
          emAndamento: z.boolean(),
        }),
      ),
    }),
  ),
  marcacoes,
  mesesComDado: z.number(),
  mediaMensal: z.number().nullable(),
  historicoCurto: z.boolean(),
})

/** T12 Qualidade da entrada por área (D-8 = A). */
export const resultadoT12 = fechado({
  ...comum,
  total: taxaSchema,
  areas: z.array(fechado({ area: z.string(), taxa: taxaSchema })),
})

/** E7 Capacidade por sistema. Participação por contagem de entregas (D-2); o custo é anulável (CA-35, CA-13). */
export const resultadoE7 = fechado({
  ...comum,
  total: z.number(),
  sistemas: z.array(
    fechado({
      sistema: z.string(),
      entregas: z.number(),
      /** `taxa(entregas, total)` com 20 ou mais entregas no sistema; `null` abaixo (a interface monta o "k de n" com `entregas` e `total`). */
      participacao: taxaSchema.nullable(),
      porNatureza: z.array(fechado({ natureza: z.enum(NATUREZAS_ENTREGA), taxa: taxaSchema })),
      custoRateado: z.number().nullable(),
      custoPorDemanda: z.number().nullable(),
    }),
  ),
  custoConfigurado: z.boolean(),
})

/** E9 Projetos aguardando início. Projeto tem código e título; não é pessoa. Os P85 vêm do E1, um por tipo. */
export const resultadoE9 = fechado({
  ...comum,
  projetos: z.array(
    fechado({
      cardId: z.string(),
      codigo: z.string(),
      titulo: z.string(),
      tipo,
      criadoEm: iso,
      idadeDiasUteis: z.number(),
      faixa: z.string(),
    }),
  ),
  segmentoPor: z.literal('tipo'),
  /** Uma referência por tipo de projeto (regra 7, Q4): Iniciativa e Melhoria nunca no mesmo P85; mínimo 20 por tipo. */
  referenciasP85: z.array(
    fechado({
      tipo: z.enum(['Iniciativa', 'Melhoria']),
      referenciaP85: estatisticaSchema(fechado({ p85: z.number() })),
    }),
  ),
})

/**
 * Fase 2 do pedido 011 (extração nova, primeiro em mock). Mesmas regras da fase 1: objeto `strict`, nenhum campo de
 * pessoa nem de outra equipe, percentil e percentual só com 20 ou mais (`estatisticaSchema`/`taxaSchema`) e percentil
 * só dentro de uma classe (por tipo, um bloco por tipo; a interface mostra um por vez).
 */
const p50p85 = estatisticaSchema(fechado({ p50: z.number(), p85: z.number() }))

/**
 * E6 Datas do portfólio (D-7, CA-20). Deslize em dias úteis inteiros entre a data comprometida e a conclusão, com
 * sinal (negativo = antes; 0 = na data; tolerância zero). Percentual e P50/P85 só com 20 ou mais projetos.
 * `semData` conta os concluídos sem data comprometida registrada (fora de `projetos` e das estatísticas).
 */
export const resultadoE6 = fechado({
  ...comum,
  projetos: z.array(
    fechado({
      cardId: z.string(),
      codigo: z.string(),
      titulo: z.string(),
      deslizeDiasUteis: z.number().int(),
      replanejamentos: z.number().int(),
    }),
  ),
  semData: z.number(),
  naData: taxaSchema,
  deslize: p50p85,
})

/**
 * E8 Concentração de conhecimento (D-3, R-1 = B). Só a contagem de sistemas por faixa de pessoas (1, 2, 3 ou mais):
 * nenhum nome de sistema nem de pessoa. Com menos de 5 sistemas com entrega, `faixas` é `null` (CA-10).
 */
export const resultadoE8 = fechado({
  ...comum,
  janelaMeses: z.number().int(),
  sistemasComEntrega: z.number(),
  faixas: fechado({ uma: z.number(), duas: z.number(), tresOuMais: z.number() }).nullable(),
  recortePequeno: z.boolean(),
})

export type ResultadoE6 = z.infer<typeof resultadoE6>
export type ResultadoE8 = z.infer<typeof resultadoE8>

export type ResultadoO19 = z.infer<typeof resultadoO19>
export type ResultadoO20 = z.infer<typeof resultadoO20>
export type ResultadoO21 = z.infer<typeof resultadoO21>
export type ResultadoO24 = z.infer<typeof resultadoO24>
export type ResultadoO25 = z.infer<typeof resultadoO25>
export type ResultadoT10 = z.infer<typeof resultadoT10>
export type ResultadoT11 = z.infer<typeof resultadoT11>
export type ResultadoT12 = z.infer<typeof resultadoT12>
export type ResultadoE7 = z.infer<typeof resultadoE7>
export type ResultadoE9 = z.infer<typeof resultadoE9>
export type ParadosO2 = z.infer<typeof paradosSchema>

/**
 * Schemas da fase 1 por código. Não é `SCHEMAS_RESULTADO` (esse é por `MetricaId`): cada código passa para lá
 * no cartão do seu cálculo. Serve de insumo ao teste de pessoa e ao registro dos próximos cartões.
 */
export const SCHEMAS_TAMBEM_FASE1 = {
  O19: resultadoO19,
  O20: resultadoO20,
  O21: resultadoO21,
  O24: resultadoO24,
  O25: resultadoO25,
  T10: resultadoT10,
  T11: resultadoT11,
  T12: resultadoT12,
  E7: resultadoE7,
  E9: resultadoE9,
} as const
export type CodigoTambemFase1 = keyof typeof SCHEMAS_TAMBEM_FASE1

/** Schemas da fase 2 por código (mesmo papel do mapa da fase 1: insumo do teste de pessoa e do C4). */
export const SCHEMAS_TAMBEM_FASE2 = {
  E6: resultadoE6,
  E8: resultadoE8,
} as const
export type CodigoTambemFase2 = keyof typeof SCHEMAS_TAMBEM_FASE2

/** Os 12 ids novos do pedido 011 que têm id próprio (fases 1 e 2). */
export const SCHEMAS_TAMBEM = { ...SCHEMAS_TAMBEM_FASE1, ...SCHEMAS_TAMBEM_FASE2 } as const
