/** Destinos da navegação global, na ordem da spec (critério 2). */
export const DESTINOS = [
  { to: '/', rotulo: 'Visão geral', fluxo: false },
  { to: '/operacional', rotulo: 'Operacional', fluxo: true },
  { to: '/tatico', rotulo: 'Tático', fluxo: true },
  { to: '/estrategico', rotulo: 'Estratégico', fluxo: true },
  { to: '/dados', rotulo: 'Dados e coletas', fluxo: false },
] as const

export const ROTAS_FLUXO: readonly string[] = DESTINOS.filter((d) => d.fluxo).map((d) => d.to)
