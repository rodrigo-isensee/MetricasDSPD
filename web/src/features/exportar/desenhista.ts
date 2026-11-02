import { jsPDF } from 'jspdf'
import { fmtData } from '@/lib/formatar'
import {
  RODAPE_PADRAO,
  TEXTO_FICTICIO,
  type BlocoExportacao,
  type ConteudoExportacao,
  type TabelaBloco,
} from './modelo'

/**
 * Desenhista do PDF (chunk `exportar-pdf`, carregado só ao gerar): pinta o `ConteudoExportacao` com jsPDF.
 * Texto real e selecionável (Helvetica padrão, que cobre o pt-BR), A4 retrato, cabeçalho e rodapé em todas as
 * páginas, "Dados fictícios" em todas quando o conteúdo é mock. Não calcula nada: só posiciona o que recebe.
 */

const MARGEM = 15
const LARGURA = 180
const TOPO = 26
const BASE = 280
const MM_PT = 0.3528
const ALTURA_LINHA_TABELA = 5

type Cor = readonly [number, number, number]
const PRETO: Cor = [26, 31, 43]
const CINZA: Cor = [74, 83, 101]
const AMBAR: Cor = [138, 90, 0]
const VERMELHO: Cor = [180, 35, 24]

/** Documento A4 retrato em milímetros, com título e idioma pt-BR (PDF acessível). */
export function novoDocumento(titulo: string): jsPDF {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  doc.setProperties({ title: titulo, subject: 'Métricas DSPD', creator: 'Métricas DSPD' })
  doc.setLanguage('pt-BR')
  return doc
}

const TROCAS: Record<string, string> = {
  '\u2212': '-',
  '\u2265': '>=',
  '\u2264': '<=',
  '\u2192': '->',
}
/** Além de ASCII e Latin-1: travessões, aspas, marcador e reticências (Windows-1252). */
const EXTRAS = new Set([0x2013, 0x2014, 0x2018, 0x2019, 0x201c, 0x201d, 0x2022, 0x2026])

/** A fonte padrão do PDF só tem o conjunto Latin-1/Windows-1252: o resto vira equivalente simples ou sai. */
export function limparTexto(texto: string): string {
  let saida = ''
  for (let i = 0; i < texto.length; i++) {
    const c = texto.charAt(i)
    const t = TROCAS[c] ?? c
    const n = t.charCodeAt(0)
    if ((n >= 0x20 && n <= 0x7e) || (n >= 0xa0 && n <= 0xff) || EXTRAS.has(n)) saida += t
  }
  return saida
}

const ceder = (): Promise<void> => new Promise((r) => setTimeout(r, 0))

/** Gera o PDF do conteúdo. Qualquer exceção sobe inteira: nunca se devolve arquivo parcial. */
export async function gerarPdf(c: ConteudoExportacao): Promise<Blob> {
  const doc = novoDocumento(`Métricas DSPD · ${c.escopo} · dados até ${fmtData(c.dataReferencia)}`)
  let y = TOPO

  const cor = (k: Cor) => doc.setTextColor(k[0], k[1], k[2])
  const garantir = (altura: number) => {
    if (y + altura > BASE) {
      doc.addPage()
      y = TOPO
    }
  }
  const paragrafo = (
    texto: string,
    o: { tam?: number; negrito?: boolean; cor?: Cor; recuo?: number } = {},
  ) => {
    const tam = o.tam ?? 9
    const recuo = o.recuo ?? 0
    doc.setFont('helvetica', o.negrito ? 'bold' : 'normal')
    doc.setFontSize(tam)
    cor(o.cor ?? PRETO)
    const altura = tam * MM_PT * 1.35
    for (const linha of doc.splitTextToSize(limparTexto(texto), LARGURA - recuo) as string[]) {
      garantir(altura)
      doc.text(linha, MARGEM + recuo, y + tam * MM_PT)
      y += altura
    }
  }
  const espaco = (mm: number) => {
    y += mm
  }

  const tabela = (t: TabelaBloco) => {
    const largura = LARGURA / t.colunas.length
    const linha = (celulas: readonly string[], cabecalho: boolean) => {
      garantir(ALTURA_LINHA_TABELA + 1)
      if (cabecalho) {
        doc.setFillColor(238, 241, 246)
        doc.rect(MARGEM, y, LARGURA, ALTURA_LINHA_TABELA, 'F')
      }
      doc.setFont('helvetica', cabecalho ? 'bold' : 'normal')
      doc.setFontSize(8)
      cor(PRETO)
      celulas.forEach((texto, i) => {
        const partes = doc.splitTextToSize(limparTexto(texto) || '-', largura - 2) as string[]
        const visivel =
          partes.length > 1 ? `${(partes[0] as string).slice(0, -2)}...` : (partes[0] as string)
        doc.text(visivel, MARGEM + i * largura + 1, y + 3.6)
      })
      y += ALTURA_LINHA_TABELA
    }
    linha(t.colunas, true)
    for (const l of t.linhas) {
      if (y + ALTURA_LINHA_TABELA > BASE) {
        garantir(BASE)
        linha(t.colunas, true)
      }
      linha(l, false)
    }
    if (t.omitidas > 0)
      paragrafo(
        `Mais ${t.omitidas} linhas não impressas (limite de ${t.linhas.length} por métrica).`,
        {
          tam: 8,
          cor: CINZA,
        },
      )
  }

  const bloco = (b: BlocoExportacao) => {
    garantir(50)
    paragrafo(`${b.codigo} · ${b.titulo}`, { tam: 13, negrito: true })
    paragrafo(`Fonte: ${b.fonte}`, { cor: CINZA })
    paragrafo(`${b.contexto.atualizadoEm} · Frescor: ${b.contexto.frescor}`, { cor: CINZA })
    paragrafo(
      `Em calibração: ${b.contexto.emCalibracao ? 'sim' : 'não'} · Dados fictícios: ${b.contexto.ficticio ? 'sim' : 'não'}`,
      { cor: b.contexto.emCalibracao || b.contexto.ficticio ? AMBAR : CINZA },
    )
    paragrafo(`Filtros: ${b.filtros}`)
    if (b.janela) paragrafo(b.janela)
    paragrafo(b.base, { negrito: true })
    for (const a of b.amostraInsuficiente) paragrafo(a, { negrito: true, cor: VERMELHO })
    for (const k of b.criterios) paragrafo(k, { cor: AMBAR })
    if (b.tabela) {
      espaco(2)
      paragrafo('Dados do gráfico (tabela equivalente)', { tam: 8, negrito: true, cor: CINZA })
      tabela(b.tabela)
    }
    espaco(2)
    paragrafo(`Nota metodológica (resumo): ${b.nota}`, { tam: 8, cor: CINZA })
    espaco(7)
  }

  // Capa
  paragrafo('Métricas DSPD', { tam: 22, negrito: true })
  paragrafo(c.escopo, { tam: 15 })
  espaco(4)
  paragrafo(`Gerado em ${c.geradoEm} · Dados até ${fmtData(c.dataReferencia)}`)
  const total = c.secoes.reduce((s, x) => s + x.blocos.length, 0)
  paragrafo(
    `${total} ${total === 1 ? 'bloco' : 'blocos'} em ${c.secoes.length} ${c.secoes.length === 1 ? 'seção' : 'seções'}.`,
  )
  paragrafo(
    'BusinessMap e Acelerato nunca se misturam: cada fonte tem a sua seção, com os próprios filtros e bases.',
    { cor: CINZA },
  )
  if (c.mock)
    paragrafo(`${TEXTO_FICTICIO}: este arquivo foi gerado com a base de demonstração.`, {
      negrito: true,
      cor: AMBAR,
    })

  for (const s of c.secoes) {
    doc.addPage()
    y = TOPO
    paragrafo(`Fonte: ${s.fonte}`, { tam: 18, negrito: true })
    paragrafo(s.blocos.map((b) => `${b.codigo} ${b.titulo}`).join(' · '), { cor: CINZA })
    espaco(6)
    for (const b of s.blocos) {
      bloco(b)
      await ceder()
    }
  }

  // Cabeçalho e rodapé fixos, em todas as páginas
  const paginas = doc.getNumberOfPages()
  for (let i = 1; i <= paginas; i++) {
    doc.setPage(i)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    cor(PRETO)
    doc.text(limparTexto(`Métricas DSPD · ${c.escopo}`), MARGEM, 14)
    if (c.mock) {
      cor(AMBAR)
      doc.text(TEXTO_FICTICIO, MARGEM + LARGURA, 14, { align: 'right' })
    }
    doc.setDrawColor(213, 218, 227)
    doc.line(MARGEM, 17, MARGEM + LARGURA, 17)
    doc.line(MARGEM, 285, MARGEM + LARGURA, 285)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    cor(CINZA)
    doc.text(
      limparTexto(c.mock ? `${RODAPE_PADRAO} ${TEXTO_FICTICIO}.` : RODAPE_PADRAO),
      MARGEM,
      290,
    )
    doc.text(`Página ${i} de ${paginas}`, MARGEM + LARGURA, 290, { align: 'right' })
  }
  return doc.output('blob')
}
