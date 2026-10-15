import { describe, expect, it } from 'vitest'
import { MOTIVOS_BLOQUEIO, type FiltrosFluxo, type MotivoBloqueio } from '@metricas-dspd/contratos'
import { SCHEMAS_RESULTADO } from '@metricas-dspd/contratos/validacao'
import { gerarBaseMock } from '@metricas-dspd/mock'
import { gerarBaseBusinessMap } from '@metricas-dspd/mock'
import { CALENDARIO_PADRAO, instanteDeIso } from '../core/calendario'
import { calcularO19, calcularT10, type FatoBloqueio } from './index'
import { criarContextoBM } from './indice'
import { HOJE_TESTE, trilhaSimples, umaBase, type EspecCard } from './testing'

const F: FiltrosFluxo = { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12s' } }
const HPD = CALENDARIO_PADRAO.horasPorDia
const H = 3_600_000
const ctxDe = (cards: EspecCard[], bloqueios: FatoBloqueio[]) =>
  criarContextoBM(umaBase(cards, bloqueios), HOJE_TESTE, CALENDARIO_PADRAO)

const card = (id: string, extra: Partial<EspecCard> = {}): EspecCard => ({
  id,
  criado: '2026-08-03T08:00:00-03:00',
  trilha: trilhaSimples(
    '2026-08-03T08:00:00-03:00',
    '2026-08-04T08:00:00-03:00',
    '2026-08-05T08:00:00-03:00',
    '2026-09-30T10:00:00-03:00',
  ),
  ...extra,
})

/** Bloqueio encerrado em `fimIso` com `dias` dias úteis de duração (em horas úteis, como na base). */
const bloq = (
  cardId: string,
  motivo: MotivoBloqueio,
  fornecedor: string | null,
  fimIso: string | null,
  dias = 1,
): FatoBloqueio => {
  const fim = fimIso === null ? null : instanteDeIso(fimIso, CALENDARIO_PADRAO)
  const horas = dias * HPD
  return {
    card_id: cardId,
    motivo,
    coluna_em_que_bloqueou: 'Em desenvolvimento',
    fornecedor,
    inicio: (fim ?? instanteDeIso('2026-10-05T10:00:00-03:00', CALENDARIO_PADRAO)) - horas * H,
    fim,
    duracao_horas_uteis: fim === null ? null : horas,
  }
}
const muitos = (
  n: number,
  motivo: MotivoBloqueio,
  fornecedor: string | null,
  dias = 1,
): FatoBloqueio[] =>
  Array.from({ length: n }, () => bloq('A', motivo, fornecedor, '2026-09-21T10:00:00-03:00', dias))

describe('O19: bloqueios por causa', () => {
  it('devolve os 7 motivos na ordem do domínio, com soma e contagem sempre e P50/P85 só com 20 ou mais', () => {
    const r = calcularO19(
      ctxDe(
        [card('A')],
        [
          ...muitos(20, 'Janela de mudança', null, 2),
          ...muitos(3, 'Aguardando fornecedor', 'Fornecedor Alfa', 4),
        ],
      ),
      F,
    )
    expect(r.motivos.map((m) => m.motivo)).toEqual([...MOTIVOS_BLOQUEIO])
    const janela = r.motivos.find((m) => m.motivo === 'Janela de mudança')
    expect(janela).toMatchObject({ bloqueios: 20, diasUteis: 40 })
    expect(janela?.duracao).toMatchObject({
      status: 'ok',
      n: 20,
      valor: { p50: 2, p85: 2, p95: 2 },
    })
    const forn = r.motivos.find((m) => m.motivo === 'Aguardando fornecedor')
    expect(forn).toMatchObject({ bloqueios: 3, diasUteis: 12 })
    expect(forn?.duracao).toMatchObject({ status: 'insuficiente', n: 3, minimo: 20 })
    expect(forn?.duracao).not.toHaveProperty('valor')
    expect(r.motivos[1]).toMatchObject({ bloqueios: 0, diasUteis: 0 })
    expect(r.totalDiasUteis).toBe(52)
    expect(r.base).toMatchObject({ n: 23, unidade: 'bloqueios encerrados' })
    expect(SCHEMAS_RESULTADO.O19.safeParse(r).success).toBe(true)
  })

  it('R6: o pctDoTotal é k de n em bloqueios (n = bloqueios encerrados), nunca em dias úteis', () => {
    // 20 bloqueios curtos de um motivo e 1 longo de outro: em dias o longo dominaria (100 de 120).
    const r = calcularO19(
      ctxDe(
        [card('A')],
        [
          ...muitos(20, 'Janela de mudança', null, 1),
          bloq('A', 'Aguardando validação do negócio', null, '2026-09-21T10:00:00-03:00', 100),
        ],
      ),
      F,
    )
    const valid = r.motivos[1]
    expect(r.motivos.find((m) => m.motivo === 'Janela de mudança')?.pctDoTotal).toEqual({
      status: 'ok',
      k: 20,
      n: 21,
      pct: (20 / 21) * 100,
    })
    expect(valid?.pctDoTotal).toMatchObject({ status: 'ok', k: 1, n: 21 })
  })

  it('abaixo de 20 bloqueios no total o percentual não é publicado: só "k de n"', () => {
    const r = calcularO19(ctxDe([card('A')], muitos(19, 'Janela de mudança', null)), F)
    const m = r.motivos.find((x) => x.motivo === 'Janela de mudança')
    expect(m?.pctDoTotal).toEqual({ status: 'insuficiente', k: 19, n: 19, minimo: 20 })
  })

  it('conta à parte os abertos e fica só com os encerrados dentro do período, de story', () => {
    const r = calcularO19(
      ctxDe(
        [card('A'), card('F', { gran: 'frente' })],
        [
          bloq('A', 'Janela de mudança', null, null),
          bloq('A', 'Janela de mudança', null, '2026-09-21T10:00:00-03:00'),
          bloq('A', 'Janela de mudança', null, '2026-05-04T10:00:00-03:00'), // fora do período
          bloq('F', 'Janela de mudança', null, '2026-09-21T10:00:00-03:00'), // frente nunca entra
        ],
      ),
      F,
    )
    expect(r.abertosForaDaSoma).toBe(1)
    expect(r.base.n).toBe(1)
    expect(r.totalDiasUteis).toBe(1)
  })

  it('respeita os filtros de equipe, sistema e tipo pelo card do bloqueio', () => {
    const cards = [
      card('A'),
      card('B', { equipe: 'Equipe B', sistema: 'Outro', tipo: 'Bug interno' }),
    ]
    const bl = [
      bloq('A', 'Janela de mudança', null, '2026-09-21T10:00:00-03:00'),
      bloq('B', 'Janela de mudança', null, '2026-09-21T10:00:00-03:00'),
    ]
    expect(calcularO19(ctxDe(cards, bl), F).base.n).toBe(2)
    expect(calcularO19(ctxDe(cards, bl), { ...F, tipo: ['Bug interno'] }).base.n).toBe(1)
  })

  it('base vazia: sete motivos zerados, sem erro', () => {
    const r = calcularO19(ctxDe([card('A')], []), F)
    expect(r.motivos).toHaveLength(7)
    expect(r.totalDiasUteis).toBe(0)
    expect(r.abertosForaDaSoma).toBe(0)
  })
})

describe('T10: tempo de terceiros (só o praticado)', () => {
  it('CA-24: entra todo bloqueio encerrado com fornecedor, de qualquer motivo; sem fornecedor fica fora', () => {
    const r = calcularT10(
      ctxDe(
        [card('A')],
        [
          ...muitos(10, 'Aguardando fornecedor', 'Fornecedor Beta'),
          ...muitos(10, 'Aguardando licença ou contrato', 'Fornecedor Beta'),
          ...muitos(2, 'Janela de mudança', 'Fornecedor Beta'), // qualquer motivo da lista fechada
          ...muitos(5, 'Aguardando fornecedor', null), // falha de preenchimento: fora
          ...muitos(2, 'Aguardando fornecedor', ''),
          ...muitos(2, 'Aguardando fornecedor', '   '),
          bloq('A', 'Aguardando fornecedor', 'Fornecedor Beta', null), // aberto: fora
        ],
      ),
      F,
    )
    expect(r.fornecedores).toHaveLength(1)
    expect(r.fornecedores[0]).toMatchObject({ fornecedor: 'Fornecedor Beta', bloqueios: 22 })
    expect(r.fornecedores[0]?.duracao).toMatchObject({ status: 'ok', n: 22 })
    expect(r.base.n).toBe(22)
    expect(r.totalDiasUteis).toBe(22)
    expect(SCHEMAS_RESULTADO.T10.safeParse(r).success).toBe(true)
  })

  it('CA-11: ordem alfabética, independente da ordem de entrada', () => {
    const bl = [
      ...muitos(1, 'Aguardando fornecedor', 'Fornecedor Gama'),
      ...muitos(1, 'Aguardando fornecedor', 'Fornecedor Alfa'),
      ...muitos(30, 'Aguardando fornecedor', 'Fornecedor Beta'),
    ]
    const a = calcularT10(ctxDe([card('A')], bl), F)
    const b = calcularT10(ctxDe([card('A')], [...bl].reverse()), F)
    const nomes = ['Fornecedor Alfa', 'Fornecedor Beta', 'Fornecedor Gama']
    expect(a.fornecedores.map((x) => x.fornecedor)).toEqual(nomes)
    expect(b).toEqual(a)
  })

  it('P50/P85 só com 20 ou mais por fornecedor (19 não publica, 20 publica); contagem e soma sempre', () => {
    const r = calcularT10(
      ctxDe(
        [card('A')],
        [
          ...muitos(19, 'Aguardando fornecedor', 'Fornecedor Alfa', 3),
          ...muitos(20, 'Aguardando fornecedor', 'Fornecedor Beta', 3),
        ],
      ),
      F,
    )
    const [alfa, beta] = r.fornecedores
    expect(alfa).toMatchObject({ bloqueios: 19, diasUteis: 57 })
    expect(alfa?.duracao).toEqual({
      status: 'insuficiente',
      n: 19,
      minimo: 20,
      janela: alfa?.duracao.janela,
    })
    expect(beta?.duracao).toMatchObject({ status: 'ok', n: 20, valor: { p50: 3, p85: 3 } })
  })

  it('CA-36: sem prazo contratado e sem status em nenhum nível do resultado', () => {
    const r = calcularT10(
      ctxDe([card('A')], muitos(25, 'Aguardando fornecedor', 'Fornecedor Alfa')),
      F,
    )
    const chaves = new Set<string>()
    const varrer = (x: unknown): void => {
      if (Array.isArray(x)) x.forEach(varrer)
      else if (x !== null && typeof x === 'object')
        for (const [k, v] of Object.entries(x)) {
          chaves.add(k)
          varrer(v)
        }
    }
    varrer(
      r.fornecedores.map(({ fornecedor, bloqueios, diasUteis }) => ({
        fornecedor,
        bloqueios,
        diasUteis,
      })),
    )
    expect([...chaves].filter((k) => /prazo|contratad/i.test(k))).toEqual([])
    expect(Object.keys(r.fornecedores[0] ?? {}).sort()).toEqual([
      'bloqueios',
      'diasUteis',
      'duracao',
      'fornecedor',
    ])
    expect(Object.keys(r).sort()).toEqual(['base', 'criterios', 'fornecedores', 'totalDiasUteis'])
  })
})

describe('O19 e T10 sobre o mock (B11a: alvos da fase 1 como asserção)', () => {
  const b = gerarBaseMock({})
  const ctx = criarContextoBM(b.bm, b.config.hoje, CALENDARIO_PADRAO)

  it('O19 em 12 semanas: 120 encerrados ou mais, ao menos 1 motivo com 20 ou mais, ao menos 2 abaixo de 20 e 3 a 5 abertos', () => {
    const r = calcularO19(ctx, F)
    expect(r.base.n).toBeGreaterThanOrEqual(120)
    expect(r.abertosForaDaSoma).toBeGreaterThanOrEqual(3)
    expect(r.abertosForaDaSoma).toBeLessThanOrEqual(5)
    const publicados = r.motivos.filter((m) => m.bloqueios >= 20)
    const abaixo = r.motivos.filter((m) => m.bloqueios < 20)
    expect(publicados.length).toBeGreaterThanOrEqual(1)
    expect(abaixo.length).toBeGreaterThanOrEqual(2)
    // abaixo de 20 não publica a duração ("amostra insuficiente"); com 20 ou mais publica
    expect(abaixo.every((m) => m.duracao.status === 'insuficiente')).toBe(true)
    expect(publicados.every((m) => m.duracao.status === 'ok')).toBe(true)
    expect(SCHEMAS_RESULTADO.O19.safeParse(r).success).toBe(true)
  })

  it('com uma equipe só (30 bloqueios) todos os motivos ficam abaixo de 20 e só saem soma e contagem', () => {
    const equipe = [...new Set(ctx.idx.marcos.map((m) => m.slugEquipe))].sort().slice(0, 1)
    const r = calcularO19(ctx, { ...F, equipe })
    expect(r.base.n).toBe(30)
    expect(r.motivos.map((m) => m.bloqueios)).toEqual([3, 3, 7, 0, 15, 0, 2])
    expect(r.motivos.every((m) => m.duracao.status === 'insuficiente')).toBe(true)
    expect(r.motivos.every((m) => m.pctDoTotal.status === 'ok')).toBe(true)
  })

  it('T10 em 12 semanas: 40 a 70 bloqueios em 3 fornecedores, ao menos 1 com 20 ou mais e ao menos 1 abaixo; com 12 meses a janela dos percentis não muda', () => {
    const r = calcularT10(ctx, F)
    const total = r.fornecedores.reduce((s, x) => s + x.bloqueios, 0)
    expect(total).toBeGreaterThanOrEqual(40)
    expect(total).toBeLessThanOrEqual(70)
    expect(r.fornecedores.map((x) => x.fornecedor)).toEqual([
      'Fornecedor Alfa',
      'Fornecedor Beta',
      'Fornecedor Gama',
    ])
    expect(r.fornecedores.some((x) => x.bloqueios >= 20 && x.duracao.status === 'ok')).toBe(true)
    expect(
      r.fornecedores.some((x) => x.bloqueios < 20 && x.duracao.status === 'insuficiente'),
    ).toBe(true)
    expect(r.fornecedores.map((x) => [x.fornecedor, x.bloqueios])).toEqual([
      ['Fornecedor Alfa', 17],
      ['Fornecedor Beta', 20],
      ['Fornecedor Gama', 26],
    ])
    // B3-1: com 12 meses o censo cresce, mas os percentis seguem na janela de 12 semanas (Alfa continua com 17).
    const ano = calcularT10(ctx, { ...F, periodo: { tipo: '12m' } })
    expect(ano.fornecedores.map((x) => [x.bloqueios > x.duracao.n, x.duracao.status])).toEqual([
      [true, 'insuficiente'],
      [true, 'ok'],
      [true, 'ok'],
    ])
    expect(ano.fornecedores.map((x) => x.duracao.n)).toEqual([17, 20, 26])
    expect(SCHEMAS_RESULTADO.T10.safeParse(r).success).toBe(true)
  })

  it('o aberto do O19 vem do gerador principal: o ajuste da fase 1 só fecha bloqueios novos', () => {
    const abertos = b.bm.bloqueios.filter((x) => x.fim === null).length
    const sem = gerarBaseBusinessMap(b.config, { tambem: false }).bloqueios.filter(
      (x) => x.fim === null,
    ).length
    expect(abertos).toBe(sem)
  })
})

const F12M: FiltrosFluxo = { ...F, periodo: { tipo: '12m' } }
const F4S: FiltrosFluxo = { ...F, periodo: { tipo: '4s' } }
const comCriterio = (cards: EspecCard[], bloqueios: FatoBloqueio[], afeta: 'O19' | 'T10') => {
  const base = umaBase(cards, bloqueios)
  base.config.criterios = [
    { id: 'c-meio', data: '2026-09-20', descricao: 'critério no meio', afeta: [afeta] },
    { id: 'c-janela', data: '2026-08-15', descricao: 'critério só na janela', afeta: [afeta] },
    { id: 'c-fora', data: '2026-08-15', descricao: 'outra métrica', afeta: ['O1'] },
  ]
  return criarContextoBM(base, HOJE_TESTE, CALENDARIO_PADRAO)
}

describe('B3-1: percentis na janela de 12 semanas, censo no período', () => {
  // Janela de 12 semanas termina em 2026-10-09: o dia 84 é 2026-07-18 (dentro) e o 85 é 2026-07-17 (fora).
  const noDia = (dia: string, n: number, motivo: MotivoBloqueio, forn: string | null) =>
    Array.from({ length: n }, () => bloq('A', motivo, forn, `${dia}T10:00:00-03:00`, 2))

  it('O19: bloqueio no dia 84 entra na amostra e o do dia 85 fica fora, embora conte no período de 12 meses', () => {
    const dentroDaJanela = calcularO19(
      ctxDe([card('A')], noDia('2026-07-18', 20, 'Janela de mudança', null)),
      F12M,
    )
    const m = dentroDaJanela.motivos.find((x) => x.motivo === 'Janela de mudança')
    expect(m?.duracao).toMatchObject({ status: 'ok', n: 20, janela: { inicio: '2026-07-18' } })

    const foraDaJanela = calcularO19(
      ctxDe(
        [card('A')],
        [
          ...noDia('2026-07-18', 19, 'Janela de mudança', null),
          ...noDia('2026-07-17', 1, 'Janela de mudança', null),
        ],
      ),
      F12M,
    )
    const f = foraDaJanela.motivos.find((x) => x.motivo === 'Janela de mudança')
    expect(f).toMatchObject({ bloqueios: 20, pctDoTotal: { status: 'ok', k: 20, n: 20 } })
    expect(f?.duracao).toMatchObject({ status: 'insuficiente', n: 19 })
  })

  it('T10: o mesmo corte 84/85 vale por fornecedor', () => {
    const r = calcularT10(
      ctxDe(
        [card('A')],
        [
          ...noDia('2026-07-18', 20, 'Aguardando fornecedor', 'Fornecedor Alfa'),
          ...noDia('2026-07-18', 19, 'Aguardando fornecedor', 'Fornecedor Beta'),
          ...noDia('2026-07-17', 1, 'Aguardando fornecedor', 'Fornecedor Beta'),
        ],
      ),
      F12M,
    )
    const [alfa, beta] = r.fornecedores
    expect(alfa?.duracao).toMatchObject({ status: 'ok', n: 20 })
    expect(beta).toMatchObject({ bloqueios: 20 })
    expect(beta?.duracao).toMatchObject({ status: 'insuficiente', n: 19 })
    // Fornecedor com bloqueios só antes da janela: entra no censo do período e tem n = 0 nos percentis.
    const antigo = calcularT10(
      ctxDe(
        [card('A')],
        [
          ...noDia('2026-05-04', 3, 'Aguardando fornecedor', 'Fornecedor Gama'),
          ...noDia('2026-07-18', 1, 'Aguardando fornecedor', 'Fornecedor Alfa'),
        ],
      ),
      F12M,
    )
    expect(antigo.fornecedores.map((x) => [x.fornecedor, x.bloqueios, x.duracao.n])).toEqual([
      ['Fornecedor Alfa', 1, 1],
      ['Fornecedor Gama', 3, 0],
    ])
  })
})

describe('L3: marcação de critério cruzando o período (O19 e T10)', () => {
  const bl = muitos(2, 'Aguardando fornecedor', 'Fornecedor Alfa')
  it('O19: a série traz as versões do período e a janela traz as da janela', () => {
    const r = calcularO19(comCriterio([card('A')], bl, 'O19'), F4S)
    expect(r.criterios.serie.map((c) => c.id)).toEqual(['c-meio'])
    expect(r.criterios.janela.map((c) => c.id)).toEqual(['c-janela', 'c-meio'])
  })
  it('T10: a série traz as versões do período e a janela traz as da janela', () => {
    const r = calcularT10(comCriterio([card('A')], bl, 'T10'), F4S)
    expect(r.criterios.serie.map((c) => c.id)).toEqual(['c-meio'])
    expect(r.criterios.janela.map((c) => c.id)).toEqual(['c-janela', 'c-meio'])
  })
})

describe('B3-2: bloqueio que atravessa o fim do período', () => {
  it('conta como aberto no fim do período, sem entrar na soma nem nos percentis', () => {
    // Período custom até 2026-09-10; o bloqueio vai de 09-08 a 09-21 (passa do fim) e outro começa só depois do corte.
    const fim = (dia: string) => instanteDeIso(`${dia}T10:00:00-03:00`, CALENDARIO_PADRAO)
    const atravessa: FatoBloqueio = {
      ...bloq('A', 'Janela de mudança', null, '2026-09-21T10:00:00-03:00', 1),
      inicio: fim('2026-09-08'),
    }
    const depois: FatoBloqueio = {
      ...bloq('A', 'Janela de mudança', null, '2026-09-21T10:00:00-03:00', 1),
      inicio: fim('2026-09-15'),
    }
    const r = calcularO19(ctxDe([card('A')], [atravessa, depois]), {
      ...F,
      periodo: { tipo: 'custom', de: '2026-08-01', ate: '2026-09-10' },
    })
    expect(r.abertosForaDaSoma).toBe(1)
    expect(r.base.n).toBe(0)
    expect(r.totalDiasUteis).toBe(0)
  })
})
