import { describe, expect, it } from 'vitest'
import {
  ARQUIVO_CI,
  ARQUIVO_HOMOLOG,
  EXIGIR_NOTURNA,
  MAX_COMMITS_HOTFIX,
  decidirAprovacao,
  type Api,
  type Comparacao,
  type Execucao,
  type Pedido,
} from './aprovacao.ts'

const SHA = 'a'.repeat(40)
const REPO = 'org/metricas'

interface Cenario {
  ponta?: string | undefined
  execucoes?: Execucao[]
  /** Jobs em sucesso por id de execução. */
  jobs?: Record<number, string[]>
  comparacao?: Comparacao | undefined
  portaoNaMain?: boolean
}

function api(c: Cenario): Api {
  return {
    shaDaBranch: () => Promise.resolve(c.ponta),
    execucoes: (arquivo) =>
      Promise.resolve((c.execucoes ?? []).filter((e) => e.caminho === arquivo)),
    jobsComSucesso: (id) => Promise.resolve(c.jobs?.[id] ?? []),
    comparar: () => Promise.resolve(c.comparacao),
    portaoNaMain: () => Promise.resolve(c.portaoNaMain ?? true),
  }
}

const exec = (id: number, evento: string, extra: Partial<Execucao> = {}): Execucao => ({
  id,
  evento,
  branch: evento === 'schedule' ? 'main' : 'homolog',
  sha: SHA,
  caminho: ARQUIVO_HOMOLOG,
  ...extra,
})
const portao = `portao ${SHA}`
const verde: Cenario = {
  ponta: SHA,
  execucoes: [exec(1, 'push'), exec(2, 'schedule', { sha: 'c'.repeat(40) })],
  jobs: { 1: [portao], 2: [portao] },
}

const pedido = (origem: string, extra: Partial<Pedido> = {}): Pedido => ({
  shaCandidato: SHA,
  branchOrigem: origem,
  repoOrigem: REPO,
  repoDestino: REPO,
  ...extra,
})

describe('decidirAprovacao: homolog → main', () => {
  it('aprova a ponta de homolog com o portão (push) e a noturna (schedule) verdes', async () => {
    const d = await decidirAprovacao(api(verde), pedido('homolog'), true)
    expect(d).toEqual({
      aprovada: true,
      motivo: 'aaaaaaa é a ponta de homolog, com portão e noturna verdes',
    })
  })
  it('com EXIGIR_NOTURNA desligada (padrão) a noturna NÃO é exigida: só o portão basta', async () => {
    expect(EXIGIR_NOTURNA).toBe(false)
    const soPortao: Cenario = { ...verde, execucoes: [exec(1, 'push')], jobs: { 1: [portao] } }
    const d = await decidirAprovacao(api(soPortao), pedido('homolog'))
    expect(d).toEqual({
      aprovada: true,
      motivo: 'aaaaaaa é a ponta de homolog, com o portão verde (noturna informativa)',
    })
  })
  it('com a noturna dispensada o portão continua exigido', async () => {
    const semPortao: Cenario = { ...verde, jobs: { 1: [], 2: [portao] } }
    const d = await decidirAprovacao(api(semPortao), pedido('homolog'), false)
    expect(d.aprovada).toBe(false)
    expect(d.motivo).toContain('portão de homolog sem sucesso')
  })
  it('recusa PR de fork, mesmo com o nome homolog', async () => {
    const d = await decidirAprovacao(api(verde), pedido('homolog', { repoOrigem: 'x/metricas' }))
    expect(d.aprovada).toBe(false)
    expect(d.motivo).toContain('fork')
  })
  it('recusa origem que não é homolog', async () => {
    const d = await decidirAprovacao(api(verde), pedido('develop'))
    expect(d).toEqual({ aprovada: false, motivo: 'a main só recebe de homolog (origem: develop)' })
  })
  it('recusa quando homolog não existe', async () => {
    const d = await decidirAprovacao(api({ ...verde, ponta: undefined }), pedido('homolog'))
    expect(d.motivo).toBe('a branch homolog não existe')
  })
  it('recusa candidato que não é a ponta', async () => {
    const d = await decidirAprovacao(api({ ...verde, ponta: 'b'.repeat(40) }), pedido('homolog'))
    expect(d.motivo).toContain('não é a ponta de homolog')
  })
  it('recusa portão ausente, de outro SHA, de outra branch ou de outro workflow', async () => {
    const casos: Execucao[] = [
      exec(1, 'push', { sha: 'b'.repeat(40) }),
      exec(1, 'push', { branch: 'feature/x' }),
      exec(1, 'push', { caminho: '.github/workflows/falso.yml' }),
      exec(1, 'pull_request'),
    ]
    for (const e of casos) {
      const d = await decidirAprovacao(
        api({ ...verde, execucoes: [e, exec(2, 'schedule')] }),
        pedido('homolog'),
      )
      expect(d.motivo, JSON.stringify(e)).toContain('portão de homolog sem sucesso')
    }
  })
  it('recusa quando o job portao do SHA não fechou em sucesso (outro SHA no nome)', async () => {
    const d = await decidirAprovacao(
      api({ ...verde, jobs: { 1: ['portao ' + 'b'.repeat(40)], 2: [portao] } }),
      pedido('homolog'),
    )
    expect(d.motivo).toContain('portão de homolog sem sucesso')
  })
  it('recusa noturna ausente ou sem o job do SHA', async () => {
    const semExecucao = await decidirAprovacao(
      api({ ...verde, execucoes: [exec(1, 'push')] }),
      pedido('homolog'),
      true,
    )
    expect(semExecucao.motivo).toContain('rodada noturna sem sucesso')
    const semJob = await decidirAprovacao(
      api({ ...verde, jobs: { 1: [portao], 2: ['qualidade'] } }),
      pedido('homolog'),
      true,
    )
    expect(semJob.motivo).toContain('rodada noturna sem sucesso')
  })
  it('a execução manual só vale como noturna enquanto o workflow não está na main', async () => {
    const manual: Cenario = {
      ...verde,
      execucoes: [exec(1, 'push'), exec(3, 'workflow_dispatch')],
      jobs: { 1: [portao], 3: [portao] },
    }
    expect(
      (await decidirAprovacao(api({ ...manual, portaoNaMain: false }), pedido('homolog'), true))
        .aprovada,
    ).toBe(true)
    const naMain = await decidirAprovacao(
      api({ ...manual, portaoNaMain: true }),
      pedido('homolog'),
      true,
    )
    expect(naMain.motivo).toContain('rodada noturna sem sucesso')
  })
  it('a execução manual fora de homolog não vale', async () => {
    const d = await decidirAprovacao(
      api({
        ...verde,
        portaoNaMain: false,
        execucoes: [exec(1, 'push'), exec(3, 'workflow_dispatch', { branch: 'feature/x' })],
        jobs: { 1: [portao], 3: [portao] },
      }),
      pedido('homolog'),
      true,
    )
    expect(d.aprovada).toBe(false)
  })
})

describe('decidirAprovacao: hotfix', () => {
  const ci = (extra: Partial<Execucao> = {}): Execucao => ({
    id: 9,
    evento: 'pull_request',
    branch: 'hotfix/x',
    sha: SHA,
    caminho: ARQUIVO_CI,
    ...extra,
  })
  const hotfix: Cenario = { comparacao: { aFrente: 2, atras: 0 }, execucoes: [ci()] }

  it('aprova hotfix curto, sobre a ponta da main, com o CI completo verde, e avisa', async () => {
    const d = await decidirAprovacao(api(hotfix), pedido('hotfix/x'))
    expect(d.aprovada).toBe(true)
    expect(d.aviso).toContain('HOTFIX sem soak')
    expect(d.motivo).toContain('2 commit(s) sobre a ponta da main')
  })
  it('recusa hotfix de fork', async () => {
    const d = await decidirAprovacao(api(hotfix), pedido('hotfix/x', { repoOrigem: 'x/y' }))
    expect(d.aprovada).toBe(false)
  })
  it('recusa quando a comparação com a main falha', async () => {
    const d = await decidirAprovacao(api({ ...hotfix, comparacao: undefined }), pedido('hotfix/x'))
    expect(d.motivo).toContain('não foi possível comparar')
  })
  it('recusa hotfix que não sai da ponta da main', async () => {
    const d = await decidirAprovacao(
      api({ ...hotfix, comparacao: { aFrente: 2, atras: 3 } }),
      pedido('hotfix/x'),
    )
    expect(d.motivo).toContain('3 commit(s) atrás')
  })
  it('recusa hotfix vazio ou grande demais (conteúdo da develop disfarçado)', async () => {
    for (const aFrente of [0, MAX_COMMITS_HOTFIX + 1]) {
      const d = await decidirAprovacao(
        api({ ...hotfix, comparacao: { aFrente, atras: 0 } }),
        pedido('hotfix/x'),
      )
      expect(d.motivo).toContain(`${aFrente} commit(s) novo(s)`)
    }
  })
  it('recusa quando o CI do PR não está verde para este SHA', async () => {
    for (const execucoes of [
      [],
      [ci({ sha: 'b'.repeat(40) })],
      [ci({ evento: 'push' })],
      [ci({ caminho: '.github/workflows/falso.yml' })],
    ]) {
      const d = await decidirAprovacao(api({ ...hotfix, execucoes }), pedido('hotfix/x'))
      expect(d.motivo).toContain('suíte completa do CI não está verde')
    }
  })
})
