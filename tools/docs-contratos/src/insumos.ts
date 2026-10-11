import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  APLICABILIDADE_FLUXO,
  CATALOGO_CARTOES,
  filtrosSustentacaoSchema,
  METRICA_IDS,
  METRICAS_SUSTENTACAO,
  type MetricaId,
} from '@metricas-dspd/contratos'
import { SCHEMAS_RESULTADO } from '@metricas-dspd/contratos/validacao'
import { acelerato, businessmap, CALENDARIO_PADRAO, calcularMetrica } from '@metricas-dspd/metricas'
import { REGRAS_METRICA } from '@metricas-dspd/metricas/regras'
import { gerarBaseMock } from '@metricas-dspd/mock'
import type { z } from 'zod'
import { CATALOGO_EVENTOS, EXEMPLOS_EVENTOS } from '@metricas-dspd/server/eventos'
import { paraJsonSchema } from './fotografias.ts'
import type { Insumos } from './gerador.ts'
import type { Parametro } from './metricas.ts'

export type ParametroOpenapi = {
  name: string
  required?: boolean
  schema?: Record<string, unknown>
}
export type Openapi = { paths: Record<string, { get?: { parameters?: ParametroOpenapi[] } }> }

const FILTROS_FLUXO = ['equipe', 'tipo', 'sistema', 'periodo'] as const
const PERIODO_PADRAO = { tipo: '12s' } as const

/** Tipo e detalhes legíveis de um parâmetro do OpenAPI (enum, padrão, formato). */
export function descreverParametro(p: ParametroOpenapi): Parametro {
  const s = p.schema ?? {}
  const variantes = Array.isArray(s['anyOf']) ? (s['anyOf'] as Record<string, unknown>[]) : []
  const tipo =
    typeof s['type'] === 'string' ? s['type'] : variantes.map((v) => String(v['type'])).join(' | ')
  const detalhe = [
    Array.isArray(s['enum']) ? `valores: ${(s['enum'] as unknown[]).join(', ')}` : '',
    s['default'] !== undefined ? `padrão: ${s['default'] as string}` : '',
    typeof s['format'] === 'string' ? `formato: ${s['format']}` : '',
  ]
    .filter((d) => d !== '')
    .join('; ')
  return { nome: p.name, tipo, obrigatorio: p.required === true, detalhe }
}

const filtrosPadrao = (id: MetricaId): unknown => {
  if (id === 'VISAO_GERAL') return {}
  return METRICAS_SUSTENTACAO.includes(id)
    ? { equipe: [], prioridade: [], periodo: PERIODO_PADRAO }
    : { equipe: [], tipo: [], sistema: [], periodo: PERIODO_PADRAO }
}

/** Falha cedo se o exemplo gerado não passa no schema do contrato. */
export function exigirValido(nome: string, schema: z.ZodType, valor: unknown): void {
  const r = schema.safeParse(valor)
  if (!r.success)
    throw new Error(`exemplo de ${nome} não passa no schema: ${r.error.message.slice(0, 300)}`)
}

/** Parâmetros de uma rota no OpenAPI versionado; rota ausente é erro (o OpenAPI precisa estar em dia). */
export function parametrosDe(openapi: Openapi, rota: string): Parametro[] {
  const get = openapi.paths[rota]?.get
  if (get === undefined) throw new Error(`rota ${rota} ausente do OpenAPI; rode openapi:gerar`)
  return (get.parameters ?? []).map(descreverParametro)
}

/** Insumos reais: contratos, regras, catálogo, OpenAPI versionado e exemplos da base fictícia determinística. */
export function carregarInsumos(raiz: string): Insumos {
  const openapi = JSON.parse(readFileSync(join(raiz, 'docs/api/openapi.json'), 'utf8')) as Openapi
  const base = gerarBaseMock()
  const ctx = {
    bm: businessmap.criarContextoBM(base.bm, base.config.hoje, CALENDARIO_PADRAO),
    ac: acelerato.criarContextoAC(base.ac, base.config.hoje, CALENDARIO_PADRAO),
  }
  const filtrosSust = Object.keys(filtrosSustentacaoSchema.shape)

  const metricas = METRICA_IDS.map((id) => {
    const rota = `/api/v1/metricas/${id}`
    const sustentacao = METRICAS_SUSTENTACAO.includes(id)
    const exemplo = calcularMetrica(id, filtrosPadrao(id) as never, ctx)
    exigirValido(id, SCHEMAS_RESULTADO[id], exemplo)
    const doDominio = id === 'VISAO_GERAL' ? [] : sustentacao ? filtrosSust : [...FILTROS_FLUXO]
    return {
      id,
      rota,
      parametros: parametrosDe(openapi, rota),
      filtrosDoDominio: doDominio,
      filtrosAplicaveis: sustentacao ? doDominio : (APLICABILIDADE_FLUXO[id] ?? []),
      regra: REGRAS_METRICA[id],
      cartoes: CATALOGO_CARTOES.filter((c) => c.metricas.includes(id)).map((c) => ({
        painel: c.painel,
        id: c.id,
        rotulo: c.rotulo,
        secao: c.secao,
      })),
      schema: paraJsonSchema(SCHEMAS_RESULTADO[id]),
      exemplo,
    }
  })

  const eventos = Object.entries(CATALOGO_EVENTOS).map(([tipo, schema]) => {
    const exemplo = (EXEMPLOS_EVENTOS as Record<string, unknown>)[tipo]
    exigirValido(`evento ${tipo}`, schema, exemplo)
    return { tipo, schema: paraJsonSchema(schema) }
  })

  return {
    metricas,
    eventos,
  }
}
