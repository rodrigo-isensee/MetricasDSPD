import { describe, expect, it } from 'vitest'
import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { SCHEMAS_RESULTADO } from '@metricas-dspd/contratos/validacao'
import { gerarBaseMock } from '@metricas-dspd/mock'
import { CALENDARIO_PADRAO, instanteDeIso } from '../core/calendario'
import { calcularT12, type FatoBloqueio } from './index'
import { criarContextoBM } from './indice'
import { HOJE_TESTE, trilhaSimples, umaBase, type EspecCard } from './testing'

const F: FiltrosFluxo = { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12s' } }
const t = (iso: string) => instanteDeIso(iso, CALENDARIO_PADRAO)
const ctxDe = (cards: EspecCard[], bloqueios: FatoBloqueio[] = []) =>
  criarContextoBM(umaBase(cards, bloqueios), HOJE_TESTE, CALENDARIO_PADRAO)

/** Card criado em 03/08, comprometido em 04/08, iniciado em 05/08 e entregue em 30/09. */
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
/** Card que nunca iniciou: parou na coluna de compromisso. */
const naoIniciado = (id: string, extra: Partial<EspecCard> = {}): EspecCard => ({
  id,
  criado: '2026-08-03T08:00:00-03:00',
  trilha: [
    ['Aguardando priorização', '2026-08-03T08:00:00-03:00'],
    ['Pronto para desenvolver', '2026-08-04T08:00:00-03:00'],
  ],
  ...extra,
})
const bloqueio = (cardId: string, inicioIso: string, motivo = 'Falta de informação no chamado') =>
  ({
    card_id: cardId,
    motivo,
    coluna_em_que_bloqueou: 'Aguardando priorização',
    fornecedor: null,
    inicio: t(inicioIso),
    fim: t(inicioIso) + 3_600_000,
    duracao_horas_uteis: 1,
  }) as FatoBloqueio
const muitos = (n: number, area: string, extra: (i: number) => Partial<EspecCard> = () => ({})) =>
  Array.from({ length: n }, (_, i) => card(`${area}-${i}`, { area, ...extra(i) }))

describe('T12: qualidade da entrada por área (D-8 = A)', () => {
  it('CA-39 (a): bloqueio por falta de informação antes do início conta; depois do início, não', () => {
    const r = calcularT12(
      ctxDe(
        [card('A'), card('B'), card('C')],
        [
          bloqueio('A', '2026-08-04T09:00:00-03:00'), // antes do início (05/08)
          bloqueio('B', '2026-08-10T09:00:00-03:00'), // depois do início
          bloqueio('C', '2026-08-04T09:00:00-03:00', 'Janela de mudança'), // outro motivo
        ],
      ),
      F,
    )
    expect(r.areas).toHaveLength(1)
    expect(r.areas[0]?.taxa).toMatchObject({ status: 'insuficiente', k: 1, n: 3 })
    expect(r.total).toMatchObject({ k: 1, n: 3 })
  })

  it('CA-39 (a): card ainda não iniciado com o bloqueio conta, em qualquer data', () => {
    const r = calcularT12(
      ctxDe(
        [naoIniciado('A'), naoIniciado('B')],
        [
          bloqueio('A', '2026-09-20T09:00:00-03:00'),
          bloqueio('B', '2026-09-20T09:00:00-03:00', 'Janela de mudança'),
        ],
      ),
      F,
    )
    expect(r.total).toMatchObject({ k: 1, n: 2 })
  })

  it('CA-39 (b): retorno da coluna de compromisso para o backlog conta; outro retorno, não', () => {
    const base = (id: string, extra: Partial<EspecCard>) => ({
      ...naoIniciado(id),
      ...extra,
    })
    const r = calcularT12(
      ctxDe([
        base('A', { retornoEm: [['Aguardando priorização', '2026-08-06T08:00:00-03:00']] }),
        // retorno de uma coluna de execução para o backlog não é "ida e volta" da entrada
        {
          id: 'B',
          criado: '2026-08-03T08:00:00-03:00',
          trilha: [
            ['Aguardando priorização', '2026-08-03T08:00:00-03:00'],
            ['Pronto para desenvolver', '2026-08-04T08:00:00-03:00'],
            ['Em desenvolvimento', '2026-08-05T08:00:00-03:00'],
          ],
          retornoEm: [['Aguardando priorização', '2026-08-06T08:00:00-03:00']],
        },
        // retorno da execução para o compromisso também não
        {
          id: 'C',
          criado: '2026-08-03T08:00:00-03:00',
          trilha: [
            ['Aguardando priorização', '2026-08-03T08:00:00-03:00'],
            ['Pronto para desenvolver', '2026-08-04T08:00:00-03:00'],
            ['Em desenvolvimento', '2026-08-05T08:00:00-03:00'],
          ],
          retornoEm: [['Pronto para desenvolver', '2026-08-06T08:00:00-03:00']],
        },
      ]),
      F,
    )
    expect(r.total).toMatchObject({ k: 1, n: 3 })
  })

  it('card sem nenhuma transição (nunca saiu da criação) não tem ida e volta e entra no n', () => {
    const r = calcularT12(ctxDe([{ id: 'A', criado: '2026-08-03T08:00:00-03:00', trilha: [] }]), F)
    expect(r.total).toMatchObject({ k: 0, n: 1 })
  })

  it('card com os dois critérios conta uma vez só', () => {
    const r = calcularT12(
      ctxDe(
        [
          naoIniciado('A', {
            retornoEm: [['Aguardando priorização', '2026-08-06T08:00:00-03:00']],
          }),
        ],
        [bloqueio('A', '2026-08-04T09:00:00-03:00'), bloqueio('A', '2026-08-05T09:00:00-03:00')],
      ),
      F,
    )
    expect(r.total).toMatchObject({ k: 1, n: 1 })
    expect(r.areas[0]?.taxa).toMatchObject({ k: 1, n: 1 })
  })

  it('taxa por área só com n >= 20 (19 não publica, 20 publica); k e n sempre', () => {
    const cards = [
      ...muitos(20, 'Financeiro', (i) => ({ id: `F${i}` })),
      ...muitos(19, 'Comercial', (i) => ({ id: `C${i}` })),
    ]
    const bl = [
      ...Array.from({ length: 5 }, (_, i) => bloqueio(`F${i}`, '2026-08-04T09:00:00-03:00')),
      ...Array.from({ length: 4 }, (_, i) => bloqueio(`C${i}`, '2026-08-04T09:00:00-03:00')),
    ]
    const r = calcularT12(ctxDe(cards, bl), F)
    expect(r.areas[0]).toEqual({
      area: 'Financeiro',
      taxa: { status: 'ok', k: 5, n: 20, pct: 25 },
    })
    expect(r.areas[1]).toEqual({
      area: 'Comercial',
      taxa: { status: 'insuficiente', k: 4, n: 19, minimo: 20 },
    })
    expect(r.total).toMatchObject({ status: 'ok', k: 9, n: 39 })
    expect(r.base).toMatchObject({ n: 39, unidade: 'demandas criadas' })
    expect(SCHEMAS_RESULTADO.T12.safeParse(r).success).toBe(true)
  })

  it('CA-11: áreas por volume (desempate pelo nome), sem depender da ordem de entrada nem da taxa', () => {
    const cards = [
      ...muitos(2, 'Zeta', (i) => ({ id: `Z${i}` })),
      ...muitos(2, 'Alfa', (i) => ({ id: `A${i}` })),
      ...muitos(5, 'Meio', (i) => ({ id: `M${i}` })),
    ]
    // a área com mais volume tem a taxa mais baixa e a de menor volume a mais alta
    const bl = [
      bloqueio('Z0', '2026-08-04T09:00:00-03:00'),
      bloqueio('Z1', '2026-08-04T09:00:00-03:00'),
    ]
    const a = calcularT12(ctxDe(cards, bl), F)
    const b = calcularT12(ctxDe([...cards].reverse(), [...bl].reverse()), F)
    expect(a.areas.map((x) => x.area)).toEqual(['Meio', 'Alfa', 'Zeta'])
    expect(b).toEqual(a)
  })

  it('R5: a linha é sempre a área solicitante, nunca a equipe, mesmo com várias equipes e filtro de equipe', () => {
    const cards = [
      card('A', { equipe: 'Equipe A', area: 'Financeiro' }),
      card('B', { equipe: 'Equipe B', area: 'Financeiro' }),
      card('C', { equipe: 'Equipe B', area: 'Comercial' }),
    ]
    const r = calcularT12(ctxDe(cards), F)
    expect(r.areas.map((x) => x.area).sort()).toEqual(['Comercial', 'Financeiro'])
    expect(r.areas.find((x) => x.area === 'Financeiro')?.taxa.n).toBe(2) // duas equipes, uma linha
    const soB = calcularT12(ctxDe(cards), { ...F, equipe: ['equipe-b'] })
    expect(soB.total.n).toBe(2)
    for (const x of [r, soB]) {
      expect(JSON.stringify(x)).not.toMatch(/Equipe [AB]|equipe|responsave|usuario/i)
    }
  })

  it('só demandas criadas no período; frente e bug interno ficam fora; respeita tipo e sistema', () => {
    const cards = [
      card('A'),
      card('B', { criado: '2026-03-02T08:00:00-03:00' }), // fora do período
      card('F', { gran: 'frente' }),
      card('G', { tipo: 'Bug interno' }),
      card('H', { sistema: 'Outro', tipo: 'Incidente' }),
    ]
    expect(calcularT12(ctxDe(cards), F).total.n).toBe(2)
    expect(calcularT12(ctxDe(cards), { ...F, tipo: ['Incidente'] }).total.n).toBe(1)
  })

  it('sem demandas no período: total "0 de 0" e nenhuma área, sem erro', () => {
    const r = calcularT12(ctxDe([card('A', { criado: '2026-03-02T08:00:00-03:00' })]), F)
    expect(r.areas).toEqual([])
    expect(r.total).toMatchObject({ status: 'insuficiente', k: 0, n: 0 })
    expect(SCHEMAS_RESULTADO.T12.safeParse(r).success).toBe(true)
  })
})

describe('T12 sobre o mock (medição registrada, a base não muda)', () => {
  const b = gerarBaseMock({})
  const ctx = criarContextoBM(b.bm, b.config.hoje, CALENDARIO_PADRAO)

  it('em 12 semanas: 738 demandas, 8 áreas, todas com 20 ou mais; a parcela com ida e volta é 0%', () => {
    const r = calcularT12(ctx, F)
    expect(r.total).toEqual({ status: 'ok', k: 0, n: 738, pct: 0 })
    expect(r.areas.map((a) => [a.area, a.taxa.n])).toEqual([
      ['Financeiro', 143],
      ['Jurídico', 123],
      ['Comercial', 119],
      ['Atendimento ao Cliente', 117],
      ['Operações', 100],
      ['Logística', 58],
      ['Recursos Humanos', 40],
      ['DSPD (interno)', 38],
    ])
    expect(r.areas.every((a) => a.taxa.status === 'ok' && a.taxa.k === 0)).toBe(true)
    expect(SCHEMAS_RESULTADO.T12.safeParse(r).success).toBe(true)
  })

  it('a causa do 0%: o mock só gera bloqueio depois do início e nenhum retorno compromisso -> backlog', () => {
    const doMotivo = b.bm.bloqueios.filter((x) => x.motivo === 'Falta de informação no chamado')
    expect(doMotivo.length).toBeGreaterThan(0)
    const inicioDe = new Map(b.bm.cards.map((c) => [c.card_id, c.iniciado_em]))
    expect(doMotivo.every((x) => x.inicio >= (inicioDe.get(x.card_id) ?? Infinity))).toBe(true)
    const retornos = b.bm.transicoes.filter(
      (x) =>
        x.coluna_origem !== null &&
        ctx.idx.papelDe(
          b.bm.cards.find((c) => c.card_id === x.card_id)?.quadro_id ?? '',
          x.coluna_origem,
        )?.papel === 'compromisso' &&
        ctx.idx.papelDe(
          b.bm.cards.find((c) => c.card_id === x.card_id)?.quadro_id ?? '',
          x.coluna_destino,
        )?.papel === 'backlog',
    )
    expect(retornos).toEqual([])
  })
})

describe('L3: marcação de critério cruzando o período (T12)', () => {
  it('a série traz a versão do período e fora dele não traz', () => {
    const base = umaBase([])
    base.config.criterios = [
      { id: 'c-dentro', data: '2026-09-20', descricao: 'dentro do período', afeta: ['T12'] },
      { id: 'c-antes', data: '2025-01-10', descricao: 'antes do período', afeta: ['T12'] },
      { id: 'c-outra', data: '2026-09-20', descricao: 'outra métrica', afeta: ['O1'] },
    ]
    const r = calcularT12(criarContextoBM(base, HOJE_TESTE, CALENDARIO_PADRAO), F)
    expect(r.criterios.serie.map((c) => c.id)).toEqual(['c-dentro'])
    expect(r.criterios.janela.map((c) => c.id)).toEqual(['c-dentro'])
  })
})
