import { describe, expect, it } from 'vitest'
import {
  MOTIVOS_BLOQUEIO_PUBLICADOS,
  type FiltrosFluxo,
  type MotivoBloqueio,
} from '@metricas-dspd/contratos'
import { SCHEMAS_RESULTADO } from '@metricas-dspd/contratos/validacao'
import { gerarBaseMock } from '@metricas-dspd/mock'
import { gerarBaseBusinessMap } from '@metricas-dspd/mock'
import { CALENDARIO_PADRAO, instanteDeIso } from '../core/calendario'
import { marcacoesNoPeriodo, VERSAO_CRITERIO_T10_TEMPO_TOTAL_FORNECEDOR } from '../core/criterios'
import { calcularO19, calcularT10, type FatoBloqueio } from './index'
import { MOTIVO_SEM_LISTA_POR_FORNECEDOR } from './t10'
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
  it('devolve os 8 motivos publicados ("não classificado" por último), com soma e contagem sempre e P50/P85 só com 20 ou mais', () => {
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
    expect(r.motivos.map((m) => m.motivo)).toEqual([...MOTIVOS_BLOQUEIO_PUBLICADOS])
    expect(r.motivos).toHaveLength(8)
    expect(r.motivos[7]!.motivo).toBe('não classificado')
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

  it('O19-pct = B: o pctDoTotal é a participação nos DIAS úteis; o mínimo de 20 vale sobre os bloqueios da causa', () => {
    // 20 bloqueios curtos (1 dia) de um motivo e 1 longo (100 dias) de outro: em dias o longo domina.
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
    const janela = r.motivos.find((m) => m.motivo === 'Janela de mudança')!
    const valid = r.motivos.find((m) => m.motivo === 'Aguardando validação do negócio')!
    expect(janela.pctDoTotal).toMatchObject({
      status: 'ok',
      bloqueios: 20,
      diasUteis: janela.diasUteis,
      totalDiasUteis: r.totalDiasUteis,
    })
    const pj = janela.pctDoTotal as Extract<typeof janela.pctDoTotal, { status: 'ok' }>
    expect(pj.pct).toBeCloseTo((janela.diasUteis / r.totalDiasUteis) * 100, 9)
    // o longo (1 bloqueio) está abaixo de 20 bloqueios: não publica o percentual, mesmo dominando os dias
    expect(valid.pctDoTotal).toEqual({
      status: 'insuficiente',
      bloqueios: 1,
      diasUteis: valid.diasUteis,
      totalDiasUteis: r.totalDiasUteis,
      minimo: 20,
    })
    expect(valid.diasUteis).toBeGreaterThan(janela.diasUteis)
    expect(SCHEMAS_RESULTADO.O19.safeParse(r).success).toBe(true)
  })

  it('O19-pct = B: com 20 ou mais bloqueios da causa publica o percentual em dias; com 19 não, mesmo que o total passe de 20', () => {
    const r = calcularO19(
      ctxDe(
        [card('A')],
        [...muitos(19, 'Janela de mudança', null), ...muitos(20, 'Aguardando fornecedor', null, 2)],
      ),
      F,
    )
    const m = (x: string) => r.motivos.find((y) => y.motivo === x)!.pctDoTotal
    expect(m('Janela de mudança')).toMatchObject({ status: 'insuficiente', bloqueios: 19 })
    expect(JSON.stringify(m('Janela de mudança'))).not.toContain('pct')
    expect(m('Aguardando fornecedor')).toMatchObject({ status: 'ok', bloqueios: 20 })
    const pcts = r.motivos.flatMap((x) => (x.pctDoTotal.status === 'ok' ? [x.pctDoTotal.pct] : []))
    expect(pcts.every((v) => v >= 0 && v <= 100)).toBe(true)
  })

  it('O19-pct = B: 20 bloqueios sem nenhum dia útil (total zero) publicam 0%, sem dividir por zero', () => {
    const r = calcularO19(ctxDe([card('A')], muitos(20, 'Janela de mudança', null, 0)), F)
    expect(r.totalDiasUteis).toBe(0)
    expect(r.motivos.find((x) => x.motivo === 'Janela de mudança')?.pctDoTotal).toMatchObject({
      status: 'ok',
      pct: 0,
    })
  })

  it('T2.6: a mudança do percentual é uma versão de critério datada, só do O19', () => {
    const periodo = { inicio: '2026-10-01', fim: '2026-10-31' }
    expect(marcacoesNoPeriodo('O19', periodo, []).map((m) => m.id)).toContain(
      'criterio-2026-10-16-o19-pct-em-dias-uteis',
    )
    expect(marcacoesNoPeriodo('O20', periodo, []).map((m) => m.id)).not.toContain(
      'criterio-2026-10-16-o19-pct-em-dias-uteis',
    )
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

  it('base vazia: oito motivos zerados, sem erro', () => {
    const r = calcularO19(ctxDe([card('A')], []), F)
    expect(r.motivos).toHaveLength(8)
    expect(r.totalDiasUteis).toBe(0)
    expect(r.abertosForaDaSoma).toBe(0)
  })
})

describe('T10: tempo de terceiros (total esperando fornecedores, sem separar por fornecedor)', () => {
  it('E7.77: entra só o bloqueio encerrado com o motivo Aguardando fornecedor; outro motivo e aberto ficam fora; fornecedor informado ou não é indiferente', () => {
    const r = calcularT10(
      ctxDe(
        [card('A')],
        [
          ...muitos(10, 'Aguardando fornecedor', null),
          ...muitos(10, 'Aguardando fornecedor', 'Fornecedor Beta'),
          ...muitos(5, 'Aguardando licença ou contrato', 'Fornecedor Beta'), // outro motivo: fora, mesmo com fornecedor
          ...muitos(4, 'Janela de mudança', null),
          bloq('A', 'Aguardando fornecedor', null, null), // aberto: fora
        ],
      ),
      F,
    )
    expect(r.fornecedores).toEqual([])
    expect(r.base.n).toBe(20)
    expect(r.esperaFornecedores).toMatchObject({ bloqueios: 20, diasUteis: 20 })
    expect(r.esperaFornecedores?.duracao).toMatchObject({ status: 'ok', n: 20 })
    expect(r.totalDiasUteis).toBe(20)
    expect(r.motivoSemFornecedores).toBe(MOTIVO_SEM_LISTA_POR_FORNECEDOR)
    expect(SCHEMAS_RESULTADO.T10.safeParse(r).success).toBe(true)
  })

  it('fronteira: 19 não publica P50/P85 (contagem e soma saem); 20 publica', () => {
    const com = (n: number) =>
      calcularT10(ctxDe([card('A')], muitos(n, 'Aguardando fornecedor', null, 3)), F)
    const r19 = com(19)
    expect(r19.esperaFornecedores).toMatchObject({ bloqueios: 19, diasUteis: 57 })
    expect(r19.esperaFornecedores?.duracao).toEqual({
      status: 'insuficiente',
      n: 19,
      minimo: 20,
      janela: r19.esperaFornecedores?.duracao.janela,
    })
    const r20 = com(20)
    expect(r20.esperaFornecedores?.duracao).toMatchObject({
      status: 'ok',
      n: 20,
      valor: { p50: 3, p85: 3 },
    })
  })

  it('sem nenhum bloqueio de fornecedor: total zero, amostra insuficiente, sem erro', () => {
    const r = calcularT10(ctxDe([card('A')], muitos(30, 'Janela de mudança', null)), F)
    expect(r.esperaFornecedores).toMatchObject({ bloqueios: 0, diasUteis: 0 })
    expect(r.esperaFornecedores?.duracao).toMatchObject({ status: 'insuficiente', n: 0 })
    expect(r.totalDiasUteis).toBe(0)
  })

  it('nunca expõe o nome do fornecedor, prazo nem status; chaves do resultado fechadas', () => {
    const r = calcularT10(
      ctxDe([card('A')], muitos(25, 'Aguardando fornecedor', 'Fornecedor Alfa')),
      F,
    )
    expect(JSON.stringify(r)).not.toContain('Fornecedor Alfa')
    expect(Object.keys(r).sort()).toEqual([
      'base',
      'criterios',
      'esperaFornecedores',
      'fornecedores',
      'motivoSemFornecedores',
      'totalDiasUteis',
    ])
    expect(Object.keys(r.esperaFornecedores ?? {}).sort()).toEqual([
      'bloqueios',
      'diasUteis',
      'duracao',
    ])
    expect(calcularT10(ctxDe([card('A')], muitos(25, 'Aguardando fornecedor', null)), F)).toEqual(r)
  })

  it('a versão de critério E7.77 marca só o T10, a partir de 2026-11-16', () => {
    const v = VERSAO_CRITERIO_T10_TEMPO_TOTAL_FORNECEDOR
    expect(v.afeta).toEqual(['T10'])
    expect(v.data).toBe('2026-11-16')
    expect(
      marcacoesNoPeriodo('T10', { inicio: '2026-11-10', fim: '2026-11-17' }, []).map((m) => m.id),
    ).toContain(v.id)
    expect(
      marcacoesNoPeriodo('T10', { inicio: '2026-10-20', fim: '2026-11-15' }, []).map((m) => m.id),
    ).not.toContain(v.id)
    expect(
      marcacoesNoPeriodo('O19', { inicio: '2026-11-10', fim: '2026-11-17' }, []).map((m) => m.id),
    ).not.toContain(v.id)
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
    expect(r.motivos.map((m) => m.bloqueios)).toEqual([3, 3, 7, 0, 15, 0, 2, 0])
    expect(r.motivos.every((m) => m.duracao.status === 'insuficiente')).toBe(true)
    // O19-pct = B: o mínimo é sobre os bloqueios da causa (nenhuma chega a 20), então o percentual não sai
    expect(r.motivos.every((m) => m.pctDoTotal.status === 'insuficiente')).toBe(true)
  })

  it('T10 sobre o mock: total dos bloqueios encerrados de fornecedor, lista por fornecedor vazia; 12 meses não muda a janela dos percentis', () => {
    const r = calcularT10(ctx, F)
    const esperado = calcularO19(ctx, F).motivos.find((m) => m.motivo === 'Aguardando fornecedor')
    expect(r.fornecedores).toEqual([])
    expect(r.esperaFornecedores?.bloqueios).toBe(esperado?.bloqueios)
    expect(r.esperaFornecedores?.diasUteis).toBe(esperado?.diasUteis)
    const ano = calcularT10(ctx, { ...F, periodo: { tipo: '12m' } })
    expect((ano.esperaFornecedores?.bloqueios ?? 0) >= (r.esperaFornecedores?.bloqueios ?? 0)).toBe(
      true,
    )
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
    expect(f).toMatchObject({ bloqueios: 20, pctDoTotal: { status: 'ok', bloqueios: 20 } })
    expect(f?.duracao).toMatchObject({ status: 'insuficiente', n: 19 })
  })

  it('T10: o mesmo corte 84/85 vale para o total', () => {
    const r = calcularT10(
      ctxDe(
        [card('A')],
        [
          ...noDia('2026-07-18', 19, 'Aguardando fornecedor', null),
          ...noDia('2026-07-17', 1, 'Aguardando fornecedor', null),
        ],
      ),
      F12M,
    )
    expect(r.esperaFornecedores).toMatchObject({ bloqueios: 20 })
    expect(r.esperaFornecedores?.duracao).toMatchObject({ status: 'insuficiente', n: 19 })
    const dentro = calcularT10(
      ctxDe([card('A')], noDia('2026-07-18', 20, 'Aguardando fornecedor', null)),
      F12M,
    )
    expect(dentro.esperaFornecedores?.duracao).toMatchObject({ status: 'ok', n: 20 })
    // Só antes da janela: entra no censo do período e tem n = 0 nos percentis.
    const antigo = calcularT10(
      ctxDe([card('A')], noDia('2026-05-04', 3, 'Aguardando fornecedor', null)),
      F12M,
    )
    expect(antigo.esperaFornecedores).toMatchObject({ bloqueios: 3 })
    expect(antigo.esperaFornecedores?.duracao.n).toBe(0)
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
