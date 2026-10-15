import type { BaseBM, EntradaSazonal, ExtensaoTambemBM } from '@metricas-dspd/metricas/businessmap'
import {
  CALENDARIO_PADRAO as cal,
  diaLocal,
  ehDiaUtil,
  instanteDe,
  mesDeDia,
  primeiroDiaDoMes,
  somarMeses,
  ultimoDiaDoMes,
} from '@metricas-dspd/metricas/core'
import { escolha, inteiro, uniforme } from '../distribuicoes'
import type { ConfigMock } from '../config'
import { derivar } from '../prng'

/**
 * Extensão só de mock do pedido 011 (B11b, P-T3 = a): o histórico de entradas dos 24 meses fechados mais o corrente
 * que o T11 precisa e que a base mock (18 meses) não tem. Função pura da base, com stream própria
 * (`derivar(semente, 'businessmap/tambem:entradas-sazonais')`): não consome o PRNG de `bm`/`ac`, então a base e os hashes
 * dela e do Acelerato não mudam. Lazy: só roda quando o T11 é pedido, fora da montagem do contexto (C1 e C2).
 *
 * No mock, T11 e O7 divergem nos meses em comum (a série daqui é independente dos cards da base); na coleta real o
 * T11 lê `dim_card` e a divergência some. Valores FICTÍCIOS; nenhum campo de pessoa.
 */
export const PARAMETROS_SAZONAIS = {
  /** Meses fechados de histórico (mais o corrente, parcial). */
  mesesFechados: 24,
  /** Demandas por mês num mês comum, na escala 1. */
  baseMensal: 120,
  /** Fator dos meses de pico (janeiro e julho): ficam bem acima da média dos demais. */
  fatorPico: 1.5,
  /** Meses de pico (1 = janeiro). */
  picos: [1, 7] as readonly number[],
  /** Variação aleatória de cada mês: de 1 - ruido a 1 + ruido. */
  ruido: 0.06,
} as const

/** Só o que a série precisa da base: os cards do BusinessMap (perfil) e a configuração (semente, "hoje", escala). */
export interface BaseParaExtensaoTambem {
  bm: Pick<BaseBM, 'cards'>
  config: ConfigMock
}

export function gerarExtensaoTambemMock(base: BaseParaExtensaoTambem): ExtensaoTambemBM {
  const P = PARAMETROS_SAZONAIS
  const r = derivar(base.config.semente, 'businessmap/tambem:entradas-sazonais')
  const hoje = diaLocal(Date.parse(base.config.hoje), cal)
  const mesCorrente = mesDeDia(hoje)
  const inicio = somarMeses(primeiroDiaDoMes(mesCorrente), -P.mesesFechados)
  // Perfil (tipo, equipe, sistema) das demandas da própria base: a série herda a mesma mistura.
  const perfis = base.bm.cards
    .filter((c) => c.granularidade === 'story' && c.tipo !== 'Bug interno' && !c.eh_subtarefa)
    .map((c) => ({ tipo: c.tipo, equipe: c.equipe, sistema: c.sistema }))
  const entradas: EntradaSazonal[] = []
  if (perfis.length === 0) return { entradasSazonais: entradas }

  for (let d = inicio; d <= hoje;) {
    const m = mesDeDia(d)
    const ini = primeiroDiaDoMes(m)
    const fim = Math.min(ultimoDiaDoMes(m), hoje)
    const dias: number[] = []
    for (let x = ini; x <= fim; x++) if (ehDiaUtil(x, cal)) dias.push(x)
    // mês corrente parcial: só a fração dos dias úteis que já passou
    let diasUteisDoMes = 0
    for (let x = ini; x <= ultimoDiaDoMes(m); x++) if (ehDiaUtil(x, cal)) diasUteisDoMes++
    const mes = Number(m.slice(5, 7))
    const fator = (P.picos.includes(mes) ? P.fatorPico : 1) * uniforme(r, 1 - P.ruido, 1 + P.ruido)
    const n = Math.round(P.baseMensal * base.config.escala * fator * (dias.length / diasUteisDoMes))
    for (let i = 0; i < n; i++) {
      const dia = escolha(r, dias)
      const perfil = escolha(r, perfis)
      entradas.push({
        criado_em: instanteDe(dia, inteiro(r, 9 * 60, 17 * 60), cal),
        ...perfil,
      })
    }
    d = ultimoDiaDoMes(m) + 1
  }
  entradas.sort((a, b) => a.criado_em - b.criado_em)
  return { entradasSazonais: entradas }
}
