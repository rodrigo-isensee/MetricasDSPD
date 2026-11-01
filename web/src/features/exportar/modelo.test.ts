import { beforeAll, describe, expect, it } from 'vitest'
import type {
  EstadoColeta,
  FiltrosFluxo,
  FiltrosSustentacao,
  MetricaId,
  OpcoesFiltro,
  ResultadoVisaoGeral,
  VersaoCriterio,
} from '@metricas-dspd/contratos'
import { MockFonteMetricas } from '@/data'
import {
  CAMPO_PESSOAL,
  LIMITE_METRICAS,
  agruparPorFonte,
  blocosVisaoGeral,
  construirBloco,
  contextoDosDados,
  dataCivil,
  excedeLimite,
  montarConteudo,
  nomeArquivo,
  slugArquivo,
  tabelaDoDto,
  textoCriterios,
  textoFiltros,
  textoInsuficiente,
  type BlocoExportacao,
} from './modelo'
import { notaDaMetrica } from './notas'

const fonte = new MockFonteMetricas({ latenciaMs: 0 })
const FLUXO: FiltrosFluxo = { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12s' } }
const SUST: FiltrosSustentacao = { equipe: [], prioridade: [], periodo: { tipo: '6m' } }
let opcoesBm: OpcoesFiltro
let opcoesAc: OpcoesFiltro
beforeAll(async () => {
  opcoesBm = await fonte.opcoesFiltro('businessmap')
  opcoesAc = await fonte.opcoesFiltro('acelerato')
}, 60000)

const CONTEXTO = contextoDosDados(undefined, [], false)

const bloco = async (id: MetricaId, filtros: FiltrosFluxo | FiltrosSustentacao = FLUXO) => {
  const dto = await fonte.obter(id as 'O3', filtros as FiltrosFluxo)
  return construirBloco({
    id,
    dto,
    filtros,
    opcoes: id.startsWith('S') || id === 'EI_SUST' ? opcoesAc : opcoesBm,
    nota: notaDaMetrica(id),
    contexto: CONTEXTO,
  })
}

describe('nome do arquivo e limite', () => {
  const agora = new Date('2026-10-10T15:30:00Z')
  it('segue metricas-dspd_<escopo>_<AAAA-MM-DD>[_ficticio].pdf, em minúsculas e sem acento', () => {
    expect(nomeArquivo('fluxo-operacional', agora, false)).toBe(
      'metricas-dspd_fluxo-operacional_2026-10-10.pdf',
    )
    expect(nomeArquivo('Sustentação', agora, true)).toBe(
      'metricas-dspd_sustentacao_2026-10-10_ficticio.pdf',
    )
    expect(slugArquivo('EI_FL1')).toBe('ei-fl1')
  })
  it('usa o dia civil de São Paulo, não o UTC', () => {
    expect(dataCivil(new Date('2026-10-11T01:00:00Z'))).toBe('2026-10-10')
  })
  it('limita a 12 métricas por exportação', () => {
    expect(LIMITE_METRICAS).toBe(12)
    expect(excedeLimite(12)).toBe(false)
    expect(excedeLimite(13)).toBe(true)
  })
})

describe('textoFiltros', () => {
  it('mostra só os filtros que atuam na métrica, com nomes e "Todos"', () => {
    const eq = opcoesBm.equipes[0]!
    const t = textoFiltros('O12', { ...FLUXO, equipe: [eq.id], tipo: ['Incidente'] }, opcoesBm)
    expect(t).toBe(`Equipe: ${eq.nome} · Sistema: Todos · Período: Últimas 12 semanas`)
    expect(textoFiltros('E1', FLUXO, opcoesBm)).toBe('Sistema: Todos · Período: Últimas 12 semanas')
  })
  it('métrica sem filtro de sistema ou de equipe não os mostra', () => {
    expect(textoFiltros('T5', FLUXO, opcoesBm)).not.toContain('Sistema')
    expect(textoFiltros('E1', FLUXO, opcoesBm)).not.toContain('Equipe')
  })
  it('trata equipe e prioridade da Sustentação e o período personalizado', () => {
    const t = textoFiltros(
      'S2',
      {
        equipe: ['totvs'],
        prioridade: ['P1'],
        periodo: { tipo: 'custom', de: '2026-01-01', ate: '2026-03-31' },
      },
      opcoesAc,
    )
    expect(t).toBe('Equipe: SSSC TOTVS · Prioridade: P1 · Período: 01/01/2026 a 31/03/2026')
  })
  it('sem opções carregadas usa o próprio id', () => {
    expect(textoFiltros('O3', { ...FLUXO, equipe: ['x'], sistema: ['y'] }, undefined)).toContain(
      'Equipe: x',
    )
  })
})

describe('bloco de cada família de DTO (nada é recalculado)', () => {
  it('O3 (percentis): base, janela de percentis, filtros, nota e tabela por tipo', async () => {
    const b = await bloco('O3')
    const dto = await fonte.obter('O3', FLUXO)
    expect(b.fonte).toBe('BusinessMap')
    expect(b.base).toBe(
      `Base: ${new Intl.NumberFormat('pt-BR').format(dto.base.n)} ${dto.base.unidade}`,
    )
    expect(b.janela).toMatch(
      /Janela dos dados: \d{2}\/\d{2}\/\d{4} a \d{2}\/\d{2}\/\d{4}; percentis em janela móvel de 12 semanas/,
    )
    expect(b.filtros).toContain('Período: Últimas 12 semanas')
    expect(b.nota).toContain(notaDaMetrica('O3').oQueE)
    expect(b.tabela?.colunas.join(' ')).toMatch(/Tipo/)
    expect(b.tabela?.linhas.length).toBeGreaterThan(0)
  })
  it('S1 (Acelerato): fonte Acelerato e filtros da Sustentação', async () => {
    const b = await bloco('S1', SUST)
    expect(b.fonte).toBe('Acelerato')
    expect(b.filtros).toContain('Prioridade: Todos')
  })
  it('Espera invisível e as demais métricas geram bloco sem erro, com título e código', async () => {
    for (const id of ['EI_FL1', 'EI_SUST', 'O1', 'T2', 'T9', 'E1', 'S5'] as MetricaId[]) {
      const b = await bloco(id, id.startsWith('S') || id === 'EI_SUST' ? SUST : FLUXO)
      expect(b.titulo).not.toBe('')
      expect(b.base).toMatch(/^Base: /)
    }
    expect((await bloco('EI_FL1')).codigo).toBe('EI')
  })
  it('amostra insuficiente: mesmo texto do DTO e nenhuma estatística', async () => {
    const b = await bloco('O3', {
      ...FLUXO,
      equipe: [opcoesBm.equipes[0]!.id],
      tipo: ['Dívida técnica'],
      periodo: { tipo: '4s' },
    })
    expect(b.amostraInsuficiente.join(' ')).toMatch(
      /Amostra insuficiente em \d+ recortes? \(n = [\d, ]+; mínimo de 20 itens\)/,
    )
    expect(b.tabela?.linhas.flat()).toContain('amostra insuficiente')
  })
  it('campos pessoais não entram nem na contagem de amostra insuficiente', () => {
    expect(textoInsuficiente({ responsavel: { status: 'insuficiente', n: 1 } })).toEqual([])
  })
  it('amostra suficiente não imprime aviso', () => {
    expect(textoInsuficiente({ a: { status: 'ok', n: 40 } })).toEqual([])
  })
  it('conta vários recortes insuficientes, sem repetir o n', () => {
    const t = textoInsuficiente({
      a: { status: 'insuficiente', n: 5 },
      b: [
        { status: 'insuficiente', n: 5 },
        { status: 'insuficiente', n: 12 },
      ],
    })
    expect(t[0]).toContain('3 recortes (n = 5, 12;')
  })
  it('mudança de critério vem do DTO, sem repetir a mesma marca', () => {
    const marca = { id: 'c1', data: '2026-03-02', descricao: 'Novo marco de início' }
    expect(textoCriterios([marca, marca])).toEqual([
      'Critério alterado em 02/03/2026: Novo marco de início',
    ])
    const b = construirBloco({
      id: 'O4',
      dto: {
        base: { n: 3, unidade: 'itens', janela: null, complemento: { n: 9, unidade: 'semanas' } },
        criterios: { serie: [marca], janela: [marca] },
      },
      filtros: FLUXO,
      opcoes: undefined,
      nota: notaDaMetrica('O4'),
      codigo: 'X',
      titulo: 'Título',
      contexto: CONTEXTO,
    })
    expect(b.criterios).toEqual(['Critério alterado em 02/03/2026: Novo marco de início'])
    expect(b.base).toBe('Base: 3 itens; 9 semanas')
    expect(b.janela).toBeNull()
    expect(b.codigo).toBe('X')
    expect(b.titulo).toBe('Título')
  })
})

describe('nada por pessoa e tabela', () => {
  it('descarta campos pessoais em qualquer nível do DTO', () => {
    const dto = {
      itens: [
        { cardId: 'A-1', responsavel: 'Fulano', total: 3 },
        { cardId: 'A-2', responsavel: 'Beltrano', total: 4 },
      ],
      pessoas: [{ a: 1, b: 2 }],
    }
    const t = tabelaDoDto(dto)
    expect(JSON.stringify(t)).not.toMatch(/Fulano|Beltrano/)
    expect(t?.colunas).toEqual(['Card id', 'Total'])
    expect(CAMPO_PESSOAL.test('agenteId')).toBe(true)
  })
  it('nenhum bloco de métrica de fluxo ou sustentação carrega campo pessoal', async () => {
    for (const id of ['O2', 'BLOQUEADOS', 'T9', 'S4'] as MetricaId[]) {
      const b = await bloco(id, id.startsWith('S') ? SUST : FLUXO)
      const texto = JSON.stringify(b).toLowerCase()
      for (const palavra of ['responsavel', 'assignee', 'agente', 'autor'])
        expect(texto).not.toContain(`"${palavra}`)
    }
  })
  it('sem lista usa "Indicador, Valor"; sem números, não há tabela; limita linhas e colunas', () => {
    expect(
      tabelaDoDto({ hoje: { total: 3, limite: 5 }, ok: true, nulo: null, texto: 't', dec: 1.25 })
        ?.colunas,
    ).toEqual(['Indicador', 'Valor'])
    expect(tabelaDoDto({ base: { n: 1 } })).toBeNull()
    expect(tabelaDoDto('x')).toBeNull()
    const muitas = Array.from({ length: 25 }, (_, i) => ({
      a: i,
      b: i,
      c: i,
      d: i,
      e: i,
      f: i,
      g: i,
      h: i,
      i,
      j: i,
    }))
    const t = tabelaDoDto({ x: muitas })!
    expect(t.linhas).toHaveLength(20)
    expect(t.omitidas).toBe(5)
    expect(t.colunas).toHaveLength(8)
    const topo = tabelaDoDto(
      Object.fromEntries(Array.from({ length: 25 }, (_, i) => [`k${i}`, i])),
    )!
    expect(topo.omitidas).toBe(5)
  })
  it('linhas com chaves diferentes ficam com "-" onde falta', () => {
    const t = tabelaDoDto({ x: [{ a: 1, b: 2 }, { a: 3 }] })
    expect(t?.linhas).toEqual([
      ['1', '2'],
      ['3', '-'],
    ])
  })
  it('estatística ok entra pelo valor; objetos profundos param no limite', () => {
    const t = tabelaDoDto({
      linhas: [
        {
          tipo: 'A',
          estatistica: { status: 'ok', n: 30, valor: { p50: 3, p85: 5 } },
          fundo: { a: { b: { c: 1 } }, x: 1 },
        },
      ],
    })
    expect(t?.colunas).toEqual(['Tipo', 'Itens', 'P50', 'P85', 'Fundo x'])
    expect(t?.linhas[0]).toContain('3')
  })
})

describe('Visão geral, seções por fonte e conteúdo', () => {
  it('um bloco por nível e por espera invisível, cada um de UMA fonte, com os critérios do nível', async () => {
    const vg: ResultadoVisaoGeral = await fonte.obter('VISAO_GERAL', {})
    const criterios = await fonte.criterios()
    const blocos = blocosVisaoGeral(vg, criterios, () => CONTEXTO)
    expect(blocos.map((b) => b.fonte)).toContain('Acelerato')
    const sus = blocos.find((b) => b.id === 'VISAO_GERAL_sustentacao')!
    expect(sus.fonte).toBe('Acelerato')
    expect(blocos.filter((b) => b.fonte === 'BusinessMap').length).toBeGreaterThan(0)
    expect(blocos.some((b) => b.id.startsWith('VISAO_GERAL_EI_'))).toBe(true)
    const versao: VersaoCriterio = { id: 'v', data: '2026-02-01', descricao: 'd', afeta: ['S1'] }
    const comCriterio = blocosVisaoGeral(vg, [versao], () => CONTEXTO)
    expect(comCriterio.find((b) => b.id === 'VISAO_GERAL_sustentacao')!.criterios).toHaveLength(1)
    expect(comCriterio.find((b) => b.id === 'VISAO_GERAL_operacional')!.criterios).toEqual([])
  })
  it('BusinessMap vem antes do Acelerato, em seções separadas; seção vazia não existe', () => {
    const b = (fonteB: 'BusinessMap' | 'Acelerato', id: string) =>
      ({ id, fonte: fonteB }) as BlocoExportacao
    const s = agruparPorFonte([
      b('Acelerato', 'S1'),
      b('BusinessMap', 'O3'),
      b('BusinessMap', 'O4'),
    ])
    expect(s.map((x) => [x.fonte, x.blocos.map((y) => y.id)])).toEqual([
      ['BusinessMap', ['O3', 'O4']],
      ['Acelerato', ['S1']],
    ])
    expect(agruparPorFonte([b('Acelerato', 'S1')])).toHaveLength(1)
  })
  it('o conteúdo leva escopo, mock, data de referência e geração', () => {
    const c = montarConteudo({
      escopo: 'Operacional',
      blocos: [],
      mock: true,
      dataReferencia: '2026-10-09',
      agora: new Date('2026-10-10T17:30:00Z'),
    })
    expect(c).toEqual({
      escopo: 'Operacional',
      mock: true,
      dataReferencia: '2026-10-09',
      geradoEm: '10/10/2026 14:30',
      secoes: [],
    })
  })
})

describe('base do E3 no PDF (IS-006)', () => {
  it('traz "k de n" como o selo da tela', async () => {
    const dto = await fonte.obter('E3', { ...FLUXO, periodo: { tipo: '12m' } })
    const b = await bloco('E3', { ...FLUXO, periodo: { tipo: '12m' } })
    expect(b.base).toBe(
      `Base: ${dto.comFicha.k} de ${dto.base.n} ${dto.base.unidade}`.replace(
        /\B(?=(\d{3})+(?!\d))/g,
        '.',
      ),
    )
    expect(b.base).toMatch(/^Base: \d+ de \d+ iniciativas$/)
  })
})

describe('contexto dos dados por cartão (P-4)', () => {
  const evento = {
    id: 'c1',
    inicio: '2026-10-31T09:00:00Z',
    fim: '2026-10-31T09:05:00Z',
    duracaoMs: 300000,
    resultado: 'ok' as const,
    tipoErro: null,
    efeito: 'aplicada' as const,
    contagens: null,
  }
  const estado = (extra: Partial<EstadoColeta> = {}): EstadoColeta => ({
    dominio: 'businessmap',
    selo: 'atual',
    horasDesdeUltimaOk: 1,
    ultimaOk: evento,
    ultimaTentativa: evento,
    proximaPrevista: '2026-11-01T09:00:00Z',
    falhasRecentes: [],
    calibracao: [],
    metricasEmCalibracao: ['O3'],
    ...extra,
  })

  it('leva "Atualizado em", o texto do selo de frescor, calibração e fictício', () => {
    const c = contextoDosDados(estado(), ['O3'], false)
    expect(c.atualizadoEm).toMatch(/^Atualizado em \d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/)
    expect(c.frescor).toBe('Atual')
    expect(c.emCalibracao).toBe(true)
    expect(c.ficticio).toBe(false)
    expect(contextoDosDados(estado(), ['O1'], true)).toMatchObject({
      emCalibracao: false,
      ficticio: true,
    })
  })

  it('atrasado diz quantas horas, como o selo da tela; sem coleta concluída não inventa data', () => {
    expect(
      contextoDosDados(estado({ selo: 'atrasado', horasDesdeUltimaOk: 7.2 }), [], false).frescor,
    ).toBe('Atrasado: última coleta há 7 h')
    const sem = contextoDosDados(
      estado({ selo: 'sem-coleta', ultimaOk: null, horasDesdeUltimaOk: null }),
      [],
      false,
    )
    expect(sem.atualizadoEm).toBe('Nenhuma coleta concluída')
    expect(sem.frescor).toBe('Sem coleta')
  })

  it('sem o estado da fonte (leitura falhou) o arquivo diz "indisponível" em vez de supor', () => {
    expect(contextoDosDados(undefined, ['O3'], false)).toEqual({
      atualizadoEm: 'Atualização indisponível',
      frescor: 'indisponível',
      emCalibracao: false,
      ficticio: false,
    })
  })
})
