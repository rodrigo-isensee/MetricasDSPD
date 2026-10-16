import { describe, expect, it } from 'vitest'
import { METRICA_IDS, fonteDaMetrica, type FiltrosFluxo } from '@metricas-dspd/contratos'
import { CALENDARIO_PADRAO, diaDeIso, isoDeDia } from '../core/calendario'
import {
  LIMITE_PARADO_DIAS_UTEIS,
  NASCIDAS_DEPOIS_DO_DESCARTE_NATIVO,
  VERSAO_CRITERIO_DESCARTE_NATIVO,
  VERSAO_CRITERIO_EXCLUIDO_ENTREGUE,
  VERSAO_CRITERIO_PARADOS_V1,
  marcacoesNoPeriodo,
} from '../core/criterios'
import { gerarBaseMock } from '@metricas-dspd/mock'
import { calcularO2 } from './index'
import { criarContextoBM } from './indice'
import { HOJE_TESTE, umaBase, type EspecCard } from './testing'

const F: FiltrosFluxo = { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12s' } }
const D0 = diaDeIso('2026-08-03') // segunda-feira
const util = (k: number) => isoDeDia(D0 + k + 2 * Math.floor(k / 5))
const em = (k: number, hora: string) => `${util(k)}T${hora}-03:00`
const emAndamento = (id: string, k: number): EspecCard => ({
  id,
  criado: em(k, '08:00'),
  trilha: [
    ['Aguardando priorização', em(k, '08:00')],
    ['Em desenvolvimento', em(k, '09:00')],
  ],
})

describe('O23: estoque parado dentro do WIP (bloco parados do O2)', () => {
  it('a constante é única e a versão v1 está registrada para o O2', () => {
    expect(LIMITE_PARADO_DIAS_UTEIS).toBe(5)
    expect(VERSAO_CRITERIO_PARADOS_V1.afeta).toContain('O2')
  })

  it('a v1 vira marcação do O2 quando o período a cruza, sem depender da lista da base nem repetir id', () => {
    const periodo = { inicio: '2026-10-01', fim: '2026-10-14' }
    const esperado = [
      {
        id: VERSAO_CRITERIO_PARADOS_V1.id,
        data: VERSAO_CRITERIO_PARADOS_V1.data,
        descricao: VERSAO_CRITERIO_PARADOS_V1.descricao,
      },
    ]
    expect(marcacoesNoPeriodo('O2', periodo, [])).toEqual(esperado)
    expect(marcacoesNoPeriodo('O2', periodo, [VERSAO_CRITERIO_PARADOS_V1])).toEqual(esperado)
    expect(marcacoesNoPeriodo('S1', periodo, [])).toEqual([])
    expect(marcacoesNoPeriodo('O2', { inicio: '2026-09-01', fim: '2026-09-30' }, [])).toEqual([])
  })

  it('P-1 = A: a versão do descarte nativo marca as métricas do BusinessMap que usam "descartado", só a partir de 2026-10-15', () => {
    expect(VERSAO_CRITERIO_DESCARTE_NATIVO.data).toBe('2026-10-15')
    expect(VERSAO_CRITERIO_DESCARTE_NATIVO.afeta).toEqual(
      expect.arrayContaining(['O1', 'O2', 'O25', 'T12', 'E9']),
    )
    expect(VERSAO_CRITERIO_DESCARTE_NATIVO.afeta).not.toContain('S1')
    // B11a-7: o `afeta` acompanha o catálogo (toda id BusinessMap, menos as nascidas depois, nominais)
    const doBusinessMap = METRICA_IDS.filter((id) => fonteDaMetrica(id) === 'businessmap')
    expect(VERSAO_CRITERIO_DESCARTE_NATIVO.afeta).toEqual(
      doBusinessMap.filter((id) => !NASCIDAS_DEPOIS_DO_DESCARTE_NATIVO.includes(id)),
    )
    expect(VERSAO_CRITERIO_DESCARTE_NATIVO.afeta).toHaveLength(45)
    expect(NASCIDAS_DEPOIS_DO_DESCARTE_NATIVO.every((id) => doBusinessMap.includes(id))).toBe(true)
    const nova = { inicio: '2026-10-14', fim: '2026-10-15' }
    expect(marcacoesNoPeriodo('O25', nova, []).map((m) => m.id)).toEqual([
      VERSAO_CRITERIO_DESCARTE_NATIVO.id,
    ])
    expect(marcacoesNoPeriodo('O25', { inicio: '2026-10-01', fim: '2026-10-14' }, [])).toEqual([])
    expect(marcacoesNoPeriodo('S1', nova, [])).toEqual([])
  })

  it('B11b: o T11 nasceu depois do descarte nativo e sai do `afeta` das duas versões que compartilham a lista, com a lista nominal', () => {
    // T11 (B11b) e as quatro da fase 2 do E1 (O22, O26, T13, E6) nasceram depois do descarte nativo
    expect(NASCIDAS_DEPOIS_DO_DESCARTE_NATIVO).toEqual(['T11', 'O22', 'O26', 'T13', 'E6'])
    expect(fonteDaMetrica('T11')).toBe('businessmap')
    expect(METRICA_IDS).toContain('T11')
    for (const v of [VERSAO_CRITERIO_DESCARTE_NATIVO, VERSAO_CRITERIO_EXCLUIDO_ENTREGUE]) {
      expect(v.afeta).not.toContain('T11')
      expect(v.afeta).toHaveLength(45)
    }
    // sem T11 na lista nominal ele entraria: o teste de igualdade acima é a trava
    const semNominal = METRICA_IDS.filter((id) => fonteDaMetrica(id) === 'businessmap')
    expect(semNominal).toHaveLength(50)
    for (const id of NASCIDAS_DEPOIS_DO_DESCARTE_NATIVO)
      expect(marcacoesNoPeriodo(id, { inicio: '2026-10-01', fim: '2026-10-16' }, []), id).toEqual(
        [],
      )
  })

  it('abaixo de 20 itens devolve "k de n" sem percentual; só mudança de coluna conta como mover', () => {
    const base = umaBase([emAndamento('A', 0), emAndamento('B', 48), emAndamento('C', 49)])
    const r = calcularO2(criarContextoBM(base, HOJE_TESTE, CALENDARIO_PADRAO), F)
    const velhos = r.itens.filter((i) => i.semMoverHaDiasUteis > LIMITE_PARADO_DIAS_UTEIS).length
    expect(r.parados.limiteDiasUteis).toBe(5)
    expect(r.parados.taxa).toEqual({ status: 'insuficiente', k: velhos, n: 3, minimo: 20 })
    expect(velhos).toBeGreaterThan(0)
    expect(velhos).toBeLessThan(3)
    expect(r.parados.porEtapa.reduce((s, e) => s + e.k, 0)).toBe(velhos)
    expect(r.parados.porEtapa.map((e) => e.etapa)).toEqual(r.etapas)
  })

  it('com 20 itens ou mais publica a taxa; quebra por coluna com uma equipe', () => {
    const cards = Array.from({ length: 20 }, (_, i) => emAndamento(`W${i}`, i < 5 ? 0 : 49))
    const base = umaBase(cards)
    const r = calcularO2(criarContextoBM(base, HOJE_TESTE, CALENDARIO_PADRAO), F)
    expect(r.parados.taxa).toMatchObject({ status: 'ok', k: 5, n: 20, pct: 25 })
    base.colunas = base.colunas.map((c) => ({ ...c, quadro_id: 'quadro-equipe-a' }))
    const um = calcularO2(criarContextoBM(base, HOJE_TESTE, CALENDARIO_PADRAO), {
      ...F,
      equipe: ['equipe-a'],
    })
    expect(um.parados.porEtapa.find((e) => e.etapa === 'Em desenvolvimento')?.k).toBe(5)
    expect(um.parados.porEtapa.reduce((t, e) => t + e.k, 0)).toBe(5)
  })

  it('sem itens em andamento: 0 de 0', () => {
    const r = calcularO2(criarContextoBM(umaBase([]), HOJE_TESTE, CALENDARIO_PADRAO), F)
    expect(r.parados.taxa).toEqual({ status: 'insuficiente', k: 0, n: 0, minimo: 20 })
  })
})

describe('O23 na base do mock (B11a: alvo da especificação de UX, 20 a 30%)', () => {
  const base = gerarBaseMock()
  const ctx = criarContextoBM(base.bm, base.config.hoje, CALENDARIO_PADRAO)

  it('Todas, 12 semanas: com 20 itens ou mais o percentual é publicado e fica entre 20% e 30%', () => {
    const r = calcularO2(ctx, F)
    const taxa = r.parados.taxa
    expect(taxa.status).toBe('ok')
    if (taxa.status !== 'ok') return
    expect(taxa.n).toBeGreaterThanOrEqual(20)
    expect(taxa.pct).toBeGreaterThanOrEqual(20)
    expect(taxa.pct).toBeLessThanOrEqual(30)
    expect(r.parados.porEtapa.reduce((s, e) => s + e.k, 0)).toBe(taxa.k)
  })
})
