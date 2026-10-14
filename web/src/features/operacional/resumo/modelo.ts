import type { MarcacaoCriterio, ResultadoDe, Taxa } from '@metricas-dspd/contratos'
import { MINIMO_AMOSTRA } from '@metricas-dspd/contratos'
import { fmtInteiro, fmtNumero, fmtPct, plural } from '@/lib/formatar'
import { contarAvaliadasS1, contarAvaliadasS2, contarForaS1, contarForaS2 } from '../atencao'

/**
 * Modelo de apresentação do Resumo: só reorganiza o que os DTOs já trazem (nenhum cálculo de métrica, nenhuma conta
 * entre fontes). Cada número vem de UM cartão (`cartao`), que também decide o marcador "oculta" (preferência P1).
 */
export interface NumeroModelo {
  /** Estável: serve de `data-testid` e de chave. */
  id: 'p85' | 'vazao' | 'acima-p95' | 'vencidos-internos' | 's2' | 's1' | 'volume'
  /** Código do cartão de origem para o rótulo do link ("Ver O3 na Semanal"). */
  codigo: string
  /** Id do cartão de origem (minúsculas): preferências e âncora. */
  cartao: string
  rotulo: string
  /** `null`: não publicado (menos de 20 itens). */
  valor: string | null
  unidade: string
  /** Segunda leitura, em segundo plano (P50, faixa, proporção de P1+P2). */
  secundario?: string
  base: string
  /** Alvo, em texto (nunca só cor). */
  meta?: string
  status?: 'dentro' | 'fora'
  /** "Poucos itens (n=14). Estatística não publicada." */
  insuficiente?: string
  visao: 'diaria' | 'semanal' | 'sustentacao'
}

const poucos = (n: number) => `Poucos itens (n=${fmtInteiro(n)}). Estatística não publicada.`

/** Tipo predominante da janela: o de mais itens (o mesmo critério da aba padrão do cartão O3). Nunca entre tipos (P1). */
export function tipoPredominante(
  o3: ResultadoDe<'O3'>,
): ResultadoDe<'O3'>['classes'][number] | undefined {
  return [...o3.classes].sort((a, b) => b.n - a.n)[0]
}

export function numeroP85(o3: ResultadoDe<'O3'>): NumeroModelo {
  const c = tipoPredominante(o3)
  const base: Omit<NumeroModelo, 'valor' | 'base'> = {
    id: 'p85',
    codigo: 'O3',
    cartao: 'o3',
    rotulo: c ? `P85 do tempo de ciclo · ${c.tipo}` : 'P85 do tempo de ciclo',
    unidade: 'dias úteis',
    meta: 'Meta: reduzir o P85 em 20% no semestre',
    visao: 'semanal',
  }
  if (!c) return { ...base, valor: null, base: '0 itens concluídos', insuficiente: poucos(0) }
  const e = c.estatistica
  const itens = `${fmtInteiro(c.n)} ${plural(c.n, 'item concluído', 'itens concluídos')}`
  if (e.status === 'ok')
    return {
      ...base,
      valor: fmtNumero(e.valor.p85, 0),
      secundario: `P50: ${fmtNumero(e.valor.p50, 0)} dias úteis`,
      base: itens,
    }
  return { ...base, valor: null, base: itens, insuficiente: poucos(e.n) }
}

export function numeroVazao(o4: ResultadoDe<'O4'>): NumeroModelo {
  const ultima = o4.semanas.filter((s) => !s.emAndamento).at(-1)
  const f = o4.faixa
  return {
    id: 'vazao',
    codigo: 'O4',
    cartao: 'o4',
    rotulo: 'Vazão da última semana fechada',
    valor: ultima ? fmtInteiro(ultima.itens) : null,
    unidade: ultima
      ? plural(ultima.itens, 'item concluído', 'itens concluídos')
      : 'itens concluídos',
    secundario:
      f.status === 'ok'
        ? `Faixa das semanas da janela: ${fmtInteiro(f.valor.min)} a ${fmtInteiro(f.valor.max)} por semana`
        : `Faixa não publicada (n=${fmtInteiro(f.n)}).`,
    base: `${fmtInteiro(o4.base.n)} ${o4.base.unidade}`,
    visao: 'semanal',
  }
}

export function numeroAcimaP95(o2: ResultadoDe<'O2'>): NumeroModelo {
  return {
    id: 'acima-p95',
    codigo: 'O2',
    cartao: 'o2',
    rotulo: 'Itens abertos acima do P95',
    valor: fmtInteiro(o2.acimaP95),
    unidade: plural(o2.acimaP95, 'item', 'itens'),
    base: `${fmtInteiro(o2.base.n)} ${o2.base.unidade}`,
    meta: 'Meta: nenhum sem plano',
    ...(o2.statusMeta === 'sem-referencia' ? {} : { status: o2.statusMeta }),
    visao: 'diaria',
  }
}

export function numeroVencidosInternos(o12: ResultadoDe<'O12'>): NumeroModelo {
  return {
    id: 'vencidos-internos',
    codigo: 'O12',
    cartao: 'o12',
    rotulo: 'Vencidos por causa interna',
    valor: fmtInteiro(o12.vencidosCausaInterna),
    unidade: plural(o12.vencidosCausaInterna, 'item', 'itens'),
    base: `${fmtInteiro(o12.base.n)} ${o12.base.unidade}`,
    meta: 'Meta: zero',
    ...(o12.statusMeta === 'sem-referencia' ? {} : { status: o12.statusMeta }),
    visao: 'semanal',
  }
}

const NENHUMA = 'Nenhuma prioridade com 20 chamados ou mais na janela. Estatística não publicada.'

export function numeroS2(s2: ResultadoDe<'S2'>): NumeroModelo {
  const k = contarForaS2(s2.prioridades)
  const m = contarAvaliadasS2(s2.prioridades)
  return {
    id: 's2',
    codigo: 'S2',
    cartao: 's2',
    rotulo: 'Prioridades com aderência ao SLA abaixo de 90%',
    valor: m > 0 ? `${fmtInteiro(k)} de ${fmtInteiro(m)}` : null,
    unidade: plural(m, 'prioridade avaliada', 'prioridades avaliadas'),
    base: `${fmtInteiro(s2.base.n)} ${s2.base.unidade}`,
    meta: 'Meta: aderência de 90% ou mais em cada prioridade',
    ...(m > 0 ? { status: k > 0 ? ('fora' as const) : ('dentro' as const) } : {}),
    ...(m > 0 ? {} : { insuficiente: NENHUMA }),
    visao: 'sustentacao',
  }
}

export function numeroS1(s1: ResultadoDe<'S1'>): NumeroModelo {
  const k = contarForaS1(s1.prioridades)
  const m = contarAvaliadasS1(s1.prioridades)
  return {
    id: 's1',
    codigo: 'S1',
    cartao: 's1',
    rotulo: 'Prioridades com mediana de restauração acima do alvo',
    valor: m > 0 ? `${fmtInteiro(k)} de ${fmtInteiro(m)}` : null,
    unidade: plural(m, 'prioridade avaliada', 'prioridades avaliadas'),
    base: `${fmtInteiro(s1.base.n)} ${s1.base.unidade}`,
    ...(m > 0 ? { status: k > 0 ? ('fora' as const) : ('dentro' as const) } : {}),
    ...(m > 0 ? {} : { insuficiente: NENHUMA }),
    visao: 'sustentacao',
  }
}

const textoP1P2 = (t: Taxa): string =>
  t.status === 'ok'
    ? `P1+P2: ${fmtPct(t.pct, 0)} (${fmtInteiro(t.k)} de ${fmtInteiro(t.n)})`
    : `P1+P2: ${fmtInteiro(t.k)} de ${fmtInteiro(t.n)} (percentual só com ${MINIMO_AMOSTRA} chamados ou mais)`

export function numeroS3(s3: ResultadoDe<'S3'>): NumeroModelo {
  return {
    id: 'volume',
    codigo: 'S3',
    cartao: 's3',
    rotulo: 'Volume de chamados na janela',
    valor: fmtInteiro(s3.janela.total),
    unidade: plural(s3.janela.total, 'chamado aberto', 'chamados abertos'),
    secundario: textoP1P2(s3.janela.p1p2),
    base: `${fmtInteiro(s3.janela.total)} ${s3.base.unidade}`,
    meta: 'Meta: proporção de P1+P2 estável',
    visao: 'sustentacao',
  }
}

/* ---------- Tendência mensal ---------- */

export interface PontoMensal {
  /** AAAA-MM */
  mes: string
  /** `null`: não publicado (poucos itens): marcador vazado, sem linha. */
  valor: number | null
  /** Base do ponto (n da janela, ou o próprio valor nas contagens). */
  n: number | null
  /** Texto do valor para a tabela e a leitura ("14", "2 de 3 avaliadas", "poucos itens (n=14)"). */
  texto: string
}

const MESES_EXTENSO = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
]
export const mesPorExtenso = (mes: string): string =>
  MESES_EXTENSO[Number(mes.split('-')[1]) - 1] as string

const semValor = (mes: string, n: number): PontoMensal => ({
  mes,
  valor: null,
  n,
  texto: `poucos itens (n=${fmtInteiro(n)})`,
})

/** P85 do tipo escolhido em cada mês (o mesmo tipo do número): estatística por tipo, nunca entre tipos. */
export function serieP85(
  t: ResultadoDe<'TENDENCIA_FLUXO'>,
  tipo: string | undefined,
): PontoMensal[] {
  return t.meses.map((m) => {
    const c = m.p85PorTipo.find((x) => x.tipo === tipo)
    if (!c) return semValor(m.mes, 0)
    const e = c.estatistica
    if (e.status === 'ok')
      return {
        mes: m.mes,
        valor: e.valor.p85,
        n: e.n,
        texto: `${fmtNumero(e.valor.p85, 0)} dias úteis`,
      }
    return semValor(m.mes, e.n)
  })
}

export const serieConcluidos = (t: ResultadoDe<'TENDENCIA_FLUXO'>): PontoMensal[] =>
  t.meses.map((m) => ({
    mes: m.mes,
    valor: m.concluidos,
    n: m.concluidos,
    texto: `${fmtInteiro(m.concluidos)} ${plural(m.concluidos, 'item', 'itens')}`,
  }))

/** "k de m avaliadas": quantas das prioridades com aderência publicada estão fora do alvo (P2). m = 0: não publicado. */
export function serieSla(t: ResultadoDe<'TENDENCIA_SUST'>): PontoMensal[] {
  return t.meses.map((m) => {
    const k = contarForaS2(m.prioridades)
    const av = contarAvaliadasS2(m.prioridades)
    if (av === 0)
      return {
        mes: m.mes,
        valor: null,
        n: 0,
        texto: 'não publicado (nenhuma prioridade com 20 chamados)',
      }
    return {
      mes: m.mes,
      valor: k,
      n: av,
      texto: `${fmtInteiro(k)} de ${fmtInteiro(av)} avaliadas`,
    }
  })
}

export const serieVolume = (t: ResultadoDe<'TENDENCIA_SUST'>): PontoMensal[] =>
  t.meses.map((m) => ({
    mes: m.mes,
    valor: m.volume,
    n: m.volume,
    texto: `${fmtInteiro(m.volume)} ${plural(m.volume, 'chamado', 'chamados')}`,
  }))

/** Frase de leitura, sem adjetivos: "Em setembro: 14 dias úteis, 2 a menos que em agosto." */
export function fraseDaSerie(pontos: readonly PontoMensal[], comparar: boolean): string {
  const ultimo = pontos.at(-1)
  if (!ultimo) return ''
  const antes = pontos.at(-2)
  const mes = mesPorExtenso(ultimo.mes)
  if (ultimo.valor === null) return `Em ${mes}: ${ultimo.texto}. Valor não publicado.`
  if (!comparar || !antes || antes.valor === null) return `Em ${mes}: ${ultimo.texto}.`
  // A diferença sai dos valores como aparecem na tela (arredondados), para a frase bater com os números.
  const d = Math.round(ultimo.valor) - Math.round(antes.valor)
  const cmp =
    d === 0
      ? `igual a ${mesPorExtenso(antes.mes)}`
      : `${fmtNumero(Math.abs(d), 0)} a ${d < 0 ? 'menos' : 'mais'} que em ${mesPorExtenso(antes.mes)}`
  return `Em ${mes}: ${ultimo.texto}, ${cmp}.`
}

/** Mudanças de critério da série e da janela, sem repetir a mesma (T2.6). */
export function marcacoesUnicas(c: {
  serie: readonly MarcacaoCriterio[]
  janela: readonly MarcacaoCriterio[]
}): MarcacaoCriterio[] {
  return [...new Map([...c.serie, ...c.janela].map((m) => [m.id, m])).values()]
}
