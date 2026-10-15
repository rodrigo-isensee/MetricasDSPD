import type { FiltrosFluxo, ResultadoO20 } from '@metricas-dspd/contratos'
import { diaDeIso, diasUteisNoIntervalo, fimDoExpediente, isoDeDia } from '../core/calendario'
import { ordenarNeutro } from '../core/ordenar'
import { slug } from '../slug'
import { baseAmostral, criterios, periodoDe } from './comum'
import type { ContextoBM } from './indice'
import type { PapelColuna } from './modelo'
import { varreduraPorColuna } from './varredura'

/** Papéis na ordem do fluxo, com o rótulo da especificação (O20: "Pronto para", "Em execução"...). */
const PAPEIS: readonly { papel: PapelColuna | 'sem-papel'; rotulo: string }[] = [
  { papel: 'backlog', rotulo: 'Backlog' },
  { papel: 'compromisso', rotulo: 'Pronto para' },
  { papel: 'trabalho', rotulo: 'Em execução' },
  { papel: 'homologacao', rotulo: 'Homologação' },
  { papel: 'entrega', rotulo: 'Entregue' },
  { papel: 'sem-papel', rotulo: 'Sem papel definido' },
]

interface Faixa {
  chave: string
  rotulo: string
  ordem: number
  tipoColuna: 'fila' | 'execucao'
  serie: readonly number[]
}

const somar = (a: readonly number[] | undefined, b: readonly number[]): number[] =>
  b.map((v, i) => v + (a?.[i] ?? 0))

/**
 * O20: fluxo cumulativo. Contagem diária de itens em progresso por faixa, da varredura +1/-1 por coluna (B8, a mesma
 * do O1, memoizada no contexto). Faixa = coluna só quando há uma equipe filtrada (um quadro); em todos os outros
 * casos ("Todas" ou mais de uma equipe) é o papel da coluna, somado quadro a quadro, porque os nomes de coluna variam
 * por quadro; nunca equipe nem pessoa (R5). O destaque é a faixa de fila com o maior crescimento absoluto entre o
 * primeiro e o último dia do período; se nenhuma cresceu, é `null` ("Nenhuma etapa acumulou"). Sem nenhuma contagem
 * no período, `faixas` e `dias` vêm vazios. Contagem diária é censo: não há estatística nem mínimo.
 */
export function calcularO20(ctx: ContextoBM, f: FiltrosFluxo): ResultadoO20 {
  const periodo = periodoDe(ctx, f)
  const dias = diasUteisNoIntervalo(diaDeIso(periodo.inicio), diaDeIso(periodo.fim), ctx.cal)
  const instantes = dias.map((d) => Math.min(ctx.hoje, fimDoExpediente(d, ctx.cal)))
  const equipe =
    f.equipe.length === 1
      ? ctx.idx.base.config.equipes.find((e) => slug(e.nome) === f.equipe[0])
      : undefined
  const agrupamento = equipe ? ('coluna' as const) : ('papel' as const)

  let todas: Faixa[]
  if (equipe) {
    const quadro = `quadro-${slug(equipe.nome)}`
    const { porColuna } = varreduraPorColuna(ctx, f, quadro, instantes)
    todas = ordenarNeutro(
      Array.from(porColuna, ([coluna, s]) => {
        const def = ctx.idx.papelDe(quadro, coluna)
        return {
          chave: coluna,
          rotulo: coluna,
          ordem: def?.ordem ?? Number.MAX_SAFE_INTEGER,
          tipoColuna: def?.tipo_coluna ?? ('execucao' as const),
          serie: s.wip,
        }
      }),
      (x) => [x.ordem, x.chave],
    )
  } else {
    const soma = new Map<string, number[]>()
    const tipos = new Map<string, Set<'fila' | 'execucao'>>()
    const quadros = ordenarNeutro(
      Array.from(new Set(ctx.idx.base.colunas.map((c) => c.quadro_id))),
      (q) => [q],
    )
    for (const quadro of quadros) {
      for (const [coluna, s] of varreduraPorColuna(ctx, f, quadro, instantes).porColuna) {
        const def = ctx.idx.papelDe(quadro, coluna)
        const chave = def?.papel ?? 'sem-papel'
        soma.set(chave, somar(soma.get(chave), s.wip))
        const t = tipos.get(chave) ?? new Set()
        t.add(def?.tipo_coluna ?? 'execucao')
        tipos.set(chave, t)
      }
    }
    todas = PAPEIS.flatMap(({ papel, rotulo }, ordem) => {
      const serie = soma.get(papel)
      if (!serie) return []
      // Papel misto (fila e execução no mesmo papel) conta como execução: fica fora do destaque de fila.
      const soFila = tipos.get(papel)?.size === 1 && tipos.get(papel)?.has('fila')
      return [
        {
          chave: papel,
          rotulo,
          ordem,
          tipoColuna: soFila ? ('fila' as const) : ('execucao' as const),
          serie,
        },
      ]
    })
  }

  // Faixa sem nenhum item no período não desenha área: some da legenda (sem transição = estado vazio).
  const faixas = todas.filter((x) => x.serie.some((v) => v > 0))
  // Toda faixa que sobrou tem alguma contagem > 0, logo a série não é vazia.
  const primeiro = (x: Faixa) => x.serie[0] as number
  const ultimo = (x: Faixa) => x.serie[x.serie.length - 1] as number
  let destaque: ResultadoO20['destaque'] = null
  let maior = 0
  for (const x of faixas)
    if (x.tipoColuna === 'fila' && ultimo(x) - primeiro(x) > maior) {
      maior = ultimo(x) - primeiro(x)
      destaque = { faixa: x.chave, de: primeiro(x), para: ultimo(x) }
    }

  // Base = pico diário de itens em progresso: é 0 exatamente quando não há faixa (estado vazio, regra `base.n === 0`).
  const pico = dias.reduce(
    (m, _d, i) =>
      Math.max(
        m,
        faixas.reduce((s, x) => s + (x.serie[i] as number), 0),
      ),
    0,
  )
  const crit = criterios('O20', periodo, periodo, ctx)
  return {
    base: baseAmostral(pico, 'itens em progresso no pico do período', periodo),
    criterios: crit,
    agrupamento,
    faixas: faixas.map(({ chave, rotulo, ordem, tipoColuna }) => ({
      chave,
      rotulo,
      ordem,
      tipoColuna,
    })),
    dias:
      faixas.length === 0
        ? []
        : dias.map((d, i) => ({
            dia: isoDeDia(d),
            contagens: faixas.map((x) => x.serie[i] as number),
          })),
    destaque,
    mudancasCriterio: crit.serie,
  }
}
