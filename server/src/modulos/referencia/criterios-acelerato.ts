import type { Esquemas } from '../../plataforma/db/esquemas.js';
import type { Consultavel } from '../../plataforma/db/pool.js';

/**
 * Versões de critério do Acelerato (T2.6; plano 056 §0 D-7 e D-10; data-model §4): cada mudança de critério de cálculo vira uma linha em
 * `ref_versao_criterio` (domínio `acelerato`) com a data de vigência e as métricas afetadas, para os gráficos marcarem a quebra. Idempotente
 * pela `referencia`: registrar de novo não duplica. Escrita em `dspd_core` por quem tem privilégio de referência (o migrador); nunca pelo coletor.
 */
export type CriterioAcelerato = { referencia: string; descricao: string; motivo: string; metricas: readonly string[] };

export const CRITERIOS_ACELERATO: readonly CriterioAcelerato[] = [
  {
    referencia: '056:D-7',
    descricao: 'Tempo por etapa do Acelerato vem do relógio da ferramenta (tempoSla), não de instantes de entrada e saída',
    motivo: 'Decisão do dono D-7 (pedido 056): a tabela só traz o total por etapa; exceção à D-3. Afeta S4, S9 e S10.',
    metricas: ['S4', 'S9', 'S10'],
  },
  {
    referencia: '056:D-10',
    descricao: 'S8 pelo campo "Este problema já ocorreu nos últimos 90 dias?", denominador = todos os criados',
    motivo: 'Decisão do dono D-10 (pedido 056): o campo cobre cerca de 2,7% dos chamados, então a taxa subestima. Afeta S8.',
    metricas: ['S8'],
  },
];

/** Registra as que faltam, com a data civil `vigenteDesde` (AAAA-MM-DD). Devolve as referências gravadas agora. */
export async function registrarCriteriosAcelerato(db: Consultavel, S: Esquemas, vigenteDesde: string, agora: Date): Promise<string[]> {
  const gravadas: string[] = [];
  for (const c of CRITERIOS_ACELERATO) {
    const existe = await db.query(`SELECT 1 FROM ${S.core}.ref_versao_criterio WHERE dominio = 'acelerato' AND referencia = $1`, [c.referencia]);
    if (existe.rows.length > 0) continue;
    const r = await db.query<{ versao_id: string }>(
      `INSERT INTO ${S.core}.ref_versao_criterio (vigente_desde, dominio, descricao, motivo, referencia, registrado_em)
       VALUES ($1, 'acelerato', $2, $3, $4, $5) RETURNING versao_id`, [vigenteDesde, c.descricao, c.motivo, c.referencia, agora.toISOString()]);
    const id = r.rows[0]!.versao_id;
    for (const m of c.metricas) await db.query(`INSERT INTO ${S.core}.ref_versao_criterio_metrica (versao_id, metrica_id) VALUES ($1, $2)`, [id, m]);
    gravadas.push(c.referencia);
  }
  return gravadas;
}
