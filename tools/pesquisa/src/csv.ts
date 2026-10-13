import {
  COLUNAS_CSV_PESQUISA,
  linhaPesquisaSchema,
  type LinhaPesquisa,
} from '@metricas-dspd/contratos'

/**
 * Validador puro do CSV da pesquisa de percepção (PV1): sem banco, sem arquivo. Tudo é conferido ANTES de qualquer escrita.
 * Nunca devolve conteúdo de célula nos erros (só linha, coluna e a regra violada): o log não carrega dado do arquivo.
 */

export interface ErroCarga {
  /** Linha do arquivo (1 = cabeçalho); ausente quando o erro é do arquivo ou do argumento. */
  linha?: number
  coluna?: string
  regra: string
}

/** Referência vigente contra a qual o arquivo é validado (lista fechada de áreas e questionário). */
export interface ReferenciaCarga {
  areas: readonly string[]
  perguntas: readonly string[]
}

export type ResultadoCsv = { ok: true; linhas: LinhaPesquisa[] } | { ok: false; erros: ErroCarga[] }

type Item = { numero: number; linha: LinhaPesquisa }

export const MAX_LINHAS = 2000
const ESPERADAS: readonly string[] = COLUNAS_CSV_PESQUISA
const NUMERICAS = new Set(['f1', 'f2', 'f3', 'f4', 'f5', 'convidados'])

/** Nome de coluna só entra na mensagem se for inofensivo (um cabeçalho com e-mail ou texto livre não vaza para o log). */
/** Respondentes de uma linha (soma das faixas); numa área é igual em todas as perguntas, garantido pela validação. */
export const respondentesDe = (l: LinhaPesquisa): number => l.f1 + l.f2 + l.f3 + l.f4 + l.f5

const nomeSeguro = (n: string): string => (/^[a-z0-9_]{1,30}$/i.test(n) ? n : '(nome inválido)')

function conferirCabecalho(colunas: string[]): ErroCarga[] {
  if (colunas.join(',') === ESPERADAS.join(',')) return []
  const extras = colunas.filter((c) => !ESPERADAS.includes(c))
  const ausentes = ESPERADAS.filter((c) => !colunas.includes(c))
  const erros: ErroCarga[] = [
    ...extras.map((c) => ({ linha: 1, coluna: nomeSeguro(c), regra: 'coluna-extra' })),
    ...ausentes.map((c) => ({ linha: 1, coluna: c, regra: 'coluna-ausente' })),
  ]
  // Mesmas colunas, ordem ou repetição diferente: o cabeçalho é fixo.
  return erros.length > 0 ? erros : [{ linha: 1, regra: 'cabecalho-diferente' }]
}

/** Valida linha a linha (formato) e depois as regras entre linhas, por área. Devolve todos os erros de uma vez. */
export function validarCsv(texto: string, trimestre: string, ref: ReferenciaCarga): ResultadoCsv {
  if (texto.includes('"')) return { ok: false, erros: [{ regra: 'aspas-nao-suportadas' }] }
  const linhasTexto = texto.replace(/^\uFEFF/, '').split(/\r?\n/)
  if (linhasTexto.at(-1) === '') linhasTexto.pop()
  if (linhasTexto.length === 0) return { ok: false, erros: [{ regra: 'arquivo-vazio' }] }
  const cabecalho = conferirCabecalho((linhasTexto.shift() as string).split(','))
  if (cabecalho.length > 0) return { ok: false, erros: cabecalho }
  if (linhasTexto.length === 0) return { ok: false, erros: [{ regra: 'sem-linhas' }] }
  if (linhasTexto.length > MAX_LINHAS) return { ok: false, erros: [{ regra: 'arquivo-grande' }] }

  const erros: ErroCarga[] = []
  const linhas: Item[] = []
  linhasTexto.forEach((bruta, i) => {
    const numero = i + 2
    const celulas = bruta.split(',')
    if (celulas.length !== ESPERADAS.length) {
      erros.push({ linha: numero, regra: 'numero-de-colunas' })
      return
    }
    const obj: Record<string, string | number> = {}
    let formatoOk = true
    for (const [k, nome] of ESPERADAS.entries()) {
      const c = (celulas[k] as string).trim()
      if (!NUMERICAS.has(nome)) obj[nome] = c
      else if (/^\d{1,9}$/.test(c)) obj[nome] = Number(c)
      else {
        formatoOk = false
        erros.push({ linha: numero, coluna: nome, regra: 'numero-invalido' })
      }
    }
    if (!formatoOk) return
    const r = linhaPesquisaSchema.safeParse(obj)
    if (!r.success) {
      for (const p of r.error.issues)
        erros.push({
          linha: numero,
          ...(p.path[0] ? { coluna: String(p.path[0]) } : {}),
          regra: `schema:${p.code}`,
        })
      return
    }
    linhas.push({ numero, linha: r.data })
  })

  const areas = new Map<string, Item[]>()
  const vistas = new Set<string>()
  for (const x of linhas) {
    const { linha, numero } = x
    if (linha.trimestre !== trimestre)
      erros.push({ linha: numero, coluna: 'trimestre', regra: 'trimestre-diferente-do-argumento' })
    if (!ref.areas.includes(linha.area))
      erros.push({ linha: numero, coluna: 'area', regra: 'area-fora-da-lista' })
    if (!ref.perguntas.includes(linha.pergunta))
      erros.push({ linha: numero, coluna: 'pergunta', regra: 'pergunta-fora-do-questionario' })
    const chave = `${linha.area}|${linha.pergunta}`
    if (vistas.has(chave)) erros.push({ linha: numero, regra: 'area-e-pergunta-repetidas' })
    vistas.add(chave)
    areas.set(linha.area, [...(areas.get(linha.area) ?? []), x])
  }
  for (const doGrupo of areas.values()) {
    const primeira = doGrupo[0] as Item
    for (const p of ref.perguntas)
      if (!doGrupo.some((x) => x.linha.pergunta === p))
        erros.push({
          linha: primeira.numero,
          coluna: 'pergunta',
          regra: 'pergunta-ausente-na-area',
        })
    for (const x of doGrupo) {
      if (respondentesDe(x.linha) !== respondentesDe(primeira.linha))
        erros.push({ linha: x.numero, regra: 'soma-das-faixas-diverge-na-area' })
      if (x.linha.convidados !== primeira.linha.convidados)
        erros.push({ linha: x.numero, coluna: 'convidados', regra: 'convidados-diverge-na-area' })
    }
  }
  return erros.length > 0 ? { ok: false, erros } : { ok: true, linhas: linhas.map((x) => x.linha) }
}

/** Texto do "o que mudou" (escrito pela coordenação): até 500 caracteres, sem e-mail nem URL; texto puro. */
export function validarOQueMudou(
  bruto: string,
): { ok: true; texto: string } | { ok: false; erros: ErroCarga[] } {
  const texto = bruto.replace(/\r\n/g, '\n').trim()
  const erros: ErroCarga[] = []
  if (texto.length === 0) erros.push({ coluna: 'o-que-mudou', regra: 'vazio' })
  if (texto.length > 500) erros.push({ coluna: 'o-que-mudou', regra: 'mais-de-500-caracteres' })
  if (texto.includes('@')) erros.push({ coluna: 'o-que-mudou', regra: 'contem-email' })
  if (/https?:\/\/|www\./i.test(texto)) erros.push({ coluna: 'o-que-mudou', regra: 'contem-url' })
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u0009\u000B-\u001F\u007F]/.test(texto))
    erros.push({ coluna: 'o-que-mudou', regra: 'caractere-de-controle' })
  return erros.length > 0 ? { ok: false, erros } : { ok: true, texto }
}
