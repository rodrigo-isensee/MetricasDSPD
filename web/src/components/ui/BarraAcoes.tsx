import type { ReactNode } from 'react'

/**
 * Barra única de ações do painel (P2): Cadência · Filtros · Métricas · Exportar · Copiar link, numa só linha que
 * quebra em telas estreitas. Só agrupa; cada ação continua sendo o componente dela.
 */
export function BarraAcoes({ children }: { children: ReactNode }) {
  return (
    <div
      role="group"
      aria-label="Ações do painel"
      className="flex flex-wrap items-center gap-2"
      data-testid="barra-metricas"
    >
      {children}
    </div>
  )
}
