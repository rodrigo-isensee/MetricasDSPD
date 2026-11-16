import { describe, expect, it } from 'vitest';
import { VERSAO_REPROJECAO_ESCALA, reprojetarEscalaAcelerato } from '../src/modulos/acelerato/reprojecao-escala.js';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';
import { criarDublePg, type Chamada } from './duble-pg.js';

// Pedido 105, E7.238: `ac:reprojetar-escala` com o banco falso (dados fictícios).
const S = montarEsquemas('');
const AGORA = new Date('2026-11-16T12:00:00Z');
const FIM = new Date('2026-11-16T12:00:05Z');
const stg = (id: string, prioridade: string | null) => ({
  id_origem: id, stg_sk: '1', payload_sha256: Buffer.alloc(32), ausente_na_extracao: false, fora_do_recorte: false, payload: { prioridade },
});

function montar(lotes: { chamado_id: string }[][], staging: ReturnType<typeof stg>[]) {
  let lote = 0;
  return criarDublePg((q: Chamada) => {
    const t = q.texto;
    if (t.startsWith('SELECT count(*)')) return [{ n: '0' }];
    if (t.includes('INSERT INTO dspd_ac.ctl_coleta ')) return [{ coleta_id: '88' }];
    if (t.includes('FROM dspd_ac.dim_chamado')) return lotes[lote++] ?? [];
    if (t.includes('FROM dspd_ac.stg_chamado')) return staging;
    if (t.startsWith('UPDATE dspd_ac.dim_chamado')) return { rows: [], rowCount: 1 };
    return [];
  });
}
const ids = (...x: string[]) => x.map((chamado_id) => ({ chamado_id }));
const com = (d: ReturnType<typeof montar>, trecho: string): Chamada[] => d.chamadas.filter((x) => x.texto.includes(trecho));
const tempos = (() => { let i = 0; return () => (i++ === 0 ? AGORA : FIM); });

describe('reprojetarEscalaAcelerato', () => {
  it('grava verdadeiro na escala P e falso nas famílias mapeadas; prioridade fora do mapa fica nula e é contada', async () => {
    // 4: sem versão no staging; 5: prioridade nula no payload (nenhum dos dois ganha escala)
    const d = montar([ids('1', '2', '3', '4', '5')], [stg('1', 'P2 - Alta'), stg('2', 'DSPD - INCIDENTE - ALTA'), stg('3', 'DHO - X'), stg('5', null)]);
    const r = await reprojetarEscalaAcelerato(d.pool, S, tempos());
    expect(r).toEqual({ coletaId: 88, lidos: 5, escalaP: 1, outrasEscalas: 1, semEscala: 3 });
    const up = com(d, 'UPDATE dspd_ac.dim_chamado')[0]!;
    expect(up.texto).toContain('d.escala_p IS NULL');
    expect(up.valores).toEqual([['1', '2'], [true, false]]);
    const sel = com(d, 'FROM dspd_ac.dim_chamado')[0]!;
    expect(sel.texto).toContain('escala_p IS NULL AND prioridade IS NOT NULL AND chamado_id > $1');
    expect(d.chamadas[0]!.texto).toBe('BEGIN');
    expect(d.chamadas.at(-1)!.texto).toBe('COMMIT');
  });

  it('registra a execução em ctl_coleta com a versão certa e a fecha com sucesso', async () => {
    const d = montar([ids('1')], [stg('1', 'P1 - Crítica')]);
    await reprojetarEscalaAcelerato(d.pool, S, tempos());
    const ctl = com(d, 'INSERT INTO dspd_ac.ctl_coleta ')[0]!;
    expect(ctl.valores).toEqual([AGORA, VERSAO_REPROJECAO_ESCALA]);
    const fim = com(d, 'UPDATE dspd_ac.ctl_coleta')[0]!;
    expect(fim.valores).toEqual([88, FIM]);
  });

  it('lote só com prioridade fora do mapa: nada é gravado na dimensão e todos contam como sem escala', async () => {
    const d = montar([ids('3')], [stg('3', 'DHO - X')]);
    expect(await reprojetarEscalaAcelerato(d.pool, S, tempos())).toEqual({ coletaId: 88, lidos: 1, escalaP: 0, outrasEscalas: 0, semEscala: 1 });
    expect(com(d, 'UPDATE dspd_ac.dim_chamado')).toHaveLength(0);
  });

  it('sem chamado a preencher não há UPDATE de dimensão', async () => {
    const d = montar([], []);
    expect(await reprojetarEscalaAcelerato(d.pool, S, tempos())).toEqual({ coletaId: 88, lidos: 0, escalaP: 0, outrasEscalas: 0, semEscala: 0 });
    expect(com(d, 'UPDATE dspd_ac.dim_chamado')).toHaveLength(0);
  });
});
