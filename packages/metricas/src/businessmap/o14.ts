import type { ResultadoO14, FiltrosFluxo, TipoCard } from '@metricas-dspd/contratos'
import { TIPOS_CARD } from '@metricas-dspd/contratos'
import { baseAmostral, criterios, dentro, ehDemanda, periodoDe, selecionar } from './comum'
import type { ContextoBM, MarcosCard } from './indice'
import { ordenarNeutro } from '../core/ordenar'

const TOP = 10

interface Linha {
  nome: string
  entregues: number
  criados: number
  porTipo: { tipo: TipoCard; entregues: number }[]
}

function agrupar(
  itens: readonly { m: MarcosCard; entregue: boolean; criado: boolean }[],
  chave: (m: MarcosCard) => string,
) {
  const mapa = new Map<string, (typeof itens)[number][]>()
  for (const i of itens) {
    const k = chave(i.m)
    const l = mapa.get(k)
    if (l) l.push(i)
    else mapa.set(k, [i])
  }
  const linha = (nome: string, xs: readonly (typeof itens)[number][]): Linha => ({
    nome,
    entregues: xs.filter((x) => x.entregue).length,
    criados: xs.filter((x) => x.criado).length,
    porTipo: TIPOS_CARD.map((tipo) => ({
      tipo,
      entregues: xs.filter((x) => x.entregue && x.m.card.tipo === tipo).length,
    })).filter((t) => t.entregues > 0),
  })
  const todas = ordenarNeutro(
    [...mapa].map(([nome, xs]) => linha(nome, xs)),
    (l) => [-l.entregues, -l.criados, l.nome],
  )
  const resto = new Set(todas.slice(TOP).map((r) => r.nome))
  const demais =
    resto.size === 0
      ? null
      : linha(
          'Demais',
          itens.filter((i) => resto.has(chave(i.m))),
        )
  return { itens: todas.slice(0, TOP), demais }
}

/** O14: origem da demanda por área solicitante e por sistema (nunca por pessoa): top 10 e "demais". */
export function calcularO14(ctx: ContextoBM, f: FiltrosFluxo): ResultadoO14 {
  const periodo = periodoDe(ctx, f)
  const itens = selecionar(ctx, f, 'story', { semTipo: true })
    .filter(ehDemanda)
    .map((m) => ({
      m,
      entregue: dentro(ctx, m.entrega, periodo),
      criado: dentro(ctx, m.card.criado_em, periodo),
    }))
    .filter((i) => i.entregue || i.criado)
  return {
    base: baseAmostral(itens.filter((i) => i.entregue).length, 'demandas entregues', periodo, {
      n: itens.filter((i) => i.criado).length,
      unidade: 'demandas criadas',
    }),
    criterios: criterios('O14', periodo, periodo, ctx),
    porArea: agrupar(itens, (m) => m.card.area_solicitante),
    porSistema: agrupar(itens, (m) => m.card.sistema),
  }
}
