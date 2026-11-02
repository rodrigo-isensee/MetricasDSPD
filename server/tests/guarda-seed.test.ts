import { describe, expect, it } from 'vitest';
import { contarColetasDoSeed, contarColetasReais, contarItensReais, descreverColetasDoSeed, PREFIXO_COLETA_SEED } from '../src/plataforma/db/guarda-seed.js';
import { VERSAO_SEED } from '../src/plataforma/db/seed.js';
import { criarDublePg } from './duble-pg.js';

describe('guarda do seed (plano 060, P1)', () => {
  it('o prefixo da guarda é a versão que o seed grava', () => {
    expect(VERSAO_SEED).toBe(PREFIXO_COLETA_SEED);
  });
  it('conta parametrizado, por esquema, e trata linha ausente como zero', async () => {
    const { pool, chamadas } = criarDublePg((c) => (c.texto.includes('dim_card') ? [{ n: '5' }] : []));
    expect(await contarColetasDoSeed(pool, 'x_dspd_bm')).toBe(0);
    expect(await contarColetasReais(pool, 'x_dspd_bm')).toBe(0);
    expect(await contarItensReais(pool, 'x_dspd_bm', 'dim_card')).toBe(5);
    expect(chamadas.every((c) => c.valores[0] === 'seed-mock' && !c.texto.includes('seed-mock'))).toBe(true);
  });
  it('identificador de esquema inválido é recusado antes da consulta', async () => {
    const { pool, chamadas } = criarDublePg();
    await expect(contarColetasDoSeed(pool, 'x; DROP')).rejects.toThrow('identificador inválido');
    expect(chamadas).toHaveLength(0);
  });
  it('a mensagem traz só tabela e contagem', () => {
    expect(descreverColetasDoSeed('dspd_bm', 2)).toBe('dspd_bm.ctl_coleta: 2 linha(s) de coleta do seed; rode o db:limpar-seed antes da coleta real');
  });
});
