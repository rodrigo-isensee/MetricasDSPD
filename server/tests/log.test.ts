import { Writable } from 'node:stream';
import pino from 'pino';
import { describe, expect, it } from 'vitest';
import { opcoesLog } from '../src/plataforma/log.js';

const registrar = (obj: object): string => {
  let saida = '';
  const destino = new Writable({ write(c, _e, cb) { saida += String(c); cb(); } });
  pino(opcoesLog('info'), destino).info(obj, 'teste');
  return saida;
};

describe('redact do logger: a apikey do BusinessMap nunca chega ao log', () => {
  const SEGREDO = 'chave-secreta-de-teste-0123456789';
  it.each([
    ['apikey', { apikey: SEGREDO }],
    ['*.apikey', { cfg: { apikey: SEGREDO } }],
    ['*.headers.apikey', { req: { headers: { apikey: SEGREDO } } }],
    ['*.*.headers.apikey', { erro: { config: { headers: { apikey: SEGREDO } } } }],
  ])('%s', (_caminho, obj) => {
    const saida = registrar(obj);
    expect(saida).not.toContain(SEGREDO);
    expect(saida).toContain('[redigido]');
  });
});

describe('redact do logger: o comentário do apontamento e o nome de pessoa nunca chegam ao log (059, ADR 0020 R4-2)', () => {
  const MARCADOR = 'MARCADOR-COMENTARIO-059';
  it.each([
    ['*.comment', { apontamento: { comment: MARCADOR } }],
    ['*.comentario', { apontamento: { comentario: MARCADOR } }],
    ['*.realname', { usuario: { realname: MARCADOR } }],
    ['*.responsavel_nome', { linha: { responsavel_nome: MARCADOR } }],
    ['*.*.comment', { lote: { item: { comment: MARCADOR } } }],
    ['*.*.comentario', { lote: { item: { comentario: MARCADOR } } }],
    ['*.*.realname', { lote: { item: { realname: MARCADOR } } }],
    ['*.*.responsavel_nome', { lote: { item: { responsavel_nome: MARCADOR } } }],
  ])('%s', (_caminho, obj) => {
    const saida = registrar(obj);
    expect(saida).not.toContain(MARCADOR);
    expect(saida).toContain('[redigido]');
  });
});
