export type Escopo = 'docs' | 'codigo'

const ARQUIVO_RAIZ_MD = /^[^/]+\.md$/

/** Documentação pura: só `docs/` e arquivos .md da raiz. Lista vazia conta como código (não há o que provar). */
export function classificarEscopo(arquivos: string[]): Escopo {
  const lista = arquivos.map((a) => a.trim()).filter((a) => a !== '')
  const soDocs =
    lista.length > 0 && lista.every((a) => a.startsWith('docs/') || ARQUIVO_RAIZ_MD.test(a))
  return soDocs ? 'docs' : 'codigo'
}
