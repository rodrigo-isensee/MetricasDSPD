import { describe, expect, it, vi } from 'vitest';
import { coletarAcelerato, ErroColeta, projetarAcelerato } from '../src/modulos/acelerato/index.js';
import { coletarApontamentos } from '../src/modulos/businessmap/apontamento/index.js';
import { ErroColetaBm } from '../src/modulos/businessmap/coleta.js';
import { executarColeta, executarProjetor, projetarBusinessMap } from '../src/modulos/businessmap/index.js';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';
import { criarDublePg, type Chamada } from './duble-pg.js';

// Plano 060-sem-mock, P1: a coleta e o projetor do BusinessMap e do Acelerato recusam esquema com coleta `seed-mock`, antes de escrever.
const S = montarEsquemas('');
const agora = (): Date => new Date('2026-11-02T12:00:00Z');
const ehGuarda = (c: Chamada): boolean => c.texto.startsWith('SELECT count(*) AS n FROM') && c.texto.includes('ctl_coleta WHERE starts_with(versao_coletor');
const comSeed = (n = '2') => criarDublePg((c) => (ehGuarda(c) ? [{ n }] : []));
const escritas = (chamadas: Chamada[]): Chamada[] => chamadas.filter((c) => /^(INSERT|UPDATE|DELETE)/.test(c.texto));

describe('BusinessMap recusa esquema com seed', () => {
  it('coletarCards (coleta): recusa antes de qualquer escrita e antes de chamar a API', async () => {
    const { pool, chamadas } = comSeed();
    const get = vi.fn();
    const { coletarCards } = await import('../src/modulos/businessmap/coleta.js');
    const erro = await coletarCards({ cliente: { get }, pool, S, quadros: [1], hostBase: 'h', agora }, { tipo: 'incremental' }).catch((e: unknown) => e);
    expect(erro).toBeInstanceOf(ErroColetaBm);
    expect(erro).toMatchObject({ codigo: 'esquema-com-seed', message: 'dspd_bm.ctl_coleta: 2 linha(s) de coleta do seed; rode o db:limpar-seed antes da coleta real' });
    expect(get).not.toHaveBeenCalled();
    expect(chamadas).toHaveLength(1);
  });
  it('executarColeta (comando): a recusa sobe pelo comando, sob a trava, sem escrever', async () => {
    const { pool, chamadas } = criarDublePg((c) => (ehGuarda(c) ? [{ n: '1' }] : c.texto.includes('pg_try_advisory_lock') ? [{ ok: true }] : []));
    await expect(executarColeta({ cliente: { get: vi.fn() }, poolColetor: pool, S, quadros: [1], hostBase: 'h', agora } as never, { modo: 'incremental' } as never))
      .rejects.toMatchObject({ codigo: 'esquema-com-seed' });
    expect(escritas(chamadas)).toHaveLength(0);
  });
  it('projetor: recusa dentro da transação, sem escrever, e desfaz', async () => {
    const { pool, chamadas } = comSeed('1');
    await expect(projetarBusinessMap({ pool, S, agora })).rejects.toMatchObject({ codigo: 'esquema-com-seed' });
    expect(escritas(chamadas)).toHaveLength(0);
    expect(chamadas.at(-1)!.texto).toBe('ROLLBACK');
    const d2 = criarDublePg((c) => (ehGuarda(c) ? [{ n: '1' }] : c.texto.includes('pg_try_advisory_lock') ? [{ ok: true }] : []));
    await expect(executarProjetor({ pool: d2.pool, S, agora })).rejects.toMatchObject({ codigo: 'esquema-com-seed' });
  });
  it('worklog (bm:apontamento): recusa antes de escrever', async () => {
    const { pool, chamadas } = comSeed();
    await expect(coletarApontamentos({ pool, S, agora, sal: 'x'.repeat(64) } as never, { tipo: 'incremental' })).rejects.toMatchObject({ codigo: 'esquema-com-seed' });
    expect(chamadas).toHaveLength(1);
  });
});

describe('Acelerato recusa esquema com seed', () => {
  it('coleta: recusa sem registrar falha em ctl_coleta e sem abrir o MySQL', async () => {
    const { pool, chamadas } = comSeed();
    const erro = await coletarAcelerato({ pool, S, agora, config: {}, log: { info: vi.fn(), error: vi.fn() } } as never, 'incremental').catch((e: unknown) => e);
    expect(erro).toBeInstanceOf(ErroColeta);
    expect(erro).toMatchObject({ codigo: 'esquema-com-seed', entidade: 'ctl_coleta' });
    expect(chamadas).toHaveLength(1);
  });
  it('projeção: recusa dentro da transação, sem escrever', async () => {
    const { pool, chamadas } = comSeed();
    await expect(projetarAcelerato(pool, S, agora)).rejects.toMatchObject({ codigo: 'esquema-com-seed' });
    expect(escritas(chamadas)).toHaveLength(0);
    expect(chamadas.at(-1)!.texto).toBe('ROLLBACK');
  });
});
