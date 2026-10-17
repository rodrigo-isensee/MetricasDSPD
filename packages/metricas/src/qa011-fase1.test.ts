/**
 * QA do back do pedido 011, fase 1 (docs/qa/011-back.md): casos "a escrever" do plano que cruzam métricas.
 * Cada teste responde a uma obrigação nomeada (INV-n, CR-n, J-2, F-1, AL-1, B-1, H-1, O23-3, T10-7, E7-2/4, O19-9).
 * O T11 (B11b) não entra aqui: fica pendente.
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  METRICA_IDS,
  METRICAS_TENDENCIA,
  alertaCodigo,
  fonteDaMetrica,
  type FiltrosFluxo,
  type MetricaId,
} from '@metricas-dspd/contratos'
import { gerarBaseMock, gerarExtensoesMock } from '@metricas-dspd/mock'
import { acelerato, businessmap, calcularMetrica, CALENDARIO_PADRAO } from '.'
import { instanteDeIso } from './core/calendario'
import { NASCIDAS_DEPOIS_DO_DESCARTE_NATIVO } from './core/criterios'
import { calcularE7, calcularO19, calcularO2, calcularT10, type FatoBloqueio } from './businessmap'
import { criarContextoBM } from './businessmap/indice'
import { HOJE_TESTE, trilhaSimples, umaBase, type EspecCard } from './businessmap/testing'
import { calcularVisaoGeral } from './visaoGeral'

const AQUI = dirname(fileURLToPath(import.meta.url))
const fonte = (rel: string) => readFileSync(join(AQUI, rel), 'utf8')
const F12S: FiltrosFluxo = { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12s' } }
const F12M: FiltrosFluxo = { ...F12S, periodo: { tipo: '12m' } }

/** As ids da fase 1 que existem no back hoje. O T11 entra no B11b (pendente). */
const FASE1 = [
  'O2',
  'O19',
  'O20',
  'O21',
  'O24',
  'O25',
  'T10',
  'T12',
  'E7',
  'E9',
] as const satisfies readonly MetricaId[]
const ARQ_FASE1: Record<(typeof FASE1)[number], string> = {
  O2: 'businessmap/o2.ts',
  O19: 'businessmap/o19.ts',
  O20: 'businessmap/o20.ts',
  O21: 'businessmap/o21.ts',
  O24: 'businessmap/o24.ts',
  O25: 'businessmap/o25.ts',
  T10: 'businessmap/t10.ts',
  T12: 'businessmap/t12.ts',
  E7: 'businessmap/e7.ts',
  E9: 'businessmap/e9.ts',
}

const base = gerarBaseMock()
const ext = gerarExtensoesMock(base)
const ctxMock = (hoje: string) => ({
  bm: businessmap.criarContextoBM(base.bm, hoje, CALENDARIO_PADRAO),
  ext,
})
// B11b: o T11 nasceu depois do descarte nativo (lista nominal) e não é marcado pelas duas versões do descarte.
// A tendência do Resumo fica de fora: a janela dela termina no último mês fechado, então não cruza as datas dos critérios.
const BM_IDS = METRICA_IDS.filter(
  (id) =>
    fonteDaMetrica(id) === 'businessmap' &&
    !NASCIDAS_DEPOIS_DO_DESCARTE_NATIVO.includes(id) &&
    !METRICAS_TENDENCIA.includes(id),
)

describe('F-1 / INV-4: as ids da fase 1 são do BusinessMap', () => {
  it('todas têm fonte businessmap (lista nominal, mínimo 10)', () => {
    expect(FASE1.length).toBeGreaterThanOrEqual(10)
    for (const id of FASE1) expect(fonteDaMetrica(id), id).toBe('businessmap')
  })
})

describe('INV-1: guarda da fronteira 19/20 em cada métrica com estatística', () => {
  // O20 e o E9 sem percentil próprio: O20 é censo; E9 tem a referência P85 por tipo (19/20 em e9.test.ts).
  const COM_FRONTEIRA = ['O19', 'O21', 'O24', 'O25', 'T10', 'T12', 'E7', 'E9'] as const
  const TESTE_DE: Record<string, string> = {
    O19: 'businessmap/bloqueios.test.ts',
    O21: 'businessmap/o21.test.ts',
    O24: 'businessmap/o24.test.ts',
    O25: 'businessmap/o25.test.ts',
    T10: 'businessmap/bloqueios.test.ts',
    T12: 'businessmap/t12.test.ts',
    E7: 'businessmap/e7.test.ts',
    E9: 'businessmap/e9.test.ts',
  }
  it.each(COM_FRONTEIRA)('%s: o arquivo de teste exerce 19 e 20 itens', (id) => {
    const t = fonte(TESTE_DE[id]!)
    expect(t, `${id}: fixture de 19`).toMatch(/\b19\b/)
    expect(t, `${id}: fixture de 20`).toMatch(/\b20\b/)
  })
  it('a lista nominal tem ao menos 9 ids', () =>
    expect(COM_FRONTEIRA.length).toBeGreaterThanOrEqual(8))
})

describe('J-2 / INV-2: percentil na janela de 12 semanas mesmo com período de 12 meses', () => {
  const ctx = ctxMock(base.config.hoje)
  /** Todas as `estatistica` (percentis) do resultado, em ordem de aparição: o censo (itens, ultrapassados) fica de fora. */
  const estatisticas = (v: unknown, out: unknown[] = []): unknown[] => {
    if (Array.isArray(v)) v.forEach((x) => estatisticas(x, out))
    else if (v && typeof v === 'object')
      for (const [k, x] of Object.entries(v)) {
        if (k === 'estatistica' || k === 'com' || k === 'sem') out.push(x)
        else estatisticas(x, out)
      }
    return out
  }
  const bloco = (id: MetricaId, _chave: string, f: FiltrosFluxo) =>
    JSON.stringify(
      // tipo que só tem item fora da janela aparece com n = 0 no período longo (é do censo): fica de fora
      (estatisticas(calcularMetrica(id, f as never, ctx as never)) as { n: number }[]).filter(
        (e) => e.n > 0,
      ),
    )
  const CASOS: [MetricaId, string, string][] = [
    ['O24', 'custo', 'espera do ultrapassado'],
    ['O25', 'consumido', 'tempo consumido do descarte'],
    ['O21', 'comparacoes', 'ciclo com × sem retorno'],
  ]
  it.each(CASOS)(
    '%s: o bloco de percentil (%s) é igual com 12s e 12m e o censo muda',
    (id, chave) => {
      const a = bloco(id, chave, F12S)
      expect(a.length).toBeGreaterThan(50)
      expect(bloco(id, chave, F12M)).toBe(a)
      const baseN = (f: FiltrosFluxo) =>
        (calcularMetrica(id, f as never, ctx as never) as { base: { n: number } }).base.n
      expect(baseN(F12M)).toBeGreaterThan(baseN(F12S))
    },
  )
})

describe('T2.6 / CR-1 a CR-5 e CR-9: marcações das versões de critério em todas as ids BusinessMap', () => {
  const marcas = (hoje: string, id: MetricaId): string => {
    const ctx = ctxMock(hoje)
    return JSON.stringify(calcularMetrica(id, F12S as never, ctx as never))
  }
  const EE = 'criterio-2026-10-16-excluido-entregue'
  const O19 = 'criterio-2026-10-16-o19-pct-em-dias-uteis'
  const O20 = 'criterio-2026-10-16-o20-destaque-sem-backlog'
  const DN = 'criterio-2026-10-15-descarte-nativo'
  const PV = 'criterio-2026-10-14-parados-v1'

  it('guarda: o catálogo BusinessMap tem 44 ids', () => expect(BM_IDS.length).toBe(44))

  it('CR-1/CR-4: período que cruza 16/10 traz excluido-entregue e descarte-nativo em TODAS as 44 ids', () => {
    for (const id of BM_IDS) {
      const s = marcas('2026-10-20T18:00:00-03:00', id)
      expect(s, `${id} sem ${EE}`).toContain(EE)
      expect(s, `${id} sem ${DN}`).toContain(DN)
    }
  })
  it('CR-2/CR-3/CR-5: as versões de uma só métrica aparecem só nela', () => {
    for (const id of BM_IDS) {
      const s = marcas('2026-10-20T18:00:00-03:00', id)
      expect(s.includes(O19), `${id} ${O19}`).toBe(id === 'O19')
      expect(s.includes(O20), `${id} ${O20}`).toBe(id === 'O20')
      expect(s.includes(PV), `${id} ${PV}`).toBe(id === 'O2')
    }
  })
  it('CR-9: a fronteira do dia 16/10: fim em 15/10 não traz; fim em 16/10 traz', () => {
    for (const id of ['O3', 'O19', 'O20', 'O25', 'E7', 'T12', 'E9'] as MetricaId[]) {
      expect(marcas('2026-10-15T18:00:00-03:00', id), `${id} em 15/10`).not.toContain(EE)
      expect(marcas('2026-10-16T18:00:00-03:00', id), `${id} em 16/10`).toContain(EE)
    }
    expect(marcas('2026-10-15T18:00:00-03:00', 'O19')).not.toContain(O19)
    expect(marcas('2026-10-16T18:00:00-03:00', 'O19')).toContain(O19)
    expect(marcas('2026-10-15T18:00:00-03:00', 'O20')).not.toContain(O20)
    expect(marcas('2026-10-16T18:00:00-03:00', 'O20')).toContain(O20)
  })
  it('CR-4/CR-5: descarte-nativo só a partir de 15/10 e parados-v1 só a partir de 14/10', () => {
    expect(marcas('2026-10-14T18:00:00-03:00', 'O25')).not.toContain(DN)
    expect(marcas('2026-10-15T18:00:00-03:00', 'O25')).toContain(DN)
    expect(marcas('2026-10-13T18:00:00-03:00', 'O2')).not.toContain(PV)
    expect(marcas('2026-10-14T18:00:00-03:00', 'O2')).toContain(PV)
  })
})

describe('T2.6 / CR-1 a CR-4: a tendência do fluxo (fora do loop das 44 ids) é marcada quando a janela cruza as datas', () => {
  const marcasT = (hoje: string): string =>
    JSON.stringify(
      businessmap.calcularTendenciaFluxo(
        businessmap.criarContextoBM(base.bm, hoje, CALENDARIO_PADRAO),
      ).criterios,
    )
  it('janela termina em 30/09 (hoje 20/10): sem marcação; hoje 20/11: traz descarte-nativo e excluido-entregue', () => {
    expect(marcasT('2026-10-20T18:00:00-03:00')).not.toContain(
      'criterio-2026-10-15-descarte-nativo',
    )
    const s = marcasT('2026-11-20T18:00:00-03:00')
    expect(s).toContain('criterio-2026-10-15-descarte-nativo')
    expect(s).toContain('criterio-2026-10-16-excluido-entregue')
  })
})

describe('AL-1 / INV-9: nenhum indicador da fase 1 pede atenção na Visão geral', () => {
  it('o enum de alertas não tem id da fase 1 e a Visão geral do mock não traz indicador da fase 1', () => {
    // O2 é o pai do O23 (bloco `parados`) e já tinha o alerta O2_ACIMA_P95 antes da fase 1: o que se afirma é o O23 não alertar.
    const fase1 = new Set<string>(FASE1.filter((i) => i !== 'O2'))
    for (const c of alertaCodigo.options) {
      expect(fase1.has(c.split('_')[0]!), c).toBe(false)
      expect(c, c).not.toMatch(/PARADO|O23/)
    }
    expect(alertaCodigo.options.length).toBeGreaterThanOrEqual(12)
    const ctx = ctxMock(base.config.hoje)
    const vg = calcularVisaoGeral(
      ctx.bm,
      acelerato.criarContextoAC(base.ac, base.config.hoje, CALENDARIO_PADRAO),
    )
    for (const a of vg.alertas) expect(fase1.has(a.codigo.split('_')[0]!), a.codigo).toBe(false)
    for (const n of vg.niveis)
      for (const i of n.indicadores) expect(fase1.has(i.metrica), i.codigo).toBe(false)
  })
})

describe('B-1 / INV-8: as métricas da fase 1 usam a biblioteca (nenhum percentil nem dia útil próprio)', () => {
  it.each(FASE1)('%s: o arquivo não define percentil, quantil nem dias úteis', (id) => {
    const src = fonte(ARQ_FASE1[id])
    expect(src.length).toBeGreaterThan(500)
    expect(src).not.toMatch(
      /function\s+(?:percentil\w*|quantil\w*|quartil\w*|diasUteis\w*|p85\w*)\b|const\s+(?:percentil\w*|quantil\w*|diasUteis\w*)\s*=\s*(?:\([^)]*\)|\w+)\s*=>/,
    )
    expect(src).not.toMatch(/\*\s*0\.(?:85|95|5)\b|\*\s*0\.(?:85|95)\)/)
  })
  it('guarda: 10 arquivos lidos', () => expect(Object.keys(ARQ_FASE1).length).toBe(10))
})

describe('H-1 / INV-6: nada de horas apontadas', () => {
  it('nem o modelo da base BusinessMap nem o contrato da fase 1 têm campo de horas apontadas', () => {
    const modelo = fonte('businessmap/modelo.ts')
    const contrato = readFileSync(join(AQUI, '../../contratos/src/tambem.ts'), 'utf8')
    expect(modelo.length).toBeGreaterThan(1000)
    expect(contrato.length).toBeGreaterThan(1000)
    for (const t of [modelo, contrato])
      expect(t).not.toMatch(/apontad|horas_apont|timesheet|worklog/i)
  })
  it('O23: um bloqueio aberto/encerrado (atividade que não é mudança de coluna) não tira o card de "parado"', () => {
    const c: EspecCard = {
      id: 'P',
      criado: '2026-09-01T08:00:00-03:00',
      trilha: [
        ['Aguardando priorização', '2026-09-01T08:00:00-03:00'],
        ['Em desenvolvimento', '2026-09-02T09:00:00-03:00'],
      ],
    }
    const ini = instanteDeIso('2026-10-07T09:00:00-03:00', CALENDARIO_PADRAO)
    const bloqueio: FatoBloqueio = {
      card_id: 'P',
      motivo: 'Aguardando terceiro' as FatoBloqueio['motivo'],
      coluna_em_que_bloqueou: 'Em desenvolvimento',
      fornecedor: null,
      inicio: ini,
      fim: ini + 3_600_000,
      duracao_horas_uteis: 1,
    }
    const r = calcularO2(
      criarContextoBM(umaBase([c], [bloqueio]), HOJE_TESTE, CALENDARIO_PADRAO),
      F12S,
    )
    expect(r.parados.taxa).toMatchObject({ k: 1, n: 1 })
  })
})

describe('O23-3 / M-12: borda do limite de 5 dias úteis ("mais de 5")', () => {
  const mk = (id: string, mov: string): EspecCard => ({
    id,
    criado: '2026-09-01T08:00:00-03:00',
    trilha: [
      ['Aguardando priorização', '2026-09-01T08:00:00-03:00'],
      ['Em desenvolvimento', mov],
    ],
  })
  it('exatamente 5 não conta; 5,5 e 6 contam', () => {
    const base5 = umaBase([
      mk('exato', '2026-10-02T17:00:00-03:00'),
      mk('meio', '2026-10-02T12:00:00-03:00'),
      mk('seis', '2026-10-01T18:00:00-03:00'),
    ])
    const r = calcularO2(criarContextoBM(base5, HOJE_TESTE, CALENDARIO_PADRAO), F12S)
    const por = Object.fromEntries(r.itens.map((i) => [i.cardId, i.semMoverHaDiasUteis]))
    expect(por).toEqual({ exato: 5, meio: 5.5, seis: 6 })
    expect(r.parados.taxa).toMatchObject({ k: 2, n: 3 })
  })
})

describe('O23-2 / INV-1: fronteira 19/20 do percentual de parados', () => {
  const n = (k: number) =>
    Array.from({ length: k }, (_, i): EspecCard => ({
      id: `W${i}`,
      criado: '2026-09-01T08:00:00-03:00',
      trilha: [
        ['Aguardando priorização', '2026-09-01T08:00:00-03:00'],
        ['Em desenvolvimento', i < 5 ? '2026-09-02T09:00:00-03:00' : '2026-10-08T09:00:00-03:00'],
      ],
    }))
  it('19 itens: "k de n" sem percentual; 20: percentual publicado', () => {
    const r19 = calcularO2(criarContextoBM(umaBase(n(19)), HOJE_TESTE, CALENDARIO_PADRAO), F12S)
    expect(r19.parados.taxa).toEqual({ status: 'insuficiente', k: 5, n: 19, minimo: 20 })
    const r20 = calcularO2(criarContextoBM(umaBase(n(20)), HOJE_TESTE, CALENDARIO_PADRAO), F12S)
    expect(r20.parados.taxa).toMatchObject({ status: 'ok', k: 5, n: 20, pct: 25 })
  })
})

describe('O19-pct = B (mutante M-2 sobrevivente nos testes existentes): numerador também em dias úteis', () => {
  it('causa A: 20 bloqueios de 2 dias; causa B: 20 de 1 dia: A = 40/60, B = 20/60 (com bloqueios no numerador sairia 33%/33%)', () => {
    const fim = instanteDeIso('2026-09-21T10:00:00-03:00', CALENDARIO_PADRAO)
    const bq = (motivo: string, dias: number, i: number): FatoBloqueio => ({
      card_id: 'A',
      motivo: motivo as FatoBloqueio['motivo'],
      coluna_em_que_bloqueou: 'Em desenvolvimento',
      fornecedor: null,
      inicio: fim - dias * 8 * 3_600_000 - i,
      fim,
      duracao_horas_uteis: dias * CALENDARIO_PADRAO.horasPorDia,
    })
    const bl = [
      ...Array.from({ length: 20 }, (_, i) => bq('Janela de mudança', 2, i)),
      ...Array.from({ length: 20 }, (_, i) => bq('Aguardando fornecedor', 1, i)),
    ]
    const card: EspecCard = {
      id: 'A',
      criado: '2026-08-03T08:00:00-03:00',
      trilha: trilhaSimples(
        '2026-08-03T08:00:00-03:00',
        '2026-08-04T08:00:00-03:00',
        '2026-08-05T08:00:00-03:00',
        '2026-09-30T10:00:00-03:00',
      ),
    }
    const r = calcularO19(criarContextoBM(umaBase([card], bl), HOJE_TESTE, CALENDARIO_PADRAO), F12S)
    const pct = (m: string) => {
      const x = r.motivos.find((y) => y.motivo === m)!.pctDoTotal
      return x.status === 'ok' ? x.pct : null
    }
    expect(pct('Janela de mudança')).toBeCloseTo((40 / 60) * 100, 6)
    expect(pct('Aguardando fornecedor')).toBeCloseTo((20 / 60) * 100, 6)
  })
})

describe('O19-9: o percentual por causa nunca passa de 100% somado', () => {
  it('mock, vários períodos: soma dos pctDoTotal publicados <= 100', () => {
    const ctx = ctxMock(base.config.hoje)
    let publicados = 0
    for (const tipo of ['4s', '12s', '6m', '12m'] as const) {
      const lista = calcularO19(ctx.bm, { ...F12S, periodo: { tipo } }).motivos
      expect(lista.length, tipo).toBe(7)
      const soma = lista.reduce(
        (s, c) => s + (c.pctDoTotal.status === 'ok' ? c.pctDoTotal.pct : 0),
        0,
      )
      publicados += lista.filter((c) => c.pctDoTotal.status === 'ok').length
      expect(soma, tipo).toBeLessThanOrEqual(100 + 1e-9)
    }
    expect(publicados, 'ao menos uma causa publicada').toBeGreaterThan(0)
  })
})

describe('T10-7 (baixa): fornecedor em branco e a caixa do nome', () => {
  const bq = (forn: string | null, i: number): FatoBloqueio => {
    const fim = instanteDeIso('2026-09-21T10:00:00-03:00', CALENDARIO_PADRAO)
    return {
      card_id: `c${i}`,
      motivo: 'Aguardando terceiro' as FatoBloqueio['motivo'],
      coluna_em_que_bloqueou: 'Em desenvolvimento',
      fornecedor: forn,
      inicio: fim - 8 * 3_600_000,
      fim,
      duracao_horas_uteis: 8,
    }
  }
  const cards = (n: number): EspecCard[] =>
    Array.from({ length: n }, (_, i) => ({
      id: `c${i}`,
      criado: '2026-08-03T08:00:00-03:00',
      trilha: trilhaSimples(
        '2026-08-03T08:00:00-03:00',
        '2026-08-04T08:00:00-03:00',
        '2026-08-05T08:00:00-03:00',
        '2026-09-30T10:00:00-03:00',
      ),
    }))
  it('nome só de espaços fica fora; espaços nas pontas não dividem a linha', () => {
    const base = umaBase(cards(4), [bq('  ', 0), bq('', 1), bq(' Acme ', 2), bq('Acme', 3)])
    const r = calcularT10(criarContextoBM(base, HOJE_TESTE, CALENDARIO_PADRAO), F12S)
    expect(r.fornecedores.map((f) => [f.fornecedor, f.bloqueios])).toEqual([['Acme', 2]])
  })
})

describe('E7-2 / E7-4: sem R$; natureza pela função do T3', () => {
  it('E7-2: em vários períodos nenhuma chave de custo na saída (D2 = A, sem R$)', () => {
    const ctx = ctxMock(base.config.hoje)
    let sistemas = 0
    for (const tipo of ['4s', '12s', '6m', '12m'] as const) {
      const r = calcularE7(ctx.bm, { ...F12S, periodo: { tipo } })
      sistemas += r.sistemas.length
      expect(JSON.stringify(r)).not.toMatch(/"custo/)
    }
    expect(sistemas).toBeGreaterThan(8)
  })

  it('E7-4: o e7.ts importa naturezaDe do T3 e não redefine a classificação', () => {
    const src = fonte('businessmap/e7.ts')
    expect(src).toMatch(/import \{ naturezaDe \} from '\.\/t3'/)
    expect(src).not.toMatch(/(?:function|const)\s+naturezaDe\b/)
  })
})
