#!/usr/bin/env node
// Entrada de linha de comando: só liga as dependências reais à lógica testada (excluída da cobertura).
import { spawn } from 'node:child_process'
import { appendFileSync, existsSync, readFileSync } from 'node:fs'
import { setTimeout as esperar } from 'node:timers/promises'
import { decidirAprovacao, type Api } from './aprovacao.ts'
import { criarApi } from './github.ts'
import { derrubar, migracao, smoke, subir } from './comandos.ts'
import { classificarEscopo } from './escopo.ts'
import type { Dependencias } from './tipos.ts'

const deps: Dependencias = {
  exec: (comando, args, opcoes) =>
    new Promise((resolver) => {
      const filho = spawn(comando, args, {
        cwd: opcoes?.cwd,
        env: { ...process.env, ...opcoes?.env },
        stdio: ['ignore', 'pipe', 'pipe'],
      })
      let saida = ''
      filho.stdout.on('data', (parte: Buffer) => (saida += parte.toString()))
      filho.stderr.on('data', (parte: Buffer) => (saida += parte.toString()))
      filho.on('error', (erro) => resolver({ codigo: 127, saida: erro.message }))
      filho.on('close', (codigo) => resolver({ codigo: codigo ?? 1, saida }))
    }),
  lerArquivo: (caminho) => (existsSync(caminho) ? readFileSync(caminho, 'utf8') : undefined),
  obterStatus: async (url) => {
    try {
      return (await fetch(url, { signal: AbortSignal.timeout(5000) })).status
    } catch {
      return undefined
    }
  },
  espera: (ms) => esperar(ms),
  log: (linha) => console.log(linha),
}

function opcao(args: string[], nome: string): string {
  const indice = args.indexOf(`--${nome}`)
  const valor = indice >= 0 ? args[indice + 1] : undefined
  if (valor === undefined) throw new Error(`falta --${nome}`)
  return valor
}

function apiDoGitHub(): Api {
  const repo = process.env.GITHUB_REPOSITORY ?? ''
  const cabecalhos = {
    authorization: `Bearer ${process.env.GITHUB_TOKEN ?? ''}`,
    accept: 'application/vnd.github+json',
  }
  return criarApi(async (caminho) => {
    const resposta = await fetch(`https://api.github.com/repos/${repo}/${caminho}`, {
      headers: cabecalhos,
    })
    return resposta.ok ? resposta.json() : undefined
  })
}

const [comando, ...args] = process.argv.slice(2)
switch (comando) {
  case 'subir':
    process.exitCode = await subir(deps)
    break
  case 'derrubar':
    process.exitCode = await derrubar(deps, args.includes('--volume'))
    break
  case 'smoke':
    process.exitCode = await smoke(deps)
    break
  case 'migracao':
    process.exitCode = await migracao(deps, {
      origem: opcao(args, 'origem'),
      destino: opcao(args, 'destino'),
      urlMigrador: process.env.PG_MIGRADOR_URL ?? '',
    })
    break
  case 'escopo': {
    const diff = await deps.exec('git', [
      'diff',
      '--name-only',
      `${opcao(args, 'base')}...${opcao(args, 'head')}`,
    ])
    if (diff.codigo !== 0) throw new Error(diff.saida)
    console.log(classificarEscopo(diff.saida.split('\n')))
    break
  }
  case 'aprovacao': {
    const decisao = await decidirAprovacao(apiDoGitHub(), {
      shaCandidato: opcao(args, 'sha'),
      branchOrigem: opcao(args, 'origem'),
      repoOrigem: opcao(args, 'repo-origem'),
      repoDestino: process.env.GITHUB_REPOSITORY ?? '',
    })
    if (decisao.aviso !== undefined) {
      console.log(`::warning::${decisao.aviso}`)
      appendFileSync(
        process.env.GITHUB_STEP_SUMMARY ?? '/dev/null',
        `### ${decisao.aviso}\n\n${decisao.motivo}\n`,
      )
    }
    console.log(decisao.motivo)
    process.exitCode = decisao.aprovada ? 0 : 1
    break
  }
  default:
    console.log(
      'uso: main.ts subir | derrubar [--volume] | smoke | migracao --origem D --destino D | escopo --base X --head Y | aprovacao --sha S --origem B --repo-origem O/R',
    )
    process.exitCode = 2
}
