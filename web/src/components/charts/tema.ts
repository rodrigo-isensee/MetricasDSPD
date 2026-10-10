/** Cores e padrões dos gráficos: leem as mesmas variáveis CSS do tema (claro/escuro). */
export type IndiceCor = 1 | 2 | 3 | 4 | 5 | 6 | 7
export type Padrao = 'liso' | 'listras' | 'pontos' | 'hachura' | 'cruzado' | 'contorno'

export const PADROES: readonly Padrao[] = ['liso', 'listras', 'pontos', 'hachura', 'cruzado']

export const corSerie = (i: IndiceCor): string => `var(--serie-${i})`

/** Cor de série na posição `n` (0-based), ciclando de 1 a 6 e deixando 7 para "Outros". */
export const corNaPosicao = (n: number): IndiceCor => ((n % 6) + 1) as IndiceCor

export const EIXO = {
  stroke: 'var(--borda-controle)',
  tick: { fill: 'var(--texto-2)', fontSize: 12 },
  grade: 'var(--borda)',
} as const

const ORDEM_TIPOS = [
  'Incidente',
  'Requisição',
  'Melhoria',
  'Iniciativa',
  'Bug interno',
  'Defeito em produção',
  'Dívida técnica',
] as const

/** Cor e padrão FIXOS por tipo de demanda, iguais em todo o sistema (spec 5; cor nunca é o único canal). */
export function marcaDoTipo(tipo: string): { cor: IndiceCor; padrao: Padrao } {
  const i = Math.max(0, (ORDEM_TIPOS as readonly string[]).indexOf(tipo))
  return { cor: corNaPosicao(i), padrao: PADROES[i % PADROES.length] ?? 'liso' }
}

/** Rótulo da unidade no eixo Y (R3): vertical, à esquerda ou à direita do eixo. */
export const rotuloEixoY = (unidade: string, lado: 'esq' | 'dir' = 'esq') => ({
  value: unidade,
  angle: lado === 'esq' ? -90 : 90,
  position: lado === 'esq' ? ('insideLeft' as const) : ('insideRight' as const),
  style: { fill: 'var(--texto-2)', fontSize: 12, textAnchor: 'middle' as const },
})

/** Id de padrão SVG. `uid` (de `useId`) evita ids duplicados quando há vários gráficos na página (B7). */
export const idPadrao = (p: Padrao, cor: IndiceCor, uid = ''): string =>
  `pat${uid ? `-${uid}` : ''}-${p}-${cor}`

/** `useId` do React tem ":" (inválido em `url(#id)`): troca por "_". */
export const uidSvg = (id: string): string => id.replace(/[^a-zA-Z0-9_-]/g, '_')

/** Preenchimento de uma série: cor lisa ou referência ao padrão definido em <PadroesSvg />. */
export function preenchimento(p: Padrao, cor: IndiceCor, uid = ''): string {
  if (p === 'liso') return corSerie(cor)
  if (p === 'contorno') return 'transparent'
  return `url(#${idPadrao(p, cor, uid)})`
}
