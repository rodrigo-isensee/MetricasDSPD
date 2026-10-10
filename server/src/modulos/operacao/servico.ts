import type { Dominio, EstadoColeta, PaginaColetas } from '@metricas-dspd/contratos';
import { montarEstadoColeta, paginarColetas } from '@metricas-dspd/metricas/core';
import type { Esquemas } from '../../plataforma/db/esquemas.js';
import type { Consultavel } from '../../plataforma/db/pool.js';
import { lerEventos, lerVersoes } from './repositorio.js';

/** Estado de UMA fonte; regras (selo, calibração, falhas de 14 dias) vêm de `packages/metricas`. */
export async function estadoColeta(db: Consultavel, dominio: Dominio, agora: Date, S?: Esquemas): Promise<EstadoColeta> {
  const eventos = await lerEventos(db, dominio, S);
  const versoes = await lerVersoes(db, dominio, S);
  return montarEstadoColeta(dominio, eventos, versoes, agora.getTime());
}

/** Histórico paginado (20), mais recente primeiro. `pagina` inteira >= 1 (valida a rota). */
export async function historicoColetas(db: Consultavel, dominio: Dominio, pagina: number, S?: Esquemas): Promise<PaginaColetas> {
  return paginarColetas(await lerEventos(db, dominio, S), pagina);
}
