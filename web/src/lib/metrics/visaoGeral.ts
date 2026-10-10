import { MINIMO_AMOSTRA } from '@/contracts/comum'
import type { ResultadoVisaoGeral } from '@/contracts/metricas'
import type { FiltrosFluxo, FiltrosSustentacao } from '@/contracts/filtros'
import { calcularEIAcelerato, calcularS1, calcularS2, type ContextoAC } from './acelerato'
import {
  calcularBloqueados,
  calcularE2,
  calcularE3,
  calcularEIBM,
  calcularO1,
  calcularO12,
  calcularO2,
  calcularT2,
  calcularT3,
  calcularT4,
  calcularT9,
  type ContextoBM,
} from './businessmap'

type Alerta = ResultadoVisaoGeral['alertas'][number]
type Indicador = ResultadoVisaoGeral['niveis'][number]['indicadores'][number]
type NivelVG = ResultadoVisaoGeral['niveis'][number]

const fluxo = (periodo: FiltrosFluxo['periodo']): FiltrosFluxo => ({
  equipe: [],
  tipo: [],
  sistema: [],
  periodo,
})
const sust: FiltrosSustentacao = { equipe: [], prioridade: [], periodo: { tipo: '6m' } }

function statusNivel(ind: readonly Indicador[]): NivelVG['status'] {
  if (ind.some((i) => i.status === 'fora')) return 'atencao'
  if (ind.some((i) => i.status === 'dentro')) return 'dentro'
  if (ind.length > 0 && ind.every((i) => i.status === 'insuficiente')) return 'insuficiente'
  return 'sem-meta'
}

/**
 * Visão geral: junta resultados dos dois domínios em BLOCOS SEPARADOS, com os padrões de cada
 * painel. Não faz nenhum cálculo que misture BusinessMap com Acelerato.
 */
export function calcularVisaoGeral(bm: ContextoBM, ac: ContextoAC): ResultadoVisaoGeral {
  const f12s = fluxo({ tipo: '12s' })
  const f12m = fluxo({ tipo: '12m' })
  const alertas: Alerta[] = []
  const add = (a: Alerta) => alertas.push(a)

  /* Operacional */
  const o2 = calcularO2(bm, f12s)
  const o1 = calcularO1(bm, f12s)
  const bl = calcularBloqueados(bm, f12s)
  const o12 = calcularO12(bm, f12s)
  if (o2.acimaP95 > 0)
    add({
      nivel: 'operacional',
      metrica: 'O2',
      ancora: 'o2',
      codigo: 'O2_ACIMA_P95',
      valor: o2.acimaP95,
      de: o2.itens.length,
    })
  if (o1.statusMeta === 'fora')
    add({
      nivel: 'operacional',
      metrica: 'O1',
      ancora: 'o1',
      codigo: 'O1_WIP_ACIMA_LIMITE',
      valor: o1.diasDentroDoLimite.k,
      de: o1.diasDentroDoLimite.n,
    })
  if (o12.vencidosCausaInterna > 0)
    add({
      nivel: 'operacional',
      metrica: 'O12',
      ancora: 'o12',
      codigo: 'O12_VENCIDOS_INTERNOS',
      valor: o12.vencidosCausaInterna,
      de: null,
    })
  const operacional: Indicador[] = [
    {
      metrica: 'O2',
      codigo: 'O2',
      valor: o2.acimaP95,
      de: o2.itens.length,
      base: { n: o2.itens.length, unidade: 'itens abertos' },
      status: o2.statusMeta === 'sem-referencia' ? 'insuficiente' : o2.statusMeta,
      amostra: null,
    },
    {
      metrica: 'O1',
      codigo: 'O1',
      valor: o1.diasDentroDoLimite.status === 'ok' ? o1.diasDentroDoLimite.pct : null,
      de: o1.diasDentroDoLimite.n,
      base: { n: o1.diasDentroDoLimite.n, unidade: 'dias úteis' },
      status: o1.statusMeta === 'sem-referencia' ? 'insuficiente' : o1.statusMeta,
      amostra:
        o1.diasDentroDoLimite.status === 'insuficiente'
          ? { n: o1.diasDentroDoLimite.n, minimo: MINIMO_AMOSTRA }
          : null,
    },
    {
      metrica: 'BLOQUEADOS',
      codigo: 'BLOQUEADOS',
      valor: bl.itens.length,
      de: null,
      base: { n: bl.itens.length, unidade: 'itens bloqueados' },
      status: 'sem-meta',
      amostra: null,
    },
  ]

  /* Tático */
  const t2 = calcularT2(bm, f12s)
  const t4 = calcularT4(bm, f12s)
  const t3 = calcularT3(bm, f12s)
  const t9 = calcularT9(bm, f12s)
  const t2Ok = t2.classes.filter((c) => c.statusMeta !== 'sem-referencia')
  const t2Fora = t2Ok.filter((c) => c.statusMeta === 'fora').length
  const t4Ok = t4.classes.filter((c) => c.statusMeta !== 'sem-referencia')
  const t4Fora = t4Ok.filter((c) => c.statusMeta === 'fora').length
  const t3Fora = t3.naturezas.filter((n) => n.itens.statusMeta === 'fora').length
  if (t2Fora > 0)
    add({
      nivel: 'tatico',
      metrica: 'T2',
      ancora: 't2',
      codigo: 'T2_ABAIXO_85',
      valor: t2Fora,
      de: t2Ok.length,
    })
  if (t4Fora > 0)
    add({
      nivel: 'tatico',
      metrica: 'T4',
      ancora: 't4',
      codigo: 'T4_RAZAO_FORA',
      valor: t4Fora,
      de: t4Ok.length,
    })
  if (t3Fora > 0)
    add({
      nivel: 'tatico',
      metrica: 'T3',
      ancora: 't3',
      codigo: 'T3_DESVIO',
      valor: t3Fora,
      de: t3.naturezas.length,
    })
  if (t9.projetosComEscopoCrescido > 0)
    add({
      nivel: 'tatico',
      metrica: 'T9',
      ancora: 't9',
      codigo: 'T9_ESCOPO',
      valor: t9.projetosComEscopoCrescido,
      de: t9.projetos.length,
    })
  const grupoStatus = (ok: number, fora: number): Indicador['status'] =>
    ok === 0 ? 'insuficiente' : fora > 0 ? 'fora' : 'dentro'
  const tatico: Indicador[] = [
    {
      metrica: 'T2',
      codigo: 'T2',
      valor: t2Fora,
      de: t2Ok.length,
      base: { n: t2.base.n, unidade: 'demandas entregues' },
      status: grupoStatus(t2Ok.length, t2Fora),
      amostra: null,
    },
    {
      metrica: 'T4',
      codigo: 'T4',
      valor: t4Fora,
      de: t4Ok.length,
      base: { n: t4.base.n, unidade: 'chegadas e entregas' },
      status: grupoStatus(t4Ok.length, t4Fora),
      amostra: null,
    },
    {
      metrica: 'T9',
      codigo: 'T9',
      valor: t9.projetosComEscopoCrescido,
      de: t9.projetos.length,
      base: { n: t9.projetos.length, unidade: 'projetos em andamento' },
      status: 'sem-meta',
      amostra: null,
    },
  ]

  /* Estratégico */
  const e2 = calcularE2(bm, f12m)
  const e3 = calcularE3(bm, f12m)
  if (e3.semFicha > 0)
    add({
      nivel: 'estrategico',
      metrica: 'E3',
      ancora: 'e3',
      codigo: 'E3_SEM_RESULTADO',
      valor: e3.semFicha,
      de: e3.comFicha.n,
    })
  if (e2.statusMeta === 'fora')
    add({
      nivel: 'estrategico',
      metrica: 'E2',
      ancora: 'e2',
      codigo: 'E2_ABAIXO_60',
      valor: e2.evolucaoVinculada.status === 'ok' ? e2.evolucaoVinculada.pct : 0,
      de: null,
    })
  const estrategico: Indicador[] = [
    {
      metrica: 'E3',
      codigo: 'E3',
      valor: e3.semFicha,
      de: e3.comFicha.n,
      base: { n: e3.comFicha.n, unidade: 'iniciativas' },
      status: e3.statusMeta === 'sem-referencia' ? 'insuficiente' : e3.statusMeta,
      amostra: null,
    },
    {
      metrica: 'E2',
      codigo: 'E2',
      valor: e2.evolucaoVinculada.status === 'ok' ? e2.evolucaoVinculada.pct : null,
      de: e2.evolucaoVinculada.n,
      base: { n: e2.evolucaoVinculada.n, unidade: 'itens de evolução' },
      status: e2.statusMeta === 'sem-referencia' ? 'insuficiente' : e2.statusMeta,
      amostra:
        e2.evolucaoVinculada.status === 'insuficiente'
          ? { n: e2.evolucaoVinculada.n, minimo: MINIMO_AMOSTRA }
          : null,
    },
  ]

  /* Sustentação */
  const s2 = calcularS2(ac, sust)
  const s1 = calcularS1(ac, sust)
  const s2Pub = s2.prioridades.filter(
    (p) =>
      p.primeiroAtendimento.statusMeta !== 'sem-referencia' ||
      p.restauracao.statusMeta !== 'sem-referencia',
  )
  const s2Fora = s2Pub.filter(
    (p) => p.primeiroAtendimento.statusMeta === 'fora' || p.restauracao.statusMeta === 'fora',
  ).length
  const s1Pub = s1.prioridades.filter((p) => p.restauracao.statusMeta !== 'sem-referencia')
  const s1Fora = s1Pub.filter((p) => p.restauracao.statusMeta === 'fora').length
  if (s2Fora > 0)
    add({
      nivel: 'sustentacao',
      metrica: 'S2',
      ancora: 's2',
      codigo: 'S2_ABAIXO_90',
      valor: s2Fora,
      de: s2Pub.length,
    })
  if (s1Fora > 0)
    add({
      nivel: 'sustentacao',
      metrica: 'S1',
      ancora: 's1',
      codigo: 'S1_MEDIANA_ACIMA_ALVO',
      valor: s1Fora,
      de: s1Pub.length,
    })
  const p1 = s2.prioridades.find((p) => p.prioridade === 'P1')
  const p1Taxa = p1?.restauracao.taxa
  const sustentacao: Indicador[] = [
    {
      metrica: 'S2',
      codigo: 'S2',
      valor: s2Fora,
      de: s2Pub.length,
      base: { n: s2.base.n, unidade: 'chamados fechados' },
      status: grupoStatus(s2Pub.length, s2Fora),
      amostra: null,
    },
    {
      metrica: 'S1',
      codigo: 'S1',
      valor: s1Fora,
      de: s1Pub.length,
      base: { n: s1.base.n, unidade: 'chamados fechados' },
      status: grupoStatus(s1Pub.length, s1Fora),
      amostra: null,
    },
    {
      metrica: 'S2',
      codigo: 'S2_P1',
      valor: p1Taxa?.status === 'ok' ? p1Taxa.pct : null,
      de: p1Taxa?.n ?? 0,
      base: { n: p1Taxa?.n ?? 0, unidade: 'chamados P1' },
      status:
        p1?.restauracao.statusMeta === 'sem-referencia' || !p1
          ? 'insuficiente'
          : p1.restauracao.statusMeta,
      amostra: p1Taxa?.status === 'insuficiente' ? { n: p1Taxa.n, minimo: MINIMO_AMOSTRA } : null,
    },
  ]

  const ei = [
    { nivel: 'FL1' as const, r: calcularEIBM(bm, f12s, 'FL1') },
    { nivel: 'FL2' as const, r: calcularEIBM(bm, f12s, 'FL2') },
    { nivel: 'FL3' as const, r: calcularEIBM(bm, f12m, 'FL3') },
    { nivel: 'SUST' as const, r: calcularEIAcelerato(ac, sust) },
  ]
  const hoje = bm.hojeIso
  return {
    dataCorte: hoje,
    recortes: {
      fluxo: o1.base.janela ?? { inicio: hoje, fim: hoje },
      estrategico: e2.base.janela ?? { inicio: hoje, fim: hoje },
      sustentacao: s2.base.janela ?? { inicio: hoje, fim: hoje },
    },
    alertas,
    niveis: [
      {
        nivel: 'operacional',
        fonte: 'BusinessMap',
        status: statusNivel(operacional),
        indicadores: operacional,
      },
      { nivel: 'tatico', fonte: 'BusinessMap', status: statusNivel(tatico), indicadores: tatico },
      {
        nivel: 'estrategico',
        fonte: 'BusinessMap',
        status: statusNivel(estrategico),
        indicadores: estrategico,
      },
      {
        nivel: 'sustentacao',
        fonte: 'Acelerato',
        status: statusNivel(sustentacao),
        indicadores: sustentacao,
      },
    ],
    esperaInvisivel: ei.map(({ nivel, r }) => ({
      nivel,
      fonte: r.fonte,
      unidade: r.unidade,
      segmentos: r.segmentos.map((x) => ({
        chave: x.chave,
        rotulo: x.rotulo,
        estatistica: x.estatistica,
      })),
    })),
  }
}
