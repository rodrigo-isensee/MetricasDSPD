/** Destinos da navegação global, na ordem da spec (critério 2). */
export const DESTINOS = [
  { to: '/', rotulo: 'Visão geral', fluxo: false },
  { to: '/operacional', rotulo: 'Operacional', fluxo: true },
  { to: '/tatico', rotulo: 'Tático', fluxo: true },
  { to: '/estrategico', rotulo: 'Estratégico', fluxo: true },
  { to: '/sustentacao', rotulo: 'Sustentação', fluxo: false },
  { to: '/espera-invisivel', rotulo: 'Espera invisível', fluxo: true },
] as const

export const ROTAS_FLUXO: readonly string[] = DESTINOS.filter((d) => d.fluxo).map((d) => d.to)
