import { describe, expect, it } from 'vitest'
import { argsCompose, lerEnv, portas, validarEnv, SEGREDOS_OBRIGATORIOS } from './ambiente.ts'

const valido = Object.fromEntries(SEGREDOS_OBRIGATORIOS.map((c) => [c, `segredo-forte-${c}`]))

describe('lerEnv', () => {
  it('lê chaves, ignora comentários, vazias e linhas sem igual, e remove aspas', () => {
    const env = lerEnv('# c\n\nA=1\r\nB = "dois"\nC=\x27tres\x27\nsemigual\n=x\nD=a=b')
    expect(env).toEqual({ A: '1', B: 'dois', C: 'tres', D: 'a=b' })
  })
})

describe('validarEnv', () => {
  it('aceita segredos fortes', () => {
    expect(validarEnv(valido)).toEqual([])
  })
  it('recusa ausentes, padrões de dev e curtos, sem vazar o valor', () => {
    const env = {
      ...valido,
      DSPD_PWD_API: '',
      DSPD_PWD_REF: 'api_dev',
      DSPD_PWD_COLETOR: 'curta',
      DSPD_PWD_WEBHOOK: 'troque-me-postgres',
    }
    delete (env as Record<string, string>).DSPD_PWD_MIGRADOR
    const erros = validarEnv(env)
    expect(erros).toEqual([
      'DSPD_PWD_MIGRADOR não definida',
      'DSPD_PWD_COLETOR curta demais (mínimo 12 caracteres)',
      'DSPD_PWD_API não definida',
      'DSPD_PWD_REF usa um valor padrão de desenvolvimento',
      'DSPD_PWD_WEBHOOK usa um valor padrão de desenvolvimento',
    ])
    expect(erros.join()).not.toContain('curta"')
  })
  it('recusa o webhook ligado', () => {
    expect(validarEnv({ ...valido, WEBHOOK_BM_SEGREDO: 'x'.repeat(20) })).toEqual([
      'WEBHOOK_BM_SEGREDO deve ficar vazio em homologação (webhook desligado)',
    ])
  })
})

describe('portas', () => {
  it('usa os padrões próprios (fora das de dev)', () => {
    expect(portas({})).toEqual({ pg: 15432, api: 13000, web: 18080 })
  })
  it('aceita sobrescrita válida e ignora inválida', () => {
    expect(
      portas({ HOMOLOG_PG_PORT: '25432', HOMOLOG_API_PORT: 'abc', HOMOLOG_WEB_PORT: '70000' }),
    ).toEqual({
      pg: 25432,
      api: 13000,
      web: 18080,
    })
  })
})

describe('argsCompose', () => {
  it('fixa projeto, arquivo e env próprios', () => {
    expect(argsCompose('up', '-d')).toEqual([
      'compose',
      '-p',
      'metricasdspd-homolog',
      '-f',
      'docker-compose.homolog.yml',
      '--env-file',
      '.env.homolog',
      'up',
      '-d',
    ])
  })
})
