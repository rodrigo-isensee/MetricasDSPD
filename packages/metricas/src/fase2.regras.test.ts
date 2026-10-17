import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { fonteDaMetrica, type MetricaId } from '@metricas-dspd/contratos'
import { REGRAS_METRICA, type RegraMetrica } from './core/regras'

/** Fase 2 do pedido 011 (E1 e E2): regras decididas pelo usuário saem de `pendente-usuario`; o T14 segue com as suas. */
const AQUI = dirname(fileURLToPath(import.meta.url))
const FASE2 = ['T13', 'T14', 'E6', 'E8'] as const satisfies readonly MetricaId[]
const ARQUIVO: Record<(typeof FASE2)[number], string> = {
  T13: 'businessmap/t13.ts',
  T14: 'businessmap/t14.ts',
  E6: 'businessmap/e6.ts',
  E8: 'businessmap/e8.ts',
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

  it('Q-E7-1 (E7) está decidida: a linha não tem pendência e diz a regra', () => {
    expect(REGRAS_METRICA.E7.status).toBe('ok')
    expect((REGRAS_METRICA.E7 as RegraMetrica).pendencias).toBeUndefined()
    expect(REGRAS_METRICA.E7.refBriefing).toMatch(/Q-E7-1/)
    expect(REGRAS_METRICA.E7.refBriefing).toMatch(/pró-rata por dias corridos/)
  })

  it('só o T14 tem pendência com o usuário: cardinalidade do campo e Q-T14-2, 3, 4, 7 e 8; a Q-T14-9 e a Q-T14-10 estão decididas', () => {
    for (const id of FASE2.filter((x) => x !== 'T14'))
      expect(REGRAS_METRICA[id].status, id).toBe('ok')
    const t14: RegraMetrica = REGRAS_METRICA.T14
    expect(t14.status).toBe('pendente-usuario')
    const texto = (t14.pendencias ?? []).join('\n')
    for (const q of ['Q-T14-2', 'Q-T14-3', 'Q-T14-4', 'Q-T14-7', 'Q-T14-8', 'Cardinalidade'])
      expect(texto, q).toContain(q)
    // as decididas (Q-T14-1, 5, 6 e 10) não voltam como pendência
    for (const q of ['Q-T14-1:', 'Q-T14-5:', 'Q-T14-6:', 'Q-T14-9:', 'Q-T14-10:'])
      expect(texto, q).not.toContain(q)
  })

  it('o código das quatro não lê responsaveis nem usuario, e não importa nada do Acelerato', () => {
    for (const id of FASE2) {
      const codigo = readFileSync(join(AQUI, ARQUIVO[id]), 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/.*$/gm, '')
      expect(codigo, id).not.toMatch(/responsaveis|\.usuario|\['usuario'\]|acelerato/i)
    }
  })

  it('nenhuma chave de segmentação nova de pessoa', () => {
    const todas = new Set(
      Object.values(REGRAS_METRICA).flatMap((r) => r.segmentacao as readonly string[]),
    )
    for (const k of todas) expect(k).not.toMatch(/^(pessoa|responsavel|equipe)$/)
  })
})
