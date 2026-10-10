import type { Dominio, EstadoColeta, PaginaColetas } from '@metricas-dspd/contratos';
import { montarEstadoColeta, paginarColetas } from '@metricas-dspd/metricas/core';
import type { Kysely } from 'kysely';
import { lerEventos, lerVersoes } from './repositorio.js';

/** Estado de UMA fonte; regras (selo, calibração, falhas de 14 dias) vêm de `packages/metricas`. */
export async function estadoColeta(db: Kysely<unknown>, dominio: Dominio, agora: Date): Promise<EstadoColeta> {
  const eventos = await lerEventos(db, dominio);
  const versoes = await lerVersoes(db, dominio);
  return montarEstadoColeta(dominio, eventos, versoes, agora.getTime());
}

/** Histórico paginado (20), mais recente primeiro. `pagina` inteira >= 1 (valida a rota). */
export async function historicoColetas(db: Kysely<unknown>, dominio: Dominio, pagina: number): Promise<PaginaColetas> {
  return paginarColetas(await lerEventos(db, dominio), pagina);
}
