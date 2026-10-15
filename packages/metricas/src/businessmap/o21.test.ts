import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { SCHEMAS_RESULTADO } from '@metricas-dspd/contratos/validacao'
import { gerarBaseBusinessMap, gerarBaseMock } from '@metricas-dspd/mock'
import { CALENDARIO_PADRAO } from '../core/calendario'
import { percentisDe } from '../core/estatistica'
import { amostraBM } from './amostra'
import { calcularO21, calcularO3, calcularO4, calcularT1 } from './index'
import { criarContextoBM, type ContextoBM } from './indice'
import { ordenarNeutro } from '../core/ordenar'
import { instanteDeIso } from '../core/calendario'
import type { DimCard, FatoTransicao } from './modelo'
import { entreguesDe } from './o3'
import { selecionar } from './comum'
import { HOJE_TESTE, trilhaSimples, umaBase, type EspecCard } from './testing'

const F: FiltrosFluxo = { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12s' } }
const ctxDe = (cards: EspecCard[]): ContextoBM =>
  criarContextoBM(umaBase(cards), HOJE_TESTE, CALENDARIO_PADRAO)

/** Entregue em 22/09 sem nenhum retorno (ciclo de 14/09 a 22/09). */
const sem = (id: string, extra: Partial<EspecCard> = {}): EspecCard => ({
  id,
  criado: '2026-09-01T08:00:00-03:00',
  trilha: trilhaSimples(
    '2026-09-01T08:00:00-03:00',
    '2026-09-02T08:00:00-03:00',
    '2026-09-14T09:00:00-03:00',
    '2026-09-22T10:00:00-03:00',
  ),
  ...extra,
})
/** Voltou de "Em teste" para "Em desenvolvimento" antes de entregar em 24/09 (ciclo maior). */
const com = (id: string, extra: Partial<EspecCard> = {}): EspecCard => ({
  id,
  criado: '2026-09-01T08:00:00-03:00',
  trilha: [
    ['Aguardando priorização', '2026-09-01T08:00:00-03:00'],
    ['Pronto para desenvolver', '2026-09-02T08:00:00-03:00'],
    ['Em desenvolvimento', '2026-09-14T09:00:00-03:00'],
    ['Em teste', '2026-09-16T09:00:00-03:00'],
  ],
  retornoEm: [
    ['Em desenvolvimento', '2026-09-17T09:00:00-03:00'],
    ['Em teste', '2026-09-18T09:00:00-03:00'],
    ['Entregue', '2026-09-24T10:00:00-03:00'],
  ],
  ...extra,
})
/** Entregue em 22/09, reaberto em 24/09 (retorno a partir de "Entregue") e entregue de novo em 28/09. */
const reaberto = (id: string, extra: Partial<EspecCard> = {}): EspecCard => ({
  ...sem(id),
  retornoEm: [
    ['Em desenvolvimento', '2026-09-24T09:00:00-03:00'],
    ['Entregue', '2026-09-28T10:00:00-03:00'],
  ],
  ...extra,
})
/** Contexto com transições de retorno acrescentadas à mão (dado fora do padrão que o mock não gera). */
const ctxComExtras = (cards: EspecCard[], extras: Partial<FatoTransicao>[]): ContextoBM => {
  const base = umaBase(cards)
  const extra = extras.map(
    (e) =>
      ({
        card_id: 's1',
        coluna_origem: 'Em teste',
        coluna_destino: 'Em desenvolvimento',
        tipo_coluna: 'execucao',
        usuario: 'Pessoa 01',
        timestamp: instanteDeIso('2026-09-16T09:00:00-03:00', CALENDARIO_PADRAO),
        direcao: 'retorno',
        ...e,
      }) satisfies FatoTransicao,
  )
  return criarContextoBM(
    { ...base, transicoes: ordenarNeutro([...base.transicoes, ...extra], (t) => [t.timestamp]) },
    HOJE_TESTE,
    CALENDARIO_PADRAO,
  )
}
const muitos = <T>(n: number, f: (i: number) => T) => Array.from({ length: n }, (_, i) => f(i))
const ids = (p: string, n: number, f: (id: string) => EspecCard) => muitos(n, (i) => f(`${p}${i}`))

describe('O21: fluxo reverso', () => {
  it('entregas com retorno: "k de n" com n >= 20 vira percentual; abaixo, só "k de n"', () => {
    const ok = calcularO21(ctxDe([...ids('s', 15, sem), ...ids('c', 5, com)]), F)
    expect(ok.entregas).toMatchObject({ status: 'ok', k: 5, n: 20 })
    expect(ok.entregas.status === 'ok' && ok.entregas.pct).toBe(25)
    const pouco = calcularO21(ctxDe([...ids('s', 15, sem), ...ids('c', 4, com)]), F)
    expect(pouco.entregas).toEqual({ status: 'insuficiente', k: 4, n: 19, minimo: 20 })
    expect(JSON.stringify(pouco.entregas)).not.toContain('pct')
    expect(ok.base).toMatchObject({ n: 20, unidade: 'entregas' })
    expect(SCHEMAS_RESULTADO.O21.safeParse(ok).success).toBe(true)
  })

  it('matriz só com retornos: por papel em "Todas", e a reabertura em célula marcada e contada à parte', () => {
    const r = calcularO21(ctxDe([...ids('c', 3, com), reaberto('r1'), sem('s1')]), F)
    expect(r.matriz.eixo).toBe('papel')
    expect(r.matriz.celulas).toEqual([
      // ordem do domínio: origem na ordem do fluxo (trabalho antes de entrega)
      { origem: 'trabalho', destino: 'trabalho', retornos: 3, reaberto: false },
      { origem: 'entrega', destino: 'trabalho', retornos: 1, reaberto: true },
    ])
    expect(r.reaberturas).toBe(1)
    expect(r.entregas).toMatchObject({ k: 4, n: 5 })
  })

  it('com uma equipe a matriz sai por coluna, na ordem do quadro', () => {
    const r = calcularO21(ctxDe([...ids('c', 2, com), reaberto('r1'), sem('s1')]), {
      ...F,
      equipe: ['equipe-a'],
    })
    expect(r.matriz.eixo).toBe('coluna')
    expect(r.matriz.celulas).toEqual([
      { origem: 'Em teste', destino: 'Em desenvolvimento', retornos: 2, reaberto: false },
      { origem: 'Entregue', destino: 'Em desenvolvimento', retornos: 1, reaberto: true },
    ])
  })

  it('R5: com "Todas" ou mais de uma equipe, o eixo é papel e nenhuma célula é equipe', () => {
    const cards = [
      ...ids('a', 3, com),
      ...ids('b', 3, (id) => com(id, { equipe: 'Equipe B' })),
      reaberto('ra'),
      reaberto('rb', { equipe: 'Equipe B' }),
    ]
    const papeis = ['backlog', 'compromisso', 'trabalho', 'homologacao', 'entrega']
    for (const filtro of [[], ['equipe-a', 'equipe-b']]) {
      const r = calcularO21(ctxDe(cards), { ...F, equipe: filtro })
      expect(r.matriz.eixo).toBe('papel')
      expect(r.matriz.celulas.length).toBeGreaterThan(0)
      for (const c of r.matriz.celulas) {
        expect(papeis).toContain(c.origem)
        expect(papeis).toContain(c.destino)
      }
      expect(JSON.stringify(r)).not.toMatch(/equipe-?[ab]/i)
      // um único conjunto de células para as duas equipes: a soma não se separa por time
      expect(r.matriz.celulas.reduce((s, c) => s + c.retornos, 0)).toBe(8)
    }
    // sobre o mock (várias equipes e quadros): sempre papel e só papéis
    const base = gerarBaseMock({ escala: 0.5 })
    const m = calcularO21(criarContextoBM(base.bm, HOJE_TESTE, CALENDARIO_PADRAO), F)
    expect(m.matriz.eixo).toBe('papel')
    for (const c of m.matriz.celulas) {
      expect(papeis).toContain(c.origem)
      expect(papeis).toContain(c.destino)
    }
    const equipes = new Set(base.bm.cards.map((c) => c.equipe.toLowerCase()))
    expect(JSON.stringify(m.matriz).toLowerCase()).not.toSatisfy((j: string) =>
      [...equipes].some((e) => j.includes(`"${e}"`)),
    )
  })

  it('retorno sem coluna de origem não conta; origem fora do quadro vira "sem-papel" (papel) ou ordem 0 (coluna)', () => {
    const extras = [
      {
        coluna_origem: null,
        timestamp: instanteDeIso('2026-09-15T09:00:00-03:00', CALENDARIO_PADRAO),
      },
      { coluna_origem: 'Coluna removida' },
    ]
    const papel = calcularO21(ctxComExtras([sem('s1')], extras), F)
    expect(papel.matriz.celulas).toEqual([
      { origem: 'sem-papel', destino: 'trabalho', retornos: 1, reaberto: false },
    ])
    const coluna = calcularO21(ctxComExtras([sem('s1')], extras), { ...F, equipe: ['equipe-a'] })
    expect(coluna.matriz.celulas).toEqual([
      { origem: 'Coluna removida', destino: 'Em desenvolvimento', retornos: 1, reaberto: false },
    ])
    expect(coluna.entregas).toMatchObject({ k: 1, n: 1 })
  })

  it('CA-6: o par com × sem só sai com 20 em cada grupo e o contrato diz qual grupo faltou (19/20)', () => {
    const grupo = (c: number, s: number) =>
      calcularO21(ctxDe([...ids('c', c, com), ...ids('s', s, sem)]), F).comparacoes[0]
    expect(grupo(20, 20)).toMatchObject({
      tipo: 'Melhoria',
      grupoAbaixoDoMinimo: null,
      com: { status: 'ok', n: 20 },
      sem: { status: 'ok', n: 20 },
    })
    expect(grupo(19, 20)).toMatchObject({
      grupoAbaixoDoMinimo: 'com',
      com: { status: 'insuficiente', n: 19 },
      sem: { status: 'ok', n: 20 },
    })
    expect(grupo(20, 19)).toMatchObject({
      grupoAbaixoDoMinimo: 'sem',
      com: { status: 'ok', n: 20 },
      sem: { status: 'insuficiente', n: 19 },
    })
    expect(grupo(3, 4)).toMatchObject({ grupoAbaixoDoMinimo: 'ambos' })
    expect(JSON.stringify(grupo(19, 20)?.com)).not.toContain('p50')
  })

  it('regra 7: o par é por tipo; tipos nunca se juntam e cada grupo conta só dentro do seu tipo', () => {
    const r = calcularO21(
      ctxDe([
        ...ids('mc', 20, com),
        ...ids('ms', 20, sem),
        ...ids('ic', 12, (id) => com(id, { tipo: 'Incidente' })),
        ...ids('is', 12, (id) => sem(id, { tipo: 'Incidente' })),
      ]),
      F,
    )
    expect(r.segmentoPor).toBe('tipo')
    expect(r.comparacoes.map((c) => c.tipo)).toEqual(['Incidente', 'Melhoria'])
    // 24 incidentes não completam 20 por grupo apenas por somar com os 40 de Melhoria
    expect(r.comparacoes[0]).toMatchObject({ grupoAbaixoDoMinimo: 'ambos' })
    expect(r.comparacoes[0]?.com).toMatchObject({ status: 'insuficiente', n: 12 })
    expect(r.comparacoes[1]).toMatchObject({ grupoAbaixoDoMinimo: null })
    // a taxa do período é geral (contagem), o percentil não
    expect(r.entregas).toMatchObject({ k: 32, n: 64 })
    // o filtro de tipo restringe o par
    const so = calcularO21(
      ctxDe([...ids('mc', 20, com), ...ids('is', 3, (id) => sem(id, { tipo: 'Incidente' }))]),
      { ...F, tipo: ['Incidente'] },
    )
    expect(so.comparacoes.map((c) => c.tipo)).toEqual(['Incidente'])
  })

  it('reaproveitamento: o ciclo do par vem da mesma função do O3 (entreguesDe), sem recálculo', () => {
    const cards = [...ids('c', 20, com), ...ids('s', 20, sem)]
    const ctx = ctxDe(cards)
    const r = calcularO21(ctx, F)
    const es = entreguesDe(ctx, selecionar(ctx, F, 'story'))
    const ciclos = (pre: string) =>
      es.filter((e) => e.m.card.card_id.startsWith(pre)).map((e) => e.ciclo)
    const janela = r.comparacoes[0]!.com.janela
    const p = (pre: string) => percentisDe(amostraBM('story', ciclos(pre), janela))
    const c = r.comparacoes[0]!
    expect(c.com.status === 'ok' && c.com.valor.p85).toBeCloseTo(p('c').p85, 1)
    expect(c.sem.status === 'ok' && c.sem.valor.p85).toBeCloseTo(p('s').p85, 1)
    expect(p('c').p85).toBeGreaterThan(p('s').p85) // com retorno demora mais: os dois grupos não se misturam
    const fonte = readFileSync(new URL('./o21.ts', import.meta.url), 'utf8')
    expect(fonte).toContain("from './o3'")
    expect(fonte).not.toMatch(/horasUteisEntre|cicloHU/)
  })

  it('só entregas do período e demandas entram; excluir bug interno, subtarefa e quem não entregou', () => {
    const r = calcularO21(
      ctxDe([
        com('c1'),
        sem('b1', { tipo: 'Bug interno' }),
        sem('t1', { subtarefa: true }),
        {
          id: 'a1',
          criado: '2026-09-01T08:00:00-03:00',
          trilha: [['Aguardando priorização', '2026-09-01T08:00:00-03:00']],
        },
        sem('antiga', {
          criado: '2026-01-05T08:00:00-03:00',
          trilha: trilhaSimples(
            '2026-01-05T08:00:00-03:00',
            '2026-01-06T08:00:00-03:00',
            '2026-01-07T09:00:00-03:00',
            '2026-01-12T10:00:00-03:00',
          ),
        }),
      ]),
      F,
    )
    expect(r.entregas).toMatchObject({ k: 1, n: 1 })
  })

  it('sem nenhum card: resultado vazio válido, eixo papel e nenhuma comparação', () => {
    const r = calcularO21(ctxDe([]), F)
    expect(r.entregas).toMatchObject({ k: 0, n: 0 })
    expect(r.matriz).toEqual({ eixo: 'papel', celulas: [] })
    expect(r.comparacoes).toEqual([])
    expect(r.reaberturas).toBe(0)
    expect(calcularO21(ctxDe([]), { ...F, equipe: ['equipe-a'] }).matriz.eixo).toBe('coluna')
    expect(SCHEMAS_RESULTADO.O21.safeParse(r).success).toBe(true)
  })

  const totaisT1 = (c: ContextoBM, f: FiltrosFluxo) =>
    calcularT1(c, f).classes.map((x) =>
      x.estatistica.status === 'ok'
        ? [
            x.n,
            x.estatistica.valor.total,
            x.estatistica.valor.blocos.fila,
            x.estatistica.valor.blocos.espera,
          ]
        : [x.n],
    )

  describe('base do mock (B11a: alvos da fase 1 como asserção)', () => {
    const base = gerarBaseMock()
    const ctx = criarContextoBM(base.bm, HOJE_TESTE, CALENDARIO_PADRAO)
    const r = calcularO21(ctx, F)

    it('obedece ao schema e 20% a 30% das entregas têm retorno, em 12 semanas e em 12 meses', () => {
      for (const periodo of ['12s', '12m'] as const) {
        const x = calcularO21(ctx, { ...F, periodo: { tipo: periodo } })
        expect(SCHEMAS_RESULTADO.O21.safeParse(x).success).toBe(true)
        expect(x.entregas.status).toBe('ok')
        expect(x.entregas.k / x.entregas.n).toBeGreaterThanOrEqual(0.2)
        expect(x.entregas.k / x.entregas.n).toBeLessThanOrEqual(0.3)
      }
    })

    it('ao menos 60% dos retornos que não são reabertura vão de teste ou homologação para o desenvolvimento; reaberturas entre 2 e 10', () => {
      expect(r.reaberturas).toBeGreaterThanOrEqual(2)
      expect(r.reaberturas).toBeLessThanOrEqual(10)
      const demais = r.matriz.celulas.filter((c) => !c.reaberto)
      const total = demais.reduce((s, c) => s + c.retornos, 0)
      // por papel (Todas): teste e desenvolvimento são "trabalho", homologação é "homologacao"
      const principais = demais
        .filter(
          (c) =>
            c.destino === 'trabalho' && (c.origem === 'trabalho' || c.origem === 'homologacao'),
        )
        .reduce((s, c) => s + c.retornos, 0)
      expect(principais / total).toBeGreaterThanOrEqual(0.6)
      // por coluna (uma equipe): as duas colunas de origem são as do alvo
      const eq = calcularO21(ctx, { ...F, equipe: ['fluig'] })
      expect(eq.matriz.eixo).toBe('coluna')
      const pares = eq.matriz.celulas
        .filter((c) => !c.reaberto)
        .map((c) => `${c.origem} -> ${c.destino}`)
      expect(pares).toContain('Em teste -> Em desenvolvimento')
      expect(pares).toContain('Em homologação -> Em desenvolvimento')
    })

    it('par com x sem: ao menos 1 tipo publica (os dois grupos com 20 ou mais) e ao menos 1 tem grupo abaixo do mínimo', () => {
      expect(r.comparacoes.some((c) => c.grupoAbaixoDoMinimo === null)).toBe(true)
      expect(r.comparacoes.some((c) => c.grupoAbaixoDoMinimo !== null)).toBe(true)
      const publica = r.comparacoes.find((c) => c.grupoAbaixoDoMinimo === null)
      expect(publica?.com.status).toBe('ok')
      expect(publica?.sem.status).toBe('ok')
    })

    it('o retorno fica dentro do intervalo de execução: nem o início nem a entrega mudam (O3, O4 e T1 iguais sem o passo)', () => {
      const sem = gerarBaseBusinessMap(base.config, { omitir: ['retorno'] })
      const ctxSem = criarContextoBM(sem, HOJE_TESTE, CALENDARIO_PADRAO)
      for (const f of [F, { ...F, periodo: { tipo: '12m' as const } }]) {
        expect(calcularO3(ctx, f)).toEqual(calcularO3(ctxSem, f))
        expect(calcularO4(ctx, f)).toEqual(calcularO4(ctxSem, f))
        // T1: o total, a fila e a espera não mudam; só o tempo da volta ao desenvolvimento passa de "homologação" para "execução"
        expect(totaisT1(ctx, f)).toEqual(totaisT1(ctxSem, f))
      }
      expect(calcularO21(ctxSem, F).entregas.k).toBeLessThan(r.entregas.k)
      const inicio = new Map(sem.cards.map((c) => [c.card_id, [c.iniciado_em, c.concluido_em]]))
      for (const c of base.bm.cards)
        if (c.tipo !== 'Bug interno' && c.arquivado_em === null)
          expect([c.iniciado_em, c.concluido_em]).toEqual(inicio.get(c.card_id))
      // todo retorno inserido cai entre o início e a conclusão do card
      const cardsPorId = new Map(base.bm.cards.map((c) => [c.card_id, c]))
      for (const t of base.bm.transicoes) {
        const c = cardsPorId.get(t.card_id) as DimCard
        if (
          t.direcao === 'retorno' &&
          t.coluna_destino === 'Em desenvolvimento' &&
          t.coluna_origem !== 'Entregue'
        )
          expect(t.timestamp).toBeGreaterThan(c.iniciado_em as number)
      }
    })
  })
})
