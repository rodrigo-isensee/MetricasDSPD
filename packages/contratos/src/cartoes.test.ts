import { describe, expect, it } from 'vitest'
import {
  CARTOES_RETIRADOS,
  CATALOGO_CARTOES,
  PAINEIS_COM_CARTOES,
  PAINEIS_DO_PAPEL,
  PAPEIS,
  PREFERENCIAS_PADRAO,
  cartaoPorId,
  cartaoPorIdGlobal,
  cartoesDoPainel,
  idsDoC4,
  preferenciasMetricasSchema,
} from './cartoes'
import { METRICA_IDS } from './comum'

describe('catálogo de cartões', () => {
  it('tem ids únicos por painel, em minúsculas, e métricas válidas', () => {
    for (const p of PAINEIS_COM_CARTOES) {
      const ids = cartoesDoPainel(p).map((c) => c.id)
      expect(new Set(ids).size).toBe(ids.length)
      expect(ids.length).toBeGreaterThan(0)
    }
    for (const c of CATALOGO_CARTOES) {
      expect(c.id).toBe(c.codigo.toLowerCase())
      for (const m of c.metricas) expect(METRICA_IDS).toContain(m)
    }
  })

  it('aponta pares "leia junto" que existem no catálogo (podem ligar painéis diferentes, decisão 19)', () => {
    for (const c of CATALOGO_CARTOES)
      for (const par of c.leiaJunto ?? []) expect(cartaoPorIdGlobal(par), par).toBeDefined()
  })

  it('mantém ids únicos entre painéis e o mapa final da decisão 19', () => {
    const ids = CATALOGO_CARTOES.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(cartaoPorIdGlobal('inexistente')).toBeUndefined()
    const mapa: Record<string, string[]> = {
      o3: ['o5', 'o6', 'o8'],
      o4: ['o8'],
      o10: ['o11'],
      o15: ['o13', 'o16', 'o17'],
      t1: ['t6'],
      t4: ['t8'],
      t5: ['o14'],
      t9: ['t6', 'e5'],
      e1: ['e4', 'e5'],
      s1: ['s9', 's10'],
      s2: ['s8', 's12'],
      s3: ['s8', 's12'],
      s5: ['s11'],
      s7: ['s11'],
    }
    for (const [de, para] of Object.entries(mapa)) {
      const c = CATALOGO_CARTOES.find((x) => x.id === de)
      for (const p of para) expect(c?.leiaJunto, `${de}->${p}`).toContain(p)
    }
    const dec19 = new Set(Object.keys(mapa))
    // fora do mapa só ficam ligações entre cartões do núcleo (T1<->T4, O18->O4).
    for (const c of CATALOGO_CARTOES.filter((x) => !dec19.has(x.id)))
      for (const p of c.leiaJunto ?? []) expect(cartaoPorIdGlobal(p)?.grupo).toBe('nucleo')
  })

  it('classifica os cartões: mock só onde falta fonte real (O17, T8, E4, S8, S11, S12)', () => {
    const compl = CATALOGO_CARTOES.filter((c) => c.grupo === 'complementar')
    expect(compl.map((c) => c.codigo).sort()).toEqual(
      [
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
      ].sort(),
    )
    const mock = ['O17', 'T8', 'E4', 'S8', 'S11', 'S12']
    for (const c of compl) expect(c.status).toBe(mock.includes(c.codigo) ? 'mock' : 'disponivel')
    for (const c of CATALOGO_CARTOES.filter((x) => x.grupo === 'nucleo'))
      expect(c.status).toBe('disponivel')
    expect(CATALOGO_CARTOES.filter((c) => c.grupo === 'nucleo')).toHaveLength(32)
  })

  it('torna as 17 complementares alcançáveis por "leia junto" a partir do núcleo', () => {
    const alcancadas = new Set(
      CATALOGO_CARTOES.filter((c) => c.grupo === 'nucleo').flatMap((c) => c.leiaJunto ?? []),
    )
    for (const c of CATALOGO_CARTOES.filter((x) => x.grupo === 'complementar'))
      expect(alcancadas.has(c.id), c.codigo).toBe(true)
  })

  it('põe a PV1 numa seção própria do painel Sustentação, mock, ligada a S1 e S2 nos dois sentidos', () => {
    const pv1 = cartaoPorId('sustentacao', 'pv1')
    expect(pv1).toMatchObject({
      grupo: 'percepcao',
      status: 'mock',
      secao: 'percepcao',
      metricas: ['PV1'],
    })
    expect(pv1?.leiaJunto).toEqual(['s1', 's2'])
    expect(cartaoPorId('sustentacao', 's1')?.leiaJunto).toContain('pv1')
    expect(cartaoPorId('sustentacao', 's2')?.leiaJunto).toContain('pv1')
    expect(cartaoPorId('operacional', 'pv1')).toBeUndefined()
    expect(CATALOGO_CARTOES.filter((c) => c.grupo === 'percepcao')).toHaveLength(1)
  })

  it('põe a O17 na Sustentação, nunca no BusinessMap', () => {
    expect(cartaoPorId('sustentacao', 'o17')?.grupo).toBe('complementar')
    expect(cartaoPorId('operacional', 'o17')).toBeUndefined()
  })

  it('acha por id e devolve undefined para o inexistente', () => {
    expect(cartaoPorId('operacional', 'o9')?.codigo).toBe('O9')
    expect(cartaoPorId('tatico', 'o9')).toBeUndefined()
    expect(CARTOES_RETIRADOS).toEqual({})
  })

  it('sugere conjuntos só por painéis', () => {
    expect(PAPEIS.map((p) => PAINEIS_DO_PAPEL[p])).toEqual([
      ['operacional'],
      ['operacional', 'tatico'],
      ['tatico', 'estrategico'],
    ])
  })

  it('valida o formato das preferências', () => {
    expect(preferenciasMetricasSchema.safeParse(PREFERENCIAS_PADRAO).success).toBe(true)
    expect(preferenciasMetricasSchema.safeParse({ versao: 2 }).success).toBe(false)
  })

  it('ignora em silêncio chave de painel inexistente (a antiga `espera-invisivel`) e mantém os ocultos válidos', () => {
    const r = preferenciasMetricasSchema.safeParse({
      versao: 1,
      paineis: {
        operacional: { ocultar: ['ei-fl1'] },
        'espera-invisivel': { ocultar: ['ei-fl2'] },
      },
      atualizadoEm: '2026-10-10T00:00:00.000Z',
    })
    expect(r.success && r.data.paineis).toEqual({ operacional: { ocultar: ['ei-fl1'] } })
  })

  it('a espera invisível de cada nível está no painel do nível, na seção própria, e os ids não mudaram', () => {
    const ei = CATALOGO_CARTOES.filter((c) => c.codigo.startsWith('EI-'))
    expect(ei.map((c) => [c.id, c.painel, c.secao])).toEqual([
      ['ei-fl1', 'operacional', 'espera-invisivel'],
      ['ei-fl2', 'tatico', 'espera-invisivel'],
      ['ei-fl3', 'estrategico', 'espera-invisivel'],
      ['ei-sust', 'sustentacao', 'espera'],
    ])
    expect(new Set(ei.map((c) => c.secaoTitulo))).toEqual(
      new Set(['Quanto do tempo do solicitante fica fora da nossa gestão?']),
    )
  })
})

describe('idsDoC4 (fonte única do C4, ADR 0003)', () => {
  it('Operacional fechada: diária e semanal, sem VISAO_GERAL', () => {
    expect(idsDoC4('operacional', 'fechada', 'diaria')).toEqual(['O2', 'BLOQUEADOS', 'O1'])
    expect(idsDoC4('operacional', 'fechada', 'semanal')).toEqual([
      'O3',
      'O9',
      'O4',
      'O12',
      'O10',
      'O7',
      'O15',
      'O18',
      'EI_FL1',
    ])
  })
  it('aberta = fechada + todas as complementares do painel (catálogo e 011)', () => {
    const f = idsDoC4('operacional', 'fechada', 'diaria')
    const a = idsDoC4('operacional', 'aberta', 'diaria')
    expect(a.slice(0, f.length)).toEqual(f)
    expect(a).toEqual(expect.arrayContaining(['O5', 'O16', 'O19', 'O20', 'O21', 'O24', 'O25']))
    expect(a).not.toContain('VISAO_GERAL')
    expect(idsDoC4('tatico', 'aberta')).toEqual(expect.arrayContaining(['T6', 'T10', 'T11', 'T12']))
    expect(idsDoC4('estrategico', 'aberta')).toEqual(expect.arrayContaining(['E7', 'E9']))
  })
  it('painel sem 011 (sustentação) devolve só o catálogo', () => {
    const a = idsDoC4('sustentacao', 'aberta')
    expect(a.length).toBeGreaterThan(idsDoC4('sustentacao', 'fechada').length)
    expect(a).not.toEqual(expect.arrayContaining(['O19']))
  })
})
