import type { Esquemas } from '../../plataforma/db/esquemas.js';
import type { Consultavel } from '../../plataforma/db/pool.js';

/**
 * Versão de critério da separação pela prioridade nativa do BusinessMap (T2.6; pedido 105, E7.100, decisões do dono de 2026-11-16: "para esses casos use
 * o campo de urgência do BM" e "leitura 2"): O6, O24, T1, T2, T4 e T6 passam a separar por Crítica, Alta, Média e Baixa (campo `priority` do card), em vez
 * da classe de serviço por etiqueta. O24 usa a fila da prioridade Média no lugar da Padrão (P-1); card sem prioridade fica fora e é contado, nunca Média por
 * omissão (P-3); os 60 dias de dado limpo do SLE recomeçam na troca (P-5). A vigência é a do dia em que o eixo novo vai ao ar (a entrada recebe a data),
 * nunca a da decisão. Substitui a `105:classe-por-etiqueta`, que nunca foi gravada.
 * Idempotente pela `referencia`. Escrita em `dspd_core` por quem tem privilégio de referência (o migrador); nunca pelo coletor nem pela rota.
 */
export const METRICAS_COM_CLASSE_SERVICO = ['O6', 'O24', 'T1', 'T2', 'T4', 'T6'] as const;
export const REFERENCIA_CLASSE_SERVICO = '105:classe-pela-prioridade';
export const CRITERIO_CLASSE_SERVICO = {
  referencia: REFERENCIA_CLASSE_SERVICO,
  descricao: 'Separação pela prioridade nativa do BusinessMap (Crítica, Alta, Média, Baixa) em vez da classe de serviço por etiqueta; O24 usa a fila da prioridade Média; card sem prioridade fica fora da separação e é contado',
  motivo: 'Decisão do dono (pedido 105, 2026-11-16): o campo de urgência do BusinessMap separa as métricas por prioridade; sem prioridade não é Média; os 60 dias de dado limpo do SLE recomeçam na troca. Afeta as métricas que dividem ou filtram pelo eixo.',
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
