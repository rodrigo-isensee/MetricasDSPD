import { describe, expect, it } from 'vitest'
import {
  fraseDaSerie,
  fraseDaSerieSla,
  marcacoesUnicas,
  mesPorExtenso,
  numeroAcimaP95,
  numeroP85,
  numeroS1,
  numeroS2,
  numeroS3,
  numeroVazao,
  numeroVencidosInternos,
  serieConcluidos,
  serieP85,
  serieSla,
  serieVolume,
  tipoPredominante,
  tiposEmpatados,
  type PontoMensal,
} from './modelo'

const J = { inicio: '2026-07-18', fim: '2026-10-09' }
const classe = (tipo: string, n: number, status: 'ok' | 'insuficiente' = 'ok') => ({
  tipo,
  n,
  estatistica:
    status === 'ok'
      ? { status, n, valor: { p50: 4.4, p85: 9.4, p95: 15 }, janela: J }
      : { status, n, minimo: 20, janela: J },
})
const o3 = (...cs: ReturnType<typeof classe>[]) => ({ classes: cs }) as never

describe('número P85 (P1: tipo predominante, nunca entre tipos)', () => {
  it('escolhe o tipo com mais itens e rotula com ele', () => {
    const o = o3(classe('Bug', 30), classe('Melhoria', 90))
    expect(tipoPredominante(o)?.tipo).toBe('Melhoria')
    const n = numeroP85(o)
    expect(n).toMatchObject({
      id: 'p85',
      rotulo: 'P85 do tempo de ciclo · Melhoria',
      valor: '9',
      secundario: 'P50: 4 dias úteis',
      base: '90 itens concluídos',
      visao: 'semanal',
    })
    expect(numeroP85(o3(classe('Bug', 1))).base).toBe('1 item concluído')
  })
  it('empate no tipo predominante: ordem fixa do cartão O3, não a de chegada, e o rótulo diz "empate com"', () => {
    const a = o3(classe('Melhoria', 40), classe('Incidente', 40), classe('Bug interno', 40))
    const b = o3(classe('Bug interno', 40), classe('Melhoria', 40), classe('Incidente', 40))
    for (const o of [a, b]) {
      expect(tipoPredominante(o)?.tipo).toBe('Incidente')
      expect(tiposEmpatados(o)).toEqual(['Melhoria', 'Bug interno'])
      expect(numeroP85(o)).toMatchObject({
        rotulo: 'P85 do tempo de ciclo · Incidente',
        base: '40 itens concluídos; empate com Melhoria, Bug interno',
      })
    }
    // tipo fora do catálogo desempata por último, e por nome
    const c = o3(classe('Zeta', 5), classe('Alfa', 5), classe('Melhoria', 5))
    expect(tipoPredominante(c)?.tipo).toBe('Melhoria')
    expect(tiposEmpatados(c)).toEqual(['Alfa', 'Zeta'])
    expect(tiposEmpatados(o3())).toEqual([])
    expect(tiposEmpatados(o3(classe('Bug', 30), classe('Melhoria', 90)))).toEqual([])
  })
  it('abaixo de 20 itens não publica', () => {
    const n = numeroP85(o3(classe('Dívida técnica', 14, 'insuficiente')))
    expect(n.valor).toBeNull()
    expect(n.insuficiente).toBe('Poucos itens (n=14). Estatística não publicada.')
    expect(n.secundario).toBeUndefined()
  })
  it('sem nenhuma classe', () => {
    const n = numeroP85(o3())
    expect(n).toMatchObject({
      valor: null,
      rotulo: 'P85 do tempo de ciclo',
      base: '0 itens concluídos',
    })
    expect(n.insuficiente).toContain('n=0')
  })
})

describe('demais números', () => {
  const o4 = (semanas: { itens: number; emAndamento: boolean }[], faixa: unknown) =>
    ({ semanas, faixa, base: { n: 120, unidade: 'itens concluídos' } }) as never
  it('vazão: última semana fechada e a faixa; sem faixa publicada diz o n', () => {
    const a = numeroVazao(
      o4(
        [
          { itens: 9, emAndamento: false },
          { itens: 11, emAndamento: false },
          { itens: 2, emAndamento: true },
        ],
        {
          status: 'ok',
          n: 12,
          valor: { min: 8, max: 15, mediana: 11 },
          janela: J,
        },
      ),
    )
    expect(a).toMatchObject({
      valor: '11',
      unidade: 'itens concluídos',
      base: '120 itens concluídos',
    })
    expect(a.secundario).toBe('Faixa das semanas da janela: 8 a 15 por semana')
    const b = numeroVazao(
      o4([{ itens: 1, emAndamento: false }], {
        status: 'insuficiente',
        n: 3,
        minimo: 20,
        janela: J,
      }),
    )
    expect(b).toMatchObject({ valor: '1', unidade: 'item concluído' })
    expect(b.secundario).toBe('Faixa não publicada (n=3).')
    const c = numeroVazao(
      o4([{ itens: 2, emAndamento: true }], {
        status: 'insuficiente',
        n: 0,
        minimo: 20,
        janela: J,
      }),
    )
    expect(c).toMatchObject({ valor: null, unidade: 'itens concluídos' })
  })
  it('acima do P95 e vencidos internos: status só quando há meta avaliada', () => {
    const base = { base: { n: 64, unidade: 'itens' } }
    expect(numeroAcimaP95({ ...base, acimaP95: 3, statusMeta: 'fora' } as never)).toMatchObject({
      valor: '3',
      unidade: 'itens',
      status: 'fora',
      meta: 'Meta: nenhum sem plano',
      visao: 'diaria',
    })
    expect(
      numeroAcimaP95({ ...base, acimaP95: 1, statusMeta: 'sem-referencia' } as never).status,
    ).toBeUndefined()
    expect(numeroAcimaP95({ ...base, acimaP95: 1, statusMeta: 'dentro' } as never).unidade).toBe(
      'item',
    )
    expect(
      numeroVencidosInternos({ ...base, vencidosCausaInterna: 0, statusMeta: 'dentro' } as never),
    ).toMatchObject({
      valor: '0',
      status: 'dentro',
      meta: 'Meta: zero',
    })
    expect(
      numeroVencidosInternos({
        ...base,
        vencidosCausaInterna: 2,
        statusMeta: 'sem-referencia',
      } as never).status,
    ).toBeUndefined()
  })
  const celula = (ok: boolean, meta: string) => ({
    taxa: ok
      ? { status: 'ok', k: 20, n: 25, pct: 80 }
      : { status: 'insuficiente', k: 1, n: 3, minimo: 20 },
    statusMeta: meta,
  })
  it('S2 e S1: k de m avaliadas, com status ou "não publicado"', () => {
    const base = { base: { n: 500, unidade: 'chamados fechados' } }
    const s2 = (ps: [boolean, string][]) =>
      ({
        ...base,
        prioridades: ps.map(([ok, m], i) => ({
          prioridade: `P${i + 1}`,
          primeiroAtendimento: celula(ok, m),
          restauracao: celula(ok, m),
        })),
      }) as never
    expect(
      numeroS2(
        s2([
          [true, 'fora'],
          [true, 'dentro'],
          [false, 'sem-referencia'],
        ]),
      ),
    ).toMatchObject({
      valor: '1 de 2',
      unidade: 'prioridades avaliadas',
      status: 'fora',
    })
    expect(numeroS2(s2([[true, 'dentro']]))).toMatchObject({
      valor: '0 de 1',
      unidade: 'prioridade avaliada',
      status: 'dentro',
    })
    const vazio = numeroS2(s2([[false, 'sem-referencia']]))
    expect(vazio.valor).toBeNull()
    expect(vazio.status).toBeUndefined()
    expect(vazio.insuficiente).toContain('Nenhuma prioridade com 20 chamados')
    const s1 = (ps: [string, boolean][]) =>
      ({
        ...base,
        prioridades: ps.map(([m, ok]) => ({
          restauracao: { statusMeta: m, estatistica: { status: ok ? 'ok' : 'insuficiente' } },
        })),
      }) as never
    expect(
      numeroS1(
        s1([
          ['fora', true],
          ['dentro', true],
        ]),
      ),
    ).toMatchObject({ valor: '1 de 2', status: 'fora', visao: 'sustentacao' })
    expect(numeroS1(s1([['dentro', true]]))).toMatchObject({ valor: '0 de 1', status: 'dentro' })
    expect(numeroS1(s1([['sem-referencia', false]])).valor).toBeNull()
    // D-06: o S1 escreve o alvo, como S2, O3, O2 e O12
    expect(numeroS1(s1([['dentro', true]])).meta).toBe(
      'Meta: mediana dentro do alvo de cada prioridade',
    )
  })
  it('S3: volume sempre publicado e P1+P2 em k de n quando há menos de 20', () => {
    const base = { base: { n: 951, unidade: 'chamados abertos' } }
    const ok = numeroS3({
      ...base,
      janela: { total: 951, p1p2: { status: 'ok', k: 65, n: 951, pct: 6.83 } },
    } as never)
    expect(ok).toMatchObject({ valor: '951', unidade: 'chamados abertos' })
    expect(ok.secundario).toBe('P1+P2: 7% (65 de 951)')
    const poucos = numeroS3({
      ...base,
      janela: { total: 1, p1p2: { status: 'insuficiente', k: 1, n: 1, minimo: 20 } },
    } as never)
    expect(poucos).toMatchObject({ valor: '1', unidade: 'chamado aberto' })
    expect(poucos.secundario).toBe('P1+P2: 1 de 1 (percentual só com 20 chamados ou mais)')
  })
})

describe('séries mensais', () => {
  const mes = (m: string, extra: object) => ({
    mes: m,
    fimDoMes: `${m}-28`,
    janelaPercentis: J,
    ...extra,
  })
  it('P85 do tipo escolhido; mês sem o tipo ou insuficiente fica sem valor', () => {
    const t = {
      meses: [
        mes('2026-08', { p85PorTipo: [classe('Melhoria', 40)], concluidos: 10 }),
        mes('2026-09', { p85PorTipo: [classe('Melhoria', 14, 'insuficiente')], concluidos: 0 }),
        mes('2026-10', { p85PorTipo: [classe('Bug', 40)], concluidos: 1 }),
      ],
    } as never
    expect(serieP85(t, 'Melhoria')).toEqual([
      { mes: '2026-08', valor: 9.4, n: 40, texto: '9 dias úteis' },
      { mes: '2026-09', valor: null, n: 14, texto: 'poucos itens (n=14)' },
      { mes: '2026-10', valor: null, n: 0, texto: 'poucos itens (n=0)' },
    ])
    expect(serieConcluidos(t).map((p) => [p.valor, p.texto])).toEqual([
      [10, '10 itens'],
      [0, '0 itens'],
      [1, '1 item'],
    ])
  })
  it('prioridades fora do alvo em k de m avaliadas; m = 0 não publica; volume por mês', () => {
    const cel = (ok: boolean, meta: string) => ({
      taxa: ok
        ? { status: 'ok', k: 20, n: 25, pct: 80 }
        : { status: 'insuficiente', k: 1, n: 3, minimo: 20 },
      statusMeta: meta,
    })
    const pr = (ps: [boolean, string][]) =>
      ps.map(([ok, m], i) => ({
        prioridade: `P${i + 1}`,
        primeiroAtendimento: cel(ok, m),
        restauracao: cel(ok, m),
      }))
    const t = {
      meses: [
        {
          mes: '2026-08',
          fimDoMes: '2026-08-31',
          janela: J,
          prioridades: pr([
            [true, 'fora'],
            [true, 'dentro'],
            [false, 'sem-referencia'],
          ]),
          volume: 300,
        },
        {
          mes: '2026-09',
          fimDoMes: '2026-09-30',
          janela: J,
          prioridades: pr([[false, 'sem-referencia']]),
          volume: 1,
        },
      ],
    } as never
    // D-08: a frase diz o que foi contado (abaixo de 90%)
    expect(fraseDaSerieSla([{ mes: '2026-09', valor: 2, n: 5, texto: '2 de 5 avaliadas' }])).toBe(
      'Em setembro: 2 de 5 prioridades avaliadas estão abaixo de 90%.',
    )
    expect(fraseDaSerieSla([{ mes: '2026-09', valor: 1, n: 5, texto: '1 de 5 avaliadas' }])).toBe(
      'Em setembro: 1 de 5 prioridades avaliadas está abaixo de 90%.',
    )
    expect(fraseDaSerieSla([])).toBe('')
    expect(fraseDaSerieSla([{ mes: '2026-07', valor: null, n: 0, texto: 'não publicado' }])).toBe(
      'Em julho: não publicado. Valor não publicado.',
    )
    expect(fraseDaSerieSla([{ mes: '2026-07', valor: 0, n: null, texto: '0' }])).toBe(
      'Em julho: 0 de 0 prioridades avaliadas estão abaixo de 90%.',
    )
    expect(serieSla(t)).toEqual([
      { mes: '2026-08', valor: 1, n: 2, texto: '1 de 2 avaliadas' },
      {
        mes: '2026-09',
        valor: null,
        n: 0,
        texto: 'não publicado (nenhuma prioridade com 20 chamados)',
      },
    ])
    expect(serieVolume(t).map((p) => p.texto)).toEqual(['300 chamados', '1 chamado'])
  })
})

describe('frase de leitura e utilidades', () => {
  const p = (mes: string, valor: number | null, texto: string): PontoMensal => ({
    mes,
    valor,
    n: valor,
    texto,
  })
  it('compara com o mês anterior, sem adjetivos', () => {
    expect(
      fraseDaSerie([p('2026-08', 16, '16 dias úteis'), p('2026-09', 14, '14 dias úteis')], true),
    ).toBe('Em setembro: 14 dias úteis, 2 a menos que em agosto.')
    expect(fraseDaSerie([p('2026-08', 10, '10'), p('2026-09', 14, '14')], true)).toBe(
      'Em setembro: 14, 4 a mais que em agosto.',
    )
    // a diferença sai dos números como aparecem na tela: 14,4 -> 14 e 12,6 -> 13 dão "1 a menos"
    expect(fraseDaSerie([p('2026-08', 14.4, '14'), p('2026-09', 12.6, '13')], true)).toBe(
      'Em setembro: 13, 1 a menos que em agosto.',
    )
    expect(fraseDaSerie([p('2026-08', 14, '14'), p('2026-09', 14, '14')], true)).toBe(
      'Em setembro: 14, igual a agosto.',
    )
  })
  it('sem comparação: sem mês anterior, anterior sem valor, ou comparar desligado', () => {
    expect(fraseDaSerie([p('2026-09', 14, '14')], true)).toBe('Em setembro: 14.')
    expect(fraseDaSerie([p('2026-08', null, 'x'), p('2026-09', 14, '14')], true)).toBe(
      'Em setembro: 14.',
    )
    expect(fraseDaSerie([p('2026-08', 1, '1'), p('2026-09', 14, '14')], false)).toBe(
      'Em setembro: 14.',
    )
  })
  it('último mês sem valor diz que não foi publicado; série vazia, nada', () => {
    expect(fraseDaSerie([p('2026-09', null, 'poucos itens (n=14)')], true)).toBe(
      'Em setembro: poucos itens (n=14). Valor não publicado.',
    )
    expect(fraseDaSerie([], true)).toBe('')
  })
  it('mês por extenso e mudanças de critério sem repetição', () => {
    expect(mesPorExtenso('2026-03')).toBe('março')
    const m = { id: 'a', data: '2026-06-10', descricao: 'x' }
    expect(
      marcacoesUnicas({ serie: [m], janela: [m, { ...m, id: 'b' }] }).map((x) => x.id),
    ).toEqual(['a', 'b'])
  })
})
