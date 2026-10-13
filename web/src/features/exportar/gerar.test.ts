import { QueryClient } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import { MockFonteMetricas } from '@/data'
import { gerarArquivo } from './gerar'
import { itensDoNivel } from './selecao'

const fonte = new MockFonteMetricas({ latenciaMs: 0 })
const base = () => ({
  fonte,
  clienteQuery: new QueryClient(),
  pathname: '/operacional',
  params: new URLSearchParams(),
  memoria: {},
  agora: new Date('2026-10-10T15:30:00Z'),
})

describe('gerarArquivo (cache novo: lê tudo pela fonte)', () => {
  it('Visão geral: busca o DTO, os critérios e a data de referência', async () => {
    const r = await gerarArquivo({ ...base(), base: 'visao-geral', itens: [] })
    expect(r.nome).toBe('metricas-dspd_visao-geral_2026-10-10_ficticio.pdf')
    expect(r.blob.type).toBe('application/pdf')
  })

  it('não repete a mesma métrica com os mesmos filtros (EI-FL1 duas vezes na seleção)', async () => {
    const ei = itensDoNivel('operacional', []).filter((i) => i.metrica === 'EI_FL1')
    const itens = [...ei, ...ei]
    expect(itens).toHaveLength(2)
    const r = await gerarArquivo({ ...base(), base: 'personalizada', itens })
    const t = await r.blob.text()
    // O título do bloco é "EI-FL1 · Espera invisível" (o índice da seção não tem o separador).
    expect(t.match(/\(EI-FL1 \S+ Espera/g)).toHaveLength(1)
    expect(r.nome).toContain('_personalizada_')
  })

  it('a espera invisível sai pelo painel do nível: a da Sustentação só com Acelerato e filtros dela', async () => {
    const r = await gerarArquivo({
      ...base(),
      pathname: '/sustentacao',
      params: new URLSearchParams('periodo=12m'),
      base: 'sustentacao',
      itens: itensDoNivel('sustentacao', []).filter((i) => i.metrica === 'EI_SUST'),
    })
    const t = await r.blob.text()
    expect(t).toContain('(Fonte: Acelerato)')
    expect(t).not.toContain('(Fonte: BusinessMap)')
    expect(t).toContain('12 meses')
  })
})
