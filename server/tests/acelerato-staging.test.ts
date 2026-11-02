import { describe, expect, it } from 'vitest';
import { esperar } from '../src/modulos/acelerato/coletor.js';
import { registrarFalha } from '../src/modulos/acelerato/controle.js';
import { ErroColeta } from '../src/modulos/acelerato/erros.js';
import { gravarChamado, gravarEtapa, hashDe, type VersaoAtual } from '../src/modulos/acelerato/staging.js';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';
import { criarDublePg } from './duble-pg.js';

const S = montarEsquemas('');
const AGORA = new Date('2026-10-30T12:00:00Z');
const SEM = { ausente: false, fora: false };
const payload = { status: 'A', sincronizado_em: '2026-01-01 00:00:00' };
const atual = (p: Record<string, unknown>, sk = '9'): VersaoAtual => ({ sk, sha: hashDe(p, SEM), payload: p, ...SEM });

describe('hash do staging', () => {
  it('cobre o registro filtrado e as marcas; os carimbos da cópia (sincronizado_em, estatisticas_em) ficam fora', () => {
    expect(hashDe({ ...payload, sincronizado_em: '2030-01-01 00:00:00', estatisticas_em: 'x' }, SEM)).toEqual(hashDe(payload, SEM));
    expect(hashDe(payload, { ausente: true, fora: false })).not.toEqual(hashDe(payload, SEM));
    expect(hashDe(payload, { ausente: false, fora: true })).not.toEqual(hashDe(payload, SEM));
    expect(hashDe({ ...payload, status: 'B' }, SEM)).not.toEqual(hashDe(payload, SEM));
  });
});

describe('gravarChamado e gravarEtapa: conflito de cadeia', () => {
  const ctx = (pool: ReturnType<typeof criarDublePg>['pool']) => ({ db: pool, S, coletaId: 4, agora: AGORA });

  it('chamado: ON CONFLICT ON CONSTRAINT com DO NOTHING, schema qualificado, parâmetros na ordem; sem anterior = anterior_sk nulo', async () => {
    const { pool, chamadas } = criarDublePg(() => [{ stg_sk: '1' }]);
    expect((await gravarChamado(ctx(pool), '42', undefined, payload, SEM)).resultado).toBe('inserido');
    expect(chamadas[0]!.texto).toContain('INSERT INTO dspd_ac.stg_chamado');
    expect(chamadas[0]!.texto).toContain('ON CONFLICT ON CONSTRAINT uq_stg_chamado DO NOTHING RETURNING stg_sk');
    expect(chamadas[0]!.texto).not.toMatch(/DO UPDATE/);
    expect(chamadas[0]!.valores.slice(0, 2)).toEqual(['42', null]);
    expect(chamadas[0]!.valores[3]).toBe(JSON.stringify(payload));
  });

  it('chamado: zero linhas (outra escrita sobre a mesma anterior) relê e vira já existente se o conteúdo é o mesmo', async () => {
    let n = 0;
    const { pool } = criarDublePg((c) => {
      if (c.texto.startsWith('SELECT')) return [{ id_origem: '42', stg_sk: '5', payload_sha256: hashDe(payload, SEM), payload, ausente_na_extracao: false, fora_do_recorte: false }];
      return ++n > 0 ? [] : [{ stg_sk: '1' }];
    });
    const r = await gravarChamado(ctx(pool), '42', undefined, payload, SEM);
    expect(r.resultado).toBe('ja_existente');
    expect(r.versao.sk).toBe('5');
  });

  it('etapa: o mesmo conflito, relendo pelo par (chamado, etapa); e persistente falha depois de 5 tentativas', async () => {
    const { pool, chamadas } = criarDublePg((c) => {
      if (c.texto.startsWith('SELECT')) return [{ chamado_id: '42', id_origem: '101', stg_sk: '7', payload_sha256: hashDe(payload, SEM), payload, ausente_na_extracao: false }];
      return [];
    });
    expect((await gravarEtapa(ctx(pool), '42', '101', undefined, payload, false)).resultado).toBe('ja_existente');
    expect(chamadas[1]!.texto).toContain('chamado_id = ANY($1::text[])');
    const vazio = criarDublePg(() => []);
    await expect(gravarEtapa(ctx(vazio.pool), '42', '101', atual({ status: 'Z' }), payload, false)).rejects.toThrow('conflito persistente');
    expect(vazio.chamadas.filter((c) => c.texto.startsWith('INSERT'))).toHaveLength(5);
    const outro = criarDublePg(() => []);
    await expect(gravarChamado(ctx(outro.pool), '42', undefined, payload, SEM)).rejects.toThrow('conflito persistente');
  });

  it('chamado: conflito e, na releitura, a outra escrita trouxe conteúdo diferente: encadeia nela', async () => {
    let inserts = 0;
    const { pool, chamadas } = criarDublePg((c) => {
      if (c.texto.startsWith('SELECT')) return [{ id_origem: '42', stg_sk: '8', payload_sha256: hashDe({ status: 'OUTRO' }, SEM), payload: { status: 'OUTRO' }, ausente_na_extracao: false, fora_do_recorte: false }];
      return ++inserts === 1 ? [] : [{ stg_sk: '11' }];
    });
    expect((await gravarChamado(ctx(pool), '42', undefined, payload, SEM)).resultado).toBe('inserido');
    expect(chamadas.filter((c) => c.texto.startsWith('INSERT')).map((c) => c.valores[1])).toEqual([null, '8']);
  });

  it('chamado: hash diferente da última encadeia na anterior', async () => {
    const { pool, chamadas } = criarDublePg(() => [{ stg_sk: '10' }]);
    await gravarChamado(ctx(pool), '42', atual({ status: 'Z' }, '9'), payload, SEM);
    expect(chamadas[0]!.valores[1]).toBe('9');
  });
});

describe('controle e utilidades', () => {
  it('falha sem entidade nem id: entidade padrão "coleta", id nulo, só o código', async () => {
    const { pool, chamadas } = criarDublePg(() => [{ coleta_id: '3' }]);
    await registrarFalha(pool, S, { tarefa: 'varredura', iniciadoEm: AGORA, finalizadoEm: AGORA, erro: new ErroColeta('rede'), tentativas: 3 });
    expect(chamadas[0]!.valores).toEqual(['varredura', AGORA, AGORA, 'acelerato-f1/1', 'rede']);
    expect(chamadas[1]!.valores).toEqual([3, 'coleta', null, 3, 'rede']);
  });
  it('esperar devolve depois do tempo', async () => {
    const t = Date.now();
    await esperar(5);
    expect(Date.now() - t).toBeGreaterThanOrEqual(4);
  });
});
