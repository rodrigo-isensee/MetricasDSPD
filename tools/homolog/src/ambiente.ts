export const PROJETO = 'metricasdspd-homolog'
export const ARQUIVO_COMPOSE = 'docker-compose.homolog.yml'
export const ARQUIVO_ENV = '.env.homolog'

export const SEGREDOS_OBRIGATORIOS = [
  'HOMOLOG_PG_SUPERUSER_PWD',
  'DSPD_PWD_MIGRADOR',
  'DSPD_PWD_COLETOR',
  'DSPD_PWD_API',
  'DSPD_PWD_REF',
  'DSPD_PWD_WEBHOOK',
  'DSPD_PWD_AUTOMACAO',
] as const

export const PORTAS_PADRAO = { pg: 15432, api: 13000, web: 18080 } as const
const TAMANHO_MINIMO_SEGREDO = 12
/** Senhas de desenvolvimento do docker-compose.yml: nunca valem em homologação. */
const PADRAO_SENHA_DE_DEV = /(_dev|^troque-me)/

/** Lê um arquivo no formato `.env` (CHAVE=valor, comentários com #). */
export function lerEnv(texto: string): Record<string, string> {
  const env: Record<string, string> = {}
  for (const bruta of texto.split(/\r?\n/)) {
    const linha = bruta.trim()
    if (linha === '' || linha.startsWith('#')) continue
    const igual = linha.indexOf('=')
    if (igual < 1) continue
    const valor = linha.slice(igual + 1).trim()
    env[linha.slice(0, igual).trim()] = valor.replace(/^(["'])(.*)\1$/, '$2')
  }
  return env
}

/** Devolve os problemas do ambiente de homologação (lista vazia = válido). Nunca inclui valores de segredo. */
export function validarEnv(env: Record<string, string>): string[] {
  const erros: string[] = []
  for (const chave of SEGREDOS_OBRIGATORIOS) {
    const valor = env[chave] ?? ''
    if (valor === '') erros.push(`${chave} não definida`)
    else if (PADRAO_SENHA_DE_DEV.test(valor))
      erros.push(`${chave} usa um valor padrão de desenvolvimento`)
    else if (valor.length < TAMANHO_MINIMO_SEGREDO)
      erros.push(`${chave} curta demais (mínimo ${TAMANHO_MINIMO_SEGREDO} caracteres)`)
  }
  if ((env.WEBHOOK_BM_SEGREDO ?? '') !== '')
    erros.push('WEBHOOK_BM_SEGREDO deve ficar vazio em homologação (webhook desligado)')
  return erros
}

export interface Portas {
  pg: number
  api: number
  web: number
}

/** Portas efetivas (o `.env.homolog` pode trocar os padrões). */
export function portas(env: Record<string, string>): Portas {
  const ler = (chave: string, padrao: number): number => {
    const numero = Number(env[chave])
    return Number.isInteger(numero) && numero > 0 && numero < 65536 ? numero : padrao
  }
  return {
    pg: ler('HOMOLOG_PG_PORT', PORTAS_PADRAO.pg),
    api: ler('HOMOLOG_API_PORT', PORTAS_PADRAO.api),
    web: ler('HOMOLOG_WEB_PORT', PORTAS_PADRAO.web),
  }
}

/** Argumentos do `docker compose` com o projeto, o arquivo e o `.env.homolog` próprios. */
export function argsCompose(...resto: string[]): string[] {
  return ['compose', '-p', PROJETO, '-f', ARQUIVO_COMPOSE, '--env-file', ARQUIVO_ENV, ...resto]
}
