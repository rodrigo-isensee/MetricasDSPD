import { describe, expect, it } from 'vitest';
import { CAMPOS_APONTAMENTO, CAMPOS_CLASSIFICACAO } from '../src/modulos/businessmap/allow-list.js';
import { atualizarHierarquia, escopoDoWorklog, gravarStgApontamento, projetarFatoApontamento, registrarEventos } from '../src/modulos/businessmap/apontamento/gravacao.js';
import { COLUNA_DO_CAMPO, FLAGS, type LinhaClassificada } from '../src/modulos/businessmap/apontamento/registro.js';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';
import { criarDublePg } from './duble-pg.js';

// Pedido 059, A3 (CA-AP-13): o SQL do módulo só grava as colunas da constante e só usa ON CONFLICT com alvo explícito e DO NOTHING.
const REGISTRO = [...CAMPOS_APONTAMENTO.map((c) => COLUNA_DO_CAMPO[c]), ...CAMPOS_CLASSIFICACAO, 'registro_sha256'];

describe('SQL do apontamento: colunas só da constante e ON CONFLICT com alvo explícito (CA-AP-13)', () => {
  const S = montarEsquemas('');
  const linha: LinhaClassificada = {
    logged_time_id: '1', card_id: '2', parent_card_id: null, subtask_id: null, lane_id: null, column_id: null, category_id: null, data_apontamento: '2026-10-20', segundos: 60,
    registrado_em: null, subgrupo_codigo: 'x', flags_qualidade: 0, qtd_palavras: 1, versao_dicionario: 'v', registro_sha256: 'ab'.repeat(32),
  };
  it('o INSERT da staging lista exatamente a allow-list, a classificação e o hash, e carrega o JSON sem comentário nem pessoa', async () => {
    const banco = criarDublePg();
    await gravarStgApontamento(banco.pool, S, [linha], 5, new Date(0));
    const sql = banco.chamadas[0]!.texto;
    const lista = /INSERT INTO dspd_bm\.stg_apontamento \(([^)]*)\)/.exec(sql)![1]!.split(',').map((c) => c.trim());
    expect(lista).toEqual([...REGISTRO, 'coletado_em', 'coleta_id']);
    expect(sql).toContain('ON CONFLICT ON CONSTRAINT uq_stg_apontamento DO NOTHING');
    expect(banco.chamadas[0]!.valores[0]).not.toMatch(/comment|user_id|pessoa/);
  });
  it('A8 do review: a máscara do UPDATE do fato preserva exatamente os bits 8 (hierarquia) e 16 (reservado); a releitura não apaga nenhum dos dois', async () => {
    expect(FLAGS.SEM_INICIATIVA).toBe(8);
    expect(FLAGS.VALOR_ATIPICO).toBe(16);
    const banco = criarDublePg();
    await projetarFatoApontamento(banco.pool, S, [{ ...linha, pessoa_ref: null, type_id: null }], 1, new Date(0));
    const mascara = /flags_qualidade = v\.flags_qualidade \| \(f\.flags_qualidade & (\d+)\)/.exec(banco.chamadas[0]!.texto)![1]!;
    expect(Number(mascara)).toBe(FLAGS.SEM_INICIATIVA | FLAGS.VALOR_ATIPICO);
    // a hierarquia mexe só no bit 8 (e preserva os demais, o 16 inclusive)
    await atualizarHierarquia(banco.pool, S, 1, new Date(0));
    expect(banco.chamadas.map((c) => c.texto).join('\n')).toContain('(f.flags_qualidade & 23) | n.bit');
    expect(31 & ~FLAGS.SEM_INICIATIVA).toBe(23);
  });
  it('nenhum SQL do módulo usa DO UPDATE, SELECT *, DELETE nem ON CONFLICT sem alvo; o SQL só recebe parâmetros posicionais', async () => {
    const banco = criarDublePg();
    const comPessoa = { ...linha, pessoa_ref: null, type_id: null };
    await escopoDoWorklog(banco.pool, S);
    await gravarStgApontamento(banco.pool, S, [linha], 1, new Date(0));
    await projetarFatoApontamento(banco.pool, S, [comPessoa], 1, new Date(0));
    await registrarEventos(banco.pool, S, 'excluido_detectado', [{ logged_time_id: '1', card_id: '2', parent_card_id: null }], '2026-11-04', 1, new Date(0));
    await registrarEventos(banco.pool, S, 'reaparecido', [{ logged_time_id: '1', card_id: '2', parent_card_id: null }], '2026-11-04', 1, new Date(0));
    await atualizarHierarquia(banco.pool, S, 1, new Date(0));
    const todos = banco.chamadas.map((c) => c.texto).join('\n');
    expect(todos).not.toMatch(/DO\s+UPDATE|SELECT\s+\*|\bDELETE\b|TRUNCATE/i);
    expect([...todos.matchAll(/ON CONFLICT(?! ON CONSTRAINT)/g)]).toEqual([]);
    for (const m of todos.matchAll(/ON CONFLICT ON CONSTRAINT (\w+) (\w+ \w+)/g)) expect(m[2]).toBe('DO NOTHING');
    for (const nome of ['uq_stg_apontamento', 'uq_evt_apontamento', 'fato_apontamento_pkey', 'dim_card_raiz_pkey']) expect(todos).toContain(nome);
    expect(registrarEventos).toBeTypeOf('function');
  });
  it('registrarEventos sem itens não toca o banco', async () => {
    const banco = criarDublePg();
    expect(await registrarEventos(banco.pool, S, 'reaparecido', [], '2026-11-04', 1, new Date(0))).toEqual([]);
    expect(banco.chamadas).toHaveLength(0);
  });
});
