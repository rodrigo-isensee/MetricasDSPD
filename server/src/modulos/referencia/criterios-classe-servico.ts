import type { Esquemas } from '../../plataforma/db/esquemas.js';
import type { Consultavel } from '../../plataforma/db/pool.js';

/**
 * Versão de critério da classe de serviço pelas etiquetas (T2.6; pedido 105, E7.3, decisões do dono de 2026-11-15 12:33 e 12:36): a classe de cada
 * card passa a vir das etiquetas Urgente, Prioritario, PrazoFixo e Padrao (e variações de grafia); Intangível deixa de ser classe; card sem etiqueta
 * de classe fica sem classe. A vigência é a da primeira coleta que grava `classes_tag` (a entrada recebe a data), nunca a da decisão.
 * Idempotente pela `referencia`. Escrita em `dspd_core` por quem tem privilégio de referência (o migrador); nunca pelo coletor nem pela rota.
 */
export const METRICAS_COM_CLASSE_SERVICO = ['O6', 'O24', 'T1', 'T2', 'T4', 'T6'] as const;
export const REFERENCIA_CLASSE_SERVICO = '105:classe-por-etiqueta';
export const CRITERIO_CLASSE_SERVICO = {
  referencia: REFERENCIA_CLASSE_SERVICO,
  descricao: 'Classe de serviço pelas etiquetas do card (Urgente, Prioritário, Prazo fixo, Padrão); Intangível deixa de ser classe; card sem etiqueta de classe fica sem classe',
  motivo: 'Decisão do dono (pedido 105, 2026-11-15): a classe vem da etiqueta do BusinessMap, não de campo; só quatro classes; sem etiqueta não é Padrão. Afeta as métricas que dividem ou filtram por classe.',
  metricas: METRICAS_COM_CLASSE_SERVICO,
} as const;

/** Registra se faltar, com a data civil `vigenteDesde` (AAAA-MM-DD). Devolve as referências gravadas agora (vazio se já existia). */
export async function registrarCriterioClasseServico(db: Consultavel, S: Esquemas, vigenteDesde: string, agora: Date): Promise<string[]> {
  const c = CRITERIO_CLASSE_SERVICO;
  const existe = await db.query(`SELECT 1 FROM ${S.core}.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = $1`, [c.referencia]);
  if (existe.rows.length > 0) return [];
  const r = await db.query<{ versao_id: string }>(
    `INSERT INTO ${S.core}.ref_versao_criterio (vigente_desde, dominio, descricao, motivo, referencia, registrado_em)
     VALUES ($1, 'businessmap', $2, $3, $4, $5) RETURNING versao_id`, [vigenteDesde, c.descricao, c.motivo, c.referencia, agora.toISOString()]);
  const id = r.rows[0]!.versao_id;
  for (const m of c.metricas) await db.query(`INSERT INTO ${S.core}.ref_versao_criterio_metrica (versao_id, metrica_id) VALUES ($1, $2)`, [id, m]);
  return [c.referencia];
}
