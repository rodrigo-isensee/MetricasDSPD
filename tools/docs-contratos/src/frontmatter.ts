import { em, grupo } from './util.ts'

export type Valor = string | boolean | Valor[] | { [chave: string]: Valor }
export type Mapa = { [chave: string]: Valor }

type Linha = { recuo: number; texto: string }

const CHAVE = /^([\w-]+):(?: (.*))?$/

function escalar(bruto: string): string | boolean {
  const texto = bruto.trim()
  if (texto === 'true') return true
  if (texto === 'false') return false
  return /^(".*"|'.*')$/.test(texto) ? texto.slice(1, -1) : texto
}

/** Subconjunto de YAML usado no Siegard: mapas, listas de escalares e listas de mapas, por recuo. */
function lerLista(linhas: Linha[], inicio: number, recuo: number): [Valor[], number] {
  const lista: Valor[] = []
  let i = inicio
  while (
    i < linhas.length &&
    em(linhas, i).recuo === recuo &&
    em(linhas, i).texto.startsWith('- ')
  ) {
    const resto = em(linhas, i).texto.slice(2)
    if (CHAVE.test(resto)) {
      // item-mapa: a primeira chave está na linha do traço; as demais vêm 2 colunas à frente
      linhas[i] = { recuo: recuo + 2, texto: resto }
      const [mapa, proximo] = lerMapa(linhas, i, recuo + 2)
      lista.push(mapa)
      i = proximo
    } else {
      lista.push(escalar(resto))
      i += 1
    }
  }
  return [lista, i]
}

function lerMapa(linhas: Linha[], inicio: number, recuo: number): [Mapa, number] {
  const mapa: Mapa = {}
  let i = inicio
  while (i < linhas.length && em(linhas, i).recuo === recuo) {
    const m = CHAVE.exec(em(linhas, i).texto)
    if (m === null) throw new Error(`frontmatter: linha não reconhecida: ${em(linhas, i).texto}`)
    const chave = grupo(m, 1)
    const inline = m[2]
    i += 1
    if (inline !== undefined && inline !== '') {
      mapa[chave] = escalar(inline)
    } else if (i < linhas.length && em(linhas, i).recuo > recuo) {
      const filho = em(linhas, i)
      const [valor, proximo] = filho.texto.startsWith('- ')
        ? lerLista(linhas, i, filho.recuo)
        : lerMapa(linhas, i, filho.recuo)
      mapa[chave] = valor
      i = proximo
    } else {
      mapa[chave] = ''
    }
  }
  return [mapa, i]
}

/** Separa o frontmatter (entre os dois primeiros `---`) do corpo. Sem frontmatter: dados vazios. */
export function lerFrontmatter(texto: string): { dados: Mapa; corpo: string } {
  const linhas = texto.split(/\r?\n/)
  if (linhas[0] !== '---') return { dados: {}, corpo: texto }
  const fim = linhas.indexOf('---', 1)
  if (fim === -1) throw new Error('frontmatter: falta o --- de fechamento')
  const uteis: Linha[] = linhas
    .slice(1, fim)
    .filter((l) => l.trim() !== '' && !l.trim().startsWith('#'))
    .map((l) => ({ recuo: l.length - l.trimStart().length, texto: l.trim() }))
  const [dados, lidas] = lerMapa(uteis, 0, uteis[0]?.recuo ?? 0)
  if (lidas < uteis.length)
    throw new Error(`frontmatter: recuo inesperado em: ${em(uteis, lidas).texto}`)
  return { dados, corpo: linhas.slice(fim + 1).join('\n') }
}
