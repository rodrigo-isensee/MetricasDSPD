import { consultaApontamentoSchema } from '@metricas-dspd/contratos'
import { describe, expect, it } from 'vitest'
import { filtrosAtivos, lerFiltros } from './filtros'
import { RESPOSTA_FICTICIA } from './fixture'
import { ordenarPorTotal } from './ordem'
import { fraseDoAchado } from './textos'
import { horasDesde, fmtHoras } from './formatar'

describe('lerFiltros', () => {
  it('lê só o formato do contrato e descarta o resto sem eco', () => {
    const l = lerFiltros(
      new URLSearchParams(
        'equipe=portal,Maria,sem-time&tipo=3&qualidade=generico,xx&nivelMatriz=banana&de=2026-01-01',
      ),
    )
    expect(l.consulta.equipe).toEqual(['portal', 'sem-time'])
    expect(l.consulta.tipo).toEqual(['3'])
    expect(l.consulta.qualidade).toEqual(['generico'])
    expect(l.consulta.nivelMatriz).toBe('tipo')
    expect(l.consulta.de).toBeUndefined()
    expect(l.invalidos).toEqual(['Equipe', 'Qualidade', 'Período', 'Agrupar por'])
    expect(JSON.stringify(l.invalidos)).not.toContain('Maria')
  })

  it('período: de e ate juntos, de <= ate; padrão é "incluir" e ordem alfabética', () => {
    expect(lerFiltros(new URLSearchParams('de=2026-02-01&ate=2026-01-01')).invalidos).toEqual([
      'Período',
    ])
    const ok = lerFiltros(
      new URLSearchParams('de=2026-01-01&ate=2026-02-01&anomalos=ocultar&ordem=total'),
    )
    expect(ok.consulta).toMatchObject({ de: '2026-01-01', ate: '2026-02-01', anomalos: 'ocultar' })
    expect(ok.ordem).toBe('total')
    expect(lerFiltros(new URLSearchParams('')).ordem).toBe('alfabetica')
  })

  it('janela do mapa diário: par válido entra, par inválido é descartado e avisado', () => {
    expect(
      lerFiltros(new URLSearchParams('diarioDe=2026-10-01&diarioAte=2026-10-20')).consulta,
    ).toMatchObject({
      diarioDe: '2026-10-01',
      diarioAte: '2026-10-20',
    })
    const ruim = lerFiltros(new URLSearchParams('diarioDe=x&diarioAte=2026-10-20'))
    expect(ruim.consulta.diarioDe).toBeUndefined()
    expect(ruim.invalidos).toEqual(['Período do mapa diário'])
  })

  it('formato, teto e janela são os do schema do contrato: a tela nunca aceita o que a rota recusaria', () => {
    const casos = [
      'equipe=portal,sem-time',
      'equipe=Portal',
      'projeto=123456789012,1234567890123',
      'subgrupo=reuniao,Reuniao',
      `subtarefa=${'a'.repeat(41)}`,
      'qualidade=completo,sem-comentario,xx',
      'de=2026-01-01&ate=2027-01-02',
      'de=2026-01-01&ate=2027-01-01',
      'de=2026-02-30&ate=2026-03-01',
      'diarioDe=2026-10-01&diarioAte=2026-12-02',
      'diarioDe=2026-10-01&diarioAte=2026-12-01',
      'de=2026-01-01',
    ]
    for (const q of casos) {
      const lido = lerFiltros(new URLSearchParams(q))
      expect(
        consultaApontamentoSchema.safeParse(lido.consulta).success,
        `${q} lido como ${JSON.stringify(lido.consulta)}`,
      ).toBe(true)
    }
    const janelaLonga = lerFiltros(new URLSearchParams('de=2026-01-01&ate=2027-01-02'))
    expect(janelaLonga.consulta.de).toBeUndefined()
    expect(janelaLonga.invalidos).toEqual(['Período'])
    expect(lerFiltros(new URLSearchParams('de=2026-01-01&ate=2027-01-01')).consulta.ate).toBe(
      '2027-01-01',
    )
    const mapaLongo = lerFiltros(new URLSearchParams('diarioDe=2026-10-01&diarioAte=2026-12-02'))
    expect(mapaLongo.invalidos).toEqual(['Período do mapa diário'])
  })

  it('o rótulo do valor cai no id quando ele não está nas opções ou quando não há opções', () => {
    const c = lerFiltros(
      new URLSearchParams('tipo=999&projeto=1042&subtarefa=em-subtarefa&subgrupo=reuniao'),
    ).consulta
    expect(filtrosAtivos(c, RESPOSTA_FICTICIA.opcoes).map((a) => a.valor)).toEqual([
      'Iniciativa Portal do Cliente',
      '999',
      'Em subtarefa',
      'Reunião',
    ])
    expect(filtrosAtivos(c, undefined).map((a) => a.valor)).toEqual([
      '1042',
      '999',
      'em-subtarefa',
      'reuniao',
    ])
  })

  it('respeita o teto de tamanho das listas', () => {
    const muitos = Array.from({ length: 51 }, (_, i) => `t${i + 1}`).join(',')
    const l = lerFiltros(new URLSearchParams(`equipe=${muitos}`))
    expect(l.consulta.equipe).toBeUndefined()
    expect(l.invalidos).toEqual(['Equipe'])
  })

  it('pessoa= na URL é valor inválido ignorado: não entra na consulta, e o aviso não repete o valor (CA-9)', () => {
    const l = lerFiltros(new URLSearchParams('pessoa=p1,Maria&tipo=3'))
    expect(l.consulta).toEqual({ nivelMatriz: 'tipo', anomalos: 'incluir', tipo: ['3'] })
    expect(l.invalidos).toEqual(['pessoa'])
    expect(JSON.stringify(l)).not.toContain('Maria')
  })

  it('os filtros ativos usam o rótulo da opção, nunca o id', () => {
    const c = lerFiltros(
      new URLSearchParams('equipe=sem-time&subgrupo=nao-classificado&qualidade=completo'),
    ).consulta
    const ativos = filtrosAtivos(c, RESPOSTA_FICTICIA.opcoes)
    expect(ativos.map((a) => `${a.rotulo}=${a.valor}`)).toEqual([
      'Equipe=Sem equipe',
      'Subgrupo=Sem comentário',
      'Qualidade=Completo',
    ])
  })
})

describe('ordenarPorTotal', () => {
  const linhas = [
    { pessoaRef: 'p1', n: 'a', t: 1 },
    { pessoaRef: 'p2', n: 'b', t: 5 },
    { pessoaRef: 'p3', n: 'c', t: 5 },
  ]
  it('alfabética mantém a ordem recebida; total ordena do maior e desempata pela ordem recebida', () => {
    expect(ordenarPorTotal(linhas, 'alfabetica', (l) => l.t).map((l) => l.n)).toEqual([
      'a',
      'b',
      'c',
    ])
    expect(ordenarPorTotal(linhas, 'total', (l) => l.t).map((l) => l.n)).toEqual(['b', 'c', 'a'])
  })
  it('"Outra área" fica por último também na ordem por total, mesmo com o maior total', () => {
    const com = [{ pessoaRef: 'outra-area', n: 'z', t: 99 }, ...linhas]
    expect(ordenarPorTotal(com, 'total', (l) => l.t).map((l) => l.n)).toEqual(['b', 'c', 'a', 'z'])
  })
  it('não altera a lista recebida', () => {
    const copia = [...linhas]
    ordenarPorTotal(linhas, 'total', (l) => l.t)
    expect(linhas).toEqual(copia)
  })
})

describe('fraseDoAchado', () => {
  it('código desconhecido ou valor ausente devolve null', () => {
    expect(fraseDoAchado({ codigo: 'novo', valores: {}, rotuloRef: null })).toBeNull()
    expect(
      fraseDoAchado({ codigo: 'dias-atipicos', valores: { n: 1 }, rotuloRef: null }),
    ).toBeNull()
    expect(
      fraseDoAchado({
        codigo: 'utilizacao-mensal-variou',
        valores: { pct: 1, pctAnterior: 2 },
        rotuloRef: null,
      }),
    ).toBeNull()
    expect(
      fraseDoAchado({
        codigo: 'concentracao-em-projeto',
        valores: { pct: Number.NaN },
        rotuloRef: null,
      }),
    ).toBeNull()
  })
  it('não classificado e sem comentário sem os dois números também são descartados', () => {
    expect(
      fraseDoAchado({ codigo: 'nao-classificado-alto', valores: { pct: 9 }, rotuloRef: null }),
    ).toBeNull()
    expect(
      fraseDoAchado({ codigo: 'nao-classificado-alto', valores: { n: 9 }, rotuloRef: null }),
    ).toBeNull()
    expect(
      fraseDoAchado({ codigo: 'sem-comentario-alto', valores: { pct: 9 }, rotuloRef: null }),
    ).toBeNull()
  })
  it('projeto sem rótulo vira "Um projeto"', () => {
    expect(
      fraseDoAchado({ codigo: 'concentracao-em-projeto', valores: { pct: 40 }, rotuloRef: null })
        ?.frase,
    ).toBe('Um projeto concentra 40% das horas apontadas no período.')
  })
})

describe('formatar', () => {
  it('horas vêm em segundos e viram texto só na tela', () => {
    expect(fmtHoras(27000)).toBe('7,5 h')
    expect(horasDesde(null)).toBeNull()
    expect(horasDesde('lixo')).toBeNull()
    expect(horasDesde('2026-10-30T00:00:00Z', Date.parse('2026-10-31T06:00:00Z'))).toBe(30)
  })
})
