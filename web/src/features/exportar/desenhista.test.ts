import { describe, expect, it } from 'vitest'
import { gerarPdf, limparTexto, novoDocumento } from './desenhista'
import type { BlocoExportacao, ConteudoExportacao } from './modelo'

const bloco = (id: string, fonte: BlocoExportacao['fonte'], extra: Partial<BlocoExportacao> = {}) =>
  ({
    id,
    codigo: id,
    titulo: `Titulo ${id}`,
    fonte,
    filtros: 'Equipe: Todos · Período: Últimas 12 semanas',
    janela: 'Janela dos dados: 01/01/2026 a 31/03/2026',
    base: 'Base: 87 itens concluídos',
    amostraInsuficiente: [],
    nota: 'Nota resumida da metrica.',
    criterios: [],
    tabela: null,
    ...extra,
  }) satisfies BlocoExportacao

const conteudo = (
  blocosBm: BlocoExportacao[],
  blocosAc: BlocoExportacao[] = [],
  mock = false,
): ConteudoExportacao => ({
  escopo: 'Operacional',
  mock,
  dataReferencia: '2026-10-09',
  geradoEm: '10/10/2026 14:30',
  secoes: [
    ...(blocosBm.length ? [{ fonte: 'BusinessMap' as const, blocos: blocosBm }] : []),
    ...(blocosAc.length ? [{ fonte: 'Acelerato' as const, blocos: blocosAc }] : []),
  ],
})

/** jsPDF não comprime por padrão: o texto fica legível no próprio arquivo. */
const textoDe = (b: Blob): Promise<string> => b.text()
const ocorrencias = (t: string, s: string) => t.split(s).length - 1

describe('limparTexto', () => {
  it('troca símbolos sem glifo na fonte padrão e mantém o pt-BR', () => {
    expect(limparTexto('P85 ≥ 10 − 2 → ok ≤ 3 · ação × ✓ “x” – y')).toBe(
      'P85 >= 10 - 2 -> ok <= 3 · ação ×  “x” – y',
    )
  })
})

describe('gerarPdf', () => {
  it('cria um A4 com título e idioma pt-BR', () => {
    const doc = novoDocumento('Título')
    expect(doc.output()).toContain('/Lang (pt-BR)')
  })

  it('imprime capa, seções por fonte (BusinessMap antes de Acelerato) e os campos obrigatórios', async () => {
    const pdf = await gerarPdf(
      conteudo(
        [
          bloco('O3', 'BusinessMap', {
            criterios: ['Critério alterado em 02/03/2026: Novo marco'],
            amostraInsuficiente: ['Amostra insuficiente em 1 recorte (n = 5; mínimo de 20 itens).'],
            tabela: {
              colunas: ['Tipo', 'Itens'],
              linhas: [
                ['Incidente', '5'],
                ['', ''],
              ],
              omitidas: 0,
            },
          }),
        ],
        [bloco('S1', 'Acelerato')],
      ),
    )
    expect(pdf.type).toBe('application/pdf')
    const t = await textoDe(pdf)
    expect(t.startsWith('%PDF')).toBe(true)
    for (const s of [
      '(Fonte: BusinessMap)',
      '(Fonte: Acelerato)',
      '(Base: 87 itens conclu',
      '(Janela dos dados: 01/01/2026 a 31/03/2026)',
      '(Incidente)',
      'Nota metodol',
      'Amostra insuficiente em 1 recorte',
      'Crit',
    ])
      expect(t).toContain(s)
    expect(t.indexOf('(Fonte: BusinessMap)')).toBeLessThan(t.indexOf('(Fonte: Acelerato)'))
    expect(t).not.toContain('Dados fict')
    expect(t).toContain('(O sistema n')
  })

  it('no mock, "Dados fictícios" sai no cabeçalho e no rodapé de TODAS as páginas', async () => {
    const muitos = Array.from({ length: 12 }, (_, i) =>
      bloco(`O${i}`, 'BusinessMap', {
        tabela: {
          colunas: ['A', 'B', 'C'],
          linhas: Array.from({ length: 20 }, (_, j) => [`linha ${j}`, 'x'.repeat(120), '1']),
          omitidas: 3,
        },
      }),
    )
    const t = await textoDe(await gerarPdf(conteudo(muitos, [], true)))
    const paginas = ocorrencias(t, '/Type /Page\n')
    expect(paginas).toBeGreaterThan(3)
    // Cabeçalho e rodapé em cada página (mais a menção na capa).
    expect(ocorrencias(t, 'Dados fict')).toBeGreaterThanOrEqual(paginas * 2)
    expect(ocorrencias(t, `de ${paginas})`)).toBe(paginas)
    expect(t).toContain('Mais 3 linhas n')
  })

  it('sem seções e com uma só métrica usa o singular na capa', async () => {
    const vazio = await textoDe(await gerarPdf({ ...conteudo([]), secoes: [] }))
    expect(vazio).toContain('(0 blocos em 0 se')
    const um = await textoDe(
      await gerarPdf(conteudo([bloco('O3', 'BusinessMap', { janela: null })])),
    )
    expect(um).toContain('(1 bloco em 1 se')
  })

  it('falha inteira, sem arquivo parcial, se algo sai errado', async () => {
    await expect(
      gerarPdf({ ...conteudo([]), secoes: null } as unknown as ConteudoExportacao),
    ).rejects.toThrow()
  })
})
