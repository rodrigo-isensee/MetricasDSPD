import { LIMIARES_ACHADO_PADRAO } from '@metricas-dspd/metricas/businessmap';
import type { Esquemas } from '../../plataforma/db/esquemas.js';
import type { Consultavel } from '../../plataforma/db/pool.js';

/**
 * Versão de critério da aba Apontamento (T2.6; pedido 059, decisão do dono de 2026-11-02, pergunta 7): os limiares PROVISÓRIOS dos achados
 * viram uma linha em `ref_versao_criterio` (domínio `businessmap`) com a data de vigência, para os gráficos marcarem a mudança quando forem
 * revistos (com 4 semanas de dado real). Os números vêm da constante única da biblioteca (`LIMIARES_ACHADO_PADRAO`), nunca repetidos aqui.
 * Idempotente pela `referencia`. Escrita em `dspd_core` por quem tem privilégio de referência (o migrador); nunca pelo coletor nem pela rota.
 */
export const METRICA_ACHADOS_APONTAMENTO = 'apontamento-achados';
export type CriterioApontamento = { referencia: string; descricao: string; motivo: string; metricas: readonly string[] };

const L = LIMIARES_ACHADO_PADRAO;
export const CRITERIOS_APONTAMENTO: readonly CriterioApontamento[] = [
  {
    referencia: '059:limiares-achados',
    descricao: `Limiares provisórios dos achados da aba Apontamento: não classificado ${L.naoClassificadoPct}% das horas, sem comentário ${L.semComentarioPct}%, `
      + `concentração ${L.concentracaoPct}% num projeto, ${L.diasAtipicos} dia(s) atípico(s) ou mais, variação de utilização ${L.variacaoUtilizacaoPp} pontos`,
    motivo: 'Decisão do dono (pedido 059, 2026-11-02, pergunta 7): a especificação não define "alto"; valores provisórios, revistos com 4 semanas de dado real. Afeta só os achados.',
    metricas: [METRICA_ACHADOS_APONTAMENTO],
  },
];

/** Registra as que faltam, com a data civil `vigenteDesde` (AAAA-MM-DD). Devolve as referências gravadas agora. */
export async function registrarCriteriosApontamento(db: Consultavel, S: Esquemas, vigenteDesde: string, agora: Date): Promise<string[]> {
  const gravadas: string[] = [];
  for (const c of CRITERIOS_APONTAMENTO) {
    const existe = await db.query(`SELECT 1 FROM ${S.core}.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = $1`, [c.referencia]);
    if (existe.rows.length > 0) continue;
    const r = await db.query<{ versao_id: string }>(
      `INSERT INTO ${S.core}.ref_versao_criterio (vigente_desde, dominio, descricao, motivo, referencia, registrado_em)
       VALUES ($1, 'businessmap', $2, $3, $4, $5) RETURNING versao_id`, [vigenteDesde, c.descricao, c.motivo, c.referencia, agora.toISOString()]);
    const id = r.rows[0]!.versao_id;
    for (const m of c.metricas) await db.query(`INSERT INTO ${S.core}.ref_versao_criterio_metrica (versao_id, metrica_id) VALUES ($1, $2)`, [id, m]);
    gravadas.push(c.referencia);
  }
  return gravadas;
}
