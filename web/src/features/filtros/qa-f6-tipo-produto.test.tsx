import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderizarBarra } from '@/test/helpers'

// QA da F6 (E2.75), obrigação "tipo Trabalho de produto no filtro" (ADR 0024): a opção existe na barra do operacional
// e vale na URL. Quebra se o rótulo sair de TIPOS_FILTRO ou do TIPO_ID.
const busca = (r: { roteador: { state: { location: { search: string } } } }) =>
  new URLSearchParams(r.roteador.state.location.search)

describe('QA F6: filtro por tipo com Trabalho de produto', () => {
  it('a opção aparece no filtro de tipo e marcá-la grava trabalho-produto na URL', async () => {
    const r = renderizarBarra('/operacional')
    await userEvent.click(await screen.findByTestId('filtro-tipo'))
    await userEvent.click(await screen.findByLabelText('Trabalho de produto'))
    expect(busca(r).get('tipo')).toBe('trabalho-produto')
  })

  it('o link com tipo=trabalho-produto abre o filtro já aplicado, sem aviso de valor inválido', async () => {
    renderizarBarra('/operacional?tipo=trabalho-produto')
    expect(
      await screen.findByRole('button', {
        name: 'Remover filtro Tipo de demanda: Trabalho de produto',
      }),
    ).toBeInTheDocument()
  })
})
