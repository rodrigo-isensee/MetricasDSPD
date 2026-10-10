import { dataValida, diffDias, fmtData } from '@/lib/formatar'

/**
 * Valida o período personalizado (spec 2.3). Devolve a mensagem de erro ou null.
 * "De" <= "Até"; "Até" <= data de corte; "De" >= início do histórico; mínimo de 7 dias.
 */
export function validarPeriodoCustom(
  de: string,
  ate: string,
  historico: { inicio: string; fim: string },
): string | null {
  if (!dataValida(de) || !dataValida(ate)) return 'Informe as duas datas.'
  if (de >= ate) return 'A data inicial precisa ser anterior à data final.'
  if (ate > historico.fim)
    return `A data final não pode passar de ${fmtData(historico.fim)} (data dos dados).`
  if (de < historico.inicio)
    return `Há dados a partir de ${fmtData(historico.inicio)}. Escolha uma data a partir dela.`
  if (diffDias(de, ate) + 1 < 7) return 'Escolha um intervalo de pelo menos 7 dias.'
  return null
}
