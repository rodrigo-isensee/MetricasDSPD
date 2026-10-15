import { describe, expect, it } from 'vitest'
import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { SCHEMAS_RESULTADO } from '@metricas-dspd/contratos/validacao'
import { gerarBaseMock } from '@metricas-dspd/mock'
import { CALENDARIO_PADRAO } from '../core/calendario'
import { percentisDe } from '../core/estatistica'
import { amostraBM } from './amostra'
import { calcularE9 } from './index'
import { concluidosDeProjeto } from './e1'
import { faixaE9, FAIXA_E9_ACIMA } from './e9'
import { criarContextoBM } from './indice'
import { HOJE_TESTE, trilhaSimples, umaBase, type EspecCard } from './testing'

const F: FiltrosFluxo = { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12s' } }
const ctxDe = (cards: EspecCard[]) => criarContextoBM(umaBase(cards), HOJE_TESTE, CALENDARIO_PADRAO)

/** Projeto aprovado (criado) e parado na primeira coluna: nunca iniciou. */
const aguardando = (id: string, criado: string, extra: Partial<EspecCard> = {}): EspecCard => ({
  id,
  gran: 'projeto',
  criado,
  trilha: [['Aguardando priorização', criado]],
  ...extra,
})
/** Projeto concluído em 30/09 (dentro das 12 semanas até 09/10); o início vem `diasAte` dias depois da criação. */
const concluido = (id: string, inicio: string, extra: Partial<EspecCard> = {}): EspecCard => ({
  id,
  gran: 'projeto',
  criado: '2026-07-01T08:00:00-03:00',
  trilha: trilhaSimples(
    '2026-07-01T08:00:00-03:00',
    '2026-07-02T08:00:00-03:00',
    inicio,
    '2026-09-30T10:00:00-03:00',
  ),
  ...extra,
})
const concluidos = (n: number, extra: (i: number) => Partial<EspecCard> = () => ({})) =>
  Array.from({ length: n }, (_, i) => {
    const dia = String(2 + (i % 20)).padStart(2, '0')
    return concluido(`c${i}`, `2026-07-${dia}T09:00:00-03:00`, extra(i))
  })

describe('E9: projetos aguardando início', () => {
  it('lista só projeto aberto e não iniciado, com idade em dias úteis, faixa e do mais antigo para o mais novo', () => {
    const r = calcularE9(
      ctxDe([
        aguardando('P-novo', '2026-10-05T08:00:00-03:00'),
        aguardando('P-velho', '2026-01-05T08:00:00-03:00'),
        aguardando('P-descartado', '2026-02-02T08:00:00-03:00', {
          descarte: '2026-03-02T08:00:00-03:00',
        }),
        concluido('P-iniciado', '2026-08-05T09:00:00-03:00'),
        {
          id: 'S-story',
          criado: '2026-02-02T08:00:00-03:00',
          trilha: [['Aguardando priorização', '2026-02-02T08:00:00-03:00']],
        },
        { ...aguardando('F-frente', '2026-02-02T08:00:00-03:00'), gran: 'frente' },
      ]),
      F,
    )
    expect(r.projetos.map((p) => p.cardId)).toEqual(['P-velho', 'P-novo'])
    expect(r.projetos[0]).toMatchObject({
      codigo: 'P-velho',
      titulo: 'Card P-velho',
      criadoEm: '2026-01-05',
      faixa: FAIXA_E9_ACIMA,
    })
    expect(r.projetos[0]?.idadeDiasUteis).toBeGreaterThan(180)
    expect(r.projetos[1]?.faixa).toBe('0–30')
    expect(r.projetos[1]?.idadeDiasUteis).toBeGreaterThan(2)
    expect(r.projetos[1]?.idadeDiasUteis).toBeLessThan(6)
    expect(r.base).toMatchObject({ n: 2, unidade: 'projetos aguardando início' })
    expect(SCHEMAS_RESULTADO.E9.safeParse(r).success).toBe(true)
  })

  it('arquivado sem desfecho fica fora; os campos expostos não incluem pessoa', () => {
    const ctx = ctxDe([
      aguardando('P-1', '2026-09-01T08:00:00-03:00'),
      aguardando('P-2', '2026-09-01T08:00:00-03:00'),
    ])
    const comArquivado = criarContextoBM(
      {
        ...ctx.idx.base,
        cards: ctx.idx.base.cards.map((c) =>
          c.card_id === 'P-2' ? { ...c, arquivado_em: c.criado_em + 86_400_000 } : c,
        ),
      },
      HOJE_TESTE,
      CALENDARIO_PADRAO,
    )
    const r = calcularE9(comArquivado, F)
    expect(r.projetos.map((p) => p.cardId)).toEqual(['P-1'])
    expect(Object.keys(r.projetos[0] ?? {}).sort()).toEqual([
      'cardId',
      'codigo',
      'criadoEm',
      'faixa',
      'idadeDiasUteis',
      'tipo',
      'titulo',
    ])
  })

  it('faixas fixas 0–30, 31–90, 91–180 e mais de 180 (limites inclusivos)', () => {
    expect([0, 30, 30.5].map(faixaE9)).toEqual(['0–30', '0–30', '31–90'])
    expect([31, 90].map(faixaE9)).toEqual(['31–90', '31–90'])
    expect([91, 180].map(faixaE9)).toEqual(['91–180', '91–180'])
    expect([180.5, 181, 400].map(faixaE9)).toEqual([FAIXA_E9_ACIMA, FAIXA_E9_ACIMA, FAIXA_E9_ACIMA])
  })

  const ref = (r: ReturnType<typeof calcularE9>, tipo: string) =>
    r.referenciasP85.find((x) => x.tipo === tipo)?.referenciaP85

  it('com o E1 abaixo de 20 projetos concluídos no tipo não há referência (n e janela, sem P85)', () => {
    const r = calcularE9(
      ctxDe([aguardando('P-1', '2026-09-01T08:00:00-03:00'), ...concluidos(19)]),
      F,
    )
    expect(r.segmentoPor).toBe('tipo')
    expect(r.referenciasP85.map((x) => x.tipo)).toEqual(['Iniciativa', 'Melhoria'])
    expect(ref(r, 'Melhoria')).toMatchObject({ status: 'insuficiente', n: 19, minimo: 20 })
    expect(ref(r, 'Iniciativa')).toMatchObject({ status: 'insuficiente', n: 0, minimo: 20 })
    expect(JSON.stringify(r.referenciasP85)).not.toContain('p85')
  })

  it('com 20 concluídos do tipo a referência é o P85 do "antes do início" importado do E1', () => {
    const ctx = ctxDe([aguardando('P-1', '2026-09-01T08:00:00-03:00'), ...concluidos(20)])
    const r = calcularE9(ctx, F)
    const antes = concluidosDeProjeto(ctx, F).map((i) => i.antes)
    const esperado = percentisDe(
      amostraBM('projeto', antes, { inicio: '2026-07-17', fim: '2026-10-09' }),
    ).p85
    const m = ref(r, 'Melhoria')
    expect(m?.status).toBe('ok')
    if (m?.status === 'ok') {
      expect(m.n).toBe(20)
      expect(m.valor.p85).toBeCloseTo(esperado, 2)
      expect(m.valor.p85).toBeGreaterThan(0)
    }
    expect(ref(r, 'Iniciativa')).toMatchObject({ status: 'insuficiente', n: 0 })
    expect(SCHEMAS_RESULTADO.E9.safeParse(r).success).toBe(true)
  })

  it('Iniciativa e Melhoria nunca no mesmo P85: 12 + 12 concluídos não publicam, 20 + 5 publicam só um', () => {
    const tipado = (n: number, tipo: 'Iniciativa' | 'Melhoria', de: number) =>
      Array.from({ length: n }, (_, i) =>
        concluido(
          `${tipo}${de + i}`,
          `2026-07-${String(2 + ((de + i) % 20)).padStart(2, '0')}T09:00:00-03:00`,
          {
            tipo,
          },
        ),
      )
    const r1 = calcularE9(ctxDe([...tipado(12, 'Iniciativa', 0), ...tipado(12, 'Melhoria', 0)]), F)
    expect(ref(r1, 'Iniciativa')).toMatchObject({ status: 'insuficiente', n: 12 })
    expect(ref(r1, 'Melhoria')).toMatchObject({ status: 'insuficiente', n: 12 })
    const r2 = calcularE9(ctxDe([...tipado(20, 'Iniciativa', 0), ...tipado(5, 'Melhoria', 0)]), F)
    expect(ref(r2, 'Iniciativa')).toMatchObject({ status: 'ok', n: 20 })
    expect(ref(r2, 'Melhoria')).toMatchObject({ status: 'insuficiente', n: 5 })
    expect(r2.base.complemento?.n).toBe(25)
  })

  it('o tipo do projeto aguardando acompanha o card (para casar com a referência do seu tipo)', () => {
    const r = calcularE9(
      ctxDe([
        aguardando('P-i', '2026-09-01T08:00:00-03:00', { tipo: 'Iniciativa' }),
        aguardando('P-m', '2026-09-02T08:00:00-03:00', { tipo: 'Melhoria' }),
      ]),
      F,
    )
    expect(r.projetos.map((p) => [p.cardId, p.tipo])).toEqual([
      ['P-i', 'Iniciativa'],
      ['P-m', 'Melhoria'],
    ])
  })

  it('retrato do dia: o período não muda o resultado; o filtro de sistema atua', () => {
    const ctx = ctxDe([
      aguardando('P-1', '2026-09-01T08:00:00-03:00', { sistema: 'Protheus' }),
      aguardando('P-2', '2026-09-01T08:00:00-03:00', { sistema: 'Fluig' }),
    ])
    expect(calcularE9(ctx, { ...F, periodo: { tipo: '4s' } })).toEqual(
      calcularE9(ctx, { ...F, periodo: { tipo: '12m' } }),
    )
    expect(calcularE9(ctx, { ...F, sistema: ['fluig'] }).projetos.map((p) => p.cardId)).toEqual([
      'P-2',
    ])
  })

  it('sem projeto aguardando: lista vazia válida', () => {
    const r = calcularE9(ctxDe([]), F)
    expect(r.projetos).toEqual([])
    expect(SCHEMAS_RESULTADO.E9.safeParse(r).success).toBe(true)
  })

  it('base do mock: obedece ao schema (número de projetos abertos registrado no docs/api)', () => {
    const base = gerarBaseMock({ escala: 0.5 })
    const r = calcularE9(criarContextoBM(base.bm, HOJE_TESTE, CALENDARIO_PADRAO), F)
    expect(SCHEMAS_RESULTADO.E9.safeParse(r).success).toBe(true)
  })
})
