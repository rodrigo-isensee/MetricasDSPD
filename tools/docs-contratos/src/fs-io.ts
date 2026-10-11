import { existsSync, mkdirSync, rmSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import type { Io } from './gerador.ts'

/** E/S real sobre uma raiz do repositório. Caminhos sempre relativos e com `/`. */
export function criarIo(raiz: string): Io {
  return {
    ler: (c) => (existsSync(join(raiz, c)) ? readFileSync(join(raiz, c), 'utf8') : undefined),
    escrever: (c, texto) => {
      mkdirSync(dirname(join(raiz, c)), { recursive: true })
      writeFileSync(join(raiz, c), texto)
    },
    apagar: (c) => {
      rmSync(join(raiz, c), { force: true })
    },
    listar: (pasta) =>
      existsSync(join(raiz, pasta))
        ? readdirSync(join(raiz, pasta), { recursive: true, withFileTypes: true })
            .filter((d) => d.isFile())
            .map((d) =>
              join(d.parentPath, d.name)
                .slice(raiz.length + 1)
                .split('\\')
                .join('/'),
            )
            .sort()
        : [],
    existe: (c) => existsSync(join(raiz, c)),
  }
}
