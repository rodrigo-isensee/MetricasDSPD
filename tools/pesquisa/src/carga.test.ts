import { describe, expect, it } from 'vitest'
import {
  carregar,
  descrever,
  esquemaCoreDe,
  fimDoTrimestre,
  type Cliente,
  type OpcoesCarga,
  type Pool,
} from './carga.ts'

const T = '2026-T3'
const CAB = 'trimestre,area,pergunta,f1,f2,f3,f4,f5,convidados'
const CSV = [CAB, `${T},comercial,p1,0,1,2,3,4,12`, `${T},comercial,p2,1,1,2,3,3,12`].join('\n')
const SHA = 'a'.repeat(64)

type Chamada = { texto: string; valores: unknown[] }
interface Cenario {
  vigente?: { carga_id: string; arquivo_sha256: string }
  versao?: string | null
  falharEm?: RegExp
}
function dublePool(c: Cenario = {}) {
  const chamadas: Chamada[] = []
  let liberou = 0
  const cliente: Cliente = {
    query: (texto, valores = []) => {
      chamadas.push({ texto, valores })
      if (c.falharEm?.test(texto)) return Promise.reject(new Error('falha'))
      const rows: unknown[] = /FROM \S+\.pesq_carga/.test(texto)
        ? c.vigente
          ? [c.vigente]
          : []
        : /FROM \S+\.ref_versao_criterio/.test(texto)
          ? c.versao === null
            ? []
            : [{ versao_id: c.versao ?? '7' }]
          : /FROM \S+\.ref_pesq_pergunta/.test(texto)
            ? [{ codigo: 'p1' }, { codigo: 'p2' }]
            : /FROM \S+\.ref_pesq_area/.test(texto)
              ? [{ codigo: 'comercial' }]
              : /INSERT INTO \S+\.pesq_carga/.test(texto)
                ? [{ carga_id: '42' }]
                : []
      return Promise.resolve({ rows: rows as never[] })
    },
    release: () => {
      liberou++
    },
  }
  const pool: Pool = { connect: () => Promise.resolve(cliente) }
  return { pool, chamadas, liberou: () => liberou, textos: () => chamadas.map((x) => x.texto) }
}
const op = (extra: Partial<OpcoesCarga> = {}): OpcoesCarga => ({
  trimestre: T,
  csv: CSV,
  confirmar: true,
  esquemaCore: 'dspd_core',
  ...extra,
})
const escritas = (textos: string[]): string[] =>
  textos.filter((t) => /^(INSERT|UPDATE|DELETE)/.test(t))

describe('carregar', () => {
  it('grava carga, resultados (5 faixas por linha) e participação, em transação, só com INSERT', async () => {
    const d = dublePool()
    const r = await carregar(d.pool, op({ oQueMudou: 'Avisamos o andamento.' }))
    expect(r).toMatchObject({
      status: 'carregada',
      cargaId: '42',
      substitui: null,
      resumo: { linhas: 2, areas: 1, versaoId: '7', oQueMudou: 'Avisamos o andamento.' },
    })
    expect(d.textos()[0]).toBe('BEGIN')
    expect(d.textos().at(-1)).toBe('COMMIT')
    expect(d.textos().filter((t) => /^(UPDATE|DELETE|TRUNCATE)/.test(t))).toEqual([])
    const [carga, resultado, participacao] = d.chamadas.filter((c) => c.texto.startsWith('INSERT'))
    expect(carga!.valores.slice(0, 2)).toEqual([T, '7'])
    expect(carga!.valores.slice(3)).toEqual([2, null, 'Avisamos o andamento.'])
    expect(resultado!.valores).toHaveLength(2 * 5 * 5)
    expect(resultado!.valores.slice(0, 10)).toEqual([
      '42',
      'comercial',
      'p1',
      1,
      0,
      '42',
      'comercial',
      'p1',
      2,
      1,
    ])
    expect(participacao!.valores).toEqual(['42', 'comercial', 12, 10])
    expect(d.liberou()).toBe(1)
  })

  it('usa o questionário vigente no fim do trimestre e as áreas vigentes nessa data', async () => {
    const d = dublePool()
    await carregar(d.pool, op())
    const q = d.chamadas.filter((c) => /ref_versao_criterio|ref_pesq_area/.test(c.texto))
    expect(q.map((c) => c.valores)).toEqual([['2026-09-30'], ['2026-09-30']])
    expect(fimDoTrimestre('2025-T1')).toBe('2025-03-31')
    expect(fimDoTrimestre('2025-T4')).toBe('2025-12-31')
  })

  it('sem --confirmar valida e mostra o resumo, sem gravar nada', async () => {
    const d = dublePool()
    const r = await carregar(d.pool, op({ confirmar: false, oQueMudou: 'Texto.' }))
    expect(r.status).toBe('simulada')
    expect(escritas(d.textos())).toEqual([])
    expect(d.textos().at(-1)).toBe('ROLLBACK')
    expect(descrever(r).join('\n')).toMatch(
      /nada foi gravado[\s\S]*O que mudou: Texto\.[\s\S]*--confirmar/,
    )
  })

  it('idempotente: o mesmo arquivo já vigente não grava nada (mesmo com --substituir)', async () => {
    const { createHash } = await import('node:crypto')
    const sha = createHash('sha256').update(CSV).digest('hex')
    const d = dublePool({ vigente: { carga_id: '9', arquivo_sha256: sha } })
    for (const substituir of [undefined, T]) {
      const r = await carregar(d.pool, op(substituir ? { substituir } : {}))
      expect(r).toEqual({ status: 'ja-carregada', cargaId: '9', sha256: sha })
    }
    expect(escritas(d.textos())).toEqual([])
  })

  it('trimestre já carregado com arquivo diferente exige --substituir e faz a pergunta', async () => {
    const d = dublePool({ vigente: { carga_id: '9', arquivo_sha256: SHA } })
    const r = await carregar(d.pool, op())
    expect(r).toEqual({ status: 'ja-existe', trimestre: T })
    expect(descrever(r)).toEqual([
      'Substituir a pesquisa de 3T/2026? A versão anterior fica guardada. Repita com --substituir 2026-T3.',
    ])
    expect(escritas(d.textos())).toEqual([])
  })

  it('reenvio com --substituir cria carga nova apontando para a anterior (nunca UPDATE/DELETE)', async () => {
    const d = dublePool({ vigente: { carga_id: '9', arquivo_sha256: SHA } })
    const r = await carregar(d.pool, op({ substituir: T }))
    expect(r).toMatchObject({ status: 'carregada', substitui: '9' })
    const carga = d.chamadas.find((c) => c.texto.startsWith('INSERT INTO dspd_core.pesq_carga'))!
    expect(carga.valores[4]).toBe('9')
    expect(d.textos().filter((t) => /^(UPDATE|DELETE)/.test(t))).toEqual([])
    expect(descrever(r)[0]).toMatch(/substitui=9/)
  })

  it('--substituir em trimestre sem carga ou diferente do trimestre é recusado', async () => {
    expect(await carregar(dublePool().pool, op({ substituir: T }))).toEqual({
      status: 'recusada',
      erros: [{ coluna: 'substituir', regra: 'trimestre-sem-carga' }],
    })
    const d = dublePool()
    expect(await carregar(d.pool, op({ substituir: '2026-T2' }))).toEqual({
      status: 'recusada',
      erros: [{ coluna: 'substituir', regra: 'diferente-do-trimestre' }],
    })
    expect(d.chamadas).toEqual([])
  })

  it('recusa sem ler o banco: trimestre malformado e o que mudou inválido', async () => {
    const d = dublePool()
    expect((await carregar(d.pool, op({ trimestre: '3T/2026' }))).status).toBe('recusada')
    expect(await carregar(d.pool, op({ oQueMudou: 'ver https://x.com' }))).toMatchObject({
      status: 'recusada',
      erros: [{ regra: 'contem-url' }],
    })
    expect(d.chamadas).toEqual([])
  })

  it('recusa sem questionário vigente', async () => {
    const d = dublePool({ versao: null })
    expect(await carregar(d.pool, op())).toEqual({
      status: 'recusada',
      erros: [{ regra: 'questionario-vigente-inexistente' }],
    })
    expect(escritas(d.textos())).toEqual([])
  })

  it('recusa arquivo com coluna extra ou área fora da lista, sem gravar, e o texto de saída não traz célula', async () => {
    const d = dublePool()
    const extra = await carregar(d.pool, op({ csv: CSV.replace(CAB, `${CAB},email`) }))
    expect(extra).toMatchObject({
      status: 'recusada',
      erros: [{ coluna: 'email', regra: 'coluna-extra' }],
    })
    const fora = await carregar(d.pool, op({ csv: CSV.replace(/comercial/g, 'segredo') }))
    expect(fora.status).toBe('recusada')
    const saida = [...descrever(extra), ...descrever(fora)].join('\n')
    expect(saida).toMatch(/linha=2 coluna=area regra=area-fora-da-lista/)
    expect(saida).not.toMatch(/segredo|comercial/)
    expect(escritas(d.textos())).toEqual([])
  })

  it('erro no meio faz ROLLBACK, repassa o erro e devolve o cliente', async () => {
    const d = dublePool({ falharEm: /INSERT INTO \S+\.pesq_resultado/ })
    await expect(carregar(d.pool, op())).rejects.toThrow('falha')
    expect(d.textos().at(-1)).toBe('ROLLBACK')
    expect(d.liberou()).toBe(1)
  })

  it('o log da carga bem-sucedida só tem trimestre, sha256 e contagens', async () => {
    const r = await carregar(dublePool().pool, op())
    const saida = descrever(r).join('\n')
    expect(saida).toMatch(/trimestre=2026-T3 versao=7 linhas=2 areas=1 sha256=[0-9a-f]{64}/)
    expect(saida).not.toMatch(/comercial|p1/)
  })
})

describe('descrever e esquemaCoreDe', () => {
  it('descreve a simulação sem o que mudou', () => {
    const resumo = {
      trimestre: T,
      versaoId: '7',
      linhas: 2,
      areas: 1,
      sha256: SHA,
      oQueMudou: null,
    }
    expect(descrever({ status: 'simulada', substitui: null, resumo })[1]).toBe(
      'O que mudou: (não informado)',
    )
    expect(descrever({ status: 'simulada', substitui: '9', resumo })[0]).toMatch(/substitui=9/)
    expect(descrever({ status: 'ja-carregada', cargaId: '9', sha256: SHA })[0]).toMatch(
      /nada a fazer/,
    )
    expect(descrever({ status: 'recusada', erros: [{ regra: 'arquivo-vazio' }] })).toEqual([
      'Arquivo recusado; nada foi gravado.',
      'erro regra=arquivo-vazio',
    ])
  })
  it('valida o prefixo do schema', () => {
    expect(esquemaCoreDe()).toBe('dspd_core')
    expect(esquemaCoreDe('t1a2b3_')).toBe('t1a2b3_dspd_core')
    expect(() => esquemaCoreDe('x; DROP')).toThrow('inválido')
  })
})
