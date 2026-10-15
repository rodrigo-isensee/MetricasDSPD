import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import type { FiltrosFluxo, ResultadoO20 } from '@metricas-dspd/contratos'
import { SCHEMAS_RESULTADO } from '@metricas-dspd/contratos/validacao'
import { gerarBaseMock } from '@metricas-dspd/mock'
import { CALENDARIO_PADRAO } from '../core/calendario'
import { slug } from '../slug'
import { calcularO1, calcularO20 } from './index'
import { criarContextoBM, type ContextoBM } from './indice'
import type { BaseBM } from './modelo'
import { HOJE_TESTE, umaBase, type EspecCard } from './testing'

const F: FiltrosFluxo = { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12s' } }
const PAPEIS = ['backlog', 'compromisso', 'trabalho', 'homologacao', 'entrega', 'sem-papel']

/** O O20 e o O1 acham o quadro da equipe por `quadro-<slug>`; a fixture usa esse nome. */
const naEquipe = (base: BaseBM, slug: string, nomeDaColuna?: Record<string, string>): BaseBM => {
  const q = `quadro-${slug}`
  const ren = (c: string) => nomeDaColuna?.[c] ?? c
  return {
    ...base,
    colunas: base.colunas.map((c) => ({ ...c, quadro_id: q, coluna: ren(c.coluna) })),
    cards: base.cards.map((c) => ({
      ...c,
      quadro_id: q,
      coluna_atual: c.coluna_atual && ren(c.coluna_atual),
    })),
    transicoes: base.transicoes.map((t) => ({
      ...t,
      coluna_destino: ren(t.coluna_destino),
      coluna_origem: t.coluna_origem && ren(t.coluna_origem),
    })),
  }
}
const ctxDe = (base: BaseBM): ContextoBM => criarContextoBM(base, HOJE_TESTE, CALENDARIO_PADRAO)

/** Em desenvolvimento desde antes do período e sem sair: não cresce. */
const constante = (id: string, extra: Partial<EspecCard> = {}): EspecCard => ({
  id,
  criado: '2026-06-01T08:00:00-03:00',
  trilha: [
    ['Aguardando priorização', '2026-06-01T08:00:00-03:00'],
    ['Pronto para desenvolver', '2026-06-02T08:00:00-03:00'],
    ['Em desenvolvimento', '2026-06-03T09:00:00-03:00'],
  ],
  ...extra,
})
/** Sai do desenvolvimento e para em "Aguardando homologação" (fila) no fim do período. */
const acumula = (id: string, dia: string, extra: Partial<EspecCard> = {}): EspecCard => ({
  id,
  criado: '2026-08-03T08:00:00-03:00',
  trilha: [
    ['Aguardando priorização', '2026-08-03T08:00:00-03:00'],
    ['Pronto para desenvolver', '2026-08-04T08:00:00-03:00'],
    ['Em desenvolvimento', '2026-08-10T09:00:00-03:00'],
    ['Aguardando homologação', `${dia}T10:00:00-03:00`],
  ],
  ...extra,
})
/** Entra em "Em desenvolvimento" dentro do período (o O20 só publica com transição no período). */
const entraNoPeriodo = (id: string, extra: Partial<EspecCard> = {}): EspecCard => ({
  id,
  criado: '2026-06-01T08:00:00-03:00',
  trilha: [
    ['Aguardando priorização', '2026-06-01T08:00:00-03:00'],
    ['Pronto para desenvolver', '2026-06-02T08:00:00-03:00'],
    ['Em desenvolvimento', '2026-09-20T09:00:00-03:00'],
  ],
  ...extra,
})
const idx = (r: ReturnType<typeof calcularO20>, chave: string) =>
  r.faixas.findIndex((x) => x.chave === chave)

describe('O20: fluxo cumulativo', () => {
  it('uma equipe: uma faixa por coluna, na ordem do quadro, e destaque na fila que mais cresceu', () => {
    const base = naEquipe(
      umaBase([
        constante('k1'),
        acumula('a1', '2026-09-29'),
        acumula('a2', '2026-09-30'),
        acumula('a3', '2026-10-01'),
      ]),
      'equipe-a',
    )
    const r = calcularO20(ctxDe(base), { ...F, equipe: ['equipe-a'] })
    expect(r.agrupamento).toBe('coluna')
    // de "Backlog" a "Entregue": as faixas de antes do início também aparecem, na ordem do quadro
    expect(r.faixas.map((x) => x.chave)).toEqual([
      'Aguardando priorização',
      'Pronto para desenvolver',
      'Em desenvolvimento',
      'Aguardando homologação',
    ])
    expect(r.faixas.map((x) => x.tipoColuna)).toEqual(['fila', 'fila', 'execucao', 'fila'])
    expect(r.faixas.map((x) => x.ordem)).toEqual(
      [...r.faixas.map((x) => x.ordem)].sort((a, b) => a - b),
    )
    const i = idx(r, 'Aguardando homologação')
    const primeiro = r.dias[0]!
    const ultimo = r.dias[r.dias.length - 1]!
    expect(primeiro.contagens).toHaveLength(r.faixas.length)
    expect(primeiro.contagens[i]).toBe(0)
    expect(ultimo.contagens[i]).toBe(3)
    expect(r.destaque).toEqual({ faixa: 'Aguardando homologação', de: 0, para: 3 })
    expect(r.base).toMatchObject({ n: 4, unidade: 'itens no fluxo no pico do período' })
    expect(SCHEMAS_RESULTADO.O20.safeParse(r).success).toBe(true)
  })

  it('"Nenhuma etapa acumulou": sem fila que cresça, o destaque é nulo e as faixas continuam', () => {
    const base = naEquipe(umaBase([constante('k1'), entraNoPeriodo('k2')]), 'equipe-a')
    const r = calcularO20(ctxDe(base), { ...F, equipe: ['equipe-a'] })
    expect(r.faixas.map((x) => x.chave)).toContain('Em desenvolvimento')
    expect(r.destaque).toBeNull()
    // fila que encolheu também não é destaque
    const base2 = naEquipe(
      umaBase([
        acumula('a1', '2026-07-01', {
          trilha: [
            ['Aguardando priorização', '2026-06-01T08:00:00-03:00'],
            ['Pronto para desenvolver', '2026-06-02T08:00:00-03:00'],
            ['Em desenvolvimento', '2026-06-03T09:00:00-03:00'],
            ['Aguardando homologação', '2026-07-01T10:00:00-03:00'],
            ['Em homologação', '2026-08-20T10:00:00-03:00'],
          ],
        }),
      ]),
      'equipe-a',
    )
    expect(calcularO20(ctxDe(base2), { ...F, equipe: ['equipe-a'] }).destaque).toBeNull()
  })

  it('só a faixa de fila entra no destaque: coluna de execução que cresce não é apontada', () => {
    const base = naEquipe(
      umaBase([
        acumula('a1', '2026-09-29', {
          trilha: [
            ['Aguardando priorização', '2026-08-03T08:00:00-03:00'],
            ['Pronto para desenvolver', '2026-08-04T08:00:00-03:00'],
            ['Em desenvolvimento', '2026-09-20T09:00:00-03:00'],
          ],
        }),
      ]),
      'equipe-a',
    )
    const r = calcularO20(ctxDe(base), { ...F, equipe: ['equipe-a'] })
    expect(r.faixas.map((x) => x.chave)).toEqual([
      'Aguardando priorização',
      'Pronto para desenvolver',
      'Em desenvolvimento',
    ])
    expect(r.destaque).toBeNull()
  })

  it('coluna sem definição no quadro: aparece depois das definidas (coluna) e como "sem-papel" (papel); papel só de fila entra no destaque', () => {
    const sem = naEquipe(
      umaBase([
        constante('k1'),
        acumula('a1', '2026-09-29', {
          trilha: [
            ['Aguardando priorização', '2026-08-03T08:00:00-03:00'],
            ['Pronto para desenvolver', '2026-08-04T08:00:00-03:00'],
            ['Em desenvolvimento', '2026-08-10T09:00:00-03:00'],
            ['Aguardando revisão', '2026-09-29T10:00:00-03:00'],
          ],
        }),
      ]),
      'equipe-a',
    )
    const base = { ...sem, colunas: sem.colunas.filter((c) => c.coluna !== 'Aguardando revisão') }
    const porColuna = calcularO20(ctxDe(base), { ...F, equipe: ['equipe-a'] })
    expect(porColuna.faixas.map((x) => x.chave).slice(-2)).toEqual([
      'Em desenvolvimento',
      'Aguardando revisão',
    ])
    expect(porColuna.faixas.at(-1)).toMatchObject({ tipoColuna: 'execucao' })
    const porPapel = calcularO20(ctxDe(base), F)
    expect(porPapel.faixas.map((x) => x.chave)).toEqual([
      'backlog',
      'compromisso',
      'trabalho',
      'sem-papel',
    ])
    expect(porPapel.faixas[3]).toMatchObject({ rotulo: 'Sem papel definido' })

    // volta ao compromisso (fila pura) depois de iniciado: o papel cresce e é o destaque
    const volta = (id: string, dia: string): EspecCard => ({
      id,
      criado: '2026-08-03T08:00:00-03:00',
      trilha: [
        ['Aguardando priorização', '2026-08-03T08:00:00-03:00'],
        ['Pronto para desenvolver', '2026-08-04T08:00:00-03:00'],
        ['Em desenvolvimento', '2026-08-10T09:00:00-03:00'],
        ['Pronto para desenvolver', `${dia}T10:00:00-03:00`],
      ],
    })
    const r = calcularO20(ctxDe(umaBase([volta('v1', '2026-09-29'), volta('v2', '2026-09-30')])), F)
    expect(r.faixas.map((x) => [x.chave, x.tipoColuna])).toEqual([
      ['backlog', 'fila'],
      ['compromisso', 'fila'],
      ['trabalho', 'execucao'],
    ])
    expect(r.destaque).toEqual({ faixa: 'compromisso', de: 0, para: 2 })
  })

  it('de "Backlog" a "Entregue": as faixas de antes do início e de entregue contam; o em progresso é o do O1', () => {
    const entregue = (id: string, dia: string): EspecCard => ({
      id,
      criado: '2026-08-03T08:00:00-03:00',
      trilha: [
        ['Aguardando priorização', '2026-08-03T08:00:00-03:00'],
        ['Pronto para desenvolver', '2026-08-04T08:00:00-03:00'],
        ['Em desenvolvimento', '2026-08-10T09:00:00-03:00'],
        ['Entregue', `${dia}T10:00:00-03:00`],
      ],
    })
    const noBacklog: EspecCard = {
      id: 'b1',
      criado: '2026-09-01T08:00:00-03:00',
      trilha: [['Aguardando priorização', '2026-09-01T08:00:00-03:00']],
    }
    const base = naEquipe(
      umaBase([entregue('e1', '2026-09-01'), entregue('e2', '2026-09-10'), noBacklog]),
      'equipe-a',
    )
    const ctx = ctxDe(base)
    const r = calcularO20(ctx, { ...F, equipe: ['equipe-a'] })
    const chaves = r.faixas.map((x) => x.chave)
    expect(chaves).toEqual([
      'Aguardando priorização',
      'Pronto para desenvolver',
      'Em desenvolvimento',
      'Entregue',
    ])
    const ult = r.dias.at(-1)!
    expect(ult.contagens[chaves.indexOf('Entregue')]).toBe(2)
    expect(ult.contagens[chaves.indexOf('Aguardando priorização')]).toBe(1)
    expect(ult.contagens[chaves.indexOf('Em desenvolvimento')]).toBe(0)
    // Entregue nunca é destaque (não é fila de espera) e o backlog crescente é fila
    expect(r.destaque).toEqual({ faixa: 'Aguardando priorização', de: 0, para: 1 })
    expect(ult.emProgresso).toBe(0)
    const o1 = calcularO1(ctx, { ...F, equipe: ['equipe-a'] })
    r.dias.forEach((d, i) => expect(d.emProgresso).toBe(o1.serie[i]!.wip))
    expect(Math.max(...r.dias.map((d) => d.emProgresso))).toBe(2)
    // "Todas": por papel
    const t = calcularO20(ctx, F)
    expect(t.faixas.map((x) => x.chave)).toEqual(['backlog', 'compromisso', 'trabalho', 'entrega'])
    expect(t.dias.at(-1)!.contagens[3]).toBe(2)
  })

  it('card arquivado sai das faixas no instante do arquivamento (fimDeVidaAberta)', () => {
    const base = naEquipe(
      umaBase([
        entraNoPeriodo('k1', { descarte: '2026-09-25T10:00:00-03:00' }),
        entraNoPeriodo('k2'),
      ]),
      'equipe-a',
    )
    const r = calcularO20(ctxDe(base), { ...F, equipe: ['equipe-a'] })
    const i = idx(r, 'Em desenvolvimento')
    expect(r.dias.find((d) => d.dia === '2026-09-24')!.contagens[i]).toBe(2)
    expect(r.dias.at(-1)!.contagens[i]).toBe(1)
  })

  it('entregue e arquivado depois continua na faixa Entregue (P1)', () => {
    const e = (id: string, extra: Partial<EspecCard> = {}): EspecCard => ({
      id,
      criado: '2026-08-03T08:00:00-03:00',
      trilha: [
        ['Aguardando priorização', '2026-08-03T08:00:00-03:00'],
        ['Em desenvolvimento', '2026-08-10T09:00:00-03:00'],
        ['Entregue', '2026-09-01T10:00:00-03:00'],
      ],
      ...extra,
    })
    const base = naEquipe(umaBase([e('e1', { descarte: '2026-09-20T10:00:00-03:00' })]), 'equipe-a')
    const r = calcularO20(ctxDe(base), { ...F, equipe: ['equipe-a'] })
    expect(r.dias.at(-1)!.contagens[idx(r, 'Entregue')]).toBe(1)
  })

  it('card sem nenhuma transição não entra nas faixas', () => {
    const base = naEquipe(
      umaBase([
        entraNoPeriodo('k1'),
        { id: 'sem', criado: '2026-08-03T08:00:00-03:00', trilha: [] },
      ]),
      'equipe-a',
    )
    const r = calcularO20(ctxDe(base), { ...F, equipe: ['equipe-a'] })
    expect(r.dias.at(-1)!.contagens[idx(r, 'Em desenvolvimento')]).toBe(1)
  })

  it('sem transição no período (só histórico antigo): estado vazio, mesmo com cards em andamento', () => {
    const r = calcularO20(ctxDe(umaBase([constante('k1')])), F)
    expect(r.faixas).toEqual([])
    expect(r.dias).toEqual([])
    expect(r.base.n).toBe(0)
  })

  it('sem nenhum item no período: estado vazio (faixas e dias vazios)', () => {
    const r = calcularO20(ctxDe(umaBase([])), F)
    expect(r.faixas).toEqual([])
    expect(r.dias).toEqual([])
    expect(r.base.n).toBe(0)
    expect(r.destaque).toBeNull()
    expect(r.mudancasCriterio).toEqual([])
    expect(SCHEMAS_RESULTADO.O20.safeParse(r).success).toBe(true)
  })

  it('"Todas": faixa por papel, somada entre quadros de nomes de coluna diferentes (nunca equipe)', () => {
    const a = naEquipe(umaBase([constante('k1'), acumula('a1', '2026-09-29')]), 'equipe-a')
    const b = naEquipe(umaBase([entraNoPeriodo('k2', { equipe: 'Equipe B' })]), 'equipe-b', {
      'Em desenvolvimento': 'Fazendo',
    })
    const base: BaseBM = {
      ...a,
      cards: [...a.cards, ...b.cards],
      transicoes: [...a.transicoes, ...b.transicoes],
      colunas: [...a.colunas, ...b.colunas],
      config: {
        ...a.config,
        equipes: [...a.config.equipes, { nome: 'Equipe B', sistemas: ['Protheus'] }],
      },
    }
    const ctx = ctxDe(base)
    const r = calcularO20(ctx, F)
    expect(r.agrupamento).toBe('papel')
    // trabalho = k1 (A) + a1 (A, em "Aguardando homologação", papel trabalho) + k2 (B, em "Fazendo")
    const t = r.faixas.findIndex((x) => x.chave === 'trabalho')
    expect(r.faixas[t]).toMatchObject({ rotulo: 'Em execução', tipoColuna: 'execucao' })
    expect(r.faixas.map((x) => x.chave)).toEqual(['backlog', 'compromisso', 'trabalho'])
    expect(r.dias[r.dias.length - 1]!.contagens[t]).toBe(3)
    expect(r.dias[0]!.contagens[t]).toBe(1)
    // mais de uma equipe também é papel
    const duas = calcularO20(ctx, { ...F, equipe: ['equipe-a', 'equipe-b'] })
    expect(duas.agrupamento).toBe('papel')
    // o total por dia bate com o do O1 (mesma varredura)
    const o1 = calcularO1(ctx, F)
    r.dias.forEach((d, i) => expect(d.emProgresso).toBe(o1.serie[i]!.wip))
    // uma equipe só: coluna, e a coluna renomeada do outro quadro não aparece
    const soB = calcularO20(ctx, { ...F, equipe: ['equipe-b'] })
    expect(soB.faixas.map((x) => x.chave)).toContain('Fazendo')
    expect(soB.faixas.map((x) => x.chave)).not.toContain('Em desenvolvimento')
  })

  it('a chave da memoização leva os filtros: tipo e equipe diferentes não reaproveitam o resultado', () => {
    const base = naEquipe(
      umaBase([
        entraNoPeriodo('k1', { tipo: 'Melhoria' }),
        entraNoPeriodo('k2', { tipo: 'Incidente' }),
        entraNoPeriodo('k3', { tipo: 'Incidente' }),
      ]),
      'equipe-a',
    )
    const ctx = ctxDe(base)
    const total = (f: FiltrosFluxo) => calcularO20(ctx, f).dias.at(-1)?.emProgresso
    expect(total(F)).toBe(3)
    expect(total({ ...F, tipo: ['Incidente'] })).toBe(2)
    expect(total({ ...F, tipo: ['Melhoria'] })).toBe(1)
    expect(total({ ...F, equipe: ['equipe-a'], tipo: ['Incidente'] })).toBe(2)
    expect(total(F)).toBe(3)
    // mesma consulta, mesmo ctx: resultado idêntico
    expect(calcularO20(ctx, F)).toEqual(calcularO20(ctx, F))
  })

  it('mudanças de critério do período vêm de core/criterios (mudancasCriterio)', () => {
    const base = naEquipe(umaBase([constante('k1')]), 'equipe-a')
    const com = {
      ...base,
      config: {
        ...base.config,
        criterios: [
          {
            id: 'v2-o20',
            data: '2026-09-01',
            descricao: 'Nova regra de coluna',
            afeta: ['O20' as const],
          },
          { id: 'v2-o1', data: '2026-09-02', descricao: 'Outra métrica', afeta: ['O1' as const] },
          {
            id: 'v1-o20',
            data: '2026-01-01',
            descricao: 'Fora do período',
            afeta: ['O20' as const],
          },
        ],
      },
    }
    const r = calcularO20(ctxDe(com), F)
    expect(r.mudancasCriterio).toEqual([
      { id: 'v2-o20', data: '2026-09-01', descricao: 'Nova regra de coluna' },
    ])
    expect(r.criterios.serie).toEqual(r.mudancasCriterio)
    expect(readFileSync(new URL('./o20.ts', import.meta.url), 'utf8')).toContain("criterios('O20'")
  })

  it('usa a varredura do B8 (sem varredura própria) e não lê pessoa', () => {
    const fonte = readFileSync(new URL('./o20.ts', import.meta.url), 'utf8')
    expect(fonte).toContain("from './varredura'")
    expect(fonte).not.toMatch(/faixasWip|estadoEm|responsaveis|usuario/)
  })

  describe('base do mock', () => {
    const base = gerarBaseMock()
    const ctx = criarContextoBM(base.bm, base.config.hoje, CALENDARIO_PADRAO)
    const equipes = base.bm.config.equipes.map((e) => slug(e.nome))
    const nomes = new Set(
      [...base.bm.config.equipes.map((e) => e.nome), ...equipes].map((n) => n.toLowerCase()),
    )

    it('R5: com "Todas" ou várias equipes o agrupamento é papel e nenhuma faixa é equipe', () => {
      const filtros: FiltrosFluxo[] = [
        F,
        { ...F, periodo: { tipo: '12m' } },
        { ...F, equipe: equipes.slice(0, 2) },
        { ...F, equipe: equipes },
      ]
      for (const f of filtros) {
        const r = calcularO20(ctx, f)
        expect(SCHEMAS_RESULTADO.O20.safeParse(r).success).toBe(true)
        expect(r.agrupamento).toBe('papel')
        expect(r.faixas.length).toBeGreaterThan(0)
        for (const x of r.faixas) {
          expect(PAPEIS).toContain(x.chave)
          expect(nomes.has(x.chave.toLowerCase())).toBe(false)
          expect(nomes.has(x.rotulo.toLowerCase())).toBe(false)
        }
        if (r.destaque) expect(PAPEIS).toContain(r.destaque.faixa)
      }
    })

    it('uma equipe: agrupamento coluna, colunas do quadro dela e destaque (se houver) numa fila', () => {
      for (const e of equipes) {
        const r = calcularO20(ctx, { ...F, equipe: [e] })
        expect(r.agrupamento).toBe('coluna')
        expect(SCHEMAS_RESULTADO.O20.safeParse(r).success).toBe(true)
        const quadro = `quadro-${e}`
        for (const x of r.faixas)
          expect(base.bm.colunas.some((c) => c.quadro_id === quadro && c.coluna === x.chave)).toBe(
            true,
          )
        if (r.destaque) {
          const d = r.destaque
          expect(r.faixas.find((x) => x.chave === d.faixa)?.tipoColuna).toBe('fila')
          expect(d.para).toBeGreaterThan(d.de)
        }
      }
    })

    /**
     * DECISÃO DO USUÁRIO PENDENTE (Backlog como destaque no "Todas", pergunta da UX). Hoje vale a regra da
     * implementação: o Backlog pode ser destaque. Se a resposta tirar o Backlog, trocar SÓ esta função
     * (passa a exigir a faixa "compromisso", "Pronto para") e, se preciso, o mock em `mock/.../tambem.ts`.
     */
    const destaqueDoTodasAceito = (d: ResultadoO20['destaque']): boolean =>
      d !== null && ['backlog', 'compromisso'].includes(d.faixa) && d.para > d.de

    it('B11a: com uma equipe há destaque numa fila que cresce e no "Todas" há destaque aceito; há combinação sem destaque', () => {
      const comEquipe = equipes.map((e) => calcularO20(ctx, { ...F, equipe: [e] }))
      const comDestaque = comEquipe.filter((r) => r.destaque !== null)
      expect(comDestaque.length).toBeGreaterThanOrEqual(1)
      for (const r of comDestaque) {
        const d = r.destaque as NonNullable<ResultadoO20['destaque']>
        expect(r.faixas.find((x) => x.chave === d.faixa)?.tipoColuna).toBe('fila')
        expect(d.para - d.de).toBeGreaterThan(0)
      }
      expect(destaqueDoTodasAceito(calcularO20(ctx, F).destaque)).toBe(true)
      // "Nenhuma etapa acumulou": destaque nulo com as faixas presentes
      const semDestaque = comEquipe.filter((r) => r.destaque === null)
      expect(semDestaque.length).toBeGreaterThanOrEqual(1)
      expect(semDestaque.every((r) => r.faixas.length > 0 && r.dias.length > 0)).toBe(true)
    })

    it('o em progresso por dia é o WIP do O1, em "Todas" e por equipe', () => {
      for (const f of [F, { ...F, equipe: [equipes[0]!] }]) {
        const r = calcularO20(ctx, f)
        const o1 = calcularO1(ctx, f)
        expect(r.dias).toHaveLength(o1.serie.length)
        r.dias.forEach((d, i) => expect(d.emProgresso).toBe(o1.serie[i]!.wip))
      }
    })
  })
})
