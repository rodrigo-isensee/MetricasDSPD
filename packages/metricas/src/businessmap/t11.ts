import type { FiltrosFluxo, ResultadoT11, TipoCard } from '@metricas-dspd/contratos'
import { diaLocal, isoDeDia, mesDeDia, primeiroDiaDoMes, somarMeses } from '../core/calendario'
import { mesesEntre } from '../core/series'
import { slug } from '../slug'
import { baseAmostral, criterios, r2 } from './comum'
import type { ExtensaoTambemBM } from './extensao'
import type { ContextoBM } from './indice'

/** Meses fechados da janela fixa do T11 (a mais o mês corrente). */
export const MESES_FECHADOS_T11 = 24

/**
 * T11: sazonalidade da chegada. Contagem (censo, sem percentil) de demandas criadas por (ano, mês), na janela fixa de
 * 24 meses fechados mais o corrente, ancorada em "hoje" e não no período do filtro (CA-12: o período não atua; só
 * equipe, tipo e sistema). O mês corrente fica `emAndamento` (parcial). A agregação por mês usa `mesesEntre`.
 *
 * Fonte: no mock, a série própria da extensão (`entradasSazonais`, P-T3 = a); a função é a mesma para a coleta real, que
 * só troca o adaptador. Sem extensão (ou sem entradas), devolve vazio com `historicoCurto`, nunca erro. O histórico
 * começa no mês da entrada mais antiga da extensão (sem filtros, para o filtro não encurtar a janela); antes dele
 * o mês é `null` (sem dado), depois dele é a contagem, inclusive 0.
 *
 * Só entram entradas criadas até a data de corte (`criado_em <= ctx.hoje`), na contagem e no início do histórico.
 * No último dia do mês o corrente fecha e a janela chega a 25 meses fechados (o mês está completo): `mesesComDado` e
 * `mediaMensal` usam os 25; `historicoCurto` segue sendo `< 24`.
 *
 * `mesesComDado` = meses FECHADOS cobertos pelo histórico (os que alimentam `mediaMensal`); `historicoCurto` = menos de
 * 24. `mediaMensal` é só referência de contagem (média dos meses fechados cobertos, nunca estatística de tempo).
 */
export function calcularT11(
  ctx: ContextoBM,
  f: FiltrosFluxo,
  ext?: ExtensaoTambemBM,
): ResultadoT11 {
  const hojeMes = mesDeDia(ctx.hojeDia)
  const inicioDia = somarMeses(primeiroDiaDoMes(hojeMes), -MESES_FECHADOS_T11)
  const janela = { inicio: isoDeDia(inicioDia), fim: ctx.hojeIso }
  const crit = criterios('T11', janela, janela, ctx)
  const baldes = mesesEntre(inicioDia, ctx.hojeDia, ctx.hojeDia)
  // Nada além da data de corte (B11b-1): a fonte pode ter entradas posteriores (mock com dataReferencia, dim_card real).
  const entradas = (ext?.entradasSazonais ?? []).filter((e) => e.criado_em <= ctx.hoje)

  const diaDe = (ms: number): number => diaLocal(ms, ctx.cal)
  const primeira = entradas.reduce((m, e) => Math.min(m, e.criado_em), Infinity)
  const inicioHistorico =
    primeira === Infinity ? Infinity : primeiroDiaDoMes(mesDeDia(diaDe(primeira)))

  const slugs = new Map<string, string>()
  const sl = (t: string): string => {
    let v = slugs.get(t)
    if (v === undefined) slugs.set(t, (v = slug(t)))
    return v
  }
  const passa = (e: (typeof entradas)[number]): boolean =>
    (f.equipe.length === 0 || f.equipe.includes(sl(e.equipe))) &&
    (f.sistema.length === 0 || f.sistema.includes(sl(e.sistema))) &&
    (f.tipo.length === 0 || (f.tipo as readonly TipoCard[]).includes(e.tipo))
  const porMes = new Map<string, number>()
  for (const e of entradas) {
    if (!passa(e)) continue
    const mes = mesDeDia(diaDe(e.criado_em))
    porMes.set(mes, (porMes.get(mes) ?? 0) + 1)
  }

  const meses = baldes.map((b) => ({
    ano: Number(b.chave.slice(0, 4)),
    mes: Number(b.chave.slice(5, 7)),
    entradas:
      b.fimDia < inicioHistorico || inicioHistorico === Infinity
        ? null
        : (porMes.get(b.chave) ?? 0),
    emAndamento: b.emAndamento,
  }))
  const comDado = meses.filter((m) => m.entradas !== null)
  const fechados = comDado.filter((m) => !m.emAndamento)
  const anos = [...new Set(meses.map((m) => m.ano))].map((ano) => ({
    ano,
    meses: Array.from({ length: 12 }, (_, i) => {
      const m = meses.find((x) => x.ano === ano && x.mes === i + 1)
      return { mes: i + 1, entradas: m?.entradas ?? null, emAndamento: m?.emAndamento ?? false }
    }),
  }))
  const total = comDado.reduce((s, m) => s + (m.entradas as number), 0)
  return {
    base: baseAmostral(total, 'demandas criadas', janela),
    criterios: crit,
    anos: comDado.length === 0 ? [] : anos,
    marcacoes: crit.serie,
    mesesComDado: fechados.length,
    mediaMensal:
      fechados.length === 0
        ? null
        : r2(fechados.reduce((s, m) => s + (m.entradas as number), 0) / fechados.length),
    historicoCurto: fechados.length < MESES_FECHADOS_T11,
  }
}
