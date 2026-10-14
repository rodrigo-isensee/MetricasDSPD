import type { FiltrosDe, FiltrosFluxo, FiltrosSustentacao } from '@metricas-dspd/contratos'
import { useEstadoColeta } from '@/data'

/**
 * Filtros do Resumo: os padrões, sempre (o Resumo não tem barra de filtros). O fluxo usa o padrão do detalhe (12
 * semanas, então as consultas são as mesmas da Diária e da Semanal e o cache é compartilhado). A Sustentação usa
 * 12 semanas, a mesma janela da série mensal (P3), e não os 6 meses do detalhe.
 */
export const FILTROS_FLUXO_RESUMO: FiltrosFluxo = {
  equipe: [],
  tipo: [],
  sistema: [],
  periodo: { tipo: '12s' },
}
export const FILTROS_SUST_RESUMO: FiltrosSustentacao = {
  equipe: [],
  prioridade: [],
  periodo: { tipo: '12s' },
}

/** AAAA-MM-DD do instante, no fuso de São Paulo (a data de corte da API é um dia civil). */
export function dataDoInstante(iso: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date(iso))
}

/**
 * Data de referência das duas tendências: a mais antiga das duas últimas coletas ok (a regra da Visão geral),
 * para os dois blocos terem o mesmo eixo de meses. Fonte sem coleta: vale a da outra. `pronta` espera as duas
 * leituras de estado (a que falha não trava: a tendência segue sem a data e a API usa a da própria fonte).
 */
export function useReferenciaDasTendencias(): {
  pronta: boolean
  dataReferencia: string | undefined
} {
  const bm = useEstadoColeta('businessmap')
  const ac = useEstadoColeta('acelerato')
  const datas = [bm.data?.ultimaOk?.fim, ac.data?.ultimaOk?.fim]
    .filter((d): d is string => !!d)
    .map(dataDoInstante)
    .sort()
  return { pronta: !bm.isPending && !ac.isPending, dataReferencia: datas[0] }
}

/** Filtros das tendências: só a data de referência (o contrato não aceita filtro; `strict` na API). */
export const filtrosTendencia = (
  dataReferencia: string | undefined,
): FiltrosDe<'TENDENCIA_FLUXO'> => (dataReferencia ? { dataReferencia } : {})
