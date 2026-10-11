import { devida, type Tarefa } from './agenda.js';
import type { Fonte } from './config.js';
import { comTravaDaFonte } from './db/trava.js';
import type { PoolLike } from './db/pool.js';
import type { Esquemas } from './db/esquemas.js';
import { processarOutbox, type RegistroConsumidores } from './eventos/index.js';

export type LogWorker = {
  info: (obj: Record<string, unknown>, msg: string) => void;
  error: (obj: Record<string, unknown>, msg: string) => void;
};
export type DepsWorker = {
  /** Pool do papel `dspd_coletor`. */
  pool: PoolLike;
  fontes: readonly Fonte[];
  consumidores: RegistroConsumidores;
  tarefas: readonly Tarefa[];
  agora: () => Date;
  log: LogWorker;
  S?: Esquemas;
};

/**
 * Um ciclo do worker, por fonte: tarefas agendadas devidas (diária e varredura semanal) sob `pg_try_advisory_lock`
 * da fonte, depois o poller da outbox. Falha de uma tarefa ou fonte é registrada e não derruba as outras.
 */
export function criarWorker(d: DepsWorker) {
  const ultima = new Map<string, Date>();

  async function ciclo(): Promise<void> {
    for (const fonte of d.fontes) {
      const agora = d.agora();
      for (const t of d.tarefas.filter((x) => x.fonte === fonte)) {
        if (!devida(t, agora, ultima.get(t.nome) ?? null)) continue;
        try {
          const r = await comTravaDaFonte(d.pool, fonte, t.executar);
          if (r.executou) ultima.set(t.nome, agora);
          else d.log.info({ fonte, tarefa: t.nome }, 'fonte em uso por outra execução; fica para o próximo ciclo');
        } catch (e) {
          d.log.error({ fonte, tarefa: t.nome, err: e }, 'tarefa agendada falhou');
        }
      }
      try {
        const r = await processarOutbox(d.pool, { fonte, agora, consumidores: d.consumidores, S: d.S });
        if (r.processados + r.reagendados + r.falhas > 0) d.log.info({ fonte, ...r }, 'outbox processada');
      } catch (e) {
        d.log.error({ fonte, err: e }, 'poller da outbox falhou');
      }
    }
  }

  /** Laço até o sinal abortar. */
  async function rodar(sinal: AbortSignal, intervaloMs: number, dormir: (ms: number, s: AbortSignal) => Promise<void>): Promise<void> {
    while (!sinal.aborted) {
      await ciclo();
      await dormir(intervaloMs, sinal);
    }
  }
  return { ciclo, rodar };
}

/** Espera `ms` ou o aborto, o que vier primeiro. */
export const dormir = (ms: number, sinal: AbortSignal): Promise<void> =>
  new Promise((resolver) => {
    const fim = (): void => { clearTimeout(t); sinal.removeEventListener('abort', fim); resolver(); };
    const t = setTimeout(fim, ms);
    sinal.addEventListener('abort', fim);
  });
