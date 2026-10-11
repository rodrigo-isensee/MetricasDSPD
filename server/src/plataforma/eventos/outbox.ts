import type { Fonte } from '../config.js';
import { esquemasDoAmbiente, type Esquemas } from '../db/esquemas.js';
import { emTransacao, type Consultavel, type PoolLike } from '../db/pool.js';
import { CATALOGO_EVENTOS, validarPayload, type CatalogoEventos } from './catalogo.js';
import type { RegistroConsumidores } from './consumidores.js';

/** Outbox transacional (ADR 0014): grava na MESMA transação da mudança; lida por polling, uma fonte por execução. */
export type EventoNovo = { fonte: Fonte; tipo: string; payload: unknown };

export const MAX_TENTATIVAS = 8;
export const RETENCAO_DIAS = 30;
export const RESERVA_MS = 5 * 60_000;
const BACKOFF_BASE_MS = 30_000;
const BACKOFF_TETO_MS = 60 * 60_000;

/** Backoff exponencial após a `n`-ésima tentativa (n >= 1): 30 s, 60 s, 120 s... teto de 1 h. */
export const backoffMs = (n: number): number => Math.min(BACKOFF_BASE_MS * 2 ** (n - 1), BACKOFF_TETO_MS);

/**
 * Chame com o cliente da transação que muda o estado: se ela desfizer, o evento também some.
 * O payload é validado pelo schema do tipo (catálogo de eventos) antes de gravar; tipo desconhecido é recusado.
 */
export async function publicarEvento(
  cliente: Consultavel, e: EventoNovo, S: Esquemas = esquemasDoAmbiente(), catalogo: CatalogoEventos = CATALOGO_EVENTOS,
): Promise<string> {
  validarPayload(e.tipo, e.payload, catalogo);
  const r = await cliente.query<{ evento_id: string }>(
    `INSERT INTO ${S.core}.outbox (fonte, tipo, payload) VALUES ($1, $2, $3::jsonb) RETURNING evento_id`,
    [e.fonte, e.tipo, JSON.stringify(e.payload)],
  );
  return r.rows[0]!.evento_id;
}

export type OpcoesProcessar = {
  fonte: Fonte;
  agora: Date;
  consumidores: RegistroConsumidores;
  limite?: number;
  S?: Esquemas;
};
export type ResultadoProcessar = { processados: number; reagendados: number; falhas: number; apagados: number };

type LinhaEvento = { evento_sk: string; evento_id: string; tipo: string; payload: unknown; tentativas: number };

/** Só a categoria vai para `ultimo_erro`: a mensagem pode ter dado sensível. */
const categoria = (e: unknown): string => (e instanceof Error && /^\w{1,60}$/.test(e.name) ? e.name : 'desconhecido');

/**
 * Reserva (FOR UPDATE SKIP LOCKED) os eventos da fonte, confirma a reserva e só então chama os consumidores.
 * Só reserva tipos com consumidor registrado: os demais ficam `pendente`, sem gastar tentativas.
 * Pelo menos uma vez: consumidor é idempotente (chave `eventoId`). Sucesso -> `processado`; erro -> reagenda com
 * backoff; após MAX_TENTATIVAS -> `falha`. Apaga `processado` com mais de RETENCAO_DIAS (única exceção à regra de não apagar).
 */
export async function processarOutbox(pool: PoolLike, o: OpcoesProcessar): Promise<ResultadoProcessar> {
  const S = o.S ?? esquemasDoAmbiente();
  const reservados = await emTransacao(pool, async (c) => {
    const r = await c.query<LinhaEvento>(
      `SELECT evento_sk, evento_id, tipo, payload, tentativas FROM ${S.core}.outbox
       WHERE fonte = $1 AND tipo = ANY($4::text[]) AND ((status = 'pendente' AND disponivel_em <= $2)
                          OR (status = 'processando' AND reservado_ate < $2))
       ORDER BY evento_sk LIMIT $3 FOR UPDATE SKIP LOCKED`,
      [o.fonte, o.agora, o.limite ?? 20, o.consumidores.tipos(o.fonte)],
    );
    if (r.rows.length > 0) {
      await c.query(
        `UPDATE ${S.core}.outbox SET status = 'processando', reservado_ate = $1, tentativas = tentativas + 1
         WHERE evento_sk = ANY($2::bigint[])`,
        [new Date(o.agora.getTime() + RESERVA_MS), r.rows.map((x) => x.evento_sk)],
      );
    }
    return r.rows;
  });

  const res: ResultadoProcessar = { processados: 0, reagendados: 0, falhas: 0, apagados: 0 };
  for (const e of reservados) {
    const tentativas = e.tentativas + 1;
    const consumidor = o.consumidores.obter(o.fonte, e.tipo)!; // o SELECT só traz tipos com consumidor
    try {
      await consumidor({ eventoId: e.evento_id, fonte: o.fonte, tipo: e.tipo, payload: e.payload, tentativas });
      await pool.query(
        `UPDATE ${S.core}.outbox SET status = 'processado', processado_em = $2, reservado_ate = NULL, ultimo_erro = NULL
         WHERE evento_sk = $1 AND status = 'processando'`,
        [e.evento_sk, o.agora],
      );
      res.processados++;
    } catch (erro) {
      const esgotou = tentativas >= MAX_TENTATIVAS;
      await pool.query(
        `UPDATE ${S.core}.outbox SET status = $2, disponivel_em = $3, reservado_ate = NULL, ultimo_erro = $4
         WHERE evento_sk = $1 AND status = 'processando'`,
        [e.evento_sk, esgotou ? 'falha' : 'pendente', new Date(o.agora.getTime() + backoffMs(tentativas)), categoria(erro)],
      );
      if (esgotou) res.falhas++;
      else res.reagendados++;
    }
  }
  const apagados = await pool.query(
    `DELETE FROM ${S.core}.outbox WHERE status = 'processado' AND processado_em < $1`,
    [new Date(o.agora.getTime() - RETENCAO_DIAS * 86_400_000)],
  );
  res.apagados = apagados.rowCount ?? 0;
  return res;
}
