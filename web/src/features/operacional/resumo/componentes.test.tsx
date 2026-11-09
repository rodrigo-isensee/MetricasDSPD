import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { ProvedorCalibracao } from '@/components/ui'
import { SemDadoRealErro, type MetricaQuery } from '@/data'
import { NumeroChave } from './NumeroChave'
import type { NumeroModelo } from './modelo'
import { SerieMensal } from './SerieMensal'
import { TendenciaFluxo } from './TendenciaFluxo'
import { TendenciaSustentacao } from './TendenciaSustentacao'

const modelo = (extra: Partial<NumeroModelo> = {}): NumeroModelo => ({
  id: 'acima-p95',
  codigo: 'O2',
  cartao: 'o2',
  rotulo: 'Itens abertos acima do P95',
  valor: '3',
  unidade: 'itens',
  base: '64 itens',
  visao: 'diaria',
  ...extra,
})
const noRouter = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>)

describe('NumeroChave', () => {
  const props = {
    id: 'acima-p95' as const,
    codigo: 'O2',
    rotulo: 'Itens abertos acima do P95',
    visao: 'diaria' as const,
    onTentarDeNovo: vi.fn(),
  }
  it('mostra valor, unidade, base, meta, status em texto e o link da visão dona (sem provedor de preferências)', () => {
    noRouter(
      <dl>
        <NumeroChave
          {...props}
          estado="ok"
          modelo={modelo({ meta: 'Meta: nenhum sem plano', status: 'fora', secundario: 'x' })}
        />
      </dl>,
    )
    const n = screen.getByTestId('numero-acima-p95')
    expect(within(n).getByTestId('numero-acima-p95-valor')).toHaveTextContent('3 itens')
    expect(n).toHaveTextContent('Base: 64 itens')
    expect(n).toHaveTextContent('Meta: nenhum sem plano')
    expect(n.querySelector('[data-status="fora"]')).toHaveTextContent('Fora da meta')
    expect(within(n).getByRole('link', { name: 'Ver O2 na Diária' })).toHaveAttribute(
      'href',
      '/operacional?cadencia=diaria#o2',
    )
  })
  it('sem dado real: texto e motivo da API, sem número nem "Tentar de novo"', () => {
    noRouter(
      <dl>
        <NumeroChave
          {...props}
          estado="sem-dado-real"
          erro={new SemDadoRealErro('O12', 'aguardando campo no quadro')}
          modelo={null}
        />
      </dl>,
    )
    const c = screen.getByTestId('numero-acima-p95-sem-dado-real')
    expect(c).toHaveTextContent('Sem dado real')
    expect(c).toHaveTextContent('Motivo: aguardando campo no quadro')
    expect(screen.queryByTestId('numero-acima-p95-valor')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Tentar de novo' })).toBeNull()
  })
  it('sem dado real e sem motivo no erro: o motivo genérico do contrato', () => {
    noRouter(
      <dl>
        <NumeroChave {...props} estado="sem-dado-real" modelo={null} />
      </dl>,
    )
    expect(screen.getByTestId('numero-acima-p95-sem-dado-real')).toHaveTextContent(
      'fonte real ainda não definida',
    )
  })
  it('em calibração a meta não é avaliada: o selo toma o lugar do status', () => {
    render(
      <MemoryRouter>
        <ProvedorCalibracao metricas={new Set(['O2'])} pronta>
          <dl>
            <NumeroChave {...props} estado="ok" modelo={modelo({ status: 'fora' })} />
          </dl>
        </ProvedorCalibracao>
      </MemoryRouter>,
    )
    expect(screen.getByText('Em calibração: sem avaliação de meta')).toBeInTheDocument()
    expect(screen.queryByText('Fora da meta')).toBeNull()
  })
  it('sem valor publicado mostra o texto de poucos itens; sem status, nada de status', () => {
    noRouter(
      <dl>
        <NumeroChave
          {...props}
          estado="vazio"
          modelo={modelo({
            valor: null,
            insuficiente: 'Poucos itens (n=14). Estatística não publicada.',
          })}
        />
      </dl>,
    )
    expect(screen.getByTestId('numero-acima-p95-insuficiente')).toHaveTextContent(
      'Poucos itens (n=14)',
    )
    expect(document.querySelector('[data-status]')).toBeNull()
  })
  it('carregando (estado ou sem modelo) e erro com "Tentar de novo"', async () => {
    const a = noRouter(
      <dl>
        <NumeroChave {...props} estado="carregando" modelo={null} />
      </dl>,
    )
    expect(screen.getByTestId('numero-acima-p95-carregando')).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByText('Itens abertos acima do P95')).toBeInTheDocument()
    a.unmount()
    const b = noRouter(
      <dl>
        <NumeroChave {...props} estado="ok" modelo={null} />
      </dl>,
    )
    expect(screen.getByTestId('numero-acima-p95-carregando')).toBeInTheDocument()
    b.unmount()
    noRouter(
      <dl>
        <NumeroChave {...props} estado="erro" modelo={null} />
      </dl>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }))
    expect(props.onTentarDeNovo).toHaveBeenCalledOnce()
  })
})

const pontos = (...v: (number | null)[]) =>
  v.map((valor, i) => ({
    mes: `2026-0${i + 4}`,
    valor,
    n: valor === null ? 14 : valor,
    texto: valor === null ? 'poucos itens (n=14)' : `${valor} dias úteis`,
  }))
const serie = (extra: Partial<Parameters<typeof SerieMensal>[0]> = {}) => (
  <SerieMensal
    id="t"
    titulo="Título"
    unidade="dias úteis"
    forma="linha"
    pontos={pontos(8, null, 9)}
    marcacoes={[]}
    frase="Frase."
    colunaValor="Valor"
    {...extra}
  />
)

describe('SerieMensal', () => {
  it('série sem nenhum valor publicado diz que não há histórico, sem botão de tabela', () => {
    render(serie({ pontos: pontos(null, null) }))
    expect(screen.getByTestId('t-vazio')).toHaveTextContent('Ainda não há histórico suficiente')
    expect(screen.queryByRole('button', { name: 'Ver como tabela' })).toBeNull()
    expect(screen.queryByTestId('t-sem-valor')).toBeNull()
  })
  it('série vazia (sem meses) também', () => {
    render(serie({ pontos: [], forma: 'barras' }))
    expect(screen.getByTestId('t-vazio')).toBeInTheDocument()
    expect(screen.queryByTestId('t-frase')).toBeNull()
  })
  it('contagem sem meses publicados não cai em "sem histórico": é zero, nunca lacuna', () => {
    render(serie({ forma: 'barras', pontos: pontos(0, 0) }))
    expect(screen.queryByTestId('t-vazio')).toBeNull()
    expect(screen.getByTestId('t-grafico')).toBeInTheDocument()
  })
  it('mostra o gráfico, a lista de meses sem valor e alterna para a tabela com "—" e "não publicado"', async () => {
    render(serie())
    expect(screen.queryByTestId('t-sem-valor')).toHaveTextContent('mai/2026 · poucos itens (n=14)')
    await userEvent.click(screen.getByRole('button', { name: 'Ver como tabela' }))
    const t = screen.getByRole('table')
    expect(within(t).getByRole('row', { name: /mai\/2026/ })).toHaveTextContent('—')
    expect(within(t).getByRole('row', { name: /mai\/2026/ })).toHaveTextContent(
      'n=14 · não publicado',
    )
    expect(within(t).getByRole('row', { name: /abr\/2026/ })).toHaveTextContent('publicado')
    // D-05a: o nome já muda; sem aria-pressed ("Ver como gráfico, pressionado" se contradiz).
    expect(screen.getByRole('button', { name: 'Ver como gráfico' })).not.toHaveAttribute(
      'aria-pressed',
    )
  })
  it('o gráfico não é lido em dobro: o nome do img é o título e o resumo fica só na legenda (D-05b)', () => {
    render(serie())
    const grafico = screen.getByTestId('t-grafico')
    expect(grafico.getAttribute('aria-label')).not.toMatch(/abr/i)
    expect(grafico.closest('figure')?.querySelector('figcaption')).toHaveTextContent(/abr/i)
  })
  it('vazio com texto próprio da fonte (D-08)', () => {
    render(serie({ pontos: pontos(null, null), vazio: 'nenhuma prioridade teve 20 chamados' }))
    expect(screen.getByTestId('t-vazio')).toHaveTextContent('nenhuma prioridade teve 20 chamados')
  })
  it('tabela com base ausente mostra "—"', async () => {
    render(
      serie({
        pontos: [
          { mes: '2026-04', valor: 3, n: null, texto: '3' },
          { mes: '2026-05', valor: null, n: null, texto: 'x' },
        ],
      }),
    )
    await userEvent.click(screen.getByRole('button', { name: 'Ver como tabela' }))
    const t = screen.getByRole('table')
    expect(within(t).getByRole('row', { name: /abr\/2026/ })).toHaveTextContent('—')
    expect(within(t).getByRole('row', { name: /mai\/2026/ })).toHaveTextContent(
      'n=0 · não publicado',
    )
  })
  it('mudança de critério: lista com a data; a que cai depois do último mês não vira linha no gráfico', () => {
    render(
      serie({
        marcacoes: [
          { id: 'a', data: '2026-05-10', descricao: 'Critério A' },
          { id: 'b', data: '2027-01-10', descricao: 'Critério fora' },
        ],
      }),
    )
    expect(screen.getAllByTestId('marcador-criterio')).toHaveLength(1)
    expect(screen.getByTestId('marcador-criterio')).toHaveTextContent(
      'Mudança de critério em 10/05/2026: Critério A',
    )
  })
  describe('janela incompleta (077, CA-1 a CA-7, CA-14)', () => {
    const jan = (mes: string) => ({
      mes,
      valor: null,
      n: null,
      texto: 'janela incompleta (histórico começa em 14/08/2026)',
      janelaIncompleta: '2026-08-14',
    })
    const mista = [jan('2026-04'), ...pontos(8, null, 9).slice(1)]
    it('lista o motivo em texto, a frase no subtítulo e o resumo do gráfico', () => {
      render(serie({ pontos: mista, subtitulo: 'Cada ponto: janela' }))
      expect(screen.getByTestId('t-sem-valor')).toHaveTextContent(
        'abr/2026 · Janela incompleta: o histórico começa em 14/08/2026. Estatística não publicada.',
      )
      expect(screen.getByTestId('t-sem-valor')).toHaveTextContent('mai/2026 · poucos itens (n=14)')
      expect(
        screen.getByText(/Meses cuja janela de 12 semanas começa antes da primeira carga/),
      ).toBeInTheDocument()
      expect(screen.getByTestId('t-grafico').closest('figure')).toHaveTextContent(
        'abril: janela incompleta (histórico começa em 14/08/2026)',
      )
    })
    it('frase do subtítulo some sem janela incompleta; sozinha quando não há subtítulo', () => {
      const { unmount } = render(serie({ subtitulo: 'Sub' }))
      expect(screen.queryByText(/primeira carga/)).toBeNull()
      unmount()
      render(serie({ pontos: mista }))
      expect(screen.getByText(/primeira carga/)).toBeInTheDocument()
    })
    it('tabela mostra "—" e a situação "não publicado · janela incompleta"', async () => {
      render(serie({ pontos: mista }))
      await userEvent.click(screen.getByRole('button', { name: 'Ver como tabela' }))
      const linha = within(screen.getByRole('table')).getByRole('row', { name: /abr\/2026/ })
      expect(linha).toHaveTextContent('—')
      expect(linha).toHaveTextContent('não publicado · janela incompleta')
    })
    it('tudo não publicado: vazio com a janela de 12 semanas completa, sem tabela', () => {
      render(serie({ pontos: [jan('2026-04'), jan('2026-05')] }))
      expect(screen.getByTestId('t-vazio')).toHaveTextContent('com a janela de 12 semanas completa')
      expect(screen.queryByRole('button', { name: 'Ver como tabela' })).toBeNull()
    })
  })
  it('sem subtítulo e sem frase, só o gráfico', () => {
    render(serie({ frase: '', pontos: pontos(1, 2) }))
    expect(screen.queryByTestId('t-frase')).toBeNull()
  })
})

const q = (estado: MetricaQuery<never>['estado'], dados?: unknown): MetricaQuery<never> => ({
  estado,
  dados: dados as never,
  erro: null,
  origem: 'real',
  atualizando: false,
  recarregar: vi.fn(),
})
const J = { inicio: '2026-07-18', fim: '2026-10-09' }

describe('TendenciaFluxo e TendenciaSustentacao (sem painel de preferências)', () => {
  it('sem dado real mostra o estado com o motivo, no lugar das séries', () => {
    const e = { ...q('sem-dado-real'), erro: new SemDadoRealErro('TENDENCIA_FLUXO', 'sem fonte') }
    const a = noRouter(<TendenciaFluxo q={e} qO3={q('ok')} />)
    expect(
      within(screen.getByTestId('tendencia-fluxo-sem-dado-real')).getByText('sem fonte'),
    ).toBeInTheDocument()
    a.unmount()
    noRouter(<TendenciaSustentacao q={q('sem-dado-real')} />)
    expect(screen.getByTestId('tendencia-sustentacao-sem-dado-real')).toHaveTextContent(
      'fonte real ainda não definida',
    )
  })
  it('carregando mostra o esqueleto de altura fixa; erro mostra "Tentar de novo" da série', async () => {
    const a = noRouter(<TendenciaFluxo q={q('carregando')} qO3={q('ok')} />)
    expect(screen.getByTestId('tendencia-fluxo-carregando')).toBeInTheDocument()
    a.unmount()
    const r = q('erro')
    const b = noRouter(<TendenciaFluxo q={r} qO3={q('ok')} />)
    await userEvent.click(
      within(screen.getByTestId('tendencia-fluxo-erro')).getByRole('button', {
        name: 'Tentar de novo',
      }),
    )
    expect(r.recarregar).toHaveBeenCalledOnce()
    b.unmount()
    noRouter(<TendenciaSustentacao q={q('carregando')} />)
    expect(screen.getByTestId('tendencia-sustentacao-carregando')).toBeInTheDocument()
  })
  it('sem o O3 (falhou), a série não diz o tipo e os pontos ficam sem valor', () => {
    const t = {
      criterios: { serie: [], janela: [] },
      meses: [
        {
          mes: '2026-08',
          fimDoMes: '2026-08-31',
          janelaPercentis: { ...J, unidade: 'semanas', quantidade: 12 },
          p85PorTipo: [],
          concluidos: 4,
        },
      ],
    } as never
    noRouter(<TendenciaFluxo q={q('ok', t)} qO3={q('ok')} />)
    expect(screen.getByTestId('tendencia-fluxo-p85')).toHaveTextContent(
      'P85 do tempo de ciclo, em dias úteis, últimos 6 meses',
    )
    expect(screen.getByTestId('tendencia-fluxo-p85-vazio')).toBeInTheDocument()
    expect(screen.getByTestId('tendencia-fluxo-concluidos')).toBeInTheDocument()
  })
  it('O3 com erro: a série de P85 mostra o próprio erro (não diz que falta histórico) e a de concluídos segue', async () => {
    const t = {
      criterios: { serie: [], janela: [] },
      meses: [
        {
          mes: '2026-08',
          fimDoMes: '2026-08-31',
          janelaPercentis: { ...J, unidade: 'semanas', quantidade: 12 },
          p85PorTipo: [],
          concluidos: 4,
        },
      ],
    } as never
    const o3 = q('erro')
    noRouter(<TendenciaFluxo q={q('ok', t)} qO3={o3} />)
    const erro = screen.getByTestId('tendencia-fluxo-p85-erro')
    expect(erro).toHaveTextContent('P85 indisponível')
    expect(screen.queryByText(/Ainda não há histórico suficiente/)).toBeNull()
    expect(screen.queryByTestId('tendencia-fluxo-p85')).toBeNull()
    expect(screen.getByTestId('tendencia-fluxo-concluidos')).toBeInTheDocument()
    await userEvent.click(within(erro).getByRole('button', { name: 'Tentar de novo' }))
    expect(o3.recarregar).toHaveBeenCalledOnce()
  })
  it('Sustentação: as duas séries', () => {
    const t = {
      criterios: { serie: [], janela: [{ id: 'j', data: '2026-06-01', descricao: 'Janela nova' }] },
      meses: [{ mes: '2026-08', fimDoMes: '2026-08-31', janela: J, prioridades: [], volume: 12 }],
    } as never
    noRouter(<TendenciaSustentacao q={q('ok', t)} />)
    expect(screen.getByTestId('tendencia-sustentacao-sla-vazio')).toBeInTheDocument()
    expect(screen.getByTestId('tendencia-sustentacao-volume-frase')).toHaveTextContent(
      'Em agosto: 12 chamados.',
    )
    expect(screen.getByTestId('marcador-criterio')).toHaveTextContent('Janela nova')
  })
  describe('Sustentação: janela incompleta (077, CA-1, CA-2, CA-4, CA-5, CA-14)', () => {
    const incompleto = (mes: string) => ({
      mes,
      fimDoMes: `${mes}-28`,
      janela: J,
      prioridades: [],
      volume: 12,
      janelaIncompleta: { historicoDesde: '2026-08-14' },
    })
    const celula = {
      taxa: { status: 'ok', k: 20, n: 25, pct: 80 },
      statusMeta: 'fora',
    }
    const publicada = { prioridade: 'P1', primeiroAtendimento: celula, restauracao: celula }
    const t = (meses: object[]) => ({ criterios: { serie: [], janela: [] }, meses }) as never
    const comPublicado = t([
      incompleto('2026-07'),
      { mes: '2026-08', fimDoMes: '2026-08-31', janela: J, prioridades: [publicada], volume: 3 },
    ])
    it('SLA: motivo na lista e na tabela, frase no subtítulo; volume sem marcador', async () => {
      noRouter(<TendenciaSustentacao q={q('ok', comPublicado)} />)
      const sla = screen.getByTestId('tendencia-sustentacao-sla')
      expect(within(sla).getByTestId('tendencia-sustentacao-sla-sem-valor')).toHaveTextContent(
        'jul/2026 · Janela incompleta: o histórico começa em 14/08/2026. Estatística não publicada.',
      )
      expect(sla).toHaveTextContent(
        /Meses cuja janela de 12 semanas começa antes da primeira carga/,
      )
      expect(sla).toHaveTextContent('julho: Janela incompleta')
      const volume = screen.getByTestId('tendencia-sustentacao-volume')
      expect(volume).not.toHaveTextContent(/Janela incompleta|primeira carga/)
      expect(within(volume).queryByTestId('tendencia-sustentacao-volume-sem-valor')).toBeNull()
      await userEvent.click(within(sla).getByRole('button', { name: 'Ver como tabela' }))
      const linha = within(sla).getByRole('row', { name: /jul\/2026/ })
      expect(linha).toHaveTextContent('—')
      expect(linha).toHaveTextContent('não publicado · janela incompleta')
    })
    it('todos os meses incompletos: vazio próprio da sustentação, sem tabela', () => {
      noRouter(<TendenciaSustentacao q={q('ok', t([incompleto('2026-07')]))} />)
      const vazio = screen.getByTestId('tendencia-sustentacao-sla-vazio')
      expect(vazio).toHaveTextContent(
        'Ainda não há histórico suficiente: nenhuma prioridade teve 20 chamados ou mais, com a janela de 12 semanas completa, em nenhum dos últimos 6 meses.',
      )
      expect(screen.queryByTestId('tendencia-sustentacao-sla-alternar')).toBeNull()
      expect(screen.getByTestId('tendencia-sustentacao-volume-frase')).toHaveTextContent(
        'Em julho: 12 chamados.',
      )
    })
  })
})
