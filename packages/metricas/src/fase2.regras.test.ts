import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { fonteDaMetrica, type MetricaId } from '@metricas-dspd/contratos'
import { REGRAS_METRICA, type RegraMetrica } from './core/regras'

/** Fase 2 do pedido 011 (E1): regras decididas pelo usuário saem de `pendente-usuario` (Q-a, Q-b e Q-E7-1). */
const AQUI = dirname(fileURLToPath(import.meta.url))
const FASE2 = ['O22', 'O26', 'T13', 'E6'] as const satisfies readonly MetricaId[]
const ARQUIVO: Record<(typeof FASE2)[number], string> = {
  O22: 'businessmap/o22.ts',
  O26: 'businessmap/o26.ts',
  T13: 'businessmap/t13.ts',
  E6: 'businessmap/e6.ts',
}

describe('regras da fase 2 (REGRAS_METRICA)', () => {
  it('as quatro são BusinessMap, sem segmentação por pessoa nem por equipe', () => {
    for (const id of FASE2) {
      expect(fonteDaMetrica(id), id).toBe('businessmap')
      expect(REGRAS_METRICA[id].dominio, id).toBe('businessmap')
      for (const k of REGRAS_METRICA[id].segmentacao)
        expect(k, id).not.toMatch(/pessoa|responsavel|equipe/)
    }
  })

  it('Q-a, Q-b (O26) e Q-E7-1 (E7) estão decididas: as linhas não têm pendência e dizem a regra', () => {
    for (const id of ['O26', 'E7'] as const) {
      expect(REGRAS_METRICA[id].status, id).toBe('ok')
      expect((REGRAS_METRICA[id] as RegraMetrica).pendencias, id).toBeUndefined()
    }
    expect(REGRAS_METRICA.O26.refBriefing).toMatch(/Q-a = 1 passagem/)
    expect(REGRAS_METRICA.O26.refBriefing).toMatch(/Q-b = conta/)
    expect(REGRAS_METRICA.E7.refBriefing).toMatch(/Q-E7-1/)
    expect(REGRAS_METRICA.E7.refBriefing).toMatch(/pró-rata por dias corridos/)
    expect(REGRAS_METRICA.O26.segmentacao).toEqual(['tipo', 'faixa-passagens'])
  })

  it('as quatro do E1 não têm pendência com o usuário', () => {
    for (const id of FASE2) expect(REGRAS_METRICA[id].status, id).toBe('ok')
  })

  it('o código das quatro não lê responsaveis nem usuario, e não importa nada do Acelerato', () => {
    for (const id of FASE2) {
      const codigo = readFileSync(join(AQUI, ARQUIVO[id]), 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/.*$/gm, '')
      expect(codigo, id).not.toMatch(/responsaveis|\.usuario|\['usuario'\]|acelerato/i)
    }
  })

  it('nenhuma chave de segmentação nova de pessoa: a única nova é faixa-passagens', () => {
    const todas = new Set(
      Object.values(REGRAS_METRICA).flatMap((r) => r.segmentacao as readonly string[]),
    )
    expect(todas.has('faixa-passagens')).toBe(true)
    for (const k of todas) expect(k).not.toMatch(/^(pessoa|responsavel|equipe)$/)
  })
})
