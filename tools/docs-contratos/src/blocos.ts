export const MARCA_INICIO = '<!-- gerado:inicio -->'
export const MARCA_FIM = '<!-- gerado:fim -->'

export type Modelo = { titulo: string; proposito: string; publico: string }

const REVISAO = /(Revisão:\**\s*)\d{4}-\d{2}-\d{2}/

/** Texto do bloco gerado (entre as marcas), ou `undefined` se a página não tem as duas marcas em ordem. */
export function extrairBloco(texto: string): string | undefined {
  const i = texto.indexOf(MARCA_INICIO)
  const f = texto.indexOf(MARCA_FIM)
  if (i === -1 || f === -1 || f < i) return undefined
  return texto
    .slice(i + MARCA_INICIO.length, f)
    .replace(/^\n/, '')
    .replace(/\n$/, '')
}

const embrulhar = (bloco: string): string => `${MARCA_INICIO}\n${bloco}\n${MARCA_FIM}`

/** Página nova: cabeçalho padrão (propósito, público, revisão) + bloco gerado. */
export function paginaNova(modelo: Modelo, bloco: string, hoje: string): string {
  return [
    `# ${modelo.titulo}`,
    '',
    `Propósito: ${modelo.proposito} Público: ${modelo.publico} Revisão: ${hoje}.`,
    '',
    embrulhar(bloco),
    '',
  ].join('\n')
}

/**
 * Grava o bloco gerado preservando o que está fora das marcas. Se o bloco mudou, atualiza a data de revisão
 * do cabeçalho. Página sem marcas é recusada: o gerador não sobrescreve texto escrito à mão.
 */
export function aplicarBloco(
  existente: string | undefined,
  modelo: Modelo,
  bloco: string,
  hoje: string,
): string {
  if (existente === undefined) return paginaNova(modelo, bloco, hoje)
  const atual = extrairBloco(existente)
  if (atual === undefined) throw new Error('página existente sem as marcas de bloco gerado')
  if (atual === bloco) return existente
  const i = existente.indexOf(MARCA_INICIO)
  const f = existente.indexOf(MARCA_FIM) + MARCA_FIM.length
  const novo = existente.slice(0, i) + embrulhar(bloco) + existente.slice(f)
  return novo.replace(REVISAO, `$1${hoje}`)
}
