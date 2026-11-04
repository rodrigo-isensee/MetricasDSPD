import { describe, expect, it } from 'vitest';
import { exigirMockSemColetaReal } from '../src/plataforma/db/guarda-mock.js';
import { carregarConfigApi } from '../src/plataforma/config.js';
import { criarDublePg } from './duble-pg.js';

const S = { bm: 'dspd_bm', ac: 'dspd_ac' };
const comColeta = (esquema: string) => (c: { texto: string }) => (c.texto.includes(`${esquema}.ctl_coleta`) ? [{ n: '3' }] : [{ n: '0' }]);

describe('guarda do modo mock na partida da API (revisão de segurança A1)', () => {
  it('base sem coleta real nos dois esquemas: passa', async () => {
    const { pool, chamadas } = criarDublePg(() => [{ n: '0' }]);
    await expect(exigirMockSemColetaReal(pool, S)).resolves.toBeUndefined();
    expect(chamadas).toHaveLength(2);
  });
  it('coleta real no esquema do BusinessMap: recusa só com tabela e contagem', async () => {
    const { pool } = criarDublePg(comColeta('dspd_bm'));
    let msg = '';
    try { await exigirMockSemColetaReal(pool, S); } catch (e) { msg = String(e); }
    expect(msg).toContain('dspd_bm.ctl_coleta: 3 linha(s) de coleta real');
    expect(msg).not.toContain('dspd_ac');
    expect(msg).not.toContain('DSPD_MODO_MOCK');
  });
  it('coleta real no esquema do Acelerato: recusa', async () => {
    const { pool } = criarDublePg(comColeta('dspd_ac'));
    await expect(exigirMockSemColetaReal(pool, S)).rejects.toThrow('dspd_ac.ctl_coleta: 3 linha(s) de coleta real');
  });
});

describe('mensagem de recusa das variáveis antigas', () => {
  it('não indica a variável que liga o modo mock', () => {
    let msg = '';
    try { carregarConfigApi({ PG_API_URL: 'postgres://u:s@h:5432/d', DADOS_FONTE: 'mock' }); } catch (e) { msg = String(e); }
    expect(msg).toContain('variável removida no pedido 060');
    expect(msg).not.toContain('DSPD_MODO_MOCK');
  });
});
