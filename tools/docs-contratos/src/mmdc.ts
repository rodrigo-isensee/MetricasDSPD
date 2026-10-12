import type { ResultadoRender } from './mermaid.ts'

export type Executor = {
  rodar: (comando: string, args: string[]) => { status: number | null; stderr: string }
  gravar: (caminho: string, texto: string) => void
  pastaTemporaria: () => string
}

/** Configuração do Puppeteer: Chromium já instalado (Playwright) e sem sandbox (runner de CI). */
export const configPuppeteer = (executavel: string | undefined): string =>
  JSON.stringify({
    ...(executavel === undefined ? {} : { executablePath: executavel }),
    args: ['--no-sandbox'],
  })

/**
 * Cria o executor de renderização com o mermaid-cli (`mmdc`, devDependency do e2e). Cada bloco vira um `.mmd`
 * temporário; o SVG de saída é descartado, só o código de saída importa.
 */
export function criarRenderizador(
  x: Executor,
  bin: string,
  executavel: string | undefined,
): (codigo: string) => ResultadoRender {
  const pasta = x.pastaTemporaria()
  const config = `${pasta}/puppeteer.json`
  x.gravar(config, configPuppeteer(executavel))
  let n = 0
  return (codigo) => {
    n += 1
    const entrada = `${pasta}/d${n}.mmd`
    x.gravar(entrada, codigo)
    const r = x.rodar(bin, ['-q', '-i', entrada, '-o', `${pasta}/d${n}.svg`, '-p', config])
    return r.status === 0
      ? { ok: true, erro: '' }
      : { ok: false, erro: r.stderr.trim().split('\n').slice(0, 3).join(' | ') }
  }
}
