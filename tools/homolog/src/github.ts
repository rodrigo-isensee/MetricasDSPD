import type { Api, Execucao } from './aprovacao.ts'

/** GET na API do GitHub relativo ao repositório; `undefined` quando a resposta não é 2xx. */
export type Obter = (caminho: string) => Promise<unknown>

interface RespostaExecucoes {
  workflow_runs?: {
    id: number
    event: string
    head_branch: string | null
    head_sha: string
    path: string
  }[]
}

const EXECUCOES_AGENDADAS = 30

/** Liga o contrato `Api` às respostas da API de Actions; a interpretação fica aqui, testada. */
export function criarApi(obter: Obter): Api {
  const listar = async (arquivo: string, consulta: string): Promise<Execucao[]> => {
    const resposta = (await obter(
      `actions/workflows/${arquivo.replace(/^.*\//, '')}/runs?${consulta}`,
    )) as RespostaExecucoes | undefined
    return (resposta?.workflow_runs ?? []).map((r) => ({
      id: r.id,
      evento: r.event,
      branch: r.head_branch ?? '',
      sha: r.head_sha,
      caminho: r.path.replace(/@.*$/, ''),
    }))
  }
  return {
    shaDaBranch: async (branch) =>
      ((await obter(`commits/${branch}`)) as { sha?: string } | undefined)?.sha,
    execucoes: async (arquivo, { sha, agendadas }) => {
      const base = 'status=success&exclude_pull_requests=false&per_page=100'
      const doSha = await listar(arquivo, `${base}&head_sha=${sha}`)
      const doCron = agendadas
        ? await listar(arquivo, `status=success&event=schedule&per_page=${EXECUCOES_AGENDADAS}`)
        : []
      return [...doSha, ...doCron].filter((e) => e.caminho === arquivo)
    },
    jobsComSucesso: async (idExecucao) => {
      const resposta = (await obter(`actions/runs/${idExecucao}/jobs?per_page=100`)) as
        { jobs?: { name: string; conclusion: string | null }[] } | undefined
      return (resposta?.jobs ?? []).filter((j) => j.conclusion === 'success').map((j) => j.name)
    },
    comparar: async (base, head) => {
      const r = (await obter(`compare/${base}...${head}`)) as
        { ahead_by?: number; behind_by?: number } | undefined
      return r?.ahead_by === undefined || r.behind_by === undefined
        ? undefined
        : { aFrente: r.ahead_by, atras: r.behind_by }
    },
    portaoNaMain: async () =>
      (await obter('contents/.github/workflows/homolog.yml?ref=main')) !== undefined,
  }
}
