#!/usr/bin/env -S pnpm exec tsx
import { spawnSync } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { executar } from './cli.ts'
import { criarIo } from './fs-io.ts'
import { carregarInsumos } from './insumos.ts'
import { criarRenderizador } from './mmdc.ts'

const [comando, raizArg] = process.argv.slice(2)
const raiz = resolve(raizArg ?? process.cwd())

let renderizador: ReturnType<typeof criarRenderizador> | undefined

const { codigo, linhas } = await executar(comando, {
  io: criarIo(raiz),
  insumos: () => Promise.resolve(carregarInsumos(raiz)),
  hoje: new Date().toISOString().slice(0, 10),
  renderizar: (codigo) =>
    (renderizador ??= criarRenderizador(
      {
        rodar: (cmd, args) => {
          const r = spawnSync(cmd, args, { cwd: raiz, encoding: 'utf8' })
          return { status: r.status, stderr: r.stderr }
        },
        gravar: writeFileSync,
        pastaTemporaria: () => mkdtempSync(join(tmpdir(), 'docs-mermaid-')),
      },
      join(raiz, 'e2e', 'node_modules', '.bin', 'mmdc'),
      process.env['PUPPETEER_EXECUTABLE_PATH'],
    ))(codigo),
})
console.log(linhas.join('\n'))
process.exitCode = codigo
