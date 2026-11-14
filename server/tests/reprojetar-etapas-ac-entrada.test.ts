import { spawnSync } from 'node:child_process'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ambienteFilho } from './ajuda-cli-filho.js'

const ENTRADA = new URL('../src/entradas/reprojetar-etapas-ac.ts', import.meta.url).pathname

describe('entrada ac:reprojetar-etapas: configuração', () => {
  it('sem configuração do banco falha com código 1 e a categoria, sem URL nem texto do banco', () => {
    const r = spawnSync(process.execPath, ['--import', 'tsx', ENTRADA], {
      encoding: 'utf8',
      env: ambienteFilho(),
      timeout: 60_000,
    })
    expect(r.status).toBe(1)
    expect(r.stderr).toMatch(/^ac:reprojetar-etapas falhou: configuração: [A-Z_]+\n$/)
    expect(r.stderr).not.toContain('postgres')
    expect(r.stdout).toBe('')
  })
})

describe('entrada ac:reprojetar-etapas: execução com dublês (sem banco)', () => {
  afterEach(() => {
    process.exitCode = undefined
    vi.restoreAllMocks()
    vi.resetModules()
    vi.doUnmock('../src/plataforma/config.js')
    vi.doUnmock('../src/plataforma/db/pool.js')
    vi.doUnmock('../src/modulos/acelerato/index.js')
  })

  async function rodar(reprojetar: (erro: new (m: string) => Error) => Promise<unknown>) {
    class ErroReprojecao extends Error {}
    const end = vi.fn(() => Promise.resolve())
    const criarPool = vi.fn(() => ({ end }))
    const reprojetarEtapasAcelerato = vi.fn(() => reprojetar(ErroReprojecao))
    vi.doMock('../src/plataforma/config.js', () => ({
      carregarConfigMigrar: () => ({
        LOG_LEVEL: 'silent',
        PG_MIGRADOR_URL: 'postgres://segredo@host/db',
        DSPD_SCHEMA_PREFIXO: 'teste',
      }),
    }))
    vi.doMock('../src/plataforma/db/pool.js', () => ({ criarPool }))
    vi.doMock('../src/modulos/acelerato/index.js', () => ({
      ErroReprojecao,
      reprojetarEtapasAcelerato,
    }))
    const saida = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
    const erro = vi.spyOn(process.stderr, 'write').mockImplementation(() => true)
    await import('../src/entradas/reprojetar-etapas-ac.js')
    return { end, reprojetarEtapasAcelerato, saida, erro, ErroReprojecao }
  }

  it('sucesso: sai com 0, imprime o JSON só com as contagens e fecha o pool', async () => {
    const contagens = { chamados: 12, intervalos: 40, versaoCriterio: '099:D-7-528' }
    const r = await rodar(() => Promise.resolve(contagens))
    expect(r.reprojetarEtapasAcelerato).toHaveBeenCalledOnce()
    expect(r.saida).toHaveBeenCalledWith(`${JSON.stringify(contagens)}\n`)
    expect(JSON.stringify(r.saida.mock.calls)).not.toContain('segredo')
    expect(r.end).toHaveBeenCalledOnce()
    expect(process.exitCode).toBeUndefined()
  })

  it('recusa por calendário divergente: código 4 (não 1), só a mensagem da recusa, sem saída e fechando o pool', async () => {
    const mensagem = 'o calendário da referência difere do da montagem'
    const r = await rodar((Erro) => Promise.reject(new Erro(mensagem)))
    expect(process.exitCode).toBe(4)
    expect(r.erro.mock.calls.map((c) => String(c[0])).join('')).toBe(
      `ac:reprojetar-etapas falhou: ${mensagem}\n`,
    )
    expect(r.saida).not.toHaveBeenCalled()
    expect(r.end).toHaveBeenCalledOnce()
  })

  it('erro do banco: código 1, só a categoria sem URL nem texto do erro, e fecha o pool', async () => {
    const r = await rodar(() =>
      Promise.reject(
        Object.assign(new Error('falha em postgres://segredo@host/db password'), { code: '28P01' }),
      ),
    )
    expect(process.exitCode).toBe(1)
    const texto = r.erro.mock.calls.map((c) => String(c[0])).join('')
    expect(texto).toBe('ac:reprojetar-etapas falhou: autenticação\n')
    expect(texto).not.toContain('segredo')
    expect(r.saida).not.toHaveBeenCalled()
    expect(r.end).toHaveBeenCalledOnce()
  })
})
