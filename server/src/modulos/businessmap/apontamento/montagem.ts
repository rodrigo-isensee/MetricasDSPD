import type { Esquemas } from '../../../plataforma/db/esquemas.js';
import type { PoolLike } from '../../../plataforma/db/pool.js';
import type { ClienteHttp } from '../../../plataforma/http.js';
import type { DepsApontamento } from './coleta.js';
import { carregarDicionario } from './dicionario.js';
import { classificadorDoDicionario } from './registro.js';

// Pedido 059, E2.19: monta as dependências da coleta do worklog para as entradas (`bm:apontamento` e a etapa do `bm:coleta` incremental).
// Lê o dicionário vigente do banco (carregado por `bm:ref-sync-apontamento`) e o liga à função pura da biblioteca. Sem dicionário carregado a
// montagem falha com o aviso, antes de qualquer chamada à API.
export interface EntradaMontagem {
  cliente: Pick<ClienteHttp, 'get'>;
  /** Papel `dspd_coletor`. */
  pool: PoolLike;
  S: Esquemas;
  sal: string;
  hostBase: string;
  agora: () => Date;
}

export async function montarDepsApontamento(e: EntradaMontagem): Promise<DepsApontamento> {
  const dicionario = await carregarDicionario(e.pool, e.S);
  return { cliente: e.cliente, pool: e.pool, S: e.S, classificar: classificadorDoDicionario(dicionario), sal: e.sal, hostBase: e.hostBase, agora: e.agora };
}
