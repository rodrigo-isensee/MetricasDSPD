import { TIPOS_CARD, type FiltrosFluxo, type ResultadoO24 } from '@metricas-dspd/contratos'
import { diaDeIso, diaLocal, horasUteisEntre } from '../core/calendario'
import { estatistica, percentisDe, taxa } from '../core/estatistica'
import { ordenarNeutro } from '../core/ordenar'
import { mesesEntre } from '../core/series'
import { amostraBM } from './amostra'
import {
  baseAmostral,
  criterios,
  dentro,
  du,
  ehDemanda,
  janelaPercentis,
  periodoDe,
  r2,
  selecionar,
} from './comum'
import { fimDeVidaAberta } from './descartado'
import type { ContextoBM, MarcosCard } from './indice'

/** Resultado da varredura de uma fila para um card. */
interface Passagem {
  /** O card iniciou com alguém mais antigo, do mesmo grupo, ainda esperando. */
  foraDeOrdem: boolean
  /** Instante em que o primeiro item passou na frente dele (null = nunca foi ultrapassado). */
  ultrapassadoEm: number | null
}

/** Memória por contexto: a fila de cada equipe não depende dos filtros (eles só escolhem o que é mostrado). */
const memo = new WeakMap<ContextoBM, Map<string, Passagem>>()

/**
 * Varredura da fila (D-6' = A): para cada grupo (quadro da equipe, classe Padrão, mesmo tipo) os cards são ordenados
 * por `criado_em` e os inícios, por instante. Como os candidatos entram na fila em ordem de criação, o "conjunto
 * ordenado dos que ainda esperam" é uma fila FIFO com retirada preguiçosa na cabeça: O(n log n) por grupo (só as
 * duas ordenações), nunca O(n²). Espera = não iniciado, não descartado nem arquivado naquele instante.
 */
function varrerFilas(ctx: ContextoBM): Map<string, Passagem> {
  const pronto = memo.get(ctx)
  if (pronto) return pronto
  const grupos = new Map<string, MarcosCard[]>()
  for (const m of ctx.idx.marcos) {
    const c = m.card
    if (c.classe_servico !== 'Padrão' || !ehDemanda(m) || c.eh_subtarefa || m.excluido) continue
    const chave = `${c.quadro_id}|${c.tipo}`
    const l = grupos.get(chave)
    if (l) l.push(m)
    else grupos.set(chave, [m])
  }
  const saida = new Map<string, Passagem>()
  const sai = (m: MarcosCard): number => Math.min(m.inicio ?? Infinity, fimDeVidaAberta(m.card))
  for (const membros of grupos.values()) {
    const porCriacao = ordenarNeutro(membros, (m) => [m.card.criado_em, m.card.card_id])
    const inicios = ordenarNeutro(
      porCriacao.filter((m) => m.ativo && m.inicio !== null),
      (m) => [m.inicio as number, m.card.criado_em, m.card.card_id],
    )
    // Duas filas em ordem de criação: todos os que esperam (cabeça = o mais antigo) e os ainda não ultrapassados.
    const todos: MarcosCard[] = []
    const livres: MarcosCard[] = []
    let hTodos = 0
    let hLivres = 0
    let prox = 0
    for (const m of membros) saida.set(m.card.card_id, { foraDeOrdem: false, ultrapassadoEm: null })
    for (const x of inicios) {
      const t = x.inicio as number
      while (prox < porCriacao.length && (porCriacao[prox] as MarcosCard).card.criado_em <= t) {
        todos.push(porCriacao[prox] as MarcosCard)
        livres.push(porCriacao[prox] as MarcosCard)
        prox++
      }
      while (hTodos < todos.length && sai(todos[hTodos] as MarcosCard) <= t) hTodos++
      const criadoX = x.card.criado_em
      const fora = hTodos < todos.length && (todos[hTodos] as MarcosCard).card.criado_em < criadoX
      ;(saida.get(x.card.card_id) as Passagem).foraDeOrdem = fora
      if (!fora) continue
      while (hLivres < livres.length && (livres[hLivres] as MarcosCard).card.criado_em < criadoX) {
        const y = livres[hLivres] as MarcosCard
        hLivres++
        if (sai(y) > t) (saida.get(y.card.card_id) as Passagem).ultrapassadoEm = t
      }
    }
  }
  memo.set(ctx, saida)
  return saida
}

/**
 * O24: ordem de chegada. Dos inícios do período (só classe Padrão), quantos passaram na frente de um pedido mais antigo
 * do mesmo tipo, na fila da mesma equipe (D-6' = A; Urgente, Prazo fixo e Intangível ficam fora). A fila de cada
 * equipe nunca é comparada com a de outra e a saída não traz equipe (R5). Custo da ultrapassagem (R-1 = A): dias úteis
 * entre o início do primeiro item que passou na frente e o início do ultrapassado; ultrapassado que ainda não iniciou
 * fica fora da estatística até iniciar. P50/P85/P95 pela biblioteca, só com n >= 20 na janela de 12 semanas, por tipo
 * (regra 7). O percentual de inícios também só sai com n >= 20.
 */
export function calcularO24(ctx: ContextoBM, f: FiltrosFluxo): ResultadoO24 {
  const periodo = periodoDe(ctx, f)
  const janela = janelaPercentis(ctx, f, 'story')
  const passagens = varrerFilas(ctx)
  const iniciados = selecionar(ctx, f, 'story').filter(
    (m) => m.card.classe_servico === 'Padrão' && ehDemanda(m) && m.inicio !== null,
  )
  const noPeriodo = iniciados.filter((m) => dentro(ctx, m.inicio, periodo))
  const fora = (m: MarcosCard): boolean => (passagens.get(m.card.card_id) as Passagem).foraDeOrdem
  const meses = mesesEntre(diaDeIso(periodo.inicio), diaDeIso(periodo.fim), ctx.hojeDia).map(
    (b) => {
      const doMes = noPeriodo.filter((m) => {
        const d = diaLocal(m.inicio as number, ctx.cal)
        return d >= b.inicioDia && d <= b.fimDia
      })
      const k = doMes.filter(fora).length
      return { mes: b.chave, emOrdem: doMes.length - k, foraDeOrdem: k, emAndamento: b.emAndamento }
    },
  )
  const espera = (m: MarcosCard): number | null => {
    const em = passagens.get(m.card.card_id)?.ultrapassadoEm
    return em === null || em === undefined
      ? null
      : du(ctx, horasUteisEntre(em, m.inicio as number, ctx.cal))
  }
  const ultrapassados = noPeriodo.filter((m) => espera(m) !== null)
  const naJanela = iniciados.filter((m) => dentro(ctx, m.inicio, janela) && espera(m) !== null)
  const crit = criterios('O24', periodo, janela, ctx)
  return {
    base: baseAmostral(noPeriodo.length, 'inícios da classe Padrão', periodo),
    criterios: crit,
    inicios: taxa(noPeriodo.filter(fora).length, noPeriodo.length),
    meses,
    marcacoes: crit.serie,
    custo: {
      segmentoPor: 'tipo',
      porTipo: TIPOS_CARD.filter((t) => ultrapassados.some((m) => m.card.tipo === t)).map((t) => {
        const doTipo = naJanela.filter((m) => m.card.tipo === t)
        return {
          tipo: t,
          ultrapassados: ultrapassados.filter((m) => m.card.tipo === t).length,
          estatistica: estatistica(doTipo.length, janela, () => {
            const p = percentisDe(
              amostraBM(
                'story',
                doTipo.map((m) => espera(m) as number),
                janela,
              ),
            )
            return { p50: r2(p.p50), p85: r2(p.p85), p95: r2(p.p95) }
          }),
        }
      }),
    },
    grupo: 'equipe-tipo-padrao',
  }
}
