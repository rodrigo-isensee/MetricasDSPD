import {
  conferirFotografias,
  conferirGerados,
  fotografar,
  gravarGerados,
  type Insumos,
  type Io,
} from './gerador.ts'
import { extrairBlocos, renderizarBlocos, type ResultadoRender } from './mermaid.ts'
import { ESCOPO_PADRAO, verificarDocs, type Escopo } from './verificar-docs.ts'

export type Resultado = { codigo: 0 | 1; linhas: string[] }
export type Deps = {
  io: Io
  insumos: () => Promise<Insumos>
  hoje: string
  /** Renderiza um bloco Mermaid (mermaid-cli); só o comando `mermaid` usa. */
  renderizar: (codigo: string) => ResultadoRender
  escopo?: Escopo
}

export const USO = 'uso: docs-contratos <gerar|check|fotografar|mermaid> [raiz]'

/** Markdown de docs/ mais README e CLAUDE da raiz (origem de links). */
export function lerMarkdown(io: Io): Map<string, string> {
  const mapa = new Map<string, string>()
  const candidatos = [
    ...io.listar('docs').filter((c) => c.endsWith('.md')),
    'README.md',
    'CLAUDE.md',
  ]
  for (const c of candidatos) {
    const texto = io.ler(c)
    if (texto !== undefined) mapa.set(c, texto)
  }
  return mapa
}

const resultado = (problemas: string[], ok: string): Resultado =>
  problemas.length === 0
    ? { codigo: 0, linhas: [ok] }
    : { codigo: 1, linhas: [...problemas, `docs-contratos: ${problemas.length} problema(s).`] }

/** Falha ao montar os insumos (exemplo fora do schema etc.) vira mensagem clara, sem stack trace. */
class FalhaInsumos extends Error {}
const carregar = async (deps: Deps): Promise<Insumos> => {
  try {
    return await deps.insumos()
  } catch (erro) {
    throw new FalhaInsumos(erro instanceof Error ? erro.message : String(erro))
  }
}

export async function executar(comando: string | undefined, deps: Deps): Promise<Resultado> {
  try {
    return await executarComando(comando, deps)
  } catch (erro) {
    if (erro instanceof FalhaInsumos)
      return { codigo: 1, linhas: [erro.message, 'docs-contratos: 1 problema(s).'] }
    throw erro
  }
}

async function executarComando(comando: string | undefined, deps: Deps): Promise<Resultado> {
  const { io } = deps
  if (comando === 'gerar') {
    const gravados = gravarGerados(io, await carregar(deps), deps.hoje)
    return {
      codigo: 0,
      linhas: [
        `docs:gerar: ${gravados.length} página(s) gravada(s).`,
        ...gravados.map((g) => `  ${g}`),
      ],
    }
  }
  if (comando === 'check') {
    const insumos = await carregar(deps)
    const arquivos = lerMarkdown(io)
    const problemas = [
      ...conferirGerados(io, insumos),
      ...conferirFotografias(io, insumos),
      ...verificarDocs({
        arquivos,
        existe: (c) => io.existe(c),
        escopo: deps.escopo ?? ESCOPO_PADRAO,
      }),
    ]
    return resultado(
      problemas,
      `docs:check: ok (${arquivos.size} páginas Markdown, ${insumos.metricas.length} métricas, ${insumos.eventos.length} eventos).`,
    )
  }
  if (comando === 'fotografar') {
    const r = fotografar(io, await carregar(deps))
    return r.problemas.length > 0
      ? resultado(r.problemas, '')
      : {
          codigo: 0,
          linhas: [
            `docs:fotografar: ${r.gravadas.length} fotografia(s) gravada(s).`,
            ...r.gravadas.map((g) => `  ${g}`),
          ],
        }
  }
  if (comando === 'mermaid') {
    const blocos = [...lerMarkdown(io)].flatMap(([arquivo, texto]) =>
      arquivo.startsWith('docs/') ? extrairBlocos(arquivo, texto) : [],
    )
    return resultado(
      renderizarBlocos(blocos, deps.renderizar),
      `docs:mermaid: ${blocos.length} diagrama(s) renderizado(s) sem erro.`,
    )
  }
  return { codigo: 1, linhas: [USO] }
}
