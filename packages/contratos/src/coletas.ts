import { z } from 'zod'
import { METRICA_IDS } from './comum'

/** Estado de coleta por fonte (plano integracao-real, D1): frescor no corpo, nunca em cabeçalho. */
export const resultadoColetaSchema = z.enum(['ok', 'parcial', 'falha'])
export type ResultadoColeta = z.infer<typeof resultadoColetaSchema>

/** Só categoria: nunca mensagem, SQL, stack ou credencial (CA-15). */
export const tipoErroColetaSchema = z.enum([
  'indisponivel',
  'autenticacao',
  'tempo-esgotado',
  'dados-invalidos',
  'desconhecido',
])
export type TipoErroColeta = z.infer<typeof tipoErroColetaSchema>

export const contagensColetaSchema = z
  .object({
    lidos: z.number().int().nonnegative(),
    novos: z.number().int().nonnegative(),
    atualizados: z.number().int().nonnegative(),
    arquivadosPreservados: z.number().int().nonnegative(),
    excluidosPreservados: z.number().int().nonnegative(),
  })
  .strict()
export type ContagensColeta = z.infer<typeof contagensColetaSchema>

export const eventoColetaSchema = z
  .object({
    id: z.string(),
    inicio: z.string(),
    fim: z.string(),
    duracaoMs: z.number().int().nonnegative(),
    resultado: resultadoColetaSchema,
    tipoErro: tipoErroColetaSchema.nullable(),
    efeito: z.enum(['aplicada', 'parcial-aplicada', 'anteriores-mantidos']),
    contagens: contagensColetaSchema.nullable(),
  })
  .strict()
export type EventoColeta = z.infer<typeof eventoColetaSchema>

export const janelaCalibracaoSchema = z
  .object({
    inicio: z.string(),
    fim: z.string(),
    origem: z.enum(['inicio-coleta', 'criterio']),
    criterioId: z.string().nullable(),
    metricas: z.array(z.enum(METRICA_IDS)),
  })
  .strict()
export type JanelaCalibracao = z.infer<typeof janelaCalibracaoSchema>

export const seloFrescorSchema = z.enum(['atual', 'atrasado', 'falha', 'sem-coleta'])
export type SeloFrescor = z.infer<typeof seloFrescorSchema>

export const estadoColetaSchema = z
  .object({
    dominio: z.enum(['businessmap', 'acelerato']),
    selo: seloFrescorSchema,
    horasDesdeUltimaOk: z.number().nonnegative().nullable(),
    ultimaOk: eventoColetaSchema.nullable(),
    ultimaTentativa: eventoColetaSchema.nullable(),
    proximaPrevista: z.string(),
    /** Últimos 14 dias, resultado diferente de ok. */
    falhasRecentes: z.array(eventoColetaSchema),
    /** Só as vigentes. */
    calibracao: z.array(janelaCalibracaoSchema),
    metricasEmCalibracao: z.array(z.enum(METRICA_IDS)),
  })
  .strict()
export type EstadoColeta = z.infer<typeof estadoColetaSchema>

export const POR_PAGINA_COLETAS = 20 as const
export const paginaColetasSchema = z
  .object({
    itens: z.array(eventoColetaSchema),
    pagina: z.number().int().min(1),
    porPagina: z.literal(POR_PAGINA_COLETAS),
    total: z.number().int().nonnegative(),
  })
  .strict()
export type PaginaColetas = z.infer<typeof paginaColetasSchema>
