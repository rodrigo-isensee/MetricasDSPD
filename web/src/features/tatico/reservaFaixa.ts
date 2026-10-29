import type { FiltrosFluxo } from '@metricas-dspd/contratos'

/**
 * Altura (px) reservada para a faixa "Pede atenção" do Tático enquanto carrega (ADR 0003, F2; K-133, L2T-003).
 * Sem equipe, os quatro alertas possíveis quebram em duas linhas em desktop (130 px). Com equipe escolhida, os
 * alertas são poucos e cabem em uma linha (88 px, medido nas cinco equipes do mock: quatro em uma linha, uma em
 * duas). Reservar 130 px com equipe encolhia a faixa 32 a 42 px ao carregar e empurrava o núcleo para cima
 * (CLS de 0,073 a 0,100). Em coluna única a faixa não muda de altura com a equipe de forma medida: vale o valor de antes.
 */
export function reservaFaixaTatico(filtros: Pick<FiltrosFluxo, 'equipe'>): {
  mobile: number
  desktop: number
} {
  return { mobile: 294, desktop: filtros.equipe.length > 0 ? 88 : 130 }
}
