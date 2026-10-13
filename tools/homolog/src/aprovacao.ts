export const ARQUIVO_HOMOLOG = '.github/workflows/homolog.yml'
export const ARQUIVO_CI = '.github/workflows/ci.yml'
export const MAX_COMMITS_HOTFIX = 10
/**
 * Decisão do usuário (2026-10-12): a rodada noturna é informativa por enquanto e não bloqueia a release.
 * Para religar a exigência, troque para `true` (uma linha).
 */
export const EXIGIR_NOTURNA = false

/** Uma execução concluída com sucesso de um workflow, como a API de Actions a descreve. */
export interface Execucao {
  id: number
  evento: string
  branch: string
  sha: string
  caminho: string
}

export interface Comparacao {
  aFrente: number
  atras: number
}

/** Consultas ao GitHub (implementadas em github.ts; aqui só o contrato). */
export interface Api {
  /** SHA da ponta da branch, ou `undefined` se ela não existir. */
  shaDaBranch: (branch: string) => Promise<string | undefined>
  /** Execuções com `conclusion=success` do workflow: as do `sha` e, se pedido, as agendadas. */
  execucoes: (arquivo: string, consulta: { sha: string; agendadas: boolean }) => Promise<Execucao[]>
  /** Nomes dos jobs com `conclusion=success` da execução. */
  jobsComSucesso: (idExecucao: number) => Promise<string[]>
  /** Compara `base...head`; `undefined` se a comparação falhar. */
  comparar: (base: string, head: string) => Promise<Comparacao | undefined>
  /** Se o workflow do portão já existe na `main` (o agendamento só dispara de lá). */
  portaoNaMain: () => Promise<boolean>
}

export interface Pedido {
  shaCandidato: string
  branchOrigem: string
  /** `owner/repo` da branch de origem e do destino do PR (iguais, exceto em fork). */
  repoOrigem: string
  repoDestino: string
}

export interface Decisao {
  aprovada: boolean
  motivo: string
  /** Mensagem que a CI deve destacar como aviso (hotfix sem soak). */
  aviso?: string
}

/**
 * Regra do check `homolog-aprovada` (PR para a main). A decisão final continua sendo do usuário.
 * A evidência vem das execuções do workflow de homologação (API de Actions), nunca de status de commit.
 */
export async function decidirAprovacao(
  api: Api,
  pedido: Pedido,
  exigirNoturna: boolean = EXIGIR_NOTURNA,
): Promise<Decisao> {
  if (pedido.repoOrigem !== pedido.repoDestino)
    return { aprovada: false, motivo: `PR de fork não é aceito (origem: ${pedido.repoOrigem})` }
  if (pedido.branchOrigem.startsWith('hotfix/')) return decidirHotfix(api, pedido)
  if (pedido.branchOrigem !== 'homolog')
    return {
      aprovada: false,
      motivo: `a main só recebe de homolog (origem: ${pedido.branchOrigem})`,
    }

  const ponta = await api.shaDaBranch('homolog')
  if (ponta === undefined) return { aprovada: false, motivo: 'a branch homolog não existe' }
  if (ponta !== pedido.shaCandidato)
    return {
      aprovada: false,
      motivo: `o candidato ${curto(pedido.shaCandidato)} não é a ponta de homolog (${curto(ponta)})`,
    }

  const execucoes = (await api.execucoes(ARQUIVO_HOMOLOG, { sha: ponta, agendadas: true })).filter(
    (e) => e.caminho === ARQUIVO_HOMOLOG,
  )
  const portao = await temPortaoVerde(api, execucoes, ponta, ['push'])
  if (!portao)
    return { aprovada: false, motivo: `portão de homolog sem sucesso em ${curto(ponta)}` }

  if (!exigirNoturna)
    return {
      aprovada: true,
      motivo: `${curto(ponta)} é a ponta de homolog, com o portão verde (noturna informativa)`,
    }
  // Sem o workflow na main não há cron: a execução manual em homolog vale como a noturna (só na 1ª release).
  const eventosNoturna = (await api.portaoNaMain())
    ? ['schedule']
    : ['schedule', 'workflow_dispatch']
  if (!(await temPortaoVerde(api, execucoes, ponta, eventosNoturna)))
    return { aprovada: false, motivo: `rodada noturna sem sucesso em ${curto(ponta)}` }
  return {
    aprovada: true,
    motivo: `${curto(ponta)} é a ponta de homolog, com portão e noturna verdes`,
  }
}

async function decidirHotfix(api: Api, pedido: Pedido): Promise<Decisao> {
  const sha = curto(pedido.shaCandidato)
  const comparacao = await api.comparar('main', pedido.shaCandidato)
  if (comparacao === undefined)
    return { aprovada: false, motivo: `não foi possível comparar o hotfix ${sha} com a main` }
  if (comparacao.atras > 0)
    return {
      aprovada: false,
      motivo: `o hotfix precisa sair da ponta atual da main (está ${comparacao.atras} commit(s) atrás)`,
    }
  if (comparacao.aFrente < 1 || comparacao.aFrente > MAX_COMMITS_HOTFIX)
    return {
      aprovada: false,
      motivo: `hotfix com ${comparacao.aFrente} commit(s) novo(s); o limite é ${MAX_COMMITS_HOTFIX} (conteúdo grande vai por homolog)`,
    }

  const ci = (
    await api.execucoes(ARQUIVO_CI, { sha: pedido.shaCandidato, agendadas: false })
  ).filter(
    (e) => e.caminho === ARQUIVO_CI && e.evento === 'pull_request' && e.sha === pedido.shaCandidato,
  )
  if (ci.length === 0)
    return {
      aprovada: false,
      motivo: `a suíte completa do CI não está verde em ${sha} (reexecute este check depois dela)`,
    }
  return {
    aprovada: true,
    motivo: `hotfix ${sha}: ${comparacao.aFrente} commit(s) sobre a ponta da main, com o CI completo verde`,
    aviso: 'HOTFIX sem soak em homolog: vale a aprovação do usuário',
  }
}

/** O job `portao <sha>` só fecha em sucesso se todos os jobs de código (ou o docs:check) passaram. */
async function temPortaoVerde(
  api: Api,
  execucoes: Execucao[],
  sha: string,
  eventos: string[],
): Promise<boolean> {
  for (const e of execucoes) {
    if (!eventos.includes(e.evento)) continue
    if (e.evento !== 'schedule' && (e.branch !== 'homolog' || e.sha !== sha)) continue
    if ((await api.jobsComSucesso(e.id)).includes(`portao ${sha}`)) return true
  }
  return false
}

function curto(sha: string): string {
  return sha.slice(0, 7)
}
