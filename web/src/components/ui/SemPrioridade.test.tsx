import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SemPrioridade } from './SemPrioridade'

describe('SemPrioridade', () => {
  it('com n = 0 diz só que não há cartão sem prioridade, sem frase fixa nem complemento', () => {
    render(
      <SemPrioridade
        n={0}
        total={40}
        universo="entregues"
        codigo="t4"
        complemento="A chegada é maior."
      />,
    )
    const faixa = screen.getByTestId('sem-prioridade-t4')
    expect(faixa).toHaveTextContent('nenhum cartão sem prioridade neste recorte')
    expect(faixa).not.toHaveTextContent('trabalhados normalmente')
    expect(faixa).not.toHaveTextContent('A chegada é maior.')
    expect(faixa).not.toHaveTextContent('de 40')
  })

  it('com n > 0 mantém contagem, frase fixa e complemento', () => {
    render(
      <SemPrioridade
        n={5}
        total={40}
        universo="entregues"
        codigo="t4"
        complemento="A chegada é maior."
      />,
    )
    const faixa = screen.getByTestId('sem-prioridade-t4')
    expect(faixa).toHaveTextContent('5 de 40 entregues')
    expect(faixa).toHaveTextContent('Esses cartões foram trabalhados normalmente')
    expect(faixa).toHaveTextContent('A chegada é maior.')
  })
})
