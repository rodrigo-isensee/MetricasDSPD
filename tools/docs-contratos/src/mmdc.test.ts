import { describe, expect, it } from 'vitest'
import { configPuppeteer, criarRenderizador, type Executor } from './mmdc.ts'

const executor = (
  status: number | null,
  stderr = '',
): Executor & { gravados: Record<string, string>; chamadas: string[][]; pastas: number } => {
  const x = {
    gravados: {} as Record<string, string>,
    chamadas: [] as string[][],
    pastas: 0,
    rodar: (cmd: string, args: string[]) => {
      x.chamadas.push([cmd, ...args])
      return { status, stderr }
    },
    gravar: (c: string, t: string) => {
      x.gravados[c] = t
    },
    pastaTemporaria: () => {
      x.pastas += 1
      return '/tmp/m'
    },
  }
  return x
}

describe('configPuppeteer', () => {
  it('sempre sem sandbox; usa o Chromium informado quando há', () => {
    expect(JSON.parse(configPuppeteer(undefined))).toEqual({ args: ['--no-sandbox'] })
    expect(JSON.parse(configPuppeteer('/x/chrome'))).toEqual({
      executablePath: '/x/chrome',
      args: ['--no-sandbox'],
    })
  })
})

describe('criarRenderizador', () => {
  it('grava a configuração uma vez e um .mmd por bloco; sucesso quando o mmdc sai com 0', () => {
    const x = executor(0)
    const render = criarRenderizador(x, '/bin/mmdc', '/x/chrome')
    expect(render('flowchart LR')).toEqual({ ok: true, erro: '' })
    expect(render('graph TD')).toEqual({ ok: true, erro: '' })
    expect(x.pastas).toBe(1)
    expect(JSON.parse(x.gravados['/tmp/m/puppeteer.json']!).executablePath).toBe('/x/chrome')
    expect(x.gravados['/tmp/m/d1.mmd']).toBe('flowchart LR')
    expect(x.chamadas[1]).toEqual([
      '/bin/mmdc',
      '-q',
      '-i',
      '/tmp/m/d2.mmd',
      '-o',
      '/tmp/m/d2.svg',
      '-p',
      '/tmp/m/puppeteer.json',
    ])
  })

  it('falha devolve as 3 primeiras linhas do erro', () => {
    const render = criarRenderizador(executor(1, 'a\nb\nc\nd'), '/bin/mmdc', undefined)
    expect(render('x')).toEqual({ ok: false, erro: 'a | b | c' })
    expect(criarRenderizador(executor(null, ''), '/bin/mmdc', undefined)('x').ok).toBe(false)
  })
})
