import type pg from 'pg';
import { criarPool } from '../../plataforma/db/pool.js';

// Pedido 059 (ADR 0020 revisão 4, R4-5): o pool do papel `dspd_api_apontamento` é aberto só aqui. Nenhum outro módulo o importa (regra de lint
// do `eslint.config.js`, sem diretiva inline); a fronteira real é o privilégio do papel no banco.
export function abrirPoolApontamento(url: string, log: (msg: string, contexto: { aplicacao: string; erro: string }) => void): pg.Pool {
  return criarPool(url, { statementTimeoutMs: 10_000, max: 4, aplicacao: 'dspd-api-apontamento', log });
}
