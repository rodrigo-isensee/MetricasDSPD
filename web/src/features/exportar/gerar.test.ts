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

  it('não repete a mesma métrica com os mesmos filtros (EI-FL1 no Operacional e na Espera invisível)', async () => {
    const itens = [
      ...itensDoNivel('operacional', []).filter((i) => i.metrica === 'EI_FL1'),
      ...itensDoNivel('espera-invisivel', []).filter((i) => i.metrica === 'EI_FL1'),
    ]
    expect(itens).toHaveLength(2)
    const r = await gerarArquivo({ ...base(), base: 'personalizada', itens })
    const t = await r.blob.text()
    // O título do bloco é "EI-FL1 · Espera invisível" (o índice da seção não tem o separador).
    expect(t.match(/\(EI-FL1 \S+ Espera/g)).toHaveLength(1)
    expect(r.nome).toContain('_personalizada_')
  })

  it('a Espera invisível leva as quatro métricas, cada uma com os filtros do seu domínio', async () => {
    const r = await gerarArquivo({
      ...base(),
      pathname: '/espera-invisivel',
      params: new URLSearchParams('sust_periodo=12m&periodo=4s'),
      base: 'espera-invisivel',
      itens: itensDoNivel('espera-invisivel', []),
    })
    const t = await r.blob.text()
    expect(t).toContain('(Fonte: Acelerato)')
    expect(t).toContain('12 meses')
    expect(t).toContain('4 semanas')
  })
})
