import type { FiltrosFluxo, ResultadoO20 } from '@metricas-dspd/contratos'
import {
  diaDeIso,
  diasUteisNoIntervalo,
  fimDoExpediente,
  instanteDe,
  isoDeDia,
} from '../core/calendario'
import { ordenarNeutro } from '../core/ordenar'
import { slug } from '../slug'
import { baseAmostral, criterios, periodoDe } from './comum'
import type { ContextoBM } from './indice'
import type { PapelColuna } from './modelo'
import { varreduraPorColuna, varreduraVida } from './varredura'

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
  papel: PapelColuna | 'sem-papel'
  tipoColuna: 'fila' | 'execucao'
  serie: readonly number[]
}

const somar = (a: readonly number[] | undefined, b: readonly number[]): number[] =>
  b.map((v, i) => v + (a?.[i] ?? 0))

/**
 * O20: fluxo cumulativo. Contagem diária de itens por faixa, da criação ao arquivamento (`fimDeVidaAberta`; o entregue
 * continua entregue depois de arquivado, P1): de "Backlog" a "Entregue", inclusive o que está antes do início e o que já foi entregue (varredura da vida,
 * B8). O WIP do O1 não é uma faixa: vem em `dias[].emProgresso`, da mesma varredura do O1 (invariante: igual ao
 * `wip` do O1 no dia). Faixa = coluna só quando há uma equipe filtrada (um quadro); em todos os outros casos
 * ("Todas" ou mais de uma equipe) é o papel da coluna, somado quadro a quadro, porque os nomes de coluna variam
 * por quadro; nunca equipe nem pessoa (R5). O destaque é a faixa de fila (nunca "Entregue") com o maior
 * crescimento absoluto entre o primeiro e o último dia do período filtrado (a regra da especificação); se nenhuma
 * cresceu, é `null`. Sem nenhuma transição no período, `faixas` e `dias` vêm vazios. Censo: sem estatística nem
 * mínimo.
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

  const desde = instanteDe(diaDeIso(periodo.inicio), 0, ctx.cal)
  let transicoes = 0
  let todas: Faixa[]
  if (equipe) {
    const quadro = `quadro-${slug(equipe.nome)}`
    const vida = varreduraVida(ctx, f, quadro, instantes, desde)
    transicoes = vida.transicoesNoPeriodo
    todas = ordenarNeutro(
      Array.from(vida.porColuna, ([coluna, serie]) => {
        const def = ctx.idx.papelDe(quadro, coluna)
        return {
          chave: coluna,
          rotulo: coluna,
          ordem: def?.ordem ?? Number.MAX_SAFE_INTEGER,
          papel: def?.papel ?? ('sem-papel' as const),
          tipoColuna: def?.tipo_coluna ?? ('execucao' as const),
          serie,
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
      const vida = varreduraVida(ctx, f, quadro, instantes, desde)
      transicoes += vida.transicoesNoPeriodo
      for (const [coluna, serie] of vida.porColuna) {
        const def = ctx.idx.papelDe(quadro, coluna)
        const chave = def?.papel ?? 'sem-papel'
        soma.set(chave, somar(soma.get(chave), serie))
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
          papel,
          tipoColuna: soFila ? ('fila' as const) : ('execucao' as const),
          serie,
        },
      ]
    })
  }

  // Sem transição no período é estado vazio (a especificação); faixa sem nenhum item não desenha área.
  const faixas = transicoes === 0 ? [] : todas.filter((x) => x.serie.some((v) => v > 0))
  // WIP do O1 (a mesma varredura, memoizada): de todos os quadros, ou só do da equipe filtrada.
  const emProgresso =
    faixas.length === 0
      ? []
      : varreduraPorColuna(ctx, f, equipe ? `quadro-${slug(equipe.nome)}` : null, instantes).total
          .wip
  // Toda faixa que sobrou tem alguma contagem > 0, logo a série não é vazia.
  const primeiro = (x: Faixa) => x.serie[0] as number
  const ultimo = (x: Faixa) => x.serie[x.serie.length - 1] as number
  let destaque: ResultadoO20['destaque'] = null
  let maior = 0
  for (const x of faixas)
    if (x.tipoColuna === 'fila' && x.papel !== 'entrega' && ultimo(x) - primeiro(x) > maior) {
      maior = ultimo(x) - primeiro(x)
      destaque = { faixa: x.chave, de: primeiro(x), para: ultimo(x) }
    }

  // Base = pico diário de itens nas faixas: é 0 exatamente quando não há faixa (estado vazio, regra `base.n === 0`).
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
    base: baseAmostral(pico, 'itens no fluxo no pico do período', periodo),
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
            emProgresso: emProgresso[i] as number,
          })),
    destaque,
    mudancasCriterio: crit.serie,
  }
}
