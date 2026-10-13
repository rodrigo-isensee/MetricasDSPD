import { describe, expect, it } from 'vitest'
import { destinoDaEsperaInvisivel } from './RedirecionaEsperaInvisivel'
import { renderizarApp } from '@/test/helpers'
import { waitFor } from '@testing-library/react'

describe('/espera-invisivel: só redireciona, por hash e preservando os filtros', () => {
  it.each([
    ['#ei-fl1', '?periodo=4s&equipe=x', '/operacional?periodo=4s&equipe=x&cadencia=semanal#ei-fl1'],
    ['#ei-fl2', '?periodo=4s&equipe=x&ei_fl2=a', '/tatico?periodo=4s&equipe=x&ei_fl2=a#ei-fl2'],
    ['#ei-fl3', '?periodo=6m', '/estrategico?periodo=6m#ei-fl3'],
    ['#ei-fl3', '', '/estrategico#ei-fl3'],
    ['#EI-FL1', '?periodo=4s', '/operacional?periodo=4s&cadencia=semanal#ei-fl1'],
    ['#Ei-Sust', '', '/sustentacao#ei-sust'],
    [
      '#ei-sust',
      '?periodo=4s&equipe=x&sust_prioridade=P1&sust_periodo=12m&ei_sust=p1',
      '/sustentacao?prioridade=P1&periodo=12m&ei_sust=p1#ei-sust',
    ],
    ['#ei-sust', '?periodo=4s', '/sustentacao#ei-sust'],
    ['', '?periodo=4s', '/'],
    ['#desconhecido', '', '/'],
  ])('%s %s -> %s', (hash, busca, destino) => {
    expect(destinoDaEsperaInvisivel(hash, busca)).toBe(destino)
  })

  it('no navegador: chega ao painel com `replace` (Voltar não cai em /espera-invisivel)', async () => {
    const { roteador } = renderizarApp('/espera-invisivel?periodo=4s&equipe=fluig#ei-fl2')
    await waitFor(() => expect(roteador.state.location.pathname).toBe('/tatico'))
    expect(roteador.state.location.hash).toBe('#ei-fl2')
    expect(roteador.state.location.search).toContain('periodo=4s')
    expect(roteador.state.historyAction).toBe('REPLACE')
  })

  it('sem hash vai para a Visão geral', async () => {
    const { roteador } = renderizarApp('/espera-invisivel?periodo=4s')
    await waitFor(() => expect(roteador.state.location.pathname).toBe('/'))
  })
})
