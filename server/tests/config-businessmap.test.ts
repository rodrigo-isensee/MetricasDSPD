import { describe, expect, it } from 'vitest';
import { carregarConfigBusinessMap } from '../src/plataforma/config.js';

const base = { BUSINESSMAP_URL_BASE: 'https://exemplo.kanbanize.com/api/v2', BUSINESSMAP_APIKEY: 'chave-de-teste' };

describe('config do coletor do BusinessMap (F0 do plano 052)', () => {
  it('só as duas obrigatórias: padrões de 25 por minuto, 30 s, página de 100 e nenhum quadro', () => {
    expect(carregarConfigBusinessMap(base)).toMatchObject({
      BUSINESSMAP_URL_BASE: base.BUSINESSMAP_URL_BASE, BUSINESSMAP_LIMITE_POR_MINUTO: 25, BUSINESSMAP_TIMEOUT_MS: 30_000,
      BUSINESSMAP_PAGINA_TAMANHO: 100, BUSINESSMAP_QUADROS_IDS: [],
    });
  });
  it('valores vazios (como no .env.example) valem como não definidos; quadros viram números sem repetição', () => {
    const c = carregarConfigBusinessMap({ ...base, BUSINESSMAP_QUADROS_IDS: '35,23,24,35', BUSINESSMAP_LIMITE_POR_MINUTO: '', BUSINESSMAP_TIMEOUT_MS: '', BUSINESSMAP_PAGINA_TAMANHO: '' });
    expect(c.BUSINESSMAP_QUADROS_IDS).toEqual([35, 23, 24]);
    expect(c.BUSINESSMAP_LIMITE_POR_MINUTO).toBe(25);
    expect(carregarConfigBusinessMap({ ...base, BUSINESSMAP_QUADROS_IDS: '' }).BUSINESSMAP_QUADROS_IDS).toEqual([]);
  });
  it('recusa: ausentes, http, credencial na URL, limite acima de 25, quadros mal formados; a mensagem cita só nomes', () => {
    const ruins: Record<string, string>[] = [
      {}, { BUSINESSMAP_APIKEY: 'x' }, { ...base, BUSINESSMAP_URL_BASE: 'http://exemplo.com' }, { ...base, BUSINESSMAP_URL_BASE: 'não é url' },
      { ...base, BUSINESSMAP_URL_BASE: 'https://u:senha-secreta@exemplo.com' }, { ...base, BUSINESSMAP_LIMITE_POR_MINUTO: '26' },
      { ...base, BUSINESSMAP_QUADROS_IDS: '1;2' }, { ...base, BUSINESSMAP_PAGINA_TAMANHO: '0' }, { ...base, BUSINESSMAP_APIKEY: '' },
    ];
    for (const env of ruins) expect(() => carregarConfigBusinessMap(env)).toThrow(/^Configuração inválida \(variáveis: BUSINESSMAP_[A-Z_, ]+\)$/);
    expect(() => carregarConfigBusinessMap({ ...base, BUSINESSMAP_URL_BASE: 'https://u:senha-secreta@exemplo.com' })).not.toThrow(/senha-secreta/);
  });
});
