import type { Dominio, EstadoColeta, PaginaColetas, VersaoCriterio } from '@metricas-dspd/contratos';
import { isoLocal, montarEstadoColeta, paginarColetas } from '@metricas-dspd/metricas/core';
import type { Esquemas } from '../../plataforma/db/esquemas.js';
import type { Consultavel } from '../../plataforma/db/pool.js';
import { lerEventos, lerFimUltimaColetaOk, lerVersoes } from './repositorio.js';

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

/** Fim da última coleta bem-sucedida em ISO local (-03:00), ou `null`. Uma fonte por chamada. */
export async function ultimaColetaOk(db: Consultavel, dominio: Dominio, S?: Esquemas): Promise<string | null> {
  const fim = await lerFimUltimaColetaOk(db, dominio, S);
  return fim === null ? null : isoLocal(fim.getTime());
}

/** Versões de critério (T2.6) das fontes e da pesquisa (PV1), cada uma com as suas, em ordem de data (desempate por id). */
export async function criterios(db: Consultavel, S?: Esquemas): Promise<VersaoCriterio[]> {
  const todas = [
    ...(await lerVersoes(db, 'businessmap', S)), ...(await lerVersoes(db, 'acelerato', S)), ...(await lerVersoes(db, 'pesquisa', S)),
  ];
  return todas.sort((a, b) => a.data.localeCompare(b.data) || Number(a.id) - Number(b.id));
}
