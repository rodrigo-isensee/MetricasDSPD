import type { ResultadoT8, FiltrosFluxo } from '@metricas-dspd/contratos'
import { diaDeIso, diaLocal, diasUteisNoIntervalo } from '../core/calendario'
import { MINIMO_AMOSTRA, taxa } from '../core/estatistica'
import { baseAmostral, criterios, periodoDe, selecionar } from './comum'
import {
  EXTENSAO_BM_VAZIA,
  TETO_DIAS_UTEIS_SPRINT,
  type ExtensaoBM,
  type Sprint,
  type SprintCard,
} from './extensao'
import type { ContextoBM, MarcosCard } from './indice'

/**
 * Janela única das sprints do T8 e do T15 (E7.504: "a janela vem da mesma função do T8"): só a sprint que tem filho nos filtros, com as duas datas, dentro do teto de
 * dias úteis e que toca o período. Sem as duas datas (ou janela invertida) e acima do teto são contadas à parte.
 */
export function sprintsDoRecorte(ctx: ContextoBM, f: FiltrosFluxo, ext: ExtensaoBM) {
  const periodo = periodoDe(ctx, f)
  const porId = new Map(
    selecionar(ctx, f, 'story', { semTipo: true }).map((m) => [m.card.card_id, m]),
  )
  const ini = diaDeIso(periodo.inicio)
  const fim = diaDeIso(periodo.fim)

  const filhosDe = new Map<string, SprintCard[]>()
  for (const c of ext.sprintCards) {
    if (!porId.has(c.card_id)) continue
    const lista = filhosDe.get(c.sprint_id)
    if (lista) lista.push(c)
    else filhosDe.set(c.sprint_id, [c])
  }

  let semDatas = 0
  let acimaDoTeto = 0
  const janelaValida = (s: Sprint): { inicio: string; fim: string } | null => {
    if (s.inicio === null || s.fim === null || diaDeIso(s.fim) < diaDeIso(s.inicio)) {
      semDatas++
      return null
    }
    if (
      diasUteisNoIntervalo(diaDeIso(s.inicio), diaDeIso(s.fim), ctx.cal).length >
      TETO_DIAS_UTEIS_SPRINT
    ) {
      acimaDoTeto++
      return null
    }
    return { inicio: s.inicio, fim: s.fim }
  }

  const dentro = ext.sprints.flatMap((s) => {
    const itens = filhosDe.get(s.sprint_id) ?? []
    // só a sprint que tem filho nos filtros conta, inclusive para a contagem de "fora da conta"
    if (itens.length === 0) return []
    const janela = janelaValida(s)
    if (janela === null) return []
    return diaDeIso(janela.fim) >= ini && diaDeIso(janela.inicio) <= fim
      ? [{ s, janela, itens }]
      : []
  })
  return { periodo, porId, dentro, semDatas, acimaDoTeto }
}

/**
 * T8: sprint. A sprint é um card-template pai no BusinessMap e as entregas são os cards filhos.
 * Planejado = filho ligado ao pai até o início da sprint; ligado depois = entrada não planejada
 * (separada). Entregue = concluído até o fim da sprint. Por sprint e agregado, sem ranking nem
 * comparação entre times e sem alvo de 100% (7.2).
 *
 * Dado real (pedido 105, E7.499, D-T8 "A" do dono): a janela da sprint é o primeiro início de execução até a primeira conclusão do próprio card
 * Sprint. Sprint sem as duas datas (ou com a janela invertida), ou com mais de `TETO_DIAS_UTEIS_SPRINT` dias úteis, fica FORA da conta e é contada
 * à parte (`foraDaConta`). A base não guarda a data do vínculo do filho com a Sprint (`ligado_em` nulo): "não planejado" é o filho criado depois do início
 * da sprint. Com dado real, abaixo de 20 sprints no recorte nenhuma estatística é publicada. Só BusinessMap.
 */
export function calcularT8(
  ctx: ContextoBM,
  f: FiltrosFluxo,
  ext: ExtensaoBM = EXTENSAO_BM_VAZIA,
): ResultadoT8 {
  const real = ext.sprintsDadoReal === true
  const { periodo, porId, dentro, semDatas, acimaDoTeto } = sprintsDoRecorte(ctx, f, ext)

  const sprints = dentro.map(({ s, janela, itens }) => {
    const diaInicio = diaDeIso(janela.inicio)
    const diaFim = diaDeIso(janela.fim)
    // vínculo sem data: o filho criado depois do início da sprint é entrada não planejada
    const planejado = (c: SprintCard): boolean =>
      c.ligado_em !== null
        ? diaDeIso(c.ligado_em) <= diaInicio
        : diaLocal((porId.get(c.card_id) as MarcosCard).card.criado_em, ctx.cal) <= diaInicio
    const comprometidos = itens.filter(planejado)
    const entregues = comprometidos.filter((c) => {
      const entrega = (porId.get(c.card_id) as MarcosCard).entrega
      return entrega !== null && diaLocal(entrega, ctx.cal) <= diaFim
    }).length
    return {
      sprintId: s.sprint_id,
      nome: s.nome,
      inicio: janela.inicio,
      fim: janela.fim,
      emAndamento: diaFim > ctx.hojeDia,
      itens: itens.length,
      comprometidos: comprometidos.length,
      entreguesDoComprometido: entregues,
      carryOver: comprometidos.length - entregues,
      entradaNaoPlanejada: itens.length - comprometidos.length,
      entreguePct: taxa(entregues, comprometidos.length),
      naoPlanejadoPct: taxa(itens.length - comprometidos.length, itens.length),
    }
  })
  const comEstatistica = !real || sprints.length >= MINIMO_AMOSTRA
  const publicadas = comEstatistica ? sprints : []
  const fechadas = publicadas.filter((s) => !s.emAndamento)
  const soma = (k: 'itens' | 'comprometidos' | 'entreguesDoComprometido' | 'entradaNaoPlanejada') =>
    fechadas.reduce((t, s) => t + s[k], 0)
  const foraDaConta = real
    ? { semDatas, acimaDoTeto, tetoDiasUteis: TETO_DIAS_UTEIS_SPRINT }
    : undefined
  return {
    base: baseAmostral(
      real ? sprints.length : sprints.reduce((t, s) => t + s.itens, 0),
      real ? 'sprints' : 'itens em sprint',
      periodo,
      real
        ? { n: sprints.reduce((t, s) => t + s.itens, 0), unidade: 'itens em sprint' }
        : undefined,
    ),
    criterios: criterios('T8', periodo, periodo, ctx),
    sprints: publicadas,
    agregado: comEstatistica
      ? {
          entreguePct: taxa(soma('entreguesDoComprometido'), soma('comprometidos')),
          naoPlanejadoPct: taxa(soma('entradaNaoPlanejada'), soma('itens')),
        }
      : {
          // abaixo do mínimo de sprints nada é publicado: o "k de n" conta as sprints do recorte, nunca itens
          entreguePct: { status: 'insuficiente', k: 0, n: sprints.length, minimo: MINIMO_AMOSTRA },
          naoPlanejadoPct: {
            status: 'insuficiente',
            k: 0,
            n: sprints.length,
            minimo: MINIMO_AMOSTRA,
          },
        },
    ...(foraDaConta ? { foraDaConta, sprintsNoRecorte: sprints.length } : {}),
  }
}
