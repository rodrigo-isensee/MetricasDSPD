import { ARQUIVO_ENV, argsCompose, lerEnv, portas, validarEnv, type Portas } from './ambiente.ts'
import type { Dependencias } from './tipos.ts'

const TENTATIVAS_SMOKE = 10
const INTERVALO_SMOKE_MS = 3000

interface Ambiente {
  env: Record<string, string>
  portas: Portas
}

/** Lê e valida o `.env.homolog`. Em erro, devolve só os nomes dos problemas (nunca os valores). */
function carregarAmbiente(deps: Dependencias): Ambiente | string[] {
  const texto = deps.lerArquivo(ARQUIVO_ENV)
  if (texto === undefined)
    return [`${ARQUIVO_ENV} não existe: copie .env.homolog.example e preencha`]
  const env = lerEnv(texto)
  const erros = validarEnv(env)
  return erros.length > 0 ? erros : { env, portas: portas(env) }
}

function relatarErros(deps: Dependencias, erros: string[]): number {
  for (const erro of erros) deps.log(`erro: ${erro}`)
  return 1
}

/** Sobe o ambiente (build, migração e seed) e confere o smoke. */
export async function subir(deps: Dependencias): Promise<number> {
  const ambiente = carregarAmbiente(deps)
  if (Array.isArray(ambiente)) return relatarErros(deps, ambiente)
  const { env, portas: p } = ambiente

  const up = await deps.exec('docker', argsCompose('up', '-d', '--build', '--wait'))
  if (up.codigo !== 0) {
    deps.log(`erro: docker compose up falhou\n${up.saida}`)
    return 1
  }
  const url = `postgres://dspd_migrador:${env.DSPD_PWD_MIGRADOR}@127.0.0.1:${p.pg}/metricas`
  const seed = await deps.exec('pnpm', ['--filter', '@metricas-dspd/server', 'run', 'seed'], {
    env: { PG_MIGRADOR_URL: url },
  })
  if (seed.codigo !== 0) {
    deps.log(`erro: seed falhou\n${seed.saida}`)
    return 1
  }
  return smoke(deps)
}

/** Derruba o ambiente. O volume (dados) só é apagado com `apagarVolume`. */
export async function derrubar(deps: Dependencias, apagarVolume: boolean): Promise<number> {
  const args = apagarVolume ? ['down', '-v'] : ['down']
  const resultado = await deps.exec('docker', argsCompose(...args))
  if (resultado.codigo !== 0) deps.log(`erro: docker compose down falhou\n${resultado.saida}`)
  else
    deps.log(
      apagarVolume
        ? 'ambiente derrubado e volume apagado'
        : 'ambiente derrubado (volume preservado)',
    )
  return resultado.codigo === 0 ? 0 : 1
}

/** Confere, com tentativas, que a API e a SPA (nginx) respondem 200 em 127.0.0.1. */
export async function smoke(deps: Dependencias): Promise<number> {
  const ambiente = carregarAmbiente(deps)
  if (Array.isArray(ambiente)) return relatarErros(deps, ambiente)
  const { api, web } = ambiente.portas
  const alvos = [
    `http://127.0.0.1:${api}/health/ready`,
    `http://127.0.0.1:${web}/`,
    `http://127.0.0.1:${web}/health/ready`,
  ]
  for (const alvo of alvos) {
    if (!(await responde200(deps, alvo))) {
      deps.log(`erro: ${alvo} não respondeu 200`)
      return 1
    }
    deps.log(`ok: ${alvo}`)
  }
  return 0
}

async function responde200(deps: Dependencias, url: string): Promise<boolean> {
  for (let tentativa = 1; tentativa <= TENTATIVAS_SMOKE; tentativa++) {
    if ((await deps.obterStatus(url)) === 200) return true
    if (tentativa < TENTATIVAS_SMOKE) await deps.espera(INTERVALO_SMOKE_MS)
  }
  return false
}

export interface OpcoesMigracao {
  /** Diretório com a árvore da `main` (dependências instaladas). */
  origem: string
  /** Diretório com a árvore candidata (dependências instaladas). */
  destino: string
  /** URL do banco (papel migrador) já com os papéis criados. */
  urlMigrador: string
}

/** Migra com o código da main e depois com o candidato; repetir o candidato deve ser idempotente. */
export async function migracao(deps: Dependencias, opcoes: OpcoesMigracao): Promise<number> {
  const etapas: [string, string][] = [
    ['main', opcoes.origem],
    ['candidato', opcoes.destino],
    ['candidato (repetição idempotente)', opcoes.destino],
  ]
  for (const [nome, diretorio] of etapas) {
    const resultado = await deps.exec(
      'pnpm',
      ['--dir', `${diretorio}/server`, 'exec', 'tsx', 'src/entradas/migrar.ts'],
      { env: { PG_MIGRADOR_URL: opcoes.urlMigrador } },
    )
    if (resultado.codigo !== 0) {
      deps.log(`erro: migração falhou na etapa ${nome}\n${resultado.saida}`)
      return 1
    }
    deps.log(`ok: migração ${nome}`)
  }
  return 0
}
