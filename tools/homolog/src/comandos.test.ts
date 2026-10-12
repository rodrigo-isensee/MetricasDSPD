import { describe, expect, it, vi } from 'vitest'
import { SEGREDOS_OBRIGATORIOS } from './ambiente.ts'
import { derrubar, migracao, smoke, subir } from './comandos.ts'
import type { Dependencias, ResultadoExec } from './tipos.ts'

const ENV_VALIDO = SEGREDOS_OBRIGATORIOS.map((c) => `${c}=segredo-forte-${c}`).join('\n')

function criar(parcial: Partial<Dependencias> = {}) {
  const logs: string[] = []
  const deps: Dependencias = {
    exec: vi.fn((): Promise<ResultadoExec> => Promise.resolve({ codigo: 0, saida: '' })),
    lerArquivo: () => ENV_VALIDO,
    obterStatus: vi.fn(() => Promise.resolve(200)),
    espera: vi.fn(() => Promise.resolve()),
    log: (linha) => logs.push(linha),
    ...parcial,
  }
  return { deps, logs }
}

describe('subir', () => {
  it('sobe, semeia e confere o smoke', async () => {
    const { deps } = criar()
    expect(await subir(deps)).toBe(0)
    const chamadas = vi.mocked(deps.exec).mock.calls
    expect(chamadas[0]?.[1]).toContain('--wait')
    expect(chamadas[1]?.[0]).toBe('pnpm')
    expect(chamadas[1]?.[2]?.env?.PG_MIGRADOR_URL).toContain('@127.0.0.1:15432/metricas')
  })
  it('para sem .env.homolog', async () => {
    const { deps, logs } = criar({ lerArquivo: () => undefined })
    expect(await subir(deps)).toBe(1)
    expect(logs[0]).toContain('.env.homolog não existe')
    expect(deps.exec).not.toHaveBeenCalled()
  })
  it('para com segredo inválido, sem imprimir o valor', async () => {
    const { deps, logs } = criar({ lerArquivo: () => 'DSPD_PWD_API=api_dev' })
    expect(await subir(deps)).toBe(1)
    expect(logs.join()).toContain('DSPD_PWD_API usa um valor padrão')
    expect(logs.join()).not.toContain('=api_dev')
  })
  it('falha quando o compose falha', async () => {
    const { deps, logs } = criar({ exec: () => Promise.resolve({ codigo: 1, saida: 'boom' }) })
    expect(await subir(deps)).toBe(1)
    expect(logs[0]).toContain('docker compose up falhou')
  })
  it('falha quando o seed falha', async () => {
    const exec = vi
      .fn<Dependencias['exec']>()
      .mockResolvedValueOnce({ codigo: 0, saida: '' })
      .mockResolvedValueOnce({ codigo: 2, saida: 'seed ruim' })
    const { deps, logs } = criar({ exec })
    expect(await subir(deps)).toBe(1)
    expect(logs[0]).toContain('seed falhou')
  })
})

describe('derrubar', () => {
  it('preserva o volume por padrão', async () => {
    const { deps, logs } = criar()
    expect(await derrubar(deps, false)).toBe(0)
    expect(vi.mocked(deps.exec).mock.calls[0]?.[1]).not.toContain('-v')
    expect(logs[0]).toContain('volume preservado')
  })
  it('apaga o volume só quando pedido', async () => {
    const { deps, logs } = criar()
    expect(await derrubar(deps, true)).toBe(0)
    expect(vi.mocked(deps.exec).mock.calls[0]?.[1]).toContain('-v')
    expect(logs[0]).toContain('volume apagado')
  })
  it('relata falha', async () => {
    const { deps, logs } = criar({ exec: () => Promise.resolve({ codigo: 1, saida: 'x' }) })
    expect(await derrubar(deps, false)).toBe(1)
    expect(logs[0]).toContain('down falhou')
  })
})

describe('smoke', () => {
  it('confere API e SPA nas portas de homologação', async () => {
    const { deps } = criar()
    expect(await smoke(deps)).toBe(0)
    expect(vi.mocked(deps.obterStatus).mock.calls.map((c) => c[0])).toEqual([
      'http://127.0.0.1:13000/health/ready',
      'http://127.0.0.1:18080/',
      'http://127.0.0.1:18080/health/ready',
    ])
  })
  it('tenta de novo até responder', async () => {
    const obterStatus = vi
      .fn<Dependencias['obterStatus']>()
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(503)
      .mockResolvedValue(200)
    const { deps } = criar({ obterStatus })
    expect(await smoke(deps)).toBe(0)
    expect(deps.espera).toHaveBeenCalledTimes(2)
  })
  it('falha depois de esgotar as tentativas', async () => {
    const { deps, logs } = criar({ obterStatus: () => Promise.resolve(500) })
    expect(await smoke(deps)).toBe(1)
    expect(deps.espera).toHaveBeenCalledTimes(9)
    expect(logs.at(-1)).toContain('não respondeu 200')
  })
  it('exige ambiente válido', async () => {
    const { deps } = criar({ lerArquivo: () => undefined })
    expect(await smoke(deps)).toBe(1)
  })
})

describe('migracao', () => {
  const opcoes = { origem: 'main-src', destino: '.', urlMigrador: 'postgres://x' }
  it('migra main, candidato e repete o candidato', async () => {
    const { deps } = criar()
    expect(await migracao(deps, opcoes)).toBe(0)
    const dirs = vi.mocked(deps.exec).mock.calls.map((c) => c[1][1])
    expect(dirs).toEqual(['main-src/server', './server', './server'])
    expect(vi.mocked(deps.exec).mock.calls[0]?.[2]?.env?.PG_MIGRADOR_URL).toBe('postgres://x')
  })
  it('falha na primeira etapa que falhar', async () => {
    const exec = vi
      .fn<Dependencias['exec']>()
      .mockResolvedValueOnce({ codigo: 0, saida: '' })
      .mockResolvedValueOnce({ codigo: 1, saida: 'quebrou' })
    const { deps, logs } = criar({ exec })
    expect(await migracao(deps, opcoes)).toBe(1)
    expect(logs.at(-1)).toContain('etapa candidato')
    expect(exec).toHaveBeenCalledTimes(2)
  })
})
