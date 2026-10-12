/**
 * Testes de propriedade parametrizados por REGRAS_METRICA (M-005, docs/architecture/regras-metricas.md, seção 3).
 * Cada propriedade itera a matriz e declara as exceções NOMINALMENTE, com o motivo. Os meta-testes
 * do fim do arquivo bloqueiam: métrica sem teste, exceção órfã ou desnecessária, status incoerente.
 */
import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { METRICA_IDS, MINIMO_AMOSTRA, type MetricaId } from '@metricas-dspd/contratos'
import { METRICAS_SUSTENTACAO } from '@metricas-dspd/contratos'
import { gerarBaseMock, gerarExtensoesMock, type BaseMock } from '@metricas-dspd/mock'
import { calcularMetrica, type ContextosMetricas } from './calcular'
import { acelerato, businessmap } from '.'
import { CALENDARIO_PADRAO } from './core/calendario'
import { REGRAS_METRICA, type ChaveSegmentacao, type RegraMetrica } from './core/regras'
import type { BaseBM } from './businessmap/modelo'
import type { BaseAC } from './acelerato/modelo'

const DIA = 86_400_000
const base: BaseMock = gerarBaseMock({ escala: 0.5 })
const HOJE = base.config.hoje
const hojeMs = businessmap.criarContextoBM(base.bm, HOJE, CALENDARIO_PADRAO).hoje

const EXT = gerarExtensoesMock(base)
const ctxDe = (bm: BaseBM, ac: BaseAC): ContextosMetricas => ({
  ext: EXT,
  bm: businessmap.criarContextoBM(bm, HOJE, CALENDARIO_PADRAO),
  ac: acelerato.criarContextoAC(ac, HOJE, CALENDARIO_PADRAO),
})
const CTX = ctxDe(base.bm, base.ac)

const ehAC = (id: MetricaId) => METRICAS_SUSTENTACAO.includes(id)
const filtrosDe = (id: MetricaId, tipo: '12s' | '6m' | '12m' = '12m') =>
  id === 'VISAO_GERAL'
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
const P1 =
  'P1 pendente-usuario: arquivado sem desfecho ainda não tem regra confirmada (propriedade 1 só vale para entregue)'
const COMPOSICAO =
  'composição: não calcula, só reexpõe blocos (coberta pela propriedade 3 por bloco)'

interface Propriedade {
  nome: string
  aplica: (id: MetricaId, r: RegraMetrica) => boolean
  excecoes: Excecoes
}
const executados: Record<string, Set<MetricaId>> = {}

const P: Record<'p1' | 'p2' | 'p3' | 'p4' | 'p5' | 'p6', Propriedade> = {
  p1: {
    nome: 'arquivar entregue não muda o resultado',
    aplica: (_id, r) => r.dominio === 'businessmap' && r.incluiArquivados !== 'nao-se-aplica',
    excecoes: {
      O1: P1,
      O2: P1,
      BLOQUEADOS: P1,
      O10: P1,
      T4: P1,
      T7: P1,
      T9: P1,
    },
  },
  p2: {
    nome: 'classe isolada = classe no conjunto',
    aplica: (id, r) => id !== 'VISAO_GERAL' && r.segmentacao.length > 0,
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
      O17: 'primeira chave é causa raiz, que vive na extensão (mapa por chamado), sem classificador de item no modelo do núcleo',
      E4: 'série trimestral de contagem de projetos; o tipo de projeto não é rótulo de nó no resultado',
      S8: 'a prioridade atua só como filtro; o resultado é série mensal sem nó por prioridade',
      S9: 'a chave é o motivo da pendência, que vive na etapa (classificador por motivo não implementado)',
      S11: 'os grupos P1, P2 e contorno se sobrepõem por definição: o nó do grupo depende do conjunto',
      PV1: 'pesquisa agregada (pergunta e área são nós de contagem por faixa, sem item classificável); fronteiras 4/5, 2/3 e 19/20 serão cobertas por propriedades próprias no B2 (pesquisa/anonimato)',
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
    aplica: (_id, r) => r.minimo === 20,
    excecoes: {
      PV1: 'o mínimo de publicação é 5 (consolidado) e 3 (área), com o 20 só no percentual; sem nó ok de amostra de itens: coberto nos testes do B2 (pesquisa/anonimato)',
      E1: 'nível de projeto: o mock não publica n >= 20 por tipo de projeto (decisão Q4), então não há nó ok para varrer; coberto em businessmap.test.ts',
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
      const ctx: ContextosMetricas = eAC
        ? { bm: v.bm, ac: CTX.ac, ext: EXT }
        : { bm: CTX.bm, ac: v.ac, ext: EXT }
      expect(plano(calc(id, ctx)), `${id} com ${nome}`).toEqual(ref)
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
    if (Array.isArray(o.motivos) && typeof baseN === 'number')
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
        expect(plano(calc(id, ctxDe(bm, ac)))).toEqual(ref)
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
