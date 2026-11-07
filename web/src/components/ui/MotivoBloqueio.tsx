import { MOTIVO_NAO_CLASSIFICADO, type MotivoBloqueioPublicado } from '@metricas-dspd/contratos'
import { Icone } from './Icone'

/** Motivo do bloqueio. "não classificado" (P-075-3) vai em itálico, cor neutra e ícone decorativo: nunca só cor (CA-1, CA-4). */
export function MotivoBloqueio({ motivo }: { motivo: MotivoBloqueioPublicado }) {
  if (motivo !== MOTIVO_NAO_CLASSIFICADO) return <>{motivo}</>
  return (
    <span className="inline-flex items-center gap-1 italic text-texto-2">
      <Icone nome="info" />
      {motivo}
    </span>
  )
}

/** Trecho da leitura: `por motivo não classificado` ou `por "<motivo>"` (CA-3). */
export const textoMotivo = (m: MotivoBloqueioPublicado): string =>
  m === MOTIVO_NAO_CLASSIFICADO ? `por motivo ${m}` : `por "${m}"`

/** Motivos por quantidade decrescente, com "não classificado" sempre por último; ele conta no total (CA-2). */
export function ordenarMotivos<T extends { motivo: MotivoBloqueioPublicado }>(
  lista: readonly T[],
  valor: (x: T) => number,
): T[] {
  const nc = (x: T) => (x.motivo === MOTIVO_NAO_CLASSIFICADO ? 1 : 0)
  return [...lista].sort((a, b) => nc(a) - nc(b) || valor(b) - valor(a))
}

export function ApoioMotivoNaoClassificado() {
  return (
    <p data-testid="apoio-nao-classificado">
      Motivo ainda sem classificação. O mapa dos motivos do quadro será definido pelas pessoas; até
      lá o bloqueio conta, mas sem motivo de negócio.
    </p>
  )
}
