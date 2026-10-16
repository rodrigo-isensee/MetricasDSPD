import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DialogoExportar, type BaseExportacao } from './DialogoExportar'
import { LIMITE_METRICAS } from './modelo'
import { itensDoNivel, type ItemExportavel } from './selecao'

const AGORA = () => new Date('2026-10-10T15:30:00Z')
const URL_FALSA = 'blob:exportacao-1'
let revogadas: string[] = []

beforeEach(() => {
  revogadas = []
  URL.createObjectURL = vi.fn(() => URL_FALSA)
  URL.revokeObjectURL = vi.fn((u: string) => void revogadas.push(u))
})

const arquivo = (nome = 'metricas-dspd_fluxo-operacional_2026-10-10.pdf') => ({
  nome,
  blob: new Blob(['%PDF'], { type: 'application/pdf' }),
})

function montar(
  base: BaseExportacao,
  itens: readonly ItemExportavel[],
  extra: Partial<Parameters<typeof DialogoExportar>[0]> = {},
) {
  const gerar = vi.fn(() => Promise.resolve(arquivo()))
  const r = render(
    <MemoryRouter>
      <DialogoExportar
        base={base}
        itens={itens}
        mock={false}
        gerar={gerar}
        agora={AGORA}
        {...extra}
      />
    </MemoryRouter>,
  )
  return { gerar, ...r, user: userEvent.setup() }
}

const abrir = async (user: ReturnType<typeof userEvent.setup>, nome = 'Exportar') => {
  await user.click(screen.getByRole('button', { name: nome }))
  return screen.getByRole('dialog')
}

describe('Exportar de um painel', () => {
  it('abre com tudo que está visível marcado, mostra a prévia e gera o arquivo', async () => {
    const itens = itensDoNivel('operacional', ['o9', 'o10'])
    const { gerar, user } = montar('operacional', itens)
    const dlg = await abrir(user)
    expect(
      within(dlg).getByRole('heading', { name: 'Exportar · Operacional (fluxo de projeto)' }),
    ).toBeInTheDocument()
    expect(within(dlg).queryByRole('checkbox', { name: /O9/ })).not.toBeInTheDocument()
    const marcadas = within(dlg)
      .getAllByRole('checkbox')
      .filter((c) => (c as HTMLInputElement).checked)
    expect(marcadas).toHaveLength(itens.length)
    const previa = within(dlg).getByTestId('exportar-previa')
    expect(previa).toHaveTextContent('metricas-dspd_fluxo-operacional_2026-10-10.pdf')
    expect(previa).toHaveTextContent(`BusinessMap (${itens.length})`)
    expect(previa).toHaveTextContent('O sistema não compara equipes nem avalia pessoas.')
    await user.click(within(dlg).getByRole('button', { name: 'Gerar arquivo' }))
    expect(gerar).toHaveBeenCalledWith(itens)
    const baixar = await within(dlg).findByRole('link', { name: 'Baixar' })
    expect(baixar).toHaveAttribute('href', URL_FALSA)
    expect(baixar).toHaveAttribute('download', 'metricas-dspd_fluxo-operacional_2026-10-10.pdf')
    expect(within(dlg).getByRole('status')).toHaveTextContent(
      'Arquivo pronto: metricas-dspd_fluxo-operacional_2026-10-10.pdf.',
    )
    expect(baixar).toHaveFocus()
    expect(within(dlg).getByRole('button', { name: 'Fechar' })).toBeInTheDocument()
  })

  it('desmarcar muda a prévia e uma única métrica vira o nome do arquivo com o id dela', async () => {
    const itens = itensDoNivel('sustentacao', []).slice(0, 2)
    const { user } = montar('sustentacao', itens)
    const dlg = await abrir(user)
    await user.click(within(dlg).getByRole('checkbox', { name: new RegExp(itens[0]!.codigo) }))
    expect(within(dlg).getByTestId('exportar-previa')).toHaveTextContent(
      `metricas-dspd_${itens[1]!.metrica.toLowerCase()}_2026-10-10.pdf`,
    )
    await user.click(within(dlg).getByRole('button', { name: 'Limpar seleção' }))
    expect(within(dlg).getByTestId('exportar-previa')).toHaveTextContent(
      'Marque ao menos uma métrica',
    )
    expect(within(dlg).getByRole('button', { name: 'Gerar arquivo' })).toBeDisabled()
    expect(within(dlg).queryByRole('button', { name: 'Limpar seleção' })).not.toBeInTheDocument()
  })

  it('o rodapé com a ação primária fica fora do corpo que rola e "Marcar todas" respeita o limite', async () => {
    const itens = itensDoNivel('operacional', [])
    const { user } = montar('personalizada', itens)
    const dlg = await abrir(user, 'Exportação personalizada')
    const gerarBtn = within(dlg).getByRole('button', { name: 'Gerar arquivo' })
    expect(within(dlg).getByTestId('exportar-corpo')).not.toContainElement(gerarBtn)
    expect(within(dlg).getByTestId('exportar-rodape')).toContainElement(gerarBtn)
    await user.click(
      within(dlg).getByRole('button', { name: `Marcar todas (até ${LIMITE_METRICAS})` }),
    )
    expect(within(dlg).getAllByRole('checkbox', { checked: true })).toHaveLength(
      Math.min(itens.length, LIMITE_METRICAS),
    )
    expect(within(dlg).queryByRole('button', { name: /Marcar todas/ })).not.toBeInTheDocument()
  })

  it('sem métrica visível: estado vazio com orientação e sem gerar', async () => {
    const todas = itensDoNivel('operacional', []).map((i) => i.chave.split(':')[1]!)
    const { user } = montar('operacional', itensDoNivel('operacional', todas))
    const dlg = await abrir(user)
    expect(within(dlg).getByTestId('exportar-vazio')).toHaveTextContent(
      'Nenhuma métrica visível para exportar. Marque ao menos uma.',
    )
    expect(within(dlg).getByRole('link', { name: 'Preferências' })).toHaveAttribute(
      'href',
      '/preferencias',
    )
    expect(within(dlg).getByRole('button', { name: 'Gerar arquivo' })).toBeDisabled()
  })

  it('carregando as preferências: aviso e sem lista', async () => {
    const { user } = montar('operacional', [], { carregando: true })
    const dlg = await abrir(user)
    expect(within(dlg).getByTestId('exportar-carregando')).toHaveTextContent('Carregando')
    expect(within(dlg).queryByTestId('exportar-vazio')).not.toBeInTheDocument()
    expect(within(dlg).getByRole('button', { name: 'Gerar arquivo' })).toBeDisabled()
  })

  it('anuncia "Gerando..." e bloqueia o botão enquanto gera', async () => {
    let resolver!: (a: ReturnType<typeof arquivo>) => void
    const gerar = vi.fn(() => new Promise<ReturnType<typeof arquivo>>((r) => (resolver = r)))
    const { user } = montar('operacional', itensDoNivel('operacional', []), { gerar })
    const dlg = await abrir(user)
    await user.click(within(dlg).getByRole('button', { name: 'Gerar arquivo' }))
    expect(within(dlg).getByRole('status')).toHaveTextContent('Gerando...')
    expect(within(dlg).getByRole('button', { name: 'Gerar arquivo' })).toBeDisabled()
    resolver(arquivo())
    expect(await within(dlg).findByRole('link', { name: 'Baixar' })).toBeInTheDocument()
  })

  it('erro: mensagem sem detalhe técnico, sem arquivo e com nova tentativa', async () => {
    const gerar = vi
      .fn()
      .mockRejectedValueOnce(new Error('boom interno'))
      .mockResolvedValue(arquivo())
    const { user } = montar('operacional', itensDoNivel('operacional', []), { gerar })
    const dlg = await abrir(user)
    await user.click(within(dlg).getByRole('button', { name: 'Gerar arquivo' }))
    const alerta = await within(dlg).findByRole('alert')
    expect(alerta).toHaveTextContent('Não foi possível gerar o arquivo. Tente de novo.')
    expect(dlg).not.toHaveTextContent('boom')
    expect(within(dlg).queryByRole('link', { name: 'Baixar' })).not.toBeInTheDocument()
    await user.click(within(dlg).getByRole('button', { name: 'Gerar arquivo' }))
    expect(await within(dlg).findByRole('link', { name: 'Baixar' })).toBeInTheDocument()
    expect(within(dlg).queryByRole('alert')).not.toBeInTheDocument()
  })

  it('mudar a seleção depois de pronto volta ao estado de gerar', async () => {
    const { user } = montar('operacional', itensDoNivel('operacional', []))
    const dlg = await abrir(user)
    await user.click(within(dlg).getByRole('button', { name: 'Gerar arquivo' }))
    await within(dlg).findByRole('link', { name: 'Baixar' })
    await user.click(within(dlg).getAllByRole('checkbox')[0]!)
    expect(within(dlg).getByRole('button', { name: 'Gerar arquivo' })).toBeEnabled()
    expect(revogadas).toContain(URL_FALSA)
  })
})

describe('acessibilidade e foco', () => {
  it('Esc fecha e devolve o foco ao botão; reabrir recomeça do zero', async () => {
    const { user } = montar('operacional', itensDoNivel('operacional', []))
    const botao = screen.getByRole('button', { name: 'Exportar' })
    const dlg = await abrir(user)
    await user.click(within(dlg).getAllByRole('checkbox')[0]!)
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(botao).toHaveFocus()
    const outra = await abrir(user)
    expect(
      within(outra)
        .getAllByRole('checkbox')
        .every((c) => (c as HTMLInputElement).checked),
    ).toBe(true)
  })

  it('o foco fica preso no diálogo e o Cancelar fecha', async () => {
    const { user } = montar('operacional', itensDoNivel('operacional', []))
    const dlg = await abrir(user)
    for (let i = 0; i < 40; i++) {
      await user.tab()
      expect(dlg).toContainElement(document.activeElement as HTMLElement)
    }
    await user.click(within(dlg).getByRole('button', { name: 'Cancelar' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('fechar enquanto gera descarta o resultado', async () => {
    let resolver!: (a: ReturnType<typeof arquivo>) => void
    const gerar = vi.fn(() => new Promise<ReturnType<typeof arquivo>>((r) => (resolver = r)))
    const { user } = montar('operacional', itensDoNivel('operacional', []), { gerar })
    const dlg = await abrir(user)
    await user.click(within(dlg).getByRole('button', { name: 'Gerar arquivo' }))
    await user.keyboard('{Escape}')
    resolver(arquivo())
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(URL.createObjectURL).not.toHaveBeenCalled()
  })

  it('fechar enquanto gera descarta também o erro', async () => {
    let rejeitar!: (e: Error) => void
    const gerar = vi.fn(() => new Promise<never>((_, r) => (rejeitar = r)))
    const { user } = montar('operacional', itensDoNivel('operacional', []), { gerar })
    const dlg = await abrir(user)
    await user.click(within(dlg).getByRole('button', { name: 'Gerar arquivo' }))
    await user.keyboard('{Escape}')
    rejeitar(new Error('x'))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})

describe('Exportação personalizada', () => {
  const todos = [
    ...itensDoNivel('operacional', []),
    ...itensDoNivel('tatico', []),
    ...itensDoNivel('sustentacao', []),
  ]

  it('começa vazia, lista nível a nível e separa BusinessMap de Acelerato na prévia', async () => {
    const { gerar, user } = montar('personalizada', todos)
    const dlg = await abrir(user, 'Exportação personalizada')
    expect(
      within(dlg).getByRole('heading', { name: 'Exportação personalizada' }),
    ).toBeInTheDocument()
    for (const nivel of ['Operacional', 'Tático', 'Operacional · Sustentação'])
      expect(within(dlg).getByRole('group', { name: nivel })).toBeInTheDocument()
    expect(within(dlg).getByRole('group', { name: 'Estratégico' })).toHaveTextContent(
      'Nenhuma métrica visível neste nível.',
    )
    expect(
      within(dlg)
        .getAllByRole('checkbox')
        .some((c) => (c as HTMLInputElement).checked),
    ).toBe(false)
    expect(within(dlg).getByRole('button', { name: 'Gerar arquivo' })).toBeDisabled()
    await user.click(within(dlg).getByRole('checkbox', { name: /S1 .*\(Acelerato\)/ }))
    await user.click(within(dlg).getByRole('checkbox', { name: /O3 .*\(BusinessMap\)/ }))
    const previa = within(dlg).getByTestId('exportar-previa')
    expect(previa).toHaveTextContent('metricas-dspd_personalizada_2026-10-10.pdf')
    const itens = within(previa)
      .getAllByRole('listitem')
      .map((l) => l.textContent)
    expect(itens).toEqual(['BusinessMap (1): O3', 'Acelerato (1): S1'])
    await user.click(within(dlg).getByRole('button', { name: 'Gerar arquivo' }))
    const chamada = (gerar.mock.calls as unknown as ItemExportavel[][][])[0]![0]!
    expect(chamada.map((i) => i.metrica)).toEqual(['O3', 'S1'])
  })

  it('no limite de 12, as demais caixas ficam desabilitadas com a explicação', async () => {
    const { user } = montar('personalizada', todos)
    const dlg = await abrir(user, 'Exportação personalizada')
    const caixas = within(dlg).getAllByRole('checkbox')
    for (const c of caixas.slice(0, LIMITE_METRICAS)) await user.click(c)
    expect(within(dlg).getByText(/Limite de 12 métricas por arquivo/)).toBeInTheDocument()
    const livre = caixas[LIMITE_METRICAS]!
    expect(livre).toBeDisabled()
    expect(livre).toHaveAccessibleDescription(/Limite de 12 métricas/)
    await user.click(caixas[0]!)
    expect(livre).toBeEnabled()
    expect(within(dlg).getByText('11 de 12 métricas por arquivo.')).toBeInTheDocument()
  })

  it('o selo de dados fictícios aparece na prévia só com o mock e nome ganha _ficticio', async () => {
    const { user } = montar('operacional', itensDoNivel('operacional', []), { mock: true })
    const dlg = await abrir(user)
    expect(within(dlg).getByTestId('exportar-previa')).toHaveTextContent(
      'Dados fictícios em todas as páginas',
    )
    expect(within(dlg).getByTestId('exportar-previa')).toHaveTextContent('_ficticio.pdf')
  })
})

describe('Visão geral', () => {
  it('não tem escolha: explica o conteúdo e gera direto', async () => {
    const { gerar, user } = montar('visao-geral', [])
    const dlg = await abrir(user)
    expect(within(dlg).getByRole('heading', { name: 'Exportar a Visão geral' })).toBeInTheDocument()
    expect(within(dlg).queryAllByRole('checkbox')).toHaveLength(0)
    expect(within(dlg).getByTestId('exportar-previa')).toHaveTextContent(
      'metricas-dspd_visao-geral_2026-10-10.pdf',
    )
    expect(within(dlg).getByTestId('exportar-previa')).toHaveTextContent(
      'BusinessMap, depois Acelerato',
    )
    await user.click(within(dlg).getByRole('button', { name: 'Gerar arquivo' }))
    expect(gerar).toHaveBeenCalledWith([])
  })
})
