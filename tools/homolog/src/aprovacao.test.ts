import { describe, expect, it } from 'vitest'
import { decidirAprovacao, type Api } from './aprovacao.ts'

const SHA = 'a'.repeat(40)

function api(ponta: string | undefined, estados: Record<string, string>): Api {
  return {
    shaDaBranch: () => Promise.resolve(ponta),
    estadoDoContexto: (_sha, contexto) => Promise.resolve(estados[contexto]),
  }
}

const verdes = { 'homolog-portao': 'success', 'homolog-noturna': 'success' }

describe('decidirAprovacao', () => {
  it('aprova a ponta de homolog com portão e noturna verdes', async () => {
    const d = await decidirAprovacao(api(SHA, verdes), {
      shaCandidato: SHA,
      branchOrigem: 'homolog',
    })
    expect(d.aprovada).toBe(true)
  })
  it('recusa origem que não é homolog', async () => {
    const d = await decidirAprovacao(api(SHA, verdes), {
      shaCandidato: SHA,
      branchOrigem: 'develop',
    })
    expect(d).toEqual({ aprovada: false, motivo: 'a main só recebe de homolog (origem: develop)' })
  })
  it('deixa o hotfix passar com aviso (a aprovação é do usuário)', async () => {
    const d = await decidirAprovacao(api(undefined, {}), {
      shaCandidato: SHA,
      branchOrigem: 'hotfix/x',
    })
    expect(d.aprovada).toBe(true)
    expect(d.motivo).toContain('hotfix')
  })
  it('recusa quando homolog não existe', async () => {
    const d = await decidirAprovacao(api(undefined, verdes), {
      shaCandidato: SHA,
      branchOrigem: 'homolog',
    })
    expect(d.motivo).toBe('a branch homolog não existe')
  })
  it('recusa candidato que não é a ponta', async () => {
    const d = await decidirAprovacao(api('b'.repeat(40), verdes), {
      shaCandidato: SHA,
      branchOrigem: 'homolog',
    })
    expect(d.aprovada).toBe(false)
    expect(d.motivo).toContain('não é a ponta de homolog')
  })
  it('recusa portão ausente ou vermelho', async () => {
    const d = await decidirAprovacao(api(SHA, { 'homolog-noturna': 'success' }), {
      shaCandidato: SHA,
      branchOrigem: 'homolog',
    })
    expect(d.motivo).toContain('portão de homolog sem sucesso')
    expect(d.motivo).toContain('ausente')
  })
  it('recusa noturna pendente ou falha', async () => {
    const d = await decidirAprovacao(api(SHA, { ...verdes, 'homolog-noturna': 'failure' }), {
      shaCandidato: SHA,
      branchOrigem: 'homolog',
    })
    expect(d.motivo).toContain('rodada noturna sem sucesso')
    expect(d.motivo).toContain('failure')
  })
})
