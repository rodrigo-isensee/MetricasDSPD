import type { ResultadoO2 } from '@metricas-dspd/contratos'
import {
  TIPOS_CARD,
  type Estatistica,
  type Percentis,
  type TipoCard,
} from '@metricas-dspd/contratos'
import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { diaDeIso, horasUteisEntre, fimDoExpediente } from '../core/calendario'
import { percentis } from '../core/estatistica'
import { slug } from '../slug'
import { amostraBM } from './amostra'
import {
  baseAmostral,
  criterios,
  dentro,
  du,
  janelaPercentis,
  periodoDe,
  r2,
  selecionar,
} from './comum'
import { estadoEm, idadeHUEm } from './estado'
import type { ContextoBM } from './indice'
import { ordenarNeutro } from '../core/ordenar'

/** O2: idade do trabalho em progresso, comparada aos percentis do próprio tipo. */
export function calcularO2(ctx: ContextoBM, f: FiltrosFluxo): ResultadoO2 {
  const periodo = periodoDe(ctx, f)
  const janela = janelaPercentis(ctx, f, 'story')
  const t = Math.min(ctx.hoje, fimDoExpediente(diaDeIso(periodo.fim), ctx.cal))
  const cards = selecionar(ctx, f, 'story')

  const referenciaPorTipo = new Map<TipoCard, Estatistica<Percentis>>()
  let concluidos = 0
  for (const tipo of TIPOS_CARD) {
    const vals = cards
      .filter((m) => m.card.tipo === tipo && m.cicloHU !== null && dentro(ctx, m.entrega, janela))
      .map((m) => du(ctx, m.cicloHU as number))
    concluidos += vals.length
    referenciaPorTipo.set(tipo, percentis(amostraBM('story', vals, janela)))
  }

  const umaEquipe = f.equipe.length === 1
  const aberto = cards.map((m) => ({ m, e: estadoEm(ctx, m, t) })).filter((x) => x.e.emWip)

  let etapas: string[] = ['Fila', 'Execução']
  if (umaEquipe) {
    const eq = ctx.idx.base.config.equipes.find((e) => slug(e.nome) === f.equipe[0])
    if (eq) {
      etapas = ordenarNeutro(
        ctx.idx.base.colunas.filter(
          (c) =>
            c.quadro_id === `quadro-${slug(eq.nome)}` &&
            (c.papel === 'trabalho' || c.papel === 'homologacao'),
        ),
        (c) => [c.ordem, c.coluna],
      ).map((c) => c.coluna)
    }
  }

  const itens = ordenarNeutro(aberto, ({ m }) => [m.card.card_id]).map(({ m, e }) => {
    const idade = du(ctx, idadeHUEm(ctx, m, t))
    const ref = referenciaPorTipo.get(m.card.tipo)
    let situacao: ResultadoO2['itens'][number]['situacao'] = 'sem-referencia'
    if (ref && ref.status === 'ok') {
      situacao =
        idade > ref.valor.p95 ? 'acima-p95' : idade > ref.valor.p85 ? 'entre-p85-p95' : 'dentro'
    }
    const semMover = du(ctx, horasUteisEntre(e.ultimaTransicao as number, t, ctx.cal))
    const motivo = e.bloqueioAberto?.motivo ?? null
    return {
      cardId: m.card.card_id,
      titulo: m.card.titulo,
      tipo: m.card.tipo,
      etapa: umaEquipe ? (e.coluna as string) : e.tipoColuna === 'fila' ? 'Fila' : 'Execução',
      idadeDiasUteis: r2(idade),
      semMoverHaDiasUteis: r2(semMover),
      situacao,
      bloqueioMotivo: motivo,
    }
  })

  const tipos = TIPOS_CARD.map((tipo) => {
    const dele = itens.filter((i) => i.tipo === tipo)
    const ref = referenciaPorTipo.get(tipo) as Estatistica<Percentis>
    const acimaP95 = dele.filter((i) => i.situacao === 'acima-p95').length
    const acimaP85 = acimaP95 + dele.filter((i) => i.situacao === 'entre-p85-p95').length
    return { tipo, abertos: dele.length, acimaP85, acimaP95, referencia: ref }
  }).filter((x) => x.abertos > 0 || x.referencia.n > 0)

  const comAbertos = tipos.filter((x) => x.abertos > 0)
  const sugerido = ordenarNeutro(comAbertos, (x) => [-x.acimaP85, -x.abertos, x.tipo])[0]
  const acimaP95 = itens.filter((i) => i.situacao === 'acima-p95').length
  const algumaRef = tipos.some((x) => x.referencia.status === 'ok' && x.abertos > 0)
  return {
    base: baseAmostral(itens.length, 'itens abertos', janela, {
      n: concluidos,
      unidade: 'itens concluídos na janela',
    }),
    criterios: criterios('O2', periodo, janela, ctx),
    janelaPercentis: janela,
    etapas,
    agrupadoPorColuna: umaEquipe,
    tipos,
    tipoSugerido: sugerido ? sugerido.tipo : null,
    itens,
    acimaP95,
    statusMeta: !algumaRef ? 'sem-referencia' : acimaP95 === 0 ? 'dentro' : 'fora',
  }
}
