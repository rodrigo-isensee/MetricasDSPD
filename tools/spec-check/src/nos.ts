import { existsSync, readdirSync } from 'node:fs'
import { basename, join } from 'node:path'

const TIPOS = ['rules', 'scenarios'] as const

/** Identificador do nó: caminho sem `.md` a partir da raiz da especificação (ex.: `rules/metrics/amostra-minima`). */
export function listarNos(raizEspecificacao: string): string[] {
  const nos: string[] = []
  for (const tipo of TIPOS) {
    const pasta = join(raizEspecificacao, tipo)
    if (!existsSync(pasta)) continue
    for (const relativo of readdirSync(pasta, { recursive: true, encoding: 'utf8' })) {
      const caminho = relativo.split('\\').join('/')
      const nome = basename(caminho)
      if (nome.endsWith('.md') && nome !== '_context.md') {
        nos.push(`${tipo}/${caminho.slice(0, -'.md'.length)}`)
      }
    }
  }
  return nos.sort()
}
