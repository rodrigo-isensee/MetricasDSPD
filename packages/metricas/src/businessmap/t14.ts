import type { FiltrosFluxo, Granularidade, ResultadoT14 } from '@metricas-dspd/contratos'
import { diaDeIso, diaLocal } from '../core/calendario'
import { taxa } from '../core/estatistica'
import { ordenarNeutro } from '../core/ordenar'
import { slug } from '../slug'
import { baseAmostral, criterios, periodoDe } from './comum'
import { chaveOutrosPublicavel, type ExtensaoTambemBM } from './extensao'
import type { ContextoBM, MarcosCard } from './indice'

/** Granularidades contadas no T14 (CA-32): demanda por padrão e frente; um bloco cada. O projeto é só o agrupador. */
const GRANULARIDADES_T14 = ['story', 'frente'] as const satisfies readonly Granularidade[]

/**
 * T14: participação do meu time no projeto (Q-T14-1 = B: campo "Time responsável" do card). "Meu time" é a equipe do
 * filtro, e só vale com exatamente UMA equipe (com "Todas" ou várias, `semEquipe` e nada é calculado, CA-28). O filtro
 * de equipe NÃO recorta a população (apagaria os outros times); `sistema` escolhe os projetos e `periodo` mantém os que
 * estiveram em andamento nele (o projeto é contado inteiro, Q-T14-4). Por projeto: `total` de cards não descartados da
 * granularidade, `semTime` (campo vazio, fora do denominador, CA-33), `n` = com time informado, `k` = com o meu time
 * (campo múltiplo conta se o meu estiver entre os marcados, Q-T14-9) e a taxa k de n (percentual só com n >= 20, CA-31).
 * Aparecem os projetos ligados a um sistema do meu time, mesmo com 0%, e os com pelo menos 1 card do meu time (Q-T14-5 = D,
 * CA-41). Ordem pelo total de cards, nunca pela participação (CA-30).
 *
 * Outros times: a biblioteca só conta `meu` x `outro` x `sem valor`. Não monta mapa por equipe, nunca devolve o nome de
 * outra equipe e nunca conta pessoas: o booleano de publicação (R-1 = B: oculto quando somar menos de 2 pessoas) vem
 * calculado fora, em `outrosPublicavel`. Falso ou ausente = `outrosTimes: null` (o resto do projeto sai). Sem a
 * extensão, nenhum card tem time e nada passa de "sem time".
 */
export function calcularT14(
  ctx: ContextoBM,
  f: FiltrosFluxo,
  ext?: ExtensaoTambemBM,
): ResultadoT14 {
  const periodo = periodoDe(ctx, f)
  const crit = criterios('T14', periodo, periodo, ctx)
  if (f.equipe.length !== 1) {
    return {
      base: baseAmostral(0, 'demandas com time informado', periodo),
      criterios: crit,
      equipe: null,
      semEquipe: true,
      porGranularidade: [],
    }
  }
  const meu = f.equipe[0] as string
  // Equipe -> sistemas: a configuração que o mock entrega ou, sem ela, o `ConfigBM` da base (Q-T14-5 = D).
  const equipes =
    ext !== undefined && ext.configEquipes.length > 0
      ? ext.configEquipes
      : ctx.idx.base.config.equipes
  const equipeCfg = equipes.find((e) => slug(e.nome) === meu)
  const sistemasDoMeuTime = new Set((equipeCfg?.sistemas ?? []).map(slug))
  const diaIni = diaDeIso(periodo.inicio)
  const diaFim = diaDeIso(periodo.fim)
  const projetos = ctx.idx.marcos.filter(
    (m) =>
      m.card.granularidade === 'projeto' &&
      m.ativo &&
      (f.sistema.length === 0 || f.sistema.includes(m.slugSistema)) &&
      m.inicio !== null &&
      diaLocal(m.inicio, ctx.cal) <= diaFim &&
      (m.entrega === null || diaLocal(m.entrega, ctx.cal) >= diaIni),
  )
  const cardsPorProjeto = (g: Granularidade): Map<string, MarcosCard[]> => {
    const mapa = new Map<string, MarcosCard[]>()
    for (const m of ctx.idx.marcos) {
      if (m.card.granularidade !== g || !m.ativo || m.projetoId === null) continue
      const l = mapa.get(m.projetoId)
      if (l) l.push(m)
      else mapa.set(m.projetoId, [m])
    }
    return mapa
  }
  const times = ext?.equipeResponsavel ?? {}
  const slugs = new Map<string, string>()
  const slugDe = (t: string): string => {
    let v = slugs.get(t)
    if (v === undefined) slugs.set(t, (v = slug(t)))
    return v
  }
  const blocos = GRANULARIDADES_T14.map((granularidade) => {
    const cards = cardsPorProjeto(granularidade)
    const lista = projetos.flatMap((p) => {
      const doProjeto = cards.get(p.card.card_id) ?? []
      let k = 0
      let semTime = 0
      for (const c of doProjeto) {
        const valor = times[c.card.card_id]
        const marcados =
          valor === undefined || valor === null ? [] : typeof valor === 'string' ? [valor] : valor
        if (marcados.length === 0) semTime++
        else if (marcados.some((v) => slugDe(v) === meu)) k++
      }
      const total = doProjeto.length
      const ligado = sistemasDoMeuTime.has(p.slugSistema)
      if (total === 0 || (!ligado && k === 0)) return []
      const n = total - semTime
      const publicavel =
        ext?.outrosPublicavel[chaveOutrosPublicavel(p.card.card_id, meu, granularidade)] === true
      return [
        {
          projetoId: p.card.card_id,
          codigo: p.card.card_id,
          titulo: p.card.titulo,
          total,
          meuTime: taxa(k, n),
          outrosTimes: publicavel ? n - k : null,
          semTime,
          k,
          n,
        },
      ]
    })
    const k = lista.reduce((s, p) => s + p.k, 0)
    const n = lista.reduce((s, p) => s + p.n, 0)
    return {
      n,
      bloco: {
        granularidade,
        total: taxa(k, n),
        projetos: ordenarNeutro(
          lista.map(({ k: _k, n: _n, ...resto }) => resto),
          (p) => [-p.total, p.codigo],
        ),
      },
    }
  })
  const [demandas, frentes] = blocos as [(typeof blocos)[number], (typeof blocos)[number]]
  return {
    base: baseAmostral(demandas.n, 'demandas com time informado', periodo, {
      n: frentes.n,
      unidade: 'frentes com time informado',
    }),
    criterios: crit,
    equipe: equipeCfg?.nome ?? meu,
    semEquipe: false,
    porGranularidade: blocos.map((b) => b.bloco),
  }
}
