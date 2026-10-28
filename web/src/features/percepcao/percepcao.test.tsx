import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { CATALOGO_CARTOES, fonteDaMetrica, type ResultadoPV1 } from '@metricas-dspd/contratos'
import { SCHEMAS_RESULTADO } from '@metricas-dspd/contratos/validacao'
import { MockFonteMetricas } from '@/data'
import { FonteFixa } from '@/features/painel/testes/fonteFixa'
import { dominioDe } from '@/features/exportar/gerar'
import { fonteExportavel } from '@/features/exportar/modelo'
import { itensDoNivel } from '@/features/exportar/selecao'
import { fonteDeTeste, renderizarApp, renderizarCartao } from '@/test/helpers'
import { CartaoPV1 } from './CartaoPV1'
import { fmtTri, nomeDaFaixa, textoContagem } from './formatar'

vi.setConfig({ testTimeout: 60000 })

type Ok = Extract<ResultadoPV1, { status: 'ok' }>

const PERGUNTAS = [
  { codigo: 'resolve', ordem: 1, texto: 'Resolve o que a minha área precisa' },
  { codigo: 'prazo', ordem: 2, texto: 'O prazo atende à criticidade para a minha área' },
  { codigo: 'informado', ordem: 3, texto: 'Sou informado sobre o andamento' },
  { codigo: 'nao_volta', ordem: 4, texto: 'O problema não volta depois de resolvido' },
  { codigo: 'confianca', ordem: 5, texto: 'Confio na sustentação para o que é crítico' },
]

const taxa = (k: number, n: number) =>
  n >= 20
    ? ({ status: 'ok', k, n, pct: Math.round((k * 1000) / n) / 10 } as const)
    : ({ status: 'insuficiente', k, n, minimo: 20 } as const)

/** n respostas por pergunta, distribuídas de modo que as 5 faixas somem n (n >= 2). */
function publicado(n: number) {
  const f5 = Math.floor((n - 2) / 2)
  const f4 = n - 2 - f5
  const contagens = [0, 1, 1, f4, f5]
  return {
    status: 'publicado' as const,
    n,
    perguntas: PERGUNTAS.map((p) => ({
      codigo: p.codigo,
      faixas: contagens.map((k, i) => ({
        faixa: (i + 1) as 1 | 2 | 3 | 4 | 5,
        contagem: taxa(k, n),
      })),
    })),
  }
}

const concordam = (n: number) => ({
  status: 'publicado' as const,
  n,
  concordam: PERGUNTAS.map((p) => ({ codigo: p.codigo, contagem: taxa(Math.floor(n / 2), n) })),
})

function resultado(sobre: Partial<Ok> = {}): Ok {
  return {
    status: 'ok',
    fonte: 'pesquisa',
    trimestre: '2026-T3',
    ciclo: 3,
    questionario: { versaoId: 'v2', vigenteDesde: '2026-04-01', perguntas: PERGUNTAS },
    participacao: { respondentes: 24, convidados: 30, taxa: taxa(24, 30) },
    consolidado: publicado(24),
    porArea: {
      status: 'publicado',
      areas: [
        { rotulo: 'Financeiro', outras: false, bloco: publicado(12) },
        { rotulo: 'RH', outras: false, bloco: publicado(7) },
        { rotulo: 'Outras áreas', outras: true, bloco: publicado(5) },
      ],
    },
    tendencia: [
      {
        trimestre: '2025-T4',
        versaoId: 'v1',
        bloco: { status: 'base-insuficiente', n: 4, minimo: 5 },
      },
      { trimestre: '2026-T1', versaoId: 'v1', bloco: concordam(14) },
      { trimestre: '2026-T2', versaoId: 'v2', bloco: concordam(19) },
      { trimestre: '2026-T3', versaoId: 'v2', bloco: concordam(24) },
    ],
    oQueMudou: {
      trimestre: '2026-T3',
      texto: 'Treinamos o N2 e o retorno ao solicitante melhorou.',
    },
    criterios: { serie: [], janela: [] },
    base: { n: 24, unidade: 'respostas', janela: null },
    ...sobre,
  }
}

const SEM_PESQUISA: ResultadoPV1 = { status: 'sem-pesquisa', fonte: 'pesquisa' }

/** n = 9: abaixo de 20, só "k de n" (e a taxa de participação também sem percentual). */
const NOVE = resultado({
  participacao: { respondentes: 9, convidados: 12, taxa: taxa(9, 12) },
  consolidado: publicado(9),
  base: { n: 9, unidade: 'respostas', janela: null },
})

async function cartao(dto: ResultadoPV1, url = '/') {
  const r = renderizarCartao(<CartaoPV1 />, { fonte: new FonteFixa({ PV1: dto }), url })
  const el = await screen.findByTestId('metrica-PV1')
  await waitFor(() => expect(el).toHaveAttribute('data-estado', 'ok'))
  return { ...r, el }
}

describe('os resultados de teste respeitam o schema do contrato', () => {
  it.each([
    ['sem pesquisa', SEM_PESQUISA],
    ['publicado', resultado()],
    ['k de n', NOVE],
  ])('%s', (_n, dto) => {
    expect(SCHEMAS_RESULTADO.PV1.safeParse(dto).success).toBe(true)
  })
})

describe('formatação', () => {
  it('trimestre, faixa e k de n (percentual só quando a taxa é ok)', () => {
    expect(fmtTri('2026-T3')).toBe('3T/2026')
    expect(nomeDaFaixa(4)).toBe('4 Concordo')
    expect(nomeDaFaixa(9)).toBe('9')
    expect(textoContagem(taxa(4, 9))).toBe('4 de 9')
    expect(textoContagem(taxa(10, 24))).toBe('10 de 24 (42%)')
  })
})

describe('CartaoPV1: sem pesquisa', () => {
  it('diz que nada foi carregado, sem botão nem campo de envio, com fonte e selo', async () => {
    const { el } = await cartao(SEM_PESQUISA)
    expect(within(el).getByTestId('pv1-sem-pesquisa')).toHaveTextContent(
      'Nenhuma pesquisa carregada',
    )
    expect(el).toHaveTextContent(
      'A coordenação da sustentação publica o resultado depois de cada trimestre. Ainda não há resultado.',
    )
    expect(within(el).queryByRole('button', { name: /carregar|enviar|importar/i })).toBeNull()
    expect(el.querySelector('input[type="file"]')).toBeNull()
    expect(within(el).queryByRole('button', { name: /como tabela/i })).toBeNull()
    expect(within(el).getByText('Fonte: Pesquisa de percepção (não é Acelerato)')).toBeVisible()
    expect(within(el).getByText('Granularidade: resposta agregada')).toBeVisible()
    expect(within(el).getByTestId('selo-ficticio')).toHaveTextContent('Dados fictícios')
    expect(within(el).queryByTestId('pv1-trimestre')).toBeNull()
  })
})

describe('CartaoPV1: publicado (n = 24, com percentual)', () => {
  it('mostra trimestre, base, participação, distribuição com rótulo numérico e legenda textual', async () => {
    const { el } = await cartao(resultado())
    expect(within(el).getByTestId('pv1-trimestre')).toHaveTextContent('Pesquisa de 3T/2026')
    expect(within(el).getByTestId('base-PV1')).toHaveTextContent('Base: 24 respostas')
    expect(within(el).getByTestId('leitura-PV1')).toHaveTextContent(
      'Pesquisa de 3T/2026: 24 de 30 convidados responderam.',
    )
    expect(within(el).getByTestId('pv1-participacao')).toHaveTextContent(
      'Participação: 24 de 30 convidados (80%). Sem meta de participação.',
    )
    const legenda = within(el).getAllByTestId('legenda-faixas')[0] as HTMLElement
    for (const t of ['1 Discordo totalmente', '3 Neutro', '5 Concordo totalmente'])
      expect(within(legenda).getByText(t)).toBeInTheDocument()
    const barras = within(within(el).getByTestId('distribuicao-consolidado')).getAllByRole('img')
    expect(barras).toHaveLength(5)
    expect(barras[0]).toHaveAccessibleName(
      'Resolve o que a minha área precisa: 0 Discordo totalmente, 1 Discordo, 1 Neutro, 11 Concordo, 11 Concordo totalmente. Total de 24 respostas.',
    )
    // faixa com 0 respostas não ocupa espaço; as demais trazem o número.
    const faixas = barras[0]?.querySelectorAll('[data-faixa]') ?? []
    expect([...faixas].map((f) => f.textContent)).toEqual(['0', '1', '1', '11', '11'])
    // contraste não textual (1.4.11): cada trecho e cada amostra da legenda têm borda do token `acento`.
    for (const f of faixas) expect(f).toHaveClass('border', 'border-acento')
    expect(legenda.querySelectorAll('span.border-acento')).toHaveLength(5)
    expect(within(el).queryByTestId('pv1-so-k-de-n')).toBeNull()
    expect(within(el).queryByText('n = 24')).toBeNull()
  })

  it('"Ver como tabela" traz a mesma distribuição com contagem e percentual (n >= 20)', async () => {
    const u = userEvent.setup()
    const { el } = await cartao(resultado())
    await u.click(within(el).getByRole('button', { name: /ver como tabela/i }))
    const t = await within(el).findByTestId('tabela-PV1-consolidado')
    const linhas = within(t).getAllByRole('row')
    expect(linhas).toHaveLength(6)
    expect(linhas[1]).toHaveTextContent(
      'Resolve o que a minha área precisa0 de 24 (0%)1 de 24 (4%)1 de 24 (4%)11 de 24 (46%)11 de 24 (46%)',
    )
    expect(within(t).getByRole('columnheader', { name: '5 Concordo totalmente' })).toBeVisible()
  })

  it('não mostra média, nota única, semáforo nem indicador único', async () => {
    const { el } = await cartao(resultado())
    const visiveis = within(el)
      .queryAllByText(/média|nota única|semáforo|NPS|CSAT/i)
      .filter((e) => e.closest('[hidden]') === null)
    expect(visiveis).toEqual([])
    expect(within(el).queryByRole('meter')).toBeNull()
  })

  it('o aviso de filtros fica logo após a participação e o rodapé diz que não há meta', async () => {
    const { el } = await cartao(resultado())
    expect(within(el).getByTestId('pv1-participacao').nextElementSibling).toBe(
      within(el).getByTestId('pv1-nao-se-aplica'),
    )
    expect(within(el).getByTestId('pv1-rodape')).toHaveTextContent(
      'não avalia pessoas nem compara áreas ou equipes. Sem meta de satisfação.',
    )
    expect(within(el).getByTestId('pv1-nao-se-aplica')).toHaveTextContent(
      'Os filtros do painel (equipe, prioridade e período) não se aplicam a esta seção.',
    )
    expect(within(el).getByText('Meta: Sem meta de satisfação')).toBeVisible()
  })
})

describe('CartaoPV1: resultado incompleto', () => {
  it('pergunta ou faixa ausente no resultado não quebra: a pergunta some e a faixa vira "—"', async () => {
    const u = userEvent.setup()
    const completo = publicado(24)
    const [primeira, , ...resto] = completo.perguntas
    const consolidado = {
      ...completo,
      perguntas: [
        { codigo: 'resolve', faixas: (primeira?.faixas ?? []).filter((f) => f.faixa !== 3) },
        ...resto,
      ],
    }
    const { el } = await cartao(resultado({ consolidado }))
    await u.click(within(el).getByRole('button', { name: /ver como tabela/i }))
    const t = await within(el).findByTestId('tabela-PV1-consolidado')
    expect(within(t).getAllByRole('row')).toHaveLength(5)
    expect(within(t).getAllByRole('row')[1]).toHaveTextContent(
      'Resolve o que a minha área precisa0 de 24 (0%)1 de 24 (4%)—11 de 24 (46%)11 de 24 (46%)',
    )
    expect(within(t).queryByText('O prazo atende à criticidade para a minha área')).toBeNull()
  })
})

describe('CartaoPV1: abaixo de 20 respostas (k de n)', () => {
  it('mostra só a quantidade, sem percentual em nenhum lugar visível', async () => {
    const u = userEvent.setup()
    const { el } = await cartao(NOVE)
    expect(within(el).getByTestId('pv1-participacao')).toHaveTextContent(
      'Participação: 9 de 12 convidados. Sem meta de participação.',
    )
    expect(within(el).getByTestId('pv1-so-k-de-n')).toBeVisible()
    await u.click(within(el).getByRole('button', { name: /ver como tabela/i }))
    const t = await within(el).findByTestId('tabela-PV1-consolidado')
    expect(within(t).getAllByRole('row')[1]).toHaveTextContent(
      'Resolve o que a minha área precisa0 de 91 de 91 de 94 de 93 de 9',
    )
    expect(t.textContent).not.toMatch(/%/)
    expect(within(el).getByTestId('pv1-participacao').textContent).not.toMatch(/%/)
  })
})

describe('CartaoPV1: base insuficiente', () => {
  it('mostra só o total de respostas e o mínimo, sem faixas nem percentual', async () => {
    const { el } = await cartao(
      resultado({
        consolidado: { status: 'base-insuficiente', n: 4, minimo: 5 },
        participacao: { respondentes: 4, convidados: 10, taxa: taxa(4, 10) },
        base: { n: 4, unidade: 'respostas', janela: null },
        porArea: { status: 'nao-publicado', motivo: 'base-insuficiente' },
      }),
    )
    expect(within(el).getByTestId('pv1-base-insuficiente')).toHaveTextContent(
      'Base insuficiente: 4 respostas. Mínimo 5 para publicar.',
    )
    expect(within(el).queryByTestId('legenda-faixas')).toBeNull()
    expect(within(el).queryByTestId('distribuicao-consolidado')).toBeNull()
  })

  it('uma resposta fica no singular', async () => {
    const { el } = await cartao(
      resultado({
        consolidado: { status: 'base-insuficiente', n: 1, minimo: 5 },
        tendencia: [
          {
            trimestre: '2026-T2',
            versaoId: 'v2',
            bloco: { status: 'base-insuficiente', n: 1, minimo: 5 },
          },
          { trimestre: '2026-T3', versaoId: 'v2', bloco: concordam(24) },
        ],
      }),
    )
    expect(within(el).getByTestId('pv1-base-insuficiente')).toHaveTextContent('1 resposta.')
    expect(within(el).getByText(/2T\/2026: base insuficiente, 1 resposta\./)).toBeVisible()
  })
})

describe('CartaoPV1: por área', () => {
  it('primeiro ciclo: só o consolidado, com o motivo', async () => {
    const { el } = await cartao(
      resultado({ ciclo: 1, porArea: { status: 'nao-publicado', motivo: 'primeiro-ciclo' } }),
    )
    expect(within(el).getByTestId('pv1-area-nao-publicada')).toHaveTextContent(
      'nada é publicado no primeiro ciclo',
    )
    expect(within(el).queryAllByTestId('pv1-area')).toHaveLength(0)
  })

  it('base insuficiente nas áreas: explica e só vale o consolidado', async () => {
    const { el } = await cartao(
      resultado({ porArea: { status: 'nao-publicado', motivo: 'base-insuficiente' } }),
    )
    expect(within(el).getByTestId('pv1-area-nao-publicada')).toHaveTextContent(
      'nenhuma área tem respostas suficientes',
    )
  })

  it('a partir do 2º ciclo: áreas na ordem recebida (alfabética), "Outras áreas" por último, sem ranking', async () => {
    const { el } = await cartao(resultado())
    const areas = within(el).getAllByTestId('pv1-area')
    expect(areas.map((a) => within(a).getByRole('heading', { level: 5 }).textContent)).toEqual([
      'Financeiro · 12 respostas',
      'RH · 7 respostas',
      'Outras áreas · 5 respostas',
    ])
    expect(within(areas[0] as HTMLElement).getAllByRole('img')).toHaveLength(5)
    // Blocos com n < 20: a regra do "k de n" e a legenda são repetidas acima de "Por área".
    const sec = within(el).getByTestId('por-area')
    expect(within(sec).getByTestId('pv1-so-k-de-n-area')).toHaveTextContent('k de n')
    expect(within(sec).getByTestId('legenda-faixas')).toBeVisible()
  })
})

describe('CartaoPV1: tendência e versão do questionário', () => {
  it('uma coluna por trimestre, k de n, e quebra de série onde a versão muda', async () => {
    const { el } = await cartao(resultado())
    const t = within(el).getByTestId('tendencia-PV1')
    const cab = within(t).getAllByRole('columnheader')
    expect(cab.map((c) => c.textContent)).toEqual([
      'Pergunta',
      '4T/20254 respostas',
      '1T/202614 respostas',
      '2T/202619 respostasQuestionário alterado em 01/04/2026',
      '3T/202624 respostas',
    ])
    const marcadas = cab.filter((c) => c.hasAttribute('data-quebra'))
    expect(marcadas).toHaveLength(1)
    expect(within(el).getByTestId('aviso-quebra-serie')).toHaveTextContent(
      'Não compare os números antes e depois da marca.',
    )
    // A coluna da pergunta fica fixa ao rolar (375 px).
    expect(within(t).getAllByRole('rowheader')[0]).toHaveClass('sticky', 'left-0')
    expect(cab[0]).toHaveClass('sticky', 'left-0')
    const linha1 = within(t).getAllByRole('row')[1] as HTMLElement
    expect(
      within(linha1)
        .getAllByRole('cell')
        .map((c) => c.textContent),
    ).toEqual(['—base insuficiente', '7 de 14', '9 de 19', '12 de 24 (50%)'])
    expect(
      within(el).getByText(/4T\/2025: base insuficiente, 4 respostas\. Mínimo 5 para publicar\./),
    ).toBeVisible()
  })

  it('quebra em versão que não é a vigente: marca sem data', async () => {
    const { el } = await cartao(
      resultado({
        tendencia: [
          { trimestre: '2026-T1', versaoId: 'v1', bloco: concordam(14) },
          { trimestre: '2026-T2', versaoId: 'v3', bloco: concordam(19) },
        ],
      }),
    )
    const marca = within(within(el).getByTestId('tendencia')).getByTestId('quebra-serie')
    expect(marca).toHaveTextContent(/^Questionário alterado$/)
  })

  it('expõe os seletores estáveis da seção (tendência, pontos por trimestre e quebra de série)', async () => {
    const { el } = await cartao(resultado())
    const t = within(el).getByTestId('tendencia')
    expect(within(t).getAllByTestId('ponto-trimestre')).toHaveLength(4)
    expect(within(t).getByTestId('quebra-serie')).toHaveTextContent('01/04/2026')
    expect(within(el).getByTestId('por-area')).toBeVisible()
    expect(within(within(el).getByTestId('por-area')).getAllByTestId('n-grupo')).toHaveLength(3)
    expect(
      within(within(el).getByTestId('o-que-mudou')).getByRole('heading', {
        name: 'O que mudou por causa da pesquisa',
      }),
    ).toBeVisible()
  })

  it('sem troca de versão não há marca de quebra', async () => {
    const { el } = await cartao(
      resultado({
        tendencia: [
          { trimestre: '2026-T2', versaoId: 'v2', bloco: concordam(19) },
          { trimestre: '2026-T3', versaoId: 'v2', bloco: concordam(24) },
        ],
      }),
    )
    expect(within(el).queryByTestId('aviso-quebra-serie')).toBeNull()
    expect(within(el).queryByText('Questionário alterado')).toBeNull()
  })

  it('um único trimestre: sem tabela, só a legenda "Primeiro ciclo" (L-3)', async () => {
    const { el } = await cartao(
      resultado({ tendencia: [{ trimestre: '2026-T3', versaoId: 'v2', bloco: concordam(24) }] }),
    )
    expect(within(el).queryByTestId('tendencia-PV1')).toBeNull()
    expect(within(el).getByTestId('pv1-sem-tendencia')).toHaveTextContent(
      'Primeiro ciclo: ainda sem tendência.',
    )
  })

  it('a data da quebra vem da marca T2.6 do trimestre; marca fora do intervalo cai na vigência (L-8)', async () => {
    const { el } = await cartao(
      resultado({
        criterios: {
          serie: [
            { id: 'a', data: '2025-01-10', descricao: 'antiga' },
            { id: 'pesq', data: '2026-05-15', descricao: 'Pergunta 3 reescrita' },
          ],
          janela: [],
        },
      }),
    )
    const t = within(el).getByTestId('tendencia')
    expect(within(t).getByTestId('quebra-serie')).toHaveTextContent('em 15/05/2026')
  })

  it('a tendência diz que mostra só o lado que concorda (L-4)', async () => {
    const { el } = await cartao(resultado())
    expect(within(el).getByTestId('tendencia-PV1')).toHaveTextContent('Só o lado que concorda')
  })

  it('a distribuição usa uma rampa de um só matiz, sem vermelho (L-6), e abre espaço a 3 dígitos (L-5)', async () => {
    const { el } = await cartao(resultado({ consolidado: publicado(250) }))
    const faixas = el.querySelectorAll('[data-testid="distribuicao-consolidado"] [data-faixa]')
    expect(faixas.length).toBeGreaterThan(0)
    for (const f of Array.from(faixas)) expect(f.className).not.toMatch(/alerta/)
    expect(Array.from(faixas).some((f) => f.classList.contains('min-w-8'))).toBe(true)
  })

  it('sem trimestres na tendência o bloco não aparece', async () => {
    const { el } = await cartao(resultado({ tendencia: [] }))
    expect(within(el).queryByTestId('tendencia-PV1')).toBeNull()
  })

  it('a marcação T2.6 do resultado aparece como aviso de mudança de critério', async () => {
    const { el } = await cartao(
      resultado({
        criterios: {
          serie: [{ id: 'pesq-v2', data: '2026-04-01', descricao: 'Pergunta 3 reescrita' }],
          janela: [],
        },
      }),
    )
    expect(within(el).getByTestId('aviso-criterio')).toHaveTextContent(
      'Mudança de critério em 01/04/2026: Pergunta 3 reescrita',
    )
  })
})

describe('CartaoPV1: O que mudou', () => {
  it('mostra o texto da coordenação como texto puro (HTML não é interpretado)', async () => {
    const texto = 'Ajuste <b>no prazo</b> e <img src=x onerror=alert(1)>'
    const { el } = await cartao(resultado({ oQueMudou: { trimestre: '2026-T2', texto } }))
    const bloco = within(el).getByTestId('pv1-o-que-mudou')
    expect(bloco.textContent).toBe(texto)
    expect(bloco.querySelector('b, img')).toBeNull()
    expect(
      within(el).getByRole('heading', { name: 'O que mudou por causa da pesquisa' }),
    ).toBeVisible()
    expect(el).toHaveTextContent('Em resposta à pesquisa de 2T/2026')
  })

  it('sem registro, diz que a coordenação ainda não escreveu', async () => {
    const { el } = await cartao(resultado({ oQueMudou: null }))
    expect(within(el).getByTestId('pv1-o-que-mudou-vazio')).toHaveTextContent(
      'A coordenação ainda não registrou o que mudou neste ciclo.',
    )
  })
})

describe('CartaoPV1: carregando e erro', () => {
  it('carregando: esqueleto com o cartão já identificado', async () => {
    renderizarCartao(<CartaoPV1 />, { url: '/?mock=carregando' })
    const el = await screen.findByTestId('metrica-PV1')
    expect(el).toHaveAttribute('aria-busy', 'true')
    expect(el).toHaveAttribute('data-estado', 'carregando')
  })

  it('erro: mensagem e "Tentar de novo" sem derrubar nada', async () => {
    const u = userEvent.setup()
    renderizarCartao(<CartaoPV1 />, { url: '/?mock=erro:pv1' })
    const erro = await screen.findByTestId('estado-erro-PV1')
    await u.click(within(erro).getByRole('button', { name: 'Tentar de novo' }))
    expect(await screen.findByTestId('estado-erro-PV1')).toBeInTheDocument()
  })
})

describe('painel Sustentação com a PV1', () => {
  const fonte = new FonteFixa({ PV1: resultado() })

  // Aquecimento (K-151): a primeira renderização completa do painel (redirecionamento, página lazy e
  // cartões) é a mais cara do arquivo e, na CI carregada, estourou a espera do primeiro teste.
  // Paga-se aqui, no hook, e não no relógio do teste.
  beforeAll(async () => {
    const r = renderizarApp('/sustentacao', fonte)
    await screen.findByTestId('metrica-PV1')
    r.unmount()
  })

  it('a seção fica no fim do painel, depois de S1 e S2 e de "Mais métricas"', async () => {
    renderizarApp('/sustentacao', fonte)
    const pv1 = await screen.findByTestId('metrica-PV1')
    expect(
      screen.getByRole('heading', { level: 2, name: /Percepção de valor · pesquisa trimestral/ }),
    ).toBeVisible()
    const s1 = await screen.findByTestId('metrica-S1')
    expect(s1.compareDocumentPosition(pv1) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    const mais = screen.getByTestId('mais-metricas')
    expect(mais.compareDocumentPosition(pv1) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(mais).not.toContainElement(pv1)
  })

  it('S1 e S2 têm "Leia junto" com a PV1: o link leva o foco ao cartão', async () => {
    const u = userEvent.setup()
    renderizarApp('/sustentacao', fonte)
    for (const id of ['s1', 's2']) {
      const leia = await screen.findByTestId(`leia-junto-${id}`)
      expect(
        within(leia).getByRole('link', {
          name: /PV1 Percepção de valor do serviço, vai para a seção/,
        }),
      ).toBeVisible()
    }
    const leia = await screen.findByTestId('leia-junto-s2')
    await u.click(within(leia).getByRole('link', { name: /PV1/ }))
    const cartaoPv1 = await screen.findByTestId('metrica-PV1')
    await waitFor(() => expect(within(cartaoPv1).getByRole('heading', { level: 3 })).toHaveFocus())
  })

  it('ocultar a PV1 faz o link "Leia junto" sumir; mostrar de novo o traz de volta', async () => {
    const u = userEvent.setup()
    renderizarApp('/sustentacao', fonte)
    const pv1 = await screen.findByTestId('metrica-PV1')
    await u.click(within(pv1).getByRole('button', { name: /Ocultar esta métrica PV1/ }))
    await waitFor(() => expect(screen.queryByTestId('metrica-PV1')).toBeNull())
    expect(screen.getByTestId('secao-oculta')).toHaveTextContent('1 métrica oculta')
    const leia = await screen.findByTestId('leia-junto-s2')
    expect(within(leia).queryByRole('link', { name: /PV1/ })).toBeNull()
    expect(screen.getByTestId('anuncio-preferencias')).toHaveTextContent(/\(PV1\) oculta\./)
    await u.click(
      within(screen.getByTestId('secao-oculta')).getByRole('button', { name: 'Mostrar' }),
    )
    expect(await screen.findByTestId('metrica-PV1')).toBeInTheDocument()
    expect(
      within(await screen.findByTestId('leia-junto-s2')).getByRole('link', { name: /PV1/ }),
    ).toBeVisible()
  })

  it('"Métricas: N de M" lista a PV1 e não a soma ao contador do núcleo', async () => {
    const u = userEvent.setup()
    renderizarApp('/sustentacao', fonte)
    const botao = await screen.findByTestId('botao-metricas')
    const antes = botao.textContent
    await u.click(botao)
    const pop = await screen.findByTestId('popover-metricas')
    const caixa = within(pop).getByRole('checkbox', { name: /PV1 Percepção de valor do serviço/ })
    expect(caixa).toBeChecked()
    expect(within(pop).getByText('Percepção de valor')).toBeVisible()
    await u.click(caixa)
    expect(within(pop).getByRole('checkbox', { name: /PV1/ })).not.toBeChecked()
    expect(screen.getByTestId('botao-metricas').textContent).toBe(antes)
  })

  it('sem Mais métricas do Acelerato, a pesquisa não aparece nos outros painéis', async () => {
    renderizarApp('/tatico', fonte)
    await screen.findByTestId('metrica-T2')
    expect(screen.queryByTestId('metrica-PV1')).toBeNull()
  })
})

describe('Preferências com a PV1', () => {
  it('o grupo "Percepção de valor" lista a PV1 só na Sustentação e o contador de cartões fecha', async () => {
    const u = userEvent.setup()
    renderizarApp('/preferencias')
    const grupo = await screen.findByTestId('grupo-sustentacao')
    const caixa = within(grupo).getByRole('checkbox', { name: /PV1 Percepção de valor do serviço/ })
    expect(
      within(grupo).getByRole('group', { name: 'Percepção de valor (pesquisa)' }),
    ).toBeVisible()
    // + a opção dos marcadores de ocultas
    expect(screen.getAllByRole('checkbox')).toHaveLength(CATALOGO_CARTOES.length + 1)
    expect(screen.getByTestId('grupo-operacional').textContent).not.toMatch(/pesquisa de percepção/)
    expect(within(grupo).getByTestId('contador-sustentacao')).toHaveTextContent(
      '1 de 1 da pesquisa de percepção',
    )
    await u.click(caixa)
    expect(within(grupo).getByTestId('contador-sustentacao')).toHaveTextContent(
      '0 de 1 da pesquisa de percepção',
    )
  })
})

describe('os pontos binários sustentação x fluxo conhecem a pesquisa', () => {
  it('a PV1 não é exportável: fora da seleção, sem fonte nem domínio de exportação', () => {
    expect(fonteDaMetrica('PV1')).toBe('pesquisa')
    for (const nivel of ['operacional', 'tatico', 'estrategico', 'sustentacao'] as const)
      expect(itensDoNivel(nivel, []).some((i) => i.metrica === 'PV1')).toBe(false)
    expect(() => fonteExportavel('Pesquisa de percepção')).toThrow(/não é exportável/)
    expect(fonteExportavel('Acelerato')).toBe('Acelerato')
    expect(() => dominioDe('PV1')).toThrow(/não é exportável/)
    expect(dominioDe('S1')).toBe('acelerato')
    expect(dominioDe('O1')).toBe('businessmap')
  })

  it('o mock sem cálculo de pesquisa devolve sem-pesquisa ou um resultado válido, nunca 500', async () => {
    const r = await new MockFonteMetricas({ latenciaMs: 0 }).obter('PV1', {})
    expect(SCHEMAS_RESULTADO.PV1.safeParse(r).success).toBe(true)
    expect(fonteDeTeste.tipo).toBe('mock')
  })
})
