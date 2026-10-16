import { describe, expect, it } from 'vitest'
import { destinoDaEsperaInvisivel } from './RedirecionaEsperaInvisivel'
import { destinoDaSustentacao } from './RedirecionaSustentacao'
import { renderizarApp } from '@/test/helpers'
import { waitFor } from '@testing-library/react'

describe('/espera-invisivel: só redireciona, por hash e preservando os filtros', () => {
  it.each([
    ['#ei-fl1', '?periodo=4s&equipe=x', '/operacional?periodo=4s&equipe=x&cadencia=semanal#ei-fl1'],
    ['#ei-fl2', '?periodo=4s&equipe=x&ei_fl2=a', '/tatico?periodo=4s&equipe=x&ei_fl2=a#ei-fl2'],
    ['#ei-fl3', '?periodo=6m', '/estrategico?periodo=6m#ei-fl3'],
    ['#ei-fl3', '', '/estrategico#ei-fl3'],
    ['#EI-FL1', '?periodo=4s', '/operacional?periodo=4s&cadencia=semanal#ei-fl1'],
    ['#Ei-Sust', '', '/operacional?cadencia=sustentacao#ei-sust'],
    [
      '#ei-sust',
      '?periodo=4s&equipe=x&sust_prioridade=P1&sust_periodo=12m&ei_sust=p1',
      '/operacional?cadencia=sustentacao&sust_prioridade=P1&sust_periodo=12m&ei_sust=p1#ei-sust',
    ],
    ['#ei-sust', '?periodo=4s', '/operacional?cadencia=sustentacao#ei-sust'],
    [
      '#ei-sust',
      '?sust_prioridade=P2&equipe=X&mock=vazio',
      '/operacional?cadencia=sustentacao&sust_prioridade=P2&mock=vazio#ei-sust',
    ],
    ['#ei-fl1', '?mock=vazio', '/operacional?mock=vazio&cadencia=semanal#ei-fl1'],
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

describe('/sustentacao: só redireciona para a visão Sustentação do Operacional (4.3)', () => {
  it.each([
    ['', '', '/operacional?cadencia=sustentacao'],
    [
      '?prioridade=P1&periodo=12m&equipe=Y&tipo=Bug',
      '#s2',
      '/operacional?cadencia=sustentacao&sust_prioridade=P1&sust_periodo=12m&sust_equipe=Y#s2',
    ],
    [
      '?periodo=custom&de=2026-01-01&ate=2026-03-01',
      '',
      '/operacional?cadencia=sustentacao&sust_periodo=custom&sust_de=2026-01-01&sust_ate=2026-03-01',
    ],
    [
      '?s3=prop&s4=a&s5=b&s6=c&ei_sust=x&mock=vazio',
      '',
      '/operacional?cadencia=sustentacao&s3=prop&s4=a&s5=b&s6=c&ei_sust=x&mock=vazio',
    ],
    [
      '?sust_prioridade=P3&sust_equipe=totvs',
      '',
      '/operacional?cadencia=sustentacao&sust_prioridade=P3&sust_equipe=totvs',
    ],
    [
      '?sust_prioridade=P3&prioridade=P1',
      '',
      '/operacional?cadencia=sustentacao&sust_prioridade=P3',
    ],
    ['?tipo=Bug&sistema=x&cadencia=semanal&o3=a', '', '/operacional?cadencia=sustentacao'],
    ['', '#compl-por-que-demora', '/operacional?cadencia=sustentacao#compl-sust-por-que-demora'],
    ['', '#compl-o-que-entra', '/operacional?cadencia=sustentacao#compl-sust-o-que-entra'],
    ['', '#COMPL-QUALIDADE', '/operacional?cadencia=sustentacao#compl-sust-qualidade'],
    ['', '#ei-sust', '/operacional?cadencia=sustentacao#ei-sust'],
    ['', '#mais-metricas', '/operacional?cadencia=sustentacao#mais-metricas'],
    ['', '#pv1', '/operacional?cadencia=sustentacao#pv1'],
  ])('%s %s -> %s', (busca, hash, destino) => {
    expect(destinoDaSustentacao(busca, hash)).toBe(destino)
  })

  it('nenhum valor da URL vira caminho (sem redirecionamento aberto)', () => {
    const d = destinoDaSustentacao('?next=//evil.example&prioridade=//evil.example', '#//evil')
    expect(d.startsWith('/operacional?')).toBe(true)
    expect(d).not.toContain('evil.example/')
  })

  it('no navegador: termina no Operacional por replace, o histórico é substituído', async () => {
    const { roteador } = renderizarApp(
      '/sustentacao?prioridade=P1&periodo=12m&equipe=totvs&tipo=Bug#s2',
    )
    await waitFor(() => expect(roteador.state.location.pathname).toBe('/operacional'))
    const p = new URLSearchParams(roteador.state.location.search)
    expect(p.get('cadencia')).toBe('sustentacao')
    expect(p.get('sust_prioridade')?.toLowerCase()).toBe('p1')
    expect(p.get('sust_periodo')).toBe('12m')
    expect(p.get('sust_equipe')).toBe('totvs')
    expect(p.has('tipo')).toBe(false)
    expect(roteador.state.location.hash).toBe('#s2')
    expect(roteador.state.historyAction).toBe('REPLACE')
  })
})
