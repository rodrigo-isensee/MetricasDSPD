import { describe, expect, it } from 'vitest'
import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { CALENDARIO_PADRAO, diaDeIso, isoDeDia } from '../core/calendario'
import {
  calcularE1,
  calcularEIBM,
  calcularO1,
  calcularO10,
  calcularO12,
  calcularO18,
  calcularO2,
  calcularT1,
  calcularT2,
  calcularT3,
  calcularT4,
  calcularT5,
  calcularT7,
  estadoEm,
  type BaseBM,
  type FatoBloqueio,
  type FatoTransicao,
} from './index'
import { blocosDe } from './blocos'
import { idadeHUEm } from './estado'
import { criarContextoBM } from './indice'
import { HOJE_TESTE, trilhaSimples, umaBase, umCard, type EspecCard } from './testing'

const F: FiltrosFluxo = { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12s' } }
const D0 = diaDeIso('2026-08-03') // segunda-feira
/** k-ésimo dia útil a partir de 03/08/2026. */
const util = (k: number) => isoDeDia(D0 + k + 2 * Math.floor(k / 5))
const em = (k: number, hora: string) => `${util(k)}T${hora}-03:00`
const ctxDe = (base: BaseBM) => criarContextoBM(base, HOJE_TESTE, CALENDARIO_PADRAO)

/** Story entregue: criada no dia k0, compromisso e início no mesmo dia, entrega no dia k1. */
const entregue = (
  id: string,
  k0: number,
  k1: number,
  extra: Partial<EspecCard> = {},
): EspecCard => ({
  id,
  criado: em(k0, '08:00'),
  trilha: trilhaSimples(em(k0, '08:00'), em(k0, '09:00'), em(k0, '10:00'), em(k1, '16:00')),
  ...extra,
})
const varios = (n: number, fabrica: (i: number) => EspecCard) =>
  Array.from({ length: n }, (_, i) => fabrica(i))

describe('O1: limite de WIP e meta', () => {
  it('equipe sem limite configurado soma zero; WIP acima do limite em todos os dias fica "fora"', () => {
    const base = umaBase(
      varios(3, (i) => ({
        id: `W${i}`,
        criado: em(0, '08:00'),
        trilha: [
          ['Aguardando priorização', em(0, '08:00')],
          ['Em desenvolvimento', em(0, '09:00')],
        ],
      })),
    )
    base.config.limite_wip_fluxo = { 'Equipe A': 1 }
    base.config.equipes = [
      { nome: 'Equipe A', sistemas: ['Protheus'] },
      { nome: 'Equipe B', sistemas: ['Fluig'] },
    ]
    const r = calcularO1(ctxDe(base), F)
    expect(r.hoje.limite).toBe(1)
    expect(r.hoje.total).toBe(3)
    expect(r.statusMeta).toBe('fora')
    expect(r.serie.at(-1)?.acimaDoLimite).toBe(true)
  })
})

describe('O2, O10, O12, O18: casos de borda', () => {
  it('O10: card entregue sem nunca ter sido iniciado não envelhece no backlog', () => {
    const com = umaBase([
      {
        id: 'X',
        criado: em(0, '08:00'),
        trilha: [
          ['Aguardando priorização', em(0, '08:00')],
          ['Entregue', em(1, '09:00')],
        ],
      },
      { id: 'Y', criado: em(0, '08:00'), trilha: [['Aguardando priorização', em(0, '08:00')]] },
    ])
    const sem = umaBase([
      {
        id: 'Y',
        criado: em(0, '08:00'),
        trilha: [['Aguardando priorização', em(0, '08:00')]],
      },
    ])
    expect(calcularO10(ctxDe(com), F).base.n).toBe(calcularO10(ctxDe(sem), F).base.n)
  })

  it('O2: card com bloqueio, sem movimento e em lista de uma equipe mostra a coluna; sem equipe única mostra Fila/Execução', () => {
    const base = umaBase([
      {
        id: 'A1',
        criado: em(0, '08:00'),
        trilha: [
          ['Aguardando priorização', em(0, '08:00')],
          ['Em desenvolvimento', em(1, '09:00')],
        ],
      },
      {
        id: 'A2',
        criado: em(0, '08:00'),
        trilha: [
          ['Aguardando priorização', em(0, '08:00')],
          ['Em desenvolvimento', em(1, '09:00')],
          ['Aguardando revisão', em(2, '09:00')],
        ],
      },
    ])
    const ctx = ctxDe(base)
    const geral = calcularO2(ctx, F)
    expect(geral.itens.map((i) => i.etapa).sort()).toEqual(['Execução', 'Fila'].sort())
    const umaEquipe = calcularO2(ctx, { ...F, equipe: ['equipe-a'] })
    expect(umaEquipe.itens.map((i) => i.etapa).sort()).toEqual([
      'Aguardando revisão',
      'Em desenvolvimento',
    ])
  })

  it('O2: equipe que não existe na configuração mantém as etapas padrão (Fila e Execução)', () => {
    const base = umaBase([
      {
        id: 'Q1',
        criado: em(0, '08:00'),
        trilha: [
          ['Aguardando priorização', em(0, '08:00')],
          ['Em desenvolvimento', em(1, '09:00')],
        ],
      },
    ])
    const r = calcularO2(ctxDe(base), { ...F, equipe: ['equipe-inexistente'] })
    expect(r.itens).toEqual([])
  })

  it('O12: acordo vencido sem classificação do atraso conta como "não classificado"', () => {
    const base = umaBase([
      entregue('V1', 0, 3, { dataAcordada: em(1, '12:00') }),
      entregue('V2', 0, 1, { dataAcordada: em(5, '12:00') }),
    ])
    const r = calcularO12(ctxDe(base), F)
    expect(r.totais.acordos).toBe(2)
    expect(r.totais.vencidos).toBe(1)
    expect(r.totais.porResponsabilidade.naoClassificado).toBe(1)
  })

  it('O18: bug sem origem informada não é atribuído a nenhuma story', () => {
    const base = umaBase([
      ...varios(20, (i) => entregue(`S${i}`, 0, 1 + (i % 3))),
      entregue('B1', 2, 3, { tipo: 'Bug interno', fase: 'Produção' }),
    ])
    expect(() => calcularO18(ctxDe(base), F)).not.toThrow()
  })
})

describe('T1, T2, T3, T4, T5, E1: divisões por zero e dados ausentes', () => {
  it('T1: itens entregues no mesmo instante do compromisso têm fração de fila zero, não NaN', () => {
    // antes do expediente: o tempo corre, mas em horas úteis o total é zero
    const m = (i: number, min: string) => em(i % 10, `06:0${min}`)
    const base = umaBase(
      varios(22, (i) => ({
        id: `Z${i}`,
        criado: m(i, '0'),
        trilha: [
          ['Aguardando priorização', m(i, '0')],
          ['Pronto para desenvolver', m(i, '1')],
          ['Em desenvolvimento', m(i, '2')],
          ['Entregue', m(i, '3')],
        ],
      })),
    )
    const padrao = calcularT1(ctxDe(base), F).classes.find((c) => c.classe === 'Padrão')
    expect(padrao?.n).toBe(22)
    expect(padrao?.estatistica.status).toBe('ok')
    if (padrao?.estatistica.status === 'ok') expect(padrao.estatistica.valor.fracaoFilaPct).toBe(0)
  })

  it('T2: estouros sem compromisso não têm etapa atribuída; dentro/fora do SLE por classe', () => {
    const base = umaBase(
      varios(20, (i) => ({
        id: `L${i}`,
        criado: em(0, '08:00'),
        trilha: [
          ['Aguardando priorização', em(0, '08:00')],
          ['Em desenvolvimento', em(0, '09:00')],
          ['Entregue', em(10 + (i % 5), '16:00')],
        ],
      })),
    )
    const padrao = calcularT2(ctxDe(base), F).classes.find((c) => c.classe === 'Padrão')
    expect(padrao?.estouros.total).toBe(20)
    expect(padrao?.estouros.porEtapa.every((e) => e.contagem === 0)).toBe(true)
    expect(padrao?.statusMeta).toBe('fora')
  })

  it('T3: sem alocação acordada configurada, o acordado é 0', () => {
    const base = umaBase(varios(21, (i) => entregue(`A${i}`, i % 10, (i % 10) + 1)))
    const r = calcularT3(ctxDe(base), F)
    expect(r.status).toBe('ok')
    expect(r.naturezas.every((n) => n.acordadoPct === 0)).toBe(true)
  })

  it('T4: período curto sem semana completa não tem médias; chegadas sem entregas não têm razão', () => {
    const base = umaBase(
      varios(25, (i) => ({
        id: `C${i}`,
        criado: em(i % 5, '08:00'),
        trilha: [['Aguardando priorização', em(i % 5, '08:00')]],
      })),
    )
    const r = calcularT4(ctxDe(base), { ...F, periodo: { tipo: '12s' } })
    const padrao = r.classes.find((c) => c.classe === 'Padrão')
    expect(padrao?.estatistica.status).toBe('ok')
    if (padrao?.estatistica.status === 'ok') expect(padrao.estatistica.valor.razao).toBeNull()
    const curto = calcularT4(ctxDe(base), {
      ...F,
      periodo: { tipo: 'custom', de: '2026-10-05', ate: '2026-10-09' },
    })
    expect(curto.classes.every((c) => c.estatistica.status === 'insuficiente')).toBe(true)
  })

  it('T5: sem sistema com 20 demandas, não há variação semestral', () => {
    const base = umaBase(varios(5, (i) => entregue(`D${i}`, i, i + 1)))
    expect(calcularT5(ctxDe(base), F).variacaoSemestre).toEqual([])
  })

  it('E1: sem 20 projetos concluídos na janela e no período anterior a variação fica indisponível', () => {
    const base = umaBase(
      varios(22, (i) =>
        entregue(`P${i}`, i % 10, (i % 10) + 1, { gran: 'projeto', tipo: 'Iniciativa' }),
      ),
    )
    const r = calcularE1(ctxDe(base), F)
    const inic = r.segmentos.find((s) => s.chave === 'iniciativa')
    expect(inic?.estatistica.status).toBe('ok')
    expect(inic?.variacaoMediana.status).toBe('indisponivel')
    expect(inic?.variacaoMediana.atual).not.toBeNull()
    expect(inic?.variacaoMediana.anterior).toBeNull()
  })

  it('E1: projetos concluídos no mesmo instante do início têm fração de espera zero', () => {
    const base = umaBase(
      varios(22, (i) => {
        const k = i % 10
        return {
          id: `Q${i}`,
          criado: em(k, '06:00'),
          gran: 'projeto' as const,
          tipo: 'Melhoria' as const,
          trilha: [
            ['Aguardando priorização', em(k, '06:00')],
            ['Em desenvolvimento', em(k, '06:01')],
            ['Entregue', em(k, '06:02')],
          ] as [string, string][],
        }
      }),
    )
    const mel = calcularE1(ctxDe(base), F).segmentos.find((s) => s.chave === 'melhoria')
    expect(mel?.estatistica.status).toBe('ok')
    if (mel?.estatistica.status === 'ok') expect(mel.estatistica.valor.fracaoAntesPct).toBe(0)
  })
})

const em2 = (k: number) => Date.parse(em(k, '09:00'))

describe('índice, estado e blocos: dados incompletos', () => {
  const comBloqueioAberto = (): { base: BaseBM; bloqueio: FatoBloqueio } => {
    const base = umaBase([entregue('K', 0, 2)])
    const bloqueio: FatoBloqueio = {
      card_id: 'K',
      motivo: 'Aguardando fornecedor',
      coluna_em_que_bloqueou: 'Em desenvolvimento',
      fornecedor: null,
      inicio: base.transicoes[2]?.timestamp ?? 0,
      fim: null,
      duracao_horas_uteis: null,
    }
    base.bloqueios.push(bloqueio)
    return { base, bloqueio }
  }

  it('blocosDe: sem compromisso devolve null; bloqueio sem fim é limitado à entrega', () => {
    const semComp = ctxDe(
      umaBase([
        {
          id: 'N',
          criado: em(0, '08:00'),
          trilha: [
            ['Aguardando priorização', em(0, '08:00')],
            ['Em desenvolvimento', em(0, '09:00')],
            ['Entregue', em(1, '12:00')],
          ],
        },
      ]),
    )
    expect(blocosDe(semComp, semComp.idx.marcosPorId.get('N') as never)).toBeNull()
    const { base } = comBloqueioAberto()
    const ctx = ctxDe(base)
    const b = blocosDe(ctx, ctx.idx.marcosPorId.get('K') as never)
    expect(b).not.toBeNull()
    expect((b?.espera ?? 0) > 0).toBe(true)
  })

  it('card sem transições, com transição para coluna desconhecida e devolvido à fila depois de entregue', () => {
    const base = umaBase([entregue('E', 0, 1), entregue('R', 0, 1)])
    const vazio = umCard({ id: 'V', criado: em(0, '08:00'), trilha: [] }).card
    base.cards.push(vazio)
    const fantasma: FatoTransicao = {
      card_id: 'F',
      coluna_origem: null,
      coluna_destino: 'Coluna Fantasma',
      tipo_coluna: 'fila',
      usuario: 'Pessoa 01',
      timestamp: base.transicoes[0]?.timestamp ?? 0,
      direcao: 'avanco',
    }
    base.cards.push({ ...vazio, card_id: 'F', coluna_atual: 'Coluna Fantasma' })
    base.transicoes.push(fantasma)
    const ultimaDeR = base.transicoes.filter((t) => t.card_id === 'R').at(-1) as FatoTransicao
    base.transicoes.push({
      ...ultimaDeR,
      coluna_origem: 'Entregue',
      coluna_destino: 'Aguardando priorização',
      tipo_coluna: 'fila',
      timestamp: ultimaDeR.timestamp + 3_600_000,
      direcao: 'retorno',
    })
    const g = umCard({
      id: 'G',
      criado: em(0, '08:00'),
      trilha: [
        ['Aguardando priorização', em(0, '08:00')],
        ['Em desenvolvimento', em(1, '09:00')],
      ],
    })
    base.cards.push(g.card)
    base.transicoes.push(...g.trs, { ...fantasma, card_id: 'G', timestamp: em2(2) })
    const ctx = ctxDe(base)
    const m = (id: string) =>
      ctx.idx.marcosPorId.get(id) as NonNullable<ReturnType<typeof ctx.idx.marcosPorId.get>>
    expect(m('V')).toMatchObject({ ultimaTransicao: null, papelAtual: null, tipoColunaAtual: null })
    expect(m('F')).toMatchObject({ papelAtual: null, entrega: null })
    expect(m('R').entrega).toBeNull()
    expect(estadoEm(ctx, m('V'), ctx.hoje).coluna).toBeNull()
    expect(estadoEm(ctx, m('F'), ctx.hoje)).toMatchObject({
      coluna: 'Coluna Fantasma',
      papel: null,
    })
    // o card que saiu para uma coluna desconhecida continua contando como em progresso
    expect(calcularO1(ctx, F).serie.some((d) => d.wip > 0)).toBe(true)
  })

  it('idade em horas úteis ignora segmentos que começam depois do instante pedido', () => {
    const ctx = ctxDe(umaBase([entregue('I', 2, 3)]))
    const m = ctx.idx.marcosPorId.get('I') as NonNullable<
      ReturnType<typeof ctx.idx.marcosPorId.get>
    >
    const antes = m.segmentos[0]?.ini ?? 0
    expect(idadeHUEm(ctx, m, antes - 86_400_000)).toBe(0)
    expect(idadeHUEm(ctx, m, ctx.hoje)).toBeGreaterThan(0)
  })
})

describe('EI e T7: segmentos sem marcos e frentes sem projeto', () => {
  it('EI: entregas sem compromisso não entram no FL1 nem no FL2', () => {
    const base = umaBase(
      varios(22, (i) => ({
        id: `M${i}`,
        criado: em(i % 10, '08:00'),
        trilha: [
          ['Aguardando priorização', em(i % 10, '08:00')],
          ['Em desenvolvimento', em(i % 10, '09:00')],
          ['Entregue', em(i % 10, '16:00')],
        ],
      })),
    )
    const ctx = ctxDe(base)
    expect(calcularEIBM(ctx, F, 'FL1').base.n).toBe(0)
    expect(calcularEIBM(ctx, F, 'FL2').base.n).toBe(0)
  })

  it('EI FL2: frente concluída sem compromisso fica fora', () => {
    const base = umaBase([
      {
        id: 'FR',
        criado: em(0, '08:00'),
        gran: 'frente',
        trilha: [
          ['Aguardando priorização', em(0, '08:00')],
          ['Entregue', em(1, '08:00')],
        ],
      },
    ])
    expect(calcularEIBM(ctxDe(base), F, 'FL2').base.n).toBe(0)
  })

  it('T7: frente sem projeto agrupa em "Sem projeto"; idades são classificadas contra P85 e P95', () => {
    // ciclos de 1 a 20 dias úteis: P85 ~ 17 e P95 ~ 19
    const concluidas = varios(20, (i) => ({
      id: `FC${i}`,
      criado: em(0, '08:00'),
      gran: 'frente' as const,
      trilha: [
        ['Aguardando priorização', em(0, '08:00')],
        ['Em desenvolvimento', em(0, '09:00')],
        ['Entregue', em(i + 1, '09:00')],
      ] as [string, string][],
    }))
    const aberta = (id: string, k: number, pai: string | null): EspecCard => ({
      id,
      criado: em(0, '08:00'),
      gran: 'frente',
      pai,
      trilha: [
        ['Aguardando priorização', em(0, '08:00')],
        ['Em desenvolvimento', em(k, '09:00')],
      ],
    })
    const projeto: EspecCard = {
      id: 'PRJ',
      criado: em(0, '08:00'),
      gran: 'projeto',
      trilha: [['Aguardando priorização', em(0, '08:00')]],
    }
    const abertas = varios(24, (i) => aberta(`FA${i}`, 25 + i, i % 2 === 0 ? 'PRJ' : null))
    const r = calcularT7(ctxDe(umaBase([...concluidas, projeto, ...abertas])), F)
    const nomes = r.porProjeto.map((p) => p.projeto)
    expect(nomes).toContain('Sem projeto')
    expect(nomes).toContain('Card PRJ')
    expect(new Set(r.idades.map((i) => i.situacao))).toEqual(
      new Set(['dentro', 'entre-p85-p95', 'acima-p95']),
    )
  })
})

describe('E1: variação da mediana contra o ano anterior', () => {
  const projetos = (prefixo: string, mes: string, total: number, n: number, k = 0) =>
    varios(n, (i) => ({
      id: `${prefixo}${i}`,
      criado: `${mes}-0${1 + (i % 5)}T08:00-03:00`,
      gran: 'projeto' as const,
      tipo: 'Iniciativa' as const,
      trilha: [
        ['Aguardando priorização', `${mes}-0${1 + (i % 5)}T08:00-03:00`],
        ['Em desenvolvimento', `${mes}-0${1 + (i % 5)}T${k === 0 ? '09' : '08'}:00-03:00`],
        ['Entregue', `${mes}-${String(total + (i % 5)).padStart(2, '0')}T16:00-03:00`],
      ] as [string, string][],
    }))

  it('com 20 projetos na janela e 20 na janela de um ano antes, calcula a variação percentual', () => {
    const base = umaBase([...projetos('N', '2026-08', 10, 20), ...projetos('A', '2025-08', 17, 20)])
    const inic = calcularE1(ctxDe(base), F).segmentos.find((s) => s.chave === 'iniciativa')
    expect(inic?.variacaoMediana.status).toBe('ok')
    const { atual, anterior, variacaoPct } = inic?.variacaoMediana as {
      atual: number
      anterior: number
      variacaoPct: number
    }
    expect(anterior).toBeGreaterThan(atual)
    expect(variacaoPct).toBeLessThan(0)
  })

  it('anterior com mediana zero deixa a variação indisponível (sem dividir por zero)', () => {
    const zero = varios(20, (i) => ({
      id: `Z${i}`,
      criado: '2025-08-04T06:00-03:00',
      gran: 'projeto' as const,
      tipo: 'Iniciativa' as const,
      trilha: [
        ['Aguardando priorização', '2025-08-04T06:00-03:00'],
        ['Em desenvolvimento', '2025-08-04T06:01-03:00'],
        ['Entregue', '2025-08-04T06:02-03:00'],
      ] as [string, string][],
    }))
    const base = umaBase([...projetos('N', '2026-08', 10, 20), ...zero])
    const inic = calcularE1(ctxDe(base), F).segmentos.find((s) => s.chave === 'iniciativa')
    expect(inic?.variacaoMediana).toMatchObject({ status: 'indisponivel', anterior: 0 })
    expect(inic?.variacaoMediana.variacaoPct).toBeNull()
  })

  it('só o período anterior publicado: atual fica nulo e a variação indisponível', () => {
    const base = umaBase([...projetos('N', '2026-08', 10, 5), ...projetos('A', '2025-08', 17, 20)])
    const inic = calcularE1(ctxDe(base), F).segmentos.find((s) => s.chave === 'iniciativa')
    expect(inic?.variacaoMediana).toMatchObject({ status: 'indisponivel', atual: null })
    expect(inic?.variacaoMediana.anterior).not.toBeNull()
  })
})

describe('auxiliares de fixture', () => {
  it('umCard recusa coluna desconhecida e aceita card sem trilha', () => {
    expect(() =>
      umCard({ id: 'U', criado: em(0, '08:00'), trilha: [['Coluna inexistente', em(0, '08:00')]] }),
    ).toThrow('coluna Coluna inexistente')
    expect(umCard({ id: 'U', criado: em(0, '08:00'), trilha: [] }).card.coluna_atual).toBeNull()
    expect(
      umCard({ id: 'U', criado: em(0, '08:00'), trilha: [], dataAcordada: em(2, '12:00') }).card
        .data_acordada,
    ).not.toBeNull()
  })
})
