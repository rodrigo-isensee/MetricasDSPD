import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parse } from 'yaml'
import { describe, expect, it } from 'vitest'
import { ARQUIVO_COMPOSE, PROJETO, SEGREDOS_OBRIGATORIOS } from './ambiente.ts'

const raiz = resolve(import.meta.dirname, '../../..')
const ler = (caminho: string): string => readFileSync(resolve(raiz, caminho), 'utf8')
const yaml = <T = Record<string, unknown>>(caminho: string): T => parse(ler(caminho)) as T

interface Servico {
  ports?: string[]
  mem_limit?: string
  environment?: Record<string, string>
  restart?: string
}
interface Compose {
  name: string
  services: Record<string, Servico>
  volumes: Record<string, unknown>
}

describe('docker-compose.homolog.yml', () => {
  const compose = yaml<Compose>(ARQUIVO_COMPOSE)
  const servicos = Object.entries(compose.services)

  it('usa projeto e volume próprios, distintos do ambiente de dev', () => {
    expect(compose.name).toBe(PROJETO)
    expect(Object.keys(compose.volumes)).toEqual(['dspd-homolog-pg-data'])
    expect(Object.keys(yaml<Compose>('docker-compose.yml').volumes)).not.toContain(
      'dspd-homolog-pg-data',
    )
  })
  it('publica portas só em 127.0.0.1 e fora das de dev', () => {
    const portas = servicos.flatMap(([, s]) => s.ports ?? [])
    expect(portas).toHaveLength(3)
    for (const porta of portas)
      expect(porta).toMatch(/^127\.0\.0\.1:\$\{HOMOLOG_[A-Z]+_PORT:-(15432|13000|18080)\}:/)
  })
  it('limita a memória e não reinicia sozinho em todos os serviços', () => {
    for (const [nome, s] of servicos) {
      expect(s.mem_limit, nome).toMatch(/^\d+m$/)
      expect(s.restart, nome).toBe('no')
    }
  })
  it('exige todos os segredos e não traz senha padrão de dev', () => {
    const texto = ler(ARQUIVO_COMPOSE)
    for (const chave of SEGREDOS_OBRIGATORIOS) expect(texto).toContain(`\${${chave}:?`)
    expect(texto).not.toMatch(/_dev\b/)
    expect(texto).not.toMatch(/troque-me/)
  })
  it('mantém o webhook desligado', () => {
    const texto = ler(ARQUIVO_COMPOSE)
    expect(texto).not.toContain('PG_WEBHOOK_URL:')
    expect(texto).not.toContain('WEBHOOK_BM_SEGREDO:')
  })
})

describe('.env.homolog.example', () => {
  it('lista todos os segredos sem valor e fica versionável', () => {
    const exemplo = ler('.env.homolog.example')
    for (const chave of SEGREDOS_OBRIGATORIOS)
      expect(exemplo).toMatch(new RegExp(`^${chave}=$`, 'm'))
    expect(ler('.gitignore')).toContain('!.env.homolog.example')
  })
})

interface Job {
  name?: string
  needs?: string | string[]
  if?: string
  permissions?: Record<string, string>
}
interface Workflow {
  on: Record<string, unknown>
  permissions?: Record<string, string>
  jobs: Record<string, Job>
}

describe('workflows de homologação', () => {
  const homolog = yaml<Workflow>('.github/workflows/homolog.yml')
  const aprovada = yaml<Workflow>('.github/workflows/homolog-aprovada.yml')
  const ci = yaml<Workflow>('.github/workflows/ci.yml')

  it('o portão roda no push em homolog, no agendamento noturno e sob demanda', () => {
    expect(homolog.on).toMatchObject({ push: { branches: ['homolog'] } })
    expect(Object.keys(homolog.on).sort()).toEqual(['push', 'schedule', 'workflow_dispatch'])
  })
  it('o portão cobre banco, e2e, perf, migração e smoke, e só ele escreve status', () => {
    expect(Object.keys(homolog.jobs)).toEqual(
      expect.arrayContaining([
        'escopo',
        'portao-docs',
        'qualidade',
        'banco',
        'e2e',
        'perf',
        'migracao-smoke',
        'portao',
      ]),
    )
    expect(homolog.permissions).toEqual({ contents: 'read' })
    expect(homolog.jobs.portao?.permissions).toEqual({ contents: 'read', statuses: 'write' })
    const comEscrita = Object.entries(homolog.jobs).filter(([, j]) => j.permissions !== undefined)
    expect(comEscrita.map(([n]) => n)).toEqual(['portao'])
  })
  it('documentação roda só o docs:check', () => {
    expect(homolog.jobs['portao-docs']?.if).toContain("== 'docs'")
    for (const nome of ['qualidade', 'banco', 'e2e', 'perf', 'migracao-smoke'])
      expect(homolog.jobs[nome]?.if, nome).toContain("== 'codigo'")
  })
  it('homolog-aprovada vale só para PR na main e só lê', () => {
    expect(aprovada.on).toEqual({
      pull_request: {
        branches: ['main'],
        types: ['opened', 'synchronize', 'reopened', 'ready_for_review'],
      },
    })
    expect(aprovada.jobs['homolog-aprovada']?.name).toBe('homolog-aprovada')
    expect(aprovada.permissions).toEqual({ contents: 'read', statuses: 'read' })
  })
  it('o CI atual mantém os jobs obrigatórios e o banco roda sempre em PR para homolog e main', () => {
    for (const nome of ['rapida', 'testes', 'banco', 'build', 'e2e'])
      expect(ci.jobs[nome]?.name).toBe(nome)
    expect(ci.jobs.banco?.if).toContain("github.base_ref == 'homolog'")
    expect(ci.jobs.banco?.if).toContain("github.base_ref == 'main'")
  })
})
