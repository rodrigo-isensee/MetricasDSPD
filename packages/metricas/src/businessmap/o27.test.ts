import { describe, expect, it } from 'vitest'
import { CAUSAS_RAIZ_BUG, type FiltrosFluxo, type TipoCard } from '@metricas-dspd/contratos'
import { SCHEMAS_RESULTADO } from '@metricas-dspd/contratos/validacao'
import { CALENDARIO_PADRAO } from '../core/calendario'
import { calcularO27 } from './index'
import { criarContextoBM } from './indice'
import { HOJE_TESTE, trilhaSimples, umaBase, type EspecCard } from './testing'

const F: FiltrosFluxo = { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12s' } }
const DENTRO = '2026-09-03T08:00:00-03:00'
const FORA = '2026-05-04T08:00:00-03:00'

const bug = (
  id: string,
  tipo: TipoCard,
  causaRaiz: string | null,
  fim: string = DENTRO,
): EspecCard => ({
  id,
  tipo,
  causaRaiz,
  criado: '2026-08-20T08:00:00-03:00',
  trilha: trilhaSimples(
    '2026-08-20T08:00:00-03:00',
    '2026-08-20T09:00:00-03:00',
    '2026-08-21T08:00:00-03:00',
    fim,
  ),
})
const varios = (prefixo: string, n: number, tipo: TipoCard, causa: string | null) =>
  Array.from({ length: n }, (_, i) => bug(`${prefixo}-${i}`, tipo, causa))
const calcular = (cards: EspecCard[], f: FiltrosFluxo = F) =>
  calcularO27(criarContextoBM(umaBase(cards), HOJE_TESTE, CALENDARIO_PADRAO), f)
const coluna = (r: ReturnType<typeof calcular>, tipo: TipoCard) => {
  const c = r.porTipo.find((x) => x.tipo === tipo)
  if (!c) throw new Error(`sem coluna ${tipo}`)
  return c
}

describe('O27: causa raiz dos bugs (BusinessMap)', () => {
  it('borda do mínimo por tipo: 19 bugs com causa não publicam a distribuição; 20 publicam', () => {
    const r19 = calcular(varios('a', 19, 'Bug interno', 'efeito_colateral'))
    expect(coluna(r19, 'Bug interno')).toMatchObject({ n: 19, comCausa: 19, causas: null })
    const r20 = calcular(varios('a', 20, 'Bug interno', 'efeito_colateral'))
    const c = coluna(r20, 'Bug interno')
    expect(c.comCausa).toBe(20)
    expect(c.causas).not.toBeNull()
    expect(c.causas?.find((x) => x.causa === 'efeito_colateral')).toMatchObject({ n: 20, pct: 100 })
  })

  it('o mínimo vale por tipo: um tipo com 20 publica e o outro, com 19, não; as colunas nunca se somam', () => {
    const r = calcular([
      ...varios('a', 20, 'Bug interno', 'falha_integracao'),
      ...varios('b', 19, 'Defeito em produção', 'falha_integracao'),
    ])
    expect(coluna(r, 'Bug interno').causas).not.toBeNull()
    expect(coluna(r, 'Defeito em produção').causas).toBeNull()
    expect(r.base.n).toBe(39)
  })

  it('causa não informada fica fora do denominador e do mínimo; é contada à parte', () => {
    const r = calcular([
      ...varios('a', 19, 'Bug interno', 'teste_insuficiente'),
      ...varios('b', 30, 'Bug interno', null),
    ])
    const c = coluna(r, 'Bug interno')
    expect(c).toMatchObject({ n: 49, naoInformada: 30, comCausa: 19, causas: null })
    const r2 = calcular([
      ...varios('a', 20, 'Bug interno', 'teste_insuficiente'),
      ...varios('b', 20, 'Bug interno', null),
    ])
    const c2 = coluna(r2, 'Bug interno')
    expect(c2).toMatchObject({ n: 40, naoInformada: 20, comCausa: 20 })
    expect(c2.causas?.find((x) => x.causa === 'teste_insuficiente')?.pct).toBe(100)
    expect(c2.causas?.reduce((s, x) => s + x.n, 0)).toBe(20)
  })

  it('valor fora do domínio conta como não informada, nunca como causa', () => {
    const r = calcular([
      ...varios('a', 20, 'Bug interno', 'layout_interface'),
      ...varios('b', 5, 'Bug interno', 'texto qualquer fora da lista'),
    ])
    expect(coluna(r, 'Bug interno')).toMatchObject({ n: 25, naoInformada: 5, comCausa: 20 })
  })

  it('"Não é bug" e "Outros" entram na distribuição como causa (D1), com n e %', () => {
    const r = calcular([
      ...varios('a', 10, 'Defeito em produção', 'nao_e_bug'),
      ...varios('b', 5, 'Defeito em produção', 'outros'),
      ...varios('c', 5, 'Defeito em produção', 'efeito_colateral'),
    ])
    const c = coluna(r, 'Defeito em produção')
    expect(c.naoEBug).toBe(10)
    expect(c.comCausa).toBe(20)
    expect(c.causas?.find((x) => x.causa === 'nao_e_bug')).toMatchObject({ n: 10, pct: 50 })
    expect(c.causas?.find((x) => x.causa === 'outros')).toMatchObject({ n: 5, pct: 25 })
  })

  it('ordem do campo, sem reordenar por tamanho (D4): as 12 opções sempre, na ordem do domínio', () => {
    const r = calcular([
      ...varios('a', 18, 'Bug interno', 'outros'),
      ...varios('b', 2, 'Bug interno', 'requisito_alterado'),
    ])
    const causas = coluna(r, 'Bug interno').causas ?? []
    expect(causas.map((x) => x.causa)).toEqual(CAUSAS_RAIZ_BUG.map((c) => c.codigo))
    expect(causas.map((x) => x.rotulo)).toEqual(CAUSAS_RAIZ_BUG.map((c) => c.rotulo))
  })

  it('D2: entram os bugs concluídos e os descartados na janela; fora dela, não', () => {
    const descartado = (id: string, quando: string): EspecCard => ({
      id,
      tipo: 'Bug interno',
      causaRaiz: 'nao_e_bug',
      criado: '2026-08-20T08:00:00-03:00',
      trilha: [['Aguardando priorização', '2026-08-20T08:00:00-03:00']],
      descarte: quando,
    })
    const r = calcular([
      ...varios('a', 3, 'Bug interno', 'falha_integracao'),
      descartado('d1', '2026-09-10T08:00:00-03:00'),
      descartado('d2', '2026-09-11T08:00:00-03:00'),
      descartado('d3', '2026-05-11T08:00:00-03:00'),
      bug('antigo', 'Bug interno', 'falha_integracao', FORA),
    ])
    expect(coluna(r, 'Bug interno')).toMatchObject({ n: 5, naoEBug: 2, comCausa: 5 })
  })

  it('excluídos e subtarefas ficam fora; arquivado entregue entra', () => {
    const base = umaBase([
      bug('ok', 'Bug interno', 'efeito_colateral'),
      bug('sub', 'Bug interno', 'efeito_colateral'),
      bug('excl', 'Bug interno', 'efeito_colateral'),
      bug('arq', 'Bug interno', 'efeito_colateral'),
    ])
    const por = (id: string) => base.cards.find((c) => c.card_id === id)
    ;(por('sub') as { eh_subtarefa: boolean }).eh_subtarefa = true
    ;(por('excl') as { excluido_em: number | null }).excluido_em = Date.parse(
      '2026-09-01T08:00:00-03:00',
    )
    ;(por('arq') as { arquivado_em: number | null }).arquivado_em = Date.parse(
      '2026-09-20T08:00:00-03:00',
    )
    const r = calcularO27(criarContextoBM(base, HOJE_TESTE, CALENDARIO_PADRAO), F)
    expect(coluna(r, 'Bug interno').n).toBe(2)
  })

  it('só bugs: outros tipos não entram; o filtro de tipo não atua', () => {
    const outros = (['Melhoria', 'Incidente'] as const).map((t, i) =>
      bug(`m${i}`, t, 'efeito_colateral'),
    )
    const r = calcular([...outros, bug('b', 'Bug interno', 'efeito_colateral')], {
      ...F,
      tipo: ['Melhoria'],
    })
    expect(r.base.n).toBe(1)
    expect(coluna(r, 'Defeito em produção').n).toBe(0)
  })

  it('porSistema é nulo com motivo; resultado válido no contrato e sem campo de pessoa', () => {
    const r = calcular(varios('a', 25, 'Bug interno', 'dados_massa_teste'))
    expect(r.porSistema).toBeNull()
    expect(r.motivoPorSistema).toMatch(/Sistema afetado/)
    expect(SCHEMAS_RESULTADO.O27.safeParse(r).success).toBe(true)
    const json = JSON.stringify(r)
    expect(json).not.toMatch(/respons|usuario|pessoa|equipe|acelerato|chamado/i)
  })

  it('sem bugs: duas colunas zeradas, sem distribuição', () => {
    const r = calcular([])
    expect(r.porTipo.map((c) => [c.tipo, c.n, c.causas])).toEqual([
      ['Bug interno', 0, null],
      ['Defeito em produção', 0, null],
    ])
    expect(SCHEMAS_RESULTADO.O27.safeParse(r).success).toBe(true)
  })
})
