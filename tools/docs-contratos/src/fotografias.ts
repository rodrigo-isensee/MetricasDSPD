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
const tipos = (v: unknown): string => JSON.stringify(v ?? null)

function variantes(s: Json): unknown[] | undefined {
  const v = s['anyOf'] ?? s['oneOf']
  return Array.isArray(v) ? v : undefined
}

/**
 * Classifica a mudança entre duas fotografias de JSON Schema (resultado de métrica ou payload de evento).
 * Compatível: campo novo opcional, campo opcional que passa a obrigatório,
 * valor novo de enum. Incompatível: remoção ou renomeação de campo, troca de tipo, campo novo obrigatório,
 * campo obrigatório que vira opcional, valor de enum removido, variante de união removida ou acrescentada.
 */
export function classificar(antigo: unknown, novo: unknown, caminho = '$'): Classificacao {
  const r: Classificacao = { compativeis: [], incompativeis: [] }
  const nova = (c: string[], msg: string): void => {
    c.push(`${caminho}: ${msg}`)
  }
  if (!ehObjeto(antigo) || !ehObjeto(novo)) {
    if (JSON.stringify(antigo) !== JSON.stringify(novo))
      nova(r.incompativeis, 'schema mudou de forma')
    return r
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
  if (tipos(antigo['type']) !== tipos(novo['type'])) {
    nova(r.incompativeis, `tipo mudou de ${tipos(antigo['type'])} para ${tipos(novo['type'])}`)
    return r
  }
  if ('const' in antigo || 'const' in novo) {
    if (tipos(antigo['const']) !== tipos(novo['const']))
      nova(r.incompativeis, 'valor constante mudou')
    return r
  }
  if (Array.isArray(antigo['enum']) || Array.isArray(novo['enum'])) {
    const a = (antigo['enum'] ?? []) as unknown[]
    const n = (novo['enum'] ?? []) as unknown[]
    for (const v of a.filter((x) => !n.includes(x)))
      nova(r.incompativeis, `valor ${tipos(v)} removido do enum`)
    for (const v of n.filter((x) => !a.includes(x)))
      nova(r.compativeis, `valor ${tipos(v)} novo no enum`)
  }
  if (antigo['items'] !== undefined || novo['items'] !== undefined) {
    juntar(r, classificar(antigo['items'], novo['items'], `${caminho}[]`))
  }
  if (ehObjeto(antigo['properties']) || ehObjeto(novo['properties'])) {
    juntar(r, classificarCampos(antigo, novo, caminho))
  }
  return r
}

function juntar(destino: Classificacao, parte: Classificacao): void {
  destino.compativeis.push(...parte.compativeis)
  destino.incompativeis.push(...parte.incompativeis)
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
      r.compativeis.push(`${aqui}: campo opcional virou obrigatório`)
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
  atual: unknown
  /** `undefined` = sem fotografia versionada. */
  fotografia: unknown
}

export type Avaliacao = { problemas: string[] }

/**
 * Confronta o schema atual com a fotografia. `aceitas` guarda os contratos com incompatibilidade assumida
 * (registro explícito em `aceitas.json` ou rota/tipo `v2` em paralelo).
 */
export function avaliarFotografias(
  entradas: EntradaFotografia[],
  aceitas: ReadonlySet<string>,
): Avaliacao {
  const problemas: string[] = []
  for (const e of entradas) {
    const id = `${e.grupo}/${e.nome}`
    if (e.fotografia === undefined) {
      problemas.push(`${id}: sem fotografia versionada; rode \`pnpm run docs:fotografar\``)
      continue
    }
    const c = classificar(e.fotografia, e.atual)
    if (c.incompativeis.length > 0 && !aceitas.has(e.nome)) {
      problemas.push(
        `${id}: mudança INCOMPATÍVEL (${c.incompativeis.join('; ')}). Entregue /api/v2 (ou tipo .v2) em paralelo ou registre em docs/contratos/snapshots/aceitas.json e rode \`pnpm run docs:fotografar\``,
      )
    } else if (JSON.stringify(e.fotografia) !== JSON.stringify(e.atual)) {
      problemas.push(
        `${id}: fotografia desatualizada (${c.compativeis.length > 0 ? c.compativeis.join('; ') : 'mudança aceita'}); rode \`pnpm run docs:fotografar\``,
      )
    }
  }
  return { problemas }
}

export const aceitasSchema = z.object({
  aceitas: z.array(
    z.object({
      contrato: z.string().min(1),
      motivo: z.string().min(10),
      data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    }),
  ),
})

/** Contratos com incompatibilidade assumida: `aceitas.json` + métricas com rota `/api/v2` e eventos com tipo `.v2`. */
export function contratosAceitos(
  aceitasJson: string | undefined,
  caminhosV2: readonly string[],
  tiposEvento: readonly string[],
): Set<string> {
  const aceitos = new Set<string>()
  if (aceitasJson !== undefined)
    for (const a of aceitasSchema.parse(JSON.parse(aceitasJson)).aceitas) aceitos.add(a.contrato)
  for (const c of caminhosV2) {
    const id = /\/api\/v2\/metricas\/([^/]+)$/.exec(c)?.[1]
    if (id !== undefined) aceitos.add(id)
  }
  for (const t of tiposEvento) {
    const base = /^(.+)\.v\d+$/.exec(t)?.[1]
    if (base !== undefined) aceitos.add(base)
  }
  return aceitos
}
