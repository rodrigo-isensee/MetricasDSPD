import { describe, expect, it } from 'vitest'
import type { FiltrosFluxo, FiltrosSustentacao } from '@metricas-dspd/contratos'
import { SCHEMAS_RESULTADO } from '@metricas-dspd/contratos/validacao'
import { gerarBaseMock } from '@metricas-dspd/mock'
import { acelerato, businessmap, calcularMetrica, CALENDARIO_PADRAO } from '.'
import type { ContextosMetricas } from './calcular'
import { diaDeIso, instanteDeIso, isoDeDia } from './core/calendario'
import { mesesFechados } from './core/series'
import { umaBase, trilhaSimples, type EspecCard } from './businessmap/testing'

/**
 * Tendência mensal (ADR 0019): cada ponto é a métrica de origem (O3, S2) no fim do mês, com 12 semanas.
 * Bordas: 19/20 itens, mês vazio, mês em curso fora, arquivados contam, ordem de entrada neutra,
 * nenhuma leitura da outra fonte, equivalência com a métrica de origem (propriedade sobre bases geradas).
 */
const FB: FiltrosFluxo = { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12s' } }
const FS: FiltrosSustentacao = { equipe: [], prioridade: [], periodo: { tipo: '12s' } }
const fim = (dia: string) => `${dia}T23:59:59-03:00`

/* ---------------- BusinessMap ---------------- */
const D0 = diaDeIso('2026-08-03') // segunda-feira
const util = (k: number) => isoDeDia(D0 + k + 2 * Math.floor(k / 5))
const em = (k: number, h: string) => `${util(k)}T${h}-03:00`
const entregue = (id: string, k: number): EspecCard => ({
  id,
  criado: em(k, '08:00'),
  trilha: trilhaSimples(em(k, '08:00'), em(k, '09:00'), em(k, '10:00'), em(k, '16:00')),
})
const entregues = (n: number) => Array.from({ length: n }, (_, i) => entregue(`c${i}`, i))
const ctxBM = (base: ReturnType<typeof umaBase>, hoje: string) =>
  businessmap.criarContextoBM(base, hoje, CALENDARIO_PADRAO)
const mes = (r: ReturnType<typeof businessmap.calcularTendenciaFluxo>, m: string) =>
  r.meses.find((x) => x.mes === m)!

describe('meses fechados', () => {
  const dia = (iso: string) => diaDeIso(iso)
  const chaves = (iso: string) => mesesFechados(dia(iso), 6).map((b) => b.chave)
  it('o mês em curso fica fora; no último dia do mês ele já está fechado', () => {
    expect(chaves('2026-10-09')).toEqual([
      '2026-04',
      '2026-05',
      '2026-06',
      '2026-07',
      '2026-08',
      '2026-09',
    ])
    expect(chaves('2026-09-30').at(-1)).toBe('2026-09')
    expect(chaves('2026-10-01').at(-1)).toBe('2026-09')
    expect(chaves('2026-10-31').at(-1)).toBe('2026-10')
    expect(chaves('2026-03-15')).toEqual([
      '2025-09',
      '2025-10',
      '2025-11',
      '2025-12',
      '2026-01',
      '2026-02',
    ])
  })
})

describe('TENDENCIA_FLUXO', () => {
  it('20 itens na janela publicam; 19 não publicam valor (só n); mês sem itens conta 0', () => {
    const r20 = businessmap.calcularTendenciaFluxo(
      ctxBM(umaBase(entregues(20)), '2026-10-09T18:00:00-03:00'),
    )
    const ago = mes(r20, '2026-08')
    expect(ago.concluidos).toBe(20)
    expect(ago.fimDoMes).toBe('2026-08-31')
    expect(ago.janelaPercentis).toEqual({
      inicio: '2026-06-09',
      fim: '2026-08-31',
      unidade: 'semanas',
      quantidade: 12,
    })
    const mel = ago.p85PorTipo.find((c) => c.tipo === 'Melhoria')!
    expect(mel.estatistica.status).toBe('ok')
    expect(mel.n).toBe(20)
    if (mel.estatistica.status === 'ok') {
      expect(Object.keys(mel.estatistica.valor).sort()).toEqual(['p50', 'p85'])
    }
    expect(mes(r20, '2026-09').concluidos).toBe(0)
    expect(mes(r20, '2026-04').concluidos).toBe(0)

    const r19 = businessmap.calcularTendenciaFluxo(
      ctxBM(umaBase(entregues(19)), '2026-10-09T18:00:00-03:00'),
    )
    const mel19 = mes(r19, '2026-08').p85PorTipo.find((c) => c.tipo === 'Melhoria')!
    expect(mel19.estatistica).toMatchObject({ status: 'insuficiente', n: 19, minimo: 20 })
    expect('valor' in mel19.estatistica).toBe(false)
    expect(mes(r19, '2026-08').concluidos).toBe(19)
    expect(r19.base).toMatchObject({ n: 19, unidade: 'itens concluídos' })
  })

  it('o mês em curso nunca entra; o último dia do mês fecha o mês', () => {
    const base = umaBase(entregues(20))
    expect(
      businessmap.calcularTendenciaFluxo(ctxBM(base, '2026-08-20T18:00:00-03:00')).meses.at(-1)
        ?.mes,
    ).toBe('2026-07')
    expect(
      businessmap.calcularTendenciaFluxo(ctxBM(base, '2026-08-31T18:00:00-03:00')).meses.at(-1)
        ?.mes,
    ).toBe('2026-08')
    expect(
      businessmap.calcularTendenciaFluxo(ctxBM(base, '2026-09-01T08:00:00-03:00')).meses.at(-1)
        ?.mes,
    ).toBe('2026-08')
  })

  it('arquivado entregue conta; subtarefa e descartado ficam fora, como no O3', () => {
    const especs = [...entregues(20), { ...entregue('d', 1), descarte: em(2, '09:00') }]
    const base = umaBase(especs)
    base.cards = base.cards.map((c) =>
      c.card_id === 'c3'
        ? { ...c, arquivado_em: instanteDeIso(em(8, '09:00'), CALENDARIO_PADRAO) }
        : c,
    )
    const r = businessmap.calcularTendenciaFluxo(ctxBM(base, '2026-10-09T18:00:00-03:00'))
    expect(mes(r, '2026-08').concluidos).toBe(20)
    expect(mes(r, '2026-08').p85PorTipo.find((c) => c.tipo === 'Melhoria')?.n).toBe(20)
  })

  it('a saída não depende da ordem de entrada', () => {
    const base = umaBase(entregues(25))
    const inv = {
      ...base,
      cards: [...base.cards].reverse(),
      transicoes: [...base.transicoes].reverse(),
    }
    const h = '2026-10-09T18:00:00-03:00'
    expect(businessmap.calcularTendenciaFluxo(ctxBM(inv, h))).toEqual(
      businessmap.calcularTendenciaFluxo(ctxBM(base, h)),
    )
  })

  it('mudança de critério dentro do intervalo aparece em criterios', () => {
    const base = umaBase(entregues(20))
    base.config.criterios = [
      {
        id: 'v2',
        data: '2026-07-01',
        descricao: 'novo critério',
        afeta: ['TENDENCIA_FLUXO'],
      },
    ]
    const r = businessmap.calcularTendenciaFluxo(ctxBM(base, '2026-10-09T18:00:00-03:00'))
    expect(r.criterios.serie.map((m) => m.id)).toEqual(['v2'])
    expect(r.criterios.janela.map((m) => m.id)).toEqual(['v2'])
    expect(r.base.janela).toEqual({ inicio: '2026-04-01', fim: '2026-09-30' })
  })
})

/* ---------------- Acelerato ---------------- */
const t = (iso: string) => instanteDeIso(iso, CALENDARIO_PADRAO)
function chamado(
  i: number,
  aberto: string,
  extra: Partial<acelerato.Chamado> = {},
): acelerato.Chamado {
  return {
    chamado_id: `A${i}`,
    organizacao: 'DSPD Sustentação',
    tipo_fila: 'DSPD - SSSC',
    equipe: 'SSSC TOTVS',
    natureza: 'incidente',
    categoria_sistema: 'Protheus - Financeiro',
    excluido: false,
    status: 'Concluído',
    impacto: 'Alto',
    urgencia: 'Baixa',
    prioridade: 'P3',
    prioridade_ajustada_manualmente: false,
    justificativa_ajuste: null,
    aberto_em: t(`${aberto}T09:00-03:00`),
    primeiro_atendimento_em: t(`${aberto}T09:30-03:00`),
    restaurado_em: t(`${aberto}T11:00-03:00`),
    data_finalizado: t(`${aberto}T11:00-03:00`),
    status_sla_r: 'REALIZADO_NO_PRAZO',
    status_sla_pa: 'NO_PRAZO',
    motivo_escalacao: null,
    motivo_pendencia_atual: null,
    previsao_retorno: null,
    motivo_encerramento: 'Resolução definitiva',
    avaliacao_problema: null,
    excecao_sla_registro_posterior: false,
    incidente_critico_coordenado: false,
    nivel_resolucao: 'N1',
    ...extra,
  }
}
const baseAC = (chamados: acelerato.Chamado[]): acelerato.BaseAC => ({
  chamados,
  etapas: [],
  config: { alvos: acelerato.ALVOS_PADRAO, criterios: [] },
})
const chamados = (n: number, aberto: string, extra: Partial<acelerato.Chamado> = {}) =>
  Array.from({ length: n }, (_, i) => chamado(i, aberto, extra))
const ctxAC = (base: acelerato.BaseAC, hoje: string) =>
  acelerato.criarContextoAC(base, hoje, CALENDARIO_PADRAO)
const H = '2026-10-09T18:00:00-03:00'
const prio = (r: ReturnType<typeof acelerato.calcularTendenciaSust>, m: string, p: string) =>
  r.meses.find((x) => x.mes === m)!.prioridades.find((x) => x.prioridade === p)!

describe('TENDENCIA_SUST', () => {
  it('20 chamados na janela publicam a aderência; 19 ficam k de n; volume é do mês de abertura', () => {
    const r20 = acelerato.calcularTendenciaSust(ctxAC(baseAC(chamados(20, '2026-08-12')), H))
    expect(prio(r20, '2026-08', 'P3').restauracao.taxa).toEqual({
      status: 'ok',
      k: 20,
      n: 20,
      pct: 100,
    })
    expect(r20.meses.find((m) => m.mes === '2026-08')).toMatchObject({
      fimDoMes: '2026-08-31',
      volume: 20,
      janela: { inicio: '2026-06-09', fim: '2026-08-31', unidade: 'semanas', quantidade: 12 },
    })
    expect(r20.meses.find((m) => m.mes === '2026-09')?.volume).toBe(0)
    expect(prio(r20, '2026-04', 'P3').restauracao.taxa.status).toBe('insuficiente')
    const r19 = acelerato.calcularTendenciaSust(ctxAC(baseAC(chamados(19, '2026-08-12')), H))
    expect(prio(r19, '2026-08', 'P3').restauracao.taxa).toEqual({
      status: 'insuficiente',
      k: 19,
      n: 19,
      minimo: 20,
    })
    expect(r19.base).toMatchObject({ n: 19, unidade: 'chamados abertos' })
  })

  it('o volume usa a data de abertura, não a de fechamento; excluídos ficam fora', () => {
    const cs = [
      ...chamados(3, '2026-07-30', { data_finalizado: t('2026-08-03T10:00-03:00') }),
      { ...chamado(90, '2026-08-05'), excluido: true },
    ]
    const r = acelerato.calcularTendenciaSust(ctxAC(baseAC(cs), H))
    expect(r.meses.find((m) => m.mes === '2026-07')?.volume).toBe(3)
    expect(r.meses.find((m) => m.mes === '2026-08')?.volume).toBe(0)
  })

  it('mês em curso fora, ordem neutra e critério marcado', () => {
    const cs = chamados(25, '2026-08-12')
    const base = baseAC(cs)
    base.config.criterios = [
      { id: 'v9', data: '2026-06-15', descricao: 'critério', afeta: ['TENDENCIA_SUST'] },
    ]
    const r = acelerato.calcularTendenciaSust(ctxAC(base, H))
    expect(r.meses.at(-1)?.mes).toBe('2026-09')
    expect(r.criterios.serie.map((m) => m.id)).toEqual(['v9'])
    const inv = { ...base, chamados: [...cs].reverse() }
    expect(acelerato.calcularTendenciaSust(ctxAC(inv, H))).toEqual(r)
    expect(
      acelerato.calcularTendenciaSust(ctxAC(base, '2026-08-31T20:00:00-03:00')).meses.at(-1)?.mes,
    ).toBe('2026-08')
  })
})

describe('S3.janela', () => {
  const p = (n: number, prioridade: 'P1' | 'P2' | 'P3', dia: string) =>
    Array.from({ length: n }, (_, i) =>
      chamado(i + (prioridade === 'P3' ? 100 : 0), dia, { prioridade }),
    )
  it('p1p2 é k de n, com percentual só a partir de 20 chamados na janela', () => {
    const ok = acelerato.calcularS3(
      ctxAC(baseAC([...p(5, 'P1', '2026-09-10'), ...p(15, 'P3', '2026-09-11')]), H),
      FS,
    )
    expect(ok.janela).toEqual({
      total: 20,
      p1p2: { status: 'ok', k: 5, n: 20, pct: 25 },
    })
    const pouco = acelerato.calcularS3(
      ctxAC(baseAC([...p(5, 'P2', '2026-09-10'), ...p(14, 'P3', '2026-09-11')]), H),
      FS,
    )
    expect(pouco.janela.p1p2).toEqual({ status: 'insuficiente', k: 5, n: 19, minimo: 20 })
  })
  it('a janela é o período inteiro (não a soma de meses) e respeita período custom', () => {
    const base = baseAC([...p(20, 'P1', '2026-09-10'), ...p(3, 'P3', '2026-07-20')])
    const custom = acelerato.calcularS3(ctxAC(base, H), {
      ...FS,
      periodo: { tipo: 'custom', de: '2026-07-15', ate: '2026-07-31' },
    })
    expect(custom.janela.total).toBe(3)
    expect(custom.janela.p1p2).toMatchObject({ status: 'insuficiente', k: 0, n: 3 })
    const dozeSemanas = acelerato.calcularS3(ctxAC(base, H), FS)
    expect(dozeSemanas.janela.total).toBe(23)
  })
})

/* ---------------- Equivalência com a métrica de origem e isolamento ---------------- */
const CENARIOS = [
  gerarBaseMock({ escala: 0.4 }),
  gerarBaseMock({ escala: 0.15, semente: 9, hoje: '2026-05-15T18:00:00-03:00' }),
  gerarBaseMock({ escala: 0.15, semente: 3, hoje: '2026-06-30T18:00:00-03:00' }),
]

describe.each(CENARIOS.map((b, i) => [i, b] as const))('equivalência (cenário %i)', (_i, b) => {
  const bm = ctxBM(b.bm, b.config.hoje)
  const ac = ctxAC(b.ac, b.config.hoje)

  it('cada ponto de fluxo é o O3 no fim do mês (contexto recriado), sem cálculo próprio', () => {
    const r = businessmap.calcularTendenciaFluxo(bm)
    expect(r.meses.length).toBe(6)
    for (const m of r.meses) {
      const o3 = businessmap.calcularO3(ctxBM(b.bm, fim(m.fimDoMes)), FB)
      expect(m.janelaPercentis).toEqual(o3.janelaPercentis)
      expect(m.p85PorTipo).toEqual(
        o3.classes.map((c) => ({
          tipo: c.tipo,
          n: c.n,
          estatistica:
            c.estatistica.status === 'ok'
              ? {
                  ...c.estatistica,
                  valor: { p50: c.estatistica.valor.p50, p85: c.estatistica.valor.p85 },
                }
              : c.estatistica,
        })),
      )
      const contagem = bm.idx.marcos.filter(
        (x) =>
          x.ativo &&
          x.card.granularidade === 'story' &&
          x.card.tipo !== 'Bug interno' &&
          x.entrega !== null &&
          isoDeDia(
            Math.floor((x.entrega + CALENDARIO_PADRAO.offsetMinutos * 60_000) / 86_400_000),
          ).startsWith(m.mes),
      ).length
      expect(m.concluidos).toBe(contagem)
    }
    expect(SCHEMAS_RESULTADO.TENDENCIA_FLUXO.safeParse(r).success).toBe(true)
  })

  it('cada ponto de sustentação é o S2 no fim do mês (contexto recriado e reindexado)', () => {
    const r = acelerato.calcularTendenciaSust(ac)
    for (const m of r.meses) {
      const s2 = acelerato.calcularS2(ctxAC(b.ac, fim(m.fimDoMes)), FS)
      expect(m.prioridades).toEqual(s2.prioridades)
    }
    expect(SCHEMAS_RESULTADO.TENDENCIA_SUST.safeParse(r).success).toBe(true)
  })

  it('cada fonte ignora a outra: contexto vazio do outro lado não muda o resultado', () => {
    const vazioBM = ctxBM(umaBase([]), b.config.hoje)
    const vazioAC = ctxAC(baseAC([]), b.config.hoje)
    const cheio: ContextosMetricas = { bm, ac }
    expect(calcularMetrica('TENDENCIA_FLUXO', {}, { bm, ac: vazioAC })).toEqual(
      calcularMetrica('TENDENCIA_FLUXO', {}, cheio),
    )
    expect(calcularMetrica('TENDENCIA_SUST', {}, { bm: vazioBM, ac })).toEqual(
      calcularMetrica('TENDENCIA_SUST', {}, cheio),
    )
  })

  it('o ponto de um mês fechado não muda com a data de corte posterior', () => {
    const depoisIso = `${isoDeDia(bm.hojeDia + 35)}T18:00:00-03:00`
    const antes = businessmap.calcularTendenciaFluxo(bm)
    const depois = businessmap.calcularTendenciaFluxo(ctxBM(b.bm, depoisIso))
    const comuns = antes.meses.filter((m) => depois.meses.some((x) => x.mes === m.mes))
    expect(comuns.length).toBeGreaterThanOrEqual(4)
    for (const m of comuns) expect(depois.meses.find((x) => x.mes === m.mes)).toEqual(m)
    const antesAC = acelerato.calcularTendenciaSust(ac)
    const depoisAC = acelerato.calcularTendenciaSust(ctxAC(b.ac, depoisIso))
    for (const m of antesAC.meses.filter((x) => depoisAC.meses.some((y) => y.mes === x.mes)))
      expect(depoisAC.meses.find((x) => x.mes === m.mes)).toEqual(m)
  })
})
