import { describe, expect, it } from 'vitest'
import {
  METRICA_IDS,
  fonteDaMetrica,
  MINIMO_AMOSTRA,
  type MetricaId,
} from '@metricas-dspd/contratos'
import { SCHEMAS_RESULTADO } from '@metricas-dspd/contratos/validacao'
import {
  acelerato,
  businessmap,
  calcularMetrica,
  CALENDARIO_PADRAO,
  pesquisa,
} from '@metricas-dspd/metricas'
import { gerarBaseMock, gerarExtensoesMock, gerarPesquisaMock } from '.'

/**
 * Teste sistêmico entre pacotes: gerador (mock) -> contexto -> `calcularMetrica` (metricas) ->
 * schema do contrato (contratos), para as 58 métricas.
 */
const base = gerarBaseMock({ escala: 0.5 })
const ctx = {
  bm: businessmap.criarContextoBM(base.bm, base.config.hoje, CALENDARIO_PADRAO),
  ac: acelerato.criarContextoAC(base.ac, base.config.hoje, CALENDARIO_PADRAO),
  ext: gerarExtensoesMock(base),
  pesq: pesquisa.criarContextoPesquisa(gerarPesquisaMock(base.config), base.config.hoje),
}
const filtrosPadrao = (id: MetricaId) =>
  id === 'VISAO_GERAL' || fonteDaMetrica(id) === 'pesquisa'
    ? {}
    : fonteDaMetrica(id) === 'acelerato'
      ? { equipe: [], prioridade: [], periodo: { tipo: '12m' } }
      : { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12m' } }

/** Percorre o resultado e devolve os `n` de toda estatística/taxa com status "ok". */
function amostrasPublicadas(x: unknown, acumulado: number[] = []): number[] {
  if (Array.isArray(x)) x.forEach((v) => amostrasPublicadas(v, acumulado))
  else if (x && typeof x === 'object') {
    const o = x as Record<string, unknown>
    if (o.status === 'ok' && typeof o.n === 'number') acumulado.push(o.n)
    Object.values(o).forEach((v) => amostrasPublicadas(v, acumulado))
  }
  return acumulado
}

describe('gerador -> métricas -> contrato (58 métricas)', () => {
  it('cobre exatamente as 58 métricas do catálogo', () => {
    expect(METRICA_IDS).toHaveLength(58)
    expect(Object.keys(SCHEMAS_RESULTADO)).toHaveLength(58)
  })

  it.each(METRICA_IDS)('%s: o resultado calculado sobre a base gerada obedece ao schema', (id) => {
    const resultado = calcularMetrica(id, filtrosPadrao(id) as never, ctx)
    const r = SCHEMAS_RESULTADO[id].safeParse(resultado)
    expect(r.success, r.success ? '' : r.error.message.slice(0, 400)).toBe(true)
  })

  it.each(METRICA_IDS)('%s: nenhuma estatística é publicada com menos de 20 itens', (id) => {
    const resultado = calcularMetrica(id, filtrosPadrao(id) as never, ctx)
    for (const n of amostrasPublicadas(resultado)) expect(n).toBeGreaterThanOrEqual(MINIMO_AMOSTRA)
  })

  it('o resultado é determinístico e não depende do contexto ser recriado', () => {
    const outro = {
      bm: businessmap.criarContextoBM(base.bm, base.config.hoje, CALENDARIO_PADRAO),
      ac: acelerato.criarContextoAC(base.ac, base.config.hoje, CALENDARIO_PADRAO),
      ext: gerarExtensoesMock(base),
      pesq: pesquisa.criarContextoPesquisa(gerarPesquisaMock(base.config), base.config.hoje),
    }
    for (const id of METRICA_IDS) {
      const f = filtrosPadrao(id) as never
      expect(calcularMetrica(id, f, outro)).toEqual(calcularMetrica(id, f, ctx))
    }
  })

  it('rejeita um resultado adulterado: ok com n abaixo de 20 não passa no contrato', () => {
    const o3 = calcularMetrica('O3', filtrosPadrao('O3') as never, ctx) as unknown as {
      classes: { estatistica: { status: string; n: number } }[]
    }
    const adulterado = structuredClone(o3)
    const alvo = adulterado.classes.find((c) => c.estatistica.status === 'ok')
    expect(alvo).toBeDefined()
    expect(SCHEMAS_RESULTADO.O3.safeParse(o3).success).toBe(true)
    ;(alvo as { estatistica: { n: number } }).estatistica.n = MINIMO_AMOSTRA - 1
    expect(SCHEMAS_RESULTADO.O3.safeParse(adulterado).success).toBe(false)
  })
})
