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
