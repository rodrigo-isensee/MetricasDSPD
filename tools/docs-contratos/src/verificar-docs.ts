import { posix } from 'node:path'
import { em, grupo } from './util.ts'
import { contarNos, extrairBlocos, MAX_NOS_BLOCO } from './mermaid.ts'

export type EntradaDocs = {
  /** Markdown de `docs/` (e `README.md`/`CLAUDE.md` da raiz, só como origem de links). Chave: caminho relativo à raiz. */
  arquivos: ReadonlyMap<string, string>
  /** Arquivo ou pasta existe (caminho relativo à raiz). */
  existe: (caminho: string) => boolean
  escopo: Escopo
}

export type Escopo = {
  /** Prefixos (ou arquivos) onde valem cabeçalho, órfãos e Mermaid. */
  estrito: readonly string[]
  /** Arquivos do escopo estrito dispensados das três regras (com motivo no código que chama). */
  isentos: readonly string[]
  /** Prefixos fora de qualquer regra de página (reviews, atas, quadro). */
  excluidos: readonly string[]
}

const FORA_DAS_REGRAS = [
  'docs/reviews/',
  'docs/qa/bugs/',
  'docs/alinhamentos/',
  'docs/kanban/',
  'docs/retrospectivas/',
  // Proposta arquivada ("não vale"): é preservada, não corrigida.
  'docs/architecture/propostas/',
]

export const ESCOPO_PADRAO: Escopo = {
  estrito: ['docs/contratos/', 'docs/architecture/ddd/', 'docs/README.md'],
  isentos: [],
  excluidos: FORA_DAS_REGRAS,
}

const casa = (caminho: string, lista: readonly string[]): boolean =>
  lista.some((p) => (p.endsWith('/') ? caminho.startsWith(p) : caminho === p))

const semBlocos = (texto: string): string => {
  let dentro = false
  return texto
    .split(/\r?\n/)
    .map((l) => {
      if (/^\s*```/.test(l)) {
        dentro = !dentro
        return ''
      }
      return dentro ? '' : l
    })
    .join('\n')
}
const semCodigo = (texto: string): string => semBlocos(texto).replace(/`[^`\n]*`/g, '')

/** Âncora no estilo GitHub: minúsculas, sem pontuação, espaços viram hífen; repetidos ganham sufixo -N. */
export function ancoras(texto: string): Set<string> {
  const vistas = new Map<string, number>()
  const saida = new Set<string>()
  for (const linha of semBlocos(texto).split('\n')) {
    const m = /^#{1,6}\s+(.+?)\s*#*$/.exec(linha)
    if (m === null) continue
    const base = grupo(m, 1)
      .replace(/[*_`[\]]/g, '')
      .toLowerCase()
      .replace(/[^\p{L}\p{N} _-]/gu, '')
      .replace(/ /g, '-')
    const n = vistas.get(base) ?? 0
    vistas.set(base, n + 1)
    saida.add(n === 0 ? base : `${base}-${n}`)
  }
  return saida
}

const LINK = /\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g
const EXTERNO = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i

type Destino = { caminho: string; ancora: string }

/** Links relativos de um arquivo (fora de blocos e trechos de código), já resolvidos a partir da raiz. */
export function linksRelativos(arquivo: string, texto: string): Destino[] {
  const saida: Destino[] = []
  for (const m of semCodigo(texto).matchAll(LINK)) {
    const alvo = grupo(m, 1)
    if (EXTERNO.test(alvo)) continue
    const corte = alvo.indexOf('#')
    const ref = corte === -1 ? alvo : alvo.slice(0, corte)
    const ancora = corte === -1 ? '' : alvo.slice(corte + 1)
    const caminho =
      ref === ''
        ? arquivo
        : posix.normalize(posix.join(posix.dirname(arquivo), decodeURI(em(ref.split('?'), 0))))
    saida.push({ caminho: caminho.replace(/\/$/, ''), ancora })
  }
  return saida
}

export function verificarLinks(e: EntradaDocs): string[] {
  const problemas: string[] = []
  for (const [arquivo, texto] of e.arquivos) {
    if (!arquivo.startsWith('docs/') || casa(arquivo, e.escopo.excluidos)) continue
    for (const d of linksRelativos(arquivo, texto)) {
      if (!e.existe(d.caminho)) {
        problemas.push(`${arquivo}: link quebrado para ${d.caminho}`)
      } else if (d.ancora !== '' && d.caminho.endsWith('.md')) {
        const destino = e.arquivos.get(d.caminho)
        if (destino !== undefined && !ancoras(destino).has(decodeURI(d.ancora).toLowerCase())) {
          problemas.push(`${arquivo}: âncora inexistente #${d.ancora} em ${d.caminho}`)
        }
      }
    }
  }
  return problemas
}

const estaNoEscopo = (arquivo: string, e: EntradaDocs): boolean =>
  casa(arquivo, e.escopo.estrito) &&
  !casa(arquivo, e.escopo.isentos) &&
  !casa(arquivo, e.escopo.excluidos)

/** Propósito, público e data de revisão (AAAA-MM-DD) nas 5 primeiras linhas. */
export function verificarCabecalho(e: EntradaDocs): string[] {
  const problemas: string[] = []
  for (const [arquivo, texto] of e.arquivos) {
    if (!estaNoEscopo(arquivo, e)) continue
    const topo = texto.split(/\r?\n/).slice(0, 5).join('\n').replace(/[*_]/g, '')
    const faltam = [
      ['propósito', /Propósito\s*:/i],
      ['público', /Público\s*:/i],
      ['data de revisão (AAAA-MM-DD)', /Revisão\s*:\s*\d{4}-\d{2}-\d{2}/i],
    ]
      .filter(([, re]) => !(re as RegExp).test(topo))
      .map(([nome]) => nome as string)
    if (faltam.length > 0)
      problemas.push(`${arquivo}: cabeçalho sem ${faltam.join(', ')} nas 5 primeiras linhas`)
  }
  return problemas
}

/** Página do escopo sem nenhum link vindo de outra página (docs/ ou README/CLAUDE da raiz). */
export function verificarOrfaos(e: EntradaDocs): string[] {
  const recebe = new Set<string>()
  for (const [arquivo, texto] of e.arquivos) {
    for (const d of linksRelativos(arquivo, texto)) if (d.caminho !== arquivo) recebe.add(d.caminho)
  }
  return [...e.arquivos.keys()]
    .filter(
      (a) =>
        estaNoEscopo(a, e) &&
        a !== 'docs/README.md' &&
        !recebe.has(a) &&
        !recebe.has(posix.dirname(a)),
    )
    .map((a) => `${a}: página órfã (nenhuma outra página linka para ela)`)
}

const prox = (linhas: string[]): string => linhas.find((l) => l.trim() !== '') ?? ''
const ultima = (linhas: string[]): string =>
  [...linhas].reverse().find((l) => l.trim() !== '') ?? ''

/** Todo bloco mermaid: título `###` logo acima, legenda logo abaixo, alternativa em lista e até 15 nós. */
export function verificarMermaid(e: EntradaDocs): string[] {
  const problemas: string[] = []
  for (const [arquivo, texto] of e.arquivos) {
    if (!estaNoEscopo(arquivo, e)) continue
    for (const b of extrairBlocos(arquivo, texto)) {
      const onde = `${arquivo}:${b.linha}`
      if (!/^###\s+\S/.test(ultima(b.antes)))
        problemas.push(`${onde}: diagrama sem título (### imediatamente acima)`)
      if (!/^\**Legenda/i.test(prox(b.depois).trim()))
        problemas.push(`${onde}: diagrama sem legenda logo abaixo`)
      const depoisDaLegenda = b.depois.join('\n')
      const detalhes = /<details[^>]*>[\s\S]*?<\/details>/.exec(depoisDaLegenda)?.[0] ?? ''
      if (!/<summary>[^<]*<\/summary>/.test(detalhes) || !/^\s*- \S/m.test(detalhes)) {
        problemas.push(`${onde}: diagrama sem alternativa em lista (<details> com itens "- ")`)
      }
      const nos = contarNos(b.codigo)
      if (nos > MAX_NOS_BLOCO)
        problemas.push(`${onde}: diagrama com ${nos} nós (máximo ${MAX_NOS_BLOCO})`)
    }
  }
  return problemas
}

export function verificarDocs(e: EntradaDocs): string[] {
  return [
    ...verificarLinks(e),
    ...verificarCabecalho(e),
    ...verificarOrfaos(e),
    ...verificarMermaid(e),
  ]
}
