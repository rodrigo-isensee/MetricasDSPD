/**
 * Testes de propriedade parametrizados por REGRAS_METRICA (M-005, docs/architecture/regras-metricas.md, seção 3).
 * Cada propriedade itera a matriz e declara as exceções NOMINALMENTE, com o motivo. Os meta-testes
 * do fim do arquivo bloqueiam: métrica sem teste, exceção órfã ou desnecessária, status incoerente.
 */
import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { METRICA_IDS, MINIMO_AMOSTRA, type MetricaId } from '@metricas-dspd/contratos'
import { fonteDaMetrica, resultadoPV1 } from '@metricas-dspd/contratos'
import {
  gerarBaseMock,
  gerarExtensoesMock,
  gerarPesquisaMock,
  type BaseMock,
} from '@metricas-dspd/mock'
import { calcularMetrica, type ContextosMetricas } from './calcular'
import { acelerato, businessmap, pesquisa } from '.'
import type { BasePesquisa } from './pesquisa'
import { CALENDARIO_PADRAO } from './core/calendario'
import { REGRAS_METRICA, type ChaveSegmentacao, type RegraMetrica } from './core/regras'
import type { BaseBM } from './businessmap/modelo'
import type { BaseAC } from './acelerato/modelo'

const DIA = 86_400_000
const base: BaseMock = gerarBaseMock({ escala: 0.5 })
const HOJE = base.config.hoje
const hojeMs = businessmap.criarContextoBM(base.bm, HOJE, CALENDARIO_PADRAO).hoje

const EXT = gerarExtensoesMock(base)
const PESQ = gerarPesquisaMock(base.config)
const ctxPesq = (p: BasePesquisa) => pesquisa.criarContextoPesquisa(p, HOJE)
const ctxDe = (bm: BaseBM, ac: BaseAC, pesq: BasePesquisa = PESQ): ContextosMetricas => ({
  ext: EXT,
  pesq: ctxPesq(pesq),
  bm: businessmap.criarContextoBM(bm, HOJE, CALENDARIO_PADRAO),
  ac: acelerato.criarContextoAC(ac, HOJE, CALENDARIO_PADRAO),
})
const CTX = ctxDe(base.bm, base.ac)

const ehAC = (id: MetricaId) => fonteDaMetrica(id) === 'acelerato'
const filtrosDe = (id: MetricaId, tipo: '12s' | '6m' | '12m' = '12m') =>
  id === 'VISAO_GERAL' || fonteDaMetrica(id) === 'pesquisa'
    ? {}
    : ehAC(id)
      ? { equipe: [], prioridade: [], periodo: { tipo } }
      : { equipe: [], tipo: [], sistema: [], periodo: { tipo } }
const calc = (id: MetricaId, ctx: ContextosMetricas): unknown =>
  calcularMetrica(id, filtrosDe(id) as never, ctx)
/** Resultado normalizado (sem `undefined`) para comparar por valor. */
const plano = (x: unknown): unknown => JSON.parse(JSON.stringify(x))

const BM_VAZIA: BaseBM = {
  ...base.bm,
  cards: [],
  transicoes: [],
  bloqueios: [],
  fichas: [],
}
const AC_VAZIA: BaseAC = { ...base.ac, chamados: [], etapas: [] }

// ---------------------------------------------------------------------------------------------
// Exceções nominais e cobertura
// ---------------------------------------------------------------------------------------------
type Excecoes = Partial<Record<MetricaId, string>>
const COMPOSICAO =
  'composição: não calcula, só reexpõe blocos (coberta pela propriedade 3 por bloco)'

interface Propriedade {
  nome: string
  aplica: (id: MetricaId, r: RegraMetrica) => boolean
  excecoes: Excecoes
}
const executados: Record<string, Set<MetricaId>> = {}

const P: Record<'p1' | 'p2' | 'p3' | 'p4' | 'p5' | 'p6' | 'p7', Propriedade> = {
  p1: {
    nome: 'arquivar entregue não muda o resultado',
    aplica: (_id, r) => r.dominio === 'businessmap' && r.incluiArquivados !== 'nao-se-aplica',
    excecoes: {},
  },
  p2: {
    nome: 'classe isolada = classe no conjunto',
    // A pesquisa (dominio 'pesquisa') não tem item classificável: as suas propriedades próprias são a P7.
    aplica: (id, r) => id !== 'VISAO_GERAL' && r.dominio !== 'pesquisa' && r.segmentacao.length > 0,
    excecoes: {
      O1: 'primeira chave é coluna: o retrato por coluna depende da equipe única selecionada, sem classificador de item',
      BLOQUEADOS:
        'primeira chave é coluna: lista de itens bloqueados, sem classificador de item por coluna',
      O12: 'as classes são chaves de contagem em porResponsabilidade, sem nó rotulado por classe',
      O18: 'com-sem-bug deriva do vínculo de bugs, sem classificador de item',
      T3: 'natureza de alocação vem da configuração de alocação, sem classificador de item no mock',
      T7: 'primeira chave é projeto: depende da hierarquia projeto > frente (classificador por projeto não implementado)',
      T9: 'primeira chave é projeto: depende da hierarquia projeto > frente (classificador por projeto não implementado)',
      E2: 'primeira chave é objetivo: vínculo por ficha/objetivo, classificador não implementado',
      E3: 'primeira chave é iniciativa: censo por card de projeto (classificador por iniciativa não implementado)',
      S3: 'pct é a participação no total de todas as prioridades, por definição (visão de composição)',
      S5: 'pct é a participação do motivo no total dos motivos, por definição',
      S6: 'pct é a participação do motivo no total dos motivos, por definição',
      S7: 'tipo de reclassificação é evento do chamado (classificador não implementado)',
      O13: 'o resultado é série mensal de contagem de defeitos sobre a vazão total; o tipo é a definição, sem nó rotulado por tipo',
      O14: 'a chave é área solicitante (classificador por área não implementado); a distribuição é de contagem por nome, com top 10 e demais',
      O16: 'primeira chave é faixa de idade (derivada do instante, sem classificador de item); severidade é contagem de abertos',
      O19: 'primeira chave é motivo do bloqueio, que vive no fato_bloqueio (um card tem vários motivos): isolar por card não isola o motivo; pctDoTotal é participação no total, por definição',
      T10: 'primeira chave é fornecedor, que vive no fato_bloqueio (um card pode ter bloqueios de mais de um fornecedor): isolar por card não isola o fornecedor',
      T12: 'primeira chave é a área solicitante (campo do card, sem classificador de item no harness); o isolamento da área e a ordem por volume são provados em t12.test.ts (R5, CA-11), e a taxa por área vem do mesmo conjunto de demandas',
      E7: 'primeira chave é o sistema (campo do card, sem classificador de item no harness) e a participação é fração do total, por definição; o isolamento por sistema e a natureza pelo T3 são provados em e7.test.ts e e7.natureza.test.ts (CA-23)',
      O17: 'primeira chave é causa raiz, que vive na extensão (mapa por chamado), sem classificador de item no modelo do núcleo',
      E4: 'série trimestral de contagem de projetos; o tipo de projeto não é rótulo de nó no resultado',
      S8: 'a prioridade atua só como filtro; o resultado é série mensal sem nó por prioridade',
      S9: 'a chave é o motivo da pendência, que vive na etapa (classificador por motivo não implementado)',
      S11: 'os grupos P1, P2 e contorno se sobrepõem por definição: o nó do grupo depende do conjunto',
      S12: 'a chave é a categoria do sistema (contagem por nome) e o recorrente depende do conjunto da janela',
    },
  },
  p3: {
    nome: 'dados do outro domínio não alteram o resultado',
    aplica: () => true,
    excecoes: {},
  },
  p4: {
    nome: 'fronteira de amostra 19/20',
    aplica: (_id, r) => r.minimo === 20 && r.dominio !== 'pesquisa',
    excecoes: {
      T10: 'percentis na janela de 12 semanas (B3-1): com a base de escala 0,5 nenhum fornecedor chega a 20 bloqueios na janela, então não há nó ok para varrer; a fronteira 19/20 e o corte do dia 84/85 são provados em bloqueios.test.ts',
      E1: 'nível de projeto: o mock não publica n >= 20 por tipo de projeto (decisão Q4), então não há nó ok para varrer; coberto em businessmap.test.ts',
      E9: 'nível de projeto: o mock não publica 20 projetos concluídos na janela de 12 semanas, então não há nó ok para varrer; a fronteira 19/20 da referência P85 é provada em e9.test.ts',
      EI_FL3:
        'nível de projeto: o mock não publica n >= 20 por tipo de projeto (decisão Q4), então não há nó ok para varrer',
    },
  },
  p5: {
    nome: 'embaralhar a entrada não muda a saída nem a ordem',
    aplica: () => true,
    excecoes: {},
  },
  p6: {
    nome: 'nenhuma chave por pessoa',
    aplica: () => true,
    excecoes: {},
  },
  p7: {
    nome: 'pesquisa: mínimos, anonimato por subtração e ordem das áreas',
    aplica: (_id, r) => r.dominio === 'pesquisa',
    excecoes: {},
  },
}
const idsDe = (p: Propriedade): MetricaId[] =>
  METRICA_IDS.filter((id) => p.aplica(id, REGRAS_METRICA[id]) && !(id in p.excecoes))
const marcar = (chave: string, id: MetricaId) => (executados[chave] ??= new Set()).add(id)

// ---------------------------------------------------------------------------------------------
// Utilitários
// ---------------------------------------------------------------------------------------------
/** PRNG pequeno e determinístico a partir da semente do fast-check. */
function prng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function embaralhar<T>(xs: readonly T[], seed: number): T[] {
  const r = prng(seed)
  const a = [...xs]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1))
    ;[a[i], a[j]] = [a[j] as T, a[i] as T]
  }
  return a
}

function semCards(bm: BaseBM, ids: ReadonlySet<string>): BaseBM {
  return {
    ...bm,
    cards: bm.cards.filter((c) => !ids.has(c.card_id)),
    transicoes: bm.transicoes.filter((t) => !ids.has(t.card_id)),
    bloqueios: bm.bloqueios.filter((b) => !ids.has(b.card_id)),
    fichas: bm.fichas.filter((f) => !ids.has(f.card_id)),
  }
}
function semChamados(ac: BaseAC, ids: ReadonlySet<string>): BaseAC {
  return {
    ...ac,
    chamados: ac.chamados.filter((c) => !ids.has(c.chamado_id)),
    etapas: ac.etapas.filter((e) => !ids.has(e.chamado_id)),
  }
}
const GRAN_BM = { story: 'story', frente: 'frente', projeto: 'projeto' } as const

/** Itens removíveis de uma métrica (cards da sua granularidade ou chamados), por id. */
function itensDa(r: RegraMetrica): string[] {
  if (r.dominio === 'acelerato') return base.ac.chamados.map((c) => c.chamado_id)
  const g = GRAN_BM[r.granularidade as keyof typeof GRAN_BM]
  return base.bm.cards.filter((c) => c.granularidade === g).map((c) => c.card_id)
}
function semItens(r: RegraMetrica, ids: ReadonlySet<string>): ContextosMetricas {
  return r.dominio === 'acelerato'
    ? ctxDe(base.bm, semChamados(base.ac, ids))
    : ctxDe(semCards(base.bm, ids), base.ac)
}

// ---------------------------------------------------------------------------------------------
// Propriedade 1: arquivar um card ENTREGUE não muda o resultado
// ---------------------------------------------------------------------------------------------
describe(`P1: ${P.p1.nome}`, () => {
  const entregues = CTX.bm.idx.marcos.filter(
    (m) =>
      m.entrega !== null &&
      m.entrega + DIA <= hojeMs &&
      m.card.arquivado_em === null &&
      m.card.motivo_descarte === null &&
      m.card.excluido_em === null,
  )
  it('há cards entregues para arquivar na base do teste', () => {
    expect(entregues.length).toBeGreaterThan(50)
  })
  it.each(idsDe(P.p1))('%s', (id) => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 1_000_000 }), (seed) => {
        const r = prng(seed)
        const alvo = new Map<string, number>()
        for (const m of entregues)
          if (r() < 0.5 && m.entrega !== null) alvo.set(m.card.card_id, m.entrega + DIA)
        const arquivada: BaseBM = {
          ...base.bm,
          cards: base.bm.cards.map((c) => {
            const t = alvo.get(c.card_id)
            return t === undefined ? c : { ...c, arquivado_em: t }
          }),
        }
        expect(plano(calc(id, ctxDe(arquivada, base.ac)))).toEqual(plano(calc(id, CTX)))
      }),
      { numRuns: 3, seed: 20261009 },
    )
    marcar('p1', id)
  })
})

// ---------------------------------------------------------------------------------------------
// Propriedade 2: classe isolada = classe no conjunto
// ---------------------------------------------------------------------------------------------
interface Classificador {
  dominio: 'businessmap' | 'acelerato'
  /** Granularidade dos itens classificados (BM) ou 'chamado'. */
  gran: 'story' | 'projeto' | 'chamado'
  de: (item: never) => string | null
  /** Campos do nó do resultado que carregam o nome da classe. */
  rotulos: readonly string[]
}
const CLASSIFICADORES: Partial<Record<ChaveSegmentacao, Classificador>> = {
  tipo: {
    dominio: 'businessmap',
    gran: 'story',
    de: (c: { tipo: string }) => c.tipo,
    rotulos: ['tipo', 'rotulo'],
  },
  'classe-servico': {
    dominio: 'businessmap',
    gran: 'story',
    de: (c: { classe_servico: string }) => c.classe_servico,
    rotulos: ['classe', 'rotulo'],
  },
  'tipo-projeto': {
    dominio: 'businessmap',
    gran: 'projeto',
    de: (c: { tipo: string }) => c.tipo,
    rotulos: ['rotulo', 'tipo'],
  },
  sistema: {
    dominio: 'businessmap',
    gran: 'story',
    de: (c: { sistema: string }) => c.sistema,
    rotulos: ['nome'],
  },
  'fase-deteccao': {
    dominio: 'businessmap',
    gran: 'story',
    de: (c: { fase_deteccao: string | null }) => c.fase_deteccao,
    rotulos: ['fase'],
  },
  'responsabilidade-atraso': {
    dominio: 'businessmap',
    gran: 'story',
    de: (c: { responsabilidade_atraso: string | null }) => c.responsabilidade_atraso,
    rotulos: ['responsabilidade'],
  },
  prioridade: {
    dominio: 'acelerato',
    gran: 'chamado',
    de: (c: { prioridade: string }) => c.prioridade,
    rotulos: ['prioridade', 'rotulo'],
  },
  'motivo-escalacao': {
    dominio: 'acelerato',
    gran: 'chamado',
    de: (c: { motivo_escalacao: string | null }) => c.motivo_escalacao,
    rotulos: ['motivo'],
  },
  'motivo-encerramento': {
    dominio: 'acelerato',
    gran: 'chamado',
    de: (c: { motivo_encerramento: string | null }) => c.motivo_encerramento,
    rotulos: ['motivo'],
  },
}

/** Subárvores mais externas cujo campo-rótulo é a classe pedida. */
function nosDaClasse(no: unknown, classe: string, rotulos: readonly string[], out: unknown[] = []) {
  if (Array.isArray(no)) {
    for (const x of no) nosDaClasse(x, classe, rotulos, out)
  } else if (no !== null && typeof no === 'object') {
    const o = no as Record<string, unknown>
    if (rotulos.some((k) => o[k] === classe)) out.push(plano(o))
    else for (const v of Object.values(o)) nosDaClasse(v, classe, rotulos, out)
  }
  return out
}

describe(`P2: ${P.p2.nome}`, () => {
  it.each(idsDe(P.p2))('%s', (id) => {
    const regra = REGRAS_METRICA[id]
    const chave = regra.segmentacao[0]
    const cls = chave === undefined ? undefined : CLASSIFICADORES[chave]
    expect(
      cls,
      `${id}: classificador da chave ${chave} não implementado (liste a exceção)`,
    ).toBeDefined()
    if (!cls) return
    const completo = calc(id, CTX)
    const classes = new Set<string>()
    if (cls.dominio === 'acelerato')
      for (const c of base.ac.chamados) {
        const k = cls.de(c as never)
        if (k !== null) classes.add(k)
      }
    else
      for (const c of base.bm.cards) {
        if (c.granularidade !== cls.gran) continue
        const k = cls.de(c as never)
        if (k !== null) classes.add(k)
      }
    const candidatas = [...classes]
      .sort()
      .filter((x) => nosDaClasse(completo, x, cls.rotulos).length > 0)
    expect(candidatas.length, `${id}: nenhuma classe aparece no resultado`).toBeGreaterThan(0)
    fc.assert(
      fc.property(fc.nat({ max: candidatas.length - 1 }), (i) => {
        const x = candidatas[i] as string
        const ids = new Set<string>()
        if (cls.dominio === 'acelerato') {
          for (const c of base.ac.chamados) if (cls.de(c as never) !== x) ids.add(c.chamado_id)
        } else {
          for (const c of base.bm.cards)
            if (c.granularidade === cls.gran && cls.de(c as never) !== x) ids.add(c.card_id)
        }
        const isolado =
          cls.dominio === 'acelerato'
            ? ctxDe(base.bm, semChamados(base.ac, ids))
            : ctxDe(semCards(base.bm, ids), base.ac)
        const a = nosDaClasse(calc(id, isolado), x, cls.rotulos)
        const b = nosDaClasse(completo, x, cls.rotulos)
        expect(a, `${id} classe ${x}`).toEqual(b)
      }),
      { numRuns: 3, seed: 20261009 },
    )
    marcar('p2', id)
  })
})

// ---------------------------------------------------------------------------------------------
// Propriedade 3: BusinessMap e Acelerato nunca se misturam
// ---------------------------------------------------------------------------------------------
describe(`P3: ${P.p3.nome}`, () => {
  const outraBase = gerarBaseMock({ escala: 0.3, semente: 7 })
  const variantes = {
    'BM/AC vazios': ctxDe(BM_VAZIA, AC_VAZIA),
    'outra semente': ctxDe(outraBase.bm, outraBase.ac),
  }
  it.each(idsDe(P.p3).filter((id) => id !== 'VISAO_GERAL'))('%s', (id) => {
    const eAC = ehAC(id)
    const ref = plano(calc(id, CTX))
    for (const [nome, v] of Object.entries(variantes)) {
      // Troca só a base do OUTRO domínio.
      // A pesquisa é a terceira fonte: troca-se BM e AC juntos e a PV1 não muda.
      const ctx: ContextosMetricas =
        fonteDaMetrica(id) === 'pesquisa'
          ? { bm: v.bm, ac: v.ac, ext: EXT, pesq: ctxPesq(PESQ) }
          : eAC
            ? { bm: v.bm, ac: CTX.ac, ext: EXT, pesq: ctxPesq(PESQ) }
            : { bm: CTX.bm, ac: v.ac, ext: EXT, pesq: ctxPesq(PESQ) }
      expect(plano(calc(id, ctx)), `${id} com ${nome}`).toEqual(ref)
    }
    // E nenhuma outra métrica lê a pesquisa.
    if (fonteDaMetrica(id) !== 'pesquisa') {
      const outra = { ...CTX, pesq: ctxPesq(gerarPesquisaMock({ ...base.config, semente: 7 })) }
      expect(plano(calc(id, outra)), `${id} com outra pesquisa`).toEqual(ref)
      expect(plano(calc(id, { bm: CTX.bm, ac: CTX.ac, ext: EXT })), `${id} sem pesquisa`).toEqual(
        ref,
      )
    }
    marcar('p3', id)
  })
  it('VISAO_GERAL: cada bloco é idêntico ao da base do seu domínio', () => {
    const niveis = (ctx: ContextosMetricas, fonte: string) =>
      plano(
        (calc('VISAO_GERAL', ctx) as { niveis: { fonte: string }[] }).niveis.filter(
          (n) => n.fonte === fonte,
        ),
      )
    for (const v of Object.values(variantes)) {
      expect(niveis({ bm: CTX.bm, ac: v.ac }, 'BusinessMap')).toEqual(niveis(CTX, 'BusinessMap'))
      expect(niveis({ bm: v.bm, ac: CTX.ac }, 'Acelerato')).toEqual(niveis(CTX, 'Acelerato'))
    }
    marcar('p3', 'VISAO_GERAL')
  })
})

// ---------------------------------------------------------------------------------------------
// Propriedade 4: fronteira de amostra (n = 19 não publica; n = 20 publica)
// ---------------------------------------------------------------------------------------------
interface No {
  caminho: string
  n: number
  status: string
  noBruto: Record<string, unknown>
}
const CHAVES_ID = [
  'tipo',
  'classe',
  'prioridade',
  'id',
  'nome',
  'motivo',
  'chave',
  'rotulo',
  'mes',
  'nivel',
  'fase',
  'cardId',
  'projetoId',
  'coluna',
  'origem',
  'responsabilidade',
]
function nosDeEstatistica(no: unknown, caminho: string, out: No[] = []): No[] {
  if (Array.isArray(no)) {
    no.forEach((x, i) => {
      const o = x as Record<string, unknown> | null
      const k =
        o !== null && typeof o === 'object'
          ? CHAVES_ID.find((c) => typeof o[c] === 'string')
          : undefined
      nosDeEstatistica(
        x,
        `${caminho}[${k ? `${k}=${String((o as Record<string, unknown>)[k])}` : i}]`,
        out,
      )
    })
  } else if (no !== null && typeof no === 'object') {
    const o = no as Record<string, unknown>
    const baseN = (o.base as { n?: unknown } | undefined)?.n
    if ((o.status === 'ok' || o.status === 'insuficiente') && typeof o.n === 'number')
      out.push({ caminho, n: o.n, status: o.status, noBruto: o })
    // T3: o status do resultado vale para a base inteira.
    else if ((o.status === 'ok' || o.status === 'insuficiente') && typeof baseN === 'number')
      out.push({ caminho, n: baseN, status: o.status, noBruto: {} })
    // S5/S6: pct de cada motivo é nulo quando o total do conjunto tem menos de 20 itens.
    // (O19 também tem `motivos`, mas cada motivo carrega `pctDoTotal` e `duracao` próprios, nós já varridos abaixo.)
    if (
      Array.isArray(o.motivos) &&
      typeof baseN === 'number' &&
      (o.motivos as object[]).every((m) => 'pct' in m)
    )
      out.push({
        caminho: `${caminho}.motivos`,
        n: baseN,
        status: (o.motivos as { pct: unknown }[]).some((m) => typeof m.pct === 'number')
          ? 'ok'
          : 'insuficiente',
        noBruto: {},
      })
    for (const [k, v] of Object.entries(o)) nosDeEstatistica(v, `${caminho}.${k}`, out)
  }
  return out
}

const fronteirasExatas = new Set<MetricaId>()

describe(`P4: ${P.p4.nome}`, () => {
  it.each(idsDe(P.p4))(
    '%s',
    (id) => {
      const regra = REGRAS_METRICA[id]
      const completo = plano(calc(id, CTX))
      const nos = nosDeEstatistica(completo, id)
      // Todo nó, em qualquer n, obedece à regra: ok só com n >= 20 e insuficiente nunca carrega valor.
      for (const x of nos) {
        expect(x.status === 'ok', `${x.caminho} n=${x.n}`).toBe(x.n >= MINIMO_AMOSTRA)
        if (x.status === 'insuficiente') {
          expect(x.noBruto).not.toHaveProperty('valor')
          expect(x.noBruto).not.toHaveProperty('pct')
        }
      }
      const alvo = nos.filter((x) => x.status === 'ok').sort((a, b) => b.n - a.n)[0]
      expect(
        alvo,
        `${id}: sem nó publicado (n >= 20) na base do teste; liste a exceção`,
      ).toBeDefined()
      if (!alvo) return
      const lerNo = (ctx: ContextosMetricas): No | undefined =>
        nosDeEstatistica(plano(calc(id, ctx)), id).find((x) => x.caminho === alvo.caminho)
      const itens = itensDa(regra)
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 1_000_000 }), (seed) => {
          const ordem = embaralhar(itens, seed)
          const nDe = (k: number) => lerNo(semItens(regra, new Set(ordem.slice(0, k))))?.n ?? 0
          // Menor k com n < 20 (n nunca cresce ao remover itens).
          let lo = 0
          let hi = ordem.length
          expect(nDe(hi)).toBeLessThan(MINIMO_AMOSTRA)
          while (hi - lo > 1) {
            const mid = (lo + hi) >> 1
            if (nDe(mid) < MINIMO_AMOSTRA) hi = mid
            else lo = mid
          }
          const acima = lerNo(semItens(regra, new Set(ordem.slice(0, lo))))
          const abaixo = lerNo(semItens(regra, new Set(ordem.slice(0, hi))))
          expect(acima?.status, `${id} n=${acima?.n}`).toBe('ok')
          expect(acima?.n).toBeGreaterThanOrEqual(MINIMO_AMOSTRA)
          expect(abaixo?.n ?? 0).toBeLessThan(MINIMO_AMOSTRA)
          if (abaixo) {
            expect(abaixo.status).toBe('insuficiente')
            expect(abaixo.noBruto).not.toHaveProperty('valor')
            expect(abaixo.noBruto).not.toHaveProperty('pct')
          }
          // Fronteira exata quando remover um item tira exatamente 1 da contagem (20 publica, 19 não).
          // Se um item vale mais de 1 (ex.: T4 conta chegada e vazão), 19 não é alcançável por remoção.
          if ((acima?.n ?? 0) === MINIMO_AMOSTRA && (abaixo?.n ?? 0) === MINIMO_AMOSTRA - 1)
            fronteirasExatas.add(id)
        }),
        { numRuns: 2, seed: 20261009 },
      )
      marcar('p4', id)
    },
    120_000,
  )
})

// ---------------------------------------------------------------------------------------------
// Propriedade 5: embaralhar a entrada não muda a saída nem a ordem
// ---------------------------------------------------------------------------------------------
describe(`P5: ${P.p5.nome}`, () => {
  it.each(idsDe(P.p5))('%s', (id) => {
    const ref = plano(calc(id, CTX))
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 1_000_000 }), (seed) => {
        const bm: BaseBM = {
          ...base.bm,
          cards: embaralhar(base.bm.cards, seed),
          transicoes: embaralhar(base.bm.transicoes, seed + 1),
          bloqueios: embaralhar(base.bm.bloqueios, seed + 2),
          fichas: embaralhar(base.bm.fichas, seed + 3),
        }
        const ac: BaseAC = {
          ...base.ac,
          chamados: embaralhar(base.ac.chamados, seed + 4),
          etapas: embaralhar(base.ac.etapas, seed + 5),
        }
        const pesq: BasePesquisa = {
          ...PESQ,
          areas: embaralhar(PESQ.areas, seed + 6),
          versoes: embaralhar(PESQ.versoes, seed + 7),
          cargas: embaralhar(PESQ.cargas, seed + 8).map((c, i) => ({
            ...c,
            linhas: embaralhar(c.linhas, seed + 9 + i),
          })),
        }
        expect(plano(calc(id, ctxDe(bm, ac, pesq)))).toEqual(ref)
      }),
      { numRuns: 2, seed: 20261009 },
    )
    marcar('p5', id)
  })
})

// ---------------------------------------------------------------------------------------------
// Propriedade 6: nenhuma chave nem valor por pessoa
// ---------------------------------------------------------------------------------------------
const CHAVES_PESSOA = /pessoa|responsavel|responsaveis|assignee|usuario|autor|criador/i
const pessoas = new Set<string>()
for (const c of base.bm.cards) for (const r of c.responsaveis) pessoas.add(r)
for (const t of base.bm.transicoes) pessoas.add(t.usuario)

function varrer(no: unknown, caminho: string, falhas: string[]): void {
  if (typeof no === 'string') {
    if (pessoas.has(no)) falhas.push(`${caminho}: valor é nome de pessoa`)
    return
  }
  if (Array.isArray(no)) return no.forEach((x, i) => varrer(x, `${caminho}[${i}]`, falhas))
  if (no === null || typeof no !== 'object') return
  for (const [k, v] of Object.entries(no)) {
    if (CHAVES_PESSOA.test(k)) falhas.push(`${caminho}.${k}: chave por pessoa`)
    // Equipe só aparece como filtro aplicado (recortes/filtros), nunca como eixo de comparação.
    // (`equipe` e `time` dentro de resultados são relógios/visões do time, não times comparados.)
    if (
      /^(porEquipe|porTime|porTimes|equipes|rankingEquipes?)$/.test(k) &&
      !/(filtros|recortes)/.test(caminho)
    )
      falhas.push(`${caminho}.${k}: equipe como eixo fora de filtro aplicado`)
    varrer(v, `${caminho}.${k}`, falhas)
  }
}

describe(`P6: ${P.p6.nome}`, () => {
  it('a base do teste tem pessoas para procurar', () => {
    expect(pessoas.size).toBeGreaterThan(3)
  })
  it.each(idsDe(P.p6))('%s', (id) => {
    const falhas: string[] = []
    varrer(plano(calc(id, CTX)), id, falhas)
    expect(falhas.slice(0, 4)).toEqual([])
    marcar('p6', id)
  })
})

// ---------------------------------------------------------------------------------------------
// Propriedade 7 (pesquisa): mínimos, anonimato por subtração e ordem das áreas
// ---------------------------------------------------------------------------------------------
const NOMES_AREAS = ['Zeta', 'Ágata', 'Beta', 'Delta', 'Épsilon', 'Alfa', 'Omega', 'Íris']

/** Base de pesquisa aleatória: n ciclos, cada um com o respondentes por área (0 a 12) e faixas sorteadas. */
function pesquisaDe(ciclos: number[][], seed: number): BasePesquisa {
  const r = prng(seed)
  const faixas = (n: number): number[] => {
    const f = [0, 0, 0, 0, 0]
    for (let i = 0; i < n; i++) {
      const k = Math.floor(r() * 5)
      f[k] = (f[k] as number) + 1
    }
    return f
  }
  return {
    areas: NOMES_AREAS.map((rotulo, i) => ({ codigo: `a${i}`, rotulo })),
    versoes: [
      {
        id: 'v',
        vigenteDesde: '2025-01-01',
        perguntas: [
          { codigo: 'p1', ordem: 1, texto: 't1' },
          { codigo: 'p2', ordem: 2, texto: 't2' },
        ],
      },
    ],
    criterios: [],
    cargas: ciclos.map((tamanhos, c) => {
      const ano = 2025 + Math.floor(c / 4)
      const tri = (c % 4) + 1
      return {
        cargaId: c + 1,
        trimestre: `${ano}-T${tri}`,
        versaoId: 'v',
        recebidaEm: `${ano}-${String(tri * 3).padStart(2, '0')}-28`,
        oQueMudou: null,
        linhas: tamanhos.flatMap((n, i) =>
          ['p1', 'p2'].map((pergunta) => {
            const [f1, f2, f3, f4, f5] = faixas(n) as [number, number, number, number, number]
            return {
              trimestre: `${ano}-T${tri}`,
              area: `a${i}`,
              pergunta,
              f1,
              f2,
              f3,
              f4,
              f5,
              convidados: n + 5,
            }
          }),
        ),
      }
    }),
  }
}

/** Todo nó com status 'ok' tem n >= 20; 'insuficiente' nunca carrega percentual; base-insuficiente nunca carrega faixas. */
function conferirPesquisa(no: unknown, caminho: string, falhas: string[]): void {
  if (Array.isArray(no))
    return no.forEach((x, i) => conferirPesquisa(x, `${caminho}[${i}]`, falhas))
  if (no === null || typeof no !== 'object') return
  const o = no as Record<string, unknown>
  if (o.status === 'ok' && typeof o.n === 'number' && o.n < MINIMO_AMOSTRA)
    falhas.push(`${caminho}: percentual com n=${o.n}`)
  if (o.status === 'insuficiente' && ('pct' in o || 'valor' in o))
    falhas.push(`${caminho}: insuficiente com valor`)
  if (o.status === 'base-insuficiente' && ('perguntas' in o || 'concordam' in o))
    falhas.push(`${caminho}: base insuficiente com faixas`)
  for (const [k, v] of Object.entries(o)) conferirPesquisa(v, `${caminho}.${k}`, falhas)
}

describe(`P7: ${P.p7.nome}`, () => {
  const ciclosArb = fc.array(fc.array(fc.nat({ max: 12 }), { minLength: 1, maxLength: 8 }), {
    minLength: 1,
    maxLength: 6,
  })
  it.each(idsDe(P.p7))('%s', (id) => {
    fc.assert(
      fc.property(ciclosArb, fc.integer({ min: 1, max: 1_000_000 }), (ciclos, seed) => {
        const b = pesquisaDe(ciclos, seed)
        const hoje = b.cargas[b.cargas.length - 1]?.recebidaEm as string
        const r = calcularMetrica(
          id,
          {},
          {
            ...CTX,
            pesq: pesquisa.criarContextoPesquisa(b, hoje),
          },
        ) as ReturnType<typeof calcularMetrica<'PV1'>>
        // Todo resultado passa no contrato (mínimos, ordem das áreas e A10 estão no schema).
        expect(resultadoPV1.safeParse(r).success).toBe(true)
        // Nunca publica percentual com n < 20 nem faixas abaixo do mínimo.
        const falhas: string[] = []
        conferirPesquisa(r, id, falhas)
        expect(falhas).toEqual([])
        if (r.status !== 'ok') return
        expect(r.consolidado.status === 'publicado').toBe(r.consolidado.n >= 5)
        expect(r.tendencia.length).toBeLessThanOrEqual(4)
        expect(r.tendencia.map((t) => t.trimestre)).toEqual(
          [...r.tendencia.map((t) => t.trimestre)].sort(),
        )
        if (r.ciclo < 2)
          expect(r.porArea).toEqual({ status: 'nao-publicado', motivo: 'primeiro-ciclo' })
        if (r.porArea.status !== 'publicado') return
        // Por área só existe com consolidado publicado e com pelo menos 2 grupos.
        expect(r.consolidado.status).toBe('publicado')
        const grupos = r.porArea.areas.map((a) => a.bloco.n)
        expect(grupos.length).toBeGreaterThanOrEqual(2)
        // Nenhum grupo de 1 ou 2, e os grupos particionam o consolidado.
        expect(grupos.every((n) => n >= 3)).toBe(true)
        expect(grupos.reduce((s, n) => s + n, 0)).toBe(r.consolidado.n)
        // Subtração: o consolidado menos QUALQUER subconjunto de grupos publicados nunca dá 1 ou 2.
        for (let m = 0; m < 1 << grupos.length; m++) {
          const parte = grupos.reduce((s, n, i) => s + (m & (1 << i) ? n : 0), 0)
          const resto = r.consolidado.n - parte
          expect(resto === 0 || resto >= 3, `resto ${resto}`).toBe(true)
        }
        // Áreas em ordem alfabética, com "Outras áreas" uma só vez e por último.
        const nomes = r.porArea.areas.filter((a) => !a.outras).map((a) => a.rotulo)
        expect(nomes).toEqual([...nomes].sort((x, y) => x.localeCompare(y, 'pt-BR')))
        expect(r.porArea.areas.filter((a) => a.outras).length).toBeLessThanOrEqual(1)
        const iOutras = r.porArea.areas.findIndex((a) => a.outras)
        if (iOutras !== -1) expect(iOutras).toBe(r.porArea.areas.length - 1)
      }),
      { numRuns: 300, seed: 20261009 },
    )
    marcar('p7', id)
  })
})

describe('P7b: reenvios nunca expõem a carga substituída (decisão I-2)', () => {
  it('para até dois reenvios, nenhuma data de referência muda o resultado nem mostra uma carga anterior', () => {
    const ciclosArb = fc.array(fc.array(fc.nat({ max: 12 }), { minLength: 1, maxLength: 8 }), {
      minLength: 1,
      maxLength: 5,
    })
    fc.assert(
      fc.property(
        ciclosArb,
        fc.integer({ min: 1, max: 1_000_000 }),
        fc.array(fc.integer({ min: 1, max: 2 }), { minLength: 1, maxLength: 2 }),
        (ciclos, seed, deltas) => {
          const b = pesquisaDe(ciclos, seed)
          const ultima = b.cargas[b.cargas.length - 1] as BasePesquisa['cargas'][number]
          // Reenvios do último trimestre: mais 1 ou 2 respondentes, recebidos depois (mesmo mês, dias seguintes).
          const reenvios = deltas.map((d, i) => ({
            ...ultima,
            cargaId: ultima.cargaId + i + 1,
            recebidaEm: `${ultima.recebidaEm.slice(0, 8)}${29 + i}`,
            linhas: ultima.linhas.map((l) => ({
              ...l,
              f1: l.f1 + d,
              convidados: l.convidados + d,
            })),
          }))
          const base: BasePesquisa = { ...b, cargas: [...b.cargas, ...reenvios] }
          const final = reenvios[reenvios.length - 1] as (typeof reenvios)[number]
          const em = (hoje: string) =>
            calcularMetrica('PV1', {}, { ...CTX, pesq: pesquisa.criarContextoPesquisa(base, hoje) })
          const referencia = em(final.recebidaEm)
          // Do primeiro recebimento do trimestre em diante, todas as datas dão o mesmo painel (o da carga final).
          for (const hoje of [
            ultima.recebidaEm,
            ...reenvios.map((r) => r.recebidaEm),
            '2099-12-31',
          ])
            expect(em(hoje), hoje).toEqual(referencia)
        },
      ),
      { numRuns: 200, seed: 20261012 },
    )
  })
})

// ---------------------------------------------------------------------------------------------
// Meta-testes (bloqueiam o `pnpm run pronto`)
// ---------------------------------------------------------------------------------------------
describe('meta: toda métrica tem teste, sem exceção órfã', () => {
  it('toda chave de METRICA_IDS está na matriz e a matriz não tem sobra', () => {
    expect(Object.keys(REGRAS_METRICA).sort()).toEqual([...METRICA_IDS].sort())
  })

  it("status é 'pendente-usuario' se e somente se alguma célula for pendente", () => {
    for (const id of METRICA_IDS) {
      const r: RegraMetrica = REGRAS_METRICA[id]
      const algumaPendente =
        Object.entries(r).some(([k, v]) => k !== 'status' && v === 'pendente-usuario') ||
        (r.pendencias?.length ?? 0) > 0
      expect(r.status === 'pendente-usuario', id).toBe(algumaPendente)
    }
  })

  it('classe e ordem: nada de chave proibida na segmentação e T7 segue a decisão P2', () => {
    for (const id of METRICA_IDS)
      for (const k of REGRAS_METRICA[id].segmentacao)
        expect(k, id).not.toMatch(/pessoa|responsavel|equipe/)
    expect(REGRAS_METRICA.T7.ordem).toBe('temporal')
  })

  it.each(Object.entries(P))(
    '%s: exceções só de ids existentes e que de fato se aplicam',
    (_k, p) => {
      for (const id of Object.keys(p.excecoes)) {
        expect(METRICA_IDS as readonly string[], `exceção órfã: ${id}`).toContain(id)
        const r = REGRAS_METRICA[id as MetricaId]
        // Exceção para métrica a que a propriedade nem se aplica é desnecessária (esconde regra).
        if (!p.aplica(id as MetricaId, r) && p.excecoes[id as MetricaId] !== COMPOSICAO)
          expect.fail(`exceção desnecessária em ${p.nome}: ${id}`)
      }
    },
  )

  it('a fronteira exata 20/19 foi alcançada na maioria das métricas', () => {
    // Nas demais (ex.: T4, que conta chegada e vazão), um item vale mais de 1 e 19 não é alcançável.
    expect(fronteirasExatas.size).toBeGreaterThanOrEqual(20)
  })

  it('toda métrica foi exercitada por cada propriedade ou está na lista de exceções', () => {
    const sem: string[] = []
    for (const [chave, p] of Object.entries(P))
      for (const id of METRICA_IDS) {
        if (id in p.excecoes) continue
        if (!p.aplica(id, REGRAS_METRICA[id])) continue
        if (!executados[chave]?.has(id)) sem.push(`${chave}:${id}`)
      }
    expect(sem, 'métrica sem teste de propriedade e sem exceção nominal').toEqual([])
  })
})
