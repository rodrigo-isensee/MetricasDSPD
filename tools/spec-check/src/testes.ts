import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const IGNORADAS = new Set(['node_modules', '.git', 'dist', 'dist-alt', 'coverage', 'fixtures'])
const CHAMADA = /\b(?:it|test|describe)(?:\.\w+)*\s*\(\s*(['"`])((?:\\.|(?!\1)[^\\])*)\1/g
const CITACAO = /\[((?:rules|scenarios)\/[A-Za-z0-9_\-./]+)\]/g

/** Caminhos (relativos à raiz, com `/`) de todo `*.test.ts` do repositório. */
export function listarArquivosDeTeste(raiz: string): string[] {
  const achados: string[] = []
  const visitar = (relativo: string): void => {
    for (const entrada of readdirSync(join(raiz, relativo), { withFileTypes: true })) {
      if (IGNORADAS.has(entrada.name)) continue
      const caminho = relativo === '' ? entrada.name : `${relativo}/${entrada.name}`
      if (entrada.isDirectory()) visitar(caminho)
      else if (entrada.name.endsWith('.test.ts')) achados.push(caminho)
    }
  }
  visitar('')
  return achados.sort()
}

/** Identificadores `[rules/...]` e `[scenarios/...]` citados nos nomes de `it`, `test` e `describe`. */
export function extrairCitacoes(codigo: string): string[] {
  const citados = new Set<string>()
  for (const chamada of codigo.matchAll(CHAMADA)) {
    for (const citacao of (chamada[2] as string).matchAll(CITACAO)) {
      citados.add((citacao[1] as string).replace(/\.+$/, ''))
    }
  }
  return [...citados].sort()
}

/** Mapa arquivo de teste -> identificadores citados (só arquivos com citação). */
export function citacoesPorArquivo(raiz: string): Map<string, string[]> {
  const mapa = new Map<string, string[]>()
  for (const arquivo of listarArquivosDeTeste(raiz)) {
    const citados = extrairCitacoes(readFileSync(join(raiz, arquivo), 'utf8'))
    if (citados.length > 0) mapa.set(arquivo, citados)
  }
  return mapa
}
