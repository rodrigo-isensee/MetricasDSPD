import { describe, expect, it } from 'vitest';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';
import { gravarLeitura, projetarToque } from '../src/modulos/businessmap/toque-gravacao.js';
import type { ResultadoToque } from '../src/modulos/businessmap/toque.js';
import { criarDublePg } from './duble-pg.js';

// Pedido 105, B7b (O22, ADR 0020 R6-3, R6-4 e R6-6): a gravação só leva escalares e a projeção do `dim_card` sai do controle e da staging. O SQL de verdade é provado
// contra o PostgreSQL em `toque-base.pg.test.ts`; aqui, o que vai nos parâmetros e que nada de pessoa ou texto passa.
const S = montarEsquemas('');
const AGORA = new Date('2026-11-16T12:00:00Z');
const base: ResultadoToque = { cardId: '7', revisaoLida: 3, estado: 'lido', motivo: null, eventos: [], revisoesSemAutor: 0, comentariosExternos: 0 };

describe('gravarLeitura (R6-3 e R6-4)', () => {
  it('eventos e linha de controle do card: os eventos por unnest com ON CONFLICT DO NOTHING e só escalares nos parâmetros', async () => {
    const { pool, chamadas } = criarDublePg((c) => (c.texto.includes('stg_toque_instante') ? { rows: [], rowCount: 2 } : []));
    const novos = await gravarLeitura(pool, S, 9, AGORA, {
      ...base, eventos: [{ eventoId: 'r2', ocorridoEm: Date.parse('2026-11-02T10:01:00Z'), contaComoToque: true }, { eventoId: 'c5', ocorridoEm: Date.parse('2026-11-02T10:30:00Z'), contaComoToque: false }],
    });
    expect(novos).toBe(2);
    expect(chamadas).toHaveLength(2);
    expect(chamadas[0]!.texto).toContain('ON CONFLICT ON CONSTRAINT uq_stg_toque_instante DO NOTHING');
    expect(chamadas[0]!.valores).toEqual(['7', ['r2', 'c5'], ['2026-11-02T10:01:00.000Z', '2026-11-02T10:30:00.000Z'], [true, false], AGORA, 9]);
    expect(chamadas[1]!.texto).toContain('ON CONFLICT ON CONSTRAINT uq_ctl_toque_leitura DO NOTHING');
    expect(chamadas[1]!.valores).toEqual(['7', 9, 3, AGORA, 'lido', null]);
    expect(chamadas[0]!.texto + chamadas[1]!.texto).not.toMatch(/user_id|author|payload|attachments/);
  });

  it('leitura incompleta: nenhum evento, só a linha de controle com o motivo; contagem nula do driver vira zero', async () => {
    const { pool, chamadas } = criarDublePg();
    const novos = await gravarLeitura(pool, S, 9, AGORA, { ...base, revisaoLida: null, estado: 'leitura_incompleta', motivo: 'revisao_invalida' });
    expect(novos).toBe(0);
    expect(chamadas).toHaveLength(1);
    expect(chamadas[0]!.valores).toEqual(['7', 9, null, AGORA, 'leitura_incompleta', 'revisao_invalida']);
    const nulo = criarDublePg(() => ({ rows: [], rowCount: undefined }));
    expect(await gravarLeitura(nulo.pool, S, 9, AGORA, { ...base, eventos: [{ eventoId: 'r2', ocorridoEm: 0, contaComoToque: false }] })).toBe(0);
  });
});

describe('projetarToque (R6-6)', () => {
  it('lista vazia não vai ao banco', async () => {
    const { pool, chamadas } = criarDublePg();
    expect(await projetarToque(pool, S, [])).toBe(0);
    expect(chamadas).toHaveLength(0);
  });

  it('uma consulta com a regra: sem controle é nao_lido, só lido olha os eventos, e o toque é estritamente depois de criado_em', async () => {
    const { pool, chamadas } = criarDublePg(() => ({ rows: [], rowCount: 2 }));
    expect(await projetarToque(pool, S, ['1', '2'])).toBe(2);
    expect(chamadas).toHaveLength(1);
    const t = chamadas[0]!.texto;
    expect(t).toContain("WHEN l.estado IS NULL THEN 'nao_lido'");
    expect(t).toContain("WHEN l.estado = 'lido' THEN CASE WHEN m.primeiro IS NULL THEN 'sem_toque' ELSE 'com_toque' END");
    expect(t).toContain('ELSE l.estado END AS situacao');
    expect(t).toContain('conta_como_toque AND ocorrido_em > c.criado_em');
    expect(t).toContain('IS DISTINCT FROM');
    expect(chamadas[0]!.valores).toEqual([['1', '2']]);
  });

  it('contagem nula do driver vira zero', async () => {
    const { pool } = criarDublePg(() => ({ rows: [], rowCount: undefined }));
    expect(await projetarToque(pool, S, ['1'])).toBe(0);
  });
});
