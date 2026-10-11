export type Ligacao = { no: string; arquivos: string[] }

export type LeituraDoTrace = { ligacoes: Ligacao[]; problemas: string[] }

function ehObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor)
}

/**
 * Lê só o que a conferência usa (nó e caminhos dos arquivos). Os digests são do plugin Siegard
 * (`trace.py --check`, local) e campos opcionais dele são tolerados e ignorados.
 */
export function lerTrace(texto: string): LeituraDoTrace {
  let dados: unknown
  try {
    dados = JSON.parse(texto)
  } catch {
    return { ligacoes: [], problemas: ['siegard-trace.json: JSON inválido'] }
  }
  if (!ehObjeto(dados) || !Array.isArray(dados['bindings'])) {
    return { ligacoes: [], problemas: ['siegard-trace.json: falta a lista "bindings"'] }
  }
  const ligacoes: Ligacao[] = []
  const problemas: string[] = []
  const vistos = new Set<string>()
  for (const item of dados['bindings'] as unknown[]) {
    if (!ehObjeto(item) || typeof item['node'] !== 'string' || !Array.isArray(item['files'])) {
      problemas.push('siegard-trace.json: ligação sem "node" ou sem "files"')
      continue
    }
    const no = item['node']
    if (vistos.has(no)) problemas.push(`siegard-trace.json: nó ligado duas vezes: ${no}`)
    vistos.add(no)
    const arquivos = (item['files'] as unknown[]).flatMap((arquivo) =>
      ehObjeto(arquivo) && typeof arquivo['path'] === 'string' ? [arquivo['path']] : [],
    )
    ligacoes.push({ no, arquivos })
  }
  return { ligacoes, problemas }
}
