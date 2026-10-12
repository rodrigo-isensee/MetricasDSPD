import { describe, expect, it } from 'vitest'
import { criarApi, type Obter } from './github.ts'

function simulado(respostas: Record<string, unknown>): { obter: Obter; chamadas: string[] } {
  const chamadas: string[] = []
  return {
    chamadas,
    obter: (caminho) => {
      chamadas.push(caminho)
      return Promise.resolve(respostas[caminho])
    },
  }
}

const corrida = (id: number, event: string, extra: object = {}): object => ({
  id,
  event,
  head_branch: 'homolog',
  head_sha: 'a'.repeat(40),
  path: '.github/workflows/homolog.yml',
  ...extra,
})

describe('criarApi', () => {
  it('shaDaBranch lê o sha da ponta, ou undefined', async () => {
    const { obter } = simulado({ 'commits/homolog': { sha: 'abc' } })
    expect(await criarApi(obter).shaDaBranch('homolog')).toBe('abc')
    expect(await criarApi(obter).shaDaBranch('nao-existe')).toBeUndefined()
  })
  it('execucoes junta as do SHA e as agendadas, normaliza e filtra pelo arquivo', async () => {
    const base =
      'actions/workflows/homolog.yml/runs?status=success&exclude_pull_requests=false&per_page=100'
    const { obter, chamadas } = simulado({
      [`${base}&head_sha=abc`]: {
        workflow_runs: [
          corrida(1, 'push'),
          corrida(5, 'push', { path: '.github/workflows/outro.yml' }),
        ],
      },
      'actions/workflows/homolog.yml/runs?status=success&event=schedule&per_page=30': {
        workflow_runs: [
          corrida(2, 'schedule', {
            head_branch: null,
            path: '.github/workflows/homolog.yml@refs/heads/main',
          }),
        ],
      },
    })
    const lista = await criarApi(obter).execucoes('.github/workflows/homolog.yml', {
      sha: 'abc',
      agendadas: true,
    })
    expect(lista.map((e) => [e.id, e.evento, e.branch, e.caminho])).toEqual([
      [1, 'push', 'homolog', '.github/workflows/homolog.yml'],
      [2, 'schedule', '', '.github/workflows/homolog.yml'],
    ])
    expect(chamadas).toHaveLength(2)
  })
  it('execucoes sem agendadas não consulta o cron e tolera resposta ausente', async () => {
    const { obter, chamadas } = simulado({})
    expect(
      await criarApi(obter).execucoes('.github/workflows/ci.yml', { sha: 'abc', agendadas: false }),
    ).toEqual([])
    expect(chamadas).toHaveLength(1)
    expect(chamadas[0]).toContain('workflows/ci.yml/runs')
  })
  it('jobsComSucesso devolve só os nomes concluídos em sucesso', async () => {
    const { obter } = simulado({
      'actions/runs/7/jobs?per_page=100': {
        jobs: [
          { name: 'portao x', conclusion: 'success' },
          { name: 'qualidade', conclusion: 'failure' },
          { name: 'perf', conclusion: null },
        ],
      },
    })
    expect(await criarApi(obter).jobsComSucesso(7)).toEqual(['portao x'])
    expect(await criarApi(obter).jobsComSucesso(8)).toEqual([])
  })
  it('comparar mapeia ahead_by e behind_by, ou undefined', async () => {
    const { obter } = simulado({
      'compare/main...abc': { ahead_by: 2, behind_by: 0 },
      'compare/main...parcial': { ahead_by: 2 },
    })
    expect(await criarApi(obter).comparar('main', 'abc')).toEqual({ aFrente: 2, atras: 0 })
    expect(await criarApi(obter).comparar('main', 'parcial')).toBeUndefined()
    expect(await criarApi(obter).comparar('main', 'x')).toBeUndefined()
  })
  it('portaoNaMain reflete a existência do arquivo na main', async () => {
    const { obter } = simulado({
      'contents/.github/workflows/homolog.yml?ref=main': { name: 'homolog.yml' },
    })
    expect(await criarApi(obter).portaoNaMain()).toBe(true)
    expect(await criarApi(simulado({}).obter).portaoNaMain()).toBe(false)
  })
})
