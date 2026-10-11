import { describe, expect, it } from 'vitest'
import type { FiltrosFluxo, FiltrosSustentacao } from '@metricas-dspd/contratos'
import { SCHEMAS_RESULTADO } from '@metricas-dspd/contratos/validacao'
import { gerarBaseMock, gerarExtensoesMock } from '@metricas-dspd/mock'
import { acelerato, businessmap, calcularMetrica, type ContextosMetricas } from '.'
import { CALENDARIO_PADRAO } from './core/calendario'
import type { FatoBloqueio } from './businessmap/modelo'
import { HOJE_TESTE, umaBase, type EspecCard } from './businessmap/testing'
import { EXTENSAO_AC_VAZIA } from './acelerato/extensao'

const F: FiltrosFluxo = { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12s' } }
const FS: FiltrosSustentacao = { equipe: [], prioridade: [], periodo: { tipo: '12m' } }
const base = gerarBaseMock({ escala: 0.5 })
const ext = gerarExtensoesMock(base)
const ctxMock: ContextosMetricas = {
  bm: businessmap.criarContextoBM(base.bm, base.config.hoje, CALENDARIO_PADRAO),
  ac: acelerato.criarContextoAC(base.ac, base.config.hoje, CALENDARIO_PADRAO),
  ext,
}
const ctxSemExt: ContextosMetricas = { bm: ctxMock.bm, ac: ctxMock.ac }
const bmDe = (e: EspecCard[], bl: FatoBloqueio[] = []) =>
  businessmap.criarContextoBM(umaBase(e, bl), HOJE_TESTE, CALENDARIO_PADRAO)

/** n cards 'Padrão' entregues em setembro; `longos` deles levam ~3 semanas. */
const cards = (n: number, longos: number, extra: Partial<EspecCard> = {}): EspecCard[] =>
  Array.from({ length: n }, (_, i) => ({
    id: `C${i}`,
    criado: '2026-09-01T09:00-03:00',
    trilha: [
      ['Aguardando priorização', '2026-09-01T09:00-03:00'],
      ['Pronto para desenvolver', '2026-09-01T10:00-03:00'],
      ['Em desenvolvimento', '2026-09-02T08:00-03:00'],
      ['Aguardando revisão', '2026-09-02T13:00-03:00'],
      ['Em revisão', '2026-09-03T08:00-03:00'],
      ['Entregue', i < longos ? '2026-09-25T12:00-03:00' : '2026-09-03T12:00-03:00'],
    ],
    ...extra,
  }))

describe('métricas complementares: contratos e regras comuns', () => {
  it('todas as 17 respeitam o schema com e sem extensão (sem ext: vazio ou insuficiente, nunca erro)', () => {
    const ids = [
      'O5',
      'O6',
      'O8',
      'O11',
      'O13',
      'O14',
      'O16',
      'O17',
      'T6',
      'T8',
      'E4',
      'E5',
      'S8',
      'S9',
      'S10',
      'S11',
      'S12',
    ] as const
    for (const id of ids)
      for (const ctx of [ctxMock, ctxSemExt]) {
        const f = id.startsWith('S') || id === 'O17' ? FS : F
        const r = calcularMetrica(id, f as never, ctx)
        expect(SCHEMAS_RESULTADO[id].safeParse(r).success, id).toBe(true)
      }
  })

  it('sem extensão: nada é publicado como 0% (S8, S11, S12 insuficientes; O17 e E4 sem partes)', () => {
    const t8 = calcularMetrica('T8', F, ctxSemExt)
    expect(t8.sprints).toEqual([])
    const o17 = calcularMetrica('O17', FS, ctxSemExt)
    expect(o17.campoDisponivel).toBe(false)
    expect(o17.porCausa).toEqual([])
    const e4 = calcularMetrica('E4', F, ctxSemExt)
    expect(e4.campoDisponivel).toBe(false)
    expect(e4.trimestres.every((t) => t.iniciadosPorNatureza.length === 0)).toBe(true)
    const s8 = calcularMetrica('S8', FS, ctxSemExt)
    expect(s8.campoDisponivel).toBe(false)
    expect(s8.total.status).toBe('insuficiente')
    expect(s8.statusMeta).toBe('sem-referencia')
    expect(s8.meses.every((m) => m.reabertos === 0 && m.taxa.status === 'insuficiente')).toBe(true)
    expect(s8.cobertura.n).toBe(0)
    const s11 = calcularMetrica('S11', FS, ctxSemExt)
    expect(s11.campoDisponivel).toBe(false)
    expect(s11.conversao.status).toBe('insuficiente')
    const s12 = calcularMetrica('S12', FS, ctxSemExt)
    expect(s12.campoDisponivel).toBe(false)
    expect(s12.reincidencia.every((x) => x.proporcao.status === 'insuficiente')).toBe(true)
  })

  it('com extensão: campoDisponivel é true e a causa raiz vem do domínio fechado', () => {
    for (const id of ['S8', 'S11', 'S12', 'O17'] as const)
      expect(calcularMetrica(id, FS, ctxMock).campoDisponivel, id).toBe(true)
    expect(calcularMetrica('E4', F, ctxMock).campoDisponivel).toBe(true)
  })

  it('O17 (Sustentação): incidentes encerrados por causa raiz e por sistema', () => {
    const o17 = calcularMetrica('O17', FS, ctxMock)
    expect(o17.porCausa.some((c) => c.causa === 'Código')).toBe(true)
    expect(o17.porSistema.reduce((t, x) => t + x.n, 0)).toBe(o17.base.n)
    const total = o17.porCausa.reduce((t, x) => t + x.n, 0)
    expect(total).toBe(o17.base.n)
    const semCausa = calcularMetrica('O17', FS, {
      ...ctxMock,
      ext: { ...ext, ac: { ...ext.ac, causasRaiz: {} } },
    })
    expect(semCausa.porCausa.filter((c) => c.n > 0)).toEqual([
      { causa: 'Não informada', n: o17.base.n },
    ])
  })

  it('com extensão: os sprints trazem carry-over', () => {
    const t8 = calcularMetrica('T8', { ...F, periodo: { tipo: '6m' } }, ctxMock)
    expect(t8.sprints.length).toBeGreaterThan(5)
    for (const s of t8.sprints)
      expect(s.carryOver).toBe(s.comprometidos - s.entreguesDoComprometido)
    expect(t8.agregado.entreguePct.status).toBe('ok')
  })

  it('T8: filho ligado depois do início é entrada não planejada, separada do comprometido', () => {
    const pai = ext.bm.sprints.find((x) => x.sprint_id === 'SPR-20')
    expect(pai?.nome).toBe('Sprint 20')
    const t8 = calcularMetrica('T8', { ...F, periodo: { tipo: '6m' } }, ctxMock)
    for (const x of t8.sprints) expect(x.itens).toBe(x.comprometidos + x.entradaNaoPlanejada)
    expect(t8.sprints.some((x) => x.entradaNaoPlanejada > 0)).toBe(true)
  })

  it('T6 e E5: previsão determinística e ordenada p50 <= p85 <= p95', () => {
    const a = calcularMetrica('T6', F, ctxMock)
    expect(calcularMetrica('T6', F, ctxMock)).toEqual(a)
    for (const c of a.classes)
      for (const t of c.termino)
        if (t.previsao.status === 'ok') {
          const p = t.previsao.valor.periodos
          expect(p.p50).toBeLessThanOrEqual(p.p85)
          expect(p.p85).toBeLessThanOrEqual(p.p95)
        }
    expect(a.entradas.itens.length).toBeGreaterThan(0)
    const e5 = calcularMetrica('E5', F, ctxMock)
    expect(e5.projetos.every((p) => p.frentesRestantes > 0)).toBe(true)
  })
})

describe('O5 eficiência de fluxo', () => {
  it('separa execução, fila e bloqueio: a soma das horas é o ciclo', () => {
    const bloqueios: FatoBloqueio[] = Array.from({ length: 25 }, (_, i) => ({
      card_id: `C${i}`,
      motivo: 'Aguardando fornecedor',
      coluna_em_que_bloqueou: 'Em revisão',
      fornecedor: null,
      inicio: Date.parse('2026-09-03T08:00-03:00'),
      fim: Date.parse('2026-09-03T10:00-03:00'),
      duracao_horas_uteis: 2,
    }))
    const ctx = bmDe(cards(25, 0), bloqueios)
    const r = calcularMetrica('O5', F, { bm: ctx, ac: ctxMock.ac })
    const melhoria = r.tipos.find((t) => t.tipo === 'Melhoria')
    expect(melhoria?.estatistica.status).toBe('ok')
    if (melhoria?.estatistica.status !== 'ok') return
    const v = melhoria.estatistica.valor
    const ciclo = ctx.idx.marcosPorId.get('C0')?.cicloHU as number
    expect(v.horasExecucao + v.horasFila + v.horasBloqueio).toBeCloseTo(ciclo * 25, 0)
    expect(v.horasBloqueio).toBeGreaterThan(0)
    expect(v.horasFila).toBeGreaterThan(0)
    expect(v.agregadaPct).toBeLessThan(100)
  })

  it('abaixo de 20 itens não publica', () => {
    const r = calcularMetrica('O5', F, { bm: bmDe(cards(19, 0)), ac: ctxMock.ac })
    expect(r.tipos[0]?.estatistica.status).toBe('insuficiente')
  })
})

describe('O6 previsibilidade e O8 tamanho', () => {
  it('razão P85 ÷ P50 acima do alvo fica "fora"; curta fica "dentro"', () => {
    const longa = calcularMetrica('O6', F, { bm: bmDe(cards(25, 5)), ac: ctxMock.ac })
    expect(longa.classes[0]?.statusMeta).toBe('fora')
    const curta = calcularMetrica('O6', F, { bm: bmDe(cards(25, 0)), ac: ctxMock.ac })
    expect(curta.classes[0]?.statusMeta).toBe('dentro')
    const pouca = calcularMetrica('O6', F, { bm: bmDe(cards(5, 0)), ac: ctxMock.ac })
    expect(pouca.classes[0]?.statusMeta).toBe('sem-referencia')
  })

  it('O8: sem tamanho declarado cai em "Sem tamanho"; nunca média isolada', () => {
    const r = calcularMetrica('O8', F, { bm: bmDe(cards(25, 0)), ac: ctxMock.ac })
    const t = r.tipos[0]
    expect(t?.porTamanho.map((x) => x.tamanho)).toEqual(['Sem tamanho'])
    expect(t?.porTamanho[0]?.mediana).not.toBeNull()
    expect(t?.estatistica.status).toBe('ok')
    const peq = calcularMetrica('O8', F, { bm: bmDe(cards(5, 0)), ac: ctxMock.ac })
    expect(peq.tipos[0]?.porTamanho[0]?.mediana).toBeNull()
  })
})

describe('O11, O14 e O16', () => {
  it('O11: período sem fim de mês não tem retrato nem semanas de backlog pronto', () => {
    const r = calcularMetrica(
      'O11',
      { ...F, periodo: { tipo: 'custom', de: '2026-10-02', ate: '2026-10-05' } },
      { bm: bmDe(cards(3, 0)), ac: ctxMock.ac },
    )
    expect(r.meses).toEqual([])
    expect(r.semanasDeBacklogPronto).toBeNull()
    expect(r.base.n).toBe(0)
  })

  it('O11: card sem transição ainda não está em definição nem pronto', () => {
    const r = calcularMetrica(
      'O11',
      { ...F, periodo: { tipo: '12s' } },
      { bm: bmDe([{ id: 'X', criado: '2026-09-01T09:00-03:00', trilha: [] }]), ac: ctxMock.ac },
    )
    expect(r.meses.every((m) => m.definicao === 0 && m.prontos === 0)).toBe(true)
  })

  it('O14: top 10 e "Demais" agrupa o resto, sem pessoa', () => {
    const especs = Array.from({ length: 12 }, (_, i) => cards(1, 0, { area: `Área ${i}` })[0]).map(
      (c, i) => ({ ...(c as EspecCard), id: `A${i}` }),
    )
    const r = calcularMetrica('O14', F, { bm: bmDe(especs), ac: ctxMock.ac })
    expect(r.porArea.itens).toHaveLength(10)
    expect(r.porArea.demais?.entregues).toBe(2)
    expect(r.porSistema.demais).toBeNull()
  })

  it('O16: bug sem severidade vai para "Sem severidade" e a idade usa só o id do card', () => {
    const bugs = Array.from({ length: 2 }, (_, i) => ({
      id: `B${i}`,
      tipo: 'Bug interno' as const,
      criado: '2026-09-01T09:00-03:00',
      trilha: [['Aguardando priorização', '2026-09-01T09:00-03:00']] as [string, string][],
    }))
    const r = calcularMetrica('O16', F, { bm: bmDe(bugs), ac: ctxMock.ac })
    expect(r.abertosPorSeveridade.find((s) => s.severidade === 'Sem severidade')?.n).toBe(2)
    expect(r.maisAntigos.map((m) => m.cardId)).toEqual(['B0', 'B1'])
    expect(r.maisAntigos[0]?.idadeDiasUteis).toBeGreaterThan(0)
    expect(JSON.stringify(r)).not.toContain('Pessoa')
  })
})

describe('Sustentação: S8 e S9', () => {
  it('S8: taxa acima da meta fica "fora"; reincidente preenchido conta sem intervalo de dias', () => {
    const porCat = new Map<string, string>()
    const reabertoDe: Record<string, string> = {}
    const incidentes = [...base.ac.chamados]
      .filter((c) => c.natureza === 'incidente')
      .sort((a, b) => a.aberto_em - b.aberto_em)
    for (const c of incidentes) {
      const ant = porCat.get(c.categoria_sistema)
      if (ant) reabertoDe[c.chamado_id] = ant
      porCat.set(c.categoria_sistema, c.chamado_id)
    }
    const alta = calcularMetrica('S8', FS, {
      ...ctxMock,
      ext: { ...ext, ac: { ...ext.ac, reabertoDe } },
    })
    expect(alta.total.status).toBe('ok')
    expect(alta.statusMeta).toBe('fora')
    const normal = calcularMetrica('S8', FS, ctxMock)
    expect(normal.statusMeta).toBe('dentro')
    const nada = acelerato.calcularS8(ctxMock.ac, {
      ...FS,
      equipe: ['fluig'],
      periodo: { tipo: '4s' },
    })
    expect(nada.statusMeta).toBe('sem-referencia')
  })

  it('S8: conta o chamado reincidente no mês de abertura e expõe a cobertura "n de N"', () => {
    const incidentes = base.ac.chamados.filter((c) => c.natureza === 'incidente' && !c.excluido)
    const reabertoDe: Record<string, string> = {}
    const ausente: Record<string, true> = {}
    incidentes.forEach((c, i) => {
      if (i % 4 === 0) reabertoDe[c.chamado_id] = incidentes[0]!.chamado_id
      else if (i % 4 === 1) ausente[c.chamado_id] = true
    })
    const r = acelerato.calcularS8(ctxMock.ac, FS, {
      ...ext.ac,
      reabertoDe,
      reincidenteAusente: ausente,
    })
    const somaMeses = r.meses.reduce((t, m) => t + m.reabertos, 0)
    expect(r.campoDisponivel).toBe(true)
    expect(r.cobertura.total).toBe(r.meses.reduce((t, m) => t + m.encerrados, 0))
    expect(r.cobertura.n).toBeLessThan(r.cobertura.total)
    expect(r.cobertura.n).toBeGreaterThan(0)
    expect(somaMeses).toBeGreaterThan(0)
    expect(r.meses.every((m) => m.reabertos <= m.encerrados)).toBe(true)
    const cheia = acelerato.calcularS8(ctxMock.ac, FS, { ...ext.ac, reabertoDe: {} })
    expect(cheia.cobertura.n).toBe(cheia.cobertura.total)
  })

  it('S9: pendência sem motivo informado vira "Não informado"', () => {
    const ac = {
      ...base.ac,
      etapas: base.ac.etapas.map((e) =>
        e.etapa === 'Pendente' ? { ...e, motivo_pendencia: null } : e,
      ),
    }
    const ctx = acelerato.criarContextoAC(ac, base.config.hoje, CALENDARIO_PADRAO)
    const r = acelerato.calcularS9(ctx, FS)
    expect(r.porMotivo.map((m) => m.motivo)).toEqual(['Não informado'])
  })

  it('S9: cumprimento da previsão conta retornos até a data prevista', () => {
    const saidaPor = new Map<string, number>()
    for (const e of base.ac.etapas)
      if (e.etapa === 'Pendente' && e.saida !== null) saidaPor.set(e.chamado_id, e.saida)
    let i = 0
    const chamados = base.ac.chamados.map((c) => {
      const saida = saidaPor.get(c.chamado_id)
      if (saida === undefined) return c
      i++
      return { ...c, previsao_retorno: i % 2 === 0 ? saida + 1 : saida - 1 }
    })
    const ctx = acelerato.criarContextoAC(
      { ...base.ac, chamados },
      base.config.hoje,
      CALENDARIO_PADRAO,
    )
    const r = acelerato.calcularS9(ctx, FS)
    expect(r.cumprimentoPrevisao.n).toBeGreaterThan(20)
    expect(r.cumprimentoPrevisao.k).toBeGreaterThan(0)
    expect(r.cumprimentoPrevisao.k).toBeLessThan(r.cumprimentoPrevisao.n)
  })

  it('S12: sem reincidentes a contagem por sistema é zero; com eles a proporção aparece', () => {
    const vazia = acelerato.calcularS12(ctxMock.ac, FS, EXTENSAO_AC_VAZIA)
    expect(vazia.reincidencia.length).toBeGreaterThan(0)
    expect(vazia.reincidencia.every((x) => x.reincidentes === 0)).toBe(true)
    const todos = Object.fromEntries(base.ac.chamados.map((c) => [c.chamado_id, 'X']))
    const cheia = acelerato.calcularS12(ctxMock.ac, FS, { ...ext.ac, reabertoDe: todos })
    expect(cheia.parametros).toEqual({ janelaSemanas: 12 })
    for (const x of cheia.reincidencia) expect(x.reincidentes).toBe(x.chamados)
    expect(cheia.reincidencia.some((x) => x.proporcao.status === 'ok')).toBe(true)
  })
})
