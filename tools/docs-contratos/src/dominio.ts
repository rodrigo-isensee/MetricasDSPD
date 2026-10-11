import { lerFrontmatter, type Mapa, type Valor } from './frontmatter.ts'
import { MAX_NOS_BLOCO } from './mermaid.ts'
import { grupo } from './util.ts'

export type Relacao = { alvo: string; tipo: string; cardinalidade: string; papel: string }
export type Elemento = {
  contexto: string
  id: string
  tipo: string
  agregado: string
  relacoes: Relacao[]
  operacoes: string[]
}
export type Contexto = {
  id: string
  estrategico: string
  descricao: string
  elementos: Elemento[]
  enumeracoes: string[]
}

const TIPOS_DESENHADOS = ['aggregate-root', 'entity', 'value-object', 'domain-service']
const NOME_CONTEXTO: Record<string, string> = {
  flow: 'Fluxo',
  support: 'Sustentação',
  metrics: 'Métricas',
  collection: 'Coleta',
  reference: 'Referência',
}
const ROTULO_ESTRATEGICO: Record<string, string> = { core: 'núcleo', supporting: 'suporte' }
const ROTULO_TIPO: Record<string, string> = {
  'aggregate-root': 'raiz de agregado',
  entity: 'entidade',
  'value-object': 'objeto de valor',
  'domain-service': 'serviço de domínio',
}
const ROTULO_RELACAO: Record<string, string> = { composition: 'compõe', reference: 'referencia' }
const rotuloTipo = (tipo: string): string => ROTULO_TIPO[tipo] as string
const SETA: Record<string, string> = { composition: '*--', reference: '-->' }

const texto = (v: Valor | undefined): string => (typeof v === 'string' ? v : '')
const lista = (v: Valor | undefined): Valor[] => (Array.isArray(v) ? v : [])

/** `card-lifecycle-event` -> `CardLifecycleEvent` (identificador Mermaid). */
export const paraClasse = (id: string): string =>
  id
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('')
/** `project-milestones` -> `projectMilestones`. */
export const paraMetodo = (id: string): string => {
  const c = paraClasse(id)
  return c.charAt(0).toLowerCase() + c.slice(1)
}

function descricaoDe(corpo: string): string {
  const m = /## Description\s*\n+([^\n]+)/.exec(corpo)
  return m === null ? '' : grupo(m, 1).trim()
}

function elementoDe(contexto: string, id: string, dados: Mapa): Elemento {
  return {
    contexto,
    id,
    tipo: texto(dados['type']),
    agregado: texto(dados['aggregate']),
    relacoes: lista(dados['relationships']).map((r) => {
      const mapa = r as Mapa
      return {
        alvo: texto(mapa['target']),
        tipo: texto(mapa['type']),
        cardinalidade: texto(mapa['cardinality']),
        papel: texto(mapa['role']),
      }
    }),
    operacoes: lista(dados['operations']).map((o) => texto(o)),
  }
}

/**
 * Monta os contextos a partir dos arquivos de `docs/especificacao/domain/` (chave: `<contexto>/<nome>.md`).
 * Núcleo antes de suporte, depois por id. Enumerações só entram como lista de nomes (não são desenhadas).
 */
export function montarContextos(arquivos: Record<string, string>): Contexto[] {
  const mapa = new Map<string, Contexto>()
  const obter = (id: string): Contexto => {
    let c = mapa.get(id)
    if (c === undefined) {
      c = { id, estrategico: '', descricao: '', elementos: [], enumeracoes: [] }
      mapa.set(id, c)
    }
    return c
  }
  for (const [caminho, conteudo] of Object.entries(arquivos).sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    const [ctx, arquivo] = caminho.split('/') as [string, string]
    const { dados, corpo } = lerFrontmatter(conteudo)
    const contexto = obter(ctx)
    const id = arquivo.replace(/\.md$/, '')
    if (id === '_context') {
      contexto.estrategico = texto(dados['strategic'])
      contexto.descricao = descricaoDe(corpo)
    } else if (texto(dados['type']) === 'enumeration') {
      contexto.enumeracoes.push(id)
    } else {
      contexto.elementos.push(elementoDe(ctx, id, dados))
    }
  }
  const ordem = (c: Contexto): number => (c.estrategico === 'core' ? 0 : 1)
  return [...mapa.values()].sort((a, b) => ordem(a) - ordem(b) || a.id.localeCompare(b.id))
}

const desenhado = (e: Elemento): boolean => TIPOS_DESENHADOS.includes(e.tipo)

/** Grupos de elementos para os diagramas: um por contexto; se passar de 15 nós, um por agregado. */
export function gruposDeDiagrama(c: Contexto): { titulo: string; elementos: Elemento[] }[] {
  const nos = c.elementos.filter(desenhado)
  if (nos.length <= MAX_NOS_BLOCO)
    return [{ titulo: `Contexto ${NOME_CONTEXTO[c.id] ?? c.id}`, elementos: nos }]
  const grupos = nos
    .filter((e) => e.tipo === 'aggregate-root')
    .map((raiz) => ({
      titulo: `Agregado ${paraClasse(raiz.id)} (contexto ${NOME_CONTEXTO[c.id] ?? c.id})`,
      elementos: nos.filter((e) => e.id === raiz.id || e.agregado === raiz.id),
    }))
  const soltos = nos.filter(
    (e) =>
      e.tipo !== 'aggregate-root' &&
      !nos.some((r) => r.tipo === 'aggregate-root' && r.id === e.agregado),
  )
  return soltos.length === 0
    ? grupos
    : [
        ...grupos,
        { titulo: `Demais elementos (contexto ${NOME_CONTEXTO[c.id] ?? c.id})`, elementos: soltos },
      ]
}

function classDiagram(elementos: Elemento[]): string {
  const ids = new Set(elementos.map((e) => e.id))
  const linhas = ['classDiagram']
  for (const e of elementos) {
    linhas.push(`  class ${paraClasse(e.id)} {`, `    <<${e.tipo}>>`)
    for (const o of e.operacoes) linhas.push(`    +${paraMetodo(o)}()`)
    linhas.push('  }')
  }
  for (const e of elementos) {
    for (const r of e.relacoes.filter((x) => ids.has(x.alvo))) {
      const rotulo = [r.cardinalidade, r.papel].filter((p) => p !== '').join(' ')
      linhas.push(
        `  ${paraClasse(e.id)} ${SETA[r.tipo] ?? '..>'} ${paraClasse(r.alvo)} : ${rotulo}`,
      )
    }
  }
  return linhas.join('\n')
}

const frase = (r: Relacao): string =>
  `${ROTULO_RELACAO[r.tipo] ?? r.tipo} ${paraClasse(r.alvo)} (${r.cardinalidade}${r.papel === '' ? '' : `, ${r.papel}`})`

function alternativa(elementos: Elemento[]): string[] {
  return elementos.map((e) => {
    const ops =
      e.operacoes.length === 0 ? '' : `; operações: ${e.operacoes.map(paraMetodo).join(', ')}`
    const rels =
      e.relacoes.length === 0 ? 'sem relações declaradas' : e.relacoes.map(frase).join('; ')
    return `- ${paraClasse(e.id)} (${rotuloTipo(e.tipo)}): ${rels}${ops}.`
  })
}

const CELULA_VAZIA = '-'
const codigo = (ids: string[]): string =>
  ids.length === 0 ? CELULA_VAZIA : ids.map((i) => `\`${i}\``).join(', ')

/** Bloco Markdown de `03-agregados.md`: por contexto, tabela e diagrama(s) de classes com título, legenda e lista. */
export function renderAgregados(contextos: Contexto[]): string {
  const saida: string[] = [
    'Gerado de `docs/especificacao/domain/**` por `pnpm run docs:gerar`; não edite entre as marcas. Atributos, enumerações e regras ficam no Siegard (link em cada contexto).',
    '',
  ]
  for (const c of contextos) {
    const nome = NOME_CONTEXTO[c.id] ?? c.id
    saida.push(
      `## ${nome} (\`${c.id}\`, ${ROTULO_ESTRATEGICO[c.estrategico] ?? c.estrategico})`,
      '',
      `${c.descricao === '' ? '' : `${c.descricao} `}Origem: [\`_context.md\`](../../especificacao/domain/${c.id}/_context.md).`,
      '',
      '| Elemento | Tipo | Agregado | Relações | Operações |',
      '|---|---|---|---|---|',
    )
    for (const e of c.elementos.filter(desenhado)) {
      const rels = e.relacoes.length === 0 ? CELULA_VAZIA : e.relacoes.map(frase).join('; ')
      saida.push(
        `| [\`${e.id}\`](../../especificacao/domain/${c.id}/${e.id}.md) | ${rotuloTipo(e.tipo)} | ${e.agregado === '' ? CELULA_VAZIA : `\`${e.agregado}\``} | ${rels} | ${codigo(e.operacoes)} |`,
      )
    }
    saida.push(
      '',
      c.enumeracoes.length === 0
        ? 'Enumerações: nenhuma.'
        : `Enumerações (${c.enumeracoes.length}, não desenhadas): ${codigo(c.enumeracoes)}.`,
      '',
    )
    for (const g of gruposDeDiagrama(c)) {
      saida.push(
        `### ${g.titulo}: classes e relações`,
        '```mermaid',
        classDiagram(g.elementos),
        '```',
        '',
        'Legenda: cada retângulo é uma classe do modelo e o estereótipo `<<...>>` diz o tipo (raiz de agregado, entidade, objeto de valor ou serviço de domínio); `*--` é composição (a parte não vive sem o todo) e `-->` é referência; o texto da seta é a cardinalidade.',
        '',
        '<details open>',
        '<summary>Alternativa em lista</summary>',
        '',
        ...alternativa(g.elementos),
        '</details>',
        '',
      )
    }
  }
  return saida.join('\n').replace(/\n+$/, '')
}
