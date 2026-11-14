import { QueryClient } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import { corpoSemDadoReal, origemDaMetrica, type MetricaId } from '@metricas-dspd/contratos'
import { SemDadoRealErro } from '@/data'
import { MockFonteMetricas } from '@/data/mock/MockFonteMetricas'
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
      pathname: '/operacional',
      params: new URLSearchParams('sust_periodo=12m&periodo=4s'),
      base: 'sustentacao',
      itens: itensDoNivel('sustentacao', []).filter((i) => i.metrica === 'EI_SUST'),
    })
    const t = await r.blob.text()
    expect(t).toContain('(Fonte: Acelerato)')
    expect(t).not.toContain('(Fonte: BusinessMap)')
    expect(t).toContain('12 meses')
  })
})

describe('gerarArquivo: contexto da fonte por cartão (P-4)', () => {
  const evento = {
    id: 'c1',
    inicio: '2026-10-31T09:00:00Z',
    fim: '2026-10-31T09:05:00Z',
    duracaoMs: 300000,
    resultado: 'ok' as const,
    tipoErro: null,
    efeito: 'aplicada' as const,
    contagens: null,
  }
  /** Fonte da API real com o painel misto: o estado de coleta é fixo e O3 está em calibração. */
  const fonteApi = (estadoOk = true) =>
    Object.create(fonte, {
      tipo: { value: 'api' },
      // Como a API (pedido 060, P3): métrica fora do mapa real responde "sem dado real", sem resultado.
      obter: {
        value: (id: MetricaId, ...resto: unknown[]) => {
          if (origemDaMetrica(id) === 'sem-dado') {
            const c = corpoSemDadoReal(id)
            return Promise.reject(new SemDadoRealErro(c.metrica, c.motivo))
          }
          return (fonte.obter as (...a: unknown[]) => Promise<unknown>)(id, ...resto)
        },
      },
      estadoColeta: {
        value: (dominio: 'businessmap' | 'acelerato') =>
          estadoOk
            ? Promise.resolve({
                dominio,
                selo: 'atual',
                horasDesdeUltimaOk: 1,
                ultimaOk: evento,
                ultimaTentativa: evento,
                proximaPrevista: '2026-11-01T09:00:00Z',
                falhasRecentes: [],
                calibracao: [],
                metricasEmCalibracao: ['O3'],
              })
            : Promise.reject(new Error('falhou')),
      },
    }) as typeof fonte

  const itens = (...ids: string[]) =>
    itensDoNivel('operacional', []).filter((i) => ids.includes(i.metrica))

  it('O3 (real, em calibração) sai com a situação e O12 sai como "sem dado real" com o motivo, sem número', async () => {
    const r = await gerarArquivo({
      ...base(),
      fonte: fonteApi(),
      base: 'personalizada',
      itens: itens('O3', 'O12'),
    })
    const t = await r.blob.text()
    expect(t.match(/Em calibra\S+o: sim \S Dados fict\S+cios: n\S+o/g)).toHaveLength(1)
    expect(t).not.toMatch(/Dados fict\S+cios: sim/)
    expect(t.match(/Sem dado real/g)).toHaveLength(1)
    expect(t).toContain('Motivo: aguardando campo no quadro')
    expect(t).toContain('Frescor: Atual')
    expect(t).toMatch(/Atualizado em \d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/)
    expect(r.nome).not.toContain('_ficticio')
  })

  it('Visão geral sem dado real: duas partes, BusinessMap e Acelerato, cada uma com o motivo, sem total geral', async () => {
    const r = await gerarArquivo({ ...base(), fonte: fonteApi(), base: 'visao-geral', itens: [] })
    const t = await r.blob.text()
    expect(t.match(/Sem dado real/g)).toHaveLength(2)
    expect(t).toContain('(Fonte: BusinessMap)')
    expect(t).toContain('(Fonte: Acelerato)')
    expect(t).toContain('Motivo: fonte real ainda n')
    expect(r.nome).not.toContain('_ficticio')
  })

  it('erro que não é "sem dado real" não vira bloco: a geração falha', async () => {
    const quebrada = Object.create(fonte, {
      obter: { value: () => Promise.reject(new Error('rede')) },
    }) as typeof fonte
    await expect(
      gerarArquivo({ ...base(), fonte: quebrada, base: 'visao-geral', itens: [] }),
    ).rejects.toThrow('rede')
    await expect(
      gerarArquivo({ ...base(), fonte: quebrada, base: 'personalizada', itens: itens('O3') }),
    ).rejects.toThrow('rede')
  })

  it('se o estado de coleta falhar, o arquivo sai e diz que a atualização está indisponível', async () => {
    const r = await gerarArquivo({
      ...base(),
      fonte: fonteApi(false),
      base: 'personalizada',
      itens: itens('O3'),
    })
    const t = await r.blob.text()
    expect(t).toContain('Atualiza')
    expect(t).toContain('indispon')
  })

  it('com a fonte mock todo cartão sai como dados fictícios', async () => {
    const r = await gerarArquivo({ ...base(), base: 'personalizada', itens: itens('O3') })
    expect(await r.blob.text()).toMatch(/Dados fict\S+cios: sim/)
  })
})
