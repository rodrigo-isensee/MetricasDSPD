import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { listarNos } from './nos.ts'
import { citacoesPorArquivo } from './testes.ts'
import { lerTrace } from './trace.ts'

export type Resultado = { codigo: 0 | 1; linhas: string[] }

const ESPECIFICACAO = 'docs/especificacao'
const TRACE = 'siegard-trace.json'

/** Confere especificação, `siegard-trace.json` e nomes dos testes. Não recalcula digests (isso é do plugin, local). */
export function conferir(raiz: string): Resultado {
  const pasta = join(raiz, ESPECIFICACAO)
  const trace = join(raiz, TRACE)
  if (!existsSync(pasta)) {
    return {
      codigo: 0,
      linhas: [`spec-check: sem ${ESPECIFICACAO}; nada a conferir (fase ainda não existe).`],
    }
  }
  if (!existsSync(trace)) {
    return {
      codigo: 0,
      linhas: [`spec-check: sem ${TRACE} na raiz; nada a conferir (nenhuma ligação feita ainda).`],
    }
  }

  const nos = new Set(listarNos(pasta))
  const citacoes = citacoesPorArquivo(raiz)
  const leitura = lerTrace(readFileSync(trace, 'utf8'))
  const problemas = [...leitura.problemas]

  const citados = new Set<string>()
  for (const [arquivo, ids] of citacoes) {
    for (const id of ids) {
      citados.add(id)
      if (!nos.has(id)) problemas.push(`citação sem nó: ${arquivo} cita ${id}`)
    }
  }

  const ligados = new Map<string, string[]>()
  for (const { no, arquivos } of leitura.ligacoes) {
    ligados.set(no, arquivos)
    if (!nos.has(no)) problemas.push(`nó ligado inexistente: ${no}`)
    for (const arquivo of arquivos) {
      if (!existsSync(join(raiz, arquivo))) {
        problemas.push(`arquivo ligado inexistente: ${arquivo} (nó ${no})`)
      } else if (!citacoes.get(arquivo)?.includes(no)) {
        problemas.push(`ligação sem citação: ${arquivo} não cita ${no}`)
      }
    }
  }

  for (const [arquivo, ids] of citacoes) {
    for (const id of ids) {
      if (nos.has(id) && ligados.get(id)?.includes(arquivo) !== true) {
        problemas.push(
          `citação sem ligação: ${arquivo} cita ${id}, que não está ligado a ele no ${TRACE}`,
        )
      }
    }
  }

  for (const no of nos) {
    if (!citados.has(no) && (ligados.get(no)?.length ?? 0) === 0)
      problemas.push(`nó sem teste: ${no}`)
  }

  if (problemas.length === 0) {
    return {
      codigo: 0,
      linhas: [`spec-check: ok (${nos.size} nós, cada um com teste ligado e citado).`],
    }
  }
  return { codigo: 1, linhas: [...problemas, `spec-check: ${problemas.length} problema(s).`] }
}
