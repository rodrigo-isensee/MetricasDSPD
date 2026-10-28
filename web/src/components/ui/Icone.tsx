import type { SVGProps } from 'react'

const CAMINHOS = {
  check: 'M5 12.5l4.5 4.5L19 7.5',
  alerta: 'M12 4l9 16H3L12 4zM12 10v4m0 3h.01',
  info: 'M12 21a9 9 0 100-18 9 9 0 000 18zm0-11v6m0-9h.01',
  x: 'M6 6l12 12M18 6L6 18',
  chevron: 'M6 9l6 6 6-6',
  menu: 'M4 7h16M4 12h16M4 17h16',
  sol: 'M12 16a4 4 0 100-8 4 4 0 000 8zM12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6L7 7m10 10l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4',
  lua: 'M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z',
  tabela: 'M4 5h16v14H4V5zm0 5h16M4 14h16M10 5v14',
  grafico: 'M5 19V9m5 10V5m5 14v-7m5 7H3',
  livro: 'M5 4h11a3 3 0 013 3v13H8a3 3 0 01-3-3V4zm0 13a3 3 0 013-3h11',
  link: 'M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1',
  filtro: 'M4 5h16l-6 7v6l-4 2v-8L4 5z',
  relogio: 'M12 21a9 9 0 100-18 9 9 0 000 18zm0-14v5l3 2',
  seta: 'M5 12h14m-6-6l6 6-6 6',
  'olho-cortado':
    'M3 3l18 18M10.6 6.1A9.8 9.8 0 0112 6c5 0 8.5 4.5 9.5 6a15 15 0 01-3 3.5M6.5 7.7A15 15 0 002.5 12c1 1.5 4.5 6 9.5 6a9.7 9.7 0 003.2-.6M10 10a3 3 0 004 4',
  circulo: 'M12 21a9 9 0 100-18 9 9 0 000 18z',
} as const

export type NomeIcone = keyof typeof CAMINHOS

interface Props extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  nome: NomeIcone
  /** Ícones são decorativos por padrão: o texto ao lado carrega o significado. */
  titulo?: string
}

export function Icone({ nome, titulo, className = 'size-4', ...resto }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={titulo ? undefined : true}
      role={titulo ? 'img' : undefined}
      aria-label={titulo}
      focusable="false"
      {...resto}
    >
      <path d={CAMINHOS[nome]} />
    </svg>
  )
}
