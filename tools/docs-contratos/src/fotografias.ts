import { createHash } from 'node:crypto'
import { z } from 'zod'

export type Classificacao = { compativeis: string[]; incompativeis: string[] }
type Json = { [chave: string]: unknown }

/** JSON Schema estável de um schema Zod (saída), sem `$schema`, com reutilizações inline. */
export function paraJsonSchema(schema: z.ZodType): Json {
  const { $schema: _, ...resto } = z.toJSONSchema(schema, {
    io: 'output',
    unrepresentable: 'any',
    reused: 'inline',
  }) as Json
  return resto
}

const ehObjeto = (v: unknown): v is Json => typeof v === 'object' && v !== null && !Array.isArray(v)

/** JSON canônico (chaves ordenadas): a comparação e o hash não dependem da ordem das chaves. */
export function canonico(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(canonico).join(',')}]`
  if (ehObjeto(v))
    return `{${Object.keys(v)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${canonico(v[k])}`)
      .join(',')}}`
  return JSON.stringify(v) ?? 'null'
}

function variantes(s: Json): unknown[] | undefined {
  const v = s['anyOf'] ?? s['oneOf']
  return Array.isArray(v) ? v : undefined
}

/** Palavras-chave que o classificador interpreta uma a uma. Qualquer outra é comparada por igualdade. */
const ESTRUTURAIS = new Set([
  'type',
  'const',
  'enum',
  'items',
  'prefixItems',
  'properties',
  'required',
  'additionalProperties',
  'anyOf',
  'oneOf',
])
/** Anotações sem efeito na validação: mudar não quebra consumidor (a fotografia só fica desatualizada). */
const ANOTACOES = new Set(['description', 'title', 'examples', '$comment'])

/**
 * Classifica a mudança entre duas fotografias de JSON Schema (resultado de métrica ou payload de evento), na SAÍDA.
 * Lista fechada do que é compatível: campo novo OPCIONAL e anotação (`description`, `title`, `examples`).
 * Todo o resto é incompatível, em particular: remoção ou renomeação de campo, troca de tipo, campo novo obrigatório,
 * campo obrigatório que vira opcional (e o inverso), valor de enum removido OU novo, variante de união mudada,
 * `additionalProperties` (strict/passthrough, tipo do valor de `record`), `prefixItems` (tupla) e qualquer outra
 * palavra-chave (`pattern`, `format`, `minimum`, `maximum`, `maxItems`, `minLength`...).
 * Decisão conservadora: valor novo de enum e opcional que vira obrigatório não estão na política (§2); até o texto
 * decidir, contam como incompatíveis.
 */
export function classificar(antigo: unknown, novo: unknown, caminho = '$'): Classificacao {
  const r: Classificacao = { compativeis: [], incompativeis: [] }
  const nova = (c: string[], msg: string): void => {
    c.push(`${caminho}: ${msg}`)
  }
  if (!ehObjeto(antigo) || !ehObjeto(novo)) {
    if (canonico(antigo) !== canonico(novo)) nova(r.incompativeis, 'schema mudou de forma')
    return r
  }
  for (const k of new Set([...Object.keys(antigo), ...Object.keys(novo)])) {
    if (ESTRUTURAIS.has(k) || ANOTACOES.has(k)) continue
    if (canonico(antigo[k]) !== canonico(novo[k]))
      nova(
        r.incompativeis,
        `palavra-chave ${k} mudou de ${canonico(antigo[k])} para ${canonico(novo[k])}`,
      )
  }
  const va = variantes(antigo)
  const vn = variantes(novo)
  if (va !== undefined || vn !== undefined) {
    if (va === undefined || vn === undefined || va.length !== vn.length) {
      nova(r.incompativeis, 'variantes da união mudaram')
      return r
    }
    va.forEach((item, i) => juntar(r, classificar(item, vn[i], `${caminho}[${i}]`)))
    return r
  }
  if (canonico(antigo['type']) !== canonico(novo['type'])) {
    nova(
      r.incompativeis,
      `tipo mudou de ${canonico(antigo['type'])} para ${canonico(novo['type'])}`,
    )
    return r
  }
  if ('const' in antigo || 'const' in novo) {
    if (canonico(antigo['const']) !== canonico(novo['const']))
      nova(r.incompativeis, 'valor constante mudou')
    return r
  }
  if (Array.isArray(antigo['enum']) || Array.isArray(novo['enum'])) {
    const a = (antigo['enum'] ?? []) as unknown[]
    const n = (novo['enum'] ?? []) as unknown[]
    for (const v of a.filter((x) => !n.includes(x)))
      nova(r.incompativeis, `valor ${canonico(v)} removido do enum`)
    for (const v of n.filter((x) => !a.includes(x)))
      nova(r.incompativeis, `valor ${canonico(v)} novo no enum (fora da política; conservador)`)
  }
  if (antigo['items'] !== undefined || novo['items'] !== undefined) {
    juntar(r, classificar(antigo['items'], novo['items'], `${caminho}[]`))
  }
  juntar(r, classificarTupla(antigo, novo, caminho))
  juntar(r, classificarAdicionais(antigo, novo, caminho))
  if (ehObjeto(antigo['properties']) || ehObjeto(novo['properties'])) {
    juntar(r, classificarCampos(antigo, novo, caminho))
  }
  return r
}

function juntar(destino: Classificacao, parte: Classificacao): void {
  destino.compativeis.push(...parte.compativeis)
  destino.incompativeis.push(...parte.incompativeis)
}

function classificarTupla(antigo: Json, novo: Json, caminho: string): Classificacao {
  const r: Classificacao = { compativeis: [], incompativeis: [] }
  const pa = antigo['prefixItems']
  const pn = novo['prefixItems']
  if (pa === undefined && pn === undefined) return r
  if (!Array.isArray(pa) || !Array.isArray(pn) || pa.length !== pn.length) {
    r.incompativeis.push(`${caminho}: itens da tupla mudaram`)
    return r
  }
  pa.forEach((item, i) => juntar(r, classificar(item, pn[i], `${caminho}[${i}]`)))
  return r
}

/** `strict` x `passthrough` (booleano ou ausente) e o tipo do valor de um `record` (schema). */
function classificarAdicionais(antigo: Json, novo: Json, caminho: string): Classificacao {
  const r: Classificacao = { compativeis: [], incompativeis: [] }
  const aa = antigo['additionalProperties']
  const an = novo['additionalProperties']
  if (ehObjeto(aa) && ehObjeto(an)) return classificar(aa, an, `${caminho}{}`)
  if (canonico(aa) !== canonico(an))
    r.incompativeis.push(
      `${caminho}: additionalProperties mudou de ${canonico(aa)} para ${canonico(an)}`,
    )
  return r
}

function classificarCampos(antigo: Json, novo: Json, caminho: string): Classificacao {
  const r: Classificacao = { compativeis: [], incompativeis: [] }
  const pa = (antigo['properties'] ?? {}) as Json
  const pn = (novo['properties'] ?? {}) as Json
  const obrigA = new Set((antigo['required'] ?? []) as string[])
  const obrigN = new Set((novo['required'] ?? []) as string[])
  for (const campo of Object.keys(pa)) {
    const aqui = `${caminho}.${campo}`
    if (!(campo in pn)) {
      r.incompativeis.push(`${aqui}: campo removido (ou renomeado)`)
      continue
    }
    juntar(r, classificar(pa[campo], pn[campo], aqui))
    if (obrigA.has(campo) && !obrigN.has(campo))
      r.incompativeis.push(`${aqui}: campo obrigatório virou opcional`)
    if (!obrigA.has(campo) && obrigN.has(campo))
      r.incompativeis.push(
        `${aqui}: campo opcional virou obrigatório (fora da política; conservador)`,
      )
  }
  for (const campo of Object.keys(pn).filter((c) => !(c in pa))) {
    const aqui = `${caminho}.${campo}`
    if (obrigN.has(campo)) r.incompativeis.push(`${aqui}: campo novo obrigatório`)
    else r.compativeis.push(`${aqui}: campo novo opcional`)
  }
  return r
}

export type EntradaFotografia = {
  /** `resultados` ou `eventos`, e o nome (`O9`, `coleta.concluida`). */
  grupo: string
  nome: string
  /** `undefined` = o contrato foi removido (só resta a fotografia). */
  atual: unknown
  /** `undefined` = sem fotografia versionada. */
  fotografia: unknown
}

export type Avaliacao = { problemas: string[] }

/** Aceite de UMA mudança concreta: `mudanca` é o hash do par fotografia antiga -> schema atual. */
export type Aceite = { contrato: string; mudanca: string; motivo: string; data: string }

export const idContrato = (e: Pick<EntradaFotografia, 'grupo' | 'nome'>): string =>
  `${e.grupo}/${e.nome}`

/** Hash (sha256) da mudança concreta: par antigo -> novo (`null` quando o contrato foi removido). */
export function hashMudanca(antigo: unknown, novo: unknown): string {
  return createHash('sha256')
    .update(canonico({ antigo, novo: novo === undefined ? null : novo }))
    .digest('hex')
}

/**
 * Confronta o schema atual com a fotografia. Contrato removido (fotografia sem schema atual) é incompatível.
 * Uma incompatibilidade só passa com aceite daquela mudança exata (`contrato` + hash do par antigo -> novo);
 * aceite que não corresponde a nenhuma incompatibilidade pendente é problema (obriga a limpar `aceitas.json`).
 */
export function avaliarFotografias(
  entradas: EntradaFotografia[],
  aceites: readonly Aceite[],
): Avaliacao {
  const problemas: string[] = []
  const pendentes = new Set<string>()
  for (const e of entradas) {
    const id = idContrato(e)
    if (e.fotografia === undefined) {
      problemas.push(`${id}: sem fotografia versionada; rode \`pnpm run docs:fotografar\``)
      continue
    }
    const c =
      e.atual === undefined
        ? { compativeis: [], incompativeis: ['contrato removido'] }
        : classificar(e.fotografia, e.atual)
    const hash = hashMudanca(e.fotografia, e.atual)
    if (c.incompativeis.length > 0) {
      pendentes.add(`${id}|${hash}`)
      if (!aceites.some((a) => a.contrato === id && a.mudanca === hash))
        problemas.push(
          `${id}: mudança INCOMPATÍVEL (${c.incompativeis.join('; ')}). Entregue o contrato novo em paralelo (/api/v2, tipo .v2, com fotografia própria) ou registre o aceite desta mudança em docs/contratos/snapshots/aceitas.json (contrato "${id}", mudanca "${hash}") e rode \`pnpm run docs:fotografar\``,
        )
      else
        problemas.push(
          `${id}: fotografia desatualizada (mudança aceita); rode \`pnpm run docs:fotografar\``,
        )
    } else if (canonico(e.fotografia) !== canonico(e.atual)) {
      problemas.push(
        `${id}: fotografia desatualizada (${c.compativeis.length > 0 ? c.compativeis.join('; ') : 'só anotações'}); rode \`pnpm run docs:fotografar\``,
      )
    }
  }
  for (const a of aceites)
    if (!pendentes.has(`${a.contrato}|${a.mudanca}`))
      problemas.push(
        `${a.contrato}: aceite sem mudança incompatível pendente correspondente (mudanca ${a.mudanca}); remova a entrada de docs/contratos/snapshots/aceitas.json`,
      )
  return { problemas }
}

export const aceitasSchema = z.object({
  aceitas: z.array(
    z.object({
      contrato: z.string().regex(/^(resultados|eventos)\/.+$/),
      mudanca: z.string().regex(/^[0-9a-f]{64}$/),
      motivo: z.string().min(10),
      data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    }),
  ),
})

/** Aceites por mudança concreta, lidos de `aceitas.json` (v2 NÃO isenta o v1: tem contrato e fotografia próprios). */
export function lerAceites(aceitasJson: string | undefined): Aceite[] {
  return aceitasJson === undefined ? [] : aceitasSchema.parse(JSON.parse(aceitasJson)).aceitas
}
