import type { PessoaRef, RespostaApontamento } from '@metricas-dspd/contratos'
import {
  diaDeIso,
  diasUteisNoIntervalo,
  isoDeDia,
  mesDeDia,
  primeiroDiaDoMes,
  ultimoDiaDoMes,
  type Calendario,
} from '../../core/calendario'
import { ordenarNeutro } from '../../core/ordenar'
import { agrupar, comPessoa, pctComPiso, SEGUNDOS_POR_HORA, somaSegundos } from './comum'
import type { LinhaApontamento } from './tipos'

type Capacidade = RespostaApontamento['capacidade']

/** Utilização = realizado ÷ capacidade, sem teto (pode passar de 100%), com o piso de 20 apontamentos (o3). */
export const utilizacao = (
  realizadoSegundos: number,
  capacidadeSegundos: number,
  apontamentos: number,
) => pctComPiso(realizadoSegundos, capacidadeSegundos, apontamentos)

export const horasPorDiaSegundos = (cal: Calendario): number =>
  Math.round(cal.horasPorDia * SEGUNDOS_POR_HORA)

/** Intervalo da pessoa: do primeiro ao último apontamento do recorte (regra da especificação, Q-A4). */
function intervalos(
  linhas: readonly LinhaApontamento[],
): Map<PessoaRef, { inicio: string; fim: string; ls: LinhaApontamento[] }> {
  const out = new Map<PessoaRef, { inicio: string; fim: string; ls: LinhaApontamento[] }>()
  for (const [ref, ls] of agrupar(comPessoa(linhas), (l) => l.pessoaRef)) {
    // datas ISO: a ordem de texto é a cronológica
    const inicio = ls.reduce((m, l) => (l.data < m ? l.data : m), (ls[0] as LinhaApontamento).data)
    const fim = ls.reduce((m, l) => (l.data > m ? l.data : m), (ls[0] as LinhaApontamento).data)
    out.set(ref, { inicio, fim, ls })
  }
  return out
}

/**
 * Capacidade por pessoa: dias úteis do intervalo da pessoa (com feriados do calendário, C-10) x jornada do calendário.
 * Pessoa cujo intervalo não tem dia útil (só apontou em fim de semana ou feriado) fica de fora: a utilização dela não
 * é definida. Ordem por `pessoaRef`; o chamador aplica a ordem neutra (o1).
 */
export function capacidadePessoa(
  linhas: readonly LinhaApontamento[],
  cal: Calendario,
): Capacidade['porPessoa'] {
  const jornada = horasPorDiaSegundos(cal)
  const itens: Capacidade['porPessoa'] = []
  for (const [pessoaRef, { inicio, fim, ls }] of intervalos(linhas)) {
    const diasUteis = diasUteisNoIntervalo(diaDeIso(inicio), diaDeIso(fim), cal).length
    if (diasUteis === 0) continue
    const capacidadeSegundos = diasUteis * jornada
    const realizadoSegundos = somaSegundos(ls)
    itens.push({
      pessoaRef,
      inicio,
      fim,
      diasUteis,
      capacidadeSegundos,
      realizadoSegundos,
      apontamentos: ls.length,
      utilizacao: utilizacao(realizadoSegundos, capacidadeSegundos, ls.length),
    })
  }
  return ordenarNeutro(itens, (i) => [Number(i.pessoaRef.slice(1))])
}

/**
 * Capacidade mensal (C-8, Q-A9): soma, por pessoa, dos dias úteis do mês dentro do intervalo dela. O período corta na
 * última coleta bem-sucedida (C-7), e esse mês sai com `parcialAte`. Mês sem dia útil de pessoa ativa fica de fora.
 */
export function capacidadeMensal(
  linhas: readonly LinhaApontamento[],
  cal: Calendario,
  periodo: { de: string; ate: string },
  ultimaColetaOk: string | null,
): Capacidade['mensal'] {
  const jornada = horasPorDiaSegundos(cal)
  const cortado = ultimaColetaOk !== null && ultimaColetaOk < periodo.ate
  const limite = cortado ? ultimaColetaOk : periodo.ate
  const dLimite = diaDeIso(limite)
  const dDe = diaDeIso(periodo.de)
  const ativos = [...intervalos(linhas).values()].map((v) => ({
    ini: diaDeIso(v.inicio),
    fim: diaDeIso(v.fim),
  }))
  const daPessoa = comPessoa(linhas)
  const meses: Capacidade['mensal'] = []
  for (
    let mes = mesDeDia(dDe);
    primeiroDiaDoMes(mes) <= dLimite;
    mes = mesDeDia(ultimoDiaDoMes(mes) + 1)
  ) {
    const a = Math.max(dDe, primeiroDiaDoMes(mes))
    const b = Math.min(dLimite, ultimoDiaDoMes(mes))
    const dias = ativos.reduce(
      (s, p) => s + diasUteisNoIntervalo(Math.max(a, p.ini), Math.min(b, p.fim), cal).length,
      0,
    )
    if (dias === 0) continue
    const doMes = daPessoa.filter((l) => l.data.slice(0, 7) === mes)
    meses.push({
      mes,
      capacidadeSegundos: dias * jornada,
      realizadoSegundos: somaSegundos(doMes),
      apontamentos: doMes.length,
      utilizacao: utilizacao(somaSegundos(doMes), dias * jornada, doMes.length),
      parcialAte:
        cortado && b === dLimite && dLimite < ultimoDiaDoMes(mes) ? isoDeDia(dLimite) : null,
    })
  }
  return meses
}

export function calcularCapacidade(
  linhas: readonly LinhaApontamento[],
  cal: Calendario,
  periodo: { de: string; ate: string },
  ultimaColetaOk: string | null,
): Capacidade {
  return {
    horasPorDiaSegundos: horasPorDiaSegundos(cal),
    mensal: capacidadeMensal(linhas, cal, periodo, ultimaColetaOk),
    porPessoa: capacidadePessoa(linhas, cal),
    leituraRelativa: true,
  }
}
