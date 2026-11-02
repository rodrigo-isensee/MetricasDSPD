import { FAIXAS_DIARIO, type FaixaDiario, type RespostaApontamento } from '@metricas-dspd/contratos'
import { diaDeIso, ehDiaUtil, isoDeDia, type Calendario } from '../../core/calendario'
import { ordenarNeutro } from '../../core/ordenar'
import { agrupar, comPessoa, numeroDe, SEGUNDOS_POR_HORA, somaSegundos } from './comum'
import type { LinhaApontamento } from './tipos'

type Diario = RespostaApontamento['diario']

/**
 * Faixas fixas do mapa diário (M-6 do UX): não mudam com a carga, então a mesma cor sempre quer dizer a mesma faixa
 * (a especificação original escalava pela maior célula). 4 h e 8 h pertencem à faixa de baixo.
 */
export function faixaDoDia(segundos: number): FaixaDiario {
  if (segundos <= 0) return FAIXAS_DIARIO[0]
  if (segundos <= 4 * SEGUNDOS_POR_HORA) return FAIXAS_DIARIO[1]
  if (segundos <= 8 * SEGUNDOS_POR_HORA) return FAIXAS_DIARIO[2]
  return FAIXAS_DIARIO[3]
}

/**
 * Mapa de calor pessoa x dia com a janela pedida (M-7). Uma coluna por dia da janela, com fim de semana e feriado
 * marcados (M-8, `util` e `feriado`), e uma linha por pessoa com célula em todos os dias (dia sem apontamento = faixa
 * `zero`). `atipico` vem do dia inteiro da pessoa (`atipicos`, chave pessoa e dia). `linhas` já vem filtrada só por
 * pessoa e restrita à janela. Sem linha de pessoa para apontamento sem pessoa. A ordem das linhas é a do chamador (o1).
 */
export function calcularDiario(
  linhas: readonly LinhaApontamento[],
  cal: Calendario,
  janela: { de: string; ate: string },
  limiteAtipicoSegundos: number,
  atipicos: ReadonlySet<string>,
): Diario {
  const dias: Diario['dias'] = []
  for (let d = diaDeIso(janela.de); d <= diaDeIso(janela.ate); d++) {
    const data = isoDeDia(d)
    dias.push({ data, util: ehDiaUtil(d, cal), feriado: cal.feriados.has(data) })
  }
  const porPessoa = [...agrupar(comPessoa(linhas), (l) => l.pessoaRef)].map(([ref, ls]) => {
    const porDia = agrupar(ls, (l) => l.data)
    return {
      pessoaRef: ref,
      segundos: somaSegundos(ls),
      celulas: dias.map(({ data }) => {
        const segundos = somaSegundos(porDia.get(data) ?? [])
        return {
          data,
          segundos,
          faixa: faixaDoDia(segundos),
          atipico: atipicos.has(`${ref}|${data}`),
        }
      }),
    }
  })
  return {
    de: janela.de,
    ate: janela.ate,
    limiteAtipicoSegundos,
    dias,
    linhas: ordenarNeutro(porPessoa, (p) => [numeroDe(p.pessoaRef)]),
  }
}
