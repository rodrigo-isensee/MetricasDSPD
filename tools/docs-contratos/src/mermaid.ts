import { em, grupo } from './util.ts'

export type BlocoMermaid = {
  arquivo: string
  /** Linha (base 1) da cerca de abertura. */
  linha: number
  codigo: string
  /** Linhas depois da cerca de fechamento (para legenda e alternativa). */
  depois: string[]
  /** Linhas antes da cerca de abertura (para o título). */
  antes: string[]
}

const CERCA = /^\s*```/

/** Extrai os blocos ```mermaid de um arquivo Markdown, com o contexto de linhas ao redor. */
export function extrairBlocos(arquivo: string, texto: string): BlocoMermaid[] {
  const linhas = texto.split(/\r?\n/)
  const blocos: BlocoMermaid[] = []
  let i = 0
  while (i < linhas.length) {
    if (!CERCA.test(em(linhas, i))) {
      i += 1
      continue
    }
    const mermaid = /^\s*```mermaid\s*$/.test(em(linhas, i))
    const fim = linhas.findIndex((l, k) => k > i && CERCA.test(l))
    const fechamento = fim === -1 ? linhas.length : fim
    if (mermaid) {
      blocos.push({
        arquivo,
        linha: i + 1,
        codigo: linhas.slice(i + 1, fechamento).join('\n'),
        antes: linhas.slice(0, i),
        depois: linhas.slice(fechamento + 1),
      })
    }
    i = fechamento + 1
  }
  return blocos
}

const IDENT = /^[A-Za-z_][\w-]*/
const ARTE_SETA = /\s*(?:<?[-=.]{2,}[>xo]?|<[-=.]+)\s*/

function nosFluxo(linhas: string[]): Set<string> {
  const nos = new Set<string>()
  for (const bruta of linhas) {
    const linha = bruta.trim()
    if (/^(subgraph|end\b|classDef|class\s|style|linkStyle|direction|click|%%)/.test(linha))
      continue
    const limpa = linha
      .replace(/"[^"]*"/g, '')
      .replace(/\|[^|]*\|/g, ' ')
      .replace(/\[[^\]]*\]|\([^)]*\)|\{[^}]*\}/g, '')
      .replace(/\[|\(|\{|\]|\)|\}/g, '')
    for (const parte of limpa.split(ARTE_SETA).flatMap((p) => p.split('&'))) {
      const id = IDENT.exec(parte.trim())?.[0]
      if (id !== undefined) nos.add(id)
    }
  }
  return nos
}

function nosClasse(linhas: string[]): Set<string> {
  const nos = new Set<string>()
  let profundidade = 0
  for (const linha of linhas) {
    if (profundidade === 0) {
      const decl = /^\s*class\s+(\w+)/.exec(linha)
      if (decl !== null) nos.add(grupo(decl, 1))
      const rel = /^\s*(\w+)\s+(?:"[^"]*"\s+)?[<>|*o.-]{2,}\s+(?:"[^"]*"\s+)?(\w+)/.exec(linha)
      if (rel !== null && decl === null) {
        nos.add(grupo(rel, 1))
        nos.add(grupo(rel, 2))
      }
    }
    if (linha.includes('{')) profundidade += 1
    if (linha.includes('}')) profundidade -= 1
  }
  return nos
}

function nosSequencia(linhas: string[]): Set<string> {
  const nos = new Set<string>()
  for (const linha of linhas) {
    const decl = /^\s*(?:participant|actor)\s+(\w+)/.exec(linha)
    if (decl !== null) nos.add(grupo(decl, 1))
    const msg = /^\s*(\w+)\s*-{1,2}[>x)]{1,2}[+-]?\s*(\w+)/.exec(linha)
    if (msg !== null) {
      nos.add(grupo(msg, 1))
      nos.add(grupo(msg, 2))
    }
  }
  return nos
}

function nosEstado(linhas: string[]): Set<string> {
  const nos = new Set<string>()
  for (const linha of linhas) {
    const t = /^\s*([\w[\]*]+)\s*-->\s*([\w[\]*]+)/.exec(linha)
    if (t !== null) {
      for (const id of [grupo(t, 1), grupo(t, 2)]) if (id !== '[*]') nos.add(id)
    }
    const decl = /^\s*state\s+(?:"[^"]*"\s+as\s+)?(\w+)/.exec(linha)
    if (decl !== null) nos.add(grupo(decl, 1))
  }
  return nos
}

function nosEr(linhas: string[]): Set<string> {
  const nos = new Set<string>()
  for (const linha of linhas) {
    const ent = /^\s*(\w+)\s*\{/.exec(linha)
    if (ent !== null) nos.add(grupo(ent, 1))
    const rel = /^\s*(\w+)\s+[|}{o][|}{o]--[|}{o][|}{o]\s+(\w+)/.exec(linha)
    if (rel !== null) {
      nos.add(grupo(rel, 1))
      nos.add(grupo(rel, 2))
    }
  }
  return nos
}

/** Contagem aproximada de nós (classes, participantes, estados, entidades ou nós de fluxo) de um diagrama. */
export function contarNos(codigo: string): number {
  const [primeira = '', ...resto] = codigo.split('\n').filter((l) => l.trim() !== '')
  const tipo = em(primeira.trim().split(/\s+/), 0)
  if (tipo === 'flowchart' || tipo === 'graph') return nosFluxo(resto).size
  if (tipo === 'classDiagram') return nosClasse(resto).size
  if (tipo === 'sequenceDiagram') return nosSequencia(resto).size
  if (tipo.startsWith('stateDiagram')) return nosEstado(resto).size
  if (tipo === 'erDiagram') return nosEr(resto).size
  return 0
}

export const MAX_NOS_BLOCO = 15

export type ResultadoRender = { ok: boolean; erro: string }

/** Renderiza cada bloco com o executor informado (mermaid-cli) e devolve um problema por bloco inválido. */
export function renderizarBlocos(
  blocos: BlocoMermaid[],
  executar: (codigo: string) => ResultadoRender,
): string[] {
  const problemas: string[] = []
  for (const b of blocos) {
    const r = executar(b.codigo)
    if (!r.ok) problemas.push(`${b.arquivo}:${b.linha}: diagrama Mermaid não renderiza: ${r.erro}`)
  }
  return problemas
}
