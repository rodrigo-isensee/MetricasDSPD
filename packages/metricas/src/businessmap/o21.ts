import {
  MINIMO_AMOSTRA,
  TIPOS_CARD,
  type FiltrosFluxo,
  type ResultadoO21,
  type TipoCard,
} from '@metricas-dspd/contratos'
import { estatistica, percentisDe, taxa } from '../core/estatistica'
import { ordenarNeutro } from '../core/ordenar'
import { amostraBM } from './amostra'
import {
  baseAmostral,
  criterios,
  dentro,
  ehDemanda,
  janelaPercentis,
  periodoDe,
  r2,
  selecionar,
} from './comum'
import type { ContextoBM } from './indice'
import type { FatoTransicao, PapelColuna } from './modelo'
import { entreguesDe } from './o3'

/** Papéis de coluna na ordem do fluxo (ordem neutra do domínio da matriz por papel). */
const ORDEM_PAPEL: readonly PapelColuna[] = [
  'backlog',
  'compromisso',
  'trabalho',
  'homologacao',
  'entrega',
]

/**
 * O21: fluxo reverso. Considera as entregas do período (`concluido_em`, demanda) e marca com retorno as que tiveram
 * ao menos uma transição `retorno` até a conclusão (a reabertura, retorno a partir de "Entregue", conta). A matriz
 * conta os pares origem -> destino dos retornos: por coluna só quando há uma equipe filtrada num único quadro e, em
 * todos os outros casos ("Todas" ou mais de uma equipe), por papel da coluna, porque os nomes de coluna variam por
 * quadro; nunca por equipe nem por pessoa (R5). O par "com x sem" compara o tempo de ciclo, vindo da mesma função do
 * O3 (`entreguesDe`, sem recálculo), só dentro de cada tipo de demanda (regra 7) e com 20 itens em cada grupo (CA-6);
 * cada grupo carrega o próprio n e `grupoAbaixoDoMinimo` diz qual faltou.
 */
export function calcularO21(ctx: ContextoBM, f: FiltrosFluxo): ResultadoO21 {
  const periodo = periodoDe(ctx, f)
  const janela = janelaPercentis(ctx, f, 'story')
  const cards = selecionar(ctx, f, 'story').filter(ehDemanda)
  // A entrega vigente é a última transição do card: todo retorno de quem está entregue vem antes dela.
  const entregas = entreguesDe(
    ctx,
    cards.filter((m) => m.entrega !== null),
  ).map((e) => ({
    ...e,
    // Quem tem entrega tem transições (a entrega vem delas): o índice sempre traz a lista.
    retornos: (ctx.idx.transicoesPorCard.get(e.m.card.card_id) as readonly FatoTransicao[]).filter(
      (t) => t.direcao === 'retorno' && t.coluna_origem !== null,
    ),
  }))
  const doPeriodo = entregas.filter((e) => dentro(ctx, e.m.entrega, periodo))
  const comRetorno = doPeriodo.filter((e) => e.retornos.length > 0)

  const quadros = new Set(doPeriodo.map((e) => e.m.card.quadro_id))
  const eixo = f.equipe.length === 1 && quadros.size <= 1 ? ('coluna' as const) : ('papel' as const)
  const rotulo = (quadro: string, coluna: string) => {
    const def = ctx.idx.papelDe(quadro, coluna)
    return eixo === 'papel' ? (def?.papel ?? 'sem-papel') : coluna
  }
  const ordem = (quadro: string, coluna: string) => {
    const def = ctx.idx.papelDe(quadro, coluna)
    return eixo === 'papel' ? ORDEM_PAPEL.indexOf(def?.papel ?? 'backlog') : (def?.ordem ?? 0)
  }
  const pares = new Map<
    string,
    { origem: string; destino: string; retornos: number; reaberto: boolean; o: number; d: number }
  >()
  let reaberturas = 0
  for (const e of doPeriodo)
    for (const t of e.retornos) {
      const q = e.m.card.quadro_id
      const origem = rotulo(q, t.coluna_origem as string)
      const destino = rotulo(q, t.coluna_destino)
      const reaberto = ctx.idx.papelDe(q, t.coluna_origem as string)?.papel === 'entrega'
      if (reaberto) reaberturas++
      const chave = `${origem}|${destino}`
      const par = pares.get(chave)
      if (par) par.retornos++
      else
        pares.set(chave, {
          origem,
          destino,
          retornos: 1,
          reaberto,
          o: ordem(q, t.coluna_origem as string),
          d: ordem(q, t.coluna_destino),
        })
    }

  const naJanela = entregas.filter((e) => dentro(ctx, e.m.entrega, janela))
  const tipos = TIPOS_CARD.filter((t: TipoCard) => naJanela.some((e) => e.m.card.tipo === t))
  const duracao = (ciclos: readonly number[]) =>
    estatistica(ciclos.length, janela, () => {
      const p = percentisDe(amostraBM('story', ciclos, janela))
      return { p50: r2(p.p50), p85: r2(p.p85), p95: r2(p.p95) }
    })
  const crit = criterios('O21', periodo, janela, ctx)
  return {
    base: baseAmostral(doPeriodo.length, 'entregas', periodo),
    criterios: crit,
    entregas: taxa(comRetorno.length, doPeriodo.length),
    matriz: {
      eixo,
      celulas: ordenarNeutro(Array.from(pares.values()), (p) => [
        p.o,
        p.d,
        p.origem,
        p.destino,
      ]).map(({ origem, destino, retornos, reaberto }) => ({
        origem,
        destino,
        retornos,
        reaberto,
      })),
    },
    reaberturas,
    segmentoPor: 'tipo',
    comparacoes: tipos.map((tipo) => {
      const doTipo = naJanela.filter((e) => e.m.card.tipo === tipo)
      const com = doTipo.filter((e) => e.retornos.length > 0).map((e) => e.ciclo)
      const sem = doTipo.filter((e) => e.retornos.length === 0).map((e) => e.ciclo)
      const abaixoCom = com.length < MINIMO_AMOSTRA
      const abaixoSem = sem.length < MINIMO_AMOSTRA
      return {
        tipo,
        com: duracao(com),
        sem: duracao(sem),
        grupoAbaixoDoMinimo:
          abaixoCom && abaixoSem
            ? ('ambos' as const)
            : abaixoCom
              ? ('com' as const)
              : abaixoSem
                ? ('sem' as const)
                : null,
      }
    }),
  }
}
