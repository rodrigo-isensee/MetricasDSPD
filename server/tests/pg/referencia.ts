import { slug } from '@metricas-dspd/metricas/core';
import type { BaseMock } from '@metricas-dspd/mock';
import type pg from 'pg';
import type { Esquemas } from '../../src/plataforma/db/esquemas.js';
import { criteriosPorFonte } from '../base-duble.js';

const VIGENTE = '2026-01-01';

/**
 * Referência (`ref_*`) derivada da config do mock, como o `ref:sync` a gravaria (convenções provisórias do módulo `metricas`:
 * valor global com equipe = '*', SLE no percentil 85, natureza em `classe_servico`). Devolve o mapa id do mock -> versao_id.
 */
export async function semearReferencia(db: pg.Pool, E: Esquemas, base: BaseMock): Promise<Map<string, string>> {
  const q = (t: string, v: unknown[] = []) => db.query(t, v);
  const bm = base.bm.config;
  for (const e of bm.equipes) {
    await q(`INSERT INTO ${E.bm}.ref_quadro (quadro_id, vigente_de, equipe, nivel, eh_teste) VALUES ($1, $2, $3, 'time', false)`, [`quadro-${slug(e.nome)}`, VIGENTE, e.nome]);
    await q(`INSERT INTO ${E.bm}.ref_limite_wip_fluxo (equipe, vigente_de, limite) VALUES ($1, $2, $3)`, [e.nome, VIGENTE, bm.limite_wip_fluxo[e.nome]]);
  }
  const dominio = (campo: string, itens: string[]) => Promise.all(itens.map((x, i) =>
    q(`INSERT INTO ${E.bm}.ref_dominio (campo, codigo, vigente_de, rotulo, ordem) VALUES ($1, $2, $3, $2, $4)`, [campo, x, VIGENTE, i])));
  await dominio('sistema', bm.sistemas);
  await dominio('objetivo_estrategico', bm.objetivos);
  await dominio('area_interna', bm.areas_internas);
  await q(`INSERT INTO ${E.bm}.ref_limite_frentes (equipe, vigente_de, limite) VALUES ('*', $1, $2)`, [VIGENTE, bm.limite_frentes]);
  for (const s of bm.sle.filter((x) => x.dias_uteis !== null))
    await q(`INSERT INTO ${E.bm}.ref_sle (equipe, classe_servico, vigente_de, percentil, dias_uteis) VALUES ('*', $1, $2, 85, $3)`, [s.classe, s.publicado_em, s.dias_uteis]);
  for (const a of bm.alocacao)
    await q(`INSERT INTO ${E.bm}.ref_alocacao_acordada (equipe, classe_servico, vigente_de, percentual) VALUES ('*', $1, $2, $3)`, [a.natureza, VIGENTE, a.pct]);
  for (const f of base.bm.fichas) {
    const { card_id, ...ficha } = f;
    await q(`INSERT INTO ${E.bm}.ref_ficha_resultado (card_id, vigente_de, ficha) VALUES ($1, $2, $3::jsonb)`, [card_id, VIGENTE, JSON.stringify(ficha)]);
  }
  for (const a of base.ac.config.alvos)
    await q(`INSERT INTO ${E.ac}.ref_alvo_prioridade (prioridade, vigente_de, prazo_pa_horas_uteis, prazo_r_horas_uteis) VALUES ($1, $2, $3, $4)`, [a.prioridade, VIGENTE, a.primeiro_atendimento_horas, a.restauracao_horas]);
  const { bm: cbm, ac: cac } = criteriosPorFonte(base);
  const ids = new Map<string, string>();
  for (const [dom, lista] of [['businessmap', cbm], ['acelerato', cac]] as const) {
    for (const v of lista) {
      const r = await q(`INSERT INTO ${E.core}.ref_versao_criterio (vigente_desde, dominio, descricao, motivo, referencia, registrado_em)
        VALUES ($1, $2, $3, 'teste', 'teste', now()) RETURNING versao_id`, [v.data, dom, v.descricao]);
      const id = String((r.rows[0] as { versao_id: string }).versao_id);
      ids.set(v.id, id);
      for (const m of v.afeta) await q(`INSERT INTO ${E.core}.ref_versao_criterio_metrica (versao_id, metrica_id) VALUES ($1, $2)`, [id, m]);
    }
  }
  return ids;
}
