/**
 * Linha agregada da pesquisa trimestral de percepção (PV1), compartilhada entre o mock e o script de carga.
 * Só contagens por trimestre, área, pergunta e faixa: nenhum respondente, comentário ou texto livre.
 */
import { z } from 'zod'

/** Cabeçalho exato do CSV de carga (allow-list): qualquer coluna a mais recusa o arquivo inteiro. */
export const COLUNAS_CSV_PESQUISA = [
  'trimestre',
  'area',
  'pergunta',
  'f1',
  'f2',
  'f3',
  'f4',
  'f5',
  'convidados',
] as const

/** Trimestre civil no formato `2026-T3`. */
export const trimestreSchema = z.string().regex(/^\d{4}-T[1-4]$/)

const contagem = z.number().int().min(0)
const semArroba = (v: string) => !v.includes('@')

export const linhaPesquisaSchema = z
  .strictObject({
    trimestre: trimestreSchema,
    /** Código da área (lista fechada `ref_pesq_area`, validada na carga): nunca nome de pessoa. */
    area: z.string().min(1).max(40).refine(semArroba),
    pergunta: z.string().min(1).max(40).refine(semArroba),
    f1: contagem,
    f2: contagem,
    f3: contagem,
    f4: contagem,
    f5: contagem,
    convidados: contagem,
  })
  .refine((l) => l.f1 + l.f2 + l.f3 + l.f4 + l.f5 <= l.convidados, {
    message: 'respondentes (soma das faixas) não pode passar de convidados',
  })
export type LinhaPesquisa = z.infer<typeof linhaPesquisaSchema>
