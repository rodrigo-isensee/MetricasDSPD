import { createHash } from 'node:crypto'
import { trimestreSchema } from '@metricas-dspd/contratos'
import { respondentesDe, validarCsv, validarOQueMudou, type ErroCarga } from './csv.ts'

/** Mínimo do banco que a carga usa: aceita `pg.Pool` e dublês de teste. Credencial: só o papel `dspd_pesquisa` (INSERT em `pesq_*`). */
export interface Cliente {
  query<R extends object = Record<string, unknown>>(
    texto: string,
    valores?: unknown[],
  ): Promise<{ rows: R[] }>
  release(): void
}
export interface Pool {
  connect(): Promise<Cliente>
}

export interface OpcoesCarga {
  trimestre: string
  /** Conteúdo do CSV (lido do arquivo pelo chamador). */
  csv: string
  /** Texto do "o que mudou" escrito pela coordenação (opcional). */
  oQueMudou?: string
  /** Trimestre que se está substituindo (reenvio); precisa ser igual a `trimestre`. */
  substituir?: string
  /** Sem isto nada é gravado: valida, mostra o resumo e o texto "o que mudou" para conferência. */
  confirmar: boolean
  /** Schema `dspd_core` (com o prefixo de teste, quando houver). */
  esquemaCore: string
}

export interface Resumo {
  trimestre: string
  versaoId: string
  linhas: number
  areas: number
  sha256: string
  oQueMudou: string | null
}

export type ResultadoCarga =
  | { status: 'carregada'; cargaId: string; substitui: string | null; resumo: Resumo }
  | { status: 'simulada'; substitui: string | null; resumo: Resumo }
  | { status: 'ja-carregada'; cargaId: string; sha256: string }
  | { status: 'ja-existe'; trimestre: string }
  | { status: 'recusada'; erros: ErroCarga[] }

/** `2026-T3` -> `2026-09-30` (dia 0 do mês seguinte ao último do trimestre). */
export const fimDoTrimestre = (t: string): string =>
  new Date(Date.UTC(Number(t.slice(0, 4)), Number(t.slice(6)) * 3, 0)).toISOString().slice(0, 10)

const PREFIXO_VALIDO = /^[a-z][a-z0-9_]{0,30}$/
/** `dspd_core` com o prefixo de teste (`DSPD_SCHEMA_PREFIXO`), validado antes de entrar no SQL (identificador nunca vem de entrada livre). */
export function esquemaCoreDe(prefixo = ''): string {
  if (prefixo !== '' && !PREFIXO_VALIDO.test(prefixo))
    throw new Error('DSPD_SCHEMA_PREFIXO inválido')
  return `${prefixo}dspd_core`
}

const recusada = (...erros: ErroCarga[]): ResultadoCarga => ({ status: 'recusada', erros })
const lote = (n: number, colunas: number): string =>
  Array.from(
    { length: n },
    (_, i) =>
      `(${Array.from({ length: colunas }, (_, j) => `$${i * colunas + j + 1}`).join(', ')})`,
  ).join(', ')

/**
 * Carga do agregado trimestral (plano lacuna-de-valor §5). Tudo numa transação: lê a referência, valida o arquivo inteiro e só então
 * grava `pesq_carga`, `pesq_resultado` e `pesq_participacao` (só INSERT; nunca UPDATE/DELETE). Idempotente: o mesmo arquivo já vigente
 * no trimestre não grava nada. Trimestre com carga diferente exige `substituir`, e o reenvio cria carga nova (a anterior fica guardada).
 * Nunca grava comentário: o cabeçalho é fixo e qualquer coluna a mais recusa o arquivo.
 */
export async function carregar(pool: Pool, op: OpcoesCarga): Promise<ResultadoCarga> {
  if (!trimestreSchema.safeParse(op.trimestre).success)
    return recusada({ coluna: 'trimestre', regra: 'formato-invalido' })
  if (op.substituir !== undefined && op.substituir !== op.trimestre)
    return recusada({ coluna: 'substituir', regra: 'diferente-do-trimestre' })
  let oQueMudou: string | null = null
  if (op.oQueMudou !== undefined) {
    const v = validarOQueMudou(op.oQueMudou)
    if (!v.ok) return recusada(...v.erros)
    oQueMudou = v.texto
  }
  const s = op.esquemaCore
  const sha256 = createHash('sha256').update(op.csv).digest('hex')
  const fim = fimDoTrimestre(op.trimestre)
  const db = await pool.connect()
  try {
    await db.query('BEGIN')
    try {
      const r = await dentroDaTransacao(db, s, op, sha256, fim, oQueMudou)
      await db.query(r.status === 'carregada' ? 'COMMIT' : 'ROLLBACK')
      return r
    } catch (e) {
      await db.query('ROLLBACK')
      throw e
    }
  } finally {
    db.release()
  }
}

async function dentroDaTransacao(
  db: Cliente,
  s: string,
  op: OpcoesCarga,
  sha256: string,
  fim: string,
  oQueMudou: string | null,
): Promise<ResultadoCarga> {
  // Duas cargas do mesmo trimestre ao mesmo tempo esperam uma pela outra.
  await db.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`pesq_carga:${op.trimestre}`])
  const vigente = (
    await db.query<{ carga_id: string; arquivo_sha256: string; o_que_mudou: string | null }>(
      `SELECT carga_id, arquivo_sha256, o_que_mudou FROM ${s}.pesq_carga WHERE trimestre = $1 ORDER BY carga_id DESC LIMIT 1`,
      [op.trimestre],
    )
  ).rows[0]
  // Mesmo arquivo só é "já carregado" se o texto "O que mudou" informado também for o vigente. Texto informado e diferente
  // (m-6) é um reenvio: exige --substituir, nunca é descartado em silêncio. Sem --o-que-mudou, o texto vigente não é comparado.
  const textoMudou = oQueMudou !== null && vigente?.o_que_mudou !== oQueMudou
  if (vigente?.arquivo_sha256 === sha256 && !textoMudou)
    return { status: 'ja-carregada', cargaId: vigente.carga_id, sha256 }
  if (vigente !== undefined && op.substituir === undefined)
    return { status: 'ja-existe', trimestre: op.trimestre }
  if (vigente === undefined && op.substituir !== undefined)
    return recusada({ coluna: 'substituir', regra: 'trimestre-sem-carga' })

  const versao = (
    await db.query<{ versao_id: string }>(
      `SELECT versao_id FROM ${s}.ref_versao_criterio WHERE dominio = 'pesquisa' AND vigente_desde <= $1
     ORDER BY vigente_desde DESC, versao_id DESC LIMIT 1`,
      [fim],
    )
  ).rows[0]
  if (versao === undefined) return recusada({ regra: 'questionario-vigente-inexistente' })
  const versaoId = versao.versao_id
  const perguntas = (
    await db.query<{ codigo: string }>(
      `SELECT codigo FROM ${s}.ref_pesq_pergunta WHERE versao_id = $1 ORDER BY ordem`,
      [versaoId],
    )
  ).rows.map((x) => x.codigo)
  const areas = (
    await db.query<{ codigo: string }>(
      `SELECT DISTINCT codigo FROM ${s}.ref_pesq_area WHERE vigente_de <= $1 AND (vigente_ate IS NULL OR vigente_ate >= $1)`,
      [fim],
    )
  ).rows.map((x) => x.codigo)

  const v = validarCsv(op.csv, op.trimestre, { areas, perguntas })
  if (!v.ok) return { status: 'recusada', erros: v.erros }
  const porArea = new Map(v.linhas.map((l) => [l.area, l]))
  const resumo: Resumo = {
    trimestre: op.trimestre,
    versaoId,
    linhas: v.linhas.length,
    areas: porArea.size,
    sha256,
    oQueMudou,
  }
  const substitui = vigente === undefined ? null : vigente.carga_id
  if (!op.confirmar) return { status: 'simulada', substitui, resumo }

  const carga = await db.query<{ carga_id: string }>(
    `INSERT INTO ${s}.pesq_carga (trimestre, versao_id, arquivo_sha256, linhas, substitui_carga_id, o_que_mudou)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING carga_id`,
    [op.trimestre, versaoId, sha256, v.linhas.length, substitui, oQueMudou],
  )
  const cargaId = (carga.rows[0] as { carga_id: string }).carga_id
  const resultados = v.linhas.flatMap((l) =>
    [l.f1, l.f2, l.f3, l.f4, l.f5].flatMap((contagem, i) => [
      cargaId,
      l.area,
      l.pergunta,
      i + 1,
      contagem,
    ]),
  )
  await db.query(
    `INSERT INTO ${s}.pesq_resultado (carga_id, area_codigo, pergunta_codigo, faixa, contagem) VALUES ${lote(resultados.length / 5, 5)}`,
    resultados,
  )
  const participacao = [...porArea.values()].flatMap((l) => [
    cargaId,
    l.area,
    l.convidados,
    respondentesDe(l),
  ])
  await db.query(
    `INSERT INTO ${s}.pesq_participacao (carga_id, area_codigo, convidados, respondentes) VALUES ${lote(participacao.length / 4, 4)}`,
    participacao,
  )
  return { status: 'carregada', cargaId, substitui, resumo }
}

/**
 * Texto para o operador. Só trimestre, sha256, contagens e, nos erros, linha, coluna e regra: nunca o conteúdo das células
 * nem o arquivo bruto. O "o que mudou" volta na simulação para a coordenação conferir (é texto dela, não do respondente).
 */
export function descrever(r: ResultadoCarga): string[] {
  const resumo = (x: Resumo): string =>
    `trimestre=${x.trimestre} versao=${x.versaoId} linhas=${x.linhas} areas=${x.areas} sha256=${x.sha256}`
  switch (r.status) {
    case 'recusada':
      return [
        'Arquivo recusado; nada foi gravado.',
        ...r.erros.map((e) =>
          [
            'erro',
            e.linha === undefined ? '' : `linha=${e.linha}`,
            e.coluna === undefined ? '' : `coluna=${e.coluna}`,
            `regra=${e.regra}`,
          ]
            .filter(Boolean)
            .join(' '),
        ),
      ]
    case 'ja-carregada':
      return [
        `Este arquivo já é a carga vigente do trimestre (carga ${r.cargaId}, sha256=${r.sha256}); nada a fazer.`,
      ]
    case 'ja-existe': {
      const [ano, tri] = r.trimestre.split('-T')
      return [
        `Substituir a pesquisa de ${tri}T/${ano}? A versão anterior fica guardada. Repita com --substituir ${r.trimestre}.`,
      ]
    }
    case 'simulada':
      return [
        `Conferência (nada foi gravado): ${resumo(r.resumo)}${r.substitui === null ? '' : ` substitui=${r.substitui}`}`,
        `O que mudou: ${r.resumo.oQueMudou ?? '(não informado)'}`,
        'Se estiver certo, repita o comando com --confirmar.',
      ]
    case 'carregada':
      return [
        `Carga ${r.cargaId} gravada: ${resumo(r.resumo)}${r.substitui === null ? '' : ` substitui=${r.substitui}`}`,
      ]
  }
}
