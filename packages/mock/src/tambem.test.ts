import { describe, expect, it } from 'vitest'
import { gerarBaseBusinessMap, gerarBaseMock } from '.'
import { CONFIG_PADRAO } from './config'
import { PARAMETROS_TAMBEM, PASSOS_TAMBEM } from './businessmap/tambem'
import { hashJson } from './prng'

/**
 * B11a (pedido 011): o mock da fase 1 muda só a base do BusinessMap, e só por pós-processamento em streams próprias.
 * O Acelerato (BusinessMap e Acelerato nunca se misturam) não pode mudar um bit.
 */
describe('B11a: ajuste do mock da fase 1', () => {
  it('Acelerato intacto: hash da base (escala 1 e 0,2) igual ao de antes do ajuste', () => {
    expect(hashJson(gerarBaseMock().ac)).toBe('0113e077')
    expect(hashJson(gerarBaseMock({ escala: 0.2 }).ac)).toBe('39b4b005')
  })

  it('sem nenhum passo, a base do BusinessMap é a de antes (hash anterior), com ou sem a opção "tambem: false"', () => {
    expect(hashJson(gerarBaseBusinessMap(CONFIG_PADRAO, { tambem: false }))).toBe('f780e90f')
    expect(hashJson(gerarBaseBusinessMap(CONFIG_PADRAO, { omitir: PASSOS_TAMBEM }))).toBe(
      'f780e90f',
    )
    expect(hashJson(gerarBaseBusinessMap(CONFIG_PADRAO))).not.toBe('f780e90f')
  })

  it('streams próprias: o que nenhum passo toca sai idêntico e nenhum card some, só os de projeto parado entram', () => {
    const antes = gerarBaseBusinessMap(CONFIG_PADRAO, { tambem: false })
    const depois = gerarBaseBusinessMap(CONFIG_PADRAO)
    const novos = depois.cards.slice(antes.cards.length)
    expect(novos).toHaveLength(PARAMETROS_TAMBEM.projetosParados.length)
    expect(novos.every((c) => c.granularidade === 'projeto' && c.iniciado_em === null)).toBe(true)
    const porId = new Map(depois.cards.map((c) => [c.card_id, c]))
    expect(antes.cards.every((c) => porId.has(c.card_id))).toBe(true)
    const iguais = antes.cards.filter(
      (c) => JSON.stringify(porId.get(c.card_id)) === JSON.stringify(c),
    )
    // a maioria dos cards não é tocada por nenhum ajuste
    expect(iguais.length / antes.cards.length).toBeGreaterThan(0.4)
  })

  it('cada passo é independente: omitir um muda a base e a omissão é determinística (escala 0,25)', () => {
    const cfg = { ...CONFIG_PADRAO, escala: 0.25 }
    const completa = hashJson(gerarBaseBusinessMap(cfg))
    for (const passo of PASSOS_TAMBEM) {
      const sem = hashJson(gerarBaseBusinessMap(cfg, { omitir: [passo] }))
      expect(sem).not.toBe(completa)
      expect(hashJson(gerarBaseBusinessMap(cfg, { omitir: [passo] }))).toBe(sem)
    }
  })

  it('transições e bloqueios seguem coerentes: ordem no tempo por card, nada depois do "hoje", nada antes da criação', () => {
    const { bm } = gerarBaseMock()
    const hoje = Date.parse(CONFIG_PADRAO.hoje)
    const criado = new Map(bm.cards.map((c) => [c.card_id, c.criado_em]))
    const ultima = new Map<string, number>()
    for (const t of bm.transicoes) {
      expect(t.timestamp).toBeLessThanOrEqual(hoje)
      expect(t.timestamp).toBeGreaterThanOrEqual(criado.get(t.card_id) as number)
      expect(t.timestamp).toBeGreaterThanOrEqual(ultima.get(t.card_id) ?? 0)
      ultima.set(t.card_id, t.timestamp)
    }
    // B11a-6: subtarefa e bug filho nunca são criados antes do card pai (nem o início fica antes da criação)
    for (const c of bm.cards) {
      for (const pai of [c.card_pai, c.origem_bug]) {
        if (pai === null) continue
        expect(c.criado_em).toBeGreaterThanOrEqual(criado.get(pai) as number)
      }
      if (c.iniciado_em !== null) expect(c.iniciado_em).toBeGreaterThanOrEqual(c.criado_em)
    }
    for (const b of bm.bloqueios) {
      expect(b.inicio).toBeGreaterThanOrEqual(criado.get(b.card_id) as number)
      expect(b.fim === null || b.fim >= b.inicio).toBe(true)
    }
  })
})
