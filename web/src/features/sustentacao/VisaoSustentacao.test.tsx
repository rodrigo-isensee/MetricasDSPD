import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { FiltrosSustentacao } from '@metricas-dspd/contratos'
import { fonteDeTeste, renderizarCartao } from '@/test/helpers'
import VisaoSustentacao from './VisaoSustentacao'

const FILTROS: FiltrosSustentacao = {
  equipe: [],
  prioridade: [],
  periodo: { tipo: '12s' },
}

const TEXTO_DE_HOJE = 'equipes SSSC TOTVS, SENIOR e FLUIG, excluídos os removidos'

function fonteComEquipes(nomes: string[] | 'erro') {
  return Object.create(fonteDeTeste, {
    opcoesFiltro: {
      value: async (dominio: string) => {
        if (nomes === 'erro') throw new Error('falha')
        const base = await fonteDeTeste.opcoesFiltro(dominio as 'acelerato')
        return { ...base, equipes: nomes.map((nome) => ({ id: nome.toLowerCase(), nome })) }
      },
    },
  }) as typeof fonteDeTeste
}

describe('texto do recorte da Sustentação (K-215)', () => {
  it('com o recorte na resposta, mostra as equipes devolvidas pela API', async () => {
    renderizarCartao(<VisaoSustentacao filtros={FILTROS} />, {
      fonte: fonteComEquipes(['SSSC TOTVS', 'SSSC SENIOR', 'SSSC FLUIG', 'SSSC NOVA']),
    })
    const recorte = await screen.findByTestId('recorte-sustentacao', undefined, { timeout: 8000 })
    await waitFor(() =>
      expect(recorte).toHaveTextContent('equipes SSSC TOTVS, SENIOR, FLUIG e NOVA, excluídos'),
    )
  })

  it('equipe de outra marca aparece com o nome inteiro; equipe única, sozinha', async () => {
    const r = renderizarCartao(<VisaoSustentacao filtros={FILTROS} />, {
      fonte: fonteComEquipes(['SSSC TOTVS', 'Outra Equipe']),
    })
    const recorte = await screen.findByTestId('recorte-sustentacao', undefined, { timeout: 8000 })
    await waitFor(() =>
      expect(recorte).toHaveTextContent('equipes SSSC TOTVS e Outra Equipe, excluídos'),
    )
    r.unmount()
    renderizarCartao(<VisaoSustentacao filtros={FILTROS} />, {
      fonte: fonteComEquipes(['SSSC TOTVS']),
    })
    const unico = await screen.findByTestId('recorte-sustentacao', undefined, { timeout: 8000 })
    await waitFor(() => expect(unico).toHaveTextContent('equipes SSSC TOTVS, excluídos'))
  })

  it('sem recorte na resposta (lista vazia), mantém o texto de hoje', async () => {
    renderizarCartao(<VisaoSustentacao filtros={FILTROS} />, { fonte: fonteComEquipes([]) })
    const recorte = await screen.findByTestId('recorte-sustentacao', undefined, { timeout: 8000 })
    expect(recorte).toHaveTextContent('Chamados da organização DSPD Sustentação, tipo DSPD - SSSC')
    expect(recorte).toHaveTextContent(TEXTO_DE_HOJE)
  })

  it('com a leitura em erro, mantém o texto de hoje', async () => {
    renderizarCartao(<VisaoSustentacao filtros={FILTROS} />, { fonte: fonteComEquipes('erro') })
    const recorte = await screen.findByTestId('recorte-sustentacao', undefined, { timeout: 8000 })
    expect(recorte).toHaveTextContent(TEXTO_DE_HOJE)
  })
})
