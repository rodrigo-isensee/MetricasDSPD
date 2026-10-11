#!/usr/bin/env node
import { resolve } from 'node:path'
import { conferir } from './conferir.ts'

const { codigo, linhas } = conferir(resolve(process.argv[2] ?? process.cwd()))
console.log(linhas.join('\n'))
process.exitCode = codigo
