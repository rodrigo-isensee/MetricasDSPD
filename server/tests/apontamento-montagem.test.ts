import { describe, expect, it } from 'vitest';
import { montarDepsApontamento } from '../src/modulos/businessmap/apontamento/montagem.js';
import { carregarConfigApontamentoBusinessMap } from '../src/plataforma/config.js';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';
import { criarDublePg, type Chamada, type Resposta } from './duble-pg.js';

// Pedido 059, E2.19: montagem das dependências da coleta (dicionário do banco ligado à função da biblioteca) e config do comando.
const S = montarEsquemas('');
const SAL = 'sal-de-teste-com-pelo-menos-32-bytes!!';
const dicionario = (c: Chamada): Resposta => {
  const t = c.texto;
  if (t.includes('SELECT referencia')) return [{ referencia: `059:ref-apontamento:v9:${'c'.repeat(64)}` }];
  if (t.includes('FROM dspd_bm.ref_apontamento_subgrupo')) return [{ codigo: 'testes', rotulo: 'Testes', prioridade: 2 }, { codigo: 'nao-classificado', rotulo: 'NC', prioridade: 12 }];
  if (t.includes('FROM dspd_bm.ref_apontamento_termo')) return [{ subgrupo_codigo: 'testes', termo_normalizado: 'teste' }];
  return [];
};

describe('montarDepsApontamento', () => {
  it('liga o dicionário do banco à função da biblioteca: o classificador devolve subgrupo, flags, palavras e a versão do arquivo carregado', async () => {
    const db = criarDublePg(dicionario);
    const cliente = { get: () => Promise.reject(new Error('sem rede')) };
    const agora = (): Date => new Date('2026-11-02T12:00:00Z');
    const d = await montarDepsApontamento({ cliente, pool: db.pool, S, sal: SAL, hostBase: 'bm.exemplo.test', agora });
    expect(d).toMatchObject({ cliente, pool: db.pool, S, sal: SAL, hostBase: 'bm.exemplo.test', agora });
    expect(d.classificar({ comentario: 'Teste de regressão do módulo', typeId: null })).toEqual({ subgrupo: 'testes', flags: 0, qtdPalavras: 5, versaoDicionario: 'v9' });
    expect(d.classificar({ comentario: null, typeId: null })).toMatchObject({ subgrupo: 'nao-classificado', versaoDicionario: 'v9' });
  });
  it('sem dicionário carregado: falha com a instrução, antes de qualquer chamada à API', async () => {
    const db = criarDublePg();
    let chamadas = 0;
    const cliente = { get: () => { chamadas += 1; return Promise.reject(new Error('não deveria chamar')); } };
    await expect(montarDepsApontamento({ cliente, pool: db.pool, S, sal: SAL, hostBase: 'x', agora: () => new Date() })).rejects.toMatchObject({ codigo: 'dicionario' });
    expect(chamadas).toBe(0);
  });
});

describe('config do comando bm:apontamento', () => {
  const base = { BUSINESSMAP_URL_BASE: 'https://exemplo.kanbanize.com/api/v2', BUSINESSMAP_APIKEY: 'chave-de-teste', PG_COLETOR_URL: 'postgres://dspd_coletor:coletor_dev@127.0.0.1:5432/metricas' };
  it('exige o banco do coletor e o sal (aqui obrigatório); não exige o papel de referência', () => {
    expect(carregarConfigApontamentoBusinessMap({ ...base, PESSOA_ELIMINADA_SAL: SAL })).toMatchObject({ PG_COLETOR_URL: base.PG_COLETOR_URL, PESSOA_ELIMINADA_SAL: SAL, BUSINESSMAP_LIMITE_POR_MINUTO: 25 });
    expect(() => carregarConfigApontamentoBusinessMap(base)).toThrow(/^Configuração inválida \(variáveis: PESSOA_ELIMINADA_SAL\)$/);
    expect(() => carregarConfigApontamentoBusinessMap({ ...base, PESSOA_ELIMINADA_SAL: 'curto' })).toThrow(/PESSOA_ELIMINADA_SAL/);
    expect(() => carregarConfigApontamentoBusinessMap({ ...base, PESSOA_ELIMINADA_SAL: SAL, PG_COLETOR_URL: 'nao-url' })).toThrow(/PG_COLETOR_URL/);
    expect(() => carregarConfigApontamentoBusinessMap({ ...base, PESSOA_ELIMINADA_SAL: SAL, BUSINESSMAP_APIKEY: '' })).toThrow(/BUSINESSMAP_APIKEY/);
  });
});
