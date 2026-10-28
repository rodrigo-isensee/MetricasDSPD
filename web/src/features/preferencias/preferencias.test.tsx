import { act, fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  CATALOGO_CARTOES,
  CHAVE_PREFERENCIAS,
  PREFERENCIAS_PADRAO,
  cartoesDoPainel,
  type CartaoCatalogo,
  type PainelComCartoes,
  type PreferenciasMetricas,
} from '@metricas-dspd/contratos'
import { destinoDoCartao } from '@/lib/destinoCartao'
import { fonteDeTeste, renderizarApp } from '@/test/helpers'
import { ErroVersaoMaisNova, type FontePreferencias } from './fonte'

/** Perfil pré-carregado no navegador (o que a pessoa já salvou em /preferencias). */
function guardar(paineis: Partial<Record<PainelComCartoes, string[]>>) {
  const p: PreferenciasMetricas = {
    versao: 1,
    paineis: Object.fromEntries(Object.entries(paineis).map(([k, v]) => [k, { ocultar: v }])),
    atualizadoEm: '2026-10-10T00:00:00.000Z',
  }
  window.localStorage.setItem(CHAVE_PREFERENCIAS, JSON.stringify(p))
}
const guardado = (): PreferenciasMetricas =>
  JSON.parse(window.localStorage.getItem(CHAVE_PREFERENCIAS) ?? 'null') as PreferenciasMetricas
const todos = (p: PainelComCartoes) => cartoesDoPainel(p).map((c) => c.id)

afterEach(() => vi.useRealTimers())

describe('perfil /preferencias', () => {
  it('lista um grupo por painel com todas as métricas, por seção, e começa com tudo visível', async () => {
    renderizarApp('/preferencias')
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Preferências de métricas' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Suas escolhas ficam salvas neste navegador\. Ninguém as vê/),
    ).toBeInTheDocument()
    for (const nome of ['Operacional', 'Operacional · Sustentação', 'Tático', 'Estratégico'])
      expect(screen.getByRole('group', { name: nome })).toBeInTheDocument()
    // A visão Sustentação vem logo depois do Operacional (a chave gravada continua `sustentacao`).
    expect(screen.getAllByTestId(/^grupo-/).map((g) => g.getAttribute('data-testid'))).toEqual([
      'grupo-operacional',
      'grupo-sustentacao',
      'grupo-tatico',
      'grupo-estrategico',
    ])
    expect(screen.getAllByRole('checkbox')).toHaveLength(CATALOGO_CARTOES.length)
    for (const c of screen.getAllByRole('checkbox')) expect(c).toBeChecked()
    expect(screen.getByTestId('contador-operacional')).toHaveTextContent(
      '12 de 12 do núcleo e 14 de 14 complementares visíveis',
    )
    expect(screen.getByRole('button', { name: 'Restaurar padrão' })).toBeDisabled()
  })

  it('desmarcar aplica na hora, grava no navegador e anuncia "Salvo neste navegador"', async () => {
    const u = userEvent.setup()
    renderizarApp('/preferencias')
    const grupo = await screen.findByTestId('grupo-operacional')
    await u.click(within(grupo).getByRole('checkbox', { name: /O9 Os três relógios/ }))
    expect(await screen.findByText('Salvo neste navegador')).toBeInTheDocument()
    expect(screen.getByTestId('contador-operacional')).toHaveTextContent(
      '11 de 12 do núcleo e 14 de 14 complementares visíveis',
    )
    expect(guardado().paineis.operacional?.ocultar).toEqual(['o9'])
    await u.click(within(grupo).getByRole('checkbox', { name: /O9 Os três relógios/ }))
    expect(guardado().paineis.operacional?.ocultar).toEqual([])
  })

  it('"Aplicar sugestão do meu papel" só marca caixas e não grava o papel', async () => {
    const u = userEvent.setup()
    renderizarApp('/preferencias')
    await screen.findByTestId('grupo-operacional')
    await u.click(screen.getByRole('button', { name: 'Aplicar sugestão do papel Gerente' }))
    expect(screen.getByTestId('contador-operacional')).toHaveTextContent(
      '0 de 12 do núcleo e 0 de 14 complementares visíveis',
    )
    expect(screen.getByTestId('contador-tatico')).toHaveTextContent(
      '8 de 8 do núcleo e 7 de 7 complementares visíveis',
    )
    expect(screen.getByTestId('contador-estrategico')).toHaveTextContent(
      '4 de 4 do núcleo e 6 de 6 complementares visíveis',
    )
    expect(screen.getByTestId('contador-sustentacao')).toHaveTextContent(
      '0 de 8 do núcleo e 0 de 6 complementares visíveis',
    )
    expect(JSON.stringify(guardado())).not.toMatch(/gerente|papel/i)
    await u.click(screen.getByRole('button', { name: 'Aplicar sugestão do papel Time' }))
    expect(screen.getByTestId('contador-operacional')).toHaveTextContent(
      '12 de 12 do núcleo e 14 de 14 complementares visíveis',
    )
    await u.click(screen.getByRole('button', { name: 'Aplicar sugestão do papel Coordenador' }))
    expect(screen.getByTestId('contador-tatico')).toHaveTextContent(
      '8 de 8 do núcleo e 7 de 7 complementares visíveis',
    )
  })

  it('"Restaurar padrão" pede confirmação nomeando as métricas; cancelar não muda nada', async () => {
    const u = userEvent.setup()
    guardar({ operacional: ['o9'], tatico: ['t5'] })
    renderizarApp('/preferencias')
    await screen.findByTestId('grupo-operacional')
    await u.click(screen.getByRole('button', { name: 'Restaurar padrão' }))
    const dlg = await screen.findByRole('dialog', { name: 'Restaurar o padrão?' })
    expect(dlg).toHaveTextContent(
      'As 2 métricas ocultas (O9, T5) voltam a aparecer em todos os painéis e a seção "Mais métricas deste painel" volta a abrir.',
    )
    await u.click(within(dlg).getByRole('button', { name: 'Cancelar' }))
    expect(screen.getByTestId('contador-operacional')).toHaveTextContent(
      '11 de 12 do núcleo e 14 de 14 complementares visíveis',
    )
    await u.click(screen.getByRole('button', { name: 'Restaurar padrão' }))
    await u.click(await screen.findByRole('button', { name: 'Restaurar' }))
    expect(screen.getByTestId('contador-operacional')).toHaveTextContent(
      '12 de 12 do núcleo e 14 de 14 complementares visíveis',
    )
    expect(guardado().paineis).toEqual({})
  })

  it('com uma só métrica oculta, a confirmação fala no singular', async () => {
    const u = userEvent.setup()
    guardar({ operacional: ['o9'] })
    renderizarApp('/preferencias')
    await u.click(await screen.findByRole('button', { name: 'Restaurar padrão' }))
    expect(await screen.findByRole('dialog')).toHaveTextContent(
      'A métrica oculta (O9) volta a aparecer',
    )
  })

  it('falha ao salvar mantém a escolha na tela e avisa', async () => {
    const u = userEvent.setup()
    const f: FontePreferencias = {
      origem: 'navegador',
      obter: () => Promise.resolve(PREFERENCIAS_PADRAO),
      salvar: () => Promise.reject(new Error('cota')),
    }
    renderizarApp('/preferencias', fonteDeTeste, f)
    const caixa = await screen.findByRole('checkbox', { name: /O9 Os três relógios/ })
    await u.click(caixa)
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível salvar suas preferências. Tente de novo.',
    )
    expect(caixa).not.toBeChecked()
  })

  it('perfil salvo por versão mais nova: avisa que não será alterado (A6)', async () => {
    const u = userEvent.setup()
    const f: FontePreferencias = {
      origem: 'navegador',
      obter: () => Promise.resolve(PREFERENCIAS_PADRAO),
      salvar: () => Promise.reject(new ErroVersaoMaisNova()),
    }
    renderizarApp('/preferencias', fonteDeTeste, f)
    await u.click(await screen.findByRole('checkbox', { name: /O9 Os três relógios/ }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Suas preferências foram salvas por uma versão mais nova do sistema e não serão alteradas aqui.',
    )
  })

  it('mostra um esqueleto enquanto lê as preferências', async () => {
    const f: FontePreferencias = {
      origem: 'navegador',
      obter: () => new Promise(() => undefined),
      salvar: () => Promise.resolve(),
    }
    renderizarApp('/preferencias', fonteDeTeste, f)
    expect(await screen.findByTestId('preferencias-carregando')).toBeInTheDocument()
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })

  it('leitura que falha cai no padrão; ids inexistentes do perfil são ignorados em silêncio', async () => {
    const f: FontePreferencias = {
      origem: 'navegador',
      obter: () => Promise.reject(new Error('x')),
      salvar: () => Promise.resolve(),
    }
    renderizarApp('/preferencias', fonteDeTeste, f)
    expect(await screen.findByTestId('contador-operacional')).toHaveTextContent('12 de 12')
  })

  it('perfil com id que não existe mais não quebra e não conta', async () => {
    guardar({ operacional: ['o9', 'fantasma'] })
    renderizarApp('/preferencias')
    expect(await screen.findByTestId('contador-operacional')).toHaveTextContent('11 de 12')
  })

  it('o link "Preferências" fica no cabeçalho', async () => {
    renderizarApp('/preferencias')
    await screen.findByTestId('grupo-operacional')
    expect(screen.getAllByRole('link', { name: 'Preferências' }).length).toBeGreaterThan(0)
  })

  it('o menu do celular também leva às Preferências', async () => {
    const u = userEvent.setup()
    renderizarApp('/ajuda')
    await u.click(await screen.findByTestId('abrir-menu'))
    const menu = await screen.findByRole('dialog', { name: 'Menu' })
    await u.click(within(menu).getByRole('link', { name: 'Preferências' }))
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Preferências de métricas' }),
    ).toBeInTheDocument()
  })
})

describe('painel: botão "Métricas: N de M", ocultar e desfazer', () => {
  it('o botão mostra N de M e abre o popover com as caixas do painel; Esc fecha e devolve o foco', async () => {
    const u = userEvent.setup()
    renderizarApp('/operacional?cadencia=diaria')
    const botao = await screen.findByRole('button', {
      name: 'Métricas: 12 de 12 (+14 complementares)',
    })
    expect(screen.queryByTestId('faixa-ocultas')).not.toBeInTheDocument()
    await u.click(botao)
    const dlg = await screen.findByRole('dialog', { name: 'Métricas desta visão' })
    expect(within(dlg).getAllByRole('checkbox')).toHaveLength(26)
    await u.click(within(dlg).getByRole('checkbox', { name: /O3 Tempo de ciclo/ }))
    expect(screen.getByTestId('botao-metricas')).toHaveTextContent(
      'Métricas: 11 de 12 (+14 complementares)',
    )
    await u.click(within(dlg).getByRole('checkbox', { name: /O3 Tempo de ciclo/ }))
    expect(screen.getByTestId('botao-metricas')).toHaveTextContent(
      'Métricas: 12 de 12 (+14 complementares)',
    )
    await u.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(
      screen.getByRole('button', { name: 'Métricas: 12 de 12 (+14 complementares)' }),
    ).toHaveFocus()
  })

  it('mudança no popover vale só na visita: o perfil continua intacto', async () => {
    const u = userEvent.setup()
    renderizarApp('/operacional?cadencia=diaria')
    await u.click(
      await screen.findByRole('button', { name: 'Métricas: 12 de 12 (+14 complementares)' }),
    )
    await u.click(await screen.findByRole('checkbox', { name: /O3 Tempo de ciclo/ }))
    expect(window.localStorage.getItem(CHAVE_PREFERENCIAS)).toBeNull()
  })

  it('popover: "Mostrar todas", "Usar minhas preferências" e "Fechar"', async () => {
    const u = userEvent.setup()
    guardar({ operacional: ['o9'] })
    renderizarApp('/operacional?cadencia=diaria')
    await u.click(
      await screen.findByRole('button', { name: 'Métricas: 11 de 12 (+14 complementares)' }),
    )
    const dlg = await screen.findByRole('dialog')
    await u.click(within(dlg).getByRole('button', { name: 'Mostrar todas' }))
    expect(screen.getByTestId('botao-metricas')).toHaveTextContent(
      'Métricas: 12 de 12 (+14 complementares)',
    )
    await u.click(within(dlg).getByRole('button', { name: 'Usar minhas preferências' }))
    expect(screen.getByTestId('botao-metricas')).toHaveTextContent(
      'Métricas: 11 de 12 (+14 complementares)',
    )
    await u.click(within(dlg).getByRole('button', { name: 'Fechar' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('"Ocultar esta métrica" some com o cartão, anuncia, mostra a faixa e leva o foco ao próximo título', async () => {
    const u = userEvent.setup()
    renderizarApp('/operacional?cadencia=semanal')
    await screen.findByTestId('metrica-O3')
    await u.click(screen.getByRole('button', { name: 'Ocultar esta métrica O3' }))
    expect(screen.queryByTestId('metrica-O3')).not.toBeInTheDocument()
    expect(screen.getByTestId('anuncio-preferencias')).toHaveTextContent(
      'O3 oculta. 11 de 12 métricas visíveis. Desfazer',
    )
    expect(screen.getByTestId('faixa-ocultas')).toHaveTextContent('1 métrica oculta: O3')
    expect(
      screen.getByRole('button', { name: 'Métricas: 11 de 12 (+14 complementares)' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 3, name: /Os três relógios do pedido/ }),
    ).toHaveFocus()
    // U1: ocultar é lembrado até a pessoa mandar mostrar
    expect(guardado().paineis.operacional?.ocultar).toEqual(['o3'])
  })

  it('o que foi ocultado continua oculto ao reabrir o painel, até mandar mostrar', async () => {
    const u = userEvent.setup()
    const { unmount } = renderizarApp('/operacional?cadencia=semanal')
    await screen.findByTestId('metrica-O3')
    await u.click(screen.getByRole('button', { name: 'Ocultar esta métrica O3' }))
    unmount()
    renderizarApp('/operacional?cadencia=semanal')
    await screen.findByTestId('metrica-O4')
    expect(screen.queryByTestId('metrica-O3')).not.toBeInTheDocument()
    expect(screen.getByTestId('faixa-ocultas')).toHaveTextContent('1 métrica oculta: O3')
  })

  it('"Desfazer" devolve o cartão e o foco ao título restaurado', async () => {
    const u = userEvent.setup()
    renderizarApp('/operacional?cadencia=semanal')
    await screen.findByTestId('metrica-O3')
    await u.click(screen.getByRole('button', { name: 'Ocultar esta métrica O3' }))
    const aviso = screen.getByTestId('aviso-desfazer')
    expect(aviso).toHaveTextContent('O3 oculta. 11 de 12 métricas visíveis.')
    await u.click(within(aviso).getByRole('button', { name: 'Desfazer' }))
    const cartao = await screen.findByTestId('metrica-O3')
    expect(within(cartao).getByRole('heading', { level: 3 })).toHaveFocus()
    expect(screen.queryByTestId('aviso-desfazer')).not.toBeInTheDocument()
    expect(screen.queryByTestId('faixa-ocultas')).not.toBeInTheDocument()
  })

  it('ocultar um cartão leva o foco ao título seguinte (a seção de espera invisível, no fim da página)', async () => {
    const u = userEvent.setup()
    renderizarApp('/operacional?cadencia=semanal')
    await screen.findByTestId('metrica-O18')
    await u.click(screen.getByRole('button', { name: 'Ocultar esta métrica O18' }))
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Quanto do tempo do solicitante fica fora da nossa gestão?',
      }),
    ).toHaveFocus()
  })

  it('o aviso de desfazer some sozinho depois de alguns segundos', async () => {
    renderizarApp('/operacional?cadencia=semanal')
    await screen.findByTestId('metrica-O3')
    vi.useFakeTimers()
    fireEvent.click(screen.getByRole('button', { name: 'Ocultar esta métrica O3' }))
    expect(screen.getByTestId('aviso-desfazer')).toBeInTheDocument()
    act(() => void vi.advanceTimersByTime(10_000))
    expect(screen.queryByTestId('aviso-desfazer')).not.toBeInTheDocument()
  })

  it('a faixa de ocultas tem "Mostrar todas" e "Usar minhas preferências"', async () => {
    const u = userEvent.setup()
    guardar({ operacional: ['o9', 'o3'] })
    renderizarApp('/operacional?cadencia=semanal')
    const faixa = await screen.findByTestId('faixa-ocultas')
    expect(faixa).toHaveTextContent('2 métricas ocultas: O3, O9')
    await u.click(within(faixa).getByRole('button', { name: 'Mostrar todas' }))
    expect(screen.queryByTestId('faixa-ocultas')).not.toBeInTheDocument()
    expect(await screen.findByTestId('metrica-O9')).toBeInTheDocument()
    // U1: "Mostrar todas" também é lembrado
    expect(guardado().paineis.operacional?.ocultar).toEqual([])
  })

  it('perfil guardado esconde os cartões já na primeira tela, sem piscar', async () => {
    guardar({ operacional: ['o2'] })
    renderizarApp('/operacional?cadencia=diaria')
    expect(await screen.findByTestId('metrica-O1')).toBeInTheDocument()
    expect(screen.queryByTestId('metrica-O2')).not.toBeInTheDocument()
  })

  it('o link da tela leva só filtros: nenhum parâmetro de seleção de métricas na URL', async () => {
    const u = userEvent.setup()
    const { roteador } = renderizarApp('/operacional?cadencia=semanal')
    await screen.findByTestId('metrica-O3')
    await u.click(screen.getByRole('button', { name: 'Ocultar esta métrica O3' }))
    expect(roteador.state.location.search).not.toMatch(/ocultar/i)
  })
})

describe('painel: o que nunca é recortado', () => {
  it('"Pede atenção" mantém o alerta de métrica oculta, com selo e "Mostrar"', async () => {
    const u = userEvent.setup()
    guardar({ operacional: ['o1', 'o2', 'bloqueados'] })
    renderizarApp('/operacional?cadencia=diaria')
    const faixa = await screen.findByTestId('faixa-atencao')
    await waitFor(() =>
      expect(within(faixa).queryByTestId('faixa-atencao-carregando')).not.toBeInTheDocument(),
    )
    const ocultos = within(faixa).queryAllByText('métrica oculta')
    expect(ocultos.length).toBeGreaterThan(0)
    const botao = within(faixa).getAllByRole('button', { name: /^Mostrar \S+$/ })[0]
    expect(botao).toBeDefined()
    const rotulo = (botao as HTMLElement).textContent
    const codigo = /Mostrar (\S+)/.exec(rotulo)?.[1] ?? ''
    await u.click(botao as HTMLElement)
    expect(await screen.findByTestId(`metrica-${codigo}`)).toBeInTheDocument()
  })

  it('o alerta que sobra no mesmo painel mantém o link "Ver" quando a métrica está visível', async () => {
    renderizarApp('/operacional?cadencia=diaria')
    const faixa = await screen.findByTestId('faixa-atencao')
    await waitFor(() =>
      expect(within(faixa).queryByTestId('faixa-atencao-carregando')).not.toBeInTheDocument(),
    )
    expect(within(faixa).queryByText('métrica oculta')).not.toBeInTheDocument()
  })

  it('mudança de critério em métrica oculta gera aviso com "Mostrar X"', async () => {
    const u = userEvent.setup()
    const versoes = await fonteDeTeste.criterios()
    const alvo = CATALOGO_CARTOES.find((c) =>
      versoes.some((v) => v.afeta.some((m) => c.metricas.includes(m))),
    )
    expect(alvo).toBeDefined()
    guardar({ [alvo?.painel as PainelComCartoes]: [alvo?.id as string] })
    renderizarApp(destinoDoCartao(alvo as CartaoCatalogo).split('#')[0] as string)
    const avisos = await screen.findByTestId('avisos-criterio-ocultas')
    expect(avisos).toHaveTextContent(`Critério alterado em ${alvo?.codigo} (oculta) em`)
    await u.click(
      within(avisos).getAllByRole('button', { name: `Mostrar ${alvo?.codigo}` })[0] as HTMLElement,
    )
    await waitFor(() =>
      expect(screen.queryByTestId('avisos-criterio-ocultas')).not.toBeInTheDocument(),
    )
  })

  it('avisos do cartão visível (base, nota) não são controláveis: ficam mesmo com outras ocultas', async () => {
    guardar({ operacional: ['o9'] })
    renderizarApp('/operacional?cadencia=semanal')
    const o3 = await screen.findByTestId('metrica-O3')
    expect(within(o3).getByRole('button', { name: /Como ler/i })).toBeInTheDocument()
    expect(await screen.findByTestId('base-O3')).toBeInTheDocument()
  })

  it('seção com todos os cartões ocultos mostra a orientação, e o "Ir para" dela some', async () => {
    const u = userEvent.setup()
    guardar({ operacional: ['o10', 'o7'] })
    renderizarApp('/operacional?cadencia=semanal')
    const secao = await screen.findByRole('region', { name: 'Backlog' })
    expect(
      within(secao).getByText('Todas as métricas desta seção estão ocultas.'),
    ).toBeInTheDocument()
    const ir = screen.getByRole('navigation', { name: 'Ir para' })
    expect(within(ir).queryByRole('link', { name: 'Backlog' })).not.toBeInTheDocument()
    expect(within(ir).getByRole('link', { name: 'Tempo' })).toBeInTheDocument()
    await u.click(within(secao).getByRole('button', { name: 'Mostrar métricas da seção' }))
    expect(await screen.findByTestId('metrica-O10')).toBeInTheDocument()
    expect(await screen.findByTestId('metrica-O7')).toBeInTheDocument()
  })

  it('na visão diária, os três cartões ocultos mostram a orientação sem título de seção', async () => {
    const u = userEvent.setup()
    guardar({ operacional: ['o1', 'o2', 'bloqueados'] })
    renderizarApp('/operacional?cadencia=diaria')
    const msg = await screen.findByTestId('secao-oculta')
    await u.click(within(msg).getByRole('button', { name: 'Mostrar métricas' }))
    expect(await screen.findByTestId('metrica-O2')).toBeInTheDocument()
  })

  it('painel todo oculto: estado vazio com "Mostrar todas", faixa "Pede atenção" e filtros continuam', async () => {
    const u = userEvent.setup()
    guardar({ operacional: todos('operacional') })
    renderizarApp('/operacional?cadencia=semanal')
    const vazio = await screen.findByTestId('painel-oculto-vazio')
    expect(vazio).toHaveTextContent('Você ocultou todas as métricas deste painel.')
    expect(vazio).toHaveTextContent('A faixa Pede atenção e os avisos continuam.')
    expect(screen.getByTestId('faixa-atencao')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Métricas: 0 de 12 (+0 complementares)' }),
    ).toBeInTheDocument()
    expect(screen.queryByTestId('secao-oculta')).not.toBeInTheDocument()
    await u.click(within(vazio).getByRole('button', { name: 'Mostrar todas' }))
    expect(await screen.findByTestId('metrica-O3')).toBeInTheDocument()
  })

  it('pares "leia junto": o link some quando o par está oculto', async () => {
    guardar({ operacional: ['o4'], tatico: ['t4'] })
    const { unmount } = renderizarApp('/operacional?cadencia=semanal')
    const o18 = await screen.findByTestId('metrica-O18')
    await waitFor(() => expect(within(o18).getByTestId('base-O18')).toBeInTheDocument())
    expect(within(o18).queryByRole('link', { name: /Ver vazão/ })).not.toBeInTheDocument()
    unmount()
    renderizarApp('/tatico')
    const t1 = await screen.findByTestId('metrica-T1')
    await waitFor(() => expect(within(t1).getByTestId('base-T1')).toBeInTheDocument())
    expect(within(t1).queryByRole('link', { name: /Leia junto/ })).not.toBeInTheDocument()
  })

  it('pares "leia junto" visíveis mantêm o link', async () => {
    renderizarApp('/tatico')
    const t1 = await screen.findByTestId('metrica-T1')
    expect(
      await within(t1).findByRole('link', { name: /Leia junto com Demanda/ }),
    ).toBeInTheDocument()
  })
})

describe('outras telas', () => {
  it('a Visão geral nunca é recortada e informa que as preferências valem para os painéis', async () => {
    guardar({ operacional: todos('operacional'), tatico: todos('tatico') })
    renderizarApp('/')
    expect(await screen.findByTestId('preferencias-valem')).toHaveTextContent(
      'As preferências de métricas valem para os painéis',
    )
    expect(screen.queryByRole('button', { name: /Ocultar esta métrica/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Métricas:/ })).not.toBeInTheDocument()
  })

  it('ocultos salvos antes da mudança (ids ei-*) continuam valendo, a seção sai do "Ir para" e a chave solta `espera-invisivel` é ignorada', async () => {
    guardar({ operacional: ['ei-fl1'], 'espera-invisivel': ['ei-fl2'] } as never)
    renderizarApp('/operacional?cadencia=semanal')
    expect(await screen.findByTestId('metrica-O3')).toBeInTheDocument()
    expect(screen.queryByTestId('metrica-EI-FL1')).not.toBeInTheDocument()
    const irPara = screen.getByRole('navigation', { name: 'Ir para' })
    expect(within(irPara).queryByRole('link', { name: 'Espera invisível' })).toBeNull()
    expect(within(irPara).getByRole('link', { name: 'Qualidade' })).toBeInTheDocument()
  })

  it('oculta o EI-FL2 gravando só o id no painel Tático (formato do 007) e o marcador da P1 aparece', async () => {
    guardar({ tatico: ['ei-fl2'] })
    renderizarApp('/tatico')
    expect(await screen.findByTestId('metrica-T2')).toBeInTheDocument()
    expect(screen.queryByTestId('metrica-EI-FL2')).not.toBeInTheDocument()
    expect(screen.getByTestId('secao-oculta')).toBeInTheDocument()
  })

  it('desmarcar a Espera invisível do Tático grava só `{ tatico: [ei-fl2] }` e o painel respeita', async () => {
    const u = userEvent.setup()
    const r = renderizarApp('/preferencias')
    const grupo = await screen.findByTestId('grupo-tatico')
    await u.click(within(grupo).getByRole('checkbox', { name: /EI-FL2/ }))
    expect(await screen.findByText('Salvo neste navegador')).toBeInTheDocument()
    expect(guardado().paineis.tatico?.ocultar).toEqual(['ei-fl2'])
    r.unmount()
    renderizarApp('/tatico')
    expect(await screen.findByTestId('metrica-T2')).toBeInTheDocument()
    expect(screen.queryByTestId('metrica-EI-FL2')).not.toBeInTheDocument()
  })

  it('a Espera invisível pode ser ocultada no painel do nível', async () => {
    guardar({ tatico: ['ei-fl2'] })
    renderizarApp('/tatico')
    expect(await screen.findByTestId('metrica-T2')).toBeInTheDocument()
    expect(screen.queryByTestId('metrica-EI-FL2')).not.toBeInTheDocument()
  })

  it('Sustentação, Estratégico e Tático têm o botão com o total do catálogo', async () => {
    const { unmount } = renderizarApp('/sustentacao')
    expect(
      await screen.findByRole('button', { name: 'Métricas: 8 de 8 (+6 complementares)' }),
    ).toBeInTheDocument()
    unmount()
    const e = renderizarApp('/estrategico')
    expect(
      await screen.findByRole('button', { name: 'Métricas: 4 de 4 (+6 complementares)' }),
    ).toBeInTheDocument()
    e.unmount()
    renderizarApp('/tatico')
    expect(
      await screen.findByRole('button', { name: 'Métricas: 8 de 8 (+7 complementares)' }),
    ).toBeInTheDocument()
  })

  it('o catálogo cobre todo cartão que os painéis desenham (nenhum cartão fora do catálogo)', async () => {
    const ids = new Set(CATALOGO_CARTOES.map((c) => c.codigo))
    renderizarApp('/operacional?cadencia=semanal')
    await screen.findByTestId('metrica-O3')
    for (const el of document.querySelectorAll('[data-testid^="metrica-"]'))
      expect(ids.has((el.getAttribute('data-testid') ?? '').replace('metrica-', ''))).toBe(true)
  })
})
