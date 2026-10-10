import { describe, expect, it } from 'vitest'
import { METRICA_IDS } from '@metricas-dspd/contratos'
import { METRICAS_SUSTENTACAO } from '@metricas-dspd/contratos'
import { SCHEMAS_RESULTADO } from '@metricas-dspd/contratos/validacao'
import type { FiltrosFluxo, FiltrosSustentacao } from '@metricas-dspd/contratos'
import { ehVazio } from '../vazio'
import { aplicarSimulacao, ErroSimulado, lerModoMock } from '../simulacao'
import { MockFonteMetricas } from './MockFonteMetricas'

/** Latência 0: os testes não esperam o atraso simulado (D7). */
const fonte = new MockFonteMetricas({ latenciaMs: 0 })
const fluxo = (p: FiltrosFluxo['periodo']): FiltrosFluxo => ({
  equipe: [],
  tipo: [],
  sistema: [],
  periodo: p,
})
const sust = (p: FiltrosSustentacao['periodo']): FiltrosSustentacao => ({
  equipe: [],
  prioridade: [],
  periodo: p,
})

describe('MockFonteMetricas', () => {
  it('toda métrica devolve um DTO válido pelo schema zod, com filtros padrão e com filtros estreitos', async () => {
    for (const id of METRICA_IDS) {
      const s = METRICAS_SUSTENTACAO.includes(id)
      const filtros = [
        s ? sust({ tipo: '6m' }) : fluxo({ tipo: '12s' }),
        s
          ? { ...sust({ tipo: '4s' }), equipe: ['fluig' as const], prioridade: ['P2' as const] }
          : { ...fluxo({ tipo: '12m' }), equipe: ['fluig'], tipo: ['Melhoria' as const] },
        s
          ? sust({ tipo: 'custom', de: '2026-01-01', ate: '2026-03-31' })
          : fluxo({ tipo: 'custom', de: '2026-01-01', ate: '2026-03-31' }),
      ]
      for (const f of filtros) {
        const r = await fonte.obter(id, id === 'VISAO_GERAL' ? {} : f)
        const p = SCHEMAS_RESULTADO[id].safeParse(r)
        expect(
          p.success,
          `${id}: ${p.success ? '' : JSON.stringify(p.error.issues.slice(0, 2))}`,
        ).toBe(true)
      }
    }
  }, 60_000)

  it('é determinística: dois cálculos iguais dão o mesmo resultado; outra semente muda os números (critério 80)', async () => {
    const f = fluxo({ tipo: '12s' })
    expect(await fonte.obter('O4', f)).toEqual(
      await new MockFonteMetricas({ latenciaMs: 0 }).obter('O4', f),
    )
    const outra = await new MockFonteMetricas({ semente: 12345, latenciaMs: 0 }).obter('O4', f)
    expect(outra).not.toEqual(await fonte.obter('O4', f))
  })

  it('opções de filtro: equipes do fluxo e da sustentação são conjuntos distintos; sem filtro por agente', async () => {
    const bm = await fonte.opcoesFiltro('businessmap')
    const ac = await fonte.opcoesFiltro('acelerato')
    expect(bm.equipes.length).toBeGreaterThanOrEqual(6)
    expect(ac.equipes.map((e) => e.nome)).toEqual(['SSSC TOTVS', 'SSSC SENIOR', 'SSSC FLUIG'])
    expect(ac.prioridades.map((p) => p.nome)).toEqual(['P1', 'P2', 'P3', 'P4', 'P5'])
    expect(await fonte.dataReferencia()).toBe('2026-10-09')
    expect((await fonte.criterios()).length).toBeGreaterThanOrEqual(2)
  })

  it('nenhum DTO expõe pessoa (responsaveis, usuario, agente)', async () => {
    const texto = JSON.stringify(
      await Promise.all(
        METRICA_IDS.map((id) =>
          fonte.obter(
            id,
            (id === 'VISAO_GERAL'
              ? {}
              : METRICAS_SUSTENTACAO.includes(id)
                ? sust({ tipo: '6m' })
                : fluxo({ tipo: '12s' })) as never,
          ),
        ),
      ),
    )
    expect(texto).not.toMatch(/Pessoa \d|responsaveis|usuario|agente/)
  }, 60_000)
})

describe('parâmetro oculto ?mock=', () => {
  it('interpreta os modos', () => {
    expect(lerModoMock('carregando')).toBe('carregando')
    expect(lerModoMock('ERRO:O3')).toBe('erro:o3')
    expect(lerModoMock('xpto')).toBeNull()
    expect(lerModoMock(null)).toBeNull()
  })
  it('erro simulado: geral e por cartão', async () => {
    const ok = () => Promise.resolve(1)
    await expect(aplicarSimulacao('erro', 'O3', {}, ok)).rejects.toBeInstanceOf(ErroSimulado)
    await expect(aplicarSimulacao('erro:o3', 'O3', {}, ok)).rejects.toBeInstanceOf(ErroSimulado)
    await expect(aplicarSimulacao('erro:o3', 'O4', {}, ok)).resolves.toBe(1)
  })
  it('vazio força o resultado sem itens em todas as métricas (O1 mantém os dias úteis como base)', async () => {
    for (const id of METRICA_IDS.filter((i) => i !== 'VISAO_GERAL')) {
      const f = METRICAS_SUSTENTACAO.includes(id) ? sust({ tipo: '6m' }) : fluxo({ tipo: '12s' })
      const r = await aplicarSimulacao('vazio', id, f, (x) => fonte.obter(id, x as never))
      expect(ehVazio(id, r), id).toBe(true)
      if (id !== 'O1') expect((r as { base: { n: number } }).base.n, id).toBe(0)
    }
  }, 60_000)
})
