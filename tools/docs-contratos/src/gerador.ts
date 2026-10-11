import { aplicarBloco, extrairBloco, type Modelo } from './blocos.ts'
import { montarContextos, renderAgregados } from './dominio.ts'
import { avaliarFotografias, contratosAceitos, type EntradaFotografia } from './fotografias.ts'
import {
  caminhoFotografia,
  modeloIndiceMetricas,
  modeloMetrica,
  renderIndiceMetricas,
  renderMetrica,
  type InsumoMetrica,
} from './metricas.ts'

export interface Io {
  /** Conteúdo do arquivo (caminho relativo à raiz) ou `undefined` se não existe. */
  ler(caminho: string): string | undefined
  escrever(caminho: string, texto: string): void
  /** Arquivos sob a pasta (recursivo), caminhos relativos à raiz com `/`. */
  listar(pasta: string): string[]
  existe(caminho: string): boolean
}

export type EventoInsumo = { tipo: string; schema: unknown }
export type Insumos = {
  metricas: InsumoMetrica[]
  eventos: EventoInsumo[]
  /** Caminhos do OpenAPI sob `/api/v2/`. */
  caminhosV2: string[]
}

export const PASTA_METRICAS = 'docs/contratos/metricas'
export const PASTA_DOMINIO = 'docs/especificacao/domain'
export const ARQUIVO_AGREGADOS = 'docs/architecture/ddd/03-agregados.md'
export const ARQUIVO_ACEITAS = 'docs/contratos/snapshots/aceitas.json'

const MODELO_AGREGADOS: Modelo = {
  titulo: 'Agregados e entidades por contexto',
  proposito:
    'mostrar, por contexto, os agregados, entidades e objetos de valor do Modelo de Domínio, sem repetir atributos.',
  publico: 'time e agentes de IA.',
}

export type Alvo = { caminho: string; modelo: Modelo; bloco: string }

/** Lê `docs/especificacao/domain/<contexto>/<nome>.md` (ignora README e arquivos fora do padrão). */
function arquivosDoDominio(io: Io): Record<string, string> {
  const saida: Record<string, string> = {}
  for (const caminho of io.listar(PASTA_DOMINIO)) {
    const relativo = caminho.slice(PASTA_DOMINIO.length + 1)
    if (/^[\w-]+\/[\w-]+\.md$/.test(relativo)) saida[relativo] = io.ler(caminho) as string
  }
  return saida
}

/** Todas as páginas com bloco gerado e o texto do bloco. */
export function alvosGerados(io: Io, insumos: Insumos): Alvo[] {
  const metricas = insumos.metricas.map((m) => ({
    caminho: `${PASTA_METRICAS}/${m.id}.md`,
    modelo: modeloMetrica(m.id),
    bloco: renderMetrica(m),
  }))
  return [
    ...metricas,
    {
      caminho: `${PASTA_METRICAS}/README.md`,
      modelo: modeloIndiceMetricas,
      bloco: renderIndiceMetricas(insumos.metricas),
    },
    {
      caminho: ARQUIVO_AGREGADOS,
      modelo: MODELO_AGREGADOS,
      bloco: renderAgregados(montarContextos(arquivosDoDominio(io))),
    },
  ]
}

/** Grava as páginas cujo bloco mudou (ou que não existem). Devolve os caminhos gravados. */
export function gravarGerados(io: Io, insumos: Insumos, hoje: string): string[] {
  const gravados: string[] = []
  for (const a of alvosGerados(io, insumos)) {
    const existente = io.ler(a.caminho)
    const novo = aplicarBloco(existente, a.modelo, a.bloco, hoje)
    if (novo !== existente) {
      io.escrever(a.caminho, novo)
      gravados.push(a.caminho)
    }
  }
  return gravados
}

/** Páginas ausentes, sem marcas ou com o bloco diferente do que o código gera agora. */
export function conferirGerados(io: Io, insumos: Insumos): string[] {
  const problemas: string[] = []
  for (const a of alvosGerados(io, insumos)) {
    const existente = io.ler(a.caminho)
    if (existente === undefined)
      problemas.push(`${a.caminho}: página gerada ausente; rode \`pnpm run docs:gerar\``)
    else if (extrairBloco(existente) === undefined)
      problemas.push(`${a.caminho}: sem as marcas de bloco gerado`)
    else if (extrairBloco(existente) !== a.bloco)
      problemas.push(`${a.caminho}: desatualizada; rode \`pnpm run docs:gerar\``)
  }
  return problemas
}

const serializar = (schema: unknown): string => `${JSON.stringify(schema, null, 2)}\n`

function entradasFotografia(io: Io, insumos: Insumos): EntradaFotografia[] {
  const lerFoto = (grupo: 'resultados' | 'eventos', nome: string): unknown => {
    const texto = io.ler(caminhoFotografia(grupo, nome))
    return texto === undefined ? undefined : JSON.parse(texto)
  }
  return [
    ...insumos.metricas.map((m) => ({
      grupo: 'resultados',
      nome: m.id,
      atual: m.schema,
      fotografia: lerFoto('resultados', m.id),
    })),
    ...insumos.eventos.map((e) => ({
      grupo: 'eventos',
      nome: e.tipo,
      atual: e.schema,
      fotografia: lerFoto('eventos', e.tipo),
    })),
  ]
}

function aceitos(io: Io, insumos: Insumos): Set<string> {
  return contratosAceitos(
    io.ler(ARQUIVO_ACEITAS),
    insumos.caminhosV2,
    insumos.eventos.map((e) => e.tipo),
  )
}

/** Compatibilidade entre os schemas atuais e as fotografias versionadas. */
export function conferirFotografias(io: Io, insumos: Insumos): string[] {
  return avaliarFotografias(entradasFotografia(io, insumos), aceitos(io, insumos)).problemas
}

/**
 * Regrava as fotografias com os schemas atuais. Recusa se houver mudança incompatível não aceita: o aceite
 * (aceitas.json ou rota/tipo v2) vem antes, para a fotografia nova nunca esconder uma quebra.
 */
export function fotografar(io: Io, insumos: Insumos): { problemas: string[]; gravadas: string[] } {
  const entradas = entradasFotografia(io, insumos)
  const bloqueios = avaliarFotografias(
    entradas.filter((e) => e.fotografia !== undefined),
    aceitos(io, insumos),
  ).problemas.filter((p) => p.includes('INCOMPATÍVEL'))
  if (bloqueios.length > 0) return { problemas: bloqueios, gravadas: [] }
  const gravadas: string[] = []
  for (const e of entradas) {
    const caminho = caminhoFotografia(e.grupo as 'resultados' | 'eventos', e.nome)
    const texto = serializar(e.atual)
    if (io.ler(caminho) !== texto) {
      io.escrever(caminho, texto)
      gravadas.push(caminho)
    }
  }
  return { problemas: [], gravadas }
}
