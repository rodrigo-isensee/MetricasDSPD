import {
  POR_PAGINA_COLETAS,
  type Dominio,
  type EstadoColeta,
  type EventoColeta,
  type PaginaColetas,
  type VersaoCriterio,
} from '@metricas-dspd/contratos'
import { CALENDARIO_PADRAO, MS_DIA, MS_HORA, dataIso } from './calendario'
import { janelasCalibracao, metricasEmCalibracao, vigentes } from './calibracao'
import { isoLocal, proximaColeta, seloFrescor } from './frescor'

const DIAS_FALHAS_RECENTES = 14

const maisRecentePrimeiro = (a: EventoColeta, b: EventoColeta): number =>
  Date.parse(b.inicio) - Date.parse(a.inicio) || (a.id < b.id ? 1 : a.id > b.id ? -1 : 0)

/** Uma fonte por chamada; nunca soma BusinessMap e Acelerato. */
export function montarEstadoColeta(
  dominio: Dominio,
  eventos: readonly EventoColeta[],
  versoes: readonly VersaoCriterio[],
  agoraMs: number,
): EstadoColeta {
  const ordenados = [...eventos].sort(maisRecentePrimeiro)
  const ultimaTentativa = ordenados[0] ?? null
  const oks = ordenados.filter((e) => e.resultado === 'ok')
  const ultimaOk = oks[0] ?? null
  const primeiraOk = oks[oks.length - 1] ?? null
  const hojeIso = dataIso(agoraMs, CALENDARIO_PADRAO)
  const vig = vigentes(
    janelasCalibracao(
      dominio,
      primeiraOk ? dataIso(Date.parse(primeiraOk.fim), CALENDARIO_PADRAO) : null,
      versoes,
    ),
    hojeIso,
  )
  return {
    dominio,
    selo: seloFrescor(ultimaOk, ultimaTentativa, agoraMs),
    horasDesdeUltimaOk: ultimaOk
      ? Math.round(((agoraMs - Date.parse(ultimaOk.fim)) / MS_HORA) * 10) / 10
      : null,
    ultimaOk,
    ultimaTentativa,
    proximaPrevista: isoLocal(proximaColeta(agoraMs)),
    falhasRecentes: ordenados.filter(
      (e) =>
        e.resultado !== 'ok' && agoraMs - Date.parse(e.inicio) <= DIAS_FALHAS_RECENTES * MS_DIA,
    ),
    calibracao: vig,
    metricasEmCalibracao: metricasEmCalibracao(vig),
  }
}

/** Mais recente primeiro; páginas de 20 a partir de 1; página fora do intervalo devolve itens vazios. */
export function paginarColetas(eventos: readonly EventoColeta[], pagina: number): PaginaColetas {
  const ordenados = [...eventos].sort(maisRecentePrimeiro)
  const ini = (pagina - 1) * POR_PAGINA_COLETAS
  return {
    itens: ordenados.slice(ini, ini + POR_PAGINA_COLETAS),
    pagina,
    porPagina: POR_PAGINA_COLETAS,
    total: ordenados.length,
  }
}
