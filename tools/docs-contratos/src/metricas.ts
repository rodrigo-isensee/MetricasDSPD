import type { Modelo } from './blocos.ts'

export type Parametro = { nome: string; tipo: string; obrigatorio: boolean; detalhe: string }
export type Cartao = { painel: string; id: string; rotulo: string; secao: string }
export type Regra = {
  dominio: string
  segmentacao: readonly string[]
  ordem: string
  incluiArquivados: unknown
  minimo: number
  minimoSobre: readonly string[]
  granularidade: string | readonly string[]
  refBriefing: string
  status: string
}
export type InsumoMetrica = {
  id: string
  rota: string
  parametros: Parametro[]
  /** Filtros que atuam na métrica (nomes de parâmetro); vazio = nenhum. */
  filtrosAplicaveis: readonly string[]
  /** Todos os filtros do domínio (para dizer o que NÃO atua). */
  filtrosDoDominio: readonly string[]
  regra: Regra | undefined
  cartoes: Cartao[]
  schema: unknown
  exemplo: unknown
}

const MAX_ITENS_EXEMPLO = 2
const celula = (t: string): string => t.replace(/\|/g, '\\|').replace(/\n/g, ' ')
const lista = (itens: readonly string[]): string =>
  itens.length === 0 ? 'nenhuma' : itens.join(', ')
export const caminhoFotografia = (grupo: 'resultados' | 'eventos', nome: string): string =>
  `docs/contratos/snapshots/${grupo}/${nome}.json`

const LARGURA_LINHA = 100

/** JSON indentado em que objetos e listas curtos (até 100 colunas) ficam numa linha só. */
export function jsonCompacto(valor: unknown, recuo = ''): string {
  const linha = JSON.stringify(valor)
  if (typeof valor !== 'object' || valor === null || recuo.length + linha.length <= LARGURA_LINHA)
    return linha
  const interno = `${recuo}  `
  if (Array.isArray(valor)) {
    return `[\n${valor.map((v) => interno + jsonCompacto(v, interno)).join(',\n')}\n${recuo}]`
  }
  const itens = Object.entries(valor).map(
    ([k, v]) => `${interno}${JSON.stringify(k)}: ${jsonCompacto(v, interno)}`,
  )
  return `{\n${itens.join(',\n')}\n${recuo}}`
}

/** Reduz listas longas para o exemplo caber na página; o resultado completo já foi validado pelo schema. */
export function truncar(valor: unknown, max: number = MAX_ITENS_EXEMPLO): unknown {
  if (Array.isArray(valor)) return valor.slice(0, max).map((v) => truncar(v, max))
  if (typeof valor === 'object' && valor !== null) {
    return Object.fromEntries(Object.entries(valor).map(([k, v]) => [k, truncar(v, max)]))
  }
  return valor
}

export const modeloMetrica = (id: string): Modelo => ({
  titulo: `Contrato da métrica ${id}`,
  proposito: `descrever a rota, os filtros, as regras de cálculo, o schema do resultado e um exemplo da métrica ${id}.`,
  publico: 'time (back-end, front-end, QA).',
})

export const modeloIndiceMetricas: Modelo = {
  titulo: 'Contratos por métrica: índice',
  proposito:
    'listar as métricas da API com domínio, rota, granularidade, mínimo de amostra e status das regras.',
  publico: 'time (back-end, front-end, QA, gestão).',
}

function secaoRegra(r: Regra | undefined): string[] {
  if (r === undefined) {
    return [
      'Sem entrada em `REGRAS_METRICA` (composição ou índice que apenas reexpõe outros resultados).',
    ]
  }
  const linhas = [
    '| Campo | Valor |',
    '|---|---|',
    `| Domínio | ${r.dominio} |`,
    `| Granularidade | ${lista(([] as readonly string[]).concat(r.granularidade))} |`,
    `| Segmentação permitida | ${lista(r.segmentacao)} |`,
    `| Ordem | ${r.ordem} |`,
    `| Inclui arquivados | ${String(r.incluiArquivados)} |`,
    `| Mínimo de amostra | ${r.minimo === 0 ? '0 (contagem, censo ou retrato: sem mínimo)' : `${r.minimo} itens por classe`} |`,
    `| Partes sob mínimo | ${lista(r.minimoSobre)} |`,
    `| Referência no briefing | ${celula(r.refBriefing)} |`,
    `| Status | ${r.status} |`,
  ]
  if (r.status === 'pendente-usuario') {
    linhas.push(
      '',
      'Status `pendente-usuario`: há célula de regra que o briefing não responde. Não se infere no código: é pergunta ao usuário (ver `docs/architecture/regras-metricas.md`).',
    )
  }
  return linhas
}

/** Bloco gerado da página de uma métrica. */
export function renderMetrica(m: InsumoMetrica): string {
  const naoAtuam = m.filtrosDoDominio.filter((f) => !m.filtrosAplicaveis.includes(f))
  const cartoes =
    m.cartoes.length === 0
      ? ['Nenhum cartão do catálogo usa esta métrica diretamente.']
      : m.cartoes.map(
          (c) => `- Painel \`${c.painel}\`, seção \`${c.secao}\`: ${c.rotulo} (\`${c.id}\`).`,
        )
  const parametros = m.parametros.map(
    (p) =>
      `| \`${p.nome}\` | ${celula(p.tipo)} | ${p.obrigatorio ? 'sim' : 'não'} | ${celula(p.detalhe)} |`,
  )
  return [
    'Gerado por `pnpm run docs:gerar` a partir do código e do OpenAPI; não edite entre as marcas.',
    '',
    '## Rota',
    '',
    `\`GET ${m.rota}\` (contrato completo de erros, cabeçalhos e cache: [http.md](../http.md); OpenAPI: [openapi.json](../../api/openapi.json)).`,
    '',
    '| Parâmetro | Tipo | Obrigatório | Detalhe |',
    '|---|---|---|---|',
    ...parametros,
    '',
    '## Filtros',
    '',
    `- Atuam nesta métrica: ${lista(m.filtrosAplicaveis)}.`,
    `- Não atuam: ${lista(naoAtuam)}.`,
    '',
    '## Regras de cálculo',
    '',
    ...secaoRegra(m.regra),
    '',
    '## Cartões que usam a métrica',
    '',
    ...cartoes,
    '',
    '## Schema do resultado',
    '',
    `JSON Schema gerado do Zod (\`SCHEMAS_RESULTADO.${m.id}\`); a fotografia versionada usada no teste de compatibilidade está em [\`${caminhoFotografia('resultados', m.id).replace('docs/contratos/', '../')}\`](${caminhoFotografia('resultados', m.id).replace('docs/contratos/', '../')}).`,
    '',
    '```json',
    jsonCompacto(m.schema),
    '```',
    '',
    '## Exemplo de resposta',
    '',
    `Resultado da base fictícia determinística (semente padrão), validado pelo schema acima. Listas com mais de ${MAX_ITENS_EXEMPLO} itens aparecem truncadas.`,
    '',
    '```json',
    jsonCompacto(truncar(m.exemplo)),
    '```',
  ].join('\n')
}

/** Bloco gerado do índice de métricas. */
export function renderIndiceMetricas(metricas: InsumoMetrica[]): string {
  const linhas = metricas.map((m) => {
    const r = m.regra
    const gran = r === undefined ? '-' : lista(([] as readonly string[]).concat(r.granularidade))
    const minimo = r === undefined ? '-' : String(r.minimo)
    const dominio = r === undefined ? 'composição' : r.dominio
    return `| [\`${m.id}\`](${m.id}.md) | ${celula(m.cartoes[0]?.rotulo ?? '-')} | ${dominio} | \`${m.rota}\` | ${gran} | ${minimo} | ${r?.status ?? '-'} |`
  })
  return [
    `Gerado por \`pnpm run docs:gerar\`. ${metricas.length} métricas, uma página cada. Regras gerais, erros e cache: [http.md](../http.md).`,
    '',
    '| Métrica | Nome | Domínio | Rota | Granularidade | Mínimo | Status das regras |',
    '|---|---|---|---|---|---|---|',
    ...linhas,
  ].join('\n')
}
