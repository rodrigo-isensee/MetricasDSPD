import type { Fonte } from '../../plataforma/config.js';
import { esquemasDoAmbiente, type Esquemas } from '../../plataforma/db/esquemas.js';
import type { Consultavel } from '../../plataforma/db/pool.js';
import { TIPO_COLETA_CONCLUIDA, publicarEvento, type Consumidor } from '../../plataforma/eventos/index.js';

export type StatusFinal = 'sucesso' | 'parcial' | 'falha';
export { TIPO_COLETA_CONCLUIDA };
const SCHEMA = { businessmap: 'bm', acelerato: 'ac' } as const;

/**
 * Fecha a coleta (`ctl_coleta`) e publica `coleta.concluida` na mesma transação: o evento só existe se o
 * fechamento confirmou. `cliente` é o da transação do chamador. Devolve `false` se a coleta não estava em andamento.
 */
export async function fecharColeta(
  cliente: Consultavel,
  c: { fonte: Fonte; coletaId: number | string; status: StatusFinal; erroResumo?: string | null; agora: Date },
  S: Esquemas = esquemasDoAmbiente(),
): Promise<boolean> {
  const r = await cliente.query(
    `UPDATE ${S[SCHEMA[c.fonte]]}.ctl_coleta SET status = $2, finalizado_em = $3, erro_resumo = $4
     WHERE coleta_id = $1 AND status = 'em_andamento'`,
    [c.coletaId, c.status, c.agora, c.erroResumo ?? null],
  );
  if ((r.rowCount ?? 0) === 0) return false;
  await publicarEvento(cliente, { fonte: c.fonte, tipo: TIPO_COLETA_CONCLUIDA, payload: { fonte: c.fonte, coletaId: String(c.coletaId), status: c.status } }, S);
  return true;
}

export type AvisoColeta = { warn: (obj: Record<string, unknown>, msg: string) => void };

/**
 * Consumidor de `coleta.concluida` (módulo `operacao`): `falha`/`parcial` vira alerta. Enquanto não há canal (I-7),
 * o alerta é um log `warn`; o estado fica em `/fontes/:dominio/estado`. Idempotente: só registra log.
 */
export const consumidorColetaConcluida = (log: AvisoColeta): Consumidor => (e) => {
  const p = e.payload as { coletaId?: string; status?: StatusFinal };
  if (p.status === 'falha' || p.status === 'parcial') {
    log.warn({ fonte: e.fonte, coletaId: p.coletaId, status: p.status, eventoId: e.eventoId }, 'coleta concluída com problema');
  }
  return Promise.resolve();
};
