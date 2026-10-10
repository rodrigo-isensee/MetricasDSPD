import {
  estadoColetaSchema,
  eventoColetaSchema,
  type EventoColeta,
  type VersaoCriterio,
} from '@metricas-dspd/contratos'
import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import {
  DURACAO_CALIBRACAO_DIAS,
  janelasCalibracao,
  metricasDaFonte,
  metricasEmCalibracao,
  vigentes,
} from './calibracao'
import { isoLocal, proximaColeta, seloFrescor } from './frescor'
import { montarEstadoColeta, paginarColetas } from './coleta'
import { diaDeIso, isoDeDia } from './calendario'

const ev = (
  dia: string,
  resultado: EventoColeta['resultado'] = 'ok',
  hora = '06:00:30',
): EventoColeta => ({
  id: `x-${dia}`,
  inicio: `${dia}T${hora}-03:00`,
  fim: `${dia}T${hora}-03:00`,
  duracaoMs: 1,
  resultado,
  tipoErro: resultado === 'ok' ? null : 'indisponivel',
  efeito: resultado === 'ok' ? 'aplicada' : 'anteriores-mantidos',
  contagens: null,
})
const t = (iso: string): number => Date.parse(iso)
const crit = (id: string, data: string, afeta: VersaoCriterio['afeta']): VersaoCriterio => ({
  id,
  data,
  descricao: 'd',
  afeta,
})

describe('calibracao', () => {
  it('constante única e métricas por fonte sem mistura', () => {
    expect(DURACAO_CALIBRACAO_DIAS).toBe(60)
    const bm = metricasDaFonte('businessmap'),
      ac = metricasDaFonte('acelerato')
    expect(bm.some((m) => ac.includes(m))).toBe(false)
    expect(bm).toContain('O1')
    expect(ac).toContain('S1')
    expect([...bm, ...ac]).not.toContain('VISAO_GERAL')
  })
  it('abre por início de coleta e por critério, só com métricas da fonte', () => {
    const v = [crit('c1', '2026-03-02', ['O7', 'S1']), crit('c2', '2026-04-01', ['S2'])]
    const bm = janelasCalibracao('businessmap', '2026-01-05', v)
    expect(bm.map((j) => [j.origem, j.criterioId, j.metricas.includes('S1')])).toEqual([
      ['inicio-coleta', null, false],
      ['criterio', 'c1', false],
    ])
    expect(bm[1]?.metricas).toEqual(['O7'])
    expect(janelasCalibracao('acelerato', null, v).map((j) => j.criterioId)).toEqual(['c1', 'c2'])
  })
  it('borda: dia 59 vigente, dia 60 não', () => {
    const [j] = janelasCalibracao('acelerato', '2026-09-15', [])
    expect(j?.fim).toBe('2026-11-13')
    expect(vigentes([j!], '2026-11-13')).toHaveLength(1)
    expect(vigentes([j!], '2026-11-14')).toHaveLength(0)
    expect(vigentes([j!], '2026-09-14')).toHaveLength(0)
    expect(metricasEmCalibracao([])).toEqual([])
  })
  it('propriedade: janela sempre cobre 60 dias', () => {
    fc.assert(
      fc.property(fc.integer({ min: 20000, max: 21500 }), (d) => {
        const [j] = janelasCalibracao('businessmap', isoDeDia(d), [])
        expect(diaDeIso(j!.fim) - diaDeIso(j!.inicio) + 1).toBe(60)
      }),
    )
  })
})

describe('frescor', () => {
  it('proxima coleta: antes e depois das 06:00, virada de dia e fuso', () => {
    expect(isoLocal(proximaColeta(t('2026-10-09T05:59:59-03:00')))).toBe(
      '2026-10-09T06:00:00-03:00',
    )
    expect(isoLocal(proximaColeta(t('2026-10-09T06:00:00-03:00')))).toBe(
      '2026-10-10T06:00:00-03:00',
    )
    expect(isoLocal(proximaColeta(t('2026-10-09T23:30:00-03:00')))).toBe(
      '2026-10-10T06:00:00-03:00',
    )
    expect(isoLocal(proximaColeta(t('2026-10-10T01:00:00Z')))).toBe('2026-10-10T06:00:00-03:00')
  })
  it('selos e precedência', () => {
    const ok = ev('2026-10-08'),
      falha = ev('2026-10-09', 'falha'),
      parc = ev('2026-10-09', 'parcial')
    expect(seloFrescor(null, null, 0)).toBe('sem-coleta')
    expect(seloFrescor(null, parc, 0)).toBe('sem-coleta')
    expect(seloFrescor(ok, falha, t('2026-10-09T18:00:00-03:00'))).toBe('falha')
    expect(seloFrescor(null, falha, 0)).toBe('falha')
    expect(seloFrescor(ok, ok, t('2026-10-09T05:00:00-03:00'))).toBe('atual')
    expect(seloFrescor(ok, ok, t('2026-10-09T06:00:00-03:00'))).toBe('atual')
    expect(seloFrescor(ok, ok, t('2026-10-09T06:00:01-03:00'))).toBe('atrasado')
  })
  it('propriedade: selo é total', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 2_000_000_000 }).map((x) => x * 1000),
        fc.constantFrom<EventoColeta['resultado'] | null>('ok', 'parcial', 'falha', null),
        (agora, r) => {
          const e = r ? ev('2026-01-01', r) : null
          expect(['atual', 'atrasado', 'falha', 'sem-coleta']).toContain(
            seloFrescor(r === 'ok' ? e : null, e, agora),
          )
        },
      ),
    )
  })
})

describe('montarEstadoColeta e paginarColetas', () => {
  const agora = t('2026-10-09T18:00:00-03:00')
  it('sem eventos', () => {
    const e = montarEstadoColeta('acelerato', [], [], agora)
    expect(estadoColetaSchema.parse(e)).toMatchObject({
      selo: 'sem-coleta',
      horasDesdeUltimaOk: null,
      ultimaOk: null,
      calibracao: [],
    })
  })
  it('falhas só dos últimos 14 dias, parcial conta, ordem recente primeiro', () => {
    const evs = [
      ev('2026-09-01', 'falha'),
      ev('2026-09-30'),
      ev('2026-10-05', 'parcial'),
      ev('2026-10-08'),
    ]
    const e = montarEstadoColeta('businessmap', evs, [], agora)
    expect(e.falhasRecentes.map((x) => x.id)).toEqual(['x-2026-10-05'])
    expect(e.ultimaOk?.id).toBe('x-2026-10-08')
    expect(e.horasDesdeUltimaOk).toBe(36)
    expect(e.selo).toBe('atrasado')
  })
  it('desempate por id e paginação', () => {
    const a = { ...ev('2026-10-01'), id: 'a' },
      b = { ...ev('2026-10-01'), id: 'b' }
    expect(paginarColetas([a, b, { ...a }], 1).itens.map((x) => x.id)).toEqual(['b', 'a', 'a'])
    const muitos = Array.from({ length: 45 }, (_, i) => ev(isoDeDia(20000 + i)))
    expect(paginarColetas(muitos, 3).itens).toHaveLength(5)
    expect(paginarColetas(muitos, 4).itens).toEqual([])
    expect(paginarColetas(muitos, 1)).toMatchObject({ porPagina: 20, total: 45 })
  })
  it('schemas recusam campo extra (pessoa)', () => {
    expect(eventoColetaSchema.safeParse({ ...ev('2026-10-01'), usuario: 'x' }).success).toBe(false)
  })
})
