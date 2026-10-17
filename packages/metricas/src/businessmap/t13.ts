import {
  MINIMO_AMOSTRA,
  TIPOS_CARD,
  type FiltrosFluxo,
  type Granularidade,
  type ResultadoT13,
} from '@metricas-dspd/contratos'
import { estatistica, percentisDe, taxa } from '../core/estatistica'
import { amostraBM } from './amostra'
import { blocosDe } from './blocos'
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
import type { ExtensaoTambemBM, VinculoPredecessor } from './extensao'
import type { ContextoBM, MarcosCard } from './indice'

/** Granularidades do T13 (CA-8): uma por bloco, nunca juntas. O projeto não é item contado. */
const GRANULARIDADES_T13 = ['story', 'frente'] as const satisfies readonly Granularidade[]

type Situacao = 'dependeu' | 'nao-dependeu' | 'sem-dado'

/**
 * Situação de um card entregue frente aos vínculos (D-14' = A, R-4 = sim, CA-40, CA-21): "dependeu" se algum vínculo
 * `predecessor` com card de outro quadro esteve vigente em algum momento antes da conclusão, inclusive o removido antes
 * da entrega (por isso `removido_em` não entra na conta: o que importa é que o vínculo existiu antes). Vínculo com quadro
 * desconhecido e nenhum conhecido que dependa dá "sem dado", nunca "não dependeu".
 */
function situacaoDe(vinculos: readonly VinculoPredecessor[], concluidoEm: number): Situacao {
  let desconhecido = false
  for (const v of vinculos) {
    if (v.criado_em > concluidoEm) continue
    if (v.outro_quadro === true) return 'dependeu'
    if (v.outro_quadro === null) desconhecido = true
  }
  return desconhecido ? 'sem-dado' : 'nao-dependeu'
}

/**
 * T13: dependências entre quadros. Entregas do período por granularidade (demanda ou frente, um bloco cada): k que
 * dependeram de trabalho de outro quadro, de n com dado (`semDado` à parte). A resposta traz só o booleano, nunca o
 * quadro nem a equipe do outro lado (evita virar comparação entre times). O par P50/P85 do lead time ponta a ponta com
 * × sem dependência (o mesmo `blocosDe` do T1, sem recálculo) é por tipo, na janela móvel de 12 semanas, e só com 20 em
 * cada grupo (regra 7, CA-6); `grupoAbaixoDoMinimo` diz qual faltou. Sem a extensão (sem fonte de vínculos) toda entrega
 * é `semDado` e a taxa fica com n = 0, nunca erro; com a fonte e sem vínculo do card, ele "não dependeu".
 */
export function calcularT13(
  ctx: ContextoBM,
  f: FiltrosFluxo,
  ext?: ExtensaoTambemBM,
): ResultadoT13 {
  const periodo = periodoDe(ctx, f)
  const janela = janelaPercentis(ctx, f, 'story')
  const porCard = new Map<string, VinculoPredecessor[]>()
  for (const v of ext?.vinculos ?? []) {
    const l = porCard.get(v.card_id)
    if (l) l.push(v)
    else porCard.set(v.card_id, [v])
  }
  const duracaoDe =
    (granularidade: Granularidade, janelaDoBloco: typeof janela) => (valores: readonly number[]) =>
      estatistica(valores.length, janelaDoBloco, () => {
        const p = percentisDe(amostraBM(granularidade, valores, janelaDoBloco))
        return { p50: r2(p.p50), p85: r2(p.p85), p95: r2(p.p95) }
      })
  const blocos = GRANULARIDADES_T13.map((granularidade) => {
    // R1: a janela e a amostra levam o rótulo da própria granularidade (a trava de classe não aceita story e frente juntas).
    const janelaDoBloco = janelaPercentis(ctx, f, granularidade)
    const duracao = duracaoDe(granularidade, janelaDoBloco)
    const entregues = selecionar(ctx, f, granularidade)
      .filter((m) => granularidade !== 'story' || ehDemanda(m))
      .filter((m) => m.entrega !== null)
      .map((m) => ({
        m,
        // Sem a fonte de vínculos nada se sabe: "sem dado", nunca "não dependeu".
        s:
          ext === undefined
            ? ('sem-dado' as const)
            : situacaoDe(porCard.get(m.card.card_id) ?? [], m.entrega as number),
      }))
    const doPeriodo = entregues.filter((e) => dentro(ctx, e.m.entrega, periodo))
    const comDado = doPeriodo.filter((e) => e.s !== 'sem-dado')
    // Lead time (T1) só de quem tem compromisso; o par é por tipo e dentro da janela.
    const lead = (m: MarcosCard): number | null => blocosDe(ctx, m)?.total ?? null
    const naJanela = entregues.filter(
      (e) => e.s !== 'sem-dado' && dentro(ctx, e.m.entrega, janelaDoBloco),
    )
    const tipos = TIPOS_CARD.filter((t) => naJanela.some((e) => e.m.card.tipo === t))
    return {
      granularidade,
      nTotal: doPeriodo.length,
      entregas: taxa(comDado.filter((e) => e.s === 'dependeu').length, comDado.length),
      semDado: doPeriodo.length - comDado.length,
      comparacoes: tipos.map((tipo) => {
        const doTipo = naJanela.filter((e) => e.m.card.tipo === tipo)
        const valores = (s: Situacao) =>
          doTipo.filter((e) => e.s === s).flatMap((e) => lead(e.m) ?? [])
        const com = valores('dependeu')
        const sem = valores('nao-dependeu')
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
  })
  // Uma granularidade por vez: a base principal é a das demandas e a das frentes vai à parte, nunca somada.
  const [demandas, frentes] = blocos as [(typeof blocos)[number], (typeof blocos)[number]]
  return {
    base: baseAmostral(demandas.nTotal, 'demandas entregues', periodo, {
      n: frentes.nTotal,
      unidade: 'frentes entregues',
    }),
    criterios: criterios('T13', periodo, janela, ctx),
    segmentoPor: 'tipo',
    porGranularidade: blocos.map(({ nTotal: _n, ...bloco }) => bloco),
  }
}
